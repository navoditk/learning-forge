# SS-IMPLEMENT — Grade 6 Social Studies authoring-contract slice

<!-- relay-phase: IN_PROGRESS -->

## Live relay

- Phase (2026-11-14): **DONE (engineering slice), ACCEPTED AND APPLIED LOCALLY,
  uncommitted (D-325).** Codex scoped re-review r2: **READY** (SS-R1 and SS-R2
  closed; the `python_output` ordering observation is harmless overlapping
  coverage). Patch `3f5298e1...dac8` applied, 9 files byte-identical to the frozen
  tree; typecheck, lint (0 errors) and `npm test` 141 files / 4,026 tests pass in
  the main checkout on the combined Python plus Social Studies state. Window
  `claude-window-20261114` closed at 5 of 10. Next, gated and not started: the
  O1 content step (D-324), as its own packet and window. No engineering packet is
  open.
- Earlier phase: **REVISED, FROZEN r2; SCOPED RE-REVIEW RUNNING** (window
  `claude-window-20261114`, 5 of 10). Revised patch SHA-256
  `3f5298e1d035d265acdab54af0d8d2a66bf1bdead146ca200f180b841088dac8` (9 files,
  +930/-3) on the same baseline `d749cf81...`. Integrator verified: hash, clean
  apply to the main working tree, and that the ONLY file differing from the
  reviewed r1 tree is `tests/curriculum/social-studies-rules.test.ts` (579 to 692
  lines, 56 to 60 tests) with `src/` byte-identical; the author's mutation of
  `src/content/catalog.ts` was restored (line 619 reads `=== 'reviewed'`). SS-R1:
  new test drives the real `servableContentCatalog` with synthetic pending and
  reviewed Social Studies records via module mocks; the author's mutation made it
  fail. SS-R2: added a schema-valid `python_output` case, teaching
  contest-mode and figure cases, assessment and review role controls, honest
  titles. Author observation for the reviewer: a schema-valid `python_output`
  record in this program is rejected by the EARLIER Python rule (it needs a
  language pin) before the Social Studies validator-type rule, so that rule is
  also tested directly. Frozen patch and tree in
  `agent-handoffs/SS-IMPLEMENT/rev2/`. Codex scoped re-review launched.
- Earlier phase: **REVIEW r1 READY_WITH_RISKS; VALIDATION CONFIRMED; r2 TEST
  CORRECTIONS RUNNING** (window `claude-window-20261114`, 4 of 10).
  **Integrator isolated validation of frozen patch `630f3b56...996b`** (snapshot
  of the main working tree, which already holds the Python patch, plus this
  patch; fresh `npm ci`; sanitized environment; 0 env files; real history by a
  moved clone `.git`, no `GIT_DIR`; throwaway Postgres removed, no leftover
  container; repo HEAD unchanged at `f909a22`, `core.worktree` unset): full
  `npm run verify` passed end to end: format, lint (0 errors, the one
  pre-existing warning), down-migration check, **141 files / 4,022 tests**
  passed, build compiled with 28 static pages; `local-agent-relay.test.ts` 33
  of 33 passed, so the author's 3 relay failures were environmental (a stub
  `node_modules`); `prisma migrate deploy` applied; `test:integration` 402
  passed, 1 skipped (44 files); `eval:run` 36 passed. e2e and
  `test:migrations` were not run: no UI, persistence or migration behavior
  changed. Consolidated correction sent to the same Sonnet role for SS-R1
  (vacuous servability test; use the production predicate with synthetic
  pending and reviewed records and a mutation check) and SS-R2 (overstated test
  descriptions; add the missing cases and role controls).
