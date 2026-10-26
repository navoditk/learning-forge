import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const storeState = vi.hoisted(() => ({
  mounted: false,
  // The real, integrity-validated PrivateAssessmentPackageStore over the
  // isolated synthetic package, and the bank refs it serves (S2 only).
  heldOut: undefined as
    { getBank(ref: { code: string; version: string }): Promise<unknown> } | undefined,
  heldOutRefs: new Set<string>(),
  // Isolated synthetic bank spec (invented ids; never a production bank).
  SYN: {
    code: 'synthetic-versioned-l2-bank',
    version: '1.0.0',
    skillCode: 'synthetic-versioned-s2',
    itemIds: Array.from({ length: 9 }, (_, i) => `synthetic-ri5-item-${i + 1}`),
  },
}));

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

// Synthetic store: placement probes come from the real committed snapshots;
// every other bank is served from the real catalog metadata (hash and item
// count) only while `storeState.mounted` is set, otherwise it fails closed
// like production without a package. No private content is read.
vi.mock('../../src/assessment/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/assessment/store')>();
  return {
    ...actual,
    createAssessmentStore: () => ({
      async getBank(ref: { code: string; version: string }) {
        if (ref.code.endsWith('-placement-probe'))
          return actual.createAssessmentStore().getBank(ref);
        if (storeState.heldOut && storeState.heldOutRefs.has(`${ref.code}@${ref.version}`)) {
          return storeState.heldOut.getBank(ref) as never;
        }
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
            hash: `sha256:synthetic-${i}`,
            skillRef: bank.coveredSkillRefs[i % bank.coveredSkillRefs.length]!,
          })),
        };
      },
    }),
  };
});

