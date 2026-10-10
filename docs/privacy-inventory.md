# Privacy inventory and data-flow baseline

This inventory is an engineering baseline for the invite-only single-household
pilot. It is not legal advice or a claim of COPPA, FERPA, or state-law
compliance. A privacy/legal owner must approve the unresolved fields before
additional households or broader real learner use.

ADR-0008 and ADR-0009 (2026-09-06) resolved the pilot's scope, identity
mechanism, consent/retention policy, and model provider selection for a
single-household pilot; see those ADRs and `docs/09-decisions-and-open-questions.md`
for what is decided versus still open.

**Region (resolved 2026-10-10, previously undocumented):** every row below
that said "region not selected" was stale - `render.yaml` has pinned both
the database and web service to Render's `oregon` region since 2026-09-17
(`2d31e2e`/`fe1ca9f`), it was just never reflected back into this inventory.
There is one region for the whole stack; nothing here varies by data class.
Anthropic's own region/subprocessor specifics remain as described in the
Provider terms section below - a separate question from where this app's
own database lives.

**Backup behavior (researched 2026-10-10 from Render's own docs, not yet
confirmed against the actual Render dashboard for this account - see
`docs/backup-recovery.md`).** Render's Hobby-tier Postgres plans (which
`basic-256mb` in `render.yaml` falls under) provide point-in-time recovery
covering "the past 3 days," and restoring creates a new database instance
rather than overwriting the original. This directly answers the
"backup-deletion SLA pending" notes below: once a deleted household's data
ages out of that 3-day PITR window, no backup copy of it remains recoverable
by Render's own restore mechanism. The pilot's 24-hour RPO target is
comfortably inside that window. Still not confirmed: the actual configured
retention in this account's dashboard (plans can change), and real restore
timing against the 4-hour RTO target.

## Data-flow boundary

The intended flow is:

`parent/learner client → identity boundary → modular monolith → PostgreSQL`

Tutor requests pass only the problem prompt, current learner message, server-
authorized move type, and redacted skill context needed for a move. The
provider boundary rejects profile fields, credentials, and secret-like values;
provider SDK objects remain inside adapters. Anthropic is the current
provider.

**Provider terms (researched 2026-10-10, not a legal review).** Sourced from
Anthropic's own published pages where fetched directly; summarized where a
page could not be rendered (noted below). Not independently verified beyond
what's quoted:

- **Training use**: excluded by default. Anthropic's Commercial Terms of
  Service state "Anthropic may not train models on Customer Content from
  Services." No training opt-out is needed; it is the baseline.
- **Retention**: the API's default is 30 days after receipt/generation,
  with exceptions (a separate Zero Data Retention agreement, legal
  requirement, dispute resolution, or abuse enforcement). No ZDR agreement
  exists for this pilot, so the 30-day default applies.
- **Deletion**: the Data Processing Addendum requires deletion or return of
  customer data within 30 days of contract termination, same exceptions as
  above.
- **Region/subprocessors**: the DPA does not name specific data-center
  regions; it incorporates EU/UK/Swiss SCC transfer frameworks. Anthropic's
  subprocessor list lives at a dynamic trust-center page this research could
  not render directly; third-party summaries (not primary-verified) name AWS
  and GCP as primary infrastructure subprocessors.
