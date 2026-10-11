import { describe, expect, it } from 'vitest';

import * as contracts from '../../src/contracts';
import { ContentRoleSchema, TeachingContentItemSchema } from '../../src/contracts';
import {
  RecallCardDraftSchema,
  RecallCardPayloadSchema,
  RecallCardRecallKindSchema,
  projectRecallCardPayload,
} from '../../src/contracts/recall-card';

const draftCard = {
  schemaVersion: 'recall-card-1',
  id: 'synthetic-recall-card-1',
  version: '1.0.0',
  program: 'grade-6-math',
  skillRef: { code: 'synthetic-recall-skill', version: '1.0.0' },
  recallKind: 'fact',
  front: { text: 'If x < y, then y > x.' },
  back: { text: 'a < b and c > d.' },
  accessibleSummary: 'Synthetic front/back summary for assistive technology.',
  itemReadinessRefs: [{ code: 'made-up-skill', version: '1.0.0' }],
  provenance: { origin: 'llm_drafted', licenseStatus: 'pending_review' },
  review: {
    status: 'pending_review',
    reviewer: 'Learning Forge review',
    originalityStatement: 'Synthetic and original.',
  },
};

const payloadCard = {
  schemaVersion: 'recall-card-1',
  id: 'synthetic-recall-card-1',
  version: '1.0.0',
  program: 'grade-6-math',
  skillRef: { code: 'synthetic-recall-skill', version: '1.0.0' },
  recallKind: 'fact',
  front: { text: 'If x < y, then y > x.' },
  back: { text: 'a < b and c > d.' },
  accessibleSummary: 'Synthetic front/back summary for assistive technology.',
  provenance: { origin: 'original' },
  review: { status: 'reviewed' },
};

