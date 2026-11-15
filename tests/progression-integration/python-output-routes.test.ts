import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

// The assessment route builds its default store from the environment; the
// synthetic in-memory bank is injected so no private package is read.
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
import { PHASE_1_MASTERY_VERSION } from '../../src/phase1/service';
import { requireHouseholdContext } from '../../src/server/household-context';
import {
  archiveSyntheticItem,
  createSession,
  createSyntheticHousehold,
  evidenceSnapshot,
  removeArchivedItems,
} from '../phase1/structured-paths-support';
import { PY_SKILL, pythonBankItem, pythonPracticeItem } from '../phase1/python-paths-support';
import { createSyntheticAssignment, storeOf } from './structured-assessment-support';

/**
 * PYTHON-IMPLEMENT C5, request to persistence, over all five grading routes:
 * the untrimmed raw string reaches the evaluator, typed invalid responses write
 * nothing, and `normalizedResponse` / `evaluatorVersion` are persisted through
 * the real evidence path. Synthetic households, a synthetic archived record and
 * an in-memory bank only. Learner code is never run: scoring is string matching.
 */

const ITEM = pythonPracticeItem('synthetic-python-routes-1');
const post = (handler: (request: Request) => Promise<Response>, body: unknown) =>
  handler(
    new Request('http://localhost/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const INVALID: [string, string][] = [
  ['', 'EMPTY'],
  ['\n', 'EMPTY'],
  ['Hi\t3', 'DISALLOWED_CHARACTER'],
  ['Hi\u00003', 'DISALLOWED_CHARACTER'],
  ['“Hi”\n3', 'DISALLOWED_CHARACTER'],
  ['x'.repeat(1001), 'TOO_LONG'],
  [Array.from({ length: 21 }, () => 'a').join('\n'), 'TOO_MANY_LINES'],
];

describe('python_output over the Phase 1 routes', () => {
  let identity: Awaited<ReturnType<typeof createSyntheticHousehold>>;

  beforeAll(async () => {
    identity = await createSyntheticHousehold();
    await archiveSyntheticItem(ITEM);
  });
  beforeEach(() => {
    vi.mocked(requireHouseholdContext).mockResolvedValue(identity);
  });
  afterAll(async () => {
    await deleteHouseholdData(prisma, identity.householdId);
    for (const householdId of extraHouseholds) await deleteHouseholdData(prisma, householdId);
    await removeArchivedItems([ITEM.id as string]);
  });

  it('attempt: raw untrimmed text is scored and persisted with its evaluator version', async () => {
    const cases: [string, 'CORRECT' | 'INCORRECT', string][] = [
      ['Hi\n3', 'CORRECT', 'Hi\n3'],
      ['Hi\n3\n', 'CORRECT', 'Hi\n3'],
      ['Hi\r\n3\r\n', 'CORRECT', 'Hi\n3'],
      ['Hi\r3', 'CORRECT', 'Hi\n3'],
      ['hi\n3', 'INCORRECT', 'hi\n3'],
      ['  Hi\n3', 'INCORRECT', '  Hi\n3'],
      ['Hi \n3', 'INCORRECT', 'Hi \n3'],
      ['\nHi\n3', 'INCORRECT', '\nHi\n3'],
      ['Hi\n3\n\n', 'INCORRECT', 'Hi\n3\n'],
      ['Hi\n\n3', 'INCORRECT', 'Hi\n\n3'],
      ['Hi 3', 'INCORRECT', 'Hi 3'],
      ['   ', 'INCORRECT', '   '],
    ];
    for (const [text, correctness, normalized] of cases) {
      const session = await createSession(identity, ITEM);
      const response = await post(attemptPost, { sessionId: session.id, pythonResponse: text });
      expect(response.status, JSON.stringify(text)).toBe(200);
      const json = (await response.json()) as { attemptId: string; correctness: string };
      expect(json.correctness, JSON.stringify(text)).toBe(correctness);
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: json.attemptId } });
      // Untrimmed: leading/trailing whitespace is stored exactly as typed.
      expect(row.learnerResponse).toBe(text);
      expect(row.normalizedResponse).toBe(normalized);
      expect(row.evaluatorVersion).toBe('python-output-1');
      expect(row.scoringMethod).toBe('DETERMINISTIC');
    }
  });

  it('legacy attempts keep a null evaluatorVersion (new column; not in the base comparison)', async () => {
    const legacyItem = contentCatalog.find((item) => item.id === 'ratio-language-1')!;
    const session = await createSession(identity, legacyItem as unknown as Record<string, unknown>);
    const response = await post(attemptPost, { sessionId: session.id, learnerResponse: ' 2:3 ' });
    expect(response.status).toBe(200);
    const { attemptId } = (await response.json()) as { attemptId: string };
    const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(row.learnerResponse).toBe('2:3');
    expect(row.evaluatorVersion).toBeNull();
  });

  it('a legacy-key body for a python item is a mode mismatch that writes nothing', async () => {
    const session = await createSession(identity, ITEM);
    const before = await evidenceSnapshot(identity);
    for (const learnerResponse of ['Hi\n3', '', '   ']) {
      const response = await post(attemptPost, { sessionId: session.id, learnerResponse });
      // '' and whitespace-only never reach the item: the legacy parse is unchanged.
      expect(response.status).toBe(learnerResponse.trim() === '' ? 400 : 422);
      if (response.status === 422) {
        expect(((await response.json()) as { reasonCode: string }).reasonCode).toBe(
          'RESPONSE_MODE_MISMATCH',
        );
      }
    }
    expect(await evidenceSnapshot(identity)).toEqual(before);
  });

  it('a pythonResponse for a legacy item is a mode mismatch that writes nothing', async () => {
    const legacyItem = contentCatalog.find((item) => item.id === 'ratio-language-1')!;
    const session = await createSession(identity, legacyItem as unknown as Record<string, unknown>);
    const before = await evidenceSnapshot(identity);
    const response = await post(attemptPost, { sessionId: session.id, pythonResponse: '2:3' });
    expect(response.status).toBe(422);
    expect(((await response.json()) as { reasonCode: string }).reasonCode).toBe(
      'RESPONSE_MODE_MISMATCH',
    );
    expect(await evidenceSnapshot(identity)).toEqual(before);
  });

  it('pythonResponse is its own strict shape: exact keys, a string, and the payload bound', async () => {
    const session = await createSession(identity, ITEM);
    for (const body of [
      { sessionId: session.id, pythonResponse: 5 },
      { sessionId: session.id, pythonResponse: 'a', extra: 1 },
      { sessionId: 'not-a-uuid', pythonResponse: 'a' },
    ]) {
      expect((await post(attemptPost, body)).status).toBe(400);
    }
  });

  it('a raw payload over the bound is a 400, not an invalid response', async () => {
    const session = await createSession(identity, ITEM);
    const response = await post(attemptPost, {
      sessionId: session.id,
      pythonResponse: 'x'.repeat(5001),
    });
    expect(response.status).toBe(400);
  });

  it('a structured body for a python item is the existing mode-mismatch refusal', async () => {
    const session = await createSession(identity, ITEM);
    const before = await evidenceSnapshot(identity);
    const response = await post(attemptPost, {
      sessionId: session.id,
      structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields: { a: '1' } },
    });
    expect(response.status).toBe(422);
    expect(((await response.json()) as { reasonCode: string }).reasonCode).toBe(
      'RESPONSE_MODE_MISMATCH',
    );
    expect(await evidenceSnapshot(identity)).toEqual(before);
  });

  const extraHouseholds: string[] = [];
  const ownerOf = async (householdId: string) => {
    const profile = await prisma.learnerProfile.findFirstOrThrow({ where: { householdId } });
    return { householdId, learnerProfileId: profile.id };
  };

  const routes = [
    {
      name: 'attempt',
      handler: attemptPost,
      arrange: async () => createSession(identity, ITEM),
    },
    {
      name: 'diagnostic-attempt',
      handler: diagnosticPost,
      // A diagnostic is a one-shot probe for a skill with no evidence yet, so it
      // gets its own household.
      arrange: async () => {
        const fresh = await createSyntheticHousehold();
        extraHouseholds.push(fresh.householdId);
        vi.mocked(requireHouseholdContext).mockResolvedValue(fresh);
        return createSession(fresh, ITEM, 'PLACEMENT');
      },
    },
    {
      name: 'check',
      handler: checkPost,
      arrange: async () => {
        const session = await createSession(identity, ITEM);
        const first = await post(attemptPost, { sessionId: session.id, pythonResponse: 'x' });
        const { attemptId } = (await first.json()) as { attemptId: string };
        await prisma.tutorInteraction.create({
          data: {
            householdId: identity.householdId,
            learnerProfileId: identity.learnerProfileId,
            attemptId,
            redactedExcerpt: 'synthetic',
            moveType: 'hint_1_strategy',
            assistanceLevel: 'SMALL_STRATEGIC_HINT',
            policyVersion: 'synthetic',
          },
        });
        return session;
      },
    },
    {
      name: 'review-attempt',
      handler: reviewPost,
      arrange: async () => {
        await prisma.masteryEstimate.upsert({
          where: {
            learnerProfileId_skillCode_algorithmVersion: {
              learnerProfileId: identity.learnerProfileId,
              skillCode: PY_SKILL,
              algorithmVersion: PHASE_1_MASTERY_VERSION,
            },
          },
          update: { independentDelayedCheck: true },
          create: {
            householdId: identity.householdId,
            learnerProfileId: identity.learnerProfileId,
            skillCode: PY_SKILL,
            estimate: 1,
            confidenceBand: 'MEDIUM',
            algorithmVersion: PHASE_1_MASTERY_VERSION,
            independentDelayedCheck: true,
          },
        });
        return createSession(identity, ITEM, 'REVIEW');
      },
    },
  ] as const;

  for (const route of routes) {
    it(`${route.name}: every invalid response is a typed 422 that writes nothing`, async () => {
      const session = await route.arrange();
      const owner = await ownerOf(session.householdId);
      const before = await evidenceSnapshot(owner);
      for (const [text, reason] of INVALID) {
        const response = await post(route.handler, {
          sessionId: session.id,
          pythonResponse: text,
        });
        expect(response.status, `${route.name} ${reason}`).toBe(422);
        const json = (await response.json()) as Record<string, unknown>;
        expect(Object.keys(json).sort()).toEqual(['error', 'reason', 'reasonCode']);
        expect(json.reasonCode).toBe('INVALID_RESPONSE');
        expect(json.reason).toBe(reason);
        // Neutral wording: nothing about correctness or the expected output.
        expect(JSON.stringify(json)).not.toMatch(/correct|incorrect|Hi|print/i);
      }
      expect(await evidenceSnapshot(owner)).toEqual(before);
    });

    it(`${route.name}: a valid raw response persists normalizedResponse and evaluatorVersion`, async () => {
      const session = await route.arrange();
      const response = await post(route.handler, {
        sessionId: session.id,
        pythonResponse: ' Hi\r\n3\r\n',
      });
      expect(response.status).toBe(200);
      const { attemptId, correctness } = (await response.json()) as {
        attemptId: string;
        correctness: string;
      };
      expect(correctness).toBe('INCORRECT');
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
      expect(row.learnerResponse).toBe(' Hi\r\n3\r\n');
      expect(row.normalizedResponse).toBe(' Hi\n3');
      expect(row.evaluatorVersion).toBe('python-output-1');
    });
  }
});

