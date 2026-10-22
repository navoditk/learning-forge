/**
 * Test support for the structured response mode (RAT-SCORE-IMPL-CORE).
 * Not a test file (vitest only runs *.test.ts) and not content.
 *
 * Contains, deliberately independent of src/content/structured-response.ts:
 * - the contract 5.2 synthetic fixtures SF-1..SF-5, LF-1 and extra bound
 *   fixtures (every one a complete structured validator);
 * - a REFERENCE classifier and renderer (character scanner, not regexes) that
 *   implements the 2.5 order and 2.5a bounds separately from the scorer, so
 *   the generated expectations are not tautological (contract 5.4);
 * - the kind-specific adversarial vector generator (contract 5.4 families).
 */
import type { StructuredField, StructuredValidator } from '../../src/contracts/content';

export type NumberField = Extract<StructuredField, { kind: 'number' }>;
export type ChoiceField = Extract<StructuredField, { kind: 'choice' }>;
export type Rep = NumberField['representations'][number];

// ---------------------------------------------------------------------------
// Fixtures (contract 5.2). Hand-written canonicalAnswer strings (2.4).
// ---------------------------------------------------------------------------

const ALL_REPS: Rep[] = ['integer', 'decimal', 'fraction', 'mixed-number'];

export function numberField(
  key: string,
  label: string,
  representations: Rep[],
  simplestForm: boolean,
  correctValue: string,
  unitLabel?: string,
): NumberField {
  return {
    key,
    kind: 'number',
    label,
    ...(unitLabel === undefined ? {} : { unitLabel }),
    representations,
    simplestForm,
    correctValue,
  };
}

export function choiceField(
  key: string,
  label: string,
  options: { id: string; label: string }[],
  correctOptionId: string,
): ChoiceField {
  return { key, kind: 'choice', label, options, correctOptionId };
}

export function validatorOf(
  fields: StructuredField[],
  canonicalAnswer: string,
  equivalenceNotes = 'Synthetic fixture equivalence notes.',
): StructuredValidator {
  return {
    type: 'structured',
    responseMode: { id: 'structured-fields', version: '1' },
    canonicalAnswer,
    acceptedAnswers: [canonicalAnswer],
    equivalenceNotes,
    fields,
  };
}

const XYZ = [
  { id: 'x', label: 'Option X' },
  { id: 'y', label: 'Option Y' },
  { id: 'z', label: 'Option Z' },
];

export const SF1 = validatorOf(
  [
    numberField('a', 'Quantity A', ALL_REPS, false, '45', 'units'),
    numberField('b', 'Quantity B', ALL_REPS, false, '9', 'units per group'),
  ],
  'Quantity A: 45 units; Quantity B: 9 units per group',
);
export const SF2 = validatorOf(
  [numberField('r', 'Quantity R', ['fraction', 'mixed-number', 'decimal'], true, '7/2')],
  'Quantity R: 7/2',
);
export const SF3 = validatorOf(
  [
    choiceField('q', 'Choice Q', XYZ, 'y'),
    numberField('n', 'Quantity N', ['integer'], false, '12'),
  ],
  'Choice Q: Option Y; Quantity N: 12',
);
export const SF4 = validatorOf(
  [numberField('p', 'Quantity P', ['decimal', 'fraction'], false, '1/20', 'units per item')],
  'Quantity P: 0.05 units per item',
);
export const SF5 = validatorOf(
  [
    numberField('s', 'Quantity S', ['integer'], false, '5'),
    numberField('t', 'Quantity T', ['fraction'], true, '3/4'),
  ],
  'Quantity S: 5; Quantity T: 3/4',
);
export const LF1 = {
  type: 'numeric' as const,
  canonicalAnswer: '5',
  acceptedAnswers: ['5'],
  equivalenceNotes: 'Synthetic legacy fixture.',
};

