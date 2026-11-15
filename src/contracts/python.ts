import { z } from 'zod';

import { listingStringValues, pythonOutputListingViolationsFromScan } from './python-scan';

/**
 * Python intro authoring contract (PYTHON-IMPLEMENT; dossier
 * python-intro-grade-6-authoring-prerequisites-20261010 sections 5.1 and 5.2;
 * owner decisions D-321 and D-322).
 *
 * Nothing here executes code. The listing lints are curriculum-scope checks,
 * not a safety boundary: every item is scored by deterministic comparison
 * against an authored, human-verified output (src/content/python-output.ts).
 */

export const PYTHON_PROGRAM_CODE = 'python-intro-grade-6';
export const PYTHON_SKILL_PREFIX = 'py6-';

/** H2 (D-322): the single pinned CPython minor version. */
export const PYTHON_LANGUAGE_VERSION = '3.14';

/** Program pins a code listing must match (section 5.1). */
export const PROGRAM_LANGUAGE_PINS: Readonly<
  Record<string, { language: 'python'; languageVersion: string }>
> = {
  [PYTHON_PROGRAM_CODE]: { language: 'python', languageVersion: PYTHON_LANGUAGE_VERSION },
};

export const CODE_LISTING_LIMITS = { maxLines: 20, maxLineLength: 60 } as const;
export const PYTHON_OUTPUT_LIMITS = {
  maxCanonicalLines: 8,
  maxCanonicalLength: 500,
  maxResponseCodeUnits: 1000,
  maxResponseLines: 20,
} as const;

