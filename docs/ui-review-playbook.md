# UI review playbook

Durable procedure for independent, read-only review of UI increments produced
under `docs/ui-implementation-playbook.md`. This playbook is the source of
procedure; the `ui-review` skill and `ui-reviewer` profile are thin wrappers
and this file governs where they differ.

## Independence rules

- Read-only, fresh context. Do not edit files under review, fix findings,
  commit, change approval state, or claim human approval.
- No self-approval: the reviewer is never the session, agent, or model that
  implemented the change.
- Re-derive conclusions from the diff, code, tests, and the documents the
  playbook names. Do not rely on the implementer's summary or reasoning.
- Cite only evidence you actually obtained: file and line, test output from a
  command you ran, screenshots you captured. Say plainly what you could not
  run or see; never infer a pass.

## Reviewer model

Default reviewer: GPT-6.1 Sol. Check the model actually in use (not the
profile's declared model) and compare it with the implementer's actual model,
both against `docs/agent-orchestration.md`, and report both in the review.

| Situation                                                                                                                                                           | Requirement                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Copilot (multi-family available)                                                                                                                                    | Reviewer from a different model family than implementer. |
| Single-provider environment, routine work                                                                                                                           | A different actual model than the implementer.           |
| Critical safety, privacy, scoring, or authorization changes (for example quiz gating, held-out data exposure, progress/mastery display rules, source-link handling) | Mandatory cross-family review, in every environment.     |

If the requirement cannot be met, the verdict is "review not valid"; do not
downgrade silently.

## Review dimensions

1. **Requirement fidelity:** navigation, honest progress vs mastery, subject
   visuals, flash cards (optional, non-authoritative), quiz-gated NEXT, and
   source links match `docs/ui-implementation-playbook.md`.
2. **Authority boundaries:** UI never computes mastery, unlock, or pass
   decisions; C4/C5 gates and non-assessed program contracts are unchanged;
   fails closed on error.
3. **Held-out and privacy:** no premature or enumerable held-out
   disclosure: the only held-out content permitted in the DOM or network is
   the current assigned prompt, delivered by the server's authorized
   assessment flow to the correct learner. Answers, keys, and unassigned or
   future items stay withheld by policy and are never exposed by generic
   preview, plan, or navigation UI; none appear in URLs, logs, or fixtures.
   Verify no extra child data goes to providers, no trackers or embedded
   external browsing, and source links are reviewed and attributed.
4. **Accessibility (WCAG 2.2 AA):** keyboard operation, focus visibility and
   management, names/roles, headings/landmarks, live regions, contrast in
   light and dark, target size, reduced motion.
5. **States:** loading, error, empty, locked, retry each exist and are
   announced; retry is idempotent.
6. **Version and scoping safety:** learner/program/version scoping; stale
   responses handled; no cross-learner leakage.
7. **Reuse and maintainability:** existing modules reused; no new
   dependencies; layer separation preserved.
8. **Evidence quality:** each claim has a measurable test; no subjective
   "looks rich" as sole criterion; docs and `docs/PROGRESS.md` updated.

## Procedure

1. Record reviewer model, implementer model, and orchestration-doc check.
2. Inspect the diff and re-read the governing documents.
3. Run the relevant commands yourself where feasible: `npm run format:check`,
   `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
   `npm run test:e2e` (capture screenshots in light/dark and narrow/wide
   viewports where available), `npm run test:integration` if persistence
   changed.
4. Report findings with severity (blocker, major, minor), citation, and
   suggested direction. Separate verified facts from risks and unrun checks.
5. Verdict: approve-for-human-review, changes-required, or review-not-valid.
   Final approval stays human.

## Review output

Model metadata, scope, commands run with results, screenshots obtained,
findings, residual risks, verdict.
