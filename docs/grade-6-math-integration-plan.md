# Grade 6 Math curriculum integration plan

**Planning scope approved by the owner on 2026-10-11:** reconcile existing
Grade 6 Math work toward one comprehensive curriculum. This plan authorizes
no content drafting, candidate promotion, private-package access, policy
change, catalog activation, migration or release. Each execution increment
needs its own packet and the applicable approvals.

## Objective and boundary

One versioned `grade-6-math` course, covering the approved California Grade 6
standards across Ratios, Number System, Expressions and Equations, Geometry,
and Statistics. Use one reviewed standards-to-skill-to-unit/lesson map with
distinct teaching, practice, assessment and review roles. Do not keep competing
live v1/v2 curricula or rebuild material already available.

"Comprehensive" means demonstrated coverage of the approved dossier's
competencies, not a count of records, bank items or standard tags. The
29-code dossier inventory is a coverage checklist, not evidence of coverage.
No IUSD pacing alignment or official competition coverage is claimed.
Dedicated enrichment programs retain separate identities and evidence.

Keep curriculum, pedagogical policy, learner state, assessment evidence and
provider interfaces separate. Existing reviewed policy/authorization behavior
is preserved until a separately approved change. Completion is not mastery;
drafting, content approval, integration and learner release are separate.

## Inputs and verified planning inventory

Checkpoint: main `3e7c333`, plus the preserved uncommitted lifecycle handoffs.
Execution must pin current inputs again; this is not a frozen runtime baseline.
Private artifacts were not accessed during planning.

