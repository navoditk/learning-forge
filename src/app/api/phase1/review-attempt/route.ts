import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordReviewAttempt } from '../../../../phase1/service';
import { requireHouseholdContext } from '../../../../server/household-context';

const ReviewAttemptRequestSchema = z.object({
  sessionId: z.string().uuid(),
  learnerResponse: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const parsed = ReviewAttemptRequestSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid review attempt' }, { status: 400 });

  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(await recordReviewAttempt(identity, parsed.data));
  } catch {
    return NextResponse.json({ error: 'Review is not available' }, { status: 404 });
  }
}
