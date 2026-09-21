import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';

import { prisma } from '../../src/server/prisma';
import {
  deleteHouseholdData,
  exportHouseholdData,
  isHouseholdDeletionConfirmed,
} from '../../src/server/household-data';

describe('household deletion confirmation phrase', () => {
  it('only accepts the exact confirmation phrase', () => {
    expect(isHouseholdDeletionConfirmed('DELETE')).toBe(true);
    expect(isHouseholdDeletionConfirmed('delete')).toBe(false);
    expect(isHouseholdDeletionConfirmed(' DELETE ')).toBe(false);
    expect(isHouseholdDeletionConfirmed('')).toBe(false);
    expect(isHouseholdDeletionConfirmed(undefined)).toBe(false);
    expect(isHouseholdDeletionConfirmed(null)).toBe(false);
    expect(isHouseholdDeletionConfirmed(123)).toBe(false);
  });
});

describe('household export and deletion', () => {
  let householdId: string;
  let learnerProfileId: string;
  let attemptId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const parent = await prisma.user.create({
      data: {
        householdId,
        role: 'PARENT',
        email: `export-${householdId}@example.test`,
        passwordHash: 'must-not-export',
      },
    });
    const learner = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { userId: learner.id, householdId, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
    const session = await prisma.session.create({
      data: { householdId, learnerProfileId, contentKey: 'unit-rates-1' },
    });
    const attempt = await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        contentKey: 'unit-rates-1',
        contentVersion: 'content-1',
        learnerResponse: '15',
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 10,
        highestAssistance: 'INDEPENDENT',
        context: 'PRACTICE',
        policyVersion: 'policy-1',
      },
    });
    attemptId = attempt.id;
    await prisma.assistanceEvent.create({
      data: {
        attemptId: attempt.id,
        level: 'GUIDED_FULL_SOLUTION',
        interactionType: 'SOLUTION',
      },
    });
    await prisma.tutorTrace.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        policyVersion: 'policy-1',
        promptTemplateVersion: 'prompt-1',
        modelIdentifier: 'fake-tutor',
        latencyMs: 1,
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
        validationResult: 'VALIDATED',
        outcome: 'MOVE_RETURNED',
        redactedExcerpt: '[redacted learner text]',
      },
    });
    await prisma.user.update({
      where: { id: parent.id },
      data: { passwordHash: 'must-not-export' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('exports evidence while excluding password hashes', async () => {
    const assignment = await prisma.assessmentAssignment.create({
      data: {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.LESSON_ASSESSMENT,
        targetKind: ProgressionTargetKind.LESSON,
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        bankCode: 'private-bank',
        bankVersion: '1.0.0',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
        policyProfileHash: 'sha256:policy',
        algorithmVersion: 'mastery-1',
        curriculumSnapshotHash: 'sha256:curriculum',
        selectedItems: [{ id: 'unattempted-private-item', version: '1.0.0' }],
        excludedItems: [{ id: 'excluded-private-item', version: '1.0.0' }],
        attemptOrdinal: 1,
        requiredCount: 1,
        idempotencyKey: 'export-assignment',
        runState: {
          create: {
            status: 'IN_PROGRESS',
            currentOrdinal: 1,
            submittedOrdinals: [],
            expiresAt: new Date(Date.now() + 60_000),
            lastActivityAt: new Date(),
          },
        },
      },
    });
    const exported = await exportHouseholdData(prisma, householdId);
    expect(exported.attempts).toHaveLength(1);
    expect(exported.traces).toHaveLength(1);
    expect(exported.users[0]).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(exported)).not.toContain('must-not-export');
    expect(exported.attempts[0].id).toBe(attemptId);
    expect(exported.attempts[0].highestAssistance).toBe('GUIDED_FULL_SOLUTION');
    expect(exported).toMatchObject({
      assessmentAssignments: [
        expect.objectContaining({ id: assignment.id, targetCode: 'ratio-language-lesson' }),
      ],
      assessmentResults: [],
      activeAssessmentLeases: [],
      learnerPlacements: [],
      learnerUnitStates: [],
      learnerLessonStates: [],
      unlockGrants: [],
      skipRecords: [],
      overrideRecords: [],
      reviewSchedules: [],
      learningEvents: [],
      shadowDecisions: [],
    });
    expect(JSON.stringify(exported.assessmentAssignments)).not.toContain(
      'unattempted-private-item',
    );
    expect(JSON.stringify(exported.assessmentAssignments)).not.toContain('excluded-private-item');
    expect(exported.assessmentAssignments[0]).not.toHaveProperty('selectedItems');
    expect(exported.assessmentAssignments[0]).not.toHaveProperty('excludedItems');
  });

  it('deletes the household and all dependent evidence atomically', async () => {
    expect(await deleteHouseholdData(prisma, householdId)).toBe(true);
    expect(await prisma.household.findUnique({ where: { id: householdId } })).toBeNull();
    expect(await prisma.attempt.findUnique({ where: { id: attemptId } })).toBeNull();
    expect(await prisma.tutorTrace.count({ where: { householdId } })).toBe(0);
    expect(await prisma.shadowDecision.count({ where: { householdId } })).toBe(0);
    expect(await prisma.learningEvent.count({ where: { householdId } })).toBe(0);
    expect(await prisma.assessmentAssignment.count({ where: { householdId } })).toBe(0);
    expect(await prisma.learnerProfile.count({ where: { id: learnerProfileId } })).toBe(0);
    expect(await deleteHouseholdData(prisma, householdId)).toBe(false);
  });
});
