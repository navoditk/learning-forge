# Development expansion plan and handoff

## Scope and current checkpoint

Approved planning scope, 2026-10-09: add implementation/review capabilities,
model-diverse review, parallel curriculum workflows, a richer learner UI,
main-page access to curriculum sources, and introductory Python research for
the current Grade 6 audience. This is not approval to publish curricula,
change mastery policy, enable C4/C5, or run unbounded fleets.

Read `AGENTS.md`, `docs/agent-orchestration.md`, and the relevant playbook.
For progression, also start at `docs/course-progression-handoff.md`.
The manual gate record now records the independent-review acceptance dated
2026-10-10; representative shadow review and explicit C4 authorization remain
outstanding. Use the gate record, not this summary, for authority.

## Issue-sized work packets

**2026-10-10 course-extension checkpoint:** five reviewed first-unit designs
are accepted and integrated (AMC 8, MOEMS, Kangaroo, MATHCOUNTS and Spelling).
D-75's shared catalog foundation is implemented and validated, preserving
current Grade 6 data and behavior. The single decision matrix now holds 63
open extension candidates (D-76–D-138). No new real unit, teaching or private
bank is active or authorized for drafting. Resume from
`docs/course-progression-handoff.md`, not the historical research statuses in
the table below. Source-index expansion, Geography/Olympiad author provenance
and the separate Python implementation blocker remain outstanding.

**Shared teaching checkpoint:** the owner accepted the reviewed contract and
D-139/D-142 recommended shapes. T1 disconnected schemas/fixtures are integrated
after Sonnet implementation and GPT cross-family correction review;
`npm run verify` passed (1,641 tests and build). There are 77 approved and
67 open decisions. Next is a writer-free T2 privacy/migration proposal, not
execution. The learner-row interlock, replay exposure horizon, migration and
serving stages remain separately gated; no real content or writer is authorized.

| ID            | Increment                                                                   | Prerequisites                                                                                      | Status / evidence required                                                                                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SETUP         | Shared review/model policy, skills, UI playbooks and launch adapters        | Approved role/model choices                                                                        | Implemented and verified; seven skills discovered in all three clients, approved native model checks pass, shared-policy and corrected UI guidance independently confirmed. No runtime release approval.                                                |
| SOURCES-1     | Main-page curriculum resources entry and browsable per-program source index | Source-display contract below; independent UI review                                               | Implemented; verify and 10 browser checks pass, deployment tracing verified, GPT cross-family review approves for human review. Human accessibility/product/privacy/release gates remain separate.                                                      |
| UI-1          | Rich course overview and reusable topic detail prototype                    | Existing API inventory, synthetic fixtures, `ui-implementation`                                    | Implemented; verify passes, full browser suite 66 passed/one gated skip, cross-family GPT review approves for human review. Manual accessibility/release gates and missing API version-envelope limits remain.                                          |
| UI-2          | Assessment-gated next-topic flow and remediation                            | C4/C5 authorization and approved policy/content                                                    | Blocked on applicable gates; direct-route refusal and refresh/resume evidence, accessibility and scoring tests                                                                                                                                          |
| UI-3          | Optional recall flash cards and subject-specific interactions               | Approved content-role contract, UI-1; independent review                                           | Recall foundation and lifecycle L1 complete; verify 1519 tests/build. S-01 through S-14 approved for L1 only. Next: separately reviewed L2 persistence. Delivery blocked on L3 lifecycle/coordination, private coverage, idempotency and content gates. |
| PY-RESEARCH   | Introduction to Programming in Python for Grade 6 beginners                 | Research skill; no learner-data/provider requirement                                               | Planned research only; source dossier, licensing, scope, prerequisites, environment/safety decisions and independent review                                                                                                                             |
| GEO-REVIEW    | Review existing Grade 6 Geography Bee dossier                               | Pin current dossier revision                                                                       | Ready to scope; independent primary-source review, then human approval                                                                                                                                                                                  |
| SCI-REVIEW    | Review existing Grade 6 Science Olympiad Division B dossier                 | Pin season and current dossier revision                                                            | Ready to scope independently of GEO-REVIEW                                                                                                                                                                                                              |
| ELA-RESEARCH  | Grade 6 ELA source research or review of any existing dossier               | Inventory source register first                                                                    | Planned; do not duplicate completed research                                                                                                                                                                                                            |
| SOC-RESEARCH  | Grade 6 Social Studies; California IMPACT book alignment                    | Confirm exact book title/edition or ISBN, jurisdiction and any school pacing                       | Planned independent school-curriculum dossier; existing `grade-6-social-studies` placeholder remains unavailable. Book metadata/sequence only unless reproduction rights explicitly verified; distinct from Geography Bee.                              |
| SCI-RESEARCH  | Grade 6 school Science, separate from Science Olympiad                      | Confirm jurisdiction, integrated versus discipline-specific course and any adopted textbook/pacing | Planned independent school-curriculum dossier; existing `grade-6-science` placeholder remains unavailable. Standards/course model must be established separately from Olympiad event coverage.                                                          |
| AMC8-REFRESH  | Refresh existing AMC 8 source research for the Grade 6 learner              | Pin approved dossier; check ownership of existing AMC research worktree                            | Added 2026-10-10; existing approved research is the baseline. Verify current eligibility/format, official past-paper archive, source access and rights; record only changes/gaps.                                                                       |
| MC-REFRESH    | Refresh existing Grade 6 MATHCOUNTS source research                         | Pin approved dossier and current season                                                            | Added 2026-10-10; verify current program rules, official handbook/problem archives and rights. Do not duplicate the approved dossier or author content.                                                                                                 |
| MK-REFRESH    | Refresh existing Grade 6 Math Kangaroo source research                      | Pin approved Grades 5-6 dossier and jurisdiction                                                   | Added 2026-10-10; verify current US Grade 6 level, format and official archive; distinguish international Benjamin sources from US rules.                                                                                                               |
| MOEMS-REFRESH | Refresh existing Grade 6 MOEMS Division E source research                   | Pin approved dossier; check ownership of existing MOEMS research worktree                          | Added 2026-10-10; verify current Division E eligibility/format, official contest archive, access and rights; do not switch divisions implicitly.                                                                                                        |

