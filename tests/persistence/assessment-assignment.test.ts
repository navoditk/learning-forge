import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AssessmentContentItem } from '../../src/contracts/progression';
import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const assessmentItem = {
  id: 'heldout-ratio-language-1',
  version: '1.0.0',
  hash: 'sha256:heldout-item-1',
  title: 'Held-out ratio item',
  role: 'assessment',
  skillRef: { code: 'ratio-language', version: '1.0.0' },
  mode: 'core',
  difficulty: 'foundational',
  standards: ['6.RP.A.1'],
  observableEvidence: ['States a ratio in order.'],
  prompt: 'State the ratio.',
  assessmentBankRef: { code: 'ratio-language-lesson-bank', version: '1.0.0' },
  solutionRepresentation: 'A ratio',
  solutionMethod: 'Read the quantities in order.',
  deterministicValidator: {
    type: 'ratio',
    canonicalAnswer: '2:3',
    acceptedAnswers: ['2:3'],
    equivalenceNotes: 'Equivalent ratio forms are accepted.',
  },
  misconceptionCodes: [],
  forbiddenLeakagePatterns: ['2:3'],
  provenance: { origin: 'original', licenseStatus: 'owned' },
  review: {
    status: 'reviewed',
    reviewer: 'reviewer',
    reviewedAt: '2026-01-01',
    originalityStatement: 'Original.',
  },
  accessibilityNotes: 'Text is sufficient.',
  accessibleAlternative: 'Read the prompt aloud.',
  itemReadinessRefs: [],
} satisfies AssessmentContentItem & { hash: string };

describe('assessment assignment persistence', () => {
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

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('creates one assignment/run/lease and replays the same idempotency key', async () => {
    const input = {
      householdId,
      learnerProfileId,
      kind: AssessmentKind.LESSON_ASSESSMENT,
      targetKind: ProgressionTargetKind.LESSON,
      targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
      bankRef: { code: 'ratio-language-lesson-bank', version: '1.0.0' },
      policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
      policyProfileHash: 'sha256:policy',
      algorithmVersion: 'mastery-1',
      curriculumSnapshotHash: 'sha256:bank',
      itemsPerAttempt: 1,
      expiresAt: new Date(Date.now() + 60_000),
      idempotencyKey: 'assignment-key-1',
    } as const;
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem],
      },
    ]);
    const first = await createAssessmentAssignment(input, store);
    const replay = await createAssessmentAssignment(input, store);
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.assignment.id).toBe(first.assignment.id);
    expect(await prisma.assessmentAssignment.count({ where: { householdId } })).toBe(1);
    expect(await prisma.assessmentRunState.count()).toBe(1);
    expect(await prisma.activeAssessmentLease.count()).toBe(1);
  });

  it('rejects conflicting idempotency and a second active target', async () => {
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem],
      },
    ]);
    const base = {
      householdId,
      learnerProfileId,
      kind: AssessmentKind.LESSON_ASSESSMENT,
      targetKind: ProgressionTargetKind.LESSON,
      targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
      bankRef: { code: 'ratio-language-lesson-bank', version: '1.0.0' },
      policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
      policyProfileHash: 'sha256:policy',
      algorithmVersion: 'mastery-1',
      curriculumSnapshotHash: 'sha256:bank',
      itemsPerAttempt: 1,
      expiresAt: new Date(Date.now() + 60_000),
    } as const;
    await expect(
      createAssessmentAssignment(
        {
          ...base,
          idempotencyKey: 'assignment-key-1',
          targetRef: { code: 'other', version: '1.0.0' },
        },
        store,
      ),
    ).rejects.toMatchObject({
      code: 'IDEMPOTENCY_KEY_CONFLICT',
    });
    await expect(
      createAssessmentAssignment({ ...base, idempotencyKey: 'assignment-key-2' }, store),
    ).rejects.toMatchObject({
      code: 'ACTIVE_ASSIGNMENT_EXISTS',
    });
  });
});
