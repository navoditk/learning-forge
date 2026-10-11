# AMC 8 course pilot — independent review disposition

Coordinator summary of the read-only review returned by
`ddb2f044-adab-4004-8cdd-9c079970830b`. Actual reviewer `gpt-6.1-sol` and
author `claude-opus-5.5` were verified through Copilot task/read metadata.
Code base: `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`.
Reviewed specification SHA-256:
`dd162c8331f3e961a04eb9d4515e0b097506506865effec59c5764d84240b27f`.

**Recommendation: not ready for human review.** No blocker-severity finding;
five major and two minor findings, all high confidence. No files, tests,
database operations, private banks or provider calls were involved in review.

| Finding | Severity | Specification location | Evidence and required correction                                                                                                                                                                                        |
| ------- | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1      | Major    | Sections 2.2, 8, 9     | `src/curriculum/progression-catalog.ts:120-128` rejects unclaimed units/lessons. Keep inactive proposals separate from active validation or defer insertion. Bank metadata must not fabricate hashes, counts or review. |
| F2      | Major    | Sections 2.1, 3.3, 9   | Planner readiness is not direct-session authorization (`src/phase1/service.ts:178-187,277-345`). Inventory the existing gap and gate activation on direct-start/continuation and placement eligibility tests.           |
| F3      | Major    | Section 2.1 P5         | Service resolution returns undefined and enforcement/shadow skip it (`src/phase1/service.ts:290-299,361-369,385-392`). Reclassify as a gap, with explicit denial tests.                                                 |
| F4      | Major    | Section 4              | Catalog coverage checks inclusion, not exact membership (`src/curriculum/progression-catalog.ts:83-114`). Specify extra/missing/wrong-version/target and singleton-bank rejection tests.                                |
| F5      | Major    | Sections 2.3, 5, 8, 13 | Completion can precede threshold implementation; `src/progression/learner-state.ts:297-325` does not enforce the minimum. Require approved executable completion rules before assessment/completion claims.             |
| F6      | Minor    | Sections 2.2, 11       | Registry filtering already exists (`src/curriculum/unit-claims.ts:9-15`). Preserve it; generalize the lookup source.                                                                                                    |
| F7      | Minor    | Section 9 T16          | Unavailable-bank and insufficient-items failures differ (`src/assessment/private-package-store.ts:263-266`). Separate the assertions.                                                                                   |

All four practice pins matched. Core-only placement references, source scope,
D-61 pause and assignment-free review-loss disclosure were verified strengths.
Historical resolution, route/store stage ownership and named browser/integration
assertions need clarification. Candidate decisions remain proposals for the
single authoritative matrix.

Disposition: original author received F1–F7 for specification-only correction.
Changed hash requires independent re-review. No human approval or implementation
authorization is granted.

## Revision 2 handoff

Author returned `e63bcc286b967d6128a0056a22e07974f1f2876a60ddbf9d2d762d2fa5459ef5`.
Original independent reviewer is checking changed scope. Findings are not
closed on the basis of the author's self-assessment.

## Revision 2 independent result

Original GPT reviewer verified the revised hash and returned **not ready for
human review**. F3, F4, F6 and F7 close at specification level; F1/F2/F5
corrections expose three coupled residual major findings:

| Finding | Confidence  | Revised specification lines | Required correction                                                                                                                                                                                               |
| ------- | ----------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | High        | 340-344, 524-526            | Blanket below-threshold lesson assignment denial conflicts with D-31 no-practice first-run skip (`src/progression/learner-state.ts:24-30`). Distinguish ordinary progression and skip eligibility/tests.          |
| R2      | High        | P1, 383-392, 455, 568       | Preserved unrestricted reachability conflicts with readiness cutover and open grandfathering decision. Preserve evidence, not bypass authority; reconcile permanent enforcement and owner-gated alternatives.     |
| R3      | Medium-high | 476-490, 536-537            | Separate active catalog validation from archived version resolution and immutable ownership. Activation/forward-rollback tests must prove valid active catalog, history resolution and no archived active claims. |

Strict coverage is a validator behavior change, despite unchanged math record
bytes. Original author received these narrower fixes. No runtime tests or edits
were performed by the reviewer, and no human approval is granted.

## Revision 3 independent result

Reviewed hash:
`04853fc488b38c9846a5cbf2ca87d0505c41de0a0c5c904c175b18b00b52f63c`.
Same GPT reviewer returned **not ready for human review**.
D-31 skip correction closes; two residual majors, high confidence:

- R2a, revised lines 415-418, 585 and 630: bounded expiry does not authorize
  an already-open below-readiness attempt to produce evidence. Finish only
  when current authorization passes, or provide read-only closure without
  new evidence/grants. Test in-progress below-readiness submission refusal.
- R3a, revised section 9.1: archived units pin old program ownership and
  cannot be relisted unchanged under a new registry version. Reactivation
  needs new ownership-dependent structural versions while preserving
  archived originals. Test successful forward reactivation and old history.

Original author received only these narrower corrections. Static review only;
no human approval or runtime change.

## Revision 4 independent result

Reviewed hash:
`c02a4f60f9f069e963c1a9bc8305bf286eaaf0d72e60535c8f63a911444050bb`.
Same GPT reviewer independently closes R2a and R3a with high confidence.
**Recommendation: ready for human review with noted risks.**
No remaining blocker, major or minor in this bounded scope.

Revised lines 404-424 and T42 deny below-readiness evidence-producing work,
including unexpired in-progress submissions; O9 is read-only closure only.
Lines 527-542 and T41 require new ownership-dependent structural versions on
reactivation and preserve immutable archived originals.

Prospective tests, service remediation, closure choices, active/archive
integration and release remain future gates. No execution or human approval.

**Integration disposition:** owner accepted the reviewed design under D-75.
Exact specification bytes are now integrated in this directory; open choices
are authoritative only at D-76–D-85. This is not content or release approval.
