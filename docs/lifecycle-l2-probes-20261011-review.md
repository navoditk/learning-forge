# Lifecycle L2 G-12/G-13 probe evidence — independent review

## Scope and identity

- Packet: `docs/agent-handoffs/LIFECYCLE-L2-PROBES.md`; baseline
  `3e7c33372599d20c285656c3610ca6e47743240f`.
- Reviewed brief: `docs/lifecycle-l2-decision-brief.md`, SHA-256
  `fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`.
- Evidence: `<git-common-dir>/agent-handoffs/LIFECYCLE-L2-PROBES/`, 30 files
  named in `MANIFEST.sha256`; manifest SHA-256
  `01492df6d667d43e57cb61127288c1e4441595c28bb0571a9be9202eec8e99a3`.
  All entries passed `sha256sum -c`.
- Executor: Claude Code Sonnet, actual `claude-sonnet-5-5`. Filtered local
  client runtime metadata links message `msg_011CfwSWKZGEDTQzNwGPAcFd`
  and Bash tool `toolu_01DxwnRm2ZHASKyduMnCpAN7` to a successful teardown
  and the exact manifest hash. Reviewer: fresh Codex `forge-reviewer`,
  host-selected `gpt-6.1-sol`; cross-family independence is satisfied.

**Verdict: ready for human review with noted risks.** No blocker or major
result defect was found in the G-12/G-13 evidence scope.

## Evidence assessment

- **G-12:** The baseline and success assertions identify the intended
  migrations. Each failure has 19 finished baseline rows and its own
  unfinished probe, with no test table or enum afterward. The explicit
  boundary succeeded without a nesting warning, but its failure output masked
  the initial division error and left empty Prisma migration logs. The bare
  failure surfaced division by zero. P12-4's `psql` down path refused a
  nonempty table and preserved its row. These are observations on PostgreSQL
  16.15 and Prisma CLI 6.19.3, not a general guarantee about arbitrary files.
- **G-13:** V1 and V2 schemas match the scoped candidates. Both validate,
  deploy their own 20th migration, and show only the 10 allowlisted baseline
  index renames in drift output. V2 demonstrates that Prisma accepts the
  mixed optional/required relation scalar lists without the three duplicate
  tenant columns. Object counts establish CHECK and trigger creation only;
  negative-row enforcement and down-migration behavior were outside this
  probe.
- **Isolation:** Runtime records support one task-owned PG16 container bound
  to `127.0.0.1:55433`, separate case databases/shadows/trees, and removal of
  task resources while existing database containers stayed in place. Root
  `prisma --version` loaded `.env` once; this disclosed procedural deviation
  exposed no captured secret value or evidence of database/learner access.

## Finding R-01 — minor, high confidence

The retained G-13 logs abbreviate actual schema, migration and shadow paths
with placeholders and omit some environment and working-directory context
(`g13_v1.log:18,121` and corresponding V2 entries). `00-setup.txt` reports
the model but does not itself preserve client metadata. The original local
Claude runtime records contain the actual command context and successful
teardown, so this does not invalidate the observed results; portability to a
fresh machine is limited. The frozen evidence bundle remains unchanged. Any
future transfer or migration review relying on exact commands must either
carry a sanitized filtered runtime companion or explicitly retain this local
runtime dependency and confirm it remains available.

The reviewer used read-only hash, source, log, SQL and runtime-provenance
inspection. No files under review were edited and no probes, databases,
providers, installs or tests were run. G-12/G-13 evidence does not authorize
an L2a migration, L2b/L3 writers, production operation, release or push.
