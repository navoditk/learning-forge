# Privacy inventory and data-flow baseline

This inventory is an engineering baseline for the invite-only single-household
pilot. It is not legal advice or a claim of COPPA, FERPA, or state-law
compliance. A privacy/legal owner must approve the unresolved fields before
additional households or broader real learner use.

ADR-0008 and ADR-0009 (2026-09-06) resolved the pilot's scope, identity
mechanism, consent/retention policy, and model provider selection for a
single-household pilot; see those ADRs and `docs/09-decisions-and-open-questions.md`
for what is decided versus still open (regions, processor contractual terms,
and backup behavior remain pending below).

## Data-flow boundary

The intended flow is:

`parent/learner client → identity boundary → modular monolith → PostgreSQL`

Tutor requests pass only the problem prompt, current learner message, server-
authorized move type, and redacted skill context needed for a move. The
provider boundary rejects profile fields, credentials, and secret-like values;
provider SDK objects remain inside adapters. Anthropic is the current provider,
but its contractual region, retention, training-use, and subprocessor terms
remain a human/privacy review item.

## Inventory

| Data class | Purpose and minimum fields | Access roles | Storage/region | Retention and deletion | Export | Processor/logging status |
|---|---|---|---|---|---|---|
| Account identity | Link an approved account to a household; use provider subject and internal ID only | Parent for own household; identity module; support only when approved | App database (host: Render, ADR-0005); region not selected. Mechanism: simple email/password or magic-link for the parent account (ADR-0008); not yet implemented | Retained indefinitely for household use; delete on manual request (ADR-0008); backup-deletion SLA pending | Account and consent metadata | No managed identity provider selected; never log credentials or tokens |
| Household and roles | Enforce parent/learner ownership and least privilege | Identity and authorized parent | PostgreSQL; region not selected | Pending approval; cascade only through reviewed deletion workflow | Household/role metadata | Internal application data; access events may be logged without child text |
| Learner profile | Personalize grade, preferences, accommodations, and curriculum context | Learner for own settings; parent for linked learner; restricted services | PostgreSQL; region not selected | Minimize optional fields; deletion/retention pending approval | Profile fields and consent status | No advertising, sale, or provider transfer by default |
| Consent records | Record parent decision, scope, policy version, grant/revoke times | Parent, privacy/legal reviewer, identity module | PostgreSQL; region not selected | Preserve only as legally required; deletion behavior pending approval | Consent history and status | Access is audited; do not log free-form proof documents |
| Authored content | Deliver original/licensed problems, solutions, hints, provenance, and accessibility notes | Content owner and application read path | Version control; repository region follows GitHub settings | Version history retained for provenance; remove only through reviewed rights process | Content version and provenance | No child data; generated content remains distinct |
| Raw attempts | Evidence for scoring, assistance-aware mastery, and traceable reporting | Assessment/student-model services; parent only through evidence-linked views | PostgreSQL; region not selected | Immutable updates; retention/deletion schedule pending approval; account deletion must be tested | Structured attempt evidence, with raw text only if approved | Never send unnecessary profile data to a provider; avoid raw text in logs |
| Raw learner text | Score or tutor the learner when demonstrably necessary | Only the request path and explicitly approved provider path | Transient request memory and provider request; current live provider: Anthropic Claude API (ADR-0009) | Do not retain in tutor traces; household export includes raw attempt responses for the parent-controlled pilot; deletion service removes local copies | Export through the authenticated/manual household export workflow | Sensitive; provider retention/training-use terms still require confirmation; redact before traces and observability |
| Tutor interactions | Explain assistance used and support parent evidence | Tutor/audit services; parent through traceable summary | PostgreSQL with redacted excerpt only; region not selected | Pending approval; delete through household workflow | Move type, assistance, versions, redacted excerpt | No raw child conversation by default |
| Model traces | Debug policy and provider behavior using metadata | Restricted engineering/evaluation roles | PostgreSQL/observability sink; region not selected | Metadata-first retention pending approval; backup deletion must match | Metadata and redacted excerpt only | No credentials, prompts with secrets, or raw child text |
| Derived mastery | Show uncertain, versioned learning evidence | Student model; parent through attempt-linked reports | PostgreSQL; region not selected | Recalculate from attempts; delete with learner record per approved policy | Estimate, band, algorithm version, contributing IDs | Never present model confidence as mastery evidence |
| Operational telemetry | Availability, latency, errors, rate/cost limits | Restricted operations roles | Environment-specific sink; region not selected | Shortest useful schedule pending approval | Aggregated metrics only | No message content, identifiers, tokens, or secrets in default logs |
| Backups | Disaster recovery | Restricted operations and approved provider | Render-managed PostgreSQL backup capability is not yet verified for the pilot database; region and deletion SLA are not selected | Backup expiry and deletion after account deletion require approval; see `docs/backup-recovery.md` | Not a user-visible primary export | Backup processor, encryption, access, and restore behavior pending dashboard verification |

## Required controls before real data

- Select and document hosting, identity, database, observability, and model
  processors, including regions, subprocessors, retention, training use, and
  deletion commitments.
- Approve parent consent, learner access, revocation, export, deletion,
  backup-deletion, and support-access procedures.
- Enforce household-scoped authorization in every read/write path; database
  foreign keys alone are not an authorization control.
- Classify free-form learner text as sensitive, redact it from traces, and
  prohibit secrets, credentials, or private learner data in fixtures and logs.
- Encrypt in transit and at rest, separate environments, use least privilege,
  rotate credentials, and review access logs.
- Link every parent-facing claim to attempts or assessments and preserve the
  content, policy, prompt, model, and algorithm versions needed to explain it.
- Run `exportHouseholdData` before deletion when a household requests a copy,
  then run `deleteHouseholdData` and verify no household-scoped rows remain.
