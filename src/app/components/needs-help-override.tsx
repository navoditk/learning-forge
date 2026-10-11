'use client';

import { useId, useRef, useState } from 'react';

type SkillRef = { code: string; version: string };

/**
 * D-70: the parent-facing UI for the step-up + override APIs
 * (`src/app/api/progression/step-up`, `.../override`). Both routes already
 * exist and are release-gated; this is the missing caller, closing C5's
 * "parent-facing screens for the D-70 step-up and override APIs" gap.
 *
 * Two-step by design, matching the server's own two-call contract: a
 * password re-verification that is independent of and must precede the
 * override reason, not a single combined form - so a wrong password never
 * even reaches the override endpoint with a reason attached.
 */
export function NeedsHelpOverride({
  lessonTitle,
  skillRef,
  onApplied,
}: {
  lessonTitle: string;
  skillRef: SkillRef;
  onApplied: () => void;
}) {
  const [step, setStep] = useState<'closed' | 'password' | 'reason'>('closed');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [stepUpToken, setStepUpToken] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [pending, setPending] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  function openPasswordStep() {
    setError('');
    setStatusMessage('');
    setStep('password');
    // Focus moves to the first field of the newly-revealed form (E8).
    requestAnimationFrame(() => passwordInputRef.current?.focus());
  }

  function cancel() {
    setStep('closed');
    setPassword('');
    setReason('');
    setStepUpToken('');
    setError('');
  }

  async function submitPassword() {
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/progression/step-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Password could not be verified.');
        return;
      }
      setStepUpToken(body.stepUpToken);
      setStep('reason');
      requestAnimationFrame(() => reasonInputRef.current?.focus());
    } catch {
      setError('Password could not be verified. Please try again.');
    } finally {
      setPending(false);
    }
  }

  async function submitOverride() {
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/progression/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillCode: skillRef.code,
          skillVersion: skillRef.version,
          reason,
          stepUpToken,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'The override could not be applied.');
        return;
      }
      setStatusMessage(`${lessonTitle} is no longer marked as needing help.`);
      cancel();
      onApplied();
    } catch {
      setError('The override could not be applied. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="needs-help-override">
      {step === 'closed' && (
        <button type="button" onClick={openPasswordStep}>
          Clear &ldquo;needs help&rdquo; for {lessonTitle}
        </button>
      )}
      {step === 'password' && (
        <form
          aria-labelledby={headingId}
          onSubmit={(event) => {
            event.preventDefault();
            void submitPassword();
          }}
        >
          <h4 id={headingId}>Confirm it&apos;s you</h4>
          <p>
            Re-enter your password to clear the &ldquo;needs help&rdquo; state for {lessonTitle}.
          </p>
          <label htmlFor={`${headingId}-password`}>Password</label>
          <input
            ref={passwordInputRef}
            id={`${headingId}-password`}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" disabled={pending || password.length === 0}>
            Continue
          </button>
          <button type="button" onClick={cancel}>
            Cancel
          </button>
        </form>
      )}
      {step === 'reason' && (
        <form
          aria-labelledby={headingId}
          onSubmit={(event) => {
            event.preventDefault();
            void submitOverride();
          }}
        >
          <h4 id={headingId}>Why are you clearing this?</h4>
          <p>
            This removes the &ldquo;needs help&rdquo; state from {lessonTitle} so the learner can
            continue. A reason is required and is kept as a record.
          </p>
          <label htmlFor={`${headingId}-reason`}>Reason</label>
          <input
            ref={reasonInputRef}
            id={`${headingId}-reason`}
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            maxLength={500}
          />
          <button type="submit" disabled={pending || reason.trim().length === 0}>
            Clear &ldquo;needs help&rdquo;
          </button>
          <button type="button" onClick={cancel}>
            Cancel
          </button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      {statusMessage && <p role="status">{statusMessage}</p>}
    </div>
  );
}
