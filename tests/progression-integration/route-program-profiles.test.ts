import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { issueStepUpToken } from '../../src/auth/step-up';
import { hashPassword } from '../../src/auth/verify-credentials';
import { policyHash } from '../../src/progression/policy';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import {
  SV_LESSONS_V2,
  SV_PROGRAM_CODE,
  svSkill,
} from '../curriculum/fixtures/synthetic-versioned-catalog';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

const SYNTHETIC_PROFILE_REF = { code: 'synthetic-program-b-default', version: '1.0.0' };

// Program B's pinned profile differs from Math's in observable limits: two
// items per lesson attempt (Math: 3), a 2-of-2 lesson pass bar (Math: 3-of-3)
// and a one-minute step-up lifetime (Math: 10). Only the route's choice of
// profile can make an outcome differ.
vi.mock('../../src/progression/artifacts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/progression/artifacts')>();
  const math = actual.resolvePinnedPolicyProfile({
    code: 'grade-6-math-default',
    version: '1.1.0',
  });
  const profileB = {
    ...math,
    code: 'synthetic-program-b-default',
    version: '1.0.0',
    lessonItemsPerAttempt: 2,
    lessonPassBar: { correct: 2, outOf: 2 },
    stepUpReauthLifetimeMinutes: 1,
  };
  return {
    ...actual,
    resolvePinnedPolicyProfile: (ref: { code: string; version: string }) =>
      ref.code === profileB.code && ref.version === profileB.version
        ? profileB
        : actual.resolvePinnedPolicyProfile(ref),
  };
});

// The synthetic skills belong to the synthetic program; real skills keep theirs.
vi.mock('../../src/curriculum/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/curriculum/catalog')>();
  const { svSkill: skillOf, SV_PROGRAM_CODE: programCode } =
    await import('../curriculum/fixtures/synthetic-versioned-catalog');
  const skillsByCode = new Map(actual.skillsByCode);
  for (let n = 1; n <= 5; n += 1) {
    skillsByCode.set(skillOf(n).code, {
      code: skillOf(n).code,
      program: programCode,
      prerequisiteSkillCodes: [],
    } as never);
  }
  return { ...actual, skillsByCode };
});

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
      programs: [
        ...real.programs,
        ...fixture.programs.map((program) => ({
          ...program,
          defaultPolicyProfileRef: { code: 'synthetic-program-b-default', version: '1.0.0' },
        })),
      ],
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

