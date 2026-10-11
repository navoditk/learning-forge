import { createHash } from 'node:crypto';
import type { z } from 'zod';

import { TeachingContentItemSchema } from '../../../src/contracts/progression';
import { TeachingCatalogSchema } from '../../../src/contracts/teaching-catalog';
import {
  TeachingDeliveryContextSchema,
  TeachingOperationBindingSchema,
  TeachingServedBindingSchema,
  type TeachingDeliveryContext,
} from '../../../src/contracts/teaching-delivery';

// Disconnected synthetic fixtures. Every id, code, hash and body is invented;
// nothing is registered in a production catalog and no real content is used.
type TeachingContentItem = z.infer<typeof TeachingContentItemSchema>;

const version = '1.0.0';
const provenance = { origin: 'original', licenseStatus: 'owned' } as const;
const review = {
  status: 'reviewed',
  reviewer: 'Synthetic fixture reviewer',
  reviewedAt: '2026-10-10',
  originalityStatement: 'Synthetic test fixture with no real curriculum content.',
} as const;

const sha256 = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`;

// Fixture-only canonical form: recursively key-sorted JSON. Not a production builder.
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }
  return value;
}

function teachingItem(id: string, skillCode: string, title: string): TeachingContentItem {
  return TeachingContentItemSchema.parse({
    id,
    version,
    title,
    role: 'teaching',
    skillRef: { code: skillCode, version },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['SYNTHETIC-1'],
    observableEvidence: ['Learner can restate the invented idea.'],
    provenance,
    review,
    accessibilityNotes: 'Plain text only; no figures.',
    accessibleAlternative: 'Plain text is already the accessible form.',
    itemReadinessRefs: [],
    explanation: `Invented explanation for ${title}.`,
    workedExample: `Invented worked example for ${title}.`,
  });
}

export const SYNTHETIC_SPELLING_ITEM = teachingItem(
  'synthetic-spelling-teaching',
  'synthetic-spelling-skill',
  'Synthetic spelling pattern',
);
export const SYNTHETIC_VOCABULARY_ITEM = teachingItem(
  'synthetic-vocabulary-teaching',
  'synthetic-vocabulary-skill',
  'Synthetic vocabulary idea',
);

export const authoredHashOf = (item: TeachingContentItem) => sha256(JSON.stringify(item));
export const canonicalHashOf = (item: TeachingContentItem) =>
  sha256(JSON.stringify(sortKeys(item)));

function context(
  item: TeachingContentItem,
  program: string,
  lesson: string,
  lessonVersion: string,
  suffix: string,
): TeachingDeliveryContext {
  return TeachingDeliveryContextSchema.parse({
    id: `ctx-${suffix}`,
    householdId: 'synthetic-household-1',
    learnerProfileId: 'synthetic-learner-1',
    actorUserId: 'synthetic-parent-1',
    actorRole: 'PARENT',
    operationKey: `op-${suffix}`,
    activityKind: 'TEACHING',
    programRef: { code: program, version },
    unitRef: { code: `${program}-unit-one`, version },
    lessonRef: { code: lesson, version: lessonVersion },
    skillRef: item.skillRef,
    itemRef: { id: item.id, version: item.version, hash: authoredHashOf(item) },
    canonicalHash: canonicalHashOf(item),
    teachingCatalogRef: { code: 'synthetic-teaching-catalog', version },
    accessPolicyRef: { code: `${program}-access`, version },
    policyProfileRef: { code: `${program}-profile`, version },
    deliveredAt: new Date('2026-10-10T12:00:00.000Z'),
    retryWindowPolicyRef: { code: 'synthetic-retry-window', version },
  });
}

// Graded-academic subject.
export const SYNTHETIC_SPELLING_CONTEXT = context(
  SYNTHETIC_SPELLING_ITEM,
  'synthetic-spelling',
  'synthetic-spelling-lesson',
  '1.0.0',
  'spelling',
);
// Same item pinned by a second lesson version: a distinct context, no inferred link.
export const SYNTHETIC_SPELLING_LESSON_V2_CONTEXT = context(
  SYNTHETIC_SPELLING_ITEM,
  'synthetic-spelling',
  'synthetic-spelling-lesson',
  '2.0.0',
  'spelling-lesson-v2',
);
// Enrichment subject.
export const SYNTHETIC_VOCABULARY_CONTEXT = context(
  SYNTHETIC_VOCABULARY_ITEM,
  'synthetic-vocabulary',
  'synthetic-vocabulary-lesson',
  '1.0.0',
  'vocabulary',
);

export const SYNTHETIC_TEACHING_CATALOG = TeachingCatalogSchema.parse({
  ref: { code: 'synthetic-teaching-catalog', version },
  items: [SYNTHETIC_SPELLING_CONTEXT.itemRef, SYNTHETIC_VOCABULARY_CONTEXT.itemRef],
});

// Test-only projection: the schemas are strict, so a full context is not a binding.
const NON_BINDING_KEYS = ['id', 'operationKey', 'canonicalHash', 'deliveredAt'];
export const operationBindingOf = (value: TeachingDeliveryContext) =>
  TeachingOperationBindingSchema.parse(
    Object.fromEntries(Object.entries(value).filter(([key]) => !NON_BINDING_KEYS.includes(key))),
  );
export const servedBindingOf = (value: TeachingDeliveryContext) =>
  TeachingServedBindingSchema.parse({
    ...operationBindingOf(value),
    canonicalHash: value.canonicalHash,
  });
