# SCI6-USABLE — first usable Science unit (practice-only path)

## Live relay

- Phase (2026-10-30): **SCI6-LEAK-CAL rev2 IN PROGRESS** (Opus author;
  Codex review next).
  - Done:
    - SU-H7 eval satisfied (D-284);
    - six-item run 1 FAIL (D-290);
    - structural narrowing integrated (D-294).
  - Remaining:
    - LEAK-CAL integration;
    - a new owner-authorized six-item run judged against D-285;
    - owner SU-H6 (D-289);
    - PRIVATE-MERGE run (D-292);
    - H8 onward.
  - Full routing: PROGRESS "Resume here", 2026-10-30 block.
- Phase: **SU-E3 APPLIED LOCALLY (D-201); AWAITING_HUMAN — SU-H6, SU-H7 run,
  H9a** (2026-10-21). Batch B: D-201 SU-H5 apply (patch `b09e6370...c163`,
  7 files verified), D-202 SU-H7 approved for the owner to run, D-203 H9e
  reaffirm, D-204 H9h1 adopt. Integrator isolated validation of the applied
  tree (`iso-validation-6`): verify exit 0 (2,614 tests), integration 337/1
  skip, fake evals 17/17, no `.env`. Next after owner actions: H8 local
  commit list, H9b, H9f, H9g, H9j, H9i, H9c-dec/H9d, H9h2.
- Earlier phase: AWAITING_HUMAN — Batch B (2026-10-21). SU-E3 rerun review
  (thread `01a15e99-8535-7ea0-a8ca-6f176a77b605`, verified `gpt-6.1-sol`):
  **READY_WITH_RISKS**; AC-R1 (cleanup wording) annotated in
  `su-e3/integrator-annotation.md`. Candidate stays frozen and unapplied until
  SU-H5. All SU-E engineering packets done.
- Earlier phase: SU-E3 FROZEN; REVIEW BLOCKED (Codex quota) (2026-10-21). SU-E3
  candidate (Sonnet 181/181; patch `b09e637065d09189b605f0691e773212ce5abd8f11c71db647206bac9015c163`,
  self-audit `992f8811...f29a`; ownership amendment `su-e3-ownership-amendment.md`)
  NOT applied to main. Author evidence: verify 2,614 tests; integration
  337/1 skip; sanitized e2e 110 passed / 1 skipped / 0 failed; 6 screenshots.
  Codex `gpt-6.1-sol` review (thread `01a15bfe-0e64-7cc3-b8f6-a1eb7f2978dd`)
  failed mid-run: ChatGPT usage limit, retry after 9:34 PM local; partial
  transcript confirmed hashes only, no verdict. Next: rerun the same review
  (pinned `-m gpt-6.1-sol`) after reset; no same-family substitute.
- Earlier phase: SU-E5 ACCEPTED LOCALLY; SU-E3 IN_PROGRESS (2026-10-21). SU-E5
  (Sonnet 114/114; patch `c5dc3861...d65d88a`, rev2 evidence): first e2e run
  blocked by Auth.js `MissingSecret`; integrator amendment
  `e2e-auth-secret-amendment.md` (ephemeral per-run `AUTH_SECRET`, mirrors
  `.github/workflows/ci.yml:42`). Sanitized e2e: 105 passed, 1 skipped
  (private package), 0 failed; three parent-note fixtures and axe pass.
  Codex `gpt-6.1-sol` (verified, thread `01a15bdf-7cdf-7680-b77f-1bb160480472`)
  **READY_WITH_RISKS**, no findings, amendment accepted. Applied to main;
  `iso-validation-5/`: verify exit 0 (2,614 tests), integration 337/1 skip,
  fake evals 17/17. SU-E3 (frozen activation candidate, NOT applied; SU-H5)
  dispatched in an isolated copy.
- Earlier phase: SU-E4b ACCEPTED LOCALLY; SU-E5 IN_PROGRESS (2026-10-21). SU-E4b
  (Sonnet 80/80; patch `55cd8fdd...7415`): Codex `gpt-6.1-sol` (verified,
  thread `01a15bd0-b83d-7dd1-82c3-bc1ccfe2709d`) **READY_WITH_RISKS**; EB-R1
  (self-audit test-count wording) annotated in `su-e4b/integrator-annotation.md`.
  Applied to main; `iso-validation-4/`: verify exit 0 (2,609 tests),
  integration 337/1 skip, fake evals 17/17. Script bounds calls and output
  tokens, not dollars; paid run stays SU-H7; D-193 holds release until it
  passes. Known flaky pre-existing `tests/agents/delivery-dispatch.test.ts`
  (unrelated). SU-E5 (D-191 note) running in isolated copy `sci6-e5-tree`.
- Earlier phase: SU-E4 ACCEPTED LOCALLY; SU-E4b IN_PROGRESS (2026-10-21). SU-E4
  (Sonnet 59/59): rev1 TF-R1 (null framing bypass) fixed in rev2 (patch
  `065d45ba...29fb`); same-thread `gpt-6.1-sol` (verified) **READY**
  (`su-e4/rev2/review-r2-report.md`). Applied to main after lane A's IMPL-2
  freeze; all 12 files match. `iso-validation-3/`: verify exit 0, integration
  337/1 skip, fake evals 6/6 (incl. Science 6/6). Residual: finite 17-pattern
  guard (known gap); `scoreConstructedResponse` still Math-framed but has no
  runtime caller. SU-E4b (capped selector, D-193, SU-R16 wording) running in
  the isolated copy on top of SU-E4 rev2. No paid run (SU-H7).
