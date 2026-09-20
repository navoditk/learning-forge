# Child-safety acceptance — Grade 6 Math progression pilot

**Status:** Product-owner acceptance recorded 2026-09-20 for the scoped
single-household pilot, with the child-safety review assumed complete at the
user's direction. This record is not a substitute for a named safety owner or
an emergency/legal process.

## Accepted safeguards

- The tutor remains bounded to the configured math-learning policy.
- Structured model output and deterministic validation remain authoritative;
  the model cannot grant mastery or bypass progression authorization.
- Distress, self-harm, abuse, exploitation, or unrelated unsafe-content signals
  route to human review rather than normal tutoring.
- The system must not promise secrecy, encourage dependency, or provide
  unreviewed emergency/legal advice.
- Raw child text is excluded from default traces and operational logs.

## Reinforcement requirements

- [ ] Name the safety escalation owner and destination before real learner use
      beyond the product owner's household.
- [ ] Document pause authority and response expectations in
      `docs/incident-response.md`.
- [ ] Re-run safety, tone, age-appropriateness, prompt-injection, and
      answer-leakage evaluations after tutor or progression-copy changes.
- [ ] Review live safety events with a human and add a redacted regression
      case without committing child-identifying text.

## Revisit trigger

Revisit before adding direct messaging, social features, additional
households, younger learners, or a new model provider.