// Isolated two-version catalog for S2: the real records plus the synthetic
// versioned family (its 1.0.0 lesson is history under synthetic program 1.1.0).
// The retained synthetic lesson bank's metadata (contentHash, itemCount) is
// derived from the canonically hashed synthetic package bytes, never from a
// production private bank. Real pilot and Ratios records are untouched.
vi.mock('../../src/curriculum/course-catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/curriculum/course-catalog')>();
  const { createVersionedCourseCatalog } = await import('../../src/curriculum/catalog-versions');
  const { syntheticVersionedInput, selectionFor } =
    await import('../curriculum/fixtures/synthetic-versioned-catalog');
  const { syntheticBank } = await import('../progression/fixtures/synthetic-versioned-package');
  const fixture = syntheticVersionedInput();
  const real = actual.COURSE_CATALOG_INDEX;
  const realSelection = actual.VERSIONED_COURSE_CATALOG.selection;
  const selection = selectionFor();
  const synthetic = syntheticBank(storeState.SYN);
  const banks = fixture.banks.map((bank) =>
    bank.code === storeState.SYN.code && bank.version === storeState.SYN.version
      ? { ...bank, itemCount: synthetic.items.length, contentHash: synthetic.contentHash }
      : bank,
  );
  const versioned = createVersionedCourseCatalog({
    records: {
      programs: [...real.programs, ...fixture.programs],
      units: [...real.units, ...fixture.units],
      lessons: [...real.lessons, ...fixture.lessons],
      banks: [...real.banks, ...banks],
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

import { POST } from '../../src/app/api/progression/assessment/assignment/route';
import { createAssessmentStore } from '../../src/assessment/store';
import {
  PrivateAssessmentPackageStore,
  deriveRequiredBanks,
} from '../../src/assessment/private-package-store';
import {
  SV_LESSONS_V1,
  SV_LESSONS_V2,
  svSkill,
} from '../curriculum/fixtures/synthetic-versioned-catalog';
import {
  syntheticPackage,
  writeSyntheticPackage,
} from '../progression/fixtures/synthetic-versioned-package';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { policyHash } from '../../src/progression/policy';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import {
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import {
  RATIOS_UNIT_2_ASSESSMENT_BANKS,
  RATIOS_UNIT_2_LESSONS,
  RATIOS_UNIT_2_UNIT,
} from '../../src/curriculum/ratios-unit-2-catalog';
import { PILOT_ASSESSMENT_BANKS } from '../../src/curriculum/pilot-catalog';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import { applyNeedsHelpOverride } from '../../src/progression/learner-state';
import { placementProbeBank } from '../../src/progression/placement-probe';
import { getPilotProgression } from '../../src/progression/pilot-progress';
import {
  getCurrentAssessmentItem,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import { requireHouseholdContext } from '../../src/server/household-context';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

/**
 * RAT-INTEGRATE RI-5: grade-6-math@1.1.0 activation over the real production
 * catalog (S2 adds an isolated synthetic family). Synthetic learners only; no
 * private package.
 */
describe('Ratios unit 2.0.0 activation (RI-5)', () => {
  let householdId: string;
  let learnerProfileId: string;
  let parentId: string;

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const learnerUser = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: learnerUser.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    const parent = await prisma.user.create({
      data: { householdId, role: 'PARENT', email: `ri5-${householdId}@example.test` },
    });
    parentId = parent.id;
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
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  const lessonRequest = (lesson: { code: string; version: string }, key: string) => ({
    kind: 'LESSON_ASSESSMENT',
    targetKind: 'LESSON',
    targetCode: lesson.code,
    targetVersion: lesson.version,
    idempotencyKey: key,
  });

  it('activates grade-6-math@1.1.0 with unit 2.0.0 and keeps 1.0.0 resolvable', () => {
    expect(VERSIONED_COURSE_CATALOG.activeProgram('grade-6-math')?.version).toBe('1.1.0');
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(RATIOS_UNIT_2_UNIT)).toBe(true);
    expect(
      COURSE_CATALOG_INDEX.unitByRef({
        code: 'ratios-and-proportional-reasoning',
        version: '1.0.0',
      }),
    ).toBeDefined();
  });

  it('claims change: double-number-lines and percent-applications become unit-claimed (C-12)', () => {
    for (const skill of [
      'ratio-language',
      'unit-rates',
      'ratio-tables',
      'double-number-lines',
      'percent-applications',
    ]) {
      expect(isSkillClaimedByAuthoredUnit('grade-6-math', skill), skill).toBe(true);
    }
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'gcf-and-lcm')).toBe(false);
    for (const skill of ['double-number-lines', 'percent-applications']) {
      const ref = { code: skill, version: '1.0.0' };
      expect(VERSIONED_COURSE_CATALOG.activeSkillBank('REVIEW', ref)?.itemCount, skill).toBe(3);
      expect(VERSIONED_COURSE_CATALOG.activeSkillBank('DELAYED_CHECK', ref)?.itemCount, skill).toBe(
        6,
      );
    }
  });

  it('S1: a 1.0.0 NEEDS_HELP row is still overridable after activation (D-69/D-70 not bypassed)', async () => {
    await prisma.learnerLessonState.create({
      data: {
        householdId,
        learnerProfileId,
        lessonCode: 'ratio-tables-lesson',
        lessonVersion: '1.0.0',
        completionStatus: 'IN_PROGRESS',
        remediationStatus: 'NEEDS_HELP',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
      },
    });
    const progression = await getPilotProgression({ householdId, learnerProfileId });
    expect(progression.history[0]!.lessons).toMatchObject([
      { code: 'ratio-tables-lesson', version: '1.0.0', remediationStatus: 'NEEDS_HELP' },
    ]);
    const now = new Date();
    const result = await prisma.$transaction((transaction) =>
      applyNeedsHelpOverride(transaction, {
        householdId,
        learnerProfileId,
        skillRef: { code: 'ratio-tables', version: '1.0.0' },
        actorUserId: parentId,
        actorRole: 'PARENT',
        reason: 'Reviewed the attempts together.',
        reauthAt: now,
        stepUpReauthLifetimeMinutes: 5,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.1.0',
        now,
      }),
    );
    expect(result).toMatchObject({ applied: true });
    const row = await prisma.learnerLessonState.findFirstOrThrow({
      where: { learnerProfileId, lessonCode: 'ratio-tables-lesson', lessonVersion: '1.0.0' },
    });
    expect(row.remediationStatus).not.toBe('NEEDS_HELP');
  });

  it('C7-A: fresh-key 1.0.0 lesson and unit targets are refused (VERSION_MISMATCH)', async () => {
    const lesson1 = { code: 'ratio-language-lesson', version: '1.0.0' };
    expect(await post(lessonRequest(lesson1, 'ri5-key-0001'))).toMatchObject({
      status: 409,
      body: { reasonCode: 'VERSION_MISMATCH' },
    });
    expect(
      await post({
        kind: 'UNIT_ASSESSMENT',
        targetKind: 'UNIT',
        targetCode: 'ratios-and-proportional-reasoning',
        targetVersion: '1.0.0',
        idempotencyKey: 'ri5-key-0002',
      }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'VERSION_MISMATCH' } });
  });

  it('S2: an in-flight retained lesson assignment replays, serves its items and completes only the historical lesson', async () => {
    const SYN = storeState.SYN;
    const lesson1 = SV_LESSONS_V1[1]!; // retained (history) lesson, synthetic family
    const lesson2 = SV_LESSONS_V2[1]!; // its active successor
    const bankRef = { code: SYN.code, version: SYN.version };
    expect(lesson1.assessmentBankRef).toEqual(bankRef);
    expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson1)).toBe(false);
    expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson2)).toBe(true);

    // Canonically hashed synthetic package, loaded through the REAL store so
    // item and bank hashes, coverage, role and minimum count are validated.
    const document = syntheticPackage([SYN]);
    const packagePath = await writeSyntheticPackage(document);
    const bankMeta = COURSE_CATALOG_INDEX.bankByRef(bankRef)!;
    const required = deriveRequiredBanks({
      lessons: [lesson1],
      units: [],
      banks: [bankMeta],
    });
    const realStore = new PrivateAssessmentPackageStore(packagePath, required);
    const loaded = await realStore.getBank(bankRef);
    // The isolated catalog metadata matches the synthetic bytes, and is not a
    // production private-bank hash.
    expect(bankMeta.contentHash).toBe(loaded.contentHash);
    expect(bankMeta.itemCount).toBe(loaded.items.length);
    const productionHashes = new Set(
      [...PILOT_ASSESSMENT_BANKS, ...RATIOS_UNIT_2_ASSESSMENT_BANKS].map((b) => b.contentHash),
    );
    expect(productionHashes.has(bankMeta.contentHash)).toBe(false);

    // Negative control: a tampered item is rejected by the same loader.
    const tampered = structuredClone(document);
    tampered.banks[0]!.items[0]!.prompt = 'altered after hashing';
    const tamperedPath = await writeSyntheticPackage(tampered);
    expect(() => new PrivateAssessmentPackageStore(tamperedPath, required)).toThrow(
      'item hash mismatch',
    );

    storeState.heldOut = realStore;
    storeState.heldOutRefs.add(`${bankRef.code}@${bankRef.version}`);
    const program = VERSIONED_COURSE_CATALOG.activeProgram('grade-6-math')!;
    const profile = resolvePinnedPolicyProfile(program.defaultPolicyProfileRef);
    try {
      // The assignment as created before activation: valid session, selected
      // items and pins, through the normal library path and the retained bank.
      const created = await createAssessmentAssignment(
        {
          householdId,
          learnerProfileId,
          kind: 'LESSON_ASSESSMENT',
          targetKind: 'LESSON',
          targetRef: { code: lesson1.code, version: lesson1.version },
          bankRef,
          policyProfileRef: program.defaultPolicyProfileRef,
          policyProfileHash: policyHash(profile),
          algorithmVersion: 'mastery-phase-1-1',
          curriculumSnapshotHash: bankMeta.contentHash,
          itemsPerAttempt: profile.lessonItemsPerAttempt,
          requiredCount: profile.lessonPassBar.correct,
          requiredSkillCodes: [svSkill(2).code],
          authoredBankItemCount: bankMeta.itemCount,
          authoredBankSkillCodes: [svSkill(2).code],
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          idempotencyKey: 'ri5-inflight-0001',
        },
        createAssessmentStore(),
      );
      const original = created.assignment;
      const sessionId = original.sessions[0]!.id;
      const pinsBefore = {
        targetVersion: original.targetVersion,
        bankCode: original.bankCode,
        bankVersion: original.bankVersion,
        curriculumSnapshotHash: original.curriculumSnapshotHash,
        policyProfileHash: original.policyProfileHash,
        policyProfileCode: original.policyProfileCode,
        policyProfileVersion: original.policyProfileVersion,
        selectedItems: original.selectedItems,
      };
      expect(pinsBefore.targetVersion).toBe('1.0.0');

      // A fresh key on the retained target is refused; the same key replays.
      expect(await post(lessonRequest(lesson1, 'ri5-inflight-fresh'))).toMatchObject({
        status: 409,
        body: { reasonCode: 'VERSION_MISMATCH' },
      });
      const replayed = await post(lessonRequest(lesson1, 'ri5-inflight-0001'));
      expect(replayed.status).toBe(200);
      expect(replayed.body).toMatchObject({
        replayed: true,
        assignment: { id: original.id, targetCode: lesson1.code },
      });

      // Fetch serves the original items.
      const selected = original.selectedItems as { id: string; version: string; ordinal: number }[];
      const current = await getCurrentAssessmentItem({
        householdId,
        learnerProfileId,
        assignmentId: original.id,
        sessionId,
      });
      expect(current.item.title).toBe(`Synthetic item ${selected[0]!.id}`);

      // Submissions run to a final PASS through the normal path.
      let last;
      for (const entry of selected) {
        last = await submitAssessmentItem(
          {
            householdId,
            learnerProfileId,
            assignmentId: original.id,
            sessionId,
            ordinal: entry.ordinal,
            learnerResponse: '1:1',
          },
          createAssessmentStore(),
        );
      }
      expect(last).toMatchObject({ status: 'SCORED' });
      const result = await prisma.assessmentResult.findFirstOrThrow({
        where: { assignmentId: original.id },
      });
      expect(result.outcome).toBe('PASS');

      // The PASS completes the historical lesson only.
      const rows = await prisma.learnerLessonState.findMany({
        where: { learnerProfileId, lessonCode: lesson1.code },
        select: { lessonVersion: true, completionStatus: true },
      });
      expect(rows.find((row) => row.lessonVersion === '1.0.0')?.completionStatus).toMatch(
        /^COMPLETE/u,
      );
      expect(rows.find((row) => row.lessonVersion === '2.0.0')).toBeUndefined();

      // Pins are preserved on the stored assignment and the result.
      const after = await prisma.assessmentAssignment.findUniqueOrThrow({
        where: { id: original.id },
      });
      expect({
        targetVersion: after.targetVersion,
        bankCode: after.bankCode,
        bankVersion: after.bankVersion,
        curriculumSnapshotHash: after.curriculumSnapshotHash,
        policyProfileHash: after.policyProfileHash,
        policyProfileCode: after.policyProfileCode,
        policyProfileVersion: after.policyProfileVersion,
        selectedItems: after.selectedItems,
      }).toEqual(pinsBefore);
      expect(result).toMatchObject({
        policyProfileHash: pinsBefore.policyProfileHash,
        algorithmVersion: 'mastery-phase-1-1',
      });
    } finally {
      storeState.heldOut = undefined;
      storeState.heldOutRefs.clear();
    }
  });

  it('assignment from each 2.0.0 lesson bank (synthetic store from catalog metadata)', async () => {
    // Without a package every active target reaches the fail-closed store.
    expect(await post(lessonRequest(RATIOS_UNIT_2_LESSONS[0]!, 'ri5-key-0100'))).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    storeState.mounted = true;
    try {
      for (const [index, lesson] of RATIOS_UNIT_2_LESSONS.entries()) {
        const created = await post(lessonRequest(lesson, `ri5-key-02${index}`));
        expect(created.status, lesson.code).toBe(201);
        const stored = await prisma.assessmentAssignment.findUniqueOrThrow({
          where: {
            learnerProfileId_idempotencyKey: {
              learnerProfileId,
              idempotencyKey: `ri5-key-02${index}`,
            },
          },
        });
        expect(stored).toMatchObject({
          targetCode: lesson.code,
          targetVersion: '2.0.0',
          bankCode: lesson.assessmentBankRef.code,
          bankVersion: lesson.assessmentBankRef.version,
        });
      }
    } finally {
      storeState.mounted = false;
    }
  });

  it('D-246 successor-positive: a new placement on unit 2.0.0 is created, served and scored from its snapshot', async () => {
    const created = await post({
      kind: 'PLACEMENT',
      targetKind: 'UNIT',
      targetCode: RATIOS_UNIT_2_UNIT.code,
      targetVersion: RATIOS_UNIT_2_UNIT.version,
      idempotencyKey: 'ri5-placement-0001',
    });
    expect(created.status).toBe(201);
    expect(JSON.stringify(created.body)).not.toContain('canonicalAnswer');
    const stored = await prisma.assessmentAssignment.findUniqueOrThrow({
      where: {
        learnerProfileId_idempotencyKey: {
          learnerProfileId,
          idempotencyKey: 'ri5-placement-0001',
        },
      },
      include: { sessions: true },
    });
    const bank = placementProbeBank(RATIOS_UNIT_2_UNIT)!;
    expect(stored).toMatchObject({
      bankCode: 'ratios-and-proportional-reasoning-placement-probe',
      bankVersion: '2.0.0',
      targetVersion: '2.0.0',
      requiredCount: 5,
    });
    expect(stored.curriculumSnapshotHash).toBe(bank.contentHash);
    const selected = stored.selectedItems as { id: string; ordinal: number }[];
    expect(selected.map(({ id }) => id)).toEqual([
      'ratio-language-1',
      'unit-rates-1',
      'ratio-tables-1',
      'double-number-lines-3',
      'percent-applications-1',
    ]);
    const answers = new Map(
      bank.items.map((item) => [item.id, item.deterministicValidator.canonicalAnswer]),
    );
    const store = createAssessmentStore();
    for (const item of selected) {
      await submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: stored.id,
          sessionId: stored.sessions[0]!.id,
          ordinal: item.ordinal,
          learnerResponse: answers.get(item.id) ?? 'not the answer',
        },
        store,
      );
    }
    const placement = await prisma.learnerPlacement.findFirstOrThrow({
      where: { learnerProfileId, unitCode: RATIOS_UNIT_2_UNIT.code, unitVersion: '2.0.0' },
    });
    expect(placement.programVersion).toBe('1.1.0');
    expect(placement.evidenceRefs).toMatchObject({
      itemResults: [
        { skillCode: 'ratio-language', correctness: 'CORRECT' },
        { skillCode: 'unit-rates', correctness: 'CORRECT' },
        { skillCode: 'ratio-tables', correctness: 'CORRECT' },
        { skillCode: 'double-number-lines', correctness: 'CORRECT' },
        { skillCode: 'percent-applications', correctness: 'CORRECT' },
      ],
    });
    // One placement per unit version (D-71): a new request is refused.
    expect(
      await post({
        kind: 'PLACEMENT',
        targetKind: 'UNIT',
        targetCode: RATIOS_UNIT_2_UNIT.code,
        targetVersion: '2.0.0',
        idempotencyKey: 'ri5-placement-0002',
      }),
    ).toMatchObject({ status: 409, body: { reasonCode: 'PLACEMENT_ALREADY_RECORDED' } });
  });
});
