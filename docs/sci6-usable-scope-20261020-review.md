# SCI6-USABLE scope rev1 — independent Codex review

Reviewer: `codex exec` gpt-6.1-sol, read-only sandbox, thread `01a1598e-63fd-78c1-8575-ae9f4f87d39f`; model verified `gpt-6.1-sol` from the native session trace (`turn_context`), provider openai. Run by the Claude Code integrator under D-184. Report reproduced verbatim below.

**Disposition: CHANGES_REQUESTED**

Practice-only is a justified recommendation, subject to SU-H0 approval. D-168–D-174 authorize the bounded practice content; D-182 preserves skill-graph-only registration; the live catalog rejects non-practice records. The proposal nevertheless omits a recorded release prerequisite and contains incomplete execution scopes.

Verified SHA-256 values:

| Artifact                      | Verified hash                                                      |
| ----------------------------- | ------------------------------------------------------------------ |
| `scope.rev1.md`               | `c1a1e3ce1b2c854c3778a7a8a34b2f3e6baab80cc282724ab65fd202fd45d135` |
| `input-manifest.rev1.txt`     | `a972f2eaddda55dd439ba125b688a7cec3839bb37ddfd968383dbdd61c587fb6` |
| `freeze-manifest.rev1.sha256` | `83a1e05e0b1561f69340e5917ab245e4bbdcc9814dd39a8a94aa4728279d8e3e` |

Both freeze-manifest entries and all **52 input-file pins** match. HEAD matches `059c7f6f64374e0c37359a0e06e4e93185b7f62f`. Minimal native author metadata identifies **147/147 assistant records as `claude-opus-5-5`**.

Findings follow. `scope` denotes `.git/agent-handoffs/SCI6-USABLE/scope.rev1.md`. All findings are high confidence.

**SU-R1 — Major: Science threshold disposition is missing**

- **Evidence:** `scope:108–114` treats resolving policy artifacts as sufficient; the preceding approved scope explicitly retains threshold prerequisite R2 at `.git/agent-handoffs/SCI6-FIRST-UNIT/sci6-first-unit-scope.rev1.md:255–256`. `src/phase1/service.ts:1241` passes the Science profile’s `minEstimateGate`; `src/planner/plan-next-activities.ts:89–96` uses it to stop recommending practice.
- **Failure scenario:** Activation uses the placeholder `0.75` threshold without a Science-specific disposition. Confirming an earlier skill changes whether later skills receive practice actions under the three-item budget.
- **Required change:** Add this blocker to the gap table and human batch. Identify the exact values and consumed behavior requiring disposition, preserving dormant assessment settings. Add evidence that all three skills become reachable through the accepted serialized sequence. Artifact existence and similarity to Kangaroo do not close R2.

**SU-R2 — Minor: Two prescribed test expectations contradict current behavior**

- **Evidence:** `scope:157–159`; `src/content/publication.ts:30–43`; `tests/content/publication.test.ts:14–19`; `scope:227–234`.
- **Failure scenario:** Enabling Science in the full roster returns **67 skills**, including three Science skills, rather than exactly three. Additionally, SU-E3 leaves the existing publication test’s expectation of the 64 non-Science skills unchanged.
- **Required change:** Specify either Science-filtered inputs/results or the complete 67-skill result with unchanged existing membership. Explicitly update the coupled publication assertion at lines 14–19 while retaining an injected unavailable-program negative control.

**SU-R3 — Major: SU-E4 omits required forwarding and evaluation files**

- **Evidence:** `scope:260–285`; `src/tutor/harness.ts:69–74`; `src/contracts/provider.ts:5–10`; `src/evaluation/schema.ts:55–63`; `src/evaluation/runner.ts:41–51`; `tests/evals/evals.test.ts:15`.
- **Failure scenario:** The route supplies Science framing, but the harness reconstructs model input without forwarding it. New eval cases cannot express framing through the strict existing schema, and the runner does not supply it. Adding two cases also breaks the fixed 22-case assertion.
- **Required change:** Name exact owned contract, harness, provider-input, evaluation-schema, runner and test paths. Specify forwarding and validation boundaries. Require a route → harness → mocked Anthropic request test demonstrating Science prompt/version selection and unchanged Math behavior. Replace `tests/tutor/*` with exact owned files.

