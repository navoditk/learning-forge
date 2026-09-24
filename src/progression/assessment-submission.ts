import {
  AssessmentKind,
  AttemptContext,
  Correctness,
  Prisma,
  PrismaClient,
  ProgressionActivityKind,
} from '@prisma/client';

import type { AssessmentContentItem } from '../contracts/progression';
import { createAssessmentStore, type AssessmentStore } from '../assessment/store';
import { prisma } from '../server/prisma';
import { isTerminalAssessmentStatus, transitionAssessmentRun } from './assessment-state';
import {
  applyDelayedCheckOutcome,
  applyPilotLessonAssessmentOutcome,
  applyPilotUnitAssessmentOutcome,
  applyReviewLapse,
  applyReviewPass,
  markSkillNeedsHelp,
} from './learner-state';
import { resolvePinnedPolicyProfile } from './artifacts';
import { isSkillStranded } from './skill-assessment';
import { assessmentPasses } from './assessment-scoring';
import { deriveHighestAssistance } from './assistance';
import { PILOT_LESSONS } from '../curriculum/pilot-catalog';

type SelectedItem = { id: string; version: string; hash: string; ordinal: number };

export class AssessmentSubmissionError extends Error {
  constructor(
    readonly code:
      | 'ASSESSMENT_NOT_FOUND'
      | 'RUN_NOT_ACTIVE'
      | 'SESSION_ENDED'
      | 'SESSION_KIND_MISMATCH'
      | 'DUPLICATE_ITEM_SUBMISSION'
      | 'VERSION_MISMATCH'
      | 'ASSESSMENT_EXPIRED'
      | 'INVALIDATION_NOT_ALLOWED',
    message: string,
  ) {
    super(message);
  }
}

function sessionKindForAssessment(kind: AssessmentKind): ProgressionActivityKind {
  return kind as ProgressionActivityKind;
}

function attemptContextForAssessment(kind: AssessmentKind): AttemptContext {
  switch (kind) {
    case 'PLACEMENT':
      return 'PLACEMENT';
    case 'LESSON_ASSESSMENT':
      return 'LESSON_ASSESSMENT';
    case 'UNIT_ASSESSMENT':
      return 'UNIT_ASSESSMENT';
    case 'DELAYED_CHECK':
      return 'DELAYED_CHECK';
    case 'REVIEW':
      return 'REVIEW';
  }
}

function normalize(answer: string): string {
  return answer.trim().toLocaleLowerCase().replace(/\s+/gu, ' ');
}

function score(
  item: Pick<AssessmentContentItem, 'deterministicValidator'>,
  response: string,
): Correctness {
  return item.deterministicValidator.acceptedAnswers.some(
    (accepted) => normalize(accepted) === normalize(response),
  )
    ? 'CORRECT'
    : 'INCORRECT';
}

function selectedItems(value: Prisma.JsonValue): SelectedItem[] {
  if (!Array.isArray(value)) throw new Error('Invalid selected assessment items');
  return value.map((candidate) => {
    const object =
      typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate)
        ? (candidate as Prisma.JsonObject)
        : undefined;
    if (
      !object ||
      typeof object.id !== 'string' ||
      typeof object.version !== 'string' ||
      typeof object.hash !== 'string' ||
      typeof object.ordinal !== 'number'
    ) {
      throw new Error('Invalid selected assessment item');
    }
    return {
      id: object.id,
      version: object.version,
      hash: object.hash,
      ordinal: object.ordinal,
    };
  });
}

function requiredCount(value: number | null): number {
  if (value === null || value < 0) throw new Error('Assessment required count is missing');
  return value;
}

/** D-69: records NEEDS_HELP when a lapse or failure leaves the skill stranded. */
export async function recordStrandedSkill(
  transaction: Prisma.TransactionClient,
  input: {
    householdId: string;
    learnerProfileId: string;
    policyProfileCode: string;
    policyProfileVersion: string;
    skillRef: { code: string; version: string };
  },
): Promise<void> {
  const profile = resolvePinnedPolicyProfile({
    code: input.policyProfileCode,
    version: input.policyProfileVersion,
  });
  if (await isSkillStranded(transaction, { ...input, profile })) {
    await markSkillNeedsHelp(transaction, input);
  }
}

