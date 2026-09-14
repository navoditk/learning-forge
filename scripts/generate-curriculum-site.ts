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
import type { CurriculumDomain, CurriculumProgram, Skill } from '../src/contracts/curriculum';
import { contentCatalog } from '../src/content/catalog';
import { skillCatalog } from '../src/curriculum/catalog';

const PROGRAM_LABELS: Record<CurriculumProgram, string> = {
  'grade-6-math': 'Grade 6 Math',
};

const DOMAIN_LABELS: Record<CurriculumDomain, string> = {
  'ratios-and-proportional-reasoning': 'Ratios & Proportional Reasoning',
  'number-system': 'Number System',
  'expressions-and-equations': 'Expressions & Equations',
  geometry: 'Geometry',
  statistics: 'Statistics & Probability',
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
      <header class="skill-header">
        <h3>${escapeHtml(skill.title)}</h3>
        <code class="skill-code">${escapeHtml(skill.code)}</code>
      </header>
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
    </article>`;
}

function buildBody(): { title: string; stats: string; body: string } {
  const byProgram = new Map<CurriculumProgram, Skill[]>();
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

  for (const [program, skills] of byProgram) {
    const byDomain = new Map<CurriculumDomain, Skill[]>();
    for (const skill of skills) {
      const bucket = byDomain.get(skill.domain) ?? [];
      bucket.push(skill);
      byDomain.set(skill.domain, bucket);
    }

    const programAnchor = slugify(program);
    const domainNav: string[] = [];
    const domainSections: string[] = [];

    for (const [domain, domainSkills] of byDomain) {
      const domainAnchor = slugify(domain);
      domainNav.push(`
        <li>
          <a href="#domain-${domainAnchor}">${escapeHtml(DOMAIN_LABELS[domain])}</a>
          <ul>${domainSkills
            .map(
              (skill) =>
                `<li><a href="#skill-${slugify(skill.code)}">${escapeHtml(skill.title)}</a></li>`,
            )
            .join('')}</ul>
        </li>`);

      domainSections.push(`
        <section class="domain-section" id="domain-${domainAnchor}">
          <h2>${escapeHtml(DOMAIN_LABELS[domain])}</h2>
          ${domainSkills
            .map((skill) => renderSkill(skill, contentBySkill.get(skill.code) ?? []))
            .join('')}
        </section>`);
    }

    navSections.push(`
      <li class="nav-program">
        <a href="#program-${programAnchor}">${escapeHtml(PROGRAM_LABELS[program])}</a>
        <ul>${domainNav.join('')}</ul>
      </li>`);

    programSections.push(`
      <section class="program-section" id="program-${programAnchor}">
        <h1>${escapeHtml(PROGRAM_LABELS[program])}</h1>
        ${domainSections.join('')}
      </section>`);
  }

  const body = `
    <div class="layout">
      <nav class="sidebar">
        <p class="sidebar-title">Programs</p>
        <ul>${navSections.join('')}</ul>
        <p class="sidebar-note">More programs - Math Kangaroo, AMC&nbsp;8, MATHCOUNTS, MOEMS, Grade&nbsp;6 ELA - will appear here as they're added.</p>
      </nav>
      <main class="content">
        <header class="page-header">
          <p class="eyebrow">Learning Forge</p>
          <h1>Curriculum map</h1>
          <p class="page-intro">Every skill and sample problem currently live in the tutor, generated straight from the same catalog the app runs on. Answers and hints are intentionally left out.</p>
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
  .domain-section h2 { font-size: 1.3rem; margin-bottom: 1.25rem; }
  .skill-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    scroll-margin-top: 1rem;
  }
  .skill-header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .skill-header h3 { margin: 0; font-size: 1.15rem; }
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
</body>
</html>`;
}

const outDir = new URL('../dist/curriculum-site/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL('index.html', outDir), buildFullDocument(), 'utf8');

console.log(
  `Wrote curriculum site (${skillCatalog.length} skills, ${contentCatalog.length} problems) to dist/curriculum-site/index.html`,
);
