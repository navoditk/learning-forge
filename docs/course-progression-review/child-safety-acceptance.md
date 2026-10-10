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

- [x] Name the safety escalation owner and destination before real learner use
      beyond the product owner's household. **Resolved 2026-10-09** (product
      owner, in chat): owner and destination are the product owner,
      navodit.kaushik@gmail.com — recorded in `docs/incident-response.md`'s
      "Child-safety escalation" section. **Automated notification wired up
      2026-10-10**: `recordTutorResponse` now calls a real notifier
      whenever a response is safety-flagged (`src/tutor/harness.ts`'s
      `safetyFlagged`, `src/notification/`). Still open: the product owner
      has not yet set `NOTIFIER_PROVIDER=resend` with real Resend
      credentials in the actual deployment, so production still runs on
      the log-only default until that's done — see
      `docs/incident-response.md` for the remaining step.
- [x] Document pause authority and response expectations in
      `docs/incident-response.md`. **Resolved 2026-10-09** (product owner,
      in chat): pause authority (product owner, unilateral, via existing
      Render/feature-flag/database access) and a same-day response-time
      target for safety escalation are accepted as written there.
- [ ] Re-run safety, tone, age-appropriateness, prompt-injection, and
      answer-leakage evaluations after tutor or progression-copy changes.
- [ ] Review live safety events with a human and add a redacted regression
      case without committing child-identifying text.

## Revisit trigger

Revisit before adding direct messaging, social features, additional
households, younger learners, or a new model provider.
