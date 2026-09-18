import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { SkillSchema } from '../../src/contracts/curriculum';
import {
  arePrerequisitesMet,
  skillCatalog,
  topologicalSkillOrder,
  validateSkillCatalog,
} from '../../src/curriculum/catalog';

describe('skill catalog', () => {
  it('covers all five Grade 6 Math domains with unique codes', () => {
    const grade6MathSkills = skillCatalog.filter((skill) => skill.program === 'grade-6-math');
    expect(grade6MathSkills.length).toBe(27);
    expect(new Set(grade6MathSkills.map((skill) => skill.code)).size).toBe(27);
    expect(new Set(grade6MathSkills.map((skill) => skill.domain))).toEqual(
      new Set([
        'ratios-and-proportional-reasoning',
        'number-system',
        'expressions-and-equations',
        'geometry',
        'statistics',
      ]),
    );
  });

  it('covers all four Math Kangaroo Grade 6 domains with unique, namespaced codes', () => {
    const mathKangarooSkills = skillCatalog.filter((skill) => skill.program === 'math-kangaroo-6');
    expect(mathKangarooSkills.length).toBe(8);
    expect(mathKangarooSkills.every((skill) => skill.code.startsWith('mk6-'))).toBe(true);
    expect(new Set(mathKangarooSkills.map((skill) => skill.code)).size).toBe(8);
    expect(new Set(mathKangarooSkills.map((skill) => skill.domain))).toEqual(
      new Set([
        'mk6-arithmetic-and-patterns',
        'mk6-geometry-and-spatial-reasoning',
        'mk6-logical-reasoning',
        'mk6-combinatorics',
      ]),
    );
  });

  it('covers the initial MOEMS Division E graph with namespaced codes', () => {
    const moemsSkills = skillCatalog.filter((skill) => skill.program === 'moems-6');
    expect(moemsSkills).toHaveLength(5);
    expect(moemsSkills.every((skill) => skill.code.startsWith('moems6-'))).toBe(true);
    expect(new Set(moemsSkills.map((skill) => skill.domain))).toEqual(
      new Set([
        'moems6-number-and-arithmetic',
        'moems6-patterns-and-counting',
        'moems6-geometry-and-measurement',
        'moems6-logic-and-arrangements',
      ]),
    );
  });

  it('renders available authored programs in the curriculum site', () => {
    execFileSync('npm', ['run', 'curriculum:site'], { stdio: 'ignore' });
    const generatedSite = readFileSync('dist/curriculum-site/index.html', 'utf8');

    expect(generatedSite).toContain('Math Kangaroo (Grade 6)');
    expect(generatedSite).toContain('Multi-step arithmetic reasoning');
    expect(generatedSite).toContain('MOEMS Division E (Grade 6)');
    const mathKangarooSection = generatedSite.match(
      /<section class="program-section" id="program-math-kangaroo-6">([\s\S]*?)<section class="program-section" id="program-moems-6">/,
    );
    expect(mathKangarooSection?.[1]).not.toContain('Coming soon');
    expect(mathKangarooSection?.[1]).not.toContain('Draft — pending human approval');
  });

  it('keeps pending MOEMS content out of the available curriculum section', () => {
    execFileSync('npm', ['run', 'curriculum:site'], { stdio: 'ignore' });
    const generatedSite = readFileSync('dist/curriculum-site/index.html', 'utf8');
    const moemsSection = generatedSite.match(
      /<section class="program-section" id="program-moems-6">([\s\S]*?)<section class="program-section program-section-empty" id="program-amc-8">/,
    );
    expect(moemsSection?.[1]).toContain('Draft — pending human approval');
    expect(moemsSection?.[1]).toContain('Two-digit lock code');
  });

  it('renders accessible collapsible domains and skills', () => {
    execFileSync('npm', ['run', 'curriculum:site'], { stdio: 'ignore' });
    const generatedSite = readFileSync('dist/curriculum-site/index.html', 'utf8');

    expect(generatedSite).toContain(
      '<details class="domain-section" id="domain-mk6-geometry-and-spatial-reasoning" open>',
    );
    expect(generatedSite).toContain('<details class="skill-details">');
    expect(generatedSite).toContain('<summary class="skill-header">');
    expect(generatedSite).toContain('function expandHashTarget()');
  });

  it('renders collapsible program and domain groups in the sidebar', () => {
    execFileSync('npm', ['run', 'curriculum:site'], { stdio: 'ignore' });
    const generatedSite = readFileSync('dist/curriculum-site/index.html', 'utf8');

    expect(generatedSite).toContain('<li class="nav-program">');
    expect(generatedSite).toContain('<summary>Math Kangaroo (Grade 6)');
    expect(generatedSite).toContain('<li class="nav-domain">');
    expect(generatedSite).toContain('<summary>Geometry &amp; Spatial Reasoning</summary>');
    expect(generatedSite).toContain(
      "document.querySelector('.sidebar a[href=\"' + location.hash + '\"]')",
    );
  });

  it('renders answer-redacted curriculum figures with text alternatives', () => {
    execFileSync('npm', ['run', 'curriculum:site'], { stdio: 'ignore' });
    const generatedSite = readFileSync('dist/curriculum-site/index.html', 'utf8');

    expect(generatedSite).toContain('<figure class="content-figure">');
    expect(generatedSite).toContain('A triangle rests on a horizontal line');
    expect(generatedSite).toContain('data:image/svg+xml;charset=utf-8,');
    expect(generatedSite).not.toContain('Third triangle angle =');
  });

  it('has no duplicate skill codes across the whole multi-program catalog', () => {
    expect(new Set(skillCatalog.map((skill) => skill.code)).size).toBe(skillCatalog.length);
  });

  it('references only prerequisite codes that exist in the catalog', () => {
    for (const skill of skillCatalog) {
      for (const prerequisite of skill.prerequisiteSkillCodes) {
        expect(skillCatalog.some((candidate) => candidate.code === prerequisite)).toBe(true);
      }
    }
  });

  it('rejects an unknown prerequisite reference', () => {
    const withUnknownPrerequisite = skillCatalog.map((skill) =>
      skill.code === 'unit-rates'
        ? { ...skill, prerequisiteSkillCodes: ['does-not-exist'] }
        : skill,
    );
    expect(() => validateSkillCatalog(withUnknownPrerequisite)).toThrow('unknown prerequisite');
  });

  it('rejects a prerequisite cycle', () => {
    const withCycle = skillCatalog.map((skill) => {
      if (skill.code === 'ratio-language') {
        return { ...skill, prerequisiteSkillCodes: ['unit-rates'] };
      }
      return skill;
    });
    expect(() => validateSkillCatalog(withCycle)).toThrow('cycle');
  });

  it('rejects a skill that lists itself as a prerequisite', () => {
    const selfReferencing = {
      ...skillCatalog[0],
      prerequisiteSkillCodes: [skillCatalog[0].code],
    };
    expect(SkillSchema.safeParse(selfReferencing).success).toBe(false);
  });

  it('orders prerequisites before the skills that depend on them', () => {
    const order = topologicalSkillOrder(skillCatalog);
    const indexOf = (code: string) => order.indexOf(code);
    expect(indexOf('ratio-language')).toBeLessThan(indexOf('unit-rates'));
    expect(indexOf('coordinate-plane')).toBeLessThan(indexOf('coordinate-geometry'));
    expect(indexOf('statistical-questions')).toBeLessThan(indexOf('distributions'));
    expect(indexOf('distributions')).toBeLessThan(indexOf('center-and-variability'));
  });

  it('reports whether a skill prerequisites are met from a set of mastered skill codes', () => {
    expect(arePrerequisitesMet('ratio-language', new Set())).toBe(true);
    expect(arePrerequisitesMet('unit-rates', new Set())).toBe(false);
    expect(arePrerequisitesMet('unit-rates', new Set(['ratio-language']))).toBe(true);
    expect(() => arePrerequisitesMet('not-a-real-skill', new Set())).toThrow('Unknown skill code');
  });
});
