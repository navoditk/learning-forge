# PRACTICE-FIRST revision 2 — Independent UI review

## Verdict and frozen identity

**Changes required.** First comprehensive independent review: 0 blockers,
1 major and 3 minors requiring correction. Patch unapplied; no human choice,
application, serving or release approved by this recommendation.

Reviewer: host-enforced Codex `forge-reviewer`, fixed `gpt-6.1-sol`, successful
parent dispatch without overrides; repo config supports host evidence.
Author client transcript independently verified: `agent-ad050a1e73a3e3c36.jsonl`,
117/117 assistant records `claude-sonnet-5-5`, last UUID
`f5528c8e-c380-4157-b960-92c4289e9706`, `2026-10-14T04:33:01.878Z`.
Cross-family independence satisfied.

Base `3e7c33372599d20c285656c3610ca6e47743240f`; patch
`6d058bb920a0843371555e2fe349af158da29f62d3fda52bdc5cf3c08216e88c`.
Baseline manifest
`e9492c05271cf28d44aebe1363acb5d3da553be5a1e858ff75b06d3bed0d479e`.
All 53 copied/live pins and seven frozen hashes match; in-memory patch
reconstruction reproduces exact files. Rev2 adds45 browser-test lines only;
implementation unchanged from rev1. Artifacts under common Git metadata
`agent-handoffs/PRACTICE-FIRST/`; locations below refer to frozen-rev2 files.

## Consolidated required findings

### R-1 — Major; high confidence — Stale responses cross activity boundaries

**Locations:** `src/app/page.tsx:531–543`, 570–590, 621–637.
**Requirements:** UI playbook stale-response discard; completion scoped to
actual server evidence for that activity.

Submission/check guards run before awaited response body parsing, then commit
without a fresh guard. Hint responses lack session guard. Read-only in-memory
harness executing actual transpiled handlers deferred JSON parsing, switched
activity A→B, then resolved A: submission attached attempt-A to B; independent
check attached A's result and set B.completed=true; hint attached A's tutor
message/incremented B hint count. Refusal parsing has same await gap.
No server authorization bypass demonstrated, but activity/tutoring/completion
state becomes incorrect.

**Minimal correction:** bind each operation to session/program/request generation;
verify binding after every awaited body operation immediately before commit.
Guard functional check session update against sent session. Apply same
boundary to hints/refusal/error paths.

**Closure:** delay successful/refused bodies and hint responses while switching
activities; B keeps its own attempt/check/tutor/completion state. Same-session
positive controls remain functional. No client-side score/mastery/unlock added.

### R-2 — Minor; high confidence — Independent-check transport failure invisible

**Location:** `src/app/page.tsx:615–645`. **Requirement:** visible announced
recoverable errors per packet behavior3/UI states.

Check fetch has try/finally, no catch. Actual handler under synthetic rejected
fetch produced unhandled rejection, cleared pending, no visible error. Values
survive; learner receives no explanation. Inherited gap affects newly added
structured check path.

**Minimal correction:** catch transport/body failure; announce answer-independent
retry guidance only for still-active operation. Preserve entries, invent no
result/completion; check coupled submit/hint body-error paths.

**Closure:** rejected fetch yields visible announced error; explicit successful
retry works without lost inputs/false completion. Late errors cannot attach to B.

### R-3 — Minor; high confidence — Choice invalid state absent

**Location:** `src/app/components/structured-response-fields.tsx:170–188`.
**Requirement:** contract A-5 every invalid field exposes aria-invalid=true.

Number fields comply; choice refusal links error description but fieldset/
radios lack invalid state. Server-rendered actual component with choice refusal
has zero aria-invalid attributes. Passing browser description/focus assertions
miss this requirement.

**Minimal correction:** expose invalid state on native choice field/group,
retain error association. **Closure:** REQUIRED/NOT_AN_OPTION refusal exposes
state, correction clears it, keyboard/focus behavior preserved.

### R-4 — Minor; high confidence — New input borders below 3:1 contrast

**Locations:** `src/app/globals.css:1108`; inherited input style216–228,
theme tokens6/39. **Requirement:** graphical-control non-text contrast3:1.

