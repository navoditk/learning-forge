import { deriveLiteralPrintOutput } from '../contracts/python-scan';
import {
  PROGRAM_LANGUAGE_PINS,
  PYTHON_PROGRAM_CODE,
  pythonOutputItemViolations,
  pythonOutputListingViolations,
  type CodeListing,
} from '../contracts/python';

/**
 * Catalog-load rules for the Python intro (PYTHON-IMPLEMENT, dossier 5.1, 5.2,
 * 5.4, 7.1 C4 and C5). Shape-level checks live in `src/contracts/python.ts`;
 * these need the item's program and hint ladder. Nothing is executed.
 */
type PythonRuleItem = {
  id: string;
  codeListing?: CodeListing;
  deterministicValidator?: { type: string; canonicalAnswer: string };
  hintSteps?: readonly { prompt: string; question: string }[];
  forbiddenLeakagePatterns?: readonly string[];
};

export function validatePythonContentRules(item: PythonRuleItem, program: string): void {
  const pin = PROGRAM_LANGUAGE_PINS[program];
  if (item.codeListing) {
    if (!pin) {
      throw new Error(`${item.id} has a codeListing but its program has no language pin`);
    }
    if (
      item.codeListing.language !== pin.language ||
      item.codeListing.languageVersion !== pin.languageVersion
    ) {
      throw new Error(
        `${item.id} codeListing ${item.codeListing.language} ${item.codeListing.languageVersion} does not match the program pin ${pin.language} ${pin.languageVersion}`,
      );
    }
  }
  const validator = item.deterministicValidator;
  if (validator?.type === 'python_output' && program !== PYTHON_PROGRAM_CODE) {
    throw new Error(`${item.id} uses python_output outside ${PYTHON_PROGRAM_CODE}`);
  }
  if (program !== PYTHON_PROGRAM_CODE || !validator) return;
  // The only approved Python question type is predict-the-output (D-321); the
  // legacy matchers lowercase and match substrings, which is unsafe for output.
  if (validator.type !== 'python_output') {
    throw new Error(`${item.id} must use a python_output validator in ${PYTHON_PROGRAM_CODE}`);
  }
  if (!item.codeListing) {
    throw new Error(`${item.id} requires a codeListing for a python_output validator`);
  }
  const violations = [
    ...pythonOutputListingViolations(item.codeListing.source),
    ...pythonOutputItemViolations({
      canonicalAnswer: validator.canonicalAnswer,
      forbiddenLeakagePatterns: item.forbiddenLeakagePatterns ?? [],
      hintText: (item.hintSteps ?? []).map((step) => `${step.prompt} ${step.question}`).join(' '),
      listingSource: item.codeListing.source,
    }),
  ];
  // The allowlist grammar makes the printed output derivable without running
  // anything; the authored canonical answer must equal it exactly.
  const derived = deriveLiteralPrintOutput(item.codeListing.source);
  if (derived !== undefined && derived !== validator.canonicalAnswer) {
    violations.push('canonicalAnswer must equal the output derived from the literal prints');
  }
  if (violations.length > 0) {
    throw new Error(
      `${item.id} violates the python_output authoring rules: ${violations.join('; ')}`,
    );
  }
}
