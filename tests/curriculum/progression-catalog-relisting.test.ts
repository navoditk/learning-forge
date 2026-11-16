import { describe, expect, it } from 'vitest';

import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
  type AssessmentBank,
  type Lesson,
  type Program,
  type Ref,
  type Unit,
} from '../../src/contracts/progression';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import type { ActiveSelection, ReservedLabel } from '../../src/curriculum/catalog-versions';
import { checkClaimedSkillBanks } from '../../src/curriculum/catalog-registration-checks';
import { createCourseCatalog, type CourseCatalogInput } from '../../src/curriculum/course-catalog';
import { validateProgressionCatalog } from '../../src/curriculum/progression-catalog';

// Test-local synthetic family for program re-listing (SD-B, U-2 to U-5). Every
// code starts with `synthetic-relist-`; none is a real catalog label.
const v10 = '1.0.0';
const v11 = '1.1.0';
const v12 = '1.2.0';
const v2 = '2.0.0';
const rl = (suffix: string): string => `synthetic-relist-${suffix}`;
const ref = (code: string, version: string): Ref => ({ code, version });
const policyProfileRef = ref(rl('policy'), v10);
const provenance = { origin: 'original', licenseStatus: 'owned' } as const;
const review = {
  status: 'reviewed',
  reviewer: 'Synthetic fixture reviewer',
  reviewedAt: '2026-10-20',
  originalityStatement: 'Synthetic test fixture with no real curriculum content.',
} as const;

const P11 = ref(rl('program'), v11);
const P12 = ref(rl('program'), v12);
const Q10 = ref(rl('other-program'), v10);
const skill = (n: number): Ref => ref(rl(`s${n}`), v10);
const unitRef = (code: string, version = v10): Ref => ref(rl(code), version);
const lessonRef = (n: number): Ref => ref(rl(`l${n}`), v10);

const program = (code: string, version: string, unitRefs: Ref[]): Program =>
  ProgramSchema.parse({
    code,
    version,
    label: 'Synthetic relisting program',
    available: false,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: null,
    progressionMode: 'unit-sequenced',
    unitRefs,
    accessPolicyRef: ref(rl('access'), v10),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policyProfileRef,
  });

const bank = (code: string, targetRef: Ref, covered: Ref[]): AssessmentBank =>
  AssessmentBankSchema.parse({
    code,
    version: v10,
    targetRef,
    policyProfileRef,
    coveredSkillRefs: covered,
    itemCount: 3,
    contentHash: `sha256:${'a'.repeat(64)}`,
    provenance,
    review,
  });

const lesson = (n: number, owner: Ref): Lesson =>
  LessonSchema.parse({
    code: rl(`l${n}`),
    unitRef: owner,
    version: v10,
    title: `Synthetic relisting lesson ${n}`,
    objectives: ['Exercise program re-listing with invented metadata.'],
    skillRefs: [skill(n)],
    teachingContentRefs: [],
    practiceContentRefs: [],
    assessmentBankRef: ref(rl(`l${n}-bank`), v10),
    policyProfileRef,
    provenance,
    review,
  });

const unit = (code: string, version: string, programRef: Ref, lessons: Lesson[]): Unit =>
  UnitSchema.parse({
    code: rl(code),
    programRef,
    version,
    title: `Synthetic relisting unit ${code}`,
    summary: 'Invented unit used only by re-listing tests.',
    lessonRefs: lessons.map(({ code: c, version: v }) => ref(c, v)),
    policyProfileRef,
    assessmentBankRef: ref(rl(`${code}-bank`), version),
    provenance,
    review,
  });

const L1 = lesson(1, unitRef('u2'));
const L2 = lesson(2, unitRef('u2'));
const L3 = lesson(3, unitRef('u3'));
const L4 = lesson(4, unitRef('u4'));
const L5 = lesson(5, unitRef('u5'));
const U2 = unit('u2', v10, P11, [L1, L2]);
const U3 = unit('u3', v10, P12, [L3]);

