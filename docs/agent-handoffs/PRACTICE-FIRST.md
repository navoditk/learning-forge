# PRACTICE-FIRST — First structured learner-practice UI slice

## Live relay and authority

- Phase: **DONE** — exact rev4 accepted/applied and integrated gates pass;
  conventions documented; uncommitted.
- Next client/role: **Claude Code `forge-expert` / Opus**, successor
  [RAT-CATALOG-DESIGN](RAT-CATALOG-DESIGN.md). IC-6–IC-8 approved as
  D-164–D-166; IC-9 pending. No second lane/content/release approved.
- Owner replied **"accept and authorize"** on 2026-10-13 to exact PATHS rev2
  acceptance/application with nonblocking R-3 evidence limit and this separate
  bounded PRACTICE-FIRST UI scope. Record these as distinct dispositions.
- Scope is first UI increment in existing Grade 6 Math learner app, not full
  rich practice/Ratios curriculum or deployment. Integrated backend contract
  available; no live structured content record registered.
- Base main HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, accepted dirty
  CORE/PATHS/tests/docs/instructions. Integrator owns shared packets/status.

## Owned UI implementation paths

- `src/app/page.tsx`.
- `src/app/components/activity-panel.tsx`.
- New `src/app/components/structured-response-fields.tsx`.
- `src/app/learner-data.ts`.
- `src/app/globals.css`.
- Scoped additions/changes under `tests/app/` and `tests/browser/`.

Implement accepted scoring contract §8 UI, §3.4 A-1–A-11 and PA-10. Use
ui-implementation skill/playbook and learner presentation design, preserving
existing course/topic/breadcrumb/ActivityPanel flow and server-authorized data.
Existing reviewed practice/item/version/catalog bytes unchanged; synthetic
structured items appear only in tests/authorized response fixtures, never
registered or served as new live curriculum. No enrichment/Spelling expansion,
new skill/unit identity or content volume. Existing other-program behavior
and non-assessed contracts remain unchanged.

## Required observable behavior

1. Parse and consume server responseSpec through learner Session boundary
   without answer-bearing fields. Render accessible labeled numeric text or
   single-choice controls with public option IDs; preserve authored field
   order/description/unit/representation constraints and server complete text
   alternatives. Do not derive hidden correct values or grade on client.
2. Store inputs by field key in ephemeral UI state; submit structured mode/
   version/fields to authorized practice, review/diagnostic and independent
   check routes when Session declares structured mode. Legacy items retain
   existing string body/form and semantics. Never infer mode from answer text.
3. Show answer-independent format/refusal errors and retry without invented
   attempts/advance/mastery; keep item-level correctness feedback only.
   Loading/submitting/error/empty/success states visible, no duplicate pending
   submission, keyboard/focus/error announcements preserved.
4. Render subject figures and complete text alternatives without leaking
   answers; fraction/mixed forms have text-capable entry/mobile tested.
   Maintain readable narrow/wide layouts, visible focus and WCAG2.2AA evidence.
5. Reuse actual topic navigation and reviewed ordinary-practice flow. Existing
   server completion versus mastery remain distinctly labeled; visited/practice
   never implies completed teaching/full unit assessment. No new unsourced
   coverage totals, optimistic progress or client unlock. If server lacks a
   required datum, show honest state or report scoped gap; do not change API.

## Exclusions and dependencies

No server/routes/provider/scorer/persistence/schema/catalog/content changes,
assessment learner UI, held-out/private bank access, real learner/production
access, new dependencies, external embedding/analytics, policy/threshold
changes or historical rescoring. Existing flags/C4/C5 gates remain intact.
UI must not enable unauthorized progression NEXT, assessments or serving.
Existing legacy23 UNMET not repaired; IC-9 and other human release/privacy/
content/D-41 gates remain before broadened live release. No deployment,
activation, commit or push. Default-off/no-new-content integration does not
constitute a working complete structured curriculum.

## Intake, model and isolation

Read AGENTS/live index/packet, current orchestration lane/accountability/
batched rules, README and relevant numbered UI/tutor/evaluation docs;
latest PROGRESS/Resume here/Current status; ui-implementation and ui-review
playbooks, learner presentation design, course-progression handoff and
accepted scoring/current decisions; inspect owned frontend and integrated
server projection evidence. Actual Sonnet model verified by successful client
metadata; unavailable role blocks substitution. One assigned worker only.

Checked atomic bounded worker claim before metadata/write; isolated worktree
with allowlisted accepted baseline. You are not alone; preserve unrelated
edits, no blanket staging or resets. Parent orchestrates without duplicate UI
work. Additional consumed public tests/config inputs pinned in manifest.

