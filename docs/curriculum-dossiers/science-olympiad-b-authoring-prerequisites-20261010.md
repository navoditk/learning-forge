# Science Olympiad Division B — authoring prerequisites specification

**Status: Specification only, revision 2 — ready for bounded independent
re-review, not human approval.** Dated 2026-10-10. This document authorizes
nothing: no skill graph, content record, schema, runtime, policy, registry,
database or publication change. It does not lift `D-61`, does not record any
owner decision, and does not establish independent review of the 2026-09-19
Science Olympiad research dossier.

## Revision history

| Revision | Change                                                                                                                                                                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Initial specification.                                                                                                                                                                                                                                                                                         |
| 2        | Corrects independent cross-family review findings (reviewer `c8e73d77-3f1a-40c1-b02a-93c769a151a0`, actual model `gpt-6.1-sol`, identity verified from coordinator metadata): compound substring grading, catalog cardinality, draft-versus-release gates, season/version contract, stale source-test blocker. |

Review findings addressed in revision 2:

1. **Unsafe compound substring grading.** The first packet now forbids
   `composite` validators and `parts` entirely and uses only whole-string
   closed answers (§9.2 `G-MATCH`, §10). No LLM judgment is authoritative.
2. **Inaccurate cardinality.** Revision 1 implied an exactly-two rule. The
   actual rule is stated in §9.2 `G-COUNT`: role-specific practice records
   may number one, two or three per skill; zero fails.
3. **Draft and release gates conflated.** §11 now separates draft-authoring,
   merge/public-projection and learner-release gates.
4. **Season/version contract.** §5 now gives one exact engineering
   recommendation instead of an open owner choice; it still requires
   approval and is not an owner decision.
5. **Source-test blocker stale.** Closed in §5.1.

## 1. Purpose and boundary

The owner selected new curricula first and asked for a bounded
prerequisite/specification pass followed by independent GPT-family review
before any authoring. This packet specifies what must be true before a first
Science Olympiad Division B study increment can be authored against the
repository's actual contracts. It produces no skills, exercises, JSON,
prompts, answers or content graph.

Out of scope, permanently for this packet: chemical, tool, build, launch or
device procedures; dimensions, tolerances or material lists; creation of
supervised lab workflows; reproduction or close paraphrase of official rules,
scoring formulas, tests, keys, diagrams or score sheets; new web research;
private/paid test-bank use.

## 2. Pinned inputs

Inputs read from the isolated worktree at `HEAD`
`4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`. Three shared docs carry
uncommitted coordinator edits; they are pinned by working-copy SHA-256 prefix.

| Input                                   | Pin                         | Used for                                                                    |
| --------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `docs/curriculum-sources.md`            | working copy `c53220957d22` | §"Science Olympiad Division B 2027 research — 2026-09-19" (source of truth) |
| `docs/PROGRESS.md`                      | working copy `535cd60747a7` | 2026-10-10 approval entries                                                 |
| `docs/development-expansion-plan.md`    | working copy `58ba797ebe70` | `SCI-REVIEW` row; assessed-track gating rule                                |
| `src/contracts/content.ts`              | `5a047b27abc0`              | Validator, figure, provenance, review contracts                             |
| `src/contracts/progression.ts`          | `14ec51e9df27`              | Program, role-discriminated content, versioned skill                        |
| `src/content/catalog.ts`                | `c560d0e1da3e`              | Catalog invariants and per-program validators                               |
| `src/curriculum/program-registry.ts`    | `98eb5f47f593`              | Existing placeholder program                                                |
| `src/content/answer-matching.ts`        | at `HEAD`                   | `normalizeAnswer`, `matchesAcceptedAnswer`                                  |
| `src/curriculum/progression-catalog.ts` | at `HEAD`                   | Item-to-skill version pinning                                               |

Also read: `AGENTS.md`, `README.md`, `docs/02-curriculum-and-pedagogy.md`,
`docs/03-system-architecture.md`, `docs/05-data-and-student-model.md`,
`docs/curriculum-authoring-playbook.md`, `docs/content-authoring-pipeline.md`,
`docs/content-review.md`, `docs/curriculum-agents.md`,
`docs/agent-orchestration.md`, `docs/course-progression-decisions.md` (`D-61`).

## 3. Recorded authority (no new claims)