- **Moderation / minors-serving policy**: Anthropic's Usage Policy requires
  organizations letting minors directly interact with a product built on its
  API — which this app is — to follow its "Guidelines for Organizations
  Serving Minors": content moderation/filtering, monitoring/reporting,
  minor-facing safety education, a public child-privacy-law compliance
  statement (e.g. COPPA), disclosure that the learner is talking to an AI,
  and (optionally) Anthropic's own child-safety system prompt. Anthropic may
  audit and suspend/terminate non-compliant accounts.
  - Addressed 2026-10-10: the AI-not-a-human disclosure now appears
    wherever the tutor appears, and a draft public compliance statement is
    in `/help` (`src/app/help/page.tsx`'s "AI use and children's privacy"
    section) for the product owner's review — it describes current
    practice, not a legal compliance determination.
  - Addressed 2026-10-10: a plain-language, learner-facing safety note
    ("The hint comes from a computer program, not a person. If anything
    ever feels wrong or upsetting, tell a grown-up.") now shows the first
    time a learner considers asking for a hint
    (`src/app/components/activity-panel.tsx`), closing the minor-facing
    safety-education gap. This is in addition to, not instead of, the
    parent-facing statement in `/help`.
  - Researched and closed 2026-10-10, not implemented: Anthropic's own
    "Child safety guidance for developers" article
    (support.claude.com/en/articles/15591275) does not publish the
    child-safety system prompt's text or any self-service way to request
    it — the article's only concrete tools (Thorn/IWF image-detection
    services, NCMEC reporting, the Tech Coalition's Pathways program) are
    for platforms handling user-uploaded images/video, which this app does
    not have. It is not practically obtainable at this single-household
    pilot's scale (no enterprise account relationship to request it
    through). This app's existing `safetyFlags`/deterministic-policy/
    fallback mechanism (`docs/tutor-policy.md`) already serves the
    equivalent purpose this prompt is meant to reinforce. Treated as a
    researched dead end, not a lingering gap.
  - Still open: no formal legal review of COPPA/FERPA/state law has
    happened for this pilot. See the briefing packet prepared for that
    review, `docs/legal-review-briefing.md`.

**Render processor terms (researched 2026-10-10, not a legal review).**
Render is the infrastructure/hosting processor (database and web service,
ADR-0005), a separate question from the Anthropic model-provider terms
above. Sourced from `render.com/trust` and `render.com/docs/certifications-
compliance` fetched directly (primary-verified); the DPA and Terms of
Service pages themselves are JavaScript-rendered and would not render their
substantive text through this research's fetch tool, so DPA/ToS clauses
below are from search-engine-indexed quotes of that text, not a direct
fetch — same caveat level as Anthropic's subprocessor list above:

- **Training use**: not applicable / no clause found. Render is a
  platform-as-a-service/infrastructure provider, not a model provider — it
  does not train AI/ML models on hosted customer data, and no search found
  any Render statement to the contrary. This is a different category of
  question than Anthropic's training-use clause above, not an unresearched
  gap.
- **Deletion/return**: Render's DPA (search-indexed quote of its Section
  2.4): "Following completion of the Services, at Customer's choice,
  Company shall return or delete Customer's Personal Data, unless further
  storage of such Personal Data is required or authorized by applicable
  law." No fixed day-count SLA is stated (unlike Anthropic's explicit
  30-day window) — deletion/return is triggered by service completion and
  the customer's own choice, not an automatic countdown. Render's general
  Terms of Service additionally reserve broad discretion over data on its
  servers and place the burden of exporting data before termination on the
  customer — this general ToS language and the DPA's own specific
  obligation for _personal_ data were not independently reconciled by this
  research; a legal reviewer should treat the DPA as the controlling term
  for personal data but confirm this.
- **Retention (backups)**: see `docs/backup-recovery.md` — Hobby-tier
  Postgres point-in-time recovery covers the past 3 days (confirmed
  directly from `render.com/docs/postgresql-backups`); separate
  dashboard-triggered logical backups are retained 7 days regardless of
  plan tier.
- **Subprocessors**: confirmed directly from `render.com/trust`: Amazon Web
  Services (AWS), Google Cloud Platform (GCP), Cloudflare, and ClickHouse
  Inc., all listed for "Hosting / Cloud Platform," all US-based. The DPA's
  subprocessor-change process (search-indexed quote): at least 10 days'
  advance notice before adding a new subprocessor, with a 10-day window for
  the customer to object in writing on data-protection grounds.
- **Region**: `oregon`, already resolved above from `render.yaml` directly
  (not a Render-terms question).
- **Compliance certifications** (confirmed directly from `render.com/docs/
certifications-compliance`): SOC 2 Type 2 (annual third-party audit),
  ISO 27001, a GDPR DPA provided to all workspaces, and HIPAA-enabled
  workspaces available for organizations processing US health data (not
  relevant to this app, noted for completeness). Render is also certified
  under the EU-US Data Privacy Framework (per a separate Render changelog
  announcement, not independently re-verified here).
