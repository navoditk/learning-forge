import { NextRequest, NextResponse } from 'next/server';

import { parseAvailableProgram } from '../../../../phase1/program';
import { getReviewQueue } from '../../../../phase1/service';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET(request: NextRequest) {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const program = parseAvailableProgram(request.nextUrl.searchParams.get('program'));
    return NextResponse.json(await getReviewQueue(identity, { program }));
  } catch {
    return NextResponse.json({ error: 'Unknown curriculum program' }, { status: 400 });
  }
}
