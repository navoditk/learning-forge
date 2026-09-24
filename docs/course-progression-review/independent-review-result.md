# Independent fourth-draft / C1–C3 review result

## Current status — 2026-09-22

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

## Independent review of pilot delayed-check and review assignments — 2026-09-24

Reviewer: Claude Fable 5.1, read-only, reviewing `ad74b09..5eff07e`.
Verdict: **not ready for human review**. Nothing was approved, and C4
remains closed. Remediation made after the review:

- **F1:** a lapsed skill now refuses review (`REVIEW_LAPSED_REMEDIATION`).
- **F2:** a confirmed skill refuses a new delayed check (`ALREADY_CONFIRMED`).
  A passing re-confirmation after a lapse restarts the schedule and clears lapse
  remediation on completed lessons.
- **F3:** exposure now includes every attempt on the skill in any context, and
  tutor interactions.
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
