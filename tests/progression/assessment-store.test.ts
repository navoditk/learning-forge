import { afterEach, describe, expect, it } from 'vitest';

import { AssessmentStoreUnavailableError, createAssessmentStore } from '../../src/assessment/store';
import {
  SYNTHETIC_V2_SPEC,
  syntheticPackage,
  writeSyntheticPackage,
} from './fixtures/synthetic-versioned-package';

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

describe('held-out assessment store versioned package retention (RI-3)', () => {
  const originalPackagePath = process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;

  afterEach(() => {
    if (originalPackagePath === undefined)
      delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    else process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = originalPackagePath;
  });

  it('treats a package that lacks the retained catalog banks as an unavailable store', async () => {
    process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = await writeSyntheticPackage(
      syntheticPackage([SYNTHETIC_V2_SPEC]),
    );

    await expect(
      createAssessmentStore().getBank({ code: SYNTHETIC_V2_SPEC.code, version: '2.0.0' }),
    ).rejects.toEqual(expect.objectContaining({ code: 'ASSESSMENT_STORE_UNAVAILABLE' }));
  });
});
