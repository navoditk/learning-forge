'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { PROGRAM_ROSTER } from '../curriculum/program-roster';
import {
  ActivityPanel,
  type ActivityMode,
  type AttemptResult,
  type Session,
  type TutorResult,
} from './components/activity-panel';
import { ChapterSidebar } from './components/chapter-sidebar';
import { ChapterView } from './components/chapter-view';
import { CourseBreadcrumb } from './components/course-breadcrumb';
import { CourseOverview } from './components/course-overview';
import { TopicDetail } from './components/topic-detail';
import {
  buildCourseHref,
  DEFAULT_ROUTE_PROGRAM,
  parseCourseRoute,
  resolveCourseRoute,
  type CourseRoute,
} from './course-route';
import {
  DiagnosticPlanSchema,
  LearnerProgressSchema,
  PlanSchema,
  ReviewQueueSchema,
  SessionSchema,
} from './learner-data';
import { buildChapters, chapterForSkill, nextChapterDomain } from './learner-chapters';
import { useProgramResource } from './use-program-resource';

type CourseProgress = {
  units: Array<{
    code: string;
    title: string;
    status: string;
    lessons: Array<{
      code: string;
      title: string;
      completionStatus: string;
      remediationStatus: string;
      latestAssessment?: { outcome: string; scoredAt: string };
    }>;
  }>;
};

// `origin` records whether the session was requested as the default landing
// activity or by opening a specific topic, so returning to the default route
// can restore the default activity instead of keeping a topic's session.
type SessionOrigin = 'default' | 'topic';
type SessionState = {
  program: string;
  origin: SessionOrigin;
  status: 'loading' | 'ready' | 'error';
  data?: Session;
};

const progressionReleaseGateOpen =
  process.env.NEXT_PUBLIC_COURSE_PROGRESSION_RELEASE_GATE_OPEN === 'true';

// The pilot Program -> Unit -> Lesson structure (docs/course-progression-handoff.md)
// is only authored for this one domain so far. Shown as an enrichment inside
// that chapter when the release gate is open; unrelated to chapter grouping.
const PILOT_UNIT_DOMAIN = 'ratios-and-proportional-reasoning';

function isAvailableProgram(code: string): boolean {
  return PROGRAM_ROSTER.some((entry) => entry.code === code && entry.available);
}

type FocusTarget = 'overview' | 'topic';

