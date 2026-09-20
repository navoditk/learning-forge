import { z } from 'zod';

/** Canonical program-code vocabulary shared by curriculum contracts and registry. */
export const PROGRAM_CODES = [
  'grade-6-math',
  'math-kangaroo-6',
  'moems-6',
  'amc-8',
  'mathcounts-6',
  'scripps-spelling-bee-6',
  'grade-6-ela',
  'grade-6-science',
  'grade-6-social-studies',
  'international-geography-bee-6',
  'science-olympiad-division-b',
] as const;

export const ProgramCodeSchema = z.enum(PROGRAM_CODES);
export type ProgramCode = z.infer<typeof ProgramCodeSchema>;
