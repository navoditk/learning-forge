# Bounded local agent relay

Owner requested this local automation on 2026-10-16 to replace routine
Claude/Codex terminal switching. It does not authorize any pending product
packet, content registration, patch application, release or additional lanes.
The procedures and actual-model rules in `agent-orchestration.md` still govern.

## Operation

Run from the coordinator checkout, not a worker worktree:

```bash
npm run agents:relay -- status
npm run agents:relay -- once
npm run agents:relay -- watch --execute --max-minutes 60 --max-dispatches 8
```

`once` and `watch` are dry runs unless `--execute` is present. A dry run
identifies one ready ticket without invoking either model. With execution
enabled, the watcher checks the local queue every 15 seconds, invokes no AI
while idle, and serializes work. Checkpoints count toward the dispatch limit.
The time limit includes active clients. Set `--interval-seconds`,
`--max-minutes` (1-240) and `--max-dispatches` (1-50) explicitly as needed.
These are execution bounds, not guaranteed currency/token budgets.

This is a foreground, same-machine process. It needs the machine awake,
local CLI authentication and ordinary project permissions. It starts fresh
headless CLI turns, not keystrokes in existing terminals. The current
implementation runs one client at a time; it does not expand the approved
two-lane concurrency ceiling. Do not run an interactive client against the
same assignment concurrently.

The state directory is `agent-relay/` inside the resolved common Git directory.
It contains `queue/`, `runs/`, a singleton `watcher.lock`, and optional
`STOP`/`PAUSED.json`. CLI output is local and excluded from Git, but may
contain task details: keep tasks synthetic/non-sensitive and do not upload
logs, prompts or this directory wholesale.

```bash
npm run agents:relay -- stop
```

Stop is checked once per second, including during a managed client call.
Ctrl-C also terminates the managed process group. Clients are not detached
services and no login/startup daemon is installed. After inspecting stopped
work, remove only the named `STOP` file to permit a later operator start.

## Integrator-issued tickets

Only enroll an already-approved, assigned role. The designated integrator:

1. Checks the actual task/approval register, records the eligible phase in
   the packet with exactly one `<!-- relay-phase: IMPLEMENTING -->` marker,
   and freezes the current packet, approval evidence and role inputs.
2. Prepares the isolated worktree and pinned allowlisted overlay. A new
   worktree does not inherit dirty main files. Review inputs include the
   exact frozen patch/manifest and verified author model metadata.
3. Writes the following JSON with real paths/hashes and enqueues it. The
   approval citation identifies an actual recorded human authorization;
   inventing a citation or setting a phase is not approval.

```json
{
  "task": "APPROVED-TASK",
  "lane": "B",
  "revision": "<64-character SHA-256 of this role's frozen specification or patch>",
  "role": "implementer",
  "phase": "IMPLEMENTING",
  "packet": {
    "path": "docs/agent-handoffs/APPROVED-TASK.md",
    "sha256": "<SHA-256>"
  },
  "approval": {
    "path": "docs/course-progression-decisions.md",
    "sha256": "<SHA-256>",
    "citation": "<exact decision ID, scope, owner disposition>"
  },
  "worktree": "/absolute/path/to/prepared-isolated-worktree",
  "inputs": [
    {
      "path": "/absolute/common-git-path/agent-handoffs/APPROVED-TASK/frozen.patch",
      "sha256": "<SHA-256>"
    }
  ],
  "instruction": "<one bounded next action, owned paths, acceptance checks and stop>"
}
```

```bash
npm run agents:relay -- enqueue /absolute/path/to/ticket.json
```

Inputs must resolve inside the coordinator repository or its common Git
directory, including after symlink resolution. Use frozen common-Git bundles
for inputs originally produced elsewhere. Worktrees must belong to this Git
repository; writers/reviewers cannot target the coordinator checkout.
Hash files with `shasum -a 256 <file>`. The revision identifies substantive
frozen inputs, not a timestamp, retry number or administrative documentation
change. The same task/role/revision cannot be dispatched twice.

Allowed routing:

| Role          | Eligible phase                      | Native executor                        |
| ------------- | ----------------------------------- | -------------------------------------- |
| `implementer` | `IMPLEMENTING`, `CHANGES_REQUESTED` | Claude `forge-implementer`, Sonnet     |
| `expert`      | `IMPLEMENTING`, `CHANGES_REQUESTED` | Claude `forge-expert`, Opus            |
| `reviewer`    | `AWAITING_REVIEW`                   | Codex GPT-6.1 Sol, read-only           |
| `checkpoint`  | An eligible role's completion       | Claude Sonnet, status integration only |

Review tickets additionally require `"authorFamily": "claude"` and pinned
client metadata that proves the actual identity; the field alone is not
proof. GPT-authored scope requires a separately approved compatible route,
not this relay's Codex reviewer. `READY_TO_INTEGRATE` permits a status
checkpoint only: it never grants automatic patch application.
An optional Claude `sessionId` resumes a specifically identified original
author, never the client's unspecified "last session." Codex review starts
fresh; changed-scope tickets pin the earlier findings and closure evidence.

