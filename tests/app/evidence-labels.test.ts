import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

import { ActivityPanel } from '../../src/app/components/activity-panel';
import { ChapterSidebar } from '../../src/app/components/chapter-sidebar';
import { CourseOverview } from '../../src/app/components/course-overview';
import { CourseProgressPanel } from '../../src/app/components/course-progress-panel';
import { ParentCourseProgress } from '../../src/app/components/parent-course-progress';
import { ParentEvidence } from '../../src/app/components/parent-evidence';
import { TopicDetail } from '../../src/app/components/topic-detail';
import type { CourseProgress } from '../../src/app/course-progress-view';
import {
  buildChapters,
  describeTopicStatus,
  type ChapterItem,
  type LearnerProgress,
} from '../../src/app/learner-chapters';
import {
  hasQualifiedEvidenceWording,
  needsSpellingL2Note,
  qualifiedCompletionLabel,
  chapterConfirmedCountText,
  recentStrengthText,
  activityCompletedText,
  reviewCorrectText,
  qualifiedIndependentCheckLabel,
  selectionExplanationLabels,
  SPELLING_EXPLANATION_PARTIAL_LABEL,
  SPELLING_GENERATED_EXPLANATION_LABEL,
  SPELLING_INDEPENDENT_CHECK_LABEL,
  SPELLING_L2_PARENT_NOTE,
  SPELLING_LESSON_COMPLETE_LABEL,
  SPELLING_SELECTED_EXPLANATION_LABEL,
  SPELLING_UNIT_COMPLETE_LABEL,
} from '../../src/curriculum/evidence-labels';
import { SKILL_PROGRESS_SUMMARY } from '../../src/phase1/service';

const h = React.createElement;
const noop = () => {};
beforeAll(() => {
  (globalThis as { React?: typeof React }).React = React;
});

const SP = 'snsb6-morphology-roots';
const MATH = 'ratio-language';
const SCI = 'sci6-cells-evidence-of-life';
const FORBIDDEN = [
  /\bexplains\b/i,
  /\bstates\b/i,
  /constructs an explanation/i,
  /full mastery demonstrated/i,
  /independently confirmed/i,
  /confirmed independently/i,
  />Confirmed</,
];

const parentEvidence = (skillCode: string, confirmed: boolean) =>
  renderToStaticMarkup(
    h(ParentEvidence, {
      evidence: {
        learnerName: 'Synthetic learner',
        attempts: [],
        mastery: [
          { skillCode, estimate: 0.9, confidenceBand: 'HIGH', independentDelayedCheck: confirmed },
        ],
      },
    }),
  );

const chapterItem = (skillCode: string, status: ChapterItem['status']): ChapterItem =>
  ({
    skillCode,
    title: 'Synthetic title',
    status,
    summary: '',
    locked: false,
    availability: 'offered',
    action: null,
  }) as unknown as ChapterItem;

const learnerProgress = (skillCode: string): LearnerProgress => ({
  skills: [
    {
      skillCode,
      title: 'Synthetic title',
      domain: 'synthetic-domain',
      status: 'INDEPENDENTLY_CONFIRMED',
      summary: '',
    },
  ],
  recentStrengths: [],
  nextActivity: null,
});