**SU-R4 — Major: SU-H7’s bounded real-provider command is unsupported**

- **Evidence:** `scope:320`; `scripts/run-real-eval.ts:54–59`.
- **Failure scenario:** `npm run eval:run-real` runs the entire imported baseline. Its argument selects an output path, not a Science/Math subset. It supplies no spend-cap enforcement.
- **Required change:** Prepare and review an executable selection mechanism before requesting paid authorization. Name case IDs, adapter/template versions, maximum calls including retries, spend control and stop behavior. Keep the paid run separately gated.

**SU-R5 — Major: The evidence packets do not close the review-journey gap they identify**

- **Evidence:** `scope:97`, `scope:204–207`, `scope:235–245`; `docs/learner-presentation-design.md:122–128`.
- **Failure scenario:** SU-E3 can finish without exercising structured spaced review, while SU-E2 makes even review-queue evidence optional. The proposal could call the candidate activation-ready despite lacking evidence for its “Review later” acceptance requirement.
- **Required change:** Require a deterministic due-review service case and a browser review journey with real Science records in the synthetic household. Explicitly distinguish placement, practice/hint/check and review navigation. Include item-level feedback and refusal/retry evidence. Keep C4 enforcement testing separately scoped; production C4 remains closed.

**SU-R6 — Major: Tutor framing does not cover the recorded Science safety prerequisite**

- **Evidence:** `scope:267–280`; `.git/agent-handoffs/SCI6-FIRST-UNIT/sci6-first-unit-scope.rev1.md:257–260`; `docs/course-progression-decisions.md:1498`.
- **Failure scenario:** A correctly renamed “science tutor” suggests collecting specimens, operating a microscope or trying an experiment. The two proposed cases cover leakage and injection, without a required no-hands-on case.
- **Required change:** Carry the approved virtual/provided-data boundary into the Science prompt requirements and deterministic mocked-provider/eval cases. Cover unsolicited procedures and learner requests for prohibited activities. Preserve protected-answer handling.

**SU-R7 — Major: Release-note wording does not explicitly dispose of the visible claim risk**

- **Evidence:** `scope:49–60`, `scope:105`, `scope:322`; `src/app/parent/page.tsx:174–189`; `src/phase1/service.ts:1262`, `src/phase1/service.ts:1288–1292`; `content/skills/sci6-cell-parts-functions.json:22`; earlier scope R1 at `SCI6-FIRST-UNIT/sci6-first-unit-scope.rev1.md:252–254`.
- **Failure scenario:** A parent sees “Mastery by skill” and “Independently confirmed” after a same-item check following tutoring. Two records do not establish the broader Science competence the display may imply. The release note may never accompany that display.
- **Required change:** Present an explicit Science claim disposition covering the exact learner and parent strings and their evidence meaning. Either scope reviewed contextual wording on those surfaces or request explicit acceptance of the precisely described display limitation. Keep practice success distinct from whole-PE mastery, investigation and model construction.

**SU-R8 — Major: SU-H9 incompletely carries forward production and release permissions**

- **Evidence:** `scope:322`; `.git/agent-handoffs/PRACTICE-RELEASE/04-consolidated-human-request.md:30`, `:89`, `:101–104`; `render.yaml:20`; `docs/agent-orchestration.md:251–256`.
- **Failure scenario:** The owner confirms migration status and approves deployment, but migration 0018 remains unapplied. The build then executes migration and archive writes without an explicit disposition authorizing those operations.
- **Required change:** Give migration/archive execution its own disposition: confirmed already applied, explicitly authorized with named backup/environment, or held. Carry forward the pilot checklist’s Launch decision, last-good target, rollback evidence and concrete post-deploy smoke scope. Identify eligible approvers and dependencies for each permission; a named deployment commit does not merge these gates.

