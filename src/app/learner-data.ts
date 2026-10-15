import { z } from 'zod';

import { VersionSchema } from '../contracts/common';
import { ContentFigureSchema } from '../contracts/content';
import type { Session } from './components/activity-panel';
import type { DiagnosticPlan, LearnerProgress, Plan, ReviewQueue } from './learner-chapters';

// Runtime shape checks for the read-only responses the learner page renders.
// A response that does not match is treated as an error (never as an empty
// success), so a malformed or unexpected payload cannot render as data.
const SkillProgressSchema = z.object({
  skillCode: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
  status: z.enum(['NOT_STARTED', 'PRACTICING', 'INDEPENDENTLY_CONFIRMED']),
  summary: z.string(),
});

export const LearnerProgressSchema = z.object({
  skills: z.array(SkillProgressSchema),
  recentStrengths: z.array(
    z.object({
      attemptId: z.string(),
      skillCode: z.string(),
      skillTitle: z.string(),
      achievedAt: z.string(),
    }),
  ),
  nextActivity: z
    .object({
      contentId: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      reason: z.string(),
    })
    .nullable(),
}) satisfies z.ZodType<LearnerProgress>;

export const PlanSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      reason: z.string(),
      estimatedMinutes: z.number(),
    }),
  ),
  totalMinutes: z.number(),
  blockedSkills: z.array(z.string()),
  unavailableSkills: z.array(z.string()),
}) satisfies z.ZodType<Plan>;

export const DiagnosticPlanSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
    }),
  ),
}) satisfies z.ZodType<DiagnosticPlan>;

export const ReviewQueueSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      dueSince: z.string(),
    }),
  ),
}) satisfies z.ZodType<ReviewQueue>;

// ---------------------------------------------------------------------------
// Structured response mode (docs/structured-response-scoring-contract.md 3.2).
// Only the public, answer-free field descriptor is accepted. Whether an item
// is structured is decided by the server's responseSpec, never by answer text.
// ---------------------------------------------------------------------------

const REPRESENTATIONS = ['integer', 'decimal', 'fraction', 'mixed-number'] as const;
export type Representation = (typeof REPRESENTATIONS)[number];

const NumberFieldSpecSchema = z
  .object({
    key: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
    kind: z.literal('number'),
    label: z.string().min(1),
    unitLabel: z.string().min(1).optional(),
    representations: z.array(z.enum(REPRESENTATIONS)).min(1).max(4),
    simplestForm: z.boolean(),
  })
  .strict();

const ChoiceFieldSpecSchema = z
  .object({
    key: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
    kind: z.literal('choice'),
    label: z.string().min(1),
    options: z
      .array(
        z
          .object({ id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/), label: z.string().min(1) })
          .strict(),
      )
      .min(2)
      .max(8),
  })
  .strict();

export const ResponseSpecSchema = z
  .object({
    mode: z.literal('structured-fields'),
    modeVersion: z.literal('1'),
    fields: z.array(z.discriminatedUnion('kind', [NumberFieldSpecSchema, ChoiceFieldSpecSchema])),
  })
  .strict()
  .refine((spec) => spec.fields.length >= 1 && spec.fields.length <= 6, {
    message: 'A structured item has 1 to 6 fields.',
  })
  .refine((spec) => new Set(spec.fields.map((field) => field.key)).size === spec.fields.length, {
    message: 'Field keys must be unique.',
  });

export type ResponseSpec = z.infer<typeof ResponseSpecSchema>;
export type ResponseField = ResponseSpec['fields'][number];
export type NumberFieldSpec = Extract<ResponseField, { kind: 'number' }>;

export const FIELD_ERROR_CODES = [
  'UNKNOWN_FIELD',
  'MISSING_FIELD',
  'REQUIRED',
  'TOO_LONG',
  'NOT_A_NUMBER',
  'FORM_NOT_ALLOWED',
  'NOT_AN_OPTION',
] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];
export type FieldErrorEntry = { key: string; code: FieldErrorCode };

const RefusalSchema = z.object({
  reasonCode: z.enum([
    'INVALID_REQUEST',
    'RESPONSE_MODE_MISMATCH',
    'UNSUPPORTED_RESPONSE_MODE',
    'MALFORMED_RESPONSE',
  ]),
  fieldErrors: z
    .array(z.object({ key: z.string(), code: z.enum(FIELD_ERROR_CODES) }))
    .max(12)
    .optional(),
});
export type Refusal = z.infer<typeof RefusalSchema>;

