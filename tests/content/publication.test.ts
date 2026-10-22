import { describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { contentCatalog } from '../../src/content/catalog';
import { publishableSkillProjection } from '../../src/content/publication';
import { skillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';

const skill = skillCatalog[0];
const item = contentCatalog.find((candidate) => candidate.skillRef.code === skill.code)!;
const programs = [{ code: skill.program, label: 'Synthetic program', available: true }];

describe('public curriculum skill projection', () => {
  it('projects all 67 catalog skills; the 64 non-Science members are unchanged', () => {
    const nonScience = skillCatalog.filter((candidate) => candidate.program !== 'grade-6-science');
    expect(nonScience).toHaveLength(64);
    expect(skillCatalog).toHaveLength(67);
    const projected = publishableSkillProjection(skillCatalog, contentCatalog, PROGRAM_ROSTER);
    expect(projected).toEqual(skillCatalog);
    expect(projected.filter((candidate) => candidate.program !== 'grade-6-science')).toEqual(
      nonScience,
    );
  });

  it('withholds registered, reviewed Science skills when the program is injected as unavailable', () => {
    // Negative control: a synthetic roster with Science unavailable.
    const roster = PROGRAM_ROSTER.map((entry) =>
      entry.code === 'grade-6-science' ? { ...entry, available: false } : entry,
    );
    const projected = publishableSkillProjection(skillCatalog, contentCatalog, roster);
    expect(
      skillCatalog.filter((candidate) => candidate.program === 'grade-6-science'),
    ).toHaveLength(3);
    expect(projected.some((candidate) => candidate.program === 'grade-6-science')).toBe(false);
    const rendered = buildBody(contentCatalog, skillCatalog, roster);
    expect(rendered.body).not.toContain('sci6-cells-evidence-of-life');
    for (const title of [
      'Evidence that living things are made of cells',
      'Roles of cell parts in a cell model',
      'The cell as a system of working parts',
      'Three magnified pictures',
    ]) {
      expect(rendered.body).not.toContain(title);
    }
  });

  it('withholds unavailable programs even when content is reviewed', () => {
    const rendered = buildBody([item], [skill], [{ ...programs[0], available: false }]);
    expect(rendered.body).not.toContain(skill.title);
    expect(rendered.body).toContain('Coming soon');
    expect(rendered.stats).toContain('>0</span><span class="stat-label">Skills');
    expect(rendered.stats).toContain('>0</span><span class="stat-label">Problems');
  });

  it('withholds pending-only skills and their metadata from body, navigation and counts', () => {
    const rendered = buildBody(
      [{ ...item, review: { ...item.review, status: 'pending_review' } }],
      [skill],
      programs,
    );
    for (const privateText of [skill.title, skill.code, skill.masteryCheckRule, item.prompt]) {
      expect(rendered.body).not.toContain(privateText);
    }
    expect(rendered.stats).toContain('>0</span><span class="stat-label">Standards covered');
  });

  it('does not let reviewed older content publish a new skill version', () => {
    expect(publishableSkillProjection([{ ...skill, version: '2.0.0' }], [item], programs)).toEqual(
      [],
    );
    expect(buildBody([item], [{ ...skill, version: '2.0.0' }], programs).body).not.toContain(
      item.prompt,
    );
  });

  it('does not publish a pending prerequisite code through a reviewed skill', () => {
    const hidden = { ...skill, code: 'synthetic-pending-skill', title: 'Hidden draft' };
    const visible = { ...skill, prerequisiteSkillCodes: [hidden.code] };
    const rendered = buildBody([item], [visible, hidden], programs);
    expect(rendered.body).toContain(skill.title);
    expect(rendered.body).toContain('Prerequisite pending publication');
    expect(rendered.body).not.toContain(hidden.code);
    expect(rendered.body).not.toContain(hidden.title);
  });

  it('does not let reviewed assessments publish a skill', () => {
    const assessment = {
      ...item,
      role: 'assessment' as const,
      assessmentBankRef: { code: 'synthetic-bank', version: '1.0.0' },
    };
    expect(publishableSkillProjection([skill], [assessment], programs)).toEqual([]);
  });
});
