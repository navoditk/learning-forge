import { describe, expect, it } from 'vitest';

import { ProgramSchema, type Program, type Ref } from '../../src/contracts/progression';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import { COURSE_CATALOG, createCourseCatalog } from '../../src/curriculum/course-catalog';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../src/curriculum/pilot-catalog';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import {
  RATIOS_UNIT_2_ASSESSMENT_BANKS,
  RATIOS_UNIT_2_LESSONS,
  RATIOS_UNIT_2_UNIT,
} from '../../src/curriculum/ratios-unit-2-catalog';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import {
  SV_BANKS,
  SV_LESSONS_V1,
  SV_LESSONS_V2,
  SV_PROGRAM_CODE,
  SV_PROGRAM_V1,
  SV_PROGRAM_V11,
  SV_PROGRAM_V11_REF,
  SV_PROGRAM_V1_REF,
  SV_UNIT_V1,
  SV_UNIT_V1_REF,
  SV_UNIT_V2,
  SV_UNIT_V2_REF,
  naiveKeepingHistoryInput,
  naiveReplacementInput,
  selectionFor,
  sv,
  svSkill,
  syntheticVersionedInput,
} from './fixtures/synthetic-versioned-catalog';

const key = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;

const build = (
  selection = selectionFor(),
  records = syntheticVersionedInput(),
  reservedLabels?: Parameters<typeof createVersionedCourseCatalog>[0]['reservedLabels'],
) => createVersionedCourseCatalog({ records, selection, reservedLabels });

// RI-5: grade-6-math@1.1.0 is the selected version; 1.0.0 stays registered.
const ACTIVE_REGISTRY = PROGRAM_REGISTRY.filter(
  (program) => program.code !== 'grade-6-math' || program.version === '1.1.0',
);

const PILOT_SKILL_BANKS: Ref[] = [
  'ratio-language',
  'unit-rates',
  'ratio-tables',
  'double-number-lines',
  'percent-applications',
].flatMap((skill) =>
  ['review-bank', 'delayed-check-bank'].map((suffix) => ({
    code: `${skill}-${suffix}`,
    version: '1.0.0',
  })),
);

const combinedRecords = {
  programs: [...PROGRAM_REGISTRY, SV_PROGRAM_V1, SV_PROGRAM_V11],
  units: [...PILOT_UNITS, RATIOS_UNIT_2_UNIT, SV_UNIT_V1, SV_UNIT_V2],
  lessons: [...PILOT_LESSONS, ...RATIOS_UNIT_2_LESSONS, ...SV_LESSONS_V1, ...SV_LESSONS_V2],
  banks: [...PILOT_ASSESSMENT_BANKS, ...RATIOS_UNIT_2_ASSESSMENT_BANKS, ...SV_BANKS],
};
const combinedSelection = () => {
  const base = selectionFor();
  return {
    ...base,
    programs: [
      ...ACTIVE_REGISTRY.map(({ code, version }) => ({ code, version })),
      ...base.programs,
    ],
    skillBanks: [...PILOT_SKILL_BANKS, ...base.skillBanks],
  };
};

const unitless = (code: string, version = '1.0.0'): Program =>
  ProgramSchema.parse({
    code,
    version,
    label: 'Synthetic unitless program',
    available: false,
    subjectKind: 'enrichment-non-graded',
    skillCodePrefix: null,
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: { code: `${code}-access`, version },
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: { code: `${code}-default`, version },
  });

