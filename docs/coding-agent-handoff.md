# Cross-client resume index

Start here when continuing Learning Forge in Claude Code, Codex or Copilot.
Read `AGENTS.md`, then the terminal-handoff procedure and approved native
model mappings in `docs/agent-orchestration.md`. This index is a checkpoint,
not an approval register or an automatic task scheduler.

## Assigned preparation lanes — 2026-10-14

**Current continuation — 2026-10-20, D-184 Claude-coordinated window:**
owner "approve both recommendations". Window `2026-10-20T13:25:35Z` to
`2026-10-21T13:25:35Z`, 50 native invocations, ledger
`agent-handoffs/DELIVERY-COORDINATOR/claude-window-20261020/ledger.json`
(common Git). Claude Code integrator runs Opus forge-expert / Sonnet
forge-implementer workers and `codex exec` `gpt-6.1-sol` read-only reviews;
at most two concurrent workers, one per lane. D-185 abandons the held
dispatcher protocol smoke. Milestones and human gates unchanged from D-183.
Lane A: Ratios (RAT-CATALOG-IMPL scoping). Lane B: first usable Science unit
(gap scoping). Live packets and the ledger, not this paragraph, give phase.

**Coordinator switch — 2026-10-20, Claude Code now integrator:** owner
reported the Copilot monthly quota is exhausted and switched control to
Claude Code. The standing autopilot below **ended by its aggregate deadline**
(`2026-10-20T02:51:33.003Z`; 42/100 native calls charged; no automatic
aggregate renewal). The protocol smoke is unfinished: scoped format recovery
created successor enrollment `ad88a3ce...7fbc7e` and run `b8804a76`, which
expired at `01:29:47Z` with no recorded invocation; no pause file or native
process remains. C3 COMPLETE receipt, publication, dependent-ready, G3 and G4
are unproved. Stale Copilot `integrator.lock` archived (SHA `50e11223...018a`)
with `takeover-checkpoint.json` under common Git
`agent-handoffs/DELIVERY-COORDINATOR/standing-20261019/claude-takeover-20261020/`;
Copilot `run.json` left unchanged. **No new dispatch, enrollment or native
call is authorized** until the owner grants a new bounded window with Claude
Code as coordinator and decides whether to finish or abandon the smoke.
Codex `forge-reviewer` / `gpt-6.1-sol` remains the cross-family reviewer.

**Current technical continuation — 2026-10-19, STANDING BOUNDED AUTOPILOT:**
owner authorized **24 hours / 100 native invocations total with automatic
batch renewal**, ending on the approved milestones or either aggregate
limit. Start `2026-10-19T02:51:33.003Z`, fixed deadline
`2026-10-20T02:51:33.003Z`. Common Git
`agent-handoffs/DELIVERY-COORDINATOR/standing-20261019/authorization.json`
and `run.json` govern new dispatch; reservations/failures count.
No routine eight-call approval, aggregate reset/renewal or reopening of
previous runs. **C1/C2/C3 are accepted/applied locally**; do not re-audit
closed bytes. **Opus dispatcher contract returned, invocation twenty**:
verified actual model/schema/no denials and unchanged pinned inputs.
Original `dispatcher-design-report.txt` and parent
`dispatcher-contract-annotations.json` form the contract: no budget refund,
zero-call progress on still-active exhausted runs, recurring-finding cause
checkpoint, no implicit real-smoke enrollment.
**Current checkpoint: `DISPATCHER_REAL_SMOKE_ENROLLED`,
forty external native calls consumed, all ended; G1 complete.**
Native Codex40 returned READY0 on lifecycle rev6 `87ea7b3b...a5eaff4`;
C2L-01..04 are closed. Same original Sonnet35/37/39 corrected the initial
three majors/one minor and the recurring failed-outcome acknowledgement
cases. Cause checkpoints and all prior failures/reading omissions persist;
NaN was explicitly classified as a first-pass reviewer miss. Exact patch
applied locally and all fresh main groups pass: format/doc-format/
`npm run verify` (2,444 tests/build28)/whitespace, with 849 unowned root pins,
HEAD/index/aliases and unchanged C4 outputs intact.
`c2-stop-lifecycle-technical-acceptance.json`,
`dispatcher-technical-acceptance.json` and coupled application/main logs
record local engineering acceptance. The original failed
`dispatcher-application.json` remains unchanged for history.
Separately enrolled docs-class G2/G3/G4 smoke at `20:23Z`; enrollment
`35bcc5ec...fb45564`, scope `real-smoke-scope.json`, public requirements
`docs/agent-handoffs/DELIVERY-PROTOCOL-SMOKE.json`. Only runbook author
`DLV-DISPATCH-RUNBOOK` may execute: at most four native calls, stop on any
hold; `DLV-DISPATCH-SMOKE-DEPENDENT` is readiness-only and must not execute.
First controller drains its single real author step; subsequent one-step
serial restarts must select only the runbook. G2 author/review/C3 COMPLETE
receipt/publication/dependent-ready, G3 and G4 are unproved until captured.
No controller/native worker is active at this checkpoint. External debit is
40; future dispatcher C1 usage must be added ONCE, never copied into this
external call ledger. No root edits or outside calls during a smoke task flight.
The following chronology is historical; use live `run.json` for phase.
Native contract verified actual `claude-opus-5-5`, strict schema, zero
denials and unchanged source/input/root guards. Original report plus
`c2-stop-lifecycle-contract-annotations.json` govern; parent cross-checked
the expert's disclosed policy/status-read omissions. Sonnet twenty-nine
returned verified actual `claude-sonnet-5-5`, session
`4a9608c2-9cd8-4fc4-940d-130bd3385454`, strict output/no denials and
unchanged unowned/root/input guards. It executed nothing; its reading gaps
and raw source/report/hashes are preserved. Parent held before execution
on PF-01 incomplete fixture finalization, PF-02 post-deadline signals,
PF-03 descendant handler readiness and PF-04 missing-pid settlement.
Exact evidence: `c2-stop-lifecycle-preflight-checkpoint.json` and
`c2-stop-lifecycle-preflight-findings.json`.
The same original Sonnet call thirty failed native first-party **API429 /
`usage_limit_reached` / session quota**, without source changes.
Failed metadata/raw native result and both source snapshots remain preserved.
The single guarded timer **successfully resumed the same session at 19:02Z**.
Invocation thirty-one returned at 19:04:23Z, actual Sonnet, strict output,
zero denials and intact source/input/root guards. The timer has finished;
do not restart it or treat either old waiting status as a live process.
Parent static preflight preceded all execution. First host types failed on
missing fixture NODE_ENV; same author thirty-two inserted exactly the test
literal. Second host focused tests failed 107/108 on PF-01a's exit-gate/
cancellation-observation race. Both failures remain preserved, and
`c2-stop-lifecycle-fixture-checkpoint.json` records the recurring cause.
Same author thirty-three changed only that fixture to acknowledge cancellation
before exit, preserving every assertion. All six latest parent host groups pass:
scoped format, types, 108 focused/413 agent/2,432 full tests/build/whitespace.
Two-file rev3 `56f405d5...c42bf37` is frozen and reconstructs exactly;
854 unowned worker/851 root pins, HEAD/index/aliases/dependency link intact.
See `c2-stop-lifecycle-rev3-manifest.json`, full host logs and proof.
Next is the first comprehensive independent native Codex review of the new
correction; no native worker is active at this checkpoint. Root remains
unchanged and C4 unaccepted. Do not rerun any consumed host/timer helper.
Only child batches may renew within the unchanged aggregate; no quota bypass.
Only `scripts/delivery-accept.ts` and its existing agent test are editable.
This correction is also write-only: Read/Edit/Write/Glob/Grep, NO Bash or execution.
Parent has computed hashes/formatted, checked fixture safety and completed
focused/full validation; independent Codex follows. Verify actual model,
schema/no-denials/scope/unowned/root guards on return. Exact new scope and
baseline are `c2-stop-lifecycle-scope.json` and `c2-stop-lifecycle-baseline.json`;
old matching claim is preserved. `run.json` records the live phase. C4 rev2 is
independently READY and applied, but main validation failed twice; no
technical acceptance or real-client smoke. Stop unchanged-source retries.
Sonnet twenty-one returned the isolated five-path C4 implementation.
Parent held it before host execution for concrete fixture-lifecycle gaps
and the author's admitted unlisted `wc` command; original native validation,
source, report and unconfirmed verify exit remain preserved.
Same-author test-only correction twenty-two failed actual native
**API 429 / weekly usage limit**, with no source changes.
The single attached timer **successfully resumed the same Sonnet at
14:02Z / 07:02 Pacific** as invocation twenty-three, which returned at
14:16Z with native validation/no denials and four frozen outputs intact.
The timer is complete, not still waiting; no quota/account/model bypass.
Parent held twenty-three before host execution for remaining generic
`setInterval` group provenance and missing post-await membership validation,
plus another admitted out-of-scope tool-result Read.
`dispatcher-recurring-checkpoint.json` records the required cause checkpoint.
**Same Sonnet invocation twenty-four returned at 14:27Z**, native
identity/session/schema/no-denial and four-frozen-output guards passed.
Author reports 84 focused tests passing; no full suites or external
tool-result Reads in this role. Two earlier focused failures and a
comment-only descendant-marker bug (earlier assertions could pass trivially)
remain disclosed; the final marker uses a block comment and a live interval.
The first parent host inventory precheck failed before any tests because
the already-validated `node_modules` symlink was omitted from its inventory.
Original helper/failure are preserved; the exact-link inventory fix keeps
all target/type/pin guards. **All five host groups pass**, actual exit zero,
**349 agent/2,368 full tests/build**, with complete hashed stdout/stderr.
All 851 unowned worker/846 unowned root pins, HEAD/index/aliases/dependency
link, exact C1/C2 coupling and accepted guide prefix remain intact.
Frozen five-file C4 rev1 **`fd08e858...68df0ba`** reconstructs every output
via actual `git apply --no-index`.
Native Codex twenty-five returned **changes requested: three majors and
three minors**, actual `gpt-6.1-sol`, thread
`01a15498-6a89-7a42-8614-509832c77b69`. C4-01 deadline binding,
C4-02 recovery stop/deadline authority, C4-03 accounting origin,
C4-04 synthetic assertion-failure isolation, C4-05 pre-readiness detached
cleanup and C4-06 PID/liveness error handling all require correction.
Every counterexample is static, not reviewer-executed. Rev1 is not eligible
for application despite passing host tests.
`dispatcher-review-correction-checkpoint.json` records all six and the
required recurring-fixture cause. **Same Sonnet twenty-six returned at
15:12Z**, native identity/session/schema/no-denial and scope/root guards
passed. Dispatcher source/test and one new-guide-appendix paragraph changed;
C1/C2 remain byte-exact rev1 and existing tests/C3/unowned/root frozen.
Author reports all six corrected and **116 focused tests passing**, with
six earlier malformed-fixture cleanup failures disclosed. No full author
verify/typecheck/lint or tool-result retrieval occurred. These are author
claims, not independent finding closure.
**All five full parent rev2 groups pass**, actual exit zero and complete
hashed logs: **381 agent/2,400 full tests/build**, formatting and whitespace.
All 851 worker/846 root pins, HEAD/index/aliases/dependency link and exact
C1/C2 coupling/guide prefix remain intact.
Rev2 **`eb39b0d3...c30e9acb`** is frozen/read-only and all five outputs
reconstruct exactly. Native Codex twenty-seven returned **READY, zero
findings; C4-01 through C4-06 CLOSED**. The existing comprehensive review
is carried, not repeated. Rev2 was applied locally at `15:24:50Z`.
Main formatting passed but first agents failed 380/381: unchanged C2-03
received a live stop control-lock conflict. One bounded unchanged-source
diagnostic and full 381-agent recheck passed; full `npm run verify` then
failed the same C2-03 assertion with `kill EPERM` and one unhandled
termination-promise rejection (2,399/2,400 passed). No further retries,
no C4 technical acceptance/enrollment/smoke. Original failure, recheck
logs and before-recheck application are preserved separately.
`c2-stop-lifecycle-checkpoint.json` records source-derived interleavings,
not proven attribution, and unchanged five reviewed outputs/846 root pins/
HEAD/index. Read-only native Opus contract has returned for this coupled
stop/process lifecycle issue; separately pin the two-file exact
ownership/baseline for native Sonnet and independent Codex. Keep original
no-publication and stop assertions, add deterministic error/cleanup tests.
Do not edit C1/C2/existing tests under the old five-path C4 contract.
`dispatcher-baseline.json` pins 854 public regular inputs plus two aliases;
`dispatcher-scope.json` and `dispatcher-author-inputs.json` pin ownership,
composite contract, permissions and prompt. Initial role limit was
45 minutes/200 turns; scoped recovery is 40 minutes/200 turns.
Only the parent's matching claim was re-scoped, old claim preserved.
New dispatcher source/test, guide appendix, minimal C2 task filter through
three functions and C1's two forbidden-path entries only. C3 and existing
test files are frozen. There is no root delivery backlog yet; historical
planner/prototype inputs are not execution enrollment. No real native
adapter smoke, root backlog/facts creation or human-gate approval in this
implementation increment.
Parent prepared `host-dispatcher-rev1.mjs`,
`review-dispatcher-rev1.mjs` and `integrate-dispatcher-rev1.mjs` in the
standing packet. Host and review helpers have now run; integration has
passed syntax checks only and must not execute before independent READY
with zero required findings.
The early-recovery guard was exercised and refused dispatch without
changing the ledger or reserving a native invocation.
Host checks/freeze precede the first comprehensive native Codex review;
Integration refuses anything except independent READY/zero findings and
intact source/evidence/claim/root guards. Separately named rev2
host/review/integration helpers completed through application, but main
validation blocked acceptance. **Do not rerun either integration helper**:
the patch is already applied. The separately named main recheck also ended
failed and must not be rerun. Preserve every original artifact and failed run.

