import { describe, expect, it } from 'vitest';

import baselineCases from '../../evals/cases/baseline.json';
import scienceCases from '../../evals/cases/science.json';
import scienceItemCases from '../../evals/cases/science-items.json';
import allowlist from '../../evals/real-runs/science-items-v1.json';
import { contentCatalog, contentSkillCode } from '../../src/content/catalog';
import { runCappedEval } from '../../src/evaluation/capped-run';
import { runEvalCatalog } from '../../src/evaluation';
import { EvalCatalogSchema } from '../../src/evaluation/schema';
import type { TutorMoveInput } from '../../src/contracts';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';
import { expectedMoveType, type TutorState } from '../../src/tutor/policy';
import { withServedSkillContext } from '../../src/evaluation/served-context';
import { renderMarkdown } from '../../scripts/run-real-eval';

/**
 * SCI6-ITEMS-EVAL: twelve synthetic cases (an early and a later hint after an
 * incorrect attempt) for each of the six real catalog Science items, so a
 * paid real-adapter run can prove hint usability on the items learners
 * actually see. Case text is pinned to the catalog, not hand-copied.
 */

const SCIENCE_ITEM_IDS = [
  'sci6-cell-as-a-system-1',
  'sci6-cell-as-a-system-2',
  'sci6-cell-parts-functions-1',
  'sci6-cell-parts-functions-2',
  'sci6-cells-evidence-of-life-1',
  'sci6-cells-evidence-of-life-2',
];

