'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import {
  ActivityPanel,
  type ActivityMode,
  type AttemptResult,
  type Session,
  type TutorResult,
} from './components/activity-panel';
import { ChapterSidebar } from './components/chapter-sidebar';
import { ChapterView } from './components/chapter-view';
import {
  buildChapters,
  chapterForSkill,
  nextChapterDomain,
  type DiagnosticPlan,
  type LearnerProgress,
  type Plan,
  type ReviewQueue,
} from './learner-chapters';

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

const progressionReleaseGateOpen =
  process.env.NEXT_PUBLIC_COURSE_PROGRESSION_RELEASE_GATE_OPEN === 'true';

// The pilot Program -> Unit -> Lesson structure (docs/course-progression-handoff.md)
// is only authored for this one domain so far. Shown as an enrichment inside
// that chapter when the release gate is open; unrelated to chapter grouping.
const PILOT_UNIT_DOMAIN = 'ratios-and-proportional-reasoning';

export default function Home() {
  const [program, setProgram] = useState('grade-6-math');
  const [session, setSession] = useState<Session>();
  const [response, setResponse] = useState('');
  const [attempt, setAttempt] = useState<AttemptResult>();
  const [tutor, setTutor] = useState<TutorResult>();
  const [hintCount, setHintCount] = useState(0);
  const [check, setCheck] = useState<AttemptResult>();
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<Plan>();
  const [diagnosticPlan, setDiagnosticPlan] = useState<DiagnosticPlan>();
  const [reviewQueue, setReviewQueue] = useState<ReviewQueue>();
  const [progress, setProgress] = useState<LearnerProgress>();
  const [courseProgress, setCourseProgress] = useState<CourseProgress>();
  const [mode, setMode] = useState<ActivityMode>('practice');
  const [hintPending, setHintPending] = useState(false);
  const [activeDomain, setActiveDomain] = useState<string>();
  const [activeSkillCode, setActiveSkillCode] = useState<string>();
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const responseInputRef = useRef<HTMLInputElement>(null);
  const selectedProgramRef = useRef(program);
  selectedProgramRef.current = program;

  useEffect(() => {
    // Disabling the button while a hint request is in flight drops keyboard
    // focus (browsers blur a disabled element). Restore it once the button
    // is interactive again, so a keyboard user isn't silently dropped back
    // to the document body.
    if (!hintPending) hintButtonRef.current?.focus();
  }, [hintPending]);

  const loadPlan = useCallback(() => {
    fetch(`/api/phase1/plan?program=${encodeURIComponent(program)}`)
      .then(async (result) => {
        if (!result.ok) return;
        const loaded = await result.json();
        if (selectedProgramRef.current === program) setPlan(loaded);
      })
      .catch(() => undefined);
  }, [program]);

  const loadDiagnosticPlan = useCallback(() => {
    fetch(`/api/phase1/diagnostic?program=${encodeURIComponent(program)}`)
      .then(async (result) => {
        if (!result.ok) return;
        const loaded = await result.json();
        if (selectedProgramRef.current === program) setDiagnosticPlan(loaded);
      })
      .catch(() => undefined);
  }, [program]);

  const loadReviewQueue = useCallback(() => {
    fetch(`/api/phase1/review?program=${encodeURIComponent(program)}`)
      .then(async (result) => {
        if (!result.ok) return;
        const loaded = await result.json();
        if (selectedProgramRef.current === program) setReviewQueue(loaded);
      })
      .catch(() => undefined);
  }, [program]);

  const loadProgress = useCallback(() => {
    fetch(`/api/phase1/progress?program=${encodeURIComponent(program)}`)
      .then(async (result) => {
        if (!result.ok) return;
        const loaded = await result.json();
        if (selectedProgramRef.current === program) setProgress(loaded);
      })
      .catch(() => undefined);
  }, [program]);

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
    (contentId?: string, activityMode: ActivityMode = 'practice') => {
      setError('');
      setAttempt(undefined);
      setTutor(undefined);
      setHintCount(0);
      setCheck(undefined);
      setResponse('');
      setMode(activityMode);
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
          const loaded: Session = await result.json();
          if (selectedProgramRef.current !== program) return;
          setSession(loaded);
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
        .catch((reason: Error) => setError(reason.message));
    },
    [program],
  );

  useEffect(() => {
    startActivity();
    loadPlan();
    loadDiagnosticPlan();
    loadReviewQueue();
    loadProgress();
    loadCourseProgress();
  }, [
    loadCourseProgress,
    loadDiagnosticPlan,
    loadPlan,
    loadProgress,
    loadReviewQueue,
    startActivity,
  ]);

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
    if (chapters.length === 0 || !session) return;
    if (activeDomain && chapters.some((chapter) => chapter.domain === activeDomain)) return;
    const chapter = chapterForSkill(chapters, session.content.skillCode);
    if (chapter) {
      setActiveDomain(chapter.domain);
      setActiveSkillCode(session.content.skillCode);
    }
  }, [session, chapters, activeDomain]);

  const handleSelectItem = useCallback(
    (domain: string, skillCode: string) => {
      setActiveDomain(domain);
      setActiveSkillCode(skillCode);
      const chapter = chapters.find((candidate) => candidate.domain === domain);
      const item = chapter?.items.find((candidate) => candidate.skillCode === skillCode);
      if (item?.action) startActivity(item.action.contentId, item.action.kind);
    },
    [chapters, startActivity],
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
      loadDiagnosticPlan();
      loadPlan();
    }
    if (mode === 'review') {
      // A review is also a single independent probe - refresh the queue
      // (it drops off whether it passed or, on decay, comes back later)
      // and the plan (a failed review can send the skill back to practice).
      loadReviewQueue();
      loadPlan();
    }
    if (mode === 'review' || mode === 'diagnostic') {
      // Both are the only paths that can move a skill's confirmed status,
      // so both are the only paths that need to refresh the progress view.
      loadProgress();
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
      setSession((current) => (current ? { ...current, completed: true } : current));
    }
    loadPlan();
    loadProgress();
    loadCourseProgress();
  }

  if (error && !session)
    return (
      <main>
        <h1 className="visually-hidden">Learning Forge — learner session</h1>
        <p role="alert">{error}</p>
      </main>
    );
  if (!session)
    return (
      <main>
        <h1 className="visually-hidden">Learning Forge — learner session</h1>
        <p>Loading the synthetic learner session…</p>
      </main>
    );

  const activeChapter = chapters.find((chapter) => chapter.domain === activeDomain);
  const nextChapter = activeDomain
    ? chapters.find((chapter) => chapter.domain === nextChapterDomain(chapters, activeDomain))
    : undefined;
  // The loaded session is shown whenever it matches the focused skill,
  // regardless of whether that skill has a queued plan/diagnostic/review
  // action - a direct-started or already-mastered skill is still real,
  // workable content.
  const showActivity = activeSkillCode === session.content.skillCode;

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
          onProgramChange={setProgram}
          chapters={chapters}
          activeDomain={activeDomain}
          activeSkillCode={activeSkillCode}
          onSelectItem={handleSelectItem}
        />
        <div className="chapter-view-wrapper">
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
          {activeChapter ? (
            <ChapterView
              chapter={activeChapter}
              nextChapter={nextChapter}
              activeSkillCode={activeSkillCode}
              showActivity={showActivity}
              onSelectItem={handleSelectItem}
              pilotProgress={pilotProgressPanel}
            >
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
            </ChapterView>
          ) : (
            <p>Loading your chapters…</p>
          )}
        </div>
      </div>
    </main>
  );
}
