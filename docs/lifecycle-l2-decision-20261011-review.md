# Lifecycle L2 decision brief — independent review

## Scope and independence

- Packet: `docs/agent-handoffs/LIFECYCLE-L2.md`.
- Frozen brief: `docs/lifecycle-l2-decision-brief.md`, SHA-256
  `78c65659e8a8b961f38c765b688fc204a4925af8b83f59f53bc04832456e35c8`.
- Author: Claude Code `forge-expert`, actual `claude-opus-5-5`. Filtered client
  runtime metadata links message `msg_011CfwJHq1mbayK2VtpRKifw` to the Write
  tool call for this brief, and message `msg_011CfwJXqwy76HoptE94V64j` to
  the successful formatting/hash call.
- Reviewer: fresh Codex `forge-reviewer`, host-selected `gpt-6.1-sol`.
  Cross-family independence is satisfied. The reviewer checked the frozen
  hash and pinned inputs against main `3e7c333`.

**Verdict: changes requested. The brief is not ready for human decisions.**

## Findings

1. **Major, high confidence — failure probes reuse an earlier failing
   migration.** In brief §7.2–7.3, the plan recreates the database between
   P12-2 and P12-3 but keeps both scratch migrations in one directory tree.
   P12-3 deploy therefore encounters `9002_l2probe_explicit_fail` first and
   cannot test `9003_l2probe_implicit_fail`. The proposed observation cannot
   distinguish transaction behavior. Give each G-12 and G-13 candidate a
   separate scratch migration tree containing the pinned baseline and only
   that probe. Assert the attempted migration name before interpreting a
   failure. See `docs/lifecycle-l2-decision-brief.md:548,559`.
2. **Minor, high confidence — missing mastery does not prove that no correct
   check was recorded.** Brief §3.4 says D-28 is unaffected under every
   option. `createAttempt` commits the attempt before updating the session and
   writing mastery (`src/phase1/service.ts:466,491,533`). An interrupted
   sequence can leave a correct `MASTERY_CHECK` without a mastery estimate;
   the diagnostic guard checks only the estimate (`:669`). Qualify the claim
   for successful sequential history and explain the partial-write case and
   potential D-28 effect (`src/progression/skill-assessment.ts:212`). See
   `docs/lifecycle-l2-decision-brief.md:336`.
3. **Minor, high confidence — null-kind legacy rows are described as
   resumable.** Brief §3.4–3.5 includes legacy rows in the “next start
   resumes” consequence. `startSession` defaults to `PRACTICE` and queries
   that exact activity kind (`src/phase1/service.ts:179,198`). A null-kind
   legacy row stays open while a new kind-set row may be created. Limit the
   resume statement to rows matching both content and activity kind. See
   `docs/lifecycle-l2-decision-brief.md:343,370`.

The reviewer used read-only source inspection and `git diff --check`. No
database, synthetic probe, provider, migration, test suite or screenshot was
run; no files under review were edited. Recommendations in the brief remain
unapproved. Migration/privacy, implementation, production and release gates
remain closed.

Return these bounded corrections to the original Claude Code Opus
`forge-expert`. Freeze and hash the corrected brief, then request a new Codex
cross-family review before asking the owner to decide H-01, H-02, A-1, C-1 or
probe authorization.