- `AGENTS.md`: `16b06ff36565751ad5cc1f2b421204d8e7cfaa5441ad91d78f055e95f544c0d8`
- `docs/agent-orchestration.md`: `074e26820d7deb9315471744fb4a61ea6d30c6e5e40efcfa4451688991f13157`
- `docs/structured-response-scoring-contract.md`: `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`
- `docs/course-progression-decisions.md`: `a7834772e19e6767724e644f521c38269ab11596af6eb01a30bed262517181ee`
- `docs/ui-implementation-playbook.md`: `05732e85dabd8f0f5eea6d3f9ae7582bf306e91e44401dbf85f1256eb7e937b9`
- `docs/ui-review-playbook.md`: `a8b884769f9daade4fcd4fae89bf4cbbeb0fd99108c1ba3558a3307cad5ec906`
- `docs/learner-presentation-design.md`: `80acb998fdcbfc7d6c2d4567f96e11ab79ad7aa1b9655fb026a03107770da224`
- `docs/local-development.md`: `76ca977e09d8eb7c9c849a15030e8167842509b0fade73e82a9318faac70c192`
- `src/app/page.tsx`: `b16e111c410f89ac79dbd4ae088421803f4c1e4d05dedd5cc2cc209069676346`
- `src/app/learner-data.ts`: `0d2a323cf126cdf3bc281d2bf81d973091d97a0a145d13da5e05c52c68260379`
- `src/app/globals.css`: `91449f65fb2fbdb97c7eb19c7f81e33c4ad77f9c6aba054bd03b25098953271b`
- `src/app/components/activity-panel.tsx`: `7ba867d1d237fe3eb581f24f225ac8855d6745dbe40cec4449e9bd3c654e7aab`
- `src/app/course-route.ts`: `97ec195c3ae0461c46290111b2179fe18ad8c71a744e28f2d719aebbbe23e6b5`
- `src/app/learner-chapters.ts`: `d4b400e16593d641453d82fb5a3c4581039298ade5c2ef0b08e01df165ffe3ca`
- `src/app/components/course-overview.tsx`: `070cb03cbc4ca891d13b2258fe4d3eea2cb6acc2a4682562cd24049f879c46d1`
- `src/app/components/topic-detail.tsx`: `e99cf81e7559e29c9456345973cb14334958d828b7e816b9168f3636d46a20a8`
- `src/app/components/chapter-view.tsx`: `21ef1515fa0dfb588b8e1f6186c026aa2b2fb1035b91cec772ee058d5be3faba`
- `src/curriculum/program-roster.ts`: `fa65cd8150935d2a556a03cbfffee3ca35b010933f33a93479cb2856c7cb2245`
- `src/curriculum/program-registry.ts`: `98eb5f47f5938387364f11566a8f2e48bf693dcf34d580b135698349b2908ed3`
- `package.json`: `3a9147959a922e3905a221cc55b5614f0727bbcff978c04b357a54a1ab93a405`
- `package-lock.json`: `03e6046206884a6432dc6e10943c9f2ebb1ec69eca57fd5b421b460ebba7b95d`
- `tsconfig.json`: `8462698a578c4ce03d89e7527c09a19354f6dd5d83309a92bd71a18c13244739`
- `vitest.config.ts`: `ca50a0eb43780d733ea8c31c4f6a9b966fb8e8dce52bf768eea80d69a7a5c89b`
- `playwright.config.ts`: `d8f05d7e2378f58dc08ecb12b2a7e106f80974abd08450f7e7bd1125119d6672`
- `playwright/global-setup.ts`: `9863027a2e26246ea9113d2e58c7666b9c6150bf6b31e64c713fadacd4d4fd9d`
- `playwright/global-teardown.ts`: `14dffb6529d3cd4aeac0290472353f6cdc3ccc0bef1accc6e022ca7e6b100195`
- `tests/app/learner-data.test.ts`: `bb87c40186e55f35846a79a3bc7f53322ce448258e49af4a6bb6da4cf1786f5c`
- `tests/browser/course-overview.spec.ts`: `091b354e39c88a3930d27b084bd1ded9c81279121e95f073f14566da0248e94d`
- `tests/browser/accessibility.spec.ts`: `73058e149f952ffc70f8fb4eecfd66031643465ddc38720a9292e9f3a4b86a84`
- `tests/browser/keyboard-navigation.spec.ts`: `295d4cbd2be7dafe14b8e80da709e2984c2cfcf52c2ffbe37d508dae739a4a84`
- `src/content/catalog.ts`: `a45d15bdbe4d735b42196b55ee1b7978041853cd13dc7b2b94043627a08e24c6`
- `src/content/structured-response.ts`: `780138505093fd7b1990e7d51c890894f9f6a44af316a6271fe04e7002c77d47`
- `src/contracts/content.ts`: `86643964ef0ae940e727241faca0253b3228526349b885675b193b55b0259d07`
- `tests/content/structured-response-catalog.test.ts`: `4f164ed238d52275ffa6bb08778719a5091a3884130bf2b6bb9a368c1d7cbbb0`
- `tests/content/structured-response-reference.ts`: `56f018c4034fd139bbbf9e3a74803811ca8c4e23312cf576d814b4b993c3a2a2`
- `tests/content/structured-response.test.ts`: `fc7876e86269e22293a1716205072dc567b2314a30572dbb88c4db225b893033`
- `tests/contracts/structured-response-schema.test.ts`: `426d1d8a8767fe7eb1f320ae860a9b08dd145cfd7eb8077efc02f7354139b975`
- `src/progression/assessment-submission.ts`: `c61524c4b0add771aa218996238c3d3155efe567e8ef81151747d0639f6ad844`
- `src/phase1/service.ts`: `5b12763578879fc3d0dd35fbcbf89ce4e689c89d906187d7920917516009b0af`
- `src/app/api/phase1/review-attempt/route.ts`: `bd1d088d7c849159266be62bcee4721e52b5961fe926384fd718c1848f19cea8`
- `src/app/api/phase1/diagnostic-attempt/route.ts`: `5fa3fece617a1d1a3b2046fcd370909dd205e76099254ff88c6ee6f3f73a1762`
- `src/app/api/phase1/attempt/route.ts`: `4a9ce228298fac9c6fa141779a50a6ed186d3d0271357d12c62e6c31168df89a`
- `src/app/api/phase1/check/route.ts`: `b4788407119d7f02d6e4f655511cd388ff9ffc51ccae324ae7edfe9d76bce86d`
- `src/app/api/progression/assessment/submission/route.ts`: `6a8215adff84fbced6e0659c8ca4feb23e1bd6a853fc1ca5bea4e78658dfd751`
- `tests/persistence/structured-attempt-persistence.test.ts`: `96f3e3f66d46a4a6c8c175ecd5929337a560612c55c42d9f5dd76371a2ebdf84`
- `tests/phase1/structured-paths-support.ts`: `60a47b2a127f4fa8817a9bdd528e2ec23e9d408e01d066e4b2137bdd7f6fc814`
- `tests/phase1/structured-practice-paths.test.ts`: `d9c466a6dcfa294b76d6f8eaaa10d964ba946f5ef991c78eb52cb01fcd7e909c`
- `tests/progression-integration/structured-assessment-paths.test.ts`: `4520e33e553fdb3b1ba76579c72bf8e05574f26bef7c5782cc9a275579e310e4`
- `tests/progression-integration/structured-assessment-support.ts`: `826a6f441d1a20899aa46e60d66fd50f7cc150901b0eb0f9b7d80801840494a3`
- `tests/progression-integration/structured-routes.test.ts`: `2060ee2c659dcffc693d167eb3752ac4d8723bf05edfa639e1b298b040b112ca`
- `tests/progression/structured-submission-dispatch.test.ts`: `db4c3d79bd1edbd355fbbd6667906c672c66f4dcc60e0cce1cd77d66b43ffecf`
- `tests/progression-integration/structured-assessment-order.test.ts`: `2b7d4e21b76bd02e883e4c9395321fbf993471402a23d26b3ba8d89c1b966461`
- `tests/content/legacy-parts-characterization.test.ts`: `8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d`

