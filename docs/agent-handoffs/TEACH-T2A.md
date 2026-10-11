# TEACH-T2A

Phase: **CORRECTING / ISOLATED DRAFT ONLY**.

## Owner authorization

2026-10-10 approval form accepted the independently reviewed T2 proposal,
D-145 retained actor FK, D-146 raw opaque token (UUIDv4 is proposed only for
the next reviewed boundary), D-147 retention until household erasure with
existing backup limitations and no duration.

Selected scope: "Accept proposal; authorize isolated T2a
schema/privacy-coverage/migration draft and disposable local scratch
validation only; review before integration; no production access".

No main integration before independent and human migration review.
No production database/access/probes, data writers, routes, serving,
content, policy thresholds, deployment, commit or push. D-143/D-144 remain
OPEN; export is common-field empty-table-only. T1 validation stays unchanged.

## Baseline and ownership

- Main/worktree HEAD: `d70287d41d93e87f3c5845e38218fa51e1a2c221`.
- Isolated worktree: current session files `teaching-t2a-implementation`.
- Input overlay beside worktree: `teaching-t2a-input-overlay.patch`, SHA-256
  `d3fd4c5b49d01400a384cb8a7bea3ab86f4e8b9ce43bac4e166473d3e619c9b6`.
  Approved matrix, current handoff and learner-state reads only.
- Additional exact proposal `d142183646e35c7c8e7c997bad3711e40e69fcccd76e097706cb736023a26e5d`,
  teaching contract `c18411c4648cd50f40782e18555c4dfbe1977b7f7bfa4c15c50be73b47a161ff`,
  T1 catalog `c4158d5870a01001794fb6298ceff435c77cdd886c0638fafc34f863136cef3e`,
  T1 delivery `6a2d8e0174efde1a6e7b66210513a943b3dc42691a7511bd069290651c9c5d3d`.
- Executor: Copilot Claude Sonnet 5.5, verify runtime task metadata.
- Reviewer/integrator: Copilot GPT-6.1 Sol, host model configuration.
- Worker owns only isolated `prisma/schema.prisma`, one new migration and
  sibling `down.sql`, `src/server/household-data.ts`, directly related
  privacy/local-dev docs, contract/model/persistence/migration tests,
  `scripts/test-migrations.sh` and narrow migration-test helper if needed.
  Package scripts only if required for exact new test wiring.
- Shared matrix/handoffs/PROGRESS remain integrator-only.

## Implementation and evidence

Follow `docs/teaching-persistence-privacy-proposal.md`, current approved
matrix and progression implementation review playbook. Implement full
tenant/actor/event-pin FK integrity, pair/immutable/time/TRUNCATE guards,
legacy-null compatibility, privacy coverage/deletion/retention, common-field
interim export, guarded down and prospective falsifying tests.
If Prisma cannot represent the required integrity, stop with concrete
evidence; do not substitute the removed weaker trigger fallback.

Only synthetic disposable local databases explicitly created for this
task may be used. Existing Docker server is available. Host PostgreSQL
clients exist under `/opt/homebrew/opt/libpq/bin` but are not on default PATH;
adjust command-local PATH only. Do not read main `.env`, use ambient or
inherited DATABASE_URL, touch an existing database, or share Prisma-generated
node_modules between worktrees.

Run deterministic checks, targeted contract/coverage tests, isolated
integration tests and scratch forward/down/reapply plus seeded guards and
explicit catalog checks. State what remains unverified. Freeze allowlisted
patch/artifacts with SHA-256, preserve inputs and release only worker claim.
Return evidence to GPT reviewer; do not integrate or claim reviewed down.sql.

Next: **Sonnet bounded corrections T2A-R1–R4**, then GPT changed-hash
re-review and human migration/privacy approval before integration.
No next-stage writer or serving work.

## Frozen implementation returned

Sonnet runtime task metadata: `claude-sonnet-5.5`, task
`331942d3-8422-4d04-870c-8e35376ed4a3`. Worker reports 14-file draft patch
under current session `files/teaching-t2a-evidence/teaching-t2a.patch`,
prefix `f4affa3e`; reviewer must verify full hash before review. No main
integration or commit. Worker reports disposable PG16 migration
forward/down/reapply/catalog/seeded probes passed and 87 targeted tests;
full `verify` and progression integration/phase1 were not run.

Isolated input overlay lacked `src/curriculum/course-catalog.ts`, causing
typecheck and an assessment-assignment test import failure. This is a
baseline dependency omission, not an accepted passing result; reviewer
must supply exact committed catalog dependencies and repeat affected checks.
The proposal's claim that RESTRICT fails direct household cascades was not
reproduced on PG16; migration review must use observed evidence, not that
prose assertion. Index rename drift predates this patch; scoped diff is not
proof of zero global drift. Concurrency and human `down.sql` review remain
unverified. All worker results are supplied evidence until independently
reviewed.

Worker removed its named disposable container and released its task claim.
No background worker remains active. Local checkpoint commits exclude this
entire isolated schema/migration draft.

## Independent review returned

Review: `docs/course-progression-review/teaching-t2a-20261010-review.md`.
Disposition: **not ready for human review**. Frozen full patch SHA-256:
`f4affa3ef31e70c2fa413e7fcc514ed4f2e6fafb62cdf98d968f304f1379d820`.
Reviewer GPT-6.1 Sol applied the unchanged patch to committed baseline
`f94148a` in current session `files/teaching-t2a-review`, supplying the missing
catalog/T1 dependencies without modifying the original implementation.
Full verify passed (1,653 tests); integration passed (244, one existing skip);
PG16 migration/seeded/catalog/down/reapply passed.

Corrections: remove the migration gate's requirement for unrelated baseline
drift; make function expectations independent of the migration under test;
truthfully disclose raw operation-text/privacy and error-log limitations with
a first-write redaction gate; fix explicit privacy-document formatting.
Controlled catalog mutation incorrectly passed while the existing behavioral
test correctly failed. The RESTRICT cascade counterfactual also passed in a
synthetic variant; preserve proposal bytes and record a reviewed disposition.
No production exposure is established; all observed log keys were synthetic.
No shared-logging runtime edit is authorized by this review alone.

Original draft/patch preserved. Next eligible role is bounded Sonnet
correction, not main integration or a human approval request yet.

## Correction authorization

Owner's 2026-10-10 "proceed, if recommended go aheat and commit/push as needed"
authorizes R1–R4 corrections and independent changed-hash review. The
integrator may commit reviewed status/handoff records; T2a implementation
still cannot enter main before human migration/privacy approval.
Push is held pending the known remote `/resources` mobile accessibility
CI failures; this task does not silently expand into that UI fix.

Correction worktree: current session `files/teaching-t2a-corrections`,
detached `f94148a` plus original frozen patch; complete committed catalog/T1
dependencies and independent copied node_modules are supplied.
Original implementation/review worktrees remain frozen.
Allowlist remains the 14 original paths, plus directly necessary drift-gate
helper/tests, independent catalog expectation fixture and a proposal-evidence
disposition addendum. Do not mutate accepted proposal bytes or shared logs.
R3 in this increment is honest documentation/model comments plus an explicit
first-write diagnostic-redaction gate. No shared runtime logging change,
UUIDv4 tightening, writer, route, key digest substitution or new enum.
Any runtime diagnostics implementation needs its own approved scope.