describe('recall-card contracts', () => {
  it('keeps the schema out of the generic contract barrel and leaves existing role contracts intact', () => {
    expect((contracts as Record<string, unknown>).RecallCardDraftSchema).toBeUndefined();
    expect((contracts as Record<string, unknown>).RecallCardPayloadSchema).toBeUndefined();
    expect(ContentRoleSchema.safeParse('recall-card').success).toBe(false);
    expect(
      TeachingContentItemSchema.safeParse({
        id: 'teaching-item-1',
        version: '1.0.0',
        title: 'Synthetic teaching item',
        role: 'teaching',
        skillRef: { code: 'synthetic-recall-skill', version: '1.0.0' },
        mode: 'core',
        difficulty: 'foundational',
        standards: ['6.RP.A.1'],
        observableEvidence: ['Names the quantities in a ratio.'],
        provenance: { origin: 'original', licenseStatus: 'owned' },
        review: {
          status: 'reviewed',
          reviewer: 'Learning Forge review',
          reviewedAt: '2026-10-10',
          originalityStatement: 'Synthetic and original.',
        },
        accessibilityNotes: 'Synthetic accessibility note.',
        accessibleAlternative: 'Synthetic accessible alternative.',
        explanation: 'Synthetic teaching explanation.',
        itemReadinessRefs: [],
      }).success,
    ).toBe(true);
  });

  it('validates the strict draft and payload projections independently', () => {
    expect(RecallCardRecallKindSchema.safeParse('fact').success).toBe(true);
    expect(RecallCardRecallKindSchema.safeParse('answer').success).toBe(false);
    expect(RecallCardDraftSchema.safeParse(draftCard).success).toBe(true);
    expect(RecallCardPayloadSchema.safeParse(payloadCard).success).toBe(true);
    expect(
      RecallCardPayloadSchema.safeParse({
        ...payloadCard,
        reviewer: 'Learning Forge review',
      }).success,
    ).toBe(false);
    expect(
      RecallCardPayloadSchema.safeParse({
        ...payloadCard,
        reviewedAt: '2026-10-10',
      }).success,
    ).toBe(false);
    expect(
      RecallCardPayloadSchema.safeParse({
        ...payloadCard,
        originalityStatement: 'Synthetic and original.',
      }).success,
    ).toBe(false);
    expect(
      RecallCardPayloadSchema.safeParse({
        ...payloadCard,
        itemReadinessRefs: draftCard.itemReadinessRefs,
      }).success,
    ).toBe(false);
    expect(
      RecallCardPayloadSchema.safeParse({
        ...payloadCard,
        provenance: { origin: 'llm_drafted' },
      }).success,
    ).toBe(false);
  });

  it('enforces the approved text caps and permits plaintext comparisons', () => {
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: 'x'.repeat(500) },
        back: { text: 'y'.repeat(1000) },
        accessibleSummary: 'z'.repeat(1000),
      }).success,
    ).toBe(true);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: 'x'.repeat(501) },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        back: { text: 'x'.repeat(1001) },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        accessibleSummary: 'x'.repeat(1001),
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: 'If x < y, then y > x.' },
        back: { text: 'a < b and c > d.' },
      }).success,
    ).toBe(true);
  });

  it('rejects unsafe markup and URL schemes while preserving literal comparisons', () => {
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: 'See <strong>this</strong>' },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: '<script>alert(1)</script>' },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        front: { text: '<div>markup</div>' },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        back: { text: 'Visit https://example.com for more.' },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        back: { text: 'javascript:alert(1)' },
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        back: { text: 'mailto:test@example.com' },
      }).success,
    ).toBe(false);
  });

  it('requires identity and version fields', () => {
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        schemaVersion: 'recall-card-2',
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        version: '',
      }).success,
    ).toBe(false);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        skillRef: { code: 'synthetic-recall-skill' },
      }).success,
    ).toBe(false);
  });

  it('treats readiness refs structurally without catalog lookup', () => {
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        itemReadinessRefs: [{ code: 'made-up-skill', version: '1.0.0' }],
      }).success,
    ).toBe(true);
    expect(
      RecallCardDraftSchema.safeParse({
        ...draftCard,
        itemReadinessRefs: [{ code: 'bad ref', version: '1.0.0' }],
      }).success,
    ).toBe(false);
  });

  it('projects approved drafts to public payloads without leaking private fields', () => {
    const projected = projectRecallCardPayload({
      ...draftCard,
      provenance: { origin: 'licensed', licenseStatus: 'licensed', sourceReference: 'src-1' },
      review: {
        status: 'reviewed',
        reviewer: 'Learning Forge review',
        reviewedAt: '2026-10-10',
        originalityStatement: 'Synthetic and original.',
      },
    } as Parameters<typeof projectRecallCardPayload>[0]);

    expect(projected).toEqual({
      schemaVersion: 'recall-card-1',
      id: 'synthetic-recall-card-1',
      version: '1.0.0',
      program: 'grade-6-math',
      skillRef: { code: 'synthetic-recall-skill', version: '1.0.0' },
      recallKind: 'fact',
      front: { text: 'If x < y, then y > x.' },
      back: { text: 'a < b and c > d.' },
      accessibleSummary: 'Synthetic front/back summary for assistive technology.',
      provenance: { origin: 'licensed' },
      review: { status: 'reviewed' },
    });
    expect(JSON.stringify(projected)).not.toContain('reviewer');
    expect(JSON.stringify(projected)).not.toContain('reviewedAt');
    expect(JSON.stringify(projected)).not.toContain('originalityStatement');
    expect(JSON.stringify(projected)).not.toContain('itemReadinessRefs');

    expect(() =>
      projectRecallCardPayload({
        ...draftCard,
        provenance: { origin: 'llm_drafted', licenseStatus: 'pending_review' },
      } as Parameters<typeof projectRecallCardPayload>[0]),
    ).toThrow('LLM-drafted cards are not projectable');
    expect(() =>
      projectRecallCardPayload({
        ...draftCard,
        provenance: { origin: 'original', licenseStatus: 'pending_review' },
      } as Parameters<typeof projectRecallCardPayload>[0]),
    ).toThrow('Pending license review cards are not projectable');
    expect(() =>
      projectRecallCardPayload({
        ...draftCard,
        provenance: { origin: 'original', licenseStatus: 'owned' },
        review: {
          status: 'pending_review',
          reviewer: 'Learning Forge review',
          originalityStatement: 'Synthetic and original.',
        },
      } as Parameters<typeof projectRecallCardPayload>[0]),
    ).toThrow('Unreviewed cards are not projectable');
  });
});
