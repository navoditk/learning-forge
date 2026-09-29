# Independent fourth-draft / C1–C3 review

**Status:** COMPLETED 2026-09-22 — recommendation `do not approve`; not an
approval, not a shadow disposition, and not C4 authorization

## Reviewer record

- Reviewer: Claude Opus 5.5 (Claude Code session), acting in the playbook
  reviewer role
- Organization/role: independent AI reviewer; no decision authority
- Review date (UTC): 2026-09-22
- Repository commit reviewed: `b7934bc` (detached worktree); descendants
  through `14e8be4` inspected for drift
- Environment/build identifier: local macOS; disposable `postgres:16-alpine`
  container; no production or staging database access
- Independence statement (not an implementer or approver for this change):
  the reviewer did not author, implement, or approve any A0–C3 increment. The
  implementing configuration was Codex, a different model family. Only the
  product/content owner approves.

## Scope and evidence

Record the exact versions or commit digests reviewed. Do not paste private
assessment items or learner data.

- `docs/course-progression-handoff.md`: `b7934bc`, plus the `14e8be4` revision
- `docs/course-progression-architecture.md`: `b7934bc` (fourth draft; §7, §11.4, §13, §16 in depth)
- `docs/course-progression-decisions.md`: `b7934bc` (D-05, D-20, D-35 in depth)
- `docs/adr/0013-course-progression-structure.md`: `b7934bc` (not reviewed in depth)
- `AGENTS.md`: `b7934bc`
- Automated command outputs (re-run by the reviewer at `b7934bc`):
  - `npm run verify`: passed — format, lint, typecheck, down-migration check,
    53 files / 243 tests, production build
  - `npm run test:integration`: passed — 12 files / 53 tests
  - `npm run test:migrations`: passed — forward/down/forward equivalence across
    14 migrations
  - `npm run test:e2e`: not run by the reviewer
  - `npm run eval:run` (if applicable): not applicable (no tutor-text change)
  - `PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging npm run progression:shadow-pilot`
    then `npm run progression:shadow-review`: reproduced 5 decisions, 1
    divergent (`DENY → ALLOW`, `LOCKED_PREREQUISITE`, `unit-rates-1`),
    0 incomplete-context rows, `readyForIndependentReview: false`

## Required review claims

For each row, write evidence and classify the result as `blocker`, `major`,
`minor`, or `none`. A related test is not enough; identify what would falsify
the claim.

| Claim | Result | File/line or command evidence | Finding / smallest safe remediation |
|---|---|---|---|
| U1–U6: core progression contracts and state transitions are implemented as specified | none | `npm run verify` green; not re-derived line by line in this pass | No finding; depth of review was limited |
| U28–U31: authorization, versioning, evidence, and rollout boundaries hold | major | `src/phase1/service.ts:287-311` vs `src/progression/assessment-assignment.ts:383-390` | M1 |
| C1 tables are covered by export/deletion/retention behavior before writes | minor | `src/server/household-data.ts:250-275`; `tests/progression/household-data-coverage.test.ts`; `tests/persistence/household-data.test.ts:182-190` | m2 |
| C3 dual-write is non-enforcing and cannot change learner authorization | none | `src/progression/shadow.ts:9-35` (timeout + swallow); `actualBehavior` fixed `ALLOWED`; reproduced shadow `DENY` with session served; `tests/progression-integration/assessment-boundary.test.ts:127-133` | Holds; see m3 |
| Shadow records contain no learner free text, prompts, or answers | none | `prisma/schema.prisma` `ShadowDecision` has no free-text columns | Holds by schema; see m4 |
| C4 expand/drain/reject-residue/contract/enforce/remove-bypass order is safe | major | `src/app/page.tsx:201-210`; `src/progression/cutover-readiness.ts:59-73`; `src/progression/assessment-assignment.ts:41-52`; `src/app/api/progression/assessment/assignment/route.ts:196-199`; `src/progression/shadow.ts:56-64` | M2 — fails closed, but shadow does not predict enforcement |
| Open decisions are not silently replaced by implementation defaults | minor | `src/planner/plan-next-activities.ts:13,38` | m5 |
| Every architecture §16 claim has a falsifying automated test | minor | §13.6 IDs untraceable in tests; 7 spec-named files absent | m6 (pre-existing, previously reported open) |
| `AGENTS.md` constraints are satisfied | none | No violation found in reviewed scope | — |

## Findings

### Blocker

- Finding: none found in C1–C3 as non-enforcing code. The external blockers
  are unchanged: no representative shadow traffic, unsigned manual gates, and
  an unreviewed private package.
- File and line: —
- Evidence: —
- Smallest safe remediation: —

### Major

- Finding: **M1** — The Phase 1 shadow predicate, which §11.4a step 5 will
  enforce, does not scope prerequisite mastery by `algorithmVersion`, yet
  stamps each row `mastery-phase-1-1`.
