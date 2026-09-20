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

import { PROGRAM_REGISTRY } from './program-registry';

export const PROGRAM_ROSTER: readonly ProgramRosterEntry[] = PROGRAM_REGISTRY.map(
  ({ code, label, available }) => ({ code, label, available }),
);
