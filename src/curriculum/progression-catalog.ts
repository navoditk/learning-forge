import type { AssessmentBank, Lesson, Program, Ref, Unit } from '../contracts/progression';
import { RefSchema } from '../contracts/progression';

type RefRecord = { code: string; version: string };

function refKey(ref: RefRecord): string {
  return `${ref.code}@${ref.version}`;
}

function indexRefs<T extends RefRecord>(records: readonly T[], label: string): Map<string, T> {
  const index = new Map<string, T>();
  for (const record of records) {
    const parsed = RefSchema.parse({ code: record.code, version: record.version });
    const key = refKey(parsed);
    if (index.has(key)) throw new Error(`Duplicate ${label} reference: ${key}`);
    index.set(key, record);
  }
  return index;
}

function assertUniqueList(refs: readonly Ref[], label: string): void {
  const keys = refs.map(refKey);
  if (new Set(keys).size !== keys.length)
    throw new Error(`${label} contains a duplicate reference`);
}

function requireRef<T extends RefRecord>(index: Map<string, T>, ref: Ref, label: string): T {
  const record = index.get(refKey(ref));
  if (!record) throw new Error(`${label} reference does not resolve: ${refKey(ref)}`);
  return record;
}

function assertExactRefs(actual: readonly Ref[], expected: readonly Ref[], label: string): void {
  if (
    actual.length !== expected.length ||
    actual.some((ref, index) => refKey(ref) !== refKey(expected[index]))
  ) {
    throw new Error(`${label} ordering or membership is inconsistent`);
  }
}

/** Validates the authored Program → Unit → Lesson ordering spine and bank coverage. */
export function validateProgressionCatalog(
  programs: readonly Program[],
  units: readonly Unit[],
  lessons: readonly Lesson[],
  banks: readonly AssessmentBank[],
): void {
  const unitsByRef = indexRefs(units, 'unit');
  const lessonsByRef = indexRefs(lessons, 'lesson');
  const banksByRef = indexRefs(banks, 'assessment bank');
  const claimedUnits = new Set<string>();
  const claimedLessons = new Set<string>();

  for (const program of programs) {
    assertUniqueList(program.unitRefs, `Program ${program.code}@${program.version} units`);
    const programUnits = program.unitRefs.map((ref) => requireRef(unitsByRef, ref, 'Program unit'));
    for (const unit of programUnits) {
      const unitKey = refKey(unit);
      if (claimedUnits.has(unitKey))
        throw new Error(`Unit ${unitKey} is listed by multiple programs`);
      claimedUnits.add(unitKey);
      if (refKey(unit.programRef) !== refKey(program)) {
        throw new Error(`Unit ${unit.code}@${unit.version} points to a different program`);
      }
      const unitLessons = unit.lessonRefs.map((ref) =>
        requireRef(lessonsByRef, ref, 'Unit lesson'),
      );
      assertUniqueList(unit.lessonRefs, `Unit ${unit.code}@${unit.version} lessons`);
      for (const lesson of unitLessons) {
        const lessonKey = refKey(lesson);
        if (claimedLessons.has(lessonKey)) {
          throw new Error(`Lesson ${lessonKey} is listed by multiple units`);
        }
        claimedLessons.add(lessonKey);
        if (refKey(lesson.unitRef) !== refKey(unit)) {
          throw new Error(`Lesson ${lesson.code}@${lesson.version} points to a different unit`);
        }
        const lessonBank = requireRef(
          banksByRef,
          lesson.assessmentBankRef,
          'Lesson assessment bank',
        );
        const covered = new Set(lessonBank.coveredSkillRefs.map(refKey));
        for (const skillRef of lesson.skillRefs) {
          if (!covered.has(refKey(skillRef))) {
            throw new Error(
              `Assessment bank ${lessonBank.code}@${lessonBank.version} does not cover lesson skill ${refKey(skillRef)}`,
            );
          }
        }
      }
      assertExactRefs(
        unit.lessonRefs,
        unitLessons.map((lesson) => ({ code: lesson.code, version: lesson.version })),
        `Unit ${unit.code}@${unit.version} lesson`,
      );
      if (unit.assessmentBankRef) {
        const unitBank = requireRef(banksByRef, unit.assessmentBankRef, 'Unit assessment bank');
        const unitSkillRefs = unitLessons.flatMap((lesson) => lesson.skillRefs);
        const covered = new Set(unitBank.coveredSkillRefs.map(refKey));
        for (const skillRef of unitSkillRefs) {
          if (!covered.has(refKey(skillRef))) {
            throw new Error(
              `Assessment bank ${unitBank.code}@${unitBank.version} does not cover unit skill ${refKey(skillRef)}`,
            );
          }
        }
      }
    }
    assertExactRefs(
      program.unitRefs,
      programUnits.map((unit) => ({ code: unit.code, version: unit.version })),
      `Program ${program.code}@${program.version} unit`,
    );
  }
  for (const unit of units) {
    if (!claimedUnits.has(refKey(unit)))
      throw new Error(`Unit ${refKey(unit)} is not listed by a program`);
  }
  for (const lesson of lessons) {
    if (!claimedLessons.has(refKey(lesson))) {
      throw new Error(`Lesson ${refKey(lesson)} is not listed by a unit`);
    }
  }
}

