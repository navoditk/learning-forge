-- UNREVIEWED DRAFT (TEACH-T2A). Authored by an implementation agent; it has
-- not had independent or human migration review and must not be integrated or
-- deployed before both. Creates schema only: no writer, backfill or data.
--
-- Prisma-generated parts: columns, tables, unique indexes and foreign keys.
-- Hand-written parts (Prisma cannot express them and does not diff them):
-- CHECK constraints, trigger functions, triggers, TRUNCATE guards.

-- AlterTable
ALTER TABLE "LearningEvent" ADD COLUMN     "deliveryContextId" TEXT;

-- CreateTable
-- deliveredAt deliberately has no DEFAULT: the future writer supplies the clock.
CREATE TABLE "TeachingDeliveryContext" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "operationKey" TEXT NOT NULL,
    "activityKind" "ProgressionActivityKind" NOT NULL,
    "programCode" TEXT NOT NULL,
    "programVersion" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "unitVersion" TEXT NOT NULL,
    "lessonCode" TEXT NOT NULL,
    "lessonVersion" TEXT NOT NULL,
    "skillCode" TEXT NOT NULL,
    "skillVersion" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemVersion" TEXT NOT NULL,
    "authoredHash" TEXT NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "teachingCatalogCode" TEXT NOT NULL,
    "teachingCatalogVersion" TEXT NOT NULL,
    "accessPolicyCode" TEXT NOT NULL,
    "accessPolicyVersion" TEXT NOT NULL,
    "policyProfileCode" TEXT NOT NULL,
    "policyProfileVersion" TEXT NOT NULL,
    "retryWindowPolicyCode" TEXT NOT NULL,
    "retryWindowPolicyVersion" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingDeliveryContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeachingDeliveryContext_learnerProfileId_operationKey_key" ON "TeachingDeliveryContext"("learnerProfileId", "operationKey");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingDeliveryContext_id_householdId_learnerProfileId_ski_key" ON "TeachingDeliveryContext"("id", "householdId", "learnerProfileId", "skillCode", "skillVersion", "itemId", "itemVersion");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_householdId_role_key" ON "User"("id", "householdId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_id_householdId_key" ON "LearnerProfile"("id", "householdId");

-- CreateIndex
-- NULL deliveryContextId values stay distinct, so legacy rows are unaffected.
CREATE UNIQUE INDEX "LearningEvent_deliveryContextId_kind_key" ON "LearningEvent"("deliveryContextId", "kind");

