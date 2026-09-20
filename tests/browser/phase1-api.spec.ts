import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.describe('Phase 1 API route validation and error paths', () => {
  test('attempt route rejects malformed bodies and unknown sessions', async ({ request }) => {
    const invalid = await request.post('/api/phase1/attempt', {
      data: { sessionId: 'not-a-uuid', learnerResponse: '15' },
    });
    expect(invalid.status()).toBe(400);

    const unknown = await request.post('/api/phase1/attempt', {
      data: { sessionId: randomUUID(), learnerResponse: '15' },
    });
    expect(unknown.status()).toBe(404);
  });

  test('check route rejects malformed bodies and a premature independent check', async ({
    request,
  }) => {
    const invalid = await request.post('/api/phase1/check', {
      data: { sessionId: 'not-a-uuid', learnerResponse: '15' },
    });
    expect(invalid.status()).toBe(400);

    const session = await (
      await request.get('/api/phase1/session?contentId=ratio-language-1')
    ).json();
    const premature = await request.post('/api/phase1/check', {
      data: { sessionId: session.sessionId, learnerResponse: '15' },
    });
    expect(premature.status()).toBe(404);
  });

  test('hint route rejects malformed bodies and unknown attempts, and ignores forged state fields', async ({
    request,
  }) => {
    const invalidBody = await request.post('/api/phase1/hint', {
      data: { learnerMessage: '' },
    });
    expect(invalidBody.status()).toBe(400);

    const unknownAttempt = await request.post('/api/phase1/hint', {
      data: { attemptId: randomUUID(), learnerMessage: 'I tried.' },
    });
    expect(unknownAttempt.status()).toBe(404);

    const session = await (
      await request.get('/api/phase1/session?contentId=fraction-decimal-operations-1')
    ).json();
    const attempt = await (
      await request.post('/api/phase1/attempt', {
        data: { sessionId: session.sessionId, learnerResponse: '15' },
      })
    ).json();

    // Forges state/priorHintCount/attemptNumber fields the client has no
    // authority over - the route must derive these server-side from the
    // real attempt (`getTutorContext`), not trust the request body.
    const forgedResponse = await request.post('/api/phase1/hint', {
      data: {
        attemptId: attempt.attemptId,
        learnerMessage: 'I divided 45 by 3.',
        state: 'guided_solution',
        priorHintCount: 0,
        attemptNumber: 1,
      },
    });
    expect(forgedResponse.status()).toBe(200);
    const forgedBody = await forgedResponse.json();
    expect(forgedBody.response.move.moveType).toBe('probe_reasoning');
  });

  test('parent route returns 200 with the expected evidence shape', async ({ request }) => {
    const response = await request.get('/api/phase1/parent');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.attempts)).toBe(true);
    expect(Array.isArray(body.mastery)).toBe(true);
  });

  test('pilot progression route is readable and held-out assignment creation fails closed', async ({
    request,
  }) => {
    test.skip(
      Boolean(process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH),
      'This assertion is for the default no-package fail-closed environment.',
    );
    const progression = await request.get('/api/progression/pilot');
    expect(progression.status()).toBe(200);
    const body = await progression.json();
    expect(body.units).toHaveLength(1);
    expect(body.units[0].lessons).toHaveLength(3);

    const assignment = await request.post('/api/progression/assessment/assignment', {
      data: {
        kind: 'LESSON_ASSESSMENT',
        targetKind: 'LESSON',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        idempotencyKey: `e2e-${randomUUID()}`,
      },
    });
    expect(assignment.status()).toBe(503);
    expect((await assignment.json()).reasonCode).toBe('ASSESSMENT_STORE_UNAVAILABLE');
  });

  test('staging private package serves a real lesson assignment when explicitly mounted', async ({
    request,
  }) => {
    test.skip(
      !process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH,
      'Requires an explicitly mounted private assessment package.',
    );

    const assignment = await request.post('/api/progression/assessment/assignment', {
      data: {
        kind: 'LESSON_ASSESSMENT',
        targetKind: 'LESSON',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        idempotencyKey: `private-package-${randomUUID()}`,
      },
    });
    expect(assignment.status()).toBe(201);
    const body = await assignment.json();
    expect(body.assignment.selectedItems).toHaveLength(3);
    expect(
      body.assignment.selectedItems.every((item: { hash: string }) =>
        item.hash.startsWith('sha256:'),
      ),
    ).toBe(true);
  });

  test('program-scoped routes reject unavailable and mismatched curricula', async ({ request }) => {
    const unavailable = await request.get('/api/phase1/plan?program=grade-6-ela');
    expect(unavailable.status()).toBe(400);

    const mismatched = await request.get(
      '/api/phase1/session?program=math-kangaroo-6&contentId=ratio-language-1',
    );
    expect(mismatched.status()).toBe(400);

    const plan = await (await request.get('/api/phase1/plan?program=math-kangaroo-6')).json();
    expect(plan.items.length).toBeGreaterThan(0);
    expect(
      plan.items.every((item: { skillCode: string }) => item.skillCode.startsWith('mk6-')),
    ).toBe(true);

    const moemsPlan = await (await request.get('/api/phase1/plan?program=moems-6')).json();
    expect(moemsPlan.items.length).toBeGreaterThan(0);
    expect(
      moemsPlan.items.every((item: { skillCode: string }) => item.skillCode.startsWith('moems6-')),
    ).toBe(true);

    const amcPlan = await (await request.get('/api/phase1/plan?program=amc-8')).json();
    expect(amcPlan.items.length).toBeGreaterThan(0);
    expect(amcPlan.items.every((item: { mode: string }) => item.mode === 'core')).toBe(true);

    const mathcountsPlan = await (
      await request.get('/api/phase1/plan?program=mathcounts-6')
    ).json();
    expect(mathcountsPlan.items.length).toBeGreaterThan(0);
    expect(
      mathcountsPlan.items.every((item: { skillCode: string }) =>
        item.skillCode.startsWith('mc6-'),
      ),
    ).toBe(true);
  });
});
