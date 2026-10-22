import { createHash } from 'node:crypto';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { RequiredBank } from '../../../src/assessment/private-package-store';

// Database-free synthetic fixtures (RAT-INTEGRATE RI-3). Every code, id and
// prompt is invented; no private bank content is represented.

const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

export const sha256 = (value: unknown): string =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;

export type SyntheticBankSpec = {
  code: string;
  version: string;
  itemIds: readonly string[];
  skillCode?: string;
  role?: 'assessment' | 'review';
};

function syntheticItem(spec: SyntheticBankSpec, id: string) {
  const skillRef = { code: spec.skillCode ?? 'synthetic-skill', version: '1.0.0' };
  const base = {
    id,
    version: '1.0.0',
    title: `Synthetic item ${id}`,
    role: spec.role ?? 'assessment',
    skillRef,
    mode: 'core',
    difficulty: 'foundational',
    standards: ['SYN.1'],
    observableEvidence: ['States a synthetic answer.'],
    prompt: `Synthetic prompt ${id}?`,
    assessmentBankRef: { code: spec.code, version: spec.version },
    solutionRepresentation: '1',
    solutionMethod: 'Synthetic method.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: '1:1',
      acceptedAnswers: ['1:1'],
      equivalenceNotes: 'Synthetic.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: ['1:1'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'synthetic-reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Synthetic.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  };
  return { ...base, hash: sha256(base) };
}

export function syntheticBank(spec: SyntheticBankSpec) {
  const items = spec.itemIds.map((id) => syntheticItem(spec, id));
  return { code: spec.code, version: spec.version, contentHash: sha256(items), items };
}

export const syntheticPackage = (specs: readonly SyntheticBankSpec[]) => ({
  banks: specs.map(syntheticBank),
});

export async function writeSyntheticPackage(document: unknown): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'learning-forge-versioned-package-'));
  const path = join(directory, 'assessment-package.json');
  await writeFile(path, JSON.stringify(document), 'utf8');
  return path;
}

/** Required-bank descriptors matching a spec, as the derivation would emit. */
export const requiredFor = (
  spec: SyntheticBankSpec,
  extra: Partial<RequiredBank> = {},
): RequiredBank => ({
  code: spec.code,
  version: spec.version,
  minimumItems: spec.itemIds.length,
  requiredSkillRefs: [{ code: spec.skillCode ?? 'synthetic-skill', version: '1.0.0' }],
  ...extra,
});

const ids = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`);

/** Disjoint item ids for the two versions of one synthetic lesson bank code. */
export const SYNTHETIC_V1_SPEC: SyntheticBankSpec = {
  code: 'synthetic-lesson-bank',
  version: '1.0.0',
  itemIds: ids('synthetic-a', 3),
};
export const SYNTHETIC_V2_SPEC: SyntheticBankSpec = {
  code: 'synthetic-lesson-bank',
  version: '2.0.0',
  itemIds: ids('synthetic-b', 3),
};

// ---- Synthetic two-version catalog shaped like the post-RI-5 R-1 list. ----

const skill = (code: string) => ({ code, version: '1.0.0' });
const ref = (code: string, version: string) => ({ code, version });

type SyntheticLesson = { code: string; version: string; bank: string; bankVersion: string };

const LESSONS: readonly SyntheticLesson[] = [
  ...['alpha', 'beta', 'gamma'].map((s) => ({
    code: `${s}-lesson`,
    version: '1.0.0',
    bank: `${s}-lesson-bank`,
    bankVersion: '1.0.0',
  })),
  ...['alpha', 'beta', 'gamma'].map((s) => ({
    code: `${s}-lesson`,
    version: '2.0.0',
    bank: `${s}-lesson-bank`,
    bankVersion: '2.0.0',
  })),
  ...['delta', 'epsilon'].map((s) => ({
    code: `${s}-lesson`,
    version: '2.0.0',
    bank: `${s}-lesson-bank`,
    bankVersion: '1.0.0',
  })),
];

const skillOf = (lesson: SyntheticLesson): string => lesson.code.replace('-lesson', '');
const bankRecord = (
  code: string,
  version: string,
  target: { code: string; version: string },
  covered: readonly string[],
  itemCount: number,
) => ({
  code,
  version,
  targetRef: target,
  coveredSkillRefs: covered.map(skill),
  itemCount,
});

export function syntheticVersionedCatalog() {
  const lessons = LESSONS.map((lesson) => ({
    assessmentBankRef: ref(lesson.bank, lesson.bankVersion),
  }));
  const units = [
    { assessmentBankRef: ref('synthetic-unit-bank', '1.0.0') },
    { assessmentBankRef: ref('synthetic-unit-bank', '2.0.0') },
  ];
  const allSkills = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  const banks = [
    ...LESSONS.map((lesson) =>
      bankRecord(
        lesson.bank,
        lesson.bankVersion,
        ref(lesson.code, lesson.version),
        [skillOf(lesson)],
        9,
      ),
    ),
    bankRecord(
      'synthetic-unit-bank',
      '1.0.0',
      ref('synthetic-unit', '1.0.0'),
      allSkills.slice(0, 3),
      18,
    ),
    bankRecord('synthetic-unit-bank', '2.0.0', ref('synthetic-unit', '2.0.0'), allSkills, 30),
    ...allSkills.flatMap((code) => [
      bankRecord(`${code}-review-bank`, '1.0.0', skill(code), [code], 3),
      bankRecord(`${code}-delayed-check-bank`, '1.0.0', skill(code), [code], 6),
    ]),
  ];
  return { lessons, units, banks };
}
