import { describe, expect, it } from 'vitest';

import {
  GRADE_6_MATH_PACKAGE_BANKS,
  PACKAGE_STORE_BANKS,
  PENDING_ACTIVATION_PACKAGE_BANKS,
  deriveRequiredBanks,
  pendingActivationBankKeys,
  validatePackageIntegrity,
} from '../../src/assessment/private-package-store';
import {
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import { sha256, syntheticBank } from './fixtures/synthetic-versioned-package';

/**
 * SPELL-SP5: the thirteen Spelling banks follow the pending-activation rule
 * (D-343 mechanism, MATH-ST6). Existing held-out stores keep working: a
 * Ratios-only package still loads, and a package that already carries the
 * Spelling banks is not refused as unknown.
 */
const label = (b: { code: string; version: string }) => `${b.code}@${b.version}`;
const isSpelling = (b: { code: string }) => b.code.startsWith('snsb6-');
const selection = (version: string) =>
  VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
    ref.code === 'scripps-spelling-bee-6' ? { code: ref.code, version } : ref,
  );

type Desc = {
  code: string;
  version: string;
  minimumItems: number;
  requiredSkillRefs?: readonly { code: string; version: string }[];
  itemRole?: 'assessment' | 'review';
};
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
const spellingPending = PENDING_ACTIVATION_PACKAGE_BANKS.filter(isSpelling);
const spellingBanks = () => spellingPending.map(bankFor);

