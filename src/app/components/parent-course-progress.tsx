import type { CourseProgress } from '../course-progress-view';
import { historicalLessonLabel, historyHeadingId, progressKey } from '../course-progress-view';
import { NeedsHelpOverride } from './needs-help-override';

const humanize = (value: string): string => value.toLocaleLowerCase().replaceAll('_', ' ');

type Unit = CourseProgress['units'][number];

function ParentUnit({
  unit,
  headingId,
  heading,
  onApplied,
  overrideTitle,
}: {
  unit: Unit;
  headingId: string;
  heading: string;
  onApplied: (message: string) => void;
  overrideTitle: (lessonTitle: string) => string;
}) {
  return (
    <article aria-labelledby={headingId}>
      <h3 id={headingId}>{heading}</h3>
      <p>Unit status: {humanize(unit.status)}</p>
      <ul>
        {unit.lessons.map((lesson) => (
          <li key={progressKey(lesson.code, lesson.version)}>
            <strong>{lesson.title}</strong>: {humanize(lesson.completionStatus)}; remediation{' '}
            {humanize(lesson.remediationStatus)}.
            {lesson.latestAssessment && (
              <span>
                {' '}
                Assessment: {lesson.latestAssessment.outcome.toLocaleLowerCase()} on{' '}
                {new Date(lesson.latestAssessment.scoredAt).toLocaleDateString()}.
              </span>
            )}
            {lesson.remediationStatus === 'NEEDS_HELP' && lesson.skillRefs[0] && (
              <NeedsHelpOverride
                lessonTitle={overrideTitle(lesson.title)}
                skillRef={lesson.skillRefs[0]}
                onApplied={onApplied}
              />
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Parent course-progression section (RAT-INTEGRATE RI-4, C7-A). The active
 * section keeps the former inline markup exactly. Earlier versions render in a
 * separate section, each NEEDS_HELP lesson with its own override control named
 * with its version (D-230, CE-2). The override is skill-scoped server side, so
 * one action clears every claiming version; the caller reloads progress.
 */
export function ParentCourseProgress({
  courseProgress,
  overrideStatusMessage,
  onOverrideApplied,
}: {
  courseProgress: CourseProgress;
  overrideStatusMessage: string;
  onOverrideApplied: (message: string) => void;
}) {
  const active = (
    <section aria-labelledby="course-progress-heading">
      <h2 id="course-progress-heading">Course progression</h2>
      <p>Completion history and current remediation are shown separately from mastery evidence.</p>
      {courseProgress.units.map((unit) => (
        <ParentUnit
          key={progressKey(unit.code, unit.version)}
          unit={unit}
          headingId={`${unit.code}-heading`}
          heading={unit.title}
          onApplied={onOverrideApplied}
          overrideTitle={(title) => title}
        />
      ))}
      {overrideStatusMessage && <p role="status">{overrideStatusMessage}</p>}
    </section>
  );
  const history = courseProgress.history ?? [];
  if (history.length === 0) return active;
  return (
    <>
      {active}
      <section aria-labelledby="course-history-heading">
        <h2 id="course-history-heading">Earlier course versions</h2>
        <p>
          Lessons your learner worked on in earlier versions of the course. A lesson marked as
          needing help in an earlier version can be cleared here.
        </p>
        {history.map((unit) => (
          <ParentUnit
            key={progressKey(unit.code, unit.version)}
            unit={unit}
            headingId={historyHeadingId(unit.code, unit.version)}
            heading={`Earlier version ${unit.version}: ${unit.title}`}
            onApplied={onOverrideApplied}
            overrideTitle={(title) => historicalLessonLabel(title, unit.version)}
          />
        ))}
      </section>
    </>
  );
}
