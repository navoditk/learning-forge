# Claude Code entry point

@AGENTS.md

Follow the shared rulebook above. Start with `docs/08-cli-build-guide.md`
and the task-specific handoff it names. Do not treat `.github/agents/` as
native Claude Code subagent configuration; use the shared playbooks directly.

For multiple terminals and provider switches, read
`docs/coding-agent-handoff.md` and follow `docs/agent-orchestration.md`.
Finish the claimed role and tell the human exactly which terminal to use next.

No pasted startup prompt or model flag is required: on the first task turn,
read that index automatically. Use the project-configured forge roles when
the packet needs a different model from the Sonnet parent. Never treat Opus
review of Claude-authored work as cross-family independent review.
