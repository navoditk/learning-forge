import {
  PlanResult,
  PlannedActivity,
  PlannerContentItem,
  PlannerContestReadinessRequirement,
  PlannerInput,
  PlannerMasteryRecord,
} from '../contracts';
import { topologicalOrder } from '../curriculum/topological-sort';

const DEFAULT_ESTIMATED_MINUTES_PER_ITEM = 8;
const DEFAULT_MAX_ITEMS_PER_SKILL = 2;
const DEFAULT_SECURE_THRESHOLD = 0.75;

/**
 * Evaluates the structured, documented core-secure evidence contract for a
 * single gated contest item (see `PlannerContestReadinessRequirement`).
 * Row existence alone is never sufficient: this requires the estimate to
 * clear the documented threshold, a non-LOW confidence band (when the
 * requirement disallows one), and an independent delayed check (when
 * required).
 */
function meetsContestReadiness(
  mastery: PlannerMasteryRecord | undefined,
  requirement: PlannerContestReadinessRequirement,
): boolean {
  if (!mastery) return false;
  if (mastery.estimate < requirement.minEstimate) return false;
  if (requirement.disallowLowConfidence && mastery.confidenceBand === 'LOW') return false;
  if (requirement.requireIndependentDelayedCheck && !mastery.independentDelayedCheck) return false;
  return true;
}

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
    const available = contentBySkill.get(skillCode) ?? [];

    // Content items that carry an explicit, documented contest-readiness
    // contract (see `PlannerContestReadinessRequirement`) must clear that
    // evidence bar before they can ever be planned. This is a per-item
    // contract field set by content authors, not a skill-code heuristic:
    // any program's contest content can opt into it the same way.
    const gatedContestItems = available.filter(
      (item) => item.mode !== 'core' && item.contestReadinessRequirement,
    );
    const eligibleGatedContestItems = gatedContestItems.filter((item) =>
      meetsContestReadiness(mastery, item.contestReadinessRequirement!),
    );
    const usesStructuredContestGate = gatedContestItems.length > 0;

    const isSecure =
      (mastery?.estimate ?? 0) >= secureThreshold && mastery?.independentDelayedCheck === true;

    if (!usesStructuredContestGate && isSecure) {
      // Legacy behavior, preserved for content without a structured
      // per-item contest contract (Grade 6 Math, Math Kangaroo, MOEMS): a
      // fully secure skill needs no further practice at all.
      continue;
    }

    const prerequisitesMet = skill.prerequisiteSkillCodes.every((code) => metSkillCodes.has(code));
    if (!prerequisitesMet) {
      blockedSkills.push(skillCode);
      continue;
    }

    if (available.length === 0) {
      unavailableSkills.push(skillCode);
      continue;
    }

    const corePicks = available.filter((item) => item.mode === 'core');
    const picks: { item: PlannerContentItem; reason: string }[] = [];

    if (usesStructuredContestGate) {
      if (eligibleGatedContestItems.length > 0) {
        // Documented core-secure evidence has been met for this skill:
        // recommend the eligible contest activity and stop re-recommending
        // core so eligibility isn't treated as a reason to keep repeating
        // core prep indefinitely. Contest access begins only here.
        for (const item of eligibleGatedContestItems) {
          if (picks.length >= maxItemsPerSkill) break;
          picks.push({
            item,
            reason:
              'Documented core-prep evidence (estimate, confidence, and an independent delayed check) supports a contest-tier challenge.',
          });
        }
      } else {
        // Not yet eligible: core prep stays available regardless of the
        // legacy "secure" flag. Non-gated challenge content, if any, is
        // intentionally withheld here too, since the whole point of the
        // structured gate is that contest-tier work is unlocked only by
        // documented eligibility.
        for (const item of corePicks) {
          if (picks.length >= maxItemsPerSkill) break;
          picks.push({
            item,
            reason: mastery
              ? 'Independent mastery is still developing; more practice is recommended.'
              : 'Not yet assessed and all prerequisites are met.',
          });
        }
      }
    } else {
      // Legacy generic behavior, unchanged for content without a
      // structured contest contract.
      const primaryPool = corePicks.length > 0 ? corePicks : available;
      const challengePicks =
        corePicks.length > 0 ? available.filter((item) => item.mode !== 'core') : [];

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
