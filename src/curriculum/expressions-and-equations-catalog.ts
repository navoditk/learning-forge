import type { Lesson, Ref, Unit } from '../contracts/progression';
import { LessonSchema, UnitSchema } from '../contracts/progression';

/**
 * Wraps all 8 Expressions and Equations skills into a new unit, the same
 * way ratios-extension-catalog.ts and number-system-catalog.ts wrap their
 * domains - reusing already-reviewed production practice content
 * (content/expressions-and-equations/*.json) verbatim, no new problems
 * authored. See ratios-extension-catalog.ts's header for why this is not
 * wired into COURSE_CATALOG yet.
 *
 * Lesson order follows the skill prerequisite chain: variables-and-
 * expressions and whole-number-exponents are prerequisite-free;
 * variables-in-context and equation-and-inequality-meaning depend on
 * variables-and-expressions; dependent-and-independent-variables depends
 * on variables-in-context; equivalent-expressions, one-variable-
 * equations, and real-world-inequalities depend on
 * equation-and-inequality-meaning plus a Number System skill
 * (gcf-and-lcm, negative-numbers-and-absolute-value, coordinate-plane
 * respectively - cross-domain prerequisites this standalone wrapping
 * does not re-validate, same as the production skill graph already
 * allows).
 */
const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
export const EXPRESSIONS_AND_EQUATIONS_UNIT_REF = {
  code: 'expressions-and-equations',
  version,
} satisfies Ref;

const skillRef = (code: string): Ref => ({ code, version });
const itemRef = (id: string, hash: string) => ({
  id,
  version: 'content-1',
  hash: `sha256:${hash}`,
});

const review = {
  status: 'reviewed' as const,
  reviewer: 'Navodit Kaushik (product/content owner)',
  reviewedAt: '2026-09-06',
  originalityStatement:
    'Practice content reused verbatim from the already-reviewed production catalog (content/expressions-and-equations/*.json); no new problems authored for this wrapping.',
};
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };

function lesson(
  code: string,
  title: string,
  objective: string,
  skillCode: string,
  itemIds: readonly [string, string],
  hashes: readonly [string, string],
): Lesson {
  return LessonSchema.parse({
    code,
    unitRef: EXPRESSIONS_AND_EQUATIONS_UNIT_REF,
    version,
    title,
    objectives: [objective],
    skillRefs: [skillRef(skillCode)],
    teachingContentRefs: [],
    practiceContentRefs: [itemRef(itemIds[0], hashes[0]), itemRef(itemIds[1], hashes[1])],
    assessmentBankRef: { code: `${code}-bank`, version },
    policyProfileRef,
    provenance,
    review,
  });
}

export const EXPRESSIONS_AND_EQUATIONS_LESSONS: readonly Lesson[] = [
  lesson(
    'variables-and-expressions-lesson',
    'Variables and expressions',
    'Writes and evaluates an algebraic expression from a word description.',
    'variables-and-expressions',
    ['variables-and-expressions-1', 'variables-and-expressions-2'],
    [
      '2669348ea99baab05f4342659209d0d1c138f893ac744e3c810646ef73174f87',
      'c287f9726a451a6297055cad83371446e2de2863072e56f9ba05bb73c4da6f86',
    ],
  ),
  lesson(
    'whole-number-exponents-lesson',
    'Whole-number exponents',
    'Writes a repeated multiplication as an exponent and evaluates numerical expressions containing whole-number exponents, including within order of operations.',
    'whole-number-exponents',
    ['whole-number-exponents-1', 'whole-number-exponents-2'],
    [
      'fe60c032fb3ce1861426176fce8256933440d6026924b10ef5e3adee01ba8d66',
      'a324293e5a1de7043d51a71c7255115824e5a1fe7dea80a901ce723dfe6a8b9e',
    ],
  ),
  lesson(
    'variables-in-context-lesson',
    'Variables in context',
    'Writes an expression for a real-world quantity using a variable and states what the variable represents.',
    'variables-in-context',
    ['variables-in-context-1', 'variables-in-context-2'],
    [
      '7e85e4a2b8465844d4ee91203e2e9b5f55af9f4e37339f0b9aecb760f9588f4e',
      '8fa2ad3bfc3f087e1dd46a4e8df5ce7cbf2b60c22b2d351ecf9764d27e8823ac',
    ],
  ),
  lesson(
    'dependent-and-independent-variables-lesson',
    'Dependent and independent variables',
    'Identifies the dependent and independent variable in a relationship and represents it with an equation, table, or graph.',
    'dependent-and-independent-variables',
    ['dependent-and-independent-variables-1', 'dependent-and-independent-variables-2'],
    [
      '18152cdef918aec337e89fc6543265704cc8cc46eee2605c5dac4ac2415ceb4a',
      '7d54b67752b6b6602e35f0de4e0395537d7e1b5290b9902f6795649918ad8cab',
    ],
  ),
  lesson(
    'equation-and-inequality-meaning-lesson',
    'Equation and inequality meaning',
    "Determines whether a given value makes an equation or inequality true by substitution, and describes an inequality's full solution set.",
    'equation-and-inequality-meaning',
    ['equation-and-inequality-meaning-1', 'equation-and-inequality-meaning-2'],
    [
      '29b4282fd3029ee5c2ffcd4ac23083e5a8f120dacfb0bacc256b1d5357a15967',
      '15c25bbfac719a430973cb5e3ae53657330ac04a01e92553a440ba92dd978362',
    ],
  ),
  lesson(
    'equivalent-expressions-lesson',
    'Equivalent expressions',
    'Uses the distributive property or combines like terms to show two expressions are equivalent.',
    'equivalent-expressions',
    ['equivalent-expressions-1', 'equivalent-expressions-2'],
    [
      'b6e9587e54fef54037b557c068fbc012c059db8e5cf59aa2885d2625e90b74ea',
      '7ad389083535ea0080046f44cbda01c52afb3236b83450b2b4d9f6d5f331ace0',
    ],
  ),
  lesson(
    'one-variable-equations-lesson',
    'One-variable equations',
    'Solves a one-variable equation with a rational coefficient and verifies the solution by substitution.',
    'one-variable-equations',
    ['one-variable-equations-1', 'one-variable-equations-2'],
    [
      '72b13217b06e267caab7e0d98bd8cac6a5ac837d91bf3c8116ee6449cda92fbe',
      '66a57ed46133e9dc0dee0af45d94b54318aac77ac794b0139066e64b6acaff4c',
    ],
  ),
  lesson(
    'real-world-inequalities-lesson',
    'Real-world inequalities',
    'Writes an inequality for a real-world constraint, tests candidate values, and describes the solution set on a number line.',
    'real-world-inequalities',
    ['real-world-inequalities-1', 'real-world-inequalities-2'],
    [
      '5e3e1304c51495385cf19293276951b803d4468a16455edd67c36907d811467a',
      'be1eaa1831b2dc995b5a139773daca97bb156d360a9259ec76e27e062a9fb3b1',
    ],
  ),
];

export const EXPRESSIONS_AND_EQUATIONS_UNIT: Unit = UnitSchema.parse({
  code: EXPRESSIONS_AND_EQUATIONS_UNIT_REF.code,
  programRef,
  version,
  title: 'Expressions and equations',
  summary:
    'Build algebraic expressions, exponents, equation and inequality meaning, equivalence, and one-variable solving.',
  lessonRefs: EXPRESSIONS_AND_EQUATIONS_LESSONS.map(({ code, version: lessonVersion }) => ({
    code,
    version: lessonVersion,
  })),
  policyProfileRef,
  provenance,
  review,
});
