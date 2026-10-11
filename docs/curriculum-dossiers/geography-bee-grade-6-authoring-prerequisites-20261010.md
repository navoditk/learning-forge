## IAC National Geography Bee Grade 6 — authoring prerequisites specification — 2026-10-10

**Status: Proposed specification only, revision 2. Ready for bounded
independent re-review, not approved.** This document does not lift D-61,
record a scoped authoring exception, select any open owner decision, author
skills/graph/content, or change runtime, schema, registry, policy, test or
content files.

Revision 2 corrects revision 1 (SHA-256
`2e47cc46dd2fd9d3860f2e60f82f1de0b385eb630eb65d4115c2b096ae0c3338`)
against the cross-family review in
`geography-bee-grade-6-authoring-prerequisites-20261010-review.md`
(reviewer task `ff96473b-d338-436b-baaa-f532cc0f8b9a`, `gpt-6.1-sol`,
coordinator-verified): F1 one first vertical slice instead of a six-skill
wave; F2 one conditional dependency table separating first-draft gates
from later and release gates; F3 draft-skill publication protection as an
executable pre-merge condition; F4 pending-aware test changes; F5 ORQE item
shape separated from optional whole-exam source metadata.

Owner research/source approval for this program was recorded on 2026-10-10
("spelling bee and geography bee look good as well"). That approval is
research/sources only. **No independently verified research review exists for
the Geography dossier**; `GEO-REVIEW` in `docs/development-expansion-plan.md`
remains open, and this specification does not claim or substitute for it.

### Pinned inputs

Inspected in worktree `authoring-prereqs-geography` at `HEAD`
`4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`. Docs carry uncommitted
coordinator changes; source/content/policy/test/script trees are unmodified
from `HEAD`. SHA-256 prefixes (first 16 hex) of the working copies read:

| File                                 | SHA-256 prefix     |
| ------------------------------------ | ------------------ |
| `docs/curriculum-sources.md`         | `c53220957d22bd88` |
| `docs/development-expansion-plan.md` | `58ba797ebe70481c` |
| `docs/PROGRESS.md`                   | `535cd60747a7971a` |
| `src/contracts/content.ts`           | `5a047b27abc0ccbb` |
| `src/contracts/progression.ts`       | `14ec51e9df272a5a` |
| `src/contracts/curriculum.ts`        | `a426d31a11cd4571` |
| `src/content/catalog.ts`             | `c560d0e1da3e34d1` |
| `src/content/answer-matching.ts`     | `260ab821bf0b876a` |
| `src/curriculum/program-registry.ts` | `98eb5f47f5938387` |
| `src/phase1/service.ts`              | `7ef7df19bed73b0d` |

Governing documents read: `AGENTS.md`, `README.md`, latest `docs/PROGRESS.md`
entries, `docs/02-curriculum-and-pedagogy.md`, `docs/03-system-architecture.md`,
`docs/05-data-and-student-model.md`, `docs/curriculum-authoring-playbook.md`,
`docs/content-authoring-pipeline.md`, `docs/content-review.md`,
`docs/curriculum-agents.md`, `docs/agent-orchestration.md`, D-61 in
`docs/course-progression-decisions.md`, the "IAC National Geography Bee Grade
6 research — 2026-09-19" section of `docs/curriculum-sources.md`, and
`docs/development-expansion-plan.md`.

No web retrieval, official question/archive access, map copying, or new fact
research was performed. Every competition fact below is restated from the
approved dossier section and is no more current than that dossier.

### 1. Program identity and naming (proposed decision, not a rename)

