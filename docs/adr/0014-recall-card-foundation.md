# ADR-0014: Recall-card contract foundation and staged delivery

## Status

Accepted for the bounded contract foundation by the product owner in chat on
2026-10-10. Delivery implementation and release remain gated as described below.
This record resolves only the listed UI-3 choices; it does not amend the
canonical course-progression policy parameters.

## Approved choices

| Choice                    | Approved value                                                                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                     | UI-3 contract and infrastructure, followed by a flag-off synthetic renderer; one reviewed increment at a time                                                                                                                                                                    |
| R1: artifact              | Separate recall-card artifact, not a fifth scored content role or teaching subtype                                                                                                                                                                                               |
| R2: contract              | `recall-card-1`; vocabulary, notation and fact; optional accessible summary; plain text only                                                                                                                                                                                     |
| R2: technical text limits | Front 500 characters; back 1000 characters; optional accessible summary 1000 characters                                                                                                                                                                                          |
| R3: eventual storage      | Checked-in reviewed records, separate from scored content; no real records authorized now                                                                                                                                                                                        |
| R4: authoring             | D-61 remains in force; no card-content exception or lift was requested                                                                                                                                                                                                           |
| R5: exposure              | `LearningEvent.TEACHING_VIEWED`; its existing prior-instruction effect on skip eligibility is accepted                                                                                                                                                                           |
| R6: idempotency           | One server exposure per successful delivery request; retries reuse its idempotency key; no time-window policy; new deliveries create exposure, local flips do not                                                                                                                |
| R7: suppression           | Any persisted unfinished learner session suppresses delivery; no inactivity timeout                                                                                                                                                                                              |
| R8: overlap review        | Private human verdict bound to exact card text/version and complete compared-content/bank version inventory; missing, changed or newly covering content denies serving; live held-out answer overlap denies serving; public-practice overlap requires explicit human disposition |
| R9: flag/capability       | Server-only `RECALL_CARDS_ENABLED`; only literal `true` enables, absent/unknown means off; capability in an existing authorized read-only program response, no extra request when off; never bypasses review, suppression, exposure or C4/C5                                     |
| R10: exposure identity    | Reserved `recall-card:` prefix in `LearningEvent.contentId`, existing `contentVersion`; catalog validation rejects namespace collisions                                                                                                                                          |
| R11: rendering            | Plain text only for this foundation                                                                                                                                                                                                                                              |

The text limits are technical payload bounds, not pedagogical thresholds.
They were explicitly confirmed in a second approval form. Exposure is not
scored evidence: no card action creates an attempt or mastery contribution.

## Unresolved implementation and release prerequisites

The product owner explicitly approved R8/R9/R10 in a follow-up form on
2026-10-10. Their concrete implementation still needs independent review:
private-verdict schema and coverage resolution, the exact existing response
carrier, and exposure identity validation. No delivery retention/volume policy
or new session-end mechanism is approved by implication. R12 does not authorize
a new parent-facing surface.

Delivery must coordinate suppression, exposure persistence and all protected
activity starts. Existing independent serializable transactions are not proof
of that shared ordering. Missing session lifecycle or coordination coverage
blocks delivery, not the disconnected contract foundation.

The initial increment adds strict contracts and synthetic tests only. It
registers no cards, creates no endpoint, writes no learner state, adds no
migration and changes no existing learner behavior. Further infrastructure
must pass the progression implementation review before serving any instruction.
The flag-off renderer uses test-only fixtures, never a production fixture
catalog.

Parsing a draft or constructing a public-field payload is not authorization
to serve it. The payload's review/origin checks are necessary, not sufficient:
approved overlap review, catalog resolution, suppression and exposure
coordination are still required. Catalog integrity and R8's private verdict
shape are deliberately absent from this contract-only increment.

Real authoring requires D-61/content approvals and overlap review. Rollout
requires explicit human accessibility, privacy/product and release approval.
C4/C5 remain unchanged. Approval covers neither commits/pushes nor the
parallel curriculum research batch.

## References

- `docs/ui-recall-cards-design.md`, sections 3, 6, 7, 12 and 13.
- `docs/course-progression-decisions.md`, especially D-61 and the existing
  delayed-check and assessment boundaries.
- Product-owner approval forms in this session, 2026-10-10.