Native Claude `forge-expert` / Opus returned the C3 contract. Its first
handoff failed one exact root-guide Read; the failed call remains preserved.
An exact grant and same-session confirmation succeeded with no denials;
host proved the guide equals its accepted worker copy. Two of 100 calls
consumed. Contract manifest and confirmation are pinned, not human approval.

Native Sonnet returned **C3 journaled integration/recovery** and 61 new
tests. Its first handoff failed three denied tool attempts (command-list
inspection and an unlisted test filter), none executed. Same-author
read-only exact-Read recovery completed without denials or source changes;
both original failure and confirmation remain preserved.
Twenty-seven of 100 native calls consumed. The accepted C3 scope was exactly
five paths; `c3-baseline.json` pins 852 public inputs in a new isolated
worktree and `c3-scope.json` limits C2 coupling to two exports, the integration
lock guard and its regression test. No duplicate worker or source edits by
the parent. Independent host checks pass all five groups first pass,
228 agent/2,247 full tests/build, 849 unowned worker/844 root pins,
HEAD/index/aliases/dependency link and exact C2 coupling. Frozen C3 rev1
`c0bd6865...89de3fcf` reconstructs all five outputs.
Comprehensive independent native Codex review returned **three required
majors C3-01--C3-03**: publication run/backlog authority, exclusive live
recovery ownership, and current authority after the final snapshot before
fresh/resumed application. No additional required minors; C2 closures remain
carried. **Original Sonnet session `7ba12be1-561b-49b5-b817-f777e41ec463`
returned all three corrections together**, invocation six, zero permission
denials and validated native identity/output. Author reports 75 C3/242 agent
tests and 2,261 full tests/build passing. Unchanged five-path ownership.
Independent host rev2 checks pass all five groups, **242 agent/2,261 full
tests/build**, baseline/coupling integrity and actual five-output patch
reconstruction. Frozen rev2 `32440f2c...79c7c00` received native Codex
**C3-01/03 closed; C3-02 unresolved major**. No independent readiness or
root application.
Standing packet `c3-correction-scope.json` and `c3-correction-inputs.json`
pin the correction and exact grants. `c3-rev2-manifest.json`, host validation
and patch-equivalence evidence pin the reviewed candidate. The required
**recurring-major cause checkpoint** is recorded in
`c3-recovery-cause-checkpoint.json`: installation into a replacement live
outer generation and guard release before serialized outer retirement
remain unsafe in rev2. Original Sonnet returned both lifecycle corrections
together, invocation eight, validated same native identity and zero denials.
Author reports 78 C3/245 agent tests and final 2,264 full tests/build passing;
two prior full attempts failed unchanged C2 stop/control-lock and resistant
check/EPERM tests. Preserve failures; historical-race attribution is not
independently proved. No C2 process-control changes.
`c3-recovery-correction-inputs.json` pins that eligible resumption.
Child batch renewed automatically for the role window; aggregate usage and
deadline remain unchanged. **Host rev3 checks pass all five groups**,
245 agent/2,264 full tests/build, baseline/HEAD/index/alias integrity and
unchanged C2 coupling. Frozen rev3 `d3956642...a875bcc` reconstructs all
five outputs. Native Codex **closed C3-02**, carrying C3-01/03 and C2
closures. One directly affected **required minor C3-04** blocks readiness:
barrier fixture children can survive assertion/setup failures indefinitely.
`c3-fixture-cause-checkpoint.json` records exact test-only correction and
failure-path evidence. Same original Sonnet invocation ten failed native
API 429 `usage_limit_reached` after partial test edits, without a completed
handoff. Failed native output/process and immutable partial snapshot are
preserved in `c3-fixture-quota-checkpoint.json`; no success relabel.
Only `tests/agents/delivery-integrate.test.ts` is editable, with all four
other owned outputs frozen to rev3 and narrowed permissions.
**Quota recovery completed:** the single attached resumption dispatched at
06:12Z and same original Sonnet call eleven returned complete, zero denials,
all four frozen files unchanged. Author reports 89 C3/256 agent and 2,275
full tests/build passing. Quota failure/partial snapshot remain preserved.
Parent preflight found an invented-PID cleanup-error case sending real OS
signals to an assumed nonexistent group. **Host execution was held**;
`c3-fixture-preflight-checkpoint.json` and its immutable before snapshot
record the exact correction, not another paid review.
Original Sonnet call twelve returned that test-only correction, validated
same native identity, no denials and four frozen files unchanged. Parent
inspected the synthetic case: signals remain inside a scoped spy, explicit
TERM/KILL assertions and finally restoration; real owned-child tests retained.
Author reports 256 agent/2,275 full tests/build passing after one full verify
failure whose truncated output was not saved and cause is unidentified.
Record that evidence gap, not an unsupported C2 attribution.
**Host rev4 checks passed all five groups first attempt**, 256 agent/
2,275 full tests/build, frozen/pin/HEAD/index/alias integrity and exact
five-output patch reconstruction. Rev4 `9f98630f...498ed08` received
native Codex **C3-04 unresolved required minor**: asynchronous spawn error,
result-deadline signalling failure and exit-before-close ownership remain
incomplete. Real barrier failure cleanup and synthetic signal isolation
are corrected; all runtime/C2 findings remain closed.
`c3-fixture-lifecycle-cause-checkpoint.json` records the required pause/
cause/consolidated correction before resumption.
Original Sonnet invocation fourteen returned the test-only correction, but
**failed validation**: both exact verify-log redirections were denied;
neither executed, no named author log exists. Raw failure/report/source
preserved. `c3-fixture-errors-permission-checkpoint.json` routes to
**same-author read-only confirmation fifteen**, which passed native
identity/schema/zero denials and unchanged five-source hashes. No permission
bypass, retrospective log recovery or relabelled failed invocation.
Four other owned files remain frozen to rev4. The author's unchanged C2
stop/control-lock failure and identical-source rerun pass remain disclosed
without a causal claim. **Host rev5 passed all five groups first attempt**,
262 agent/2,281 full tests/build, complete hashed parent stdout/stderr,
849 worker/844 root pins and four non-fixture rev4 hashes intact.
Frozen rev5 `e0acbb12...3854f4b` reconstructs all five outputs.
Parent guard failure before reservation/spawn is preserved and corrected,
not counted as a native invocation.
Native Codex rev5 closed spawn-error/deadline-first/successful delayed-close
paths, but retained **required minor C3-04**: cleanup close failure drops
ownership without finalizing the outstanding result/cancelling its timer;
the later deadline can signal without ownership.
`c3-fixture-result-cause-checkpoint.json` records cause/counterexample and
consolidated finalizer correction before redispatch.
Original Sonnet seventeen returned a cleanup/result finalizer without
denials, 97 C3/264 agent tests after an unchanged C2 failure and identical-
source rerun. **Final full verify failed exit1**, unidentified truncated/
unsaved cause; no passing final full verify is claimed.
Parent pre-freeze inspection derived an overlapping termination signalling
after ownership drop: entry-only guard does not protect later signals after
an await. Static unequal-grace schedule, not executed; no host/review was
spent on known-incomplete seventeen. All five returned source outputs/
hashes and native report/failure preserved.
`c3-fixture-race-cause-checkpoint.json` records exact per-signal correction.
Original Sonnet eighteen returned the per-signal guard/mocked deterministic
overlap regression, validated actual model/session/schema/no denials and
four frozen files. Author reports intended mutant failure/revert and 265
agent/2,284 full-test/build summary; **full verify exit was not displayed**.
Do not turn its opening success claim into independently confirmed exit0.
**Host rev6 passed all five groups first attempt**, actual exit zero and
complete hashed stdout/stderr: 265 agent/2,284 full tests/build, 849 worker/
844 root pins and four frozen rev5 non-fixture outputs intact.
Frozen rev6 `fb625bc3...5668542` reconstructs all five outputs.
**Native Codex nineteen returned READY, zero required findings**: C3-04
cleanup/result and overlap are closed, prior runtime/C2 closures carried.
Exact five-file rev6 `fb625bc3...5668542` is **applied locally without staging**;
fresh claim/root-before/evidence/native-proof/integrity guards passed.
**Main checkout passed all five groups**, 265 agent/2,284 full tests/build,
and final integrity checks. C3 technical acceptance/application/main
evidence are persisted as `c3-technical-acceptance.json`,
`c3-application.json` and `main-c3-validation.json`.
Batch renewed for role time, aggregate not reset.
No denied redirect commands granted/requested. Host success is independent
evidence, not recovery of the author's undisplayed exit or prior failures.
`run.json` is authoritative; no duplicate worker,
runtime rework, model substitution or approval request.
`integrate-c3-rev6.mjs` has already applied the patch; **do not run it again**.
Its main checks and acceptance/application records are complete.
Preserve earlier failures without invented causation; no runtime rework or
another broad audit.
**Do not run rev2/rev3/rev4/rev5 integration helpers.**
C3 is technically accepted/applied. Continue separately scoped dispatcher wiring and
usable Grade 6 practice -> complete Ratios -> first usable Science unit
automatically inside the aggregate envelope; bypass human-blocked tasks
only for unrelated eligible work, never by inventing approval.

