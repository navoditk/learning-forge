# Independent fourth-draft / C1–C3 review result

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
