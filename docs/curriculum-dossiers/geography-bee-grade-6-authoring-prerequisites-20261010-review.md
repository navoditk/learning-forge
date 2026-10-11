# Geography Bee authoring prerequisites — independent bounded review

**Date:** 2026-10-10. **Advisory review only; no human approval.**

## Scope and independence

Reviewed exactly
`docs/curriculum-dossiers/geography-bee-grade-6-authoring-prerequisites-20261010.md`
in worktree `authoring-prereqs-geography`, against its cited repository
artifacts and the approved Geography section of `docs/curriculum-sources.md`.

- Reviewed specification SHA-256:
  `2e47cc46dd2fd9d3860f2e60f82f1de0b385eb630eb65d4115c2b096ae0c3338`.
- Repository baseline: `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`;
  working-copy documentation is not claimed to be committed.
- Executor: Copilot task `19741f8e-22f1-4912-945c-d5438833a370`,
  actual model `claude-opus-5.5`, Claude family.
- Reviewer: Copilot task `ff96473b-d338-436b-baaa-f532cc0f8b9a`,
  actual model `gpt-6.1-sol`, GPT family, separate review context.
- Identity witnesses: coordinator-provided executor `task`/`read_agent`
  confirmation, independently corroborated by the tool's `list_agents`
  registry, which displayed both exact task IDs and model IDs. Reviewer
  selection is also corroborated by that registry, not model self-report.
  This satisfies the cross-family requirement in
  `docs/agent-orchestration.md:30-49` for this pinned specification.

Assumption: this is a prerequisites proposal, not authored curriculum or an
authorization to implement progression. Review method: check source-scope
fidelity, re-derive representability and publication behavior from code,
then separate minimum first-increment requirements from later capabilities.
Only this report is edited; `docs/PROGRESS.md` remains coordinator-owned.

**Research-review boundary:** the specification correctly states that no
independently verified comprehensive Geography research review exists.
This review checks fidelity to the cited, owner-approved dossier section;
it does not retrieve or independently certify the external primary sources.
It does not complete `GEO-REVIEW`, substitute for that review, select an
owner decision, lift D-61, or authorize authoring/publication.

## Verified findings

### F1 — The proposed “first packet” is a roadmap, not a selected first vertical increment

- **Severity:** major. **Confidence:** high.
- **Specification references:** sections 3 and 8, lines 85-106 and 205-225.
- **Rule:** `AGENTS.md` requires one issue-sized vertical increment;
  `README.md` recommends a tested vertical slice before broad expansion.
- **Evidence:** the first-packet table proposes six skills, twelve records
  and four domains, including schematic maps, a graticule, charts, physical
  systems, world regions and population concepts. “At most” bounds volume
  but does not select the actual first skill, answer task or acceptance
  path. Separate shared changes E-1 through E-7 are also involved. This is
  reasonable subsequent coverage, not evidence that all of it is necessary
  for the first increment.
- **Smallest safe remediation:** retain the table as later coverage, but
  nominate one first skill and a concrete bounded packet. For example,
  one `MAP` skill with one original core practice item and one original
  four-choice ORQE-style practice item, using a simple fictional schematic
  with complete text-equivalent data. State exactly what each item
  assesses, applicable engineering dependencies and stop criteria.
  No authored question or answer is requested in this prerequisites fix.
- **Fix expectation:** distinguish this limited recognition/visual-literacy
  sample from a 50-question exam, geographic breadth coverage, oral/buzzer
  preparation, or comprehensive competition readiness. Do not promise
  legend, scale, grid and direction coverage unless the eventual tasks
  actually elicit evidence for those distinct demands.

### F2 — The mandatory choices and engineering blocker lists contradict their own conditional scope

- **Severity:** major. **Confidence:** high.
- **Specification references:** E-5 through E-9 at lines 191-195;
  first-packet preconditions at lines 211-225; H1-H10 at lines 233-244;
  section 10 at lines 248-260; final blockers at lines 282-284.
