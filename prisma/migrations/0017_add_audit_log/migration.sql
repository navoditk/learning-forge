-- CreateEnum
CREATE TYPE "public"."AuditEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGIN_LOCKED', 'STEP_UP_SUCCESS', 'STEP_UP_FAILURE', 'STEP_UP_LOCKED', 'HOUSEHOLD_EXPORT', 'HOUSEHOLD_DELETE');

-- CreateTable
-- Deliberately no foreign keys: this table must remain queryable after the
-- household/user it refers to is deleted (see prisma/schema.prisma).
CREATE TABLE "public"."AuditLog" (
  "id" TEXT NOT NULL,
  "eventType" "public"."AuditEventType" NOT NULL,
  "householdId" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_householdId_createdAt_idx"
  ON "public"."AuditLog"("householdId", "createdAt");

CREATE INDEX "AuditLog_eventType_createdAt_idx"
  ON "public"."AuditLog"("eventType", "createdAt");
