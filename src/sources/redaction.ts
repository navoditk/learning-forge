/**
 * Withholds sensitive or tracking-shaped details from register text before it
 * is projected. The register is trusted prose, not trusted data: nothing that
 * looks like a credential, secret parameter, private path, digest, or
 * learner/profile field may reach a record, a rendered page, or a log.
 */

export const WITHHELD_LINK_TEXT = '[link withheld]';

const TRACKING_KEY =
  /^(utm_[a-z0-9_]*|fbclid|gclid|msclkid|dclid|mc_[a-z]+|_ga|_gl|igshid|yclid)$/i;
const SENSITIVE_KEY =
  /token|secret|passw|apikey|api[-_]?key|credential|signature|e-?mail|bearer|jwt|(?:^|[_-])(?:key|auth|session|sid|sig|mail|phone|user|username|login|learner|child|student|name|profile|otp|code|id|uid|userid|ssn|dob|birth\w*)(?:$|[_-])/i;
const OPAQUE_VALUE = /^[A-Za-z0-9_+/=-]{32,}$/;
const JWT_VALUE = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;
const PRIVATE_PATH_VALUE = /(?:assessment|private|\.env|\/Users\/|\/home\/)/i;

function decode(part: string): string {
  try {
    return decodeURIComponent(part.replace(/\+/g, ' '));
  } catch {
    return part;
  }
}

function isSensitivePair(rawKey: string, rawValue: string): boolean {
  const key = decode(rawKey);
  const value = decode(rawValue);
  return (
    TRACKING_KEY.test(key) ||
    SENSITIVE_KEY.test(key) ||
    value.includes('@') ||
    JWT_VALUE.test(value) ||
    OPAQUE_VALUE.test(value) ||
    PRIVATE_PATH_VALUE.test(value)
  );
}

function pairsAreSensitive(text: string): boolean {
  return text
    .split('&')
    .filter(Boolean)
    .some((pair) => {
      const separator = pair.indexOf('=');
      return separator < 0
        ? OPAQUE_VALUE.test(decode(pair)) || JWT_VALUE.test(decode(pair))
        : isSensitivePair(pair.slice(0, separator), pair.slice(separator + 1));
    });
}

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const PRIVATE_PATH_SEGMENT =
  /(?:^|\/)(?:private|assessments?|held[-_]?out|assessment[-_]?packages?)(?:\/|$)|\.env|\/Users\/|\/home\//i;
const MAX_DECODE_ROUNDS = 3;

/** Fully percent-decoded variants of the input, or null if decoding is malformed or does not settle. */
function decodedVariants(raw: string): string[] | null {
  const variants = [raw];
  let current = raw;
  for (let round = 0; round < MAX_DECODE_ROUNDS; round += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (next === current) return variants;
    variants.push(next);
    current = next;
  }
  try {
    return decodeURIComponent(current) === current ? variants : null;
  } catch {
    return null;
  }
}

/** True if the text holds a secret-shaped assignment, token, digest, or private detail, wherever it sits. */
function hasSecretText(text: string): boolean {
  return TEXT_PATTERNS.some(([pattern]) => text.search(pattern) >= 0);
}

function splitUrl(raw: string): { base: string; query: string; hash: string } {
  const hashIndex = raw.indexOf('#');
  const beforeHash = hashIndex < 0 ? raw : raw.slice(0, hashIndex);
  const hash = hashIndex < 0 ? '' : raw.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  return {
    base: queryIndex < 0 ? beforeHash : beforeHash.slice(0, queryIndex),
    query: queryIndex < 0 ? '' : beforeHash.slice(queryIndex + 1),
    hash,
  };
}

function authorityOf(base: string): string {
  const afterScheme = base.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  return afterScheme.split('/')[0];
}

export interface UrlAnalysis {
  /** False when anything in the address (credentials, query, hash, path, encoding) looks sensitive. */
  safe: boolean;
  /** The address when safe, otherwise only its plain scheme and host (or a fixed marker). */
  display: string;
}

/**
 * Judges the address exactly as recorded, before any text redaction, so an
 * altered address can never be presented as the original destination. Fails
 * closed on encoded or repeatedly encoded sensitive content.
 */
