import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

// The assessment route builds its default store from the environment; the
// synthetic in-memory bank is injected here so no private package is read.
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
import {
  GET as submissionGet,
  POST as submissionPost,
} from '../../src/app/api/progression/assessment/submission/route';
import { requireHouseholdContext } from '../../src/server/household-context';
import {
  archiveSyntheticItem,
  createSession,
  createSyntheticHousehold,
  evidenceSnapshot,
  removeArchivedItems,
  SF1,
  SF3,
  syntheticItem,
} from '../phase1/structured-paths-support';
import {
  createSyntheticAssignment,
  legacyBankItem,
  storeOf,
  structuredBankItem,
} from './structured-assessment-support';

/**
 * RAT-SCORE-IMPL-PATHS route layer for all five submission routes: XOR bodies,
 * tier ordering relative to authentication, refusal payloads (PA-4g), status
 * mapping and unchanged legacy responses. Synthetic data and in-memory banks.
 */

const ITEM = syntheticItem('synthetic-structured-routes-sf1', SF1);
const GOOD = { a: '45', b: '9' };
const structured = (fields: Record<string, unknown>, mode = 'structured-fields', v = '1') => ({
  mode,
  modeVersion: v,
  fields,
});
const post = (handler: (request: Request) => Promise<Response>, body: unknown) =>
  handler(
    new Request('http://localhost/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const PHASE1_ROUTES = [
  {
    name: 'attempt',
    handler: attemptPost,
    invalid: 'Invalid attempt',
    notFound: 'Session not found',
  },
  {
    name: 'check',
    handler: checkPost,
    invalid: 'Invalid mastery check',
    notFound: 'Independent check is not available',
  },
  {
    name: 'diagnostic-attempt',
    handler: diagnosticPost,
    invalid: 'Invalid diagnostic attempt',
    notFound: 'Diagnostic attempt is not available',
  },
  {
    name: 'review-attempt',
    handler: reviewPost,
    invalid: 'Invalid review attempt',
    notFound: 'Review is not available',
  },
] as const;

describe('Phase 1 attempt routes with structured bodies', () => {
  let identity: Awaited<ReturnType<typeof createSyntheticHousehold>>;
  let otherIdentity: Awaited<ReturnType<typeof createSyntheticHousehold>>;

  beforeAll(async () => {
    identity = await createSyntheticHousehold();
    otherIdentity = await createSyntheticHousehold();
    await archiveSyntheticItem(ITEM);
  });

  beforeEach(() => {
    vi.mocked(requireHouseholdContext).mockResolvedValue(identity);
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, identity.householdId);
    await deleteHouseholdData(prisma, otherIdentity.householdId);
    await removeArchivedItems([ITEM.id as string]);
  });

  for (const route of PHASE1_ROUTES) {
    describe(route.name, () => {
      const sessionId = '22222222-2222-4222-8222-222222222222';

      it('tier 1: both, neither, array/number values and unknown structured keys are 400 before authentication', async () => {
        vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
        const bad: unknown[] = [
          { sessionId },
          { sessionId, learnerResponse: '45', structuredResponse: structured(GOOD) },
          { sessionId, structuredResponse: structured({ a: 45, b: '9' }) },
          { sessionId, structuredResponse: structured({ a: ['45'], b: '9' }) },
          { sessionId, structuredResponse: { ...structured(GOOD), extra: 1 } },
          { sessionId, structuredResponse: structured(GOOD), unknown: 1 },
          { sessionId, structuredResponse: 'text' },
        ];
        for (const body of bad) {
          const response = await post(route.handler, body);
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({ error: route.invalid });
        }
      });

      it('a well-formed body without a session is 401', async () => {
        vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
        for (const body of [
          { sessionId, learnerResponse: 'x' },
          { sessionId, structuredResponse: structured(GOOD) },
        ]) {
          const response = await post(route.handler, body);
          expect(response.status).toBe(401);
          expect(await response.json()).toEqual({ error: 'Unauthorized' });
        }
      });

      it('authority errors keep the existing 404, never a field error, for a malformed structured body', async () => {
        const session = await createSession(otherIdentity, ITEM);
        for (const id of [sessionId, session.id]) {
          const response = await post(route.handler, {
            sessionId: id,
            structuredResponse: structured({ a: 'not 45', b: '' }, 'wrong-mode'),
          });
          expect(response.status).toBe(404);
          expect(await response.json()).toEqual({ error: route.notFound });
        }
      });
    });
  }

  it('attempt: 422 payloads carry only error, reasonCode and (tier 4) fieldErrors; success keeps its shape', async () => {
    const session = await createSession(identity, ITEM);
    const before = await evidenceSnapshot(identity);
    const cases: [unknown, string, unknown?][] = [
      [
        { structuredResponse: structured({ a: 'not 45', b: '' }) },
        'MALFORMED_RESPONSE',
        [
          { key: 'a', code: 'NOT_A_NUMBER' },
          { key: 'b', code: 'REQUIRED' },
        ],
      ],
      [
        { structuredResponse: structured(GOOD, 'structured-fields', '2') },
        'UNSUPPORTED_RESPONSE_MODE',
      ],
      [{ learnerResponse: '45; 9' }, 'RESPONSE_MODE_MISMATCH'],
    ];
    for (const [body, reasonCode, fieldErrors] of cases) {
      const response = await post(attemptPost, { sessionId: session.id, ...(body as object) });
      expect(response.status).toBe(422);
      const json = (await response.json()) as Record<string, unknown>;
      expect(Object.keys(json).sort()).toEqual(
        fieldErrors ? ['error', 'fieldErrors', 'reasonCode'] : ['error', 'reasonCode'],
      );
      expect(json.reasonCode).toBe(reasonCode);
      expect(json.fieldErrors).toEqual(fieldErrors);
      // Item-independent: no submitted value, label, option or correctness leaks.
      const text = JSON.stringify(json);
      for (const banned of ['not 45', 'Quantity', 'CORRECT', 'INCORRECT', '45 units', 'units']) {
        expect(text).not.toContain(banned);
      }
    }
    expect(await evidenceSnapshot(identity)).toEqual(before);
    const ok = await post(attemptPost, {
      sessionId: session.id,
      structuredResponse: structured(GOOD),
    });
    expect(ok.status).toBe(200);
    expect(Object.keys((await ok.json()) as object).sort()).toEqual([
      'attemptId',
      'correctness',
      'evidenceWeight',
    ]);
  });

  it('legacy bodies are unchanged: trimmed string accepted, non-strict stripping kept', async () => {
    const session = await createSession(identity, ITEM);
    const response = await post(attemptPost, {
      sessionId: session.id,
      learnerResponse: ' 45; 9 ',
      ignored: true,
    });
    // A structured item refuses a legacy string (mode mismatch); the body itself was accepted.
    expect(response.status).toBe(422);
    expect(((await response.json()) as { reasonCode: string }).reasonCode).toBe(
      'RESPONSE_MODE_MISMATCH',
    );
  });
});

