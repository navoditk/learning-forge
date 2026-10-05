# Observability

What this project records about its own operation, where it's stored, who
can read it, and what's deliberately not recorded. Covers the two durable
record types - tutor traces and the security audit log - not general
application logging (console output during local development, which is
ephemeral and not covered here).

## Tutor traces

Every tutor call produces a `TutorTrace` row (`prisma/schema.prisma`,
written via `createTutorTraceRecord` in `src/contracts/trace.ts`, called
from `src/tutor/harness.ts` on every invocation). Fields: `policyVersion`,
`promptTemplateVersion`, `modelIdentifier`, `latencyMs`, token usage
(`inputTokens`/`outputTokens`/`totalTokens`), `validationResult`
(`validated`/`repaired`/`fallback`/`rejected`), `outcome`
(`move_returned`/`fallback_returned`/`error`), and `redactedExcerpt`.

**Redaction.** `redactedExcerpt` is never raw learner or tutor text. It is
either absent or the literal string `"[redacted learner text]"` -
`redactFreeFormText` (`src/contracts/trace.ts`) replaces any non-empty
input with that placeholder; it cannot pass free text through. This is
tested directly (`tests/tutor/tutor.test.ts` asserts the placeholder
appears, not any variant of the actual learner response).

**Scope.** `householdId` and `learnerProfileId` are required fields with a
real foreign key and `onDelete: Cascade` - traces are deleted when their
household is deleted, unlike the audit log (next section). This is
intentional: a trace is operational/tutoring evidence tied to that
household's data, not a security record that needs to outlive it.

**Retention.** No automatic expiry beyond household deletion. Every trace
for a household is included in that household's self-service export
(`exportHouseholdData`, `src/server/household-data.ts`) and is permanently
removed by that household's self-service deletion.

## Security audit log

`AuditLog` (`prisma/schema.prisma`, migration `0017_add_audit_log`, write
helper `src/server/audit-log.ts`) records eight event types:
`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGIN_LOCKED`, `STEP_UP_SUCCESS`,
`STEP_UP_FAILURE`, `STEP_UP_LOCKED`, `HOUSEHOLD_EXPORT`,
`HOUSEHOLD_DELETE`. Each row has only an event type, an optional
`householdId`, an optional `userId`, and a timestamp - no credential, no
request body, no free text of any kind.

**Why it has no foreign key.** Unlike every other household-scoped table,
`AuditLog.householdId`/`userId` are plain columns with no Prisma relation.
An audit trail exists specifically to answer "what happened, and when" even
after the thing it refers to is gone - a `HOUSEHOLD_DELETE` event is only
useful if it survives the deletion it's recording.

**What happens on deletion.** `deleteHouseholdData`
(`src/server/household-data.ts`) records the `HOUSEHOLD_DELETE` event, then
immediately anonymizes (sets `householdId`/`userId` to `null` on) every
`AuditLog` row that household ever produced, atomically in the same
transaction. The event, its type, and its timestamp survive; the identity
it refers to does not. This is a deliberate privacy choice, not an
oversight: keeping a deleted household's id permanently attached to log
rows would itself undermine the deletion guarantee, so the log keeps the
*fact* ("a login happened on this date," "a deletion happened on this
date") without keeping the *link* to who.

**Unattributed events.** A login attempt against an email with no matching
account is logged as `LOGIN_FAILURE` with no `householdId`/`userId` -
deliberately not logging the attempted email address (minimization), while
still keeping a count for spotting enumeration attempts.

**Export.** A household's own audit history is included in its self-service
export (`exportHouseholdData` fetches `AuditLog` separately, since it has
no relation to traverse from `Household`) - the account holder can see
their own login/export/deletion history as part of their own data.

**Failure handling.** `recordAuditEvent` is best-effort: a write failure is
caught, logged structurally (event type and error class only, no request
content), and never allowed to fail the login/export/deletion request that
triggered it. Tested directly in `tests/persistence/audit-log.test.ts`.

## Access policy

Both `TutorTrace` and `AuditLog` are queried today only through:

- Prisma, directly, by whoever has `DATABASE_URL` access (today: the
  product owner only, both locally and via the Render dashboard - see
  `docs/secrets-management.md`'s least-privilege section, which applies
  equally here since database access is the same credential boundary).
- A household's own self-service export, scoped to that household's
  `householdId` via `requireHouseholdContext` (`src/server/household-context.ts`),
  which resolves the identity from the signed-in session - there is no
  route that lets one household read another's traces or audit events.

There is no separate analytics/admin dashboard, no third-party log
aggregator, and no standing export of this data to any other system. If
that changes (a support tool, a hosted log viewer), record the new access
path here before building it, not after.

## What's deliberately not recorded

- Raw learner responses, hint conversation text, or tutor-generated
  explanations - redacted in traces, never present in the audit log.
- Passwords, session tokens, or API keys - not fields on either model (see
  `docs/secrets-management.md`).
- IP addresses or device fingerprints - not collected by either model
  today. Worth reconsidering if abuse patterns ever require it, but it's
  additional data collection that needs its own minimization/retention
  decision first, not a default.

## Current status

Both record types exist, are tested, and are scoped/redacted as described
above - this document closes the pilot-readiness checklist's "Observability"
row for the access-policy and incident-audit-trail requirements. Not yet
done: a redaction test for every free-text-adjacent code path beyond the
tutor harness (the review/independent-check response paths, for example,
don't currently produce any trace at all, so there's nothing to redact
there yet - worth a dedicated pass if those paths ever gain their own
logging).
