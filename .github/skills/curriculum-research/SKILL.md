---
name: curriculum-research
description: Researches authoritative standards, sequencing guidance, and legally safe inspiration sources for a new curriculum, grade, subject, or enrichment program. Use before creating or expanding a curriculum.
---

# Curriculum research

Follow `docs/curriculum-research-playbook.md` exactly.

## Required inputs

- Target subject, grade, jurisdiction, or enrichment program.
- Intended learner population and school-alignment context.
- Any requested local district or pacing alignment.
- Intended content tiers, such as core, depth, or contest.

If an input that materially changes the source set is missing, ask for it
before researching. Do not infer a jurisdiction or school system.

## Source rules

1. Start with official primary sources: standards bodies, departments of
   education, school districts, or the program owner.
2. Record exact document title, issuing body, edition or publication date,
   URL, retrieval date, and the claim each source supports.
3. Use secondary sources only to locate or interpret a primary source, and
   label them as secondary.
4. Distinguish mandatory standards from optional sequencing guidance and
   style inspiration.
5. Do not copy or closely paraphrase proprietary lessons, textbook content,
   contest problems, passages, or diagrams.
6. Never describe a source as licensed unless the actual license terms have
   been located and recorded.
7. Record unresolved conflicts, missing editions, inaccessible sources, and
   unsupported assumptions explicitly.
8. Never assert that a source "does not exist" or "was not found" from a
   single check (e.g., one homepage visit). Only report exactly what was
   checked, when, and with what result (including the literal HTTP status
   code observed), and label the absence as "not located via the searches
   performed" rather than a general non-existence claim.
9. Before finalizing scope, cross-check the target program/subject against
   existing product docs (for example `docs/02-curriculum-and-pedagogy.md`
   and any prior `docs/curriculum-sources.md` entries) for previously
   stated commitments to related programs, tiers, or competitions. If a
   related program has not yet been researched, say so explicitly and
   record it as out of scope for this dossier rather than omitting it
   silently — do not infer that an unresearched program is unimportant.

## Required output

Add a dated section to `docs/curriculum-sources.md` containing:

- scope and learner context;
- standards framework and version;
- source register with stable citations and retrieval dates;
- standards-domain coverage summary;
- sequencing source and its authority level, if used;
- content-tier inspiration and originality constraints;
- conflicts, gaps, and decisions requiring human review;
- a concise research handoff for the curriculum authoring agent.

Do not create skill records or learning content. Mark the research section
as `Pending product/content-owner review`; this skill cannot approve its own
work. Curriculum authoring may begin only after a human changes that status
to approved.

## Lessons from prior pilots

These points come from the Grade 6 Math v2 pilot's independent review
findings and apply to every future curriculum this skill researches:

- Source metadata (edition, adoption date, revision history) must be read
  from the primary document itself, never inferred from a filename or URL
  pattern.
- A dossier's stated scope must match what the product already commits to.
  If the product intends multiple related programs (for example several
  competition tracks under one subject), name each one explicitly as
  in-scope, bounded-inspiration-only, or explicitly deferred to its own
  future dossier — do not merge or drop any of them without saying so.
