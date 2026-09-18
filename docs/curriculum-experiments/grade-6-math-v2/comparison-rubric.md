# Grade 6 Math v1/v2 comparison rubric

- **Registered:** 2026-09-15, before candidate authoring
- **Baseline:** `docs/curriculum-experiments/grade-6-math-v2/baseline.md`
- **Candidate location:** `experiments/grade-6-math-v2/`
- **Purpose:** compare the existing curriculum with a new candidate produced
  from an independently researched and human-approved source dossier

Do not change this rubric after candidate authoring begins without recording
the change, rationale, date, and effect on comparability.

## Hard gates

A candidate cannot be recommended for integration if any gate fails:

1. Research dossier is based on cited primary sources and explicitly
   approved by the human product/content owner.
2. Every claimed standards mapping is traceable to that dossier.
3. Skill and prerequisite graphs pass schema, reference, and cycle checks.
4. Every content record has valid provenance and begins pending human review.
5. No known copied or closely paraphrased proprietary material.
6. Canonical answers and validators pass independent subject-matter checks.
7. Hint ladders satisfy the tutoring policy and do not leak final answers.
8. Required accessibility information and nonvisual alternatives are
   present.
9. Relevant repository validation commands pass.
10. The independent reviewer reports no unresolved blocker finding.

## Scored dimensions

Score each version from 0 to 4 using evidence, not preference:

- **0 — unacceptable:** absent, materially incorrect, or unsafe.
- **1 — weak:** major gaps require redesign.
- **2 — adequate:** usable with meaningful corrections.
- **3 — strong:** complete and well-supported with minor gaps.
- **4 — exemplary:** comprehensive, traceable, and independently verified.

| Dimension | Weight | Required evidence |
|---|---:|---|
| Standards fidelity and traceability | 15 | Source-to-standard-to-skill matrix; unsupported mappings |
| Standards and domain coverage | 10 | Required, covered, duplicated, and omitted competencies |
| Skill boundaries and granularity | 8 | Skill definitions, observable evidence, overlap analysis |
| Prerequisite correctness | 8 | Graph, cycle check, conceptual justification, orphan/root analysis |
| Pedagogical sequence and progression | 10 | Developmental sequence, difficulty bands, transfer progression |
| Misconceptions and mastery evidence | 8 | Misconception coverage, observable evidence, mastery-check rules |
| Subject accuracy and validators | 12 | Independent re-solves, accepted-answer and boundary tests |
| Hint quality and answer-leakage safety | 8 | Hint-ladder review and tutor-policy/eval evidence |
| Originality, licensing, and provenance | 7 | Provenance audit and suspicious-similarity findings |
| Accessibility and age appropriateness | 6 | Text alternatives, interaction assumptions, readability review |
| Maintainability and schema compatibility | 4 | Validation, catalog wiring complexity, duplication, documentation |
| Authoring efficiency and review burden | 4 | Model/tool cost where available, elapsed effort, defect counts, rework |
| **Total** | **100** | Weighted score plus qualitative findings |

## Comparison method

1. Freeze both versions before comparative review.
2. Generate deterministic inventories for skills, standards, edges, content,
   provenance, review states, and validation results.
3. Review the full skill graphs and standards mappings.
4. Review all candidate content records. For qualitative comparison, use a
   balanced sample from the baseline covering every domain, difficulty band,
   and content mode; disclose the sample and selection method.
5. Independently solve sampled records without consulting their canonical
   answers first.
6. Report baseline and candidate defects using the same severity definitions.
7. Score each dimension with citations to artifacts and findings.
8. List improvements that can be merged independently of wholesale
   replacement.

The comparison must distinguish:

- all baseline records from its 38 reviewed records;
- structural validation from human pedagogical approval;
- factual findings from reviewer judgment;
- curriculum design quality from the quality of a small content sample.

## Required decision output

| Dimension | Baseline v1 | Candidate v2 | Preferred | Evidence and trade-offs |
|---|---:|---:|---|---|
| Standards fidelity and traceability |  |  |  |  |
| Standards and domain coverage |  |  |  |  |
| Skill boundaries and granularity |  |  |  |  |
| Prerequisite correctness |  |  |  |  |
| Pedagogical sequence and progression |  |  |  |  |
| Misconceptions and mastery evidence |  |  |  |  |
| Subject accuracy and validators |  |  |  |  |
| Hint quality and leakage safety |  |  |  |  |
| Originality, licensing, and provenance |  |  |  |  |
| Accessibility and age appropriateness |  |  |  |  |
| Maintainability and compatibility |  |  |  |  |
| Authoring efficiency and review burden |  |  |  |  |

The final recommendation must be one of:

1. retain baseline v1;
2. adopt candidate v2;
3. merge specified strengths from each into a reviewed v3;
4. revise the agents/skills and repeat the experiment.

Only the human product/content owner can approve integration.

