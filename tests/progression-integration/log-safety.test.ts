import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  getTutorContext,
  phase1Content,
  recordAttempt,
  recordTutorResponse,
  startSession,
} from '../../src/phase1/service';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';

const LEARNER_FREE_TEXT_SENTINEL = 'L16-SENTINEL-my-dog-ate-my-homework-please-help-me';
const LEARNER_WRONG_RESPONSE_SENTINEL = 'L16-SENTINEL-definitely-wrong-answer';

// L16 / S10: "refusal, scoring, and ShadowDecision records contain no prompt
// text, learner free text, or answer string" - asserted here by running a
// full journey (session start -> wrong attempt -> hint request with a
// distinctive learner message -> scoring) against a real household, then
// scanning every ShadowDecision, TutorTrace, TutorInteraction, and AuditLog
// row that journey produced for the content prompt, the canonical answer,
// and the learner's own free-text strings. `tests/progression-integration/feedback-safety-route.test.ts`
// already covers this for the assessment-submission route specifically;
// this test covers the practice/tutoring path (`/api/phase1/*`), which that
// file does not exercise.
// Opaque identifiers (uuids) are excluded by key name: a short numeric
// canonical answer is otherwise prone to a coincidental substring match
// inside an unrelated uuid, which would make the scan noisy rather than
// meaningful. Field VALUES are still scanned everywhere else.
const IDENTIFIER_KEY = /(^id$|Id$|Key$|Code$)/u;

function findLeak(
  value: unknown,
  sentinels: readonly string[],
  path = '$',
  key?: string,
): string | undefined {
  if (typeof value === 'string') {
    if (key && IDENTIFIER_KEY.test(key)) return undefined;
    const hit = sentinels.find((marker) => value.includes(marker));
    return hit ? `${path} contains "${hit}"` : undefined;
  }
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      const leak = findLeak(entry, sentinels, `${path}[${index}]`, key);
      if (leak) return leak;
    }
    return undefined;
  }
  if (value && typeof value === 'object') {
    for (const [entryKey, entry] of Object.entries(value as Record<string, unknown>)) {
      const leak = findLeak(entry, sentinels, `${path}.${entryKey}`, entryKey);
      if (leak) return leak;
    }
  }
  return undefined;
}

describe('practice/tutoring journey writes no leaked log/trace/shadow text (L16)', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'PARENT' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
    const identity = {
      householdId,
      learnerProfileId,
      actorUserId: user.id,
      actorRole: 'PARENT' as const,
    };

    const session = await startSession(identity, { contentId: phase1Content.id });
    const attempt = await recordAttempt(identity, {
      sessionId: session.sessionId,
      learnerResponse: LEARNER_WRONG_RESPONSE_SENTINEL,
    });
    const context = await getTutorContext(identity, attempt.attemptId);
    const response = await new TutorHarness(new FakeTutorModel()).respond({
      prompt: context.content.prompt,
      learnerMessage: LEARNER_FREE_TEXT_SENTINEL,
      redactedSkillContext: `content:${context.content.id}; skill:${context.content.skillCode}`,
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
    await recordAttempt(identity, {
      sessionId: session.sessionId,
      learnerResponse: phase1Content.deterministicValidator.canonicalAnswer,
    });
  });

  afterAll(async () => {
    if (householdId) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('never persists the prompt, canonical answer, or learner free text in a log/trace/shadow row', async () => {
    const [shadowDecisions, traces, interactions, auditLogs] = await Promise.all([
      prisma.shadowDecision.findMany({ where: { householdId } }),
      prisma.tutorTrace.findMany({ where: { householdId } }),
      prisma.tutorInteraction.findMany({ where: { householdId } }),
      prisma.auditLog.findMany({ where: { householdId } }),
    ]);

    expect(traces.length).toBeGreaterThan(0);
    expect(shadowDecisions.length).toBeGreaterThan(0);

    const sentinels = [
      phase1Content.prompt,
      phase1Content.deterministicValidator.canonicalAnswer,
      ...phase1Content.deterministicValidator.acceptedAnswers,
      LEARNER_FREE_TEXT_SENTINEL,
      LEARNER_WRONG_RESPONSE_SENTINEL,
    ];
    const leak = findLeak({ shadowDecisions, traces, interactions, auditLogs }, sentinels);
    expect(leak).toBeUndefined();
  });
});
