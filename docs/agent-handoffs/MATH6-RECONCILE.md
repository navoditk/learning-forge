# MATH6-RECONCILE

Phase: **DONE** (revision 3 reviewed, owner-accepted and applied;
uncommitted).

Next client/role: **either client, MATH6-RATIOS-PLAN scope request**.
O-1/O-2 are approved as D-149/D-150; proposed next packet
`docs/agent-handoffs/MATH6-RATIOS-PLAN.md` is AWAITING_HUMAN and unapproved.
Stop after requesting its document-only scope. Other O-choices and
content/private access, implementation and release remain separate.

## Owner authority and owned scope

On 2026-10-12 the owner replied **"approve"** to the request for the
document-only MATH6-RECONCILE scope: inventory, skill/version crosswalk and
coverage proposal specified in `docs/grade-6-math-integration-plan.md`,
using Claude Opus followed by Codex review. The preceding L2a document
acceptance/application packet is complete.

The sole author-owned path is **`docs/grade-6-math-reconciliation.md`**,
currently absent. Shared packet/index/PROGRESS are integrator-owned.
This scope permits inspecting public repository content and approved
private-bank metadata in repository decision/handoff records. It does not
permit reading private packages or learner data, drafting/correcting
curriculum records, promoting the candidate, editing code/catalogs/schema,
changing policy/approval records, running databases/providers, committing,
pushing, deploying or releasing. Recommendations require later decisions.

## Baseline and pinned inputs

Control HEAD: `3e7c33372599d20c285656c3610ca6e47743240f`, branch main,
ahead of origin by three commits, with unrelated dirty documentation.
The integrator verified no HEAD differences in `content/`,
`src/curriculum/`, `src/content/`, `experiments/grade-6-math-v2/`,
`docs/curriculum-experiments/grade-6-math-v2/` or the three authority
records pinned below. Use that commit for those source inputs; preserve
dirty work and provide only explicitly allowlisted input overlays.

SHA-256 inputs (including uncommitted planning documents):

| Path                                                   | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `docs/grade-6-math-integration-plan.md`                | `4804f3bd884bc21dfc82db2caf0ce329ba60054fc65c78c11f62d9ac65c0d092` |
| `docs/curriculum-sources.md`                           | `c53220957d22bd881378d435664cb20c9de4ab5fb6309c6ec4a5e73ac0f3f3ed` |
| `docs/course-progression-decisions.md`                 | `bca89d5120786311ac612105e30819464bbf45aa608b1888e45779dd725caa50` |
| `docs/course-progression-review/manual-gate-record.md` | `4d3169c80fbbe375207d6f69276cc684470bd8391a12830dc3e88cd45ff0dce0` |
| `experiments/grade-6-math-v2/skill-records-v2.json`    | `7bdf90d75f1e78746866ae00f71f72ce5ed1906fcf96c3bf0aad6f1298365e5e` |
| `experiments/grade-6-math-v2/content-records-v2.json`  | `f24afa90548eb07935d378277bb6703701f3a4f738d4ce4147b008826b328a5a` |
| `docs/02-curriculum-and-pedagogy.md`                   | `344619873b8b65ae7ff38188624ff3071452f64f7bf22501ad62b8587ec4053a` |
| `docs/development-expansion-plan.md`                   | `c30faa40abae58fd8ae8e326342bee57ab3edc3eb1ffe51f4fe4b77ed05708f1` |

Recheck hashes, HEAD and claims before work. If relevant inputs differ,
return to the integrator to repin the effective baseline before authoring.
Do not copy the entire dirty tree. The input manifest returned with the
report must enumerate exact paths/hashes for all consumed curriculum,
content, catalog, validator and review inputs, not only this anchor list.

## Read order

1. AGENTS.md, current cross-client index, this packet and native model/
   terminal-handoff procedure in `docs/agent-orchestration.md`.
2. README and `docs/grade-6-math-integration-plan.md`, especially its
   seven-item first-packet scope and acceptance evidence.
3. Approved Grade 6 source register and referenced research/review dossier;
   applicable D-01/D-02/D-61/D-73/D-148 and consumed decisions; manual gate.
4. Plan's current catalogs, public skills/content, candidate files, original
   baseline/comparison rubric and dated review/correction chronology.
5. Applicable content review/authoring procedures and teaching contract as
   constraints; do not begin their content-authoring stages. Private-package
   handoff is historical metadata, not current-item evidence.

## Deliverable and acceptance criteria

Implement all seven reconciliation requirements in the approved plan:

1. Inventory current loaded skills/practice, candidate and disconnected
   Unit/Lesson wrappers. Resolve conflicting historical counts/status against
   current bytes, refs, versions, hashes and review authority.
2. Crosswalk every current and candidate skill/version with retain, rename,
   split, merge, replace or defer recommendation; conceptual/standards
   rationale, referenced-content disposition and historical-evidence effects.
   Do not silently remap attempts or rewrite frozen experiments.
3. Map every required standard/subcompetency to proposed lessons and
   observable tasks. Identify actual gaps, repetitive/narrow tasks,
   wrong-grade scope and superficial tags. Track teaching, practice,
   lesson/unit assessment, placement, delayed-check and review separately
   wherever approved policy requires them. Unverified private coverage must
   remain unverified.
4. Inspect candidate defect/correction chronology and current validator
   semantics, including composite-response false accepts. Cite evidence;
   passing schema/grader checks do not establish pedagogical completeness,
   scorer soundness, originality or accessibility.
5. Reference private drafts only through approved repository metadata.
   List separate private review, non-reuse and assessment-independence gates.
   Include no private prompts, answers, paths or package contents.
6. Propose minimum missing-content increments and first-unit scope with
   source/review status, D-61 exceptions, approved/open policy choices,
   role schemas, volume decisions and implementation dependencies. Existing
   Ratios plus extension is a recommendation to test, not a chosen unit.
   Add no numeric pedagogical defaults or source-research expansion.
7. Specify later verification and version/migration compatibility acceptance
   criteria. Distinguish observed evidence, recommendations, approvals and
   missing evidence throughout. Freeze and stop for Codex review.

Coverage must account for each current/candidate skill and each approved
standard/subcompetency, with explicit unresolved rows rather than blanket
coverage claims. Existing records should be reused when suitable. Historical
versions and evidence references remain resolvable; one curriculum does not
authorize deleting or redefining old evidence. Candidate adoption, first-unit
selection, content authoring, private review, integration and release are
later gates. Full L2/L3 runtime is not an inventory prerequisite; actual
first-unit release dependencies must be identified.

## Execution, validation and handoff

Claude integrator verifies actual Opus selection from successful client
metadata, claims this bounded role atomically in common Git metadata and
uses one isolated writer worktree. No fleet or duplicate parent analysis.
Worker owns only the report; return evidence to the integrator.

This is documentation-only. Run targeted Prettier with
`--ignore-path /dev/null` and `git diff --check`. Read existing tests and
validator code as evidence; do not rerun full suites or generate site output
to populate the handoff. Any later executable checks require their scoped
implementation packet. No database, real provider or production validation.

Return new report SHA-256, one-file patch SHA-256, exact baseline and input
manifest, author runtime model evidence, validation commands/results and
limitations. Preserve frozen patch/document/evidence under common Git
metadata `agent-handoffs/MATH6-RECONCILE/`. Release own task claim after
checkpointing. The claimed integrator updates packet/index/PROGRESS to
**AWAITING_REVIEW**, assigning Codex `forge-reviewer`, then emits
**SWITCH TO: Codex**. Any changed hash needs review; human target-version,
crosswalk and first-unit acceptance follows independent review.

## Frozen report returned (2026-10-12)

Author: Claude Code `forge-expert`, harness-reported `claude-opus-5-5`
(reviewer confirms from client metadata). Baseline HEAD `3e7c333`; all eight
pinned hashes matched; claim taken and released; isolated worktree removed.
Main checkout unchanged; report **not applied**.

Frozen under `<git-common-dir>/agent-handoffs/MATH6-RECONCILE/`:

- `grade-6-math-reconciliation.md` (716 lines), SHA-256 `e419cea7465ca9615d8d6d76305622a52a1f66ab4b153fc551ad5b519edad3af`.
- `math6-reconcile.patch`, SHA-256 `433e12ebdbef4e3698f4b3c850ee7d5349140d61088c3fcf6c460a1091f3cf11`; `git apply --check` passes on main.
- `input-manifest.txt` (17 main-checkout authority/planning inputs with
  dirty flags, 125 HEAD inputs, history commits), SHA-256 `388025ce112b8aff8e6369fcbb0453017bb4173ae8c1569b5624ec3a17cba848`.
- `probe/`: five synthetic scratch scripts used for the validator findings.

Integrator verified the three hashes, `git apply --check`, claim release and
worktree removal, and spot-checked the report for private paths/answers (none
found). Prettier and `git diff --check` passed in the worktree.

Headline findings for review (author claims, not yet independently checked):
9 wrapper refs pin a stale `content-1` (two live pilot refs); Number System
and Expressions/Equations units exceed the D-22/D-68 placement cap; candidate
reuses nine production codes with different definitions and ten production
prompts verbatim; `surface-area-and-volume` was redefined under one code and
an item version reused; every `parts` validator accepted a negated answer
(9/9 production, 30/30 candidate) plus false rejects; 2026-10-09 production
item edits (`5a452de`) lack a found D-nn approval; five uncovered
subcompetency rows; Ratios-plus-extension recommended as the first unit to
test. Open owner decisions O-1–O-17 (report §8). No numeric defaults added.

**Disclosed deviation:** the packet permits reading tests/validator code as
evidence. The author also **executed** a byte-identical scratch copy of
`src/content/answer-matching.ts` against synthetic inputs (no repository
test suite, database, provider, private or learner data). The reviewer should
decide whether this execution is acceptable evidence or must be repeated under
a scoped later packet.

## Independent review and bounded corrections (2026-10-12)

Codex native `forge-reviewer`, host-selected `gpt-6.1-sol`, independently
verified actual author `claude-opus-5-5`, all frozen hashes, committed manifest
inputs and exact patch reconstruction. Verdict: **changes requested**, one
major and two minors. Report: `docs/math6-reconcile-20261012-review.md`.

Correct only the report and directly dependent summaries under the existing
seven-item approval:

1. R-1: split number-line location/ordering and net representation/area
   calculation; qualify standard-algorithm/fluency evidence; add missing-task
   recommendations and recompute summaries. Preserve reusable current assets.
2. R-2: state actual first-eligible-reference placement selection separately
   from policy wording; retain verified stale-reference consequences.
3. R-3: describe unversioned estimate pooling as a permitted risk, with actual
   live pooling unverified; preserve database-investigation approval boundary.
4. Preserve disclosed scratch execution as a scope deviation. Label exact
   tallies author-reported, distinguish static reviewer confirmation and do
   not present them as an authorized executable validation gate. No reruns.

Do not repair underlying curriculum/scorer/runtime records or access private
packages. Use the same isolated one-document role, verify frozen baseline and
input hashes, retain original evidence, return new hashes and a response to
R-1–R-3. The claimed integrator routes the changed hash to Codex. Target-version,
crosswalk/first-unit decisions and all content/private/integration/release
gates remain open. No report acceptance/application is authorized yet.

## Revision 2 returned (2026-10-12)

The original Opus `forge-expert` (resumed; harness-reported `claude-opus-5-5`)
corrected only the report in a fresh isolated worktree, now removed; claim
released. Revision-1 artifacts are retained unchanged. New artifacts beside
them under `<git-common-dir>/agent-handoffs/MATH6-RECONCILE/`:

- `grade-6-math-reconciliation.rev2.md` (805 lines), SHA-256 `f427777c9b055246098625e9145bb0cba59bee052810f5c05213f8ec7adae1ca`.
- `math6-reconcile.rev2.patch`, SHA-256 `858135e9bbd1c19a31c5032be57dce8d65fd2c8d21dbf796aec05fb170edf1f5`; `git apply --check` passes.
- `input-manifest.rev2.txt` (addendum: review report, updated packet,
  `placement-probe.ts`), SHA-256 `13daf59fdc386343862a51b2576c186fe934b948394924346cedd70540bd3186`.

Integrator verified these hashes, unchanged revision-1 hashes, `git apply
--check`, claim release and worktree removal. Author response:

- R-1: new "partial" definition; NS.B.2 partial in both; NS.C.6 split
  (number-line location is a gap in both); G.A.4 split (net representation is
  a gap in both); missing-task table for eight rows; new owner decision O-18
  (NS.B.2 algorithm/fluency evidence). Counts now 57 rows, 34 flagged, 23
  elicited by production, 7 gaps in both, 1 partial in both.
- R-2: actual first-eligible-reference selection (`placement-probe.ts:54`)
  separated from D-64/D-68 wording; E&E no-probe conclusion retained.
- R-3: pooling stated as permitted by the unversioned key, actual pooling
  unverified; O-1/O-7 retained.
- Scratch execution: kept as a disclosed deviation; tallies labelled
  author-reported; reviewer's static confirmation cited; no reruns.

Recommendations unchanged (Ratios plus extension still the first unit to test;
R-1–R-9 increments). No acceptance or application is authorized yet.

## Revision 2 review completed (2026-10-12)

Same Codex `forge-reviewer`, host-selected `gpt-6.1-sol`, confirmed hashes,
actual Opus author identity, reconstruction and prior corrections. Report:
`docs/math6-reconcile-20261012-rereview.md`. Verdict **changes requested**,
one minor R-4 at frozen revision-2 line 439: merely identifying the polygon
does not elicit drawing/construction of its vertices and connections.

Correct that task recommendation by removing the identification-only
alternative or explicitly requiring accessible construction evidence.
Keep identification practice partial. Also preserve the stated uncertainty
about the response format needed for Ratios double-number-line tasks; actual
capability requirements await approved task design. Make no new content,
policy or runtime choice. Return new hashes/response to R-4 and refreeze for
Codex review; retain original artifacts. R-1 matrix/count corrections, R-2,
R-3 and probe-evidence labels are verified and need no repeat audit.

## Revision 3 returned (2026-10-12)

The original Opus `forge-expert` (resumed; harness-reported `claude-opus-5-5`)
made only the R-4 correction and the requested Ratios response-format
qualification, in a fresh isolated worktree (removed; claim released). All
earlier artifacts retained. New:

- `grade-6-math-reconciliation.rev3.md` (810 lines), SHA-256 `c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec`.
- `math6-reconcile.rev3.patch`, SHA-256 `786c905d30e817629a0cb09d9d3ed755b19af02db5e66323d43592ada8795436`; `git apply --check` passes.
- `input-manifest.rev3.txt` (re-review report and packet), SHA-256 `af049906e96f834237bd370a2f551d9438ac2416d27c82ca731bc8e94d0337cc`.

Changes: the G.A.3 missing-task row now requires an accessible construction
response representing plotted vertices and their connections; identification
remains partial practice only. The §6.3 Ratios paragraph now treats
representation capability as provisional (double-number-line task needs an
accessible response format; requirements await approved task design). Header
and §10 revision note updated. Integrator verified hashes, `git apply
--check`, claim/worktree cleanup, and a whitespace-insensitive rev2→rev3 diff
(29+/23−) showing only these changes; R-1 counts, R-2, R-3, probe labels,
recommendations and O-1–O-18 are unchanged.

## Revision 3 independent review completed (2026-10-12)

Same host-selected Codex `forge-reviewer` / `gpt-6.1-sol` confirmed hashes,
actual Opus provenance, exact patch reconstruction and changed-scope claims.
R-4 resolved; Ratios response-format qualification addressed; earlier
corrections preserved. Verdict **ready for human review with noted risks**,
no new correction. Report: `docs/math6-reconcile-20261012-rev3-review.md`.

Exact revision-3 report/patch remain unchanged and unapplied. Owner document
acceptance/application is next; O-1–O-18 and all later content, policy,
private review, integration and release choices remain separate. Disclosed
probe deviation and unverified private/archive/pooling evidence remain.

## Owner acceptance and application (2026-10-12)

Owner replied **"accept"** to exact revision-3 report acceptance and
one-file patch application. Claimed Codex integrator verified hashes and
unchanged HEAD, passed `git apply --check` and applied only the reviewed
patch. `docs/grade-6-math-reconciliation.md` now has SHA-256
`c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec`,
matching the frozen reviewed artifact exactly. Targeted Prettier and
`git diff --check` passed; existing unrelated edits were preserved.
No commit, push, code/content changes, private access or database/provider
work. Earlier unapplied statements are historical checkpoints.

This acceptance records the report, not its O-1–O-18 recommendations. Next
request O-1/O-2 as the smallest MATH6-DECIDE checkpoint; version evidence
rules, exact crosswalk adoption and other owner choices still need decisions.

## O-1/O-2 directions approved (2026-10-12)

Owner replied **"approved"** to retained production structure with versioned
refinements/evidence-rule requirement and Ratios plus extension first-unit
selection. Authoritative entries D-149/D-150 are in
`docs/course-progression-decisions.md`. O-3–O-18 remain open; approved
direction is separate from content, code, private access and release.
Next scope request is the proposed document-only MATH6-RATIOS-PLAN packet.
