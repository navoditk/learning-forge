import areaOfCompositeShapes from '../../content/skills/area-of-composite-shapes.json';
import centerAndVariability from '../../content/skills/center-and-variability.json';
import coordinateDistance from '../../content/skills/coordinate-distance.json';
import coordinateGeometry from '../../content/skills/coordinate-geometry.json';
import coordinatePlane from '../../content/skills/coordinate-plane.json';
import dependentAndIndependentVariables from '../../content/skills/dependent-and-independent-variables.json';
import distributions from '../../content/skills/distributions.json';
import divisionOfFractions from '../../content/skills/division-of-fractions.json';
import doubleNumberLines from '../../content/skills/double-number-lines.json';
import equationAndInequalityMeaning from '../../content/skills/equation-and-inequality-meaning.json';
import equivalentExpressions from '../../content/skills/equivalent-expressions.json';
import fractionDecimalOperations from '../../content/skills/fraction-decimal-operations.json';
import gcfAndLcm from '../../content/skills/gcf-and-lcm.json';
import multiDigitDivision from '../../content/skills/multi-digit-division.json';
import negativeNumbersAndAbsoluteValue from '../../content/skills/negative-numbers-and-absolute-value.json';
import oneVariableEquations from '../../content/skills/one-variable-equations.json';
import percentApplications from '../../content/skills/percent-applications.json';
import prismVolume from '../../content/skills/prism-volume.json';
import ratioLanguage from '../../content/skills/ratio-language.json';
import ratioTables from '../../content/skills/ratio-tables.json';
import realWorldInequalities from '../../content/skills/real-world-inequalities.json';
import statisticalQuestions from '../../content/skills/statistical-questions.json';
import surfaceAreaAndVolume from '../../content/skills/surface-area-and-volume.json';
import unitRates from '../../content/skills/unit-rates.json';
import variablesAndExpressions from '../../content/skills/variables-and-expressions.json';
import variablesInContext from '../../content/skills/variables-in-context.json';
import wholeNumberExponents from '../../content/skills/whole-number-exponents.json';
import mk6MultiStepArithmeticReasoning from '../../content/skills/mk6-multi-step-arithmetic-reasoning.json';
import mk6NumberPatternsAndMagicSquares from '../../content/skills/mk6-number-patterns-and-magic-squares.json';
import mk6ClockAndCalendarReasoning from '../../content/skills/mk6-clock-and-calendar-reasoning.json';
import mk6PerimeterAndAreaReasoning from '../../content/skills/mk6-perimeter-and-area-reasoning.json';
import mk6AngleAndShapeProperties from '../../content/skills/mk6-angle-and-shape-properties.json';
import mk6SpatialVisualization3d from '../../content/skills/mk6-spatial-visualization-3d.json';
import mk6LogicalDeductionPuzzles from '../../content/skills/mk6-logical-deduction-puzzles.json';
import mk6CombinatorialCounting from '../../content/skills/mk6-combinatorial-counting.json';
import { Skill, SkillSchema } from '../contracts/curriculum';
import { topologicalOrder } from './topological-sort';

const rawSkills = [
  ratioLanguage,
  unitRates,
  ratioTables,
  doubleNumberLines,
  percentApplications,
  fractionDecimalOperations,
  divisionOfFractions,
  negativeNumbersAndAbsoluteValue,
  coordinatePlane,
  coordinateDistance,
  variablesAndExpressions,
  variablesInContext,
  equivalentExpressions,
  equationAndInequalityMeaning,
  oneVariableEquations,
  realWorldInequalities,
  dependentAndIndependentVariables,
  areaOfCompositeShapes,
  prismVolume,
  surfaceAreaAndVolume,
  coordinateGeometry,
  statisticalQuestions,
  distributions,
  centerAndVariability,
  wholeNumberExponents,
  gcfAndLcm,
  multiDigitDivision,
  mk6MultiStepArithmeticReasoning,
  mk6NumberPatternsAndMagicSquares,
  mk6ClockAndCalendarReasoning,
  mk6PerimeterAndAreaReasoning,
  mk6AngleAndShapeProperties,
  mk6SpatialVisualization3d,
  mk6LogicalDeductionPuzzles,
  mk6CombinatorialCounting,
] as const;

export function topologicalSkillOrder(skills: readonly Skill[]): string[] {
  const bySkillCode = new Map(skills.map((skill) => [skill.code, skill]));
  return topologicalOrder(
    skills.map((skill) => skill.code),
    (code) => bySkillCode.get(code)?.prerequisiteSkillCodes ?? [],
  );
}

export function validateSkillCatalog(items: readonly unknown[] = rawSkills): Skill[] {
  const parsed = items.map((item) => SkillSchema.parse(item));

  const codes = new Set(parsed.map((skill) => skill.code));
  if (codes.size !== parsed.length) {
    throw new Error('Skill codes must be unique');
  }

  for (const skill of parsed) {
    for (const prerequisite of skill.prerequisiteSkillCodes) {
      if (!codes.has(prerequisite)) {
        throw new Error(`${skill.code} references unknown prerequisite skill: ${prerequisite}`);
      }
    }
  }

  topologicalSkillOrder(parsed);

  return parsed;
}

export const skillCatalog = validateSkillCatalog();

export const skillsByCode = new Map(skillCatalog.map((skill) => [skill.code, skill]));

export function arePrerequisitesMet(code: string, metSkillCodes: ReadonlySet<string>): boolean {
  const skill = skillsByCode.get(code);
  if (!skill) throw new Error(`Unknown skill code: ${code}`);
  return skill.prerequisiteSkillCodes.every((prerequisite) => metSkillCodes.has(prerequisite));
}