describe('Science item eval cases (real catalog items)', () => {
  it('parse against the eval schema and are synthetic Science cases', () => {
    expect(EvalCatalogSchema.safeParse(scienceItemCases).success).toBe(true);
    expect(scienceItemCases).toHaveLength(12);
    expect(scienceItemCases.every((testCase) => testCase.subjectFraming === 'science')).toBe(true);
  });

  it('ties every case to its catalog item exactly (prompt, solution, answer, patterns)', () => {
    for (const testCase of scienceItemCases) {
      const item = contentCatalog.find((entry) => entry.id === testCase.problem.contentId);
      expect(item, testCase.id).toBeDefined();
      if (!item || !('deterministicValidator' in item)) throw new Error(testCase.id);
      expect(testCase.problem.prompt).toBe(item.prompt);
      expect(testCase.problem.solutionRepresentation).toBe(item.solutionRepresentation);
      expect(testCase.problem.canonicalAnswer).toBe(item.deterministicValidator.canonicalAnswer);
      const leakage = item.forbiddenLeakagePatterns ?? [];
      const protectedAll = [
        testCase.problem.canonicalAnswer,
        ...testCase.problem.answerEquivalencePatterns,
      ];
      // Every catalog leakage pattern is protected, and nothing extra is invented.
      expect(new Set(protectedAll)).toEqual(
        new Set([item.deterministicValidator.canonicalAnswer, ...leakage]),
      );
      expect(new Set(testCase.forbiddenResponsePatterns)).toEqual(new Set(protectedAll));
      expect(testCase.id).toBe(
        `sci-item-${testCase.problem.contentId}-${testCase.allowedPolicyState === 'hint_1_strategy' ? 'early' : 'later'}`,
      );
    }
  });

  it('binds structured option fields and validates each stated incorrect selection', () => {
    // Fragment of the option text the early learner message says was chosen.
    const stated: Record<string, string> = {
      'sci6-cell-as-a-system-1': 'only the chloroplasts are affected',
      'sci6-cell-as-a-system-2': 'each part works alone',
      'sci6-cell-parts-functions-1': 'keeps the cell stiff',
      'sci6-cell-parts-functions-2': 'nucleus',
      'sci6-cells-evidence-of-life-1': 'green color',
      'sci6-cells-evidence-of-life-2': 'many cells',
    };
    type Field = {
      label: string;
      correctOptionId: string;
      options: { id: string; label: string }[];
    };
    for (const id of SCIENCE_ITEM_IDS) {
      const item = contentCatalog.find((entry) => entry.id === id);
      if (!item || !('deterministicValidator' in item)) throw new Error(id);
      const validator = item.deterministicValidator as unknown as {
        canonicalAnswer: string;
        fields: Field[];
      };
      // The canonical answer is exactly the correct option of every field.
      const rebuilt = validator.fields
        .map(
          (field) =>
            `${field.label}: ${field.options.find((o) => o.id === field.correctOptionId)!.label}`,
        )
        .join('; ');
      expect(rebuilt, id).toBe(validator.canonicalAnswer);
      const early = scienceItemCases.find((c) => c.id === `sci-item-${id}-early`)!;
      const message = early.conversation[0].content.toLowerCase();
      const fragment = stated[id];
      expect(message, id).toContain(fragment);
      const matching = validator.fields.filter((field) =>
        field.options.some((o) => o.label.toLowerCase().includes(fragment)),
      );
      expect(matching.length, id).toBeGreaterThan(0);
      // Incorrect: in at least one matching field the correct option is a different one.
      expect(
        matching.some(
          (field) =>
            !field.options
              .find((o) => o.id === field.correctOptionId)!
              .label.toLowerCase()
              .includes(fragment),
        ),
        id,
      ).toBe(true);
    }
  });

  it('matches the served-route input and state matrix for all 12 cases', async () => {
    // Served route (src/phase1/service.ts getTutorContext + hint/route.ts):
    // state = move type of the last stored interaction, priorHintCount = number of
    // stored interactions, attemptNumber = the attempt's own number, and the
    // provider-visible context is `content:<id>; skill:<code>`.
    function servedState(interactions: number): { state: TutorState; count: number } {
      let state: TutorState = 'awaiting_attempt';
      for (let index = 0; index < interactions; index += 1) {
        state = expectedMoveType({
          state,
          mode: 'math_tutor',
          genuineAttempt: true,
          priorHintCount: index,
          attemptNumber: 1,
        }) as TutorState;
      }
      return { state, count: interactions };
    }
    const seen: TutorMoveInput[] = [];
    const recording = {
      async generateMove(input: TutorMoveInput) {
        seen.push(input);
        return new FakeTutorModel().generateMove(input);
      },
      scoreConstructedResponse: () => Promise.reject(new Error('unused')),
    };
    const skillCodes = new Map(
      scienceItemCases.map((c) => [c.problem.contentId, c.problem.skillCode] as [string, string]),
    );
    const report = await runEvalCatalog(
      scienceItemCases,
      new TutorHarness(withServedSkillContext(recording, skillCodes)),
    );
    expect(report.summary).toEqual({ total: 12, passed: 12, failed: 0 });
    expect(seen).toHaveLength(12);
    for (const [index, testCase] of scienceItemCases.entries()) {
      const item = contentCatalog.find((entry) => entry.id === testCase.problem.contentId)!;
      const early = testCase.id.endsWith('-early');
      const served = servedState(early ? 2 : 3);
      expect(testCase.allowedPolicyState, testCase.id).toBe(served.state);
      expect(testCase.policyContext, testCase.id).toEqual({
        mode: 'math_tutor',
        genuineAttempt: true,
        priorHintCount: served.count,
        attemptNumber: 1,
      });
      expect(testCase.expectedMoveTypes, testCase.id).toEqual([
        early ? 'hint_2_representation' : 'hint_3_subproblem',
      ]);
      expect(testCase.problem.skillCode, testCase.id).toBe(contentSkillCode(item));
      expect(seen[index].redactedSkillContext, testCase.id).toBe(
        `content:${item.id}; skill:${contentSkillCode(item)}`,
      );
      expect(seen[index].prompt, testCase.id).toBe(item.prompt);
      expect(seen[index].subjectFraming, testCase.id).toBe('science');
      expect(seen[index].learnerMessage, testCase.id).toBe(testCase.conversation[0].content);
      expect(seen[index].authorization.allowedMoveTypes, testCase.id).toEqual(
        testCase.expectedMoveTypes,
      );
    }
  });

  it('resolves the allowlist to exactly 12 known cases, two per item, covering all six items', () => {
    const corpus = new Map(
      [...baselineCases, ...scienceCases, ...scienceItemCases].map((testCase) => [
        testCase.id,
        testCase,
      ]),
    );
    expect(allowlist.caseIds).toHaveLength(12);
    expect(new Set(allowlist.caseIds).size).toBe(12);
    const resolved = allowlist.caseIds.map((id) => corpus.get(id));
    expect(resolved.every((testCase) => testCase !== undefined)).toBe(true);
    const items = resolved.map((testCase) => testCase!.problem.contentId);
    expect(new Set(items)).toEqual(new Set(SCIENCE_ITEM_IDS));
    for (const id of SCIENCE_ITEM_IDS) {
      expect(allowlist.caseIds).toContain(`sci-item-${id}-early`);
      expect(allowlist.caseIds).toContain(`sci-item-${id}-later`);
    }
    const ids = [...baselineCases, ...scienceCases, ...scienceItemCases].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are not expected to fall back and are deterministic and passing under the fake tutor', async () => {
    expect(scienceItemCases.every((testCase) => testCase.expectedFallback === false)).toBe(true);
    const first = await runEvalCatalog(scienceItemCases, new TutorHarness(new FakeTutorModel()));
    const second = await runEvalCatalog(scienceItemCases, new TutorHarness(new FakeTutorModel()));
    expect(first.summary).toEqual({ total: 12, passed: 12, failed: 0 });
    expect(first.caseResults.every((result) => result.status !== 'fallback')).toBe(true);
    expect(second).toEqual(first);
  });

  it('reports validated versus fallback per item and flags a recurring fallback loop', async () => {
    let calls = 0;
    const failing = {
      async generateMove() {
        calls += 1;
        throw new Error('provider unavailable');
      },
      async scoreConstructedResponse() {
        throw new Error('unused');
      },
    };
    const report = await runCappedEval(scienceItemCases.slice(0, 2), failing, { maxCalls: 4 });
    expect(calls).toBeLessThanOrEqual(4);
    const map = new Map(
      scienceItemCases.map((testCase) => [testCase.id, testCase.problem.contentId]),
    );
    const text = renderMarkdown(report, 'mock', map);
    expect(text).toContain('Per-item summary');
    expect(text).toContain('sci6-cell-as-a-system-1');
    expect(text).toContain('RECURRING FALLBACK LOOP');
    expect(text).toContain('Outcome: FALLBACK');

    const ok = await runCappedEval(scienceItemCases.slice(0, 2), new FakeTutorModel(), {
      maxCalls: 4,
    });
    const okText = renderMarkdown(ok, 'fake', map);
    expect(okText).toContain('2/2 validated, 0 fallback');
    expect(okText).not.toContain('RECURRING FALLBACK LOOP');
  });
});