Verify live pins before dispatch; mismatch returns to integrator for repin.
Integrated CORE/PATHS and all their tests must be overlaid, not assumed present
at HEAD. No .env, secrets/private package or whole-directory copies.

## Durable integrated baseline

Fifty-three allowlisted inputs, including all accepted CORE/PATHS code and
tests plus unchanged legacy characterization, preserved under
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/PRACTICE-FIRST/baseline/`,
original relative paths. `manifest.json` SHA-256:
`e9492c05271cf28d44aebe1363acb5d3da553be5a1e858ff75b06d3bed0d479e`.
Verify copied bytes/live pins before overlay. No environment files, secrets,
private bank or full directory copied. Local artifacts not committed/pushed.

## Measurable evidence and freeze

Focused frontend tests, `npm run verify`, documented synthetic
`npm run test:e2e` and fake `npm run eval:run`. Existing browser tests use
reviewed legacy records; structured interaction uses explicit synthetic
mock/session fixtures isolated to tests and cannot activate live content.
Use owned disposable local DB/test account setup only as documented; no
shared concurrent build/browser/DB suites, clean only owned resources.

Provide UI state matrix and real browser screenshots/visual checks for
wide/narrow screens, labeled controls and equivalent text, keyboard order/
focus, slash/space entry (`3/4`, `1 1/2`), format-error retry, pending double
submission prevention, server correctness/no partial feedback, legacy parity
and navigation. Automated axe/playwright evidence does not claim the separate
D-41 manual screen-reader release approval. Track unmet/out-of-scope claims
honestly rather than inventing accessibility acceptance.

Author self-audit requirement/evidence/exact boundary/negative tests and
freeze allowlisted patch/files/digests/input manifest/logs/screenshots and
actual model/record/time metadata under common Git metadata
`agent-handoffs/PRACTICE-FIRST/`. Worker does not edit shared progress/packets
or apply in main. Integrator verifies scopes/reconstruction/evidence, marks
**AWAITING_REVIEW**, releases claims and SWITCH TO Codex forge-reviewer.
Independent UI review then separate owner acceptance/application; no future
artifact acceptance inferred from execution approval. Route concrete design/
authority dependency gaps for disposition, do not broaden silently.

## Recovery prompt

Continue PRACTICE-FIRST as Claude Code forge-implementer / Sonnet. Read live
relay/packet, verify model/pinned integrated baseline, claim isolated owned
UI scope, implement/test/self-audit and freeze for Codex UI review. Native
"continue" is sufficient; no repeat scope approval needed.

## Integrated prerequisite evidence — 2026-10-13

PATHS exact15-file rev2 applied and hashes match. Integrated verify1,955/build,
integration319 pass/1 existing skip on owned disposable loopback PostgreSQL,
fake eval3/3 pass. Temporary container removed, other databases untouched.
Owner explicitly accepted nonblocking PATHS R-3 spy-evidence limitation.
No default catalog structured records added; UI uses synthetic test sessions
only for structured-mode demonstrations. Existing current practice unchanged.

## Integrator hold before review — 2026-10-13

Rev1 author evidence: verify 1,975 tests/build; focused `tests/app` 122;
e2e 88 pass/1 existing skip on owned disposable `lf-practice-first-pg`
(removed); fake eval 3/3; seven screenshots. Author disclosed not reading
`docs/learner-presentation-design.md`, `docs/ui-review-playbook.md`,
D-155–D-163, PROGRESS or the course-progression handoff required by intake.
Integrator also observed the structured question rendered under a topic
panel reading "Not offered yet … blocked" (behavior 5, no client unlock) and
narrow-table mid-word breaks. Per author accountability, the original worker
was resumed to audit against those documents and observations: either an
addendum-only self-audit (no code change) or a closure-tabled rev2. Codex
review follows only after that returns and is verified.

## Revision 2 returned (2026-10-13)

Original Sonnet worker resumed for the intake/self-audit hold. Integrator-
verified transcript `agent-ad050a1e73a3e3c36.jsonl`: 117/117 assistant
records `claude-sonnet-5-5`, last `f5528c8e-c380-4157-b960-92c4289e9706`
`2026-10-14T04:33:01.878Z`. Rev1 artifacts retained.

- `PRACTICE-FIRST.rev2.patch`, SHA-256
  `6d058bb920a0843371555e2fe349af158da29f62d3fda52bdc5cf3c08216e88c`; full
  patch against baseline, same 7 owned files. Only
  `tests/browser/structured-practice.spec.ts` changed vs rev1 (now
  `a9b2aeb099660d93ee4e98628c34db56f876a36079ab87928a8858af6c8116ff`, +2
  tests); six other hashes identical to rev1, including all five `src` files.
- Also `frozen-rev2/`, `frozen-sha256.rev2.txt`, `input-manifest.rev2.txt`
  (adds unpinned live reads: course-progression handoff `aa8c395f...71b8`,
  PROGRESS `b8ffbe6e...d6e6`), `self-audit.rev2.txt`,
  `closure-evidence.rev2.txt`, `logs-rev2/`, `screenshots-rev2/` (8 PNGs),
  `addendum-evidence/`, `cleanup-proof.rev2.txt`, `claim-meta.rev2.released`.

Closure: F1 blocked-topic notice — pre-existing behavior: server-issued
default landing session displays under an advisory-blocked topic panel for
legacy and structured alike; baseline and rev1 legacy 320px screenshots are
byte-identical. New parity test (state-independent) and offered-topic test
(`Ratio language`, no blocked notice). No client unlock. F2 narrow table
mid-word breaks — pre-existing baseline `overflow-wrap: anywhere`, file not
owned; not fixed. F3 intake — presentation design, UI review playbook,
D-155–D-163, handoff and PROGRESS audited; all conform per self-audit.

Author evidence: focused `tests/app` 122; `npm run verify` exit 0 (1,975
tests/build, pre-existing Prisma edge warning); `npm run test:e2e` 90 pass/1
existing skip on fresh owned `lf-practice-first-pg` (removed), port 3000
checked free; eval not rerun (source unchanged; rev1 3/3 applies).

Integrator verification: patch hash; numstat scope; `git apply --check` on
main OK; reapplied on HEAD + 53-file baseline reproducing all seven rev2
hashes; `tsc --noEmit` clean; `tests/app` 122 passed; legacy comparison PNGs
byte-identical; 53/53 pins match; claim, worktrees, container absent; port
3000 free; other sessions' containers untouched. E2E not repeated.

Open items for review/owner disposition (not authorized here):

- Gap: UI playbook expects `docs/learner-presentation-design.md` to record
  new structured-field conventions (fieldset/legend, error summary, id
  prefixes, refusal copy); outside worker scope. Needs owner/integrator
  scoping as a documentation follow-up.
- Product question: pre-existing display of a server-issued session under an
  advisory-blocked topic panel (unchanged by this patch).
- Pre-existing narrow-table word breaks (`topic-detail.tsx`, not owned).
- Unmet/out of scope: D-41 manual screen-reader pass, A-10 reading-level
  review of refusal copy, real-device virtual keyboard entry, browser-level
  structured tests on diagnostic/review endpoints, live structured content,
  assessment UI. Structured browser tests mock session/attempt routes only.
- Author-noted deviations: pending/stale-result guards and network-error
  message also apply to the legacy path; client-side `REQUIRED` for empty
  fields (no request); 500ms axe wait after dark-mode switch; tests
  force-click `aria-disabled` buttons.

## Codex first UI review — 2026-10-14

Fresh host-enforced `/root/practice_first_ui_review`, fixed gpt-6.1-sol:
changes required,0 blockers/1 major/3 minors. Report
`docs/practice-first-20261014-review.md`. Actual Sonnet117/117 metadata,
53 baseline/live pins,7 frozen hashes/reconstruction verified; screenshots
actually viewed, logs inspected and in-memory actual-handler/component
counterexamples/contrast calculations obtained. No suite/database/provider
rerun. Comprehensive first pass consolidated all verified findings.

- R-1 major: late JSON/hint/refusal results cross activity boundaries and can
  mark another session complete. Bind session/program/generation; recheck
  after each await/before every commit, guard functional session updates.
  Test delayed bodies/hints/errors during A→B switch plus same-session controls.
- R-2 minor: independent-check fetch/body rejection has no catch/visible error.
  Active-operation answer-independent announced retry, preserve values/state,
  explicit success retry and coupled submit/hint body failure checks.
- R-3 minor: invalid radio/group missing aria-invalid. Assert REQUIRED and
  NOT_AN_OPTION state/error linkage, clearing after correction/keyboard focus.
- R-4 minor: new input border contrast1.318 light/1.332 dark <3. Scoped input
  colors >=3:1, measured and refreshed light/dark screenshot proof, retain focus.

Original Sonnet `agent-ad050a1e73a3e3c36` corrects owned page/component/CSS/
tests only, preserves earlier behavior and returns per-finding root cause/
positive/negative/boundary/regression closure table. Freeze rev3 with distinct
hashes/files/logs/screenshots/input manifest and actual model evidence; keep
rev1/rev2 artifacts intact. No caller/provider/scorer/content/schema changes.

F1/F2 pre-existing product/table issues remain outside corrections; F3 intake
audited. Nonblocking learner-presentation-design conventions follow-up needs
integrator/owner scope, not worker edit. D41/copy/real-device/zoom/diagnostic-
review browser/live content evidence gaps remain explicit later requirements;
no release waiver. No extra unrelated broad assurance review or worker fleet.
Patch unapplied; then Codex diff/counterexample/closure/direct regression
review, classify genuinely new findings. No application/commit/push.

## Revision 3 returned (2026-10-14)

Original Sonnet worker resumed for review findings R-1–R-4
(`docs/practice-first-20261014-review.md`). Integrator-verified transcript
`agent-ad050a1e73a3e3c36.jsonl`: 145/145 assistant records
`claude-sonnet-5-5`, last `bf2a8ff7-95ec-4ae8-bdd8-840c17d219a6`
`2026-10-14T13:26:53.899Z`. Rev1/rev2 artifacts retained.

- `PRACTICE-FIRST.rev3.patch`, SHA-256
  `b125f455102afe2b626b13920a1f54033a87ad71e8d6ce3b249c501ca484efac`; full
  patch against baseline, same 7 owned files.
- Changed vs rev2: `src/app/page.tsx`
  `2b4232c88b3cb47a749b394d4dbd1a76fe7b71d7829174c981392319f39322e3`;
  `src/app/learner-data.ts`
  `e04e2ff26949acdc6ea081844802b31bc32a98cae27e0a758e69144d543cd047`;
  `src/app/components/structured-response-fields.tsx`
  `5e455739fae1d062a682c920bd196c49ba72854d169285ca8d813cc624e3ed57`;
  `src/app/globals.css`
  `6ba55be3ef4bb96f227d4d07ff06e786e8a9d5858963d5a6b5792a0c9e4bdca6`;
  `tests/browser/structured-practice.spec.ts`
  `dee00cc7b4fd7fdd68ef1205658269ee1581e69f08c10eb884bbda6a9a8ec23e`.
  `activity-panel.tsx` and `tests/app/structured-response-ui.test.ts`
  identical to rev2.
- Also `frozen-rev3/`, `frozen-sha256.rev3.txt`, `input-manifest.rev3.txt`,
  `self-audit.rev3.txt`, `closure-evidence.rev3.txt`, `logs-rev3/`
  (including `before-rev2-code.log`), `screenshots-rev3/`,
  `cleanup-proof.rev3.txt`, `claim-meta.rev3.released`.

Closure claims: R-1 `bindOperation` captures session/program/activity
generation, re-verified after fetch, every body parse, catch and before each
commit; completion keyed to sent session; hints bound; pending state
per-activity. R-2 try/catch on submit/hint/check with announced
answer-independent retry message only while active; no invented result. R-3
choice `<fieldset role="radiogroup">` with `aria-invalid`/`aria-describedby`
on refusal, cleared on selection. R-4 scoped `--color-control-border` on
`.structured-fields`: light `#7a766b` 4.53:1, dark `#8a8f94` 4.90:1 measured
in browser (test asserts ≥3:1). Targeted tests: 10/12 fail on rev2 code,
28/28 structured spec pass on rev3.

Author evidence: focused `tests/app` 122; `npm run verify` exit 0 (1,975
tests, 0 lint warnings, build); `npm run test:e2e` 100 pass/1 existing skip
on owned disposable `lf-practice-first-pg` (removed), port 3000 checked;
`npm run eval:run` 3/3.

Integrator verification: patch hash; numstat scope; `git apply --check` on
main OK; reapplied on HEAD + 53-file baseline reproducing all seven rev3
hashes; `tsc --noEmit` clean; `tests/app` 122 passed; 53/53 pins; claim,
worktrees, container absent; port 3000 free; other containers untouched.
E2E not repeated. Viewed light normal-controls screenshot: input boundaries
visible.

Reviewer attention:

- Author caveat: unchecked native radio outline uses browser default; not
  separately measured or styled (R-4 scope boundary).
- Plan/progress lists still refresh after A's successful check even if the
  learner moved to B (program-scoped server evidence); only session-level
  state guarded. Confirm acceptable under R-1.
- Two pre-existing tests now query `radiogroup` instead of `group`.
- `structured-normal-controls-{light,dark}.png` are byte-identical to
  `structured-wide-{initial,dark}.png` (same capture saved twice).
- Integrator observation, not a patch change: e2e household state shows
  topic "Mastery: Independently confirmed" beside sidebar "Not ready yet" and
  course-progress "not started" for Unit rates; produced by shared synthetic
  e2e household evidence through unchanged progress components.
