# Grade 6 school Science — authoring prerequisites specification, 2026-10-10

**Status: Specification only. Proposed; ready for independent review, not
human-approved.** This document does not lift or except `D-61`, authorize
authoring, approve content, change any schema/registry/runtime file, or make
`grade-6-science` available to learners. Source approval of the research
dossier is not publication approval.

**Revision 2 (2026-10-10).** Corrects independent-review findings SCI6-P1,
SCI6-P2, SCI6-P3 and the minor finding from reviewer task
`140f5836-1a6c-4c3a-9f1b-f7018ac1cb6b` (`gpt-6.1-sol`, GPT family;
actual model verified by the coordinator from task metadata, not self-report).
Changes: §4 cardinality wording; new G13 (public draft-skill gating);
§6 and §11 mastery wording; §11 core coverage of MS-ETS1-1's
principle/impact component; §12 gate tests; §13–§14 separate first-authoring
gates from later release features. This revision is ready for bounded
re-review; the parent's judgment of the G13 gate implementation is pending,
so nothing here claims that gate is reviewed or merged.

## 1. Purpose and boundary

Define the bounded prerequisites that must exist before any Grade 6 California
integrated school Science skill or content record is authored, and recommend
one first lesson/skill packet. It follows the owner's "new-curricula-first"
fleet direction: bounded prerequisites and specifications first, authoring
only after a dated applicable authorization, and independent cross-family
review after authoring.

Out of scope for this artifact: new source research, copied or paraphrased
source content, skill/content/assessment JSON, exercises, a curriculum graph,
schema/registry/policy/runtime edits, migrations, database or provider calls,
and edits to any shared register or log (`docs/PROGRESS.md`,
`docs/curriculum-sources.md`, decisions files). Those belong to their owners.

## 2. Pinned inputs and evidence

- Worktree base commit: `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`.
- Approved dossier: `docs/curriculum-dossiers/grade-6-science-20261010-research.md`,
  current SHA-256 `706d55d98b0d21533d10acc250ca7aab8b4c043fe5e32eb2147517121d849155`
  (255 lines).
- Independently reviewed dossier revision: SHA-256
  `191cec404fd5c3a8c147d143feace4d93b220c200c6b1d9f96585ccf031f14d2`
  (252 lines), per `docs/curriculum-dossiers/grade-6-science-20261010-review.md`
  (current SHA-256 `360061b76242ca97bcd3c2a167615cf59203eb03348fb65b9ea7729bc01844f8`).
- Hash delta: a local `diff` against the session's staged reviewed copy
  (`parallel-20261010/school-science/...`, same 191cec… hash) shows only the
  status header (lines 3–12) changed, from "pending owner review" to the
  owner's 2026-10-10 research-only approval and integration note. No source,
  coverage, or handoff text changed after review.
- Owner approval (research only): "science and science olympiad are good to go
  as well" — recorded in the dossier header, `docs/curriculum-sources.md`
  (school Science section) and `docs/PROGRESS.md` (2026-10-10 entries).
- Governing procedure read: `AGENTS.md`, `README.md`, latest `docs/PROGRESS.md`
  entries, `docs/02-curriculum-and-pedagogy.md`, `docs/03-system-architecture.md`,
  `docs/05-data-and-student-model.md`, `docs/curriculum-authoring-playbook.md`,
  `docs/content-authoring-pipeline.md`, `docs/content-review.md` (checklist),
  `docs/curriculum-agents.md`, `docs/agent-orchestration.md`,
  `docs/development-expansion-plan.md` (school Science prerequisites) and
  `docs/course-progression-decisions.md` (`D-01`, `D-37`–`D-40`, `D-52`,
  `D-56`–`D-58`, `D-60`, `D-61`, `D-63`, `D-64`, `D-66`, `D-73`, `D-74`).
- Shipped code inspected (actual behavior, which governs where older prose
  lags): `src/contracts/{content,curriculum,progression,program-codes,common}.ts`,
  `src/curriculum/{catalog,program-registry,program-roster}.ts`,
  `src/content/{catalog,answer-matching,figure,publication,resolvers}.ts`,
  `src/assessment/private-package-store.ts`, `src/phase1/service.ts`,
  `src/progression/assessment-submission.ts`, `src/app/learner-data.ts`,
  `src/app/components/activity-panel.tsx`, `scripts/generate-curriculum-site.ts`,
  `policy/access-policies/grade-6-science-access.json`,
  `policy/progression-profiles/grade-6-science-default.json`, and the test
  inventories under `tests/content/`, `tests/contracts/`, `tests/curriculum/`.
