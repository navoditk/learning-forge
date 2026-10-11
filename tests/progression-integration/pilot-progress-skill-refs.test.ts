import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getPilotProgression } from '../../src/progression/pilot-progress';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

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
});
