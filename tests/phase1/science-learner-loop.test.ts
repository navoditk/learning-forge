import { afterAll, describe, expect, it } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import type { TutorModel } from '../../src/contracts';
import {
  getDiagnosticPlan,
  getLearnerProgress,
  getParentEvidence,
  getPlan,
  getReviewQueue,
  getTutorContext,
  MASTERY_REVIEW_INTERVAL_DAYS,
  PHASE_1_MASTERY_VERSION,
  recordAttempt,
  recordDiagnosticAttempt,
  recordIndependentCheck,
  recordReviewAttempt,
  recordTutorResponse,
  startSession,
  type HouseholdIdentity,
} from '../../src/phase1/service';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { StructuredResponseRefusedError } from '../../src/progression/assessment-submission';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import { FakeTutorModel, TutorHarness, type TutorState } from '../../src/tutor';
import {
  createSyntheticHousehold,
  evidenceSnapshot,
  PRIVATE_KEYS,
  walk,
} from './structured-paths-support';

/**
 * SU-E2 (SCI6-READY-LOOP): the Grade 6 Science learner loop through the real
 * Phase 1 service functions, against a synthetic household in a disposable
 * database. Tests only. The program availability flag is true in the SU-E3
 * activation candidate (D-188); the service accepts `program: 'grade-6-science'`
 * directly. Tutoring uses the existing deterministic fake model. No provider,
 * no C4 enforcement (production C4 stays closed and is out of scope).
 */

const PROGRAM = 'grade-6-science' as const;
const EOL = 'sci6-cells-evidence-of-life';
const PF = 'sci6-cell-parts-functions';
const AAS = 'sci6-cell-as-a-system';
const EOL_1 = 'sci6-cells-evidence-of-life-1';
const EOL_2 = 'sci6-cells-evidence-of-life-2';
const PF_1 = 'sci6-cell-parts-functions-1';
const PF_2 = 'sci6-cell-parts-functions-2';
const AAS_1 = 'sci6-cell-as-a-system-1';
const AAS_2 = 'sci6-cell-as-a-system-2';
const DAY_MS = 24 * 60 * 60 * 1000;

function recordOf(id: string) {
  const item = contentCatalog.find((candidate) => candidate.id === id);
  if (!item || item.deterministicValidator.type !== 'structured') {
    throw new Error(`${id} is not a structured catalog record`);
  }
  return { item, validator: item.deterministicValidator };
}

/** A structured body with every field correct, optionally overriding some. */
function answerFor(id: string, overrides: Record<string, string> = {}) {
  const fields: Record<string, string> = {};
  for (const field of recordOf(id).validator.fields) {
    if (field.kind !== 'choice') throw new Error('unexpected non-choice field');
    fields[field.key] = field.correctOptionId;
  }
  return {
    structuredResponse: {
      mode: 'structured-fields',
      modeVersion: '1',
      fields: { ...fields, ...overrides },
    },
  };
}

/** A well-formed body whose first field holds a real but wrong option. */
function wrongAnswerFor(id: string) {
  const [first] = recordOf(id).validator.fields;
  if (first.kind !== 'choice') throw new Error('unexpected non-choice field');
  const distractor = first.options.find((option) => option.id !== first.correctOptionId)!;
  return answerFor(id, { [first.key]: distractor.id });
}

/** A body that fails tier 4 (one field is not an option of the item). */
function malformedAnswerFor(id: string) {
  const [first] = recordOf(id).validator.fields;
  return answerFor(id, { [first.key]: 'not-a-real-option-id' });
}

