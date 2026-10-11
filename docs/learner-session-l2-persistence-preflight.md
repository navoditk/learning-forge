# Learner-session L2 persistence preflight

> **Status:** preparation only — design preflight for human migration review.
> **Authorizes:** nothing. No migration, schema, service, route, test, env, or
> data change is authorized by this document. L3 (new end endpoints, SCORED
> session end, provider refusal, learner-visible lifecycle) is **not**
> authorized.
> **Authority:** `docs/learner-session-lifecycle-design.md` (S-01..S-14
> approved, L1 only). Where this preflight and the design differ, the design
> governs until a human amends it; every difference is listed in §13.
> **Revision 2:** corrected for the independent review
> `docs/learner-session-l2-persistence-review.md` (verdict CHANGES REQUIRED,
> R1–R7). Disposition in §0. Author/reviewer model identities are recorded by
> the coordinating session from harness metadata, not by self-identification
> in this document.
> **Revision 3:** corrects the two re-review findings RR-1 (SQL three-valued
> logic in the optional tenant CHECKs, L2a) and RR-2 (malformed-snapshot
> flow and H-02 option A scope, L2b). Owner items H-01/H-02/A-1/C-1 are
> preserved; G-12 and G-13 remain **untested** and are stated conditionally.

## 0. Review disposition (R1–R7)

| Review | Finding (short)                                                               | Correction in this revision                                                                                                                                                         | Kind                                     |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| R1     | Session triple FK can match an existing cross-tenant Session row              | Added `(learnerProfileId, householdId) → LearnerProfile(id, householdId)` FK and a pre-existing-bad-row test (§6, §14)                                                              | Engineering                              |
| R2     | Helper used non-existent names; replay unreachable; actor not from L1         | Real L1 envelope, state loading, L2 already-ended no-op before L1, trusted actor table (§9)                                                                                         | Engineering                              |
| R3     | "End now, backfill later" contradicts complete atomic dual-write              | Option withdrawn; H-02 restated with only atomic, reviewed alternatives (§13)                                                                                                       | **Human disposition (blocks L2b)**       |
| R4     | Old unconditional writer can move `endedAt` after a record is written         | Two-step L2b activation: set-once ends everywhere first, records second (§12)                                                                                                       | Engineering                              |
| R5     | H-03 generic; D-28 effect mis-attributed to review double end                 | Re-derived exact D-28 sequence; "none learner-visible" qualified (§9.4)                                                                                                             | **Owner acknowledgement (blocks L2b)**   |
| R6     | Migration/down transaction boundary assumed, not drafted                      | Explicit `BEGIN`/`COMMIT`, locked down guard, refusal/atomicity tests (§6, §6.1, §14)                                                                                               | Engineering                              |
| R7     | `requestedCount` dropped; profile resolution; Prisma drift; clear tests       | Restored `requestedCount`, removed `sessionIds`; signed profile pin; full Prisma relations (§5, §7, §14)                                                                            | Engineering                              |
| RR-1   | Tenant CHECK evaluates UNKNOWN on a partial-null row; MATCH SIMPLE FK skipped | Explicit `IS NOT NULL` on every optional tenant component in the all-set branches; coupled-CHECK audit; partial-null fixtures (§6, §14)                                             | Engineering                              |
| RR-2   | Mapper parse precedes OPEN test; option A cannot label malformed snapshots    | Raw-`endedAt` no-op first; `MALFORMED_SNAPSHOT` adapter result before L1; step-1/step-2 branches explicit; A restricted to valid snapshots; case (iv) alternatives (§9, §10, §13.1) | Engineering + **H-02 (iv) owner choice** |

Classification rule (review "Human decisions versus inherited engineering"):
S-approved semantics, evidence preservation from first write, synthetic-only
destructive testing, token/secret hygiene and set-once timestamps are
**inherited invariants**, not new votes. Only genuinely new behavior is listed
as a human blocker in §13.

## 1. Scope and pinned baseline

| Item                 | Value                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code baseline        | `HEAD 4f678f5` plus the uncommitted, approved L1 files (`src/contracts/session-lifecycle.ts`, `src/progression/session-lifecycle.ts`, their tests, the lifecycle design doc) |
| Schema head          | `prisma/migrations/0017_add_audit_log` (18 directories; `0007` is duplicated: `0007_add_assessment_attempt_contexts`, `0007_add_shadow_request_context`)                     |
| Next migration name  | **Not chosen.** Written as `<NNNN>_add_session_termination_records`. The number is assigned at merge time against whatever head exists then (see `scripts/db-rollback.sh`)   |
| Concurrent migration | At preflight time no local worktree/branch and no open PR is ahead of `0017`. Re-check immediately before authoring the migration                                            |
| Deploy model         | `npm run db:deploy` runs in Render `buildCommand` while the old instance still serves (`docs/architecture.md` §10.4) — old code can end sessions after the migration commits |
| Database             | Postgres 16 locally (`docker-compose.yml`); production major version **unverified** (gate G-03)                                                                              |

Migration transaction: no existing `migration.sql` contains an explicit
`BEGIN` (the only `BEGIN` in `0001_init` is a PL/pgSQL body), `db:deploy` is
`prisma migrate deploy`, and `scripts/test-migrations.sh` /
`scripts/db-rollback.sh` apply files with `psql -f` without
`--single-transaction`. This preflight therefore does **not** rely on any
implicit wrapper; §6 drafts the boundary explicitly (G-12 verifies the Prisma
interaction on scratch).

L2 per design §10 stage table: "Migration, `down.sql`, export/delete coverage,
backfill, dual-write … inside a small transaction" — learner-visible change
"None". §9.4 records one factual qualification (D-28 eligibility) that the
owner must acknowledge; it is a consequence of approved set-once semantics,
not a new policy.

## 2. Verified facts this proposal depends on

1. `Session.endedAt` is the only lifecycle state today; there is no outcome,
   actor, or reason column (`prisma/schema.prisma` `model Session`).
2. Existing tenant FKs are single-column (`Session.householdId → Household`,
   `Session.learnerProfileId → LearnerProfile`, both `onDelete: Cascade`); no
   constraint proves the learner belongs to the household.
3. `User` and `LearnerProfile` both carry `householdId`; neither has a
   composite unique usable as a composite FK target.
4. Insert-only precedent: `0001_init` `prevent_attempt_update` trigger.
   Retention-guarded down precedent: `0017_add_audit_log/down.sql` raises if
   rows exist. Enum-value removal precedent: `0010/down.sql` type recreate.
   Single-use precedent: `OverrideRecord @@unique([actorUserId, reauthAt])`
   (`0014`).
5. Step-up tokens are `{userId, householdId, issuedAt}` HMAC'd under the
   `step-up:` domain (`src/auth/step-up.ts` `signature`); no purpose, no token
   id. Single use is enforced only through `OverrideRecord(actorUserId,
reauthAt)` (`src/progression/learner-state.ts` ~682–713).
6. `TraceOutcome` = `MOVE_RETURNED | FALLBACK_RETURNED | ERROR`.
   `src/phase1/service.ts` ~877 uses `toUpperCase() as` to produce it — an
   anti-pattern L2 must not extend.
7. `HOUSEHOLD_DATA_MODEL_COVERAGE` (`src/server/household-data.ts` 21–81) is
   checked against Prisma DMMF by the coverage test; any new model without an
   entry fails `npm test`.
8. R7 (`src/progression/recall-suppression.ts`) and the D-28 remediation
   counter (`src/progression/skill-assessment.ts` 212–221) read only
   `Session.endedAt`.
