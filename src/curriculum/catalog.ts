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
import moems6NumberAndPlaceValue from '../../content/skills/moems6-number-and-place-value.json';
import moems6PatternsAndCounting from '../../content/skills/moems6-patterns-and-counting.json';
import moems6GeometryAndMeasurement from '../../content/skills/moems6-geometry-and-measurement.json';
import moems6LogicAndArrangements from '../../content/skills/moems6-logic-and-arrangements.json';
import moems6CryptarithmReasoning from '../../content/skills/moems6-cryptarithm-reasoning.json';
import amc8CountingProbability from '../../content/skills/amc8-counting-probability.json';
import amc8EstimationNumberSense from '../../content/skills/amc8-estimation-number-sense.json';
import amc8ProportionalReasoning from '../../content/skills/amc8-proportional-reasoning.json';
import amc8ElementaryGeometry from '../../content/skills/amc8-elementary-geometry.json';
import amc8SpatialVisualization from '../../content/skills/amc8-spatial-visualization.json';
import amc8GraphsAndTables from '../../content/skills/amc8-graphs-and-tables.json';
import amc8IntroductoryAlgebra from '../../content/skills/amc8-introductory-algebra.json';
import amc8CoordinateGeometry from '../../content/skills/amc8-coordinate-geometry.json';
import mc6NumberTheoryFundamentals from '../../content/skills/mc6-number-theory-fundamentals.json';
import mc6FractionPercentFluency from '../../content/skills/mc6-fraction-percent-fluency.json';
import mc6ProportionalReasoningRates from '../../content/skills/mc6-proportional-reasoning-rates.json';
import mc6LinearEquationReasoning from '../../content/skills/mc6-linear-equation-reasoning.json';
import mc6SequencesAndPatterns from '../../content/skills/mc6-sequences-and-patterns.json';
import mc6GeometryAreaAndAngles from '../../content/skills/mc6-geometry-area-and-angles.json';
import mc6CountingAndProbability from '../../content/skills/mc6-counting-and-probability.json';
import mc6LogicalReasoning from '../../content/skills/mc6-logical-reasoning.json';
import snsb6OrthographicPatterns from '../../content/skills/snsb6-orthographic-patterns.json';
import snsb6MorphologyRoots from '../../content/skills/snsb6-morphology-roots.json';
import snsb6EtymologyLanguageOrigins from '../../content/skills/snsb6-etymology-language-origins.json';
import snsb6PhonemeGraphemeMapping from '../../content/skills/snsb6-phoneme-grapheme-mapping.json';
import snsb6HomophonesHomographs from '../../content/skills/snsb6-homophones-homographs.json';
import snsb6VocabularyContext from '../../content/skills/snsb6-vocabulary-context.json';
import snsb6VariantDictionaryJudgment from '../../content/skills/snsb6-variant-dictionary-judgment.json';
import snsb6OralRoundProcedure from '../../content/skills/snsb6-oral-round-procedure.json';
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
  moems6NumberAndPlaceValue,
  moems6PatternsAndCounting,
  moems6GeometryAndMeasurement,
  moems6LogicAndArrangements,
  moems6CryptarithmReasoning,
  amc8CountingProbability,
  amc8EstimationNumberSense,
  amc8ProportionalReasoning,
  amc8ElementaryGeometry,
  amc8SpatialVisualization,
  amc8GraphsAndTables,
  amc8IntroductoryAlgebra,
  amc8CoordinateGeometry,
  mc6NumberTheoryFundamentals,
  mc6FractionPercentFluency,
  mc6ProportionalReasoningRates,
  mc6LinearEquationReasoning,
  mc6SequencesAndPatterns,
  mc6GeometryAreaAndAngles,
  mc6CountingAndProbability,
  mc6LogicalReasoning,
  snsb6OrthographicPatterns,
  snsb6MorphologyRoots,
  snsb6EtymologyLanguageOrigins,
  snsb6PhonemeGraphemeMapping,
  snsb6HomophonesHomographs,
  snsb6VocabularyContext,
  snsb6VariantDictionaryJudgment,
  snsb6OralRoundProcedure,
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
