import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { HOUSEHOLD_DATA_MODEL_COVERAGE } from '../../src/server/household-data';

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
});
