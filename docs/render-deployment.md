# Deploying to Render

Records the actual steps for the single-household deployment ADR-0012
decided. This is a manual, dashboard-driven process — deliberately no
Render API key or CLI is used from this repository or any automation.

## Prerequisites

- A Render account connected to the GitHub account this repository lives
  under.
- The Anthropic API key (see `~/GitHub/credentials/` or wherever you keep
  it — never commit this).
- `openssl` available locally (for generating `AUTH_SECRET`), or reuse the
  one already in your local `.env`.

## 1. Create the Blueprint

1. In the Render dashboard: **New** → **Blueprint**.
2. Select this repository. Render detects `render.yaml` at the repo root
   and shows two resources to create: the `learning-forge-db` database
   (plan `basic-256mb`, ~$6/mo) and the `learning-forge` web service (plan
   `free`, $0/mo).
3. Render will prompt for the environment variables marked `sync: false`
   in `render.yaml` before the first deploy:
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`. This must be
     a **different** value from your local `.env`'s `AUTH_SECRET` (a
     production secret should never be the same as a local dev one).
   - `ANTHROPIC_API_KEY` — the real key.
4. Approve the Blueprint. Render provisions the database, then builds and
   deploys the web service.

The build command (`npm ci && npm run db:generate && npm run db:deploy && npm run build`)
runs the Prisma migration (`db:deploy` = `prisma migrate deploy`) as part
of the build, not as a `preDeployCommand` — that feature requires a paid
web service plan, and this deployment deliberately uses the free one
(ADR-0012). This means every deploy re-runs migrations, which is safe
since `prisma migrate deploy` only applies migrations not yet applied.

`AUTH_TRUST_HOST=true` is set so NextAuth trusts Render's own
reverse-proxy headers, rather than needing to know the exact assigned
`*.onrender.com` subdomain (or a future custom domain) ahead of time —
this is what closes the `AUTH_URL`/`UntrustedHost` gap flagged during
track 1 (ADR-0010).

## 2. Verify the first deploy

Once the deploy finishes, visit the assigned `https://<name>.onrender.com`
URL. You should land on `/login` (no account exists yet, so this is
correct) with no server error. The free web service sleeps after 15
minutes of inactivity — the *first* request after a break takes 30–60
seconds to wake it back up; this is expected, not a bug.

## 3. Provision the one real parent account

The free web service plan has no Shell access and can't run one-off jobs,
so `scripts/create-parent-account.ts` needs to run from your local
machine against the production database instead:

1. In the Render dashboard, open the `learning-forge-db` database → its
   **Info** page. Find the **Connect** section and copy the **External
   Database URL**. `render.yaml` sets `ipAllowList: []` (blocks all
   external access) — if the database was created before that was added,
   Render's own default is the *opposite*: any IP with valid credentials
   can connect, so this step needs no unlocking first. Check the
   **Networking** section on the same page if you're not sure which state
   it's in.
2. Run, from this repository, using that external URL (not your local
   `.env`'s `DATABASE_URL`, which points at your local Postgres):
   ```
   DATABASE_URL="<external-database-url>" npm run create-parent-account -- \
     --email=your-real-email@example.com --password=a-real-password
   ```
3. In the **Networking** section, set the IP allow list to empty (blocks
   all external access) if it isn't already. The web service still
   reaches the database fine afterward — it connects over Render's
   internal network, not the external URL.

### If step 2 fails to connect at all

If you see a Prisma error like `Server has closed the connection` (or,
with `psql`, `SSL connection has been closed unexpectedly`), this is very
likely your local network — not Render or this script — interfering with
the TLS handshake on port 5432 (an unusual port for a home router/ISP/VPN
to pass through cleanly). Confirmed during the actual first deployment
attempt: neither adding `?sslmode=require` nor trying both
`sslnegotiation=direct` and `sslnegotiation=postgres` fixed it. Two ways
around it, without more network debugging:

- **Temporarily upgrade the web service to Starter** (Render dashboard →
  the `learning-forge` service → change plan), open its **Shell** tab, and
  run the exact same `npm run create-parent-account -- ...` command there
  — it already has a working *internal* `DATABASE_URL`, so the external
  connectivity problem never comes up. Downgrade back to Free afterward.
  No code change.
- **Or**, if you'd rather not spend anything even temporarily, ask for a
  temporary token-gated HTTP setup route to be added to the app instead,
  used once, then removed.

## 4. Sign in

Visit the deployed URL, sign in with the account just created. The real
Anthropic adapter is enabled by default in this deployment
(`TUTOR_MODEL_PROVIDER=anthropic` in `render.yaml`) — hints will take
1–2 seconds and cost a small amount of real API usage per request
(ADR-0009's budget target: well under $20/month; ADR-0011/ADR-0012 also
cap worst-case spend from a bug or loop at 60 real-provider calls/hour,
not normal usage volume).

## Known gaps not addressed by this deployment

- No per-session or per-day cost cap, and no billing alert, beyond the
  hourly worst-case rate limit above (ADR-0011's explicit non-decision).
- No custom domain; the assigned `*.onrender.com` URL is what gets used.
- No backup schedule verified beyond whatever Render's `basic-256mb` plan
  includes by default — confirm this separately before treating the
  deployed database as the durable copy of this data.
- Provider contractual terms (region, retention, training-use,
  subprocessors) with Anthropic remain unrecorded in
  `docs/privacy-inventory.md`, per the existing decision register.
