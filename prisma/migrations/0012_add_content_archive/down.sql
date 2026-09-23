DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."ContentArchive" LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot remove non-empty ContentArchive; historical evidence must be retained';
  END IF;
END
$$;

DROP TABLE "public"."ContentArchive";
