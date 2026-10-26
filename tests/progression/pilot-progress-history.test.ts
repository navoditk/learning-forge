import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CourseProgress } from '../../src/app/course-progress-view';
import { createScanner, ROOT } from '../content/fixtures/import-scanner';
import { resolve } from 'node:path';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import { COURSE_CATALOG, COURSE_CATALOG_INDEX } from '../../src/curriculum/course-catalog';
import {
  SV_PROGRAM_CODE,
  SV_UNIT_CODE,
  selectionFor,
  syntheticVersionedInput,
  sv,
} from '../curriculum/fixtures/synthetic-versioned-catalog';

// DB-free: the Prisma client is replaced, so no database is needed (scope
// section 5.2). Seeded-row evidence is the RI-4 integration test.
const db = vi.hoisted(() => ({
  lessonStates: [] as unknown[],
  unitStates: [] as unknown[],
  assignments: [] as unknown[],
  calls: [] as Array<{ model: string; where: Record<string, unknown> }>,
}));
vi.mock('../../src/server/prisma', () => ({
  prisma: {
    learnerLessonState: {
      findMany: async (args: { where: Record<string, unknown> }) => {
        db.calls.push({ model: 'lesson', where: args.where });
        return db.lessonStates;
      },
    },
    learnerUnitState: {
      findMany: async (args: { where: Record<string, unknown> }) => {
        db.calls.push({ model: 'unit', where: args.where });
        return db.unitStates;
      },
    },
    assessmentAssignment: {
      findMany: async (args: { where: Record<string, unknown> }) => {
        db.calls.push({ model: 'assignment', where: args.where });
        return db.assignments;
      },
    },
  },
}));

import {
  getPilotProgression,
  projectPilotProgression,
  type PilotProgressCatalogs,
  type PilotProgression,
} from '../../src/progression/pilot-progress';

const versioned = createVersionedCourseCatalog({
  records: syntheticVersionedInput(),
  selection: selectionFor(),
});
const twoVersions: PilotProgressCatalogs = {
  active: versioned.activeView(),
  index: versioned.index,
};
const identity = { householdId: 'synthetic-household', learnerProfileId: 'synthetic-learner' };
const l = (n: number) => sv(`l${n}`);

const lessonRow = (code: string, version: string, completion: string, remediation: string) => ({
  lessonCode: code,
  lessonVersion: version,
  completionStatus: completion,
  remediationStatus: remediation,
});

beforeEach(() => {
  db.lessonStates = [];
  db.unitStates = [];
  db.assignments = [];
  db.calls = [];
});

