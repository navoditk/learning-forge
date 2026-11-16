import * as React from 'react';
import { createElement, createRef } from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { Session } from '../../src/app/components/activity-panel';
import { hintFailureMessage, SessionSchema } from '../../src/app/learner-data';

(globalThis as { React?: typeof React }).React = React;
const { ActivityPanel } = await import('../../src/app/components/activity-panel');

const session = (skillCode: string, modelHintsAvailable?: unknown) => ({
  sessionId: 's1',
  resumed: false,
  completed: false,
  hintCount: 0,
  learner: { displayName: 'Learner' },
  content: {
    id: 'synthetic-item',
    title: 'Synthetic item',
    skillCode,
    ...(modelHintsAvailable === undefined ? {} : { modelHintsAvailable }),
    prompt: 'Synthetic prompt.',
    accessibilityNotes: 'Synthetic note.',
  },
});

function render(data: unknown, withAttempt = true) {
  return renderToStaticMarkup(
    createElement(ActivityPanel, {
      session: data as Session,
      mode: 'practice',
      response: '',
      setResponse: vi.fn(),
      error: '',
      setError: vi.fn(),
      attempt: withAttempt ? { attemptId: 'a1', correctness: 'INCORRECT' } : undefined,
      hintCount: 0,
      hintPending: false,
      hintButtonRef: createRef<HTMLButtonElement>(),
      responseInputRef: createRef<HTMLInputElement>(),
      pythonResponseRef: createRef<HTMLTextAreaElement>(),
      fieldValues: {},
      onFieldChange: vi.fn(),
      summaryRef: createRef<HTMLDivElement>(),
      onSubmitAttempt: vi.fn(),
      onRequestHint: vi.fn(),
      onSubmitIndependentCheck: vi.fn(),
    }),
  );
}

describe('hint availability (SP-2 H-2)', () => {
  it('hides the hint control and says so honestly when the server flag is false', () => {
    const html = render(session('snsb6-orthography-x', false));
    expect(html).not.toContain('Ask for a small hint');
    expect(html).not.toContain('comes from a computer program');
    expect(html).toContain('Hints are not available for this activity yet.');
  });

  it('keeps the hint control when the flag is true or absent', () => {
    for (const data of [session('unit-rates', true), session('unit-rates')]) {
      const html = render(data);
      expect(html).toContain('Ask for a small hint');
      expect(html).not.toContain('Hints are not available');
    }
  });

  it('accepts the flag in the session schema and rejects a non-boolean', () => {
    expect(SessionSchema.parse(session('snsb6-a', false)).content.modelHintsAvailable).toBe(false);
    expect(SessionSchema.safeParse(session('snsb6-a', 'no')).success).toBe(false);
  });

  it('derives the flag on the server from the gate and maps the 403 in the page', () => {
    const service = readFileSync('src/phase1/service.ts', 'utf8');
    expect(service).toContain(
      'modelHintsAvailable: !isModelTutoringDisabled(contentSkillCode(content))',
    );
    const page = readFileSync('src/app/page.tsx', 'utf8');
    expect(page).toContain('hintFailureMessage(result, operation.isCurrent)');
  });
});

describe('spelling answer box (D-134)', () => {
  it('turns off spellcheck, autocorrect, autocapitalize and autocomplete for snsb6- only', () => {
    const spelling = render(session('snsb6-orthography-x'), false);
    expect(spelling).toContain('spellCheck="false"');
    expect(spelling).toContain('autoCapitalize="off"');
    expect(spelling).toContain('autoCorrect="off"');
    expect(spelling).toContain('autoComplete="off"');
    const math = render(session('unit-rates'), false);
    expect(math).not.toContain('spellCheck');
    expect(math).not.toContain('autoCorrect');
    expect(math).not.toContain('autoCapitalize');
  });
});

describe('hintFailureMessage', () => {
  const res = (status: number, body: unknown) => ({ status, json: async () => body });
  it('maps 403 MODEL_TUTORING_DISABLED to the honest wording and others to the failure text', async () => {
    const yes = () => true;
    expect(await hintFailureMessage(res(403, { reasonCode: 'MODEL_TUTORING_DISABLED' }), yes)).toBe(
      'Hints are not available for this activity yet.',
    );
    expect(await hintFailureMessage(res(500, { reasonCode: 'MODEL_TUTORING_DISABLED' }), yes)).toBe(
      'The tutor could not respond.',
    );
    expect(await hintFailureMessage(res(403, { reasonCode: 'OTHER' }), yes)).toBe(
      'The tutor could not respond.',
    );
    expect(
      await hintFailureMessage({ status: 403, json: () => Promise.reject(new Error('x')) }, yes),
    ).toBe('The tutor could not respond.');
  });

  it('returns nothing when the operation went stale while the body was being read', async () => {
    let current = true;
    let release: (value: unknown) => void = () => undefined;
    const deferred = new Promise((resolve) => {
      release = resolve;
    });
    const pending = hintFailureMessage({ status: 403, json: () => deferred }, () => current);
    current = false;
    release({ reasonCode: 'MODEL_TUTORING_DISABLED' });
    expect(await pending).toBeUndefined();
  });
});
