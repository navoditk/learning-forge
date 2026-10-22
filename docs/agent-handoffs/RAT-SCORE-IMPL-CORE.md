# RAT-SCORE-IMPL-CORE — Deterministic structured scoring core

## Live relay and approved authority

- Phase: **DONE** — reviewed revision2 accepted/applied; uncommitted.
- Next client/role: **Claude Code forge-implementer / Sonnet**,
  authorized successor `docs/agent-handoffs/RAT-SCORE-IMPL-PATHS.md`.
- Owner replied **"yes"** on 2026-10-13 to explicit two-gate batch:
  exact legacy-test acceptance/application and this CORE execution scope.
  These dispositions are separate; no future artifact acceptance inferred.
- Legacy test applied at reviewed hash `8568e925...573d`; 83/83 focused tests
  passed in main. Accepted contract revision 5 `dda20ea7...9898`, D-155–D-163
  select all OD choices. Legacy semantics still fail 23 V-7 expectations.
- Base: main HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, accepted
  dirty documentation/instruction overlays and new legacy test. Preserve all
  unrelated work. Integrator owns shared status/packets/decision register.

## Exact owned implementation scope

- `src/contracts/content.ts`: opt-in structured validator/response mode shape
  per accepted contract; retain legacy alternatives unchanged.
- New `src/content/structured-response.ts`: pure deterministic mode-1 grammar,
  parsing/classification/scoring, refusal codes, safe public responseSpec and
  canonical/envelope helpers as contract §§2–5 specify.
- `src/content/catalog.ts`: `validateContentCatalog` load-time rules only;
  do not change imports, rawContent or register content.
- New `tests/content/structured-response*.test.ts`, `tests/contracts/`
  additions: contract matrix/generators, valid fixture/load rules, bounds,
  selectors/projections, history-envelope helper and purity/import checks.

Implement contract §§2/5 with approved choices; no unresolved product
policies silently selected. V-7 matrix and kind-specific adversarial generator,
PA-5/PA-6/PA-7 and directly coupled CORE checks required. Original and mutated
selector fixtures rederive canonical/accepted private answers, pass load and
project identical public descriptors. Preserve complete-fixture/negative
controls; new mode acceptance must not be confused with legacy characterization.

No edits to `src/content/answer-matching.ts`, legacy test, any content records,
existing catalog imports or historical attempts. No route/service/storage-path,
UI, Prisma/schema/migration, database/private-package/learner/provider access,
other-domain migration or release. PATHS/UI scope remains separate. No commit
or push. D-61 exception: none (no content drafting).

## Intake, model and isolation

Read AGENTS, live index/this packet, terminal-handoff/model/accountability
procedures; README, relevant numbered architecture/testing docs, latest
PROGRESS and Resume here/Current status. Then accepted scoring contract,
current decision values, legacy evidence and scoped code/tests. Existing
skill playbooks are procedures, not new scope authorization.

Verify actual Sonnet from successful client metadata; unsupported/overridden
role blocks work. Claim one bounded worker role with checked atomic mkdir,
write claim metadata only after success. Use isolated worktree and allowlisted
baseline overlays. You are not alone; never revert other changes. Parent
orchestrates without duplicating implementation. Pin any additional relevant
public code/test/config inputs consumed; use no private/full-directory overlay.

- `AGENTS.md`: `4fed9d8ed068f54e881387321c515a83e0bbb374dc0c6671b6a0d786bb2f8338`
- `docs/agent-orchestration.md`: `4a994fa8ff2f29a3d64b0d891313642ce8e0eca25f023b17a0f33cc0bb84b5ce`
- `docs/structured-response-scoring-contract.md`: `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`
- `docs/course-progression-decisions.md`: `a7834772e19e6767724e644f521c38269ab11596af6eb01a30bed262517181ee`
- `docs/grade-6-math-reconciliation.md`: `c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec`
- `src/contracts/content.ts`: `5a047b27abc0ccbbc1f5c8506a4dcedd0d3d5e509a44704fcc9cca1ad8f07321`
- `src/content/catalog.ts`: `c560d0e1da3e34d1b939566cae597f1b149bc7375dd78ff1c0ca6351ce0ab59f`
- `src/content/answer-matching.ts`: `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5`
- `tests/content/legacy-parts-characterization.test.ts`: `8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d`
- `tests/content/answer-matching.test.ts`: `4b6799887992bac25de79a71aca5c99f66f64b0c5c064a932d76a9ccdf1c3ae0`
- `tests/content/catalog.test.ts`: `fa0f00f1b6e22c7063429b2e5217d819ef9547db68d91d9a52234b6bc3a90277`
- `tests/content/publication.test.ts`: `685193934c2842e0062ffeb326c932e6ae09e42576495669f7bda18efad86303`
- `package.json`: `3a9147959a922e3905a221cc55b5614f0727bbcff978c04b357a54a1ab93a405`
- `package-lock.json`: `03e6046206884a6432dc6e10943c9f2ebb1ec69eca57fd5b421b460ebba7b95d`
- `tsconfig.json`: `8462698a578c4ce03d89e7527c09a19354f6dd5d83309a92bd71a18c13244739`
- `vitest.config.ts`: `ca50a0eb43780d733ea8c31c4f6a9b966fb8e8dce52bf768eea80d69a7a5c89b`

