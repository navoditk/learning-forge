import { afterEach, describe, expect, it } from 'vitest';

import { AssessmentStoreUnavailableError, createAssessmentStore } from '../../src/assessment/store';

describe('held-out assessment store boundary', () => {
  const originalPackagePath = process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;

  afterEach(() => {
    if (originalPackagePath === undefined)
      delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    else process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = originalPackagePath;
  });

  it('fails closed when the private store is not installed', async () => {
    await expect(
      createAssessmentStore().getBank({ code: 'bank', version: '1.0.0' }),
    ).rejects.toEqual(expect.objectContaining({ code: 'ASSESSMENT_STORE_UNAVAILABLE' }));
    await expect(
      createAssessmentStore().getBank({ code: 'bank', version: '1.0.0' }),
    ).rejects.toBeInstanceOf(AssessmentStoreUnavailableError);
  });

  it('treats an invalid mounted package as an unavailable store', async () => {
    process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = '/tmp/does-not-exist-learning-forge.json';

    await expect(
      createAssessmentStore().getBank({ code: 'bank', version: '1.0.0' }),
    ).rejects.toEqual(expect.objectContaining({ code: 'ASSESSMENT_STORE_UNAVAILABLE' }));
  });
});
