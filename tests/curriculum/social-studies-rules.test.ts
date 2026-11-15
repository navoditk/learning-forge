import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import {
  validateTransitionContentCatalog,
  contentCatalog,
  servableContentCatalog,
  contentSkillCode,
} from '../../src/content/catalog';
import { matchesAcceptedAnswer } from '../../src/content/answer-matching';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import { CurriculumDomainSchema, SkillSchema, type Skill } from '../../src/contracts/curriculum';
import { PROGRAM_CODES } from '../../src/contracts/program-codes';
import { skillCatalog, skillsByCode, validateSkillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import {
  PROGRAM_REGISTRY,
  programsByCode,
  validateProgramSkillInvariants,
} from '../../src/curriculum/program-registry';
import {
  GRADE_6_HSS_CONTENT_STANDARDS,
  GRADES_6_8_HSS_ANALYSIS_STANDARDS,
} from '../../src/curriculum/social-studies-rules';
import { validateSocialStudiesContentRules } from '../../src/curriculum/social-studies-rules';
import { pythonPracticeItem } from '../phase1/python-paths-support';
import { parseAvailableProgram } from '../../src/phase1/program';
import { buildChapters } from '../../src/app/learner-chapters';

const PROGRAM = 'grade-6-social-studies';
const SS_DOMAINS = [
  'hss6-early-humankind',
  'hss6-mesopotamia-egypt-kush',
  'hss6-ancient-israelites',
  'hss6-ancient-greece',
  'hss6-ancient-india',
  'hss6-ancient-china',
  'hss6-ancient-rome',
];

// Synthetic, test-only skill and records. Nothing here is curriculum content.
// The live catalog's only hss6- skill and records are the SS-CONTENT ones
// (tests/content/social-studies-first-records.test.ts); none is added here.
const ssSkill = (overrides: Record<string, unknown> = {}): Skill =>
  SkillSchema.parse({
    code: 'hss6-synthetic-skill',
    version: '1.0.0',
    title: 'Synthetic social studies skill',
    program: PROGRAM,
    domain: 'hss6-ancient-greece',
    standards: ['CA-HSS.6.4.3', 'CA-HSS-AS.6-8.CST.1'],
    prerequisiteSkillCodes: [],
    observableEvidence: ['Synthetic evidence statement.'],
    misconceptionCodes: ['synthetic-misconception'],
    difficultyBands: ['foundational'],
    masteryCheckRule: 'Synthetic rule.',
    ...overrides,
  });

const figure = {
  svgMarkup:
    '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><text x="5" y="20">Synthetic</text></svg>',
  altText: 'A synthetic labelled diagram.',
  caption: 'Synthetic figure.',
  width: 200,
  height: 120,
};

function record(overrides: Record<string, unknown> = {}, validator: Record<string, unknown> = {}) {
  return {
    id: 'synthetic-ss-record',
    version: 'content-1',
    title: 'Synthetic social studies record',
    role: 'practice',
    skillRef: { code: 'hss6-synthetic-skill', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['CA-HSS.6.4.3'],
    itemReadinessRefs: [],
    observableEvidence: ['Synthetic evidence statement.'],
    prompt: 'Synthetic prompt for validation only. A) Option one B) Option two',
    solutionRepresentation: 'Synthetic solution representation.',
    solutionMethod: 'Synthetic method.',
    deterministicValidator: {
      type: 'multiple_choice',
      canonicalAnswer: 'Option one',
      acceptedAnswers: ['Option one', 'A'],
      equivalenceNotes: 'Synthetic note.',
      ...validator,
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
    forbiddenLeakagePatterns: ['option one'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'pending_review',
      reviewer: 'Synthetic reviewer',
      originalityStatement: 'Synthetic fixture.',
    },
    accessibilityNotes: 'Synthetic note.',
    accessibleAlternative: 'Synthetic text version.',
    ...overrides,
  };
}

const load = (items: unknown[], skills: readonly Skill[] = [ssSkill()]) =>
  validateTransitionContentCatalog(items, skills);

describe('R1 grade-6-social-studies registry entry', () => {
  it('is graded-academic with the hss6- prefix, still unavailable, with no units', () => {
    expect(programsByCode.get(PROGRAM)).toEqual({
      code: PROGRAM,
      version: '1.0.0',
      label: 'Grade 6 Social Studies',
      available: false,
      subjectKind: 'graded-academic',
      skillCodePrefix: 'hss6-',
      progressionMode: 'skill-graph-only',
      unitRefs: [],
      accessPolicyRef: { code: 'grade-6-social-studies-access', version: '1.0.0' },
      legacyCompatibilityPolicyRef: null,
      defaultPolicyProfileRef: { code: 'grade-6-social-studies-default', version: '1.0.0' },
    });
    expect(PROGRAM_ROSTER.find((entry) => entry.code === PROGRAM)?.available).toBe(false);
  });

  it('keeps the registry and the program-code vocabulary in one source', () => {
    expect(new Set(PROGRAM_REGISTRY.map(({ code }) => code))).toEqual(new Set(PROGRAM_CODES));
  });

  it('uses a prefix that collides with no other program prefix and no existing skill code', () => {
    const others = PROGRAM_REGISTRY.filter((program) => program.code !== PROGRAM)
      .map((program) => program.skillCodePrefix)
      .filter((prefix): prefix is string => Boolean(prefix));
    expect(others).toEqual(expect.arrayContaining(['mk6-', 'moems6-', 'amc8-', 'mc6-', 'snsb6-']));
    expect(others).toEqual(expect.arrayContaining(['sci6-', 'py6-']));
    for (const prefix of others) {
      expect('hss6-'.startsWith(prefix)).toBe(false);
      expect(prefix.startsWith('hss6-')).toBe(false);
    }
    // Only Social Studies skills use the prefix (SS-CONTENT adds the first one).
    expect(
      skillCatalog
        .filter((skill) => skill.code.startsWith('hss6-'))
        .every((skill) => skill.program === PROGRAM),
    ).toBe(true);
  });

  it('rejects a Social Studies skill without the hss6- prefix and accepts one with it', () => {
    expect(() =>
      validateProgramSkillInvariants([{ code: 'democracy-x', program: PROGRAM }]),
    ).toThrow("does not use grade-6-social-studies's skill code prefix");
    expect(() =>
      validateProgramSkillInvariants([{ code: 'hss6-democracy-x', program: PROGRAM }]),
    ).not.toThrow();
  });

  it('stays unavailable to learners', () => {
    expect(() => parseAvailableProgram(PROGRAM)).toThrow();
  });

  it('holds only the SS-CONTENT skill and its two pending records in the live catalogs', () => {
    expect(skillCatalog.filter((skill) => skill.program === PROGRAM).map((s) => s.code)).toEqual([
      'hss6-athenian-and-representative-democracy',
    ]);
    expect(
      contentCatalog
        .filter((item) => contentSkillCode(item).startsWith('hss6-'))
        .map((item) => [item.id, item.review.status]),
    ).toEqual([
      ['hss6-athenian-and-representative-democracy-1', 'pending_review'],
      ['hss6-athenian-and-representative-democracy-2', 'pending_review'],
    ]);
  });
});

describe('R2 hss6- domains', () => {
  it('adds exactly the seven domains, in order, after the existing ones', () => {
    const options = CurriculumDomainSchema.options;
    expect(options.filter((domain) => domain.startsWith('hss6-'))).toEqual(SS_DOMAINS);
    expect(options.slice(-7)).toEqual(SS_DOMAINS);
  });

  it('gives every domain a non-fallback learner chapter label and a generator body with no undefined or raw hss6 label', () => {
    for (const domain of SS_DOMAINS) {
      const skill = ssSkill({ domain });
      // Registered in the live (mutable) catalog for this assertion only.
      skillCatalog.push(skill);
      skillsByCode.set(skill.code, skill);
      try {
        const [chapter] = buildChapters(
          {
            skills: [
              {
                skillCode: skill.code,
                title: skill.title,
                domain: skill.domain,
                status: 'NOT_STARTED' as const,
                summary: 'Not started yet.',
              },
            ],
            recentStrengths: [],
            nextActivity: null,
          },
          { items: [], totalMinutes: 0, blockedSkills: [], unavailableSkills: [] },
          undefined,
          undefined,
        );
        // A real label, not the humanized fallback of the raw code.
        expect(chapter.label).not.toMatch(/^Hss6/);
      } finally {
        skillCatalog.splice(skillCatalog.indexOf(skill), 1);
        skillsByCode.delete(skill.code);
      }
      // The generator's Record<CurriculumDomain, string> is a typecheck error if a
      // label is missing; the rendered body proves the label for an available program.
      const { body } = buildBody([{ ...record(), review: reviewed() }] as never, [skill], [
        { code: PROGRAM, label: 'Synthetic', available: true },
      ] as never);
      expect(body).not.toContain('undefined');
      expect(body).not.toMatch(/Hss6/);
    }
  });

  it('pairs the program and the hss6- domains both ways', () => {
    expect(() => validateSkillCatalog([ssSkill({ domain: 'geometry' })])).toThrow(
      /must use a hss6-\* domain/,
    );
    expect(() =>
      validateSkillCatalog([
        ssSkill({ code: 'mk6-x', program: 'math-kangaroo-6', standards: ['x'] }),
      ]),
    ).toThrow(/reserved for grade-6-social-studies/);
    expect(() => validateSkillCatalog([ssSkill()])).not.toThrow();
  });
});

function reviewed() {
  return {
    status: 'reviewed',
    reviewer: 'Synthetic reviewer',
    reviewedAt: '2026-10-15',
    originalityStatement: 'Synthetic fixture.',
  };
}

describe('R3 standards allow-list (explicit codes)', () => {
  it('lists exactly 48 distinct content codes and 14 distinct analysis codes', () => {
    expect(GRADE_6_HSS_CONTENT_STANDARDS).toHaveLength(48);
    expect(new Set(GRADE_6_HSS_CONTENT_STANDARDS).size).toBe(48);
    expect(GRADES_6_8_HSS_ANALYSIS_STANDARDS).toHaveLength(14);
    expect(new Set(GRADES_6_8_HSS_ANALYSIS_STANDARDS).size).toBe(14);
  });

  it('has the official per-domain counts', () => {
    const counts = [1, 2, 3, 4, 5, 6, 7].map(
      (domain) =>
        GRADE_6_HSS_CONTENT_STANDARDS.filter((code) => code.startsWith(`CA-HSS.6.${domain}.`))
          .length,
    );
    expect(counts).toEqual([3, 9, 5, 8, 7, 8, 8]);
  });

  it('accepts every listed code on a skill', () => {
    for (const code of [...GRADE_6_HSS_CONTENT_STANDARDS, ...GRADES_6_8_HSS_ANALYSIS_STANDARDS]) {
      expect(() => validateSkillCatalog([ssSkill({ standards: [code] })])).not.toThrow();
    }
  });

  it.each([
    'CA-HSS.6.1.4',
    'CA-HSS.6.2.10',
    'CA-HSS.6.4.0',
    'CA-HSS.6.8.1',
    'CA-HSS.7.1.1',
    'CA-HSS-AS.6-8.CST.4',
    'CA-HSS-AS.6-8.REP.6',
    'CA-HSS-AS.6-8.HI.7',
    'CA-HSS-AS.6-8.XYZ.1',
    'ca-hss.6.4.3',
    'CA‑HSS.6.4.3', // look-alike hyphen
    '6.4.3',
    '6.RP.A.1',
    'MS-LS1-1',
  ])('rejects the unknown or malformed code %s on a skill and on a record', (code) => {
    expect(() => validateSkillCatalog([ssSkill({ standards: ['CA-HSS.6.4.3', code] })])).toThrow(
      /outside the Grade 6 History-Social Science allow-list/,
    );
    expect(() => load([record({ standards: [code] })])).toThrow(
      /outside the Grade 6 History-Social Science allow-list/,
    );
  });

  it('accepts a valid practice record and an analysis code on a record', () => {
    expect(() => load([record()])).not.toThrow();
    expect(() =>
      load([record({ standards: ['CA-HSS.6.4.3', 'CA-HSS-AS.6-8.CST.1'] })]),
    ).not.toThrow();
    expect(load([record()])).toHaveLength(1);
  });

  it("leaves another program's skill standards unconstrained", () => {
    const other = SkillSchema.parse({
      ...ssSkill(),
      code: 'ratio-language',
      program: 'grade-6-math',
      domain: 'ratios-and-proportional-reasoning',
      standards: ['6.RP.A.1'],
    });
    expect(() => validateSkillCatalog([other])).not.toThrow();
  });
});

describe('R3 record rules (syntactic rejections)', () => {
  it('rejects validator types other than multiple_choice, text and numeric', () => {
    for (const type of ['ratio', 'percent', 'composite']) {
      expect(() => load([record({}, { type })])).toThrow(
        /must use a multiple_choice, text or numeric/,
      );
    }
    for (const type of ['multiple_choice', 'text', 'numeric']) {
      expect(() => load([record({}, { type })])).not.toThrow();
    }
  });

  it('rejects validator parts and composite', () => {
    expect(() =>
      load([record({}, { type: 'composite', parts: [{ accepted: ['persia'] }] })]),
    ).toThrow(/must not use validator parts/);
  });

  it('rejects a structured validator', () => {
    expect(() =>
      load([
        record({
          deterministicValidator: {
            type: 'structured',
            responseMode: { id: 'structured-fields', version: '1' },
            canonicalAnswer: 'Claim: Yes',
            acceptedAnswers: ['Claim: Yes'],
            equivalenceNotes: 'Synthetic note.',
            fields: [
              {
                key: 'claim',
                kind: 'choice',
                label: 'Claim',
                options: [
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                ],
                correctOptionId: 'yes',
              },
            ],
          },
        }),
      ]),
    ).toThrow(/must use a multiple_choice, text or numeric/);
  });

  it('rejects a schema-valid python_output record (the earlier Python rule fires first on its codeListing) and the shared rule rejects the validator type directly', () => {
    const python = {
      ...pythonPracticeItem('synthetic-ss-python'),
      skillRef: { code: 'hss6-synthetic-skill', version: '1.0.0' },
      standards: ['CA-HSS.6.4.3'],
    };
    expect(() => load([python])).toThrow(/has a codeListing but its program has no language pin/);
    expect(() =>
      validateSocialStudiesContentRules({
        id: 'x',
        mode: 'core',
        standards: ['CA-HSS.6.4.3'],
        deterministicValidator: { type: 'python_output' },
      }),
    ).toThrow(/must use a multiple_choice, text or numeric/);
  });

  it('rejects contest mode', () => {
    expect(() => load([record({ mode: 'contest' })])).toThrow(/must use core or depth mode/);
    expect(() => load([record({ mode: 'depth' })])).not.toThrow();
  });

  it('rejects a figure', () => {
    expect(() => load([record({ figure })])).toThrow(/must not carry a figure/);
  });

  it('rejects contestFormat', () => {
    expect(() =>
      load([
        record({
          deterministicValidator: {
            type: 'text',
            canonicalAnswer: 'Option one',
            acceptedAnswers: ['Option one'],
            equivalenceNotes: 'Synthetic note.',
          },
          contestFormat: {
            format: 'mathcounts-sprint',
            pointValue: 1,
          },
        }),
      ]),
    ).toThrow(/must not carry contestFormat/);
  });

  describe('shared rules run for every role before role handling', () => {
    const base = {
      version: 'content-1',
      difficulty: 'foundational',
      standards: ['CA-HSS.6.4.3'],
      skillRef: { code: 'hss6-synthetic-skill', version: '1.0.0' },
      mode: 'core',
      observableEvidence: ['Synthetic evidence statement.'],
      provenance: { origin: 'original', licenseStatus: 'owned' },
      review: {
        status: 'pending_review',
        reviewer: 'Synthetic reviewer',
        originalityStatement: 'Synthetic fixture.',
      },
      accessibilityNotes: 'Synthetic note.',
      accessibleAlternative: 'Synthetic text version.',
      itemReadinessRefs: [],
    };
    const teaching = {
      ...base,
      id: 'synthetic-ss-teaching',
      title: 'Synthetic teaching',
      role: 'teaching',
      explanation: 'Synthetic explanation.',
    };
    const bank = { assessmentBankRef: { code: 'synthetic-bank', version: '1.0.0' } };
    const answered = {
      prompt: 'Synthetic prompt for validation only.',
      solutionRepresentation: 'Synthetic solution representation.',
      solutionMethod: 'Synthetic method.',
      deterministicValidator: {
        type: 'multiple_choice',
        canonicalAnswer: 'Option one',
        acceptedAnswers: ['Option one'],
        equivalenceNotes: 'Synthetic note.',
      },
      misconceptionCodes: ['synthetic-misconception'],
      forbiddenLeakagePatterns: ['option one'],
    };
    const assessment = {
      ...base,
      ...bank,
      ...answered,
      id: 'synthetic-ss-assessment',
      title: 'Synthetic assessment',
      role: 'assessment',
    };
    const review = {
      ...base,
      ...bank,
      ...answered,
      id: 'synthetic-ss-review',
      title: 'Synthetic review',
      role: 'review',
    };

    it('teaching: valid control loads; RH. tag, contest mode and a figure are rejected', () => {
      expect(() => load([teaching])).not.toThrow();
      expect(() => load([{ ...teaching, standards: ['RH.6-8.4'] }])).toThrow(/literacy tag/);
      expect(() => load([{ ...teaching, mode: 'contest' }])).toThrow(/must use core or depth mode/);
      expect(() => load([{ ...teaching, figure }])).toThrow(/must not carry a figure/);
    });

    it.each([
      ['assessment', assessment],
      ['review', review],
    ])('%s: valid control loads; shared standards, mode and figure rules reject', (_role, rec) => {
      expect(() => load([rec])).not.toThrow();
      expect(() => load([{ ...rec, standards: ['WHST.6-8.1'] }])).toThrow(/literacy tag/);
      expect(() => load([{ ...rec, standards: ['CA-HSS.6.1.4'] }])).toThrow(
        /outside the Grade 6 History-Social Science allow-list/,
      );
      expect(() => load([{ ...rec, mode: 'contest' }])).toThrow(/must use core or depth mode/);
      expect(() => load([{ ...rec, figure }])).toThrow(/must not carry a figure/);
    });
  });

  it('does not constrain other programs', () => {
    const math = SkillSchema.parse({
      ...ssSkill(),
      code: 'ratio-language',
      program: 'grade-6-math',
      domain: 'ratios-and-proportional-reasoning',
      standards: ['6.RP.A.1'],
    });
    expect(() =>
      load(
        [
          record({
            skillRef: { code: 'ratio-language', version: '1.0.0' },
            standards: ['6.RP.A.1'],
            mode: 'contest',
            figure,
          }),
        ],
        [math],
      ),
    ).not.toThrow();
  });
});

describe('R4 literacy tags', () => {
  it.each(['RH.6-8.4', 'RH.6-8.1', 'WHST.6-8.1', 'WHST.6-8.2.a'])(
    'rejects %s in skill and record standards',
    (tag) => {
      expect(() => validateSkillCatalog([ssSkill({ standards: ['CA-HSS.6.4.3', tag] })])).toThrow(
        /literacy tag/,
      );
      expect(() => load([record({ standards: ['CA-HSS.6.4.3', tag] })])).toThrow(/literacy tag/);
    },
  );
});

describe('R5 matcher regression: probe results pinned', () => {
  const parts = (...groups: string[][]) => ({
    acceptedAnswers: [],
    parts: groups.map((accepted) => ({ accepted })),
  });

  it('normalizes a label response', () => {
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['B'] }, 'b.')).toBe(true);
  });

  it('whole-string matching resists negation', () => {
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['B'] }, 'not B')).toBe(false);
  });

  it('FALSE POSITIVE: negation passes a part', () => {
    expect(matchesAcceptedAnswer(parts(['persia']), 'it was not Persia')).toBe(true);
  });

  it('FALSE POSITIVE: listing every option passes', () => {
    expect(matchesAcceptedAnswer(parts(['athens'], ['sparta']), 'athens sparta rome egypt')).toBe(
      true,
    );
  });

  it('FALSE POSITIVE: a short place name matches inside a word', () => {
    expect(matchesAcceptedAnswer(parts(['ur']), 'culture')).toBe(true);
  });

  it('FALSE POSITIVE: a wrong era passes', () => {
    expect(matchesAcceptedAnswer(parts(['ce']), '500 BCE')).toBe(true);
  });

  it('FALSE NEGATIVE: era spelling variants are not equated', () => {
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['500 BCE'] }, '500 B.C.E.')).toBe(false);
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['500 BCE'] }, '500 BC')).toBe(false);
  });

  it('FALSE NEGATIVE: unordered selections are order-sensitive', () => {
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['A, C'] }, 'C, A')).toBe(false);
  });

  it('is why the program rejects parts: the same false positive cannot be authored', () => {
    expect(() => load([record({}, { type: 'composite', parts: [{ accepted: ['ce'] }] })])).toThrow(
      /must not use validator parts/,
    );
  });
});

