'use client';

import Link from 'next/link';

// The error object is intentionally never rendered or logged here: its message
// could carry file paths, and the index must not show an empty list as if it
// had loaded successfully.
export default function ResourcesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="resources-main">
      <h1>Curriculum resources</h1>
      <div role="alert">
        <p>
          The curriculum resources could not be loaded. Nothing has been lost; this reference list
          is read-only. Please try again, and ask an adult if it keeps happening.
        </p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>{' '}
        <Link href="/">Back to the learner session</Link>
      </div>
    </main>
  );
}
