# Shared teaching delivery/exposure design review

Date: 2026-10-10. Scope: proposed
`docs/teaching-delivery-exposure-contract.md` and decision-matrix section J.
No runtime, schema, content or migration changes reviewed or approved.

Final formatted contract SHA-256:
`c18411c4648cd50f40782e18555c4dfbe1977b7f7bfa4c15c50be73b47a161ff`.

## Provenance and scope

The original architect used `claude-opus-5.5` (runtime-visible model metadata,
agent `663a8608-e011-4ba0-be44-3a808fb7f956`), against `a33fc5f` plus the
existing dirty catalog/dossier work. Original draft hash:
`f1bc775d5b0fc6cd7c8c6894ad81981c5b1a98581ef8b905dc6e5730830b34a0`.
The GPT-6.1 Sol coordinator independently read the draft and rederived relevant
code, rejected its deficiencies, and directly authored corrections.

Fresh `claude-opus-5.5` review contexts reviewed the GPT-authored corrections,
not their own original work. The first correction review returned not ready;
a narrower changed-scope review confirmed four fixes and returned **ready
for human review with noted risks**. Model selection was recorded by task
tool metadata, not inferred from an agent's self-report. This is split-author
cross-family review, not a claim that a single Opus pass independently reviewed
Opus-authored prose. The coordinator owns the original-draft review and the
decision-register integration.

Concurrent HEAD advanced to `debfbdc`; the reviewing context checked that
the intervening commit did not change the cited teaching/exposure source
paths. Catalog data and progress changes were preserved.

## Findings and disposition

| Finding                                                                                                                                  | Severity | Disposition                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ItemRef string hash and generic authorization were misdescribed as verified digest/readiness enforcement                                 | Major    | Corrected inventory; dedicated exact teaching membership and pure readiness/lesson eligibility remain proposed prerequisites                                           |
| SSI alone was claimed to force exposure/assessment aborts                                                                                | Blocker  | All participants must acquire the scoped learner-row lock first in Read Committed; existing Serializable participants must be converted and revalidated before serving |
| Retry window shorter than delay still permitted a shortened gap after redisclosure                                                       | Major    | Proposed D-102 conservative fixed replay-expiry horizon plus D-21 delay; actual events retain actual timestamps; scheduling change requires owner approval             |
| Raw file bytes were assumed present at runtime                                                                                           | Major    | Build-time verified raw-byte manifest, runtime canonical comparison; no reconstruction from parsed archive; existing private-bank hashes unchanged                     |
| Overlap coverage was unavailable and teaching could settle assessments despite no-state-mutation claim                                   | Major    | Proposed D-140 conservative refusal for any unsettled learner assignment/lease; separate assessment lifecycle settles expired runs                                     |
| Serving preceded shadow/permanent-enforcement dependencies                                                                               | Major    | T4a precedes serving T4b; all cross-surface interlock/activation work and review are mandatory prerequisites                                                           |
| Mutable authorization/replay checks were outside the transaction                                                                         | Major    | Recheck under shared interlock; exact pins, active snapshot, actor and run state apply to replays too                                                                  |
| Duplicate recommendation table could become another decision authority                                                                   | Major    | D-139–D-144 consolidated only in the canonical matrix; all remain OPEN                                                                                                 |
| Learner attribution, synthetic fixture hashes, no-assessment limitations, manual accessibility and privacy/delete order were understated | Minor    | Truthful parent actor; computed fixture hashes; disconnected fixture limitation; separate manual gates; explicit retention and delete ordering                         |

These are specification closures, not executed runtime fixes.

## Remaining risks and approval boundary

Converting existing Serializable transactions must preserve their other
concurrency invariants; complete exposure-writer participation and
representative shadow evidence must be demonstrated in T4a. The conservative
assessment interlock can block teaching if expired runs are not settled
promptly; D-140 must explicitly accept that liveness trade-off. Public,
out-of-band and network-receipt exposure remain unobservable.

No full no-assessment course generality is claimed: current LessonSchema
requires a bank, and T1 fixtures exercise disconnected item/context schemas
only. Every claim-to-test row is prospective unless it names an existing file;
none of its proposed assertions was executed. Automated accessibility cannot
replace the manual review gate.

Targeted `npx prettier --check --ignore-path /dev/null` on the eight changed
documentation files passed; `git diff --check` passed. The read-only
deterministic audit confirmed all 69 extension/shared entries appear exactly
once and remain OPEN, and all five accepted course hashes are unchanged.
No database, browser, provider or runtime suite was run for this packet.

Next: owner contract acceptance and D-139/D-142 shape decisions before T1.
Other OPEN choices apply to later stages, not blanket upfront approval.
