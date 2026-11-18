import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { issueStepUpToken, verifyStepUpPassword } from '../../../../auth/step-up';
import { COURSE_CATALOG } from '../../../../curriculum/course-catalog';
import { resolvePinnedPolicyProfile } from '../../../../progression/artifacts';
import { stepUpAdvertisedLifetimeMinutes } from '../../../../progression/program-resolution';
import { isProgressionReleaseGateOpen } from '../../../../progression/release-gates';
import { requireHouseholdContext } from '../../../../server/household-context';
import { prisma } from '../../../../server/prisma';

const RequestSchema = z.object({ password: z.string().min(1).max(200) }).strict();

/** D-06: re-verifies the signed-in parent's password and issues a step-up token. */
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
  if (!identity.actorUserId) {
    return NextResponse.json(
      { error: 'Unauthorized', reasonCode: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }
  try {
    const body = RequestSchema.parse(await request.json());
    const verified = await verifyStepUpPassword(prisma, {
      userId: identity.actorUserId,
      householdId: identity.householdId,
      password: body.password,
    });
    if (verified === 'LOCKED') {
      return NextResponse.json(
        { error: 'Too many attempts; try again later', reasonCode: 'STEP_UP_LOCKED' },
        { status: 429 },
      );
    }
    if (verified !== 'OK') {
      return NextResponse.json(
        { error: 'Password could not be verified', reasonCode: 'STEP_UP_FAILED' },
        { status: 403 },
      );
    }
    // SPELL-SP5: household-level token; advertise the shortest active program lifetime.
    const expiresInMinutes = stepUpAdvertisedLifetimeMinutes(
      COURSE_CATALOG.programs,
      (ref) => resolvePinnedPolicyProfile(ref).stepUpReauthLifetimeMinutes,
    );
    const stepUpToken = issueStepUpToken(
      { userId: identity.actorUserId, householdId: identity.householdId, issuedAt: new Date() },
      process.env.AUTH_SECRET,
    );
    return NextResponse.json({
      stepUpToken,
      expiresInMinutes,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid step-up request', reasonCode: 'INVALID_REQUEST' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Step-up is unavailable', reasonCode: 'STEP_UP_UNAVAILABLE' },
      { status: 503 },
    );
  }
}
