/**
 * Test support for RAT-SCORE-IMPL-PATHS. Not a test file and not content.
 * Everything here is synthetic: neutral labels, sentinel private text, an
 * in-process household created per suite. No private package, learner data
 * or provider is touched.
 */
import type { Prisma } from '@prisma/client';

import { contentCatalog } from '../../src/content/catalog';
import { deriveCanonicalAnswer } from '../../src/content/structured-response';
import type { StructuredValidator } from '../../src/contracts/content';
import { prisma } from '../../src/server/prisma';
import type { HouseholdIdentity } from '../../src/phase1/service';
import {
  choiceField,
  numberField,
  SF1,
  SF2,
  SF3,
  validatorOf,
} from '../content/structured-response-reference';

export { choiceField, numberField, SF1, SF2, SF3, validatorOf };

/** Distinct sentinels: none is a substring of another or of any public text (contract 5.5). */
export const SENTINELS = {
  equivalenceNotes: 'SENTINEL-EQ-7f3a',
  solutionRepresentation: 'SENTINEL-SR-91c2',
  solutionMethod: 'SENTINEL-SM-5d08',
  hint: 'SENTINEL-HT-3be4',
  leakage: 'SENTINEL-FL-a6e1',
} as const;

/** Keys that must never appear anywhere in a learner projection (contract 5.5 PA-4a). */
export const PRIVATE_KEYS = [
  'correctValue',
  'correctOptionId',
  'canonicalAnswer',
  'acceptedAnswers',
  'equivalenceNotes',
  'solutionRepresentation',
  'solutionMethod',
  'misconceptionCodes',
  'hintSteps',
  'forbiddenLeakagePatterns',
];

const TEMPLATE = contentCatalog.find((item) => item.id === 'ratio-language-1') as unknown as Record<
  string,
  unknown
>;

/** A complete synthetic practice record whose validator is the given structured one. */
export function syntheticItem(
  id: string,
  validator: StructuredValidator,
  version = 'structured-1',
): Record<string, unknown> {
  return {
    ...TEMPLATE,
    id,
    version,
    title: `Synthetic structured item ${id}`,
    prompt: `Synthetic prompt for ${id}. Fill each labeled field.`,
    accessibilityNotes: 'Synthetic note: the fields are labeled in text.',
    accessibleAlternative:
      'Synthetic text alternative: Quantity A and Quantity B are described in words only.',
    solutionRepresentation: SENTINELS.solutionRepresentation,
    solutionMethod: SENTINELS.solutionMethod,
    hintSteps: [
      { order: 1, assistanceLevel: 'small_strategic_hint', prompt: SENTINELS.hint, question: 'Q?' },
    ],
    forbiddenLeakagePatterns: [SENTINELS.leakage],
    misconceptionCodes: ['reversed-ratio'],
    deterministicValidator: { ...validator, equivalenceNotes: SENTINELS.equivalenceNotes },
  };
}

/** A fixture variant whose private selectors changed, with the 2.4 rendering recomputed (5.2). */
export function withSelector(
  validator: StructuredValidator,
  key: string,
  change: { correctValue?: string; correctOptionId?: string },
): StructuredValidator {
  const fields = validator.fields.map((field) =>
    field.key === key ? { ...field, ...change } : field,
  );
  const next = { ...validator, fields } as StructuredValidator;
  const canonicalAnswer = deriveCanonicalAnswer(next);
  if (canonicalAnswer === null) throw new Error('variant does not derive a canonical answer');
  return { ...next, canonicalAnswer, acceptedAnswers: [canonicalAnswer] };
}

export async function archiveSyntheticItem(item: Record<string, unknown>): Promise<void> {
  await prisma.contentArchive.upsert({
    where: {
      contentKey_contentVersion: {
        contentKey: item.id as string,
        contentVersion: item.version as string,
      },
    },
    update: { content: item as Prisma.InputJsonValue },
    create: {
      contentKey: item.id as string,
      contentVersion: item.version as string,
      content: item as Prisma.InputJsonValue,
    },
  });
}

