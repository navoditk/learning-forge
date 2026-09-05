import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordAttempt } from '../../../../phase1/service';

const AttemptRequestSchema = z.object({
  sessionId: z.string().uuid(),
  learnerResponse: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const parsed = AttemptRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 });
  try {
    return NextResponse.json(await recordAttempt(parsed.data));
  } catch {
    return NextResponse.json({ error: 'Synthetic session not found' }, { status: 404 });
  }
}