- **Render's own under-16/under-13 data policy**: search-indexed summary of
  Render's privacy policy states Render does not knowingly collect personal
  data from children under 16, and deletes any such data found. This
  describes Render's own direct signup/account data (i.e., who creates a
  Render account), not the learner data this app stores in its Render-
  hosted database — a different, unrelated question from this pilot's own
  child-safety/consent posture (`docs/consent-notice.md`,
  `docs/tutor-policy.md`).
- **Still pending**: a primary-source read of the DPA and Terms of Service
  full text (not just search-indexed quotes), since this research's fetch
  tool could not render either page's substantive content; and a formal
  legal review, same as Anthropic's terms above.

## Inventory

| Data class               | Purpose and minimum fields                                                                | Access roles                                                                 | Storage/region                                                                                                                                                                                                                                                      | Retention and deletion                                                                                                                                                                              | Export                                                            | Processor/logging status                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Account identity         | Link an approved account to a household; use provider subject and internal ID only        | Parent for own household; identity module; support only when approved        | App database (host: Render, ADR-0005); region: Oregon (render.yaml). Mechanism: simple email/password or magic-link for the parent account (ADR-0008); not yet implemented                                                                                          | Retained indefinitely for household use; delete on manual request (ADR-0008); backup-deletion SLA pending                                                                                           | Account and consent metadata                                      | No managed identity provider selected; never log credentials or tokens                                              |
| Household and roles      | Enforce parent/learner ownership and least privilege                                      | Identity and authorized parent                                               | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Pending approval; cascade only through reviewed deletion workflow                                                                                                                                   | Household/role metadata                                           | Internal application data; access events may be logged without child text                                           |
| Learner profile          | Personalize grade, preferences, accommodations, and curriculum context                    | Learner for own settings; parent for linked learner; restricted services     | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Minimize optional fields; deletion/retention pending approval                                                                                                                                       | Profile fields and consent status                                 | No advertising, sale, or provider transfer by default                                                               |
| Consent records          | Record parent decision, scope, policy version, grant/revoke times                         | Parent, privacy/legal reviewer, identity module                              | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Preserve only as legally required; deletion behavior pending approval                                                                                                                               | Consent history and status                                        | Access is audited; do not log free-form proof documents                                                             |
| Authored content         | Deliver original/licensed problems, solutions, hints, provenance, and accessibility notes | Content owner and application read path                                      | Version control; repository region follows GitHub settings                                                                                                                                                                                                          | Version history retained for provenance; remove only through reviewed rights process                                                                                                                | Content version and provenance                                    | No child data; generated content remains distinct                                                                   |
| Raw attempts             | Evidence for scoring, assistance-aware mastery, and traceable reporting                   | Assessment/student-model services; parent only through evidence-linked views | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Immutable updates; retention/deletion schedule pending approval; account deletion must be tested                                                                                                    | Structured attempt evidence, with raw text only if approved       | Never send unnecessary profile data to a provider; avoid raw text in logs                                           |
| Raw learner text         | Score or tutor the learner when demonstrably necessary                                    | Only the request path and explicitly approved provider path                  | Transient request memory and provider request; current live provider: Anthropic Claude API (ADR-0009)                                                                                                                                                               | Do not retain in tutor traces; household export includes raw attempt responses for the parent-controlled pilot; deletion service removes local copies                                               | Export through the authenticated/manual household export workflow | Sensitive; provider retention/training-use terms still require confirmation; redact before traces and observability |
| Tutor interactions       | Explain assistance used and support parent evidence                                       | Tutor/audit services; parent through traceable summary                       | PostgreSQL with redacted excerpt only; region: Oregon (render.yaml)                                                                                                                                                                                                 | Pending approval; delete through household workflow                                                                                                                                                 | Move type, assistance, versions, redacted excerpt                 | No raw child conversation by default                                                                                |
| Model traces             | Debug policy and provider behavior using metadata                                         | Restricted engineering/evaluation roles                                      | PostgreSQL/observability sink; region: Oregon (render.yaml)                                                                                                                                                                                                         | Metadata-first retention pending approval; backup deletion must match                                                                                                                               | Metadata and redacted excerpt only                                | No credentials, prompts with secrets, or raw child text                                                             |
| Derived mastery          | Show uncertain, versioned learning evidence                                               | Student model; parent through attempt-linked reports                         | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Recalculate from attempts; delete with learner record per approved policy                                                                                                                           | Estimate, band, algorithm version, contributing IDs               | Never present model confidence as mastery evidence                                                                  |
| Assessment assignments   | Immutable record of selected assessment items and pinned policy/curriculum versions       | Assessment service; parent through evidence-linked reports                   | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain as audit evidence until household deletion; never edit in place                                                                                                                              | Assignment metadata and item refs                                 | No prompts or learner free text by default                                                                          |
| Assessment run state     | Mutable progress for an assessment assignment                                             | Assessment service                                                           | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Run status and ordinals                                           | No learner text                                                                                                     |
| Assessment results       | Immutable scored assessment outcome                                                       | Assessment service; parent through evidence-linked reports                   | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain as audit evidence until household deletion; never edit in place                                                                                                                              | Outcome, item results, pinned versions                            | No prompts or learner free text by default                                                                          |
| Active assessment leases | Prevent duplicate active assessment assignments                                           | Assessment service                                                           | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Lease metadata                                                    | No learner text                                                                                                     |
| Learner placement        | Placement position and its evidence references                                            | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain until household deletion                                                                                                                                                                     | Placement method and refs                                         | No learner text                                                                                                     |
| Learner unit state       | Unit completion and override state                                                        | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Status and version pins                                           | No learner text                                                                                                     |
| Learner lesson state     | Lesson completion and remediation state                                                   | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Status and version pins                                           | No learner text                                                                                                     |
| Unlock grants            | Audit of derived progression unlocks                                                      | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Target, requirement, policy, and evidence refs                    | No learner text                                                                                                     |
| Skip records             | Evidence-backed completion-by-skip decisions                                              | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain until household deletion                                                                                                                                                                     | Evidence refs and outcome                                         | No learner text                                                                                                     |
| Override records         | Human parent/operator progression decisions                                               | Parent/operator audit path                                                   | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain until household deletion                                                                                                                                                                     | Actor, reason, target, and re-auth time                           | Do not log credentials or step-up secrets                                                                           |
| Review schedules         | Due dates and interval state for spaced review                                            | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable state; delete with household                                                                                                                                                        | Schedule metadata                                                 | No learner text                                                                                                     |
| Learning events          | Server-side exposure history for delayed checks                                           | Student model; parent through evidence-linked reports                        | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Retain until household deletion; required to explain exposure                                                                                                                                       | Skill/content refs and event timestamps                           | No learner text                                                                                                     |
| Shadow decisions         | Non-enforcing comparison of progression policy to legacy behavior                         | Restricted engineering/evaluation roles                                      | PostgreSQL; region: Oregon (render.yaml)                                                                                                                                                                                                                            | Reconstructable rollout telemetry; delete with household                                                                                                                                            | IDs, refs, reason codes, and divergence                           | Never store prompts, answers, or free text                                                                          |
| Operational telemetry    | Availability, latency, errors, rate/cost limits                                           | Restricted operations roles                                                  | Environment-specific sink; region: Oregon (render.yaml)                                                                                                                                                                                                             | Shortest useful schedule pending approval                                                                                                                                                           | Aggregated metrics only                                           | No message content, identifiers, tokens, or secrets in default logs                                                 |
| Backups                  | Disaster recovery                                                                         | Restricted operations and approved provider                                  | Render-managed PostgreSQL; region: Oregon (render.yaml); researched 2026-10-10 (3-day PITR on Hobby tier, 7-day logical-backup retention regardless of tier) but not yet confirmed against this account's actual dashboard settings — see `docs/backup-recovery.md` | Backups age out of the 3-day PITR window; no fixed SLA found in Render's DPA for backup data specifically, only its general return/deletion-on-service-completion clause (see Provider terms above) | Not a user-visible primary export                                 | Processor is Render itself (not a separate backup vendor); encryption/access controls not yet dashboard-confirmed   |

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
