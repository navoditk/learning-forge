# RAT-SCORE-IMPL-PATHS — Structured submission and persistence paths

## Live relay and authority

- Phase: **DONE** — exact rev2 accepted/applied; uncommitted.
- Next client/role: **Claude Code forge-implementer / Sonnet**,
  authorized successor `docs/agent-handoffs/PRACTICE-FIRST.md`.
- Owner replied **"accept and authorize"** on 2026-10-13 to explicit batch:
  exact CORE revision2 acceptance/application and this separate PATHS scope.
- Prerequisite: CORE patch `78c17d72...deb1` applied with all seven hashes
  matching reviewed frozen files; integrated verification result below.
- Main branch HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, dirty accepted
  CORE files/docs/instructions and legacy test overlaid. No commit/push.

## Owned scope

- `src/phase1/service.ts`.
- `src/progression/assessment-submission.ts` and `assessment-response.ts`.
- `src/app/api/phase1/{attempt,check,diagnostic-attempt,review-attempt}/route.ts`.
- `src/app/api/progression/assessment/submission/route.ts`.
- Scoped additions/changes under `tests/phase1/`, `tests/progression/`,
  `tests/progression-integration/`, `tests/persistence/`.

Only worker owns these paths; integrator owns shared status/packets/decisions.
Follow accepted scoring contract revision5 `dda20ea7...9898` §§3–5 and
D-155–D-163. Implement opt-in structured dispatch before any legacy matcher
call, XOR request bodies, mode/version/field checks, and S-A raw/normalized
JSON envelope persistence in existing columns. Legacy semantics/history
remain unchanged; no rescoring/backfill. Default catalog still has no
registered structured items.

Authority/lifecycle/current-item/duplicate checks precede answer/mode/field
errors; retain transactional rechecks and existing expiry processing. Eligible
format refusals are answer-independent, write nothing and do not advance
ordinal or produce mastery evidence. Preserve existing practice authority
semantics (no new ended-session policy). Structured assessment
NOT_CURRENT_ITEM behavior follows reviewed contract.

Project descriptors only from authorized practice/current-item flows; public
option identifiers remain usable, private selectors/canonical/accepted/hints
remain redacted where contract requires. Structured-only practice projection
includes complete `accessibleAlternative`; legacy presentation unchanged.
Assessment submission correctness projection remains item-level; no per-field
correctness feedback. History/audit resolve pinned item/mode envelope without
reinterpretation. Tutor path must not leak structured payload or private data;
use approved core helpers and existing provider boundaries.

## Exclusions and authorization limits

No CORE helper/schema/catalog changes outside frozen integration: report a
concrete dependency gap for integrator disposition rather than broadening.
No UI/assessment UI, content/catalog registration, Prisma/schema/migration,
private package access, learner/production data, paid-provider evaluation,
provider calls, historical rescore, other-domain migration, activation/release,
commit or push. D-61 exception none; no authoring. Held-out structured items
remain deferred under D-163; tests use synthetic in-memory banks/fixtures.

## Intake and isolated baseline

Read AGENTS, live index/packet, model/terminal-handoff and author accountability
procedures; README, relevant numbered architecture/tutor/evaluation docs;
latest PROGRESS and Resume here/Current status; local-development synthetic
setup; accepted scoring contract/current decisions; integrated CORE and
owned paths/required related tests. Verify actual successful Sonnet metadata;
unavailable/overridden role blocks substitution.

Claim one bounded worker with checked atomic mkdir before metadata/write.
Use isolated worktree and allowlisted dirty overlays; do not revert others.
Parent orchestrates without duplicate implementation. Pin extra related
public persistence/test/config dependencies in returned manifest.

