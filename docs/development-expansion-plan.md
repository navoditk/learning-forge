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

| ID               | Increment                                                                   | Prerequisites                                                   | Status / evidence required                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SETUP            | Shared review/model policy, skills, UI playbooks and launch adapters        | Approved role/model choices                                     | Implemented and verified; seven skills discovered in all three clients, approved native model checks pass, shared-policy and corrected UI guidance independently confirmed. No runtime release approval. |
| SOURCES-1        | Main-page curriculum resources entry and browsable per-program source index | Source-display contract below; independent UI review            | Implemented; verify and 10 browser checks pass, deployment tracing verified, GPT cross-family review approves for human review. Human accessibility/product/privacy/release gates remain separate.       |
| UI-1             | Rich course overview and reusable topic detail prototype                    | Existing API inventory, synthetic fixtures, `ui-implementation` | Planned; demonstrate course/topic navigation, evidence-backed progress, state handling and subject visuals without opening release gates                                                                 |
| UI-2             | Assessment-gated next-topic flow and remediation                            | C4/C5 authorization and approved policy/content                 | Blocked on applicable gates; direct-route refusal and refresh/resume evidence, accessibility and scoring tests                                                                                           |
| UI-3             | Optional recall flash cards and subject-specific interactions               | Approved content-role contract, UI-1; independent review        | Planned; card reveal never counts as independent mastery, keyboard/reduced-motion evidence                                                                                                               |
| PY-RESEARCH      | Introduction to Programming in Python for Grade 6 beginners                 | Research skill; no learner-data/provider requirement            | Planned research only; source dossier, licensing, scope, prerequisites, environment/safety decisions and independent review                                                                              |
| GEO-REVIEW       | Review existing Grade 6 Geography Bee dossier                               | Pin current dossier revision                                    | Ready to scope; independent primary-source review, then human approval                                                                                                                                   |
| SCI-REVIEW       | Review existing Grade 6 Science Olympiad Division B dossier                 | Pin season and current dossier revision                         | Ready to scope independently of GEO-REVIEW                                                                                                                                                               |
| ELA-RESEARCH     | Grade 6 ELA source research or review of any existing dossier               | Inventory source register first                                 | Planned; do not duplicate completed research                                                                                                                                                             |
| SCI-SOC-RESEARCH | Grade 6 school Science and Social Studies research                          | Separate scopes/standards decisions                             | Planned independent packets; distinct from Science Olympiad and Geography Bee                                                                                                                            |

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

## Introductory Python research boundary

Research official Python documentation and suitable openly licensed beginner
teaching sources; record exact links/licenses rather than adopting or copying
a proprietary course. Proposed scope for source review: sequencing,
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
