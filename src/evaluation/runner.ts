import { TutorHarness } from '../tutor';
import { EvalCatalogSchema, EvalCase } from './schema';

export interface EvalCaseResult {
  caseId: string;
  dimension: EvalCase['dimension'];
  severity: EvalCase['severity'];
  passed: boolean;
  status: 'validated' | 'repaired' | 'fallback';
  observedMoveType?: string;
  observedState: string;
  policyVersion: string;
  modelIdentifier: string;
  /** The actual generated text, for a human to read during eval review (ADR-0009). Absent on fallback. */
  responseText?: { learnerMessage: string; question: string };
  failures: string[];
}

export interface EvalReport {
  suiteVersion: string;
  adapter: string;
  calibratedThresholds: false;
  caseResults: EvalCaseResult[];
  summary: { total: number; passed: number; failed: number };
}

function lastLearnerMessage(testCase: EvalCase): string {
  return (
    [...testCase.conversation].reverse().find((entry) => entry.role === 'learner')?.content ?? ''
  );
}

export async function runEvalCatalog(
  rawCases: readonly unknown[],
  harness: TutorHarness,
): Promise<EvalReport> {
  const cases = EvalCatalogSchema.parse(rawCases) as EvalCase[];
  const caseResults: EvalCaseResult[] = [];

  for (const testCase of cases) {
    const response = await harness.respond({
      prompt: testCase.problem.prompt,
      learnerMessage: lastLearnerMessage(testCase),
      redactedSkillContext: `content:${testCase.problem.contentId}; history:${testCase.learnerHistory.length} synthetic entries`,
      state: testCase.allowedPolicyState,
      ...testCase.policyContext,
      protectedTokens: [
        testCase.problem.canonicalAnswer,
        ...testCase.problem.answerEquivalencePatterns,
      ],
    });
    const responseText = `${response.move?.learnerMessage ?? ''} ${response.move?.question ?? ''}`;
    const failures: string[] = [];
    if ((response.status === 'fallback') !== testCase.expectedFallback) {
      failures.push('unexpected fallback status');
    }
    if (response.move && !testCase.expectedMoveTypes.includes(response.move.moveType)) {
      failures.push('move type was not expected');
    }
    if (response.move && testCase.forbiddenMoveTypes.includes(response.move.moveType)) {
      failures.push('forbidden move type returned');
    }
    if (response.masteryAdvanced) {
      failures.push('mastery advanced during a fake tutor evaluation');
    }
    for (const pattern of testCase.forbiddenResponsePatterns) {
      if (responseText.toLocaleLowerCase().includes(pattern.toLocaleLowerCase())) {
        failures.push(`forbidden response pattern: ${pattern}`);
      }
    }
    if (
      response.trace.metadata.policyVersion.length === 0 ||
      response.trace.metadata.modelIdentifier.length === 0
    ) {
      failures.push('trace is missing policy or model identity');
    }
    if (response.trace.redactedExcerpt !== '[redacted learner text]') {
      failures.push('learner text was not redacted in the trace');
    }
    caseResults.push({
      caseId: testCase.id,
      dimension: testCase.dimension,
      severity: testCase.severity,
      passed: failures.length === 0,
      status: response.status,
      observedMoveType: response.move?.moveType,
      observedState: response.nextState,
      policyVersion: response.trace.metadata.policyVersion,
      modelIdentifier: response.trace.metadata.modelIdentifier,
      responseText: response.move
        ? { learnerMessage: response.move.learnerMessage, question: response.move.question }
        : undefined,
      failures,
    });
  }

  const passed = caseResults.filter((result) => result.passed).length;
  return {
    suiteVersion: 'baseline-1',
    adapter: caseResults[0]?.modelIdentifier ?? 'unknown',
    calibratedThresholds: false,
    caseResults,
    summary: { total: caseResults.length, passed, failed: caseResults.length - passed },
  };
}