Copilot holds the new run's parent documentation claim. No duplicate worker,
blanket permissions, fleet, commit/push/deployment or protected-human-gate
change. Science remains unavailable. Coordination currently depends on the
active Copilot session/native clients; no always-on product watcher is
claimed. Auth/quota/stop controls remain effective.

**Previous completed increment — 2026-10-19, C2 ACCEPTED/APPLIED; RUN ENDED:**
the owner-authorized 120-minute/eight-native-call D-183 run consumed all eight
calls, with no automatic renewal. Original Sonnet session
`53548c78-0744-4c8d-9c1f-d9348645732a` completed C2; final independent native
Codex `gpt-6.1-sol` returned **ready, zero findings**, closing C2-05 and
carrying the other fifteen closures. Frozen rev9
`5519c634b74733d38d1078c5fa987494b62ffafceb90c1a0298bd320fc0d920a`
was technically accepted and applied locally under D-183 without staging.
Main validation passes all five groups, including 166 agent/2,185 full
tests/build, formatting/lint/types/migration check and whitespace. All six
output hashes, 841 unowned root pins, HEAD/index and portable aliases remain
intact. Exact own integrator claim released; no active workers or watcher.

Evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/autopilot-20261019/`:
`rev9-manifest.json`, `rev9-review-result.json` and native identity proof,
`c2-application.json`, `main-c2-validation.json`,
`c2-technical-acceptance.json` and terminal settlement. Every prior frozen
revision, failed run and metadata/alias/separator cause checkpoint remains
preserved. Rev7's historical stop/LOCKED failure and identical-byte recheck,
and the author's corrected new-test typing failure, remain disclosed.

**Successor: C3 journaled local integration/recovery** was not dispatched
inside that exhausted run. The new standing bounded authorization above
now governs its design and separately pinned ownership/baseline. Do not re-audit
closed C2 bytes or silently renew spending. Real C2 client adapter smoke,
executable-mode preservation, whole-local-state rewriting and the historical
process/lock race remain known limits. C2 alone is not product delivery
autopilot. Science stays unavailable; no human content/privacy/release gate
change, private/production operation, commit, push, deployment or activation.

**Previous checkpoint — 2026-10-18, C2 BLOCKED; FOLLOW-UP ENDED:**
all three explicitly authorized native calls are consumed; no workers,
watcher or automatic further dispatch. Own integrator claim released.
Final native Codex review closed the declaration-emission defect and
confirmed exact restoration of previously reviewed controls, but retained
**C2-05, major regression**: with safe `driver.ts` and unsafe `driver.cts`
siblings, `./driver.cjs` can select the wrong source for classification and
miss a persistence import. Fifteen original findings remain closed.

Frozen rev5 `92b34277...abd22a92` passes host 154 agent/2,173 full tests,
format/types/lint/migration check/build, 846 unowned pins and exact six-file
patch reconstruction; those tests do not cover the collision. The installed
compiler's `.cjs` -> `.cts` resolution was confirmed with an in-memory host,
not candidate execution. Next: original Sonnet
`53548c78-0744-4c8d-9c1f-d9348645732a`, a narrowly scoped compiler-faithful
resolver or explicit conservative refusal, exact collision/persistent-hold/
zero-call/B-continuation and valid-positive controls, then independent
changed-scope Codex verification after sufficient explicit bounded budget.
Do not replay closed reviews or expand import support opportunistically.

Current evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/c2-followup-20261018/`:
`rev5-review-result.json`, `final-resolution-mechanism.json`,
`terminal-cause-checkpoint.json`. Owner first authorized 30 minutes/two
calls, then explicitly added one call and a fresh 30-minute remaining
window, final deadline `2026-10-18T16:40:51.974Z`. Preserve both dispositions,
the exhausted prior eight-call run, every frozen revision and all failures.
Rev4's unrequested EPERM/lock changes were caught before paid review and
removed by the original author; five control functions match rev3 exactly.
No C2 applied, C3, product autopilot, automatic renewal, scope/policy/gate
change, private/production access, commit/push/deployment/activation.

