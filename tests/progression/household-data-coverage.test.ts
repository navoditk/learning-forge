import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  HOUSEHOLD_DATA_MODEL_COVERAGE,
  TEACHING_DELIVERY_CONTEXT_EXPORT_FIELDS,
} from '../../src/server/household-data';

describe('household data privacy coverage', () => {
  it('accounts for every Prisma model in export and deletion coverage', () => {
    const prismaModels = new Set(Prisma.dmmf.datamodel.models.map((model) => model.name));
    const exportModels = new Set(HOUSEHOLD_DATA_MODEL_COVERAGE.export);
    const deleteModels = new Set(HOUSEHOLD_DATA_MODEL_COVERAGE.delete);
    const globalModels = new Set<string>(HOUSEHOLD_DATA_MODEL_COVERAGE.global);

    expect(new Set([...exportModels, ...globalModels])).toEqual(prismaModels);
    expect(new Set([...deleteModels, ...globalModels])).toEqual(prismaModels);
    expect([...exportModels].some((model) => globalModels.has(model))).toBe(false);
    expect([...deleteModels].some((model) => globalModels.has(model))).toBe(false);
    for (const model of Prisma.dmmf.datamodel.models) {
      if (!globalModels.has(model.name)) continue;
      expect(
        model.fields.some(
          (field) =>
            field.name === 'householdId' ||
            field.name === 'learnerProfileId' ||
            field.name === 'household' ||
            field.name === 'learnerProfile',
        ),
      ).toBe(false);
    }
  });

  describe('TeachingDeliveryContext (T2a)', () => {
    const models = Prisma.dmmf.datamodel.models;
    const context = models.find((model) => model.name === 'TeachingDeliveryContext');
    const scalarFields = () =>
      (context?.fields ?? []).filter((field) => field.kind !== 'object').map((field) => field.name);

    it('is household-scoped evidence: exported and deleted, never global', () => {
      expect(HOUSEHOLD_DATA_MODEL_COVERAGE.export).toContain('TeachingDeliveryContext');
      expect(HOUSEHOLD_DATA_MODEL_COVERAGE.delete).toContain('TeachingDeliveryContext');
      expect(HOUSEHOLD_DATA_MODEL_COVERAGE.global).not.toContain('TeachingDeliveryContext');
      expect(context?.fields.map((field) => field.name)).toEqual(
        expect.arrayContaining(['householdId', 'household', 'learnerProfile']),
      );
    });

    it('has exactly the reviewed column set (no body, answer or free-text column)', () => {
      expect(scalarFields().sort()).toEqual(
        [
          'id',
          'householdId',
          'learnerProfileId',
          'actorUserId',
          'actorRole',
          'operationKey',
          'activityKind',
          'programCode',
          'programVersion',
          'unitCode',
          'unitVersion',
          'lessonCode',
          'lessonVersion',
          'skillCode',
          'skillVersion',
          'itemId',
          'itemVersion',
          'authoredHash',
          'canonicalHash',
          'teachingCatalogCode',
          'teachingCatalogVersion',
          'accessPolicyCode',
          'accessPolicyVersion',
          'policyProfileCode',
          'policyProfileVersion',
          'retryWindowPolicyCode',
          'retryWindowPolicyVersion',
          'deliveredAt',
        ].sort(),
      );
    });

    it('reuses the existing enums and leaves LearningEventKind unchanged', () => {
      const field = (name: string) => context?.fields.find((candidate) => candidate.name === name);
      expect(field('actorRole')?.type).toBe('UserRole');
      expect(field('activityKind')?.type).toBe('ProgressionActivityKind');
      const enums = Prisma.dmmf.datamodel.enums;
      expect(
        enums.find((entry) => entry.name === 'LearningEventKind')?.values.map((v) => v.name),
      ).toEqual([
        'TEACHING_VIEWED',
        'TEACHING_COMPLETED',
        'ASSISTANCE_GIVEN',
        'REMEDIATION_DELIVERED',
        'INDEPENDENT_PRACTICE_EXPOSURE',
      ]);
      expect(enums.map((entry) => entry.name)).not.toContain('TeachingDeliveryContextKind');
    });

    it('has no default deliveredAt and a nullable, optional event link only', () => {
      expect(context?.fields.find((field) => field.name === 'deliveredAt')?.hasDefaultValue).toBe(
        false,
      );
      const event = models.find((model) => model.name === 'LearningEvent');
      const link = event?.fields.find((field) => field.name === 'deliveryContextId');
      expect(link).toMatchObject({ isRequired: false, hasDefaultValue: false });
    });

    it('exports an explicit interim allowlist that omits operationKey (D-143 open)', () => {
      const exported = new Set<string>(TEACHING_DELIVERY_CONTEXT_EXPORT_FIELDS);
      expect(exported.has('operationKey')).toBe(false);
      expect([...exported].sort()).toEqual(
        scalarFields()
          .filter((name) => name !== 'operationKey')
          .sort(),
      );
    });
  });
});
