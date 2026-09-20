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

At the verified rollout checkpoint before this evidence-document-only update:

- `npm run verify` passed: formatting, lint, typecheck, migration down checks,
  159 unit/contract/progression tests, and production build.
- `npm run test:integration` passed: 39 persistence, Phase 1, and auth tests
  against the disposable local PostgreSQL database.
- `npm run test:e2e` passed: 22 Playwright tests covering authentication,
  learner/parent journeys, keyboard operation, automated WCAG checks, and
  fail-closed progression API behavior.
- With the draft package mounted outside Git and the gate enabled only in the
  local test server, the focused API suite passed the real assignment path:
  HTTP 201 with three selected, hashed held-out items. The default fail-closed
  assertion is skipped only in this explicitly mounted mode.
- `DATABASE_URL=postgresql://... npm run test:migrations` passed the complete
  forward/down/forward schema-equivalence check across all 10 migrations.
- The test commands now provide a local PostgreSQL fallback while honoring an
  explicitly supplied `DATABASE_URL`; production configuration is unchanged.

## Deployed evidence

- Render service `learning-forge` deployed the verified application revision.
- `/review/course-progression` returned HTTP 200.
- The assessment-assignment endpoint returned `404` with
  `reasonCode: RELEASE_GATE_CLOSED` while C4 remained unauthorized.
- The deployed read-only shadow-review job succeeded.
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

## Not proven by automation

- Independent fourth-draft/C1–C3 review.
- Mathematical/content, originality, accessibility, or child-safety approval
  of the draft private assessment package.
- Representative non-enforcing shadow traffic and divergence dispositions.
- Authorization to execute the C4 cutover.

No learner identifiers, prompts, answers, or private package content belong in
this artifact.
