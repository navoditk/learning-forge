# Curriculum agents

Learning Forge uses thin, repository-scoped custom agents backed by
model-independent skills. The skills define durable procedures and quality
gates; the agents select the model and minimum tool set.

## Portability

The profiles under `.github/agents/` are Copilot-specific wrappers. Claude
Code and Codex should use `AGENTS.md` and the same `docs/` playbooks directly;
they need not discover these profiles or skills to perform the role.
Model identifiers and tool aliases in a profile are not portable configuration.
Use the approved allocation in `docs/agent-orchestration.md`, preserve independent review
and human approval boundaries, and report model identity as unverified if it
cannot be confirmed. Do not silently substitute a model for an explicitly
requested model.

See `docs/08-cli-build-guide.md` for shared startup and handoff prompts.

## Curriculum authoring track

| Agent | Model | Skill | Purpose |
|---|---|---|---|
| `curriculum-researcher` | `claude-opus-5.5` | `curriculum-research` | Research primary sources and prepare a cited dossier. |
| `curriculum-author` | `claude-opus-5.5` | `curriculum-authoring` | Build skills and original content from approved research. |
| `curriculum-reviewer` | `gpt-6.1-sol` | `curriculum-review` | Independently review research or authored content. |

## Course progression track

| Agent | Model | Skill | Purpose |
|---|---|---|---|
| `course-progression-architect` | `claude-opus-5.5` | `course-progression-design` | Specify progression; no runtime implementation. |
| `course-progression-reviewer` | `gpt-6.1-sol` | `course-progression-design` (review standard) | Independently review the specification. |
| `course-progression-implementer` | `gpt-5.4-mini` | `course-progression-design` (binding spec) | Implement one approved stage with named tests. |
| `course-progression-implementation-reviewer` | `claude-opus-5.5` | `progression-implementation-review` | Review the pinned runtime patch and executable evidence. |

## UI track

| Agent | Model | Skill | Purpose |
|---|---|---|---|
| `ui-implementer` | `claude-sonnet-5.5` | `ui-implementation` | Rich accessible interactions; escalate complex design to Opus 5.5. |
| `ui-reviewer` | `gpt-6.1-sol` | `ui-review` | Independent visual, interaction, evidence, and accessibility review. |

These defaults were approved in chat on 2026-10-09. Actual-model diversity,
single-provider exceptions, and quota fallback follow
`docs/agent-orchestration.md`, not profile intent. Model choice does not replace
deterministic validation or human approval.

## Current pause on new curriculum authoring

**New curriculum authoring is paused pending the course-progression pilot
architecture and its independent review.** Research may continue, and the two
outstanding research dossiers (International Geography Bee Grade 6, Science
Olympiad Division B) remain independently pending product/content-owner
review. Do not start a new authoring increment until
`docs/course-progression-architecture.md` has passed independent review and
recorded human approval.

The reason is sequencing, not quality: the progression architecture changes
what a content record must carry (an explicit `role`, with role-specific
schemas in which teaching records have no validator or hint ladder and
assessment records are forbidden one), how assessment banks are separated from
instruction and whether they live in this repository at all, and what a lesson
is. Authoring more content against the current shape would create records that
need reworking, and would grow the review queue for a structure that is about
to change.

**Architecture approval alone does not lift the pause.** The full gate set is
`D-61` in `docs/course-progression-decisions.md`: the publication hotfix
(`D-58`, Stage A0) must ship, `D-01` must be resolved (plus `D-02` if
held-out, and `D-03`), the record-shape decisions (`D-37`, `D-38`, `D-56`,
`D-57`, `D-40`) must be resolved, the rollout decision (`D-52`, plus `D-53` if
hybrid) must be made, and Stages A0 and A1 must be merged so the role schemas
exist to author against.

Those decisions are approved and the early role-schema stages shipped.
Inspect current program-specific validators and the D-61 gate before authoring;
the historical exactly-two invariant is not a universal current rule.
The authoring pause remains in force until a dated product-owner lift under
D-61; only recorded scoped exceptions apply. D-01 Branch B assessment items
never belong in public `content/`; private-package authoring needs explicit
scope and review.
Already-approved programs remain available and unchanged.

## Files

- Agent profiles: `.github/agents/*.agent.md`
- Skills: `.github/skills/*/SKILL.md`
- Formal source register: `docs/curriculum-sources.md`
- Research process: `docs/curriculum-research-playbook.md`
- Authoring process: `docs/curriculum-authoring-playbook.md`
- Content review gate: `docs/content-review.md`
- Progression specification: `docs/course-progression-architecture.md`
- Progression decision matrix: `docs/course-progression-decisions.md`
- Progression decision record: `docs/adr/0013-course-progression-structure.md`

## Curriculum workflow

1. Select `curriculum-researcher` with `/agent`, then ask it to research a
   precisely named subject, grade, jurisdiction/program, and school context.
2. A human product/content owner reviews the resulting section in
   `docs/curriculum-sources.md` and explicitly marks it approved.
3. Select `curriculum-author` and give it the approved source-section name
   plus one issue-sized scope. It creates records and tests but leaves all
   new content pending review.
4. Select `curriculum-reviewer`. It performs a read-only independent review
   and reports findings and readiness for human review.
5. The human product/content owner resolves findings and grants or withholds
   final approval.

The agents set `disable-model-invocation: true`, so Copilot will not select
them automatically; a user must choose them deliberately. This avoids
accidentally initiating high-cost research or authoring work from an
unrelated prompt. All repository profiles follow this convention.

## Course progression workflow

1. Confirm the target program has an approved source dossier and reviewed
   skills, and that the phase boundary is explicit (specification-only, or
   implementation of an approved increment).
2. Select `course-progression-architect` with `/agent`. It re-derives current
   behavior from code, then produces or extends a specification in `docs/`.
   It writes no runtime code, authors no lesson content, adds no dependency,
   and writes no migration.
3. Select `course-progression-reviewer`. It reviews read-only and
   independently, re-deriving the current-behavior inventory itself, and ends
   with one readiness recommendation. It cannot approve.
4. The human product owner resolves every open entry in
   `docs/course-progression-decisions.md` that the next increment touches, and
   records approval.
5. Select `course-progression-implementer` and give it one issue-sized stage
   from the approved specification. It implements exactly that stage with the
   named tests and leaves it pending independent review. Early stages are
   deliberately catalog- and policy-only: they add no migration and no
   content.

6. Select `course-progression-implementation-reviewer` for read-only review of
   the exact implementation revision before human approval or integration.

Step 4 is not optional. The architect is required to leave every threshold,
delay window, spacing interval, pass bar, skip bar, cooldown, and
content-volume range open in the decision matrix with a named approver; the
implementer is required to refuse any parameter whose status is still `OPEN`
rather than substituting a recommendation or a default.

## Using the skills directly

The skills remain usable without their wrappers:

```text
Use the /curriculum-research skill to research Grade 7 California Math.
Use the /curriculum-authoring skill to implement the approved Grade 7 ratios scope.
Use the /curriculum-review skill to review the Grade 7 ratios increment.
Use the /course-progression-design skill to specify progression for Grade 6 ELA.
```

After adding or changing a skill during an active CLI session, run
`/skills reload`. Use `/skills info curriculum-research` (or the other skill
name) to confirm discovery. Use `/agent` to select one of the custom agents.

## Model and configuration limitations

The supported custom-agent frontmatter pins a `model`, but does not provide
portable `context-tier` or `reasoning-effort` fields across GitHub.com,
Copilot CLI, and IDEs. The agents therefore pin the model only and state the
required thoroughness in their prompts. Where the client exposes additional
model controls, use long context and high reasoning for research/authoring,
and long context with the highest practical reasoning setting for review.

The skills contain no model names. This is intentional: if model quality,
availability, or price changes, update only the thin agent profile while the
workflow and safety gates remain stable.

The `web` tool alias is available to the Copilot CLI but is currently ignored
by Copilot cloud agent. Run source research through the CLI, or configure and
allowlist an appropriate read-only MCP source-retrieval tool before using the
research agent in the cloud. Do not treat a cloud run without source access
as a completed research dossier.
