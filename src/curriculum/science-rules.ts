/**
 * Grade 6 Science load-time rules (SCI6-PREREQ, D-172).
 *
 * These rules only constrain records that belong to the `grade-6-science`
 * program (or use a `sci6-` domain). Every other program is untouched. They
 * add no content and no behavior: Science stays unavailable, and these checks
 * run at catalog load so a malformed future Science record fails loudly.
 */

export const SCIENCE_PROGRAM_CODE = 'grade-6-science';
export const SCIENCE_DOMAIN_PREFIX = 'sci6-';

/**
 * The 19 Grade 6 California Preferred Integrated performance expectations from
 * the approved dossier. ASCII hyphen-minus only: look-alike dashes must fail.
 */
export const GRADE_6_SCIENCE_STANDARDS: readonly string[] = [
  'MS-LS1-1',
  'MS-LS1-2',
  'MS-LS1-3',
  'MS-LS1-4',
  'MS-LS1-5',
  'MS-LS1-8',
  'MS-LS3-2',
  'MS-ESS2-4',
  'MS-ESS2-5',
  'MS-ESS2-6',
  'MS-ESS3-3',
  'MS-ESS3-5',
  'MS-PS3-3',
  'MS-PS3-4',
  'MS-PS3-5',
  'MS-ETS1-1',
  'MS-ETS1-2',
  'MS-ETS1-3',
  'MS-ETS1-4',
];

const MIN_LEAKAGE_PATTERN_LENGTH = 3;

export type ScienceSkillShape = {
  code: string;
  program: string;
  domain: string;
  standards: readonly string[];
};

/** P3: program/domain pairing and the Grade 6 PE allow-list. */
export function validateScienceSkillRules(skills: readonly ScienceSkillShape[]): void {
  for (const skill of skills) {
    const isScienceProgram = skill.program === SCIENCE_PROGRAM_CODE;
    const isScienceDomain = skill.domain.startsWith(SCIENCE_DOMAIN_PREFIX);
    if (isScienceProgram && !isScienceDomain) {
      throw new Error(
        `${skill.code} in ${SCIENCE_PROGRAM_CODE} must use a ${SCIENCE_DOMAIN_PREFIX}* domain, found ${skill.domain}`,
      );
    }
    if (!isScienceProgram && isScienceDomain) {
      throw new Error(
        `${skill.code} uses the ${skill.domain} domain, which is reserved for ${SCIENCE_PROGRAM_CODE}`,
      );
    }
    if (!isScienceProgram) continue;
    for (const standard of skill.standards) {
      if (!GRADE_6_SCIENCE_STANDARDS.includes(standard)) {
        throw new Error(
          `${skill.code} lists standard "${standard}" outside the Grade 6 Science performance-expectation allow-list`,
        );
      }
    }
  }
}

export type ScienceContentShape = {
  id: string;
  role?: string;
  mode: string;
  contestFormat?: unknown;
  deterministicValidator: {
    type: string;
    fields?: readonly {
      key: string;
      kind: string;
      options?: readonly { id: string; label: string }[];
      correctOptionId?: string;
    }[];
  };
  forbiddenLeakagePatterns?: readonly string[];
  figure?: { svgMarkup: string; altText: string };
  accessibleAlternative: string;
};

const fold = (value: string) => value.toLocaleLowerCase();

// Plain text (altText, accessibleAlternative): no XML decoding, only case and
// whitespace folding. A literal "&#78;" there is the characters &, #, 7, 8.
const normalizePlain = (value: string) => fold(value).replace(/\s+/g, ' ').trim();

const XML_NAMED_ENTITIES: Record<string, string> = {
  lt: '<',
  gt: '>',
  amp: '&',
  quot: '"',
  apos: "'",
};

