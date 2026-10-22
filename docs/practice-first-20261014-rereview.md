# PRACTICE-FIRST revision 3 — Changed-scope UI review

## Verdict and identity

**Changes required.** Original R-1–R-4 counterexamples closed. One additional
required minor accessibility finding R-5 remains, **first-pass miss**.
Counts:0 blockers,0 majors,1 required minor. Patch unapplied.

Same successfully dispatched host-fixed `forge-reviewer` / `gpt-6.1-sol`.
Author client metadata independently verified:145/145 records
`claude-sonnet-5-5`, last `bf2a8ff7-95ec-4ae8-bdd8-840c17d219a6`,
`2026-10-14T13:26:53.899Z`, original `agent-ad050a1e73a3e3c36.jsonl`.
Cross-family independence retained.

Base HEAD `3e7c33372599d20c285656c3610ca6e47743240f`; rev3 patch
`b125f455102afe2b626b13920a1f54033a87ad71e8d6ce3b249c501ca484efac`.
All53 live/copied pins,7 frozen digests and in-memory reconstruction match.
Five files changed vs rev2; activity-panel/app test unchanged. Artifacts
under common Git metadata `agent-handoffs/PRACTICE-FIRST/`.

## Original closures and direct regressions

| ID        | Verified disposition                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-1 major | Closed: actual-handler delayed A→B submission/check/hint success/refusal discarded; same-session controls commit, completion keyed to sent session, program/generation changes invalidate bindings. B pending state independent of A completion. |
| R-2 minor | Closed: fetch/body failure caught for submit/check/hint; active-operation retry guidance, pending release and preserved inputs; late A errors absent on B. Browser evidence explicit retry.                                                      |
| R-3 minor | Closed: actual component radiogroup invalid state/description present on refusal and cleared on correction; browser REQUIRED/NOT_AN_OPTION/focus coverage.                                                                                       |
| R-4 minor | Original normal-input counterexample closed:4.534466 light/4.899778 dark computed, browser measurements/screenshots consistent. Invalid-state boundary has separate finding below.                                                               |

Successful-check refresh calls at frozen page.tsx:687–689 follow binding
check678 without intervening await. Stale-body reproduction performs no
refresh; packet's unguarded-refresh caveat overstates current code.

## R-5 — Minor; high confidence; first-pass miss — Invalid-input contrast

**Locations:** frozen `src/app/globals.css:1247–1248`; contrast tests
`tests/browser/structured-practice.spec.ts:909–954`.
**Requirement:** approved WCAG2.2AA authored control boundary contrast3:1.
[W3C SC1.4.11 guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
explains text-input boundary requirement.

Blank required number field refusal sets aria-invalid=true. Unfocused enabled
input's specific error rule overrides compliant normal border with danger
border: light #e6b4b4/#ffffff =1.817842:1, dark #6b2f2f/#1f2225 =1.577740:1.
Interior/surround match. Control editable, inactive exception inapplicable.
Viewed error screenshots corroborate faint boundary. Nearby error text does
not provide boundary contrast for editable area.

**Why previously missed:** first pass measured normal border, checked error
text/focus, omitted invalid-input boundary calculation. Correction's explicit
override and normal-only tests exposed missing state check. Same danger border
existed in rev2; not regression/newly observable or new product preference.

**Minimal correction:** preserve compliant structured invalid-input boundary,
either normal color with existing thickness/error text or sufficiently
contrasting scoped error color. No sitewide token redesign.

**Closure:** enabled/unfocused REQUIRED and format-refusal input borders>=3:1
in both themes, measured/browser-tested with fresh invalid-state screenshots;
normal contrasts, descriptions/focus/value retention and R1–R4 preserved.
Required accessibility failure prevents readiness; cannot silently accept as
optional polish. Correction within approved CSS/test scope.

## Evidence obtained and limits

Read logs: focused122,verify1,975/build,e2e100 pass/1 existing skip,fakeeval3.
Targeted rev2 sensitivity log10 failures/2 passes. Author results inspected,
not reviewer suite reruns. Existing Prisma/bcrypt Edge build warnings distinct
from zero lint warnings. Reviewer read-only hash/reconstruction, actual
transpiled-handler synthetic checks, component rendering, contrast calculations
and screenshot inspection; no broad suite/DB/provider/browser server/install/
file writes/agent launch.

Viewed eight unique rev3 images; normal-control light/dark files duplicate
wide-initial/dark captures, not extra visual evidence:

| Image under screenshots-rev3             | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| structured-normal-controls-light.png     | `1b6cb03b578b483b30eae2f9778add69793cdf806f79872f06d76424e78ee06a` |
| structured-normal-controls-dark.png      | `2e5f7da1831c00059b385164aa77ec63d41b9f5143814757362a653952236164` |
| structured-wide-error.png                | `06939d1326355656ef525ec81cf9fbdcc5d58b18b17be18debde47939f999eea` |
| structured-narrow-320-error.png          | `aa5f13471d7e94b3bd34eef8dfde5acd3528070b2a7548ad8da2a9287396bcca` |
| structured-wide-result.png               | `4d77ee92a6c989c1260129ac23d61fcfa458e8082f4d0c4fcfde0bfe1d7e48bc` |
| structured-wide-offered-topic.png        | `402c9c63cfcb9bf177b27748095d0bde725e73c4acd76c954774a199b6efc31a` |
| structured-narrow-320-initial.png        | `66c16a58a2db03c699a815372b80bcead0e86aff553ec96a1d17a1b7f3e926c9` |
| structured-mobile-390-fraction-entry.png | `bd2faf44dd2e0f17c763432783071a7a5840aeddf84837e0fcddaa00e1b2c5cd` |

Descriptor/privacy/authority conclusions unchanged. No scorer/route/content/
held-out/provider/release change. Shared synthetic household progress-display
question remains pre-existing. D41/A10/real keyboard/400%zoom/structured
review-diagnostic browser/livecontent/presentation-doc gaps still disclosed,
not completed or waived.

## Routing

Original Claude Code `forge-implementer` / Sonnet, minimal R-5 CSS/test
correction and closure evidence, preserve R-1–R-4. Then targeted changed-scope
verification; no extra broad assurance review. No application/owner/release
approval from review.
