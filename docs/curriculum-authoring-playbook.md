# Curriculum authoring playbook

## Purpose

Turn a reviewed `docs/curriculum-sources.md` section (produced by
`docs/curriculum-research-playbook.md`) into a real, versioned skill graph
and content catalog for a new subject, grade, or program. This playbook
covers the step that is currently undocumented: going from "we know our
standards and sources" to "we have `Skill` records and content JSON that
pass validation and human review." It explicitly hands off to the two
pipelines that already exist and are not duplicated here:
`docs/content-authoring-pipeline.md` (drafting individual content records)
and `docs/content-review.md` (the human review checklist/gate).

The executable repository skill is
`.github/skills/curriculum-authoring/SKILL.md`; the thin
`curriculum-author` custom agent pins its model and tools. Independent review
uses `.github/skills/curriculum-review/SKILL.md` through the
`curriculum-reviewer` agent. See `docs/curriculum-agents.md`.

## Precondition

Do not start this playbook until the target subject/grade/program has a
reviewed section in `docs/curriculum-sources.md`. If it does not, stop and
run `docs/curriculum-research-playbook.md` first. Authoring skills or
content against an unresearched or uncited source repeats the exact gap this
whole effort is meant to close (see `docs/curriculum-sources.md`'s IUSD open
item for what that costs later).

## Workflow

### 1. Design the skill graph

1. From the cited standards framework, list the target competencies for the
   subject/grade/program and group them into skills at roughly the same
   granularity as the existing Grade 6 Math skills (one skill per
   `docs/02-curriculum-and-pedagogy.md` bullet, e.g. `ratio-language`,
   `unit-rates` — not one skill per individual standard code, and not one
   skill for an entire domain).
2. For each skill, decide `prerequisiteSkillCodes` based on genuine
   conceptual dependency, not just document ordering. If a local sequencing
   input exists in `docs/curriculum-sources.md`, use it as a starting guess
   for likely prerequisites, but the prerequisite graph is the thing that
   actually governs runtime behavior (ADR-0006) — it must reflect real
   dependency, and it must be acyclic (`topologicalSkillOrder` enforces
   this, and `validateSkillCatalog` will reject a cycle).
3. Set `program` (e.g., `grade-6-math`, `grade-6-ela`, `amc-8`) so the new
   subject/program appears as its own top-level section on the generated
   curriculum site (`scripts/generate-curriculum-site.ts`) without
   restructuring existing content, exactly as ADR-0006 anticipated.
4. Author each `Skill` as a new JSON file under `content/skills/`, shaped to
   `SkillSchema` (`src/contracts/curriculum.ts`): standards codes exactly as
   cited in `docs/curriculum-sources.md`, prerequisites, observable
   evidence, common misconceptions, difficulty bands, and mastery-check
   rules.
5. Add the new skill(s) to the `rawSkills` array in
   `src/curriculum/catalog.ts` and run `npm run content:validate` (or the
   project's equivalent skill-catalog validation) to confirm schema shape,
   unique codes, and an acyclic, fully-resolvable prerequisite graph.

### 2. Draft and review content per skill

For each new skill, follow the existing, unchanged pipelines:

1. A human names the target skill (from step 1), standard, difficulty band,
   and mode (`core`, `depth`, or `contest`) — `docs/content-authoring-pipeline.md`,
   step 1.
2. Draft candidate content records (model-assisted or hand-authored) shaped
   to `ContentItemSchema`, tagged with the correct `provenance.origin`
   (`original` or `llm_drafted`; `licensed` only if `docs/curriculum-sources.md`
   explicitly recorded a licensing decision for this subject) and
   `review.status: "pending_review"`.
3. Run `npm run content:validate` to check schema shape, unique IDs,
   contiguous hint ordering, required skill coverage, and forbidden
   answer-leakage patterns in hint text.
4. A human educator/content owner completes the full
   `docs/content-review.md` checklist (mathematics/subject-matter accuracy,
   standard mapping, misconception/hint progression, originality relative to
   the style sources named in `docs/curriculum-sources.md`, accessibility)
   before setting `review.status: "reviewed"`.

Nothing in this step changes: the same schema-then-human-review gate applies
regardless of subject, and content only reaches the catalog after review.

### 3. Wire into the runtime catalog

1. Add the new content records to `content/{...}` and the corresponding
   catalog array (mirroring how `contentCatalog`/`skillCatalog` are
   assembled today in `src/curriculum/catalog.ts`).
2. Confirm `validateContentCatalog` passes: every content item's
   `skillCode` must resolve to a real skill in `skillCatalog` (ADR-0006).
3. Regenerate the public curriculum site
   (`.github/workflows/curriculum-site.yml` does this automatically on push
   to `main`) and spot-check that the new subject/program section renders
   as expected with no leaked answers/hints.
4. Run the full validation sweep already used for every other content
   change: `npm run typecheck`, `npm run lint`, `npm test`, `npm run
   content:validate`, `npm run build`.

### 4. Update documentation

1. Add the new subject/grade/program to `docs/02-curriculum-and-pedagogy.md`'s
   skill graph listing.
2. Confirm the corresponding `docs/curriculum-sources.md` section is
   complete (no silently-skipped inputs; open items explicitly listed).
3. Add a `docs/PROGRESS.md` verification-log entry describing what was
   added, citing the sources section used, and the validation commands run.

## Non-goals

- This playbook does not change how the live tutor (`TutorModel`,
  `TutorHarness`) generates hints or scores responses; adding a new subject
  is purely an authored-data change, never a runtime/model-behavior change.
- This playbook does not replace `docs/content-review.md`'s human review
  gate. No amount of automated validation substitutes for a human
  confirming the mathematics/subject-matter accuracy and originality of a
  specific record.
- This playbook does not decide product scope (i.e., *whether* a new
  subject/grade should be added at all) — that remains a product decision
  recorded in `docs/09-decisions-and-open-questions.md`, same as it was for
  Grade 6 Math.