describe('duplicate program code@version', () => {
  it('DUP-1 rejects the same program ref twice', () => {
    const records = { ...syntheticVersionedInput(), programs: [SV_PROGRAM_V1, SV_PROGRAM_V1] };
    expect(() => createCourseCatalog(records)).toThrow(
      `Duplicate program reference: ${key(SV_PROGRAM_V1)}`,
    );
  });

  it('DUP-2 accepts one code at two versions, each listing its own unit', () => {
    expect(() => createCourseCatalog(syntheticVersionedInput())).not.toThrow();
  });

  it('DUP-3 leaves the production and existing multi-program records building', () => {
    const keys = PROGRAM_REGISTRY.map(key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(COURSE_CATALOG.programs).toEqual(ACTIVE_REGISTRY);
    expect(() => createCourseCatalog(combinedRecords)).not.toThrow();
  });

  it('DUP-4 now rejects two identical unitless programs that used to pass', () => {
    const program = unitless('synthetic-versioned-unitless');
    const records = { programs: [program, program], units: [], lessons: [], banks: [] };
    expect(() => createCourseCatalog(records)).toThrow(
      'Duplicate program reference: synthetic-versioned-unitless@1.0.0',
    );
  });
});

describe('active selection', () => {
  it('AS-1 resolves the selected program version regardless of array order', () => {
    for (const order of ['v1-first', 'v11-first'] as const) {
      const versioned = build(selectionFor(), syntheticVersionedInput(order));
      expect(versioned.activeView().programByCode(SV_PROGRAM_CODE)).toBe(SV_PROGRAM_V11);
      expect(versioned.activeProgram(SV_PROGRAM_CODE)).toBe(SV_PROGRAM_V11);
    }
    // Negative control: the raw index keeps first-wins (design 5.2).
    const first = build(selectionFor(), syntheticVersionedInput('v1-first'));
    const last = build(selectionFor(), syntheticVersionedInput('v11-first'));
    expect(first.index.programByCode(SV_PROGRAM_CODE)).toBe(SV_PROGRAM_V1);
    expect(last.index.programByCode(SV_PROGRAM_CODE)).toBe(SV_PROGRAM_V11);
  });

  it('AS-1b selecting 1.0.0 makes 1.0.0 the active version', () => {
    const versioned = build(selectionFor({ programVersion: '1.0.0' }));
    expect(versioned.activeProgram(SV_PROGRAM_CODE)).toBe(SV_PROGRAM_V1);
    expect(versioned.isActiveUnit(SV_UNIT_V1_REF)).toBe(true);
    expect(versioned.isActiveUnit(SV_UNIT_V2_REF)).toBe(false);
  });

  it('AS-2 projects exactly one program per code in index order', () => {
    const versioned = build(combinedSelection(), combinedRecords);
    const active = versioned.activePrograms();
    const codes = active.map((program) => program.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual([...ACTIVE_REGISTRY.map((p) => p.code), SV_PROGRAM_CODE]);
    expect(active.at(-1)).toBe(SV_PROGRAM_V11);
    expect(versioned.activeView().programs).toEqual(active);
  });

  it('AS-3 makes code-keyed helpers mean current through the active view', () => {
    const versioned = build();
    const skill = sv('s4');
    expect(isSkillClaimedByAuthoredUnit(SV_PROGRAM_CODE, skill, versioned.activeView())).toBe(true);
    // C-12 reproduction: the raw index resolves 1.0.0 first, which does not claim s4.
    expect(isSkillClaimedByAuthoredUnit(SV_PROGRAM_CODE, skill, versioned.index)).toBe(false);
  });

  it('AS-4 reports active units and lessons while history still resolves', () => {
    const versioned = build();
    expect(versioned.isActiveLesson({ code: sv('l1'), version: '2.0.0' })).toBe(true);
    expect(versioned.isActiveLesson({ code: sv('l1'), version: '1.0.0' })).toBe(false);
    expect(versioned.isActiveUnit(SV_UNIT_V2_REF)).toBe(true);
    expect(versioned.isActiveUnit(SV_UNIT_V1_REF)).toBe(false);
    expect(versioned.index.lessonByRef({ code: sv('l1'), version: '1.0.0' })).toBe(
      SV_LESSONS_V1[0],
    );
    expect(versioned.programByRef(SV_PROGRAM_V1_REF)).toBe(SV_PROGRAM_V1);
    expect(versioned.programByRef(SV_PROGRAM_V11_REF)).toBe(SV_PROGRAM_V11);
    expect(versioned.programByRef({ code: SV_PROGRAM_CODE, version: '9.9.9' })).toBeUndefined();
  });

  it('AS-4b the active view resolves units of the selected program and keeps history', () => {
    const view = build().activeView();
    expect(view.unitsOfProgram(SV_PROGRAM_CODE)).toEqual([SV_UNIT_V2]);
    expect(view.unitByRef(SV_UNIT_V1_REF)).toBe(SV_UNIT_V1);
    expect(view.lessonsClaimingSkill(svSkill(3))).toHaveLength(2);
    expect(view.programByCode('not-a-program')).toBeUndefined();
  });

  it('AS-5 picks the selected skill bank, never the first in array order', () => {
    const versioned = build();
    const named = versioned.activeSkillBank('DELAYED_CHECK', svSkill(3));
    expect(named?.version).toBe('2.0.0');
    // Negative control: today's array `find` rule returns the first version.
    const first = versioned.index.banks.find(
      (bank) => bank.code === sv('s3-delayed-check-bank') && bank.targetRef.code === sv('s3'),
    );
    expect(first?.version).toBe('1.0.0');
    expect(versioned.activeSkillBank('REVIEW', svSkill(3))?.code).toBe(sv('s3-review-bank'));
    expect(
      versioned.activeSkillBank('REVIEW', { code: sv('s3'), version: '9.9.9' }),
    ).toBeUndefined();
    expect(
      versioned.activeSkillBank('REVIEW', { code: 'unknown-skill', version: '1.0.0' }),
    ).toBeUndefined();
  });

  it('AS-E1..E9 fails closed on each selection rule', () => {
    const base = selectionFor();
    const orphan = {
      ...SV_BANKS[0]!,
      code: sv('orphan-bank'),
      targetRef: { code: sv('nowhere'), version: '1.0.0' },
    };
    const records = syntheticVersionedInput();
    // E1 / S-1 missing program code
    expect(() => build({ ...base, programs: [] })).toThrow('does not name program code');
    // E2 / S-1 repeated program code
    expect(() => build({ ...base, programs: [SV_PROGRAM_V11_REF, SV_PROGRAM_V11_REF] })).toThrow(
      'names program code more than once',
    );
    expect(() => build({ ...base, programs: [SV_PROGRAM_V1_REF, SV_PROGRAM_V11_REF] })).toThrow(
      'names program code more than once',
    );
    // E3 / S-2 unresolved program ref
    expect(() => build(selectionFor({ programVersion: '9.9.9' }))).toThrow(
      'Selected program does not resolve',
    );
    // E4 / S-4 unresolved skill bank
    expect(() =>
      build({
        ...base,
        skillBanks: [{ code: sv('s1-review-bank'), version: '9.9.9' }, ...base.skillBanks.slice(1)],
      }),
    ).toThrow('not a skill-targeted bank');
    // E5 / S-4 lesson bank named as a skill bank
    expect(() =>
      build({
        ...base,
        skillBanks: [{ code: sv('l2-bank'), version: '1.0.0' }, ...base.skillBanks.slice(1)],
      }),
    ).toThrow('not a skill-targeted bank');
    // E6 / S-4 unnamed skill bank code
    expect(() => build({ ...base, skillBanks: base.skillBanks.slice(0, -1) })).toThrow(
      'does not name skill bank code',
    );
    // S-4 repeated skill bank code
    expect(() => build({ ...base, skillBanks: [...base.skillBanks, base.skillBanks[0]!] })).toThrow(
      'names skill bank code more than once',
    );
    // E7 / S-3 unclassifiable bank
    expect(() => build(base, { ...records, banks: [...records.banks, orphan] })).toThrow(
      `Assessment bank ${key(orphan)} target does not resolve`,
    );
    // E8 / schema: extra key and empty version
    expect(() => build({ ...base, extra: true } as never)).toThrow();
    expect(() => build({ ...base, version: '' })).toThrow();
    expect(() => build({ ...base, programs: [{ code: SV_PROGRAM_CODE, version: '' }] })).toThrow();
    // E9 / S-5 reserved label in the index and in the selection
    expect(() =>
      build(base, records, [{ kind: 'program', code: SV_PROGRAM_CODE, version: '1.0.0' }]),
    ).toThrow('Reserved label is indexed');
    expect(() =>
      build(base, records, [{ kind: 'lesson', code: sv('l5'), version: '2.0.0' }]),
    ).toThrow('Reserved label is indexed');
    expect(() =>
      build(
        {
          ...base,
          skillBanks: [
            ...base.skillBanks.slice(0, 5),
            { code: sv('s3-delayed-check-bank'), version: '9.9.9' },
          ],
        },
        records,
        [{ kind: 'bank', code: sv('s3-delayed-check-bank'), version: '9.9.9' }],
      ),
    ).toThrow('Reserved label is selected');
    // Unrelated reserved labels do not interfere.
    expect(() =>
      build(base, records, [{ kind: 'program', code: 'some-other-program', version: '1.0.0' }]),
    ).not.toThrow();
  });

  it('AS-E10 applies the fixed error precedence', () => {
    const base = selectionFor();
    const records = syntheticVersionedInput();
    const reserved = [{ kind: 'program' as const, code: SV_PROGRAM_CODE, version: '1.1.0' }];
    // Reserved label beats S-1 (missing program code) and S-2.
    expect(() => build({ ...base, programs: [] }, records, reserved)).toThrow('Reserved label');
    // Schema beats everything else: a schema failure is not a reserved-label failure.
    const schemaFailure = (() => {
      try {
        build({ ...base, version: '', programs: [] }, records, reserved);
        return '';
      } catch (error) {
        return String(error);
      }
    })();
    expect(schemaFailure).not.toBe('');
    expect(schemaFailure).not.toContain('Reserved label');
    // S-1 beats S-2.
    expect(() =>
      build({
        ...base,
        programs: [
          { code: SV_PROGRAM_CODE, version: '9.9.9' },
          { code: SV_PROGRAM_CODE, version: '1.1.0' },
        ],
      }),
    ).toThrow('names program code more than once');
    // S-2 beats S-4.
    expect(() =>
      build({ ...base, programs: [{ code: SV_PROGRAM_CODE, version: '9.9.9' }], skillBanks: [] }),
    ).toThrow('Selected program does not resolve');
  });

  it('AS-B1 requires naming a program code with a single indexed version', () => {
    const banks = SV_BANKS.filter((bank) => bank.targetRef.version === '1.0.0');
    const records = {
      programs: [SV_PROGRAM_V1],
      units: [SV_UNIT_V1],
      lessons: SV_LESSONS_V1,
      banks,
    };
    const named = selectionFor({ programVersion: '1.0.0' });
    const selection = {
      ...named,
      skillBanks: named.skillBanks.filter((entry) =>
        banks.some((bank) => key(bank) === key(entry)),
      ),
    };
    expect(() => build(selection, records)).not.toThrow();
    expect(() => build({ ...selection, programs: [] }, records)).toThrow(
      'does not name program code',
    );
  });
});

describe('version retention (V-5 mechanism, synthetic successor)', () => {
  it('V5-1 resolves every pilot 1.0.0 record to the same object after a successor is selected', () => {
    const versioned = build(combinedSelection(), combinedRecords);
    for (const unit of PILOT_UNITS) expect(versioned.index.unitByRef(unit)).toBe(unit);
    for (const lesson of PILOT_LESSONS) expect(versioned.index.lessonByRef(lesson)).toBe(lesson);
    for (const bank of PILOT_ASSESSMENT_BANKS) expect(versioned.index.bankByRef(bank)).toBe(bank);
    for (const program of PROGRAM_REGISTRY) {
      expect(versioned.programByRef(program)).toBe(program);
    }
    expect(versioned.activeProgram('grade-6-math')).toBe(ACTIVE_REGISTRY[0]);
  });

  it('V5-2 resolves the 1.0.0 unit and lessons after 2.0.0 is active', () => {
    const versioned = build();
    expect(versioned.index.unitByRef(SV_UNIT_V1_REF)).toBe(SV_UNIT_V1);
    for (const lesson of SV_LESSONS_V1) {
      expect(versioned.index.lessonByRef(lesson)).toBe(lesson);
      expect(versioned.isActiveLesson(lesson)).toBe(false);
    }
    expect(versioned.index.lessonsOfUnit(SV_UNIT_V1)).toEqual(SV_LESSONS_V1);
  });

  it('OC2-1 builds with both a shared lesson bank (L-1) and a per-version bank (L-2)', () => {
    expect(key(SV_LESSONS_V1[0]!.assessmentBankRef)).toBe(key(SV_LESSONS_V2[0]!.assessmentBankRef));
    expect(key(SV_LESSONS_V1[1]!.assessmentBankRef)).not.toBe(
      key(SV_LESSONS_V2[1]!.assessmentBankRef),
    );
    expect(() => build()).not.toThrow();
  });
});

describe('section 6.1 counterexamples at catalog level', () => {
  it('S1-1 lists both lesson versions that claim a skill', () => {
    const claimers = build().index.lessonsClaimingSkill(svSkill(3));
    expect(claimers.map(key)).toEqual([key(SV_LESSONS_V1[2]!), key(SV_LESSONS_V2[2]!)]);
  });

  it('S1-2 a naive replacement loses the 1.0.0 claimant', () => {
    const naive = createCourseCatalog(naiveReplacementInput());
    expect(naive.lessonsClaimingSkill(svSkill(3)).map(key)).toEqual([key(SV_LESSONS_V2[2]!)]);
  });

  it('S1-3 a naive input that keeps 1.0.0 records without a lister is rejected', () => {
    expect(() => createCourseCatalog(naiveKeepingHistoryInput())).toThrow('is not listed by a');
  });

  it('S2-1 keeps a 1.0.0 lesson resolvable under P-A and not on the naive input', () => {
    const ref = { code: sv('l2'), version: '1.0.0' };
    expect(build().index.lessonByRef(ref)).toBe(SV_LESSONS_V1[1]);
    expect(createCourseCatalog(naiveReplacementInput()).lessonByRef(ref)).toBeUndefined();
  });
});
