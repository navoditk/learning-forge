DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0004_add_tutor_trace_session';

DROP INDEX "public"."TutorTrace_sessionId_createdAt_idx";
ALTER TABLE "public"."TutorTrace" DROP COLUMN "sessionId";