const banks = (): AssessmentBank[] => [
  bank(rl('l1-bank'), lessonRef(1), [skill(1)]),
  bank(rl('l2-bank'), lessonRef(2), [skill(2)]),
  bank(rl('l3-bank'), lessonRef(3), [skill(3)]),
  bank(rl('u2-bank'), unitRef('u2'), [skill(1), skill(2)]),
  bank(rl('u3-bank'), unitRef('u3'), [skill(3)]),
  ...[1, 2, 3].flatMap((n) => [
    bank(rl(`s${n}-review-bank`), skill(n), [skill(n)]),
    bank(rl(`s${n}-delayed-check-bank`), skill(n), [skill(n)]),
  ]),
];

const extraBanks = (): AssessmentBank[] => [
  bank(rl('l4-bank'), lessonRef(4), [skill(4)]),
  bank(rl('l5-bank'), lessonRef(5), [skill(5)]),
  bank(rl('u4-bank'), unitRef('u4'), [skill(4)]),
  bank(rl('u5-bank'), unitRef('u5'), [skill(5)]),
];

const input = (
  programs: Program[],
  units: Unit[] = [U2, U3],
  lessons: Lesson[] = [L1, L2, L3],
): CourseCatalogInput => ({
  programs,
  units,
  lessons,
  banks: lessons.some((l) => l === L4 || l === L5) ? [...banks(), ...extraBanks()] : banks(),
});

const programsP = (): Program[] => [
  program(P11.code, v11, [unitRef('u2')]),
  program(P12.code, v12, [unitRef('u2'), unitRef('u3')]),
];

const selection = (programVersion: string): ActiveSelection => ({
  version: 'synthetic-relist-selection',
  programs: [{ code: P11.code, version: programVersion }],
  skillBanks: [1, 2, 3].flatMap((n) => [
    ref(rl(`s${n}-review-bank`), v10),
    ref(rl(`s${n}-delayed-check-bank`), v10),
  ]),
});

const validate = (i: CourseCatalogInput): void =>
  validateProgressionCatalog(i.programs, i.units, i.lessons, i.banks);
const versioned = (programVersion: string, reservedLabels?: readonly ReservedLabel[]) =>
  createVersionedCourseCatalog({
    records: input(programsP()),
    selection: selection(programVersion),
    ...(reservedLabels ? { reservedLabels } : {}),
  });
const keys = (records: readonly { code: string; version: string }[]): string[] =>
  records.map((r) => `${r.code}@${r.version}`);

