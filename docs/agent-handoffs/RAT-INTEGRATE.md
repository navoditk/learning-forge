# RAT-INTEGRATE — Grade 6 Ratios lesson, unit and program versions

## Live relay

- Phase: **RI-5 DONE — committed LOCALLY, push HELD (CE-3)** (2026-10-26).
  RI-5 rev3 (Sonnet verified 199/199 + one 429 stop) `ri5/rev3/ri5.patch`
  `0124c3467842a3e5fcab29dfb04563a4b197063a778ead099c82fb3d3ec1bee5` (31
  files): ten bank records (D-266), `grade-6-math@1.1.0` active, D-256 stamp,
  unit 2.0.0 snapshot, D-246 successor case, D-255 history e2e with keyboard
  and axe. Codex round 3 READY_WITH_RISKS (`review-r3-report.md`
  `56a16b3e...5496`); RI5-R1 recurred once (escalated), closed with cause
  checkpoint. Rulings D-268–D-271. `iso-validation-16` all exit 0 (verify
  2762, integration 362+1, eval 17, e2e 117+1). Push waits for the owner to
  confirm the private package holds all 20 banks (D-271 CE-3 list).
- Phase: **PART A DONE (RI-1..RI-4); RI-4 committed locally, NOT pushed;
  HOLD on push incident** (2026-10-22). RI-4 rev3 (Sonnet verified 125/125)
  `ri4/rev3/ri4.patch`
  `268e3d214f88888dd2625a5e39f5e0b8f85ed7b8b5791e52f919ace49af4fefa`; Codex
  round 3 READY_WITH_RISKS (`review-r3-report.md` `79912aad...e6f1`; RI4-R2
  recurred once, closed with cause checkpoint). `iso-validation-14` all exit
  0 (verify 2753, integration 355+1, eval 17, e2e 110+1). RI-5 waits for the
  owner (RAT-PACKAGE, 93 private items; D-242 mounted e2e; D-255 browser
  history/keyboard/axe; D-256 stamp). Pushes held: see PROGRESS incident.
- Earlier phase: **RI-1..RI-3 DONE (1955f77, CI green); RI-4 rev1 CHANGES_REQUESTED
  (minor); rev2 IN_PROGRESS** (2026-10-22). Sonnet `ad4182ff866269276`
  (verified 109/109) `ri4/rev1/ri4.patch` `941b6cab...5a35` (14 files; verify
  2749, integration 355+1, eval 17, e2e 110+1 unchanged). Codex
  `review-r1-report.md` `7b39bded...ba3e`: RI4-R1 (constructed V-2 hash),
  RI4-R2 (guard misses assignment destructuring). Rulings D-252–D-256: staged
  2.0.0 structure accepted; review stamp deferred to RI-5; browser history,
  keyboard and axe cases mandatory at RI-5. Ledger 90/180.
- Earlier phase: **RI-1, RI-2, RI-3 DONE (committed); RI-4 next** (2026-10-22).
  RI-3 (Sonnet `ad32a914d4a76b89f` verified 32/32) `ri3/rev1/ri3.patch`
  `f22771a2f2634bf0c9f65a3901a104c8b98516ad34d6ed7303b8cab5530614a2`; Codex
  READY_WITH_RISKS first round, no findings (`review-r1-report.md`
  `920c16ab...3357`); rulings D-248–D-251. `iso-validation-13`: tests 2715,
  integration 352+1, eval 17, e2e 110+1; build first failed fetching Google
  Fonts (`next/font`), passed on rerun.
- Earlier phase: **RI-1, RI-2 DONE (committed); RI-3 next** (2026-10-22). RI-2 rev2
  (Sonnet verified 96/96) `ri2/rev2/ri2.patch`
  `a7d8cb596300bf97ee9d1233c7b84870cc388db6606ad69be4519ddb03c050a5`; Codex
  round 2 READY_WITH_RISKS (`review-r2-report.md` `6bc05dc3...a607`).
  `iso-validation-12` all exit 0 (verify 2703, integration 352+1, eval 17,
  e2e 110+1). Open gates: D-242 mounted e2e (owner), D-246 successor
  placement case in RI-5.
- Earlier phase: **RI-1 DONE (72d7dd7, CI green); RI-2 rev1 CHANGES_REQUESTED; rev2
  IN_PROGRESS** (2026-10-22). Sonnet `a66ff2d7b5d2815c7` (verified 73/73)
  `ri2/rev1/ri2.patch` `943ebd60...f0f2` (verify 2703, integration 351+1,
  eval 17, e2e 110+1; parity hash `b8b89cf2...090e`). Codex
  `review-r1-report.md` `80afef84...9ff1`: RI2-R1 major (new-placement
  admission blocks historical replay), RI2-R2 minor (no fetch coverage).
  Rulings D-244–D-247 (incl. RI-5 allowlist for `placement-probe.ts`).
  Ledger 84/180.
- Earlier phase: **RI-1 DONE (applied, committed); RI-2 next** (2026-10-22). Sonnet
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