**Previous bounded checkpoint — 2026-10-17 authorization, C2 run ended:**
the owner authorized another eight-native-invocation run and explicitly
extended its runtime to 120 minutes. C2 is **BLOCKED; RUN ENDED**: the original
Opus proposal was recovered with strict enum repair after a preserved timeout;
a fresh native Sonnet completed the isolated six-file implementation.
Host checks pass 121 agent/2,140 full tests, format/types/lint/migration
check/build and post-check baseline integrity. Patch `685d102d...a8ebe2`
is frozen; comprehensive independent native Codex review returned
**changes requested: 15 majors and one minor, C2-01–C2-16**. Original Sonnet
session `53548c78-0744-4c8d-9c1f-d9348645732a` completed the consolidated
correction and returned all sixteen closure rows, with no permission denials.
Rev2 `d2ab1270...1f9e31f` is separately frozen and independently host-validated:
142 agent/2,161 full tests, format/types/lint/migration check/build,
846 unowned hashes, both aliases and declared dependencies unchanged.
Actual patch application to preserved before bytes reconstructs all six
frozen outputs. Native Codex changed-scope verification closed twelve
findings but returned blocked on four unresolved majors, C2-05/07/13/14:
opaque imports, authentic host-check evidence, original-findings/complete
closure binding, and persisted continuation/legacy integrity.
Rev1 checks did not demonstrate the missing trust-chain/control cases;
the author's first all-sixteen closure claim was incomplete. The mandatory
cause checkpoint is recorded in `correction-targeted-cause-checkpoint.json`.
Same original Sonnet completed exactly those four within unchanged scope,
with complete closure evidence and no permission denials. Rev3
`2b0e33ee...6f1aba12` passes independent host 152 agent/2,171 full tests,
format/types/lint/migration check/build, baseline integrity and six-file
patch reconstruction after the final author edit. Final changed-scope
Codex closed C2-07/13/14 but retained C2-05 as a major regression: the scanner
uses emission for syntax diagnostics and throws on valid declaration files,
leaving the task eligible and potentially obstructing unrelated work.
Fifteen original findings are closed; C2 is not technically ready.
Installed-compiler mechanism reproduction and final root-cause checkpoint
are preserved; no candidate-code reproduction is claimed. Next is the
original Sonnet's narrow parse-only diagnostics fix with declaration-file
profile/dispatch positives and existing opaque-import/B-continuation controls,
then independent Codex verification. A fresh explicit bounded native budget
is required; no automatic renewal or routine engineering reapproval.
Do not restart a broad audit. No approved owner choice or policy changes.
C3 follows only
if sufficient implementation/review budget remains; it will not start in this
exhausted run. Own C2 integrator claim is released. Evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/c2-20261017/`. Prior budgets and failures
are preserved; eight of eight invocations are consumed, with fixed deadline
`2026-10-18T03:56:06.780Z`. The first author
returned only the C1 coupling delta; its early incomplete handoff and
partial files are preserved. The same verified Sonnet session completed
the unchanged scope; no native workers or watcher remain active. C3 will
not start in this run. Real-client
adapter smoke is still unverified.
No C2 source is applied. Resume from `terminal-checkpoint.json` and
`final-regression-cause-checkpoint.json`, not a stale review-active phase.
D-183 engineering acceptance remains valid, with no human-gate changes,
automatic renewal, activation, deployment, commit or push.

**Previous completed checkpoint — 2026-10-17, owner "go ahead":**
C1 is accepted/applied, separate from the failed broad prototype below.
Original verified Opus scoped the increment; original verified Sonnet
implemented/corrected it; independent verified Codex closed C1-01–C1-10
and returned ready/no findings. Exact rev3 patch `1fde1aa8...af65af` matches
the three main outputs: `scripts/delivery-state.ts`,
`tests/agents/delivery-state.test.ts` and the relay guide. Main agent tests
pass 78 (45 C1); default `npm run verify` passes 2,097 tests and build.
The actual C1 CLI leaves the human release gate blocked and selects
DLV-LINT-WORKTREES; that two-file lint/format cleanup is accepted/applied
after native cross-family Opus review, with foreign trees untouched.
The pinned read-only planning snapshot is evidence, not an enrolled queue;
reconcile `lint-acceptance.json` rather than replaying that completed task.
Next is C2 acceptance/permissions/credentials/required checks and runner
boundaries, then C3 journaled integration/recovery and dispatcher wiring.
No routine engineering patch reapproval is needed under D-183.
Run/evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/increments-20261017/`.
This run consumed eight of eight native invocations, with no automatic
renewal; checkpoint releases the integrator claim. No worker/watcher runs.
C1 alone cannot invoke models, prepare worktrees, approve gates or integrate
product patches; no product autopilot or learner release is claimed.
Preserve all old prototype artifacts and review/permission-failure evidence.

**Delivery coordination mandate — 2026-10-17 (D-183):** the owner selected
usable Grade 6 practice -> complete Ratios -> first usable Science unit and
delegated routine engineering acceptance through delivery. Do not interpret
SCI6-REGISTER DONE as the end of that mission. The historical broad DELIVERY-COORDINATOR
prototype is **BLOCKED_CORRECTIONS**: verified native Opus design and Sonnet rev1
implementation completed; fresh verified read-only Codex review returned
13 majors and one minor. Consolidated original-Sonnet correction reached its
seven-minute bound without a completed handoff. Preserve DC-01–DC-14, partial
snapshots, review/model proof and `outcome.json` in common Git
`agent-handoffs/DELIVERY-COORDINATOR/bootstrap-20261017/`. Rev1 and corrections
are not applied or ready; all native workers stopped. Next role at that checkpoint:
original Opus session `d8e399de-13f7-4300-8b76-8a889487cbcd`, bounded reduction
into run/planner state, acceptance/permissions, then journaled integration
increments, now superseded by the current C1 completion above. Reuse
counterexamples; no extra broad review or engineering
reapproval. The original bootstrap is nearly time-exhausted (six of eight
invocations); no automatic budget renewal. Integrator claim is released at
this checkpoint; verify claims before continuing.
The old single-task watcher is stopped; the broader coordinator prototype is
isolated and failed readiness, not running. D-183 does not fabricate missing content/privacy/
migration/manual/release facts or grant commit/push/deployment. Reconcile
current packets instead of replaying the stale session todo list.

Owner **"go ahead"** is recorded as D-167: concrete delivery preparation,
not content/schema/release approval. Use the explicit lane assignment below;
do not send every terminal into the same packet.

| Assignment                           | Active packet / phase                                                                                                   | Eligible next role and stop                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Ratios catalog design            | [RAT-CATALOG-DESIGN](agent-handoffs/RAT-CATALOG-DESIGN.md), DONE                                                        | Exact rev2 accepted/applied with R-3 acknowledged, uncommitted; no catalog implementation approved                                                                |
| A — next release preparation         | [PRACTICE-RELEASE](agent-handoffs/PRACTICE-RELEASE.md), DONE (S0)                                                       | D-175–D-181 recorded; local commit `059c7f6`; push/migration/deploy not granted; owner actions D-179/D-180                                                        |
| B — Science first-unit choices       | [SCI6-FIRST-UNIT](agent-handoffs/SCI6-FIRST-UNIT.md), DONE                                                              | U1–U7 approved D-168–D-174; D-173 engineering sign-off now recorded                                                                                               |
| B — next prerequisite implementation | [SCI6-PREREQ](agent-handoffs/SCI6-PREREQ.md), DONE                                                                      | Exact rev3 accepted/applied; isolated verify2,016/build pass; engineering sign-off recorded, SCI6-DRAFT next                                                      |
| B — Science drafts                   | [SCI6-DRAFT](agent-handoffs/SCI6-DRAFT.md), DONE                                                                        | Exact rev2 human content accepted/applied;219checks pass; D-182 authorizes registration execution, successor below                                                |
| B — Science registration             | [SCI6-REGISTER](agent-handoffs/SCI6-REGISTER.md), DONE (accepted/applied)                                               | Owner accept-and-authorize; exact13hashes match main,2052tests/build pass;67skills/134records, Science unavailable; uncommitted, no pending relay role or release |
| A — Ratios catalog implementation    | [RAT-INTEGRATE](agent-handoffs/RAT-INTEGRATE.md), Part A DONE; banks accepted (D-266); RI-5 NOT STARTED (window closed) | Owner: new window to run RI-5; merge banks into private package; D-216; D-242                                                                                     |
| B — First usable Science unit        | [SCI6-USABLE](agent-handoffs/SCI6-USABLE.md), SU-E3 APPLIED; AWAITING_HUMAN                                             | Owner: SU-H6 manual a11y, SU-H7 paid eval run (D-202), H9a facts; then H8 onward                                                                                  |
| Shared integration                   | Claim integrator.lock before shared writes                                                                              | Serialize integration/status; no broad staging, commit/push or release                                                                                            |

**Current registration disposition — 2026-10-17:** owner **"accept and
authorize"** accepts/applies exact reviewed patch `09bf08b8...ff968`.
All 13 main output hashes match; 2,052 tests and build pass. Main-only lint,
types and migration checks pass; standard verify lint scans pre-existing
nested Claude worktrees, which remain untouched. Main has 67 skills/134
records; Science remains unavailable with no Unit refs and 64 publishable
skills. Registration DONE/uncommitted; relay stopped and nothing queued.
Next is a separately scoped Science learner-availability/readiness proposal,
not an automatic activation, new authoring, release, commit or push.

**Historical technical-recovery disposition — 2026-10-17:** owner explicitly approves
the exact contract-test edit/freeze path and checkpoint read-only worktree
access under D-182. Validate relay corrections, preserve all partial work and
consumed runs, re-pin corrected launch and clear only the matching pause.
Resume the same Sonnet within 60 minutes/eight invocations; implementation,
independent fresh Codex technical review and in-scope corrections may proceed
automatically. Stop at final exact human patch acceptance/application or a
genuine scope/safety/failure/budget gate. Science stays unavailable; no blanket
permissions, policy changes, commit or push. See the packet's current checkpoint.

