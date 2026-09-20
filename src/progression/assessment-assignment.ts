import {
  AssessmentKind,
  Prisma,
  PrismaClient,
  ProgressionActivityKind,
  ProgressionTargetKind,
} from '@prisma/client';

import type { Ref } from '../contracts/progression';
import { prisma } from '../server/prisma';
import type { AssessmentStore, HeldOutAssessmentBank } from '../assessment/store';
import { createAssessmentStore } from '../assessment/store';

export type AssessmentSelection = {
  id: string;
  version: string;
  hash: string;
  ordinal: number;
};

export class AssessmentAssignmentError extends Error {
  constructor(
    readonly code:
      'ASSESSMENT_BANK_INSUFFICIENT' | 'ACTIVE_ASSIGNMENT_EXISTS' | 'IDEMPOTENCY_KEY_CONFLICT',
    message: string,
  ) {
    super(message);
  }
}

export function selectAssessmentItems(
  bank: HeldOutAssessmentBank,
  itemsPerAttempt: number,
  excludedItemKeys: ReadonlySet<string> = new Set(),
  requiredSkillCodes: readonly string[] = [],
): AssessmentSelection[] {
  const candidates = bank.items.filter(
    (item) => !excludedItemKeys.has(`${item.id}@${item.version}`),
  );
  if (candidates.length < itemsPerAttempt) {
    throw new AssessmentAssignmentError(
      'ASSESSMENT_BANK_INSUFFICIENT',
      `Assessment bank ${bank.code}@${bank.version} has ${candidates.length} eligible items; ${itemsPerAttempt} required.`,
    );
  }
  if (requiredSkillCodes.length > itemsPerAttempt) {
    throw new AssessmentAssignmentError(
      'ASSESSMENT_BANK_INSUFFICIENT',
      `Assessment requires ${requiredSkillCodes.length} skill-covering items; ${itemsPerAttempt} selected.`,
    );
  }
  const selected = requiredSkillCodes.map((skillCode) => {
    const item = candidates.find((candidate) => candidate.skillRef.code === skillCode);
    if (!item) {
      throw new AssessmentAssignmentError(
        'ASSESSMENT_BANK_INSUFFICIENT',
        `Assessment bank ${bank.code}@${bank.version} has no eligible item for skill ${skillCode}.`,
      );
    }
    return item;
  });
  const remaining = candidates.filter((candidate) => !selected.includes(candidate));
  selected.push(...remaining.slice(0, Math.max(itemsPerAttempt - selected.length, 0)));
  if (selected.length < itemsPerAttempt) {
    throw new AssessmentAssignmentError(
      'ASSESSMENT_BANK_INSUFFICIENT',
      `Assessment bank ${bank.code}@${bank.version} cannot cover ${itemsPerAttempt} items with the required skills.`,
    );
  }
  return selected.slice(0, itemsPerAttempt).map((item, index) => ({
    id: item.id,
    version: item.version,
    hash: item.hash,
    ordinal: index + 1,
  }));
}

export type CreateAssessmentAssignmentInput = {
  householdId: string;
  learnerProfileId: string;
  kind: AssessmentKind;
  targetKind: ProgressionTargetKind;
  targetRef: Ref;
  bankRef: Ref;
  policyProfileRef: Ref;
  policyProfileHash: string;
  algorithmVersion: string;
  curriculumSnapshotHash: string;
  itemsPerAttempt: number;
  requiredCount: number;
  requiredSkillCodes?: readonly string[];
  expiresAt: Date;
  idempotencyKey: string;
};

