# ADR-0009: Real tutor model provider selection and enablement gate (Anthropic Claude)

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product owner (Navodit Kaushik)
- Related: `docs/09-decisions-and-open-questions.md` decision register items 2, 6, 8;
  ADR-0002 (fake-tutor validation boundary); `docs/06-evaluation-safety-privacy.md`

## Context

The tutor orchestration boundary (ADR-0002) is provider-agnostic by design: a
`TutorModel` port with a `FakeTutorModel` adapter used throughout Phase 0/1.
Decision register items 2 (model provider and child-data terms), 6 (eval
baseline and severity), and 8 (budget and latency) have been pending since
Phase 0. This ADR records the product owner's decisions to unblock building a
real adapter.

## Decision

1. **Provider.** The first real tutor adapter targets the **Anthropic Claude
   API**, implemented behind the existing `TutorModel` port so the fake
   adapter remains available for tests/CI. No other provider is selected at
   this time.
2. **Budget and latency.** Target a low monthly budget — order of magnitude
   well under $20/month — appropriate to a single child's practice sessions.
   Latency is not a hard constraint; a few seconds per tutor response is
   acceptable. Default to a smaller/cheaper Claude model; only move to a
   larger model if response quality proves inadequate in the eval pass below.
3. **Enablement gate (eval).** Before the real adapter is used in any actual
   session with the learner, extend the existing synthetic eval corpus
   (`docs/06-evaluation-safety-privacy.md`) with real-provider-generated
   responses and have the product owner personally review a modest set
   (approximately 20–30 cases) covering answer leakage, tone/age-appropriateness,
   mathematical correctness, and unsafe-content handling. This is a lightweight
   but real human review — not a numerically-thresholded gate (consistent with
   the existing "do not invent reassuring percentages" release-gate principle)
   and not the larger adjudicated eval corpus a multi-family pilot would
   require.

## Explicit non-decisions

- This does not implement the Anthropic adapter, select a specific model
  version/pinning strategy, or implement API-key/secrets handling. Those
  remain follow-up engineering work.
- This does not approve sending any real learner data to Anthropic before the
  eval pass in item 3 is complete and reviewed.
- This does not set contractual data-processing terms (retention, training-use
  opt-out, subprocessor review) with Anthropic. `docs/privacy-inventory.md`'s
  "Provider terms" row remains to be filled in as part of adapter
  implementation, using Anthropic's published API data-handling terms as the
  baseline to record.
- This does not change the deterministic tutor policy boundary (ADR-0002): the
  model still only phrases moves within server-authorized state; it has no
  authority over mastery, answer-reveal, or policy transitions.
- This does not design or implement streaming/incremental delivery of tutor
  moves; `docs/09-decisions-and-open-questions.md` already flags this as worth
  evaluating alongside provider selection, and it remains open.

## Alternatives considered

- OpenAI API: considered and rejected in favor of Anthropic Claude. No
  specific technical blocker was found; this was primarily a preference call
  by the product owner.
- Continuing to defer provider selection indefinitely: rejected, since the
  product owner wants to move toward a real (if small-scale) pilot.

## Consequences and reversal signals

Positive: unblocks building a real adapter behind the existing port, with a
concrete, achievable enablement gate that doesn't require a disproportionate
eval build-out for a single-household pilot. Risk: the lightweight eval pass
is explicitly not the rigor a broader pilot would need — revisit before
expanding beyond one household (ADR-0008) or before increasing session volume
or model capability. Revisit provider choice if Anthropic's terms prove
unworkable for child data, or if cost/latency/quality don't meet the targets
in item 2 once actually measured.
