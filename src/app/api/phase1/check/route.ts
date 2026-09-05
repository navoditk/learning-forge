import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordIndependentCheck } from '../../../../phase1/service';

const CheckRequestSchema = z.object({
  sessionId: z.string().uuid(),
  learnerResponse: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const parsed = CheckRequestSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid mastery check' }, { status: 400 });
  try {
    return NextResponse.json(await recordIndependentCheck(parsed.data));
  } catch {
    return NextResponse.json({ error: 'Independent check is not available' }, { status: 404 });
  }
}