- **Rule:** issue-sized implementation and reuse-first prerequisites;
  dossier `docs/curriculum-sources.md:1237-1250` distinguishes genuinely
  open label/mechanics/current-geography choices from established constraints.
- **Evidence:**
  - H2 retaining the identifier is already the cited handoff;
    H6's original, text-equivalent schematic-only default and H7's existing
    skill-graph-only practice mode do not require new independent product
    gates for that restricted packet.
  - E-8 explicitly says normalization is optional, and section 4 permits
    authored variants under the current exact scorer. Nevertheless the
    `WRG` row mandates E-8 and the final blocker list calls E-1 through E-8
    unimplemented blockers.
  - The same blocker list says E-6 and E-7 block **any** record, although
    E-6 is scoped to figure items. A text-only item can already carry its
    complete equivalent prompt. For a small figure, all required data may
    fit in existing learner-visible `altText` or the prompt; projection of a
    separate field is not the only valid implementation.
  - E-5 is justified for metadata-only choices, but does not acknowledge
    the lower-cost route of explicitly displaying original A-D choices in
    the prompt. Section 4 correctly permits letters only when displayed.
    A new choice-selection widget and generalized projection are not
    prerequisites if that permitted text route is selected.
  - The core-only fallback in section 8 conflicts with E-3's mandatory
    one-core/one-contest self-audit. It needs a distinct, stated scope and
    coverage assertion, not an instruction to bypass the audit.
  - H5 is deferred until volatile records, but section 12 says H1-H10 are
    unselected blockers without that qualification. E-9 also applies H5 to
    all `POL`/`ECO`, while H5 itself correctly limits it to volatile
    `POL`/`ECO`. Stable political/economic concepts do not inherently need
    expiry machinery.
- **Smallest safe remediation:** provide one dependency table for the
  selected first packet. Keep the real human choices: label, bounded
  mechanics/content scope, and explicit D-61 authorization. State exact
  authored answer variants/no extra normalization as the default; elevate
  tolerance only if requested. Reuse original visual/privacy/isolation
  constraints rather than presenting them as optional choices. Separate
  future real-geometry sources, volatile content policy, assessed tracks
  and general UI capabilities from first-packet gates.
- **Fix expectation:** no normalization migration or expiry policy for
  stable items; no literal assertion that every E/H item blocks every
  record. Preserve D-61, independent research review and human content
  approval as actual gates, not optional defaults.

### F3 — Draft skill publication protection is identified but not made an executable prerequisite

- **Severity:** major. **Confidence:** high.
- **Specification references:** E-10 at line 196, H9 at line 243,
  section 10 at lines 256-260, invariants at lines 270-278,
  final blockers at lines 282-284.
- **Rule:** D-61's publication/exposure gates and the specification's
  promise that pending content never reaches public surfaces.
- **Evidence:** `src/content/publication.ts:13-20` excludes pending
  **content records**, not skills. In
  `scripts/generate-curriculum-site.ts:170-175,189-195,200-255`, every skill
  enters the public grouping/statistics, unavailable programs with skills
  receive only a “Draft — pending human approval” badge, and the skill
  graph still renders. There is no skill review gate in
  `src/contracts/curriculum.ts`'s `SkillSchema`. E-10 accurately notices
  this, but requires gating only “if” the owner chooses it and is omitted
  from section 12's engineering blockers. H9 alone is not executable
  protection. Availability false protects learner selection
  (`src/phase1/program.ts:6-10`), not public graph publication.
- **Smallest safe remediation:** make draft skill protection a required
  pre-merge acceptance condition for the first skill import. Either
  exclude the unavailable program's unapproved skills from public
  sections, navigation and counts, or specify a separately approved,
  explicit skill-publication allowlist. A badge must not stand in for
  approval. Keep pending practice records excluded independently.
