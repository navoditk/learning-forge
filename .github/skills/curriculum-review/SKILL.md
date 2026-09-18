---
name: curriculum-review
description: Independently reviews researched and authored curricula for source fidelity, standards coverage, pedagogy, originality, accessibility, and repository integrity. Use after curriculum authoring and before human approval.
---

# Curriculum review

Perform an independent, read-only review using
`docs/curriculum-sources.md`, `docs/curriculum-authoring-playbook.md`,
`docs/content-review.md`, and the repository's schemas and tests.

## Independence rules

- Re-derive conclusions from source documents and repository artifacts.
- Do not rely on the authoring agent's self-evaluation or hidden reasoning.
- Do not edit the curriculum under review.
- Do not change `review.status` or claim human approval.
- Treat model judgment as advisory, never as authoritative mastery or
  curriculum evidence.

## Review dimensions

1. **Source fidelity:** each standards claim maps to a cited primary source;
   editions and authority levels are represented accurately.
2. **Coverage:** required domains and competencies are neither omitted nor
   duplicated without explanation.
3. **Skill design:** boundaries are coherent, observable, age-appropriate,
   and neither too broad nor fragmented.
4. **Prerequisites:** edges reflect conceptual dependency and contain no
   cycles, hidden gaps, or unjustified barriers.
5. **Subject accuracy:** independently solve or verify every reviewed item,
   accepted answer, method, unit, and validator.
6. **Pedagogy:** misconceptions, difficulty progression, hints, and mastery
   evidence support learning without premature answer leakage.
7. **Originality and licensing:** flag copied or suspiciously close
   language, unverified license claims, and provenance mismatches.
8. **Accessibility and safety:** verify text-equivalent paths, age
   appropriateness, and the repository's child-safety constraints.
9. **Technical integrity:** run existing schema, catalog, test, formatting,
   type, and build checks relevant to the change.

## Finding format

For each finding report severity (`blocker`, `major`, or `minor`), confidence,
file and line(s), source or rule violated, evidence, and the smallest safe
remediation. Separate verified defects from questions and residual risks.

End with one recommendation: `not ready for human review`, `ready for human
review with noted risks`, or `ready for human review`. This is not approval;
only the human product/content owner can approve the curriculum.
