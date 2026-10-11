import { z } from 'zod';

import { VersionSchema } from '../contracts/common';

const RecallCardContentIdPrefix = 'recall-card:' as const;

const RecallCardIdSchema = z.string().regex(/^[a-z0-9-]+$/u);

export const RecallCardIdentitySchema = z
  .object({
    id: RecallCardIdSchema,
    version: VersionSchema,
  })
  .strict();

export type RecallCardIdentity = z.infer<typeof RecallCardIdentitySchema>;

export const RecallCardContentIdSchema = z
  .string()
  .superRefine((contentId, context) => {
    if (!contentId.startsWith(RecallCardContentIdPrefix)) {
      context.addIssue({
        code: 'custom',
        message: 'Recall-card content ids must start with recall-card:',
      });
      return;
    }

    const recallCardId = contentId.slice(RecallCardContentIdPrefix.length);
    if (!RecallCardIdSchema.safeParse(recallCardId).success) {
      context.addIssue({
        code: 'custom',
        message: 'Recall-card content ids must use a canonical lower-alphanum-dash id',
      });
    }
  })
  .transform((contentId) => contentId.slice(RecallCardContentIdPrefix.length));

export type RecallCardContentId = z.infer<typeof RecallCardContentIdSchema>;

export function makeRecallCardContentId(id: string): string {
  return `${RecallCardContentIdPrefix}${RecallCardIdSchema.parse(id)}`;
}

export function parseRecallCardContentId(contentId: string): string {
  return RecallCardContentIdSchema.parse(contentId);
}

export function findRecallCardContentIdCollisions(
  recallCardIds: readonly string[],
  contentIds: readonly string[],
): string[] {
  const suppliedContentIds = new Set(contentIds);
  return [...new Set(recallCardIds.map((id) => makeRecallCardContentId(id)))].filter((contentId) =>
    suppliedContentIds.has(contentId),
  );
}
