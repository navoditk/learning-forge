import { NextRequest, NextResponse } from 'next/server';

import { getSyntheticSession } from '../../../../phase1/service';

export async function GET(request: NextRequest) {
  const contentId = request.nextUrl.searchParams.get('contentId') ?? undefined;
  try {
    return NextResponse.json(await getSyntheticSession({ contentId }));
  } catch {
    return NextResponse.json({ error: 'Unknown content' }, { status: 400 });
  }
}
