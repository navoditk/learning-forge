'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

type Session = {
  sessionId: string;
  learner: { displayName: string };
  content: { title: string; prompt: string; accessibilityNotes: string };
};

type AttemptResult = { attemptId: string; correctness: string };
type TutorResult = {
  response: {
    status: string;
    fallbackMessage?: string;
    move?: { learnerMessage: string; question: string };
  };
};

export default function Home() {
  const [session, setSession] = useState<Session>();
  const [response, setResponse] = useState('');
  const [attempt, setAttempt] = useState<AttemptResult>();
  const [tutor, setTutor] = useState<TutorResult>();
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/phase1/session')
      .then(async (result) => {
        if (!result.ok) throw new Error('Session could not be loaded.');
        setSession(await result.json());
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function submitAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setError('');
    const result = await fetch('/api/phase1/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, learnerResponse: response }),
    });
    if (!result.ok) {
      setError('Please enter an answer before submitting.');
      return;
    }
    setAttempt(await result.json());
  }

  async function requestHint() {
    if (!attempt) return;
    const result = await fetch('/api/phase1/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: attempt.attemptId,
        learnerMessage: response,
        state: 'awaiting_attempt',
        priorHintCount: 0,
        attemptNumber: 1,
      }),
    });
    if (!result.ok) {
      setError('The tutor could not respond.');
      return;
    }
    setTutor(await result.json());
  }

  if (error && !session)
    return (
      <main>
        <p role="alert">{error}</p>
      </main>
    );
  if (!session)
    return (
      <main>
        <p>Loading the synthetic learner session…</p>
      </main>
    );

  return (
    <main>
      <header>
        <p>
          <strong>Learning Forge</strong> · local synthetic session
        </p>
        <nav aria-label="Primary navigation">
          <Link href="/parent">Parent evidence</Link>
        </nav>
      </header>
      <section aria-labelledby="session-heading">
        <h1 id="session-heading">{session.content.title}</h1>
        <p>Learner: {session.learner.displayName}</p>
        <p>{session.content.prompt}</p>
        <p>
          <small>{session.content.accessibilityNotes}</small>
        </p>
        <form onSubmit={submitAttempt}>
          <label htmlFor="learner-response">Your answer</label>
          <input
            id="learner-response"
            name="learnerResponse"
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            autoComplete="off"
          />
          <button type="submit">Submit answer</button>
        </form>
        {error && <p role="alert">{error}</p>}
        {attempt && (
          <div role="status" aria-live="polite">
            <p>
              {attempt.correctness === 'CORRECT'
                ? 'Correct — nice work.'
                : 'Not yet. Your attempt is recorded.'}
            </p>
            <button type="button" onClick={requestHint}>
              Ask for a small hint
            </button>
          </div>
        )}
        {tutor && (
          <aside aria-labelledby="tutor-heading">
            <h2 id="tutor-heading">Tutor</h2>
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
