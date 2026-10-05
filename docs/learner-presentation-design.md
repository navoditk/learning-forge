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

## Known rough edges (presentation-layer scope, not deferred by accident)

- `enrichmentGlyph`'s keyword matching is a heuristic over domain codes,
  not a curated per-domain choice — it's deliberately coarse (one shape per
  broad category: counting/probability, arithmetic/number, geometry,
  algebra/data, proportional/ratio, logic) rather than one bespoke icon per
  domain. Good enough to tell programs and rough categories apart at a
  glance; not meant to carry precise meaning the way the five core Grade 6
  Math glyphs do.
- Right after a program switch, there's a brief moment where the sidebar
  still shows the previous program's chapters/activity until the new
  program's plan/diagnostic/review/progress all arrive — self-correcting,
  not a stuck state (see the "Keeps the sidebar/chapter-view focus..."
  comment in `page.tsx`), but not instantaneous either.