- **Fix expectation:** add synthetic site/projection tests proving that
  an unavailable Geography draft skill is absent from the public graph,
  navigation and “standards covered” count; existing approved programs
  remain unchanged. If individually approved skills may publish before
  their practice records, define that explicit approval boundary rather
  than blanket publication of all draft skills.

### F4 — The pending-review first packet cannot pass the cited self-audit pattern unchanged

- **Severity:** major. **Confidence:** high.
- **Specification references:** E-3 at line 189; pending-record
  instruction at lines 224-226; authoring gate at lines 261-267.
- **Rule:** behavior changes require tests while pending-review exclusion
  and human approval remain intact.
- **Evidence:** `tests/content/catalog.test.ts:37-51` hard-codes 128 total
  records, 128 reviewed records and zero pending records. Importing even
  one correctly pending Geography practice record invalidates those
  assertions. The MATHCOUNTS self-audit at lines 445-479, proposed as the
  mirror, requires reviewed status, a named historical owner/date and
  presence in `servableContentCatalog`. Those checks cannot be copied to
  the initial unavailable, pending Geography packet.
- **Smallest safe remediation:** include the directly related regression
  updates in E-3: keep a baseline assertion for the already approved
  programs, audit the new packet's exact selected count and
  `pending_review` status, and explicitly assert its absence from
  servable/public content. Do not mark Geography reviewed to satisfy
  existing tests. Mirroring the subject-accuracy/coverage pattern does
  not mean copying release-state assertions.
- **Fix expectation:** the pending first packet can pass
  `npm run content:validate` while existing reviewed records retain their
  approval/date assertions. Also use production registry validation for
  negative prefix/cross-program fixtures; the named
  `tests/progression/cross-program-fixtures.test.ts:7-24` currently only
  contains positive available-program checks, not the unavailable-program
  rejection pattern described by E-1.

### F5 — ORQE format representability must distinguish exam metadata from one practice item

- **Severity:** minor. **Confidence:** high.
- **Specification references:** stage table at lines 75-80, E-4 at
  line 190, first-packet conditions at lines 211-222.
- **Rule:** faithful dossier scope and minimum necessary contracts.
- **Evidence:** `src/contracts/content.ts:86-168` indeed lacks an ORQE
  format and fixes choices to five unique A-E labels, so an actual
  four-choice ORQE item is not currently representable in that choice
  contract. However `questionCount` and `timeLimitMinutes` are optional,
  whole-round metadata; the maximum 40 blocks recording the source
  exam's 50-question metadata, not authoring a single original practice
  question. `mode: "contest"` neither creates a timed exam nor establishes
  that the learner sees choices. E-4 bundles all these capabilities as
  one first-item prerequisite.
- **Smallest safe remediation:** separately name the required item shape
  (distinct ORQE format, four unique A-D choices) and optional
  source-format metadata (50 questions, 20 minutes, no penalty).
  If whole-exam metadata is included, constrain it for ORQE without
  weakening existing formats and label it explicitly as source format,
  not the current practice session's length/time.
- **Fix expectation:** tests distinguish a single-item record from a
  whole-exam claim; other five-choice/free-response formats are unchanged.
  No invented ORQE point value or qualification simulation is required
  merely to accept one deterministic closed answer.

## Verified strengths and limits

- The source register supports the stated standalone Grade 6 division,
  current naming, four-choice/50-question ORQE source format, distinct
  Regional and National stages, incomplete archives and non-syllabus
  distribution. The proposal retains internal identity/prefix, labels
  standards as Learning Forge synthesis, and makes no new external
  factual claim necessary for this review.
- Deferring buzzer, playoffs, current events and real-place geometry is a
  faithful restriction, not missing coverage for an explicitly narrow
  first packet. A real-world base-geometry source is unnecessary for
  original fictional schematics.
- The learner-choice omission is verified, not assumed:
  `src/phase1/service.ts:224-232`,
  `src/app/learner-data.ts:95-103` and
  `src/app/components/activity-panel.tsx:92-110` expose prompt/figure but
  no choice metadata or `accessibleAlternative`. Inline choices or
  complete prompt/alt text can truthfully serve a narrow first item;
  otherwise the identified shared projection work is required.
