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
| 1 | Hosting and authentication | Keep identity behind a port; use local/synthetic identity only. ADR-0005 recommended, and the product owner accepted, Render as the hosting platform; ADR-0008 records the identity/auth mechanism | Approved 2026-09-06 (scope noted): Render for hosting (ADR-0005, accepted); simple email/password or magic-link identity for the single-household pilot (ADR-0008). Region, vendor account setup, and implementation remain follow-up engineering work. | Product/engineering owner; privacy review before pilot | 2026-09-11 |
| 2 | Model provider and child-data terms | Fake adapter only; synthetic learner data; no provider credentials | Approved 2026-09-06 (scope noted): Anthropic Claude API selected as the first real provider (ADR-0009). Contractual data-processing terms (region, retention, training-use, subprocessors) with Anthropic remain to be recorded in `docs/privacy-inventory.md` during adapter implementation; no real learner data may reach the provider before then. | Product, security/privacy, legal | 2026-09-11 |
| 3 | Pilot learner identity | Support pseudonymous internal learner ID; do not decide learner login/guardian verification here | Approved 2026-09-06 (scope noted): single-household pilot; the parent account holder creates/manages the learner profile directly; no separate guardian-verification workflow, since the account holder is the guardian (ADR-0008). | Product and privacy/legal | 2026-09-11 |
| 4 | Content provenance and review | Original or explicitly licensed content; provenance, version, reviewer, and originality record required | Approved 2026-09-06 for all 38 records across all 19 catalog skills (`original`/`llm_drafted`; no `licensed` content). See ADR-0001's approval record for scope notes — approved by the product/content owner, not a separately engaged subject-matter educator. | Educator/content owner | 2026-09-11 |
| 5 | Consent, export, deletion, retention | Treat raw child text as sensitive; default to minimization/redaction; no production retention policy inferred | Approved 2026-09-06 (scope noted) for single-household use: informal consent (the product owner is both operator and guardian), indefinite retention, deletion available via a documented manual procedure rather than a self-service feature (ADR-0008). Backup-deletion SLA remains pending — no real backups exist yet. Revisit before onboarding any additional household. | Privacy/legal and product | 2026-09-11 |
| 6 | Eval baseline and severity | Synthetic, versioned cases; no uncalibrated numerical gate claimed | Approved 2026-09-06 (scope noted): a lightweight enablement gate — the product owner personally reviews ~20-30 real-provider cases (leakage, tone, correctness, safety) — required before the real adapter is used in any real session (ADR-0009). Not a numerically-thresholded gate; not the larger adjudicated corpus a multi-family pilot would need. | Quality/evaluation owner | 2026-09-11 |
| 7 | Accessibility accommodations | WCAG 2.2 AA baseline; pilot-specific accommodations captured as requirements | Approved 2026-09-06 (scope noted): existing automated WCAG 2.2 AA coverage (axe-core structural checks plus keyboard-operability checks) accepted as sufficient; no specific accommodation requirement exists today (ADR-0008). Revisit if a concrete need arises. | Accessibility/product owner | 2026-09-11 |
| 8 | Budget and latency | Do not select provider or make cost claims in Phase 0 | Approved 2026-09-06 (scope noted): low monthly budget target (well under $20/month), latency not a hard constraint, default to a smaller/cheaper Claude model (ADR-0009). | Product/engineering owner | 2026-09-11 |

Target dates are planning targets and do not represent completed approvals.

Decision details, alternatives, consequences, reversal signals, and approval
records are maintained in `docs/adr/0001-phase-0-boundaries.md`.

## Resolved 2026-09-06 for the single-household pilot (ADR-0008, ADR-0009)

Items 1, 2 (provider only), 3, 5, 6, and 7 below were decided by the product
owner on 2026-09-06, scoped explicitly to a single-household pilot. None of
these decisions are implemented yet — they unblock the follow-up engineering
work, tracked separately, not the work itself.

1. Hosting: Render (ADR-0005, accepted). Authentication: simple email/password
   or magic-link for the parent account (ADR-0008). Region and vendor account
   setup remain open.
2. Model provider: Anthropic Claude API (ADR-0009). **Still open:** contractual
   data-processing terms with Anthropic (region, retention, training-use,
   subprocessors — to be recorded in `docs/privacy-inventory.md` during
   adapter implementation), and incremental/streaming delivery of tutor moves
   — the fake adapter responds instantly, but a real provider's latency makes
   synchronous request/response feel slow in a 20–30 minute session; streaming
   should be designed alongside adapter implementation, not retrofitted onto
   an already-shipped synchronous UI.
3. Learner identity: the parent account holder creates/manages the learner
   profile directly; no separate guardian-verification workflow (ADR-0008).
4. Parent consent, retention: informal consent, indefinite retention, manual
   deletion on request (ADR-0008). **Still open:** backup-deletion SLA (no
   real backups exist yet) and export tooling (not needed at single-household
   scale today, per ADR-0008, but would be needed before any additional
   household is onboarded).
5. Accessibility: existing automated WCAG 2.2 AA coverage accepted as
   sufficient (ADR-0008); revisit if a concrete accommodation need arises.
6. Budget/latency: low budget (well under $20/month), latency not critical,
   default to a smaller/cheaper Claude model (ADR-0009).
7. Eval gate: lightweight, product-owner-reviewed ~20-30 case sample required
   before real-provider use (ADR-0009); not a numerically-thresholded gate.
   The eval corpus itself still needs to be built.

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
