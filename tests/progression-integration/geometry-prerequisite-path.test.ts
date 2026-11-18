import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * MATH-GEO-6 / GEO6-03 (scope doc section 4, MISS closed): with Geometry
 * SELECTED (selection flipped to grade-6-math@1.3.0 in this isolated module
 * graph only; the committed selection is untouched) and `coordinate-distance`
 * (a Number System skill) claimed by no unit, Geometry practice is denied
 * without that prerequisite and allowed with mastery, and the prerequisite
 * itself stays satisfiable through legacy practice. Runs the full
 * `startSession` path: the catalog resolves the skill claim, the policy
 * artifacts resolve the access and legacy policies, and prerequisite mastery
 * is loaded from the database exactly as production does (shadow rows
 * record the decision; enforcement is also exercised).
 */
vi.mock('../../src/curriculum/grade-6-math-active-selection.json', async (importOriginal) => {
  const actual = await importOriginal<{
    default: { programs: { code: string; version: string }[] } & Record<string, unknown>;
  }>();
  return {
    default: {
      ...actual.default,
      programs: actual.default.programs.map((ref) =>
        ref.code === 'grade-6-math' ? { code: ref.code, version: '1.3.0' } : ref,
      ),
    },
  };
});

import { COURSE_CATALOG } from '../../src/curriculum/course-catalog';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import { PHASE_1_MASTERY_VERSION, startSession } from '../../src/phase1/service';
import { ProgressionAuthorizationDeniedError } from '../../src/progression/policy';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

describe('Geometry selected: the unclaimed Number System prerequisite path (GEO6-03)', () => {
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
    await prisma.shadowDecision.deleteMany({ where: { householdId } });
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
    await prisma.session.updateMany({
      where: { householdId, endedAt: null },
      data: { endedAt: new Date() },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const identity = () => ({ householdId, learnerProfileId });
  const latestShadow = () =>
    prisma.shadowDecision.findFirstOrThrow({
      where: { householdId },
      orderBy: { occurredAt: 'desc' },
    });
  const master = (skillCode: string, algorithmVersion = PHASE_1_MASTERY_VERSION) =>
    prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode,
        estimate: 0.95,
        confidenceBand: 'HIGH',
        algorithmVersion,
        independentDelayedCheck: true,
      },
    });

  it('the setup is real: Geometry is selected, coordinate-geometry is unit-claimed and coordinate-distance is not', () => {
    expect(COURSE_CATALOG.programByCode('grade-6-math')?.version).toBe('1.3.0');
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'coordinate-geometry')).toBe(true);
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'coordinate-distance')).toBe(false);
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'coordinate-plane')).toBe(false);
  });

  it('denies Geometry practice (shadow) without the prerequisite and allows it with mastery loaded from the database', async () => {
    await startSession(identity(), {
      contentId: 'coordinate-geometry-2',
      activityKind: 'PRACTICE',
    });
    expect(await latestShadow()).toMatchObject({
      shadowDecision: 'DENY',
      shadowReasonCode: 'LOCKED_PREREQUISITE',
      actualBehavior: 'ALLOWED',
      algorithmVersion: PHASE_1_MASTERY_VERSION,
    });

    // Mastery recorded under another algorithm version does not count.
    await master('coordinate-distance', 'integration-other-version');
    await startSession(identity(), {
      contentId: 'coordinate-geometry-2',
      activityKind: 'PRACTICE',
    });
    expect(await latestShadow()).toMatchObject({
      shadowDecision: 'DENY',
      shadowReasonCode: 'LOCKED_PREREQUISITE',
    });

    await master('coordinate-distance');
    await startSession(identity(), {
      contentId: 'coordinate-geometry-2',
      activityKind: 'PRACTICE',
    });
    expect(await latestShadow()).toMatchObject({ shadowDecision: 'ALLOW', divergent: false });
  });

  it('enforcement: refuses Geometry practice without the prerequisite and starts it with mastery', async () => {
    vi.stubEnv('COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED', 'true');
    await expect(
      startSession(identity(), { contentId: 'coordinate-geometry-2', activityKind: 'PRACTICE' }),
    ).rejects.toBeInstanceOf(ProgressionAuthorizationDeniedError);
    await master('coordinate-distance');
    const session = await startSession(identity(), {
      contentId: 'coordinate-geometry-2',
      activityKind: 'PRACTICE',
    });
    expect(session.sessionId).toBeTruthy();
  });

  it('the unclaimed prerequisite stays satisfiable through legacy practice (policy, not the unit)', async () => {
    // Chain: negative-numbers-and-absolute-value (root) -> coordinate-plane -> coordinate-distance
    // -> coordinate-geometry. The first three are claimed by no unit, so they are served under the
    // legacy-compatibility policy, and only the prerequisite graph gates them.
    vi.stubEnv('COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED', 'true');
    const practice = (contentId: string) =>
      startSession(identity(), { contentId, activityKind: 'PRACTICE' });
    expect((await practice('negative-numbers-and-absolute-value-1')).sessionId).toBeTruthy();
    await expect(practice('coordinate-plane-1')).rejects.toBeInstanceOf(
      ProgressionAuthorizationDeniedError,
    );
    await master('negative-numbers-and-absolute-value');
    expect((await practice('coordinate-plane-1')).sessionId).toBeTruthy();
    await expect(practice('coordinate-distance-1')).rejects.toBeInstanceOf(
      ProgressionAuthorizationDeniedError,
    );
    await master('coordinate-plane');
    expect((await practice('coordinate-distance-1')).sessionId).toBeTruthy();
    // Once coordinate-distance is mastered, the unit-claimed Geometry skill unlocks.
    await expect(practice('coordinate-geometry-2')).rejects.toBeInstanceOf(
      ProgressionAuthorizationDeniedError,
    );
    await master('coordinate-distance');
    expect((await practice('coordinate-geometry-2')).sessionId).toBeTruthy();
  });
});