- Answer acceptance is deterministic at both callers
  (`src/phase1/service.ts:95`,
  `src/progression/assessment-submission.ts:72`).
  `src/content/answer-matching.ts:19-26,43-58` corroborates the documented
  normalization limits and substring risk. Explicit accepted variants,
  no composite `parts` for place-name answers, and no global relaxation
  of Spelling Bee orthography are sound defaults.
- Static SVG bounds are correctly cited
  (`src/contracts/content.ts:183-209`). Full text equivalence must be
  verified on the eventual item, not merely inferred from presence of
  alt text. Extending literal leakage scans is additional defense, not
  proof of equivalence or non-leakage: correctly displayed choices and
  necessary map data may include answer terms without revealing which
  answer is correct.
- No LLM scoring/mastery authority, copied IAC questions/clue order or
  visuals, adjacent-program merging, child-location collection or extra
  child-profile transmission is authorized. These are invariant
  constraints, not owner-selectable exceptions.

## Validation and follow-up

- Specification SHA-256 verified with `shasum -a 256`; matches the supplied
  full hash. Rechecked after report creation.
- Report-only Prettier check:
  `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null /Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/authoring-prereqs-geography/docs/curriculum-dossiers/geography-bee-grade-6-authoring-prerequisites-20261010-review.md`
  — passed.
- Report-only whitespace check: `git diff --no-index --check /dev/null`
  against the absolute report path — passed with no diagnostics
  (exit 1 is the expected no-index new-file difference status).
- No behavior changed; unit, integration, browser, build, provider and
  database checks were not run. No external research, private question
  bank access, provider calls, dependency installation or commits.
- Next issue: correct this one specification's first-packet selection,
  conditional dependency matrix, draft publication and pending-test
  requirements; review the changed hash before human acceptance.
  Comprehensive `GEO-REVIEW` remains a separate prerequisite before
  authoring; no source approval or D-61 exception is inferred.

This verdict concerns the proposal's inconsistent scope and prerequisites,
not the mere absence of future implementation or the correctly disclosed
research-review gap. A corrected proposal can become ready for human review
while authoring and release remain separately gated.

**Recommendation: not ready for human review.**

## Revision 2 — bounded changed-scope re-review

**Date:** 2026-10-10. This section supersedes the recommendation above for
revision 2 only. The original findings remain the historical review of
revision 1; they are not claims about the corrected revision.

- Revision 1 SHA-256:
  `2e47cc46dd2fd9d3860f2e60f82f1de0b385eb630eb65d4115c2b096ae0c3338`.
- Revision 2 SHA-256:
  `80085c76169b271c89ec3c3b494f667afe24331c3a7356a38f73831474f71275`.
- Same specification path and worktree; same reviewer task and
  cross-family identity witnesses recorded above.
- Scope: corrected F1-F5 requirements only. No external source research,
  runtime implementation review, authored-item review or new delegation.
  Only this report is modified.

### Finding disposition

