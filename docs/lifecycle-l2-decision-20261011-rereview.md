# Lifecycle L2 decision brief revision 2 — independent re-review

## Scope and identity

- Packet: `docs/agent-handoffs/LIFECYCLE-L2.md`; main HEAD
  `3e7c33372599d20c285656c3610ca6e47743240f`.
- Corrected brief: `docs/lifecycle-l2-decision-brief.md`, SHA-256
  `fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`.
- Author: Claude Code `forge-expert`, actual `claude-opus-5-5`. Filtered client
  runtime metadata links message `msg_011CfwRLctu7FvaC8BUibrnj` to an Edit
  call on the brief and message `msg_011CfwRTbQJwtEeVSzd5TLhi` to a
  successful format/hash result containing the exact revision-2 hash.
- Reviewer: fresh Codex `forge-reviewer`, host-selected `gpt-6.1-sol`.
  Cross-family independence is satisfied. The brief's three pinned source
  hashes match, and relevant source, Prisma, scripts and lifecycle inputs did
  not change between authoring and review.

**Verdict: ready for human review with noted risks.** The three prior findings
in `docs/lifecycle-l2-decision-20261011-review.md` are resolved. No new
in-scope blocker or major finding was found.

## Correction dispositions

1. **Probe isolation resolved.** Brief §7.2–7.5 gives each G-12/G-13 case a
   separate scratch migration tree, database and shadow. P12-3 excludes the
   earlier failing `9002` migration; P12-4 carries only its own success-path
   dependency. Each failure interpretation requires the expected migration to
   have been attempted. G-13 drift is evaluated only after that candidate's
   successful deployment. See `docs/lifecycle-l2-decision-brief.md:565`.
2. **D-28 partial writes resolved.** Brief §3.4 distinguishes completed
   histories from a correct attempt committed before mastery is written and
   describes the possible D-28 consequence. This matches
   `src/phase1/service.ts:466,491,533,669` and
   `src/progression/skill-assessment.ts:212–222`. See brief line 346.
3. **Legacy resumption resolved.** Brief §3.4–3.5 limits resumption to a
   matching content and activity kind. Null-kind legacy rows remain open and
   a new kind-set session may be created. This matches
   `src/phase1/service.ts:179,192–201`. See brief line 374.

## Limits and next gate

The owner wording keeps H-01, H-02, A-1 and C-1 as choices, separate from
recommendations and authorizations. Option D still requires a separate L1/enum
change and approval. L2a migration/privacy review and G-12/G-13 probe
authorization remain separate gates.

The reviewer used read-only source inspection, hash and author-provenance
checks, baseline comparison and `git diff --check` (passed). No files under
review were changed; no probes, database operations, provider calls, installs
or tests ran. Thus transaction behavior, candidate Prisma relations and drift
remain unverified. Production row populations and deployment overlap are
unknown. This report neither approves owner choices nor authorizes L2a, L2b,
L3, migration, production operations or release.
