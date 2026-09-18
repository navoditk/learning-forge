'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { ProgramSwitcher } from '../components/program-switcher';

const DELETION_CONFIRMATION_PHRASE = 'DELETE';

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
  const [exportError, setExportError] = useState('');
  const [exportPending, setExportPending] = useState(false);
  const [deletionConfirmationText, setDeletionConfirmationText] = useState('');
  const [deletionError, setDeletionError] = useState('');
  const [deletionPending, setDeletionPending] = useState(false);
  const [deletionComplete, setDeletionComplete] = useState(false);

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

  async function handleExportHouseholdData() {
    setExportError('');
    setExportPending(true);
    try {
      const result = await fetch('/api/phase1/household/export');
      if (!result.ok) throw new Error('Export failed');
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);
      const disposition = result.headers.get('Content-Disposition') ?? '';
      const fileNameMatch = disposition.match(/filename="([^"]+)"/);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameMatch?.[1] ?? 'learning-forge-export.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('The data export could not be downloaded. Please try again.');
    } finally {
      setExportPending(false);
    }
  }

  async function handleDeleteHouseholdData() {
    setDeletionError('');
    setDeletionPending(true);
    try {
      const result = await fetch('/api/phase1/household/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deletionConfirmationText }),
      });
      if (!result.ok) {
        const body = await result.json().catch(() => ({}));
        setDeletionError(body.error ?? 'The household could not be deleted. Please try again.');
        return;
      }
      setDeletionComplete(true);
      await signOut({ callbackUrl: '/login' });
    } catch {
      setDeletionError('The household could not be deleted. Please try again.');
    } finally {
      setDeletionPending(false);
    }
  }

  return (
    <main>
      <header>
        <div className="brand">
          Learning Forge
          <small>Parent view</small>
        </div>
        <ProgramSwitcher />
        <nav aria-label="Primary navigation">
          <Link href="/">Back to learner session</Link>
          <Link href="/help">Help</Link>
        </nav>
      </header>
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
      <section aria-labelledby="data-controls-heading">
        <h2 id="data-controls-heading">Your data</h2>
        <p>
          Everything below acts on your household&apos;s full data: every learner profile, attempt,
          session, mastery estimate, and tutor trace. Nothing here affects other households.
        </p>
        <h3>Export</h3>
        <p>Download a complete copy of your household&apos;s data as a JSON file.</p>
        <button type="button" onClick={handleExportHouseholdData} disabled={exportPending}>
          {exportPending ? 'Preparing export…' : 'Download my data'}
        </button>
        {exportError && <p role="alert">{exportError}</p>}
        <h3>Delete everything</h3>
        <p>
          This permanently deletes your household&apos;s account and all learner data. It cannot be
          undone. Type <strong>{DELETION_CONFIRMATION_PHRASE}</strong> below to confirm.
        </p>
        {deletionComplete ? (
          <p role="status">Your household data has been deleted. Signing you out…</p>
        ) : (
          <>
            <label htmlFor="deletion-confirmation">
              Type &quot;{DELETION_CONFIRMATION_PHRASE}&quot; to confirm
            </label>
            <input
              id="deletion-confirmation"
              type="text"
              value={deletionConfirmationText}
              onChange={(event) => setDeletionConfirmationText(event.target.value)}
              aria-invalid={deletionError ? 'true' : undefined}
              aria-describedby={deletionError ? 'deletion-error' : undefined}
            />
            <button
              type="button"
              onClick={handleDeleteHouseholdData}
              disabled={
                deletionPending || deletionConfirmationText !== DELETION_CONFIRMATION_PHRASE
              }
            >
              {deletionPending ? 'Deleting…' : 'Permanently delete my household data'}
            </button>
            {deletionError && (
              <p role="alert" id="deletion-error">
                {deletionError}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
