# RAT-SCORE-IMPL-PATHS revision 2 — Changed-scope review

## Verdict and identity

**Ready for human review with noted risks.** R-1/R-2 closed. One newly
observable, nonblocking minor test-evidence finding R-3; no new runtime
correctness/safety defect found. No additional assurance review required.

Same host-selected Codex `forge-reviewer`, fixed actual `gpt-6.1-sol`.
Author client metadata independently verified: 145/145 assistant records
`claude-sonnet-5-5`, last UUID `d9698e62-91e5-4f6e-981f-3aeaacb712d5`,
`2026-10-14T03:51:22.760Z`, original `agent-a71172deb959ad6a4.jsonl`.
Critical cross-family independence retained.

## Frozen evidence

Patch SHA-256 `b100815f61aadc06395221f994f3abc2052efa33fe3a751baeded0c55f3e577e`.
Base HEAD `3e7c33372599d20c285656c3610ca6e47743240f`. All fifteen frozen hashes
and in-memory reconstructions match; twelve files unchanged from rev1.
All twenty-nine baseline copies, twenty-seven substantive/live inputs and
fifteen extra dependency pins match. Live AGENTS/orchestration changed only
by disclosed delivery/lane instructions, preserving packet authority.
Artifacts under common Git metadata `agent-handoffs/RAT-SCORE-IMPL-PATHS/`.
Main patch remains unapplied.

## Closure and coupled coverage

| Finding/scope             | Disposition                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 minor/high confidence | Closed: frozen assessment-submission.ts:501–521 always preflights before item evaluation; expiry skips evaluation. Transaction checks precede lazy evaluation/writes (:535–552). Existing expiry/refusal/competing-commit tests green. |
| R-2 minor/high confidence | Closed: practice fixture asserts twelve distinct 64-character keys; twelve accepted/thirteen rejected, 64/65 keys and 200/201 values verified.                                                                                         |
| Direct regressions        | Checked authorized success/refusal, duplicate/current-item precedence, expiry writes, zero-write refusal, transaction rechecks and unchanged legacy paths.                                                                             |
| Retained limits           | Genuine simultaneous transaction overlap and assessment number-rendering sentinel remain prior coverage limits; UI/private store/serving/release excluded.                                                                             |

## R-3 — Minor; high confidence; newly observable; nonblocking

**Location:** new
`tests/progression-integration/structured-assessment-order.test.ts:103–118`.
**Requirement/evidence:** closure evidence should distinguish executable
non-invocation proof from static ordering proof.

Ended/terminal requests occur before successful duplicate setup;
`mockClear()` at line 112 removes their evaluator calls. Final zero-call
assertion proves duplicate/future-item non-invocation, not independently
ended/terminal non-invocation. A call inserted only before ended/terminal
error can survive because its count is cleared.

**Smallest correction:** assert zero item calls after each ended/terminal
request before setup. **Closure:** inserted calls fail corresponding assertions.

Readiness remains ready: corrected source directly proves original ended/
terminal cases stop before evaluation, so R-1 stays closed. This is an
explicit evidence limitation, not a runtime defect or required new round.
Human may accept the limitation with the exact patch; optional test correction
would change bytes and require bounded review. Do not imply all five cases
have independent spy evidence.

## Validation evidence and limits

Retained author logs: verify 1,955 tests/build, integration 319 passed/1
existing skip, fake eval 3/3. Ordering suite passes5/5; rev1 sensitivity log
4 failures/1 pass. Integrator353-test/TypeScript evidence separately attributed.
No reviewer suite/database/provider access or state mutation. Coverage bounded
to corrections/diff/closure/direct regressions; no unchanged-byte full audit.

## Next gate

Return to designated integrator for exact revision2 owner acceptance/
application, explicitly including nonblocking R-3 evidence limit. No extra
assurance review, successor scope or release approved by reviewer.
