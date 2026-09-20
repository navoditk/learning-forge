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

### Current pause (2026-09-19)

**New curriculum authoring is paused.** Architecture approval alone does **not**
lift it. The full gate set is `D-61` in
`docs/course-progression-decisions.md`; in summary, resuming role-based
authoring requires the architecture approved **and** `D-58` resolved with
Stage A0 shipped, `D-01` resolved (plus `D-02` if held-out and `D-03`),
`D-37`/`D-38`, `D-56`/`D-57`, `D-40`, `D-52` (plus `D-53` if hybrid), and
Stages A0 and A1 merged so the role schemas exist to author against.

Research and dossier review continue throughout. See `docs/curriculum-agents.md`
for the boundary.

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
   restructuring existing content, exactly as ADR-0006 anticipated. `program`
   must already be a value in `CurriculumProgramSchema`
   (`src/contracts/curriculum.ts`) — extend that enum (and, if the program
   should appear in the subject switcher, `PROGRAM_ROSTER` in
   `src/curriculum/program-roster.ts`) as a one-time prerequisite step before
   authoring any skill JSON for it, not as part of authoring itself.
3a. **Skill-code namespace.** `skillsByCode` is a single flat map across every
   program, so codes must never collide across programs, including with
   Grade 6 Math's existing 27 skills. Prefix every new program's skill codes
   with a short, stable program tag and a hyphen (e.g. `mk6-` for Math
   Kangaroo Grade 6, `moems6-` for MOEMS Division E, `amc8-` for AMC 8,
   `mc6-` for MATHCOUNTS), so a skill reads like `mk6-ratio-reasoning` rather
   than a bare `ratio-reasoning` that could shadow (or be shadowed by) a
   Grade 6 Math skill of a similar name. Do not reuse a bare Grade 6 Math
   skill code even if the underlying concept overlaps — content mode
   (`core`/`depth`/`contest`) and `program` already capture that a topic is
   revisited at contest depth; a shared code would incorrectly imply the two
   programs share one skill's prerequisite/mastery state.
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
   **role**, and mode (`core`, `depth`, or `contest`) —
   `docs/content-authoring-pipeline.md`, step 1.
2. Draft candidate content records (model-assisted or hand-authored) shaped
   to the schema **for that role**, tagged with the correct
   `provenance.origin` (`original` or `llm_drafted`; `licensed` only if
   `docs/curriculum-sources.md` explicitly recorded a licensing decision for
   this subject) and `review.status: "pending_review"`.
3. Run `npm run content:validate` to check schema shape, unique IDs,
   contiguous hint ordering, required skill coverage, and forbidden
   answer-leakage patterns in hint text.
4. A human educator/content owner completes the full
   `docs/content-review.md` checklist (mathematics/subject-matter accuracy,
   standard mapping, misconception/hint progression, originality relative to
   the style sources named in `docs/curriculum-sources.md`, accessibility)
   before setting `review.status: "reviewed"`.

**Role-specific contracts (specification; pending approval).**
`docs/course-progression-architecture.md` §4.2 replaces the single
`ContentItemSchema` with a role-discriminated union. Until that is approved
and implemented, every record is a `practice` record and today's uniform
contract applies unchanged. After it lands:

| Role | Requires | Forbids |
|---|---|---|
| `teaching` | explanation, accessibility notes, accessible alternative, provenance, review; optional worked example and figure | deterministic validator, hint ladder, forbidden-leakage patterns |
| `practice` | today's full contract, unchanged | — |
| `assessment` | deterministic validator, canonical and accepted answers, forbidden-leakage patterns, accessible alternative, bank membership | **hint ladder** |
| `review` | deterministic validator, accessible alternative | **hint ladder** |

A teaching record is therefore **not** expected to carry a validator or hint
ladder, and requiring one would force teaching material to masquerade as an
assessable problem. Assessment and review records keep the validator contract
because they are scored, but must never ship a hint ladder.

The **canonical role contract** is `docs/course-progression-architecture.md`
§4.2. The table above is a convenience restatement; §4.2 governs.

Where assessment records live is `D-01` (open): Branch A puts them in this
repository, Branch B in the store chosen by `D-02`.

Note also that `validateContentCatalog` currently requires **exactly two**
content records per skill and throws at module load. Adding a teaching or
assessment record to an existing skill is blocked until that rule is replaced
(`docs/course-progression-architecture.md` §11.2 and decision `D-38`).

Nothing else in this step changes: the same schema-then-human-review gate
applies regardless of subject or role, and content only reaches the catalog
after review.

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