/** Abandoned, expired, and invalidated delayed checks also consume items (D-69). */
async function recordStrandingAfterUnscoredRun(
  transaction: Prisma.TransactionClient,
  assignmentId: string,
): Promise<void> {
  const assignment = await transaction.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      kind: true,
      targetKind: true,
      targetCode: true,
      targetVersion: true,
      householdId: true,
      learnerProfileId: true,
      policyProfileCode: true,
      policyProfileVersion: true,
    },
  });
  if (assignment?.kind !== 'DELAYED_CHECK' || assignment.targetKind !== 'SKILL') return;
  await recordStrandedSkill(transaction, {
    ...assignment,
    skillRef: { code: assignment.targetCode, version: assignment.targetVersion },
  });
}

export type SubmitAssessmentItemInput = {
  householdId: string;
  learnerProfileId: string;
  assignmentId: string;
  sessionId: string;
  ordinal: number;
  learnerResponse: string;
};

export type CurrentAssessmentItemInput = {
  householdId: string;
  learnerProfileId: string;
  assignmentId: string;
  sessionId: string;
};

export async function getCurrentAssessmentItem(
  input: CurrentAssessmentItemInput,
  store: AssessmentStore = createAssessmentStore(),
  database: PrismaClient = prisma,
) {
  const assignment = await database.assessmentAssignment.findFirst({
    where: {
      id: input.assignmentId,
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
    },
    include: { runState: true, sessions: true },
  });
  if (!assignment || !assignment.runState) {
    throw new AssessmentSubmissionError('ASSESSMENT_NOT_FOUND', 'Assessment assignment not found.');
  }
  const session = assignment.sessions.find((candidate) => candidate.id === input.sessionId);
  if (!session) {
    throw new AssessmentSubmissionError('ASSESSMENT_NOT_FOUND', 'Assessment session not found.');
  }
  if (session.endedAt) {
    throw new AssessmentSubmissionError('SESSION_ENDED', 'The assessment session has ended.');
  }
  if (session.activityKind !== sessionKindForAssessment(assignment.kind)) {
    throw new AssessmentSubmissionError(
      'SESSION_KIND_MISMATCH',
      'Assessment session kind does not match.',
    );
  }
  if (isTerminalAssessmentStatus(assignment.runState.status)) {
    throw new AssessmentSubmissionError(
      'RUN_NOT_ACTIVE',
      'The assessment run is already terminal.',
    );
  }
  if (new Date() >= assignment.runState.expiresAt) {
    throw new AssessmentSubmissionError('ASSESSMENT_EXPIRED', 'The assessment run has expired.');
  }
  const submittedOrdinals = new Set(
    Array.isArray(assignment.runState.submittedOrdinals)
      ? assignment.runState.submittedOrdinals.filter(
          (value): value is number => typeof value === 'number',
        )
      : [],
  );
  const selected = selectedItems(assignment.selectedItems).find(
    (candidate) => !submittedOrdinals.has(candidate.ordinal),
  );
  if (!selected) {
    throw new AssessmentSubmissionError('VERSION_MISMATCH', 'Assessment item is not available.');
  }
  const bank = await store.getBank({ code: assignment.bankCode, version: assignment.bankVersion });
  const item = bank.items.find(
    (candidate) =>
      candidate.id === selected.id &&
      candidate.version === selected.version &&
      candidate.hash === selected.hash,
  );
  if (!item) {
    throw new AssessmentSubmissionError(
      'VERSION_MISMATCH',
      'Assessment item version does not match the assignment.',
    );
  }
  return {
    assignmentId: assignment.id,
    sessionId: session.id,
    ordinal: selected.ordinal,
    totalItems: selectedItems(assignment.selectedItems).length,
    item: {
      title: item.title,
      prompt: item.prompt,
      accessibilityNotes: item.accessibilityNotes,
      accessibleAlternative: item.accessibleAlternative,
      figure: item.figure,
    },
  };
}

