import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CourseProgressPanel } from '../../src/app/components/course-progress-panel';
import { ParentCourseProgress } from '../../src/app/components/parent-course-progress';
import {
  historyHeadingId,
  progressKey,
  type CourseProgress,
} from '../../src/app/course-progress-view';
import {
  GOLDEN_LEARNER_MARKUP,
  GOLDEN_OVERRIDE_MESSAGE,
  GOLDEN_PARENT_MARKUP,
  GOLDEN_PARENT_MESSAGE_MARKUP,
  GOLDEN_SINGLE_VERSION_PROGRESS,
  GOLDEN_STUBBED_DATE,
} from './fixtures/course-progress-golden';

const h = React.createElement;
const noop = () => {};

beforeAll(() => {
  // Vitest's transform uses the classic JSX runtime for this file graph.
  (globalThis as { React?: typeof React }).React = React;
});
beforeEach(() => {
  vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue(GOLDEN_STUBBED_DATE);
});
afterEach(() => vi.restoreAllMocks());

const learner = (courseProgress: CourseProgress) =>
  renderToStaticMarkup(h('main', null, h(CourseProgressPanel, { courseProgress })));
const parent = (courseProgress: CourseProgress, overrideStatusMessage = '') =>
  renderToStaticMarkup(
    h(
      'main',
      null,
      h(ParentCourseProgress, { courseProgress, overrideStatusMessage, onOverrideApplied: noop }),
    ),
  );

const skill = (code: string) => [{ code, version: '1.0.0' }];
const lesson = (code: string, title: string, version: string, remediation = 'NONE') => ({
  code,
  version,
  title,
  completionStatus: 'IN_PROGRESS',
  remediationStatus: remediation,
  skillRefs: skill(code.replace(/-lesson$/u, '')),
});
const UNIT = 'ratios-and-proportional-reasoning';
const unit = (version: string, lessons: ReturnType<typeof lesson>[]) => ({
  code: UNIT,
  version,
  title: 'Ratios and proportional reasoning',
  status: 'IN_PROGRESS',
  lessons,
});
const activeV2 = unit('2.0.0', [
  lesson('ratio-language-lesson', 'Ratio language', '2.0.0'),
  lesson('unit-rates-lesson', 'Unit rates', '2.0.0'),
  lesson('ratio-tables-lesson', 'Ratio tables', '2.0.0'),
  lesson('double-number-lines-lesson', 'Double number lines', '2.0.0'),
  lesson('percent-applications-lesson', 'Percent applications', '2.0.0'),
]);
const historyV1 = (remediation = 'NEEDS_HELP') =>
  unit('1.0.0', [lesson('ratio-tables-lesson', 'Ratio tables', '1.0.0', remediation)]);
const twoVersions = (remediationV1 = 'NEEDS_HELP'): CourseProgress => ({
  units: [activeV2],
  history: [historyV1(remediationV1)],
});

const ids = (html: string) => [...html.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]!);
const buttons = (html: string) =>
  [...html.matchAll(/<button[^>]*>([^<]*)<\/button>/gu)].map((match) => match[1]!);

describe('RI-4 (i) single version is byte-identical to the pre-change inline sections', () => {
  it('learner panel equals the golden', () => {
    expect(learner(GOLDEN_SINGLE_VERSION_PROGRESS)).toBe(GOLDEN_LEARNER_MARKUP);
  });

  it('parent section equals the golden, with and without the override status message', () => {
    expect(parent(GOLDEN_SINGLE_VERSION_PROGRESS)).toBe(GOLDEN_PARENT_MARKUP);
    expect(parent(GOLDEN_SINGLE_VERSION_PROGRESS, GOLDEN_OVERRIDE_MESSAGE)).toBe(
      GOLDEN_PARENT_MESSAGE_MARKUP,
    );
  });

  it('a response without a history key renders the same markup', () => {
    const legacy: CourseProgress = { units: GOLDEN_SINGLE_VERSION_PROGRESS.units };
    expect(learner(legacy)).toBe(GOLDEN_LEARNER_MARKUP);
    expect(parent(legacy)).toBe(GOLDEN_PARENT_MARKUP);
  });

  it('CE-2 positive control: no earlier-version rows means no history section', () => {
    for (const html of [
      learner(GOLDEN_SINGLE_VERSION_PROGRESS),
      parent(GOLDEN_SINGLE_VERSION_PROGRESS),
    ]) {
      expect(html).not.toContain('Earlier course versions');
      expect(html).not.toContain('course-history');
    }
  });
});

