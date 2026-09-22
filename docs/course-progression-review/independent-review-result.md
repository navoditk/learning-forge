# Independent fourth-draft / C1–C3 review result

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
