import type { CourseProgress } from '../course-progress-view';
import { historyHeadingId, progressKey } from '../course-progress-view';

const humanize = (value: string): string => value.toLocaleLowerCase().replaceAll('_', ' ');

type Unit = CourseProgress['units'][number];

function LearnerUnit({
  unit,
  headingId,
  heading,
}: {
  unit: Unit;
  headingId: string;
  heading: string;
}) {
  return (
    <article aria-labelledby={headingId}>
      <h4 id={headingId}>{heading}</h4>
      <p>Unit status: {humanize(unit.status)}</p>
      <ol>
        {unit.lessons.map((lesson) => (
          <li key={progressKey(lesson.code, lesson.version)}>
            <strong>{lesson.title}</strong> — {humanize(lesson.completionStatus)}
            {lesson.remediationStatus !== 'NONE' && (
              <span> ({humanize(lesson.remediationStatus)})</span>
            )}
            {lesson.latestAssessment && (
              <span>
                {' '}
                Latest assessment: {lesson.latestAssessment.outcome.toLocaleLowerCase()}.
              </span>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}

/**
 * Learner course-progress panel (RAT-INTEGRATE RI-4, C7-A). The active
 * section keeps the markup, ids and text of the former inline panel exactly;
 * earlier course versions render in a separate, read-only section only when
 * the learner has state rows for them. The learner never gets an override.
 */
export function CourseProgressPanel({ courseProgress }: { courseProgress: CourseProgress }) {
  const active = (
    <section aria-labelledby="course-progress-heading" className="pilot-progress-panel">
      <h3 id="course-progress-heading">Course progress</h3>
      <p>
        <small>
          Completion and mastery are tracked separately. Assessment results appear here only after
          they are recorded.
        </small>
      </p>
      {courseProgress.units.map((unit) => (
        <LearnerUnit
          key={progressKey(unit.code, unit.version)}
          unit={unit}
          headingId={`${unit.code}-heading`}
          heading={unit.title}
        />
      ))}
    </section>
  );
  const history = courseProgress.history ?? [];
  if (history.length === 0) return active;
  return (
    <>
      {active}
      <section aria-labelledby="course-history-heading" className="pilot-progress-panel">
        <h3 id="course-history-heading">Earlier course versions</h3>
        <p>
          <small>
            These are earlier versions of the course you have already worked on. They are shown for
            your record only.
          </small>
        </p>
        {history.map((unit) => (
          <LearnerUnit
            key={progressKey(unit.code, unit.version)}
            unit={unit}
            headingId={historyHeadingId(unit.code, unit.version)}
            heading={`Earlier version ${unit.version}: ${unit.title}`}
          />
        ))}
      </section>
    </>
  );
}
