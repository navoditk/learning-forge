import doubleNumberLines1 from '../../content/ratios/double-number-lines-1.json';
import doubleNumberLines2 from '../../content/ratios/double-number-lines-2.json';
import percentApplications1 from '../../content/ratios/percent-applications-1.json';
import percentApplications2 from '../../content/ratios/percent-applications-2.json';
import ratioLanguage1 from '../../content/ratios/ratio-language-1.json';
import ratioLanguage2 from '../../content/ratios/ratio-language-2.json';
import ratioTables1 from '../../content/ratios/ratio-tables-1.json';
import ratioTables2 from '../../content/ratios/ratio-tables-2.json';
import unitRates1 from '../../content/ratios/unit-rates-1.json';
import unitRates2 from '../../content/ratios/unit-rates-2.json';
import fractionDecimalOperations1 from '../../content/number-system/fraction-decimal-operations-1.json';
import fractionDecimalOperations2 from '../../content/number-system/fraction-decimal-operations-2.json';
import negativeNumbersAndAbsoluteValue1 from '../../content/number-system/negative-numbers-and-absolute-value-1.json';
import negativeNumbersAndAbsoluteValue2 from '../../content/number-system/negative-numbers-and-absolute-value-2.json';
import divisionOfFractions1 from '../../content/number-system/division-of-fractions-1.json';
import divisionOfFractions2 from '../../content/number-system/division-of-fractions-2.json';
import coordinatePlane1 from '../../content/number-system/coordinate-plane-1.json';
import coordinatePlane2 from '../../content/number-system/coordinate-plane-2.json';
import coordinateDistance1 from '../../content/number-system/coordinate-distance-1.json';
import coordinateDistance2 from '../../content/number-system/coordinate-distance-2.json';
import variablesAndExpressions1 from '../../content/expressions-and-equations/variables-and-expressions-1.json';
import variablesAndExpressions2 from '../../content/expressions-and-equations/variables-and-expressions-2.json';
import variablesInContext1 from '../../content/expressions-and-equations/variables-in-context-1.json';
import variablesInContext2 from '../../content/expressions-and-equations/variables-in-context-2.json';
import equivalentExpressions1 from '../../content/expressions-and-equations/equivalent-expressions-1.json';
import equivalentExpressions2 from '../../content/expressions-and-equations/equivalent-expressions-2.json';
import equationAndInequalityMeaning1 from '../../content/expressions-and-equations/equation-and-inequality-meaning-1.json';
import equationAndInequalityMeaning2 from '../../content/expressions-and-equations/equation-and-inequality-meaning-2.json';
import oneVariableEquations1 from '../../content/expressions-and-equations/one-variable-equations-1.json';
import oneVariableEquations2 from '../../content/expressions-and-equations/one-variable-equations-2.json';
import realWorldInequalities1 from '../../content/expressions-and-equations/real-world-inequalities-1.json';
import realWorldInequalities2 from '../../content/expressions-and-equations/real-world-inequalities-2.json';
import dependentAndIndependentVariables1 from '../../content/expressions-and-equations/dependent-and-independent-variables-1.json';
import dependentAndIndependentVariables2 from '../../content/expressions-and-equations/dependent-and-independent-variables-2.json';
import areaOfCompositeShapes1 from '../../content/geometry/area-of-composite-shapes-1.json';
import areaOfCompositeShapes2 from '../../content/geometry/area-of-composite-shapes-2.json';
import prismVolume1 from '../../content/geometry/prism-volume-1.json';
import prismVolume2 from '../../content/geometry/prism-volume-2.json';
import surfaceAreaAndVolume1 from '../../content/geometry/surface-area-and-volume-1.json';
import surfaceAreaAndVolume2 from '../../content/geometry/surface-area-and-volume-2.json';
import coordinateGeometry1 from '../../content/geometry/coordinate-geometry-1.json';
import coordinateGeometry2 from '../../content/geometry/coordinate-geometry-2.json';
import statisticalQuestions1 from '../../content/statistics/statistical-questions-1.json';
import statisticalQuestions2 from '../../content/statistics/statistical-questions-2.json';
import distributions1 from '../../content/statistics/distributions-1.json';
import distributions2 from '../../content/statistics/distributions-2.json';
import centerAndVariability1 from '../../content/statistics/center-and-variability-1.json';
import centerAndVariability2 from '../../content/statistics/center-and-variability-2.json';
import wholeNumberExponents1 from '../../content/expressions-and-equations/whole-number-exponents-1.json';
import wholeNumberExponents2 from '../../content/expressions-and-equations/whole-number-exponents-2.json';
import gcfAndLcm1 from '../../content/number-system/gcf-and-lcm-1.json';
import gcfAndLcm2 from '../../content/number-system/gcf-and-lcm-2.json';
import multiDigitDivision1 from '../../content/number-system/multi-digit-division-1.json';
import multiDigitDivision2 from '../../content/number-system/multi-digit-division-2.json';
import { ContentItem, ContentItemSchema } from '../contracts/content';
import { skillCatalog, skillsByCode } from '../curriculum/catalog';

