import { describe, expect, it } from 'vitest';

import {
  GRADE_6_MATH_PACKAGE_BANKS,
  PrivateAssessmentPackageStore,
  deriveRequiredBanks,
} from '../../src/assessment/private-package-store';
import type { RequiredBank } from '../../src/assessment/private-package-store';
import { COURSE_CATALOG_INDEX } from '../../src/curriculum/course-catalog';
import { PILOT_LESSONS } from '../../src/curriculum/pilot-catalog';
import {
  SYNTHETIC_V1_SPEC,
  SYNTHETIC_V2_SPEC,
  requiredFor,
  syntheticPackage,
  syntheticVersionedCatalog,
  writeSyntheticPackage,
} from './fixtures/synthetic-versioned-package';

// The list RI-3 replaced, rebuilt here from PILOT_LESSONS as the oracle.
const pilotRefs = (codes: readonly string[]) => codes.map((code) => ({ code, version: '1.0.0' }));
const legacyList = (): RequiredBank[] => {
  const skills = [...new Set(PILOT_LESSONS.flatMap((l) => l.skillRefs.map((r) => r.code)))];
  return [
    ...PILOT_LESSONS.map((lesson) => ({
      code: lesson.assessmentBankRef.code,
      version: '1.0.0',
      minimumItems: 9,
      requiredSkillRefs: pilotRefs(lesson.skillRefs.map((r) => r.code)),
    })),
    {
      code: 'ratios-proportional-reasoning-unit-bank',
      version: '1.0.0',
      minimumItems: 18,
      requiredSkillRefs: pilotRefs(PILOT_LESSONS.flatMap((l) => l.skillRefs.map((r) => r.code))),
    },
    ...skills.flatMap((code) => [
      {
        code: `${code}-review-bank`,
        version: '1.0.0',
        minimumItems: 3,
        requiredSkillRefs: pilotRefs([code]),
        optional: true,
        exclusiveSkills: true,
        itemRole: 'review' as const,
      },
      {
        code: `${code}-delayed-check-bank`,
        version: '1.0.0',
        minimumItems: 6,
        requiredSkillRefs: pilotRefs([code]),
        optional: true,
        exclusiveSkills: true,
      },
    ]),
  ];
};

describe('package bank list derived from the catalog index (RI-3)', () => {
  it('deep-equals the previously hardcoded list for the single-version catalog', () => {
    expect(GRADE_6_MATH_PACKAGE_BANKS).toEqual(legacyList());
    expect(deriveRequiredBanks(COURSE_CATALOG_INDEX)).toEqual(legacyList());
  });

  it('covers every registered index bank exactly once', () => {
    const derived = GRADE_6_MATH_PACKAGE_BANKS.map((b) => `${b.code}@${b.version}`);
    expect(derived).toEqual(COURSE_CATALOG_INDEX.banks.map((b) => `${b.code}@${b.version}`));
    expect(new Set(derived).size).toBe(derived.length);
  });

  it('derives ten mandatory and ten optional descriptors from a two-version catalog (R-1)', () => {
    const derived = deriveRequiredBanks(syntheticVersionedCatalog());
    expect(derived).toHaveLength(20);
    expect(derived.filter((b) => !b.optional)).toHaveLength(10);
    const optional = derived.filter((b) => b.optional);
    expect(optional).toHaveLength(10);
    for (const bank of optional) {
      expect(bank.exclusiveSkills).toBe(true);
      expect(bank.itemRole ?? 'assessment').toBe(
        bank.code.endsWith('-review-bank') ? 'review' : 'assessment',
      );
    }
    const unit2 = derived.find((b) => b.code === 'synthetic-unit-bank' && b.version === '2.0.0');
    expect(unit2?.minimumItems).toBe(30);
    expect(unit2?.requiredSkillRefs).toHaveLength(5);
    expect(derived.some((b) => b.code === 'alpha-lesson-bank' && b.version === '1.0.0')).toBe(true);
    expect(derived.some((b) => b.code === 'alpha-lesson-bank' && b.version === '2.0.0')).toBe(true);
  });

  it('fails closed on a registered bank of no recognised kind', () => {
    const catalog = syntheticVersionedCatalog();
    const stray = {
      code: 'stray-bank',
      version: '1.0.0',
      targetRef: { code: 'alpha', version: '1.0.0' },
      coveredSkillRefs: [{ code: 'alpha', version: '1.0.0' }],
      itemCount: 3,
    };
    expect(() => deriveRequiredBanks({ ...catalog, banks: [...catalog.banks, stray] })).toThrow(
      'no recognised kind: stray-bank@1.0.0',
    );
  });
});

