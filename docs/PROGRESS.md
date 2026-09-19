# Progress

## 2026-09-19 — Enrichment research fleet completed

- Completed three independent, read-only primary-source investigations and
  added separate pending-review dossiers for Scripps National Spelling Bee
  Grade 6, IAC National Geography Bee Grade 6, and Science Olympiad Division B
  2027 to `docs/curriculum-sources.md`.
- Each dossier records the current framework and format, exact source
  register, official archive search, licensing boundary, product-synthesized
  domain signals, open conflicts, required human decisions, and a conditional
  authoring handoff.
- No curriculum skills or learner content were authored, and all three
  programs remain unavailable pending program-specific product/content-owner
  approval.
- Next: review and resolve each dossier's scope decisions independently before
  invoking curriculum authoring.

## 2026-09-19 — Next enrichment research fleet scoped

- Pushed the completed five-program math curriculum fleet to `origin/main`;
  local and remote `main` were synchronized at `ef5b64b`.
- Added three independent future programs to the curriculum roadmap and
  unavailable program roster: Scripps National Spelling Bee Grade 6,
  International Geography Bee Grade 6 under International Academic
  Competitions, and current-season Science Olympiad Division B for the Grade 6
  learner.
- Product/content owner selected core-prep and contest tiers for all three.
  Each program requires its own official-source dossier and human approval
  before authoring; no content or learner availability is introduced here.
- Next: run three parallel, read-only primary-source research agents and
  integrate separate pending-review dossiers.

## 2026-09-18 — MATHCOUNTS content approved for serving

- The product/content owner approved all sixteen MATHCOUNTS Grade 6 records
  after the final independent review found no remaining defects.
- Marked all records `reviewed` by `Navodit Kaushik` on `2026-09-18` and
  enabled `mathcounts-6` in the shared program roster.
- Preserved the approved first-release boundary: isolated school/chapter
  Sprint and Target preparation, no Team Round mode, no comprehensive
  state/national-readiness claim, and no mandatory Countdown gate.
- Evidence: generated curriculum site contains 56 skills and 112 problems;
  `npm run verify` passed 89 unit/contract/catalog/eval/planner tests and the
  production build; the integration suite passed 31/31 and the full serial
  Playwright suite passed 21/21.
- Next: commit the approved release.

## 2026-09-18 — MATHCOUNTS final independent review passed

- The final focused independent review of cleanup commit `c54bbf0` found no
  remaining blocker, major, or minor defects and recommends the 16-record
  MATHCOUNTS Grade 6 draft as ready for human review.
- Confirmed the geometry analogy no longer collides with target
  intermediates, the SVG regression independently derives lengths
  `14/10/8/6` and area `116`, and the review inventory is current at 112 total
  records (96 reviewed, 16 MATHCOUNTS pending).
- All eight skills and sixteen records remain `llm_drafted`, `owned`, and
  `pending_review`; `mathcounts-6` remains unavailable.
- Next: human product/content-owner approval, then program-isolated shipping
  validation if approved.

## 2026-09-18 — MATHCOUNTS final-review cleanup

- The third independent pass confirmed all fourteen previously recorded
  findings resolved and found no remaining mathematical, source-fidelity,
  scope, accessibility, serving-gate, or legacy-program defect.
- Corrected three final minor issues: changed the geometry analogy so its
  inferred dimensions no longer match the target, expanded its numerical SVG
  regression to verify all `14/10/8/6` lengths and shoelace area `116`, and
  refreshed `docs/content-review.md` to the current 112-record inventory
  (96 reviewed, 16 MATHCOUNTS pending).
- The geometry contest record is now `content-4`; all MATHCOUNTS records
  remain pending and unavailable.
- Validation passes end to end: `npm run verify` (89
  unit/contract/catalog/eval/planner tests plus production build), integration
  31/31, and serial Playwright 21/21.
- Next: validate and run one final focused independent confirmation before
  human approval.

## 2026-09-18 — MATHCOUNTS second-review remediation

- The focused re-review confirmed all seven first-pass fixes, then found one
  remaining major difficulty-calibration defect and six minor audit,
  hint-progression, source-wording, answer-form, and leakage-guard defects.
- Rewrote the geometry Target record as multi-concept transfer: the learner
  must infer both missing-corner dimensions from full and remaining side
  lengths before subtracting areas. Updated the scaled accessible SVG,
  solution, hints, validator, and numerical figure regression; the new
  canonical answer is `116`.
- Removed the unsupported word `full-time` from contest eligibility metadata
  while retaining the approved grades 6-8 and school/Non-School Competitor
  registration caveat. Restored a genuinely different analogous logic example
  and changed the GCF example so it cannot disclose the target answer.
- Aligned geometry mastery with the validator evidence and strengthened safe
  bare-answer leakage guards. Added the missing MATHCOUNTS first- and
  second-review audit trail to `docs/content-review.md`.
- All records remain `pending_review`; the program remains unavailable.
- Validation passes end to end: `npm run verify` (89
  unit/contract/catalog/eval/planner tests plus production build), integration
  31/31, and serial Playwright 21/21.
- Next: complete validation and a final focused independent review before
  human approval.

## 2026-09-18 — MATHCOUNTS first-review remediation

- Remediated all seven findings from the independent review of authoring
  baseline `899511d`; all 16 records remain `pending_review` and
  `mathcounts-6` remains unavailable.
- Removed the fraction/percent prerequisite from proportional reasoning
  because one contest item's composition did not justify gating foundational
  unit-rate work. The MATHCOUNTS graph now has no prerequisite edges.
- Replaced the target-specific logic hint with a neutral truth-table
  representation, narrowed geometry evidence/mastery claims to the authored
  straight-line-angle and rectangular-composite-area scope, required
  lowest-term fraction form where requested, and accepted valid two-decimal
  currency forms.
- Restored format-dependent schema protection: choice-based formats require
  five choices, MATHCOUNTS Sprint/Target forbid choices, and
  calculator-permitted metadata is limited to Target. Added regression tests
  so the MATHCOUNTS extension cannot weaken Math Kangaroo or AMC validation.
- Corrected the generated site's unreviewed-draft wording and expanded all
  contest eligibility metadata to retain full-time enrollment and official
  school/Non-School Competitor registration caveats.
- Validation passes end to end: `npm run verify` (89
  unit/contract/catalog/eval/planner tests plus production build), integration
  31/31, and serial Playwright 21/21.
- Next: run complete validation and a focused independent re-review before
  requesting human content approval.

## 2026-09-18 — MATHCOUNTS Grade 6 initial authoring (draft, pending review)

- Authored one issue-sized, isolated `mathcounts-6` skill graph and content
  catalog from the approved `MATHCOUNTS Grade 6 research — 2026-09-18` dossier,
  under the fixed boundaries: program `mathcounts-6`, `mc6-` skill prefix,
  additive to Grade 6 Math, Sprint/Target first-release focus, optional
  Countdown deferred, no Team Round, and no comprehensive state/national claim.
- **Skills (8, 4 domains):** `content/skills/mc6-*.json` —
  `mc6-number-theory-fundamentals`, `mc6-fraction-percent-fluency`,
  `mc6-proportional-reasoning-rates` (domain
  `mc6-number-and-proportional-reasoning`); `mc6-linear-equation-reasoning`,
  `mc6-sequences-and-patterns` (`mc6-algebra-and-patterns`);
  `mc6-geometry-area-and-angles` (`mc6-geometry-and-measurement`);
  `mc6-counting-and-probability`, `mc6-logical-reasoning`
  (`mc6-counting-probability-and-logic`). Internal repo-owned reference codes
  `MC6-<DOMAIN>-<NN>` (NT/PF/PR/AEE/SSP/PG+MEAS/PCC/LOG), not official
  MATHCOUNTS standards. Documented as an initial bounded graph, not exhaustive.
- **Content (16):** `content/mathcounts-6/mc6-*-{1,2}.json` — exactly two
  structurally distinct records per skill (one `core`, one `contest`), all
  `llm_drafted`, `owned`, and `pending_review`. Core builds foundations and
  answer-form discipline; contest adds timed, multi-concept transfer. One
  original accessible SVG figure (L-shaped composite area) using the existing
  safe figure contract; every other item is accessible text. Independently
  verified all 16 canonical answers and the figure area (shoelace = 88) and
  confirmed the knights-and-knaves puzzle has a unique 0-knight solution.
- **Prerequisite graph:** a single audited edge,
  `mc6-fraction-percent-fluency → mc6-proportional-reasoning-rates`
  (the rate/percent contest record literally executes a percent increase on a
  computed unit price — compositional necessity). All other candidate edges
  were rejected as teaching-order/convenience overlaps; when uncertain, no edge
  was added. Graph is acyclic. Full per-skill self-audit is in
  `docs/02-curriculum-and-pedagogy.md`.
- **Contract/catalog changes (surgical, typed, program-specific):**
  `src/contracts/content.ts` extends `ContestFormatSchema` with
  `mathcounts-sprint`/`mathcounts-target` formats, adds `pointValue` `2`, adds
  `calculators_permitted` to `calculatorPolicy`, and makes `answerChoices`
  optional (MATHCOUNTS Sprint/Target are free response, not multiple choice)
  with a guarded uniqueness refine. `src/contracts/curriculum.ts` adds the four
  `mc6-*` domains. `src/content/catalog.ts` adds a `mathcounts-6` contest
  branch enforcing: Sprint = 1 point + `no_calculators`, Target = 2 points +
  `calculators_permitted`, free-response validator, no answer choices, and no
  contest readiness gate on core mastery; MK/AMC branches hardened with
  explicit `answerChoices` presence guards so their behavior is not weakened.
  `scripts/generate-curriculum-site.ts` adds the four domain labels.
- **Format metadata decision:** each contest record carries exactly one
  explicit round (Sprint: NT, AEE, SSP, PCC, LOG; Target: PF, PR, PG).
  `questionCount`/`timeLimitMinutes` are intentionally omitted so a single
  practice item never implies a full simulated 30-/8-problem competition; the
  pedagogically relevant round facts (scoring weight and calculator posture)
  are encoded. No Countdown or Team metadata was added.
- **Availability:** `mathcounts-6` stays `available: false` in
  `PROGRAM_ROSTER`, all 16 records stay `pending_review`, so they are excluded
  from `servableContentCatalog` and `/api/phase1/plan?program=mathcounts-6`
  keeps returning 400. The curriculum site renders MATHCOUNTS as
  "Draft — pending human approval" with answers/hints redacted.
- **Tests:** updated `tests/content/catalog.test.ts` (96→112 total, 16 pending)
  and added MATHCOUNTS free-response Sprint/Target format + coverage/pending
  self-audit tests; updated `tests/curriculum/skill-catalog.test.ts` (AMC
  section boundary regex, new MATHCOUNTS graph + draft-render tests).
- **Validation results:** the curriculum site regenerates at 56 skills / 112
  problems; `npm run verify` passes formatting, lint, type checks, migration
  rollback checks, 89 unit/contract/catalog/eval/planner tests, and the
  production build. The database-backed integration suite passes 31/31 and
  the full serial Playwright suite passes 21/21.
- **Residual risks / open items for review:** contest metadata omits
  question-count/time so it does not describe the whole round; the single
  prerequisite edge, though audited, is the strongest judgment call and should
  be re-checked; geometry is represented by one broad skill (coordinate/solid
  geometry, statistics/data, and measurement conversions are deferred);
  Countdown/Team remain deferred; `review.reviewer` is a
  "Pending independent curriculum review" placeholder required by the schema.
- **Next (independent review):** run `.github/skills/curriculum-review`
  (`curriculum-reviewer` agent) over the new skills/content/contract/catalog/
  tests for source fidelity, originality, mathematics, distractor-free
  free-response validators, accessibility, and the prerequisite audit. Do not
  approve or enable `mathcounts-6`; leave every record `pending_review` until a
  human content owner approves.

## 2026-09-18 — MATHCOUNTS Grade 6 research approved

- Added a dedicated pending-review source dossier for `mathcounts-6` using
  current official MATHCOUNTS rules, the 2026-2027 handbook preview, the
  complete 2025-2026 handbook, current topic filters, preparation resources,
  and the official rotating past-competition archive.
- Confirmed the grades 6-8 pathway and distinct Sprint, Target, Team, and
  Countdown rules without treating the handbook's CCSS index as a prescribed
  MATHCOUNTS curriculum or copying proprietary contest material.
- The product/content owner approved a bounded first increment:
  school/chapter Sprint and Target preparation, optional contest-tier
  Countdown drills, state-aware extension without a comprehensive readiness
  claim, and no authentic Team Round mode until collaborative participation
  is supported.
- Next: begin isolated authoring with the `mc6-` namespace and original
  `core`/`contest` records, then run independent curriculum review.

## 2026-09-18 — AMC 8 content approved for serving

- The product/content owner approved all sixteen AMC 8 records after the
  strict readiness policy, contest difficulty, SVG fidelity, scale treatment,
  and distractor remediation passed final independent review.
- Changed all sixteen records to `review.status: "reviewed"` with reviewer
  `Navodit Kaushik` and review date `2026-09-18`; enabled `amc-8` in the
  shared program roster.
- Preserved the Grade 6 prep boundary and the owner-approved contest unlock:
  estimate at least `0.80`, `MEDIUM`/`HIGH` confidence, and a passed
  independent delayed check.
- Evidence: generated curriculum site contains 48 skills and 96 problems;
  `npm run verify` passed 85 unit/contract/catalog/eval/planner tests and the
  production build; the full integration suite passed 31/31 and the full
  serial Playwright suite passed 21/21.
- Next: full shipping validation, then MATHCOUNTS research.

## 2026-09-18 — AMC 8 final distractor correction

- Corrected the remaining coordinate-geometry distractor mechanism: choice E
  now reverses only the horizontal coordinate difference, producing signed
  removed area `-6` and therefore `24 - (-6) = 30` exactly as stated.
- Bumped `amc8-coordinate-geometry-2` to `content-3`; its answer, prompt,
  figure, provenance, and `pending_review` state are unchanged.
- Next: final focused independent re-review before human approval.

## 2026-09-18 — AMC 8 remediation commit `c654f34` focused independent re-review

- Re-reviewed the approved readiness decision, all changed AMC records/skills,
  six rewritten contest items and core partners, planner/catalog/contracts,
  accessibility figures, provenance, metadata, and prior findings without
  changing curriculum/source/contracts/catalog/planner/tests, availability, or
  review statuses.
- Confirmed the exact AMC 8 contest gate: `estimate >= 0.80`, confidence
  `MEDIUM`/`HIGH`, and `independentDelayedCheck === true`; weak evidence stays
  on core prep, eligible skills receive contest items, and non-AMC programs
  preserve legacy behavior. Confirmed all AMC contest records carry the
  catalog-enforced gate and remain pending/unavailable.
- Independently solved all six rewritten records and verified choices,
  validators, hints, pair distinction, coordinate SVG mapping, geometry
  proportions/disclaimer, official metadata, provenance, and zero-edge graph.
- **Unresolved minor finding:** choice E in
  `content/amc-8/amc8-coordinate-geometry-2.json:63-66` claims reversed
  coordinate differences produce `30`, but the stated arithmetic does not;
  fix the rationale/distractor before human review.
- Validation passed: `npm run content:validate` (17), `npm run
  curriculum:validate` (17), focused catalog/planner tests (29), and
  `npm run verify` (85 tests plus production build). `git diff --check
  c654f34^ c654f34` passed.
- Recommendation: **not ready for human review** until the single
  deterministic distractor rationale is corrected, then repeat this focused
  review.

## 2026-09-18 — AMC 8 strict contest-readiness policy approved

- The product/content owner approved the remediated strict contest unlock:
  mastery estimate at least `0.80`, confidence `MEDIUM` or `HIGH`, and a
  passed independent delayed check for the owning skill.
- Added catalog enforcement so every AMC 8 contest record must carry this
  exact structured readiness contract; omission cannot silently fall back to
  the legacy challenge behavior used by other programs.
- AMC 8 remains unavailable and all 16 records remain `pending_review`
  pending focused independent re-review of the complete remediation.

## 2026-09-18 — AMC 8 Grade 6 prep remediation increment

- Remediated all six findings from the 2026-09-18 independent review of
  commit `b4f99d2` (see `docs/content-review.md`, which is left unmodified
  as a historical record). AMC 8 remains **pending review and unavailable**
  in the servable catalog; no `review.status` was set to `reviewed`, and no
  feature flag or catalog wiring was changed to expose AMC 8 to learners.
- **Finding 1 — planner readiness gate:** Redesigned the contest-readiness
  gate as an explicit, type-safe contract instead of a skill-code-prefix
  hack. Added `contestFormat.readinessRequirement`
  (`minEstimate`/`disallowLowConfidence`/`requireIndependentDelayedCheck`) to
  `ContestFormatSchema` (`src/contracts/content.ts`) and a matching optional
  `contestReadinessRequirement` on `PlannerContentItem`
  (`src/contracts/planner.ts`), wired through `src/phase1/service.ts`.
  Rewrote `src/planner/plan-next-activities.ts` so a skill carrying this
  metadata only recommends its contest item once mastery evidence satisfies
  `estimate >= 0.8`, confidence not `LOW`, and `independentDelayedCheck ===
  true` together; core-prep stays available until then, and the previous bug
  where a fully "secure" skill was skipped from the plan entirely (no core,
  no contest) no longer applies to gated skills. Content without this field
  (Grade 6 Math, Math Kangaroo, MOEMS) is byte-for-byte unchanged in
  behavior. Documented the `0.8` threshold decision in
  `docs/curriculum-sources.md`. Added four focused tests in
  `tests/planner/plan-next-activities.test.ts` covering no evidence, weak
  evidence (`0.5`/`LOW`/`false`), threshold met without a delayed check, and
  fully eligible evidence.
- **Finding 2 — coordinate-geometry-2 figure bug:** The SVG's rectangle and
  vertex markers were drawn two units too low (origin/scale math error), so
  the figure did not depict the prompt's `(-1, 2)` and `(5, 6)` points.
  Rewrote the figure with corrected pixel math and `data-role`/`data-x`/
  `data-y`/`data-origin-*`/`data-unit-px` attributes, and added a new
  regression test in `tests/content/catalog.test.ts` (parallel to the
  existing Math Kangaroo angle-figure test) that numerically recomputes the
  data-space coordinates from the raw pixel geometry and asserts they equal
  the prompt's points.
- **Finding 3 — six routine contest records rewritten** into original,
  non-routine, multi-step transfer problems (topic-aligned, five A-E
  choices, every distractor rationale hand-verified to deterministically
  produce its stated value):
  - `amc8-elementary-geometry-2`: composite-area problem (13 m x 11 m
    rectangle minus a 5-12 right triangle minus a 4 m square) with a new,
    proportionally exact figure. **Answer: 97** (was 13).
  - `amc8-spatial-visualization-2`: numeric cube-net opposite-face-sum
    problem using the same net topology; extends the "outer squares of a
    straight three-square run are opposite faces" rule to a second inferred
    pair. **Answer: 11** (unchanged mechanism, now a numeric multi-step
    answer instead of "Face U").
  - `amc8-graphs-and-tables-2`: two-regime table-extension problem (constant
    +12 for four days, then a doubling increase). **Answer: 244** (was 11).
  - `amc8-introductory-algebra-2`: rectangle-area quadratic word problem
    (`w(w + 4) = 96`, factors to `(w-8)(w+12)=0`, positive root). **Answer:
    8** (was 6); this also resolves Finding 5 below.
  - `amc8-coordinate-geometry-2`: kept the required prompt points `(-1, 2)`
    and `(5, 6)` and added a second cutout rectangle `(2, 2)`-`(5, 4)` for
    genuine multi-step transfer. **Answer: 18** (was 24).
  - `amc8-proportional-reasoning-2`: two-pitcher mixture-combination problem
    (ratios 1:3 of 24 cups and 3:5 of 40 cups, combined). **Answer: 21**
    (was 9).
  - All six version-bumped to `content-2`; all six now carry the new
    `contestFormat.readinessRequirement`.
- **Finding 4 — graph/table and algebra defects:** Resolved by the finding-3
  rewrites: `amc8-graphs-and-tables-2`'s new distractors each reuse an
  already-declared, mechanism-matched misconception code
  (`assumes-linear-pattern-without-checking`, `extends-by-wrong-interval`,
  `uses-total-instead-of-change`, `reads-wrong-row-or-column`);
  `amc8-introductory-algebra-2`'s new distractors likewise reuse
  already-declared codes with corrected, verified mechanisms
  (`ignores-positive-condition`, `reverses-inverse-operations`,
  `treats-square-as-double`, `combines-unlike-terms`). New misconception
  codes introduced for the other rewrites
  (`skips-halving-triangle-area`, `omits-a-removed-region`,
  `confuses-adjacent-and-opposite-faces`, `assumes-symmetry-not-stated`,
  `loses-orientation-when-folding`, `reports-intermediate-value-as-final-answer`,
  `ignores-the-removed-region`, `swaps-ratios-between-groups`) were declared
  at the owning skill level in `content/skills/amc8-*.json` and listed on the
  corresponding item, satisfying the catalog's skill/item misconception-code
  consistency check.
- **Finding 5 — scale ambiguity:** `amc8-elementary-geometry-1`'s figure
  caption and accessibility text now explicitly state "not to scale; use the
  labeled measures" (version bumped to `content-2`). The rewritten
  `amc8-elementary-geometry-2` figure is drawn to exact labeled proportions
  (13:11 rectangle, true 5-12-13 triangle legs, true square), so no
  disclaimer was needed there; its accessibility notes state it is drawn to
  the labeled proportions.
- **Finding 6 — metadata/gates preserved:** Official AMC metadata
  (`format: 'amc-8'`, `pointValue: 1`, `questionCount: 25`,
  `timeLimitMinutes: 40`, `calculatorPolicy: 'no_calculators'`,
  `scoring: {1,0,0}`, the eligibility string) is unchanged on every record.
  `review.status` remains `pending_review` on all AMC 8 records; the
  `docs/content-review.md` historical findings were not edited.
- **Validation:** `npx tsc --noEmit` clean; `npm run lint` clean;
  `npx prettier --check .` clean; focused
  `tests/planner/plan-next-activities.test.ts` (12 tests) and
  `tests/content/catalog.test.ts` (17 tests, including the new coordinate
  regression test) pass; full `npm test` (85 tests across contracts,
  content, evals, tutor, notification, curriculum, planner, foundation)
  passes, including the existing assertion that AMC 8 renders as pending and
  unavailable; `npm run verify` (format check, lint, typecheck, migration
  down-check, full test run, production `next build`) passes end to end.
- **Residual risks:** The six rewritten problems and their distractor
  rationales are original drafts verified by hand/script for internal
  arithmetic consistency, but — like the rest of the AMC 8 catalog — they
  still require independent human subject-matter review before
  `review.status` may be set to `reviewed` or AMC 8 unlocked; this increment
  intentionally leaves both untouched. Future contest programs must make
  their own explicit readiness decision; the AMC 8 catalog now enforces the
  owner-approved strict gate on every AMC 8 contest record.
- **Next recommended issue:** Human/independent re-review of the six
  rewritten AMC 8 records and the new planner gate, followed by the standard
  reviewer sign-off path (`review.status` → `reviewed`) once approved; no
  further engineering action is required to unblock that review.

## 2026-09-18 — AMC 8 Grade 6 prep independent review

- Completed an independent review of commit `b4f99d2` without changing
  curriculum/source/contracts/catalog/planner/tests or any review status.
- Verified all 16 answers, accepted forms, units, methods, validators,
  choices, distractor logic, hints, provenance, accessibility paths, six SVG
  payloads, source-format claims, graph isolation, and pending/unavailable
  serving gates.
- Findings recorded in `docs/content-review.md`: contest readiness currently
  unlocks from any mastery row including `0.5`/`LOW`/no delayed check; the
  coordinate-geometry-2 figure encodes the wrong y-coordinates; the contest
  tier is mostly routine rather than full-difficulty; and two distractor
  rationale/misconception mappings are incorrect. Two schematic figures also
  need an explicit not-to-scale decision.
- Validation passed: `npm run content:validate` (16 tests),
  `npm run curriculum:validate` (17 tests), focused/full unit tests (81),
  and `npm run verify` (format, lint, typecheck, migration check, tests,
  production build). AMC 8 remains unavailable and all 16 records remain
  `pending_review`.
- Next: remediate the review findings in a separate authoring/engineering
  increment, then repeat independent review before human approval.

## 2026-09-18 — AMC 8 Grade 6 prep authoring increment handed off

- Verified the approved AMC 8 source section in `docs/curriculum-sources.md`:
  product/content-owner approval is recorded on 2026-09-17, the official
  format is 25 multiple-choice questions in 40 minutes with choices A-E, no
  calculators, grade 8 and below / age 15.5 eligibility, and +1 correct / 0
  wrong / 0 blank scoring. The dossier remains explicit that this is a
  Learning Forge synthesis rather than an official MAA syllabus.
- Added eight namespaced `amc8-` skills and 16 original records under
  `content/amc-8/` covering counting/probability, estimation, proportional
  reasoning, elementary geometry, spatial visualization, graphs/tables,
  introductory algebra, and coordinate geometry. Each skill has exactly one
  `core` prep record and one `contest` record; all 16 use
  `provenance.origin: "llm_drafted"`, `licenseStatus: "owned"`, and
  `review.status: "pending_review"`.
- Generalized contest-format metadata so AMC 8 records encode +1/0 scoring,
  timing, no-calculator policy, eligibility, and five A-E choices without
  weakening Math Kangaroo's 3/4/5-point checks or MOEMS free-response
  semantics. `amc-8` remains `available: false`, so no AMC draft can enter a
  learner journey.
