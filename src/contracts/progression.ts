import { z } from 'zod';

import { ContentModeSchema, VersionSchema } from './common';
import {
  ContentFigureSchema,
  ContentItemSchema,
  ContentProvenanceSchema,
  ContentReviewSchema,
  ContestFormatSchema,
  DeterministicValidatorSchema,
  HintStepSchema,
} from './content';
import { CurriculumProgramSchema, DifficultyBandSchema } from './curriculum';

const CodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+$/);

/** A version-pinned reference to an authored curriculum or policy artifact. */
export const RefSchema = z.object({ code: CodeSchema, version: VersionSchema }).strict();
export type Ref = z.infer<typeof RefSchema>;

/** A version- and integrity-pinned reference to delivered content. */
export const ItemRefSchema = z
  .object({ id: CodeSchema, version: VersionSchema, hash: z.string().trim().min(1).max(128) })
  .strict();
export type ItemRef = z.infer<typeof ItemRefSchema>;

export const ProgressionModeSchema = z.enum(['unit-sequenced', 'hybrid', 'skill-graph-only']);
export type ProgressionMode = z.infer<typeof ProgressionModeSchema>;

export const SubjectKindSchema = z.enum([
  'graded-academic',
  'enrichment-contest',
  'enrichment-non-graded',
]);

export const ProgramSchema = z
  .object({
    code: CodeSchema,
    version: VersionSchema,
    label: z.string().trim().min(1).max(160),
    available: z.boolean(),
    subjectKind: SubjectKindSchema,
    skillCodePrefix: z
      .string()
      .regex(/^[a-z0-9]+-$/)
      .nullable(),
    progressionMode: ProgressionModeSchema,
    unitRefs: z.array(RefSchema),
    accessPolicyRef: RefSchema,
    legacyCompatibilityPolicyRef: RefSchema.nullable(),
    defaultPolicyProfileRef: RefSchema,
  })
  .strict()
  .superRefine((program, context) => {
    if (program.progressionMode === 'skill-graph-only' && program.unitRefs.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['unitRefs'],
        message: 'Skill-graph programs have no units',
      });
    }
    if (program.progressionMode === 'unit-sequenced' && program.unitRefs.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['unitRefs'],
        message: 'Unit-sequenced programs require at least one unit',
      });
    }
    if (program.progressionMode === 'hybrid' && !program.legacyCompatibilityPolicyRef) {
      context.addIssue({
        code: 'custom',
        path: ['legacyCompatibilityPolicyRef'],
        message: 'Hybrid programs require a legacy compatibility policy reference',
      });
    }
    if (program.progressionMode !== 'hybrid' && program.legacyCompatibilityPolicyRef) {
      context.addIssue({
        code: 'custom',
        path: ['legacyCompatibilityPolicyRef'],
        message: 'Only hybrid programs may declare a legacy compatibility policy',
      });
    }
  });
export type Program = z.infer<typeof ProgramSchema>;

export const UnitSchema = z
  .object({
    code: CodeSchema,
    programRef: RefSchema,
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(1000),
    lessonRefs: z.array(RefSchema),
    policyProfileRef: RefSchema,
    reviewPolicyRef: RefSchema.optional(),
    assessmentBankRef: RefSchema.optional(),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
  })
  .strict();
export type Unit = z.infer<typeof UnitSchema>;

export const LessonSchema = z
  .object({
    code: CodeSchema,
    unitRef: RefSchema,
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    objectives: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
    skillRefs: z.array(RefSchema).min(1),
    teachingContentRefs: z.array(ItemRefSchema),
    practiceContentRefs: z.array(ItemRefSchema),
    assessmentBankRef: RefSchema,
    policyProfileRef: RefSchema.optional(),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
  })
  .strict();
export type Lesson = z.infer<typeof LessonSchema>;

export const AssessmentBankSchema = z
  .object({
    code: CodeSchema,
    version: VersionSchema,
    targetRef: RefSchema,
    policyProfileRef: RefSchema,
    coveredSkillRefs: z.array(RefSchema).min(1),
    itemCount: z.number().int().positive(),
    contentHash: z.string().trim().min(1).max(128),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
  })
  .strict();
export type AssessmentBank = z.infer<typeof AssessmentBankSchema>;

