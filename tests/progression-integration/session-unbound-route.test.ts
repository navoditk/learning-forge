import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { GET as sessionGet, POST as sessionPost } from '../../src/app/api/phase1/session/route';

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

  it('returns 409 with the shadow-observed reasonCode once authorization is enforced', async () => {
    process.env.COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED = 'true';
    const request = new Request(
      'http://localhost/api/phase1/session?contentId=unit-rates-1&activityKind=PRACTICE',
    );
    const { NextRequest } = await import('next/server');
    const response = await sessionGet(new NextRequest(request));

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.reasonCode).toBe('LOCKED_PREREQUISITE');
    delete process.env.COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED;
  });
});

/**
 * Stage C4 step 6 preparation: the POST path must behave identically to
 * the GET path it will eventually replace, including the SESSION_UNBOUND
 * refusal above - proven now, before the client ever calls it.
 */
describe('session route: POST (C4 step 6 preparation)', () => {
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

  it('starts a session from a JSON body, same as the GET query-param path', async () => {
    const { NextRequest } = await import('next/server');
    const request = new NextRequest(
      new Request('http://localhost/api/phase1/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentId: 'gcf-and-lcm-1', activityKind: 'PRACTICE' }),
      }),
    );
    const response = await sessionPost(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.sessionId).toBeTruthy();
  });

  it('returns 409 with reasonCode SESSION_UNBOUND once enforced, same as GET', async () => {
    process.env.COURSE_PROGRESSION_C4_SESSION_BINDING_ENFORCED = 'true';
    const { NextRequest } = await import('next/server');
    const request = new NextRequest(
      new Request('http://localhost/api/phase1/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentId: 'ratio-language-1', activityKind: 'PLACEMENT' }),
      }),
    );
    const response = await sessionPost(request);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.reasonCode).toBe('SESSION_UNBOUND');
  });

  it('rejects an unknown field, never silently ignoring it', async () => {
    const { NextRequest } = await import('next/server');
    const request = new NextRequest(
      new Request('http://localhost/api/phase1/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentId: 'gcf-and-lcm-1', unexpectedField: 'x' }),
      }),
    );
    const response = await sessionPost(request);
    expect(response.status).toBe(400);
  });
});