const rawContent = [
  ratioLanguage1,
  ratioLanguage2,
  unitRates1,
  unitRates2,
  ratioTables1,
  ratioTables2,
  doubleNumberLines1,
  doubleNumberLines2,
  percentApplications1,
  percentApplications2,
  fractionDecimalOperations1,
  fractionDecimalOperations2,
  negativeNumbersAndAbsoluteValue1,
  negativeNumbersAndAbsoluteValue2,
  divisionOfFractions1,
  divisionOfFractions2,
  coordinatePlane1,
  coordinatePlane2,
  coordinateDistance1,
  coordinateDistance2,
  variablesAndExpressions1,
  variablesAndExpressions2,
  variablesInContext1,
  variablesInContext2,
  equivalentExpressions1,
  equivalentExpressions2,
  equationAndInequalityMeaning1,
  equationAndInequalityMeaning2,
  oneVariableEquations1,
  oneVariableEquations2,
  realWorldInequalities1,
  realWorldInequalities2,
  dependentAndIndependentVariables1,
  dependentAndIndependentVariables2,
  areaOfCompositeShapes1,
  areaOfCompositeShapes2,
  prismVolume1,
  prismVolume2,
  surfaceAreaAndVolume1,
  surfaceAreaAndVolume2,
  coordinateGeometry1,
  coordinateGeometry2,
  statisticalQuestions1,
  statisticalQuestions2,
  distributions1,
  distributions2,
  centerAndVariability1,
  centerAndVariability2,
  wholeNumberExponents1,
  wholeNumberExponents2,
  gcfAndLcm1,
  gcfAndLcm2,
  multiDigitDivision1,
  multiDigitDivision2,
] as const;

export function validateContentCatalog(items: readonly unknown[] = rawContent): ContentItem[] {
  const parsed = items.map((item) => ContentItemSchema.parse(item));
  const ids = new Set(parsed.map((item) => item.id));
  if (ids.size !== parsed.length) {
    throw new Error('Content IDs must be unique');
  }

  for (const item of parsed) {
    const skill = skillsByCode.get(item.skillCode);
    if (!skill) {
      throw new Error(`${item.id} references unknown skill: ${item.skillCode}`);
    }
    if (item.provenance.origin === 'licensed') {
      throw new Error(`${item.id}: licensed content is not yet supported by this catalog`);
    }
    if (item.provenance.licenseStatus !== 'owned') {
      throw new Error(`${item.id} must be marked owned for the Phase 0 seed`);
    }
    if (
      !item.deterministicValidator.acceptedAnswers.includes(
        item.deterministicValidator.canonicalAnswer,
      )
    ) {
      throw new Error(`${item.id} must list its canonical answer as an accepted answer`);
    }
    const hintText = item.hintSteps.map((step) => `${step.prompt} ${step.question}`).join(' ');
    for (const forbiddenPattern of item.forbiddenLeakagePatterns) {
      if (hintText.toLocaleLowerCase().includes(forbiddenPattern.toLocaleLowerCase())) {
        throw new Error(`${item.id} leaks forbidden answer content in its hint ladder`);
      }
    }
    if (!skill.difficultyBands.includes(item.difficulty)) {
      throw new Error(
        `${item.id} has difficulty "${item.difficulty}" not declared in ${item.skillCode}'s difficultyBands`,
      );
    }
    const declaredMisconceptions = new Set(skill.misconceptionCodes);
    for (const code of item.misconceptionCodes) {
      if (!declaredMisconceptions.has(code)) {
        throw new Error(
          `${item.id} uses misconception code "${code}" not declared by skill ${item.skillCode}`,
        );
      }
    }
  }

  const countsBySkill = new Map<string, number>();
  for (const item of parsed) {
    countsBySkill.set(item.skillCode, (countsBySkill.get(item.skillCode) ?? 0) + 1);
  }
  const REQUIRED_RECORDS_PER_SKILL = 2;
  for (const skill of skillCatalog) {
    const count = countsBySkill.get(skill.code) ?? 0;
    if (count !== REQUIRED_RECORDS_PER_SKILL) {
      throw new Error(
        `${skill.code} must have exactly ${REQUIRED_RECORDS_PER_SKILL} content records, found ${count}`,
      );
    }
  }

  return parsed;
}

export const contentCatalog = validateContentCatalog();

/**
 * Content that has completed human review and is safe to serve to learners.
 * `pending_review` items exist in the catalog for authoring/merge workflows
 * but must never reach a learner-facing surface (diagnostic, plan, tutor
 * session, or review queue) until a human reviewer flips their status.
 */
export const servableContentCatalog = contentCatalog.filter(
  (item) => item.review.status === 'reviewed',
);
