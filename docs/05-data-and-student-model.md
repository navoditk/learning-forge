# Data and Student Model

## Core entities

- `User`, `Household`, `LearnerProfile`, `ConsentRecord`
- `Curriculum`, `Standard`, `Skill`, `SkillPrerequisite`
- `ContentItem`, `Problem`, `HintStep`, `Rubric`, `ContentVersion`
- `LearningPlan`, `PlanItem`, `Session`
- `Attempt`, `Response`, `TutorInteraction`, `AssistanceEvent`
- `Assessment`, `AssessmentResult`
- `MasteryEstimate`, `MisconceptionEvidence`, `ReviewSchedule`
- `ModelRun`, `PolicyVersion`, `EvalRun`

This is the **target** model. Several of these entities are not implemented;
`docs/PROGRESS.md`'s domain-model coverage table is the authoritative record
of what exists in `prisma/schema.prisma` today versus what remains
design-only. Do not read this list as current schema state.

### Proposed progression entities

`docs/course-progression-architecture.md` §3 proposes the entities that turn
the current problem pool into a course, split strictly by layer:

- **Curriculum (versioned JSON, reviewed in pull requests):** a versioned
  `Program` registry, `Unit`, `Lesson`, `AssessmentBank` metadata, and a
  structural `ProgressionRequirement` that references a policy profile by code
  and version but contains no numbers.
- **Pedagogical policy (versioned artifacts, not curriculum and not
  constants):** `ProgressionPolicyProfile`, holding every threshold, delay,
  interval, weight, pass bar, and cooldown.
- **Learner state (PostgreSQL, household-scoped):** `LearnerPlacement`,
  `LearnerUnitState`, `LearnerLessonState`, `UnlockGrant`, `SkipRecord`,
  `OverrideRecord`, `ReviewSchedule`, and a `LearningEvent` log that makes
  teaching views and assistance visible to the delayed-check window.
- **Assessment evidence:** immutable `AssessmentAssignment` (what was asked,
  with server-selected `contentId@version@hash` items and pinned bank, policy,
  and algorithm versions), mutable `AssessmentRunState`, and immutable
  `AssessmentResult` — alongside the existing `Attempt` / `AssistanceEvent` /
  `MasteryContribution` / `MasteryEstimate` rows.

A unit is curriculum; a learner's position in a unit is learner state; the bar
for advancing is policy. They are never merged. Every reference between them is
`{code, version}` — including `Skill`, which has no `version` today. All of
this is **proposed and pending review**; no migration exists, and every
parameter is open in `docs/course-progression-decisions.md`.

## Attempt evidence

Preserve immutable raw facts:

- problem/content version;
- learner response and normalized response;
- correctness and scoring method;
- attempt number and elapsed time;
- assistance events and highest level;
- misconception tags with confidence;
- evaluator/model/prompt/policy versions;
- whether conditions were diagnostic, practice, or mastery check.

Derived mastery can be recalculated when the algorithm changes.

## Mastery calculation

Start transparent and conservative:

1. Convert correctness into evidence strength.
2. Multiply by assistance weight and assessment-context weight.
3. Apply recency and difficulty modifiers within bounded ranges.
4. Aggregate several observations using a documented rule.
5. require delayed independent evidence for `Secure`.
6. Reduce confidence—not necessarily mastery—when evidence becomes stale.

Store estimate, confidence interval/band, algorithm version, and contributing attempt IDs.

Steps 3, 4, and 6 are not implemented. `src/phase1/service.ts` overwrites
`MasteryEstimate.estimate` with the most recent attempt's weight;
`MasteryContribution` rows accumulate but are never aggregated. Two related
defects: `Attempt.highestAssistance` is hardcoded to `INDEPENDENT` at creation
and never updated, yet is exported to parents as fact
(`src/server/household-data.ts`); and `getParentEvidence` compensates by
reading the **most recent** assistance event rather than the **highest**. The
replacement contract — an explicit aggregation formula, the derivation of
maximum assistance, deduplication and supersession rules, and which confidence
bands are reachable — is specified in
`docs/course-progression-architecture.md` §8, with every parameter open in
`docs/course-progression-decisions.md`.

## Misconceptions

Misconceptions are hypotheses, not labels. Record:

- taxonomy code;
- supporting attempts;
- confidence;
- first/last observed dates;
- intervention tried;
- evidence of resolution.

## Planner inputs and constraints

Inputs: current school topic, mastery/review state, prerequisites, parent goals, time budget, recent cognitive load, and content availability.

Constraints:

- prioritize due reviews and blocking prerequisites;
- do not overload one weak skill;
- include periodic strengths/challenges;
- cap planned time;
- explain why each activity was chosen;
- allow parent/learner override.

The planner is **advice, not authorization**. `planNextActivities` is the only
place prerequisite and contest-readiness gating is evaluated today, and
`startSession` never calls it, so a client-supplied `contentId` currently
starts a session on any reviewed item in the program. Server-side,
fail-closed authorization for every mutation endpoint is specified in
`docs/course-progression-architecture.md` §7 and is not yet implemented.
"Allow parent/learner override" must not be read as permission for the client
to bypass a server gate; an override is an audited, re-authenticated adult
decision that records no mastery evidence (`docs/course-progression-architecture.md`
§9.3).

## Data retention

Define separate retention schedules for account data, learning evidence, free-form tutor text, model traces, and deleted accounts. Default model traces to metadata plus redacted excerpts; avoid permanent retention of raw conversations unless demonstrably necessary.