/** Reads a server refusal body; anything else is not a refusal (undefined). */
export function parseRefusal(body: unknown): Refusal | undefined {
  const parsed = RefusalSchema.safeParse(body);
  return parsed.success ? parsed.data : undefined;
}

export type StructuredValues = Record<string, string>;

/** The request body fragment for a structured item (contract 3.1). */
export function buildStructuredResponse(spec: ResponseSpec, values: StructuredValues) {
  const fields: Record<string, string> = {};
  for (const field of spec.fields) fields[field.key] = values[field.key] ?? '';
  return { mode: spec.mode, modeVersion: spec.modeVersion, fields };
}

/**
 * Item-independent completeness check only (no value is judged): a field left
 * empty is reported the way the server would, without sending a request.
 */
export function missingFieldErrors(spec: ResponseSpec, values: StructuredValues) {
  return spec.fields
    .filter((field) => (values[field.key] ?? '').trim() === '')
    .map((field): FieldErrorEntry => ({ key: field.key, code: 'REQUIRED' }));
}

/** Text the tutor hint request carries in place of a single answer string. */
export function summarizeStructuredValues(spec: ResponseSpec, values: StructuredValues): string {
  return spec.fields
    .map((field) => {
      const raw = (values[field.key] ?? '').trim();
      if (field.kind === 'choice') {
        return `${field.label}: ${field.options.find((option) => option.id === raw)?.label ?? ''}`;
      }
      return `${field.label}: ${raw}${field.unitLabel ? ` ${field.unitLabel}` : ''}`;
    })
    .join('; ')
    .slice(0, 1000);
}

/**
 * Virtual-keyboard hint (contract A-3, R-5): a numeric or decimal keypad is
 * not guaranteed to offer "/" or a space, so any fraction or mixed number
 * form needs the full keyboard.
 */
export function numberInputMode(
  representations: readonly Representation[],
): 'numeric' | 'decimal' | 'text' {
  if (representations.some((r) => r === 'fraction' || r === 'mixed-number')) return 'text';
  if (representations.every((r) => r === 'integer')) return 'numeric';
  return 'decimal';
}

const FORM_PHRASES: Record<Representation, string> = {
  integer: 'a whole number',
  decimal: 'a decimal',
  fraction: 'a fraction like 3/4',
  'mixed-number': 'a mixed number like 1 1/2',
};

/** Visible format hint, limited to the enumerated forms (contract A-3). */
export function numberFormatHint(field: NumberFieldSpec): string {
  const forms = REPRESENTATIONS.filter((form) => field.representations.includes(form)).map(
    (form) => FORM_PHRASES[form],
  );
  const list =
    forms.length === 1
      ? forms[0]
      : `${forms.slice(0, -1).join(', ')}, or ${forms[forms.length - 1]}`;
  return `Type ${list}.${field.simplestForm ? ' Write it in simplest form.' : ''}`;
}

/**
 * Learner-facing refusal wording (contract A-6, A-10): format guidance only,
 * never a value, a correctness hint or an echo of what was typed.
 */
export const FIELD_ERROR_MESSAGES = {
  required: 'Enter an answer for this part.',
  tooLong: 'This is too long. Shorten it and try again.',
  notANumber: 'That is not a number we can read.',
  formNotAllowed: 'This way of writing the number is not used here.',
  notAnOption: 'Choose one of the choices.',
  outOfDate: 'This question changed. Reload it and try again.',
  invalidRequest: 'Your answer could not be read. Check it and try again.',
  modeMismatch: 'This question needs to be reloaded before you can answer it.',
  checkFailed: 'The independent check could not be completed. Check your connection and try again.',
  generic: 'That answer could not be submitted. Check your connection and try again.',
  summaryTitle: 'Check your answer',
} as const;

export type StructuredErrorItem = { key?: string; label?: string; message: string };
export type StructuredErrorState = { items: StructuredErrorItem[] };

