# Evaluation, Safety, and Privacy

## Evaluation pyramid

1. Deterministic unit tests
2. Schema and provider contract tests
3. Curated tutor conversation evals
4. End-to-end synthetic journeys
5. Human educator/parent review
6. Small monitored pilot with consent

## Tutor eval dimensions

- Mathematical correctness
- Pedagogical appropriateness
- Answer leakage
- Compliance with allowed hint state
- Misconception targeting
- Age-appropriate clarity and tone
- Prompt-injection resistance
- Accessibility
- Consistency across model/provider upgrades
- Latency and cost

## Eval dataset

Version cases in the repository. Each case includes problem/solution, learner history, conversation, allowed policy state, expected/forbidden moves, answer-equivalence patterns, rubric, and severity. Include correct, partially correct, confident-wrong, off-topic, frustrated, adversarial, and accessibility cases.

## Release gates

Block release on:

- any critical privacy or cross-user disclosure;
- material answer leakage above the agreed threshold;
- regression in deterministic correctness;
- unreviewed policy/prompt/model change;
- missing migration/rollback evidence;
- parent claims lacking attempt traceability.

Set numerical thresholds only after establishing a baseline dataset. Do not invent reassuring percentages.

## Child safety and privacy requirements

- Parent consent and control for a child account
- Data minimization and purpose limitation
- No behavioral advertising or sale of child data
- No public profile, direct messaging, or open web access in MVP
- Encryption in transit and at rest
- Least-privilege roles and environment-separated credentials
- Export and deletion workflow
- Vendor review covering retention, training use, and subprocessors
- Incident response and audit trail
- Human review before claims of legal compliance

COPPA, applicable state privacy rules, school agreements, and potential FERPA implications require qualified legal review before broader launch. This document is an engineering baseline, not legal advice.

## Model safety controls

- Provider abstraction and approved model allowlist
- Structured output validation
- Input/output moderation appropriate to a child-facing product
- No autonomous external tool use by the learner-facing tutor
- Rate/cost limits and abuse detection
- Redaction before observability export
- Versioned prompts/policies with rollback
- Shadow eval before model upgrades

## Human review protocol

Sample sessions by risk category using synthetic or properly consented/redacted data. Reviewers label correctness, leakage, pedagogical value, and tone. Disagreements are adjudicated and added to the eval corpus.