export function analyzeUrl(raw: string): UrlAnalysis {
  const authority = authorityOf(splitUrl(raw).base);
  const plainHost = /^[a-z][a-z0-9+.-]*:\/\//i.exec(raw)?.[0];
  const hostOnly =
    plainHost && /^[A-Za-z0-9.-]+$/.test(authority)
      ? `${plainHost}${authority}`
      : WITHHELD_LINK_TEXT;
  const withheld: UrlAnalysis = { safe: false, display: hostOnly };

  if (authority.includes('@') || authority.includes('%')) return withheld;
  const variants = decodedVariants(raw);
  if (!variants) return withheld;
  for (const variant of variants) {
    if (CONTROL_CHARACTERS.test(variant)) return withheld;
    const parts = splitUrl(variant);
    if (parts.query.includes('@') || parts.hash.includes('@')) return withheld;
    if (pairsAreSensitive(parts.query)) return withheld;
    if (hasSecretText(parts.query) || hasSecretText(parts.hash)) return withheld;
    const hashBody = parts.hash.replace(/^[^=]*\?/, '');
    if (parts.hash.includes('=') && pairsAreSensitive(hashBody)) return withheld;
    if (OPAQUE_VALUE.test(parts.hash) || JWT_VALUE.test(parts.hash)) return withheld;
    if (PRIVATE_PATH_SEGMENT.test(parts.base.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, ''))) {
      return withheld;
    }
    if (PRIVATE_PATH_VALUE.test(parts.query) || PRIVATE_PATH_VALUE.test(parts.hash))
      return withheld;
  }
  return { safe: true, display: raw };
}

const URL_IN_TEXT = /https?:\/\/[^\s`<>"'()[\]|*]+/g;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

const TEXT_PATTERNS: Array<[RegExp, string]> = [
  [/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g, '[email withheld]'],
  [
    /\b(api[_-]?key|secret|token|password|passwd|bearer|authorization)\b\s*[:=]\s*\S+/gi,
    '$1=[withheld]',
  ],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/g, 'Bearer [withheld]'],
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[token withheld]'],
  [/\b(?:sha(?:1|256|512)[:=-]?)?[a-f0-9]{40,}\b/gi, '[digest withheld]'],
  [
    /\b(?:[\w./-]*(?:assessment[-_ ]?packages?|private[-_ ]?(?:bank|package|assessment)s?|held[-_ ]?out)[\w./-]*)/gi,
    '[private path withheld]',
  ],
  [/(?:^|[\s(`])\/private\/[^\s)`;|]+/g, ' [private path withheld]'],
  [/\b(learner|child|student|profile)\s*:\s*[^;,.|\n]+/gi, '$1: [profile detail withheld]'],
  [/(?:\/Users\/|\/home\/|[A-Za-z]:\\)[^\s)`;|]+/g, '[private path withheld]'],
  [/(?:^|[\s(`])(?:[\w./-]*\/)?\.env[\w.]*/g, ' [private path withheld]'],
  [
    /\b(learner|child|student|profile)[ _]?(name|id|email|dob|birthdate|birth date)\b\s*[:=]\s*[^;,.|\n]+/gi,
    '[profile detail withheld]',
  ],
];

export interface RedactedText {
  text: string;
  redacted: boolean;
}

export function redactText(input: string): RedactedText {
  let redacted = false;
  let text = input.replace(URL_IN_TEXT, (match) => {
    const trailing = TRAILING_PUNCTUATION.exec(match)?.[0] ?? '';
    if (analyzeUrl(match.slice(0, match.length - trailing.length)).safe) return match;
    redacted = true;
    return `${WITHHELD_LINK_TEXT}${trailing}`;
  });
  for (const [pattern, replacement] of TEXT_PATTERNS) {
    text = text.replace(pattern, (...args: unknown[]) => {
      redacted = true;
      const groups = args.slice(1, -2) as string[];
      return replacement.replace(/\$(\d)/g, (_m, index: string) => groups[Number(index) - 1] ?? '');
    });
  }
  return { text, redacted };
}

/** True if the text, or any bounded percent-decoding of it, would be redacted. Fails closed. */
export function looksSensitive(text: string): boolean {
  const variants = decodedVariants(text);
  return !variants || variants.some((variant) => redactText(variant).redacted);
}
