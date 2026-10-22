# MATH6-RECONCILE revision 2 changed-scope review

Date: 2026-10-12. Verdict: **changes requested; one minor remains**.
Prior matrix, placement, pooling and probe-evidence corrections are verified.
No human content, policy, private access, integration or release approval.

## Frozen evidence and independence

- Artifact: common Git metadata
  `agent-handoffs/MATH6-RECONCILE/grade-6-math-reconciliation.rev2.md`, SHA-256
  `f427777c9b055246098625e9145bb0cba59bee052810f5c05213f8ec7adae1ca`.
- Patch SHA-256:
  `858135e9bbd1c19a31c5032be57dce8d65fd2c8d21dbf796aec05fb170edf1f5`.
- Manifest addendum SHA-256:
  `13daf59fdc386343862a51b2576c186fe934b948394924346cedd70540bd3186`.
- HEAD: `3e7c33372599d20c285656c3610ca6e47743240f`. Exact reconstruction
  matches revision 2; patch owns only the approved report. Addendum review
  and placement-code hashes match; packet subsequently gained the handoff.
- Actual original author confirmed from filtered successful-turn metadata:
  `claude-opus-5-5`, UUID `7454263e-88e2-4e5d-b06c-2567fd5a3735`, timestamp
  `2026-10-12T20:20:15.120Z`, containing the exact report hash.
- Same reviewer `/root/math6_reconcile_review`, host-selected native
  `forge-reviewer` fixed to `gpt-6.1-sol`, completed changed-scope followup.
  Cross-family independence preserved.

## Prior findings

| Finding        | Result                                                                                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-1, major     | Matrix corrected: location/ordering and net representation/area calculation separated; algorithm/fluency partial. Recount matches 57 rows, 34 flagged, 23 production-elicited, seven gaps and one partial in both sets. Added missing-task recommendation has R-4 below. |
| R-2, minor     | Resolved: first eligible reference distinguished from policy wording; E&E no-probe conclusion rests on both refs being stale.                                                                                                                                            |
| R-3, minor     | Resolved: pooling permitted by schema is a risk; live pooling unverified and separately gated.                                                                                                                                                                           |
| Probe evidence | Corrected: original execution remains disclosed deviation; tallies/examples author-reported and static confirmation distinguished. No reruns.                                                                                                                            |

## R-4 — Minor, high confidence

Location: frozen revision 2 line 439. Packet requirement 3 and approved
`6.G.A.3` expect observable drawing of polygons in the coordinate plane.
The new task recommendation permits drawing/constructing a polygon or merely
identifying the figure formed by vertices. Naming a rectangle can succeed
without placing or connecting vertices, so identification alone does not
close the drawing/construction gap.

Minimal correction: remove the identification-only alternative, or require
an accessible construction response explicitly representing plotted vertices
and their connections. Retain ordinary shape identification as useful partial
practice. No content or runtime edit needed.

## Limits and open choices

O-18 remains an open evidence-policy question with no numeric default or
implementation authorization. Ratios plus extension remains a recommendation.
Target-version, crosswalk, first-unit, volumes, teaching scope, private review,
content approval, integration and release remain human gates.

Revision-2 line 689's categorical exclusion of representation capability from
Ratios dependencies is provisional: the recommended double-number-line task
still needs an accessible response format. Actual implementation requirements
depend on approved task design; this review prescribes no runtime capability.

## Validation and return

Frozen hashes, exact reconstruction, targeted recount, `git apply --check`,
`git diff --check` and Prettier through stdin passed. No files edited, probes,
runtime suites, installs, agents, databases, providers or private packages used.

Return R-4 to original Claude executor for bounded document correction,
refreeze and Codex changed-scope review. The current patch remains unapplied;
no acceptance or release is approved.
