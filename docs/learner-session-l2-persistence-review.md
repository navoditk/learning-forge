# Learner-session L2 persistence preflight — independent review

**Current verdict (revision 3 bounded re-review): APPROVE FOR HUMAN REVIEW of
the writer-free L2a preflight.** RR-1 and RR-2 are addressed at the proposal
level; no remaining blocking finding was identified in this bounded scope.
This is a document review, not permission to implement, migrate, deploy,
backfill, expose clear step-up, or call a provider. S-01–S-14 are already
approved; only L1 implementation is authorized. L2 and L3 still require their
separate manual gates.

## Revision 3 bounded re-review — 2026-10-10

Reviewed only the two prior findings RR-1/RR-2 and directly coupled
constraints, adapter branches, backfill handling, tests and gate statements.
Revision 3 is 868 lines; reviewed SHA-256:
`0c62b822492a933db376846818a389c0fab62bb150bfc606e882517d4526e2b5`.
This supersedes revision 2's changes-required verdict below. The previous
cross-family coordinator witness remains recorded; this turn did not launch
another agent or independently inspect new harness metadata.

| Finding               | Verified revision 3 evidence                                                                                                                                                                                                                                                                  | Disposition                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RR-1                  | §6 lines 350–359 explicitly require all optional actor/clear tenant components non-null before equality. §14 lines 779–786 cover partial-null foreign IDs/tenant combinations and positive controls.                                                                                          | Closed at proposal level. Partial-null branches now evaluate FALSE rather than UNKNOWN; all-set composites enforce actual FKs. No database execution claimed. |
| RR-2                  | §9.2 lines 550–565 checks raw scoped endedAt before parsing, deliberately returns no-write ALREADY_ENDED for valid/malformed ended rows, and distinguishes open MALFORMED_SNAPSHOT. Lines 577–583 explicitly split conditional-end-only step 1 from same-transaction record insertion step 2. | Closed at proposal level. L1 validation/replay remains unchanged; malformed open rows are not relabelled.                                                     |
| Coupled H-02/backfill | §13.1 line 727 restricts A to structurally valid cases (i)–(iii); malformed case (iv) permits B/C or separately reviewed design. §10 lines 667–673 reports/stops on malformed historical rows without repair.                                                                                 | Applicable alternatives now match L1 BACKFILL's validation; the owner still must choose.                                                                      |
| Coupled Prisma/gates  | §5 lines 233–240 calls duplicated nullable tenant columns a candidate, not a verified necessity. G-12/G-13 lines 850–857 explicitly remain untested.                                                                                                                                          | No schema/Prisma/migration readiness overclaim; validation remains future approved work.                                                                      |

The remaining actor/outcome/status CHECKs are safe **in combination**:
outcome_actor can evaluate UNKNOWN for a missing assignment status, but the
separate run_status_presence CHECK rejects that row. The corrected tenant
CHECKs are total booleans over nullable components and block the specific FK
bypasses. Catalog and negative-row execution tests are still required.

**Minimal gate interpretation unchanged:** writer-free L2a can proceed to
human migration/privacy review without reopening fourteen H choices.
H-01 drain scope, H-02 live-end disposition, A-1 D-28 acknowledgement and
C-1 activation/backfill window remain L2b owner items. RR-2's malformed drain
handling must be included in H-01's disposition; it is not implicitly approved.
No recommendation selects B/C, changes a lifecycle label, or supplies approval.

Approval here means document-review readiness only. It does not authorize
L2a implementation/application, certify SQL/Prisma correctness in execution,
clear G-12/G-13, activate L2b or L3, approve backfill/production operations,
or change curriculum-source/provider gates. No database, runtime, SQL file,
schema file, secret, provider or agent action occurred. Only this report was
updated.

**Next:** human migration/privacy review of writer-free L2a, with subsequent
explicit implementation/migration authorization and synthetic execution
evidence; separately disposition the four L2b items.

Revision 3 report validation:

- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --write --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `git diff --check` — passed.
- Preflight SHA-256 rechecked unchanged after report formatting.

## Revision 2 re-review — 2026-10-10 (historical)

Bounded scope: independently reread all 802 lines of the revised owned
preflight and checked the prior findings plus directly coupled schema/adapter
changes. No new runtime or migration review was performed; no database,
schema file, provider, secret, agent or human-approval action occurred.
Only this review report was updated.

