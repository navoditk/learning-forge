-- AlterTable
-- Adds sign-in credentials to User, for the parent account (ADR-0008). No
-- existing rows have these set, so both columns start nullable rather than
-- backfilled: the synthetic fixture's rows are never meant to sign in.
ALTER TABLE "public"."User" ADD COLUMN "email" TEXT;
ALTER TABLE "public"."User" ADD COLUMN "passwordHash" TEXT;
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
