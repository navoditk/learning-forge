import type { ReactNode } from 'react';

import type { Chapter } from '../learner-chapters';
import { ChapterIcon } from './chapter-icon';
import { ProgressBadge } from './progress-badge';

export function ChapterView({
  chapter,
  nextChapter,
  activeSkillCode,
  showActivity,
  onSelectItem,
  pilotProgress,
  breadcrumb,
  topicDetail,
  activityStatus,
  onRetryActivity,
  children,
}: {
  chapter: Chapter;
  nextChapter?: Chapter;
  activeSkillCode?: string;
  showActivity: boolean;
  onSelectItem: (domain: string, skillCode: string) => void;
  pilotProgress?: ReactNode;
  breadcrumb?: ReactNode;
  topicDetail?: ReactNode;
  activityStatus?: 'loading' | 'error';
  onRetryActivity?: () => void;
  children: ReactNode;
}) {
  const currentIndex = chapter.items.findIndex((item) => item.skillCode === activeSkillCode);
  const current = currentIndex === -1 ? undefined : chapter.items[currentIndex];
  const hasPrevious = currentIndex > 0;
  const actionAllowed =
    current?.action !== undefined &&
    current.availability !== 'blocked' &&
    current.availability !== 'unavailable';
  const hasNext = currentIndex !== -1 && currentIndex < chapter.items.length - 1;

  return (
    <section aria-labelledby="chapter-heading" className="chapter-view">
      {breadcrumb}
      <header className="chapter-view-header">
        <div className="chapter-view-title">
          <ChapterIcon domain={chapter.domain} size={44} />
          <div>
            <p className="chapter-eyebrow">Chapter</p>
            <h2 id="chapter-heading">{chapter.label}</h2>
          </div>
        </div>
        <ProgressBadge confirmedCount={chapter.confirmedCount} totalCount={chapter.totalCount} />
      </header>
      {pilotProgress}
      {topicDetail}
      <nav className="chapter-pager" aria-label={`${chapter.label} navigation`}>
        <button
          type="button"
          onClick={() => {
            if (hasPrevious)
              onSelectItem(chapter.domain, chapter.items[currentIndex - 1].skillCode);
          }}
          disabled={!hasPrevious}
        >
          ← Back
        </button>
        <p className="chapter-pager-position" aria-live="polite">
          {current ? `Skill ${currentIndex + 1} of ${chapter.items.length}` : ''}
        </p>
        {hasNext ? (
          <button
            type="button"
            onClick={() => onSelectItem(chapter.domain, chapter.items[currentIndex + 1].skillCode)}
          >
            Next →
          </button>
        ) : nextChapter ? (
          <button
            type="button"
            onClick={() => onSelectItem(nextChapter.domain, nextChapter.items[0].skillCode)}
          >
            Chapter complete — continue to {nextChapter.label} →
          </button>
        ) : (
          <button type="button" disabled>
            You&apos;ve reached the end of this course
          </button>
        )}
      </nav>
      {!showActivity && current?.locked && (
        <p role="status">
          Finish earlier skills in this chapter first — this one will unlock automatically.
        </p>
      )}
      {!showActivity && current && !current.locked && !current.action && (
        <p role="status">
          {current.status === 'INDEPENDENTLY_CONFIRMED'
            ? `Nice work — you've already confirmed "${current.title}" independently. It will come back for review later.`
            : `Nothing is queued for "${current.title}" right now. Check back after more practice elsewhere.`}
        </p>
      )}
      {!showActivity && actionAllowed && activityStatus === 'error' && (
        <div role="alert">
          <p>This activity could not be loaded.</p>
          {onRetryActivity && (
            <button type="button" onClick={onRetryActivity}>
              Try again
            </button>
          )}
        </div>
      )}
      {!showActivity && actionAllowed && activityStatus !== 'error' && (
        <p role="status">Loading this activity…</p>
      )}
      {showActivity && children}
    </section>
  );
}
