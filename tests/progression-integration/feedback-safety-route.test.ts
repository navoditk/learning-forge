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
import { containsSensitiveFeedback } from './feedback-safety-assertions';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST } from '../../src/app/api/progression/assessment/submission/route';

const bankRef = { code: 'ratio-language-lesson-bank', version: '1.0.0' } as const;

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

function assessmentItem(
  id: string,
  answer: string,
  itemBankRef: Ref = bankRef,
  skillCode = 'ratio-language',
): AssessmentContentItem & { hash: string } {
  const item: AssessmentContentItem = {
    id,
    version: '1.0.0',
    title: `Private ${id}`,
    role: 'assessment',
    skillRef: { code: skillCode, version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['States the ratio.'],
    prompt: `Private prompt sentinel ${id}`,
    assessmentBankRef: itemBankRef,
    solutionRepresentation: answer,
    solutionMethod: 'Read the quantities in order.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: answer,
      acceptedAnswers: [answer],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: [answer],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'route integration reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original test fixture.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  };
  return { ...item, hash: sha256(item) };
}

describe('assessment feedback route safety', () => {
  let householdId: string;
  let learnerProfileId: string;
  let assignmentId: string;
  let sessionId: string;
  let packageDirectory: string;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    const items = Array.from({ length: 9 }, (_, index) =>
      assessmentItem(`route-item-${index + 1}`, index === 0 ? '2:3' : `${index + 2}:${index + 3}`),
    );
    const unitRatesBank = { code: 'unit-rates-lesson-bank', version: '1.0.0' } as const;
    const ratioTablesBank = { code: 'ratio-tables-lesson-bank', version: '1.0.0' } as const;
    const unitBank = { code: 'ratios-proportional-reasoning-unit-bank', version: '1.0.0' } as const;
    const unitRatesItems = Array.from({ length: 9 }, (_, index) =>
      assessmentItem(`unit-rates-item-${index + 1}`, `${index + 2}`, unitRatesBank, 'unit-rates'),
    );
    const ratioTablesItems = Array.from({ length: 9 }, (_, index) =>
      assessmentItem(
        `ratio-tables-item-${index + 1}`,
        `${index + 2}:${index + 3}`,
        ratioTablesBank,
        'ratio-tables',
      ),
    );
    const unitItems = Array.from({ length: 18 }, (_, index) =>
      assessmentItem(
        `unit-item-${index + 1}`,
        `${index + 2}:${index + 3}`,
        unitBank,
        ['ratio-language', 'unit-rates', 'ratio-tables'][index % 3],
      ),
    );
    const packageBanks = [
      { ...bankRef, items },
      { ...unitRatesBank, items: unitRatesItems },
      { ...ratioTablesBank, items: ratioTablesItems },
      { ...unitBank, items: unitItems },
    ];
    const ratioLanguageContentHash = sha256(items);
    packageDirectory = await mkdtemp(join(tmpdir(), 'learning-forge-route-feedback-'));
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

    const assignment = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: AssessmentKind.LESSON_ASSESSMENT,
        targetKind: ProgressionTargetKind.LESSON,
        targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
        bankRef,
        policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
        policyProfileHash: 'sha256:route-feedback-policy',
        algorithmVersion: 'route-feedback-1',
        curriculumSnapshotHash: ratioLanguageContentHash,
        itemsPerAttempt: 2,
        requiredCount: 2,
        expiresAt: new Date(Date.now() + 60_000),
        idempotencyKey: 'route-feedback-safety',
      },
      createInMemoryAssessmentStore([{ ...bankRef, contentHash: ratioLanguageContentHash, items }]),
    );
    assignmentId = assignment.assignment.id;
    const session = assignment.assignment.sessions[0];
    if (!session) throw new Error('Assessment session was not created');
    sessionId = session.id;
  });

  afterAll(async () => {
    if (householdId) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    await rm(packageDirectory, { recursive: true, force: true });
  });

  async function submit(ordinal: number, learnerResponse: string) {
    const response = await POST(
      new Request('http://localhost/api/progression/assessment/submission', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ assignmentId, sessionId, ordinal, learnerResponse }),
      }),
    );
    return { status: response.status, body: await response.json() };
  }

  it('keeps sensitive feedback out of actual route JSON at both phases', async () => {
    const inProgress = await submit(1, '2:3');
    expect(inProgress.status).toBe(200);
    expect(inProgress.body.status).toBe('IN_PROGRESS');
    expect(inProgress.body).not.toHaveProperty('result');
    expect(inProgress.body).not.toHaveProperty('correctness');
    expect(containsSensitiveFeedback(inProgress.body)).toBe(false);

    const scored = await submit(2, 'wrong');
    expect(scored.status).toBe(200);
    expect(scored.body.status).toBe('SCORED');
    expect(containsSensitiveFeedback(scored.body.result)).toBe(false);

    const [results, shadowDecisions, traces, interactions] = await Promise.all([
      prisma.assessmentResult.findMany({ where: { householdId } }),
      prisma.shadowDecision.findMany({ where: { householdId } }),
      prisma.tutorTrace.findMany({ where: { householdId } }),
      prisma.tutorInteraction.findMany({ where: { householdId } }),
    ]);
    expect(containsSensitiveFeedback({ results, shadowDecisions, traces, interactions })).toBe(
      false,
    );
  });
});
