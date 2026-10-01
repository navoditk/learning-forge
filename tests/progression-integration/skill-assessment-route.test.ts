import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST } from '../../src/app/api/progression/assessment/assignment/route';

/**
 * Route boundary for skill-targeted assignments. No private package is
 * mounted, so a request that passes every refusal reaches the fail-closed
 * store and returns 503 rather than serving anything.
 */
describe('skill-targeted assessment assignment route', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({ householdId, learnerProfileId });
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const post = async (body: Record<string, string>) => {
    const response = await POST(
      new Request('http://localhost/api/progression/assessment/assignment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetVersion: '1.0.0', idempotencyKey: 'route-key-0001', ...body }),
      }) as never,
    );
    return { status: response.status, body: (await response.json()) as { reasonCode: string } };
  };

  it('refuses a kind that does not match a skill target', async () => {
    expect(
      await post({ kind: 'PLACEMENT', targetKind: 'SKILL', targetCode: 'ratio-language' }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'KIND_TARGET_MISMATCH' } });
  });

  it('refuses a skill outside the pilot unit', async () => {
    expect(
      await post({ kind: 'DELAYED_CHECK', targetKind: 'SKILL', targetCode: 'gcf-and-lcm' }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'VERSION_MISMATCH' } });
  });

  it('refuses a delayed check with no prior exposure', async () => {
    expect(
      await post({ kind: 'DELAYED_CHECK', targetKind: 'SKILL', targetCode: 'ratio-language' }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'NO_PRIOR_EXPOSURE' } });
  });

  it('reaches the fail-closed store for an eligible review', async () => {
    await prisma.reviewSchedule.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'unit-rates',
        skillVersion: '1.0.0',
        dueAt: new Date(Date.now() - 60_000),
        intervalIndex: 0,
        lastOutcome: 'CONFIRMED',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
        scheduleVersion: 'fixture',
      },
    });
    expect(
      await post({ kind: 'REVIEW', targetKind: 'SKILL', targetCode: 'unit-rates' }),
    ).toMatchObject({ status: 503, body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' } });
  });

  it('checks a replayed idempotency key before eligibility (D-54)', async () => {
    await prisma.assessmentAssignment.create({
      data: {
        householdId,
        learnerProfileId,
        kind: 'REVIEW',
        targetKind: 'SKILL',
        targetCode: 'ratio-tables',
        targetVersion: '1.0.0',
        bankCode: 'ratio-tables-review-bank',
        bankVersion: '1.0.0',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
        policyProfileHash: 'sha256:fixture',
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: 'sha256:fixture',
        selectedItems: [],
        excludedItems: [],
        attemptOrdinal: 1,
        idempotencyKey: 'route-replay-key',
      },
    });
    // No review is due for ratio-tables, so eligibility alone would refuse
    // with REVIEW_NOT_DUE; the replay path goes on to the fail-closed store.
    expect(
      await post({
        kind: 'REVIEW',
        targetKind: 'SKILL',
        targetCode: 'ratio-tables',
        idempotencyKey: 'route-replay-key',
      }),
    ).toMatchObject({ status: 503, body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' } });
  });

  const delayedAssignment = (skillCode: string, itemIds: readonly string[], key: string) =>
    prisma.assessmentAssignment.create({
      data: {
        householdId,
        learnerProfileId,
        kind: 'DELAYED_CHECK',
        targetKind: 'SKILL',
        targetCode: skillCode,
        targetVersion: '1.0.0',
        bankCode: `${skillCode}-delayed-check-bank`,
        bankVersion: '1.0.0',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
        policyProfileHash: 'sha256:fixture',
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: 'sha256:fixture',
        selectedItems: itemIds.map((id, index) => ({
          id,
          version: '1.0.0',
          hash: `sha256:${id}`,
          ordinal: index + 1,
        })),
        excludedItems: [],
        attemptOrdinal: 1,
        idempotencyKey: key,
      },
    });

  it('reports a live run for the target as ACTIVE_ASSIGNMENT_EXISTS', async () => {
    await prisma.learningEvent.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-tables',
        skillVersion: '1.0.0',
        kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        occurredAt: new Date(Date.now() - 3 * 24 * 3_600_000),
      },
    });
    const assignment = await delayedAssignment('ratio-tables', ['live-a', 'live-b'], 'live-run');
    await prisma.activeAssessmentLease.create({
      data: {
        householdId,
        learnerProfileId,
        kind: 'DELAYED_CHECK',
        targetCode: 'ratio-tables',
        targetVersion: '1.0.0',
        bankVersion: '1.0.0',
        assignmentId: assignment.id,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
    expect(
      await post({
        kind: 'DELAYED_CHECK',
        targetKind: 'SKILL',
        targetCode: 'ratio-tables',
        idempotencyKey: 'route-live-0001',
      }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'ACTIVE_ASSIGNMENT_EXISTS' } });
  });

  it('records NEEDS_HELP when it refuses a stranded skill (D-69)', async () => {
    const failed = await delayedAssignment('ratio-language', ['seen-a', 'seen-b'], 'strand-1');
    await prisma.assessmentResult.create({
      data: {
        householdId,
        learnerProfileId,
        assignmentId: failed.id,
        outcome: 'FAIL',
        itemResults: [],
        correctCount: 0,
        requiredCount: 2,
        algorithmVersion: 'mastery-phase-1-1',
        policyProfileHash: 'sha256:fixture',
        scoredAt: new Date(Date.now() - 2 * 24 * 3_600_000),
      },
    });
    await delayedAssignment('ratio-language', ['seen-c', 'seen-d', 'seen-e', 'seen-f'], 'strand-2');
    expect(
      await post({
        kind: 'DELAYED_CHECK',
        targetKind: 'SKILL',
        targetCode: 'ratio-language',
        idempotencyKey: 'route-strand-0001',
      }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'NEEDS_HELP' } });
    const lesson = await prisma.learnerLessonState.findFirstOrThrow({
      where: { learnerProfileId, lessonCode: 'ratio-language-lesson' },
    });
    expect(lesson.remediationStatus).toBe('NEEDS_HELP');
  });
});
