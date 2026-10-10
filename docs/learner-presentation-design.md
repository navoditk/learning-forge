# Learner presentation design

How the learner page (`src/app/page.tsx`) organizes and styles the
curriculum, and the checklist for giving a new program the same treatment
without redesigning anything. This is a display convention, not a policy or
curriculum document — it does not change what a learner is offered, only how
it is browsed and drawn. See `AGENTS.md`'s "Capability playbooks" table for
how this fits alongside the curriculum/progression playbooks.

## The chapter model

A "chapter" is a program's existing `domain` field
(`src/contracts/curriculum.ts`, `CurriculumDomainSchema`) — not a new
concept. `src/app/learner-chapters.ts` groups the active program's skills
(from `/api/phase1/progress`) by domain, orders chapters by
`CurriculumDomainSchema`'s own declared order, and resolves each skill's
next actionable item from the plan/diagnostic/review lists already fetched
by the page (diagnostic placement takes priority over review, which takes
priority over regular practice). None of this is new state or a new
endpoint; it's a client-side read of data the page already loads.

The one richer structure — the authored `Program → Unit → Lesson` pilot
(`src/curriculum/pilot-catalog.ts`, gated behind
`COURSE_PROGRESSION_RELEASE_GATE_OPEN`) — is shown as an enrichment panel
inside the Ratios chapter when the gate is open, exactly as before this
redesign. It stays gated; this page never reads or writes progression
authorization state.

## Components

| Component | File | Role |
|---|---|---|
| `ChapterSidebar` | `src/app/components/chapter-sidebar.tsx` | Left table of contents: one disclosure per chapter, a progress badge, and a skill list with a status icon (locked/not started/practicing/confirmed). Collapses behind a toggle below ~860px. |
| `ChapterView` | `src/app/components/chapter-view.tsx` | The main pane: chapter header, Back/Next pager across the chapter's skills, and the "chapter complete, continue to the next one" handoff. |
| `ActivityPanel` | `src/app/components/activity-panel.tsx` | The practice/diagnostic/review loop itself (prompt, answer form, hint, independent check) — unchanged behavior, just extracted out of `page.tsx`. |
| `ProgressBadge` | `src/app/components/progress-badge.tsx` | The small "n/total" bar reused in the sidebar and the chapter header. |
| `ChapterIcon` | `src/app/components/chapter-icon.tsx` | A decorative color + glyph per domain, purely for quick visual recognition in the sidebar and chapter header. |

### Course overview and topic detail (UI-1)

| Piece | File | Role |
|---|---|---|
| `CourseOverview` | `components/course-overview.tsx` | Chapter sections with `ProgressBadge` and topic cards; Practice and Mastery are separate rows. A topic is a link only when the server plan offers it. |
| `TopicDetail` | `components/topic-detail.tsx` | Status, availability note and a "Related skills" table from the catalog prerequisites. |
| `CourseBreadcrumb`, `CourseLink` | `components/` | Breadcrumb with `aria-current="page"`; real anchors that use `pushState`. |
| `course-route.ts` | `src/app/` | Strict URL parse/build/resolve. |
| `use-program-resource.ts`, `learner-data.ts` | `src/app/` | Program-tagged, zod-validated loading that discards stale responses. |

URLs: `/` default activity; `?program=P&view=overview[&domain=D]`;
`?program=P&domain=D&skill=S`. Unknown or mismatched links fall back to the
overview with a fixed notice (no input echoed) and fetch no content. Only an
`offered` topic starts a session, via the existing start-session server.
"Confirmed" means independently confirmed, never course completion; unknown
status is shown as unknown. Quiz-gated next (UI-2) is not included.

An already-authorized (loaded or resumed) session is never hidden by the
advisory plan; the plan only decides whether a new topic session is requested.
Attempt, hint and check state stays with its session across overview/back
navigation, and returning to `/` restores the default activity (the server
resumes it) instead of a topic session opened meanwhile. Session responses
are validated for every field the UI reads, including recorded attempts and
the figure; an invalid optional field fails the load with a retry.

`page.tsx` keeps all state and data fetching; it computes `chapters` with
`buildChapters` and decides what's "active" by matching the loaded
session's `content.skillCode` to a chapter item (`chapterForSkill`) — see
the code comments in `page.tsx` for why this, rather than a
plan-recommendation guess, is what keeps the page's default landing
activity deterministic.

## Visual language

- Palette tokens live in `src/app/globals.css`'s `:root` (and its
  `prefers-color-scheme: dark` override). `--color-progress` is the one
  shared accent for progress fills and confirmed-skill icons; it's
  decorative only (~3.7:1 against the surface/background in both themes —
  clears the 3:1 bar WCAG 2.2 sets for graphical objects, not the 4.5:1 bar
  for text), so it must never be used for text.
- Per-chapter color + glyph (`chapter-icon.tsx`) is also decorative-only,
  for the same reason: it's never behind text, so it only has to clear the
  graphics contrast bar, not the text one. The five Grade 6 Math domains
  each get a bespoke color + glyph (`CHAPTER_COLOR`, the `GlyphFor` switch).
  Enrichment-program domains (`mk6-*`/`moems6-*`/`amc8-*`/`mc6-*`/`snsb6-*`)
  get a color per *program* instead of per domain
  (`PROGRAM_COLOR_BY_PREFIX`, matched by domain-code prefix), and a glyph
  chosen by keyword match on the domain code (`enrichmentGlyph`) from the
  same small shape vocabulary — e.g. any domain containing
  "counting"/"probability"/"combinatorics" gets the dice glyph regardless
  of which program it's under. All `snsb6-*` domains share one book glyph,
  since the linguistic categories (orthography, morphology, etymology, ...)
  don't map to a geometric motif the way the math ones do.
