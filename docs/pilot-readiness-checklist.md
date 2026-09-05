# Pilot readiness checklist

The checklist records evidence and human approval; a checked engineering test
does not imply legal, safety, or accessibility approval. Complete it before
real learner data or a real model provider is enabled.

| Area | Required evidence | Owner/reviewer | Status |
|---|---|---|---|
| Product boundary | One-household invite-only scope, excluded features, pause authority | Product owner | Pending |
| Identity and access | Managed identity choice, parent/learner linking, household authorization tests, support-access procedure | Product/engineering + privacy | Pending |
| Consent | Parent consent scope, learner access, revocation, evidence, and notices | Privacy/legal + product | Pending |
| Data inventory | Approved purpose, minimization, roles, regions, processors, retention, export, deletion, and backup behavior for every data class | Privacy/legal | Pending |
| Provider terms | Provider, region, retention, training use, subprocessors, moderation, deletion, and approved-data boundary | Security/privacy + legal | Pending |
| Secrets | Environment-separated secret manager, least privilege, rotation, no repository/log exposure | Security/operations | Pending |
| Child safety | Unsafe-content, abuse/self-harm escalation, human review, no secrecy promise, no open web/social/direct messaging | Child-safety owner | Pending |
| Tutor policy | Versioned server policy, answer protection, structured validation, fallback, no LLM mastery authority | Learning/engineering owner | Pending |
| Content rights | Ten ratios problems mathematically reviewed, original/licensed provenance, accessibility notes, reviewer records | Educator/content owner | Pending |
| Evaluation | Synthetic corpus, severity labels, adjudication owner, leakage/correctness/tone/injection/accessibility cases, baseline report | Quality/evaluation owner | Pending |
| Accessibility | WCAG 2.2 AA review, keyboard/text alternatives, accommodations, assistive-technology checks | Accessibility owner | Pending |
| Persistence | Migration apply/rollback evidence, household scoping, immutable attempts, export/deletion drill | Data/engineering owner | Pending |
| Observability | Metadata-only traces, redaction tests, access policy, incident audit trail, no raw child text by default | Engineering/privacy | Pending |
| Operations | Rate/cost limits, latency target, monitoring, alerting, rollback, incident contacts | Engineering/operations | Pending |
| Parent reporting | Every claim links to attempts/assessments; uncertainty and assistance are understandable | Learning/product owner | Pending |
| Launch decision | All blockers resolved, risks accepted, and human sign-offs recorded | Product owner and required reviewers | Pending |

## Minimum go/no-go rule

Do not launch with real learner data if any critical privacy/cross-user,
child-safety, consent, provider-terms, deletion, migration, or answer-leakage
control is pending. Phase 0 may demonstrate only with synthetic data and the
fake tutor while this checklist remains pending.
