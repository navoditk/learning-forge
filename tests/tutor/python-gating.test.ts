import { beforeEach, describe, expect, it, vi } from 'vitest';

// C9 (PYTHON-IMPLEMENT): model hints are disabled for py6- items. Everything the
// route reaches after the gate is mocked so a call to any of it fails the test.
const mocks = vi.hoisted(() => ({
  requireHouseholdContext: vi.fn(),
  getTutorContext: vi.fn(),
  recordTutorResponse: vi.fn(),
  enforceTutorUsageLimits: vi.fn(),
  createTutorModel: vi.fn(),
  respond: vi.fn(),
}));

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: mocks.requireHouseholdContext,
}));
vi.mock('../../src/phase1/service', () => ({
  phase1Content: {
    id: 'unit-rates-1',
    prompt: 'Synthetic prompt.',
    skillRef: { code: 'unit-rates', version: '1.0.0' },
    deterministicValidator: { canonicalAnswer: '4' },
    forbiddenLeakagePatterns: [],
  },
  getTutorContext: mocks.getTutorContext,
  recordTutorResponse: mocks.recordTutorResponse,
}));
vi.mock('../../src/phase1/tutor-usage', () => ({
  enforceTutorUsageLimits: mocks.enforceTutorUsageLimits,
  TutorUsageLimitError: class extends Error {},
}));
vi.mock('../../src/tutor', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/tutor')>();
  return {
    ...original,
    createTutorModel: mocks.createTutorModel,
    TutorHarness: class {
      respond = mocks.respond;
    },
  };
});

import { POST } from '../../src/app/api/phase1/hint/route';
import { isModelTutoringDisabled, MODEL_TUTORING_DISABLED_REASON } from '../../src/tutor';

const ATTEMPT = '33333333-3333-4333-8333-333333333333';
const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/phase1/hint', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
const context = (skillCode: string) => ({
  state: 'awaiting_attempt',
  sessionId: 's1',
  priorHintCount: 0,
  attemptNumber: 1,
  content: {
    id: 'synthetic-item',
    prompt: 'Synthetic prompt for validation only.',
    skillCode,
    canonicalAnswer: 'Hi',
    forbiddenLeakagePatterns: ['Hi'],
  },
});

describe('model tutoring gate (C9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireHouseholdContext.mockResolvedValue({
      householdId: 'h1',
      learnerProfileId: 'l1',
    });
  });

  it('disables model tutoring for py6-, hss6- and snsb6- skills only', () => {
    expect(isModelTutoringDisabled('snsb6-orthography-silent-letters')).toBe(true);
    expect(isModelTutoringDisabled('snsb6-')).toBe(true);
    for (const code of ['snsb-6-a', 'snsb6', 'xsnsb6-a', 'snsb5-a', 'SNSB6-a']) {
      expect(isModelTutoringDisabled(code), code).toBe(false);
    }
    expect(isModelTutoringDisabled('py6-print-output-reading')).toBe(true);
    expect(isModelTutoringDisabled('py6-')).toBe(true);
    // Social Studies R6: fail closed until a subject-appropriate tutor template and evals exist.
    expect(isModelTutoringDisabled('hss6-athenian-and-representative-democracy')).toBe(true);
    expect(isModelTutoringDisabled('hss6-')).toBe(true);
    for (const code of [
      'unit-rates',
      'sci6-cells',
      'mk6-x',
      'moems6-x',
      'py-6',
      'xpy6-a',
      'hss-6',
      'xhss6-a',
      'hss5-a',
    ]) {
      expect(isModelTutoringDisabled(code), code).toBe(false);
    }
  });

  it('refuses a hint for an hss6- item before the limiter, the provider, any trace or event', async () => {
    mocks.getTutorContext.mockResolvedValue(context('hss6-synthetic-direct-democracy'));
    const response = await post({ attemptId: ATTEMPT, learnerMessage: 'help me' });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Model-generated hints are not available for this activity.',
      reasonCode: MODEL_TUTORING_DISABLED_REASON,
    });
    expect(mocks.enforceTutorUsageLimits).not.toHaveBeenCalled();
    expect(mocks.createTutorModel).not.toHaveBeenCalled();
    expect(mocks.respond).not.toHaveBeenCalled();
    expect(mocks.recordTutorResponse).not.toHaveBeenCalled();
  });

  it('refuses a hint for an snsb6- item before the limiter, the provider, any trace or event', async () => {
    mocks.getTutorContext.mockResolvedValue(context('snsb6-synthetic-orthography'));
    const response = await post({ attemptId: ATTEMPT, learnerMessage: 'help me' });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Model-generated hints are not available for this activity.',
      reasonCode: MODEL_TUTORING_DISABLED_REASON,
    });
    expect(mocks.enforceTutorUsageLimits).not.toHaveBeenCalled();
    expect(mocks.createTutorModel).not.toHaveBeenCalled();
    expect(mocks.respond).not.toHaveBeenCalled();
    expect(mocks.recordTutorResponse).not.toHaveBeenCalled();
  });

  it('refuses a hint for a py6- item before the limiter, the provider, any trace or event', async () => {
    mocks.getTutorContext.mockResolvedValue(context('py6-synthetic-print-output'));
    const response = await post({ attemptId: ATTEMPT, learnerMessage: 'help me' });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Model-generated hints are not available for this activity.',
      reasonCode: MODEL_TUTORING_DISABLED_REASON,
    });
    expect(mocks.enforceTutorUsageLimits).not.toHaveBeenCalled();
    expect(mocks.createTutorModel).not.toHaveBeenCalled();
    expect(mocks.respond).not.toHaveBeenCalled();
    expect(mocks.recordTutorResponse).not.toHaveBeenCalled();
  });

  it('keeps the existing tutor path for a non-python item', async () => {
    mocks.getTutorContext.mockResolvedValue(context('unit-rates'));
    mocks.enforceTutorUsageLimits.mockResolvedValue(undefined);
    mocks.respond.mockResolvedValue({ status: 'validated' });
    mocks.recordTutorResponse.mockResolvedValue({ stored: true });
    const response = await post({ attemptId: ATTEMPT, learnerMessage: 'help me' });
    expect(response.status).toBe(200);
    expect(mocks.respond).toHaveBeenCalledTimes(1);
    expect(mocks.recordTutorResponse).toHaveBeenCalledTimes(1);
  });
});