- Earlier phase: SU-E1/E2 ACCEPTED LOCALLY; SU-E4 IN_PROGRESS (2026-10-20).
  Same-thread re-review pinned `gpt-6.1-sol` (verified) **READY_WITH_RISKS**:
  SE-R1–R3 closed by integrator isolated validation (`iso-validation-1/`);
  residual: the recorded historical Prisma `.env` auto-load. Report
  `su-e1e2/review-r2-report.md`. Accepted under D-183 standing acceptance;
  uncommitted. SU-E4 (D-189) dispatched to a fresh Sonnet implementer working
  in an isolated copy (baseline manifest `su-e4/baseline-manifest.sha256`)
  because it edits `src/app/api/phase1/hint/route.ts`, inside lane A's IMPL-2
  byte-identity window; patch applied only after IMPL-2 closes. Then SU-E4b
  (D-193: no automatic fallback; SU-R15/R16 wording), SU-E5, SU-E3 last.
- Earlier phase: SU-E1/E2 IN_PROGRESS (2026-10-20). Owner reply "approve all
  recommendations, R14(i)": D-187 H0 (a), D-188 H1 (b), D-189 H2 (b),
  D-190 H3 (a), D-191 H10 (b), D-192 H11 (a), D-193 SU-R14 (i) — no auto
  fallback; release blocked until the capped paid eval passes. SU-R15/R16
  carried as SU-E4b wording fixes. SU-E1 then SU-E2 dispatched to one Sonnet
  `forge-implementer` (lane B, tests only, owned disposable PostgreSQL).
  Done by agent `a5a54878b995238a5` (verified 55/55 `claude-sonnet-5-5`;
  bundle `su-e1e2/`, patch `998833e5...c2af`). Codex review (thread
  `01a15baa-1063-7900-8b96-02eced466c67`, verified `gpt-6.1-sol`):
  CHANGES_REQUESTED on evidence only, all 12 cases covered. SE-R1: the
  integrator-prescribed `prisma migrate deploy` auto-loaded `.env` (Prisma
  CLI default; log shows target 127.0.0.1:55435; no agent read the file) —
  deviation recorded. SE-R2/R3: full verify and isolated provenance missing.
  Closure: integrator isolated validation (snapshot without `.env`,
  sanitized env, owned DB 55436), then bounded re-review.
- Prior phase: AWAITING_HUMAN — rev3 (`a6de4a4d...f2cf6`, Opus 364/364) review: SU-R1/R4/R6/R7/R8/R11/R12/R13 closed; SU-R14 (major, auto-fallback of owner H2 choice) needs owner disposition; SU-R15/R16 minor wording. No further automatic correction round (checkpoint). Report `docs/sci6-usable-scope-20261020-rev3-review.md`.
- Scope author: Claude Code `forge-expert` agent `a7df6039754b4704b`
  (verified 147/147 `claude-opus-5-5`). Bundle: common Git
  `agent-handoffs/SCI6-USABLE/`. rev1 `scope.rev1.md` SHA
  `c1a1e3ce1b2c854c3778a7a8a34b2f3e6baab80cc282724ab65fd202fd45d135`.
- rev1 review: `docs/sci6-usable-scope-20261020-review.md` (Codex
  `gpt-6.1-sol`, thread `01a1598e-63fd-78c1-8575-ae9f4f87d39f`, model verified
  from native trace): CHANGES_REQUESTED, SU-R1–SU-R10 (eight majors).
  Correction routed to the same author for rev2; then changed-scope check.
- Proposal: practice-only unit (three D-168 skills as one Life Science
  chapter). Engineering packets SU-E1 (DB-free readiness tests), SU-E2
  (synthetic service loop), SU-E3 (frozen activation candidate), SU-E4
  (Science tutor framing, conditional). Human gates SU-H0–SU-H9 batched;
  none decided. No packet dispatched before the corrected scope is reviewed.
- Excluded: availability flip on main, content/D-61, private access,
  real-provider evals, release, commit, push, deployment.

## Rev2 result and recurring-major checkpoint — 2026-10-20

rev2 `scope.rev2.md` SHA `6fe7de39...0d99` (Opus 218/218 verified). Same
thread re-review pinned `gpt-6.1-sol` (verified):
`docs/sci6-usable-scope-20261020-rereview.md`. Closed: SU-R2, R3, R5, R9,
R10. Still open (major): SU-R1, R4, R6, R7, R8. New: SU-R11 (minor), SU-R12
(major, circular release dependencies), SU-R13 (major, note-rendering
evidence).

| Round | Author/freeze           | Review result                       |
| ----- | ----------------------- | ----------------------------------- |
| rev1  | Opus 147/147, c1a1e3ce… | 8 major, 2 minor                    |
| rev2  | Opus 218/218, 6fe7de39… | 5 closed; 5 major open; 2 major new |

**Cause (integrator):** corrections asserted runtime behavior without
tracing the full code path. G15/H10 assumed estimates are only 0 or 1 and
missed the assistance-weighted writes in `src/phase1/service.ts:153-164,
1092-1107`. The SU-E4b cap was designed without following the harness
catch/retry path (`src/tutor/harness.ts:80-105`, `runner.ts:40-95`). The
guard's own negative example was never checked against its pattern list.
The gate graph was never checked for cycles or push-triggered bypass.

**Action:** one consolidated same-author rev3 limited to SU-R1, R4, R6, R7,
R8, R11, R12 and R13. For every behavioral claim, cite the exact code path
read end to end, including catch/retry and overwrite paths. Mechanically
check each prescribed negative control against its prescribed detector,
and check the gate dependency graph for acyclicity, listing the order. Do
not reopen closed findings. If any of these cannot be closed by scope text,
narrow the packet (for example, mark SU-E4b out of this window) rather than
over-claim. Same reviewer verifies; a third round of majors escalates to
the owner with options rather than another correction.
Note: the reviewer saw index routing drift caused by lane A's legitimate
rev3 update; the author re-pins the index at rev3.