| Fact                                                  | Authority                                                                | Status                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| Olympiad research/sources approved                    | Owner, 2026-10-10: "science and science olympiad are good to go as well" | Approved, research/sources only |
| Event subset, safety/supervision, season versioning   | Dossier decisions 1, 3, 4                                                | **Not approved**                |
| Independent review of the 2026-09-19 Olympiad dossier | None in the current batch                                                | **Absent — do not claim**       |
| `D-61` authoring pause                                | `docs/course-progression-decisions.md`                                   | **In force**; no lift recorded  |
| California integrated Grade 6 school Science          | Separate dossier and review                                              | Separate program; not an input  |

The Olympiad source section is unchanged by this packet. Comprehensive
independent source review of that dossier section is missing and remains a
**separate gate** (`G-0`, §11) that this specification and its review do not
satisfy: either that review completes or the owner records a dated
risk-acceptance of its absence before drafting.

## 4. Program framing (inherited, not owner choices)

- **Separate from school Science.** `science-olympiad-division-b` and
  `grade-6-science` remain distinct program codes with isolated skill graphs;
  `validateProgramSkillInvariants` already rejects cross-program
  prerequisites. No Olympiad skill may cite or depend on a school-Science
  skill, and no school-Science coverage may be inferred from Olympiad work.
- **Division B is Grades 6-9, team-only.** The product is individual study
  that supports a learner's school team. No copy, label, parent report or
  progress state may imply an individual competition pathway, event
  qualification, team selection, or Regional/State/National readiness.
- **No endorsement.** No claim of Science Olympiad endorsement, official
  rule coverage, or 2027 topic coverage (§6).
- **Original content only**, `provenance.origin` `original` or
  `llm_drafted`; `licensed` is rejected by the catalog today and no licence
  exists.

## 5. Season/version contract — engineering recommendation

This is one exact recommendation for integration. It is **not** an owner
decision and is not applied; it requires approval by the integration owner,
and by the product owner where it changes product meaning. The dossier's
`scioly-b-2027` / `sob27-` proposal is recorded as the alternative; adopting
either needs explicit approval, never a silent change.

| Attribute                 | Repository today                                                               | Dossier proposal         | Recommended contract                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Program code              | `science-olympiad-division-b`                                                  | `scioly-b-2027`          | Keep `science-olympiad-division-b`                                                                                                                                 |
| Program version/available | `1.0.0`, `available: false`                                                    | season-versioned program | `available: false` unchanged; the integration change that sets prefix/domains bumps the program version to `1.1.0`                                                 |
| Skill-code prefix         | `null`                                                                         | `sob27-`                 | Stable `sob-` (satisfies `^[a-z0-9]+-$`); no season digits in skill codes                                                                                          |
| Season marker             | none                                                                           | in prefix                | Exactly one repo standard code per skill and item matching `^SOB27-(LPS\|ESS\|PSC\|TE\|INQ)-\d{2}$`, unique within its season                                      |
| Skill version             | n/a                                                                            | n/a                      | Explicit `version: "1.0.0"` on every `sob-` skill; items pin `skillRef.version` to it (already enforced when set)                                                  |
| Season rollover           | n/a                                                                            | new program              | Next season replaces the `SOB27-` code with `SOB28-` and bumps the skill major version only if its meaning changed; retired-event skills are withheld, not deleted |
| Domains                   | none in `CurriculumDomainSchema`                                               | five categories          | Add `sob-` domains only for approved categories (first scope: `sob-life-personal-social`)                                                                          |
| `subjectKind`             | `enrichment-non-graded`                                                        | not stated               | Unchanged; `subjectKind` has no runtime consumer outside the registry and contracts                                                                                |
| Policies                  | `science-olympiad-division-b-access`/`-default` `1.0.0` (same as Spelling Bee) | —                        | Inherited unchanged                                                                                                                                                |

Rationale: a stable code avoids duplicate registration (forbidden by the
expansion plan), keeps the existing `PROGRAM_CODES`/registry/policy/test
set intact, and preserves learner mastery history when overlapping concepts
recur next season. The `SOB27-` standard code makes the season explicit and
machine-checkable without encoding it in identity.

Required tests for the contract: registry parse with the new prefix; an
unprefixed Olympiad fixture is rejected; every `sob-` skill and item carries
exactly one current-season `SOB27-` code with an approved category; item
`skillRef.version` equals the skill version; registry still equals
`PROGRAM_CODES`.

### 5.1 Source-register test blocker — closed as stale