**Historical registration checkpoint — 2026-10-16:** approved reviewedAt added;
worker reports459targeted passes/full2,045pass1fail. Legacy-only live-catalog
contract test now conflicts with valid structured Science registration, but
its file is outside edit/freeze allowlist. No patch frozen. Status checkpoint
recorded gate then hit a Read denial for that exact worktree test path;
relay PAUSED.json remains, watcher exited. Actual native stdout verifies both
worker/checkpoint as Sonnet5.5. Next owner consolidated one-file test/allowlist,
narrow checkpoint Read and matched-pause recovery request in packet. No model
may clear pause/retry itself; D-182/content approvals remain valid.

**Lane B content checkpoint — 2026-10-16:** owner "approve" accepts
SCI6-C-A1/C-A2. SCI6-DRAFT DONE; exact9file patch27247a47...c5f applied,
219checks/0failures,9hashes match, uncommitted. Frozen pending_review metadata
preserved; actual human acceptance recorded in packet. No imports/availability.
Owner **"approve"** authorizes exact registration execution/metadata as D-182.
SCI6-REGISTER's first native attempt rejected the launcher's draft2020-12
schema before model execution. Owner now explicitly authorizes recovery:
preserve that consumed attempt, incorporate the verified draft-7 correction,
repin the corrected launch, clear the pause and restart bounded automation.
The new 113-input recovery baseline changes only three developer-tool files;
original artifacts remain immutable. Corrected startup reached verified
`claude-sonnet-5-5`, but its first Bash call was denied. Owner now explicitly
approves narrow task/checkpoint permissions and one further bounded recovery.
Both consumed runs are preserved, and all 113 baseline pins matched before
the three developer-tool inputs were updated in a separate scoped baseline.
Phase **IMPLEMENTING (scoped recovery prepared)**. Use the new permission
profile/helpers and automate approved technical execution/review/correction;
no blanket Bash, bypass, unlimited loop or model-made human acceptance.
Codex review and exact human patch acceptance/application remain required.

**Lane B integration checkpoint — 2026-10-15:** owner "accept and approve"
accepts exact rev3 and application/integrated verification. SCI6-PREREQ DONE,
8reviewed hashes match, uncommitted. Full verify passed in isolated checkout
(94files/2,016tests/build). Main lint scanned foreign nested worktree; that
worktree was preserved. Evidence and D-61 readiness in packet.
Owner **"approve"** now records the requested D-173 engineering sign-off.
Start conditions satisfied for exact three skills/six core practice drafts.
Active [SCI6-DRAFT](agent-handoffs/SCI6-DRAFT.md) is DONE: exactrev2
human content accepted/applied. D-182 registration execution approved;
SCI6-REGISTER native Sonnet via relay, no further full content review.
Availability/content acceptance/registration/release gates remain separate.
LaneA S0/owner manual/facts gates unchanged.

**Owner disposition — 2026-10-15:** user **"approved both"** accepts exact
Ratios rev2 and one-document application with nonblocking R-3 acknowledged,
and Science U1–U7 recommendations separately (D-168–D-174). Integrator applied
Ratios patch0dc5605e...acd8e and verified main43afa38e...dc5b. No bytes altered
for R-3; membership criteria, not erroneous global inventory, govern future
work. Science U5 is integrated/validated; owner engineering sign-off under
D-173 is recorded. Exact conditional drafting may now start in SCI6-DRAFT.

LaneA release preparation is complete at S0; owner manual/facts gates remain.
LaneB Science prerequisites/sign-off are complete. Next Claude forge-expert/
Opus in SCI6-DRAFT; no author currently active. Preserve one worker per
assigned lane and approved two-worker limit. No further authoring scope
request needed. No private access/registration/teaching/availability/deployment/
release permission follows. Claims released after checkpoint.
Existing/unassigned continuation still follows lane A. Resolve ambiguous
assignments before claiming, and never hop lanes to bypass a gate.

Read **Delivery-first successors and proposed parallel lanes** in
`docs/development-expansion-plan.md` for the next learner-visible sequence:
existing-content practice release -> complete Ratios -> first new-subject
unit -> unit expansion. The first PRACTICE-FIRST UI slice and PATHS are
already DONE; do not resume their historical correction assignments.
Read each live packet before dispatch. At ready human boundaries, batch
exact artifact acceptance and fully specified successor scopes, without
automatic code/content launch. Codex `forge-reviewer` / `gpt-6.1-sol` reviews
frozen outputs from either lane; verify actual worker IDs from client metadata.
Coordination here must not duplicate either worker.

**Approval batching (2026-10-12):** follow **Batched human approvals** in
`docs/agent-orchestration.md`. Present related, ready choices together with
per-decision recommendations, evidence, authorization scope and exclusions;
accept an unambiguous batch response without repeated confirmations.
Record each disposition separately. Existing gates and pending execution
scopes are unchanged.

**Review-loop accountability (2026-10-12):** all future handoffs use the
author self-audit/closure tables and reviewer coverage/change classification
in `docs/agent-orchestration.md`. Reload native roles before their next turn.
Do not reopen completed reviews. RAT-SCORE-DESIGN is complete; its historical
R-3/R-4 escalation is not a current assignment. Apply the closure-evidence
contract to the active catalog R-1/R-2 corrections and preserve earlier fixes.
Existing gates and frozen artifacts remain intact.

## Ordered relay and quota-conserving plan

**Current state (2026-10-11): TEACH-T2A (`56ea7b3`, `c248254`) and the
accepted resources nav/status fixes (`a02bbfa`) are integrated and pushed.
Independent local browser validation passed: 72 tests, one expected private-
package skip. Remote CI passed at `ccd6192` (run `38182079316`) and `332ef01`
(run `38182113951`); Pages passed at `332ef01` (run `38182113684`).
The old accessibility CI hold is cleared. Current documentation-only HEAD
`1b274cc` records that result; its CI/Pages runs were still in progress at
this checkpoint (later confirmed green). No advisory claim was present.
Row 6 brief packet `docs/agent-handoffs/LIFECYCLE-L2.md` is **DONE**:
the owner approved recommended H-01, H-02 (i)–(iv), A-1 and C-1 choices
against reviewed brief `docs/lifecycle-l2-decision-brief.md` SHA-256
`fbd345f3...b2fd`. The owner separately authorized G-12/G-13 synthetic
probes. Packet `docs/agent-handoffs/LIFECYCLE-L2-PROBES.md` ran on
2026-10-11 (claim released, container and scratch torn down): G-12 showed
the explicit-`BEGIN`/`COMMIT` and bare forms both left no object on failure
and the `psql` down path refused a nonempty table; G-13 V1 and V2 both
validated, applied and had no unexpected drift. Codex `forge-reviewer`
independently reviewed the evidence: **ready for human review with one minor
evidence-portability limitation**. The owner approved a **document-only L2a
preflight correction**; completed packet
`docs/agent-handoffs/LIFECYCLE-L2A-DESIGN.md` is **DONE**: Codex
cross-family review found no new correction; the owner accepted revision 4
and authorized its one-file patch application on 2026-10-12. Main worktree
preflight SHA-256 `e2765511...21dc` now matches the frozen reviewed artifact;
patch `1798ad3b...d7df` is applied, uncommitted. Existing R-01 portability
remains. Report: `docs/lifecycle-l2a-design-20261012-review.md`.
The owner approved the document-only **MATH6-RECONCILE** scope on
2026-10-12. Completed packet `docs/agent-handoffs/MATH6-RECONCILE.md` is
**DONE**: the owner accepted revision 3 and authorized one-file application
on 2026-10-12. Main worktree report `c80f184e...caec` exactly matches the
reviewed artifact; patch `786c905d...5436` applied, uncommitted. Review:
`docs/math6-reconcile-20261012-rev3-review.md`. The owner approved O-1/O-2
on 2026-10-12, recorded as D-149/D-150: retained 27-code production
structure with versioned refinements/evidence-rule requirement, and Ratios
plus extension first. The owner approved document-only **MATH6-RATIOS-PLAN**
on 2026-10-12. Completed packet `docs/agent-handoffs/MATH6-RATIOS-PLAN.md`
is **DONE**: owner accepted revision 3 and its one-file application.
Main worktree plan `a05d6865...9467` matches reviewed bytes; patch
`4a31f4c4...5947` applied, uncommitted. IC-1 document acceptance complete.
**RAT-SUBJECT** is **DONE**: owner accepted the advisory report and
explicitly named document correction on 2026-10-12. Active successor
`docs/agent-handoffs/RAT-SUBJECT-CORRECT.md` is **DONE**: owner accepted
and authorized applying the reviewed two-file correction on 2026-10-12.
Plan `c31c2101...9fbe` and register `ea36f47d...9e46` now exactly match
reviewed bytes; baseline patch `6df95ab8...2921` applied, uncommitted.
Owner approved **IC-2 / D-151**: measurement conversions under
`unit-rates@1.0.0`, placement only. Owner approved **IC-3 / D-152**:
keep `double-number-lines@1.0.0`, reviewed figures/complete text alternatives,
explicitly accepting any older arithmetic-only evidence continues counting.
Owner approved **IC-4 / D-153**: new Ratios lesson versions with corrected
references, keeping pilot `1.0.0` bytes frozen. Owner approved **IC-5 / D-154**:
option C and document-only **RAT-SCORE-DESIGN**. Active packet
`docs/agent-handoffs/RAT-SCORE-DESIGN.md` is **DONE**: owner accepted exact
revision 5 and authorized one-file application. Main contract
`docs/structured-response-scoring-contract.md` SHA `dda20ea7...9898` matches
reviewed bytes; patch `a18f8525...2971` applied, uncommitted.
Owner approved **OD-1 / D-155**, S-A JSON envelopes in existing attempt
columns, no schema migration. Owner approved **OD-2 / D-156**, malformed
fields refused with answer-independent format feedback and no attempt.
Owner approved **OD-3 / D-157**, no partial credit in v1; all required
fields correct for CORRECT. Owner approved **OD-4 / D-158**, item-level
practice correctness feedback only; assessment unchanged. OD-5 approved
as **D-159**, grammar per accepted contract §2.5. Owner approved **OD-6–OD-9**
as **D-160–D-163**: number/single-choice v1, split packets, structured-only
practice text projection, held-out structured items deferred pending separate UI.
Owner approved **RAT-SCORE-LEGACY** execution and confirmed other sessions
stopped writing for conflicting-claim cleanup. Active
`docs/agent-handoffs/RAT-SCORE-LEGACY.md` is **DONE**: owner accepted/applied
exact test `8568e925...573d`, patch `20d5cd0b...74f0`; 83 focused tests pass.
Owner separately authorized **RAT-SCORE-IMPL-CORE** in the same explicit
batch. Active `docs/agent-handoffs/RAT-SCORE-IMPL-CORE.md` is
**DONE**: owner accepted exact revision2, patch `78c17d72...deb1` applied;
all seven hashes match, integrated `npm run verify` passed outside sandbox.
Owner separately authorized **RAT-SCORE-IMPL-PATHS** in same explicit batch.
PATHS **DONE**: owner accepted exact rev2 `b100815f...577e` with nonblocking
R-3 evidence limit; applied15 hashes match, verify1,955/build,
integration319+1skip/fakeeval3 pass, owned synthetic DB removed.
Owner separately authorized first **PRACTICE-FIRST** UI slice. Active
`docs/agent-handoffs/PRACTICE-FIRST.md`, **DONE**: owner accepted exact
rev4 and conventions documentation scope. Patch `d184a9a5...87ed` applied,
7hashes match; integrated verify1,975/build/e2e102+skip/fakeeval3 pass,
owned temporary DB removed. As-built presentation doc updated. Uncommitted.
Owner approved **IC-6–IC-8 / D-164–D-166** on 2026-10-14: extension
volume values, teaching authoring/serving separation and document-only
catalog design. Active [RAT-CATALOG-DESIGN](agent-handoffs/RAT-CATALOG-DESIGN.md)
is **DONE**: owner accepted exact rev2 with R-3 acknowledged on2026-10-15;
patch0dc5605e...acd8e applied, main43afa38e...dc5b matches, uncommitted.
Next laneA PRACTICE-RELEASE readiness preparation, Claude Sonnet. LaneB
SCI6-FIRST-UNIT is DONE: U1–U7 approved as D-168–D-174; active successor
SCI6-PREREQ is DONE: exact rev3 accepted/applied and integrated verify passed.
D-173 engineering sign-off recorded; active SCI6-DRAFT, Claude Opus next.
IC-9 remains pending without A/B/C selection and does not block this design.
Legacy 23 UNMET remain; content/private access, catalog implementation,
lifecycle changes, activation and release gates remain separate.
Pages publication contents remain unreviewed; application deployment,
production migration and teaching first-write/serving/release approvals
remain closed.
The latest owner-approved mapping in `docs/agent-orchestration.md` selects
`gpt-6.1-sol` for future native `forge-reviewer` turns. Reload and verify the
effective role before dispatch; historical review identities stay unchanged.
Codex changed-hash review is complete; no worker is running. Do not spend
the remaining Copilot allowance on new research or implementation fleets.
Preserve it for narrow coordinator/status work and unforeseen recovery;
native continuation can begin before Copilot is fully exhausted.
No numeric credit estimate guarantees completion, and native client limits
are independent of Copilot usage.

