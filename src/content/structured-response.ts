/**
 * Structured multi-field response mode `structured-fields` version `1`
 * (RAT-SCORE-IMPL-CORE). Pure, deterministic, synchronous mode-1 core:
 * numeral grammar, field classification, scoring, refusal codes, the safe
 * public `responseSpec` projection, canonical rendering, and the stored
 * history envelope.
 *
 * Authority: docs/structured-response-scoring-contract.md (revision 5) sections
 * 2 to 5 and decisions D-154 to D-163. Mode 1 semantics are FROZEN once any
 * item using it is registered (contract 2.1): a change to the set of
 * responses accepted, rejected or refused is a new mode version on new item
 * versions, never an in-place edit of this file.
 *
 * Purity (contract 3.7): no I/O, clock, randomness, network, provider or
 * tutor dependency. The only import is type-only and erased at runtime, and
 * a layer-separation test enforces this boundary. The legacy matcher
 * (src/content/answer-matching.ts) is not imported or edited.
 *
 * Out of scope here (separate packets): route/service wiring, authority and
 * lifecycle preflight (tier 2), persistence, learner UI.
 */
import type {
  DeterministicValidator,
  LegacyDeterministicValidator,
  StructuredField,
  StructuredValidator,
} from '../contracts/content';

export const STRUCTURED_MODE_ID = 'structured-fields';
export const STRUCTURED_MODE_VERSION = '1';

/** Request-layer payload bounds (contract 3.1). Looser than the item bounds. */
export const STRUCTURED_REQUEST_LIMITS = {
  modeMaxLength: 40,
  modeVersionMaxLength: 40,
  fieldKeyMaxLength: 64,
  maxFieldKeys: 12,
  fieldValueMaxLength: 200,
} as const;

/** Item-level numeral limits (contract 2.5, 2.5a). */
export const NUMBER_FIELD_MAX_LENGTH = 32;
// BigInt literals need target ES2020; the repo targets ES2017, so use BigInt().
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const FIVE = BigInt(5);
const TEN = BigInt(10);
const MAX_DECIMAL_PLACES = 6;

export type RefusalCode =
  'INVALID_REQUEST' | 'RESPONSE_MODE_MISMATCH' | 'UNSUPPORTED_RESPONSE_MODE' | 'MALFORMED_RESPONSE';

export type FieldErrorCode =
  | 'UNKNOWN_FIELD'
  | 'MISSING_FIELD'
  | 'REQUIRED'
  | 'TOO_LONG'
  | 'NOT_A_NUMBER'
  | 'FORM_NOT_ALLOWED'
  | 'NOT_AN_OPTION';

export interface FieldError {
  key: string;
  code: FieldErrorCode;
}

/** Recommended HTTP status per refusal code (contract 3.3a tier table). */
export const REFUSAL_HTTP_STATUS: Readonly<Record<RefusalCode, 400 | 422>> = {
  INVALID_REQUEST: 400,
  RESPONSE_MODE_MISMATCH: 422,
  UNSUPPORTED_RESPONSE_MODE: 422,
  MALFORMED_RESPONSE: 422,
};

type Representation = 'integer' | 'decimal' | 'fraction' | 'mixed-number';
type NumberField = Extract<StructuredField, { kind: 'number' }>;
type ChoiceField = Extract<StructuredField, { kind: 'choice' }>;

// ---------------------------------------------------------------------------
// Rational arithmetic (exact, BigInt; never floating point)
// ---------------------------------------------------------------------------

interface Rational {
  num: bigint;
  den: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) {
    [x, y] = [y, x % y];
  }
  return x;
}

function rationalEquals(a: Rational, b: Rational): boolean {
  return a.num * b.den === b.num * a.den;
}

function reduce(value: Rational): Rational {
  const divisor = gcd(value.num, value.den);
  return divisor === ZERO ? value : { num: value.num / divisor, den: value.den / divisor };
}

