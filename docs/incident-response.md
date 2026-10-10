# Incident response baseline

This runbook is a pilot-readiness template, not a legal notification plan. It
is scoped to the current single-household, single-operator pilot described in
`docs/secrets-management.md` — there is no second engineer, operator, or
support role today, so every role below resolves to the same person. If a
second person ever gains standing access to this system, this doc must be
revisited and the roles split before that happens (same trigger as
`docs/secrets-management.md`'s "revisit if a second person ever gains
standing access").

## Roles

| Role                      | Responsibility                                                                                                   | Who, today                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Incident lead             | Declares severity, coordinates response, keeps the timeline, and decides service pause                           | Product owner                                                                                |
| Security/operations owner | Contains credentials, access, infrastructure, and availability issues                                            | Product owner (holds the only Render/database access, per `docs/secrets-management.md`)      |
| Privacy/legal owner       | Determines data-subject, regulator, school, and processor obligations                                            | Product owner; escalate to outside counsel before any notification claiming legal compliance |
| Child-safety owner        | Assesses unsafe-content, abuse, self-harm, or exploitation concerns and coordinates the approved escalation path | Product owner, who is also the learner's parent — see "Child-safety escalation" below        |
| Product/learning owner    | Assesses pedagogical impact, parent communication, and remediation                                               | Product owner                                                                                |
| Communications owner      | Sends approved notices; no agent or engineer makes legal promises                                                | Product owner                                                                                |

Because one person holds every role, there is no handoff or second approval
inside this pilot. The checks that would normally come from a second
reviewer (e.g., "the incident lead decides with the product owner") do not
apply; treat that as a known, accepted limitation of single-operator scope,
not a resolved control.

## Pause authority

The product owner may pause or disable any part of the system unilaterally,
at any severity, using existing access: the Render dashboard (service
suspend/env var toggle), a feature flag (`docs/PROGRESS.md`'s "Feature flags
must guard experimental tutor behaviors" convention), or a direct database
connection for a targeted block. No second approval is required to pause.
Resuming service after a Critical or High incident requires the "Recover"
step below to actually be completed first, not just elapsed time.

## Child-safety escalation

A model turn flagged `safetyFlags: ["needs_human_review"]` is suppressed
and the learner sees a safe fallback (tested in `tests/tutor/tutor.test.ts`).

**Automated notification closed 2026-10-10.** `recordTutorResponse`
(`src/phase1/service.ts`) now calls `NotifierPort.sendSafetyAlert` whenever
a response is safety-flagged — including a flagged first attempt that then
recovered cleanly on retry, since the flag is evidence about what the
learner said, not about the model's retry phrasing
(`src/tutor/harness.ts`'s `safetyFlagged` field). The alert carries only
trace metadata (trace id, household id, policy version, timestamp) — never
learner text, matching the existing no-raw-child-text-in-logs policy. A
failed send is best-effort and never blocks the safety fallback that
already happened (same pattern as `recordAuditEvent`).

- **Escalation destination:** navodit.kaushik@gmail.com (product owner).
- **Target response time:** same day, given this is a single-parent-operator
  pilot with one learner, not a 24/7-staffed service. If real usage ever
  shows a flag firing with the child actively mid-session and unsupervised,
  this target should be revisited.
- **Delivery mechanism:** set by `NOTIFIER_PROVIDER` (default `console` —
  logs only, does not reach anyone outside the server process). Setting it
  to `resend` with `RESEND_API_KEY`, `SAFETY_ALERT_EMAIL_FROM`, and
  `SAFETY_ALERT_EMAIL_TO` (see `.env.example`) sends a real email via
  Resend's API to the escalation destination above. **Still open:** the
  product owner has not yet created a Resend account or set these values in
  the real deployment's environment — until that's done, this pilot is
  still effectively on the `console`-only default in production, same as
  before this change. Set `NOTIFIER_PROVIDER=resend` on Render once that
  account exists to actually close this gap end to end.

## Severity

- **Critical:** confirmed or likely cross-household disclosure, credential
  compromise with child-data access, serious child-safety failure, or broad
  answer leakage in a live learner flow. Pause affected access immediately.
- **High:** suspected sensitive-data exposure, unsafe response requiring human
  review, deletion failure, or material policy bypass with limited scope.
- **Medium:** contained availability/cost abuse, non-sensitive telemetry leak,
  or a regression caught before real-data use.
- **Low:** documentation or test issue with no exposure or learner impact.

Severity may be raised at any time when new evidence changes the impact.

## Response steps

1. **Detect and record:** preserve the alert, timestamp, affected environment,
   request/trace IDs, policy/content/model versions, and factual observations.
   Do not copy raw learner text into tickets or chat unless the approved safety
   process requires it.
2. **Triage:** identify affected data classes, households, roles, systems,
   providers, and time window. Treat uncertainty conservatively.
3. **Contain:** disable the affected feature or provider route; revoke/rotate
   credentials; block abusive sessions; restrict access; preserve required
   evidence. Do not delete evidence before the privacy/legal owner approves.
4. **Protect learners:** for unsafe-content or abuse concerns, stop normal
   tutoring and follow the approved human escalation procedure. Never promise
   secrecy or invent emergency/legal advice.
5. **Assess and notify:** privacy/legal decides whether and when to notify
   affected parents, schools, processors, regulators, or other authorities.
   Communications must be factual, age-appropriate where applicable, and not
   claim legal compliance without review.
6. **Recover:** patch or roll back the smallest affected change, verify access
   boundaries, run relevant contract/eval/deletion checks, and restore service
   only after the incident lead and required owners approve.
7. **Learn:** complete a blameless post-incident review, add a regression case,
   update the threat model/runbook, and track owners and due dates.

## Evidence and privacy rules

- Use synthetic or consented/redacted data in reproduction and review.
- Store metadata and redacted excerpts by default; never put credentials,
  tokens, raw child text, or screenshots with private data in the repository.
- Keep an access-controlled incident timeline and record who accessed evidence.
- Verify deletion across primary storage, exports, logs, caches, backups, and
  any approved processor according to the final retention policy.

## Required pre-pilot decisions

| Decision                                               | Status                                                                                                                                                                                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On-call path                                           | Resolved above: product owner, same-day target, no 24/7 staffing (single-operator scope).                                                                                                                                                                         |
| Service-pause authority                                | Resolved above: product owner, unilaterally, no second approval.                                                                                                                                                                                                  |
| Safety escalation destination and notification contact | Resolved above: navodit.kaushik@gmail.com. Manual `TutorTrace` review until an automated alert is wired up (still-open engineering gap, not blocking this decision).                                                                                              |
| Notification timelines (parents/schools/regulators)    | **Still open** — depends on the privacy/legal review `docs/privacy-data-acceptance.md` already flags as unresolved ("verify ... retention, training-use, subprocessors ... before expanding scope"); do not commit to a timeline here before that review happens. |
| Processor notification obligations                     | **Still open** — same dependency: Render/PostgreSQL and the model provider's own terms haven't been verified yet (`docs/privacy-data-acceptance.md`'s first reinforcement requirement).                                                                           |
| Backup deletion SLA                                    | **Still open** — same dependency; this is the provider's backup-retention window, not a number this pilot can set on its own.                                                                                                                                     |
| Evidence retention period                              | **Still open** — no retention period has been set for incident evidence itself; proposed default below, pending product-owner sign-off.                                                                                                                           |

**Proposed default for evidence retention** (not yet accepted): keep incident
timelines and redacted evidence for 1 year after an incident closes, then
delete, consistent with this being a single-household pilot with no
regulatory retention mandate identified yet. Revisit if that changes.

Until the "Still open" rows above are resolved, this system is not ready for
real learner data beyond the product owner's own household — consistent with
`docs/course-progression-review/child-safety-acceptance.md`'s existing
scope limit.
