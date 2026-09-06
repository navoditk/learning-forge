# Pilot readiness checklist

The checklist records evidence and human approval; a checked engineering test
does not imply legal, safety, or accessibility approval. Complete it before
real learner data or a real model provider is enabled.

| Area | Required evidence | Owner/reviewer | Status |
|---|---|---|---|
| Product boundary | One-household invite-only scope, excluded features, pause authority | Product owner | Decided 2026-09-06 (ADR-0008): single household confirmed. Excluded features and pause authority already documented in ADR-0001. |
| Identity and access | Managed identity choice, parent/learner linking, household authorization tests, support-access procedure | Product/engineering + privacy | Decided 2026-09-06 (ADR-0008) and implemented 2026-09-06 (ADR-0010): email/password login (NextAuth v5), household-scoped data access (`requireHouseholdContext`), verified end-to-end — including two distinct real households confirmed to see only their own data via raw HTTP. **Still not done**: no support-access procedure exists; no managed identity provider is in front of this (self-managed credentials only). |
| Consent | Parent consent scope, learner access, revocation, evidence, and notices | Privacy/legal + product | Decided 2026-09-06 (ADR-0008): informal consent, appropriate only because the product owner is both operator and guardian. No consent UI/notices built yet. |
| Data inventory | Approved purpose, minimization, roles, regions, processors, retention, export, deletion, and backup behavior for every data class | Privacy/legal | Partially decided 2026-09-06: retention/deletion policy set (ADR-0008), provider named (ADR-0009). Regions, processor contractual terms, and backup behavior still pending — see `docs/privacy-inventory.md`. |
| Provider terms | Provider, region, retention, training use, subprocessors, moderation, deletion, and approved-data boundary | Security/privacy + legal | Provider decided 2026-09-06 (ADR-0009): Anthropic Claude API. Region, retention, training-use, subprocessor, and moderation terms still pending — to be recorded during adapter implementation. |
| Secrets | Environment-separated secret manager, least privilege, rotation, no repository/log exposure | Security/operations | Pending |
| Child safety | Unsafe-content, abuse/self-harm escalation, human review, no secrecy promise, no open web/social/direct messaging | Child-safety owner | Pending |
| Tutor policy | Versioned server policy, answer protection, structured validation, fallback, no LLM mastery authority | Learning/engineering owner | Pending |
| Content rights | All 38 content records (19 skills × 2 items, all 5 domains) mathematically reviewed, original/`llm_drafted` provenance, accessibility notes, reviewer records | Educator/content owner | Approved (scope noted) 2026-09-06 by the product/content owner, not a separately engaged subject-matter educator — see ADR-0001's approval record. |
| Evaluation | Synthetic corpus, severity labels, adjudication owner, leakage/correctness/tone/injection/accessibility cases, baseline report | Quality/evaluation owner | Gate approach decided 2026-09-06 (ADR-0009): lightweight, product-owner-reviewed ~20-30 case sample before real-provider use. Eval corpus itself not yet built. |
| Accessibility | WCAG 2.2 AA review, keyboard/text alternatives, accommodations, assistive-technology checks | Accessibility owner | Decided 2026-09-06 (ADR-0008): existing automated axe-core + keyboard-operability coverage accepted as sufficient baseline; no specific accommodation needed today. |
| Persistence | Migration apply/rollback evidence, household scoping, immutable attempts, export/deletion drill | Data/engineering owner | Pending |
| Observability | Metadata-only traces, redaction tests, access policy, incident audit trail, no raw child text by default | Engineering/privacy | Pending |
| Operations | Rate/cost limits, latency target, monitoring, alerting, rollback, incident contacts | Engineering/operations | Budget/latency targets decided 2026-09-06 (ADR-0009): well under $20/month, latency not critical. Rate/cost-limit implementation, monitoring, alerting, and incident contacts still pending. |
| Parent reporting | Every claim links to attempts/assessments; uncertainty and assistance are understandable | Learning/product owner | Pending |
| Launch decision | All blockers resolved, risks accepted, and human sign-offs recorded | Product owner and required reviewers | Pending |

## Minimum go/no-go rule

Do not launch with real learner data if any critical privacy/cross-user,
child-safety, consent, provider-terms, deletion, migration, or answer-leakage
control is pending. Phase 0 may demonstrate only with synthetic data and the
fake tutor while this checklist remains pending.
