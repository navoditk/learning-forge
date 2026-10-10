import path from 'node:path';

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

type Params = Record<string, string | string[] | undefined>;

async function render(params: Params): Promise<string> {
  const { default: ResourcesPage } = await import('../../src/app/resources/page');
  return renderToStaticMarkup(await ResourcesPage({ searchParams: Promise.resolve(params) }));
}

describe('/resources page markup', () => {
  beforeAll(() => {
    // Vitest's transform uses the classic JSX runtime for this file graph.
    (globalThis as { React?: typeof React }).React = React;
  });

  it('lists every register resource with safe external links', async () => {
    const html = await render({});
    expect(html).toContain('<h1>Curriculum resources</h1>');
    const articles = html.match(/<article /g) ?? [];
    expect(articles.length).toBeGreaterThan(70);
    const external = html.match(/<a [^>]*target="_blank"[^>]*>/g) ?? [];
    expect(external.length).toBeGreaterThan(0);
    for (const anchor of external) {
      expect(anchor).toContain('rel="noopener noreferrer"');
      expect(anchor).toMatch(/href="https:\/\//);
    }
    expect(html).toContain('leaves Learning Forge');
  });

  it('marks pending dossiers and states the adult-reference policy', async () => {
    const html = await render({ dossier: 'iac-national-geography-bee-grade-6-research' });
    expect(html).toContain('Research pending content-owner review');
    expect(html).toContain('not a list of recommended learner activities');
    expect(html).toContain('not reviewed for children');
    expect(html).toContain('answer keys, may include solutions');
  });

  it('escapes hostile search text and shows an empty state', async () => {
    const html = await render({ q: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('No resources match these filters');
    expect(html).toContain('0 of ');
  });

  it('shows explicit unknowns for missing metadata', async () => {
    const html = await render({ q: 'Words of the Champions' });
    expect(html).toContain('recorded once for this whole dossier');
    expect(html).toContain('Not separately identified');
    expect(html).not.toMatch(/reviewed list|curated/i);
  });

  it('shows a notice for an unknown reference without echoing it', async () => {
    const html = await render({ ref: 'nope-<b>zzz' });
    expect(html).toContain('was not found, so it was ignored');
    expect(html).not.toContain('nope-');
  });

  it('renders no secret-shaped content for the whole register', async () => {
    const html = await render({});
    expect(html).not.toMatch(/[?&](token|email|utm_[a-z]+)=/i);
    expect(html).not.toMatch(/https?:\/\/[^\s"<]*@/);
  });
});

describe('/resources failure handling', () => {
  it('fails loudly instead of publishing an empty index when the register is missing', async () => {
    vi.resetModules();
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(path.join(process.cwd(), 'tests', 'app'));
    try {
      const { loadSourceRegister } = await import('../../src/sources/register.server');
      expect(() => loadSourceRegister()).toThrow();
    } finally {
      cwd.mockRestore();
    }
  });

  it('error boundary shows a retry and never renders the error message', async () => {
    (globalThis as { React?: typeof React }).React = React;
    const { default: ResourcesError } = await import('../../src/app/resources/error');
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      ResourcesError({ error: new Error('ENOENT /Users/x/.env token=abc'), reset }),
    );
    expect(html).toContain('Try again');
    expect(html).toContain('role="alert"');
    expect(html).not.toMatch(/ENOENT|\/Users|token=/);
  });

  it('traces the register file for the /resources route', async () => {
    const { default: config } = await import('../../next.config');
    expect(config.outputFileTracingIncludes?.['/resources']).toContain(
      './docs/curriculum-sources.md',
    );
  });
});