| Input                                                                                                              | Observed state                                                                                                                       | Required disposition                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/curriculum-sources.md`, "Candidate Grade 6 Math v2 research — 2026-09-15"                                    | Human-approved isolated candidate scope, including `6.NS.C.8` and `6.EE.B.6`; separate production decision required                  | Governing standards/source boundary; no new source research silently                                                                                                              |
| `content/skills/`, `src/curriculum/catalog.ts`, `src/content/catalog.ts`                                           | 27 Grade 6 skill JSON records; current production catalog, not the older frozen experimental baseline                                | Inventory exact loaded practice records, versions, review states, standards and known defects                                                                                     |
| `src/curriculum/pilot-catalog.ts`, `course-catalog.ts`, `program-registry.ts`                                      | Shared course catalog registers the original three-lesson Ratios unit; teaching refs are empty                                       | Preserve existing identities, evidence references, bank pins and compatibility policy                                                                                             |
| `ratios-extension-catalog.ts`                                                                                      | Two additional Ratios lessons wrapping existing practice; not wired into the shared course catalog                                   | Review and reconcile into the existing Ratios unit, not a duplicate unit                                                                                                          |
| `number-system-catalog.ts`, `expressions-and-equations-catalog.ts`, `geometry-catalog.ts`, `statistics-catalog.ts` | Standalone domain Unit/Lesson wrappers; not imported by production `COURSE_CATALOG`                                                  | Verify refs/hashes/order/review authority against current files; retain reusable structure without assuming activation readiness                                                  |
| `experiments/grade-6-math-v2/`                                                                                     | 24 candidate skills and 48 content records; all candidate items `pending_review`; runtime does not import them                       | Compare exact latest bytes with current production, including renamed/merged skills and recent revisions; no wholesale promotion by assumption                                    |
| D-148 private drafts                                                                                               | Recorded 296 items: 24 full lesson banks, four full unit banks and one partial Ratios supplement                                     | Recover through authorized private review; verify actual files, generation provenance, identity/version mapping, structural diversity and review status                           |
| Existing private pilot banks                                                                                       | Repository holds metadata/pins, not the package; old package handoff and recent D-73/D-148 chronology describe different checkpoints | Verify current reviewed package under explicit access scope; preserve original pilot and skill-bank coverage, merge Ratios supplement deliberately and re-pin only after approval |

The candidate README/review handoff and authoring playbooks contain historical
counts/status assumptions. The initial reconciliation must distinguish those
from current code and record contradictions. In particular, the experimental
baseline captured 22 skills; current Grade 6 has 27; candidate has 24. These
are different skill decompositions, not interchangeable IDs.

Primary supporting inputs:

- `docs/curriculum-experiments/grade-6-math-v2/baseline.md` and
  `comparison-rubric.md`: preserve the registered comparison rubric and
  distinguish original frozen baseline comparison from current production.
- `experiments/grade-6-math-v2/standards-to-skill-matrix.md`,
  `prerequisite-justifications.md`, `misconception-glossary.md`, `validate.ts`
  and the dated candidate review/correction records.
- `docs/course-progression-decisions.md`: authoritative D-01/D-02, D-61,
  D-73/D-148 and all consumed policy/content choices.
- `docs/content-review.md`, `curriculum-authoring-playbook.md`,
  `content-authoring-pipeline.md`, `teaching-delivery-exposure-contract.md`
  and `course-progression-review/manual-gate-record.md`.
- `docs/course-progression-review/private-assessment-package-handoff.md`:
  historical requirements, not proof of current package contents.

## Ordered increments and client relay

Finish the current `LIFECYCLE-L2A-DESIGN` review boundary first. Do not
interrupt its owner or combine its acceptance with curriculum approval.
Then request the bounded MATH6 reconciliation packet below before further
optional breadth work. The full L2/L3 runtime is not a universal prerequisite
for a document inventory or separately authorized isolated content drafts.
Runtime features required by a chosen release remain release dependencies.

| Increment       | Deliverable and stop                                                                                                                                                                                         | Executor -> reviewer                                                      | Gate                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| MATH6-RECONCILE | Frozen current-artifact inventory, complete standards/role coverage matrix, v1/v2 crosswalk, exact retain/replace/merge/defer recommendations and a first-unit scope; no content/code edits                  | Claude Code `forge-expert` / Opus -> Codex `forge-reviewer` / GPT-6.1 Sol | Approve a document-only packet; private access is not implied                                                                 |
| MATH6-DECIDE    | Owner accepts or amends crosswalk, target course structure, first-unit scope and any candidate reuse; record consumed decisions and missing authoring/store/volume permissions                               | Named documentation integrator                                            | Independent reconciliation review first; recommendations never become approved by being written here                          |
| MATH6-CONTENT   | One approved unit at a time: reuse approved items, correct specifically authorized defects, draft only missing teaching/practice/review/assessment coverage; preserve role-specific contracts and provenance | Claude Opus authoring -> Codex GPT-6.1 Sol review -> human content owner  | Exact skills/roles/volumes/store and scoped D-61 authorization; D-148 is draft-only and not a general exception               |
| MATH6-PACKAGE   | Reconcile approved private banks, item exclusions, pilot/Ratios merge, identities/versions and final digests; no held-out content enters public Git                                                          | Named private-package integrator -> cross-family review                   | Explicit private access/write scope and human content approval; reviewed store/manifest/history contracts                     |
| MATH6-INTEGRATE | Sonnet applies one accepted unit's records/refs, catalog/registry wiring and directly related tests; retain historical resolvability and untouched programs                                                  | Claude Sonnet -> Codex GPT-6.1 Sol                                        | Approved frozen content/structure/package inputs and required runtime contracts; no activation inferred from tests            |
| MATH6-RELEASE   | Synthetic journeys, shadow/readiness evidence and human accessibility/privacy/release review; staged activation of that unit                                                                                 | Named release integrator                                                  | Applicable C4/C5, teaching writer/exposure, lifecycle, content and manual gates; explicit production/deployment authorization |
| MATH6-EXPAND    | Repeat the accepted unit-sized process across all remaining approved domains and close the full coverage matrix                                                                                              | Same role sequence                                                        | Each unit has its own scope and evidence; no fleet or entire-course drafting from this plan                                   |

Use existing material before generating replacements. The preferred first unit
is the existing Ratios course plus its disconnected extension, **a recommendation
for the reconciliation to test**, not a selected authoring scope. The owner
may choose a different unit after reviewing evidence.

## First packet to request: MATH6-RECONCILE

Proposed document-only output: `docs/grade-6-math-reconciliation.md`, plus a
frozen review handoff managed by the integrator. No new curriculum records,
private file reads, imports, bank pins or learner-state queries.

The approved packet must name current baseline/input hashes, actual author
model, owned paths, reviewers and stop conditions. Opus should:

1. Inventory current loaded skills/practice, the candidate and disconnected
   Unit/Lesson wrappers. Pin files and reconcile all conflicting historical
   summaries without rewriting frozen experiments or approval records.
2. Build a crosswalk for every current and candidate skill/version:
   retain, rename, split, merge, replace or defer, with conceptual rationale,
   standard/objective evidence and disposition of referenced content.
   Identify evidence/history effects; never silently remap old attempts.
3. Map every required standard and subcompetency to proposed lessons and
   observable content tasks. Distinguish missing coverage, narrow repetitive
   items, wrong-grade scope and superficial standard tags. Track teaching,
   practice, lesson/unit assessment, placement, delayed-check and review
   readiness separately wherever approved policy requires them.
4. Review candidate defect/correction chronology and current validator
   semantics, including composite-response false accepts. Earlier green
   schema/grader checks are evidence to inspect, not proof of pedagogy,
   general scorer soundness, originality or standards completeness.
5. Reference private drafts by their approved metadata only. List the
   separately authorized private review required to verify actual items,
   non-reuse coverage and assessment independence from public practice,
   worked examples, hints and provider context. Do not publish prompts,
   answers, private paths or private-package contents in this report.
6. Propose the minimum missing-content increments and first-unit scope,
   with source/review status, required D-61 exceptions, approved versus open
   policy decisions, role schemas, volume decisions and implementation
   dependencies. No new pedagogical numbers or silent policy defaults.
7. Specify verification and migration/version compatibility acceptance
   criteria, then freeze the document/hash and stop for Codex review.

Only after independent review should the owner decide whether to retain
production, adopt specified candidate strengths, or commission a reconciled
new curriculum version. "One curriculum" permits historical versions to remain
resolvable; it does not permit erasing referenced records or making all old
evidence count against changed skills.

## Acceptance evidence for integration and completeness

The reconciliation maps these claims to existing tests or proposes named
new tests in the later approved implementation packet. Listing a desired
assertion here does not claim the assertion is already implemented.

| Claim                                | Required evidence                                                                                                                                                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standards completeness               | Matrix accounts for every approved Grade 6 standard/subcompetency across the five domains; independent subject review confirms tasks elicit the mapped evidence; any unresolved mandatory gap prevents a comprehensive claim                             |
| One coherent graph/course            | Unique code/version refs, same-program conceptual prerequisites, acyclic graph, ordered lessons, validated unit/lesson/bank refs; no parallel active v2 catalog or dangling refs                                                                         |
| Role/policy separation               | Teaching has no scoring/hints contract; assessments never become practice/instruction; numeric thresholds remain in approved versioned policy, not curriculum                                                                                            |
| Correct, diverse, accessible content | Independent re-solves, equivalent/wrong-answer tests including adversarial composites, misconception-to-value derivations, structurally distinct tasks, hint/equivalence leakage checks and text alternatives; human content approval                    |
| Safe private banks                   | Authorized package validation, reviewed provenance and identity/version/digest matching, correct per-skill coverage and no-reuse exclusions; fail closed when absent/mismatched; exclusion tests for public site, API, client, provider, logs and export |
| Historical compatibility             | Every old referenced item/skill stays resolvable; changes have explicit supersession and evidence treatment; snapshot hashes remain valid and no destructive rewrite is inferred                                                                         |
| Preserved access and UX              | Existing pilot and uncovered compatibility behavior tested; catalog wiring must not unexpectedly route new skills into gates or strand learners; cutover/flags cannot disable tenant, role or readiness enforcement                                      |
| Course release                       | Learner/parent journey and accessibility tests, shadow dispositions, human screen-reader/content/privacy review and exact manual activation approval; completion and mastery claims trace to correct evidence                                            |

Reuse tests under `tests/curriculum/` (including pilot, shared course and
domain catalogs), `tests/content/`, teaching contract tests and existing
progression/private-store/publication tests. Run `npm run verify`,
`npm run content:validate`, the candidate validator and site generation when
their surfaces change; persistence/migration work additionally uses the
documented disposable integration/migration gates. Learner-facing changes
require Playwright and tutor-adjacent changes require applicable fake evals.
No real-provider or production test follows from this plan.

## Status and next action

Plan recorded; no execution worker started. Active lifecycle review remains
the current relay. At its review boundary, request a bounded
**MATH6-RECONCILE** document-only scope, then Claude Opus -> Codex GPT-6.1 Sol.
Missing private artifacts or author/reviewer identity block their claims;
they never justify regenerating or approving content silently.
