# UI-RESOURCES-A11Y

Phase: **DONE / REVIEWED PATCH ACCEPTED; LOCAL DIFF UNCOMMITTED**.

Next client: **Claude Code**, for approved `UI-RESOURCES-STATUS` only.
Next role: **`forge-implementer` / `sonnet`** under that separate packet.
Navigation implementation, independent review and human acceptance are complete.
Author family: **Claude**, runtime executor `claude-sonnet-5-5`.
Stop after: acceptance checkpoint. No commit, push or deployment.

## Owner scope (approved 2026-10-10)

Fix the axe `target-size` failure (WCAG 2.2 AA 2.5.8) on the primary nav links
("Help", "Parent evidence", about 32x22px with no spacing) at 360px in
`tests/browser/resources.spec.ts:67`, remote CI run `38108327463`. Nav
link styling only. No axe suppression or test weakening, no redesign, no push.

## Frozen patch

`<git-common-dir>/agent-handoffs/UI-RESOURCES-A11Y/resources-nav-target-size.patch`,
SHA-256 `d97365b069c89ef614be676c88219130045488a7278037d4a38c9f7ebd4988e6`.
It is also the uncommitted working-tree diff of `src/app/globals.css` on top
of `c248254`: 10 added lines, flex wrap and gap on the nav, `inline-flex`,
`min-height: 2.75rem` and horizontal padding on its links.

## Author evidence (supplied, not independently validated)

Scratch PG16 container, removed afterwards. Both `resources.spec.ts` axe tests
(360px, 1280px) pass; Playwright 71 passed, 1 skipped, 1 failed;
`npm run verify` 87 files / 1,666 tests; Prettier on the CSS passes.

## Known unrelated failure

`tests/browser/resources.spec.ts:33` expects "Research pending content-owner
review" and finds nothing. It fails identically with the patch reverted and
passed in the earlier CI run. Not in this scope; needs its own task. The patch
does not make CI green while it persists.

## Review asks

Confirm the diff is CSS-only and within scope, that target size and spacing
now satisfy 2.5.8 at 360px, no regression in nav layout at desktop widths,
focus visibility is unchanged, and the author's claims. Run the browser suite
yourself on a task-created synthetic database; the main checkout's Prisma
client had to be regenerated after T2a, so regenerate in your own environment.

## Independent review returned

Report: `docs/ui-resources-a11y-20261010-review.md`.
Verdict: **approve the frozen navigation patch for human review**; no
in-scope correction. Patch SHA-256 is unchanged. Actual Claude author metadata
was verified against the exact CSS edit and successful tool result; native
Codex `forge-reviewer` selected `gpt-6-sol` and completed read-only review.

Independent parent validation in `/private/tmp/lf-resources-review`, pinned
to `c248254` plus the frozen patch, used a task-created synthetic PG16 container,
own regenerated Prisma client, explicit connection and fake tutor. `verify`
passed (87 files/1,666 tests); all four resources axe cases passed. Independent
measurements show 44px height for every link, minimum width 48.09px, 8px/4px
gaps, zero overflow, preserved keyboard order and visible focus. Full browser
suite: **71 passed, one skipped, one failed** at the existing source-status
assertion (`resources.spec.ts:45`), including retry. This is an unresolved
CI gate outside the reviewed CSS scope, not a green browser suite.

Safe independent logs, four nav screenshots, measurements and filtered author
runtime evidence are preserved beside the patch under common Git metadata.
No auth storage state or private content is copied. The task-created container
is removed after validation; no test server or worker remains running.

## Human acceptance and next scope

The owner replied **"accepted"** to the independent review result, accepting
exact navigation patch
`d97365b069c89ef614be676c88219130045488a7278037d4a38c9f7ebd4988e6`.
The subsequent continuation finishes this acceptance checkpoint. The CSS diff
remains unchanged and uncommitted; browser/CI failure still holds push.

The smallest separate proposed task is a test-only correction in
`tests/browser/resources.spec.ts`: assert the current Geography research-only
approval label while retaining all external-link and child-review warning
assertions and every axe check. `docs/curriculum-sources.md:1146` explicitly
records owner approval of research/sources only, and
`tests/app/curriculum-sources.test.ts:321` already expects `approved`. The
rendered approved label is defined in `src/app/resources/page.tsx:35`.
No source-register approval, runtime labeling or content status change is
needed by the observed evidence.

Obtain that bounded scope before implementation. If authorized, allocate one
Claude Code Sonnet implementer packet followed by Codex `forge-reviewer`.
Use the synthetic browser suite to validate the corrected expectation without
weakening warnings or accessibility coverage. This completed nav packet does
not authorize that separate correction or commit/push/deployment.

The owner subsequently approved the bounded test-only follow-up. Its authority,
inputs, ownership and next role are recorded in
`docs/agent-handoffs/UI-RESOURCES-STATUS.md`; do not reopen the navigation patch.