9. L1 `transitionSessionLifecycle(input: unknown)`
   (`src/progression/session-lifecycle.ts` ~185–235) takes one envelope
   `{ context, state, event, at }` (`TRANSITION_INPUT_KEYS`, line 35):
   `context` = `SessionLifecycleTrustedContextSchema`
   `{householdId, learnerProfileId}`; `state` = `SessionLifecycleStateSchema`
   (`OPEN` | `ENDED` with outcome/run status | `ENDED_UNRECORDED`); `event` =
   `SessionLifecycleEventSchema`; `at` = server `Date`. Its END result carries
   `outcome`, `assessmentRunStatus`, `alreadyEnded`, `session` — **no actor**.
   `ENDED_UNRECORDED` + any non-BACKFILL event → `SESSION_ALREADY_ENDED`;
   `ENDED` + different label → `SESSION_ALREADY_ENDED`; `OPEN` + BACKFILL →
   refused.
10. `recordIndependentCheck` (`src/phase1/service.ts` 646–676) checks only
    tenant and a prior tutor interaction; neither it nor `createAttempt`
    checks `endedAt`, kind or assignment binding before the site #1 update.
11. `AbandonAssessmentInput` (`assessment-submission.ts` 567–571) declares only
    `householdId, learnerProfileId, assignmentId`; the route passes
    `{ ...identity, ...parsed.data }` (`src/app/api/progression/assessment/abandon/route.ts:37`),
    so `actorUserId` arrives untyped today.

## 3. Terminal write-site inventory (8 statements)

Every statement that sets `Session.endedAt` today. "L1 outcome" is the label
`transitionSessionLifecycle` must produce for the dual-write.

| #   | File:line / symbol                                                          | Trigger / caller                                                                                                                                                                  | Transaction today                                                                                              | L1 outcome (actor)                                                     | L2 wrapper needed                                                                                              |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `src/phase1/service.ts:386` `createAttempt`                                 | `independentDelayedCheck && CORRECT`; via `recordIndependentCheck` (`POST /api/phase1/check`) and `recordReviewAttempt` (correct review, `reviewDecay: true`, service.ts:439/789) | **None** — bare unconditional `session.update` after attempt insert; no `endedAt`/kind/binding check (fact 10) | `COMPLETED_CHECK_PASSED` (SYSTEM) for open PRACTICE or LEGACY_UNBOUND  | Adapter tx (§9). Skip this end when `input.reviewDecay` (site #3 owns the review end); other mismatches → H-02 |
| 2   | `src/phase1/service.ts:590` `recordDiagnosticAttempt`                       | `POST /api/phase1/diagnostic-attempt`                                                                                                                                             | None — bare update; kind not checked                                                                           | `COMPLETED_ONE_SHOT` (SYSTEM) for open BOUND PLACEMENT                 | Adapter tx (§9); non-PLACEMENT → H-02                                                                          |
| 3   | `src/phase1/service.ts:796` `recordReviewAttempt`                           | `POST /api/phase1/review-attempt`                                                                                                                                                 | None — reads `endedAt`/kind then updates (TOCTOU); lapse paths use separate transactions                       | `COMPLETED_ONE_SHOT` (SYSTEM) for REVIEW                               | New small tx; suppress #1's end on this path                                                                   |
| 4   | `src/progression/assessment-submission.ts:650` `abandonAssessmentRun`       | release-gated `POST /api/progression/assessment/abandon`                                                                                                                          | Serializable; `updateMany … endedAt: null`                                                                     | `ENDED_WITH_ASSIGNMENT` + `ABANDONED` (HOUSEHOLD_USER)                 | Insert record in the existing tx                                                                               |
| 5   | `src/progression/assessment-submission.ts:755` `invalidateAssessmentRun`    | **no production caller** (tests only; operator seam)                                                                                                                              | Serializable; several independent `new Date()` calls                                                           | `ENDED_WITH_ASSIGNMENT` + `INVALIDATED` (OPERATOR)                     | Insert in existing tx; use one `now` for run + session + record                                                |
| 6   | `src/progression/assessment-submission.ts:827` in `expireAssessment` (~766) | `settleAssessmentLease` (`assessment-assignment.ts:182`), `createAssessmentAssignment` (:283), `submitAssessmentItem` (`assessment-submission.ts:328`)                            | Inside caller's Serializable tx; selects only `id`                                                             | `ENDED_WITH_ASSIGNMENT` + `EXPIRED` (SYSTEM)                           | Insert in caller's tx; select `endedAt`/binding columns for the mapper                                         |
| 7   | `src/progression/legacy-session-drain.ts:66` `drainUnboundLegacySessions`   | `scripts/drain-unbound-sessions.ts` (operator)                                                                                                                                    | Default isolation; `findMany` then conditional `updateMany` (`endedAt: null`), no count check                  | `DRAINED_BY_OPERATOR` (OPERATOR) — **only** L1 `LEGACY_UNBOUND` (H-01) | Explicit-ID adapter calls; assert updated count; scope per H-01                                                |
| 8   | `scripts/run-progression-shadow-pilot.ts:37`                                | staging-only synthetic pilot (`SYNTHETIC_IDENTITY`)                                                                                                                               | `updateMany` ending kind-set PRACTICE/REVIEW sessions directly                                                 | **No L1 label fits**                                                   | Remove the end and the `closedSessionCount` output (line 51) — engineering cleanup, H-05                       |

Counts: **8 statements in 8 code locations: 7 runtime statements in 7
functions** (the `expireAssessment` helper has 3 callers) **+ 1 staging
script**. (Revision 1 said "6 functions" — a count error.) Not terminal sites
(verified): `startSession`
(`service.ts:160`, creates), `deleteHouseholdData`
(`src/server/household-data.ts` ~290, deletes rows), `recordTutorResponse`
(no end), `submitAssessmentItem` SCORED path (does **not** end the session —
that is an L3 fix per design §10, not folded into L2).

## 4. Layer and lifetime separation

