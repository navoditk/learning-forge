# ADR-0012: Render deployment for the single-household pilot

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product/engineering owner (Navodit Kaushik)
- Related: ADR-0005 (hosting platform recommendation); ADR-0010 (real
  authentication, including the `AUTH_URL`/`UntrustedHost` gap this
  resolves); ADR-0011 (real model adapter, including the missing
  rate-limit non-decision this partially closes)

## Context

ADR-0005 recommended Render over serverless Vercel for this
modular-monolith app. This ADR records the actual deployment
configuration — plan choices, migration strategy, and a rate-limit
guardrail — needed to go from "recommended platform" to "a real URL a
parent can sign into."

## Decision

1. **Web service: free plan ($0/mo).** Accepted the tradeoff explicitly:
   the service sleeps after 15 minutes of inactivity and takes 30–60
   seconds to wake on the next request. Reasonable for occasional
   single-family use; revisit (paid `starter`, $7/mo, no sleep) if the
   wake delay proves annoying in practice.
2. **Database: paid `basic-256mb` plan (~$6/mo), not free.** Render's free
   Postgres auto-deletes the database and all data 30 days after creation
   plus a 14-day grace period, with no backups at any point. This
   directly conflicts with this product's own design principle (ADR-0001:
   "raw attempts remain immutable evidence") — a database that
   auto-deletes every ~44 days is not compatible with preserving a
   learner's mastery history. The product owner chose to pay for
   durability rather than accept that risk or take on recurring manual
   export/reimport work.
3. **Migrations run in `buildCommand`, not `preDeployCommand`.**
   `preDeployCommand` requires a paid web service plan; this deployment
   uses the free one (decision 1). `prisma migrate deploy` is idempotent
   (only applies migrations not yet applied), so running it on every
   build is safe.
4. **`AUTH_TRUST_HOST=true` instead of a hardcoded `AUTH_URL`.** Render
   assigns a `*.onrender.com` subdomain that isn't known with certainty
   before the service is created (name collisions get a suffix). Trusting
   Render's own reverse-proxy headers avoids hardcoding a guessed URL and
   survives a later custom-domain change with no env var update.
5. **A basic hourly rate limit (60 calls/hour) on the real adapter**
   (`src/tutor/rate-limit.ts`), enforced inside `AnthropicTutorModel`
   before any network call. This is a backstop against a bug or retry
   loop causing runaway spend, not a real per-session/per-day cost cap or
   billing alert — ADR-0011 explicitly left that undecided, and this ADR
   only partially closes it.
6. **No Render API key or CLI used anywhere in this repository.** The
   product owner creates the Blueprint and fills in secrets through
   Render's own dashboard (`docs/render-deployment.md`). No cloud
   credential capable of provisioning or modifying infrastructure is ever
   available to this session.

## Explicit non-decisions

- This does not select a region beyond `oregon` (a reasonable default;
  revisit if `docs/privacy-inventory.md`'s data-residency decision needs a
  specific one).
- This does not implement a per-session or per-day cost cap, spend
  monitoring, or billing alerts. The hourly rate limit in decision 5 is a
  bug backstop, not usage governance.
- This does not verify or configure a backup schedule for the database
  beyond whatever the `basic-256mb` plan includes by default —
  `docs/render-deployment.md` flags this as still open.
- This does not record Anthropic's contractual data-processing terms
  (region, retention, training-use, subprocessors) — still pending in the
  decision register, unaffected by this ADR.
- This does not add a custom domain.

## Alternatives considered

- Free Postgres: rejected — see decision 2's reasoning; the ~44-day
  auto-deletion is fundamentally incompatible with this product's purpose.
- Paid web service (no sleep): rejected for now — the product owner judged
  the wake-up delay an acceptable tradeoff for $0/mo at this usage volume;
  easy to revisit later since it's a single plan-field change with no
  data-migration implications, unlike the database choice.
- Using `preDeployCommand` for migrations: rejected because it requires
  upgrading the web service off the free plan, which decision 1 already
  ruled out.

## Consequences and reversal signals

Positive: the repository is fully prepared for a durable deployment —
`render.yaml`, automatic migrations on every build, and a real backstop
against runaway model spend — with the product owner completing the
remaining manual steps (creating the Blueprint, filling in secrets,
one-time account provisioning) through Render's own dashboard, per
`docs/render-deployment.md`. This ADR does not itself claim the app is
live; it records what the deployment *will* look like once those steps are
done. Risk: the free web service's sleep behavior means the very first
request after any 15-minute gap is slow; if that proves disruptive in real
use, upgrading to the `starter` plan is a single-field change. Revisit the
rate-limit threshold (60/hour) if normal single-household usage ever
approaches it — that would mean the limit is wrong, not that the household
is somehow abusing its own account.
