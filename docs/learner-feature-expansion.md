# Learner-facing feature expansion

The next product increments should improve learning quality without weakening
the distinction between assisted practice and independent mastery. Each
increment should remain server-authorized, accessible, measurable, and usable
with the existing fake tutor provider.

## Prioritized sequence

### 1. Learner session progression

Add a clear session shell with the current problem, attempt history for the
problem, assistance level, and an explicit next action. Persist session
progress so refreshes do not lose the learner's place. Acceptance evidence:
the learner can complete, pause, and resume a session without duplicate
attempts or hidden state.

### 2. Diagnostic and placement flow

Add a short, deterministic diagnostic that samples prerequisite skills and
creates an initial plan. Keep diagnostic attempts separate from practice and
mastery-check attempts. Acceptance evidence: the plan cites the observed
attempts, does not call tutoring assistance mastery, and can be regenerated
without changing historical evidence.

### 3. Independent mastery checks and review

Add delayed, low-assistance checks and a spaced-review queue driven by the
existing mastery estimate model. A check should be visually distinct from
practice and should not reveal the answer through the prompt or feedback.
Acceptance evidence: only independent or explicitly qualified evidence can
advance the independent mastery signal.

### 4. Learner-visible progress

Show skill progress, recent strengths, and one recommended next activity with
plain-language explanations tied to attempts. Avoid grades, rankings, or
unqualified claims of mastery. Acceptance evidence: every claim rendered to a
learner can be traced to persisted evidence and remains understandable with
screen readers.

### 5. Accessibility and feedback refinement

Complete keyboard/focus behavior, error recovery, readable math notation,
reduced-motion behavior, and age-appropriate feedback across the learner flow.
Add Playwright and axe coverage for the primary session and review journeys.

## Deliberate exclusions for this phase

Do not add voice, handwriting recognition, social features, open-web content,
mobile-specific clients, or multi-agent architecture until the core session,
mastery, privacy, and accessibility evidence is stable.

## Delivery rule

Each feature is one vertical increment: contract/domain rule, persistence
change if needed, learner UI, policy/eval coverage, accessibility checks, and
an update to `docs/PROGRESS.md`. Generated tutor text must remain subordinate
to deterministic server policy and structured validation.