export default function Home() {
  const [route, setRoute] = useState<CourseRoute>({
    kind: 'default',
    program: DEFAULT_ROUTE_PROGRAM,
  });
  // The URL is only readable in the browser; nothing is fetched or rendered
  // for a program until it has been parsed and validated.
  const [urlReady, setUrlReady] = useState(false);
  const [linkRejected, setLinkRejected] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>();
  const [response, setResponse] = useState('');
  const [attempt, setAttempt] = useState<AttemptResult>();
  const [tutor, setTutor] = useState<TutorResult>();
  const [hintCount, setHintCount] = useState(0);
  const [check, setCheck] = useState<AttemptResult>();
  const [error, setError] = useState('');
  const [courseProgress, setCourseProgress] = useState<CourseProgress>();
  const [mode, setMode] = useState<ActivityMode>('practice');
  const [hintPending, setHintPending] = useState(false);
  const [activeDomain, setActiveDomain] = useState<string>();
  const [activeSkillCode, setActiveSkillCode] = useState<string>();
  const [pendingFocus, setPendingFocus] = useState<FocusTarget>();
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const responseInputRef = useRef<HTMLInputElement>(null);
  const program = route.program;
  const selectedProgramRef = useRef(program);
  selectedProgramRef.current = program;
  const sessionSequence = useRef(0);
  const lastActivityRequest = useRef<{
    contentId?: string;
    mode: ActivityMode;
    origin: SessionOrigin;
  }>({ mode: 'practice', origin: 'default' });
  const appliedTopicKey = useRef<string | undefined>(undefined);

  const progressResource = useProgramResource(
    '/api/phase1/progress',
    program,
    LearnerProgressSchema,
  );
  const planResource = useProgramResource('/api/phase1/plan', program, PlanSchema);
  const diagnosticResource = useProgramResource(
    '/api/phase1/diagnostic',
    program,
    DiagnosticPlanSchema,
  );
  const reviewResource = useProgramResource('/api/phase1/review', program, ReviewQueueSchema);
  const progress = progressResource.data;
  const plan = planResource.data;
  const diagnosticPlan = diagnosticResource.data;
  const reviewQueue = reviewResource.data;
  const loadProgress = progressResource.load;
  const loadPlan = planResource.load;
  const loadDiagnosticPlan = diagnosticResource.load;
  const loadReviewQueue = reviewResource.load;

  const session = sessionState?.program === program ? sessionState.data : undefined;
  const sessionStatus = sessionState?.program === program ? sessionState.status : 'loading';

  useEffect(() => {
    // Disabling the button while a hint request is in flight drops keyboard
    // focus (browsers blur a disabled element). Restore it once the button
    // is interactive again, so a keyboard user isn't silently dropped back
    // to the document body.
    if (!hintPending) hintButtonRef.current?.focus();
  }, [hintPending]);

  const resetActivityState = useCallback(() => {
    setError('');
    setAttempt(undefined);
    setTutor(undefined);
    setHintCount(0);
    setCheck(undefined);
    setResponse('');
  }, []);

  // Reads the address bar (initially, and on back/forward). Anything that is
  // not a recognized public program/domain/skill link falls back to the course
  // overview with a notice that never repeats the rejected text.
  const applyLocation = useCallback((moveFocus: boolean) => {
    const parsed = parseCourseRoute(window.location.search, isAvailableProgram);
    if (!parsed.recognized) {
      window.history.replaceState(null, '', buildCourseHref(parsed.route));
    }
    setLinkRejected(!parsed.recognized);
    appliedTopicKey.current = undefined;
    setRoute(parsed.route);
    if (parsed.route.kind === 'default') {
      setActiveDomain(undefined);
      setActiveSkillCode(undefined);
    }
    // Attempt, hint and check state belongs to the loaded session and is
    // only replaced when a new session starts, so browsing away and back
    // does not discard it.
    setError('');
    setPendingFocus(
      moveFocus ? (parsed.route.kind === 'overview' ? 'overview' : 'topic') : undefined,
    );
    setUrlReady(true);
  }, []);

  useEffect(() => {
    applyLocation(false);
    const onPopState = () => applyLocation(true);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyLocation]);

  const loadCourseProgress = useCallback(() => {
    if (!progressionReleaseGateOpen) return;
    fetch('/api/progression/pilot')
      .then(async (result) => {
        if (!result.ok) return;
        setCourseProgress(await result.json());
      })
      .catch(() => undefined);
  }, []);

  const startActivity = useCallback(
    (
      contentId?: string,
      activityMode: ActivityMode = 'practice',
      origin: SessionOrigin = 'topic',
    ) => {
      const request = ++sessionSequence.current;
      lastActivityRequest.current = { contentId, mode: activityMode, origin };
      resetActivityState();
      setMode(activityMode);
      setSessionState((current) =>
        current?.program === program && current.origin === origin
          ? { ...current, status: 'loading' }
          : { program, origin, status: 'loading' },
      );
      const query = new URLSearchParams({ program });
      query.set(
        'activityKind',
        activityMode === 'diagnostic'
          ? 'PLACEMENT'
          : activityMode === 'review'
            ? 'REVIEW'
            : 'PRACTICE',
      );
      if (contentId) query.set('contentId', contentId);
      fetch(`/api/phase1/session?${query}`)
        .then(async (result) => {
          if (!result.ok) throw new Error('Session could not be loaded.');
          return SessionSchema.parse(await result.json());
        })
        .then((loaded) => {
          if (sessionSequence.current !== request || selectedProgramRef.current !== program) {
            return;
          }
          setSessionState({ program, origin, status: 'ready', data: loaded });
          // Rehydrate a resumed session's progress instead of showing a blank
          // form - the learner shouldn't lose an in-progress attempt, hint
          // count, or independent-check result on refresh.
          if (loaded.latestAttempt) {
            setAttempt({
              attemptId: loaded.latestAttempt.attemptId,
              correctness: loaded.latestAttempt.correctness,
            });
          }
          setHintCount(loaded.hintCount);
          if (loaded.latestCheck) {
            setCheck({
              attemptId: loaded.latestCheck.attemptId,
              correctness: loaded.latestCheck.correctness,
            });
          }
        })
        .catch(() => {
          if (sessionSequence.current !== request || selectedProgramRef.current !== program) {
            return;
          }
          setSessionState((current) =>
            current?.program === program && current.origin === origin
              ? { ...current, status: 'error' }
              : { program, origin, status: 'error' },
          );
        });
    },
    [program, resetActivityState],
  );

  const reloadCourseData = useCallback(() => {
    loadProgress(program);
    loadPlan(program);
    loadDiagnosticPlan(program);
    loadReviewQueue(program);
    loadCourseProgress();
  }, [loadCourseProgress, loadDiagnosticPlan, loadPlan, loadProgress, loadReviewQueue, program]);

  useEffect(() => {
    if (!urlReady) return;
    reloadCourseData();
  }, [urlReady, reloadCourseData]);

  // The default landing activity is only requested for the default route, and
  // is restored (the server resumes it) when a topic's session was loaded in
  // the meantime. An overview or topic link fetches nothing until a topic that
  // the server's own plan offers is opened.
  useEffect(() => {
    if (!urlReady || route.kind !== 'default') return;
    if (sessionState?.program === program && sessionState.origin === 'default') return;
    startActivity(undefined, 'practice', 'default');
  }, [urlReady, route.kind, sessionState?.program, sessionState?.origin, program, startActivity]);

  const chapters = useMemo(
    () => buildChapters(progress, plan, diagnosticPlan, reviewQueue),
    [progress, plan, diagnosticPlan, reviewQueue],
  );

  // Keeps the sidebar/chapter-view focus pointed at whichever skill is
  // actually loaded. It's a no-op whenever the currently active domain is
  // still present in the current chapters (including right after the
  // learner picks one themselves, even a skill with nothing queued), so it
  // only takes over on first load and right after a program switch
  // invalidates the previous domain (a different program has an entirely
  // different set of domains).
  useEffect(() => {
    if (route.kind !== 'default') return;
    // Only the default landing session may focus the default route; a topic's
    // session left over from earlier browsing must not leak its selection.
    if (chapters.length === 0 || !session || sessionState?.origin !== 'default') return;
    if (activeDomain && chapters.some((chapter) => chapter.domain === activeDomain)) return;
    const chapter = chapterForSkill(chapters, session.content.skillCode);
    if (chapter) {
      setActiveDomain(chapter.domain);
      setActiveSkillCode(session.content.skillCode);
    }
  }, [route.kind, session, sessionState?.origin, chapters, activeDomain]);

  const planListsSettled = [planResource, diagnosticResource, reviewResource].every(
    (resource) => resource.data !== undefined || resource.status === 'error',
  );

  // Validates an overview/topic route against what the server returned for
  // this program, then applies a deep-linked topic. An activity is started
  // only when the server's plan offers the topic; a blocked, unavailable or
  // unknown topic never fetches content.
  useEffect(() => {
    if (!urlReady || route.kind === 'default' || !progress) return;
    const resolution = resolveCourseRoute(route, chapters);
    if (resolution.status === 'rejected') {
      window.history.replaceState(null, '', buildCourseHref(resolution.route));
      setLinkRejected(true);
      setRoute(resolution.route);
      return;
    }
    if (route.kind !== 'topic' || !planListsSettled) return;
    const key = `${route.program}|${route.domain}|${route.skill}`;
    setActiveDomain(route.domain);
    setActiveSkillCode(route.skill);
    // The topic is only marked applied once an activity was actually started,
    // so a plan that failed and later recovers is re-evaluated, while repeated
    // chapter updates never start the same topic twice.
    if (appliedTopicKey.current === key) return;
    const item = chapters
      .find((chapter) => chapter.domain === route.domain)
      ?.items.find((candidate) => candidate.skillCode === route.skill);
    if (item?.availability === 'offered' && item.action) {
      appliedTopicKey.current = key;
      // Returning to the very topic session that is already loaded keeps its
      // draft, tutor and check state; a different or failed session is
      // requested again from the server.
      const loadedSameSession =
        sessionState?.program === program &&
        sessionState.origin === 'topic' &&
        sessionState.status === 'ready' &&
        sessionState.data?.content.id === item.action.contentId &&
        mode === item.action.kind;
      if (!loadedSameSession) startActivity(item.action.contentId, item.action.kind, 'topic');
    }
  }, [
    urlReady,
    route,
    progress,
    chapters,
    planListsSettled,
    startActivity,
    sessionState,
    mode,
    program,
  ]);

  useEffect(() => {
    if (!pendingFocus) return;
    const target = document.getElementById(
      pendingFocus === 'overview' ? 'course-overview-heading' : 'topic-heading',
    );
    if (target) {
      target.focus();
      setPendingFocus(undefined);
    }
  }, [pendingFocus, chapters, route, activeSkillCode, sessionStatus]);

  const navigate = useCallback((next: CourseRoute, focus?: FocusTarget) => {
    window.history.pushState(null, '', buildCourseHref(next));
    setLinkRejected(false);
    setError('');
    setRoute(next);
    setPendingFocus(focus);
  }, []);

  const handleSelectItem = useCallback(
    (domain: string, skillCode: string, focus?: FocusTarget) => {
      setActiveDomain(domain);
      setActiveSkillCode(skillCode);
      const alreadyHere =
        route.kind === 'topic' && route.domain === domain && route.skill === skillCode;
      if (!alreadyHere) {
        navigate({ kind: 'topic', program, domain, skill: skillCode }, focus);
      }
      const chapter = chapters.find((candidate) => candidate.domain === domain);
      const item = chapter?.items.find((candidate) => candidate.skillCode === skillCode);
      if (item?.action) {
        appliedTopicKey.current = `${program}|${domain}|${skillCode}`;
        startActivity(item.action.contentId, item.action.kind, 'topic');
      } else {
        appliedTopicKey.current = undefined;
      }
    },
    [chapters, navigate, program, route, startActivity],
  );

  const openOverview = useCallback(
    (domain?: string) => navigate({ kind: 'overview', program, domain }, 'overview'),
    [navigate, program],
  );

  const handleProgramChange = useCallback(
    (next: string) => {
      if (!isAvailableProgram(next) || next === program) return;
      setActiveDomain(undefined);
      setActiveSkillCode(undefined);
      appliedTopicKey.current = undefined;
      navigate(
        route.kind === 'overview'
          ? { kind: 'overview', program: next }
          : { kind: 'default', program: next },
      );
    },
    [navigate, program, route.kind],
  );

  const submitEndpoint: Record<ActivityMode, string> = {
    practice: '/api/phase1/attempt',
    diagnostic: '/api/phase1/diagnostic-attempt',
    review: '/api/phase1/review-attempt',
  };

  async function submitAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setError('');
    if (!response.trim()) {
      setError('Enter an answer before submitting.');
      responseInputRef.current?.focus();
      return;
    }
    const result = await fetch(submitEndpoint[mode], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, learnerResponse: response }),
    });
    if (!result.ok) {
      setError('That answer could not be submitted. Check your connection and try again.');
      responseInputRef.current?.focus();
      return;
    }
    setAttempt(await result.json());
    if (mode === 'diagnostic') {
      // A diagnostic item is a single independent probe with no tutoring
      // loop - once it's answered, refresh both lists so the assessed
      // skill drops out of the placement queue and the regular plan
      // reflects the new (still-unconfirmed) mastery estimate.
      loadDiagnosticPlan(program);
      loadPlan(program);
    }
    if (mode === 'review') {
      // A review is also a single independent probe - refresh the queue
      // (it drops off whether it passed or, on decay, comes back later)
      // and the plan (a failed review can send the skill back to practice).
      loadReviewQueue(program);
      loadPlan(program);
    }
    if (mode === 'review' || mode === 'diagnostic') {
      // Both are the only paths that can move a skill's confirmed status,
      // so both are the only paths that need to refresh the progress view.
      loadProgress(program);
    }
  }

  async function requestHint() {
    if (!attempt || hintPending) return;
    setHintPending(true);
    try {
      const result = await fetch('/api/phase1/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.attemptId,
          learnerMessage: response,
        }),
      });
      if (!result.ok) {
        setError('The tutor could not respond.');
        return;
      }
      setTutor(await result.json());
      setHintCount((count) => count + 1);
    } finally {
      setHintPending(false);
    }
  }

  async function submitIndependentCheck() {
    if (!session) return;
    const result = await fetch('/api/phase1/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, learnerResponse: response }),
    });
    if (!result.ok) {
      setError('Complete a tutor step before starting an independent check.');
      return;
    }
    const checkResult: AttemptResult = await result.json();
    setCheck(checkResult);
    if (checkResult.correctness === 'CORRECT') {
      setSessionState((current) =>
        current?.data ? { ...current, data: { ...current.data, completed: true } } : current,
      );
    }
    loadPlan(program);
    loadProgress(program);
    loadCourseProgress();
  }

  if (!urlReady)
    return (
      <main>
        <h1 className="visually-hidden">Learning Forge — learner session</h1>
        <p>Loading the synthetic learner session…</p>
      </main>
    );

  const programLabel = PROGRAM_ROSTER.find((entry) => entry.code === program)?.label ?? program;
  const inOverview = route.kind === 'overview';
  const activeChapter = chapters.find((chapter) => chapter.domain === activeDomain);
  const activeItem = activeChapter?.items.find((item) => item.skillCode === activeSkillCode);
  const nextChapter = activeDomain
    ? chapters.find((chapter) => chapter.domain === nextChapterDomain(chapters, activeDomain))
    : undefined;
  // A session the server already authorized (loaded or resumed) is shown
  // whenever it matches the focused skill. The plan is advisory and never
  // hides it; the plan only decides whether a NEW topic session is requested.
  const showActivity = session !== undefined && activeSkillCode === session.content.skillCode;

  const retryActivity = () => {
    const last = lastActivityRequest.current;
    startActivity(last.contentId, last.mode, last.origin);
  };

  const dataProblem = [progressResource, planResource, diagnosticResource, reviewResource].some(
    (resource) => resource.status === 'error',
  );

  const pilotProgressPanel =
    progressionReleaseGateOpen && courseProgress && activeChapter?.domain === PILOT_UNIT_DOMAIN ? (
      <section aria-labelledby="course-progress-heading" className="pilot-progress-panel">
        <h3 id="course-progress-heading">Course progress</h3>
        <p>
          <small>
            Completion and mastery are tracked separately. Assessment results appear here only after
            they are recorded.
          </small>
        </p>
        {courseProgress.units.map((unit) => (
          <article key={unit.code} aria-labelledby={`${unit.code}-heading`}>
            <h4 id={`${unit.code}-heading`}>{unit.title}</h4>
            <p>Unit status: {unit.status.toLocaleLowerCase().replaceAll('_', ' ')}</p>
            <ol>
              {unit.lessons.map((lesson) => (
                <li key={lesson.code}>
                  <strong>{lesson.title}</strong> —{' '}
                  {lesson.completionStatus.toLocaleLowerCase().replaceAll('_', ' ')}
                  {lesson.remediationStatus !== 'NONE' && (
                    <span>
                      {' '}
                      ({lesson.remediationStatus.toLocaleLowerCase().replaceAll('_', ' ')})
                    </span>
                  )}
                  {lesson.latestAssessment && (
                    <span>
                      {' '}
                      Latest assessment: {lesson.latestAssessment.outcome.toLocaleLowerCase()}.
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    ) : undefined;

  const topicCrumbs = activeChapter
    ? [
        {
          label: programLabel,
          href: buildCourseHref({ kind: 'overview', program }),
          onNavigate: () => openOverview(),
        },
        {
          label: activeChapter.label,
          href: buildCourseHref({ kind: 'overview', program, domain: activeChapter.domain }),
          onNavigate: () => openOverview(activeChapter.domain),
        },
        { label: activeItem?.title ?? activeChapter.label },
      ]
    : [];

  let content;
  if (!progress && progressResource.status === 'error') {
    content = (
      <div role="alert" className="course-state">
        <p>The course could not be loaded.</p>
        <button type="button" onClick={reloadCourseData}>
          Try again
        </button>
      </div>
    );
  } else if (!progress) {
    content = <p role="status">Loading your chapters…</p>;
  } else if (chapters.length === 0) {
    content = <p role="status">This course has no topics to show yet.</p>;
  } else if (inOverview) {
    content = (
      <CourseOverview
        program={program}
        programLabel={programLabel}
        chapters={chapters}
        focusDomain={route.kind === 'overview' ? route.domain : undefined}
        planUnavailable={plan === undefined}
        onOpenTopic={(domain, skillCode) => handleSelectItem(domain, skillCode, 'topic')}
        onOpenChapter={(domain) => openOverview(domain)}
        onOpenCourse={() => openOverview()}
      />
    );
  } else if (activeChapter) {
    content = (
      <ChapterView
        chapter={activeChapter}
        nextChapter={nextChapter}
        activeSkillCode={activeSkillCode}
        showActivity={showActivity}
        onSelectItem={handleSelectItem}
        pilotProgress={pilotProgressPanel}
        breadcrumb={<CourseBreadcrumb crumbs={topicCrumbs} />}
        topicDetail={activeItem ? <TopicDetail item={activeItem} chapters={chapters} /> : undefined}
        activityStatus={sessionStatus === 'error' ? 'error' : 'loading'}
        onRetryActivity={retryActivity}
      >
        {session && (
          <ActivityPanel
            session={session}
            mode={mode}
            response={response}
            setResponse={setResponse}
            error={error}
            setError={setError}
            attempt={attempt}
            tutor={tutor}
            check={check}
            hintCount={hintCount}
            hintPending={hintPending}
            hintButtonRef={hintButtonRef}
            responseInputRef={responseInputRef}
            onSubmitAttempt={submitAttempt}
            onRequestHint={requestHint}
            onSubmitIndependentCheck={submitIndependentCheck}
          />
        )}
      </ChapterView>
    );
  } else if (sessionStatus === 'error') {
    content = (
      <div role="alert" className="course-state">
        <p>The learning activity could not be loaded.</p>
        <button type="button" onClick={retryActivity}>
          Try again
        </button>
      </div>
    );
  } else {
    content = <p role="status">Loading your chapters…</p>;
  }

  return (
    <main>
      <h1 className="visually-hidden">Learning Forge — learner session</h1>
      <header>
        <div className="brand">
          Learning Forge
          <small>Local synthetic session</small>
        </div>
        <nav aria-label="Primary navigation">
          <Link href="/parent">Parent evidence</Link>
          <Link href="/resources">Curriculum resources</Link>
          <Link href="/help">Help</Link>
        </nav>
      </header>
      <div className="learner-shell">
        <ChapterSidebar
          program={program}
          onProgramChange={handleProgramChange}
          chapters={chapters}
          activeDomain={activeDomain}
          activeSkillCode={inOverview ? undefined : activeSkillCode}
          onSelectItem={handleSelectItem}
        />
        <div className="chapter-view-wrapper">
          <div className="course-toolbar">
            <button
              type="button"
              className="course-overview-button"
              aria-current={inOverview ? 'page' : undefined}
              onClick={() => openOverview()}
            >
              Course overview
            </button>
          </div>
          {linkRejected && (
            <p role="status" className="route-notice">
              That link was not recognized for this course, so the course overview is shown.
            </p>
          )}
          {dataProblem && progress && (
            <div role="alert" className="course-state">
              <p>
                Some course information could not be loaded or refreshed. Topic availability and
                progress may be missing or out of date.
              </p>
              <button type="button" onClick={reloadCourseData}>
                Reload course information
              </button>
            </div>
          )}
          {progress && progress.recentStrengths.length > 0 && (
            <details className="recent-strengths">
              <summary>Recent strengths ({progress.recentStrengths.length})</summary>
              <ul>
                {progress.recentStrengths.map((strength) => (
                  <li key={strength.attemptId}>
                    {strength.skillTitle} — confirmed independently on{' '}
                    {new Date(strength.achievedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {content}
        </div>
      </div>
    </main>
  );
}
