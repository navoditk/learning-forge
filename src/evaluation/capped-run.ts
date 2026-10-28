import type { TutorModel, TutorModelResult, TutorMoveInput } from '../contracts';
import { TutorHarness, type TutorAttemptDiagnostic } from '../tutor/harness';
import { runEvalCatalog, type EvalCaseResult } from './runner';

/**
 * Runs eval cases one at a time against a model whose provider calls are
 * counted, enforcing a hard call cap OUTSIDE the harness.
 *
 * The harness catches any error thrown inside `generateMove` (it treats it as
 * a model error, retries once, and returns a fallback only if the retry also
 * fails), so the cap cannot be signalled by an exception. It is observed
 * through the `capBreached` flag instead, and the counter refuses to delegate
 * once the cap would be exceeded. The harness makes at most two
 * `generateMove` calls per case, so reserving two calls before each case
 * means the mid-case branch is a backstop rather than a normal path.
 */

export type CappedStopReason = 'CAP_BEFORE_CASE' | 'CAP_MID_CASE';

export interface CappedCaseResult extends EvalCaseResult {
  /** True when the cap was reached during this case; such a case never counts as passed. */
  capInterrupted: boolean;
  /**
   * SU-H7-FIX: each harness attempt's validation status, fixed reason codes
   * and schema paths/codes, so a fallback is diagnosable from the report.
   * Contains no learner or model free-form text.
   */
  attempts: TutorAttemptDiagnostic[];
}

export interface CappedRunReport {
  caseResults: CappedCaseResult[];
  calls: number;
  maxCalls: number;
  stopReason: CappedStopReason | null;
  notRunCaseIds: string[];
  summary: { total: number; passed: number; failed: number };
}

export interface CappedRunOptions {
  maxCalls: number;
  reservePerCase?: number;
}

export async function runCappedEval(
  cases: readonly { id: string }[],
  model: TutorModel,
  options: CappedRunOptions,
): Promise<CappedRunReport> {
  const { maxCalls, reservePerCase = 2 } = options;
  if (!Number.isInteger(maxCalls) || maxCalls < 1)
    throw new Error('maxCalls must be a positive integer');
  if (!Number.isInteger(reservePerCase) || reservePerCase < 1) {
    throw new Error('reservePerCase must be a positive integer');
  }

  let calls = 0;
  let capBreached = false;
  const counter: TutorModel = {
    async generateMove(input: TutorMoveInput): Promise<TutorModelResult> {
      if (calls + 1 > maxCalls) {
        capBreached = true;
        throw new Error('Eval call cap reached');
      }
      calls += 1;
      return model.generateMove(input);
    },
    async scoreConstructedResponse(): Promise<TutorModelResult> {
      // Scoring is not part of the tutor eval; never reach the provider from here.
      capBreached = true;
      throw new Error('Scoring is not available in a capped eval run');
    },
  };

  const caseResults: CappedCaseResult[] = [];
  let stopReason: CappedStopReason | null = null;
  let notRunCaseIds: string[] = [];

  for (const [index, testCase] of cases.entries()) {
    if (maxCalls - calls < reservePerCase) {
      stopReason = 'CAP_BEFORE_CASE';
      notRunCaseIds = cases.slice(index).map((entry) => entry.id);
      break;
    }
    const attempts: TutorAttemptDiagnostic[] = [];
    const harness = new TutorHarness(counter, {
      onAttempt: (diagnostic) => attempts.push(diagnostic),
    });
    const report = await runEvalCatalog([testCase], harness);
    const [result] = report.caseResults;
    if (capBreached) {
      caseResults.push({ ...result, passed: false, capInterrupted: true, attempts });
      stopReason = 'CAP_MID_CASE';
      notRunCaseIds = cases.slice(index + 1).map((entry) => entry.id);
      break;
    }
    caseResults.push({ ...result, capInterrupted: false, attempts });
  }

  const passed = caseResults.filter((result) => result.passed && !result.capInterrupted).length;
  return {
    caseResults,
    calls,
    maxCalls,
    stopReason,
    notRunCaseIds,
    summary: { total: caseResults.length, passed, failed: caseResults.length - passed },
  };
}