/** Extra attainable-maximum and bound fixtures (contract 2.5a, PA-6 positive controls). */
export const MIXED_MAX = validatorOf(
  [numberField('m', 'Mixed maximum', ['mixed-number'], true, '999999999/500000000')],
  'Mixed maximum: 1 499999999/500000000',
);
export const FRACTION_MAX = validatorOf(
  [numberField('f', 'Fraction maximum', ['fraction'], true, '999999999/999999998')],
  'Fraction maximum: 999999999/999999998',
);
export const DECIMAL_MAX = validatorOf(
  [numberField('d', 'Decimal maximum', ['decimal'], false, '999999999/64')],
  'Decimal maximum: 15624999.984375',
);
export const INTEGER_MAX = validatorOf(
  [numberField('i', 'Integer maximum', ['integer'], false, '999999999')],
  'Integer maximum: 999999999',
);
export const EIGHT_OPTIONS = validatorOf(
  [
    choiceField(
      'c',
      'Eight choices',
      ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8'].map((id, index) => ({
        id,
        label: `Choice ${index + 1}`,
      })),
      'o5',
    ),
  ],
  'Eight choices: Choice 5',
);

export const FIXTURES: Record<string, StructuredValidator> = {
  'SF-1': SF1,
  'SF-2': SF2,
  'SF-3': SF3,
  'SF-4': SF4,
  'SF-5': SF5,
  'MIXED-MAX': MIXED_MAX,
  'FRACTION-MAX': FRACTION_MAX,
  'DECIMAL-MAX': DECIMAL_MAX,
  'INTEGER-MAX': INTEGER_MAX,
  'EIGHT-OPTIONS': EIGHT_OPTIONS,
};

/** Declared misconception distractor values per fixture field (G-MC), as exact rationals. */
export const DISTRACTORS: Record<string, Record<string, string[]>> = {
  'SF-1': { a: ['9', '54', '36'], b: ['45', '5'] },
  'SF-2': { r: ['2/7', '4', '5/2'] },
  'SF-3': { n: ['11', '24'] },
  'SF-4': { p: ['1/2', '1/200'] },
  'SF-5': { s: ['6'], t: ['4/3', '3/5'] },
  'MIXED-MAX': { m: ['3/2'] },
  'FRACTION-MAX': { f: ['999999998/999999999'] },
  'DECIMAL-MAX': { d: ['1/2'] },
  'INTEGER-MAX': { i: ['999999998'] },
};

// ---------------------------------------------------------------------------
// Reference classifier (independent of the scorer under test)
// ---------------------------------------------------------------------------

const B = (n: number | string): bigint => BigInt(n);
const isDigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';

export function refTrim(s: string): string {
  const set = [' ', '\t', ' '];
  let lo = 0;
  let hi = s.length;
  while (lo < hi && set.includes(s[lo])) lo++;
  while (hi > lo && set.includes(s[hi - 1])) hi--;
  return s.slice(lo, hi);
}

function run(s: string, from: number): string {
  let i = from;
  while (isDigit(s[i])) i++;
  return s.slice(from, i);
}

/** An INT run: 1-9 digits, no leading zero unless exactly "0". */
const okInt = (r: string): boolean => r.length >= 1 && r.length <= 9 && (r === '0' || r[0] !== '0');

function gcdB(a: bigint, b: bigint): bigint {
  return b === B(0) ? a : gcdB(b, a % b);
}

export interface RefParsed {
  form: Rep;
  num: bigint;
  den: bigint;
  reduced: boolean;
}

function skipSpaces(s: string, from: number): number {
  let i = from;
  while (s[i] === ' ') i++;
  return i;
}

/** Character-scanner parse of an already trimmed string. */
export function refParse(s: string): RefParsed | null {
  const first = run(s, 0);
  if (!okInt(first)) return null;
  let pos = first.length;
  if (pos === s.length) return { form: 'integer', num: B(first), den: B(1), reduced: true };
  if (s[pos] === '.') {
    const frac = run(s, pos + 1);
    if (frac.length < 1 || frac.length > 6 || pos + 1 + frac.length !== s.length) return null;
    return {
      form: 'decimal',
      num: B(first + frac),
      den: B('1' + '0'.repeat(frac.length)),
      reduced: true,
    };
  }
  const afterSpaces = skipSpaces(s, pos);
  const spaces = afterSpaces - pos;
  let numText: string;
  let wholeText: string | null = null;
  if (isDigit(s[afterSpaces])) {
    if (spaces < 1 || first === '0' || first[0] === '0') return null;
    wholeText = first;
    numText = run(s, afterSpaces);
    pos = afterSpaces + numText.length;
    pos = skipSpaces(s, pos);
  } else {
    numText = first;
    pos = afterSpaces;
  }
  if (s[pos] !== '/') return null;
  pos = skipSpaces(s, pos + 1);
  const denText = run(s, pos);
  if (!okInt(denText) || !okInt(numText) || pos + denText.length !== s.length) return null;
  const num = B(numText);
  const den = B(denText);
  if (den === B(0)) return null;
  const reduced = gcdB(num, den) === B(1);
  if (wholeText === null) return { form: 'fraction', num, den, reduced };
  if (num === B(0) || num >= den) return null;
  return { form: 'mixed-number', num: B(wholeText) * den + num, den, reduced };
}