describe('evidence label policy (D-361)', () => {
  it('qualifies only Spelling skill codes', () => {
    expect(hasQualifiedEvidenceWording(SP)).toBe(true);
    for (const code of [MATH, SCI, 'py6-x', 'hss6-x', 'not-snsb6-x']) {
      expect(hasQualifiedEvidenceWording(code)).toBe(false);
      expect(qualifiedIndependentCheckLabel(code)).toBeNull();
    }
    expect(qualifiedIndependentCheckLabel(SP)).toBe(SPELLING_INDEPENDENT_CHECK_LABEL);
  });

  it('keeps the exact D-361 label strings', () => {
    expect(SPELLING_SELECTED_EXPLANATION_LABEL).toBe(
      'Selected the correct explanation from supplied options.',
    );
    expect(SPELLING_EXPLANATION_PARTIAL_LABEL).toBe(
      'Explanation evidence: partial, selection-based recognition only.',
    );
    expect(SPELLING_GENERATED_EXPLANATION_LABEL).toBe(
      'Learner-generated explanation: not yet assessed; deferred requirement.',
    );
    expect(SPELLING_INDEPENDENT_CHECK_LABEL).toBe(
      'Independent check passed on assessed tasks; explanation requirement remains incomplete.',
    );
    expect(SPELLING_LESSON_COMPLETE_LABEL).toBe(
      'Lesson completed under the assessment policy; full skill mastery is not established.',
    );
    expect(SPELLING_UNIT_COMPLETE_LABEL).toBe(
      'Unit completed under the assessment policy; full skill mastery is not established.',
    );
    expect(SPELLING_L2_PARENT_NOTE).toBe(
      "This unit assesses spelling, word construction and choices made from supplied clues and options. Explanation questions assess recognition of a supplied explanation, not an explanation written by the learner. Lesson or unit completion and independent-check results do not establish the skills' full explanation requirement. Learner-generated explanation remains unassessed and deferred. These results do not establish readiness for the competition.",
    );
  });

  it('shows selection labels only for a matching successful selection attempt on Spelling', () => {
    const ok = { correct: true, selectedSuppliedExplanation: true };
    expect(selectionExplanationLabels(SP, ok)).toEqual([
      SPELLING_SELECTED_EXPLANATION_LABEL,
      SPELLING_EXPLANATION_PARTIAL_LABEL,
      SPELLING_GENERATED_EXPLANATION_LABEL,
    ]);
    expect(selectionExplanationLabels(SP, { ...ok, correct: false })).toBeNull();
    expect(
      selectionExplanationLabels(SP, { ...ok, selectedSuppliedExplanation: false }),
    ).toBeNull();
    expect(selectionExplanationLabels(MATH, ok)).toBeNull();
  });

  it('qualifies completion only when COMPLETE and at least one skill is Spelling', () => {
    expect(qualifiedCompletionLabel('Lesson', [SP], 'COMPLETE')).toBe(
      SPELLING_LESSON_COMPLETE_LABEL,
    );
    expect(qualifiedCompletionLabel('Unit', [SP, SP], 'COMPLETE')).toBe(
      SPELLING_UNIT_COMPLETE_LABEL,
    );
    expect(qualifiedCompletionLabel('Lesson', [SP], 'IN_PROGRESS')).toBeNull();
    expect(qualifiedCompletionLabel('Lesson', [], 'COMPLETE')).toBeNull();
    expect(needsSpellingL2Note([MATH, SP])).toBe(true);
    expect(needsSpellingL2Note([MATH, SCI])).toBe(false);
    expect(qualifiedCompletionLabel('Lesson', [SP, MATH], 'COMPLETE')).toBe(
      `Spelling skills in this lesson: ${SPELLING_LESSON_COMPLETE_LABEL}`,
    );
  });

  it('is the only place the Spelling prefix decides wording (no literal prefix in surfaces)', () => {
    for (const file of [
      'src/app/components/parent-evidence.tsx',
      'src/app/components/parent-course-progress.tsx',
      'src/app/components/course-progress-panel.tsx',
      'src/app/components/chapter-sidebar.tsx',
      'src/app/components/topic-detail.tsx',
    ]) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toContain('snsb6-');
      expect(source).toContain('evidence-labels');
    }
  });
});

describe('parent evidence', () => {
  it('shows the qualified label for a confirmed Spelling skill and never the unqualified claim', () => {
    const markup = parentEvidence(SP, true);
    expect(markup).toContain(SPELLING_INDEPENDENT_CHECK_LABEL);
    for (const pattern of FORBIDDEN) expect(markup).not.toMatch(pattern);
  });

  it('keeps other programs byte for byte', () => {
    for (const code of [MATH, SCI, 'py6-x', 'hss6-x']) {
      const markup = parentEvidence(code, true);
      expect(markup).toContain(
        `Skill: ${code} — estimate 0.9, confidence high. Independently confirmed.`,
      );
      expect(markup).not.toContain('explanation requirement');
      expect(parentEvidence(code, false)).toContain('Independent confirmation still needed.');
    }
  });

  it('keeps the practice-only Spelling note and shows no L2 note without course units', () => {
    const markup = parentEvidence(SP, false);
    expect(markup).toContain('practice only');
    expect(markup).not.toContain(SPELLING_L2_PARENT_NOTE);
    expect(markup).toContain('Independent confirmation still needed.');
  });
});

