# Independent fourth-draft / C1–C3 review result

## Current status — 2026-09-22

**Reviewer-model caveat (2026-09-24).** Each review below was requested from a
separate read-only agent configured for Claude Fable 5.1, a different model
from the implementer (Claude Opus 5.5). The identity recorded for each review
is the agent's own self-report. Two of these agents failed on rate limits, and
their error messages named `claude-opus-5-5` as the model sent to the API.
That may be the parent session's model, or it may mean the requested model
was not applied. Which model actually ran these reviews is therefore
**unverified**. All of them are also the same model family as the
implementer. The playbook's preference for a different reasoning
configuration may not have been met. Treat these reviews as separate
read-only passes, not as proven model-independent reviews.

The independent review of implementation target `b7934bc` is recorded in
`independent-review.md`, with recommendation **do not approve**. Major
findings: M1 (Phase 1 shadow predicate ignores `algorithmVersion`) and M2
(shadow and drain do not model the `PLACEMENT`/`REVIEW` assignment
requirement). C4 remains closed.

## Independent re-review of the M1–M3 remediation — 2026-09-22

Reviewer: Claude Fable 5.1, working read-only on the uncommitted remediation
over `14e8be4`. Verdict: **ready for human review with noted risks**. This is
not an approval, and C4 remains closed.

- M1 closed. M2 closed in implementation. m3 and m4 closed. m1 and m2 partially
  closed. m5–m7 open. C3 confirmed non-enforcing, and the tests catch mutations
  that remove the M1, D-62, readiness, or fail-closed logic.
- N1 (major): no test covered skill-graph-only programs under D-62. Remediated
  with unit, binding, and integration falsifiers.
- N2 (major): shadow rows do not record the access-policy or predicate
  version. Remediated procedurally: the representative evidence window starts
  at the deploy of this remediation (`shadow-divergence-review.md`). Adding
  version columns remains an option that needs a reviewed migration.
- N3 (major): pilot `RUN_NOT_ACTIVE` rows had been marked `EXPLAINED` although
  no placement or review assignment can be created. They are now
  `REQUIRES_REMEDIATION`. Pilot placement and review assignments must be built
  before C4, unless the owner explicitly accepts losing them.
- N4: the D-60 reading is now recorded as an owner-approved clarification.
  N5: `appliesToSkillsClaimedByNoUnit` is set to `false` in 1.1.0. N6: the
  `division-of-fractions-1` row is relabelled and disposed by the owner.
  N8: the `assignmentBound` comment is corrected.
- Open: N7 (the staging harness exercises no attempt path; Phase 1 independent
  checks map to `DELAYED_CHECK`, which D-62 always ties to an assignment, so C4
  would refuse today's mastery-check flow); the rest of N8 (assignment-required
  kind sets are code constants); and the remaining N9 doc ordering.

## Independent re-review of the D-28 and D-69 remediation — 2026-09-24 (latest)

Reviewer: Claude Fable 5.1 (a fresh agent). Scope: `8293201..c499084`.
Verdict: **not ready for human review**. N1 closed, N5 deferral accepted,
13 of 39 mutants killed. Remediation made after this re-review:

- **F1 (major):** abandoned or expired delayed-check runs after a lapse or
  failure could still strand a skill with no record. Abandon and expiry now
  run the D-69 check, and eligibility refuses a stranded skill with
  `NEEDS_HELP` even before it is marked.
- **F2 (major):** a lesson-assessment outcome or later lapse could clear
  `NEEDS_HELP`. It is now terminal in both transitions. Because no override
  can reopen it, the override semantics are recorded as open decision D-70
  instead of being invented.
- **F3:** new falsifying cases cover the practice-session filters (learner,
  kind, skill, ended, after remediation began, passed check), the exact
  cooldown boundary, remediation start (max, failure-only, learner, version,
  outcome), other learners' `NEEDS_HELP`, assistance, and tutor moves,
  first-time exhaustion under the production profile, abandoned-run
  stranding, and no `NEEDS_HELP` after passing checks. The implementer
  confirmed eleven of the previously surviving mutants are now killed.