Current reviewed preflight SHA-256:
`2a21ee455deac038774bdf51c5649cbbe434d4684cce1b9aacd12277fb862522`.
The approved lifecycle design hash is unchanged:
`c02fadf096d6a5f623bd173337a3c9ea0f5d06f50d9e114b9b57043966231372`.
References in this section are to revision 2; the initial review below is
retained as historical evidence, not a list of still-open findings.

**Cross-family review witness: verified by coordinator task/read metadata, as
supplied to this re-review.** Author task
`25cf214d-9f63-4719-8277-c85dd0df8503`, actual model `claude-opus-5.5`;
reviewer task `e1648e74-7d9c-41fc-8348-1ac4cc189733`, actual model
`gpt-6.1-sol`. This records the coordinator's verified harness witness,
not model self-identification. It establishes review-family diversity only,
not human acceptance, migration validation or release permission.

### Original finding disposition

| Finding | Revision 2 evidence                                                                                                                  | Re-review disposition                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1      | §6 adds independent `(learnerProfileId, householdId)` FK and §14 tests an existing inconsistent Session                              | Original membership gap addressed. New optional-FK CHECK defect below still blocks L2a readiness.                                                                        |
| R2      | §9 uses real `{context,state,event,at}`, loads state, distinguishes ended no-op from L1 replay, and maps trusted actors explicitly   | Ordinary valid-row contract addressed; malformed-state flow still needs clarification below. Actor propagation is proposed, not implemented/tested.                      |
| R3      | §13 withdraws end-now/backfill-later; H-02 presents explicit atomic or behavior-changing alternatives                                | Original recommendation withdrawn correctly. H-02 remains a genuine owner decision for L2b; option A cannot cover malformed snapshots without additional design.         |
| R4      | §12 separates fleet-wide conditional ends from later record activation; C-1 identifies the bounded old-code overlap/backfill reading | Timestamp-corruption mechanism addressed at design level if rollout prerequisites are actually enforced. No fleet verification performed.                                |
| R5      | §9.4 derives late check on an ended PRACTICE session, counter timing, REVIEW exclusion and A-1 acknowledgement                       | Concrete root cause and observable eligibility correction correctly stated; no new D-28 value introduced.                                                                |
| R6      | §6/§6.1 add explicit transaction boundaries and locked down guard; §14/G-06/G-12 require refusal/failure evidence                    | Proposal corrected. No Prisma transaction, lock, rollback or migration test has passed in this review.                                                                   |
| R7      | §5 restores requestedCount/removes ID array; §7 signs profile pins; §5/G-13 supplies relations and declares validation pending       | Shape, minimization and lifetime-context proposal addressed. New duplicate nullable tenant columns need the CHECK fix below; Prisma correctness/drift remain unverified. |

### RR-1 — SQL CHECK UNKNOWN bypasses optional tenant FKs (L2a)

Revision 2 §6 claims its actor/clear tenant CHECKs make optional composites
“all-null or all-set.” They do not. PostgreSQL accepts a CHECK evaluating to
NULL/UNKNOWN, not only TRUE; MATCH SIMPLE skips a composite FK when any
referencing column is NULL.

Concrete actor bypass:

- Choose a valid Session/learner triple and outcome `ABANDONED_BY_REQUEST`,
  actorKind `HOUSEHOLD_USER`.
- Set `actorUserId` to any non-null ID, including another household's or an
  unknown ID, and leave `actorHouseholdId = NULL`.
- The actor-presence and outcome checks pass. The actor-tenant second branch
  is `TRUE AND UNKNOWN`, so the CHECK is UNKNOWN and accepted; the actor FK
  is skipped.

Concrete clear bypass: choose outcome `CLEARED_BY_ADULT`, STEP_UP_ADULT and
a valid household actor; set a non-null arbitrary `clearRequestId` but NULL
`clearHouseholdId`/`clearLearnerProfileId`. Clear-presence passes, clear-tenant
CHECK becomes UNKNOWN and the clear FK is skipped.

**Minimal correction:** require every optional tenant component to be
explicitly non-null in the all-set branch before comparing equality:

