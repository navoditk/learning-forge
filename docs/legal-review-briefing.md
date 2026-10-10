# Legal review briefing — Learning Forge pilot

Prepared 2026-10-10 to make a future legal review fast and cheap, not to
substitute for one. Nothing in this document is legal advice or a claim of
compliance with COPPA, FERPA, or any state law. It summarizes, with pointers
to the underlying evidence, so counsel can start from facts instead of a
blank page.

## What this product is

Learning Forge is a single-household, invite-only math tutoring pilot for
one Grade 6 student. The product owner is simultaneously the sole account
operator, the only engineer/administrator with system access, and the
learner's parent/guardian. There is no public sign-up, no second household,
and no plan to expand beyond this one family without a separate decision
(ADR-0008).

## Who the learner is, and who consented

- The learner is a minor (Grade 6, age 11-12).
- Consent is informal: the product owner, as the child's own parent, both
  operates the system and is the one who would otherwise need to consent on
  the child's behalf. ADR-0008 records this as the deliberate basis for
  skipping a formal consent UI/notice flow, "appropriate only because the
  product owner is both operator and guardian" — not a claim this
  generalizes to any other household.
- No consent UI, revocation flow, or consent evidence trail has been built.
  This is a known, named gap (`docs/pilot-readiness-checklist.md`'s
  "Consent" row).

## What data is collected and where it goes

Full inventory: `docs/privacy-inventory.md`. Summary:

| Data | Goes to | Notes |
|---|---|---|
| Learner's answer text, tutor conversation message | Anthropic Claude API (see Provider section below) | Only the current problem, the learner's message, and a server-decided move type are sent — never account identity, credentials, or other household data |
| Attempts, mastery estimates, session records | This app's own PostgreSQL database (hosted on Render) | Immutable attempt rows; mastery is recalculated, never model-generated |
| Tutor interaction metadata | Same database | Redacted excerpt only by default; no raw child conversation text retained in traces |
| Account/household data | Same database | Email/password only; no managed identity provider in front of it |

No data is sold, shared with advertisers, or used for any purpose besides
running and improving this one household's tutoring sessions. A household's
full data can be exported or permanently deleted on demand from the app
itself (`/parent`, "Your data" section).

## The AI provider (Anthropic) and its terms

Full detail and sources: `docs/privacy-inventory.md`'s "Provider terms"
section (researched 2026-10-10 from Anthropic's own published pages, not an
independent legal review of their terms).

- **Training use**: Anthropic's Commercial Terms of Service state Anthropic
  "may not train models on Customer Content from Services" — excluded by
  default.
- **Retention**: 30 days after receipt/generation by default (no separate
  Zero Data Retention agreement is in place for this pilot).
- **Deletion**: Data Processing Addendum requires deletion or return of
  customer data within 30 days of contract termination.
- **Region/subprocessors**: not pinned to a specific region in the DPA;
  standard EU/UK/Swiss SCC transfer frameworks are incorporated. Anthropic's
  subprocessor list is maintained at a page this research could not render
  directly; third-party summaries (not independently verified) name AWS and
  GCP.
- **Minors-serving policy**: Anthropic's Usage Policy has a specific
  requirement for organizations letting minors directly interact with an
  API-based product, which applies here. This pilot has addressed the
  disclosure and minor-facing safety-note requirements (see "Current
  safeguards" below); it has not obtained Anthropic's optional child-safety
  system prompt (researched and found not practically obtainable at this
  pilot's scale — see `docs/privacy-inventory.md`) and has not had this
  area reviewed by counsel.

## Current safeguards already implemented (evidence, not a legal claim)

- **Structural answer protection**: the AI model never receives the
  canonical answer to any problem and cannot grant mastery; mastery is
  always computed from deterministic attempt scoring
  (`docs/tutor-policy.md`).
- **Safety-flag handling**: a model response flagged for distress,
  self-harm, or off-topic content is never shown to the learner — it falls
  back to a fixed, server-authored message. Tested directly
  (`tests/tutor/tutor.test.ts`).
- **AI disclosure**: the learner is told the tutor is "an AI, not a real
  person" wherever it appears, plus a plain-language safety note the first
  time a hint is requested ("tell a grown-up" if anything feels wrong).
- **Parent transparency**: every claim a parent sees traces to a real
  attempt/assessment record; nothing is model-generated progress text
  (`docs/parent-reporting.md`).
- **Incident response**: a named escalation contact and unilateral
  pause authority exist for the product owner (`docs/incident-response.md`).
  No automated alert fires yet when a safety flag is recorded — today this
  relies on manually reviewing traces, a named engineering gap, not a
  policy gap.

## Known, named gaps (not yet closed, listed so counsel doesn't have to find them)

- No consent UI/notice/revocation flow (informal consent only, per above).
- No automated human notification when a safety flag fires.
- Anthropic's region/subprocessor/training/retention terms are researched
  from public pages, not confirmed via a signed, reviewed contract specific
  to this account.
- No prior COPPA, FERPA, or state-law analysis has been performed.

## Specific questions for counsel

1. Does COPPA (or equivalent state law) apply differently, or at all, when
   the only "operator" collecting a child's data is that child's own
   parent, as opposed to an unrelated commercial operator? Does the
   informal-consent basis in ADR-0008 hold up, or is a formal notice/consent
   mechanism required regardless?
2. Is FERPA implicated at all, given this is not affiliated with any school
   and the "institution" is the parent's own household?
3. Does Anthropic's standard Commercial Terms of Service / DPA, as
   summarized above, meet whatever data-processing-agreement requirements
   apply to a child's personal data under COPPA or state law — or does this
   pilot need a separate, negotiated agreement with Anthropic?
4. Are there state-specific children's online privacy laws (e.g., recent
   state AI/minor-safety statutes) that would apply here beyond COPPA?
5. Given the single-household, parent-operated scope, is there a threshold
   (second household, broader audience, school affiliation) past which this
   analysis would need to be redone — and should that threshold be recorded
   as a decision gate before this pilot expands?

## Related documents

`docs/privacy-inventory.md`, `docs/tutor-policy.md`,
`docs/parent-reporting.md`, `docs/course-progression-review/child-safety-acceptance.md`,
`docs/incident-response.md`, `docs/secrets-management.md`,
`docs/pilot-readiness-checklist.md`, ADR-0008, ADR-0009, ADR-0011.
