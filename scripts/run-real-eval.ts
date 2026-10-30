/**
 * Runs an allowlisted subset of the synthetic eval corpus through the real
 * model adapter, under a hard call cap, and writes a human-readable report for
 * the owner's review (ADR-0009): the product owner personally reads the actual
 * generated text (leakage, tone, correctness, safety) before the real adapter
 * is used in any real session.
 *
 * Calling the real Anthropic API costs real money and is a separate owner
 * gate. Without `--confirm-paid` this script only prints a preflight and
 * exits 0 without constructing any provider client. It is not part of
 * `npm test`/CI.
 *
 *   npm run eval:run-real -- --cases <allowlist.json> --max-calls <n> --out <report.md> [--confirm-paid]
 *
 * The script enforces calls and output tokens only. It does not bound input
 * tokens or dollars; any dollar estimate is the owner's own calculation.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { z } from 'zod';

import baselineCases from '../evals/cases/baseline.json';
import scienceCases from '../evals/cases/science.json';
import { runCappedEval, type CappedRunReport } from '../src/evaluation/capped-run';
import { ANTHROPIC_MODEL_ID, AnthropicTutorModel } from '../src/tutor/anthropic-model';

// Mirrors the adapter's constants (not exported there); the CLI test pins them against the adapter source.
export const MATH_TEMPLATE_VERSION = 'anthropic-tutor-prompt-3';
export const SCIENCE_TEMPLATE_VERSION = 'anthropic-tutor-prompt-5-science';
export const MAX_OUTPUT_TOKENS_PER_CALL = 300;

const AllowlistSchema = z
  .object({
    version: z.string().trim().min(1),
    caseIds: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export interface CliIo {
  log(line: string): void;
  error(line: string): void;
  writeFile(path: string, content: string): void;
}

const defaultIo: CliIo = {
  log: (line) => console.log(line),
  error: (line) => console.error(line),
  writeFile: (path, content) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  },
};

interface CliArgs {
  casesPath: string;
  maxCalls: number;
  outPath: string;
  confirmPaid: boolean;
}

function parseArgs(argv: readonly string[]): CliArgs | string {
  const values = new Map<string, string>();
  let confirmPaid = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--confirm-paid') confirmPaid = true;
    else if (arg === '--cases' || arg === '--max-calls' || arg === '--out') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) return `Missing value for ${arg}`;
      values.set(arg, value);
      index += 1;
    } else return `Unknown argument: ${arg}`;
  }
  const casesPath = values.get('--cases');
  const maxCallsText = values.get('--max-calls');
  const outPath = values.get('--out');
  if (!casesPath || !maxCallsText || !outPath) {
    return 'Required: --cases <allowlist.json> --max-calls <n> --out <path>';
  }
  if (!/^[1-9][0-9]*$/.test(maxCallsText)) return '--max-calls must be a positive integer';
  return { casesPath, maxCalls: Number(maxCallsText), outPath, confirmPaid };
}

type CorpusCase = (typeof baselineCases)[number] | (typeof scienceCases)[number];

function selectCases(casesPath: string): { version: string; cases: CorpusCase[] } | string {
  let allowlist: z.infer<typeof AllowlistSchema>;
  try {
    allowlist = AllowlistSchema.parse(JSON.parse(readFileSync(casesPath, 'utf8')));
  } catch {
    return `Could not read a valid allowlist from ${casesPath}`;
  }
  const corpus = new Map<string, CorpusCase>(
    [...baselineCases, ...scienceCases].map((testCase) => [testCase.id, testCase]),
  );
  if (new Set(allowlist.caseIds).size !== allowlist.caseIds.length) {
    return 'Allowlist contains a duplicate case ID';
  }
  const unknown = allowlist.caseIds.filter((id) => !corpus.has(id));
  if (unknown.length > 0) return `Unknown case ID(s): ${unknown.join(', ')}`;
  return { version: allowlist.version, cases: allowlist.caseIds.map((id) => corpus.get(id)!) };
}

export function renderPreflight(args: CliArgs, version: string, cases: readonly CorpusCase[]) {
  return [
    'Real-adapter eval preflight (no provider client constructed)',
    `Allowlist: ${version} (${cases.length} cases)`,
    `Case IDs: ${cases.map((testCase) => testCase.id).join(', ')}`,
    `Model: ${ANTHROPIC_MODEL_ID}`,
    `Template versions: math=${MATH_TEMPLATE_VERSION}, science=${SCIENCE_TEMPLATE_VERSION}`,
    `Maximum HTTP requests: ${args.maxCalls} (SDK maxRetries 0; at most 2 per case)`,
    `Maximum output tokens: ${args.maxCalls * MAX_OUTPUT_TOKENS_PER_CALL} (${args.maxCalls} x ${MAX_OUTPUT_TOKENS_PER_CALL})`,
    "Not bounded by this script: input tokens and dollars. Any dollar estimate is the owner's own calculation.",
    args.confirmPaid
      ? 'Mode: PAID RUN (--confirm-paid given)'
      : 'Mode: preflight only. Add --confirm-paid to make real, paid provider calls.',
  ].join('\n');
}

/**
 * SU-H7-FIX: one line per case listing each attempt's validation outcome as
 * fixed reason codes plus schema paths/codes. No free-form text is rendered.
 */
