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

/** A lapsed review changes current remediation, never historical completion. */
export function lessonStateAfterReviewLapse(input: {
  completionStatus: LessonCompletionStatus;
  remediationStatus: RemediationStatus;
}): { completionStatus: LessonCompletionStatus; remediationStatus: RemediationStatus } {
  return {
    completionStatus:
      input.completionStatus === 'SKIPPED_BY_PLACEMENT' ? 'AVAILABLE' : input.completionStatus,
    remediationStatus: 'ACTIVE',
  };
}

/** Applies a failed review only to the exact skill/version that was tested. */
export async function applyReviewLapse(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    skillRefs: readonly { code: string; version: string }[];
    algorithmVersion: string;
    policyProfileCode: string;
    policyProfileVersion: string;
    now: Date;
  },
): Promise<void> {
  for (const skillRef of input.skillRefs) {
    const schedule = await transaction.reviewSchedule.findUnique({
      where: {
        learnerProfileId_skillCode_skillVersion: {
          learnerProfileId: input.learnerProfileId,
          skillCode: skillRef.code,
          skillVersion: skillRef.version,
        },
      },
    });
    if (schedule) {
      await transaction.reviewSchedule.update({
        where: { id: schedule.id },
        data: { dueAt: input.now, lastOutcome: 'LAPSED' },
      });
    }

    await transaction.masteryEstimate.updateMany({
      where: {
        learnerProfileId: input.learnerProfileId,
        skillCode: skillRef.code,
        algorithmVersion: input.algorithmVersion,
        independentDelayedCheck: true,
      },
      data: { independentDelayedCheck: false },
    });

    for (const lesson of PILOT_LESSONS.filter((candidate) =>
      candidate.skillRefs.some(
        (candidateSkill) =>
          candidateSkill.code === skillRef.code && candidateSkill.version === skillRef.version,
      ),
    )) {
      const state = await transaction.learnerLessonState.findUnique({
        where: {
          learnerProfileId_lessonCode_lessonVersion: {
            learnerProfileId: input.learnerProfileId,
            lessonCode: lesson.code,
            lessonVersion: lesson.version,
          },
        },
      });
      if (!state) continue;
      const next = lessonStateAfterReviewLapse(state);
      await transaction.learnerLessonState.update({
        where: { id: state.id },
        data: {
          completionStatus: next.completionStatus,
          remediationStatus: next.remediationStatus,
          policyProfileCode: input.policyProfileCode,
          policyProfileVersion: input.policyProfileVersion,
        },
      });
    }
  }
}

export function unitStatusAfterLessonUpdate(
  statuses: readonly LessonCompletionStatus[],
  current?: UnitCompletionStatus,
): UnitCompletionStatus {
  if (current === 'COMPLETE' || current === 'COMPLETE_BY_SKIP') return current;
  return statuses.length > 0 &&
    statuses.every((status) => ['COMPLETE', 'COMPLETE_BY_SKIP'].includes(status))
    ? 'ASSESSMENT_PENDING'
    : 'IN_PROGRESS';
}

export function unitStatusAfterAssessment(input: {
  current: UnitCompletionStatus;
  outcome: AssessmentOutcome;
  hadPriorLessonWork: boolean;
  firstRun?: boolean;
}): UnitCompletionStatus {
  if (input.outcome === 'PASS') {
    if (input.current === 'COMPLETE' || input.current === 'COMPLETE_BY_SKIP') {
      return input.current;
    }
    return input.firstRun !== false && !input.hadPriorLessonWork ? 'COMPLETE_BY_SKIP' : 'COMPLETE';
  }
  if (input.outcome === 'FAIL' && input.current === 'ASSESSMENT_PENDING') {
    return 'IN_PROGRESS';
  }
  return input.current;
}

export async function applyPilotLessonAssessmentOutcome(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    lessonCode: string;
    lessonVersion: string;
    policyProfileCode: string;
    policyProfileVersion: string;
    outcome: AssessmentOutcome;
    firstRun: boolean;
    assessmentRunId: string;
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
  const [priorPracticeAttempts, priorTeachingOrPracticeEvents] = await Promise.all([
    transaction.attempt.count({
      where: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        contentKey: { in: practiceContentIds },
      },
    }),
    transaction.learningEvent.count({
      where: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        skillCode: { in: lesson.skillRefs.map((ref) => ref.code) },
        kind: { in: ['TEACHING_VIEWED', 'TEACHING_COMPLETED', 'INDEPENDENT_PRACTICE_EXPOSURE'] },
      },
    }),
  ]);
  const priorWork = priorPracticeAttempts > 0 || priorTeachingOrPracticeEvents > 0;
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
      policyProfileCode: input.policyProfileCode,
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
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
      assessmentPassedAt: input.outcome === 'PASS' ? input.now : null,
    },
  });
  if (
    next.completionStatus === 'COMPLETE_BY_SKIP' &&
    current?.completionStatus !== 'COMPLETE_BY_SKIP'
  ) {
    await transaction.skipRecord.create({
      data: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        targetKind: 'LESSON',
        targetCode: lesson.code,
        targetVersion: lesson.version,
        runId: input.assessmentRunId,
        method: 'LESSON_ASSESSMENT',
        evidenceRefs: { assessmentRunId: input.assessmentRunId, outcome: input.outcome },
        requirementVersion: input.policyProfileVersion,
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
      },
    });
  }

  const unit = PILOT_UNITS.find((candidate) =>
    candidate.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
  );
  if (!unit) return;
  const currentUnit = await transaction.learnerUnitState.findUnique({
    where: {
      learnerProfileId_unitCode_unitVersion: {
        learnerProfileId: input.learnerProfileId,
        unitCode: unit.code,
        unitVersion: unit.version,
      },
    },
    select: { completionStatus: true },
  });
  const lessonStates = await transaction.learnerLessonState.findMany({
    where: {
      learnerProfileId: input.learnerProfileId,
      lessonCode: { in: unit.lessonRefs.map((ref) => ref.code) },
    },
    select: { lessonCode: true, lessonVersion: true, completionStatus: true },
  });
  const stateByLesson = new Map(
    lessonStates.map((state) => [`${state.lessonCode}@${state.lessonVersion}`, state]),
  );
  const unitStatus = unitStatusAfterLessonUpdate(
    unit.lessonRefs.map(
      (lessonRef) =>
        stateByLesson.get(`${lessonRef.code}@${lessonRef.version}`)?.completionStatus ??
        'NOT_STARTED',
    ),
    currentUnit?.completionStatus,
  );
  await transaction.learnerUnitState.upsert({
    where: {
      learnerProfileId_unitCode_unitVersion: {
        learnerProfileId: input.learnerProfileId,
        unitCode: unit.code,
        unitVersion: unit.version,
      },
    },
    update: {
      completionStatus: unitStatus,
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
    },
    create: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      unitCode: unit.code,
      unitVersion: unit.version,
      completionStatus: unitStatus,
      overrideStatus: 'NONE',
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
      enteredAt: input.now,
    },
  });
}

