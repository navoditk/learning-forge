-- Preserve the actor and active run/session tuple for new shadow observations.
-- Existing rows remain nullable historical evidence and must be reviewed before
-- any cutover decision; this migration does not authorize C4.
ALTER TABLE "public"."ShadowDecision"
  ADD COLUMN "actorUserId" TEXT,
  ADD COLUMN "actorRole" "public"."OverrideActorRole",
  ADD COLUMN "activeRunOrSessionId" TEXT;
