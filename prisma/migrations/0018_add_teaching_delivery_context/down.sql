-- UNREVIEWED DRAFT (TEACH-T2A): written by an implementation agent, not
-- human-reviewed. Valid only before the first write. Refuses to drop any
-- teaching delivery evidence; after a first write use forward-fix or the
-- archive-then-drop procedure, never this file.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."TeachingDeliveryContext" LIMIT 1)
    OR EXISTS (SELECT 1 FROM "public"."LearningEvent" WHERE "deliveryContextId" IS NOT NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot remove non-empty teaching delivery evidence; it is retained until household erasure';
  END IF;
END
$$;

DROP TRIGGER "LearningEvent_truncate_guard" ON "public"."LearningEvent";
DROP TRIGGER "TeachingDeliveryContext_truncate_guard" ON "public"."TeachingDeliveryContext";
DROP TRIGGER "LearningEvent_viewed_not_orphaned" ON "public"."LearningEvent";
DROP TRIGGER "TeachingDeliveryContext_requires_viewed" ON "public"."TeachingDeliveryContext";
DROP TRIGGER "LearningEvent_link_time" ON "public"."LearningEvent";
DROP TRIGGER "LearningEvent_link_immutable" ON "public"."LearningEvent";
DROP TRIGGER "TeachingDeliveryContext_immutable" ON "public"."TeachingDeliveryContext";

DROP FUNCTION "public"."prevent_teaching_evidence_truncate"();
DROP FUNCTION "public"."require_teaching_context_viewed"();
DROP FUNCTION "public"."check_learning_event_link_time"();
DROP FUNCTION "public"."prevent_learning_event_link_update"();
DROP FUNCTION "public"."prevent_teaching_delivery_context_update"();

ALTER TABLE "public"."LearningEvent" DROP CONSTRAINT "LearningEvent_teaching_requires_context";
ALTER TABLE "public"."LearningEvent" DROP CONSTRAINT "LearningEvent_context_requires_content";
ALTER TABLE "public"."LearningEvent" DROP CONSTRAINT "LearningEvent_deliveryContextId_householdId_learnerProfile_fkey";
DROP INDEX "public"."LearningEvent_deliveryContextId_kind_key";
ALTER TABLE "public"."LearningEvent" DROP COLUMN "deliveryContextId";

DROP TABLE "public"."TeachingDeliveryContext";

DROP INDEX "public"."LearnerProfile_id_householdId_key";
DROP INDEX "public"."User_id_householdId_role_key";