Revision 1 flagged that `tests/app/curriculum-sources.test.ts` expected the
Olympiad dossier slug to be `pending`. The main checkout's working copy of
that test now asserts `science-olympiad-division-b-2027-research` is
`approved`, matching the register status. That change is uncommitted in the
main checkout and absent from this worktree; it was not run here. No blocker
remains for this specification.

## 6. Season pinning and staleness

- The governing season is 2027 (2026-2027 year). The event slate and public
  short descriptions were retrieved 2026-09-19.
- **Within-event 2027 topics are unknown to this repository.** The 2027 rules
  manual is email-gated and was not read or reproduced. Skills target durable
  underlying science consistent with the public short descriptions, not a
  claimed 2027 topic list.
- The newest standards signal is the **2026** Division B NGSS alignment,
  updated 2025-10-07. It is historical relative to 2027. Any NGSS code on a
  skill must be verified by the author against that document, labelled as
  cited from the 2026 alignment, and never described as a 2027 alignment.
- Preserve each artifact's own date (General Rules V. 2025, Eye Protection
  2015-07-29, Building and Tools Policy 1986) and never relabel it 2027.
- **Annual pin/topic review (`P-SEASON`).** Before each season's drafting and
  each September: revalidate the slate against multiple current official
  artifacts (the canonical page was observed stale) and confirm each selected
  event is still on the slate. Retrieval is a new research task, not part of
  this packet.

## 7. Recommended first scope (minimal owner choice)

The owner has **not** selected the dossier's 6-8 event list; this packet does
not treat it as selected.

**Owner choice O-1: approve, revise or reject "Heredity, study concepts only,
text-only closed-answer core practice" as the first packet.** Disease
Detectives is the recommended second event once O-1 succeeds.

| Event (2027 slate, public description) | Why                                                                                                   | Explicitly excluded                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Heredity (first)                       | Supplied-evidence reasoning (crosses, ratios, inheritance patterns) with closed answers; no equipment | 2027-specific topic claims; lab or specimen work                          |
| Disease Detectives (next)              | Original fictional tabular data reasoning (rates, comparisons); closed numeric answers                | Real outbreak cases; medical advice; identifiable or personal health data |

Remaining dossier candidates (Anatomy and Physiology, Botany, Meteorology,
Rocks and Minerals, Solar System, Dynamic Planet) are later expansion
requiring a separate choice; Rocks and Minerals depends on physical-specimen
work online items cannot represent. Build, lab, hybrid and
team-communication/inquiry events — including Boomilever, Elastic Launched
Gliders, Roller Coaster, Scrambler, Hovercraft, Ping-Pong Parachute, Circuit
Lab, Crime Busters, Food Science, Water Quality, Thermodynamics, Write It Do
It, Experimental Design and Codebusters — and Remote Sensing are
**deferred**. These groupings are a product-side classification, not an
official typology. Dossier decision 3 is unapproved, so deferral is the
conservative default, not a recorded decision.

## 8. What online study can and cannot evidence

| Can be assessed deterministically (existing validators)                     | Cannot be claimed from this product                                                     |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Computing a probability, ratio, percent or rate from supplied original data | Laboratory technique, safety practice, or eye-protection compliance                     |
| Identifying an inheritance pattern from a closed, stated set of options     | Build/engineering skill, device performance or construction ability                     |
| Naming one fixed term from a closed vocabulary stated in the prompt         | Team communication, collaboration or partner-event performance                          |
| Selecting the one supported conclusion from a closed, stated set            | Explanations, free-text reasoning, or any multi-clause answer                           |
|                                                                             | Speed under official conditions; tournament readiness or rank; 2027 rule/topic coverage |

Mastery evidence follows the existing model: deterministic correctness from
versioned records, assistance level, context, and delayed independent
evidence (`docs/05-data-and-student-model.md`). **No LLM or tutor judgment is
authoritative evidence** and no model output may grade, repair or accept an
answer. Parent-facing statements say "practised/demonstrated underlying
science concepts", traceable to attempts — never "event ready".

## 9. Reuse of existing contracts and exact gaps

### 9.1 Reused unchanged

- `ProgramSchema` with `progressionMode: 'skill-graph-only'`, `unitRefs: []`.
- `SkillSchema` fields; `standards` strings ≤ 40 characters fit `SOB27-` codes.
- `PracticeContentItemSchema` (`role: 'practice'`), `mode: 'core'`,
  `provenance`, `review: pending_review`, `hintSteps`,
  `forbiddenLeakagePatterns`, `accessibilityNotes`, `accessibleAlternative`,
  `itemReadinessRefs`.
