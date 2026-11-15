# PYTHON-IMPLEMENT — Python intro authoring-contract and serving slice

<!-- relay-phase: IN_PROGRESS -->

## Live relay

- Phase (2026-11-14): **DONE (code slice), ACCEPTED AND APPLIED LOCALLY,
  uncommitted (D-323).** Patch `7cb02094...db83` applied to the working tree,
  49 files byte-identical to the frozen tree; PY-R8 accepted as residual and
  tracked; float limits confirmed conservative. Next, separately gated: the H4
  content step (one record), human `down.sql` review before any production
  apply of 0019, manual accessibility review, availability, commit or push. No
  engineering packet is open. The earlier phase notes below are history.
- Earlier phase: **REVIEW r5 NOT_READY (one minor, PY-R8); ISOLATED
  VALIDATION RUNNING; AWAITING_HUMAN disposition of PY-R8** (window B, 10 of 12).
  Codex `gpt-6.1-sol` on patch `7cb02094...db83`: **PY-R9 and PY-R10 CLOSED**
  (all float boundaries print as written under CPython 3.14 repr rules; no
  other derivation divergence; no stale fixture wording), no defects in the
  four changed files other than PY-R8. **PY-R8 unresolved minor, third
  round, test file only** (`tests/migrations/attempt-evaluator-down-guard.test.ts`):
  `seedHousehold`, `seedAttempt`, `findUniqueOrThrow` and `$disconnect` awaits
  are unbounded; `withDeadline` bounds waiting but does not cancel database
  work; teardown swallows cleanup failures and allows 5+5+10 s against a 10 s
  hook timeout; `poll` can exceed its 15 s deadline. The reviewer judges the
  test non-vacuous and expects it to fail with `LOCK TABLE` removed; the
  author's mutation run is unverified by the reviewer. Production code and the
  migration are not implicated.
  - **Integrator disposition:** PY-R8 has survived three corrections; per the
    accountability rule this is an escalation checkpoint. Only the owner can
    accept residual risk. Cause: an incomplete fix each time (each round fixed
    the previously named gap, not teardown robustness as a whole). Options for
    the owner: (a) accept PY-R8 as documented residual test-hygiene risk and
    track it as a follow-up; (b) extend window B (2 invocations remain, so one
    more correction plus re-review would exhaust it).
  - **Integrator isolated validation** of the frozen r5 patch (snapshot of
    main working tree plus patch, fresh `npm ci`, sanitized environment, owned
    throwaway Postgres): evidence directory
    `agent-handoffs/PYTHON-IMPLEMENT/rev5/iso-validation/`; results are
    recorded below.
  - **Integrator isolated validation result (frozen r5 patch `7cb02094...db83`;
    snapshot of main working tree plus patch, fresh `npm ci`, sanitized
    environment, 0 env files, 0 "loaded from .env" matches, throwaway Postgres
    removed, no leftover container):** `npm ci`, `db:generate`, `prisma migrate
deploy` exit 0; **`npm run verify`: 3,965 of 3,966 passed, 1 failed**:
    `tests/progression/private-bank-merge.test.ts` "repository corpus holds the
    replaced one-variable-equations-2 record" threw `HISTORY_UNAVAILABLE`
    because the snapshot had no git history (the test reads `git log`); with a
    real history clone moved into the isolated tree that whole file passed
    (35 of 35). The full `verify` was not re-run after that fix, and the
    failure is an environment gap in the snapshot, not a patch defect, but the
    author's "all green" claim reproduced only after supplying history.
    `test:integration` 402 passed, 1 skipped (44 files); `test:migrations`
    exit 0 (0019 guard 4, catalog 7, forward/down/forward passed); `eval:run`
    36 passed; `test:e2e` 124 passed, 1 skipped. These match the author's
    figures except the history-dependent test.
  - **Integrator error, repaired (2026-11-14):** while diagnosing that test I
    ran vitest with `GIT_DIR` pointing at the real repository. Test fixtures
    that `git init`/`git commit` then wrote into the real repo: a stray local
    commit `5a5703f` ("one", author `t`) on `main`, and a persisted
    `core.worktree` pointing at the isolated tree. Nothing was pushed
    (`origin/main` unchanged at `f909a22`) and no working-tree file was
    touched. Repaired by unsetting `core.worktree` and `git reset --mixed
f909a22`; status matches the pre-incident 25 changes. Rule: never export
    `GIT_DIR` or `GIT_WORK_TREE` when running tests.