describe('pilot progress history projection (C7-A, D-230)', () => {
  it('active units carry the 2.0.0 lessons; history carries only 1.0.0 lessons with a state row', () => {
    const projection = projectPilotProgression(twoVersions, SV_PROGRAM_CODE, {
      lessonStates: [lessonRow(l(3), '1.0.0', 'IN_PROGRESS', 'NEEDS_HELP')],
      unitStates: [
        { unitCode: SV_UNIT_CODE, unitVersion: '1.0.0', completionStatus: 'IN_PROGRESS' },
      ],
      assignments: [],
    });
    expect(projection.program).toMatchObject({ code: SV_PROGRAM_CODE, version: '1.1.0' });
    expect(projection.units).toHaveLength(1);
    expect(projection.units[0]).toMatchObject({ code: SV_UNIT_CODE, version: '2.0.0' });
    expect(
      projection.units[0]!.lessons.map((lesson) => `${lesson.code}@${lesson.version}`),
    ).toEqual([1, 2, 3, 4, 5].map((n) => `${l(n)}@2.0.0`));
    // No 2.0.0 row: the active lessons are untouched defaults.
    expect(projection.units[0]!.status).toBe('NOT_STARTED');
    expect(projection.history).toEqual([
      {
        code: SV_UNIT_CODE,
        version: '1.0.0',
        title: 'Synthetic versioned unit',
        status: 'IN_PROGRESS',
        lessons: [
          {
            code: l(3),
            version: '1.0.0',
            title: 'Synthetic versioned lesson 3',
            completionStatus: 'IN_PROGRESS',
            remediationStatus: 'NEEDS_HELP',
            latestAssessment: undefined,
            skillRefs: [{ code: sv('s3'), version: '1.0.0' }],
          },
        ],
      },
    ]);
  });

  it('positive control: no 1.0.0 row means no history', () => {
    const projection = projectPilotProgression(twoVersions, SV_PROGRAM_CODE, {
      lessonStates: [lessonRow(l(3), '2.0.0', 'IN_PROGRESS', 'NONE')],
      unitStates: [],
      assignments: [],
    });
    expect(projection.history).toEqual([]);
    expect(projection.units[0]!.lessons[2]).toMatchObject({
      code: l(3),
      version: '2.0.0',
      completionStatus: 'IN_PROGRESS',
    });
  });

  it('keeps the latest assessment per lesson version', () => {
    const projection = projectPilotProgression(twoVersions, SV_PROGRAM_CODE, {
      lessonStates: [
        lessonRow(l(3), '1.0.0', 'IN_PROGRESS', 'NEEDS_HELP'),
        lessonRow(l(3), '2.0.0', 'IN_PROGRESS', 'NEEDS_HELP'),
      ],
      unitStates: [],
      assignments: [
        {
          targetCode: l(3),
          targetVersion: '1.0.0',
          result: { id: 'result-1', outcome: 'FAIL', scoredAt: new Date('2026-10-01T12:00:00Z') },
        },
        { targetCode: l(3), targetVersion: '2.0.0', result: null },
      ],
    });
    expect(projection.history[0]!.lessons[0]!.latestAssessment).toEqual({
      outcome: 'FAIL',
      resultId: 'result-1',
      scoredAt: '2026-10-01T12:00:00.000Z',
    });
    expect(projection.units[0]!.lessons[2]!.latestAssessment).toBeUndefined();
    expect(projection.units[0]!.lessons[2]!.remediationStatus).toBe('NEEDS_HELP');
  });

  it('getPilotProgression queries the lesson codes of every version once', async () => {
    db.lessonStates = [lessonRow(l(2), '1.0.0', 'COMPLETE', 'NONE')];
    const projection = await getPilotProgression(identity, twoVersions, SV_PROGRAM_CODE);
    expect(projection.history.map((unit) => unit.version)).toEqual(['1.0.0']);
    const lessonQuery = db.calls.find((call) => call.model === 'lesson')!;
    expect(lessonQuery.where.lessonCode).toEqual({ in: [1, 2, 3, 4, 5].map(l) });
    expect(db.calls.find((call) => call.model === 'unit')!.where.unitCode).toEqual({
      in: [SV_UNIT_CODE],
    });
  });

  it('RI-5 production catalog: unit 2.0.0 is active with five lessons and a 1.0.0 row is history', async () => {
    const real = { active: COURSE_CATALOG, index: COURSE_CATALOG_INDEX };
    db.lessonStates = [lessonRow('ratio-tables-lesson', '1.0.0', 'COMPLETE', 'NONE')];
    const projection = await getPilotProgression(identity);
    expect(projection.program).toEqual({
      code: 'grade-6-math',
      version: '1.1.0',
      label: 'Grade 6 Math',
    });
    expect(projection.units).toHaveLength(1);
    expect(projection.units[0]!.version).toBe('2.0.0');
    expect(projection.units[0]!.lessons.map((lesson) => lesson.code)).toEqual([
      'ratio-language-lesson',
      'unit-rates-lesson',
      'ratio-tables-lesson',
      'double-number-lines-lesson',
      'percent-applications-lesson',
    ]);
    expect(projection.units[0]!.lessons.every((lesson) => lesson.version === '2.0.0')).toBe(true);
    expect(projection.history.map((unit) => unit.version)).toEqual(['1.0.0']);
    expect(projection.history[0]!.lessons).toMatchObject([
      { code: 'ratio-tables-lesson', completionStatus: 'COMPLETE', version: '1.0.0' },
    ]);
    expect(await getPilotProgression(identity, real)).toEqual(projection);
  });

  it('the projection is assignable to the client-safe CourseProgress shape', () => {
    const projection: PilotProgression = projectPilotProgression(twoVersions, SV_PROGRAM_CODE, {
      lessonStates: [],
      unitStates: [],
      assignments: [],
    });
    const view: CourseProgress = projection;
    expect(view.units).toBe(projection.units);
  });

  it('the shared view module does not reach the server, Prisma or the progression modules', () => {
    const view = resolve(ROOT, 'src/app/course-progress-view.ts');
    const closure = createScanner().closure([view]);
    expect([...closure]).toEqual([view]);
  });
});