- `AGENTS.md`: `4fed9d8ed068f54e881387321c515a83e0bbb374dc0c6671b6a0d786bb2f8338`
- `docs/agent-orchestration.md`: `4a994fa8ff2f29a3d64b0d891313642ce8e0eca25f023b17a0f33cc0bb84b5ce`
- `docs/local-development.md`: `76ca977e09d8eb7c9c849a15030e8167842509b0fade73e82a9318faac70c192`
- `docs/structured-response-scoring-contract.md`: `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`
- `docs/course-progression-decisions.md`: `a7834772e19e6767724e644f521c38269ab11596af6eb01a30bed262517181ee`
- `src/contracts/content.ts`: `86643964ef0ae940e727241faca0253b3228526349b885675b193b55b0259d07`
- `src/contracts/attempt.ts`: `68f9ee9f0650cb4985c1a6e1c51bca9b8749443f1002d4daa7c3e408bffdcec8`
- `src/contracts/progression.ts`: `14ec51e9df272a5a39c2bb9620e7908651f6601905231637ffae4f9e371a83c3`
- `src/content/structured-response.ts`: `780138505093fd7b1990e7d51c890894f9f6a44af316a6271fe04e7002c77d47`
- `src/content/catalog.ts`: `a45d15bdbe4d735b42196b55ee1b7978041853cd13dc7b2b94043627a08e24c6`
- `src/content/answer-matching.ts`: `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5`
- `src/phase1/service.ts`: `a250e466f19c6e251c2b96a47e550bceda0abfc3479ecc7f611fb846abdc6059`
- `src/progression/assessment-submission.ts`: `3533e7d9a5cd24b636c939cee51c43667ef5c6fbacbd1b165ba24c98db9626da`
- `src/progression/assessment-response.ts`: `be802231de2dd62c41f142590a2f848bd938d5056230715202d297f317256102`
- `prisma/schema.prisma`: `8ede94d6a35663143b08660add427855de5f12bf78583b41b1deaa1e81eb0103`
- `tests/content/legacy-parts-characterization.test.ts`: `8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d`
- `package.json`: `3a9147959a922e3905a221cc55b5614f0727bbcff978c04b357a54a1ab93a405`
- `package-lock.json`: `03e6046206884a6432dc6e10943c9f2ebb1ec69eca57fd5b421b460ebba7b95d`
- `tsconfig.json`: `8462698a578c4ce03d89e7527c09a19354f6dd5d83309a92bd71a18c13244739`
- `vitest.config.ts`: `ca50a0eb43780d733ea8c31c4f6a9b966fb8e8dce52bf768eea80d69a7a5c89b`
- `src/app/api/phase1/attempt/route.ts`: `d14fb6d27e63b226513dd24e1124a4ac24d885c58626918eec0fe77e03af52db`
- `src/app/api/phase1/check/route.ts`: `388dd663671507c5911b671cf8dfb54424ec6f361318d023357d71f5a15be786`
- `src/app/api/phase1/diagnostic-attempt/route.ts`: `8be1436f4bebd7f6ba9bd4879f37e60bc62974a42ee17b55103c1fbe2087d1ab`
- `src/app/api/phase1/review-attempt/route.ts`: `7cecf93ecc05e702a8e6bcef7a71b25e9f58d5a2ff90fde934751f29391d89f0`
- `src/app/api/progression/assessment/submission/route.ts`: `b7c40a41b1a5fd1c30ec4adb95baecb9180d55f2b8815d543c57dec634378235`

- `tests/content/structured-response.test.ts`: `fc7876e86269e22293a1716205072dc567b2314a30572dbb88c4db225b893033`
- `tests/content/structured-response-catalog.test.ts`: `4f164ed238d52275ffa6bb08778719a5091a3884130bf2b6bb9a368c1d7cbbb0`
- `tests/content/structured-response-reference.ts`: `56f018c4034fd139bbbf9e3a74803811ca8c4e23312cf576d814b4b993c3a2a2`
- `tests/contracts/structured-response-schema.test.ts`: `426d1d8a8767fe7eb1f320ae860a9b08dd145cfd7eb8077efc02f7354139b975`

Recheck pins before work; relevant mismatch requires integrator repinning.
CORE files absent/different at HEAD must be overlaid from current reviewed
baseline. Never use a whole .env or private content overlay.

