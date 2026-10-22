import { describe, expect, it } from 'vitest';

import { buildChapters, type LearnerProgress, type Plan } from '../../src/app/learner-chapters';
import { contentCatalog } from '../../src/content/catalog';
import { publishableSkillProjection } from '../../src/content/publication';
import {
  evaluateStructuredSubmission,
  projectResponseSpec,
} from '../../src/content/structured-response';
import type { StructuredValidator } from '../../src/contracts/content';
import { CurriculumDomainSchema } from '../../src/contracts/curriculum';
import type { PlannerMasteryRecord } from '../../src/contracts/planner';
import { skillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import { planNextActivities } from '../../src/planner';

/**
 * SU-E1 (SCI6-READY-DBFREE): database-free readiness evidence for the three
 * Grade 6 Science skills and their six reviewed structured records. Tests
 * only: nothing here changes content, policy, availability or any source file.
 * Every expectation below is derived from the real catalogs, validators and
 * exported functions, never from a copy of an answer.
 */

const SCIENCE_PROGRAM = 'grade-6-science';
const EOL = 'sci6-cells-evidence-of-life';
const PF = 'sci6-cell-parts-functions';
const AAS = 'sci6-cell-as-a-system';

const scienceSkills = skillCatalog.filter((skill) => skill.program === SCIENCE_PROGRAM);
const scienceRecords = contentCatalog.filter((item) => item.id.startsWith('sci6-'));

/** Keys that must never reach a learner projection (contract 5.5). */
const PRIVATE_KEYS = [
  'correctValue',
  'correctOptionId',
  'canonicalAnswer',
  'acceptedAnswers',
  'equivalenceNotes',
  'solutionRepresentation',
  'solutionMethod',
  'misconceptionCodes',
  'hintSteps',
  'forbiddenLeakagePatterns',
];

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((entry) => collectKeys(entry, keys));
  else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      keys.push(key);
      collectKeys(entry, keys);
    }
  }
  return keys;
}

function validatorOf(item: (typeof contentCatalog)[number]): StructuredValidator {
  const validator = item.deterministicValidator;
  if (validator.type !== 'structured') throw new Error(`${item.id} is not structured`);
  return validator;
}

function bodyOf(fields: Record<string, string>) {
  return { structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields } };
}

function correctFields(validator: StructuredValidator): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const field of validator.fields) {
    if (field.kind !== 'choice') throw new Error(`${field.key} is not a choice field`);
    fields[field.key] = field.correctOptionId;
  }
  return fields;
}

describe('SU-E1 catalog baseline', () => {
  it('registers exactly the three Science skills and the six structured records, in catalog order', () => {
    expect(scienceSkills.map((skill) => skill.code)).toEqual([EOL, PF, AAS]);
    expect(scienceRecords.map((item) => item.id)).toEqual([
      'sci6-cells-evidence-of-life-1',
      'sci6-cells-evidence-of-life-2',
      'sci6-cell-parts-functions-1',
      'sci6-cell-parts-functions-2',
      'sci6-cell-as-a-system-1',
      'sci6-cell-as-a-system-2',
    ]);
    expect(scienceRecords.every((item) => item.deterministicValidator.type === 'structured')).toBe(
      true,
    );
    expect(scienceRecords.every((item) => item.review.status === 'reviewed')).toBe(true);
  });
});

