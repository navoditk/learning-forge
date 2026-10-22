# RAT-SCORE-LEGACY — Public legacy parts characterization

## Live relay

- Phase: **DONE** — reviewed one-test patch accepted/applied; uncommitted.
- Next client/role: **Claude Code forge-implementer / Sonnet**,
  authorized successor `docs/agent-handoffs/RAT-SCORE-IMPL-CORE.md`.
- Owner replied **"approve"** to named execution scope on 2026-10-12:
  one new test characterizing nine public items, synthetic verification,
  then Codex review. No scoring behavior change.
- Owner subsequently confirmed other Learning Forge sessions stopped writing,
  clearing the conflicting claim cleanup condition. Integrator removed only
  conflicting claim metadata/empty directory and acquired a fresh claim.
- Base: `main`, HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, with
  accepted dirty documents/instructions; unrelated edits preserved.

## Approved ownership and deliverable

Sole worker-owned output:
`tests/content/legacy-parts-characterization.test.ts` (new).
Integrator alone edits shared status/packets. Follow accepted scoring
contract §6 and §8 L. Canonical/accepted strings for all nine pinned items
must match; characterize each negated canonical string and all fourteen
known-failure rows in §6.3, retaining current static expectations and explicit
V-7 expectation/status metadata. Assert UNMET count, distinguishing per-row
counts from deduplicated response counts. Characterization passing is not
V-7 correctness acceptance or repair.

Pin matcher and item bytes in tests/evidence so silent semantic drift fails.
Existing matcher/content/tests remain unchanged. Use synthetic inputs only;
no candidate/private-bank/learner data, database, provider, historical
attempt changes, rescoring or release. D-61 exception: none (no content).
If observed outcomes differ from frozen contract expectations, stop and
report to integrator; do not rewrite expectations to fit observations.

## Intake and implementation

Read AGENTS, live index/this packet, model and terminal-handoff procedure;
README, relevant numbered testing/architecture docs, latest PROGRESS and
Resume here/Current status; accepted contract §6/§8 and decision register.
Verify actual Sonnet from successful client metadata; unavailable/overridden
role blocks work rather than authorizing substitution. Claim bounded role
before writing, isolated worktree with allowlisted dirty inputs. You are not
alone; preserve others' work. Parent orchestrates without duplicating worker.

- `AGENTS.md`: `4fed9d8ed068f54e881387321c515a83e0bbb374dc0c6671b6a0d786bb2f8338`
- `docs/agent-orchestration.md`: `4a994fa8ff2f29a3d64b0d891313642ce8e0eca25f023b17a0f33cc0bb84b5ce`
- `docs/structured-response-scoring-contract.md`: `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`
- `docs/course-progression-decisions.md`: `a7834772e19e6767724e644f521c38269ab11596af6eb01a30bed262517181ee`
- `src/content/answer-matching.ts`: `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5`
- `tests/content/answer-matching.test.ts`: `4b6799887992bac25de79a71aca5c99f66f64b0c5c064a932d76a9ccdf1c3ae0`
- `tests/phase1/composite-parts-grading.test.ts`: `4a6b549219583714dd7b39d23fe0018a1a7c13e0396a5e263d4170eb75a8c97b`
- `package.json`: `3a9147959a922e3905a221cc55b5614f0727bbcff978c04b357a54a1ab93a405`
- `content/ratios/ratio-tables-2.json`: `10ace306b5fd0cf77915510a45cbeb3bcadd7cbc7457d2f16879f03a92511b88`
- `content/ratios/unit-rates-2.json`: `ea3b8c81aadb70032a23df09ac64ff0c9769d9546df053805484755c54a0b0fc`
- `content/expressions-and-equations/equation-and-inequality-meaning-1.json`: `29b4282fd3029ee5c2ffcd4ac23083e5a8f120dacfb0bacc256b1d5357a15967`
- `content/expressions-and-equations/equation-and-inequality-meaning-2.json`: `15c25bbfac719a430973cb5e3ae53657330ac04a01e92553a440ba92dd978362`
- `content/expressions-and-equations/one-variable-equations-2.json`: `66a57ed46133e9dc0dee0af45d94b54318aac77ac794b0139066e64b6acaff4c`
- `content/expressions-and-equations/real-world-inequalities-2.json`: `be1eaa1831b2dc995b5a139773daca97bb156d360a9259ec76e27e062a9fb3b1`
- `content/expressions-and-equations/variables-in-context-1.json`: `7e85e4a2b8465844d4ee91203e2e9b5f55af9f4e37339f0b9aecb760f9588f4e`
- `content/expressions-and-equations/variables-in-context-2.json`: `8fa2ad3bfc3f087e1dd46a4e8df5ce7cbf2b60c22b2d351ecf9764d27e8823ac`
- `content/geometry/prism-volume-2.json`: `570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d`