- Earlier phase: **REVISED, FROZEN r5; CHANGED-SCOPE RE-REVIEW RUNNING**
  (window B, 10 of 12; two invocations remain, so a further correction plus its
  re-review would exhaust the window and any more needs an owner extension).
  Round-5 patch SHA-256
  `7cb02094af415a5cd279b1750c9d848945a02e44291fab891f61e308bc67db83` (49 files,
  +3,717/-32) against `f909a22`; verified: hash, clean apply, no protected
  file, no content, no execution path in non-test code, `LOCK TABLE` present in
  `down.sql`, and only four files changed since r4 (`python-scan.ts`, its test,
  the down-guard test, the phase1 fixture). PY-R9 fix: floats whose text starts
  `0.0000` are rejected (CPython prints below 0.0001 in exponent form), with the
  derivation reasoned against CPython 3.14 repr rules. PY-R8: deadlines on every
  async operation, child `error` handlers, `afterEach` teardown that kills
  children first; author-reported mutation check (LOCK TABLE removed makes the
  lock-order and concurrency tests fail). PY-R10: stale fixture wording fixed.
  Author-reported, unverified: verify 3,966 tests, integration 402 (+1 skipped),
  migrations, e2e 124 (+1 skipped), eval 36. Open owner question (reviewer):
  confirm or widen the narrow "simple float" limits (digit limits, no trailing
  zero except `.0`, nothing below 0.0001).
- Earlier phase: **REVIEW r4 NOT_READY; r5 CORRECTIONS RUNNING** (window B,
  9 of 12). Codex `gpt-6.1-sol` on patch `7250f966...b3b3`: **PY-R3 and PY-R7
  CLOSED** (the allowlist design fails closed; 78 author cases plus 312
  character probes and million-scale input passed its harness; no quadratic
  behavior). New: **PY-R9 major** (newly observable, from the optional
  derived-output check): `print(0.000001)` is accepted with canonical
  `0.000001`, but CPython 3.14 prints `1e-06` (same for `0.00001` and
  `0.000099`), so a correct answer would be marked wrong; **PY-R8 minor
  unresolved**: `poll` does not bound an unresolved condition query, child
  close promises and the cleanup query are unbounded, cleanup awaits the
  database before killing children, child `error` events unhandled, mutation
  claim unverified by reviewer; **PY-R10 minor regression**: fixture accessible
  alternative still says "one sum" for `print(3)`.
  - **Disposition and cause (integrator):** PY-R9 is a new finding, not a
    PY-R3 recurrence, so no owner escalation. Fix: reject positive floats below
    `0.0001` in the grammar (CPython switches to exponent form below that) and
    audit the rest of the derivation for other repr divergences; add boundary
    cases. PY-R8 has survived two rounds: cause is an incomplete fix (it fixed
    determinism but not bounded operations); corrective action is a deadline on
    every async operation, child `error` handlers and independently triggered
    teardown that kills and awaits children even if a database call stalls.
  - **Owner question to batch (reviewer, non-blocking):** the float limits
    (digit limits, `2.50` rejected) narrow "simple floats" beyond the
    dossier's wording; the safe narrow reading stays until the owner confirms
    or widens it. Non-negative ints, no quote characters and multiple print
    lines were judged supported.
- Earlier phase: **REVISED, FROZEN r4; CHANGED-SCOPE RE-REVIEW RUNNING**
  (window B, 8 of 12). Round-4 patch SHA-256
  `7250f9660e081aa9cee6976d6f7a73228e53093e613e36d2fd8aeac3c55fb3b3` (49 files,
  +3,602/-32) against `f909a22`; verified: hash, clean apply, no protected
  file, no content, no execution path in non-test code, `LOCK TABLE` present in
  `down.sql` after the author's mutation check, old blacklist logic gone (the
  scanner is now a 121-line allowlist parser). Frozen patch and tree in
  `agent-handoffs/PYTHON-IMPLEMENT/rev4/`. Author's narrow readings of dossier
  section 8 for the reviewer to assess (possible owner questions): non-negative
  ints, float digit limits and trailing-zero rule, no quote characters in
  strings, multiple `print` lines in scope. Optional derived-output check added
  (`canonicalAnswer` must equal the output derived from the literals; nothing
  executes). Generic `codeListing` lints still allow loops and variables for
  non-`python_output` items. Author-reported, unverified: verify 3,948 tests,
  integration 402 (+1 skipped), migrations (incl. a mutation check that fails
  without the lock), e2e 124 (+1 skipped), eval 36. A fourth survival of PY-R3
  goes to the owner.
