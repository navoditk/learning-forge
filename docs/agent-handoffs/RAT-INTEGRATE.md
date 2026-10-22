# RAT-INTEGRATE — Grade 6 Ratios lesson, unit and program versions

## Live relay

- Phase: **RI-1 DONE (applied, committed); RI-2 next** (2026-10-22). Sonnet
  rev2 (verified 92/92 + one 429 stop) `ri1/rev2/ri1.patch`
  `ad3f35a2699f870927c0d19fca15139a2ecfc4c3e5c74b691101fe19b2811bcf` (20
  files). Codex round 2 READY_WITH_RISKS (`review-r2-report.md`
  `0fc559e7...ac62`). Applied; `iso-validation-11`: e2e 110+1, integration
  345+1, eval 17; verify first had three agent-tooling stall timeouts
  (delivery accept/dispatch/integrate) and passed on rerun (2696 + build).
- Earlier phase: **RI-1 rev1 CHANGES_REQUESTED; rev2 IN_PROGRESS** (2026-10-22).
  Sonnet `addda8f9491fcf14b` (verified 76/76 + one 429 stop) `ri1/rev1`
  patch `dc686386...0217` (19 files; verify 2694, integration 344+1, eval
  17, e2e 110+1, mounted branch skipped). Codex review (first call failed:
  `--add-dir` not accepted by `exec resume`; retried) `review-r1-report.md`
  `3944b653...a7`: RI1-R1 (historical NEEDS_HELP updates lost), RI1-R2
  (roster not active-only) major; RI1-R3 minor. D-241 proxies accepted;
  D-242 mounted e2e owner precondition; D-243 roster allowlist. Ledger 80/180.
- Earlier phase: **SCOPE rev3 READY; RI-1 IN_PROGRESS** (2026-10-22). rev2
  `49269c82...ea8f` (round 2: RI-R3 partial, RI-R7/R8 new minors); rev3
  `773c9cc2d8073b472538e6ca911879368c0bc5ec719b2e619c4daa60d0056faf`
  (Opus verified 153/153) Codex round 3 **READY**
  (`review-rev3-report.md` `b0c50737...eadbc`); D-228 condition satisfied;
  D-240 MV-2-COMP six per skill. RI-1 dispatched to Sonnet
  `addda8f9491fcf14b` in isolated `ri1-tree` (ledger 76/180).
- Earlier phase: **SCOPE rev1 CHANGES_REQUESTED; rev2 IN_PROGRESS** (2026-10-22).
  Opus `forge-expert` `aabb3021204b5f439` (verified 112/112
  `claude-opus-5-5`) wrote `scope.rev1.md`
  `64cc82bd44ef84666ca2c543be8eba2ee4bf0f2294ff39022223fecffe10bb8d`
  (baseline `288a165`). Codex `gpt-6.1-sol` (verified, thread
  `01a162b2-c31e-7960-ad17-714911a0f2fe`) `review-rev1-report.md`
  `08a13779...d105`: RI-R1, RI-R2 major (history UI unowned; bank exhaustion
  under L-1), RI-R3–R6 minor. Binding design decisions D-228–D-239 (OC-2 =
  L-2, differing from the author). Opus resumed for rev2 (ledger 72/180).
- Plan: Part A (RI-1..RI-4, public wiring and staging, Sonnet → Codex each,
  with e2e) proceeds after rev2 passes; Part B (RI-5, 10 new private bank
  records, activation) waits for owner-only RAT-PACKAGE/O-10 and MV-10.
- Bundle: common Git `agent-handoffs/RAT-INTEGRATE/`.
- Excluded: private data, RAT-PACKAGE execution, deployment, release,
  production migrations.
