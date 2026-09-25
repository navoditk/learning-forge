import { describe, expect, it } from 'vitest';

import { createAssessmentStore } from '../../src/assessment/store';
import { contentCatalog } from '../../src/content/catalog';
import { PILOT_UNITS } from '../../src/curriculum/pilot-catalog';
import { assessmentKindMatchesTarget } from '../../src/progression/assessment-assignment';
import { lessonStatusAfterPlacement, placementLessonIndex } from '../../src/progression/placement';
import {
  placementProbeBank,
  placementProbeBankFor,
  placementProbeBankRef,
} from '../../src/progression/placement-probe';
import { authorizeActivity } from '../../src/progression/policy';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { reassessmentLimitsFor } from '../../src/progression/skill-assessment';

const unit = PILOT_UNITS[0]!;
const lessonSkills = [['ratio-language'], ['unit-rates'], ['ratio-tables']];
const result = (skillCode: string, correct: boolean) => ({ skillCode, correct });

describe('placement position (D-68 as amended)', () => {
  it('places at the first lesson with a missed item', () => {
    expect(
      placementLessonIndex(lessonSkills, [
        result('ratio-language', true),
        result('unit-rates', false),
        result('ratio-tables', true),
      ]),
    ).toBe(1);
    expect(placementLessonIndex(lessonSkills, [result('ratio-language', false)])).toBe(0);
  });

  it('treats a missing item as missed', () => {
    expect(
      placementLessonIndex(lessonSkills, [
        result('ratio-language', true),
        result('ratio-tables', true),
      ]),
    ).toBe(1);
  });

  it('places at the final lesson, never the unit assessment, when all are correct', () => {
    expect(
      placementLessonIndex(lessonSkills, [
        result('ratio-language', true),
        result('unit-rates', true),
        result('ratio-tables', true),
      ]),
    ).toBe(2);
  });

  it('moves only lessons that have not started (§6.6)', () => {
    for (const current of [undefined, 'NOT_STARTED'] as const) {
      expect(lessonStatusAfterPlacement(current, 'BEFORE')).toBe('SKIPPED_BY_PLACEMENT');
      expect(lessonStatusAfterPlacement(current, 'AT')).toBe('AVAILABLE');
      expect(lessonStatusAfterPlacement(current, 'AFTER')).toBeUndefined();
    }
    for (const current of [
      'AVAILABLE',
      'IN_PROGRESS',
      'COMPLETE',
      'COMPLETE_BY_SKIP',
      'SKIPPED_BY_PLACEMENT',
    ] as const) {
      expect(lessonStatusAfterPlacement(current, 'BEFORE')).toBeUndefined();
      expect(lessonStatusAfterPlacement(current, 'AT')).toBeUndefined();
    }
  });
});

describe('placement probe bank (D-64)', () => {
  it('projects one reviewed practice item per unit skill, in lesson order', () => {
    const bank = placementProbeBank(unit);
    expect(bank?.items.map((item) => item.skillRef.code)).toEqual([
      'ratio-language',
      'unit-rates',
      'ratio-tables',
    ]);
    for (const item of bank?.items ?? []) {
      expect(item.role).toBe('practice');
      const record = contentCatalog.find(
        (candidate) => candidate.id === item.id && candidate.version === item.version,
      );
      expect(record?.review.status).toBe('reviewed');
      expect(item).not.toHaveProperty('hintSteps');
    }
    expect(bank?.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('resolves only placement-probe references and fails closed otherwise', async () => {
    const ref = placementProbeBankRef(unit);
    expect(placementProbeBankFor(ref)?.code).toBe(ref.code);
    expect(placementProbeBankFor({ ...ref, version: '9.9.9' })).toBeUndefined();
    expect(
      placementProbeBankFor({ code: 'ratio-language-lesson-bank', version: '1.0.0' }),
    ).toBeUndefined();
    const store = createAssessmentStore();
    await expect(store.getBank(ref)).resolves.toMatchObject({ code: ref.code });
    await expect(
      store.getBank({ code: 'ratio-language-lesson-bank', version: '1.0.0' }),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_STORE_UNAVAILABLE' });
  });

  it('matches placement only to unit targets and applies no reassessment limits', () => {
    expect(assessmentKindMatchesTarget('PLACEMENT', 'UNIT')).toBe(true);
    expect(assessmentKindMatchesTarget('PLACEMENT', 'LESSON')).toBe(false);
    expect(assessmentKindMatchesTarget('PLACEMENT', 'SKILL')).toBe(false);
    const profile = resolvePinnedPolicyProfile({ code: 'grade-6-math-default', version: '1.1.0' });
    expect(reassessmentLimitsFor('PLACEMENT', profile)).toEqual({});
  });

  it('never gates placement on prerequisites (§9.3)', () => {
    const policy = {
      code: 'fixture',
      version: '1.0.0',
      grantsActivityKinds: ['PLACEMENT', 'PRACTICE'] as ('PLACEMENT' | 'PRACTICE')[],
      deniesActivityKinds: [],
      appliesToSkillsClaimedByNoUnit: false,
      respectsPrerequisiteGraph: true,
    };
    const request = {
      skillCode: 'unit-rates',
      prerequisiteSkillCodes: ['ratio-language'],
      masteredSkillCodes: new Set<string>(),
      policy,
    };
    expect(authorizeActivity({ ...request, activityKind: 'PLACEMENT' }).allowed).toBe(true);
    expect(authorizeActivity({ ...request, activityKind: 'PRACTICE' }).reasonCode).toBe(
      'LOCKED_PREREQUISITE',
    );
  });
});