- **F4:** documentation claims corrected (the cross-learner scope, D-69
  wording, and the handoff's stale "Review 4 has not been performed").
- **F5:** a completed practice session must now end on a passed same-sitting
  check, which excludes operator-drained sessions. This is documented in the
  D-28 implementation note.
- **F6:** the `NEEDS_HELP` write moved to `learner-state.ts`; eligibility is
  read-only again.
- **Draft:** `unit-rates-review-c` was replaced because it overlapped a public
  practice item. The bank hash is re-pinned.

These remediations need another independent re-review.

## Independent re-review of the delayed-check and review remediation — 2026-09-24

Reviewer: a fresh read-only agent requested as Claude Fable 5.1. An earlier
resumed attempt was discarded.
Scope: `5eff07e..8293201`. Verdict: **not ready for human review**. F1–F3,
F7, F9, and F10 were confirmed closed; 24 of 31 mutants were killed. C3 was
confirmed non-enforcing and the route still gated. Remediation made after this
re-review:

- **N1 (major):** a lapsed skill could be re-confirmed within seconds. A
  delayed check after a lapse or a failed delayed check now requires the D-28
  cooldown (`REASSESSMENT_COOLDOWN`). It also requires a completed practice
  session on the skill since then (`REMEDIATION_PRACTICE_REQUIRED`).
- **N2 (major):** repeated lapses stranded a skill with no record. D-69 is now
  approved and implemented: an exhausted or capped skill gets a `NEEDS_HELP`
  lesson record (created if missing), and further delayed checks are refused
  with `NEEDS_HELP`.
- **N3:** tests now cover:
  - delayed-check no-reuse under profile `1.1.0`;
  - remediation staying `ACTIVE` on an incomplete lesson;
  - cross-learner isolation of attempt exposure (other exposure sources
    were covered later);
  - version-aware exclusivity;
  - the skill-bank configuration.
- **N4:** the F3 overclaim is corrected, and the D-67 follow-up is folded into
  D-69.
- **N5:** `attemptOrdinal` counts every scored run while the D-27 count resets
  on a pass. Both must be reconciled before C4.
- **Draft items (by id):**
  - replaced `unit-rates-delayed-check-b` (answer visible in the prompt),
    `unit-rates-delayed-check-e` (skill fit), and `ratio-language-review-c`
    (reused a lesson item's quantities);
  - broadened accepted answers;
  - dropped bare-number leakage patterns.

These remediations need another independent re-review.

## Independent review of pilot delayed-check and review assignments — 2026-09-24

Reviewer: Claude Fable 5.1, read-only, reviewing `ad74b09..5eff07e`.
Verdict: **not ready for human review**. Nothing was approved, and C4
remains closed. Remediation made after the review:

- **F1:** a lapsed skill now refuses review (`REVIEW_LAPSED_REMEDIATION`).
- **F2:** a confirmed skill refuses a new delayed check (`ALREADY_CONFIRMED`).
  A passing re-confirmation after a lapse restarts the schedule and clears lapse
  remediation on completed lessons.
- **F3:** exposure now includes every Phase 1 attempt on the skill's public
  content in any context, and tutor interactions. Held-out assessment attempts
  are not exposure.
- **F4 and F7:** new tests cover:
  - disjoint no-reuse selection, including items from a passed run;
  - the reassessment cap and review-pool exhaustion;
  - review rotation (D-67);
  - the due-date boundary and other-skill isolation;
  - loader role, missing-bank, and exclusive-skill checks;
  - route refusals and replay;
  - the review reassessment-limit rule, now a pure helper.
- **F5:**
  - reassessment now counts consecutive failures since the latest pass and
    allows the initial run plus `maxReassessments`, correcting an off-by-one
    against D-27;
  - bank exhaustion by abandoned runs is recorded as an open follow-up
    under D-67;
  - D-28's practice-session condition is still not enforced.
- **F6:** the legacy same-sitting check still writes `independentDelayedCheck`.
  It must be resolved at the latest in C4 (tracked in the handoff).
- **F8:** the skill banks now require exclusive skill membership. Re-pinning
  every bank from the reviewed package is documented.
- **F9:** superseded. D-67 now specifies reuse semantics, via profile `1.1.0`.
- **F10:** a replayed idempotency key is honored before eligibility.
- **Draft items:** near-duplicates were replaced, and accepted answers and
  leakage patterns broadened.

These remediations need their own independent re-review.

The entries below are historical reviews of earlier checkpoints and
must not be interpreted as approval of the current code or authorization for
C4. The authoritative current gate status is in `README.md` and
`manual-gate-record.md`.

## Fresh read-only review of `5020ea2`

The independent reviewer completed a read-only review of the exact pushed
checkpoint. Automated checks covering U1–U6, U28–U31, and the named U41–U48
suites passed, but the implementation was **not ready for human approval**.
C4 remains closed.

Findings requiring remediation were:

- Review attempts must require an open `REVIEW` session; practice and ended
  sessions must not be reinterpreted as reviews.
- Assignment-backed review submissions did not update
  `ReviewSchedule.lastOutcome` or scoped lesson remediation.
- Lapse remediation needed exact skill/version scoping and stronger
  persistence evidence; the archived-content fallback was still process-local.
- Prior selective U41–U48 evidence gaps remain open.

No independent reviewer or manual-gate approval was granted.

## Fresh read-only review of `6783333`

The independent reviewer re-checked the pushed checkpoint and returned
**not ready for human review**; C4 remains closed. The deletion-route gap,
version comparator, embedded-answer sentinel, and initial historical resolver
findings were addressed in that checkpoint or its immediate follow-up.
Remaining findings were the external/manual C4 gates, durable historical-archive
fallback semantics, broader U41–U48 evidence, and policy-layer exhaustiveness.
Subsequent local remediation added historical projection fallbacks, reflective
reference/layer tests, named recalculation/completion/relock/cross-program
suites, exposure-kind coverage, and tutor-binding validation. These changes
are automated evidence only and do not constitute independent approval.

External blockers remain unchanged: the manual gate record is unsigned, the
staging shadow pilot has one unresolved `DENY → ALLOW` divergence, and the
private held-out package has not been independently approved or installed.

**Status:** Findings received; **not an approval for C4**.

## Fresh read-only review of `967dec8`

The fresh independent review completed on the pushed remediation checkpoint.
It confirmed the prior shadow, replay, API-sentinel, and U2 changes, but found
the implementation **not ready for human approval**. C4 remains closed.

Remaining implementation findings were U28 production-path enforcement,
attempt-path shadow failure falsification, incomplete successful Phase 1 API
route coverage, and the architecture claim-to-test matrix. The first three
were addressed in the current follow-up, and AMC 8 readiness was moved into
the versioned policy profile. The claim-to-test matrix remains open.

External blockers remain unchanged: the manual gate record is unsigned, the
staging shadow pilot has one unresolved `DENY → ALLOW` divergence, and the
private held-out package has not been independently approved or installed.

**Status:** Findings received; **not an approval for C4**.

The fresh independent re-review of pushed checkpoint `37b239f` likewise found
the implementation **not ready for human approval**. Its actionable findings
are recorded in the latest `docs/PROGRESS.md` entry; the code fixes in this
follow-up do not change the release authorization state.

The independent read-only reviewer examined commit `b370049` and returned the
following findings. The implementation remediation is recorded in
`docs/PROGRESS.md`; the external evidence and manual gates remain separate.

## Blockers

- C3 shadow persistence could previously change learner-visible success by
  failing the session or assignment path. Remediated by moving shadow work
  after the learner transaction, swallowing failures with redacted structured
  diagnostics, and adding failure-injection tests.
- Representative non-enforcing shadow traffic and disposition are absent. The
  five-request synthetic staging run contains one unresolved
  `DENY → ALLOW` divergence. This remains an external review requirement.

## Major findings

- C4 readiness previously treated ordinary practice sessions with no
  assignment as unbound. Remediated with activity-conditional assignment
  requirements and tests.
- Several C4/C5 claims in the architecture matrix name tests that are not yet
  present. The matrix remains an implementation-completion obligation; no C4
  claim is being made from unrelated green tests.
- Session and learner-state policy pins previously stored version without the
  profile code. Remediated with additive nullable code columns and dual-write
  coverage.
- Household export trusted the persisted `highestAssistance` summary.
  Remediated by deriving the maximum from immutable assistance events.
- Historical D-01/open-decision wording contradicted the authoritative matrix.
  Reconciled without changing the release gate.

## Recommendation

Do not execute C4. Complete representative shadow review/disposition, the
private assessment-package review and installation, the manual gate record,
and the remaining acceptance-test coverage before authorization cutover.
