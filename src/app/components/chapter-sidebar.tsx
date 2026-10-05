'use client';

import { useEffect, useState } from 'react';

import type { Chapter, ChapterItem } from '../learner-chapters';
import { ChapterIcon } from './chapter-icon';
import { ProgramSwitcher } from './program-switcher';
import { ProgressBadge } from './progress-badge';

const STATUS_LABEL: Record<ChapterItem['status'], string> = {
  NOT_STARTED: 'Not started yet',
  PRACTICING: 'In progress',
  INDEPENDENTLY_CONFIRMED: 'Confirmed',
};

function StatusIcon({ item }: { item: ChapterItem }) {
  if (item.locked) {
    return (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="status-icon">
        <rect
          x="3"
          y="7"
          width="10"
          height="7"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (item.status === 'INDEPENDENTLY_CONFIRMED') {
    return (
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        className="status-icon status-icon-confirmed"
      >
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M4.8 8.2l2 2 4.4-4.6"
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (item.status === 'PRACTICING') {
    return (
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        className="status-icon status-icon-practicing"
      >
        <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 8V2.3a6.3 6.3 0 0 1 0 12.6z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="status-icon">
      <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChapterSidebar({
  program,
  onProgramChange,
  chapters,
  activeDomain,
  activeSkillCode,
  onSelectItem,
}: {
  program: string;
  onProgramChange: (program: string) => void;
  chapters: Chapter[];
  activeDomain?: string;
  activeSkillCode?: string;
  onSelectItem: (domain: string, skillCode: string) => void;
}) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (activeDomain) {
      setExpandedDomains((current) => {
        if (current.has(activeDomain)) return current;
        return new Set(current).add(activeDomain);
      });
    }
  }, [activeDomain]);

  function toggleDomain(domain: string, open: boolean) {
    setExpandedDomains((current) => {
      const next = new Set(current);
      if (open) next.add(domain);
      else next.delete(domain);
      return next;
    });
  }

  return (
    <nav className="chapter-sidebar" aria-label="Course table of contents">
      <button
        type="button"
        className="chapter-sidebar-toggle"
        aria-expanded={mobileOpen}
        aria-controls="chapter-toc"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? 'Hide table of contents' : 'Show table of contents'}
      </button>
      <div id="chapter-toc" className="chapter-toc" hidden={!mobileOpen}>
        <ProgramSwitcher value={program} onChange={onProgramChange} />
        <ol className="chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.domain}>
              <details
                open={expandedDomains.has(chapter.domain)}
                onToggle={(event) => toggleDomain(chapter.domain, event.currentTarget.open)}
              >
                <summary
                  className={chapter.domain === activeDomain ? 'chapter-summary-active' : ''}
                >
                  <ChapterIcon domain={chapter.domain} />
                  <span className="chapter-summary-label">{chapter.label}</span>
                  <ProgressBadge
                    confirmedCount={chapter.confirmedCount}
                    totalCount={chapter.totalCount}
                    label={`${chapter.label}: ${chapter.confirmedCount} of ${chapter.totalCount} skills confirmed`}
                  />
                </summary>
                <ul className="chapter-skill-list">
                  {chapter.items.map((item) => {
                    const isActive =
                      chapter.domain === activeDomain && item.skillCode === activeSkillCode;
                    return (
                      <li key={item.skillCode}>
                        <button
                          type="button"
                          className={isActive ? 'chapter-skill-active' : ''}
                          aria-current={isActive ? 'true' : undefined}
                          onClick={() => onSelectItem(chapter.domain, item.skillCode)}
                        >
                          <StatusIcon item={item} />
                          <span>{item.title}</span>
                          <small>{item.locked ? 'Not ready yet' : STATUS_LABEL[item.status]}</small>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
