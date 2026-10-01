-- D-72: bound online password guessing on sign-in and step-up. Existing
-- accounts start with no failures and no lock.
ALTER TABLE "public"."User"
  ADD COLUMN "failedPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "passwordLockedUntil" TIMESTAMP(3);
