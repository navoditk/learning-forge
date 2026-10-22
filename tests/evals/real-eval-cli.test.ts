import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ create: vi.fn(), constructorArgs: [] as unknown[] }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: sdk.create };
    constructor(options: unknown) {
      sdk.constructorArgs.push(options);
    }
  },
}));

import {
  MATH_TEMPLATE_VERSION,
  MAX_OUTPUT_TOKENS_PER_CALL,
  runRealEvalCli,
  SCIENCE_TEMPLATE_VERSION,
  type CliIo,
} from '../../scripts/run-real-eval';

/**
 * SU-E4b CLI behavior with the Anthropic SDK mocked: no network and no real
 * key. A dummy key exists only in-process for the paid-mode tests.
 */

const ALLOWLIST = 'evals/real-runs/science-framing-v1.json';

function validResponse() {
  return {
    content: [
      {
        type: 'tool_use',
        name: 'provide_tutor_move',
        input: {
          learnerMessage: 'Let’s look at the model together.',
          question: 'What do you notice about this part?',
          safetyFlags: ['none'],
          confidence: 0.6,
        },
      },
    ],
    usage: { input_tokens: 10, output_tokens: 5 },
  };
}

function makeIo() {
  const logs: string[] = [];
  const errors: string[] = [];
  const files = new Map<string, string>();
  const io: CliIo = {
    log: (line) => logs.push(line),
    error: (line) => errors.push(line),
    writeFile: (path, content) => files.set(path, content),
  };
  return { io, logs, errors, files };
}

const savedKey = process.env.ANTHROPIC_API_KEY;

describe('run-real-eval CLI', () => {
  beforeEach(() => {
    sdk.create.mockReset();
    sdk.create.mockResolvedValue(validResponse());
    sdk.constructorArgs.length = 0;
    process.env.ANTHROPIC_API_KEY = 'sk-dummy-in-process-only';
  });

  afterEach(() => {
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = savedKey;
  });

  it('exits non-zero for an unknown case ID before constructing any client', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'real-eval-'));
    const path = join(dir, 'allow.json');
    writeFileSync(path, JSON.stringify({ version: 'x', caseIds: ['leakage-early-hint', 'nope'] }));
    const { io, errors } = makeIo();
    const code = await runRealEvalCli(
      ['--cases', path, '--max-calls', '2', '--out', join(dir, 'r.md'), '--confirm-paid'],
      io,
    );
    expect(code).not.toBe(0);
    expect(errors.join('\n')).toContain('nope');
    expect(sdk.constructorArgs).toHaveLength(0);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it('requires --cases, --max-calls and --out, and keeps the cap within 2 per case', async () => {
    const { io } = makeIo();
    expect(await runRealEvalCli(['--cases', ALLOWLIST, '--max-calls', '24'], io)).not.toBe(0);
    expect(
      await runRealEvalCli(['--cases', ALLOWLIST, '--max-calls', '25', '--out', 'r.md'], io),
    ).not.toBe(0);
    expect(sdk.constructorArgs).toHaveLength(0);
  });

  it('prints the preflight and constructs nothing without --confirm-paid', async () => {
    const { io, logs, files } = makeIo();
    const code = await runRealEvalCli(
      ['--cases', ALLOWLIST, '--max-calls', '24', '--out', 'r.md'],
      io,
    );
    const text = logs.join('\n');
    expect(code).toBe(0);
    expect(sdk.constructorArgs).toHaveLength(0);
    expect(sdk.create).not.toHaveBeenCalled();
    expect(files.size).toBe(0);
    expect(text).toContain('sci-leakage-option-label');
    expect(text).toContain('claude-haiku-4-5-20251001');
    expect(text).toContain(`math=${MATH_TEMPLATE_VERSION}`);
    expect(text).toContain(`science=${SCIENCE_TEMPLATE_VERSION}`);
    expect(text).toContain('Maximum HTTP requests: 24');
    expect(text).toContain('Maximum output tokens: 7200');
  });

  it('keeps the mirrored constants in step with the adapter source', () => {
    const source = readFileSync('src/tutor/anthropic-model.ts', 'utf8');
    expect(source).toContain(`'${MATH_TEMPLATE_VERSION}'`);
    expect(source).toContain(`'${SCIENCE_TEMPLATE_VERSION}'`);
    expect(source).toContain(`max_tokens: ${MAX_OUTPUT_TOKENS_PER_CALL},`);
  });

  it('with --confirm-paid constructs the client with maxRetries 0 and writes the report', async () => {
    const { io, files, logs } = makeIo();
    const code = await runRealEvalCli(
      ['--cases', ALLOWLIST, '--max-calls', '24', '--out', 'r.md', '--confirm-paid'],
      io,
    );
    expect(sdk.constructorArgs).toEqual([{ apiKey: 'sk-dummy-in-process-only', maxRetries: 0 }]);
    expect(sdk.create).toHaveBeenCalledTimes(12);
    expect(
      sdk.create.mock.calls.every(([call]) => (call as { max_tokens: number }).max_tokens === 300),
    ).toBe(true);
    expect(files.get('r.md')).toContain('Automated checks: 12/12 passed');
    expect(files.get('r.md')).not.toContain('STOPPED');
    expect(logs.join('\n')).toContain('Calls: 12/24');
    expect(code).toBe(0);
  });

  it('a stop writes a report with the stop banner and exits non-zero', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'real-eval-'));
    const path = join(dir, 'allow.json');
    writeFileSync(
      path,
      JSON.stringify({ version: 'x', caseIds: ['leakage-early-hint', 'leakage-later-hint'] }),
    );
    // First request has no tool use (invalid), the retry is valid: 2 calls used.
    sdk.create.mockResolvedValueOnce({ content: [], usage: { input_tokens: 1, output_tokens: 1 } });
    const { io, files } = makeIo();
    const code = await runRealEvalCli(
      ['--cases', path, '--max-calls', '3', '--out', 'r.md', '--confirm-paid'],
      io,
    );
    expect(code).not.toBe(0);
    expect(sdk.create).toHaveBeenCalledTimes(2);
    const report = files.get('r.md') ?? '';
    expect(report).toContain('STOPPED: CAP_BEFORE_CASE');
    expect(report).toContain('leakage-later-hint');
  });
});