- Executor model identity is not self-reported here; the coordinator witnesses
  actual-model task metadata per `docs/agent-orchestration.md`.

## 3. Inherited approved scope (not owner choices)

These are already settled by the approved dossier, its review, and existing
approved decisions. This specification preserves them unchanged.

1. California Grade 6 school Science, **Preferred Integrated Course Model**,
   tiers `core` plus `depth`. No district, school, IUSD, textbook, CAST-prep or
   NGSS-endorsement alignment claim. No pacing; the framework's four-segment
   storyline (IS1–IS4) is optional, non-binding sequencing inspiration only.
2. All **19** Grade 6 integrated PEs are in scope and must eventually map to
   skills, with no omission:
   - Life Science (7): MS-LS1-1, MS-LS1-2, MS-LS1-3, MS-LS1-4, MS-LS1-5,
     MS-LS1-8, MS-LS3-2.
   - Earth and Space Science (5): MS-ESS2-4, MS-ESS2-5, MS-ESS2-6, MS-ESS3-3,
     MS-ESS3-5.
   - Physical Science (3): MS-PS3-3, MS-PS3-4, MS-PS3-5.
   - Engineering (4): MS-ETS1-1, MS-ETS1-2, MS-ETS1-3, MS-ETS1-4. All four
     remain Grade 6 `core`, including MS-ETS1-4 even though the framework's
     Grade 6 example bundles omit it.
   - Codes are recorded with ASCII hyphen-minus, never the en dash that appears
     in two PDF headers. Cross-grade connection codes (for example MS-PS1-6,
     MS-LS2-5) are not Grade 6 PEs and must not appear as `standards`.
3. Assessment boundaries in the Grade 6 standards cap `core` mastery claims.
   `depth` may exceed them only as labeled, non-assessed enrichment.
4. **School Science is not Science Olympiad.** `grade-6-science` and
   `science-olympiad-division-b` stay separate programs with separate
   skills, prefixes, sources, and reviews; no prerequisite edge, skill code,
   standard code, or content record crosses between them. Content mode
   `contest` and `contestFormat` metadata do not apply to school Science.
5. Rights: cite PE codes and write original short descriptors. No
   reproduction or close paraphrase of standards/framework/NRC text, framework
   vignettes, figures, tables, storyline wording, CAST items, EEI or PhET
   materials. No NGSS name/logo use implying endorsement. No source is
   licensed for reuse; `provenance.origin: "licensed"` is not available.
6. Provenance: model-assisted drafts use `provenance.origin: "llm_drafted"`,
   `licenseStatus: "owned"`; hand-authored drafts use `original`. Every new
   record is `review.status: "pending_review"` until human content approval.
7. `D-01` is APPROVED as Branch B (held-out). Assessment and review items
   never enter public `content/`; they belong only in an authorized private
   package, and only under an explicit scope (compare `D-66`, `D-73`).
8. Mastery is never established by an LLM judgment or by practice completion
   alone (`AGENTS.md`; `docs/02-curriculum-and-pedagogy.md` mastery policy).
9. `D-61` pause remains in force. Research approval is necessary but not
   sufficient; authoring requires a dated, scoped product-owner authorization
   recorded under `D-61` (a lift or a named exception).

## 4. Actual shipped mechanisms available for reuse

Inventory from code at the pinned commit:

- **Program code.** `grade-6-science` already exists in `PROGRAM_CODES`
  (`src/contracts/program-codes.ts`) and in `PROGRAM_REGISTRY` as an
  unavailable placeholder. `PROGRAM_ROSTER` is derived from the registry; no
  separate roster edit is needed.
- **Role schemas.** `VersionedContentItemSchema` is a role-discriminated union
  (`teaching`, `practice`, `assessment`, `review`) in
  `src/contracts/progression.ts`. Teaching carries `explanation` and optional
  `workedExample`, no validator or hints. Practice carries a deterministic
  validator, misconception codes, a 1–10 step hint ladder and leakage
  patterns. Assessment and review carry a validator and `assessmentBankRef`
  and structurally cannot carry `hintSteps`.
