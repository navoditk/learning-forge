# Decisions and Open Questions

## Approved defaults

- The product is named **Learning Forge** with the positioning line **Adaptive, school-aligned learning with interactive AI tutoring**.
- Grade 6 Math is the initial MVP rather than the permanent product boundary.
- Product complements school; it does not replace it.
- Initial user is one Grade 6 learner with a parent account.
- Grade 6 Math is the first full domain; ratios are the first vertical slice.
- Interactive tutoring is in the MVP.
- Tutor behavior is a deterministic policy state machine plus constrained model generation.
- Use a modular monolith and PostgreSQL.
- Use TypeScript/Next.js unless an early spike demonstrates a compelling alternative.
- Keep model provider replaceable.
- Preserve raw attempt evidence and version derived mastery.
- No open web, social features, voice, or handwriting in MVP.

## Phase 0 decision register

The following register distinguishes a working implementation boundary from an
approved product decision. “Pending human approval” is intentional: the agent
must not infer privacy, legal, content-rights, accessibility, spending, or
release approval.

| # | Decision | Working boundary for Phase 0 | Status | Required owner/reviewer | Target date |
|---|---|---|---|---|---|
| 1 | Hosting and authentication | Keep identity behind a port; use local/synthetic identity only | Deferred to Phase 1 provider comparison | Product/engineering owner; privacy review before pilot | 2026-09-11 |
| 2 | Model provider and child-data terms | Fake adapter only; synthetic learner data; no provider credentials | Pending human approval before real learner data or real adapter | Product, security/privacy, legal | 2026-09-11 |
| 3 | Pilot learner identity | Support pseudonymous internal learner ID; do not decide learner login/guardian verification here | Pending human approval | Product and privacy/legal | 2026-09-11 |
| 4 | Ratios provenance and review | Original or explicitly licensed content; provenance, version, reviewer, and originality record required | Pending human approval before content acceptance | Educator/content owner | 2026-09-11 |
| 5 | Consent, export, deletion, retention | Treat raw child text as sensitive; default to minimization/redaction; no production retention policy inferred | Pending human approval before persistence/pilot | Privacy/legal and product | 2026-09-11 |
| 6 | Eval baseline and severity | Synthetic, versioned cases; no uncalibrated numerical gate claimed | Pending human approval before release gates | Quality/evaluation owner | 2026-09-11 |
| 7 | Accessibility accommodations | WCAG 2.2 AA baseline; pilot-specific accommodations captured as requirements | Pending human approval | Accessibility/product owner | 2026-09-11 |
| 8 | Budget and latency | Do not select provider or make cost claims in Phase 0 | Pending human approval before provider selection | Product/engineering owner | 2026-09-11 |

Target dates are planning targets and do not represent completed approvals.

Decision details, alternatives, consequences, reversal signals, and approval
records are maintained in `docs/adr/0001-phase-0-boundaries.md`.

## Resolve during Phase 1 or before pilot

1. Hosting and authentication provider after privacy/data-residency comparison.
2. Initial model provider and child-data contractual settings.
3. Learner login, guardian verification, and pseudonymous identity mechanics.
4. Parent consent, export, deletion, backup deletion, and retention requirements.
5. Pilot-specific accessibility accommodations.
6. Monthly model budget, latency target, and provider operating limits.
7. Eval gate thresholds after the synthetic baseline and human adjudication.

## Experiments, not assumptions

- Assistance weights and mastery thresholds
- Optimal session length and weekly frequency
- Minimum genuine-attempt policy by problem type
- Learner preference for text, diagrams, or manipulatives
- Whether a separate Contest Coach label improves behavior/understanding
- Value of generated problems versus curated originals

## Deferred decisions

- Native mobile versus responsive web
- Multi-tenant school architecture
- Teacher dashboards
- Voice and handwriting recognition
- Fine-tuning
- Vector database/RAG platform
- Microservices and event streaming
- Multi-agent tutor orchestration
- Multi-child households (siblings sharing one parent account): the schema already supports it (`Household` has many `User`/`LearnerProfile` rows), so no migration is anticipated; a learner switcher and per-child session/consent UX remain deferred to Phase 3+ real identity work, not a Phase 1 data-model risk.
