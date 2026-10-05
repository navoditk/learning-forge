import { describe, expect, it } from 'vitest';

import {
  buildChapters,
  chapterForSkill,
  nextChapterDomain,
  type LearnerProgress,
} from '../../src/app/learner-chapters';

const progress: LearnerProgress = {
  skills: [
    {
      skillCode: 'ratio-language',
      title: 'Ratio language',
      domain: 'ratios-and-proportional-reasoning',
      status: 'INDEPENDENTLY_CONFIRMED',
      summary: 'Confirmed.',
    },
    {
      skillCode: 'unit-rates',
      title: 'Unit rates',
      domain: 'ratios-and-proportional-reasoning',
      status: 'PRACTICING',
      summary: 'Practicing.',
    },
    {
      skillCode: 'ratio-tables',
      title: 'Ratio tables',
      domain: 'ratios-and-proportional-reasoning',
      // Depends on ratio-language and unit-rates in the real catalog; both
      // are at least started here, so this exercises the "not yet
      // confirmed, not locked" path rather than a real lock.
      status: 'NOT_STARTED',
      summary: 'Not started.',
    },
    {
      skillCode: 'gcf-and-lcm',
      title: 'GCF and LCM',
      domain: 'number-system',
      status: 'NOT_STARTED',
      summary: 'Not started.',
    },
  ],
  recentStrengths: [],
  nextActivity: {
    contentId: 'unit-rates-1',
    title: 'Bicycle pace',
    skillTitle: 'Unit rates',
    reason: 'Due for practice.',
  },
};

const plan = {
  items: [
    {
      contentId: 'unit-rates-1',
      skillCode: 'unit-rates',
      title: 'Bicycle pace',
      skillTitle: 'Unit rates',
      reason: 'Due for practice.',
      estimatedMinutes: 5,
    },
  ],
  totalMinutes: 5,
  blockedSkills: [],
  unavailableSkills: [],
};

const diagnosticPlan = {
  items: [
    {
      contentId: 'gcf-and-lcm-1',
      skillCode: 'gcf-and-lcm',
      title: 'Locker numbers',
      skillTitle: 'GCF and LCM',
    },
  ],
};

const reviewQueue = { items: [] };

describe('buildChapters', () => {
  it('groups skills by domain, counts confirmed skills, and orders chapters by curriculum domain order', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);

    expect(chapters.map((chapter) => chapter.domain)).toEqual([
      'ratios-and-proportional-reasoning',
      'number-system',
    ]);
    const ratios = chapters[0];
    expect(ratios.label).toBe('Ratios & Proportional Reasoning');
    expect(ratios.totalCount).toBe(3);
    expect(ratios.confirmedCount).toBe(1);
  });

  it('resolves an actionable item from plan, review, or diagnostic data, diagnostic taking priority', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    const unitRates = chapters[0].items.find((item) => item.skillCode === 'unit-rates');
    const gcf = chapters[1].items.find((item) => item.skillCode === 'gcf-and-lcm');

    expect(unitRates?.action).toEqual({
      contentId: 'unit-rates-1',
      kind: 'practice',
      label: 'Bicycle pace',
    });
    expect(gcf?.action).toEqual({
      contentId: 'gcf-and-lcm-1',
      kind: 'diagnostic',
      label: 'Locker numbers',
    });
  });

  it('leaves a skill with no plan/diagnostic/review entry without an action', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    const ratioTables = chapters[0].items.find((item) => item.skillCode === 'ratio-tables');
    expect(ratioTables?.action).toBeUndefined();
  });

  it('marks a skill locked only when a real prerequisite is unmet', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    const ratioLanguage = chapters[0].items.find((item) => item.skillCode === 'ratio-language');
    // ratio-language has no prerequisites in the real catalog.
    expect(ratioLanguage?.locked).toBe(false);
  });

  it('returns an empty list when progress has not loaded yet', () => {
    expect(buildChapters(undefined, plan, diagnosticPlan, reviewQueue)).toEqual([]);
  });
});

describe('nextChapterDomain', () => {
  it('returns the following chapter in order', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    expect(nextChapterDomain(chapters, 'ratios-and-proportional-reasoning')).toBe('number-system');
  });

  it('returns undefined past the last chapter', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    expect(nextChapterDomain(chapters, 'number-system')).toBeUndefined();
  });

  it('returns undefined for an unknown domain', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    expect(nextChapterDomain(chapters, 'geometry')).toBeUndefined();
  });
});

describe('chapterForSkill', () => {
  it('finds the chapter containing a given skill', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    expect(chapterForSkill(chapters, 'gcf-and-lcm')?.domain).toBe('number-system');
  });

  it('returns undefined for a skill not present in any chapter', () => {
    const chapters = buildChapters(progress, plan, diagnosticPlan, reviewQueue);
    expect(chapterForSkill(chapters, 'not-a-real-skill')).toBeUndefined();
  });
});