### Concurrent Grade 6 checkpoint and safe resume

Reviewed main checkpoint `ed18540` includes Claude Code documentation commits
`949da59` and `ed18540`: D-148 now records 296 private draft assessment items
(24 full lesson banks, four full unit banks and one partial Ratios unit-bank
supplement). These commits change only the decision matrix and PROGRESS;
they do not integrate assessment content, activate units or change runtime.
The draft content remains outside Git and `pending_review`. Its reported
schema/grader verification is not independent pedagogical/content approval.
Private-package placement and digest confirmation, Ratios bank merging,
independent originality/accessibility/safety review, human content approval
and gated catalog/registry wiring remain separate work. This track is part of the shared plan. On 2026-10-11 the owner requested a
comprehensive Grade 6 Math integration plan:
`docs/grade-6-math-integration-plan.md`. It reconciles live production,
disconnected domain Unit/Lesson wrappers, the v2 candidate and private drafts
instead of commissioning duplicate content. Finish the active L2a design
review boundary, then request the document-only **MATH6-RECONCILE** packet
before further optional backlog breadth: Claude Code Opus inventory/crosswalk
-> Codex GPT-6.1 Sol review -> owner target-version/first-unit decisions.
This planning request does not authorize authoring, private-package access,
candidate promotion, catalog activation or release. L2/L3 completion is not
a universal prerequisite for that inventory; needed runtime capabilities
remain unit integration/release dependencies.

The owner authorized reconciling the shared log on 2026-10-10: retain the
committed Grade 6 entry alongside Codex's uncommitted T2a review/approval
entries and preserve unrelated edits. Do not blanket-stage PROGRESS or
overwrite it from either terminal's stale snapshot.

At the pre-integration checkpoint, the Claude terminal was instructed to stop
Grade 6 writes, reread the live relay, claim the Sonnet integration role and
validate in isolation. No advisory claim was present then; absence of a claim
does not establish that another session has stopped. The exact approved T2a
patch passed `git apply --check` against `ed18540`, and integrated-tree
validation subsequently passed before local commit `56ea7b3`. That role is
complete; do not resume its old integration/correction assignment or start
Grade 6 catalog wiring from these historical instructions.

For every continuation turn, read the active packet before dispatch:

- `AWAITING_REVIEW`, Claude-authored patch: Codex `forge-reviewer`,
  `gpt-6.1-sol` for future reviews. Claude Code must advise switching to Codex
  and stop.
- `CHANGES_REQUESTED`: follow the active packet's named Claude correction
  role; bounded implementation corrections use `forge-implementer`, `sonnet`.
  Current approved MATH6 document corrections return to original `forge-expert`, `opus`,
  within the already-approved reconciliation scope. Codex must advise
  switching and stop. New unresolved design scope still needs approval.
- `AWAITING_HUMAN`: either client requests the exact named approval and
  stops. Neither switching tools nor passing tests clears it.
- `READY_TO_INTEGRATE`: the packet's named integrator validates/applies only
  the approved frozen patch. A changed patch goes back to independent review.
- A claimed/running phase: wait for the named owner. A missing artifact,
  unsupported model or unknown author family is `BLOCKED`, not permission
  to substitute. Finish one role; update the packet/index and name the next
  terminal. Never silently take a later backlog task.

Use this order. Later rows are recommendations, **not implementation approval**:

| Order | Bounded task                                      | Client / role                                                                               | Prerequisite and stop                                                                                                   |
| ----- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1     | TEACH-T2A corrected patch review                  | **Done**: Codex parent validation; `forge-reviewer` / `gpt-6-sol` review                    | Exact `77cd03a7...e46bae6` patch; ready for human review with noted risks, including one privacy wording minor          |
| 2     | T2a migration/privacy decision                    | **Done**: owner approved the exact reviewed patch                                           | Approval recorded in TEACH-T2A; first-write and release gates remain                                                    |
| 3     | Approved T2a integration                          | **Done (`56ea7b3`)**: Claude Code `sonnet`                                                  | Exact approved patch only, isolated synthetic validation; changed code needs Codex re-review; no writer or serving      |
| 4     | `/resources` navigation accessibility             | **Done and pushed (`a02bbfa`)**                                                             | Reviewed and human-accepted CSS; local and remote accessibility checks passed; no test suppression                      |
| 4a    | Geography source-status browser assertion         | **Done and pushed (`a02bbfa`)**: Claude Code Sonnet integrator                              | Exact accepted test-only patch applied; subsequent independent local browser validation and remote CI passed            |
| 5     | Reviewed commit/push checkpoint                   | **Done**: owner-authorized push, remote CI green at `332ef01`                               | Pages deployment succeeded; publication review and production migration/application release remain separate gates       |
| 6     | Lifecycle L2 prerequisite/probe decisions         | **Done**: owner choices and G-12/G-13 probe evidence reviewed                               | Approved next packet `LIFECYCLE-L2A-DESIGN`; migration/privacy and implementation gates remain                          |
| 6a    | L2a preflight correction for `0018` and probes    | **Done**: Opus authoring, Codex review, owner acceptance and application                    | Exact revision 4 applied; migration/privacy choices remain separate                                                     |
| 6b    | Grade 6 comprehensive curriculum reconciliation   | **Done**: Opus authoring, Codex review, owner acceptance/application                        | Reviewed revision 3 applied; O-1–O-18 decisions remain separate                                                         |
| 6c    | MATH6-DECIDE target structure and first unit      | **Done**: D-149/O-1 and D-150/O-2 approved                                                  | Direction/selection only; other choices and execution scopes remain separate                                            |
| 6d    | MATH6-RATIOS-PLAN remaining first-unit choices    | **Done**: Opus authoring, Codex review, owner acceptance/application                        | Exact revision 3 applied; IC-1 complete, IC-2–IC-9 remain                                                               |
| 6e    | RAT-SUBJECT Ratios scope and reuse check          | **DONE**: advisory report accepted; correction scope authorized                             | Accepted plan §5.1; existing sources and public/candidate items only                                                    |
| 6f    | RAT-SUBJECT-CORRECT boundary wording              | **DONE**: exact correction accepted/applied                                                 | Reviewed two-file patch `6df95ab8...2921` applied; IC-2–IC-5 approved as D-151–D-154; RAT-SCORE-DESIGN next             |
| 6g    | RAT-SCORE-DESIGN structured response contract     | **DONE**: rev5 accepted/applied; OD-1–OD-9 selected                                         | Contract `dda20ea7...9898`, closure evidence `908da290...675d`; OD-1–OD-9 and implementation separate                   |
| 6h    | RAT-SCORE-LEGACY parts characterization           | **DONE**: accepted/applied; CORE execution authorized                                       | Frozen test `8568e925...573d`, patch `20d5cd0b...74f0`; 23 UNMET; owner application gate follows                        |
| 6i    | RAT-SCORE-IMPL-CORE                               | **DONE**: accepted/applied; PATHS authorized                                                | Rev2 patch `78c17d72...deb1` (R-1 test-only fix); routes/UI/schema excluded; owner application gate follows             |
| 6j    | RAT-SCORE-IMPL-PATHS                              | **DONE**: rev2 accepted/applied; integrated validation passed                               | Services/routes/S-A storage/tests; synthetic integration/fake eval then Codex review; UI/content/schema excluded        |
| 6k    | PRACTICE-FIRST first UI slice                     | **DONE**: rev4 accepted/applied; conventions documented                                     | Existing Grade6 app structured fields/text/errors/browser evidence, synthetic fixtures only; Codex UI review then owner |
| 6l    | RAT-CATALOG-DESIGN                                | **DONE**: exact rev2 accepted/applied with R-3 acknowledged                                 | D-166 authorizes one document; C-7 options unselected, then Codex independent review and human acceptance               |
| 7     | Blocked Python increment                          | Claude Code Sonnet corrections; Codex independent review                                    | First resolve execution evidence, persistence/route-test gaps and authorized synthetic environment; no broad authoring  |
| 8     | Six approved source-reference integrations        | Claude Code `forge-implementer` / `sonnet`, then Codex `forge-reviewer`                     | Narrow mechanical documentation scope; no repeat research or content authoring                                          |
| 9     | Shared bank/completion/teaching-serving contracts | Claude Code `forge-expert` / `opus`, then Codex `forge-reviewer`                            | One contract at a time, approved source/design scope and consumed decisions; T3/T4 choices are still open               |
| 10    | First-unit content, then runtime/UI release       | Claude Code Opus authoring; Sonnet implementation; Codex review after each frozen increment | Scoped D-61/content/store/volume approvals, human content and release gates; no automatic authoring from the roadmap    |

Codex's configured reviewer is read-only. The Codex parent/integrator runs
authorized synthetic validation with normal permission prompts in its own
scratch environment, then supplies frozen source/results to that reviewer.
Do not relax the reviewer's sandbox for database setup or let the reviewer
modify source. If permissions prevent validation, report the missing evidence.

Wrong-order response must name **SWITCH TO: Codex, forge-reviewer** or
**SWITCH TO: Claude Code, forge-implementer/forge-expert**, the task packet,
one bounded next action and the stop condition. Launch plain `codex` or
`claude`; "continue" is enough if idle. No pasted task instructions or model
launch flags are required by the repository procedure. This is instruction
routing, not a technical enforcement layer or an automatic live-model switch.

## Checkpoint and authority

As of 2026-10-10, teaching T1 is integrated after Sonnet 5.5 implementation
and GPT-6.1 Sol cross-family review. It adds disconnected schemas and synthetic
tests only. `npm run verify` passed: 85 files / 1,641 tests, formatting, lint,
types, down-migration presence, fake evals and build.

The five AMC 8, MOEMS, Kangaroo, MATHCOUNTS and Spelling first-unit designs
are accepted; the shared catalog foundation is integrated. They are not
active courses and no full-course content-authoring packet is authorized.

Read current counts and scopes from the decision matrix, not an old snapshot
here. Another session recorded D-148's narrow private assessment-drafting
exception; it does not authorize this teaching task or general course authoring.
Contract acceptance and D-139/D-142 approve T1 only.
Use `docs/course-progression-decisions.md` for exact scope and
`docs/course-progression-review/manual-gate-record.md` for release authority.
`docs/course-progression-handoff.md` is the detailed progression entry point.

Completed packet: `docs/agent-handoffs/TEACH-T2A.md`, isolated schema/privacy-
coverage/migration draft and disposable local scratch validation authorized
on 2026-10-10. T2 proposal/review accepted, D-145–D-147 approved. Sonnet
returned a frozen 14-file draft. GPT review returned **changes requested**:
three majors and one minor; see
`docs/course-progression-review/teaching-t2a-20261010-review.md`.
Bounded Sonnet corrections have returned as an 18-file frozen patch; Codex
changed-hash review returned ready for human review with noted risks. The owner
approved exact-patch migration/privacy integration on 2026-10-10. Integration
and changed-hash review completed; commits `56ea7b3`/`c248254` are pushed.
Do not redispatch T2a. Lifecycle L2 prerequisite/probe decisions were scoped,
authored and reviewed in the later row 6 packet. The owner choices and
separate synthetic-probe authorization are recorded there; follow the active
probe packet for the bounded next action. Human migration/privacy approval
must precede later L2a implementation. At a new session, inspect files,
claims and current authority before work. The local resource-browser server
is not needed; do not restart it.

## Local checkout warning

Reviewed publication/source, recall/lifecycle, catalog, teaching T1/T2a,
Grade 6 D-148 and resources/reviewer checkpoints are now on origin following
the owner's explicit push authorization. Latest inspected main HEAD:
`1b274cc`. Re-read HEAD, remote state and worktree status; other sessions can
advance them. The earlier local-only/push-held instructions are superseded
for these completed checkpoints, not blanket authorization for future pushes.

For an isolated writer, the integrator still supplies allowlisted overlays
and hashes for uncommitted dependencies and records the effective baseline.
Never reset another session's work, pull over conflicting edits or copy the
whole directory. Only the claimed integrator edits shared status/schema files.
The original T2a patch/evidence remains preserved under common Git metadata
`agent-handoffs/TEACH-T2A/` for historical recovery; integrated code and review
records are tracked. Do not apply the old patch again.
Geography/Olympiad prerequisite drafts and advisory reports are checkpointed
as pending documents on owner request, not approved inputs. Their revision-2
hashes match the reports, but original-author provenance remains unresolved
under SOURCE-PROVENANCE; report-attributed model witnesses alone do not clear
that coordinator gate. Source review, human decisions and D-61 authoring
authorization remain separate requirements. Older
progress-log edits are also preserved outside the checkpoint commits.
A clean clone has the pushed code/review records, but must report missing
local artifacts rather than infer access to private banks or Git-metadata
evidence bundles.

All accepted course specifications and completed review dispositions are in
`docs/` and the T1 code/tests are in `src/`/`tests/`; they do not require
Copilot chat history. Preserve isolated worktrees until any still-needed
patches have been accounted for.

## Outstanding work and routing

Rows below are priorities/dependencies, not permission to execute all of them.
For implementation, prefer Claude Code Sonnet; use the approved Codex
bounded model only for a separately allocated task or quota fallback.

| ID / next bounded task                                                                 | State and prerequisite                                                                                                                                        | Executor → reviewer                                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| TEACH-T2-PROPOSAL: writer-free delivery context/event persistence and privacy proposal | **Proposal + independent review complete; accepted by owner**; D-145–D-147 approved                                                                           | Copilot Opus 5.5 → GPT-6.1 Sol; native relay uses Opus → GPT-6-Sol                            |
| TEACH-T3 writer boundary                                                               | T2a is integrated and pushed; D-143/D-144, diagnostics redaction and separately reviewed privacy wording remain open before writers                           | Scoped Opus design → Sonnet implementation → Codex GPT-6.1-Sol review                         |
| TEACH-T4 interlock/serving                                                             | Needs D-100/D-102/D-140/D-141, complete exposure/assignment/result participation, activation protocol, shadow/permanent enforcement, content and manual gates | Opus design → Sonnet implementation → Codex GPT-6-Sol review                                  |
| BANK-CONTRACT: remaining bank kind, manifest and historical resolution                 | Needs one bounded scope; D-75 covers only shared catalog access                                                                                               | Opus design → Sonnet implementation → Codex GPT-6-Sol review                                  |
| COMPLETION-CONTRACT: ordinary completion/practice sufficiency                          | Open per-program choices, D-31 skip and completion/mastery separation preserved; no silent threshold defaults                                                 | Opus design → Sonnet implementation → Codex GPT-6-Sol review                                  |
| COURSE-AUTHORING: first-unit content for each of five programs                         | Needs exact unit/skills/roles/volumes/store and scoped D-61 authoring authorization; existing content defects are separate dependencies                       | Claude Code Opus → Codex GPT-6-Sol; human content approval                                    |
| COURSE-RELEASE/UI                                                                      | Runtime, content, representative shadow and manual gates required; no deployment inferred                                                                     | Claude Code Sonnet → Codex GPT-6-Sol; human release approval                                  |
| PYTHON-CONTRACT                                                                        | **Blocked**: isolated patch, execution-environment evidence, persistence/migration review, route tests and independent implementation review                  | Claude Code Sonnet corrections → Codex GPT-6-Sol; no database operations before authorization |
| LIFECYCLE-L2                                                                           | H-01/H-02/A-1/C-1 approved; G-12/G-13 probes reviewed; L2a draft still stale at `0018`, migration/privacy and implementation approvals open                   | Opus for unresolved L2a design; Sonnet implementation → Codex GPT-6.1-Sol review              |
| SOURCE-PROVENANCE                                                                      | **Blocked**: Geography/Olympiad substantive reviews integrated; original author models unverified                                                             | Recover actual client metadata; an LLM cannot invent provenance                               |
| SOURCE-INDEX                                                                           | Deferred: six approved Science/Social Studies/AMC/MOEMS/Kangaroo/MATHCOUNTS reference-row integrations                                                        | Sonnet mechanical integration → Codex GPT-6-Sol; no new research or authoring                 |