describe('never-reused item ids across versions of a bank code (RI-3)', () => {
  const temporaryRequired = [requiredFor(SYNTHETIC_V1_SPEC), requiredFor(SYNTHETIC_V2_SPEC)];

  it('loads when @1.0.0 and @2.0.0 carry disjoint ids (positive control)', async () => {
    const path = await writeSyntheticPackage(
      syntheticPackage([SYNTHETIC_V1_SPEC, SYNTHETIC_V2_SPEC]),
    );
    const store = new PrivateAssessmentPackageStore(path, temporaryRequired);
    await expect(
      store.getBank({ code: 'synthetic-lesson-bank', version: '2.0.0' }),
    ).resolves.toEqual(expect.objectContaining({ version: '2.0.0' }));
    await expect(
      store.getBank({ code: 'synthetic-lesson-bank', version: '1.0.0' }),
    ).resolves.toEqual(expect.objectContaining({ version: '1.0.0' }));
  });

  it('rejects the same item id in two versions of one bank code', async () => {
    const reused = {
      ...SYNTHETIC_V2_SPEC,
      itemIds: ['synthetic-a-1', 'synthetic-b-2', 'synthetic-b-3'],
    };
    const path = await writeSyntheticPackage(syntheticPackage([SYNTHETIC_V1_SPEC, reused]));
    expect(() => new PrivateAssessmentPackageStore(path, temporaryRequired)).toThrow(
      'item id is reused across versions of synthetic-lesson-bank: synthetic-a-1 (1.0.0, 2.0.0)',
    );
  });

  it('applies the rule without a configured required list', async () => {
    const reused = {
      ...SYNTHETIC_V2_SPEC,
      itemIds: ['synthetic-a-2', 'synthetic-b-2', 'synthetic-b-3'],
    };
    const path = await writeSyntheticPackage(syntheticPackage([SYNTHETIC_V1_SPEC, reused]));
    expect(() => new PrivateAssessmentPackageStore(path)).toThrow('reused across versions');
  });

  it('allows one id in banks of different codes only through the existing duplicate rule', async () => {
    const other = {
      ...SYNTHETIC_V2_SPEC,
      code: 'other-synthetic-bank',
      itemIds: ['synthetic-a-1'],
    };
    const path = await writeSyntheticPackage(syntheticPackage([SYNTHETIC_V1_SPEC, other]));
    expect(() => new PrivateAssessmentPackageStore(path)).toThrow(
      'Duplicate private assessment item: synthetic-a-1@1.0.0',
    );
  });

  it('keeps a retained @1.0.0 bank required: a package missing it fails to load', async () => {
    const path = await writeSyntheticPackage(syntheticPackage([SYNTHETIC_V2_SPEC]));
    expect(() => new PrivateAssessmentPackageStore(path, temporaryRequired)).toThrow(
      'Private assessment package is missing bank: synthetic-lesson-bank@1.0.0',
    );
  });

  it('enforces the derived minimum item count from itemCount', async () => {
    const short = { ...SYNTHETIC_V2_SPEC, itemIds: ['synthetic-b-1', 'synthetic-b-2'] };
    const path = await writeSyntheticPackage(syntheticPackage([SYNTHETIC_V1_SPEC, short]));
    expect(() => new PrivateAssessmentPackageStore(path, temporaryRequired)).toThrow(
      'requires at least 3 items',
    );
  });
});
