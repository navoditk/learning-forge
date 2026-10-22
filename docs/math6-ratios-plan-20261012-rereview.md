# MATH6-RATIOS-PLAN revision 2 changed-scope review

Date: 2026-10-12. Verdict: **changes requested; not ready for human review**.
R-2/R-3 resolved; residual R-1 major and IC-3 wording minor remain.

## Frozen evidence and independence

- Frozen report: common Git metadata
  `agent-handoffs/MATH6-RATIOS-PLAN/grade-6-math-ratios-plan.rev2.md`, SHA-256
  `44b0b9ec93de67878996ec5c10d67be80bd176694c3b324f63edf0b53d03f410`.
- Patch SHA-256:
  `613d3d7a5fd3d770a2452f934bf16ba54bcf61bf0700bb4b45fc9c8e09d2528d`.
- Manifest SHA-256:
  `450c5bf58ce78c6abd67d00fc05a2c53ac9d117b4a973b489e1a331acbaa7e6a`.
- HEAD `3e7c33372599d20c285656c3610ca6e47743240f`. Exact reconstruction
  matches the 659-line report and owns only its assigned path. Substantive
  inputs/revision-1 review match; live routing differs due to checkpointing.
- Actual author independently verified from successful metadata:
  `claude-opus-5-5`, assistant UUID `7c2b0115-9cfa-4ea6-a18d-acc68bc26d5f`,
  timestamp `2026-10-12T22:04:10.417Z`, with exact new hashes.
- Same `/root/math6_ratios_plan_review`, host-selected `forge-reviewer`
  fixed to `gpt-6.1-sol`, completed changed-scope turn. Cross-family review.

## Residual R-1 — Major, high confidence

Frozen revision 2 line 496, related 507–514. Stage 1 freezes pending-review
JSON/file hash. Stage 3 obtains approval. Stage 4 requires approved records
to resolve in `servableContentCatalog` with the frozen hash. The servable
catalog admits only `review.status: reviewed` (`src/content/catalog.ts:527`).
Updating status/review metadata changes file bytes/hash; keeping draft bytes
prevents serving, and changing them without refreeze invalidates the check.

Minimal correction: after approval, explicitly record approved review
metadata and freeze final reviewed bytes/manifest. Verify those final bytes
before owner-authorized registration. Distinguish draft and registration
hashes. Substantive changes return to validation/review; define the handling
of metadata-only changes. No content or implementation edit authorized here.

## IC-3 wording — Minor, medium confidence

Frozen revision 2 line 237 states evidence already recorded came from the
two existing items. Static inspection does not establish actual learner
attempts, and limitations leave existing state unknown.

Minimal correction: use conditional wording that any evidence recorded from
these items would continue counting; retain explicit owner disposition.

## Verified corrections

- R-1 loader ownership, tests, validation of every draft, exposure approval
  and exact identity/version/hash resolution are specified; RAT-INTEGRATE
  depends on registration. Remaining byte-freeze sequence is above.
- R-2 lines 285–311 distinguish unweakened correctness acceptance from
  legacy characterization, identify unmet V-7 remainder, preserve semantics
  and carry limitations into packet/release dependencies. No full V-7 claim.
- R-3 lines 415 and 518–522 require IC-7, separate teaching D-61 scope and
  accepted storage/loader. IC-8 no longer authorizes teaching.
- IC-3 adds the needed explicit owner disposition for retained evidence
  from tasks not eliciting representation, subject to conditional wording.

## Validation and return

Prettier 3.9.6 in-memory check, patch whitespace, `git diff --check` and
`git apply --check` passed. No edits or runtime suites/probes/private access,
learner data, databases or providers. Changed scope only; no repeat full audit.

Return to original Claude `forge-expert` / Opus for residual R-1 and IC-3
wording only. Refreeze for Codex review. Owner choices, D-61, private access,
content/state-transition/migration/privacy/publication/activation/release
remain separate. Current patch remains unapplied; no acceptance yet.
