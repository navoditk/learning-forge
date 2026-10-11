# Cross-client resume index

Start here when continuing Learning Forge in Claude Code, Codex or Copilot.
Read `AGENTS.md`, then the terminal-handoff procedure and approved native
model mappings in `docs/agent-orchestration.md`. This index is a checkpoint,
not an approval register or an automatic task scheduler.

## Ordered relay and quota-conserving plan

**Current state (2026-10-11): TEACH-T2A (`56ea7b3`, `c248254`) and the
accepted resources nav/status fixes (`a02bbfa`) are integrated and pushed.
Independent local browser validation passed: 72 tests, one expected private-
package skip. Remote CI passed at `ccd6192` (run `38182079316`) and `332ef01`
(run `38182113951`); Pages passed at `332ef01` (run `38182113684`).
The old accessibility CI hold is cleared. Current documentation-only HEAD
`1b274cc` records that result; its CI/Pages runs were still in progress at
this checkpoint (later confirmed green). No advisory claim was present.
Row 6 was scoped by the owner on 2026-10-11 as packet
`docs/agent-handoffs/LIFECYCLE-L2.md` (**SCOPED / READY_FOR_EXPERT**): next is
Claude Code `forge-expert`/`opus` writing one document-only decision brief,
then Codex `forge-reviewer`. It authorizes no code, schema, database operation
or synthetic probe; "continue" in Claude Code dispatches it.**
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
and gated catalog/registry wiring remain separate work. This track is part
of the shared plan, not permission to bypass the ordered T2a relay.

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
- `CHANGES_REQUESTED`: Claude Code `forge-implementer`, `sonnet`, for
  bounded corrections; Codex must advise switching and stop. A substantive
  unresolved design is assigned to Claude `forge-expert`, `opus`, only after
  its scope is approved.
- `AWAITING_HUMAN`: either client requests the exact named approval and
  stops. Neither switching tools nor passing tests clears it.
- `READY_TO_INTEGRATE`: the packet's named integrator validates/applies only
  the approved frozen patch. A changed patch goes back to independent review.
- A claimed/running phase: wait for the named owner. A missing artifact,
  unsupported model or unknown author family is `BLOCKED`, not permission
  to substitute. Finish one role; update the packet/index and name the next
  terminal. Never silently take a later backlog task.

Use this order. Later rows are recommendations, **not implementation approval**:

| Order | Bounded task                                      | Client / role                                                                               | Prerequisite and stop                                                                                                                                |
| ----- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | TEACH-T2A corrected patch review                  | **Done**: Codex parent validation; `forge-reviewer` / `gpt-6-sol` review                    | Exact `77cd03a7...e46bae6` patch; ready for human review with noted risks, including one privacy wording minor                                       |
| 2     | T2a migration/privacy decision                    | **Done**: owner approved the exact reviewed patch                                           | Approval recorded in TEACH-T2A; first-write and release gates remain                                                                                 |
| 3     | Approved T2a integration                          | **Done (`56ea7b3`)**: Claude Code `sonnet`                                                  | Exact approved patch only, isolated synthetic validation; changed code needs Codex re-review; no writer or serving                                   |
| 4     | `/resources` navigation accessibility             | **Done and pushed (`a02bbfa`)**                                                             | Reviewed and human-accepted CSS; local and remote accessibility checks passed; no test suppression                                                   |
| 4a    | Geography source-status browser assertion         | **Done and pushed (`a02bbfa`)**: Claude Code Sonnet integrator                              | Exact accepted test-only patch applied; subsequent independent local browser validation and remote CI passed                                         |
| 5     | Reviewed commit/push checkpoint                   | **Done**: owner-authorized push, remote CI green at `332ef01`                               | Pages deployment succeeded; publication review and production migration/application release remain separate gates                                    |
| 6     | Lifecycle L2 prerequisite/probe decisions         | Claude Code `forge-expert` / `opus`, then Codex `forge-reviewer`                            | Existing writer-free proposal, named open decisions and synthetic probe authorization; human migration/privacy approval before Sonnet implementation |
| 7     | Blocked Python increment                          | Claude Code Sonnet corrections; Codex independent review                                    | First resolve execution evidence, persistence/route-test gaps and authorized synthetic environment; no broad authoring                               |
| 8     | Six approved source-reference integrations        | Claude Code `forge-implementer` / `sonnet`, then Codex `forge-reviewer`                     | Narrow mechanical documentation scope; no repeat research or content authoring                                                                       |
| 9     | Shared bank/completion/teaching-serving contracts | Claude Code `forge-expert` / `opus`, then Codex `forge-reviewer`                            | One contract at a time, approved source/design scope and consumed decisions; T3/T4 choices are still open                                            |
| 10    | First-unit content, then runtime/UI release       | Claude Code Opus authoring; Sonnet implementation; Codex review after each frozen increment | Scoped D-61/content/store/volume approvals, human content and release gates; no automatic authoring from the roadmap                                 |

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
Do not redispatch T2a. The next proposed issue is Lifecycle L2 prerequisite/
probe decisions; obtain bounded owner scope and synthetic probe authorization
before assigning Claude Code `forge-expert` / `opus`, then Codex
`forge-reviewer` / `gpt-6.1-sol`. Human migration/privacy approval must precede
later Sonnet implementation. At a new session, inspect files, claims and
current authority before work. The local
resource-browser server is not needed; do not restart it.

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
| LIFECYCLE-L2                                                                           | **Blocked**: writer-free proposal reviewed, G12/G13 untested; L2b choices and migration/privacy approvals open                                                | Opus for unresolved design; Sonnet implementation → Codex GPT-6-Sol                           |
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

**Current intake result:** T2a and resources nav/status integration, review,
owner-authorized push and remote CI confirmation are complete. Do not repeat
those roles. First-write/serving/release gates remain. Claude Code is the
recommended next client for Lifecycle L2 prerequisite/probe decisions via
`forge-expert` / `opus`, but intake must stop at the smallest missing owner
scope/probe authorization before dispatch. Codex reviews the resulting frozen
Claude-authored increment with `forge-reviewer` / `gpt-6.1-sol`.
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
