# Secrets management

This is the current state of secret handling for the single-household Render
pilot, and the rotation/least-privilege procedure. It records what already
exists rather than proposing new infrastructure.

## Where secrets live

| Secret | Local development | Production (Render) |
|---|---|---|
| `AUTH_SECRET` (NextAuth session signing) | `.env`, generated with `openssl rand -base64 32`, never committed | Render dashboard env var, `sync: false` in `render.yaml` - set manually, encrypted at rest by Render, never written to this repository or any deploy file |
| `ANTHROPIC_API_KEY` | `.env`, only needed for `TUTOR_MODEL_PROVIDER=anthropic` or `scripts/run-real-eval.ts` | Render dashboard env var, `sync: false` |
| `DATABASE_URL` | Local Postgres via `docker compose`, trust auth, no real secret | Render-managed, `fromDatabase` reference in `render.yaml` (Render injects the connection string itself; this repository never states it) |

`.gitignore` excludes `.env` and `.env.*` (keeping only `.env.example`, which
contains placeholder values). No secret value has ever been committed to this
repository - `.env.example`'s values are explicitly labeled
`replace-with-a-real-*` and are not usable credentials.

`sync: false` in `render.yaml` is the operative control: it tells Render "do
not manage this value from the repository," so these two secrets exist only
in Render's own encrypted store, set and viewed through the Render dashboard,
never through a file this repository's CI or an agent could read.

## No secret value in logs or traces

The one place this project generates structured records of real provider
activity is `TutorTrace` (`src/contracts/trace.ts`,
`prisma/schema.prisma`'s `TutorTrace` model) and, as of 2026-10-04,
`AuditLog` (`src/server/audit-log.ts`). Neither schema has a field that could
hold an API key or session secret - `TutorTrace` is metadata-only (policy
version, prompt template version, model identifier, latency, token usage,
validation result, outcome, and a redacted excerpt that is always either
absent or the literal placeholder `"[redacted learner text]"`), and
`AuditLog` holds only an event type, household/user id, and timestamp. There
is no code path that logs `process.env.AUTH_SECRET` or
`process.env.ANTHROPIC_API_KEY`; the only reads of those values are the
NextAuth config (`src/auth/index.ts`) and the Anthropic SDK client
(`src/tutor/anthropic-model.ts`), both of which pass the value to the
respective library without printing it.

## Least privilege

Today's access model is a direct consequence of ADR-0008's single-household
scope: the product owner is the only person with Render dashboard access,
the only person with repository write access, and the only person with the
local `.env` file. There is no second engineer, operator, or support role
with standing access to either secret. This satisfies "least privilege"
trivially today, but it is not written down anywhere else, which is why this
section exists - if a second person (a co-developer, a support contact)
ever needs access, record here what they can see and why, rather than
granting blanket Render/repo access by default.

## Support-access procedure

No third party has standing access to anything today — not Render, not the
repository, not `.env`. If the product owner ever needs outside technical
help (debugging a deploy, a database issue), grant the narrowest access that
solves the problem, for the shortest time, and record it here:

1. Prefer sharing a redacted log, error message, or screen-share over
   granting dashboard access at all.
2. If Render dashboard access is unavoidable, use Render's own collaborator
   invite (scoped to this one service/workspace, not an Anthropic or
   repository credential) rather than sharing the product owner's own
   login.
3. If repository access is unavoidable, invite as a GitHub collaborator
   rather than sharing a personal access token or local credentials.
4. Never share `.env`, the Render dashboard password/session, or the
   Anthropic console session itself - those map directly to the secrets
   above, not to a scoped collaborator role.
5. Revoke the access (remove the collaborator) as soon as the issue is
   resolved, and rotate `AUTH_SECRET`/`ANTHROPIC_API_KEY` per the schedule
   below if the access could plausibly have exposed either value.
6. Record here: who, what access, why, when granted, when revoked.

No support-access grant has happened yet; this section exists so the first
one has a documented procedure instead of improvising under time pressure.

## Rotation procedure

Neither secret has a forced expiry. Rotate on this schedule, and
immediately on any suspected exposure:

| Secret | Routine rotation | How |
|---|---|---|
| `AUTH_SECRET` | Every 12 months, or immediately on suspected exposure | Generate a new value (`openssl rand -base64 32`), set it in the Render dashboard, redeploy. Rotating `AUTH_SECRET` invalidates every existing session (NextAuth JWTs are signed with it) - the single real parent will need to sign in again. Do this during low-usage time, not mid-session. |
| `ANTHROPIC_API_KEY` | Every 12 months, or immediately on suspected exposure, or whenever Anthropic's own key-rotation guidance changes | Generate a new key in the Anthropic console, set it in the Render dashboard, redeploy, then revoke the old key in the Anthropic console once the new deploy is confirmed healthy. |
| Local `.env` values | Whenever the corresponding production secret rotates, if local development targets real services | Regenerate locally; `.env` is never shared, so there is no "revoke" step, only "replace." |

**Suspected-exposure rotation** (committed secret, leaked log, compromised
laptop, etc.) follows `docs/incident-response.md`'s containment step: rotate
immediately, do not wait for the routine schedule, and record the incident
there rather than only here.

## Current status

Secret storage and isolation (no repository/log exposure) were already in
place before this document; the pilot-readiness checklist's "Pending" status
reflected the *absence of this document*, not missing engineering. This
closes that gap for the "Secrets" row's rotation and least-privilege
requirements. Not yet done: a dedicated secret manager (e.g. a vault
product) beyond Render's own encrypted env var store - not needed at this
scale, but worth reconsidering if the pilot ever grows beyond a single
household/operator.
