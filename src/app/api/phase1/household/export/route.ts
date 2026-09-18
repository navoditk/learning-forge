import { NextResponse } from 'next/server';

import { exportHouseholdData } from '../../../../../server/household-data';
import { requireHouseholdContext } from '../../../../../server/household-context';
import { prisma } from '../../../../../server/prisma';

export async function GET() {
  let identity;
  try {
    identity = await requireHouseholdContext();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await exportHouseholdData(prisma, identity.householdId);
  const body = JSON.stringify(data, null, 2);
  const fileName = `learning-forge-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
