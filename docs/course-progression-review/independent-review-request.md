# Independent review request

**Purpose:** Give an independent reviewer a complete, bounded packet for the
fourth-draft architecture and C1–C3 review. This is a request for review, not
a review result or authorization.

## Review target

- Repository: `navoditk/learning-forge`
- Commit: current pushed checkpoint containing the bounded shadow persistence,
  shared assistance derivation, policy-pin, feedback-safety, layer-separation,
  and active/historical resolver remediation changes
- Browser review surface: `https://learning-forge.onrender.com/review/course-progression`
- Production progression gate: closed
- Private package: supplied separately through the approved secure channel
- Current private draft digest:
  `3081c4108e464d24306722df0abb72f25ee4edc3e2666c961ddbc766ee81a9d7`

## Evidence available

- `npm run verify`: passed, 218 tests plus production build.
- `npm run test:integration`: 45 tests passed against disposable local
  PostgreSQL.
- `npm run test:e2e`: 23 passed, 1 intentional private-package skip.
- Latest remediation scope: all Phase 1 shadow writes are bounded and
  non-enforcing; resumed sessions and idempotent assignment replays emit
  diagnostic observations; API leakage coverage scans known answer and
  solution sentinels; U2 and U28 are exercised through production catalog
  validation; all Phase 1 success routes are covered by the API journey.
- `npm run test:migrations`: 11-migration forward/down/forward round trip
  passed.
- Production review page: HTTP 200.
- Production assessment assignment: HTTP 404,
  `reasonCode=RELEASE_GATE_CLOSED`.
- Staging-only synthetic shadow pilot: 5 decisions, 1 unresolved
  `DENY → ALLOW` divergence for `unit-rates-1` with reason
  `LOCKED_PREREQUISITE`.

## Reviewer actions

1. Review the handoff, fourth-draft architecture, decision matrix, ADR-0013,
   and `AGENTS.md` at the target commit.
2. Check U1–U6 and U28–U31 against implementation and falsifying tests.
3. Review C1–C3 persistence, export/deletion coverage, dual-write behavior,
   privacy redaction, and the staging divergence.
4. Record every finding as `blocker`, `major`, `minor`, or `none` in
   `independent-review.md`; do not leave any row blank.
5. Sign the recommendation. A recommendation to approve review readiness is
   not authorization to execute C4.

## Separate manual decisions still required

- Content/math/originality review of the private package.
- Accessibility and child-safety review of the private package.
- Product/engineering disposition of the shadow divergence.
- Completion and signature of `manual-gate-record.md`.

No assessment prompts, answers, learner identifiers, or private package
contents belong in this repository or the public browser review surface.
