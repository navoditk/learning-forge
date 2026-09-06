# ADR-0011: Anthropic tutor adapter implementation

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product/engineering owner (Navodit Kaushik)
- Related: ADR-0009 (provider selection and enablement gate); ADR-0002
  (fake-tutor validation boundary)

## Context

ADR-0009 selected Anthropic Claude as the first real tutor provider and
required a lightweight, human-reviewed enablement gate before any real
learner session uses it. This ADR records the engineering implementation:
the real adapter itself, two architecture gaps found and fixed while
building it, and the evidence produced for the enablement-gate review.

## Decision

1. **Adapter**: `AnthropicTutorModel` (`src/tutor/anthropic-model.ts`)
   implements the existing `TutorModel` port using the Anthropic Messages
   API with forced tool-use (`tool_choice: {type: 'tool', ...}`), so the
   response is always structured JSON rather than free text the harness has
   to parse hopefully. Model: `claude-haiku-4-5-20251001` (ADR-0009's
   "smaller/cheaper by default" target).
2. **The model never chooses policy, only phrasing**: `moveType` and
   `assistanceLevel` are set directly from `input.authorization` (already
   fixed deterministically before the adapter is called, per ADR-0002) —
   the model is only asked to write `learnerMessage`/`question` for that
   exact move, and to set `safetyFlags` if the learner's message itself
   seems concerning. The model is never given the canonical answer or any
   protected token; leakage prevention is that it structurally cannot know
   the answer, not that it is told to withhold something it knows.
3. **Two real architecture gaps found while building this, fixed**:
   - `TutorModel.generateMove`/`scoreConstructedResponse` returned
     `Promise<unknown>` with no way to report which model actually ran, or
     its latency/token usage. `TutorHarness` hardcoded `modelIdentifier:
     'fake-tutor'` and zeroed latency/tokens in every trace, regardless of
     adapter. Fixed: the port now returns `{candidate, metadata}`
     (`TutorModelResult`), and the harness/eval runner source the trace and
     `EvalReport.adapter` from the real adapter's own metadata. Every trace
     for a real Claude interaction would otherwise have been silently
     mislabeled `fake-tutor` with zero cost/latency data — a real
     observability defect masked entirely by fake-tutor's own zero-cost,
     zero-latency profile happening to match the hardcoded values.
   - `TutorHarness.respond()` had no error handling around the model call at
     all. Found empirically: the first live call against this adapter threw
     a real `BadRequestError` (insufficient account credit) that would have
     crashed the entire hint request instead of degrading gracefully.
     Fixed: a thrown error is now treated exactly like an invalid model
     response — retried once, then falls back to the scripted safe message,
     with `outcome: 'error'` recorded distinctly from `'fallback_returned'`
     in the trace.
4. **Enablement-gate evidence**: `scripts/run-real-eval.ts` runs the
   existing 9-case synthetic eval corpus (`evals/cases/baseline.json`, one
   case per required dimension) through the real adapter and writes a
   human-readable Markdown report with the actual generated text for every
   case, not just pass/fail. All 9 automated checks passed (no leakage, no
   forbidden move types, no unexpected fallback, complete trace metadata).
   The product owner still must personally read the actual text — automated
   checks catch only what they were written to catch, not tone or
   age-appropriateness.

## Explicit non-decisions

- This does not enable the real adapter for any actual learner session.
  `/api/phase1/hint` still uses `FakeTutorModel`. Flipping that is a
  separate, deliberately small follow-up change, gated on the product
  owner's review of the report in item 4 above.
- This does not expand the eval corpus beyond the existing 9 cases (one per
  dimension). ADR-0009 mentioned "approximately 20-30 cases" as the target
  for a more thorough pass; whether to author more before or after the
  first real-session enablement is the product owner's call, not decided
  here.
- This does not implement `scoreConstructedResponse` usage anywhere — the
  port method is implemented (for interface completeness and because it was
  easy to build correctly alongside `generateMove`), but nothing in the
  current Phase 1 flow calls it, matching `FakeTutorModel`'s existing
  behavior.
- This does not select or implement rate limiting, per-session cost caps, or
  monitoring/alerting for real API spend. ADR-0009 set a target budget, not
  operational enforcement of it.

## Alternatives considered

- Free-text prompting with a text parser instead of forced tool-use: rejected
  — tool-use makes malformed output structurally rare rather than something
  a regex/parser has to hope to catch, and the harness's existing
  validate-repair-fallback loop already handles the residual case cleanly.
- Letting the model choose the move type within a permitted set: rejected —
  `authorizeTutorMove` already resolves to exactly one required move type
  per ADR-0002's design; giving the model a choice it doesn't structurally
  need would only add a way for it to drift from server policy.

## Consequences and reversal signals

Positive: a real adapter exists, is empirically verified (live API calls,
not just schema validation) to produce policy-compliant, leak-free,
age-appropriate output including resisting a real prompt-injection attempt
in manual testing, and degrades safely on provider failure. The
metadata/error-handling fixes benefit `FakeTutorModel` too (now honestly
reports its own identity rather than the harness assuming it). Risk: only 9
eval cases have been reviewed; a broader pass may surface issues these
don't. Revisit model choice if `claude-haiku-4-5` proves inadequate on
quality once the product owner reviews real output, or if cost/latency
measured in real use don't meet ADR-0009's targets.

**Update 2026-09-06**: the product owner reviewed the 9-case report (published
as a browser-viewable artifact for readability) and approved enabling the
real adapter ("looks good"). This satisfies ADR-0009's enablement gate for
the initial 9-case scope. Enabled via `src/tutor/create-model.ts`
(`createTutorModel()`), gated on `TUTOR_MODEL_PROVIDER=anthropic` — an
explicit opt-in separate from `ANTHROPIC_API_KEY`'s mere presence, so a
developer's key for `scripts/run-real-eval.ts` can't accidentally route real
learner traffic. `playwright.config.ts` force-sets `TUTOR_MODEL_PROVIDER=fake`
for the e2e webServer regardless of the ambient environment, so tests/CI can
never make a real, billed call. `/api/phase1/hint`
(`src/app/api/phase1/hint/route.ts`) now calls `createTutorModel()` instead
of constructing `FakeTutorModel` directly.

Verified live end-to-end through the real authenticated HTTP path (not just
the adapter in isolation): a real request through `/api/phase1/session` →
`/api/phase1/attempt` → `/api/phase1/hint` for a genuine provisioned
household returned a real Claude response (`modelIdentifier:
"claude-haiku-4-5-20251001"`, ~1.5s latency, real token counts in the trace).

Found one more real bug while wiring this in: disabling the learner-page hint
button during the request (added so a real ~1-2s latency doesn't look like a
frozen, unresponsive page) caused the browser to blur it, silently dropping
keyboard focus to the document body once the response arrived — exactly the
property the keyboard-operability e2e suite (PR #29) was built to catch, and
it did. Fixed by refocusing the button once the pending state clears.