- **Live catalog.** `validateContentCatalog` parses with
  `PublishedContentRecordSchema` (role-specific records only) and throws if any
  record is not `practice`. The legacy exactly-two rule applies only to
  role-less legacy records; a skill whose records are role-specific may have
  any number of them, so three role-specific `practice` records for one skill
  are allowed and no exact count is required. A skill with **zero** records
  still throws, so a new skill and at least one practice record must land
  together.
- **Public site and draft skills.** `scripts/generate-curriculum-site.ts`
  iterates the whole `skillCatalog`: every skill's title, code, standards and
  prerequisite names appear on the public site and in the skill/standards
  counts, regardless of program availability or content review status. Only
  content is filtered (`publishableContentProjection`). See G13.
- **Mastery-check rule.** `masteryCheckRule` is a free-text prose field; no
  runtime code reads it (no use outside `src/contracts/`). It documents intent
  only and is not an executable cross-day or cross-format rule.
- **Catalog checks reusable unchanged:** unique `id@version`; known
  `skillRef`; `licenseStatus: "owned"`; canonical answer listed in
  `acceptedAnswers`; hint text must not contain any `forbiddenLeakagePatterns`
  entry (case-insensitive substring); difficulty within the skill's
  `difficultyBands`; item misconception codes declared on the skill;
  `itemReadinessRefs` validation.
- **Program invariants.** `validateProgramSkillInvariants` enforces a
  program's `skillCodePrefix` (when non-null) and forbids cross-program
  prerequisite edges — directly reusable for the Science/Olympiad separation.
- **Deterministic matching.** `matchesAcceptedAnswer`
  (`src/content/answer-matching.ts`) normalizes case, whitespace, trailing
  terminal punctuation and separator spacing, then requires an exact
  whole-string match against an authored accepted answer; optional composite
  `parts` add per-clause substring matching. Nothing is fuzzy, semantic or
  model-judged. Validator types: `numeric`, `text`, `ratio`, `percent`,
  `multiple_choice`, `composite`.
- **Figures.** `ContentFigureSchema` accepts only a static SVG subset
  (`svg`, `g`, `line`, `path`, `polygon`, `polyline`, `rect`, `circle`,
  `ellipse`, `text`), rejects event handlers, `href`, `xlink:`, `url(` and
  `<style>`, and requires `altText` (≤1000 chars), `caption`, and bounded
  dimensions. The practice panel and public site render it as an `<img>` with
  that alt text and a caption.
- **Accessibility fields.** Every role requires `accessibilityNotes` and
  `accessibleAlternative` (≤1000 chars each).
- **Publication projection.** `publishableContentProjection` emits only
  reviewed `teaching`/`practice` records to the public site; tests
  `tests/content/held-out.test.ts` and
  `tests/curriculum/assessment-separation.test.ts` guard pending and
  assessment/review exclusion. `servableContentCatalog` filters to reviewed.
- **Held-out store.** `src/assessment/private-package-store.ts` validates
  private assessment/review banks against `RequiredBank` lists; only Grade 6
  Math banks are registered today.
- **Policy placeholders.** `grade-6-science-access@1.0.0` grants `PRACTICE`,
  `PLACEMENT`, `REVIEW` and denies `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`,
  `DELAYED_CHECK`; `grade-6-science-default@1.0.0` carries thresholds that
  mirror other programs' defaults and were not chosen for Science.

## 5. Mismatches and gaps (flagged, not changed)

Each item names the smallest remedy. None is applied here; shared schema,
registry, policy and UI edits must be serialized under one owner per
`docs/agent-orchestration.md`.

- **G1 — Wrong `subjectKind` (blocker).** The `grade-6-science` placeholder is
  generated with `subjectKind: 'enrichment-non-graded'`. School Science is a
  graded academic course; the appropriate existing value is
  `'graded-academic'`. `subjectKind` is not consumed by runtime logic today
  (only parsed), so correcting it is a low-risk registry edit, but it changes
  the shared registry and needs owner/engineering approval.
- **G2 — No skill-code prefix (blocker).** The placeholder has
  `skillCodePrefix: null`, so prefix enforcement is off and Science codes
  could collide with Math or Olympiad codes in the flat `skillsByCode` map.
  Proposed prefix: `sci6-` (no existing `sci6-` usage found in `src/`,
  `content/`, `tests/` or `docs/`). The Olympiad placeholder's prefix is a
  separate decision for its own track and must differ.
