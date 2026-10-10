import type { Chapter, ChapterItem } from '../learner-chapters';
import { describeTopicStatus, isTopicOpenable } from '../learner-chapters';
import { buildCourseHref } from '../course-route';
import { ChapterIcon } from './chapter-icon';
import { CourseBreadcrumb } from './course-breadcrumb';
import { CourseLink } from './course-link';
import { ProgressBadge } from './progress-badge';

function TopicCard({
  program,
  chapter,
  item,
  onOpenTopic,
}: {
  program: string;
  chapter: Chapter;
  item: ChapterItem;
  onOpenTopic: (domain: string, skillCode: string) => void;
}) {
  const status = describeTopicStatus(item);
  const openable = isTopicOpenable(item);
  return (
    <li className="topic-card" data-openable={openable ? 'true' : 'false'}>
      <h4 className="topic-card-title">
        {openable ? (
          <CourseLink
            href={buildCourseHref({
              kind: 'topic',
              program,
              domain: chapter.domain,
              skill: item.skillCode,
            })}
            onNavigate={() => onOpenTopic(chapter.domain, item.skillCode)}
          >
            {item.title}
          </CourseLink>
        ) : (
          item.title
        )}
      </h4>
      <dl className="topic-card-status">
        <div>
          <dt>Practice</dt>
          <dd>{status.practice}</dd>
        </div>
        <div>
          <dt>Mastery</dt>
          <dd>{status.mastery}</dd>
        </div>
      </dl>
      {status.availability && <p className="topic-card-note">{status.availability}</p>}
    </li>
  );
}

export function CourseOverview({
  program,
  programLabel,
  chapters,
  focusDomain,
  planUnavailable,
  onOpenTopic,
  onOpenChapter,
  onOpenCourse,
}: {
  program: string;
  programLabel: string;
  chapters: Chapter[];
  focusDomain?: string;
  planUnavailable: boolean;
  onOpenTopic: (domain: string, skillCode: string) => void;
  onOpenChapter: (domain: string) => void;
  onOpenCourse: () => void;
}) {
  const shown = focusDomain
    ? chapters.filter((chapter) => chapter.domain === focusDomain)
    : chapters;
  const focused = focusDomain ? shown[0] : undefined;
  const totalTopics = chapters.reduce((sum, chapter) => sum + chapter.totalCount, 0);

  return (
    <section aria-labelledby="course-overview-heading" className="course-overview">
      <CourseBreadcrumb
        crumbs={[
          focused
            ? {
                label: programLabel,
                href: buildCourseHref({ kind: 'overview', program }),
                onNavigate: onOpenCourse,
              }
            : { label: programLabel },
          ...(focused ? [{ label: focused.label }] : []),
        ]}
      />
      <h2 id="course-overview-heading" tabIndex={-1}>
        {focused ? `${focused.label} overview` : `Course overview: ${programLabel}`}
      </h2>
      <p className="course-overview-note">
        Practice evidence and independent confirmation are shown separately. A topic counts as
        confirmed only when an independent check has been recorded; opening or practicing a topic
        does not confirm it.
        {!focused && ` This course lists ${totalTopics} topics in ${chapters.length} chapters.`}
      </p>
      {planUnavailable && (
        <p role="status" className="course-overview-note">
          The course plan could not be loaded, so no topic can be opened from here right now.
        </p>
      )}
      <ol className="overview-chapter-list">
        {shown.map((chapter) => (
          <li key={chapter.domain}>
            <section
              className="overview-chapter"
              aria-labelledby={`overview-chapter-${chapter.domain}`}
            >
              <header className="overview-chapter-header">
                <ChapterIcon domain={chapter.domain} size={40} />
                <h3 id={`overview-chapter-${chapter.domain}`}>
                  {focused ? (
                    chapter.label
                  ) : (
                    <CourseLink
                      href={buildCourseHref({
                        kind: 'overview',
                        program,
                        domain: chapter.domain,
                      })}
                      onNavigate={() => onOpenChapter(chapter.domain)}
                    >
                      {chapter.label}
                    </CourseLink>
                  )}
                </h3>
              </header>
              <div className="overview-chapter-progress">
                <ProgressBadge
                  confirmedCount={chapter.confirmedCount}
                  totalCount={chapter.totalCount}
                  label={`${chapter.label}: ${chapter.confirmedCount} of ${chapter.totalCount} topics independently confirmed`}
                />
                <p>
                  {chapter.confirmedCount} of {chapter.totalCount} topics independently confirmed ·{' '}
                  {chapter.practicingCount} practicing, not yet confirmed
                </p>
              </div>
              <ul className="topic-card-list">
                {chapter.items.map((item) => (
                  <TopicCard
                    key={item.skillCode}
                    program={program}
                    chapter={chapter}
                    item={item}
                    onOpenTopic={onOpenTopic}
                  />
                ))}
              </ul>
            </section>
          </li>
        ))}
      </ol>
    </section>
  );
}
