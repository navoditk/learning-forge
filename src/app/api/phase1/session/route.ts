import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { startSession } from '../../../../phase1/service';
import { parseAvailableProgram } from '../../../../phase1/program';
import { requireHouseholdContext } from '../../../../server/household-context';
import { SessionUnboundError } from '../../../../progression/assignment-binding';
import { ProgressionAuthorizationDeniedError } from '../../../../progression/policy';

const SessionActivityKindSchema = z.enum(['PRACTICE', 'PLACEMENT', 'REVIEW']);

const SessionRequestBodySchema = z
  .object({
    contentId: z.string().trim().min(1).optional(),
    program: z.string().trim().min(1).optional(),
    activityKind: SessionActivityKindSchema.optional(),
  })
  .strict();

async function handleStartSession(input: {
  contentId?: string;
  program?: string | null;
  activityKind?: string | null;
}) {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const program = parseAvailableProgram(input.program ?? null);
    const activityKind = input.activityKind
      ? SessionActivityKindSchema.parse(input.activityKind)
      : 'PRACTICE';
    return NextResponse.json(
      await startSession(identity, { contentId: input.contentId, program, activityKind }),
    );
  } catch (error) {
    if (
      error instanceof SessionUnboundError ||
      error instanceof ProgressionAuthorizationDeniedError
    ) {
      return NextResponse.json(
        { error: error.message, reasonCode: error.reasonCode },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Unknown content' }, { status: 400 });
  }
}

/**
 * Still the real entry point the learner UI calls today
 * (`src/app/page.tsx`'s `fetch(/api/phase1/session?...)`). Stage C4 step 6
 * ("remove bypass", architecture.md §11.4a) retires this in favor of POST
 * below, but only once the client is switched over in the same deploy -
 * removing GET here first would break every learner request immediately,
 * regardless of any enforcement flag. Not yet done; tracked, not silent.
 */
export async function GET(request: NextRequest) {
  return handleStartSession({
    contentId: request.nextUrl.searchParams.get('contentId') ?? undefined,
    program: request.nextUrl.searchParams.get('program'),
    activityKind: request.nextUrl.searchParams.get('activityKind'),
  });
}

/**
 * Stage C4 step 6 preparation: the POST-based creation path §11.4a's
 * "remove bypass" step requires, added now and fully tested so the actual
 * cutover is a client-side switch-over plus deleting the GET handler
 * above, not new, unverified server code written under deadline pressure.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid session request' }, { status: 400 });
  }
  const parsed = SessionRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid session request' }, { status: 400 });
  }
  return handleStartSession(parsed.data);
}
