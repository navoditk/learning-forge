# RAT-SUBJECT-CORRECT — Grade 6 unit-rate boundary correction

## Live relay

- Phase: **DONE** (reviewed two-file patch owner-accepted and applied;
  uncommitted).
- Next client/role: **either client, owner IC-5 decision/scope**.
  IC-2–IC-4 approved as D-151–D-153; request option C and document-only
  RAT-SCORE-DESIGN authorization, then stop. No next execution packet approved.
- Owner replied **"accept"** on 2026-10-12 to report acceptance and the
  explicitly named plan/source-register correction authorization.
- RAT-SUBJECT report accepted as advisory evidence, not candidate adoption,
  scorer repair, IC-2–IC-9 decisions or content/release approval.

## Approved scope and ownership

Author owns only:

1. `docs/grade-6-math-ratios-plan.md`: correct TR-3 and directly dependent
   unit-rate gap statements. Require non-complex fractional unit-rate results
   from whole-number quantities, with interpretation and appropriate units;
   do not require ratios of fractional quantities as Grade 6 coverage.
   Narrow the gap because existing items already contain decimal rates.
2. `docs/curriculum-sources.md`: clarify only the 6.RP.A.2 summary's
   non-complex-fraction restriction against the existing registered CDE PDF.

Preserve D-73's intentional above-grade stretch decision. No other report
finding is an edit authorization. No new research, new items, candidate
promotion, scoring/content/runtime/private/learner-data/database/provider
work. No changes to choices, volumes, identities, version/evidence rules,
source approval status or release gates. Worker returns patch/evidence;
only integrator edits shared status and packets. No commit or push.

## Intake and execution

Read AGENTS, live index, this packet, terminal-handoff/model procedure,
README, latest PROGRESS and its Resume here/Current status sections, accepted
subject report and the two target documents. Verify actual Opus selection
from client metadata; resume original executor where available. If role or
model evidence is unavailable, report BLOCKED instead of substituting.

Claim the bounded author role before writing; preserve unrelated changes.
Use the documented isolated-worktree/allowlisted-overlay procedure. Pin
HEAD and these baseline hashes, recheck before edits. The main worktree
currently includes accepted uncommitted plan bytes; ordinary HEAD lacks
this document, so a patch must reconstruct the accepted baseline explicitly.

- `docs/grade-6-math-ratios-plan.md`: `a05d686563154f117593a3c5770ca1e0cd85f85de5bc32ca5db3fad9695e9467`
- `docs/curriculum-sources.md`: `c53220957d22bd881378d435664cb20c9de4ab5fb6309c6ec4a5e73ac0f3f3ed`
- `docs/grade-6-math-ratios-subject-review.md`: `74617baaa2d190a48c3609096cef2fe9b9f4181115581915452398dc868a61ad`
- `docs/course-progression-decisions.md`: `e7cbd9f777a32d413914cda661c7d611628d92812e48a1f92704df4f56604511`

## Durable baseline bundle

