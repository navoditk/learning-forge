import { describe, expect, it } from 'vitest';

import { SKILL_PROGRESS_SUMMARY } from '../../src/phase1/service';

// L14 / D-01 Branch A only: "The product makes no independence claim derived
// from assessment - parent and learner wording is checked against the D-55
// phrase artifact's Branch A variant." Per `docs/course-progression-decisions.md`
// D-01, this codebase has permanently chosen Branch B (held-out) -
// `src/assessment/store.ts` always resolves `createHeldOutStore()`, and no
// runtime branch flag exists anywhere in `src/`. §13.3's own table says this
// test must be **skipped under Branch B**, the mirror image of L15 (the
// Branch-B exclusion-surface test, always active in `tests/content/held-out.test.ts`
// because Branch A never exists here either).
//
// Branch B's wording is the opposite of what this claim checks: D-01's table
// requires Branch B to say "Independently confirmed on an unassisted check
// after a delay" - an independence claim is the point, not a leak. Running
// this assertion against Branch B wording would be a false positive, which
// is exactly why §13.3 requires it skipped, not merely absent.
//
// No D-55 `child-safe-phrasing` artifact exists in this repository (there is
// no code path for Branch A to reference one). The assertions below encode
// D-01's own Branch A phrasing rules directly, so this file is a real,
// named, skip-gated falsifier - not a placeholder - if Branch A is ever
// adopted and `ACTIVE_BRANCH` is flipped.
const ACTIVE_BRANCH = 'B' as 'A' | 'B';

// Branch A, per D-01's table: never "independently confirmed"; the approved
// substitute is "Completed without asking for help, using open materials."
const BRANCH_A_FORBIDDEN_PHRASES = ['independently confirmed', 'confirmed on an unassisted check'];
const BRANCH_A_LEARNER_WORDING = 'You finished this on your own.';
const BRANCH_A_PARENT_WORDING = 'Completed without asking for help, using open materials.';

describe('parent/learner independence wording (L14, Branch A only)', () => {
  it.skipIf(ACTIVE_BRANCH !== 'A')(
    'never claims independent confirmation; uses the Branch A open-book phrasing',
    () => {
      const learnerFacingStrings = Object.values(SKILL_PROGRESS_SUMMARY);
      for (const phrase of BRANCH_A_FORBIDDEN_PHRASES) {
        for (const text of learnerFacingStrings) {
          expect(text.toLowerCase()).not.toContain(phrase);
        }
      }
      expect(learnerFacingStrings.join(' ')).not.toContain(BRANCH_A_LEARNER_WORDING);
      expect(learnerFacingStrings.join(' ')).toContain(BRANCH_A_PARENT_WORDING);
    },
  );

  it(`is skipped because this deployment's D-01 branch is Branch ${ACTIVE_BRANCH}, not Branch A`, () => {
    expect(ACTIVE_BRANCH).toBe('B');
  });
});
