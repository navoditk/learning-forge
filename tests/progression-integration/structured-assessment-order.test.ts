import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Wrap the pure evaluator so calls can be counted; behavior is unchanged.
vi.mock('../../src/content/structured-response', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/content/structured-response')>();
  return {
    ...original,
    evaluateStructuredSubmission: vi.fn(original.evaluateStructuredSubmission),
  };
});

import { evaluateStructuredSubmission } from '../../src/content/structured-response';
import {
  abandonAssessmentRun,
  AssessmentSubmissionError,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import { createSyntheticHousehold, SF1, SF3 } from '../phase1/structured-paths-support';
import {
  createSyntheticAssignment,
  storeOf,
  structuredBankItem,
} from './structured-assessment-support';

/**
 * R-1 closure: the item-dependent evaluator (tiers 3/4) is never invoked when
 * a tier 2 condition fails or the run is expired. The tier 1 shape check also
 * uses the evaluator with a private shape-only validator; those calls are
 * excluded from the count.
 */
const ITEMS = [
  structuredBankItem('synthetic-order-a1', SF1),
  structuredBankItem('synthetic-order-a2', SF3),
];
const GOOD = {
  structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields: { a: '45', b: '9' } },
};
const BAD = {
  structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields: { a: 'x', b: '' } },
};
const households: string[] = [];
let counter = 0;

const itemCalls = () =>
  vi
    .mocked(evaluateStructuredSubmission)
    .mock.calls.filter(
      ([validator]) => (validator as { canonicalAnswer: string }).canonicalAnswer !== 'shape',
    );

async function setup() {
  const identity = await createSyntheticHousehold();
  households.push(identity.householdId);
  counter += 1;
  const assignment = await createSyntheticAssignment(
    identity,
    ITEMS,
    `order-key-${Date.now()}-${counter}`,
  );
  return { identity, ...assignment };
}

function submit(ctx: Awaited<ReturnType<typeof setup>>, ordinal: number, body: object) {
  return submitAssessmentItem(
    {
      ...ctx.identity,
      assignmentId: ctx.assignmentId,
      sessionId: ctx.sessionId,
      ordinal,
      ...body,
    } as never,
    storeOf(ITEMS),
  );
}

async function codeOf(action: Promise<unknown>) {
  const error = await action.then(
    () => undefined,
    (caught: unknown) => caught,
  );
  return error instanceof AssessmentSubmissionError ? error.code : error;
}

describe('R-1: tier 2 preflight precedes item-dependent evaluation', () => {
  beforeEach(() => vi.mocked(evaluateStructuredSubmission).mockClear());
  afterAll(async () => {
    for (const householdId of households) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  for (const [label, body] of [
    ['well-formed', GOOD],
    ['malformed', BAD],
  ] as const) {
    it(`${label} body: ended, terminal, duplicate and future-item requests never reach the evaluator`, async () => {
      const ended = await setup();
      await prisma.session.update({
        where: { id: ended.sessionId },
        data: { endedAt: new Date() },
      });
      expect(await codeOf(submit(ended, 1, body))).toBe('SESSION_ENDED');

      const terminal = await setup();
      await abandonAssessmentRun({ ...terminal.identity, assignmentId: terminal.assignmentId });
      await prisma.session.update({ where: { id: terminal.sessionId }, data: { endedAt: null } });
      expect(await codeOf(submit(terminal, 1, body))).toBe('RUN_NOT_ACTIVE');

      const dup = await setup();
      await submit(dup, 1, GOOD);
      vi.mocked(evaluateStructuredSubmission).mockClear();
      expect(await codeOf(submit(dup, 1, body))).toBe('DUPLICATE_ITEM_SUBMISSION');

      const future = await setup();
      expect(await codeOf(submit(future, 2, body))).toBe('NOT_CURRENT_ITEM');

      expect(itemCalls()).toHaveLength(0);
    });

    it(`${label} body: an expired run records the existing expiry without evaluating the response`, async () => {
      const ctx = await setup();
      await prisma.assessmentRunState.update({
        where: { assignmentId: ctx.assignmentId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      expect(await codeOf(submit(ctx, 1, body))).toBe('ASSESSMENT_EXPIRED');
      expect(itemCalls()).toHaveLength(0);
      expect(
        (
          await prisma.assessmentRunState.findUniqueOrThrow({
            where: { assignmentId: ctx.assignmentId },
          })
        ).status,
      ).toBe('EXPIRED');
      expect(await prisma.attempt.count({ where: { sessionId: ctx.sessionId } })).toBe(0);
    });
  }

  it('an authorized request evaluates exactly once, for success and for refusal', async () => {
    const ctx = await setup();
    await expect(submit(ctx, 1, BAD)).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' });
    expect(itemCalls()).toHaveLength(1);
    vi.mocked(evaluateStructuredSubmission).mockClear();
    await expect(submit(ctx, 1, GOOD)).resolves.toMatchObject({ expired: false });
    expect(itemCalls()).toHaveLength(1);
    expect(await prisma.attempt.count({ where: { sessionId: ctx.sessionId } })).toBe(1);
  });
});