export function refExpressible(rep: Rep, num: bigint, den: bigint): boolean {
  const g = gcdB(num, den);
  const n = num / g;
  const d = den / g;
  if (rep === 'fraction') return true;
  if (rep === 'integer') return d === B(1);
  if (rep === 'mixed-number') return d !== B(1) && n > d;
  let rest = d;
  let twos = 0;
  let fives = 0;
  while (rest % B(2) === B(0)) {
    rest /= B(2);
    twos++;
  }
  while (rest % B(5) === B(0)) {
    rest /= B(5);
    fives++;
  }
  return rest === B(1) && Math.max(twos, fives) <= 6;
}

/** Independent renderer (long division for decimals). */
export function refRender(rep: Rep, num: bigint, den: bigint): string {
  const g = gcdB(num, den);
  const n = num / g;
  const d = den / g;
  if (rep === 'integer') return n.toString();
  if (rep === 'fraction') return `${n}/${d}`;
  if (rep === 'mixed-number') return `${n / d} ${n % d}/${d}`;
  let out = `${n / d}.`;
  let remainder = n % d;
  if (remainder === B(0)) return `${out}0`;
  while (remainder !== B(0)) {
    remainder *= B(10);
    out += (remainder / d).toString();
    remainder %= d;
  }
  return out;
}

export function refValue(field: NumberField): { num: bigint; den: bigint } {
  const [n, d] = field.correctValue.split('/');
  return { num: B(n), den: d === undefined ? B(1) : B(d) };
}

export type RefClass =
  | 'CORRECT'
  | 'INCORRECT'
  | 'REQUIRED'
  | 'TOO_LONG'
  | 'NOT_A_NUMBER'
  | 'FORM_NOT_ALLOWED'
  | 'NOT_AN_OPTION';

export function refClassifyNumber(field: NumberField, raw: string): RefClass {
  const t = refTrim(raw);
  if (t === '') return 'REQUIRED';
  if (raw.length > 32) return 'TOO_LONG';
  const parsed = refParse(t);
  if (!parsed) return 'NOT_A_NUMBER';
  if (!field.representations.includes(parsed.form)) return 'FORM_NOT_ALLOWED';
  const v = refValue(field);
  const equal = parsed.num * v.den === v.num * parsed.den;
  const fractional = parsed.form === 'fraction' || parsed.form === 'mixed-number';
  if (!equal) return 'INCORRECT';
  return field.simplestForm && fractional && !parsed.reduced ? 'INCORRECT' : 'CORRECT';
}

export function refClassifyChoice(field: ChoiceField, raw: string): RefClass {
  if (refTrim(raw) === '') return 'REQUIRED';
  if (!field.options.some((o) => o.id === raw)) return 'NOT_AN_OPTION';
  return raw === field.correctOptionId ? 'CORRECT' : 'INCORRECT';
}

export type Outcome =
  | { kind: 'CORRECT' }
  | { kind: 'INCORRECT' }
  | { kind: 'REFUSED'; code: string; fieldErrors?: { key: string; code: string }[] };

