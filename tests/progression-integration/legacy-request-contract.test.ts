import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));
const storeHolder = vi.hoisted(() => ({ store: undefined as unknown }));
vi.mock('../../src/assessment/store', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/assessment/store')>();
  return {
    ...original,
    createAssessmentStore: () =>
      storeHolder.store as ReturnType<typeof original.createAssessmentStore>,
  };
});

import { POST as attemptPost } from '../../src/app/api/phase1/attempt/route';
import { POST as checkPost } from '../../src/app/api/phase1/check/route';
import { POST as diagnosticPost } from '../../src/app/api/phase1/diagnostic-attempt/route';
import { POST as reviewPost } from '../../src/app/api/phase1/review-attempt/route';
import { POST as submissionPost } from '../../src/app/api/progression/assessment/submission/route';
import { requireHouseholdContext } from '../../src/server/household-context';
import { createSession, createSyntheticHousehold } from '../phase1/structured-paths-support';
import {
  createSyntheticAssignment,
  legacyBankItem,
  storeOf,
} from './structured-assessment-support';

/**
 * PY-R1: the legacy `learnerResponse` request contract is pinned. This file
 * references nothing Python and no column added after base f909a22, and this
 * exact file was run unmodified against an extraction of base f909a22 and
 * passed there (and passes on the patch): same accepted and rejected inputs,
 * validation order (shape 400 before authentication, authentication 401 before
 * session 404), exact error bodies, and trimmed storage. Assertions about the
 * new `Attempt.evaluatorVersion` column live in python-output-routes.test.ts,
 * because base has no such field. Synthetic households and an in-memory bank only.
 */