- Earlier phase: **REVIEW r1 READY_WITH_RISKS; integrator isolated validation
  still running; one consolidated test-evidence correction planned**. Codex
  `gpt-6.1-sol` on patch `630f3b56...996b` (window `claude-window-20261114`, 3 of
  10): no blocker or major. It independently enumerated every standards code
  against both dossiers: exactly 48 content codes (per-domain 3/9/5/8/7/8/8) and
  14 analysis codes (CST 1-3, REP 1-5, HI 1-6), none missing, extra, duplicate
  or misnumbered; exact `Set.has` membership (no regex over-admission); case and
  look-alike rejected; applying the rules to records of every role, the
  domain-pairing rule, the `science-rules.test.ts` change, the module location
  and the separate test file were all judged appropriate; R5a withholding is
  correct and proven. Two minors: **SS-R1** (a servability test filters live
  catalogs that contain zero Social Studies records, so it would pass without
  the pending-record filter; use the production predicate with synthetic pending
  and reviewed records) and **SS-R2** (two test descriptions overstate what they
  exercise: a `python_output` rejection case and teaching contest-mode and
  figure cases are claimed but absent; add them plus assessment and review role
  controls). Author-reported totals and the three relay-test failures remain
  unverified until the integrator's validation finishes.
- Earlier phase: **FROZEN r1; INDEPENDENT REVIEW AND INTEGRATOR ISOLATED
  VALIDATION RUNNING** (window `claude-window-20261114`, 3 of 10). The first author
  run was cut off by a 429 rate limit (invocation 1) and resumed (invocation 2);
  its worktree work was preserved. Patch SHA-256
  `630f3b56bb4a69fdd7e3fe1227c2145ee6f7c1a0e0532e7ffcc6b3efff1d996b` (9 files,
  +817/-3) on baseline commit `d749cf81...` (f909a22 + the frozen Python r5 patch,
  verified by hash). Integrator checks: hash, clean apply to the main working
  tree (which already has the Python patch), no schema, content, policy or
  protected file, no execution path. Files: `program-registry.ts` (R1),
  `curriculum.ts` (7 domains), new `social-studies-rules.ts` (explicit 48 content
  plus 14 analysis codes, validator/mode/figure/parts rules, RH./WHST. rejection),
  hooks in `content/catalog.ts` and `curriculum/catalog.ts`, labels in
  `generate-curriculum-site.ts` and `learner-chapters.ts`, a one-line change to
  `science-rules.test.ts`, and a new 56-test `social-studies-rules.test.ts`.
  Frozen patch and tree in `agent-handoffs/SS-IMPLEMENT/rev1/`. Author-reported:
  4,019 unit tests passed and 3 failed (`local-agent-relay.test.ts`, which the
  author attributes to a stub `node_modules` in its worktree; the integrator is
  validating in a clean environment), build and `content:validate` 538 passed,
  eval 36. Author questions for review: the added domain-pairing rule, the
  standards check on records of every role, R5 tests in a new file, the rules
  module location.
- Earlier phase: **DISPATCHED**. Author: Claude Code `forge-implementer`
  (Sonnet), isolated worktree. Reviewer: Codex `gpt-6.1-sol`, read-only
  (cross-family). Window `claude-window-20261114` (72 hours, 10 invocations).
- Authority: D-324 (O1 and O2 approved). D-323 accepted the Python slice, which
  this packet builds on.
- Base: `f909a22` plus the frozen Python patch
  `agent-handoffs/PYTHON-IMPLEMENT/rev5/python-implement-r5.patch` (SHA-256
  `7cb02094af415a5cd279b1750c9d848945a02e44291fab891f61e308bc67db83`), which is
  already applied (uncommitted) in the main working tree.

## Goal

Make `grade-6-social-studies` a registered, still **unavailable** program whose
content can later be authored and validated safely. Implement the engineering
prerequisites R1 to R5a in
`docs/curriculum-dossiers/grade-6-social-studies-authoring-prerequisites-20261010.md`
(section "Necessary implementation prerequisites"). Draft **no** Social Studies
skill or record: D-324 allows the O1 content step only after this slice is
built, reviewed and integrated.

## Required baseline (read carefully)

Your worktree starts from committed `HEAD` (`f909a22`), which does NOT contain
the Python patch, but the main checkout does. To avoid later conflicts:

1. In your isolated worktree, apply the frozen Python patch exactly
   (`git apply <that patch>`).
2. Make ONE local baseline commit **on your worktree branch only** (never on
   `main`, never push) so that you can compute your diff.