function sessionActivityKind(kind: AssessmentKind): ProgressionActivityKind {
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

export async function createAssessmentAssignment(
  input: CreateAssessmentAssignmentInput,
  store: AssessmentStore = createAssessmentStore(),
  database: PrismaClient = prisma,
) {
  const bank = await store.getBank(input.bankRef);
  const selectedItems = selectAssessmentItems(
    bank,
    input.itemsPerAttempt,
    new Set(),
    input.requiredSkillCodes,
  );
  const selectedKeys = new Set(selectedItems.map((item) => `${item.id}@${item.version}`));
  const excludedItems = bank.items
    .filter((item) => !selectedKeys.has(`${item.id}@${item.version}`))
    .map((item) => ({ id: item.id, version: item.version, reason: 'NOT_SELECTED' }));

  return database.$transaction(
    async (transaction) => {
      const replay = await transaction.assessmentAssignment.findUnique({
        where: {
          learnerProfileId_idempotencyKey: {
            learnerProfileId: input.learnerProfileId,
            idempotencyKey: input.idempotencyKey,
          },
        },
        include: { runState: true, lease: true, sessions: true },
      });
      if (replay) {
        const sameRequest =
          replay.householdId === input.householdId &&
          replay.kind === input.kind &&
          replay.targetKind === input.targetKind &&
          replay.targetCode === input.targetRef.code &&
          replay.targetVersion === input.targetRef.version &&
          replay.bankCode === input.bankRef.code &&
          replay.bankVersion === input.bankRef.version;
        if (!sameRequest) {
          throw new AssessmentAssignmentError(
            'IDEMPOTENCY_KEY_CONFLICT',
            'The idempotency key was already used for a different assessment request.',
          );
        }
        return { assignment: replay, replayed: true };
      }

      const activeLease = await transaction.activeAssessmentLease.findFirst({
        where: {
          learnerProfileId: input.learnerProfileId,
          kind: input.kind,
          targetCode: input.targetRef.code,
          targetVersion: input.targetRef.version,
          releasedAt: null,
        },
      });
      if (activeLease) {
        throw new AssessmentAssignmentError(
          'ACTIVE_ASSIGNMENT_EXISTS',
          'An assessment run is already active for this target.',
        );
      }

      const attemptOrdinal =
        (await transaction.assessmentAssignment.count({
          where: {
            learnerProfileId: input.learnerProfileId,
            kind: input.kind,
            targetCode: input.targetRef.code,
            targetVersion: input.targetRef.version,
          },
        })) + 1;
      const assignment = await transaction.assessmentAssignment.create({
        data: {
          householdId: input.householdId,
          learnerProfileId: input.learnerProfileId,
          kind: input.kind,
          targetKind: input.targetKind,
          targetCode: input.targetRef.code,
          targetVersion: input.targetRef.version,
          bankCode: input.bankRef.code,
          bankVersion: input.bankRef.version,
          policyProfileCode: input.policyProfileRef.code,
          policyProfileVersion: input.policyProfileRef.version,
          policyProfileHash: input.policyProfileHash,
          algorithmVersion: input.algorithmVersion,
          curriculumSnapshotHash: input.curriculumSnapshotHash,
          selectedItems,
          excludedItems,
          attemptOrdinal,
          requiredCount: input.requiredCount,
          idempotencyKey: input.idempotencyKey,
          runState: {
            create: {
              status: 'PENDING',
              currentOrdinal: 1,
              submittedOrdinals: [],
              expiresAt: input.expiresAt,
              lastActivityAt: new Date(),
            },
          },
          lease: {
            create: {
              householdId: input.householdId,
              learnerProfileId: input.learnerProfileId,
              kind: input.kind,
              targetCode: input.targetRef.code,
              targetVersion: input.targetRef.version,
              bankVersion: input.bankRef.version,
              acquiredAt: new Date(),
              expiresAt: input.expiresAt,
            },
          },
          sessions: {
            create: {
              householdId: input.householdId,
              learnerProfileId: input.learnerProfileId,
              contentKey: input.targetRef.code,
              activityKind: sessionActivityKind(input.kind),
              targetCode: input.targetRef.code,
              targetVersion: input.targetRef.version,
              policyProfileVersion: input.policyProfileRef.version,
            },
          },
        },
        include: { runState: true, lease: true, sessions: true },
      });
      return { assignment, replayed: false };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