- Unchanged unmet/out of scope: D-41 manual screen reader, A-10 reading
  level, real-device virtual keyboard, 400% zoom beyond 320px reflow,
  diagnostic/review structured browser tests, presentation-design doc update
  (nonblocking integrator/owner follow-up).

## Revision 3 Codex review and missed-check accountability — 2026-10-14

Same host-fixed `forge-reviewer` / gpt-6.1-sol: changes required,0 blockers/
majors,1 required minor. Report `docs/practice-first-20261014-rereview.md`.
R1–R4 original counterexamples closed; actual-handler/component checks,
normal contrast measurements and obtained screenshots support closures.
Identity145/145/in-memory reconstruction/pins/frozen bytes verified.

R-5 **first-pass miss**: first reviewer omitted invalid-state boundary contrast
while measuring normal and checking error text/focus. Rev2 already had
low-contrast danger token, so not regression/newly observable. Cause/check
recorded openly, no extra product choice: blank REQUIRED or format refusal
unfocused enabled input border1.817842light/1.577740dark <3.

Original Sonnet corrects only scoped structured invalid-border CSS and
related browser checks/evidence. Preserve normal>=3, error linkage/focus/
values and allR1–R4 fixes. Closure table includes measured REQUIRED and format-
refusal states both themes, fresh invalid-control screenshots, relevant
positive/negative regression results and required UI validation. No sitewide
palette redesign, dependency/server/content/policy changes. Freeze rev4
with distinct digests/files/logs/screenshots and actual metadata; retain
rev1–rev3. Then Codex R5diff/closure/direct-state review only, no broad re-audit.

