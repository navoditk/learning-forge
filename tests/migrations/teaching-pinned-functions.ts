// Independently pinned, human-readable copies of the five reviewed trigger
// function bodies and their SHA-256 digests (over the trimmed pg_proc.prosrc).
// The catalog test compares the live database against this file and never reads
// the migration, so a migration edit that also rewrites a function cannot bless
// itself: this fixture and its digests must change in the same reviewed diff.
// Bodies were validated by the behavioral tests before being pinned.

export interface PinnedFunction {
  name: string;
  sha256: string;
  body: string;
}

export const PINNED_TEACHING_FUNCTIONS: readonly PinnedFunction[] = [
  {
    name: 'check_learning_event_link_time',
    sha256: 'bdcf64e7822ee312ea2ad66db48f72629a6dfeefaba7410824057efa59f40b19',
    body: `DECLARE
  delivered TIMESTAMP(3);
BEGIN
  IF NEW."deliveryContextId" IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT "deliveredAt" INTO delivered
  FROM "public"."TeachingDeliveryContext"
  WHERE "id" = NEW."deliveryContextId";
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked teaching delivery context does not exist';
  END IF;
  IF NEW."kind" = 'TEACHING_VIEWED' AND NEW."occurredAt" IS DISTINCT FROM delivered THEN
    RAISE EXCEPTION 'TEACHING_VIEWED occurredAt must equal the context deliveredAt';
  END IF;
  IF NEW."kind" = 'TEACHING_COMPLETED' AND NEW."occurredAt" < delivered THEN
    RAISE EXCEPTION 'TEACHING_COMPLETED occurredAt must not precede the context deliveredAt';
  END IF;
  RETURN NEW;
END;`,
  },
  {
    name: 'prevent_learning_event_link_update',
    sha256: '5eb6b4cfdaadee36bee80ff166a9c5b1c09f9844a99db175c5984e7e869c5862',
    body: `BEGIN
  IF OLD."deliveryContextId" IS NOT NULL
    OR NEW."deliveryContextId" IS DISTINCT FROM OLD."deliveryContextId" THEN
    RAISE EXCEPTION 'A teaching-linked LearningEvent is immutable and its link cannot change';
  END IF;
  RETURN NEW;
END;`,
  },
  {
    name: 'prevent_teaching_delivery_context_update',
    sha256: 'aa1e7e92d6e9a62af2325bfc32501a2ab19dcfbb1b209142e231ac6fb90028ea',
    body: `BEGIN
  RAISE EXCEPTION 'TeachingDeliveryContext is immutable';
END;`,
  },
  {
    name: 'prevent_teaching_evidence_truncate',
    sha256: '7b83c02ef8d0f262d8eab40596492f6e3e73108a4992c9009de468e8a0347e18',
    body: `BEGIN
  IF EXISTS (SELECT 1 FROM "public"."TeachingDeliveryContext")
    OR EXISTS (SELECT 1 FROM "public"."LearningEvent" WHERE "deliveryContextId" IS NOT NULL) THEN
    RAISE EXCEPTION 'Cannot TRUNCATE %: teaching delivery evidence exists', TG_TABLE_NAME;
  END IF;
  RETURN NULL;
END;`,
  },
  {
    name: 'require_teaching_context_viewed',
    sha256: 'bc6755afe5d7d7370c3335699c6b40f033891ec8ab9e48f0d5e213ceedd9250a',
    body: `DECLARE
  context_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'TeachingDeliveryContext' THEN
    context_id := NEW."id";
  ELSE
    IF OLD."deliveryContextId" IS NULL OR OLD."kind" <> 'TEACHING_VIEWED' THEN
      RETURN NULL;
    END IF;
    context_id := OLD."deliveryContextId";
  END IF;
  IF EXISTS (SELECT 1 FROM "public"."TeachingDeliveryContext" WHERE "id" = context_id)
    AND NOT EXISTS (
      SELECT 1 FROM "public"."LearningEvent"
      WHERE "deliveryContextId" = context_id AND "kind" = 'TEACHING_VIEWED'
    ) THEN
    RAISE EXCEPTION 'TeachingDeliveryContext % requires its TEACHING_VIEWED event', context_id;
  END IF;
  RETURN NULL;
END;`,
  },
];