3. Implement this packet on top of it and return a unified diff against that
   baseline commit, with its SHA-256 and the baseline commit's tree hash. The
   integrator applies your diff to the main working tree, where the Python patch
   is already present.

## Scope (from the dossier)

- **R1 registry:** `grade-6-social-studies` gets `subjectKind: 'graded-academic'`
  and `skillCodePrefix: 'hss6-'`; keep `available: false`,
  `progressionMode: 'skill-graph-only'`, no units and the existing policy
  references. `hss6-` must not collide with `mk6-`, `moems6-`, `amc8-`, `mc6-`,
  `snsb6-`, `sci6-`, `py6-` or bare Grade 6 Math codes.
- **R2 domains:** add the seven recommended domains to `CurriculumDomainSchema`
  (`hss6-early-humankind`, `hss6-mesopotamia-egypt-kush`,
  `hss6-ancient-israelites`, `hss6-ancient-greece`, `hss6-ancient-india`,
  `hss6-ancient-china`, `hss6-ancient-rome`) with labels in both label maps.
- **R3 program validation rule** in the live content catalog for records whose
  skill belongs to `grade-6-social-studies`: validator type `multiple_choice`,
  `text` or `numeric`; reject `parts`, `composite` and `contestFormat`; mode
  `core` or `depth`; reject `figure`; every `standards` entry matches the
  allowlisted History-Social Science patterns of D-324 O2, using an EXPLICIT
  list of the 48 valid content codes (not a bare regex), applied to skills as
  well. Syntactic rejections only.
- **R4 literacy tags:** reject `RH.` and `WHST.` prefixes in `standards`.
- **R5 matcher regression tests** pinning the dossier's probe results, so any
  future relaxation must confront them.
- **R5a public gate:** verify, with tests, that for this program public skill
  detail, navigation, prerequisite names, counts and records are exposed only for
  an **available** program with reviewed content pinned to the exact skill
  version (the Python slice found `publishableSkillProjection` already withholds
  unavailable programs; confirm and pin it for Social Studies, and change code
  only if a gap is found).
- **Not in scope:** R6 tutor gating (before availability, not before
  authoring), any content, any skill or record, any availability change.
- Tests per the dossier; every behavior change needs a test.

## Hard rules

- No Social Studies skill, record, content JSON, teaching or assessment record
  is added; the program stays `available: false` and nothing new is visible to
  learners or on the public site.
- This slice has no schema or migration change. If you find you need one, STOP
  and report instead of adding it.
- No database operation is expected. If any DB-backed command is needed, use only
  a throwaway synthetic database with `DATABASE_URL` set explicitly on that
  command; never read `.env`.
- **Never set `GIT_DIR` or `GIT_WORK_TREE`** when running tests: fixtures run
  `git init`/`git commit` and would write into whatever repository the
  environment points at.
- No push, deploy, paid provider call or availability change. Do not edit shared
  status files (`docs/PROGRESS.md`, the handoff index, decisions), `AGENTS.md` or
  agent configs. Hard constraints in `AGENTS.md` apply.

## Ownership

Owned paths (list any extra in your report): `src/contracts/curriculum.ts`,
`src/curriculum/program-registry.ts` and nearby curriculum files,
`src/content/catalog.ts` (and a new rules module), `scripts/generate-curriculum-site.ts`
(labels only if needed), the relevant `tests/` files, and
`tests/curriculum/live-active-selection.test.ts`-style registry tests if counts
change.

## Done means (author self-audit)

Return the diff against your baseline commit with SHA-256, a requirements to
evidence table (R1 to R5a, each with file and test), the actual model ID, and the
exact output of `npm run verify`, `npm run test:integration` only if persistence
is touched (state it), `npm run eval:run`, `npm run db:check-down-migrations` and
`git diff --check`. Report failures honestly and name any skipped gate. Then stop.

## Open gates after this packet

Independent review; integration; then the O1 content step (one skill, two
`pending_review` practice records) as its own packet; then the owner's
availability, tutor and release decisions. None are authorized here.