## Automatic handoff and gates

The relay claims the task before invocation and passes that claim ownership
to the child for the duration; the child must not reacquire/remove it.
Checkpoint turns acquire `integrator.lock`. Existing foreign claims are
preserved, never aged out or stolen. The relay conservatively defers worker
and checkpoint dispatch while any other task/integrator claim is active.
Interactive integrators must still check all active task claims and owned
paths.

Workers return frozen artifacts/full reports and structured role status;
they never edit shared routing/status files. A successful transport
automatically queues one Sonnet checkpoint. That checkpoint verifies the
result and model metadata, updates the existing packet/index/PROGRESS, and
may enqueue exactly one already-authorized successor. Thus author -> review
and review -> original-author correction can proceed without typing
`continue`. The integrator must verify **actual** model identities, not
assume that the requested Sonnet/Opus alias resolved correctly.

Checkpoint scope is administrative: no substantive re-review, patch
application, new implementation or artifact acceptance. Normal independent
and human gates remain intact. `AWAITING_HUMAN`, `BLOCKED`, `DONE`, missing
authorization or recurring unresolved findings do not become new execution
tickets. The checkpoint records a human request once and leaves that task
idle; separately authorized queued tasks may still run. After human
approval, the integrator records its exact disposition and enqueues the
newly eligible role. No model polls for that approval.

Both clients retain ordinary permission controls. Claude uses `dontAsk`,
so operations that need an ungranted permission fail rather than prompting
unattended or bypassing approval. Codex uses `--sandbox read-only`.
Preconfigure only narrowly reviewed permissions needed by the approved
task; never enable blanket Bash access or permission/sandbox bypass to
make a ticket run. Missing tool/auth/model permission is a real block.
The queue and claims are cooperative local coordination, not a security
sandbox or an authorization system.

### Explicit SCI6-REGISTER permissions

After the first corrected launch reached Sonnet but denied its initial
Bash call, the owner explicitly approved narrow worker/status-checkpoint
permissions and one further bounded recovery. A ticket may set
`"permissionProfile": "sci6-register"` only for that approved task.
This adds per-invocation settings, not global permission changes:

- Writers can edit the six accepted Science records, the two catalog
  loaders and directly coupled tests only. The 2026-10-17 D-182 recovery
  additionally owns exactly
  `tests/contracts/structured-response-schema.test.ts`, not that directory.
  Checkpoints can edit only the
  packet, resume index, PROGRESS and one temporary successor-ticket JSON.
- Checkpoints can inspect the isolated worktree from their pinned immediate
  worker ticket. The launcher resolves and validates that assignment,
  adds that exact directory, grants Read and explicitly denies Edit there.
  Earlier author tickets do not replace the immediate reviewer assignment.
  Missing, stale, mismatched or nonisolated source tickets fail closed.
  Native Claude model identity is in `stdout.log.modelUsage` beside the
  role receipt, not in `receipt.json`.
- Codex reviewers use their native read-only shell, not Claude-only tool
  names. Their inspection runs the pinned coordinator relay script with
  native Node type stripping, avoiding the tsx CLI's prohibited IPC socket.
  No socket grant or sandbox expansion is needed. Inspection verifies the
  current `CODEX_THREAD_ID` against its own native session/turn metadata.
  After execution the host independently extracts only thread/model/provider/
  sandbox evidence into `native-model.json` and pins it for the checkpoint.
  Missing, mismatched or non-read-only model evidence blocks the review;
  raw native session transcripts are not copied into the task bundle.
- Bash grants name exact validation/helper commands, plus inspection
  commands and SHA-256 checks. There is no bare Bash, generic Node/Python,
  arbitrary npm-script or blanket Edit grant. `dontAsk`, native deny rules
  and read-only Codex remain in effect.
- `task-inspect` verifies the pinned effective baseline and reports owned
  changes. `task-format` formats changed owned files. `task-freeze` creates
  a deterministic baseline-relative patch and hashes in the task's common
  Git bundle, refusing unowned baseline drift and replacement of a freeze.
  `task-route` allows only a status checkpoint to enqueue one same-task
  writer/reviewer successor from `docs/agent-handoffs/SCI6-REGISTER-next.json`.

Use helpers as individual commands, without shell variables, inline scripts
or wrappers:

```bash
npm run agents:relay -- task-inspect
npm run agents:relay -- task-format
npm run agents:relay -- task-freeze
```

Helpers require the runner-provided ticket/root environment and do not run
as unrestricted general-purpose commands. Frozen output is under
`agent-handoffs/SCI6-REGISTER/rev1/<execution-revision-prefix>/`. Return
the complete self-audit/results in the structured report, rather than
using model file tools to write directly into protected `.git` paths.
An unpinned, previously unchanged tracked test uses its frozen base-commit
bytes; the freeze records that additional baseline hash explicitly.

### Automatic technical flow, not model-made human approval

