import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { POST as hintPost } from '../../src/app/api/phase1/hint/route';
import { contentCatalog, contentSkillCode } from '../../src/content/catalog';
import { skillsByCode } from '../../src/curriculum/catalog';
import type { CurriculumProgram } from '../../src/contracts';
import {
  getTutorContext,
  recordAttempt,
  startSession,
  type HouseholdIdentity,
} from '../../src/phase1/service';
import { requireHouseholdContext } from '../../src/server/household-context';
import { resetRateLimitForTests } from '../../src/tutor';
import { createSyntheticHousehold } from '../phase1/structured-paths-support';

/**
 * SU-H7-FIX2 rev4 (review r3 finding 4, D-281): synthetic fake-tutor journeys
 * through the hint route and the Phase 1 service. For each item: a wrong
 * attempt, a first hint that returns a validated move and persists a tutor
 * interaction, then a second hint whose state is rebuilt from that
 * interaction and which returns a further validated, authorized move. A
 * fallback never creates an interaction, so a fallback anywhere fails the
 * journey. Fake provider only; synthetic household, disposable database.
 */

const SCIENCE_ITEMS = ['sci6-cells-evidence-of-life-2', 'sci6-cell-as-a-system-2'];
const MATH_ITEMS = ['ratio-tables-1', 'coordinate-plane-1', 'amc8-graphs-and-tables-1'];

function wrongStructuredBody(contentId: string) {
  const item = contentCatalog.find((candidate) => candidate.id === contentId);
  if (!item || item.deterministicValidator.type !== 'structured') {
    throw new Error(`${contentId} is not a structured catalog record`);
  }
  const fields: Record<string, string> = {};
  item.deterministicValidator.fields.forEach((field) => {
    if (field.kind !== 'choice') throw new Error('unexpected non-choice field');
    fields[field.key] = field.options.find((option) => option.id !== field.correctOptionId)!.id;
  });
  return { structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields } };
}

function hintRequest(attemptId: string) {
  return new Request('http://localhost/api/phase1/hint', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ attemptId, learnerMessage: 'I am stuck, can you help?' }),
  });
}

type HintBody = {
  response: {
    status: string;
    move?: { moveType: string; learnerMessage: string; question: string };
    nextState: string;
    masteryAdvanced: boolean;
  };
};

const savedProvider = process.env.TUTOR_MODEL_PROVIDER;

describe('fake-tutor journeys through the hint route (SU-H7-FIX2 rev4, R3-4)', () => {
  let identity: HouseholdIdentity;

  beforeAll(async () => {
    delete process.env.TUTOR_MODEL_PROVIDER;
    identity = await createSyntheticHousehold();
  });

  beforeEach(() => {
    resetRateLimitForTests();
    vi.mocked(requireHouseholdContext).mockResolvedValue(identity);
  });

  afterAll(async () => {
    if (savedProvider === undefined) delete process.env.TUTOR_MODEL_PROVIDER;
    else process.env.TUTOR_MODEL_PROVIDER = savedProvider;
    await deleteHouseholdData(prisma, identity.householdId);
    await prisma.$disconnect();
  });

  async function drive(contentId: string, science: boolean) {
    // rev5 (review r4 finding 3): the program comes from the item's skill
    // metadata (amc8-graphs-and-tables-1 belongs to amc-8, not grade-6-math).
    const record = contentCatalog.find((candidate) => candidate.id === contentId)!;
    const program = skillsByCode.get(contentSkillCode(record))!.program as CurriculumProgram;
    expect(program === 'grade-6-science').toBe(science);
    const session = await startSession(identity, { contentId, program });
    const attempt = await recordAttempt(identity, {
      sessionId: session.sessionId,
      ...(science
        ? wrongStructuredBody(contentId)
        : { learnerResponse: 'definitely-not-the-answer' }),
    });

    const first = await hintPost(hintRequest(attempt.attemptId));
    expect(first.status, contentId).toBe(200);
    const firstBody = (await first.json()) as HintBody;
    expect(firstBody.response.status, contentId).toBe('validated');
    expect(firstBody.response.move, contentId).toBeDefined();
    expect(firstBody.response.masteryAdvanced).toBe(false);

    const afterFirst = await prisma.tutorInteraction.findMany({
      where: { attemptId: attempt.attemptId, householdId: identity.householdId },
      select: { moveType: true },
    });
    expect(afterFirst.map((row) => row.moveType)).toEqual([firstBody.response.move!.moveType]);
    const context = await getTutorContext(identity, attempt.attemptId);
    expect(context.state).toBe(firstBody.response.move!.moveType);
    expect(context.priorHintCount).toBe(1);

    const second = await hintPost(hintRequest(attempt.attemptId));
    expect(second.status, contentId).toBe(200);
    const secondBody = (await second.json()) as HintBody;
    expect(secondBody.response.status, contentId).toBe('validated');
    expect(secondBody.response.move, contentId).toBeDefined();
    expect(secondBody.response.masteryAdvanced).toBe(false);
    const afterSecond = await prisma.tutorInteraction.count({
      where: { attemptId: attempt.attemptId, householdId: identity.householdId },
    });
    expect(afterSecond).toBe(2);
    expect((await getTutorContext(identity, attempt.attemptId)).priorHintCount).toBe(2);
  }

  it.each(SCIENCE_ITEMS)('Science item %s: validated move, persisted, then a further move', (id) =>
    drive(id, true),
  );

  it.each(MATH_ITEMS)('Math item %s: validated move, persisted, then a further move', (id) =>
    drive(id, false),
  );
});
