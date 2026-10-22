# RAT-CATALOG-IMPL — dormant Ratios catalog versioning library

## Live relay

- Phase: **DONE — IMPL-1 and IMPL-2 ACCEPTED LOCALLY** (2026-10-21). IMPL-2
  (Sonnet 120/120; files per `impl2/rev2/file-hashes.sha256`, library
  `26ed573e...0cff`): rev1 review RI2-R1/R2 (minor test coverage) fixed in
  rev2; RI2-R3 (scratch-path patch header) repaired mechanically by the
  integrator as `impl2/rev2b/impl2.patch` `f0f083b1...75dd` (two header lines
  only; reconstruction proven). Same-thread `gpt-6.1-sol` (verified)
  **READY** (`impl2/rev2b/review-r3-report.md`). Isolated validation
  `iso-validation-3/`: verify exit 0 (2,598 tests), integration 337/1 skip,
  fake evals 6/6. Dormant only (D-186); live wiring, snapshot commit and
  RAT-INTEGRATE owner gates (C-7, OC-2, MV-2, P-A/H-1 adoption) remain open.
  Successor: RAT-CONTENT needs a named D-61 exception (not yet granted).
- Earlier phase: IMPL-1 ACCEPTED LOCALLY; IMPL-2 IN_PROGRESS (2026-10-20).
  IMPL-1 rev2 (patch `d5ad1ef5...6f55`, closure `2ae76d8a...f599`, Sonnet
  86/86): RI1-R1 fixed; same-thread re-review pinned `gpt-6.1-sol`
  (verified) **READY** (`impl1/rev2/review-r2-report.md`). Integrator isolated
  validation (`DELIVERY-COORDINATOR/claude-window-20261020/iso-validation-1/`):
  `npm run verify` exit 0 (2,563 tests, lint, build), integration 335/1 skip,
  fake evals 3/3, no `.env`. Accepted under D-183/D-186 standing acceptance;
  in the main tree, uncommitted. IMPL-2 dispatched to the same Sonnet
  implementer (scope rev3 §1.5/§2.2/§4.4–4.7); next: Codex review.
- Earlier IMPL-1 phase (2026-10-20). Owner Q-0 answered A (**D-186**):
  IMPL-1/IMPL-2 dormant code is covered by the standing mandate; no live
  adoption. IMPL-1 dispatched to Claude Code `forge-implementer` / Sonnet
  against scope rev3 plus the RCI-R8 test (agent `a3dfdf33a89b58bad`, verified
  81/81 `claude-sonnet-5-5`; bundle `impl1/`, patch `39c7d24c...a73d`).
  Codex review (thread `01a15bac-10ed-7092-af78-ad13a44cfd97`, verified
  `gpt-6.1-sol`): CHANGES_REQUESTED — RI1-R1 minor (sparse arrays in
  canonical JSON) routed to the same implementer; RI1-R2 (full verify
  missing) is integrator isolated validation. Report `impl1/review-r1-report.md`.
- Scope author: Claude Code `forge-expert` agent `a74c6751b96bdfbc6`
  (verified 83/83 `claude-opus-5-5`). Bundle: common Git
  `agent-handoffs/RAT-CATALOG-IMPL/`. rev1 `scope.rev1.md` SHA
  `22d6d4c559360b9947f6312002445ca1eb6a88750b2c4e23ed2745d7d1ca788a`.
- rev1 review: `docs/rat-catalog-impl-scope-20261020-review.md` (Codex
  `gpt-6.1-sol`, thread `01a1598e-0801-7ca0-8fa8-a3efa1faf82b`, model verified
  from native trace): CHANGES_REQUESTED, majors RCI-R1 (snapshot digest
  contract) and RCI-R2 (V-2 exception semantics), minors RCI-R3–R5.
  Correction routed to the same author for rev2; then the same reviewer's
  changed-scope check.
- rev2 `scope.rev2.md` SHA `593c76d8...d506` (Opus 132/132 verified). Same
  Codex thread re-review: R1–R5 closed; new RCI-R6 (major, V-2 exception
  consumption regression, integrator-confirmed at `scope.rev2.md:217-233`
  vs V2-3) and RCI-R7 (minor, manifest unit fields unchecked); report
  `review-rev2-report.md` in the bundle. **Model drift:** the resumed turn
  ran on `gpt-6-sol`, not the approved `gpt-6.1-sol` (`codex exec resume`
  did not carry the model), so that verdict is advisory and the next review,
  pinned with `-m gpt-6.1-sol`, must reconfirm R1–R5 and check R6–R7.
  Correction to rev3 routed to the same author.
- rev3 `scope.rev3.md` SHA
  `9830b39ff1f6c7cb5a896ce9de563809798040c9517510f14cd47e83edf8f7a6`
  (closure `a505dcec...dc20`; Opus 142/142). Re-review pinned to
  `gpt-6.1-sol` (verified): **READY_WITH_RISKS**, RCI-R1–R7 closed
  (R1–R5 reconfirmed on the approved model); report
  `docs/rat-catalog-impl-scope-20261020-rereview.md`.
- **RCI-R8 (minor, nonblocking) integrator disposition:** carried into IMPL-1
  as a binding implementation requirement, not another scope round. The
  "accepted diagnostics and violations never name the same ref" invariant
  applies per occurrence; add a duplicate-occurrence V-2 test (same
  `id@version` twice in one lesson, one good and one bad hash) proving the
  diagnostics and that registration still blocks. Reviewer confirmed no
  fail-open path.
- Shape: IMPL-1 (version index, active selection, V-2/V-10/V-11 checks,
  digest manifest, duplicate `code@version` rejection) then IMPL-2 (H-1
  placement-probe snapshots); synthetic fixtures only, no live wiring.
- Q-0 (owner): is building P-A/H-1 as dormant code covered by the D-183/D-184
  standing engineering mandate? Author and reviewer (advisory) say yes; it
  records no live adoption. Asked in the next owner batch before IMPL-1
  dispatch.
- IC-9 is governed by D-176 (option A); "pending" wording in the accepted
  design document is stale and is not edited in the frozen artifact.
- Excluded: content, registration, migration, flags, learner state, C-7/OC-2–
  OC-5/MV-2 choices, RAT-INTEGRATE wiring, commit, push, deployment.
