# PRACTICE-RELEASE — Existing-content learner release preparation

## Authority and live relay

- Phase: **DONE (S0, deployment deferred)** — readiness bundle frozen
  2026-10-15 by Claude Code `forge-implementer` agent `a8803c54711517d45`.
  Integrator verified 240/240 records `claude-sonnet-5-5`, all 10 bundle files
  against `hash-manifest.sha256` (SHA `95b003f4...d298`), 69 path pins against
  live main, and spot-checked the two-records catalog guard
  (`src/content/catalog.ts:498`), the 0018 "UNREVIEWED DRAFT" header and
  origin/main `1b274cc`.
- Owner dispositions D-175–D-181 (decisions register): S0 defer; IC-9 A and
  parts option (i) by delegated judgement; accept enrichment limits; manual
  checks and production facts are owner actions; PR-7a local commit executed
  as `059c7f6` (exact 30 files; `npm run verify` on that tree 93 files/1,975
  tests/build pass). Not granted: push, migration 0018, deployment, PR-10.
- Remaining release gates (owned by the owner, not a generic backlog): D-179
  manual results, D-180 production facts, PR-8 resolution, named release and
  rollback owners, last-good deploy, and the first reviewed structured-content
  slice that S0 bundles with.
- Owner replied **"go ahead"** on 2026-10-14 to turning the recorded delivery
  lanes into concrete tasks. D-167 records bounded preparation, not a new
  scoring disposition, content exception or release approval.
- Lane A preserves the active `RAT-CATALOG-DESIGN` correction/review relay.
  Do not replace that assignment. Queue this packet for a separately claimed
  Claude Code `forge-implementer` / Sonnet 5.5 preparation turn after that
  lane's current role is finished and its handoff is checkpointed.
- A separate Opus Science preparation turn may run concurrently in lane B.
  No worker is launched by creating this packet.

## Deliverable and ownership

Produce one compact release-readiness evidence bundle in common Git metadata,
`agent-handoffs/PRACTICE-RELEASE/`, not another architecture proposal:

1. Exact candidate application source/patch hashes and reviewed UI/backend
   provenance. Current baseline is main `3e7c333` plus accepted uncommitted
   CORE, PATHS and PRACTICE-FIRST changes; pin the actual allowlisted inputs
   at intake. Do not treat clean HEAD alone as the integrated application.
2. An existing-content manifest by program, skill and item identity/version,
   with review state, supported answer mode and known scoring limitations.
   Grade 6 Math is first priority; assess existing enrichment/Spelling only
   for reuse, not expansion. No structured item is registered today.
3. A release matrix: ready evidence, missing evidence, exact owner decision
   and smallest necessary correction for each intended learner journey.
   Reuse the recorded 1,975-test/build, 102 browser passes/one existing skip
   and three fake eval results where applicable; they are prior evidence,
   not newly executed checks or proof of live-content readiness.
4. One consolidated human request for the precise proposed release scope:
   content and legacy-risk dispositions, remaining manual checks, reviewed
   commit/push checkpoint and application deployment/activation permissions
   identified separately. Name the environment and rollback prerequisite;
   do not invent deployment credentials, a release commit or a rollback owner.

Worker owns only its evidence bundle and isolated scratch files. The claimed
integrator alone updates shared status, decisions and packets. No source,
content, catalog, policy, schema, flag or learner-state changes in this task.
Return a hash manifest and concise requirements-to-evidence table.

## Acceptance boundary

- Reuse the implemented overview/topic/activity interface. Do not build a
  second UI, change the default landing flow or add optional lifecycle work.
- Identify browser, keyboard, screen-reader, mobile/zoom and copy evidence
  for the exact proposed scope; do not claim unperformed manual reviews.
- Preserve server-offered activity authorization, unavailable program labels,
  current compatibility behavior and completion-versus-mastery distinctions.
- IC-9 is still undecided. Enumerate affected items and consequences; do not
  silently select A/B/C, remove live content or imply legacy defects are fixed.
  Do not assert exclusion is trivial: catalog/count/coverage and access effects
  must be checked before proposing it.
- A practice-only release must explicitly omit unserved teaching and any
  unapproved assessed progression. Apply relevant existing manual gates;
  optional teaching/recall work is not a universal release prerequisite.
- Do not register new structured content merely to demonstrate the new UI.
  A later approved content slice must be independently reviewed before serving.

## Intake, model and validation

Read AGENTS, live lane assignment, orchestration accountability/batching and
delivery exit rules, README, latest PROGRESS, learner presentation design,
completed PRACTICE-FIRST/PATHS packets, current decisions, manual gate record
and actual content/registry/authorization code. Verify effective Sonnet model
ID/family from client metadata. Unknown/overridden selection blocks dispatch.

Claim a task-specific worker lock with checked atomic acquisition; use a
pinned isolated worktree and allowlisted dirty inputs. Preserve the active
catalog packet and frozen artifacts. Do not edit another terminal's checkout.
Use static inspection and existing frozen evidence first. If new synthetic
runtime validation is needed, return exact commands/environment requirements
for authorization rather than accessing an ambient database or rerunning
every suite to populate this handoff.

No production/learner data, private package access, paid provider, database
operation, real-provider evaluation, migration, deployment, activation,
commit or push. D-61 exception: none. No second release-design review layer:
once the readiness bundle is complete, the integrator checks its traceability
and routes genuine missing evidence/choices to the human together. Changed
code/content still needs its normal scoped independent review.

## Stop

Return readiness evidence and consolidated exact permissions; stop for human
disposition. Do not leave "publish later" as an unowned generic backlog item:
name the next eligible integrator role and concrete remaining release gates.
The release owner must be explicitly assigned before execution.
