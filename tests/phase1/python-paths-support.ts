/**
 * Test support for PYTHON-IMPLEMENT. Not a test file and not curriculum content:
 * a synthetic `python_output` practice record and bank item, served only through
 * the ContentArchive or an in-memory bank. Its skill code is not the live
 * `py6-print-output-reading` skill (PYTHON-CONTENT), and nothing here executes code.
 */
import { contentCatalog } from '../../src/content/catalog';
import type { AssessmentContentItem } from '../../src/contracts/progression';
import { BANK_REF } from '../progression-integration/structured-assessment-support';

export const PY_SKILL = 'py6-synthetic-print-output';
export const PY_CANONICAL = 'Hi\n3';

export const PY_LISTING = {
  language: 'python',
  languageVersion: '3.14',
  source: 'print("Hi")\nprint(3)',
  showLineNumbers: true,
  structureDescription: 'Two lines at the left margin with no indentation.',
} as const;

export const PY_VALIDATOR = {
  type: 'python_output',
  canonicalAnswer: PY_CANONICAL,
  acceptedAnswers: [PY_CANONICAL],
  equivalenceNotes: 'Exact output only; one correct form.',
} as const;

const TEMPLATE = contentCatalog.find((item) => item.id === 'ratio-language-1') as unknown as Record<
  string,
  unknown
>;

/** A complete synthetic practice record with a python_output validator. */
export function pythonPracticeItem(id: string, version = 'python-1'): Record<string, unknown> {
  return {
    ...TEMPLATE,
    id,
    version,
    title: `Synthetic python item ${id}`,
    skillRef: { code: PY_SKILL, version: '1.0.0' },
    prompt: 'What does this program print? Synthetic prompt for validation only.',
    codeListing: PY_LISTING,
    deterministicValidator: PY_VALIDATOR,
    solutionRepresentation: 'Synthetic hand trace for validation only.',
    solutionMethod: 'Read the lines from top to bottom.',
    hintSteps: [
      {
        order: 1,
        assistanceLevel: 'small_strategic_hint',
        prompt: 'Read line 1, then line 2.',
        question: 'What does each line show?',
      },
    ],
    forbiddenLeakagePatterns: [PY_CANONICAL],
    misconceptionCodes: [],
    accessibilityNotes: 'Synthetic note: the code is also described in text.',
    accessibleAlternative:
      'Synthetic text alternative: two print lines, one prints a short piece of text and one prints a whole number.',
  };
}

/** A synthetic assessment bank item with a python_output validator. */
export function pythonBankItem(id: string): AssessmentContentItem & { hash: string } {
  return {
    role: 'assessment',
    id,
    version: '1.0.0',
    hash: `sha256:${id}`,
    title: `Synthetic python assessment ${id}`,
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['Reads the printed output.'],
    assessmentBankRef: BANK_REF,
    prompt: 'What does this program print? Synthetic prompt for validation only.',
    codeListing: PY_LISTING,
    deterministicValidator: PY_VALIDATOR,
    misconceptionCodes: [],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'synthetic reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original synthetic fixture.',
    },
    accessibilityNotes: 'Synthetic note: the code is also described in text.',
    accessibleAlternative:
      'Synthetic text alternative: two print lines, one with a text value and one with a whole number.',
    itemReadinessRefs: [],
    solutionRepresentation: 'Synthetic hand trace.',
    solutionMethod: 'Read top to bottom.',
    forbiddenLeakagePatterns: [PY_CANONICAL],
  } as unknown as AssessmentContentItem & { hash: string };
}
