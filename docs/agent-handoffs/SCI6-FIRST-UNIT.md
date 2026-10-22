# SCI6-FIRST-UNIT — Bounded first-unit preparation

## Authority and live relay

- Phase: **DONE** — owner approved reviewed rev1 recommendations U1–U7
  on 2026-10-15, individually recorded D-168–D-174. U6 remains conditional.
- Next client/role, lane B: **Claude Code forge-implementer / Sonnet**,
  [SCI6-PREREQ](SCI6-PREREQ.md), exact U5/P1–P6 implementation.
- No drafting/registration/serving/release permission is active under U6
  until U5 integration, applicable evidence and engineering sign-off.
- Owner replied **"go ahead"** on 2026-10-14 to concrete delivery tasks and
  parallel preparation; D-167 records this bounded permission.
- Lane B: a **separate Claude Code `forge-expert` / Opus 5.5** session or
  scoped worker, fresh from the ongoing Ratios author. It may prepare while
  lane A completes catalog corrections/review.
- Science is the proposed next subject for preparation, not approval of an
  exact curriculum unit, skill graph, content volume or production activation.

## Approved inputs and verified prerequisite gaps

Use the already reviewed, owner-approved research:
`docs/curriculum-dossiers/grade-6-science-20261010-research.md`, its independent
review and the school Science section of `docs/curriculum-sources.md`.
Scope is California integrated Grade 6, not Science Olympiad or an inferred
district/textbook sequence. Do not repeat research or fetch new sources.

Current public code shows:

- `src/contracts/program-codes.ts` includes `grade-6-science`.
- `src/contracts/curriculum.ts` has no Science domain in
  `CurriculumDomainSchema`; do not disguise Science as a Math domain.
- The registry still groups Science among unavailable placeholders with
  `subjectKind: enrichment-non-graded`, no prefix and no unit refs.
  Existing placeholder values are not an approved school-course contract.
- Number/choice response support does not establish full investigation,
  explanation, modeling or engineering mastery. An LLM judgment cannot
  supply authoritative mastery evidence.

Confirm these against pinned current source. Report new concrete gaps rather
than extending schemas, inventing a rubric scorer or changing authorization.

## One deliverable, not another full-course design

Return one compact scope bundle in common Git metadata,
`agent-handoffs/SCI6-FIRST-UNIT/`, containing:

1. One recommended first unit from the approved dossier, exact PE/component
   scope, conceptual dependencies and original intended learner interactions.
   Consider the cells/systems components of MS-LS1-1 and MS-LS1-2 as a
   candidate, not a selected unit or a claim to fully assess either PE.
   Do not redesign all 19 PEs or commission a new whole-course architecture.
2. Exact proposed skill identities/versions, roles, modes, item volumes,
   locations, provenance/review requirements and coverage expectations for
   that unit. These are approval options, not authored Skill or content
   records. Derive counts from coverage and implemented constraints; do not
   copy Math thresholds as Science defaults.
3. A minimal prerequisite implementation scope, with owned files and tests,
   for honest Science registration/domain support and the selected response
   types. Separate ready deterministic practice from capabilities requiring
   a later validated evidence contract. Keep current users/programs unchanged.
4. A single actionable approval batch: unit/skill/role/volume selection,
   exact prerequisite implementation, narrowly scoped D-61 authoring
   exception and storage path where ready. Clearly separate content drafting,
   human content approval, registration, teaching serving and release.
   List unresolved teaching/schema questions instead of drafting around them.

Use original provided-data/virtual reasoning only. No hands-on procedures,
external simulations/accounts/embeds, copyrighted source reproduction or
whole-PE mastery claims from selected-response questions. Respect the dossier's
assessment boundaries, source gaps and accessible text alternatives.

## Ownership, evidence and stop

Worker owns only its scope/evidence bundle and isolated scratch files.
No production Skill JSON, prompts, answers, distractors, hint ladders or
teaching records are drafted under this preparation task. No source/schema,
registry, content, policy or shared-status edits. The integrator records
returned evidence and subsequent human dispositions.

