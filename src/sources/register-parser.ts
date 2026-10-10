import { createHash } from 'node:crypto';

import { evaluateSourceLink, type LinkVerdict } from './link-policy';
import { redactText } from './redaction';

/**
 * Projects the authoritative Markdown source register
 * (docs/curriculum-sources.md) into safe, display-only records. Nothing here
 * fetches remote content, and only citation metadata is projected: scope notes,
 * handoff text, open questions, and every other part of a dossier are dropped.
 */

export type SourceKind = 'primary' | 'secondary' | 'inspiration' | 'other';
export type DossierStatusClass = 'approved' | 'pending' | 'informal' | 'unspecified';

export interface SourceLink extends LinkVerdict {
  label: string;
}

export interface SourceRecord {
  id: string;
  dossierSlug: string;
  origin: 'register-row' | 'dossier-text';
  authority: string | null;
  kind: SourceKind;
  title: string | null;
  issuer: string | null;
  citation: string;
  dateNotes: string | null;
  retrieval: string | null;
  /** Where `retrieval` came from: the entry itself or a dossier-wide statement. */
  retrievalScope: 'entry' | 'dossier' | null;
  accessNotes: string | null;
  support: string | null;
  /** True when credentials, tracking, private paths, or similar details were withheld. */
  redacted: boolean;
  links: SourceLink[];
}

export interface DossierSummary {
  slug: string;
  title: string;
  date: string | null;
  statusClass: DossierStatusClass;
  statusText: string | null;
  sourceCount: number;
}

export interface SourceRegister {
  dossiers: DossierSummary[];
  sources: SourceRecord[];
}

const MAX_STATUS_LENGTH = 300;

interface Span {
  start: number;
  end: number;
}

function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1');
}

/** Normalises inline Markdown to plain text; the result is rendered as a React text node only. */
export function toPlainText(markdown: string): string {
  return unescapeMarkdown(
    markdown
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/(?<![*\w])\*(?=\S)([^*]+?)(?<=\S)\*(?!\w)/g, '$1')
      .replace(/`([^`]*)`/g, '$1'),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

/** Splits a Markdown table row on unescaped pipes; `\|` becomes a literal pipe. */
export function splitTableRow(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  const trimmed = line.trim();
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (char === '\\' && trimmed[index + 1] === '|') {
      current += '|';
      index += 1;
    } else if (char === '|') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  if (trimmed.startsWith('|')) cells.shift();
  if (trimmed.endsWith('|') && !trimmed.endsWith('\\|')) cells.pop();
  return cells.map((cell) => cell.trim());
}

const URL_PATTERN = /https?:\/\/[^\s`<>"'()[\]|*]+/g;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

interface FoundUrl {
  url: string;
  label: string | null;
  start: number;
}

function findUrls(text: string): FoundUrl[] {
  const found: FoundUrl[] = [];
  const claimed: Span[] = [];
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const url = match[2].replace(TRAILING_PUNCTUATION, '');
    const end = match.index + match[0].length;
    found.push({
      url,
      label: toPlainText(match[1]) || null,
      start: match.index,
    });
    claimed.push({ start: match.index, end });
  }
  for (const match of text.matchAll(URL_PATTERN)) {
    const inside = claimed.some((span) => match.index >= span.start && match.index < span.end);
    if (inside) continue;
    const url = match[0].replace(TRAILING_PUNCTUATION, '');
    found.push({
      url,
      label: null,
      start: match.index,
    });
  }
  return found.sort((a, b) => a.start - b.start);
}

function maskForEmphasis(text: string): string {
  return text
    .replace(/\*\*/g, '  ')
    .replace(/`[^`]*`/g, (code) => ' '.repeat(code.length))
    .replace(/\[[^\]]*\]\([^)]*\)/g, (link) => ' '.repeat(link.length));
}

interface Italic extends Span {
  text: string;
}

function findItalics(cell: string): Italic[] {
  const masked = maskForEmphasis(cell);
  const italics: Italic[] = [];
  for (const match of masked.matchAll(/(?<![*\w])\*(?=\S)([^*\n]+?)(?<=\S)\*(?!\w)/g)) {
    const text = toPlainText(match[1]);
    if (text) italics.push({ start: match.index, end: match.index + match[0].length, text });
  }
  return italics;
}

function topLevelParentheticals(text: string): string[] {
  const found: string[] = [];
  let depth = 0;
  let start = -1;
  let inCode = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '`') inCode = !inCode;
    if (inCode) continue;
    if (char === '(') {
      if (depth === 0) start = index + 1;
      depth += 1;
    } else if (char === ')' && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) found.push(text.slice(start, index));
    }
  }
  return found;
}

function topLevelSegments(text: string): string[] {
  const segments: string[] = [];
  let depth = 0;
  let inCode = false;
  let current = '';
  for (const char of text) {
    if (char === '`') inCode = !inCode;
    if (!inCode) {
      if (char === '(') depth += 1;
      if (char === ')' && depth > 0) depth -= 1;
      if (char === ';' && depth === 0) {
        segments.push(current);
        current = '';
        continue;
      }
    }
    current += char;
  }
  segments.push(current);
  return segments;
}