describe('program re-listing (SD-B, U-2 to U-5)', () => {
  it('RL-P1: two program versions of one code list the same unit', () => {
    const i = input(programsP());
    expect(() => validate(i)).not.toThrow();
    expect(() => createCourseCatalog(i)).not.toThrow();
  });

  it('RL-P2: program order does not matter (U-4 order independence)', () => {
    const i = input([...programsP()].reverse());
    expect(() => validate(i)).not.toThrow();
    expect(() => createCourseCatalog(i)).not.toThrow();
  });

  it('RL-P3: selecting the successor program activates both units and all lessons', () => {
    const v = versioned(v12);
    expect(v.isActiveUnit(unitRef('u2'))).toBe(true);
    expect(v.isActiveUnit(unitRef('u3'))).toBe(true);
    for (const n of [1, 2, 3]) expect(v.isActiveLesson(lessonRef(n))).toBe(true);
    expect(keys(v.activeView().unitsOfProgram(P11.code))).toEqual(keys([U2, U3]));
    expect(v.programByRef(P11)).toBeDefined();
    expect(v.programByRef(P12)).toBeDefined();
  });

  it('RL-P4: selecting the older program keeps the successor unit indexed but inactive', () => {
    const v = versioned(v11);
    expect(v.isActiveUnit(unitRef('u2'))).toBe(true);
    expect(v.isActiveUnit(unitRef('u3'))).toBe(false);
    expect(v.isActiveLesson(lessonRef(1))).toBe(true);
    expect(v.isActiveLesson(lessonRef(2))).toBe(true);
    expect(v.isActiveLesson(lessonRef(3))).toBe(false);
    expect(v.index.unitByRef(unitRef('u3'))).toBeDefined();
  });

  it('RL-P5: the index holds the re-listed unit once with its lessons', () => {
    const { index } = versioned(v12);
    expect(index.units.filter((u) => u.code === U2.code)).toHaveLength(1);
    expect(index.unitOfLesson(L1)?.code).toBe(U2.code);
    expect(keys(index.lessonsOfUnit(U2))).toEqual(keys([L1, L2]));
  });

  it('RL-P6: claimed skill banks check both units with no violations', () => {
    expect(checkClaimedSkillBanks(versioned(v12), P12)).toEqual([]);
  });

  it('RL-N1: two program codes listing one unit throw (owner listed first)', () => {
    const i = input([programsP()[0], program(Q10.code, v10, [unitRef('u2')])], [U2], [L1, L2]);
    expect(() => validate(i)).toThrow('is listed by multiple programs');
  });

  it('RL-N2: two program codes listing one unit throw (other code first)', () => {
    const i = input([program(Q10.code, v10, [unitRef('u2')]), programsP()[0]], [U2], [L1, L2]);
    expect(() => validate(i)).toThrow('points to a different program');
  });

  it('RL-N3: a unit whose programRef names another code throws', () => {
    const own = unit('u5', v10, Q10, [L5]);
    const foreign = unit('u2', v10, Q10, [L1, L2]);
    const i = input(
      [programsP()[0], program(Q10.code, v10, [unitRef('u5')])],
      [foreign, own],
      [L1, L2, L5],
    );
    expect(() => validate(i)).toThrow('points to a different program');
  });

  it('RL-N4: an introducer that exists but does not list the unit throws', () => {
    const u4 = unit('u4', v10, P11, [L4]);
    const i = input(
      [program(P11.code, v11, [unitRef('u4')]), program(P12.code, v12, [unitRef('u2')])],
      [u4, U2],
      [L1, L2, L4],
    );
    expect(() => validate(i)).toThrow('points to a different program');
  });

  it('RL-N5: an unresolved programRef throws', () => {
    const lost = unit('u2', v10, ref(P11.code, '9.9.9'), [L1, L2]);
    const i = input([programsP()[0]], [lost], [L1, L2]);
    expect(() => validate(i)).toThrow('points to a different program');
  });

  it('RL-N6: a lesson claimed by two different units still throws with re-listing', () => {
    const greedy = unit('u3', v10, P12, [L1]);
    expect(() => validate(input(programsP(), [U2, greedy], [L1, L2]))).toThrow(
      'is listed by multiple units',
    );
  });

  it('RL-N7: a program listing two versions of one unit code throws (U-2)', () => {
    const u2b = unit('u2', v2, P12, [L1, L2]);
    const i = input(
      [programsP()[0], program(P12.code, v12, [unitRef('u2'), unitRef('u2', v2)])],
      [U2, u2b],
      [L1, L2],
    );
    expect(() => validate(i)).toThrow('lists a unit code more than once');
  });

  it('RL-N8: listing the identical unit ref twice still throws (U-1)', () => {
    const i = input([program(P12.code, v12, [unitRef('u2'), unitRef('u2')])], [U2], [L1, L2]);
    expect(() => validate(i)).toThrow('contains a duplicate reference');
  });

  it('RL-N9: an unlisted unit throws', () => {
    const extra = unit('u5', v10, P12, [L5]);
    expect(() => validate(input(programsP(), [U2, U3, extra], [L1, L2, L3, L5]))).toThrow(
      'is not listed by a program',
    );
  });

  it('RL-N10: a reserved unit label that is indexed throws', () => {
    const reserved: ReservedLabel[] = [{ kind: 'unit', code: U2.code, version: U2.version }];
    expect(() => versioned(v12, reserved)).toThrow('Reserved label is indexed: unit');
  });
});
