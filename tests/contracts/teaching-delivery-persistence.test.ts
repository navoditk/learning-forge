import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { Sha256DigestSchema } from '../../src/contracts/teaching-catalog';
import { TeachingDeliveryContextSchema } from '../../src/contracts/teaching-delivery';
import { contextData } from '../persistence/teaching-delivery-fixtures';

const MIGRATION_SQL = readFileSync(
  join(__dirname, '../../prisma/migrations/0018_add_teaching_delivery_context/migration.sql'),
  'utf8',
);

const REF_FIELDS = {
  programRef: 'program',
  unitRef: 'unit',
  lessonRef: 'lesson',
  skillRef: 'skill',
  teachingCatalogRef: 'teachingCatalog',
  accessPolicyRef: 'accessPolicy',
  policyProfileRef: 'policyProfile',
  retryWindowPolicyRef: 'retryWindowPolicy',
} as const;
const DIRECT_FIELDS = [
  'id',
  'householdId',
  'learnerProfileId',
  'actorUserId',
  'actorRole',
  'operationKey',
  'activityKind',
  'canonicalHash',
  'deliveredAt',
] as const;

function columnsFor(key: string): string[] {
  if (key in REF_FIELDS) {
    const prefix = REF_FIELDS[key as keyof typeof REF_FIELDS];
    return [`${prefix}Code`, `${prefix}Version`];
  }
  if (key === 'itemRef') return ['itemId', 'itemVersion', 'authoredHash'];
  if ((DIRECT_FIELDS as readonly string[]).includes(key)) return [key];
  return [];
}

describe('T1 teaching delivery context <-> persistence columns', () => {
  const t1Keys = Object.keys(TeachingDeliveryContextSchema.shape);
  const context = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === 'TeachingDeliveryContext',
  );
  const columns = (context?.fields ?? [])
    .filter((field) => field.kind !== 'object')
    .map((field) => field.name);

  it('maps every T1 key to at least one column', () => {
    for (const key of t1Keys) expect(columnsFor(key), key).not.toHaveLength(0);
  });

  it('has no column that no T1 key maps to, and no T1 key left unmapped', () => {
    expect(t1Keys.flatMap(columnsFor).sort()).toEqual([...columns].sort());
  });

  it('flattens a parsed T1 record to exactly the persisted column set', () => {
    const fixture = contextData({ householdId: 'h', parentId: 'p', learnerProfileId: 'l' });
    const parsed = TeachingDeliveryContextSchema.parse({
      id: fixture.id,
      householdId: fixture.householdId,
      learnerProfileId: fixture.learnerProfileId,
      actorUserId: fixture.actorUserId,
      actorRole: fixture.actorRole,
      operationKey: fixture.operationKey,
      activityKind: fixture.activityKind,
      programRef: { code: fixture.programCode, version: fixture.programVersion },
      unitRef: { code: fixture.unitCode, version: fixture.unitVersion },
      lessonRef: { code: fixture.lessonCode, version: fixture.lessonVersion },
      skillRef: { code: fixture.skillCode, version: fixture.skillVersion },
      itemRef: { id: fixture.itemId, version: fixture.itemVersion, hash: fixture.authoredHash },
      canonicalHash: fixture.canonicalHash,
      teachingCatalogRef: {
        code: fixture.teachingCatalogCode,
        version: fixture.teachingCatalogVersion,
      },
      accessPolicyRef: { code: fixture.accessPolicyCode, version: fixture.accessPolicyVersion },
      policyProfileRef: { code: fixture.policyProfileCode, version: fixture.policyProfileVersion },
      retryWindowPolicyRef: {
        code: fixture.retryWindowPolicyCode,
        version: fixture.retryWindowPolicyVersion,
      },
      deliveredAt: fixture.deliveredAt as Date,
    });
    expect(Object.keys(parsed).sort()).toEqual([...t1Keys].sort());
    expect(Object.keys(fixture).sort()).toEqual([...columns].sort());
  });
});

describe('migration CHECK bounds match the T1 schemas', () => {
  const sqlRegex = (literal: string) => {
    const found = MIGRATION_SQL.match(new RegExp(`'(\\^${literal}[^']*\\$)'`));
    expect(found, literal).not.toBeNull();
    return new RegExp((found as RegExpMatchArray)[1]);
  };

  it('uses the same canonical digest format as T1 (lowercase sha256: + 64 hex)', () => {
    const digest = sqlRegex('sha256:');
    const samples = [
      `sha256:${'a'.repeat(64)}`,
      `sha256:${'A'.repeat(64)}`,
      `sha256:${'a'.repeat(63)}`,
      `sha256:${'a'.repeat(65)}`,
      'a'.repeat(64),
      `SHA256:${'a'.repeat(64)}`,
      `sha256:${'g'.repeat(64)}`,
    ];
    for (const sample of samples) {
      expect(digest.test(sample), sample).toBe(Sha256DigestSchema.safeParse(sample).success);
    }
  });

  it('uses the same code format as the T1 canonical ref code', () => {
    const code = sqlRegex('\\[a-z0-9-\\]\\+');
    const schema = TeachingDeliveryContextSchema.shape.programRef.shape.code;
    for (const sample of ['abc-1', 'ABC', 'a b', '', 'a_b', 'a.b']) {
      expect(code.test(sample), sample).toBe(schema.safeParse(sample).success);
    }
  });

  it('bounds identities to 1-200 and versions to 1-100 like T1', () => {
    expect(MIGRATION_SQL).toContain('BETWEEN 1 AND 200');
    expect(MIGRATION_SQL).toContain('BETWEEN 1 AND 100');
    const identity = TeachingDeliveryContextSchema.shape.operationKey;
    expect(identity.safeParse('k'.repeat(200)).success).toBe(true);
    expect(identity.safeParse('k'.repeat(201)).success).toBe(false);
    expect(identity.safeParse('').success).toBe(false);
    const version = TeachingDeliveryContextSchema.shape.programRef.shape.version;
    expect(version.safeParse('v'.repeat(100)).success).toBe(true);
    expect(version.safeParse('v'.repeat(101)).success).toBe(false);
    // the migration's check counts exactly the reviewed columns
    expect(MIGRATION_SQL.match(/BETWEEN 1 AND 100/g)).toHaveLength(9);
    expect(MIGRATION_SQL.match(/BETWEEN 1 AND 200/g)).toHaveLength(2);
  });

  it('pins actorRole and activityKind to the T1 literals', () => {
    expect(MIGRATION_SQL).toContain(`CHECK ("actorRole" = 'PARENT')`);
    expect(MIGRATION_SQL).toContain(`CHECK ("activityKind" = 'TEACHING')`);
    expect(TeachingDeliveryContextSchema.shape.actorRole.value).toBe('PARENT');
    expect(TeachingDeliveryContextSchema.shape.activityKind.value).toBe('TEACHING');
  });
});
