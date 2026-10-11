# TEACH-T2A

Phase: **INTEGRATED / validated; committed locally as `56ea7b3`, not pushed**.

Next client: **Claude Code**: `/resources` accessibility task (needs UI scope).
Integration role complete (Claude Code Sonnet, 2026-10-10).
Author family: **Claude**, runtime executor `claude-sonnet-5.5`.
Stop after: **integration checkpoint and applicable synthetic validation**.
Changed implementation must return to Codex `forge-reviewer`; do not advance
to writers, serving, deployment or push.

## Owner authorization

**Current approval:** on 2026-10-10 the owner replied "approved" to the
immediately preceding request for migration/privacy main integration of exact
patch `77cd03a76a7d5c1f0776a4f3e752bd099264f57d033c534d04c230480e46bae6`.
That request linked the frozen `migration.sql`, `down.sql`, privacy inventory
and evidence addendum and disclosed the remaining risks. This clears the
human migration/privacy integration gate for that patch only. Claude Code
Sonnet is the assigned integrator; the Codex status integrator records the
approval and stops at the client relay.

The original isolated-draft authorization and chronology follow.

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

At that correction checkpoint, the next role was Codex changed-hash review;
the completed disposition and current human gate are recorded below.
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

## Frozen corrected patch and native recovery

Sonnet runtime task `331942d3-8422-4d04-870c-8e35376ed4a3` returned the
correction packet; client task metadata confirms `claude-sonnet-5.5`.
No active worker or scratch container remains. These results are **supplied
worker evidence, not a completed independent re-review**:

- Base: detached `f94148a`, complete committed catalog/T1 dependencies.
  Current main may be newer; do not silently change the review baseline.
- Total corrected patch: **18 files**, SHA-256
  `77cd03a76a7d5c1f0776a4f3e752bd099264f57d033c534d04c230480e46bae6`.
  Includes original implementation, drift classifier/contract tests,
  independently pinned functions and a proposal-evidence addendum.
- Reported `npm run verify`: 87 files, 1,666 tests passed.
  `npm run test:migrations`: seeded guards, seven catalog cases before/after,
  supported drift and schema round-trip passed.
  `npm run test:integration`: 244 passed, one existing skip; teaching counts
  zero afterward. Explicit changed-doc formatting passed.
- R1 now accepts valid empty diff and only exact known baseline renames;
  owned-index removal is reported as a detected mutant. R2 independently
  pins five function bodies/digests and reports no-op co-change detection.
  R3 is truthful disclosure/first-write gate only, **no redaction code**.
  R4 formatting and the NO ACTION/RESTRICT addendum are reported corrected.
  Accepted proposal/contract/T1 bytes are unchanged.

The integrator copied eight exact allowlisted files outside Copilot session
storage, preserving originals, and verified source/copy hashes:

```text
<resolved-common-git-dir>/agent-handoffs/TEACH-T2A/
  teaching-t2a-corrected.patch
  hashes.txt
  owned-paths.txt
  evidence-report.md
  verify.log
  migrations.log
  integration.log
  migrations-owned-mutation.log
```

Resolve the directory with
`git rev-parse --path-format=absolute --git-common-dir`. On this checkout it
is `/Users/navoditkaushik/GitHub/learning-forge/.git`.
Files are local, not tracked or transferred by clone/push. They contain the
synthetic task evidence, not main `.env`, private banks or child data.
Same-machine Claude Code/Codex can resume without Copilot session APIs.
For another machine, stop and obtain explicit safe-bundle transfer approval.

Existing corrected worktree can be located through `git worktree list`:
`files/teaching-t2a-corrections` under the original session directory.
If unavailable, reconstruct from `f94148a` in a new uniquely owned isolated
worktree and apply the common-Git patch after checking its SHA-256 and
`git apply --check`. Verify all owned files, including untracked additions.
Do not copy whole session directories or reuse a shared generated Prisma
client. Preserve the immutable original bundle if corrections are requested;
return a new named patch/hash and update this packet.

## Next review requirements

Read the original T2A-R1–R4 review and the supplied evidence report, then
review the changed scope against approved T2a boundaries. Verify the drift
classifier's empty/known/unexpected-output behavior and owned-object
falsification, independent pinned function bodies/digests and co-change
detection, truthful personal-data/error-log disclosure and first-write gate,
formatting, and the evidence addendum without mutating the accepted proposal.
Do not treat worker passing logs as independent validation.

