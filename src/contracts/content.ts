import { z } from 'zod';

import { ContentModeSchema, VersionSchema } from './common';

export const ContentProvenanceSchema = z
  .object({
    origin: z.enum(['original', 'licensed', 'llm_drafted']),
    sourceReference: z.string().trim().min(1).max(300).optional(),
    licenseStatus: z.enum(['owned', 'licensed', 'pending_review']),
    reviewer: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .superRefine((provenance, context) => {
    if (provenance.origin === 'licensed' && !provenance.sourceReference) {
      context.addIssue({
        code: 'custom',
        path: ['sourceReference'],
        message: 'Licensed content requires a source reference',
      });
    }
    if (provenance.licenseStatus === 'pending_review' && provenance.reviewer) {
      context.addIssue({
        code: 'custom',
        path: ['reviewer'],
        message: 'Pending content cannot have a completed reviewer field',
      });
    }
  });

export const HintStepSchema = z
  .object({
    order: z.number().int().min(1).max(10),
    assistanceLevel: z.enum([
      'small_strategic_hint',
      'multiple_hints_representation',
      'analogous_worked_example',
      'guided_full_solution',
    ]),
    prompt: z.string().trim().min(1).max(500),
    question: z.string().trim().min(1).max(240),
  })
  .strict();

export const DeterministicValidatorSchema = z
  .object({
    type: z.enum(['numeric', 'text', 'ratio', 'percent', 'multiple_choice', 'composite']),
    canonicalAnswer: z.string().trim().min(1).max(200),
    acceptedAnswers: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
    equivalenceNotes: z.string().trim().min(1).max(500),
  })
  .strict();

export const ContestFormatSchema = z
  .object({
    // Program-specific round identifiers. MATHCOUNTS Sprint and Target are
    // distinct free-response rounds (see docs/curriculum-sources.md's
    // MATHCOUNTS dossier): Sprint is no-calculator, Target permits
    // calculators. They are deliberately kept separate from the
    // multiple-choice `math-kangaroo`/`amc-8` formats.
    format: z.enum(['math-kangaroo', 'amc-8', 'mathcounts-sprint', 'mathcounts-target']).optional(),
    pointValue: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    questionCount: z.number().int().min(1).max(40).optional(),
    timeLimitMinutes: z.number().int().min(1).max(180).optional(),
    calculatorPolicy: z
      .enum(['no_calculators', 'calculators_permitted', 'not_specified'])
      .optional(),
    scoring: z
      .object({
        correctPoints: z.number(),
        incorrectPoints: z.number(),
        blankPoints: z.number(),
      })
      .strict()
      .optional(),
    eligibility: z.string().trim().min(1).max(300).optional(),
    // Multiple-choice answer set for choice-based rounds (Math Kangaroo,
    // AMC 8). Optional because free-response rounds (MATHCOUNTS Sprint and
    // Target are short-answer, not multiple choice) carry no answer choices;
    // when present it must be a full five-choice A-E set.
    answerChoices: z
      .array(
        z
          .object({
            label: z.enum(['A', 'B', 'C', 'D', 'E']),
            text: z.string().trim().min(1).max(200),
            rationale: z.string().trim().min(1).max(500).optional(),
            misconceptionCode: z
              .string()
              .regex(/^[a-z0-9-]+$/)
              .optional(),
          })
          .strict(),
      )
      .length(5)
      .optional(),
  })
  .strict()
  .superRefine((format, context) => {
    const isMathcounts =
      format.format === 'mathcounts-sprint' || format.format === 'mathcounts-target';
    if (!isMathcounts && !format.answerChoices) {
      context.addIssue({
        code: 'custom',
        path: ['answerChoices'],
        message: 'Choice-based contest formats require five answer choices',
      });
    }
    if (isMathcounts && format.answerChoices) {
      context.addIssue({
        code: 'custom',
        path: ['answerChoices'],
        message: 'MATHCOUNTS Sprint and Target formats must be free response',
      });
    }
    if (
      format.calculatorPolicy === 'calculators_permitted' &&
      format.format !== 'mathcounts-target'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['calculatorPolicy'],
        message: 'Calculator-permitted contest metadata is limited to MATHCOUNTS Target',
      });
    }
    if (
      format.answerChoices &&
      new Set(format.answerChoices.map((choice) => choice.label)).size !== 5
    ) {
      context.addIssue({
        code: 'custom',
        path: ['answerChoices'],
        message: 'Contest answer-choice labels must be unique',
      });
    }
  });

