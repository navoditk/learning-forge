# Teaching persistence and privacy proposal (T2, writer-free)

Status: **PROPOSAL ONLY.** Approves nothing. No migration, SQL file, Prisma
change, writer, route, content, provider call, database operation or policy
value follows from this document. SQL below is illustrative prose; proposed
tests are not run and no claim here is executable validation.

## 1. Authority, provenance and scope

| Item             | Value                                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task packet      | `docs/agent-handoffs/TEACH-T2-PROPOSAL.md` (main, read only)                                                                                                                                                                                                     |
| Owner input      | 2026-10-10 "proceed, anything waiting approval or running in background ?" — one writer-free proposal plus independent review                                                                                                                                    |
| Authority record | `docs/course-progression-decisions.md` §J: D-139/D-142 APPROVED (shape only); D-140/D-141/D-143/D-144 OPEN; D-100/D-102/D-138 OPEN; D-145/D-146/D-147 assigned by the integrator for the sole matrix, OPEN with no value (not present in this worktree's matrix) |
| Baseline         | HEAD `d70287d41d93e87f3c5845e38218fa51e1a2c221` + overlay `846e636b…af1f` (handoff, matrix, `src/progression/learner-state.ts` reader changes only)                                                                                                              |
| Pinned inputs    | contract `c18411c4…1ff` (unchanged); `src/contracts/teaching-catalog.ts` `c4158d58…ef3e`; `src/contracts/teaching-delivery.ts` `6a2d8e01…9c5d3d`                                                                                                                 |
| Author           | Copilot CLI architect sub-agent, allocated Claude Opus (`docs/agent-orchestration.md:18`); runtime model identifier is not self-verifiable                                                                                                                       |
| Not in this tree | Main's other uncommitted work and the T1 tests/fixtures; this worktree is not a complete course checkpoint                                                                                                                                                       |

The contract's "PROPOSED" header (`docs/teaching-delivery-exposure-contract.md:3`)
is preserved historical metadata; matrix §J is the authority for D-139/D-142
shape approval. Nothing here contradicts that approval.

**Scope:** persistence for the D-142 immutable context and its
`LearningEvent` link; tenant/actor/version/idempotency integrity; privacy,
export, deletion, retention ordering; scratch-only migration validation plan.
**Non-goals:** interlock (D-140/T4a), replay/expiry evaluation (D-102),
acknowledgement (D-138), grants (D-100), completion, mastery, serving, content,
per-program adoption, numeric defaults, any change to practice/assessment.

## 2. Current-state inventory (re-derived from code)

| Evidence                                                                   | Today                                                                                                                          | Verdict                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `prisma/schema.prisma:697-711` `LearningEvent`                             | separate FKs to Household/LearnerProfile, cascade; nullable `contentId/Version`; `occurredAt @default(now())`; no context link | **Extend**: nullable `deliveryContextId` only; legacy rows stay valid             |
| `prisma/schema.prisma:170-176` `LearningEventKind`                         | includes `TEACHING_VIEWED/COMPLETED`; no writer emits them                                                                     | **Preserve**; no enum change                                                      |
| `src/phase1/service.ts:508-520`                                            | sole writer: `INDEPENDENT_PRACTICE_EXPOSURE`, literal `skillVersion '1.0.0'`, null-safe content                                | **Preserve**; must keep working with null context                                 |
| `src/progression/learner-state.ts:301-307,469-475` (overlay)               | D-31/D-32 prior-work count by household+learner+skill code over teaching/practice kinds                                        | **Preserve**; linked teaching events count automatically                          |
| `src/progression/skill-assessment.ts:56-58`, `exposure.ts:11-19`           | exposure read by learner+skill code, actual `occurredAt` max                                                                   | **Preserve**; no horizon reader in T2                                             |
| `prisma/schema.prisma:232-278` `User`, `LearnerProfile`                    | no composite `(id, householdId[, role])` keys; learner/user household consistency not DB-enforced                              | **Gap**: add additive composite unique keys as FK targets                         |
| `prisma/schema.prisma:657-677` `OverrideRecord.actorUserId`                | actor id without FK (precedent of unverified actor)                                                                            | Not copied; see §4.2 actor FK                                                     |
| `src/server/household-context.ts:18-28`                                    | actor = session user id, role literal `'PARENT'`; learner via unordered `findFirst`                                            | **Gap (T4b)**: SQL cannot prove authentication; ambiguity refusal is serving work |
| `prisma/migrations/0001_init/migration.sql:282-294`                        | `Attempt_immutable` BEFORE UPDATE trigger; DELETE allowed                                                                      | **Reuse pattern**: immutability that still permits erasure                        |
| `src/server/household-data.ts:21-81`                                       | `HOUSEHOLD_DATA_MODEL_COVERAGE`; `ContentArchive` global                                                                       | **Extend** before any row can exist                                               |
| `src/server/household-data.ts:201-216,237`                                 | assignment export omits raw `idempotencyKey`; `learningEvents: true` exports all event columns                                 | Precedent for D-143 recommendation; new event column exported automatically       |
| `src/server/household-data.ts:259-312`                                     | explicit ordered `deleteMany`, events at 278, learners 292, users 293, AuditLog anonymized 302-308                             | **Extend**: contexts after events, before learners/users                          |
| `tests/progression/household-data-coverage.test.ts:13-14`                  | DB-free; fails if a Prisma model is not listed in export+delete or global                                                      | Forces coverage in the same change as the model (§7)                              |
| `prisma/schema.prisma:489,498`; `assignment/route.ts:49`                   | D-54 key `trim().min(8).max(200)`, unique `(learnerProfileId, idempotencyKey)`                                                 | **Preserve**; teaching keys are a separate per-table namespace                    |
| `prisma/schema.prisma:607` `LearnerLessonState.teachingViewedAt`           | no writer                                                                                                                      | **Preserve unwritten**                                                            |
| `scripts/check-migration-down.sh:7-13`; `scripts/test-migrations.sh:40-55` | existence check (in `verify`); scratch forward/down/reapply schema diff (DB, not in `verify`)                                  | Reuse; add seeded guard probe (§8)                                                |
| `prisma/migrations/0012…/down.sql`, `0017…/down.sql`                       | down refuses to drop non-empty evidence (`RAISE EXCEPTION`)                                                                    | **Reuse pattern**                                                                 |
| `docs/course-progression-architecture.md:1570-1600`                        | Procedure 1 (scratch) vs Procedure 2 (production, evidence retained, archive-then-drop)                                        | Context joins the non-reconstructable class                                       |

## 3. Five-layer boundaries

1. **Curriculum** — teaching catalog/archive is global content
   (`HOUSEHOLD_DATA_MODEL_COVERAGE.global`). The context stores only identities,
   versions and digests: **no title, explanation, example, figure, bank or
   answer column exists**, so no learner row can hold a body.
2. **Policy** — the context pins `accessPolicy`, `policyProfile` and
   `retryWindowPolicy` refs as text. No grant, threshold, duration or expiry
   column; D-100/D-102 values are not representable and are not chosen.
3. **Learner state** — untouched. No `LearnerLessonState`, `UnlockGrant`,
   `SkipRecord`, schedule, mastery or completion row is created or referenced.
4. **Evidence** — `TeachingDeliveryContext` (immutable) + linked
   `LearningEvent`. Neither is mastery evidence; delivery proves only server
   delivery to an authenticated parent session (D-139), never viewing,
   comprehension or learner identity.
5. **Provider** — none; no column is ever sent to a model.

**Operation key lifecycle.** Under the contract (§5.2 step 5, §6) the key is
consumed only by committing context+event atomically; there is no pending
reservation, and an expired key keeps refusing (`OPERATION_KEY_EXPIRED`), so the
key lives exactly as long as its context. **No separate reservation table is
proposed.** One is needed only if D-102 later approves pre-commit reservation,
key recycling or key retention shorter than the context; that table would need
its own ownership, retention, export and deletion review.

**Three distinct properties, never conflated:** (a) _logical immutability_ —
no application path updates a context or linked event; (b) _DB enforcement_ —
BEFORE UPDATE triggers reject updates for every role that does not disable
triggers (§4.4); (c) _lawful erasure_ — DELETE remains permitted so
`deleteHouseholdData` and cascades erase both rows. Immutability is not
retention.

## 4. PostgreSQL constraint design (illustrative only)

### 4.1 Field mirror of T1 (`TeachingDeliveryContextSchema`, teaching-delivery.ts:17-37)

| T1 field                                                                                                                | Column(s)                                | DB check (defense in depth; Zod stays authoritative)                    |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `id, householdId, learnerProfileId, actorUserId`                                                                        | same, `TEXT NOT NULL`                    | FKs below                                                               |
| `actorRole: 'PARENT'`                                                                                                   | `"UserRole"` (reuse enum)                | `CHECK ("actorRole" = 'PARENT')`                                        |
| `operationKey`                                                                                                          | `TEXT NOT NULL`                          | `char_length` 1–200                                                     |
| `activityKind: 'TEACHING'`                                                                                              | `"ProgressionActivityKind"` (reuse enum) | `CHECK ("activityKind" = 'TEACHING')`                                   |
| `programRef, unitRef, lessonRef, skillRef, teachingCatalogRef, accessPolicyRef, policyProfileRef, retryWindowPolicyRef` | `<x>Code`, `<x>Version`                  | code `~ '^[a-z0-9-]+$'`; version length 1–100, `= btrim(...)`           |
| `itemRef {id, version, hash}`                                                                                           | `itemId`, `itemVersion`, `authoredHash`  | id as code; `authoredHash ~ '^sha256:[a-f0-9]{64}$'`                    |
| `canonicalHash`                                                                                                         | `canonicalHash`                          | same digest regex                                                       |
| `deliveredAt`                                                                                                           | `TIMESTAMP(3) NOT NULL`, **no DEFAULT**  | writer supplies the post-lock server clock (contract §7); never `now()` |

`btrim` and PostgreSQL `\s` differ from JS `trim()` for non-ASCII whitespace;
the DB check is weaker than Zod, not equal, and the writer must parse with T1
first. Column types reuse existing enums, so no new Prisma enum is introduced.

### 4.2 Tenant and actor consistency

```sql
-- Additive keys on existing tables (trivially satisfied: id is already unique).
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_id_householdId_key" UNIQUE ("id","householdId");
ALTER TABLE "User" ADD CONSTRAINT "User_id_householdId_role_key" UNIQUE ("id","householdId","role");

-- In CREATE TABLE "TeachingDeliveryContext":
FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
FOREIGN KEY ("learnerProfileId","householdId")
  REFERENCES "LearnerProfile"("id","householdId") ON DELETE CASCADE ON UPDATE NO ACTION,
FOREIGN KEY ("actorUserId","householdId","actorRole")
  REFERENCES "User"("id","householdId","role") ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT "TeachingDeliveryContext_learner_operation_key" UNIQUE ("learnerProfileId","operationKey"),
CONSTRAINT "TeachingDeliveryContext_event_pin_key"
  UNIQUE ("id","householdId","learnerProfileId","skillCode","skillVersion","itemId","itemVersion")
```

- The actor FK proves only that `actorUserId` is a `PARENT` user of the same
  household, at insert and for as long as the row exists (`ON UPDATE NO
ACTION` refuses a later `User.role`/`householdId` or
  `LearnerProfile.householdId` change while contexts reference it); it does
  not prove that user authenticated the request. Authentication remains `requireHouseholdContext`'s job and T4b's
  falsifying tests. A learner `User` id with `actorRole 'PARENT'` fails the FK
  because that user's tuple carries role `LEARNER`.
- `NO ACTION` (checked at statement end), not `RESTRICT`: a household or
  learner cascade deletes contexts and users in one statement and passes;
  `RESTRICT` would fail mid-cascade. This is PostgreSQL's documented
  distinction and still requires actual scratch validation (§10). `ON UPDATE
NO ACTION` avoids cascading an update into an immutable row.
- **Historical actor account removal (D-145, OPEN).** No single-parent
  deletion path exists (only `deleteMany` by household,
  `household-data.ts:292-293`). The proposed `NO ACTION` actor FK makes a future
  parent removal fail closed while contexts exist. That proposal is itself
  subject to owner review of D-145 **before T2a**, even though no removal
  feature exists; no D-145 value is chosen here.
- Program→unit→lesson→item ownership lives in code catalogs and is **not**
  DB-enforceable; it stays an application check (contract §5.2 step 3).

### 4.3 Event linkage, null compatibility and uniqueness

```sql
ALTER TABLE "LearningEvent" ADD COLUMN "deliveryContextId" TEXT;  -- nullable, no default
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_context_requires_content"
  CHECK ("deliveryContextId" IS NULL OR ("contentId" IS NOT NULL AND "contentVersion" IS NOT NULL));
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_teaching_requires_context"
  CHECK (("kind" IN ('TEACHING_VIEWED','TEACHING_COMPLETED')) = ("deliveryContextId" IS NOT NULL)) NOT VALID;
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_deliveryContext_fkey"
  FOREIGN KEY ("deliveryContextId","householdId","learnerProfileId","skillCode","skillVersion","contentId","contentVersion")
  REFERENCES "TeachingDeliveryContext"("id","householdId","learnerProfileId","skillCode","skillVersion","itemId","itemVersion")
  MATCH SIMPLE ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE UNIQUE INDEX "LearningEvent_deliveryContextId_kind_key" ON "LearningEvent"("deliveryContextId","kind");
-- after the §8 probe proves no unlinked teaching rows: VALIDATE CONSTRAINT "LearningEvent_teaching_requires_context";
```

NULL reasoning: `MATCH SIMPLE` skips the FK when **any** column is NULL, so
legacy practice rows (null context, often null content) stay valid. That same
rule would let a linked row with null `contentId` escape the FK; the
`context_requires_content` CHECK closes it, so every linked row has all seven
columns non-null and the FK is fully checked. `MATCH FULL` is rejected: it
fails legacy rows whose other columns are non-null. Both CHECK expressions
never evaluate to NULL (`kind` is NOT NULL; `IS [NOT] NULL` is boolean), so no
row passes by NULL. The unique index treats NULLs as distinct (default; do not
use `NULLS NOT DISTINCT`), so unlimited legacy rows coexist while each context
has at most one event per kind. The biconditional CHECK also forbids a
non-teaching kind from pointing at a context. Allowing `TEACHING_COMPLETED`
in schema is not D-138 approval; no writer may emit it.

The tenant/learner/skill/item equality is enforced by the composite FK, not a
cross-table CHECK. Teaching events already supply exact pins, so the legacy
`'1.0.0'` literal (`service.ts:513`) is never copied.

### 4.4 Triggers (cross-row rules that a CHECK cannot express)

| Trigger                                                                                                  | Rule                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TeachingDeliveryContext_immutable` BEFORE UPDATE                                                        | always `RAISE` (mirrors `Attempt_immutable`); DELETE allowed                                                                                                                                                               |
| `LearningEvent_link_immutable` BEFORE UPDATE                                                             | `RAISE` if `OLD."deliveryContextId" IS NOT NULL OR NEW."deliveryContextId" IS DISTINCT FROM OLD."deliveryContextId"` — linked rows frozen; no backfill linking of legacy rows; unlinked legacy rows keep current behaviour |
| `LearningEvent_link_time` BEFORE INSERT, linked rows only                                                | read the immutable context: `TEACHING_VIEWED` requires `occurredAt = deliveredAt`; `TEACHING_COMPLETED` requires `occurredAt >= deliveredAt`; missing context raises                                                       |
| `TeachingDeliveryContext_requires_viewed` CONSTRAINT TRIGGER AFTER INSERT, DEFERRABLE INITIALLY DEFERRED | at commit, a still-existing context must have its `TEACHING_VIEWED` event (no orphan context invisible to D-31 readers)                                                                                                    |
| `LearningEvent_viewed_not_orphaned` CONSTRAINT TRIGGER AFTER DELETE, deferred                            | at commit, a deleted linked `TEACHING_VIEWED` row's context must also be gone (erase the pair, never the exposure alone)                                                                                                   |

`IS DISTINCT FROM`, never `<>`, because `NULL <> x` is NULL and would skip the
guard. Equality on `TIMESTAMP(3)` matches JS millisecond `Date`.

**Same-role limits.** The app, tests and migrations use one `DATABASE_URL`
(`prisma/schema.prisma:7`, `scripts/run-integration-tests.sh:4`,
`scripts/test-migrations.sh:40`), so privileges cannot separate them. Triggers do
bind the owner role and are testable as it, so an ordinary guarded `TRUNCATE`
is denied (below). They do not stop an owner's `ALTER TABLE … DISABLE TRIGGER`,
`DROP` of a guard or table, or a superuser `session_replication_role = replica`;
only `TRUNCATE` after a guard is disabled or dropped (or on a table left
unguarded) escapes. Those are operational controls, not DB proofs.

**Mandatory TRUNCATE guards.** `TRUNCATE` skips row triggers, so it would
bypass the deferred `viewed_not_orphaned` guard and could orphan contexts even
without disabling triggers. Two statement-level `BEFORE TRUNCATE` triggers are
required, not optional:

| Trigger                                  | Rule                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LearningEvent_truncate_guard`           | `RAISE` if `EXISTS (SELECT 1 FROM "LearningEvent" WHERE "deliveryContextId" IS NOT NULL)` or `EXISTS (SELECT 1 FROM "TeachingDeliveryContext")`; otherwise legacy `TRUNCATE` proceeds unchanged |
| `TeachingDeliveryContext_truncate_guard` | `RAISE` if any context row exists                                                                                                                                                               |

`BEFORE TRUNCATE` triggers fire before any listed or cascaded table is
emptied, so `TRUNCATE "LearningEvent","TeachingDeliveryContext"` and a
`TRUNCATE … CASCADE` from `Household`/`LearnerProfile`/`User` must also refuse
while evidence exists; this needs scratch proof (§10). Permitted household
erasure is `DELETE`, never `TRUNCATE`. An owner can still drop or disable these
guards; that limit remains operational.

**Prisma representability (unverified; blocking T2a probe).** Prisma 6 may
reject the optional composite relation (nullable `deliveryContextId` mixed with
required columns) or relation fields over the `role` enum. **No trigger
substitute is acceptable**: an insert-time lookup does not prove the same
integrity as a live FK under later parent/learner updates or concurrency. If
`npm run db:validate` rejects the §4.2/§4.3 relations, T2a is blocked and a
newly reviewed design preserving full referential and update integrity is
required. Whether constraints present in SQL but absent from `schema.prisma`
survive generated migrations is unproven either way; this is an explicit
future probe (§8). CHECKs and triggers are raw SQL that `schema.prisma` cannot
express and Prisma tooling may omit, so Prisma diff silence is **not**
verification of them; they are verified separately from `pg_catalog` (§8.6).

## 5. Privacy classification, export, deletion, retention

| Column group                                                                 | Class                                                                                                                                      | Export (D-143 rec. / alt.)              | Delete               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------- |
| `id`, household/learner ids                                                  | internal identifiers, household-scoped                                                                                                     | yes / yes                               | household erasure    |
| `actorUserId`, `actorRole`                                                   | parent identity reference (already exported in `users`, `household-data.ts:94`)                                                            | yes / yes                               | household erasure    |
| course/skill/item/catalog/policy/retry refs, `authoredHash`, `canonicalHash` | personal learner activity/provenance data once linked to a learner, household and time (the underlying global content is not learner data) | yes / yes                               | household erasure    |
| `deliveredAt`                                                                | learner activity timestamp                                                                                                                 | yes / yes                               | household erasure    |
| `operationKey`                                                               | client-supplied raw identifier; arbitrary text (risk below)                                                                                | **omit / include**                      | household erasure    |
| `LearningEvent.deliveryContextId`                                            | internal link                                                                                                                              | yes via `learningEvents: true` (`:237`) | events deleted first |

The design adds no deliberate body or free-text field: no teaching body, bank
item, answer, child free text or provider data is exported or stored by
design. `operationKey` is the exception in practice, since it accepts arbitrary
client text. Exact future wiring:

- `HOUSEHOLD_DATA_MODEL_COVERAGE.export` and `.delete` add
  `'TeachingDeliveryContext'`; not `global`.
- `exportHouseholdData` adds `teachingDeliveryContexts: { select: {...} }` with
  an **explicit allowlist** (never `true`, so a future column is not exported
  silently). In T2a this allowlist is an **interim, empty-table-only** set of
  fields common to both D-143 branches; it does not claim either settled D-143
  output. Once D-143 is approved, its branch decides `operationKey` (the
  recommendation omits it, matching the omitted assessment `idempotencyKey`,
  `:201-216`). No writer or external serving exists until T3 is complete.
- `deleteHouseholdData` adds `teachingDeliveryContext.deleteMany({ where: {
householdId } })` immediately after `learningEvent.deleteMany` (`:278`) and
  before `learnerProfile`/`user` (`:292-293`); deferred triggers pass because
  both rows are gone at commit.

**Raw operation key implications (D-146, OPEN).** T1 accepts any non-padded
1–200 string (`teaching-delivery.ts:12-16`), so a client could place
identifying text in it; it would be stored until household erasure and is
unique per learner. It must never appear in logs or traces. A raw column fits
the accepted T1 shape. Storing only a digest changes the T1 field
representation, so it needs a reviewed contract revision and cannot be
substituted silently. Narrower opaque-token request validation would not by
itself change the raw T1 string representation, but still changes the reviewed
boundary contract and needs its approval. This proposal
does not choose storage, format or minimization while D-146 is open.

**D-144 branches (no default adopted).** _Recommended:_ refusals persist no
learner-scoped row and add no `AuditEventType`; structured reason-code logs
only. _Alternative:_ persisted refusals need approved fields, retention,
export and deletion. Implemented via `AuditLog`, they would be anonymized and
retained after household deletion (`household-data.ts:295-308`), exported only
as `id/eventType/userId/createdAt` (`:244-247`), and would need an enum
migration; `recordAuditEvent` swallows write failures (`audit-log.ts:10-27`),
so the "no silent error handling" requirement needs a separate rule. Either
branch is a T3 gate before any writer.

**Retention, backup and erasure (D-147, OPEN).** The candidate class is
non-reconstructable audit, retained until household erasure, like the
existing `LearningEvent` row (`docs/privacy-inventory.md:191`). Because T2a
already changes coverage, the D-147 privacy-inventory row must be approved
**before T2a privacy acceptance**, not deferred to T3. No duration is proposed. Erased rows persist in provider backups
until they age out (`docs/privacy-inventory.md:22-32,194`); this is unchanged
and not a new number. `HOUSEHOLD_EXPORT`/`HOUSEHOLD_DELETE` audit rows are
unaffected.

## 6. Preserved semantics

- D-31/D-32: linked teaching events count as prior work through the existing
  queries (`learner-state.ts:301-307,469-475`); contexts alone never count,
  which is why the deferred trigger requires the `TEACHING_VIEWED` pair.
- `occurredAt` is the actual server delivery time, never a fabricated or
  future time; replay horizons (D-102) are a separate later reader input.
- Practice writer, assessment D-54 keys and all existing exports/deletes keep
  current behaviour. Teaching data proves no mastery or completion.

## 7. Stages and rollback

| Stage | Content                                                                                                                                                                                      | Gate before start                                                                                                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T2a   | One migration + human-reviewed `down.sql`; Prisma model; coverage lists; delete wiring; interim empty-table-only export allowlist common to both D-143 branches — empty table, **no writer** | Owner scope approval for T2 implementation; D-145 review; D-146 storage choice (or explicit acceptance of raw T1 field); D-147 inventory row; privacy and migration review; §8 probes 4–7 pass |
| T3    | D-143 branch export field, D-144 audit branch, privacy-inventory row, export/delete tests                                                                                                    | D-143, D-144 approved; before any write                                                                                                                                                        |
| T4a/b | Interlock, then atomic writer + serving                                                                                                                                                      | D-140, D-100, D-102, D-141, per-program adoption, content; D-138 later                                                                                                                         |

T2a cannot ship the model without coverage because
`household-data-coverage.test.ts:13-14` fails in `npm run verify`. The
integrator may instead land T2a+T3 together; either way coverage precedes rows.
A migration artifact may be drafted for review only within a future approved
implementation scope; nothing deploys before every consumed choice and the
migration/privacy approvals are recorded.
No backfill: no fake contexts or events are created for any historical row.

| Situation                     | Mechanism                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scratch DB                    | `npm run test:migrations` forward → all `down.sql` → reapply; schema diff must be empty (`test-migrations.sh:40-55`)                                                                 |
| Production, before any write  | `down.sql` guarded: `RAISE EXCEPTION` if any context or linked event exists; then drop triggers/functions, event constraints/index/column, table, then the two composite unique keys |
| Production, after first write | **No down.** Disable serving (deny-only flag, T4), forward-fix, retain evidence; archive-then-drop only via architecture Procedure 2 with approval                                   |
| Household erasure             | `deleteHouseholdData` (events, then contexts), independent of rollback state                                                                                                         |

## 8. Later-authorized DB probes (none run)

1. Per environment, count `LearningEvent` rows with teaching kinds (expected
   zero from code, unproven); non-zero blocks `VALIDATE` and needs an owner
   decision, never a fabricated context.
2. `LearningEvent` size/lock impact of validation and new indexes.
3. PostgreSQL version (EXECUTE FUNCTION, deferred constraint triggers) and
   whether the app role owns the tables.
4. `npm run db:validate` for §4.2/§4.3 relations. Failure **blocks T2a**; there
   is no fallback.
5. Prisma migration diff/drift round-trip for Prisma-supported objects only
   (relations, composite FKs, unique indexes): regeneration must not lose or
   change them. Its silence says nothing about CHECKs or triggers.
6. Independent catalog assertion, proposed
   `tests/migrations/teaching-catalog-objects.test.ts` (a new directory not
   selected by `npm test` or `test:integration`; it needs explicit wiring into
   the `test:migrations` phase), comparing `pg_constraint`/`pg_trigger` (or a `pg_dump
--schema-only` extract) against explicit expected definitions: every CHECK,
   composite FK action, trigger function, `tgenabled` state and
   deferrability/`DEFERRABLE INITIALLY DEFERRED`, before and after migration
   regeneration and scratch reapply. Any loss or change blocks T2a.
7. Scratch `npm run test:migrations` (empty forward/down/reapply), plus a
   **separate seeded-guard phase** (§10 wiring) proving `down.sql` and
   `TRUNCATE` refuse non-empty evidence.

## 9. Integrator-assigned open decisions (sole matrix; no value approved)

| ID    | Subject                                                                | This proposal's dependency                                                                                            |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| D-145 | Historical actor account removal treatment                             | §4.2 `NO ACTION` actor FK is a proposal awaiting D-145 owner review before T2a                                        |
| D-146 | Operation key minimization, storage and format                         | Raw column matches accepted T1; digest/format changes need a reviewed contract revision; no storage chosen while open |
| D-147 | Delivery-context retention/erasure privacy-inventory row (no duration) | Required before T2a privacy acceptance                                                                                |

This document records no local alternative or recommendation for these
three; the matrix entries are operative.

## 10. Claim-to-test matrix (all prospective; none run)

Runners: `npm test` (DB-free, inside `verify`); `npm run test:integration`
(DB); `npm run test:migrations` (scratch DB). `verify` stays database-free.

**Wiring.** `npm test` (`package.json:37`) already selects `tests/contracts`
and `tests/progression/*.test.ts`, so new files there run in `verify`.
`npm run test:integration` (`scripts/run-integration-tests.sh:10`) already
selects `tests/persistence` and `tests/progression-integration`, so new files
there are wired without runner changes. The seeded rollback/TRUNCATE probe
needs new wiring: a **separate phase** in its own scratch database (or a
distinct phase before the existing cycle in `scripts/test-migrations.sh`) that
migrates, seeds one synthetic household with a context and its event, asserts
the target `down.sql` and each `TRUNCATE` form raise, then cleans the seed
through the permitted synthetic erasure (`DELETE`: events, then contexts, then
household) and asserts zero rows. Only after that does the existing
empty-schema full down/reapply diff run, so leftover evidence can never make
unrelated `down.sql` files fail.

| Claim                                       | Proposed file / runner                                                       | Falsifying assertion                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model covered, not global                   | `tests/progression/household-data-coverage.test.ts` (extend) / npm test      | removing the name from either list fails; listing it as global fails (has `householdId`)                                                                                                                                                                                               |
| Column/enum coverage                        | same / npm test                                                              | dmmf context fields ≠ expected set fails; `actorRole`/`activityKind` types ≠ `UserRole`/`ProgressionActivityKind` fails; `LearningEventKind` values changed fails                                                                                                                      |
| T1 ↔ columns                                | `tests/contracts/teaching-delivery-persistence.test.ts` / npm test           | a T1 key without a mapped column (or reverse) fails                                                                                                                                                                                                                                    |
| Cross-tenant learner rejected               | `tests/persistence/teaching-delivery-context.test.ts` / integration          | context with household A, learner of B → FK error                                                                                                                                                                                                                                      |
| Forged learner actor rejected               | same                                                                         | `actorUserId` = learner's `User`, role `PARENT` → FK error; other-household parent → FK error                                                                                                                                                                                          |
| Role literals                               | same                                                                         | `actorRole 'LEARNER'` or `activityKind 'PRACTICE'` → CHECK error                                                                                                                                                                                                                       |
| Digest/code format                          | same                                                                         | uppercase hex, missing `sha256:`, 63 hex, code with space → CHECK error                                                                                                                                                                                                                |
| Event pins match context                    | same                                                                         | linked event with other household, learner, `skillCode`, skill version, `contentId` (itemId) or `contentVersion` → FK error; same tuple passes                                                                                                                                         |
| Null-escape closed                          | same                                                                         | linked `VIEWED` or late `COMPLETED` (ack) with null `contentId`/`contentVersion` → CHECK error (would pass FK under MATCH SIMPLE alone); `COMPLETED` with null context → CHECK error                                                                                                   |
| Teaching requires context                   | same                                                                         | `TEACHING_VIEWED` with null context → CHECK; practice kind with context → CHECK                                                                                                                                                                                                        |
| Legacy null compatible                      | same + existing `skill-assessment*.test.ts`                                  | practice event with null context/content inserts; existing practice/assessment suites unchanged                                                                                                                                                                                        |
| Uniqueness                                  | same                                                                         | second `(learner, operationKey)` → unique error; same key, other learner passes; second `VIEWED` per context → unique error; equal string as assessment `idempotencyKey` passes                                                                                                        |
| Time rule                                   | same                                                                         | `VIEWED.occurredAt ≠ deliveredAt` raises; `COMPLETED` before `deliveredAt` raises                                                                                                                                                                                                      |
| Pair integrity                              | same                                                                         | committing context without `VIEWED` fails at commit; deleting `VIEWED` alone fails at commit                                                                                                                                                                                           |
| Immutability (same role)                    | same                                                                         | Prisma and raw `UPDATE` of any context column raises; linking a legacy event raises; unlinking raises                                                                                                                                                                                  |
| Cascade erasure                             | `tests/persistence/household-data.test.ts` (extend) / integration            | `deleteHouseholdData` and raw `DELETE` of Household leave zero contexts/events; a `RESTRICT` FK variant fails this                                                                                                                                                                     |
| Actor deletion fails closed (D-145 pending) | teaching-delivery-context test                                               | deleting only the parent `User` with contexts → FK error                                                                                                                                                                                                                               |
| Later actor/learner updates refused         | teaching-delivery-context test                                               | `UPDATE User SET role='LEARNER'` or move the parent/learner to another household while contexts reference them → FK error                                                                                                                                                              |
| Context not deletable alone                 | teaching-delivery-context test                                               | `DELETE` of a context with a linked event → FK error at statement end; pair `DELETE` (events first) succeeds                                                                                                                                                                           |
| TRUNCATE guards (same role)                 | teaching-delivery-context test                                               | with evidence: `TRUNCATE "LearningEvent"`, `TRUNCATE "TeachingDeliveryContext"`, both together, and `TRUNCATE "Household" CASCADE` each raise, rows unchanged; with no contexts/linked events, `TRUNCATE "LearningEvent"` of legacy rows succeeds                                      |
| D-143 export                                | household-data test                                                          | export key set equals branch allowlist; `operationKey` present under rec. fails; absent under alt. fails; no body/bank keys                                                                                                                                                            |
| D-144 rec. branch (T3/T4)                   | `tests/progression-integration/teaching-refusal-audit.test.ts`               | refusal changes context/event/AuditLog counts → fail; log keys ⊄ allowlist or contain the key → fail                                                                                                                                                                                   |
| D-144 alt. branch (only if approved)        | same                                                                         | persisted refusal row absent from export, outside its approved allowlist, surviving household deletion contrary to its approved erasure rule, or retained beyond its approved rule → fail; a failed refusal-audit write that is swallowed without the approved failure handling → fail |
| D-31 prior work                             | `tests/progression-integration/teaching-prior-work.test.ts`                  | linked `VIEWED` with zero practice yields no skip credit; actual `occurredAt` preserved                                                                                                                                                                                                |
| Prisma representability/drift               | `npm run db:validate` + migration diff probe (§8.4–8.5)                      | validation error, or regeneration that loses/changes a composite FK, relation or unique index → blocks T2a; not proof for CHECKs/triggers                                                                                                                                              |
| Raw objects intact                          | `tests/migrations/teaching-catalog-objects.test.ts` (§8.6) / migration phase | any expected CHECK, trigger, guard, enablement or deferrability missing or differing in `pg_catalog` before/after regeneration and reapply → blocks T2a                                                                                                                                |
| Rollback                                    | `scripts/test-migrations.sh` + new seeded phase / test:migrations            | seeded phase: `down.sql` raises, synthetic `DELETE` cleanup leaves zero rows; then empty-schema diff after reapply is empty                                                                                                                                                            |

Constraint tests insert synthetic rows directly as test fixtures; they are not
writers and must not be wired to routes.

## 11. Manual approvals (separate from checks)

| Approval                                       | Owner                 | Required before       | Status    |
| ---------------------------------------------- | --------------------- | --------------------- | --------- |
| Independent GPT review of this proposal        | Integrator            | any T2a work          | pending   |
| T2 implementation scope                        | Product owner         | T2a                   | not given |
| Privacy review (§5)                            | Privacy owner         | T2a                   | not given |
| D-145, D-146, D-147                            | Product/privacy/eng.  | T2a                   | OPEN      |
| Migration + `down.sql` review                  | Engineering owner     | T2a merge             | not given |
| §8 probes authorization                        | Engineering owner     | T2a merge             | not given |
| D-143, D-144                                   | Privacy (+eng.)       | T3, before writer     | OPEN      |
| D-140; D-100, D-102, D-141, per-program; D-138 | Product/pedagogy/eng. | T4a; T4b serving; ack | OPEN      |

D-139/D-142 approve shapes only. T2-only empty disconnected schema does not
need serving choices, but does need the privacy and migration approvals above.
Nothing transfers across the five programs.

## 12. Review handoff

Reviewer should falsify first: §4.3 NULL reasoning; `NO ACTION` vs `RESTRICT`
in cascades; deferred-trigger behaviour during `deleteHouseholdData`; §4.4
TRUNCATE guard coverage (including `CASCADE`) and the blocking Prisma
representability/drift probes; the D-145/D-146/D-147 dependencies; that no export path can emit `operationKey` under
the recommended branch; and the §2 inventory against code.

## Revision note (R1–R5, after independent review of 851e464…)

- **R1:** removed the trigger fallback; `db:validate` failure blocks T2a and
  requires a newly reviewed design; FK update integrity stated; drift is a
  future probe (§4.2, §4.4, §8, §10).
- **R2:** mandatory statement-level `TRUNCATE` guards on both tables with
  legacy-truncate preservation and same-role tests; erasure stays `DELETE`;
  owner drop/disable remains an honest limit (§4.4, §10).
- **R3:** linked refs/hashes/time reclassified as personal learner
  activity/provenance data; free-text claim scoped; raw key risk and
  contract-revision requirement for digests stated (§5).
- **R4:** existing runner wiring stated; seeded guard phase isolated with
  `DELETE` cleanup before the empty full cycle; added D-144 alternative,
  itemId/skillCode mismatch, later role/household update, context-alone
  delete, late-ack null-escape and TRUNCATE tests (§8, §10).
- **R5:** N1–N3 replaced by integrator-assigned D-145/D-146/D-147 (OPEN, no
  value); all required before T2a; T2a export is interim empty-table-only;
  no deploy before consumed choices and approvals (§1, §5, §7, §9, §11).

Independent acceptance of this revision is not claimed here.

**Final clarification (after changed-scope review):** split Prisma
diff (supported relations/indexes) from an independent `pg_catalog` assertion
for CHECKs/triggers/guards (§4.4, §8.5–8.6, §10); same-role text now says only
unguarded or disabled/dropped-guard `TRUNCATE` escapes; D-146 distinguishes
digest storage (representation change) from opaque-token validation (boundary
contract approval only). R1–R5 otherwise unchanged.
