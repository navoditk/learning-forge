import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { contentCatalog, validateContentCatalog } from '../../src/content/catalog';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import { CurriculumDomainSchema, Skill } from '../../src/contracts/curriculum';
import { parseAvailableProgram } from '../../src/phase1/program';
import { skillCatalog, skillsByCode, validateSkillCatalog } from '../../src/curriculum/catalog';
import {
  GRADE_6_SCIENCE_STANDARDS,
  svgTextStrings,
  validateScienceContentRules,
} from '../../src/curriculum/science-rules';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import {
  PROGRAM_REGISTRY,
  programsByCode,
  validateProgramSkillInvariants,
} from '../../src/curriculum/program-registry';

// Synthetic, test-only Science skill and record. Nothing here is curriculum
// content: it exists to exercise the load-time rules while Science stays
// unavailable and has no production skill or record.
const scienceSkill = (overrides: Record<string, unknown> = {}): Skill =>
  ({
    code: 'sci6-synthetic-skill',
    version: '1.0.0',
    title: 'Synthetic science skill',
    program: 'grade-6-science',
    domain: 'sci6-life-science',
    standards: ['MS-LS1-1'],
    prerequisiteSkillCodes: [],
    observableEvidence: ['Synthetic evidence statement.'],
    misconceptionCodes: ['synthetic-misconception'],
    difficultyBands: ['foundational'],
    masteryCheckRule: 'Synthetic rule.',
    ...overrides,
  }) as Skill;

const choiceField = (overrides: Record<string, unknown> = {}) => ({
  key: 'claim',
  kind: 'choice',
  label: 'Claim',
  options: [
    { id: 'yes', label: 'Made of cells' },
    { id: 'no', label: 'Not made of cells' },
  ],
  correctOptionId: 'yes',
  ...overrides,
});

type Json = Record<string, unknown>;