Within approved tickets and the watcher bounds, implementation, independent
review, consolidated corrections and changed-scope verification proceed
automatically. A different model may report engineering readiness; it may
not impersonate human acceptance or clear human-only gates. For D-182 the
automatic finish line remains a reviewed patch ready for exact human
acceptance/application, not publication, availability or deployment.
Content/product/privacy/policy/release decisions remain human decisions.
Do not invent another reviewer or review-the-review layer to provide
surrogate approval. Reaching a reserved gate records the request and stops
that task, while independent already-authorized tickets may continue.

Result schemas explicitly target JSON Schema draft-7 for native CLI
compatibility. The installed Claude validator rejects Zod's default
draft-2020-12 dialect before starting a worker; fake-client handoff tests
also reject that unsupported dialect.

## Failure and recovery

Malformed/stale tickets fail explicitly. A client error, quota/auth failure,
permission denial, invalid structured result or interrupted invocation
pauses execution with `PAUSED.json`; no automatic retries or fallbacks.
Inspect the named run directory, exact artifact state and surviving
processes. A started run remains consumed even after a crash; neither
deleting a pause file nor re-enqueueing the same revision reruns it.

Only the human may clear `PAUSED.json`/`STOP` or authorize stale-claim
cleanup after confirming the former owner/process has stopped. Do not
delete run records to manufacture a retry. Reconcile the existing attempt
and publish a missing checkpoint if needed; a genuinely corrected revision
needs fresh pinned evidence and appropriate scope. If a process crashed
after transport completion but before its checkpoint was queued, recover
from its receipt rather than rerunning the author/reviewer.

Native CLI logs and `receipt.json` distinguish transport completion from
readiness, independent acceptance and human approval. Exit zero alone
clears none of those gates. No production data, private content, paid tutor
evals, deployment, migration, commit or push is authorized by relay setup.

## Delivery state (C1)

`scripts/delivery-state.ts` is the D-183 delivery-coordinator state layer. It
selects the next task deterministically and keeps durable, bounded run/control
state. It runs no model, spawns no client, prepares no worktree, applies no
patch, cannot approve a human gate and never declares a learner release. Its
output is planning information, not permission to execute. It is separate from
the legacy ticket relay and never touches that relay's `STOP`/`PAUSED`.

Run: `node --experimental-strip-types scripts/delivery-state.ts <cmd>` with
`plan --backlog P [--facts F]`, `status [--backlog P] [--facts F]`,
`start --backlog P --max-minutes N --max-invocations N --confirm-new-run`,
`stop --run ID [--reason T]`, `abort --attempt ID`,
`settle-orphan --attempt ID --confirm-stopped`,
`release-hold --task ID --reason T` and `close --run ID`. Unknown flags are
rejected. Reserve/begin/end/import are library calls for C2/C3, not CLI.

**Inputs (read-only).** The backlog holds strict task specs (id, milestone,
kind, role, dependencies, exact owned paths or one trailing `/**`, explicit
gates, provenance pins). Ids must be unique, dependencies must exist, and
self-dependencies and cycles are rejected. Owned paths may not overlap
protected files (agent/CI config, shared status/decision files, manifests),
including ancestors such as `docs/**`. Gates are also derived from path
overlap with `content/`, `prisma/`, the program registry and pinned
private/held-out paths; broad wildcards such as `src/**` are conservatively
gated. The integrator-supplied facts file pins gate evidence (file SHA plus a
verbatim citation in the decisions or manual-gate record) and integration
receipts (under `agent-handoffs/<task>/`, bound to task, attempt and spec
hash). **Facts are externally verified integrator input:** C1 checks integrity
and structural consistency, not the authenticity of the human decision or
review behind them. No C1 API or CLI writes facts, attestations, receipts or
approval flags. Facts, provenance and receipts are re-read on every plan and
reservation, so a changed or revoked pin makes a task unsatisfied again.

**State** lives in `<git-common>/agent-relay/delivery/`: `ledger.json` (full
task specs, attempts, holds, imports; survives every run), `runs/<id>.json`
(deadline, invocation cap, stop/close) and `control.lock/`. Attempt ids are
unique across runs; invocation use is derived from durable attempts. Every
reservation is written ahead and consumes budget regardless of outcome. A
reservation carries a revision hash (spec, role, provenance, dependency
integrations); a consumed task/role/revision is never reserved again, even
after a failure or `release-hold`, until the spec, provenance or dependencies
change. Failed or aborted attempts hold the task; nothing is retried or
replayed automatically. A new run requires explicit `--confirm-new-run` and
every earlier run to be closed; it never resets the ledger.

**Re-reading and integrity.** `plan` re-reads the backlog and facts from the
source pointers held by the loaded objects and rejects a snapshot whose source
changed, so cached evidence never yields readiness. Ledger and run files are
cross-checked on every read and write (attempt id = task/run/seq, referenced
run exists, state-specific timestamps and outcome, attempts within each run's
cap, import limits); inconsistent state is rejected and left untouched. Writes
complete the whole temp file and fsync it before the rename, so a short write
or later failure keeps the previous file. Task ids may be 80 characters and
gate ids 128, so every derived gate fact is representable. Ownership of
`.git`, authority and control records, and trusted relay/state code (exact or
by ancestor wildcard) is rejected.