UI is a product priority, not cosmetic cleanup. Use ratios as a working
reference, not the ceiling: clickable course/unit/topic views, meaningful
visual representations, practice/quiz interactions, progress history, and clear
next actions. Avoid decorative dashboards that hide missing learning behavior.
See `docs/ui-implementation-playbook.md` and `docs/ui-review-playbook.md`.

New assessed tracks must use quizzes/assessments to gate progression to the
next level/topic. Browsing, flash-card flips, time spent, or an LLM's opinion
cannot unlock learning progression. Pass bars and bank policies remain approved
versioned policy, not UI constants. Existing explicitly non-assessed program
contracts and compatibility behavior remain unchanged until separately
approved; this plan cannot silently supersede them.

## Curriculum resources from the main page

**Implemented reference-review surface:** `/` links to **Curriculum resources**
at `/resources`. It reads `docs/curriculum-sources.md`, supports dossier/source
filters and source permalinks, and displays research approval/access metadata.
New school Science and Social Studies references will appear there when their
dossiers are integrated into that register, including pending research. A
backlog entry alone creates no source listing; neither new school dossier is
present yet. Private review artifacts and copyrighted textbook contents are
not published by this reference view.

SOURCES-1 adds an obvious **Curriculum resources** link from `/`, then a
program-filtered index derived from the authoritative source register, not a
second handwritten citation list. Each research resource has a stable source
reference, descriptive clickable HTTPS link where available (otherwise an exact
document identifier and honest unavailable-link label), issuer, edition/season, retrieval
date/status, supported claims, authority level, and licensing/access notes.
Distinguish primary standards, local pacing guidance, and optional inspiration.

Make every cited research resource discoverable, including secondary and
unavailable sources with honest access labels; mark research-only/pending
dossiers clearly and do not imply official endorsement or content approval.
Parent/source-reference navigation may expose citations, not unreviewed lesson
content. Review links for child suitability; non-child-safe reference metadata
belongs in the adult-facing view, not an unrestricted learner link list.

Validate URLs and schemes; use normal accessible links, no external-page
embedding, tracking widgets, child identity in URLs, or arbitrary learner
input turned into links. Keep private assessment files, answers, package
paths/digests, and provider context out of the projection. Source reuse and
attribution do not grant rights to reproduce proprietary resources.

The current dossier format is Markdown. First inspect existing citations and
public-site generation; choose a tested projection with stable references and
no duplicate source-of-truth registry. Do not claim link health without an
actual retrieval result; tests may stub remote failures, and link checks must
not require paid providers or production data.

