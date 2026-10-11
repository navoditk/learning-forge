# MATHCOUNTS course pilot — independent review disposition

Coordinator summary of read-only review
`cb160d6f-463b-4f3e-b0f5-7709bc3f6c74`. Actual reviewer `gpt-6.1-sol`
and author `claude-opus-5.5` verified through Copilot task/read metadata.
Base: `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`.
Specification SHA-256:
`e835d4ce89ac0af6efe7f22a12ae56e7e709e189cac25bddd6a439c72a15f1e4`.

**Recommendation: not ready for human review.** Four major and four minor
findings, all high confidence. Static hashes and whitespace checked; no runtime
tests, edits, database, private package or provider operations.

## Source revision reconciliation

Reviewer directly compared the corrected original research-worktree refresh
`e8987d3f6201ff6fac472fa0f2450b1a151850a7043f5b6a533eb4712d20738e`
with the current refresh
`5dd910a7b4f57995b31aa4f77b1918e62bb72b8bda53b24da20b8f2eba57adcc`.
Only opening approval/governance annotations and closing integration-status
wording changed. No source rows, scope, rights, operational questions or
authoring constraints changed. The owner approval is separately recorded in
the source register; the hash difference does not require substantive re-review.

## Findings

| Finding | Severity | Specification lines                     | Required correction and evidence                                                                                                                                                                                                   |
| ------- | -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Major    | 141-142, 163-167, 188-190, 302-305, 405 | Two reused items cannot meet retained distinct-practice threshold. Add conditional authorized practice expansion or approved profile choice, and eligible-item sufficiency gate before release.                                    |
| R2      | Major    | 245-246, 351-352                        | Blanket API exclusion prevents assigned prompt delivery. Permit only active authorized server-selected current prompt; forbid answers, validators, enumeration and unrelated items (`src/progression/assessment-response.ts:7-9`). |
| R3      | Major    | 273, 299-300, 350                       | Teaching needs separate role-safe projection/delivery, not live practice-catalog loosening. Define exposure versus completion and role/pending/flags/reset tests (`src/content/catalog.ts:500-507`).                               |
| R4      | Major    | 304, 355-365, 401-407                   | Add scoped human screen-reader and child-safe wording review, focus/live-region evidence and reconciled source witness. Earlier pilot acceptances are not new-surface approval.                                                    |
| R5      | Minor    | 183-184, 287-289                        | Placement is D-64 public-practice probing, not D-31 assessment skip. Preserve core-first/order regression and do not add AMC readiness to MATHCOUNTS.                                                                              |
| R6      | Minor    | 236-237                                 | Separate immutable assessment evidence from mutable state; distinguish authored hints, deterministic policy and provider interfaces.                                                                                               |
| R7      | Minor    | 216-219                                 | No-reuse bank minimum is per target total, not automatically per skill (`src/progression/assessment-assignment.ts:57-96`). Specify coverage separately.                                                                            |
| R8      | Minor    | 131                                     | Grade 6 math profile 1.1.0 enables review reuse; current MATHCOUNTS profile does not. Keep adoption conditional and versioned.                                                                                                     |

All four practice pins and empty skill prerequisite sets matched. Explicit
six-skill compatibility and shared policy direction are sound. Candidate H1-H9
remain recommendations; avoid implicit contest-count defaults and require only
stage-consumed decisions for synthetic work.

Original author received all findings and source-hash mapping for
specification-only correction. Changed specification requires re-review.
No human approval, runtime, authoring, private-access or release authorization.

## Revision 2 independent result

Reviewed hash:
`66cbff72e74da5851f842fe67751a702c5b7ebcbf41392780963ffbc5e596698`.
Same independently witnessed GPT reviewer returned **not ready for human
review**. API prompt exception, manual gates and profile facts corrected.
Residual major findings, all high confidence:

| Finding | Revised lines                                     | Required correction                                                                                                                                                                             |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1      | 172, 289-291, 415, 477, 485-490, 538-540, 565-566 | Define executable ordinary threshold eligibility, actual distinct attempted items and D-31 zero-work assignment exception. Early logic must remain uncalled/shadow or separately gated cutover. |
| N2      | 391-395, 433-455, 543-552                         | Add explicit TEACHING grant, shared delivery/completion authorization and delivery-instance retry versus later-exposure reset.                                                                  |
| N3      | 327-332, 529-531                                  | Preserve mandatory skill coverage in each selection/reassessment after exclusions. Only extra per-skill quotas remain recommendations.                                                          |
| N4      | 400, 409-410, 468-490                             | Separate active/staged/historical catalogs and manifests: inactive banks do not affect readiness; referenced retired banks remain resolvable without granting new work.                         |

Minor drift: placement does not require private banks; derived mastery belongs
to assessment evidence; assignment lifecycle must include SUBMITTED.
Original author received corrections; static review only, no approval.

## Revision 3 independent result

Reviewed hash:
`1c3e914998bdee1f33c2dd273bd22f7e515a7436c23446612083379b3e6a2d16`.
Same GPT reviewer closes N1-N4 with high confidence.
**Recommendation: ready for human review with noted risks.**
No unresolved major in bounded remediation scope.

Actual eligible attempted items, D-31 zero-work entry, shadow versus approved
cutover, explicit teaching grants and replay/reset behavior, per-reassessment
skill coverage, and active/staged/historical manifests are specified.

Two minor high-confidence notes remain: revised lines 616-618 still conflate
placement with private-bank dependency, and 640-641's blanket no-early-behavior
statement must exempt approved S2c. Lines 601 and 605-608 should explicitly
test refusal to remove referenced historical artifacts, not interpret
exceptional missing-history fallback as permission to delete.

Static hash/whitespace checks only. Policies, authoring, private access,
enforcement and manual release decisions are not approved.

**Integration disposition:** owner accepted the reviewed design under D-75.
The exact final specification is now integrated in this directory; open choices
are authoritative only at D-117–D-126. Minor drift is interpreted by the
canonical shared contract and must be corrected in consuming implementation
packets. No content or enforcement cutover approval.
