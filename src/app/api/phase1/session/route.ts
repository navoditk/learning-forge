import { NextResponse } from 'next/server';

import { getSyntheticSession } from '../../../../phase1/service';

export async function GET() {
  return NextResponse.json(await getSyntheticSession());
}
