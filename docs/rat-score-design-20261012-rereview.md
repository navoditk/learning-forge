# RAT-SCORE-DESIGN revision 2 — Changed-scope review

## Verdict and independence

**Not ready for human review.** R-1, R-2 and R-5 resolved in design;
R-3/R-4 retain two narrow acceptance-rule contradictions.

Same host-selected Codex `forge-reviewer`, fixed actual `gpt-6.1-sol`.
Original author's revision-2 client metadata independently verified:
`claude-opus-5-5`, UUID `ac7302b4-69ad-4713-b914-51e6b32132b2`,
`2026-10-13T04:35:44.982Z`, transcript `agent-a41f444c95448c37b.jsonl`.
Critical cross-family independence satisfied. D-154 remains design-only.

## Frozen evidence

Base `main`, HEAD `3e7c33372599d20c285656c3610ca6e47743240f`.
Artifacts under common Git metadata `agent-handoffs/RAT-SCORE-DESIGN/`:

| Artifact          | SHA-256                                                            |
| ----------------- | ------------------------------------------------------------------ |
| Rev2 contract     | `9c7f801de7bb2cac1292cbea80ddf4dec3ae53c8a39b93f87f6600b481dbc087` |
| Rev2 patch        | `fc372d1a404ae8b58d7ef1528fb6ee51671b5a222ed759fb53398404c13f433a` |
| Rev2 manifest     | `37621a4f46026c378880a0d576a3a76cb37cd982da20aefc41bb9f8f049f57db` |
| Baseline manifest | `bbcfc2dad2a273ef2a7463c1578d61de0e952b1d85d99a729440930bfda0a2d6` |

All baseline/live/copied and substantive consumed inputs match; revision-1
artifacts and prior report match pins. Relay/status changes expected.
One-file +902/−0 patch reconstructed in memory to exact frozen bytes.
Sections 0, 1 and 6 byte-identical. Prettier and whitespace checks passed.

## Earlier finding dispositions

| Finding                      | Disposition                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 authority before refusal | Resolved in design: session/run/expiry/duplicate/current-item preflight before field errors, existing expiry path and transactional rechecks preserved; PA-11/PA-12 boundary/race evidence. |
| R-2 generator consistency    | Resolved in design: kind-specific generation and independent syntax/representation classification; boundary rows anchor outcomes.                                                           |
| R-3 satisfiability/bounds    | Substantially corrected: representability, identifier bounds and rendering defined; S-A envelope bound conservative/compatible. Residual positive-control contradiction below.              |
| R-4 public projections       | Substantially corrected: public IDs/private selectors separated, allowlists and projection-specific contracts. Residual recursive-scan contradiction below.                                 |
| R-5 mobile fractions         | Resolved in design: text keyboard for fraction/mixed forms and later mobile-entry evidence required.                                                                                        |

## Remaining findings

References concern frozen `structured-response-scoring-contract.rev2.md`,
destined for `docs/structured-response-scoring-contract.md`.

### Residual R-3 — Major; high confidence — Impossible PA-6 positive control

**Lines:** 701; bounds/example 268–279. **Rule:** D-154 coherent executable
acceptance matrix.

PA-6 requires a positive control attaining the 29-character maximum. The
example `999999999 999999998/999999999` has an improper numerator far beyond
the permitted nine digits. With canonical numerator and denominator each
bounded to nine digits, this mixed rendering cannot pass load validation.
A conservative rendering bound does not establish an attainable fixture.

**Smallest correction:** use a valid bounded rational such as
`999999999/500000000`, rendered `1 499999999/500000000`; describe any looser
bound as conservative and avoid requiring an impossible maximum fixture.

### Residual R-4 — Major; high confidence — PA-4a rejects correct option ID

**Lines:** 692, PA-4h 699. **Rule:** usable answer-free descriptors; revised
§3.2 expressly permits public option IDs.

PA-4a recursively excludes correct-value strings. SF-3's correct identifier
`y` must appear in public `responseSpec.options[].id`, so the scan rejects a
required descriptor. PA-4h allows public IDs, but PA-4a and PA-4c's inherited
redactions do not consistently apply the exception.

**Smallest correction:** consistent public-option-ID exception; assert exact
allowlisted descriptor and absence of private selector keys. Use scoped
sentinels for leakage checks without banning required public IDs.

## Limits and routing

Changed-scope static review only: no edits, runtime tests, scorer/matcher
execution, private-bank access, database/provider calls or new research.
Implementation, mobile evidence, private-store validation and owner OD choices
remain separate gates.

**SWITCH TO: Claude Code forge-expert / Opus**, original executor, these two
bounded corrections only. Preserve earlier fixes; refreeze revision 3 and
return changed scope to Codex review. No owner choice, application,
implementation, release, commit or push approval follows from this report.
