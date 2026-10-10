import { looksSensitive } from './redaction';
import type { DossierSummary, SourceKind, SourceRecord, SourceRegister } from './register-parser';

export const SOURCE_KINDS: readonly SourceKind[] = ['primary', 'secondary', 'inspiration', 'other'];

export interface SourceQuery {
  dossier?: string;
  kind?: SourceKind;
  q?: string;
  ref?: string;
}

const MAX_QUERY_LENGTH = 100;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Accepts only known dossier slugs, kinds, and reference ids; anything else is dropped. */
export function parseSourceQuery(params: RawParams, register: SourceRegister): SourceQuery {
  const query: SourceQuery = {};
  const dossier = first(params.dossier);
  if (dossier && register.dossiers.some((candidate) => candidate.slug === dossier)) {
    query.dossier = dossier;
  }
  const kind = first(params.kind);
  if (kind && (SOURCE_KINDS as readonly string[]).includes(kind)) query.kind = kind as SourceKind;
  const ref = first(params.ref);
  if (ref && register.sources.some((candidate) => candidate.id === ref)) query.ref = ref;
  const q = first(params.q)?.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH);
  // Search text that looks sensitive is dropped, never echoed back into the page.
  if (q && !looksSensitive(q)) query.q = q;
  return query;
}

function searchText(record: SourceRecord): string {
  return [
    record.id,
    record.authority,
    record.title,
    record.issuer,
    record.citation,
    record.dateNotes,
    record.retrieval,
    record.accessNotes,
    record.support,
    ...record.links.flatMap((link) => [link.url, link.label]),
  ]
    .filter((part): part is string => Boolean(part))
    .join('\n')
    .toLowerCase();
}

export function filterSources(register: SourceRegister, query: SourceQuery): SourceRecord[] {
  const tokens = query.q ? query.q.toLowerCase().split(' ') : [];
  return register.sources.filter((record) => {
    if (query.ref && record.id !== query.ref) return false;
    if (query.dossier && record.dossierSlug !== query.dossier) return false;
    if (query.kind && record.kind !== query.kind) return false;
    if (tokens.length === 0) return true;
    const haystack = searchText(record);
    return tokens.every((token) => haystack.includes(token));
  });
}

export function dossierBySlug(register: SourceRegister, slug: string): DossierSummary | undefined {
  return register.dossiers.find((dossier) => dossier.slug === slug);
}

/** Names of supplied filters that were dropped because they matched nothing known. */
export function ignoredFilters(
  params: RawParams,
  query: SourceQuery,
): Array<'dossier' | 'kind' | 'ref' | 'q'> {
  const ignored: Array<'dossier' | 'kind' | 'ref' | 'q'> = [];
  for (const name of ['dossier', 'kind', 'ref', 'q'] as const) {
    if (first(params[name]) && !query[name]) ignored.push(name);
  }
  return ignored;
}
