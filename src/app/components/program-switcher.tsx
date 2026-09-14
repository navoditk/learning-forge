'use client';

import { PROGRAM_ROSTER } from '../../curriculum/program-roster';

export function ProgramSwitcher() {
  return (
    <div className="program-switcher">
      <label htmlFor="program-select">Subject</label>
      <select id="program-select" name="program" defaultValue="grade-6-math">
        {PROGRAM_ROSTER.map((program) => (
          <option key={program.code} value={program.code} disabled={!program.available}>
            {program.label}
            {program.available ? '' : ' (coming soon)'}
          </option>
        ))}
      </select>
    </div>
  );
}
