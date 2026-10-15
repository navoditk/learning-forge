import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import {
  getTutorContext,
  PHASE_1_MASTERY_VERSION,
  parsePhase1AttemptBody,
  recordAttempt,
  recordDiagnosticAttempt,
  recordIndependentCheck,
  recordReviewAttempt,
  recordTutorResponse,
  startSession,
  type HouseholdIdentity,
} from '../../src/phase1/service';
import { StructuredResponseRefusedError } from '../../src/progression/assessment-submission';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';
import {
  archiveSyntheticItem,
  createSession,
  createSyntheticHousehold,
  evidenceSnapshot,
  expectNoPrivateLeak,
  numberField,
  removeArchivedItems,
  SENTINELS,
  SF1,
  SF3,
  syntheticItem,
  validatorOf,
  withSelector,
} from './structured-paths-support';

/**
 * RAT-SCORE-IMPL-PATHS, Phase 1 practice paths (contract 3.3a, 3.5, 4, 5.5).
 * Synthetic households and synthetic structured items only. Structured items
 * are served through the ContentArchive (historical resolution, the same
 * mechanism that pins superseded versions) or, for the session projection,
 * through an in-process catalog entry that is removed afterwards. The default
 * catalog registers no structured item and none is added to any file.
 */

const ITEM_IDS = [
  'synthetic-structured-paths-sf1',
  'synthetic-structured-paths-sf3',
  'synthetic-structured-paths-sf3x',
  'synthetic-structured-paths-sent',
];
const SF1_ITEM = syntheticItem(ITEM_IDS[0], SF1);
const SF3_ITEM = syntheticItem(ITEM_IDS[1], SF3);
const SF3_X = withSelector(SF3, 'q', { correctOptionId: 'x' });
const SF3X_ITEM = syntheticItem(ITEM_IDS[2], SF3_X);
// Sentinel number variant (contract 5.5): renderings occur nowhere in public text.
const SENT_VALIDATOR = withSelector(withSelector(SF1, 'a', { correctValue: '8191/64' }), 'b', {
  correctValue: '7919',
});
const SENT_ITEM = syntheticItem(ITEM_IDS[3], SENT_VALIDATOR);
const SENT_RENDERINGS = ['127.984375', '8191/64', '127 63/64', '7919'];

const GOOD_SF1 = { a: '45', b: '9' };
const structured = (fields: Record<string, unknown>, mode = 'structured-fields', v = '1') => ({
  structuredResponse: { mode, modeVersion: v, fields },
});

