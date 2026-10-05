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

  // deleteHouseholdData records the HOUSEHOLD_DELETE audit event itself,
  // inside the same transaction, then anonymizes every audit row this
  // household produced - see the comment there for why.
  const deleted = await deleteHouseholdData(prisma, identity.householdId, identity.actorUserId);
  if (!deleted) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
