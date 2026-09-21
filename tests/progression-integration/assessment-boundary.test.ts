import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AssessmentContentItem } from '../../src/contracts/progression';
import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import {
  abandonAssessmentRun,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import { resolvePolicyProfile } from '../../src/progression/policy';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const item = {
  id: 'integration-heldout-ratio-language-1',
  version: '1.0.0',
  hash: 'sha256:integration-heldout-item-1',
  title: 'Integration held-out ratio item',
  role: 'assessment',
  skillRef: { code: 'ratio-language', version: '1.0.0' },
  mode: 'core',
  difficulty: 'foundational',
  standards: ['6.RP.A.1'],
  observableEvidence: ['States a ratio in order.'],
  prompt: 'State the ratio.',
  assessmentBankRef: { code: 'integration-heldout-bank', version: '1.0.0' },
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
    reviewer: 'integration reviewer',
    reviewedAt: '2026-01-01',
    originalityStatement: 'Original test fixture.',
  },
  accessibilityNotes: 'Text is sufficient.',
  accessibleAlternative: 'Read the prompt aloud.',
  itemReadinessRefs: [],
} satisfies AssessmentContentItem & { hash: string };

describe('course progression assessment boundary', () => {
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

  async function createAssignment(idempotencyKey: string) {
    const artifacts = loadPolicyArtifacts();
    const profileRecord = artifacts.profiles.find(
      (profile) => profile.code === 'grade-6-math-default',
    );
    if (!profileRecord) throw new Error('Grade 6 Math policy profile is missing');
    const profile = resolvePolicyProfile(profileRecord);
    const accessPolicy = artifacts.accessPolicies.find(
      (policy) => policy.code === 'grade-6-math-access',
    );
    return createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.LESSON_ASSESSMENT,
        targetKind: ProgressionTargetKind.LESSON,
        targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
        bankRef: { code: 'integration-heldout-bank', version: '1.0.0' },
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:integration-policy',
        algorithmVersion: 'integration-1',
        curriculumSnapshotHash: 'sha256:integration-bank',
        itemsPerAttempt: 1,
        requiredCount: 1,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey,
        shadow: {
          requestKind: 'integration-assessment-assignment',
          activityKind: 'LESSON_ASSESSMENT',
          accessPolicy,
          policyProfile: profile,
          skillCodes: ['ratio-language'],
          prerequisiteSkillCodes: { 'ratio-language': [] },
        },
      },
      createInMemoryAssessmentStore([
        {
          code: 'integration-heldout-bank',
          version: '1.0.0',
          contentHash: 'sha256:integration-bank',
          items: [item],
        },
      ]),
    );
  }

  it('persists an immutable assignment/session boundary and redacted shadow evidence', async () => {
    const result = await createAssignment('integration-boundary-key');
    const session = result.assignment.sessions[0];
    expect(session).toMatchObject({
      activityKind: 'LESSON_ASSESSMENT',
      targetCode: 'ratio-language-lesson',
      targetVersion: '1.0.0',
      assignmentId: result.assignment.id,
    });

    const shadow = await prisma.shadowDecision.findFirst({
      where: { householdId, requestKind: 'integration-assessment-assignment' },
    });
    expect(shadow).toMatchObject({
      targetCode: 'ratio-language-lesson',
      shadowDecision: 'DENY',
      actualBehavior: 'ALLOWED',
    });
    expect(shadow ? Object.keys(shadow) : []).not.toEqual(
      expect.arrayContaining(['prompt', 'learnerResponse', 'answer']),
    );
    await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: result.assignment.id,
    });
  });

  it('rejects ended and mismatched sessions before writing an attempt', async () => {
    const ended = await createAssignment('integration-ended-key');
    const endedSession = ended.assignment.sessions[0];
    if (!endedSession) throw new Error('Assessment session was not created');
    await prisma.session.update({
      where: { id: endedSession.id },
      data: { endedAt: new Date() },
    });
    await expect(
      submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: ended.assignment.id,
          sessionId: endedSession.id,
          ordinal: 1,
          learnerResponse: '2:3',
        },
        createInMemoryAssessmentStore([
          {
            code: 'integration-heldout-bank',
            version: '1.0.0',
            contentHash: 'sha256:integration-bank',
            items: [item],
          },
        ]),
      ),
    ).rejects.toMatchObject({ code: 'SESSION_ENDED' });
    expect(await prisma.attempt.count({ where: { sessionId: endedSession.id } })).toBe(0);
    await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: ended.assignment.id,
    });

    const mismatched = await createAssignment('integration-mismatch-key');
    const mismatchedSession = mismatched.assignment.sessions[0];
    if (!mismatchedSession) throw new Error('Assessment session was not created');
    await prisma.session.update({
      where: { id: mismatchedSession.id },
      data: { activityKind: 'PRACTICE' },
    });
    await expect(
      submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: mismatched.assignment.id,
          sessionId: mismatchedSession.id,
          ordinal: 1,
          learnerResponse: '2:3',
        },
        createInMemoryAssessmentStore([
          {
            code: 'integration-heldout-bank',
            version: '1.0.0',
            contentHash: 'sha256:integration-bank',
            items: [item],
          },
        ]),
      ),
    ).rejects.toMatchObject({
      code: 'SESSION_KIND_MISMATCH',
    });
    expect(await prisma.attempt.count({ where: { sessionId: mismatchedSession.id } })).toBe(0);
    await abandonAssessmentRun({
      householdId,
      learnerProfileId,
      assignmentId: mismatched.assignment.id,
    });
  });
});
