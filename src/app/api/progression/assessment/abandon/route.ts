import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  abandonAssessmentRun,
  AssessmentSubmissionError,
} from '../../../../../progression/assessment-submission';
import { isProgressionReleaseGateOpen } from '../../../../../progression/release-gates';
import { requireHouseholdContext } from '../../../../../server/household-context';

const RequestSchema = z.object({ assignmentId: z.string().uuid() }).strict();

export async function POST(request: Request) {
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
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid abandonment request', reasonCode: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(await abandonAssessmentRun({ ...identity, ...parsed.data }));
  } catch (error) {
    if (error instanceof AssessmentSubmissionError) {
      const status = error.code === 'ASSESSMENT_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status });
    }
    return NextResponse.json(
      { error: 'Assessment abandonment failed', reasonCode: 'ASSESSMENT_ABANDON_FAILED' },
      { status: 409 },
    );
  }
}
