import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { markSkillNeedsHelp } from '../../src/progression/learner-state';
import { pilotSkillRef, skillAssessmentBank } from '../../src/progression/skill-assessment';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import {
  SV_LESSONS_V1,
  SV_LESSONS_V2,
  SV_UNIT_V1,
  SV_UNIT_V2,
  svSkill,
} from '../curriculum/fixtures/synthetic-versioned-catalog';

const storeState = vi.hoisted(() => ({ mounted: false }));

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

// Two-version catalog for the route: the real pilot records plus the synthetic
// versioned family, with synthetic program 1.1.0 active, so its 1.0.0 unit and
// lessons are history. The real Grade 6 Math records are untouched.
vi.mock('../../src/curriculum/course-catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/curriculum/course-catalog')>();
  const { createVersionedCourseCatalog } = await import('../../src/curriculum/catalog-versions');
  const { syntheticVersionedInput, selectionFor } =
    await import('../curriculum/fixtures/synthetic-versioned-catalog');
  const fixture = syntheticVersionedInput();
  const real = actual.COURSE_CATALOG_INDEX;
  const realSelection = actual.VERSIONED_COURSE_CATALOG.selection;
  const selection = selectionFor();
  const versioned = createVersionedCourseCatalog({
    records: {
      programs: [...real.programs, ...fixture.programs],
      units: [...real.units, ...fixture.units],
      lessons: [...real.lessons, ...fixture.lessons],
      banks: [...real.banks, ...fixture.banks],
    },
    selection: {
      version: 'synthetic-selection-1',
      programs: [...realSelection.programs, ...selection.programs],
      skillBanks: [...realSelection.skillBanks, ...selection.skillBanks],
    },
  });
  return {
    ...actual,
    VERSIONED_COURSE_CATALOG: versioned,
    COURSE_CATALOG_INDEX: versioned.index,
    COURSE_CATALOG: versioned.activeView(),
  };
});

// Synthetic store: serves banks that match the synthetic catalog metadata only
// while `storeState.mounted` is set; otherwise it fails closed like production.
vi.mock('../../src/assessment/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/assessment/store')>();
  return {
    ...actual,
    createAssessmentStore: () => ({
      async getBank(ref: { code: string; version: string }) {
        if (!storeState.mounted) throw new actual.AssessmentStoreUnavailableError();
        const { COURSE_CATALOG_INDEX } = await import('../../src/curriculum/course-catalog');
        const bank = COURSE_CATALOG_INDEX.bankByRef(ref);
        if (!bank) throw new actual.AssessmentStoreUnavailableError();
        return {
          code: bank.code,
          version: bank.version,
          contentHash: bank.contentHash,
          items: Array.from({ length: bank.itemCount }, (_, i) => ({
            id: `${bank.code}-item-${i}`,
            version: 'content-1',
            skillRef: bank.coveredSkillRefs[i % bank.coveredSkillRefs.length]!,
          })),
        };
      },
    }),
  };
});

import { requireHouseholdContext } from '../../src/server/household-context';
import { POST } from '../../src/app/api/progression/assessment/assignment/route';

/**
 * RI-1 / C7-A (D-230): the route resolves targets from the version index and
 * admits only active targets. No private package is mounted, so an admitted
 * request reaches the fail-closed store (503) and a refused one stops at 409.
 * A retried request replays for every target kind even after its target
 * stopped being active (D-54).
 */