vi.mock('../../src/assessment/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/assessment/store')>();
  return {
    ...actual,
    createAssessmentStore: () => ({
      async getBank(ref: { code: string; version: string }) {
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
import { POST as assignment } from '../../src/app/api/progression/assessment/assignment/route';
import { POST as override } from '../../src/app/api/progression/override/route';
import { GET as pilot } from '../../src/app/api/progression/pilot/route';
import { POST as stepUp } from '../../src/app/api/progression/step-up/route';
import { COURSE_CATALOG } from '../../src/curriculum/course-catalog';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import {
  activeProgramForTarget,
  programCodeOfTarget,
} from '../../src/progression/program-resolution';

/**
 * ROUTE-PROFILES (D-356/D-357 carried item): two active programs pin DISTINCT
 * profiles. A target in program B must be governed by B's profile in the
 * assignment and override routes, never Math's or the default program's.
 */
describe('routes apply the target program own pinned policy profile', () => {
  let householdId: string;
  let learnerProfileId: string;
  let parentId: string;
  const originalSecret = process.env.AUTH_SECRET;
  const originalGate = process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
  const mathProfile = () =>
    resolvePinnedPolicyProfile({ code: 'grade-6-math-default', version: '1.1.0' });
  const profileB = () => resolvePinnedPolicyProfile(SYNTHETIC_PROFILE_REF);

  beforeAll(async () => {
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    process.env.AUTH_SECRET ??= 'integration-route-profiles-secret-of-sufficient-length';
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const learnerUser = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: learnerUser.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    const parent = await prisma.user.create({
      data: {
        householdId,
        role: 'PARENT',
        email: `route-profiles-${householdId}@example.test`,
        passwordHash: await hashPassword('correct horse battery staple'),
      },
    });
    parentId = parent.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({
      householdId,
      learnerProfileId,
      actorUserId: parentId,
      actorRole: 'PARENT',
    });
  });

  afterAll(async () => {
    if (originalGate === undefined) delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    else process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = originalGate;
    if (originalSecret === undefined) delete process.env.AUTH_SECRET;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const call = async (handler: (request: never) => Promise<Response>, body: unknown) => {
    const response = await handler(
      new Request('http://localhost/api/progression/x', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }) as never,
    );
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  it('has two programs whose profiles genuinely differ', () => {
    expect(profileB().lessonItemsPerAttempt).not.toBe(mathProfile().lessonItemsPerAttempt);
    expect(profileB().stepUpReauthLifetimeMinutes).not.toBe(
      mathProfile().stepUpReauthLifetimeMinutes,
    );
    expect(programCodeOfTarget({ targetKind: 'SKILL', code: svSkill(2).code })).toBe(
      SV_PROGRAM_CODE,
    );
    expect(
      activeProgramForTarget({ targetKind: 'SKILL', code: svSkill(2).code })
        ?.defaultPolicyProfileRef,
    ).toEqual(SYNTHETIC_PROFILE_REF);
    expect(
      activeProgramForTarget({ targetKind: 'SKILL', code: 'ratio-language' })
        ?.defaultPolicyProfileRef,
    ).toEqual({ code: 'grade-6-math-default', version: '1.1.0' });
  });

  it('assignment: a program B lesson uses B profile, a Math lesson keeps Math profile', async () => {
    const lessonB = SV_LESSONS_V2[3]!;
    const b = await call(assignment, {
      kind: 'LESSON_ASSESSMENT',
      targetKind: 'LESSON',
      targetCode: lessonB.code,
      targetVersion: lessonB.version,
      idempotencyKey: 'route-profiles-b-0001',
    });
    expect(b.status).toBe(201);
    const rowB = await prisma.assessmentAssignment.findFirstOrThrow({
      where: { learnerProfileId, idempotencyKey: 'route-profiles-b-0001' },
    });
    expect(rowB).toMatchObject({
      policyProfileCode: SYNTHETIC_PROFILE_REF.code,
      policyProfileVersion: SYNTHETIC_PROFILE_REF.version,
      policyProfileHash: policyHash(profileB()),
    });
    expect(rowB.policyProfileHash).not.toBe(policyHash(mathProfile()));
    expect(rowB.selectedItems as unknown[]).toHaveLength(profileB().lessonItemsPerAttempt);

    const math = await call(assignment, {
      kind: 'LESSON_ASSESSMENT',
      targetKind: 'LESSON',
      targetCode: 'ratio-language-lesson',
      targetVersion: '2.0.0',
      idempotencyKey: 'route-profiles-a-0001',
    });
    // The real Math bank metadata is served by the synthetic store, so the
    // request is admitted and must carry Math's profile, never B's.
    expect(math.status).toBe(201);
    const rowA = await prisma.assessmentAssignment.findFirstOrThrow({
      where: { learnerProfileId, idempotencyKey: 'route-profiles-a-0001' },
    });
    expect(rowA.policyProfileCode).toBe('grade-6-math-default');
    expect(rowA.policyProfileHash).toBe(policyHash(mathProfile()));
    expect(rowA.selectedItems as unknown[]).toHaveLength(mathProfile().lessonItemsPerAttempt);
  });

  it('override: step-up lifetime comes from the skill program, not Math or the default', async () => {
    // Five minutes old: inside Math's 10-minute lifetime, outside B's 1 minute.
    const issuedAt = new Date(Date.now() - 5 * 60_000);
    const token = () =>
      issueStepUpToken({ userId: parentId, householdId, issuedAt }, process.env.AUTH_SECRET);
    const body = (skillCode: string, stepUpToken: string) => ({
      skillCode,
      skillVersion: '1.0.0',
      reason: 'Practised the skill together offline.',
      stepUpToken,
    });
    await prisma.learnerLessonState.deleteMany({ where: { householdId } });
    const lessonB = SV_LESSONS_V2[1]!;
    await prisma.learnerLessonState.createMany({
      data: [
        { code: lessonB.code, version: lessonB.version },
        { code: 'ratio-language-lesson', version: '2.0.0' },
      ].map((lesson) => ({
        householdId,
        learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        completionStatus: 'COMPLETE' as const,
        remediationStatus: 'NEEDS_HELP' as const,
        policyProfileCode: 'seed',
        policyProfileVersion: '0.0.0',
      })),
    });

    expect(await call(override, body(svSkill(2).code, token()))).toMatchObject({
      status: 403,
      body: { reasonCode: 'REAUTH_EXPIRED' },
    });
    expect(await prisma.overrideRecord.count({ where: { householdId } })).toBe(0);

    const mathResult = await call(override, body('ratio-language', token()));
    expect(mathResult.status).toBe(201);
    expect(
      await prisma.overrideRecord.findFirstOrThrow({
        where: { householdId, targetCode: 'ratio-language' },
      }),
    ).toMatchObject({ policyProfileCode: 'grade-6-math-default', policyProfileVersion: '1.1.0' });

    // Within B's own lifetime the B skill is accepted and recorded under B's profile.
    const fresh = issueStepUpToken(
      { userId: parentId, householdId, issuedAt: new Date() },
      process.env.AUTH_SECRET,
    );
    expect((await call(override, body(svSkill(2).code, fresh))).status).toBe(201);
    expect(
      await prisma.overrideRecord.findFirstOrThrow({
        where: { householdId, targetCode: svSkill(2).code },
      }),
    ).toMatchObject({
      policyProfileCode: SYNTHETIC_PROFILE_REF.code,
      policyProfileVersion: SYNTHETIC_PROFILE_REF.version,
    });
  });

  it('step-up: advertises the minimum lifetime across active unit-bearing programs', async () => {
    const lifetimes = COURSE_CATALOG.programs
      .filter((program) => program.unitRefs.length > 0)
      .map(
        (program) =>
          resolvePinnedPolicyProfile(program.defaultPolicyProfileRef).stepUpReauthLifetimeMinutes,
      );
    // Both distinct profiles are in play; the shortest one wins.
    expect(lifetimes).toContain(mathProfile().stepUpReauthLifetimeMinutes);
    expect(lifetimes).toContain(profileB().stepUpReauthLifetimeMinutes);
    const result = await call(stepUp, { password: 'correct horse battery staple' });
    expect(result.status).toBe(200);
    expect(result.body.expiresInMinutes).toBe(Math.min(...lifetimes));
    expect(result.body.expiresInMinutes).toBe(profileB().stepUpReauthLifetimeMinutes);
    expect(result.body.expiresInMinutes).not.toBe(mathProfile().stepUpReauthLifetimeMinutes);
    expect(typeof result.body.stepUpToken).toBe('string');
  });

  it('step-up: a route-issued token is accepted per the target program profile', async () => {
    const issued = await call(stepUp, { password: 'correct horse battery staple' });
    const stepUpToken = issued.body.stepUpToken as string;
    await prisma.overrideRecord.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.createMany({
      data: [
        { code: SV_LESSONS_V2[1]!.code, version: SV_LESSONS_V2[1]!.version },
        { code: 'ratio-language-lesson', version: '2.0.0' },
      ].map((lesson) => ({
        householdId,
        learnerProfileId,
        lessonCode: lesson.code,
        lessonVersion: lesson.version,
        completionStatus: 'COMPLETE' as const,
        remediationStatus: 'NEEDS_HELP' as const,
        policyProfileCode: 'seed',
        policyProfileVersion: '0.0.0',
      })),
    });
    const body = (skillCode: string) => ({
      skillCode,
      skillVersion: '1.0.0',
      reason: 'Practised the skill together offline.',
      stepUpToken,
    });
    vi.useFakeTimers({ toFake: ['Date'], now: Date.now() + 5 * 60_000 });
    try {
      // Five minutes after issue: past the advertised minute and B's lifetime,
      // inside Math's ten, so only the target program's profile decides.
      expect(await call(override, body(svSkill(2).code))).toMatchObject({
        status: 403,
        body: { reasonCode: 'REAUTH_EXPIRED' },
      });
      expect((await call(override, body('ratio-language'))).status).toBe(201);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pilot: a program B request projects program B, not Math', async () => {
    const pilotCall = async (query: string) => {
      const response = await pilot(
        new Request(`http://localhost/api/progression/pilot${query}`) as never,
      );
      return {
        status: response.status,
        body: (await response.json()) as never as {
          program: { code: string };
          units: { code: string; lessons: { code: string }[] }[];
        },
      };
    };
    const b = await pilotCall(`?program=${SV_PROGRAM_CODE}`);
    expect(b.status).toBe(200);
    expect(b.body.program.code).toBe(SV_PROGRAM_CODE);
    const lessonCodesB = b.body.units.flatMap((unit) => unit.lessons.map((l) => l.code));
    expect(lessonCodesB).toContain(SV_LESSONS_V2[1]!.code);
    expect(lessonCodesB).not.toContain('ratio-language-lesson');

    const math = await pilotCall('');
    expect(math.status).toBe(200);
    expect(math.body.program.code).toBe('grade-6-math');
    const lessonCodesA = math.body.units.flatMap((unit) => unit.lessons.map((l) => l.code));
    expect(lessonCodesA).toContain('ratio-language-lesson');
    expect(lessonCodesA).not.toContain(SV_LESSONS_V2[1]!.code);

    expect((await pilotCall('?program=no-such-program')).status).toBe(404);
  });

  /**
   * PILOT-PROGRESS-ISOLATION (D-370 carried P2). The same learner has progress
   * rows in BOTH active programs with deliberately different statuses. Each
   * pilot response must show its own program's rows and none of the other's.
   *
   * Proves: through the real route and database, a response's lesson/unit
   * statuses come from that program's rows (a projection that used the other
   * program's scope or rows would show a wrong code set or wrong statuses).
   * Does NOT prove: that the DB `in:` code filter alone isolates rows (the
   * catalog-driven projection already drops foreign rows, so that filter is
   * defence in depth), nor anything about other learners/households, nor
   * assessment-result projection (no results are seeded).
   */
  it('pilot: each program shows its own seeded progress and none of the other program', async () => {
    const mathUnit = COURSE_CATALOG.unitsOfProgram('grade-6-math')[0]!;
    const bUnit = COURSE_CATALOG.unitsOfProgram(SV_PROGRAM_CODE)[0]!;
    const mathLesson = { code: 'ratio-language-lesson', version: '2.0.0' };
    const bLessonA = SV_LESSONS_V2[1]!;
    const bLessonB = SV_LESSONS_V2[2]!;
    const cleanup = async () => {
      await prisma.learnerLessonState.deleteMany({ where: { householdId } });
      await prisma.learnerUnitState.deleteMany({ where: { householdId } });
    };
    await cleanup();
    try {
      const base = { householdId, learnerProfileId, policyProfileVersion: '0.0.0' };
      await prisma.learnerLessonState.createMany({
        data: [
          {
            ...base,
            lessonCode: mathLesson.code,
            lessonVersion: mathLesson.version,
            completionStatus: 'COMPLETE',
            remediationStatus: 'NEEDS_HELP',
          },
          {
            ...base,
            lessonCode: bLessonA.code,
            lessonVersion: bLessonA.version,
            completionStatus: 'IN_PROGRESS',
            remediationStatus: 'ACTIVE',
          },
          {
            ...base,
            lessonCode: bLessonB.code,
            lessonVersion: bLessonB.version,
            completionStatus: 'AVAILABLE',
            remediationStatus: 'NONE',
          },
        ],
      });
      await prisma.learnerUnitState.createMany({
        data: [
          {
            ...base,
            unitCode: mathUnit.code,
            unitVersion: mathUnit.version,
            completionStatus: 'COMPLETE',
            overrideStatus: 'NONE',
          },
          {
            ...base,
            unitCode: bUnit.code,
            unitVersion: bUnit.version,
            completionStatus: 'IN_PROGRESS',
            overrideStatus: 'NONE',
          },
        ],
      });

      type Lesson = { code: string; completionStatus: string; remediationStatus: string };
      type Body = {
        program: { code: string };
        units: { code: string; status: string; lessons: Lesson[] }[];
        history: unknown[];
      };
      const get = async (query: string) => {
        const response = await pilot(
          new Request(`http://localhost/api/progression/pilot${query}`) as never,
        );
        expect(response.status).toBe(200);
        return (await response.json()) as Body;
      };
      const lessonsOf = (body: Body) => body.units.flatMap((unit) => unit.lessons);
      const byCode = (body: Body, code: string) =>
        lessonsOf(body).find((lesson) => lesson.code === code);

      const checkB = async () => {
        const b = await get(`?program=${SV_PROGRAM_CODE}`);
        expect(b.program.code).toBe(SV_PROGRAM_CODE);
        expect(b.units.map((unit) => [unit.code, unit.status])).toEqual([
          [bUnit.code, 'IN_PROGRESS'],
        ]);
        expect(byCode(b, bLessonA.code)).toMatchObject({
          completionStatus: 'IN_PROGRESS',
          remediationStatus: 'ACTIVE',
        });
        expect(byCode(b, bLessonB.code)).toMatchObject({
          completionStatus: 'AVAILABLE',
          remediationStatus: 'NONE',
        });
        // Unseeded B lessons stay NOT_STARTED; Math's COMPLETE never leaks.
        expect(byCode(b, SV_LESSONS_V2[0]!.code)).toMatchObject({
          completionStatus: 'NOT_STARTED',
        });
        expect(byCode(b, mathLesson.code)).toBeUndefined();
        expect(b.units.some((unit) => unit.code === mathUnit.code)).toBe(false);
        expect(lessonsOf(b).every((lesson) => lesson.code.startsWith('synthetic-versioned-'))).toBe(
          true,
        );
        expect(JSON.stringify(b.history)).not.toContain(mathLesson.code);
      };
      const checkMath = async () => {
        const math = await get('');
        expect(math.program.code).toBe('grade-6-math');
        expect(math.units.find((unit) => unit.code === mathUnit.code)?.status).toBe('COMPLETE');
        expect(byCode(math, mathLesson.code)).toMatchObject({
          completionStatus: 'COMPLETE',
          remediationStatus: 'NEEDS_HELP',
        });
        expect(byCode(math, bLessonA.code)).toBeUndefined();
        expect(byCode(math, bLessonB.code)).toBeUndefined();
        expect(math.units.some((unit) => unit.code === bUnit.code)).toBe(false);
        expect(
          lessonsOf(math).some((lesson) => lesson.code.startsWith('synthetic-versioned-')),
        ).toBe(false);
        expect(JSON.stringify(math.history)).not.toContain('synthetic-versioned-');
      };
      // Order-independent: either program first, repeated.
      await checkB();
      await checkMath();
      await checkB();
    } finally {
      await cleanup();
    }
  });
});
