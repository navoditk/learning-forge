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

## Delivery-first successors and proposed parallel lanes — 2026-10-13

**2026-10-14 execution checkpoint:** CORE, PATHS and the first PRACTICE-FIRST
UI slice are accepted/integrated locally, not deployed. Catalog design is
with its original Opus author for R-1/R-2 corrections. IC-6–IC-8 are approved;
IC-9 and C-7 remain pending. Do not repeat completed UI or research work.

The owner's **"go ahead"** is recorded as D-167. Concrete successor packets
now exist: [PRACTICE-RELEASE](agent-handoffs/PRACTICE-RELEASE.md) for a
queued Sonnet existing-content release-readiness turn, and
[SCI6-FIRST-UNIT](agent-handoffs/SCI6-FIRST-UNIT.md) for a separate Opus
first-unit preparation turn that may run alongside lane A. Science domain
and school-program configuration gaps must be resolved before real records
are authored/registered. These tasks return exact execution/content/release
approval scopes; they do not lift D-61 or deploy. The current resume index
assigns the lanes. Historical proposal language below is superseded only
for this explicitly authorized preparation.

The owner selected staged delivery: rich Grade 6 practice first, complete
taught/assessed units next, then more subjects. This section records the
delivery sequence now; it is not execution, concurrency, authoring, private
access, commit/push or release authorization. It supersedes historical
next-task recommendations below, not accepted contracts or approval gates.

### Preserve the current boundary

`RAT-SCORE-IMPL-PATHS` remains with the original Sonnet executor for R-1/R-2
corrections, closure evidence and refreeze, then Codex changed-scope review.
Only after that review is ready may the owner accept/apply the exact patch.
Do not interrupt its worker, duplicate its owned paths or change its frozen
inputs for this planning update. The active packet, not this dated snapshot,
supplies its current phase.

At that human boundary, the integrator should present ready successor scopes
alongside exact patch acceptance, with separate permissions and exclusions.
Do not request approval for undefined content volumes or unreviewed future
artifacts. Scope preparation can precede PATHS completion if independently
authorized and claimed; dependent implementation cannot.

### Learner-visible milestones

| Milestone         | Smallest useful deliverable                                                                                                                                                                               | Remaining scope and evidence                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRACTICE-FIRST    | A bounded learner-application increment using the existing course overview, topic navigation and reviewed practice; Grade 6 Math first, existing enrichment/Spelling only where readiness is demonstrated | Define exact programs/item versions, meaningful available actions, incomplete-coverage labels and legacy scoring disposition; reuse existing UI, not another prototype; cross-family review, browser/accessibility/tutor evidence and applicable human release gates |
| RATIOS-COMPLETE   | The accepted five-skill Ratios unit with its explicitly selected teaching/assessment scope                                                                                                                | Remaining IC-6–IC-9 choices, scoped authoring/storage permissions, catalog/history contracts, reviewed public content/private package, integration and applicable shadow/manual activation gates                                                                     |
| NEXT-SUBJECT-UNIT | One usable unit from an approved school-subject dossier, rendered through the shared interface                                                                                                            | Owner selects subject and exact unit/skills/roles/volumes/store; scoped D-61 exception, schema/validator readiness, independent content review, human content approval, integration and release                                                                      |
| UNIT-EXPANSION    | Additional Math domains and further subject units                                                                                                                                                         | Repeat bounded coverage-driven increments; reuse verified drafts and structures; no full-course completeness claim until coverage evidence supports it                                                                                                               |

PRACTICE-FIRST targets the learner application, not just source listings or
GitHub Pages publication. The packet must distinguish code integration,
application deployment and learner release. Preserve default landing behavior
unless an explicit UX change is approved. Browsing a topic must not authorize
an activity; use server-offered actions and existing program policies.
Do not turn practice progress into assessed mastery or enable C4/C5 implicitly.

Do not require optional recall/flash-card lifecycle or full teaching serving
for a practice-only scope that does not consume them. Structured activities
require accepted PATHS wiring and their own UI/content approval; a genuinely
independent legacy-practice scope may proceed without those only if its
scoring risks and access behavior are explicitly resolved for release.
The 23 legacy UNMET cases are not repaired by the new scorer alone.

### Proposed staffing, not dispatch authorization

| Lane / responsibility                 | Proposed client and role                                                                                                   | Isolation and stop                                                                                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Engineering and practice delivery | Claude Code `forge-implementer` / Sonnet 5.5, followed by separately authorized UI/implementation packets                  | Finish active corrections first; own only packet-listed code/tests in an isolated worktree; do not claim content or shared registers                                                                                                   |
| B — One new-subject content unit      | Separate Claude Code `forge-expert` / Opus 5.5 after scope approval; Science recommended, Social Studies alternative       | Both school dossiers have approved research; do not repeat it. Exact unit scope, schema compatibility and authoring exception remain pending; draft only allowlisted original content, keep it pending review, no runtime registration |
| Independent review                    | Codex `forge-reviewer` / `gpt-6.1-sol`, fresh context for each frozen packet                                               | Review ready artifacts from either lane; prioritize next-release blockers. No review before freeze and no author reviewing its own output                                                                                              |
| Coordination / integration            | This Copilot session can prepare scopes; one explicitly claimed integrator applies accepted work and updates shared status | No duplicate implementation or new fleet; serialize registry/schema/catalog/status edits and task-owned database work                                                                                                                  |

