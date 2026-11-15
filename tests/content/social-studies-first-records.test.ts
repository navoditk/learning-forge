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

// SS-CONTENT (D-324 O1): the one approved Social Studies skill and its two
// pending practice records, loaded through the real catalogs and the accepted
// Social Studies rules. Closed option sets, the single correct option and the
// distractor-to-misconception mapping are review obligations; the checks below
// pin what the author recorded so a later edit must confront them.
const PROGRAM = 'grade-6-social-studies';
const SKILL = 'hss6-athenian-and-representative-democracy';
const COMPARISON = `${SKILL}-1`;
const TRANSFER = `${SKILL}-2`;

type Expected = {
  id: string;
  difficulty: string;
  standards: string[];
  correctLabel: string;
  options: Record<string, string>;
  misconceptions: string[];
};

const EXPECTED: Expected[] = [
  {
    id: COMPARISON,
    difficulty: 'foundational',
    standards: ['CA-HSS.6.4.3', 'CA-HSS-AS.6-8.REP.3'],
    correctLabel: 'B',
    options: {
      A: 'In the assembly, voters chose a few representatives who decided for everyone else.',
      B: 'In the assembly, eligible citizens voted on the decisions themselves.',
      C: 'In the assembly, meetings were usually held outdoors on a hillside.',
      D: 'In the assembly, every person living in Athens, including women and foreigners, could vote.',
    },
    misconceptions: [
      'athens-seen-as-representative',
      'incidental-detail-seen-as-key-difference',
      'all-athenian-residents-voted',
    ],
  },
  {
    id: TRANSFER,
    difficulty: 'developing',
    standards: ['CA-HSS.6.4.3'],
    correctLabel: 'C',
    options: {
      A: 'Representative democracy, because the elected student council wrote the list of choices.',
      B: 'Representative democracy, because 600 students is too many people to decide directly.',
      C: 'Direct democracy, because every student voted on the decision themselves.',
      D: 'Representative democracy, because the elected student council counted the ballots.',
    },
    misconceptions: [
      'agenda-setters-seen-as-representatives',
      'group-size-decides-democracy-type',
      'ballot-counters-seen-as-representatives',
    ],
  },
];

const skill = skillCatalog.find((candidate) => candidate.code === SKILL);
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

describe('SS-CONTENT skill hss6-athenian-and-representative-democracy', () => {
  it('loads as the only Social Studies skill with the approved identity and no prerequisites', () => {
    expect(skill).toMatchObject({
      code: SKILL,
      version: '1.0.0',
      program: PROGRAM,
      domain: 'hss6-ancient-greece',
      standards: ['CA-HSS.6.4.3', 'CA-HSS-AS.6-8.REP.3'],
      prerequisiteSkillCodes: [],
      difficultyBands: ['foundational', 'developing'],
    });
    expect(skillCatalog.filter((candidate) => candidate.program === PROGRAM)).toEqual([skill]);
    expect(skillCatalog.some((candidate) => candidate.prerequisiteSkillCodes.includes(SKILL))).toBe(
      false,
    );
  });

  it('maps 6.4.3 plus at least one allow-listed grades 6-8 analysis code, and no literacy tag', () => {
    const standards = skill!.standards;
    expect(standards.filter((code) => GRADE_6_HSS_CONTENT_STANDARDS.includes(code))).toEqual([
      'CA-HSS.6.4.3',
    ]);
    // SS-C1: REP.3 (relevant versus incidental information in historical
    // narratives), exercised by record 1's account; HI.1 was withdrawn.
    expect(standards.filter((code) => GRADES_6_8_HSS_ANALYSIS_STANDARDS.includes(code))).toEqual([
      'CA-HSS-AS.6-8.REP.3',
    ]);
    expect(standards.some((code) => /^(RH|WHST)\./.test(code))).toBe(false);
  });

  it('names the Athenian comparison with deterministic verbs and claims no mastery', () => {
    const evidence = skill!.observableEvidence.join(' ');
    expect(evidence).toMatch(/Athen/);
    expect(evidence).toMatch(/representative/);
    for (const statement of skill!.observableEvidence) {
      expect(statement).toMatch(/^(Selects|Classifies)[ ,]/);
      expect(statement).not.toMatch(/\b(explains|argues|evaluates)\b/i);
    }
    expect(skill!.masteryCheckRule).toMatch(/^Practice evidence only/);
    expect(skill!.masteryCheckRule).toMatch(/Does not establish mastery/);
  });

  it('declares exactly the misconception codes the two records use', () => {
    expect([...skill!.misconceptionCodes].sort()).toEqual(
      EXPECTED.flatMap((expected) => expected.misconceptions).sort(),
    );
  });
});