```sql
-- actor_tenant all-set branch:
("actorUserId" IS NOT NULL AND "actorHouseholdId" IS NOT NULL
 AND "actorHouseholdId" = "householdId")

-- clear_tenant all-set branch:
("clearRequestId" IS NOT NULL AND "clearHouseholdId" IS NOT NULL
 AND "clearLearnerProfileId" IS NOT NULL
 AND "clearHouseholdId" = "householdId"
 AND "clearLearnerProfileId" = "learnerProfileId")
```

Keep the existing all-null branches. Equivalent total-boolean CHECKs or a
correctly specified MATCH FULL constraint are engineering alternatives.
Add partial-null negative fixtures for actor and every clear component,
including all-null tenant columns with a non-null foreign ID. The existing
generic §14 tenant-column matrix should explicitly include these SQL
three-valued-logic cases. No extra human policy vote is needed.

### RR-2 — Malformed-state compatibility is not a usable H-02 option A (L2b)

§9.1 parses the mapped row with `SessionLifecycleStateSchema` before §9.2
tests OPEN/non-OPEN. A malformed snapshot therefore cannot reach the stated
already-ended no-op or transition-refusal disposition as currently described.
This is coupled to H-02 case (iv), not a hypothetical new behavior request.

H-02 option A conditionally ends then invokes L1 BACKFILL. BACKFILL still
validates snapshot pins/dates/binding, so it cannot label an originally
malformed snapshot merely because endedAt is now populated. The approved L1
validation is not bypassed by changing state to ENDED_UNRECORDED.

Minimal clarification: define mapper-parse failure as a distinct adapter
result before transition, with scoped already-ended compatibility handled
deliberately; explicitly restrict A to structurally valid snapshots. Case
(iv) needs an applicable owner-selected disposition or separately reviewed
adapter design, not a claim that unchanged L1 BACKFILL accepts it. Do not
weaken L1 or silently insert unknown evidence on an invalid tenant/snapshot.
For step 1, spell out that the record-disabled branch exits after the
conditional end; step 2 adds atomic insertion. These are L2b details and
do not hold up the writer-free L2a packet once RR-1 is corrected.

### Stage/gate conclusions and minimal remaining owner items

- **L2a:** no H-01/H-02/A-1/C-1 decision is needed to create writer-free
  schema/privacy coverage. Correct RR-1 before recommending this SQL packet
  for human migration/privacy review. Separate migration approval and
  applicable deployment/evidence gates remain required.
- **L2b:** H-01 reconciles drain scope with actual L1 legacy classification;
  H-02 disposes live Phase 1 endings L1 refuses; A-1 acknowledges the
  set-once timestamp's D-28 eligibility correction; C-1 confirms the
  pre-activation overlap/backfill reading or selects the no-old-instance
  activation variant. None is granted by this report. RR-2 clarifies which
  options are actually implementable.
- The two-step rollout works only after all unconditional writers, including
  in-flight old code, are retired before first recording. Step-1 ends during
  step-2 overlap remain unknown until separately approved backfill. No
  outcome is inferred, no new automatic ending is added, and no provider or
  continuation gate moves into L2.
- **G-12 is untested:** explicit BEGIN/COMMIT and locked down are sensible
  drafts, not proof of Prisma deploy interaction or failure atomicity.
  **G-13 is untested:** supplied relations/default names/composite uniques
  are a candidate representation, not evidence that optional mixed-field
  relations are impossible, the duplicated columns are necessary, Prisma
  validates, or migrate diff is zero. State those claims conditionally until
  actual approved validation; SQL-only CHECK/trigger catalog tests remain
  separate. Neither gate has been passed here.
- No fourteen-choice reapproval is required. Outcome labels, set-once
  lifetime, erasure, raw-secret exclusion, digest-minimized export,
  requestedCount, and S-04 purpose separation are inherited requirements.
  Purpose-specific clear step-up still cannot ship before L3 approval.
- The retained §1 concurrency claim is not independently corroborated by
  this bounded review; G-02 must obtain current branch/PR evidence at
  authoring. This worktree's HEAD supplies no such proof. Curriculum
  source-authoring/research approval and lifecycle approval remain separate.

**Next:** author fixes RR-1 and clarifies RR-2, then seek human review of the
writer-free L2a packet; do not implement or treat source-review findings as
G-12/G-13 execution evidence. Documentation validation for this re-review:

- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --write --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `git diff --check` — passed.

