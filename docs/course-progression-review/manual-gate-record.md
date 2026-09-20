# Course-progression manual gate record

**Status:** Partially recorded — product-owner risk acceptances are recorded;
independent review, shadow review, and held-out-package gates remain open.

Record one dated decision per gate. “Automated tests pass” is not a substitute
for a manual gate.

| Gate | Required artifact/evidence | Owner | Decision/date/signature |
|---|---|---|---|
| Fourth-draft architecture and C1–C3 independent review | Completed `independent-review.md` with no unresolved blocker/major finding | Independent reviewer | |
| Shadow divergence review | Completed `shadow-divergence-review.md`; every divergence explained or remediated | Product/engineering owner | |
| D-58 acknowledgement | Acknowledgement that the prior unreviewed-publication path existed and no leak is evidenced | Product owner | |
| Screen-reader review | `accessibility-acceptance.md`; product-owner assumption recorded, with repeat-pass requirement | Product owner (`D-41`) | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Child-safe wording and safety | `child-safety-acceptance.md`; product-owner assumption recorded, with safety-owner reinforcement requirements | Product owner (`D-55`) | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Privacy/deletion review | `privacy-data-acceptance.md`; product-owner assumption recorded, with residual provider/backup risks | Product owner | Accepted 2026-09-20 for scoped pilot; evidence assumed |
| Held-out assessment package | Private package reference, version, digest, access-control confirmation, and content-review status | Product/content owner | |
| Authored assessment content | Every served record has `review.status: reviewed` and traceable provenance | Product/content owner | |
| Open decision check | Any D-36/D-39 decision needed by the chosen rollout is resolved before that scope ships | Product/content owner | |

## Release decision

- C4 authorized: yes / no
- Authorized scope:
- Authorized commit/environment:
- Rollback owner and contact:
- Notes:

Authorization signature:
