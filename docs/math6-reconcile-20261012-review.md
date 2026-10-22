# MATH6-RECONCILE independent review

Date: 2026-10-12. Verdict: **changes requested; not ready for human review**.
One major and two minor document corrections. No content, policy, private
access, integration or release approval is given.

## Frozen scope and independence

- Artifact: common Git metadata
  `agent-handoffs/MATH6-RECONCILE/grade-6-math-reconciliation.md`, SHA-256
  `e419cea7465ca9615d8d6d76305622a52a1f66ab4b153fc551ad5b519edad3af`.
- Patch: `math6-reconcile.patch`, SHA-256
  `433e12ebdbef4e3698f4b3c850ee7d5349140d61088c3fcf6c460a1091f3cf11`.
- Input manifest SHA-256:
  `388025ce112b8aff8e6369fcbb0453017bb4173ae8c1569b5624ec3a17cba848`.
- HEAD: `3e7c33372599d20c285656c3610ca6e47743240f`. Patch reconstructs
  the frozen document exactly and changes only the approved report path.
  All committed manifest inputs match HEAD. Main-worktree manifest differences
  are packet/index/PROGRESS post-freeze checkpoint changes.
- Author independently verified from filtered successful-turn metadata:
  `claude-opus-5-5`, final UUID `569063d4-a86e-4373-ba24-8dc88fd4db67`,
  timestamp `2026-10-12T19:39:29.313Z`, containing exact report/patch hashes.
- Reviewer `/root/math6_reconcile_review`: fresh context, host-provided
  `forge-reviewer` role fixed to `gpt-6.1-sol`, no model override, completed
  read-only turn. Claude/GPT cross-family independence holds; local config
  alone was not treated as proof.

All reconciliation line references below refer to the frozen artifact.

## Findings

### R-1 — Major, high confidence: subcompetency accounting and elicitation

Locations: reconciliation lines 344, 349, 374, 388 and minimum increments at 616. Packet requirement 3 requires every approved subcompetency and observable
task. The report defines elicitation as evidence required in the graded response.

- Line 349 combines number-line location and ordering. The approved dossier
  requires locating, ordering and using rational numbers on number lines.
  `v2-rational-representation-order` asks for a least-to-greatest list; neither
  production nor candidate asks the learner to locate these numbers on a line.
- Line 374 marks representing solids with nets elicited. Production
  `surface-area-and-volume-1.json:17` and the candidate net items supply the
  faces/dimensions and request an area scalar. They support calculation using
  a supplied net description, without observing representation of a solid
  as a net.
- Line 344 marks standard-algorithm division elicited. Production
  `multi-digit-division-1.json:20` accepts only `378`; the other production
  item and candidate accept quotient/remainder results. These establish
  computed results, without observing the algorithm or fluency. Expression
  generation is assessed more strictly elsewhere in the same report.
- The five-row combined-gap summary omits unresolved number-line location
  and net representation and overstates algorithm evidence.

Minimal correction: split number-line location from ordering; distinguish
net representation from area calculation; label algorithm/fluency evidence
partial or unverified. Add missing-task recommendations and recompute all
dependent summaries. Preserve reusable computational assets. Correct the
document only; no content drafting or new policy defaults.

### R-2 — Minor, high confidence: placement selection description

Locations: reconciliation lines 107 and 406.
`src/progression/placement-probe.ts:54` scans references in authored order
and selects the first resolvable eligible record with
`.find(item !== undefined)`. It can fall through an ineligible first
reference to a later eligible one. The report describes mandatory
first-reference matching as observed behavior.

Minimal correction: distinguish current first-eligible-reference behavior
from D-64/D-68 policy wording. Retain the conclusion that the two E&E lessons
cannot currently produce a probe, because both references in each lesson
have stale versions. No runtime correction is authorized.

### R-3 — Minor, high confidence: historical pooling claimed as observed

Location: reconciliation line 239, `surface-area-and-volume` evidence cell.
It says v1 evidence pools into the same estimate today. The unversioned
`MasteryEstimate` key permits pooling under reused skill codes, but schema
does not establish actual attempts under both meanings or their contribution
to an estimate. The report's limitations correctly call live pooling unverified.

Minimal correction: state the schema permits old and changed meanings to
share an estimate; actual pooling remains unverified. Retain O-1/O-7 and
the separate authorization needed for database investigation.

## Scope deviation and evidence limits

The author executed scratch grading probes despite the packet requiring
read-only validator inspection and a later scoped packet for executable
checks. Retained scripts and explicit disclosure establish this deviation;
the reviewer cannot approve it retrospectively.

Static inspection independently confirms the substring vulnerability:
accepted phrases need only occur anywhere, without negation, numeric-token,
order or extra-claim checks. For example, `ratio-tables-2` requires `80` and
`16`, so `180, 16` satisfies that path. Exact execution tallies remain
author-reported results, not an independently rerun authorized validation
gate. No probes were executed during review. Preserve this distinction in
the corrected report; do not rerun probes under this packet.

## Supported conclusions and remaining gates

Repository bytes support the inventory counts, nine stale reference versions,
matching hashes for all 54 wrapper references, nine shared candidate codes,
ten identical production/candidate prompts, disconnected wrappers,
placement-cap conflicts and historical reuse of
`surface-area-and-volume-1@content-1`. Private coverage remains metadata-only.
The underlying content/scorer defects predate this report; review does not
authorize repairing those records.

Target-version, crosswalk, first-unit, volume, teaching-scope, private-access,
candidate conversion, item review, bank reconciliation, version compatibility
and release choices remain open.

## Validation and return

Read-only hash, JSON inventory, history and patch-reconstruction checks passed.
`git apply --check`, `git diff --check` and frozen-document Prettier through
stdin passed. Direct `.git` discovery initially matched no files; stdin
resolved that limitation. No files edited, installs, agents, runtime suites,
probes, databases or providers invoked by the reviewer.

Return to the integrator, then original Claude Code executor for corrections
within the approved document scope. Freeze a new document/patch hash and
updated evidence for Codex changed-scope review. The current patch remains
unapplied. No human acceptance request until corrections are reviewed.