| Aspect               | Current repository state                                                            | Dossier fact / proposal                                                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Program identifier   | `international-geography-bee-6` in `PROGRAM_CODES` and the registry                 | **Retain unchanged.** Identifier is an internal stable key; renaming would touch codes, policy files and references.                                                                                                                                                                 |
| Learner-facing label | `International Geography Bee (Grade 6)` (registry placeholder)                      | Official current U.S. name is **National Geography Bee** (IAC U.S.); IAC states it was called International Geography Bee in the U.S. before 2023-2024. Dossier recommends **National Geography Bee (IAC U.S.; formerly International Geography Bee in the U.S.)**. Owner choice H1. |
| Pedagogy doc wording | `docs/02-curriculum-and-pedagogy.md` says "International Geography Bee preparation" | Update only after H1 is chosen, in the same change as the registry label.                                                                                                                                                                                                            |
| Division             | Not encoded                                                                         | Standalone **6th Grade Division**. Not a Grades 5-6 or Middle School band.                                                                                                                                                                                                           |
| Skill-code prefix    | `skillCodePrefix: null` (unenforced)                                                | Dossier handoff: `igb6-`. Must be set before the first skill exists (P1).                                                                                                                                                                                                            |
| Standards codes      | None                                                                                | Dossier handoff: repository-owned `LF-IAC-NGB6-<DOMAIN>-<NN>`; they are Learning Forge codes, not official IAC standards.                                                                                                                                                            |
| Adjacent programs    | Not present                                                                         | US Geography Bee, US Geography Championships, National Geography Bowl, International Geography Championships stay separate/deferred.                                                                                                                                                 |

The `igb6-` prefix (legacy name) and `NGB6` standards segment (current name)
intentionally coexist per the dossier handoff; the reviewer should confirm
that this mixed naming is acceptable or route it into H1. Learner-facing copy
must not imply endorsement by, or affiliation with, IAC or any similarly
named organization.

### 2. Competition stages are distinct formats

Restated from the dossier; none may be conflated into a single "contest" bucket.

| Stage                       | Dossier-recorded mechanics                                                                                                     | Proposed product treatment                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| ORQE (online qualifier)     | Free, 50 questions, four choices, 20 minutes, no wrong-answer penalty; about half use a map, photo, chart or comparable visual | First contest-format target (written, deterministic). Needs the ORQE item shape (P3).                                   |
| Regional Tournament         | Three preliminary and one final buzzer round, 30 pyramidal questions each; race-to-five rules per the Regional rules sheet     | Deferred (`BUZ`). Needs an approved clue-segment/pyramidal contract before any record.                                  |
| National preliminary rounds | Four preliminary buzzer rounds with their own scoring, timing, penalties, advancement and tiebreaks                            | Deferred; distinct format identifier from Regional even when both are buzzer-style.                                     |
| National playoffs           | Age-division playoffs; scoring document accessible but unlinked                                                                | **Out of scope.** Do not encode as durable 2027 metadata (dossier item 6). No playoff or International readiness claim. |

Operational dates, locations and site counts (including the unresolved
four-versus-seven Regional wording) are never encoded in content.

### 3. Later coverage roadmap after the first slice (owner choice L1; not selected here)

This is later coverage, not the first increment (section 8 selects that).
Recommendation: grow from the first slice into **durable geography plus
visual interpretation** that avoids claims whose truth changes over time and
avoids real-world cartographic geometry until a base-geometry source is
approved.

| Dossier domain code | Later wave?        | Reason                                                                                                              |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `MAP`               | Yes                | Map/chart/geospatial literacy is durable and can use original schematic or fictional maps with synthetic data.      |
| `PHY`               | Yes                | Physical-systems concepts (landforms, water, climate patterns) are durable.                                         |
| `WRG`               | Yes, text-first    | Continents, oceans and major world regions are durable; real-place locator maps wait for L3.                        |
| `HUM`               | Yes, concepts only | Population distribution, urbanization and migration as neutral concepts; no generalizations about specific peoples. |
| `POL`               | Deferred           | Sovereignty, capitals, names and borders can change or be disputed; volatile items need L2; names need L5.          |
| `ECO`               | Deferred           | Economic rankings and statistics are dated data; volatile items need L2.                                            |
| `HIS`               | Deferred           | Needs a neutral-framing review standard for contested historical narratives.                                        |
| `CUR`               | Deferred           | Requires the as-of/source-set/cadence/retirement policy (dossier item 4, L2).                                       |
| `BUZ`               | Deferred           | Requires a pyramidal clue-segment interaction contract; not representable today.                                    |

The dossier's breadth signals (26 world/regional slots plus four concept
slots per 30-question set) are tournament-level, not a grade syllabus and not
a sequence. Any order is a Learning Forge synthesis driven by prerequisites.

### 4. Answer acceptance (structured, deterministic, no LLM judgment)

Existing contract reused: `DeterministicValidatorSchema` (`text`,
`multiple_choice`), `matchesAcceptedAnswer`/`normalizeAnswer` in
`src/content/answer-matching.ts`, called by `src/phase1/service.ts` and
`src/progression/assessment-submission.ts`. Mastery comes only from validator
outcomes through the existing progression profile. No model output may mark a
response correct, widen accepted answers at runtime, or count as mastery
evidence.

