import { FormEvent, RefObject } from 'react';
import Image from 'next/image';

import { svgDataUri, type ContentFigure } from '../../content/figure';
import type { ResponseSpec, StructuredErrorState, StructuredValues } from '../learner-data';
import type { CodeListing } from '../../contracts/python';
import { CodeListingView } from './code-listing';
import { StructuredResponseFields } from './structured-response-fields';

export type Session = {
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
    skillCode: string;
    // Server-derived; false hides the hint control (SP-2 H-2). Absent means available.
    modelHintsAvailable?: boolean;
    prompt: string;
    accessibilityNotes: string;
    figure?: ContentFigure;
    // Present only when the server declares a structured item (contract 3.2).
    responseSpec?: ResponseSpec;
    accessibleAlternative?: string;
    // Python intro predict-the-output items only (C7).
    answerKind?: 'python_output';
    codeListing?: CodeListing;
  };
};

export type AttemptResult = { attemptId: string; correctness: string };
export type TutorResult = {
  response: {
    status: string;
    fallbackMessage?: string;
    move?: { learnerMessage: string; question: string };
  };
};

export type ActivityMode = 'practice' | 'diagnostic' | 'review';

export function ActivityPanel({
  session,
  mode,
  response,
  setResponse,
  error,
  setError,
  attempt,
  tutor,
  check,
  hintCount,
  hintPending,
  hintButtonRef,
  responseInputRef,
  pythonResponseRef,
  fieldValues,
  onFieldChange,
  structuredError,
  summaryRef,
  pendingAction,
  onSubmitAttempt,
  onRequestHint,
  onSubmitIndependentCheck,
}: {
  session: Session;
  mode: ActivityMode;
  response: string;
  setResponse: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  attempt?: AttemptResult;
  tutor?: TutorResult;
  check?: AttemptResult;
  hintCount: number;
  hintPending: boolean;
  hintButtonRef: RefObject<HTMLButtonElement | null>;
  responseInputRef: RefObject<HTMLInputElement | null>;
  pythonResponseRef: RefObject<HTMLTextAreaElement | null>;
  fieldValues: StructuredValues;
  onFieldChange: (key: string, value: string) => void;
  structuredError?: StructuredErrorState;
  summaryRef: RefObject<HTMLDivElement | null>;
  pendingAction?: 'submit' | 'check';
  onSubmitAttempt: (event: FormEvent<HTMLFormElement>) => void;
  onRequestHint: () => void;
  onSubmitIndependentCheck: () => void;
}) {
  const spec = session.content.responseSpec;
  const pythonListing =
    session.content.answerKind === 'python_output' ? session.content.codeListing : undefined;
  const hintsUnavailable = session.content.modelHintsAvailable === false;
  return (
    <article className="activity-panel" aria-labelledby="activity-heading">
      <h3 id="activity-heading">{session.content.title}</h3>
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
      {session.content.accessibleAlternative && (
        <section className="text-alternative" aria-labelledby="text-alternative-heading">
          <h4 id="text-alternative-heading">Text version of this question</h4>
          <p>{session.content.accessibleAlternative}</p>
        </section>
      )}
      <p>
        <small>{session.content.accessibilityNotes}</small>
      </p>
      {pythonListing && <CodeListingView listing={pythonListing} title={session.content.title} />}
      {pythonListing ? (
        <form onSubmit={onSubmitAttempt} aria-busy={pendingAction ? true : undefined} noValidate>
          <label htmlFor="python-output-response">What does this program print?</label>
          <p id="python-output-guidance" className="field-hint">
            Type exactly what is printed. Put each printed line on its own line, with no extra
            spaces. Capital letters and punctuation count.
          </p>
          <textarea
            id="python-output-response"
            name="learnerResponse"
            ref={pythonResponseRef}
            className="python-output-input"
            rows={5}
            value={response}
            onChange={(event) => {
              setResponse(event.target.value);
              if (error) setError('');
            }}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? 'python-output-guidance learner-response-error' : 'python-output-guidance'
            }
          />
          <button type="submit" aria-disabled={pendingAction ? true : undefined}>
            {pendingAction === 'submit' ? 'Submitting…' : 'Submit answer'}
          </button>
        </form>
      ) : spec ? (
        <form onSubmit={onSubmitAttempt} aria-busy={pendingAction ? true : undefined} noValidate>
          <StructuredResponseFields
            spec={spec}
            title={session.content.title}
            values={fieldValues}
            onChange={onFieldChange}
            errors={structuredError}
            summaryRef={summaryRef}
          />
          <button type="submit" aria-disabled={pendingAction ? true : undefined}>
            {pendingAction === 'submit' ? 'Submitting…' : 'Submit answer'}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitAttempt}>
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
            // D-134: a spelling answer must not be autocorrected, capitalised or spellchecked.
            {...(session.content.skillCode.startsWith('snsb6-')
              ? { autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false }
              : {})}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'learner-response-error' : undefined}
          />
          <button type="submit" aria-disabled={pendingAction ? true : undefined}>
            {pendingAction === 'submit' ? 'Submitting…' : 'Submit answer'}
          </button>
        </form>
      )}
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
          {!pythonListing && hintsUnavailable && (
            <p>
              <small>Hints are not available for this activity yet.</small>
            </p>
          )}
          {!pythonListing && !hintsUnavailable && (
            <button
              ref={hintButtonRef}
              type="button"
              onClick={onRequestHint}
              disabled={hintPending}
            >
              {hintPending
                ? 'Thinking…'
                : hintCount === 0
                  ? 'Ask for a small hint'
                  : 'Ask for the next hint'}
            </button>
          )}
          {!pythonListing && !hintsUnavailable && hintCount === 0 && !tutor && (
            <p>
              <small>
                The hint comes from a computer program, not a person. If anything ever feels wrong
                or upsetting, tell a grown-up.
              </small>
            </p>
          )}
          {tutor && (
            <button
              type="button"
              onClick={onSubmitIndependentCheck}
              aria-disabled={pendingAction ? true : undefined}
            >
              {pendingAction === 'check' ? 'Checking…' : 'Start independent check'}
            </button>
          )}
          {check && (
            <p>Independent check: {check.correctness === 'CORRECT' ? 'correct.' : 'not yet.'}</p>
          )}
        </div>
      )}
      {tutor && mode === 'practice' && (
        <aside aria-labelledby="tutor-heading">
          <h3 id="tutor-heading">
            Tutor <small>(an AI, not a real person)</small>
          </h3>
          <p>{tutor.response.move?.learnerMessage ?? tutor.response.fallbackMessage}</p>
          {tutor.response.move && (
            <p>
              <strong>Try this:</strong> {tutor.response.move.question}
            </p>
          )}
        </aside>
      )}
    </article>
  );
}
