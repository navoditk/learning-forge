import { z } from 'zod';

export const CurriculumDomainSchema = z.enum([
  'ratios-and-proportional-reasoning',
  'number-system',
  'expressions-and-equations',
  'geometry',
  'statistics',
]);

export type CurriculumDomain = z.infer<typeof CurriculumDomainSchema>;

export const DifficultyBandSchema = z.enum(['foundational', 'developing', 'challenging']);

export type DifficultyBand = z.infer<typeof DifficultyBandSchema>;

const SkillCodeSchema = z.string().regex(/^[a-z0-9-]+$/);

export const SkillSchema = z
  .object({
    code: SkillCodeSchema,
    title: z.string().trim().min(1).max(160),
    domain: CurriculumDomainSchema,
    standards: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
    prerequisiteSkillCodes: z.array(SkillCodeSchema).max(10),
    observableEvidence: z.array(z.string().trim().min(1).max(300)).min(1).max(10),
    misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    difficultyBands: z.array(DifficultyBandSchema).min(1).max(3),
    masteryCheckRule: z.string().trim().min(1).max(300),
  })
  .strict()
  .superRefine((skill, context) => {
    if (skill.prerequisiteSkillCodes.includes(skill.code)) {
      context.addIssue({
        code: 'custom',
        path: ['prerequisiteSkillCodes'],
        message: 'A skill cannot list itself as its own prerequisite',
      });
    }
    if (new Set(skill.difficultyBands).size !== skill.difficultyBands.length) {
      context.addIssue({
        code: 'custom',
        path: ['difficultyBands'],
        message: 'Difficulty bands must not repeat',
      });
    }
  });

export type Skill = z.infer<typeof SkillSchema>;
