import { CurriculumProgram, CurriculumProgramSchema } from '../contracts';
import { PROGRAM_ROSTER } from '../curriculum/program-roster';

export const DEFAULT_CURRICULUM_PROGRAM: CurriculumProgram = 'grade-6-math';

export function parseAvailableProgram(value: string | null): CurriculumProgram {
  const parsed = CurriculumProgramSchema.safeParse(value ?? DEFAULT_CURRICULUM_PROGRAM);
  if (!parsed.success) throw new Error('Unknown curriculum program');
  const rosterEntry = PROGRAM_ROSTER.find((entry) => entry.code === parsed.data);
  if (!rosterEntry?.available) throw new Error('Curriculum program is not available');
  return parsed.data;
}
