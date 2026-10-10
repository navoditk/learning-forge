import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { parseSourceRegister } from '../../src/sources/register-parser';

// Synthetic hostile register: every value below is fake test data.
const HOSTILE = [
  '## Gamma research',
  '',
  '**Status: Approved; profile: SYNTHETIC-NAME.**',
  '',
  '| Authority and role | Exact source | Claim |',
  '|---|---|---|',
  '| **Primary** | *Drive copy*, Org; https://drive.google.com/uc?export=download&id=SYNTHETICDRIVEID0123456789ABCDEF | Reads /private/synthetic-bank.json; profile: SYNTHETIC-NAME. |',
  '| **Primary** | *Hash email*, Org; https://example.org/#alice@example.org | See https://www.moems.org/d?u=alice%2540example.org. |',
  '| **Primary** | *Nested value*, Org; https://example.org/a?x=%2574oken%253DSYNTHETIC | Benign-looking. |',
  '| **Primary** | *Shared doc*, Org; https://docs.google.com/document/d/abc/edit?usp=sharing | Benign. |',
  '| **Primary** | *Host tricks*, Org; https://foo.local/ https://a..org/ https://%65xample.org/ | Hosts. |',
].join('\n');

vi.mock('../../src/sources/register.server', () => ({
  loadSourceRegister: () => parseSourceRegister(HOSTILE),
}));

async function render(params: Record<string, string>): Promise<string> {
  const { default: ResourcesPage } = await import('../../src/app/resources/page');
  return renderToStaticMarkup(await ResourcesPage({ searchParams: Promise.resolve(params) }));
}

describe('/resources full page projection of a hostile register', () => {
  beforeAll(() => {
    (globalThis as { React?: typeof React }).React = React;
  });

  it('renders only the benign address as an anchor and no secrets anywhere', async () => {
    const html = await render({});
    const anchors = html.match(/<a [^>]*target="_blank"[^>]*>/g) ?? [];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toContain('https://docs.google.com/document/d/abc/edit?usp=sharing');
    for (const secret of [
      'SYNTHETIC-NAME',
      'SYNTHETICDRIVEID',
      'SYNTHETIC',
      'oken%253D',
      'example.org/a?x',
      'synthetic-bank',
      'alice',
      '%65xample',
      'drive.google.com/uc',
    ]) {
      expect(html, secret).not.toContain(secret);
    }
    expect(html).toContain('Not linked');
    expect(html).not.toMatch(/href="https:\/\/(?:foo\.local|a\.\.org)/);
  });

  it('never echoes sensitive search text and shows a fixed notice', async () => {
    const html = await render({ q: 'token=SYNTHETIC-VALUE' });
    expect(html).not.toContain('SYNTHETIC-VALUE');
    expect(html).toContain('looks like private or sensitive information');
    expect(html).toContain('<article');
  });
});
