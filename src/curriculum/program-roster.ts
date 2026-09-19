/**
 * The full subject roadmap shown in the program switcher, on both the portal
 * and the public curriculum site. Distinct from `CurriculumProgramSchema`
 * (contracts/curriculum.ts), which only lists programs that have validated
 * content behind them today - this roster also lists ones that don't yet, so
 * the switcher can show the roadmap honestly instead of hiding it.
 */
export type ProgramRosterEntry = {
  code: string;
  label: string;
  available: boolean;
};

export const PROGRAM_ROSTER: readonly ProgramRosterEntry[] = [
  { code: 'grade-6-math', label: 'Grade 6 Math', available: true },
  { code: 'math-kangaroo-6', label: 'Math Kangaroo (Grade 6)', available: true },
  { code: 'moems-6', label: 'MOEMS Division E (Grade 6)', available: true },
  { code: 'amc-8', label: 'AMC 8 (Grade 6 prep)', available: true },
  { code: 'mathcounts-6', label: 'MATHCOUNTS (Grade 6)', available: true },
  { code: 'grade-6-ela', label: 'Grade 6 ELA', available: false },
  { code: 'grade-6-science', label: 'Grade 6 Science', available: false },
  { code: 'grade-6-social-studies', label: 'Grade 6 Social Studies', available: false },
];
