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

## Data retention

Define separate retention schedules for account data, learning evidence, free-form tutor text, model traces, and deleted accounts. Default model traces to metadata plus redacted excerpts; avoid permanent retention of raw conversations unless demonstrably necessary.
