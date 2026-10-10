import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { analyzeUrl } from '../../src/sources/redaction';
import { evaluateSourceLink } from '../../src/sources/link-policy';
import { filterSources, ignoredFilters, parseSourceQuery } from '../../src/sources/query';
import {
  parseSourceRegister,
  splitTableRow,
  type SourceRecord,
} from '../../src/sources/register-parser';

// Generic synthetic fixture: no real learner, school, or private-bank content.
const FIXTURE = [
  '# Sources',
  '',
  '## Alpha Contest research — 2030-01-02',
  '',
  '**Status: Pending owner review.** Scope note: SECRET-SCOPE-NOTE for one named learner.',
  '',
  '- **Retrieval date**: 2030-01-03.',
  '',
  '### Source register',
  '',
  '| Authority and source role | Exact title, issuer, URL | Supported claim |',
  '|---|---|---|',
  '| **Primary; rules** | *Rules \\| Procedures*, Alpha Org; updated 2030-01-01; https://www.moems.org/rules?year=2030#top (retrieved 2030-01-02, HTTP 200) | Eligibility rules. |',
  '| **Secondary; blog** | *Prep Blog*, Some Blog; https://blog.example.com/post and `https://www.moems.org/old` (HTTP 404) | Opinion. |',
  '| **Primary; document identifier only** | *Official Handbook, 3rd edition*, Alpha Org; document no. AO-42 | Format facts. |',
  '| **Primary; unsafe** | *Bad*, X; javascript:alert(1) http://www.moems.org/plain https://user:hunter2@www.moems.org/cred https://www.moems.org:8443/port | Nope. |',
  '| **Primary; sensitive** | *Probe*, Y; https://www.moems.org/p?email=kid@example.com&token=abc123 and https://www.moems.org/q?utm_source=news and https://www.moems.org/keep?year=2030#sec | Learner name: Zed Quill; see tests/fixtures/assessment/held-out/item1.json and digest aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa. |',
  '| **Primary; reuse** | *Reuse*, Z; 2020 edition; https://www.moems.org/old | Same URL as an earlier row. |',
  '',
  'Handoff: see [Alpha home](https://www.mathcounts.org/home) and also https://evil.example.org/x.',
  '',
  '```',
  '## Fenced Heading',
  '| **Primary** | *Fenced*; https://www.moems.org/fenced | no |',
  '```',
  '',
  '## Beta research',
  '',
  '**Status: Approved for isolated authoring by the owner.**',
  '',
  '### Source register',
  '',
  '| Authority and role | Exact source | Claim |',
  '|---|---|---|',
  '| **Official program-owner source; style inspiration only** | *Beta Home*, Beta Inc.; date not stated; https://www.mathkangaroo.org.evil.com/ | Style only. |',
  '| **Primary** | *Beta Home*, Beta Inc.; date not stated; https://mathkangaroo.org/ | Style only. |',
  '',
  '## Notes',
  '',
  'No links here.',
].join('\n');

const verdictUrl = (url: string): string => evaluateSourceLink(url).url;

const parsed = parseSourceRegister(FIXTURE);
const bySlug = (slug: string): SourceRecord[] =>
  parsed.sources.filter((record) => record.dossierSlug === slug);

describe('splitTableRow', () => {
  it('keeps escaped pipes inside a cell and drops edge pipes', () => {
    expect(splitTableRow('| a \\| b | c | d |')).toEqual(['a | b', 'c', 'd']);
  });
});

