# Incident response baseline

This runbook is a pilot-readiness template, not a legal notification plan.
Human privacy/legal, security, product, and child-safety owners must replace
role placeholders and approve notification timelines before real learner data
is accepted.

## Roles

| Role | Responsibility |
|---|---|
| Incident lead | Declares severity, coordinates response, keeps the timeline, and decides service pause with product owner |
| Security/operations owner | Contains credentials, access, infrastructure, and availability issues |
| Privacy/legal owner | Determines data-subject, regulator, school, and processor obligations |
| Child-safety owner | Assesses unsafe-content, abuse, self-harm, or exploitation concerns and coordinates the approved escalation path |
| Product/learning owner | Assesses pedagogical impact, parent communication, and remediation |
| Communications owner | Sends approved notices; no agent or engineer makes legal promises |

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

Name the on-call path, safety escalation destination, notification contacts and
timelines, processor notification obligations, backup deletion SLA, evidence
retention period, and service-pause authority. Until these are approved, the
system is not ready for real learner data.
