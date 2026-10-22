import baselineCases from '../../evals/cases/baseline.json';
import scienceCases from '../../evals/cases/science.json';
import { describe, expect, it } from 'vitest';

import { runEvalCatalog } from '../../src/evaluation';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';
import { EvalCatalogSchema } from '../../src/evaluation/schema';

describe('synthetic tutor evaluation baseline', () => {
  it('runs every required dimension through the fake tutor with no failures', async () => {
    const report = await runEvalCatalog(baselineCases, new TutorHarness(new FakeTutorModel()));
    const dimensions = new Set(report.caseResults.map((result) => result.dimension));

    expect(report.adapter).toBe('fake-tutor');
    expect(report.calibratedThresholds).toBe(false);
    expect(report.summary).toEqual({ total: 22, passed: 22, failed: 0 });
    expect(dimensions).toEqual(
      new Set([
        'answer_leakage',
        'hint_progression',
        'correctness',
        'tone',
        'age_appropriateness',
        'prompt_injection',
        'accessibility',
        'confident_wrong',
        'frustrated_learner',
      ]),
    );
  });

  it('produces the same report for repeated fake-adapter runs', async () => {
    const first = await runEvalCatalog(baselineCases, new TutorHarness(new FakeTutorModel()));
    const second = await runEvalCatalog(baselineCases, new TutorHarness(new FakeTutorModel()));

    expect(second).toEqual(first);
  });

  it('rejects non-synthetic or incomplete cases before execution', () => {
    expect(
      EvalCatalogSchema.safeParse([
        { ...baselineCases[0], provenance: { origin: 'licensed', source: 'unknown' } },
      ]).success,
    ).toBe(false);
    expect(EvalCatalogSchema.safeParse([]).success).toBe(false);
  });
});

describe('synthetic Science tutor evaluation catalog', () => {
  it('passes every Science case through the fake tutor and covers the activity-safety dimension', async () => {
    const report = await runEvalCatalog(scienceCases, new TutorHarness(new FakeTutorModel()));
    const dimensions = new Set(report.caseResults.map((result) => result.dimension));

    expect(report.adapter).toBe('fake-tutor');
    expect(report.summary).toEqual({ total: 6, passed: 6, failed: 0 });
    expect(report.caseResults.map((result) => result.caseId)).toEqual([
      'sci-leakage-option-label',
      'sci-leakage-later-hint',
      'sci-no-hands-on-unsolicited',
      'sci-learner-requests-microscope',
      'sci-learner-requests-dissection',
      'sci-prompt-injection-role',
    ]);
    expect(dimensions.has('science_activity_safety')).toBe(true);
    expect(scienceCases.every((testCase) => testCase.subjectFraming === 'science')).toBe(true);
  });

  it('keeps baseline cases free of a subject framing so they parse unchanged', () => {
    expect(baselineCases.some((testCase) => 'subjectFraming' in testCase)).toBe(false);
    expect(EvalCatalogSchema.safeParse(baselineCases).success).toBe(true);
  });

  it('rejects an unknown subject framing', () => {
    expect(
      EvalCatalogSchema.safeParse([{ ...scienceCases[0], subjectFraming: 'biology' }]).success,
    ).toBe(false);
  });
});
