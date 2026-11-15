import { describe, expect, it } from 'vitest';

import { validateTransitionContentCatalog } from '../../src/content/catalog';
import { validatePythonContentRules } from '../../src/content/python-rules';
import { SkillSchema, type Skill } from '../../src/contracts/curriculum';
import { PY_LISTING, PY_SKILL, pythonPracticeItem } from '../phase1/python-paths-support';
import { skillCatalog } from '../../src/curriculum/catalog';
import { contentCatalog } from '../../src/content/catalog';

// Synthetic skills and records only (PYTHON-IMPLEMENT). The live catalog's one
// pending py6- skill and record (PYTHON-CONTENT) are covered in
// python-first-record.test.ts; these exercise the load rules through the
// validator's skill-set test seam.
const pySkill = SkillSchema.parse({
  code: PY_SKILL,
  version: '1.0.0',
  title: 'Synthetic print output reading',
  program: 'python-intro-grade-6',
  domain: 'py6-programming-fundamentals',
  standards: ['PY6-OBJ-1'],
  prerequisiteSkillCodes: [],
  observableEvidence: ['Reads the printed output.'],
  misconceptionCodes: [],
  difficultyBands: ['foundational', 'developing', 'challenging'],
  masteryCheckRule: 'Synthetic rule.',
}) as Skill;

const load = (items: unknown[], skills: readonly Skill[] = [pySkill]) =>
  validateTransitionContentCatalog(items, skills);
const item = (overrides: Record<string, unknown> = {}) => ({
  ...pythonPracticeItem('synthetic-python-catalog'),
  ...overrides,
});

