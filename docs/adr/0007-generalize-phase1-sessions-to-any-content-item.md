# ADR-0007: Generalize Phase 1 sessions to any content item

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product/engineering owner

## Context

Phase 1 (`docs/PROGRESS.md`, ADR-0003) hardcoded every session to one content
item (`unit-rates-1`) via a module-level `phase1Content` constant. Once the
planner (ADR-0006) started recommending other ratios skills, its
recommendations were purely informational: selecting one did nothing, because
`getSyntheticSession`, `createAttempt`, and the tutor hint route all ignored
whatever content a session or attempt was actually for and used the one fixed
constant instead.

Generalizing this surfaced a real answer-protection defect, not just a UX
gap: `src/app/api/phase1/hint/route.ts` built the tutor's prompt and
`protectedTokens` (canonical answer, forbidden leakage patterns) from the
fixed `phase1Content` constant regardless of which content the learner's
attempt was actually for. Had sessions already supported multiple content
items without this fix, a hint requested during a session on any item other
than `unit-rates-1` would have been built around the wrong problem's prompt
and the wrong answer's leakage protection — the tutor's answer-protection
would silently apply to content the learner wasn't even looking at.

## Decision

Add `Session.contentKey` (migration `0002_add_session_content_key`, with a
reviewed `down.sql`) so a session is durably tied to one content item chosen
at creation time, mirroring how `Attempt.contentKey` already worked.
`getSyntheticSession` accepts an optional `contentId`, resolves it against
`ratioContentCatalog`, and rejects an unknown id (400) rather than silently
falling back to a default. `createAttempt` and `getTutorContext` resolve the
session's/attempt's own `contentKey` instead of referencing the fixed
constant, and the hint route now builds its prompt and `protectedTokens` from
`getTutorContext`'s resolved content — fixing the answer-protection defect
above as a side effect of the generalization, not a separate patch.

`getParentEvidence` now returns mastery across every skill the learner has
evidence for (`mastery: MasteryRow[]`) instead of one hardcoded skill, since
a household can now have evidence for more than one skill. The learner page's
"Recommended next activities" section is now clickable: selecting a
recommended item starts a real session for it via `contentId`.

## Explicit non-decisions

- This does not add a scheduler, real authentication, or any new provider
  integration. It stays inside the same synthetic-identity boundary as the
  rest of Phase 1.
- This does not implement diagnostic/placement logic for which content a
  learner should start on; the default (no `contentId` given) remains
  `unit-rates-1`, matching prior behavior exactly.
- This does not backfill or migrate any real data — the local/CI databases
  hold only synthetic rows, and the migration's `DEFAULT 'unit-rates-1'`
  backfill step exists for migration-hygiene correctness, not because real
  rows required it.

## Alternatives considered

- Passing `contentId` on every subsequent request (attempt/hint/check) instead
  of storing it on the `Session` row: rejected — it would require the client
  to keep resending content identity on every call with no server-side
  enforcement that a given attempt's hint request stays bound to the content
  it was actually created against, which cuts against the project's
  server-authoritative-state principle (`AGENTS.md`).

## Consequences and reversal signals

Any future content type beyond ratios (Geometry, Depth, Contest, ELA) can
reuse this same `contentKey` mechanism without another migration, as long as
it's addressable through `ratioContentCatalog` or a successor catalog with a
compatible `id` scheme. Revisit if content ever needs multiple simultaneous
items per session (e.g., a multi-problem set) rather than one item per
session.
