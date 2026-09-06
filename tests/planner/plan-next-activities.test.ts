import { describe, expect, it } from 'vitest';

import { PlannerContentItem, PlannerInput, PlannerSkill } from '../../src/contracts';
import { ratioContentCatalog } from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';
import { planNextActivities } from '../../src/planner/plan-next-activities';

const chainSkills: PlannerSkill[] = [
  { code: 'a', prerequisiteSkillCodes: [] },
  { code: 'b', prerequisiteSkillCodes: ['a'] },
  { code: 'c', prerequisiteSkillCodes: ['b'] },
];

const chainContent: PlannerContentItem[] = [
  { id: 'a-1', skillCode: 'a', mode: 'core', difficulty: 'foundational' },
  { id: 'a-2', skillCode: 'a', mode: 'contest', difficulty: 'challenging' },
  { id: 'b-1', skillCode: 'b', mode: 'core', difficulty: 'developing' },
];

function baseInput(overrides: Partial<PlannerInput> = {}): PlannerInput {
  return {
    skills: chainSkills,
    content: chainContent,
    masteryBySkillCode: {},
    timeBudgetMinutes: 60,
    ...overrides,
  };
}

describe('planNextActivities', () => {
  it('plans the first unblocked skill and reports downstream skills as blocked', () => {
    const result = planNextActivities(baseInput());

    expect(result.items.map((item) => item.contentId)).toEqual(['a-1']);
    expect(result.items[0].reason).toContain('Not yet assessed');
    expect(result.blockedSkills).toEqual(['b', 'c']);
    expect(result.unavailableSkills).toEqual([]);
  });

  it('unblocks downstream skills once a prerequisite is secure', () => {
    const result = planNextActivities(
      baseInput({
        masteryBySkillCode: {
          a: { estimate: 0.9, confidenceBand: 'HIGH', independentDelayedCheck: true },
        },
      }),
    );

    expect(result.items.map((item) => item.contentId)).toEqual(['b-1']);
    expect(result.blockedSkills).toEqual(['c']);
  });

  it('adds a challenge item once some mastery evidence exists, within the per-skill cap', () => {
    const result = planNextActivities(
      baseInput({
        masteryBySkillCode: {
          a: { estimate: 0.5, confidenceBand: 'LOW', independentDelayedCheck: false },
        },
      }),
    );

    const aItems = result.items.filter((item) => item.skillCode === 'a');
    expect(aItems.map((item) => item.contentId)).toEqual(['a-1', 'a-2']);
    expect(aItems[0].reason).toContain('developing');
    expect(aItems[1].reason).toContain('Challenge');
  });

  it('caps the plan at the time budget', () => {
    const result = planNextActivities(
      baseInput({
        masteryBySkillCode: {
          a: { estimate: 0.5, confidenceBand: 'LOW', independentDelayedCheck: false },
        },
        timeBudgetMinutes: 8,
      }),
    );

    expect(result.items.map((item) => item.contentId)).toEqual(['a-1']);
    expect(result.totalMinutes).toBe(8);
  });

  it('caps the number of items per skill', () => {
    const manyCoreItems: PlannerContentItem[] = [
      { id: 'a-1', skillCode: 'a', mode: 'core', difficulty: 'foundational' },
      { id: 'a-2', skillCode: 'a', mode: 'core', difficulty: 'developing' },
      { id: 'a-3', skillCode: 'a', mode: 'core', difficulty: 'challenging' },
    ];
    const result = planNextActivities(
      baseInput({ skills: [chainSkills[0]], content: manyCoreItems, timeBudgetMinutes: 1000 }),
    );

    expect(result.items).toHaveLength(2);
  });

  it('reports a skill with no available content as unavailable, not blocked', () => {
    const noContentForB = planNextActivities(
      baseInput({
        content: chainContent.slice(0, 1),
        masteryBySkillCode: {
          a: { estimate: 0.9, confidenceBand: 'HIGH', independentDelayedCheck: true },
        },
      }),
    );
    expect(noContentForB.unavailableSkills).toEqual(['b']);
  });

  it('skips a skill entirely once it is independently confirmed as secure', () => {
    const result = planNextActivities(
      baseInput({
        masteryBySkillCode: {
          a: { estimate: 0.95, confidenceBand: 'HIGH', independentDelayedCheck: true },
          b: { estimate: 0.95, confidenceBand: 'HIGH', independentDelayedCheck: true },
        },
      }),
    );

    expect(result.items).toEqual([]);
    expect(result.blockedSkills).toEqual([]);
  });

  it('plans against the real skill and content catalogs without inventing content', () => {
    const realContent: PlannerContentItem[] = ratioContentCatalog.map((item) => ({
      id: item.id,
      skillCode: item.skillCode,
      mode: item.mode,
      difficulty: item.difficulty,
    }));
    const realSkills: PlannerSkill[] = skillCatalog.map((skill) => ({
      code: skill.code,
      prerequisiteSkillCodes: skill.prerequisiteSkillCodes,
    }));

    const result = planNextActivities({
      skills: realSkills,
      content: realContent,
      masteryBySkillCode: {},
      timeBudgetMinutes: 30,
    });

    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(realContent.some((content) => content.id === item.contentId)).toBe(true);
      expect(item.reason.length).toBeGreaterThan(0);
    }
    expect(result.totalMinutes).toBeLessThanOrEqual(30);
    expect(result.unavailableSkills).toContain('fraction-decimal-operations');
  });
});