Observed gaps relevant to place names:

1. `normalizeAnswer` only trims, lowercases, collapses whitespace, strips
   trailing punctuation and respaces `;`/`,`. It does not fold diacritics,
   unify typographic and straight apostrophes, treat hyphen/space variants, or
   handle a leading article. These must be explicit authored variants today.
2. The normalizer is shared with Spelling Bee, where exact orthography is the
   skill. **Any geography normalization must be opt-in and validator-scoped,
   never a change to the global normalizer.**
3. Composite `parts` use substring matching, so a short place name matches
   longer different names that contain it. Place-name answers must not use
   `parts` unless a token-boundary rule is specified and tested.
4. `acceptedAnswers` is capped at 20 strings of 200 characters. Items whose
   reasonable variants exceed this are out of scope rather than raised.
5. No fuzzy, phonetic or semantic matching. Misspelling tolerance beyond an
   approved deterministic normalization is a human choice (L5), defaulting to
   none.

Variant and ambiguity authoring rules (proposed):

- Accept the current short-form name used in the item plus reviewer-approved
  conventional English forms; list each in `acceptedAnswers` and justify in
  `equivalenceNotes`.
- Former names are accepted only when the item is explicitly about a dated
  period, which is outside the initial scope.
- Avoid items whose correct answer depends on disputed sovereignty, a
  contested name, or a boundary in dispute. Where unavoidable later, the item
  must state its framing and as-of date, and needs L2 policy first.
- Each item must have exactly one defensible answer under its own stated
  conditions; superlatives ("largest", "longest") need the measure stated.
- Multiple-choice records must accept the choice text and the displayed
  letter only once letters are actually displayed (section 7).

### 5. Visuals, accessibility and rights

Existing contract reused: `ContentFigureSchema` (static SVG subset, required
`altText` up to 1000 characters and `caption`, size bounds, no scripts, links,
styles or external references), `svgDataUri`, the learner `activity-panel`
figure rendering, and the public-site figure rendering. No new renderer is
proposed for the initial scope.

Rules:

- Only original Learning Forge SVGs, or separately rights-cleared visuals with
  a recorded license. IAC maps, charts, photos, diagrams, study-guide visuals,
  clue text and clue order may not be copied, traced or closely adapted.
- Initial visuals are schematic or fictional-region maps and synthetic-data
  charts, labeled as such. Real-world base geometry requires a separately
  researched and approved source and license (L3); none is approved and none
  was researched here.
- Each visual item must be fully answerable from text alone: the complete
  text alternative conveys every relationship needed (legend, direction,
  scale, relative position, data values) without stating the answer.
- No meaning by color alone; labels and patterns must carry distinctions.
- SVG markup must stay within the 12,000-character limit; complexity beyond
  that is a scope signal, not a reason to raise limits.
- No photographs in the initial scope (no rights-cleared photo source).

### 6. Neutral framing and privacy

- Academic, neutral, descriptive tone. No stereotypes, rankings of peoples,
  religious or ethnic generalizations, or value judgments about cultures,
  governments or territorial claims.
- Use fictional places for any "local" or route scenario. Never ask for, infer
  or reference the learner's home, school, city, route, or current location;
  never use device geolocation. The learner's Irvine, California context is a
  scoping fact only and must not appear in prompts, content or provider calls.
- Tutor prompts send no additional child profile data for this program.

### 7. Dependency table for the selected first slice

One owner serializes shared schema/registry/site changes; each row is an
independently reviewable change. Nothing here is implemented in this
worktree. Column "First draft" means required before the first slice's
skill or practice JSON merges as `pending_review`; "Before availability"
means required before `available: true`; "Later" means not required for this
slice.

| ID  | Gap observed in current code                                                                                                                                                                                                                                      | Required change (reuse, no new abstraction)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | When                                         | Required tests                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Registry placeholder has `subjectKind: 'enrichment-non-graded'`, `skillCodePrefix: null`, so prefix isolation is unenforced                                                                                                                                       | Explicit registry record: `subjectKind: 'enrichment-contest'`, `skillCodePrefix: 'igb6-'`, `progressionMode: 'skill-graph-only'`, `available: false`; reuse existing access/profile policy files unchanged                                                                                                                                                                                                                                                                                                                                                   | First draft                                  | Negative fixtures through the production `validateProgramSkillInvariants`/`PROGRAM_REGISTRY`: an unprefixed Geography skill and a cross-program prerequisite are rejected. `tests/progression/cross-program-fixtures.test.ts` today only has positive available-program checks; add the unavailable-program rejection cases rather than claiming they exist |
| P2  | `CurriculumDomainSchema` has no Geography domain; `DOMAIN_LABELS` (exhaustive), `CHAPTER_LABELS`, `PROGRAM_COLOR_BY_PREFIX` and the chapter glyph lack `igb6-` entries                                                                                            | Add exactly one domain for the slice's `MAP` skill to the existing enum and maps                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | First draft                                  | Typecheck covers `DOMAIN_LABELS`; assert the new domain has a chapter label                                                                                                                                                                                                                                                                                 |
| P3  | `ContestFormatSchema.format` has no ORQE value; every non-MATHCOUNTS `answerChoices` must be exactly five A-E; `pointValue` is required although the dossier records no ORQE point value                                                                          | **Item shape only:** a distinct ORQE format value; exactly four unique A-D choices for that format; `pointValue` not required for that format (no invented value); catalog rule (mirroring the AMC 8 block) requiring canonical answer among choices and distractor rationale plus declared misconception code                                                                                                                                                                                                                                               | First draft (contest item)                   | Schema: ORQE accepts four A-D and rejects five or duplicate labels; existing five-choice and free-response formats unchanged. Catalog: ORQE contest item without canonical-among-choices or distractor rationale rejected                                                                                                                                   |
| P3m | `questionCount` max is 40; ORQE source exam is 50 questions, 20 minutes, no wrong-answer penalty                                                                                                                                                                  | **Optional** whole-exam source metadata. If included, allowed values constrained for ORQE only and documented as the source competition format, not the practice session's length or timing. Not needed to author one item                                                                                                                                                                                                                                                                                                                                   | Optional                                     | If adopted: single-item record valid without exam metadata; ORQE metadata other than the dossier values rejected; other formats' 40 cap unchanged                                                                                                                                                                                                           |
| P4  | `publishableContentProjection` (`src/content/publication.ts`) excludes pending content but not skills; `scripts/generate-curriculum-site.ts` renders every skill of an unavailable program under a "Draft" badge and counts it; `SkillSchema` has no review state | Public site excludes a skill unless its program is available **and** the exact skill version has reviewed publishable content; hidden skills are also omitted from navigation, counts ("standards covered", problems), and from visible prerequisite names/counts. A badge is not approval. Any earlier skill publication needs a separately approved explicit allowlist (L6). A coordinator-owned implementation is reported in progress outside this worktree with 33 passing tests but is not yet independently judged; it satisfies P4 only after review | First draft (pre-merge acceptance condition) | Synthetic site/projection tests: an unavailable Geography draft skill (and a pending practice record) is absent from the public graph, navigation, prerequisite listings and counts; a skill version without reviewed content is hidden; existing approved programs render unchanged                                                                        |
| P5  | `tests/content/catalog.test.ts:37-51` hard-codes 128 total / 128 reviewed / 0 pending; the MATHCOUNTS self-audit requires reviewed status, owner/date and servable presence                                                                                       | Convert the hard-coded totals into a baseline for the already-approved programs; add a Geography audit asserting the slice's exact selected records, `pending_review` status and absence from `servableContentCatalog` and `publishableContentProjection`. Mirror subject/coverage checks, not release-state assertions. Never mark Geography reviewed to satisfy tests                                                                                                                                                                                      | First draft                                  | Baseline programs keep their reviewed/date assertions; Geography audit: `igb6-` prefix, `LF-IAC-NGB6-MAP-01`, exact record IDs/roles/modes, owned provenance, canonical answer accepted, no `parts` on place/direction answers, pending and non-servable; `npm run content:validate` passes                                                                 |
| R1  | No Geography tutor eval cases                                                                                                                                                                                                                                     | Add cases to the existing eval harness                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Before availability                          | Answer leakage, hint progression, prompt injection, neutral framing, refusal to request learner location                                                                                                                                                                                                                                                    |
| R2  | Learner session shows prompt and figure (`altText`) only; no `answerChoices`, no `accessibleAlternative`                                                                                                                                                          | None if the slice displays A-D choices inline in the prompt and all map data fits the prompt or `altText`. Otherwise stop and route to X1/X2                                                                                                                                                                                                                                                                                                                                                                                                                 | Before availability                          | Browser/accessibility check that the displayed letters, choices and all needed map data are perceivable by keyboard and screen reader                                                                                                                                                                                                                       |
| X1  | Choice metadata is not projected (also affects existing AMC 8/Math Kangaroo)                                                                                                                                                                                      | Project label/text only (never rationale or misconception) with accessible selection; separate cross-program issue                                                                                                                                                                                                                                                                                                                                                                                                                                           | Later                                        | Projection excludes rationale/correctness; letters accepted only when displayed                                                                                                                                                                                                                                                                             |
| X2  | `accessibleAlternative` not projected                                                                                                                                                                                                                             | Project and render for figure items whose data exceeds prompt/`altText`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Later                                        | Figure item exposes the full text alternative without the answer                                                                                                                                                                                                                                                                                            |
| X3  | Leakage scan covers hint text only                                                                                                                                                                                                                                | Optional defense in depth over figure text/`altText`/caption/`accessibleAlternative`; displayed choices and necessary map labels may legitimately contain answer terms, so the scan cannot prove non-leakage                                                                                                                                                                                                                                                                                                                                                 | Later                                        | Targeted rule tests if adopted                                                                                                                                                                                                                                                                                                                              |
| X4  | Shared `normalizeAnswer` cannot fold diacritics/apostrophes without changing Spelling Bee grading; `parts` substring hazard                                                                                                                                       | Only if L5 requests tolerance: opt-in, validator-scoped normalization (default off). Default is exact authored variants under the current scorer                                                                                                                                                                                                                                                                                                                                                                                                             | Later                                        | Spelling Bee unchanged; flagged validator folds only approved classes                                                                                                                                                                                                                                                                                       |
| X5  | No as-of/review-by metadata                                                                                                                                                                                                                                       | Only with L2, for volatile `CUR`/`POL`/`ECO` items; stable items need no expiry machinery                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Later                                        | Expired records excluded from servable catalog and planner                                                                                                                                                                                                                                                                                                  |
| X6  | Live catalog is practice-only; access policy denies lesson/unit/delayed-check assessments                                                                                                                                                                         | Only if L4 selects an assessed track                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Later                                        | —                                                                                                                                                                                                                                                                                                                                                           |

Existing behavior that must remain unchanged: other programs' grading and
format rules, the legacy exact-two invariant for legacy skill-graph-only
records, Spelling Bee exact orthography, pending-review exclusion from
servable and public catalogs, and the availability guard in
`src/phase1/program.ts`.

### 8. Proposed first vertical slice (owner proposal, not a decision)

One skill, two `practice` records. Codes are proposals; no question text,
answer, choice set or map is defined here.

- **Skill:** `igb6-map-direction-reading`, standard `LF-IAC-NGB6-MAP-01`
  (Learning Forge code), one `MAP` domain, no prerequisites, difficulty
  bands limited to those the two records use.
- **What it assesses:** identifying the cardinal or intermediate direction
  from one labeled feature to another on an **original fictional schematic
  map** with a compass rose. It does not claim legend, scale, grid,
  latitude/longitude, real-place knowledge or any other map demand.
- **Record 1 — `practice` / `core`:** free-response direction answer;
  deterministic `text` validator with explicitly authored variants (full
  word, hyphen/space forms, standard abbreviation) and no `parts`; hint
  ladder that does not leak the direction; figure plus prompt or `altText`
  giving every relative position needed.
- **Record 2 — `practice` / `contest`, ORQE-style:** one four-choice A-D
  item using the P3 item shape, choices displayed inline in the prompt;
  `multiple_choice` validator accepting the displayed letter and choice
  text; distractor rationales tied to declared misconception codes;
  same figure/text-equivalence rule.
- **Dependencies:** P1, P2, P4, P5 for both records; P3 for record 2.
  R1 and R2 before availability. No X item.
- **Narrower fallback:** if P3 is not ready, the owner may approve a
  core-only slice; the P5 audit then asserts exactly that one record. A
  contest item is never authored with five-choice or undisplayed metadata.
