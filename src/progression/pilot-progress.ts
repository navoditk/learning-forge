import { prisma } from '../server/prisma';
import { PILOT_LESSONS, PILOT_UNITS } from '../curriculum/pilot-catalog';

export type PilotProgression = {
  program: { code: string; version: string; label: string };
  units: Array<{
    code: string;
    version: string;
    title: string;
    status: string;
    lessons: Array<{
      code: string;
      version: string;
      title: string;
      completionStatus: string;
      remediationStatus: string;
      latestAssessment?: { outcome: string; resultId: string; scoredAt: string };
    }>;
  }>;
};

export async function getPilotProgression(identity: {
  householdId: string;
  learnerProfileId: string;
}): Promise<PilotProgression> {
  const lessonCodes = PILOT_LESSONS.map((lesson) => lesson.code);
  const unitCodes = PILOT_UNITS.map((unit) => unit.code);
  const [lessonStates, unitStates, assignments] = await Promise.all([
    prisma.learnerLessonState.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        lessonCode: { in: lessonCodes },
      },
    }),
    prisma.learnerUnitState.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        unitCode: { in: unitCodes },
      },
    }),
    prisma.assessmentAssignment.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        targetCode: { in: lessonCodes },
        result: { isNot: null },
      },
      include: { result: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  const statesByLesson = new Map(
    lessonStates.map((state) => [`${state.lessonCode}@${state.lessonVersion}`, state]),
  );
  const statesByUnit = new Map(
    unitStates.map((state) => [`${state.unitCode}@${state.unitVersion}`, state]),
  );
  const latestResults = new Map<string, { outcome: string; resultId: string; scoredAt: string }>();
  for (const assignment of assignments) {
    if (
      !assignment.result ||
      latestResults.has(`${assignment.targetCode}@${assignment.targetVersion}`)
    )
      continue;
    latestResults.set(`${assignment.targetCode}@${assignment.targetVersion}`, {
      outcome: assignment.result.outcome,
      resultId: assignment.result.id,
      scoredAt: assignment.result.scoredAt.toISOString(),
    });
  }
  return {
    program: { code: 'grade-6-math', version: '1.0.0', label: 'Grade 6 Math' },
    units: PILOT_UNITS.map((unit) => ({
      code: unit.code,
      version: unit.version,
      title: unit.title,
      status: statesByUnit.get(`${unit.code}@${unit.version}`)?.completionStatus ?? 'NOT_STARTED',
      lessons: unit.lessonRefs.map((ref) => {
        const lesson = PILOT_LESSONS.find(
          (candidate) => candidate.code === ref.code && candidate.version === ref.version,
        );
        const state = statesByLesson.get(`${ref.code}@${ref.version}`);
        return {
          code: ref.code,
          version: ref.version,
          title: lesson?.title ?? ref.code,
          completionStatus: state?.completionStatus ?? 'NOT_STARTED',
          remediationStatus: state?.remediationStatus ?? 'NONE',
          latestAssessment: latestResults.get(`${ref.code}@${ref.version}`),
        };
      }),
    })),
  };
}
