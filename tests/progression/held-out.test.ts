import { afterEach, describe, expect, it } from 'vitest';

import { createAssessmentStore, AssessmentStoreUnavailableError } from '../../src/assessment/store';
import { contentCatalog } from '../../src/content/catalog';

describe('held-out assessment boundary', () => {
  const originalPackagePath = process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;

  afterEach(() => {
    if (originalPackagePath === undefined)
      delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    else process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = originalPackagePath;
  });

  it('does not expose assessment or review items through the public content catalog', () => {
    expect(
      contentCatalog.every((item) => item.role === 'practice' || item.role === 'teaching'),
    ).toBe(true);
  });

  it('fails closed when the private package is not mounted', async () => {
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    const store = createAssessmentStore();
    await expect(
      store.getBank({ code: 'ratio-language-lesson-bank', version: '1.0.0' }),
    ).rejects.toBeInstanceOf(AssessmentStoreUnavailableError);
  });
});
