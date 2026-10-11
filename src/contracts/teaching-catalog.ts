import { z } from 'zod';

import { ItemRefSchema, RefSchema } from './progression';

// T1: disconnected shape only. Nothing here proves that a digest matches
// authored bytes, that a member resolves to a reviewed teaching record, or that
// the catalog equals the active lessons' teaching refs.

/** A raw-byte digest: `sha256:` followed by 64 lowercase hex characters. */
export const Sha256DigestSchema = z
  .string()
  .length(71)
  .regex(/^sha256:[a-f0-9]{64}$/);

// Rejects padding before the existing rules run, so nothing is silently trimmed.
const exactly = (schema: z.ZodType<string, string>) =>
  z
    .string()
    .refine((value) => value === value.trim(), 'Must not have leading or trailing whitespace')
    .pipe(schema);

/** A Ref whose code and version must already be canonical (no padding). */
export const CanonicalRefSchema = RefSchema.extend({
  code: exactly(RefSchema.shape.code),
  version: exactly(RefSchema.shape.version),
}).strict();

/** An ItemRef with canonical id/version and a digest-format `hash`. */
export const TeachingItemRefSchema = ItemRefSchema.extend({
  id: exactly(ItemRefSchema.shape.id),
  version: exactly(ItemRefSchema.shape.version),
  hash: Sha256DigestSchema,
}).strict();
export type TeachingItemRef = z.infer<typeof TeachingItemRefSchema>;

/** Versioned membership list; `id@version` may appear only once. */
export const TeachingCatalogSchema = z
  .object({
    ref: CanonicalRefSchema,
    items: z.array(TeachingItemRefSchema),
  })
  .strict()
  .superRefine((catalog, context) => {
    const seen = new Set<string>();
    catalog.items.forEach((item, index) => {
      const key = `${item.id}@${item.version}`;
      if (seen.has(key)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index],
          message: `Duplicate teaching catalog member ${key}`,
        });
      }
      seen.add(key);
    });
  });
export type TeachingCatalog = z.infer<typeof TeachingCatalogSchema>;
