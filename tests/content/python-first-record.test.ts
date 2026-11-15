import { describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import {
  deriveLiteralPrintOutput,
  listingStringValues,
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
// PYTHON-CONTENT-2 (D-330): exactly three more pending practice records, each
// with the author's hand-traced output, listing line count and the misconception
// code it is chiefly built to surface.
const LATER_RECORDS: Record<string, { output: string; lines: number; targets: string }> = {
  'py6-print-output-reading-2': {
    output: 'Bake sale\nMuffins 12\nPrice 1.5',
    lines: 3,
    targets: 'py6-prints-quotes',
  },
  'py6-print-output-reading-3': {
    output: 'Tomato plants 6\nRain 2.25 cm\nWatered False',
    lines: 3,
    targets: 'py6-comma-joins-without-space',
  },
  'py6-print-output-reading-4': {
    output: 'Scene 2 Lights True\nScene 1 Curtain up\nSnack break 0.25\nScene 3 Bow',
    lines: 4,
    targets: 'py6-runs-out-of-order',
  },
};

const skill = skillCatalog.find((candidate) => candidate.code === SKILL);
const record = contentCatalog.find((candidate) => candidate.id === RECORD);
const laterRecords = Object.keys(LATER_RECORDS).map((id) => {
  const found = contentCatalog.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
});

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
  it('is the first of the four records for the skill: a core, foundational practice record at content-1', () => {
    expect(
      contentCatalog
        .filter((candidate) => candidate.skillRef.code === SKILL)
        .map((candidate) => candidate.id),
    ).toEqual([RECORD, ...Object.keys(LATER_RECORDS)]);
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

describe('PYTHON-CONTENT-2 records py6-print-output-reading-2 to -4 (D-330)', () => {
  it.each(Object.entries(LATER_RECORDS))(
    '%s is a pending, owned, llm_drafted core foundational practice record at content-1',
    (id) => {
      const item = contentCatalog.find((candidate) => candidate.id === id);
      expect(item).toMatchObject({
        version: 'content-1',
        role: 'practice',
        skillRef: { code: SKILL, version: '1.0.0' },
        mode: 'core',
        difficulty: 'foundational',
        standards: ['PY6-P1-01'],
      });
      expect(item?.provenance).toEqual({ origin: 'llm_drafted', licenseStatus: 'owned' });
      expect(item?.review.status).toBe('pending_review');
      expect(item?.review.reviewer).toBe('pending human review');
      expect(item?.review.reviewedAt).toBeUndefined();
      expect(item?.review.originalityStatement).not.toMatch(
        /textbook|contest|tutorial|AoPS|w3schools|codecademy|code\.org|python\.org/i,
      );
    },
  );

  it.each(Object.entries(LATER_RECORDS))(
    '%s stays in the allowlist grammar and its canonical answer equals the hand trace and the derived output',
    (id, expected) => {
      const item = contentCatalog.find((candidate) => candidate.id === id)!;
      const listing = item.codeListing!;
      expect(listing.language).toBe('python');
      expect(listing.languageVersion).toBe(PROGRAM_LANGUAGE_PINS[PROGRAM]?.languageVersion);
      expect(pythonOutputListingViolations(listing.source)).toEqual([]);
      expect(parseLiteralPrintListing(listing.source).ok).toBe(true);
      expect(listing.source.split('\n')).toHaveLength(expected.lines);
      const validator = item.deterministicValidator;
      expect(validator.type).toBe('python_output');
      expect(validator.canonicalAnswer).toBe(expected.output);
      expect(deriveLiteralPrintOutput(listing.source)).toBe(expected.output);
      expect(validator.acceptedAnswers).toEqual([expected.output]);
      expect(pythonOutputCanonicalViolations(expected.output)).toEqual([]);
    },
  );

  it.each(Object.entries(LATER_RECORDS))(
    '%s has a 2 to 3 step hint ladder that leaks no literal, output line or the word true',
    (id, expected) => {
      const item = contentCatalog.find((candidate) => candidate.id === id)!;
      const steps = item.hintSteps;
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps.length).toBeLessThanOrEqual(3);
      expect(steps.map((step) => step.order)).toEqual(steps.map((_, index) => index + 1));
      const hintText = steps.map((step) => `${step.prompt} ${step.question}`).join(' ');
      expect(
        pythonOutputItemViolations({
          canonicalAnswer: expected.output,
          forbiddenLeakagePatterns: item.forbiddenLeakagePatterns,
          hintText,
          listingSource: item.codeListing!.source,
        }),
      ).toEqual([]);
      expect(item.forbiddenLeakagePatterns).toEqual(
        expect.arrayContaining([expected.output, ...expected.output.split('\n')]),
      );
      expect(hintText.toLowerCase()).not.toContain('true');
      for (const pattern of item.forbiddenLeakagePatterns) {
        expect(hintText.toLowerCase()).not.toContain(pattern.toLowerCase());
      }
    },
  );

  it.each(Object.entries(LATER_RECORDS))(
    '%s uses only declared misconception codes, including its target',
    (id, expected) => {
      const item = contentCatalog.find((candidate) => candidate.id === id)!;
      expect(item.misconceptionCodes).toContain(expected.targets);
      for (const code of item.misconceptionCodes) {
        expect(skill!.misconceptionCodes).toContain(code);
      }
    },
  );

  it.each(Object.entries(LATER_RECORDS))(
    '%s carries the required accessibility fields, describing every listing line',
    (id, expected) => {
      const item = contentCatalog.find((candidate) => candidate.id === id)!;
      expect(item.accessibilityNotes.trim().length).toBeGreaterThan(0);
      expect(item.codeListing!.structureDescription).toMatch(/no indentation/);
      for (let line = 1; line <= expected.lines; line += 1) {
        expect(item.accessibleAlternative).toContain(`Line ${line}:`);
      }
      for (const literal of listingStringValues(item.codeListing!.source)) {
        expect(item.accessibleAlternative).toContain(literal);
      }
    },
  );
});

describe('PYTHON-CONTENT protection: pending and unavailable', () => {
  it('keeps the program unavailable and refuses it as a learner program', () => {
    expect(programsByCode.get(PROGRAM)?.available).toBe(false);
    expect(PROGRAM_ROSTER.find((entry) => entry.code === PROGRAM)?.available).toBe(false);
    expect(() => parseAvailableProgram(PROGRAM)).toThrow(/not available/);
  });

  it('is not servable and keeps model tutoring off for the skill', () => {
    for (const id of [RECORD, ...Object.keys(LATER_RECORDS)]) {
      expect(
        servableContentCatalog.some((item) => item.id === id),
        id,
      ).toBe(false);
    }
    expect(servableContentCatalog.some((item) => item.skillRef.code === SKILL)).toBe(false);
    expect(isModelTutoringDisabled(SKILL)).toBe(true);
  });

  it('is withheld from the public projections, even if the program were available', () => {
    expect(
      publishableContentProjection(contentCatalog).some((item) =>
        [RECORD, ...Object.keys(LATER_RECORDS)].includes(item.id),
      ),
    ).toBe(false);
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
      ...Object.keys(LATER_RECORDS),
      ...laterRecords.flatMap((item) => [item.title, item.prompt]),
      'Muffins',
      'Watered',
      'Snack break',
    ]) {
      expect(rendered.body, leak).not.toContain(leak);
    }
    // Counts exclude the pending skill and record.
    const withoutPython = buildBody(
      contentCatalog.filter((item) => item.skillRef.code !== SKILL),
      skillCatalog.filter((candidate) => candidate.code !== SKILL),
      PROGRAM_ROSTER,
    );
    expect(rendered.stats).toBe(withoutPython.stats);
  });
});