- **G3 — Domain vocabulary (blocker).** The live skill catalog parses
  `SkillSchema`, whose `domain` is the closed `CurriculumDomainSchema` enum
  with no Science values. `VersionedSkillSchema.domain` is a free string, but
  `validateVersionedSkillCatalog` is not wired into `skillCatalog`. Choose one:
  (a) add `sci6-` domain values (proposed: `sci6-life-science`,
  `sci6-earth-space-science`, `sci6-physical-science`, `sci6-engineering-design`)
  to the enum; or (b) wire versioned skills into the live catalog. Option (a)
  is the minimal change and matches every existing program.
- **G4 — Teaching role cannot ship (scope limiter).** The live catalog rejects
  non-practice records. Science instruction relies on phenomenon framing,
  but no teaching record can be served or even loaded today. The first packet
  is therefore practice-only (§11). A teaching-role publication path is a
  separate progression increment, not part of this prerequisite set.
- **G5 — No non-contest choice metadata (limiter).** Answer choices with
  per-option rationale and misconception codes exist only inside
  `contestFormat`, which school Science must not use. The learner practice
  panel has a single free-text input and renders no choice control (no
  `answerChoices` use under `src/app/`). Options: (A) no schema change — list
  labeled options in the prompt and the `accessibleAlternative`, use a
  `multiple_choice` validator whose `acceptedAnswers` are exactly the correct
  label and the correct option text; per-option misconception mapping then
  lives only in review notes; or (B) add a contest-independent choice set with
  per-option misconception codes and an accessible radio-group renderer.
  Recommend (A) for the first practice packet and (B) before any assessment
  bank, since misconception-tagged distractors are the main diagnostic signal.
- **G6 — Set and negation semantics (limiter).** Composite `parts` is
  substring-based: a response listing every option, or a negated phrase
  ("not warmer" contains "warmer"), can satisfy parts. Multi-select answers
  have no exact-set semantics. Until a reviewed exact-set validator exists,
  Science records must not use `parts`; multi-select is allowed only when all
  orderings of a set of at most three elements are enumerated in
  `acceptedAnswers` (≤20 entries), and supersets must not match.
- **G7 — Leakage-check false positives (rule).** The leakage check is a
  case-insensitive substring test on hint text. A single-letter pattern such as
  an option label would match almost any hint. Choice items must use the
  correct option's distinctive text (≥3 characters) as the forbidden pattern,
  never a bare label.
- **G8 — Accessible alternative not shown in practice (blocker for figures and
  data).** `src/phase1/service.ts` and `SessionSchema`
  (`src/app/learner-data.ts`) project only `prompt`, `accessibilityNotes` and
  `figure` to the practice panel; `accessibleAlternative` is not delivered
  (assessment submission does project it). No `src/app` component renders it.
  Until fixed, any Science practice item with a figure or data set must place
  every required value in the prompt text itself.
- **G9 — No accessible data-table representation (limiter).** Prompts render
  as one plain paragraph; figures are images described only by alt text. There
  is no structured table field with header semantics. Data-heavy PEs
  (MS-ESS2-5, MS-PS3-4, MS-ETS1-3) need either a reviewed accessible table
  representation or very small data sets fully stated in text.
- **G10 — Policy placeholders (decision).** The access policy's denial of
  lesson/unit/delayed assessment matches a skill-graph-only first packet, but
  the progression profile thresholds were not chosen for Science. No Science
  mastery claim should be reported to parents until the owner confirms or
  replaces them.
- **G11 — No Science validator rules (gap).** Nothing enforces Science-specific
  constraints: `standards` within the 19-PE allow-list, mode in
  `core`/`depth`, no `contestFormat`, no `parts`, `sci6-` prefix. Required
  tests are listed in §12.
- **G12 — Held-out banks (later).** No Science `RequiredBank` entries exist.
  Not needed for a practice-only first packet; required before any Science
  assessment/review authoring under `D-01` Branch B.
- **G13 — Public draft-skill gating (first-authoring blocker; SCI6-P3).**
  Filtering content is insufficient: adding even a pending Science skill to
  `skillCatalog` would publish its title, code, standards, prerequisite names
  and counts on the public curriculum site while the program is unavailable
  and no content is reviewed. Required behavior: the public projection shows
  a skill (and includes it in skill/standards counts and in any other skill's
  prerequisite list) only when its program is `available` **and** reviewed
  content exists for that exact skill code and version; otherwise the skill,
  its prerequisite names and its counts are hidden. The parent coordinator is
  implementing this gate separately (33 tests reported). It is **not** yet
  judged or merged, and this specification does not claim it is reviewed.