describe('SU-E1 case 1: public projection of each of the six records', () => {
  for (const item of scienceRecords) {
    describe(item.id, () => {
      const validator = validatorOf(item);
      const projection = projectResponseSpec(validator)!;

      it('exposes only the allowlisted public keys', () => {
        expect(Object.keys(projection)).toEqual(['mode', 'modeVersion', 'fields']);
        for (const field of projection.fields) {
          expect(field.kind).toBe('choice');
          expect(Object.keys(field)).toEqual(['key', 'kind', 'label', 'options']);
          if (field.kind === 'choice') {
            for (const option of field.options)
              expect(Object.keys(option)).toEqual(['id', 'label']);
          }
        }
        const keys = collectKeys(projection);
        expect(keys.filter((key) => PRIVATE_KEYS.includes(key))).toEqual([]);
      });

      it('preserves field order and option order', () => {
        expect(projection.fields.map((field) => field.key)).toEqual(
          validator.fields.map((field) => field.key),
        );
        validator.fields.forEach((field, index) => {
          const projected = projection.fields[index];
          if (field.kind === 'choice' && projected.kind === 'choice') {
            expect(projected.options.map((option) => option.id)).toEqual(
              field.options.map((option) => option.id),
            );
            expect(projected.options.map((option) => option.label)).toEqual(
              field.options.map((option) => option.label),
            );
          }
        });
      });

      it('carries no solution representation, solution method, equivalence notes or hint text', () => {
        const serialized = JSON.stringify(projection);
        const privateTexts = [
          item.solutionRepresentation,
          item.solutionMethod,
          validator.equivalenceNotes,
          ...item.hintSteps.flatMap((step) => [step.prompt, step.question]),
        ];
        for (const text of privateTexts) {
          expect(text.length).toBeGreaterThan(0);
          expect(serialized).not.toContain(text);
        }
      });

      it('is identical when a copy changes correctOptionId', () => {
        const changed: StructuredValidator = {
          ...validator,
          fields: validator.fields.map((field) => {
            if (field.kind !== 'choice') return field;
            const other = field.options.find((option) => option.id !== field.correctOptionId)!;
            return { ...field, correctOptionId: other.id };
          }),
        };
        expect(
          changed.fields.every(
            (field, index) =>
              field.kind === 'choice' &&
              validator.fields[index].kind === 'choice' &&
              field.correctOptionId !==
                (validator.fields[index] as { correctOptionId: string }).correctOptionId,
          ),
        ).toBe(true);
        expect(projectResponseSpec(changed)).toEqual(projection);
        expect(JSON.stringify(projectResponseSpec(changed))).toBe(JSON.stringify(projection));
      });

      it('has a non-empty accessibleAlternative', () => {
        // Answer-text absence is deliberately not asserted for this field.
        expect(typeof item.accessibleAlternative).toBe('string');
        expect(item.accessibleAlternative!.trim().length).toBeGreaterThan(0);
      });
    });
  }
});

describe('SU-E1 case 2: scoring through the exported evaluator', () => {
  for (const item of scienceRecords) {
    describe(item.id, () => {
      const validator = validatorOf(item);

      it('scores the all-correct body as CORRECT', () => {
        const result = evaluateStructuredSubmission(validator, bodyOf(correctFields(validator)));
        expect(result.status).toBe('scored');
        expect(result).toMatchObject({ status: 'scored', correctness: 'CORRECT' });
      });

      it('scores every distractor in every field (others correct) as INCORRECT', () => {
        let checked = 0;
        for (const field of validator.fields) {
          if (field.kind !== 'choice') throw new Error('unexpected non-choice field');
          const distractors = field.options.filter((option) => option.id !== field.correctOptionId);
          expect(distractors.length).toBeGreaterThan(0);
          for (const distractor of distractors) {
            const result = evaluateStructuredSubmission(
              validator,
              bodyOf({ ...correctFields(validator), [field.key]: distractor.id }),
            );
            expect(result, `${field.key}=${distractor.id}`).toMatchObject({
              status: 'scored',
              correctness: 'INCORRECT',
            });
            checked += 1;
          }
        }
        expect(checked).toBeGreaterThan(0);
      });

      it('refuses an unknown option id with the existing NOT_AN_OPTION field error', () => {
        for (const field of validator.fields) {
          const result = evaluateStructuredSubmission(
            validator,
            bodyOf({ ...correctFields(validator), [field.key]: 'not-a-real-option-id' }),
          );
          expect(result).toEqual({
            status: 'refused',
            code: 'MALFORMED_RESPONSE',
            fieldErrors: [{ key: field.key, code: 'NOT_AN_OPTION' }],
          });
        }
      });
    });
  }
});

