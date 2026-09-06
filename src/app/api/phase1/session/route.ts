import { NextRequest, NextResponse } from 'next/server';

import { startSession } from '../../../../phase1/service';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET(request: NextRequest) {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentId = request.nextUrl.searchParams.get('contentId') ?? undefined;
  try {
    return NextResponse.json(await startSession(identity, { contentId }));
  } catch {
    return NextResponse.json({ error: 'Unknown content' }, { status: 400 });
  }
}
