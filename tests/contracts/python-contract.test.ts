import { describe, expect, it } from 'vitest';

import { CurriculumDomainSchema, SkillSchema } from '../../src/contracts/curriculum';
import { DeterministicValidatorSchema } from '../../src/contracts/content';
import {
  PracticeContentItemSchema,
  TeachingContentItemSchema,
} from '../../src/contracts/progression';
import {
  CodeListingSchema,
  codeListingSourceViolations,
  PythonOutputValidatorSchema,
  pythonOutputCanonicalViolations,
  pythonOutputItemViolations,
} from '../../src/contracts/python';
import { pythonPracticeItem } from '../phase1/python-paths-support';

// Synthetic fixtures only (PYTHON-IMPLEMENT): none is curriculum content.
const listing = (overrides: Record<string, unknown> = {}) => ({
  language: 'python',
  languageVersion: '3.14',
  source: 'x = 2\nprint(x)',
  showLineNumbers: true,
  structureDescription: 'Two lines at the left margin.',
  ...overrides,
});
const validator = (overrides: Record<string, unknown> = {}) => ({
  type: 'python_output',
  canonicalAnswer: 'a\nb',
  acceptedAnswers: ['a\nb'],
  equivalenceNotes: 'Exact output only.',
  ...overrides,
});

describe('codeListing contract (C4, dossier 5.1)', () => {
  it('accepts a valid listing', () => {
    expect(CodeListingSchema.safeParse(listing()).success).toBe(true);
    expect(
      CodeListingSchema.safeParse(
        listing({ source: 'for i in range(2):\n    print(i)', showLineNumbers: false }),
      ).success,
    ).toBe(true);
  });

  const rejected: [string, Record<string, unknown>][] = [
    ['a tab', { source: 'x = 1\n\tprint(x)' }],
    ['a CR', { source: 'x = 1\r\nprint(x)' }],
    ['trailing whitespace', { source: 'x = 1 \nprint(x)' }],
    ['non-ASCII', { source: 'print("café")' }],
    ['a control character', { source: 'print(1)\u0000' }],
    ['a curly quote', { source: 'print(“hi”)' }],
    ['indentation that is not a multiple of four', { source: 'if True:\n  print(1)' }],
    ['more than 20 lines', { source: Array.from({ length: 21 }, () => 'x = 1').join('\n') }],
    ['a line over 60 characters', { source: `print("${'a'.repeat(60)}")` }],
    ['a leading blank line', { source: '\nprint(1)' }],
    ['a trailing blank line', { source: 'print(1)\n' }],
    ['a version mismatch', { languageVersion: '3.15' }],
    ['another language', { language: 'javascript' }],
    ['an empty structure description', { structureDescription: '   ' }],
    ['an unknown key', { run: true }],
  ];
  for (const [label, overrides] of rejected) {
    it(`rejects ${label}`, () => {
      expect(CodeListingSchema.safeParse(listing(overrides)).success).toBe(false);
    });
  }

  for (const token of [
    'import math',
    'eval("1")',
    'exec("x")',
    'f = open("a")',
    'x.__class__',
    'os.system("a")',
    'subprocess.run(a)',
    'x = input("a")',
    'while True:\n    pass',
  ]) {
    it(`rejects the denylisted token in ${JSON.stringify(token)}`, () => {
      expect(CodeListingSchema.safeParse(listing({ source: token })).success).toBe(false);
    });
  }

  it('does not reject ordinary words that merely contain a denied token', () => {
    expect(codeListingSourceViolations('opening = 1\nposition = 2\nprint(opening)')).toEqual([]);
  });
});

describe('python_output validator contract (C5, dossier 5.2)', () => {
  it('is a member of the discriminated validator union', () => {
    expect(DeterministicValidatorSchema.safeParse(validator()).success).toBe(true);
  });

  it('accepts 1 to 8 nonempty printable lines', () => {
    for (const canonicalAnswer of ['x', 'a\nb', 'True', '[1, 2]', 'Done!', '3.5']) {
      expect(
        PythonOutputValidatorSchema.safeParse(
          validator({ canonicalAnswer, acceptedAnswers: [canonicalAnswer] }),
        ).success,
        canonicalAnswer,
      ).toBe(true);
    }
    const eight = Array.from({ length: 8 }, (_, i) => `l${i}`).join('\n');
    expect(
      PythonOutputValidatorSchema.safeParse(
        validator({ canonicalAnswer: eight, acceptedAnswers: [eight] }),
      ).success,
    ).toBe(true);
  });

  const badCanonical: [string, string][] = [
    ['empty output', ''],
    ['a blank line', 'a\n\nb'],
    ['a trailing LF', 'a\n'],
    ['a leading LF', '\na'],
    ['leading spaces', ' a'],
    ['trailing spaces', 'a '],
    ['double spaces', 'a  b'],
    ['more than 8 lines', Array.from({ length: 9 }, (_, i) => `l${i}`).join('\n')],
    ['a tab', 'a\tb'],
    ['non-ASCII', 'café'],
    ['a CR', 'a\r\nb'],
    ['a float artefact', '0.30000000000000004'],
  ];
  for (const [label, canonicalAnswer] of badCanonical) {
    it(`rejects ${label}`, () => {
      expect(
        PythonOutputValidatorSchema.safeParse(
          validator({ canonicalAnswer, acceptedAnswers: [canonicalAnswer] }),
        ).success,
      ).toBe(false);
      expect(pythonOutputCanonicalViolations(canonicalAnswer).length).toBeGreaterThan(0);
    });
  }

  it('requires acceptedAnswers to be exactly [canonicalAnswer]', () => {
    for (const acceptedAnswers of [['a\nb', 'a b'], ['a b'], [], ['A\nb']]) {
      expect(PythonOutputValidatorSchema.safeParse(validator({ acceptedAnswers })).success).toBe(
        false,
      );
    }
  });

  it('does not allow the legacy parts matcher or an unknown key', () => {
    expect(
      PythonOutputValidatorSchema.safeParse(validator({ parts: [{ accepted: ['a'] }] })).success,
    ).toBe(false);
  });

  it('keeps every legacy validator type valid and unchanged', () => {
    const numeric = {
      type: 'numeric',
      canonicalAnswer: '7',
      acceptedAnswers: ['7'],
      equivalenceNotes: 'n',
    };
    expect(DeterministicValidatorSchema.safeParse(numeric).success).toBe(true);
  });
});

