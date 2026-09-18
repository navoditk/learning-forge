'use client';

import { PROGRAM_ROSTER } from '../../curriculum/program-roster';

export function ProgramSwitcher({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (program: string) => void;
}) {
  return (
    <div className="program-switcher">
      <label htmlFor="program-select">Subject</label>
      <select
        id="program-select"
        name="program"
        value={value ?? 'grade-6-math'}
        disabled={!onChange}
        onChange={(event) => onChange?.(event.target.value)}
      >
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
