import { CurriculumDomainSchema } from '../contracts/curriculum';
import { arePrerequisitesMet } from '../curriculum/catalog';

export type SkillProgress = {
  skillCode: string;
  title: string;
  domain: string;
  status: 'NOT_STARTED' | 'PRACTICING' | 'INDEPENDENTLY_CONFIRMED';
  summary: string;
};
export type RecentStrength = {
  attemptId: string;
  skillCode: string;
  skillTitle: string;
  achievedAt: string;
};
export type NextActivity = {
  contentId: string;
  title: string;
  skillTitle: string;
  reason: string;
};
export type LearnerProgress = {
  skills: SkillProgress[];
  recentStrengths: RecentStrength[];
  nextActivity: NextActivity | null;
};

export type DiagnosticItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
};
export type DiagnosticPlan = { items: DiagnosticItem[] };

export type ReviewItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
  dueSince: string;
};
export type ReviewQueue = { items: ReviewItem[] };

export type PlanItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
  reason: string;
  estimatedMinutes: number;
};
export type Plan = {
  items: PlanItem[];
  totalMinutes: number;
  blockedSkills: string[];
  unavailableSkills: string[];
};

export type ChapterItemAction = {
  contentId: string;
  kind: 'diagnostic' | 'review' | 'practice';
  label: string;
};

// Server-derived planner readiness (advisory, not authority): 'blocked' and
// 'unavailable' come from the plan's own lists; 'unknown' means no plan has
// loaded, so nothing is claimed either way.
export type ItemAvailability = 'offered' | 'blocked' | 'unavailable' | 'unknown';

export type ChapterItem = {
  skillCode: string;
  title: string;
  status: SkillProgress['status'];
  locked: boolean;
  availability: ItemAvailability;
  action?: ChapterItemAction;
};

export type Chapter = {
  domain: string;
  label: string;
  order: number;
  confirmedCount: number;
  practicingCount: number;
  totalCount: number;
  items: ChapterItem[];
};

// Display-only labels. A domain missing here still renders (falls back to a
// humanized version of its code) so an unlabeled new program/domain never
// breaks the page - see docs/learner-presentation-design.md for the
// onboarding checklist that keeps this map current.
const CHAPTER_LABELS: Record<string, string> = {
  'ratios-and-proportional-reasoning': 'Ratios & Proportional Reasoning',
  'number-system': 'The Number System',
  'expressions-and-equations': 'Expressions & Equations',
  geometry: 'Geometry',
  statistics: 'Statistics & Probability',
  'mk6-arithmetic-and-patterns': 'Arithmetic & Patterns',
  'mk6-geometry-and-spatial-reasoning': 'Geometry & Spatial Reasoning',
  'mk6-logical-reasoning': 'Logical Reasoning',
  'mk6-combinatorics': 'Combinatorics',
  'moems6-number-and-arithmetic': 'Number & Arithmetic',
  'moems6-patterns-and-counting': 'Patterns & Counting',
  'moems6-geometry-and-measurement': 'Geometry & Measurement',
  'moems6-logic-and-arrangements': 'Logic & Arrangements',
  'amc8-counting-and-probability': 'Counting & Probability',
  'amc8-number-and-ratio-reasoning': 'Number & Ratio Reasoning',
  'amc8-geometry-and-visualization': 'Geometry & Visualization',
  'amc8-data-and-algebra': 'Data & Algebra',
  'mc6-number-and-proportional-reasoning': 'Number & Proportional Reasoning',
  'mc6-algebra-and-patterns': 'Algebra & Patterns',
  'mc6-geometry-and-measurement': 'Geometry & Measurement',
  'mc6-counting-probability-and-logic': 'Counting, Probability & Logic',
  'snsb6-orthography': 'Orthography',
  'snsb6-morphology': 'Morphology',
  'snsb6-etymology': 'Etymology',
  'snsb6-phonology': 'Phonology',
  'snsb6-vocabulary': 'Vocabulary',
  'snsb6-variants': 'Variants & Dictionary Judgment',
  'snsb6-procedure': 'Oral Round Procedure',
};

// The curriculum's own declared domain order doubles as the default chapter
// order, so a new domain only has to be added in one place
// (CurriculumDomainSchema) to get a sensible position here too.
const DOMAIN_ORDER: readonly string[] = CurriculumDomainSchema.options;

function humanizeDomain(domain: string): string {
  return domain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function chapterLabel(domain: string): string {
  return CHAPTER_LABELS[domain] ?? humanizeDomain(domain);
}

function chapterOrder(domain: string): number {
  const index = DOMAIN_ORDER.indexOf(domain);
  return index === -1 ? DOMAIN_ORDER.length : index;
}

/**
 * Resolves, for each skill, the next actionable content item if one exists.
 * Priority is diagnostic (placement) > review (time-sensitive) > practice,
 * since a placement or review probe is more time-critical than open-ended
 * practice on the same skill.
 */
function buildActionBySkillCode(
  plan: Plan | undefined,
  diagnosticPlan: DiagnosticPlan | undefined,
  reviewQueue: ReviewQueue | undefined,
): Map<string, ChapterItemAction> {
  const actions = new Map<string, ChapterItemAction>();
  for (const item of plan?.items ?? []) {
    actions.set(item.skillCode, {
      contentId: item.contentId,
      kind: 'practice',
      label: item.title,
    });
  }
  for (const item of reviewQueue?.items ?? []) {
    actions.set(item.skillCode, {
      contentId: item.contentId,
      kind: 'review',
      label: item.title,
    });
  }
  for (const item of diagnosticPlan?.items ?? []) {
    actions.set(item.skillCode, {
      contentId: item.contentId,
      kind: 'diagnostic',
      label: item.title,
    });
  }
  return actions;
}

export function buildChapters(
  progress: LearnerProgress | undefined,
  plan: Plan | undefined,
  diagnosticPlan: DiagnosticPlan | undefined,
  reviewQueue: ReviewQueue | undefined,
): Chapter[] {
  if (!progress) return [];

  const confirmedSkillCodes = new Set(
    progress.skills
      .filter((skill) => skill.status === 'INDEPENDENTLY_CONFIRMED')
      .map((skill) => skill.skillCode),
  );
  const actionBySkillCode = buildActionBySkillCode(plan, diagnosticPlan, reviewQueue);
  const blockedSkillCodes = new Set(plan?.blockedSkills);
  const unavailableSkillCodes = new Set(plan?.unavailableSkills);

  const itemsByDomain = new Map<string, ChapterItem[]>();
  for (const skill of progress.skills) {
    const item: ChapterItem = {
      skillCode: skill.skillCode,
      title: skill.title,
      status: skill.status,
      locked: !arePrerequisitesMet(skill.skillCode, confirmedSkillCodes),
      availability: !plan
        ? 'unknown'
        : blockedSkillCodes.has(skill.skillCode)
          ? 'blocked'
          : unavailableSkillCodes.has(skill.skillCode)
            ? 'unavailable'
            : 'offered',
      action: actionBySkillCode.get(skill.skillCode),
    };
    const existing = itemsByDomain.get(skill.domain);
    if (existing) existing.push(item);
    else itemsByDomain.set(skill.domain, [item]);
  }

  const chapters: Chapter[] = [];
  for (const [domain, items] of itemsByDomain) {
    chapters.push({
      domain,
      label: chapterLabel(domain),
      order: chapterOrder(domain),
      confirmedCount: items.filter((item) => item.status === 'INDEPENDENTLY_CONFIRMED').length,
      practicingCount: items.filter((item) => item.status === 'PRACTICING').length,
      totalCount: items.length,
      items,
    });
  }
  chapters.sort((a, b) => a.order - b.order);
  return chapters;
}

export function nextChapterDomain(chapters: Chapter[], currentDomain: string): string | undefined {
  const index = chapters.findIndex((chapter) => chapter.domain === currentDomain);
  if (index === -1) return undefined;
  return chapters[index + 1]?.domain;
}

/** Finds which chapter a given skill belongs to, e.g. to focus the chapter
 * containing whatever activity is currently loaded. */
export function chapterForSkill(chapters: Chapter[], skillCode: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.items.some((item) => item.skillCode === skillCode));
}

export type TopicStatusText = {
  practice: string;
  mastery: string;
  attempts: string;
  availability: string | null;
};

/**
 * Plain-language, truthful status lines for a topic. Practice evidence and
 * independent confirmation are separate measures; "confirmed" is only ever
 * said for server-confirmed status. Attempt counts and lock reasons are not
 * part of the progress or plan responses, so they are reported as not
 * available rather than inferred.
 */
export function describeTopicStatus(item: ChapterItem): TopicStatusText {
  const confirmed = item.status === 'INDEPENDENTLY_CONFIRMED';
  return {
    practice:
      item.status === 'NOT_STARTED'
        ? 'No practice evidence recorded yet'
        : 'Practice evidence recorded',
    mastery: confirmed ? 'Independently confirmed' : 'Not yet independently confirmed',
    attempts: 'Number of attempts is not reported in this view',
    availability:
      item.availability === 'blocked'
        ? 'Not offered yet. The course plan lists this topic as blocked; no further reason is available in this view.'
        : item.availability === 'unavailable'
          ? 'No activity is offered for this topic yet.'
          : item.availability === 'unknown'
            ? 'Availability is unknown because the course plan has not loaded.'
            : null,
  };
}

/** A topic can be opened from the overview or a deep link only when the
 * server's plan has loaded and does not list it as blocked or unavailable. */
export function isTopicOpenable(item: ChapterItem): boolean {
  return item.availability === 'offered';
}
