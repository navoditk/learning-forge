import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAssessmentAssignment } from '../../../../../progression/assessment-assignment';
import { loadPolicyArtifacts } from '../../../../../progression/artifacts';
import { policyHash, resolvePolicyProfile } from '../../../../../progression/policy';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../../../../curriculum/pilot-catalog';
import { programsByCode } from '../../../../../curriculum/program-registry';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { isProgressionReleaseGateOpen } from '../../../../../progression/release-gates';
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
    const target =
      body.targetKind === 'LESSON'
        ? PILOT_LESSONS.find(
            (lesson) => lesson.code === body.targetCode && lesson.version === body.targetVersion,
          )
        : body.targetKind === 'UNIT'
          ? PILOT_UNITS.find(
              (unit) => unit.code === body.targetCode && unit.version === body.targetVersion,
            )
          : undefined;
    if (!target) {
      return NextResponse.json(
        { error: 'Unknown pilot assessment target', reasonCode: 'VERSION_MISMATCH' },
        { status: 409 },
      );
    }
    const bankRef = target.assessmentBankRef;
    if (!bankRef) {
      return NextResponse.json(
        { error: 'Assessment bank is not configured', reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
        { status: 503 },
      );
    }
    const bank = PILOT_ASSESSMENT_BANKS.find(
      (candidate) => candidate.code === bankRef.code && candidate.version === bankRef.version,
    );
    if (!bank) throw new Error('Assessment bank metadata is unavailable');
    const artifacts = loadPolicyArtifacts();
    const profileRecord = artifacts.profiles.find(
      (profile) =>
        profile.code === program.defaultPolicyProfileRef.code &&
        profile.version === program.defaultPolicyProfileRef.version,
    );
    if (!profileRecord) throw new Error('Policy profile is unavailable');
    const profile = resolvePolicyProfile(
      profileRecord,
      new Map(
        artifacts.profiles.map((candidate) => [
          `${candidate.code}@${candidate.version}`,
          candidate,
        ]),
      ),
    );
    const required = requiredCount(body.kind, profile);
    if (required === undefined) {
      return NextResponse.json(
        { error: 'Placement scoring is not wired yet', reasonCode: 'PLACEMENT_NOT_IMPLEMENTED' },
        { status: 409 },
      );
    }
    const assignment = await createAssessmentAssignment(
      {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        kind: body.kind,
        targetKind: body.targetKind,
        targetRef: { code: target.code, version: target.version },
        bankRef,
        policyProfileRef: program.defaultPolicyProfileRef,
        policyProfileHash: policyHash(profile),
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: bank.contentHash,
        itemsPerAttempt: itemsPerAttempt(body.kind, profile),
        requiredCount: required,
        expiresAt: new Date(Date.now() + profile.runExpiryHours * 60 * 60 * 1000),
        idempotencyKey: body.idempotencyKey,
      },
      createAssessmentStore(),
    );
    return NextResponse.json(assignment, { status: assignment.replayed ? 200 : 201 });
  } catch (error) {
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