Read AGENTS, this assigned lane, orchestration/model/accountability/exit
rules, README, relevant curriculum authoring/review playbooks, current D-61,
approved dossier/review and actual public contract/catalog code. Verify
actual Opus ID/family via client metadata before dispatch. Pin input hashes
and HEAD plus allowlisted accepted dirty dependencies, use an isolated
worktree and acquire a checked task-specific claim. Do not claim the Ratios
author's packet or shared integrator ownership.

Return requirements-to-evidence, concrete schema observations, explicit
untested claims and a frozen hash manifest. Document-only checks apply;
no database, private items, learner data, provider calls or new research.
Do not run unrelated full suites. No authoring pause lift is inferred:
the missing exact D-61 exception blocks later content, not this preparation.

Freeze the bundle and queue Codex `forge-reviewer` / `gpt-6.1-sol` for one
comprehensive source/schema/assessment-validity review, in a fresh context.
Review can overlap unrelated lane A work, not changing lane B bytes. Use
consolidated corrections and targeted verification only. After ready review,
present the exact approval batch; no duplicate research/design prerequisite
is added before executing the resulting approved first-unit scope.

## Revision 1 returned (2026-10-15)

Fresh lane-B `forge-expert` launched from the lane-A Claude Code integrator
session at the user's request. Integrator-verified transcript
`agent-a3dfaff8403a55e27.jsonl`: 172/172 assistant records
`claude-opus-5-5`, last `aaf08807-fd58-47a2-8a67-18a56bd57b0f`
`2026-10-15T04:02:35.811Z`. Worktree `/private/tmp/lf-sci6-first-unit`
(removed); seven accepted dirty/new main files overlaid and pinned.

Bundle `.git/agent-handoffs/SCI6-FIRST-UNIT/`:

| Artifact                                     | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `sci6-first-unit-scope.rev1.md` (270 lines)  | `6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04` |
| `self-audit.rev1.md` (119 lines)             | `5b16adff73c407213a776b0feebd8c19f5a9b1d2f93488eecd600f3515dde057` |
| `input-manifest.rev1.txt` (HEAD + 46 inputs) | `5eefc91f7e5cc377e1d7e3a1bed84780529da9d9b0287b4f7b2ed5a2787467e2` |
| `claim-meta.rev1.released`                   | `e9ec0af2bcce0f32a591b662e80a2e549090385e32695d536141b48e7ab04b59` |
| `freeze-manifest.rev1.txt`                   | `aebc8635d0b6f7c19bd30e5d9deeabd8b6733f1e947701e05b43fb2f26b3920d` |

Proposal summary (not approved): unit "Cells and living systems", practice
only, components of MS-LS1-1/MS-LS1-2 without whole-PE claims; MS-ETS1-1
retained as fallback (earlier reviewed proposal chose it before accepted
structured choice/text-alternative support existed). Skills
`sci6-cells-evidence-of-life`, `sci6-cell-parts-functions`,
`sci6-cell-as-a-system` (domain `sci6-life-science`, 1.0.0, core practice);
six practice records derived from planner/UI reachability (not Math
thresholds); structured single-choice only. Prerequisite Sonnet packet
P1–P6 (Science registry entry unavailable, domain + site label, Science
skill rules, content rules, figure-label/alt-text rule, invariant tests).
Approval batch SCI6-U1–U7 (unit/skills, volume, answer format, safety/claim
limits, P1–P6 packet, conditional narrow D-61 exception after U5 integration,
storage path); later content approval/registration/teaching/release listed,
not requested.

Author-reported new code gaps: Math-specific real tutor prompt; uncalled LLM
`scoreConstructedResponse` interface; learner/parent mastery views not
program-scoped; independent check reuses item and requires tutor turn;
choice options lack misconception codes; lessons require an assessment bank
(unit stays skill-graph chapter); no domain-to-program check; teaching
contracts shape-only. Untested claims: planner/UI reachability and ordering
from code reading only; grep-based caller claim; proposed P-tests unwritten;
CA clarification/assessment-boundary details from dossier summary only (Q6).

