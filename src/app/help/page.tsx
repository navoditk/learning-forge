import Link from 'next/link';

import { ProgramSwitcher } from '../components/program-switcher';

export const metadata = {
  title: 'Help — Learning Forge',
};

export default function HelpPage() {
  return (
    <main>
      <header>
        <div className="brand">
          Learning Forge
          <small>Help</small>
        </div>
        <ProgramSwitcher />
        <nav aria-label="Primary navigation">
          <Link href="/">Learner session</Link>
          <Link href="/parent">Parent evidence</Link>
        </nav>
      </header>

      <h1>How Learning Forge works</h1>
      <p>
        This guide walks through every part of the platform a learner or parent can see today.
        Learning Forge is a pilot covering Grade 6 Math and Math Kangaroo preparation. Every feature
        below is designed so claims about progress are always traceable back to something the
        learner actually did — never a guess or a grade.
      </p>

      <section aria-labelledby="help-recommended">
        <h2 id="help-recommended">Recommended next activities</h2>
        <p>
          The learner homepage lists a short set of recommended activities under{' '}
          <strong>Recommended next activities</strong>. Each one names the skill it practices, an
          estimated time, and a plain-language reason it was picked (for example, “not yet assessed
          and all prerequisites are met”, or “independent mastery is still developing”). Clicking an
          activity starts (or resumes) a session on it.
        </p>
      </section>

      <section aria-labelledby="help-session">
        <h2 id="help-session">Working through a problem</h2>
        <p>A regular practice session has three stages:</p>
        <ol>
          <li>
            <strong>Answer independently.</strong> Type an answer and submit it. This first attempt
            is recorded before any help is given.
          </li>
          <li>
            <strong>Ask for help if needed.</strong> The <em>Ask for a small hint</em> button starts
            a short back-and-forth with the tutor. Hints escalate gradually (a small strategic hint,
            then a worked example, and so on) — the tutor never simply gives the final answer.
          </li>
          <li>
            <strong>Independent check.</strong> Once the tutor has responded,{' '}
            <em>Start independent check</em> asks the same kind of question again with no hints
            available. Passing this check is the only thing that marks the activity complete and
            moves the skill toward “confirmed.”
          </li>
        </ol>
        <p>
          If the learner navigates away and comes back, the session picks up where it left off
          instead of starting over, and shows “Continuing where you left off.”
        </p>
      </section>

      <section aria-labelledby="help-diagnostic">
        <h2 id="help-diagnostic">Quick placement check</h2>
        <p>
          The first time a learner has no recorded evidence for a foundational skill, a{' '}
          <strong>Quick placement check</strong> section offers a single one-question probe for it.
          These are answered independently with no hints, and are used only to seed an initial
          estimate of what the learner already knows — a placement guess is never treated as
          confirmed, independently-checked mastery.
        </p>
      </section>

      <section aria-labelledby="help-review">
        <h2 id="help-review">Review due</h2>
        <p>
          Skills the learner has already confirmed through an independent check are periodically
          revisited. When a confirmed skill has not been re-checked in a while, it appears in the{' '}
          <strong>Review due</strong> section as a single independent, no-hint probe. Passing it
          keeps the skill confirmed; failing it moves the skill back into regular practice rather
          than leaving an outdated “confirmed” status in place.
        </p>
      </section>

      <section aria-labelledby="help-progress">
        <h2 id="help-progress">Your progress</h2>
        <p>
          The <strong>Your progress</strong> section on the learner homepage shows, in plain
          language:
        </p>
        <ul>
          <li>
            A suggested next activity with the reason it was chosen (the same recommendation engine
            as the activity list above).
          </li>
          <li>
            <strong>Recent strengths</strong> — skills the learner has recently confirmed through a
            passed independent check, each traceable to the attempt that earned it.
          </li>
          <li>
            A skill-by-skill breakdown, where every skill is labeled “Not started yet”,
            “Practicing”, or “Independently confirmed.” There are no scores, grades, or rankings —
            only these three qualitative, evidence-backed states.
          </li>
        </ul>
      </section>

      <section aria-labelledby="help-parent">
        <h2 id="help-parent">Parent evidence</h2>
        <p>
          The <Link href="/parent">Parent evidence</Link> page lists recent attempts (with
          correctness and the highest level of assistance used) and current mastery estimates per
          skill. A <strong>weekly digest</strong> can be generated on demand from that page — it
          summarizes the week&apos;s attempts and confirmed skills in plain language and is
          currently logged to the server console rather than emailed, since no email/push provider
          is connected yet.
        </p>
      </section>

      <section aria-labelledby="help-privacy">
        <h2 id="help-privacy">Privacy, data export, and deletion</h2>
        <p>
          Only what is needed to run a tutoring interaction is ever sent to the AI model provider —
          never a learner&apos;s name, account details, or other household data. Every AI call is
          logged with metadata (policy version, model, latency, token usage) but not raw free-form
          conversation text by default.
        </p>
        <p>
          A household&apos;s full data can be exported or permanently deleted at any time from the{' '}
          <Link href="/parent">parent evidence page</Link>, in the &quot;Your data&quot; section.
          Export downloads a JSON file with every attempt, session, mastery estimate, and tutor
          trace. Deletion permanently removes all of it, including the household account itself, and
          requires typing a confirmation phrase first since it cannot be undone.
        </p>
      </section>

      <section aria-labelledby="help-limits">
        <h2 id="help-limits">What this pilot does not do yet</h2>
        <ul>
          <li>Only Grade 6 Math is covered; no other subjects or grade levels.</li>
          <li>Hints are rate-limited per day and per session to control cost, not just quality.</li>
          <li>There is no mobile app — this is a web page only.</li>
          <li>
            The weekly digest is not emailed automatically yet; it must be generated from the parent
            page.
          </li>
        </ul>
      </section>
    </main>
  );
}
