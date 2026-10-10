import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { AssessmentContentItem, Ref } from '../../src/contracts/progression';
import { createPrivateAssessmentPackageStoreFromEnvironment } from '../../src/assessment/private-package-store';
import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { GET as pilotGet } from '../../src/app/api/progression/pilot/route';
import { GET as digestGet } from '../../src/app/api/phase1/digest/route';
import { GET as progressGet } from '../../src/app/api/phase1/progress/route';
import { GET as planGet } from '../../src/app/api/phase1/plan/route';

const bankRef = { code: 'ratio-language-lesson-bank', version: '1.0.0' } as const;
const LESSON_TARGET_CODE = 'ratio-language-lesson';
const SENTINEL_ITEM_IDS = Array.from(
  { length: 9 },
  (_, index) => `preview-sentinel-item-${index + 1}`,
);
const SENTINEL_PROMPT = 'Private preview-sentinel prompt text';

const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const sha256 = (value: unknown) =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;

function assessmentItem(id: string): AssessmentContentItem & { hash: string } {
  const itemBankRef: Ref = bankRef;
  const item: AssessmentContentItem = {
    id,
    version: '1.0.0',
    title: `Preview sentinel ${id}`,
    role: 'assessment',
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['States the ratio.'],
    prompt: SENTINEL_PROMPT,
    assessmentBankRef: itemBankRef,
    solutionRepresentation: '2:3',
    solutionMethod: 'Read the quantities in order.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: '2:3',
      acceptedAnswers: ['2:3'],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: ['2:3'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'preview-safety test fixture',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original test fixture.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  };
  return { ...item, hash: sha256(item) };
}

function findLeak(value: unknown, path = '$'): string | undefined {
  if (typeof value === 'string') {
    const hit = [...SENTINEL_ITEM_IDS, SENTINEL_PROMPT].find((marker) => value.includes(marker));
    return hit ? `${path} contains "${hit}"` : undefined;
  }
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      const leak = findLeak(entry, `${path}[${index}]`);
      if (leak) return leak;
    }
    return undefined;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const leak = findLeak(entry, `${path}.${key}`);
      if (leak) return leak;
    }
  }
  return undefined;
}

