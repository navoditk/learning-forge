# UI implementation playbook

Durable procedure for designing and implementing learner and parent user
interface increments. This playbook is the source of procedure; the
`ui-implementation` skill and `ui-implementer` agent profile are thin wrappers
and, where they differ, this playbook governs. Any tool can do this work from
this file, `AGENTS.md`, and the documents it names.

## Scope and non-goals

- Presentation only. The UI reads data the server already authorizes. It
  never decides mastery, unlock, placement, or assessment eligibility.
- Do not change C4/C5 gates, progression authorization, scoring, or contracts
  of programs that are explicitly non-assessed. A UI increment that needs such
  a change stops and is routed to the course-progression playbook
  (`docs/course-progression-playbook.md`).
- Do not add dependencies, embedded external browsing, trackers, or analytics
  without an approved decision.

## Read first

`AGENTS.md`, `docs/learner-presentation-design.md`,
`docs/course-progression-handoff.md` (for anything touching progression),
`docs/parent-reporting.md` (parent surfaces), `docs/PROGRESS.md`, and
`docs/agent-orchestration.md` (model routing). Re-derive current behavior from
code (`src/app/page.tsx`, `src/app/learner-chapters.ts`,
`src/app/components/*`, `src/curriculum/pilot-catalog.ts`) before proposing
anything; design documents are aspirations, not evidence.

## Models and escalation

Default implementer: Claude Sonnet 5.5. Escalate to Claude Opus 5.5 when the
increment spans several subsystems, changes shared state or contracts, or a
first attempt fails its measurable evidence twice. Record the model actually
used in `docs/PROGRESS.md`. The implementer never reviews its own work; see
`docs/ui-review-playbook.md`.

## Design requirements

The ratios learner page is a floor, not a ceiling. Reuse its modules
(`ChapterSidebar`, `ChapterView`, `ActivityPanel`, `ProgressBadge`,
`ChapterIcon`, `buildChapters`) and extend them rather than forking.

### 1. Navigation

- Rich, clickable course → unit → topic (chapter/lesson/skill) navigation:
  every level is a real link or button with an accessible name, a current
  location indicator (`aria-current`), breadcrumbs, and deep-linkable state.
- Locked items are visible but not activatable, with a text reason supplied by
  the server (not guessed client-side). Navigation to a locked item must not
  reveal content the learner is not entitled to.
- Navigation is presentation: opening a topic never grants authorization.

### 2. Honest progress

- Display _visited/completed activity_ and _mastery_ as separate, differently
  labelled measures. Never render a completion bar as mastery. "Confirmed"
  appears only for server-confirmed mastery evidence.
- Every progress figure must come from server data and be explainable
  ("3 of 8 practice items done", "mastery not yet confirmed"). No optimistic
  client-side advancement.

### 3. Subject visuals

- Visuals must carry subject meaning (for example number lines, tape/double
  number line and ratio tables for ratios, area/array models, graphs). They
  are generated from authored, reviewed data, not decoration alone.
- Every informative visual has a text alternative or an equivalent data table;
  purely decorative glyphs are `aria-hidden`. Visuals must not reveal an answer
  before the tutoring policy permits it.

### 4. Flash cards (optional)

- Only for facts suited to recall (vocabulary, notation, facts). Not for
  reasoning or multi-step skills.
- Flash-card results are never authoritative mastery evidence, never feed the
  mastery calculation or parent mastery claims, and are labelled as
  self-check. They are feature-flagged and optional.

### 5. Quiz-gated NEXT (future assessed tracks)

- For future assessed learning tracks, the NEXT level/topic control is
  mandatory-gated: it is enabled only when the server-approved policy says the
  quiz is passed, using held-out assignments served by the assessment API.
  The client never computes the pass decision, never holds held-out items or
  answers beforehand, and fails closed (disabled with a reason) on error.
- Existing C4/C5 gates stay exactly as implemented. Programs whose contracts
  are explicitly non-assessed keep their current free-navigation behavior; a
  quiz gate is applied only where a reviewed track contract declares it.
- No threshold, pass bar, delay, or weight appears in UI code or copy beyond
  what the server returns (`docs/course-progression-decisions.md` owns them).

### 6. Source links

- A source link on the main page is permitted only from a reviewed, safe-link
  list with authoritative attribution (publisher, title, license where
  relevant). Open as a plain external link (`rel="noopener noreferrer"`),
  labelled as leaving the app. No embedded external browsing, iframes,
  trackers, or remote scripts; no unreviewed content; never link or render
  held-out assessment data.

## State and layout requirements

- Responsive from narrow phones to desktop; light and dark themes via the
  existing tokens in `src/app/globals.css`. Text meets 4.5:1 contrast and
  graphics 3:1 in both themes.
- WCAG 2.2 AA: full keyboard operation, visible focus not obscured, target
  size, logical focus order and focus management on view changes, landmarks,
  headings, live-region announcements for async status, screen-reader names.
- `prefers-reduced-motion` honoured; no essential information via motion.
- Every data-driven view has explicit loading, error, empty, locked, and retry
  states, each with text and an accessible announcement. Retry never
  double-submits a mutation.
- Version and scoping safety: requests and rendered data are scoped to the
  active learner and program and carry the curriculum/policy version; stale or
  mismatched-version responses are discarded or shown as an error, and one
  learner's data never renders in another's session.
- Child privacy: no extra profile data to any provider; no secrets, free-form
  child text, or held-out data in logs, URLs, or fixtures.

## Procedure

1. State assumptions and a small plan; name one issue-sized increment.
2. Inspect existing components and tests; reuse before adding.
3. Write tests first or with the change (below), then implement.
4. Run the validation commands and record exact results.
5. Update `docs/learner-presentation-design.md` for changed conventions and
   `docs/PROGRESS.md`. Do not commit or push unless asked.
6. Hand off to an independent reviewer (`docs/ui-review-playbook.md`).

## Measurable evidence

"Looks rich" is never sufficient. Each requirement above maps to a passing
check, using existing commands:

| Evidence                                                  | Command                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| Unit/component tests (navigation, progress, gating logic) | `npm test`                                                  |
| Format, lint, types                                       | `npm run format:check && npm run lint && npm run typecheck` |
| Production build                                          | `npm run build`                                             |
| Primary learner/parent journeys, keyboard paths, states   | `npm run test:e2e`                                          |
| Persistence/assignment integration where touched          | `npm run test:integration`                                  |
| Full gate                                                 | `npm run verify`                                            |

Tests must assert: each state (loading/error/empty/locked/retry) renders;
completion and mastery are labelled separately; NEXT is disabled when the
server denies and enabled only on approval; held-out data never appears in the
DOM or network payload before permission; link allow-list and `rel`
attributes; keyboard reachability and accessible names; theme tokens meet the
contrast ratios; reduced-motion CSS path. Report the exact command and result;
state anything not run.

## Completion response

Outcome, files changed, commands with results, model actually used, unresolved
risks, next recommended issue.
