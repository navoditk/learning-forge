import {
  AssessmentOutcome,
  LessonCompletionStatus,
  Prisma,
  RemediationStatus,
  UnitCompletionStatus,
} from '@prisma/client';

import { PILOT_LESSONS, PILOT_UNITS } from '../curriculum/pilot-catalog';
import { advanceReviewSchedule } from './review-schedule';
import { lessonStatusAfterPlacement, placementLessonIndex } from './placement';

export function lessonStatusAfterAssessment(input: {
  current: LessonCompletionStatus | undefined;
  currentRemediation?: RemediationStatus;
  outcome: AssessmentOutcome;
  firstRun: boolean;
  hadPriorWork: boolean;
}): { completionStatus: LessonCompletionStatus; remediationStatus: RemediationStatus } {
  const historicallyComplete = input.current === 'COMPLETE' || input.current === 'COMPLETE_BY_SKIP';
  // D-69: NEEDS_HELP is terminal until a human override; outcomes never clear it.
  const keepNeedsHelp = (status: RemediationStatus): RemediationStatus =>
    input.currentRemediation === 'NEEDS_HELP' ? 'NEEDS_HELP' : status;
  if (input.outcome === 'PASS') {
    return {
      completionStatus: historicallyComplete
        ? input.current!
        : input.firstRun && !input.hadPriorWork
          ? 'COMPLETE_BY_SKIP'
          : 'COMPLETE',
      remediationStatus: keepNeedsHelp('NONE'),
    };
  }
  return {
    completionStatus: historicallyComplete ? input.current! : 'IN_PROGRESS',
    remediationStatus: keepNeedsHelp(input.outcome === 'FAIL' ? 'ACTIVE' : 'NONE'),
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
    remediationStatus: input.remediationStatus === 'NEEDS_HELP' ? 'NEEDS_HELP' : 'ACTIVE',
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

type SkillOutcomeInput = {
  householdId: string;
  learnerProfileId: string;
  skillRef: { code: string; version: string };
  algorithmVersion: string;
  policyProfileCode: string;
  policyProfileVersion: string;
  spacingIntervalDays: readonly number[];
  now: Date;
};

function firstReviewDueAt(now: Date, spacingIntervalDays: readonly number[]): Date {
  const firstInterval = spacingIntervalDays[0];
  if (firstInterval === undefined) throw new Error('REVIEW_INTERVALS_REQUIRED');
  return new Date(now.getTime() + firstInterval * 86_400_000);
}

/**
 * A passed delayed check confirms the skill (§9.2) and starts spaced review
 * at the first approved interval (D-18). A failed one lapses the skill and
 * routes to remediation exactly as a failed review does.
 */
export async function applyDelayedCheckOutcome(
  transaction: Prisma.TransactionClient,
  input: SkillOutcomeInput & { outcome: AssessmentOutcome },
): Promise<void> {
  if (input.outcome !== 'PASS') {
    await applyReviewLapse(transaction, { ...input, skillRefs: [input.skillRef] });
    return;
  }
  await transaction.masteryEstimate.updateMany({
    where: {
      learnerProfileId: input.learnerProfileId,
      skillCode: input.skillRef.code,
      algorithmVersion: input.algorithmVersion,
    },
    data: { independentDelayedCheck: true },
  });
  const schedule = {
    dueAt: firstReviewDueAt(input.now, input.spacingIntervalDays),
    intervalIndex: 0,
    lastOutcome: 'CONFIRMED',
    policyProfileCode: input.policyProfileCode,
    policyProfileVersion: input.policyProfileVersion,
    scheduleVersion: `${input.policyProfileCode}@${input.policyProfileVersion}`,
  };
  // Eligibility admits a delayed check only before first confirmation or after
  // a lapse, so this either creates the schedule or restarts a lapsed one.
  await transaction.reviewSchedule.upsert({
    where: {
      learnerProfileId_skillCode_skillVersion: {
        learnerProfileId: input.learnerProfileId,
        skillCode: input.skillRef.code,
        skillVersion: input.skillRef.version,
      },
    },
    create: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      skillCode: input.skillRef.code,
      skillVersion: input.skillRef.version,
      ...schedule,
    },
    update: schedule,
  });
  // The passing delayed check is the reassessment that clears lapse
  // remediation (§6.8). Remediation on a lesson that is not yet complete comes
  // from its own lesson assessment and is left for that reassessment.
  for (const lesson of PILOT_LESSONS.filter((candidate) =>
    candidate.skillRefs.some(
      (skill) => skill.code === input.skillRef.code && skill.version === input.skillRef.version,
    ),
  )) {
    await transaction.learnerLessonState.updateMany({
      where: {
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        remediationStatus: 'ACTIVE',
        completionStatus: { in: ['COMPLETE', 'COMPLETE_BY_SKIP'] },
      },
      data: {
        remediationStatus: 'NONE',
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
      },
    });
  }
}

/** A passed review advances the schedule one approved interval (D-18). */
export async function applyReviewPass(
  transaction: Prisma.TransactionClient,
  input: SkillOutcomeInput,
): Promise<void> {
  const schedule = await transaction.reviewSchedule.findUnique({
    where: {
      learnerProfileId_skillCode_skillVersion: {
        learnerProfileId: input.learnerProfileId,
        skillCode: input.skillRef.code,
        skillVersion: input.skillRef.version,
      },
    },
  });
  if (!schedule) throw new Error('REVIEW_SCHEDULE_MISSING');
  const next = advanceReviewSchedule(schedule, input.now, input.spacingIntervalDays);
  await transaction.reviewSchedule.update({
    where: { id: schedule.id },
    data: {
      dueAt: next.dueAt,
      intervalIndex: next.intervalIndex,
      lastOutcome: next.lastOutcome,
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
    },
  });
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
    currentRemediation: current?.remediationStatus,
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

  if (completionStatus !== 'COMPLETE_BY_SKIP' || current.completionStatus === 'COMPLETE_BY_SKIP') {
    return;
  }

  const evidenceRefs = {
    assessmentRunId: input.assessmentRunId,
    outcome: input.outcome,
  };
  for (const lessonRef of unit.lessonRefs) {
    const lesson = PILOT_LESSONS.find(
      (candidate) => candidate.code === lessonRef.code && candidate.version === lessonRef.version,
    );
    if (!lesson) continue;
    const key = {
      learnerProfileId_lessonCode_lessonVersion: {
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
      },
    };
    const existing = await transaction.learnerLessonState.findUnique({ where: key });
    await transaction.learnerLessonState.upsert({
      where: key,
      update: {
        completionStatus: 'COMPLETE_BY_SKIP',
        // D-69: a unit skip never clears the terminal NEEDS_HELP state.
        remediationStatus: existing?.remediationStatus === 'NEEDS_HELP' ? 'NEEDS_HELP' : 'NONE',
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

/**
 * D-69: records the parent-visible NEEDS_HELP state on every lesson claiming
 * the skill. A missing lesson row means NOT_STARTED, so the terminal state is
 * still recorded.
 */
export async function markSkillNeedsHelp(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    skillRef: { code: string; version: string };
    policyProfileCode: string;
    policyProfileVersion: string;
  },
): Promise<void> {
  const needsHelp = {
    remediationStatus: 'NEEDS_HELP' as const,
    policyProfileCode: input.policyProfileCode,
    policyProfileVersion: input.policyProfileVersion,
  };
  for (const lesson of PILOT_LESSONS.filter((candidate) =>
    candidate.skillRefs.some(
      (skill) => skill.code === input.skillRef.code && skill.version === input.skillRef.version,
    ),
  )) {
    await transaction.learnerLessonState.upsert({
      where: {
        learnerProfileId_lessonCode_lessonVersion: {
          learnerProfileId: input.learnerProfileId,
          lessonCode: lesson.code,
          lessonVersion: lesson.version,
        },
      },
      create: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        completionStatus: 'NOT_STARTED',
        ...needsHelp,
      },
      update: needsHelp,
    });
  }
}

export type NeedsHelpOverrideResult =
  | { applied: true; overrideId: string }
  | {
      applied: false;
      reasonCode:
        'OVERRIDE_REASON_REQUIRED' | 'REAUTH_EXPIRED' | 'REAUTH_ALREADY_USED' | 'NOT_NEEDS_HELP';
    };

/**
 * D-70: a parent or operator override moves a NEEDS_HELP skill's lessons back
 * to ACTIVE remediation and restarts the consecutive-failure count from the
 * override (read by the stranding predicate and reassessment limits). It
 * requires a D-06 step-up re-authentication within the D-47 lifetime, used at
 * most once, and writes an OverrideRecord. It does not create delayed-check
 * items: without unseen items the skill is refused NEW_BANK_VERSION_REQUIRED.
 */
export async function applyNeedsHelpOverride(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    skillRef: { code: string; version: string };
    actorUserId: string;
    actorRole: 'PARENT' | 'OPERATOR';
    reason: string;
    reauthAt: Date;
    stepUpReauthLifetimeMinutes: number;
    policyProfileCode: string;
    policyProfileVersion: string;
    now: Date;
  },
): Promise<NeedsHelpOverrideResult> {
  const reason = input.reason.trim();
  if (!reason) return { applied: false, reasonCode: 'OVERRIDE_REASON_REQUIRED' };
  const age = input.now.getTime() - input.reauthAt.getTime();
  if (age < 0 || age > input.stepUpReauthLifetimeMinutes * 60_000) {
    return { applied: false, reasonCode: 'REAUTH_EXPIRED' };
  }
  const reused = await transaction.overrideRecord.count({
    where: { actorUserId: input.actorUserId, reauthAt: input.reauthAt },
  });
  if (reused > 0) return { applied: false, reasonCode: 'REAUTH_ALREADY_USED' };
  const lessons = PILOT_LESSONS.filter((candidate) =>
    candidate.skillRefs.some(
      (skill) => skill.code === input.skillRef.code && skill.version === input.skillRef.version,
    ),
  );
  const needsHelp = await transaction.learnerLessonState.count({
    where: {
      learnerProfileId: input.learnerProfileId,
      remediationStatus: 'NEEDS_HELP',
      OR: lessons.map((lesson) => ({ lessonCode: lesson.code, lessonVersion: lesson.version })),
    },
  });
  if (needsHelp === 0) return { applied: false, reasonCode: 'NOT_NEEDS_HELP' };
  const record = await transaction.overrideRecord.create({
    data: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      targetKind: 'SKILL',
      targetCode: input.skillRef.code,
      targetVersion: input.skillRef.version,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      reason,
      reauthAt: input.reauthAt,
      createdAt: input.now,
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
    },
  });
  await transaction.learnerLessonState.updateMany({
    where: {
      learnerProfileId: input.learnerProfileId,
      remediationStatus: 'NEEDS_HELP',
      OR: lessons.map((lesson) => ({ lessonCode: lesson.code, lessonVersion: lesson.version })),
    },
    data: {
      remediationStatus: 'ACTIVE',
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
    },
  });
  return { applied: true, overrideId: record.id };
}

/**
 * Applies a scored placement probe (§9.3, D-68). It records a
 * `LearnerPlacement` and moves only not-started lessons; it never writes
 * mastery or delayed-check status, so placement alone cannot reach HIGH.
 */
export async function applyPlacementOutcome(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    unitCode: string;
    unitVersion: string;
    itemResults: readonly { skillCode?: string; correctness: string }[];
    assignmentId: string;
    assessmentRunId: string;
    policyProfileCode: string;
    policyProfileVersion: string;
  },
): Promise<{ lessonCode: string; lessonVersion: string } | undefined> {
  const unit = PILOT_UNITS.find(
    (candidate) => candidate.code === input.unitCode && candidate.version === input.unitVersion,
  );
  if (!unit) return undefined;
  const lessons = unit.lessonRefs.flatMap((ref) =>
    PILOT_LESSONS.filter((lesson) => lesson.code === ref.code && lesson.version === ref.version),
  );
  if (lessons.length === 0) return undefined;
  const placedIndex = placementLessonIndex(
    lessons.map((lesson) => lesson.skillRefs.map((ref) => ref.code)),
    input.itemResults.map((result) => ({
      skillCode: result.skillCode,
      correct: result.correctness === 'CORRECT',
    })),
  );
  const placed = lessons[placedIndex]!;
  for (const [index, lesson] of lessons.entries()) {
    const key = {
      learnerProfileId_lessonCode_lessonVersion: {
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
      },
    };
    const current = await transaction.learnerLessonState.findUnique({ where: key });
    const next = lessonStatusAfterPlacement(
      current?.completionStatus,
      index < placedIndex ? 'BEFORE' : index === placedIndex ? 'AT' : 'AFTER',
    );
    if (!next) continue;
    await transaction.learnerLessonState.upsert({
      where: key,
      create: {
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        completionStatus: next,
        remediationStatus: 'NONE',
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
      },
      update: {
        completionStatus: next,
        policyProfileCode: input.policyProfileCode,
        policyProfileVersion: input.policyProfileVersion,
      },
    });
  }
  await transaction.learnerPlacement.create({
    data: {
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
      programCode: unit.programRef.code,
      programVersion: unit.programRef.version,
      unitCode: unit.code,
      unitVersion: unit.version,
      lessonCode: placed.code,
      lessonVersion: placed.version,
      method: 'PLACEMENT_PROBE',
      policyProfileCode: input.policyProfileCode,
      policyProfileVersion: input.policyProfileVersion,
      evidenceRefs: {
        assignmentId: input.assignmentId,
        assessmentRunId: input.assessmentRunId,
        itemResults: input.itemResults.map(({ skillCode, correctness }) => ({
          skillCode: skillCode ?? null,
          correctness,
        })),
      },
    },
  });
  return { lessonCode: placed.code, lessonVersion: placed.version };
}
