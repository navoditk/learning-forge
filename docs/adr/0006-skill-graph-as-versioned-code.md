# ADR-0006: Store the skill graph as versioned code, not a database table

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product/engineering owner

## Context

`docs/05-data-and-student-model.md` lists `Curriculum`, `Standard`, `Skill`,
and `SkillPrerequisite` as core entities. Read literally, that suggests
Postgres tables. But LF-0.5 already established a different precedent for
authored, rarely-changing reference data: ratios content is stored as
version-controlled JSON validated by Zod at import (`docs/content-review.md`),
not as database rows, specifically to keep human review status distinct from
automated schema validation. `MasteryEstimate.skillCode` in
`prisma/schema.prisma` is already a plain string, not a foreign key, because
no canonical skill table exists yet.

## Decision

The skill graph (`docs/02-curriculum-and-pedagogy.md`'s 19 Grade 6 Math
skills) is authored as versioned JSON under `content/skills/*.json`, validated
by `SkillSchema` (`src/contracts/curriculum.ts`) and loaded through
`skillCatalog` (`src/curriculum/catalog.ts`) — the same pattern as
`contentCatalog`. `validateSkillCatalog` additionally checks that every
prerequisite code refers to a real skill in the catalog and that the
prerequisite graph has no cycles (`topologicalSkillOrder`). The content
catalog's `validateContentCatalog` now also checks that every content item's
`skillCode` exists in `skillCatalog`, which previously was not validated at
all.

This does not introduce a `Skill` Postgres table or add a foreign key from
`MasteryEstimate.skillCode` to it. Skill/curriculum data is authored reference
data, like content, not per-learner evidence.

## Explicit non-decisions

- This does not implement `Standard` as its own entity distinct from the
  `standards: string[]` field already used by both skills and content; no
  need for that separation has appeared yet.
- This does not add referential integrity between `MasteryEstimate.skillCode`
  (Postgres) and `skillCatalog` (code) at the database level. That would
  require a migration touching an already-shipped table; if skill-code drift
  between the two becomes a real problem, revisit then.
- This does not implement `ReviewSchedule` (spaced review timing). The planner
  built alongside this ADR (`src/planner/plan-next-activities.ts`) only
  prioritizes unmet prerequisites and not-yet-secure skills — it does not
  fabricate a review-due date, since no real spaced-review policy exists yet.

## Alternatives considered

- A `Skill`/`SkillPrerequisite` Postgres table with real foreign keys:
  rejected for now — it would mean two different persistence strategies for
  conceptually similar authored data (content as JSON, skills as DB rows),
  and would require migrating `MasteryEstimate.skillCode` into a real
  foreign-key relationship, which is a larger, riskier change than this
  scaffolding increment needs.

## Consequences and reversal signals

If the skill graph needs runtime editing by a non-engineer (e.g., a content
admin UI), or if per-skill data needs its own review/versioning workflow
distinct from content review, revisit toward a database-backed model at that
point.
