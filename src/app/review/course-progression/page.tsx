import Link from 'next/link';

import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../../curriculum/pilot-catalog';

const gates = [
  {
    label: 'Independent fourth-draft / C1–C3 review',
    status: 'Awaiting independent reviewer',
    owner: 'course-progression-reviewer',
  },
  {
    label: 'Representative C3 shadow-divergence review',
    status: 'Awaiting representative traffic',
    owner: 'Product/engineering owner',
  },
  {
    label: 'Held-out assessment package',
    status: 'Private package not installed',
    owner: 'Product/content owner',
  },
  {
    label: 'Screen-reader review',
    status: 'Product-owner accepted for scoped pilot; evidence assumed',
    owner: 'Product owner',
  },
  {
    label: 'Child-safe wording artifact',
    status: 'Product-owner accepted for scoped pilot; evidence assumed',
    owner: 'Product owner',
  },
  {
    label: 'Privacy/deletion review',
    status: 'Product-owner accepted for scoped pilot; residual risks recorded',
    owner: 'Product owner',
  },
];

const privacyReviewItems = [
  'Single-household, invite-only scope; no broader audience is approved.',
  'Parent account manages the linked learner; no separate guardian-verification flow is currently implemented.',
  'Informal parent consent is limited to the product owner’s own household and is not a general launch model.',
  'Render/PostgreSQL and Anthropic are the current providers; hosting region, provider region, retention, training-use, subprocessor, and moderation terms remain to be confirmed.',
  'Raw learner text is sensitive: transient/provider use is permitted only where necessary; traces and operational logs must remain redacted.',
  'Household export and deletion must cover attempts, progression state, assessment records, shadow decisions, traces, logs, caches, and backups.',
  'Assessment assignments/results are immutable application evidence but must still be deleted on an approved household-erasure request.',
  'Backups, restore testing, backup expiry, and deletion SLA remain pending operational verification.',
  'Support access, least privilege, credential rotation, incident contacts, and pause authority need named owners.',
  'No real learner rollout is approved while critical privacy, child-safety, consent, provider-terms, deletion, or answer-leakage controls remain pending.',
];

export default function CourseProgressionReviewPage() {
  const unit = PILOT_UNITS[0];

  return (
    <main>
      <header>
        <div className="brand">
          Learning Forge
          <small>Course-progression review</small>
        </div>
        <nav aria-label="Review navigation">
          <Link href="/">Learner surface</Link>
          <Link href="/help">Help</Link>
        </nav>
      </header>

      <p role="status">
        Review surface only — it does not open progression serving or authorize C4.
      </p>
      <h1>Grade 6 Math progression review</h1>
      <p>
        This page gives product, engineering, and privacy reviewers a browser-readable summary of
        the current pilot. It contains no learner records and no held-out assessment prompts or
        answers.
      </p>

      <section aria-labelledby="course-heading">
        <h2 id="course-heading">Pilot course</h2>
        <p>
          <strong>{unit?.title ?? 'Grade 6 Math pilot unit'}</strong> — {PILOT_LESSONS.length}{' '}
          lessons and {PILOT_ASSESSMENT_BANKS.length} server-side assessment-bank metadata records.
        </p>
        <ol>
          {PILOT_LESSONS.map((lesson) => (
            <li key={lesson.code}>
              <strong>{lesson.title}</strong> — {lesson.objectives.join(' ')}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="gates-heading">
        <h2 id="gates-heading">Release gates</h2>
        <table>
          <caption>Current evidence status; none of these rows is an approval.</caption>
          <thead>
            <tr>
              <th scope="col">Gate</th>
              <th scope="col">Status</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr key={gate.label}>
                <th scope="row">{gate.label}</th>
                <td>{gate.status}</td>
                <td>{gate.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy/data owner review</h2>
        <p>
          The authoritative baseline is <code>docs/privacy-inventory.md</code>, supplemented by
          <code>docs/pilot-readiness-checklist.md</code> and <code>docs/incident-response.md</code>.
          The owner should confirm each item below or record a remediation owner and date.
        </p>
        <ul>
          {privacyReviewItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="next-heading">
        <h2 id="next-heading">Review actions</h2>
        <ol>
          <li>Run the read-only independent reviewer against the current commit.</li>
          <li>Run non-enforcing C3 traffic and export the redacted shadow packet.</li>
          <li>Complete the manual-gate record, then authorize or reject C4.</li>
        </ol>
        <p>
          The written templates are in <code>docs/course-progression-review/</code>. The release
          gate remains closed by default.
        </p>
      </section>
    </main>
  );
}