/** Tokens a listing may not use unless a later approved skill allowlist permits one. */
const DENYLIST: readonly { label: string; pattern: RegExp }[] = [
  { label: 'import', pattern: /\bimport\b/ },
  { label: 'eval', pattern: /\beval\b/ },
  { label: 'exec', pattern: /\bexec\b/ },
  { label: 'open', pattern: /\bopen\b/ },
  { label: '__', pattern: /__/ },
  { label: 'os.', pattern: /\bos\./ },
  { label: 'subprocess', pattern: /subprocess/ },
  { label: 'input(', pattern: /\binput\s*\(/ },
  { label: 'while True', pattern: /\bwhile\s+True\b/ },
];

/** Static lints for a listing source. Returns one message per violation. */
export function codeListingSourceViolations(source: string): string[] {
  const violations: string[] = [];
  if (source.includes('\r')) violations.push('source must use LF line endings only');
  if (source.includes('\t')) violations.push('source must not contain tabs');
  if (/[^\n\r\t\x20-\x7e]/.test(source)) {
    violations.push('source must be printable ASCII (no control or non-ASCII characters)');
  }
  if (source.startsWith('\n') || source.endsWith('\n')) {
    violations.push('source must not start or end with a blank line');
  }
  const lines = source.split('\n');
  if (lines.length > CODE_LISTING_LIMITS.maxLines) {
    violations.push(`source must be at most ${CODE_LISTING_LIMITS.maxLines} lines`);
  }
  lines.forEach((line, index) => {
    const label = `line ${index + 1}`;
    if (line.length > CODE_LISTING_LIMITS.maxLineLength) {
      violations.push(`${label} exceeds ${CODE_LISTING_LIMITS.maxLineLength} characters`);
    }
    if (/[ \t]+$/.test(line)) violations.push(`${label} has trailing whitespace`);
    const indent = /^ */.exec(line)?.[0].length ?? 0;
    if (line.trim() !== '' && indent % 4 !== 0) {
      violations.push(`${label} indentation must be a multiple of four spaces`);
    }
  });
  for (const { label, pattern } of DENYLIST) {
    if (pattern.test(source)) violations.push(`source must not use "${label}"`);
  }
  return violations;
}

export const CodeListingSchema = z
  .object({
    language: z.literal('python'),
    // Must equal the program pin (section 5.1); a mismatch is rejected here
    // and re-checked against the registry pin at catalog load.
    languageVersion: z.literal(PYTHON_LANGUAGE_VERSION),
    source: z.string().min(1).max(1500),
    showLineNumbers: z.boolean(),
    structureDescription: z.string().trim().min(1).max(500),
  })
  .strict()
  .superRefine((listing, context) => {
    for (const message of codeListingSourceViolations(listing.source)) {
      context.addIssue({ code: 'custom', path: ['source'], message });
    }
  });

export type CodeListing = z.infer<typeof CodeListingSchema>;

/**
 * Authoring constraints for a `python_output` canonical answer (section 5.2):
 * the listing's exact standard output with its single final line terminator
 * removed. 1 to 8 nonempty lines of printable ASCII, no leading, trailing or
 * doubled spaces, and no float representation artefacts.
 */
export function pythonOutputCanonicalViolations(canonical: string): string[] {
  const violations: string[] = [];
  if (canonical.length === 0) return ['canonical output must not be empty'];
  if (/[^\n\x20-\x7e]/.test(canonical)) {
    violations.push('canonical output must be printable ASCII with LF line separators');
  }
  const lines = canonical.split('\n');
  if (lines.length > PYTHON_OUTPUT_LIMITS.maxCanonicalLines) {
    violations.push(
      `canonical output must be at most ${PYTHON_OUTPUT_LIMITS.maxCanonicalLines} lines`,
    );
  }
  lines.forEach((line, index) => {
    const label = `output line ${index + 1}`;
    if (line.length === 0) violations.push(`${label} must not be blank`);
    if (/^ | $/.test(line)) violations.push(`${label} must not have leading or trailing spaces`);
    if (/ {2,}/.test(line)) violations.push(`${label} must not contain consecutive spaces`);
    if (/\d\.\d*(?:0{6,}|9{6,})\d*/.test(line)) {
      violations.push(`${label} looks like a float representation artefact`);
    }
  });
  return violations;
}

/**
 * A `python_output` listing must match the positive allowlist grammar in
 * `python-scan.ts` (dossier section 8, in scope); every excluded construct
 * (dossier 5.2: argument-free `print()`, empty strings, `sep=`, `end=`, escape
 * sequences, f-strings and everything else) fails closed by not matching it.
 */
export function pythonOutputListingViolations(source: string): string[] {
  return pythonOutputListingViolationsFromScan(source);
}

export const PythonOutputValidatorSchema = z
  .object({
    type: z.literal('python_output'),
    // Deliberately not `.trim()`: the constraints below reject any boundary
    // whitespace instead of silently changing the authored output.
    canonicalAnswer: z.string().min(1).max(PYTHON_OUTPUT_LIMITS.maxCanonicalLength),
    acceptedAnswers: z
      .array(z.string().min(1).max(PYTHON_OUTPUT_LIMITS.maxCanonicalLength))
      .length(1),
    equivalenceNotes: z.string().trim().min(1).max(500),
  })
  .strict()
  .superRefine((validator, context) => {
    for (const message of pythonOutputCanonicalViolations(validator.canonicalAnswer)) {
      context.addIssue({ code: 'custom', path: ['canonicalAnswer'], message });
    }
    if (validator.acceptedAnswers[0] !== validator.canonicalAnswer) {
      context.addIssue({
        code: 'custom',
        path: ['acceptedAnswers'],
        message: 'A python_output validator must list exactly its canonicalAnswer as accepted',
      });
    }
  });

export type PythonOutputValidator = z.infer<typeof PythonOutputValidatorSchema>;

/** Non-empty string literal values, found by the string- and comment-aware scanner. */
export function listingStringLiterals(source: string): string[] {
  return listingStringValues(source);
}

/**
 * Item-level authoring checks (section 5.4 and 7.1 C5) that need more than the
 * validator alone: leakage patterns over every output line, and hints that must
 * not quote code literals or output lines. Returns one message per violation.
 */
export function pythonOutputItemViolations(item: {
  canonicalAnswer: string;
  forbiddenLeakagePatterns: readonly string[];
  hintText: string;
  listingSource: string;
}): string[] {
  const violations: string[] = [];
  const patterns = new Set(item.forbiddenLeakagePatterns);
  if (!patterns.has(item.canonicalAnswer)) {
    violations.push('forbiddenLeakagePatterns must include the full canonical output');
  }
  for (const line of new Set(item.canonicalAnswer.split('\n'))) {
    if (line.length >= 3 && !patterns.has(line)) {
      violations.push(`forbiddenLeakagePatterns must include output line "${line}"`);
    }
  }
  const hint = item.hintText.toLocaleLowerCase();
  for (const literal of listingStringLiterals(item.listingSource)) {
    const lower = literal.toLocaleLowerCase();
    const quoted = [`"${lower}"`, `'${lower}'`, `\`${lower}\``].some((form) => hint.includes(form));
    if (quoted || (lower.length >= 3 && hint.includes(lower))) {
      violations.push(`hints must not quote the code literal "${literal}"`);
    }
  }
  for (const line of item.canonicalAnswer.split('\n')) {
    if (line.length >= 3 && hint.includes(line.toLocaleLowerCase())) {
      violations.push(`hints must not quote the output line "${line}"`);
    }
  }
  return violations;
}
