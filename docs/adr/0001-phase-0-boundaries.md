# ADR-0001: Phase 0 pilot boundaries and decision register

- Status: Proposed
- Date: 2026-09-04
- Decision owner: Product owner
- Related issue: LF-0.1

The implementation baseline is recorded below; product-risk decisions remain
pending human review. The target dates in the approval record are planning
targets, not evidence that approval has occurred.

## Context

Learning Forge is a documentation-only project beginning with a Grade 6 Math
ratios slice. The proposal requires a modular monolith, parent/learner
relationships, child-safety controls, privacy-preserving traces, original
content, and deterministic tutor policy. Several choices affect the data model,
provider boundary, content acceptance, and Phase 0 exit, but are not yet
approved by accountable human reviewers.

## Decision

Phase 0 uses the following working boundaries:

1. The product remains an invite-only, one-household pilot for one Grade 6
   learner and one parent. No school/organization tenancy is implemented.
2. The MVP remains a modular monolith with explicit domain ports. No
   microservices, vector database, agent swarm, voice, handwriting, social, or
   open-web feature is introduced.
3. Until a provider data-processing review is approved, tutor development uses
   only a fake model adapter and synthetic learner data. A real provider is not
   a Phase 0 dependency.
4. Content is authored as original or explicitly licensed material, versioned,
   provenance-recorded, and human-reviewed before acceptance. “Style” labels
   describe skill type only and do not authorize copying source wording,
   problems, solutions, or distinctive structure.
5. Raw attempts remain immutable evidence; derived mastery remains versioned and
   recalculable. Provisional assistance weights and mastery thresholds remain
   experiments, not approved psychometric claims.
6. Tutor authorization remains deterministic and server-controlled. Model text
   cannot advance policy state, reveal protected answers, change permissions, or
   establish mastery.
7. Traces default to required metadata and redacted excerpts rather than raw
   child conversation. Any retention exception requires a documented purpose,
   owner, and approved retention period.
8. Phase 0 exit requires documented checks, reviewable ADRs, and human sign-off
   for privacy/legal, content, provider, accessibility, and evaluation-risk
   decisions. It does not imply production readiness or legal compliance.

Identity/consent mechanics, provider selection, eval-gate approach, pilot
accommodations, and budget/latency targets were resolved 2026-09-06 for the
single-household pilot scope (ADR-0008, ADR-0009; see the approval record
below). Provider region, training-use, and subprocessor contractual terms
remain to be recorded during adapter implementation, tracked in
`docs/09-decisions-and-open-questions.md` and `docs/privacy-inventory.md`.

## Alternatives considered

- Implement a real model provider immediately: rejected for Phase 0 because
  provider retention and child-data terms are unresolved.
- Treat the LLM as the tutor-policy authority: rejected because it conflicts
  with deterministic answer protection, data access boundaries, and mastery
  evidence requirements.
- Resolve all future platform decisions now: rejected because mobile, tenancy,
  voice, RAG, microservices, and multi-agent orchestration are explicitly
  deferred until evidence supports them.
- Mark unresolved product-risk decisions as approved defaults: rejected because
  the project instructions assign privacy, content, safety, spending, and
  release approvals to humans.

## Consequences

Positive consequences:

- Phase 0 can proceed safely with synthetic data and no provider credentials.
- Later implementation has explicit seams for identity, persistence, content,
  tutoring, and evaluation.
- The project can distinguish technical progress from legal, privacy, and
  pedagogical approval.

Costs and risks:

- A real-provider vertical slice cannot be approved until the provider review
  is complete.
- Persistence and consent fields may need revision after human decisions.
- The initial eval baseline cannot become a release gate until its owner,
  severity taxonomy, and thresholds are approved.

## Reversal signals

Revisit this ADR if the pilot expands beyond one household, real learner data is
sent to a provider, legal review requires different consent/retention controls,
content review finds provenance risk, accessibility testing requires a broader
interaction model, or measured scale justifies splitting the monolith.

## Approval record

| Decision area | Required reviewer | Status | Target date | Evidence/date |
|---|---|---|---|---|
| Product and pilot boundary | Product owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner confirmed the pilot is scoped to their own household only (one parent account, one Grade 6 learner), not a multi-family or public pilot. See ADR-0008. |
| Identity, consent, retention, export, deletion | Privacy/legal owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner decided, for the single-household pilot: simple email/password or magic-link identity for the parent account, no separate guardian-verification workflow, informal consent (the product owner is both operator and guardian), indefinite retention with manual deletion on request. Not yet implemented; not a template for a multi-family pilot. See ADR-0008. |
| Provider and data-processing terms | Security/privacy owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner selected Anthropic Claude API as the first real provider, with a low-budget/latency-tolerant target and a lightweight human-reviewed eval pass (~20-30 cases) required before any real session uses it. Contractual data-processing terms (region, retention, training-use, subprocessors) with Anthropic remain to be recorded during adapter implementation. See ADR-0009. |
| Originality, licensing, and content review | Educator/content owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product/content owner (Navodit Kaushik) accepted all 38 `llm_drafted`/`original` records across all 19 catalog skills as `reviewed`, after AI-assisted hand re-derivation of every canonical answer and the automated schema/leakage checks in `src/content/catalog.ts`. This was performed by the product owner acting as content owner, not a separate subject-matter-expert educator; a full independent pedagogical audit (standards-mapping depth, misconception-code accuracy, difficulty calibration) was not separately performed. See `docs/PROGRESS.md` for the verification trail. |
| Accessibility accommodations | Accessibility/product owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner accepted the existing automated WCAG 2.2 AA coverage (axe-core structural checks plus keyboard-operability checks) as sufficient for the single-household pilot; no specific accommodation requirement exists today. See ADR-0008. |
| Eval corpus, severity, and release gates | Quality/evaluation owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner approved a lightweight enablement gate (a personally-reviewed ~20-30 case sample covering leakage/tone/correctness/safety) rather than a larger adjudicated corpus, appropriate to single-household scale. The eval corpus itself is not yet built. See ADR-0009. |
| Budget and latency targets | Product/engineering owner | Approved (scope noted) | 2026-09-11 | 2026-09-06 — Product owner set a low monthly budget target (well under $20/month) and a latency-tolerant target, defaulting to a smaller/cheaper Claude model. See ADR-0009. |
