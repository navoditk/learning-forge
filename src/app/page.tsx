'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { svgDataUri, type ContentFigure } from '../content/figure';
import { ProgramSwitcher } from './components/program-switcher';

type Session = {
  sessionId: string;
  resumed: boolean;
  completed: boolean;
  hintCount: number;
  latestAttempt?: { attemptId: string; correctness: string };
  latestCheck?: { attemptId: string; correctness: string };
  learner: { displayName: string };
  content: {
    id: string;
    title: string;
    prompt: string;
    accessibilityNotes: string;
    figure?: ContentFigure;
  };
};

type AttemptResult = { attemptId: string; correctness: string };
type TutorResult = {
  response: {
    status: string;
    fallbackMessage?: string;
    move?: { learnerMessage: string; question: string };
  };
};

type DiagnosticItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
  prompt: string;
};
type DiagnosticPlan = { items: DiagnosticItem[] };

type ReviewItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
  prompt: string;
  dueSince: string;
};
type ReviewQueue = { items: ReviewItem[] };

type SkillProgress = {
  skillCode: string;
  title: string;
  domain: string;
  status: 'NOT_STARTED' | 'PRACTICING' | 'INDEPENDENTLY_CONFIRMED';
  summary: string;
};
type RecentStrength = {
  attemptId: string;
  skillCode: string;
  skillTitle: string;
  achievedAt: string;
};
type NextActivity = {
  contentId: string;
  title: string;
  skillTitle: string;
  reason: string;
};
type LearnerProgress = {
  skills: SkillProgress[];
  recentStrengths: RecentStrength[];
  nextActivity: NextActivity | null;
};

type PlanItem = {
  contentId: string;
  skillCode: string;
  title: string;
  skillTitle: string;
  reason: string;
  estimatedMinutes: number;
};
type Plan = {
  items: PlanItem[];
  totalMinutes: number;
  blockedSkills: string[];
  unavailableSkills: string[];
};

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

