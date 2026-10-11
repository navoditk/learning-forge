# Resources navigation accessibility review

**Verdict: approve the frozen navigation patch for human review.** No in-scope
finding requires correction. The full browser gate remains failing; this
recommendation does not authorize commit, push or deployment.

## Scope and model evidence

- Reviewed exact CSS-only patch SHA-256
  `d97365b069c89ef614be676c88219130045488a7278037d4a38c9f7ebd4988e6`
  on baseline `c248254eebe8c5c8f78a1d0bc108b38b8aac7786`: ten added lines
  in `src/app/globals.css`. The independent validation copy is
  `/private/tmp/lf-resources-review`; the main frozen diff is unchanged.
- Claude client runtime metadata ties model `claude-sonnet-5-5` to the exact
  CSS-writing tool call: session `bcdeaba6-7365-4e87-a9b4-b57f8284cd53`,
  message `msg_011CfuqWJec4ZDXP41xrEWX9`, tool
  `toolu_015NJEFin962hVDFYkvKJErH`, timestamp
  `2026-10-11T04:42:27.317Z`. Its successful tool result follows at
  `04:42:27.905Z`. Filtered provenance is preserved in the evidence bundle;
  no unrelated session text is copied.
- Native Codex `forge-reviewer` dispatch selects `gpt-6-sol` and completed a
  fresh read-only review. This is cross-family review. The reviewer inspected
  the patch, affected navigation/focus code, independent logs and narrow light/
  wide dark screenshots. The parent performed the synthetic browser setup and
  validation; the reviewer made no edits or database calls.
- Followed `docs/ui-review-playbook.md` and `docs/agent-orchestration.md`.
  The change adds no data access, authorization, provider, content, test
  suppression or dependency behavior.

## Independent evidence

The parent used a task-created PostgreSQL 16 container, an explicit synthetic
connection, a separately regenerated Prisma client, a fixture authentication
secret and the fake tutor. No main `.env`, production database or real provider
was used.

| Check                                                 | Result                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run db:generate`, synthetic `npm run db:deploy`  | Passed                                                                                   |
| `npm run verify`                                      | Passed: 87 test files, 1,666 tests, formatting, lint, types and build                    |
| `npm run test:e2e`                                    | 71 passed, one existing private-package skip, one failed source-status assertion; exit 1 |
| `/resources` WCAG 2.2 AA axe cases                    | All four passed: light/dark at 360px and 1280px                                          |
| Independent navigation measurement and keyboard probe | Passed in all four theme/width combinations                                              |
| `git diff --check`                                    | Passed                                                                                   |

The initial sandbox verification attempt failed because tsx could not open a
local socket; the permitted retry passed. The first browser launch lacked the
synthetic authentication secret and was canceled; the configured run above
completed. These setup attempts are not passing evidence.

In every measured combination, all four links are 44px high. The narrowest,
Help, is 48.09px wide. Column/row gaps measure 8px/4px, horizontal page overflow
is zero, and Tab order follows DOM order. At 360px, the final navigation link
wraps to a second row; at 1280px, links remain on one row. The existing focused
link outline remains 3px with 2px offset in both themes and is visible in the
screenshots. The scoped minimum target-size defect is addressed without
weakening axe tests.

## Remaining CI gate

**Major, high confidence, outside this patch:**
`tests/browser/resources.spec.ts:45` expects "Research pending content-owner
review" on the Geography resource page. The configured independent browser
run fails that assertion on both attempts; the independent DOM probe also
finds zero matching elements. The patch changes only CSS and does not reconcile
source status or this assertion. The author's reverted-patch baseline failure
is supplied evidence; this review did not repeat a baseline browser run.

Assign a separate bounded task to reconcile the rendered source status with
the current approved dossier and its browser assertion. Preserve external-link
labels, child-review warnings and all accessibility checks. Do not claim green
CI, commit/push readiness or release approval while that gate fails.

## Evidence location and next gate

The immutable patch and independent safe evidence are in common Git metadata:
`agent-handoffs/UI-RESOURCES-A11Y/`. The bundle contains
`resources-nav-target-size.patch`, `verify-retry.log`, `e2e-configured.log`,
`nav-measurements.json`, four `nav-{light,dark}-{360,1280}.png` images and
`author-runtime.json`. Resolve the root with
`git rev-parse --path-format=absolute --git-common-dir`. No auth storage state,
secret or private assessment package is copied. These local artifacts do not
travel with a clone or push. Full-page axe screenshots remain in the isolated
review worktree's `test-results/` directory.

The next gate is human acceptance of this exact reviewed navigation patch.
The remaining source-status browser failure needs its own assigned scope.
