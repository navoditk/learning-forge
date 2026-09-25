# Course-progression unblock bundle

This directory contains the human-review artifacts required before Stage C4.
Some records below are product-owner risk acceptances for the scoped pilot;
they do not replace independent review, C3 evidence, or legal/contractual
approval.

## Current status

| Gate | Artifact | Status |
|---|---|---|
| Fourth-draft architecture and C1–C3 review | `independent-review.md` | **Completed 2026-09-22 for `b7934bc`: do not approve (M1, M2)** |
| Reviewer handoff packet | `independent-review-request.md` | **Ready to send** |
| Representative C3 shadow review | `shadow-divergence-review.md` | **Awaiting representative traffic and review** |
| Staging synthetic shadow evidence | `staging-shadow-pilot.md` | **Re-collected 2026-09-22 after remediation: 4 divergences; 2 explained, 2 require remediation (pilot placement/review assignments)** |
| Accessibility | `accessibility-acceptance.md` | **Product-owner accepted for scoped pilot; evidence assumed** |
| Privacy/data | `privacy-data-acceptance.md` | **Product-owner accepted for scoped pilot; residual risks recorded** |
| Child safety | `child-safety-acceptance.md` | **Product-owner accepted for scoped pilot; safety-owner reinforcement remains** |
| C4 execution | `c4-cutover-runbook.md` | **Prepared; not authorized** |

The private held-out assessment package is deliberately not included here.
Install it through the approved private delivery channel and record only its
version, digest, and review status in the independent review artifact. Do not
commit assessment prompts, answers, or learner data to this repository.
Use `private-assessment-package-handoff.md` for the exact bank and volume
requirements.

## Order of use

1. An independent reviewer completes `independent-review.md` against the
   handoff, architecture, decisions, `AGENTS.md`, and the U1–U6/U28–U31
   acceptance claims.
2. Run representative C3 traffic in the approved non-enforcing environment.
   Export the complete redacted readiness/shadow report with
   `npm run progression:shadow-review`. If prior dispositions exist, provide
   `SHADOW_REVIEW_DISPOSITIONS_FILE=/secure/path/dispositions.json`. Complete
   `shadow-divergence-review.md` for every divergent row. An empty report is
   intentionally not approval.
   The staging-only harness is `PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging
   npm run progression:shadow-pilot`; it refuses to run against production.
3. The named owners complete `manual-gate-record.md`, including the private
   assessment-package reference and the accessibility, wording, privacy, and
   content decisions.
4. Only after all preceding artifacts are signed may an authorized operator
   execute `c4-cutover-runbook.md`.

## Operational commands

- Drain an explicitly selected legacy session only after operator review:
  `npm run progression:drain -- --session-id=<uuid> --reason=<reason> --confirm`.
  The command preserves attempts and refuses bound or missing sessions; it
  has no bulk or age-based default.
- Mount the reviewed private assessment package through
  `LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`. The JSON package must contain a
  `banks` array of validated assessment items. If the variable is absent or
  the package is invalid, assessment requests fail closed.

## Evidence rules

- Use UTC timestamps and immutable commit/environment identifiers.
- Record commands and counts, not learner identifiers or free text.
- Keep review findings separate from approval decisions.
- A reviewer must mark every finding `blocker`, `major`, `minor`, or `none`;
  blank sections are incomplete.
- The implementation team cannot approve its own changes.
