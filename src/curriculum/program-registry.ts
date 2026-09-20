import { Program, ProgramSchema } from '../contracts/progression';

const policy = (code: string) => ({ code, version: '1.0.0' });

const rawProgramRegistry = [
  {
    code: 'grade-6-math',
    version: '1.0.0',
    label: 'Grade 6 Math',
    available: true,
    subjectKind: 'graded-academic',
    skillCodePrefix: null,
    progressionMode: 'hybrid',
    unitRefs: [],
    accessPolicyRef: policy('grade-6-math-access'),
    legacyCompatibilityPolicyRef: policy('grade-6-math-legacy-compatibility'),
    defaultPolicyProfileRef: policy('grade-6-math-default'),
  },
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
  ...[
    ['grade-6-ela', 'Grade 6 ELA'],
    ['grade-6-science', 'Grade 6 Science'],
    ['grade-6-social-studies', 'Grade 6 Social Studies'],
    ['international-geography-bee-6', 'International Geography Bee (Grade 6)'],
    ['science-olympiad-division-b', 'Science Olympiad Division B (Grade 6)'],
  ].map(([code, label]) => ({
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
  })),
] as const;

export const PROGRAM_REGISTRY: readonly Program[] = rawProgramRegistry.map((program) =>
  ProgramSchema.parse(program),
);

export const programsByCode = new Map(PROGRAM_REGISTRY.map((program) => [program.code, program]));

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
