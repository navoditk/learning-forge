# Consent notice and record

This is the pilot's consent record, closing the "Consent" pilot-readiness
row. It is not legal advice or a claim that this satisfies COPPA or any
other law — see `docs/legal-review-briefing.md` for the open legal-review
item.

## Why there is no sign-up/consent-checkbox flow

There is no self-service registration in this app at all — a household
account is created by the product owner running
`scripts/create-parent-account.ts` directly, not through a public form. The
only person who could "consent" on the learner's behalf is the product
owner, who is also the learner's own parent/guardian and the only person
with Render/database access (`docs/secrets-management.md`). ADR-0008
recorded this as the deliberate reason informal consent is appropriate here
— there is no second party for a checkbox to meaningfully address.

What a consent record still needs, even in this single-party case, is
exactly what the checklist row names: a dated statement of **scope**, the
**notices** actually given, a working **revocation** path, and durable
**evidence** that this decision was made and when. This document and the
table below are that record.

## Scope of consent

The product owner, as the learner's parent/guardian, consents to:

- The learner's math problem attempts, tutor conversation messages, and
  resulting progress evidence being collected and stored, as described in
  `docs/privacy-inventory.md`.
- The learner's problem/message text (never account identity, credentials,
  or other household data) being sent to Anthropic's Claude API to
  generate tutoring responses, under the terms summarized in
  `docs/privacy-inventory.md`'s Provider terms section.
- No advertising, no sale or sharing of data with third parties beyond the
  AI provider named above, and no use of this data for anything other than
  running and improving this one household's tutoring sessions.

## Notices given

- The learner is told, wherever the tutor appears, that it is "an AI, not
  a real person," and is given a plain-language safety note on first hint
  request ("If anything ever feels wrong or upsetting, tell a grown-up") —
  `src/app/components/activity-panel.tsx`.
- The Help page's "AI use and children's privacy" section
  (`src/app/help/page.tsx`) is the parent-facing equivalent, and is the
  closest thing this app has to public-facing documentation (it is outside
  the authentication boundary).

## Revocation

A household's full data can be exported or permanently deleted at any time
from `/parent`, in the "Your data" section — already built and tested
(`tests/persistence/household-data.test.ts`). Deletion removes the account
itself, not just the data within it; there is no separate "pause without
deleting" state today, which is an acceptable gap at this single-household
scale (pausing, if ever needed, means simply not using the app, or the
product owner disabling the Render service directly per
`docs/incident-response.md`'s pause authority).

## Evidence of this decision

| Decision | Date | Record |
|---|---|---|
| Informal consent is appropriate at single-household, parent-operated scope | 2026-09-06 | ADR-0008 |
| AI-use and children's-privacy disclosure to the learner and parent | 2026-10-10 | This document; `src/app/help/page.tsx`, `src/app/components/activity-panel.tsx` |
| Scope, notices, revocation, and this record formalized as the "Consent" row's evidence | 2026-10-10 | This document |

## Revisit trigger

Revisit before a second household, a self-service sign-up flow, or any
party other than the learner's own parent/guardian gaining the ability to
create an account — at that point informal consent's rationale (operator
and guardian are the same person) no longer holds, and a real consent
UI/notice/revocation flow for that new party would be required.
