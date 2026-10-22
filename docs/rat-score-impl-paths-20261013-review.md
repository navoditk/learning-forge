# RAT-SCORE-IMPL-PATHS revision 1 — Independent implementation review

## Verdict and identity

**Not ready for human review.** Comprehensive first pass complete:
0 blockers, 0 majors, 2 minor corrections. No verified incorrect score,
unauthorized write or answer disclosure found.

Reviewer: fresh host-selected Codex `forge-reviewer`, fixed actual
`gpt-6.1-sol`; role configuration matches. Author client metadata independently
verified: all 120 assistant records `claude-sonnet-5-5`, latest UUID
`2ed991ec-a147-44b4-8914-26984b1c664f`, `2026-10-14T03:37:35.706Z`.
Transcript:
`/Users/navoditkaushik/.claude/projects/-Users-navoditkaushik-GitHub-learning-forge/22bffa60-935a-47f3-a703-6ff9ab4853d0/subagents/agent-a71172deb959ad6a4.jsonl`.
Claude→GPT independence satisfied.

## Frozen evidence

Patch SHA-256 `6ed7d1b93ed27147964ccdb0d30aa59226fc4dd91ca6c97774fec5cbf6c0cdd7`.
Base HEAD `3e7c33372599d20c285656c3610ca6e47743240f` plus accepted dirty
baseline. All 29 live/copied pins and 15 extra dependency pins verified;
baseline manifest
`9d39edf6f1fa257b35358e30d672fa1c088c945b7c2357d1534d07dd27b9cfa6`.
All fourteen frozen hashes and owned scope verified; in-memory reconstruction
reproduces exact files. Accepted contract `dda20ea7...9898`, D-155–D-163
checked. Artifacts under common Git metadata
`agent-handoffs/RAT-SCORE-IMPL-PATHS/`; main patch remains unapplied.

## Requirement coverage

| Requirement                                                                       | Review result                                                                                   |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| XOR requests, five routes, strict structured branch, legacy parsing               | Checked.                                                                                        |
| Opt-in dispatch, deterministic outcomes, S-A storage                              | Checked.                                                                                        |
| Authority/lifecycle/duplicate/current-item responses                              | Checked; evaluation ordering correction R-1 below.                                              |
| Refusal zero writes, ordinal preservation and expiry                              | Code and synthetic retained evidence checked.                                                   |
| Serializable rechecks and competing committed submission                          | Checked; new wrapped-client test does not demonstrate genuine simultaneous transaction overlap. |
| Practice authority/ended-session parity                                           | Checked.                                                                                        |
| Authorized descriptors/private-key redaction/selector invariance/text alternative | Checked; assessment number-rendering sentinel variant not separately demonstrated.              |
| Item-level feedback and unchanged assignment/submission projections               | Checked.                                                                                        |
| Pinned history/audit/export/erasure/legacy attempts                               | Checked.                                                                                        |
| Tutor/provider-input/fake-response/trace privacy                                  | Checked.                                                                                        |
| Legacy matcher/characterization invariants                                        | Hashes checked.                                                                                 |
| UI/private store/content registration/live serving/release                        | Excluded.                                                                                       |

Five mutation exercises remain author self-audit evidence; standalone mutation
outputs absent. No extra mutation gate inferred.

## R-1 — Minor; high confidence — Evaluator precedes assessment preflight

**Location:** frozen `src/progression/assessment-submission.ts:496–518`.
**Requirement:** accepted contract §3.3/§3.3a requires tier-2 preflight before
mode/field evaluation, no later-tier evaluation after earlier failure, and
skipping tiers 3–4 on expiry.

Line 500 evaluates pinned item/response before state checks. Read-only
preflight occurs only for refused evaluation; valid structured requests go
directly to transaction checks. A well-formed request on an ended session
computes correctness/envelopes before SESSION_ENDED. An expired malformed
request evaluates fields before expiry handling. Error precedence and write
protection remain correct, limiting severity; this still violates ordering.

**Smallest correction:** shared read-only state check after pinned item
resolution and before item-dependent evaluation. Expiry enters existing
transactional expiry path without response evaluation; preserve all
transactional rechecks.

**Closure:** evaluator is not invoked for ended/terminal/duplicate/future-item/
expired requests. Preserve authorized success/refusal, expiry writes and
PA-12 competing-commit behavior; update D1/self-audit to actual order.

## R-2 — Minor; high confidence — Twelve-key fixture has ten keys

**Location:** frozen `tests/phase1/structured-practice-paths.test.ts:723–731`.
**Requirement:** contract §3.1 twelve-key boundary; exact-boundary evidence
under author accountability/self-audit R2.

Key `${'k'.repeat(63)}${i % 10}` repeats at indices 10/11; Object.fromEntries
overwrites them. Fixture contains ten distinct keys, so a regression refusing
11–12 keys would pass.

**Smallest correction:** twelve unique 64-character keys, e.g. 62-character
prefix plus two-digit index; assert count and key lengths before parsing.

**Closure:** exactly 12 keys accepted/13 rejected; retain 64/65-character keys
and 200/201-character value controls.

## Disclosures, validation and limits

D2 practice behavior is permitted by contract. D3 first unsubmitted ordinal
matches ascending selection/current-item retrieval. D4 malformed-JSON behavior
preserves legacy parity. D5 shared-client generation changed no frozen schema
or source. D1 ordering needs the correction above.

Author logs substantiate verify 1,955 tests/build, integration 314 pass/1 skip,
fake eval 3/3. Prior integrator 289 focused and TypeScript evidence attributed.
Reviewer did not rerun suites, access database/provider or mutate files.

Shadow warnings are expected for archive-only synthetic items: archive
resolution succeeds, while unchanged progression authorization uses current
catalog resolution; those fixtures were not injected there. Practice suite
injects its fixtures and asserts shadow/learning/mastery contributions, so
its refusal proof is nonvacuous. Warning does not prove full progression
coverage for archive-only assessment fixtures.

## Routing

**SWITCH TO: Claude Code forge-implementer / Sonnet**, original executor,
R-1/R-2 only; consolidate closure evidence, self-audit and freeze for Codex
changed-scope review. No new owner choice, main application, release, commit
or push approval. Further findings classified under orchestration procedure;
no unrelated full re-audit or scope expansion.