## Durable integrated baseline

Twenty-nine allowlisted input copies include all seven reviewed CORE files
and unchanged legacy characterization test. Preserved at
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-SCORE-IMPL-PATHS/baseline/`,
original relative paths; manifest `manifest.json` SHA-256:
`9d39edf6f1fa257b35358e30d672fa1c088c945b7c2357d1534d07dd27b9cfa6`.
Verify copies/live pins before worktree overlay. All new accepted tests must
be present so isolated verify retains CORE/legacy coverage. No private data,
secrets or environment files included; bundle local, not committed/pushed.

## Required synthetic evidence

Focused path/route/persistence tests; `npm run verify`;
`npm run test:integration` using only documented disposable local synthetic
PostgreSQL; `npm run eval:run` with fake provider. Local test migrations may
apply already-reviewed migrations to disposable synthetic DB only; no new
migration, production URL or credentials. Pin disposable container/database
ownership, isolated ports and environment; serialize shared build/database
jobs and tear down only owned artifacts. No concurrent suites on shared state.

PA-1–PA-4h, PA-8/PA-9, PA-11/PA-12 and legacy regressions: all five submission
routes/body errors, authority precedence/expiry/duplicate/future ordinal,
transaction races/rechecks/zero-write refusals, raw/normalized persistence,
mode/history attribution, export/erasure coverage, response projections and
answer-leakage/fake tutor checks. Preserve 23 legacy UNMET expectations as
characterization, not new-mode acceptance. Mark private-store and UI evidence
outside this scope honestly; do not claim live serving or release.

Author self-audit requirement/evidence and positive/negative/exact-boundary
checks before freeze. Return allowlisted patch, frozen files/digests/base/input
manifest, synthetic logs/disposable-resource cleanup and actual Sonnet
model/record/time evidence under resolved common Git metadata
`agent-handoffs/RAT-SCORE-IMPL-PATHS/`. Worker does not apply in main or edit
shared status. Integrator verifies reconstruction/scope and sets
**AWAITING_REVIEW**; release claims, **SWITCH TO Codex forge-reviewer**.
Review and separate owner acceptance/application still required. UI/content/
activation/release remain later gates.

## Recovery prompt

Continue authorized RAT-SCORE-IMPL-PATHS as Claude Code forge-implementer /
Sonnet. Verify relay/model/baseline, claim isolated scope, implement accepted
contract, run synthetic gates/self-audit and freeze for Codex review. Native
"continue" is sufficient; do not ask again for this approved scope.

## Integrated prerequisite validation — 2026-10-13

Exact reviewed CORE revision2 applied; all seven file hashes match before and
after validation. Initial sandboxed verify: 1,932 passed/9 existing subprocess
failures (drift classifier/curriculum site); build not reached. Required
outside-sandbox rerun `npm run verify` **exit 0**, including formatting, lint,
TypeScript, down-migration presence, 1,941 tests and build. No test suppression
or unrelated edits; this was environment retry, not a code correction.
Existing Prisma Edge module-trace warning retained. CORE ready for PATHS.

## Revision 1 returned (2026-10-13)

Worker: Claude Code `forge-implementer`; integrator-verified transcript
metadata `agent-a71172deb959ad6a4.jsonl`, 120/120 assistant records
`claude-sonnet-5-5`, last `2ed991ec-a147-44b4-8914-26984b1c664f`
`2026-10-14T03:37:35.706Z`. Artifacts under common Git metadata
`agent-handoffs/RAT-SCORE-IMPL-PATHS/` (`baseline/` untouched):

- `RAT-SCORE-IMPL-PATHS.rev1.patch`, SHA-256
  `6ed7d1b93ed27147964ccdb0d30aa59226fc4dd91ca6c97774fec5cbf6c0cdd7`;
  14 files, all in owned scope: seven owned `src` files modified, seven new
  test/support files under `tests/{phase1,progression,progression-integration,persistence}/`.
- `frozen/` plus `frozen-sha256.txt` (full hashes), `input-manifest.txt`,
  `numstat.txt`, `self-audit.txt`, `logs/` (verify, integration, eval),
  `cleanup-proof.txt`, `claim-meta.txt`.

Author evidence: `npm run verify` exit 0 in sandbox, 92 files/1,955 tests
(1,941 + 14) and build (existing Prisma Edge warning); `npm run
test:integration` exit 0, 35 files, 314 passed/1 existing skip, serial on
owned disposable `lf-paths-pg` (127.0.0.1:55433, synthetic) since removed;
`npm run eval:run` 3/3 fake provider; five mutation checks failed as
expected then restored. Self-audit claims PA-1–PA-4h, PA-5, PA-7, PA-8,
PA-9, PA-11, PA-12 and legacy regressions; not claimed: PA-10 (Playwright/
axe), assessment UI, private store, live serving, release. Default catalog
registers no structured item. No CORE/schema/catalog/matcher change; no
dependency gap reported.

Integrator verification: patch hash; `git apply --numstat` scope; `git apply
--check` on main OK; reapplied on HEAD + 29-file baseline overlay in a
throwaway worktree, reproducing all 14 frozen hashes; 289 non-database
focused tests (new dispatch unit, CORE three, legacy 83) passed and `tsc
--noEmit` clean there; 29/29 live pins still match; claim, worker worktree,
throwaway worktree and `lf-paths-pg` absent; `learning-forge-db-1` and
`lf-review-pg` untouched. Integration suite not repeated (author log retained).

Reviewer attention (author-disclosed deviations D1–D5 plus integrator note):

- D1: assessment read-only preflight runs only when an evaluation refusal is
  pending; scored submissions rely on the shared transactional recheck. PA-12
  race exercised via wrapped client.
- D2: practice remains non-transactional; refusal thrown before any write.
- D3: structured `NOT_CURRENT_ITEM` uses first unsubmitted selected item, as
  `getCurrentAssessmentItem` does; check placed after duplicate.
- D4: malformed-JSON `request.json()` behavior unchanged (legacy parity).
- D5: worker's `prisma generate` regenerated the client in main's shared
  `node_modules` from the unchanged schema (environment side effect, no
  source change).
- Integration log shows existing best-effort "Progression shadow persistence
  failed" stderr in pre-existing `assessment-assignment` and in new
  structured persistence/route tests; tests pass. Confirm it is expected.

## Codex first review — 2026-10-13

Fresh host-selected `/root/rat_score_paths_review`, fixed `gpt-6.1-sol`:
**not ready**, 0 blockers/majors, 2 minors. Report
`docs/rat-score-impl-paths-20261013-review.md`. Comprehensive owned scope
checked, actual Sonnet metadata and all baseline/dependency/frozen hashes/
reconstruction verified. No incorrect score/unauthorized write/disclosure
verified; existing future-scope limitations remain.

- R-1: shared read-only assessment state preflight must precede evaluation
  for every request; expired enters existing transactional expiry path without
  tiers3–4 evaluation. Prove evaluator non-invocation for invalid lifecycle,
  duplicate/future item/expired requests; preserve transactional race/rechecks,
  zero-write eligible refusals and success controls. Update D1/self-audit.
- R-2: twelve-key boundary currently has ten due to i%10 overwrite. Generate
  unique 64-char keys, assert counts/lengths, 12 accepted/13 rejected and
  retained key/value boundary controls.

Original Sonnet `agent-a71172deb959ad6a4` corrects only coupled source/tests,
returns compact per-finding root-cause/positive/negative/regression closure
and required synthetic gates. Keep rev1 artifacts; new rev2 files/patch/
manifest hashes and actual successful-turn metadata. No policy decision or
scope expansion needed; then Codex changed review. Unapplied, no commit/push.
Shadow warnings expected for archive-only fixtures; practice injects current
catalog and nonvacuously proves successful evidence writes. Standalone
mutation outputs absent; not another required gate.

## Revision 2 returned (2026-10-13)

Original Sonnet worker resumed; integrator-verified transcript
`agent-a71172deb959ad6a4.jsonl`: 145/145 assistant records
`claude-sonnet-5-5`, last `d9698e62-91e5-4f6e-981f-3aeaacb712d5`
`2026-10-14T03:51:22.760Z`. Rev1 artifacts retained unchanged.

- `RAT-SCORE-IMPL-PATHS.rev2.patch`, SHA-256
  `b100815f61aadc06395221f994f3abc2052efa33fe3a751baeded0c55f3e577e`; full
  patch against integrated baseline, 15 files.
- Changed vs rev1: `src/progression/assessment-submission.ts`
  `c61524c4b0add771aa218996238c3d3155efe567e8ef81151747d0639f6ad844`;
  `tests/phase1/structured-practice-paths.test.ts`
  `d9c466a6dcfa294b76d6f8eaaa10d964ba946f5ef991c78eb52cb01fcd7e909c`; new
  `tests/progression-integration/structured-assessment-order.test.ts`
  `2b7d4e21b76bd02e883e4c9395321fbf993471402a23d26b3ba8d89c1b966461`.
  Other 12 files byte-identical to rev1.
- Also `frozen-rev2/`, `frozen-sha256.rev2.txt`, `input-manifest.rev2.txt`,
  `self-audit.rev2.txt`, `closure-evidence.rev2.txt` (closure table),
  `logs-rev2/`, `cleanup-proof.rev2.txt`, `claim-meta.rev2.txt`.

Closure claims: R-1 — shared `checkSubmissionState` preflight now always runs
after pinned-item resolution and before any item-dependent evaluation;
expired runs enter the existing transactional expiry path unevaluated;
transaction rechecks retained (lazy evaluation only if expired at preflight
but open at recheck). New order test spies on the evaluator: 4/5 fail against
rev1 code (`logs-rev2/r1-order-test-against-rev1-code.txt`), 5/5 pass on
rev2; zero evaluations for ended/terminal/duplicate/future-item/expired with
well-formed and malformed bodies. R-2 — `keyed()` builds unique 62-char
prefix + two-digit keys; asserts 12 unique 64-char keys; 12 accepted/13
rejected; 64/65-char key and 200/201-char value controls retained.

Author evidence: focused serial 51/51; `npm run verify` exit 0 (1,955
tests/build, sandbox); `npm run test:integration` exit 0, 36 files, 319
passed/1 existing skip on owned disposable `lf-paths-pg` (removed); fake
eval 3/3. No `prisma generate` this time (D5 not repeated). Acknowledged,
not changed: PA-12 wrapped-client test is not truly simultaneous; assessment
number-rendering sentinel variant not separately demonstrated (review
coverage notes, not findings).

Integrator verification: patch hash; numstat scope (15 owned files); `git
apply --check` on main OK; reapplied on HEAD + baseline in throwaway
worktree reproducing all 15 `frozen-sha256.rev2.txt` hashes; `tsc --noEmit`
clean; 353 non-database tests (dispatch unit + `tests/content/`) passed;
log timestamps post-resume; 29/29 live pins match; claim, worktrees and
`lf-paths-pg` absent; other sessions' containers untouched. Integration
suite not repeated (author log retained).

## Revision 2 Codex review — 2026-10-13

Same host-selected `/root/rat_score_paths_review`, fixed `gpt-6.1-sol`:
**ready with noted risks**, R-1/R-2 closed. Report
`docs/rat-score-impl-paths-20261013-rereview.md`. One new nonblocking minor
R-3: order-test mockClear discards ended/terminal counts, so executable spy
proof narrower than claimed; static source proves required ordering.
No runtime correctness/safety finding or extra assurance prerequisite.
Identity/hashes/reconstruction/substantive inputs verified; updated delivery
instructions intentional, no lane scope inferred. Author1955/319+skip/eval3,
order5 tests and prior integrator353/tsc evidence retained, not repeated.

## Ready owner batch — distinct integration and successor gates

1. Accept exact fifteen-file PATHS rev2 patch `b100815f...577e`, explicitly
   accept R-3's nonblocking evidence limitation, authorize application with
   integrated verification and documented disposable synthetic integration/
   fake eval. Preserve frozen bytes; no optional test rewrite in application.
2. Authorize **PRACTICE-FIRST**, first bounded learner UI slice, per staged
   delivery priority and accepted scoring contract §8 UI. Grade 6 Math in
   existing course/topic/ActivityPanel flow; no enrichment/Spelling expansion
   in this packet. Claude Code `forge-implementer` / Sonnet then independent
   Codex `forge-reviewer` / `gpt-6.1-sol` under UI playbooks.

PRACTICE-FIRST owned paths: `src/app/page.tsx`,
`src/app/components/activity-panel.tsx`, new
`src/app/components/structured-response-fields.tsx`, `src/app/learner-data.ts`,
`src/app/globals.css`, scoped `tests/app/` and `tests/browser/` additions/
changes. Exact existing reviewed practice/catalog versions stay unchanged;
synthetic structured items used only for test authorization/response fixtures,
never registered as live content. No new skill/unit/item identity or volume.

UI slice: consume authorized server responseSpec and complete text alternatives,
labeled number/single-choice fields, server format/refusal errors and retry,
legacy input parity, item-level result feedback, loading/error/empty states,
keyboard/focus/mobile fraction entry, retained subject figures and topic links.
Existing server progress/completion/mastery labels remain distinct; ordinary
practice must not claim completed teaching/unit assessment or mastery by visit.
It never computes scores/unlocks, reveals answer selectors, enables assessment
UI, bypasses existing feature/C4/C5 gates, or serves new/unreviewed records.

Evidence: `npm run verify`, documented synthetic `npm run test:e2e`, fake
`npm run eval:run`, UI state/viewport/keyboard/accessibility matrix, PA-10 and
A-1–A-11; D-41 screen-reader remains separate release gate. No dependency,
server/schema/content/catalog changes, private/learner/production access,
paid provider, deployment/release/commit/push. Legacy23 UNMET not repaired;
IC-9 disposition still needed before a broadened live-practice release.
PATHS must integrate first; scoped UI input manifest then frozen patch/UI
review and separate owner acceptance/application. This approval is only the
first practice UI increment, not complete rich practice/Ratios curriculum.

Unready content-lane/unit selection/volumes/authoring exceptions remain pending;
do not delay ready PATHS acceptance or invent a second-lane scope. Owner may
approve both ready gates, a subset or overrides together.

## Owner disposition and integrated validation — 2026-10-13

Owner replied **"accept and authorize"** to distinct ready gates: exact
PATHS rev2 acceptance/application including nonblocking R-3 spy evidence
limitation, and first PRACTICE-FIRST UI slice. Claimed Codex integrator
verified patch/frozen15/27 substantive baseline pins and HEAD, preserved two
planned instruction updates, apply-check passed and applied only
`b100815f61aadc06395221f994f3abc2052efa33fe3a751baeded0c55f3e577e`.
All fifteen main files match frozen hashes before/after validation.

Integrated `npm run verify` exit0: 1,955 tests/build, formatting/lint/TypeScript/
down gate. Disposable synthetic PostgreSQL `lf-paths-integrated-20261013`,
loopback port55434, trust-auth learning_forge, tmpfs data: applied already
reviewed migrations/public content archive only; `npm run test:integration`
exit0,36 files/319 passed/1 existing skip. Expected error-path/shadow stderr
retained, no test suppression. Fake `npm run eval:run`3/3. Owned container
removed; existing `learning-forge-db-1`/`lf-review-pg` untouched.

PATHS DONE/uncommitted. R-3 remains documented accepted evidence limit,
static order proof plus narrower executable spy assertions; no runtime defect
waived. UI successor authorized Sonnet worker then Codex UI review; no worker
active or second content lane. No assessment UI/new content/activation/release,
production/private/provider work, commit or push. Earlier waiting/unapplied
entries historical and cleared.