Packet's program-refresh caveat corrected by reviewer: refresh happens after
current binding check without await; stale response does not refresh. Native
radio caveat/pre-existing progress question and D41/copy/keyboard/zoom/
endpoint/livecontent/presentation-doc limits remain separate, no waiver.
Patch unapplied, no commit/push.

## Revision 4 returned (2026-10-14)

Original Sonnet worker resumed for R-5 (`docs/practice-first-20261014-rereview.md`).
Integrator-verified transcript `agent-ad050a1e73a3e3c36.jsonl`: 168/168
assistant records `claude-sonnet-5-5`, last
`2d59762c-0d93-408d-9eb5-f926afcab5d0` `2026-10-15T01:08:24.037Z`.
Rev1–rev3 artifacts retained.

- `PRACTICE-FIRST.rev4.patch`, SHA-256
  `d184a9a5a079e43a02caa5c2da4aea5f603a8ff6e597e022b419da12f53a87ed`; full
  patch against baseline, same 7 owned files.
- Changed vs rev3: `src/app/globals.css`
  `a8a84414b17dfb039df47828a269c0a9a4f906a389516c8538235854ded0e219` (one
  scoped rule: `.structured-fields input[type='text'][aria-invalid='true']`
  border `--color-danger-border` → `--color-danger-text`, plus comment);
  `tests/browser/structured-practice.spec.ts`
  `655d5b4f7195b1e402d3b83d2e9c02882fb79fe4367a7f8f175d0373d220f956`
  (shared `measureBorders`; two new light/dark invalid-state tests). Other
  five files identical to rev3.