describe('python_output over the assessment submission route', () => {
  const households: string[] = [];
  const items = [pythonBankItem('synthetic-python-a1'), pythonBankItem('synthetic-python-a2')];

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
      `synthetic-python-key-${Date.now()}-${households.length}`,
    );
    storeHolder.store = storeOf(items);
    vi.mocked(requireHouseholdContext).mockResolvedValue(learner);
    return { learner, ...assignment };
  }

  it('scores the raw string, persists the evaluator version and writes nothing for an invalid one', async () => {
    const ctx = await arrange();
    const body = (ordinal: number, pythonResponse: string) => ({
      assignmentId: ctx.assignmentId,
      sessionId: ctx.sessionId,
      ordinal,
      pythonResponse,
    });
    // Everything an accepted submission could write: attempts, assistance
    // events, learning events, mastery estimates and contributions, shadow
    // decisions, results, run state, lease, session and assignment rows.
    const snapshot = async () => {
      const where = { householdId: ctx.learner.householdId };
      return JSON.parse(
        JSON.stringify({
          attempts: await prisma.attempt.findMany({ where, orderBy: { id: 'asc' } }),
          assistance: await prisma.assistanceEvent.count({ where: { attempt: where } }),
          learning: await prisma.learningEvent.count({ where }),
          mastery: await prisma.masteryEstimate.findMany({ where, orderBy: { id: 'asc' } }),
          contributions: await prisma.masteryContribution.count({
            where: { masteryEstimate: where },
          }),
          shadow: await prisma.shadowDecision.count({ where }),
          results: await prisma.assessmentResult.count({ where }),
          run: await prisma.assessmentRunState.findUniqueOrThrow({
            where: { assignmentId: ctx.assignmentId },
          }),
          lease: await prisma.activeAssessmentLease.findMany({
            where: { assignmentId: ctx.assignmentId },
          }),
          sessions: await prisma.session.findMany({ where, orderBy: { id: 'asc' } }),
          assignment: await prisma.assessmentAssignment.findUniqueOrThrow({
            where: { id: ctx.assignmentId },
          }),
        }),
      ) as unknown;
    };
    const before = await snapshot();
    for (const [text, reason] of INVALID) {
      const response = await post(submissionPost, body(1, text));
      expect(response.status).toBe(422);
      const json = (await response.json()) as Record<string, unknown>;
      expect(json).toMatchObject({ reasonCode: 'INVALID_RESPONSE', reason });
    }
    expect(await snapshot()).toEqual(before);

    const wrong = await post(submissionPost, body(1, '  Hi\r\n3\r\n'));
    expect(wrong.status).toBe(200);
    const { attemptId } = (await wrong.json()) as { attemptId: string };
    const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(row).toMatchObject({
      learnerResponse: '  Hi\r\n3\r\n',
      normalizedResponse: '  Hi\n3',
      evaluatorVersion: 'python-output-1',
      correctness: 'INCORRECT',
      scoringMethod: 'DETERMINISTIC',
    });
  });
});