describe('R5a public gate for an unavailable or unreviewed Social Studies program', () => {
  const skillA = ssSkill({ code: 'hss6-skill-a' });
  const skillB = ssSkill({
    code: 'hss6-skill-b',
    prerequisiteSkillCodes: ['hss6-skill-a'],
    standards: ['CA-HSS.6.4.4'],
  });
  const rec = (code: string, status: 'reviewed' | 'pending_review', version = '1.0.0') =>
    ({
      ...record({ id: `rec-${code}-${status}-${version}` }),
      skillRef: { code, version },
      review: status === 'reviewed' ? reviewed() : record().review,
    }) as never;
  const unavailable = [{ code: PROGRAM, label: 'Social Studies', available: false }] as never;
  const available = [{ code: PROGRAM, label: 'Social Studies', available: true }] as never;
  const stats = (html: string) =>
    [...html.matchAll(/<span class="stat-value">([^<]*)<\/span>/g)].map((match) => match[1]);

  it('(a) an unavailable program publishes no skill, navigation, prerequisite name or count', () => {
    const items = [rec('hss6-skill-a', 'reviewed'), rec('hss6-skill-b', 'reviewed')];
    expect(publishableSkillProjection([skillA, skillB], items, unavailable)).toEqual([]);
    const { body, stats: statsHtml } = buildBody(items, [skillA, skillB], unavailable);
    for (const text of [body, statsHtml]) {
      expect(text).not.toContain('hss6-skill-a');
      expect(text).not.toContain('hss6-skill-b');
      expect(text).not.toContain('CA-HSS.6.4.3');
      expect(text).not.toContain('Synthetic social studies skill');
    }
    expect(stats(statsHtml)).toEqual(['0', '0', '0', '0/0']);
    expect(body).toContain('Coming soon');
  });

  it('(b) a skill whose records are all pending_review is excluded and not counted or named', () => {
    const items = [rec('hss6-skill-a', 'pending_review'), rec('hss6-skill-b', 'pending_review')];
    expect(publishableContentProjection(items)).toEqual([]);
    expect(publishableSkillProjection([skillA, skillB], items, available)).toEqual([]);
    const { body, stats: statsHtml } = buildBody(items, [skillA, skillB], available);
    expect(body).not.toContain('hss6-skill-a');
    expect(body).not.toContain('hss6-skill-b');
    expect(body).not.toContain('Synthetic prompt');
    expect(stats(statsHtml)).toEqual(['0', '0', '0', '0/0']);
  });

  it('(c) a reviewed record pinned to an obsolete skill version is excluded', () => {
    const items = [rec('hss6-skill-a', 'reviewed', '0.9.0')];
    expect(publishableSkillProjection([skillA], items, available)).toEqual([]);
    const { body, stats: statsHtml } = buildBody(items, [skillA], available);
    expect(body).not.toContain('hss6-skill-a');
    expect(body).not.toContain('Synthetic prompt');
    expect(stats(statsHtml)).toEqual(['0', '0', '0', '0/0']);
  });

  it('a hidden prerequisite is neither counted nor named by a published dependent', () => {
    // Only B is reviewed on its exact version; its prerequisite A is hidden.
    const items = [rec('hss6-skill-b', 'reviewed'), rec('hss6-skill-a', 'pending_review')];
    const { body, stats: statsHtml } = buildBody(items, [skillA, skillB], available);
    expect(body).toContain('hss6-skill-b');
    expect(body).toContain('Prerequisite pending publication');
    expect(body).not.toContain('hss6-skill-a');
    expect(body).not.toContain('CA-HSS.6.4.3');
    expect(stats(statsHtml)).toEqual(['1', '1', '1', '1/1']);
  });

  it('positive control: an available program with a reviewed record on the exact version appears', () => {
    const items = [rec('hss6-skill-a', 'reviewed')];
    expect(publishableSkillProjection([skillA], items, available).map((s) => s.code)).toEqual([
      'hss6-skill-a',
    ]);
    const { body } = buildBody(items, [skillA], available);
    expect(body).toContain('hss6-skill-a');
  });

  it('the live site output contains no Social Studies skill, record or count', () => {
    const { body } = buildBody();
    expect(body).not.toContain('hss6-');
    expect(body).not.toContain('CA-HSS');
  });

  it('the live catalogs and live projection contain no hss6- record', () => {
    expect(
      publishableContentProjection(contentCatalog).filter((item) =>
        contentSkillCode(item).startsWith('hss6-'),
      ),
    ).toEqual([]);
    expect(
      servableContentCatalog.filter((item) => contentSkillCode(item).startsWith('hss6-')),
    ).toEqual([]);
  });
});