Both reviewed source hashes were rechecked unchanged after report formatting.
No runtime, database, Prisma validation or migration command was executed.

## Initial review — scope and evidence (historical)

Reviewed the isolated `parallel-20261010/l2-preflight` worktree, not the main
checkout. Read `AGENTS.md`, README, relevant numbered architecture/data/privacy
docs, latest progress and resume/current-status sections, the approved lifecycle
design, actual L1 contracts/helpers, Prisma schema and migration scripts,
terminal writers, household auth/step-up/override consumption, D-28 eligibility,
and export/delete coverage. No other agent was launched.

Document snapshots, SHA-256:

- Preflight: `0b4b456a9913c8e80469c793ddc8b987d19485914e48e9ecf6fbc2d0491ec962`.
- Approved design: `c02fadf096d6a5f623bd173337a3c9ea0f5d06f50d9e114b9b57043966231372`.

Line references below are to those snapshots and their accompanying source.
Another worktree's HEAD is not proof of migration coordination or correctness.
The coordinator must record actual author/reviewer model IDs from harness
metadata to establish GPT-versus-Opus independence; this report cannot establish
that gate by self-identification.

Assumptions: historical unknown endings remain unknown; no new outcome labels,
policy numbers, auto-ends, continuation refusals, SCORED end, trace writer,
route or UI are authorized here. Plan followed: verify authority, re-derive
writers and persistence dependencies, review SQL and stage boundaries, record
only actionable corrections and genuinely unresolved decisions.

## Initial review — required corrections (historical)

### R1 — The termination FK does not prove learner/household membership

Preflight §2 correctly observes that existing Session FKs permit a session
whose household is A but whose learner belongs to B. Its proposed
`SessionTermination_session_fkey` (§6, lines 214–217) merely matches that
session's three columns. For a SYSTEM termination with no clear/actor, **every
proposed FK can pass for that invalid existing combination**. The §14 tenant
test claim is therefore stronger than the SQL.

Minimal fix: add a RESTRICT composite termination FK from
`(learnerProfileId, householdId)` to `LearnerProfile(id, householdId)`, using
the proposed target unique index. Keep the session triple FK: together they
prove both session attribution and actual learner membership. Alternatively,
repair and constrain Session itself, but that is a larger existing-data change,
not necessary to protect the new table. Do not inspect real data now.

Add a synthetic negative test that first creates the inconsistent Session
allowed by today's schema, then attempts a SYSTEM termination with precisely
the same triple. Merely changing a termination's learner away from its session
does not exercise this gap.

### R2 — The L2 helper contract is not executable against actual L1

Preflight §9 names `SessionSnapshot` and calls
`transitionSessionLifecycle(snapshot, event)`. Actual exported contracts are
`SessionLifecycleSnapshotSchema` and `SessionLifecycleStateSchema`; the helper
accepts one `{ context, state, event, at }` envelope
(`src/progression/session-lifecycle.ts:195–242`). Its END result carries
outcome/status/session, **not actor information**. Actor provenance must be
mapped from trusted caller context, not inferred from an outcome alone.

There is also a real replay contradiction: for an initially ended session,
L1 can refuse before the proposed conditional update. §9 step 1 then throws,
so step 3's `ALREADY_ENDED` no-op is unreachable. Today's check path can still
succeed on an ended session; L2 must not accidentally introduce L3 refusal.

Minimal fix: specify scoped snapshot/state loading, including any stored
termination, the real input envelope, and explicit trusted actor mapping.
Define the **L2 adapter's** already-ended no-op before applying an OPEN
transition, and separately handle a race losing the conditional update.
Do not weaken L1's absorbing-terminal or L3 replay rules to accomplish this.
Abandon's current input type omits actor fields
(`assessment-submission.ts:567–571`), although its real route passes the
authenticated identity by spread; formally propagate and test that provenance
before requiring a HOUSEHOLD_USER record. Operator identifiers are not
automatically household-user identities: document the intended OPERATOR/null
mapping without inventing an operator identity system.

### R3 — H-02's recommended unrecorded live end defeats complete dual-write

H-02 option B recommends ending without a record and later labeling it during
backfill. That conflicts with §12's exclusion of partial dual-write and §10's
precondition that no new unrecorded ends appear after full deployment. Existing
permissive diagnostic/check calls can continue creating these rows indefinitely.
It also fails the design §10 requirement that every existing terminal update
and its record insertion be atomic.