export function renderAttempts(attempts: CappedRunReport['caseResults'][number]['attempts']) {
  if (attempts.length === 0) return '(no attempt reached validation)';
  return attempts
    .map((attempt) => {
      const detail =
        attempt.status === 'validated'
          ? 'validated'
          : [...attempt.reasons, ...attempt.schemaIssues.map((issue) => `schema ${issue}`)].join(
              ', ',
            );
      return `#${attempt.attempt} ${detail}`;
    })
    .join('; ');
}

export function renderMarkdown(report: CappedRunReport, adapter: string): string {
  const lines: string[] = [];
  lines.push(`# Real-adapter eval report`);
  lines.push('');
  if (report.stopReason) {
    lines.push(
      `> STOPPED: ${report.stopReason}. The call cap (${report.maxCalls}) left too little room to finish. Cases not run: ${report.notRunCaseIds.join(', ') || '(none)'}.`,
    );
    lines.push('');
  }
  lines.push(`Adapter: \`${adapter}\` | Calls made: ${report.calls}/${report.maxCalls}`);
  lines.push(
    `Automated checks: ${report.summary.passed}/${report.summary.total} passed (leakage, forbidden move types, unexpected fallback, trace completeness - NOT a substitute for reading the text below)`,
  );
  lines.push('');
  lines.push(
    '> Automated checks only catch what they were written to catch. Read every response below yourself for tone, age-appropriateness, and anything that feels off, even on cases marked passed. The Science activity check is a finite word list; it does not catch every hands-on suggestion.',
  );
  lines.push('');
  for (const result of report.caseResults) {
    lines.push(`## ${result.caseId}`);
    lines.push('');
    lines.push(
      `- Dimension: \`${result.dimension}\` | Severity: \`${result.severity}\` | Automated: ${result.capInterrupted ? 'CAP_INTERRUPTED' : result.passed ? 'PASSED' : 'FAILED'} | Status: \`${result.status}\``,
    );
    if (result.failures.length > 0) {
      lines.push(`- Automated failures: ${result.failures.join(', ')}`);
    }
    lines.push(`- Move type: \`${result.observedMoveType ?? '(no move returned)'}\``);
    lines.push(`- Validation attempts: ${renderAttempts(result.attempts)}`);
    lines.push('');
    if (result.responseText) {
      lines.push(`**Tutor said:** ${result.responseText.learnerMessage}`);
      lines.push('');
      lines.push(`**Tutor asked:** ${result.responseText.question}`);
    } else {
      lines.push(
        '_(No move text - both attempts failed validation or the call cap was reached, so the harness returned its scripted safe message.)_',
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

export async function runRealEvalCli(
  argv: readonly string[],
  io: CliIo = defaultIo,
): Promise<number> {
  const args = parseArgs(argv);
  if (typeof args === 'string') {
    io.error(args);
    return 2;
  }
  const selected = selectCases(args.casesPath);
  if (typeof selected === 'string') {
    io.error(selected);
    return 2;
  }
  if (args.maxCalls > 2 * selected.cases.length) {
    io.error(`--max-calls ${args.maxCalls} exceeds 2 x ${selected.cases.length} cases`);
    return 2;
  }
  io.log(renderPreflight(args, selected.version, selected.cases));
  if (!args.confirmPaid) return 0;

  const model = new AnthropicTutorModel(undefined, { maxRetries: 0 });
  const report = await runCappedEval(selected.cases, model, { maxCalls: args.maxCalls });
  io.writeFile(args.outPath, renderMarkdown(report, ANTHROPIC_MODEL_ID));
  io.log(`Wrote ${args.outPath}`);
  io.log(
    `Calls: ${report.calls}/${report.maxCalls}. Automated: ${report.summary.passed}/${report.summary.total} passed.`,
  );
  if (report.stopReason) {
    io.log(
      `STOPPED: ${report.stopReason}. Not run: ${report.notRunCaseIds.join(', ') || '(none)'}`,
    );
  }
  if (report.summary.failed > 0) {
    io.log('Automated failures found - read the report before any further review.');
  }
  return report.stopReason || report.summary.failed > 0 ? 1 : 0;
}

if (typeof require !== 'undefined' && require.main === module) {
  runRealEvalCli(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
