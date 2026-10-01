-- D-47/D-70: a step-up re-authentication may authorize at most one override.
-- The unique index makes that single use atomic under concurrent requests.
CREATE UNIQUE INDEX "OverrideRecord_actorUserId_reauthAt_key"
  ON "public"."OverrideRecord"("actorUserId", "reauthAt");
