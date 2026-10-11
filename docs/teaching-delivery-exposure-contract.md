# Teaching delivery and exposure contract (proposed)

Status: **PROPOSED, specification only (T0).** Drafted against HEAD
`a33fc5f53ea9aca792a2059c5da41b15a75f9280` plus the dirty working tree (shared
catalog, dossiers, ADR-0014). This document approves no runtime, schema,
content, writer, route, migration, provider, registration or release work.
Every persistence shape below is **PROPOSED** and does not exist. The
authoritative decision record is `docs/course-progression-decisions.md`; this
document creates no entries and redefines no parameter.

Scope: one shared contract for how the five D-75 accepted first-unit designs
(AMC 8, MOEMS, Math Kangaroo, MATHCOUNTS, Spelling Bee) may deliver reviewed
teaching records to a learner and record that delivery as server exposure.
Out of scope: general course design, teaching volumes, authored content,
completion evaluation, mastery, and per-program adoption.

## 1. Inputs and consumed decisions

Invariants this contract relies on (approved): D-04 (lesson sequencing flag
governs sequencing only), D-21 (server exposure delay), D-31/D-32 (skip and
prior-work rules), D-39 (deferred `Attempt.elapsedSeconds`, not server
exposure timestamps), D-54 (assessment idempotency), D-58
(public projection limits), D-60, D-61 (authoring/review gate), D-75 (five
accepted specs). Architecture §4, §7, §9.1, §10.1–10.2. ADR-0010 (no learner
login), ADR-0014 (recall cards).

OPEN decisions this contract **consumes but does not resolve**:

| Decision        | Recorded source   | Consumed for                                                     | Implementation behaviour while OPEN  |
| --------------- | ----------------- | ---------------------------------------------------------------- | ------------------------------------ |
| D-100 / MC-15   | MOEMS:521         | Explicit `TEACHING` grants in access policies                    | No policy grants `TEACHING`; deny    |
| D-102 / MC-17   | MOEMS:523         | Operation-key retry window reference                             | Refuse all teaching delivery         |
| D-138 / SNSB-12 | Spelling:489      | Explicit learner acknowledgement → `TEACHING_COMPLETED`          | No acknowledgement endpoint or event |
| D-103 / MC-18   | MOEMS:524         | Raw-byte retention (only if raw-byte historical claims are made) | Make no raw-byte historical claim    |
| D-89, D-109     | MOEMS, Kangaroo   | Per-program access/compatibility grant sets (program adoption)   | Program has no teaching access       |
| D-92, D-123     | MOEMS, MATHCOUNTS | Teaching volume per lesson (content, not this contract)          | `teachingContentRefs` stays `[]`     |

D-100, D-102 and D-103 were recorded from the MOEMS dossier and D-138 from
Spelling. Their scopes are **not transferable**: using them for the other
programs requires the owner to approve explicit shared scope (D-141).
AMC 8, MATHCOUNTS and Spelling have no recorded teaching-grant
adoption entry; that is a gap reported to the parent, not invented here.

## 2. Current code inventory (live HEAD)

