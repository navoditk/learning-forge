import { afterEach, describe, expect, it } from 'vitest';

import { createAssessmentStore, AssessmentStoreUnavailableError } from '../../src/assessment/store';
import { GRADE_6_MATH_PACKAGE_BANKS } from '../../src/assessment/private-package-store';
import { contentCatalog } from '../../src/content/catalog';
import { COURSE_CATALOG_INDEX } from '../../src/curriculum/course-catalog';

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

  it('requires every registered index bank in the mounted package, not only the active ones', () => {
    const required = new Set(
      GRADE_6_MATH_PACKAGE_BANKS.map((bank) => `${bank.code}@${bank.version}`),
    );
    for (const bank of COURSE_CATALOG_INDEX.banks) {
      expect(required.has(`${bank.code}@${bank.version}`)).toBe(true);
    }
  });
});
