import type { Metadata } from 'next';
import Link from 'next/link';

import { LINK_REASON_LABELS } from '../../sources/link-policy';
import {
  dossierBySlug,
  filterSources,
  ignoredFilters,
  parseSourceQuery,
  type SourceQuery,
} from '../../sources/query';
import type {
  DossierSummary,
  DossierStatusClass,
  SourceKind,
  SourceLink,
  SourceRecord,
} from '../../sources/register-parser';
import { loadSourceRegister } from '../../sources/register.server';

export const metadata: Metadata = {
  title: 'Curriculum resources — Learning Forge',
};

export const dynamic = 'force-dynamic';

const KIND_LABELS: Record<SourceKind, string> = {
  primary: 'Primary source',
  secondary: 'Secondary source',
  inspiration: 'Optional inspiration (style only)',
  other: 'Other / location checked',
};

const STATUS_LABELS: Record<DossierStatusClass, string> = {
  approved: 'Research approved by the content owner (research only, not a lesson)',
  pending: 'Research pending content-owner review (citations shown for transparency only)',
  informal: 'Informal input, not formally sourced',
  unspecified: 'No research status recorded in the register',
};

const NOT_RECORDED = 'Not recorded in the register.';

function hrefFor(query: SourceQuery): string {
  const params = new URLSearchParams();
  if (query.dossier) params.set('dossier', query.dossier);
  if (query.kind) params.set('kind', query.kind);
  if (query.q) params.set('q', query.q);
  if (query.ref) params.set('ref', query.ref);
  const text = params.toString();
  return text ? `/resources?${text}` : '/resources';
}

function StatusBadge({ dossier }: { dossier: DossierSummary }) {
  return (
    <span className={`source-status source-status-${dossier.statusClass}`}>
      {STATUS_LABELS[dossier.statusClass]}
    </span>
  );
}

function LinkItem({ link }: { link: SourceLink }) {
  if (link.clickable && link.href) {
    return (
      <li>
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
          <span className="source-link-note">
            {' '}
            — {link.host} · leaves Learning Forge, opens in a new tab, not reviewed for children
          </span>
        </a>
        <code className="source-url">{link.url}</code>
      </li>
    );
  }
  return (
    <li>
      <span className="source-link-text">{link.label}</span>
      <code className="source-url">{link.url}</code>
      <span className="source-link-note">
        {link.reason ? LINK_REASON_LABELS[link.reason] : 'Not linked.'}
      </span>
    </li>
  );
}