describe('SS-C1: record 1 genuinely exercises REP.3 (relevant versus incidental information)', () => {
  const record = recordOf(COMPARISON);
  const comparison = EXPECTED[0];

  it('gives an original account labelled as a summary, mixing relevant and incidental details', () => {
    expect(record.prompt).toMatch(
      /^Read this short account\. It is a summary written for this question, not a quotation/,
    );
    expect(record.accessibleAlternative).toMatch(/^Original summary: /);
    for (const text of [record.prompt, record.accessibleAlternative]) {
      // Incidental details (where the assembly met; travel to attend).
      expect(text).toMatch(/usually met outdoors on a hillside in the city/);
      expect(text).toMatch(/traveled in from farms and villages/);
      // The relevant detail (who made the decisions).
      expect(text).toMatch(
        /voted on the city's decisions themselves instead of choosing other people/,
      );
    }
  });

  it('keys the relevant statement and keeps an accurate but incidental statement as a distractor', () => {
    expect(record.prompt).toMatch(
      /accurate according to the account and is the relevant information/,
    );
    expect(record.misconceptionCodes).toContain('incidental-detail-seen-as-key-difference');
    expect(comparison.options.C).toMatch(/outdoors on a hillside/);
    expect(record.solutionRepresentation).toMatch(
      /C is accurate according to the account, but it is an incidental detail/,
    );
    expect(skill!.observableEvidence[0]).toMatch(/relevant and incidental details/);
    expect(skill!.masteryCheckRule).toMatch(/REP\.3 evidence is partial/);
    expect(JSON.stringify(skill)).not.toMatch(/HI\.1/);
  });
});