describe('parseSourceRegister (fixture)', () => {
  it('inherits dossier title, date, and status without leaking other prose', () => {
    expect(parsed.dossiers.map((d) => [d.slug, d.date, d.statusClass])).toEqual([
      ['alpha-contest-research', '2030-01-02', 'pending'],
      ['beta-research', null, 'approved'],
    ]);
    expect(JSON.stringify(parsed)).not.toContain('SECRET-SCOPE-NOTE');
    expect(JSON.stringify(parsed)).not.toContain('Fenced');
  });

  it('projects every row, including secondary and no-URL document identifiers', () => {
    const alpha = bySlug('alpha-contest-research').filter((r) => r.origin === 'register-row');
    expect(alpha.map((r) => r.kind)).toEqual([
      'primary',
      'secondary',
      'primary',
      'primary',
      'primary',
      'primary',
    ]);
    const handbook = alpha[2];
    expect(handbook.links).toEqual([]);
    expect(handbook.title).toBe('Official Handbook, 3rd edition');
    expect(handbook.citation).toContain('document no. AO-42');
    expect(handbook.retrievalScope).toBe('dossier');
    expect(handbook.accessNotes).toBeNull();
  });

  it('derives title, issuer, date, retrieval, and access only from recorded text', () => {
    const rules = bySlug('alpha-contest-research')[0];
    expect(rules.title).toBe('Rules | Procedures');
    expect(rules.issuer).toBe('Alpha Org');
    expect(rules.dateNotes).toBe('updated 2030-01-01');
    expect(rules.retrieval).toBe('2030-01-02');
    expect(rules.accessNotes).toBe('retrieved 2030-01-02, HTTP 200');
    expect(rules.support).toBe('Eligibility rules.');
    expect(rules.links[0]).toMatchObject({
      href: 'https://www.moems.org/rules?year=2030#top',
      clickable: true,
      label: 'Rules | Procedures',
    });
  });

  it('extracts multiple URLs, backticked URLs, and Markdown links from text', () => {
    const urls = bySlug('alpha-contest-research').flatMap((r) => r.links.map((l) => l.url));
    expect(urls).toContain('https://blog.example.com/post');
    expect(urls).toContain('https://www.moems.org/old');
    expect(urls).toContain('https://www.mathcounts.org/home');
    expect(urls).toContain('https://evil.example.org/x');
    const textRecord = bySlug('alpha-contest-research').find((r) => r.title === 'Alpha home');
    expect(textRecord?.origin).toBe('dossier-text');
  });

  it('makes only technically valid public https links clickable, without suitability claims', () => {
    const links = parsed.sources.flatMap((r) => r.links);
    const find = (url: string) => links.find((l) => l.url === url);
    expect(find('https://blog.example.com/post')).toMatchObject({ clickable: true });
    expect(find('http://www.moems.org/plain')?.reason).toBe('not-https');
    expect(find('https://www.moems.org:8443/port')?.reason).toBe('non-default-port');
    expect(find('https://www.moems.org/keep?year=2030#sec')?.clickable).toBe(true);
    for (const link of links.filter((l) => l.clickable)) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.withheld).toBe(false);
    }
  });

  it('never makes an altered or sensitive address a link, and never projects its secrets', () => {
    const links = parsed.sources.flatMap((r) => r.links);
    const withheld = links.filter((l) => l.withheld);
    expect(withheld.length).toBeGreaterThanOrEqual(3);
    for (const link of withheld) {
      expect(link).toMatchObject({ clickable: false, href: null, reason: 'withheld' });
    }
    const json = JSON.stringify(parsed);
    for (const secret of [
      'hunter2',
      'kid@example.com',
      'abc123',
      'utm_source',
      'Zed Quill',
      'held-out/item1',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'moems.org/cred',
      'moems.org/p?',
    ]) {
      expect(json, secret).not.toContain(secret);
    }
    const probe = bySlug('alpha-contest-research').find((r) => r.title === 'Probe');
    expect(probe?.redacted).toBe(true);
  });

  it('inherits the dossier retrieval date with provenance and parses first-segment dates', () => {
    const rows = bySlug('alpha-contest-research');
    expect(rows.find((r) => r.title === 'Prep Blog')).toMatchObject({
      retrieval: '2030-01-03',
      retrievalScope: 'dossier',
    });
    expect(rows.find((r) => r.title === 'Rules | Procedures')?.retrievalScope).toBe('entry');
    expect(rows.find((r) => r.title === 'Reuse')?.dateNotes).toMatch(/2020 edition/);
  });

  it('keeps a link on every row that cites a shared URL', () => {
    const rows = bySlug('alpha-contest-research');
    const withOld = rows.filter((r) => r.links.some((l) => l.url === 'https://www.moems.org/old'));
    expect(withOld.map((r) => r.title).sort()).toEqual(['Prep Blog', 'Reuse']);
  });

  it('keeps identical rows in different dossiers distinct with stable ids', () => {
    const again = parseSourceRegister(FIXTURE);
    expect(again.sources.map((r) => r.id)).toEqual(parsed.sources.map((r) => r.id));
    expect(new Set(parsed.sources.map((r) => r.id)).size).toBe(parsed.sources.length);
  });

  it('is not changed by raw HTML or script text in a row', () => {
    const hostile = parseSourceRegister(
      [
        '## Hostile',
        '| Authority and role | Exact source | Claim |',
        '|---|---|---|',
        '| **Primary** | *<img src=x onerror=alert(1)>*, <script>alert(1)</script> | <b>bold</b> |',
      ].join('\n'),
    );
    expect(hostile.sources).toHaveLength(1);
    expect(hostile.sources[0].links).toEqual([]);
    expect(hostile.sources[0].support).toBe('<b>bold</b>');
  });

  it('does not project assessment, answer, or package fields', () => {
    const keys = new Set(parsed.sources.flatMap((r) => Object.keys(r)));
    for (const forbidden of ['answer', 'canonicalAnswer', 'packagePath', 'digest', 'body']) {
      expect(keys.has(forbidden)).toBe(false);
    }
  });
});

describe('query', () => {
  it('ignores unknown filters and bounds search text', () => {
    const query = parseSourceQuery(
      { dossier: 'nope', kind: 'weird', ref: 'x', q: `  a   ${'word '.repeat(100)} ` },
      parsed,
    );
    expect(query.dossier).toBeUndefined();
    expect(query.kind).toBeUndefined();
    expect(query.ref).toBeUndefined();
    expect(query.q?.length).toBeLessThanOrEqual(100);
  });

  it('drops sensitive-looking search text and reports it without echoing it', () => {
    for (const q of [
      'token=SYNTHETIC-VALUE',
      'alice@example.org',
      'https://x.org/?email=a@b.co',
      'token%3DSYNTHETIC-VALUE',
      'token%253DSYNTHETIC-VALUE',
      'profile: SYNTHETIC-NAME',
    ]) {
      const query = parseSourceQuery({ q }, parsed);
      expect(query.q, q).toBeUndefined();
      expect(ignoredFilters({ q }, query)).toEqual(['q']);
    }
    expect(parseSourceQuery({ q: 'amc 8 rules' }, parsed).q).toBe('amc 8 rules');
  });

  it('filters by dossier, kind, and every search token', () => {
    expect(filterSources(parsed, { dossier: 'beta-research' })).toHaveLength(2);
    expect(filterSources(parsed, { kind: 'secondary' })).toHaveLength(1);
    expect(filterSources(parsed, { q: 'handbook ao-42' })).toHaveLength(1);
    expect(filterSources(parsed, { q: 'no-such-thing' })).toHaveLength(0);
  });
});

describe('evaluateSourceLink', () => {
  it('rejects control characters, whitespace, and non-URLs', () => {
    for (const raw of [
      '',
      'not a url',
      'https://www.moems.org/a b',
      'ftp://www.moems.org/',
      'https://',
    ]) {
      expect(evaluateSourceLink(raw).clickable).toBe(false);
    }
  });
});