-- AddForeignKey
-- NO ACTION (not RESTRICT) so a household/learner cascade can delete contexts
-- and users in one statement. The actor FK also refuses a later role or
-- household change of a referenced parent.
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_deliveryContextId_householdId_learnerProfile_fkey" FOREIGN KEY ("deliveryContextId", "householdId", "learnerProfileId", "skillCode", "skillVersion", "contentId", "contentVersion") REFERENCES "TeachingDeliveryContext"("id", "householdId", "learnerProfileId", "skillCode", "skillVersion", "itemId", "itemVersion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TeachingDeliveryContext" ADD CONSTRAINT "TeachingDeliveryContext_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TeachingDeliveryContext" ADD CONSTRAINT "TeachingDeliveryContext_learnerProfileId_householdId_fkey" FOREIGN KEY ("learnerProfileId", "householdId") REFERENCES "LearnerProfile"("id", "householdId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TeachingDeliveryContext" ADD CONSTRAINT "TeachingDeliveryContext_actorUserId_householdId_actorRole_fkey" FOREIGN KEY ("actorUserId", "householdId", "actorRole") REFERENCES "User"("id", "householdId", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Defense-in-depth CHECKs mirroring the T1 shapes. They are weaker than Zod
-- (btrim and POSIX classes differ from JS trim), so writers must parse first.
ALTER TABLE "TeachingDeliveryContext"
  ADD CONSTRAINT "TeachingDeliveryContext_actor_role_parent" CHECK ("actorRole" = 'PARENT'),
  ADD CONSTRAINT "TeachingDeliveryContext_activity_kind_teaching" CHECK ("activityKind" = 'TEACHING'),
  ADD CONSTRAINT "TeachingDeliveryContext_id_length" CHECK (char_length("id") BETWEEN 1 AND 200),
  ADD CONSTRAINT "TeachingDeliveryContext_operation_key_length" CHECK (char_length("operationKey") BETWEEN 1 AND 200),
  ADD CONSTRAINT "TeachingDeliveryContext_code_format" CHECK (
    "programCode" ~ '^[a-z0-9-]+$'
    AND "unitCode" ~ '^[a-z0-9-]+$'
    AND "lessonCode" ~ '^[a-z0-9-]+$'
    AND "skillCode" ~ '^[a-z0-9-]+$'
    AND "itemId" ~ '^[a-z0-9-]+$'
    AND "teachingCatalogCode" ~ '^[a-z0-9-]+$'
    AND "accessPolicyCode" ~ '^[a-z0-9-]+$'
    AND "policyProfileCode" ~ '^[a-z0-9-]+$'
    AND "retryWindowPolicyCode" ~ '^[a-z0-9-]+$'
  ),
  ADD CONSTRAINT "TeachingDeliveryContext_version_format" CHECK (
    char_length("programVersion") BETWEEN 1 AND 100 AND "programVersion" = btrim("programVersion")
    AND char_length("unitVersion") BETWEEN 1 AND 100 AND "unitVersion" = btrim("unitVersion")
    AND char_length("lessonVersion") BETWEEN 1 AND 100 AND "lessonVersion" = btrim("lessonVersion")
    AND char_length("skillVersion") BETWEEN 1 AND 100 AND "skillVersion" = btrim("skillVersion")
    AND char_length("itemVersion") BETWEEN 1 AND 100 AND "itemVersion" = btrim("itemVersion")
    AND char_length("teachingCatalogVersion") BETWEEN 1 AND 100 AND "teachingCatalogVersion" = btrim("teachingCatalogVersion")
    AND char_length("accessPolicyVersion") BETWEEN 1 AND 100 AND "accessPolicyVersion" = btrim("accessPolicyVersion")
    AND char_length("policyProfileVersion") BETWEEN 1 AND 100 AND "policyProfileVersion" = btrim("policyProfileVersion")
    AND char_length("retryWindowPolicyVersion") BETWEEN 1 AND 100 AND "retryWindowPolicyVersion" = btrim("retryWindowPolicyVersion")
  ),
  ADD CONSTRAINT "TeachingDeliveryContext_digest_format" CHECK (
    "authoredHash" ~ '^sha256:[a-f0-9]{64}$' AND "canonicalHash" ~ '^sha256:[a-f0-9]{64}$'
  );

-- A linked event must carry all seven FK columns: MATCH SIMPLE skips the FK
-- when any column is NULL, so this closes that escape. Legacy rows (null
-- deliveryContextId) are unaffected.
ALTER TABLE "LearningEvent"
  ADD CONSTRAINT "LearningEvent_context_requires_content" CHECK (
    "deliveryContextId" IS NULL OR ("contentId" IS NOT NULL AND "contentVersion" IS NOT NULL)
  ),
  ADD CONSTRAINT "LearningEvent_teaching_requires_context" CHECK (
    ("kind" IN ('TEACHING_VIEWED', 'TEACHING_COMPLETED')) = ("deliveryContextId" IS NOT NULL)
  );

-- Context rows are immutable; DELETE stays allowed so erasure works.
CREATE FUNCTION "public"."prevent_teaching_delivery_context_update"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'TeachingDeliveryContext is immutable';
END;
$$;

CREATE TRIGGER "TeachingDeliveryContext_immutable"
BEFORE UPDATE ON "public"."TeachingDeliveryContext"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_teaching_delivery_context_update"();

-- Linked events are frozen, and a legacy event can neither gain nor lose a link.
CREATE FUNCTION "public"."prevent_learning_event_link_update"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD."deliveryContextId" IS NOT NULL
    OR NEW."deliveryContextId" IS DISTINCT FROM OLD."deliveryContextId" THEN
    RAISE EXCEPTION 'A teaching-linked LearningEvent is immutable and its link cannot change';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "LearningEvent_link_immutable"
