import { describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { matchesAcceptedAnswer } from '../../src/content/answer-matching';
import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import { skillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import { programsByCode } from '../../src/curriculum/program-registry';
import {
  GRADE_6_HSS_CONTENT_STANDARDS,
  GRADES_6_8_HSS_ANALYSIS_STANDARDS,
} from '../../src/curriculum/social-studies-rules';
import { parseAvailableProgram } from '../../src/phase1/program';

// SS-CONTENT-2 (D-330): two further Social Studies skills with two pending
// practice records each, loaded through the real catalogs and the accepted
// Social Studies rules. Closed option sets, the single correct option and the
// distractor-to-misconception mapping are review obligations; these checks pin
// what the author recorded so a later edit must confront them.
const PROGRAM = 'grade-6-social-studies';
const RIVERS = 'hss6-river-valleys-and-food-surplus';
const ROME = 'hss6-roman-republic-government';

type ExpectedSkill = {
  code: string;
  domain: string;
  content: string[];
  analysis: string[];
};

const SKILLS: ExpectedSkill[] = [
  {
    code: RIVERS,
    domain: 'hss6-mesopotamia-egypt-kush',
    content: ['CA-HSS.6.2.1', 'CA-HSS.6.2.2'],
    analysis: ['CA-HSS-AS.6-8.HI.2'],
  },
  {
    code: ROME,
    domain: 'hss6-ancient-rome',
    content: ['CA-HSS.6.7.2'],
    analysis: ['CA-HSS-AS.6-8.REP.2'],
  },
];

type Expected = {
  id: string;
  skill: string;
  difficulty: string;
  standards: string[];
  correctLabel: string;
  options: Record<string, string>;
  misconceptions: string[];
};

const EXPECTED: Expected[] = [
  {
    id: `${RIVERS}-1`,
    skill: RIVERS,
    difficulty: 'foundational',
    standards: ['CA-HSS.6.2.1'],
    correctLabel: 'B',
    options: {
      A: 'Farmers had to move to new land every year because the soil quickly wore out.',
      B: 'River floods left fertile silt on the land, and river water could reach the crops.',
      C: 'Thick forests covered the river valleys and gave farmers shelter and food.',
      D: 'The deserts away from the rivers had the richest farmland in the region.',
    },
    misconceptions: [
      'soil-exhaustion-forces-moving',
      'forests-seen-as-settlement-draw',
      'desert-seen-as-farmland',
    ],
  },
  {
    id: `${RIVERS}-2`,
    skill: RIVERS,
    difficulty: 'developing',
    standards: ['CA-HSS.6.2.2', 'CA-HSS-AS.6-8.HI.2'],
    correctLabel: 'B',
    options: {
      A: 'Cause: villages grew into cities. Effect: farmers dug irrigation canals.',
      B: 'Cause: farmers dug irrigation canals. Effect: some people could do work other than farming.',
      C: 'Cause: some people worked as traders and scribes. Effect: farmers grew more food than they needed.',
      D: 'Cause: farmers dug irrigation canals. Effect: everyone had to spend all of their time farming.',
    },
    misconceptions: [
      'cause-effect-reversed',
      'later-effect-seen-as-cause',
      'surplus-seen-as-more-farm-work',
    ],
  },
  {
    id: `${ROME}-1`,
    skill: ROME,
    difficulty: 'foundational',
    standards: ['CA-HSS.6.7.2'],
    correctLabel: 'B',
    options: {
      A: "The consuls commanded Rome's armies in war.",
      B: 'Each consul could block a decision made by the other consul.',
      C: 'Many members of the Senate had served as officials before.',
      D: 'One consul ruled alone for life, like a king.',
    },
    misconceptions: [
      'power-seen-as-check',
      'membership-seen-as-check',
      'republic-seen-as-monarchy',
    ],
  },
  {
    id: `${ROME}-2`,
    skill: ROME,
    difficulty: 'developing',
    standards: ['CA-HSS.6.7.2', 'CA-HSS-AS.6-8.REP.2'],
    correctLabel: 'C',
    options: {
      A: 'Normally, two consuls were elected to serve one-year terms to lead the government.',
      B: 'Tribunes could block actions of other officials, even the consuls.',
      C: 'The tribunes had the most important job in the whole Roman government.',
      D: 'Many Roman citizens served as soldiers in the army.',
    },
    misconceptions: [
      'surprising-fact-seen-as-opinion',
      'power-statement-seen-as-opinion',
      'duty-statement-seen-as-opinion',
    ],
  },
];

const skillOf = (code: string) => skillCatalog.find((candidate) => candidate.code === code)!;
const recordOf = (id: string) => contentCatalog.find((candidate) => candidate.id === id)!;
const learnerText = (id: string) => {
  const record = recordOf(id);
  return [
    record.title,
    record.prompt,
    record.solutionRepresentation,
    record.solutionMethod,
    record.accessibleAlternative,
    ...record.hintSteps.flatMap((step) => [step.prompt, step.question]),
  ].join('\n');
};

describe('SS-CONTENT-2 skills', () => {
  for (const expected of SKILLS) {
    describe(expected.code, () => {
      const skill = skillOf(expected.code);

      it('loads in the Social Studies program with its domain and no prerequisites', () => {
        expect(skill).toMatchObject({
          code: expected.code,
          version: '1.0.0',
          program: PROGRAM,
          domain: expected.domain,
          prerequisiteSkillCodes: [],
          difficultyBands: ['foundational', 'developing'],
        });
        expect(
          skillCatalog.some((candidate) =>
            candidate.prerequisiteSkillCodes.includes(expected.code),
          ),
        ).toBe(false);
      });

      it('maps exactly its content codes plus one allow-listed analysis code, and no literacy tag', () => {
        expect(skill.standards).toEqual([...expected.content, ...expected.analysis]);
        expect(skill.standards.filter((c) => GRADE_6_HSS_CONTENT_STANDARDS.includes(c))).toEqual(
          expected.content,
        );
        expect(
          skill.standards.filter((c) => GRADES_6_8_HSS_ANALYSIS_STANDARDS.includes(c)),
        ).toEqual(expected.analysis);
        expect(skill.standards.some((code) => /^(RH|WHST)\./.test(code))).toBe(false);
      });

      it('every claimed code is exercised by at least one of its records', () => {
        const records = EXPECTED.filter((record) => record.skill === expected.code);
        const exercised = new Set(records.flatMap((record) => record.standards));
        expect([...exercised].sort()).toEqual([...skill.standards].sort());
      });

      it('uses deterministic verbs and claims only partial practice evidence', () => {
        for (const statement of skill.observableEvidence) {
          expect(statement).toMatch(/^Selects[ ,]/);
          expect(statement).not.toMatch(/\b(explains|argues|evaluates)\b/i);
        }
        expect(skill.masteryCheckRule).toMatch(/^Practice evidence only/);
        expect(skill.masteryCheckRule).toMatch(/evidence is partial/);
        expect(skill.masteryCheckRule).toMatch(/Does not establish mastery/);
      });

      it('declares exactly the misconception codes its two records use', () => {
        expect([...skill.misconceptionCodes].sort()).toEqual(
          EXPECTED.filter((record) => record.skill === expected.code)
            .flatMap((record) => record.misconceptions)
            .sort(),
        );
      });

      it('has exactly its two records, in order', () => {
        expect(
          contentCatalog.filter((c) => c.skillRef.code === expected.code).map((c) => c.id),
        ).toEqual([`${expected.code}-1`, `${expected.code}-2`]);
      });
    });
  }
});

describe('SS-CONTENT-2 practice records', () => {
  for (const expected of EXPECTED) {
    describe(expected.id, () => {
      const record = recordOf(expected.id);
      const validator = record.deterministicValidator;
      const correct = expected.options[expected.correctLabel];

      it('is a core multiple_choice practice record pinned to its skill 1.0.0', () => {
        expect(record).toMatchObject({
          version: '1.0.0',
          role: 'practice',
          skillRef: { code: expected.skill, version: '1.0.0' },
          mode: 'core',
          difficulty: expected.difficulty,
          standards: expected.standards,
          itemReadinessRefs: [],
        });
        expect(validator.type).toBe('multiple_choice');
        expect('parts' in validator).toBe(false);
        expect(record.contestFormat).toBeUndefined();
        expect(record.figure).toBeUndefined();
      });

      it('is llm_drafted, owned and pending human review with no review date', () => {
        expect(record.provenance).toEqual({ origin: 'llm_drafted', licenseStatus: 'owned' });
        expect(record.review.status).toBe('pending_review');
        expect(record.review.reviewer).toBe('pending human review');
        expect(record.review.reviewedAt).toBeUndefined();
        expect(record.review.originalityStatement).toMatch(/copies no/);
        expect(record.review.originalityStatement).not.toMatch(/IMPACT|McGraw|adapted from/i);
      });

      it('labels four options A to D in the prompt, in order, with the authored full text', () => {
        let cursor = 0;
        for (const [label, text] of Object.entries(expected.options)) {
          const at = record.prompt.indexOf(`\n${label}. ${text}\n`);
          expect(at, label).toBeGreaterThan(cursor);
          cursor = at;
        }
        expect(Object.keys(expected.options)).toEqual(['A', 'B', 'C', 'D']);
      });

      it('accepts only the correct full option text (canonical) and its label', () => {
        expect(validator.canonicalAnswer).toBe(correct);
        expect(validator.acceptedAnswers).toEqual([expected.correctLabel, correct]);
        for (const response of [
          expected.correctLabel,
          expected.correctLabel.toLowerCase(),
          `${expected.correctLabel}.`,
          correct,
          correct.toUpperCase(),
          ` ${correct.replace(/\.$/, '')} `,
        ]) {
          expect(matchesAcceptedAnswer(validator, response), response).toBe(true);
        }
      });

      it('rejects the rule-4 false-positive probes', () => {
        const distractors = Object.entries(expected.options).filter(
          ([label]) => label !== expected.correctLabel,
        );
        const probes = [
          `not ${expected.correctLabel}`,
          `Not ${correct}`,
          'A, B, C, D',
          'A B C D',
          Object.values(expected.options).join(' '),
          `${expected.correctLabel} or ${distractors[0][0]}`,
          'silt',
          'irrigation',
          'surplus',
          'Egypt',
          'Mesopotamia',
          'consul',
          'tribunes',
          'opinion',
          'fact',
          'Greece',
          ...distractors.flatMap(([label, text]) => [label, text, `Option ${label}`]),
        ];
        for (const probe of probes) {
          expect(matchesAcceptedAnswer(validator, probe), probe).toBe(false);
        }
      });

      it('has a 3 step hint ladder that leaks neither the correct option text nor a bare label', () => {
        const steps = record.hintSteps;
        expect(steps.map((step) => step.order)).toEqual([1, 2, 3]);
        const hintText = steps.map((step) => `${step.prompt} ${step.question}`).join(' ');
        expect(record.forbiddenLeakagePatterns).toContain(correct.replace(/\.$/, ''));
        for (const pattern of record.forbiddenLeakagePatterns) {
          expect(pattern.length, pattern).toBeGreaterThan(3);
          expect(hintText.toLowerCase()).not.toContain(pattern.toLowerCase());
        }
        expect(hintText).not.toMatch(/\b(option|choice|answer)\s+[A-D]\b/i);
        expect(hintText).not.toMatch(/(^|\s)[A-D][.)]\s/);
      });

      it('lists exactly its distractor misconception codes, all declared by the skill', () => {
        expect(record.misconceptionCodes).toEqual(expected.misconceptions);
        for (const code of record.misconceptionCodes) {
          expect(skillOf(expected.skill).misconceptionCodes).toContain(code);
        }
      });

      it('keeps the subject guardrails: no ranking of systems, preference, dates, quotes or belief items', () => {
        const text = learnerText(expected.id);
        expect(text).not.toMatch(/\b(better|best|worse|worst|fairer|superior|inferior|prefer)\b/i);
        expect(text).not.toMatch(
          /\byour (family|parents|opinion|view|religion)\b|\bdo you think\b/i,
        );
        expect(text).not.toMatch(/\bB\.?C\.?E?\b|\bA\.?D\.?\b|\bC\.?E\.?\b|\bcentury\b|years ago/);
        expect(text).not.toMatch(/\d{3,}/);
        expect(text).not.toMatch(/“|”|"/);
        // 6.2.3 belief systems are out of scope for this packet (dossier decision 5).
        expect(text).not.toMatch(/\b(god|gods|goddess|temple|worship|pharaoh)\b/i);
        // Do not conflate the Roman Republic with Athenian direct democracy (6.4.3).
        expect(text).not.toMatch(/\bAthen|\bdirect democracy\b/i);
      });

      it('carries accessibility fields, and the alternative repeats every option verbatim', () => {
        expect(record.accessibilityNotes).toMatch(/no figure, map, date/);
        for (const [label, text] of Object.entries(expected.options)) {
          expect(record.accessibleAlternative.toLowerCase(), label).toContain(
            `option ${label.toLowerCase()}: ${text.toLowerCase()}`,
          );
        }
      });
    });
  }

  it('labels every provided account as an original summary, not a quotation', () => {
    for (const id of [`${RIVERS}-2`, `${ROME}-2`]) {
      expect(recordOf(id).prompt).toMatch(/summary written for this question, not a quotation/);
      expect(recordOf(id).accessibleAlternative).toMatch(/^Original (student )?summary: /);
    }
  });

  it('states who could vote wherever Roman citizen assemblies are described as voting', () => {
    const record = recordOf(`${ROME}-1`);
    for (const text of [record.prompt, record.accessibleAlternative]) {
      expect(text).toMatch(/Assemblies of adult male Roman citizens voted on laws/);
    }
  });
});

describe('SS-CONTENT-2 protection: pending and unavailable', () => {
  const ids = EXPECTED.map((expected) => expected.id);
  const codes = SKILLS.map((expected) => expected.code);

  it('keeps the program unavailable and refuses it as a learner program', () => {
    expect(programsByCode.get(PROGRAM)?.available).toBe(false);
    expect(PROGRAM_ROSTER.find((entry) => entry.code === PROGRAM)?.available).toBe(false);
    expect(() => parseAvailableProgram(PROGRAM)).toThrow(/not available/);
  });

  it('is not servable', () => {
    expect(servableContentCatalog.some((item) => ids.includes(item.id))).toBe(false);
    expect(servableContentCatalog.some((item) => codes.includes(item.skillRef.code))).toBe(false);
  });

  it('is withheld from the public projections, even if the program were available', () => {
    expect(publishableContentProjection(contentCatalog).some((item) => ids.includes(item.id))).toBe(
      false,
    );
    const available = PROGRAM_ROSTER.map((entry) =>
      entry.code === PROGRAM ? { ...entry, available: true } : entry,
    );
    for (const roster of [PROGRAM_ROSTER, available]) {
      expect(
        publishableSkillProjection(skillCatalog, contentCatalog, roster).some((candidate) =>
          codes.includes(candidate.code),
        ),
      ).toBe(false);
    }
  });

  it('leaves the public site unchanged by any Social Studies skill or record', () => {
    const rendered = buildBody(contentCatalog, skillCatalog, PROGRAM_ROSTER);
    for (const leak of [
      ...codes,
      ...ids,
      ...codes.map((code) => skillOf(code).title),
      ...ids.map((id) => recordOf(id).title),
      ...ids.map((id) => recordOf(id).prompt),
      'CA-HSS.6.2.1',
      'CA-HSS.6.2.2',
      'CA-HSS.6.7.2',
      'CA-HSS-AS.6-8.HI.2',
      'CA-HSS-AS.6-8.REP.2',
      'irrigation canals',
      'consul',
    ]) {
      expect(rendered.body, leak).not.toContain(leak);
    }
    const withoutSocialStudies = buildBody(
      contentCatalog.filter((item) => !item.skillRef.code.startsWith('hss6-')),
      skillCatalog.filter((candidate) => candidate.program !== PROGRAM),
      PROGRAM_ROSTER,
    );
    expect(rendered.stats).toBe(withoutSocialStudies.stats);
  });
});