## 6. Evidence model: deterministic, structured, non-executing

1. **Authoritative evidence** comes only from a reviewed deterministic answer
   contract evaluated by `matchesAcceptedAnswer`. No model output, tutor
   message, simulation state, upload, photo, video, or free-form text is
   scored by an LLM or treated as mastery evidence.
2. **Non-executing.** Items present static original text and static figures.
   No embedded simulation, script, remote resource, code execution, or
   learner-run apparatus is part of any item contract.
3. **Permitted response contracts**, each mapped onto shipped validator types:
   - _Single select_ (`multiple_choice`): two to five labeled original options;
     accepted answers are exactly the correct label and the correct option text.
   - _Value read from provided data_ (`numeric` or `text`): one value or
     category read or compared from an original data set stated in full; units
     policy stated in `equivalenceNotes`; every accepted unit form enumerated.
   - _Ordered sequence_ (`text`): a short ordered list of labeled steps or model
     stages; canonical separator form plus enumerated spacing variants.
   - _Small set_ (`text`): at most three labeled elements, all orderings
     enumerated, supersets not accepted (G6).
   - _Decomposed claim–evidence–reasoning_: claim, evidence and reasoning are
     separate single-select decisions (separate items, or a whole-string
     composite with every accepted form enumerated). Free-text CER is practice
     narration only and is never scored.
   - _Variable roles_ (`multiple_choice` or `text`): identify the changed,
     measured, and controlled variable in an original, already-completed,
     described investigation.
4. **No ungraded free-text item type exists.** Do not invent a permissive
   validator that accepts arbitrary text to simulate open responses.
5. **Mastery claims.** Runtime estimates come only from validator-scored
   attempts under the program's progression profile (placeholder, G10).
   `masteryCheckRule` is prose and is not executed (§4); a cross-day or
   cross-format requirement written there is intent, not an enforced rule.
   No Science skill or PE may be reported as mastered or "assessed" to parents
   until an executable rule and confirmed thresholds exist; until then
   evidence is reported only as practice activity.

## 7. What online items cannot prove — assessed versus practiced, not assessed

General rule: online deterministic items can evidence recognition, selection,
interpretation, and reasoning with provided original models and data. They
cannot evidence a learner physically conducting an investigation, handling
materials, measuring, building or testing a prototype, collecting real data,
collaborating in a design team, or communicating an open argument. Simulations,
even when licensed later, show only that a learner can operate or interpret
that simulation, not physical lab competence. Physical labs and engineering
collaboration remain the school's or a supervising adult's responsibility and
are never requested by Learning Forge.

Proposed per-PE split (for owner approval as dossier decision 9). "Assessed"
means eligible for validator-scored structured evidence of the named
components; it is not a PE-mastery claim (§6 item 5). Everything else is
reported to parents only as **"practiced, not assessed"** or not reported.
Components listed as assessed are `core` unless marked otherwise; `depth`
items may add enrichment but never carry a required component.

- **MS-LS1-1** (evidence that living things are cells). Assessed: interpret
  original described observations as cell evidence; distinguish cellular from
  non-cellular examples within the California clarification. Not assessed:
  conducting a microscope investigation.
- **MS-LS1-2** (cell-as-system model). Assessed: match labeled cell parts to
  functions in a provided model; within the boundary excluding organelle
  biochemistry. Not assessed: constructing an original physical model.
- **MS-LS1-3** (body as interacting subsystems). Assessed: select a claim and
  supporting evidence about interacting subsystems. Not assessed: open oral or
  written argument.
- **MS-LS1-4** (behaviors/structures and reproduction). Assessed: select
  evidence and reasoning about effects on reproductive success from provided
  data. Not assessed: open argument writing.
- **MS-LS1-5** (environmental and genetic growth factors). Assessed: identify
  which factor a provided data set supports. Not assessed: constructing an
  open scientific explanation.
- **MS-LS1-8** (sensory information to the brain). Assessed: sequence a
  provided signal pathway; judge whether a described source supports a claim.
  Not assessed: gathering information from real sources; any human-subject
  sensory testing (prohibited).
- **MS-LS3-2** (asexual versus sexual reproduction model). Assessed: predict
  genetic-variation outcomes from a provided model. Not assessed: model
  construction.
- **MS-ESS2-4** (water cycling driven by Sun and gravity). Assessed: order
  stages and identify the driver of each transition in a provided model. Not
  assessed: model construction.
