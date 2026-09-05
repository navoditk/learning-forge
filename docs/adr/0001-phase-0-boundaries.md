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

The following decisions are intentionally pending and are tracked in
`docs/09-decisions-and-open-questions.md`: identity and consent mechanics;
retention/export/deletion details; provider, region, training-use, and
subprocessor terms; content review ownership; eval corpus/severity/gate
ownership; pilot accommodations; and latency/budget targets.

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
| Product and pilot boundary | Product owner | Pending | 2026-09-11 | Pending approval |
| Identity, consent, retention, export, deletion | Privacy/legal owner | Pending | 2026-09-11 | Pending approval |
| Provider and data-processing terms | Security/privacy owner | Pending | 2026-09-11 | Pending approval |
| Originality, licensing, and content review | Educator/content owner | Pending | 2026-09-11 | Pending approval |
| Accessibility accommodations | Accessibility/product owner | Pending | 2026-09-11 | Pending approval |
| Eval corpus, severity, and release gates | Quality/evaluation owner | Pending | 2026-09-11 | Pending approval |
| Budget and latency targets | Product/engineering owner | Pending | 2026-09-11 | Pending approval |
