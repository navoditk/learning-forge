import { NextRequest, NextResponse } from 'next/server';

import { COURSE_CATALOG } from '../../../../curriculum/course-catalog';

import { getPilotProgression } from '../../../../progression/pilot-progress';
import { isProgressionReleaseGateOpen } from '../../../../progression/release-gates';
import { requireHouseholdContext } from '../../../../server/household-context';

export async function GET(request: NextRequest) {
  if (!isProgressionReleaseGateOpen()) {
    return NextResponse.json(
      { error: 'Course progression release gate is closed', reasonCode: 'RELEASE_GATE_CLOSED' },
      { status: 404 },
    );
  }
  // SPELL-SP5: `?program=<code>` selects any active unit-bearing program; absent keeps the default.
  const programCode = new URL(request.url).searchParams.get('program') ?? undefined;
  if (programCode !== undefined && COURSE_CATALOG.unitsOfProgram(programCode).length === 0) {
    return NextResponse.json(
      { error: 'Program has no active course', reasonCode: 'PROGRAM_UNAVAILABLE' },
      { status: 404 },
    );
  }
  try {
    const identity = await requireHouseholdContext();
    return NextResponse.json(await getPilotProgression(identity, undefined, programCode));
  } catch {
    return NextResponse.json({ error: 'Progression could not be loaded' }, { status: 401 });
  }
}
