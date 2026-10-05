// Purely decorative per-chapter color + glyph so the table of contents reads
// as a set of distinct subjects (like a shelf of books) rather than a flat
// list. Colors are never used for text, so they aren't subject to the 4.5:1
// text-contrast rule - only the 3:1 graphical-object rule, which a mid-tone
// swatch behind a white glyph clears easily in both themes. See
// docs/learner-presentation-design.md for the full rationale and the
// checklist for giving a new domain its own entry here.

const CHAPTER_COLOR: Record<string, string> = {
  'ratios-and-proportional-reasoning': '#e4572e',
  'number-system': '#3b6ea5',
  'expressions-and-equations': '#7b5ea7',
  geometry: '#4c9a6a',
  statistics: '#c5478a',
};

// One color per enrichment program, applied to every domain under that
// program's prefix - a program-level identity rather than one entry per
// domain, so a program gaining a new domain is colored automatically.
const PROGRAM_COLOR_BY_PREFIX: ReadonlyArray<readonly [prefix: string, color: string]> = [
  ['mk6-', '#5b5fc7'],
  ['moems6-', '#1f8a8f'],
  ['amc8-', '#d4a017'],
  ['mc6-', '#a4303f'],
  ['snsb6-', '#8a5a44'],
];

const DEFAULT_CHAPTER_COLOR = '#b5790f';

function chapterColor(domain: string): string {
  if (domain in CHAPTER_COLOR) return CHAPTER_COLOR[domain];
  const match = PROGRAM_COLOR_BY_PREFIX.find(([prefix]) => domain.startsWith(prefix));
  return match ? match[1] : DEFAULT_CHAPTER_COLOR;
}

const STROKE = { fill: 'none', stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round' as const };

function CirclesGlyph() {
  return (
    <>
      <circle cx="7" cy="9" r="3.2" {...STROKE} />
      <circle cx="15" cy="13" r="3.2" {...STROKE} />
    </>
  );
}

function NumberLineGlyph() {
  return (
    <>
      <line x1="4" y1="11" x2="18" y2="11" {...STROKE} />
      <line x1="6" y1="8" x2="6" y2="14" {...STROKE} />
      <line x1="11" y1="8" x2="11" y2="14" {...STROKE} />
      <line x1="16" y1="8" x2="16" y2="14" {...STROKE} />
    </>
  );
}

function BracketsGlyph() {
  return (
    <>
      <path d="M6 5 C3 5 3 11 1 11 C3 11 3 17 6 17" {...STROKE} />
      <path d="M16 5 C19 5 19 11 21 11 C19 11 19 17 16 17" {...STROKE} />
      <line x1="9" y1="11" x2="13" y2="11" {...STROKE} />
    </>
  );
}

function TriangleGlyph() {
  return <polygon points="11,4 19,18 3,18" {...STROKE} strokeLinejoin="round" />;
}

function BarsGlyph() {
  return (
    <>
      <line x1="5" y1="17" x2="5" y2="11" {...STROKE} />
      <line x1="11" y1="17" x2="11" y2="6" {...STROKE} />
      <line x1="17" y1="17" x2="17" y2="13" {...STROKE} />
    </>
  );
}

function DiceGlyph() {
  return (
    <>
      <rect x="3" y="3" width="16" height="16" rx="3.5" {...STROKE} />
      <circle cx="7.5" cy="7.5" r="1.3" fill="#fff" />
      <circle cx="11" cy="11" r="1.3" fill="#fff" />
      <circle cx="14.5" cy="14.5" r="1.3" fill="#fff" />
    </>
  );
}

function LightbulbGlyph() {
  return (
    <>
      <circle cx="11" cy="9" r="5" {...STROKE} />
      <line x1="9" y1="18" x2="13" y2="18" {...STROKE} />
      <line x1="11" y1="14" x2="11" y2="16.5" {...STROKE} />
    </>
  );
}

function BookGlyph() {
  return (
    <>
      <path d="M11 6c-2-1.5-5-1.8-8-1v12c3-0.8 6-0.5 8 1V6z" {...STROKE} strokeLinejoin="round" />
      <path d="M11 6c2-1.5 5-1.8 8-1v12c-3-0.8-6-0.5-8 1V6z" {...STROKE} strokeLinejoin="round" />
    </>
  );
}

function StarGlyph() {
  return (
    <path
      d="M11 3l2.2 5.3 5.7.4-4.4 3.7 1.4 5.6-4.9-3.1-4.9 3.1 1.4-5.6-4.4-3.7 5.7-.4z"
      fill="#fff"
    />
  );
}

/**
 * Enrichment-program domains don't have bespoke per-domain glyphs (that
 * would mean hand-authoring ~25 icons for categories most learners only
 * see one or two of). Instead, keyword matching on the domain code picks
 * from the same small shape vocabulary already used for the five Grade 6
 * Math domains, checked in an order that resolves compound domain codes
 * like "patterns-and-counting" (counting wins - it's the stronger visual
 * cue) sensibly.
 */
function enrichmentGlyph(domain: string) {
  if (domain.startsWith('snsb6-')) return <BookGlyph />;
  if (/combinatorics|counting|probability/.test(domain)) return <DiceGlyph />;
  if (/arithmetic|number/.test(domain)) return <NumberLineGlyph />;
  if (/geometry|spatial|visualization/.test(domain)) return <TriangleGlyph />;
  if (/algebra|data/.test(domain)) return <BracketsGlyph />;
  if (/proportional|ratio/.test(domain)) return <CirclesGlyph />;
  if (/logic|arrangements/.test(domain)) return <LightbulbGlyph />;
  return <StarGlyph />;
}

function GlyphFor({ domain }: { domain: string }) {
  switch (domain) {
    case 'ratios-and-proportional-reasoning':
      return <CirclesGlyph />;
    case 'number-system':
      return <NumberLineGlyph />;
    case 'expressions-and-equations':
      return <BracketsGlyph />;
    case 'geometry':
      return <TriangleGlyph />;
    case 'statistics':
      return <BarsGlyph />;
    default:
      return enrichmentGlyph(domain);
  }
}

export function ChapterIcon({ domain, size = 28 }: { domain: string; size?: number }) {
  return (
    <span
      className="chapter-icon"
      style={{ background: chapterColor(domain), width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 22 22" width={size * 0.64} height={size * 0.64}>
        <GlyphFor domain={domain} />
      </svg>
    </span>
  );
}
