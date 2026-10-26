import { PILOT_LESSONS } from '../src/curriculum/pilot-catalog';
import { RATIOS_UNIT_2_LESSONS } from '../src/curriculum/ratios-unit-2-catalog';
import { prisma } from '../src/server/prisma';
import { E2E_TEST_PARENT_EMAIL } from './test-account';

/**
 * The seeded lesson is `ratio-language-lesson` at a chosen version. Version
 * `1.0.0` (the default) is no longer active after RI-5, so the seed exercises
 * the earlier-version (history) override (CE-2); `2.0.0` is the active lesson.
 */
export type SeededLessonVersion = '1.0.0' | '2.0.0';

function ratioLanguageLesson(version: SeededLessonVersion) {
  const lesson = [...PILOT_LESSONS, ...RATIOS_UNIT_2_LESSONS].find(
    (candidate) => candidate.code === 'ratio-language-lesson' && candidate.version === version,
  );
  if (!lesson) throw new Error(`ratio-language-lesson@${version} is missing from the catalog`);
  return lesson;
}

/**
 * Standing up a real D-69 NEEDS_HELP state means driving several
 * consecutive failed pilot-skill assessments through the browser - slow,
 * and testing the stranding threshold, not this UI. This seeds the state
 * directly instead, the same way global-setup.ts already touches Prisma
 * directly from Playwright infra (never from inside a .spec.ts file) to
 * provision the shared e2e account.
 */
export async function seedNeedsHelpLesson(version: SeededLessonVersion = '1.0.0'): Promise<{
  skillCode: string;
  skillVersion: string;
  lessonTitle: string;
}> {
  const lesson = ratioLanguageLesson(version);
  const policyProfileRef = lesson.policyProfileRef;
  if (!policyProfileRef) throw new Error(`${lesson.code} has no policyProfileRef`);
  const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_TEST_PARENT_EMAIL } });
  const learnerProfile = await prisma.learnerProfile.findFirstOrThrow({
    where: { householdId: user.householdId },
  });
  await prisma.learnerLessonState.upsert({
    where: {
      learnerProfileId_lessonCode_lessonVersion: {
        learnerProfileId: learnerProfile.id,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
      },
    },
    update: { remediationStatus: 'NEEDS_HELP' },
    create: {
      householdId: user.householdId,
      learnerProfileId: learnerProfile.id,
      lessonCode: lesson.code,
      lessonVersion: lesson.version,
      completionStatus: 'IN_PROGRESS',
      remediationStatus: 'NEEDS_HELP',
      policyProfileCode: policyProfileRef.code,
      policyProfileVersion: policyProfileRef.version,
    },
  });
  const skillRef = lesson.skillRefs[0];
  if (!skillRef) throw new Error(`${lesson.code} has no skillRefs`);
  return { skillCode: skillRef.code, skillVersion: skillRef.version, lessonTitle: lesson.title };
}

export async function clearNeedsHelpLesson(version: SeededLessonVersion = '1.0.0'): Promise<void> {
  const lesson = ratioLanguageLesson(version);
  const user = await prisma.user.findUnique({ where: { email: E2E_TEST_PARENT_EMAIL } });
  if (!user) return;
  const learnerProfile = await prisma.learnerProfile.findFirst({
    where: { householdId: user.householdId },
  });
  if (!learnerProfile) return;
  await prisma.learnerLessonState.deleteMany({
    where: {
      learnerProfileId: learnerProfile.id,
      lessonCode: lesson.code,
      lessonVersion: lesson.version,
    },
  });
}
