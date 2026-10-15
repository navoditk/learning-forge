import { afterAll, describe, expect, it } from 'vitest';

import {
  abandonAssessmentRun,
  AssessmentSubmissionError,
  getCurrentAssessmentItem,
  StructuredResponseRefusedError,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import {
  projectAssessmentAssignmentResponse,
  projectAssessmentSubmissionResponse,
} from '../../src/progression/assessment-response';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import {
  createSyntheticHousehold,
  expectNoPrivateLeak,
  SENTINELS,
  SF1,
  SF3,
  withSelector,
} from '../phase1/structured-paths-support';
import {
  createSyntheticAssignment,
  legacyBankItem,
  storeOf,
  structuredBankItem,
} from './structured-assessment-support';

/**
 * RAT-SCORE-IMPL-PATHS, assessment paths (contract 3.3a, 3.6, 4, 5.5). Synthetic
 * in-memory banks and synthetic households only. Private-package storage and
 * any learner assessment UI are outside this packet and are not exercised.
 */

const S1 = structuredBankItem('synthetic-structured-a1', SF1);
const S2 = structuredBankItem('synthetic-structured-a2', SF3);
const L3 = legacyBankItem('synthetic-legacy-a3');
const ITEMS = [S1, S2, L3];
const GOOD_SF1 = { a: '45', b: '9' };
const structured = (fields: Record<string, unknown>, mode = 'structured-fields', v = '1') => ({
  structuredResponse: { mode, modeVersion: v, fields },
});

const households: string[] = [];
let counter = 0;

async function setup(items = ITEMS) {
  const identity = await createSyntheticHousehold();
  households.push(identity.householdId);
  counter += 1;
  const assignment = await createSyntheticAssignment(
    identity,
    items,
    `synthetic-structured-key-${Date.now()}-${counter}`,
  );
  return { identity, ...assignment, store: storeOf(items) };
}

function submit(
  ctx: Awaited<ReturnType<typeof setup>>,
  ordinal: number,
  body: Record<string, unknown>,
  database?: Parameters<typeof submitAssessmentItem>[2],
) {
  return submitAssessmentItem(
    {
      householdId: ctx.identity.householdId,
      learnerProfileId: ctx.identity.learnerProfileId,
      assignmentId: ctx.assignmentId,
      sessionId: ctx.sessionId,
      ordinal,
      ...body,
    } as never,
    ctx.store,
    database,
  );
}

async function runState(ctx: { assignmentId: string }) {
  return JSON.parse(
    JSON.stringify(
      await prisma.assessmentRunState.findUniqueOrThrow({
        where: { assignmentId: ctx.assignmentId },
      }),
    ),
  ) as Record<string, unknown>;
}

async function writtenRows(ctx: Awaited<ReturnType<typeof setup>>) {
  const where = { householdId: ctx.identity.householdId };
  return JSON.parse(
    JSON.stringify({
      attempts: await prisma.attempt.findMany({ where, orderBy: { id: 'asc' } }),
      assistance: await prisma.assistanceEvent.count({ where: { attempt: where } }),
      learning: await prisma.learningEvent.count({ where }),
      mastery: await prisma.masteryEstimate.count({ where }),
      results: await prisma.assessmentResult.count({ where }),
      run: await runState(ctx),
      session: await prisma.session.findUniqueOrThrow({ where: { id: ctx.sessionId } }),
    }),
  ) as unknown;
}

async function codeOf(action: Promise<unknown>) {
  const error = await action.then(
    () => undefined,
    (caught: unknown) => caught,
  );
  if (error instanceof AssessmentSubmissionError) return { kind: 'assessment', code: error.code };
  if (error instanceof StructuredResponseRefusedError) {
    return { kind: 'refusal', code: error.code, fieldErrors: error.fieldErrors };
  }
  return { kind: 'other', error };
}

describe('structured assessment submission paths', () => {
  afterAll(async () => {
    for (const householdId of households) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  describe('PA-3 persistence and the unchanged response projection', () => {
    it('stores the S-A envelope in the existing columns and projects item-level correctness only', async () => {
      const ctx = await setup();
      const result = await submit(ctx, 1, structured({ b: '9.0', a: '90/2' }));
      const row = await prisma.attempt.findUniqueOrThrow({
        where: { id: (result as { attemptId: string }).attemptId },
      });
      expect(row.learnerResponse).toBe(
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"90/2"},{"key":"b","value":"9.0"}]}',
      );
      expect(row.normalizedResponse).toBe(
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"45"},{"key":"b","value":"9"}]}',
      );
      expect(row).toMatchObject({
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        contentKey: S1.id,
        contentVersion: '1.0.0',
        context: 'LESSON_ASSESSMENT',
        highestAssistance: 'INDEPENDENT',
      });
      const state = await runState(ctx);
      expect(state).toMatchObject({
        status: 'IN_PROGRESS',
        submittedOrdinals: [1],
        currentOrdinal: 2,
      });
      // PA-4e: the in-progress projection carries no values or per-field correctness.
      const projected = projectAssessmentSubmissionResponse(result as never);
      expect(Object.keys(projected).sort()).toEqual([
        'assignmentId',
        'attemptId',
        'expired',
        'result',
        'sessionId',
        'status',
      ]);
      expect(JSON.stringify(projected)).not.toMatch(/responseSpec|fieldErrors|"a"|"b"|structured/);
    });

    it('records INCORRECT for a well-formed wrong answer and a legacy item still uses the matcher', async () => {
      const ctx = await setup();
      const wrong = await submit(ctx, 1, structured({ a: '9', b: '45' }));
      expect(
        (
          await prisma.attempt.findUniqueOrThrow({
            where: { id: (wrong as { attemptId: string }).attemptId },
          })
        ).correctness,
      ).toBe('INCORRECT');
      await submit(ctx, 2, structured({ q: 'y', n: '12' }));
      const legacy = await submit(ctx, 3, { learnerResponse: ' 2 : 3 ' });
      const row = await prisma.attempt.findUniqueOrThrow({
        where: { id: (legacy as { attemptId: string }).attemptId },
      });
      expect(row.learnerResponse).toBe(' 2 : 3 ');
      expect(row.scoringMethod).toBe('DETERMINISTIC');
    });

    it('PA-4e: the completed-assignment projection is item-level only', async () => {
      const ctx = await setup([S1]);
      const done = await submit(ctx, 1, structured(GOOD_SF1));
      const projected = projectAssessmentSubmissionResponse(done as never) as {
        result: { itemResults: Record<string, unknown>[] };
      };
      expect(projected.result.itemResults).toHaveLength(1);
      expect(Object.keys(projected.result.itemResults[0]).sort()).toEqual([
        'correctness',
        'maxAssistance',
        'ordinal',
      ]);
      const text = JSON.stringify(projected);
      for (const banned of [
        'responseSpec',
        'fieldErrors',
        'learnerResponse',
        'structured',
        'Quantity',
      ]) {
        expect(text).not.toContain(banned);
      }
    });
  });

  describe('PA-2 refusals consume nothing', () => {
    it('every tier 1/3/4 refusal leaves attempts, run state and session unchanged, then the ordinal is still submittable', async () => {
      const ctx = await setup();
      const before = await writtenRows(ctx);
      const refusals: [Record<string, unknown>, string, unknown?][] = [
        [
          structured({ a: 'not 45', b: '' }),
          'MALFORMED_RESPONSE',
          [
            { key: 'a', code: 'NOT_A_NUMBER' },
            { key: 'b', code: 'REQUIRED' },
          ],
        ],
        [
          structured({ a: '45', b: '9', c: '1' }),
          'MALFORMED_RESPONSE',
          [{ key: 'c', code: 'UNKNOWN_FIELD' }],
        ],
        [structured({ a: '45' }), 'MALFORMED_RESPONSE', [{ key: 'b', code: 'MISSING_FIELD' }]],
        [structured(GOOD_SF1, 'structured-fields', '2'), 'UNSUPPORTED_RESPONSE_MODE'],
        [structured(GOOD_SF1, 'structured'), 'UNSUPPORTED_RESPONSE_MODE'],
        [{ learnerResponse: '45; 9' }, 'RESPONSE_MODE_MISMATCH'],
        [{ learnerResponse: '45', ...structured(GOOD_SF1) }, 'INVALID_REQUEST'],
        [{}, 'INVALID_REQUEST'],
        [structured({ a: 45, b: '9' }), 'INVALID_REQUEST'],
      ];
      for (const [body, code, fieldErrors] of refusals) {
        expect(await codeOf(submit(ctx, 1, body))).toEqual({ kind: 'refusal', code, fieldErrors });
      }
      expect(await writtenRows(ctx)).toEqual(before);
      const state = await runState(ctx);
      expect(state).toMatchObject({ status: 'PENDING', submittedOrdinals: [], startedAt: null });
      expect((await submit(ctx, 1, structured(GOOD_SF1))) as object).toMatchObject({
        expired: false,
      });
      expect(await prisma.attempt.count({ where: { sessionId: ctx.sessionId } })).toBe(1);
    });

    it('a structured body for a legacy item is a mode mismatch with no writes', async () => {
      const ctx = await setup([L3]);
      const before = await writtenRows(ctx);
      expect(await codeOf(submit(ctx, 1, structured(GOOD_SF1)))).toMatchObject({
        kind: 'refusal',
        code: 'RESPONSE_MODE_MISMATCH',
      });
      expect(await writtenRows(ctx)).toEqual(before);
    });
  });

  describe('NOT_CURRENT_ITEM narrows structured submissions only', () => {
    it('a future structured ordinal is refused (even with a malformed body) and writes nothing', async () => {
      const ctx = await setup();
      const before = await writtenRows(ctx);
      for (const body of [structured({ q: 'y', n: '12' }), structured({ q: 'nope', n: '' })]) {
        expect(await codeOf(submit(ctx, 2, body))).toEqual({
          kind: 'assessment',
          code: 'NOT_CURRENT_ITEM',
        });
      }
      expect(await writtenRows(ctx)).toEqual(before);
      // Once ordinal 1 is submitted, ordinal 2 becomes current.
      await submit(ctx, 1, structured(GOOD_SF1));
      expect((await submit(ctx, 2, structured({ q: 'y', n: '12' }))) as object).toMatchObject({
        expired: false,
      });
    });

    it("a legacy item submitted out of order keeps today's behavior", async () => {
      const ctx = await setup();
      expect((await submit(ctx, 3, { learnerResponse: '2:3' })) as object).toMatchObject({
        expired: false,
      });
      expect(await runState(ctx)).toMatchObject({ submittedOrdinals: [3] });
    });

    it('an unselected ordinal is VERSION_MISMATCH even with a malformed structured body', async () => {
      const ctx = await setup();
      expect(await codeOf(submit(ctx, 9, structured({ a: 'x' })))).toEqual({
        kind: 'assessment',
        code: 'VERSION_MISMATCH',
      });
    });
  });

  describe('PA-11 authority, lifecycle and duplicates win over answer/mode/field errors', () => {
    const malformed = structured({ a: 'not 45', b: '' }, 'wrong-mode');

    it("another household's or learner's assignment is ASSESSMENT_NOT_FOUND", async () => {
      const ctx = await setup();
      const other = await createSyntheticHousehold();
      households.push(other.householdId);
      for (const identity of [
        other,
        { householdId: ctx.identity.householdId, learnerProfileId: other.learnerProfileId },
      ]) {
        const result = await codeOf(
          submitAssessmentItem(
            {
              ...identity,
              assignmentId: ctx.assignmentId,
              sessionId: ctx.sessionId,
              ordinal: 1,
              ...malformed,
            } as never,
            ctx.store,
          ),
        );
        expect(result).toEqual({ kind: 'assessment', code: 'ASSESSMENT_NOT_FOUND' });
      }
    });

    it('a session of another assignment is ASSESSMENT_NOT_FOUND', async () => {
      const ctx = await setup();
      const second = await setup();
      const result = await codeOf(
        submitAssessmentItem(
          {
            ...ctx.identity,
            assignmentId: ctx.assignmentId,
            sessionId: second.sessionId,
            ordinal: 1,
            ...malformed,
          } as never,
          ctx.store,
        ),
      );
      expect(result).toEqual({ kind: 'assessment', code: 'ASSESSMENT_NOT_FOUND' });
    });

    it('ended session, kind mismatch and terminal run keep their existing codes', async () => {
      const ended = await setup();
      await prisma.session.update({
        where: { id: ended.sessionId },
        data: { endedAt: new Date() },
      });
      expect(await codeOf(submit(ended, 1, malformed))).toEqual({
        kind: 'assessment',
        code: 'SESSION_ENDED',
      });
      const mismatched = await setup();
      await prisma.session.update({
        where: { id: mismatched.sessionId },
        data: { activityKind: 'PRACTICE' },
      });
      expect(await codeOf(submit(mismatched, 1, malformed))).toEqual({
        kind: 'assessment',
        code: 'SESSION_KIND_MISMATCH',
      });
      const terminal = await setup();
      await abandonAssessmentRun({ ...terminal.identity, assignmentId: terminal.assignmentId });
      // Abandon ends the session; restore it so the terminal run is the failing tier.
      await prisma.session.update({ where: { id: terminal.sessionId }, data: { endedAt: null } });
      expect(await codeOf(submit(terminal, 1, malformed))).toEqual({
        kind: 'assessment',
        code: 'RUN_NOT_ACTIVE',
      });
    });

    it('an expired run takes the existing expiry path for a malformed structured body too', async () => {
      const results = [];
      for (const body of [malformed, { learnerResponse: '2:3' }]) {
        const ctx = await setup();
        await prisma.assessmentRunState.update({
          where: { assignmentId: ctx.assignmentId },
          data: { expiresAt: new Date(Date.now() - 1000) },
        });
        const outcome = await codeOf(submit(ctx, 1, body));
        const state = await runState(ctx);
        results.push({ outcome, status: state.status });
        expect(await prisma.attempt.count({ where: { sessionId: ctx.sessionId } })).toBe(0);
        expect(
          (await prisma.session.findUniqueOrThrow({ where: { id: ctx.sessionId } })).endedAt,
        ).not.toBeNull();
      }
      expect(results[0]).toEqual({
        outcome: { kind: 'assessment', code: 'ASSESSMENT_EXPIRED' },
        status: 'EXPIRED',
      });
      // Identical to what a legacy-bodied request has always received.
      expect(results[1]).toEqual(results[0]);
    });

    it('a submitted ordinal is DUPLICATE_ITEM_SUBMISSION and a future ordinal NOT_CURRENT_ITEM', async () => {
      const ctx = await setup();
      await submit(ctx, 1, structured(GOOD_SF1));
      const before = await writtenRows(ctx);
      expect(await codeOf(submit(ctx, 1, malformed))).toEqual({
        kind: 'assessment',
        code: 'DUPLICATE_ITEM_SUBMISSION',
      });
      expect(await codeOf(submit(ctx, 1, structured(GOOD_SF1)))).toEqual({
        kind: 'assessment',
        code: 'DUPLICATE_ITEM_SUBMISSION',
      });
      expect(await writtenRows(ctx)).toEqual(before);
    });
  });

  describe('PA-12 transaction recheck', () => {
    it('a concurrent commit of the same ordinal after the read-only checks yields DUPLICATE and no second attempt', async () => {
      const ctx = await setup();
      // The wrapper commits a competing submission of ordinal 1 immediately
      // before the real transaction starts, i.e. after every pre-transaction
      // read of the loser has passed.
      let raced = false;
      const racing = new Proxy(prisma, {
        get(target, property, receiver) {
          if (property === '$transaction') {
            return async (...args: unknown[]) => {
              if (!raced) {
                raced = true;
                await submit(ctx, 1, structured(GOOD_SF1));
              }
              return (target.$transaction as (...inner: unknown[]) => unknown)(...args);
            };
          }
          return Reflect.get(target, property, receiver) as unknown;
        },
      });
      const loser = await codeOf(submit(ctx, 1, structured({ a: '9', b: '45' }), racing));
      expect(loser).toEqual({ kind: 'assessment', code: 'DUPLICATE_ITEM_SUBMISSION' });
      const attempts = await prisma.attempt.findMany({ where: { sessionId: ctx.sessionId } });
      expect(attempts).toHaveLength(1);
      expect(attempts[0].correctness).toBe('CORRECT');
      expect(await runState(ctx)).toMatchObject({ submittedOrdinals: [1] });
    });
  });

  describe('PA-4c current-item projection', () => {
    it('serves the exact allowlist, redacts private data and carries the text alternative', async () => {
      const ctx = await setup();
      const first = await getCurrentAssessmentItem(
        { ...ctx.identity, assignmentId: ctx.assignmentId, sessionId: ctx.sessionId },
        ctx.store,
      );
      expect(Object.keys(first.item)).toEqual([
        'title',
        'prompt',
        'accessibilityNotes',
        'accessibleAlternative',
        'figure',
        'responseSpec',
      ]);
      expect(first.item.accessibleAlternative).toBe(S1.accessibleAlternative);
      expect(first.item.responseSpec).toEqual({
        mode: 'structured-fields',
        modeVersion: '1',
        fields: [
          {
            key: 'a',
            kind: 'number',
            label: 'Quantity A',
            unitLabel: 'units',
            representations: ['integer', 'decimal', 'fraction', 'mixed-number'],
            simplestForm: false,
          },
          {
            key: 'b',
            kind: 'number',
            label: 'Quantity B',
            unitLabel: 'units per group',
            representations: ['integer', 'decimal', 'fraction', 'mixed-number'],
            simplestForm: false,
          },
        ],
      });
      expect(() => expectNoPrivateLeak(first, SF1)).not.toThrow();
      for (const sentinel of Object.values(SENTINELS)) {
        expect(JSON.stringify(first)).not.toContain(sentinel);
      }
      await submit(ctx, 1, structured(GOOD_SF1));
      const second = await getCurrentAssessmentItem(
        { ...ctx.identity, assignmentId: ctx.assignmentId, sessionId: ctx.sessionId },
        ctx.store,
      );
      expect(Object.keys(second.item.responseSpec!.fields[0])).toEqual([
        'key',
        'kind',
        'label',
        'options',
      ]);
      expect(() => expectNoPrivateLeak(second, SF3)).not.toThrow();
    });

    it('selector invariance: a changed correct option leaves the served projection identical', async () => {
      const left = await setup([structuredBankItem('synthetic-structured-inv', SF3)]);
      const right = await setup([
        structuredBankItem(
          'synthetic-structured-inv',
          withSelector(SF3, 'q', { correctOptionId: 'x' }),
        ),
      ]);
      const read = async (ctx: Awaited<ReturnType<typeof setup>>) => {
        const current = await getCurrentAssessmentItem(
          { ...ctx.identity, assignmentId: ctx.assignmentId, sessionId: ctx.sessionId },
          ctx.store,
        );
        return JSON.stringify(current.item);
      };
      expect(await read(left)).toBe(await read(right));
    });

    it("a legacy current item has no responseSpec (today's shape)", async () => {
      const ctx = await setup([L3]);
      const current = await getCurrentAssessmentItem(
        { ...ctx.identity, assignmentId: ctx.assignmentId, sessionId: ctx.sessionId },
        ctx.store,
      );
      expect(Object.keys(current.item)).toEqual([
        'title',
        'prompt',
        'accessibilityNotes',
        'accessibleAlternative',
        'figure',
      ]);
    });

    it('unauthorized, ended, terminal and expired requests keep the existing error and no responseSpec', async () => {
      const base = await setup();
      const other = await createSyntheticHousehold();
      households.push(other.householdId);
      const attempt = async (
        ctx: Awaited<ReturnType<typeof setup>>,
        identity: { householdId: string; learnerProfileId: string } = ctx.identity,
      ) =>
        codeOf(
          getCurrentAssessmentItem(
            { ...identity, assignmentId: ctx.assignmentId, sessionId: ctx.sessionId },
            ctx.store,
          ),
        );
      expect(await attempt(base, other)).toEqual({
        kind: 'assessment',
        code: 'ASSESSMENT_NOT_FOUND',
      });
      const ended = await setup();
      await prisma.session.update({
        where: { id: ended.sessionId },
        data: { endedAt: new Date() },
      });
      expect(await attempt(ended)).toEqual({ kind: 'assessment', code: 'SESSION_ENDED' });
      const terminal = await setup();
      await abandonAssessmentRun({ ...terminal.identity, assignmentId: terminal.assignmentId });
      await prisma.session.update({ where: { id: terminal.sessionId }, data: { endedAt: null } });
      expect(await attempt(terminal)).toEqual({ kind: 'assessment', code: 'RUN_NOT_ACTIVE' });
      const expired = await setup();
      await prisma.assessmentRunState.update({
        where: { assignmentId: expired.assignmentId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      expect(await attempt(expired)).toEqual({ kind: 'assessment', code: 'ASSESSMENT_EXPIRED' });
    });

    it('PA-4d: the assignment projection is unchanged and carries no item identities or responseSpec', async () => {
      const ctx = await setup();
      const projected = projectAssessmentAssignmentResponse({
        assignment: (await prisma.assessmentAssignment.findUniqueOrThrow({
          where: { id: ctx.assignmentId },
          include: { runState: true, lease: true, sessions: true },
        })) as never,
        replayed: false,
      });
      const text = JSON.stringify(projected);
      for (const banned of ['responseSpec', 'selectedItems', S1.id, S2.id, L3.id, 'Quantity']) {
        expect(text).not.toContain(banned);
      }
    });
  });
});
