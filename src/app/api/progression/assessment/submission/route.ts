import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getCurrentAssessmentItem,
  submitAssessmentItem,
  AssessmentSubmissionError,
} from '../../../../../progression/assessment-submission';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { isProgressionReleaseGateOpen } from '../../../../../progression/release-gates';
import { AssessmentStoreUnavailableError } from '../../../../../assessment/store';
import { projectAssessmentSubmissionResponse } from '../../../../../progression/assessment-response';

const RequestSchema = z
  .object({
    assignmentId: z.string().uuid(),
    sessionId: z.string().uuid(),
    ordinal: z.number().int().positive(),
    learnerResponse: z.string().trim().min(1).max(1000),
  })
  .strict();

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
      { error: 'Invalid assessment submission', reasonCode: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(
      projectAssessmentSubmissionResponse(
        await submitAssessmentItem({ ...identity, ...parsed.data }),
      ),
    );
  } catch (error) {
    if (error instanceof AssessmentStoreUnavailableError) {
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status: 503 });
    }
    if (error instanceof AssessmentSubmissionError) {
      const status = error.code === 'ASSESSMENT_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status });
    }
    return NextResponse.json(
      { error: 'Assessment submission failed', reasonCode: 'ASSESSMENT_SUBMISSION_FAILED' },
      { status: 409 },
    );
  }
}

export async function GET(request: NextRequest) {
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
  const assignmentId = request.nextUrl.searchParams.get('assignmentId');
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!assignmentId || !sessionId) {
    return NextResponse.json(
      { error: 'Invalid current-item request', reasonCode: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(
      await getCurrentAssessmentItem({ ...identity, assignmentId, sessionId }),
    );
  } catch (error) {
    if (error instanceof AssessmentStoreUnavailableError) {
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status: 503 });
    }
    if (error instanceof AssessmentSubmissionError) {
      const status = error.code === 'ASSESSMENT_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status });
    }
    return NextResponse.json(
      { error: 'Assessment item unavailable', reasonCode: 'ASSESSMENT_ITEM_FAILED' },
      { status: 409 },
    );
  }
}