describe('SU-E1 case 3: planner reachability and the 0.75 Science gate (SU-R1)', () => {
  const GATE = 0.75;
  const plannerSkills = scienceSkills.map((skill) => ({
    code: skill.code,
    prerequisiteSkillCodes: skill.prerequisiteSkillCodes,
  }));
  const plannerContent = scienceRecords.map((item) => ({
    id: item.id,
    skillCode: item.skillRef.code,
    mode: item.mode,
    difficulty: item.difficulty,
  }));
  const record = (
    estimate: number,
    delayed: boolean,
    confidenceBand: PlannerMasteryRecord['confidenceBand'] = 'MEDIUM',
  ): PlannerMasteryRecord => ({ estimate, confidenceBand, independentDelayedCheck: delayed });
  const plan = (
    masteryBySkillCode: Record<string, PlannerMasteryRecord | undefined>,
    secureThreshold = GATE,
  ) =>
    planNextActivities({
      skills: plannerSkills,
      content: plannerContent,
      masteryBySkillCode,
      timeBudgetMinutes: 30,
      secureThreshold,
    });
  const ids = (result: ReturnType<typeof plan>) => result.items.map((item) => item.contentId);
  const EOL_ITEMS = ['sci6-cells-evidence-of-life-1', 'sci6-cells-evidence-of-life-2'];

  it('plans the real catalog order with no prerequisites and three 8-minute slots', () => {
    expect(plannerSkills.every((skill) => skill.prerequisiteSkillCodes.length === 0)).toBe(true);
    const result = plan({});
    expect(result.items.length).toBe(3);
    expect(result.totalMinutes).toBe(24);
    expect(result.blockedSkills).toEqual([]);
    expect(result.unavailableSkills).toEqual([]);
  });

  describe('the four G15 states', () => {
    it('state 1, no mastery: EoL-1, EoL-2, PF-1; as-a-system has no slot', () => {
      const result = plan({});
      expect(ids(result)).toEqual([
        'sci6-cells-evidence-of-life-1',
        'sci6-cells-evidence-of-life-2',
        'sci6-cell-parts-functions-1',
      ]);
      expect(result.items.every((item) => item.skillCode !== AAS)).toBe(true);
    });

    it('state 2, all placed and none secure: the same three items', () => {
      const result = plan({
        [EOL]: record(1, false),
        [PF]: record(1, false),
        [AAS]: record(1, false),
      });
      expect(ids(result)).toEqual([
        'sci6-cells-evidence-of-life-1',
        'sci6-cells-evidence-of-life-2',
        'sci6-cell-parts-functions-1',
      ]);
    });

    it('state 3, EoL secure: PF-1, PF-2, AaS-1', () => {
      const result = plan({
        [EOL]: record(1, true),
        [PF]: record(1, false),
        [AAS]: record(1, false),
      });
      expect(ids(result)).toEqual([
        'sci6-cell-parts-functions-1',
        'sci6-cell-parts-functions-2',
        'sci6-cell-as-a-system-1',
      ]);
    });

    it('state 4, EoL and PF secure: only as-a-system items remain', () => {
      const result = plan({
        [EOL]: record(1, true),
        [PF]: record(1, true),
        [AAS]: record(1, false),
      });
      expect(ids(result)).toEqual(['sci6-cell-as-a-system-1', 'sci6-cell-as-a-system-2']);
    });
  });

  describe('assisted states at gate 0.75', () => {
    const eolItemsPlanned = (estimate: number, delayed: boolean) =>
      ids(plan({ [EOL]: record(estimate, delayed, estimate >= 0.9 ? 'MEDIUM' : 'LOW') })).filter(
        (id) => EOL_ITEMS.includes(id),
      );

    it('(0.55, confirmed) is not secure: EoL items are planned', () => {
      expect(eolItemsPlanned(0.55, true)).toEqual(EOL_ITEMS);
    });

    it('(0.75, confirmed) is secure', () => {
      expect(eolItemsPlanned(0.75, true)).toEqual([]);
    });

    it('(0.9, confirmed) is secure', () => {
      expect(eolItemsPlanned(0.9, true)).toEqual([]);
    });

    it('(1, not confirmed) is not secure', () => {
      expect(eolItemsPlanned(1, false)).toEqual(EOL_ITEMS);
    });
  });

  describe('gate-value controls (thresholds are not equivalent)', () => {
    it('gate 0.5 with (0.55, confirmed) is secure', () => {
      const result = plan({ [EOL]: record(0.55, true, 'LOW') }, 0.5);
      expect(ids(result).filter((id) => EOL_ITEMS.includes(id))).toEqual([]);
    });

    it('gate 1.0 with (0.9, confirmed) is not secure', () => {
      const result = plan({ [EOL]: record(0.9, true) }, 1.0);
      expect(ids(result).filter((id) => EOL_ITEMS.includes(id))).toEqual(EOL_ITEMS);
    });
  });
});

