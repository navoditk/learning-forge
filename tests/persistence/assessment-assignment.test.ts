import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AssessmentContentItem } from '../../src/contracts/progression';
import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { resolvePolicyProfile } from '../../src/progression/policy';
import {
  abandonAssessmentRun,
  getCurrentAssessmentItem,
  invalidateAssessmentRun,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
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

const assessmentItemTwo = {
  ...assessmentItem,
  id: 'heldout-ratio-language-2',
  hash: 'sha256:heldout-item-2',
  title: 'Held-out ratio item two',
  prompt: 'State the second ratio.',
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
    const artifacts = loadPolicyArtifacts();
    const profileRecord = artifacts.profiles.find(
      (profile) => profile.code === 'grade-6-math-default',
    );
    if (!profileRecord) throw new Error('Grade 6 Math policy profile is missing');
    const profile = resolvePolicyProfile(profileRecord);
    const accessPolicy = artifacts.accessPolicies.find(
      (policy) => policy.code === 'grade-6-math-access' && policy.version === '1.1.0',
    );
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
      itemsPerAttempt: 2,
      requiredCount: 2,
      authoredBankItemCount: 2,
      authoredBankSkillCodes: ['ratio-language'],
      expiresAt: new Date(Date.now() + 60_000),
      idempotencyKey: 'assignment-key-1',
      maxReassessments: profile.maxReassessments,
      reassessmentCooldownHours: profile.reassessmentCooldownHours,
      shadow: {
        requestKind: 'test-assessment-assignment',
        activityKind: 'LESSON_ASSESSMENT' as const,
        accessPolicy,
        policyProfile: profile,
        skillCodes: ['ratio-language'],
        prerequisiteSkillCodes: { 'ratio-language': [] },
      },
    } as const;
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem, assessmentItemTwo],
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
    expect(
      await prisma.shadowDecision.count({
        where: { householdId, requestKind: 'test-assessment-assignment' },
      }),
    ).toBe(2);

    const session = first.assignment.sessions[0];
    if (!session) throw new Error('Assessment session was not created');
    expect(session.policyProfileCode).toBe('grade-6-math-default');
    const currentItem = await getCurrentAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: first.assignment.id,
        sessionId: session.id,
      },
      store,
    );
    expect(currentItem.item).toMatchObject({
      title: 'Held-out ratio item',
      prompt: 'State the ratio.',
    });
    expect(currentItem.item).not.toHaveProperty('solutionRepresentation');
    expect(currentItem.item).not.toHaveProperty('deterministicValidator');
    const outOfOrder = await submitAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: first.assignment.id,
        sessionId: session.id,
        ordinal: 2,
        learnerResponse: '2:3',
      },
      store,
    );
    expect(outOfOrder.status).toBe('IN_PROGRESS');
    const remainingItem = await getCurrentAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: first.assignment.id,
        sessionId: session.id,
      },
      store,
    );
    expect(remainingItem.ordinal).toBe(1);
    expect(remainingItem.item.prompt).toBe('State the ratio.');
    const submitted = await submitAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: first.assignment.id,
        sessionId: session.id,
        ordinal: 1,
        learnerResponse: '2:3',
      },
      store,
    );
    expect(submitted.status).toBe('SCORED');
    expect(submitted.result).toMatchObject({ outcome: 'PASS', correctCount: 2, requiredCount: 2 });
    expect(
      await prisma.learnerLessonState.findUnique({
        where: {
          learnerProfileId_lessonCode_lessonVersion: {
            learnerProfileId,
            lessonCode: 'ratio-language-lesson',
            lessonVersion: '1.0.0',
          },
        },
        select: { completionStatus: true, remediationStatus: true },
      }),
    ).toEqual({ completionStatus: 'COMPLETE_BY_SKIP', remediationStatus: 'NONE' });
    expect(
      await prisma.activeAssessmentLease.count({ where: { householdId, releasedAt: null } }),
    ).toBe(0);

    const assignmentWithShadowFailure = await createAssessmentAssignment(
      { ...input, idempotencyKey: 'assignment-shadow-failure' },
      store,
      prisma,
      () => new Promise<never>(() => undefined),
    );
    expect(assignmentWithShadowFailure.replayed).toBe(false);
    expect(
      await prisma.assessmentAssignment.findUnique({
        where: { id: assignmentWithShadowFailure.assignment.id },
      }),
    ).not.toBeNull();
    expect(
      await prisma.shadowDecision.count({
        where: { householdId, requestKind: 'test-assessment-assignment' },
      }),
    ).toBe(2);
    await expect(
      createAssessmentAssignment(
        {
          ...input,
          idempotencyKey: 'assignment-hash-mismatch',
          curriculumSnapshotHash: 'sha256:wrong',
        },
        store,
      ),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_BANK_METADATA_MISMATCH' });
    await expect(
      createAssessmentAssignment(
        { ...input, idempotencyKey: 'assignment-count-mismatch', authoredBankItemCount: 1 },
        store,
      ),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_BANK_METADATA_MISMATCH' });
    await expect(
      createAssessmentAssignment(
        {
          ...input,
          idempotencyKey: 'assignment-skill-mismatch',
          authoredBankSkillCodes: ['unit-rates'],
        },
        store,
      ),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_BANK_METADATA_MISMATCH' });
    await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: assignmentWithShadowFailure.assignment.id,
    });
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
      requiredCount: 1,
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
    const second = await createAssessmentAssignment(
      { ...base, idempotencyKey: 'assignment-key-2' },
      store,
    );
    expect(second.replayed).toBe(false);
    await expect(
      createAssessmentAssignment({ ...base, idempotencyKey: 'assignment-key-3' }, store),
    ).rejects.toMatchObject({ code: 'ACTIVE_ASSIGNMENT_EXISTS' });
    const abandoned = await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: second.assignment.id,
    });
    expect(abandoned).toMatchObject({
      status: 'ABANDONED',
      result: { outcome: 'INCONCLUSIVE', correctCount: 0, requiredCount: 1 },
    });
    expect(await prisma.activeAssessmentLease.count({ where: { releasedAt: null } })).toBe(0);
    expect(
      await prisma.assessmentResult.findUnique({
        where: { assignmentId: second.assignment.id },
        select: { outcome: true },
      }),
    ).toEqual({ outcome: 'INCONCLUSIVE' });
  });

  it('scopes a failed assignment-backed review lapse to the tested skill version', async () => {
    await prisma.reviewSchedule.upsert({
      where: {
        learnerProfileId_skillCode_skillVersion: {
          learnerProfileId,
          skillCode: 'ratio-language',
          skillVersion: '1.0.0',
        },
      },
      update: { dueAt: new Date(Date.now() - 1_000), lastOutcome: 'PASSED' },
      create: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-language',
        skillVersion: '1.0.0',
        dueAt: new Date(Date.now() - 1_000),
        intervalIndex: 0,
        lastOutcome: 'PASSED',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
        scheduleVersion: '1.0.0',
      },
    });
    await prisma.masteryEstimate.upsert({
      where: {
        learnerProfileId_skillCode_algorithmVersion: {
          learnerProfileId,
          skillCode: 'ratio-language',
          algorithmVersion: 'mastery-1',
        },
      },
      update: { independentDelayedCheck: true },
      create: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-language',
        estimate: 1,
        confidenceBand: 'MEDIUM',
        algorithmVersion: 'mastery-1',
        independentDelayedCheck: true,
      },
    });
    await prisma.learnerLessonState.upsert({
      where: {
        learnerProfileId_lessonCode_lessonVersion: {
          learnerProfileId,
          lessonCode: 'ratio-language-lesson',
          lessonVersion: '1.0.0',
        },
      },
      update: { completionStatus: 'COMPLETE_BY_SKIP', remediationStatus: 'NONE' },
      create: {
        householdId,
        learnerProfileId,
        lessonCode: 'ratio-language-lesson',
        lessonVersion: '1.0.0',
        completionStatus: 'COMPLETE_BY_SKIP',
        remediationStatus: 'NONE',
        policyProfileVersion: '1.0.0',
      },
    });

    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-review-bank',
        version: '1.0.0',
        contentHash: 'sha256:review-bank',
        items: [assessmentItem],
      },
    ]);
    const assignment = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.REVIEW,
        targetKind: ProgressionTargetKind.SKILL,
        targetRef: { code: 'ratio-language', version: '1.0.0' },
        bankRef: { code: 'ratio-review-bank', version: '1.0.0' },
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:policy',
        algorithmVersion: 'mastery-1',
        curriculumSnapshotHash: 'sha256:review-bank',
        itemsPerAttempt: 1,
        requiredCount: 1,
        requiredSkillCodes: ['ratio-language'],
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'review-lapse-assignment',
      },
      store,
    );
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Review assessment session was not created');
    await submitAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: assignment.assignment.id,
        sessionId: session.id,
        ordinal: 1,
        learnerResponse: 'wrong',
      },
      store,
    );

    await expect(
      prisma.reviewSchedule.findUnique({
        where: {
          learnerProfileId_skillCode_skillVersion: {
            learnerProfileId,
            skillCode: 'ratio-language',
            skillVersion: '1.0.0',
          },
        },
        select: { lastOutcome: true, dueAt: true },
      }),
    ).resolves.toMatchObject({ lastOutcome: 'LAPSED' });
    await expect(
      prisma.learnerLessonState.findUnique({
        where: {
          learnerProfileId_lessonCode_lessonVersion: {
            learnerProfileId,
            lessonCode: 'ratio-language-lesson',
            lessonVersion: '1.0.0',
          },
        },
        select: { completionStatus: true, remediationStatus: true },
      }),
    ).resolves.toEqual({ completionStatus: 'COMPLETE_BY_SKIP', remediationStatus: 'ACTIVE' });
    await expect(
      prisma.masteryEstimate.findUnique({
        where: {
          learnerProfileId_skillCode_algorithmVersion: {
            learnerProfileId,
            skillCode: 'ratio-language',
            algorithmVersion: 'mastery-1',
          },
        },
        select: { independentDelayedCheck: true },
      }),
    ).resolves.toEqual({ independentDelayedCheck: false });
  });

  it('preserves submitted attempts when an assessment expires', async () => {
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem],
      },
    ]);
    const assignment = await createAssessmentAssignment(
      {
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
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'assignment-key-expired',
      },
      store,
    );
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Assessment session was not created');
    await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        contentKey: assessmentItem.id,
        contentVersion: assessmentItem.version,
        learnerResponse: '2:3',
        normalizedResponse: '2:3',
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 0,
        highestAssistance: 'INDEPENDENT',
        context: 'LESSON_ASSESSMENT',
        policyVersion: '1.0.0',
      },
    });
    await prisma.assessmentRunState.update({
      where: { assignmentId: assignment.assignment.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    await expect(
      submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: assignment.assignment.id,
          sessionId: session.id,
          ordinal: 1,
          learnerResponse: '2:3',
        },
        store,
      ),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_EXPIRED' });
    const result = await prisma.assessmentResult.findUnique({
      where: { assignmentId: assignment.assignment.id },
      select: { outcome: true, correctCount: true, itemResults: true },
    });
    expect(result?.outcome).toBe('INCONCLUSIVE');
    expect(result?.correctCount).toBe(1);
    expect(result?.itemResults).toHaveLength(1);
  });

  it('invalidates defective runs while retaining superseded evidence and releasing the lease', async () => {
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem],
      },
    ]);
    const assignment = await createAssessmentAssignment(
      {
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
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'assignment-key-invalidated',
      },
      store,
    );
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Assessment session was not created');
    await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        contentKey: assessmentItem.id,
        contentVersion: assessmentItem.version,
        learnerResponse: '2:3',
        normalizedResponse: '2:3',
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 0,
        highestAssistance: 'INDEPENDENT',
        context: 'LESSON_ASSESSMENT',
        policyVersion: '1.0.0',
      },
    });
    const invalidated = await invalidateAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: assignment.assignment.id,
      invalidationReason: 'Assessment bank version was defective.',
      invalidatedByUserId: 'operator-test-user',
    });
    expect(invalidated.status).toBe('INVALIDATED');
    expect(invalidated.result).toMatchObject({ outcome: 'INVALIDATED', correctCount: 0 });
    expect(invalidated.result.itemResults).toEqual([
      expect.objectContaining({ attemptId: expect.any(String), superseded: true }),
    ]);
    expect(
      await prisma.activeAssessmentLease.count({
        where: { assignmentId: assignment.assignment.id, releasedAt: null },
      }),
    ).toBe(0);
    const nextAssignment = await createAssessmentAssignment(
      {
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
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'assignment-key-after-invalidated',
      },
      store,
    );
    // The earlier scored fixture counts; this invalidated run does not.
    expect(nextAssignment.assignment.attemptOrdinal).toBe(2);
    await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: nextAssignment.assignment.id,
    });
  });

  it('finalizes an expired active lease before acquiring the next assignment', async () => {
    const store = createInMemoryAssessmentStore([
      {
        code: 'ratio-language-lesson-bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [assessmentItem],
      },
    ]);
    const expired = await createAssessmentAssignment(
      {
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
        requiredCount: 1,
        expiresAt: new Date(Date.now() - 1_000),
        idempotencyKey: 'assignment-key-stale-lease',
      },
      store,
    );
    const replacement = await createAssessmentAssignment(
      {
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
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'assignment-key-after-stale-lease',
      },
      store,
    );
    expect(replacement.replayed).toBe(false);
    expect(
      await prisma.assessmentResult.findUnique({
        where: { assignmentId: expired.assignment.id },
        select: { outcome: true },
      }),
    ).toEqual({ outcome: 'INCONCLUSIVE' });
    expect(
      await prisma.activeAssessmentLease.findUnique({
        where: { assignmentId: expired.assignment.id },
        select: { releasedAt: true },
      }),
    ).toMatchObject({ releasedAt: expect.any(Date) });
  });

  it('projects a passed unit assessment into unit completion state', async () => {
    const practiceSession = await prisma.session.create({
      data: {
        householdId,
        learnerProfileId,
        contentKey: 'ratio-language-1',
        activityKind: 'PRACTICE',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        policyProfileVersion: '1.0.0',
      },
    });
    await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: practiceSession.id,
        contentKey: 'ratio-language-1',
        contentVersion: '1.0.0',
        learnerResponse: '2:3',
        normalizedResponse: '2:3',
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 0,
        highestAssistance: 'INDEPENDENT',
        context: 'PRACTICE',
        policyVersion: '1.0.0',
      },
    });
    await prisma.learnerUnitState.update({
      where: {
        learnerProfileId_unitCode_unitVersion: {
          learnerProfileId,
          unitCode: 'ratios-and-proportional-reasoning',
          unitVersion: '1.0.0',
        },
      },
      data: { completionStatus: 'ASSESSMENT_PENDING' },
    });

    const store = createInMemoryAssessmentStore([
      {
        code: 'ratios-proportional-reasoning-unit-bank',
        version: '1.0.0',
        contentHash: 'sha256:unit-bank',
        items: [assessmentItem],
      },
    ]);
    const assignment = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.UNIT_ASSESSMENT,
        targetKind: ProgressionTargetKind.UNIT,
        targetRef: { code: 'ratios-and-proportional-reasoning', version: '1.0.0' },
        bankRef: { code: 'ratios-proportional-reasoning-unit-bank', version: '1.0.0' },
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:policy',
        algorithmVersion: 'mastery-1',
        curriculumSnapshotHash: 'sha256:unit-bank',
        itemsPerAttempt: 1,
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'unit-assessment-key',
      },
      store,
    );
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Unit assessment session was not created');

    await submitAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: assignment.assignment.id,
        sessionId: session.id,
        ordinal: 1,
        learnerResponse: '2:3',
      },
      store,
    );

    await expect(
      prisma.learnerUnitState.findUnique({
        where: {
          learnerProfileId_unitCode_unitVersion: {
            learnerProfileId,
            unitCode: 'ratios-and-proportional-reasoning',
            unitVersion: '1.0.0',
          },
        },
        select: { completionStatus: true },
      }),
    ).resolves.toEqual({ completionStatus: 'COMPLETE' });
  });
});