function renderReduced(value: Rational): string {
  const reduced = reduce(value);
  return reduced.den === ONE ? reduced.num.toString() : `${reduced.num}/${reduced.den}`;
}

// ---------------------------------------------------------------------------
// Numeral grammar (contract 2.5)
// ---------------------------------------------------------------------------

const INT = '(?:0|[1-9][0-9]{0,8})';
const INTEGER_PATTERN = new RegExp(`^(${INT})$`);
const DECIMAL_PATTERN = new RegExp(`^(${INT})\\.([0-9]{1,${MAX_DECIMAL_PLACES}})$`);
const FRACTION_PATTERN = new RegExp(`^(${INT}) *\\/ *(${INT})$`);
const MIXED_PATTERN = new RegExp(`^([1-9][0-9]{0,8}) +(${INT}) *\\/ *(${INT})$`);

/** Leading/trailing ASCII space, tab and U+00A0 only. */
function isTrimChar(char: string): boolean {
  return char === ' ' || char === '\t' || char === ' ';
}

export function trimFieldValue(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && isTrimChar(value[start])) start += 1;
  while (end > start && isTrimChar(value[end - 1])) end -= 1;
  return value.slice(start, end);
}

interface ParsedNumber {
  form: Representation;
  value: Rational;
  /** For fraction and mixed-number input: whether the fraction part is in lowest terms. */
  lowestTerms: boolean;
}

/** Parses an already-trimmed string; null when it is not a mode-1 number in any form. */
function parseNumber(trimmed: string): ParsedNumber | null {
  let match = INTEGER_PATTERN.exec(trimmed);
  if (match) {
    return { form: 'integer', value: { num: BigInt(match[1]), den: ONE }, lowestTerms: true };
  }
  match = DECIMAL_PATTERN.exec(trimmed);
  if (match) {
    return {
      form: 'decimal',
      value: { num: BigInt(match[1] + match[2]), den: TEN ** BigInt(match[2].length) },
      lowestTerms: true,
    };
  }
  match = FRACTION_PATTERN.exec(trimmed);
  if (match) {
    const num = BigInt(match[1]);
    const den = BigInt(match[2]);
    if (den === ZERO) return null;
    return { form: 'fraction', value: { num, den }, lowestTerms: gcd(num, den) === ONE };
  }
  match = MIXED_PATTERN.exec(trimmed);
  if (match) {
    const whole = BigInt(match[1]);
    const num = BigInt(match[2]);
    const den = BigInt(match[3]);
    if (den === ZERO || num === ZERO || num >= den) return null;
    return {
      form: 'mixed-number',
      value: { num: whole * den + num, den },
      lowestTerms: gcd(num, den) === ONE,
    };
  }
  return null;
}

export type NumberClassification =
  | { kind: 'refused'; code: 'REQUIRED' | 'TOO_LONG' | 'NOT_A_NUMBER' | 'FORM_NOT_ALLOWED' }
  | { kind: 'scored'; correct: boolean; trimmed: string; normalized: string };

/**
 * Contract 2.5 fixed classification order for a `number` field string. The
 * first matching step decides. Length is measured in UTF-16 code units, the
 * same unit the request layer uses.
 */
export function classifyNumberField(field: NumberField, raw: string): NumberClassification {
  const trimmed = trimFieldValue(raw);
  if (trimmed.length === 0) return { kind: 'refused', code: 'REQUIRED' };
  if (raw.length > NUMBER_FIELD_MAX_LENGTH) return { kind: 'refused', code: 'TOO_LONG' };
  const parsed = parseNumber(trimmed);
  if (!parsed) return { kind: 'refused', code: 'NOT_A_NUMBER' };
  if (!field.representations.includes(parsed.form)) {
    return { kind: 'refused', code: 'FORM_NOT_ALLOWED' };
  }
  const expected = parseCorrectValue(field.correctValue);
  if (expected === null) {
    // Unreachable for a record that passed load validation; fail closed.
    throw new Error(
      `Invalid structured validator: field "${field.key}" has an invalid correctValue`,
    );
  }
  const needsLowestTerms =
    field.simplestForm && (parsed.form === 'fraction' || parsed.form === 'mixed-number');
  const correct =
    rationalEquals(parsed.value, expected) && (!needsLowestTerms || parsed.lowestTerms);
  return { kind: 'scored', correct, trimmed, normalized: renderReduced(parsed.value) };
}