- `DeterministicValidatorSchema` types `numeric`, `ratio`, `percent`, `text`
  graded by the whole-string branch of `matchesAcceptedAnswer`
  (exact equality after `normalizeAnswer`).
- Access policy `science-olympiad-division-b-access@1.0.0` (grants
  `PRACTICE`, `PLACEMENT`, `REVIEW`; denies lesson/unit assessment and delayed
  check) and profile `science-olympiad-division-b-default@1.0.0`.
- `publishableContentProjection`: excludes pending and assessment/review
  records from the public site.

### 9.2 Gaps and prerequisite rules

| ID        | Gap (observed in code)                                                                                                                                                                                                                                                                                                                                                                     | Prerequisite                                                                                                                                                                                                                                                                                                                                                                                | Required tests                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G-ID`    | Program `skillCodePrefix: null`; no Olympiad domains                                                                                                                                                                                                                                                                                                                                       | Apply the §5 contract once approved                                                                                                                                                                                                                                                                                                                                                         | §5 contract tests                                                                                                                                                                                         |
| `G-MATCH` | `composite.parts` accepts a response when each part's phrase appears **anywhere as a substring**, in any order: "not dominant" contains "dominant"; an answer listing every option contains every part. Unsafe for compound answers.                                                                                                                                                       | Program rule: Olympiad items **must not** use `composite` or `parts`, and must not use `multiple_choice` (choices live only in the forbidden `contestFormat`). Allowed: `numeric`/`ratio`/`percent` with every equivalent form enumerated, and `text` whose accepted answers are a single term from a closed set stated in the prompt. Any matcher change is a separate reviewed increment. | Catalog test: Olympiad item with `composite`, `parts` or `multiple_choice` throws. Per-item fixtures: negated, opposite, multi-option and padded responses rejected; enumerated equivalent forms accepted |
| `G-FMT`   | `ContestFormatSchema` has no Olympiad format and would otherwise demand five A-E choices and point values                                                                                                                                                                                                                                                                                  | Program rule: Olympiad items carry no `contestFormat`                                                                                                                                                                                                                                                                                                                                       | Catalog test: Olympiad item with `contestFormat` throws                                                                                                                                                   |
| `G-DATA`  | No structured data-table field; prompt ≤ 2000, alternative ≤ 1000, SVG ≤ 12000 characters                                                                                                                                                                                                                                                                                                  | First packet: text-only, **no figures**; every value needed to answer is in prompt text; `accessibleAlternative` restates it completely. A structured table field is a later reviewed schema change                                                                                                                                                                                         | Catalog test: Olympiad item with `figure` throws in the first packet                                                                                                                                      |
| `G-SAFE`  | No program-level guard against procedural/safety content                                                                                                                                                                                                                                                                                                                                   | Rule plus review item: no procedures, quantities-for-use, tools, chemicals, build/launch steps, dimensions or materials; fictional populations only; no medical advice                                                                                                                                                                                                                      | Denylist-pattern fixture test as backstop (human review authoritative); tutor eval case refusing procedural requests                                                                                      |
| `G-REV`   | `docs/content-review.md` checklist is mathematics-specific                                                                                                                                                                                                                                                                                                                                 | Science items: scientific accuracy, internal data consistency, fictional-data labelling, safety exclusions, originality, season/NGSS labelling, closed-answer check                                                                                                                                                                                                                         | Documentation; reviewer records each item                                                                                                                                                                 |
| `G-COUNT` | Actual rule in `validateParsedContentCatalog`: a skill with **zero** records fails; if a skill has no role-specific records it needs exactly two legacy records; with one or more role-specific records there is **no exact count** (one, two or three practice records all pass). Tests hard-code totals (`tests/content/catalog.test.ts` 128 items, 0 pending; per-program skill counts) | Choose per-skill record count as an authoring decision, not an invariant; update hard-coded totals deliberately with the increment                                                                                                                                                                                                                                                          | Each `sob-` skill has ≥ 1 role-specific practice record; zero-record fixture fails; updated totals                                                                                                        |
| `G-NEG`   | No Olympiad-specific negative tests                                                                                                                                                                                                                                                                                                                                                        | Isolation and claim guards                                                                                                                                                                                                                                                                                                                                                                  | No prerequisite into `grade-6-science`; no readiness/qualification/endorsement wording in skill/item text (fixture lint)                                                                                  |
| `G-PUB`   | At `HEAD`, skill records have no review status and `buildBody` renders skills for any program that has them, even `available: false`                                                                                                                                                                                                                                                       | Public projection must withhold unavailable programs and unreviewed exact skill-version content. The parent reports an implementation (available program + reviewed exact-skill-version content, hidden metadata/counts; 33 tests passing) awaiting judge; it is **not in this worktree and not verified here**                                                                             | Accepted judge review of that change; until then Olympiad drafts stay off `main`                                                                                                                          |
| `G-A11Y`  | `accessibleAlternative` is not sent by `src/phase1/service.ts` or rendered by any `src/app` component; site renders only `altText`                                                                                                                                                                                                                                                         | Release-time: deliver and render it on the learner surface (and site if published). Not needed for a text-only draft                                                                                                                                                                                                                                                                        | Service payload test; component/Playwright visibility and keyboard/screen-reader checks; axe                                                                                                              |

Teaching, assessment and review roles are not in the first packet: the live
catalog rejects non-practice records, the access policy denies assessment
kinds, and assessment items (`D-01` Branch B) never belong in public
`content/`.

## 10. Minimal first packet (preconditions only)

No exercises, prompts, answers or JSON. Shape only, for O-1 as recommended.

| Element           | Specification                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope             | Heredity only; 2-3 skills at Grade 6 Math granularity; acyclic; prerequisites by conceptual dependency within the program                                     |
| Skill areas       | e.g. probability of a single-trait cross from supplied parents; inheritance pattern from supplied evidence chosen from a stated closed set                    |
| Role / mode       | `practice` / `core` only; `contest` deferred to a later reviewed packet                                                                                       |
| Records per skill | One or two (authoring choice; ≥ 1 required)                                                                                                                   |
| Presentation      | Text only, no figures; all data in prompt; complete `accessibleAlternative`                                                                                   |
| Validators        | `numeric`/`ratio`/`percent` (all equivalent forms enumerated) or single-term closed-set `text`; no `composite`, `parts`, `multiple_choice` or `contestFormat` |
| Hints             | Contiguous ladder; `forbiddenLeakagePatterns` include the canonical answer and its equivalents                                                                |
| Standards         | One `SOB27-LPS-NN` code; NGSS only if verified against the 2026 alignment and labelled historical                                                             |
| Provenance/review | `original` or `llm_drafted`, `licenseStatus: owned`, `review.status: pending_review`; independent re-derivation of every answer before human review           |
| Evidence          | Observable evidence names supplied-data reasoning, never event or lab performance; `masteryCheckRule` requires independent and delayed evidence               |

## 11. Gates, separated by stage

| Stage                                  | Gates                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Draft authoring (branch only)       | `G-0` comprehensive source review or dated owner risk-acceptance; dated `D-61` lift or scoped exception naming this program and scope; O-1; approved §5 contract; `P-SEASON`; `G-ID`, `G-MATCH`, `G-FMT`, `G-DATA`, `G-SAFE`, `G-NEG` rules and tests; `G-REV` checklist                 |
| B. Merge to `main`                     | Stage A; `G-COUNT` totals updated; `G-PUB` public-projection gating accepted by independent judge so pending drafts and an unavailable program publish nothing; independent content review findings resolved                                                                             |
| C. Learner release (`available: true`) | Stage B; human content approval (`review.status: reviewed`); `G-A11Y` if any figure is introduced; owner choice **O-4** (keep inherited non-assessed skill-graph contract, or assessed track requiring C4/C5, private bank and its review); accessibility, privacy and release approvals |

Owner choices are deliberately minimal: O-1 (first scope) before drafting and
O-4 (assessed or not) before release. Everything else above is inherited
engineering or an engineering recommendation awaiting approval. Dossier
decisions 2 (team-support framing) and 5 (no readiness claim) are applied as
conservative constraints; recording them as owner-approved remains the
owner's call. Decision 6 (test-packet purchase) is unnecessary.

## 12. Blockers and handoff

Blockers: `D-61` in force; comprehensive independent source review of the
Olympiad dossier missing (separate gate); O-1 unrecorded; §5 contract
unapproved; `G-PUB` change not yet accepted by its judge.

Handoff: **ready for bounded independent re-review of this revision, not for
human approval or authoring.** The coordinator records executor and reviewer
tool, actual model ID and family, and this file's hash per
`docs/agent-orchestration.md`; this document does not self-report its
executor model.
