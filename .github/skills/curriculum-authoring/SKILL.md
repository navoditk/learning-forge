---
name: curriculum-authoring
description: Builds a versioned curriculum skill graph and original learning content from an approved curriculum research dossier. Use only after curriculum source research has been reviewed and approved.
---

# Curriculum authoring

Follow `docs/curriculum-authoring-playbook.md`,
`docs/content-authoring-pipeline.md`, and `docs/content-review.md`.

## Preconditions

0. Confirm new curriculum authoring is not currently paused. As of
   2026-09-19 it is. **Architecture approval alone does not lift the pause**:
   the required gate set is `D-61` in
   `docs/course-progression-decisions.md`, which additionally requires the
   publication hotfix (`D-58`, Stage A0), the assessment-exposure decision
   (`D-01`), the record-shape decisions (`D-37`, `D-38`, `D-56`, `D-57`,
   `D-40`), the rollout decision (`D-52`), and Stages A0/A1 merged so the role
   schemas exist to author against. Check `docs/curriculum-agents.md` before
   starting.
1. Locate the target curriculum section in `docs/curriculum-sources.md`.
2. Confirm it is explicitly approved by a human product/content owner.
3. Confirm standards identifiers, edition, scope, and unresolved gaps are
   clear enough to author against.

Stop and report the missing prerequisite if any condition is not satisfied.
Do not perform new source research silently inside the authoring task.

## Required behavior

1. Translate the approved standards into coherent, observable skills.
2. Design prerequisites from conceptual dependency, not document order.
3. Keep curriculum data, pedagogical policy, learner state, and model
   interfaces separate.
4. Author original content; do not reproduce or closely paraphrase
   proprietary textbooks, AoPS material, or contest problems.
5. Preserve provenance. Model-assisted records use
   `provenance.origin: "llm_drafted"` and begin with
   `review.status: "pending_review"`.
6. Include age-appropriate misconceptions, hint progression, canonical
   answers, deterministic validation, and accessible text alternatives —
   **as required by the record's role**. Once the role-specific schemas in
   `docs/course-progression-architecture.md` §4.2 are approved and
   implemented, these obligations differ by role and must not be applied
   uniformly:
   - `teaching` records carry an explanation, optional worked example,
     accessibility notes, and an accessible alternative. They have **no**
     deterministic validator, **no** hint ladder, and **no** canonical
     answer, because they are not attemptable and produce no mastery
     evidence.
   - `practice` records keep today's full contract: deterministic validator,
     canonical and accepted answers, a contiguous hint ladder, forbidden
     leakage patterns, and misconception coverage.
   - `assessment` and `review` records require a deterministic validator,
     canonical and accepted answers, forbidden leakage patterns, and an
     accessible alternative, and are **forbidden** a hint ladder. An
     assessment item carrying hints is a defect, not a style choice.
     The canonical role contract is
     `docs/course-progression-architecture.md` §4.2; this list is a
     convenience restatement and §4.2 governs. Where assessment records live
     depends on `D-01`, which is open. Until those schemas exist, every record
     is a `practice` record and the uniform contract applies.
7. For every prerequisite edge, verify it is a genuine conceptual
   dependency: a learner must be mathematically/conceptually unable to
   achieve the downstream skill without the upstream one. An edge that only
   reflects a convenient teaching order, typical textbook sequencing, or
   shared surface-level procedure is not a valid prerequisite and must be
   removed or replaced with a narrower, explicitly justified dependency.
8. When multiple content records are authored for one skill, verify they
   are structurally distinct from each other and that, taken together, they
   exercise the skill's full `observableEvidence`/mastery-rule scope. Two
   records that vary only the numbers in the same pattern do not satisfy
   this; check coverage jointly across the whole set, not per-record.
   Compare records by **item identity and version**, and by the reasoning the
   item actually requires — not by whether their prompt strings differ, which
   both over- and under-detects.
   8a. **Check the catalog's record-count rule before adding a record.**
   `validateContentCatalog` currently enforces exactly two content records per
   skill and throws at module load, so adding a third record of any kind
   crashes the application at import. Confirm the current rule, and whether
   the role-aware replacement in `docs/course-progression-architecture.md`
   §11.2 has been approved and implemented, before authoring anything beyond
   the established pair.
9. For every misconception-tied distractor, trace the exact error mechanism
   named in its rationale step by step and confirm it deterministically
   produces the stated wrong-answer value. A plausible-sounding rationale
   that does not actually generate that value is a defect, not a style
   choice.
10. Never reveal a final answer earlier than the tutoring policy permits.
11. Add or update tests for every behavior or catalog-contract change.
12. Run the validation commands required by the playbook and repository
    instructions.
13. Before finishing, re-check that all self-descriptive documentation
    (handoff notes, README-style summaries, revision logs) accurately
    reflects the final state of the artifacts, not an earlier revision.
14. Update `docs/PROGRESS.md` with files, evidence, risks, and the next
    review step.

## Required output

- Versioned `Skill` records and prerequisite graph.
- Original or clearly LLM-drafted content records.
- Catalog wiring and relevant tests.
- Validation results.
- A review handoff listing scope, source section, assumptions, known gaps,
  and files requiring independent review.

Leave every new content record pending review. This skill and its wrapping
agent must never approve their own curriculum or change pending records to
reviewed.

## Lessons from prior pilots

These points come from the Grade 6 Math v2 pilot's independent review
findings (multiple remediation rounds were needed before the graph and
content passed independent review) and apply to every future curriculum
this skill authors:

- Prerequisite graphs drafted in a first pass tend to over-include
  procedural/instructional-sequencing edges; budget for a dedicated
  self-audit pass specifically hunting for these before treating a graph
  as final.
- Coverage-narrowing (two items that are really one item with different
  numbers) is the most common content defect found in review; check it
  explicitly per skill before finalizing a batch.
- Distractor-rationale-to-value mismatches are the second most common
  defect; verify the arithmetic/logic of every distractor, not just its
  plausibility.