function classifyKind(authority: string | null): SourceKind {
  if (!authority) return 'other';
  if (/^\s*primary\b/i.test(authority)) return 'primary';
  if (/^\s*secondary\b/i.test(authority)) return 'secondary';
  if (/inspiration/i.test(authority)) return 'inspiration';
  return 'other';
}

const DATE_WORDS =
  /\b(date|dated|published|publication|modified|created|updated|edition|version|adopted|copyright|season|effective|©)\b|\b(19|20)\d{2}\b/i;
// Text after the title that is a date or connective, not an issuing body.
const NON_ISSUER_START = /^\s*(updated|copyright|created|modified|published|and|linked|\d)/i;
const ACCESS_WORDS = /\b(HTTP|inaccessible|gated|subscription|403|404|accessible|extractable)\b/i;

function cleanCitationFragment(fragment: string): string {
  return toPlainText(fragment.replace(URL_PATTERN, ' ').replace(/\(\s*\)/g, ' '))
    .replace(/^[,;\s]+|[,;\s]+$/g, '')
    .trim();
}

interface RowFields {
  title: string | null;
  issuer: string | null;
  dateNotes: string | null;
  retrieval: string | null;
  accessNotes: string | null;
}

function deriveCitationFields(citationCell: string): RowFields {
  const italics = findItalics(citationCell);
  const title = italics.length > 0 ? [...new Set(italics.map((i) => i.text))].join(' / ') : null;

  const segments = topLevelSegments(citationCell);
  let issuer: string | null = null;
  const first = segments[0] ?? '';
  const afterTitle = italics.length > 0 ? first.slice(italics[0].end) : '';
  const issuerMatch = /^\s*,\s*([^,][\s\S]*)$/.exec(afterTitle);
  const firstSegmentItalics = italics.filter((italic) => italic.start < first.length).length;
  if (
    issuerMatch &&
    firstSegmentItalics === 1 &&
    !/https?:\/\//.test(issuerMatch[1]) &&
    !NON_ISSUER_START.test(issuerMatch[1])
  ) {
    issuer = cleanCitationFragment(issuerMatch[1]) || null;
  }

  const dateSegments: string[] = [];
  const firstTail = cleanCitationFragment(afterTitle.replace(/^\s*,/, ''));
  if (issuer === null && firstTail && DATE_WORDS.test(firstTail)) dateSegments.push(firstTail);
  for (const segment of segments.slice(1)) {
    const beforeUrl = segment.split(/https?:\/\//)[0];
    const text = cleanCitationFragment(beforeUrl.replace(/\([^)]*\)/g, ' '));
    if (text && DATE_WORDS.test(text)) dateSegments.push(text);
  }

  const parentheticals = topLevelParentheticals(citationCell);
  const retrievals = [
    ...new Set(
      [...citationCell.matchAll(/retrieved\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/gi)].map((m) => m[1]),
    ),
  ];
  const accessNotes = parentheticals
    .filter((note) => ACCESS_WORDS.test(note))
    .map((note) => toPlainText(note))
    .filter(Boolean);

  return {
    title,
    issuer,
    dateNotes: dateSegments.length > 0 ? dateSegments.join('; ') : null,
    retrieval: retrievals.length > 0 ? retrievals.join(', ') : null,
    accessNotes: accessNotes.length > 0 ? accessNotes.join('; ') : null,
  };
}

function shortHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 8);
}

function labelForUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url;
  }
}

function buildLinks(cells: string[], italicsCell: number): SourceLink[] {
  const links: SourceLink[] = [];
  const seen = new Set<string>();
  cells.forEach((cell, cellIndex) => {
    const italics = cellIndex === italicsCell ? findItalics(cell) : [];
    let previousUrlStart = -1;
    for (const found of findUrls(cell)) {
      if (seen.has(found.url)) continue;
      seen.add(found.url);
      const nearest = italics.filter((i) => i.end <= found.start && i.start >= previousUrlStart);
      const label = found.label ?? (nearest.length > 0 ? nearest[nearest.length - 1].text : null);
      previousUrlStart = found.start;
      const verdict = evaluateSourceLink(found.url);
      links.push({
        ...verdict,
        label: redactText(label ?? labelForUrl(verdict.url)).text,
      });
    }
  });
  return links;
}

function classifyStatus(text: string): DossierStatusClass {
  if (/^\s*pending\b/i.test(text)) return 'pending';
  if (/^\s*approved\b/i.test(text)) return 'approved';
  if (/informal|not formally/i.test(text)) return 'informal';
  return 'unspecified';
}

interface Section {
  title: string;
  lines: string[];
}

function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section | undefined;
  let inFence = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const heading = inFence ? null : /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading && heading[1].length === 2) {
      current = { title: toPlainText(heading[2]), lines: [] };
      sections.push(current);
      continue;
    }
    if (heading && heading[1].length === 1) {
      current = undefined;
      continue;
    }
    if (current) {
      current.lines.push(inFence && !heading ? '' : line);
    }
  }
  return sections;
}