- Also `frozen-rev4/`, `frozen-sha256.rev4.txt`, `input-manifest.rev4.txt`,
  `self-audit.rev4.txt`, `closure-evidence.rev4.txt`, `logs-rev4/`
  (`before-rev3-css.log`, `other-state-measure.log`), `screenshots-rev4/`,
  `cleanup-proof.rev4.txt`, `claim-meta.rev4.released`.

Closure: new tests fail on rev3 CSS with 1.8178:1 light / 1.5777:1 dark
(matches review) and pass on rev4. Measured (browser, against fill and
surround): normal 4.53/4.90; invalid REQUIRED and format refusal 9.14/9.30;
focus outline 5.16/7.59; unchecked radio ring (browser default) 4.23/15.98;
checked radio 5.81/7.94. Focus/radio figures are uncommitted ad-hoc
measurements (log retained); no hover style on structured inputs.

Author evidence: `tests/app` 122; `npm run verify` exit 0 (1,975 tests,
0 lint warnings, build); `npm run test:e2e` 102 pass/1 existing skip on owned
disposable DB (removed); `npm run eval:run` 3/3.

Integrator verification: patch hash; scope; `git apply --check` on main OK;
reapplied on HEAD + baseline reproducing all seven rev4 hashes; `tsc
--noEmit` clean; `tests/app` 122; before-log failures confirmed; 53/53 pins;
claim/worktrees/container absent; port 3000 free; other containers untouched.
Viewed `structured-invalid-required-dark.png`: invalid border visible.

Reviewer attention: Submit button appears faded in full-page dark
screenshots; author attributes it to a capture hover-transition and reports
steady-state computed opacity 1 — confirm. `structured-invalid-format-light`
and the normal-control pair duplicate other captures (disclosed). Unmet
items unchanged from rev3.

## Revision 4 Codex review — 2026-10-14

Same host-fixed reviewer/gpt-6.1-sol: ready for human review,0 findings;
R5closed andR1–R4preserved. Report
`docs/practice-first-20261014-rev4-review.md`. Author168/168metadata,
53pins/7hashes/reconstruction verified. Invalid9.144608/9.296243 and normal
4.534466/4.899778 confirmed with viewed screenshots/author browser evidence.
Author122/1975build/e2e102+skip/fake3 logs inspected; no suite rerun.
Faded-button capture cause not independently confirmed, no demonstrated
regression or extra gate. No additional unchanged-byte assurance review.

## Ready owner batch — exact application and documentation scope

1. Accept exact seven-file rev4 patch `d184a9a5...87ed` and authorize main
   application after baseline/hash/apply checks, integrated verify/focused
   browser evidence using documented synthetic setup. No optional edits.
2. Authorize narrow as-built update to `docs/learner-presentation-design.md`
   for UI playbook procedure5 conventions gap: server-declared mode only,
   fieldset/legend and field-key-derived unique IDs, grouped radio invalid
   state, answer-independent error summary/focus links and mapped refusal
   copy, numeric representation input modes/text alternatives, pending and
   session/program/generation stale-response guards, measured normal/invalid
   light/dark input boundaries. Trace to reviewed rev4 code/report, label
   unverified manual/copy/real-device evidence honestly. No new design or
   approval of copy reading level. Integrator can record this simple
   documentation checkpoint without creating another research/review worker;
   targeted Prettier/diff checks required.

