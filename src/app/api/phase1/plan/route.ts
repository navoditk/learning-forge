import { NextResponse } from 'next/server';

import { getPlan } from '../../../../phase1/service';

export async function GET() {
  return NextResponse.json(await getPlan());
}