This is a **real human disposition**, not a reason to invent a completion
label. If compatibility is chosen, specify an immediate same-transaction
unknown-evidence record, with an explicitly approved extension of S-07 for
live legacy/misrouted endings. L1 BACKFILL only accepts ENDED_UNRECORDED state;
do not pretend it can end an OPEN row. If the owner instead chooses refusal
or a new label, acknowledge the changed scope and approval rather than hiding
it inside L2. Backfill is not a substitute for a live writer.

### R4 — Old/new writer overlap can permanently invalidate recorded timestamps

Preflight §1 acknowledges old-instance writes during deploy; §10 only requires
retiring old code before backfill. That is insufficient for immutable evidence.
Concrete interleaving: new code ends a practice session at T1 and records T1;
old `createAttempt` later unconditionally overwrites `Session.endedAt` at T2
(`service.ts:386`). The immutable record remains T1. The proposed backfill
skips it because it already has a record.

Minimal fix: make the L2b activation plan explicitly prevent incompatible
old terminal writers from overlapping the first recorded write, or provide
another reviewed mechanism that preserves both timestamp equality and stated
compatibility. A deployment/activation barrier is an engineering choice;
enabling L3 refusals or silently rejecting old-client writes is not.
Add a synthetic old-writer/new-writer interleaving case. An app-only equality
test against a fully upgraded instance does not prove rolling-deploy safety.

### R5 — Re-derive H-03 as the concrete D-28 eligibility correction

The primary D-28 effect is **not** review's double end: REVIEW is excluded by
the counter's `activityKind: 'PRACTICE'` predicate
(`skill-assessment.ts:212–221`).

Concrete root cause:

1. A PRACTICE session has a correct MASTERY_CHECK and ends at T0.
2. Remediation begins at T1, after T0.
3. `recordIndependentCheck` does not check endedAt and accepts another
   correct submission after T1 if that session has a tutor interaction
   (`service.ts:653–676`).
4. `createAttempt` overwrites endedAt at T2, after T1.
5. The D-28 count now sees an ended-after-remediation PRACTICE session and
   **any** correct MASTERY_CHECK on it. It has no attempt-time filter.

With set-once endedAt, that old session remains T0 and no longer counts as
post-remediation completion. This can change reassessment eligibility, even
though L2 adds no continuation refusal. It preserves the approved
one-completed-practice requirement rather than establishing a new threshold,
but the L2 owner must explicitly acknowledge the compatibility delta.

Minimal fix: replace H-03's generic statement with this sequence and a
regression fixture. Verify genuinely newly completed practice after remediation
still counts; repeat checking an old ended session does not move its timestamp;
REVIEW never satisfies this count. Leave existing D-21/D-28 values unchanged.

Related existing limitation, not a request to rewrite mastery now: the counter
uses neither terminal outcome nor correct-attempt date, so an operator-drained
PRACTICE row carrying an earlier correct check can satisfy it. D-28's approved
2026-09-24 note says drains must not count. H-01's proposed narrowing removes
kind-set PRACTICE from the drain, but tests must cover that interaction. Reading
termination outcomes in D-28 would contradict this packet's L2 separation rule
and needs a separate scoped decision.

### R6 — Correct migration transaction assumptions and protect the down guard

§6 says plain index creation occurs “inside Prisma's migration transaction.”
The shown SQL has no BEGIN/COMMIT; `db:deploy` invokes Prisma directly, and
the rollback/test scripts invoke `psql -f` without a single-transaction option.
Do not rely on an implicit PostgreSQL Prisma migration wrapper: explicitly
state and draft the intended transaction boundary. Plain CREATE UNIQUE INDEX
does block writes; CONCURRENTLY cannot be inside an explicit transaction.

The §6.1 emptiness check and destructive drops also lack a protected boundary.
Without locking, a writer can insert after the check and before DROP TABLE.
Minimal engineering fix: draft BEGIN, acquire ACCESS EXCLUSIVE locks on both
new tables in a documented order, check emptiness, perform drops, COMMIT.
Exercise nonempty refusal without losing rows and inject a migration failure
to prove the intended atomicity. This is defense in depth, **not** permission
to run production down; first-write forward repair and evidence-free,
synthetic-only destructive testing are already approved invariants.