Record both dispositions separately. Documentation authorization does not
change frozen UI bytes, scoring/authority/content/provider behavior, add a
new release gate or waive existing gates. No new content/private bank,
assessment UI, activation/deployment/release/commit/push. Remaining Ratios
choices, legacy23 UNMET disposition and manual release evidence stay pending.
Owner may accept both ready recommendations, a subset or overrides together.

## Owner disposition and integrated completion — 2026-10-14

Owner replied **"accept and authorize"** to exact reviewed rev4 application
and separate one-file as-built conventions update. Claimed Codex integrator
verified HEAD/patch/53baseline pins/7frozen hashes, apply-check passed,
applied only `d184a9a5...87ed`; all seven UI hashes still match after checks.
Updated `docs/learner-presentation-design.md` to describe implemented public
fields/fieldset/legend/IDs/error focus/refusal copy/input modes/session guards/
measured contrast and unverified manual evidence; no new design or source
behavior change. Documentation formatting only elsewhere in that file.

Integrated `npm run verify` exit0:93 files/1,975 tests/build, format/lint/
TypeScript/down gates. Owned disposable synthetic PostgreSQL
`lf-practice-integrated-20261014`, loopback55435/tmpfs, only reviewed migrations/
public archive and synthetic test account: `npm run test:e2e` exit0,
102 passed/1 existing skip (2.7m). Fake `npm run eval:run`3/3. Owned container
removed; port3000 free after suite; existing development/review DBs untouched.
No production/private/provider access, commit/push or deployment. UI support
integrated locally, no live structured content or complete curriculum claim.
Earlier waiting/unapplied entries historical/cleared.

## Owner batch — IC-6–IC-8 approved; IC-9 pending

Based on accepted Ratios plan §3.5/§3.6/§5.1/§6; decision register remains
authoritative. No new source research, content or second lane inferred.

| Choice                       | Recommendation / exact request                                                                                                                                               | Tradeoff and boundary                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IC-6 / O-11                  | Extension lessons/skills:1 teaching record per lesson,6 practice per lesson,9 lesson-bank items,3 review per skill,6 delayed-check items per skill; unit-bank total deferred | Matches pilot profile; future authoring/storage/private/D-61 permissions remain separate. This request selects values only, not actual authoring. Existing pilot6 practice target unchanged.                                                                                                                                                                                                                     |
| IC-7 / O-12                  | OptionB separate teaching authoring/review from serving; teaching remains content requirement after approved storage path                                                    | Future release must honestly state teaching not served until separate Grade6 teaching adoption; no teaching record generation/serving permission now.                                                                                                                                                                                                                                                            |
| IC-8 remainder               | Authorize RAT-CATALOG-DESIGN only: one new `docs/grade-6-math-catalog-versioning.md`, Claude Code forge-expert/Opus then Codex independent review                            | Contract for unit/lesson/program/version coexistence, historical refs/claims/banks/state and teaching storage path. Present C-7 learner-state options without selecting; consume D62/D64/D68/D70/D71 and approved values. Read public code/schema only, private metadata only. No code/content/DB/provider/implementation/private access, D-61 exception none; docs checks, freeze then review/owner acceptance. |
| IC-9 interim live parts risk | Owner choice, no default recommendation:A leave with documented risk; B exclude two items from new lesson versions until repaired; C request separately scoped correction    | A/B do not remove current live Phase1 reachability or repair false accepts. B controls only future versions. C still requires exact correction scope/D-61 approval before editing. No legacy item mutation authorized by choosing an intention.                                                                                                                                                                  |

IC-9 concerns `unit-rates-2@content-2` and `ratio-tables-2@content-2`;
false accepts can add practice evidence under D-08. Legacy23 UNMET across
nine items remain unresolved. Accept recommendations for IC-6–IC-8 together,
choose IC-9 explicitly or leave it pending; subsets/overrides allowed. New
catalog-design packet assigned/pinned only after its explicit scope approval.
Remaining private/content/manual/C4/C5/activation/release gates stay separate.

### Batch disposition — 2026-10-14

Owner replied **"approve"**: IC-6 values only (D-164), IC-7 Option B (D-165),
and remaining IC-8 document-only catalog design (D-166) approved. IC-9 has no
selected A/B/C option and remains pending; it does not block document design.
Successor RAT-CATALOG-DESIGN is assigned to Claude Code forge-expert/Opus.
The table above records the presented request; its authoring/private/content/
implementation/release exclusions remain effective.
