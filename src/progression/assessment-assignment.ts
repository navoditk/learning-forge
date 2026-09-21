import {
  AssessmentKind,
  Prisma,
  PrismaClient,
  ProgressionActivityKind,
  ProgressionTargetKind,
} from '@prisma/client';

import type { Ref } from '../contracts/progression';
import type { AccessPolicy, ActivityKind, ProgressionPolicyProfile } from '../contracts/policy';
import { prisma } from '../server/prisma';
import type { AssessmentStore, HeldOutAssessmentBank } from '../assessment/store';
import { createAssessmentStore } from '../assessment/store';
import { reassessmentEligibility, type ReassessmentRun } from './reassessment';
import { buildShadowDecision, persistShadowNonEnforcing } from './shadow';
import { expireAssessment } from './assessment-submission';
import { isTerminalAssessmentStatus } from './assessment-state';

export type AssessmentSelection = {
  id: string;
  version: string;
  hash: string;
  ordinal: number;
};

export class AssessmentAssignmentError extends Error {
  constructor(
    readonly code:
      | 'ASSESSMENT_BANK_INSUFFICIENT'
      | 'ACTIVE_ASSIGNMENT_EXISTS'
      | 'IDEMPOTENCY_KEY_CONFLICT'
      | 'MAX_REASSESSMENTS_REACHED'
      | 'REASSESSMENT_COOLDOWN',
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
  maxReassessments?: number;
  reassessmentCooldownHours?: number;
  shadow?: {
    requestKind: string;
    activityKind: ActivityKind;
    accessPolicy: AccessPolicy | undefined;
    policyProfile: ProgressionPolicyProfile;
    skillCodes: readonly string[];
    prerequisiteSkillCodes: Readonly<Record<string, readonly string[]>>;
  };
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
  persistShadow: (rows: readonly Prisma.ShadowDecisionCreateManyInput[]) => Promise<unknown> = (
    rows,
  ) => database.shadowDecision.createMany({ data: [...rows] }),
) {
  const bank = await store.getBank(input.bankRef);

  const result = await database.$transaction(
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

      const now = new Date();
      const activeLease = await transaction.activeAssessmentLease.findFirst({
        where: {
          learnerProfileId: input.learnerProfileId,
          kind: input.kind,
          targetCode: input.targetRef.code,
          targetVersion: input.targetRef.version,
          releasedAt: null,
        },
        include: { assignment: { include: { runState: true, result: true } } },
      });
      if (activeLease) {
        const run = activeLease.assignment.runState;
        const leaseExpired = activeLease.expiresAt <= now || (run ? run.expiresAt <= now : false);
        if (!leaseExpired) {
          throw new AssessmentAssignmentError(
            'ACTIVE_ASSIGNMENT_EXISTS',
            'An assessment run is already active for this target.',
          );
        }
        if (run && !isTerminalAssessmentStatus(run.status) && !activeLease.assignment.result) {
          await expireAssessment(
            transaction,
            activeLease.assignment.id,
            run.id,
            activeLease.id,
            now,
          );
        } else {
          await transaction.activeAssessmentLease.update({
            where: { id: activeLease.id },
            data: { releasedAt: now },
          });
        }
      }

      const previousAssignments = await transaction.assessmentAssignment.findMany({
        where: {
          learnerProfileId: input.learnerProfileId,
          kind: input.kind,
          targetKind: input.targetKind,
          targetCode: input.targetRef.code,
          targetVersion: input.targetRef.version,
        },
        select: { selectedItems: true, result: { select: { outcome: true, scoredAt: true } } },
      });
      const priorRuns: ReassessmentRun[] = previousAssignments.flatMap((previous) => {
        if (!previous.result) return [];
        const selectedItemKeys = Array.isArray(previous.selectedItems)
          ? previous.selectedItems.flatMap((value) => {
              if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
              const object = value as Prisma.JsonObject;
              return typeof object.id === 'string' && typeof object.version === 'string'
                ? [`${object.id}@${object.version}`]
                : [];
            })
          : [];
        return [{ ...previous.result, selectedItemKeys }];
      });
      const eligibility =
        input.maxReassessments !== undefined && input.reassessmentCooldownHours !== undefined
          ? reassessmentEligibility({
              priorRuns,
              now: new Date(),
              maxReassessments: input.maxReassessments,
              cooldownHours: input.reassessmentCooldownHours,
            })
          : { eligible: true as const, excludedItemKeys: new Set<string>() };
      if (!eligibility.eligible) {
        throw new AssessmentAssignmentError(
          eligibility.reasonCode,
          eligibility.reasonCode === 'REASSESSMENT_COOLDOWN'
            ? 'A reassessment cooldown is still active.'
            : 'The maximum number of reassessments has been reached.',
        );
      }
      const selectedItems = selectAssessmentItems(
        bank,
        input.itemsPerAttempt,
        eligibility.excludedItemKeys,
        input.requiredSkillCodes,
      );
      const selectedKeys = new Set(selectedItems.map((item) => `${item.id}@${item.version}`));
      const excludedItems = bank.items
        .filter((item) => !selectedKeys.has(`${item.id}@${item.version}`))
        .map((item) => ({
          id: item.id,
          version: item.version,
          reason: eligibility.excludedItemKeys.has(`${item.id}@${item.version}`)
            ? 'FAILED_RUN'
            : 'NOT_SELECTED',
        }));

      const attemptOrdinal =
        previousAssignments.filter(
          (previous) => previous.result?.outcome === 'PASS' || previous.result?.outcome === 'FAIL',
        ).length + 1;
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
              policyProfileCode: input.policyProfileRef.code,
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

  if (!result.replayed && input.shadow) {
    await persistShadowNonEnforcing(async () => {
      const shadow = input.shadow!;
      const prerequisiteCodes = [
        ...new Set(
          shadow.skillCodes.flatMap((skillCode) => shadow.prerequisiteSkillCodes[skillCode] ?? []),
        ),
      ];
      const priorMastery = await database.masteryEstimate.findMany({
        where: {
          learnerProfileId: input.learnerProfileId,
          algorithmVersion: input.algorithmVersion,
          skillCode: { in: prerequisiteCodes },
          estimate: { gte: shadow.policyProfile.minEstimateGate },
        },
        select: { skillCode: true },
      });
      const masteredSkillCodes = new Set(priorMastery.map((record) => record.skillCode));
      const shadowRows = shadow.skillCodes.map((skillCode) => ({
        householdId: input.householdId,
        learnerProfileId: input.learnerProfileId,
        ...buildShadowDecision({
          requestKind: shadow.requestKind,
          targetCode: input.targetRef.code,
          targetVersion: input.targetRef.version,
          skillCode,
          activityKind: shadow.activityKind,
          prerequisiteSkillCodes: shadow.prerequisiteSkillCodes[skillCode] ?? [],
          masteredSkillCodes,
          accessPolicy: shadow.accessPolicy,
          policyProfile: shadow.policyProfile,
          actualBehavior: 'ALLOWED',
          algorithmVersion: input.algorithmVersion,
        }),
      }));
      if (shadowRows.length > 0) await persistShadow(shadowRows);
    });
  }
  return { assignment: result.assignment, replayed: result.replayed };
}