- Self-audit notes: no prerequisite edges were kept because none were
  conceptually necessary rather than teaching-order preferences; existing
  planner behavior keeps contest records behind structured mastery evidence
  for the same skill. Six accessible SVG figures were added only for genuinely
  visual geometry, spatial, and coordinate items; nonvisual records remain
  text/table based.
- Evidence: `npm run content:validate` passed 16 tests; `npm run
  curriculum:validate` passed 17 tests; focused planner/full unit command
  passed 81 unit/contract/catalog/eval/planner tests; full `npm run verify`
  passed formatting, lint, type checks, migration rollback checks, 81
  unit/contract/catalog/eval/planner tests, and the production build.
- Review handoff: independently audit all 16 records for mathematical
  accuracy, originality against AMC 8/AJHSME archives, official format
  fidelity, prerequisite self-audit, structural distinction/observable
  evidence coverage, deterministic distractor rationales, hint non-leakage,
  and SVG accessibility before changing review status or enabling `amc-8`.
- Next: run the independent `curriculum-review` pass for this AMC 8 draft
  increment, remediate any findings, then seek human product/content-owner
  approval before serving.

## 2026-09-18 — MOEMS Division E content approved for serving

- The product/content owner approved all ten independently reviewed MOEMS
  Division E records after the prerequisite remediation passed focused
  re-review.
- Changed all ten records to `review.status: "reviewed"` with reviewer
  `Navodit Kaushik` and review date `2026-09-18`; enabled `moems-6` in the
  shared program roster.
- Preserved the approved boundary: Division E only, as a bounded initial
  preparation curriculum rather than Division M, dual placement, or a full
  seasonal contest bundle.
- Evidence: generated curriculum site contains 40 skills and 80 problems;
  `npm run verify` passed 76 unit/contract/catalog/eval tests and the
  production build; the full integration suite passed 31/31 and the full
  serial Playwright suite passed 21/21.
- Next: full shipping validation, then AMC 8 authoring.

## 2026-09-18 — MOEMS prerequisite review remediation

- Removed the two unjustified graph edges from number/place-value to
  patterns/counting and geometry/measurement, including their four mirrored
  content declarations. Those capabilities are now independent roots rather
  than being gated by generic numerical fluency.
- Retained the reviewed conceptual dependency from cryptarithm reasoning to
  number/place-value and added explicit graph regression assertions.
- Bumped the four remediated content records to `content-2`; all ten MOEMS
  records remain `pending_review`.
- Focused independent re-review found no remaining curriculum defect. The
  complete `npm run verify` gate passed 76 tests and the production build.
- Next: human product/content-owner approval.

## 2026-09-18 — MOEMS Division E Grade 6 authoring increment handed off

- Verified the approved MOEMS Division E source section in
  `docs/curriculum-sources.md`: product/content-owner approval is recorded on
  2026-09-17, the scope is Division E only for `moems-6`, the official format
  is five monthly contests of five questions in 30 minutes with individual
  work, one point per correct answer, and no calculators/rulers/graph paper,
  and the distributed-source/no-single-syllabus gap remains explicit.
- Added five namespaced `moems6-` skills and ten original records under
  `content/moems-6/` (one core-prep and one contest free-response record per
  skill). All ten records use `provenance.origin: "llm_drafted"` and
  `review.status: "pending_review"`; no figures were added because these
  initial items are fully representable in accessible text without visual
  reasoning.
- Wired the skill/content catalogs, MOEMS domain labels, and contract tests.
  The roster remains `available: false`, so pending content cannot enter a
  learner journey; Math Kangaroo format checks remain isolated to its own
  program.
- Evidence: `npm run content:validate` passed (14 tests); focused
  `npm run curriculum:validate` passed after catalog/site updates (15 tests);
  `npm run verify` passed formatting, lint, type checks, migration rollback
  checks, 76 unit/contract/catalog/eval tests, and the production build.
- Review handoff: independently audit all ten records for arithmetic,
  originality, misconception-rationale determinism, hint non-leakage,
  conceptual prerequisite necessity, structural distinction/observable
  evidence coverage, and Division E format fidelity before changing any
  review state or enabling the program.

## 2026-09-18 — Math Kangaroo shipped with program-isolated learner journeys

- Completed the Math Kangaroo shipping gate after human approval of all 16
  records and enabled `math-kangaroo-6` in the shared program roster.
- Made the learner program selector functional and scoped session defaults,
  recommendations, placement, spaced review, and learner-visible progress to
  the selected curriculum. Server routes validate that the requested program
  is available and reject content IDs from another program, preventing Math
  Kangaroo activities from entering the default Grade 6 Math journey.
- Kept the established Grade 6 Math default session (`unit-rates-1`) stable;
  each additional program selects its own reviewed core item by default.
- Added integration and browser regressions for both program isolation and
  unavailable/mismatched program rejection.
- Evidence: `npm run verify` passed formatting, lint, type checks, migration
  rollback checks, 72/72 unit/contract/catalog/eval tests, and the production
  build; the full integration suite passed 31/31 and the full serial
  Playwright suite passed 21/21.
- Next: author the approved MOEMS Division E dossier as the next independent
  curriculum increment.

## 2026-09-17 — Math Kangaroo content approved for serving

- Following successful independent reviews of the full 16-record curriculum,
  contest-format remediation, hint/prerequisite fixes, and the original
  accessible-figure increment, the product/content owner approved all 16 Math
  Kangaroo records.
- Changed each record to `review.status: "reviewed"` with reviewer
  `Navodit Kaushik` and review date `2026-09-17`; enabled
  `math-kangaroo-6` in the shared program roster.
- Updated current-state documentation and catalog tests to reflect 70/70
  reviewed records and zero pending. Historical progress/review entries remain
  unchanged as an audit trail of the earlier pending state.
- Next: complete program-isolated shipping validation, then MOEMS Division E
  authoring.

## 2026-09-17 — Math Kangaroo angle-figure correction passed focused review

- Completed the final focused independent `curriculum-review` pass for commit
  `4cc2336`, limited to the corrected angle SVGs in
  `mk6-angle-and-shape-properties-1` and `mk6-angle-and-shape-properties-2`
  plus the new regression test coverage.
- Independently re-derived the corrected tagged geometry from the SVG
  coordinates: the straight-line item now depicts about `65.0001°` and
  `114.9999°`; the triangle item now depicts about `50.0001°`, `69.9999°`,
  and `60.0000°`, implying an exterior angle of about `119.99998°`. The arc
  placement and labels are consistent with those relationships and do not add
  a conflicting visual cue.
- Verified the new test numerically computes angles from `data-role`-tagged
  coordinates rather than snapshotting strings, so future coordinate drift
  should fail validation.
- Re-checked accessibility, answer leakage, SVG safety, and review-state
  behavior: no regression found; both corrected records are now `content-3`
  and remain `pending_review`.
- Evidence: `npm run content:validate`, `npm run curriculum:validate`,
  `npm run typecheck`, `npm test` (72/72), `npm run build`,
  `npx prettier --check docs/content-review.md docs/PROGRESS.md`, and
  `git diff --check` all passed.
- Advisory outcome: **Approve** / `ready for human review` for this focused
  remediation. Human product/content-owner approval is still required before
  any `pending_review` record becomes servable.

## 2026-09-17 — Math Kangaroo angle-figure geometry corrected

- Independent figure review found that the first-pass angle SVG coordinates
  did not match their labels even though the problem answers were correct.
- Corrected the straight-line ray to 65 degrees and the triangle vertices to
  interior angles 50, 70, and 60 degrees (therefore exterior angle 120).
  Bumped both corrected records to `content-3`.
- Added regression tests that derive the represented angles numerically from
  tagged SVG coordinates, preventing future visual edits from silently
  contradicting the labels.
- All Math Kangaroo records remain `pending_review` pending focused re-review.

## 2026-09-17 — Math Kangaroo figure increment independent review logged

- **Scope:** Completed the independent `curriculum-review` pass for commit
  `2593aa2` covering the new Math Kangaroo figure contract/rendering changes
  and the five `content-2` figure-bearing records. Review notes were appended
  to `docs/content-review.md` only; no `content/` or `src/` files were
  changed in this pass.
- **Outcome:** Logged 1 **major** issue and no minor issues. The two new angle
  diagrams (`mk6-angle-and-shape-properties-1`,
  `mk6-angle-and-shape-properties-2`) are not geometrically faithful to their
  labeled measures: their drawn rays/triangle coordinates visually encode
  angles materially different from the prompt's 65°, 50°, 70°, and implied
  supplementary values, with no "not to scale" caveat.
- **Evidence:** Recomputed the drawn geometry from the SVG coordinates:
  `mk6-angle-and-shape-properties-1` draws about 54.2° / 125.8° rather than
  65° / 115°; `mk6-angle-and-shape-properties-2` draws about 42.7°, 72.6°,
  64.7° (exterior about 115.3°) rather than 50°, 70°, 60° / 120°. The
  remaining figure scope passed inspection: static-SVG safety restrictions,
  encoded image rendering, no unnecessary figure data to the model provider,
  no answer-bearing solution leakage on the curriculum site, `content-2`
  version bumps, and all `pending_review` states. Ran `npm run
  curriculum:site`, `npm run content:validate`, `npm run curriculum:validate`,
  `npm run typecheck`, `npm test` (71/71), `npm run build`,
  `npx prettier --check docs/content-review.md docs/PROGRESS.md`, and
  `git diff --check`; all passed.
- **Review status and risk:** Advisory verdict is `Do not approve` /
  `not ready for human review` for this increment until the two misleading
  angle figures are redrawn or clearly marked/reworked so they do not visually
  contradict the stated relationships. All 16 Math Kangaroo records remain
  `pending_review`.

## 2026-09-17 — AMC 8 primary-source gate resolved and research approved

- Product owner supplied the current official MAA PDF, *Official Rules and
  Policies: AMC 8, AMC 10, and AMC 12, 2026-2027* (updated August 21, 2026).
  It directly confirms AMC 8's 25 questions, 40 minutes, eligibility, and
  no-calculator policy.
- Located the current official MAA 2023 AMC 8 sample page and linked booklet.
  Its instructions directly confirm multiple choice, five choices A-E, and
  scoring of 1 point correct / 0 wrong / 0 blank.
- The AMC 8 dossier is approved with the previously selected Grade 6
  guardrail: core prep first; contest-tier access only after structured
  prerequisite evidence. Actual MAA problem wording, choices, diagrams, and
  solutions remain inspiration-only and may not be reproduced.

## 2026-09-17 — Math Kangaroo original accessible figures implemented

- Implemented ADR-0004's authored-diagram boundary with an optional structured
  `figure` field containing versioned inline SVG, alt text, caption, and
  intrinsic dimensions. Validation permits only a restricted static SVG subset
  and rejects scripts, event handlers, external references, styles, and
  unapproved elements.
- Added five original repository-owned figures to the current Math Kangaroo
  geometry/spatial records: labeled rectangle, adjacent straight-line angles,
  triangle with exterior angle, rectangular prism, and unit-cube block with a
  removed corner. Each changed record is versioned `content-2` and retains a
  complete nonvisual `accessibleAlternative`.
- Learner sessions and the answer-redacted curriculum site render figures via
  encoded SVG image data rather than injecting SVG markup into the DOM.
- Added contract, catalog, and generated-site tests covering SVG safety,
  figure/alt coverage, content versioning, and answer redaction.
- Evidence: typecheck, lint, 71/71 unit/contract/content/curriculum tests, and
  production build pass. All Math Kangaroo records remain `pending_review`
  until the figure increment passes independent review.

## 2026-09-17 — Collapsible curriculum sidebar

- Made authored program and domain groups in the curriculum site's left
  navigation collapsible with native `<details>/<summary>` controls.
- Grade 6 Math starts expanded; other authored programs start collapsed.
  Selecting a program, domain, or skill deep link automatically expands the
  matching sidebar path as well as the corresponding content section.
- Unauthored `Coming soon` entries remain simple links without empty disclosure
  controls.

## 2026-09-17 — AMC 8 reviewed; primary-rule confirmation still blocking

- Product/content owner selected a readiness-gated Grade 6 progression:
  learners begin with core prep and unlock the contest tier only after
  structured prerequisite evidence. AMC 8 remains additive optional
  enrichment, not expected Grade 6 mastery.
- Product/content owner requires direct MAA primary confirmation of
  five-choice format, scoring/no-guessing-penalty, and calculator rules before
  authoring format-specific content.
- Focused follow-up checks found historical MAA rules/sample PDF URLs through
  web search, but direct retrieval returned 404; the current MAA policy route
  remained 403 to CLI access and exposed only introductory text through the
  safe fetcher. A Wayback availability check returned 429. Search-result
  summaries were not treated as primary evidence.
- AMC 8 dossier remains `Pending product/content-owner review`; authoring is
  blocked until a verifiable primary MAA artifact resolves these rules.

## 2026-09-17 — MOEMS Division E research approved

- Product/content owner approved the MOEMS source dossier and selected
  **Division E only** for the first Grade 6 curriculum.
- Accepted the distributed official source framework (program goals, format,
  sample contest, Contest Supplements, and official problem volumes) despite
  MOEMS not publishing a single syllabus/standards map.
- Division M, dual placement, and APSMO material remain out of scope unless
  separately researched and approved. Authoring may now proceed with core-prep
  and contest tiers using original problems only.

## 2026-09-17 — Math Kangaroo conditional acceptance and curriculum navigation

- Product/content-owner review found the Math Kangaroo curriculum acceptable
  as a draft, conditional on adding original accessible figures before final
  learner-serving approval. Geometry and spatial-reasoning coverage must
  include repository-owned figures for relevant angle, composite-shape,
  cube-stack/net, rotation, and symmetry items, each paired with a complete
  text alternative. The 16 records remain `pending_review` until that condition
  is implemented and reviewed.
- Made curriculum-site domain and skill subsections collapsible with native
  keyboard- and screen-reader-accessible `<details>/<summary>` controls.
  Domains start expanded, skill cards start collapsed, and sidebar/hash
  navigation automatically expands the selected target and its ancestors.
- MOEMS and AMC 8 research began in isolated worktrees; their dossiers are now
  integrated into `docs/curriculum-sources.md`. MOEMS is approved, while AMC 8
  remains pending the direct-primary-rule confirmation documented above.

## 2026-09-17 — Curriculum site shows independently reviewed drafts

- Corrected the curriculum-site generator's treatment of roster availability:
  a program that is unavailable to learners but already has validated authored
  records now renders its skill graph and answer-redacted sample prompts with a
  `Draft — pending human approval` badge. Programs with no authored records
  still render as `Coming soon`.
- Math Kangaroo Grade 6 is now visible in the local curriculum site without
  making its 16 `pending_review` records learner-servable.
- Added a curriculum test covering the generated Math Kangaroo draft section.
  `npm run curriculum:validate` passes (10/10), and the regenerated site was
  verified over `http://localhost:4173/`.

## 2026-09-19 (cont.) — Math Kangaroo final focused independent review logged

- **Scope:** Completed the final focused `curriculum-review` pass against
  remediation commit `843a02a`, limited to the second-pass findings plus
  regression checks. Review notes were appended to `docs/content-review.md`
  only; no `content/` or `src/` files were changed in this pass.
- **Outcome:** Verified the remaining second-pass findings are resolved. The
  perimeter-invariance and exposed-faces contest items no longer leak the
  final answer or a critical intermediate through their hint ladders.
  `equivalenceNotes` now align with `acceptedAnswers` in all four previously
  flagged contest records, including accepted choice-label forms.
- **Evidence:** Confirmed no answer regression in the reviewed items
  (including `32 meters` for `mk6-perimeter-and-area-reasoning-2` and `52`
  for `mk6-spatial-visualization-3d-2`) and confirmed all 16 Math Kangaroo
  content records remain `pending_review`. Ran
  `npm run content:validate`, `npm run curriculum:validate`,
  `npm run typecheck`, `npm test` (65/65), `npm run build`,
  `npx prettier --check docs/content-review.md docs/PROGRESS.md`, and
  `git diff --check`; all passed.
- **Review status and risk:** Advisory verdict is now `Approve` /
  `ready for human review`. This does **not** change any content
  `review.status`; human content-owner approval is still required before the
  Math Kangaroo records can become servable.

## 2026-09-19 (cont.) — Math Kangaroo second-review remediation

- Resolved the second independent review's remaining major hint-leakage issue
  by replacing the first hints in the perimeter-invariance and exposed-cube-
  faces items. The revised hints direct comparison of changed boundary/faces
  without asking the learner to compute a value equal to the final answer.
- Updated four multiple-choice validator notes to explicitly document their
  accepted choice labels, matching their `acceptedAnswers`.
- Corrected the perimeter item's originality statement to describe
  perimeter-invariance rather than composite-area reasoning. All 16 records
  remain `pending_review`.
- Next: final independent review pass before requesting human content-owner
  approval.

## 2026-09-19 (cont.) — Math Kangaroo second independent review logged

- **Scope:** Completed a second independent `curriculum-review` pass against
  remediation commit `11c11fd` for the Math Kangaroo Grade 6
  (`math-kangaroo-6`) skill graph, content, validator changes, and related
  tests/catalog enforcement. Review notes were appended to
  `docs/content-review.md` only; no `content/` or `src/` files were changed.
- **Re-check outcome:** Verified that all five first-pass findings were
  addressed structurally: all 8 contest items now have valid five-choice
  `contestFormat` metadata and `multiple_choice` validators; the three false
  prerequisite gates were removed or corrected and mirrored into content; the
  calendar hint leak was fixed; text/time validator semantics now use `text`;
  and the unqualified "Benjamin" heading was removed from
  `docs/02-curriculum-and-pedagogy.md`.
- **Remaining issues:** Logged 1 new **major** and 1 **minor** issue. Major:
  `mk6-perimeter-and-area-reasoning-2` and `mk6-spatial-visualization-3d-2`
  still leak their final multiple-choice answers via the first hint because
  that hint asks for an intermediate quantity numerically equal to the final
  answer. Minor: four contest records accept choice labels but their
  `equivalenceNotes` do not consistently document that accepted form.
- **Evidence:** Independently re-derived the four materially revised contest
  answers (`mk6-clock-and-calendar-reasoning-2`,
  `mk6-perimeter-and-area-reasoning-2`,
  `mk6-spatial-visualization-3d-2`,
  `mk6-combinatorial-counting-2`) and confirmed all are correct. Ran
  `npm run content:validate`, `npm run curriculum:validate`,
  `npm run typecheck`, `npm test` (65/65), `npm run build`,
  `npx prettier --check docs/content-review.md docs/PROGRESS.md`, and
  `git diff --check`; all passed.
- **Review status and risk:** Advisory verdict remains
  `Do not approve` / `not ready for human review`. All 16 Math Kangaroo
  records remain `pending_review`; human content-owner approval stays blocked
  until the remaining hint-leakage and metadata-nit findings are remediated
  and independently re-checked.

## 2026-09-19 (cont.) — Math Kangaroo independent-review remediation

- Resolved all 2 major and 3 minor findings from the first independent review
  without changing any content record from `pending_review`.
- Added optional structured `contestFormat` metadata (exactly five labeled
  choices plus a 3/4/5-point value), scoped catalog enforcement to Math
  Kangaroo contest records, and added the `text` deterministic-validator type.
  All 8 Math Kangaroo contest records now use five-choice
  `multiple_choice` validators and collectively cover all three point tiers.
- Replaced three routine contest prompts with non-routine variants: an
  ordinal repeating-meeting calendar problem, an invariant perimeter after a
  corner cut, and exposed cube faces after removing a corner cube. Strengthened
  the grid-path item by adding a blocked-center exclusion.
- Removed false prerequisite gates from angle reasoning and 3D visualization;
  combinatorial counting now depends only on multi-step arithmetic. Mirrored
  content prerequisites match the revised skill graph.
- Repaired the calendar hint that disclosed its key remainder, changed four
  text/time validators away from the misleading `numeric` label, and removed
  the unqualified secondary-sourced "Benjamin" label from
  `docs/02-curriculum-and-pedagogy.md`.
- Added contract/catalog tests for exact-text validation, contest metadata,
  five-choice labels, canonical-answer presence, point-tier coverage, and
  rejection of missing Math Kangaroo contest metadata.
- Evidence: `npx tsc --noEmit`, `npm run lint`, `npm run content:validate`,
  `npm run curriculum:validate`, `npm test` (65/65), `npm run build`, and
  `git diff --check` all pass.
- Next: repeat the independent curriculum review. Human content-owner approval
  remains blocked until that review passes.

## 2026-09-19 (cont.) — Math Kangaroo independent review logged

- **Scope:** Completed the independent `curriculum-review` pass for commit
  `d072119`'s new Math Kangaroo Grade 6 (`math-kangaroo-6`) skill graph and
  16 draft content records. Review notes were added to `docs/content-review.md`
  only; no `content/` JSON, runtime code, or catalog wiring was changed.
- **Findings:** Logged 2 major and 3 minor issues. Major: (1) the 8
  `mode: "contest"` records do not yet embody the dossier's approved contest
  format/difficulty (no 5-choice structure or 3/4/5-point-tier encoding, and
  several prompts are routine rather than clearly contest-style); (2) three
  prerequisite edges create unjustified gating barriers
  (`mk6-angle-and-shape-properties`,
  `mk6-spatial-visualization-3d`, `mk6-combinatorial-counting`). Minor: one
  hint-leakage defect in `mk6-clock-and-calendar-reasoning-2`, several
  semantically misleading `deterministicValidator.type: "numeric"` labels on
  text/time answers, and one documentation caveat around the secondary-sourced
  "Benjamin" label.
- **Evidence:** Independently re-derived all 16 answers by hand/first
  principles and found no arithmetic disagreements; re-verified both logic
  puzzles, including the corrected `mk6-logical-deduction-puzzles-2`, as
  uniquely solvable. Review recommendation recorded as
  `not ready for human review` / advisory verdict `Do not approve`.
- **Review status and risk:** All 16 Math Kangaroo records remain
  `pending_review`; this review does not change `review.status` and does not
  constitute human approval. Next: author/follow-up remediation for the logged
  findings, then re-run independent review before any human content-owner
  approval decision.
## 2026-09-17 — MOEMS Division E Grade 6 research dossier (pending review)

- **Completed `moems6-research`**: added a new
  "MOEMS Division E (Grade 6) research — 2026-09-17" section to
  `docs/curriculum-sources.md`, following the Math Kangaroo dossier
  structure exactly (scope, source register, standards/framework posture,
  coverage summary, sequencing, originality constraints, conflicts/gaps, and
  authoring handoff).
- **Confirmed from primary official MOEMS sources**: MOEMS is the program
  owner; the program emphasizes multiple strategies, flexibility,
  creativity, and ingenuity; the seasonal Olympiad format is **five monthly
  contests**, each with **five questions** in **30 minutes**; students work
  individually; calculators/rulers/graph paper are not allowed; each correct
  answer is worth **1 point**; and MOEMS publicly distributes an official
  Division E sample contest plus an official archive of past contest
  materials through its `Resources`, `Contest Supplements`, and contest-book
  product pages.
- **Official archive finding required by source rule 10**: located
  `https://www.moems.org/products/contest-supplements` (HTTP 200) and its
  official machine-readable endpoint
  `https://www.moems.org/products/contest-supplements.js` (HTTP 200), which
  exposes Division E (`E`) and Division M (`M`) digital-download variants
  for seasons `98-99` through `23-24`. Also recorded MOEMS' official past
  contest-problem book volumes covering Division E years 1979/80-2016/17 and
  the public Division E sample file linked from `https://www.moems.org/pages/resources`
  (HTTP 200).
- **Primary-source nuance surfaced**: although the dossier is intentionally
  bounded to **Division E** for this Grade 6 learner, official MOEMS
  materials do **not** make Grade 6 exclusive to Division E. `About the
  Program` includes Grade 6 in both the elementary and middle-school
  descriptions, and `PICO Corner` explicitly says 6th graders may be placed
  on either Division E or Division M teams (or both, if both divisions are
  available at the school). This is recorded as a human-review item, not
  silently resolved by the research agent.
- **Review status**: section is marked **Pending product/content-owner
  review**. No self-approval is claimed. Next: human review of the MOEMS
  dossier, especially the Grade 6 Division E-vs-M boundary and acceptance of
  the archive/syllabus posture before any `moems6-authoring` work begins.
## 2026-09-16 — Grade 6 Math v2 complete-candidate cleanup and comparison handoff

- **Scope:** Completed the final holistic cleanup under
  `experiments/grade-6-math-v2/`; no production files were touched.
- **Fixes:** Changed `v2-polygon-area-garden` to exercise
  `counts-an-overlapping-region-twice-when-decomposing`, with a correct
  `96 square meters` wrong-answer path that double-counts the triangle inside
  its 6-by-4 bounding rectangle. Updated the experiment README to reflect all
  24 skills and 48 content records across the pilot and Increment 3 batches A,
  B, C, and D. Reordered `review-handoff.md` revisions numerically for audit
  readability.
- **Evidence:** The isolated validator passed with 48 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** The full candidate graph and content are
  complete and awaiting the human v1-vs-v2 comparison decision. All 48
  records remain `pending_review`; no self-approval, human approval, or
  production eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 final center-and-variability remediation (revision 14)

- **Scope:** Updated `v2-center-mean-range` in
  `experiments/grade-6-math-v2/content-records-v2.json` to satisfy the
  `center-and-variability` mastery requirement for naming a notable shape or
  outlier feature.