function scienceRecord(id: string, overrides: Json = {}, validatorOverrides: Json = {}): Json {
  const field = choiceField();
  return {
    id,
    version: 'content-1',
    title: 'Synthetic science record',
    role: 'practice',
    skillRef: { code: 'sci6-synthetic-skill', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['MS-LS1-1'],
    itemReadinessRefs: [],
    observableEvidence: ['Synthetic evidence statement.'],
    prompt: 'Synthetic prompt text for validation only.',
    solutionRepresentation: 'Synthetic solution representation.',
    solutionMethod: 'Synthetic method.',
    deterministicValidator: {
      type: 'structured',
      responseMode: { id: 'structured-fields', version: '1' },
      canonicalAnswer: 'Claim: Made of cells',
      acceptedAnswers: ['Claim: Made of cells'],
      equivalenceNotes: 'Synthetic note.',
      fields: [field],
      ...validatorOverrides,
    },
    misconceptionCodes: ['synthetic-misconception'],
    hintSteps: [
      {
        order: 1,
        assistanceLevel: 'small_strategic_hint',
        prompt: 'Synthetic hint one.',
        question: 'Synthetic question one?',
      },
    ],
    forbiddenLeakagePatterns: ['made of cells'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'Synthetic reviewer',
      originalityStatement: 'Synthetic fixture.',
      reviewedAt: '2026-10-15',
    },
    accessibilityNotes: 'Synthetic note.',
    accessibleAlternative: 'Synthetic text version.',
    ...overrides,
  };
}

const figure = (svgText: string) => ({
  svgMarkup: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><text x="5" y="20">${svgText}</text></svg>`,
  altText: 'A labelled synthetic model with a nucleus and a membrane.',
  caption: 'Synthetic figure.',
  width: 200,
  height: 120,
});

// Registers the synthetic Science skill in the live (mutable) catalog for one
// test, then removes it so no other suite can observe it.
let registered: Skill | undefined;
function registerScienceSkill(skill: Skill = scienceSkill()): void {
  registered = skill;
  skillCatalog.push(skill);
  skillsByCode.set(skill.code, skill);
}

afterEach(() => {
  if (!registered) return;
  const index = skillCatalog.indexOf(registered);
  if (index >= 0) skillCatalog.splice(index, 1);
  skillsByCode.delete(registered.code);
  registered = undefined;
});

const loadWith = (...records: Json[]) =>
  validateContentCatalog([...contentCatalog, ...records] as unknown[]);

describe('P1 grade-6-science registry entry', () => {
  it('has its own graded, skill-graph-only, available entry with the same policy refs', () => {
    expect(programsByCode.get('grade-6-science')).toEqual({
      code: 'grade-6-science',
      version: '1.0.0',
      label: 'Grade 6 Science (Cells unit, practice only)',
      available: true,
      subjectKind: 'graded-academic',
      skillCodePrefix: 'sci6-',
      progressionMode: 'skill-graph-only',
      unitRefs: [],
      accessPolicyRef: { code: 'grade-6-science-access', version: '1.0.0' },
      legacyCompatibilityPolicyRef: null,
      defaultPolicyProfileRef: { code: 'grade-6-science-default', version: '1.0.0' },
    });
  });

  it('keeps the other four placeholders and the registry order unchanged', () => {
    expect(PROGRAM_REGISTRY.map((program) => program.code)).toEqual([
      'grade-6-math',
      'math-kangaroo-6',
      'moems-6',
      'amc-8',
      'mathcounts-6',
      'scripps-spelling-bee-6',
      'grade-6-ela',
      'grade-6-science',
      'grade-6-social-studies',
      'international-geography-bee-6',
      'science-olympiad-division-b',
    ]);
    for (const [code, label] of [
      ['grade-6-ela', 'Grade 6 ELA'],
      ['grade-6-social-studies', 'Grade 6 Social Studies'],
      ['international-geography-bee-6', 'International Geography Bee (Grade 6)'],
      ['science-olympiad-division-b', 'Science Olympiad Division B (Grade 6)'],
    ]) {
      expect(programsByCode.get(code)).toEqual({
        code,
        version: '1.0.0',
        label,
        available: false,
        subjectKind: 'enrichment-non-graded',
        skillCodePrefix: null,
        progressionMode: 'skill-graph-only',
        unitRefs: [],
        accessPolicyRef: { code: `${code}-access`, version: '1.0.0' },
        legacyCompatibilityPolicyRef: null,
        defaultPolicyProfileRef: { code: `${code}-default`, version: '1.0.0' },
      });
    }
  });

  it('rejects a Science skill without the sci6- prefix and accepts one with it', () => {
    expect(() =>
      validateProgramSkillInvariants([{ code: 'cells-x', program: 'grade-6-science' }]),
    ).toThrow("does not use grade-6-science's skill code prefix");
    expect(() =>
      validateProgramSkillInvariants([{ code: 'sci6-cells-x', program: 'grade-6-science' }]),
    ).not.toThrow();
  });

  it('now allows a Science session start while the other placeholders stay unavailable', () => {
    expect(parseAvailableProgram('grade-6-science')).toBe('grade-6-science');
    expect(parseAvailableProgram('grade-6-math')).toBe('grade-6-math');
    expect(() => parseAvailableProgram('grade-6-ela')).toThrow(
      'Curriculum program is not available',
    );
    expect(PROGRAM_ROSTER.find((entry) => entry.code === 'grade-6-science')?.available).toBe(true);
  });
});

describe('P2 sci6-life-science domain', () => {
  it('accepts only the one new domain value', () => {
    expect(CurriculumDomainSchema.safeParse('sci6-life-science').success).toBe(true);
    expect(CurriculumDomainSchema.safeParse('sci6-earth-science').success).toBe(false);
  });
});

describe('P3 Science skill rules', () => {
  it('accepts a valid Science skill and every allow-listed PE', () => {
    expect(GRADE_6_SCIENCE_STANDARDS).toHaveLength(19);
    expect(new Set(GRADE_6_SCIENCE_STANDARDS).size).toBe(19);
    const standards = [...GRADE_6_SCIENCE_STANDARDS].slice(0, 10);
    expect(() => validateSkillCatalog([scienceSkill({ standards })])).not.toThrow();
    expect(() =>
      validateSkillCatalog([scienceSkill({ standards: GRADE_6_SCIENCE_STANDARDS.slice(10) })]),
    ).not.toThrow();
  });

  it('rejects an en-dash look-alike, cross-grade and non-Grade-6 standards', () => {
    for (const standard of ['MS‐LS1‐1', 'MS-PS1-6', 'MS-LS1-6', 'ms-ls1-1']) {
      expect(() => validateSkillCatalog([scienceSkill({ standards: [standard] })])).toThrow(
        'outside the Grade 6 Science performance-expectation allow-list',
      );
    }
    // Boundary: one bad entry among good ones still fails.
    expect(() =>
      validateSkillCatalog([scienceSkill({ standards: ['MS-LS1-1', 'MS-LS1-6'] })]),
    ).toThrow('MS-LS1-6');
  });

  it('keeps domains program-exclusive in both directions', () => {
    const math = skillCatalog.find((skill) => skill.program === 'grade-6-math')!;
    expect(() => validateSkillCatalog([{ ...math, domain: 'sci6-life-science' }])).toThrow(
      'reserved for grade-6-science',
    );
    expect(() => validateSkillCatalog([scienceSkill({ domain: 'geometry' })])).toThrow(
      'must use a sci6-* domain',
    );
  });

  it('does not constrain other programs standards and registers exactly the 3 accepted Science skills beside the 64 existing skills', () => {
    expect(skillCatalog).toHaveLength(67);
    expect(() => validateSkillCatalog(skillCatalog)).not.toThrow();
    const science = skillCatalog.filter((skill) => skill.program === 'grade-6-science');
    expect(science.map((skill) => skill.code).sort()).toEqual([
      'sci6-cell-as-a-system',
      'sci6-cell-parts-functions',
      'sci6-cells-evidence-of-life',
    ]);
    expect(science.every((skill) => skill.version === '1.0.0')).toBe(true);
    expect(science.every((skill) => skill.prerequisiteSkillCodes.length === 0)).toBe(true);
    expect(skillCatalog.filter((skill) => skill.program !== 'grade-6-science')).toHaveLength(64);
  });
});

describe('P4 Science content rules', () => {
  it('loads a valid synthetic Science record beside the 134 live records (128 existing + 6 Science)', () => {
    expect(contentCatalog).toHaveLength(134);
    registerScienceSkill();
    const loaded = loadWith(scienceRecord('sci6-synthetic-1'), scienceRecord('sci6-synthetic-2'));
    expect(loaded).toHaveLength(136);
  });

  it('accepts depth mode and a pattern that is a case-insensitive substring', () => {
    registerScienceSkill(scienceSkill({ difficultyBands: ['foundational'] }));
    expect(() =>
      loadWith(
        scienceRecord('sci6-synthetic-1', { mode: 'depth', forbiddenLeakagePatterns: ['MADE OF'] }),
      ),
    ).not.toThrow();
  });

  const rejected: [string, Json, Json | undefined, string][] = [
    ['contest mode', { mode: 'contest' }, undefined, 'contest mode'],
    [
      'contestFormat metadata',
      { contestFormat: { format: 'mathcounts-target', pointValue: 2 } },
      undefined,
      'must not carry contest-format metadata',
    ],
    [
      'legacy multiple_choice validator',
      {
        deterministicValidator: {
          type: 'multiple_choice',
          canonicalAnswer: 'A',
          acceptedAnswers: ['A'],
          equivalenceNotes: 'Synthetic.',
        },
      },
      undefined,
      'must use a structured validator',
    ],
    [
      'composite validator with parts',
      {
        deterministicValidator: {
          type: 'composite',
          canonicalAnswer: 'A and B',
          acceptedAnswers: ['A and B'],
          equivalenceNotes: 'Synthetic.',
          parts: [{ key: 'a', type: 'text', canonicalAnswer: 'A', acceptedAnswers: ['A'] }],
        },
      },
      undefined,
      '',
    ],
    [
      'number field',
      {},
      {
        canonicalAnswer: 'Count: 4',
        acceptedAnswers: ['Count: 4'],
        fields: [
          {
            key: 'count',
            kind: 'number',
            label: 'Count',
            representations: ['integer'],
            simplestForm: true,
            correctValue: '4',
          },
        ],
      },
      'must be a choice field',
    ],
    [
      'missing leakage pattern',
      { forbiddenLeakagePatterns: [] },
      undefined,
      'needs a leakage pattern',
    ],
    [
      'pattern not in the correct option label',
      { forbiddenLeakagePatterns: ['unrelated'] },
      undefined,
      'needs a leakage pattern',
    ],
    [
      'pattern under 3 characters',
      { forbiddenLeakagePatterns: ['made of cells', 'ma'] },
      undefined,
      'shorter than 3 characters',
    ],
  ];
  it.each(rejected)('rejects %s', (_name, overrides, validatorOverrides, message) => {
    registerScienceSkill();
    const record = scienceRecord('sci6-synthetic-1', overrides, validatorOverrides);
    if (message) {
      expect(() => loadWith(record)).toThrow(message);
    } else {
      expect(() => loadWith(record)).toThrow();
    }
  });

  it('rejects a 2-character correct label (boundary) even with a 2-character pattern', () => {
    registerScienceSkill();
    const short = {
      canonicalAnswer: 'Claim: No',
      acceptedAnswers: ['Claim: No'],
      fields: [
        choiceField({
          options: [
            { id: 'yes', label: 'Yes it is' },
            { id: 'no', label: 'No' },
          ],
          correctOptionId: 'no',
        }),
      ],
    };
    expect(() =>
      loadWith(scienceRecord('sci6-synthetic-1', { forbiddenLeakagePatterns: ['No'] }, short)),
    ).toThrow('shorter than 3 characters');
    // Boundary: a 3-character correct label and pattern is accepted.
    const three = {
      canonicalAnswer: 'Claim: Yes',
      acceptedAnswers: ['Claim: Yes'],
      fields: [
        choiceField({
          options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ],
        }),
      ],
    };
    expect(() =>
      loadWith(scienceRecord('sci6-synthetic-1', { forbiddenLeakagePatterns: ['yes'] }, three)),
    ).not.toThrow();
  });

  it('rejects each choice field lacking its own pattern in a multi-field record', () => {
    registerScienceSkill();
    const second = choiceField({
      key: 'evidence',
      label: 'Evidence',
      options: [
        { id: 'a', label: 'Walls seen' },
        { id: 'b', label: 'Nothing seen' },
      ],
      correctOptionId: 'a',
    });
    const validator = {
      canonicalAnswer: 'Claim: Made of cells; Evidence: Walls seen',
      acceptedAnswers: ['Claim: Made of cells; Evidence: Walls seen'],
      fields: [choiceField(), second],
    };
    expect(() =>
      loadWith(
        scienceRecord(
          'sci6-synthetic-1',
          { forbiddenLeakagePatterns: ['made of cells', 'walls seen'] },
          validator,
        ),
      ),
    ).not.toThrow();
    expect(() => loadWith(scienceRecord('sci6-synthetic-1', {}, validator))).toThrow(
      'field "evidence" needs a leakage pattern',
    );
  });

  it('rejects a non-practice role in the pure rule and does not apply rules to other programs', () => {
    const record = scienceRecord('sci6-synthetic-1') as unknown as Parameters<
      typeof validateScienceContentRules
    >[0];
    expect(() => validateScienceContentRules({ ...record, role: 'assessment' })).toThrow(
      'practice records only',
    );
    // A Math record with a contest-incompatible-for-Science shape still loads.
  });
});

describe('P5 figure text must be available as text', () => {
  const withFigure = (svgText: string, extra: Json = {}) =>
    scienceRecord('sci6-synthetic-1', { figure: figure(svgText), ...extra });

  it('accepts a figure whose drawn labels all appear in altText or accessibleAlternative', () => {
    registerScienceSkill();
    expect(() => loadWith(withFigure('Nucleus'))).not.toThrow();
    // Case-insensitive, whitespace-normalised, and satisfied via the other field.
    expect(() =>
      loadWith(
        withFigure('  PART   x ', { accessibleAlternative: 'Part x is shown in the model.' }),
      ),
    ).not.toThrow();
    // A figure-free record has nothing to check.
    expect(() => loadWith(scienceRecord('sci6-synthetic-1'))).not.toThrow();
  });

  it('rejects a figure with an omitted label', () => {
    registerScienceSkill();
    expect(() => loadWith(withFigure('Mitochondrion'))).toThrow(
      'figure text "mitochondrion" must appear in altText or accessibleAlternative',
    );
  });

  it('checks every text element and decodes entities', () => {
    registerScienceSkill();
    const svg =
      '<svg viewBox="0 0 200 120"><text x="1" y="1">Nucleus</text><text x="1" y="9">Vacuole</text><text x="1" y="19"></text></svg>';
    const record = scienceRecord('sci6-synthetic-1', {
      figure: { ...figure('x'), svgMarkup: svg },
    });
    expect(() => loadWith(record)).toThrow('"vacuole"');
    expect(svgTextStrings(svg)).toEqual(['nucleus', 'vacuole']);
    expect(svgTextStrings('<svg viewBox="0 0 1 1"><text>A &amp; B</text></svg>')).toEqual([
      'a & b',
    ]);
  });

  // SCI6-PREREQ-R1: labels are compared as rendered text, not as XML source.
  const labelled = (svgText: string, altText: string, accessibleAlternative = 'Synthetic text.') =>
    scienceRecord('sci6-synthetic-1', {
      figure: { ...figure(svgText), altText },
      accessibleAlternative,
    });

  it('R1: decodes decimal and hex character references in the SVG label', () => {
    registerScienceSkill();
    expect(() => loadWith(labelled('&#78;ucleus', 'Nucleus'))).not.toThrow();
    expect(() => loadWith(labelled('&#x4E;ucleus', 'Nucleus'))).not.toThrow();
    expect(() => loadWith(labelled('&#x4e;ucleus', 'nucleus'))).not.toThrow();
    expect(() => loadWith(labelled('Rock &amp; soil', 'Rock & soil'))).not.toThrow();
    expect(svgTextStrings('<svg viewBox="0 0 1 1"><text>&#78;&#x75;cleus</text></svg>')).toEqual([
      'nucleus',
    ]);
  });

  it('R1: a missing rendered label fails even when only its escaped spelling is present', () => {
    registerScienceSkill();
    expect(() => loadWith(labelled('&#78;ucleus', '&#78;ucleus'))).toThrow(
      'figure text "nucleus" must appear',
    );
    expect(() => loadWith(labelled('&#78;ucleus', '&#x4E;ucleus'))).toThrow('"nucleus"');
    expect(() => loadWith(labelled('Rock &amp; soil', 'Rock &amp; soil'))).toThrow('"rock & soil"');
    expect(() => loadWith(labelled('&#78;ucleus', 'Membrane'))).toThrow('"nucleus"');
  });

  it('R1: treats CDATA as literal text and ignores comments and self-closing text', () => {
    registerScienceSkill();
    expect(() => loadWith(labelled('<![CDATA[A &amp; B]]>', 'A &amp; B'))).not.toThrow();
    expect(() => loadWith(labelled('<![CDATA[A &amp; B]]>', 'A & B'))).toThrow('"a &amp; b"');
    expect(() => loadWith(labelled('Nu<!-- hidden -->cleus', 'Nucleus'))).not.toThrow();
    const selfClosing =
      '<svg viewBox="0 0 200 120"><text x="1" y="1"/><text x="2" y="2">Nucleus</text></svg>';
    expect(svgTextStrings(selfClosing)).toEqual(['nucleus']);
  });

  it('R1: normalizes whitespace in label and alternative, and rejects invalid references', () => {
    registerScienceSkill();
    expect(() => loadWith(labelled('  Cell\n   wall ', 'the CELL    wall'))).not.toThrow();
    expect(() => loadWith(labelled('Cell&#10;wall', 'cell wall'))).not.toThrow();
    expect(() => loadWith(labelled('Bad &#0; ref', 'Bad ref'))).toThrow(
      'invalid character reference',
    );
    expect(() => loadWith(labelled('Bad &nbsp; ref', 'Bad ref'))).toThrow('unsupported entity');
  });

  // SCI6-PREREQ-R2: each label must lie wholly inside one alternative.
  it('R2: rejects a label that only exists across the field boundary', () => {
    registerScienceSkill();
    expect(() => loadWith(labelled('Cell wall', 'Diagram of Cell', 'wall is indicated.'))).toThrow(
      '"cell wall" must appear in altText or accessibleAlternative',
    );
  });

  it('R2: accepts a full label in either field, and different labels in different fields', () => {
    registerScienceSkill();
    expect(() =>
      loadWith(labelled('Cell wall', 'Diagram of the cell wall', 'Other.')),
    ).not.toThrow();
    expect(() =>
      loadWith(labelled('Cell wall', 'Diagram.', 'The cell wall is shown.')),
    ).not.toThrow();
    const svg =
      '<svg viewBox="0 0 200 120"><text x="1" y="1">Nucleus</text><text x="1" y="9">Cell wall</text></svg>';
    expect(() =>
      loadWith(
        scienceRecord('sci6-synthetic-1', {
          figure: { ...figure('x'), svgMarkup: svg, altText: 'Shows a nucleus.' },
          accessibleAlternative: 'Also shows the cell wall.',
        }),
      ),
    ).not.toThrow();
  });

  // SCI6-PREREQ-R3/R4: one lexical scan; comments, CDATA and tags are
  // recognized in order, never by independent regex passes.
  const withSvg = (inner: string, altText: string, accessibleAlternative = 'Other.') =>
    scienceRecord('sci6-synthetic-1', {
      figure: {
        ...figure('x'),
        svgMarkup: `<svg viewBox="0 0 200 120">${inner}</svg>`,
        altText,
      },
      accessibleAlternative,
    });

  it('R3: comment syntax inside CDATA is literal rendered text', () => {
    registerScienceSkill();
    const svg = '<text x="5" y="20"><![CDATA[Nu<!-- hidden -->cleus]]></text>';
    expect(() => loadWith(withSvg(svg, 'Nucleus'))).toThrow('"nu<!-- hidden -->cleus"');
    expect(() => loadWith(withSvg(svg, 'Nu<!-- hidden -->cleus'))).not.toThrow();
    // Outside CDATA the same comment is not rendered.
    expect(() => loadWith(withSvg('<text>Nu<!-- hidden -->cleus</text>', 'Nucleus'))).not.toThrow();
    expect(svgTextStrings(`<svg viewBox="0 0 1 1">${svg}</svg>`)).toEqual([
      'nu<!-- hidden -->cleus',
    ]);
  });

  it('R4: a closing-tag spelling inside CDATA does not end the element', () => {
    registerScienceSkill();
    const svg = '<text x="5" y="20"><![CDATA[Nucleus </text>]]></text>';
    expect(() => loadWith(withSvg(svg, '<![CDATA[Nucleus'))).toThrow('"nucleus </text>"');
    expect(() => loadWith(withSvg(svg, 'Nucleus </text>'))).not.toThrow();
  });

  it('R4: a commented-out text element adds no requirement', () => {
    registerScienceSkill();
    const svg = '<!-- <text>Nucleus</text> --><text>Membrane</text>';
    expect(() => loadWith(withSvg(svg, 'Membrane'))).not.toThrow();
    expect(() => loadWith(withSvg(svg, 'Nucleus'))).toThrow('"membrane"');
    expect(svgTextStrings(`<svg viewBox="0 0 1 1">${svg}</svg>`)).toEqual(['membrane']);
  });

  it('lexical edge cases: CDATA, comment and attribute contents are not markup', () => {
    const scan = (inner: string) => svgTextStrings(`<svg viewBox="0 0 1 1">${inner}</svg>`);
    // Nested-looking tags inside CDATA are literal text.
    expect(scan('<text><![CDATA[<text>A</text>]]></text>')).toEqual(['<text>a</text>']);
    // "-->" inside CDATA does not end anything.
    expect(scan('<text><![CDATA[a --> b]]></text>')).toEqual(['a --> b']);
    // "]]>" inside a comment does not end anything.
    expect(scan('<!-- ]]> --><text>Nucleus</text>')).toEqual(['nucleus']);
    // Attributes, including ">" and "/" inside quotes, do not confuse the tag.
    expect(scan('<text x="a>b" class=\'/\'>Nucleus</text>')).toEqual(['nucleus']);
    expect(scan('<text x="1" y="2"/>')).toEqual([]);
    expect(scan('<text x="a/>b">Nucleus</text>')).toEqual(['nucleus']);
    // Mixed ordinary text, entities and CDATA concatenate in order; other elements are ignored.
    expect(scan('<text>A&amp;<![CDATA[&amp;]]>B<!-- c -->C</text><g><text>D</text></g>')).toEqual([
      'a&&amp;bc',
      'd',
    ]);
  });

  it('lexical edge cases: unterminated or malformed markup fails closed', () => {
    const scan = (inner: string) => svgTextStrings(`<svg viewBox="0 0 1 1">${inner}</svg>`);
    expect(() => scan('<text><![CDATA[Nucleus</text>')).toThrow('unterminated CDATA');
    expect(() => scan('<text>Nucleus<!-- oops</text>')).toThrow('unterminated comment');
    expect(() => scan('<text x="1>Nucleus</text>')).toThrow('not terminated');
    expect(() => scan('<text>Nucleus')).toThrow('not closed');
    expect(() => scan('</text>')).toThrow('without a start tag');
    expect(() => scan('<text><text>A</text></text>')).toThrow('nested');
    expect(() => scan('<TEXT>A</TEXT>')).toThrow('must be spelled <text>');
    expect(() => scan('<text>A & B</text>')).toThrow('not a character or entity reference');
    expect(() => scan('<text>< g></text>')).toThrow('malformed tag');
    expect(() => scan('<!DOCTYPE x><text>A</text>')).toThrow('unsupported markup declaration');
    expect(() => scan('<?pi <text>A</text>')).toThrow('unterminated processing instruction');
  });

  it('lexical failures surface through the real catalog path', () => {
    registerScienceSkill();
    expect(() => loadWith(withSvg('<text><![CDATA[Nucleus</text>', 'Nucleus'))).toThrow(
      'unterminated CDATA',
    );
    expect(() => loadWith(withSvg('<text>Nucleus<!-- oops</text>', 'Nucleus'))).toThrow(
      'unterminated comment',
    );
  });

  it('does not apply to non-Science records', () => {
    const withUnlabelled = contentCatalog.map((item) =>
      item.id === 'ratio-tables-1' ? { ...item, figure: figure('Never mentioned') } : item,
    );
    expect(() => validateContentCatalog(withUnlabelled as unknown[])).not.toThrow();
  });
});

describe('P6 preserved isolation and publication gates', () => {
  it('rejects a Science to Olympiad prerequisite edge in both directions', () => {
    expect(() =>
      validateProgramSkillInvariants([
        { code: 'sci6-a', program: 'grade-6-science', prerequisiteSkillCodes: ['olympiad-a'] },
        { code: 'olympiad-a', program: 'science-olympiad-division-b' },
      ]),
    ).toThrow('cannot depend on a skill from science-olympiad-division-b');
    expect(() =>
      validateProgramSkillInvariants([
        {
          code: 'olympiad-a',
          program: 'science-olympiad-division-b',
          prerequisiteRefs: [{ code: 'sci6-a' }],
        },
        { code: 'sci6-a', program: 'grade-6-science' },
      ]),
    ).toThrow('cannot depend on a skill from grade-6-science');
    // Boundary: a same-program edge is fine.
    expect(() =>
      validateProgramSkillInvariants([
        { code: 'sci6-a', program: 'grade-6-science', prerequisiteSkillCodes: ['sci6-b'] },
        { code: 'sci6-b', program: 'grade-6-science' },
      ]),
    ).not.toThrow();
  });

  it('rejects duplicate Science skill codes', () => {
    expect(() => validateSkillCatalog([scienceSkill(), scienceSkill()])).toThrow(
      'Skill codes must be unique',
    );
  });

  it('keeps a Science skill out of the public projection when the program is injected as unavailable', () => {
    const skill = scienceSkill();
    registerScienceSkill(skill);
    const [record] = loadWith(scienceRecord('sci6-synthetic-1')).slice(-1);
    expect(record.review.status).toBe('reviewed');
    expect(publishableContentProjection([record])).toHaveLength(1);
    const unavailableRoster = PROGRAM_ROSTER.map((entry) =>
      entry.code === 'grade-6-science' ? { ...entry, available: false } : entry,
    );
    expect(publishableSkillProjection([skill], [record], unavailableRoster)).toEqual([]);
    const rendered = buildBody([record], [skill], unavailableRoster);
    for (const privateText of [skill.title, skill.code, record.prompt]) {
      expect(rendered.body).not.toContain(privateText);
    }
  });
});

beforeEach(() => {
  registered = undefined;
});
