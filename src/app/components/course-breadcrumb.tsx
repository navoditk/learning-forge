import { CourseLink } from './course-link';

export type Crumb = { label: string; href?: string; onNavigate?: () => void };

// The last crumb is the current location (aria-current="page", not a link).
export function CourseBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="course-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;
          return (
            <li key={`${index}-${crumb.label}`}>
              {isCurrent || !crumb.href || !crumb.onNavigate ? (
                <span aria-current={isCurrent ? 'page' : undefined}>{crumb.label}</span>
              ) : (
                <CourseLink href={crumb.href} onNavigate={crumb.onNavigate}>
                  {crumb.label}
                </CourseLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