describe('assessment submission route with structured bodies', () => {
  const S1 = structuredBankItem('synthetic-structured-route-a1', SF1);
  const S2 = structuredBankItem('synthetic-structured-route-a2', SF3);
  const L3 = legacyBankItem('synthetic-legacy-route-a3');
  const households: string[] = [];

  async function arrange(items = [S1, S2, L3]) {
    const learner = await createSyntheticHousehold();
    households.push(learner.householdId);
    const assignment = await createSyntheticAssignment(
      learner,
      items,
      `synthetic-route-key-${Date.now()}-${households.length}`,
    );
    storeHolder.store = storeOf(items);
    vi.mocked(requireHouseholdContext).mockResolvedValue(learner);
    return { learner, ...assignment };
  }

  beforeEach(() => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    for (const householdId of households) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const body = (
    ctx: { assignmentId: string; sessionId: string },
    ordinal: number,
    extra: object,
  ) => ({
    assignmentId: ctx.assignmentId,
    sessionId: ctx.sessionId,
    ordinal,
    ...extra,
  });

  it('tier 0 first: closed gate is 404 and no session is 401, whatever the body', async () => {
    const ctx = await arrange();
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    const closed = await post(submissionPost, { nonsense: true });
    expect(closed.status).toBe(404);
    expect(((await closed.json()) as { reasonCode: string }).reasonCode).toBe(
      'RELEASE_GATE_CLOSED',
    );
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    vi.mocked(requireHouseholdContext).mockRejectedValue(new Error('no session'));
    const unauthorized = await post(
      submissionPost,
      body(ctx, 1, { structuredResponse: structured(GOOD) }),
    );
    expect(unauthorized.status).toBe(401);
  });

  it('tier 1: both, neither, wrong types, unknown keys are 400 INVALID_REQUEST', async () => {
    const ctx = await arrange();
    const bad: object[] = [
      body(ctx, 1, {}),
      body(ctx, 1, { learnerResponse: '45', structuredResponse: structured(GOOD) }),
      body(ctx, 1, { structuredResponse: structured({ a: 45, b: '9' }) }),
      body(ctx, 1, { structuredResponse: { ...structured(GOOD), extra: 1 } }),
      body(ctx, 1, { structuredResponse: structured(GOOD), unknown: 1 }),
      body(ctx, 1, { learnerResponse: '45', unknown: 1 }),
      { ...body(ctx, 1, { structuredResponse: structured(GOOD) }), ordinal: 0 },
    ];
    for (const payload of bad) {
      const response = await post(submissionPost, payload);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid assessment submission',
        reasonCode: 'INVALID_REQUEST',
      });
    }
  });

  it('refusals are 422 with only error/reasonCode/fieldErrors, write nothing and consume no ordinal', async () => {
    const ctx = await arrange();
    const cases: [object, string, unknown?][] = [
      [
        { structuredResponse: structured({ a: 'not 45', b: '' }) },
        'MALFORMED_RESPONSE',
        [
          { key: 'a', code: 'NOT_A_NUMBER' },
          { key: 'b', code: 'REQUIRED' },
        ],
      ],
      [{ structuredResponse: structured(GOOD, 'structured') }, 'UNSUPPORTED_RESPONSE_MODE'],
      [{ learnerResponse: '45; 9' }, 'RESPONSE_MODE_MISMATCH'],
    ];
    for (const [extra, reasonCode, fieldErrors] of cases) {
      const response = await post(submissionPost, body(ctx, 1, extra));
      expect(response.status).toBe(422);
      const json = (await response.json()) as Record<string, unknown>;
      expect(Object.keys(json).sort()).toEqual(
        fieldErrors ? ['error', 'fieldErrors', 'reasonCode'] : ['error', 'reasonCode'],
      );
      expect(json.reasonCode).toBe(reasonCode);
      expect(json.fieldErrors).toEqual(fieldErrors);
      for (const banned of ['not 45', 'Quantity', 'CORRECT', 'INCORRECT']) {
        expect(JSON.stringify(json)).not.toContain(banned);
      }
    }
    expect(await prisma.attempt.count({ where: { sessionId: ctx.sessionId } })).toBe(0);
    const state = await prisma.assessmentRunState.findUniqueOrThrow({
      where: { assignmentId: ctx.assignmentId },
    });
    expect(state).toMatchObject({ status: 'PENDING', startedAt: null, submittedOrdinals: [] });
    const ok = await post(submissionPost, body(ctx, 1, { structuredResponse: structured(GOOD) }));
    expect(ok.status).toBe(200);
    const json = (await ok.json()) as Record<string, unknown>;
    expect(json).toMatchObject({ expired: false, status: 'IN_PROGRESS' });
    expect(JSON.stringify(json)).not.toMatch(/responseSpec|fieldErrors|Quantity/);
  });

  it('authority and lifecycle codes keep their existing statuses over a malformed body', async () => {
    const ctx = await arrange();
    const malformed = { structuredResponse: structured({ a: 'x' }, 'wrong') };
    const future = await post(submissionPost, body(ctx, 2, malformed));
    expect(future.status).toBe(409);
    expect(((await future.json()) as { reasonCode: string }).reasonCode).toBe('NOT_CURRENT_ITEM');
    const unselected = await post(submissionPost, body(ctx, 9, malformed));
    expect(unselected.status).toBe(409);
    expect(((await unselected.json()) as { reasonCode: string }).reasonCode).toBe(
      'VERSION_MISMATCH',
    );
    const unknown = await post(
      submissionPost,
      body(
        { assignmentId: '33333333-3333-4333-8333-333333333333', sessionId: ctx.sessionId },
        1,
        malformed,
      ),
    );
    expect(unknown.status).toBe(404);
    expect(((await unknown.json()) as { reasonCode: string }).reasonCode).toBe(
      'ASSESSMENT_NOT_FOUND',
    );
    await post(submissionPost, body(ctx, 1, { structuredResponse: structured(GOOD) }));
    const duplicate = await post(submissionPost, body(ctx, 1, malformed));
    expect(duplicate.status).toBe(409);
    expect(((await duplicate.json()) as { reasonCode: string }).reasonCode).toBe(
      'DUPLICATE_ITEM_SUBMISSION',
    );
  });

  it('the legacy body is accepted and unchanged for a legacy item', async () => {
    const ctx = await arrange([L3]);
    const response = await post(submissionPost, body(ctx, 1, { learnerResponse: '2:3' }));
    expect(response.status).toBe(200);
  });

  it('GET serves the structured descriptor with no private data, and stays item-level for legacy', async () => {
    const ctx = await arrange();
    const { NextRequest } = await import('next/server');
    const url = `http://localhost/api/progression/assessment/submission?assignmentId=${ctx.assignmentId}&sessionId=${ctx.sessionId}`;
    const response = await submissionGet(new NextRequest(new Request(url)));
    expect(response.status).toBe(200);
    const json = (await response.json()) as { item: Record<string, unknown> };
    expect(json.item).toHaveProperty('responseSpec');
    const text = JSON.stringify(json);
    for (const banned of [
      'correctValue',
      'correctOptionId',
      'canonicalAnswer',
      'acceptedAnswers',
      'SENTINEL-',
    ]) {
      expect(text).not.toContain(banned);
    }
  });
});