describe('learner surfaces', () => {
  it('topic status text', () => {
    expect(describeTopicStatus(chapterItem(SP, 'INDEPENDENTLY_CONFIRMED')).mastery).toBe(
      SPELLING_INDEPENDENT_CHECK_LABEL,
    );
    expect(describeTopicStatus(chapterItem(MATH, 'INDEPENDENTLY_CONFIRMED')).mastery).toBe(
      'Independently confirmed',
    );
    expect(describeTopicStatus(chapterItem(SP, 'PRACTICING')).mastery).toBe(
      'Not yet independently confirmed',
    );
  });

  it('topic detail, sidebar and overview never show the unqualified claim for Spelling', () => {
    const chapters = buildChapters(learnerProgress(SP), undefined, undefined, undefined);
    const spItem = chapters[0]!.items[0]!;
    const detail = renderToStaticMarkup(h(TopicDetail, { item: spItem, chapters }));
    const sidebar = renderToStaticMarkup(
      h(ChapterSidebar, {
        chapters,
        activeDomain: chapters[0]!.domain,
        activeSkillCode: SP,
        onSelectItem: noop,
      } as never),
    );
    const overview = renderToStaticMarkup(
      h(CourseOverview, {
        chapters,
        program: 'x',
        programLabel: 'Synthetic',
        planUnavailable: false,
        onOpenChapter: noop,
        onOpenTopic: noop,
      } as never),
    );
    expect(detail).toContain(SPELLING_INDEPENDENT_CHECK_LABEL);
    for (const markup of [detail, sidebar, overview]) {
      for (const pattern of FORBIDDEN) expect(markup).not.toMatch(pattern);
    }
    expect(sidebar).toContain('independent check passed');
    expect(overview).toContain('independent check passed');
  });

  it('other programs keep the existing wording', () => {
    for (const code of [MATH, SCI]) {
      const chapters = buildChapters(learnerProgress(code), undefined, undefined, undefined);
      const sidebar = renderToStaticMarkup(
        h(ChapterSidebar, {
          chapters,
          activeDomain: chapters[0]!.domain,
          activeSkillCode: code,
          onSelectItem: noop,
        } as never),
      );
      expect(sidebar).toContain('1 of 1 skills confirmed');
      expect(sidebar).toContain('Confirmed');
      expect(sidebar).not.toContain('independent check passed');
    }
  });

  it('keeps the default service summary for non-Spelling skills', () => {
    expect(SKILL_PROGRESS_SUMMARY.INDEPENDENTLY_CONFIRMED).toBe(
      'Independently confirmed on an unassisted check.',
    );
  });
});

const courseProgress = (code: string, status: string): CourseProgress => ({
  units: [
    {
      code: 'u',
      version: '1.0.0',
      title: 'Synthetic unit',
      status,
      lessons: [
        {
          code: 'l',
          version: '1.0.0',
          title: 'Synthetic lesson',
          completionStatus: status,
          remediationStatus: 'NONE',
          skillRefs: [{ code, version: '1.0.0' }],
        },
      ],
    },
  ],
});

describe('course progression surfaces', () => {
  const learner = (cp: CourseProgress) =>
    renderToStaticMarkup(h(CourseProgressPanel, { courseProgress: cp }));
  const parent = (cp: CourseProgress) =>
    renderToStaticMarkup(
      h(ParentCourseProgress, {
        courseProgress: cp,
        overrideStatusMessage: '',
        onOverrideApplied: noop,
      }),
    );

  it('qualifies Spelling completion on both surfaces and adds the parent L2 note', () => {
    const cp = courseProgress(SP, 'COMPLETE');
    for (const markup of [learner(cp), parent(cp)]) {
      expect(markup).toContain(SPELLING_LESSON_COMPLETE_LABEL);
      expect(markup).toContain(SPELLING_UNIT_COMPLETE_LABEL);
      expect(markup).not.toMatch(/full mastery demonstrated/i);
    }
    expect(parent(cp)).toContain(SPELLING_L2_PARENT_NOTE.replaceAll("'", '&#x27;'));
    expect(learner(cp)).not.toContain('This unit assesses spelling');
    expect(parent(courseProgress(SP, 'IN_PROGRESS'))).not.toContain('Lesson completed under');
  });

  it('leaves other programs unchanged', () => {
    const cp = courseProgress(MATH, 'COMPLETE');
    for (const markup of [learner(cp), parent(cp)]) {
      expect(markup).not.toContain('assessment policy');
      expect(markup).not.toContain('explanation');
    }
  });
});

