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
    expect(skillCatalog.length).toBe(19);
    expect(new Set(skillCatalog.map((skill) => skill.code)).size).toBe(19);
    expect(new Set(skillCatalog.map((skill) => skill.domain))).toEqual(
      new Set([
        'ratios-and-proportional-reasoning',
        'number-system',
        'expressions-and-equations',
        'geometry',
        'statistics',
      ]),
    );
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