- Earlier phase: **REVIEW r3 NOT_READY; CAUSE CHECKPOINT 2; r4 CORRECTIONS
  RUNNING** (window B, 7 of 12). Codex `gpt-6.1-sol` on patch `68994624...1e44`:
  PY-R5 and PY-R6 closed; **PY-R3 unresolved major (third round)**: the token
  scanner accepts `print(f"{print()}")`, `print(f"{print(1, end=chr(33))}")`,
  `print(f"{''}")`, `print("x", **dict(end="!"))`, `print(*[])` (three are
  regressions versus r2) and a hint can quote a literal hidden in an f-string
  expression; PY-R7 minor, `print([1)`, `print("x"` and `)print("x")` pass
  (brackets never matched, so unsupported input does not fail closed); PY-R8
  minor, the polling rewrite of the down-guard test still relies on a fixed
  three-second writer window, does not identify the spawned backends, has a
  20 s poll deadline above the 5 s test timeout and no cleanup on failure.
  - **Cause checkpoint 2 (integrator):** wrong design, not an incomplete patch.
    Rounds 2 and 3 _blacklisted_ excluded constructs in an ever-growing
    mini-Python scanner of an unbounded language, so new holes keep appearing.
    The approved entry scope (dossier section 8, H1/D-322) already enumerates
    the only forms the first packet may contain: `print(...)` with one or more
    comma-separated literal arguments (nonempty str, int, bool, simple float),
    with variables, operators, `sep`, `end`, f-strings, escapes, quotes inside
    strings and input out of scope. Corrective action: replace the blacklist
    with a positive allowlist grammar of exactly that form (everything else
    rejected, so it fails closed by construction). This narrows code to the
    approved scope; no scope or approved choice changes, so no owner decision.
  - **Consolidated scope (same Sonnet role):** PY-R3 allowlist; PY-R7 falls out
    of the grammar; PY-R8 deterministic test coordination and cleanup. A fourth
    survival of PY-R3 would be escalated to the owner.
- Earlier phase: **REVISED, FROZEN r3; CHANGED-SCOPE RE-REVIEW RUNNING**
  (window B, 6 of 12). Round-3 patch SHA-256
  `68994624e44b026388af8f10fb7d9e64f6c4fe3f17cb94764447e73f404c1e44` (49 files,
  +3,569/-32) against `f909a22`; verified: hash, clean apply, no protected
  file, no content, no execution path in non-test code, stray
  `test-migrations.sh` comment restored. PY-R3 now uses a token scanner
  (`src/contracts/python-scan.ts`, string/comment aware, bracket-depth tracking;
  the regex-over-source detection is gone; remaining regex use is per-character
  classification). Frozen patch and tree in `agent-handoffs/PYTHON-IMPLEMENT/rev3/`.
  Author-reported, unverified: verify 3,928 tests, integration 402 (+1 skipped),
  migrations, e2e 124 (+1 skipped), eval 36. If PY-R3 survives this review,
  treat it as a design problem for the owner, not another correction loop.
