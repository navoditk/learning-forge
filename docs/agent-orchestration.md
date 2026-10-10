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
Code/Codex. Select an available approved model explicitly and record its actual
identity. See [Claude skills](https://code.claude.com/docs/en/skills),
[Codex skills](https://developers.openai.com/codex/skills), and
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)
for client discovery and controls. Instruction files guide behavior; they do
not enforce model availability, quotas, permissions, or review independence.