function SourceCard({ record, dossier }: { record: SourceRecord; dossier?: DossierSummary }) {
  const headingId = `${record.id}-title`;
  return (
    <article id={record.id} className="source-card" aria-labelledby={headingId}>
      <h3 id={headingId} className="source-title">
        {record.title ?? 'Title not stated in the register'}
      </h3>
      <dl className="source-facts">
        <div>
          <dt>Reference</dt>
          <dd>
            <code>{record.id}</code>{' '}
            <Link href={hrefFor({ ref: record.id })}>
              Permalink<span className="visually-hidden"> to this resource</span>
            </Link>
          </dd>
        </div>
        {dossier ? (
          <div>
            <dt>Program / dossier</dt>
            <dd>
              <Link href={hrefFor({ dossier: dossier.slug })}>{dossier.title}</Link>
              {' — '}
              <StatusBadge dossier={dossier} />
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Source type</dt>
          <dd>
            {KIND_LABELS[record.kind]}
            {record.authority ? ` — as recorded: “${record.authority}”` : ''}
          </dd>
        </div>
        <div>
          <dt>Issuer</dt>
          <dd>{record.issuer ?? 'Not separately identified; see the full citation below.'}</dd>
        </div>
        <div>
          <dt>Edition / date</dt>
          <dd>{record.dateNotes ?? 'Unknown: no edition or date recorded.'}</dd>
        </div>
        <div>
          <dt>Retrieved</dt>
          <dd>
            {record.retrieval
              ? `${record.retrieval}${
                  record.retrievalScope === 'dossier'
                    ? ' (recorded once for this whole dossier, not for this entry alone)'
                    : ''
                }`
              : 'Unknown: no retrieval date recorded for this entry or its dossier.'}
          </dd>
        </div>
        <div>
          <dt>Access notes (as recorded)</dt>
          <dd>{record.accessNotes ?? 'None recorded.'}</dd>
        </div>
        <div>
          <dt>What it supports</dt>
          <dd>{record.support ?? NOT_RECORDED}</dd>
        </div>
      </dl>
      <h4 className="source-links-heading">Where to find it</h4>
      {record.links.length > 0 ? (
        <ul className="source-links">
          {record.links.map((link) => (
            <LinkItem key={link.url} link={link} />
          ))}
        </ul>
      ) : (
        <p className="source-no-link">
          No link is recorded in the register. Identify this resource by the title, issuer, and
          citation above.
        </p>
      )}
      {record.redacted ? (
        <p className="source-link-note">
          Some details in this entry (credentials, tracking, private paths, or similar) were
          withheld from this page.
        </p>
      ) : null}
      <details className="source-citation">
        <summary>Full citation as recorded</summary>
        <p>{record.citation}</p>
      </details>
    </article>
  );
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const register = loadSourceRegister();
  const rawParams = await searchParams;
  const query = parseSourceQuery(rawParams, register);
  const dropped = ignoredFilters(rawParams, query);
  const results = filterSources(register, query);
  const filtered = Boolean(query.dossier || query.kind || query.q || query.ref);
  const selectedDossier = query.dossier ? dossierBySlug(register, query.dossier) : undefined;

  return (
    <main className="resources-main">
      <header>
        <div className="brand">
          Learning Forge
          <small>Curriculum resources</small>
        </div>
        <nav aria-label="Primary navigation">
          <Link href="/">Learner session</Link>
          <Link href="/parent">Parent evidence</Link>
          <Link href="/help">Help</Link>
          <Link href="/resources" aria-current="page">
            Curriculum resources
          </Link>
        </nav>
      </header>

      <h1>Curriculum resources</h1>
      <p>
        A reference list for parents and teachers of the standards, rules, and official pages that
        informed each research dossier. It is generated from the project’s source register and shows
        citations only: no lessons, practice questions, or answers, and nothing here counts toward
        learner progress.
      </p>
      <ul className="resources-notes">
        <li>
          This is an adult reference view, not a list of recommended learner activities. Links go to
          outside websites that Learning Forge has not reviewed for children. Some resources, such
          as past contests, handbooks, and answer keys, may include solutions, so an adult should
          look before a learner uses them.
        </li>
        <li>
          A link only means the recorded address passed technical checks (HTTPS, no embedded
          credentials, no tracking or private query details). It does not mean the page is safe,
          suitable, or endorsed. Each link says it leaves Learning Forge.
        </li>
        <li>
          Research status is not content approval. “Approved” means the owner accepted a research
          dossier, and “pending” means it is still waiting for review. Neither says whether any
          lesson is served to learners, and no publisher has endorsed Learning Forge.
        </li>
        <li>
          Link health is not checked here. Access notes repeat what researchers recorded on the
          retrieval date, so a page may have moved or changed since.
        </li>
      </ul>

      {dropped.length > 0 ? (
        <p role="status" className="source-notice">
          {dropped.includes('q')
            ? 'Search text that looks like private or sensitive information was not used or shown.'
            : dropped.includes('ref')
              ? 'That resource reference was not found, so it was ignored.'
              : 'A filter in the address was not recognised, so it was ignored.'}{' '}
          <Link href="/resources">Show all resources</Link>
        </p>
      ) : null}

      <section aria-labelledby="resources-filter-heading" className="resources-filters">
        <h2 id="resources-filter-heading">Find resources</h2>
        <form
          method="get"
          action="/resources"
          role="search"
          aria-label="Search curriculum resources"
        >
          <div className="resources-filter-grid">
            <div>
              <label htmlFor="resources-q">Search title, issuer, or address</label>
              <input
                id="resources-q"
                name="q"
                type="text"
                defaultValue={query.q ?? ''}
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="resources-dossier">Program / research dossier</label>
              <select id="resources-dossier" name="dossier" defaultValue={query.dossier ?? ''}>
                <option value="">All programs ({register.sources.length} resources)</option>
                {register.dossiers.map((dossier) => (
                  <option key={dossier.slug} value={dossier.slug}>
                    {dossier.title} ({dossier.sourceCount})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="resources-kind">Source type</label>
              <select id="resources-kind" name="kind" defaultValue={query.kind ?? ''}>
                <option value="">All types</option>
                {(Object.keys(KIND_LABELS) as SourceKind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit">Apply filters</button>
          {filtered ? <Link href="/resources">Clear filters</Link> : null}
        </form>
      </section>

      {!filtered ? (
        <section aria-labelledby="resources-dossiers-heading">
          <h2 id="resources-dossiers-heading">Programs and research dossiers</h2>
          <ul className="dossier-list">
            {register.dossiers.map((dossier) => (
              <li key={dossier.slug}>
                <Link href={hrefFor({ dossier: dossier.slug })}>{dossier.title}</Link>
                <span className="dossier-meta">
                  {dossier.sourceCount} {dossier.sourceCount === 1 ? 'resource' : 'resources'}
                  {dossier.date ? ` · dossier dated ${dossier.date}` : ''}
                </span>
                <StatusBadge dossier={dossier} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="resources-results-heading">
        <h2 id="resources-results-heading">
          {selectedDossier ? `${selectedDossier.title}: ` : ''}
          {results.length} of {register.sources.length} resources
        </h2>
        {selectedDossier ? (
          <p>
            <StatusBadge dossier={selectedDossier} />
            {selectedDossier.statusText ? ` Recorded as: “${selectedDossier.statusText}”` : ''}
          </p>
        ) : null}
        {results.length === 0 ? (
          <p role="status">
            No resources match these filters. Try fewer words or{' '}
            <Link href="/resources">clear all filters</Link>.
          </p>
        ) : (
          results.map((record) => (
            <SourceCard
              key={record.id}
              record={record}
              dossier={dossierBySlug(register, record.dossierSlug)}
            />
          ))
        )}
      </section>
    </main>
  );
}