**Task status** is computed, never stored: `done` (verified integration fact
for the current spec, current provenance, every required gate satisfied and
every dependency itself done; revocation propagates transitively), `held`, `active`, `awaiting_acceptance` (transport
success is not integration), `stale`, `proposed` (imports are never selectable
in C1), `waiting`, `blocked_human` and `ready`. A blocked or missing-gate task
does not block unrelated ready tasks. `next` is the first ready task, and only
when no attempt anywhere is active. `status` reports a milestone as
`engineering_complete` only when all its tasks are done; it never prints
delivery or release.

**Control.** Every mutation takes an owned atomic `mkdir` lock and is never
stolen or aged out; a held lock gives `LOCKED` (exit 3). Files are written via
temp file, fsync, rename and directory fsync with mode 0600/0700. Every path
component is `lstat`-checked; symlinks, special files, corrupt JSON, schema
violations and unsupported versions are rejected without overwriting. `stop`
and `abort` are durable requests scoped to one run/attempt: only the owner
token can end an attempt (an aborted request must be acknowledged as
`aborted`), nothing refunds budget, and `close` refuses while attempts are
unsettled. `settle-orphan` is an explicit operator action after confirming the
process stopped.

**Limits.** `reserve` reserves only initial author work; reviews and the one
correction use `reserveContinuation` (see C2 below). C3 adds baseline-checked,
journaled integration and recovery that produces the receipts consumed here.
Import records (`recordImport`) are stored as `proposed` only, at most three
per scope task cumulatively and twenty overall; backlog tasks may depend on
them (they stay not-done), and an outstanding import keeps its milestone
`in_progress`.

## Delivery acceptance boundary (C2)

`scripts/delivery-accept.ts` freezes and independently reviews candidates
produced by native Claude authors. It is **not** root integration and **not**
full product autopilot: it never applies a patch to the root checkout,
creates human facts, integration receipts, approvals or journals, commits,
pushes, deploys or activates. Transport success, engineering acceptance and
C3 integration are three distinct things; an accepted task stays
`awaiting_acceptance` until a C3 receipt fact exists.

Run: `node --experimental-strip-types scripts/delivery-accept.ts <cmd>`:
`next --run ID --backlog P [--facts F]` (read-only, zero model calls),
`step ... [--execute]`, `run ... --max-steps 1-20 [--execute]` (dry run
without `--execute`; stops at idle, a hold, abort, stop or the cap),
`verify-bundle --task ID --attempt ID`, `abort --attempt ID`, `stop --run ID`.
C3 calls the library function `loadAcceptedBundle(ctx, io, taskId)`, which
recomputes everything and throws on any divergence.

**Role chain (C1 ledger).** Author (`reserve`) -> host freeze -> Codex review
(`reserveContinuation kind=review`, input = bundle hash) -> optionally ONE
consolidated original-author correction resuming the same Claude session
(`kind=correction`, input = review hash) -> freeze -> changed-scope review.
Continuations are write-ahead, charged, unique by
`[task, kind, parent, input]`, and require the task's latest attempt to have
ended `transport_completed`. A blocker or major after the correction holds the
task (`recurring`). There is no automatic release, retry, replay or orphan
settlement. Gates (explicit and derived), provenance, dependencies, run state
and spec are revalidated from current sources before every reservation,
spawn, check, freeze, review, acceptance and load, even where
`awaiting_acceptance` takes plan precedence; a failure holds `gate_revoked`
and preserves the attempt.

**Baseline.** Each author gets a uniquely named external worktree (system
temp, disjoint from the root checkout and the git common directory) bound by
a durable record under the common directory. The complete effective public
tracked+untracked root state is overlaid, so accepted dirty dependencies are
present and pre-existing dirty input is baseline, not author change; changed
and unowned detection compare the full prepared baseline. Excluded: `.git`,
`.claude/worktrees`, `.env*`, `node_modules`, generated output and
`docs/delivery`. Source and destination ancestors and leaves must be
non-symlinks; the only symlinks allowed are the HEAD-tracked aliases
`.agents/skills` and `.claude/skills` pointing at `../.github/skills`, which
are preserved from HEAD without traversal and must stay unchanged, plus the
one host-made `node_modules` link. Anything else fails and preserves
artifacts. File modes other than writability are not captured in bundles.

**Native adapters.** Fixed argv, no configurable commands. Claude runs
`--permission-mode dontAsk` with invocation-local inline settings: scoped
`Read/Glob/Grep` on the worktree, `Edit/Write` on the exact owned paths only,
exact literal `Bash` commands, denials for the root checkout, `.env`,
`node`, `npx`, installs and git mutation, and no global settings or bypass.
Child environments are allowlists (base OS variables plus only
`CLAUDE_CONFIG_DIR` or `CODEX_HOME`); no API-key, token, database or app
variable is forwarded and host checks receive no native client variables.
This is environment scrubbing and tool permission, **not** OS-level filesystem
isolation. Claude identity requires non-empty `modelUsage` entirely of the
assigned family; any permission denial, `is_error` or schema mismatch holds.
Strict repair is limited to one JSON object (whole text or one fenced block)
and `completed` -> `complete`. Codex runs `gpt-6.1-sol` read-only with its own
native shell; its model identity is read by the host from the thread rollout
(`codexModelEvidence`), never from the response. Review must be cross-family.
Runs are owned detached process groups: separate-process abort, run stop or
the deadline signal only the recorded child group (SIGTERM then SIGKILL),
consume the budget and end the attempt `aborted` through C1.