- Buttons are pill-shaped (`--radius-pill`) and bold; cards use `--radius`
  (14px). Both are global tokens — changing the "friendliness" of shapes
  sitewide (and on `/parent`, `/help`) means changing the token once in
  `globals.css`, not thirty component files.
- Every visual change here must stay inside `npx playwright test
  tests/browser/accessibility.spec.ts`'s axe pass (WCAG 2.2 AA) — that's
  the actual check, not a visual judgment call.

## Onboarding a new program's chapters

A new program (another Math Kangaroo-style contest, a Geography Bee, a new
grade) gets this chapter navigation automatically once it's in
`PROGRAM_ROSTER` (`src/curriculum/program-roster.ts`) with its skills
carrying real `domain` values, because `buildChapters` is generic over
whatever domains a program's skills use. Two small, purely-cosmetic things
are worth doing so it doesn't look unfinished:

1. Add the new domain(s) to `CHAPTER_LABELS` in `learner-chapters.ts` (a
   human-readable title instead of the humanized domain code) and confirm
   where they land in `CurriculumDomainSchema`'s declared order (that order
   is the chapter order).
2. For a brand-new *program* (a new prefix, e.g. a Geography Bee's
   `geo6-*`), add one entry to `PROGRAM_COLOR_BY_PREFIX` in
   `chapter-icon.tsx` and, if none of `enrichmentGlyph`'s existing keyword
   matches fit, one more `if` there or a dedicated case in `GlyphFor`. For
   one more domain under an *existing* program's prefix, nothing is
   needed — it inherits that program's color automatically, and its glyph
   resolves from the keyword match (or the star fallback if no keyword
   fits, which is a reasonable default, not a bug).

Neither step is required for the chapter UI to work; both are what make a
new subject look like it was designed for, not just technically supported.

## Curriculum resources (SOURCES-1)

The main page's primary navigation links to `/resources`, an adult-facing
reference index. It is not part of the chapter, quiz, or progression flow and
never reads or writes learner state.

- **Single source of truth.** `docs/curriculum-sources.md` is parsed at
  request time by `src/sources/register-parser.ts` (read via
  `src/sources/register.server.ts`, cached by file mtime). There is no second
  citation list. Each register-table row becomes one record; URLs cited only in
  dossier prose become URL-only records. Scope notes, handoff text, open
  questions, and every other part of a dossier are not projected.
- **Stable references.** A record id is `<dossier-slug>-<hash of the row text>`:
  it survives reordering and unrelated edits, and changes only if that row's
  own text changes. `/resources?ref=<id>` is the permalink.
- **Faithful metadata.** Title, issuer, edition/date (every `;` segment),
  retrieval date, and access notes are extracted from the recorded text only;
  anything that cannot be extracted renders as an explicit "unknown / not
  recorded", and the full citation is always available. A dossier-wide
  retrieval date (for example "all sources retrieved 2026-09-18") is inherited
  by entries without their own and labelled as recorded for the whole dossier.
  No remote fetch happens, and the page makes no claim that a link works.
- **Adult reference, not a recommendation.** The page is public (no new auth;
  it shows only register citations, no personal data) and is a parent-oriented
  reference, not a learner-safe list. Resources may include contest solutions
  or answer keys; adults should review them before learner use. Pending
  dossiers appear as pending citations, never as lessons.
- **Link policy.** `src/sources/link-policy.ts` is technical validation only,
  not a suitability review: an address becomes a link only if, exactly as
  recorded, it is HTTPS with no credentials, no non-default port, a well-formed
  public DNS host (no IP, `.local`/`.localhost`/internal names, empty labels,
  or percent-encoded host), and nothing sensitive in its path, query, or
  fragment even after bounded repeated percent-decoding (anything that does not
  settle fails closed). Links open with `rel="noopener noreferrer"` in a new tab
  and say they leave Learning Forge and are not reviewed for children. `http:`
  and other schemes stay as text. No host is endorsed.
- **Redaction.** `src/sources/redaction.ts` judges each address from the raw
  register text *before* any text redaction, so an altered address is never
  shown as a different working destination. An address with credentials,
  tracking or sensitive query/fragment, encoded controls, or private paths is
  never a link: it is shown unlinked with only its scheme and host (or a fixed
  marker) and a "withheld" reason, and the descriptive title/issuer/support
  metadata stays. Emails, secret-shaped values, digests, `/private/...` and
  assessment paths, and learner/profile fields in any projected text (citation,
  support, status, labels) become visible withheld markers. A consequence: the
  register's Google Drive download link (its query carries a file id) is listed
  without a link. Search text that looks sensitive is dropped with a fixed
  notice and is never echoed.
- **Failure handling.** `loading.tsx` and `error.tsx` give the route a loading
  state and a redacted retry; a missing, unreadable, or empty register throws a stable path-free
  error (`SOURCE_REGISTER_UNAVAILABLE` / `SOURCE_REGISTER_INVALID`) rather than
  rendering an empty index or leaking a filesystem path to logs. `next.config.ts` traces the register file into the
  production bundle for `/resources`.
- **Status wording.** Dossier status (approved / pending / informal) is
  research status only. The page states that it is not content approval and
  does not say whether anything is served to learners.

## Known rough edges (presentation-layer scope, not deferred by accident)

- `enrichmentGlyph`'s keyword matching is a heuristic over domain codes,
  not a curated per-domain choice — it's deliberately coarse (one shape per
  broad category: counting/probability, arithmetic/number, geometry,
  algebra/data, proportional/ratio, logic) rather than one bespoke icon per
  domain. Good enough to tell programs and rough categories apart at a
  glance; not meant to carry precise meaning the way the five core Grade 6
  Math glyphs do.
- Per-topic attempt counts and server lock reasons are not in the current
  API; the UI says so instead of inventing them.