describe('authoritative register (docs/curriculum-sources.md)', () => {
  const markdown = readFileSync(path.join(process.cwd(), 'docs', 'curriculum-sources.md'), 'utf8');
  const register = parseSourceRegister(markdown);

  it('projects exactly one record per register-table row', () => {
    const lines = markdown.split('\n');
    let rows = 0;
    lines.forEach((line, index) => {
      if (/^\|\s*Authority and/.test(line)) {
        for (let next = index + 2; /^\|/.test(lines[next] ?? ''); next += 1) rows += 1;
      }
    });
    expect(rows).toBeGreaterThan(70);
    expect(register.sources.filter((r) => r.origin === 'register-row')).toHaveLength(rows);
  });

  it('surfaces every cited URL in the document under its dossier', () => {
    let section = '';
    const expected = new Set<string>();
    for (const line of markdown.split('\n')) {
      const heading = /^##\s+(.+)$/.exec(line);
      if (heading) section = heading[1];
      for (const match of line.matchAll(/https?:\/\/[^\s`<>"'()[\]|*]+/g)) {
        expected.add(`${section}\u0000${verdictUrl(match[0].replace(/[.,;:!?]+$/, ''))}`);
      }
    }
    const titleBySlug = new Map(register.dossiers.map((d) => [d.slug, d]));
    const actual = new Set(
      register.sources.flatMap((record) => {
        const dossier = titleBySlug.get(record.dossierSlug)!;
        const heading = markdown
          .split('\n')
          .find((line) => line.startsWith('## ') && line.includes(dossier.title))!
          .slice(3);
        return record.links.map((link) => `${heading}\u0000${link.url}`);
      }),
    );
    for (const entry of expected) expect(actual.has(entry), entry).toBe(true);
  });

  it('labels pending dossiers as pending and exposes no learner lesson content', () => {
    const pending = register.dossiers.filter((d) => d.statusClass === 'pending').map((d) => d.slug);
    expect(pending).toEqual(
      expect.arrayContaining([
        'iac-national-geography-bee-grade-6-research',
        'science-olympiad-division-b-2027-research',
      ]),
    );
    expect(register.dossiers.every((d) => (d.statusText ?? '').length <= 300)).toBe(true);
  });

  it('links only https addresses and keeps http as text', () => {
    for (const record of register.sources) {
      for (const link of record.links) {
        if (link.clickable) expect(link.href).toMatch(/^https:\/\/[^/]+\//);
      }
    }
    const http = register.sources.flatMap((r) => r.links).find((l) => l.url.startsWith('http://'));
    expect(http?.clickable).toBe(false);
  });

  it('inherits dossier-wide retrieval dates and parses handbook editions', () => {
    const mathcounts = register.sources.filter((r) => r.dossierSlug.includes('mathcounts'));
    expect(mathcounts.length).toBeGreaterThan(0);
    expect(mathcounts.every((r) => r.retrieval !== null)).toBe(true);
    expect(mathcounts.some((r) => r.retrieval?.includes('2026-09-18'))).toBe(true);
    const handbooks = register.sources.filter((r) => /handbook/i.test(r.title ?? ''));
    expect(handbooks.some((r) => r.dateNotes)).toBe(true);
  });

  it('keeps no-URL secondary and document-identifier rows discoverable', () => {
    const noLink = register.sources.filter((r) => r.links.length === 0);
    expect(noLink.length).toBeGreaterThan(0);
    for (const record of noLink) expect(record.citation.length).toBeGreaterThan(0);
  });

  it('projects only a vetted set of fields and no private-bank terms', () => {
    const allowed = new Set([
      'id',
      'dossierSlug',
      'origin',
      'authority',
      'kind',
      'title',
      'issuer',
      'citation',
      'dateNotes',
      'retrieval',
      'retrievalScope',
      'redacted',
      'accessNotes',
      'support',
      'links',
    ]);
    for (const record of register.sources) {
      for (const key of Object.keys(record)) expect(allowed.has(key), key).toBe(true);
    }
    expect(JSON.stringify(register)).not.toMatch(/canonicalAnswer|heldOut|packageDigest/i);
  });
});

const ADVERSARIAL = [
  '## Beta Contest research',
  '',
  '**Status: Approved by profile: SYNTHETIC-NAME.**',
  '',
  '| Authority and role | Exact source | Claim |',
  '|---|---|---|',
  '| **Primary** | *Drive copy*, Org; https://drive.google.com/uc?export=download&id=1w8AkMWqMAHPidIEfAs9044xp | Reads /private/synthetic-bank.json then profile: SYNTHETIC-NAME. |',
  '| **Primary** | *Shared doc*, Org; https://docs.google.com/document/d/abc/edit?usp=sharing | Benign query kept. |',
  '| **Primary** | *Email hash*, Org; https://example.org/#alice@example.org | Hash email. |',
  '| **Primary** | *Double*, Org; https://www.moems.org/d?u=alice%2540example.org and https://www.moems.org/c%250aattack | Double encoded. |',
  '| **Primary** | *Hosts*, Org; https://foo.local/a https://foo.localhost./b https://a..org/c https://%65xample.org/d https://www.moems.org/e%0a | Hosts. |',
  '| **Primary** | *Nested value*, Org; https://example.org/a?x=%2574oken%253DSYNTHETIC | Secret nested in a benign value. |',
  '| **Primary** | *Nested*, Org; https://www.moems.org/n%25252525250a | Never settles. |',
].join('\n');

describe('adversarial register projection', () => {
  const register = parseSourceRegister(ADVERSARIAL);
  const links = register.sources.flatMap((r) => r.links);
  const clickable = links.filter((l) => l.clickable).map((l) => l.url);

  it('links only the benign query address', () => {
    expect(clickable).toEqual(['https://docs.google.com/document/d/abc/edit?usp=sharing']);
    for (const link of links.filter((l) => !l.clickable)) expect(link.href).toBeNull();
  });

  it('keeps descriptive metadata for withheld addresses without leaking them', () => {
    const drive = register.sources.find((r) => r.title === 'Drive copy');
    expect(drive?.redacted).toBe(true);
    expect(drive?.issuer).toBe('Org');
    expect(drive?.links[0]).toMatchObject({ url: 'https://drive.google.com', withheld: true });
    const json = JSON.stringify(register);
    for (const secret of [
      'AMkWqMAHPidIEfAs9044xp',
      'alice',
      'synthetic-bank',
      'SYNTHETIC-NAME',
      '%0a',
      '%65xample',
      '1w8AkM',
      'SYNTHETIC',
    ]) {
      expect(json, secret).not.toContain(secret);
    }
  });

  it('withholds a whole address whose benign parameter value hides a secret assignment', () => {
    for (const url of [
      'https://example.org/a?x=%2574oken%253DSYNTHETIC',
      'https://example.org/a?x=token%3DSYNTHETIC',
      'https://example.org/a?x=1#password=SYNTHETIC',
      'https://example.org/a#x=%2570assword%253DSYNTHETIC',
    ]) {
      expect(evaluateSourceLink(url), url).toMatchObject({
        clickable: false,
        href: null,
        withheld: true,
        reason: 'withheld',
      });
    }
    const row = register.sources.find((r) => r.title === 'Nested value');
    expect(row).toMatchObject({ redacted: true });
    const serialized = JSON.stringify(row);
    for (const text of ['SYNTHETIC', 'oken%253D', 'a?x=']) {
      expect(serialized, text).not.toContain(text);
    }
    expect(row?.links[0]).toMatchObject({ clickable: false, href: null });
  });

  it('rejects local, malformed, encoded, and non-settling hosts', () => {
    for (const url of [
      'https://foo.local/',
      'https://foo.local./',
      'https://foo.localhost./',
      'https://a..org/',
      'https://%65xample.org/',
      'https://www.moems.org/x%0a',
      'https://www.moems.org/x%250a',
      'https://www.moems.org/n%25252525250a',
      'https://127.1/',
      'https://0x7f.1/',
      'https://[::1]/',
      'https://localhost/',
      'https://intranet/',
    ]) {
      const verdict = evaluateSourceLink(url);
      expect(verdict.clickable, url).toBe(false);
      expect(verdict.href, url).toBeNull();
    }
    expect(evaluateSourceLink('https://www.moems.org./ok').clickable).toBe(true);
    expect(analyzeUrl('https://example.org/?usp=sharing').safe).toBe(true);
  });
});