**Required checks (host-run, non-omittable, fail-closed).** Profiles are
derived from changed and owned paths; the model supplies none. Supported:
`scripts/**`, `tests/{agents,contracts,content,curriculum}/**` and
`src/{contracts,content,curriculum,planner,progression}/**` (git diff check,
scoped prettier, `npm run verify`); `src/tutor/**` and `tests/evals/**` (plus
`vitest run tests/evals`); `docs/**` (git diff check and prettier with
`--ignore-path /dev/null`). **Unsupported and blocked before dispatch or
freeze:** database/persistence (`prisma/**`, `src/server/**`, `src/app/api/**`,
anything reaching `@prisma/client` transitively), learner/browser/UI
(`src/app/**`, `src/components/**`, browser tests), private or migration
surfaces, `content/**` and every unclassified path. C2 makes no database or
browser claim. A nonzero or timed-out check, or a check that changes any
worktree file (owned or not), holds the task.

**Bundle and review.** `agent-handoffs/<task>/<attempt>/` holds `before/`,
`after/`, `candidate.patch`, `checks/*.log`, `identity.json` and
`manifest.json`, written create-only then made read-only. Verification
recomputes every hash and proves the patch applied to the exact `before/`
yields exactly `after/`. The bundle hash (manifest SHA-256) is anchored in the
C1 ledger as the review attempt's input, outside the replaceable bundle; after
the review the bundle, worktree, echoed hash and both identities are
re-verified before `review.json` and `acceptance.json` are written, and
`loadAcceptedBundle` re-verifies them again.

**Review-round hardening.** Technical acceptance is derived from the sealed,
ledger-anchored review outcome (native stdout/stderr, last message, parsed
result and model snapshot are hashed into the attempt's `evidenceSha256` when
it ends and re-verified at freeze, review and load); `acceptance.json` is only
a receipt that must equal that derivation, and requires status `complete`,
verdict `ready` and zero blockers and majors. Bundle verification checks head,
baseline, spec, revision, owned paths, before bytes and the independently
derived required checks against the original binding and the ledger. Authority,
stop and deadline are re-read after the last blocking check or client and
immediately before anything is published. The effective owned scope (existing
baseline files under owned paths plus changed paths) and their transitive local
dependencies are classified before dispatch and at freeze; unknown external
packages (only `zod`, `vitest` and Node built-ins are allowed), unresolved
imports, private/held-out paths and an exhausted 400-file traversal block, and
an unsupported task is held without a model call so unrelated tasks continue.
Checks and clients run as owned process groups that are terminated (TERM then
KILL) even when the leader exits first. A missing or partial native output ends
and holds the consumed attempt. The first review receives the pinned scope and
provenance; a post-correction review is explicitly changed-scope with prior
findings, correction report and changed hashes and must account for every
prior finding; that context is authenticated against the sealed native outcome
of the prior review and the correction's input anchor (a replaced
`review.json` is refused before any call and at finalization/load), and the
complete correction report is supplied with its sealed path and hash.
Local specifiers are resolved by the installed TypeScript compiler's own
"bundler" resolution over the effective file set, so extension families
(`.js`/`.ts`/`.tsx`/`.d.ts`, `.cjs`/`.cts`/`.d.cts`, `.mjs`/`.mts`/`.d.mts`)
and their precedence match the compiler and a safe wrong-family sibling is
never substituted; an edge the compiler cannot resolve is refused. A directory
import whose directory has its own `package.json` (any content, including
malformed, and under any `.`, `..`, repeated-separator, backslash or alias
spelling of that directory; backslashes are converted to `/` as the compiler
does) is refused as metadata-dependent, because metadata is not read and
could redirect to a different source; metadata-free directory imports and
unrelated package files are unaffected. Dependency
scanning uses the TypeScript parser in parse-only mode (public
program API, no emit, so declaration files such as `*.d.ts`, `*.d.mts` and
`*.d.cts` classify normally and their `import type`, `import('x')` types and
triple-slash references are still traversed): `import(driver)`,
`require(x)`, interpolated dynamic imports and unparsable files are refused as
unsupported (literals, comments and strings that merely mention imports are
not). The host-run check records are written outside the bundle and bound once
in the ledger (`checksSha256`); bundle logs and results must equal them, so a
coherent bundle-only reseal fails. Ledger reload also requires every
attempt to carry an explicit kind once any C2 write exists (a stripped
continuation is rejected) and each continuation's parent to have ended
`transport_completed`. Ledger reload validates kind/role/parent/input and continuation
revision consistency and the single correction; ledger files remain
unauthenticated local state (a full rewrite is outside this check).