BEFORE UPDATE ON "public"."LearningEvent"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_learning_event_link_update"();

-- Exact time rule: the VIEWED occurrence is the delivery instant; COMPLETED is
-- never earlier. The tenant/learner/skill/item pins are enforced by the FK.
CREATE FUNCTION "public"."check_learning_event_link_time"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  delivered TIMESTAMP(3);
BEGIN
  IF NEW."deliveryContextId" IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT "deliveredAt" INTO delivered
  FROM "public"."TeachingDeliveryContext"
  WHERE "id" = NEW."deliveryContextId";
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked teaching delivery context does not exist';
  END IF;
  IF NEW."kind" = 'TEACHING_VIEWED' AND NEW."occurredAt" IS DISTINCT FROM delivered THEN
    RAISE EXCEPTION 'TEACHING_VIEWED occurredAt must equal the context deliveredAt';
  END IF;
  IF NEW."kind" = 'TEACHING_COMPLETED' AND NEW."occurredAt" < delivered THEN
    RAISE EXCEPTION 'TEACHING_COMPLETED occurredAt must not precede the context deliveredAt';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "LearningEvent_link_time"
BEFORE INSERT ON "public"."LearningEvent"
FOR EACH ROW EXECUTE FUNCTION "public"."check_learning_event_link_time"();

-- At commit, a surviving context must still have its TEACHING_VIEWED event
-- (a context alone is invisible to prior-work readers), and a deleted VIEWED
-- event must take its context with it: erase the pair, never the exposure alone.
CREATE FUNCTION "public"."require_teaching_context_viewed"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  context_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'TeachingDeliveryContext' THEN
    context_id := NEW."id";
  ELSE
    IF OLD."deliveryContextId" IS NULL OR OLD."kind" <> 'TEACHING_VIEWED' THEN
      RETURN NULL;
    END IF;
    context_id := OLD."deliveryContextId";
  END IF;
  IF EXISTS (SELECT 1 FROM "public"."TeachingDeliveryContext" WHERE "id" = context_id)
    AND NOT EXISTS (
      SELECT 1 FROM "public"."LearningEvent"
      WHERE "deliveryContextId" = context_id AND "kind" = 'TEACHING_VIEWED'
    ) THEN
    RAISE EXCEPTION 'TeachingDeliveryContext % requires its TEACHING_VIEWED event', context_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER "TeachingDeliveryContext_requires_viewed"
AFTER INSERT ON "public"."TeachingDeliveryContext"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "public"."require_teaching_context_viewed"();

CREATE CONSTRAINT TRIGGER "LearningEvent_viewed_not_orphaned"
AFTER DELETE ON "public"."LearningEvent"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "public"."require_teaching_context_viewed"();

-- TRUNCATE skips row triggers, so statement-level guards refuse it while
-- evidence exists (including CASCADE from Household/LearnerProfile/User).
-- Legacy TRUNCATE of unlinked events stays allowed. Erasure uses DELETE.
CREATE FUNCTION "public"."prevent_teaching_evidence_truncate"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."TeachingDeliveryContext")
    OR EXISTS (SELECT 1 FROM "public"."LearningEvent" WHERE "deliveryContextId" IS NOT NULL) THEN
    RAISE EXCEPTION 'Cannot TRUNCATE %: teaching delivery evidence exists', TG_TABLE_NAME;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER "LearningEvent_truncate_guard"
BEFORE TRUNCATE ON "public"."LearningEvent"
FOR EACH STATEMENT EXECUTE FUNCTION "public"."prevent_teaching_evidence_truncate"();

CREATE TRIGGER "TeachingDeliveryContext_truncate_guard"
BEFORE TRUNCATE ON "public"."TeachingDeliveryContext"
FOR EACH STATEMENT EXECUTE FUNCTION "public"."prevent_teaching_evidence_truncate"();
