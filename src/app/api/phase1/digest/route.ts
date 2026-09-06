import { NextResponse } from 'next/server';

import { getWeeklyDigest } from '../../../../phase1/service';

export async function GET() {
  return NextResponse.json(await getWeeklyDigest());
}
