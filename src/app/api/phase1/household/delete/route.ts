import { NextResponse } from 'next/server';

import {
  deleteHouseholdData,
  HOUSEHOLD_DELETION_CONFIRMATION_PHRASE,
  isHouseholdDeletionConfirmed,
} from '../../../../../server/household-data';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { prisma } from '../../../../../server/prisma';

export async function POST(request: Request) {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const confirmation = (body as { confirmation?: unknown } | null)?.confirmation;
  if (!isHouseholdDeletionConfirmed(confirmation)) {
    return NextResponse.json(
      { error: `Type "${HOUSEHOLD_DELETION_CONFIRMATION_PHRASE}" exactly to confirm deletion.` },
      { status: 400 },
    );
  }

  const deleted = await deleteHouseholdData(prisma, identity.householdId);
  if (!deleted) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  // No household data survives to log against, so this is deliberately a
  // plain operational log line (not a DB row) - just enough to see, after
  // the fact, that a deletion happened and roughly when.
  console.log('[household-deletion] household data permanently deleted', {
    householdId: identity.householdId,
    deletedAt: new Date().toISOString(),
  });

  return NextResponse.json({ deleted: true });
}