export async function applyPilotUnitAssessmentOutcome(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    unitCode: string;
    unitVersion: string;
    assessmentRunId: string;
    firstRun: boolean;
    policyProfileCode: string;
    policyProfileVersion: string;
    outcome: AssessmentOutcome;
    now: Date;
  },
): Promise<void> {
  const unit = PILOT_UNITS.find(
    (candidate) => candidate.code === input.unitCode && candidate.version === input.unitVersion,
  );
  if (!unit) return;

  const current = await transaction.learnerUnitState.findUnique({
    where: {
      learnerProfileId_unitCode_unitVersion: {
        learnerProfileId: input.learnerProfileId,
        unitCode: input.unitCode,
        unitVersion: input.unitVersion,
      },
    },
  });
  if (!current) return;

  const practiceContentIds = PILOT_LESSONS.filter((lesson) =>
    unit.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
  ).flatMap((lesson) => lesson.practiceContentRefs.map((ref) => ref.id));
  const unitSkillCodes = PILOT_LESSONS.filter((lesson) =>
    unit.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
  ).flatMap((lesson) => lesson.skillRefs.map((ref) => ref.code));
  const [priorPracticeAttempts, priorTeachingOrPracticeEvents] = await Promise.all([
    transaction.attempt.count({
      where: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        contentKey: { in: practiceContentIds },
      },
    }),
    transaction.learningEvent.count({
      where: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        skillCode: { in: unitSkillCodes },
        kind: { in: ['TEACHING_VIEWED', 'TEACHING_COMPLETED', 'INDEPENDENT_PRACTICE_EXPOSURE'] },
      },
    }),
  ]);
  const hadPriorLessonWork = priorPracticeAttempts > 0 || priorTeachingOrPracticeEvents > 0;
  const completionStatus = unitStatusAfterAssessment({
    current: current.completionStatus,
    outcome: input.outcome,
    hadPriorLessonWork,
    firstRun: input.firstRun,
  });

  await transaction.learnerUnitState.update({
    where: { id: current.id },
    data: {
      completionStatus,
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
      completedAt:
        completionStatus === 'COMPLETE' || completionStatus === 'COMPLETE_BY_SKIP'
          ? (current.completedAt ?? input.now)
          : current.completedAt,
    },
  });

  if (completionStatus !== 'COMPLETE_BY_SKIP') return;

  const evidenceRefs = {
    assessmentRunId: input.assessmentRunId,
    outcome: input.outcome,
  };
  for (const lessonRef of unit.lessonRefs) {
    const lesson = PILOT_LESSONS.find(
      (candidate) => candidate.code === lessonRef.code && candidate.version === lessonRef.version,
    );
    if (!lesson) continue;
    await transaction.learnerLessonState.upsert({
      where: {
        learnerProfileId_lessonCode_lessonVersion: {
          learnerProfileId: input.learnerProfileId,
          lessonCode: lesson.code,
          lessonVersion: lesson.version,
        },
      },
      update: {
        completionStatus: 'COMPLETE_BY_SKIP',
        remediationStatus: 'NONE',
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
        assessmentPassedAt: input.now,
      },
      create: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        completionStatus: 'COMPLETE_BY_SKIP',
        remediationStatus: 'NONE',
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
        assessmentPassedAt: input.now,
      },
    });
    await transaction.skipRecord.create({
      data: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        targetKind: 'LESSON',
        targetCode: lesson.code,
        targetVersion: lesson.version,
        runId: input.assessmentRunId,
        method: 'UNIT_ASSESSMENT',
        evidenceRefs,
        requirementVersion: input.policyProfileVersion,
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
      },
    });
  }
  await transaction.skipRecord.create({
    data: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      targetKind: 'UNIT',
      targetCode: unit.code,
      targetVersion: unit.version,
      runId: input.assessmentRunId,
      method: 'UNIT_ASSESSMENT',
      evidenceRefs,
      requirementVersion: input.policyProfileVersion,
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
    },
  });
}
