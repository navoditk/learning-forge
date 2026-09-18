ALTER TABLE "public"."TutorTrace" ADD COLUMN "sessionId" TEXT;

CREATE INDEX "TutorTrace_sessionId_createdAt_idx"
ON "public"."TutorTrace"("sessionId", "createdAt");
