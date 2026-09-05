import { describe, expect, it } from 'vitest';

import {
  AttemptEvidenceSchema,
  ContentProvenanceSchema,
  MasteryEvidenceSchema,
  RatioContentSchema,
  ScoringOutputSchema,
  TutorAuthorizationSchema,
  TutorMoveOutputSchema,
  TutorTraceMetadataSchema,
  TutorTraceRecordSchema,
  createTutorTraceRecord,
  validateTutorMove,
} from '../../src/contracts';

const authorization = TutorAuthorizationSchema.parse({
  policyVersion: 'policy-1',
  allowedMoveTypes: ['hint_1_strategy'],
  maximumAssistance: 'small_strategic_hint',
  canRevealAnswer: false,
  requiresGenuineAttempt: true,
});

const validMove = {
  moveType: 'hint_1_strategy',
  learnerMessage: 'Look for the relationship between the two quantities.',
  question: 'What stays the same as both quantities change?',
  assistanceLevel: 'small_strategic_hint',
  expectedResponseForm: 'explanation',
  safetyFlags: ['none'],
  confidence: 0.8,
} as const;

describe('content and evidence contracts', () => {
  it('requires provenance details for licensed content', () => {
    expect(
      ContentProvenanceSchema.safeParse({ origin: 'licensed', licenseStatus: 'licensed' }).success,
    ).toBe(false);
    expect(
      ContentProvenanceSchema.safeParse({ origin: 'original', licenseStatus: 'owned' }).success,
    ).toBe(true);
  });

  it('rejects unknown fields and invalid mastery confidence claims', () => {
    expect(
      TutorMoveOutputSchema.safeParse({ ...validMove, authorization: { canRevealAnswer: true } })
        .success,
    ).toBe(false);
    expect(
      MasteryEvidenceSchema.safeParse({
        evidenceId: '00000000-0000-4000-8000-000000000001',
        contributingAttemptIds: ['00000000-0000-4000-8000-000000000002'],
        skillCode: 'unit-rates',
        correctness: 'correct',
        assistanceLevel: 'small_strategic_hint',
        assessmentContext: 'practice',
        evidenceWeight: 0.75,
        algorithmVersion: 'mastery-1',
        confidenceBand: 'high',
        independentDelayedCheck: false,
      }).success,
    ).toBe(false);
  });

  it('validates attempt evidence with immutable version references', () => {
    const result = AttemptEvidenceSchema.safeParse({
      attemptId: '00000000-0000-4000-8000-000000000003',
      contentId: 'ratio-unit-rate-1',
      contentVersion: 'content-1',
      learnerResponse: 'The unit rate is 3.',
      correctness: 'correct',
      scoringMethod: 'deterministic',
      attemptNumber: 1,
      elapsedSeconds: 42,
      assistanceEvents: [],
      highestAssistance: 'independent',
      misconceptionTags: [],
      policyVersion: 'policy-1',
      context: 'practice',
    });
    expect(result.success).toBe(true);
  });

  it('requires structured scoring output', () => {
    expect(
      ScoringOutputSchema.safeParse({
        correctness: 'partial',
        rationale: 'The relationship is identified, but the unit conversion is incomplete.',
        confidence: 0.7,
      }).success,
    ).toBe(true);
    expect(
      ScoringOutputSchema.safeParse({ correctness: 'correct', rationale: 'done', confidence: 1.2 })
        .success,
    ).toBe(false);
  });

  it('validates a ratios content shape with an ordered hint ladder', () => {
    const result = RatioContentSchema.safeParse({
      id: 'ratio-unit-rate-1',
      version: 'content-1',
      title: 'Unit rate',
      skillCode: 'unit-rates',
      mode: 'core',
      difficulty: 'foundational',
      standards: ['6.RP.A.1'],
      prerequisiteSkillCodes: [],
      observableEvidence: ['Names the two quantities and their order.'],
      prompt: 'A car travels 120 miles in 4 hours. What is the unit rate?',
      solutionRepresentation: '120 / 4 = 30 miles per hour',
      solutionMethod: 'Divide the distance by the number of hours.',
      deterministicValidator: {
        type: 'numeric',
        canonicalAnswer: '30 miles per hour',
        acceptedAnswers: ['30', '30 miles per hour'],
        equivalenceNotes: 'Accept 30 miles/hour and 30 mi/h.',
      },
      misconceptionCodes: ['divide-by-total'],
      hintSteps: [
        {
          order: 1,
          assistanceLevel: 'small_strategic_hint',
          prompt: 'Identify the two quantities being compared.',
          question: 'Which quantity should be one?',
        },
      ],
      forbiddenLeakagePatterns: ['30 miles per hour', '30 miles/hour'],
      provenance: { origin: 'original', licenseStatus: 'owned' },
      review: {
        status: 'reviewed',
        reviewer: 'Learning Forge content review',
        reviewedAt: '2026-09-05',
        originalityStatement: 'Written for this repository from first principles.',
      },
      accessibilityNotes: 'Use plain text and do not rely on color alone.',
    });
    expect(result.success).toBe(true);
  });
});

describe('tutor move boundary validation', () => {
  it('accepts a move within server authorization', () => {
    expect(validateTutorMove(validMove, authorization)).toEqual({
      status: 'validated',
      move: validMove,
    });
  });

  it('requires fallback for malformed, unauthorized, unsafe, or leaking output', () => {
    expect(validateTutorMove({ ...validMove, question: '' }, authorization)).toEqual({
      status: 'requires_fallback',
      reasons: ['invalid_schema'],
    });
    expect(validateTutorMove({ ...validMove, moveType: 'guided_solution' }, authorization)).toEqual(
      {
        status: 'requires_fallback',
        reasons: ['move_not_authorized', 'answer_reveal_not_authorized'],
      },
    );
    expect(
      validateTutorMove({ ...validMove, safetyFlags: ['needs_human_review'] }, authorization),
    ).toEqual({ status: 'requires_fallback', reasons: ['safety_review_required'] });
    expect(
      validateTutorMove(
        { ...validMove, learnerMessage: 'The answer is 30 miles per hour.' },
        authorization,
        ['30 miles per hour'],
      ),
    ).toEqual({
      status: 'requires_fallback',
      reasons: ['answer_leak_detected'],
    });
  });

  it('keeps authorization out of the model output contract', () => {
    expect(TutorMoveOutputSchema.safeParse({ ...validMove, canRevealAnswer: true }).success).toBe(
      false,
    );
  });
});

describe('privacy-filtered traces', () => {
  const metadata = TutorTraceMetadataSchema.parse({
    traceId: '00000000-0000-4000-8000-000000000004',
    policyVersion: 'policy-1',
    promptTemplateVersion: 'prompt-1',
    modelIdentifier: 'fake-model',
    latencyMs: 12,
    tokenUsage: { input: 10, output: 5, total: 15 },
    validationResult: 'validated',
    outcome: 'move_returned',
  });

  it('records required metadata and redacts raw learner text by default', () => {
    const trace = createTutorTraceRecord(metadata, 'My name is private and my answer is 30.');
    expect(trace.redactedExcerpt).toBe('[redacted learner text]');
    expect(JSON.stringify(trace)).not.toContain('My name is private');
    expect(TutorTraceRecordSchema.safeParse({ ...trace, rawChildText: 'secret' }).success).toBe(
      false,
    );
  });
});