describe('mixed counts, recent strengths and activity text', () => {
  const conf = 'INDEPENDENTLY_CONFIRMED';
  it('counts Spelling separately in mixed chapters and keeps others byte-identical', () => {
    const none = [
      { skillCode: MATH, status: conf },
      { skillCode: SCI, status: 'PRACTICING' },
    ];
    expect(chapterConfirmedCountText(none, 'skills')).toBe('1 of 2 skills confirmed');
    expect(chapterConfirmedCountText(none, 'topics')).toBe('1 of 2 topics independently confirmed');
    const mixed = [
      { skillCode: MATH, status: conf },
      { skillCode: SP, status: conf },
    ];
    expect(chapterConfirmedCountText(mixed, 'topics')).toBe(
      '1 of 1 topics independently confirmed. 1 of 1 Spelling topics with an independent check passed on assessed tasks; explanation requirement remains incomplete',
    );
    const only = chapterConfirmedCountText([{ skillCode: SP, status: conf }], 'skills');
    expect(only).toBe(
      '1 of 1 skills with an independent check passed on assessed tasks; explanation requirement remains incomplete',
    );
    for (const text of [only, chapterConfirmedCountText(mixed, 'skills')]) {
      expect(text).not.toMatch(/2 of 2/);
    }
  });

  it('renders mixed counts in visible and aria text', () => {
    const progress: LearnerProgress = {
      skills: [
        { ...learnerProgress(SP).skills[0]!, domain: 'synthetic-domain' },
        { ...learnerProgress(MATH).skills[0]!, domain: 'synthetic-domain' },
      ],
      recentStrengths: [],
      nextActivity: null,
    };
    const chapters = buildChapters(progress, undefined, undefined, undefined);
    const overview = renderToStaticMarkup(
      h(CourseOverview, {
        chapters,
        program: 'x',
        programLabel: 'Synthetic',
        planUnavailable: false,
        onOpenChapter: noop,
        onOpenTopic: noop,
      } as never),
    );
    expect(overview).not.toContain('2 of 2');
    expect(overview.match(/1 of 1 Spelling topics with an independent check passed/g)).toHaveLength(
      2,
    );
  });

  it('keeps the date in Recent strengths and qualifies only Spelling', () => {
    expect(recentStrengthText(SP, 'Roots', '11/1/2026')).toBe(
      `Roots — ${SPELLING_INDEPENDENT_CHECK_LABEL} Date: 11/1/2026`,
    );
    expect(recentStrengthText(MATH, 'Ratios', '11/1/2026')).toBe(
      'Ratios — confirmed independently on 11/1/2026',
    );
    expect(readFileSync('src/app/page.tsx', 'utf8')).toContain('recentStrengthText(');
  });

  it('activity panel completion, resumed and live review text', () => {
    const session = (skillCode: string, completed: boolean, resumed: boolean) =>
      ({
        sessionId: 's',
        resumed,
        completed,
        hintCount: 0,
        learner: { displayName: 'L' },
        content: {
          id: 'c',
          title: 'T',
          skillCode,
          prompt: 'P',
          accessibilityNotes: '',
        },
      }) as never;
    const render = (skillCode: string, completed: boolean, resumed: boolean, mode: string) =>
      renderToStaticMarkup(
        h(ActivityPanel, {
          session: session(skillCode, completed, resumed),
          mode,
          response: '',
          setResponse: noop,
          error: '',
          setError: noop,
          attempt: { attemptId: 'a', correctness: 'CORRECT' },
          hintCount: 0,
          hintPending: false,
          hintButtonRef: { current: null },
          responseInputRef: { current: null },
          pythonResponseRef: { current: null },
          fieldValues: {},
          onFieldChange: noop,
          structuredError: undefined,
          summaryRef: { current: null },
          pendingAction: null,
          onSubmitAttempt: noop,
          onRequestHint: noop,
          onSubmitIndependentCheck: noop,
        } as never),
      );
    for (const resumed of [true, false]) {
      const sp = render(SP, true, resumed, 'practice');
      expect(sp).toContain(SPELLING_INDEPENDENT_CHECK_LABEL);
      expect(sp).not.toContain('Independent check passed — this activity is complete.</p>');
      expect(render(MATH, true, resumed, 'practice')).toContain(
        '<p role="status">Independent check passed — this activity is complete.</p>',
      );
    }
    const spReview = render(SP, false, false, 'review');
    expect(spReview).toContain(`Correct. ${SPELLING_INDEPENDENT_CHECK_LABEL}`);
    expect(spReview).not.toContain('still confirmed');
    expect(render(MATH, false, false, 'review')).toContain(
      'Correct — this skill is still confirmed.',
    );
    expect(activityCompletedText(MATH)).toBe(
      'Independent check passed — this activity is complete.',
    );
    expect(reviewCorrectText(MATH)).toBe('Correct — this skill is still confirmed.');
  });
});