describe('item-level python authoring checks (dossier 5.4)', () => {
  const base = {
    canonicalAnswer: 'Hello\nWorld',
    forbiddenLeakagePatterns: ['Hello\nWorld', 'Hello', 'World'],
    hintText: 'Read line 1, then line 2.',
    listingSource: 'print("Hello")\nprint("World")',
  };

  it('accepts patterns that cover the full output and every output line of three or more characters', () => {
    expect(pythonOutputItemViolations(base)).toEqual([]);
    expect(
      pythonOutputItemViolations({
        ...base,
        canonicalAnswer: 'Hi\n3',
        forbiddenLeakagePatterns: ['Hi\n3'],
        listingSource: 'print("Hi")\nprint(1 + 2)',
      }),
    ).toEqual([]);
  });

  it('rejects patterns that omit the full output or an output line', () => {
    expect(
      pythonOutputItemViolations({ ...base, forbiddenLeakagePatterns: ['Hello', 'World'] }),
    ).toEqual(expect.arrayContaining([expect.stringContaining('full canonical output')]));
    expect(
      pythonOutputItemViolations({ ...base, forbiddenLeakagePatterns: ['Hello\nWorld', 'Hello'] }),
    ).toEqual(expect.arrayContaining([expect.stringContaining('output line "World"')]));
  });

  it('rejects hints that quote a code literal or an output line', () => {
    for (const hintText of [
      'The first print shows "Hello".',
      "Look at 'World' on line 2.",
      'Line 2 prints World.',
      'The text hello is printed first.',
    ]) {
      expect(pythonOutputItemViolations({ ...base, hintText }).length, hintText).toBeGreaterThan(0);
    }
  });

  it('allows hints that only name line numbers and concepts', () => {
    expect(
      pythonOutputItemViolations({
        ...base,
        hintText: 'Line 1 prints text. Line 2 prints text. Which comes first?',
      }),
    ).toEqual([]);
  });
});

describe('role schemas carry the listing; the domain and skill version (C2, C4)', () => {
  it('accepts a synthetic practice record with a listing and python_output validator', () => {
    const item = pythonPracticeItem('synthetic-python-contract');
    expect(PracticeContentItemSchema.safeParse(item).success).toBe(true);
  });

  it('rejects a bad listing on a record, and accepts one on a teaching record', () => {
    const item = pythonPracticeItem('synthetic-python-contract');
    expect(
      PracticeContentItemSchema.safeParse({
        ...item,
        codeListing: { ...(item.codeListing as object), source: 'import os' },
      }).success,
    ).toBe(false);
    const teaching = {
      id: 'synthetic-python-teaching',
      version: '1.0.0',
      title: 'Synthetic teaching',
      role: 'teaching',
      skillRef: item.skillRef,
      mode: 'core',
      difficulty: 'foundational',
      standards: ['PY6-OBJ-1'],
      observableEvidence: ['Reads a listing.'],
      provenance: item.provenance,
      review: item.review,
      accessibilityNotes: 'n',
      accessibleAlternative: 'a',
      itemReadinessRefs: [],
      explanation: 'Synthetic explanation.',
      codeListing: item.codeListing,
    };
    expect(TeachingContentItemSchema.safeParse(teaching).success).toBe(true);
  });

  it('adds the Python domain', () => {
    expect(CurriculumDomainSchema.safeParse('py6-programming-fundamentals').success).toBe(true);
  });

  const skill = (overrides: Record<string, unknown> = {}) => ({
    code: 'py6-synthetic-skill',
    version: '1.0.0',
    title: 'Synthetic skill',
    program: 'python-intro-grade-6',
    domain: 'py6-programming-fundamentals',
    standards: ['PY6-OBJ-1'],
    prerequisiteSkillCodes: [],
    observableEvidence: ['Evidence.'],
    misconceptionCodes: [],
    difficultyBands: ['foundational'],
    masteryCheckRule: 'Rule.',
    ...overrides,
  });

  it('requires new Python skills to carry a version', () => {
    expect(SkillSchema.safeParse(skill()).success).toBe(true);
    expect(SkillSchema.safeParse(skill({ version: undefined })).success).toBe(false);
    // Legacy skills keep an optional version.
    expect(
      SkillSchema.safeParse(
        skill({
          code: 'unit-rates',
          program: 'grade-6-math',
          domain: 'ratios-and-proportional-reasoning',
          version: undefined,
        }),
      ).success,
    ).toBe(true);
  });
});