type ActivityMode = 'practice' | 'diagnostic' | 'review';

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

  return (
    <main>
      <h1 className="visually-hidden">Learning Forge — learner session</h1>
      <header>
        <div className="brand">
          Learning Forge
          <small>Local synthetic session</small>
        </div>
        <ProgramSwitcher value={program} onChange={setProgram} />
        <nav aria-label="Primary navigation">
          <Link href="/parent">Parent evidence</Link>
          <Link href="/help">Help</Link>
        </nav>
      </header>
      {progress && (
        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading">Your progress</h2>
          {progress.nextActivity && (
            <p>
              <strong>Suggested next:</strong>{' '}
              <button type="button" onClick={() => startActivity(progress.nextActivity!.contentId)}>
                {progress.nextActivity.title}
              </button>{' '}
              ({progress.nextActivity.skillTitle}) — {progress.nextActivity.reason}
            </p>
          )}
          {progress.recentStrengths.length > 0 && (
            <>
              <h3>Recent strengths</h3>
              <ul>
                {progress.recentStrengths.map((strength) => (
                  <li key={strength.attemptId}>
                    {strength.skillTitle} — confirmed independently on{' '}
                    {new Date(strength.achievedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </>
          )}
          <details>
            <summary>Skill-by-skill progress ({progress.skills.length} skills)</summary>
            <ul>
              {progress.skills.map((skill) => (
                <li key={skill.skillCode}>
                  <strong>{skill.title}</strong> ({skill.domain}): {skill.summary}
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}
      {progressionReleaseGateOpen && courseProgress && (
        <section aria-labelledby="course-progress-heading">
          <h2 id="course-progress-heading">Course progress</h2>
          <p>
            <small>
              Completion and mastery are tracked separately. Assessment results appear here only
              after they are recorded.
            </small>
          </p>
          {courseProgress.units.map((unit) => (
            <article key={unit.code} aria-labelledby={`${unit.code}-heading`}>
              <h3 id={`${unit.code}-heading`}>{unit.title}</h3>
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
      )}
      {diagnosticPlan && diagnosticPlan.items.length > 0 && (
        <section aria-labelledby="diagnostic-heading">
          <h2 id="diagnostic-heading">Quick placement check</h2>
          <p>
            <small>
              A few one-question checks to see what you already know, before recommending practice.
            </small>
          </p>
          <ul>
            {diagnosticPlan.items.map((item) => (
              <li key={item.contentId}>
                <button
                  type="button"
                  onClick={() => startActivity(item.contentId, 'diagnostic')}
                  disabled={mode === 'diagnostic' && session?.content.id === item.contentId}
                >
                  {item.title}
                </button>{' '}
                ({item.skillTitle})
              </li>
            ))}
          </ul>
        </section>
      )}
      {reviewQueue && reviewQueue.items.length > 0 && (
        <section aria-labelledby="review-heading">
          <h2 id="review-heading">Review due</h2>
          <p>
            <small>
              A quick independent check on skills you mastered a while ago, to make sure they’ve
              stuck.
            </small>
          </p>
          <ul>
            {reviewQueue.items.map((item) => (
              <li key={item.contentId}>
                <button
                  type="button"
                  onClick={() => startActivity(item.contentId, 'review')}
                  disabled={mode === 'review' && session?.content.id === item.contentId}
                >
                  {item.title}
                </button>{' '}
                ({item.skillTitle})
              </li>
            ))}
          </ul>
        </section>
      )}
      {plan && plan.items.length > 0 && (
        <section aria-labelledby="plan-heading">
          <h2 id="plan-heading">Recommended next activities</h2>
          <p>
            <small>Planned for about {plan.totalMinutes} minutes.</small>
          </p>
          <ul>
            {plan.items.map((item) => (
              <li key={item.contentId}>
                <button
                  type="button"
                  onClick={() => startActivity(item.contentId)}
                  disabled={mode === 'practice' && session?.content.id === item.contentId}
                >
                  {item.title}
                </button>{' '}
                ({item.skillTitle}, {item.estimatedMinutes} min) — {item.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="session-heading">
        <h2 id="session-heading">{session.content.title}</h2>
        <p>Learner: {session.learner.displayName}</p>
        {mode === 'diagnostic' && (
          <p>
            <small>Placement check — answer independently, no hints.</small>
          </p>
        )}
        {mode === 'review' && (
          <p>
            <small>Review check — answer independently, no hints.</small>
          </p>
        )}
        {session.resumed && !session.completed && mode === 'practice' && (
          <p>
            <small>Continuing where you left off.</small>
          </p>
        )}
        {session.completed && (
          <p role="status">Independent check passed — this activity is complete.</p>
        )}
        <p>{session.content.prompt}</p>
        {session.content.figure && (
          <figure className="content-figure">
            <Image
              src={svgDataUri(session.content.figure.svgMarkup)}
              alt={session.content.figure.altText}
              width={session.content.figure.width}
              height={session.content.figure.height}
              unoptimized
            />
            <figcaption>{session.content.figure.caption}</figcaption>
          </figure>
        )}
        <p>
          <small>{session.content.accessibilityNotes}</small>
        </p>
        <form onSubmit={submitAttempt}>
          <label htmlFor="learner-response">Your answer</label>
          <input
            id="learner-response"
            name="learnerResponse"
            ref={responseInputRef}
            value={response}
            onChange={(event) => {
              setResponse(event.target.value);
              if (error) setError('');
            }}
            autoComplete="off"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'learner-response-error' : undefined}
          />
          <button type="submit">Submit answer</button>
        </form>
        {error && (
          <p role="alert" id="learner-response-error">
            {error}
          </p>
        )}
        {attempt && mode === 'diagnostic' && (
          <div role="status" aria-live="polite">
            <p>
              {attempt.correctness === 'CORRECT'
                ? 'Correct — recorded for placement.'
                : 'Not yet — recorded for placement. Regular practice will cover this skill.'}
            </p>
          </div>
        )}
        {attempt && mode === 'review' && (
          <div role="status" aria-live="polite">
            <p>
              {attempt.correctness === 'CORRECT'
                ? 'Correct — this skill is still confirmed.'
                : 'Not yet — this skill has been moved back into regular practice.'}
            </p>
          </div>
        )}
        {attempt && mode === 'practice' && (
          <div role="status" aria-live="polite">
            <p>
              {attempt.correctness === 'CORRECT'
                ? 'Correct — nice work.'
                : 'Not yet. Your attempt is recorded.'}
            </p>
            <button ref={hintButtonRef} type="button" onClick={requestHint} disabled={hintPending}>
              {hintPending
                ? 'Thinking…'
                : hintCount === 0
                  ? 'Ask for a small hint'
                  : 'Ask for the next hint'}
            </button>
            {tutor && (
              <button type="button" onClick={submitIndependentCheck}>
                Start independent check
              </button>
            )}
            {check && (
              <p>Independent check: {check.correctness === 'CORRECT' ? 'correct.' : 'not yet.'}</p>
            )}
          </div>
        )}
        {tutor && mode === 'practice' && (
          <aside aria-labelledby="tutor-heading">
            <h3 id="tutor-heading">Tutor</h3>
            <p>{tutor.response.move?.learnerMessage ?? tutor.response.fallbackMessage}</p>
            {tutor.response.move && (
              <p>
                <strong>Try this:</strong> {tutor.response.move.question}
              </p>
            )}
          </aside>
        )}
      </section>
    </main>
  );
}
