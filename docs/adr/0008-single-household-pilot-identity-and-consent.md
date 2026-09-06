# ADR-0008: Pilot scope, identity, and consent/retention for the single-household pilot

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product owner (Navodit Kaushik)
- Related: `docs/09-decisions-and-open-questions.md` decision register items 1 (identity/auth
  portion), 3, 5, 7; `docs/pilot-readiness-checklist.md`; ADR-0003

## Context

Decision register items 1 (identity/auth portion), 3 (pilot learner identity),
5 (consent/export/deletion/retention), and 7 (accessibility accommodations)
have been pending since Phase 0. ADR-0003 established a synthetic identity
fixture explicitly as a placeholder pending these decisions, and stated it
"must be replaced or wrapped by approved authentication before any real
learner data or external pilot is enabled." This ADR records the product
owner's actual decisions for the first real (non-synthetic) pilot, obtained
directly from the product owner rather than inferred by the agent.

## Decision

1. **Audience.** The first real pilot is scoped to the product owner's own
   household only: one parent account, one Grade 6 learner. This is not a
   multi-family or public pilot. It confirms and narrows the existing "one
   Grade 6 learner with a parent account" default in
   `docs/09-decisions-and-open-questions.md`.
2. **Identity and authentication.** Real authentication will use a simple
   email/password or magic-link mechanism for the parent account. The parent
   account holder creates and manages the learner profile directly. There is
   no separate learner login and no independent guardian-verification
   workflow, because the parent is both the account holder and the guardian
   of the only learner.
3. **Consent.** Because the product owner is simultaneously the operator and
   the parent/guardian of the only learner, no third-party consent workflow
   is required. This ADR is the consent record: the product owner has decided,
   on their own child's behalf, to enable real tutoring sessions under the
   terms recorded here.
4. **Retention and deletion.** Attempt, mastery, and tutor-interaction data is
   retained indefinitely for the household's own use. Deletion is available on
   request via a documented manual procedure (a database operation performed
   by the engineering owner), not a self-service UI feature, since there is
   only one household. No data is shared with any third party other than the
   approved model provider (ADR-0009), and only the minimum data described in
   `docs/privacy-inventory.md` is sent there.
5. **Accessibility accommodations.** The existing automated WCAG 2.2 AA
   coverage (axe-core structural checks plus keyboard-operability checks,
   `tests/browser/`) is accepted as sufficient for this pilot. No specific
   accommodation requirement exists today.

## Explicit non-decisions

- This does not implement the authentication mechanism, replace the synthetic
  identity fixture (ADR-0003), or write any consent-capture code. Those remain
  follow-up engineering work, tracked separately.
- This does not approve expanding the pilot beyond one household. Extending to
  other families requires revisiting this ADR with a real consent flow and
  per-household data-isolation evidence, per `docs/pilot-readiness-checklist.md`.
- This does not set a specific data retention *duration* or an automated
  deletion SLA; retention is indefinite until a manual deletion request, which
  is only appropriate at single-household scale.
- This does not select a specific email/password or magic-link
  provider/library, nor does it set a backup-deletion SLA (no real backups
  exist yet; `docs/privacy-inventory.md` still lists this as pending).

## Alternatives considered

- Formal written consent plus a self-service export/delete feature: rejected
  for now as disproportionate to a single-household, product-owner-as-guardian
  pilot. Revisit if the audience expands (see reversal signals).
- OAuth (Google/Apple) sign-in: rejected for now in favor of simpler
  email/password or magic-link, since there is no need to offload credential
  management for a single account.

## Consequences and reversal signals

Positive: unblocks real (non-synthetic) identity and a real pilot without a
disproportionate legal/consent build-out. Risk: the informal consent/retention
model is appropriate only at this scale — it must be revisited before
onboarding any household other than the product owner's own, per
`docs/pilot-readiness-checklist.md`'s consent and data-inventory rows. Revisit
this ADR if the pilot audience expands beyond one household, if real backups
are introduced (backup-deletion SLA is still unresolved per
`docs/privacy-inventory.md`), or if a deletion request is ever actually needed
and the manual procedure proves insufficient.
