import { z } from 'zod';

import { VersionSchema } from './common';
import { ContentProvenanceSchema, ContentReviewSchema } from './content';
import { ProgramCodeSchema } from './program-codes';
import { RefSchema } from './progression';

const CodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+$/);

const RECALL_CARD_SCHEMA_VERSION = 'recall-card-1' as const;

const makePlainTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .superRefine((text, context) => {
      const forbiddenPatterns = [
        {
          pattern: /<\/?[a-z][^>]*>/i,
          message: 'Recall card text must not contain HTML or markup',
        },
        {
          pattern: /(?:https?:\/\/|www\.|javascript:|mailto:)/i,
          message: 'Recall card text must not contain URLs',
        },
        {
          pattern: /!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)/,
          message: 'Recall card text must not contain markdown hyperlinks',
        },
        {
          pattern: /<\s*svg\b|<\/\s*svg\s*>|<\s*script\b|<\s*style\b/i,
          message: 'Recall card text must not contain SVG or executable markup',
        },
      ] as const;

      for (const { pattern, message } of forbiddenPatterns) {
        if (pattern.test(text)) {
          context.addIssue({ code: 'custom', message });
          return;
        }
      }
    });

const FrontTextSchema = makePlainTextSchema(500);
const BackTextSchema = makePlainTextSchema(1000);
const SummaryTextSchema = makePlainTextSchema(1000);

const RecallCardFrontSchema = z.object({ text: FrontTextSchema }).strict();
const RecallCardBackSchema = z.object({ text: BackTextSchema }).strict();
export const RecallCardRecallKindSchema = z.enum(['vocabulary', 'notation', 'fact']);
export type RecallCardRecallKind = z.infer<typeof RecallCardRecallKindSchema>;

export const RecallCardPublicProvenanceSchema = z
  .object({
    origin: ContentProvenanceSchema.shape.origin,
  })
  .strict();

export const RecallCardPublicReviewSchema = z
  .object({
    status: ContentReviewSchema.shape.status,
  })
  .strict();

export const RecallCardPayloadProvenanceSchema = z
  .object({
    origin: z.enum(['original', 'licensed']),
  })
  .strict();

export const RecallCardPayloadReviewSchema = z
  .object({
    status: z.literal('reviewed'),
  })
  .strict();

export const RecallCardDraftSchema = z
  .object({
    schemaVersion: z.literal(RECALL_CARD_SCHEMA_VERSION),
    id: CodeSchema,
    version: VersionSchema,
    program: ProgramCodeSchema,
    skillRef: RefSchema,
    recallKind: RecallCardRecallKindSchema,
    front: RecallCardFrontSchema,
    back: RecallCardBackSchema,
    accessibleSummary: SummaryTextSchema.optional(),
    itemReadinessRefs: z.array(RefSchema),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
  })
  .strict();
export type RecallCardDraft = z.infer<typeof RecallCardDraftSchema>;

export const RecallCardPayloadSchema = z
  .object({
    schemaVersion: z.literal(RECALL_CARD_SCHEMA_VERSION),
    id: CodeSchema,
    version: VersionSchema,
    program: ProgramCodeSchema,
    skillRef: RefSchema,
    recallKind: RecallCardRecallKindSchema,
    front: RecallCardFrontSchema,
    back: RecallCardBackSchema,
    accessibleSummary: SummaryTextSchema.optional(),
    provenance: RecallCardPayloadProvenanceSchema,
    review: RecallCardPayloadReviewSchema,
  })
  .strict();
export type RecallCardPayload = z.infer<typeof RecallCardPayloadSchema>;

function throwProjectionError(path: (string | number)[], message: string): never {
  throw new z.ZodError([{ code: 'custom', path, message }]);
}

export function projectRecallCardPayload(draft: RecallCardDraft): RecallCardPayload {
  const parsedDraft = RecallCardDraftSchema.parse(draft);
  if (parsedDraft.provenance.origin === 'llm_drafted') {
    throwProjectionError(['provenance', 'origin'], 'LLM-drafted cards are not projectable');
  }
  if (parsedDraft.provenance.licenseStatus === 'pending_review') {
    throwProjectionError(
      ['provenance', 'licenseStatus'],
      'Pending license review cards are not projectable',
    );
  }
  if (parsedDraft.review.status !== 'reviewed') {
    throwProjectionError(['review', 'status'], 'Unreviewed cards are not projectable');
  }

  const payload = {
    schemaVersion: parsedDraft.schemaVersion,
    id: parsedDraft.id,
    version: parsedDraft.version,
    program: parsedDraft.program,
    skillRef: {
      code: parsedDraft.skillRef.code,
      version: parsedDraft.skillRef.version,
    },
    recallKind: parsedDraft.recallKind,
    front: {
      text: parsedDraft.front.text,
    },
    back: {
      text: parsedDraft.back.text,
    },
    accessibleSummary: parsedDraft.accessibleSummary,
    provenance: {
      origin: parsedDraft.provenance.origin,
    },
    review: {
      status: parsedDraft.review.status,
    },
  } satisfies Record<string, unknown>;

  return RecallCardPayloadSchema.parse(payload);
}