## School Science and Social Studies research prerequisites

User requested both tracks explicitly on 2026-10-10. They already exist as
unavailable program placeholders; do not register duplicates or enable them
before research, authoring, content and applicable release approvals.

1. User identified _IMPACT California Social Studies: World History and
   Geography_, McGraw Hill, and explicitly confirmed ISBN 9780076755905.
   Publisher edition/year and sequence still need primary verification.
   Preliminary publisher candidate is recorded in `docs/curriculum-sources.md`.
   "California IMPACT" identifies the requested alignment source, not a
   verified edition or license. Use official state standards as governing
   sources and the book's legally accessible metadata/sequence for alignment;
   author original content, never copy or closely paraphrase textbook lessons.
2. User confirmed California **integrated Grade 6** school Science, core plus
   depth, no unverified school pacing. Verify the official grade/course
   standards mapping; any school textbook remains unspecified.
   Do not infer those from the Math pilot or from Science Olympiad.
3. Scope each research packet independently: Grade 6 school core curriculum,
   with any depth tier separately confirmed. Identify official standards,
   optional local sequencing, rights/access limitations and conflicts.
4. Use the approved research/review models and separate per-program artifacts.
   Integrate reviewed dossiers into the shared source register under one
   owner; preserve pending status until human source approval.
5. Curriculum research does not depend on recall-card L2/L3 lifecycle work.
   That infrastructure remains a separate gated implementation track.
   User requested both as separately scoped prerequisite tracks. L2 preflight
   may specify persistence, export/delete and migration review needs, but
   does not authorize a migration or live backfill.

## Introductory Python research boundary

Research official Python documentation and suitable openly licensed beginner
teaching sources; record exact links/licenses rather than adopting or copying
a proprietary course. User nominated _How to Think Like a Computer Scientist_
on 2026-10-10 as a preferred reference, with similar beginner Python sources
acceptable. Evaluate the [Python 3 Open Book Project edition](https://openbookproject.net/thinkcs/python/english3e/)
and [Runestone adaptation](https://runestone.academy/ns/books/published/thinkcspy/index.html)
separately, alongside current official Python documentation. Record exact
edition, Python version, accessibility, age suitability and license; older
examples are not automatically current or suitable for Grade 6. Source
nomination is not completed-dossier approval or permission to reproduce.
Preliminary references and access limitations are in `docs/curriculum-sources.md`.
Proposed scope for source review: sequencing,
variables/types, expressions, conditionals, loops, functions, tracing/debugging,
and small original projects. This is a proposal, not an authored syllabus.

Decide code-execution environment separately: no arbitrary Python execution
in the application server; assess sandbox isolation, CPU/time/memory/output
limits, network/filesystem access, dependency restrictions, accessibility,
privacy, cost, and deterministic tests before runtime implementation.
Distinguish code tracing quizzes from practical coding evidence. Do not let a
model judge alone establish correctness or mastery.

## Extension and fleet sequence

Use versioned program/grade/subject references and shared roles, UI components,
policy interfaces, and validators. Subject variation is authored data or a
reviewed renderer contract, not forks of learner-state or authorization logic.
Python may need a new validator/renderer contract; specify and test it before
authoring content against it.

First fleet recommendation: independent GEO-REVIEW and SCI-REVIEW plus
PY-RESEARCH in isolated packets; UI-1 can proceed against synthetic fixtures
in a separate worktree. Launch only on an explicitly approved batch with
available approved models. Each subsequent dossier review runs independently
after its research finishes. A coordinator alone integrates shared source,
registry, schema, and main-page changes.

Use `docs/agent-orchestration.md` for actual-model verification, fallback,
token-efficient handoffs, task dependencies, and shared-file serialization.
LLM judges reduce repeated human defect triage but never replace approval for
source/content, pedagogical parameters, child-data terms, or release.

## Resume prompt

> Read AGENTS.md, docs/development-expansion-plan.md, and
> docs/agent-orchestration.md. Inspect the branch/worktree and latest progress.
> Select one named ready packet or explicitly authorized independent batch.
> Verify actual executor/reviewer models and approved fallback options before
> launch. Preserve progression gates and pending content status. Produce the
> packet's artifacts and validation evidence, run independent review on the
> pinned revision, and checkpoint findings/blockers/next task in PROGRESS.md.
> Do not commit, push, publish curricula, or access production without approval.
