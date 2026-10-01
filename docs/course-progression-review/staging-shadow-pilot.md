# Staging shadow-pilot evidence

**Status:** Non-production evidence; not an independent review, disposition,
or C4 authorization.

## Run — 2026-09-22 (after M1/M2/M3 remediation)

- Environment: disposable local PostgreSQL database marked `staging` for the
  staging-only harness
- Command: `PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging npm run progression:shadow-pilot`
- Requests: 8 synthetic requests. Five cover the pilot's practice, placement,
  and review. Three cover practice and review on non-pilot skills under the
  legacy compatibility policy.
- Sessions created and closed: 8
- Shadow decisions: 8
- Unbound open sessions after the run: 0
- Divergences: 4, all `DENY → ALLOW` (`LOCKED_PREREQUISITE` × 2,
  `RUN_NOT_ACTIVE` × 2)

## Divergences

| Target/activity | Scope | Shadow reason | Mechanism |
|---|---|---|---|
| `unit-rates-1` / `PRACTICE` | Pilot | `LOCKED_PREREQUISITE` | `ratio-language` is unmastered; legacy `startSession` does not check prerequisites (D-05) |
| `ratio-language-1` / `PLACEMENT` | Pilot | `RUN_NOT_ACTIVE` | D-62: a unit-claimed skill needs an assessment assignment |
| `ratio-language-1` / `REVIEW` | Pilot | `RUN_NOT_ACTIVE` | D-62: a unit-claimed skill needs an assessment assignment |
| `division-of-fractions-1` / `PRACTICE` | Legacy | `LOCKED_PREREQUISITE` | The legacy policy respects the prerequisite graph (D-53) |

The two `RUN_NOT_ACTIVE` rows were invisible before M2 remediation: the prior
five-request run recorded them as non-divergent `ALLOW`. Dispositions are
recorded in `shadow-divergence-review.md`.

## Rerun — 2026-09-24 (profile `grade-6-math-default@1.1.0`)

The same 8 requests produced the same 4 divergences, now recorded under
profile `1.1.0`. Pilot `REVIEW` assignments now exist. The `REVIEW` row still
diverges because the learner UI starts assignment-free review sessions, which
D-62 refuses for pilot skills. Moving the UI to the assignment route is C4/C5
work. Placement assignments (D-64, D-68) are not yet implemented.

## Earlier run (superseded)

Before remediation, the five-request pilot-only run produced one divergence
(`unit-rates-1`, `LOCKED_PREREQUISITE`) and did not exercise the legacy
compatibility policy.

No production database, learner record, or production authorization was
changed by these runs.
