import { describe, expect, it } from 'vitest';

import { buildFullDocument } from '../../scripts/generate-curriculum-site';
import { contentCatalog } from '../../src/content/catalog';
import type { CurriculumSiteContentItem } from '../../src/content/publication';

describe('public curriculum publication projection', () => {
  it('excludes pending and assessment-role sentinels from generated output', () => {
    const source = contentCatalog[0];
    const pending = {
      ...source,
      id: 'synthetic-pending-publication-sentinel',
      title: 'Synthetic pending publication sentinel',
      review: { ...source.review, status: 'pending_review' as const, reviewedAt: undefined },
    } as unknown as CurriculumSiteContentItem;
    const assessment = {
      ...source,
      id: 'synthetic-assessment-publication-sentinel',
      title: 'Synthetic assessment publication sentinel',
      role: 'assessment' as const,
    } as unknown as CurriculumSiteContentItem;

    const generatedSite = buildFullDocument([source, pending, assessment]);

    expect(generatedSite).toContain(source.title);
    expect(generatedSite).not.toContain(pending.title);
    expect(generatedSite).not.toContain(assessment.title);
  });
});