`scripts/test-migrations.sh` only round-trips an empty schema; it does not
currently exercise refusal on retained rows. It also uses `mktemp`, which this
review environment prohibits. Before a future authorized run, provide the
reviewed project-local scratch-file accommodation; do not run the present
script here or claim it established nonempty protection.

### R7 — Finish the clear-record shape and persistence test contract

Design §8 includes `requestedCount`; the draft replaces it with `sessionIds`
without identifying that change in §13. Restore requestedCount or explicitly
document the equivalent derivation and justify retaining the selected-ID
snapshot in the privacy-reviewed shape. Learner scope and profile pins are
reasonable implementation details, not new pedagogical parameters.

The token sketch correctly separates signed purpose from consumption identity:
the stored value is a hash of a domain-prefixed random token ID, **not a raw
bearer token or secret**. Keep digest out of export. Clarify the trusted
D-47 profile resolution at issuance and consumption: persisting profile pins
only after successful consumption does not itself ensure the verifier used
the same issued lifetime context. Use a documented trusted resolution or
signed profile pin, without changing D-47's value.

Add tests for clear/override rejection in both directions, same-purpose replay,
wrong household/user/learner context, and consumption rollback if any selected
end/record insert fails. Separate purpose-specific consumption does not require
a new cross-purpose timestamp ledger: purpose rejection prevents the same
credential from authorizing both consumers.

Before L2a authoring is reviewed, complete Prisma's new relation/backrelation
fields **and existing models' composite unique declarations** to match SQL.
Otherwise even valid SQL is not a zero-drift schema. Prisma-unrepresented
CHECKs/triggers require separate SQL catalog assertions, not merely migrate
diff. This is engineering completion, not a new human policy vote.

## Terminal inventory: eight statements, seven runtime functions

| Site                                                          | Verified current behavior                                                      | L2 obligation                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `service.ts:386`, `createAttempt`                             | Bare overwrite after correct independent check; also invoked by correct review | Small atomic end/record; preserve first timestamp; resolve H-02             |
| `service.ts:590`, `recordDiagnosticAttempt`                   | Bare overwrite after one diagnostic attempt; no kind check                     | One-shot PLACEMENT mapping; resolve permissive mismatches                   |
| `service.ts:796`, `recordReviewAttempt`                       | Prechecks open/REVIEW non-atomically; correct review already ended at :386     | Exactly one ONE_SHOT record                                                 |
| `assessment-submission.ts:650–652`, `abandonAssessmentRun`    | Serializable, conditional bulk end                                             | Insert for newly ended rows in existing transaction                         |
| `assessment-submission.ts:755–757`, `invalidateAssessmentRun` | Serializable, conditional end; multiple clocks                                 | One now for run/lease/session/record; OPERATOR provenance                   |
| `assessment-submission.ts:827–829`, `expireAssessment`        | Uses caller transaction; session projection only id                            | Load binding/tenant/endedAt; record in caller transaction                   |
| `legacy-session-drain.ts:66–69`, `drainUnboundLegacySessions` | Default transaction, broad predicate, no update-count assertion                | Explicit-ID scope; reconcile H-01; verify counts atomically                 |
| `run-progression-shadow-pilot.ts:37–40`                       | Staging-only synthetic bulk end of kind-set sessions                           | Prefer removing this synthetic end and correcting closedSessionCount output |

The preflight's “7 runtime (6 functions)” is a count typo: there are **seven**
runtime functions. SCORED submission does not end Session and remains L3.
Session start, tutor persistence and household deletion are not terminal writes.
Suppression of review's inner end must key off the review invocation
(`reviewDecay`), not blindly suppress every `/check` against a REVIEW row:
the latter is the distinct H-02 compatibility case.

## Human decisions versus inherited engineering

Do not make G-01 a vacuous second approval of fourteen already established
choices. Human migration/privacy/release review remains mandatory.

