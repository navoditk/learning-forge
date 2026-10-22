# RAT-SCORE-DESIGN — Independent design review

## Verdict

**Not ready for human review.** Four major and one minor corrections remain.
Return to original Claude Code `forge-expert` / Opus executor within the
approved one-document scope. Contract remains unapplied.

## Identity and frozen evidence

Reviewer: fresh native Codex `forge-reviewer`, fixed `gpt-6.1-sol` verified
by host role definition and successful delegated turn, not self-report.
Author independently verified from filtered client transcript metadata:
`claude-opus-5-5`, first assistant UUID
`a9890c74-21a6-4363-890b-9c696efed950`, `2026-10-13T00:38:45.924Z`.
Transcript basename `agent-a41f444c95448c37b.jsonl` under the Claude project
session's subagents directory. Critical cross-family independence satisfied.
D-154 authorizes design only. Base `main`, HEAD
`3e7c33372599d20c285656c3610ca6e47743240f`.

| Artifact          | SHA-256                                                            |
| ----------------- | ------------------------------------------------------------------ |
| Contract          | `b15920c004afb30021bdcdfbf4cac8707447876114a6112e79db1e215206d6f1` |
| Patch             | `32d20f1ff246582a12fe0ab10d1270d3a7cf2165e7ec9fff533158b65bdb42ef` |
| Input manifest    | `5c3b39a9f0daa0ae44564e70619a389226c88dc1ead3950653127d574a308839` |
| Baseline manifest | `bbcfc2dad2a273ef2a7463c1578d61de0e952b1d85d99a729440930bfda0a2d6` |

All eleven baseline/live/copied inputs and additional substantive and
partial-read inputs match. Index, PROGRESS and packet changed through the
expected relay update. One new document patch (+705/−0) reconstructed in
memory to exact frozen bytes. Hash, formatting and whitespace checks passed.

## Findings

References below concern the frozen contract at
`.git/agent-handoffs/RAT-SCORE-DESIGN/structured-response-scoring-contract.md`,
destined for `docs/structured-response-scoring-contract.md`.

### R-1 — Major; high confidence — Refusal precedes assessment authority checks

**Lines:** 364, 306–332 and 419. **Rules:** preserve assessment authorization,
lifecycle and idempotency; held-out disclosure only in authorized current-item
flow (UI review playbook).

**Evidence:** Proposed refusal precedes the transaction. Current
`src/progression/assessment-submission.ts:256` resolves a selected ordinal
from a snapshot without session/run state; session membership, ended status,
terminal state, expiry and duplicates are checked inside the transaction
(lines 289–338). Malformed requests with an unrelated session, ended run or
submitted ordinal would receive field errors ahead of authority errors.
Empty fields could reveal required keys for future selected ordinals.
Existing boundary tests require ended/mismatched-session rejection.

**Smallest correction:** read-only authorization/lifecycle/current-item
preflight before mode/field errors, transactional rechecks before writes,
authority/duplicate precedence and synthetic invalid-session, expired/terminal,
duplicate/future-ordinal cases. Eligible malformed submissions still write
nothing. No new authority policy is silently approved.

### R-2 — Major; high confidence — Generator outcomes contradict grammar

**Line:** 504. **Rule:** executable coherent V-7 matrix, rejection unweakened.

**Evidence:** G-PD marks every value-changing padding incorrect, but padding a
six-place decimal or nine-digit integer can violate grammar and require refusal.
G-EQ appends a zero beyond six decimal places yet expects correct. G-SW checks
kinds, not compatible representations: swaps between integer-only/fraction-only
number fields may require `FORM_NOT_ALLOWED`. G-NG prescribes `NOT_A_NUMBER`
for choices instead of `NOT_AN_OPTION`.

**Smallest correction:** field-kind-specific generators, syntax/length/target
representation classification before outcomes, incorrect only for well-formed
wrong values, boundary vectors and compatible-representation swaps. Every
adversarial vector remains rejected.

### R-3 — Major; high confidence — Correct response need not be representable

**Lines:** 167, 173, 204–209, 244–252 and 389. **Rule:** declared valid
responses must be expressible, transportable and deterministically accepted.

**Evidence:** Numeric values lack range/representability constraints; canonical
rendering selects first representation even when a fraction cannot render as
an integer. Mixed-only fields cannot represent zero/integer under proposed
grammar. Choice IDs have no length bound: a correct 201-character ID passes
listed load rules but fails the route's 200-character limit. Six permitted
200-character IDs also defeat S-A's claim all envelopes fit 1000 characters.

**Smallest correction:** identifier/value bounds, at least one correct response
within grammar/transport limits, canonical rendering choosing an expressible
representation, load-time rejection vectors for impossible fields. Reconcile
S-A size claims with actual structured route limits. Owner storage/grammar
choices remain explicitly open.

### R-4 — Major; high confidence — Public projection assertions conflict

**Lines:** 297 and PA-4 (526). **Rules:** usable answer-free descriptors and
necessary-only authorized held-out disclosure.

**Evidence:** Public choice options need submission IDs named `value`, but
§3.2/PA-4 prohibit `value` without separating IDs from the private correct
selector. PA-4 requires `responseSpec` in every API response, conflicting with
unchanged assessment submission projections and format-only refusals.

**Smallest correction:** explicit public choice-option shape allowing option
IDs and excluding correct selector; descriptors only in authorized prompt/
current-item projections. Separate assignment/submission/refusal redaction
assertions and authorized access conditions.

### R-5 — Minor; medium confidence — Decimal keypad does not ensure fractions

**Line:** 340. **Rules:** accessible entry across narrow devices/keyboard paths.

**Evidence:** A-3 mandates decimal input mode for every number field, while
fraction/mixed forms require slash and spaces. Text type permits strings but
does not guarantee the selected mobile keypad provides required characters.
No mobile input evidence was obtained.

**Smallest correction:** text-capable input mode for fractional forms or tested
equivalent control. Later UI validation enters `3/4` and `1 1/2` on mobile.

## Preserved properties and limits

Opt-in dispatch, unchanged legacy matcher, separate legacy characterization,
immutable versions/history and explicitly unapproved owner choices are
consistent with scope. D-41 wording matches the decision register.

Review used static code/test and authority evidence, hash checks, patch
inspection/reconstruction, Prettier and whitespace checks. No reviewer files
changed, runtime tests/probes, matcher execution, private-bank reads, database,
provider calls or new research. Private-store behavior and later browser/
storage implementation remain unverified. Passing document checks is not
implementation acceptance.

## Routing

**SWITCH TO: Claude Code forge-expert / Opus**, original RAT-SCORE-DESIGN
executor. Correct R-1–R-5 in the one document, refreeze document/patch/manifest
and return changed scope to Codex review. Owner decisions, main application,
implementation and release remain separate. No commit or push.
