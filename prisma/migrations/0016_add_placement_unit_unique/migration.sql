-- D-71: at most one placement per learner and unit version, even when two
-- probes are scored concurrently.
CREATE UNIQUE INDEX "LearnerPlacement_learnerProfileId_unitCode_unitVersion_key"
  ON "public"."LearnerPlacement"("learnerProfileId", "unitCode", "unitVersion");