- **MS-ESS2-5** (air masses and weather data). Assessed: interpret original
  provided weather data. Not assessed: collecting real weather data.
- **MS-ESS2-6** (circulation patterns and regional climate). Assessed: select
  the cause of a regional pattern from a provided model, within the boundary
  excluding Coriolis dynamics. Not assessed: model construction.
- **MS-ESS3-3** (monitor/minimize a human impact). Assessed: evaluate a
  described monitoring or mitigation method against stated criteria. Not
  assessed: designing and implementing a real method.
- **MS-ESS3-5** (questions about evidence for warming). Assessed: classify
  which candidate questions are answerable with provided evidence. Not
  assessed: open question generation. Framing requires owner tone guidance
  (dossier decision 8) before authoring.
- **MS-PS3-3** (device for thermal-energy transfer). Assessed: apply
  transfer principles to compare described designs using provided test data.
  Not assessed: constructing or testing a device (prohibited at home; heat
  sources excluded).
- **MS-PS3-4** (energy, matter type, mass, temperature). Assessed: identify
  variable roles and a fair-test plan for a described, already-completed
  investigation; interpret provided results without thermal-energy
  calculations. Not assessed: carrying out the investigation (heat sources
  excluded).
- **MS-PS3-5** (kinetic-energy change and energy transfer). Assessed: select
  the claim and evidence that energy transferred, from provided data. Not
  assessed: open argument; any physical demonstration.
- **MS-ETS1-1** (criteria and constraints). Assessed, all `core` (SCI6-P1):
  (a) classify criteria versus constraints; (b) detect a solution that
  violates a stated constraint or fails a stated criterion; (c) identify the
  relevant scientific principle or potential impact on people or the natural
  environment that a design must account for. Component (c) is part of the
  PE's required precision and is never depth-only. Not assessed: defining a
  real problem with stakeholders or a team.
- **MS-ETS1-2** (systematic evaluation of solutions). Assessed: apply a
  provided decision matrix to provided scores. Not assessed: building the
  matrix collaboratively.
- **MS-ETS1-3** (combine best features from test data). Assessed: identify
  the best-performing feature per criterion from provided test data. Not
  assessed: conducting tests; team redesign.
- **MS-ETS1-4** (model to generate data for iteration). Assessed: interpret
  provided model output to choose the next iteration. Not assessed:
  building and running a physical or computational model.

## 8. Safety rules for all roles

1. No new experiment, lab, home-activity, or build instructions in any role,
   hint, explanation, or tutor-authored follow-up. Investigations appear only
   as original, already-completed, described scenarios with provided data.
2. Never instruct or invite use of heat sources, flames, chemicals, sharp
   tools, electricity beyond sealed low-voltage devices, live animals,
   human-subject sensory testing, or outdoor hazards (dossier policy). Hints
   must not say "try it" or suggest replicating a scenario.
3. The virtual/provided-data-first, no-hands-on policy needs explicit owner
   approval (dossier decision 5); the CDE safety handbook was not read, so no
   hands-on content is in scope until an accessible current safety authority
   is reviewed.
4. No external simulations, links, or embeds (PhET/EEI terms unverified,
   dossier decision 7).
5. Climate content: accurate, age-appropriate, agency- and solutions-oriented,
   non-alarmist; blocked until owner tone guidance (dossier decision 8).
6. No child profile data in drafting prompts; no provider calls in this phase.

## 9. Visuals and text alternatives

1. Every visual is original or explicitly rights-cleared; none is traced,
   redrawn, or closely adapted from framework, NRC, CAST, EEI, PhET, or
   textbook figures. Rights-cleared external visuals are unavailable today
   (catalog rejects `licensed`), so all visuals are original static SVG.
2. Use only `ContentFigureSchema`'s static subset; no raster images, remote
   references, scripts, styles, or animation.
3. `altText` states the figure's purpose and every value or relationship the
   item depends on. `accessibleAlternative` restates the full prompt, all
   options, and all data in plain text, sufficient to answer with no visual.
4. Until G8 is fixed, every required value also appears in the prompt text.
   Until G9 is fixed, data sets stay small (proposed ≤12 values) and fully
   stated in text.
5. No meaning by color alone; use labels, patterns, or line styles. Text in
   SVG must be legible at the rendered size; units and axis labels are always
   present. Maps, if any, carry place labels in text.
6. Grade 6 reading level; WCAG 2.2 AA for learner and parent flows. Human
   screen-reader review of Science figures follows `D-41` scope.

