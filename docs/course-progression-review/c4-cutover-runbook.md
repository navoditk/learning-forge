# Stage C4 cutover runbook

**Status:** PREPARED — do not execute until `manual-gate-record.md` is fully
approved and the independent review plus shadow packet are attached.

This runbook records the handoff’s required order. It is intentionally not a
release command and contains no authorization bypass.

## Preconditions

- [ ] Approved independent review is attached.
- [ ] Representative shadow packet has non-empty traffic and every divergence
      is explained or remediated.
- [ ] Manual gate record is complete and signed by the named owners.
- [ ] Private held-out assessment package is installed through its approved
      channel; only its digest/version is recorded.
- [ ] `npm run verify`, `npm run test:integration`, `npm run test:migrations`,
      and `npm run test:e2e` pass for the release commit.
- [ ] Backup, rollback owner, and maintenance window are recorded.

## Ordered execution record

| Step | Action | Operator/time (UTC) | Evidence/result |
|---|---|---|---|
| 1 | Confirm expanded nullable bindings and C3 dual-write at the release commit | | |
| 2 | Confirm no unbound open session remains within the approved activity window | | |
| 3 | Enable fail-closed `SESSION_UNBOUND` residue handling and verify restart guidance | | |
| 4 | Apply the reviewed contract migration making bindings non-nullable | | |
| 5 | Enable authorization enforcement using the shadow-observed policy version | | |
| 6 | Remove the permissive session-start bypass and require `POST` creation | | |
| 7 | Run the post-cutover checks and tag `progression-compatibility-baseline` | | |

## Abort conditions

Abort and restore the prior safe state if any precondition is false, if the
drain count increases, if any migration leaves residue, if enforcement differs
from reviewed shadow behavior, or if a manual gate is withdrawn. Do not bypass
authorization or infer a missing session binding.

## Post-cutover evidence

- Readiness report:
- Migration output:
- Integration/E2E output:
- Compatibility tag:
- Incident/rollback notes:
- Operator signature:
