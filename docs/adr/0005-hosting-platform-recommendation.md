# ADR-0005: Hosting platform recommendation for the invite-only pilot

- Status: Proposed
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

- This does not select a final vendor, region, backup/retention configuration,
  or spend. That remains gated on the privacy/data-residency comparison and
  the budget/latency decision (decision register items 1 and 8).
- This does not address authentication provider selection, which is a
  separate, still-pending part of decision register item 1.
- This does not imply the application is ready to host real learner data;
  identity, consent, and the pilot-readiness checklist remain pending
  regardless of hosting choice.

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
