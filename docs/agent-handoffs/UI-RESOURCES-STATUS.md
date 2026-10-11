# UI-RESOURCES-STATUS

Phase: **INTEGRATED_LOCAL (uncommitted)**.

Next client/role: **Claude Code Sonnet integrator**, for exact-patch integration
and validation.
Author: Claude Code `forge-implementer`, `claude-sonnet-5-5`.
Stop after: integrated-tree validation and checkpoint; no next backlog task.
No commit, push or deployment under this packet.

## Owner authorization and ownership

On 2026-10-10 the owner replied **"approved"** to the specific request for a
test-only update to the Geography status assertion followed by Codex review,
retaining all warning and accessibility checks. This is a separate approved
increment after acceptance of `UI-RESOURCES-A11Y`.

Owned implementation path: **`tests/browser/resources.spec.ts` only**.
Shared packet, index, review reports and PROGRESS are integrator-owned.
No runtime UI, source-register status, dossier approval, content, schema,
provider, dependency, warning suppression or axe configuration change.

## Baseline and inputs

- Control main HEAD: `c248254eebe8c5c8f78a1d0bc108b38b8aac7786`.
  Re-read current HEAD before work.
- Accepted uncommitted nav overlay:
  `<git-common-dir>/agent-handoffs/UI-RESOURCES-A11Y/resources-nav-target-size.patch`,
  SHA-256 `d97365b069c89ef614be676c88219130045488a7278037d4a38c9f7ebd4988e6`.
  This is an immutable input, excluded from the new test-only output patch.
  Applied CSS SHA-256:
  `91449f65fb2fbdb97c7eb19c7f81e33c4ad77f9c6aba054bd03b25098953271b`.
- Original test SHA-256:
  `a2be740aaff74cfa75704954da2f61f0aeb81c0fa0aed31789aea180017b8e17`.
- Source register SHA-256:
  `c53220957d22bd881378d435664cb20c9de4ab5fb6309c6ec4a5e73ac0f3f3ed`.

Read live AGENTS, resume index, this packet, terminal-handoff procedure and
UI implementation/review playbooks. Verify actual Sonnet runtime metadata.
The concurrent owner-approved orchestration update selects `gpt-6.1-sol` for
future native reviews; historical reviews remain attributed to `gpt-6-sol`.
Reload the Codex client and verify effective role selection before review.
Use a uniquely owned isolated worktree with the accepted nav overlay, acquire
the appropriate atomic claim, preserve main's dirty state and unrelated
dossiers, and use an independent generated Prisma client. Stop on conflicting
inputs; do not overwrite another terminal's work.

## Concrete correction

The browser case beginning at `resources.spec.ts:33` checks external-link
labels, `rel`, HTTPS targets and the child-review warning. Its final assertion
at line 45 incorrectly expects pending research status on Geography.
`docs/curriculum-sources.md:1146` records owner approval of research/sources
only; `tests/app/curriculum-sources.test.ts:321` already expects `approved`.
`src/app/resources/page.tsx:35` renders:
`Research approved by the content owner (research only, not a lesson)`.

Replace only the stale pending-status expectation with a positive assertion
of the current research-only approval label. Retain all link/warning assertions,
other resources cases and four theme/viewport axe cases. Do not change the
source register, remove the assertion, change its dossier or loosen it to
unrelated page text.

## Validation and frozen return

Use only a task-created disposable local PG16 environment, explicit
`DATABASE_URL`, fixture authentication secret and fake tutor. Do not read main
`.env`, use an existing database, mount a private assessment package or invoke
a real provider. `CI=1` prevents server reuse; if port 3000 is occupied, report
it rather than stopping another session's app. Generate the isolated Prisma
client before synthetic deployment.

Run `npm run verify`, targeted resources browser tests and full
`npm run test:e2e`. Confirm the corrected assertion and all four axe checks
pass; disclose every skip/failure. Return exact commands/results, actual author
model metadata, base/overlay hashes and a frozen test-only patch SHA-256.
Preserve safe patch/evidence in common Git metadata without auth state/secrets.
Remove only task-owned resources and release only owned claims.

