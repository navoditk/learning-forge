/**
 * Renders the validated skill and content catalogs into a browsable static
 * page for parents/learners. Reuses the same `skillCatalog`/`contentCatalog`
 * exports the app runs on, so the page can never drift from what actually
 * ships - if it doesn't pass catalog validation, this script doesn't run.
 *
 * Deliberately omits anything answer-bearing (canonical/accepted answers,
 * solution text, hint steps, forbidden-leakage patterns): this page is meant
 * to be publicly browsable, so a curious learner following the link must not
 * be able to read off answers to the sample problems shown here.
 *
 * Usage: `npm run curriculum:site` (writes to `dist/curriculum-site/`).
 * CI regenerates and deploys this to GitHub Pages on every push to `main`
 * (see `.github/workflows/curriculum-site.yml`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';

import type { ContentItem } from '../src/contracts/content';
import type { CurriculumDomain, Skill } from '../src/contracts/curriculum';
import { contentCatalog } from '../src/content/catalog';
import { skillCatalog } from '../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../src/curriculum/program-roster';

const DOMAIN_LABELS: Record<CurriculumDomain, string> = {
  'ratios-and-proportional-reasoning': 'Ratios & Proportional Reasoning',
  'number-system': 'Number System',
  'expressions-and-equations': 'Expressions & Equations',
  geometry: 'Geometry',
  statistics: 'Statistics & Probability',
  'mk6-arithmetic-and-patterns': 'Arithmetic & Number Patterns',
  'mk6-geometry-and-spatial-reasoning': 'Geometry & Spatial Reasoning',
  'mk6-logical-reasoning': 'Logical Reasoning',
  'mk6-combinatorics': 'Combinatorics',
};

const MODE_LABELS: Record<ContentItem['mode'], string> = {
  core: 'Core',
  depth: 'Depth',
  contest: 'Contest',
  review: 'Review',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function pillList(values: readonly string[], className: string): string {
  if (values.length === 0) return '';
  return `<ul class="pills ${className}">${values
    .map((value) => `<li>${escapeHtml(value)}</li>`)
    .join('')}</ul>`;
}

function renderContentItem(item: ContentItem): string {
  const reviewed = item.review.status === 'reviewed';
  return `
    <li class="content-item">
      <div class="content-item-meta">
        <span class="badge badge-mode">${escapeHtml(MODE_LABELS[item.mode])}</span>
        <span class="badge badge-difficulty">${escapeHtml(item.difficulty)}</span>
        <span class="badge ${reviewed ? 'badge-reviewed' : 'badge-pending'}">${
          reviewed ? 'Reviewed' : 'Pending review'
        }</span>
      </div>
      <p class="content-item-title">${escapeHtml(item.title)}</p>
      <p class="content-item-prompt">${escapeHtml(item.prompt)}</p>
    </li>`;
}

function renderSkill(skill: Skill, items: readonly ContentItem[]): string {
  const anchor = slugify(skill.code);
  const prerequisites =
    skill.prerequisiteSkillCodes.length > 0
      ? skill.prerequisiteSkillCodes
          .map((code) => `<a href="#skill-${slugify(code)}">${escapeHtml(code)}</a>`)
          .join(', ')
      : 'None';

  return `
    <article class="skill-card" id="skill-${anchor}">
      <details class="skill-details">
        <summary class="skill-header">
          <span class="skill-title">${escapeHtml(skill.title)}</span>
          <code class="skill-code">${escapeHtml(skill.code)}</code>
        </summary>
        <div class="skill-body">
          ${pillList(skill.standards, 'standards')}
          <dl class="skill-facts">
            <div>
              <dt>Prerequisites</dt>
              <dd>${prerequisites}</dd>
            </div>
            <div>
              <dt>Difficulty bands</dt>
              <dd>${skill.difficultyBands.map(escapeHtml).join(', ')}</dd>
            </div>
            <div>
              <dt>Mastery check</dt>
              <dd>${escapeHtml(skill.masteryCheckRule)}</dd>
            </div>
          </dl>
          <div class="skill-evidence">
            <p class="skill-subheading">What mastery looks like</p>
            <ul>
              ${skill.observableEvidence.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
            </ul>
          </div>
          ${
            items.length > 0
              ? `<div class="skill-content">
                  <p class="skill-subheading">Sample problems (${items.length})</p>
                  <ul class="content-item-list">${items.map(renderContentItem).join('')}</ul>
                </div>`
              : ''
          }
        </div>
      </details>
    </article>`;
}

function buildBody(): { title: string; stats: string; body: string } {
  const byProgram = new Map<string, Skill[]>();
  for (const skill of skillCatalog) {
    const bucket = byProgram.get(skill.program) ?? [];
    bucket.push(skill);
    byProgram.set(skill.program, bucket);
  }

  const contentBySkill = new Map<string, ContentItem[]>();
  for (const item of contentCatalog) {
    const bucket = contentBySkill.get(item.skillCode) ?? [];
    bucket.push(item);
    contentBySkill.set(item.skillCode, bucket);
  }

  const reviewedCount = contentCatalog.filter((item) => item.review.status === 'reviewed').length;
  const standardsCovered = new Set(skillCatalog.flatMap((skill) => skill.standards));

  const statsHtml = `
    <div class="stat"><span class="stat-value">${skillCatalog.length}</span><span class="stat-label">Skills</span></div>
    <div class="stat"><span class="stat-value">${contentCatalog.length}</span><span class="stat-label">Problems</span></div>
    <div class="stat"><span class="stat-value">${standardsCovered.size}</span><span class="stat-label">Standards covered</span></div>
    <div class="stat"><span class="stat-value">${reviewedCount}/${contentCatalog.length}</span><span class="stat-label">Human-reviewed</span></div>`;

  const navSections: string[] = [];
  const programSections: string[] = [];

  for (const roster of PROGRAM_ROSTER) {
    const programAnchor = slugify(roster.code);
    const skills = byProgram.get(roster.code) ?? [];

    if (!roster.available && skills.length === 0) {
      navSections.push(`
        <li class="nav-program nav-program-disabled">
          <a href="#program-${programAnchor}">${escapeHtml(roster.label)}</a>
          <span class="badge badge-pending">Coming soon</span>
        </li>`);

      programSections.push(`
        <section class="program-section program-section-empty" id="program-${programAnchor}">
          <h1>${escapeHtml(roster.label)} <span class="badge badge-pending">Coming soon</span></h1>
          <p class="page-intro">This program isn't authored yet. It'll appear here with its own skill graph and sample problems once it is.</p>
        </section>`);
      continue;
    }

    const pendingProgramBadge = roster.available
      ? ''
      : '<span class="badge badge-pending">Draft — pending human approval</span>';
    const byDomain = new Map<CurriculumDomain, Skill[]>();
    for (const skill of skills) {
      const bucket = byDomain.get(skill.domain) ?? [];
      bucket.push(skill);
      byDomain.set(skill.domain, bucket);
    }

    const domainNav: string[] = [];
    const domainSections: string[] = [];

    for (const [domain, domainSkills] of byDomain) {
      const domainAnchor = slugify(domain);
      domainNav.push(`
        <li class="nav-domain">
          <details>
            <summary>${escapeHtml(DOMAIN_LABELS[domain])}</summary>
            <a class="nav-section-link" href="#domain-${domainAnchor}">View section</a>
            <ul>${domainSkills
              .map(
                (skill) =>
                  `<li><a href="#skill-${slugify(skill.code)}">${escapeHtml(skill.title)}</a></li>`,
              )
              .join('')}</ul>
          </details>
        </li>`);

      domainSections.push(`
        <details class="domain-section" id="domain-${domainAnchor}" open>
          <summary><span>${escapeHtml(DOMAIN_LABELS[domain])}</span></summary>
          <div class="domain-body">
            ${domainSkills
              .map((skill) => renderSkill(skill, contentBySkill.get(skill.code) ?? []))
              .join('')}
          </div>
        </details>`);
    }

    navSections.push(`
      <li class="nav-program">
        <details${roster.code === 'grade-6-math' ? ' open' : ''}>
          <summary>${escapeHtml(roster.label)} ${pendingProgramBadge}</summary>
          <a class="nav-section-link" href="#program-${programAnchor}">View program</a>
          <ul>${domainNav.join('')}</ul>
        </details>
      </li>`);

    programSections.push(`
      <section class="program-section" id="program-${programAnchor}">
        <h1>${escapeHtml(roster.label)} ${pendingProgramBadge}</h1>
        ${
          roster.available
            ? ''
            : '<p class="page-intro">This authored draft has passed independent review but is not learner-servable until human content-owner approval.</p>'
        }
        ${domainSections.join('')}
      </section>`);
  }

  const body = `
    <div class="layout">
      <nav class="sidebar">
        <p class="sidebar-title">Programs</p>
        <ul>${navSections.join('')}</ul>
      </nav>
      <main class="content">
        <header class="page-header">
          <p class="eyebrow">Learning Forge</p>
          <h1>Curriculum map</h1>
          <p class="page-intro">Every authored skill and sample problem in the validated catalog, generated straight from the same data the app uses. Draft programs are clearly labeled and remain unavailable to learners until human approval. Answers and hints are intentionally left out.</p>
          <div class="stats">${statsHtml}</div>
        </header>
        ${programSections.join('')}
      </main>
    </div>`;

  return { title: 'Learning Forge — Curriculum Map', stats: statsHtml, body };
}

const CSS = `
  :root {
    --bg: #faf9f6;
    --surface: #ffffff;
    --border: #e4e0d6;
    --text: #22221f;
    --text-muted: #63615a;
    --accent: #3b6e68;
    --accent-soft: #e4efed;
    --good: #2f7d4f;
    --good-soft: #e5f3ea;
    --pending: #a06a1f;
    --pending-soft: #f6ecd9;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      --bg: #16181a;
      --surface: #1f2225;
      --border: #33373b;
      --text: #ecebe6;
      --text-muted: #a7a59d;
      --accent: #7fc2b8;
      --accent-soft: #223532;
      --good: #7fd39a;
      --good-soft: #1e3327;
      --pending: #e0b167;
      --pending-soft: #362a15;
    }
  }
  :root[data-theme='dark'] {
    --bg: #16181a;
    --surface: #1f2225;
    --border: #33373b;
    --text: #ecebe6;
    --text-muted: #a7a59d;
    --accent: #7fc2b8;
    --accent-soft: #223532;
    --good: #7fd39a;
    --good-soft: #1e3327;
    --pending: #e0b167;
    --pending-soft: #362a15;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.55;
  }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; text-wrap: balance; }
  a { color: var(--accent); }
  code, .skill-code { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
  .layout { display: flex; align-items: flex-start; max-width: 1180px; margin: 0 auto; }
  .sidebar {
    position: sticky;
    top: 0;
    flex: 0 0 260px;
    max-height: 100vh;
    overflow-y: auto;
    padding: 2rem 1.25rem;
    border-right: 1px solid var(--border);
  }
  .sidebar-title { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 0.75rem; }
  .sidebar ul { list-style: none; margin: 0; padding: 0; }
  .sidebar > ul > li { margin-bottom: 1rem; }
  .sidebar a { text-decoration: none; font-weight: 600; }
  .sidebar li li a { font-weight: 400; font-size: 0.9rem; }
  .sidebar ul ul { padding-left: 0.9rem; margin-top: 0.35rem; }
  .sidebar summary { cursor: pointer; font-weight: 600; }
  .sidebar summary:hover, .sidebar summary:focus-visible { color: var(--accent); }
  .sidebar .nav-domain { margin-top: 0.45rem; }
  .sidebar .nav-domain summary { font-size: 0.9rem; font-weight: 400; }
  .sidebar .nav-section-link { display: inline-block; margin: 0.25rem 0 0 0.9rem; color: var(--text-muted); font-size: 0.78rem; font-weight: 400; }
  .sidebar .nav-section-link:hover, .sidebar .nav-section-link:focus-visible { color: var(--accent); }
  .sidebar-note { font-size: 0.8rem; color: var(--text-muted); margin-top: 1.5rem; }
  .content { flex: 1 1 auto; padding: 2.5rem 2.5rem 5rem; min-width: 0; }
  .page-header { max-width: 720px; margin-bottom: 3rem; }
  .eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; color: var(--accent); font-weight: 600; margin: 0 0 0.5rem; }
  .page-header h1 { font-size: 2.4rem; margin: 0 0 0.75rem; }
  .page-intro { color: var(--text-muted); max-width: 60ch; }
  .stats { display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; }
  .stat { display: flex; flex-direction: column; }
  .stat-value { font-family: 'Fraunces', serif; font-size: 1.6rem; font-variant-numeric: tabular-nums; }
  .stat-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .program-section h1 { font-size: 1.6rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
  .domain-section { margin-top: 2.5rem; }
  .domain-section > summary { cursor: pointer; font-family: 'Fraunces', Georgia, serif; font-size: 1.3rem; font-weight: 600; margin-bottom: 1.25rem; padding: 0.4rem 0; }
  .domain-section > summary:hover, .domain-section > summary:focus-visible, .skill-header:hover, .skill-header:focus-visible { color: var(--accent); }
  .domain-body { padding-top: 0.25rem; }
  .skill-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 1.25rem;
    scroll-margin-top: 1rem;
  }
  .skill-header { cursor: pointer; display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1.25rem 1.5rem; }
  .skill-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.15rem; font-weight: 600; }
  .skill-body { border-top: 1px solid var(--border); padding: 0.25rem 1.5rem 1.5rem; }
  .skill-code { font-size: 0.78rem; color: var(--text-muted); }
  .pills { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0; margin: 0.6rem 0 0; }
  .pills.standards li { background: var(--accent-soft); color: var(--accent); border-radius: 999px; padding: 0.15rem 0.65rem; font-size: 0.78rem; font-weight: 600; font-family: 'IBM Plex Mono', monospace; }
  .skill-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1.1rem 0; }
  .skill-facts dt { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.2rem; }
  .skill-facts dd { margin: 0; font-size: 0.92rem; }
  .skill-subheading { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 1.1rem 0 0.5rem; }
  .skill-evidence ul { margin: 0; padding-left: 1.2rem; }
  .content-item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
  .content-item { border-top: 1px dashed var(--border); padding-top: 0.75rem; }
  .content-item-meta { display: flex; gap: 0.4rem; margin-bottom: 0.35rem; }
  .badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; padding: 0.15rem 0.5rem; border-radius: 999px; }
  .badge-mode { background: var(--accent-soft); color: var(--accent); }
  .badge-difficulty { background: var(--border); color: var(--text-muted); }
  .badge-reviewed { background: var(--good-soft); color: var(--good); }
  .badge-pending { background: var(--pending-soft); color: var(--pending); }
  .content-item-title { font-weight: 600; margin: 0 0 0.2rem; }
  .content-item-prompt { margin: 0; color: var(--text-muted); }
  .nav-program-disabled { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .nav-program-disabled a { color: var(--text-muted); font-weight: 400; }
  .program-section-empty h1 { display: flex; align-items: center; gap: 0.75rem; font-size: 1.4rem; }
  @media (max-width: 860px) {
    .layout { flex-direction: column; }
    .sidebar { position: static; width: 100%; max-height: none; border-right: none; border-bottom: 1px solid var(--border); }
  }
`;

function buildFullDocument(): string {
  const { title, body } = buildBody();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
  <style>${CSS}</style>
</head>
<body>
${body}
<script>
  function expandHashTarget() {
    const target = document.querySelector(location.hash);
    if (!target) return;
    if (target.matches('details')) target.open = true;
    for (const details of target.querySelectorAll('details')) details.open = true;
    let parent = target.parentElement;
    while (parent) {
      if (parent.matches('details')) parent.open = true;
      parent = parent.parentElement;
    }
    const navLink = document.querySelector('.sidebar a[href="' + location.hash + '"]');
    parent = navLink?.parentElement;
    while (parent) {
      if (parent.matches('details')) parent.open = true;
      parent = parent.parentElement;
    }
  }
  addEventListener('hashchange', expandHashTarget);
  expandHashTarget();
</script>
</body>
</html>`;
}

const outDir = new URL('../dist/curriculum-site/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL('index.html', outDir), buildFullDocument(), 'utf8');

console.log(
  `Wrote curriculum site (${skillCatalog.length} skills, ${contentCatalog.length} problems) to dist/curriculum-site/index.html`,
);