Recheck live hashes before work; relevant mismatch returns to integrator
for repinning. Legacy file/accepted docs are absent or differ at HEAD and
must be overlaid from baseline in the isolated worktree.

## Durable local baseline

Sixteen allowlisted input copies preserved under
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-SCORE-IMPL-CORE/baseline/`,
original relative paths. `manifest.json` SHA-256:
`4ad22799459af2c5157b11e3e9e23c30b32aeab8aa7cbb42703402cc1e5ccfa7`.
Verify copied bytes/manifest against live pins before overlay. Local artifacts
are not committed or remotely transferred; no secrets/private content included.

## Required evidence and verification

Focused new content/contract tests and unchanged legacy characterization,
then database-free `npm run verify`. No database/migration/E2E/provider suite
required for this pure unserved core. If a concrete dependency/contract gap
prevents bounded implementation, report with evidence instead of broadening
scope or quietly selecting new policy.

Author performs comprehensive requirements-to-evidence self-audit before
freeze: accepted positive/equivalent controls, all adversarial cases, exact
bounds, unsatisfiable-record rejection, projections and legacy invariants.
Report executed counts/results separately from untested future path/UI
requirements. Stop on known contradictory acceptance cases.

Return allowlisted patch, frozen files, hashes/base/input manifest, validation
logs, requirement coverage and successful actual Sonnet metadata evidence.
Preserve under resolved common Git metadata `agent-handoffs/RAT-SCORE-IMPL-CORE/`.
No main application or shared status writes by worker. Integrator verifies
scope/reconstruction/evidence and sets **AWAITING_REVIEW**; release claims,
**SWITCH TO Codex forge-reviewer / gpt-6.1-sol**. Critical scoring requires
cross-family review. Owner acceptance/application follows frozen review;
PATHS/UI/content/release gates remain separate.

## Recovery prompt

Continue RAT-SCORE-IMPL-CORE as Claude Code forge-implementer / Sonnet. Verify
relay/model/baseline, claim isolated owned core scope, implement accepted
contract and tests, self-audit/verify, freeze patch/evidence for Codex review.
Native "continue" is sufficient; no additional task approval needed.

## Implementation returned (2026-10-13)

Author: Claude Code `forge-implementer`. Integrator read client metadata
`subagents/agent-a701108cfc81bb655.{meta.json,jsonl}`: agent type
`forge-implementer`; first assistant record
`b429a25d-9f7b-4e48-8d78-0389b7ed5d63`, `2026-10-14T00:46:27.544Z` UTC; every
assistant record `claude-sonnet-5-5`. Parent integrator: `claude-opus-5-5`
(orchestration and verification only). All 16 pins matched before dispatch.
Claim acquired by a checked `mkdir`, then released; worktree and
`node_modules` symlink removed; main unchanged.

Frozen under `<git-common-dir>/agent-handoffs/RAT-SCORE-IMPL-CORE/`
(`baseline/` untouched): `RAT-SCORE-IMPL-CORE.patch`, SHA-256
`98fbabe1577659cb3fdd6f940dc1fafe836313459abab506169a45c5c712bc20`;
`frozen/` copies listed in `frozen-sha256.txt`; `input-manifest.txt`;
`logs/{focused-new,legacy-characterization,verify}.log`; `self-audit.txt`;
`claim-meta.txt`.

| Path                                                 | +/−     | SHA-256 (frozen)  |
| ---------------------------------------------------- | ------- | ----------------- |
| `src/contracts/content.ts`                           | +153/−1 | `86643964...9d07` |
| `src/content/catalog.ts`                             | +13     | `a45d15bd...24c6` |
| `src/content/structured-response.ts` (new)           | +732    | `78013850...7d47` |
| `tests/content/structured-response.test.ts` (new)    | +1026   | `8f4f3769...3ea8` |
| `tests/content/structured-response-catalog.test.ts`  | +618    | `4f164ed2...bbb0` |
| `tests/content/structured-response-reference.ts`     | +630    | `56f018c4...a2a2` |
| `tests/contracts/structured-response-schema.test.ts` | +207    | `426d1d8a...b975` |

Author results: 192 new focused tests passed; legacy characterization 83/83,
byte-unchanged; `npm run verify` exit 0 (91 files / 1,941 tests; build ok,
pre-existing Prisma Edge warning). The generator produced 461 adversarial
vectors across 12 families, with 0 disagreements against an independent
reference classifier. Mutation spot-check: 7 of 10 killed, and the 3
survivors are equivalent or no-op. No contract contradiction was found.

Untested, owned by separate scopes: PATHS tiers 0/2/5, `NOT_CURRENT_ITEM`,
routes/persistence/end-to-end projections, PA-1–PA-4h/PA-8/PA-9/PA-11/PA-12,
and service dispatch. PATHS must dispatch before any legacy
`matchesAcceptedAnswer` call. UI: PA-10, A-1–A-11, D-41. Private-bank §2.8
behaviour is unverifiable in-repo; D-58 has a source-text check only.

Judgement calls for review:

- BigInt calls (ES2017 target).
- Zod shape rules in `content.ts` (discriminated union with renamed
  `LegacyDeterministicValidatorSchema`), with semantic §2.7 rules in
  `validateStructuredValidatorRules`, called from the shared catalog body. A
  caller that bypasses the catalog must call it.
- Lengths measured in UTF-16 code units.
- Choice values: trim, then exact id match.
- Pure `evaluateStructuredSubmission` covering tiers 1/3/4.
- `UNKNOWN_FIELD` echoes the submitted key only.
- Test support module `structured-response-reference.ts`.
- Extra exports for history helpers.

Integrator verified: patch hash and the owned-path-only file list;
`git apply --check` on main; reapplied the patch in a throwaway worktree with
the baseline overlay, and all seven files match the frozen hashes. Re-ran the
focused new, legacy, catalog and answer-matching tests: 6 files / 314 tests
passed. `tsc --noEmit` clean. The scorer's only import is type-only, with no
clock, randomness, env, I/O or async. Secrets scan clean; cleanup confirmed.
The full verify was not repeated.

## Codex initial review — 2026-10-13

Fresh host-selected `/root/rat_score_core_review`, fixed actual `gpt-6.1-sol`:
**not ready until one minor test-evidence correction**, 0 blockers/majors,
1 minor. Report `docs/rat-score-impl-core-20261013-review.md`. All baseline/
substantive/frozen hashes and reconstruction verified; actual Sonnet identity
independently filtered. Complete assigned scope checked, no major/core defect.

R-1: frozen `structured-response.test.ts:637–648` uses canonical `x` for the
six-choice 669-character envelope control, contradicting its derived rendering.
Supply derived canonical/accepted strings and assert schema/catalog load
success plus scoring success before raw/normalized 669-character assertions.
Preserve previous bounds/reference/selector coverage and implementation.
Return compact requirement/closure table, focused regression results and
required verify evidence; frozen revision-2 files/patch/manifest with distinct
hashes, original artifacts retained. No new policy/model or scope needed.

Corrections return to original Sonnet worker
`agent-a701108cfc81bb655`, actual `claude-sonnet-5-5`; verify successful-turn
metadata. Then Codex bounded changed-scope review. No parent duplication,
PATHS/UI/schema/content/private/database/provider or release work. Existing
23 legacy UNMET remain. Patch unapplied, no commit/push.

## Revision 2 returned (2026-10-13)

Original worker resumed (same transcript
`subagents/agent-a701108cfc81bb655.jsonl`; every assistant record
`claude-sonnet-5-5`, last record `f37faed9-b012-41e1-a4ec-2c4e09e1c06a`,
`2026-10-14T01:10:15.125Z` UTC, verified by integrator from client metadata).
Pins, baseline manifest, review report `75b7dc7f...88ae` and packet
`b3170054...37d8` were rechecked. Claim acquired by a checked `mkdir`, then
released; worktree and symlink removed; main unchanged. Rev1 artifacts retained.

- `RAT-SCORE-IMPL-CORE.rev2.patch` (full 7 files against HEAD, +3416/−1), SHA-256 `78c17d72c970b273c0f786d6a19918fdb69c191319faef81869b04e40028deb1`.
- `frozen-rev2/tests/content/structured-response.test.ts`, SHA-256 `fc7876e86269e22293a1716205072dc567b2314a30572dbb88c4db225b893033`; the other six frozen files are byte-identical to rev1 (`frozen-sha256.rev2.txt`).
- `closure-evidence.rev2.txt`, SHA-256 `2340024bfea2db622c3363130f72341d4842538afa20974bd3868f8a5c0c17e4`.
- `input-manifest.rev2.txt`, SHA-256 `940034d951166f6bf74e7d5dad17f3652aafe9837c02d91c5a329a33a0d71257`; `logs-rev2/`.

Closure: R-1 **Closed**. The root cause was a placeholder canonical `'x'`;
the test only called the scorer, which never reads the canonical, so load
validity was never asserted. A new `expectLoadValid` helper checks five
things: schema parse; §2.7 rules returning `[]`; derived-canonical equality;
`acceptedAnswers` equal to `[canonicalAnswer]`; and a real
`validateContentCatalog` load. The six-choice control now uses the explicit
derived canonical and asserts CORRECT before the 669-character raw and
normalized checks. The old `'x'` fixture is kept as a negative control.
`expectLoadValid` is also applied to the 28-character control, SF1, the
selector and sentinel variants. Author results: focused 192/192, legacy
83/83, `npm run verify` exit 0 (1,941 tests). Implementation unchanged.

Integrator verified: patch hashes; six of the seven frozen files are
byte-identical to rev1, with only the named test changed; `git apply --check`
on main; reapplied rev2 in a throwaway worktree with the baseline overlay,
reproducing the frozen test hash. Re-ran the structured and legacy tests
(4 files / 275 passed) and `tsc --noEmit` (clean). Cleanup confirmed. The
author's message misquoted a shortened `content.ts` hash from memory; the
frozen file and listing are correct.

## Revision 2 Codex review — 2026-10-13

Same host-selected `/root/rat_score_core_review`, fixed `gpt-6.1-sol`:
**ready for human review**, R-1 closed, 0 blockers/majors/minors. Report
`docs/rat-score-impl-core-20261013-rereview.md`. Actual original Sonnet
metadata, substantive/frozen hashes and seven-file reconstruction verified;
six files unchanged. Corrected 669 control loads/scores and both envelopes
meet bound; old x negative and direct controls preserved. No classified new
finding. Author192/legacy83/verify1941 and integrator275/tsc evidence retained;
reviewer static closure only. Main patch remains unapplied.

## Ready approval batch (distinct gates)

1. Accept exact CORE revision2 seven-file patch `78c17d72...deb1` and authorize
   application after baseline/hash/apply checks, integrated focused tests and
   TypeScript/required verification. No optional fixture changes.
2. Authorize **RAT-SCORE-IMPL-PATHS** per accepted contract §8, after accepted
   CORE integration. Claude Code `forge-implementer` / Sonnet then Codex
   cross-family review. Owned: `src/phase1/service.ts`,
   `src/progression/assessment-submission.ts`,
   `src/progression/assessment-response.ts`; routes
   `src/app/api/phase1/{attempt,check,diagnostic-attempt,review-attempt}/route.ts`
   and `src/app/api/progression/assessment/submission/route.ts`; scoped tests
   under `tests/phase1/`, `tests/progression/`,
   `tests/progression-integration/`, `tests/persistence/`.

PATHS implements approved structured dispatch, XOR request bodies, authority/
lifecycle/current-item/duplicate preflight and transactional rechecks before
writes, answer-independent format refusals, S-A existing-column persistence,
allowed authorized projections and history handling. Legacy path semantics
remain unchanged; private-store requirements can be validated only with
synthetic permitted fixtures, never private bank access.

Required synthetic validation: `npm run verify`, documented disposable local
`npm run test:integration`, `npm run eval:run` fake; PA-1–PA-4h, PA-8/PA-9,
PA-11/PA-12 and regression coverage. No UI/assessment UI, content/catalog
registration, schema/migration, private/production data, paid providers,
rescore, activation/release/commit/push. CORE fixes outside frozen integration
return to review; PATHS worker freezes/self-audits and returns for Codex review,
then separate owner acceptance/application. Integrator pins/assigns PATHS
only after this explicit execution approval. Both gates can be approved as
one batch, separately or with overrides.

## Owner disposition and integration — 2026-10-13

Owner replied **"accept and authorize"** to both explicit ready gates:
exact CORE revision2 acceptance/application and separate PATHS execution.
Codex integrator verified HEAD/baseline/patch/seven files, apply-check passed,
applied only patch `78c17d72...deb1`; all seven main hashes match frozen
listing before/after integrated verification. Initial sandboxed verify had
nine existing subprocess-test failures; outside-sandbox required rerun passed
**npm run verify exit 0**, 1,941 tests/build, format/lint/TypeScript/down gate.
No behavior correction or test suppression; existing Edge warning only.

CORE **DONE**, uncommitted. Successor PATHS **IMPLEMENTING**, authorized
Sonnet scoped worker then Codex review. No worker active; baseline pinned.
Earlier waiting/unapplied entries historical; acceptance does not authorize
UI/content/schema/release or future unreviewed main patch application.
No database/private/provider work, commit or push in this integration.
