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

  test('program-scoped routes reject unavailable and mismatched curricula', async ({ request }) => {
    const unavailable = await request.get('/api/phase1/plan?program=moems-6');
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
  });
});
