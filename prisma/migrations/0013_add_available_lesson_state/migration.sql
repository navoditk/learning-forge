-- A placement-skipped lesson becomes available when its skill later lapses.
ALTER TYPE "public"."LessonCompletionStatus" ADD VALUE 'AVAILABLE';
