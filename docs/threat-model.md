# Threat model and control baseline

This threat model covers the invite-only Learning Forge pilot boundary. Phase
0 uses synthetic data, local PostgreSQL, and a fake tutor. It identifies
controls required before authentication, a real provider, or real learner data
are enabled.

## Assets and trust boundaries

Assets include account/household ownership, consent records, learner profile
data, authored content and answers, raw attempts, tutor text, traces, mastery
claims, credentials, and operational availability. Trust boundaries are the
learner/parent client, identity provider, application modules, PostgreSQL,
observability systems, backup systems, and any future model provider.

## Threats and controls

| ID | Threat and affected asset | Preventive/detective controls | Evidence and owner | Residual risk/gate |
|---|---|---|---|---|
| T1 | Cross-household request exposes attempts, profile data, traces, or parent reports | Server-side household authorization on every query; identity/role port; deny-by-default tests; no client-supplied household trust | Authorization tests; Identity/Assessment owner | Must pass before any multi-user pilot |
| T2 | Learner prompt injection changes policy, reveals hidden answers, or changes permissions | Treat learner/content text as untrusted; deterministic state machine; structured output; allowlisted moves; leakage detector; fallback | Tutor contract/eval cases; Tutor owner | Real-model adversarial eval required |
| T3 | Tutor leaks canonical answer or key intermediate value too early | Keep answer out of early model context; pass verifier/redacted representation; compare exact/equivalent forbidden patterns; require policy state | Answer-protection tests and eval report; Tutor/Content owner | Equivalence coverage must be reviewed |
| T4 | Model gives mathematically wrong or unsafe advice | Deterministic validators where possible; rubric scoring for explanations; output validation; curated fallback; human review | Contract tests, content review, tutor evals; Quality owner | Real-provider baseline pending |
| T5 | Child receives age-inappropriate, shaming, manipulative, or dependency-forming language | Tone rubric; one useful question; no diagnosis/intimacy/streak pressure; moderation and human-review flag | Tutor eval corpus; Safety/educator owner | Human adjudication required |
| T6 | Abuse, self-harm, or crisis disclosure is ignored or mishandled | Do not promise secrecy; safety escalation path; stop normal tutoring when required; documented human owner and legal review | Incident procedure and safety cases; Safety owner | Product/legal response wording pending |
| T7 | Raw learner text or identifiers leak through traces, logs, prompts, screenshots, or fixtures | Data minimization; redaction; metadata-only traces; secret scan; synthetic fixtures; restricted observability | Privacy inventory, CI scans, trace tests; Privacy/Engineering owner | Provider and backup review pending |
| T8 | Compromised credential or overprivileged service exposes child data | Environment separation, secret manager, short-lived credentials, least privilege, rotation, audit review, no secrets in repository | Access review and deployment checklist; Security owner | Hosting choice pending |
| T9 | Malicious or derivative content introduces rights, unsafe claims, or answer leakage | Originality/provenance record, reviewer, schema validation, content review, versioned removal process | Content checklist and PR review; Content owner | Human rights/educator sign-off pending |
| T10 | Parent report overstates mastery or is not traceable | Derived estimates versioned; contributing attempt IDs; uncertainty bands; delayed independent check; no LLM-only mastery | Reporting tests and audit records; Student-model owner | Mastery algorithm remains experimental |
| T11 | Data deletion leaves copies in backups, logs, exports, or provider retention | Data inventory, deletion workflow, backup expiry/delete SLA, provider contract, deletion verification evidence | Pilot checklist and deletion drill; Privacy/Operations owner | Final retention decisions pending |
| T12 | Availability or model-cost abuse harms the pilot | Rate limits, session/time caps, provider allowlist, budget alerts, safe degradation, no autonomous tools | Operations runbook; Engineering owner | Numeric budget target pending |
| T13 | Migration or rollback damages evidence or makes deletion unsafe | Reviewed reversible migrations, synthetic rollback test, backups, change approval, no production down migration | Migration evidence; Data/Engineering owner | Production procedure pending |
| T14 | Accessibility barrier prevents a learner from receiving or answering safely | WCAG 2.2 AA, keyboard/text alternatives, no color-only or drag-only requirement, accommodation review | Accessibility test and human review; Accessibility owner | Pilot accommodations pending |

## Security and safety incident triggers

Treat any suspected cross-household disclosure, credential exposure, raw child
text export, answer leakage in a released flow, unsafe child-facing response,
lost deletion request, or material availability/cost abuse as an incident. Do
not wait for numerical thresholds when a child-safety or privacy boundary may
have failed.

## Phase 0 limitations

The repository does not yet implement authentication, provider moderation,
production authorization middleware, backup deletion, or crisis operations.
Those are named controls and release gates, not implied by this document.