## Delivery integration (C3)

`scripts/delivery-integrate.ts` applies the exact reviewed bytes of a
C2-accepted bundle to the root checkout, re-verifies the result and only then
writes an integration receipt. It consumes **zero model calls**, never stages,
commits, pushes, deploys, activates, rolls back foreign work or creates a
human gate. The receipt scope is `local-uncommitted` and carries
`humanGates: unchanged`. It is not product autopilot or a release.

Run: `node --experimental-strip-types scripts/delivery-integrate.ts <cmd>`:
`status`; `integrate --run ID --backlog P [--facts F] --task ID`;
`recover --run ID --backlog P [--facts F] [--confirm-stopped --lock-token T]`;
`release-lock --run ID --backlog P [--facts F] --confirm-restored --lock-token T`;
`publish-fact --run ID --backlog P --facts F --task ID`. Unknown flags are
`INVALID`; `LOCKED` exits 3, other errors exit 1.

**`integrate`** (first failure wins): takes the exclusive
`<state>/integrate.lock/` (never stolen); refuses an open journal
(`recovery_required`), an abandoned review (`consumed`), an inactive run
(`run_inactive`, no hold), any active attempt (`busy`) and an unformatted root
`.json` backlog (`backlog_format`). It recomputes acceptance with C2
`loadAcceptedBundle` (C2 holds on divergence), refuses provenance that overlaps
a target (`provenance_overlap`, hold), checks the targets under the root with
no-follow ancestors (symlinks give `UNSAFE_PATH`), refuses a staged target
(`staged_target`) or a new target whose path already exists in another form
(`case_alias`) or on another device, then proves the full effective root
snapshot (HEAD, every unowned, owned and unchanged file, aliases and missing
files) equals the original author baseline (`baseline_drift`/`head_drift`,
hold). The re-run of the required checks happens on an external tree holding
exactly the to-be-applied bytes, using the reviewed C2 owned process runner
(`check_failed`, hold); that tree is re-walked afterwards (`check_mutation`),
acceptance is recomputed again, and a second snapshot proves the checks wrote
nothing into the root or index (`baseline_drift`/`index_drift`). Only then is
`plan.json` (0444) written and the journal set to `APPLYING`. From that point
C3 never holds the task itself; a failure becomes journal `BLOCKED` with the
lock retained.

**Apply and verify.** Targets are written in sorted order from the verified
bundle `after/` bytes (re-hashed at write) through a staged temp file and an
atomic rename; deletions remove only a file equal to the reviewed `before`
bytes. Every target is classified `before`, `after`, `third` or `unsafe` first;
a `third`/`unsafe` target is never overwritten. After `APPLIED` the post
snapshot must equal the expected files, HEAD and index digest must be
unchanged and authority is re-read; only then the journal becomes `VERIFIED`,
the receipt is created atomically (no overwrite; an existing receipt must be
byte-equal, otherwise `receipt_mismatch`) and the journal becomes `COMPLETE`.

**State** (under `<state>/integrations/<task>/<review>/`): `plan.json`,
`journal.json` (atomic replace; states `APPLYING`, `APPLIED`, `VERIFIED`,
`COMPLETE`, `BLOCKED`, `ABANDONED`), per-invocation check logs and staging,
`refusals/*.json`. Snapshot bindings and external worktrees are preserved as
forensic artifacts; nothing is ever deleted. Receipts live under
`<common>/agent-handoffs/<task>/integration-<review>/receipt.json`.

**Recovery.** After a crash the lock and journal remain. C2 `next`/`step` return
`none` with zero calls while `integrate.lock` exists (a symlinked lock path
fails closed). `recover --confirm-stopped --lock-token T` adopts the lock only
when the token and host match and the owner pid is not alive (`lock_foreign`,
`lock_owner_alive`; the lock bytes are unchanged). It always re-verifies from
the plan: plan hash, run state, `loadAcceptedBundle` equality, check records,
non-target snapshot, HEAD and index. A `third` state, drift, a modified
applied target, revoked authority or a different receipt leaves the journal
`BLOCKED` with the per-file classification; recovery never claims success on
a cached state. A lock without a journal means the root was never written and
is released. `release-lock --confirm-restored` is accepted only when every
target is back at the reviewed `before` bytes and the snapshot equals the
original baseline; it holds the task (`c3:integration_abandoned`), marks the
journal `ABANDONED` and releases the lock. C2 may itself hold the task while
recovery re-verifies authority; run `release-hold` before the next recovery.

