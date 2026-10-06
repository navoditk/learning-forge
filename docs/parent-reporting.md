# Parent reporting

What a parent can see, how every claim traces back to real evidence, and
how uncertainty/assistance are communicated rather than hidden behind a
single score. Records existing engineering (`src/app/parent/page.tsx`,
`src/phase1/service.ts`'s `getParentEvidence`/`getWeeklyDigest`,
`src/notification/build-weekly-digest.ts`), not a new design.

## Every claim traces to a real record

`getParentEvidence` (`src/phase1/service.ts`) queries only the signed-in
parent's own household/learner (via `requireHouseholdContext` -
cross-household access is structurally impossible, not just policy). It
returns:

- **Attempts**: each with its real `id`, the content item's resolved
  title (even for retired/changed content, via
  `resolveHistoricalContent`), correctness, timestamp, and
  `highestAssistance` - derived from the attempt's actual
  `AssistanceEvent` rows (`deriveHighestAssistance`), not a self-reported
  or inferred value.
- **Mastery**: each skill's `estimate`, `confidenceBand`, and whether an
  independent delayed check has confirmed it - scoped to the one
  algorithm version currently in use (`PHASE_1_MASTERY_VERSION`), so a
  future algorithm change doesn't silently reinterpret old estimates
  under a new meaning.

Nothing in the parent view is model-generated text describing progress -
every number and label is read directly from persisted attempt/mastery
rows. (The tutor's own structural inability to grant mastery is documented
in `docs/tutor-policy.md`.)

## Uncertainty and assistance are shown, not collapsed into a score

The parent UI (`src/app/parent/page.tsx`) and the weekly digest
(`src/notification/build-weekly-digest.ts`) both surface the underlying
nuance instead of a single pass/fail number:

- **Confidence band** (`LOW`/`MEDIUM`/`HIGH`, lowercased for display) is
  shown next to every mastery estimate - a low-confidence estimate reads
  as uncertain, not as a hidden caveat.
- **Assistance level** is shown per attempt ("guided full solution
  assistance," not just "correct") - a correct answer with heavy
  scaffolding is visibly different from an independent one.
- **Independent confirmation** is stated as what actually happened, not
  overclaimed: `"Independently confirmed"` or `"Independent confirmation
  still needed"` - reworded 2026-09-30 (see `docs/PROGRESS.md`) after an
  independent review found the previous wording ("Delayed check
  complete") overclaimed a genuine time-separated check for a skill
  confirmed through the same-sitting path (D-65).
- **No attempts yet / no mastery evidence yet** render as plain, honest
  empty states, not an inferred or default-optimistic claim.

The weekly digest's headline is generated the same way: `"<name> completed
N attempts across M skills this period: K correct"` or, when there's
nothing to report, `"<name> has not attempted any skills yet this
period"` - counted directly from the same attempt/mastery rows, never
phrased as an assessment of the learner.

## Current status

This closes the "Parent reporting" row of the pilot-readiness checklist:
every claim already links to attempts/assessments, and uncertainty/
assistance are already communicated in plain language, not just present
in the data model. Not yet done: a dedicated eval/test corpus asserting
the parent-facing *wording* itself stays accurate as the UI evolves (today
this is caught ad hoc, as the D-65/F6 rewording above was) - worth adding
if parent-facing copy changes become frequent.
