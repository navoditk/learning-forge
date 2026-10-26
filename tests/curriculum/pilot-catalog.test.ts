import { describe, expect, it } from 'vitest';

import { PROGRAM_REGISTRY, programsByCode } from '../../src/curriculum/program-registry';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../src/curriculum/pilot-catalog';
import { validateProgressionCatalog } from '../../src/curriculum/progression-catalog';

describe('Grade 6 Math pilot progression catalog', () => {
  it('validates the authored three-lesson unit spine and bank coverage', () => {
    // RI-5: the active program is 1.1.0; the pilot spine is program 1.0.0 (retained).
    expect(programsByCode.get('grade-6-math')?.version).toBe('1.1.0');
    const program = PROGRAM_REGISTRY.find(
      (entry) => entry.code === 'grade-6-math' && entry.version === '1.0.0',
    );
    if (!program) throw new Error('Grade 6 Math registry entry is missing');

    validateProgressionCatalog([program], PILOT_UNITS, PILOT_LESSONS, PILOT_ASSESSMENT_BANKS);
    expect(program.unitRefs).toEqual([
      { code: 'ratios-and-proportional-reasoning', version: '1.0.0' },
    ]);
    expect(PILOT_LESSONS).toHaveLength(3);
    expect(PILOT_ASSESSMENT_BANKS.filter((bank) => bank.itemCount === 9)).toHaveLength(3);
    expect(PILOT_ASSESSMENT_BANKS.find((bank) => bank.itemCount === 18)?.code).toBe(
      'ratios-proportional-reasoning-unit-bank',
    );
  });
});