describe('python content catalog rules (C4, C5)', () => {
  it('accepts one role-specific practice record per skill', () => {
    expect(() => load([item()])).not.toThrow();
    expect(load([item()])).toHaveLength(1);
  });

  it('the live catalog holds only the one approved py6- skill and pending record (D-322 H1/H4)', () => {
    expect(
      skillCatalog.filter((skill) => skill.code.startsWith('py6-')).map((skill) => skill.code),
    ).toEqual(['py6-print-output-reading']);
    expect(
      contentCatalog
        .filter((record) => record.skillRef.code.startsWith('py6-'))
        .map((record) => record.id),
    ).toEqual(['py6-print-output-reading-1']);
    // The synthetic fixtures in this file use a different code and stay out of it.
    expect(skillCatalog.some((skill) => skill.code === PY_SKILL)).toBe(false);
  });

  it('rejects a listing that does not match the program pin', () => {
    expect(() =>
      validatePythonContentRules(
        { id: 'x', codeListing: { ...PY_LISTING, languageVersion: '3.15' } as never },
        'python-intro-grade-6',
      ),
    ).toThrow(/does not match the program pin/);
    // Schema level: the contract itself pins 3.14.
    expect(() =>
      load([item({ codeListing: { ...PY_LISTING, languageVersion: '3.15' } })]),
    ).toThrow();
  });

  it('rejects a listing in a program with no language pin', () => {
    const other = SkillSchema.parse({
      ...pySkill,
      code: 'unit-rates-synthetic',
      program: 'grade-6-math',
      domain: 'ratios-and-proportional-reasoning',
    }) as Skill;
    expect(() =>
      load([item({ skillRef: { code: 'unit-rates-synthetic', version: '1.0.0' } })], [other]),
    ).toThrow(/no language pin|outside python-intro-grade-6/);
  });

  it('rejects python_output outside the Python program', () => {
    expect(() =>
      validatePythonContentRules(
        { id: 'x', deterministicValidator: { type: 'python_output', canonicalAnswer: 'a' } },
        'grade-6-math',
      ),
    ).toThrow(/outside python-intro-grade-6/);
  });

  it('requires a python_output validator and a listing in the Python program', () => {
    expect(() =>
      load([
        item({
          deterministicValidator: {
            type: 'text',
            canonicalAnswer: 'Hi',
            acceptedAnswers: ['Hi'],
            equivalenceNotes: 'n',
          },
        }),
      ]),
    ).toThrow(/must use a python_output validator/);
    expect(() => load([item({ codeListing: undefined })])).toThrow(/requires a codeListing/);
  });

  it('requires leakage patterns for the full output and every output line of three or more characters', () => {
    expect(() =>
      load([
        item({
          deterministicValidator: {
            type: 'python_output',
            canonicalAnswer: 'Hello\nWorld',
            acceptedAnswers: ['Hello\nWorld'],
            equivalenceNotes: 'n',
          },
          codeListing: { ...PY_LISTING, source: 'print("Hello")\nprint("World")' },
          forbiddenLeakagePatterns: ['Hello\nWorld', 'Hello'],
        }),
      ]),
    ).toThrow(/output line "World"/);
  });

  it('rejects hints that quote a code literal', () => {
    expect(() =>
      load([
        item({
          hintSteps: [
            {
              order: 1,
              assistanceLevel: 'small_strategic_hint',
              prompt: 'The first print shows "Hi".',
              question: 'Then what?',
            },
          ],
        }),
      ]),
    ).toThrow(/quote the code literal/);
  });

  it('rejects canonical output with a blank line, extra spaces or extra accepted answers', () => {
    for (const validator of [
      { canonicalAnswer: 'a\n\nb', acceptedAnswers: ['a\n\nb'] },
      { canonicalAnswer: ' a', acceptedAnswers: [' a'] },
      { canonicalAnswer: 'a  b', acceptedAnswers: ['a  b'] },
      { canonicalAnswer: 'Hi\n3', acceptedAnswers: ['Hi\n3', 'hi\n3'] },
    ]) {
      expect(() =>
        load([
          item({
            deterministicValidator: {
              type: 'python_output',
              equivalenceNotes: 'n',
              ...validator,
            },
          }),
        ]),
      ).toThrow();
    }
  });

  it('PY-R3: rejects excluded constructs in a python_output listing at catalog load', () => {
    // The authored output still reads "Hi\n3": the listing, not the output, is wrong.
    for (const source of [
      'print("Hi")\nprint()\nprint(3)',
      'print("Hi", end="")\nprint(3)',
      'print("Hi", "3", sep="\\n")',
      'print("Hi")\nprint("")\nprint(3)',
      'print("Hi\\n3")',
    ]) {
      expect(() => load([item({ codeListing: { ...PY_LISTING, source } })]), source).toThrow(
        /python_output authoring rules/,
      );
    }
  });

  it('PY-R3: accepts in-scope literal-print listings', () => {
    for (const source of [PY_LISTING.source, "print('Hi')\nprint(3)"]) {
      expect(() => load([item({ codeListing: { ...PY_LISTING, source } })]), source).not.toThrow();
    }
  });

  it('PY-R3: rejects listings outside the allowlist grammar, even when the output looks right', () => {
    for (const source of [
      'x = 3\nprint("Hi")\nprint(x)',
      'print("Hi")\nprint(1 + 2)',
      'for i in range(1):\n    print("Hi")\nprint(3)',
      'print(f"{print()}")',
      'print("Hi")  # note\nprint(3)',
    ]) {
      expect(() => load([item({ codeListing: { ...PY_LISTING, source } })]), source).toThrow(
        /outside the approved literal-print form/,
      );
    }
  });

  it('derived output: canonicalAnswer must equal what the literal prints print', () => {
    const withCanonical = (canonicalAnswer: string, source: string) =>
      item({
        codeListing: { ...PY_LISTING, source },
        deterministicValidator: {
          type: 'python_output',
          canonicalAnswer,
          acceptedAnswers: [canonicalAnswer],
          equivalenceNotes: 'n',
        },
        forbiddenLeakagePatterns: [canonicalAnswer],
      });
    expect(() =>
      load([withCanonical('Score 7 2.5 True', 'print("Score", 7, 2.5, True)')]),
    ).not.toThrow();
    expect(() => load([withCanonical('Hi\n4', 'print("Hi")\nprint(3)')])).toThrow(
      /canonicalAnswer must equal the output derived/,
    );
    expect(() => load([withCanonical('Score 7', 'print("Score", 7, 2.5)')])).toThrow(
      /canonicalAnswer must equal the output derived/,
    );
  });

  it('rejects a non-prefixed Python skill and a cross-program prerequisite', async () => {
    const { validateProgramSkillInvariants } =
      await import('../../src/curriculum/program-registry');
    expect(() =>
      validateProgramSkillInvariants([{ ...pySkill, code: 'print-output-reading' }]),
    ).toThrow(/prefix/);
    expect(() =>
      validateProgramSkillInvariants([
        { ...pySkill, prerequisiteSkillCodes: ['unit-rates'] },
        { code: 'unit-rates', program: 'grade-6-math' },
      ]),
    ).toThrow(/cannot depend on a skill from grade-6-math/);
    expect(() =>
      validateProgramSkillInvariants([
        { code: 'sci6-x', program: 'grade-6-science', prerequisiteSkillCodes: [PY_SKILL] },
        pySkill,
      ]),
    ).toThrow(/cannot depend on a skill from python-intro-grade-6/);
    expect(() => validateProgramSkillInvariants([pySkill])).not.toThrow();
  });
});