async function expectRefusal(
  action: Promise<unknown>,
  code: string,
  fieldErrors?: { key: string; code: string }[],
) {
  const error = await action.then(
    () => undefined,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(StructuredResponseRefusedError);
  const refusal = error as StructuredResponseRefusedError;
  expect(refusal.code).toBe(code);
  expect(refusal.fieldErrors).toEqual(fieldErrors);
}

async function cleanup(identity: HouseholdIdentity) {
  await deleteHouseholdData(prisma, identity.householdId);
}

describe('structured practice paths', () => {
  const households: HouseholdIdentity[] = [];
  const fresh = async () => {
    const identity = await createSyntheticHousehold();
    households.push(identity);
    return identity;
  };

  const injected: unknown[] = [];

  beforeAll(async () => {
    for (const item of [SF1_ITEM, SF3_ITEM, SF3X_ITEM, SENT_ITEM]) {
      await archiveSyntheticItem(item);
      // In-process catalog entry (removed in afterAll) so session start and the
      // non-enforcing shadow write resolve the item exactly as for real content.
      (contentCatalog as unknown as unknown[]).push(item);
      (servableContentCatalog as unknown as unknown[]).push(item);
      injected.push(item);
    }
  });

  afterAll(async () => {
    for (const list of [contentCatalog, servableContentCatalog] as unknown as unknown[][]) {
      for (const item of injected) {
        const index = list.indexOf(item);
        if (index >= 0) list.splice(index, 1);
      }
    }
    for (const identity of households) await cleanup(identity);
    await removeArchivedItems(ITEM_IDS);
    await prisma.$disconnect();
  });

  describe('PA-3 persistence and scoring', () => {
    it('stores the exact S-A envelope (raw trimmed and normalized) and DETERMINISTIC method', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      const result = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ b: '9.0', a: ' 90/2 ' }),
      });
      expect(result).toMatchObject({ correctness: 'CORRECT', evidenceWeight: 1 });
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: result.attemptId } });
      // Fields in item order, raw values trimmed, whatever the request key order.
      expect(row.learnerResponse).toBe(
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"90/2"},{"key":"b","value":"9.0"}]}',
      );
      expect(row.normalizedResponse).toBe(
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"45"},{"key":"b","value":"9"}]}',
      );
      expect(row).toMatchObject({
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        contentKey: SF1_ITEM.id,
        contentVersion: 'structured-1',
        context: 'PRACTICE',
        highestAssistance: 'INDEPENDENT',
      });
      expect(await prisma.masteryContribution.count({ where: { attemptId: row.id } })).toBe(1);
      expect(
        await prisma.shadowDecision.count({ where: { householdId: identity.householdId } }),
      ).toBe(1);
      expect(
        await prisma.learningEvent.count({ where: { householdId: identity.householdId } }),
      ).toBe(1);
    });

    it('records INCORRECT for a well-formed wrong value with zero evidence weight', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      const result = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ a: '9', b: '45' }),
      });
      expect(result).toMatchObject({ correctness: 'INCORRECT', evidenceWeight: 0 });
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: result.attemptId } });
      expect(row.correctness).toBe('INCORRECT');
      expect(row.scoringMethod).toBe('DETERMINISTIC');
    });

    it('stores a choice option id and the normalized lowest-terms value', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF3_ITEM);
      const result = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ q: 'y', n: '12' }),
      });
      expect(result.correctness).toBe('CORRECT');
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: result.attemptId } });
      expect(row.learnerResponse).toBe(
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"q","value":"y"},{"key":"n","value":"12"}]}',
      );
    });

    it('legacy items still score through the legacy matcher, byte-for-byte as before', async () => {
      const identity = await fresh();
      const session = await startSession(identity, { contentId: 'ratio-language-1' });
      const result = await recordAttempt(identity, {
        sessionId: session.sessionId,
        learnerResponse: ' 2:3. ',
      });
      expect(result.correctness).toBe('CORRECT');
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: result.attemptId } });
      expect(row.learnerResponse).toBe(' 2:3. ');
      expect(row.normalizedResponse).toBe('2:3');
      expect(row.scoringMethod).toBe('DETERMINISTIC');
    });

    it('a legacy item row that looks like an envelope is still free text scored by the matcher', async () => {
      const identity = await fresh();
      const session = await startSession(identity, { contentId: 'ratio-language-1' });
      const lookalike = '{"mode":"structured-fields","modeVersion":"1","fields":[]}';
      const result = await recordAttempt(identity, {
        sessionId: session.sessionId,
        learnerResponse: lookalike,
      });
      expect(result.correctness).toBe('INCORRECT');
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: result.attemptId } });
      expect(row.learnerResponse).toBe(lookalike);
    });
  });

  describe('PA-1 refusals write nothing (all four attempt paths)', () => {
    const refusalBodies: {
      name: string;
      body: Record<string, unknown>;
      code: string;
      fieldErrors?: { key: string; code: string }[];
    }[] = [
      {
        name: 'field error',
        body: structured({ a: 'not 45', b: '' }),
        code: 'MALFORMED_RESPONSE',
        fieldErrors: [
          { key: 'a', code: 'NOT_A_NUMBER' },
          { key: 'b', code: 'REQUIRED' },
        ],
      },
      {
        name: 'unknown mode version',
        body: structured(GOOD_SF1, 'structured-fields', '2'),
        code: 'UNSUPPORTED_RESPONSE_MODE',
      },
      {
        name: 'unknown mode',
        body: structured(GOOD_SF1, 'structured'),
        code: 'UNSUPPORTED_RESPONSE_MODE',
      },
      {
        name: 'legacy string for a structured item',
        body: { learnerResponse: '45; 9' },
        code: 'RESPONSE_MODE_MISMATCH',
      },
      {
        name: 'both response fields',
        body: { learnerResponse: '45', ...structured(GOOD_SF1) },
        code: 'INVALID_REQUEST',
      },
      { name: 'neither response field', body: {}, code: 'INVALID_REQUEST' },
      {
        name: 'unknown structured key',
        body: {
          structuredResponse: {
            mode: 'structured-fields',
            modeVersion: '1',
            fields: GOOD_SF1,
            extra: 1,
          },
        },
        code: 'INVALID_REQUEST',
      },
      {
        name: 'non-string field value',
        body: structured({ a: 45, b: '9' }),
        code: 'INVALID_REQUEST',
      },
      {
        name: 'array field value',
        body: structured({ a: ['45'], b: '9' }),
        code: 'INVALID_REQUEST',
      },
    ];

    it('recordAttempt: every refusal leaves every evidence table and the session unchanged', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      const before = await evidenceSnapshot(identity);
      for (const { body, code, fieldErrors } of refusalBodies) {
        await expectRefusal(
          recordAttempt(identity, { sessionId: session.id, ...body } as never),
          code,
          fieldErrors,
        );
      }
      expect(await evidenceSnapshot(identity)).toEqual(before);
      expect(
        (await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).endedAt,
      ).toBeNull();
      // The same session is then usable: a valid body scores.
      const ok = await recordAttempt(identity, { sessionId: session.id, ...structured(GOOD_SF1) });
      expect(ok.correctness).toBe('CORRECT');
      expect(await prisma.attempt.count({ where: { sessionId: session.id } })).toBe(1);
      // Non-vacuous: the success path does write the rows the refusals must not.
      const after = (await evidenceSnapshot(identity)) as { shadow: number; learning: number };
      expect(after.shadow).toBe(1);
      expect(after.learning).toBe(1);
    });

    it('a legacy-item session refuses a structured body as a mode mismatch with no writes', async () => {
      const identity = await fresh();
      const session = await startSession(identity, { contentId: 'ratio-language-1' });
      const before = await evidenceSnapshot(identity);
      await expectRefusal(
        recordAttempt(identity, { sessionId: session.sessionId, ...structured(GOOD_SF1) }),
        'RESPONSE_MODE_MISMATCH',
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
    });

    it('recordDiagnosticAttempt: a refusal does not write or end the session', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM, 'PLACEMENT');
      const before = await evidenceSnapshot(identity);
      await expectRefusal(
        recordDiagnosticAttempt(identity, {
          sessionId: session.id,
          ...structured({ a: '', b: '' }),
        }),
        'MALFORMED_RESPONSE',
        [
          { key: 'a', code: 'REQUIRED' },
          { key: 'b', code: 'REQUIRED' },
        ],
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      expect(
        (await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).endedAt,
      ).toBeNull();
      const ok = await recordDiagnosticAttempt(identity, {
        sessionId: session.id,
        ...structured(GOOD_SF1),
      });
      expect(ok.correctness).toBe('CORRECT');
      expect(
        (await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).endedAt,
      ).not.toBeNull();
    });

    it('recordIndependentCheck: a refusal after tutoring writes nothing and does not end the session', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      const first = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ a: '1', b: '1' }),
      });
      await prisma.tutorInteraction.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          attemptId: first.attemptId,
          redactedExcerpt: 'synthetic',
          moveType: 'hint_1_strategy',
          assistanceLevel: 'SMALL_STRATEGIC_HINT',
          policyVersion: 'synthetic',
        },
      });
      const before = await evidenceSnapshot(identity);
      await expectRefusal(
        recordIndependentCheck(identity, {
          sessionId: session.id,
          ...structured({ a: '45 units', b: '9' }),
        }),
        'MALFORMED_RESPONSE',
        [{ key: 'a', code: 'NOT_A_NUMBER' }],
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      const ok = await recordIndependentCheck(identity, {
        sessionId: session.id,
        ...structured(GOOD_SF1),
      });
      expect(ok.correctness).toBe('CORRECT');
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: ok.attemptId } });
      expect(row).toMatchObject({ context: 'MASTERY_CHECK', scoringMethod: 'DETERMINISTIC' });
      expect(
        (await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).endedAt,
      ).not.toBeNull();
    });

    it('recordReviewAttempt: a refusal writes nothing, ends nothing and applies no lapse', async () => {
      const identity = await fresh();
      await prisma.masteryEstimate.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillCode: 'ratio-language',
          estimate: 1,
          confidenceBand: 'MEDIUM',
          algorithmVersion: PHASE_1_MASTERY_VERSION,
          independentDelayedCheck: true,
        },
      });
      const session = await createSession(identity, SF1_ITEM, 'REVIEW');
      const before = await evidenceSnapshot(identity);
      await expectRefusal(
        recordReviewAttempt(identity, { sessionId: session.id, learnerResponse: '45; 9' }),
        'RESPONSE_MODE_MISMATCH',
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      expect(
        (await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).endedAt,
      ).toBeNull();
      const ok = await recordReviewAttempt(identity, {
        sessionId: session.id,
        ...structured({ a: '1', b: '1' }),
      });
      expect(ok.correctness).toBe('INCORRECT');
    });
  });

  describe('PA-11 authority and lifecycle errors win over format errors (practice)', () => {
    const malformed = structured({ a: 'not 45', b: '' }, 'wrong-mode');

    it("another learner's session is the existing not-found error, never a field error", async () => {
      const owner = await fresh();
      const other = await fresh();
      const session = await createSession(owner, SF1_ITEM);
      await expect(recordAttempt(other, { sessionId: session.id, ...malformed })).rejects.toThrow(
        'Session not found',
      );
      await expect(
        recordAttempt(
          { ...owner, learnerProfileId: other.learnerProfileId },
          {
            sessionId: session.id,
            ...malformed,
          },
        ),
      ).rejects.toThrow('Session not found');
    });

    it('an unresolvable pinned version is the existing unknown-content error', async () => {
      const identity = await fresh();
      const session = await prisma.session.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          contentKey: 'synthetic-structured-paths-missing',
          activityKind: 'PRACTICE',
          targetCode: 'synthetic-structured-paths-missing',
          targetVersion: 'structured-1',
        },
      });
      await expect(
        recordAttempt(identity, { sessionId: session.id, ...malformed }),
      ).rejects.toThrow('Unknown content');
    });

    it('review: ended session, wrong kind and unconfirmed skill keep their existing errors', async () => {
      const identity = await fresh();
      const ended = await createSession(identity, SF1_ITEM, 'REVIEW');
      await prisma.session.update({ where: { id: ended.id }, data: { endedAt: new Date() } });
      await expect(
        recordReviewAttempt(identity, { sessionId: ended.id, ...malformed }),
      ).rejects.toThrow('Review session ended');
      const practice = await createSession(identity, SF1_ITEM, 'PRACTICE');
      await expect(
        recordReviewAttempt(identity, { sessionId: practice.id, ...malformed }),
      ).rejects.toThrow('Review session kind mismatch');
      const review = await createSession(identity, SF1_ITEM, 'REVIEW');
      await expect(
        recordReviewAttempt(identity, { sessionId: review.id, ...malformed }),
      ).rejects.toThrow('Review is not available for this skill');
    });

    it('independent check without tutoring and a repeated diagnostic keep their existing errors', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      await expect(
        recordIndependentCheck(identity, { sessionId: session.id, ...malformed }),
      ).rejects.toThrow('Independent check requires tutoring');
      const placement = await createSession(identity, SF1_ITEM, 'PLACEMENT');
      await recordDiagnosticAttempt(identity, { sessionId: placement.id, ...structured(GOOD_SF1) });
      const second = await createSession(identity, SF1_ITEM, 'PLACEMENT');
      await expect(
        recordDiagnosticAttempt(identity, { sessionId: second.id, ...malformed }),
      ).rejects.toThrow('Diagnostic already completed for this skill');
    });

    it('adds no ended-session policy to practice: an ended practice session still scores', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      await prisma.session.update({ where: { id: session.id }, data: { endedAt: new Date() } });
      const legacyBehavior = await startSession(identity, { contentId: 'ratio-language-1' });
      await prisma.session.update({
        where: { id: legacyBehavior.sessionId },
        data: { endedAt: new Date() },
      });
      await expect(
        recordAttempt(identity, { sessionId: legacyBehavior.sessionId, learnerResponse: '2:3' }),
      ).resolves.toMatchObject({ correctness: 'CORRECT' });
      await expect(
        recordAttempt(identity, { sessionId: session.id, ...structured(GOOD_SF1) }),
      ).resolves.toMatchObject({ correctness: 'CORRECT' });
    });
  });

  describe('PA-8 legacy rows are untouched by the new paths', () => {
    it('pre-existing legacy attempts are byte-identical after structured traffic', async () => {
      const identity = await fresh();
      const legacy = await startSession(identity, { contentId: 'ratio-language-1' });
      await recordAttempt(identity, { sessionId: legacy.sessionId, learnerResponse: '3:2' });
      const legacyRows = await prisma.attempt.findMany({
        where: { householdId: identity.householdId },
        orderBy: { id: 'asc' },
      });
      const session = await createSession(identity, SF1_ITEM);
      await recordAttempt(identity, { sessionId: session.id, ...structured(GOOD_SF1) });
      await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ a: 'x', b: '1' }),
      }).catch(() => undefined);
      const after = await prisma.attempt.findMany({
        where: { id: { in: legacyRows.map((row) => row.id) } },
        orderBy: { id: 'asc' },
      });
      expect(JSON.stringify(after)).toBe(JSON.stringify(legacyRows));
    });
  });

  describe('PA-4a / PA-4b session projection', () => {
    it('exact allowlist: responseSpec deep-equals the descriptor and has only the public keys', async () => {
      const identity = await fresh();
      const { content } = await startSession(identity, { contentId: ITEM_IDS[0] });
      expect(content.responseSpec).toEqual({
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
      expect(Object.keys(content.responseSpec!)).toEqual(['mode', 'modeVersion', 'fields']);
      expect(Object.keys(content.responseSpec!.fields[0])).toEqual([
        'key',
        'kind',
        'label',
        'unitLabel',
        'representations',
        'simplestForm',
      ]);
      const choice = (await startSession(identity, { contentId: ITEM_IDS[1] })).content
        .responseSpec!.fields[0];
      expect(Object.keys(choice)).toEqual(['key', 'kind', 'label', 'options']);
      expect(choice).toMatchObject({
        options: [
          { id: 'x', label: 'Option X' },
          { id: 'y', label: 'Option Y' },
          { id: 'z', label: 'Option Z' },
        ],
      });
      expect(Object.keys((choice as { options: object[] }).options[0])).toEqual(['id', 'label']);
    });

    it('structured-only projection carries the complete accessibleAlternative', async () => {
      const identity = await fresh();
      const { content } = await startSession(identity, { contentId: ITEM_IDS[0] });
      expect(content.accessibleAlternative).toBe(SF1_ITEM.accessibleAlternative);
    });

    it('redacts every private key and sentinel and the sentinel number renderings', async () => {
      const identity = await fresh();
      const result = await startSession(identity, { contentId: ITEM_IDS[3] });
      // Fixture construction: the sentinel renderings occur nowhere in public content.
      const publicText = JSON.stringify([
        SENT_ITEM.title,
        SENT_ITEM.prompt,
        SENT_ITEM.accessibilityNotes,
        SENT_ITEM.accessibleAlternative,
        result.content.responseSpec,
      ]);
      for (const rendering of SENT_RENDERINGS) expect(publicText).not.toContain(rendering);
      expect(() => expectNoPrivateLeak(result, SENT_VALIDATOR, SENT_RENDERINGS)).not.toThrow();
      for (const sentinel of Object.values(SENTINELS)) {
        expect(JSON.stringify(result)).not.toContain(sentinel);
      }
      expect(JSON.stringify(result)).not.toContain(SENT_VALIDATOR.canonicalAnswer);
    });

    it('selector invariance: changing the private correct option leaves the projection identical', async () => {
      const identity = await fresh();
      const normalize = (content: Record<string, unknown>) =>
        JSON.stringify({
          ...content,
          id: 'X',
          title: 'X',
          prompt: 'X',
          accessibleAlternative: 'X',
        });
      const y = (await startSession(identity, { contentId: ITEM_IDS[1] })).content;
      const x = (await startSession(identity, { contentId: ITEM_IDS[2] })).content;
      expect(JSON.stringify(x.responseSpec)).toBe(JSON.stringify(y.responseSpec));
      expect(normalize(x as never)).toBe(normalize(y as never));
      expect(JSON.stringify(x.responseSpec)).not.toContain('correctOptionId');
    });

    it("PA-4b: a legacy item keeps today's exact projection with no responseSpec or alternative", async () => {
      const identity = await fresh();
      const { content } = await startSession(identity, { contentId: 'ratio-language-1' });
      expect(Object.keys(content)).toEqual([
        'id',
        'version',
        'title',
        'skillCode',
        'prompt',
        'accessibilityNotes',
        'figure',
      ]);
      expect(content).not.toHaveProperty('responseSpec');
      expect(content).not.toHaveProperty('accessibleAlternative');
    });

    it("PA-4f: a practice attempt response keeps today's shape", async () => {
      const identity = await fresh();
      const session = await createSession(identity, SF1_ITEM);
      const result = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured(GOOD_SF1),
      });
      expect(Object.keys(result).sort()).toEqual(['attemptId', 'correctness', 'evidenceWeight']);
    });
  });

  describe('tutor boundary', () => {
    it('the tutor context and trace never carry the structured payload or private selectors', async () => {
      const identity = await fresh();
      const session = await createSession(identity, SENT_ITEM);
      const attempt = await recordAttempt(identity, {
        sessionId: session.id,
        ...structured({ a: '127 63/64', b: '7918' }),
      });
      const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attempt.attemptId } });
      const context = await getTutorContext(identity, attempt.attemptId);
      expect(Object.keys(context.content).sort()).toEqual([
        'canonicalAnswer',
        'forbiddenLeakagePatterns',
        'id',
        'prompt',
        'skillCode',
      ]);
      const serialized = JSON.stringify(context);
      expect(serialized).not.toContain(row.learnerResponse);
      expect(serialized).not.toContain('structuredResponse');
      expect(serialized).not.toContain('correctValue');
      expect(serialized).not.toContain(SENTINELS.equivalenceNotes);
      const response = await new TutorHarness(new FakeTutorModel()).respond({
        prompt: context.content.prompt,
        learnerMessage: 'I filled the fields.',
        redactedSkillContext: `content:${context.content.id}`,
        state: context.state,
        mode: 'math_tutor',
        genuineAttempt: true,
        priorHintCount: context.priorHintCount,
        attemptNumber: context.attemptNumber,
        protectedTokens: [
          context.content.canonicalAnswer,
          ...context.content.forbiddenLeakagePatterns,
        ],
      });
      await recordTutorResponse(identity, { attemptId: attempt.attemptId, response });
      const traces = JSON.stringify(
        await prisma.tutorTrace.findMany({ where: { householdId: identity.householdId } }),
      );
      expect(traces).not.toContain(row.learnerResponse);
      expect(traces).not.toContain('7918');
      expect(JSON.stringify(response)).not.toContain(SENT_VALIDATOR.canonicalAnswer);
    });
  });

  describe('Phase 1 request body parsing (tier 1)', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const ok = { mode: 'structured-fields', modeVersion: '1', fields: { a: '1' } };

    it('accepts exactly one response field', () => {
      expect(parsePhase1AttemptBody({ sessionId: id, learnerResponse: ' 5 ' })).toEqual({
        sessionId: id,
        learnerResponse: '5',
      });
      expect(parsePhase1AttemptBody({ sessionId: id, structuredResponse: ok })).toEqual({
        sessionId: id,
        structuredResponse: ok,
      });
    });

    it('rejects both, neither, unknown structured keys, bad types and over-bound values', () => {
      const bad: unknown[] = [
        { sessionId: id },
        { sessionId: id, learnerResponse: '5', structuredResponse: ok },
        { sessionId: id, learnerResponse: '5', structuredResponse: null },
        { sessionId: id, structuredResponse: { ...ok, extra: true } },
        { sessionId: id, structuredResponse: { ...ok, fields: { a: 1 } } },
        { sessionId: id, structuredResponse: { ...ok, fields: { a: 'x'.repeat(201) } } },
        { sessionId: id, structuredResponse: { ...ok, mode: 'm'.repeat(41) } },
        { sessionId: id, structuredResponse: { ...ok, fields: { ['k'.repeat(65)]: '1' } } },
        {
          sessionId: id,
          structuredResponse: {
            ...ok,
            fields: Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`k${i}`, '1'])),
          },
        },
        { sessionId: id, structuredResponse: [] },
        { sessionId: id, extra: 1, structuredResponse: ok },
        { sessionId: 'not-a-uuid', structuredResponse: ok },
        { sessionId: id, learnerResponse: '   ' },
        { sessionId: id, learnerResponse: 'x'.repeat(1001) },
        { sessionId: id, learnerResponse: 5 },
        null,
        [],
        'text',
      ];
      for (const body of bad) expect(parsePhase1AttemptBody(body)).toBeNull();
    });

    it('accepts the exact request bounds and rejects one past each', () => {
      const keyed = (count: number, keyLength = 64, valueLength = 200) =>
        Object.fromEntries(
          Array.from({ length: count }, (_, i) => [
            `${'k'.repeat(keyLength - 2)}${String(i).padStart(2, '0')}`,
            'v'.repeat(valueLength),
          ]),
        );
      const body = (fields: Record<string, string>) => ({
        sessionId: id,
        structuredResponse: { mode: 'm'.repeat(40), modeVersion: 'v'.repeat(40), fields },
      });
      const twelve = keyed(12);
      // The fixture really has 12 unique 64-character keys with 200-character values.
      expect(Object.keys(twelve)).toHaveLength(12);
      expect(new Set(Object.keys(twelve)).size).toBe(12);
      expect(Object.keys(twelve).every((key) => key.length === 64)).toBe(true);
      expect(Object.values(twelve).every((value) => value.length === 200)).toBe(true);
      expect(parsePhase1AttemptBody(body(twelve))).not.toBeNull();
      // 13 unique keys: rejected.
      expect(Object.keys(keyed(13))).toHaveLength(13);
      expect(parsePhase1AttemptBody(body(keyed(13)))).toBeNull();
      // 65-character key and 201-character value: rejected; 64/200 accepted above.
      expect(parsePhase1AttemptBody(body(keyed(1, 65)))).toBeNull();
      expect(parsePhase1AttemptBody(body(keyed(1, 64, 201)))).toBeNull();
      expect(parsePhase1AttemptBody(body(keyed(1, 64, 200)))).not.toBeNull();
      expect(
        parsePhase1AttemptBody({ sessionId: id, learnerResponse: 'x'.repeat(1000) }),
      ).not.toBeNull();
    });
  });

  it('sanity: the synthetic fixture validators are structured and distinct', () => {
    expect(validatorOf).toBeTypeOf('function');
    expect(numberField('a', 'A', ['integer'], false, '1').kind).toBe('number');
    expect(SF3_X.fields[0]).toMatchObject({ correctOptionId: 'x' });
  });
});