| Path:line                                                                   | Symbol                                                                          | Today                                                                                                 | Verdict                                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/contracts/progression.ts:25-28`                                        | `ItemRefSchema`                                                                 | strict `{id, version, hash}`; hash is only a nonempty bounded string, not a verified digest           | Preserve; teaching boundary must validate raw-byte digest format and value   |
| `src/contracts/progression.ts:106-121`                                      | `LessonSchema`                                                                  | `teachingContentRefs` ItemRef[]; `assessmentBankRef` **required**                                     | Preserve; no-assessment lessons are a schema gap **outside this packet**     |
| `src/contracts/progression.ts:162-166`                                      | `TeachingContentItemSchema`                                                     | strict, `role: 'teaching'`, `explanation`, optional `workedExample`; no validator or hints            | Preserve; no exported type (gap)                                             |
| `src/content/catalog.ts:500-508`                                            | `validateContentCatalog`                                                        | throws unless practice-only                                                                           | Preserve; teaching gets a **sibling** catalog, never mixed in                |
| `src/content/catalog.ts:515,527-529`                                        | `contentCatalog`, `servableContentCatalog`                                      | practice records; reviewed filter                                                                     | Preserve                                                                     |
| `src/content/publication.ts:15-23`                                          | `publishableContentProjection`                                                  | admits reviewed `teaching` and `practice`                                                             | Preserve; public site writes no events (§10)                                 |
| `scripts/generate-curriculum-site.ts:22,175,185,446`                        | site generator                                                                  | default input `contentCatalog` (practice-only); no DB                                                 | Preserve                                                                     |
| `src/content/archive.ts:8-17`                                               | `canonicalJson` (private)                                                       | key-sorted JSON; duplicated at `src/assessment/private-package-store.ts:135-148`                      | Gap: one shared exported canonical serializer                                |
| `src/content/archive.ts:23-46,48-73`                                        | `archiveCurrentContentCatalog`, `resolveArchivedContent`                        | archives practice as parsed JSON; resolver returns `undefined` for non-practice (line 61)             | Preserve practice behaviour; teaching archive is a gap with its own resolver |
| `prisma/schema.prisma:348-357`                                              | `ContentArchive`                                                                | `content Json`, unique `(contentKey, contentVersion)`                                                 | Preserve; raw bytes not recoverable                                          |
| `src/content/resolvers.ts:26,38`                                            | `resolveActive`, `resolveHistorical`                                            | active picks newest reviewed/servable by id; historical resolves exact version without serving checks | Preserve; teaching needs exact active membership, not newest-by-id lookup    |
| `src/curriculum/course-catalog.ts:130`                                      | `COURSE_CATALOG`                                                                | lessons/units/banks; no teaching index                                                                | Gap: teaching catalog keyed by pinned ItemRef                                |
| `src/curriculum/pilot-catalog.ts:33,56,73` and siblings                     | lesson records                                                                  | every `teachingContentRefs` is `[]`                                                                   | Preserve; this contract adds no units or refs                                |
| `prisma/schema.prisma:170-176`                                              | `LearningEventKind`                                                             | includes `TEACHING_VIEWED`, `TEACHING_COMPLETED`                                                      | Preserve names; document meaning (§8)                                        |
| `prisma/schema.prisma:697-711`                                              | `LearningEvent`                                                                 | household, learner, skill, nullable content, `occurredAt @default(now())`; no context link            | Replace-by-extension (PROPOSED FK, §5)                                       |
| `prisma/schema.prisma:296-316`                                              | `Session`                                                                       | `contentKey` required; nullable activity fields                                                       | Preserve; teaching creates no Session (§5.4)                                 |
| `prisma/schema.prisma:597-614`                                              | `LearnerLessonState.teachingViewedAt`, `practiceCount`                          | no writer in `src`; no event link                                                                     | Preserve unwritten; delivery never writes them                               |
| `src/phase1/service.ts:509-514`                                             | only `LearningEvent` writer                                                     | `INDEPENDENT_PRACTICE_EXPOSURE`, literal `skillVersion '1.0.0'`                                       | Preserve; not a pattern to copy                                              |
| `src/progression/exposure.ts:11`                                            | `skillExposureAt`                                                               | max `occurredAt` over events for a skill code                                                         | Preserve actual-event timestamps; add replay-horizon input before serving    |
| `src/progression/skill-assessment.ts:49,167,227-235`                        | `loadSkillExposureEvents`, `skillAssessmentEligibility`                         | reads by learner+skill code, no version/household filter                                              | Preserve reader; concurrency gap (§7)                                        |
| `src/app/api/progression/assessment/assignment/route.ts:166-172`            | eligibility call                                                                | runs **outside** the Serializable create transaction                                                  | Gap; prerequisite before any writer (§7)                                     |
| `src/progression/assessment-assignment.ts:191,233-431`                      | Serializable create; D-54 key                                                   | unique `(learnerProfileId, idempotencyKey)`, no window                                                | Preserve                                                                     |
| `src/progression/learner-state.ts:289-316,457-478`                          | D-31/D-32 prior-work count                                                      | counts teaching/practice events by skill across lesson/unit skills, any time, in-transaction          | Preserve; delivery becomes prior work (§8)                                   |
| `src/contracts/policy.ts:5-15,44`                                           | `ActivityKindSchema`, `AccessPolicySchema`                                      | `TEACHING` exists as a kind                                                                           | Preserve                                                                     |
| `src/progression/policy.ts:59,76,97`                                        | `requiresAssessmentAssignment`, `authorizeActivity`, `authorizeProgramActivity` | grant, prerequisite and assignment checks; no item-readiness or lesson-sequencing check               | Reuse existing checks; explicit pure teaching-target eligibility is a gap    |
| access policy data (`grade-6-math-access-1.1.0`, `moems-6-access@1.0.0`, …) | grants                                                                          | none grants `TEACHING`                                                                                | Preserve until D-100 and per-program adoption                                |
| `src/phase1/service.ts:170,277,354-392`                                     | `startSession`, `enforceProgressionAuthorizationOrThrow`                        | returns early when C4 off (361); fails open when unresolved (369, 392)                                | Preserve unchanged; **never reused** by teaching                             |
| `src/progression/release-gates.ts:5,27,41`                                  | release gate, C4 flags                                                          | env-driven, default off                                                                               | Preserve; teaching may only add deny conditions                              |
| `src/server/household-context.ts:17-30`                                     | `requireHouseholdContext`                                                       | always `actorRole: 'PARENT'`, first learner                                                           | Gap: actor model (D-139)                                                     |
| `src/phase1/service.ts:968,1004,1016`                                       | tutor trace, interaction and assistance writers                                 | separate persisted exposure sources; no shared learner-row interlock                                  | Required T4a participation before serving, not changed here                  |
| `src/server/household-data.ts:21-80,87,259,278`                             | coverage, export, delete                                                        | `LearningEvent` exported/deleted; `ContentArchive` global                                             | Extend before any writer (§9)                                                |

## 3. Five-layer assignment

1. **Curriculum** — owns the teaching sibling catalog (§4). Knows nothing of
   learners.
2. **Policy** — reuse `authorizeProgramActivity` with `activityKind:
'TEACHING'` for grants and prerequisites. Compose it with a proposed pure
   teaching-target eligibility predicate that checks authored lesson
   requirements and item readiness against persisted evidence and approved
   policy profiles. The planner consumes the same predicate. Missing policy,
   readiness evidence or target denies; no string heuristics or new thresholds.
3. **Learner state** — read-only input to policy. Delivery creates or mutates
   no `LearnerLessonState`, `UnlockGrant`, `SkipRecord` or schedule.
4. **Evidence** — immutable delivery context plus a `LearningEvent`. No
   `Attempt`, `AssistanceEvent`, `MasteryContribution` or assessment record.
5. **Provider** — none. Delivery makes no model call and sends no child data.

**Delivery orchestration** composes ports (catalog, identity, policy,
evidence store, clock) in a fixed order (§5.2). It contains no policy logic,
no grant table and no fallback; any port refusal is terminal for that request.

## 4. Teaching sibling catalog and hashes

- A versioned teaching catalog (`teachingCatalogRef {code, version}`) whose
  membership is **exactly** the set of ItemRefs pinned by
  `teachingContentRefs` of active lessons: no unreferenced members, no
  unresolved refs, no role other than `teaching`, every member `reviewed`.
- Active means the exact reviewed program/unit/lesson versions selected by
  the deployed serving snapshot, not all declared/historical records. Both
  ownership directions must match: program `unitRefs` to unit `programRef`,
  unit `lessonRefs` to lesson `unitRef`, and lesson ItemRef to item identity,
  version, digest and skill version. Disabled programs and archived snapshots
  cannot authorize. The current catalog has no activation lifecycle;
  the implementation must supply it before serving, without registering real
  new units under this packet.
- At build/validation time, verify ItemRef hashes against authored raw bytes,
  then emit a server-only versioned manifest containing verified raw digests
  and canonical parsed digests. Bundled JSON imports do not preserve raw bytes
  at runtime. Runtime loading checks the pinned manifest and recomputes
  canonical digests of bundled records. Any
  mismatch makes teaching unavailable (`TEACHING_CATALOG_UNAVAILABLE`) and must
  not break the practice `contentCatalog` import or `validateContentCatalog`.
  Build generation/verification is later reviewed tooling, not T1.
- The same `id@version` cannot denote both teaching and practice; validate
  this across catalogs. The archive key alone does not enforce global id
  uniqueness. Content role may not be changed in place.
- Two digests, never conflated:
  - `authoredHash` — the ItemRef raw-byte hash, copied as provenance.
  - `canonicalHash` — `sha256:` over a new teaching-only canonical JSON
    serializer of the parsed record actually served, using stable code-point
    key ordering, not locale-dependent `localeCompare`; changing existing
    `archive.ts` and `private-package-store.ts` serializers/hashes is outside
    this packet.
- Historical verification compares `canonicalHash` against a (gap) teaching
  archive of parsed JSON. It never reconstructs raw bytes from the archive and
  never claims raw-byte integrity after the fact; any such claim waits on
  D-103.
- Archived/inactive items are retained for history, but only the active
  catalog can authorize a new delivery or a replay (§6).
- No metadata defaults or heuristics: missing skill, lesson, version, review
  or hash is a load error, not a default.

## 5. Immutable delivery context and serve order

### 5.1 PROPOSED persistence (does not exist)

`TeachingDeliveryContext`, one immutable row per first delivery:

| Field group | Fields                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------- |
| Tenant      | `id`, `householdId`, `learnerProfileId`                                                   |
| Actor       | `actorUserId`, `actorRole` (D-139)                                                        |
| Operation   | `operationKey`; unique `(learnerProfileId, operationKey)`                                 |
| Course pins | `programCode/Version`, `unitCode/Version`, `lessonCode/Version`, `skillCode/Version`      |
| Item pins   | `itemId`, `itemVersion`, `authoredHash`, `canonicalHash`, `teachingCatalogCode/Version`   |
| Policy pins | `accessPolicyCode/Version`, `policyProfileCode/Version`                                   |
| Time        | `deliveredAt` (server clock inside the transaction), pinned retry-window policy reference |

`LearningEvent` gains nullable `deliveryContextId` with unique
`(deliveryContextId, kind)`. Alternative shape: columns on `LearningEvent`
(D-142). Either needs a reviewed migration plus `down.sql` (§11). These are
alternatives, not permission to implement the proposed table while D-142 is open.

The same teaching item pinned by two lesson versions produces distinct
contexts carrying each exact lesson version; the context never infers the
lesson from the item.

### 5.2 Serve order

1. Resolve identity (household, learner, actor) server-side; reject
   client-supplied tenant fields that disagree. For D-139's proposed
   parent-authenticated branch, only the authenticated PARENT actor is
   accepted; operator delegation requires a separate scoped contract.
   Resolve exactly one learner for this pilot household, otherwise refuse
   ambiguity; never silently rely on unordered `findFirst`.
2. Check flags and release gate (deny-only, §10).
3. Resolve immutable authored artifacts at exact pinned versions. Verify the
   program owns the unit, the unit owns the lesson, the lesson lists the
   ItemRef, and the item skill version is claimed by that lesson. No catalog
   membership or policy may be substituted with a newest-version lookup.
4. Enter the shared serialization protocol (§7). Within that transaction,
   resolve the operation key and its binding; rederive current actor access,
   active target membership, grants, readiness, lesson eligibility and
   overlapping assessment activity from persisted state. Replays take this
   same path. Missing actor, unknown flag, ended/revoked authorization or
   unresolvable state is a reason-coded refusal.
5. For a new operation, insert context and `TEACHING_VIEWED` event with
   `occurredAt = deliveredAt`; commit both together. For a valid replay,
   commit the authorization/interlock check without adding exposure.
6. Only after a successful commit, return the allowlisted body.

If the transaction fails or its outcome is unknown, return no body. There is no path
that returns teaching content without a committed context; there is no
read-only teaching endpoint.

The authenticated route is a state-changing POST with `Cache-Control:
private, no-store`; no CDN/shared cache, prefetch, GET or browser restore may
serve authenticated instruction without this operation. Allowlist only item
identity/version, title, explanation, optional worked example/figure,
accessibility text and delivery/replay identifiers/timestamps. Never include
practice answers, assessment state, bank data, raw policy/evidence or profile
data. The client does not persist bodies for offline/eventless replay.

### 5.3 Binding checks on every request and replay

Refuse with a reason code on any mismatch: household, learner, actor/role,
program/unit/lesson/item/catalog/policy versions, archived item, disabled
program, ended/revoked authorization, or flags off.

### 5.4 Session kind

Teaching creates no `Session` row (avoiding ADR-0014/session-lifecycle R7
interplay). Teaching endpoints refuse any session id
(`SESSION_KIND_MISMATCH`); attempt, hint, tutor and assessment endpoints
refuse delivery-context ids.

## 6. Operation key, retry and expiry

Binding tuple: household, learner, actor+role, activity `TEACHING`,
program/unit/lesson versions, item id/version/hash, catalog version, policy
versions.

| Case                                                | Result                                                                                                                                                                                                    |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New key, authorized                                 | §5.2; new context and event                                                                                                                                                                               |
| Same key, same binding, within D-102 window         | Re-authorize under §7; no unsettled assessment; item still active; recompute/compare stored canonical digest; return pinned original body with `replayed: true`, original `deliveredAt`; **no new event** |
| Same key, same binding, current authorization fails | Refuse; no body                                                                                                                                                                                           |
| Same key, different binding                         | `OPERATION_KEY_CONFLICT`; no body                                                                                                                                                                         |
| Same key, after window                              | `OPERATION_KEY_EXPIRED`; **no body**; no event                                                                                                                                                            |
| New key after expiry                                | Fresh delivery; new context and exposure                                                                                                                                                                  |
| D-102 unresolved                                    | Refuse all teaching delivery (`RETRY_WINDOW_UNRESOLVED`)                                                                                                                                                  |

- **Lost response after commit**: the client retries with the same key and
  gets a replay. The replay never moves exposure time forward, so an old
  exposure is never reported or counted as fresh learning.
- **Known rollback before commit:** no context exists; retry may be first
  delivery. A timeout or lost commit acknowledgement is ambiguous, not proof
  of rollback. Retry enters §7 and re-reads the unique key; uniqueness handles
  an earlier transaction still committing. An unavailable/uncertain store
  always returns no body, never a success-shaped default.
- Expiry is derived from `deliveredAt` plus the pinned D-102 policy reference.
  A replay is valid only while server time is strictly before expiry; exactly
  at expiry it refuses. D-102 must approve a positive retry window strictly
  shorter than the applicable D-21 delayed-check minimum. Missing or
  incompatible values refuse delivery. Repeated replay cannot extend expiry.
  A window shorter than the delay is not enough to preserve a full D-21 gap
  after redisclosure. D-102's proposed contract therefore uses the context's
  fixed expiry as a conservative exposure horizon for delayed eligibility,
  even if no replay happens. Earliest delayed eligibility is that horizon
  plus D-21's minimum, and any later help/acknowledgement resets it.
  Store `TEACHING_VIEWED.occurredAt` as actual delivery time, never a fabricated
  future event. The delayed reader separately takes the maximum of actual
  exposure timestamps and persisted contexts' expiry horizons.
  Missing historical policy needed to resolve a horizon denies eligibility.
  Owner approval and tests must cover this conservative scheduling effect;
  no new numeric delay default is introduced. Network transit and saved
  public material remain outside the observation guarantee (§10).
- ADR-0014 recall cards keep their own no-window per-request rule (R6) and
  `recall-card:` content ids. Recall events carry no delivery context, so lesson
  attribution for them is "unavailable"; the two rules must not be merged.

## 7. Concurrency linearization (mandatory prerequisite, not current behavior)

Serializable isolation alone does not force a concurrent exposure insert and
eligibility read to abort: a single read/write dependency can be serializable.
An exposure re-read outside the assignment transaction is additionally stale.
Use one concrete shared interlock before any teaching writer is enabled:

- Lock the existing learner row with `SELECT ... FOR UPDATE`, scoped to its
  authenticated household, before decision reads or writes in a Read Committed
  transaction. Reads performed after the lock see the latest committed state.
  **Every participant must use Read Committed and acquire this lock as its
  first database statement**, then re-read scoped learner/actor state.
  Existing Serializable assignment/result transactions must be explicitly
  converted and preserve their other race invariants under the coarse lock.
  Mixing old Serializable/Repeatable Read snapshots into the protocol is
  prohibited. Incomplete participation blocks serving.
  This is a deliberately coarse per-learner MVP lock, not a new policy number.
  Never reuse a snapshot or eligibility result obtained before acquiring it.
- New teaching, replay and acknowledgement; assessment assignment creation,
  resumption/body delivery and scoring; and all persisted exposure writers
  acquire this same lock. Existing Phase 1 attempt, assistance, tutor
  interaction/trace and remediation delivery paths must participate or be
  denied during overlapping assessment activity before teaching serving.
  This cross-surface change is a separately reviewed prerequisite, not a
  mechanical change hidden in this specification.
- Assignment eligibility and item exclusions are rederived under the lock
  inside creation, using a fresh server clock. D-31/D-32 result prior-work
  counts are also re-read under the lock. Duplicate delivery keys use the
  existing unique constraint, then validate their full tuple; database errors
  abort and release the lock without returning a body.
- Under proposed D-140 refusal semantics, every new delivery, replay,
  acknowledgement or help operation conservatively refuses while **any**
  learner assignment or lease is nonterminal/unsettled, across all kinds and
  versions. This stricter MVP rule avoids inferring coverage from incomplete
  historical bank metadata. Expired-but-unsettled runs also refuse; the
  existing assessment lifecycle settles them separately through terminal
  result rules, never from the teaching request. Assignment creation commits its active
  state while holding the lock. If assignment wins, subsequent instruction
  refuses; if exposure wins, delayed eligibility resets before assignment.
  Allowed invalidation/remediation is a separate D-140 branch, not SSI magic.
- Use a fresh server clock after acquiring the lock for delivery, expiry and
  eligibility. Do not use PostgreSQL transaction-start `now()` or timestamps
  captured before waiting as the delivered timestamp.
- A provider call must not run under a database lock. The provider may compute
  outside it without disclosing output; reacquire the lock, reauthorize and
  persist its exposure before returning help. In-flight requests that cannot
  honor this rule block serving. No provider is invoked by this packet.
- A process uses immutable catalog/policy snapshots; a request pins their
  versions. Activation/retirement must drain in-flight operations or share a
  coordinated activation interlock before changing eligible snapshots. An
  implementation without that atomic lifecycle protocol remains disabled.

Falsifying tests must force both operation orders with barriers, not merely
assert isolation configuration. The interlock cannot claim unobservable
client receipt, public rereading or outside help is ordered.

## 8. Separation of facts and effects

| Fact                                | Recorded as                                                                                         | Is not                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Content delivered                   | context + `TEACHING_VIEWED`                                                                         | proof of viewing, reading or understanding                    |
| Browser viewing                     | not recorded (no client beacon)                                                                     | —                                                             |
| Authenticated actor acknowledgement | `TEACHING_COMPLETED` only after D-138, explicit action on learner surface, at most once per context | verified learner identity, comprehension, completion, mastery |
| Lesson completion                   | separate evaluator (D-79, D-93, D-126, D-137)                                                       | any teaching event                                            |
| Mastery / attempt evidence          | never created by teaching                                                                           | —                                                             |

An acknowledgement, if D-138 and its shared scope are approved, is a separate
POST referencing the exact delivered context, after the body response and an
explicit action on the learner surface. It reauthenticates/rechecks current eligibility under
§7; a unique context/kind relation makes retries idempotent. Reject guessed,
cross-tenant, mismatched, inactive or run-overlapping contexts. A late action
may record a new acknowledgement timestamp only if authorized; it is not a
body replay and cannot bypass D-102 to return instruction. It claims only
that the authenticated actor acknowledged the delivered record, not proven
learner identity or comprehension.

- `TEACHING_VIEWED` keeps its name but means **server delivery**. Parent
  wording says "delivered", never "viewed", "read" or "completed".
- The interval between delivery and acknowledgement is not elapsed-time
  evidence (D-39); no dwell timer exists.
- Delivered exposure counts as D-31/D-32 prior work and resets the delayed
  window by skill code, regardless of which lesson delivered it (current
  readers already behave so). Acknowledgement, when approved, also resets it.
- Eligibility uses the maximum over actual help events and replay horizons
  (§6); the event log never invents future exposure.
- No blanket teaching prerequisite: the D-31 zero-work first-run PASS skip
  remains available without any teaching delivery.
- No ordinary lesson-completion evaluator is introduced or implied.

## 9. Lifecycle, audit, privacy, export, deletion

- States: `delivered` (context exists), `acknowledged` (ack event exists),
  `replay-expired` (derived). The context row is never updated.
- Refusals and errors persist nothing learner-scoped; logs carry ids and reason
  codes only, never content bodies or free text. A persisted refusal audit is a
  separate privacy choice (D-144).
- Export and delete must enumerate the PROPOSED context (and any FK) in
  `HOUSEHOLD_DATA_MODEL_COVERAGE` **before** any writer exists; the coverage
  test enumerating `Prisma.dmmf` must fail until it does. Whether the
  operation key appears in export is D-143.
- Teaching archive rows are global content, not learner data.
- T3 records retention/erasure treatment in `docs/privacy-inventory.md`.
  Delete referencing LearningEvents before delivery contexts in the same
  scoped household deletion transaction. Legacy null links remain valid and
  never invent attribution. Learner contexts/events are erasable; global
  authored content history is not learner data.

## 10. Flags, rollback, legacy and public limits

- A teaching feature flag and the release gate can only **deny**. With either
  off: no body, no context, no event. Grants, prerequisites, readiness,
  household and role checks are always on and are independent of C4 flags.
- Rollback removes or disables the route; it never leaves a read-only path.
- Legacy phase1 sessions stay unchanged and fail-open while C4 is off. No
  "safe teaching" claim is made for any surface before C4 cutover.
- Public projection (D-58) and out-of-band exposure (books, sibling, other
  sites) are unrecorded. Delay windows may under-count; the guarantee covers
  authenticated course delivery only. Whether to withhold public teaching for
  delayed-check programs is deferred and would require a separate change
  to D-58; this packet does not request or imply that change.
  The current site input is practice-only. Wiring teaching into that generator
  is a separate reviewed publication increment under D-58, not part of
  authenticated exposure serving.

## 11. Staging

| Stage | Content                                                                                                           | Gate                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| T0    | This specification                                                                                                | Independent review                                                                                               |
| T1    | Disconnected Zod schemas and pure synthetic fixtures; no writers, routes, content                                 | Contract approval and D-139/D-142 shape decisions                                                                |
| T2    | Migration + human-reviewed `down.sql`; scratch forward/down/reapply evidence, separately                          | Migration + privacy review; D-142; no writers                                                                    |
| T3    | Export/delete enumeration and tests                                                                               | Privacy review; D-143/D-144; before writer                                                                       |
| T4a   | Shared interlock and shadow evidence; permanent C4 prerequisites and activation protocol; teaching still disabled | Independent implementation review, representative shadow review and owner sign-off                               |
| T4b   | Atomic exposure/context writer + authenticated serving, with all §7 surfaces wired                                | D-100/D-102/D-139/D-140/D-141, per-program access and content approval; T2/T3/T4a complete; manual serving gates |
| Later | Acknowledgement (D-138), completion evaluator, real authoring (D-61), registration, release                       | Each separately                                                                                                  |

No production down migration that destroys delivery/exposure evidence after
the first write; disable serving and forward-fix while retaining audit.
Household erasure remains permitted through the reviewed deletion path.

## 12. Synthetic fixtures

At least two non-math, no-assessment synthetic fixtures (for example a
spelling-style and a vocabulary-style skill), with invented codes and hashes
computed from exact synthetic fixture bytes,
in the style of `tests/curriculum/fixtures/synthetic-course-catalog.ts`.
Because `LessonSchema` requires `assessmentBankRef`, T1 must **not** fabricate
banks; a no-assessment lesson schema change is a prerequisite **outside this
packet**. Until then, no-assessment fixtures exercise only the teaching
context/item schemas, not `LessonSchema` or active course membership.
Fixtures must be labeled disconnected: they do not prove full course or
no-assessment policy generality, which requires the separate schema increment.

## 13. Claim-to-test matrix

All rows are **prospective** unless marked existing; none is claimed passed.
Runners: pure `npm test` (`tests/progression/*.test.ts`, `tests/content`,
`tests/curriculum`); integration only via `npm run test:integration`
(`tests/progression-integration`, `tests/persistence`); browser via
`npm run test:e2e`. Never run broad vitest over `tests/progression`.

| Claim                                                                      | File                                                                | Runner      | Falsifying assertion                                                                                                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalog membership is exact pinned refs                                    | `tests/content/teaching-catalog.test.ts`                            | npm test    | extra, missing, unreviewed, non-teaching or hash-mismatched member fails load                                                                                                                                      |
| Teaching failure does not break practice import                            | `tests/content/teaching-catalog.test.ts`                            | npm test    | `contentCatalog` loads; teaching reports `TEACHING_CATALOG_UNAVAILABLE`                                                                                                                                            |
| Canonical vs raw digest never conflated                                    | `tests/content/teaching-catalog.test.ts`                            | npm test    | build manifest verifies raw fixture bytes; runtime compares canonical digest; historical check never reconstructs raw bytes; cross-role id@version collision rejected                                              |
| Practice archive resolver still rejects teaching                           | `tests/persistence/content-archive.test.ts` (existing file)         | integration | teaching key returns `undefined`                                                                                                                                                                                   |
| Context schema is strict and complete                                      | `tests/progression/teaching-delivery-context.test.ts`               | npm test    | each missing pin rejected; no defaults                                                                                                                                                                             |
| Same item, two lesson versions → exact contexts                            | `tests/progression/teaching-delivery-context.test.ts`               | npm test    | each context carries its own lesson version                                                                                                                                                                        |
| Retry table semantics                                                      | `tests/progression/teaching-idempotency.test.ts`                    | npm test    | conflict, expired (no body), new key new exposure, unresolved window refuses                                                                                                                                       |
| Orchestration contains no policy                                           | `tests/progression/teaching-delivery-contract.test.ts`              | npm test    | stub policy deny → no store call; no grant logic in orchestrator                                                                                                                                                   |
| Two non-math no-assessment fixtures                                        | `tests/progression/teaching-delivery-contract.test.ts`              | npm test    | disconnected item/context fixtures parse without fabricated banks; not a full LessonSchema or active membership claim                                                                                              |
| Tenant/role/policy/readiness/version/ended/revoked mismatch denied         | `tests/progression-integration/teaching-delivery.test.ts`           | integration | each mismatch: refusal code, no body, zero contexts/events                                                                                                                                                         |
| Session kind mismatch                                                      | `tests/progression-integration/teaching-delivery.test.ts`           | integration | session id on teaching, context id on attempt/hint/tutor refused                                                                                                                                                   |
| DB failure before commit returns no payload                                | `tests/progression-integration/teaching-delivery.test.ts`           | integration | injected failure: no body, no rows                                                                                                                                                                                 |
| Lost response replay                                                       | `tests/progression-integration/teaching-delivery.test.ts`           | integration | same key replays original `deliveredAt`; event count unchanged                                                                                                                                                     |
| Expired replay                                                             | `tests/progression-integration/teaching-delivery.test.ts`           | integration | `OPERATION_KEY_EXPIRED`, no body, exposure unchanged                                                                                                                                                               |
| Replay re-authorizes; archived item cannot authorize                       | `tests/progression-integration/teaching-delivery.test.ts`           | integration | revoked grant or archived item → refusal; history row retained                                                                                                                                                     |
| Simultaneous delivery/replay/ack/help and assessment completion/assignment | `tests/progression-integration/teaching-concurrency.test.ts`        | integration | barrier-forced both lock orders; every participant is Read Committed/lock-first; old Serializable participant rejected by wiring assertion; assignment-first denies help/replay, exposure-first resets eligibility |
| Exposure is max across later help events (D-21 boundary)                   | `tests/progression/delay-window.test.ts` (existing file)            | npm test    | below/at/above delay, empty set denied, later help resets; D-39 dwell value never evidence                                                                                                                         |
| Replay window preserves a full delay after redisclosure                    | `tests/progression/teaching-idempotency.test.ts`                    | npm test    | missing/nonpositive or window at/above delay denied; expiry boundary refuses; check in delivery+delay but before expiry+delay denied; repeated retry leaves actual timestamp/expiry unchanged                      |
| Acknowledgement binds the actual delivered context only                    | `tests/progression-integration/teaching-delivery.test.ts`           | integration | cross-tenant/undelivered/mismatched context refused, same-key ack creates one event, late authorized ack resets delay without body                                                                                 |
| Delivery is D-31 prior work; zero-work skip unchanged                      | `tests/progression/learner-state.test.ts` (existing file)           | npm test    | delivered skill blocks skip; no-delivery PASS still skips                                                                                                                                                          |
| No completion/mastery/attempt side effects                                 | `tests/progression-integration/teaching-delivery.test.ts`           | integration | no `Attempt`, `MasteryContribution`, `LearnerLessonState` change                                                                                                                                                   |
| No teaching leakage into attempt/hint/private banks/export                 | `tests/progression-integration/api-leakage.test.ts` (existing file) | integration | teaching body absent from attempt, hint, tutor, bank, export and log payloads; teaching response contains only allowlist                                                                                           |
| Export/delete cover context                                                | `tests/progression/household-data-coverage.test.ts` (existing file) | npm test    | new model unclassified → failure                                                                                                                                                                                   |
| Public projection writes no events                                         | `tests/content/publication.test.ts` (existing, untracked)           | npm test    | generator path has no DB dependency                                                                                                                                                                                |
| Flags off deny; rollback no bypass                                         | `tests/progression-integration/teaching-delivery.test.ts`           | integration | flag/gate off: no body/rows; C4 off does not relax grant checks                                                                                                                                                    |
| Legacy unchanged                                                           | `tests/progression/release-gates.test.ts` (existing file)           | npm test    | phase1 behaviour identical; no teaching path through `enforceProgressionAuthorizationOrThrow`                                                                                                                      |
| Learner journey and wording                                                | `tests/browser/teaching-delivery.spec.ts`                           | test:e2e    | "delivered" wording, automated axe and keyboard checks; no "viewed/read" claims; announcement quality is manual                                                                                                    |
| Authenticated teaching cannot be cached or fetched without exposure        | `tests/progression-integration/teaching-delivery.test.ts`           | integration | POST response private/no-store; GET/prefetch no body; rollback leaves no eventless route                                                                                                                           |
| Null legacy context never invents attribution                              | `tests/progression/teaching-delivery-context.test.ts`               | npm test    | co-written lesson row or shared item cannot attribute an unlinked legacy event                                                                                                                                     |
| Unsettled assessment never causes teaching to mutate assessment state      | `tests/progression-integration/teaching-delivery.test.ts`           | integration | expired/nonterminal assignment refuses with no content/event/result mutation; separate lifecycle settling permits later delivery                                                                                   |
| Exact active ownership and manifest remain stable on replay                | `tests/content/teaching-catalog.test.ts`                            | npm test    | mismatched bidirectional ownership and changed canonical digest denied; retirement drains pending requests before snapshot change                                                                                  |

## 14. Human gates (separate from tests)

Accessibility (WCAG 2.2 AA manual pass), parent/learner wording, privacy
(export, operation key, actor fields), content review per D-61, migration
review including `down.sql`, and release. No automated test substitutes.

## 15. Sole decision authority

D-139 (actor), D-140 (overlapping assessment), D-141 (shared scope),
D-142 (persistence shape), D-143 (key export) and D-144 (refusal audit) are
routed to `docs/course-progression-decisions.md`. Only that matrix contains
recommendations, alternatives, owner roles, approval status and blocked stages.
All remain OPEN; the proposed shape and branches above are not approved.
Numeric retry policy still belongs to D-102, not a new local decision.

## 16. Extension checklist (per program adopting teaching)

1. Approved shared scope (D-141), per-program grant adoption and policy version granting
   `TEACHING`.
2. Reviewed teaching records under D-61 and volume decision (D-92/D-123 or
   equivalent).
3. Lessons pin exact ItemRefs; catalog loads with matching hashes.
4. No-assessment schema change approved if the program needs it.
5. Fixtures and matrix rows added for the program; existing rows still pass.
6. Wording, accessibility and privacy gates recorded.

## 17. Reviewer handoff

Verify against live code: §2 line citations; that no TEACHING grant exists;
that `validateContentCatalog` remains practice-only; that the eligibility read
in the assignment route sits outside the Serializable transaction; that
`requireHouseholdContext` returns `PARENT` only. Check that no number,
duration or volume is introduced, that every persistence item is marked
PROPOSED, and that D-100/D-102/D-138 are consumed, not resolved.

## 18. Exact next task

After owner approval of this contract and required schema-shape decisions
D-139/D-142: **T1** — add disconnected
strict Zod schemas for the teaching catalog membership, delivery context and
operation-key binding, plus two non-math synthetic fixtures, and the pure
tests in `tests/content/teaching-catalog.test.ts`,
`tests/progression/teaching-delivery-context.test.ts` and
`tests/progression/teaching-idempotency.test.ts`, run via `npm test`. No
writer, route, migration, content or registration.
