import { describe, expect, it } from 'vitest';

import {
  GRADE_6_MATH_PACKAGE_BANKS,
  PACKAGE_STORE_BANKS,
  PENDING_ACTIVATION_PACKAGE_BANKS,
  PrivateAssessmentPackageStore,
  pendingActivationBankKeys,
  validatePackageIntegrity,
  deriveRequiredBanks,
} from '../../src/assessment/private-package-store';
import type { RequiredBank } from '../../src/assessment/private-package-store';
import {
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import { PILOT_LESSONS } from '../../src/curriculum/pilot-catalog';
import {
  SYNTHETIC_V1_SPEC,
  SYNTHETIC_V2_SPEC,
  requiredFor,
  syntheticPackage,
  syntheticVersionedCatalog,
  writeSyntheticPackage,
  sha256,
  syntheticBank,
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
  it('keeps the previously hardcoded pilot list as the first ten descriptors (retention)', () => {
    expect(GRADE_6_MATH_PACKAGE_BANKS.slice(0, 10)).toEqual(legacyList());
    expect(deriveRequiredBanks(COURSE_CATALOG_INDEX).slice(0, 10)).toEqual(legacyList());
  });

  it('RI-5, MATH-ST6: the active list has 20 descriptors, ten mandatory and ten optional; Statistics banks are pending (CE-3)', () => {
    expect(GRADE_6_MATH_PACKAGE_BANKS).toHaveLength(20);
    const label = (b: { code: string; version: string }) => `${b.code}@${b.version}`;
    expect(GRADE_6_MATH_PACKAGE_BANKS.filter((b) => !b.optional).map(label)).toEqual([
      'ratio-language-lesson-bank@1.0.0',
      'unit-rates-lesson-bank@1.0.0',
      'ratio-tables-lesson-bank@1.0.0',
      'ratios-proportional-reasoning-unit-bank@1.0.0',
      'ratio-language-lesson-bank@2.0.0',
      'unit-rates-lesson-bank@2.0.0',
      'ratio-tables-lesson-bank@2.0.0',
      'double-number-lines-lesson-bank@1.0.0',
      'percent-applications-lesson-bank@1.0.0',
      'ratios-proportional-reasoning-unit-bank@2.0.0',
    ]);
    expect(GRADE_6_MATH_PACKAGE_BANKS.filter((b) => b.optional)).toHaveLength(10);
    const unit2 = GRADE_6_MATH_PACKAGE_BANKS.find(
      (b) => label(b) === 'ratios-proportional-reasoning-unit-bank@2.0.0',
    );
    expect(unit2?.minimumItems).toBe(30);
    expect(unit2?.requiredSkillRefs).toHaveLength(5);
  });

  it('covers every registered index bank exactly once', () => {
    const derived = [...GRADE_6_MATH_PACKAGE_BANKS, ...PENDING_ACTIVATION_PACKAGE_BANKS].map(
      (b) => `${b.code}@${b.version}`,
    );
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

describe('MATH-ST6: Statistics banks are pending until the selection names program 1.2.0', () => {
  const label = (b: { code: string; version: string }) => `${b.code}@${b.version}`;
  const selection = (version: string) =>
    VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'grade-6-math' ? { code: ref.code, version } : ref,
    );

  it('the ten Statistics banks are accepted-if-present, never mandatory, and absent from the active list', () => {
    expect(PENDING_ACTIVATION_PACKAGE_BANKS.map(label)).toEqual(
      COURSE_CATALOG_INDEX.banks
        .filter((b) =>
          /^(statistical-questions|distributions|center-and-variability|statistics)-/.test(b.code),
        )
        .map(label),
    );
    expect(PENDING_ACTIVATION_PACKAGE_BANKS).toHaveLength(10);
    expect(PENDING_ACTIVATION_PACKAGE_BANKS.every((b) => b.optional === true)).toBe(true);
    const active = new Set(GRADE_6_MATH_PACKAGE_BANKS.map(label));
    for (const bank of PENDING_ACTIVATION_PACKAGE_BANKS)
      expect(active.has(label(bank))).toBe(false);
    expect(PACKAGE_STORE_BANKS).toHaveLength(30);
  });

  type Desc = {
    code: string;
    version: string;
    minimumItems: number;
    requiredSkillRefs?: readonly { code: string; version: string }[];
    itemRole?: 'assessment' | 'review';
  };
  /** Synthetic bank satisfying a real descriptor: invented ids, items spread over its required skills. */
  const bankFor = (d: Desc) => {
    const skills = d.requiredSkillRefs ?? [];
    const items = Array.from({ length: d.minimumItems }, (_, n) => {
      const skill = skills[n % skills.length]!;
      return syntheticBank({
        code: d.code,
        version: d.version,
        skillCode: skill.code,
        role: d.itemRole ?? 'assessment',
        itemIds: [`syn-${d.code}-${d.version}-${n}`],
      }).items[0]!;
    });
    return { code: d.code, version: d.version, contentHash: sha256(items), items };
  };
  const ratiosOnly = () => GRADE_6_MATH_PACKAGE_BANKS.filter((b) => !b.optional).map(bankFor);
  const statisticsBanks = () => PENDING_ACTIVATION_PACKAGE_BANKS.map(bankFor);

  it('(a) a Ratios-only package loads against the production store list', () => {
    expect(() =>
      validatePackageIntegrity(ratiosOnly() as never, PACKAGE_STORE_BANKS),
    ).not.toThrow();
  });

  it('(b) a package that also carries all ten valid Statistics banks loads', () => {
    expect(() =>
      validatePackageIntegrity(
        [...ratiosOnly(), ...statisticsBanks()] as never,
        PACKAGE_STORE_BANKS,
      ),
    ).not.toThrow();
  });

  it('the active list alone would refuse Statistics banks as unknown (why the pending list exists)', () => {
    expect(() =>
      validatePackageIntegrity(
        [...ratiosOnly(), ...statisticsBanks()] as never,
        GRADE_6_MATH_PACKAGE_BANKS,
      ),
    ).toThrow(/unknown bank/);
  });

  it('a present Statistics bank is still fully validated: count, role, skill, unknown bank, tampering', () => {
    const stats = statisticsBanks();
    const unit = stats.find((b) => b.code === 'statistics-unit-bank')!;
    const review = stats.find((b) => b.code === 'distributions-review-bank')!;
    const run = (banks: unknown[]) =>
      validatePackageIntegrity([...ratiosOnly(), ...banks] as never, PACKAGE_STORE_BANKS);
    const rest = (...drop: string[]) => stats.filter((b) => !drop.includes(b.code));

    const short = { ...unit, items: unit.items.slice(1) };
    short.contentHash = sha256(short.items);
    expect(() => run([...rest(unit.code), short])).toThrow(/requires at least 18 items/);

    const wrongRole = bankFor({
      ...PENDING_ACTIVATION_PACKAGE_BANKS.find((b) => b.code === review.code)!,
      itemRole: 'assessment',
    });
    expect(() => run([...rest(review.code), wrongRole])).toThrow(/only review items/);

    const missingSkill = bankFor({
      ...PENDING_ACTIVATION_PACKAGE_BANKS.find((b) => b.code === unit.code)!,
      requiredSkillRefs: [{ code: 'statistical-questions', version: '1.0.0' }],
    });
    expect(() => run([...rest(unit.code), missingSkill])).toThrow(/missing coverage for skill/);

    const otherSkill = bankFor({
      ...PENDING_ACTIVATION_PACKAGE_BANKS.find((b) => b.code === review.code)!,
      requiredSkillRefs: [{ code: 'statistical-questions', version: '1.0.0' }],
    });
    expect(() => run([...rest(review.code), otherSkill])).toThrow(/another skill/);

    const unknown = bankFor({
      code: 'statistics-other-bank',
      version: '1.0.0',
      minimumItems: 1,
      requiredSkillRefs: [{ code: 'distributions', version: '1.0.0' }],
    });
    expect(() => run([...stats, unknown])).toThrow(/unknown bank/);

    const tampered = {
      ...unit,
      items: unit.items.map((item, n) => (n === 0 ? { ...item, prompt: 'changed' } : item)),
    };
    // Recompute the bank hash so only the item hash is wrong.
    tampered.contentHash = sha256(tampered.items);
    expect(() => run([...rest(unit.code), tampered])).toThrow(/item hash mismatch/);
    const badBankHash = { ...unit, contentHash: 'sha256:' + '1'.repeat(64) };
    expect(() => run([...rest(unit.code), badBankHash])).toThrow(/bank hash mismatch/);
  });

  it('selecting 1.2.0 makes exactly the four lesson and unit Statistics banks mandatory; the six skill banks stay optional', () => {
    const pendingAfter = pendingActivationBankKeys(selection('1.2.0'));
    expect(pendingAfter.size).toBe(0);
    const statsIndex = COURSE_CATALOG_INDEX.banks.filter((b) =>
      /^(statistical-questions|distributions|center-and-variability|statistics)-/.test(b.code),
    );
    const afterList = deriveRequiredBanks(COURSE_CATALOG_INDEX).filter((d) =>
      statsIndex.some((b) => label(b) === label(d)),
    );
    expect(afterList.filter((d) => !d.optional).map(label)).toEqual([
      'statistical-questions-lesson-bank@1.0.0',
      'distributions-lesson-bank@1.0.0',
      'center-and-variability-lesson-bank@1.0.0',
      'statistics-unit-bank@1.0.0',
    ]);
    expect(afterList.filter((d) => d.optional)).toHaveLength(6);
    // And a package without the four would then be refused.
    expect(() =>
      validatePackageIntegrity(ratiosOnly() as never, [
        ...GRADE_6_MATH_PACKAGE_BANKS,
        ...afterList,
      ]),
    ).toThrow(/missing bank/);
  });

  it('the coupled switch: selecting 1.2.0 empties the pending set, so the same banks become mandatory', () => {
    expect(pendingActivationBankKeys(selection('1.1.0')).size).toBe(10);
    expect(pendingActivationBankKeys(selection('1.2.0')).size).toBe(0);
  });
});