export type ChoiceClassification =
  | { kind: 'refused'; code: 'REQUIRED' | 'NOT_AN_OPTION' }
  | { kind: 'scored'; correct: boolean; trimmed: string; normalized: string };

/** Contract 2.5: empty is REQUIRED; exact option id is scored; anything else NOT_AN_OPTION. */
export function classifyChoiceField(field: ChoiceField, raw: string): ChoiceClassification {
  if (trimFieldValue(raw).length === 0) return { kind: 'refused', code: 'REQUIRED' };
  if (!field.options.some((option) => option.id === raw)) {
    return { kind: 'refused', code: 'NOT_AN_OPTION' };
  }
  return { kind: 'scored', correct: raw === field.correctOptionId, trimmed: raw, normalized: raw };
}

// ---------------------------------------------------------------------------
// Canonical values and rendering (contract 2.4, 2.5a)
// ---------------------------------------------------------------------------

const CORRECT_INTEGER_PATTERN = /^(?:0|[1-9][0-9]{0,8})$/;
const CORRECT_FRACTION_PATTERN = /^([1-9][0-9]{0,8})\/([1-9][0-9]{0,8})$/;

/**
 * Parses a private `correctValue`: an integer 0 to 999999999, or `n/d` with
 * `1 <= n`, `2 <= d`, both at most nine digits, lowest terms. Null otherwise.
 */
export function parseCorrectValue(text: string): Rational | null {
  if (CORRECT_INTEGER_PATTERN.test(text)) return { num: BigInt(text), den: ONE };
  const match = CORRECT_FRACTION_PATTERN.exec(text);
  if (!match) return null;
  const num = BigInt(match[1]);
  const den = BigInt(match[2]);
  if (den < TWO || gcd(num, den) !== ONE) return null;
  return { num, den };
}

/** Number of fractional digits of a terminating expansion, or null when it does not terminate. */
function terminatingPlaces(value: Rational): number | null {
  let den = reduce(value).den;
  let twos = 0;
  let fives = 0;
  while (den % TWO === ZERO) {
    den /= TWO;
    twos += 1;
  }
  while (den % FIVE === ZERO) {
    den /= FIVE;
    fives += 1;
  }
  return den === ONE ? Math.max(twos, fives) : null;
}

/** Whether a representation's canonical rendering can express `value` (contract 2.5a). */
export function canExpress(representation: Representation, value: Rational): boolean {
  const reduced = reduce(value);
  switch (representation) {
    case 'integer':
      return reduced.den === ONE;
    case 'decimal': {
      const places = terminatingPlaces(reduced);
      return places !== null && places <= MAX_DECIMAL_PLACES;
    }
    case 'fraction':
      return true;
    case 'mixed-number':
      return reduced.den !== ONE && reduced.num > reduced.den;
  }
}

/** Canonical rendering of `value` in `representation` (contract 2.4). */
export function renderCanonical(representation: Representation, value: Rational): string {
  const reduced = reduce(value);
  switch (representation) {
    case 'integer':
      return reduced.num.toString();
    case 'decimal': {
      const places = terminatingPlaces(reduced) ?? 0;
      const scale = TEN ** BigInt(places);
      const scaled = (reduced.num * scale) / reduced.den;
      const integerPart = scaled / scale;
      const fractionDigits = places === 0 ? '0' : (scaled % scale).toString().padStart(places, '0');
      return `${integerPart}.${fractionDigits}`;
    }
    case 'fraction':
      return `${reduced.num}/${reduced.den}`;
    case 'mixed-number': {
      const whole = reduced.num / reduced.den;
      return `${whole} ${reduced.num % reduced.den}/${reduced.den}`;
    }
  }
}

