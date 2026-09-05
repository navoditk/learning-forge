'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Evidence = {
  learnerName: string;
  skill: string;
  attempts: Array<{ id: string; correctness: string; highestAssistance: string }>;
  mastery?: { estimate: number; confidenceBand: string; independentDelayedCheck: boolean };
};

export default function ParentPage() {
  const [evidence, setEvidence] = useState<Evidence>();
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/phase1/parent')
      .then(async (result) => {
        if (!result.ok) throw new Error('Evidence could not be loaded.');
        setEvidence(await result.json());
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  return (
    <main>
      <p>
        <Link href="/">Back to learner session</Link>
      </p>
      <h1>Parent evidence</h1>
      {error && <p role="alert">{error}</p>}
      {!evidence && !error && <p>Loading evidence…</p>}
      {evidence && (
        <section aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">{evidence.learnerName}</h2>
          <p>Skill: {evidence.skill}</p>
          <p>
            Evidence estimate: {evidence.mastery?.estimate ?? 0}. Confidence:{' '}
            {evidence.mastery?.confidenceBand ?? 'LOW'}.
            {evidence.mastery?.independentDelayedCheck
              ? ' Delayed check complete.'
              : ' Delayed check still needed.'}
          </p>
          <h3>Recent attempts</h3>
          {evidence.attempts.length === 0 ? (
            <p>No attempts yet.</p>
          ) : (
            <ul>
              {evidence.attempts.map((attempt) => (
                <li key={attempt.id}>
                  Attempt {attempt.id}: {attempt.correctness.toLocaleLowerCase()} with{' '}
                  {attempt.highestAssistance.toLocaleLowerCase().replaceAll('_', ' ')} assistance
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
