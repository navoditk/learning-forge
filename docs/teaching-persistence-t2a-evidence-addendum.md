# Teaching persistence T2a: evidence and disposition addendum

Status: **evidence note only, writer-free.** It approves nothing and changes no
decision. The accepted proposal `docs/teaching-persistence-privacy-proposal.md`
(SHA-256 `d142183646e35c7c8e7c997bad3711e40e69fcccd76e097706cb736023a26e5d`) is
preserved byte for byte; this addendum records evidence that disagrees with one
of its explanations. The migration and its `down.sql` remain an unreviewed draft
until a human reviews them.

## NO ACTION versus RESTRICT

The proposal (section 4 and its erasure test row) says the actor foreign key
uses `NO ACTION`, that a `RESTRICT` variant "would fail mid-cascade", and that
the cascade-erasure test should fail for a `RESTRICT` variant.

Observed on the task-created PostgreSQL 16.15 scratch server:

- The implemented `NO ACTION` foreign keys pass the direct `DELETE` of a
  household and `deleteHouseholdData`, with contexts and events erased.
- A clone whose actor foreign key was changed to `ON DELETE RESTRICT` **also
  passed** the direct household `DELETE` test. The reviewer's independent clone
  and this correction's clone agree. The cascade removed contexts before users,
  so the blanket "RESTRICT fails mid-cascade" expectation is **not proven** for
  this schema and server.
- The same `RESTRICT` clone fails the catalog assertion that the actor and event
  foreign keys use `NO ACTION` (`confdeltype` and `confupdtype` equal `a`, match
  type `s`). That catalog check, not a cascade failure, is what guards the
  accepted design.

Disposition: the accepted `NO ACTION` design is unchanged and stays enforced by
the catalog check and the passing cascade tests. Do not cite this evidence as a
reason `RESTRICT` must fail, and do not change the design because the
counterfactual did not fail.

## First-write gates restated

- The raw `operationKey` (D-146) may carry identifying or learner free text, and
  the linked household, learner, parent actor, activity and version pins are
  personal household data. The existing server logs Prisma errors, and a
  failing-row `DETAIL` from a `CHECK` violation can include a synthetic key in
  that output. This increment does not prove keys are never logged.
- No real teaching write, route or serving is permitted until a separate,
  approved and tested diagnostics-redaction policy covers ORM and application
  errors and database operational logs. Shared logging changes, UUIDv4
  tightening, key hashing and writers each need their own approved scope.
- D-143 and D-144 remain open. The interim export omits the key and is not the
  final D-143 branch.
- Production row counts, locks, application-role privileges, backup controls,
  owner-disabled guards, two-client concurrency and post-first-write rollback
  remain unverified first-write or release gates.
