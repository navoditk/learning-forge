import type { Prisma, PrismaClient } from '@prisma/client';

import type { ProgressionPolicyProfile } from '../contracts/policy';
import type { AssessmentBank, Ref } from '../contracts/progression';
import { contentCatalog, contentSkillCode } from '../content/catalog';
import { PILOT_ASSESSMENT_BANKS, PILOT_LESSONS } from '../curriculum/pilot-catalog';
import { delayedCheckEligibility } from './delay-window';
import type { ExposureEvent } from './exposure';

export type SkillAssessmentKind = 'DELAYED_CHECK' | 'REVIEW';

type Database = PrismaClient | Prisma.TransactionClient;

/** Pilot skills an authored lesson claims, at the version the lesson pins. */
export function pilotSkillRef(skillCode: string, skillVersion: string): Ref | undefined {
  return PILOT_LESSONS.flatMap((lesson) => lesson.skillRefs).find(
    (ref) => ref.code === skillCode && ref.version === skillVersion,
  );
}

/** Dedicated held-out bank metadata for a skill-targeted assessment (D-50, D-63). */
export function skillAssessmentBank(
  kind: SkillAssessmentKind,
  skillRef: Ref,
): AssessmentBank | undefined {
  const suffix = kind === 'DELAYED_CHECK' ? 'delayed-check-bank' : 'review-bank';
  return PILOT_ASSESSMENT_BANKS.find(
    (bank) =>
      bank.code === `${skillRef.code}-${suffix}` &&
      bank.targetRef.code === skillRef.code &&
      bank.targetRef.version === skillRef.version,
  );
}

function contentIdsForSkill(skillCode: string): string[] {
  return contentCatalog
    .filter((item) => contentSkillCode(item) === skillCode)
    .map((item) => item.id);
}

/**
 * Exposure events for one learner and skill, derived only from persisted
 * server events (§9.1): learning events, every attempt on the skill's content
 * in any context (practice, same-sitting check, diagnostic, review, or
 * assessment), non-independent assistance, and tutor moves and traces on the
 * skill's attempts and sessions. Any of these resets the delay window; a
 * source missing here would make a learner eligible too early.
 */
export async function loadSkillExposureEvents(
  database: Database,
  learnerProfileId: string,
  skillCode: string,
): Promise<ExposureEvent[]> {
  const contentIds = contentIdsForSkill(skillCode);
  const [learningEvents, attempts, assistanceEvents, tutorMoves, sessions] = await Promise.all([
    database.learningEvent.findMany({
      where: { learnerProfileId, skillCode },
      select: { kind: true, occurredAt: true },
    }),
    database.attempt.findMany({
      where: { learnerProfileId, contentKey: { in: contentIds } },
      select: { createdAt: true },
    }),
    database.assistanceEvent.findMany({
      where: {
        level: { not: 'INDEPENDENT' },
        attempt: { learnerProfileId, contentKey: { in: contentIds } },
      },
      select: { occurredAt: true },
    }),
    database.tutorInteraction.findMany({
      where: { learnerProfileId, attempt: { contentKey: { in: contentIds } } },
      select: { createdAt: true },
    }),
    database.session.findMany({
      where: { learnerProfileId, contentKey: { in: contentIds } },
      select: { id: true },
    }),
  ]);
  const traces = sessions.length
    ? await database.tutorTrace.findMany({
        where: { learnerProfileId, sessionId: { in: sessions.map(({ id }) => id) } },
        select: { createdAt: true },
      })
    : [];
  const assisted = (occurredAt: Date) => ({
    skillCode,
    kind: 'ASSISTANCE_GIVEN' as const,
    occurredAt,
  });
  return [
    ...learningEvents.map(({ kind, occurredAt }) => ({ skillCode, kind, occurredAt })),
    ...attempts.map(({ createdAt }) => ({
      skillCode,
      kind: 'INDEPENDENT_PRACTICE_EXPOSURE' as const,
      occurredAt: createdAt,
    })),
    ...assistanceEvents.map(({ occurredAt }) => assisted(occurredAt)),
    ...tutorMoves.map(({ createdAt }) => assisted(createdAt)),
    ...traces.map(({ createdAt }) => assisted(createdAt)),
  ];
}

/**
 * Item keys from this learner's earlier assignments of this kind on the skill.
 * `mostRecent` limits the lookback to that many assignments.
 */
async function previouslySelectedItemKeys(
  database: Database,
  learnerProfileId: string,
  kind: SkillAssessmentKind,
  skillRef: Ref,
  mostRecent?: number,
): Promise<Set<string>> {
  const previous = await database.assessmentAssignment.findMany({
    where: {
      learnerProfileId,
      kind,
      targetKind: 'SKILL',
      targetCode: skillRef.code,
      targetVersion: skillRef.version,
    },
    orderBy: { createdAt: 'desc' },
    take: mostRecent,
    select: { selectedItems: true },
  });
  const keys = new Set<string>();
  for (const { selectedItems } of previous) {
    if (!Array.isArray(selectedItems)) continue;
    for (const value of selectedItems) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;
      const item = value as Prisma.JsonObject;
      if (typeof item.id === 'string' && typeof item.version === 'string') {
        keys.add(`${item.id}@${item.version}`);
      }
    }
  }
  return keys;
}

export type SkillAssessmentEligibility =
  | { eligible: true; excludedItemKeys: Set<string> }
  | {
      eligible: false;
      reasonCode:
        | 'NO_PRIOR_EXPOSURE'
        | 'LOCKED_DELAY_WINDOW'
        | 'ALREADY_CONFIRMED'
        | 'REVIEW_NOT_DUE'
        | 'REVIEW_LAPSED_REMEDIATION';
    };

/**
 * Server-side eligibility for a skill-targeted assessment. A delayed check
 * needs a defined exposure at least `minDelayHours` old (D-21, §9.2) and is
 * refused once the skill is confirmed and not lapsed. A review needs a due,
 * non-lapsed schedule. With reuse disabled (D-44) every item previously
 * assigned for this skill and kind is excluded; with reuse enabled, items from
 * the last `minIntervalsSinceSeen` runs are (D-46 as specified by D-67).
 */
export async function skillAssessmentEligibility(
  database: Database,
  input: {
    learnerProfileId: string;
    kind: SkillAssessmentKind;
    skillRef: Ref;
    profile: ProgressionPolicyProfile;
    now: Date;
  },
): Promise<SkillAssessmentEligibility> {
  const schedule = await database.reviewSchedule.findUnique({
    where: {
      learnerProfileId_skillCode_skillVersion: {
        learnerProfileId: input.learnerProfileId,
        skillCode: input.skillRef.code,
        skillVersion: input.skillRef.version,
      },
    },
    select: { dueAt: true, lastOutcome: true },
  });
  if (input.kind === 'DELAYED_CHECK') {
    // A confirmed skill is maintained by review; only a lapse reopens the
    // delayed check, which is then the reassessment that clears remediation.
    if (schedule && schedule.lastOutcome !== 'LAPSED') {
      return { eligible: false, reasonCode: 'ALREADY_CONFIRMED' };
    }
    const events = await loadSkillExposureEvents(
      database,
      input.learnerProfileId,
      input.skillRef.code,
    );
    const eligibility = delayedCheckEligibility(
      events,
      input.skillRef.code,
      input.now,
      input.profile.minDelayHours,
    );
    if (!eligibility.eligible) {
      return {
        eligible: false,
        reasonCode:
          eligibility.reasonCode === 'NO_PRIOR_EXPOSURE'
            ? 'NO_PRIOR_EXPOSURE'
            : 'LOCKED_DELAY_WINDOW',
      };
    }
  } else {
    // A lapsed skill routes to remediation (§6.8); review resumes only after a
    // passing delayed check re-confirms it.
    if (schedule?.lastOutcome === 'LAPSED') {
      return { eligible: false, reasonCode: 'REVIEW_LAPSED_REMEDIATION' };
    }
    if (!schedule || schedule.dueAt > input.now) {
      return { eligible: false, reasonCode: 'REVIEW_NOT_DUE' };
    }
  }
  const reuse =
    input.kind === 'DELAYED_CHECK' ? input.profile.delayedCheckReuse : input.profile.reviewReuse;
  return {
    eligible: true,
    excludedItemKeys: await previouslySelectedItemKeys(
      database,
      input.learnerProfileId,
      input.kind,
      input.skillRef,
      reuse.enabled ? reuse.minIntervalsSinceSeen : undefined,
    ),
  };
}

/**
 * Reassessment limits (D-27, D-28) for an assignment kind. A review is governed
 * by its schedule and lapse routing instead, so it carries none.
 */
export function reassessmentLimitsFor(
  kind: 'PLACEMENT' | 'LESSON_ASSESSMENT' | 'UNIT_ASSESSMENT' | 'DELAYED_CHECK' | 'REVIEW',
  profile: Pick<ProgressionPolicyProfile, 'maxReassessments' | 'reassessmentCooldownHours'>,
): { maxReassessments?: number; reassessmentCooldownHours?: number } {
  return kind === 'REVIEW'
    ? {}
    : {
        maxReassessments: profile.maxReassessments,
        reassessmentCooldownHours: profile.reassessmentCooldownHours,
      };
}
