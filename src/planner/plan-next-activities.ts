import { PlanResult, PlannedActivity, PlannerContentItem, PlannerInput } from '../contracts';
import { topologicalOrder } from '../curriculum/topological-sort';

const DEFAULT_ESTIMATED_MINUTES_PER_ITEM = 8;
const DEFAULT_MAX_ITEMS_PER_SKILL = 2;
const DEFAULT_SECURE_THRESHOLD = 0.75;

export function planNextActivities(input: PlannerInput): PlanResult {
  const estimatedMinutesPerItem =
    input.estimatedMinutesPerItem ?? DEFAULT_ESTIMATED_MINUTES_PER_ITEM;
  const maxItemsPerSkill = input.maxItemsPerSkill ?? DEFAULT_MAX_ITEMS_PER_SKILL;
  const secureThreshold = input.secureThreshold ?? DEFAULT_SECURE_THRESHOLD;

  const skillByCode = new Map(input.skills.map((skill) => [skill.code, skill]));
  const order = topologicalOrder(
    input.skills.map((skill) => skill.code),
    (code) => skillByCode.get(code)?.prerequisiteSkillCodes ?? [],
  );

  const metSkillCodes = new Set(
    Object.entries(input.masteryBySkillCode)
      .filter(([, mastery]) => (mastery?.estimate ?? 0) >= secureThreshold)
      .map(([skillCode]) => skillCode),
  );

  const contentBySkill = new Map<string, PlannerContentItem[]>();
  for (const item of input.content) {
    const items = contentBySkill.get(item.skillCode) ?? [];
    items.push(item);
    contentBySkill.set(item.skillCode, items);
  }

  const items: PlannedActivity[] = [];
  const blockedSkills: string[] = [];
  const unavailableSkills: string[] = [];
  let totalMinutes = 0;

  for (const skillCode of order) {
    const skill = skillByCode.get(skillCode);
    if (!skill) continue;

    const mastery = input.masteryBySkillCode[skillCode];
    const isSecure =
      (mastery?.estimate ?? 0) >= secureThreshold && mastery?.independentDelayedCheck === true;
    if (isSecure) continue;

    const prerequisitesMet = skill.prerequisiteSkillCodes.every((code) => metSkillCodes.has(code));
    if (!prerequisitesMet) {
      blockedSkills.push(skillCode);
      continue;
    }

    const available = contentBySkill.get(skillCode) ?? [];
    if (available.length === 0) {
      unavailableSkills.push(skillCode);
      continue;
    }

    const corePicks = available.filter((item) => item.mode === 'core');
    const primaryPool = corePicks.length > 0 ? corePicks : available;
    const challengePicks =
      corePicks.length > 0 ? available.filter((item) => item.mode !== 'core') : [];

    const picks: { item: PlannerContentItem; reason: string }[] = [];
    for (const item of primaryPool) {
      if (picks.length >= maxItemsPerSkill) break;
      picks.push({
        item,
        reason: mastery
          ? 'Independent mastery is still developing; more practice is recommended.'
          : 'Not yet assessed and all prerequisites are met.',
      });
    }
    if (mastery !== undefined && picks.length < maxItemsPerSkill && challengePicks.length > 0) {
      picks.push({
        item: challengePicks[0],
        reason:
          'Challenge activity: some mastery evidence exists, but it is not yet independently confirmed.',
      });
    }

    for (const { item, reason } of picks) {
      if (totalMinutes + estimatedMinutesPerItem > input.timeBudgetMinutes) {
        break;
      }
      items.push({
        contentId: item.id,
        skillCode,
        mode: item.mode,
        reason,
        estimatedMinutes: estimatedMinutesPerItem,
      });
      totalMinutes += estimatedMinutesPerItem;
    }
  }

  return { items, totalMinutes, blockedSkills, unavailableSkills };
}
