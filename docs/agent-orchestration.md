# Agent orchestration and model policy

Tool-neutral entry point for bounded parallel development. Read `AGENTS.md`,
then `docs/development-expansion-plan.md` for the current backlog. Procedures
live in playbooks; native profiles are optional launch adapters.

## Approved model allocation

Approved by the product owner in chat on 2026-10-09. Approval covers these
development roles, not production tutor changes, unlimited fleet spending,
curriculum publication, or release authorization.

| Role / skill                                                            | Default model       | Tier                                                                 |
| ----------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| Curriculum research / `curriculum-research`                             | `claude-opus-5.5`   | Premium research                                                     |
| Curriculum authoring / `curriculum-authoring`                           | `claude-opus-5.5`   | Premium subject accuracy                                             |
| Curriculum research and authoring review / `curriculum-review`          | `gpt-6.1-sol`       | Premium independent review                                           |
| Progression architecture / `course-progression-design`                  | `claude-opus-5.5`   | Premium design                                                       |
| Progression design review                                               | `gpt-6.1-sol`       | Premium independent review                                           |
| Progression implementation                                              | `gpt-5.4-mini`      | Bounded implementation                                               |
| Progression implementation review / `progression-implementation-review` | `claude-opus-5.5`   | Premium independent review                                           |
| UI design and implementation / `ui-implementation`                      | `claude-sonnet-5.5` | Capable implementation; escalate complex design to `claude-opus-5.5` |
| UI review / `ui-review`                                                 | `gpt-6.1-sol`       | Premium independent review                                           |

Content generation is not merely mechanical implementation: standards mapping,
solutions, misconceptions, and pedagogy justify premium authoring. Use cheaper
models for execution of already-reviewed contracts, not for silently designing
new policy. Escalate a bounded task when concrete failures require it.

## Actual-model independence

Before a review starts, record the executor and reviewer tool, actual model ID,
model family, revision/commit or patch identifier, and how identity was verified
(client metadata or confirmed model selection, not the model's self-report).

- In a multi-provider environment such as Copilot, required independent
  reviews use a different actual model family from the executor.
- In single-provider Claude Code or Codex, routine reviews may use a different
  actual model in a fresh context. Claude Sonnet implementation with Opus
  review, or GPT Mini implementation with GPT Sol review, are reduced-diversity
  options, not cross-family review.
- Critical safety, privacy, scoring/mastery, authorization, held-out content,
  or destructive migration changes always require cross-family review.
  Hand the revision to another tool/provider if necessary.
- A new session, different reasoning effort, or changed prompt on the same
  model is not model diversity. Unknown IDs/families mean `UNVERIFIED`, not
  compliant. Report the block; do not mark the review gate complete.
- Reviewers re-derive conclusions from artifacts and tests, not executor
  self-evaluation. They do not edit the reviewed patch or approve release.
  A changed patch needs review of the changed scope.

The single-provider exception was explicitly approved on 2026-10-09. If a
premium executor cannot obtain a different capable reviewer within one
provider, transfer review rather than downgrade a high-risk review.

## Quota fallback and alternatives

The product owner approved Claude/GPT alternatives only; ask before using
Gemini or Grok. Switch only after an observed quota/unavailability error, not
speculation. Save a checkpoint, record the failed model/error category without
credentials, choose an approved role-appropriate alternative, and verify
independence against the actual executor of every reviewed part.

Premium alternatives are Opus 5.5 and GPT-6.1 Sol; bounded implementation
alternatives are GPT-5.4 Mini and Sonnet 5.5. Premium work may escalate to the
premium alternatives. A changed executor may require a changed reviewer.
If no eligible reviewer remains, pause that review; continue unrelated ready
tasks instead. Never silently change an explicitly requested model outside
this approved policy.

Gemini 3.7 Flash and Grok 4.7 are **unapproved qualification candidates**, not
claimed equivalents to Opus 5.5 or GPT-6.1 Sol. After approval, qualify on
synthetic source-fidelity, subject correctness, adversarial review, UI defect
detection, and structured-handoff cases; compare verified results, latency,
cost, tool support, and availability. Do not infer equivalence from vendor
branding or general benchmarks. Development model IDs may differ by client;
verify availability and do not invent mappings.

## Parallel work graph

For each program:

`research -> independent research review -> human source approval ->
authoring -> independent content review -> human content approval ->
integration`

UI design can run beside research against synthetic fixtures; serving real
curriculum waits for its approval and the applicable progression gates.
Implementation review follows the exact completed patch; integration follows
review and validation. Human product/content/policy/privacy/release decisions
remain human decisions. An LLM judge supplies structured advisory findings,
never authoritative learner scores or permission to bypass a gate.

Research for different programs is independent. Each reviewer receives only
its program's source dossier and reviewed revision. Shared schema, policy,
program-registry, main-page UI, and migration work is NOT independent: assign
one owner and serialize those edits.

## Fleet execution contract

1. Coordinator defines a task packet: ID, program/scope, approved inputs,
   expected artifacts, owned files, prerequisites, actual model allocation,
   acceptance criteria, test commands, and stop conditions. Request a fleet
   explicitly; a documented plan is not permission to launch all backlog work.
2. Use isolated git worktrees for writers. Research workers write separate
   dossier artifacts, never append concurrently to `curriculum-sources.md`.
   One integrator publishes the approved source register and `PROGRESS.md`.
   Review workers are read-only.
3. Launch only ready, independent tasks. No fixed pool of agents reused across
   unrelated curricula. Use the minimum workers appropriate to the batch;
   preserve user ceilings and report cost/quota constraints, never invent
   unlimited concurrency.
4. Pass scoped files and acceptance criteria, not whole chat histories or the
   entire progress log. Return concise findings and artifact references.
   Load only the needed skill/playbook; avoid duplicated parent investigation.
5. After each completion, checkpoint task status, revision, evidence, model
   provenance, findings/disposition, blockers, and next task. Failed or
   interrupted tasks remain incomplete and must not look like success.
6. Integrator checks shared contracts and collisions, applies reviewed work,
   runs applicable synthetic validation, and updates durable status. Never
   run shared-database tests concurrently without isolated databases.
7. Use Copilot fleet facilities or native client orchestration when available;
   otherwise use separately launched sessions/worktrees and the same packets.
   No vendor-specific orchestration is required to understand or resume work.

## Human-operated terminal handoffs

Use `docs/coding-agent-handoff.md` as the cross-client resume index. This
procedure adds no task, model, spending or release authorization. Existing
playbooks and the decision matrix remain authoritative.

### Routing and stop conditions

No launch flags or pasted role prompt are required in clients that load the
project configuration. `AGENTS.md` routes the first task turn through the
resume index. Claude defaults to Sonnet and Codex to native GPT Sol.
Each client has native `forge-implementer`, `forge-expert` and
`forge-reviewer` role definitions with explicit model selection. Delegate
one bounded substantive role when the parent is not the correct executor;
never run a fleet or duplicate parent/worker work for model routing.
The command flags in the table are diagnostic/fallback equivalents, not
required launch arguments. Review still goes to the other model family.

Root instructions load as context; they neither synthesize a user turn nor
change a running parent's model. A waiting client needs only "continue",
not a pasted packet. If no approved packet is assigned, intake stops at its
approval request. Configuration may require project trust or be overridden
by higher-priority settings; missing discovery/model evidence blocks dispatch.

| Work                                                | Preferred native executor             | Next terminal                                                 |
| --------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Defined implementation or UI                        | Claude Code `--model sonnet`          | Codex `-m gpt-6-sol` for independent review                   |
| Research, curriculum authoring or unresolved design | Claude Code `--model opus`            | Codex `-m gpt-6-sol` for independent review                   |
| Approved bounded implementation allocated to Codex  | Codex `-m gpt-5.6-luna`               | Claude Code `--model opus` for independent review             |
| Approved research/design allocated to Codex         | Codex `-m gpt-6-sol`                  | Claude Code `--model opus` for independent review             |
| Integration and deterministic validation            | One explicitly claimed client/session | Human gate or next scoped packet; not another automatic agent |

These are the existing approved native mappings, not claims of cost or
quality equivalence. For defined implementation prefer Sonnet per the owner's
later instruction. Verify alias resolution/model-list selection and successful
turn metadata as described below; unknown identity cannot clear review.
If the reviewer authored any section, route that section to the other family
and record split authorship. A correction by the original author goes back
to the same reviewer for changed-scope review, not a new full audit.

Finish the assigned role, not the whole backlog. At completion, quota/access
failure or an approval boundary, persist the packet before stopping. Do not
repeatedly retry a depleted client, start a fleet, run paid smoke tests or
change subscriptions to continue. A quota failure can route execution to
an already-approved role-appropriate alternative, but never erase human gates.
Estimate neither remaining provider capacity nor credits from token totals.
If interrupted before checkpointing, resume by inspecting the actual files,
not treating the last success message as proof.

### Ownership with several terminals open

- The human designates one integrator for the active batch. Other terminals
  are scoped workers or read-only reviewers; idle terminals are not owners.
- Before writing, acquire an advisory atomic directory claim in the common
  Git metadata directory (resolve it with
  `git rev-parse --path-format=absolute --git-common-dir`).
  Store claims under `agent-claims/`: `integrator.lock` for the integrator,
  `<task-id>.lock` for a worker. Acquire with a single `mkdir`, not a
  check-then-create; failure means **do not write**. Record task, client/model,
  role, worktree, owned paths and start time in that claim, without secrets.
  The integrator claim does not block independent workers' task claims.
- Claims are advisory coordination for cooperating local sessions, not
  authorization, a distributed lock or protection against other editors.
  The packet's owned paths and existing repository rules still govern.
- Each writer uses a distinct worktree and explicit owned paths. Shared
  schemas, registries, source indexes, decision matrix and integration/status
  edits are serialized by the integrator. Workers return a patch/report;
  they do not update shared PROGRESS/handoff files. A reviewer must not read
  a patch while its author is changing it.
  Before assignment the integrator checks active claims for overlapping
  owned paths; different task IDs do not make shared-file edits independent.
- The author marks the artifact frozen and stops writing before review.
  Corrections reopen that same worker role; freeze and repin afterward.
  Reviewers report without editing, installing or mutating the worktree.
- After checkpointing, release only the claim the session owns; remove its
  named metadata files and then the empty directory. Never auto-steal claims
  by age. For a stale claim, the human confirms the former owner has stopped
  before authorizing targeted cleanup. Never clear other claims or worktrees.
- Integration checks the frozen hash and current base, applies only the
  reviewed patch, resolves collisions without overwriting existing work, and
  validates the integrated tree. Shared database/browser/build jobs must
  not run concurrently against shared state; use the documented synthetic
  isolation and preserve any required approval.

### Durable task packet

The integrator maintains one small packet per actual assigned task under
`docs/agent-handoffs/<task-id>.md`, referenced by the resume index. This
location is for safe task metadata, never raw child data, credentials,
private assessment items, full logs or proprietary source text. Do not create
packets for every hypothetical backlog item.

Every packet records:

1. Task ID, phase (`SCOPING`, `IMPLEMENTING`, `AWAITING_REVIEW`,
   `CHANGES_REQUESTED`, `AWAITING_HUMAN`, `READY_TO_INTEGRATE`, `DONE` or
   `BLOCKED`), claimed role/client/model and owned files.
2. Exact approved scope and approval citations; prohibited actions and
   remaining human gates. Planning permission is not implementation approval.
3. Main HEAD, worktree HEAD and **effective uncommitted baseline**: an
   allowlisted overlay/patch and untracked inputs with file hashes if needed.
   `git diff` alone omits untracked files. New worktrees and fresh clones
   do not inherit the coordinator's uncommitted state.
4. Required docs and artifacts, repository-relative where possible; frozen
   patch/specification hash, changed-file list and original author model
   provenance. Include enough evidence to recreate the result locally.
5. Exact commands and results, what was not run and why, findings and
   dispositions. Do not infer runtime correctness from a proposal.
6. One bounded next action, its eligible client/model, stop condition and
   copy-paste prompt.

Large local patches and sanitized command output may live under
`agent-handoffs/` in the resolved common Git metadata directory; record their
resolved paths and hashes in the packet. They are local artifacts, not in
GitHub and not transferred with a clone. Do not relocate or delete existing
session artifacts until their needed contents have been verified in the
new handoff. If moving machines, the human explicitly approves either a
reviewed commit/push or transfer of an allowlisted non-sensitive patch/input
bundle. Never copy `.env`, whole session folders or private banks.

### Required terminal-switch message

End a role with one of these labels and fill in every field:

```text
SWITCH TO: <Claude Code or Codex>, <configured forge role>
ROLE: <read-only reviewer / original-author corrections / integrator>
TASK: <task ID and packet path>
ARTIFACT: <frozen patch/spec path and SHA-256>
DO NOW: <one bounded action>
STOP AFTER: <report / corrected patch / integrated validation>
START: <plain claude or codex; "continue" if idle>
RECOVERY PROMPT: <only if instruction discovery fails; reference packet and authority>
```

For an undecided parameter, write `WAITING FOR HUMAN APPROVAL`, identify only
the consumed decision IDs and recommendation, and stop before implementing
them. For a missing artifact/model/permission, write `BLOCKED`, identify the
missing evidence and recovery action. Do not say "switch" as a substitute for
an approval. The human runs the terminal command; agents cannot transfer live
chat context or switch another client's account/session automatically.

## Portable discovery

### Observed client verification (2026-10-09)

All seven project skills were discovered by fresh Copilot commands, a fresh
Codex app-server `skills/list` request (enabled, zero errors), and a fresh
tool-disabled Claude session's startup `slash_commands` metadata. Copilot
instruction discovery lists `AGENTS.md`, `CLAUDE.md`, and
`.github/copilot-instructions.md`.

Model usability is a separate check. Initial full-ID checks were blocked:
Claude initialized with both approved Sonnet 5.5 and Opus 5.5 IDs, but the
Opus attempt returned an unavailable/access error and neither attempt produced
successful response-model usage metadata. Startup configuration does not prove
a model served the request.

Codex `model/list` offered `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`,
`gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`, not the approved
`gpt-5.4-mini` or `gpt-6.1-sol`. These listed alternatives are availability
evidence only, not approved role substitutions or claims of equal quality/cost.
The product owner subsequently approved native mappings below. Retain the
approved Copilot profile defaults; native IDs are client-specific, not a
replacement for those profiles.

| Native client                                | Approved selection | Verification                                                                                                       |
| -------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Claude Code implementation/UI                | `--model sonnet`   | Successful tool-disabled response and usage metadata identify `claude-sonnet-5-5`                                  |
| Claude Code research/authoring/design/review | `--model opus`     | Successful tool-disabled response and usage metadata identify `claude-opus-5-5`                                    |
| Codex bounded implementation                 | `-m gpt-5.6-luna`  | Available in `model/list`; explicit-selection ephemeral read-only invocation completed with token usage and exit 0 |
| Codex research/design/review                 | `-m gpt-6-sol`     | Available in `model/list`; explicit-selection ephemeral read-only invocation completed with token usage and exit 0 |

Native mappings were approved in chat on 2026-10-09 before invocation.
The native table supplies the approved client-specific selections for the
role and fallback policy above; it does not authorize a lower-tier research
or review model. Assign reviewers by actual executor family, not by the
table's default pairing. In particular, Claude-implemented critical progression
work must be reviewed by GPT, not another Claude model.
Codex's exec completion stream does not expose a response-model ID; evidence
is the explicit client model selection, matching model-list entry, and a
successful completed turn, not the model's self-report. Claude aliases may
change in later client releases: verify resolved IDs at every review and do
not assume a historic alias resolution still holds.

Premium execution within one native provider may leave no different premium
review model approved; route review to the other client/provider instead.
Critical changes always retain cross-family review. These smoke tests confirm
access and discovery, not quality/cost equivalence, all-model Copilot
availability, or automatic enforcement of review independence.

### Independent confirmation

The corrected shared policy packet was reviewed in a tool-disabled native
Claude session: response and usage metadata identify `claude-opus-5-5`.
Executor was this Copilot session's GPT-6.1 Sol, identified by host model
configuration. Recommendation: ready for human review with noted risks, not
approval. The reviewer flagged a recorded 2026-10-10 gate date; the manual
gate record contains that exact date, so it was retained as recorded rather
than changing a signed decision on reviewer inference.

Native Codex confirmation used explicit `gpt-6-sol` selection and a successful
completed turn. It found remaining unconditional held-out wording in the UI
implementation wrappers, after the playbook was fixed. Those wrappers require
the same authorized-assigned-prompt exception; both were corrected and a
targeted native GPT-6-Sol re-confirmation returned READY with no remaining
blocker/major in that distinction. These checks are scoped to
documentation/configuration, not runtime release.

Canonical skill bodies live in `.github/skills/`. Repository-relative links
at `.claude/skills` and `.agents/skills` expose the same bodies to Claude Code
and Codex, without three editable copies. Verify discovery in a fresh client;
if links or native discovery are unsupported, read the named `SKILL.md` and
playbook directly. The `.github/agents/` profiles are Copilot-specific; do not
copy their tool aliases or model IDs into another client's config blindly.

Use the role table above and the playbook as a native task packet in Claude
Code/Codex. The project role selects its approved model; record the actual
identity and do not require launch flags. See [Claude skills](https://code.claude.com/docs/en/skills),
[Codex skills](https://developers.openai.com/codex/skills), and
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)
for client discovery and controls. Instruction files guide behavior; they do
not enforce model availability, quotas, permissions, or review independence.

Native configuration references:
[Claude model settings](https://code.claude.com/docs/en/model-config),
[Claude custom subagents](https://code.claude.com/docs/en/sub-agents),
[Codex project configuration](https://developers.openai.com/codex/config-basic)
and [Codex custom agents](https://developers.openai.com/codex/subagents).
