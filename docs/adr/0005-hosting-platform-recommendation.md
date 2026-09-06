# ADR-0005: Hosting platform recommendation for the invite-only pilot

- Status: Accepted (2026-09-06 by the product owner, Navodit Kaushik — Render selected; see ADR-0008 for the accompanying identity/consent decisions for the single-household pilot this hosting choice serves)
- Date: 2026-09-06
- Decision owner: Product/engineering owner; privacy review required before pilot (decision register item 1)

## Context

`docs/03-system-architecture.md` lists "Managed Node/PostgreSQL deployment" as
not selected, and the Phase 0 decision register
(`docs/09-decisions-and-open-questions.md`, item 1) defers hosting and
authentication to a Phase 1 provider comparison with a privacy review before
pilot. This ADR records a technical recommendation to inform that comparison.
It does not approve a vendor, region, or spend.

## Recommendation

For the invite-only, single-family pilot described in the roadmap, prefer a
platform that runs the Next.js app as one **long-running process** paired
with a managed PostgreSQL instance — **Render** or **Fly.io** — over a
serverless deployment such as Vercel's default model.

Rationale: the application is already an explicit modular monolith (one
deployable process, `docs/03-system-architecture.md`). A long-running process
matches that design directly. Serverless functions (Vercel's default) would
require adding connection pooling (e.g., Prisma Accelerate or a pooled
provider) purely to work around a deployment model the architecture didn't
ask for, which reintroduces operational complexity the modular-monolith
decision was meant to avoid. Fly.io additionally offers more direct region
selection, which is relevant given how much the privacy inventory
(`docs/privacy-inventory.md`) still lists "region not selected."

**Streamlit is not a candidate.** It is a Python data-app/dashboard
framework; adopting it would mean discarding the existing TypeScript/
Next.js/React/Prisma stack, and its widget model is a poor fit for a
child-facing product with custom pedagogical UI and a WCAG 2.2 AA
accessibility target.

## Explicit non-decisions

- This selects Render as the platform (accepted 2026-09-06) but does not select
  a region, backup/retention configuration, or spend. Those remain follow-up
  engineering work, informed by the budget target in ADR-0009.
- This does not itself implement the authentication mechanism, which ADR-0008
  separately decided (simple email/password or magic-link).
- This does not imply the application is ready to host real learner data;
  the pilot-readiness checklist items not yet closed by ADR-0008/ADR-0009
  (secrets management, operational rate/cost limits, monitoring, incident
  contacts) remain pending regardless of hosting choice.

## Alternatives considered

- **Vercel** (serverless functions): most native integration with Next.js
  itself, but needs a pooled Postgres connection strategy to avoid exhausting
  connections under serverless cold starts/concurrency; deferred as added
  complexity without a matching need.
- **Direct AWS/GCP/Azure** (e.g., ECS/Cloud Run + RDS/Cloud SQL): more
  operationally capable and appropriate if a future partner (e.g., a school
  district) requires a specific vendor's compliance posture, but is
  disproportionate operational overhead for a one-family invite-only pilot.
- **Streamlit**: rejected — wrong application category, would require
  rewriting the product in a different language/framework and would not
  meet the accessibility/UX requirements already documented.

## Consequences and reversal signals

If the eventual privacy/data-residency review requires a specific region,
subprocessor terms, or compliance certification that Render/Fly.io cannot
meet, revisit toward a direct-cloud deployment. If Vercel's serverless model
is preferred for other reasons (e.g., team familiarity, edge/CDN needs), the
modular-monolith architecture still works there — treat the pooled-connection
requirement as a known added cost, not a blocker.

**Update 2026-09-06**: ADR-0012 records the concrete deployment
configuration — a free web service plus a *paid* `basic-256mb` database
(Render's free Postgres auto-deletes after ~44 days, incompatible with
this product's evidence model) — and the manual dashboard steps in
`docs/render-deployment.md`. The repository is prepared for this
deployment (`render.yaml`, migration-on-build, `AUTH_TRUST_HOST`); the
product owner still needs to actually create the Blueprint and run the
one-time account-provisioning step through Render's dashboard before
track 3 is genuinely live.
