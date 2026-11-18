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
 * MATH-GEO-6: the thirteen Geometry banks follow the pending-activation rule
 * (D-343 mechanism, MATH-ST6, SPELL-SP5). Existing held-out stores keep
 * working: Ratios-only, Statistics-era and Spelling-era packages still load,
 * and a package that already carries the Geometry banks is not refused.
 */
const label = (b: { code: string; version: string }) => `${b.code}@${b.version}`;
const GEO_RE =
  /^(geometry-unit-bank|area-of-composite-shapes-|surface-area-and-volume-|prism-volume-|coordinate-geometry-)/;
const STAT_RE = /^(statistical-questions|distributions|center-and-variability|statistics)-/;
const isGeometry = (b: { code: string }) => GEO_RE.test(b.code);
const isStatistics = (b: { code: string }) => STAT_RE.test(b.code);
const isSpelling = (b: { code: string }) => b.code.startsWith('snsb6-');
const selection = (version: string) =>
  VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
    ref.code === 'grade-6-math' ? { code: ref.code, version } : ref,
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
const geometryPending = PENDING_ACTIVATION_PACKAGE_BANKS.filter(isGeometry);
const statisticsPending = PENDING_ACTIVATION_PACKAGE_BANKS.filter(isStatistics);
const spellingPending = PENDING_ACTIVATION_PACKAGE_BANKS.filter(isSpelling);
const geometryBanks = () => geometryPending.map(bankFor);

describe('MATH-GEO-6: Geometry banks are pending until the selection names program 1.3.0', () => {
  it('exact membership: the thirteen Geometry banks are pending, optional and absent from the active list', () => {
    expect(geometryPending.map(label)).toEqual(
      COURSE_CATALOG_INDEX.banks.filter(isGeometry).map(label),
    );
    expect(geometryPending).toHaveLength(13);
    expect(geometryPending.every((b) => b.optional === true)).toBe(true);
    expect(GRADE_6_MATH_PACKAGE_BANKS.some(isGeometry)).toBe(false);
    expect(GRADE_6_MATH_PACKAGE_BANKS).toHaveLength(20);
    expect(PACKAGE_STORE_BANKS).toHaveLength(56);
    expect(new Set(PACKAGE_STORE_BANKS.map(label)).size).toBe(56);
  });

  it('(a) Ratios-only, Statistics-era and Spelling-era packages still load against the store list', () => {
    expect(() =>
      validatePackageIntegrity(ratiosOnly() as never, PACKAGE_STORE_BANKS),
    ).not.toThrow();
    expect(() =>
      validatePackageIntegrity(
        [...ratiosOnly(), ...statisticsPending.map(bankFor)] as never,
        PACKAGE_STORE_BANKS,
      ),
    ).not.toThrow();
    expect(() =>
      validatePackageIntegrity(
        [
          ...ratiosOnly(),
          ...statisticsPending.map(bankFor),
          ...spellingPending.map(bankFor),
        ] as never,
        PACKAGE_STORE_BANKS,
      ),
    ).not.toThrow();
  });

  it('(b) a package that also carries all thirteen valid Geometry banks loads', () => {
    expect(() =>
      validatePackageIntegrity([...ratiosOnly(), ...geometryBanks()] as never, PACKAGE_STORE_BANKS),
    ).not.toThrow();
  });

  it('the active list alone would refuse Geometry banks as unknown (why the pending list exists)', () => {
    expect(() =>
      validatePackageIntegrity(
        [...ratiosOnly(), ...geometryBanks()] as never,
        GRADE_6_MATH_PACKAGE_BANKS,
      ),
    ).toThrow(/unknown bank/);
  });

  it('a present Geometry bank is still fully validated: count, role, coverage, unknown bank, tampering', () => {
    const banks = geometryBanks();
    const unit = banks.find((b) => b.code === 'geometry-unit-bank')!;
    const review = banks.find((b) => b.code === 'prism-volume-review-bank')!;
    const descOf = (code: string) => geometryPending.find((b) => b.code === code)!;
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
      requiredSkillRefs: [{ code: 'prism-volume', version: '1.0.0' }],
    });
    expect(() => run([...rest(unit.code), missingSkill])).toThrow(/missing coverage for skill/);

    const unknown = bankFor({
      code: 'geometry-other-bank',
      version: '1.0.0',
      minimumItems: 1,
      requiredSkillRefs: [{ code: 'prism-volume', version: '1.0.0' }],
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

  it('the Geometry switch is independent of the Statistics and Spelling switches', () => {
    const geoKeys = (keys: ReadonlySet<string>) => [...keys].filter((k) => GEO_RE.test(k));
    const statKeys = (keys: ReadonlySet<string>) => [...keys].filter((k) => STAT_RE.test(k));
    expect(geoKeys(pendingActivationBankKeys(selection('1.1.0')))).toHaveLength(13);
    expect(geoKeys(pendingActivationBankKeys(selection('1.2.0')))).toHaveLength(13);
    expect(geoKeys(pendingActivationBankKeys(selection('1.3.0')))).toHaveLength(0);
    // Statistics keys empty from 1.2.0 on, Geometry unaffected by that.
    expect(statKeys(pendingActivationBankKeys(selection('1.2.0')))).toHaveLength(0);
    expect(statKeys(pendingActivationBankKeys(selection('1.3.0')))).toHaveLength(0);
    expect(
      [...pendingActivationBankKeys(selection('1.3.0'))].filter((k) => k.startsWith('snsb6-')),
    ).toHaveLength(13);
  });

  it('selecting 1.3.0 makes exactly the five lesson and unit Geometry banks mandatory; the eight skill banks stay optional', () => {
    const afterList = deriveRequiredBanks(COURSE_CATALOG_INDEX).filter(isGeometry);
    expect(afterList.filter((d) => !d.optional).map(label)).toEqual([
      'area-of-composite-shapes-lesson-bank@1.0.0',
      'surface-area-and-volume-lesson-bank@1.0.0',
      'prism-volume-lesson-bank@1.0.0',
      'coordinate-geometry-lesson-bank@1.0.0',
      'geometry-unit-bank@1.0.0',
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
    const merged = afterList.filter((d) => !d.optional).map(bankFor);
    expect(() =>
      validatePackageIntegrity([...ratiosOnly(), ...merged] as never, [
        ...GRADE_6_MATH_PACKAGE_BANKS,
        ...afterList,
      ]),
    ).not.toThrow();
  });
});
