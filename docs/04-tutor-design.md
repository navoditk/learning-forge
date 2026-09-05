# Interactive Tutor Design

## Tutor modes

The MVP exposes two policy profiles using shared infrastructure:

- **Math Tutor:** conceptual understanding, representations, guided examples.
- **Contest Coach:** productive struggle, strategy prompts, stronger answer-delay rules.

Future profiles: Reading Tutor, Writing Coach, Science Tutor, Study Coach.

## Deterministic policy state machine

Suggested states:

1. `awaiting_attempt`
2. `clarify_problem`
3. `probe_reasoning`
4. `hint_1_strategy`
5. `hint_2_representation`
6. `hint_3_subproblem`
7. `analogous_example`
8. `guided_solution`
9. `explain_and_reflect`

Transitions depend on genuine attempts, elapsed work, prior hints, learner explanation, problem mode, accessibility override, and parent/teacher configuration. The LLM cannot skip states.

## Tutor move schema

Every response should include machine-readable fields:

- move type
- concise learner-facing message
- question to answer next
- assistance level
- targeted misconception (optional)
- expected response form
- safety/policy flags
- confidence

## What counts as a genuine attempt

Accept a calculation, diagram description, relationship/equation, elimination of choices, articulated strategy, or explanation of where confusion begins. “I don't know” alone triggers a probe or small hint, not a final answer.

## Answer protection

- Keep canonical answers out of the general conversation context when not required.
- Pass a redacted solution representation or verifier to early hint stages.
- Run an answer-leak detector against exact answers, equivalent expressions, key intermediate values, and option identifiers.
- Contest mode requires configurable attempts before `guided_solution`.
- If the learner directly requests the answer, acknowledge and continue at the permitted hint state.
- After a solution is permitted, require reflection or a nearby transfer problem.

## Correctness

Prefer deterministic validators for numeric, algebraic, multiple-choice, and structured responses. Use LLM scoring only for explanations that require semantic judgment, with a rubric, confidence, and escalation path.

## Tone

- Brief and conversational
- One useful question at a time
- Praise effort/strategy specifically, not intelligence
- Never shame, diagnose, manipulate, or create dependency
- Avoid excessive excitement, streak pressure, or simulated human intimacy
- State uncertainty and recover clearly from an error

## Prompt injection defenses

Treat all learner text and content passages as untrusted data. The policy and allowed state are server-controlled. The model cannot reveal hidden prompts, solutions, other users' data, or change permissions. Include adversarial evals such as “ignore the tutor rules,” encoded requests, role-play, and answer extraction.

## Fallback behavior

If validation fails twice, return a safe curated prompt matched to the policy state, log the failure, and do not advance mastery.