async function expectRefused(action: Promise<unknown>) {
  const error = await action.then(
    () => undefined,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(StructuredResponseRefusedError);
  expect((error as StructuredResponseRefusedError).code).toBe('MALFORMED_RESPONSE');
}

describe('Grade 6 Science learner loop (SU-E2)', () => {
  const households: HouseholdIdentity[] = [];
  const fresh = async () => {
    const identity = await createSyntheticHousehold();
    households.push(identity);
    return identity;
  };

  afterAll(async () => {
    for (const identity of households) await deleteHouseholdData(prisma, identity.householdId);
    await prisma.$disconnect();
  });

  const start = (
    identity: HouseholdIdentity,
    contentId: string,
    activityKind: 'PRACTICE' | 'PLACEMENT' | 'REVIEW' = 'PRACTICE',
  ) => startSession(identity, { contentId, program: PROGRAM, activityKind });

  const respond = (
    context: Awaited<ReturnType<typeof getTutorContext>>,
    model: TutorModel = new FakeTutorModel(),
    state: TutorState = context.state,
  ) =>
    new TutorHarness(model).respond({
      prompt: context.content.prompt,
      learnerMessage: 'I filled the fields.',
      redactedSkillContext: `content:${context.content.id}`,
      state,
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: context.priorHintCount,
      attemptNumber: context.attemptNumber,
      protectedTokens: [
        context.content.canonicalAnswer,
        ...context.content.forbiddenLeakagePatterns,
      ],
    });

  /** Practice, one fake-path tutor turn, then a correct independent check. */
  async function confirmSkill(identity: HouseholdIdentity, contentId: string) {
    const session = await start(identity, contentId);
    const attempt = await recordAttempt(identity, {
      sessionId: session.sessionId,
      ...answerFor(contentId),
    });
    const context = await getTutorContext(identity, attempt.attemptId);
    await recordTutorResponse(identity, {
      attemptId: attempt.attemptId,
      response: await respond(context),
    });
    const check = await recordIndependentCheck(identity, {
      sessionId: session.sessionId,
      ...answerFor(contentId),
    });
    expect(check.correctness).toBe('CORRECT');
    return { session, attempt, check };
  }

  const masteryOf = (identity: HouseholdIdentity, skillCode: string) =>
    prisma.masteryEstimate.findUniqueOrThrow({
      where: {
        learnerProfileId_skillCode_algorithmVersion: {
          learnerProfileId: identity.learnerProfileId,
          skillCode,
          algorithmVersion: PHASE_1_MASTERY_VERSION,
        },
      },
    });

  const planIds = async (identity: HouseholdIdentity) =>
    (await getPlan(identity, { program: PROGRAM })).items.map((item) => item.contentId);

  const ageMastery = (identity: HouseholdIdentity, skillCode: string, days: number) =>
    prisma.masteryEstimate.update({
      where: {
        learnerProfileId_skillCode_algorithmVersion: {
          learnerProfileId: identity.learnerProfileId,
          skillCode,
          algorithmVersion: PHASE_1_MASTERY_VERSION,
        },
      },
      data: { updatedAt: new Date(Date.now() - days * DAY_MS) },
    });

  it('pins the Science gate at 0.75 and expects availability true in the candidate (D-192)', async () => {
    const profile = loadPolicyArtifacts().profiles.find(
      (candidate) => candidate.code === 'grade-6-science-default' && candidate.version === '1.0.0',
    );
    expect(profile?.minEstimateGate).toBe(0.75);
    const { programsByCode } = await import('../../src/curriculum/program-registry');
    expect(programsByCode.get(PROGRAM)?.available).toBe(true);
  });

  describe('case 1: progress', () => {
    it('shows the three Science skills, all NOT_STARTED', async () => {
      const identity = await fresh();
      const progress = await getLearnerProgress(identity, { program: PROGRAM });
      expect(progress.skills.map((skill) => skill.skillCode)).toEqual([EOL, PF, AAS]);
      expect(progress.skills.every((skill) => skill.status === 'NOT_STARTED')).toBe(true);
      expect(progress.skills.every((skill) => skill.domain === 'sci6-life-science')).toBe(true);
      expect(progress.recentStrengths).toEqual([]);
    });
  });

  describe('case 2: placement', () => {
    it('offers the three *-1 items in the diagnostic plan', async () => {
      const identity = await fresh();
      const plan = await getDiagnosticPlan(identity, { program: PROGRAM });
      expect(plan.items.map((item) => item.contentId)).toEqual([EOL_1, PF_1, AAS_1]);
      expect(plan.items.map((item) => item.skillCode)).toEqual([EOL, PF, AAS]);
    });

    it('projects responseSpec and accessibleAlternative with no private keys for a PLACEMENT session', async () => {
      const identity = await fresh();
      for (const id of [EOL_1, PF_1, AAS_1]) {
        const session = await start(identity, id, 'PLACEMENT');
        const { item, validator } = recordOf(id);
        expect(session.content.responseSpec).toBeDefined();
        expect(session.content.accessibleAlternative).toBe(item.accessibleAlternative);
        expect(String(session.content.accessibleAlternative).trim().length).toBeGreaterThan(0);
        expect(session.content.responseSpec!.fields.map((field) => field.key)).toEqual(
          validator.fields.map((field) => field.key),
        );
        const { keys } = walk(session);
        expect(keys.filter((key) => PRIVATE_KEYS.includes(key))).toEqual([]);
        const serialized = JSON.stringify(session);
        for (const text of [
          item.solutionRepresentation,
          item.solutionMethod,
          validator.equivalenceNotes,
          ...item.hintSteps.map((step) => step.prompt),
        ]) {
          expect(serialized).not.toContain(text);
        }
      }
    });

    it('a correct answer is CORRECT with a mastery row', async () => {
      const identity = await fresh();
      const session = await start(identity, EOL_1, 'PLACEMENT');
      const result = await recordDiagnosticAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_1),
      });
      expect(result).toMatchObject({ correctness: 'CORRECT', evidenceWeight: 1 });
      const mastery = await masteryOf(identity, EOL);
      expect(mastery).toMatchObject({ estimate: 1, independentDelayedCheck: false });
      const ended = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(ended.endedAt).not.toBeNull();
    });

    it('a distractor is INCORRECT with zero evidence weight', async () => {
      const identity = await fresh();
      const session = await start(identity, PF_1, 'PLACEMENT');
      const result = await recordDiagnosticAttempt(identity, {
        sessionId: session.sessionId,
        ...wrongAnswerFor(PF_1),
      });
      expect(result).toMatchObject({ correctness: 'INCORRECT', evidenceWeight: 0 });
      const mastery = await masteryOf(identity, PF);
      expect(mastery.estimate).toBe(0);
      expect(mastery.independentDelayedCheck).toBe(false);
      const contributions = await prisma.masteryContribution.findMany({
        where: { masteryEstimateId: mastery.id },
      });
      expect(contributions.map((row) => row.evidenceWeight)).toEqual([0]);
    });

    it('a malformed body is refused, writes nothing and does not end the session', async () => {
      const identity = await fresh();
      const session = await start(identity, AAS_1, 'PLACEMENT');
      const before = await evidenceSnapshot(identity);
      await expectRefused(
        recordDiagnosticAttempt(identity, {
          sessionId: session.sessionId,
          ...malformedAnswerFor(AAS_1),
        }),
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      const row = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(row.endedAt).toBeNull();
      expect(await prisma.attempt.count({ where: { sessionId: session.sessionId } })).toBe(0);
      expect(
        await prisma.masteryEstimate.count({
          where: { learnerProfileId: identity.learnerProfileId, skillCode: AAS },
        }),
      ).toBe(0);
    });
  });

  describe('case 3: practice, hint and independent check', () => {
    it('confirms a skill through practice, one fake-path tutor turn and a correct structured check', async () => {
      const identity = await fresh();
      const session = await start(identity, EOL_1);
      const attempt = await recordAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_1),
      });
      expect(attempt.correctness).toBe('CORRECT');
      const context = await getTutorContext(identity, attempt.attemptId);
      const response = await respond(context);
      expect(response.status).toBe('validated');
      await recordTutorResponse(identity, { attemptId: attempt.attemptId, response });
      expect(await prisma.tutorInteraction.count({ where: { attemptId: attempt.attemptId } })).toBe(
        1,
      );

      const check = await recordIndependentCheck(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_1),
      });
      expect(check.correctness).toBe('CORRECT');
      const mastery = await masteryOf(identity, EOL);
      expect(mastery).toMatchObject({ estimate: 1, independentDelayedCheck: true });
      const progress = await getLearnerProgress(identity, { program: PROGRAM });
      expect(progress.skills.find((skill) => skill.skillCode === EOL)?.status).toBe(
        'INDEPENDENTLY_CONFIRMED',
      );
      expect(progress.recentStrengths.map((strength) => strength.skillCode)).toEqual([EOL]);
      const ended = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(ended.endedAt).not.toBeNull();
    });

    it('a malformed check body after tutoring writes nothing and leaves the skill unconfirmed', async () => {
      const identity = await fresh();
      const session = await start(identity, PF_1);
      const attempt = await recordAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(PF_1),
      });
      const context = await getTutorContext(identity, attempt.attemptId);
      await recordTutorResponse(identity, {
        attemptId: attempt.attemptId,
        response: await respond(context),
      });
      const before = await evidenceSnapshot(identity);
      await expectRefused(
        recordIndependentCheck(identity, {
          sessionId: session.sessionId,
          ...malformedAnswerFor(PF_1),
        }),
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      const mastery = await masteryOf(identity, PF);
      expect(mastery.independentDelayedCheck).toBe(false);
      const row = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(row.endedAt).toBeNull();
    });
  });

  describe('case 4: isolation from Math', () => {
    it('Math progress and plan contain no sci6-*, and Science contains no Math', async () => {
      const identity = await fresh();
      await confirmSkill(identity, EOL_1);

      const mathProgress = await getLearnerProgress(identity);
      expect(mathProgress.skills.length).toBeGreaterThan(0);
      expect(mathProgress.skills.every((skill) => !skill.skillCode.startsWith('sci6-'))).toBe(true);
      expect(mathProgress.recentStrengths).toEqual([]);
      const mathPlan = await getPlan(identity);
      expect(mathPlan.items.length).toBeGreaterThan(0);
      expect(mathPlan.items.every((item) => !item.skillCode.startsWith('sci6-'))).toBe(true);
      expect(mathPlan.items.every((item) => !item.contentId.startsWith('sci6-'))).toBe(true);

      const science = await getLearnerProgress(identity, { program: PROGRAM });
      expect(science.skills.every((skill) => skill.skillCode.startsWith('sci6-'))).toBe(true);
      expect(
        science.recentStrengths.every((strength) => strength.skillCode.startsWith('sci6-')),
      ).toBe(true);
      const sciencePlan = await getPlan(identity, { program: PROGRAM });
      expect(sciencePlan.items.length).toBeGreaterThan(0);
      expect(sciencePlan.items.every((item) => item.skillCode.startsWith('sci6-'))).toBe(true);
      expect(sciencePlan.items.every((item) => item.contentId.startsWith('sci6-'))).toBe(true);
      const diagnostic = await getDiagnosticPlan(identity, { program: PROGRAM });
      expect(diagnostic.items.every((item) => item.skillCode.startsWith('sci6-'))).toBe(true);
      const mathDiagnostic = await getDiagnosticPlan(identity);
      expect(mathDiagnostic.items.every((item) => !item.skillCode.startsWith('sci6-'))).toBe(true);
    });
  });

  describe('case 5: serialized reachability (SU-R1)', () => {
    it('drives the G15 states through real calls and asserts getPlan at each', async () => {
      const identity = await fresh();

      // State 1: no mastery.
      expect(await planIds(identity)).toEqual([EOL_1, EOL_2, PF_1]);

      // State 2: all three placed (correct), none secure.
      for (const id of [EOL_1, PF_1, AAS_1]) {
        const session = await start(identity, id, 'PLACEMENT');
        await recordDiagnosticAttempt(identity, { sessionId: session.sessionId, ...answerFor(id) });
      }
      expect((await getDiagnosticPlan(identity, { program: PROGRAM })).items).toEqual([]);
      expect(await planIds(identity)).toEqual([EOL_1, EOL_2, PF_1]);
      expect(
        (await getLearnerProgress(identity, { program: PROGRAM })).skills.map(
          (skill) => skill.status,
        ),
      ).toEqual(['PRACTICING', 'PRACTICING', 'PRACTICING']);

      // State 3: EoL secure. as-a-system practice appears.
      await confirmSkill(identity, EOL_1);
      expect(await planIds(identity)).toEqual([PF_1, PF_2, AAS_1]);

      // State 4: EoL and PF secure. Only AaS-* remains.
      await confirmSkill(identity, PF_1);
      const finalIds = await planIds(identity);
      expect(finalIds).toEqual([AAS_1, AAS_2]);
      expect(finalIds.every((id) => id.startsWith('sci6-cell-as-a-system-'))).toBe(true);

      // All three reachable: confirm the last one and nothing is left to plan.
      await confirmSkill(identity, AAS_1);
      expect(await planIds(identity)).toEqual([]);
      expect(
        (await getLearnerProgress(identity, { program: PROGRAM })).skills.map(
          (skill) => skill.status,
        ),
      ).toEqual(['INDEPENDENTLY_CONFIRMED', 'INDEPENDENTLY_CONFIRMED', 'INDEPENDENTLY_CONFIRMED']);
    });
  });

  describe('case 6: due review (SU-R5)', () => {
    it('lists a confirmed skill only once its estimate is older than the review interval', async () => {
      const identity = await fresh();
      expect(MASTERY_REVIEW_INTERVAL_DAYS).toBe(14);
      await confirmSkill(identity, EOL_1);
      expect((await getReviewQueue(identity, { program: PROGRAM })).items).toEqual([]);

      await ageMastery(identity, EOL, 15);
      const due = await getReviewQueue(identity, { program: PROGRAM });
      expect(due.items.map((item) => [item.skillCode, item.contentId])).toEqual([[EOL, EOL_1]]);

      await ageMastery(identity, EOL, 13);
      expect((await getReviewQueue(identity, { program: PROGRAM })).items).toEqual([]);
    });

    it('a correct REVIEW answer ends the session and keeps confirmation; a malformed body writes nothing first', async () => {
      const identity = await fresh();
      await confirmSkill(identity, EOL_1);
      await ageMastery(identity, EOL, 15);
      const session = await start(identity, EOL_1, 'REVIEW');

      const before = await evidenceSnapshot(identity);
      await expectRefused(
        recordReviewAttempt(identity, {
          sessionId: session.sessionId,
          ...malformedAnswerFor(EOL_1),
        }),
      );
      expect(await evidenceSnapshot(identity)).toEqual(before);
      const open = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(open.endedAt).toBeNull();

      const result = await recordReviewAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_1),
      });
      expect(result.correctness).toBe('CORRECT');
      const ended = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(ended.endedAt).not.toBeNull();
      const mastery = await masteryOf(identity, EOL);
      expect(mastery.independentDelayedCheck).toBe(true);
      const progress = await getLearnerProgress(identity, { program: PROGRAM });
      expect(progress.skills.find((skill) => skill.skillCode === EOL)?.status).toBe(
        'INDEPENDENTLY_CONFIRMED',
      );
    });

    it('a second due skill answered wrong ends the session and lapses confirmation', async () => {
      const identity = await fresh();
      await confirmSkill(identity, EOL_1);
      await confirmSkill(identity, PF_1);
      await ageMastery(identity, EOL, 15);
      await ageMastery(identity, PF, 16);
      const due = await getReviewQueue(identity, { program: PROGRAM });
      expect(due.items.map((item) => item.skillCode)).toEqual([PF, EOL]);

      const session = await start(identity, PF_1, 'REVIEW');
      const result = await recordReviewAttempt(identity, {
        sessionId: session.sessionId,
        ...wrongAnswerFor(PF_1),
      });
      expect(result.correctness).toBe('INCORRECT');
      const ended = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
      expect(ended.endedAt).not.toBeNull();
      expect((await masteryOf(identity, PF)).independentDelayedCheck).toBe(false);
      // The other due skill is untouched.
      expect((await masteryOf(identity, EOL)).independentDelayedCheck).toBe(true);
      const progress = await getLearnerProgress(identity, { program: PROGRAM });
      expect(progress.skills.find((skill) => skill.skillCode === PF)?.status).toBe('PRACTICING');
    });
  });

  describe('case 7: assisted overwrite (SU-R1, SU-R7)', () => {
    it('overwrites a confirmed estimate to 0.55 / LOW, keeps confirmation, and re-plans EoL under gate 0.75', async () => {
      const identity = await fresh();
      await confirmSkill(identity, EOL_1);
      expect(await masteryOf(identity, EOL)).toMatchObject({
        estimate: 1,
        independentDelayedCheck: true,
      });
      // Secure at 1: EoL is out of the plan.
      expect(await planIds(identity)).toEqual([PF_1, PF_2, AAS_1]);

      const session = await start(identity, EOL_2);
      const attempt = await recordAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_2),
      });
      expect(attempt.correctness).toBe('CORRECT');
      expect((await masteryOf(identity, EOL)).estimate).toBe(1);

      // hint_1_strategy authorizes hint_2_representation, whose maximum is
      // multiple_hints_representation; the fake model returns that move.
      const context = await getTutorContext(identity, attempt.attemptId);
      const response = await respond(context, new FakeTutorModel(), 'hint_1_strategy');
      expect(response.status).toBe('validated');
      expect(response.move).toMatchObject({
        moveType: 'hint_2_representation',
        assistanceLevel: 'multiple_hints_representation',
      });
      await recordTutorResponse(identity, { attemptId: attempt.attemptId, response });

      const mastery = await masteryOf(identity, EOL);
      expect(mastery.estimate).toBe(0.55);
      expect(mastery.confidenceBand).toBe('LOW');
      expect(mastery.independentDelayedCheck).toBe(true);

      const progress = await getLearnerProgress(identity, { program: PROGRAM });
      expect(progress.skills.find((skill) => skill.skillCode === EOL)?.status).toBe(
        'INDEPENDENTLY_CONFIRMED',
      );

      const evidence = await getParentEvidence(identity);
      expect(evidence.mastery.filter((row) => row.skillCode === EOL)).toEqual([
        { skillCode: EOL, estimate: 0.55, confidenceBand: 'LOW', independentDelayedCheck: true },
      ]);

      // 0.55 is below the 0.75 gate, so EoL items return to the plan.
      expect(await planIds(identity)).toEqual([EOL_1, EOL_2, PF_1]);
    });

    it('a fallback tutor response creates no TutorInteraction and leaves the estimate unchanged', async () => {
      const identity = await fresh();
      await confirmSkill(identity, EOL_1);
      const session = await start(identity, EOL_2);
      const attempt = await recordAttempt(identity, {
        sessionId: session.sessionId,
        ...answerFor(EOL_2),
      });
      const failing: TutorModel = {
        async generateMove() {
          throw new Error('synthetic model failure');
        },
        async scoreConstructedResponse() {
          throw new Error('synthetic model failure');
        },
      };
      const context = await getTutorContext(identity, attempt.attemptId);
      const response = await respond(context, failing, 'hint_1_strategy');
      expect(response.status).toBe('fallback');
      expect(response.move).toBeUndefined();

      const beforeEstimate = await masteryOf(identity, EOL);
      const interactionsBefore = await prisma.tutorInteraction.count({
        where: { householdId: identity.householdId },
      });
      const assistanceBefore = await prisma.assistanceEvent.count({
        where: { attempt: { householdId: identity.householdId } },
      });
      await recordTutorResponse(identity, { attemptId: attempt.attemptId, response });

      expect(
        await prisma.tutorInteraction.count({ where: { householdId: identity.householdId } }),
      ).toBe(interactionsBefore);
      expect(await prisma.tutorInteraction.count({ where: { attemptId: attempt.attemptId } })).toBe(
        0,
      );
      expect(
        await prisma.assistanceEvent.count({
          where: { attempt: { householdId: identity.householdId } },
        }),
      ).toBe(assistanceBefore);
      const after = await masteryOf(identity, EOL);
      expect(after.estimate).toBe(beforeEstimate.estimate);
      expect(after.confidenceBand).toBe(beforeEstimate.confidenceBand);
      expect(after.independentDelayedCheck).toBe(true);
      expect(after.estimate).toBe(1);
    });
  });
});