function firstExpressible(field: NumberField, value: Rational): Representation | null {
  return field.representations.find((representation) => canExpress(representation, value)) ?? null;
}

/**
 * Contract 2.4 derived rendering of a validator's answer:
 * `label: rendering[ unitLabel]` per field, in order, joined by `; `. Returns
 * null when some number field has an invalid `correctValue` or no enumerated
 * representation can express it (such a record is rejected at load).
 */
export function deriveCanonicalAnswer(validator: StructuredValidator): string | null {
  const parts: string[] = [];
  for (const field of validator.fields) {
    if (field.kind === 'choice') {
      const option = field.options.find((candidate) => candidate.id === field.correctOptionId);
      if (!option) return null;
      parts.push(`${field.label}: ${option.label}`);
      continue;
    }
    const value = parseCorrectValue(field.correctValue);
    if (!value) return null;
    const representation = firstExpressible(field, value);
    if (!representation) return null;
    const rendering = renderCanonical(representation, value);
    parts.push(`${field.label}: ${rendering}${field.unitLabel ? ` ${field.unitLabel}` : ''}`);
  }
  return parts.join('; ');
}

// ---------------------------------------------------------------------------
// Load-time semantic rules (contract 2.7)
// ---------------------------------------------------------------------------

/**
 * Semantic load rules for a validator that has already passed
 * `StructuredValidatorSchema` (shape, patterns, lengths, counts, uniqueness,
 * selector membership, mode identity, `acceptedAnswers`). Returns every
 * violation; an empty array means the record is satisfiable and loadable.
 * Deterministic and independent of key order.
 */
