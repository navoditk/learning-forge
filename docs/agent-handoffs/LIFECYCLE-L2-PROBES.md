# LIFECYCLE-L2-PROBES

Phase: **DONE** (probes and independent evidence review complete; next design
scope authorized separately).

Next packet: **`docs/agent-handoffs/LIFECYCLE-L2A-DESIGN.md`**, a document-only
Claude Code Opus correction. Migration/privacy decisions remain later gates.
Do not start L2a, L2b, L3 or another backlog task. No commit, push or
deployment under this packet.

## Authority and frozen inputs

On 2026-10-11 the owner replied **"approved and authorized"** to two distinct
requests. The owner choices for H-01, H-02 (i)–(iv), A-1 and C-1 are recorded
in `docs/agent-handoffs/LIFECYCLE-L2.md`. The separate authorization covers
**only G-12 and G-13 synthetic probes exactly as specified in**
`docs/lifecycle-l2-decision-brief.md` §7, on disposable local PostgreSQL 16
scratch databases and a scratch copy of `prisma/`, assigned to Claude Code
Sonnet. The reviewed brief SHA-256 is
`fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`.
Revision-2 Codex re-review:
`docs/lifecycle-l2-decision-20261011-rereview.md`.

Control main HEAD at authorization: `3e7c33372599d20c285656c3610ca6e47743240f`,
ahead of origin with unrelated documentation edits. Re-read HEAD, status,
claims and all input hashes before execution. Pin `BASE_COMMIT` to the
current committed HEAD only after verifying its migration head remains
`0018_add_teaching_delivery_context` with 19 directories and that the code,
schema and scripts needed by §7 have not changed. Preserve the dirty tree,
especially the untracked brief and review reports; do not copy them into a
scratch migration tree.

## Exact execution boundary

Use brief §7.1–7.5 as the operative procedure. Work only in a uniquely owned
scratch directory outside the repository or an explicitly gitignored local
directory. Each `p12_*` and `g13_*` case needs its own copy of the pinned
baseline migration tree, its own `lf_l2p_*` scratch database and shadow, and
at most its own probe migration. Require the attempted-migration assertion
before interpreting a failure. Stop on an unexpected server version, host,
baseline head/count, existing conflicting scratch name, unexpected migration
or failed isolation check. Do not use a production URL, the developer
`learning_forge` database for writes, another session's database, main `.env`,
real learner data, private assessment packages or a model provider.

All SQL/schema/probe files are scratch-only. Do not edit tracked or untracked
repository code, schema, migrations, tests, decision brief, decisions or
manual-gate records. Do not infer authorization to apply the resulting L2a
migration. Probe failures and V1/V2 differences are findings to report, not
instructions to change the repository.

Acquire one atomic task claim in common Git metadata before writing or
starting a container. Use a distinct scratch workspace. Check for existing
database or browser work before starting a shared server. Use normal client
permission prompts; do not bypass them. Teardown only task-created databases,
scratch files and containers, after preserving sanitized evidence; never
stop or remove another session's resource. If a resource conflict makes the
approved isolation impossible, stop and report it.

## Evidence and handoff

Return `BASE_COMMIT`, actual Claude model metadata, PG and Prisma versions,
per-case migration-directory listings, exact commands with exit codes and
sanitized output, attempted-migration assertions, object queries, G-12
transaction observations, G-13 V1/V2 scripts and drift classification. Record
every skipped or invalid case. Keep evidence under a task-owned safe location
in common Git metadata, with hashes and no credentials or child data. Report
teardown results and any resource left running. The Sonnet integrator updates
this packet, the resume index and PROGRESS only after the probe results are
known, then stops at the next review/human gate.

Results are evidence for G-12/G-13 only. Human migration/privacy approval,
L2a authoring/implementation, L2b/L3 writers, production backfill, commit,
push, publication and deployment remain unauthorized by this packet.

## Results (2026-10-11, Claude Code Sonnet integrator, `claude-sonnet-5-5`)