describe('SPELL-SP5: Spelling banks are pending until the selection names program 1.1.0', () => {
  it('exact membership: the thirteen Spelling banks are pending, optional and absent from the active list', () => {
    expect(spellingPending.map(label)).toEqual(
      COURSE_CATALOG_INDEX.banks.filter(isSpelling).map(label),
    );
    expect(spellingPending).toHaveLength(13);
    expect(spellingPending.every((b) => b.optional === true)).toBe(true);
    expect(GRADE_6_MATH_PACKAGE_BANKS.some(isSpelling)).toBe(false);
    expect(GRADE_6_MATH_PACKAGE_BANKS).toHaveLength(20);
    // MATH-GEO-6: the thirteen pending Geometry banks join the store list.
    expect(PACKAGE_STORE_BANKS).toHaveLength(56);
    expect(new Set(PACKAGE_STORE_BANKS.map(label)).size).toBe(56);
  });

  it('(a) a Ratios-only package (the existing held-out store) still loads against the store list', () => {
    expect(() =>
      validatePackageIntegrity(ratiosOnly() as never, PACKAGE_STORE_BANKS),
    ).not.toThrow();
  });

  it('(b) a package that also carries all thirteen valid Spelling banks loads', () => {
    expect(() =>
      validatePackageIntegrity([...ratiosOnly(), ...spellingBanks()] as never, PACKAGE_STORE_BANKS),
    ).not.toThrow();
  });

  it('the active list alone would refuse Spelling banks as unknown (why the pending list exists)', () => {
    expect(() =>
      validatePackageIntegrity(
        [...ratiosOnly(), ...spellingBanks()] as never,
        GRADE_6_MATH_PACKAGE_BANKS,
      ),
    ).toThrow(/unknown bank/);
  });

  it('a present Spelling bank is still fully validated: count, role, coverage, unknown bank, tampering', () => {
    const banks = spellingBanks();
    const unit = banks.find((b) => b.code === 'snsb6-word-structure-unit-bank')!;
    const review = banks.find((b) => b.code === 'snsb6-etymology-language-origins-review-bank')!;
    const descOf = (code: string) => spellingPending.find((b) => b.code === code)!;
    const run = (extra: unknown[]) =>
      validatePackageIntegrity([...ratiosOnly(), ...extra] as never, PACKAGE_STORE_BANKS);
    const rest = (...drop: string[]) => banks.filter((b) => !drop.includes(b.code));

    const short = { ...unit, items: unit.items.slice(1) };
    short.contentHash = sha256(short.items);
    expect(() => run([...rest(unit.code), short])).toThrow(/requires at least 24 items/);

    const wrongRole = bankFor({ ...descOf(review.code), itemRole: 'assessment' });
    expect(() => run([...rest(review.code), wrongRole])).toThrow(/only review items/);

    const missingSkill = bankFor({
      ...descOf(unit.code),
      requiredSkillRefs: [{ code: 'snsb6-morphology-roots', version: '1.0.0' }],
    });
    expect(() => run([...rest(unit.code), missingSkill])).toThrow(/missing coverage for skill/);

    const otherSkill = bankFor({
      ...descOf(review.code),
      requiredSkillRefs: [{ code: 'snsb6-morphology-roots', version: '1.0.0' }],
    });
    expect(() => run([...rest(review.code), otherSkill])).toThrow(/another skill/);

    const unknown = bankFor({
      code: 'snsb6-other-bank',
      version: '1.0.0',
      minimumItems: 1,
      requiredSkillRefs: [{ code: 'snsb6-morphology-roots', version: '1.0.0' }],
    });
    expect(() => run([...banks, unknown])).toThrow(/unknown bank/);

    const tampered = {
      ...unit,
      items: unit.items.map((item, n) => (n === 0 ? { ...item, prompt: 'changed' } : item)),
    };
    tampered.contentHash = sha256(tampered.items);
    expect(() => run([...rest(unit.code), tampered])).toThrow(/item hash mismatch/);
    expect(() =>
      run([...rest(unit.code), { ...unit, contentHash: 'sha256:' + '1'.repeat(64) }]),
    ).toThrow(/bank hash mismatch/);
  });

  it('the Statistics selection switch does not move Spelling, and vice versa', () => {
    const spellingKeys = (keys: ReadonlySet<string>) =>
      [...keys].filter((k) => k.startsWith('snsb6-'));
    const mathSwitched = VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'grade-6-math' ? { code: ref.code, version: '1.2.0' } : ref,
    );
    expect(spellingKeys(pendingActivationBankKeys(mathSwitched))).toHaveLength(13);
    const stats = (keys: ReadonlySet<string>) =>
      [...keys].filter((k) =>
        /^(statistical-questions|distributions|center-and-variability|statistics)-/.test(k),
      );
    expect(stats(pendingActivationBankKeys(selection('1.1.0')))).toHaveLength(10);
  });

  it('selecting 1.1.0 makes exactly the five lesson and unit Spelling banks mandatory; the eight skill banks stay optional', () => {
    const pendingBefore = pendingActivationBankKeys(selection('1.0.0'));
    expect([...pendingBefore].filter((k) => k.startsWith('snsb6-'))).toHaveLength(13);
    const pendingAfter = pendingActivationBankKeys(selection('1.1.0'));
    expect([...pendingAfter].some((k) => k.startsWith('snsb6-'))).toBe(false);
    const afterList = deriveRequiredBanks(COURSE_CATALOG_INDEX).filter(isSpelling);
    expect(afterList.filter((d) => !d.optional).map(label)).toEqual([
      'snsb6-morphology-roots-lesson-bank@1.0.0',
      'snsb6-orthographic-patterns-lesson-bank@1.0.0',
      'snsb6-phoneme-grapheme-mapping-lesson-bank@1.0.0',
      'snsb6-etymology-language-origins-lesson-bank@1.0.0',
      'snsb6-word-structure-unit-bank@1.0.0',
    ]);
    expect(afterList.filter((d) => d.optional)).toHaveLength(8);
    // COUNTEREXAMPLE: had the selection flipped before the owner merged the banks,
    // the existing Ratios-only package would be refused as missing bank.
    expect(() =>
      validatePackageIntegrity(ratiosOnly() as never, [
        ...GRADE_6_MATH_PACKAGE_BANKS,
        ...afterList,
      ]),
    ).toThrow(/missing bank/);
    // With the five banks merged the same list loads.
    const merged = afterList.filter((d) => !d.optional).map(bankFor);
    expect(() =>
      validatePackageIntegrity([...ratiosOnly(), ...merged] as never, [
        ...GRADE_6_MATH_PACKAGE_BANKS,
        ...afterList,
      ]),
    ).not.toThrow();
  });
});
