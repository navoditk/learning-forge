import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordDiagnosticAttempt } from '../../../../phase1/service';
import { requireHouseholdContext } from '../../../../server/household-context';

const DiagnosticAttemptRequestSchema = z.object({
  sessionId: z.string().uuid(),
  learnerResponse: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const parsed = DiagnosticAttemptRequestSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid diagnostic attempt' }, { status: 400 });

  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(await recordDiagnosticAttempt(identity, parsed.data));
  } catch {
    return NextResponse.json({ error: 'Diagnostic attempt is not available' }, { status: 404 });
  }
}
