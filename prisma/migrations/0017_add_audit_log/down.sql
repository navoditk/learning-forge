DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."AuditLog" LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot remove non-empty AuditLog; it is the security/incident audit trail and must be retained';
  END IF;
END
$$;

DROP TABLE "public"."AuditLog";

DROP TYPE "public"."AuditEventType";