- **Fix:** The solution representation, canonical/accepted answer forms,
  equivalence notes, and accessible alternative now identify the 11-minute
  reading as notably high relative to the other values and explain that it
  pulls the mean upward. No other content fields, misconception codes, hints,
  or review states changed.
- **Evidence:** The isolated validator passed with 48 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** All 24 skills now have reviewed-and-remediated
  candidate content pending final independent re-check. All 48 records remain
  `pending_review`; no human approval, self-approval, or production
  eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 candidate content, increment 3 batch D (final batch)

- **Scope:** Added eight isolated `llm_drafted` candidate records under
  `experiments/grade-6-math-v2/content-records-v2.json`: exactly two each for
  `coordinate-polygons`, `nets-and-surface-area`,
  `statistical-questions`, and `center-and-variability`. The existing 40
  records were retained, no production files were touched, and no record was
  approved.
- **Coverage:** Items are structurally distinct within each skill and together
  cover coordinate rectangles/L-shaped polygons; rectangular-prism and
  triangular-prism nets; statistical-question classification and revision;
  and center/variability summaries using mean/range and median/IQR. Every
  record includes equivalent accepted answers, answer-format information,
  genuine text-equivalent accessibility, valid per-skill difficulty,
  glossary-backed misconception distractors whose arithmetic or logic path
  exactly produces the stated wrong answer, non-leaking hints, and
  `review.status: "pending_review"`.
- **Controls:** `validate.ts` now derives the required content set from all 24
  Skill records and enforces exactly two records for every skill. Content
  authoring for all 24 candidate skills is now complete pending final
  independent review and human content-owner approval.
- **Evidence:** The isolated validator passed with 48 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** All 48 candidate records remain
  `pending_review`; no self-approval, human approval, or production
  eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 polygon-area distractor wording remediation (revision 12)

- **Scope:** Updated only the `v2-polygon-area-roof` distractor rationale in
  `experiments/grade-6-math-v2/content-records-v2.json`; no production files
  were touched.
- **Fix:** Replaced the unsupported “slanted side” wording with an accurate
  description that the learner treats the given perpendicular height as a side
  length when forming the perimeter-like distractor. No other record fields
  needed changes.
- **Evidence:** The isolated validator passed with 40 records and 53
  glossary-synchronized misconception codes.
- **Review status and risk:** All candidate records remain
  `pending_review`; this does not constitute human review, self-approval, or
  production eligibility.

## 2026-09-16 — Grade 6 Math v2 Batch C independent-review remediation (revision 11)

- **Scope:** Applied two narrow independent-review fixes to
  `experiments/grade-6-math-v2/content-records-v2.json`; no production files
  were touched.
- **Fixes:** Replaced the duplicate rectangle-plus-right-triangle
  `v2-polygon-area-roof` item with a structurally distinct parallelogram
  base-times-perpendicular-height item, preserving square-unit and
  misconception coverage. Changed the `v2-equations-integer-coefficient`
  distractor from `x = 10` to `x = 20/3`, the value reached by subtracting 5
  from only the left side and then dividing by 3; the rationale now matches
  that exact error path.
- **Evidence:** The isolated validator passed with 40 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** All candidate records remain
  `pending_review`; this remediation does not constitute human review,
  self-approval, or production eligibility.

## 2026-09-16 — Grade 6 Math v2 candidate content, increment 3 batch C

- **Scope:** Added ten isolated `llm_drafted` candidate records under
  `experiments/grade-6-math-v2/content-records-v2.json`: exactly two each for
  `one-variable-equations`, `real-world-inequalities`,
  `two-variable-relationships`, `polygon-area`, and
  `fractional-prism-volume`. The existing 30 records were retained, no
  production files were touched, and no record was approved.
- **Coverage:** Items span each skill's full observable evidence and
  mastery-check scope: equations with integer and rational coefficients plus
  substitution checks; real-world inequality modeling, candidate testing, and
  complete graph/solution-set descriptions; table, graph, equation, and
  dependent/independent variable roles; polygon decomposition with square
  units; and fractional-edge prism computation with cubic-unit context
  interpretation. Each record includes equivalent accepted answers,
  answer-format information, a genuine accessible text alternative,
  glossary-backed misconception distractors with skill-specific rationales,
  non-leaking hints, a valid per-skill difficulty band, and
  `review.status: "pending_review"`.
- **Controls:** `validate.ts` now enforces exactly two records for all twenty
  authored pilot skills and continues checking each content difficulty against
  its owning skill's declared `difficultyBands`.
- **Evidence:** The isolated validator passed with 40 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** Batch C remains pending independent review and
  human content-owner review. No self-approval, human approval, or production
  eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 Batch B distractor remediation (revision 9)

- **Scope:** Applied two narrow independent-review fixes to
  `experiments/grade-6-math-v2/content-records-v2.json`; no production files
  were touched.
- **Fixes:** Reworded the rational-number ordering distractor rationale to
  explicitly describe assuming a larger denominator makes a fraction larger
  without checking actual values. Replaced the ticket-cost distractor with
  `4 + 3 tours dollars`, directly showing the misconception of treating the
  variable as a word label rather than a numeric quantity that should receive
  the value 5.
- **Evidence:** The isolated validator passed with 30 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** All candidate records remain
  `pending_review`; this remediation does not constitute human review,
  self-approval, or production eligibility.

## 2026-09-16 — Grade 6 Math v2 candidate content, increment 3 batch B

- **Scope:** Added twelve isolated `llm_drafted` candidate records under
  `experiments/grade-6-math-v2/content-records-v2.json`: exactly two each for
  `rational-number-meaning`, `rational-number-representation`,
  `powers-and-whole-number-exponents`, `variables-and-expressions`,
  `equivalent-expressions`, and `equation-and-inequality-meaning`. The
  existing 18 records were retained, no production files were touched, and
  no record was approved.
- **Coverage:** Items span each skill's stated observable evidence and
  mastery-check scope rather than only an easiest sub-case: signed contexts
  and opposites; number-line ordering and coordinate placement; exponent
  construction and evaluation; context-to-expression modeling and
  substitution; property-based transformation and equivalence verification;
  and equation/inequality truth testing with full solution-set meaning.
  Every record includes canonical/equivalent accepted answers, an answer
  format, a genuine text-equivalent accessible alternative,
  glossary-backed misconception distractors, non-leaking hints, a valid
  per-skill difficulty band, `llm_drafted` provenance, and
  `review.status: "pending_review"`.
- **Controls:** `validate.ts` now enforces exactly two records for all
  fifteen authored pilot skills and checks each content difficulty against its
  owning skill's declared `difficultyBands`.
- **Evidence:** The isolated validator passed with 30 records and 53
  glossary-synchronized misconception codes. `npm run format:check`,
  `npm run lint`, `npm run typecheck`, `npm run content:validate` (4 tests),
  and `git diff --check` also passed.
- **Review status and risk:** Batch B remains pending independent review and
  human content-owner review. No self-approval, human approval, or production
  eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 batch A independent-review remediation (revision 7)

- **Scope:** Fixed four independent-review findings on Batch A records in
  `experiments/grade-6-math-v2/content-records-v2.json`; only experiment
  files and this checkpoint were touched, no production files.
- **Fixes:** (1) MAJOR — replaced `v2-factors-factor-list` (GCF/factor-listing
  duplication) with `v2-factors-distributive-factoring`, a genuine
  `6.NS.B.4` distributive-factoring item (36 + 24 = 12 × (3 + 2)) with a new,
  properly synced misconception code
  `factors-out-a-common-factor-that-is-not-the-greatest` added to the skill's
  `misconceptionCodes` and `misconception-glossary.md`. (2) MINOR — the
  difficulty-band mismatch is resolved by the replacement record using the
  valid `challenging` band. (3) MINOR — `v2-rate-smoothie-scaling`'s
  distractor rationale now matches the arithmetic producing "6 cups" (3
  extra pitchers added to the original 3 cups instead of multiplying by the
  scale factor). (4) MINOR — `v2-factors-gcf` no longer lists the confusing
  `"12 factors"` accepted-answer variant.
- **Evidence:** The isolated validator passed with 18 records and 53
  glossary-synchronized misconception codes. `npm run format:check`, `npm run
  lint`, `npm run typecheck`, `npm run content:validate` (4 tests), and
  `git diff --check` also passed.
- **Review status and risk:** All 18 candidate records remain
  `pending_review`; this remediation does not constitute human review,
  self-approval, or production eligibility.

## 2026-09-16 — Grade 6 Math v2 candidate content, increment 3 batch A

- **Scope:** Added eight isolated `llm_drafted` candidate records under
  `experiments/grade-6-math-v2/content-records-v2.json`: exactly two each for
  `ratio-language-and-meaning`, `rate-and-proportional-reasoning`,
  `multi-digit-number-operations`, and
  `factors-multiples-and-distributive-structure`. The ten earlier pilot
  records were retained; no production files were touched.
- **Controls:** Records include canonical and equivalent accepted answers,
  answer-format fields, text-equivalent accessibility alternatives,
  misconception-tied distractors using existing glossary/skill codes,
  non-leaking hint ladders, and `review.status: "pending_review"`.
  `validate.ts` now enforces exactly two records for all nine authored pilot
  skills.
- **Evidence:** The isolated validator passed with 18 records and 52
  glossary-synchronized misconception codes. `npm run format:check`, `npm run
  lint`, `npm run typecheck`, `npm run content:validate` (4 tests), and
  `git diff --check` also passed.
- **Review status and risk:** Batch A is pending independent review and human
  content-owner review. No approval or production eligibility is claimed.

## 2026-09-16 — Grade 6 Math v2 content-pilot review remediation (revision 5)

- **Scope:** Revised only isolated candidate artifacts under
  `experiments/grade-6-math-v2/`; production catalogs and runtime files remain
  untouched.
- **Fixes:** The isolated validator now enforces canonical-answer inclusion,
  forbidden-pattern hint-leakage prevention, skill-and-glossary resolution for
  every content misconception/distractor code, and a matching distractor for
  every content misconception. The temperature distractor uses the new,
  specific `adds-magnitudes-instead-of-finding-signed-difference` code, which
  is declared by `rational-number-operations` and documented in the glossary.
  The ordering item now accepts equivalent decimal and fraction forms.
- **Evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`, `npm run
  format:check`, `npm run lint`, `npm run typecheck`, `npm run
  content:validate` (4 tests), and `git diff --check` passed.
- **Review status and risk:** All candidate records remain
  `pending_review`; this revision does not self-approve content or make it
  eligible for production use. Independent review and human content-owner
  review remain required before scaling.

## 2026-09-15 — Grade 6 Math v2 candidate content pilot (increment 2)

- **Scope:** Added ten isolated `llm_drafted` candidate content records under
  `experiments/grade-6-math-v2/` only: exactly two records for
  `coordinate-distance` (`6.NS.C.8`), `variables-in-context` (`6.EE.B.6`),
  `fraction-division`, `rational-number-operations`, and
  `distribution-description`. The last skill spans dot plot, histogram, and
  box plot. No production catalog, runtime, baseline, or source dossier was
  modified.
- **Controls:** Every record includes canonical/accepted answers, unit or
  format notes, a text-equivalent accessible alternative, a documented
  misconception-tied distractor, owned `llm_drafted` provenance, and
  `review.status: "pending_review"`. `validate.ts` now checks content shape,
  unique IDs, isolated scope, exact two-record count per required skill,
  glossary-resolving distractor codes, representation coverage, and rejects
  any reviewed/approved record.
- **Evidence:** `npm run format:check`, `npm run lint`, `npm run typecheck`,
  `npm run content:validate` (4 tests), `npx tsx
  experiments/grade-6-math-v2/validate.ts`, and `git diff --check` passed.
- **Review status and risk:** The source is the product/content-owner-approved
  `Candidate Grade 6 Math v2 research — 2026-09-15` section in
  `docs/curriculum-sources.md`. These records are not self-approved and are
  not eligible for production use. Automated validation cannot establish
  mathematical accuracy, pedagogical quality, accessibility adequacy, or
  originality; independent review followed by human content-owner review is
  required before any candidate comparison or promotion.

## 2026-09-15 — Grade 6 Math v2 candidate authoring checkpoint (revision 4)

- **Scope:** Applied only mechanical/documentation-level fixes under
  `experiments/grade-6-math-v2/`; no prerequisite or standards mappings,
  production catalogs, content, runtime code, baseline, rubric, source
  dossier, or production tests changed.
- **Fixes applied:** `validate.ts` now requires dot plot, histogram, and box
  plot separately in both `observableEvidence` and `masteryCheckRule` for
  `distribution-description`; rejects duplicate misconception codes within a
  skill, duplicate glossary rows, and empty/placeholder glossary
  descriptions; and retains strict 1:1 glossary completeness validation.
  The matrix now states all three `6.SP.B.4` representations are required
  across the mastery sequence, and the glossary note reflects actual
  validator behavior and its remaining semantic limitation.
- **Evidence:** Isolated validator, targeted Prettier, and `git diff --check`
  passed. The candidate remains pending independent review and human approval;
  this agent did not self-approve it.

## 2026-09-15 — Grade 6 Math v2 candidate authoring checkpoint (revision 3)

- **Scope:** Applied a narrow revision under `experiments/grade-6-math-v2/`
  to resolve all findings from the second independent review; no production
  catalogs, content, runtime code, baseline, rubric, source dossier, or
  production tests changed, and no learning content/problem records were
  authored.
- **Fixes applied:** (1) removed or narrowed five remaining broad
  procedural/barrier edges (`factors-multiples-and-distributive-structure`,
  `rational-number-operations`, `polygon-area`, `fractional-prism-volume`,
  and `two-variable-relationships`) so each is a genuine conceptual
  dependency, expanding the root set to 10 independent entry points;
  (2) strengthened `6.SP.B.4` evidence and mastery rules to require
  demonstrated creation/interpretation across dot plots, histograms, and box
  plots, with `validate.ts` enforcing all three keywords; (3) reworded the
  fraction denominator comparison misconception to
  `compares-by-denominator-size-alone-ignoring-numerators-and-equivalence`
  describing comparison by denominator size alone while ignoring numerators
  and equivalent values; (4) added automated 1:1 sync validation between
  `skill-records-v2.json` misconception codes and `misconception-glossary.md`.
- **Evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts` passed: 24
  records, 29 exact standards each mapped to exactly one skill, 24 acyclic
  nodes, mastery-check text invariant present on every record, 6.SP.B.4
  covers all three representations, 51 misconception codes in 1:1 glossary
  sync, and matrix matches JSON. Targeted Prettier check and `git diff --check`
  passed.
- **Review status and risk:** Candidate remains pending independent review
  and human approval; this agent did not self-approve it. Next review step is
  the handoff in `experiments/grade-6-math-v2/review-handoff.md`.

## 2026-09-15 — Grade 6 Math v2 candidate authoring checkpoint (revision 2)

- **Scope:** Revised only the isolated candidate-authoring increment under
  `experiments/grade-6-math-v2/` to resolve every independent reviewer
  finding from the first pass; no production catalogs, content, runtime
  code, baseline, rubric, source dossier, or production tests changed, and
  no learning content/problem records were authored.
- **Fixes applied:** (1) removed/redesigned six unjustified prerequisite
  edges (`fraction-division <- rate-and-proportional-reasoning`,
  `variables-and-expressions <- powers-and-whole-number-exponents`,
  `equation-and-inequality-meaning <- variables-in-context`,
  `real-world-inequalities <- one-variable-equations`,
  `fractional-prism-volume <- fraction-division`,
  `distribution-description <- multi-digit-number-operations`), and
  re-auditing every remaining edge surfaced and removed a seventh
  (`powers-and-whole-number-exponents <- multi-digit-number-operations`);
  (2) every `masteryCheckRule` now explicitly requires an independent,
  unassisted delayed check and states assisted attempts alone cannot
  establish secure mastery, enforced by a new isolated `validate.ts` text
  assertion that does not touch the production `SkillSchema`;
  (3) strengthened `6.EE.A.1` to require writing and evaluating numerical
  expressions with whole-number exponents; (4) strengthened `6.NS.C.7` to
  explicitly cover ordering, absolute value, and rational-number operations;
  (5) strengthened `6.SP.B.4` to require a dot plot, histogram, or box plot,
  and `6.SP.B.5` to report the number of observations; (6) `validate.ts` now
  enforces exactly one candidate skill per approved standard and parses
  `standards-to-skill-matrix.md` against `skill-records-v2.json` so the two
  cannot drift; (7) tightened all 51 misconception codes into specific,
  observable learner errors and added `misconception-glossary.md` documenting
  each one.
- **Evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts` passed: 24
  records, 29 exact standards each mapped to exactly one skill, 24 acyclic
  nodes, the mastery-check text invariant present on every record, and the
  matrix matches the JSON. Targeted Prettier check and `git diff --check`
  passed.
- **Review status and risk:** Candidate remains pending independent review
  and human approval; this agent did not self-approve it. Automated checks
  establish structure and text-invariant presence only; they do not approve
  standards interpretation, mathematics, pedagogy, accessibility, or
  originality. `misconception-glossary.md` notes its own completeness is not
  yet automatically enforced. Next review step is the handoff in
  `experiments/grade-6-math-v2/review-handoff.md`.

## 2026-09-15 — Grade 6 Math v2 candidate authoring checkpoint

- **Scope:** Completed only the first isolated candidate-authoring increment
  under `experiments/grade-6-math-v2/`; no production catalogs, content,
  runtime code, baseline, rubric, source dossier, or production tests changed.
- **Source and decisions:** Used the approved `Candidate Grade 6 Math v2
  research — 2026-09-15` section in `docs/curriculum-sources.md`. The
  candidate covers all 29 approved Grade 6 codes, explicitly including
  `6.NS.C.8` and `6.EE.B.6`, makes no IUSD pacing claim, and does not create
  dedicated competition curricula.
- **Artifacts:** Added a 29-row standards-to-skill matrix, 24 schema-shaped
  versioned Skill records, conceptual prerequisite justifications, an
  isolated validator, and a pending independent-review handoff. No learning
  content/problem records were authored.
- **Evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts` passed:
  24 records, 29 exact standards, unique codes, resolvable prerequisites, and
  24 acyclic nodes. Targeted Prettier check and `git diff --check` passed.
- **Review status and risk:** Candidate remains pending independent review and
  human approval. Automated checks establish structure only; they do not
  approve standards interpretation, mathematics, pedagogy, accessibility, or
  originality. Next review step is the handoff in
  `experiments/grade-6-math-v2/review-handoff.md`.

## 2026-09-19 — AMC 8 research dossier (pending review)

- **Completed `amc8-research`**: added a new "AMC 8 research — 2026-09-19"
  section to `docs/curriculum-sources.md`, matching the Math Kangaroo
  dossier structure (scope, source register, framework, domain coverage,
  sequencing, originality discipline, conflicts/gaps, authoring handoff).
- **Confirmed from primary MAA text**: AMC 8 is administered by the MAA as a
  **25-question, 40-minute** competition for **students in grade 8 and
  below**, focused on middle-school mathematics including counting and
  probability, estimation, proportional reasoning, elementary geometry,
  spatial visualization, graphs/tables, and some beginning algebra topics.
- **Official archive search outcome**: actively checked the following MAA
  URLs and recorded exact statuses in the dossier —
  `maa.org/math-competitions/amc-8` (CLI `curl -I -L`: **403**; `web_fetch`:
  **404**), `maa.org/math-competitions/past-amc-problems` (**403** / **404**),
  `maa.org/math-competitions/amc-8/sample-amc-8-problems` (**403**), and
  `maa.org/math-competitions/amc-8/sample-questions` (**403** / **404**).
  These checks do **not** prove no official MAA-owned archive exists; they
  document exactly what was searched and what happened.
- **Secondary/provisional items**: multiple-choice/5-option format,
  no-calculator rules, +1/0 scoring, and no-penalty-for-guessing claims were
  corroborated from AoPS's community-maintained AMC 8 pages (which cite the
  MAA policy URL) and should stay **provisional pending human confirmation**
  from MAA. The dossier also records the officially authorized LIVE by
  Po-Shen Loh past-contests archive as a legal secondary fallback, not an
  MAA-owned primary source.
- **Open human-review item surfaced**: because AMC 8 targets an older nominal
  grade band than this learner's current Grade 6 placement, the human reviewer
  should explicitly confirm the intended ambition level, frustration/parent-
  messaging guardrails, and that the mirrored **core prep + contest** tier
  structure is age-appropriate for this learner.
- Section is marked **"Pending product/content-owner review"** — the research
  agent cannot self-approve. Next: human review of this dossier
  (`amc8-research-approval`) before any `amc8-authoring` work begins.


## Current status

- Phase: 1 — synthetic journeys across all 5 Grade 6 Math domains, skill graph, planner, an actionable planner UI, an on-demand parent weekly digest, and a basic accessible visual design (now automated-WCAG-AA-checked) covered; **Grade 6 Math curriculum v3 shipped 2026-09-18**: 27 skills, 54/54 content records fully human-reviewed (0 pending), merged from the v1 baseline plus the independently-researched/reviewed v2 candidate graph (see the 2026-09-16 through 2026-09-18 entries below for the full merge, safety-gate, and content-review trail); the pilot-readiness decisions (audience, identity/auth, hosting, consent/retention, provider, budget/latency, eval gate) are made for a single-household pilot (ADR-0008, ADR-0009, ADR-0005). **All three approved implementation tracks are now live**: Track 1, real authentication (ADR-0010). Track 2, real Claude adapter (ADR-0011), reviewed, approved, and enabled. Track 3, Render deployment (ADR-0012) — **confirmed genuinely live 2026-09-13**: a real account was provisioned, sign-in works at `https://learning-forge.onrender.com`, and a real hint request was confirmed hitting the real Anthropic API (visible ~1-2s latency, non-templated text), not the fake adapter. This is a real, live, single-household pilot now, not just a local demonstration
- Branch: `main`
- Repository state: PRs #13–#42 are merged to `main`; the deployed app is live and working. The web service is currently on the **Starter** plan by deliberate choice for this pilot. The original Free-plan decision is deferred for a later cost review, not an operational blocker.
- Last verified commit: `162b8ac feat: refresh portal visual design and add a subject switcher (#42)`
- Operational cleanup in progress: tutor traces now retain an optional session
  reference, and the live hint route enforces configurable household-daily and
  session hint limits before calling the model. The current defaults are 100
  hints per household per rolling day and 8 hints per session; environment
  variables can lower or raise them for the pilot.
- Added an aggregate-only usage report: run `npm run report:tutor-usage --
  --days 7`. It reports request/token totals, average and p95 latency,
  fallback/error counts, model breakdowns, and opaque household/session limit
  utilization without selecting learner text or trace excerpts.
- Corrected `render.yaml` to declare the accepted Starter web-service plan
  and added `docs/backup-recovery.md` with pilot RPO/RTO targets, dashboard
  verification steps, a synthetic restore drill, and incident procedure.
  Render backup frequency, retention, and restore behavior remain explicitly
  unverified until checked in the provider dashboard.
- Formalized the provider boundary with an explicit `TutorProvider` contract
  and fail-closed configuration. The current supported adapters are `fake` and
  `anthropic`; adding another provider requires a new adapter implementing the
  shared `TutorModel` interface rather than changing tutor policy or routes.
- Added provider-input filtering and regression tests for secret/profile-field
  leakage, plus `exportHouseholdData`/`deleteHouseholdData` services and an
  integration drill covering password-hash exclusion, raw attempt export,
  trace export, household-scoped deletion, and idempotent cleanup.
- Added `docs/learner-feature-expansion.md`, prioritizing session progression,
  diagnostic placement, independent mastery checks, learner-visible progress,
  and accessibility before higher-risk feature areas.
- Implemented the first learner-feature increment: session progression.
  `startSession` now resumes an in-progress session (same content, not yet
  ended) instead of creating a duplicate on every page load, and returns the
  latest practice attempt, hint count, and independent-check result so the
  UI can rehydrate state after a refresh. A session's `endedAt` is now set
  when its independent check passes. Added a unique `(sessionId,
  attemptNumber)` constraint (migration `0005_add_attempt_session_unique`)
  with retry-on-conflict in `createAttempt`, guarding against duplicate
  attempt numbers from a double-submitted answer.
- Implemented the second learner-feature increment: diagnostic/placement.
  `getDiagnosticPlan` offers one independent, one-shot item per root skill
  (no prerequisites) that this learner has no `MasteryEstimate` for yet,
  capped at 5 items, derived purely from the current skill/content catalogs
  and mastery rows so it is safe to recompute repeatedly. `recordDiagnosticAttempt`
  records the attempt under the existing `AttemptContext.DIAGNOSTIC` value,
  rejects a second diagnostic attempt for an already-assessed skill, and
  never sets `independentDelayedCheck` - a diagnostic guess seeds a
  placement estimate but is deliberately never treated as confirmed,
  independently-checked mastery. Added `GET /api/phase1/diagnostic` and
  `POST /api/phase1/diagnostic-attempt`, and a "Quick placement check"
  section on the learner homepage that runs diagnostic items with no
  tutoring/hint controls.