// L9 / S8: "Plans, previews, digests, and progress views name the target,
// never an item." An assessment assignment is created for a real pilot
// lesson target against a bank whose items carry deliberately distinctive
// ids and prompt text, then every surface this claim names is scanned for
// those item-level strings. The lesson's own target code is asserted
// present on the preview surface, so this is not a vacuous "nothing showed
// up because nothing was exercised" pass.
describe('plan/preview/digest/progress surfaces never name an assessment item (L9)', () => {
  let householdId: string;
  let learnerProfileId: string;
  let packageDirectory: string;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    const items = SENTINEL_ITEM_IDS.map((id) => assessmentItem(id));
    // The private package store validates every pilot bank is present
    // (D-02), not only the one this test targets - these three fillers
    // carry ordinary non-sentinel content and are never asserted on.
    const fillerItem = (id: string, bank: Ref, skillCode: string, index: number) => {
      const fillerBankRef: Ref = bank;
      const item: AssessmentContentItem = {
        id,
        version: '1.0.0',
        title: `Filler ${id}`,
        role: 'assessment',
        skillRef: { code: skillCode, version: '1.0.0' },
        mode: 'core',
        difficulty: 'foundational',
        standards: ['6.RP.A.1'],
        observableEvidence: ['States the ratio.'],
        prompt: `Filler prompt ${id}`,
        assessmentBankRef: fillerBankRef,
        solutionRepresentation: `${index + 2}:${index + 3}`,
        solutionMethod: 'Read the quantities in order.',
        deterministicValidator: {
          type: 'ratio',
          canonicalAnswer: `${index + 2}:${index + 3}`,
          acceptedAnswers: [`${index + 2}:${index + 3}`],
          equivalenceNotes: 'Equivalent ratio forms are accepted.',
        },
        misconceptionCodes: [],
        forbiddenLeakagePatterns: [`${index + 2}:${index + 3}`],
        provenance: { origin: 'original', licenseStatus: 'owned' },
        review: {
          status: 'reviewed',
          reviewer: 'preview-safety test fixture',
          reviewedAt: '2026-01-01',
          originalityStatement: 'Original test fixture.',
        },
        accessibilityNotes: 'Text is sufficient.',
        accessibleAlternative: 'Read the prompt aloud.',
        itemReadinessRefs: [],
      };
      return { ...item, hash: sha256(item) };
    };
    const unitRatesBank: Ref = { code: 'unit-rates-lesson-bank', version: '1.0.0' };
    const ratioTablesBank: Ref = { code: 'ratio-tables-lesson-bank', version: '1.0.0' };
    const unitBank: Ref = { code: 'ratios-proportional-reasoning-unit-bank', version: '1.0.0' };
    const unitRatesItems = Array.from({ length: 9 }, (_, index) =>
      fillerItem(`unit-rates-item-${index + 1}`, unitRatesBank, 'unit-rates', index),
    );
    const ratioTablesItems = Array.from({ length: 9 }, (_, index) =>
      fillerItem(`ratio-tables-item-${index + 1}`, ratioTablesBank, 'ratio-tables', index),
    );
    const unitItems = Array.from({ length: 18 }, (_, index) =>
      fillerItem(
        `unit-item-${index + 1}`,
        unitBank,
        ['ratio-language', 'unit-rates', 'ratio-tables'][index % 3],
        index,
      ),
    );
    const packageBanks = [
      { ...bankRef, items },
      { ...unitRatesBank, items: unitRatesItems },
      { ...ratioTablesBank, items: ratioTablesItems },
      { ...unitBank, items: unitItems },
    ];
    packageDirectory = await mkdtemp(join(tmpdir(), 'learning-forge-preview-safety-'));
    const packagePath = join(packageDirectory, 'assessment-package.json');
    await writeFile(
      packagePath,
      JSON.stringify({
        banks: packageBanks.map((bank) => ({ ...bank, contentHash: sha256(bank.items) })),
      }),
      'utf8',
    );
    process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH = packagePath;
    expect(createPrivateAssessmentPackageStoreFromEnvironment()).toBeDefined();

    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({ householdId, learnerProfileId });

    await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.LESSON_ASSESSMENT,
        targetKind: ProgressionTargetKind.LESSON,
        targetRef: { code: LESSON_TARGET_CODE, version: '1.0.0' },
        bankRef,
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:preview-safety-policy',
        algorithmVersion: 'preview-safety-1',
        curriculumSnapshotHash: sha256(items),
        itemsPerAttempt: 2,
        requiredCount: 2,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'preview-safety-assignment',
      },
      createInMemoryAssessmentStore([{ ...bankRef, contentHash: sha256(items), items }]),
    );
  });

  afterAll(async () => {
    if (householdId) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    await rm(packageDirectory, { recursive: true, force: true });
  });

  it('names only the lesson/unit/skill target, never a bank item id or prompt', async () => {
    const pilotBody = await pilotGet().then((response) => response.json());
    expect(findLeak(pilotBody)).toBeUndefined();
    expect(JSON.stringify(pilotBody)).toContain(LESSON_TARGET_CODE);

    const digestBody = await digestGet().then((response) => response.json());
    expect(findLeak(digestBody)).toBeUndefined();

    const { NextRequest } = await import('next/server');
    const progressBody = await progressGet(
      new NextRequest(new Request('http://localhost/api/phase1/progress')),
    ).then((response) => response.json());
    expect(findLeak(progressBody)).toBeUndefined();

    const planBody = await planGet(
      new NextRequest(new Request('http://localhost/api/phase1/plan')),
    ).then((response) => response.json());
    expect(findLeak(planBody)).toBeUndefined();
  });
});