| Finding                             | Disposition                                                           | Revision 2 evidence and remaining acceptance boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 — unselected first increment     | Resolved in the specification                                         | Section 8, lines 226-260, selects exactly one `igb6-map-direction-reading` skill and two practice records: core free response and four-choice ORQE-style practice. It assesses only cardinal/intermediate direction between labeled features on an original fictional schematic with a compass rose. Legend, scale, grid, coordinates, real-world knowledge, exam timing and competition readiness are explicitly not claimed. The larger domain table is now a later roadmap.                                            |
| F2 — inflated and conflicting gates | Resolved in the specification                                         | Section 7 separates P first-draft requirements, R pre-availability checks and X later capabilities. Section 9 reduces first-slice owner choices to label, bounded scope and explicit D-61 authorization. Existing identity, original visuals, exact variants and skill-graph practice are defaults. The core-only fallback changes P5's exact count and does not need P3. No normalization, generalized choice widget, separate alternative-field projection or stable-item expiry machinery is mandatory for this slice. |
| F3 — draft skill publication        | Resolved as a prerequisite contract; implementation evidence separate | P4 requires available program plus reviewed publishable content for the exact skill version, and excludes hidden skills from navigation, counts and prerequisite names/counts. A badge is not approval; earlier publication requires a separately approved allowlist. P4 remains an executable pre-merge gate rather than an optional owner preference.                                                                                                                                                                   |
| F4 — pending-aware tests            | Resolved in the specification                                         | P5 preserves the already approved programs' baseline and review/date assertions while auditing Geography's selected IDs, roles, modes, pending status and exclusion from servable/public content. P1 explicitly adds production-validator negative prefix and cross-program fixtures instead of claiming the positive-only existing fixture already supplies them. Pending Geography records must not be marked reviewed to satisfy the suite.                                                                            |
| F5 — one item versus exam metadata  | Resolved in the specification                                         | P3 requires a distinct ORQE format and exactly four unique A-D choices, canonical answer among choices and distractor rationale/misconception validation. It removes the invented mandatory ORQE point value. P3m separately makes 50-question/20-minute/no-penalty source-format metadata optional and constrains it if adopted, without describing a one-item practice session as a whole exam or weakening existing formats.                                                                                           |

### First-slice answer and accessibility assessment

Section 8 specifies genuinely closed responses: the core item uses a
deterministic direction-answer validator with explicit full-word,
hyphen/space and abbreviation variants and no composite `parts`; the
contest item accepts only its displayed letter or choice text. Inline A-D
choices address the previously verified metadata omission without requiring
a general choice-selection widget. R2 still requires a browser/accessibility
check before availability.

A simple fictional diagram can express all needed positions in the existing
prompt or alt text within current bounds. Authored text should describe
position data, not announce the requested direction. That is feasible
without expanding renderer/schema limits, but this prerequisites review
does not certify an as-yet unwritten figure, compass orientation, answer,
hint ladder or text equivalent. Those checks remain part of independent
content review. Stop criteria explicitly prohibit scope expansion or
answer-revealing substitutes when equivalence cannot be achieved.

The opening words “What it is not: a recognition/visual-literacy sample
only” at line 258 are editorially awkward; the surrounding exclusions and
selected task clearly establish that it **is only** that narrow sample.
This is not a substantive readiness defect.

### Evidence boundaries and remaining gates

The coordinator reports that the shared public gate has now been implemented
outside this worker baseline, independently judged by Opus as ready for
human review, with 76 tests plus typecheck, lint and site generation passing.
This is **reported parent evidence**, not a worker-executed validation or
review of that implementation. Revision 2's P4/section 12 “unjudged”
description is a snapshot of this worktree, not the current coordinator
state. The coordinator should retain the exact implementation revision and
review evidence when claiming P4 satisfied; this bounded re-review does not
supplant that judgment.

No comprehensive independent Geography source-research review is established
by either version of this report. `GEO-REVIEW`, human specification
acceptance, applicable P implementation/review, explicit D-61 authorization,
independent content review, human content approval and pre-availability
checks remain separately required. Their future completion is not a defect
in a prerequisites proposal and does not prevent human review of this
corrected specification.

### Re-review validation

- Revision 2 full SHA-256 verified against the supplied hash; unchanged
  after report update.
- Same absolute report-only Prettier command recorded above — passed.
- Same report-only whitespace check — passed with no diagnostics.
- No code, specification, source, progress-log, database, provider or
  policy edits; no dependency installation, agents, external research or
  commits. No new runtime/unit/browser/build tests were run for this
  documentation-only re-review.
- Next issue: human review of this pinned corrected proposal, followed by
  the separately scoped comprehensive `GEO-REVIEW` and applicable shared
  prerequisites before authorized content drafting.

**Revision 2 recommendation: ready for human review with noted risks.**
This is not human approval, authoring authorization or release approval.
