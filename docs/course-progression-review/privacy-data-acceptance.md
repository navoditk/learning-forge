# Privacy/data acceptance — Grade 6 Math progression pilot

**Status:** Product-owner acceptance recorded 2026-09-20 for the scoped
single-household pilot, with the privacy review assumed complete at the user's
direction. This is a risk acceptance record, not legal advice or a claim of
regulatory compliance.

## Accepted current policy

- Invite-only, single-household use; no broader audience.
- Parent-managed learner identity with household-scoped access.
- Minimum necessary learner context at the model boundary; no credentials or
  unnecessary profile data.
- Raw learner text is sensitive and is not retained in default traces or logs.
- Parent export and household deletion cover progression, assessment,
  attempts, shadow, trace, and operational records subject to the approved
  deletion workflow.
- Immutable application evidence remains traceable but is removed during
  approved household erasure.
- No real learner rollout while a critical cross-household, answer-leakage,
  deletion, or child-safety defect is known.

## Reinforcement requirements

- [ ] Verify Render/PostgreSQL and Anthropic regions, retention, training-use,
      subprocessors, moderation, and deletion terms before expanding scope.
- [ ] Perform a synthetic export/deletion drill including backups and caches.
- [ ] Name support-access, least-privilege, credential-rotation, incident, and
      service-pause owners.
- [ ] Keep the held-out package outside the public repository and record only
      its version and digest here.
- [ ] Re-review if the audience, provider, hosting region, retention policy,
      or learner-data categories change.

## Authority

The detailed inventory remains `docs/privacy-inventory.md`; this record does
not override it and does not approve unresolved legal or contractual terms.
