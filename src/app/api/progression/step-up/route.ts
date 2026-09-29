import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { issueStepUpToken, verifyStepUpPassword } from '../../../../auth/step-up';
import { programsByCode } from '../../../../curriculum/program-registry';
import { resolvePinnedPolicyProfile } from '../../../../progression/artifacts';
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
    if (!verified) {
      return NextResponse.json(
        { error: 'Password could not be verified', reasonCode: 'STEP_UP_FAILED' },
        { status: 403 },
      );
    }
    const program = programsByCode.get('grade-6-math');
    if (!program) throw new Error('Pilot program is unavailable');
    const profile = resolvePinnedPolicyProfile(program.defaultPolicyProfileRef);
    const stepUpToken = issueStepUpToken(
      { userId: identity.actorUserId, householdId: identity.householdId, issuedAt: new Date() },
      process.env.AUTH_SECRET,
    );
    return NextResponse.json({
      stepUpToken,
      expiresInMinutes: profile.stepUpReauthLifetimeMinutes,
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
