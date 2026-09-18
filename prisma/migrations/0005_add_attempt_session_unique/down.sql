DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0005_add_attempt_session_unique';

DROP INDEX "public"."Attempt_sessionId_attemptNumber_key";
