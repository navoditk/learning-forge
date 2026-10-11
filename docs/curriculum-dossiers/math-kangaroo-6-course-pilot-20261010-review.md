# Kangaroo course pilot — independent review disposition

Coordinator summary of read-only review
`039ef488-e4e9-4bfe-b2d2-d8c1069bfa54`. Actual reviewer `gpt-6.1-sol` and
author `claude-opus-5.5` verified through Copilot task/read metadata.
Code base: `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`.
Specification SHA-256:
`cd680f8cec5944c2f9b5e1c14d28b7106d21699847886892735a8e535ea0f98b`.

**Recommendation: not ready for human review.** Seven major and two minor
findings, all high confidence. No writes, tests, database, private-bank,
provider or build operations were performed.

| Finding | Severity | Specification lines                         | Evidence and required correction                                                                                                                                                                                                                                                    |
| ------- | -------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MK-P1   | Major    | 184-188, 294-302                            | Active unit refs immediately change claims and legacy suggestions even with flags off (`src/phase1/service.ts:629-638,801-808`). Keep S1 synthetic/candidate-only; activate later atomically.                                                                                       |
| MK-P2   | Major    | 68-76, 149-151, 174-175, 184-194, 302-306   | Current authorization lacks lesson-state/item-readiness inputs; placement selects first matching practice (`src/progression/placement-probe.ts:56-68`). Specify typed shared eligibility and core-safe placement with direct-access, reordering, missing-state and flags-off tests. |
| MK-P3   | Major    | 108-110, 189, 283, 303-304                  | Teaching admission is not validator-only: live consumers assume attemptable practice (`src/phase1/service.ts:90-105`). Require separate role-safe projections, teaching delivery and rejection sentinels.                                                                           |
| MK-P4   | Major    | 111-118, 190, 232-233, 303, 329             | Choices are also stripped by assessment and placement (`src/progression/assessment-submission.ts:230-241`; `src/progression/placement-probe.ts:72-85`). Cover all transports and accessible interaction; do not classify legitimate answer options as leaks.                        |
| MK-P5   | Major    | 94-100, 153-154, 188, 294-302               | Real skill version edits and unit/lesson text violate S1's no-content promise. Move them into reviewed curriculum-data stages.                                                                                                                                                      |
| MK-P6   | Major    | 149-156, 209-233, 262-266, 277-290, 304-306 | Release omits L2 teaching, per-skill review banks and feasible practice volume. Add gated resource packets; bank arithmetic is a minimum, with recurring review/exhaustion separately specified.                                                                                    |
| MK-P7   | Major    | 299-331                                     | Named tests lack runner wiring/falsifying assertions; tests/assessment is not selected and phase1 is database-backed. Provide claim/assertion/runner/database map and scoped review/privacy/manual gates.                                                                           |
| MK-P8   | Minor    | 235-240                                     | Universal direct pinning claim exceeds actual rows. Map direct/transitive pins and historical resolution, with migrations separately gated (`prisma/schema.prisma:463-501,579-614`).                                                                                                |
| MK-P9   | Minor    | 257-275, 294-306                            | Candidate handoff needs status, approver, blocked stage and engineering sign-off; skill-version choices require repinning.                                                                                                                                                          |

All source/policy/skill/practice hashes matched. Approved USA Grades 5-6 scope,
six-skill compatibility direction, no engine fork and D-61 boundaries remain
strengths. Existing runtime gaps do not alone invalidate design; these findings
concern incorrect inventory or incomplete contracts/stages.

Disposition: original author received all findings for specification-only
correction. Re-review the changed hash; no runtime or content fixes authorized.

## Revision 2 handoff

Author returned `7f4d8ba7413675a4af7c33dabfccef4daf5b66bfc0c1a82e93949a286d2d75c2`.
Original independent reviewer is checking changed scope. Findings remain open
until independently verified; this is not human approval.

## Revision 2 independent result

Original GPT reviewer verified the revised hash and returned **not ready for
human review**. Early candidate staging, role projections, explicit content
stages, transport coverage and resource completeness improved. Four residual
major findings and one minor remain, all high confidence:

| Finding | Severity | Revised specification lines             | Required correction                                                                                                                                                                 |
| ------- | -------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Major    | 174-177, 193-213, 267-269, 450, 454-455 | Authorization, role and readiness enforcement must survive sequencing flag-off and forward rollback; define explicit compatibility baseline and tests.                              |
| R2      | Major    | 146-148, 262, 273-274, 449-455, 475-494 | Schedule completion switches/writers and falsifying threshold/assistance/teaching tests, preserving separate D-31 evidence-backed skip.                                             |
| R3      | Major    | 63-68, 260, 360-361, 415, 488           | Letter-only scoring silently rejects reviewed numeric variants. Radio UI may submit letters; server accepted-answer compatibility must remain unless separately approved/versioned. |
| R4      | Major    | 328-340, 475-494                        | Pin matrix still invents direct columns on states, sessions and assignments. Map actual direct/transitive fields and retained history, with activation/retirement/rollback tests.   |
| R5      | Minor    | 245-246, 426, 437-438                   | Global no-item-edit promise contradicts conditional versioned repinning. Narrow teaching packet boundary; keep C0 separately authorized and reviewed.                               |

Original author received narrower specification-only fixes. No reviewer writes
or runtime validation occurred; no human approval is granted.

## Revision 3 independent result

Reviewed hash:
`1d6e87078751c0a23535ba8a08d0f064a76969df48c7a47ff3f0a93cf0322bf4`.
Same GPT reviewer independently verified all R1-R5 corrections.
**Recommendation: ready for human review with noted risks.**
No blocker or major remains in the bounded changed scope.

Two minor, high-confidence acceptance-detail findings remain:

- M1, revised line 575: add no-history/missing-state learners to permanent
  authorization tests under flags off and forward rollback.
- M2, revised lines 374-375 and 576: cover unlinked practice sessions/attempts
  before and after activation, exact available content history, truthful
  unresolved enclosing context and denied gated decisions.

No tests or runtime operations performed. This readiness recommendation does
not approve implementation, policy values, authoring, content or release.
Specification remains in the isolated course-pilot-kangaroo worktree.

**Integration disposition:** owner accepted the reviewed design under D-75.
The exact final specification is now integrated in this directory; open choices
are authoritative only at D-104–D-116. Minor acceptance notes remain applicable
to their future implementation packets, not new approval or release.