export async function submitAssessmentItem(
  input: SubmitAssessmentItemInput,
  store: AssessmentStore = createAssessmentStore(),
  database: PrismaClient = prisma,
) {
  const assignmentSnapshot = await database.assessmentAssignment.findFirst({
    where: {
      id: input.assignmentId,
      householdId: input.householdId,
      learnerProfileId: input.learnerProfileId,
    },
    select: { bankCode: true, bankVersion: true, selectedItems: true },
  });
  if (!assignmentSnapshot) {
    throw new AssessmentSubmissionError('ASSESSMENT_NOT_FOUND', 'Assessment assignment not found.');
  }
  const bank = await store.getBank({
    code: assignmentSnapshot.bankCode,
    version: assignmentSnapshot.bankVersion,
  });
  const selected = selectedItems(assignmentSnapshot.selectedItems).find(
    (candidate) => candidate.ordinal === input.ordinal,
  );
  if (!selected) {
    throw new AssessmentSubmissionError(
      'VERSION_MISMATCH',
      'Assessment item is not part of this assignment.',
    );
  }
  const item = bank.items.find(
    (candidate) =>
      candidate.id === selected.id &&
      candidate.version === selected.version &&
      candidate.hash === selected.hash,
  );
  if (!item) {
    throw new AssessmentSubmissionError(
      'VERSION_MISMATCH',
      'Assessment item version does not match the assignment.',
    );
  }

  const submissionResult = await database.$transaction(
    async (transaction) => {
      const assignment = await transaction.assessmentAssignment.findFirst({
        where: {
          id: input.assignmentId,
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
        },
        include: { runState: true, lease: true, sessions: true },
      });
      if (!assignment || !assignment.runState) {
        throw new AssessmentSubmissionError(
          'ASSESSMENT_NOT_FOUND',
          'Assessment assignment not found.',
        );
      }
      const run = assignment.runState;
      const session = assignment.sessions.find((candidate) => candidate.id === input.sessionId);
      if (!session) {
        throw new AssessmentSubmissionError(
          'ASSESSMENT_NOT_FOUND',
          'Assessment session not found.',
        );
      }
      if (session.endedAt) {
        throw new AssessmentSubmissionError('SESSION_ENDED', 'The assessment session has ended.');
      }
      if (session.activityKind !== sessionKindForAssessment(assignment.kind)) {
        throw new AssessmentSubmissionError(
          'SESSION_KIND_MISMATCH',
          'Assessment session kind does not match.',
        );
      }
      if (isTerminalAssessmentStatus(run.status)) {
        throw new AssessmentSubmissionError(
          'RUN_NOT_ACTIVE',
          'The assessment run is already terminal.',
        );
      }
      const now = new Date();
      if (now >= run.expiresAt) {
        await expireAssessment(transaction, assignment.id, run.id, assignment.lease?.id, now);
        return { expired: true as const };
      }
      const submitted = Array.isArray(run.submittedOrdinals)
        ? run.submittedOrdinals.filter((value): value is number => typeof value === 'number')
        : [];
      if (submitted.includes(input.ordinal)) {
        throw new AssessmentSubmissionError(
          'DUPLICATE_ITEM_SUBMISSION',
          'This item was already submitted.',
        );
      }
      const nextStatus =
        run.status === 'PENDING' ? transitionAssessmentRun('PENDING', 'START') : run.status;
      const attempt = await transaction.attempt.create({
        data: {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          sessionId: session.id,
          contentKey: item.id,
          contentVersion: item.version,
          learnerResponse: input.learnerResponse,
          normalizedResponse: normalize(input.learnerResponse),
          correctness: score(item, input.learnerResponse),
          scoringMethod: 'DETERMINISTIC',
          attemptNumber:
            (await transaction.attempt.count({ where: { sessionId: session.id } })) + 1,
          elapsedSeconds: 0,
          highestAssistance: 'INDEPENDENT',
          context: attemptContextForAssessment(assignment.kind),
          policyVersion: assignment.policyProfileCode,
          assistanceEvents: { create: { level: 'INDEPENDENT', interactionType: 'QUESTION' } },
        },
      });
      const nextSubmitted = [...submitted, input.ordinal].sort((left, right) => left - right);
      const complete = nextSubmitted.length === selectedItems(assignment.selectedItems).length;
      if (!complete) {
        const updatedRun = await transaction.assessmentRunState.update({
          where: { id: run.id },
          data: {
            status: nextStatus,
            currentOrdinal: Math.max(...nextSubmitted) + 1,
            submittedOrdinals: nextSubmitted,
            startedAt: run.startedAt ?? now,
            lastActivityAt: now,
          },
        });
        return {
          expired: false as const,
          assignmentId: assignment.id,
          sessionId: session.id,
          attemptId: attempt.id,
          status: updatedRun.status,
        };
      }

      const attempts = await transaction.attempt.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: 'asc' },
        select: { id: true, contentKey: true, contentVersion: true, correctness: true },
      });
      const selectedForResult = selectedItems(assignment.selectedItems);
      const itemResults = selectedForResult.map((candidate) => {
        const recorded = attempts.find(
          (candidateAttempt) =>
            candidateAttempt.contentKey === candidate.id &&
            candidateAttempt.contentVersion === candidate.version,
        );
        return {
          ordinal: candidate.ordinal,
          contentId: candidate.id,
          contentVersion: candidate.version,
          attemptId: recorded?.id ?? attempt.id,
          correctness: recorded?.correctness ?? 'UNSCORED',
          skillCode: bank.items.find(
            (bankItem) => bankItem.id === candidate.id && bankItem.version === candidate.version,
          )?.skillRef.code,
          maxAssistance: 'INDEPENDENT',
          superseded: false,
        };
      });
      const correctCount = itemResults.filter((result) => result.correctness === 'CORRECT').length;
      const required = requiredCount(assignment.requiredCount);
      const lesson =
        assignment.kind === 'LESSON_ASSESSMENT'
          ? PILOT_LESSONS.find(
              (candidate) =>
                candidate.code === assignment.targetCode &&
                candidate.version === assignment.targetVersion,
            )
          : undefined;
      const outcome = assessmentPasses({
        kind: assignment.kind,
        items: itemResults,
        requiredCorrect: required,
        coveredSkillCodes: lesson?.skillRefs.map((skill) => skill.code) ?? [],
      })
        ? 'PASS'
        : 'FAIL';
      const updatedRun = await transaction.assessmentRunState.update({
        where: { id: run.id },
        data: {
          status: 'SCORED',
          currentOrdinal: nextSubmitted.length + 1,
          submittedOrdinals: nextSubmitted,
          startedAt: run.startedAt ?? now,
          submittedAt: now,
          lastActivityAt: now,
        },
      });
      const result = await transaction.assessmentResult.create({
        data: {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          assignmentId: assignment.id,
          outcome,
          itemResults,
          correctCount,
          requiredCount: required,
          algorithmVersion: assignment.algorithmVersion,
          policyProfileHash: assignment.policyProfileHash,
        },
      });
      if (assignment.kind === 'REVIEW' && outcome === 'FAIL') {
        const lapsedSkillRefs = itemResults.flatMap((itemResult) => {
          if (itemResult.correctness === 'CORRECT') return [];
          const bankItem = bank.items.find(
            (candidate) =>
              candidate.id === itemResult.contentId &&
              candidate.version === itemResult.contentVersion,
          );
          return bankItem ? [bankItem.skillRef] : [];
        });
        await applyReviewLapse(transaction, {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          skillRefs: lapsedSkillRefs,
          policyProfileCode: assignment.policyProfileCode,
          policyProfileVersion: assignment.policyProfileVersion,
          algorithmVersion: assignment.algorithmVersion,
          now,
        });
        for (const skillRef of lapsedSkillRefs) {
          await recordStrandedSkill(transaction, { ...assignment, skillRef });
        }
      }
      if (
        assignment.kind === 'DELAYED_CHECK' ||
        (assignment.kind === 'REVIEW' && outcome === 'PASS')
      ) {
        const profile = resolvePinnedPolicyProfile({
          code: assignment.policyProfileCode,
          version: assignment.policyProfileVersion,
        });
        const skillOutcome = {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          skillRef: { code: assignment.targetCode, version: assignment.targetVersion },
          algorithmVersion: assignment.algorithmVersion,
          policyProfileCode: assignment.policyProfileCode,
          policyProfileVersion: assignment.policyProfileVersion,
          spacingIntervalDays: profile.spacingIntervalDays,
          now,
        };
        if (assignment.kind === 'DELAYED_CHECK') {
          await applyDelayedCheckOutcome(transaction, { ...skillOutcome, outcome });
          if (outcome !== 'PASS') {
            await recordStrandedSkill(transaction, {
              ...assignment,
              skillRef: skillOutcome.skillRef,
            });
          }
        } else {
          await applyReviewPass(transaction, skillOutcome);
        }
      }
      if (assignment.kind === 'LESSON_ASSESSMENT') {
        await applyPilotLessonAssessmentOutcome(transaction, {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          lessonCode: assignment.targetCode,
          lessonVersion: assignment.targetVersion,
          assessmentRunId: run.id,
          policyProfileCode: assignment.policyProfileCode,
          policyProfileVersion: assignment.policyProfileVersion,
          outcome,
          firstRun: assignment.attemptOrdinal === 1,
          now,
        });
      }
      if (assignment.kind === 'UNIT_ASSESSMENT') {
        await applyPilotUnitAssessmentOutcome(transaction, {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          unitCode: assignment.targetCode,
          unitVersion: assignment.targetVersion,
          assessmentRunId: run.id,
          firstRun: assignment.attemptOrdinal === 1,
          policyProfileCode: assignment.policyProfileCode,
          policyProfileVersion: assignment.policyProfileVersion,
          outcome,
          now,
        });
      }
      if (assignment.lease) {
        await transaction.activeAssessmentLease.update({
          where: { id: assignment.lease.id },
          data: { releasedAt: now },
        });
      }
      return {
        expired: false as const,
        assignmentId: assignment.id,
        sessionId: session.id,
        attemptId: attempt.id,
        status: updatedRun.status,
        result,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
  if (submissionResult.expired) {
    throw new AssessmentSubmissionError('ASSESSMENT_EXPIRED', 'The assessment run has expired.');
  }
  return submissionResult;
}

