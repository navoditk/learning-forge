# ADR-0010: Implement real authentication with NextAuth v5 Credentials + JWT sessions

- Status: Accepted
- Date: 2026-09-06
- Decision owner: Product/engineering owner (Navodit Kaushik)
- Related: ADR-0008 (identity/consent policy decisions this implements); ADR-0003
  (synthetic identity, partially superseded — see below)

## Context

ADR-0008 decided the *policy*: a single-household pilot, simple email/password
sign-in for the parent account, no separate learner login. This ADR records
the *engineering* choices made to implement that policy, obtained directly
from the product owner via clarifying questions rather than assumed: NextAuth
v5 (Auth.js) as the library, a Credentials provider with JWT sessions (no
database adapter), and a one-time provisioning script instead of a public
signup page.

## Decision

1. **Library**: `next-auth@5.0.0-beta.x` (Auth.js). Session/cookie handling,
   CSRF protection, and secure defaults are handled by a widely-audited
   library rather than hand-rolled code, appropriate for a child-facing
   product where authentication mistakes are costly.
2. **Provider and session strategy**: A single `Credentials` provider
   (`src/auth/index.ts`) with `session: { strategy: 'jwt' }`. No
   `@auth/prisma-adapter` and no NextAuth-managed `Account`/`Session`/
   `VerificationToken` tables. The `authorize()` callback looks up the
   application's own `User` table directly (`email`, `passwordHash` columns
   added by migration `0003_add_user_credentials`) and returns the
   household id, which is embedded in the JWT and exposed on `session.user.householdId`
   via callbacks. This keeps the schema change to exactly two nullable
   columns plus a unique index, rather than importing NextAuth's own data
   model alongside the existing Household/User/LearnerProfile schema.
3. **Password hashing**: `bcryptjs` (pure JS, no native compilation step),
   cost factor 12, isolated behind `src/auth/verify-credentials.ts` so the
   credential-verification logic is directly unit/integration-testable
   without going through NextAuth's own request plumbing.
4. **Route protection**: `src/middleware.ts` (must live under `src/`, not the
   project root, because this project uses a `src/` directory — Next.js
   silently ignores a root-level `middleware.ts` in that layout, which was
   caught during manual verification, not a test). It matches `/`, `/parent`,
   and `/api/phase1/:path*`; unauthenticated page requests redirect to
   `/login?callbackUrl=...`, unauthenticated API requests get a 401 JSON
   body.
5. **Account creation**: `scripts/create-parent-account.ts` (run via
   `npm run create-parent-account -- --email=... --password=...`), not a
   signup page — there is exactly one account to ever create for this
   product (ADR-0008), so a public registration UI/flow would be unused
   surface area. The script refuses to run if a *real* parent account
   (a `User` row with `role: PARENT` and a non-null `email`) already exists,
   unless `--force` is passed — deliberately checking for a real account
   specifically, not just any household row, since the synthetic fixture
   (ADR-0003) also creates a household in every dev/test database.

## Explicit non-decisions

- This does not wire the authenticated household into `src/phase1/service.ts`.
  Every Phase 1 function still resolves data against the synthetic fixture's
  fixed `SYNTHETIC_IDS`, not `session.user.householdId`. A logged-in parent
  today sees the synthetic household's data, not their own real household's
  data. This is tracked as the immediate next step, not deferred indefinitely.
- This does not configure `AUTH_URL`/`AUTH_TRUST_HOST` for a real deployment.
  Manual testing with `next start` (production mode) surfaced a real
  `UntrustedHost` error from NextAuth's host-header validation that does not
  appear under `next dev`; this must be resolved when the Render deployment
  (ADR-0005) actually happens, using the real public domain.
- This does not address the Edge Runtime build warnings from bundling
  `bcryptjs`/`jose` into `src/middleware.ts`. Verified these do not break
  `next start` (Render runs a real Node.js process, not a literal edge
  isolate, per ADR-0005), so this is not a functional blocker for the chosen
  hosting platform, but revisit if hosting ever changes to a true edge
  runtime.
- This does not implement password reset, email verification, or
  multi-factor authentication. Out of scope for a single, product-owner-held
  account.

## Alternatives considered

- Hand-rolled session cookie: rejected per ADR-0008's own reasoning — more
  custom security-sensitive code to get right, for no benefit at this scale.
- `@auth/prisma-adapter` with NextAuth's own database tables: rejected as
  unnecessary schema surface for a Credentials-only, single-account product;
  JWT sessions need no server-side session store.
- A public signup page: rejected per ADR-0008 — there will only ever be one
  account for the foreseeable future.

## Consequences and reversal signals

Positive: real login now gates every learner/parent page and API route,
verified end-to-end (correct/incorrect credentials, unauthenticated redirects,
callback-URL round-trip) both via direct HTTP requests and Playwright,
including a negative control (temporarily disabling the middleware to confirm
the new e2e tests actually fail without it). Risk: the app's data layer is not
yet wired to real identity — this ADR is only "access is real," not "the
product uses real identity end-to-end." Revisit the JWT-only/no-adapter
choice if a second household is ever approved (ADR-0008's reversal signal),
since NextAuth's database-session model or a different multi-tenant
authorization design might be warranted at that point.

**Update 2026-09-06**: the data-layer wiring flagged above as a non-decision
is now done. `src/phase1/service.ts` and every `/api/phase1/*` route resolve
`requireHouseholdContext()` (`src/server/household-context.ts`) from the real
session instead of the synthetic fixture; the fixture (`SYNTHETIC_IDENTITY`,
ADR-0003) is used only by tests now. Verified with two genuinely different
provisioned households via raw HTTP (not just the Vitest cross-household
test): each saw only its own session/attempt/parent-evidence data. Fixed one
real bug found in the process: `MasteryContribution.attempt` uses
`onDelete: Restrict` (evidence-integrity protection), so household cleanup in
tests/Playwright must delete `MasteryContribution`/`MasteryEstimate` rows
before the household — extracted into `src/server/delete-household-evidence.ts`
after the Playwright e2e teardown hit exactly this foreign-key violation.
