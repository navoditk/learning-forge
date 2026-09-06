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
import { RatioContent, RatioContentSchema } from '../contracts/content';
import { skillsByCode } from '../curriculum/catalog';

const rawRatioContent = [
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
] as const;

export function validateRatioCatalog(items: readonly unknown[] = rawRatioContent): RatioContent[] {
  const parsed = items.map((item) => RatioContentSchema.parse(item));
  const ids = new Set(parsed.map((item) => item.id));
  if (ids.size !== parsed.length) {
    throw new Error('Ratio content IDs must be unique');
  }

  const requiredSkills: Set<RatioContent['skillCode']> = new Set([
    'ratio-language',
    'unit-rates',
    'ratio-tables',
    'double-number-lines',
    'percent-applications',
  ]);
  const actualSkills = new Set(parsed.map((item) => item.skillCode));
  for (const skill of requiredSkills) {
    if (!actualSkills.has(skill)) {
      throw new Error(`Ratio catalog is missing skill coverage for ${skill}`);
    }
  }

  for (const item of parsed) {
    if (!skillsByCode.has(item.skillCode)) {
      throw new Error(`${item.id} references unknown skill: ${item.skillCode}`);
    }
    if (item.provenance.origin === 'licensed') {
      throw new Error(`${item.id}: licensed content is not yet supported by this catalog`);
    }
    if (item.provenance.licenseStatus !== 'owned') {
      throw new Error(`${item.id} must be marked owned for the Phase 0 seed`);
    }
    if (item.review.status !== 'pending_review') {
      throw new Error(`${item.id} must remain pending educator review`);
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
  }

  return parsed;
}

export const ratioContentCatalog = validateRatioCatalog();
