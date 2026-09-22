import { describe, expect, it } from 'vitest';

import { contentSkillCode, contentCatalog } from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';
import { programsByCode } from '../../src/curriculum/program-registry';

describe('cross-program progression fixtures', () => {
  it.each([
    ['math-kangaroo-6', 'mk6-'],
    ['moems-6', 'moems6-'],
    ['amc-8', 'amc8-'],
    ['mathcounts-6', 'mc6-'],
  ] as const)('keeps %s skills and content program-scoped', (program, prefix) => {
    expect(programsByCode.get(program)?.available).toBe(true);
    const skills = skillCatalog.filter((skill) => skill.program === program);
    const content = contentCatalog.filter((item) =>
      skills.some((skill) => skill.code === contentSkillCode(item)),
    );
    expect(skills.length).toBeGreaterThan(0);
    expect(content.length).toBeGreaterThan(0);
    expect(skills.every((skill) => skill.code.startsWith(prefix))).toBe(true);
    expect(content.every((item) => contentSkillCode(item).startsWith(prefix))).toBe(true);
  });
});
