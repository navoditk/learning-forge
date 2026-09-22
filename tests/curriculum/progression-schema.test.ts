import { describe, expect, it } from 'vitest';

import {
  AssessmentContentItemSchema,
  AssessmentBankSchema,
  ItemRefSchema,
  LessonSchema,
  ProgramSchema,
  RefSchema,
  ReviewContentItemSchema,
  UnitSchema,
  TeachingContentItemSchema,
} from '../../src/contracts/progression';
import {
  PROGRAM_REGISTRY,
  validateProgramSkillInvariants,
} from '../../src/curriculum/program-registry';
import {
  validateItemReadinessRefs,
  validateProgressionCatalog,
} from '../../src/curriculum/progression-catalog';
import { skillCatalog, validateSkillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_CODES } from '../../src/contracts/program-codes';
import { PILOT_LESSONS } from '../../src/curriculum/pilot-catalog';

const review = {
  status: 'reviewed' as const,
  reviewer: 'reviewer',
  reviewedAt: '2026-01-01',
  originalityStatement: 'Original work',
};
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const base = {
  id: 'teaching-1',
  version: '1.0.0',
  title: 'Ratios',
  skillRef: { code: 'ratio-language', version: '1.0.0' },
  mode: 'core' as const,
  difficulty: 'foundational' as const,
  standards: ['CCSS-6.RP.A.1'],
  provenance,
  review,
  accessibilityNotes: 'Use plain language.',
  accessibleAlternative: 'Text-only explanation.',
  observableEvidence: ['Identifies the compared quantities.'],
  itemReadinessRefs: [],
};

