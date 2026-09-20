import { describe, expect, it } from 'vitest';

import { AssessmentStoreUnavailableError, createAssessmentStore } from '../../src/assessment/store';

describe('held-out assessment store boundary', () => {
  it('fails closed when the private store is not installed', async () => {
    await expect(
      createAssessmentStore().getBank({ code: 'bank', version: '1.0.0' }),
    ).rejects.toEqual(expect.objectContaining({ code: 'ASSESSMENT_STORE_UNAVAILABLE' }));
    await expect(
      createAssessmentStore().getBank({ code: 'bank', version: '1.0.0' }),
    ).rejects.toBeInstanceOf(AssessmentStoreUnavailableError);
  });
});