describe('assignment route over a two-version catalog', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({ householdId, learnerProfileId });
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const post = async (body: Record<string, string>) => {
    const response = await POST(
      new Request('http://localhost/api/progression/assessment/assignment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }) as never,
    );
    return { status: response.status, body: (await response.json()) as { reasonCode: string } };
  };

  const lessonRequest = (
    lesson: { code: string; version: string },
    idempotencyKey: string,
  ): Record<string, string> => ({
    kind: 'LESSON_ASSESSMENT',
    targetKind: 'LESSON',
    targetCode: lesson.code,
    targetVersion: lesson.version,
    idempotencyKey,
  });
  const unitRequest = (
    unit: { code: string; version: string },
    idempotencyKey: string,
  ): Record<string, string> => ({
    kind: 'UNIT_ASSESSMENT',
    targetKind: 'UNIT',
    targetCode: unit.code,
    targetVersion: unit.version,
    idempotencyKey,
  });

  const seedAssignment = (
    kind: 'LESSON_ASSESSMENT' | 'UNIT_ASSESSMENT',
    targetKind: 'LESSON' | 'UNIT',
    target: { code: string; version: string },
    bank: { code: string; version: string },
    idempotencyKey: string,
  ) =>
    prisma.assessmentAssignment.create({
      data: {
        householdId,
        learnerProfileId,
        kind,
        targetKind,
        targetCode: target.code,
        targetVersion: target.version,
        bankCode: bank.code,
        bankVersion: bank.version,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
        policyProfileHash: 'synthetic',
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: 'sha256:synthetic',
        selectedItems: [],
        excludedItems: [],
        attemptOrdinal: 1,
        idempotencyKey,
      },
    });

  it('admits an active synthetic lesson and unit (reaches the fail-closed store)', async () => {
    expect(await post(lessonRequest(SV_LESSONS_V2[3]!, 'versions-key-0001'))).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    expect(await post(unitRequest(SV_UNIT_V2, 'versions-key-0002'))).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
  });

  it('admits the real active 2.0.0 lesson and refuses the retained 1.0.0 lesson (RI-5)', () => {
    return (async () => {
      expect(
        await post(
          lessonRequest({ code: 'ratio-language-lesson', version: '2.0.0' }, 'versions-key-0003'),
        ),
      ).toMatchObject({ status: 503, body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' } });
      expect(
        await post(
          lessonRequest({ code: 'ratio-language-lesson', version: '1.0.0' }, 'versions-key-0003b'),
        ),
      ).toMatchObject({ status: 409, body: { reasonCode: 'VERSION_MISMATCH' } });
    })();
  });

  it('refuses a non-active lesson and unit version without a replay', async () => {
    expect(await post(lessonRequest(SV_LESSONS_V1[1]!, 'versions-key-0004'))).toMatchObject({
      status: 409,
      body: { reasonCode: 'VERSION_MISMATCH' },
    });
    expect(await post(unitRequest(SV_UNIT_V1, 'versions-key-0005'))).toMatchObject({
      status: 409,
      body: { reasonCode: 'VERSION_MISMATCH' },
    });
  });

  it('refuses an unindexed version', async () => {
    expect(
      await post(lessonRequest({ ...SV_LESSONS_V2[0]!, version: '9.9.9' }, 'versions-key-0006')),
    ).toMatchObject({ status: 409, body: { reasonCode: 'VERSION_MISMATCH' } });
  });

  it('checks replay before refusing a non-active LESSON or UNIT target (no package)', async () => {
    const lesson = SV_LESSONS_V1[1]!;
    await seedAssignment(
      'LESSON_ASSESSMENT',
      'LESSON',
      lesson,
      lesson.assessmentBankRef,
      'versions-replay-0001',
    );
    await seedAssignment(
      'UNIT_ASSESSMENT',
      'UNIT',
      SV_UNIT_V1,
      SV_UNIT_V1.assessmentBankRef!,
      'versions-replay-0002',
    );
    // Past admission: the request reaches the fail-closed store, not 409.
    expect(await post(lessonRequest(lesson, 'versions-replay-0001'))).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    expect(await post(unitRequest(SV_UNIT_V1, 'versions-replay-0002'))).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    // A different key for the same non-active target is still refused.
    expect(await post(lessonRequest(lesson, 'versions-replay-0003'))).toMatchObject({
      status: 409,
      body: { reasonCode: 'VERSION_MISMATCH' },
    });
  });

  it('replays the original assignment for inactive LESSON and UNIT targets (synthetic store)', async () => {
    const lesson = SV_LESSONS_V1[1]!;
    const originals = await prisma.assessmentAssignment.findMany({
      where: {
        learnerProfileId,
        idempotencyKey: { in: ['versions-replay-0001', 'versions-replay-0002'] },
      },
    });
    const idFor = (key: string) => originals.find((row) => row.idempotencyKey === key)!.id;
    const countBefore = await prisma.assessmentAssignment.count({ where: { learnerProfileId } });
    storeState.mounted = true;
    try {
      const replayedLesson = await post(lessonRequest(lesson, 'versions-replay-0001'));
      expect(replayedLesson.status).toBe(200);
      expect(replayedLesson.body).toMatchObject({
        replayed: true,
        assignment: { id: idFor('versions-replay-0001'), targetCode: lesson.code },
      });
      const replayedUnit = await post(unitRequest(SV_UNIT_V1, 'versions-replay-0002'));
      expect(replayedUnit.status).toBe(200);
      expect(replayedUnit.body).toMatchObject({
        replayed: true,
        assignment: { id: idFor('versions-replay-0002'), targetCode: SV_UNIT_V1.code },
      });
      expect(await prisma.assessmentAssignment.count({ where: { learnerProfileId } })).toBe(
        countBefore,
      );
      // The same key used for a different request is a conflict, not a replay.
      expect(await post(lessonRequest(SV_LESSONS_V2[3]!, 'versions-replay-0001'))).toMatchObject({
        status: 409,
        body: { reasonCode: 'IDEMPOTENCY_KEY_CONFLICT' },
      });
      expect(await post(unitRequest(SV_UNIT_V2, 'versions-replay-0002'))).toMatchObject({
        status: 409,
        body: { reasonCode: 'IDEMPOTENCY_KEY_CONFLICT' },
      });
      expect(await prisma.assessmentAssignment.count({ where: { learnerProfileId } })).toBe(
        countBefore,
      );
    } finally {
      storeState.mounted = false;
    }
  });

  it('updates existing historical NEEDS_HELP rows and creates rows only on active lessons', async () => {
    const [v1Lesson, v2Lesson] = [SV_LESSONS_V1[1]!, SV_LESSONS_V2[1]!];
    // An existing historical row keeps its completion status and gains NEEDS_HELP.
    await prisma.learnerLessonState.create({
      data: {
        householdId,
        learnerProfileId,
        lessonCode: v1Lesson.code,
        lessonVersion: v1Lesson.version,
        completionStatus: 'COMPLETE',
        remediationStatus: 'NONE',
        policyProfileCode: 'synthetic-versioned-default',
        policyProfileVersion: '1.0.0',
      },
    });
    await prisma.$transaction((transaction) =>
      markSkillNeedsHelp(transaction, {
        householdId,
        learnerProfileId,
        skillRef: svSkill(2),
        policyProfileCode: 'synthetic-versioned-default',
        policyProfileVersion: '1.0.0',
      }),
    );
    const rows = await prisma.learnerLessonState.findMany({
      where: { learnerProfileId, lessonCode: v1Lesson.code },
      orderBy: { lessonVersion: 'asc' },
      select: { lessonVersion: true, completionStatus: true, remediationStatus: true },
    });
    expect(rows).toEqual([
      { lessonVersion: '1.0.0', completionStatus: 'COMPLETE', remediationStatus: 'NEEDS_HELP' },
      {
        lessonVersion: v2Lesson.version,
        completionStatus: 'NOT_STARTED',
        remediationStatus: 'NEEDS_HELP',
      },
    ]);
    // An absent historical row is not created: skill 3 has no 1.0.0 row.
    await prisma.$transaction((transaction) =>
      markSkillNeedsHelp(transaction, {
        householdId,
        learnerProfileId,
        skillRef: svSkill(3),
        policyProfileCode: 'synthetic-versioned-default',
        policyProfileVersion: '1.0.0',
      }),
    );
    const l3 = await prisma.learnerLessonState.findMany({
      where: { learnerProfileId, lessonCode: SV_LESSONS_V2[2]!.code },
      select: { lessonVersion: true },
    });
    expect(l3).toEqual([{ lessonVersion: '2.0.0' }]);
  });

  it('resolves skills through active lessons and the selected skill bank', () => {
    expect(pilotSkillRef(svSkill(4).code, '1.0.0')).toEqual(svSkill(4));
    // Selection names the 2.0.0 delayed-check bank for s3, not the first in array order.
    expect(skillAssessmentBank('DELAYED_CHECK', svSkill(3))?.version).toBe('2.0.0');
    expect(skillAssessmentBank('REVIEW', svSkill(3))?.version).toBe('1.0.0');
  });
});
