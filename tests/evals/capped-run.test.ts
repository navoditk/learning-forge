import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import baselineCases from '../../evals/cases/baseline.json';
import scienceCases from '../../evals/cases/science.json';
import allowlist from '../../evals/real-runs/science-framing-v1.json';
import type { TutorModel, TutorModelResult, TutorMoveInput } from '../../src/contracts';
import { runCappedEval } from '../../src/evaluation/capped-run';
import { FakeTutorModel } from '../../src/tutor';

/**
 * SU-E4b: the call cap is enforced outside the harness and observed through
 * the counter, not through an exception (the harness swallows model errors).
 * Stub model only: no SDK, no network.
 */

const corpus = [...baselineCases, ...scienceCases];
const allowed = allowlist.caseIds.map((id) => corpus.find((testCase) => testCase.id === id)!);

/** Delegates to the deterministic fake, but returns an invalid candidate where scripted. */
class ScriptedModel implements TutorModel {
  reached = 0;
  private readonly fake = new FakeTutorModel();
  constructor(private readonly script: readonly ('valid' | 'invalid')[] = []) {}

  async generateMove(input: TutorMoveInput): Promise<TutorModelResult> {
    const step = this.script[this.reached] ?? 'valid';
    this.reached += 1;
    const result = await this.fake.generateMove(input);
    return step === 'invalid' ? { ...result, candidate: { moveType: 'not-a-move' } } : result;
  }

  scoreConstructedResponse(): Promise<TutorModelResult> {
    return this.fake.scoreConstructedResponse();
  }
}

// Hashes of the reviewed versions: runner.ts from SU-E4 rev2
// (su-e4/rev2/file-hashes.sha256); harness.ts re-pinned by SU-H7-FIX rev1
// (optional attempt-diagnostics observer and the learner-echo context) and by
// SU-H7-FIX2 rev1 (Science answer-word context passed to validateTutorMove)
// and by SCI6-STRUCT-DIAG rev1 (opt-in `explainRejections` trigger tokens on
// the attempt diagnostic; observer-only, outcome and trace unchanged).
const REV2_HASHES: Record<string, string> = {
  'src/tutor/harness.ts': 'b1582a16b1714b41159bf8584474c8d5c5734289132aa6e9b0ac4018710da8ed',
  'src/evaluation/runner.ts': 'a09607816af021b575753d49c16ae78ad2e9bda935ad096d6018e42101de162f',
};

describe('runCappedEval', () => {
  it('test 1: a complete run with cap 24 over the 12-case allowlist makes 12 calls', async () => {
    expect(allowed).toHaveLength(12);
    const model = new ScriptedModel();
    const report = await runCappedEval(allowed, model, { maxCalls: 24 });
    expect(report.caseResults).toHaveLength(12);
    expect(report.stopReason).toBeNull();
    expect(report.notRunCaseIds).toEqual([]);
    expect(report.calls).toBe(12);
    expect(model.reached).toBe(12);
    expect(report.summary).toEqual({ total: 12, passed: 12, failed: 0 });
  });

  it('test 2: stops before a later case when the remaining calls cannot cover its reserve', async () => {
    const model = new ScriptedModel(['invalid', 'valid']);
    const report = await runCappedEval(allowed.slice(0, 3), model, { maxCalls: 3 });
    expect(report.stopReason).toBe('CAP_BEFORE_CASE');
    expect(report.caseResults).toHaveLength(1);
    expect(report.caseResults[0].status).toBe('repaired');
    expect(report.caseResults[0].capInterrupted).toBe(false);
    expect(report.notRunCaseIds).toEqual([allowed[1].id, allowed[2].id]);
    expect(report.calls).toBe(2);
    expect(model.reached).toBe(2);
  });

  it('test 3: blocks the call that would pass the cap and marks the case interrupted', async () => {
    const model = new ScriptedModel(['invalid']);
    const report = await runCappedEval(allowed.slice(0, 2), model, {
      maxCalls: 1,
      reservePerCase: 1,
    });
    expect(report.stopReason).toBe('CAP_MID_CASE');
    expect(report.caseResults).toHaveLength(1);
    expect(report.caseResults[0].capInterrupted).toBe(true);
    expect(report.caseResults[0].passed).toBe(false);
    expect(report.caseResults[0].status).toBe('fallback');
    expect(report.summary).toEqual({ total: 1, passed: 0, failed: 1 });
    expect(report.notRunCaseIds).toEqual([allowed[1].id]);
    expect(report.calls).toBe(1);
    expect(model.reached).toBe(1);
  });

  it('rejects a non-positive cap', async () => {
    await expect(runCappedEval(allowed, new ScriptedModel(), { maxCalls: 0 })).rejects.toThrow();
  });

  it('test 4: harness.ts and runner.ts are byte-identical to their reviewed versions', () => {
    for (const [path, expected] of Object.entries(REV2_HASHES)) {
      const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
      expect(actual, path).toBe(expected);
    }
  });
});