describe('SS-CONTENT practice records', () => {
  it('are the only two records for the skill', () => {
    expect(
      contentCatalog.filter((candidate) => candidate.skillRef.code === SKILL).map((r) => r.id),
    ).toEqual([COMPARISON, TRANSFER]);
  });

  for (const expected of EXPECTED) {
    describe(expected.id, () => {
      const record = recordOf(expected.id);
      const validator = record.deterministicValidator;
      const correct = expected.options[expected.correctLabel];

      it('is a core multiple_choice practice record pinned to skill 1.0.0', () => {
        expect(record).toMatchObject({
          version: '1.0.0',
          role: 'practice',
          skillRef: { code: SKILL, version: '1.0.0' },
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
          'direct',
          'representative',
          'Direct democracy',
          'Representative democracy',
          ...distractors.flatMap(([label, text]) => [label, text, `Option ${label}`]),
        ];
        for (const probe of probes) {
          expect(matchesAcceptedAnswer(validator, probe), probe).toBe(false);
        }
      });

      it('has a 2 to 3 step hint ladder that leaks neither the correct option text nor a bare label', () => {
        const steps = record.hintSteps;
        expect(steps.length).toBeGreaterThanOrEqual(2);
        expect(steps.length).toBeLessThanOrEqual(3);
        expect(steps.map((step) => step.order)).toEqual(steps.map((_, index) => index + 1));
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
          expect(skill!.misconceptionCodes).toContain(code);
        }
      });

      it('keeps the subject guardrails: no Rome, ranking, preference, dates or excerpts', () => {
        const text = learnerText(expected.id);
        expect(text).not.toMatch(/\bRom(e|an)\b|\bRepublic\b|\bsenat/i);
        expect(text).not.toMatch(
          /\b(better|best|worse|worst|fairer|superior|inferior|prefer|favorite)\b/i,
        );
        expect(text).not.toMatch(/\byour (family|parents|opinion|view)\b|\bdo you think\b/i);
        expect(text).not.toMatch(/\bB\.?C\.?E?\b|\bA\.?D\.?\b|\bC\.?E\.?\b|\bcentury\b|years ago/);
        expect(text).not.toMatch(/“|”|"/);
      });

      it('states who could take part in Athens wherever it describes the assembly', () => {
        if (expected.id === COMPARISON) {
          for (const text of [record.prompt, record.accessibleAlternative]) {
            expect(text).toMatch(/Only adult men who were Athenian citizens could take part/);
            expect(text).toMatch(/women, enslaved people and foreigners living in Athens/i);
          }
        } else {
          for (const text of [record.prompt, record.accessibleAlternative]) {
            expect(text).toMatch(
              /direct democracy means the eligible participants vote on a decision themselves/i,
            );
          }
        }
        expect(learnerText(expected.id)).not.toMatch(/everyone in Athens (voted|could vote)/i);
      });

      it('SS-C2: never defines direct democracy by physical attendance; in person is said only of Athens', () => {
        const text = `${learnerText(expected.id)}\n${record.deterministicValidator.equivalenceNotes}`;
        const sentences = text.split(/(?<=[.;?!])\s+|\n+/);
        for (const sentence of sentences.filter((s) => /in person/i.test(s))) {
          expect(sentence, sentence).toMatch(/Athen/);
        }
        expect(text).not.toMatch(/direct democracy[^.;]*\bmeans\b[^.;]*in person/i);
      });

      it('carries accessibility fields, and the alternative repeats every option verbatim', () => {
        expect(record.accessibilityNotes).toMatch(/no figure/);
        for (const [label, text] of Object.entries(expected.options)) {
          expect(record.accessibleAlternative.toLowerCase(), label).toContain(
            `option ${label.toLowerCase()}: ${text.toLowerCase()}`,
          );
        }
      });
    });
  }
});

describe('SS-CONTENT protection: pending and unavailable', () => {
  const ids = [COMPARISON, TRANSFER];

  it('keeps the program unavailable and refuses it as a learner program', () => {
    expect(programsByCode.get(PROGRAM)?.available).toBe(false);
    expect(PROGRAM_ROSTER.find((entry) => entry.code === PROGRAM)?.available).toBe(false);
    expect(() => parseAvailableProgram(PROGRAM)).toThrow(/not available/);
  });

  it('is not servable', () => {
    expect(servableContentCatalog.some((item) => ids.includes(item.id))).toBe(false);
    expect(servableContentCatalog.some((item) => item.skillRef.code === SKILL)).toBe(false);
  });

  it('is withheld from the public projections, even if the program were available', () => {
    expect(publishableContentProjection(contentCatalog).some((item) => ids.includes(item.id))).toBe(
      false,
    );
    expect(
      publishableSkillProjection(skillCatalog, contentCatalog, PROGRAM_ROSTER).some(
        (candidate) => candidate.code === SKILL,
      ),
    ).toBe(false);
    const available = PROGRAM_ROSTER.map((entry) =>
      entry.code === PROGRAM ? { ...entry, available: true } : entry,
    );
    expect(
      publishableSkillProjection(skillCatalog, contentCatalog, available).some(
        (candidate) => candidate.code === SKILL,
      ),
    ).toBe(false);
  });

  it('leaves the public site with only the Coming soon placeholder for the program', () => {
    const rendered = buildBody(contentCatalog, skillCatalog, PROGRAM_ROSTER);
    const placeholder = rendered.body.match(
      new RegExp(
        `<section class="program-section program-section-empty" id="program-${PROGRAM}">[\\s\\S]*?</section>`,
      ),
    );
    expect(placeholder?.[0]).toContain('Coming soon');
    expect(placeholder?.[0]).toContain('This program is not available yet.');
    for (const leak of [
      SKILL,
      COMPARISON,
      TRANSFER,
      skill!.title,
      recordOf(COMPARISON).title,
      recordOf(TRANSFER).title,
      'CA-HSS.6.4.3',
      'CA-HSS-AS.6-8.REP.3',
      'Athenian assembly',
      'student council',
      recordOf(COMPARISON).prompt,
      recordOf(TRANSFER).prompt,
    ]) {
      expect(rendered.body, leak).not.toContain(leak);
    }
    const withoutSocialStudies = buildBody(
      contentCatalog.filter((item) => !ids.includes(item.id)),
      skillCatalog.filter((candidate) => candidate.code !== SKILL),
      PROGRAM_ROSTER,
    );
    expect(rendered.stats).toBe(withoutSocialStudies.stats);
  });
});
