# RAT-SCORE-DESIGN revision 4 — Closure review

## Verdict and identity

**Not ready for human review.** R-3 closed; one coupled R-4 fixture-validity
contradiction remains. No broad audit or new product request.

Same host-selected Codex `forge-reviewer`, fixed actual `gpt-6.1-sol`.
Author metadata independently verified: `claude-opus-5-5`, record
`07380d7b-0daa-4a10-bd53-6559080336e3`, `2026-10-13T04:52:25.567Z`,
original transcript `agent-a41f444c95448c37b.jsonl`.
Critical cross-family independence satisfied. Base `main`, HEAD
`3e7c33372599d20c285656c3610ca6e47743240f`.

## Frozen evidence

Artifacts under common Git metadata `agent-handoffs/RAT-SCORE-DESIGN/`:

| Artifact         | SHA-256                                                            |
| ---------------- | ------------------------------------------------------------------ |
| Rev4 document    | `31886e8a2d24438d19a0d9cbd267aef7a551040c6355fa0361cfbfc358204cb9` |
| Rev4 patch       | `f978cf73aeaaee5b42e979dfb2d7ecbd74ed930538f335b9feac54c1497610ad` |
| Rev4 manifest    | `588d163a65e1be4704658880caf12377c6bc6a0b49a71252de428d67b0d3e522` |
| Closure evidence | `3ef63d0ed885b7fe2054de24b343e6c96b574126bee5df53d01991dbb30cfc0c` |

Substantive baseline inputs and earlier frozen artifacts match. Updated
AGENTS/orchestration and relay/status differences are intentional instruction
changes. One-document +966/−0 patch reconstructed to exact frozen bytes.

## Dispositions and coverage

| Finding | Disposition                                                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1     | Remains closed; authority/preflight section unchanged.                                                                                                                                                    |
| R-2     | Remains closed; dependent G-NG change follows corrected rendering bound.                                                                                                                                  |
| R-3     | Closed. Independently confirmed coprime values, valid 21/19/15-character controls, 28-character normalized response and 669-character envelope bound; no unattainable 29-character PA-6 control required. |
| R-4     | Original option-ID conflict closed; sentinel/simplestForm fixes verified. Selector-invariance fixture closure remains incomplete below.                                                                   |
| R-5     | Remains closed; mobile input requirement unchanged.                                                                                                                                                       |

Checked rev2→rev4 changes, original counterexamples, closure derivations and
direct regressions only. Prettier/whitespace checks passed. No edits, runtime
tests/probes, matcher execution, private-bank/database/provider access or new
research. Executable implementation/browser evidence remains a later gate.

## R-4 — Unresolved; major; high confidence

**Location:** frozen rev4 contract line 703; coupled rules lines 222–229 and
316–317; closure evidence line 171. **Requirement:** D-154 coherent executable
acceptance cases.

PA-4a requires variants differing only in `correctOptionId` or `correctValue`.
Changing SF-3 from `y` to `x` changes the derived answer from
`Choice Q: Option Y; Quantity N: 12` to `Choice Q: Option X; Quantity N: 12`.
SF-1's change from `45` to `46` also changes its derived answer. If only the
selector changes, §2.7 rejects unchanged `canonicalAnswer`/`acceptedAnswers`.
Closure demonstrates descriptor independence but not fixture validity.

**Smallest correction/closure condition:** variants change selector and
recompute dependent private answer fields under §2.4. Demonstrate both
original and variant pass §2.7 before comparing public projections.
Preserve unchanged public descriptors and malicious-selector rejection cases.

**Classification:** unresolved R-4 closure, directly coupled to selector
invariance introduced in revision 3; not a first-pass miss. One consolidated
finding, zero blockers, one major, zero minors.

## Routing

Return to designated integrator; original Claude Code `forge-expert` / Opus
makes this one clarification with closure evidence, preserves earlier fixes,
refreezes and returns changed scope to Codex. Owner choices, application,
implementation, release, commit and push remain unapproved.