Recommend at most two execution workers, one per approved lane. This is not
an approved spending/concurrency ceiling or permission to start lane B.
If only one Claude terminal is available, a separately scoped worker is an
alternative only after explicit approval and isolation. Do not run authors
and reviewers against evolving bytes; reviews can overlap unrelated work,
not the reviewed packet's corrections.

The owner specifically requested appropriate models for parallelization.
Use the approved allocation in `docs/agent-orchestration.md`: Sonnet for
defined implementation/UI, Opus for curriculum correctness and unresolved
design, GPT-6.1 Sol for independent review of both Claude-authored lanes.
This Copilot session handles bounded coordination, not duplicate premium
authoring. A complex engineering design gap needs a bounded Opus scope,
not silent policy design by an implementation worker.

Native Claude profiles select `sonnet` and `opus`; those aliases do not prove
an effective version. Before dispatch, record actual model ID/family from
client metadata, role and verified selection in each packet. If selection
is unavailable, overridden or unknown, block dispatch rather than claiming
the expected model ran. Do not change a running parent or substitute another
model silently. Approved quota fallback still requires observed
unavailability and preserved cross-family review. Existing role configs
remain unchanged.

### Next consolidated scope request

Follow **Delivery exit rules** in `docs/agent-orchestration.md`: one
comprehensive review and consolidated correction, then targeted verification.
Keep optional improvements out of the current acceptance criteria. Repeated
failure of a required finding triggers root-cause escalation, not automatic
broad re-review; ready unchanged artifacts go to acceptance/integration.
These rules preserve real safety/correctness and human release gates.

The integrator prepares one compact request with: exact PATHS acceptance
when ready; a bounded PRACTICE-FIRST execution scope; and subject/unit
selection plus any fully specified NEXT-SUBJECT-UNIT preparation/authoring
scope. List recommendations, evidence, owned paths, dependencies, model
roles, stop conditions and exclusions per decision. Batch ready remaining
Ratios choices where their tradeoffs are specified; leave unresolved choices
pending rather than inventing defaults.

No successor packet is assigned by this plan alone. Before dispatch, create
its normal task packet and add its lane assignment to the resume index.
Until then, bare "continue" follows the existing PATHS relay, not a proposed
lane. A second lane must never steal the active claim or silently become
an alternative task when the current client is at a review/approval gate.

## Deferred review: concept clips — 2026-10-15

**CONCEPT-CLIPS — backlog only.** The owner requested adding this idea for
later review, inspired by [Concept Clips, middle-school section](https://shalinichitrapu.github.io/concept-clips/#middle).
Revisit after the first usable curriculum releases; it is not a prerequisite
for PRACTICE-RELEASE, Ratios or the first Science unit. No worker, source
dossier approval, content authoring, model call, implementation or release is
authorized by this entry. Do not add it to active lane intake.

Review a small optional teaching enhancement: short, scene-based visual
explanations linked to selected approved skills through a "See the concept"
action. Proposed flow: explanation -> prediction/observation -> practice ->
independent check. Candidate pilot: one Math concept such as double number
lines or fraction division, and one Science concept such as cell structures.
Exact topics and scope remain unselected; the reference site's broad
"middle school" grouping is not proof of Grade 6 alignment.

At that later review, evaluate:

- One reusable React/SVG player with versioned, reviewed scene/caption data,
  rather than a video-production platform or live AI-generated executable
  animations. Use allowlisted renderers, not arbitrary scripts in content.
- Fit with existing teaching-content, storage and authorized exposure
  contracts; generic instructional examples must not reveal active problem
  solutions or held-out assessment content. Watching/replaying is engagement,
  not mastery evidence, and must not unlock progression.
- Keyboard/focus and pause/step/replay controls, captions and complete text
  alternatives, reduced-motion/static paths, mobile layouts and light/dark
  contrast. Narration is optional and needs its own privacy/provider review.
- Original scripts and artwork. The linked site is inspiration, not a
  verified reuse license or approved source for curriculum content; verify
  rights before reusing any external code, script or asset.
- A bounded original two-clip pilot, only if the review recommends proceeding
  and the owner approves its exact authoring/implementation scope. Evaluate
  learner explanation/application and misconception correction, not views
  or completion alone.

Keep future review proportional: one scoped decision on whether this adds
learning value, followed by the normal content/accessibility/release gates
if selected. Do not create a new broad architecture or review program now.

## Issue-sized work packets

**2026-10-11 Grade 6 Math consolidation priority:** the owner requested one
comprehensive Grade 6 Math curriculum from current production, disconnected
domain Unit/Lesson catalogs, the isolated v2 candidate and D-148 private
assessment drafts. `docs/grade-6-math-integration-plan.md` is the shared staged
plan. Complete the current L2a design review boundary, then scope
MATH6-RECONCILE (Claude Opus document inventory/crosswalk -> Codex GPT-6.1 Sol
review) before optional program breadth. Owner curriculum-version/first-unit
decisions follow; authoring, private-package access, integration and release
are separately gated. Do not treat all L2/L3 work as a prerequisite for
document reconciliation or reuse historical drafts as reviewed content.

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
