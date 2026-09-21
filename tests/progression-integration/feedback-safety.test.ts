import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AssessmentContentItem } from '../../src/contracts/progression';
import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { submitAssessmentItem } from '../../src/progression/assessment-submission';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const bankRef = { code: 'feedback-safety-bank', version: '1.0.0' } as const;

function assessmentItem(id: string, answer: string): AssessmentContentItem & { hash: string } {
  return {
    id,
    version: '1.0.0',
    hash: `sha256:${id}`,
    title: `Private ${id}`,
    role: 'assessment',
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['States the ratio.'],
    prompt: `Private prompt for ${id}`,
    assessmentBankRef: bankRef,
    solutionRepresentation: answer,
    solutionMethod: 'Read the quantities in order.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: answer,
      acceptedAnswers: [answer],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: [answer],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'integration reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original test fixture.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  };
}

describe('assessment feedback safety', () => {
  let householdId: string;
  let learnerProfileId: string;
  const items = [
    assessmentItem('feedback-item-a', '2:3'),
    assessmentItem('feedback-item-b', '3:4'),
  ];
  const store = createInMemoryAssessmentStore([
    {
      code: bankRef.code,
      version: bankRef.version,
      contentHash: 'sha256:feedback-bank',
      items,
    },
  ]);

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

  it('withholds per-item correctness until the run is scored', async () => {
    const assignment = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.LESSON_ASSESSMENT,
        targetKind: ProgressionTargetKind.LESSON,
        targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
        bankRef,
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:feedback-policy',
        algorithmVersion: 'feedback-1',
        curriculumSnapshotHash: 'sha256:feedback-bank',
        itemsPerAttempt: 2,
        requiredCount: 2,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'feedback-safety-key',
      },
      store,
    );
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Assessment session was not created');

    const inProgress = await submitAssessmentItem(
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
    expect(inProgress.status).toBe('IN_PROGRESS');
    expect(inProgress).not.toHaveProperty('result');
    expect(JSON.stringify(inProgress)).not.toMatch(
      /canonicalAnswer|acceptedAnswers|solutionMethod/,
    );

    const scored = await submitAssessmentItem(
      {
        householdId,
        learnerProfileId,
        assignmentId: assignment.assignment.id,
        sessionId: session.id,
        ordinal: 2,
        learnerResponse: 'wrong',
      },
      store,
    );
    expect(scored.status).toBe('SCORED');
    expect(scored.result).toMatchObject({ outcome: 'FAIL', correctCount: 1, requiredCount: 2 });
    expect(JSON.stringify(scored.result)).not.toMatch(
      /canonicalAnswer|acceptedAnswers|solutionMethod|hintSteps/,
    );
  });
});