describe('SU-E1 case 4: publication projection (SU-R2)', () => {
  const rosterWithScience = PROGRAM_ROSTER.map((program) =>
    program.code === SCIENCE_PROGRAM ? { ...program, available: true } : program,
  );

  it('the candidate roster has Science available with the Cells-unit label', () => {
    const entry = PROGRAM_ROSTER.find((program) => program.code === SCIENCE_PROGRAM);
    expect(entry?.available).toBe(true);
    expect(entry?.label).toBe('Grade 6 Science (Cells unit, practice only)');
    expect(rosterWithScience.find((program) => program.code === SCIENCE_PROGRAM)?.available).toBe(
      true,
    );
  });

  it('positive control: the three Science skills are published when Science is available', () => {
    const projected = publishableSkillProjection(scienceSkills, contentCatalog, rosterWithScience);
    expect(projected).toEqual(scienceSkills);
    expect(projected.map((skill) => skill.code)).toEqual([EOL, PF, AAS]);
  });

  it('full roster with Science injected available: 67 skills equal to skillCatalog, 64 non-Science unchanged in order', () => {
    const projected = publishableSkillProjection(skillCatalog, contentCatalog, rosterWithScience);
    expect(projected).toHaveLength(67);
    expect(projected).toEqual(skillCatalog);
    const nonScienceCatalog = skillCatalog.filter((skill) => skill.program !== SCIENCE_PROGRAM);
    const nonScienceProjected = projected.filter((skill) => skill.program !== SCIENCE_PROGRAM);
    expect(nonScienceCatalog).toHaveLength(64);
    expect(nonScienceProjected).toEqual(nonScienceCatalog);
    expect(projected.filter((skill) => skill.program === SCIENCE_PROGRAM)).toHaveLength(3);
  });
});

describe('SU-E1 case 5: learner chapters for the three Science skills', () => {
  const progress: LearnerProgress = {
    skills: scienceSkills.map((skill) => ({
      skillCode: skill.code,
      title: skill.title,
      domain: skill.domain,
      status: 'NOT_STARTED' as const,
      summary: 'Not started yet.',
    })),
    recentStrengths: [],
    nextActivity: null,
  };
  const plan: Plan = { items: [], totalMinutes: 0, blockedSkills: [], unavailableSkills: [] };

  it('yields one Life Science chapter with three unlocked, offered items in catalog order', () => {
    const chapters = buildChapters(progress, plan, undefined, undefined);
    expect(chapters).toHaveLength(1);
    const [chapter] = chapters;
    expect(chapter.domain).toBe('sci6-life-science');
    expect(chapter.label).toBe('Life Science');
    expect(chapter.items.map((item) => item.skillCode)).toEqual(
      scienceSkills.map((skill) => skill.code),
    );
    expect(chapter.items.map((item) => item.skillCode)).toEqual([EOL, PF, AAS]);
    expect(chapter.totalCount).toBe(3);
    expect(chapter.confirmedCount).toBe(0);
    expect(chapter.practicingCount).toBe(0);
    for (const item of chapter.items) {
      expect(item.locked).toBe(false);
      expect(item.availability).toBe('offered');
    }
    const expectedOrder = CurriculumDomainSchema.options.indexOf('sci6-life-science');
    expect(expectedOrder).toBeGreaterThanOrEqual(0);
    expect(chapter.order).toBe(expectedOrder);
  });
});