/** Decodes XML character data: decimal/hex references and the five predefined entities. */
function decodeXmlCharacterData(value: string): string {
  return value.replace(
    /&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g,
    (_match, ref: string) => {
      if (ref.startsWith('#')) {
        const codePoint = ref[1] === 'x' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
        const valid =
          codePoint === 0x9 ||
          codePoint === 0xa ||
          codePoint === 0xd ||
          (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
          (codePoint >= 0xe000 && codePoint <= 0xfffd && codePoint !== 0xfffe) ||
          (codePoint >= 0x10000 && codePoint <= 0x10ffff);
        if (!valid) throw new Error(`SVG text has an invalid character reference &${ref};`);
        return String.fromCodePoint(codePoint);
      }
      const named = XML_NAMED_ENTITIES[ref];
      if (named === undefined) throw new Error(`SVG text uses unsupported entity &${ref};`);
      return named;
    },
  );
}

const STRAY_AMPERSAND = /&(?!(?:#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);)/;

function decodeCharacterData(value: string): string {
  if (STRAY_AMPERSAND.test(value)) {
    throw new Error('SVG text contains an & that is not a character or entity reference');
  }
  return decodeXmlCharacterData(value);
}

/** Reads a tag starting at `<`; returns its name, whether it closes, and the index after `>`. */
function readTag(svg: string, start: number) {
  const isEnd = svg[start + 1] === '/';
  const nameStart = start + (isEnd ? 2 : 1);
  const name = /^[A-Za-z_][\w.:-]*/.exec(svg.slice(nameStart))?.[0];
  if (!name) throw new Error('SVG markup contains a malformed tag');
  let i = nameStart + name.length;
  let quote: string | null = null;
  for (; i < svg.length; i += 1) {
    const char = svg[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      break;
    }
  }
  if (i >= svg.length) throw new Error(`SVG tag <${name}> is not terminated`);
  const inner = svg.slice(nameStart + name.length, i);
  return { name, isEnd, selfClosing: !isEnd && inner.trimEnd().endsWith('/'), next: i + 1 };
}

/**
 * Rendered `<text>` strings (lower-cased, whitespace-collapsed, non-empty) of a
 * schema-validated static-subset SVG.
 *
 * One left-to-right lexical scan: comments, CDATA sections, other tags and
 * character data are recognized in the order they occur, so comment syntax
 * inside CDATA and tag spellings inside CDATA or comments are never mistaken
 * for markup. Text is collected only between a real `<text>` start and end tag;
 * CDATA stays literal, character data is decoded, comments add nothing. Any
 * unterminated or malformed construct throws (fail closed).
 */
export function svgTextStrings(svgMarkup: string): string[] {
  const strings: string[] = [];
  let collecting: string | null = null;
  let i = 0;
  while (i < svgMarkup.length) {
    if (svgMarkup[i] !== '<') {
      const end = svgMarkup.indexOf('<', i);
      const run = svgMarkup.slice(i, end === -1 ? svgMarkup.length : end);
      if (collecting !== null) collecting += decodeCharacterData(run);
      i += run.length;
    } else if (svgMarkup.startsWith('<!--', i)) {
      const end = svgMarkup.indexOf('-->', i + 4);
      if (end === -1) throw new Error('SVG contains an unterminated comment');
      i = end + 3;
    } else if (svgMarkup.startsWith('<![CDATA[', i)) {
      const end = svgMarkup.indexOf(']]>', i + 9);
      if (end === -1) throw new Error('SVG contains an unterminated CDATA section');
      if (collecting !== null) collecting += svgMarkup.slice(i + 9, end);
      i = end + 3;
    } else if (svgMarkup.startsWith('<?', i)) {
      const end = svgMarkup.indexOf('?>', i + 2);
      if (end === -1) throw new Error('SVG contains an unterminated processing instruction');
      i = end + 2;
    } else if (svgMarkup.startsWith('<!', i)) {
      throw new Error('SVG contains unsupported markup declaration');
    } else {
      const tag = readTag(svgMarkup, i);
      if (tag.name.toLowerCase() === 'text' && tag.name !== 'text') {
        throw new Error(`SVG element <${tag.name}> must be spelled <text>`);
      }
      if (tag.name === 'text') {
        if (tag.isEnd) {
          if (collecting === null) throw new Error('SVG has a </text> without a start tag');
          const text = normalizePlain(collecting);
          if (text.length > 0) strings.push(text);
          collecting = null;
        } else if (!tag.selfClosing) {
          if (collecting !== null) throw new Error('SVG <text> elements must not be nested');
          collecting = '';
        }
      }
      i = tag.next;
    }
  }
  if (collecting !== null) throw new Error('SVG text element is not closed');
  return strings;
}

/** P4 and P5: content rules for a Grade 6 Science practice record. */
export function validateScienceContentRules(item: ScienceContentShape): void {
  if (item.role !== undefined && item.role !== 'practice') {
    throw new Error(`${item.id}: Grade 6 Science accepts practice records only`);
  }
  if (item.mode !== 'core' && item.mode !== 'depth') {
    throw new Error(`${item.id}: Grade 6 Science records must use core or depth mode`);
  }
  if (item.contestFormat !== undefined) {
    throw new Error(`${item.id}: Grade 6 Science records must not carry contest-format metadata`);
  }
  const validator = item.deterministicValidator;
  if (validator.type !== 'structured') {
    throw new Error(`${item.id}: Grade 6 Science records must use a structured validator`);
  }
  const fields = validator.fields ?? [];
  const patterns = item.forbiddenLeakagePatterns ?? [];
  for (const pattern of patterns) {
    if (pattern.length < MIN_LEAKAGE_PATTERN_LENGTH) {
      throw new Error(
        `${item.id}: leakage pattern "${pattern}" is shorter than ${MIN_LEAKAGE_PATTERN_LENGTH} characters`,
      );
    }
  }
  for (const field of fields) {
    if (field.kind !== 'choice') {
      throw new Error(
        `${item.id}: Grade 6 Science field "${field.key}" must be a choice field, found ${field.kind}`,
      );
    }
    const correct = field.options?.find((option) => option.id === field.correctOptionId);
    if (!correct) {
      throw new Error(`${item.id}: field "${field.key}" has no correct option`);
    }
    const label = fold(correct.label);
    if (!patterns.some((pattern) => label.includes(fold(pattern)))) {
      throw new Error(
        `${item.id}: field "${field.key}" needs a leakage pattern of at least ${MIN_LEAKAGE_PATTERN_LENGTH} characters that appears in its correct option label`,
      );
    }
  }

  // P5: a figure may not carry facts that exist only as drawn text.
  if (item.figure) {
    // Each alternative is searched on its own; a label may not span the two.
    const alternatives = [item.figure.altText, item.accessibleAlternative].map(normalizePlain);
    for (const text of svgTextStrings(item.figure.svgMarkup)) {
      if (!alternatives.some((alternative) => alternative.includes(text))) {
        throw new Error(
          `${item.id}: figure text "${text}" must appear in altText or accessibleAlternative`,
        );
      }
    }
  }
}