type SkillNode = {
  code: string;
  program: string;
  version?: string;
  prerequisiteSkillCodes?: readonly string[];
  prerequisiteRefs?: readonly Ref[];
};

type ReadinessItem = {
  id: string;
  skillRef: Ref;
  itemReadinessRefs: readonly Ref[];
};

/** Validates that item readiness references stay inside the owning skill's prerequisite closure. */
export function validateItemReadinessRefs(
  items: readonly ReadinessItem[],
  skills: readonly SkillNode[],
): void {
  const skillsByCode = new Map(skills.map((skill) => [skill.code, skill]));

  const prerequisitesOf = (skill: SkillNode): Set<string> => {
    const closure = new Set<string>();
    const visit = (code: string): void => {
      if (closure.has(code)) return;
      closure.add(code);
      const prerequisite = skillsByCode.get(code);
      if (!prerequisite) throw new Error(`Unknown readiness prerequisite skill: ${code}`);
      for (const ref of prerequisite.prerequisiteRefs ?? []) visit(ref.code);
      for (const codeRef of prerequisite.prerequisiteSkillCodes ?? []) visit(codeRef);
    };
    for (const ref of skill.prerequisiteRefs ?? []) visit(ref.code);
    for (const code of skill.prerequisiteSkillCodes ?? []) visit(code);
    return closure;
  };

  for (const item of items) {
    const owner = skillsByCode.get(item.skillRef.code);
    if (!owner)
      throw new Error(`${item.id} references unknown owning skill: ${item.skillRef.code}`);
    if (owner.version && owner.version !== item.skillRef.version) {
      throw new Error(`${item.id} pins skill ${item.skillRef.code} to the wrong version`);
    }
    const closure = prerequisitesOf(owner);
    for (const readinessRef of item.itemReadinessRefs) {
      if (readinessRef.code === owner.code) {
        throw new Error(`${item.id} cannot declare its owning skill as item readiness`);
      }
      const readinessSkill = skillsByCode.get(readinessRef.code);
      if (!readinessSkill) {
        throw new Error(`${item.id} references unknown item readiness skill: ${readinessRef.code}`);
      }
      if (readinessSkill.program !== owner.program) {
        throw new Error(`${item.id} cannot reference item readiness from another program`);
      }
      if (readinessSkill.version && readinessSkill.version !== readinessRef.version) {
        throw new Error(`${item.id} pins item readiness to the wrong skill version`);
      }
      if (!closure.has(readinessRef.code)) {
        throw new Error(
          `${item.id} item readiness is outside the owning skill prerequisite closure`,
        );
      }
    }
  }
}
