import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getCurrentAssessmentItem,
  submitAssessmentItem,
  AssessmentSubmissionError,
  InvalidResponseError,
  invalidResponsePayload,
  PYTHON_RAW_RESPONSE_MAX,
  StructuredResponseRefusedError,
  structuredRefusalPayload,
  type SubmitAssessmentItemInput,
} from '../../../../../progression/assessment-submission';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { isProgressionReleaseGateOpen } from '../../../../../progression/release-gates';
import { AssessmentStoreUnavailableError } from '../../../../../assessment/store';
import { parseStructuredResponseRequest } from '../../../../../content/structured-response';
import { projectAssessmentSubmissionResponse } from '../../../../../progression/assessment-response';

const BaseRequestShape = {
  assignmentId: z.string().uuid(),
  sessionId: z.string().uuid(),
  ordinal: z.number().int().positive(),
};

const LegacyRequestSchema = z
  .object({ ...BaseRequestShape, learnerResponse: z.string().trim().min(1).max(1000) })
  .strict();

// `python_output` items only: the raw string under its own key, so the legacy
// `learnerResponse` contract above is unchanged.
const PythonRequestSchema = z
  .object({ ...BaseRequestShape, pythonResponse: z.string().max(PYTHON_RAW_RESPONSE_MAX) })
  .strict();

const StructuredRequestSchema = z
  .object({
    ...BaseRequestShape,
    structuredResponse: z
      .unknown()
      .refine((value) => parseStructuredResponseRequest(value) !== null),
  })
  .strict();

type SubmissionBody = Pick<SubmitAssessmentItemInput, 'assignmentId' | 'sessionId' | 'ordinal'> &
  (
    | { learnerResponse: string; structuredResponse?: undefined; pythonResponse?: undefined }
    | { structuredResponse: unknown; learnerResponse?: undefined; pythonResponse?: undefined }
    | { pythonResponse: string; learnerResponse?: undefined; structuredResponse?: undefined }
  );

/** Tier 1 (contract 3.1): exactly one of `learnerResponse` or `structuredResponse`, both strict. */
function parseSubmissionBody(body: unknown): SubmissionBody | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const hasLegacy = record.learnerResponse !== undefined;
  const hasStructured = record.structuredResponse !== undefined;
  if (!hasLegacy && !hasStructured && record.pythonResponse !== undefined) {
    const python = PythonRequestSchema.safeParse(body);
    return python.success ? python.data : null;
  }
  if (hasLegacy === hasStructured) return null;
  if (hasLegacy) {
    const parsed = LegacyRequestSchema.safeParse(body);
    return parsed.success ? parsed.data : null;
  }
  const parsed = StructuredRequestSchema.safeParse(body);
  return parsed.success
    ? { ...parsed.data, structuredResponse: parsed.data.structuredResponse }
    : null;
}

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
  const parsed = parseSubmissionBody(await request.json());
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid assessment submission', reasonCode: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(
      projectAssessmentSubmissionResponse(await submitAssessmentItem({ ...identity, ...parsed })),
    );
  } catch (error) {
    if (error instanceof AssessmentStoreUnavailableError) {
      return NextResponse.json({ error: error.message, reasonCode: error.code }, { status: 503 });
    }
    if (error instanceof StructuredResponseRefusedError) {
      const { status, body } = structuredRefusalPayload(error);
      return NextResponse.json(body, { status });
    }
    if (error instanceof InvalidResponseError) {
      const { status, body } = invalidResponsePayload(error);
      return NextResponse.json(body, { status });
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