| H choice | Correct classification                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-01     | Real scope reconciliation: narrower operator-drain eligibility versus current broad predicate. Approve that delta or amend the compatibility treatment; no new label presumed.                         |
| H-02     | Real compatibility/evidence disposition; recommended delayed recording is not adequate. See R3.                                                                                                        |
| H-03     | Explicitly acknowledge D-28 observable eligibility correction under already approved set-once semantics; do not offer evidence overwrite as a policy alternative.                                      |
| H-04     | Engineering de-duplication of the already approved REVIEW one-shot outcome; not another outcome approval.                                                                                              |
| H-05     | Engineering cleanup of synthetic pilot traffic and its output. A new end reason would require approval, but removing this staging-only end does not invent product policy.                             |
| H-06     | Learner-scoped tenant references implement existing auth/clear scope; include in schema/privacy review, not a new lifecycle decision.                                                                  |
| H-07     | Implement approved D-47 lifetime with stable trusted profile resolution; new lifetime values or selection policy would need approval, pins themselves do not.                                          |
| H-08     | Existing L1 labels are S-approved inputs. Parity test and enum migration review are required; do not reopen seven labels merely because older text says “proposal.”                                    |
| H-09     | No invented batch cap. L1 already has unique, nonempty IDs without a maximum. A new product cap would require approval; preserving that contract needs no new “unbounded” policy vote.                 |
| H-10     | Prisma/SQL representation and zero drift are engineering obligations.                                                                                                                                  |
| H-11     | App validation versus SQL trigger is engineering design, with explicit enforcement and tests. It cannot relax tenant membership or immutable-evidence requirements.                                    |
| H-12     | Defer unused discarded-trace enum/writer to separately reviewed L3; S-08 semantics stay approved. No provider behavior change now.                                                                     |
| H-13     | Lock/transaction/activation plan is reviewed deployment engineering. Measurements on real data are separately authorized operations, not actions for this packet.                                      |
| H-14     | Excluding token-ID digest is data minimization, not withholding learning evidence or a reason to reconsider raw-secret export. Review the exact safe export shape under existing privacy requirements. |

S-04's purpose-specific clear step-up outside the progression gate is already
human-approved; **shipping it still waits for L3 approval**. Neither this
review nor a hash/index design grants route exposure.

## Coverage and validation before any later writer

The proposed L2a-before-L2b split is sound if coverage/export/delete land in
the same schema increment before any production writer:

- Add both models to enumerated coverage; test actual household-scoped export,
  not only DMMF list membership. Use explicit selects, no digest/raw token.
- Delete termination then clear request before Session/User/LearnerProfile.
  Test rollback on deletion failure. Preserve today's AuditLog event/time
  with household/user IDs anonymized; do not cascade-delete the audit trail
  (`household-data.ts:302–310`).
- Preserve `deleteHouseholdEvidence`'s delegation to `deleteHouseholdData`.
  Fix the direct Session cleanup in
  `tests/progression-integration/skill-assessment.test.ts:119`, not merely its
  afterAll, which already uses the approved deletion service at :134.
- Test FK/actor/status/clear CHECK combinations, immutable UPDATE rejection,
  all writer transactions and injected failure, duplicate ends, and races.
  Under existing Serializable assignment transactions a competing loser can
  fail serialization and commit nothing; do not promise ALREADY_ENDED for
  every isolation level or add an automatic retry policy.
- Validate clear termination actor equals the confirmed request actor,
  requested membership, bound assignment/run status, and timestamp equality
  in the app mapper/writer if SQL does not enforce them. These gaps must be
  named alongside §6's app-only constraints.
- Backfill synthetic malformed/historical rows explicitly: L1 can reject
  invalid pins/dates/binding even for BACKFILL. Stop/report counts rather than
  infer completion or silently repair evidence. Test idempotence and no open
  session writes; S-07 terminal-run closure is a separately approved operation.

Review execution was source-only. No database connection, schema application,
provider call, secret access, runtime test, main-checkout source change, commit
or push occurred. Documentation validation commands:

- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --write --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null docs/learner-session-l2-persistence-review.md` — passed.
- `git diff --check` — passed.
- `git diff --no-index --check /dev/null docs/learner-session-l2-persistence-review.md` — no whitespace diagnostics; returned 1 for the added-file difference. Explicitly checks the new untracked report.

No migration/integration test result is claimed; proposed tests require
separate implementation and approved synthetic database access. The formatter
executable was reused from the main checkout; it was invoked from this isolated
worktree and its only target was this report.

**Next issue:** revise the preflight for R1–R7, disposition the actual
compatibility/scope deltas with the owner, then seek human L2a migration/down
review. Keep curriculum source research pending and independent; L3,
provider/trace gates, real-data operations and recall delivery remain closed.