- **Stop criteria:** stop and report rather than expand if the needed map
  relationships do not fit the prompt/`altText` limits, if text
  equivalence cannot be achieved without revealing the answer, if the SVG
  exceeds the existing subset/size limits, if more than 20 accepted
  variants would be needed, or if any record would need IAC material.
- **What it is not:** a recognition/visual-literacy sample only. It is not a
  50-question exam, geographic breadth coverage, oral or buzzer
  preparation, timing practice, or competition readiness.

All records: `provenance.origin` `original` or `llm_drafted`,
`licenseStatus: "owned"`, `review.status: "pending_review"`, and an
originality statement that no IAC material was used. Section 3 is the later
roadmap after this slice is reviewed.

### 9. Owner choices

**Required for the first slice (not selected here):**

| ID  | Choice                              | Recommendation                                                                                  |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| H1  | Learner-facing label                | "National Geography Bee (IAC U.S.; formerly International Geography Bee in the U.S.)" (Grade 6) |
| H2  | Bounded first-slice scope           | The section 8 slice (or its core-only fallback); ORQE-style item practice only                  |
| H3  | Dated D-61 lift or scoped exception | Required before any writer starts; record in `docs/course-progression-decisions.md`             |

**Established defaults, not separate gates for this slice:** retain the
`international-geography-bee-6` identifier (dossier handoff); original
fictional schematic visuals with full text equivalence; existing
skill-graph-only practice mode and access policy; exact authored answer
variants with no extra normalization.

**Later choices (not required for the first slice):**

| ID  | Choice                                                                                  | Needed before                                |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| L1  | Broader coverage and mechanics scope (section 3; Regional/National preliminary formats) | Any skill beyond the first slice             |
| L2  | Current-geography as-of date, source set, review cadence, retirement                    | Any volatile `CUR`/`POL`/`ECO` item          |
| L3  | Real-world base-geometry source and license                                             | Any real-place map                           |
| L4  | Assessed track (units, banks, D-01 handling)                                            | Any assessment/review/teaching record        |
| L5  | Misspelling or normalization tolerance                                                  | X4                                           |
| L6  | Explicit skill-publication allowlist before reviewed content                            | Publishing any skill earlier than P4 permits |

### 10. Gates that still apply

1. **Comprehensive independent Geography research review** (`GEO-REVIEW`):
   not performed; required before authoring by the parallel work graph in
   `docs/agent-orchestration.md`. Owner source approval (2026-10-10) and
   the bounded spec review do not substitute for it. No new research is
   proposed here.
2. **Re-review of this specification** and human acceptance.
3. **D-61** (H3) and owner choices H1-H2.
4. **First-draft engineering prerequisites** P1, P2, P4, P5 (plus P3 for the
   contest record), each with tests and review.
5. **Authoring** per `docs/curriculum-authoring-playbook.md` and
   `docs/content-authoring-pipeline.md`; records `pending_review`.
6. **Independent content review** per `docs/content-review.md`: answer
   re-derivation, originality against IAC materials, text equivalence,
   neutral framing, variant completeness.
7. **Human content approval** sets `reviewed` with date.
8. **Before availability:** R1, R2 and applicable release gates; the
   `available: true` flip is a separate change.

### 11. Engineering invariants (not owner-selectable)

- Program isolation: `igb6-` prefix; no cross-program prerequisites; no merge
  with adjacent geography programs.
- Deterministic, structured validators only; no LLM correctness or mastery
  judgment; tutor never reveals the answer before policy permits.
- Pending content and unapproved draft skills never reach learner or public
  surfaces.
- No reproduction or close paraphrase of IAC questions, clues, clue order,
  answer sets, maps, charts, photos or study-guide language.
- Original or rights-cleared visuals with complete text equivalence; no
  color-only meaning; WCAG 2.2 AA.
- No child location data collected, inferred or sent to providers.
- Shared schema/registry/site changes serialized under one owner; no
  persistence change proposed.

### 12. Blockers and evidence

- **Blockers for the first slice:** no comprehensive `GEO-REVIEW`; D-61 not
  lifted (H3); H1-H2 unselected; P1-P5 not implemented in this worktree
  (P4 reported in progress elsewhere, unjudged).
- **Not blockers for the first slice:** L1-L6 and X1-X6.
- **Evidence:** code observations refer to the pinned files above;
  competition facts trace to the dossier source register only.
- **Not done:** no web or official-archive access, no new facts, no content,
  schema, registry, policy, test or runtime edits, no commit.
