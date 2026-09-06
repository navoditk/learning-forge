'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type MasteryRow = {
  skillCode: string;
  estimate: number;
  confidenceBand: string;
  independentDelayedCheck: boolean;
};

type Evidence = {
  learnerName: string;
  attempts: Array<{
    id: string;
    contentKey: string;
    correctness: string;
    highestAssistance: string;
  }>;
  mastery: MasteryRow[];
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
          <h3>Mastery by skill</h3>
          {evidence.mastery.length === 0 ? (
            <p>No mastery evidence yet.</p>
          ) : (
            <ul>
              {evidence.mastery.map((row) => (
                <li key={row.skillCode}>
                  Skill: {row.skillCode} — estimate {row.estimate}, confidence{' '}
                  {row.confidenceBand.toLocaleLowerCase()}.{' '}
                  {row.independentDelayedCheck
                    ? 'Delayed check complete.'
                    : 'Delayed check still needed.'}
                </li>
              ))}
            </ul>
          )}
          <h3>Recent attempts</h3>
          {evidence.attempts.length === 0 ? (
            <p>No attempts yet.</p>
          ) : (
            <ul>
              {evidence.attempts.map((attempt) => (
                <li key={attempt.id}>
                  {attempt.contentKey}: {attempt.correctness.toLocaleLowerCase()} with{' '}
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
