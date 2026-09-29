# C3 shadow-divergence review

**Status:** TEMPLATE — not a review result or approval

## Run record

- Environment (must be non-enforcing):
- Run start/end (UTC):
- Repository commit:
- Policy profile/version/hash:
- Algorithm version:
- Traffic source and representative-scope description:
- Readiness command:
  `DATABASE_URL=… npm run progression:readiness`
- Redacted report location/digest:

### Evidence-window log

| Deploy | Commit | Live at (UTC) | Predicate change | Window status |
|---|---|---|---|---|
| `dep-datjcstg1s2s73f4i64g` | `ad29e7d` (PR #43: M1–M3, D-62, access policy 1.1.0) | 2026-09-29T03:56:10Z | Algorithm-version scoping, D-62 assignment rule, `grade-6-math-access@1.1.0`, profile `1.0.0` | Opened. Earlier rows are excluded |
| (pending) | PR #44 (D-63–D-71) | — | D-65 practice mapping, unit-scoped placement exemption, profile `1.1.0` | Must restart at this deploy; rows before it are excluded or dispositioned separately |

This deploy was the first successful production build since the
content-archive script broke `db:deploy`. Every build from 2026-09-23 until
this one failed, so production had been running an older revision.

## Aggregate evidence

- Unbound open sessions:
- Drain complete:
- Total shadow decisions:
- Divergent decisions:
- Allow → deny:
- Deny → allow:
- Reason-code counts:
- Review complete:

An empty shadow set is **not** representative evidence and cannot be marked
complete.

**Evidence window.** `ShadowDecision` rows record the progression-profile ref
and hash but not the access-policy version or predicate version. The M1/M2/M3
remediation changes the access policy and the predicate without changing the
profile hash. The representative window must therefore **start at the deploy
of the remediation commit**. Record that deploy's UTC time and commit in the run
record above, and exclude earlier rows or disposition them separately. Adding
access-policy and predicate-version columns would remove this procedural
dependency; that would be a reviewed migration.

Do not paste household IDs, learner IDs, prompts, answers, or free text into
this artifact.

## Divergence disposition register

Add one row for every divergent decision in the redacted packet. The decision
ID and target reference are the only identifiers needed here.

| Decision ID | Target/activity | Shadow decision | Actual behavior | Reason code | Disposition (`EXPLAINED` / `REQUIRES_REMEDIATION`) | Explanation or remediation issue | Reviewer/date |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Staging synthetic dispositions (not representative evidence)

These rows come from the staging-only harness
(`PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging npm run progression:shadow-pilot`),
run 2026-09-22 on a disposable local database. The working tree was based on
`14e8be4` and included the M1/M2/M3 remediation. The run had 8 requests and 8
decisions, 4 of them divergent (all `DENY → ALLOW`), with 0 unbound sessions
and 0 incomplete-context rows. Decision IDs are ephemeral to that database.
Dispositioning these rows does **not** complete the representative review
above, which still needs real non-enforcing traffic.

| Target/activity | Shadow decision | Actual behavior | Reason code | Disposition | Explanation | Decided by/date |
|---|---|---|---|---|---|---|
| `unit-rates-1` / `PRACTICE` (pilot) | DENY | ALLOWED | `LOCKED_PREREQUISITE` | `EXPLAINED` | Skill graph requires `ratio-language`; access loss acknowledged by D-05; consistent with D-35 | Product owner (in chat), 2026-09-22 |
| `ratio-language-1` / `PLACEMENT` (pilot) | DENY | ALLOWED | `RUN_NOT_ACTIVE` | `EXPLAINED` | D-62 requires an assignment here. Pilot `PLACEMENT` assignments now exist (PR #44, D-64/D-68/D-71). `getDiagnosticPlan` no longer suggests unit-claimed root skills (handoff item #2), closing the suggestion-driven path. A caller can still start a `PLACEMENT` session directly by content ID pre-C4 (proven by an explicit test); this is intended fail-open behavior that C4's fail-closed enforcement removes, not a remaining gap | Implementer disposition, 2026-09-29 |
| `ratio-language-1` / `REVIEW` (pilot) | DENY | ALLOWED | `RUN_NOT_ACTIVE` | `EXPLAINED` | D-62 requires an assignment here. Pilot `REVIEW` assignments now exist (PR #44, D-67). `getReviewQueue` no longer suggests unit-claimed skills (handoff item #2), closing the suggestion-driven path. Same direct-start caveat as above, closed at C4 | Implementer disposition, 2026-09-29 |
| `division-of-fractions-1` / `PRACTICE` (legacy) | DENY | ALLOWED | `LOCKED_PREREQUISITE` | `EXPLAINED` | The legacy policy respects the prerequisite graph (D-53), so practice cannot start until `fraction-decimal-operations` is mastered; access loss acknowledged by D-05. The `EXPLAINED` recommendation came from the implementer, and the owner accepted it | Product owner (in chat), 2026-09-22 |

Non-divergent legacy rows (`gcf-and-lcm-1` practice and assignment-free
review) confirm that D-62 keeps placement and review available for skills no
unit claims.

## Review conclusion

- Every divergent row has a disposition: yes / no
- Any remediation remains open: yes / no
- C3 remained non-enforcing throughout: yes / no
- Recommendation for C4 review:
- Reviewer signature:

