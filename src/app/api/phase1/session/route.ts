import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { startSession } from '../../../../phase1/service';
import { parseAvailableProgram } from '../../../../phase1/program';
import { requireHouseholdContext } from '../../../../server/household-context';

const SessionActivityKindSchema = z.enum(['PRACTICE', 'PLACEMENT', 'REVIEW']);

export async function GET(request: NextRequest) {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentId = request.nextUrl.searchParams.get('contentId') ?? undefined;
  try {
    const program = parseAvailableProgram(request.nextUrl.searchParams.get('program'));
    const rawActivityKind = request.nextUrl.searchParams.get('activityKind');
    const activityKind = rawActivityKind
      ? SessionActivityKindSchema.parse(rawActivityKind)
      : 'PRACTICE';
    return NextResponse.json(await startSession(identity, { contentId, program, activityKind }));
  } catch {
    return NextResponse.json({ error: 'Unknown content' }, { status: 400 });
  }
}
