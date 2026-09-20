import {
  AssessmentOutcome,
  LessonCompletionStatus,
  Prisma,
  RemediationStatus,
  UnitCompletionStatus,
} from '@prisma/client';

import { PILOT_LESSONS, PILOT_UNITS } from '../curriculum/pilot-catalog';

export function lessonStatusAfterAssessment(input: {
  current: LessonCompletionStatus | undefined;
  outcome: AssessmentOutcome;
  firstRun: boolean;
  hadPriorWork: boolean;
}): { completionStatus: LessonCompletionStatus; remediationStatus: RemediationStatus } {
  const historicallyComplete = input.current === 'COMPLETE' || input.current === 'COMPLETE_BY_SKIP';
  if (input.outcome === 'PASS') {
    return {
      completionStatus: historicallyComplete
        ? input.current!
        : input.firstRun && !input.hadPriorWork
          ? 'COMPLETE_BY_SKIP'
          : 'COMPLETE',
      remediationStatus: 'NONE',
    };
  }
  return {
    completionStatus: historicallyComplete ? input.current! : 'IN_PROGRESS',
    remediationStatus: input.outcome === 'FAIL' ? 'ACTIVE' : 'NONE',
  };
}

export function unitStatusAfterLessonUpdate(
  statuses: readonly LessonCompletionStatus[],
): UnitCompletionStatus {
  return statuses.length > 0 &&
    statuses.every((status) => ['COMPLETE', 'COMPLETE_BY_SKIP'].includes(status))
    ? 'ASSESSMENT_PENDING'
    : 'IN_PROGRESS';
}

export async function applyPilotLessonAssessmentOutcome(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    lessonCode: string;
    lessonVersion: string;
    policyProfileVersion: string;
    outcome: AssessmentOutcome;
    firstRun: boolean;
    now: Date;
  },
): Promise<void> {
  const lesson = PILOT_LESSONS.find(
    (candidate) => candidate.code === input.lessonCode && candidate.version === input.lessonVersion,
  );
  if (!lesson) return;
  const current = await transaction.learnerLessonState.findUnique({
    where: {
      learnerProfileId_lessonCode_lessonVersion: {
        learnerProfileId: input.learnerProfileId,
        lessonCode: input.lessonCode,
        lessonVersion: input.lessonVersion,
      },
    },
  });
  const practiceContentIds = lesson.practiceContentRefs.map((ref) => ref.id);
  const priorWork =
    (await transaction.attempt.count({
      where: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        contentKey: { in: practiceContentIds },
      },
    })) > 0;
  const next = lessonStatusAfterAssessment({
    current: current?.completionStatus,
    outcome: input.outcome,
    firstRun: input.firstRun,
    hadPriorWork: priorWork,
  });
  await transaction.learnerLessonState.upsert({
    where: {
      learnerProfileId_lessonCode_lessonVersion: {
        learnerProfileId: input.learnerProfileId,
        lessonCode: input.lessonCode,
        lessonVersion: input.lessonVersion,
      },
    },
    update: {
      completionStatus: next.completionStatus,
      remediationStatus: next.remediationStatus,
      policyProfileVersion: input.policyProfileVersion,
      assessmentPassedAt: input.outcome === 'PASS' ? input.now : current?.assessmentPassedAt,
    },
    create: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      lessonCode: input.lessonCode,
      lessonVersion: input.lessonVersion,
      completionStatus: next.completionStatus,
      remediationStatus: next.remediationStatus,
      policyProfileVersion: input.policyProfileVersion,
      assessmentPassedAt: input.outcome === 'PASS' ? input.now : null,
    },
  });

  const unit = PILOT_UNITS.find((candidate) =>
    candidate.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
  );
  if (!unit) return;
  const lessonStates = await transaction.learnerLessonState.findMany({
    where: {
      learnerProfileId: input.learnerProfileId,
      lessonCode: { in: unit.lessonRefs.map((ref) => ref.code) },
    },
    select: { completionStatus: true },
  });
  const unitStatus = unitStatusAfterLessonUpdate(
    lessonStates.map((state) => state.completionStatus),
  );
  await transaction.learnerUnitState.upsert({
    where: {
      learnerProfileId_unitCode_unitVersion: {
        learnerProfileId: input.learnerProfileId,
        unitCode: unit.code,
        unitVersion: unit.version,
      },
    },
    update: { completionStatus: unitStatus, policyProfileVersion: input.policyProfileVersion },
    create: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      unitCode: unit.code,
      unitVersion: unit.version,
      completionStatus: unitStatus,
      overrideStatus: 'NONE',
      policyProfileVersion: input.policyProfileVersion,
      enteredAt: input.now,
    },
  });
}
