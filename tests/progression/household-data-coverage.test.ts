import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { HOUSEHOLD_DATA_MODEL_COVERAGE } from '../../src/server/household-data';

describe('household data privacy coverage', () => {
  it('accounts for every Prisma model in export and deletion coverage', () => {
    const prismaModels = new Set(Prisma.dmmf.datamodel.models.map((model) => model.name));
    const exportModels = new Set(HOUSEHOLD_DATA_MODEL_COVERAGE.export);
    const deleteModels = new Set(HOUSEHOLD_DATA_MODEL_COVERAGE.delete);

    expect(exportModels).toEqual(prismaModels);
    expect(deleteModels).toEqual(prismaModels);
  });
});
