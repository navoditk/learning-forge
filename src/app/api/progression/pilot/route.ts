import { NextResponse } from 'next/server';

import { getPilotProgression } from '../../../../progression/pilot-progress';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET() {
  try {
    const identity = await requireHouseholdContext();
    return NextResponse.json(await getPilotProgression(identity));
  } catch {
    return NextResponse.json({ error: 'Progression could not be loaded' }, { status: 401 });
  }
}