export function validateStructuredValidatorRules(validator: StructuredValidator): string[] {
  const violations: string[] = [];
  for (const field of validator.fields) {
    if (field.kind === 'choice') {
      if (!field.options.some((option) => option.id === field.correctOptionId)) {
        violations.push(`field "${field.key}" correctOptionId is not among its option ids`);
      }
      continue;
    }
    const value = parseCorrectValue(field.correctValue);
    if (!value) {
      violations.push(
        `field "${field.key}" correctValue must be an integer 0-999999999 or n/d in lowest terms with 1 <= n, 2 <= d, both at most 9 digits`,
      );
      continue;
    }
    if (!field.representations.some((representation) => canExpress(representation, value))) {
      violations.push(
        `field "${field.key}" has no enumerated representation that can express its correctValue`,
      );
    }
    if (field.representations.includes('decimal') && !canExpress('decimal', value)) {
      violations.push(
        `field "${field.key}" enumerates decimal for a value without a terminating expansion of at most 6 places`,
      );
    }
  }
  const derived = deriveCanonicalAnswer(validator);
  if (derived !== null) {
    if (derived.length > 200) {
      violations.push('derived canonicalAnswer exceeds 200 characters');
    }
    if (validator.canonicalAnswer !== derived) {
      violations.push('canonicalAnswer must equal the derived rendering of the fields');
    }
  }
  if (
    validator.acceptedAnswers.length !== 1 ||
    validator.acceptedAnswers[0] !== validator.canonicalAnswer
  ) {
    violations.push('acceptedAnswers must be exactly [canonicalAnswer]');
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Request contract (contract 3.1) and evaluation (contract 3.3, 3.3a tiers 1, 3, 4)
// ---------------------------------------------------------------------------

export function isStructuredValidator(
  validator: DeterministicValidator,
): validator is StructuredValidator {
  return validator.type === 'structured';
}

export interface StructuredResponseRequest {
  mode: string;
  modeVersion: string;
  fields: Record<string, string>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Tier 1: item-independent shape of a `structuredResponse`. Returns the
 * typed request or null when it must be refused as `INVALID_REQUEST`. The
 * object is strict (unknown keys are refused, not stripped).
 */
export function parseStructuredResponseRequest(input: unknown): StructuredResponseRequest | null {
  if (!isPlainObject(input)) return null;
  const keys = Object.keys(input);
  if (
    keys.length !== 3 ||
    !keys.every((key) => key === 'mode' || key === 'modeVersion' || key === 'fields')
  ) {
    return null;
  }
  const { mode, modeVersion, fields } = input;
  if (
    typeof mode !== 'string' ||
    typeof modeVersion !== 'string' ||
    mode.length > STRUCTURED_REQUEST_LIMITS.modeMaxLength ||
    modeVersion.length > STRUCTURED_REQUEST_LIMITS.modeVersionMaxLength
  ) {
    return null;
  }
  if (!isPlainObject(fields)) return null;
  const fieldKeys = Object.keys(fields);
  if (fieldKeys.length > STRUCTURED_REQUEST_LIMITS.maxFieldKeys) return null;
  const copy: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const key of fieldKeys) {
    const value = fields[key];
    if (
      key.length > STRUCTURED_REQUEST_LIMITS.fieldKeyMaxLength ||
      typeof value !== 'string' ||
      value.length > STRUCTURED_REQUEST_LIMITS.fieldValueMaxLength
    ) {
      return null;
    }
    copy[key] = value;
  }
  return { mode, modeVersion, fields: copy };
}

export type StructuredEvaluation =
  | {
      status: 'scored';
      correctness: 'CORRECT' | 'INCORRECT';
      /** S-A envelope with raw trimmed values (contract 4.1). */
      learnerResponse: string;
      /** S-A envelope with normalized values (contract 4.1). */
      normalizedResponse: string;
    }
  | {
      /** Legacy item with a legacy string body: the caller continues on the legacy matcher. */
      status: 'legacy';
      learnerResponse: string;
    }
  | {
      status: 'refused';
      code: RefusalCode;
      /** Present for `MALFORMED_RESPONSE` only. Never carries values, labels or correctness. */
      fieldErrors?: FieldError[];
    };

function refused(code: RefusalCode, fieldErrors?: FieldError[]): StructuredEvaluation {
  return fieldErrors ? { status: 'refused', code, fieldErrors } : { status: 'refused', code };
}

/** Code-unit order, independent of locale. */
function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Pure dispatch plus mode-1 scoring for one submission body, covering tiers
 * 1, 3 and 4 of contract 3.3a (tier 0 and tiers 2 and 5 belong to the route
 * and service). `response` is the response part of the request body:
 * `{ learnerResponse }` xor `{ structuredResponse }`.
 *
 * Deterministic: the outcome depends only on `(validator, response)`, never
 * on request key order, and nothing is written. Refusals reveal only
 * `(responseSpec, response)` facts, never correctness. A legacy item with a
 * legacy body returns `status: 'legacy'` and is scored by the unchanged
 * legacy matcher in the caller.
 */
export function evaluateStructuredSubmission(
  validator: DeterministicValidator | LegacyDeterministicValidator,
  response: unknown,
): StructuredEvaluation {
  // Tier 1: item-independent request shape.
  if (!isPlainObject(response)) return refused('INVALID_REQUEST');
  const hasLegacy = response.learnerResponse !== undefined;
  const hasStructured = response.structuredResponse !== undefined;
  if (hasLegacy === hasStructured) return refused('INVALID_REQUEST');
  const allowedKeys = hasLegacy ? 'learnerResponse' : 'structuredResponse';
  if (Object.keys(response).some((key) => key !== allowedKeys)) {
    return refused('INVALID_REQUEST');
  }
  if (hasLegacy) {
    if (typeof response.learnerResponse !== 'string') return refused('INVALID_REQUEST');
    // Tier 3: a legacy string body for a structured item.
    if (validator.type === 'structured') return refused('RESPONSE_MODE_MISMATCH');
    return { status: 'legacy', learnerResponse: response.learnerResponse };
  }
  const request = parseStructuredResponseRequest(response.structuredResponse);
  if (!request) return refused('INVALID_REQUEST');

  // Tier 3: mode checks against the resolved item.
  if (validator.type !== 'structured') return refused('RESPONSE_MODE_MISMATCH');
  if (request.mode !== STRUCTURED_MODE_ID || request.modeVersion !== STRUCTURED_MODE_VERSION) {
    return refused('UNSUPPORTED_RESPONSE_MODE');
  }

  // Tier 4: field checks, every field's error collected in one refusal.
  const errors: FieldError[] = [];
  const raws: string[] = [];
  const scored: { trimmed: string; normalized: string; correct: boolean }[] = [];
  for (const field of validator.fields) {
    if (!Object.prototype.hasOwnProperty.call(request.fields, field.key)) {
      errors.push({ key: field.key, code: 'MISSING_FIELD' });
      continue;
    }
    const raw = request.fields[field.key];
    raws.push(raw);
    const result =
      field.kind === 'number' ? classifyNumberField(field, raw) : classifyChoiceField(field, raw);
    if (result.kind === 'refused') {
      errors.push({ key: field.key, code: result.code });
    } else {
      scored.push(result);
    }
  }
  const known = new Set(validator.fields.map((field) => field.key));
  for (const key of Object.keys(request.fields).sort(compareKeys)) {
    if (!known.has(key)) errors.push({ key, code: 'UNKNOWN_FIELD' });
  }
  if (errors.length > 0) return refused('MALFORMED_RESPONSE', errors);

  const correctness = scored.every((entry) => entry.correct) ? 'CORRECT' : 'INCORRECT';
  const keys = validator.fields.map((field) => field.key);
  return {
    status: 'scored',
    correctness,
    learnerResponse: buildStructuredEnvelope(
      keys,
      scored.map((entry) => entry.trimmed),
    ),
    normalizedResponse: buildStructuredEnvelope(
      keys,
      scored.map((entry) => entry.normalized),
    ),
  };
}

// ---------------------------------------------------------------------------
// Storage envelope and history interpretation (contract 4.1 S-A, 4.3)
// ---------------------------------------------------------------------------

/**
 * Canonical JSON envelope with fields in item order, no whitespace:
 * `{"mode":"structured-fields","modeVersion":"1","fields":[{"key":..,"value":..}]}`.
 */
export function buildStructuredEnvelope(
  keys: readonly string[],
  values: readonly string[],
): string {
  return JSON.stringify({
    mode: STRUCTURED_MODE_ID,
    modeVersion: STRUCTURED_MODE_VERSION,
    fields: keys.map((key, index) => ({ key, value: values[index] })),
  });
}

export interface StructuredHistoryEntry {
  key: string;
  label: string;
  unitLabel?: string;
  /** The stored value; for a choice field the stored option id. */
  value: string;
  /** Learner-readable text: the option label for a choice, the stored value for a number. */
  display: string;
}

export type HistoryInterpretation =
  /** H-2: a legacy item's row is free text even when it looks like an envelope. */
  | { kind: 'legacy-text'; text: string }
  | { kind: 'structured'; entries: StructuredHistoryEntry[] }
  /** H-3: envelope fails to parse or mode/version/keys differ from the item's. Never rescored. */
  | { kind: 'unreadable'; raw: string };

/**
 * H-2 and H-3: reads a stored `learnerResponse` using the resolved item
 * version, never the stored string, to decide how it is interpreted. Pure
 * and read-only; stored correctness is authoritative and is not touched.
 */
export function interpretStoredResponse(
  validator: DeterministicValidator | LegacyDeterministicValidator,
  stored: string,
): HistoryInterpretation {
  if (validator.type !== 'structured') return { kind: 'legacy-text', text: stored };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return { kind: 'unreadable', raw: stored };
  }
  if (!isPlainObject(parsed) || !Array.isArray(parsed.fields)) {
    return { kind: 'unreadable', raw: stored };
  }
  const entries = parsed.fields as unknown[];
  const keys = validator.fields.map((field) => field.key);
  const values: string[] = [];
  for (const entry of entries) {
    if (!isPlainObject(entry) || typeof entry.value !== 'string') {
      return { kind: 'unreadable', raw: stored };
    }
    values.push(entry.value);
  }
  // Byte-exact canonical form: this also checks mode, version, key set/order and shape.
  if (values.length !== keys.length || buildStructuredEnvelope(keys, values) !== stored) {
    return { kind: 'unreadable', raw: stored };
  }
  return {
    kind: 'structured',
    entries: validator.fields.map((field, index) => {
      const value = values[index];
      const display =
        field.kind === 'choice'
          ? (field.options.find((option) => option.id === value)?.label ?? value)
          : value;
      return {
        key: field.key,
        label: field.label,
        ...(field.kind === 'number' && field.unitLabel ? { unitLabel: field.unitLabel } : {}),
        value,
        display,
      };
    }),
  };
}

export interface StructuredAudit {
  /** True when the re-run scorer reproduces the stored correctness. */
  agrees: boolean;
  recomputed: 'CORRECT' | 'INCORRECT' | 'REFUSED' | 'UNREADABLE';
}

/**
 * H-5: read-only audit that re-runs the frozen mode-1 scorer on a stored
 * envelope and reports (never writes, never corrects) any disagreement with
 * the stored correctness. Stored correctness stays authoritative (H-1).
 */
export function auditStoredStructuredAttempt(
  validator: StructuredValidator,
  storedLearnerResponse: string,
  storedCorrectness: string,
): StructuredAudit {
  const interpreted = interpretStoredResponse(validator, storedLearnerResponse);
  if (interpreted.kind !== 'structured') return { agrees: false, recomputed: 'UNREADABLE' };
  const fields: Record<string, string> = {};
  for (const entry of interpreted.entries) fields[entry.key] = entry.value;
  const result = evaluateStructuredSubmission(validator, {
    structuredResponse: { mode: STRUCTURED_MODE_ID, modeVersion: STRUCTURED_MODE_VERSION, fields },
  });
  if (result.status !== 'scored') return { agrees: false, recomputed: 'REFUSED' };
  return { agrees: result.correctness === storedCorrectness, recomputed: result.correctness };
}

// ---------------------------------------------------------------------------
// Safe public projection (contract 3.2)
// ---------------------------------------------------------------------------

export type PublicResponseSpecField =
  | {
      key: string;
      kind: 'number';
      label: string;
      unitLabel?: string;
      representations: Representation[];
      simplestForm: boolean;
    }
  | {
      key: string;
      kind: 'choice';
      label: string;
      options: { id: string; label: string }[];
    };

export interface PublicResponseSpec {
  mode: typeof STRUCTURED_MODE_ID;
  modeVersion: typeof STRUCTURED_MODE_VERSION;
  fields: PublicResponseSpecField[];
}

/**
 * Builds the learner-facing `responseSpec` by allowlist copy, never by
 * deleting fields from the validator. It never reads `correctValue`,
 * `correctOptionId`, `canonicalAnswer`, `acceptedAnswers` or
 * `equivalenceNotes`, so it is invariant under a change of any private
 * selector. Legacy validators have no `responseSpec` (undefined).
 */
export function projectResponseSpec(
  validator: DeterministicValidator | LegacyDeterministicValidator,
): PublicResponseSpec | undefined {
  if (validator.type !== 'structured') return undefined;
  return {
    mode: STRUCTURED_MODE_ID,
    modeVersion: STRUCTURED_MODE_VERSION,
    fields: validator.fields.map((field): PublicResponseSpecField => {
      if (field.kind === 'choice') {
        return {
          key: field.key,
          kind: 'choice',
          label: field.label,
          options: field.options.map((option) => ({ id: option.id, label: option.label })),
        };
      }
      return {
        key: field.key,
        kind: 'number',
        label: field.label,
        ...(field.unitLabel === undefined ? {} : { unitLabel: field.unitLabel }),
        representations: [...field.representations],
        simplestForm: field.simplestForm,
      };
    }),
  };
}
