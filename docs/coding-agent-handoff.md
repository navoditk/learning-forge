# Cross-client resume index

Start here when continuing Learning Forge in Claude Code, Codex or Copilot.
Read `AGENTS.md`, then the terminal-handoff procedure and approved native
model mappings in `docs/agent-orchestration.md`. This index is a checkpoint,
not an approval register or an automatic task scheduler.

## Checkpoint and authority

As of 2026-10-10, teaching T1 is integrated after Sonnet 5.5 implementation
and GPT-6.1 Sol cross-family review. It adds disconnected schemas and synthetic
tests only. `npm run verify` passed: 85 files / 1,641 tests, formatting, lint,
types, down-migration presence, fake evals and build.

The five AMC 8, MOEMS, Kangaroo, MATHCOUNTS and Spelling first-unit designs
are accepted; the shared catalog foundation is integrated. They are not
active courses and no full-course content-authoring packet is authorized.

The decision matrix has 80 approved choices (D-01–D-75, D-139/D-142 and
D-145–D-147) and 67 open choices.
Contract acceptance and D-139/D-142 approve T1 only.
Use `docs/course-progression-decisions.md` for exact scope and
`docs/course-progression-review/manual-gate-record.md` for release authority.
`docs/course-progression-handoff.md` is the detailed progression entry point.

Active packet: `docs/agent-handoffs/TEACH-T2A.md`, isolated schema/privacy-
coverage/migration draft and disposable local scratch validation authorized
on 2026-10-10. T2 proposal/review accepted, D-145–D-147 approved. Sonnet
returned a frozen 14-file draft. GPT review returned **changes requested**:
three majors and one minor; see
`docs/course-progression-review/teaching-t2a-20261010-review.md`.
Bounded Sonnet corrections are now authorized and assigned in isolation,
followed by GPT changed-hash re-review. Human migration review is required before main
integration. At a new session, inspect files,
claim a bounded role and confirm its scope before implementation. The local
resource-browser server is not needed; do not restart it.

## Local checkout warning

Recorded pre-checkpoint-commit main HEAD: `d70287d`.
Re-read current HEAD and worktree status; other sessions can advance it.
The owner authorized coherent **local-only** checkpoint commits after the
startup push. Reviewed publication/source fixes, disconnected recall/lifecycle
foundations, shared catalog, teaching T1 and reviewed design/research records
are included; pending design/authoring/release gates remain pending.
Verify current commit and dirty status rather than assuming the recorded SHA
contains those later checkpoint commits.
Do not reset it, pull over conflicting edits, copy the whole directory or
assume a fresh worktree contains those inputs.

In a second local terminal, read this same checkout. For an isolated writer,
the integrator supplies an allowlisted overlay and hashes for the task's
uncommitted/untracked dependencies before work begins. Record that effective
baseline in its packet. Startup commit/push and later reviewed checkpoint
local commits are separately authorized; **no push of the later checkpoints**
or commit of T2a implementation is authorized by that sequence.

The later owner "proceed ... commit/push as needed" permits reviewed
checkpoint/status commits and a recommended push, but does not clear human
migration gates. Push is currently held: the latest remote CI run
`38108327463` at startup commit `d70287d` fails two `/resources` mobile
WCAG target-size tests (70 passed, one skipped); the earlier main run also
failed. No T2a schema change is a fix for that unrelated UI blocker.

Local checkpoint commits make reviewed course/T1 code and linked records
resolvable locally, but are not on origin until a separately approved push.
The unreviewed T2a Prisma/migration draft remains isolated and excluded.
Geography/Olympiad prerequisite drafts and their advisory reports remain
uncommitted because original-author provenance is unresolved; their references
describe pending local artifacts, not portable approved inputs. Older
progress-log edits are also preserved outside the checkpoint commits.
A clean clone of origin must report missing inputs rather than treating this
index's local-state summary as remotely integrated behavior.

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
| TEACH-T2/T3 implementation                                                             | T2a review requests R1–R4 corrections; then independent re-review and human migration/privacy approval. D-143/D-144 remain open before writers                | Claude Code Sonnet → Codex GPT-6-Sol                                                          |
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
Codex `gpt-6-sol` for review/design and `gpt-5.6-luna` for approved
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

**Current intake result:** T1 is complete; TEACH-T2-PROPOSAL now has
writer-free proposal/review accepted and D-145–D-147 approved. TEACH-T2A
isolated draft/scratch validation has returned from Sonnet; do not
duplicate it or touch production. Review and human migration approval
must precede integration.
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
