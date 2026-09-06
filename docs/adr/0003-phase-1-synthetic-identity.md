# ADR-0003: Use a local synthetic identity for the first vertical slice

- Status: Accepted
- Date: 2026-09-05
- Decision owner: Product owner

## Context

Phase 1 needs to demonstrate a learner session and parent evidence view, but
the production authentication provider, guardian verification, consent
workflow, and identity data-retention rules remain unresolved. Enabling real
accounts would expand the issue into a privacy and authentication launch
decision.

## Decision

The first vertical slice uses a fixed, server-owned synthetic household,
parent user, learner user, and learner profile. The identity is created or
reconciled in the local PostgreSQL database by the Phase 1 service. Routes do
not accept client-supplied household or learner identifiers. The fixture is
for local and CI synthetic data only and is not an authentication mechanism.

## Explicit non-decisions

- No real login, session cookie, guardian verification, or consent capture is
  implemented.
- No real learner data or model-provider credentials may be used.
- No production deployment or hosting choice is implied.

## Alternatives considered

- Add a managed authentication provider now: rejected because provider,
  consent, guardian verification, and privacy decisions remain pending.
- Use an unscoped in-memory user: rejected because it would not exercise the
  approved PostgreSQL household boundaries used by the parent evidence flow.

## Consequences and reversal signals

This keeps Phase 1 deterministic, reviewable, and safe for synthetic data while
exercising the identity port’s household boundary. It must be replaced or
wrapped by approved authentication before any real learner data or external
pilot is enabled. Reversal is required when a provider, consent model, and
guardian-verification design are approved.

**Update 2026-09-06**: ADR-0008 approved the identity/consent design, and
ADR-0010 implements real authentication (NextAuth v5, email/password) that
now gates every page and API route. `src/phase1/service.ts` and every
`/api/phase1/*` route now resolve the real authenticated household
(`requireHouseholdContext`, ADR-0010) instead of this fixture — the fixture
is used only by tests now (`SYNTHETIC_IDENTITY`, exported alongside
`SYNTHETIC_IDS`). This ADR's reversal signal ("must be replaced or wrapped by
approved authentication before any real learner data or external pilot is
enabled") is satisfied for the single-household pilot scope ADR-0008 defines.
It is not superseded outright: the fixture itself still exists and still
backs every test in this repository, and the identity model here (fixed
IDs, no real multi-household authorization design) would need revisiting
before a second household is ever approved.