Return to Codex independent review before integration. Expanded source/UI
behavior or changed accepted CSS needs new scope. This packet authorizes no
publication, production migration or deployment.

## Frozen test-only patch returned (Sonnet implementer)

Patch `<git-common-dir>/agent-handoffs/UI-RESOURCES-STATUS/resources-status-test.patch`,
SHA-256 `53cc08398c72bbbd4621a7fba64d9506819d4586341458981e750153673b5fd8`. One file, `tests/browser/resources.spec.ts`: the stale
"Research pending content-owner review" expectation is replaced by the
rendered label "Research approved by the content owner (research only, not a
lesson)". All external-link and child-review warning assertions, other cases
and the four axe cases are unchanged. `git apply --check` passes on main.

Supplied author evidence, from an isolated worktree at `c248254` plus the
accepted nav overlay (hashes matched the packet), own generated Prisma client,
task-created PG16, fixture `AUTH_SECRET`, fake tutor, `CI=1`:
`resources.spec.ts` 10 passed; `npm run verify` 87 files / 1,666 tests;
`npm run test:e2e` **72 passed, 1 skipped, 0 failed**. Prettier passes on the
test. Container, worktree and claim removed.

Disclosure: in an earlier pre-packet run in the main checkout, `npm run db:seed`
executes `docker compose exec db` and so targeted the compose dev database
(synthetic, idempotent; output `INSERT 0 0`, no rows changed) rather than the
scratch database. No other existing database was touched. Seeding the scratch
container directly avoided this in the packet run. Not committed or pushed.

## Independent review returned (2026-10-11)

Report: `docs/ui-resources-status-20261011-review.md`. Fresh Codex
`forge-reviewer` (`gpt-6.1-sol`) found no in-scope defect and returned **approve
for human review** of exact patch `53cc0839...5fd8`. Client runtime metadata
links the exact assertion-writing tool call and successful result to actual
author model `claude-sonnet-5-5`; cross-family independence is satisfied.
Frozen hashes, scope, source-register authority and preserved warning/axe
assertions checked. The reviewer did not rerun the synthetic suites; the
author's 10-pass resources, 87-file/1,666-test verify and 72-pass/one-skip full
browser results remain supplied evidence. Exact logs and skip identity are not
preserved beside the patch.

At review completion, human acceptance of this exact test-only patch remained
open. The patch was unapplied to main; no commit, push or deployment was
authorized. The accepted nav CSS overlay and unrelated work remain protected.
A changed test patch returns to Codex review.

## Human acceptance (2026-10-11)

The owner replied **"accepted"** to the request for acceptance of exact
test-only patch SHA-256
`53cc08398c72bbbd4621a7fba64d9506819d4586341458981e750153673b5fd8`.
The frozen patch still matches that hash and `git apply --check` passes against
control main `c248254` with the accepted CSS overlay untouched. This clears
the patch-acceptance gate only. Claude Code Sonnet is the named integrator for
applying that patch and validating the integrated tree. It must claim the
bounded role, preserve unrelated work, and stop after its checkpoint. Any
changed patch returns for Codex independent review. Commit, push, publication,
production migration and deployment remain outside this packet.

## Integration checkpoint (2026-10-11, Claude Code Sonnet integrator)

Verified patch SHA-256 `53cc0839...5fd8`, CSS overlay `91449f65...271b` and
original test `a2be740a...8e17` all matched; `git apply --check` passed on main
`c248254`; patch applied to `tests/browser/resources.spec.ts` only (5+/1-).
Prettier check passes. `npm run verify` passes on the integrated tree
(format, lint, types, down-migrations, 87 files / 1,666 tests, build). The
browser suites were **not** rerun by the integrator (no disposable PG16 was
created); the author's 10-pass resources and 72-pass/1-skip e2e results remain
supplied evidence, and remote CI is unrerun. Change is uncommitted; no commit,
push or deployment. Next: human decision on the reviewed commit/push
checkpoint (index row 5); push stays held pending CI.
