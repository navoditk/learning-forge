import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAssessmentStore } from '../../src/assessment/store';
import { PILOT_UNITS } from '../../src/curriculum/pilot-catalog';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { submitAssessmentItem } from '../../src/progression/assessment-submission';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { placementProbeBank } from '../../src/progression/placement-probe';
import { policyHash } from '../../src/progression/policy';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST } from '../../src/app/api/progression/assessment/assignment/route';

const unit = PILOT_UNITS[0]!;
const profileRef = { code: 'grade-6-math-default', version: '1.1.0' };

describe('placement probes (D-64, D-68)', () => {
  let householdId: string;
  let learnerProfileId: string;
  let run = 0;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
  });

  beforeEach(async () => {
    await prisma.learnerPlacement.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.deleteMany({ where: { householdId } });
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  /** Runs a full probe, answering correctly only for the listed skills. */
  async function probe(correctSkills: readonly string[]) {
    run += 1;
    const profile = resolvePinnedPolicyProfile(profileRef);
    const bank = placementProbeBank(unit)!;
    const store = createAssessmentStore();
    const { assignment } = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: 'PLACEMENT',
        targetKind: 'UNIT',
        targetRef: { code: unit.code, version: unit.version },
        bankRef: { code: bank.code, version: bank.version },
        policyProfileRef: profileRef,
        policyProfileHash: policyHash(profile),
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: bank.contentHash,
        itemsPerAttempt: Math.min(bank.items.length, profile.placementProbeMaxItems),
        requiredCount: bank.items.length,
        requiredSkillCodes: bank.items.map((item) => item.skillRef.code),
        expiresAt: new Date(Date.now() + 3_600_000),
        idempotencyKey: `placement-${run}`,
      },
      store,
    );
    for (const selected of assignment.selectedItems as { id: string; ordinal: number }[]) {
      const item = bank.items.find((candidate) => candidate.id === selected.id)!;
      await submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: assignment.id,
          sessionId: assignment.sessions[0]!.id,
          ordinal: selected.ordinal,
          learnerResponse: correctSkills.includes(item.skillRef.code)
            ? item.deterministicValidator.canonicalAnswer
            : 'not the answer',
        },
        store,
      );
    }
    return assignment;
  }

  const lessonStatus = async (lessonCode: string) =>
    (
      await prisma.learnerLessonState.findUnique({
        where: {
          learnerProfileId_lessonCode_lessonVersion: {
            learnerProfileId,
            lessonCode,
            lessonVersion: '1.0.0',
          },
        },
      })
    )?.completionStatus;

  it('places at the first missed lesson and skips earlier lessons only', async () => {
    const assignment = await probe(['ratio-language', 'ratio-tables']);
    expect(await lessonStatus('ratio-language-lesson')).toBe('SKIPPED_BY_PLACEMENT');
    expect(await lessonStatus('unit-rates-lesson')).toBe('AVAILABLE');
    expect(await lessonStatus('ratio-tables-lesson')).toBeUndefined();
    const placement = await prisma.learnerPlacement.findFirstOrThrow({
      where: { learnerProfileId },
    });
    expect(placement).toMatchObject({
      programCode: 'grade-6-math',
      unitCode: unit.code,
      lessonCode: 'unit-rates-lesson',
      method: 'PLACEMENT_PROBE',
    });
    expect(placement.evidenceRefs).toMatchObject({ assignmentId: assignment.id });
    // Placement is weak evidence: it never writes mastery (§9.3).
    expect(await prisma.masteryEstimate.count({ where: { learnerProfileId } })).toBe(0);
  });

  it('places at the final lesson when every probe item is correct', async () => {
    await probe(['ratio-language', 'unit-rates', 'ratio-tables']);
    expect(await lessonStatus('ratio-language-lesson')).toBe('SKIPPED_BY_PLACEMENT');
    expect(await lessonStatus('unit-rates-lesson')).toBe('SKIPPED_BY_PLACEMENT');
    expect(await lessonStatus('ratio-tables-lesson')).toBe('AVAILABLE');
  });

  it('never moves a lesson the learner has already started', async () => {
    await prisma.learnerLessonState.create({
      data: {
        householdId,
        learnerProfileId,
        lessonCode: 'ratio-language-lesson',
        lessonVersion: '1.0.0',
        completionStatus: 'IN_PROGRESS',
        remediationStatus: 'NONE',
        policyProfileCode: profileRef.code,
        policyProfileVersion: profileRef.version,
      },
    });
    await probe(['ratio-language', 'unit-rates']);
    expect(await lessonStatus('ratio-language-lesson')).toBe('IN_PROGRESS');
    expect(await lessonStatus('unit-rates-lesson')).toBe('SKIPPED_BY_PLACEMENT');
    expect(await lessonStatus('ratio-tables-lesson')).toBe('AVAILABLE');
  });

  it('serves placement through the gated route without the private package', async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    vi.mocked(requireHouseholdContext).mockResolvedValue({ householdId, learnerProfileId });
    const post = async (targetKind: string, targetCode: string, idempotencyKey: string) => {
      const response = await POST(
        new Request('http://localhost/api/progression/assessment/assignment', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            kind: 'PLACEMENT',
            targetKind,
            targetCode,
            targetVersion: '1.0.0',
            idempotencyKey,
          }),
        }) as never,
      );
      return { status: response.status, body: (await response.json()) as Record<string, unknown> };
    };
    expect(await post('LESSON', 'ratio-language-lesson', 'route-placement-lesson')).toMatchObject({
      status: 409,
      body: { reasonCode: 'KIND_TARGET_MISMATCH' },
    });
    const created = await post('UNIT', unit.code, 'route-placement-unit');
    expect(created.status).toBe(201);
    expect(JSON.stringify(created.body)).not.toContain('canonicalAnswer');
  });
});
