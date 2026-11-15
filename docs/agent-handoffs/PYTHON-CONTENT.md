# PYTHON-CONTENT — first Python intro skill and one practice record (D-322 H1/H4)

<!-- relay-phase: IN_PROGRESS -->

## Live relay

- Phase (2026-11-15): **DONE; CONTENT ACCEPTED (D-327) AND APPLIED LOCALLY,
  uncommitted.** Codex `gpt-6.1-sol` review READY (no findings) and delegated
  disposition ACCEPT_CONTENT; patch `07f06d30...278b` applied, 14 files
  byte-identical to the frozen tree; typecheck, lint (0 errors), `npm test`
  142 files / 4,038 tests and `content:validate` 550 pass in the main checkout.
  The record stays `pending_review`; the program stays unavailable. Open, with
  the owner: tutor gating, accessibility, availability, release, commit/push.
- Earlier phase: **FROZEN r1; INDEPENDENT REVIEW AND DELEGATED CONTENT
  ACCEPTANCE RUNNING** (window `claude-window-20261114b`, 3 of 10). Patch SHA-256
  `07f06d30d4b17741c6f26c0469c429ab6f771b5eafc261d58dd9dd945d7e278b` (14 files,
  +399/-29) on baseline commit `495207ae...` (f909a22 + Python r5 + Social
  Studies r2, verified by hash). Integrator checks: hash, clean apply to the
  main working tree, no protected, schema, policy or other-program content, no
  execution path; the integrator also hand-traced the output
  (`Launch check`, `Rockets 3`, `Fuel 2.0`, `Hatch closed True`) and read the
  authored record, hints and provenance. Content: skill `py6-print-output-reading`
  (entry node, program-internal code `PY6-P1-01`, five misconception codes) and
  ONE `practice` record `py6-print-output-reading-1` ("Launch checklist", a
  four-line listing mixing a string, an int, the float 2.0 and True), three
  hints that teach rules without revealing the answer, `pending_review`, program
  still `available: false`. Author-reported (opus `claude-opus-5-5`, unverified
  by client metadata): `verify` 142 files / 4,038 tests, build, `content:validate`
  550, eval 36, `git diff --check`; integration, migrations and e2e skipped
  (no persistence or UI change). Frozen patch and tree in
  `agent-handoffs/PYTHON-CONTENT/rev1/`. Codex `gpt-6.1-sol` review plus the
  D-212 content-acceptance disposition launched.
- Earlier phase: **DISPATCHED**. Author: Claude Code `forge-expert` (Opus),
  isolated worktree. Reviewer: Codex `gpt-6.1-sol`, read-only (cross-family),
  who also gives the delegated content-acceptance decision under D-212 after
  review. Window `claude-window-20261114b` (72 hours, 10 invocations, shared with
  the ELA delegated decisions).
- Authority: D-322 (H1 entry scope, H2 Python 3.14, H3 sourcing, H4 scoped D-61
  exception for exactly this skill and record), D-321 (predict-output only),
  D-323 (slice accepted, float limits conservative). The owner asked on
  2026-11-14 to push forward by judgment or an alternative model; D-212 delegates
  internal reversible gates (content acceptance, D-61 exceptions) to the
  cross-family reviewer.
- Base: `f909a22` plus the frozen Python r5 patch
  (`agent-handoffs/PYTHON-IMPLEMENT/rev5/python-implement-r5.patch`, SHA-256
  `7cb02094af415a5cd279b1750c9d848945a02e44291fab891f61e308bc67db83`) plus the
  frozen Social Studies r2 patch
  (`agent-handoffs/SS-IMPLEMENT/rev2/ss-implement-r2.patch`, SHA-256
  `3f5298e1d035d265acdab54af0d8d2a66bf1bdead146ca200f180b841088dac8`), all
  already applied (uncommitted) in the main working tree.

## Required baseline (read carefully)

Your worktree starts at committed `HEAD` (`f909a22`), which lacks both accepted
slices. First verify both patch hashes, apply them in order (Python r5, then
Social Studies r2), and make ONE local baseline commit **on your worktree branch
only** (never on `main`, never push) so you can compute your diff. Return a
unified diff against that baseline commit with its SHA-256 and the baseline tree
hash.