describe('R5a production servability predicate with synthetic Social Studies records', () => {
  afterEach(() => {
    vi.doUnmock('../../content/grade-6-science/sci6-cells-evidence-of-life-2.json');
    vi.doUnmock('../../content/grade-6-science/sci6-cell-parts-functions-2.json');
    vi.doUnmock('../../src/curriculum/catalog');
    vi.resetModules();
  });

  it('servableContentCatalog excludes a pending Social Studies record and includes a reviewed one', async () => {
    // Two existing Science JSON imports (each skill keeps its other record) are
    // replaced in memory by synthetic Social Studies records, and the synthetic
    // skill is registered, so the real catalog module loads and runs its real
    // servability filter. Nothing is written to disk or added to live content.
    const skill = ssSkill();
    const pending = {
      ...record({ id: 'synthetic-ss-pending' }),
      review: record().review,
    };
    const done = { ...record({ id: 'synthetic-ss-reviewed' }), review: reviewed() };
    vi.resetModules();
    vi.doMock('../../content/grade-6-science/sci6-cells-evidence-of-life-2.json', () => ({
      default: pending,
    }));
    vi.doMock('../../content/grade-6-science/sci6-cell-parts-functions-2.json', () => ({
      default: done,
    }));
    vi.doMock('../../src/curriculum/catalog', async (importOriginal) => {
      const original = await importOriginal<typeof import('../../src/curriculum/catalog')>();
      original.skillCatalog.push(skill);
      original.skillsByCode.set(skill.code, skill);
      return original;
    });
    const catalog = await import('../../src/content/catalog');
    const ssIds = (items: readonly { id: string }[]) =>
      items.filter((item) => item.id.startsWith('synthetic-ss-')).map((item) => item.id);
    expect(ssIds(catalog.contentCatalog).sort()).toEqual([
      'synthetic-ss-pending',
      'synthetic-ss-reviewed',
    ]);
    expect(ssIds(catalog.servableContentCatalog)).toEqual(['synthetic-ss-reviewed']);
  });
});
