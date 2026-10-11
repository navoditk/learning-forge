# Teaching T2a implementation review

**Disposition: not ready for human review.** Three major corrections and one
minor remain. Passing tests do not authorize migration/privacy acceptance,
main integration, a writer, serving, deployment, commit or push.

## Scope and independence

- Stage: isolated T2a schema, privacy coverage, reversible migration draft,
  empty-table-only interim export and synthetic validation. D-145/D-146/D-147
  are approved; D-143/D-144 and later serving choices remain open.
- Executor: runtime task `331942d3-8422-4d04-870c-8e35376ed4a3`,
  `claude-sonnet-5.5`. Reviewer: Copilot coordinator `gpt-6.1-sol`.
  Different actual model families; reviewer did not author the implementation.
- Frozen 14-file patch SHA-256:
  `f4affa3ef31e70c2fa413e7fcc514ed4f2e6fafb62cdf98d968f304f1379d820`.
  Original worktree and patch were not modified by this review.
- Review worktree: current session `files/teaching-t2a-review`, detached
  `f94148a` plus the exact patch, applied without conflicts and verified with
  reverse-apply check. This committed baseline supplies the catalog and T1
  dependencies missing from the worker's original overlay.
- Approved inputs: decision matrix and `docs/agent-handoffs/TEACH-T2A.md`;
  accepted T2 proposal digest `d1421836...26e5d`, unchanged.
  Followed `docs/progression-implementation-review-playbook.md`.
- Only task-created PostgreSQL 16.15 container `lf-t2a-review-pg`, bound to
  loopback, and its synthetic scratch/clone databases were used. No ambient
  database, main `.env`, production access, real provider or browser server.
  Dependencies were copied into an independent directory and Prisma was
  regenerated there; no generated client was shared between worktrees.

## Re-derived implementation

`prisma/schema.prisma:701-766` adds the context model and nullable event link,
with composite learner/parent/pin foreign keys and operation/event-kind
uniqueness. `0018.../migration.sql:77-247` adds defense-in-depth CHECKs,
UPDATE immutability, time ordering, deferred viewed-pair checks and conditional
TRUNCATE guards. Contexts contain no teaching body, provider input, mastery,
grant or policy threshold. Raw operation strings can still contain personal
text; this is not equivalent to a validated opaque-token boundary.

`src/server/household-data.ts:85-123,280,321-324` adds an explicit interim
export allowlist and event-before-context erasure in the existing transaction.
No teaching writer or route is introduced. Legacy null-context practice
events remain insertable and mutable as before. Authenticated delivery,
catalog ownership, retry policy and future timestamps remain writer
responsibilities, not guarantees of this database shape.

## Findings

Paths and lines below refer to the frozen draft applied to the review baseline.

| ID     | Severity | File / lines                                                                                                    | Confidence | Finding and smallest safe correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T2A-R1 | Major    | `scripts/test-migrations.sh:61-74`                                                                              | 10/10      | A healthy empty Prisma diff fails because the gate requires unrelated `RENAME TO` output. Baseline debt is not a proof that a check ran. Accept a valid empty diff; explicitly classify only the known out-of-scope drift, reject unexpected owned changes, and add a controlled owned-object mutation to prove detection without requiring existing debt. Preserve database-free `verify`.                                                                                                                                                                                                                                                                                                                       |
| T2A-R2 | Major    | `tests/migrations/teaching-catalog-objects.test.ts:308-328`                                                     | 10/10      | Function expectations come from the migration under test, with only substring tokens as an independent oracle. A changed migration plus matching changed function can pass the claimed independent catalog gate while the guard no longer works. Pin independently reviewed expected function definitions/digests or equivalent falsifying assertions. Demonstrate that a regenerated/changed no-op function fails this catalog gate, as well as behavioral tests. Keep supported Prisma drift and unsupported catalog proof separate.                                                                                                                                                                            |
| T2A-R3 | Major    | `docs/privacy-inventory.md:192`; `prisma/schema.prisma:725-735`; `src/server/prisma.ts:5` (existing dependency) | 10/10      | Inventory/model prose claims no learner/free text, and the inventory says never log the key, without disclosing arbitrary raw-key content or actual error diagnostics. Integration output contains synthetic operation keys in PostgreSQL failing-row DETAIL forwarded by Prisma error logging. Correct the inventory/model claims, explicitly classify linked activity/actor/pins as personal data and the key as potentially identifying text, and record the diagnostic-redaction gate before any real writer. Do not silently weaken D-146, store a digest instead, tighten T1 to UUIDv4, or broadly swallow errors. Any shared logging change requires its own approved scope and a synthetic sentinel test. |
| T2A-R4 | Minor    | `docs/privacy-inventory.md:192`                                                                                 | 10/10      | Explicit docs Prettier check fails on the added row; ignored-doc `verify` is not formatting evidence for it. Format this changed document explicitly without mutating frozen accepted proposal bytes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

