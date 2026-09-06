-- Local-only rollback for 0002_add_session_content_key. Do not use as a
-- production rollback; dropping this column loses which content item each
-- session was for.
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0002_add_session_content_key';

ALTER TABLE "public"."Session" DROP COLUMN "contentKey";
