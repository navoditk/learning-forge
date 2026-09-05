import { NextResponse } from 'next/server';

import { getParentEvidence } from '../../../../phase1/service';

export async function GET() {
  return NextResponse.json(await getParentEvidence());
}
