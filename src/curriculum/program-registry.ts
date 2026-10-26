import { Program, ProgramSchema } from '../contracts/progression';
import ACTIVE_SELECTION from './grade-6-math-active-selection.json';
import { PILOT_PROGRAM_UNIT_REFS } from './pilot-catalog';
import { RATIOS_UNIT_2_PROGRAM } from './ratios-unit-2-catalog';

const policy = (code: string, version = '1.0.0') => ({ code, version });

const placeholderProgram = (code: string, label: string) => ({
  code,
  version: '1.0.0',
  label,
  available: false,
  subjectKind: 'enrichment-non-graded' as const,
  skillCodePrefix: null,
  progressionMode: 'skill-graph-only' as const,
  unitRefs: [],
  accessPolicyRef: policy(`${code}-access`),
  legacyCompatibilityPolicyRef: null,
  defaultPolicyProfileRef: policy(`${code}-default`),
});

const rawProgramRegistry = [
  {
    code: 'grade-6-math',
    version: '1.0.0',
    label: 'Grade 6 Math',
    available: true,
    subjectKind: 'graded-academic',
    skillCodePrefix: null,
    progressionMode: 'hybrid',
    unitRefs: PILOT_PROGRAM_UNIT_REFS,
    // 1.1.0 grants unit-covered pilot targets full progression kinds (D-60).
    accessPolicyRef: policy('grade-6-math-access', '1.1.0'),
    legacyCompatibilityPolicyRef: policy('grade-6-math-legacy-compatibility'),
    // 1.1.0 enables review reuse after two runs (D-67).
    defaultPolicyProfileRef: policy('grade-6-math-default', '1.1.0'),
  },
  // grade-6-math@1.1.0 (RI-5): the Ratios 2.0.0 unit; activated by the selection.
  RATIOS_UNIT_2_PROGRAM,
  {
    code: 'math-kangaroo-6',
    version: '1.0.0',
    label: 'Math Kangaroo (Grade 6)',
    available: true,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: 'mk6-',
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: policy('math-kangaroo-6-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('math-kangaroo-6-default'),
  },
  {
    code: 'moems-6',
    version: '1.0.0',
    label: 'MOEMS Division E (Grade 6)',
    available: true,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: 'moems6-',
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: policy('moems-6-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('moems-6-default'),
  },
  {
    code: 'amc-8',
    version: '1.0.0',
    label: 'AMC 8 (Grade 6 prep)',
    available: true,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: 'amc8-',
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: policy('amc-8-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('amc-8-default'),
  },
  {
    code: 'mathcounts-6',
    version: '1.0.0',
    label: 'MATHCOUNTS (Grade 6)',
    available: true,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: 'mc6-',
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: policy('mathcounts-6-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('mathcounts-6-default'),
  },
  {
    code: 'scripps-spelling-bee-6',
    version: '1.0.0',
    label: 'Scripps National Spelling Bee (Grade 6)',
    available: true,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: 'snsb6-',
    progressionMode: 'skill-graph-only',
    unitRefs: [],
    accessPolicyRef: policy('scripps-spelling-bee-6-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('scripps-spelling-bee-6-default'),
  },
  placeholderProgram('grade-6-ela', 'Grade 6 ELA'),
  // Own entry (SCI6-PREREQ, D-172): a graded, skill-graph-only program with its
  // own skill-code prefix. Available (SU-H5 activation, D-188): the Cells unit
  // is practice only, and the label says so.
  {
    code: 'grade-6-science',
    version: '1.0.0',
    label: 'Grade 6 Science (Cells unit, practice only)',
    available: true,
    subjectKind: 'graded-academic' as const,
    skillCodePrefix: 'sci6-',
    progressionMode: 'skill-graph-only' as const,
    unitRefs: [],
    accessPolicyRef: policy('grade-6-science-access'),
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policy('grade-6-science-default'),
  },
  placeholderProgram('grade-6-social-studies', 'Grade 6 Social Studies'),
  placeholderProgram('international-geography-bee-6', 'International Geography Bee (Grade 6)'),
  placeholderProgram('science-olympiad-division-b', 'Science Olympiad Division B (Grade 6)'),
] as const;

export const PROGRAM_REGISTRY: readonly Program[] = rawProgramRegistry.map((program) =>
  ProgramSchema.parse(program),
);

/**
 * Active-only projection (P-A, D-229): one program per code, the version the
 * active selection names, in registry declaration order. The version index
 * lives in `VERSIONED_COURSE_CATALOG`; this never lists a non-selected version.
 */
export function selectActivePrograms(
  programs: readonly Program[],
  selection: { programs: readonly { code: string; version: string }[] },
): Program[] {
  const keys = new Set(selection.programs.map((ref) => `${ref.code}@${ref.version}`));
  return programs.filter((program) => keys.has(`${program.code}@${program.version}`));
}

export const ACTIVE_PROGRAMS: readonly Program[] = selectActivePrograms(
  PROGRAM_REGISTRY,
  ACTIVE_SELECTION,
);

export const programsByCode = new Map(ACTIVE_PROGRAMS.map((program) => [program.code, program]));

export function validateProgramSkillInvariants(
  skills: readonly {
    code: string;
    program: string;
    prerequisiteSkillCodes?: readonly string[];
    prerequisiteRefs?: readonly { code: string }[];
  }[],
  programs: readonly Program[] = PROGRAM_REGISTRY,
): void {
  const byCode = new Map(programs.map((program) => [program.code, program]));
  const skillsByCode = new Map(skills.map((skill) => [skill.code, skill]));

  for (const skill of skills) {
    const program = byCode.get(skill.program);
    if (!program) throw new Error(`${skill.code} references unknown program: ${skill.program}`);
    if (program.skillCodePrefix && !skill.code.startsWith(program.skillCodePrefix)) {
      throw new Error(`${skill.code} does not use ${skill.program}'s skill code prefix`);
    }
    const prerequisites = [
      ...(skill.prerequisiteSkillCodes ?? []),
      ...(skill.prerequisiteRefs ?? []).map((ref) => ref.code),
    ];
    for (const prerequisite of prerequisites) {
      const prerequisiteSkill = skillsByCode.get(prerequisite);
      if (prerequisiteSkill && prerequisiteSkill.program !== skill.program) {
        throw new Error(`${skill.code} cannot depend on a skill from ${prerequisiteSkill.program}`);
      }
    }
  }
}