## Goal

Author exactly the content D-322 H1/H4 approves, as `pending_review` and in an
`available: false` program: skill `py6-print-output-reading` and ONE `practice`
record. Dossier
`docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md`
sections 5, 8 and 10 govern.

## Content spec (from dossier section 8 and the accepted code)

- **Skill:** `py6-print-output-reading`, version `1.0.0`, program
  `python-intro-grade-6`, domain `py6-programming-fundamentals`, no
  prerequisites (entry node), one program-internal objective code such as
  `PY6-P1-01` labelled internal (H3), `observableEvidence` that names the
  observable behavior, and the proposed misconception codes
  `py6-prints-quotes`, `py6-bool-case`, `py6-int-float-same`,
  `py6-comma-joins-without-space`, `py6-runs-out-of-order`.
- **Record:** ONE `practice`, `core`, `foundational`, validator `python_output`,
  content version `content-1`, with a 2 to 3 step hint ladder. The listing is
  held to the accepted allowlist grammar (`src/contracts/python-scan.ts`): each
  line exactly `print(ARG, ARG, ...)` with literal arguments only (nonempty ASCII
  strings with no quote or backslash, non-negative ints, `True`/`False`, simple
  floats within the D-323 limits). No variables, operators, f-strings, `sep`,
  `end`, comments or blank lines. Output is 1 to 8 nonempty lines.
  `canonicalAnswer` must equal the derived output and `acceptedAnswers` must
  equal `[canonicalAnswer]` (the catalog enforces both).
- **Originality:** original text only; the originality statement names no
  third-party, textbook, contest or tutorial source. Provenance `llm_drafted`,
  origin `owned`, review `pending_review`, reviewer `pending human review`, no
  `reviewedAt`.
- **Hints and leakage:** hints never reveal the answer or quote code literals;
  leakage patterns cover every output line; `accessibleAlternative` and
  `structureDescription` are required and must describe what the code does
  accurately. Include, in your report (not the record), a line-by-line trace of
  the output so a reviewer can verify it without running Python.
- **Out of scope:** a second record, a teaching record, assessments, any other
  skill, depth, contest content, variables, operators, input, errors.

## Registration

Follow the Science registration precedent (skill JSON under `content/skills/`,
record JSON under a program folder such as `content/python-intro-grade-6/`,
imports in `src/curriculum/catalog.ts` and `src/content/catalog.ts`) so the REAL
loaders, allowlist, derived-output check and publication protection validate it.
The program stays `available: false`; the public site must show nothing but the
"Coming soon" placeholder (the Python slice's C3 tests must still pass). Update
existing count-based tests truthfully (for example live-catalog counts) and add
tests that the new skill and record load, are pending, are withheld from the
public projection and are not servable.

## Hard rules

- No schema or migration change; no availability change; no tutor enablement; no
  other program touched. Do not edit shared status files (`docs/PROGRESS.md`, the
  handoff index, decisions), `AGENTS.md` or agent configs.
- No database operation is expected. If any DB-backed command is needed, use only
  a throwaway synthetic database with `DATABASE_URL` set explicitly on that
  command; never read `.env`.
- **Never set `GIT_DIR` or `GIT_WORK_TREE`** when running tests.
- No commit on `main`, no push, no deploy, no paid provider call. Execute no
  Python and no learner code.

## Done means

Return the diff against your baseline commit with its SHA-256, a
requirements-to-evidence table (skill, record, grammar and derived-output
conformance, hints and leakage, accessibility fields, registration, protection
tests), the line-by-line output trace, the actual model ID, and exact output of
`npm run verify` (if the stub `node_modules` stops the relay tests, say so and
run build and `content:validate` separately), `npm run eval:run`, and
`git diff --check`. Report failures honestly, then stop.

## Open gates after this packet

Independent Codex review and the delegated content-acceptance decision (D-212);
local application; then the owner's tutor gating, availability, accessibility,
commit/push (which also applies migration 0019 on Render) and release decisions.
None are authorized here.
