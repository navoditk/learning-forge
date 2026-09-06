import { NextResponse } from 'next/server';

import { getParentEvidence } from '../../../../phase1/service';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET() {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await getParentEvidence(identity));
}
