import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { hashPassword } from '../../src/auth/verify-credentials';
import { issueStepUpToken } from '../../src/auth/step-up';
import { applyNeedsHelpOverride } from '../../src/progression/learner-state';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST as stepUp } from '../../src/app/api/progression/step-up/route';
import { POST as override } from '../../src/app/api/progression/override/route';

const PASSWORD = 'correct horse battery staple';

/**
 * D-06/D-47/D-70 route boundary: step-up re-verifies the session parent's
 * password; an override needs a fresh, unused step-up for the same actor and
 * household, and only reopens a NEEDS_HELP pilot skill.
 */
describe('step-up and NEEDS_HELP override routes', () => {
  let householdId: string;
  let learnerProfileId: string;
  let parentId: string;
  const originalSecret = process.env.AUTH_SECRET;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    process.env.AUTH_SECRET ??= 'integration-step-up-secret-of-sufficient-length';
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const learnerUser = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: learnerUser.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    const parent = await prisma.user.create({
      data: {
        householdId,
        role: 'PARENT',
        email: `override-${householdId}@example.test`,
        passwordHash: await hashPassword(PASSWORD),
      },
    });
    parentId = parent.id;
  });

  beforeEach(async () => {
    vi.mocked(requireHouseholdContext).mockResolvedValue({
      householdId,
      learnerProfileId,
      actorUserId: parentId,
      actorRole: 'PARENT',
    });
    await prisma.overrideRecord.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.create({
      data: {
        householdId,
        learnerProfileId,
        lessonCode: 'ratio-language-lesson',
        lessonVersion: '1.0.0',
        completionStatus: 'COMPLETE',
        remediationStatus: 'NEEDS_HELP',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
      },
    });
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    if (originalSecret === undefined) delete process.env.AUTH_SECRET;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const post = async (
    handler: (request: never) => Promise<Response>,
    path: string,
    body: unknown,
  ) => {
    const response = await handler(
      new Request(`http://localhost/api/progression/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }) as never,
    );
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  const freshToken = async () => {
    const response = await post(stepUp, 'step-up', { password: PASSWORD });
    expect(response.status).toBe(200);
    return response.body.stepUpToken as string;
  };

  const request = (stepUpToken: string, extra: Record<string, string> = {}) => ({
    skillCode: 'ratio-language',
    skillVersion: '1.0.0',
    reason: 'Practised the skill together offline.',
    stepUpToken,
    ...extra,
  });

  const remediation = async () =>
    (
      await prisma.learnerLessonState.findFirstOrThrow({
        where: { learnerProfileId, lessonCode: 'ratio-language-lesson' },
      })
    ).remediationStatus;

  it('is closed while the release gate is closed', async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    expect((await post(stepUp, 'step-up', { password: PASSWORD })).status).toBe(404);
    expect((await post(override, 'override', request('token'))).status).toBe(404);
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
  });

  it('refuses a wrong password and reports the lifetime on success', async () => {
    expect(await post(stepUp, 'step-up', { password: 'wrong' })).toMatchObject({
      status: 403,
      body: { reasonCode: 'STEP_UP_FAILED' },
    });
    const ok = await post(stepUp, 'step-up', { password: PASSWORD });
    expect(ok.status).toBe(200);
    expect(ok.body.expiresInMinutes).toBe(10);
  });

  it('reopens NEEDS_HELP once per step-up', async () => {
    const token = await freshToken();
    expect((await post(override, 'override', request(token))).status).toBe(201);
    expect(await remediation()).toBe('ACTIVE');
    await prisma.learnerLessonState.updateMany({
      where: { learnerProfileId },
      data: { remediationStatus: 'NEEDS_HELP' },
    });
    expect(await post(override, 'override', request(token))).toMatchObject({
      status: 409,
      body: { reasonCode: 'REAUTH_ALREADY_USED' },
    });
  });

  it('lets only one of two concurrent overrides use a step-up', async () => {
    const token = await freshToken();
    const results = await Promise.all([
      post(override, 'override', request(token)),
      post(override, 'override', request(token)),
    ]);
    expect(results.filter((result) => result.status === 201)).toHaveLength(1);
    expect(await prisma.overrideRecord.count({ where: { householdId } })).toBe(1);
  });

  it('refuses a forged, foreign, or expired step-up', async () => {
    const token = await freshToken();
    expect(await post(override, 'override', request(`${token}x`))).toMatchObject({
      status: 403,
      body: { reasonCode: 'STEP_UP_REQUIRED' },
    });
    const foreign = issueStepUpToken(
      { userId: parentId, householdId: 'another-household', issuedAt: new Date() },
      process.env.AUTH_SECRET,
    );
    expect(await post(override, 'override', request(foreign))).toMatchObject({
      status: 403,
      body: { reasonCode: 'STEP_UP_REQUIRED' },
    });
    const expired = issueStepUpToken(
      { userId: parentId, householdId, issuedAt: new Date(Date.now() - 11 * 60_000) },
      process.env.AUTH_SECRET,
    );
    expect(await post(override, 'override', request(expired))).toMatchObject({
      status: 403,
      body: { reasonCode: 'REAUTH_EXPIRED' },
    });
    expect(await remediation()).toBe('NEEDS_HELP');
  });

  it('refuses a skill that is not NEEDS_HELP or not in the pilot', async () => {
    await prisma.learnerLessonState.updateMany({
      where: { learnerProfileId },
      data: { remediationStatus: 'ACTIVE' },
    });
    expect(await post(override, 'override', request(await freshToken()))).toMatchObject({
      status: 409,
      body: { reasonCode: 'NOT_NEEDS_HELP' },
    });
    expect(
      await post(override, 'override', request(await freshToken(), { skillCode: 'gcf-and-lcm' })),
    ).toMatchObject({ status: 409, body: { reasonCode: 'VERSION_MISMATCH' } });
  });

  it('re-checks the actor server-side', async () => {
    const other = await prisma.household.create({ data: {} });
    const outsider = await prisma.user.create({
      data: { householdId: other.id, role: 'PARENT' },
    });
    const learnerUser = await prisma.user.findFirstOrThrow({
      where: { householdId, role: 'LEARNER' },
    });
    for (const actorUserId of [outsider.id, learnerUser.id]) {
      const result = await prisma.$transaction((transaction) =>
        applyNeedsHelpOverride(transaction, {
          householdId,
          learnerProfileId,
          skillRef: { code: 'ratio-language', version: '1.0.0' },
          actorUserId,
          actorRole: 'PARENT',
          reason: 'Fixture.',
          reauthAt: new Date(),
          stepUpReauthLifetimeMinutes: 10,
          policyProfileCode: 'grade-6-math-default',
          policyProfileVersion: '1.1.0',
          now: new Date(),
        }),
      );
      expect(result).toEqual({ applied: false, reasonCode: 'ACTOR_NOT_AUTHORIZED' });
    }
    await deleteHouseholdData(prisma, other.id);
  });
});
