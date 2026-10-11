# Teaching T2a corrected-patch changed-hash review

**Disposition: ready for human migration and privacy review with noted risks.**
This is an independent review recommendation, not approval to integrate,
write real teaching data, serve content or deploy.

## Scope and independence

- Reviewed the frozen 18-file patch SHA-256
  `77cd03a76a7d5c1f0776a4f3e752bd099264f57d033c534d04c230480e46bae6`
  against committed baseline `f94148a`. The parent applied it in the separate
  `/private/tmp/lf-t2a-codex-review` worktree; reverse apply and checked owned
  file hashes passed. Accepted proposal, teaching contract and T1 input hashes
  still match `docs/agent-handoffs/TEACH-T2A.md`.
- Author runtime task `331942d3-8422-4d04-870c-8e35376ed4a3` is recorded as
  `claude-sonnet-5.5`. The read-only native `forge-reviewer` role selects
  `gpt-6-sol` in `.codex/agents/forge-reviewer.toml` and completed this review.
  Codex does not expose a separate response-model ID in its completion stream;
  selection, role configuration and successful turn are the available native
  model evidence under `docs/agent-orchestration.md`. The families differ.
- The reviewer made no edits or database calls. The Codex integrator ran the
  authorized synthetic checks before dispatch. Neither role accessed production
  data, the main `.env`, a real model provider or a deployed service.

## R1–R4 disposition

| ID     | Result                            | Evidence                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T2A-R1 | Closed                            | `scripts/classify-prisma-drift.ts` accepts a valid empty/comment-only diff and exact known baseline index renames, rejects silent input and unexpected statements, and names owned-object drift. Database-free classifier tests and the migration runner exercise those paths; the supplied owned-index mutant was detected.                                                          |
| T2A-R2 | Closed                            | `tests/migrations/teaching-pinned-functions.ts` pins the five trigger bodies and SHA-256 digests independently of the migration. Catalog checks include function attributes and rollback-contained no-op, truncate and whitespace mutants; they pass before and after reapply.                                                                                                        |
| T2A-R3 | Closed for this writer-free draft | Schema comments, the teaching inventory row and `docs/teaching-persistence-t2a-evidence-addendum.md` identify the raw operation key as potentially identifying/free text and acknowledge ORM/database diagnostic leakage. They name a separately approved and tested diagnostic-redaction policy as a first-write gate. No redaction implementation or safe real-write claim is made. |
| T2A-R4 | Closed                            | The three changed/added documents pass explicit Prettier checks with `--ignore-path /dev/null`; whitespace check passes.                                                                                                                                                                                                                                                              |

The addendum preserves the accepted proposal's bytes and records the observed
counterfactual: a `RESTRICT` actor FK did not fail direct household deletion in
the tested PostgreSQL 16 clone. The implemented `NO ACTION` choice is still
checked by the catalog test; the proposal's blanket `RESTRICT` failure claim
should not be repeated as observed behavior.

## Independently executed checks

The integrator used a task-created PostgreSQL 16 container on loopback and
explicit synthetic connection strings. The review copy had its own copied
dependencies and regenerated Prisma client.

| Check                                                      | Result                                                                                                                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:validate`, `npm run db:generate`               | Passed                                                                                                                                                           |
| `npm run verify`                                           | Passed: 87 files, 1,666 tests, formatting, lint, types, down-file presence and build                                                                             |
| `npm run test:migrations`                                  | Passed: three seeded guard tests, seven catalog tests before and after down/reapply, Prisma drift classification with ten known index renames, schema round trip |
| `npm run db:deploy` on a distinct synthetic database       | Passed                                                                                                                                                           |
| `npm run test:integration`                                 | Passed: 31 files, 244 tests; one existing skip                                                                                                                   |
| Post-test teaching context and linked-event counts         | Both zero                                                                                                                                                        |
| Explicit three-document Prettier check; `git diff --check` | Passed                                                                                                                                                           |

The build emitted existing Edge Runtime dependency warnings. The migration
runner's expected guard refusals and integration error-path tests emitted
synthetic Prisma diagnostics; their successful assertions do not establish
safe logging for real keys.

## Finding and remaining gates

**Minor, high confidence — general telemetry wording:**
`docs/privacy-inventory.md:194` still says no identifiers or tokens appear in
default operational logs, while its teaching row at line 192 and
`src/server/prisma.ts:5` acknowledge that a failing-row diagnostic can include
the raw operation key. Clarify the general row in a separately reviewed privacy
update. The teaching-specific row and first-write gate make this nonblocking
for human review of the writer-free draft; no teaching writer exists.

Human reviewers must inspect `prisma/migrations/0018_add_teaching_delivery_context/migration.sql`
and its sibling `down.sql`, plus the privacy inventory and addendum, and
explicitly approve or request changes **before any main integration**. The
draft's green checks do not satisfy that gate. D-143/D-144, writer, serving,
diagnostic redaction and release authorization remain open. Production row
counts, locks, app-role privileges, backup controls, owner-disabled guards,
two-client concurrency and post-first-write rollback remain unverified.