Main HEAD: `3e7c33372599d20c285656c3610ca6e47743240f`, branch `main`.
Allowlisted inputs preserved at
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-SUBJECT-CORRECT/baseline/`
with original relative paths. Manifest `manifest.json` SHA-256:
`e240b52038e0dbcc2d12a880419ecce0a01f36037c029a2a6e246915e4134934`.
Verify these copies against live pinned inputs before worktree overlay.
The source register is a shared artifact: author proposes its change in the
isolated patch; only integrator applies it to the main register.

## Freeze and review boundary

Return a two-file allowlisted patch, exact final document hashes, baseline
hashes, changed-scope explanation and actual author-model metadata evidence.
Persist patch, frozen documents and manifest under resolved common Git
metadata `agent-handoffs/RAT-SUBJECT-CORRECT/`; record exact paths/hashes.
Run targeted Prettier (`--ignore-path /dev/null`) and `git diff --check`;
no runtime suites needed. Freeze without applying in the main worktree.

Integrator verifies scope/reconstruction, records **AWAITING_REVIEW** and
releases claims. **SWITCH TO: Codex forge-reviewer / gpt-6.1-sol**, reviewing
only the changed boundary/gap wording and preservation of accepted choices.
Changed bytes then require owner acceptance/application. Neither this scope
approval nor review authorizes applying a newly authored patch.

## Recovery prompt

Continue RAT-SUBJECT-CORRECT as original Claude Code forge-expert / Opus.
Read the live index and this packet first; verify model and frozen baseline,
claim the bounded role, correct only the two named document scopes, freeze
patch/evidence and return to Codex review. The native client can use "continue".

## Correction returned (2026-10-12)

Author: original MATH6-RATIOS-PLAN `forge-expert` (resumed; harness-reported
`claude-opus-5-5`; reviewer confirms from client metadata). Baseline HEAD
`3e7c333`; four pinned inputs and bundle manifest matched; claim released;
scratch and throwaway worktrees removed. Main worktree unchanged (plan
`a05d6865...9467`, register `c5322095...f3ed`). Frozen under
`<git-common-dir>/agent-handoffs/RAT-SUBJECT-CORRECT/` (`baseline/` untouched):

- `final/docs/grade-6-math-ratios-plan.md` (709 lines), SHA-256 `c31c21017e05abe02cb158d660de567cf2b7ba5b0e8e5d9bc4f6fa97a6be9fbe`.
- `final/docs/curriculum-sources.md` (1531 lines), SHA-256 `ea36f47db15ced2722d8e4d05fae2cab5360a809d34a2ea05b5ae87694f09e46`.
- `rat-subject-correct.baseline.patch` (primary; against accepted baseline), SHA-256 `6df95ab84d29651ed8fc5129196c02ebe053a93d9264335ab16aaf08222e2921`.
- `rat-subject-correct.head.patch` (variant against HEAD; creates plan), SHA-256 `c63730582c3f21f9eaf60df4654057c08a054ef03cafa64f3cd9d86ecf76a5e4`.
- `manifest.txt`, SHA-256 `d0953459172c2052f90ba6ecb859c5b7b27585074f5b30c0168f54695626d556`.

Changed scope:

- Plan: §2.2 `unit-rates` row (gap narrowed to an explicit non-complex
  fractional unit-rate result from whole-number quantities with
  interpretation/units; decimal rates already occur in `unit-rates-2`); §2.5
  TR-3 (non-complex fractional unit rates; ratios of fractional quantities not
  required Grade 6 coverage; D-73 stretch decision unchanged; V-7 form note);
  §7 MV-4 marked resolved by the accepted advisory report, non-complex only;
  new §9 correction note. Remaining hunks are Prettier table realignment.
- Register: 6.RP.A.2 row gains the non-complex restriction pointer; new
  boundary note after the table citing printed page 42 / PDF page 49 via the
  accepted review. Approval status, scope and other rows unchanged.

Disclosed deviation: the author did not re-retrieve the CDE PDF (no new
research); the page citation rests on the accepted review and the note says
so. Reviewer attention: whether marking MV-4 resolved stays within "no change
to choices", or should remain open pending owner disposition.

Integrator verified all hashes, `git apply --check` of the baseline patch
against main, both patch file lists, diff hunk locations, D-73 preservation,
claim release and worktree removal. Prettier and `git diff --check` passed in
the author worktree.

## Codex review complete — 2026-10-12

Fresh host-selected `/root/rat_subject_correct_review`, native
`forge-reviewer` / `gpt-6.1-sol`: **ready for human review with noted risks**,
no new correction. Report: `docs/rat-subject-correct-20261012-review.md`.
All hashes/inputs verified; both patches reconstruct final bytes; MV-4
resolution is informational and preserves IC-2–IC-9 and D-73. CDE citation
rests on accepted subject review; no repeated research/runtime/item review.

Actual author metadata independently filtered at
`/Users/navoditkaushik/.claude/projects/-Users-navoditkaushik-GitHub-learning-forge/22bffa60-935a-47f3-a703-6ff9ab4853d0/subagents/agent-a3721004b9d8ee958.jsonl`:
`claude-opus-5-5`, correction record
`ef7a53b8-efdf-4580-8ad1-8bb5565e2908`, `2026-10-13T00:30:47.179Z`.

**WAITING FOR HUMAN APPROVAL:** accept the exact two corrected documents
and authorize baseline patch `6df95ab8...2921` application. Patch remains
unapplied. On approval, validate baseline, apply only the reviewed patch,
verify final hashes and run documentation checks. No commit/push authorized.

## Accepted integration — 2026-10-12

Owner replied **"accept"** to exact corrected-document acceptance and
reviewed patch application. Codex integrator verified baseline/frozen hashes,
passed `git apply --check` and applied only baseline patch
`6df95ab84d29651ed8fc5129196c02ebe053a93d9264335ab16aaf08222e2921`.
Main plan now exactly `c31c2101...9fbe`; source register `ea36f47d...9e46`.
Documentation checks passed; unrelated work preserved. No commit or push.
Earlier unapplied/approval-request entries are historical and cleared.

Next smallest owner choice: **IC-2**, measurement conversions home
`unit-rates@1.0.0`, supported by accepted subject report. This is placement
only; no content authoring, scoring repair, catalog wiring or execution
scope is authorized. IC-3–IC-9 and later gates remain separate.

## IC-2 disposition — 2026-10-12

Owner replied **"approve"** to measurement conversions under
`unit-rates@1.0.0`, placement only; recorded as D-151 in the decision register.
Earlier IC-2 requests are historical. Next **IC-3**: recommended option A
keeps `double-number-lines@1.0.0`, adds actual representation items with a
reviewed figure and complete text alternative, and explicitly accepts that
any older evidence from arithmetic-only items continues counting alongside
representation evidence. Existence of older evidence is unknown; no learner
data was inspected. Alternative B creates a new skill version with separately
reviewed evidence/version dependencies. No choice is made by this checkpoint.

## IC-3 disposition — 2026-10-12

Owner replied **"approve"** to option A, figures with complete text
alternatives and explicit acceptance of the older-evidence limitation;
recorded as D-152. Earlier IC-3 requests are historical. Any older
arithmetic-only evidence continues counting; no learner data was inspected.
No content/scoring/catalog implementation or learner-history work approved.
Next **IC-4**, new Ratios lesson versions with correct references and frozen
pilot `1.0.0` bytes (plan §3.3). No choice is made by this checkpoint.

## IC-4 disposition — 2026-10-12

Owner replied **"approve"** to new Ratios lesson versions with corrected
references while pilot `1.0.0` bytes remain frozen; recorded as D-153.
Earlier IC-4 requests are historical. No implementation or exact new label
approved. Next **IC-5**, option C (opt-in structured multi-field responses)
and document-only RAT-SCORE-DESIGN authorization per plan §3.4/§5.1,
Claude Code `forge-expert` / Opus author then Codex cross-family review.
No code/content changes, historical rescoring or legacy matcher changes.
