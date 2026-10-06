# Course-progression manual gate record

**Status:** Partially recorded — product-owner risk acceptances, the D-58
acknowledgement, the held-out-package and authored-content gates, and the
open-decision check are recorded. Independent review and shadow review
remain open; C4 is not authorized until those two close.

Record one dated decision per gate. “Automated tests pass” is not a substitute
for a manual gate.

| Gate | Required artifact/evidence | Owner | Decision/date/signature |
|---|---|---|---|
| Fourth-draft architecture and C1–C3 independent review | Completed `independent-review.md` with no unresolved blocker/major finding | Independent reviewer | |
| Shadow divergence review | Completed `shadow-divergence-review.md`; every divergence explained or remediated | Product/engineering owner | |
| D-58 acknowledgement | Acknowledgement that the prior unreviewed-publication path existed and no leak is evidenced | Product owner | Acknowledged 2026-10-05 (product owner, in chat): the pre-Stage-A0 code path that could publish a `pending_review` record on merge existed; Stage A0 shipped the fix; no evidence of any such record ever reaching a learner-facing surface. |
| Screen-reader review | `accessibility-acceptance.md`; product-owner assumption recorded, with repeat-pass requirement | Product owner (`D-41`) | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Child-safe wording and safety | `child-safety-acceptance.md`; product-owner assumption recorded, with safety-owner reinforcement requirements | Product owner (`D-55`) | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Privacy/deletion review | `privacy-data-acceptance.md`; product-owner assumption recorded, with residual provider/backup risks | Product owner | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Held-out assessment package | Private package reference, version, digest, access-control confirmation, and content-review status | Product/content owner | Accepted 2026-10-05 (product owner, in chat): `grade-6-math-assessments-draft-v2.json`, held outside this repository at a path only the product owner's machine can reach (never in git, never deployed); all 10 banks at version `1.0.0`; per-bank digests pinned in `src/curriculum/pilot-catalog.ts`'s `BANK_HASHES` (re-pinned 2026-10-04 after the `D-73` content fixes); all 72 items `review.status: reviewed`, reviewed 2026-10-04, after an independent review and the `D-73` fixes it required, re-verified against the real loader (`PrivateAssessmentPackageStore` constructs successfully; the previously-skipped e2e test now passes). |
| Authored assessment content | Every served record has `review.status: reviewed` and traceable provenance | Product/content owner | Accepted 2026-10-05 (product owner, in chat): public practice/teaching content (38 records) approved 2026-09-06 per the pilot-readiness checklist's Content rights row; the 72 held-out items above reviewed 2026-10-04. All carry `provenance.origin`/`licenseStatus` and a `review` record with reviewer, date, and originality statement. |
| Open decision check | Any D-36/D-39 decision needed by the chosen rollout is resolved before that scope ships | Product/content owner | Confirmed 2026-10-05 (product owner, in chat): both approved per `docs/course-progression-decisions.md` (D-36 2026-09-19, D-39 2026-09-20); no open decision blocks the current pilot scope. |

## Release decision

- C4 authorized: yes / no
- Authorized scope:
- Authorized commit/environment:
- Rollback owner and contact:
- Notes:

Authorization signature:
