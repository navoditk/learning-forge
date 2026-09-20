-- Down migration is intentionally refuse-first: silently coercing progression
-- evidence back into legacy contexts would corrupt its meaning.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "public"."Attempt"
    WHERE "context"::text IN ('PLACEMENT', 'LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK', 'REVIEW')
  ) THEN
    RAISE EXCEPTION 'Cannot reverse 0007 while progression-context attempts exist';
  END IF;
END $$;

CREATE TYPE "public"."AttemptContext_old" AS ENUM ('DIAGNOSTIC', 'PRACTICE', 'MASTERY_CHECK');
ALTER TABLE "public"."Attempt"
  ALTER COLUMN "context" TYPE "public"."AttemptContext_old"
  USING ("context"::text::"public"."AttemptContext_old");
DROP TYPE "public"."AttemptContext";
ALTER TYPE "public"."AttemptContext_old" RENAME TO "AttemptContext";