Native models configured in project roles: Claude Code `sonnet` / `opus`;
Codex `gpt-6.1-sol` for review, `gpt-6-sol` for the unchanged expert/default
configuration, and `gpt-5.6-luna` for approved
bounded implementation. No launch flags are required. Verify current
availability and resolved identity.
If execution is allocated to GPT, review goes to Claude Opus, not GPT.

## Evidence pointers for unresolved tracks

- Teaching: `docs/teaching-delivery-exposure-contract.md`,
  `docs/course-progression-review/teaching-delivery-exposure-20261010-review.md`,
  `docs/course-progression-review/teaching-t1-20261010-review.md`.
- Lifecycle: `docs/learner-session-l2-persistence-preflight.md`,
  `docs/learner-session-l2-persistence-review.md`,
  `docs/learner-session-lifecycle-design.md`.
- Sources and prerequisite contracts: `docs/curriculum-sources.md` and
  `docs/curriculum-dossiers/`; use exact program dossiers, not the old
  planned-status rows in the expansion table.
- Python incident status: no concrete database writes are established.
  Unset `DATABASE_URL` does not prove a connection occurred. Do not assume
  either contamination or safety, and do not run integration commands to
  investigate without an approved synthetic environment.

The isolated Python implementation worktree is locally discoverable with
`git worktree list --porcelain` (name `python-contract-implementation`).
It remains under the original Copilot session's local files directory,
not integrated or portable to another machine. A future scoped investigator
must pin its actual diff/hash and identify non-sensitive evidence before
claiming readiness. Neither this index nor the source prerequisite proposal
is a substitute for that missing implementation packet.

## Launch and first prompt

### Zero-parameter intake

Launch plain `claude` or `codex` from the repository. Root instructions
automatically direct the first task turn to this index; you do not need to
paste the prompts below or select a model. A short "continue" is sufficient
if the interactive client waits for input. This setup does not synthesize a
user turn or start paid work merely because a terminal opened.

Claude's project default is Sonnet; Codex's is the approved native GPT Sol.
Native `forge-implementer`, `forge-expert` and `forge-reviewer` definitions
select role-specific worker models. The parent identifies the eligible
approved packet and uses at most one appropriate role worker; it does not
duplicate the work or run a same-family independent review.

**Active next role — lane B:** AWAITING_HUMAN one contract-test path/scoped
checkpoint Read/relay-pause recovery, SCI6-REGISTER packet. No freeze or patch
acceptance yet. Preserve current12isolated owned edits and all consumed runs;
no repeat content approval or broad permission request.

**Current intake result:** T2a and resources nav/status integration, review,
owner-authorized push and remote CI confirmation are complete. Do not repeat
those roles. First-write/serving/release gates remain. Lifecycle L2 brief
revision 2 completed Codex review, and the owner approved the recommended
H-01/H-02/A-1/C-1 choices and separately authorized the §7 G-12/G-13
synthetic probes; those ran and completed Codex independent evidence review.
The owner-approved L2a correction completed Opus authoring, Codex review
and owner acceptance/application. `LIFECYCLE-L2A-DESIGN` is **DONE**;
main worktree holds reviewed revision 4 `e2765511...21dc`, uncommitted.
The owner approved the document-only **MATH6-RECONCILE** scope.
`MATH6-RECONCILE` is **DONE**; exact revision 3 is accepted/applied.
O-1/O-2 are approved as D-149/D-150, target direction and Ratios-plus-extension
first-unit selection only. MATH6-RATIOS-PLAN is **DONE**, exact reviewed
revision 3 accepted/applied; IC-1 complete. Owner authorized **RAT-SUBJECT**
under plan §5.1 and accepted its advisory report. Active successor
`docs/agent-handoffs/RAT-SUBJECT-CORRECT.md` is **DONE**: exact two-file
correction accepted/applied. IC-2 approved as D-151, measurement conversions
under `unit-rates@1.0.0`, placement only. IC-3 approved as D-152, keeping
`double-number-lines@1.0.0` with actual representation tasks and explicit
older-evidence limitation. IC-4 approved as D-153, new Ratios lesson versions
with corrected refs and frozen pilot bytes. IC-5 approved as D-154. Active
`docs/agent-handoffs/RAT-SCORE-DESIGN.md` is **DONE**, exact revision 5
accepted/applied. OD-1 approved as D-155, S-A existing columns. Next request
**RAT-SCORE-LEGACY** is DONE, exact accepted test applied/83 focused pass.
CORE **DONE**, exact rev2 integrated and verify passed. Active
PATHS DONE, accepted exact patch integrated and synthetic gates pass.
Active `docs/agent-handoffs/PRACTICE-FIRST.md`, DONE: exact rev4 applied/validated,
as-built conventions documented. IC-6–IC-8 approved as D-164–D-166.
RAT-CATALOG-DESIGN DONE, exact rev2 accepted/applied with R-3 acknowledged.
SCI6-FIRST-UNIT DONE, U1–U7 approved D-168–D-174. Active next laneA
PRACTICE-RELEASE S0 is recorded. LaneB SCI6-PREREQ DONE; D-173 engineering
sign-off recorded. SCI6-DRAFT authorized, Claude forge-expert/Opus next.
IC-9 pending; does not block design.
Content/private access, implementation and release remain separately gated.
Do not repeat completed reviews or infer recommendation approval.
When an integrator assigns an approved packet, it records its path and
eligible next role in this index so the other terminal needs only "continue".
After completing a role, tell the human **SWITCH TO: Codex** or
**SWITCH TO: Claude Code** and name the packet. Keep the full pasteable
prompt only as a fallback for clients unable to load project instructions.

Project trust, higher-priority local/managed settings and installed client
support can override/disable defaults or roles. Verify loaded configuration
and actual response model evidence before claiming role selection. Do not
edit a user's global settings, bypass permissions or silently choose an
unapproved model. Native role dispatch selects a worker; it does not rewrite
the live parent model or transfer conversations.

Open two terminals in the repository:

```bash
claude
# In the other terminal:
codex
```

Keep normal permission prompts enabled. The configured expert role handles
Opus work; do not use Sonnet to silently resolve an open design.
An already-running client must explicitly reread changed instructions or
restart: do not assume root-file edits update its current context.

Recovery prompt only if automatic instruction intake fails:

> Read AGENTS.md, docs/coding-agent-handoff.md and the terminal-handoff
> procedure in docs/agent-orchestration.md. Verify your actual model selection.
> Inspect the current HEAD, dirty worktree and task claims without modifying
> code. Use the progression handoff and decision matrix for current authority.
> Report the smallest next issue, its exact missing approvals and which
> client/model should execute and review it. Do not start implementation or
> create another fleet. If designated integrator, acquire its claim before
> shared edits. End with the precise approval request or terminal-switch
> prompt. Do not access databases/providers, restart servers, commit or push.

Recovery prompt for an approved packet if automatic intake fails:

> Execute only the assigned role in docs/agent-handoffs/<task-id>.md.
> Verify its artifact hashes and effective baseline, claim its owned scope
> and preserve other work. If reviewer, remain read-only. If implementer,
> follow approved values only and run applicable deterministic checks.
> Return findings or a frozen allowlisted patch with exact results to the
> integrator. Stop at the packet's boundary and emit the required SWITCH TO,
> WAITING FOR HUMAN APPROVAL or BLOCKED message with the next pasteable prompt.

## Portability limits

This is a human-operated relay. Agents guide the next action; they do not
transfer live conversations, control another terminal or bypass client quotas.
Claude/OpenAI access and limits are separate and must be verified in those
clients; this document makes no subscription or capacity guarantee.
Changing client cannot clear a human approval or cross-family review gate.

For another machine or a fresh clone, first arrange an explicitly approved
reviewed commit or allowlisted safe artifact transfer. Uncommitted state,
Git-metadata claims/patches and Copilot session artifacts do not travel with
a clone. Never transfer secrets, child data or private banks in a handoff.