- Implemented the third learner-feature increment: independent mastery
  checks with spaced review. A skill's confirmed mastery
  (`MasteryEstimate.independentDelayedCheck: true`) is now revisited rather
  than treated as permanent: `getReviewQueue` finds confirmed skills whose
  `updatedAt` is older than `MASTERY_REVIEW_INTERVAL_DAYS` (14, a pedagogy
  constant, not an env-configurable operational guardrail), oldest first,
  capped at 5. `recordReviewAttempt` rejects any skill without confirmed
  mastery (`'Review is not available for this skill'`), otherwise runs a
  single independent, one-shot probe (no hints) via `createAttempt` with a
  new `reviewDecay: true` flag: unlike every other call site, a review's
  outcome sets `independentDelayedCheck` directly to the attempt's result
  (not the previous sticky "once true, always true" OR-logic), so a failed
  review can genuinely revoke prior confirmation and send the skill back to
  regular practice. The review session always ends after one attempt,
  win or lose. Added `GET /api/phase1/review` and `POST
  /api/phase1/review-attempt`, and a "Review due" section on the learner
  homepage (mirroring the diagnostic section, same no-hint/no-tutor
  constraints). Verified with 3 new integration tests that manipulate
  `MasteryEstimate.updatedAt` directly to simulate the interval (due vs.
  not-yet-due filtering, confirm-on-pass, decay-and-requeue-to-practice on
  fail, and rejection for unconfirmed skills) — no waiting on real time.