## 10. Misconception and hint rules per role

- **Skill level.** Each skill declares a small set (≤10) of original,
  kebab-case misconception codes grounded in the dossier's assessment
  boundaries and general Grade 6 science pedagogy, not copied from a source
  list. Every item code must be declared on the skill (enforced today).
- **Teaching** (deferred by G4). Addresses the skill's misconceptions
  explicitly in `explanation`; no hint ladder, validator, or canonical answer;
  originality and accuracy review still applies.
- **Practice.** Hint ladder of three or four steps progressing
  `small_strategic_hint` → `multiple_hints_representation` →
  `analogous_worked_example` (→ optional `guided_full_solution` only after
  earlier steps). Hints point to the relevant part of the provided data or
  model and the reasoning move; the analogous example uses a different
  original context and values. No hint names the correct option, label, value,
  or ordering; `forbiddenLeakagePatterns` lists the correct option's
  distinctive text and value forms (G7). No hint contains safety-prohibited
  suggestions (§8). Distractors each target one declared misconception, noted
  for reviewers.
- **Assessment and review** (deferred; private package only). No hints by
  schema. Distractors carry declared misconception codes (requires G5 option
  B for structured tagging). Items never appear in public `content/`, the
  public site, or tutor hint context.

## 11. Recommended first bounded lesson/skill packet

Recommendation only; no records are authored here.

- **Proposed skill:** `sci6-design-criteria-constraints` (code contingent on
  G2), program `grade-6-science`, domain `sci6-engineering-design` (contingent
  on G3), title along the lines of "Criteria and constraints of a design
  problem".
- **Standards:** `MS-ETS1-1` only. MS-PS3-3 may supply an original
  thermal-design context in descriptions, but is **not** claimed in
  `standards` because the packet does not evidence its design component.
- **Why first.** Grounded in an all-`core` ETS PE that the dossier insists on
  keeping; text-only, so it avoids G8/G9 visual and table gaps; deterministic
  single-select responses fit shipped validators; no hazard,
  climate framing, external resource, or contested sequencing. Framework
  storyline placement (IS1/IS2/IS4) is optional and not required.
- **Role/mode/records:** three role-specific `practice` records, all `core`
  (`foundational`, `developing`, `challenging`), one per observable component
  below; prerequisites none; `itemReadinessRefs` empty. Three is a proposal,
  not a schema requirement: role-specific records have no exact-count rule
  (§4), and at least one must land with the skill. No `depth` record is
  needed; an optional `depth` record may follow as labeled enrichment only.
  No teaching record (G4); no assessment/review records (G12, access policy).
- **Proposed observable evidence (measurable, all `core`):**
  1. Classifies original stated requirements as a criterion or a constraint.
  2. Identifies which of two to four described solutions violates a stated
     constraint or fails a stated criterion.
  3. Selects the scientific principle or potential impact on people or the
     natural environment that a described design must account for.
- **Proposed `masteryCheckRule` text (intent only, §4/§6):** documents that
  later mastery evidence should span different days and response formats with
  unhinged correct responses. This text is not executed; the packet makes no
  skill or PE mastery claim.
- **Coverage claim:** this is the **first component skill** for MS-ETS1-1 and
  gives **partial `core` coverage** only: one practice item per component (a)
  to (c) in §7, in original contexts. It does not cover MS-ETS1-1 fully. Later
  coverage is still required: more varied contexts and items for each
  component (especially principle/impact identification across life, Earth
  and physical science contexts), validator-scored evidence beyond practice
  once assessment authoring is permitted (G12), and an executable mastery rule
  before any parent-facing "assessed" claim (§6 item 5). "Practiced, not
  assessed": defining a real problem with stakeholders or a team.
- **Second candidate, blocked by G8/G9:** a weather-data interpretation skill
  for MS-ESS2-5 once accessible table delivery exists.

## 12. Prerequisite implementation tests (separate approved increment)

Named for an implementer; none are written here. Each must fail before its
change and pass after.

1. `program registry: grade-6-science is graded-academic with prefix sci6-`
   and remains `available: false` until release approval.
2. `skill catalog: rejects a grade-6-science skill without the sci6- prefix`.
3. `skill catalog: rejects grade-6-science standards outside the 19 Grade 6
PE allow-list`, including an en-dash variant and a cross-grade code.
4. `content catalog: grade-6-science records must be core or depth and carry
no contestFormat`.
5. `content catalog: grade-6-science records must not use composite parts`.
6. `content catalog: choice items forbid single-label leakage patterns` and
   require the correct option text (≥3 characters) as a forbidden pattern.
