# Tutor policy

What actually governs what the tutor can say, and why the model never holds
authority it shouldn't. This records existing engineering (`src/tutor/`,
`src/contracts/tutor.ts`), not a new design.

## The model never decides the move - it narrates one

Every tutor turn starts with `authorizeTutorMove` (`src/tutor/policy.ts`), a
deterministic function of server-known state: the learner's progress
through a fixed state machine (`awaiting_attempt` → `clarify_problem` →
`probe_reasoning` → `hint_1_strategy` → ... → `guided_solution` →
`explain_and_reflect`), whether the current response is a genuine attempt,
how many hints have already been given, and the attempt count. It returns a
`TutorAuthorization`: exactly one allowed move type, a maximum assistance
level, and whether revealing the full solution is permitted right now.

The model only ever sees that authorization and is asked to produce text
for the one move type it's allowed - it cannot request a different move,
grant itself more assistance, or decide the learner has reached mastery.
There is no code path where model output changes `TutorState` on its own;
`transitionTutorState` only advances if the model's own declared
`moveType` matches what the policy already expected
(`src/tutor/policy.ts`).

## Versioned policy

Two named profiles exist today - `MATH_TUTOR_POLICY`
(`policyVersion: 'math-tutor-policy-1'`) and `CONTEST_COACH_POLICY`
(`'contest-coach-policy-1'`), differing only in how many genuine attempts a
contest problem requires before a full solution is authorized. The active
`policyVersion` is recorded on every `TutorTrace` row
(`src/contracts/trace.ts`), so a policy change is attributable in the
historical record, not silently retroactive.

## Structured validation, not trust

`validateTutorMove` (`src/contracts/tutor.ts`) is the gate between model
output and the learner, run on every response before it can be shown:

1. Schema validation (`TutorMoveOutputSchema.safeParse`) - malformed output
   never reaches the learner.
2. Move-type and assistance-level ceiling checks against the server's own
   authorization - the model cannot escalate itself.
3. `guided_solution` specifically requires `canRevealAnswer`, decided only
   by the deterministic policy (attempt count, hint count, contest
   minimums), never by the model's own judgment that the learner is ready.
4. `safetyFlags.includes('needs_human_review')` forces a fallback - see
   below.
5. Answer-leakage detection (`containsProtectedAnswer`,
   `src/contracts/answer-leakage.ts`) scans the combined response text
   against the item's protected tokens, including simple equivalent forms
   (a fraction compared numerically, a ratio cross-multiplied) - not just
   exact string matches.

Any failure returns `requires_fallback`, never a partially-trusted
response.

## Fallback, not failure

`TutorHarness.respond` (`src/tutor/harness.ts`) retries once on an invalid
or flagged response, then falls back to one of two fixed, server-authored
messages (never model-generated) if the retry also fails. A provider error
(network, rate limit, billing) is handled identically to an invalid
response - the learner never sees a stack trace or an error state, only
the same calm fallback. Every outcome - `validated`, `repaired`, or
`fallback` - and its cause (`move_returned`, `fallback_returned`, `error`)
is recorded on the trace.

## No LLM mastery authority

`TutorResponse.masteryAdvanced` is hardcoded `false` on every return path
in `TutorHarness.respond` - there is no code path, including a successful
`validated` response, where the tutor harness itself can advance mastery.
Mastery is computed elsewhere, from deterministic attempt scoring and
independent checks (`src/phase1/service.ts`, `src/progression/`), never
from the tutor's own assessment of the conversation. This is also tested
directly: every case in `tests/tutor/tutor.test.ts` asserts
`masteryAdvanced === false`, including the success paths.

## Safety-flag handling

The real model adapter (`src/tutor/anthropic-model.ts`) is explicitly
prompted to set `safetyFlags: ["needs_human_review"]` if a learner message
"suggests distress, self-harm, or anything unrelated to and inappropriate
for a math tutoring session." `validateTutorMove` treats that flag as an
automatic fallback - a flagged response is never shown to the learner,
regardless of whether the move itself would otherwise have been valid.
This is tested directly (`tests/tutor/tutor.test.ts`, "safety-flag
handling": a flagged response never reaches `response.move`, and a flagged
response followed by a clean retry still recovers normally).

**Human notification (closed 2026-10-10):** `recordTutorResponse` now
calls `NotifierPort.sendSafetyAlert` whenever a response is safety-flagged,
sending only trace metadata (never learner text) to the escalation
destination named in `docs/incident-response.md`'s "Child-safety
escalation" section. The default `console` provider only logs; a real
email requires setting `NOTIFIER_PROVIDER=resend` with Resend credentials,
which has not yet been done for the real deployment — see that section for
what remains.

## Current status

The policy/validation/fallback/no-mastery-authority engineering described
here is in place and tested; this document closes the "Tutor policy" row
of the pilot-readiness checklist for everything except the human-escalation
gap, which belongs to "Child safety" instead and remains genuinely open.
