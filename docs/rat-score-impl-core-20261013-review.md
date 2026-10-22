# RAT-SCORE-IMPL-CORE — Independent implementation review

## Verdict

**Not ready for human review until one minor test-evidence correction.**
No blocker or major correctness/safety defect found in the seven-file CORE
implementation. First comprehensive review: 0 blockers, 0 majors, 1 minor.

## Identity and frozen evidence

Reviewer: fresh host-selected Codex `forge-reviewer`, fixed actual
`gpt-6.1-sol`. Author independently verified from Claude client metadata:
`forge-implementer`, all 93 assistant records `claude-sonnet-5-5`, first UUID
`b429a25d-9f7b-4e48-8d78-0389b7ed5d63`, `2026-10-14T00:46:27.544Z`.
Claude project session `22bffa60-935a-47f3-a703-6ff9ab4853d0`,
`subagents/agent-a701108cfc81bb655.{meta.json,jsonl}`.
Critical cross-family independence satisfied.

Base HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, branch main.
Patch SHA-256 `98fbabe1577659cb3fdd6f940dc1fafe836313459abab506169a45c5c712bc20`.
All seven frozen hashes match `frozen-sha256.txt`; in-memory reconstruction
from base reproduces all seven files exactly. All sixteen live/bundled input
pins and additional consumed public inputs match manifests. Baseline manifest
`4ad22799459af2c5157b11e3e9e23c30b32aeab8aa7cbb42703402cc1e5ccfa7`.
Frozen artifacts remain under common Git metadata
`agent-handoffs/RAT-SCORE-IMPL-CORE/`; patch unapplied.

## R-1 — Minor; high confidence — Positive control is not load-valid

**Location:** frozen `tests/content/structured-response.test.ts:637–648`,
especially line 645. **Requirement:** accepted contract §5.2 requires complete,
independently load-valid positive fixtures; §2.4/§2.7 require derived canonical
and accepted answers.

The 669-character envelope fixture sets `canonicalAnswer: 'x'`, but its six
fields derive:

`Field number 0: Opt 0; Field number 1: Opt 0; Field number 2: Opt 0; Field number 3: Opt 0; Field number 4: Opt 0; Field number 5: Opt 0`

`validatorOf` sets `acceptedAnswers: ['x']`. Catalog semantic validation
therefore rejects it with `canonicalAnswer must equal the derived rendering`.
The test bypasses load validation, demonstrating envelope size with an
invalid validator. This is a first-review evidence defect, not a new product
choice or scope expansion.

**Smallest correction:** supply derived canonical answer and
`acceptedAnswers: [canonicalAnswer]`, then assert schema/catalog load success
before checking both envelope lengths.

**Closure condition:** corrected complete fixture loads and scores successfully,
raw and normalized envelopes both exactly 669 characters; bounds, reference
and selector tests remain passing. Original Sonnet worker corrects this
fixture/check only, preserves implementation and prior evidence.

## Comprehensive coverage

Checked against accepted contract and decision values:

- Strict schema alternatives and legacy coexistence.
- Catalog satisfiability, contest and bounds rules.
- Exact BigInt arithmetic, numeral classification and simplest-form rules.
- Matrix, independent scanner/reference generator and negative controls.
- Answer-independent refusal output; allowlist projections; load-valid
  selector variants.
- Canonical rendering, envelopes and history/audit helpers.
- Purity/import boundary; unchanged matcher/content/imports/legacy hashes.

No additional verified findings withheld. Optional new features/polish are
not gates. Any follow-up review checks R-1 closure/diff/direct regressions,
classifying genuine new findings per orchestration accountability procedure.

## Validation evidence and limits

Author logs support 192 new tests, 83 legacy tests, full database-free verify
with 1,941 passing tests/build/exit 0. Reference generator and negative
controls inspected. Separate mutation spot-check is author-reported; executable
mutants/results were not preserved in this bundle. Prior integrator 314-test
and TypeScript execution remains attributed evidence, not a reviewer rerun.

No reviewer edits, installs, agents, worktrees, runtime probes, database/provider
access or test-suite reruns. PATHS authorization/transactions/persistence/actual
projections, UI/accessibility, private-bank implementation, runtime dispatch,
production and release behavior remain unverified/separately scoped. Existing
23 legacy UNMET expectations unchanged.

## Routing

**SWITCH TO: Claude Code forge-implementer / Sonnet**, original executor,
R-1 correction and evidence only; refreeze for Codex changed-scope closure
review. No main application, artifact acceptance, owner choice, implementation
breadth, release, commit or push approval follows from this report.
