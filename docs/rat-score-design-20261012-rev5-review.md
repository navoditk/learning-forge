# RAT-SCORE-DESIGN revision 5 — Changed-scope closure review

## Verdict and identity

**Ready for human review.** R-4 closed; no unresolved, regression,
first-pass-miss or newly observable findings in the reviewed changes.
Counts: 0 blockers, 0 majors, 0 minors.

Same host-selected Codex `forge-reviewer`, fixed actual `gpt-6.1-sol`.
Original author metadata independently verified: `claude-opus-5-5`, UUID
`64be818f-b6ea-4fb5-9dcf-b77d1ca3886c`, `2026-10-13T05:03:34.571Z`,
transcript `agent-a41f444c95448c37b.jsonl`. Cross-family independence satisfied.
Base `main`, HEAD `3e7c33372599d20c285656c3610ca6e47743240f`.

## Frozen evidence

Artifacts under common Git metadata `agent-handoffs/RAT-SCORE-DESIGN/`:

| Artifact         | Verified SHA-256                                                   |
| ---------------- | ------------------------------------------------------------------ |
| Rev5 document    | `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898` |
| Rev5 patch       | `a18f85253b859a99b01a97865640ff6e0346da9f1b4e4c6b35166bcc53562971` |
| Closure evidence | `908da2906abd16452a1b8333e19d7dec8f794a5e46c2a0ffa7ca452253df675d` |
| Rev5 manifest    | `79ee780843adb57b2a5c2487046b7c2d48a527d8ed0bc0c8308282c1f2e3945a` |

Baseline copies, substantive inputs, added review inputs and earlier frozen
artifacts match. Instruction and relay/status changes expected. One-document
+994/−0 patch reconstructed to exact frozen bytes.

## R-4 closure and preserved requirements

High confidence: frozen rev5 PA-4a line 719 requires selector changes plus
recomputed `canonicalAnswer`/`acceptedAnswers`; both fixtures pass load
validation before comparing projections. Independently derived:

- SF-3 y/x: valid canonical answers, each 34 characters.
- SF-1 45/46: valid canonical answers, each 51 characters.
- Each pair keeps all public projection inputs identical.
- Injected private selectors still fail exact allowlist/private-key checks.
- Sentinel variants recompute dependent answers; complete-fixture and
  rejection-control requirements are explicit.

R-1, R-2, R-3 and R-5 closures remain preserved. Coverage limited to
rev4→rev5 diff, original R-4 counterexample, closure evidence and direct
regressions. No additional review prerequisite identified.

## Verification limits and next gate

Prettier checks for frozen document and closure evidence, plus whitespace
checks, passed. Reviewer changed no files. No runtime tests/probes, matcher
execution, private-bank/database/provider access or new research. Runtime,
mobile and private-store evidence belong to later authorized implementation.

**WAITING FOR HUMAN APPROVAL:** owner acceptance of exact revision-5
contract and authorization to apply one-file patch `a18f8525...2971`.
Owner OD choices, implementation, content and release remain separately
gated. Contract unapplied; no commit or push authorized.