export type AbandonAssessmentInput = {
  householdId: string;
  learnerProfileId: string;
  assignmentId: string;
};

/** Abandonment is terminal, auditable, and never silently drops submitted attempts. */
export async function abandonAssessmentRun(
  input: AbandonAssessmentInput,
  database: PrismaClient = prisma,
) {
  return database.$transaction(
    async (transaction) => {
      const assignment = await transaction.assessmentAssignment.findFirst({
        where: {
          id: input.assignmentId,
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
        },
        include: { runState: true, lease: true, sessions: true },
      });
      if (!assignment || !assignment.runState) {
        throw new AssessmentSubmissionError(
          'ASSESSMENT_NOT_FOUND',
          'Assessment assignment not found.',
        );
      }
      if (isTerminalAssessmentStatus(assignment.runState.status)) {
        throw new AssessmentSubmissionError(
          'RUN_NOT_ACTIVE',
          'The assessment run is already terminal.',
        );
      }
      const now = new Date();
      const sessionIds = assignment.sessions.map((session) => session.id);
      const attempts = await transaction.attempt.findMany({
        where: { sessionId: { in: sessionIds } },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          contentKey: true,
          contentVersion: true,
          correctness: true,
          assistanceEvents: { select: { level: true }, orderBy: { occurredAt: 'asc' } },
        },
      });
      const itemResults = attempts.map((attempt) => ({
        attemptId: attempt.id,
        contentId: attempt.contentKey,
        contentVersion: attempt.contentVersion,
        correctness: attempt.correctness,
        maxAssistance: deriveHighestAssistance(attempt.assistanceEvents),
        superseded: false,
      }));
      const result = await transaction.assessmentResult.create({
        data: {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          assignmentId: assignment.id,
          outcome: 'INCONCLUSIVE',
          itemResults,
          correctCount: attempts.filter((attempt) => attempt.correctness === 'CORRECT').length,
          requiredCount: requiredCount(assignment.requiredCount),
          algorithmVersion: assignment.algorithmVersion,
          policyProfileHash: assignment.policyProfileHash,
        },
      });
      const run = await transaction.assessmentRunState.update({
        where: { id: assignment.runState.id },
        data: {
          status: transitionAssessmentRun(assignment.runState.status, 'ABANDON'),
          submittedAt: now,
          lastActivityAt: now,
        },
      });
      if (assignment.lease) {
        await transaction.activeAssessmentLease.update({
          where: { id: assignment.lease.id },
          data: { releasedAt: now },
        });
      }
      if (sessionIds.length > 0) {
        await transaction.session.updateMany({
          where: { id: { in: sessionIds }, endedAt: null },
          data: { endedAt: now },
        });
      }
      await recordStrandingAfterUnscoredRun(transaction, assignment.id);
      return { assignmentId: assignment.id, status: run.status, result };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export type InvalidateAssessmentInput = {
  householdId: string;
  learnerProfileId: string;
  assignmentId: string;
  invalidationReason: string;
  invalidatedByUserId: string;
};

/**
 * Voids defective assessment evidence without mutating or deleting the
 * assignment/result history. This is an operator-facing service seam; the
 * caller must perform operator authorization before invoking it.
 */
export async function invalidateAssessmentRun(
  input: InvalidateAssessmentInput,
  database: PrismaClient = prisma,
) {
  const reason = input.invalidationReason.trim();
  if (!reason || !input.invalidatedByUserId.trim()) {
    throw new AssessmentSubmissionError(
      'INVALIDATION_NOT_ALLOWED',
      'An invalidation reason and acting user are required.',
    );
  }
  return database.$transaction(
    async (transaction) => {
      const assignment = await transaction.assessmentAssignment.findFirst({
        where: {
          id: input.assignmentId,
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
        },
        include: { runState: true, lease: true, sessions: true, result: true },
      });
      if (!assignment || !assignment.runState) {
        throw new AssessmentSubmissionError(
          'ASSESSMENT_NOT_FOUND',
          'Assessment assignment not found.',
        );
      }
      if (isTerminalAssessmentStatus(assignment.runState.status) || assignment.result) {
        throw new AssessmentSubmissionError(
          'RUN_NOT_ACTIVE',
          'The assessment run is already terminal.',
        );
      }
      const attempts = await transaction.attempt.findMany({
        where: { sessionId: { in: assignment.sessions.map((session) => session.id) } },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          contentKey: true,
          contentVersion: true,
          correctness: true,
          assistanceEvents: { select: { level: true }, orderBy: { occurredAt: 'asc' } },
        },
      });
      const result = await transaction.assessmentResult.create({
        data: {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          assignmentId: assignment.id,
          outcome: 'INVALIDATED',
          itemResults: attempts.map((attempt) => ({
            attemptId: attempt.id,
            contentId: attempt.contentKey,
            contentVersion: attempt.contentVersion,
            correctness: attempt.correctness,
            maxAssistance: deriveHighestAssistance(attempt.assistanceEvents),
            superseded: true,
          })),
          correctCount: 0,
          requiredCount: requiredCount(assignment.requiredCount),
          algorithmVersion: assignment.algorithmVersion,
          policyProfileHash: assignment.policyProfileHash,
          invalidationReason: reason,
          invalidatedByUserId: input.invalidatedByUserId.trim(),
        },
      });
      const run = await transaction.assessmentRunState.update({
        where: { id: assignment.runState.id },
        data: {
          status: transitionAssessmentRun(assignment.runState.status, 'INVALIDATE'),
          submittedAt: new Date(),
          lastActivityAt: new Date(),
        },
      });
      if (assignment.lease) {
        await transaction.activeAssessmentLease.update({
          where: { id: assignment.lease.id },
          data: { releasedAt: new Date() },
        });
      }
      await transaction.session.updateMany({
        where: { id: { in: assignment.sessions.map((session) => session.id) }, endedAt: null },
        data: { endedAt: new Date() },
      });
      await recordStrandingAfterUnscoredRun(transaction, assignment.id);
      return { assignmentId: assignment.id, status: run.status, result };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function expireAssessment(
  transaction: Prisma.TransactionClient,
  assignmentId: string,
  runId: string,
  leaseId: string | undefined,
  now: Date,
): Promise<void> {
  const assignment = await transaction.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      householdId: true,
      learnerProfileId: true,
      algorithmVersion: true,
      policyProfileHash: true,
      requiredCount: true,
      sessions: { select: { id: true } },
    },
  });
  if (!assignment)
    throw new AssessmentSubmissionError('ASSESSMENT_NOT_FOUND', 'Assessment assignment not found.');
  const attempts = await transaction.attempt.findMany({
    where: { sessionId: { in: assignment.sessions.map((session) => session.id) } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      contentKey: true,
      contentVersion: true,
      correctness: true,
      assistanceEvents: { select: { level: true }, orderBy: { occurredAt: 'asc' } },
    },
  });
  const itemResults = attempts.map((attempt) => ({
    attemptId: attempt.id,
    contentId: attempt.contentKey,
    contentVersion: attempt.contentVersion,
    correctness: attempt.correctness,
    maxAssistance: deriveHighestAssistance(attempt.assistanceEvents),
    superseded: false,
  }));
  await transaction.assessmentRunState.update({
    where: { id: runId },
    data: { status: 'EXPIRED', submittedAt: now, lastActivityAt: now },
  });
  await transaction.assessmentResult.create({
    data: {
      householdId: assignment.householdId,
      learnerProfileId: assignment.learnerProfileId,
      assignmentId,
      outcome: 'INCONCLUSIVE',
      itemResults,
      correctCount: attempts.filter((attempt) => attempt.correctness === 'CORRECT').length,
      requiredCount: requiredCount(assignment.requiredCount),
      algorithmVersion: assignment.algorithmVersion,
      policyProfileHash: assignment.policyProfileHash,
    },
  });
  if (leaseId)
    await transaction.activeAssessmentLease.update({
      where: { id: leaseId },
      data: { releasedAt: now },
    });
  await transaction.session.updateMany({
    where: { id: { in: assignment.sessions.map((session) => session.id) }, endedAt: null },
    data: { endedAt: now },
  });
  await recordStrandingAfterUnscoredRun(transaction, assignmentId);
}
