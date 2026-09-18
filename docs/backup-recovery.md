# Production database backup and recovery runbook

This runbook applies to the single-household Render pilot. It deliberately
does not claim a backup frequency, retention period, point-in-time recovery
window, or restore region until those details are confirmed in the Render
dashboard for `learning-forge-db`.

## Recovery targets

The initial pilot targets are:

- **RPO:** 24 hours. Losing more than one day of learner evidence requires
  escalation and a pause before further real learner use.
- **RTO:** 4 hours. Restore service and verify household isolation within four
  hours of a confirmed database incident.

These are pilot operating targets, not guarantees from Render.

## Dashboard verification

An operator should record the following in the pilot evidence log without
copying database URLs, credentials, learner text, or screenshots containing
secrets:

1. Open the `learning-forge-db` resource in Render.
2. Record the database plan, region, backup schedule, retention period,
   restore options, and any point-in-time recovery window.
3. Confirm whether backups are encrypted, where they are stored, who can
   initiate a restore, and how long a restore normally takes.
4. Confirm whether restoring creates a new database or replaces the existing
   one. Never test by replacing the live pilot database.
5. Record the date, operator, dashboard source, and any unknowns. Unknown
   values remain open risks; do not infer them from the plan name.

## Restore drill

Run this drill only against a newly restored or separately cloned database
with synthetic data:

1. Record the source database timestamp and a synthetic verification marker
   containing no real learner data.
2. Restore into a separate database using the provider-supported workflow.
3. Apply the repository migrations with `npm run db:deploy` using the restored
   connection string.
4. Run the persistence and Phase 1 integration checks:

   ```bash
   DATABASE_URL="<restored-synthetic-url>" npm run db:validate
   DATABASE_URL="<restored-synthetic-url>" npm run db:deploy
   DATABASE_URL="<restored-synthetic-url>" npm run test:integration
   ```

5. Confirm the restored data preserves household ownership, immutable attempt
   behavior, tutor trace metadata, mastery contributions, and the
   `TutorTrace.sessionId` relationship.
6. Record elapsed restore and verification time, the latest recoverable
   timestamp, row-count/check results, and any discrepancies.
7. Delete the restored test database through the provider workflow after the
   evidence is recorded.

Do not run a down migration against the production database. The repository's
`down.sql` files are for local rollback verification and reviewed development
recovery only.

## Incident procedure

If production data is unavailable or appears inconsistent:

1. Pause learner activity and disable the live web service or provider traffic
   if necessary.
2. Preserve the incident timestamp and deployment/migration identifiers.
3. Contact the designated operator and confirm the provider's latest usable
   backup before restoring.
4. Restore to a separate database first when the provider supports it.
5. Run the synthetic integrity checks above, then compare application health
   and authenticated household access.
6. Repoint or redeploy only after the operator records the restore decision.
7. Document data loss against the 24-hour RPO and elapsed recovery against the
   four-hour RTO.

## Current status

The repository has reversible migrations and local integration coverage, but a
Render backup/restore drill has not yet been performed from this environment.
The pilot remains single-household and invite-only until the dashboard facts
and a synthetic restore drill are recorded.
