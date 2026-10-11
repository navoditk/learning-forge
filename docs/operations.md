# Operations: spend monitoring, alerting, and incident contacts

This records the operational controls for the single-household Render
pilot, closing the "Operations" pilot-readiness row's remaining items:
spend monitoring, billing alerts, and incident contacts. The existing rate
limits, latency targets, and database recovery runbook are documented in
ADR-0009 and `docs/backup-recovery.md` respectively and are not repeated
here.

## Cost structure

- **Render**: both services in `render.yaml` are fixed-price plans
  (`starter` web service, `basic-256mb` database) — not usage-metered
  compute/storage billing. The main cost-variance risk here is a plan
  upgrade or bandwidth overage, not runaway per-request spend.
- **Anthropic**: usage-metered per-token API billing — the actual variable
  cost in this stack, and the one that needs an active spend limit and
  alerts, not just a target in an ADR.

## Spend limit and alerts — action required (console-only, cannot be set from this repository)

Anthropic's console (`platform.claude.com`, formerly `console.anthropic.com`)
supports a hard spend limit and threshold alerts; this is account
configuration, not something a deploy or this repository can set:

1. Go to **Settings → Plans & Billing → Spending Limits** in the Anthropic
   console.
2. Set a workspace spending limit at a small multiple of ADR-0009's target
   (well under $20/month) — for example $25-30/month, as headroom above the
   target, not a budget to spend up to. Hitting the limit returns a 429
   rather than continuing to bill.
3. Set email usage alerts at 50%, 75%, and 90% of that limit, under the
   console's Usage section.
4. Record here once done: the limit set, the alert thresholds, and the date.

**Done, 2026-10-10** (product owner, in chat): monthly spending limit set to
**$30**, with usage alerts at **$10** and **$20**. This is well above the
estimated realistic cost (~$0.30-3/month at 2hr/day usage — see
`docs/PROGRESS.md`'s 2026-10-10 Anthropic cost-estimate entry for the token
math) and comfortably inside ADR-0009's "well under $20/month" budget
target; it exists as a ceiling against a bug, leaked key, or billing
surprise, not a budget expected to be spent. Closes the one remaining
console-only action in this document and the "Operations" pilot-readiness
row's spend-limit gap.

## Existing request-level backstop (already implemented, for context)

Independent of the account-level spend limit above, this app already
enforces its own request-level limits before any call reaches Anthropic:
an hourly adapter backstop (60 calls/hour) and configurable
household/session hint limits (`TUTOR_DAILY_HINT_LIMIT`,
`TUTOR_SESSION_HINT_LIMIT` in `render.yaml`). These bound cost from this
app's own request pattern; the console spend limit above is the backstop
against anything this app's own logic doesn't catch (a bug, a key leak, a
provider-side billing surprise).

## Incident contacts

Distinct from `docs/incident-response.md`'s child-safety escalation
contact: these are the channels for an infrastructure incident (outage,
suspected breach, billing anomaly), not a learner-safety event.

| Provider  | Contact channel                                                                                  | When to use                                                                  |
| --------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Render    | Render dashboard support chat/ticket (`render.com/support`); status page `status.render.com`     | Service outage, database issue, suspected unauthorized dashboard access      |
| Anthropic | Anthropic console support (`platform.claude.com`); `support.claude.com` for policy/API questions | API outage, suspected key compromise, usage-policy question, billing anomaly |

Both are single-operator contacts today — the product owner is the only
person who can reach either, consistent with `docs/secrets-management.md`'s
least-privilege model. There is no separate on-call rotation or team
contact list, because there is no team.

## Current status

**Closes the "Operations" pilot-readiness row in full, 2026-10-10** —
monitoring/alerting/incident-contacts requirements, and now the
spend-limit console action above, which only the product owner could
perform and has now been done. Rollback is covered by the standard
deploy process (Render redeploy to a prior commit) and
`docs/backup-recovery.md` for data-level recovery; no separate rollback
procedure is needed beyond those.
