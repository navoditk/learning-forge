-- Prevents duplicate attempt numbers within the same session (e.g. a
-- double-submitted answer). NULL sessionId values are exempt in Postgres
-- (multiple NULLs are allowed in a unique index), which is fine since
-- createAttempt always writes a sessionId.
CREATE UNIQUE INDEX "Attempt_sessionId_attemptNumber_key"
ON "public"."Attempt"("sessionId", "attemptNumber");