Integrator verification: five hashes; both `.md` pass Prettier (stdin); 46/46
pinned inputs match live bytes; no tracked main edits by worker; claim and
worktree absent; lane-A artifacts untouched.

## Revision 1 review and exact ready owner batch

Fresh native forge-reviewer/gpt-6.1-sol report:
`docs/sci6-first-unit-20261014-review.md`. Ready with noted risks,
zero blocker/major/minor. Opus172/172 metadata, five frozen hashes,30HEAD
pins and substantive inputs verified. Manifest has45primary pins plus1grep
pin; three status pins drifted after freeze. Earlier46/46 is historical.
Q6 source precision still requires SCI6-S01 verification before actual
content acceptance; no new research performed. P-tests are proposed; no
Science runtime/browser evidence. Release R1–R5 remain separate.

The exact scope is frozen bundle `6ddacf23...bf04`, §§2–5, not content
records. Recommendations may be approved all together, by subset, or overridden:

| Choice  | Recommendation                                                                                                                                                                                      | Authorized action and boundary                                                                                                                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCI6-U1 | Cells and living systems; components of MS-LS1-1/MS-LS1-2; three1.0.0 skills without edges: sci6-cells-evidence-of-life, sci6-cell-parts-functions, sci6-cell-as-a-system; domain sci6-life-science | Scope/identity values, not full-PE assessment, production unit/catalog or drafting.                                                                                                                                                                                                            |
| SCI6-U2 | Six core practice records, two per skill; zero depth/teaching/assessment/review                                                                                                                     | Volume values only. Current planner serializes practice; first records are unhinted placement/review encounters.                                                                                                                                                                               |
| SCI6-U3 | Structured single-choice fields only per frozen §3                                                                                                                                                  | Existing D-157/D-158/D-160 behavior unchanged; no rubric/LLM mastery.                                                                                                                                                                                                                          |
| SCI6-U4 | Virtual/provided data only and unit-specific §2 safety exclusions; claims limited to covered/not-assessed matrix                                                                                    | No procedures/specimen collection/microscope operation/chemicals/live organisms; no whole-PE mastery claim.                                                                                                                                                                                    |
| SCI6-U5 | Execute exact §4 P1–P6 prerequisite implementation, including recommended P5                                                                                                                        | Isolated Claude forge-implementer/Sonnet, independent Codex review, separate patch acceptance. Unavailable graded-academic Science registry/prefix, life-science domain/labels, Science skill/content rules, figure-label alternatives and invariant tests only; no records/availability flip. |
| SCI6-U6 | Conditional narrow D-61 exception for three skills/six core practice records                                                                                                                        | Opus drafts only after U5 integration, applicable gate evidence and recorded engineering-owner sign-off. Isolated drafts llm_drafted/owned/pending_review; Codex cross-family review. No teaching/depth/held-out/registration/serving.                                                         |
| SCI6-U7 | Skill paths content/skills/<code>.json; record paths content/grade-6-science/<id>.json                                                                                                              | Storage values only; imports/catalog registration remain later authorized work.                                                                                                                                                                                                                |

Content human approval, registration/integration, teaching and release are
not requested now. Later source precision, item quality, threshold/tutor/
claim/accessibility gates must have evidence. No authoring pause lift
outside the exact conditional U6 scope may be inferred. Integrator records
any future individual dispositions; none selected by this review.

## Owner disposition — 2026-10-15

Owner **"approved both"** accepts all presented Science recommendations:
U1=D-168, U2=D-169, U3=D-170, U4=D-171, U5=D-172 (including recommended
P5), U6=D-173 conditional, U7=D-174. Preserve exact frozen scope6ddacf23...bf04
and source/release limitations. No new content authored; no code patch was
accepted by this response. SCI6-PREREQ is authorized for implementation,
then independent review and separate artifact acceptance. U6 dependencies
remain unsatisfied; no engineering-owner post-integration sign-off inferred.
