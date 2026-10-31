import { containsProtectedAnswer } from '../contracts/answer-leakage';
import { rebuildsAnswerOption } from '../contracts/answer-selection';
import { NUMBER_WORD_VOCABULARY } from '../contracts/number-words';
import { scienceStructureTriggers, structureTokens } from '../contracts/science-structure';
import { protectedAnswerStems, stemWord } from '../contracts/semantic-leakage';
import { TutorMoveOutputSchema } from '../contracts/tutor';

/**
 * SCI6-STRUCT-DIAG (D-291): local-only rejection diagnostics for the
 * real-adapter eval report. For a rejected attempt it names, per reason code,
 * the single canonical tokens that triggered the rejection.
 *
 * Bounds and privacy:
 * - at most MAX_TRIGGER_TOKENS tokens per attempt in total, each a single
 *   token of at most MAX_TOKEN_LENGTH characters from [a-z0-9'], so full
 *   text can never be reconstructed. rev2 (review r1 finding 3): a token is
 *   never dropped. One with a character outside [a-z0-9'] (a Unicode digit
 *   or letter) is shown as the ASCII code point of its first such character
 *   ("U+0662"); an over-long ASCII token is cut to MAX_TOKEN_LENGTH
 *   characters plus "~";
 * - tokens come from the model reply only; the learner_echo rule (which would
 *   expose learner text) and schema failures get no tokens;
 * - protected answers are named by index ("protected#2"), never by text;
 * - computed only when a TutorHarness is built with `explainRejections`
 *   (the capped eval run). The learner route never sets it, and the trace
 *   record is built from model metadata alone, so tokens never reach
 *   persisted traces or production logs.
 */

export const MAX_TRIGGER_TOKENS = 5;
export const MAX_TOKEN_LENGTH = 24;

export interface RejectionTrigger {
  rule: string;
  tokens: string[];
}

export interface RejectionContext {
  protectedTokens: readonly string[];
  problemPrompt: string;
  prohibitedActivityPatterns: readonly RegExp[];
}

const MARKER = /^(?:protected#\d{1,3}|<number-character>)$/u;
const PLAIN = new RegExp(`^[a-z0-9']{1,${MAX_TOKEN_LENGTH}}$`, 'u');

/** A bounded ASCII rendering of one trigger token (never empty, never dropped). */
export function renderTriggerToken(token: string): string {
  if (PLAIN.test(token) || MARKER.test(token)) return token;
  const unsupported = [...token].find((character) => !/[a-z0-9']/u.test(character));
  if (unsupported !== undefined) {
    return `U+${unsupported.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  return `${token.slice(0, MAX_TOKEN_LENGTH)}~`;
}

function numberLikeTokens(text: string): string[] {
  return structureTokens(text).filter(
    (token) => /\d/u.test(token) || NUMBER_WORD_VOCABULARY.has(token.replace(/'s$/u, '')),
  );
}

function protectedIndexes(
  text: string,
  protectedTokens: readonly string[],
  matches: (text: string, token: string) => boolean,
): string[] {
  return protectedTokens.flatMap((token, index) =>
    matches(text, token) ? [`protected#${index}`] : [],
  );
}

function candidateTokensByRule(
  rule: string,
  learnerMessage: string,
  question: string,
  context: RejectionContext,
): string[] {
  const text = `${learnerMessage} ${question}`;
  switch (rule) {
    case 'standalone_letter_detected':
    case 'numeric_expression_detected':
    case 'identifier_alias_detected':
    case 'unsupported_character_detected':
      return scienceStructureTriggers(learnerMessage, question)
        .filter((trigger) => trigger.rule === rule)
        .map((trigger) => trigger.token);
    case 'answer_leak_detected': {
      const indexes = protectedIndexes(text, context.protectedTokens, (value, token) =>
        containsProtectedAnswer(value, [token]),
      );
      const literal = context.protectedTokens.some(
        (token) =>
          token.trim() && text.toLocaleLowerCase().includes(token.trim().toLocaleLowerCase()),
      );
      return literal ? indexes : [...indexes, ...numberLikeTokens(text)];
    }
    case 'answer_word_leak_detected': {
      const stems = protectedAnswerStems(context.protectedTokens, context.problemPrompt);
      return structureTokens(text).filter((token) => stems.has(stemWord(token)));
    }
    case 'answer_selection_detected':
      return protectedIndexes(text, context.protectedTokens, (value, token) =>
        rebuildsAnswerOption(value, [token]),
      );
    case 'prohibited_activity_detected':
      return context.prohibitedActivityPatterns.flatMap((pattern) => {
        const match = new RegExp(pattern.source, pattern.flags.replace('g', '')).exec(text);
        return match ? structureTokens(match[0]).slice(0, 1) : [];
      });
    default:
      return [];
  }
}

/**
 * Bounded trigger tokens for a rejected candidate. Every listed reason gets
 * its first token before any reason gets a second, so one noisy rule cannot
 * hide another; the total never exceeds MAX_TRIGGER_TOKENS.
 */
export function explainRejection(
  candidate: unknown,
  reasons: readonly string[],
  context: RejectionContext,
): RejectionTrigger[] {
  const parsed = TutorMoveOutputSchema.safeParse(candidate);
  if (!parsed.success) return [];
  const { learnerMessage, question } = parsed.data;
  const pools = reasons.map((rule) => {
    const tokens = candidateTokensByRule(rule, learnerMessage, question, context).map(
      renderTriggerToken,
    );
    return { rule, tokens: [...new Set(tokens)] };
  });
  const chosen = pools.map(({ rule }) => ({ rule, tokens: [] as string[] }));
  let total = 0;
  for (let round = 0; total < MAX_TRIGGER_TOKENS; round += 1) {
    let added = false;
    for (const [index, pool] of pools.entries()) {
      if (total >= MAX_TRIGGER_TOKENS) break;
      const token = pool.tokens[round];
      if (token === undefined) continue;
      chosen[index].tokens.push(token);
      total += 1;
      added = true;
    }
    if (!added) break;
  }
  return chosen.filter((trigger) => trigger.tokens.length > 0);
}
