// SYNTHETIC, clearly fake teaching record for the dormant validator tests.
// Not real curriculum content; never written under content/teaching/.
export function syntheticRatioTeaching(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ratio-language-teaching-1',
    version: 'content-1',
    title: 'SYNTHETIC FIXTURE: invented ratio idea',
    role: 'teaching',
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['Synthetic fixture: learner restates the invented idea.'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'Synthetic fixture reviewer',
      reviewedAt: '2026-10-10',
      originalityStatement: 'Synthetic test fixture with no real curriculum content.',
    },
    accessibilityNotes: 'Plain text only.',
    accessibleAlternative: 'Plain text is already accessible.',
    itemReadinessRefs: [],
    explanation: 'SYNTHETIC FIXTURE explanation.',
    ...overrides,
  };
}
