import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import {
  PHASE_1_MASTERY_VERSION,
  getPlan,
  recordAttempt,
  startSession,
} from '../../src/phase1/service';
import { contentSessionRequiresAssignment } from '../../src/progression/assignment-binding';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

/**
 * MATH-GEO-6 / GEO6-01: `prism-volume-2` is the first content id registered at
 * two reviewed versions (content-2 kept for history, content-3 the D-354
 * correction). Synthetic household and the synthetic local database only.
 *
 * (a) NEW work resolves to content-3 and is not offered twice; content-3
 *     rejects the old substring false accept.
 * (b) A session already bound to content-2 keeps grading content-2 with the
 *     unchanged content-2 semantics and the same assignment binding.
 */
const FALSE_ACCEPT = '12 cubic meters; the space inside the box';
const CORRECT = '2 cubic meters; the space inside the box';

describe('prism-volume-2 content-2 to content-3 transition', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
  });

  beforeEach(async () => {
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
    await prisma.session.updateMany({
      where: { householdId, endedAt: null },
      data: { endedAt: new Date() },
    });
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const identity = () => ({ householdId, learnerProfileId });

  it('both versions are registered and servable, and the content-2 false accept is a recorded fact', () => {
    expect(
      contentCatalog.filter((item) => item.id === 'prism-volume-2').map((item) => item.version),
    ).toEqual(['content-2', 'content-3']);
    expect(
      servableContentCatalog.filter((item) => item.id === 'prism-volume-2').map((i) => i.version),
    ).toEqual(['content-2', 'content-3']);
  });

  it('(a) a NEW session serves and grades content-3: the false accept is rejected, the correct answer accepted', async () => {
    const session = await startSession(identity(), { contentId: 'prism-volume-2' });
    expect(session.resumed).toBe(false);
    expect(session.content).toMatchObject({ id: 'prism-volume-2', version: 'content-3' });
    const row = await prisma.session.findUniqueOrThrow({ where: { id: session.sessionId } });
    expect(row).toMatchObject({ targetCode: 'prism-volume-2', targetVersion: 'content-3' });
    expect(row.assignmentId).toBeNull();

    const wrong = await recordAttempt(identity(), {
      sessionId: session.sessionId,
      learnerResponse: FALSE_ACCEPT,
    });
    expect(wrong.correctness).toBe('INCORRECT');
    const right = await recordAttempt(identity(), {
      sessionId: session.sessionId,
      learnerResponse: CORRECT,
    });
    expect(right.correctness).toBe('CORRECT');
    const attempts = await prisma.attempt.findMany({
      where: { sessionId: session.sessionId },
      select: { contentKey: true, contentVersion: true },
    });
    expect(attempts).toEqual([
      { contentKey: 'prism-volume-2', contentVersion: 'content-3' },
      { contentKey: 'prism-volume-2', contentVersion: 'content-3' },
    ]);
  });

  it('(a) the plan offers prism-volume-2 at most once even though two versions are servable', async () => {
    // A developing (not secure) prism-volume estimate lets the planner add the challenge item.
    await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'prism-volume',
        estimate: 0.4,
        confidenceBand: 'LOW',
        algorithmVersion: PHASE_1_MASTERY_VERSION,
        independentDelayedCheck: false,
      },
    });
    const plan = await getPlan(identity(), { timeBudgetMinutes: 400 });
    const prism = plan.items.filter((item) => item.contentId.startsWith('prism-volume-'));
    expect(new Set(prism.map((item) => item.contentId)).size).toBe(prism.length);
    expect(plan.items.filter((item) => item.contentId === 'prism-volume-2')).toHaveLength(1);
  });

  it('(b) a session already bound to content-2 keeps grading content-2 with unchanged semantics and binding', async () => {
    const legacy = await prisma.session.create({
      data: {
        householdId,
        learnerProfileId,
        contentKey: 'prism-volume-2',
        activityKind: 'PRACTICE',
        targetCode: 'prism-volume-2',
        targetVersion: 'content-2',
      },
    });
    const resumed = await startSession(identity(), { contentId: 'prism-volume-2' });
    expect(resumed.resumed).toBe(true);
    expect(resumed.sessionId).toBe(legacy.id);
    // The session row is untouched by the resume.
    const row = await prisma.session.findUniqueOrThrow({ where: { id: legacy.id } });
    expect(row).toMatchObject({ targetVersion: 'content-2', assignmentId: null, endedAt: null });

    // Grading resolves the bound historical version: content-2 still accepts its documented
    // false accept (historical replay preserved, not silently re-scored under content-3).
    const falseAccept = await recordAttempt(identity(), {
      sessionId: legacy.id,
      learnerResponse: FALSE_ACCEPT,
    });
    expect(falseAccept.correctness).toBe('CORRECT');
    const right = await recordAttempt(identity(), {
      sessionId: legacy.id,
      learnerResponse: CORRECT,
    });
    expect(right.correctness).toBe('CORRECT');
    const attempts = await prisma.attempt.findMany({
      where: { sessionId: legacy.id },
      select: { contentVersion: true },
    });
    expect(attempts.map((a) => a.contentVersion)).toEqual(['content-2', 'content-2']);

    // The resume path presents the BOUND version (content-2), the same record it grades; the
    // newest (content-3) is used only for new sessions. Prompt, title and accessibility text
    // are those of the content-2 record (identical to content-3 by D-350, so the label is the
    // observable difference).
    const v2 = contentCatalog.find((i) => i.id === 'prism-volume-2' && i.version === 'content-2')!;
    expect(resumed.content).toMatchObject({
      id: 'prism-volume-2',
      version: 'content-2',
      title: v2.title,
      prompt: v2.prompt,
      accessibilityNotes: v2.accessibilityNotes,
    });
  });

  it('a resumed single-version item is unchanged: same record, same version, resumed flag', async () => {
    const first = await startSession(identity(), { contentId: 'prism-volume-1' });
    const again = await startSession(identity(), { contentId: 'prism-volume-1' });
    expect(first.resumed).toBe(false);
    expect(again.resumed).toBe(true);
    expect(again.sessionId).toBe(first.sessionId);
    expect(again.content).toEqual(first.content);
    expect(again.content.version).toBe('content-1');
  });

  it('assignment binding is unchanged for prism-volume-2 (unclaimed skill, no assignment required)', () => {
    expect(contentSessionRequiresAssignment('PRACTICE', 'prism-volume-2')).toBe(false);
    expect(contentSessionRequiresAssignment('PLACEMENT', 'prism-volume-2')).toBe(false);
    expect(contentSessionRequiresAssignment('LESSON_ASSESSMENT', 'prism-volume-2')).toBe(true);
  });
});
