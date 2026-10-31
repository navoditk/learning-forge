import { describe, expect, it, vi } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import { runCappedEval } from '../../src/evaluation/capped-run';
import { TutorHarness, type TutorAttemptDiagnostic } from '../../src/tutor';
import {
  MAX_TRIGGER_TOKENS,
  explainRejection,
  renderTriggerToken,
  type RejectionContext,
} from '../../src/tutor/rejection-diagnostics';

/**
 * SCI6-STRUCT-DIAG (D-291) deliverable 1: bounded, local-only trigger tokens
 * for rejected attempts. Never on the learner route, never in the trace.
 */

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];
const EVIDENCE_1 = 'sci6-cells-evidence-of-life-1';

const move = (learnerMessage: string, question = 'What do you notice?') => ({
  moveType: 'hint_2_representation',
  learnerMessage,
  question,
  assistanceLevel: 'multiple_hints_representation',
  expectedResponseForm: 'explanation',
  safetyFlags: ['none'],
  confidence: 0.6,
});

const context = (id = EVIDENCE_1): RejectionContext => ({
  protectedTokens: tokensOf(id),
  problemPrompt: item(id).prompt,
  prohibitedActivityPatterns: [/\bmicroscope\b/iu],
});

const TOKEN =
  /^(?:[a-z0-9']{1,24}|[a-z0-9']{24}~|protected#\d{1,3}|<number-character>|U\+[0-9A-F]{4,6})$/u;

describe('explainRejection', () => {
  it('names the structural trigger tokens per rule', () => {
    expect(
      explainRejection(
        move('Pick the second one, then compare the cells.'),
        ['numeric_expression_detected', 'identifier_alias_detected'],
        context(),
      ),
    ).toEqual([
      { rule: 'numeric_expression_detected', tokens: ['second', 'one'] },
      { rule: 'identifier_alias_detected', tokens: ['cells'] },
    ]);
  });

  it('names a protected answer by index, never by its text', () => {
    const triggers = explainRejection(
      move('Look closely at Sample B.'),
      ['answer_leak_detected', 'standalone_letter_detected'],
      context(),
    );
    expect(triggers[0].rule).toBe('answer_leak_detected');
    expect(triggers[0].tokens.every((token) => /^protected#\d+$/u.test(token))).toBe(true);
    expect(triggers[1]).toEqual({ rule: 'standalone_letter_detected', tokens: ['b'] });
  });

  it('a numeric answer leak lists the number-like tokens of the reply', () => {
    const triggers = explainRejection(
      move('Look at each one: is it built from units?'),
      ['answer_leak_detected'],
      context('sci6-cells-evidence-of-life-2'),
    );
    expect(triggers[0].tokens).toContain('one');
  });

  it('caps the total at five tokens and gives every rule its first token first', () => {
    const triggers = explainRejection(
      move('One two three four five six seven, B and C and sampleb.'),
      ['numeric_expression_detected', 'standalone_letter_detected', 'identifier_alias_detected'],
      context(),
    );
    const all = triggers.flatMap((trigger) => trigger.tokens);
    expect(all.length).toBe(MAX_TRIGGER_TOKENS);
    expect(triggers.map((trigger) => trigger.tokens[0])).toEqual(['one', 'b', 'sampleb']);
    expect(all.every((token) => TOKEN.test(token))).toBe(true);
  });

  it('rev2 (review r1 finding 3): Unicode numeric and letter triggers become code-point markers', () => {
    expect(
      explainRejection(
        move(`Which ${String.fromCharCode(0x0662)}?`),
        ['numeric_expression_detected', 'unsupported_character_detected'],
        context(),
      ),
    ).toEqual([
      { rule: 'numeric_expression_detected', tokens: ['U+0662'] },
      { rule: 'unsupported_character_detected', tokens: ['U+0662'] },
    ]);
    expect(
      explainRejection(
        move(`Look at ${String.fromCharCode(0x0416)}.`),
        ['unsupported_character_detected'],
        context(),
      ),
    ).toEqual([{ rule: 'unsupported_character_detected', tokens: ['U+0436'] }]);
    // An accented confusable inside a word: only the code point, never the word.
    const accented = explainRejection(
      move(`The memb${String.fromCharCode(0x0155)}ane is thin.`),
      ['unsupported_character_detected'],
      context(),
    );
    expect(accented).toEqual([{ rule: 'unsupported_character_detected', tokens: ['U+0155'] }]);
    expect(JSON.stringify(accented)).not.toContain('memb');
  });

  it('renderTriggerToken never drops a token and always returns bounded ASCII', () => {
    expect(renderTriggerToken('second')).toBe('second');
    expect(renderTriggerToken('protected#3')).toBe('protected#3');
    expect(renderTriggerToken('<number-character>')).toBe('<number-character>');
    expect(renderTriggerToken(String.fromCodePoint(0x1d7d0))).toBe('U+1D7D0');
    expect(renderTriggerToken('a'.repeat(40))).toBe(`${'a'.repeat(24)}~`);
    for (const token of ['x', 'é', 'Ⅳ', '٢', '中文', 'a'.repeat(99), "don't"]) {
      expect(renderTriggerToken(token), token).toMatch(TOKEN);
    }
  });

  it('gives no tokens for schema failures or the learner echo rule', () => {
    expect(explainRejection({ learnerMessage: 'x' }, ['invalid_schema'], context())).toEqual([]);
    expect(
      explainRejection(move('Look again at the layer.'), ['learner_echo_detected'], context()),
    ).toEqual([]);
  });

  it('reports the first word of a prohibited activity match', () => {
    expect(
      explainRejection(
        move('Use the microscope at home.'),
        ['prohibited_activity_detected'],
        context(),
      ),
    ).toEqual([{ rule: 'prohibited_activity_detected', tokens: ['microscope'] }]);
  });
});

function scriptedModel(learnerMessage: string) {
  return {
    generateMove: vi.fn(async () => ({
      candidate: move(learnerMessage),
      metadata: {
        modelIdentifier: 'scripted',
        promptTemplateVersion: 'scripted-1',
        latencyMs: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
      },
    })),
    scoreConstructedResponse: vi.fn(),
  };
}

const sessionInput = {
  prompt: item(EVIDENCE_1).prompt,
  learnerMessage: 'Can you give me a hint?',
  redactedSkillContext: 'content:synthetic',
  state: 'hint_1_strategy' as const,
  mode: 'math_tutor' as const,
  genuineAttempt: true,
  priorHintCount: 0,
  attemptNumber: 1,
  subjectFraming: 'science' as const,
  protectedTokens: tokensOf(EVIDENCE_1),
};

describe('harness wiring', () => {
  const text = 'Pick the second one, quickly.';

  it('adds no triggers unless explainRejections is set', async () => {
    const attempts: TutorAttemptDiagnostic[] = [];
    await new TutorHarness(scriptedModel(text), {
      onAttempt: (attempt) => attempts.push(attempt),
    }).respond(sessionInput);
    expect(attempts).toHaveLength(2);
    expect(attempts.every((attempt) => attempt.triggers === undefined)).toBe(true);
  });

  it('with explainRejections, the outcome and trace are unchanged and hold no token', async () => {
    const attempts: TutorAttemptDiagnostic[] = [];
    const plain = await new TutorHarness(scriptedModel(text)).respond(sessionInput);
    const explained = await new TutorHarness(scriptedModel(text), {
      onAttempt: (attempt) => attempts.push(attempt),
      explainRejections: true,
    }).respond(sessionInput);
    expect(attempts[0].triggers).toEqual([
      { rule: 'numeric_expression_detected', tokens: ['second', 'one'] },
    ]);
    const strip = (response: typeof plain) => ({
      ...response,
      trace: { ...response.trace, metadata: { ...response.trace.metadata, traceId: '' } },
    });
    expect(strip(explained)).toEqual(strip(plain));
    const serialized = JSON.stringify(explained);
    expect(serialized).not.toContain('second');
    expect(serialized).not.toContain('triggers');
  });

  it('the capped eval run records triggers only when asked', async () => {
    const [testCase] = (await import('../../evals/cases/science-items.json')).default;
    const off = await runCappedEval([testCase], scriptedModel(text), { maxCalls: 2 });
    expect(off.caseResults[0].attempts.every((attempt) => !attempt.triggers)).toBe(true);
    const on = await runCappedEval([testCase], scriptedModel(text), {
      maxCalls: 2,
      explainRejections: true,
    });
    expect(on.caseResults[0].attempts[0].triggers).toEqual([
      { rule: 'numeric_expression_detected', tokens: ['second', 'one'] },
    ]);
  });
});
