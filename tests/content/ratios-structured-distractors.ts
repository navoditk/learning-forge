/**
 * Reviewed numeric-distractor map for the 22 accepted Grade 6 Ratios practice
 * records (RAT-CONTENT RC-5, scope R-5 binding item 6). Test support only; not
 * content and not part of the structured schema. Merged unchanged from the
 * frozen `draft-A-rev2` and `draft-B-rev2` `distractors.json` files.
 *
 * Shape: `id@version` -> field key -> either `distractors` (each a wrong
 * number tied to a misconception code declared on the item, in the "n" or
 * "n/d" form parsed by `generateVectors`) or a reviewed `noDistractorReason`.
 */

export interface RatiosDistractor {
  value: string;
  misconceptionCode: string;
  rationale: string;
}

export interface RatiosDistractorEntry {
  distractors?: RatiosDistractor[];
  noDistractorReason?: string;
}

export const RATIOS_DISTRACTORS: Record<string, Record<string, RatiosDistractorEntry>> = {
  'unit-rates-3@content-1': {
    amount: {
      distractors: [
        {
          value: '8/5',
          misconceptionCode: 'reverses-rate',
          rationale: 'Divides feeders by pounds (feeders per pound).',
        },
        {
          value: '5/13',
          misconceptionCode: 'divide-by-total',
          rationale: 'Divides the pounds by the total 5 + 8.',
        },
      ],
    },
  },
  'unit-rates-4@content-1': {
    'jars-per-minute': {
      distractors: [
        {
          value: '2/7',
          misconceptionCode: 'reverses-rate',
          rationale: 'Gives minutes per jar in the jars-per-minute field.',
        },
      ],
    },
    'minutes-per-jar': {
      distractors: [
        {
          value: '7/2',
          misconceptionCode: 'reverses-rate',
          rationale: 'Gives jars per minute in the minutes-per-jar field.',
        },
      ],
    },
  },
  'unit-rates-5@content-1': {
    length: {
      noDistractorReason:
        'The reverses-rate error 7 ÷ 12 = 7/12 is not a whole number, so it cannot be entered in this integer-only field; it is refused (FORM_NOT_ALLOWED or NOT_A_NUMBER) and covered by G-FM/G-NG/G-PD generated rows. No whole-number distractor maps to a code declared on unit-rates.',
    },
  },
  'unit-rates-6@content-1': {
    yards: {
      distractors: [
        {
          value: '36',
          misconceptionCode: 'reverses-rate',
          rationale: 'Multiplies feet by 3 instead of dividing.',
        },
      ],
    },
    cost: {
      distractors: [
        {
          value: '24',
          misconceptionCode: 'omits-unit',
          rationale: 'Prices 12 feet as if they were 12 yards.',
        },
      ],
    },
  },
  'unit-rates-2@content-3': {
    difference: {
      distractors: [
        {
          value: '23/10',
          misconceptionCode: 'compares-total-cost',
          rationale: 'Subtracts the pack totals: 6.50 - 4.20 = 2.30.',
        },
        {
          value: '23/40',
          misconceptionCode: 'subtracts-before-unit-rate',
          rationale:
            'Subtracts totals, then divides by the 4-bottle size difference: 2.30 / 4 = 0.575.',
        },
      ],
    },
  },
  'ratio-tables-3@content-1': {
    'one-hour': {
      distractors: [
        {
          value: '12',
          misconceptionCode: 'adds-constant',
          rationale: 'Subtracts 2 from both columns (14 - 2).',
        },
      ],
    },
    'three-hours': {
      distractors: [
        {
          value: '15',
          misconceptionCode: 'uses-additive-change',
          rationale: 'Adds the 1-hour change to the figures (14 + 1).',
        },
        {
          value: '42',
          misconceptionCode: 'scales-one-row',
          rationale: 'Multiplies 14 figures by 3 without scaling the 2-hour row.',
        },
      ],
    },
    'five-hours': {
      distractors: [
        {
          value: '17',
          misconceptionCode: 'uses-additive-change',
          rationale: 'Adds the 3-hour change to the figures (14 + 3).',
        },
        {
          value: '70',
          misconceptionCode: 'scales-one-row',
          rationale: 'Multiplies 14 figures by 5 without scaling the 2-hour row.',
        },
      ],
    },
  },
  'ratio-tables-4@content-1': {
    'mix-a-scoops': {
      distractors: [
        {
          value: '38',
          misconceptionCode: 'adds-constant',
          rationale: 'Adds the 35-cup increase to the scoops (3 + 35).',
        },
      ],
    },
    'mix-b-scoops': {
      distractors: [
        {
          value: '37',
          misconceptionCode: 'adds-constant',
          rationale: 'Adds the 32-cup increase to the scoops (5 + 32).',
        },
      ],
    },
  },
  'ratio-tables-5@content-1': {
    'five-sheets': {
      distractors: [
        {
          value: '14',
          misconceptionCode: 'adds-constant',
          rationale: 'Adds the 2-sheet increase to the links (12 + 2).',
        },
      ],
    },
    'nine-sheets': {
      distractors: [
        {
          value: '18',
          misconceptionCode: 'adds-constant',
          rationale: 'Adds the 6-sheet increase to the links (12 + 6).',
        },
      ],
    },
  },
  'ratio-tables-6@content-1': {
    gray: {
      distractors: [
        {
          value: '13',
          misconceptionCode: 'uses-additive-change',
          rationale: 'Adds 4 to the gray tiles because the tan tiles increased by 4 (9 + 4).',
        },
      ],
    },
  },
  'ratio-tables-2@content-3': {
    'five-miles': {
      distractors: [
        {
          value: '50',
          misconceptionCode: 'uses-additive-change',
          rationale: 'Adds the 2-mile increase to the minutes (48 + 2).',
        },
      ],
    },
    'per-mile': {
      noDistractorReason:
        'The reverses-rate error 3 ÷ 48 = 1/16 mile per minute is not a whole number, so it cannot be entered in this integer-only field; it is refused and covered by G-FM/G-NG/G-PD rows. Widening the field to fractions only to host a distractor was rejected.',
    },
  },
  'double-number-lines-5@content-1': {
    'box-a': {
      distractors: [
        {
          value: '17',
          misconceptionCode: 'adds-scale',
          rationale: 'Subtracts the 1-pack decrease from the stickers (18 - 1) instead of halving.',
        },
        {
          value: '36',
          misconceptionCode: 'multiplies-when-dividing',
          rationale: 'Multiplies 18 by 2 instead of dividing when going from 2 packs to 1 pack.',
        },
      ],
    },
    'box-b': {
      distractors: [
        {
          value: '19',
          misconceptionCode: 'adds-scale',
          rationale: 'Adds the 1-pack increase to the stickers (18 + 1).',
        },
      ],
    },
    'box-c': {
      distractors: [
        {
          value: '21',
          misconceptionCode: 'adds-scale',
          rationale: 'Adds the 3-pack increase to the stickers (18 + 3).',
        },
      ],
    },
  },
  'double-number-lines-6@content-1': {
    'box-a': {
      distractors: [
        {
          value: '27',
          misconceptionCode: 'adds-scale',
          rationale: 'Adds the 15-second increase to the beats (12 + 15).',
        },
      ],
    },
    'box-b': {
      distractors: [
        {
          value: '42',
          misconceptionCode: 'adds-scale',
          rationale: 'Adds the 30-second increase to the beats (12 + 30).',
        },
      ],
    },
    'box-c': {
      distractors: [
        {
          value: '57',
          misconceptionCode: 'adds-scale',
          rationale: 'Adds the 45-second increase to the beats (12 + 45).',
        },
      ],
    },
  },
  'percent-applications-3@content-1': {
    percent: {
      distractors: [
        {
          value: '11/2',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Moves the decimal point one place instead of two (0.55 read as 5.5 percent).',
        },
      ],
    },
    decimal: {
      distractors: [
        {
          value: '55',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Writes the percent number as the decimal (55 instead of 0.55).',
        },
      ],
    },
    students: {
      distractors: [
        {
          value: '55',
          misconceptionCode: 'treats-percent-as-whole',
          rationale: 'Reports the percent as the number of students.',
        },
        {
          value: '27',
          misconceptionCode: 'confuses-part-whole',
          rationale: 'Finds the students who did not choose soccer (60 - 33).',
        },
      ],
    },
  },
  'percent-applications-4@content-1': {
    fraction: {
      distractors: [
        {
          value: '3/2',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Writes 15 percent as 15/10 (tenths instead of hundredths) and simplifies.',
        },
      ],
    },
    stamps: {
      distractors: [
        {
          value: '15',
          misconceptionCode: 'treats-percent-as-whole',
          rationale: 'Reports the percent as the number of stamps.',
        },
        {
          value: '68',
          misconceptionCode: 'confuses-part-whole',
          rationale: 'Finds the stamps not from Canada (80 - 12).',
        },
        {
          value: '1200',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Multiplies 80 by 15 without dividing by 100 (treats 15 percent as 15).',
        },
      ],
    },
  },
  'percent-applications-5@content-1': {
    decimal: {
      distractors: [
        {
          value: '4',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Reads 40 percent as 4.0.',
        },
      ],
    },
    whole: {
      distractors: [
        {
          value: '1120',
          misconceptionCode: 'multiplies-part-and-percent',
          rationale: 'Multiplies the part by the percent (28 x 40).',
        },
        {
          value: '40',
          misconceptionCode: 'treats-percent-as-whole',
          rationale: 'Reports the percent as the number of posters.',
        },
      ],
    },
  },
  'percent-applications-6@content-1': {
    percent: {
      distractors: [
        {
          value: '17/2',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Moves the decimal point one place instead of two (8.5 percent).',
        },
      ],
    },
    fraction: {
      distractors: [
        {
          value: '17/2',
          misconceptionCode: 'confuses-percent-and-decimal-place',
          rationale: 'Writes 0.85 as 85/10 (tenths instead of hundredths) and simplifies.',
        },
      ],
    },
    questions: {
      distractors: [
        {
          value: '85',
          misconceptionCode: 'treats-percent-as-whole',
          rationale: 'Reports the percent as the number of questions.',
        },
        {
          value: '6',
          misconceptionCode: 'confuses-part-whole',
          rationale: 'Finds the questions answered incorrectly (40 - 34).',
        },
      ],
    },
  },
};

/** Flat form consumed by `generateVectors`: item -> field -> distractor values. */
export function flatDistractors(
  map: Record<string, Record<string, RatiosDistractorEntry>> = RATIOS_DISTRACTORS,
): Record<string, Record<string, string[]>> {
  const out: Record<string, Record<string, string[]>> = {};
  for (const [ref, byField] of Object.entries(map)) {
    out[ref] = {};
    for (const [key, entry] of Object.entries(byField)) {
      if (entry.distractors && entry.distractors.length > 0) {
        out[ref][key] = entry.distractors.map((d) => d.value);
      }
    }
  }
  return out;
}
