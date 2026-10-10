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
 * Regression coverage for M2
 * (docs/course-progression-review/independent-review.md): composite
 * validators were exact-whole-string-match only, so a correctly-reasoned
 * but differently-phrased answer was marked wrong. Nine live production
 * composite records were migrated to also declare `parts`
 * (src/contracts/content.ts), version-bumped so the fix actually takes
 * effect (see docs/PROGRESS.md 2026-10-07 on the content-archive
 * versioning trap). This proves, through the real session/attempt path,
 * that a pre-authored exact phrasing still works (no regression) and a
 * differently-phrased-but-complete answer now also works (the actual fix).
 */
describe('M2 composite parts grading', () => {
  beforeAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
    await ensureSyntheticIdentity();
  });

  afterAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
  });

  it('one-variable-equations-2: exact pre-authored phrasing still works, and a differently-phrased complete answer now also works', async () => {
    const exact = await startSession(SYNTHETIC_IDENTITY, { contentId: 'one-variable-equations-2' });
    expect(exact.content.version).toBe('content-3');
    const exactAttempt = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: exact.sessionId,
      learnerResponse: 'x = 24; check (3/4)(24) = 18',
    });
    expect(exactAttempt.correctness).toBe('CORRECT');

    const flexible = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'one-variable-equations-2',
    });
    const flexibleAttempt = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: flexible.sessionId,
      learnerResponse: 'well, 18 = 18 when you check it, so x=24 is right',
    });
    expect(flexibleAttempt.correctness).toBe('CORRECT');

    // Still rejects a genuinely wrong or incomplete answer.
    const wrong = await startSession(SYNTHETIC_IDENTITY, { contentId: 'one-variable-equations-2' });
    const wrongAttempt = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: wrong.sessionId,
      learnerResponse: 'x = 24', // missing the required check clause
    });
    expect(wrongAttempt.correctness).toBe('INCORRECT');
  });

  it('real-world-inequalities-2: a differently-phrased complete answer works, reordered clauses included', async () => {
    const session = await startSession(SYNTHETIC_IDENTITY, {
      contentId: 'real-world-inequalities-2',
    });
    expect(session.content.version).toBe('content-3');

    const reordered = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: 'p can be 0 through 15. also, 14 works, 16 does not. p <= 15 overall.',
    });
    expect(reordered.correctness).toBe('CORRECT');
  });

  it('ratio-tables-2: exact pre-authored bare-number phrasing still works unchanged', async () => {
    const session = await startSession(SYNTHETIC_IDENTITY, { contentId: 'ratio-tables-2' });
    expect(session.content.version).toBe('content-2');
    const attempt = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: '80, 16',
    });
    expect(attempt.correctness).toBe('CORRECT');
  });
});