- Earlier phase: **REVIEW r2 NOT_READY; CAUSE CHECKPOINT; r3 CORRECTIONS
  RUNNING** (window B, 5 of 12). Codex `gpt-6.1-sol` on patch `0bab49ec...2cb5`:
  PY-R1 closed (legacy parse byte-identical; the additive `pythonResponse` key
  is acceptable and needs no owner decision), PY-R2 closed (atomic, tests not
  vacuous), PY-R4 closed (640 px honestly labelled a viewport equivalent;
  manual zoom and assistive-technology review stay open). **PY-R3 UNRESOLVED
  MAJOR (recurring)**; PY-R5 minor (a test claimed to pass unchanged on base
  asserts `evaluatorVersion`, which base lacks); PY-R6 minor (stray edit to an
  existing comment in `scripts/test-migrations.sh`).
  - **Cause checkpoint (integrator, per the accountability rule):** incomplete
    fix from the wrong mechanism. Round 2 matched excluded constructs with
    regexes over raw source, which cannot see string or comment context or
    nesting. Reproducers (reviewer's static Node probes, no Python run):
    bypasses `print("a)", end="!")`, `print(str(1), end="!")` and `print( #
comment` + newline + `)`; false positives `print("sep=x")` and
    `print("print()")`. The contract is not contradictory or oversized, so no
    owner decision is needed.
  - **Corrective action and consolidated scope (same Sonnet role):** replace
    the regexes with a string- and comment-aware tokenizer that tracks
    parenthesis depth (prefer validating against dossier 5.2's positive set if
    it enumerates the allowed forms); add the five reproducers plus valid
    literal-print controls; PY-R5: separate base-compatible request assertions
    from new-column assertions and state accurately what was compared to base;
    PY-R6: restore the original comment. Optional, non-blocking: replace fixed
    sleeps in the concurrency test with a lock-wait poll.
- Earlier phase: **REVISED, FROZEN r2; CHANGED-SCOPE RE-REVIEW RUNNING**
  (window B, 4 of 12). Round-2 patch SHA-256
  `0bab49eced4a5cdcf92113f0a1021f6bcb2e57d9921a89502d86b3b5616f2cb5` (47 files,
  +3,264/-33) against `f909a22`; verified: hash, clean apply, no protected
  file, no content, no execution path in non-test code. Frozen patch and tree in
  `agent-handoffs/PYTHON-IMPLEMENT/rev2/`. Design point put to the reviewer: PY-R1
  was fixed by leaving the legacy `learnerResponse` parse byte-identical and
  sending Python answers under a new additive request key `pythonResponse`
  (422 `RESPONSE_MODE_MISMATCH` on a cross-type send). Integrator-found defect
  for the reviewer: an unintended edit to an existing comment in
  `scripts/test-migrations.sh` (`# Prisma-representable` became
  `#Prisma-representable`). Author-reported, unverified: verify 3,888 tests,
  integration 401 (+1 skipped), migrations, e2e 124 (+1 skipped), eval 36.
- Earlier phase: **REVIEW r1 NOT_READY; CORRECTIONS RUNNING** (window B,
  3 of 12). Codex `gpt-6.1-sol` (report in
  `agent-handoffs/PYTHON-IMPLEMENT/rev1/review-r1-report.md`): PY-R1 major,
  legacy request behavior not preserved (a 5,000-character raw cap rejects
  input legacy accepted; whitespace-only responses can now return 401/404 not
  400); PY-R2 major, `down.sql` check and drop are not atomic; PY-R3 major,
  dossier 5.2 exclusions (argument-free `print()`, empty string, `sep`, `end`,
  escapes) not enforced; PY-R4 minor, evidence narrower than claimed. Integrator
  ruled PY-R1: preserve legacy exactly, no compatibility decision; the worker
  must stop and report if that is impossible. Ownership extension accepted for
  `globals.css`, `learner-data.ts`, `page.tsx`, the active-selection JSON and
  three existing tests. The earlier "FROZEN; INDEPENDENT REVIEW RUNNING" note
  below is superseded.
- Earlier phase: **FROZEN; INDEPENDENT REVIEW RUNNING**. Patch SHA-256
  `ad35d17cd79e01c145245953667e5f40f6328f2b3613af47807e99dc546f335f` (44 files,
  +2,736/-36) against `f909a22`; the integrator verified the hash, a clean
  `git apply --check` on a fresh base worktree, no protected file touched, no
  content added and no code-execution path (the only `eval(` text is a
  rejected-token test fixture). Frozen patch and a pristine tree are in common
  Git `agent-handoffs/PYTHON-IMPLEMENT/rev1/`; Codex `gpt-6.1-sol` review
  launched (window B, 2 of 12). Author `claude-sonnet-5-5` per session context
  (unverified by client metadata). Author-flagged items for review: legacy
  request parsing moved after item resolution (empty unauthenticated legacy
  body now 401 not 400; 400 wording changed), `down.sql` unreviewed draft, a
  disabled "Python Intro (Grade 6) (coming soon)" entry in the learner
  switcher, hint gating tested with a mocked model path.
- Earlier phase: **READY TO DISPATCH**. Author: Claude Code
  `forge-implementer` (Sonnet). Reviewer: Codex `gpt-6.1-sol`, read-only
  (cross-family). Window `claude-window-20261113b` (72 hours, 12 invocations).
- Base: `main` @ `f909a22a1f90c09e23ee37b3fe6848431230dc59`.
- Authority: D-321 (incident closed, predict-output only) and D-322 (H1 to H4
  approved, local 0019 migration authorized).

## Goal

Make `python-intro-grade-6` a real, still **unavailable** program whose single
approved Python question type (predict the printed output) can be authored,
scored and served safely. Implement dossier
`docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md`
sections 5, 7.1, 7.2 and 11: **C1 to C5, C7 and C9**. Draft **no** Python skill
or record in this packet: D-322 H4 allows that only after this slice is built,
reviewed and integrated.

## Reference only

A stale earlier attempt (Copilot worktree
`~/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/python-contract-implementation`,
HEAD `d7bda52`, diff SHA-256
`1078506d813b8a5bdd08a1ab26ded0094ea00cc70acebbf72c19e4eeb15422e3`) may be read
for ideas. Do not apply it: it is 83 commits behind `main`, 19 files fail to
apply, and its `0018_add_attempt_evaluator_version` collides with main's
`0018_add_teaching_delivery_context`. Re-implement on current `main`; reuse
nothing you have not re-verified against current files.

## Scope (from the dossier)

- **C1 program identity:** add `python-intro-grade-6` to `PROGRAM_CODES`; a
  registry entry with `available: false`, `subjectKind: "enrichment-non-graded"`,
  `skillCodePrefix: "py6-"`, `progressionMode: "skill-graph-only"`, and policy
  refs `python-intro-grade-6-access` / `python-intro-grade-6-default` at `1.0.0`
  with matching files under `policy/`. Keep the registry/`PROGRAM_CODES`
  equality test green.
- **C2 domain:** add `py6-programming-fundamentals` to `CurriculumDomainSchema`;
  require new Python skills to carry `version`.
- **C3 draft and publication protection:** pending, assessment and review
  records must never publish; for an `available: false` program the public
  site exposes no navigation beyond the existing "not authored yet"
  placeholder, no skill metadata, no standards and no counts. Reuse
  `publishableContentProjection`. Must be tested before any Python skill could
  enter `rawSkills`.
- **C4 `codeListing`:** schema, static lints, and a check that the listing
  version matches the program pin `languageVersion: "3.14"` (section 5.1).
- **C5 `python_output` scoring:** type-aware request parsing in both grading
  routes; the ordered pipeline of section 5.2; typed invalid-response handling
  **before** attempt creation; `normalizedResponse` and `evaluatorVersion`
  written through the real evidence path; catalog checks (canonical
  constraints, `acceptedAnswers === [canonicalAnswer]`, leakage patterns over
  every output line, no quoting of code literals in hints).
- **Migration (D-322):** new `prisma/migrations/0019_*` adding a nullable
  `Attempt.evaluatorVersion` with a human-reviewed sibling `down.sql`
  (`npm run db:check-down-migrations` must pass). Local synthetic database
  only; never apply to production.
- **C7 learner renderer:** the code block, and a `<textarea>` for
  `python_output` with `autocapitalize="off"`, `autocorrect="off"`,
  `spellcheck={false}`, a monospace font, entry guidance via `aria-describedby`,
  button submission, and accessible invalid-response messages.
- **C9 tutor gating:** model hints are disabled for `py6-` items, with tests.
- Tests per dossier section 11; every behavior change needs a test.

## Hard rules

- **No learner code is ever executed**: no `eval`, `exec`, subprocess, VM or
  sandbox. Scoring is deterministic string matching only (D-321).
- **Database:** use only a synthetic local database per
  `docs/local-development.md`. Set `DATABASE_URL` explicitly in every command;
  never rely on a default, never read `.env`, never point at a remote or
  production URL, never run migration/deletion/restore against anything real.
- No push, deploy, paid provider call or availability change. The program stays
  `available: false`; no `py6-` skill or record is added to `rawSkills`.
- Do not edit shared status files (`docs/PROGRESS.md`, handoff index,
  decisions): return evidence to the integrator.
- Do not edit `AGENTS.md` or `.claude/`/`.codex/` agent configs.
- Hard constraints in `AGENTS.md` apply (no answer leakage, structured schemas,
  no secrets, accessibility WCAG 2.2 AA).

## Ownership

Work in an isolated git worktree off the base above. Owned paths (add only
what the dossier needs; list any extra in your report): `src/contracts/`,
`src/content/`, `src/curriculum/`, `src/phase1/`, `src/progression/
assessment-submission.ts`, `src/server/household-data.ts`, the five grading
routes under `src/app/api/`, the learner renderer under `src/app/components/`,
`src/tutor/` (gating only), `prisma/schema.prisma`, `prisma/migrations/0019_*`,
`policy/access-policies/python-intro-grade-6-*.json`,
`policy/progression-profiles/python-intro-grade-6-*.json`,
`scripts/generate-curriculum-site.ts` (only if C3 needs it), and `tests/`.

## Done means (author self-audit)

Return: a unified patch against the base with its SHA-256, a requirements
to evidence table (C1 to C9 plus migration, each with file and test), the
actual model ID, and the exact command output for `npm run verify`,
`npm run test:integration` (synthetic `DATABASE_URL` stated),
`npm run test:migrations`, `npm run test:e2e` if the renderer changed,
`npm run eval:run`, and `git diff --check`. Report failures honestly; a skipped
gate must be named. Then stop. The integrator freezes and routes the patch to
the independent Codex review; corrections reopen the same role.

## Open gates after this packet

Independent review and human acceptance of the patch; then the H4 content step
(one record for `py6-print-output-reading`); then the owner's availability,
production-migration, accessibility and release decisions. None are authorized
here.