Evidence (sanitized, no credentials or child data) is in common Git metadata:
`<git-common-dir>/agent-handoffs/LIFECYCLE-L2-PROBES/` (30 files; manifest
`MANIFEST.sha256`, whose own SHA-256 is
`01492df6d667d43e57cb61127288c1e4441595c28bb0571a9be9202eec8e99a3`). It holds
per-case logs with exact commands and exit codes, migration-directory listings,
attempted-migration assertions, object queries, the probe migrations, the
V1/V2 schemas, P13-2 SQL and P13-4 drift scripts.

Pinned inputs: `BASE_COMMIT` `3e7c33372599d20c285656c3610ca6e47743240f`;
brief SHA-256 `fbd345f3...b2fd` verified; baseline `git archive` had 19
migration directories, head `0018_add_teaching_delivery_context`; `prisma/`,
`scripts/`, `src/` had no diff from HEAD. Environment: PostgreSQL 16.15
(`postgres:16-alpine`, own container `lf-l2p-pg`, `127.0.0.1:55433`, trust
auth), Prisma CLI 6.19.3. Claim `LIFECYCLE-L2-PROBES.lock` acquired by single
`mkdir` and released after teardown.

### G-12 (each case: own tree, database; attempted-migration assertion met)

| Case  | Result                                                                                                                                                                                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P12-0 | Exit 0; 19 rows, all finished                                                                                                                                                                                                                                    |
| P12-1 | Explicit `BEGIN`/`COMMIT` success: exit 0; 20 finished rows ending `9001_l2probe_explicit_ok`; no nesting/transaction warning in output; `L2ProbeOk` exists                                                                                                      |
| P12-2 | Explicit boundary, failure: exit 1 (`current transaction is aborted, commands ignored...`; the original division-by-zero text is not shown); 19 finished plus one unfinished `9002_l2probe_explicit_fail` (logs empty); `L2ProbeFail` null, `L2ProbeEnum` absent |
| P12-3 | No explicit boundary, failure: exit 1 (`division by zero`, SQLSTATE 22012); 19 finished plus one unfinished `9003_l2probe_implicit_fail`; `L2ProbeFail` null, `L2ProbeEnum` absent                                                                               |
| P12-4 | Deploy succeeded; row inserted; `psql -v ON_ERROR_STOP=1 -f` down script exit 3 (`refuse`); `L2ProbeOk` and its one row remain                                                                                                                                   |

Observation (reported, not applied): both the explicit-boundary form and the
bare form left no object on failure, so on PG 16.15 with Prisma 6.19.3 neither
form was non-atomic; the explicit form produced no nesting warning on success.
The decision between the two forms, and the masked first error in the explicit
failure, are for the reviewer and human.

### G-13 (V1 = §5 as drafted; V2 = no `actorHouseholdId`/`clearHouseholdId`/`clearLearnerProfileId`)

| Probe               | V1                                                                                                                                                         | V2                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| P13-1 validate      | Exit 0, valid                                                                                                                                              | Exit 0, valid (Prisma accepts the mixed optional/required scalar lists)                                         |
| P13-2 generated SQL | Exit 0; 2 enums, 2 tables, 9 indexes, 6 FKs; no `LearnerProfile_id_householdId_key`; longest identifier 62 bytes                                           | Exit 0; same shape with 3 fewer columns; same exclusion; longest identifier 62 bytes                            |
| P13-3 apply         | `9100_l2probe_g13_v1` (generated SQL plus §6 CHECKs/triggers, wrapped in explicit `BEGIN`/`COMMIT`): exit 0; 20 finished rows; 8 CHECKs, 6 FKs, 2 triggers | `9100_l2probe_g13_v2` (V2 without the two tenant CHECKs): exit 0; 20 finished rows; 6 CHECKs, 6 FKs, 2 triggers |
| P13-4 drift         | Exit 0; classifier: no unexpected drift (10 known baseline index renames tolerated)                                                                        | Same: no unexpected drift                                                                                       |

