import * as React from 'react';
import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { Session } from '../../src/app/components/activity-panel';
import { invalidResponseMessage, SessionSchema } from '../../src/app/learner-data';
import { PY_LISTING } from '../phase1/python-paths-support';

// The repo's tsconfig keeps JSX as `preserve`, so vitest compiles TSX with the
// classic transform; expose React before the component module is imported.
(globalThis as { React?: typeof React }).React = React;
const { ActivityPanel } = await import('../../src/app/components/activity-panel');

// Synthetic session only: nothing here is curriculum, and nothing runs code.
const INDENTED = {
  ...PY_LISTING,
  source: 'for i in range(2):\n    print(i)',
  structureDescription: 'A loop header on line 1; line 2 is indented four spaces inside it.',
};

const session = (content: Record<string, unknown> = {}) => ({
  sessionId: 's1',
  resumed: false,
  completed: false,
  hintCount: 0,
  learner: { displayName: 'Learner' },
  content: {
    id: 'synthetic-python-ui',
    title: 'Synthetic python item',
    skillCode: 'py6-synthetic-print-output',
    prompt: 'What does this program print?',
    accessibilityNotes: 'Synthetic note.',
    accessibleAlternative: 'Synthetic text alternative.',
    answerKind: 'python_output',
    codeListing: INDENTED,
    ...content,
  },
});

function render(
  data: Record<string, unknown>,
  {
    error = '',
    attempt,
  }: { error?: string; attempt?: { attemptId: string; correctness: string } } = {},
) {
  return renderToStaticMarkup(
    createElement(ActivityPanel, {
      session: data as unknown as Session,
      mode: 'practice',
      response: '',
      setResponse: vi.fn(),
      error,
      setError: vi.fn(),
      attempt,
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

describe('session payload for a python item (C7)', () => {
  it('keeps the public listing and answer kind, and drops anything else', () => {
    const parsed = SessionSchema.parse({
      ...session(),
      content: { ...session().content, canonicalAnswer: '0\n1' },
    });
    expect(parsed.content.answerKind).toBe('python_output');
    expect(parsed.content.codeListing).toEqual(INDENTED);
    expect(JSON.stringify(parsed)).not.toContain('canonicalAnswer');
  });

  it('rejects a payload whose listing is not valid', () => {
    expect(
      SessionSchema.safeParse(session({ codeListing: { ...INDENTED, languageVersion: '3.15' } }))
        .success,
    ).toBe(false);
    expect(SessionSchema.safeParse(session({ answerKind: 'sandbox' })).success).toBe(false);
  });
});

describe('invalid-response messages', () => {
  it('maps each typed reason to neutral wording and ignores anything else', () => {
    expect(invalidResponseMessage({ reasonCode: 'INVALID_RESPONSE', reason: 'EMPTY' })).toBe(
      'Type at least one line.',
    );
    expect(
      invalidResponseMessage({
        error: 'free text from the server',
        reasonCode: 'INVALID_RESPONSE',
        reason: 'DISALLOWED_CHARACTER',
      }),
    ).toBe('Use plain keyboard characters and straight quotes.');
    expect(invalidResponseMessage({ reasonCode: 'INVALID_RESPONSE', reason: 'NOPE' })).toBe(
      undefined,
    );
    expect(invalidResponseMessage({ reasonCode: 'MALFORMED_RESPONSE' })).toBe(undefined);
    expect(invalidResponseMessage(undefined)).toBe(undefined);
  });
});

describe('python learner renderer (C7, dossier 5.1)', () => {
  const html = render(session());

  it('renders the listing as pre/code with whitespace preserved and no colour or run controls', () => {
    expect(html).toContain('<pre><code');
    expect(html).toContain('<span class="code-line" data-line="1">for i in range(2):\n</span>');
    // The four-space indentation is literally present, not collapsed.
    expect(html).toContain('<span class="code-line" data-line="2">    print(i)\n</span>');
    expect(html).not.toMatch(/\brun\b|copy|runner|href=/i);
    expect(html).toContain('class="with-line-numbers"');
  });

  it('wraps the listing in a labelled, keyboard-focusable region with a text structure description', () => {
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="Python code: Synthetic python item"');
    expect(html).toContain('aria-describedby="code-listing-structure"');
    expect(html).toContain(
      'id="code-listing-structure" class="code-listing-structure">Structure: A loop header on line 1; line 2 is indented four spaces inside it.',
    );
  });

  it('renders a multi-line textarea with no autocapitalize, autocorrect or spellcheck', () => {
    expect(html).toContain('<textarea');
    expect(html).toContain('id="python-output-response"');
    // React's server renderer writes these in camelCase; HTML attribute names are
    // case-insensitive, so the browser sees the lowercase attributes.
    expect(html).toMatch(/autocapitalize="off"/i);
    expect(html).toMatch(/autocorrect="off"/i);
    expect(html).toMatch(/spellcheck="false"/i);
    expect(html).toMatch(/autocomplete="off"/i);
    expect(html).toContain('class="python-output-input"');
    expect(html).toContain(
      '<label for="python-output-response">What does this program print?</label>',
    );
    // The single-line answer input is not used for a python item.
    expect(html).not.toContain('id="learner-response"');
  });

  it('describes the entry rules with aria-describedby and submits with a button', () => {
    expect(html).toContain('aria-describedby="python-output-guidance"');
    expect(html).toContain('id="python-output-guidance"');
    expect(html).toContain('on its own line');
    expect(html).toContain('no extra');
    expect(html).toMatch(/<button type="submit"[^>]*>Submit answer<\/button>/);
  });

  it('announces an invalid response and ties it to the textarea', () => {
    const withError = render(session(), { error: 'Type at least one line.' });
    expect(withError).toContain('aria-invalid="true"');
    expect(withError).toContain('aria-describedby="python-output-guidance learner-response-error"');
    expect(withError).toContain(
      '<p role="alert" id="learner-response-error">Type at least one line.</p>',
    );
    expect(html).not.toContain('aria-invalid');
  });

  it('offers no model hint control for a python item, but keeps it for a legacy item', () => {
    const attempt = { attemptId: 'a1', correctness: 'INCORRECT' };
    expect(render(session(), { attempt })).not.toContain('Ask for a small hint');
    expect(render(session(), { attempt })).not.toContain('computer program, not a person');
    const legacy = render(session({ answerKind: undefined, codeListing: undefined }), { attempt });
    expect(legacy).toContain('Ask for a small hint');
    expect(legacy).toContain('id="learner-response"');
    expect(legacy).not.toContain('<textarea');
    expect(legacy).not.toContain('code-listing');
  });
});
