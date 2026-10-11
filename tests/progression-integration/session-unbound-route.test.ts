import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { GET as sessionGet } from '../../src/app/api/phase1/session/route';

/**
 * Stage C4 step 3 route-level contract: SESSION_UNBOUND must reach the
 * caller as a distinguishable reasonCode, not the generic "Unknown content"
 * 400 every other startSession failure maps to.
 */
describe('session route: SESSION_UNBOUND refusal', () => {
  let householdId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    vi.mocked(requireHouseholdContext).mockResolvedValue({
      householdId,
      learnerProfileId: profile.id,
    });
  });

  afterEach(() => {
    delete process.env.COURSE_PROGRESSION_C4_SESSION_BINDING_ENFORCED;
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('returns 409 with reasonCode SESSION_UNBOUND once enforced, not a generic 400', async () => {
    process.env.COURSE_PROGRESSION_C4_SESSION_BINDING_ENFORCED = 'true';
    const request = new Request(
      'http://localhost/api/phase1/session?contentId=ratio-language-1&activityKind=PLACEMENT',
    );
    const { NextRequest } = await import('next/server');
    const response = await sessionGet(new NextRequest(request));

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.reasonCode).toBe('SESSION_UNBOUND');
  });
});