/** Reference evaluation of a structured body's field map against a validator. */
export function refEvaluate(
  validator: StructuredValidator,
  fields: Record<string, unknown>,
): Outcome {
  if (Object.values(fields).some((v) => typeof v !== 'string')) {
    return { kind: 'REFUSED', code: 'INVALID_REQUEST' };
  }
  const errors: { key: string; code: string }[] = [];
  let allCorrect = true;
  for (const f of validator.fields) {
    if (!Object.prototype.hasOwnProperty.call(fields, f.key)) {
      errors.push({ key: f.key, code: 'MISSING_FIELD' });
      continue;
    }
    const raw = fields[f.key] as string;
    const cls = f.kind === 'number' ? refClassifyNumber(f, raw) : refClassifyChoice(f, raw);
    if (cls === 'CORRECT') continue;
    if (cls === 'INCORRECT') allCorrect = false;
    else errors.push({ key: f.key, code: cls });
  }
  const known = validator.fields.map((f) => f.key);
  for (const key of Object.keys(fields).sort()) {
    if (!known.includes(key)) errors.push({ key, code: 'UNKNOWN_FIELD' });
  }
  if (errors.length > 0)
    return { kind: 'REFUSED', code: 'MALFORMED_RESPONSE', fieldErrors: errors };
  return { kind: allCorrect ? 'CORRECT' : 'INCORRECT' };
}

// ---------------------------------------------------------------------------
// Kind-specific adversarial generator (contract 5.4)
// ---------------------------------------------------------------------------

export interface Vector {
  family: string;
  fixture: string;
  /** Field map sent as structuredResponse.fields (values may be non-strings for G-AO array). */
  fields: Record<string, unknown>;
  /** Family-level predicate on the reference outcome. */
  check: (outcome: Outcome) => boolean;
  describe: string;
}

function renderingsOf(field: NumberField): { rep: Rep; text: string }[] {
  const v = refValue(field);
  return field.representations
    .filter((rep) => refExpressible(rep, v.num, v.den))
    .map((rep) => ({ rep, text: refRender(rep, v.num, v.den) }));
}

function correctInput(field: StructuredField): string {
  return field.kind === 'choice' ? field.correctOptionId : renderingsOf(field)[0].text;
}

export function baseFields(validator: StructuredValidator): Record<string, string> {
  return Object.fromEntries(validator.fields.map((f) => [f.key, correctInput(f)]));
}

const isCode =
  (code: string) =>
  (o: Outcome): boolean =>
    o.kind === 'REFUSED' &&
    (o.fieldErrors ?? []).length > 0 &&
    (o.fieldErrors ?? []).every((e) => e.code === code);
const notCorrect = (o: Outcome): boolean => o.kind !== 'CORRECT';
const isKind =
  (kind: 'CORRECT' | 'INCORRECT') =>
  (o: Outcome): boolean =>
    o.kind === kind;

