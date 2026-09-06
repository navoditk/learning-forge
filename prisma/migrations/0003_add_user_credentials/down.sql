-- Local-only rollback for 0003_add_user_credentials. Do not use as a
-- production rollback once a real parent account exists: dropping these
-- columns loses the ability to sign in until the account is re-provisioned.
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0003_add_user_credentials';

DROP INDEX "public"."User_email_key";
ALTER TABLE "public"."User" DROP COLUMN "passwordHash";
ALTER TABLE "public"."User" DROP COLUMN "email";