- Implemented the fourth learner-feature increment: learner-visible
  progress. `getLearnerProgress` returns three things, each traceable to
  persisted evidence and deliberately free of scores, grades, or rankings:
  a per-skill status (`NOT_STARTED` / `PRACTICING` / `INDEPENDENTLY_CONFIRMED`,
  derived only from whether a `MasteryEstimate` row exists and whether its
  `independentDelayedCheck` is true), up to 5 "recent strengths" (the most
  recent independent-check-passing `Attempt` per skill, deduplicated, each
  citing the exact attempt id and date that earned it), and one recommended
  next activity reusing the same `getPlan`/planner reasoning already shown
  in "Recommended next activities" (so the two never disagree). Added `GET
  /api/phase1/progress` and a "Your progress" section on the learner
  homepage, refreshed after diagnostic attempts, review attempts, and
  independent-check passes (the only events that can move a skill's status).
  Verified with 3 new integration tests seeding mastery/attempt rows
  directly to cover all three status labels, strength traceability, and
  next-activity parity with the plan.
- Added a `/help` page (linked from both the learner homepage and the
  parent evidence page) walking learners and parents through every current
  feature in plain language: the recommended-activities/session/hint/
  independent-check loop, the quick placement check, spaced review, the new
  progress view, the parent evidence page and on-demand weekly digest,
  the privacy/data-export/deletion process (currently support-mediated, not
  a self-service button), and an explicit list of what this pilot does not
  do yet. No new service logic; content only.
- Implemented the fifth and final learner-feature increment: accessibility
  and feedback refinement. Fixed a real heading-hierarchy bug on the learner
  homepage (the "Your progress"/"Quick placement check"/"Review due"/
  "Recommended next activities" sections rendered as `h2` ahead of the
  session content title, which was itself an `h1` — a screen-reader user
  navigating by headings would hit the page's only `h1` last, after four
  `h2`s). Added a visually-hidden page-level `h1`, demoted the session
  content title to `h2` and the "Tutor" aside to `h3` so the whole page now
  has one consistent, non-skipping outline. Added a
  `prefers-reduced-motion: reduce` media query that collapses the existing
  button hover transition (and any future transitions/animations) to
  effectively instant. Improved error recovery on the answer form: an empty
  submission is now caught client-side (no network round-trip), the error
  is tied to the input via `aria-invalid`/`aria-describedby`, and focus
  returns to the input instead of being silently dropped; a genuine
  submission failure now says so explicitly instead of reusing the
  empty-answer message. Added a `/help` axe scan and a keyboard-operability
  test for the new blank-answer error-recovery flow; fixed a real test bug
  the new "Your progress" section exposed (multiple same-named "Garden
  rows" buttons across sections made two existing tests ambiguous - both
  now scope to their specific `region`). Full Playwright suite (17 tests,
  +2 new) and axe WCAG AA scans across `/`, `/parent`, and `/help` all pass
  with zero violations.



`docs/05-data-and-student-model.md` describes the target domain model. This
table tracks which entities exist in `prisma/schema.prisma` today versus
which remain design-only, so the design doc is not mistaken for current
schema state.

| Entity (from `05-data-and-student-model.md`) | Status | Notes |
|---|---|---|
| `Household`, `User`, `LearnerProfile` | Implemented | Parent authentication is live; learner access is parent-mediated and household-scoped |
| `ConsentRecord` | Implemented | Schema only; no consent-capture flow |
| `Session` | Implemented | Now carries `contentKey` (migration `0002_add_session_content_key`), so a session is tied to any catalog item, not just `unit-rates-1` (ADR-0007) |
| `Attempt`, `AssistanceEvent` | Implemented | Immutable-attempt trigger enforced in migration |
| `TutorInteraction`, `TutorTrace` (as `ModelRun`) | Implemented | Redacted excerpt fields; no raw-text retention |
| `MasteryEstimate`, `MasteryContribution` | Implemented | `skillCode` is a bare string, not a normalized `Skill` row |
| `Curriculum`, `Standard`, `Skill`, `SkillPrerequisite` | Implemented as versioned code, not a DB table | `content/skills/*.json` (19 skills, all 5 domains), validated by `SkillSchema`; prerequisite references and cycles are checked at load time (ADR-0006). `MasteryEstimate.skillCode` still has no foreign key to it |
| `ContentItem`, `Problem`, `HintStep`, `Rubric`, `ContentVersion` | Not implemented | Content lives as version-controlled JSON under `content/{ratios,number-system,expressions-and-equations,geometry,statistics}/`, validated by Zod, not a DB table. Content `skillCode` values are cross-checked against the skill catalog. No rubric-based validator type exists yet — all content, including conceptually rubric-scored skills, uses the deterministic validator |
| `LearningPlan`, `PlanItem` | Implemented as a pure function plus an actionable route/UI, not persisted | `planNextActivities` produces an in-memory plan; `getPlan` wires it to real mastery/content data, exposed via `GET /api/phase1/plan`. Selecting a recommended item on the learner page now starts a real session for it (ADR-0007). No scheduler or persisted `LearningPlan` row exists |
| `Assessment`, `AssessmentResult` | Not implemented | Diagnostic/assessment concept not built; only `Attempt` with `context: DIAGNOSTIC | PRACTICE | MASTERY_CHECK` |
| `MisconceptionEvidence` | Not implemented | |
| `ReviewSchedule` | Not implemented | No spaced-review scheduling yet; the planner deliberately does not fabricate a review-due date without one |
| `PolicyVersion`, `EvalRun` | Not implemented | Policy/prompt versions are recorded as strings on trace rows, not their own tables; eval runs are file-based (`evals/`, `reports/`), not persisted |

## Proposal analysis (2026-09-04)

### Contradictions and unclear requirements

1. The first vertical slice says “student signs in,” while the MVP says one learner and one parent account, and identity does not define whether the learner has credentials, a parent-mediated session, or pseudonymous access.
2. “Parent consent and control” is required, but the child’s age/consent boundary, consent evidence, revocation behavior, guardian verification, and school-agreement assumptions are unspecified.
3. IUSD sequencing is an input, but the curriculum document says it is manually curated; source, permission, update owner, versioning, and behavior when school timing differs are undefined.
4. “AoPS-style” and contest-style labels are described as skill inspiration, but the boundary between permissible inspiration and copied/proprietary content, and the originality record, are unspecified.
5. Tutor transitions depend on elapsed work, accessibility override, and parent/teacher configuration, but units, defaults, override authority, audit behavior, and anti-leakage limits are undefined.
6. “Validate mathematical correctness where possible” and “answer-leak detector” lack required validator/equivalence scope, failure semantics, and coverage targets.
7. Tutor-move `confidence` has no calibration/use policy and could be mistaken for mastery confidence, despite the explicit prohibition on treating LLM judgment as mastery evidence.
8. The entity list lacks relationships, cardinality, identifiers, timestamps, access ownership, deletion semantics, and the boundary between raw child text and redacted traces.
9. Mastery has no concrete aggregation algorithm, context modifiers, uncertainty representation, or fixtures. “Review due” is both a state and a scheduling concept without a defined relationship.
10. Privacy requirements lack an accountable owner, provider regions/subprocessors, operational export/deletion behavior, backup deletion rules, logging access policy, and a pilot launch checklist.
11. Evaluation says thresholds follow a baseline, while the roadmap calls for Phase 2 release gates; corpus size, severity taxonomy, adjudication, and gate ownership must be defined first.
12. Phase 1 requires a real model adapter, but provider choice and child-data contractual settings are unresolved in Phase 0. The Phase 1 exit must allow a sandbox/synthetic-data adapter until approved.
13. “Local PostgreSQL” and a database-backed queue are required, but supported versions, setup, migration/rollback policy, and whether the queue is needed in Phase 0 are unspecified.
14. “One documented command” is not reconciled with the instruction not to initialize now; it can be specified in Phase 0 and verified after scaffolding.

### Decisions that genuinely block Phase 0

These do not block ADRs or repository scaffolding, but they block affected Phase 0 deliverables or a trustworthy Phase 0 exit:

- Human approval of the pilot identity/consent model, including parent verification, learner access, withdrawal, export, deletion, and retention. Otherwise identity/privacy and persistence cannot be finalized safely.
- Human approval of the ratios content provenance/license policy and review workflow. Otherwise the ten required problems cannot be accepted.
- A provider/data-processing decision for any model used with learner data (provider, region, retention, training use, subprocessors, redaction). Until then, only a fake adapter with synthetic data is safe.
- A minimum eval corpus size, severity taxonomy, adjudication owner, and initial gate policy. Otherwise the eval harness has no reproducible target.
- A pilot accessibility/accommodation scope and measurable latency/monthly model budget target. WCAG 2.2 AA remains the baseline while the pilot scope is decided.

Hosting/authentication vendor selection matters for Phase 1 and production, but need not block Phase 0 if ports, synthetic/local identity, and an ADR are defined. Exact mastery weights are experiments, not blockers; keep them configurable and do not present them as validated constants.

### Scope assessment

The modular-monolith choice is appropriate for the MVP. Domain seams, provider abstraction, fake adapter, versioned content, structured tutor output, and a background-job seam support the ratios slice without premature microservices, vector infrastructure, agent swarms, mobile clients, or organization tenancy.

The principal scope risk is attempting too much policy and data surface at once. Phase 0 should stay limited to repository/tooling, decisions, contracts, a small reviewed content seed, a deterministic fake tutor/trace boundary, privacy/threat artifacts, and minimal local persistence. Defer real provider integration, adaptive mastery calibration, queue complexity, and broad UI.

### Coverage assessment

- Tutor policy is conceptually strong, but needs an explicit transition table, accessibility override constraints, validator/equivalence rules, confidence semantics, and versioning requirements.
- Child safety has sound prohibitions and fallback/moderation requirements, but lacks age/guardian assumptions, abuse/self-harm escalation, operational ownership, and safety-record lifecycle rules.
- The data model has the right entities and immutable-evidence principle, but lacks relationships, access-control rules, PII classification, lifecycle fields, and migration strategy.
- Evaluation has the right pyramid and dimensions, but needs reproducible corpus, labels, severity, adjudication, fixtures, and baseline/gate ownership.
- Privacy covers minimization, consent, no advertising/training, encryption, deletion/export, vendor review, and legal review. It still needs a data-flow inventory, regions/subprocessors, backup deletion behavior, logging access policy, incident contacts/timelines, and notices.

## Proposed Phase 0 issue sequence

Each issue is intentionally issue-sized. Expected paths are targets and may be adjusted during implementation without expanding scope.

### 1. LF-0.1 — Approve pilot boundaries and decision register

- Objective: Convert open questions into approved pilot assumptions and establish ADR conventions.
- Rationale: Identity, consent, content, provider, budget, accessibility, and evaluation choices constrain later contracts.
- Expected files: `docs/09-decisions-and-open-questions.md`, `docs/adr/0001-phase-0-boundaries.md`, optionally `docs/adr/README.md`.
- Acceptance criteria: pilot learner/parent assumptions, pseudonym policy, consent/retention/deletion ownership, provider/data boundaries, content provenance, accessibility scope, latency/budget targets, eval ownership/severity, and deferrals are recorded with owners/dates.
- Tests and verification: Markdown/link check and reviewer checklist covering every open question.
- Dependencies: none.
- Risks: premature decisions may constrain evidence; record reversal signals and keep experiments configurable.
- Human decision required: Yes — product owner, privacy/legal, and educator/parent review as applicable.

### 2. LF-0.2 — Establish repository quality gates and contribution workflow

- Objective: Add the minimal TypeScript/Next.js shell, formatting/type/test commands, CI, and issue/PR templates without product behavior.
- Rationale: Phase 0 needs a reproducible fresh-clone path and green CI.
- Expected files: `package.json`, `tsconfig.json`, formatter/linter config, `vitest.config.*`, `.github/workflows/ci.*`, `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`, minimal `src/`/test placeholder, `.gitignore`, README setup section.
- Acceptance criteria: one deterministic documented check command; CI runs formatting, type checking, and unit tests; secrets are excluded; no feature UI or provider calls.
- Tests and verification: formatter check, type check, unit tests, CI-equivalent command, `git diff --check` (after dependencies are approved/available).
- Dependencies: LF-0.1.
- Risks: scaffolding can expand into premature architecture; keep it minimal.
- Human decision required: No, unless the approved stack/CI platform changes.

### 3. LF-0.3 — Define domain contracts and structured tutor schemas

- Objective: Define Zod/domain contracts for content, attempts, assistance, tutor moves, traces, mastery evidence, and provider ports.
- Rationale: Hard constraints require separate domains, structured model output, and rejection/repair of invalid output.
- Expected files: `src/domain/**`, `src/contracts/**`, `tests/contracts/**`, and an ADR for consequential choices.
- Acceptance criteria: malformed/unsafe outputs reject; authorization is separate from phrasing; move confidence is explicitly not mastery confidence; traces include policy/prompt/model/latency/tokens/validation/outcome and omit raw child text by default; ports expose no provider-specific types.
- Tests and verification: Vitest valid/invalid schema, leakage flags, fallback-required validation, redaction, and adapter-boundary tests.
- Dependencies: LF-0.1, LF-0.2.
- Risks: over-modeling future subjects; implement only ratios-slice needs.
- Human decision required: No, except for changes to approved privacy/policy semantics.

### 4. LF-0.4 — Define persistence and local database contract

- Objective: Turn core entities into a minimal relational schema and reversible migration/local PostgreSQL workflow.
- Rationale: Evidence, traceability, consent, and derived mastery need durable boundaries.
- Expected files: `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.*`, local DB docs/config, persistence integration tests, and a persistence/retention ADR if needed.
- Acceptance criteria: IDs/relationships/timestamps/version/access ownership are explicit; raw attempts are immutable; derived mastery references attempts and algorithm version; PII/free-text retention/deletion hooks are documented; rollback evidence exists; seed data is synthetic/original.
- Tests and verification: migration apply/rollback, cross-household authorization, immutability/version-link, export/deletion, and schema tests.
- Dependencies: LF-0.1, LF-0.2, LF-0.3.
- Risks: irreversible or overbroad retention; no production data permitted.
- Human decision required: Yes for final retention/deletion and identity fields.

### 5. LF-0.5 — Create and review the ratios content seed

- Objective: Author ten original, versioned ratios problems with mappings, difficulty, solutions, misconceptions, approved hint ladders, provenance, and review records.
- Rationale: Required Phase 0 content is the foundation for deterministic tutor/eval work.
- Expected files: `content/ratios/**`, `content/schema.*`, `scripts/content-validate.*`, content tests, `docs/content-review.md`.
- Acceptance criteria: ten problems cover intended skill types/difficulty; every item validates; each has deterministic answer/validator, hint ladder, forbidden leakage patterns, provenance/license, reviewer, version, and accessibility notes; no proprietary text is reproduced.
- Tests and verification: schema/semantic validation, deterministic answer tests, reviewer checklist, answer-equivalence/leakage fixtures.
- Dependencies: LF-0.1, LF-0.2, LF-0.3.
- Risks: derivative copying, math errors, inaccessible representations; educator/content review mandatory.
- Human decision required: Yes — provenance, originality, math quality, and workflow approval.

### 6. LF-0.6 — Implement the deterministic fake tutor and policy harness

- Objective: Implement the policy state machine, fake `TutorModel`, structured validation, answer protection, bounded fallback, and privacy-filtered traces for synthetic sessions.
- Rationale: This is the highest-value Phase 0 behavioral seam and enables Phase 1 without a real model or child data.
- Expected files: `src/tutor/**`, `src/policy/**`, fake adapter, trace/audit implementation, `tests/unit/**`, `tests/integration/**`, policy version fixture/ADR.
- Acceptance criteria: server state cannot be skipped by model output; genuine-attempt/assistance rules are deterministic/configurable; canonical answers are absent from early context; invalid output repairs once then falls back without mastery advancement; traces redact child text by default; Math Tutor and Contest Coach are versioned policy profiles.
- Tests and verification: transition, attempt, assistance, answer-protection, fallback, and mastery non-advancement unit tests; fake-output contract/orchestration integration tests; leakage, injection, tone, and accessibility eval fixtures.
- Dependencies: LF-0.3, LF-0.5; LF-0.4 if traces persist here.
- Risks: fake behavior can create false confidence; exercise failure paths and label real-model quality as unverified.
- Human decision required: Yes for policy defaults and fallback language; no credentials needed.

### 7. LF-0.7 — Produce the threat model, privacy inventory, and pilot controls

- Objective: Map data flows/threats and define controls for identity, content, attempts, tutor text, traces, providers, backups, export, and deletion.
- Rationale: Current principles are not an actionable pilot-readiness baseline.
- Expected files: `docs/threat-model.md`, `docs/privacy-inventory.md`, `docs/incident-response.md`, `docs/pilot-readiness-checklist.md`, relevant ADR updates.
- Acceptance criteria: each data class has purpose, minimization, access role, region/storage, retention, deletion/backup behavior, export format, processor status, and logging policy; threats include cross-user access, injection, leakage, unsafe content, abuse, and credential compromise; escalation/owners and legal-review gates are named; no secrets/real child data included.
- Tests and verification: completeness checklist, secret-like-value scan, authorization/privacy cases linked to controls, reviewer sign-off.
- Dependencies: LF-0.1, LF-0.3, LF-0.4 (can start in parallel after data assumptions stabilize).
- Risks: docs can go stale; assign owners and link later verification issues.
- Human decision required: Yes — privacy/legal, security, and product sign-off.

### 8. LF-0.8 — Establish baseline tutor eval corpus and release gate

- Objective: Version a small reviewed synthetic eval set and reproducible runner/report for tutor quality and safety dimensions.
- Rationale: Phase 2 gates need a baseline, severity taxonomy, and regression evidence.
- Expected files: `evals/cases/**`, `evals/schema.*`, `scripts/eval.*`, `reports/README.md`, `tests/evals/**`, `docs/evaluation-baseline.md`.
- Acceptance criteria: cases cover leakage, hint progression, correctness, tone, age appropriateness, injection, accessibility, confident-wrong, and frustrated learners; each defines allowed/forbidden outcomes, severity, equivalence, rubric, provenance; fake-adapter report is deterministic, traceable, and does not claim uncalibrated thresholds; adjudication and threshold-setting are documented.
- Tests and verification: eval schema, golden fake run, malformed-case rejection, reproducible report, CI smoke gate; no real model/learner data.
- Dependencies: LF-0.3, LF-0.5, LF-0.6, LF-0.7.
- Risks: small corpus misses failure modes; label baseline and expand in Phase 2.
- Human decision required: Yes — corpus scope, severity labels, and gate ownership.

### 9. LF-0.9 — Phase 0 integration verification and handoff

- Objective: Prove the fresh-clone synthetic seed/fake-tutor path and update the durable handoff record.
- Rationale: Phase 0 exit is a reproducible repository/CI baseline, not a learner-facing product.
- Expected files: `README.md`, `docs/PROGRESS.md`, config files only as needed, optional retrospective.
- Acceptance criteria: documented one-command setup/check succeeds from a fresh clone; CI is green; migrations/rollback, content validation, contract/unit/integration tests, eval smoke, privacy/threat checklist, ADRs, approvals, risks, and exact Phase 1 prompt are linked; no commit/push by the agent.
- Tests and verification: formatting, type, unit, contract, persistence integration, eval smoke, accessibility/static checks where available, `git diff --check`, working-tree review.
- Dependencies: LF-0.2 through LF-0.8 as applicable.
- Risks: environment-specific setup failures; document supported versions and distinguish unavailable services from product failures.
- Human decision required: Yes — accept Phase 0 exit and authorize Phase 1.

## Verification log

| Date | Command/eval | Result | Notes |
|---|---|---|---|
| 2026-09-04 | `rg --files -g 'README.md' -g 'AGENTS.md' -g 'docs/**' \| sort` | Pass | Confirmed the complete instructed document set. |
| 2026-09-04 | Read `README.md`, `AGENTS.md`, and all `docs/*.md` | Pass | Reviewed 818 lines; no application code exists. |
| 2026-09-04 | `git status --short --branch` and repository inspection | Pass | On `feature/project-foundation`; documentation-only repository. |
| 2026-09-04 | `test -f docs/adr/README.md && test -f docs/adr/0001-phase-0-boundaries.md && rg -n 'Phase 0 decision register\|LF-0\\.1\|Pending human approval\|Required owner/reviewer\|Next exact prompt' docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md` | Pass | ADR convention, decision register, approval statuses, and handoff are present. |
| 2026-09-04 | `git diff --check` | Pass | No whitespace errors in the LF-0.1 changes. |
| 2026-09-04 | `git status --short --branch && git diff --stat && git ls-files --others --exclude-standard` | Pass | Only the intended LF-0.1 documentation files are modified or untracked. |
| 2026-09-04 | ADR status/approval-record review | Pass | ADR status is exactly `Proposed`; owner roles and 2026-09-11 planning target dates are explicit; approvals remain pending. |
| 2026-09-04 | `rg -n --fixed-strings -- "- Status: Proposed" docs/adr/0001-phase-0-boundaries.md` | Pass | ADR status conforms to the documented allowed values. |
| 2026-09-04 | `rg -n "Target date\|2026-09-11\|Pending approval" docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md` | Pass | Owner/reviewer roles, target dates, and pending approval states are explicit. |
| 2026-09-04 | `git diff --name-only && git ls-files --others --exclude-standard` | Pass | Changes remain limited to LF-0.1 documentation and ADR files. |
| 2026-09-04 | `test ! -e package.json` | Pass | Confirms no application toolchain exists; formatting/type/test/build checks remain not applicable. |
| 2026-09-04 | `git pull --ff-only` on `main` | Pass | `main` was already up to date with `origin/main` before creating the feature branch. |
| 2026-09-04 | `git switch -c feature/phase-0-decisions` and `git stash pop` | Pass | LF-0.1 work was restored on the appropriately named feature branch without loss. |
| 2026-09-04 | Required-file, status, owner/date, and scope checks | Pass | ADR convention and boundary decision register satisfy LF-0.1 documentation criteria; all approvals remain explicitly pending. |
| 2026-09-04 | Formatting, linting, type checking, unit/integration tests, build verification | Not applicable | This issue changes documentation only; no `package.json`, source, test runner, lint config, build config, or dependencies exist. |
| 2026-09-04 | `set -eu; test -f docs/adr/README.md; test -f docs/adr/0001-phase-0-boundaries.md; rg -n --fixed-strings -- "- Status: Proposed" docs/adr/0001-phase-0-boundaries.md; rg -n "Phase 0 decision register|Decision owner: Product owner|Target date|Pending human approval|Next exact prompt" docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md; git diff --check` | Pass | Final LF-0.1 document, ADR-format, decision-register, handoff, and whitespace checks passed. |
| 2026-09-04 | `test ! -e package.json; rg -n --hidden -g '!.git/**' -g '!docs/**' -g '!AGENTS.md' -g '!README.md' 'OPENAI_API_KEY|AWS_SECRET_ACCESS_KEY|BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY' .` | Pass | No application toolchain or secret-like values found outside intentional documentation references. |
| 2026-09-04 | `find . -path './.git' -prune -o -type d \( -name node_modules -o -name .next -o -name dist -o -name build -o -name coverage \) -print; find . -path './.git' -prune -o -type f \( -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' \) -print` | Pass | No generated build output or local database files found. |
| 2026-09-04 | Full LF-0.1 branch review against acceptance criteria | Pass | No critical, high, or valid medium findings remain; changes stay within LF-0.1. |
| 2026-09-04 | Formatting, type checking, unit/integration tests, build verification | Not applicable | No `package.json`, application source, test runner, build configuration, or dependencies exist; LF-0.2 owns the scaffold and these commands. |
| 2026-09-05 | `npm run verify` | Pass | Final run: Prettier, ESLint with Next.js rules, TypeScript, Vitest (1 test), and Next production build all passed. |
| 2026-09-05 | `git diff --check` | Pass | Final LF-0.2 diff has no whitespace errors. |
| 2026-09-05 | `git status --short --branch && git diff --name-only && git ls-files --others --exclude-standard` | Pass | Only intended LF-0.2 files are modified or untracked; generated output remains ignored. |
| 2026-09-05 | `git pull --ff-only` on `main` | Pass | Main was synchronized before creating the LF-0.2 branch. |
| 2026-09-05 | `npm install` | Pass with risk noted | Generated `package-lock.json`; npm reported 2 vulnerabilities (1 moderate, 1 high) and install-script approval warnings. No forced audit fix was run. |
| 2026-09-05 | `npm run format` | Pass | Formatted the LF-0.2 source, configuration, README, and issue-template files. |
| 2026-09-05 | `npm run verify` | Pass | Prettier, ESLint with Next.js rules, TypeScript, Vitest (1 test), and Next production build all passed. |
| 2026-09-05 | `npm audit --omit=dev` | Unable to complete | Registry DNS resolution failed in the environment; dependency audit status remains an unresolved follow-up risk. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.2 changes. |
| 2026-09-05 | Staged-file and generated-output audit | Pass | Only intended LF-0.2 files are in scope; generated output is ignored; no secrets or learner data present. |
| 2026-09-05 | `npm ci && npm run verify` | Pass with risk noted | Fresh-lockfile install and the complete verification suite passed; npm reported 2 vulnerabilities (1 moderate, 1 high) and install-script approval warnings. |
| 2026-09-05 | Full LF-0.2 branch diff review | Pass | No critical, high, or valid medium findings across correctness, pedagogy, privacy, safety, accessibility, or architecture; no future-issue work found. |
| 2026-09-05 | `git pull --ff-only` on `main` | Pass | Main was synchronized after LF-0.2 merge before creating the LF-0.3 branch. |
| 2026-09-05 | `npm install zod` | Pass with risk noted | Added the approved schema-validation dependency; npm again reported 2 vulnerabilities (1 moderate, 1 high). |
| 2026-09-05 | `npm run format && npm run verify` | Pass | Prettier, ESLint with Next.js rules, TypeScript, Vitest (10 tests), and Next production build passed. |
| 2026-09-05 | LF-0.3 contract and scope review | Pass | Contracts separate policy authorization from model phrasing, redact traces by default, constrain provider inputs, and contain no persistence/orchestration/provider implementation. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.3 changes. |
| 2026-09-05 | Secret/private-data/generated-output audit | Pass | No credentials, private learner data, local databases, or generated build artifacts are in the intended change set; ignored build-info remains untracked. |
| 2026-09-05 | `npm run format` | Pass | Prettier formatted the LF-0.4 schema, migration, local database configuration, tests, scripts, CI, and documentation; no changes remained after formatting. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run db:validate; npm run db:generate; npm run db:deploy; npm run db:seed; npm run test:integration; npm run db:rollback; npm run db:deploy; npm run test:integration; npm run verify` | Pass | Prisma schema validation and client generation passed; migration applied; synthetic seed inserted; persistence tests passed before and after rollback/re-apply (2 tests each); formatting, linting, type checking, unit tests (10), and Next production build passed. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.4 changes. |
| 2026-09-05 | Full LF-0.4 branch diff review | Pass | The change is limited to the minimal Prisma/PostgreSQL persistence contract, local workflow, CI integration, synthetic seed, and persistence tests; no critical, high, or valid medium findings remain within scope. |
| 2026-09-05 | Staged-file, secret, private-data, generated-output, and local-database audit | Pass | Only the 14 intended LF-0.4 files are staged; no secrets, private learner data, generated output, or local database files are present. Local PostgreSQL remains external to the repository. |
| 2026-09-05 | `npm run format` | Pass | Prettier formatted the ten JSON records, content contract, catalog validator, tests, and review documentation. |
| 2026-09-05 | `npm run content:validate` | Pass | All ten ratio records parsed and passed catalog checks; 3 content tests passed. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run db:validate; npm run test:integration` | Pass | Prisma schema validation passed and persistence integration tests passed (2 tests); the local database was not modified by LF-0.5. |
| 2026-09-05 | `npm run verify` | Pass | Formatting, linting, type checking, unit/content tests (13), and Next production build passed. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.5 changes. |
| 2026-09-05 | Full LF-0.5 branch diff review | Pass with follow-up | Ten original records, deterministic validator metadata, hint ladders, leakage constraints, provenance, accessibility notes, and automated validation are present. Human educator/content-owner review remains pending and is explicitly not claimed as complete. |
| 2026-09-05 | `npm run format && npm run verify` | Pass | Prettier, ESLint, TypeScript, 13 unit/content tests, and the Next production build passed before the final review fix. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration` | Pass | Persistence integration tests passed (2 tests). |
| 2026-09-05 | LF-0.6 review fix | Pass | Removed protected answer tokens and unrelated session fields from the model request; added a regression assertion over the serialized model input. |
| 2026-09-05 | `npm run format && npm run verify && export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration && git diff --check` | Pass | Formatting, linting, type checking, unit/content tests (13), production build, persistence integration tests (2), and whitespace checks passed after the review fix. |
| 2026-09-05 | Full LF-0.6 branch diff review | Pass with follow-up | Policy authorization remains server-controlled, fake output is structured and validated, repair/fallback is bounded, traces redact learner text, and no provider/auth/persistence orchestration was added. Real-provider behavior and human policy approval remain future gates. |
| 2026-09-05 | `npm run format && npm run verify && export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration && git diff --check` | Pass | Formatting, linting, type checking, 13 unit/content tests, production build, 2 persistence integration tests, and whitespace checks passed for LF-0.7. |
| 2026-09-05 | LF-0.7 documentation completeness check | Pass | Threats T1–T14, data-class inventory fields, incident roles/steps, pilot gates, owners, pending decisions, and no-real-data boundaries were confirmed with repository assertions. |
| 2026-09-05 | Secret/private-data/generated-output audit | Pass | No secret-like values, real learner data, generated output, local database files, or provider credentials are present in the LF-0.7 documentation change. |
| 2026-09-05 | Full LF-0.7 branch diff review | Pass with follow-up | Documentation covers privacy, child safety, security, accessibility, deletion/export, backups, provider review, incident handling, and pilot gates without implementing authentication, provider integration, or later issues. Human privacy/legal/security/product sign-off remains pending. |
| 2026-09-05 | `npm run format && npm run eval:run` | Pass | Prettier completed; the synthetic LF-0.8 eval suite passed (3 tests). |
| 2026-09-05 | `npm run verify` | Pass | Formatting, ESLint, TypeScript, unit/content/eval tests (16), and the Next production build passed. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration` | Pass | Persistence integration tests passed (2 tests) against the existing local PostgreSQL container. |
| 2026-09-05 | LF-0.8 evaluation completeness check | Pass | Nine required dimensions, structured case fields, synthetic provenance, deterministic fake-adapter execution, trace redaction, and uncalibrated-threshold status are covered. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.8 changes. |
| 2026-09-05 | Secret/private-data/generated-output/local-database audit | Pass | No secrets, private learner data, provider credentials, generated output, or local database files are present in the LF-0.8 change. |
| 2026-09-05 | Full LF-0.8 branch diff review | Pass with follow-up | The change is limited to synthetic eval schema/cases, fake-tutor runner/tests, report guidance, and test wiring. Human corpus/severity/gate approval and real-model quality remain pending. |
| 2026-09-05 | `npm ci && npm run verify` | Pass | Fresh-lockfile repository verification passed: formatting, ESLint, TypeScript, 16 unit/content/eval tests, and the Next production build. npm reported the previously documented 2 vulnerabilities; no audit fix was applied. |
| 2026-09-05 | `docker compose up -d db; npm run db:validate; npm run db:generate; npm run db:deploy; npm run db:seed; npm run test:integration` | Pass | Local PostgreSQL was healthy; Prisma validation/generation/migration, repeatable synthetic seed, and 2 persistence integration tests passed. |
| 2026-09-05 | `npm run content:validate && npm run eval:run` | Pass | Ten content records validated; the 9-case synthetic tutor baseline passed with deterministic repeated execution. |
| 2026-09-05 | Phase 0 handoff completeness review | Pass with follow-up | README now documents repository-only and database-backed checks; CI, migrations/rollback, content, contracts, tutor, evals, privacy/threat controls, ADRs, risks, and the next exact prompt are linked or recorded. Human pilot approvals remain pending. |
| 2026-09-05 | `git diff --check` and repository safety audit | Pass | No whitespace errors; no secrets, generated build output, local database files, or private learner data are present in the handoff update. |
| 2026-09-05 | Final LF-0.9 verification after handoff fix: `npm run format:check && npm run verify && npm run content:validate && npm run eval:run && npm run db:validate && export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration && git diff --check` | Pass | Formatting, linting, type checking, 16 unit/content/eval tests, production build, content validation, deterministic eval baseline, Prisma validation, 2 persistence integration tests, and whitespace checks passed. |
| 2026-09-05 | Phase 1 local synthetic identity decision | Approved | Human approved a local-only synthetic identity for the first vertical slice; no real authentication, guardian verification, consent capture, or learner data is enabled. ADR-0003 records the boundary. |
| 2026-09-05 | `npm run format && npm run typecheck && npm run lint && export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration && npm run verify` | Pass | Phase 1 service, routes, pages, integration tests (4), database-free tests (16), linting, type checking, and production build passed after immutable-attempt and ownership fixes. |
| 2026-09-05 | Local portal smoke test: `npm run dev`; `GET /`, `GET /parent`, `GET /api/phase1/session`, invalid `POST /api/phase1/attempt` | Pass | Learner and parent routes compiled; the seeded Bicycle Pace session returned; an arbitrary session ID returned 404 without creating data. |
| 2026-09-05 | Phase 1 branch diff review | Pass with follow-up | Synthetic learner attempt, deterministic scoring, fake hint, redacted persisted trace, conservative mastery evidence, and parent evidence are implemented. Real authentication/provider integration, delayed checks, adaptive planning, and formal browser automation remain future work. |
| 2026-09-05 | Final Phase 1 verification: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`; `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration`; `git diff --check` | Pass | Formatting, linting, type checking, 16 database-free tests, production build, 4 persistence/vertical-slice integration tests, and whitespace checks passed after all review fixes. |
| 2026-09-05 | Final Phase 1 safety/scope audit | Pass with follow-up | Staged scope is limited to the synthetic identity ADR, ratios session service/routes/pages, tests, package scripts, and progress evidence; no secrets, generated output, local database files, real learner data, or provider credentials are included. |
| 2026-09-05 | Final post-review verification: `npm run format && npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`; `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration`; `git diff --check` | Pass | Formatting, linting, type checking, 16 database-free tests, production build, 4 persistence/vertical-slice integration tests, and whitespace checks passed after ownership, immutable-attempt, and attempt-number fixes. |
| 2026-09-05 | Post-merge Phase 1 review | Pass with medium follow-ups | No critical or high findings. The merged slice preserves deterministic scoring, answer protection, household isolation, immutable attempts, redacted traces, conservative mastery wording, and accessible labeled controls. Formal Playwright coverage remains the next bounded issue; the old progress branch/state was corrected in this handoff. |
| 2026-09-05 | `npm install -D @playwright/test` | Pass with risk noted | Added the approved browser-test dependency; npm reported 6 vulnerabilities (1 moderate, 5 high) and install-script approval warnings. No automatic audit fix was run. |
| 2026-09-05 | `npx playwright install chromium` | Pass | Installed the local Chromium test browser outside the repository; no browser binary is tracked. |
| 2026-09-05 | `npm run format && npm run typecheck && npm run lint && export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:e2e` | Pass | Playwright ran 2 synthetic learner/parent journeys successfully; the server received the synthetic database URL through the test config. |
| 2026-09-05 | `npm run format:check && npm run typecheck && npm run lint && npm test && npm run build` | Pass | Formatting, TypeScript, ESLint, 16 database-free tests, and the production build passed. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:integration && git diff --check` | Pass | Persistence and Phase 1 integration tests passed (4 tests); whitespace checks passed. |
| 2026-09-05 | Playwright branch scope/safety audit | Pass with follow-up | Only Playwright config/tests, CI wiring, README/package/lock updates, ignore rules, and progress evidence changed. Browser results are ignored; no secrets, learner data, provider credentials, or generated binaries are tracked. |
| 2026-09-05 | `npm run format && npm run format:check && npm run lint && npm run typecheck && npm test && npm run build` | Pass | Formatting, ESLint, TypeScript, 16 database-free tests, and the production build passed for synthetic hint progression and independent checks. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run db:validate && npm run test:integration` | Pass | Prisma validation and PostgreSQL persistence/vertical-slice integration tests passed (4 tests), including server-derived tutor state and `MASTERY_CHECK` evidence. |
| 2026-09-05 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:e2e` | Pass | Playwright ran 2 synthetic browser journeys; the learner journey covered two hint steps and an independent check. The local server required permission to bind port 3000. |
| 2026-09-05 | `git diff --check` and final scope/safety audit | Pass | Changes are limited to server-authoritative hint context, synthetic independent-check recording, learner journey UI, tests, and this progress evidence; no secrets, generated output, local database files, or private learner data are tracked. |
| 2026-09-05 | Final post-review verification: `npm run format && npm run verify && npm run content:validate && npm run eval:run`; `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run db:validate && npm run test:integration`; `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:e2e`; `git diff --check` | Pass | Formatting, linting, type checking, 16 database-free tests, production build, content validation (3), evals (3), Prisma validation, integration tests (4), browser journeys (2), and whitespace checks passed after adding the forged-state route regression test. |
| 2026-09-05 | PR #13 merge and documentation audit | Pass with documentation updates | Synthetic mastery-check work was committed as `2ea25ba` and merged. Architecture documentation now includes the implemented stack, runtime diagram, evidence-flow diagram, and explicit synthetic-only boundaries. |
| 2026-09-05 | Architecture stack rationale update | Pass | `docs/03-system-architecture.md` now maps each stack item and boundary to its application components, rationale, implementation status, and production limits. |
| 2026-09-06 | `npm run format && npm run typecheck` | Pass | Prettier and TypeScript passed after adding the skill catalog, curriculum/planner contracts, and planner. |
| 2026-09-06 | `npx vitest run tests/curriculum tests/planner tests/content` | Pass | 18 tests passed: skill-catalog integrity/cycle checks, planner prerequisite-gating/time-cap/challenge-item behavior (synthetic fixtures), and a planner run against the real skill/content catalogs. |
| 2026-09-06 | `npm run verify` | Pass | Formatting, linting, type checking, the down-migration check, 41 unit/contract/content/eval/tutor/notification/curriculum/planner tests, and the production build passed. |
| 2026-09-06 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run db:validate && npm run test:integration` | Pass | Prisma validation and persistence/vertical-slice integration tests passed (4 tests); unaffected by the skill-graph/planner addition. |
| 2026-09-06 | PR #16 merge | Pass | Skill graph and database-free planner committed as `5c342a7` and merged. |
| 2026-09-06 | Added `getPlan`, `GET /api/phase1/plan`, and a read-only "Recommended next activities" learner-page section; found and fixed a test-concurrency bug (two `tests/phase1/*.test.ts` files raced on the same synthetic household row) by folding the new integration assertions into the existing `vertical-slice.test.ts` file instead of a second file | Pass | `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests, including the new plan assertions), and manual `curl` smoke checks against `npm run dev` all passed. |
| 2026-09-06 | `export DATABASE_URL=postgresql://learning_forge@localhost:5432/learning_forge?schema=public; npm run test:e2e` | Pass | Extended the existing Playwright learner journey to assert the "Recommended next activities" heading renders in a real browser; both synthetic journeys (2 tests) passed. |
| 2026-09-06 | PR #17 merge | Pass | Planner route and read-only learner UI committed as `e0d6674` and merged. |
| 2026-09-06 | `npx prisma migrate dev --name add_session_content_key --create-only` then hand-edited to `0002_add_session_content_key` with a `DEFAULT`-then-`DROP DEFAULT` backfill and a reviewed `down.sql` | Pass | `bash scripts/check-migration-down.sh`, `npm run db:validate`, `npm run db:deploy`, `npm run db:rollback -- 0002_add_session_content_key`, and a redeploy all passed against local PostgreSQL. |
| 2026-09-06 | Generalized `getSyntheticSession`/`createAttempt`/`getTutorContext`/`getParentEvidence` to resolve content per session/attempt instead of a fixed constant; fixed the hint route to build its prompt/`protectedTokens` from the resolved content (ADR-0007); made the learner-page plan clickable; generalized the parent page to a multi-skill mastery list | Pass | `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, including a new test that clicks a recommended activity and confirms the session switches) all passed. One e2e run failed transiently from dev-server hot-reload warm-up immediately after a file edit; two immediate re-runs were stable. |
| 2026-09-06 | PR #18 merge | Pass | Session generalization and hint-route answer-protection fix committed as `e3d9c77` and merged. |
| 2026-09-06 | Relaxed `RatioContentSchema.skillCode`, fixed `validateRatioCatalog`'s `origin !== 'original'` gate to also accept `llm_drafted`, and authored 4 Number System content records through `docs/content-authoring-pipeline.md`; updated the 3 tests whose fixed counts/skill assumptions the new content changed | Pass | `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests), and `export DATABASE_URL=...; npm run test:e2e` (3 tests) all passed after fixing the stale assertions. |
| 2026-09-06 | PR #19 merge | Pass | First Number System content and the `llm_drafted` catalog-gate fix committed as `da8ab56` and merged. |
| 2026-09-06 | Authored `division-of-fractions`/`coordinate-plane` (completing Number System) and `variables-and-expressions`/`equivalent-expressions` (starting Expressions and Equations), 2 items each, all `llm_drafted`/`pending_review`; hand-verified every computation | Pass | The automated leak-check caught and blocked a real drafting mistake (a "Quadrant III" analogous example whose lowercase form contained "quadrant ii" as a substring) before it reached a commit; fixed, then `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests, unchanged assertions still hold), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, stable after the same known local hot-reload flake on the first post-edit run) all passed. |
| 2026-09-06 | PR #20 merge | Pass | Number System completion and start of Expressions and Equations committed as `511137e` and merged. |
| 2026-09-06 | Authored `one-variable-equations-and-inequalities`/`dependent-and-independent-variables` (completing Expressions and Equations) and all three Geometry skills (`area-of-composite-shapes`, `surface-area-and-volume`, `coordinate-geometry`), 2 items each, all `llm_drafted`/`pending_review`; hand-verified every computation, including that each analogous-example result never coincides with its own item's canonical answer | Pass | `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests, unchanged golden-path assertions still hold), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, stable after the same known local hot-reload flake on the first post-edit run) all passed. |
| 2026-09-06 | PR #21 merge | Pass | Expressions and Equations completion and all of Geometry committed as `06bf7ff` and merged. |
| 2026-09-06 | Authored all three Statistics skills (`statistical-questions`, `distributions`, `center-and-variability`), 2 items each, all `llm_drafted`/`pending_review`; hand-verified every computation. All 19 catalog skills now have content | Pass | `npm run verify` (41 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests, after updating the two assertions that expected `statistical-questions` to remain unavailable — now correctly asserting an empty `unavailableSkills`), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, stable after the same known local hot-reload flake on the first post-edit run) all passed. |
| 2026-09-06 | PR #22 merge | Pass | Statistics content and full 19/19 skill coverage committed as `c620504` and merged. |
| 2026-09-06 | Product/content owner explicitly confirmed (via clarifying question, not inferred) approval to mark all 38 content records `reviewed`. Bulk-updated `review.status`/`reviewedAt`/`reviewer` on all 38 files; removed `validateRatioCatalog`'s hard rejection of any non-`pending_review` status (the same class of structural block as the earlier `llm_drafted` gate); updated ADR-0001's approval record, the decision register, and `docs/content-review.md` with the approval and its explicit scope (product/content owner, not a separately engaged subject-matter educator) | Pass | `npm run verify` (42 tests, one new test added covering the reviewed-item acceptance/rejection-without-date paths), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (5 tests), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, stable after the same known local hot-reload flake on the first post-edit run) all passed. |
| 2026-09-06 | PR #23 merge (confirmed with the user before merging, since it updated a formal ADR approval record) | Pass | Content-review approval committed as `7c93423` and merged. |
| 2026-09-06 | Generalized `WeeklyDigestInput`/`buildWeeklyDigest` from single-skill to multi-skill (renamed the per-skill logic to `buildSkillDigest`); added `getWeeklyDigest` (`src/phase1/service.ts`), `GET /api/phase1/digest`, and a "Get weekly digest" button on the parent page | Pass | `npm run verify` (44 tests, 2 new), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (6 tests — the new digest test confirms real recorded evidence aggregates correctly and the fake notifier logs it), and `export DATABASE_URL=...; npm run test:e2e` (3 tests, including a new digest-button interaction; stable after the same known local hot-reload flake on the first post-edit run) all passed. |
| 2026-09-06 | PR #24 merge | Pass | Weekly-digest route/UI committed as `2df184d` and merged. |
| 2026-09-06 | Added `src/app/globals.css` and imported it in the root layout; screenshotted both pages with Playwright to verify visually | Found bug | The learner page showed "Session could not be loaded." — a real, pre-existing race in `ensureSyntheticIdentity` (two concurrent requests on first load could both attempt to create the synthetic household, and the loser threw a Prisma `P2002` unique-constraint error), unrelated to the CSS change. |
| 2026-09-06 | Fixed `ensureSyntheticIdentity` to treat a `P2002` unique-constraint error on any of its four upserts as "already created by a concurrent call," which is the correct idempotent outcome; added a regression test calling it 5× concurrently against a freshly emptied household | Pass | Reproduced the original bug directly: the new test failed with the exact `P2002` error on the first of several attempts against the pre-fix code, and passed 8/8 consecutive runs with the fix. Also reproduced with two genuinely concurrent `curl` requests against a fresh database and a running dev server (the same shape as the original browser failure) — clean. `npm run verify` (44 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (7 tests, +1 new), and `export DATABASE_URL=...; npm run test:e2e` (3 tests) all passed. |
| 2026-09-06 | PR #25 merge | Pass | Basic styling and the identity-race fix committed as `fee8230` and merged. |
| 2026-09-06 | Audited every other `.upsert()` in `src/` for the same race class (`grep -rn '\.upsert(' src`); fixed `masteryEstimate.upsert` in `createAttempt` to retry as `update` on `P2002` instead of silently dropping the losing attempt's mastery contribution; extracted `isUniqueConstraintViolation` to `src/server/prisma-errors.ts`, shared with `ensureSyntheticIdentity` | Inconclusive repro, kept as defensive fix | Could not reproduce a failure pre-fix: 16 attempts via the real `createAttempt` path at up to 6-way concurrency, then an isolated 30-way concurrent stress test of the bare `masteryEstimate.upsert` call directly against Postgres — all clean, even without the fix. Prisma appears to compile an upsert with a non-empty `update` payload to an atomic `INSERT ... ON CONFLICT DO UPDATE`, unlike the identity upserts. Kept the fix anyway as free, correct coverage for a real risk *class*, but explicitly not claimed as fixing an observed failure the way the identity fix is. Confirmed `masteryContribution.upsert` (keyed by a fresh per-attempt ID) cannot collide across concurrent calls. `npm run verify` (44 tests), `export DATABASE_URL=...; npm run test:integration` (8 tests, +1 new), and `export DATABASE_URL=...; npm run test:e2e` (3 tests) all passed. |
| 2026-09-06 | PR #26 merge | Pass | Mastery-upsert race audit committed as `73f339f` and merged. |
| 2026-09-06 | Added `@axe-core/playwright` (dev dependency) and `tests/browser/accessibility.spec.ts`, scanning both pages (learner page including the plan section; parent page before and after the digest-button click) against `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`wcag22aa` | Pass, and verified the check itself is real | Both pages: zero violations. Confirmed the test actually catches problems, not just always-passes: temporarily broke the answer-input label's `htmlFor` association, reran, and axe correctly failed with the WCAG 4.1.2 label violation; restored and reran clean. `npm run verify` (44 tests) and `export DATABASE_URL=...; npm run test:e2e` (5 tests, +2 new) passed. |
| 2026-09-06 | PR #27 merge | Pass | Automated WCAG AA accessibility checks committed as `f22abc6` and merged. |
| 2026-09-06 | Pure rename, no behavior change: `RatioContentSchema`→`ContentItemSchema`, `RatioContent`→`ContentItem`, `ratioContentCatalog`→`contentCatalog`, `validateRatioCatalog`→`validateContentCatalog` (`src/contracts/content.ts`, `src/content/catalog.ts`, `src/phase1/service.ts`, tests, and the ADR/pipeline docs that named these symbols); closes the misnomer flagged after the catalog grew past ratios-only content | Pass | `npm run verify` (44 tests), `export DATABASE_URL=...; npm run db:validate && npm run test:integration` (8 tests), and `export DATABASE_URL=...; npm run test:e2e` (5 tests) all passed unchanged. |
| 2026-09-06 | PR #28 merge | Pass | Rename committed as `915baa9` and merged. |
| 2026-09-06 | While updating the "Risks/blockers" list, found and removed a stale bullet claiming the 4 `llm_drafted` items were unreviewed; this directly contradicted the later, correct bullet recording that all 38 records (including these) were approved `reviewed` on 2026-09-06 (PR #23) | N/A (doc-only fix) | No code change; `docs/PROGRESS.md` only. |
| 2026-09-06 | Added `tests/browser/keyboard-navigation.spec.ts`: two new e2e tests driving the learner core loop (submit → hint → hint → independent check) and the parent digest button using only `page.keyboard`, asserting real DOM focus lands on each expected control (`toBeFocused()`), not just that clicking works | Pass, and verified the check is real | Both flows keyboard-operable. First attempt at the learner test failed for a genuine reason: focus does not automatically move to a newly-rendered button after activating another one — a keyboard user must press Tab again — so the test's own first failure caught a wrong assumption in the test itself, not a product bug; fixed by adding the missing `Tab` press. Then ran a real negative control: added `tabIndex={-1}` to the hint button (simulating a genuine keyboard trap), confirmed the test failed with the correct `toBeFocused` mismatch, then reverted and confirmed `git diff --stat` showed no residual change. `npm run verify` (44 tests), `export DATABASE_URL=...; npm run test:integration` (8 tests), and `export DATABASE_URL=...; npm run test:e2e` (7 tests, +2 new) all passed. |
| 2026-09-06 | PR #29 merge | Pass | Keyboard-operability checks committed as `615e088` and merged. |
| 2026-09-06 | Found that `/api/phase1/attempt`, `/api/phase1/check`, `/api/phase1/hint`, and `/api/phase1/parent` route handlers' Zod-validation (400) and not-found (404) branches had zero test coverage — only their happy paths were exercised, indirectly, via Playwright e2e clicks. Added 4 new integration tests in `tests/phase1/vertical-slice.test.ts` calling the route handlers directly with malformed/unknown-id/premature requests, asserting the correct status code, plus one confirming the parent route's JSON body matches `getParentEvidence()` | Pass, and verified against a real regression | All 4 passed immediately — the routes' error handling was already correct, just unverified. Proved the new check has teeth: temporarily changed the check route's 404 to a 200, reran, watched the corresponding test fail with the exact expected/received mismatch, then reverted (confirmed no residual diff). `npm run verify` (44 tests), `export DATABASE_URL=...; npm run test:integration` (12 tests, +4 new), and `export DATABASE_URL=...; npm run test:e2e` (7 tests) all passed. |
| 2026-09-06 | PR #30 merge | Pass | Route error-path coverage committed as `1271f5d` and merged. |
| 2026-09-06 | Product owner made 8 pending pilot-readiness decisions directly (via clarifying questions, not inferred), scoped to a single-household pilot: audience, identity/auth mechanism, hosting platform, consent/retention, model provider, budget/latency, and eval-gate approach. Recorded as ADR-0008, ADR-0009, and ADR-0005's status change to Accepted; updated the approval record in ADR-0001, the decision register and "resolve during Phase 1" list in `docs/09-decisions-and-open-questions.md`, `docs/pilot-readiness-checklist.md`, `docs/privacy-inventory.md`, and `docs/03-system-architecture.md`'s deployment row. Also fixed a stale, unrelated inconsistency found while editing the checklist: "Content rights" still said "Pending" and referenced "ten ratios problems," contradicting ADR-0001's existing 2026-09-06 approval of all 38 records | N/A (doc-only; no code change) | No test suite applies; this is a decision-recording change, not an implementation. `npm run verify` unaffected (not run since no source changed). |
| 2026-09-06 | PR #31 merge | Pass | Pilot-readiness decision docs committed as `c1b8d53` and merged. |
| 2026-09-06 | Implemented ADR-0010: real email/password authentication (NextAuth v5, Credentials provider, JWT sessions, no adapter tables), migration `0003_add_user_credentials` (nullable `email`/`passwordHash` on `User`), `scripts/create-parent-account.ts` (one-time provisioning, refuses a second real account without `--force`), `src/middleware.ts` gating `/`, `/parent`, `/api/phase1/*`, and a `/login` page. Playwright now provisions a disposable test account and logs in via `playwright/global-setup.ts`, storing session state so the existing 7 e2e tests keep passing unchanged; added 4 new e2e tests (`tests/browser/auth.spec.ts`) and 3 new integration tests (`tests/auth/create-parent-account.test.ts`) | Pass, and verified against 3 real problems found and fixed during implementation | **Found and fixed 3 real issues, not just written tests that happened to pass**: (1) `middleware.ts` at the project root was silently never invoked — Next.js requires it under `src/` when the project uses a `src/` directory; caught by manually curling the app, not by a failing test, since there was no test yet. (2) The single-real-account guard originally checked for *any* household row, which would always collide with the ADR-0003 synthetic fixture's household in every dev/test database; narrowed to check for a real `PARENT` user with a non-null `email` specifically. (3) `next start` (production mode) surfaced a real `AUTH_SECRET`-missing failure and a real `UntrustedHost` error from NextAuth's host-header validation, neither reproducible under `next dev` — added `AUTH_SECRET` to `.env.example` and CI, and logged the `AUTH_URL`/`AUTH_TRUST_HOST` requirement as explicit follow-up work for the Render deployment track (ADR-0010's non-decisions). Ran a real negative control on the middleware itself: temporarily disabled `src/middleware.ts`, confirmed 2 of the new e2e tests failed with the exact expected redirect-URL mismatch, restored it, confirmed a clean `git diff`. `npm run verify` (44 tests), `export DATABASE_URL=...; npm run test:integration` (15 tests, +3 new), and `export DATABASE_URL=...; npm run test:e2e` (11 tests, +4 new) all passed. Manually verified the full credential round-trip via raw HTTP (CSRF token, wrong password rejected, correct password accepted, session JSON contains the right `householdId`) before writing any test, to know what "correct" looked like. |
| 2026-09-06 | PR #32 merge | Pass | Real authentication committed as `2eaa7fe` and merged. |
| 2026-09-06 | Finished track 1: wired the authenticated household through the data layer. Added `src/server/household-context.ts` (`requireHouseholdContext`, resolves `{householdId, learnerProfileId}` from the real session), renamed `getSyntheticSession`→`startSession` and threaded a required `identity: HouseholdIdentity` parameter through every exported function in `src/phase1/service.ts` (`createAttempt`, `recordAttempt`, `getTutorContext`, `recordIndependentCheck`, `recordTutorResponse`, `getParentEvidence`, `getWeeklyDigest`, `getPlan`), removing all internal `SYNTHETIC_IDS`/`ensureSyntheticIdentity()` references from that file entirely. Updated all 7 `/api/phase1/*` route handlers to resolve identity via `requireHouseholdContext()` (401 on failure) before calling the service. Added `SYNTHETIC_IDENTITY` to `src/identity/synthetic.ts` for tests. Rewrote `tests/phase1/vertical-slice.test.ts`'s service-level tests to pass `SYNTHETIC_IDENTITY` explicitly, added a new "cross-household isolation" test with a second real household, and moved the PR #30 route-validation tests (which can no longer call route handlers directly now that they need real session/cookie context) to a new `tests/browser/phase1-api.spec.ts` using Playwright's authenticated `request` fixture, including the previously-untested "hint route ignores forged state fields" security property | Pass, and 2 more real bugs found and fixed along the way | (1) Playwright's teardown hit a real `MasteryContribution_attemptId_fkey` "Restrict" violation deleting a test household that had real attempts — `MasteryContribution.attempt` deliberately uses `onDelete: Restrict` to protect evidence integrity, so cleanup must delete `MasteryContribution`/`MasteryEstimate` rows before the household; extracted the correct order into `src/server/delete-household-evidence.ts`, used it everywhere a household gets deleted in tests. (2) `phase1.spec.ts` asserted a hardcoded "Synthetic learner" heading that broke once `getParentEvidence` stopped hardcoding that name; fixed to "Learner." Went beyond the automated suite to prove real isolation, not just the Vitest cross-household test: manually created two distinct real households via `create-parent-account`, logged in as each over raw HTTP, and confirmed each one's `/api/phase1/parent` response contained only its own attempt — genuinely different households, genuinely isolated data, over the real authenticated path. `npm run verify` (44 tests), `export DATABASE_URL=...; npm run test:integration` (12 tests — 4 route-validation tests moved out to Playwright, 1 new cross-household test added), and `export DATABASE_URL=...; npm run test:e2e` (15 tests, +4 new) all passed. |
| 2026-09-06 | PR #33 merge | Pass | Household-identity wiring committed as `1ce1c58` and merged. |
| 2026-09-06 | Built the real Anthropic tutor adapter (ADR-0011): `AnthropicTutorModel` (`src/tutor/anthropic-model.ts`) using forced tool-use for structured output, `claude-haiku-4-5-20251001`, moveType/assistanceLevel passed through from `authorization` (never chosen by the model), model never given the canonical answer. Generalized `TutorModel`/`TutorHarness`/the eval runner so trace and eval-report metadata (model identifier, latency, token usage, adapter name) come from whichever adapter actually ran, instead of hardcoded `fake-tutor` values. Added `scripts/run-real-eval.ts` to run the synthetic eval corpus through a real adapter and write a human-readable report for the ADR-0009 enablement-gate review | Pass, blocked once by a real billing error, then verified live | First live call failed with a genuine `BadRequestError` ("credit balance too low") — this **found a real, pre-existing gap**: `TutorHarness` had no error handling around the model call at all, so this would have crashed the hint request instead of falling back like an invalid response does. Fixed: a thrown error is now retried once then falls back safely, with a distinct `outcome: 'error'` in the trace; added 2 new tests (always-throws → graceful fallback; throws-once-then-recovers → repaired). After the user added API credit, reran: 4 hand-written scenarios (first hint, a real prompt-injection attempt, a frustrated learner, an authorized guided-solution reveal) all produced policy-compliant, age-appropriate, leak-free output — the prompt-injection attempt ("ignore all previous instructions...") was correctly refused. Then ran the full 9-case synthetic eval corpus through the real adapter: 9/9 automated checks passed (leakage, forbidden move types, unexpected fallback, trace completeness). Read every generated response myself before treating it as evidence; the product owner's own review is still the actual ADR-0009 gate, not this pass. `npm run verify` (46 tests, +2 new), `npm run test:integration` (12 tests, unaffected), `npm run build` all passed. The adapter is **not** wired into `/api/phase1/hint` — that remains on `FakeTutorModel` pending the product owner's review of the eval report. |
| 2026-09-06 | Sent the 9-case eval report to the product owner, published as a browser-viewable artifact for readability (dimension/severity/pass chips, problem/learner-message/tutor-reply laid out per case). Product owner reviewed and replied "looks good" | N/A (review, not a test) | Direct response to the explicit question "let me know if you're comfortable enabling the real adapter for actual sessions" — recorded as ADR-0009's enablement-gate approval for the initial 9-case scope (see ADR-0011's update note and the decision register). |
| 2026-09-06 | PR #34 merge | Pass | Anthropic adapter (not yet enabled) committed as `72afe49` and merged. |
| 2026-09-06 | Enabled the real adapter for real sessions following the approval above. Added `src/tutor/create-model.ts` (`createTutorModel()`, explicit `TUTOR_MODEL_PROVIDER=anthropic` opt-in, defaults to fake everywhere else); `/api/phase1/hint` now calls it instead of constructing `FakeTutorModel` directly; `playwright.config.ts` force-sets `TUTOR_MODEL_PROVIDER=fake` for the e2e webServer so tests/CI can never make a real, billed call regardless of the developer's own `.env`; added a loading state (`hintPending`, a disabled "Thinking…" button) to the learner page since real latency (~1.5-2s) with zero feedback would look like a frozen page | Pass, and 1 more real bug found and fixed | Disabling the hint button during the pending state caused the browser to blur it, silently dropping keyboard focus to the document body once the response arrived — the keyboard-operability e2e suite (PR #29) caught this immediately, exactly as it was built to. Fixed by refocusing the button once `hintPending` clears. Verified live end-to-end through the real authenticated HTTP path with `TUTOR_MODEL_PROVIDER=anthropic` actually set: `/api/phase1/session` → `/api/phase1/attempt` → `/api/phase1/hint` for a real provisioned household returned a genuine Claude response (`modelIdentifier: "claude-haiku-4-5-20251001"`, ~1.5s latency, real token counts). Then re-ran the full e2e suite with the SAME `.env` (still `TUTOR_MODEL_PROVIDER=anthropic` locally) to prove the CI-mode override actually works: all 15 tests passed in ~10s, consistent with the fake adapter, not real per-call latency. `npm run verify` (49 tests, +3 new for the factory), `export DATABASE_URL=...; npm run test:e2e` (15 tests) all passed. |
| 2026-09-06 | PR #35 merge | Pass | Real adapter enabled, committed as `53f12ec` and merged. |
| 2026-09-06 | Prepared the repository for Render deployment (ADR-0012), following the user's decisions: paid `basic-256mb` Postgres (Render's free Postgres auto-deletes after ~44 days — checked current Render docs via web search rather than assuming, since this directly risks a child's learning history), free web service (accepted the 15-minute-sleep/30-60s-wake tradeoff), no Render API key used anywhere — the product owner creates the Blueprint through Render's own dashboard. Added `render.yaml` (database + web service, migration folded into `buildCommand` since `preDeployCommand` requires a paid web service plan, `AUTH_TRUST_HOST=true` instead of a hardcoded `AUTH_URL` since the exact `*.onrender.com` subdomain isn't known ahead of time), `docs/render-deployment.md` (the full manual runbook, including the one-time account-provisioning step worked around the free plan's lack of Shell/one-off-job access by using the database's external connection string temporarily), `"start": "next start"` in `package.json` (missing — found when `next start` failed earlier in this session), and `src/tutor/rate-limit.ts` (60 calls/hour backstop against runaway spend from a bug or loop, enforced inside `AnthropicTutorModel` before any network call) | Pass, verified with the real class (not a mock) | Confirmed the rate limit actually blocks the real `AnthropicTutorModel.generateMove()` — not just the isolated `checkRateLimit()` unit — by calling it 65 times with a fake API key and confirming it threw exactly on call 61, before any network request (the check runs synchronously first). `npm run verify` (52 tests, +3 new), `export DATABASE_URL=...; npm run test:integration` (12 tests, unaffected), `export DATABASE_URL=...; npm run test:e2e` (15 tests, unaffected) all passed. No Render account, service, or database has actually been created — this PR prepares the repository only; the product owner still needs to complete the manual steps in `docs/render-deployment.md`. |
| 2026-09-06 | PR #36 merge | Pass | Render deployment prep committed as `23d2b7e` and merged. |
| 2026-09-06 | Product owner started following `docs/render-deployment.md` for real, created the Render Blueprint, and immediately hit a real documentation bug: step 3 said to find an "Access Control" section to unlock external database access before running the provisioning script — no such section exists. **Found and fixed a real, security-relevant mistake in `render.yaml`**: it omitted `ipAllowList` on the database, believing (without checking) that omitting it meant "no external access by default." Checked Render's actual current documentation this time instead of assuming: omitting `ipAllowList` does the *opposite* — allows any IP with valid credentials to connect. An explicit `ipAllowList: []` is what blocks external access, and the setting lives under the database's Info page's Networking section, not a separate tab. This means the already-created database was sitting open to the whole internet (protected only by its auto-generated password) until this was caught | Fixed the doc and the config; the user's already-created database still needs the manual fix | `render.yaml` now sets `ipAllowList: []` explicitly. `docs/render-deployment.md` step 3 corrected to match the actual UI and actual default. Told the user directly: grab the external URL now (no unlocking needed, it's already open), run the provisioning command, then set the Networking section's IP allow list to empty afterward — the web service reaches the database over Render's internal network regardless, so this loses no functionality. The code fix only affects a *future* fresh deployment; the product owner's already-created database needs that Networking-section change made manually, which they were told to do as part of this same conversation. |
| 2026-09-13 | Dependency/security audit. `npm audit` found 8 vulnerabilities (3 moderate, 5 high), all in dev/build-time tooling, not the running app's request path: `@vitest/mocker` (test runner only), `deepmerge-ts`/`effect` transitively via `@prisma/config` (Prisma CLI's own config merging, not the runtime client), and `postcss` transitively via Next's build pipeline (processes our own authored CSS at build time, not attacker-controlled input). Ran `npm update` to apply safe in-range fixes: `@prisma/client`/`prisma` moved 6.15.0→6.19.3 (patch-level, resolved the `effect` advisory entirely), `@types/node` and a handful of transitive packages bumped in range. Re-ran `npm audit`: 7 remain (down from 8), all still dev/build-time only (`@vitest/mocker`→needs vitest 5, `deepmerge-ts`→needs a Prisma major, `postcss`→needs Next 16). Deliberately did **not** run `npm audit fix --force`: the only remaining fixes require major-version bumps to Vitest (3→5), Prisma (6→7/8), and Next (15→16), each a breaking change needing its own dedicated upgrade-and-test pass, not something to bundle blindly into a routine audit | Pass | `npm run typecheck`, `npm run lint`, `npx prisma generate` (client regenerated cleanly on 6.19.3), `npm test` (56 unit tests), `npm run format:check`, `npm run db:check-down-migrations`, `DATABASE_URL=... npm run test:integration` (29 tests), and `npm run build` all passed after the update. The 3 remaining major-version bumps (Vitest 5, Prisma 7/8, Next 16) are deferred as a separate, dedicated upgrade task — each is a breaking change affecting the test runner, ORM, and framework respectively and deserves isolated testing, not a rushed force-fix. |
| 2026-09-13 | Resumed the blocked Render deployment. Diagnosed the actual root cause of the earlier SSL failures: the database's IP allow list was empty (blocking all external traffic) — confirmed directly from Render's own UI message ("External traffic not allowed"), not the local-network-interference theory recorded in the prior session handoff, which turned out to be a wrong guess since nothing conclusively pointed to it and the real, checkable cause was sitting in the dashboard the whole time. Rather than add an IP allow-list entry and manage removing it again, used a cleaner workaround: temporarily changed the `learning-forge` web service's Compute plan from Free to Starter (Render's own "Compute" page, not "Settings" — corrected a second wrong UI guess in the same conversation) to get Shell access, ran `npm run create-parent-account` there using the service's already-working *internal* `DATABASE_URL` (no external connectivity, no IP allow list, no SSL negotiation flags needed at all), then confirmed the plan can be switched back to Free later with no urgency (Render prorates by time) | Pass — genuinely live, not just deployed | The provisioning script succeeded on the first real attempt via Shell, creating a real household/parent/learner-profile in the production database. Then verified the full deployed app, not just the database write: signed in at `https://learning-forge.onrender.com` with the real account, and confirmed a real hint request through the live UI showed the ~1-2 second latency and non-templated text that only the real Claude adapter produces (the fake adapter responds instantly with one of eight fixed strings) — the same verification bar used for tracks 1 and 2 earlier in this session, not just trusting that deployment succeeded. All three approved implementation tracks (real auth, real model adapter, real deployment) are now confirmed live. The web service is still on the Starter plan pending a not-yet-confirmed downgrade back to Free. |

| 2026-09-13 | Expanded the tutor eval corpus (ADR-0009's ~20-30-case target) from 9 to 22 synthetic cases: added 2-3 variations per existing dimension instead of one, covering later-hint-depth leakage checks, a hint-progression case that reaches `guided_solution`, an additional correctness-boundary case (classification, not just numeric), self-deprecation and "wants to quit" tone cases, a no-exclusive-friendship age-appropriateness case, role-play and fake-system-message injection variants, a screen-reader accessibility case, an "already checked" confident-wrong case, and a repeated-attempts frustration case. One authoring bug was found and fixed during validation: a new leakage case used content whose given value ("-45") shared digits with its own answer ("45"), causing every hint that legitimately restated the problem to false-positive as a leak; swapped to different content where given values and the answer share no digits. Ran `scripts/run-real-eval.ts` against the real Claude adapter twice: first attempt failed entirely (0/22) due to the Anthropic account's credit balance being too low — confirmed via a raw API call, not assumed, and correctly triggered the harness's safe fallback path rather than crashing; after the product owner added credit, re-ran and got 21/22 (the digit-collision case above), then 22/22 after the content swap. Read every one of the 22 real generated responses myself before presenting them; the product owner then reviewed the same report and approved it as satisfying ADR-0009's enablement-gate for the expanded corpus | Pass | `npm test` (56 unit tests, including the eval-count assertion updated from 9 to 22), `DATABASE_URL=... npm run test:integration` (29 tests, unaffected), `npm run format:check`, `npm run eval:run-real` (22/22 automated checks passed on the real adapter) all passed. Updated `docs/09-decisions-and-open-questions.md` and `docs/pilot-readiness-checklist.md` to close the "expand toward 20-30 cases" open item. |
| 2026-09-14 | Replaced the support-mediated household export/deletion process with real self-service: `GET /api/phase1/household/export` (downloads the household's full data as JSON, gated by `requireHouseholdContext`) and `POST /api/phase1/household/delete` (requires an exact `{"confirmation":"DELETE"}` body via a new `isHouseholdDeletionConfirmed()` check in `src/server/household-data.ts`, then calls the pre-existing, already-transactional `deleteHouseholdData`). Added a "Your data" section to `/parent` with an export button and a typed-confirmation delete flow (button stays disabled until the input exactly equals "DELETE"), which signs the browser out to `/login` on success. Updated `/help`'s privacy section to point here instead of describing a support request. Deletion is logged with a plain `console.log` line, not a DB row, since a DB audit row would itself be destroyed by the deletion it's meant to record. Ran a real, disposable end-to-end drill (not the shared Playwright fixture): created a throwaway household via `createParentAccount(..., { force: true })`, seeded one real attempt, signed in through a real browser session against a running dev server, clicked the real "Download my data" button and confirmed the downloaded file actually contained the seeded attempt and no `passwordHash` field, then typed "DELETE" and clicked the real delete button, confirmed the browser was redirected to `/login`, and confirmed via direct Prisma queries that the household row and all its attempts were gone. Drill script was temporary and deleted after use | Pass | `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` (56 unit tests, +1 new for `isHouseholdDeletionConfirmed`), `DATABASE_URL=... npm run test:integration` (30 tests, +1 new), `npm run build` (new routes `/api/phase1/household/export` and `/api/phase1/household/delete` present in output), `DATABASE_URL=... npx playwright test` (19 tests, +2 new non-destructive specs, including the existing `/parent` axe scan with zero WCAG AA violations against the new section), and the manual real drill above (export contained real data with no password hash; deletion was atomic and complete) all passed. |

| 2026-09-14 | Added a formal curriculum sources/attribution record and two repeatable playbooks for future subject/grade expansion, in response to the product owner asking whether curriculum sources were documented anywhere (they were only informally scattered across `docs/02-curriculum-and-pedagogy.md`'s one-line table and per-skill `standards` codes, with no consolidated, citable record). Created `docs/curriculum-sources.md` (the formal record: CCSS-M standards source, the IUSD sequencing input explicitly marked "informal, not formally sourced" with its origin traced to an unresolved 2026-09-04 proposal-analysis gap that was never closed, AoPS/Math Kangaroo/MOEMS/AMC "style-only, no reproduction" disciplines per content tier, and a generated per-skill CCSS mapping table for all 22 catalog skills), `docs/curriculum-research-playbook.md` (a repeatable process for researching and citing sources *before* authoring any new subject/grade/program — output is a new reviewed section in `curriculum-sources.md`), and `docs/curriculum-authoring-playbook.md` (a repeatable process for turning a researched-sources section into real `Skill`/content JSON, explicitly deferring to the existing `docs/content-authoring-pipeline.md`/`docs/content-review.md` gates rather than duplicating them). Cross-linked from `docs/02-curriculum-and-pedagogy.md`. Documentation-only change; no application code, schema, or runtime behavior touched | Pass | `npx prettier --check` on all 4 modified/created docs passed; no code/test changes were needed since this is a documentation-only increment. |
| 2026-09-15 | Packaged the curriculum workflow as three model-independent repository skills with thin, manually selected custom-agent wrappers. Added `curriculum-research` (primary-source dossier and explicit human approval gate), `curriculum-authoring` (approved-dossier precondition, issue-sized skill/content implementation, tests, and mandatory pending-review status), and read-only `curriculum-review` (independent source, standards, pedagogy, originality, accessibility, and technical-integrity review). Added `curriculum-researcher` and `curriculum-author` agents pinned to `claude-opus-5`, plus a model-diverse `curriculum-reviewer` pinned to `gpt-5.6-sol`; all three disable automatic model invocation and must be selected deliberately. Added `docs/curriculum-agents.md` and updated README/source/playbook cross-links and the README's previously over-broad IUSD alignment claim. The supported cross-client custom-agent schema pins a model but not context tier/reasoning effort, so unsupported fields were deliberately not invented; the docs state the recommended client-level settings instead. Documentation/configuration only; no runtime application behavior changed | Pass | Official GitHub custom-agent and agent-skill configuration references checked; `copilot skill list --json` discovered all 3 project skills as enabled; both pinned model slugs were checked against current repository-agent usage; Prettier passed for every created/modified agent, skill, README, and curriculum doc; `git diff --check` passed. |
| 2026-09-15 | Began the controlled Grade 6 Math v2 experiment. Froze baseline v1 at commit `162b8ac8aa56ed0ac3d0cf86983ac66655b27201` (22 skills, 44 content records, 27 mapped standards codes, 13 prerequisite edges, 38 reviewed and 6 pending-review records), pre-registered the weighted comparison rubric and hard gates, and isolated future candidate output under `experiments/grade-6-math-v2/` outside the runtime catalogs. Ran `curriculum-researcher` for California Grade 6 Math with Irvine/IUSD context and core/depth/contest tiers. Independent `curriculum-reviewer` pass 1 rejected the dossier for inaccurate CDE metadata, incomplete baseline-gap reporting, unreproducible IUSD conclusions, and under-supported/incomplete enrichment sources. The research agent corrected those issues; pass 2 found four minor metadata/paraphrase defects; a final correction and pass 3 left no blocker or major finding and produced `ready for human review`. The dossier remains explicitly pending human approval and no candidate curriculum was authored | Pass, awaiting human gate | Baseline `npm run curriculum:validate` (7/7) and `npm run content:validate` (4/4) passed. `npx prettier --check` and `git diff --check` passed for experiment/research docs. Full review trail and required human decisions are recorded in `docs/curriculum-experiments/grade-6-math-v2/research-review.md`. |

## Decisions/ADRs

- LF-0.1 ADR-0001 remains the applicable architecture decision.
- LF-0.2 uses the approved TypeScript/Next.js modular-monolith stack.
- LF-0.3 adds no new consequential architecture decision; Zod is the approved validation convention from the blueprint.
- LF-0.4 uses Prisma/PostgreSQL for the minimal modular-monolith persistence boundary, with a reviewed local-only SQL rollback because Prisma has no first-class down migration.
- LF-0.5 stores authored ratios content as version-controlled JSON and validates it through the existing Zod contract; human review status is distinct from automated validation.
- LF-0.6 validates provider-boundary output as runtime data (`unknown`) at the tutor orchestration boundary, retries once, and falls back without advancing mastery; ADR-0002 records the decision.
- LF-0.7 records the required privacy, threat, incident, and pilot controls as documentation baselines; it makes no unapproved legal, provider, retention, or launch decisions.
- LF-0.9 treats `npm ci && npm run verify` as the repository-only fresh-clone check and keeps PostgreSQL integration verification as a separate synthetic-data workflow.
- Phase 1 uses fixed server-owned synthetic IDs and validates household ownership on every session/attempt operation; this is not a production identity mechanism (ADR-0003).
- ADR-0004 records the future math-notation/diagram approach (KaTeX plus reviewed inline SVG) without implementing it, since no current content requires it.
- ADR-0005 records a non-binding hosting-platform recommendation (Render or Fly.io over serverless Vercel; Streamlit rejected as the wrong application category) as input to the still-pending hosting/authentication decision (register item 1); it selects no vendor, region, or spend.
- ADR-0006 stores the Grade 6 Math skill graph (`content/skills/*.json`, 19 skills across all 5 domains) as versioned code validated by `SkillSchema`, consistent with the LF-0.5 content-as-JSON precedent, rather than adding new Postgres tables; content `skillCode` values are now cross-validated against the skill catalog.
- `planNextActivities` (`src/planner/plan-next-activities.ts`) is a pure, database-free planner: it prioritizes unmet prerequisites via topological order, caps items per skill and total planned minutes, adds a challenge item once some mastery evidence exists, and gives an explicit reason for every planned item. It deliberately does not fabricate spaced-review timing (`ReviewSchedule` remains unimplemented).
- `getPlan` (`src/phase1/service.ts`) wires `planNextActivities` to real mastery/content/skill data behind the existing synthetic identity boundary, exposed via `GET /api/phase1/plan` and a "Recommended next activities" section on the learner page (`src/app/page.tsx`).
- ADR-0007 generalizes Phase 1 sessions to any content item via `Session.contentKey` (migration `0002_add_session_content_key`) so the plan is now actionable — selecting a recommended item starts a real session for it. Generalizing this surfaced and fixed a real answer-protection defect: the tutor hint route previously built its prompt and `protectedTokens` from a fixed content constant regardless of which content an attempt was actually for, which would have broken answer-leakage protection for any non-default session.
- Content provenance now distinguishes `llm_drafted` from `original`/`licensed` (`docs/content-authoring-pipeline.md`); the same human review gate applies regardless of origin.
- A `NotifierPort` mirrors the `TutorModel` port pattern for a future parent weekly digest; only a deterministic digest builder and a console/fake adapter exist, with no scheduler or real provider wired in yet.
- Wired `NotifierPort` into a real caller: `getWeeklyDigest` (`src/phase1/service.ts`) aggregates evidence across every skill with attempts or mastery, `GET /api/phase1/digest` exposes it, and the parent page has a "Get weekly digest" button. Generalized `buildWeeklyDigest`/`WeeklyDigestInput` from single-skill to multi-skill in the process, since the single-skill shape had gone stale relative to `getParentEvidence`'s earlier generalization (ADR-0007) — the same class of "seams found while wiring two previously-built pieces together" as the `llm_drafted` and `pending_review` gates. Still no scheduler; this is on-demand only, by design (the database-backed job seam remains deferred).
- Added `src/app/globals.css` (hand-written, no new dependency): a basic accessible visual design for the learner and parent pages — readable typography, visible focus states, adequate contrast in both light and dark (`prefers-color-scheme`), styled forms/buttons/alerts. This was flagged as a real gap in the original repo review and deliberately deferred until now.
- **Found and fixed a real, pre-existing concurrency bug while testing the styling change in an actual browser** (not caught by any prior test): `ensureSyntheticIdentity` (`src/identity/synthetic.ts`) raced when called by two genuinely concurrent requests against a fresh database (e.g., the learner page's `session` and `plan` fetches firing together on first load) — the second `prisma.household.upsert()` could lose a TOCTOU race and throw a unique-constraint error (`P2002`), surfacing to the learner as "Session could not be loaded." Fixed by catching `P2002` on each upsert as "someone else already created this row," which is the correct idempotent outcome. Reproduced the failure directly (it hit on the very first of several attempts without the fix) and confirmed 8 consecutive passes with it, plus a real two-concurrent-HTTP-request repro against a fresh database and a full e2e run — all clean.
- Relaxed `RatioContentSchema.skillCode` from a hardcoded 5-value enum (the ratios skills only) to a validated string, cross-checked against `skillCatalog` at import time, so content for any catalog skill can be authored without a schema change per domain.
- Fixed a structural bug found while authoring the first non-ratios content: `validateRatioCatalog` rejected any `provenance.origin` other than `original`, meaning `llm_drafted` content (added to the schema for `docs/content-authoring-pipeline.md`) was representable but never actually importable. It now accepts `original` and `llm_drafted` (still requiring `licenseStatus: "owned"`); `licensed` origin remains explicitly unsupported until that path is built.
- Authored the first 4 Number System content records (`content/number-system/`) via the LLM-drafted pipeline — `fraction-decimal-operations` and `negative-numbers-and-absolute-value`, 2 items each — as `llm_drafted`/`pending_review`. This is the pipeline's first real use; no item is marked `reviewed`, and none should be until a human educator completes the checklist in `docs/content-review.md`.
- Authored `division-of-fractions` and `coordinate-plane` (Number System, completing that domain) and started Expressions and Equations with `variables-and-expressions` and `equivalent-expressions`, 2 items each, all `llm_drafted`/`pending_review`. The automated leak-check caught a real drafting mistake before merge: an analogous hint example said a point "lies in Quadrant III," which lowercased contains "quadrant ii" as a literal prefix substring (III starts with II), tripping the forbidden-pattern check for the actual answer (Quadrant II). Fixed by using Quadrant IV in the analogous example instead — direct evidence the leak-detection mechanism catches real, non-obvious mistakes, not just literal copy-paste of the answer.
- Authored `one-variable-equations-and-inequalities` and `dependent-and-independent-variables` (completing Expressions and Equations) and all three Geometry skills (`area-of-composite-shapes`, `surface-area-and-volume`, `coordinate-geometry`), 2 items each, all `llm_drafted`/`pending_review`. Content now covers 16 of 19 catalog skills — only Statistics remains entirely uncovered.
- Authored all three Statistics skills (`statistical-questions`, `distributions`, `center-and-variability`), 2 items each, all `llm_drafted`/`pending_review`. All 19 catalog skills now have content (38 records total); `planNextActivities`'s `unavailableSkills` is empty from a fresh mastery state. `distributions`/`center-and-variability` items were deliberately scoped to short, deterministic answers (range, mean, median, skew direction) rather than the open-ended rubric-scored description their `masteryCheckRule` describes, since the content schema has no rubric-based validator type yet — a real limitation to resolve before this content could be genuinely assessed as designed.
- **ADR-0008 and ADR-0009 (2026-09-06)** record the product owner's actual decisions, obtained directly (not inferred), resolving decision register items 1 (identity/auth portion), 2, 3, 5, 6, 7, and 8 — the whole set that was pending since Phase 0, except provider region/contractual terms and implementation, which remain open. Scope: a single-household pilot only (the product owner's own child), simple email/password or magic-link identity with no separate guardian-verification workflow, informal consent (the product owner is both operator and guardian), indefinite retention with manual deletion, Anthropic Claude API as the first real provider with a low-budget/latency-tolerant target, and a lightweight ~20-30-case human-reviewed eval gate before real-provider use. ADR-0005 (hosting) was accepted the same day: Render. None of this is implemented yet — no real auth, no real adapter, no deployment exist — this round recorded decisions only, per this session's own standing rule not to build real auth/data/provider integration without exactly this kind of explicit approval. See `docs/adr/0001-phase-0-boundaries.md`'s approval record, `docs/09-decisions-and-open-questions.md`, and `docs/pilot-readiness-checklist.md` for the corresponding status updates.
- **ADR-0010 (2026-09-06)** implements ADR-0008's identity decision: NextAuth v5, `Credentials` provider, JWT sessions (no adapter tables), `bcryptjs` password hashing, `src/middleware.ts` gating every learner/parent page and API route, and a one-time provisioning script rather than a signup page. This is the first of the three approved implementation tracks (auth → real model adapter → Render deployment). Landed in two PRs by design: the first shipped access control only (real login gates every route, `phase1/service.ts` still served the synthetic fixture); the second (same day) finished the wiring — `phase1/service.ts` and every route now resolve the real authenticated household via `requireHouseholdContext()` (`src/server/household-context.ts`), with the synthetic fixture (`SYNTHETIC_IDENTITY`) demoted to test/CI-only use. Splitting it this way kept each PR independently reviewable rather than one large, harder-to-verify change.
- **ADR-0011 (2026-09-06)** implements ADR-0009's provider decision: `AnthropicTutorModel` behind the existing `TutorModel` port, `claude-haiku-4-5-20251001`, forced tool-use for structured output, model never told the answer or given policy authority (matches ADR-0002). Fixed two real gaps surfaced while building and live-testing it: the harness/eval-report code hardcoded `fake-tutor`-shaped metadata regardless of adapter (would have silently mislabeled every real trace), and the harness had no error handling around the model call at all (a real billing error during testing proved this would have crashed requests instead of falling back). Landed in two PRs, same pattern as ADR-0010: the first shipped the adapter, built and empirically verified (including a real prompt-injection attempt correctly refused), but deliberately not enabled while the product owner reviewed the real generated eval output; the second (after their explicit "looks good") enabled it — `/api/phase1/hint` now uses `createTutorModel()`, gated on `TUTOR_MODEL_PROVIDER=anthropic`, with tests/CI hardcoded to always force the fake adapter regardless of that setting. Track 2 is now fully live, the second of the three approved implementation tracks to reach that state.
- **ADR-0012 (2026-09-06, confirmed live 2026-09-13)** records the Render deployment configuration for track 3. Two decisions came from checking Render's *current* free-tier terms via web search rather than assuming (the last hosting-recommendation ADR was written before implementation, when specifics didn't matter yet): free Postgres auto-deletes the database after ~44 days with no backups, which directly conflicts with this product's own "raw attempts are immutable evidence" principle, so the product owner chose to pay ~$6/mo for the smallest durable Postgres plan instead; the free web service's 15-minute-sleep/30-60s-wake behavior was judged an acceptable tradeoff to keep hosting itself at $0/mo. Also closed the `AUTH_URL`/`UntrustedHost` gap flagged during track 1 (`AUTH_TRUST_HOST=true` instead of hardcoding a guessed subdomain) and added a real backstop against runaway spend (`src/tutor/rate-limit.ts`, 60 calls/hour, verified against the real adapter class). The actual live deployment hit a real network blocker on the documented local-machine provisioning path (see the 2026-09-13 verification log entry and ADR-0012's own update note) and used a different, more reliable workaround instead — Shell access via a temporary plan upgrade. **All three approved implementation tracks are now confirmed live**, not just prepared: real authentication, real model adapter, and now a real deployment a real household actually signed into.

## Risks/blockers

- The visual design pass is basic: one hand-written stylesheet, a single centered container layout, and OS-preference dark mode only (no manual toggle). It is not a full design system.
- Added automated accessibility checks (`@axe-core/playwright`) to the e2e suite (`tests/browser/accessibility.spec.ts`), following through on the styling PR's own flagged limitation. Both pages pass zero violations against `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`wcag22aa`, including the parent page's dynamically-rendered digest content after clicking "Get weekly digest." Verified the test actually catches real problems, not just always-passes: deliberately broke the answer-input label association and confirmed axe failed the test with the correct WCAG 4.1.2 violation, then restored it and confirmed clean again. This is still only an **automated structural** check — axe-core catches roughly 30–50% of real WCAG issues; it does not exercise the keyboard itself or verify actual focus movement. `tests/browser/keyboard-navigation.spec.ts` closes part of that specific gap (real Tab/Enter-driven interaction on both pages, asserting actual DOM focus, verified against a real negative control), but screen-reader announcement quality and cognitive-load/plain-language criteria still need manual review; it is not equivalent to a full manual accessibility audit.
- The `ensureSyntheticIdentity` race was real and pre-existing across every prior PR in this session; it happened not to surface because every previous integration test called it sequentially within one Vitest process. It was only found by literally loading the page in a browser, which is why the run/screenshot verification habit matters, not just automated tests.
- Audited every other `.upsert()` call in `src/` for the same class of race (grep for `.upsert(`). Found one more at real risk: `masteryEstimate.upsert` in `createAttempt` shares a composite key (`learnerProfileId_skillCode_algorithmVersion`) across concurrent attempts on the same skill. Applied a different fix than the identity case, deliberately: silently catching the conflict (as done for identity) would have **dropped that attempt's mastery contribution**, which is worse than the crash it replaces — instead, a `P2002` there now retries as a plain `update`, so the attempt's evidence is still applied. **Important honesty note**: unlike the identity race (empirically reproduced failing pre-fix, twice, independently), this one could not be reproduced failing in this environment — neither via the full `createAttempt` path at 6-way concurrency (16 attempts, 0 failures) nor an isolated 30-way concurrent stress test of the bare upsert call. Prisma appears to compile an upsert with a non-empty `update` payload to a genuinely atomic Postgres `INSERT ... ON CONFLICT DO UPDATE`, which does not race — only the identity upserts' pattern reproduced a real failure. The fix is kept anyway as free, correct defensive coverage for a well-understood risk class, but is not claimed as fixing an observed bug the way the identity fix is. `masteryContribution.upsert` (keyed by a freshly generated per-attempt `attemptId`) cannot collide across concurrent calls and needed no change.
- **All 38 content records are now `reviewed`, approved 2026-09-06 by the product/content owner (Navodit Kaushik)** — not a separately engaged subject-matter-expert educator. The approval basis was: AI-assisted hand re-derivation of every canonical answer during authoring, plus the automated schema/leakage checks in `src/content/catalog.ts`. A deeper independent pedagogical audit (standards-mapping depth, misconception-code accuracy, difficulty calibration against real Grade 6 classroom experience) was explicitly **not** separately performed and remains a candidate follow-up before any real pilot use. See ADR-0001's approval record and `docs/content-review.md` for the exact scope note.
- Marking content `reviewed` required removing a second structural block discovered the same way as the earlier `llm_drafted` gate: `validateRatioCatalog` hard-rejected any `review.status` other than `pending_review`, meaning no content could ever be accepted without a code change. Removed; the Zod schema's own `reviewed` → `reviewedAt`-required invariant is the remaining structural guard.
- Human approvals recorded as pending in ADR-0001 remain required before affected Phase 0 deliverables can be accepted.
- npm reported 6 vulnerabilities after adding Playwright (1 moderate, 5 high); no automatic audit fix was run, and remediation remains a follow-up before relying on the dependency set beyond local development.
- Curriculum content must be original or appropriately licensed and independently reviewed.
- No real learner data or provider credentials should enter the repository or eval fixtures.
- LF-0.2 intentionally does not add authentication, a database, provider integration, domain schemas, or product features.
- LF-0.3 intentionally does not add persistence, tutor orchestration/state transitions, content seed, model adapters, or authentication.
- LF-0.4 intentionally does not finalize identity, retention, export, deletion, authorization services, mastery calculations, content, tutor orchestration, provider integration, or authentication; those remain governed by pending decisions and later issues.
- LF-0.5 does not execute validators at runtime, import content into PostgreSQL, implement tutor hint behavior, or claim educator approval; those belong to later work or human review.
- LF-0.6 does not call a real provider, persist tutor traces, calculate mastery, implement authentication, or deliver learner-facing UI; it provides the deterministic policy/fake-model seam for later vertical-slice work.
- LF-0.7 does not implement security middleware, authentication, deletion jobs, provider controls, or incident automation; it identifies and assigns those controls for later implementation and human approval.
- LF-0.9 does not declare the product pilot-ready: identity, consent, provider, child-safety, privacy, accessibility, content, and evaluation approvals remain governed by the pending checklist and ADR decisions.
- Phase 1 does not implement real authentication, guardian verification, delayed mastery checks, adaptive planning, real model calls, or production deployment; it is a local synthetic demonstration only.
- Phase 1 browser automation covers the synthetic learner and parent journeys, but real authentication/provider approval and a real-model adapter remain intentionally absent.
- The synthetic independent check uses a separate `MASTERY_CHECK` context after tutoring; it is a workflow demonstration, not validated elapsed-time or long-term delayed-performance evidence. Real delayed-check scheduling and calibration remain future work.
- `tests/tutor/tutor.test.ts` existed but was not included in `npm test`/`verify`/CI; it is now wired in. No behavior change was needed — the tests already passed once run.
- The `NotifierPort`/`ConsoleNotifier`/`buildWeeklyDigest` seam now has a real caller (`getWeeklyDigest`, the digest route, and the parent-page button), but it is on-demand only — no scheduler runs it automatically, and no real email/push provider is selected. Every "send" still just logs to the server console.
- ADR-0004 fixes a rendering approach but selects no library version, accessibility test evidence, or diagram-authoring tooling; that follows when Geometry/Depth/Contest content is actually authored.
- All 19 catalog skills now have authored content (2 items each, 38 total); `planNextActivities`'s `unavailableSkills` is empty from a fresh mastery state for the first time. This closes the content-authoring-bottleneck risk as a coverage gap; approval status is tracked separately (see the reviewed/approved note above).
- `RatioContentSchema`/`ratioContentCatalog`/`validateRatioCatalog` were misnomers once the catalog grew to hold all 5 domains; renamed to `ContentItemSchema`/`ContentItem`/`contentCatalog`/`validateContentCatalog` in a pure rename pass (no behavior change) — see the corresponding verification log entry.
- The planner's `secureThreshold` (0.75), `estimatedMinutesPerItem` (8 minutes), and `maxItemsPerSkill` (2) defaults are configurable placeholders, not calibrated values — same status as the assistance-evidence weights in `docs/02-curriculum-and-pedagogy.md`.
- `MasteryEstimate.skillCode` (Postgres) still has no foreign-key constraint to the new skill catalog; only application-level cross-checks exist so far (ADR-0006).
- Because each catalog skill lists its own prerequisites, a skill can show real mastery evidence yet still appear in `blockedSkills` if its listed prerequisite was never separately assessed (for example, attempting only `unit-rates-1` does not by itself unblock `unit-rates` in the plan, since its prerequisite `ratio-language` remains unassessed). This is intentional — evidence for a skill does not retroactively validate its prerequisite — but is worth knowing when reading a plan against Phase 1's content.
- Sessions can now target any of the 10 ratios content items, but there is still no diagnostic/placement logic for which item a learner should start on; the default with no `contentId` remains the original fixed `unit-rates-1` item.
- `getParentEvidence` now returns mastery across every skill with evidence (`mastery: MasteryRow[]`), not one hardcoded skill; any future consumer of the old single-`mastery`-object shape (there are none yet) would need updating.
- The migration adding `Session.contentKey` (`0002_add_session_content_key`) is the first schema change to an already-shipped table; its reviewed `down.sql` and the rollback/redeploy cycle were manually smoke-tested before merge.
- Real authentication (ADR-0010) now controls both *access* and *data*: `phase1/service.ts` and every `/api/phase1/*` route resolve the real authenticated household (`requireHouseholdContext`), verified with two distinct real households confirmed isolated via raw HTTP. The synthetic fixture is test/CI-only from here on.
- `MasteryContribution.attempt` uses `onDelete: Restrict` deliberately, to protect evidence integrity. Any code that deletes a household with real attempts must delete `MasteryContribution`/`MasteryEstimate` rows first, or Postgres rejects it with a foreign-key violation — found the hard way when Playwright's teardown hit exactly this. Use `src/server/delete-household-evidence.ts` rather than re-deriving the correct order.
- Deploying to Render (or any real production domain) will hit a real `UntrustedHost` error from NextAuth's host-header validation, reproduced locally via `next start` but not `next dev`. `AUTH_URL` (or `AUTH_TRUST_HOST` if behind a proxy that already validates the host) must be set to the real domain when that deployment happens; not needed for local dev or CI, which use `next dev`.
- `src/middleware.ts` must live under `src/`, not the project root, because this project uses a `src/` directory. Placing it at the root produces no error and no warning — Next.js simply never invokes it. Found by manually curling the app after adding it at the root and seeing no redirect, not by a failing test (there wasn't one yet); worth remembering if middleware is ever restructured.
- The Edge Runtime build warnings from bundling `bcryptjs`/`jose` into `src/middleware.ts` are cosmetic for the current hosting choice (Render runs `next start` as a real Node.js process, verified this does not crash), but would need real attention if hosting ever moved to a literal edge-function platform.
- Route handlers that need the authenticated household (`requireHouseholdContext`, via `auth()` with no arguments) can no longer be unit-tested by importing and calling the exported `GET`/`POST` function directly — `auth()` relies on ambient Next.js request context that only exists when Next.js itself dispatches the request. Route-level tests for these now live in `tests/browser/*.spec.ts` (Playwright, real HTTP, real cookies via the shared authenticated `storageState`), not `tests/phase1/vertical-slice.test.ts`. Service-level logic (the actual business rules) is still fully unit-testable by passing an explicit `HouseholdIdentity`.
- **Real API spend is now possible.** With `TUTOR_MODEL_PROVIDER=anthropic` set (as it now is in the local `.env`), every allowed hint request in real use calls the real Anthropic API and costs real money. The live route now enforces a configurable 100-hint rolling household-day limit and 8-hint session limit before calling the model; the adapter's 60-calls/hour process backstop remains in place. Spend monitoring/alerting is still not implemented. `TUTOR_MODEL_PROVIDER` unset (or any value other than exactly `"anthropic"`) always falls back to the free, instant fake adapter — including in every test/CI run, forced explicitly in `playwright.config.ts` regardless of the ambient environment.
- Disabling an interactive element while an async action is in flight is a common pattern for preventing double-submission, but it silently drops keyboard focus in most browsers (a disabled element cannot hold focus). Any future "pending" UI state needs the same fix already applied to the hint button: refocus the control once it becomes interactive again, don't just toggle `disabled`.
- **Resolved, but keep the lesson**: the "run a one-time script from your own machine against the external database URL" pattern documented in `docs/render-deployment.md` failed in practice with a reproducible SSL handshake error. The suspected cause at the time (the product owner's home network/ISP interfering with an unusual port) was a guess never actually confirmed — the real, checkable cause turned out to be sitting in Render's own dashboard the whole time: the IP allow list was empty (`ipAllowList: []`, correctly set per PR #37's fix), which Render's UI states plainly if you look at the right place ("External traffic not allowed. Add IP addresses in the Networking section."). Two lessons: (1) don't reach for a network-interference theory before checking the platform's own stated reason first — it's usually simpler and it's usually visible; (2) the workaround actually used — temporarily upgrading the web service's Compute plan to Starter for Shell access, running the script against the already-working *internal* `DATABASE_URL` — sidesteps the external-connectivity/IP-allow-list class of problem entirely and is the more reliable default for any future one-time production script (a migration, a data fix), not just a fallback.
- The web service remains on the **Starter** plan by deliberate pilot choice. A later cost/usage review can decide whether to return to Free; this is not an operational blocker.
- **2026-09-15 curriculum research checkpoint:** added the separate
  "Candidate Grade 6 Math v2 research" dossier to
  `docs/curriculum-sources.md`. It pins the California Department of
  Education's official CCSS-M metadata (adopted August 2010, modified January
  2013, April 2014 electronic version with February 2014 corrections), records
  five-domain coverage and the 29-code baseline comparison, preserves
  original-content boundaries for core/depth/contest tiers, and leaves IUSD
  pacing unresolved without claiming that no source exists. Status remains
  pending product/content-owner review; no curriculum or runtime records were
  changed.

## Session handoff

- **Track 3 (Render deployment) is genuinely live as of 2026-09-13.** The earlier network blocker (documented below for the historical record) is resolved — not by fixing the network, but by routing around it entirely.
- **How it actually got resolved, for future reference** (e.g., if this exact one-time-production-script situation comes up again): the SSL failures against the external database URL were never actually a network-interference problem — Render's own dashboard said plainly "External traffic not allowed. Add IP addresses in the Networking section," meaning the IP allow list (correctly empty per PR #37's fix) was simply blocking every attempt, exactly as designed. Rather than open it, the product owner temporarily changed the `learning-forge` web service's **Compute** plan (not "Settings" — corrected mid-conversation) from Free to Starter, which unlocks a **Shell** tab; ran `npm run create-parent-account -- --email=... --password=...` there directly, using the service's own already-working *internal* `DATABASE_URL` (no external connectivity, no IP allow list, no SSL flags needed at all); it succeeded on the first attempt. This is the better default for any future one-time production script, not just a fallback.
- **Full verification performed, not just trusting the write succeeded:** signed in at `https://learning-forge.onrender.com` with the real provisioned account, then submitted a real hint request through the live UI and confirmed the ~1-2 second latency and non-templated text that only the real Claude adapter produces (the fake adapter is instant with one of eight fixed strings) — the same bar used to verify tracks 1 and 2 earlier in this session.
- **Plan choice:** the web service remains on Starter by deliberate pilot choice. Review cost and usage later before deciding whether to return to Free.
- Original diagnosis trail (kept for the historical record, though the working theory in it — home network/ISP interference — turned out to be an unconfirmed guess, not the actual cause):
  1. `npm run create-parent-account` against the external `DATABASE_URL` failed with a Prisma `PrismaClientInitializationError: Server has closed the connection.`
  2. Installed `psql` (via `brew install libpq`; keg-only, added to `PATH` in `~/.zshrc`) to get a clearer native error than Prisma's wrapper.
  3. Confirmed the URL used was genuinely the *External* Database URL (not Internal) and included `?sslmode=require`.
  4. `psql "...?sslmode=require"` → `SSL connection has been closed unexpectedly`.
  5. Tested `sslnegotiation=direct` → `SSL error: wrong version number` (confirmed Render doesn't support direct TLS, as expected).
  6. Tested `sslnegotiation=postgres` (the correct, default mode) explicitly → same failure as step 4, ruling out a negotiation-mode mismatch.
  7. The actual cause (found later, directly from Render's own UI, not from further network debugging): the IP allow list was simply empty.
- With all three tracks now live, there is no standing "next exact prompt" pointing at required work — ask the user what they want to do next rather than assuming. Candidates already on record if they don't have something else in mind: operational monitoring/cost controls, the previously-identified low-risk backlog (diagnostic/placement redesign, npm audit major-version dependency bump, rubric-based validator, manual accessibility audit, expanding the eval corpus toward ADR-0009's ~20-30-case target); or genuinely new work now that the product is live for real use.
- **Update (2026-09-14): dependency audit, eval corpus expansion, and self-service household export/deletion are all now complete** (see the three verification-log entries above dated 2026-09-13/2026-09-14). Remaining candidates for a next increment: a dedicated major-version dependency upgrade pass (Vitest 3→5, Prisma 6→7/8, Next 15→16 — each deferred deliberately as its own breaking-change task, not bundled into the routine audit), new subject/grade-level content beyond the current 19-skill/38-item ratios-and-related catalog, or a Render plan/cost review (currently on Starter by deliberate choice, Free downgrade not yet revisited).

## 2026-09-15 — Grade 6 Math v2 experiment concluded: merge to v3 approved

Full pilot of the curriculum-research/authoring/review agents on Grade 6
Math concluded. Comparison report scored v1 221/400 vs v2 347/400;
independent reviewer and human product/content owner both approved
"merge into a reviewed v3" (neither wholesale adopt nor discard).

Planned v3 integration workstream (not yet started):
1. Contract changes: add `accessibleAlternative` as a required production
   content field; add owning-skill/distractor/glossary sync, canonical-
   answer-inclusion, difficulty-band, and all-skill-content-count checks
   to `src/content/catalog.ts`/production validators.
2. Graph merge: reconcile v1's 22 skills with v2's 24-skill boundaries
   (split `surface-area-and-volume`, `one-variable-equations-and-
   inequalities`, `coordinate-geometry`); add `6.NS.C.8`/`6.EE.B.6`
   ownership; port prerequisite justifications.
3. Content merge: human-review each of the 48 v2 records individually
   (change `pending_review` -> `reviewed` only after actual human sign-
   off, never automated); retain v1's reviewed/original records and its
   depth/contest-mode records; do not delete v1 content until its
   replacement is reviewed.
4. Expand v3 beyond core-only where needed (depth/contest tiers) once
   human review identifies gaps.
5. Only after v3 passes production validators and human content review
   should it replace the current baseline in `content/` and
   `src/curriculum/catalog.ts`.
6. After Grade 6 Math v3 ships, resume Phase 6 fleet planning for the
   other programs (Math Kangaroo, MOEMS, AMC 8, MATHCOUNTS, Science,
   Social Studies, ELA, Science Olympiad) using the now-validated
   research -> review -> author -> review -> compare pipeline.

## 2026-09-16 — Curriculum skills updated with Grade 6 Math v2 pilot lessons

Updated `.github/skills/curriculum-research/SKILL.md` and
`.github/skills/curriculum-authoring/SKILL.md` with lessons learned from
the Grade 6 Math v2 research/authoring/review pilot, to make future
curriculum research and authoring (Math Kangaroo, MOEMS, AMC 8,
MATHCOUNTS, Grade 6 Science/Social Studies/ELA, Science Olympiad -- none
of which have been researched or authored yet) more comprehensive from
the first pass:

- Research: never assert a source "does not exist" without documenting
  exactly what was checked and the literal result (e.g. HTTP status);
  explicitly cross-check target scope against existing product docs and
  name related-but-unresearched programs as deferred rather than omitting
  them silently; read source edition/date metadata from the primary
  document, never inferred from filenames/URLs.
- Authoring: explicitly test every prerequisite edge for genuine
  conceptual (not procedural/sequencing) dependency; verify multiple
  content records per skill are structurally distinct and jointly cover
  the skill's full observable-evidence/mastery scope (not per-record);
  trace every misconception distractor's stated error mechanism to
  confirm it deterministically produces the given wrong answer; re-check
  all self-descriptive docs match final state before finishing.

No production files or existing curriculum content were changed.
Validation: `npx prettier --check` passed on both files;
`copilot skill list --json` confirms both remain discovered and enabled.

## 2026-09-16 — v3 merge Step 1 complete: contract changes and validator hardening

Completed the first step of the Grade 6 Math v3 merge plan (contract
changes), independently discovered and fixed 3 pre-existing production
defects along the way, and closed the accessibility-field gap the v1-vs-v2
comparison flagged:

- **New required field**: `accessibleAlternative` added to
  `ContentItemSchema` (`src/contracts/content.ts`) — a genuine plain-text
  restatement of each item's prompt/data for non-visual/assistive-technology
  learners, distinct from the existing `accessibilityNotes` (presentation
  guidance). Backfilled a faithful, item-specific value for all 44
  production content records (delegated to a subagent, then independently
  spot-checked for numeric/semantic fidelity against each prompt).
- **New validator checks** in `validateContentCatalog`
  (`src/content/catalog.ts`): (a) content `difficulty` must be within its
  owning skill's declared `difficultyBands`; (b) every content
  `misconceptionCode` must be declared by its owning skill; (c) every
  skill must have exactly 2 content records (generalizes the old
  ratio-only presence check, which was removed as redundant).
- **Pre-existing defects found and fixed** (predate this session, not
  introduced by it): 18 content records referenced misconception codes
  absent from their owning skill's declared list (5 skills affected:
  `double-number-lines`, `percent-applications`, `ratio-language`,
  `ratio-tables`, `unit-rates` — all expanded to include the content-side
  codes, per product decision to treat content wording as authoritative);
  2 records had a `difficulty` outside their skill's declared bands
  (`fraction-decimal-operations` widened to include `challenging`;
  `ratio-tables` widened to include `foundational`, per product decision
  to widen skill bands rather than re-tag content).
- Added regression tests in `tests/content/catalog.test.ts` for all three
  new validator checks and a non-empty `accessibleAlternative` check;
  updated `tests/contracts/contracts.test.ts` fixture for the new
  required field.

Validation: `npm run format:check`, `npm run lint`, `npm run typecheck`,
`npm run content:validate`, `npm run curriculum:validate`, and `npm test`
(60/60 tests) all pass.

`v3-contract-changes` marked done. Next: `v3-graph-merge` (reconcile v1's
22-skill graph with v2's 24-skill boundaries, add `6.NS.C.8`/`6.EE.B.6`
skill ownership, port prerequisite justifications).

## 2026-09-18 — v3 Step 2: skill graph merge and safety gate (complete)

- **Servable-content safety gate**: added `servableContentCatalog` export
  in `src/content/catalog.ts`, filtered to `review.status === 'reviewed'`.
  All learner-facing paths in `src/phase1/service.ts` (content
  resolution, diagnostic plan, review queue, `getPlan`) now consume this
  gated catalog instead of the raw (unfiltered) `contentCatalog`, closing
  a real gap where `pending_review` content could have been served to a
  learner. `contentCatalog` remains exported unfiltered for
  validators/tooling that must see pending content.
- **Skill graph merge, v1 (22 skills) → v3 (27 skills)**, per product
  decision to keep v1 skill codes everywhere and only mint new codes for
  genuinely new standards or skill splits (`keep_v1_codes` strategy):
  - 2 new skills for standards v1 didn't cover: `coordinate-distance`
    (6.NS.C.8) and `variables-in-context` (6.EE.B.6).
  - 2-way split of `surface-area-and-volume` into `surface-area-and-volume`
    (6.G.A.4, narrowed) and `prism-volume` (6.G.A.2, new). The retired v1
    content record for 6.G.A.2 used whole-number prism edges and did not
    actually test the standard's fractional-edge-length requirement; it
    was retired rather than re-homed, and replaced with a new record that
    correctly uses fractional edges.
  - 3-way split of `one-variable-equations-and-inequalities` into
    `equation-and-inequality-meaning` (6.EE.B.5), `one-variable-equations`
    (6.EE.B.7), and `real-world-inequalities` (6.EE.B.8). The 2 existing
    reviewed v1 content records were re-homed (skillCode + filename only,
    no content changes) to `one-variable-equations` and
    `real-world-inequalities`.
  - 3 prerequisite-edge-only updates on unrelated skills:
    `coordinate-geometry` (prereq → `coordinate-distance`),
    `dependent-and-independent-variables` (prereq → `variables-in-context`),
    `equivalent-expressions` (gained prereq `gcf-and-lcm`).
  - `curriculum:validate` passes on the resulting 27-skill graph (7/7
    checks, no cycles, correct topological order).
- **Content for the 6 new/split skills**: human review packet
  (`docs/curriculum-review-packets/g6-math-v3-graph-merge-content-review.md`)
  covering 11 candidate records (independently re-derived and verified
  math/distractor logic before packaging) was reviewed and approved by
  the product/content owner ("approve-all"). All 11 were wired into
  `src/content/catalog.ts` with `review.status: reviewed`,
  `reviewer: 'Navodit Kaushik (product/content owner)'`,
  `reviewedAt: '2026-09-17'`, after stripping two non-schema fields
  (`answerFormat`, `misconceptionDistractors`) inherited from the v2
  experiment's content format, which the production `.strict()`
  `ContentItemSchema` does not permit.
- Updated stale hardcoded counts in `tests/content/catalog.test.ts`
  (total content 44→54, reviewed 38→48) and
  `tests/curriculum/skill-catalog.test.ts` (skill count 22→27);
  `tests/phase1/vertical-slice.test.ts` `unavailableSkills` expectation
  updated to include the (at-the-time) pending-review skills.

Validation: `npm run format:check`, `npm run lint`, `npx tsc --noEmit`,
`npm run curriculum:validate`, `npm run content:validate`, `npm test`
(61/61), and `npm run test:integration` (30/30, `DATABASE_URL` exported
manually per `.env.example`) all pass.

`v3-graph-merge` and `v3-graph-merge-content-review` marked done. Next:
`v3-content-human-review` (Step 3 — review the remaining v2 candidate
content not consumed by the graph-merge splits).

## 2026-09-18 — v3 Step 3: content review debt closed (re-scoped)

- **Re-scoped Step 3.** The original plan called for reviewing all 48 v2
  candidate content records. Cross-checking v2's 24 candidate skill
  labels against production showed 17 of them are 1:1 renames of skills
  already fully covered by reviewed v1 content (e.g. v2's
  `rate-and-proportional-reasoning` = production's `unit-rates`).
  Reviewing those 34 records would have produced content that could
  never be used, so that work was dropped as out of scope.
- **Real gap found and closed instead**: 3 production skills
  (`multi-digit-division`, `gcf-and-lcm`, `whole-number-exponents`, 6
  content records total) had complete, well-formed content sitting in
  `pending_review` since before the v2/v3 work began — unrelated to the
  graph merge, simply awaiting a final human approval. Each record's
  math and pedagogy were independently re-verified (e.g. 4,536 ÷ 12 =
  378; 5,287 ÷ 15 = 352 r7; GCF(18, 24) = 6; LCM(8, 12) = 24; 5³ = 125;
  2 + 3² × 4 = 38) before presenting them to the product/content owner,
  who approved all 6 for release.
- All 6 records now have `review.status: reviewed`,
  `reviewer: 'Navodit Kaushik (product/content owner)'`,
  `reviewedAt: '2026-09-18'`. The production catalog is now **fully
  reviewed: 54/54 content records**, 0 pending.
- Updated `tests/content/catalog.test.ts` (reviewed count 48→54, pending
  6→0; rewrote the servable-catalog gate test to exercise the filter
  logic against a synthetic reviewed/pending pair instead of asserting
  on the production catalog's current review-status mix, since that mix
  is no longer guaranteed to include pending items) and
  `tests/phase1/vertical-slice.test.ts` (`unavailableSkills` now
  expected to be empty, since no skill lacks reviewed content).

Validation: `npm run format:check`, `npm run lint`, `npx tsc --noEmit`,
`npm run content:validate`, `npm test` (61/61), and
`npm run test:integration` (30/30) all pass.

`v3-content-human-review` marked done. Next: `v3-content-merge`
(confirm no further v2-sourced content remains to merge — likely a
no-op given the re-scoping above) and `v3-validate-ship` (final
end-to-end validation and release notes for the v3 curriculum).

## 2026-09-18 — v3 Steps 4–5: content-merge no-op confirmed, full end-to-end ship validation (complete)

- **`v3-content-merge` confirmed no-op**: cross-checked every content JSON
  file under `content/{ratios,number-system,expressions-and-equations,
  geometry,statistics}` against `src/content/catalog.ts`'s import list —
  all 54 on-disk records are wired in, none pending, no orphaned files.
  Nothing remained to merge from the v2 experiment beyond the 11
  graph-merge-split records (Step 2) and the 6 pre-existing pending
  records (Step 3), both already handled.
- **`v3-validate-ship` — full end-to-end validation gate**, run in this
  order:
  - `npm run verify` (format:check, lint, typecheck, db:check-down-migrations,
    unit tests, production `next build`) — all pass, build succeeds with
    21 routes generated.
  - `npm run test:integration` (`DATABASE_URL` exported manually) — 30/30
    pass.
  - `npm run curriculum:validate` — 7/7 pass (27-skill graph, no cycles).
  - `npm run eval:run` — 3/3 tutor eval cases pass.
  - `npm run test:e2e` (Playwright, Chromium) — 19/19 pass, covering auth,
    keyboard operability, WCAG AA accessibility (learner/parent/help
    pages), household export/delete controls, and the Phase 1 learner and
    parent journeys end to end against the now-27-skill/54-content
    catalog. (A stale `next-server` process left over from an earlier
    session was holding port 3000 and had to be stopped so Playwright's
    web server could bind to the port its `baseURL` expects — an
    environment cleanup step, not a code change.)
- **v3 curriculum is now fully shipped**: 27 skills (up from v1's 22),
  54/54 content records human-reviewed (0 pending, up from v1's 38
  reviewed / 6 pending), a servable-content safety gate that prevents any
  future pending content from reaching a learner, and every automated
  quality gate (format, lint, types, migrations, unit, integration,
  curriculum, eval, and e2e/accessibility) green.

All 5 `v3-*` todos (`v3-contract-changes`, `v3-graph-merge`,
`v3-graph-merge-content-review`, `v3-content-human-review`,
`v3-content-merge`, `v3-validate-ship`) marked done. The Grade 6 Math v3
merge workstream is complete.

## 2026-09-18 — Contest-program fleet: shared infrastructure prerequisite (complete)

- **Scope:** One-time shared prep before starting the sequential contest-
  program fleet (Math Kangaroo → MOEMS → AMC 8 → MATHCOUNTS, each run
  through the full research → human-approve → author → independent-review
  (fix/re-review loop, capped at 2 cycles) → human-approve → validate/ship
  pipeline). Each program will get its own independent
  `docs/curriculum-sources.md` section, its own review packet under
  `docs/curriculum-review-packets/`, and its own skill/content files — never
  merged into another program's records.
- **Extended `CurriculumProgramSchema`** (`src/contracts/curriculum.ts`) from
  `['grade-6-math']` to also include `'math-kangaroo-6'`, `'moems-6'`,
  `'amc-8'`, `'mathcounts-6'`, matching the codes already anticipated by
  `PROGRAM_ROSTER` (`src/curriculum/program-roster.ts`) for the subject
  switcher.
- **Added roster entries** for MOEMS and MATHCOUNTS (Math Kangaroo and AMC 8
  were already present, both still `available: false` pending their own
  ship step).
- **Documented a skill-code namespace convention** in
  `docs/curriculum-authoring-playbook.md`: since `skillsByCode` is one flat
  map across every program, each new program's skill codes must carry a
  short stable prefix (`mk6-`, `moems6-`, `amc8-`, `mc6-`) so they can never
  collide with Grade 6 Math's 27 existing codes or each other's, and a bare
  Grade 6 Math code must never be reused even where the underlying concept
  overlaps (mode + program already distinguish depth/contest revisits of a
  topic).
- **No changes to `CurriculumDomainSchema`**: each program will decide and
  add its own domain values during its own authoring step 1, not upfront,
  since the right domain breakdown depends on that program's actual syllabus
  structure (single-round MCQ vs. numeric-only vs. multi-round).

Validation: `npx tsc --noEmit`, `npm run lint`, `npx prettier --check` (the
touched files), and `npm test` (61/61, unchanged) all pass.

`fleet-shared-infra` marked done. Next: `mk6-research` (Math Kangaroo
Grade 6 research dossier, via the `curriculum-researcher` agent).

## 2026-09-19 — Math Kangaroo research dossier (pending review)

- **Completed `mk6-research`**: added a new "Math Kangaroo (Grades 5–6 /
  'Benjamin' level) research — 2026-09-19" section to
  `docs/curriculum-sources.md`, following the same structure as the Grade 6
  Math v2 dossier (scope, source register, framework, domain coverage,
  sequencing, originality discipline, conflicts/gaps, authoring handoff).
- **Sourcing outcome**: confirmed via Math Kangaroo USA's own site
  (`mathkangaroo.org`) that Grade 6 falls in the official "Levels 5 & 6"
  grouping. Could **not** confirm, against extractable primary-source text,
  the exact contest format figures (30 questions, 120 max points, ~75
  minutes) or the traditional level name "Benjamin" — the relevant official
  FAQ/format pages render via client-side JavaScript the available fetch
  tooling could not expand. These figures are recorded as
  **secondary-sourced and provisional**, with an explicit recommendation
  that a human confirm them (by viewing the page directly or locating an
  official downloadable rules PDF) before `mk6-authoring` encodes any exact
  number as fact.
- **Topic coverage** (arithmetic, geometry, logic, combinatorics) is sourced
  only from a Math Kangaroo India syllabus page (a different national
  affiliate, not Math Kangaroo USA) via secondary summaries — flagged as
  "plausible but unconfirmed" pending a US-specific source.
- **Open product decision surfaced**: whether Math Kangaroo content should be
  contest-tier only (assumed) or also include a core prep tier.
- Section is marked **"Pending product/content-owner review"** — the
  research agent cannot self-approve. Next: human review of this dossier
  (`mk6-research-approval`), then `mk6-authoring` can begin.

## 2026-09-19 (cont.) — Math Kangaroo research approved

- Product/content owner reviewed and resolved the open items in the Math
  Kangaroo dossier: confirmed contest format is **30 questions, 3/4/5-point
  tiers, 120 max points, 75 minutes** (owner initially suggested 120
  minutes; cross-checked against Think Academy's page, which states 75
  minutes for grades 5-12, and owner confirmed 75 minutes is correct);
  confirmed **both core-prep and contest tiers** should be authored (not
  contest-only).
- Owner additionally pointed out Math Kangaroo USA's official past-exam PDF
  archive (`https://mathkangaroo.org/mks/practice/pdf-exams/`, years
  1998-2023, all levels) as a source; confirmed this page exists and is
  primary, and recorded it in the dossier as the authoritative
  topic/style-inspiration source for authoring (never to reproduce actual
  archived problems).
- `docs/curriculum-sources.md`'s Math Kangaroo section status updated to
  **"Approved by the product/content owner on 2026-09-19."**
- `mk6-research` and `mk6-research-approval` marked done. Next:
  `mk6-authoring` (build the `mk6-` namespaced skill graph and core-prep +
  contest content, per the research handoff in the dossier).

## 2026-09-19 (cont.) — Research skill updated for historical question banks

- Updated `docs/curriculum-research-playbook.md` (new required input item 5)
  and `.github/skills/curriculum-research/SKILL.md` (new source rule 10) to
  require every contest/olympiad-style research pass to actively search for
  and cite the program owner's own official past-paper/problem archive,
  preferring it over third-party prep-provider summaries for topic-coverage
  and difficulty-progression inspiration (never for reproducing actual
  problems).
- Retroactively applied to the already-approved Math Kangaroo dossier: its
  source register and handoff already cite Math Kangaroo USA's official PDF
  archive (`mathkangaroo.org/mks/practice/pdf-exams/`, 1998-2023); no
  further change needed there.
- This update applies going forward to the MOEMS and AMC 8 research now
  starting in parallel worktrees (see below).

## 2026-09-19 (cont.) — Math Kangaroo skill graph and draft content authored

- Completed `mk6-authoring` (workflow step 1-3 of
  `docs/curriculum-authoring-playbook.md`) using the approved Math Kangaroo
  dossier in `docs/curriculum-sources.md`:
  - Extended `CurriculumDomainSchema` with four new Math Kangaroo domains
    (`mk6-arithmetic-and-patterns`, `mk6-geometry-and-spatial-reasoning`,
    `mk6-logical-reasoning`, `mk6-combinatorics`) and their site labels in
    `scripts/generate-curriculum-site.ts`.
  - Authored 8 new `mk6-`-prefixed skills under `content/skills/`, wired
    into `src/curriculum/catalog.ts`: multi-step arithmetic reasoning,
    number patterns/magic squares, clock/calendar reasoning,
    perimeter/area reasoning, angle/shape properties, 3D spatial
    visualization, logical deduction puzzles, combinatorial counting.
    Prerequisite edges are acyclic and program-scoped only to
    `math-kangaroo-6`.
  - Because Math Kangaroo has no external standards codes, each
    skill/content record cites an internal `MK6-<DOMAIN>-<n>` reference
    code, documented as such in the dossier's new "Standards/skill-code
    convention" subsection (not an external standards body's code).
  - Drafted 16 candidate content records (2 per skill: one `core` mode,
    one `contest` mode) under `content/math-kangaroo-6/`, each tagged
    `provenance.origin: "llm_drafted"`, `licenseStatus: "owned"`, and
    `review.status: "pending_review"` per `docs/content-authoring-pipeline.md`
    — none are visible to a learner yet (`servableContentCatalog` excludes
    `pending_review` items, confirmed by an existing test).
  - Content style discipline followed the dossier's handoff: general skill
    types/format only, no problem/wording/diagram reproduced from any
    contest archive (Math Kangaroo USA's official PDF archive, the India
    syllabus page, or Think Academy's prep summaries).
  - Updated `docs/02-curriculum-and-pedagogy.md` with the new Math Kangaroo
    skill graph section.
  - Updated `tests/curriculum/skill-catalog.test.ts` (split the single
    Grade 6 Math assertion into a Grade 6 Math-specific check, a new Math
    Kangaroo-specific check, and a whole-catalog no-duplicate-codes check)
    and `tests/content/catalog.test.ts` (updated total/reviewed/pending
    counts: 70 total, 54 reviewed, 16 pending).
- Validation: `npx tsc --noEmit`, `npm run lint`, `npx prettier --check`
  (all touched/new files), and `npm test` (63/63 passing) all pass.
- **Not yet done**: independent review (`mk6-independent-review`) and human
  content approval (`mk6-content-approval`) — the 16 drafted content
  records must not be treated as validated mathematics/pedagogy until a
  human (or the independent reviewer, advisory only) checks them; a human
  educator/content owner must still set `review.status: "reviewed"` before
  any record is servable.
- Next: `mk6-independent-review` via the `curriculum-reviewer` agent/skill.
## 2026-09-18 — AMC 8 final focused independent review of `ead188a`

- Confirmed choice E in `content/amc-8/amc8-coordinate-geometry-2.json`:
  reverse only `x` to get `-3`, retain `y = 2`, derive signed cutout area
  `-6`, and calculate `24 - (-6) = 30`. The misconception code and rationale
  align, and the record is version `content-3`.
- Confirmed the prompt, answer choices and mappings, figure and accessibility
  text, hints, validator, solution, leakage patterns, provenance, and
  `pending_review` state are unchanged from `c654f34`.
- Reconfirmed all prior re-review findings remain resolved, the exact
  owner-approved AMC 8 readiness gate is catalog-enforced, AMC 8 remains
  pending/unavailable, and no blocker, major, or minor finding remains.
- Validation passed: `npm run content:validate` (17), `npm run
  curriculum:validate` (17), focused catalog/planner tests (29), and
  `npm run verify` (85 tests plus production build). Field-level preservation
  and `git diff --check c654f34..ead188a` also passed.
- Recommendation: **ready for human review**.

## 2026-09-18 — MOEMS prerequisite remediation re-review

- Re-checked the current uncommitted prerequisite fix on top of commit `994eaf0`: the two unjustified place-value edges were removed from `moems6-patterns-and-counting` and `moems6-geometry-and-measurement`, and those same changes are mirrored in the four affected content records.
- The four changed content records are version-bumped to `content-2`, remain `pending_review`, and keep the same provenance (`llm_drafted` + `owned`).
- The cryptarithm dependency remains in place as a genuine place-value/carry dependency and no cycles or hidden prerequisite gaps were introduced in the MOEMS graph.
- Focused validation passed 14/14 content tests and 15/15 curriculum tests;
  the full repository gate then passed 76 tests and the production build.
  No blocker, major, or minor finding remains, so the advisory recommendation
  is **ready for human review**.
