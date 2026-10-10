import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { AssessmentContentItem, Ref } from '../../src/contracts/progression';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST as hintPost } from '../../src/app/api/phase1/hint/route';

// L8 / S7: "The tutor is never invoked with assessment content." The three
// legitimate routes to attempting content (`startSession`, the practice
// catalog's own role-exclusive schema validation) can never produce an
// attempt bound to an assessment- or review-role item in the first place.
// This test instead attacks the hint route at the layer closest to the
// claim: an attempt whose `contentKey`/`contentVersion` resolve, via the
// immutable `ContentArchive` snapshot table, to an assessment-role record -
// exactly the shape `resolveArchivedContent` (src/content/archive.ts) must
// refuse. If that role check ever regressed, this is the test that would
// catch a hint request being served, and a TutorTrace/TutorInteraction row
// being written, for content that must never be tutored.
function assessmentRoleRecord(id: string): AssessmentContentItem {
  const bankRef: Ref = { code: 'l8-sentinel-lesson-bank', version: '1.0.0' };
  return {
    id,
    version: '1.0.0',
    title: `L8 sentinel ${id}`,
    role: 'assessment',
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['States the ratio.'],
    prompt: 'L8 sentinel assessment prompt - must never be tutored.',
    assessmentBankRef: bankRef,
    solutionRepresentation: 'L8 sentinel canonical answer',
    solutionMethod: 'Read the quantities in order.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: 'L8 sentinel canonical answer',
      acceptedAnswers: ['L8 sentinel canonical answer'],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: ['L8 sentinel canonical answer'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'L8 test fixture',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original test fixture.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  };
}

describe('hint route refuses assessment-role content (L8)', () => {
  let householdId: string;
  let learnerProfileId: string;
  let attemptId: string;
  const contentKey = 'l8-sentinel-assessment-item';
  const contentVersion = '1.0.0';

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'PARENT' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({
      householdId,
      learnerProfileId,
      actorUserId: user.id,
      actorRole: 'PARENT',
    });

    await prisma.contentArchive.create({
      data: {
        contentKey,
        contentVersion,
        content: assessmentRoleRecord(contentKey) as object,
      },
    });

    const session = await prisma.session.create({
      data: { householdId, learnerProfileId, contentKey, activityKind: 'PRACTICE' },
    });
    const attempt = await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        contentKey,
        contentVersion,
        learnerResponse: 'a guess',
        normalizedResponse: 'a guess',
        correctness: 'INCORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 0,
        highestAssistance: 'INDEPENDENT',
        context: 'PRACTICE',
        policyVersion: 'l8-test-1',
      },
    });
    attemptId = attempt.id;
  });

  afterAll(async () => {
    if (householdId) await deleteHouseholdData(prisma, householdId);
    await prisma.contentArchive
      .delete({ where: { contentKey_contentVersion: { contentKey, contentVersion } } })
      .catch(() => undefined);
    await prisma.$disconnect();
  });

  it('refuses the hint and writes no TutorTrace/TutorInteraction row', async () => {
    const response = await hintPost(
      new Request('http://localhost/api/phase1/hint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId, learnerMessage: 'Can you help me with this one?' }),
      }),
    );
    expect(response.status).not.toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty('response');

    const [traces, interactions] = await Promise.all([
      prisma.tutorTrace.findMany({ where: { householdId } }),
      prisma.tutorInteraction.findMany({ where: { householdId, attemptId } }),
    ]);
    expect(traces).toHaveLength(0);
    expect(interactions).toHaveLength(0);
  });
});