describe('course progression contracts', () => {
  it('requires version-pinned canonical references', () => {
    expect(RefSchema.safeParse({ code: 'skill', version: '1.0.0' }).success).toBe(true);
    expect(
      ItemRefSchema.safeParse({ id: 'item', version: '1.0.0', hash: 'sha256:abc' }).success,
    ).toBe(true);
    expect(RefSchema.safeParse('skill@1.0.0').success).toBe(false);
  });

  it('rejects a hybrid program without a legacy compatibility policy', () => {
    const program = PROGRAM_REGISTRY.find(({ code }) => code === 'grade-6-math');
    expect(program).toBeDefined();
    expect(
      ProgramSchema.safeParse({ ...program, legacyCompatibilityPolicyRef: null }).success,
    ).toBe(false);
  });

  it('keeps the registry and curriculum program vocabulary in one source', () => {
    expect(new Set(PROGRAM_REGISTRY.map(({ code }) => code))).toEqual(new Set(PROGRAM_CODES));
  });

  it('rejects a lesson-level sequence because ordering belongs to the unit spine', () => {
    expect(LessonSchema.safeParse({ ...PILOT_LESSONS[0], sequence: 1 }).success).toBe(false);
  });

  it('accepts teaching records and rejects assessment records without a bank reference', () => {
    expect(
      TeachingContentItemSchema.safeParse({
        ...base,
        role: 'teaching',
        explanation: 'A ratio compares two quantities.',
      }).success,
    ).toBe(true);
    expect(
      AssessmentContentItemSchema.safeParse({
        ...base,
        id: 'assessment-1',
        role: 'assessment',
        prompt: 'Which ratio is equivalent?',
        deterministicValidator: {},
      }).success,
    ).toBe(false);
  });

  it('rejects practice-only fields on teaching and assessment records', () => {
    expect(
      TeachingContentItemSchema.safeParse({
        ...base,
        role: 'teaching',
        explanation: 'A ratio compares two quantities.',
        deterministicValidator: {},
        hintSteps: [],
      }).success,
    ).toBe(false);

    const assessment = {
      ...base,
      id: 'assessment-1',
      role: 'assessment' as const,
      assessmentBankRef: { code: 'bank', version: '1.0.0' },
      prompt: 'Which ratio is equivalent?',
      solutionRepresentation: '2:3',
      solutionMethod: 'Equivalent ratios',
      deterministicValidator: {
        type: 'ratio' as const,
        canonicalAnswer: '2:3',
        acceptedAnswers: ['2:3'],
        equivalenceNotes: 'Equivalent ratio notation',
      },
      misconceptionCodes: [],
      forbiddenLeakagePatterns: ['2:3'],
    };
    expect(AssessmentContentItemSchema.safeParse(assessment).success).toBe(true);
    expect(AssessmentContentItemSchema.safeParse({ ...assessment, hintSteps: [] }).success).toBe(
      false,
    );
  });

  it('forbids hints on review records', () => {
    expect(
      ReviewContentItemSchema.safeParse({
        ...base,
        id: 'review-1',
        role: 'review',
        assessmentBankRef: { code: 'bank', version: '1.0.0' },
        prompt: 'Retrieve the ratio.',
        solutionRepresentation: '2:3',
        solutionMethod: 'Equivalent ratios',
        deterministicValidator: {
          type: 'text',
          canonicalAnswer: '2:3',
          acceptedAnswers: ['2:3'],
          equivalenceNotes: 'Exact ratio notation',
        },
        misconceptionCodes: [],
        forbiddenLeakagePatterns: ['2:3'],
        hintSteps: [],
      }).success,
    ).toBe(false);
  });

  it('rejects cross-program skill prerequisites', () => {
    expect(() =>
      validateProgramSkillInvariants([
        { code: 'mk6-a', program: 'math-kangaroo-6', prerequisiteSkillCodes: ['ratio-language'] },
        { code: 'ratio-language', program: 'grade-6-math', prerequisiteSkillCodes: [] },
      ]),
    ).toThrow('cannot depend on a skill from');
  });

  it('rejects cross-program prerequisites through the production catalog validator', () => {
    const invalidCatalog = skillCatalog.map((skill) =>
      skill.code === 'ratio-language'
        ? { ...skill, prerequisiteSkillCodes: ['mk6-multi-step-arithmetic-reasoning'] }
        : skill,
    );
    expect(() => validateSkillCatalog(invalidCatalog)).toThrow('cannot depend on a skill from');
  });

  it('rejects a skill that does not use its program prefix', () => {
    expect(() =>
      validateProgramSkillInvariants([
        { code: 'wrong-prefix', program: 'math-kangaroo-6', prerequisiteSkillCodes: [] },
      ]),
    ).toThrow("does not use math-kangaroo-6's skill code prefix");
  });

  it('rejects an item readiness ref outside the prerequisite closure', () => {
    expect(() =>
      validateItemReadinessRefs(
        [
          {
            id: 'item-1',
            skillRef: { code: 'target', version: '1.0.0' },
            itemReadinessRefs: [{ code: 'unrelated', version: '1.0.0' }],
          },
        ],
        [
          {
            code: 'target',
            program: 'grade-6-math',
            version: '1.0.0',
            prerequisiteSkillCodes: ['prior'],
          },
          { code: 'prior', program: 'grade-6-math', version: '1.0.0', prerequisiteSkillCodes: [] },
          {
            code: 'unrelated',
            program: 'grade-6-math',
            version: '1.0.0',
            prerequisiteSkillCodes: [],
          },
        ],
      ),
    ).toThrow('outside the owning skill prerequisite closure');
  });

  it('rejects self and cross-program item readiness references', () => {
    expect(() =>
      validateItemReadinessRefs(
        [
          {
            id: 'self-item',
            skillRef: { code: 'target', version: '1.0.0' },
            itemReadinessRefs: [{ code: 'target', version: '1.0.0' }],
          },
        ],
        [
          {
            code: 'target',
            program: 'grade-6-math',
            version: '1.0.0',
            prerequisiteSkillCodes: [],
          },
        ],
      ),
    ).toThrow('cannot declare its owning skill');

    expect(() =>
      validateItemReadinessRefs(
        [
          {
            id: 'cross-program-item',
            skillRef: { code: 'target', version: '1.0.0' },
            itemReadinessRefs: [{ code: 'other', version: '1.0.0' }],
          },
        ],
        [
          {
            code: 'target',
            program: 'grade-6-math',
            version: '1.0.0',
            prerequisiteSkillCodes: ['other'],
          },
          { code: 'other', program: 'math-kangaroo-6', version: '1.0.0' },
        ],
      ),
    ).toThrow('another program');
  });

  it('rejects a non-hybrid program carrying a legacy compatibility policy', () => {
    const program = PROGRAM_REGISTRY.find(({ code }) => code === 'math-kangaroo-6');
    expect(program).toBeDefined();
    expect(
      ProgramSchema.safeParse({
        ...program,
        legacyCompatibilityPolicyRef: { code: 'legacy', version: '1.0.0' },
      }).success,
    ).toBe(false);
  });

  it('validates the ordered Program → Unit → Lesson bank spine', () => {
    const programRef = { code: 'pilot', version: '1.0.0' };
    const unitRef = { code: 'unit-1', version: '1.0.0' };
    const lessonRef = { code: 'lesson-1', version: '1.0.0' };
    const bankRef = { code: 'bank-1', version: '1.0.0' };
    const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
    const reviewed = {
      status: 'reviewed' as const,
      reviewer: 'reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original',
    };
    const program = ProgramSchema.parse({
      ...programRef,
      label: 'Pilot',
      available: true,
      subjectKind: 'graded-academic',
      skillCodePrefix: null,
      progressionMode: 'unit-sequenced',
      unitRefs: [unitRef],
      accessPolicyRef: { code: 'access', version: '1.0.0' },
      legacyCompatibilityPolicyRef: null,
      defaultPolicyProfileRef: { code: 'policy', version: '1.0.0' },
    });
    const unit = UnitSchema.parse({
      ...unitRef,
      programRef,
      title: 'Unit',
      summary: 'Summary',
      lessonRefs: [lessonRef],
      policyProfileRef: { code: 'policy', version: '1.0.0' },
      provenance,
      review: reviewed,
    });
    const lesson = LessonSchema.parse({
      ...lessonRef,
      unitRef,
      title: 'Lesson',
      objectives: ['Compare ratios'],
      skillRefs: [{ code: 'skill-1', version: '1.0.0' }],
      teachingContentRefs: [],
      practiceContentRefs: [],
      assessmentBankRef: bankRef,
      provenance,
      review: reviewed,
    });
    const bank = AssessmentBankSchema.parse({
      ...bankRef,
      targetRef: lessonRef,
      policyProfileRef: { code: 'policy', version: '1.0.0' },
      coveredSkillRefs: [{ code: 'skill-1', version: '1.0.0' }],
      itemCount: 1,
      contentHash: 'sha256:bank',
      provenance,
      review: reviewed,
    });
    expect(() => validateProgressionCatalog([program], [unit], [lesson], [bank])).not.toThrow();
    expect(() =>
      validateProgressionCatalog([program], [unit], [lesson], [{ ...bank, coveredSkillRefs: [] }]),
    ).toThrow('does not cover lesson skill');

    const secondUnit = UnitSchema.parse({
      ...unit,
      code: 'unit-2',
      lessonRefs: [lessonRef],
    });
    const programWithDuplicateLesson = ProgramSchema.parse({
      ...program,
      unitRefs: [unitRef, { code: 'unit-2', version: '1.0.0' }],
    });
    expect(() =>
      validateProgressionCatalog(
        [programWithDuplicateLesson],
        [unit, secondUnit],
        [lesson],
        [bank],
      ),
    ).toThrow('is listed by multiple units');
  });
});
