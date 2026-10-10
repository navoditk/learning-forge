import { DEFAULT_CURRICULUM_PROGRAM } from '../phase1/program';
import type { Chapter } from './learner-chapters';

// URL state for the learner page. Only public curriculum identifiers
// (program code, domain code, skill code) ever appear in the URL - never a
// learner, household, session, attempt, content-item or answer identifier.
// Navigation state is presentation only: a URL never grants access, the
// server decides what a learner is offered.
export type CourseRoute =
  | { kind: 'default'; program: string }
  | { kind: 'overview'; program: string; domain?: string }
  | { kind: 'topic'; program: string; domain: string; skill: string };

export type ParsedCourseRoute = { route: CourseRoute; recognized: boolean };

export const DEFAULT_ROUTE_PROGRAM: string = DEFAULT_CURRICULUM_PROGRAM;

const IDENTIFIER = /^[a-z0-9][a-z0-9-]{0,79}$/;
const ALLOWED_KEYS = new Set(['program', 'view', 'domain', 'skill']);

export function buildCourseHref(route: CourseRoute): string {
  const query = new URLSearchParams({ program: route.program });
  if (route.kind === 'overview') {
    query.set('view', 'overview');
    if (route.domain) query.set('domain', route.domain);
  } else if (route.kind === 'topic') {
    query.set('domain', route.domain);
    query.set('skill', route.skill);
  }
  return `/?${query.toString()}`;
}

/**
 * Parses a location search string. Anything unknown, repeated, malformed or
 * inconsistent is rejected: the result is the course overview of the program
 * when that program is valid (otherwise the default program) with
 * `recognized: false`. The rejected text is never returned, so it cannot be
 * echoed back to the learner.
 */
export function parseCourseRoute(
  search: string,
  isAvailableProgram: (program: string) => boolean,
): ParsedCourseRoute {
  const params = new URLSearchParams(search);
  const keys = [...params.keys()];
  const fallbackFor = (program: string | undefined): ParsedCourseRoute => ({
    route: {
      kind: 'overview',
      program: program && isAvailableProgram(program) ? program : DEFAULT_ROUTE_PROGRAM,
    },
    recognized: false,
  });

  if (keys.length === 0) {
    return { route: { kind: 'default', program: DEFAULT_ROUTE_PROGRAM }, recognized: true };
  }

  const rawProgram = params.get('program') ?? undefined;
  if (
    keys.some((key) => !ALLOWED_KEYS.has(key)) ||
    new Set(keys).size !== keys.length ||
    !rawProgram ||
    !IDENTIFIER.test(rawProgram) ||
    !isAvailableProgram(rawProgram)
  ) {
    return fallbackFor(rawProgram && IDENTIFIER.test(rawProgram) ? rawProgram : undefined);
  }

  const view = params.get('view');
  const domain = params.get('domain');
  const skill = params.get('skill');
  if (
    (domain !== null && !IDENTIFIER.test(domain)) ||
    (skill !== null && !IDENTIFIER.test(skill))
  ) {
    return fallbackFor(rawProgram);
  }

  if (view === null && domain === null && skill === null) {
    return { route: { kind: 'default', program: rawProgram }, recognized: true };
  }
  if (view === 'overview' && skill === null) {
    return {
      route: { kind: 'overview', program: rawProgram, ...(domain ? { domain } : {}) },
      recognized: true,
    };
  }
  if (view === null && domain !== null && skill !== null) {
    return { route: { kind: 'topic', program: rawProgram, domain, skill }, recognized: true };
  }
  return fallbackFor(rawProgram);
}

export type RouteResolution =
  { status: 'ok'; route: CourseRoute } | { status: 'rejected'; route: CourseRoute };

/**
 * Checks a parsed route against the chapters the server actually returned for
 * the active program. A domain or skill that is not in those chapters, or a
 * skill that belongs to a different domain, is rejected (the caller shows the
 * course overview and a harmless notice).
 */
export function resolveCourseRoute(route: CourseRoute, chapters: Chapter[]): RouteResolution {
  const overview: CourseRoute = { kind: 'overview', program: route.program };
  if (route.kind === 'default') return { status: 'ok', route };
  const chapter = route.domain ? chapters.find((c) => c.domain === route.domain) : undefined;
  if (route.kind === 'overview') {
    if (route.domain === undefined) return { status: 'ok', route };
    return chapter ? { status: 'ok', route } : { status: 'rejected', route: overview };
  }
  if (!chapter || !chapter.items.some((item) => item.skillCode === route.skill)) {
    return { status: 'rejected', route: overview };
  }
  return { status: 'ok', route };
}
