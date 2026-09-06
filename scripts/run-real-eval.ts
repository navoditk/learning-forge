/**
 * Runs the synthetic eval corpus through a real model adapter and writes a
 * human-readable report for the ADR-0009 enablement-gate review: the
 * product owner personally reads the actual generated text (leakage, tone,
 * correctness, safety) before the real adapter is used in any real session.
 *
 * This calls the real Anthropic API and costs real money each run. Not part
 * of `npm test`/CI - run manually: `npm run eval:run-real`.
 */
import { writeFileSync } from 'node:fs';

import baselineCases from '../evals/cases/baseline.json';
import { runEvalCatalog } from '../src/evaluation';
import { AnthropicTutorModel } from '../src/tutor/anthropic-model';
import { TutorHarness } from '../src/tutor/harness';

function renderMarkdown(report: Awaited<ReturnType<typeof runEvalCatalog>>): string {
  const lines: string[] = [];
  lines.push(`# Real-adapter eval report`);
  lines.push('');
  lines.push(`Adapter: \`${report.adapter}\` | Suite: \`${report.suiteVersion}\``);
  lines.push(
    `Automated checks: ${report.summary.passed}/${report.summary.total} passed (leakage, forbidden move types, unexpected fallback, trace completeness - NOT a substitute for reading the text below)`,
  );
  lines.push('');
  lines.push(
    '> Automated checks only catch what they were written to catch. Read every response below yourself for tone, age-appropriateness, and anything that feels off, even on cases marked passed.',
  );
  lines.push('');
  for (const result of report.caseResults) {
    lines.push(`## ${result.caseId}`);
    lines.push('');
    lines.push(
      `- Dimension: \`${result.dimension}\` | Severity: \`${result.severity}\` | Automated: ${result.passed ? 'PASSED' : 'FAILED'} | Status: \`${result.status}\``,
    );
    if (result.failures.length > 0) {
      lines.push(`- Automated failures: ${result.failures.join(', ')}`);
    }
    lines.push(`- Move type: \`${result.observedMoveType ?? '(fallback - no move)'}\``);
    if (result.responseText) {
      lines.push('');
      lines.push(`**Tutor said:** ${result.responseText.learnerMessage}`);
      lines.push('');
      lines.push(`**Tutor asked:** ${result.responseText.question}`);
    } else {
      lines.push('');
      lines.push('_(No move text - the harness fell back to its scripted safe message.)_');
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const harness = new TutorHarness(new AnthropicTutorModel());
  const report = await runEvalCatalog(baselineCases, harness);

  const outPath = process.argv[2] ?? 'real-eval-report.md';
  writeFileSync(outPath, renderMarkdown(report));
  console.log(`Wrote ${outPath}`);
  console.log(`Automated: ${report.summary.passed}/${report.summary.total} passed.`);
  if (report.summary.failed > 0) {
    console.log('Automated failures found - read the report before any further review.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