| Layer                     | Mutability                                                                                                            | Lifetime                                                              | Owner                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| `Session.endedAt`         | Set once by conditional update (`WHERE endedAt IS NULL`) from L2b step 1; never cleared (today sites #1–#3 overwrite) | Session row lifetime; deleted only by household deletion              | Existing writers via the §9 adapter        |
| `SessionTermination`      | Insert-only; trigger blocks `UPDATE`; one row per session                                                             | Same as session; deleted only by `deleteHouseholdData` before Session | §9 adapter (L2b step 2), backfill, S-07 op |
| `SessionClearRequest`     | Insert-only; trigger blocks `UPDATE`                                                                                  | Household lifetime (adult evidence); deleted only by household delete | **L3** clear writer (no writer in L2)      |
| L1 contracts / transition | Pure; no I/O, no Prisma types                                                                                         | n/a                                                                   | `src/contracts`, `src/progression`         |

Rules: terminal records carry no free text, no prompts, no tokens. They are
not mastery evidence, not parent-display claims (S-14: export only), and are
not read by R7, D-28, or mastery code in L2. The L1 layer-separation tests
remain the guard; L2 adds a DB-boundary mapper in the persistence layer only.

## 5. Proposed Prisma schema (draft — doc only)

```prisma
enum SessionLifecycleOutcome {
  COMPLETED_CHECK_PASSED
  COMPLETED_ONE_SHOT
  ABANDONED_BY_REQUEST
  CLEARED_BY_ADULT
  ENDED_WITH_ASSIGNMENT
  DRAINED_BY_OPERATOR
  LEGACY_UNRECORDED
}

enum SessionTerminationActorKind {
  HOUSEHOLD_USER
  STEP_UP_ADULT
  SYSTEM
  OPERATOR
}

model SessionTermination {
  id                    String                      @id @default(uuid())
  householdId           String
  learnerProfileId      String
  sessionId             String                      @unique
  outcome               SessionLifecycleOutcome
  assessmentRunStatus   AssessmentRunStatus?
  actorKind             SessionTerminationActorKind
  actorUserId           String?
  actorHouseholdId      String? // CHECK: null iff actorUserId null, else = householdId
  clearRequestId        String?
  clearHouseholdId      String? // CHECK: null iff clearRequestId null, else = householdId
  clearLearnerProfileId String? // CHECK: null iff clearRequestId null, else = learnerProfileId
  endedAt               DateTime
  createdAt             DateTime                    @default(now())

  session        Session              @relation("SessionTerminationSession", fields: [sessionId, householdId, learnerProfileId], references: [id, householdId, learnerProfileId], onDelete: Restrict, onUpdate: Restrict)
  learnerProfile LearnerProfile       @relation("SessionTerminationLearner", fields: [learnerProfileId, householdId], references: [id, householdId], onDelete: Restrict, onUpdate: Restrict)
  actorUser      User?                @relation("SessionTerminationActor", fields: [actorUserId, actorHouseholdId], references: [id, householdId], onDelete: Restrict, onUpdate: Restrict)
  clearRequest   SessionClearRequest? @relation("SessionTerminationClear", fields: [clearRequestId, clearHouseholdId, clearLearnerProfileId], references: [id, householdId, learnerProfileId], onDelete: Restrict, onUpdate: Restrict, map: "SessionTermination_clear_fkey")

  @@index([householdId, learnerProfileId, endedAt])
  @@index([actorUserId, actorHouseholdId])
  @@index([clearRequestId, clearHouseholdId, clearLearnerProfileId], map: "SessionTermination_clear_idx")
}

model SessionClearRequest {
  id                   String   @id @default(uuid())
  householdId          String
  learnerProfileId     String // implementation of learner-scoped clear auth (H-06)
  actorUserId          String
  reauthAt             DateTime
  requestedCount       Int // design §8; CHECK >= 1; no maximum invented
  stepUpTokenDigest    String   @unique
  policyProfileCode    String // D-47 pin resolved at issuance (§7)
  policyProfileVersion String
  createdAt            DateTime @default(now())

  learnerProfile LearnerProfile       @relation("SessionClearRequestLearner", fields: [learnerProfileId, householdId], references: [id, householdId], onDelete: Restrict, onUpdate: Restrict)
  actorUser      User                 @relation("SessionClearRequestActor", fields: [actorUserId, householdId], references: [id, householdId], onDelete: Restrict, onUpdate: Restrict)
  terminations   SessionTermination[] @relation("SessionTerminationClear")

  @@unique([actorUserId, reauthAt])
  @@unique([id, householdId, learnerProfileId])
}

// Additions to existing models (composite targets + back-relations only):
// model Session        { … terminations SessionTermination[] @relation("SessionTerminationSession")
//                        @@unique([id, householdId, learnerProfileId]) }
// model LearnerProfile { … sessionTerminations  SessionTermination[]  @relation("SessionTerminationLearner")
//                        sessionClearRequests SessionClearRequest[] @relation("SessionClearRequestLearner")
//                        @@unique([id, householdId]) }
// model User           { … actedSessionTerminations SessionTermination[]  @relation("SessionTerminationActor")
//                        sessionClearRequests     SessionClearRequest[] @relation("SessionClearRequestActor")
//                        @@unique([id, householdId]) }
```

Representation notes (engineering, verified by G-13 `prisma validate` and a
`prisma migrate diff --from-migrations … --to-schema-datamodel …` zero-drift
check on scratch at authoring; neither was run here because no schema file
may be written):

- The `actorHouseholdId` / `clearHouseholdId` / `clearLearnerProfileId`
  columns are a **candidate** representation, not a verified necessity. The
  working assumption (unverified until G-13) is that Prisma requires an
  optional relation's scalar fields to be all optional, so a nullable
  composite FK reusing required `householdId` could not be an optional
  Prisma relation. CHECKs (§6) pin them equal to the row tenant, so they add
  no new data. If G-13 shows Prisma accepts the mixed form, drop them and
  the corresponding CHECK branches.
- `Session` back-relation is a list because the relation's scalar set
  `(sessionId, householdId, learnerProfileId)` is not itself unique; one row
  per session is enforced by `sessionId @unique`.
- CHECKs and triggers are not representable in Prisma; they are asserted by
  SQL catalog tests (§14), not by migrate diff.
- Default Prisma names that would exceed PostgreSQL's 63-byte identifier
  limit use explicit `map:` names (`SessionTermination_clear_fkey`,
  `SessionTermination_clear_idx`); all other SQL names match Prisma defaults.
- Revision 1's `sessionIds TEXT[]` is removed: design §8 specifies
  `requestedCount`; the sessions actually ended by a clear are identified by
  their `SessionTermination.clearRequestId`, so no extra ID list is stored.

`assessmentRunStatus` reuses the existing `AssessmentRunStatus` enum. The
outcome enum freezes the seven L1 labels already in
`SessionLifecycleOutcomeSchema` (`src/contracts/session-lifecycle.ts` ~54),
which S-approved L1 implements; a parity test (§14) and migration review are
required, but the labels are not reopened.

## 6. Draft migration SQL (illustration — not a migration file)

```sql
-- <NNNN>_add_session_termination_records/migration.sql (DRAFT)
-- Explicit boundary: the whole migration commits or nothing does. G-12
-- confirms on scratch how `prisma migrate deploy` treats an explicit
-- BEGIN/COMMIT; if Prisma already wraps the file, the reviewed form drops these
-- two lines instead of nesting. Never rely on an unverified implicit wrapper.
BEGIN;

-- Composite FK targets on existing tables. Plain CREATE UNIQUE INDEX holds a
-- SHARE lock (blocks INSERT/UPDATE/DELETE on that table) until COMMIT.
-- CONCURRENTLY cannot run inside a transaction block (H-13 / G-04).
CREATE UNIQUE INDEX "LearnerProfile_id_householdId_key" ON "LearnerProfile"("id", "householdId");
CREATE UNIQUE INDEX "User_id_householdId_key" ON "User"("id", "householdId");
CREATE UNIQUE INDEX "Session_id_householdId_learnerProfileId_key"
  ON "Session"("id", "householdId", "learnerProfileId");

CREATE TYPE "SessionLifecycleOutcome" AS ENUM ('COMPLETED_CHECK_PASSED',
  'COMPLETED_ONE_SHOT', 'ABANDONED_BY_REQUEST', 'CLEARED_BY_ADULT',
  'ENDED_WITH_ASSIGNMENT', 'DRAINED_BY_OPERATOR', 'LEGACY_UNRECORDED');
CREATE TYPE "SessionTerminationActorKind" AS ENUM ('HOUSEHOLD_USER',
  'STEP_UP_ADULT', 'SYSTEM', 'OPERATOR');

CREATE TABLE "SessionClearRequest" (
  "id" TEXT PRIMARY KEY,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "reauthAt" TIMESTAMP(3) NOT NULL,
  "requestedCount" INTEGER NOT NULL,
  "stepUpTokenDigest" TEXT NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionClearRequest_digest_format"
    CHECK ("stepUpTokenDigest" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "SessionClearRequest_requestedCount_positive" CHECK ("requestedCount" >= 1),
  CONSTRAINT "SessionClearRequest_learnerProfileId_householdId_fkey"
    FOREIGN KEY ("learnerProfileId", "householdId")
    REFERENCES "LearnerProfile"("id", "householdId") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "SessionClearRequest_actorUserId_householdId_fkey"
    FOREIGN KEY ("actorUserId", "householdId")
    REFERENCES "User"("id", "householdId") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "SessionClearRequest_stepUpTokenDigest_key"
  ON "SessionClearRequest"("stepUpTokenDigest");
CREATE UNIQUE INDEX "SessionClearRequest_actorUserId_reauthAt_key"
  ON "SessionClearRequest"("actorUserId", "reauthAt");
CREATE UNIQUE INDEX "SessionClearRequest_id_householdId_learnerProfileId_key"
  ON "SessionClearRequest"("id", "householdId", "learnerProfileId");

CREATE TABLE "SessionTermination" (
  "id" TEXT PRIMARY KEY,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "outcome" "SessionLifecycleOutcome" NOT NULL,
  "assessmentRunStatus" "AssessmentRunStatus",
  "actorKind" "SessionTerminationActorKind" NOT NULL,
  "actorUserId" TEXT,
  "actorHouseholdId" TEXT,
  "clearRequestId" TEXT,
  "clearHouseholdId" TEXT,
  "clearLearnerProfileId" TEXT,
  "endedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Session attribution: the record names exactly the session's own triple.
  CONSTRAINT "SessionTermination_sessionId_householdId_learnerProfileId_fkey"
    FOREIGN KEY ("sessionId", "householdId", "learnerProfileId")
    REFERENCES "Session"("id", "householdId", "learnerProfileId")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  -- R1: learner membership. Session's own FKs are single-column, so a legacy
  -- Session row may pair household A with a learner of household B; this FK
  -- refuses a record for such a row even when no actor/clear FK applies.
  CONSTRAINT "SessionTermination_learnerProfileId_householdId_fkey"
    FOREIGN KEY ("learnerProfileId", "householdId")
    REFERENCES "LearnerProfile"("id", "householdId")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  -- MATCH SIMPLE skips a FK when any column is NULL, and a CHECK that
  -- evaluates to UNKNOWN is accepted. The tenant CHECKs below therefore test
  -- every optional component with explicit IS NOT NULL before any equality,
  -- so each branch is TRUE/FALSE (never UNKNOWN) and the optional FKs are
  -- all-null or all-set and equal to the row tenant (RR-1).
  CONSTRAINT "SessionTermination_actorUserId_actorHouseholdId_fkey"
    FOREIGN KEY ("actorUserId", "actorHouseholdId")
    REFERENCES "User"("id", "householdId") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "SessionTermination_clear_fkey"
    FOREIGN KEY ("clearRequestId", "clearHouseholdId", "clearLearnerProfileId")
    REFERENCES "SessionClearRequest"("id", "householdId", "learnerProfileId")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "SessionTermination_actor_tenant" CHECK (
    ("actorUserId" IS NULL AND "actorHouseholdId" IS NULL)
    OR ("actorUserId" IS NOT NULL AND "actorHouseholdId" IS NOT NULL
        AND "actorHouseholdId" = "householdId")),
  CONSTRAINT "SessionTermination_clear_tenant" CHECK (
    ("clearRequestId" IS NULL AND "clearHouseholdId" IS NULL AND "clearLearnerProfileId" IS NULL)
    OR ("clearRequestId" IS NOT NULL AND "clearHouseholdId" IS NOT NULL
        AND "clearLearnerProfileId" IS NOT NULL
        AND "clearHouseholdId" = "householdId"
        AND "clearLearnerProfileId" = "learnerProfileId")),
  CONSTRAINT "SessionTermination_actor_user_presence" CHECK (
    ("actorUserId" IS NOT NULL) = ("actorKind" IN ('HOUSEHOLD_USER', 'STEP_UP_ADULT'))),
  CONSTRAINT "SessionTermination_clear_presence" CHECK (
    ("outcome" = 'CLEARED_BY_ADULT') = ("clearRequestId" IS NOT NULL)
    AND ("outcome" = 'CLEARED_BY_ADULT') = ("actorKind" = 'STEP_UP_ADULT')),
  CONSTRAINT "SessionTermination_run_status_presence" CHECK (
    ("outcome" = 'ENDED_WITH_ASSIGNMENT') = ("assessmentRunStatus" IS NOT NULL)
    AND ("assessmentRunStatus" IS NULL OR "assessmentRunStatus" IN
      ('SCORED', 'EXPIRED', 'ABANDONED', 'INVALIDATED'))),
  CONSTRAINT "SessionTermination_outcome_actor" CHECK (
    ("outcome" IN ('COMPLETED_CHECK_PASSED', 'COMPLETED_ONE_SHOT', 'LEGACY_UNRECORDED')
       AND "actorKind" = 'SYSTEM')
    OR ("outcome" = 'ABANDONED_BY_REQUEST' AND "actorKind" = 'HOUSEHOLD_USER')
    OR ("outcome" = 'CLEARED_BY_ADULT' AND "actorKind" = 'STEP_UP_ADULT')
    OR ("outcome" = 'DRAINED_BY_OPERATOR' AND "actorKind" = 'OPERATOR')
    OR ("outcome" = 'ENDED_WITH_ASSIGNMENT' AND (
         ("assessmentRunStatus" = 'ABANDONED' AND "actorKind" = 'HOUSEHOLD_USER')
      OR ("assessmentRunStatus" IN ('EXPIRED', 'SCORED') AND "actorKind" = 'SYSTEM')
      OR ("assessmentRunStatus" IN ('INVALIDATED', 'SCORED') AND "actorKind" = 'OPERATOR'))))
);
CREATE UNIQUE INDEX "SessionTermination_sessionId_key" ON "SessionTermination"("sessionId");
CREATE INDEX "SessionTermination_householdId_learnerProfileId_endedAt_idx"
  ON "SessionTermination"("householdId", "learnerProfileId", "endedAt");
CREATE INDEX "SessionTermination_actorUserId_actorHouseholdId_idx"
  ON "SessionTermination"("actorUserId", "actorHouseholdId");
CREATE INDEX "SessionTermination_clear_idx"
  ON "SessionTermination"("clearRequestId", "clearHouseholdId", "clearLearnerProfileId");

CREATE FUNCTION prevent_session_record_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% rows are immutable', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "SessionTermination_immutable" BEFORE UPDATE ON "SessionTermination"
  FOR EACH ROW EXECUTE FUNCTION prevent_session_record_update();
CREATE TRIGGER "SessionClearRequest_immutable" BEFORE UPDATE ON "SessionClearRequest"
  FOR EACH ROW EXECUTE FUNCTION prevent_session_record_update();

COMMIT;
```

The `SCORED` arms exist for L3's scorer (SYSTEM) and the reviewed S-07
operation (OPERATOR); no L2 runtime writer produces `SCORED`.

Three-valued-logic audit (RR-1): every other CHECK is total over its inputs.
`outcome` and `actorKind` are `NOT NULL`, and the remaining operands are
`IS [NOT] NULL` tests, so `actor_user_presence`, `clear_presence` and
`run_status_presence` evaluate only to TRUE/FALSE. In `outcome_actor`, the
`ENDED_WITH_ASSIGNMENT` arm can be UNKNOWN only when `assessmentRunStatus`
is NULL, and `run_status_presence` is then FALSE, so the row is rejected.
`requestedCount` and `stepUpTokenDigest` are `NOT NULL`. A correctly
specified `MATCH FULL` FK or equivalent total-boolean CHECKs are acceptable
engineering alternatives; they may not admit any partial-null tenant row.

Deliberately **not** in SQL (enforced by the L2b adapter and named tests,
§14; a constraint trigger is an engineering alternative that may not relax
any of them): `SessionTermination.endedAt = Session.endedAt`;
`ENDED_WITH_ASSIGNMENT` requires `Session.assignmentId` non-null and the
recorded status equal to that run's terminal status; `actorUserId` is a
PARENT-role user; a clear termination's `actorUserId` equals its request's
`actorUserId`; at most `requestedCount` terminations reference one request.
No `endedAt <= createdAt` CHECK: `CURRENT_TIMESTAMP` is transaction start
while `endedAt` is the app clock. `ON DELETE RESTRICT` (not Cascade) is
intentional: a terminal record must never vanish as a side effect.

### 6.1 Illustrative `down.sql` (scratch-only evidence)

```sql
-- Applied by `psql -v ON_ERROR_STOP=1 -f` (scripts/test-migrations.sh:46,
-- scripts/db-rollback.sh:33) with no --single-transaction, so the boundary is
-- explicit. On any error psql stops and the open transaction rolls back on
-- disconnect: nothing is dropped and no row is lost.
BEGIN;
-- Documented lock order: child (SessionTermination) before parent
-- (SessionClearRequest). ACCESS EXCLUSIVE blocks concurrent inserts between
-- the emptiness check and the drops.
LOCK TABLE "SessionTermination" IN ACCESS EXCLUSIVE MODE;
LOCK TABLE "SessionClearRequest" IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "SessionTermination")
     OR EXISTS (SELECT 1 FROM "SessionClearRequest") THEN
    RAISE EXCEPTION 'Refusing to drop session terminal records: rows exist; use forward repair';
  END IF;
END $$;
DROP TRIGGER "SessionTermination_immutable" ON "SessionTermination";
DROP TRIGGER "SessionClearRequest_immutable" ON "SessionClearRequest";
DROP FUNCTION prevent_session_record_update();
DROP TABLE "SessionTermination";
DROP TABLE "SessionClearRequest";
DROP TYPE "SessionTerminationActorKind";
DROP TYPE "SessionLifecycleOutcome";
DROP INDEX "Session_id_householdId_learnerProfileId_key";
DROP INDEX "User_id_householdId_key";
DROP INDEX "LearnerProfile_id_householdId_key";
COMMIT;
```

The `_prisma_migrations` row is deleted by the script in a separate command
after `down.sql` succeeds (`scripts/test-migrations.sh:47`); a refused down
leaves it intact. No `TraceOutcome` change is in this migration (§11).

Evidence required later (not run here): (a) round trip on the empty scratch
DB via `npm run test:migrations` — forward → every `down.sql` in reverse →
forward, identical `pg_dump`; (b) **synthetic** nonempty refusal: insert one
synthetic termination on scratch, run this `down.sql`, assert it fails and the
row, tables and types still exist; (c) injected forward failure (e.g. a
deliberately failing final statement in a scratch-only copy) leaves no new
index, type or table. `scripts/test-migrations.sh` covers (a) only; (b) and
(c) need a reviewed harness. That script also calls `mktemp -d` (line 14);
a reviewed project-local scratch directory accommodation is required before
any run in an environment that forbids system temp paths. Production after
the first write: **forward repair only**; no down, no audit destruction
(S-12 inherited invariant).

## 7. SESSION_CLEAR token identity and consumption (design for L3; schema in L2a)

- **Purpose binding.** A distinct v2 clear token: signing domain e.g.
  `step-up:session-clear:v1:`, payload `{purpose: 'SESSION_CLEAR', tokenId
(random ≥128-bit), userId, householdId, learnerProfileId, policyProfileCode,
policyProfileVersion, issuedAt}`. Override verification rejects it; clear
  verification rejects existing purpose-less override tokens (design §8).
  Purpose rejection alone prevents one credential authorizing both consumers;
  no cross-purpose timestamp ledger is needed.
- **D-47 lifetime context.** The issuer resolves the learner's profile pin
  through the existing trusted server resolution and **signs** it; the
  consumer recomputes the D-47 age check against the lifetime of that signed
  pin and persists the same pin. D-47's value and profile-selection policy
  are unchanged; how a learner without a resolvable pin is handled (today's
  override route uses the grade-6-math default) is an L3 review point that
  this preflight does not decide.
- **Identity vs timestamp.** `stepUpTokenDigest` = SHA-256 hex of
  domain-prefixed `tokenId` — the consumption identity; it is a hash of a
  random identifier, not a raw bearer token or secret. `@@unique([actorUserId,
reauthAt])` is retained because design §8 names it; it is a second guard,
  not the identity.
- **Consumption = effect.** Insert of `SessionClearRequest` (consumes digest,
  records `requestedCount`), conditional ends and `SessionTermination` rows
  commit in **one** transaction; a unique violation or any failed end/insert
  aborts the whole clear, leaving the token unconsumed.
- **Storage hygiene.** Raw token, signature, and secret are never stored,
  logged, traced, exported, or put in prompts. Digest is excluded from export
  (data minimization; G-08).
- **No route now.** No verifier, issuer change, or endpoint ships in L2; the
  pre-C4 clear route stays unexposed. S-04 approved the purpose-specific clear
  step-up; shipping it waits for L3 approval. L2a only creates the table.

## 8. Privacy, export, delete coverage (must land with the schema, before any writer)

| Concern           | L2a change                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage list     | Add `SessionTermination` and `SessionClearRequest` to `HOUSEHOLD_DATA_MODEL_COVERAGE` (`src/server/household-data.ts` 21–81); DMMF coverage test enforces it                                                                                                                                                                                                                                                                              |
| Export            | Explicit `select` for both; exclude `stepUpTokenDigest`; enums exported as labels; no display surface (S-14). Test the actual household-scoped export output (two synthetic households), not only DMMF list membership                                                                                                                                                                                                                    |
| Delete order      | In `deleteHouseholdData`: `SessionTermination` → `SessionClearRequest` → existing Session/LearnerProfile/User deletes (RESTRICT FKs make order mandatory). Keep the existing AuditLog behaviour (`household-data.ts` 295–310: write `HOUSEHOLD_DELETE`, then anonymize household/user ids; never cascade-delete audit rows). Keep `deleteHouseholdEvidence` delegating to `deleteHouseholdData`                                           |
| Privacy inventory | Add two rows to `docs/privacy-inventory.md` table (near the `OverrideRecord` row) — purpose, fields, retention = household lifetime, no free text                                                                                                                                                                                                                                                                                         |
| Test cleanup      | Cascade-based cleanups will fail once records exist under RESTRICT: `tests/persistence/persistence.test.ts:53`, `tests/phase1/vertical-slice.test.ts:45`, `tests/phase1/safety-alert.test.ts:72`, `tests/phase1/tutor-usage.test.ts:33`, and the direct `session.deleteMany` at `tests/progression-integration/skill-assessment.test.ts:119` (its `afterAll` at :134 already uses the deletion service) → switch to `deleteHouseholdData` |
| Secrets           | No raw tokens, no prompts, no free text in either table; fixtures use synthetic UUIDs (`00000000-0000-4000-8000-…`)                                                                                                                                                                                                                                                                                                                       |

## 9. DB-boundary adapter and dual-write contract (L2b)

### 9.1 State loading and mapper (persistence layer, not `src/contracts`)

Inside the writer's transaction, load the Session row by
`(id, householdId, learnerProfileId)` with `SELECT … FOR UPDATE` (Phase 1
adapter transactions) or within the existing Serializable transaction
(assignment sites), plus its `SessionTermination` row if any. Map to a
`SessionLifecycleStateSchema` value:

| Row                                   | L1 state                                              |
| ------------------------------------- | ----------------------------------------------------- |
| `endedAt IS NULL`                     | `OPEN`                                                |
| `endedAt` set, termination row exists | `ENDED` with stored `outcome` / `assessmentRunStatus` |
| `endedAt` set, no termination row     | `ENDED_UNRECORDED`                                    |

Snapshot binding: `assignmentId` set → `ASSIGNMENT`; null `activityKind` →
`LEGACY_UNBOUND`; else `BOUND`. Dates stay Prisma `Date` objects; no JSON
round trip, no `as` casts. `context` is the server-resolved
`{householdId, learnerProfileId}`; `at` is one server `Date` per operation.
Events are built by server code from trusted values (never request bodies).

Mapper result (RR-2): `{ ok: true, state }` when the candidate parses with
`SessionLifecycleStateSchema`, otherwise
`{ ok: false, reason: 'MALFORMED_SNAPSHOT' }`. Parse failure is a distinct **adapter** result,
produced before any transition is attempted; it is not an L1 outcome and is
never coerced into one. It is the same class of row L1 itself refuses as
`MALFORMED_STATE` (`session-lifecycle.ts:194–195`), so L1 validation is
neither duplicated with different rules nor bypassed.

### 9.2 Adapter algorithm `endSessionWithRecord(tx, { context, sessionId, event, actor, at })`

1. Lock the row (9.1). **Already-ended compatibility, scoped deliberately:**
   if the raw `endedAt` column is non-null, return `ALREADY_ENDED` without
   mapping the snapshot, without calling L1 and without writing. This is
   decided from `endedAt` alone, so it applies equally to valid and
   malformed ended rows and persists nothing about either. It is the L2
   adapter's compatibility no-op: today's Phase 1 writers succeed on ended
   sessions, and L2 must not introduce L3's `SESSION_ENDED` refusal. L1's
   absorbing-terminal and replay rules are not weakened — L1 is simply not
   asked to perform an end on an ended row.
2. Map the open row (9.1). On `MALFORMED_SNAPSHOT` → no write; return the
   site's malformed disposition: for Phase 1 sites #1/#2 the H-02 case (iv)
   disposition (§13.1); for assignment sites #4–#6 abort the transaction
   (those sites already load a valid assignment-bound row, so this is a
   programming/data error); for drain #7 no write, and the row's handling
   (left open and reported under H-01 option A, or otherwise) is part of the
   H-01 disposition.
3. Call `transitionSessionLifecycle({ context, state, event, at })`. On
   `END` → step 4. On refusal → the site's compatibility disposition: for
   Phase 1 sites #1/#2 the H-02 disposition; for assignment sites and drain
   a refusal is a programming/scope error and aborts the transaction (no
   learner-facing change, because those sites already validate binding).
4. `UPDATE "Session" SET "endedAt" = at WHERE id = … AND "endedAt" IS NULL`.
   Expect count 1 (row lock / Serializable). Count 0 means a concurrent end
   won: under `FOR UPDATE` it cannot happen after step 1; under Serializable
   the loser normally fails with a serialization error and commits nothing.
   The adapter never promises `ALREADY_ENDED` for every isolation level and
   adds **no** automatic retry policy.
5. **L2b step 1 (record insert disabled):** return `ENDED` here; the
   transaction contains only the conditional end. **L2b step 2:** insert
   `SessionTermination` with exactly L1's `outcome` / `assessmentRunStatus`,
   `endedAt = at`, and the **trusted actor** from 9.3, in the same
   transaction as step 4. Any insert failure rolls back step 4. Unique
   `sessionId` is the final backstop.

No step writes any row for a snapshot that failed mapping or that L1
refused, unless the owner selects H-02 option A for a structurally valid
refused case (§13.1). Nothing is silently repaired, relabelled or
backfilled at write time, and L1 is not amended by this adapter.

### 9.3 Trusted actor mapping (from caller context, never from the L1 outcome)

| Site                     | `actorKind`      | `actorUserId` source                                                                                                                                                                    |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1 check pass            | `SYSTEM`         | null                                                                                                                                                                                    |
| #2 diagnostic, #3 review | `SYSTEM`         | null                                                                                                                                                                                    |
| #4 abandon               | `HOUSEHOLD_USER` | Authenticated `actorUserId` from `requireHouseholdContext`; L2b adds it to `AbandonAssessmentInput` (fact 11) and tests that the route propagates it; missing → refuse before any write |
| #5 invalidate            | `OPERATOR`       | null — no operator identity system exists; none is invented                                                                                                                             |
| #6 expire                | `SYSTEM`         | null                                                                                                                                                                                    |
| #7 drain                 | `OPERATOR`       | null                                                                                                                                                                                    |
| Backfill                 | `SYSTEM`         | null                                                                                                                                                                                    |
| S-07 operation           | `OPERATOR`       | null                                                                                                                                                                                    |

Operator identifiers are never written into `actorUserId`, which is reserved
for household users (FK to `User`).

### 9.4 Per-site placement and the D-28 eligibility correction

- **Phase 1 (#1–#3).** New short adapter transaction containing only state
  load + end + record, after the existing attempt write. Attempt ↔ end
  atomicity and shared continuation ordering (design §7) stay L3. Site #1
  skips its end when `input.reviewDecay` is true (service.ts:439/789);
  site #3 is the single REVIEW end. A `/check` pass against a REVIEW row
  without `reviewDecay` is **not** suppressed — it is an H-02 case.
- **Assignment (#4–#6).** Adapter inside the existing Serializable
  transaction. `expireAssessment` selects `endedAt` and binding columns. #5
  uses one `now` for run, lease, session and record.
- **Drain (#7).** Explicit-ID adapter calls; assert updated count equals the
  selected count; scope per H-01.
- No new kind ends, no auto-end of new kinds; SCORED end stays L3.

**D-28 consequence of set-once `endedAt` (re-derived from source).** The
counter (`src/progression/skill-assessment.ts` 212–221) counts PRACTICE
sessions for the skill's content with `endedAt > remediationStartedAt` and
**any** correct `MASTERY_CHECK` attempt, with no attempt-time filter.
Today's reachable sequence:

1. PRACTICE session S has a correct `MASTERY_CHECK`; site #1 ends it at T0.
2. A delayed-check failure or lapse starts remediation at T1 > T0
   (`delayedCheckRemediationStart`, ~289).
3. The learner submits another correct check on S at T2 > T1 —
   `recordIndependentCheck` (service.ts 646–676) checks only tenant and a
   prior tutor interaction, not `endedAt` (fact 10).
4. Site #1 overwrites `S.endedAt = T2`.
5. The counter now counts S as practice completed after remediation, using
   the pre-remediation correct check.

Under L2's conditional end, S keeps `endedAt = T0`, so S no longer satisfies
the counter and reassessment eligibility can stay
`REMEDIATION_PRACTICE_REQUIRED` where it is eligible today. This is an
**observable eligibility change**, so the stage table's "None
learner-visible" is qualified for this path only. It corrects the counter
toward the approved D-28 meaning (one practice session completed since
remediation); no D-21/D-28 value changes and no threshold is introduced.
Preserving today's overwrite is not offered: it would break approved
set-once/terminal-absorbing semantics and S-06's `endedAt` equality.
REVIEW is excluded by `activityKind: 'PRACTICE'`, so the review double end
has no D-28 effect. Diagnostic overwrite (#2) on an ended PRACTICE row is
blocked in practice by its "mastery already exists" guard (service.ts
~564–577). **Owner acknowledgement A-1 is required before L2b** (§13).

Related existing limitation, recorded not fixed: an operator-drained PRACTICE
row carrying an earlier correct check can satisfy the counter, although
D-28's note says drains must not count. Narrowing the drain to L1
`LEGACY_UNBOUND` (H-01 option A) removes kind-set PRACTICE from drain scope;
tests cover the interaction. Reading termination outcomes inside D-28 would
break L2's layer separation and needs its own scoped decision.

## 10. Backfill and S-07 operation (L2b tooling; separate production approval)

- **Backfill (LEGACY_UNRECORDED).** Idempotent reviewed script, dry-run by
  default, prints counts only. Precondition: L2b step 2 (§12) fully deployed
  on every instance, so no writer can still create an unrecorded end. For
  each `endedAt IS NOT NULL` session lacking a record: load state as
  `ENDED_UNRECORDED` (§9.1), call L1 with `{kind: 'BACKFILL'}` (L1 keeps the
  historical `endedAt`), insert `LEGACY_UNRECORDED`, `actorKind SYSTEM`.
  The label means "legacy unknown evidence": no outcome inferred, no mastery
  or parent claim. Re-run is a no-op via unique `sessionId`. Rows whose
  snapshot fails mapping (`MALFORMED_SNAPSHOT`, §9.1) or that L1 refuses
  (malformed pins/dates/binding → `MALFORMED_STATE`) are **counted and
  reported by id, never repaired or relabelled**; L1 `BACKFILL` validates
  the snapshot exactly as any other event, so a populated `endedAt` does
  not make a malformed row labelable. The run stops for review
  rather than inferring completion. Backfill never touches open sessions and
  is not a substitute for a live writer.
- **S-07 open sessions of terminal runs.** Separate explicit-ID operator
  operation (no bulk inference): for listed open sessions whose run is
  terminal (chiefly SCORED), set `endedAt = operation time` (no historical
  timestamp) and record `ENDED_WITH_ASSIGNMENT` + run status, actor OPERATOR.
  Recommended at or after L3 (once SCORED stops leaving sessions open).
- Neither is executed in production by this work.

## 11. Trace outcome (S-08) — L2 vs L3

S-08 needs a distinct trace outcome for a provider result discarded because
the session ended. Proposed value `DISCARDED_SESSION_ENDED`. Its **writer is
L3**. It is not a provider refusal; any future refusal value is a separate
proposal (none here). L2 makes no provider change. `src/phase1/tutor-usage.ts`
counts all traces regardless of outcome (usage accounting automatic);
`tutor-usage-report.ts:79` counts only `ERROR`. Disposition (inherited, not
a vote): S-08's semantics are approved; the enum value and its writer are
deferred together to the separately reviewed L3 migration, so L2a adds no
unused `TraceOutcome` value and no type-recreate down. No provider behavior
changes in L2.

## 12. Staging and activation

| Stage          | Contents                                                                                                                                                                                                                | Safe intermediate?                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **L2a**        | Migration (§6) + down; Prisma models/relations; coverage list; export; delete order; privacy-inventory rows; test-cleanup fixes; state mapper + unit tests; enum-parity and SQL-catalog tests. **No writer**            | Yes — tables empty; delete/export already handle them; no behavior change                          |
| **L2b step 1** | All 7 runtime sites call the §9 adapter: state load, already-ended no-op, conditional set-once end, H-02/H-01 dispositions. **Record insert disabled.** Shadow-pilot end removed (#8)                                   | Yes — no records exist yet, so no record can disagree with `endedAt`; D-28 delta (A-1) starts here |
| **L2b step 2** | Record insert enabled at every site at once (second deploy, or one server-side literal-true activation flag in the style of `src/server/recall-cards-flag.ts`, default off). Backfill and S-07 tooling shipped, not run | Yes — see R4 analysis below                                                                        |

**R4 rolling-deploy analysis.** Render keeps the old instance serving while
the new one starts (§1). If record writing shipped in the same deploy that
first made ends conditional, an old instance could run today's unconditional
site #1 after a new instance recorded T1, moving `Session.endedAt` to T2 while
the immutable record says T1, and backfill would skip it. Step 1 removes
every unconditional writer from the fleet **before** any record exists; in
the step 2 overlap every live writer is conditional, so a recorded `endedAt`
can never be overwritten. Ends performed by step-1 instances during the
bounded step-2 overlap are `ENDED_UNRECORDED` rows produced by
pre-activation code and are labelled by the S-07 backfill after step 2 is
fully live (confirmation C-1, §13). Activation order is engineering;
it enables no L3 refusal and rejects no old-client request.

Unsafe and excluded: any writer before coverage/delete order (household
delete would hit RESTRICT); record writing at a subset of sites; record
writing before step 1 is fleet-wide; backfill before step 2 is fleet-wide.
One issue per stage. No stage adds routes or UI.

## 13. Human decisions versus inherited engineering

### 13.1 Remaining human items (block **L2b only**; none blocks L2a)

| ID   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Reviewed alternatives (no new numbers; no recommendation is an approval)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-01 | **Drain scope.** Design §3 inventory row ends "open unbound" sessions via `isUnboundSession`, which also matches kind-set rows with a null target or null profile pin (including PRACTICE) and unassigned PLACEMENT/REVIEW/assessment-kind rows (`src/progression/legacy-session-drain.ts` 5–27). Approved L1 `eventBindingRefusal` allows `OPERATOR_DRAIN` only for `LEGACY_UNBOUND`. Design fact 10 ("refuses any bound session") is inaccurate in L1 terms                                                                                                  | A. Narrow the drain to L1 `LEGACY_UNBOUND` (operator-only delta; rows outside scope stay open until C4 residue handling). B. Amend the L1 contract to accept `OPERATOR_DRAIN` for unassigned BOUND rows (changes approved L1 code and the matrix). Either way, H-01 must also state how drain interacts with D-28 (§9.4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| H-02 | **Live ends L1 refuses at Phase 1 sites.** Reachable through the API today: (i) site #1 `CHECK_PASSED` on BOUND REVIEW/PLACEMENT without `reviewDecay` → `SESSION_KIND_MISMATCH`; (ii) site #1 on an assignment-bound row → `ASSIGNMENT_BOUND_SESSION` (ends the session while its run stays active); (iii) site #2 on PRACTICE/REVIEW/legacy/assignment rows; (iv) OPEN rows whose snapshot is malformed (`MALFORMED_SNAPSHOT` from the §9.1 mapper, the class L1 refuses as `MALFORMED_STATE`). Revision 1's "end now, backfill later" is **withdrawn** (R3) | **For structurally valid snapshots (i)–(iii) only:** A. Keep ending; in the same adapter transaction insert `LEGACY_UNRECORDED` (conditional end, then L1 `BACKFILL` on the resulting `ENDED_UNRECORDED` state — L1 unchanged). Requires approving S-07's unknown-evidence label for live misrouted ends. B. Write the attempt but do not end the session (session stays open; affects R7 and later unfinished-session lists). C. Refuse the request (L3 behavior pulled forward; learner-visible). D. New outcome label (L1/enum change + approval). Cases (i)–(iii) may be disposed differently; (ii) is the strongest candidate for B or C. **For (iv):** A is **not available** — L1 `BACKFILL` validates the snapshot like any event, so ending first does not make a malformed row labelable, and no L1 weakening is proposed. Applicable choices: B (attempt written, no end, row reported by id), C (refuse), or a separately reviewed adapter design; none silently inserts unknown evidence for an invalid tenant/snapshot |
| A-1  | **D-28 eligibility acknowledgement** (§9.4): set-once `endedAt` stops a late correct check on an already-ended PRACTICE session from satisfying the post-remediation practice counter                                                                                                                                                                                                                                                                                                                                                                          | Acknowledge as a correction under approved set-once semantics (no policy vote; preserving the overwrite is not an option because it breaks S-06 equality and terminal absorption)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| C-1  | **S-07 window reading** (§12): ends written by step-1 instances during the bounded step-2 deploy overlap are labelled `LEGACY_UNRECORDED` by backfill                                                                                                                                                                                                                                                                                                                                                                                                          | Confirm S-07 "pre-existing" covers ends by pre-activation code, or require the second-deploy variant plus a reviewed drain of old instances before activation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

### 13.2 Settled as inherited or engineering (no new vote; still subject to migration/privacy/release review)

| Rev-1 ID | Classification                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-03     | Replaced by A-1                                                                                                                                                                       |
| H-04     | Engineering de-duplication of the approved REVIEW one-shot: site #1 skips its end when `reviewDecay` (§9.4)                                                                           |
| H-05     | Engineering cleanup: remove the synthetic pilot end and `closedSessionCount`; no label is needed                                                                                      |
| H-06     | `learnerProfileId` on the clear request implements existing learner-scoped auth; reviewed in schema/privacy review                                                                    |
| H-07     | Signed profile pin implements the approved D-47 lifetime (§7); no value or selection-policy change                                                                                    |
| H-08     | The seven labels are S-approved L1 inputs; parity test + migration review only                                                                                                        |
| H-09     | Withdrawn: L1 already defines unique, nonempty IDs without a maximum; `requestedCount` replaces the ID list; no cap invented                                                          |
| H-10     | Prisma relations, `map:` names and zero drift are engineering obligations (§5, G-13)                                                                                                  |
| H-11     | App enforcement + named tests for cross-table invariants (§6); a constraint trigger is an allowed engineering alternative that may not relax them                                     |
| H-12     | `DISCARDED_SESSION_ENDED` deferred with its writer to L3 (§11)                                                                                                                        |
| H-13     | Index lock window and transaction boundary are deployment engineering reviewed at G-04/G-12; real-data measurement is a separately authorized operation                               |
| H-14     | Digest excluded from export as data minimization under existing privacy requirements; privacy review confirms the exact shape (G-07)                                                  |
| R1/R6/R7 | Engineering corrections applied in §5–§7; inherited invariants (forward repair after first write, synthetic-only destructive tests, no raw token/secret anywhere) are not re-approved |

## 14. Test plan

DB-free (`npm run verify`): format, lint, typecheck,
`db:check-down-migrations`, unit/contract tests.

- Enum parity: Prisma `SessionLifecycleOutcome` values deep-equal
  `SessionLifecycleOutcomeSchema.options`; actor kinds match design §8.
- State mapper: `OPEN` / `ENDED` / `ENDED_UNRECORDED` from synthetic rows;
  every binding (ASSIGNMENT/LEGACY_UNBOUND/BOUND); Date identity preserved;
  output parses with `SessionLifecycleStateSchema`; malformed synthetic
  snapshots (bad pins/dates/binding) return `MALFORMED_SNAPSHOT` and never a
  state; no `as` casts in mapper source (layer-separation scan).
- Adapter matrix (fake transaction port): for every (state × event) it
  persists exactly L1's outcome/status with the §9.3 actor, returns
  `ALREADY_ENDED` from raw `endedAt` without mapping or calling L1 for
  ended rows (valid and malformed), returns the site's malformed disposition
  for open malformed rows without calling L1 or writing, and applies the
  approved H-02/H-01 disposition on refusal; option A is never applied to a
  malformed snapshot. Step-1 mode performs only the conditional end and
  inserts no record; step-2 mode inserts in the same transaction.
- Coverage: DMMF coverage test includes both models.

Integration (`npm run test:integration`, documented disposable local
Postgres, synthetic data and fake tutor only, **after migration approval**;
never before):

- SQL catalog assertions: every CHECK, both triggers, all FKs with
  `RESTRICT`, and the three composite unique indexes exist by name.
- CHECK constraints: each illegal outcome/actor/status/clear/tenant-column
  combination is rejected by Postgres.
- **RR-1 SQL three-valued-logic fixtures** (each must be rejected, proving no
  CHECK evaluates UNKNOWN and no FK is skipped): `actorUserId` set with
  `actorHouseholdId` NULL (both for an existing other-household user and an
  unknown id); `actorHouseholdId` set with `actorUserId` NULL;
  `clearRequestId` set with each of `clearHouseholdId` /
  `clearLearnerProfileId` NULL and with both NULL; any clear tenant column
  set with `clearRequestId` NULL. Positive controls: all-null and all-set
  matching rows are accepted.
- **R1 pre-existing bad row:** create a synthetic Session whose
  `householdId` is household A and `learnerProfileId` is a learner of
  household B (allowed by today's single-column FKs); a SYSTEM termination
  with exactly that triple is rejected by
  `SessionTermination_learnerProfileId_householdId_fkey`. Also: cross-household
  actor, and a clear request of another learner, are rejected.
- Immutability: `UPDATE` on either table raises.
- Races: two concurrent ends of one session → one record, one `endedAt`;
  Phase 1 loser returns `ALREADY_ENDED`; Serializable loser fails without
  committing and is not retried by the adapter.
- Duplicate end/replay: second call is a no-op; record unchanged.
- Injected insert failure at each site #1–#7 rolls back `endedAt`.
- **R4 interleaving:** a synthetic old-style unconditional writer and a
  step-2 writer against one session, in both orders; with step 1 in place no
  recorded `endedAt` ever differs from `Session.endedAt`, and a test
  demonstrating the failure when an unconditional writer is present documents
  why step 1 precedes step 2.
- **D-28 (A-1) fixtures:** the §9.4 sequence leaves `endedAt = T0` and the
  counter at 0; a genuinely new PRACTICE session completed after remediation
  still counts; REVIEW never satisfies the count; a drained PRACTICE row with
  an old correct check is covered per the H-01 disposition.
- Per site: correct outcome, run status and actor; abandon records the
  authenticated `actorUserId`; #5 one shared `now`; #1 skips its end for
  `reviewDecay` so a correct review yields exactly one `COMPLETED_ONE_SHOT`.
- Household delete with records succeeds and rolls back wholly on an
  injected failure; AuditLog `HOUSEHOLD_DELETE` survives anonymized; export
  for household A contains only A's records and never the digest.
- Negative evidence: no new route files under `src/app/api`; mastery,
  parent evidence/digest, R7 and D-28 outputs deep-equal before/after
  dual-write except the A-1 fixture.
- Backfill: dry-run writes nothing; run is idempotent; labels only ended
  unrecorded rows; synthetic malformed rows are reported, not written; open
  sessions untouched.
- Clear schema (L2a) only: digest format/uniqueness and
  `(actorUserId, reauthAt)` uniqueness. Token tests (L3, listed for
  completeness): clear↔override rejection both ways, same-purpose replay,
  wrong household/user/learner, wrong profile pin, consumption rollback when
  any selected end/record insert fails.

Migration: `npm run test:migrations` on a disposable scratch DB (round trip,
identical `pg_dump`), plus the reviewed nonempty-refusal and
injected-forward-failure cases of §6.1. Nothing here was run.

## 15. Manual gate checklist

- [ ] G-01 L2a: human migration + privacy review of this packet (no H item
      blocks L2a). L2b: H-01, H-02, A-1, C-1 dispositioned (§13.1).
- [ ] G-02 Re-check migration head on `main` and all open branches/PRs; assign
      the number at merge time.
- [ ] G-03 Confirm production Postgres version supports all used features.
- [ ] G-04 Review the index-build write-lock window on `Session`/`User`/
      `LearnerProfile`; any real-data row count is a separately authorized
      operation.
- [ ] G-05 Human review of `migration.sql` and `down.sql` line by line.
- [ ] G-06 Scratch evidence attached: round trip, nonempty refusal,
      injected forward failure (§6.1), with the reviewed `mktemp` accommodation.
- [ ] G-07 Privacy review of new inventory rows and export shape.
- [ ] G-08 Confirm no raw token/secret in schema, logs, traces, fixtures.
- [ ] G-09 L2a deployed and verified before L2b review begins; L2b step 1
      fleet-wide before step 2 (§12).
- [ ] G-10 Backfill and S-07 operation each get separate production
      approval; neither runs automatically.
- [ ] G-11 Confirm L3 remains unauthorized.
- [ ] G-12 **Untested.** On scratch, confirm how `prisma migrate deploy`
      treats the explicit `BEGIN`/`COMMIT` and finalize the boundary form;
      source review is not execution evidence.
- [ ] G-13 **Untested.** `prisma validate` and a zero-drift
      `prisma migrate diff` on scratch for the §5 relations, including whether the duplicate
      tenant columns are required at all; until then §5 is a candidate
      representation only. SQL-only CHECK/trigger catalog tests stay separate.
- [ ] G-14 Coordinator records actual author/reviewer model ids from harness
      metadata.

## 16. Next issue

**Human migration/privacy review of this revised preflight for L2a** (G-01
L2a, G-02..G-08, G-12, G-13). After explicit migration approval: issue "L2a —
session terminal record schema, privacy coverage and DB-boundary state mapper
(no writers)". In parallel, the owner dispositions H-01, H-02, A-1 and C-1;
L2b (step 1 then step 2) is a separate issue that cannot start before those
decisions and a deployed L2a. This document stops at preparation and
authorizes nothing, including L3.
