import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * Regression coverage for m5
 * (docs/course-progression-review/independent-review.md): getPlan must pass
 * the active policy profile's minEstimateGate into the planner, not rely on
 * the planner's own DEFAULT_SECURE_THRESHOLD fallback. Every real policy
 * profile today happens to set minEstimateGate to the same value as that
 * fallback (0.75), so a silent regression here would otherwise be
 * invisible. This test inflates grade-6-math-default@1.1.0's
 * minEstimateGate to 0.95 while leaving every other profile and access
 * policy untouched, so a mastery estimate of 0.85 is a clean probe: secure
 * under the old hardcoded 0.75 fallback, not secure under the real,
 * mocked 0.95 profile value.
 */
vi.mock('../../src/progression/artifacts', async () => {
  const actual = await vi.importActual<typeof import('../../src/progression/artifacts')>(
    '../../src/progression/artifacts',
  );
  return {
    ...actual,
    loadPolicyArtifacts: () => {
      const real = actual.loadPolicyArtifacts();
      return {
        ...real,
        profiles: real.profiles.map((profile) =>
          profile.code === 'grade-6-math-default' && profile.version === '1.1.0'
            ? { ...profile, minEstimateGate: 0.95 }
            : profile,
        ),
      };
    },
  };
});

import { PHASE_1_MASTERY_VERSION, getPlan } from '../../src/phase1/service';
import {
  ensureSyntheticIdentity,
  SYNTHETIC_IDENTITY,
  SYNTHETIC_IDS,
} from '../../src/identity/synthetic';
import { deleteHouseholdEvidence } from '../../src/server/delete-household-evidence';
import { prisma } from '../../src/server/prisma';

describe('getPlan secureThreshold wiring (m5)', () => {
  beforeAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
    await ensureSyntheticIdentity();
  });

  afterAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
  });

  it('still plans a skill at 0.85 estimate, because the mocked profile gate is 0.95, not the planner default of 0.75', async () => {
    await prisma.masteryEstimate.create({
      data: {
        householdId: SYNTHETIC_IDENTITY.householdId,
        learnerProfileId: SYNTHETIC_IDENTITY.learnerProfileId,
        skillCode: 'gcf-and-lcm',
        estimate: 0.85,
        confidenceBand: 'MEDIUM',
        algorithmVersion: PHASE_1_MASTERY_VERSION,
        independentDelayedCheck: true,
      },
    });

    // A generous time budget so this probe is never crowded out by other
    // not-yet-mastered skills ahead of it in topological order - this test
    // is about the threshold, not the time-budget cap.
    const plan = await getPlan(SYNTHETIC_IDENTITY, { timeBudgetMinutes: 200 });

    expect(plan.items.some((item) => item.skillCode === 'gcf-and-lcm')).toBe(true);
  });
});
