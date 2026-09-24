import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  AssessmentAssignmentError,
  assessmentKindMatchesTarget,
  createAssessmentAssignment,
  settleAssessmentLease,
} from '../../../../../progression/assessment-assignment';
import { recordStrandedSkill } from '../../../../../progression/assessment-submission';
import {
  loadPolicyArtifacts,
  resolvePinnedPolicyProfile,
} from '../../../../../progression/artifacts';
import { policyHash } from '../../../../../progression/policy';
import {
  pilotSkillRef,
  reassessmentLimitsFor,
  skillAssessmentBank,
  skillAssessmentEligibility,
} from '../../../../../progression/skill-assessment';
import type { ProgressionPolicyProfile } from '../../../../../contracts/policy';
import type { AssessmentBank } from '../../../../../contracts/progression';
import { prisma } from '../../../../../server/prisma';
import { skillsByCode } from '../../../../../curriculum/catalog';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../../../../curriculum/pilot-catalog';
import { programsByCode } from '../../../../../curriculum/program-registry';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { isProgressionReleaseGateOpen } from '../../../../../progression/release-gates';
import { projectAssessmentAssignmentResponse } from '../../../../../progression/assessment-response';
import {
  AssessmentStoreUnavailableError,
  createAssessmentStore,
} from '../../../../../assessment/store';

const RequestSchema = z
  .object({
    kind: z.nativeEnum(AssessmentKind),
    targetKind: z.nativeEnum(ProgressionTargetKind),
    targetCode: z.string().regex(/^[a-z0-9-]+$/),
    targetVersion: z.string().min(1),
    idempotencyKey: z.string().trim().min(8).max(200),
  })
  .strict();

function itemsPerAttempt(
  kind: AssessmentKind,
  profile: {
    lessonItemsPerAttempt: number;
    unitItemsPerAttempt: number;
    delayedCheckItemsPerAttempt: number;
    reviewItemsPerAttempt: number;
    placementProbeMaxItems: number;
  },
): number {
  switch (kind) {
    case 'PLACEMENT':
      return profile.placementProbeMaxItems;
    case 'LESSON_ASSESSMENT':
      return profile.lessonItemsPerAttempt;
    case 'UNIT_ASSESSMENT':
      return profile.unitItemsPerAttempt;
    case 'DELAYED_CHECK':
      return profile.delayedCheckItemsPerAttempt;
    case 'REVIEW':
      return profile.reviewItemsPerAttempt;
  }
}

function requiredCount(
  kind: AssessmentKind,
  profile: {
    lessonPassBar: { correct: number };
    unitPassBar: { correct: number };
    delayedCheckPassBar: { correct: number };
    reviewPassBar: { correct: number };
  },
): number | undefined {
  switch (kind) {
    case 'LESSON_ASSESSMENT':
      return profile.lessonPassBar.correct;
    case 'UNIT_ASSESSMENT':
      return profile.unitPassBar.correct;
    case 'DELAYED_CHECK':
      return profile.delayedCheckPassBar.correct;
    case 'REVIEW':
      return profile.reviewPassBar.correct;
    case 'PLACEMENT':
      return undefined;
  }
}

type AssessmentPlan = {
  targetRef: { code: string; version: string };
  bank: AssessmentBank;
  skillCodes: string[];
  previouslySeenItemKeys?: ReadonlySet<string>;
};

function conflict(error: string, reasonCode: string, status = 409) {
  return { response: NextResponse.json({ error, reasonCode }, { status }) };
}

function lessonSkillCodes(lessonRefs: readonly { code: string; version: string }[]): string[] {
  return [
    ...new Set(
      PILOT_LESSONS.filter((lesson) =>
        lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
      ).flatMap((lesson) => lesson.skillRefs.map((skill) => skill.code)),
    ),
  ];
}

/**
 * Resolves the pilot target, its authored bank metadata, and any server-side
 * eligibility for the requested kind. Every unresolved case is a refusal.
 */
