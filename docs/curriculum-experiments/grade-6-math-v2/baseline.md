# Grade 6 Math baseline v1

- **Captured:** 2026-09-15
- **Git branch:** `main`
- **Pinned commit:** `162b8ac8aa56ed0ac3d0cf86983ac66655b27201`
- **Baseline source:** the committed files under `content/`,
  `src/curriculum/`, `src/content/`, `src/contracts/`, `tests/curriculum/`,
  and `tests/content/`
- **Candidate isolation:** no output under
  `experiments/grade-6-math-v2/` is part of this baseline or loaded by the
  runtime catalogs

The repository had unrelated uncommitted work when this snapshot was
captured. The curriculum content, curriculum/content contracts, catalog
loaders, and curriculum/content tests listed above had no working-tree
changes, so commit `162b8ac8aa56ed0ac3d0cf86983ac66655b27201`
reproduces this baseline.

## Inventory

| Measure | Baseline |
|---|---:|
| Programs | 1 (`grade-6-math`) |
| Domains | 5 |
| Skills | 22 |
| Distinct mapped standards codes | 27 |
| Prerequisite edges | 13 |
| Content records | 44 (2 per skill) |
| Hand-authored (`original`) records | 10 |
| Model-assisted (`llm_drafted`) records | 34 |
| Reviewed records | 38 |
| Pending-review records | 6 |
| Licensed records | 0 |

### Skills by domain

| Domain | Skills |
|---|---:|
| Ratios and proportional reasoning | 5 |
| Number system | 6 |
| Expressions and equations | 5 |
| Geometry | 3 |
| Statistics | 3 |

### Standards represented

`6.RP.A.1`, `6.RP.A.2`, `6.RP.A.3`, `6.NS.A.1`, `6.NS.B.2`,
`6.NS.B.3`, `6.NS.B.4`, `6.NS.C.5`, `6.NS.C.6`, `6.NS.C.7`,
`6.EE.A.1`, `6.EE.A.2`, `6.EE.A.3`, `6.EE.A.4`, `6.EE.B.5`,
`6.EE.B.7`, `6.EE.B.8`, `6.EE.C.9`, `6.G.A.1`, `6.G.A.2`,
`6.G.A.3`, `6.G.A.4`, `6.SP.A.1`, `6.SP.A.2`, `6.SP.A.3`,
`6.SP.B.4`, `6.SP.B.5`.

This list records what the baseline claims; it does not establish that the
mapping is complete or accurate. The new source research and independent
comparison must verify both.

### Pending-review content

- `content/expressions-and-equations/whole-number-exponents-1.json`
- `content/expressions-and-equations/whole-number-exponents-2.json`
- `content/number-system/gcf-and-lcm-1.json`
- `content/number-system/gcf-and-lcm-2.json`
- `content/number-system/multi-digit-division-1.json`
- `content/number-system/multi-digit-division-2.json`

These six records must not be represented as human-approved baseline
content. Comparisons must report results both for all 44 records and for the
38 reviewed records where review status affects the conclusion.

## Validation evidence

Captured on 2026-09-15:

- `npm run curriculum:validate`: 1 file, 7 tests passed.
- `npm run content:validate`: 1 file, 4 tests passed.
- `validateSkillCatalog` checks unique/resolvable prerequisite references
  and rejects cycles.
- `validateContentCatalog` checks content-to-skill references, provenance,
  deterministic validators, contiguous hints, and forbidden answer leakage.

These checks establish structural integrity, not standards completeness,
mathematical correctness, pedagogical quality, originality, or human
approval.

## Baseline caveats to test

- `docs/curriculum-sources.md` records that the IUSD sequencing influence was
  informal and lacks a dated, linked source.
- The 27 standards codes have not yet been reconciled against a newly
  researched, versioned official Grade 6 standard inventory.
- The existing catalog has two content records per skill, which is coverage
  breadth but not evidence of sufficient instructional depth.
- Six content records remain pending human review.
- Existing tests validate contracts and invariants but do not independently
  verify every standards mapping or answer.

