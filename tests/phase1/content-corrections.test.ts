import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import {
  ensureSyntheticIdentity,
  SYNTHETIC_IDENTITY,
  SYNTHETIC_IDS,
} from '../../src/identity/synthetic';
import { recordAttempt, startSession } from '../../src/phase1/service';
import { deleteHouseholdEvidence } from '../../src/server/delete-household-evidence';

/**
 * Regression coverage for D-74 (docs/course-progression-decisions.md): two
 * already-live records had defects an independent review found after they'd
 * been serving real attempts. Both were corrected and version-bumped to
 * content-2 (content-1 remains archived, byte-identical, for any historical
 * attempt already scored against it).
 */
describe('D-74 content corrections', () => {
  beforeAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
    await ensureSyntheticIdentity();
  });

  afterAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
  });

  it('one-variable-equations-2 is now a genuine single-step (6.EE.B.7) form', async () => {
    const session = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'one-variable-equations-2',
    });
    expect(session.content.version).toBe('content-2');
    expect(session.content.prompt).toContain('(3/4)x = 18');

    const correct = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: 'x = 24; check (3/4)(24) = 18',
    });
    expect(correct.correctness).toBe('CORRECT');

    // The prior (content-1) two-step answer must no longer be accepted.
    const resumed = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'one-variable-equations-2',
    });
    const wrongGrade = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: resumed.sessionId,
      learnerResponse: 'x = 12; check (1/2)(12) + 4 = 10',
    });
    expect(wrongGrade.correctness).toBe('INCORRECT');
  });

  it('real-world-inequalities-2 requires the context-bounded solution set, not an unbounded ray', async () => {
    const session = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'real-world-inequalities-2',
    });
    expect(session.content.version).toBe('content-2');

    const bounded = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: '9 + p is at most 24; p can be 0 through 15',
    });
    expect(bounded.correctness).toBe('CORRECT');

    // The old unbounded-only phrasing (no floor at 0) must no longer score
    // correct - it described a different, broader solution set.
    const resumed = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'real-world-inequalities-2',
    });
    const unbounded = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: resumed.sessionId,
      learnerResponse:
        '9 + p <= 24; 14 works, 16 does not; p <= 15 with a closed 15 and shading left',
    });
    expect(unbounded.correctness).toBe('INCORRECT');
  });
});
