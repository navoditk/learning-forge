# Staging shadow-pilot evidence

**Status:** Non-production evidence; not an independent review, disposition,
or C4 authorization.

## Run

- Environment: disposable local PostgreSQL database marked `staging` for the
  staging-only harness
- Command: `PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging npm run progression:shadow-pilot`
- Requests: 5 synthetic requests covering practice, placement, and review
- Sessions created and closed: 5
- Shadow decisions: 5
- Unbound open sessions after the run: 0
- Divergences: 1

## Divergence requiring review

- Direction: `DENY → ALLOW`
- Target: `unit-rates-1`
- Activity: `PRACTICE`
- Shadow reason: `LOCKED_PREREQUISITE`
- Actual behavior: `ALLOWED`
- Current disposition: unresolved

The current code explains the mechanical source of the difference but does not
resolve its product meaning: `content/skills/unit-rates.json` declares
`ratio-language` as a prerequisite, `policy/access-policies/grade-6-math-access.json`
sets `respectsPrerequisiteGraph` to `true`, and the legacy `startSession` path
still allows the request. This may be the intended legacy-vs-progression-policy
delta that C4 is meant to cut over, but the implementing team cannot approve
that interpretation. An independent reviewer and product/engineering owner
must explain it or authorize the smallest remediation before C4 review can
proceed.

No production database, learner record, or production authorization was
changed by this run.
