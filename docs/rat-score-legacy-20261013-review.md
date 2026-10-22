# RAT-SCORE-LEGACY — Independent characterization review

## Verdict and scope

**Ready for human review with noted risks.** No blocker, major or minor
correction findings in the assigned one-test scope. Characterization does
not repair scoring or establish V-7 acceptance.

Reviewer: fresh host-selected Codex `forge-reviewer`, fixed actual
`gpt-6.1-sol`. Author independently verified from Claude client metadata:
all 24 assistant records `claude-sonnet-5-5`, first UUID
`64e490ee-3fd0-438f-bfe5-7f66d8a7fa44`, `2026-10-13T05:20:48.716Z`.
Session `22bffa60-935a-47f3-a703-6ff9ab4853d0`, subagent transcript
`agent-ac2fa1924fd4d426b.jsonl`. Cross-family independence satisfied.
Base `main`, HEAD `3e7c33372599d20c285656c3610ca6e47743240f`.

## Frozen evidence

Artifacts under common Git metadata `agent-handoffs/RAT-SCORE-LEGACY/`:

| Artifact       | Verified SHA-256                                                   |
| -------------- | ------------------------------------------------------------------ |
| Test           | `8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d` |
| Patch          | `20d5cd0b4435dcc359fe5f5fcdc3d1841fbd417f98f28b55cfc1113509ff74f0` |
| Input manifest | `e701b3a7d2ef46e8b9287da9a1ab2a932d88e3d9c6c199be71eaf388f882f37b` |
| Focused log    | `55cc50ed5d24833eeb83cdc7b80ef1b49d778c7fda7e94232532ace309d5db92` |
| Verify log     | `faad2829666f2af65a82d9ebdfc2471558df30fd1949608a4a49915c1477f941` |

All seventeen live and copied baseline inputs match pins; baseline manifest
`1b80d77b4f552d52009814febf3da9aacc7036365ec2692ee014ccda16ab12d2`
verified. One new test path, 384 added lines, in-memory reconstruction
byte-identical to frozen hash. New file remains absent from main.

## Comprehensive requirement coverage

Line references concern frozen `legacy-parts-characterization.test.ts`.

| Requirement                                | Evidence/result                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nine pinned public items                   | Lines 58–171 list required identities, paths and hashes; 301–315 verify distinct identities/validators.                                          |
| Canonical and every accepted response true | Lines 205–222 generate 9 canonical/24 accepted rows. Canonical duplicated in accepted list follows §6.2(1).                                      |
| Nine negated canonical responses           | Lines 223–231 retain static true, V-7 reject, UNMET. Prefix removes no required part phrase.                                                     |
| Fourteen known-failure rows                | Lines 235–278 reproduce all contract §6.3 responses/outcomes, independently compared to actual parts.                                            |
| Static/V-7/status distinction              | Lines 187–203 define fields; 282–283 expose them in row titles; 325–328 check consistency.                                                       |
| Actual matcher assertion                   | Lines 341–348 invoke imported matcher against frozen validators/outcomes per row.                                                                |
| UNMET counts                               | Lines 354–374 assert 23 per row and 23 unique item/response pairs; 22 false accepts, 1 false reject.                                             |
| Drift pins                                 | Lines 35–38 hash bytes; 288–295 compare matcher/nine items with fixed independent digest literals.                                               |
| Scope and verification selection           | Comments/suite identify characterization; existing matcher/content/tests unchanged. npm test includes content tests; full log contains 83 cases. |

Static derivation confirms larger-number substrings, reversed clauses and
negations match. Unicode `≤` response matches neither the first part phrases
nor accepted whole strings, so static false is supported.

## Verification and limits

Hash-verified author focused log: **83/83 passed**. Full database-free verify
log: **88 test files / 1,749 tests passed**, successful build. Parent
integrator separately recorded independent focused run/reconstruction.
Reviewer did not repeat either suite; no files changed, mutating commands,
installs, agents, database/private-content access or provider calls.

Drift mutation exercise **untested**. By inspection, changing matcher/item
bytes fails fixed digest comparisons, barring SHA-256 collision. Mutation
execution would add evidence but is not another required gate.

Optional polish: line 377 says no accept row marked UNMET, though the Unicode
row is correctly UNMET. Assertion actually checks MET rows and is correct;
a more precise title is optional and does not block the frozen artifact.

## Remaining risk and routing

Passing tests preserve **23 unmet V-7 expectations**. `180, 16`,
`x = 240; 18 = 18` and nine negated canonical answers still match; correct
Unicode `≤` still fails. These existing defects are faithfully characterized,
not repaired or reclassified as acceptance.

First comprehensive review complete; no prior closure applicable. Any changed
artifact needs bounded follow-up review. Return to designated integrator for
owner acceptance/application of exact patch. Corrections, if required, return
to original Claude Code `forge-implementer` / Sonnet. No content approval,
broader execution, release, commit or push follows from review.
