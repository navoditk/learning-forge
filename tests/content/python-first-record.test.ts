import { describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import {
  deriveLiteralPrintOutput,
  parseLiteralPrintListing,
} from '../../src/contracts/python-scan';
import {
  PROGRAM_LANGUAGE_PINS,
  pythonOutputCanonicalViolations,
  pythonOutputItemViolations,
  pythonOutputListingViolations,
} from '../../src/contracts/python';
import { skillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import { programsByCode } from '../../src/curriculum/program-registry';
import { parseAvailableProgram } from '../../src/phase1/program';
import { isModelTutoringDisabled } from '../../src/tutor/model-gating';

// PYTHON-CONTENT (D-322 H1/H4, D-321, D-323): the one approved Python entry
// skill and its single pending practice record, loaded through the real
// catalogs. Nothing here executes Python: the expected output below is the
// author's hand trace, and the derived-output check re-derives it from the
// allowlist grammar without running anything.
const PROGRAM = 'python-intro-grade-6';
const SKILL = 'py6-print-output-reading';
const RECORD = 'py6-print-output-reading-1';
const HAND_TRACED_OUTPUT = 'Launch check\nRockets 3\nFuel 2.0\nHatch closed True';

const skill = skillCatalog.find((candidate) => candidate.code === SKILL);
const record = contentCatalog.find((candidate) => candidate.id === RECORD);

describe('PYTHON-CONTENT skill py6-print-output-reading', () => {
  it('loads as the program entry node with the approved identity', () => {
    expect(skill).toMatchObject({
      code: SKILL,
      version: '1.0.0',
      program: PROGRAM,
      domain: 'py6-programming-fundamentals',
      standards: ['PY6-P1-01'],
      prerequisiteSkillCodes: [],
      difficultyBands: ['foundational'],
    });
    expect(skill?.misconceptionCodes).toEqual([
      'py6-prints-quotes',
      'py6-bool-case',
      'py6-int-float-same',
      'py6-comma-joins-without-space',
      'py6-runs-out-of-order',
    ]);
    expect(skill?.masteryCheckRule).toContain('program-internal objective code');
    expect(skill?.observableEvidence.length).toBeGreaterThan(0);
    // No other skill depends on it or is added beside it.
    expect(skillCatalog.filter((candidate) => candidate.program === PROGRAM)).toHaveLength(1);
    expect(skillCatalog.some((candidate) => candidate.prerequisiteSkillCodes.includes(SKILL))).toBe(
      false,
    );
  });
});

describe('PYTHON-CONTENT record py6-print-output-reading-1', () => {
  it('is the only record for the skill: one core, foundational practice record at content-1', () => {
    expect(contentCatalog.filter((candidate) => candidate.skillRef.code === SKILL)).toEqual([
      record,
    ]);
    expect(record).toMatchObject({
      version: 'content-1',
      role: 'practice',
      skillRef: { code: SKILL, version: '1.0.0' },
      mode: 'core',
      difficulty: 'foundational',
      standards: ['PY6-P1-01'],
    });
  });

  it('is llm_drafted, owned and pending human review with no review date', () => {
    expect(record?.provenance).toEqual({ origin: 'llm_drafted', licenseStatus: 'owned' });
    expect(record?.review.status).toBe('pending_review');
    expect(record?.review.reviewer).toBe('pending human review');
    expect(record?.review.reviewedAt).toBeUndefined();
    expect(record?.review.originalityStatement).not.toMatch(
      /textbook|contest|tutorial|AoPS|w3schools|codecademy|code\.org|python\.org/i,
    );
  });

  it('pins its listing to the program language version and stays inside the allowlist grammar', () => {
    const listing = record?.codeListing;
    expect(listing).toBeDefined();
    expect(listing?.language).toBe(PROGRAM_LANGUAGE_PINS[PROGRAM]?.language);
    expect(listing?.languageVersion).toBe('3.14');
    expect(listing?.languageVersion).toBe(PROGRAM_LANGUAGE_PINS[PROGRAM]?.languageVersion);
    expect(pythonOutputListingViolations(listing!.source)).toEqual([]);
    const parsed = parseLiteralPrintListing(listing!.source);
    expect(parsed.ok).toBe(true);
    expect(listing!.source.split('\n')).toHaveLength(4);
  });

  it('has a canonical answer equal to the hand trace and to the output derived from the listing', () => {
    const validator = record!.deterministicValidator;
    expect(validator.type).toBe('python_output');
    expect(validator.canonicalAnswer).toBe(HAND_TRACED_OUTPUT);
    expect(deriveLiteralPrintOutput(record!.codeListing!.source)).toBe(HAND_TRACED_OUTPUT);
    expect(validator.acceptedAnswers).toEqual([validator.canonicalAnswer]);
    expect(pythonOutputCanonicalViolations(validator.canonicalAnswer)).toEqual([]);
  });

  it('has a 2 to 3 step hint ladder that quotes no code literal or output line, with full leakage coverage', () => {
    const steps = record!.hintSteps;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.length).toBeLessThanOrEqual(3);
    expect(steps.map((step) => step.order)).toEqual(steps.map((_, index) => index + 1));
    const hintText = steps.map((step) => `${step.prompt} ${step.question}`).join(' ');
    expect(
      pythonOutputItemViolations({
        canonicalAnswer: record!.deterministicValidator.canonicalAnswer,
        forbiddenLeakagePatterns: record!.forbiddenLeakagePatterns,
        hintText,
        listingSource: record!.codeListing!.source,
      }),
    ).toEqual([]);
    expect(record!.forbiddenLeakagePatterns).toEqual(
      expect.arrayContaining([HAND_TRACED_OUTPUT, ...HAND_TRACED_OUTPUT.split('\n')]),
    );
    // No hint names a Boolean output word in either case.
    expect(hintText.toLowerCase()).not.toContain('true');
  });

  it('uses only misconception codes its skill declares, and every declared one', () => {
    expect([...record!.misconceptionCodes].sort()).toEqual([...skill!.misconceptionCodes].sort());
  });

  it('carries the required accessibility fields, describing each listing line', () => {
    expect(record!.accessibilityNotes.trim().length).toBeGreaterThan(0);
    expect(record!.codeListing!.structureDescription).toMatch(/Four lines/);
    expect(record!.codeListing!.structureDescription).toMatch(/no indentation/);
    const alternative = record!.accessibleAlternative;
    for (const phrase of [
      'four lines',
      'Line 1',
      'Line 2',
      'Line 3',
      'Line 4',
      'Launch check',
      'Rockets',
      'whole number 3',
      'Fuel',
      'decimal number 2.0',
      'Hatch closed',
      'capital T',
    ]) {
      expect(alternative, phrase).toContain(phrase);
    }
  });
});

describe('PYTHON-CONTENT protection: pending and unavailable', () => {
  it('keeps the program unavailable and refuses it as a learner program', () => {
    expect(programsByCode.get(PROGRAM)?.available).toBe(false);
    expect(PROGRAM_ROSTER.find((entry) => entry.code === PROGRAM)?.available).toBe(false);
    expect(() => parseAvailableProgram(PROGRAM)).toThrow(/not available/);
  });

  it('is not servable and keeps model tutoring off for the skill', () => {
    expect(servableContentCatalog.some((item) => item.id === RECORD)).toBe(false);
    expect(servableContentCatalog.some((item) => item.skillRef.code === SKILL)).toBe(false);
    expect(isModelTutoringDisabled(SKILL)).toBe(true);
  });

  it('is withheld from the public projections, even if the program were available', () => {
    expect(publishableContentProjection(contentCatalog).some((item) => item.id === RECORD)).toBe(
      false,
    );
    expect(
      publishableSkillProjection(skillCatalog, contentCatalog, PROGRAM_ROSTER).some(
        (candidate) => candidate.code === SKILL,
      ),
    ).toBe(false);
    const available = PROGRAM_ROSTER.map((entry) =>
      entry.code === PROGRAM ? { ...entry, available: true } : entry,
    );
    expect(
      publishableSkillProjection(skillCatalog, contentCatalog, available).some(
        (candidate) => candidate.code === SKILL,
      ),
    ).toBe(false);
  });

  it('leaves the public site with only the Coming soon placeholder for the program', () => {
    const rendered = buildBody(contentCatalog, skillCatalog, PROGRAM_ROSTER);
    const placeholder = rendered.body.match(
      new RegExp(
        `<section class="program-section program-section-empty" id="program-${PROGRAM}">[\\s\\S]*?</section>`,
      ),
    );
    expect(placeholder?.[0]).toContain('Coming soon');
    expect(placeholder?.[0]).toContain('This program is not available yet.');
    for (const leak of [
      SKILL,
      RECORD,
      skill!.title,
      record!.title,
      'PY6-P1-01',
      'Programming Fundamentals',
      'print(',
      'Launch check',
      'Hatch closed',
      record!.prompt,
    ]) {
      expect(rendered.body, leak).not.toContain(leak);
    }
    // Counts exclude the pending skill and record.
    const withoutPython = buildBody(
      contentCatalog.filter((item) => item.id !== RECORD),
      skillCatalog.filter((candidate) => candidate.code !== SKILL),
      PROGRAM_ROSTER,
    );
    expect(rendered.stats).toBe(withoutPython.stats);
  });
});
