# Spelling Bee course pilot — independent review disposition

Coordinator summary of read-only review
`5b87dbfa-88bc-4d00-8a91-97825689f108`. Actual reviewer `gpt-6.1-sol` and
author `claude-opus-5.5` verified through Copilot task/read metadata.
Code base: `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`.
Specification SHA-256:
`395eb8df69834864678f008113c92bebc13ee21941c9fa8a6356ce40fa7a5609`.

**Recommendation: not ready for human review.** Four major and three minor
findings. Review was static: no writes, tests, database, private-bank or
provider access.

| Finding | Severity / confidence | Specification lines              | Evidence and required correction                                                                                                                                                                                                            |
| ------- | --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1      | Major / high          | 247-249, 408                     | Completion shorthand omits profile threshold and assessment rules. Use canonical architecture completion and name missing evaluator prerequisites (`docs/course-progression-architecture.md:758-779,968-978`).                              |
| M2      | Major / high          | 83-84, 225-226, 332-353, 367-370 | Teaching schemas exist, but serving/event writer is unspecified. Add separately gated role-safe resolver, authorization, pinned exposure writer and completion tests; live catalog is practice-only (`src/content/catalog.ts:500-507`).     |
| M3      | Major / medium-high   | 339-347, 367, 428-431            | S1 bundles generalization with intentional authorization/state changes while promising identical behavior. Separate mechanical catalog work from reviewed behavior corrections and C4 dependencies.                                         |
| M4      | Major / high          | 185, 191-192, 303, 307-308       | Orthography core item requires final-syllable stress without supplying the promised cue (`content/scripps-spelling-bee-6/snsb6-orthographic-patterns-core-1.json:17-24,59`). Require a separate reviewed content correction before release. |
| m1      | Minor / high          | 216-217                          | Placement intentionally exempts prerequisite locking (`src/progression/policy.ts:102-108`). Do not silently change it.                                                                                                                      |
| m2      | Minor / high          | 82                               | Legacy count rule also covers mixed legacy records in skill-graph-only programs (`src/content/catalog.ts:488-493`). Correct inventory.                                                                                                      |
| m3      | Minor / high          | 410-411                          | CONFIRMED is not a lesson assessment outcome (`prisma/schema.prisma:133-138`). Distinguish passing assessment from confirmed delayed evidence.                                                                                              |

Reviewer independently verified four practice hashes, the erroneous "made-up"
cycle claim, accessible explanation/scorer mismatch and unresolved service
resolver path. These are pre-existing issues, not authorized runtime/content
fixes. Hybrid compatibility and private-bank separation are sound directions.

Clarify historical resolution, exact browser assertions, human accessibility
review and per-surface leakage/export/deletion before writers. Candidate
decisions remain proposals for the sole authoritative matrix.

Disposition: original author received all findings for specification-only
correction; changed hash requires re-review. No human approval is granted.

## Revision 2 independent result

Reviewed hash:
`84d578084f20f5084177df57b93d76a1bbb49741a7d20045c5ad5f698207f087`.
Same independently witnessed GPT reviewer returned **not ready for human
review**. Stress-cue gate, placement, legacy counts and valid result wording
are corrected. Residual findings:

| Finding | Severity / confidence | Revised lines             | Required correction                                                                                                                                                                 |
| ------- | --------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Blocker / high        | 458, 482, 609             | Distinguish pre-cutover shadow from permanent cutover. Delete flag-disabled permissive paths; sequencing/rollback must never disable authorization.                                 |
| R2      | Major / high          | 330-335, 484, 536         | Normal-path teaching-before-evidence gate must exempt authorized D-31 zero-work skip. Test assignment entry through PASS/COMPLETE_BY_SKIP, not only terminal transition.            |
| R3      | Major / high          | 354-360, 459-460, 558-562 | Replace uniform pin claim with actual direct/transitive/aggregate contribution references. New persistence needs separately reviewed migration and privacy coverage before writers. |

Static review only; original author received these corrections. No approval.

## Revision 3 independent result

Reviewed hash:
`d661db2e6a65e7f4f34bad5e22f9bad5a3c707f4a4990d5b5e701f214867de36`.
Same GPT reviewer closes R1/R2 and migration/privacy ordering, but recommends
**not ready for human review**:

- R3a, major/high, revised line 377: co-writing LearningEvent and lesson
  state in a transaction does not persist their historical association.
  Mark attribution unavailable or require explicit immutable delivery
  context before writers; test one item delivered in two lesson versions.
- R3b, minor/high, line 380: teachingViewedAt/practiceCount are lesson-state
  fields, not unit-state fields.
- C1, minor/high, line 543: cutover tests are in section 12.2, not 12.4.

Original author received only these corrections. Static review; no approval.

## Revision 4 final independent result

Reviewed SHA-256:
`64e4e9efd9a17632b892ac78dadfd86675e563aafb6a524c8c41fee657439174`.
Original reviewer `5b87dbfa-88bc-4d00-8a91-97825689f108`, actual
`gpt-6.1-sol` versus witnessed `claude-opus-5.5` author, verified the hash
before and after the bounded review.

**Recommendation: ready for human review.**
R3a, R3b and C1 independently close with high confidence. Revised lines
377 and 387-400 explicitly mark existing delivery attribution unavailable
and require an immutable context before attributed writers. The same-item,
two-lesson-version test rejects inferred current membership. Lines 380-381
correctly split unit and lesson counters; line 558 fixes the cutover reference.
Migration/privacy coverage remains required before population.

No remaining finding in the final changed scope. No writes, tests, database,
private-bank, build or provider operations. This is not implementation,
content, migration, D-61 or release approval. Spec remains isolated.

**Integration disposition:** owner accepted the reviewed design under D-75.
The exact final specification is now integrated in this directory; open choices
are authoritative only at D-127–D-138. No content drafting, schema or release
approval follows design acceptance.