**Recovery ownership.** Adoption claims a marker OUTSIDE the lock, keyed by the
unique token of the exact outer lock generation
(`<state>/integrate-recovery/<outerToken>`, installed by one atomic directory
rename), before any journal or root mutation, so exactly one live `recover` or
`release-lock` proceeds; the loser (`recovery_owner_alive`/`recovery_contended`)
changes nothing and the original lock owner is never rewritten. After winning
the marker the adopter re-reads the lock and requires the same owner (token,
host, dead pid) or refuses `lock_changed`, so a stale adopter can never act on
a replacement lock that reuses the pathname. The marker is held until the outer
lock has been retired by one atomic rename into `integrate-retired/<token>`
(there is never an ownerless current lock); a controlled refusal or BLOCKED
result returns only the marker, a crash keeps both, and a marker whose pid is
dead is retired (preserved under `integrate-recovery-dead/<token>`) by an atomic
rename keyed by its own token, so only one taker can replace it. **Application
authority** (run, task, gates, provenance, dependencies and the accepted
bundle) is re-read after the last snapshot and immediately before any fresh or
resumed write; a revocation then leaves the root untouched.

**Publication.** `publish-fact` is a separate explicit host step. The named
`--run` must exist, be bound to the current backlog and be active, and the
task's current gates, provenance and dependencies must hold, otherwise the
facts file is left byte-identical (`authority_revoked`). The facts
file must already exist inside the delivery state directory (not the root
tree), the journal must be `COMPLETE` and the receipt must equal its
recomputation. It appends exactly one integration entry, refuses a conflicting
entry (`fact_conflict`), never changes `gates`, and writes only if C1 `plan`
over a temporary copy reports the task `done` (`would_not_be_done` otherwise;
the facts file is byte-unchanged). A later changed receipt, provenance, gate or
dependency revokes `done` through C1 and dependents wait again.

**Limits.** No real native-protocol smoke; executable bits are not part of the
reviewed bytes (existing modes are preserved, new files are 0644); the root
must not change while a task is in flight (including status-file edits), or
integration refuses on drift; coherent rewriting of unauthenticated local
state (ledger, bundle, journal, receipt) is still possible; the historical
process/lock race remains and concurrent C2/C3 processes are unsupported (a
TOCTOU window remains between the `next` guard and a reservation); checks run
on the identical external tree, not a root-level full suite; the run state must
be active for recovery (otherwise restore the `before` bytes and
`release-lock`); there is no dispatcher or automatic rebase.

## Delivery dispatcher (C4)

The lines above describe C1-C3 as accepted; this appended section adds the C4
dispatcher (`scripts/delivery-dispatch.ts`). It is a **foreground, serial
(WIP=1)** controller that only orders the reviewed interfaces: C1 selection and
budgets, C2 `executeStep` (reserve, begin, freeze, review, finalize), C3
`integrate`/`recover`/`publishFact`. It runs no model itself, creates no
backlog, gate, import or human fact, never calls `releaseHold`, `release-lock`
or a settlement on its own initiative, never clears `STOP`/`PAUSED.json`, and
does not approve anything. Fake-fixture tests prove logic only; no real
Claude/Codex protocol smoke has been run, and this is not an always-on or
product service. Do not call it operational autopilot until the independent
review and a separately scoped real smoke (below) have passed.

**Enrolment (explicit integrator input).** The dispatcher only reads
`<common>/agent-relay/delivery/dispatch/enrolments/<sha256-of-bytes>.json`
(create-only by the integrator). Backlog and facts paths come only from the
enrolment. Every tick re-validates: the file name equals its hash; the pinned
authorization bytes still hash and agree with the envelope (`startedAt`,
`deadline`, `maxInvocations`, `automaticAggregateRenewal === false`,
`completionStopsExecution === true`, native roles); the decision citation is
still in `docs/course-progression-decisions.md`; the supersession chain is
linear (identical envelope, `externalDebit` never decreasing, `enrolledAt`
strictly increasing, this file is the head, no fork for the same authorization,
so a new enrolment can never reset spending); the backlog is under
`docs/delivery/` (excluded from baselines, so changing it cannot cause drift)
and keeps its pin (`backlog_changed` otherwise); milestones are in D-183 order;
the facts file lives in the delivery state directory; models are
`claude-opus-*`, `claude-sonnet-*` and `gpt-6.1-sol`. Any failure is
`enrolment_invalid` with zero steps. Imports stay `proposed` (idle) until a new
superseding enrolment names an explicit backlog.

