import baselineCases from '../../evals/cases/baseline.json';
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
    expect(report.summary).toEqual({ total: 9, passed: 9, failed: 0 });
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