export const ContentRoleSchema = z.enum(['teaching', 'practice', 'assessment', 'review']);
export type ContentRole = z.infer<typeof ContentRoleSchema>;

const TransitionContentBaseSchema = z
  .object({
    id: CodeSchema,
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    role: ContentRoleSchema,
    skillRef: RefSchema,
    mode: ContentModeSchema,
    difficulty: DifficultyBandSchema,
    standards: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
    observableEvidence: z.array(z.string().trim().min(1).max(300)).min(1).max(10),
    figure: ContentFigureSchema.optional(),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
    accessibilityNotes: z.string().trim().min(1).max(1000),
    accessibleAlternative: z.string().trim().min(1).max(1000),
    itemReadinessRefs: z.array(RefSchema),
  })
  .strict();

export const TeachingContentItemSchema = TransitionContentBaseSchema.extend({
  role: z.literal('teaching'),
  explanation: z.string().trim().min(1).max(4000),
  workedExample: z.string().trim().min(1).max(4000).optional(),
}).strict();

export const PracticeContentItemSchema = TransitionContentBaseSchema.extend({
  role: z.literal('practice'),
  prompt: z.string().trim().min(1).max(2000),
  contestFormat: ContestFormatSchema.optional(),
  solutionRepresentation: z.string().trim().min(1).max(4000),
  solutionMethod: z.string().trim().min(1).max(500),
  deterministicValidator: DeterministicValidatorSchema,
  misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
  hintSteps: z.array(HintStepSchema).min(1).max(10),
  forbiddenLeakagePatterns: z.array(z.string().trim().min(1).max(200)).max(20),
}).strict();
export type PracticeContentItem = z.infer<typeof PracticeContentItemSchema>;

export const AssessmentContentItemSchema = TransitionContentBaseSchema.extend({
  role: z.literal('assessment'),
  assessmentBankRef: RefSchema,
  prompt: z.string().trim().min(1).max(2000),
  contestFormat: ContestFormatSchema.optional(),
  solutionRepresentation: z.string().trim().min(1).max(4000),
  solutionMethod: z.string().trim().min(1).max(500),
  deterministicValidator: DeterministicValidatorSchema,
  misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
  forbiddenLeakagePatterns: z.array(z.string().trim().min(1).max(200)).max(20),
}).strict();
export type AssessmentContentItem = z.infer<typeof AssessmentContentItemSchema>;

export const ReviewContentItemSchema = TransitionContentBaseSchema.extend({
  role: z.literal('review'),
  assessmentBankRef: RefSchema,
  prompt: z.string().trim().min(1).max(2000),
  contestFormat: ContestFormatSchema.optional(),
  solutionRepresentation: z.string().trim().min(1).max(4000),
  solutionMethod: z.string().trim().min(1).max(500),
  deterministicValidator: DeterministicValidatorSchema,
  misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
  forbiddenLeakagePatterns: z.array(z.string().trim().min(1).max(200)).max(20),
}).strict();

export type ReviewContentItem = z.infer<typeof ReviewContentItemSchema>;

export const VersionedContentItemSchema = z.discriminatedUnion('role', [
  TeachingContentItemSchema,
  PracticeContentItemSchema,
  AssessmentContentItemSchema,
  ReviewContentItemSchema,
]);

/** Transition parser: current role-less records remain valid while new records are introduced. */
export const ContentRecordSchema = z.union([ContentItemSchema, VersionedContentItemSchema]);
export type ContentRecord = z.infer<typeof ContentRecordSchema>;

export const PublishedContentRecordSchema = VersionedContentItemSchema;
export type PublishedContentRecord = z.infer<typeof PublishedContentRecordSchema>;

export const VersionedSkillSchema = z
  .object({
    code: CodeSchema,
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    program: CurriculumProgramSchema,
    domain: z.string().trim().min(1).max(160),
    standards: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
    prerequisiteRefs: z.array(RefSchema),
    observableEvidence: z.array(z.string().trim().min(1).max(300)).min(1).max(10),
    misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    difficultyBands: z.array(DifficultyBandSchema).min(1).max(3),
    masteryCheckRule: z.string().trim().min(1).max(300),
  })
  .strict();
export type VersionedSkill = z.infer<typeof VersionedSkillSchema>;