The Codex parent runs relevant synthetic validation in a task-created local
PG16 environment with explicit connection, never ambient/main `.env`:
`npm run db:validate`, `npm run db:generate`, `npm run verify`,
`npm run test:migrations`, `npm run db:deploy`, `npm run test:integration`,
and explicit changed-doc Prettier/whitespace checks. Respect normal
permissions. On macOS use command-local libpq PATH; if tsx hits the socket
path limit, create a short task-owned `TMPDIR` and clean only that directory.
The read-only `forge-reviewer` consumes frozen source/independent evidence
without doing database setup or writing the worktree.

Integrator records actual reviewer model/family, reviewed full hash, results,
R1–R4 dispositions and residual risks in the review report, PROGRESS and index.
Then release only its own claims and give the next terminal/approval step.
No paid Copilot review worker or implementation fleet is needed for this relay.

## Changed-hash review returned; human gate pending

Review: `docs/course-progression-review/teaching-t2a-20261010-rereview.md`.
The Codex `forge-reviewer` selected `gpt-6-sol` and completed a read-only
cross-family review of exact patch
`77cd03a76a7d5c1f0776a4f3e752bd099264f57d033c534d04c230480e46bae6`
on `f94148a`. Verdict: **ready for human migration and privacy review with
noted risks**; R1–R4 are closed for this writer-free draft. The reviewer made no
edits or database calls. The integrator independently validated an isolated
copy: `db:validate`, `db:generate`, `verify` (1,666 tests), migration round
trip/catalog/seeded guards, `db:deploy`, integration (244 passed, one existing
skip), explicit document formatting and whitespace checks all passed on
task-created synthetic databases. No main schema integration occurred.

The reviewer found one nonblocking minor inconsistency: the general
operational-telemetry row in `docs/privacy-inventory.md` overstates default
log exclusion while the teaching row correctly discloses possible raw-key
error diagnostics. Record a separately reviewed privacy wording correction.
Real teaching writes remain blocked pending an approved, tested redaction
policy covering ORM/application/database diagnostics. D-143/D-144, writer and
serving decisions and production/concurrency/rollback evidence remain open.

**Human decision now required:** review the exact frozen
`prisma/migrations/0018_add_teaching_delivery_context/migration.sql` and
`down.sql`, `docs/privacy-inventory.md` and
`docs/teaching-persistence-t2a-evidence-addendum.md` against the accepted
proposal, then explicitly approve T2a migration/privacy integration or request
specific changes. Passing tests and reviewer recommendation are not approval.
If approved, the next role is Claude Code Sonnet integrator for exact-patch
integration only; any changed patch returns to Codex independent review. No
writer, serving, deployment or push follows from this decision.

## Human approval returned; integration relay

The owner's "approved" response accepts the exact reviewed T2a migration and
privacy patch for main integration, including its sibling `down.sql`, with the
risks recorded in `teaching-t2a-20261010-rereview.md`. No new runtime diagnostic
implementation, writer, route, serving, provider, production database action,
deployment or push is authorized by this response.

**SWITCH TO: Claude Code, Sonnet integrator, TEACH-T2A.** Read the live index
and this packet, verify actual Sonnet selection and claims, preserve existing
changes, verify the common-Git patch hash and use `git apply --check` against
the current baseline before applying only the frozen allowlist. Main HEAD at
review completion was `4b6a854b834ddf09dc4f4f21e8ac4582d1560931`; re-read it.
Validate the integrated result with the required code and synthetic persistence/
migration gates in a task-created environment with an explicit connection.
If collisions require changing the reviewed patch, stop for Codex changed-hash
review. Finish with evidence and a durable integration checkpoint. D-143/D-144,
diagnostic redaction, the privacy wording minor and first-write/release gates
remain outstanding.

## Integration completed (2026-10-10)

Claude Code Sonnet integrator applied exact patch `77cd03a7...e46bae6`
(patch-id identical) to main at `ed18540`; committed locally as `56ea7b3` at owner request. Isolated
validation on a task-created PG16 passed: verify 1,666 tests; integration 244
passed + one existing skip; migrations round trip; deploy/validate/generate;
doc formatting. Scratch resources removed. No writer, serving, push or commit.
Remaining: privacy wording minor, diagnostic redaction, D-143/D-144, first-write
and release gates. Push remains held.