7. `answer matching: science single-select accepts exactly the label or
option text and rejects other labels, "a or b", and supersets`.
8. `program invariants: no prerequisite edge or shared code between
grade-6-science and science-olympiad-division-b`.
9. `practice session projection includes accessibleAlternative` and the
   activity panel renders it (unit test plus Playwright with axe on a
   synthetic fixture).
10. `publication: pending and assessment-role grade-6-science sentinels are
excluded from the curriculum site`.
11. `content catalog: grade-6-science figures require an accessibleAlternative
containing every number shown in the figure text` (deterministic extraction
    of numerals from SVG `<text>`).
12. `content review aid: flags safety-sensitive terms in grade-6-science
prompts, hints, and solutions` (fixed term list; a flag requires human
    review and is not safety approval).
13. G13 gate (parent-owned; reported as 33 tests, pending parent judgment, not
    re-specified here). It must at least cover: a skill in an unavailable
    program is absent from the public site with its prerequisite names and
    skill/standards counts; a skill in an available program without reviewed
    content for its exact code and version is absent; a reviewed version of
    a different skill version does not unlock it; a hidden skill is not named
    in any visible skill's prerequisite list. A synthetic `grade-6-science`
    fixture case should be included or added.

Plus the existing sweep: `npm run typecheck`, `npm run lint`, `npm test`,
`npm run content:validate`, `npm run build`, and the relevant Playwright
journey.

## 13. First-authoring gates, later release features, and owner choices

Inherited (§3), not re-decided: scope, 19 PEs including all four ETS1, core
plus depth, no pacing, Science separate from Olympiad, rights rules,
provenance, `D-01` Branch B, no LLM mastery scoring, `D-61` pause.

**First-authoring gates** (all required before the §11 packet is drafted or
merged):

1. Dated, scoped `D-61` authorization (owner choice O1; see below). Nothing
   in this specification lifts or excepts `D-61`.
2. Registry correction G1/G2 (`graded-academic`, prefix `sci6-`,
   `available: false` unchanged) with tests 1–2.
3. Science domain values G3 (engineering default: allow-listed
   `sci6-` domain strings on the legacy schema).
4. Public draft-skill gate G13, merged after the parent's judge review
   (test 13).
5. Science validator tests 3–8 (standards allow-list, tier/format, no `parts`,
   choice leakage, single-select matching, Olympiad separation).
6. Owner approval of the safety policy (§8, O2) and the assessed versus
   practiced-not-assessed matrix (§7, O3).

**Later release features** (not needed for the first practice-only,
text-only packet): teaching-role publication (G4); `accessibleAlternative`
in practice sessions and table delivery (G8, G9; tests 9, 11; before
data/figure packets); structured choice metadata (G5 option B); confirmed
Science thresholds and an executable cross-day/cross-format mastery rule
(G10, §6 item 5; before any parent mastery or "assessed" report); held-out
banks and assessment/review roles (G12); safety review aid (test 12); climate
tone (decision 8); SEP-5/CCC-1 depth treatment (decision 4); external
resources (decision 7); live-page amendment check (decision 1); program
availability and release approval.

**Owner choices (minimized).** Engineering defaults cover domain naming,
packet selection (§11), record count, and choice approach (G5 option A), so
they need no owner decision unless the owner objects. Only three choices
remain:

1. **O1 — Dated scoped `D-61` authorization** naming program, skill code,
   role (practice only), modes, the public `content/` location, and the review
   path (independent cross-family review, then human content approval).
2. **O2 — Safety policy** (§8, dossier decision 5).
3. **O3 — Assessed versus practiced-not-assessed matrix** (§7, dossier
   decision 9).

## 14. Blockers and readiness

- **Blocking first authoring:** O1 (`D-61`), G1, G2, G3, G13 (parent gate
  pending judge review), tests 1–8, O2, O3.
- **Blocking data/figure packets:** G8, G9 (tests 9 and 11).
- **Blocking assessment/review authoring and any mastery claim:** G5 option B,
  G10 with an executable mastery rule, G12, an explicit private-package
  scope.
- **Not a blocker:** dossier hash delta (status header only, §2).

**Readiness: revision 2 is ready for bounded independent re-review.** This is
not human approval, authoring authorization, a `D-61` lift, or a release
decision.
