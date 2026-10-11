# Teaching T2 persistence/privacy proposal review

Status: **Ready for human review with noted risks; R1–R6 closed in proposal**.
This is a specification review, not privacy/migration approval or runtime
validation. No SQL, Prisma change, database probe, writer or teaching route
has been implemented or exercised.

## Provenance and frozen revisions

- Architect: Copilot task `5c3850d4-db8e-4c84-b5f1-ac1a74bc5b80`,
  runtime task metadata `claude-opus-5.5`, Claude family.
- Reviewer/integrator: this Copilot coordinator, host model configuration
  `gpt-6.1-sol`, GPT family; direct read-only artifact/code review.
- Baseline and allowlisted dirty inputs:
  `docs/agent-handoffs/TEACH-T2-PROPOSAL.md`.
- Initial proposal SHA-256:
  `851e464db949c75e182a6cff27a5bc6aa7a49a828f8d5ba579bd7a100732c31c`.
- First corrected proposal SHA-256:
  `a549a87a98d909d5cc10c1f43c72a14e4b8e20032cc9f71f3746ad1d8b2c59b6`.
- Final reviewed/imported proposal:
  `docs/teaching-persistence-privacy-proposal.md`, SHA-256
  `d142183646e35c7c8e7c997bad3711e40e69fcccd76e097706cb736023a26e5d`.
- Corrections authored by the original Opus architect in the same isolated
  worktree, not by the GPT reviewer. No same-family acceptance substituted.

## Findings and dispositions

| ID  | Severity | Finding                                                                                                                              | Disposition                                                                                                                                                |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | HIGH     | Insert-only fallback checks were weaker than live composite FK integrity under later actor/learner updates and concurrency           | Removed; unsupported Prisma representation blocks implementation until an equivalent reviewed design exists                                                |
| R2  | HIGH     | LearningEvent TRUNCATE bypassed row-deletion pair guards, allowing eventless contexts                                                | Mandatory statement-level conditional TRUNCATE guards, same-role/combined/CASCADE tests, explicit owner-disable limit                                      |
| R3  | MEDIUM   | Linked content provenance incorrectly described as non-child data, while a raw operation key accepts identifying text                | Personal activity/provenance classification and raw-key risk explicit; D-146 storage/validation approval required                                          |
| R4  | MEDIUM   | Seeded rollback probes could interfere with full empty-schema rollback, and alternative audit/constraint surfaces lacked named tests | Separate seeded phase with DELETE cleanup; existing runners named; alternative audit, update, item/skill mismatch and null cases covered                   |
| R5  | MEDIUM   | New actor/key/retention choices were outside the sole matrix and privacy-stage gates ambiguous                                       | D-145–D-147 recorded OPEN in matrix; T2a consumes these before implementation, interim export only for empty table                                         |
| R6  | MEDIUM   | Generic Prisma diff cannot prove preservation of unsupported CHECK/trigger objects                                                   | Closed: supported-schema diff plus separately wired PostgreSQL catalog assertions for definitions, enablement and deferrability; absence/change blocks T2a |

## Evidence reviewed

The proposal was reviewed against `prisma/schema.prisma`, the exact T1
teaching schemas, `src/server/household-data.ts`, the household model-coverage
test, actual prior-work/exposure readers, privacy inventory,
`scripts/run-integration-tests.sh`, `scripts/test-migrations.sh`, the Attempt
update trigger and nonempty archive/audit down-migration guards.

No new executable test was run: every prospective SQL constraint and
acceptance test remains unproven until an approved isolated implementation
and scratch validation increment. Existing code is evidence for the design
inventory, not proof that proposed FK/trigger/Prisma behavior works.

## Remaining human gates

D-145 historical actor treatment, D-146 key representation/format and D-147
context retention remain OPEN. T2a also requires explicit bounded
implementation/probe authorization and privacy/migration review.
D-143/D-144 block completed export/audit behavior before any writer;
D-100/D-102/D-138/D-140/D-141 and separate content/per-program/release
gates remain for later serving and acknowledgement. No decision value
is approved by this review.

## Final disposition and static validation

Direct changed-scope review confirmed the final architect revision separates
Prisma-supported diff from raw-object catalog verification, removes the
weaker fallback, covers paired evidence TRUNCATE guards and keeps lawful
DELETE erasure. New tests/migrations wiring is explicitly a future required
change, not an existing runner claim. The imported bytes match the final hash.

No known blocker remains for presenting this **proposal** to the owner.
Prisma representability, FK/cascade/deferred-trigger semantics, concurrency,
catalog preservation and actual migration reversibility remain unproven
implementation risks. A shared table-owner login can disable/drop guards;
application immutability is not administrator-proof retention.
The proposal's original pending-review metadata is preserved; this report
records completed review without modifying architect-authored bytes.
