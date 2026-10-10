import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { CourseOverview } from '../../src/app/components/course-overview';
import { TopicDetail } from '../../src/app/components/topic-detail';
import {
  DiagnosticPlanSchema,
  LearnerProgressSchema,
  PlanSchema,
  ReviewQueueSchema,
  SessionSchema,
} from '../../src/app/learner-data';
import {
  buildChapters,
  describeTopicStatus,
  isTopicOpenable,
  type LearnerProgress,
  type Plan,
} from '../../src/app/learner-chapters';

// Synthetic fixtures for tests only: these titles are real catalog skill
// codes, but every status below is invented for the assertion.
const progress: LearnerProgress = {
  skills: [
    {
      skillCode: 'ratio-language',
      title: 'Ratio language',
      domain: 'ratios-and-proportional-reasoning',
      status: 'INDEPENDENTLY_CONFIRMED',
      summary: '',
    },
    {
      skillCode: 'unit-rates',
      title: 'Unit rates',
      domain: 'ratios-and-proportional-reasoning',
      status: 'PRACTICING',
      summary: '',
    },
    {
      skillCode: 'ratio-tables',
      title: 'Ratio tables',
      domain: 'ratios-and-proportional-reasoning',
      status: 'NOT_STARTED',
      summary: '',
    },
    {
      skillCode: 'gcf-and-lcm',
      title: 'GCF and LCM',
      domain: 'number-system',
      status: 'NOT_STARTED',
      summary: '',
    },
  ],
  recentStrengths: [],
  nextActivity: null,
};
const plan: Plan = {
  items: [
    {
      contentId: 'unit-rates-1',
      skillCode: 'unit-rates',
      title: 'Bicycle pace',
      skillTitle: 'Unit rates',
      reason: 'r',
      estimatedMinutes: 5,
    },
  ],
  totalMinutes: 5,
  blockedSkills: ['ratio-tables'],
  unavailableSkills: ['gcf-and-lcm'],
};

const noop = () => undefined;

function renderOverview(chapters: ReturnType<typeof buildChapters>, focusDomain?: string) {
  return renderToStaticMarkup(
    React.createElement(CourseOverview, {
      program: 'grade-6-math',
      programLabel: 'Grade 6 Math',
      chapters,
      focusDomain,
      planUnavailable: false,
      onOpenTopic: noop,
      onOpenChapter: noop,
      onOpenCourse: noop,
    }),
  );
}

describe('topic availability and status wording', () => {
  beforeAll(() => {
    (globalThis as { React?: typeof React }).React = React;
  });

  it('derives availability from the server plan lists, and unknown without a plan', () => {
    const items = buildChapters(progress, plan, undefined, undefined).flatMap((c) => c.items);
    const byCode = Object.fromEntries(items.map((item) => [item.skillCode, item.availability]));
    expect(byCode).toEqual({
      'ratio-language': 'offered',
      'unit-rates': 'offered',
      'ratio-tables': 'blocked',
      'gcf-and-lcm': 'unavailable',
    });
    const unknown = buildChapters(progress, undefined, undefined, undefined).flatMap(
      (c) => c.items,
    );
    expect(unknown.every((item) => item.availability === 'unknown')).toBe(true);
    expect(unknown.some(isTopicOpenable)).toBe(false);
  });

  it('keeps practice evidence and mastery separate and does not invent attempts or reasons', () => {
    const items = buildChapters(progress, plan, undefined, undefined).flatMap((c) => c.items);
    const text = (code: string) => describeTopicStatus(items.find((i) => i.skillCode === code)!);
    expect(text('unit-rates')).toMatchObject({
      practice: 'Practice evidence recorded',
      mastery: 'Not yet independently confirmed',
    });
    expect(text('ratio-language').mastery).toBe('Independently confirmed');
    expect(text('ratio-tables').practice).toBe('No practice evidence recorded yet');
    expect(text('ratio-tables').attempts).toMatch(/not reported/);
    expect(text('ratio-tables').availability).toMatch(/no further reason is available/);
    expect(text('unit-rates').availability).toBeNull();
  });

  it('counts practicing topics separately from confirmed ones', () => {
    const [ratios] = buildChapters(progress, plan, undefined, undefined);
    expect(ratios).toMatchObject({ confirmedCount: 1, practicingCount: 1, totalCount: 3 });
  });
});

describe('CourseOverview', () => {
  it('links only topics the plan offers and explains the rest honestly', () => {
    const html = renderOverview(buildChapters(progress, plan, undefined, undefined));
    expect(html).toContain('Course overview: Grade 6 Math');
    expect(html).toContain(
      'href="/?program=grade-6-math&amp;domain=ratios-and-proportional-reasoning&amp;skill=unit-rates"',
    );
    expect(html).not.toContain('skill=ratio-tables');
    expect(html).not.toContain('skill=gcf-and-lcm');
    expect(html).toContain('Not offered yet.');
    expect(html).toContain('No activity is offered for this topic yet.');
    expect(html).toContain('1 of 3 topics independently confirmed');
    expect(html).not.toMatch(/complete/i);
  });

  it('opens nothing when no plan has loaded', () => {
    const html = renderOverview(buildChapters(progress, undefined, undefined, undefined));
    expect(html).not.toContain('&amp;skill=');
    expect(html).toContain('Availability is unknown');
  });

  it('can focus a single chapter and exposes the current breadcrumb location', () => {
    const html = renderOverview(
      buildChapters(progress, plan, undefined, undefined),
      'number-system',
    );
    expect(html).toContain('The Number System overview');
    expect(html).not.toContain('Ratio language');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('aria-current="page"');
  });
});

describe('TopicDetail', () => {
  it('shows a skill-map table from the catalog with recorded statuses', () => {
    const chapters = buildChapters(progress, plan, undefined, undefined);
    const item = chapters[0].items.find((candidate) => candidate.skillCode === 'unit-rates')!;
    const html = renderToStaticMarkup(React.createElement(TopicDetail, { item, chapters }));
    expect(html).toContain('<caption>');
    expect(html).toContain('<td>Builds on</td><th scope="row">Ratio language</th>');
    expect(html).toContain('<td>Independently confirmed</td>');
    expect(html).toContain('Topic: Unit rates');
    expect(html).toContain('Number of attempts is not reported');
  });
});

describe('response schemas fail closed', () => {
  it('accepts well-formed payloads', () => {
    expect(LearnerProgressSchema.safeParse(progress).success).toBe(true);
    expect(PlanSchema.safeParse(plan).success).toBe(true);
    expect(DiagnosticPlanSchema.safeParse({ items: [] }).success).toBe(true);
    expect(ReviewQueueSchema.safeParse({ items: [] }).success).toBe(true);
  });

  it.each([{}, { skills: 'x' }, { items: null }, null, 'text'])('rejects %j', (payload) => {
    expect(LearnerProgressSchema.safeParse(payload).success).toBe(false);
    expect(PlanSchema.safeParse(payload).success).toBe(false);
    expect(SessionSchema.safeParse(payload).success).toBe(false);
  });

  it('rejects an unknown progress status', () => {
    const bad = {
      ...progress,
      skills: [{ ...progress.skills[0], status: 'MASTERED' }],
    };
    expect(LearnerProgressSchema.safeParse(bad).success).toBe(false);
  });
});