function findStatus(lines: string[]): { text: string; statusClass: DossierStatusClass } | null {
  const joined = lines.join('\n');
  const match = /(?:^|\n)\s*(?:[-*]\s+)?\*\*Status:\s*([\s\S]+?)\*\*/.exec(joined);
  if (!match) return null;
  const text = toPlainText(redactText(match[1]).text).slice(0, MAX_STATUS_LENGTH);
  return { text, statusClass: classifyStatus(text) };
}

function findDossierRetrieval(lines: string[]): string | null {
  for (const line of lines) {
    const match = /^\s*[-*]\s+\**Retrieval dates?\**:?\**\s*(.*)$/i.exec(line);
    if (!match || !/\d{4}-\d{2}-\d{2}/.test(match[1])) continue;
    return toPlainText(redactText(match[1]).text).replace(/\.$/, '') || null;
  }
  return null;
}

export function parseSourceRegister(markdown: string): SourceRegister {
  const dossiers: DossierSummary[] = [];
  const sources: SourceRecord[] = [];
  const usedSlugs = new Set<string>();
  const usedIds = new Set<string>();

  const uniqueId = (slug: string, material: string): string => {
    const base = `${slug}-${shortHash(material)}`;
    let id = base;
    for (let suffix = 2; usedIds.has(id); suffix += 1) id = `${base}-${suffix}`;
    usedIds.add(id);
    return id;
  };

  for (const section of splitSections(markdown)) {
    const dateMatch = /\s+[—–-]\s+(\d{4}-\d{2}-\d{2})\s*$/.exec(section.title);
    const title = redactText(
      dateMatch ? section.title.slice(0, dateMatch.index).trim() : section.title,
    ).text;
    let slug = slugify(title);
    for (let suffix = 2; usedSlugs.has(slug); suffix += 1) slug = `${slugify(title)}-${suffix}`;

    const status = findStatus(section.lines);
    const records: SourceRecord[] = [];

    const registerRows: string[][] = [];
    const textLines: string[] = [];
    let inRegisterTable = false;
    for (const line of section.lines) {
      if (/^\s*\|/.test(line)) {
        const cells = splitTableRow(line);
        if (/^[\s:|-]+$/.test(line)) continue;
        if (cells.length >= 3 && /authority/i.test(cells[0]) && /source|title/i.test(cells[1])) {
          inRegisterTable = true;
          continue;
        }
        if (inRegisterTable && cells.length >= 3) registerRows.push(cells);
        continue;
      }
      inRegisterTable = false;
      textLines.push(line);
    }

    const dossierRetrieval = findDossierRetrieval(section.lines);
    const rowUrls = new Set<string>();

    for (const rawCells of registerRows) {
      const scrubbed = rawCells.map((cell) => redactText(cell));
      const cells = scrubbed.map((cell) => cell.text);
      const authority = toPlainText(cells[0]) || null;
      const kind = classifyKind(authority);
      const citation = cells[1];
      const support = toPlainText(cells.slice(2).join(' | ')) || null;
      const fields = deriveCitationFields(citation);
      const links = buildLinks([rawCells[1], rawCells[0], ...rawCells.slice(2)], 0);
      links.forEach((link) => rowUrls.add(link.url));
      records.push({
        id: uniqueId(slug, cells.join('|')),
        dossierSlug: slug,
        origin: 'register-row',
        authority,
        kind,
        ...fields,
        retrieval: fields.retrieval ?? dossierRetrieval,
        retrievalScope: fields.retrieval ? 'entry' : dossierRetrieval ? 'dossier' : null,
        citation: toPlainText(citation),
        support,
        redacted: scrubbed.some((cell) => cell.redacted) || links.some((link) => link.withheld),
        links,
      });
    }

    for (const rawLine of textLines) {
      for (const found of findUrls(rawLine)) {
        if (rowUrls.has(found.url)) continue;
        rowUrls.add(found.url);
        const verdict = evaluateSourceLink(found.url);
        const label = redactText(found.label ?? labelForUrl(verdict.url)).text;
        records.push({
          id: uniqueId(slug, `text|${verdict.url}`),
          dossierSlug: slug,
          origin: 'dossier-text',
          authority: null,
          kind: 'other',
          title: found.label ? label : null,
          issuer: null,
          citation: found.label
            ? `${label} (${verdict.url})`
            : `Link cited in the dossier text: ${verdict.url}`,
          dateNotes: null,
          retrieval: dossierRetrieval,
          retrievalScope: dossierRetrieval ? 'dossier' : null,
          accessNotes: null,
          support: null,
          redacted: verdict.withheld,
          links: [{ ...verdict, label }],
        });
      }
    }

    if (records.length === 0) continue;
    usedSlugs.add(slug);
    dossiers.push({
      slug,
      title,
      date: dateMatch ? dateMatch[1] : null,
      statusClass: status?.statusClass ?? 'unspecified',
      statusText: status?.text ?? null,
      sourceCount: records.length,
    });
    sources.push(...records);
  }

  return { dossiers, sources };
}