export function generateVectors(
  name: string,
  validator: StructuredValidator,
  distractors: Record<string, string[]> = DISTRACTORS[name] ?? {},
): Vector[] {
  const out: Vector[] = [];
  const base = baseFields(validator);
  const push = (
    family: string,
    fields: Record<string, unknown>,
    check: Vector['check'],
    describe: string,
  ) => out.push({ family, fixture: name, fields, check, describe });
  const one = (key: string, value: unknown) => ({ ...base, [key]: value });

  const fields = validator.fields;
  for (const f of fields) {
    if (f.kind === 'number') {
      const rks = renderingsOf(f);
      const v = refValue(f);
      const other = fields.find((g) => g.key !== f.key);
      const w = other ? correctInput(other) : '7';
      // G-EQ
      for (const { rep, text } of rks) {
        push('G-EQ', one(f.key, text), isKind('CORRECT'), `${f.key} ${text}`);
        push('G-EQ', one(f.key, ` ${text} `), isKind('CORRECT'), `${f.key} padded ${text}`);
        if (rep === 'fraction' && !f.simplestForm) {
          const [n, d] = text.split('/');
          const n2 = B(n) * B(2);
          const d2 = B(d) * B(2);
          if (n2.toString().length <= 9 && d2.toString().length <= 9) {
            push('G-EQ', one(f.key, `${n2}/${d2}`), isKind('CORRECT'), `${f.key} doubled`);
          }
        }
        if (rep === 'decimal' && text.split('.')[1].length < 6) {
          push('G-EQ', one(f.key, `${text}0`), isKind('CORRECT'), `${f.key} trailing zero`);
        }
      }
      for (const { text } of rks) {
        // G-NG
        for (const prefix of ['not ', 'no ', '-', '−', '≠']) {
          push(
            'G-NG',
            one(f.key, prefix + text),
            isCode('NOT_A_NUMBER'),
            `${f.key} ${prefix}${text}`,
          );
        }
        // G-LZ
        push('G-LZ', one(f.key, '0' + text), isCode('NOT_A_NUMBER'), `${f.key} 0${text}`);
        // G-PD
        const padded: string[] = ['1' + text];
        if (/^\d+$/.test(text)) padded.push(text + '0');
        else if (text.includes('.')) {
          padded.push(text.replace('.', '0.'));
          padded.push(text + '01');
        } else if (/^\d+\/\d+$/.test(text)) {
          padded.push(text.replace('/', '0/'));
        } else padded.push(text.replace(' ', '0 '));
        for (const p of padded) {
          const probe = refEvaluate(validator, one(f.key, p));
          if (probe.kind === 'CORRECT') continue; // value equal to v: belongs to G-EQ
          push('G-PD', one(f.key, p), notCorrect, `${f.key} padded ${p}`);
        }
        // G-AO / G-EX
        push('G-AO', one(f.key, `${text} or ${w}`), isNumberTokenRefusal, `${f.key} or`);
        push('G-AO', one(f.key, `${text}, ${w}`), isNumberTokenRefusal, `${f.key} comma`);
        push(
          'G-EX',
          one(f.key, `${text} ${f.unitLabel ?? 'units'}`),
          isNumberTokenRefusal,
          `${f.key} unit text`,
        );
        push('G-EX', one(f.key, `${text}; ${w}`), isNumberTokenRefusal, `${f.key} semicolon`);
        push('G-EX', one(f.key, `${text} and more`), isNumberTokenRefusal, `${f.key} and more`);
      }
      // G-AO v+1
      for (const rep of f.representations) {
        if (refExpressible(rep, v.num + v.den, v.den)) {
          const plus = refRender(rep, v.num + v.den, v.den);
          const first = rks[0].text;
          push('G-AO', one(f.key, `${first} or ${plus}`), isNumberTokenRefusal, `${f.key} or v+1`);
        }
      }
      // G-PB
      const intRk = rks.find((r) => r.rep === 'integer');
      const fracRk = rks.find((r) => r.rep === 'fraction');
      const decRk = rks.find((r) => r.rep === 'decimal');
      if (intRk)
        push('G-PB', one(f.key, intRk.text.padEnd(10, '0')), isCode('NOT_A_NUMBER'), 'ten digits');
      else if (fracRk) {
        const [, d] = fracRk.text.split('/');
        push(
          'G-PB',
          one(f.key, `${'1'.padEnd(10, '0')}/${d}`),
          isCode('NOT_A_NUMBER'),
          'ten digit numerator',
        );
      }
      if (decRk) {
        const [i, fr] = decRk.text.split('.');
        push(
          'G-PB',
          one(f.key, `${i}.${fr.padEnd(7, '0')}`),
          isCode('NOT_A_NUMBER'),
          'seven places',
        );
      } else {
        push('G-PB', one(f.key, '0.0000001'), isCode('NOT_A_NUMBER'), 'seven places');
      }
      for (const { text } of rks) {
        push('G-PB', one(f.key, text.padStart(33, ' ')), isCode('TOO_LONG'), `${f.key} 33 wide`);
      }
      // G-MS
      push('G-MS', { ...base, [f.key]: '' }, isCode('REQUIRED'), `${f.key} empty`);
      push('G-MS', { ...base, [f.key]: '   ' }, isCode('REQUIRED'), `${f.key} blank`);
      // G-FM
      for (const rep of ALL_REPS) {
        if (!f.representations.includes(rep) && refExpressible(rep, v.num, v.den)) {
          push(
            'G-FM',
            one(f.key, refRender(rep, v.num, v.den)),
            isCode('FORM_NOT_ALLOWED'),
            `${f.key} ${rep}`,
          );
        }
      }
      // G-MC
      for (const distractor of distractors[f.key] ?? []) {
        const [dn, dd] = distractor.split('/');
        const num = B(dn);
        const den = dd === undefined ? B(1) : B(dd);
        const renderable = f.representations.filter((rep) => refExpressible(rep, num, den));
        for (const rep of renderable) {
          push(
            'G-MC',
            one(f.key, refRender(rep, num, den)),
            isKind('INCORRECT'),
            `${f.key} distractor ${distractor}`,
          );
        }
      }
    } else {
      push('G-EQ', one(f.key, f.correctOptionId), isKind('CORRECT'), `${f.key} correct id`);
      for (const prefix of ['not ', 'no ']) {
        push(
          'G-NG',
          one(f.key, prefix + f.correctOptionId),
          isCode('NOT_AN_OPTION'),
          `${f.key} ${prefix}`,
        );
      }
      const ids = f.options.map((o) => o.id);
      for (const joined of [ids.join(','), ids.join(', '), ids.join(' ')]) {
        push('G-AO', one(f.key, joined), isCode('NOT_AN_OPTION'), `${f.key} all ${joined}`);
      }
      push(
        'G-AO',
        one(f.key, ids),
        (o) => o.kind === 'REFUSED' && o.code === 'INVALID_REQUEST',
        `${f.key} array`,
      );
      push(
        'G-EX',
        one(f.key, f.correctOptionId + ' and more'),
        isCode('NOT_AN_OPTION'),
        `${f.key} and more`,
      );
      push('G-MS', { ...base, [f.key]: '' }, isCode('REQUIRED'), `${f.key} empty`);
      push('G-MS', { ...base, [f.key]: '   ' }, isCode('REQUIRED'), `${f.key} blank`);
      for (const id of ids.filter((candidate) => candidate !== f.correctOptionId)) {
        push('G-WC', one(f.key, id), isKind('INCORRECT'), `${f.key} wrong ${id}`);
      }
    }
    // G-MS missing key
    const missing = { ...base };
    delete missing[f.key];
    push(
      'G-MS',
      missing,
      (o) => o.kind === 'REFUSED' && (o.fieldErrors ?? []).every((e) => e.code === 'MISSING_FIELD'),
      `${f.key} missing`,
    );
  }
  // G-EX unknown extra key with a valid value
  push('G-EX', { ...base, zz: '1' }, isCode('UNKNOWN_FIELD'), 'unknown key');
  // G-SW
  for (const f of fields) {
    for (const g of fields) {
      if (f.key === g.key || f.kind !== g.kind) continue;
      if (f.kind === 'number' && g.kind === 'number') {
        const vf = refValue(f);
        const vg = refValue(g);
        if (vf.num * vg.den === vg.num * vf.den) continue;
        const into = (target: NumberField, source: NumberField) => {
          const sv = refValue(source);
          const rep = target.representations.find((r) => refExpressible(r, sv.num, sv.den));
          return rep ? refRender(rep, sv.num, sv.den) : renderingsOf(source)[0].text;
        };
        push(
          'G-SW',
          { ...base, [f.key]: into(f, g), [g.key]: into(g, f) },
          (o) =>
            o.kind === 'INCORRECT' ||
            (o.kind === 'REFUSED' &&
              (o.fieldErrors ?? []).every((e) => e.code === 'FORM_NOT_ALLOWED')),
          `swap ${f.key}/${g.key}`,
        );
      } else if (
        f.kind === 'choice' &&
        g.kind === 'choice' &&
        f.correctOptionId !== g.correctOptionId
      ) {
        push(
          'G-SW',
          { ...base, [f.key]: g.correctOptionId, [g.key]: f.correctOptionId },
          (o) =>
            o.kind === 'INCORRECT' ||
            (o.kind === 'REFUSED' &&
              (o.fieldErrors ?? []).every((e) => e.code === 'NOT_AN_OPTION')),
          `swap ${f.key}/${g.key}`,
        );
      }
    }
  }
  return out;
}

const isNumberTokenRefusal = (o: Outcome): boolean =>
  o.kind === 'REFUSED' &&
  (o.fieldErrors ?? []).length > 0 &&
  (o.fieldErrors ?? []).every((e) => e.code === 'NOT_A_NUMBER' || e.code === 'TOO_LONG');