**SU-R9 — Major: SU-E3’s browser command can inherit private-package access**

- **Evidence:** `scope:248–254`; `playwright.config.ts:35–40`; `tests/browser/phase1-api.spec.ts:120–148`; `src/assessment/private-package-store.ts:271–275`.
- **Failure scenario:** An inherited `LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH` makes the full browser suite execute the mounted-package test, reading and serving held-out Math content outside this packet’s authorization.
- **Required change:** Define a sanitized synthetic browser environment that excludes private-package mounting and verifies the private-package test is skipped. Explicitly identify the permitted test-only progression flags, since Playwright enables them while the packet broadly excludes flag changes. No private access is needed for this Science scope.

**SU-R10 — Minor: The lane-collision description does not match lane A’s current scope**

- **Evidence:** `scope:219–222`, `scope:345–346`; `.git/agent-handoffs/RAT-CATALOG-IMPL/scope.rev1.md:277–309`.
- **Failure scenario:** Coordination serializes supposedly shared registry/content files while overlooking the actual dependency change: lane A modifies `src/curriculum/progression-catalog.ts` and adds curriculum modules. Its current scope explicitly preserves the registry and content catalog.
- **Required change:** Replace the collision claim with an exact ownership matrix pinned to lane A’s reviewed revision. There is currently **no direct owned-file overlap** with SU-E1–E4. Rebaseline dependent validation after lane A integration, and require reconciliation if either lane’s ownership changes.

Coverage:

| Area                                            | Assessment                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Delivery milestone and practice-only definition | Supported as a proposed, human-selected milestone; deployment correctly remains necessary                             |
| D-61, D-165, D-168–D-174                        | Practice reuse fits existing scope; new content, teaching and assessments remain separately gated                     |
| D-182–D-185                                     | Registration and standing engineering authority distinguished correctly; no release or commit/push authority inferred |
| Availability, G1–G2                             | Registry → roster → five routes, UI and publication chain verified; coupled test correction needed                    |
| Catalog and Lesson/Unit constraints, G14        | Practice-only rejection, no units in skill-graph mode and required Lesson bank reference verified                     |
| Readiness/service evidence, G3–G4               | Useful bounded test work; SU-R1/SU-R2 need correction                                                                 |
| Browser/manual evidence, G5/G10                 | Incomplete review coverage; manual results remain genuinely pending                                                   |
| Tutor, G6/G9                                    | Math framing, tutor prerequisite, reused item and unused authored ladders verified; SU-R3/R4/R6 apply                 |
| Scope and visuals, G7–G8                        | Label recommendation is concrete; icon work is correctly optional                                                     |
| Claims, G13                                     | Risk identified, disposition insufficiently explicit                                                                  |
| Commit/release, G11–G12                         | Correctly held; SU-R8 requires fuller permission wording                                                              |
| SU-E1                                           | Gate-compatible after test-spec correction; exact ownership                                                           |
| SU-E2                                           | Gate-compatible with confirmed synthetic DB; exact ownership; review evidence should be mandatory                     |
| SU-E3                                           | Conditional on prior integration and human copy choice; requires corrected coverage/environment                       |
| SU-E4                                           | Conditional on SU-H2; currently incomplete ownership and wiring                                                       |
| Human batch                                     | Useful separation of permissions; thresholds, claims and production-operation dispositions need completion            |

Limitations: This was a static, read-only review. No files were modified; no `.env`, database, network, private package or provider was accessed. No runtime suites were executed. Hash checks and `git diff --check` passed. Existing completed content reviews were carried forward without reopening accepted content. The integrator must bind reviewer identity to this invocation’s native metadata.

**SWITCH TO: Claude Code integrator / original forge-expert author — SCI6-USABLE rev1 consolidated correction, retaining SU-R1–SU-R10.**
