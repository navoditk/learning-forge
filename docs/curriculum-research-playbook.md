# Curriculum research playbook

## Purpose

Before any skill graph or content record is authored for a new subject,
grade, or program (e.g., Grade 6 ELA, AMC 8, a different state's standards),
this playbook produces one thing: a filled-in, dated, cited section in
`docs/curriculum-sources.md` that names exactly what standards framework,
sequencing input, and content-style disciplines will govern that work. No
skill or content JSON should be authored before this step completes — it is
the input to `docs/curriculum-authoring-playbook.md`, not a parallel track.

This is a research and documentation task, not a coding task. It produces no
application code and touches no runtime path; it can be done entirely by
reading and citing sources, then writing the result down.

The executable repository skill is
`.github/skills/curriculum-research/SKILL.md`; the thin
`curriculum-researcher` custom agent pins its model and tools. See
`docs/curriculum-agents.md`.

## When to run this

- Adding a new grade level within an existing subject (e.g., Grade 7 Math).
- Adding a new subject (e.g., Grade 6 ELA, per the Phase 2/3 roadmap in
  `docs/01-product-proposal.md`).
- Adding a new contest/enrichment program (e.g., AMC 8, MATHCOUNTS) as its
  own top-level section under the existing `program` field on `Skill`
  (ADR-0006 already anticipates this: "future programs ... can be added as
  new top-level sections without restructuring existing content").
- Revising standards for an already-covered grade/subject if the adopting
  state or CCSS itself changes.

## Inputs to gather

For the target subject/grade/program, research and record each of the
following before moving on. Each item must end with something concrete enough
to cite later — a real document title, edition/date, and link/reference —
not a paraphrase from memory.

1. **Standards framework.** The specific, named standards document that
   defines expected competencies (e.g., CCSS-M for a state that has adopted
   it, a state-specific framework, NGSS for science, a contest's published
   syllabus). Record: exact name, adopting body, edition/publication date,
   and a canonical reference (official URL or document identifier).
2. **Local/school sequencing input (optional).** If a specific school
   district's published pacing guide or year-at-a-glance is used as a
   planning aid (as IUSD's was for Grade 6 Math), record the exact document
   title, publication year, and a link or citation sufficient for someone
   else to find the same document later. If no such document can be found
   or cited concretely, do not reference one informally — either skip this
   input entirely and rely on prerequisite-graph ordering alone, or keep
   looking until a real, citable document exists. (`docs/curriculum-sources.md`
   documents the cost of skipping this step for Grade 6 Math: an
   unresolved, undated reference that could not later be verified.)
3. **Content style/inspiration sources per tier.** For each content tier the
   subject will use (Core, Depth, Contest — or an equivalent breakdown for a
   non-math subject), name what general style or reasoning tradition
   original content may draw inspiration from (e.g., "AoPS-style reasoning,"
   "Math Kangaroo/MOEMS/AMC-style skill types"), and explicitly confirm: no
   text, problems, diagrams, or passages from any copyrighted or licensed
   source will be reproduced or closely paraphrased. If a genuinely licensed
   source is intended to be used verbatim (not just style inspiration), stop
   and treat it as a distinct, explicit licensing decision — record the
   license terms, and mark any resulting content `provenance.origin:
   "licensed"` rather than `original`, per `docs/content-review.md`.
4. **Known gaps or caveats.** Anything that could not be pinned down
   precisely (e.g., "no specific edition date found," "sequencing guide is
   informal and undocumented") must be written down as an explicit open item
   rather than silently omitted. An honest gap is far more useful later than
   an untraceable assumption.
5. **Historical question banks / past-paper archives (contest and
   olympiad-style programs).** For any contest, olympiad, or exam-style
   program (Math Kangaroo, MOEMS, AMC 8, MATHCOUNTS, and similar), actively
   search for and record the program's own official archive of past
   competitions/exams (e.g., a "past papers," "previous years," or "problem
   archive" page on the program-owner's official site). Record: the exact
   archive page title, issuing body, the range of years/levels it claims to
   cover, the URL, and retrieval status. Where the official archive itself
   cannot be fully read (e.g., client-side rendering, login walls), still
   record its existence and scope from what is extractable (page title,
   metadata, or a direct fetch of an individual year's PDF), and note what
   could not be confirmed. This archive is the preferred source for topic
   coverage, difficulty progression, and skill-type inspiration during
   authoring — ahead of third-party prep-provider summaries — subject to the
   same originality rule as item 3: informing skill *types* and difficulty
   levels only, never reproducing an actual archived problem, wording,
   diagram, or answer-choice set.

## Process

1. Search for the standards framework's official, canonical publication
   first (a state department of education site, the standards body's own
   site, or a contest organization's published syllabus/past papers page).
   Prefer primary sources over summaries, blog posts, or third-party
   textbook vendor pages.
2. If a local sequencing input is desired, search for a specific district or
   school's published pacing document. Treat "I recall districts generally
   teach X before Y" as insufficient — either find a citable document or
   skip this input (see item 2 above).
3. For content style sources, identify the general pedagogical tradition or
   competition family by name, and read enough about its *style* (format,
   reasoning approach, typical skill types) to describe it precisely without
   needing to reproduce any of its actual problems or text.
4. For contest/olympiad-style programs, search specifically for the
   program-owner's official past-paper or problem archive (see input item 5
   above) before relying on third-party aggregators for topic coverage.
5. Write the findings into a new dated section of `docs/curriculum-sources.md`
   following the structure of the existing Grade 6 Math section (Standards
   source / Local sequencing source / Content originality and style sources
   / Open items).
6. Have the product/content owner review the new section before any skill or
   content authoring begins, the same review gate already used for content
   provenance (`docs/09-decisions-and-open-questions.md`, decision #4).

## Output

A new, reviewed section in `docs/curriculum-sources.md` for the target
subject/grade/program, with every gap explicitly named rather than implied.
This is the sole prerequisite for `docs/curriculum-authoring-playbook.md`.

## Non-goals

- This playbook does not draft skill graph entries, content records, or any
  JSON. That is `docs/curriculum-authoring-playbook.md`'s job, and it must
  not start until this playbook's output exists and is reviewed.
- This playbook does not decide licensing terms for genuinely licensed
  content beyond flagging that the decision exists; a real licensing
  agreement is a legal/product decision outside this document's scope.
- This playbook does not touch `TutorModel`, learner data, or any runtime
  code path.
