import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyStepUpToken } from '../../../../auth/step-up';
import { programsByCode } from '../../../../curriculum/program-registry';
import { resolvePinnedPolicyProfile } from '../../../../progression/artifacts';
import { applyNeedsHelpOverride } from '../../../../progression/learner-state';
import { isProgressionReleaseGateOpen } from '../../../../progression/release-gates';
import { pilotSkillRef } from '../../../../progression/skill-assessment';
import { requireHouseholdContext } from '../../../../server/household-context';
import { prisma } from '../../../../server/prisma';
import { isUniqueConstraintViolation } from '../../../../server/prisma-errors';

const RequestSchema = z
  .object({
    skillCode: z.string().regex(/^[a-z0-9-]+$/),
    skillVersion: z.string().min(1),
    reason: z.string().max(500),
    stepUpToken: z.string().min(1).max(1000),
  })
  .strict();

const REFUSAL_STATUS: Record<string, number> = {
  ACTOR_NOT_AUTHORIZED: 403,
  OVERRIDE_REASON_REQUIRED: 400,
  REAUTH_EXPIRED: 403,
  REAUTH_ALREADY_USED: 409,
  NOT_NEEDS_HELP: 409,
};

/**
 * D-70: a parent override returns a NEEDS_HELP pilot skill to ACTIVE
 * remediation. The actor comes from the session, the step-up token must be
 * valid for that actor and household, and the D-47 lifetime comes from the
 * pinned policy profile. Each step-up authorizes at most one override.
 */
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
  const actorUserId = identity.actorUserId;
  if (!actorUserId || identity.actorRole !== 'PARENT') {
    return NextResponse.json(
      { error: 'Unauthorized', reasonCode: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }
  try {
    const body = RequestSchema.parse(await request.json());
    const reauthAt = verifyStepUpToken(body.stepUpToken, process.env.AUTH_SECRET, {
      userId: actorUserId,
      householdId: identity.householdId,
    });
    if (!reauthAt) {
      return NextResponse.json(
        { error: 'Step-up is required', reasonCode: 'STEP_UP_REQUIRED' },
        { status: 403 },
      );
    }
    const skillRef = pilotSkillRef(body.skillCode, body.skillVersion);
    if (!skillRef) {
      return NextResponse.json(
        { error: 'Unknown pilot skill', reasonCode: 'VERSION_MISMATCH' },
        { status: 409 },
      );
    }
    const program = programsByCode.get('grade-6-math');
    if (!program) throw new Error('Pilot program is unavailable');
    const profileRef = program.defaultPolicyProfileRef;
    const profile = resolvePinnedPolicyProfile(profileRef);
    const result = await prisma.$transaction(
      (transaction) =>
        applyNeedsHelpOverride(transaction, {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillRef,
          actorUserId,
          actorRole: 'PARENT',
          reason: body.reason,
          reauthAt,
          stepUpReauthLifetimeMinutes: profile.stepUpReauthLifetimeMinutes,
          policyProfileCode: profileRef.code,
          policyProfileVersion: profileRef.version,
          now: new Date(),
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if (result.applied) {
      return NextResponse.json({ overrideId: result.overrideId }, { status: 201 });
    }
    return NextResponse.json(
      { error: 'Override was not applied', reasonCode: result.reasonCode },
      { status: REFUSAL_STATUS[result.reasonCode] ?? 409 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid override request', reasonCode: 'INVALID_REQUEST' },
        { status: 400 },
      );
    }
    // The unique index is the atomic single-use check for a concurrent reuse.
    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json(
        { error: 'Override was not applied', reasonCode: 'REAUTH_ALREADY_USED' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Override could not be applied', reasonCode: 'OVERRIDE_FAILED' },
      { status: 409 },
    );
  }
}
