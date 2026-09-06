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

type DigestSkillSummary = {
  skillCode: string;
  attemptCount: number;
  correctCount: number;
  independentAttemptCount: number;
};

type Digest = {
  headline: string;
  totalAttempts: number;
  totalCorrect: number;
  skills: DigestSkillSummary[];
};

export default function ParentPage() {
  const [evidence, setEvidence] = useState<Evidence>();
  const [error, setError] = useState('');
  const [digest, setDigest] = useState<Digest>();
  const [digestError, setDigestError] = useState('');

  useEffect(() => {
    fetch('/api/phase1/parent')
      .then(async (result) => {
        if (!result.ok) throw new Error('Evidence could not be loaded.');
        setEvidence(await result.json());
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function loadDigest() {
    setDigestError('');
    const result = await fetch('/api/phase1/digest');
    if (!result.ok) {
      setDigestError('The weekly digest could not be loaded.');
      return;
    }
    const body = await result.json();
    setDigest(body.digest);
  }

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
      <section aria-labelledby="digest-heading">
        <h2 id="digest-heading">Weekly digest</h2>
        <button type="button" onClick={loadDigest}>
          Get weekly digest
        </button>
        {digestError && <p role="alert">{digestError}</p>}
        {digest && (
          <div role="status">
            <p>{digest.headline}</p>
            {digest.skills.length > 0 && (
              <ul>
                {digest.skills.map((skill) => (
                  <li key={skill.skillCode}>
                    {skill.skillCode}: {skill.attemptCount} attempt
                    {skill.attemptCount === 1 ? '' : 's'}, {skill.correctCount} correct,{' '}
                    {skill.independentAttemptCount} without tutor assistance
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
