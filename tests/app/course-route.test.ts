import { describe, expect, it } from 'vitest';

import {
  buildCourseHref,
  parseCourseRoute,
  resolveCourseRoute,
  type CourseRoute,
} from '../../src/app/course-route';
import { buildChapters, type LearnerProgress } from '../../src/app/learner-chapters';

const available = (program: string) => ['grade-6-math', 'math-kangaroo-6'].includes(program);

const progress: LearnerProgress = {
  skills: [
    {
      skillCode: 'ratio-language',
      title: 'Ratio language',
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
const chapters = buildChapters(progress, undefined, undefined, undefined);

describe('parseCourseRoute', () => {
  it('treats an empty query as the default activity of the default program', () => {
    expect(parseCourseRoute('', available)).toEqual({
      route: { kind: 'default', program: 'grade-6-math' },
      recognized: true,
    });
  });

  it.each<CourseRoute>([
    { kind: 'default', program: 'math-kangaroo-6' },
    { kind: 'overview', program: 'grade-6-math' },
    { kind: 'overview', program: 'grade-6-math', domain: 'number-system' },
    { kind: 'topic', program: 'grade-6-math', domain: 'number-system', skill: 'gcf-and-lcm' },
  ])('round-trips %j through the URL', (route) => {
    const href = buildCourseHref(route);
    expect(href.startsWith('/?')).toBe(true);
    expect(parseCourseRoute(href.slice(1), available)).toEqual({ route, recognized: true });
  });

  it('only ever puts public curriculum identifiers in the URL', () => {
    const href = buildCourseHref({
      kind: 'topic',
      program: 'grade-6-math',
      domain: 'number-system',
      skill: 'gcf-and-lcm',
    });
    expect([...new URLSearchParams(href.slice(2)).keys()].sort()).toEqual([
      'domain',
      'program',
      'skill',
    ]);
  });

  it.each([
    '?program=not-a-program',
    '?program=grade-6-math&view=overview&extra=1',
    '?program=grade-6-math&program=math-kangaroo-6',
    '?program=grade-6-math&skill=gcf-and-lcm',
    '?program=grade-6-math&domain=number-system',
    '?program=grade-6-math&view=overview&skill=gcf-and-lcm',
    '?program=grade-6-math&view=other',
    '?program=grade-6-math&domain=Bad Domain&skill=x',
    '?program=grade-6-math&domain=a&skill=<script>',
    '?domain=number-system&skill=gcf-and-lcm',
    '?learnerId=abc&program=grade-6-math',
  ])('rejects %s and falls back to an overview without echoing input', (search) => {
    const parsed = parseCourseRoute(search, available);
    expect(parsed.recognized).toBe(false);
    expect(parsed.route.kind).toBe('overview');
    expect(JSON.stringify(parsed)).not.toMatch(/script|learnerId|abc|Bad/);
  });

  it('keeps a valid program when only another part of the link is bad', () => {
    expect(parseCourseRoute('?program=math-kangaroo-6&view=other', available).route).toEqual({
      kind: 'overview',
      program: 'math-kangaroo-6',
    });
  });
});

describe('resolveCourseRoute', () => {
  it('accepts a topic that belongs to its chapter', () => {
    const route: CourseRoute = {
      kind: 'topic',
      program: 'grade-6-math',
      domain: 'number-system',
      skill: 'gcf-and-lcm',
    };
    expect(resolveCourseRoute(route, chapters)).toEqual({ status: 'ok', route });
  });

  it.each<CourseRoute>([
    { kind: 'topic', program: 'grade-6-math', domain: 'number-system', skill: 'ratio-language' },
    { kind: 'topic', program: 'grade-6-math', domain: 'geometry', skill: 'gcf-and-lcm' },
    { kind: 'topic', program: 'grade-6-math', domain: 'number-system', skill: 'nope' },
    { kind: 'overview', program: 'grade-6-math', domain: 'geometry' },
  ])('rejects %j against the loaded chapters', (route) => {
    expect(resolveCourseRoute(route, chapters)).toEqual({
      status: 'rejected',
      route: { kind: 'overview', program: 'grade-6-math' },
    });
  });

  it('accepts a whole-course overview and the default route without chapters', () => {
    const overview: CourseRoute = { kind: 'overview', program: 'grade-6-math' };
    expect(resolveCourseRoute(overview, []).status).toBe('ok');
    expect(resolveCourseRoute({ kind: 'default', program: 'grade-6-math' }, []).status).toBe('ok');
  });
});