R3 does not establish any production exposure: no teaching writer exists and
all observed keys are synthetic. The logging dependency predates T2a, but
the new personal-data field and its privacy acceptance require honest
disclosure and a named first-write gate. Other unrelated logging defects
are outside this review.

## Independently executed evidence

Commands ran from the review worktree with an explicit task-only synthetic
`DATABASE_URL`; libpq commands used command-local PATH. Logs are in current
session `files/teaching-t2a-evidence/`.

| Command / probe                                                                                                                      | Result                                                                                                                                        | Evidence                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run db:validate` and `npm run db:generate`                                                                                      | Passed; required composite relations representable; independent Prisma client generated                                                       | Review tool output                                                        |
| `npm run verify`                                                                                                                     | Passed: 86 files, 1,653 tests; fake evals, formatting, lint, typecheck, down-file presence, build                                             | `reviewer-verify.log`                                                     |
| `npm run test:migrations`                                                                                                            | Passed: seeded guards (3 tests), catalog checks (4 tests before and after), forward/down/reapply schema equality                              | `reviewer-migrations.log`                                                 |
| `npm run db:deploy`                                                                                                                  | Passed on synthetic review DB; content archive is synthetic local catalog data only                                                           | `reviewer-deploy.log`                                                     |
| `npm run test:integration`                                                                                                           | Passed: 31 files, 244 passed / 1 existing skip. Includes 53 context cases, household export/erasure and legacy phase1/progression/auth suites | `reviewer-integration.log`                                                |
| `npx prettier --ignore-path /dev/null --check docs/privacy-inventory.md docs/local-development.md`                                   | Failed: privacy inventory formatting; local-development document passed                                                                       | Review tool output                                                        |
| Controlled `bash scripts/test-migrations.sh` with only Prisma diff replaced by valid empty output                                    | Seeded/catalog phases passed, runner then failed at its baseline-drift requirement                                                            | `reviewer-empty-diff-probe.log`                                           |
| Catalog mutation in separate fixture/clone: replace context immutability body by `RETURN NEW`, retaining expected token in a comment | All 4 catalog tests incorrectly passed; existing targeted immutability behavioral test correctly failed because UPDATE succeeded              | `reviewer-catalog-mutation.log`, `reviewer-catalog-mutation-behavior.log` |
| Direct household DELETE under actor-FK RESTRICT variant in separate clone                                                            | Passed (1 selected test); disproves the proposal's blanket expectation that this variant necessarily fails on this PG16 setup                 | `reviewer-restrict-probe.log`                                             |
| Prisma migration failure with a synthetic historical unlinked teaching row, in pre-T2a clone                                         | Refused with P3018/23514; new table/link/trigger absent afterward. No partial DDL persisted in this exercised Prisma path                     | `reviewer-partial-migration-probe.log`                                    |
| Exact patch hash and reverse-apply check                                                                                             | Passed; review baseline restoration did not change patch                                                                                      | Review tool output                                                        |
| Final context and linked-event counts in synthetic integration DB                                                                    | Both zero                                                                                                                                     | Review tool output                                                        |

The seven worker mutation claims are supplied historical evidence, not seven
independently repeated probes in this review. Reviewer added the distinct
falsification probes above. The single integration skip is the existing
Branch-A-only wording test under the active Branch B, not a teaching test omission.

The reviewer removed the named task container and temporary mutation/shim
fixtures after validation. Review worktree and synthetic evidence logs remain
available; no background process remains active.

## Proposal discrepancy and residual gates

- NO ACTION behavior and FK catalog actions pass. The accepted proposal's
  RESTRICT-cascade explanation and its demand for a failing RESTRICT variant
  are not demonstrated by this actual PG16 experiment. Preserve frozen
  proposal bytes; obtain a reviewed disposition/addendum acknowledging this
  evidence. Do not change the accepted NO ACTION choice merely because the
  counterfactual did not fail.
- The production unlinked-teaching-row count, table size/locks, actual app
  role privileges and operational backup controls have not been inspected.
  Production access is not authorized. No backfill/fabricated context is allowed.
- Guards do not defend against an owner disabling/dropping them. Two-client
  writer/interlock/erasure concurrency and safe post-first-write rollback are
  not proved by serial constraint cases. These remain first-write/release
  gates, not claims made by this review.
- Down SQL was read and its non-empty refusal and empty scratch rollback
  passed. It remains human-unreviewed. No production rollback is approved.
- D-143/D-144 are open. Common-field export tests do not settle either
  branch; no real row may be written/served before T3 acceptance.

## Next bounded role

**SWITCH TO Claude implementer (Sonnet), TEACH-T2A corrections T2A-R1–R4,
then GPT cross-family changed-hash re-review.** Review itself changes no
implementation. Use committed baseline `f94148a` and the frozen patch, preserve
the allowlist, and clarify any expanded shared-logging scope before editing it.
Return a new patch/hash and command results. No integration, commit or push.
Human migration/privacy approval is requested only after corrections and
independent re-review, not on the strength of the current green suites.