**Budget.** There is one per-call ledger, C1's. `remaining = envelope max -
externalDebit - Σ used(C1 runs created since the envelope started)`. A
reservation immediately reduces `remaining` and is never refunded, including
after `settleOrphan`. Before any reservation the step must fit both the
envelope and the bound run (`author`/`correction` 2, `review` 1; `freeze`,
`finalize-review`, `integrate`, `publish` 0). A bound run is renewed (close,
then start) only when it is unusable (closed, expired, stopped by a later
enrolment, different backlog), or when a model step needs it: the new cap is
`min(C1 maximum, remaining)` and its minutes never pass the envelope
deadline. An open, unstopped, unexpired run whose invocations are exhausted
still allows the zero-call steps; it is never closed or renewed just to
integrate or publish. If a legal new run cannot be created the result is
`awaiting_acceptance` and artifacts are preserved. External calls between
enrolments belong in the next enrolment's `externalDebit` (integrator
attestation, unverifiable like C1 facts); do not also add the dispatcher's own
usage to a standing record.

**Commands** (`node --experimental-strip-types scripts/delivery-dispatch.ts`):
`status --enrolment E` (no claim, zero writes); `run --enrolment E --max-steps
1-200 [--max-authors N] [--execute]` (a dry run unless `--execute`);
`stop --enrolment E [--reason T]` (C1 stop of the bound run);
`release-controller --lock-token T --confirm-stopped`;
`reconcile --enrolment E --attempt ID --confirm-stopped`;
`recover --enrolment E --lock-token T --confirm-stopped`. Unknown flags are
`INVALID`; `LOCKED` exits 3, other `DeliveryError`s exit 1, every reported
disposition exits 0.

**Controller claim.** `run`, `reconcile` and `recover` take
`<state>/dispatch/controller.lock` (mkdir, then an owner file). A second
controller gets `LOCKED` (exit 3) and nothing is touched. Normal exit retires
the whole lock by one rename into `dispatch/retired/<token>`. A dead owner is
released with `release-controller` only after the token and host match and the
pid is dead, through a token-keyed marker (`controller-retire/<token>`) so a
stale token can never retire a replacement generation. Per-tick events are
create-only read-only files in `dispatch/events/<token>/`.

**Tick precedence** (first match wins, one event per tick): P0 the claim is
ours; P1 relay `STOP`/`PAUSED.json`/`watcher.lock` (`stopped`) or the dispatch
`PAUSED.json` (`paused`), never cleared; P2 enrolment; P3 a C3 lock or open
journal (`integrate_recovery`, with the exact `recover` command); P4 envelope
deadline; P5 a stop request newer than the enrolment (closing a stopped run
does not lift it; only a later enrolment does); P6 any active attempt
(`interrupted`, never auto-settled); P7 selection: publish a COMPLETE journal,
integrate an accepted bundle, otherwise the single in-flight task through
`nextStep`/`executeStep` filtered to that task, otherwise the first ready task
(an author starts only when nothing is in flight); P8 run, budget and adapter
preflight (`claude`/`codex` must resolve on the PATH) before any reservation.

**Failures.** Task-specific holds (`checks_failed`, `no_changes`,
`author_blocked`, `review_blocked`, `unowned_change`, `bundle_mismatch`,
`gate_revoked`, `recurring`, `c3:*` ...) leave the task held and let unrelated
eligible work continue. `recurring` means the integrator's cause checkpoint is
required: C2's one consolidated correction stays unchanged, there is no
automatic second correction, and nothing here waives a finding. Systemic holds
(`identity`, `permission_denial`, `schema`), an attempt that ends
`transport_failed`/`aborted`, a sealed author or review model that is not
exactly the enrolled model, and any unexplained step failure write the
create-only dispatch `PAUSED.json` and stop; a stop, deadline, backlog or
recovery cause is reported as itself instead. `LOCKED` from C1/C3 is `locked`
(no hold, no retry). After any publish the facts `gates` must be canonically
byte-equal to before.

**Signals.** The first SIGINT/SIGTERM drains (finish the current step, then
`stopped`/`drained`); the second aborts: C1 `requestAbort` for an active
attempt (retried while the control lock is busy), or a C1 stop of the bound run
during the checks of a freeze or integration; C2 terminates the recorded child
group. C3's synchronous apply/verify cannot be interrupted by a handler; SIGKILL
leads to `recover`. The dispatcher never signals a process group it did not
spawn in this process; an orphaned detached child after SIGKILL is stopped by
an operator, after which `reconcile` settles the attempt (the call stays
charged, the task is held).

**Procedure.** While the controller claim exists, the integrator dispatches no
envelope calls outside the dispatcher and makes no root edit (including status
files) while a task is in flight: C3 holds the task on drift. Recovery:
`status` shows `interrupted` or `integrate_recovery`; run `reconcile` or
`recover` as printed, then `run` again. A future real-enrollment and smoke
(a real task through `run --execute --max-authors 1`, actual model identity
from client metadata, acceptance, C3 COMPLETE, receipt and published fact,
at most four calls, stop at any hold) is separately scoped and recorded by the
integrator after independent review; protected human gates remain stops.

**Binding of runs to the envelope.** No run or attempt is created before the
envelope start (the accounting origin), so everything the dispatcher creates is
charged. A bound run must end no later than the immutable envelope deadline: an
adopted overlong run is replaced (closed, then a fresh run started), and a
renewal recomputes its minutes from the clock reading that actually starts it.
`recover` decides enrolment authority itself (origin, deadline, and a stop
request newer than the enrolment on ANY envelope run, closed ones included)
before it touches C3 state; `decide`'s `integrate_recovery` precedence is not
authority. Recorded pids (controller owner, attempt owner, native child group)
are validated; only `ESRCH` proves death, `EPERM` means alive, and any other
probe error is reported without settling or retiring anything.

**Carried limits** (not changed here): executable-mode capture, unauthenticated
local state, the historical C2/C3 process/lock race and TOCTOU window for
out-of-band concurrent CLIs, snapshot cost, the C3 crash-hook seam, an orphaned
child after SIGKILL, conservative budget over-counting, and dependence on an
active local session.
