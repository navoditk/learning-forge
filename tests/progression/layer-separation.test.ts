import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';

function jsonFiles(directory: string): string[] {
  return readdirSync(path.join(process.cwd(), directory))
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(directory, file));
}

describe('curriculum and policy layer separation', () => {
  it('keeps numeric contest readiness bars out of authored content', () => {
    const contentFiles = [
      ...jsonFiles('content/ratios'),
      ...jsonFiles('content/number-system'),
      ...jsonFiles('content/expressions-and-equations'),
      ...jsonFiles('content/geometry'),
      ...jsonFiles('content/statistics'),
      ...jsonFiles('content/amc-8'),
      ...jsonFiles('content/math-kangaroo-6'),
      ...jsonFiles('content/mathcounts-6'),
      ...jsonFiles('content/moems-6'),
      ...jsonFiles('content/scripps-spelling-bee-6'),
    ];
    expect(contentFiles).not.toHaveLength(0);
    for (const file of contentFiles) {
      expect(readFileSync(path.join(process.cwd(), file), 'utf8')).not.toContain(
        'readinessRequirement',
      );
    }
  });

  it('defines readiness bars on the policy schema and artifact instead', () => {
    expect(ProgressionPolicyProfileSchema.shape.contestReadinessRequirement).toBeDefined();
    const amc8 = JSON.parse(
      readFileSync(
        path.join(process.cwd(), 'policy/progression-profiles/amc-8-default.json'),
        'utf8',
      ),
    ) as { contestReadinessRequirement?: unknown };
    expect(amc8.contestReadinessRequirement).toEqual({
      minEstimate: 0.8,
      disallowLowConfidence: true,
      requireIndependentDelayedCheck: true,
    });
  });
});
