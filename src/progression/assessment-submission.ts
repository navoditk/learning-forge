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
import { applyPilotLessonAssessmentOutcome } from './learner-state';

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
      | 'ASSESSMENT_EXPIRED',
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

function score(item: AssessmentContentItem, response: string): Correctness {
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

export type SubmitAssessmentItemInput = {
  householdId: string;
  learnerProfileId: string;
  assignmentId: string;
  sessionId: string;
  ordinal: number;
  learnerResponse: string;
};

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
        throw new AssessmentSubmissionError(
          'ASSESSMENT_EXPIRED',
          'The assessment run has expired.',
        );
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
          maxAssistance: 'INDEPENDENT',
          superseded: false,
        };
      });
      const correctCount = itemResults.filter((result) => result.correctness === 'CORRECT').length;
      const required = requiredCount(assignment.requiredCount);
      const outcome = correctCount >= required ? 'PASS' : 'FAIL';
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
      if (assignment.kind === 'LESSON_ASSESSMENT') {
        await applyPilotLessonAssessmentOutcome(transaction, {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          lessonCode: assignment.targetCode,
          lessonVersion: assignment.targetVersion,
          policyProfileVersion: assignment.policyProfileVersion,
          outcome,
          firstRun: assignment.attemptOrdinal === 1,
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
        assignmentId: assignment.id,
        sessionId: session.id,
        attemptId: attempt.id,
        status: updatedRun.status,
        result,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

async function expireAssessment(
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
    },
  });
  if (!assignment)
    throw new AssessmentSubmissionError('ASSESSMENT_NOT_FOUND', 'Assessment assignment not found.');
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
      itemResults: [],
      correctCount: 0,
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
}
