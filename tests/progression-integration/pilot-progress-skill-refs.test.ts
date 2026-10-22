import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import { getPilotProgression } from '../../src/progression/pilot-progress';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import {
  SV_PROGRAM_CODE,
  SV_UNIT_CODE,
  selectionFor,
  sv,
  syntheticVersionedInput,
} from '../curriculum/fixtures/synthetic-versioned-catalog';

/**
 * D-70 override-UI prerequisite: the parent page can only call the override
 * API (which takes a skillRef, not a lessonRef) if getPilotProgression
 * actually exposes one. This is the falsifier for that specific gap.
 */
describe('getPilotProgression skillRefs', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('exposes a resolvable skillRef for every pilot lesson', async () => {
    const progression = await getPilotProgression({ householdId, learnerProfileId });
    const allLessons = progression.units.flatMap((unit) => unit.lessons);
    expect(allLessons.length).toBeGreaterThan(0);
    for (const lesson of allLessons) {
      expect(lesson.skillRefs.length).toBeGreaterThan(0);
      for (const skillRef of lesson.skillRefs) {
        expect(skillRef.code).toMatch(/^[a-z0-9-]+$/);
        expect(skillRef.version).toBeTruthy();
      }
    }
    const ratioLanguageLesson = allLessons.find(
      (lesson) => lesson.code === 'ratio-language-lesson',
    );
    expect(ratioLanguageLesson?.skillRefs).toEqual([{ code: 'ratio-language', version: '1.0.0' }]);
  });

  /**
   * C7-A (D-230, RI-4): the history projection against seeded rows, on an
   * injected two-version synthetic catalog. Synthetic codes only.
   */
  describe('history projection over seeded rows', () => {
    const versioned = createVersionedCourseCatalog({
      records: syntheticVersionedInput(),
      selection: selectionFor(),
    });
    const catalogs = { active: versioned.activeView(), index: versioned.index };
    let otherLearnerId: string;

    const lessonState = (
      profileId: string,
      lessonCode: string,
      lessonVersion: string,
      remediationStatus: 'NONE' | 'NEEDS_HELP',
    ) => ({
      householdId,
      learnerProfileId: profileId,
      lessonCode,
      lessonVersion,
      completionStatus: 'IN_PROGRESS' as const,
      remediationStatus,
      policyProfileVersion: '1.1.0',
    });

    beforeAll(async () => {
      const otherUser = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
      const other = await prisma.learnerProfile.create({
        data: { householdId, userId: otherUser.id, gradeLevel: 6 },
      });
      otherLearnerId = other.id;
      await prisma.learnerLessonState.createMany({
        data: [
          lessonState(learnerProfileId, sv('l3'), '1.0.0', 'NEEDS_HELP'),
          lessonState(learnerProfileId, sv('l3'), '2.0.0', 'NEEDS_HELP'),
          lessonState(learnerProfileId, sv('l1'), '2.0.0', 'NONE'),
          lessonState(otherLearnerId, sv('l2'), '1.0.0', 'NONE'),
        ],
      });
      await prisma.learnerUnitState.create({
        data: {
          householdId,
          learnerProfileId,
          unitCode: SV_UNIT_CODE,
          unitVersion: '1.0.0',
          completionStatus: 'IN_PROGRESS',
          overrideStatus: 'NONE',
          policyProfileVersion: '1.1.0',
        },
      });
    });

    it('returns the earlier-version rows for the seeded learner only', async () => {
      const progression = await getPilotProgression(
        { householdId, learnerProfileId },
        catalogs,
        SV_PROGRAM_CODE,
      );
      expect(progression.units).toHaveLength(1);
      expect(progression.units[0]!.version).toBe('2.0.0');
      expect(progression.units[0]!.lessons.map((lesson) => lesson.remediationStatus)).toEqual([
        'NONE',
        'NONE',
        'NEEDS_HELP',
        'NONE',
        'NONE',
      ]);
      expect(progression.history).toHaveLength(1);
      expect(progression.history[0]).toMatchObject({
        code: SV_UNIT_CODE,
        version: '1.0.0',
        status: 'IN_PROGRESS',
      });
      expect(progression.history[0]!.lessons).toHaveLength(1);
      expect(progression.history[0]!.lessons[0]).toMatchObject({
        code: sv('l3'),
        version: '1.0.0',
        remediationStatus: 'NEEDS_HELP',
        skillRefs: [{ code: sv('s3'), version: '1.0.0' }],
      });
    });

    it('another learner sees only their own earlier-version rows', async () => {
      const progression = await getPilotProgression(
        { householdId, learnerProfileId: otherLearnerId },
        catalogs,
        SV_PROGRAM_CODE,
      );
      expect(progression.history.flatMap((unit) => unit.lessons.map((l) => l.code))).toEqual([
        sv('l2'),
      ]);
    });

    it('single-version production catalog has no history even with a 1.0.0 row', async () => {
      await prisma.learnerLessonState.create({
        data: {
          householdId,
          learnerProfileId,
          lessonCode: 'ratio-tables-lesson',
          lessonVersion: '1.0.0',
          completionStatus: 'IN_PROGRESS',
          remediationStatus: 'NONE',
          policyProfileVersion: '1.1.0',
        },
      });
      const progression = await getPilotProgression({ householdId, learnerProfileId });
      expect(progression.history).toEqual([]);
      expect(progression.units[0]!.lessons[2]).toMatchObject({
        code: 'ratio-tables-lesson',
        completionStatus: 'IN_PROGRESS',
      });
    });
  });
});
