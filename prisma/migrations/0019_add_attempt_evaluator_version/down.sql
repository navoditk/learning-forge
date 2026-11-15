-- UNREVIEWED DRAFT (PYTHON-IMPLEMENT): written by an implementation agent, not
-- human-reviewed. Local synthetic database only; never run against production.
-- Refuses to drop recorded evaluator versions: they are scoring provenance for
-- retained attempts. Valid only while every value is still NULL; after that use
-- forward-fix or an archive-then-drop procedure, never this file.
--
-- One transaction: the table lock is taken BEFORE the check and held through the
-- DROP, so no attempt can gain a value between the check and the drop. SHARE ROW
-- EXCLUSIVE blocks every concurrent INSERT, UPDATE and DELETE on "Attempt"
-- (reads continue) and waits for in-flight writers to commit first.
BEGIN;

LOCK TABLE "public"."Attempt" IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."Attempt" WHERE "evaluatorVersion" IS NOT NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot remove Attempt.evaluatorVersion while attempts record an evaluator version';
  END IF;
END
$$;

ALTER TABLE "public"."Attempt" DROP COLUMN "evaluatorVersion";

COMMIT;
