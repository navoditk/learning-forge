import type { ContentItem } from '../contracts/content';

export type ContentFigure = NonNullable<ContentItem['figure']>;

export function svgDataUri(svgMarkup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}
