-- Distinguish progression evidence from the legacy Phase 1 contexts.
-- Authorization remains unchanged until the separately reviewed C4 cutover.
ALTER TYPE "public"."AttemptContext" ADD VALUE 'PLACEMENT';
ALTER TYPE "public"."AttemptContext" ADD VALUE 'LESSON_ASSESSMENT';
ALTER TYPE "public"."AttemptContext" ADD VALUE 'UNIT_ASSESSMENT';
ALTER TYPE "public"."AttemptContext" ADD VALUE 'DELAYED_CHECK';
ALTER TYPE "public"."AttemptContext" ADD VALUE 'REVIEW';