const post = (handler: (request: Request) => Promise<Response>, body: unknown) =>
  handler(
    new Request('http://localhost/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
const SESSION = '22222222-2222-4222-8222-222222222222';

const ROUTES = [
  { name: 'attempt', handler: attemptPost, invalid: 'Invalid attempt', gone: 'Session not found' },
  {
    name: 'check',
    handler: checkPost,
    invalid: 'Invalid mastery check',
    gone: 'Independent check is not available',
  },
  {
    name: 'diagnostic-attempt',
    handler: diagnosticPost,
    invalid: 'Invalid diagnostic attempt',
    gone: 'Diagnostic attempt is not available',
  },
  {
    name: 'review-attempt',
    handler: reviewPost,
    invalid: 'Invalid review attempt',
    gone: 'Review is not available',
  },
] as const;

const BAD_LEGACY: [string, unknown][] = [
  ['empty', ''],
  ['spaces only', '   '],
  ['newlines and tabs only', '\n\t \n'],
  ['over 1000 after trimming', 'x'.repeat(1001)],
  ['padded and over 1000 after trimming', `  ${'x'.repeat(1001)}  `],
  ['a number', 5],
  ['null', null],
];

describe('legacy phase 1 routes: request contract pinned to base', () => {
  let identity: Awaited<ReturnType<typeof createSyntheticHousehold>>;
  beforeAll(async () => {
    identity = await createSyntheticHousehold();
  });
  beforeEach(() => {
    vi.mocked(requireHouseholdContext).mockResolvedValue(identity);
  });
  afterAll(async () => {
    await deleteHouseholdData(prisma, identity.householdId);
  });

  for (const route of ROUTES) {
    describe(route.name, () => {
      it('rejects every bad legacy string with the exact 400 body, before authentication', async () => {
        vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
        for (const [label, learnerResponse] of BAD_LEGACY) {
          const response = await post(route.handler, { sessionId: SESSION, learnerResponse });
          expect(response.status, label).toBe(400);
          expect(await response.json(), label).toEqual({ error: route.invalid });
        }
      });

      it('accepts padded input at the parse tier: unauthenticated is 401, unknown session is 404', async () => {
        const padded = [' '.repeat(5000) + 'a', `  ${'x'.repeat(1000)}  `, '\n\n2:3\n\n', ' a '];
        vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
        for (const learnerResponse of padded) {
          const response = await post(route.handler, { sessionId: SESSION, learnerResponse });
          expect(response.status).toBe(401);
          expect(await response.json()).toEqual({ error: 'Unauthorized' });
        }
        vi.mocked(requireHouseholdContext).mockResolvedValue(identity);
        for (const learnerResponse of padded) {
          const response = await post(route.handler, { sessionId: SESSION, learnerResponse });
          expect(response.status).toBe(404);
          expect(await response.json()).toEqual({ error: route.gone });
        }
      });

      it('keeps the non-strict legacy object: an unknown key is ignored, including pythonResponse', async () => {
        for (const extra of [{ ignored: true }, { pythonResponse: 'x' }]) {
          const response = await post(route.handler, {
            sessionId: SESSION,
            learnerResponse: ' a ',
            ...extra,
          });
          expect(response.status).toBe(404);
        }
      });

      it('keeps the XOR shape: both or neither response key is the exact 400', async () => {
        vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
        const structured = { mode: 'structured-fields', modeVersion: '1', fields: {} };
        for (const body of [
          { sessionId: SESSION },
          { sessionId: SESSION, learnerResponse: 'a', structuredResponse: structured },
          { sessionId: 'not-a-uuid', learnerResponse: 'a' },
        ]) {
          const response = await post(route.handler, body);
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({ error: route.invalid });
        }
      });
    });
  }

  it('attempt: a heavily padded legacy answer is accepted, scored and stored trimmed', async () => {
    const item = contentCatalog.find((candidate) => candidate.id === 'ratio-language-1')!;
    const session = await createSession(identity, item as unknown as Record<string, unknown>);
    const response = await post(attemptPost, {
      sessionId: session.id,
      learnerResponse: `${' '.repeat(5000)}2:3${' '.repeat(10)}`,
    });
    expect(response.status).toBe(200);
    const { attemptId, correctness } = (await response.json()) as {
      attemptId: string;
      correctness: string;
    };
    expect(correctness).toBe('CORRECT');
    const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(row.learnerResponse).toBe('2:3');
    expect(row.normalizedResponse).toBe('2:3');
  });
});

describe('legacy assessment submission route: request contract pinned to base', () => {
  const households: string[] = [];
  const items = [legacyBankItem('synthetic-legacy-contract-a1')];

  beforeEach(() => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
  });
  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    for (const householdId of households) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  async function arrange() {
    const learner = await createSyntheticHousehold();
    households.push(learner.householdId);
    const assignment = await createSyntheticAssignment(
      learner,
      items,
      `synthetic-legacy-contract-${Date.now()}-${households.length}`,
    );
    storeHolder.store = storeOf(items);
    vi.mocked(requireHouseholdContext).mockResolvedValue(learner);
    return { learner, ...assignment };
  }
  const body = (ctx: { assignmentId: string; sessionId: string }, extra: object) => ({
    assignmentId: ctx.assignmentId,
    sessionId: ctx.sessionId,
    ordinal: 1,
    ...extra,
  });

  it('rejects bad legacy strings and unknown keys with the exact 400 body, after authentication', async () => {
    const ctx = await arrange();
    for (const [label, learnerResponse] of BAD_LEGACY) {
      const response = await post(submissionPost, body(ctx, { learnerResponse }));
      expect(response.status, label).toBe(400);
      expect(await response.json(), label).toEqual({
        error: 'Invalid assessment submission',
        reasonCode: 'INVALID_REQUEST',
      });
    }
    for (const extra of [{ ignored: true }, { pythonResponse: 'x' }]) {
      const response = await post(submissionPost, body(ctx, { learnerResponse: 'a', ...extra }));
      expect(response.status).toBe(400);
    }
    vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
    const unauthorized = await post(submissionPost, body(ctx, { learnerResponse: '   ' }));
    expect(unauthorized.status).toBe(401);
    expect(await unauthorized.json()).toEqual({
      error: 'Unauthorized',
      reasonCode: 'UNAUTHORIZED',
    });
  });

  it('accepts a heavily padded legacy answer and stores it trimmed', async () => {
    const ctx = await arrange();
    const response = await post(
      submissionPost,
      body(ctx, { learnerResponse: `${' '.repeat(5000)}2:3 ` }),
    );
    expect(response.status).toBe(200);
    const { attemptId } = (await response.json()) as { attemptId: string };
    const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(row.learnerResponse).toBe('2:3');
    expect(row.correctness).toBe('CORRECT');
  });
});
