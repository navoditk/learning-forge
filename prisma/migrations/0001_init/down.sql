-- Local-only rollback for 0001_init. Do not use as an account deletion workflow.
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0001_init';

DROP TRIGGER IF EXISTS "Attempt_immutable" ON "Attempt";
DROP FUNCTION IF EXISTS "public"."prevent_attempt_update"();

DROP TABLE IF EXISTS "MasteryContribution" CASCADE;
DROP TABLE IF EXISTS "MasteryEstimate" CASCADE;
DROP TABLE IF EXISTS "TutorTrace" CASCADE;
DROP TABLE IF EXISTS "TutorInteraction" CASCADE;
DROP TABLE IF EXISTS "AssistanceEvent" CASCADE;
DROP TABLE IF EXISTS "Attempt" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "ConsentRecord" CASCADE;
DROP TABLE IF EXISTS "LearnerProfile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Household" CASCADE;

DROP TYPE IF EXISTS "ConfidenceBand";
DROP TYPE IF EXISTS "TraceOutcome";
DROP TYPE IF EXISTS "TraceValidationResult";
DROP TYPE IF EXISTS "TutorInteractionType";
DROP TYPE IF EXISTS "AssistanceLevel";
DROP TYPE IF EXISTS "ScoringMethod";
DROP TYPE IF EXISTS "Correctness";
DROP TYPE IF EXISTS "AttemptContext";
DROP TYPE IF EXISTS "ConsentStatus";
DROP TYPE IF EXISTS "ConsentType";
DROP TYPE IF EXISTS "UserRole";