Representation recorded, not decided: `User` has only
`@@unique([id, householdId, role])` at head, so both variants add
`@@unique([id, householdId])` (generating `User_id_householdId_key`) and
`Session @@unique([id, householdId, learnerProfileId])`; the existing
`LearnerProfile` unique was not redeclared. V2's actor/clear relations use the
required `householdId`/`learnerProfileId` in their scalar lists as
`LearningEvent.deliveryContext` does. The CHECK/trigger SQL and RR-1
partial-null negative-row fixtures were not otherwise exercised (outside
G-13).

### Skipped, invalid and limits

No case was skipped or invalid. `prisma --version` (run once from the repo
root before the scratch cases) auto-loaded the main `.env` for that single
command; no value was read or logged, and every probe command ran from the
scratch tree with an explicit `DATABASE_URL` and no repo `.env`. Containers
`learning-forge-db-1` (5432) and `lf-review-pg` (55432) were not touched.
Teardown: container `lf-l2p-pg` removed (its databases and shadows with it),
scratch directory and helper script removed; nothing left running. No
repository file other than this packet, the resume index and PROGRESS was
edited.

These results are evidence for G-12/G-13 only. They do not approve an L2a
migration, schema, writer behavior or any production operation.

## Independent evidence review returned (2026-10-11)

Report: `docs/lifecycle-l2-probes-20261011-review.md`. Fresh Codex
`forge-reviewer` (`gpt-6.1-sol`) verified the 30-file manifest, pinned brief
and baseline, and actual `claude-sonnet-5-5` executor metadata linked to the
bundle's successful teardown and manifest hash. Verdict: **ready for human
review with noted risks**; no blocker or major G-12/G-13 result defect.

G-12 observations support the reported explicit and bare failure results on
PG16.15/Prisma6.19.3 and the nonempty down refusal, but do not prove general
Prisma transaction behavior. G-13 V1/V2 validate, apply and classify without
unexpected drift; V2 accepts the mixed relation form. CHECK/trigger negative
row behavior, down migration and production conditions remain untested.

One **minor evidence-portability finding** remains: retained G-13 logs use
path placeholders and omit some environment/cwd context, while the full
commands and author identity reside in the original local Claude runtime
record. The frozen bundle is unchanged. A fresh machine or later migration
review must receive a sanitized filtered runtime companion or treat the
original local runtime record as a required, locally available input. This
limitation does not require rerunning the probes and does not clear migration
or privacy review.

At probe-review completion, the next gate was explicit owner scope for a bounded L2a writer-free
schema/migration/coverage draft, with independent review and a separate human
review of `migration.sql`, sibling `down.sql` and privacy inventory before any
application. The current probe authorization does not cover that draft or
database changes. No L2a/L2b/L3 implementation, production operation, commit,
push or deployment is authorized by this packet.

The smallest recommended next scope is a **document-only Claude Code Opus
design correction** of the existing L2a preflight against committed migration
`0018` and reviewed G-12/G-13 results. It should resolve X-1–X-3 (current
migration head, existing `LearnerProfile` composite unique and the tested V2
relation form), the `User` composite-unique choice and the transaction-form
recommendation, with exact SQL/Prisma consequences and down-migration/privacy
questions stated for later human review. Codex `forge-reviewer` would review
that frozen document before any Sonnet code/schema work. At that checkpoint
this was a proposed scope, not an authorized task. The approval follows below.

## Next design scope approved (2026-10-11)

The owner replied **"approved"** to the exact document-only Opus scope above:
correct the L2a preflight for migration `0018` and the reviewed G-12/G-13
results, resolve X-1–X-3, the `User` composite-unique choice and the
transaction-form recommendation, then send the frozen document for Codex
review. This approval is recorded and bounded in
`docs/agent-handoffs/LIFECYCLE-L2A-DESIGN.md`. It does not authorize a
Prisma/schema/SQL file edit, migration authoring or application, database
operation, L2 implementation, production work, commit, push or release.