function fieldMessage(field: ResponseField, code: FieldErrorCode): string {
  switch (code) {
    case 'REQUIRED':
    case 'MISSING_FIELD':
      return FIELD_ERROR_MESSAGES.required;
    case 'TOO_LONG':
      return FIELD_ERROR_MESSAGES.tooLong;
    case 'NOT_AN_OPTION':
      return FIELD_ERROR_MESSAGES.notAnOption;
    case 'NOT_A_NUMBER':
      return field.kind === 'number'
        ? `${FIELD_ERROR_MESSAGES.notANumber} ${numberFormatHint(field)}`
        : FIELD_ERROR_MESSAGES.notANumber;
    case 'FORM_NOT_ALLOWED':
      return field.kind === 'number'
        ? `${FIELD_ERROR_MESSAGES.formNotAllowed} ${numberFormatHint(field)}`
        : FIELD_ERROR_MESSAGES.formNotAllowed;
    default:
      return FIELD_ERROR_MESSAGES.outOfDate;
  }
}

/** Maps field errors (own precheck or a server refusal) onto spec fields. */
export function structuredErrorsFromFields(
  spec: ResponseSpec,
  fieldErrors: readonly FieldErrorEntry[],
): StructuredErrorState {
  const items: StructuredErrorItem[] = [];
  const seen = new Set<string>();
  for (const entry of fieldErrors) {
    const field = spec.fields.find((candidate) => candidate.key === entry.key);
    if (!field) {
      if (!seen.has('*')) items.push({ message: FIELD_ERROR_MESSAGES.outOfDate });
      seen.add('*');
      continue;
    }
    if (seen.has(field.key)) continue;
    seen.add(field.key);
    items.push({ key: field.key, label: field.label, message: fieldMessage(field, entry.code) });
  }
  // Display in authored field order, general messages last.
  const order = (item: StructuredErrorItem) =>
    item.key === undefined ? spec.fields.length : spec.fields.findIndex((f) => f.key === item.key);
  items.sort((a, b) => order(a) - order(b));
  return { items };
}

/** Maps a refusal body (or its absence) to what the learner sees. */
export function structuredErrorsFromRefusal(
  spec: ResponseSpec,
  refusal: Refusal | undefined,
): StructuredErrorState {
  if (!refusal) return { items: [{ message: FIELD_ERROR_MESSAGES.generic }] };
  if (refusal.reasonCode === 'MALFORMED_RESPONSE' && refusal.fieldErrors?.length) {
    return structuredErrorsFromFields(spec, refusal.fieldErrors);
  }
  if (refusal.reasonCode === 'INVALID_REQUEST') {
    return { items: [{ message: FIELD_ERROR_MESSAGES.invalidRequest }] };
  }
  if (refusal.reasonCode === 'MALFORMED_RESPONSE') {
    return { items: [{ message: FIELD_ERROR_MESSAGES.invalidRequest }] };
  }
  return { items: [{ message: FIELD_ERROR_MESSAGES.modeMismatch }] };
}

/** DOM id of the control a summary link should focus for a field. */
export function fieldFocusTargetId(spec: ResponseSpec, key: string): string | undefined {
  const field = spec.fields.find((candidate) => candidate.key === key);
  if (!field) return undefined;
  return field.kind === 'choice' ? `srr-${field.key}-${field.options[0].id}` : `srn-${field.key}`;
}

const RecordedAttemptSchema = z.object({
  attemptId: z.string().min(1),
  correctness: z.string().min(1),
});

// Every field the page or activity panel reads is validated; fields the UI
// never uses are dropped rather than passed through. An optional field may be
// omitted but, when present, must be valid - an invalid figure or recorded
// attempt rejects the whole session so the learner gets a retry, not a guess.
export const SessionSchema = z.object({
  sessionId: z.string().min(1),
  resumed: z.boolean(),
  completed: z.boolean(),
  hintCount: z.number().int().min(0),
  latestAttempt: RecordedAttemptSchema.optional(),
  latestCheck: RecordedAttemptSchema.optional(),
  learner: z.object({ displayName: z.string() }),
  content: z.object({
    id: z.string().min(1),
    version: VersionSchema.optional(),
    title: z.string(),
    skillCode: z.string().min(1),
    prompt: z.string(),
    accessibilityNotes: z.string(),
    figure: ContentFigureSchema.optional(),
    // Structured items only. The descriptor is strict: a payload carrying any
    // key beyond the public allowlist (for example a correct value) rejects
    // the whole session, so an answer-bearing projection can never render.
    responseSpec: ResponseSpecSchema.optional(),
    accessibleAlternative: z.string().optional(),
  }),
}) satisfies z.ZodType<Session>;