- File and line: `src/phase1/service.ts:287-311`
- Evidence: `MasteryEstimate` is unique on
  `(learnerProfileId, skillCode, algorithmVersion)`, so versions can coexist.
  The assignment path scopes by version (`assessment-assignment.ts:383-390`).
  Reviewer probe: with `ratio-language` mastered only under
  `probe-other-version`, `startSession(unit-rates-1)` recorded shadow `ALLOW`
  labelled `mastery-phase-1-1`. The issue is latent until D-20 introduces a new
  version, because `persistMasteryEstimateSnapshot` has no production caller.
- Smallest safe remediation: filter by the active algorithm version, and add
  an integration falsifier that reproduces the probe.

- Finding: **M2** — C3 shadow and drain do not model the assignment
  requirement for `PLACEMENT`/`REVIEW`. At C4 the live diagnostic and review
  flows would be refused, and no divergence reveals it.
- File and line: `src/app/page.tsx:201-210`;
  `src/progression/cutover-readiness.ts:59-73`;
  `src/progression/assessment-assignment.ts:41-52`;
  `src/app/api/progression/assessment/assignment/route.ts:196-199`;
  `src/progression/shadow.ts:56-64`
- Evidence: the learner UI starts `PLACEMENT`/`REVIEW` sessions without an
  assignment. Readiness counts such open sessions as unbound for every program.
  No `PLACEMENT`, `REVIEW`, or `DELAYED_CHECK` assignment can be created. The
  shadow predicate evaluates only kind, prerequisites, and policy. In the
  reproduced staging run, an assignment-less `REVIEW` of never-mastered
  `ratio-language` recorded `ALLOW` and was not divergent. Because C3 fixes
  `actualBehavior` to `ALLOWED`, allow→deny is unobservable. §11.4a step 2's
  "this set only shrinks" is false, because abandoned diagnostic/review
  sessions add unbound rows. Residue handling keeps this fail-closed.
- Smallest safe remediation: make "assignment required" a single policy-driven
  function of the authorization tuple, evaluate it in the shadow predicate,
  and have readiness use the same function. The architecture does not state
  whether legacy-policy `PLACEMENT`/`REVIEW` need an assignment, so the
  product owner must decide that. Correct the §11.4a step-2 wording.

### Minor

- Finding: **m1** documentation drift — `45f5dbf` is described as
  documentation-only but changes `scripts/report-progression-readiness.ts`
  (operator output only). Migration counts are quoted as 11 and 13; there are
  14. `PROGRESS.md` names `45f5dbf` as `HEAD`.
- Finding: **m2** — export/deletion coverage is proved by a hand-maintained
  list plus zero-row checks on 5 models. No missing table was found in code.
  Remediation: DMMF-driven post-delete counts over every household-scoped
  model.
- Finding: **m3** — no Phase 1 integration falsifier that a shadow `DENY`
  still serves the session; only the assignment path has one.
- Finding: **m4** — `tests/progression-integration/assessment-boundary.test.ts:135`
  `not.toEqual(arrayContaining([...]))` fails only if all three keys are
  present. Remediation: assert each key is absent.
- Finding: **m5** — the planner keeps `DEFAULT_SECURE_THRESHOLD = 0.75` and
  its own prerequisite logic instead of the shared predicate (§7.2). The values
  currently match `minEstimateGate`.
- Finding: **m6** — §13.6 traceability: tests carry no U/I IDs. Absent
  spec-named files: `tests/progression-integration/{api-leakage,assessment-no-tutor,export-coverage,log-safety,preview-safety,wording-safety}.test.ts`
  and `tests/progression/tutor-binding.test.ts` (an integration version
  exists).
- Finding: **m7** — `0007_add_shadow_request_context` was added after
  0008–0013. The round-trip test covers only fresh sorted application, and
  `db:rollback` without an argument selects `0013`. The SQL is additive and
  nullable.

### Staging divergence — reviewer analysis, not a disposition

`unit-rates-1` / `PRACTICE`: shadow `DENY` (`LOCKED_PREREQUISITE`) vs actual
`ALLOWED`. `content/skills/unit-rates.json` requires `ratio-language`, and
`grade-6-math-access@1.0.0` respects the prerequisite graph. Legacy
`startSession` never checks prerequisites. This is the access change approved
D-05 acknowledges, and it is consistent with D-35. In the reviewer's view it
is consistent with `EXPLAINED`. The synthetic run is not representative: all
requests target pilot skills, so the legacy-compatibility path was never
exercised.

## Recommendation

Choose exactly one and explain why:

- `do not approve` — C1–C3 are sound as a non-enforcing foundation, and no
  path was found by which C3 changes learner authorization. However, M1 and M2
  mean the shadow evidence does not yet predict what C4 would enforce, which is
  the purpose of the C3 → C4 gate. Blockers to clear: remediate M1; remediate
  M2 after the product owner decides legacy placement/review assignment
  semantics; collect representative shadow traffic and dispose every
  divergence. Playbook verdict: **not ready for human review**.

Reviewer signature: Claude Opus 5.5 (findings only), 2026-09-22

Product/content owner acknowledgement:
