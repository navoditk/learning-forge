# Curriculum agents

Learning Forge uses three thin, repository-scoped custom agents backed by
three model-independent skills. The skills define durable procedures and
quality gates; the agents select the model and minimum tool set.

| Agent | Model | Skill | Purpose |
|---|---|---|---|
| `curriculum-researcher` | `claude-opus-5` | `curriculum-research` | Research primary sources and prepare a cited dossier. |
| `curriculum-author` | `claude-opus-5` | `curriculum-authoring` | Build the skill graph and original content from an approved dossier. |
| `curriculum-reviewer` | `gpt-5.6-sol` | `curriculum-review` | Independently review source fidelity, coverage, pedagogy, originality, accessibility, and technical integrity. |

The reviewer intentionally uses a different model family to reduce correlated
blind spots. Model choice does not replace deterministic validation or human
approval.

## Files

- Agent profiles: `.github/agents/*.agent.md`
- Skills: `.github/skills/*/SKILL.md`
- Formal source register: `docs/curriculum-sources.md`
- Research process: `docs/curriculum-research-playbook.md`
- Authoring process: `docs/curriculum-authoring-playbook.md`
- Content review gate: `docs/content-review.md`

## Workflow

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
unrelated prompt.

## Using the skills directly

The skills remain usable without their wrappers:

```text
Use the /curriculum-research skill to research Grade 7 California Math.
Use the /curriculum-authoring skill to implement the approved Grade 7 ratios scope.
Use the /curriculum-review skill to review the Grade 7 ratios increment.
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
