# Automated rollout evidence

**Scope:** Grade 6 Math pilot, held-out assessment boundary, progression
state-machine/endpoints, UI, and release-gate behavior.

**Evidence status:** Automated evidence complete; this document is not an
independent review or C4 authorization.

## 2026-09-20 dependency evidence

- Added a narrow `deepmerge-ts@8.0.0` npm override for the Prisma config
  dependency chain; the Prisma downgrade proposed by `npm audit fix --force`
  was not adopted.
- `npm audit --omit=dev` now reports zero vulnerabilities.

## Repository evidence

At the current verified rollout checkpoint (the commit containing this
evidence refresh):

- `npm run verify` passed: formatting, lint, typecheck, migration down checks,
  204 database-free unit/contract/progression tests, and production build.
- `npm run test:integration` passed: 43 persistence, Phase 1, auth, and
  progression-boundary tests
  against the disposable local PostgreSQL database.
- `npm run test:e2e` passed: 22 Playwright tests covering authentication,
  learner/parent journeys, keyboard operation, automated WCAG checks, and
  fail-closed progression API behavior.
- Before the package review gate was enforced, a focused local smoke test
  exercised the real assignment path with the draft package and returned HTTP
  201 with three selected, hashed held-out items. That is historical plumbing
  evidence only; the current loader rejects the same draft because its items
  remain `pending_review`.
- The current package gate has unit coverage proving pending-review packages
  fail closed. A reviewed package must be mounted separately for a fresh HTTP
  201 smoke test.
- `DATABASE_URL=postgresql://... npm run test:migrations` passed the complete
  forward/down/forward schema-equivalence check across all 11 migrations.
- The test commands now provide a local PostgreSQL fallback while honoring an
  explicitly supplied `DATABASE_URL`; production configuration is unchanged.
- After the package-boundary changes, integration remained green at 41 tests.
  The latest Playwright run passed 22 tests with one intentional skip. The
  progression test glob is now unquoted so all progression unit suites are
  actually executed rather than silently skipped. The new feedback-safety
  integration test also verifies that in-progress assessments do not return
  correctness and scored assessments do not return answer-bearing fields.
- Shadow persistence is bounded by a 250 ms diagnostic timeout, with unit and
  assignment-path coverage for a never-resolving writer; the learner operation
  remains non-enforcing.
- Parent evidence, exports, and assessment-result projections derive maximum
  assistance from immutable assistance events, and existing learner-unit
  updates persist policy profile code and version together.
- The route-boundary feedback test exercises the actual assessment submission
  handler with the release flag enabled only in a disposable integration test;
  both in-progress and scored JSON responses remain answer-safe.

## Deployed evidence

- Render service `learning-forge` deployed the verified application revision.
- `/review/course-progression` returned HTTP 200.
- The assessment-assignment endpoint returned `404` with
  `reasonCode: RELEASE_GATE_CLOSED` while C4 remained unauthorized.
- The deployed read-only readiness job (`job-dao77l3m8hqs73di1vig`) succeeded;
  the current deployment (`dep-dao8eo4s728c73beppe0`) is live.
- Direct redacted database evidence showed 11 unbound open sessions, 0 shadow
  decisions, and 0 divergent shadow decisions.
- Dependency audit after the PostCSS and `deepmerge-ts` overrides reports zero
  vulnerabilities.

## Non-production staging evidence

- The staging-only synthetic shadow pilot ran against a disposable local
  database with five requests and five closed sessions.
- It produced five shadow decisions and one unresolved `DENY → ALLOW`
  divergence (`LOCKED_PREREQUISITE`) for the `unit-rates-1` practice target.
- This is evidence for independent review only; it is not representative
  production traffic and does not authorize C4.

## Private draft-package QA

- Redacted QA covered 4 banks and 45 items: all item IDs and prompts were
  unique; all 45 item hashes, accessibility pairs, provenance records, and
  validator canonical-answer memberships were present.
- No automated structural or forbidden-pattern findings were produced.
- Current package digest is recorded only in the private handoff/progress
  trace; the package remains `pending_review` and is rejected by the serving
  loader. Automated QA is not content approval.

## Not proven by automation

- Independent fourth-draft/C1–C3 review.
- Mathematical/content, originality, accessibility, or child-safety approval
  of the draft private assessment package.
- Representative non-enforcing shadow traffic and divergence dispositions.
- Authorization to execute the C4 cutover.

No learner identifiers, prompts, answers, or private package content belong in
this artifact.