Live hashes must match before work. Pin further relevant public test/config
inputs in returned manifest; no full repository or private overlay.

## Durable local baseline

Seventeen allowlisted inputs preserved under
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-SCORE-LEGACY/baseline/`,
original relative paths. Manifest `manifest.json` SHA-256:
`1b80d77b4f552d52009814febf3da9aacc7036365ec2692ee014ccda16ab12d2`.
Verify copied inputs against live pins before overlay; repository status
files remain coordinator-owned. This local bundle is not committed/pushed.

## Validation and frozen handoff

Run focused `npx vitest run tests/content/legacy-parts-characterization.test.ts`
and required database-free `npm run verify` in isolated worktree. Existing
safe dependency reuse/install follows documented isolation; no production
access or real-provider calls. Stop/report any concrete gate failure rather
than changing unrelated files or suppressing tests. Report observed UNMET
count, fixture totals, commands/results and limitations explicitly.

Before freeze, author performs requirements/evidence self-audit per current
orchestration procedure. Return one-file patch, frozen test, exact SHA-256s,
input manifest and actual Sonnet metadata (model/record/time). Persist in
resolved common Git metadata `agent-handoffs/RAT-SCORE-LEGACY/`; do not apply
in main or edit shared status. Preserve evidence from any stopped run.

Integrator verifies patch reconstruction, scopes/hashes/evidence and marks
**AWAITING_REVIEW**; release claims and **SWITCH TO Codex forge-reviewer** /
`gpt-6.1-sol`. Cross-family scoring review mandatory. Owner acceptance and
application follow review; CORE/PATHS/UI execution, content and release
remain separately gated. No commit or push.

## Recovery prompt

Continue RAT-SCORE-LEGACY as Claude Code forge-implementer / Sonnet. Verify
relay/model/baseline, claim isolated one-test scope, implement contract §6
characterization, run focused tests/verify, self-audit and freeze evidence
for Codex review. Native "continue" is sufficient.

## Implementation returned (2026-10-12)

Author: Claude Code `forge-implementer`. Integrator read client transcript
metadata `subagents/agent-ac2fa1924fd4d426b.jsonl`: first assistant record
`64e490ee-3fd0-438f-bfe5-7f66d8a7fa44`, `2026-10-13T05:20:48.716Z` UTC; every
assistant record `claude-sonnet-5-5` (the worker could not see its own record
UUID). Claim acquired by a checked `mkdir`, then released; worktree (with
`node_modules` symlinked from main, no install) removed. Main unchanged.
Frozen under `<git-common-dir>/agent-handoffs/RAT-SCORE-LEGACY/`
(`baseline/` untouched):

- `legacy-parts-characterization.test.ts`, SHA-256 `8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d`.
- `RAT-SCORE-LEGACY.patch` (one new file against HEAD), SHA-256 `20d5cd0b4435dcc359fe5f5fcdc3d1841fbd417f98f28b55cfc1113509ff74f0`.
- `input-manifest.json` (17 pins, pinned/live/baseline), SHA-256 `e701b3a7d2ef46e8b9287da9a1ab2a932d88e3d9c6c199be71eaf388f882f37b`.
- `focused-vitest.log`, SHA-256 `55cc50ed5d24833eeb83cdc7b80ef1b49d778c7fda7e94232532ace309d5db92`.
- `verify.log`, SHA-256 `faad2829666f2af65a82d9ebdfc2471558df30fd1949608a4a49915c1477f941`.

Observed: 56 rows (9 canonical, 24 accepted, 9 negated-canonical, 14 §6.3
known-failure). UNMET 23 per row and 23 deduplicated by (item, response):
22 matcher-accepts/V-7-rejects (9 negations, 13 known failures) and 1
matcher-rejects/V-7-accepts (`real-world-inequalities-2` `≤`). Every observed
outcome equals the frozen static expectation; **no divergence**. Matcher and
nine item files are pinned by SHA-256 read at test time. Focused Vitest: 83/83
passed. `npm run verify` exit 0 (88 files / 1,749 unit tests; build
succeeded, with module-trace warnings only).

Self-audit: every requirement Met, except a mutation check of drift detection
(**Untested**; it relies on the hash assertions). The accepted rows include
the canonical string again (§6.2(1) reading); the reviewer should confirm.

Integrator verified: all hashes; the patch adds only the one test path;
`git apply --check` against main; independently reapplied the patch in a
throwaway worktree, reproducing the frozen test hash, and re-ran the focused
test (83/83 passed); claim release and worktree cleanup. The full verify was
not repeated.

## Codex review complete — 2026-10-13

Fresh host-selected `/root/rat_score_legacy_review`, `forge-reviewer` actual
`gpt-6.1-sol`: **ready for human review with noted risks**, 0 blockers/majors/
minors. Report `docs/rat-score-legacy-20261013-review.md`. Actual Sonnet
metadata, seventeen baseline inputs, five frozen artifacts and one-file
reconstruction verified. 56 response rows/23 UNMET counts supported; author
83 focused and 1,749 verify results corroborated by logs, prior integrator
focused execution. Reviewer did not repeat suites.

Existing scoring defects remain; drift mutation exercise untested, sound
hash assertions inspected. Optional row-title polish not blocking. No
artifact correction required or applied. No code/content/private/DB/provider
work, commit or push. Learner-visible increment: none, characterization only.

## Ready approval batch (two distinct gates)

1. Accept exact frozen test `8568e925...573d` and authorize one-file patch
   `20d5cd0b...74f0` application. Codex integrator verifies baseline/patch,
   applies only accepted bytes, reruns focused test and docs checks.
2. Authorize **RAT-SCORE-IMPL-CORE**, next contract §8 packet, Claude Code
   `forge-implementer` / Sonnet then Codex cross-family review. Owned:
   `src/contracts/content.ts`, new `src/content/structured-response.ts`,
   `validateContentCatalog` rules in `src/content/catalog.ts`, new
   `tests/content/structured-response*.test.ts` and `tests/contracts/`
   additions. Implement approved opt-in deterministic validator/parser/scorer,
   safe responseSpec/envelope helpers and load-time validation, accepted
   contract §§2/5 with D-155–D-163 selected choices. V-7 matrix/generator,
   PA-5/PA-6/PA-7 and `npm run verify`, synthetic only. No existing parts
   semantics/content/catalog imports, routes/storage-path/UI/schema changes,
   historical rescoring, database/private/provider/release work. Author
   self-audit/frozen patch/evidence then Codex review; owner acceptance and
   main application remain separate after review. No commit or push.

Both ready requests may be accepted together, separately or with overrides.
Neither currently approved by review. On gate 2 approval integrator prepares
and pins the named execution packet, then routes to Claude; no parent coding.

## Owner batch disposition and integration — 2026-10-13

Owner replied **"yes"** to both explicit gates: accept/apply reviewed legacy
test and authorize separate CORE execution. Codex integrator verified HEAD,
target absence, reviewed patch/test and seventeen baseline inputs; apply-check
passed, applied only patch `20d5cd0b...74f0`, verified final test
`8568e925...573d` and reran focused Vitest **83/83 passed**. Existing 23 UNMET
expectations remain, characterization repairs none. Full verify not repeated:
author's reviewed 1,749-test/build evidence remains, exact one-file integrated
bytes and focused gate verified. Test uncommitted; unrelated work preserved.

CORE authorization recorded in successor packet, **IMPLEMENTING**, one
Claude Code Sonnet worker then Codex review. No path/UI/schema/content or
broader execution authorized. Earlier waiting/unapplied entries historical.