async function resolvePlan(
  body: z.infer<typeof RequestSchema>,
  identity: { householdId: string; learnerProfileId: string },
  profile: ProgressionPolicyProfile,
  policyProfileRef: { code: string; version: string },
): Promise<AssessmentPlan | { response: NextResponse }> {
  const { householdId, learnerProfileId } = identity;
  if (body.targetKind === 'SKILL') {
    const kind = body.kind === 'DELAYED_CHECK' ? 'DELAYED_CHECK' : 'REVIEW';
    const skillRef = pilotSkillRef(body.targetCode, body.targetVersion);
    if (!skillRef) return conflict('Unknown pilot assessment target', 'VERSION_MISMATCH');
    const bank = skillAssessmentBank(kind, skillRef);
    if (!bank) {
      return conflict('Assessment bank is not configured', 'ASSESSMENT_STORE_UNAVAILABLE', 503);
    }
    // D-54: a retried request replays its assignment even after the run has
    // changed eligibility; createAssessmentAssignment rejects a mismatch.
    const replay = await prisma.assessmentAssignment.findUnique({
      where: {
        learnerProfileId_idempotencyKey: { learnerProfileId, idempotencyKey: body.idempotencyKey },
      },
      select: { id: true },
    });
    if (replay) return { targetRef: skillRef, bank, skillCodes: [skillRef.code] };
    const now = new Date();
    const lease = await settleAssessmentLease(prisma, {
      learnerProfileId,
      kind,
      targetRef: skillRef,
      now,
    });
    if (lease.active) {
      return conflict('An assessment run is already active', 'ACTIVE_ASSIGNMENT_EXISTS');
    }
    const eligibility = await skillAssessmentEligibility(prisma, {
      learnerProfileId,
      kind,
      skillRef,
      profile,
      now,
    });
    if (!eligibility.eligible) {
      if (eligibility.reasonCode === 'NEEDS_HELP') {
        // D-69: a terminal refusal always has a record.
        await prisma.$transaction((transaction) =>
          recordStrandedSkill(transaction, {
            householdId,
            learnerProfileId,
            policyProfileCode: policyProfileRef.code,
            policyProfileVersion: policyProfileRef.version,
            skillRef,
          }),
        );
      }
      return conflict('The assessment is not available yet', eligibility.reasonCode);
    }
    return {
      targetRef: skillRef,
      bank,
      skillCodes: [skillRef.code],
      previouslySeenItemKeys: eligibility.excludedItemKeys,
    };
  }
  const lesson =
    body.targetKind === 'LESSON'
      ? PILOT_LESSONS.find(
          (candidate) =>
            candidate.code === body.targetCode && candidate.version === body.targetVersion,
        )
      : undefined;
  const unit =
    body.targetKind === 'UNIT'
      ? PILOT_UNITS.find(
          (candidate) =>
            candidate.code === body.targetCode && candidate.version === body.targetVersion,
        )
      : undefined;
  const target = lesson ?? unit;
  if (!target) return conflict('Unknown pilot assessment target', 'VERSION_MISMATCH');
  const bankRef = target.assessmentBankRef;
  if (!bankRef) {
    return conflict('Assessment bank is not configured', 'ASSESSMENT_STORE_UNAVAILABLE', 503);
  }
  const bank = PILOT_ASSESSMENT_BANKS.find(
    (candidate) => candidate.code === bankRef.code && candidate.version === bankRef.version,
  );
  if (!bank) throw new Error('Assessment bank metadata is unavailable');
  return {
    targetRef: { code: target.code, version: target.version },
    bank,
    skillCodes: lesson
      ? [...new Set(lesson.skillRefs.map((skill) => skill.code))]
      : lessonSkillCodes(unit?.lessonRefs ?? []),
  };
}

export async function POST(request: NextRequest) {
  if (!isProgressionReleaseGateOpen()) {
    return NextResponse.json(
      { error: 'Course progression release gate is closed', reasonCode: 'RELEASE_GATE_CLOSED' },
      { status: 404 },
    );
  }
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized', reasonCode: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }

  try {
    const body = RequestSchema.parse(await request.json());
    const program = programsByCode.get('grade-6-math');
    if (!program) throw new Error('Pilot program is unavailable');
    if (!assessmentKindMatchesTarget(body.kind, body.targetKind)) {
      return NextResponse.json(
        { error: 'Assessment kind does not match target kind', reasonCode: 'KIND_TARGET_MISMATCH' },
        { status: 409 },
      );
    }
    const artifacts = loadPolicyArtifacts();
    const profile = resolvePinnedPolicyProfile(program.defaultPolicyProfileRef);
    const accessPolicy = artifacts.accessPolicies.find(
      (candidate) =>
        candidate.code === program.accessPolicyRef.code &&
        candidate.version === program.accessPolicyRef.version,
    );
    const required = requiredCount(body.kind, profile);
    if (required === undefined) {
      return NextResponse.json(
        { error: 'Placement scoring is not wired yet', reasonCode: 'PLACEMENT_NOT_IMPLEMENTED' },
        { status: 409 },
      );
    }
    const plan = await resolvePlan(body, identity, profile, program.defaultPolicyProfileRef);
    if ('response' in plan) return plan.response;
    const assignment = await createAssessmentAssignment(
      {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        actorUserId: identity.actorUserId,
        actorRole: identity.actorRole,
        kind: body.kind,
        targetKind: body.targetKind,
        targetRef: plan.targetRef,
        bankRef: { code: plan.bank.code, version: plan.bank.version },
        policyProfileRef: program.defaultPolicyProfileRef,
        policyProfileHash: policyHash(profile),
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: plan.bank.contentHash,
        itemsPerAttempt: itemsPerAttempt(body.kind, profile),
        requiredCount: required,
        requiredSkillCodes: plan.skillCodes,
        previouslySeenItemKeys: plan.previouslySeenItemKeys,
        authoredBankItemCount: plan.bank.itemCount,
        authoredBankSkillCodes: plan.bank.coveredSkillRefs.map((skill) => skill.code),
        ...reassessmentLimitsFor(body.kind, profile),
        shadow: {
          requestKind: 'assessment-assignment',
          activityKind: body.kind,
          accessPolicy,
          policyProfile: profile,
          skillCodes: plan.skillCodes,
          prerequisiteSkillCodes: Object.fromEntries(
            plan.skillCodes.map((skillCode) => [
              skillCode,
              skillsByCode.get(skillCode)?.prerequisiteSkillCodes ?? [],
            ]),
          ),
        },
        expiresAt: new Date(Date.now() + profile.runExpiryHours * 60 * 60 * 1000),
        idempotencyKey: body.idempotencyKey,
      },
      createAssessmentStore(),
    );
    return NextResponse.json(projectAssessmentAssignmentResponse(assignment), {
      status: assignment.replayed ? 200 : 201,
    });
  } catch (error) {
    if (error instanceof AssessmentAssignmentError) {
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status: 409 });
    }
    if (error instanceof AssessmentStoreUnavailableError) {
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status: 503 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assessment request', reasonCode: 'INVALID_REQUEST' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error: 'Assessment assignment could not be created',
        reasonCode: 'ASSESSMENT_ASSIGNMENT_FAILED',
      },
      { status: 409 },
    );
  }
}
