import type { MouseEvent, ReactNode } from 'react';

// A real link (so it can be opened, copied, and deep-linked) that navigates
// in place on a plain click. Modified clicks fall through to the browser.
export function CourseLink({
  href,
  onNavigate,
  children,
  className,
  ariaCurrent,
}: {
  href: string;
  onNavigate: () => void;
  children: ReactNode;
  className?: string;
  ariaCurrent?: 'page';
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onNavigate();
  }
  return (
    <a href={href} onClick={handleClick} className={className} aria-current={ariaCurrent}>
      {children}
    </a>
  );
}
