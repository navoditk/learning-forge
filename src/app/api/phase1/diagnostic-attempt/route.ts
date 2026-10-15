import { NextResponse } from 'next/server';

import { parsePhase1AttemptBody, recordDiagnosticAttempt } from '../../../../phase1/service';
import {
  StructuredResponseRefusedError,
  structuredRefusalPayload,
} from '../../../../progression/assessment-submission';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function POST(request: Request) {
  // Tier 1: exactly one of learnerResponse or structuredResponse (contract 3.1).
  const parsed = parsePhase1AttemptBody(await request.json());
  if (!parsed) return NextResponse.json({ error: 'Invalid diagnostic attempt' }, { status: 400 });

  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(await recordDiagnosticAttempt(identity, parsed));
  } catch (error) {
    if (error instanceof StructuredResponseRefusedError) {
      const { status, body } = structuredRefusalPayload(error);
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'Diagnostic attempt is not available' }, { status: 404 });
  }
}
