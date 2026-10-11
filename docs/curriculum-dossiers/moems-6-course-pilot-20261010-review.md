# MOEMS course pilot — independent review disposition

Coordinator summary of read-only review
`b79523b4-d784-46ee-b266-2f5b70467b15`. Actual reviewer `gpt-6.1-sol`
and author `claude-opus-5.5` verified through Copilot task/read metadata.
Base: `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`.
Specification SHA-256:
`86abf43ec04d30c53222f304bc2d64dc681195ce0fa7deeee8324f774a7ffa30`.

**Recommendation: not ready for human review.** Eight major and three minor
findings, all high confidence. Static review only; no edits, tests, database,
private-bank, build or provider operations.

| Finding | Severity | Specification lines            | Required correction and evidence                                                                                                                                                                                                                             |
| ------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1      | Major    | 260-268                        | Hybrid legacy compatibility covers three unclaimed skills, not old learners on claimed skills (`src/progression/policy.ts:69-74,97-100`). Specify historical sessions separately.                                                                            |
| F2      | Major    | 294-318, 350-362               | Isolate synthetic-only catalog generalization from completion changes, real skill versions, teaching/writers and activation. Require only decisions consumed by each stage.                                                                                  |
| F3      | Major    | 157-176                        | Cryptarithm reused item is impossible: with A=3, A7+5B cannot reach 1C2; 37+55=92, not 192 (`content/moems-6/moems6-cryptarithm-reasoning-2.json:17-24`). Flag separately authorized correctness disposition before unit reuse; preserve historical version. |
| F4      | Major    | 210-214                        | Use TEACHING, explicit access grant and pinned actor/target authorization. Separate retrieval from exposure mutation; retries and later exposures differ. D-54 assignment idempotency is not a teaching-event contract.                                      |
| F5      | Major    | 178-197, 248-249, 326-338      | Add per-skill review banks and generic kind/target/version resolution. Pending bank refs cannot enter the validated active catalog; do not fabricate metadata (`src/curriculum/progression-catalog.ts:79-89`).                                               |
| F6      | Major    | 136-146, 168-174, 186, 258-274 | Distinguish prerequisites, selection hints, optional contest readiness and placement's prerequisite-only exemption. Preserve actual MOEMS behavior; do not inherit AMC gating without approval.                                                              |
| F7      | Major    | 252-268, 315, 357              | Map direct/transitive/gap pins and historical resolution; current LearningEvent does not store all promised references (`prisma/schema.prisma:697-710`). Keep schema changes outside mechanical stage.                                                       |
| F8      | Major    | 230-234, 278-281               | Shared mastery estimate includes weighted practice/placement (`src/progression/mastery.ts:56-87`). Distinguish estimate from highest-confidence independent confirmation; no MOEMS-only filtering.                                                           |
| F9      | Minor    | 29-31, 294-304, 359, 405-416   | Source C4 concerns unstated Division M prerequisites in optional E contest items, not this core/synthetic work. Scope administrative and release gates accurately.                                                                                           |
| F10     | Minor    | 320-324                        | Sonnet allocation is already owner-approved; implementation authorization remains separate.                                                                                                                                                                  |
| F11     | Minor    | 364-402                        | Metadata tests do not prove originality or mathematical accuracy; automated accessibility does not clear human review. Specify falsifying assertions, runners and manual gates.                                                                              |

Practice identities/versions and hash prefixes matched. Immutable base, paths
and raw-byte hashing provide reproducible pins; full hashes must be calculated
from that pinned revision before implementation. Hash integrity does not prove
correctness.

Original author received all findings for specification-only correction.
Candidates remain recommendations for the sole decision matrix. No runtime,
content, database, private access or release approval is granted.

## Revision 2 independent result

Reviewed hash:
`e8a90e2a905ec42d405b6ed94dec6839773d87adae2bf7e39c103e9e61f38e50`.
Same independently witnessed GPT reviewer returned **not ready for human
review**. Synthetic packet, source-question scope, shared mastery and model
allocation improved; defective item is excluded from proposed unit/placement,
not globally withdrawn. Residuals (all high confidence):

| Finding | Severity | Revised lines                      | Required correction                                                                                                                                                     |
| ------- | -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Major    | 225-230, 339-340, 391              | Candidate-only banks cannot support active hybrid lessons. Stage the entire candidate spine outside active claims until complete atomic activation.                     |
| R2      | Major    | 275-280, 390, 419, 451             | Preserve D-31 zero-work skip separately from ordinary completion; exclude placement and duplicate item attempts from practice counts.                                   |
| R3      | Major    | 178-181, 305-329                   | Parsed ContentArchive JSON cannot recover raw-file byte digest. Distinguish raw hash, canonical bank hash and semantic archive validation; identify actual history gap. |
| R4      | Major    | 257-267, 389, 428                  | Instruction delivered by GET plus optional client event POST can hide exposure. Specify fail-safe server-observed delivery, binding, retry and genuine later exposure.  |
| R5      | Major    | 139-140, 357-360, 394-396, 509-511 | Permanent authorization and non-bypassing rollback must be explicit, separate from preparatory flags.                                                                   |
| R6      | Minor    | 341-349, 384-396, 416-428          | Specify actual packet dependencies/decisions and preserved practice, placement and review grants on claimed targets.                                                    |

Original author received bounded corrections. Review performed no writes or
runtime validation; no human approval.

## Revision 3 independent result

Reviewed hash:
`666a97a2ba8102a97785aa3cb5786acdc9db22c9884d639045c9ca8029a2e6d5`.
Same GPT reviewer verifies candidate spine, raw digest distinction and
permanent authorization corrections. **Not ready for human review**:

- C1, major/high, revised lines 303-311: independent-only practice counting
  contradicts D-59 assistance-supported completion. Use referenced profile's
  assistance rule and paired allowed/disallowed tests.
- C2, major/high, lines 264-286: retry window/expired-key behavior is
  unspecified, and universal exposure guarantees conflict with D-58 public
  teaching. Scope server exposure to authenticated course serving, define
  retry policy/expiry, and acknowledge unobservable public/out-of-band use.
- C3, minor/high, lines 459 and 481: activation requires MC-08 resolved even
  when its chosen branch does not need packet 4; tests follow approved branch.

Original author received only these residual corrections. Static review only.

## Revision 4 final independent result

Reviewed SHA-256:
`9856d2c50ce6d553d9f7649cbf20fdaa212e13470d259482b19a80f2f8bfca9e`.
Original reviewer `b79523b4-d784-46ee-b266-2f5b70467b15`, actual
`gpt-6.1-sol` versus witnessed `claude-opus-5.5` author, verified the hash
remained unchanged.

**Recommendation: ready for human review.**
C1-C3 independently close with high confidence:

- Revised lines 328-339 and T-17 follow pinned assistance policy, retaining
  distinct-item counting and placement exclusion.
- Lines 265-305 and T-12/T-13 scope exposure to authenticated serving,
  acknowledge public/out-of-band limits, require an approved MC-17 retry
  window, and refuse expired-key content.
- Lines 341-349, 489-492 and 514 require MC-08 resolved for either branch,
  while implementation of its consumer remains conditional.

No remaining finding in the final changed scope. No writes, tests, database,
private-bank, build or provider operations. Policy, content correction,
authoring, private access, C4 and release approvals remain outstanding.
Spec remains isolated.

**Integration disposition:** owner accepted the reviewed design under D-75.
The exact final specification is now integrated in this directory; remaining
choices are authoritative only at D-86–D-103. No content correction, private
access, authoring or release approval.
