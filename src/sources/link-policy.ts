import { analyzeUrl } from './redaction';

/**
 * Technical link validation for the adult-facing curriculum resources index.
 *
 * This decides only whether an address is well-formed and safe to render as a
 * plain anchor (HTTPS, no credentials, no sensitive or tracking query, a public
 * DNS host). It is NOT a content or child-suitability review: a clickable link
 * says nothing about whether the destination is appropriate for a learner, and
 * destinations may contain contest solutions or other material an adult should
 * check first.
 */

export type LinkReason =
  'invalid' | 'not-https' | 'withheld' | 'credentials' | 'non-default-port' | 'non-public-host';

export const LINK_REASON_LABELS: Record<LinkReason, string> = {
  invalid: 'Not linked: the address could not be validated.',
  'not-https': 'Not linked: the recorded address is not HTTPS.',
  withheld:
    'Not linked: the recorded address contained credentials, tracking, query, or other details that were withheld, so no link is offered.',
  credentials: 'Not linked: the address contained embedded credentials, which were withheld.',
  'non-default-port': 'Not linked: the address uses a non-standard port.',
  'non-public-host': 'Not linked: the address does not point to a public website name.',
};

export interface LinkVerdict {
  /** The address as recorded, or only its scheme and host when details were withheld. */
  url: string;
  /** Normalised href; present only when the link is safe to render as an anchor. */
  href: string | null;
  host: string | null;
  clickable: boolean;
  reason: LinkReason | null;
  /** True when the recorded address held sensitive or altered details; it is never a link. */
  withheld: boolean;
}

const MAX_URL_LENGTH = 2048;
const UNSAFE_CHARACTERS = /[\s\u0000-\u001f\u007f<>"'\\`]/;
const DNS_LABEL = /^(?:xn--)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const LOCAL_SUFFIX =
  /^(?:local|localhost|internal|lan|home|home\.arpa|test|invalid|corp|intranet)$/i;

function isPublicHostName(rawHost: string): boolean {
  const host = rawHost.replace(/\.$/, '');
  const labels = host.split('.');
  if (labels.length < 2 || !labels.every((label) => DNS_LABEL.test(label))) return false;
  const tld = labels[labels.length - 1];
  if (/^\d+$/.test(tld) || /^0x/i.test(tld)) return false;
  return !labels.slice(1).some((label) => LOCAL_SUFFIX.test(label)) && !LOCAL_SUFFIX.test(tld);
}

export function evaluateSourceLink(raw: string): LinkVerdict {
  const analysis = analyzeUrl(raw);
  const refuse = (reason: LinkReason, host: string | null = null): LinkVerdict => ({
    url: analysis.safe ? raw : analysis.display,
    href: null,
    host,
    clickable: false,
    reason,
    withheld: !analysis.safe,
  });

  if (raw.length === 0 || raw.length > MAX_URL_LENGTH || UNSAFE_CHARACTERS.test(raw)) {
    return refuse('invalid');
  }
  if (!analysis.safe) return refuse('withheld');
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return refuse('invalid');
  }
  const host = parsed.hostname || null;
  if (!host) return refuse('invalid');
  if (parsed.protocol !== 'https:') {
    return refuse(parsed.protocol === 'http:' ? 'not-https' : 'invalid', host);
  }
  if (parsed.username || parsed.password) return refuse('credentials', host);
  if (parsed.port) return refuse('non-default-port', host);
  if (!isPublicHostName(host)) return refuse('non-public-host', host);

  return { url: raw, href: parsed.href, host, clickable: true, reason: null, withheld: false };
}
