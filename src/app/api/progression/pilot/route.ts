import { NextResponse } from 'next/server';

import { getPilotProgression } from '../../../../progression/pilot-progress';
import { isProgressionReleaseGateOpen } from '../../../../progression/release-gates';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET() {
  if (!isProgressionReleaseGateOpen()) {
    return NextResponse.json(
      { error: 'Course progression release gate is closed', reasonCode: 'RELEASE_GATE_CLOSED' },
      { status: 404 },
    );
  }
  try {
    const identity = await requireHouseholdContext();
    return NextResponse.json(await getPilotProgression(identity));
  } catch {
    return NextResponse.json({ error: 'Progression could not be loaded' }, { status: 401 });
  }
}