const ALLOWED_SVG_ELEMENTS = new Set([
  'circle',
  'ellipse',
  'g',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'svg',
  'text',
]);

export const ContentFigureSchema = z
  .object({
    svgMarkup: z.string().trim().min(1).max(12_000),
    altText: z.string().trim().min(1).max(1000),
    caption: z.string().trim().min(1).max(300),
    width: z.number().int().min(200).max(1200),
    height: z.number().int().min(120).max(800),
  })
  .strict()
  .superRefine((figure, context) => {
    const svg = figure.svgMarkup;
    const elementNames = [...svg.matchAll(/<\s*\/?\s*([a-zA-Z][\w-]*)/g)].map((match) =>
      match[1].toLowerCase(),
    );
    if (
      !svg.startsWith('<svg ') ||
      !svg.endsWith('</svg>') ||
      !svg.includes('viewBox=') ||
      elementNames.some((element) => !ALLOWED_SVG_ELEMENTS.has(element)) ||
      /(?:\bon[a-z]+\s*=|\bhref\s*=|\bxlink:|url\s*\(|<\s*style\b)/i.test(svg)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['svgMarkup'],
        message: 'Figure SVG must use only the approved static SVG subset',
      });
    }
  });

export const ContentReviewSchema = z
  .object({
    status: z.enum(['pending_review', 'reviewed']),
    reviewer: z.string().trim().min(1).max(120),
    reviewedAt: z.string().date().optional(),
    originalityStatement: z.string().trim().min(1).max(500),
  })
  .strict()
  .superRefine((review, context) => {
    if (review.status === 'reviewed' && !review.reviewedAt) {
      context.addIssue({
        code: 'custom',
        path: ['reviewedAt'],
        message: 'Completed review requires a review date',
      });
    }
  });

export const ContentItemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    skillCode: z.string().regex(/^[a-z0-9-]+$/),
    mode: ContentModeSchema,
    difficulty: z.enum(['foundational', 'developing', 'challenging']),
    standards: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
    prerequisiteSkillCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    observableEvidence: z.array(z.string().trim().min(1).max(300)).min(1).max(10),
    prompt: z.string().trim().min(1).max(2000),
    contestFormat: ContestFormatSchema.optional(),
    solutionRepresentation: z.string().trim().min(1).max(4000),
    solutionMethod: z.string().trim().min(1).max(500),
    deterministicValidator: DeterministicValidatorSchema,
    misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    hintSteps: z.array(HintStepSchema).min(1).max(10),
    forbiddenLeakagePatterns: z.array(z.string().trim().min(1).max(200)).max(20),
    figure: ContentFigureSchema.optional(),
    // accessibilityNotes: guidance on how to present the item (e.g. avoid color dependence).
    // accessibleAlternative: an actual plain-text restatement of the prompt/data a
    // non-visual/assistive-technology learner can use in place of any diagram or image.
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
    accessibilityNotes: z.string().trim().min(1).max(1000),
    accessibleAlternative: z.string().trim().min(1).max(1000),
  })
  .strict()
  .superRefine((content, context) => {
    const orders = content.hintSteps.map((step) => step.order);
    if (new Set(orders).size !== orders.length) {
      context.addIssue({
        code: 'custom',
        path: ['hintSteps'],
        message: 'Hint orders must be unique',
      });
    }
    const expectedOrders = Array.from({ length: orders.length }, (_, index) => index + 1);
    if (
      orders
        .slice()
        .sort((a, b) => a - b)
        .some((order, index) => order !== expectedOrders[index])
    ) {
      context.addIssue({
        code: 'custom',
        path: ['hintSteps'],
        message: 'Hint orders must be contiguous starting at 1',
      });
    }
  });

export type ContentItem = z.infer<typeof ContentItemSchema>;
