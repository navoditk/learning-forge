-- Add the auditable terminal state for defective assessment assignments.
ALTER TYPE "public"."AssessmentRunStatus" ADD VALUE 'INVALIDATED';