Structured inputs inherit borders against same surface inside/outside:
light #e4e0d6/#ffffff =1.318:1; dark #33373b/#1f2225 =1.332:1.
Obtained light/dark screenshots corroborate faint blank-control boundaries.
Pre-existing token issue remains a defect in new controls; clean axe does not
establish this requirement.

**Minimal correction:** scoped structured-input boundary color >=3:1 against
adjacent surfaces in both themes; preserve focus/refusal styles, no sitewide
redesign. **Closure:** measured ratios and updated normal-control light/dark
visual evidence.

These are first-review findings, not follow-up classifications. Corrections
retain IDs; new genuine findings classified unresolved/regression/first-pass
miss/newly observable under accountability procedure.

## Comprehensive coverage and obtained evidence

Checked descriptor parser/privacy/unsupported mode, field-key/order,
representations/input modes, units/labels/native radios, format errors/focus,
value preservation, structured/legacy requests and endpoint selection,
independent check, hint summarization, pending/activity resets/navigation,
progress/mastery and server/feature authority. No scorer/provider/persistence/
registration/held-out UI/dependency/tracker/embedding change. Descriptor rejects
answer-bearing extras; locally mapped format guidance and item-level feedback
do not reveal per-field correctness. Values ephemeral; C4/C5 unchanged.

Read frozen logs: verify1,975/build; focused122; e2e90 pass/1 existing skip;
fakeeval3 (rev1 retained, same implementation). These are author-run results,
not reviewer suite repeats. Reviewer obtained hashes/reconstruction, actual
handler in-memory reproductions, component server rendering and contrast
calculations. No file writes, database/provider/browser server/install/agent.

Viewed all eight rev2 PNGs through view_image plus both legacy comparisons:

| Image under screenshots-rev2             | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| structured-wide-initial.png              | `b0e48d474fa1b1d16cab53f24185db08e6a4a85341c75e6e9628cb05de889cd7` |
| structured-wide-dark.png                 | `a14a2b3b11cd958b12848595f09f300cb0a6965c299dbc00cb64f842e9616935` |
| structured-wide-error.png                | `f6c9e77f1ae1308d94a0fb17ff8fc5b62dbe0b6cb259cc42abc82229c756a423` |
| structured-wide-result.png               | `e7f219938f878b5e26524db9f1d0a995100aeb1dd07e7bc56a711798b5d8f7c2` |
| structured-wide-offered-topic.png        | `9813bb66a53b180a10e5a2d84f1f18e0739311e01d621238aae54b50a59777b5` |
| structured-narrow-320-initial.png        | `8027ca8b4154191fb477af9ca4351b0992eeff42366215d0dddb917710f1669a` |
| structured-narrow-320-error.png          | `9f2fe32d02f9288b641039a98e2fbfc4770cddbad3d2fbdedc1453e2aaad99de` |
| structured-mobile-390-fraction-entry.png | `a35afad20a788777ceafceb0d2021df30f8a8781437ea17db2d0c138c37962cc` |

Images demonstrate reflow/labels/units/error summaries/preserved entries, not
screen-reader behavior or real virtual-keyboard entry.

## Pre-review hold dispositions and limits

F1 blocked-topic concern closed as introduced-unlock issue: both viewed
legacy comparisons byte-identical. Existing code displays server-issued
session independently of advisory plan state; parity/offered-topic tests
support distinction. Pre-existing product question separate.

F2 table word breaks pre-existing/unchanged in comparison images; no new
structured clipping observed. F3 skipped intake addressed by returned audit,
not automatically runtime defect. UI procedure5 presentation-conventions
update is outside worker scope: **nonblocking integrator/owner documentation
follow-up** for learner-presentation-design, not silent scope widening.

Unverified: D-41 manual screen reader, A-10 human reading-level review,
PA-10 real-device virtual keyboard, explicit400% browser zoom, structured
browser diagnostic/review endpoints, live structured content and its complete
alternative quality. Touch emulation/page.keyboard.type do not prove virtual
keyboard. No live structured records registered; serving/release gates remain.

## Routing

**SWITCH TO: Claude Code forge-implementer / Sonnet**, original worker,
R-1–R-4 consolidated correction/closure evidence/refreeze, then Codex bounded
changed review. No broader successor/assurance round or owner/release approval.