describe('RI-4 (ii) two versions render separate active and history sections', () => {
  it.each([
    ['learner', learner],
    ['parent', parent],
  ])('%s: separate sections, unique ids, version-qualified history heading', (_name, render) => {
    const html = render(twoVersions());
    expect(html.match(/<section /gu)).toHaveLength(2);
    expect(html).toContain('aria-labelledby="course-progress-heading"');
    expect(html).toContain('aria-labelledby="course-history-heading"');
    expect(html).toContain('Earlier course versions');
    expect(html).toContain(`id="${historyHeadingId(UNIT, '1.0.0')}"`);
    expect(historyHeadingId(UNIT, '1.0.0')).toBe(`course-history-${UNIT}-v1-0-0`);
    expect(html).toContain('Earlier version 1.0.0: Ratios and proportional reasoning');
    // The active unit keeps its code-only heading id; every id on the page is unique.
    expect(html).toContain(`id="${UNIT}-heading"`);
    const all = ids(html);
    expect(new Set(all).size).toBe(all.length);
    // The active section precedes the history section and holds the five lessons.
    const [activeHtml, historyHtml] = html.split('aria-labelledby="course-history-heading"');
    expect(activeHtml!.match(/<li>/gu)).toHaveLength(5);
    expect(historyHtml!.match(/<li>/gu)).toHaveLength(1);
  });

  it('two earlier versions get distinct heading ids and React keys do not collide', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(noop);
    const progress: CourseProgress = {
      units: [activeV2],
      history: [unit('1.0.0', historyV1().lessons), unit('1.5.0', historyV1().lessons)],
    };
    for (const html of [learner(progress), parent(progress)]) {
      const all = ids(html);
      expect(new Set(all).size).toBe(all.length);
      expect(all).toContain(historyHeadingId(UNIT, '1.0.0'));
      expect(all).toContain(historyHeadingId(UNIT, '1.5.0'));
    }
    expect(errors).not.toHaveBeenCalled();
    expect(progressKey('a', '1.0.0')).not.toBe(progressKey('a', '2.0.0'));
  });
});

describe('RI-4 (iii) CE-2: the parent can clear an earlier-version NEEDS_HELP lesson', () => {
  it('names the control with the lesson title and earlier version', () => {
    const html = parent(twoVersions());
    expect(buttons(html)).toEqual(['Clear “needs help” for Ratio tables (earlier version 1.0.0)']);
  });
});

describe('RI-4 (iv) the same lesson NEEDS_HELP in both versions gives distinct button names', () => {
  it('active and history buttons differ', () => {
    const progress = twoVersions();
    progress.units = [
      unit('2.0.0', [
        ...activeV2.lessons.slice(0, 2),
        lesson('ratio-tables-lesson', 'Ratio tables', '2.0.0', 'NEEDS_HELP'),
      ]),
    ];
    const names = buttons(parent(progress));
    expect(names).toEqual([
      'Clear “needs help” for Ratio tables',
      'Clear “needs help” for Ratio tables (earlier version 1.0.0)',
    ]);
    expect(new Set(names).size).toBe(2);
  });
});

describe('RI-4 (v) the learner panel renders no override', () => {
  it('shows history read-only, with no button, form or input', () => {
    const html = learner(twoVersions());
    expect(html).toContain('Ratio tables');
    expect(html).toContain('(needs help)');
    expect(html).not.toMatch(/<(button|form|input)\b/u);
    expect(html).not.toContain('needs-help-override');
  });
});