export async function removeArchivedItems(ids: string[]): Promise<void> {
  await prisma.contentArchive.deleteMany({ where: { contentKey: { in: ids } } });
}

export async function createSyntheticHousehold(): Promise<HouseholdIdentity> {
  const household = await prisma.household.create({ data: {} });
  const user = await prisma.user.create({
    data: { householdId: household.id, role: 'LEARNER' },
  });
  const profile = await prisma.learnerProfile.create({
    data: { householdId: household.id, userId: user.id, gradeLevel: 6 },
  });
  return { householdId: household.id, learnerProfileId: profile.id };
}

export async function createSession(
  identity: HouseholdIdentity,
  item: Record<string, unknown>,
  activityKind: 'PRACTICE' | 'PLACEMENT' | 'REVIEW' = 'PRACTICE',
) {
  return prisma.session.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      contentKey: item.id as string,
      activityKind,
      targetCode: item.id as string,
      targetVersion: item.version as string,
    },
  });
}

/** Row-level snapshot of everything a scored attempt could write (PA-1). */
export async function evidenceSnapshot(identity: HouseholdIdentity) {
  const where = { householdId: identity.householdId };
  const [attempts, assistance, learning, shadow, mastery, contributions, sessions] =
    await Promise.all([
      prisma.attempt.findMany({ where, orderBy: { id: 'asc' } }),
      prisma.assistanceEvent.count({ where: { attempt: where } }),
      prisma.learningEvent.count({ where }),
      prisma.shadowDecision.count({ where }),
      prisma.masteryEstimate.findMany({ where, orderBy: { id: 'asc' } }),
      prisma.masteryContribution.count({ where: { masteryEstimate: where } }),
      prisma.session.findMany({ where, orderBy: { id: 'asc' } }),
    ]);
  return JSON.parse(
    JSON.stringify({ attempts, assistance, learning, shadow, mastery, contributions, sessions }),
  ) as unknown;
}

/** Collects every object key and string value of a JSON-like value. */
export function walk(value: unknown): {
  keys: string[];
  strings: { path: string; text: string }[];
} {
  const keys: string[] = [];
  const strings: { path: string; text: string }[] = [];
  const visit = (node: unknown, path: string) => {
    if (typeof node === 'string') strings.push({ path, text: node });
    else if (Array.isArray(node)) node.forEach((entry, index) => visit(entry, `${path}[${index}]`));
    else if (node && typeof node === 'object') {
      for (const [key, entry] of Object.entries(node)) {
        keys.push(key);
        visit(entry, path ? `${path}.${key}` : key);
      }
    }
  };
  visit(value, '');
  return { keys, strings };
}

const OPTION_PATH = /(^|\.)responseSpec\.fields\[\d+\]\.options\[\d+\]\.(id|label)$/;

/**
 * PA-4a/4c/4h checks: no private key anywhere, no sentinel anywhere, the whole
 * derived canonical answer in no string, and no rendering of a sentinel number
 * value. Option ids and labels are public by design and never scanned.
 */
export function expectNoPrivateLeak(
  projection: unknown,
  validator: StructuredValidator,
  numberRenderings: string[] = [],
): void {
  const { keys, strings } = walk(projection);
  const found = keys.filter((key) => PRIVATE_KEYS.includes(key));
  if (found.length > 0) throw new Error(`private key in projection: ${found.join(',')}`);
  const sentinels = Object.values(SENTINELS);
  for (const { path, text } of strings) {
    if (OPTION_PATH.test(path)) continue;
    for (const sentinel of sentinels) {
      if (text.includes(sentinel)) throw new Error(`sentinel ${sentinel} at ${path}`);
    }
    if (text.includes(validator.canonicalAnswer)) {
      throw new Error(`canonicalAnswer at ${path}`);
    }
    for (const rendering of numberRenderings) {
      if (text.includes(rendering)) throw new Error(`number rendering ${rendering} at ${path}`);
    }
  }
}
