import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// A controllable view of the committed unit 1.0.0 snapshot, so PH-3 (absent)
// and PH-4 (altered) run through the real store and submission code.
const snapshotView = vi.hoisted(() => ({
  mode: 'real' as 'real' | 'absent' | 'tampered',
  real: undefined as unknown,
}));

vi.mock(
  '../../src/curriculum/probe-snapshots/ratios-and-proportional-reasoning-placement-probe@1.0.0.json',
  async (importOriginal) => {
    const original = (await importOriginal()) as { default: Record<string, unknown> };
    snapshotView.real = original.default;
    const current = (): Record<string, unknown> => {
      if (snapshotView.mode === 'absent') return {};
      if (snapshotView.mode === 'tampered') {
        const copy = structuredClone(original.default) as {
          items: { projection: { prompt: string } }[];
        };
        copy.items[0]!.projection.prompt = `${copy.items[0]!.projection.prompt} (altered)`;
        return copy as unknown as Record<string, unknown>;
      }
      return original.default;
    };
    const view = new Proxy(
      {},
      {
        get: (_target, key) => Reflect.get(current(), key),
        has: (_target, key) => Reflect.has(current(), key),
        ownKeys: () => Reflect.ownKeys(current()),
        getOwnPropertyDescriptor: (_target, key) => {
          const descriptor = Reflect.getOwnPropertyDescriptor(current(), key);
          return descriptor ? { ...descriptor, configurable: true } : undefined;
        },
      },
    );
    return { default: view };
  },
);

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { NextRequest } from 'next/server';

import { POST } from '../../src/app/api/progression/assessment/assignment/route';
import { GET as getCurrentItemRoute } from '../../src/app/api/progression/assessment/submission/route';
import { createAssessmentStore } from '../../src/assessment/store';
import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import { PILOT_UNITS } from '../../src/curriculum/pilot-catalog';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import {
  getCurrentAssessmentItem,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import {
  admittedPlacementProbeBank,
  placementProbeBank,
  placementProbeBankFor,
  placementProbeBankRef,
} from '../../src/progression/placement-probe';
import { policyHash } from '../../src/progression/policy';
import { deleteHouseholdData } from '../../src/server/household-data';
import { requireHouseholdContext } from '../../src/server/household-context';
import { prisma } from '../../src/server/prisma';

const unit = PILOT_UNITS[0]!;
const profileRef = { code: 'grade-6-math-default', version: '1.1.0' };
const FIRST_ITEM = 'ratio-language-1';

type SelectedItem = { id: string; version: string; hash: string; ordinal: number };

describe('H-1 live: placement probe snapshots (PH-0 to PH-5)', () => {
  let householdId: string;
  let learnerProfileId: string;
  let run = 0;
  const removed: { index: number; item: (typeof servableContentCatalog)[number] }[] = [];

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN = 'true';
    delete process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
  });

  beforeEach(async () => {
    snapshotView.mode = 'real';
    // A fresh synthetic learner per case: no active lease or placement carries over.
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    vi.mocked(requireHouseholdContext).mockResolvedValue({ householdId, learnerProfileId });
  });

  afterEach(() => {
    snapshotView.mode = 'real';
    // Restore the in-memory servable catalog exactly as it was.
    for (const { index, item } of removed.reverse()) servableContentCatalog.splice(index, 0, item);
    removed.length = 0;
  });

  afterAll(async () => {
    delete process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN;
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  /** The content moves on: the item leaves the active servable catalog. */
  function retireServable(id: string): void {
    const index = servableContentCatalog.findIndex((item) => item.id === id);
    if (index < 0) throw new Error(`fixture: ${id} is not servable`);
    removed.push({ index, item: servableContentCatalog[index]! });
    servableContentCatalog.splice(index, 1);
  }

  /** Creates a placement assignment the way pre-RI-2 code did: from the live composition. */
  async function createLiveComposedAssignment() {
    run += 1;
    const profile = resolvePinnedPolicyProfile(profileRef);
    const live = placementProbeBank(unit)!;
    return createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind: 'PLACEMENT',
        targetKind: 'UNIT',
        targetRef: { code: unit.code, version: unit.version },
        bankRef: { code: live.code, version: live.version },
        policyProfileRef: profileRef,
        policyProfileHash: policyHash(profile),
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: live.contentHash,
        itemsPerAttempt: Math.min(live.items.length, profile.placementProbeMaxItems),
        requiredCount: live.items.length,
        requiredSkillCodes: live.items.map((item) => item.skillRef.code),
        expiresAt: new Date(Date.now() + 3_600_000),
        idempotencyKey: `ph-${randomUUID()}-${run}`,
      },
      createAssessmentStore(),
    );
  }

  async function submitAll(
    assignment: Awaited<ReturnType<typeof createLiveComposedAssignment>>['assignment'],
    answers: Map<string, string>,
  ) {
    const store = createAssessmentStore();
    for (const selected of assignment.selectedItems as SelectedItem[]) {
      await submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: assignment.id,
          sessionId: assignment.sessions[0]!.id,
          ordinal: selected.ordinal,
          learnerResponse: answers.get(selected.id) ?? 'not the answer',
        },
        store,
      );
    }
  }

  const canonicalAnswers = () =>
    new Map(
      placementProbeBank(unit)!.items.map((item) => [
        item.id,
        item.deterministicValidator.canonicalAnswer,
      ]),
    );

  type Created = Awaited<ReturnType<typeof createLiveComposedAssignment>>['assignment'];

  /** Fetches the current item through the library and through the GET route. */
  async function fetchCurrent(assignment: Created) {
    const sessionId = assignment.sessions[0]!.id;
    const library = await getCurrentAssessmentItem({
      householdId,
      learnerProfileId,
      assignmentId: assignment.id,
      sessionId,
    }).then(
      (value) => ({ value, error: undefined as unknown }),
      (error: unknown) => ({ value: undefined, error }),
    );
    const response = await getCurrentItemRoute(
      new NextRequest(
        `http://localhost/api/progression/assessment/submission?assignmentId=${assignment.id}&sessionId=${sessionId}`,
      ),
    );
    return { library, route: { status: response.status, body: (await response.json()) as never } };
  }

  const postPlacement = async (idempotencyKey: string) => {
    const response = await POST(
      new Request('http://localhost/api/progression/assessment/assignment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'PLACEMENT',
          targetKind: 'UNIT',
          targetCode: unit.code,
          targetVersion: unit.version,
          idempotencyKey,
        }),
      }) as never,
    );
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  it('PH-0 an assignment created by pre-RI-2 code finishes against the snapshot', async () => {
    const { assignment } = await createLiveComposedAssignment();
    const snapshot = placementProbeBankFor(placementProbeBankRef(unit))!;
    // The pre-RI-2 pin is the snapshot's content hash: nothing was repinned.
    expect(assignment.curriculumSnapshotHash).toBe(snapshot.contentHash);
    await submitAll(assignment, canonicalAnswers());
    expect(await prisma.learnerPlacement.count({ where: { learnerProfileId } })).toBe(1);
  });

  it('PH-1 serves and scores the original projection after the item leaves the servable catalog', async () => {
    const { assignment } = await createLiveComposedAssignment();
    const before = placementProbeBank(unit)!;
    const originalAnswers = canonicalAnswers();
    retireServable(FIRST_ITEM);
    // Live composition now fails closed, yet the snapshot still resolves.
    expect(placementProbeBank(unit)).toBeUndefined();
    const resolved = createAssessmentStore().getBank(placementProbeBankRef(unit));
    await expect(resolved).resolves.toMatchObject({ contentHash: before.contentHash });
    // Learner-facing fetch serves the original projection from the snapshot.
    const original = before.items[0]!;
    const fetched = await fetchCurrent(assignment);
    const viaLibrary = fetched.library.value!;
    expect(viaLibrary.item).toMatchObject({ title: original.title, prompt: original.prompt });
    expect(viaLibrary.item).not.toHaveProperty('deterministicValidator');
    expect(fetched.route.status).toBe(200);
    expect(fetched.route.body).toMatchObject({
      item: { title: original.title, prompt: original.prompt },
    });
    expect(JSON.stringify(fetched.route.body)).not.toContain('canonicalAnswer');
    await submitAll(assignment, originalAnswers);
    const placement = await prisma.learnerPlacement.findFirstOrThrow({
      where: { learnerProfileId },
    });
    expect(placement).toMatchObject({ unitCode: unit.code, unitVersion: unit.version });
    expect(placement.evidenceRefs).toMatchObject({
      itemResults: [
        { skillCode: 'ratio-language', correctness: 'CORRECT' },
        { skillCode: 'unit-rates', correctness: 'CORRECT' },
        { skillCode: 'ratio-tables', correctness: 'CORRECT' },
      ],
    });
  });

  it('PH-2 a new placement on the unit is refused once a pinned item is not servable', async () => {
    expect((await postPlacement('ph2-before')).status).toBe(201);
    await prisma.learnerPlacement.deleteMany({ where: { householdId } });
    retireServable(FIRST_ITEM);
    const refused = await postPlacement('ph2-after');
    expect(refused).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    expect(admittedPlacementProbeBank(unit)).toBeUndefined();
  });

  it('RI2-R1 a retried placement request replays after its first item is withdrawn', async () => {
    const created = await postPlacement('replay-original-key');
    expect(created.status).toBe(201);
    const count = () => prisma.assessmentAssignment.count({ where: { learnerProfileId } });
    const before = await count();
    const original = await prisma.assessmentAssignment.findFirstOrThrow({
      where: { learnerProfileId, idempotencyKey: 'replay-original-key' },
    });
    retireServable(FIRST_ITEM);
    const replayed = await postPlacement('replay-original-key');
    expect(replayed.status).toBe(200);
    expect(JSON.stringify(replayed.body)).toContain(original.id);
    expect(await count()).toBe(before);
    // A genuinely new request is still refused, with no new assignment.
    expect(await postPlacement('replay-brand-new-key')).toMatchObject({
      status: 503,
      body: { reasonCode: 'ASSESSMENT_STORE_UNAVAILABLE' },
    });
    expect(await count()).toBe(before);
  });

  it('PH-3 a missing snapshot fails closed and leaves the assignment unchanged', async () => {
    const { assignment } = await createLiveComposedAssignment();
    const store = createAssessmentStore();
    snapshotView.mode = 'absent';
    await expect(store.getBank(placementProbeBankRef(unit))).rejects.toMatchObject({
      code: 'ASSESSMENT_STORE_UNAVAILABLE',
    });
    const missing = await fetchCurrent(assignment);
    expect(missing.library.error).toMatchObject({ code: 'ASSESSMENT_STORE_UNAVAILABLE' });
    expect(missing.route.status).toBe(503);
    await expect(submitAll(assignment, canonicalAnswers())).rejects.toMatchObject({
      code: 'ASSESSMENT_STORE_UNAVAILABLE',
    });
    const stored = await prisma.assessmentAssignment.findUniqueOrThrow({
      where: { id: assignment.id },
    });
    expect(stored.selectedItems).toEqual(assignment.selectedItems);
    expect(stored.curriculumSnapshotHash).toBe(assignment.curriculumSnapshotHash);
    expect(await prisma.learnerPlacement.count({ where: { learnerProfileId } })).toBe(0);
  });

  it('PH-4 altered snapshot bytes fail the same way', async () => {
    const { assignment } = await createLiveComposedAssignment();
    snapshotView.mode = 'tampered';
    await expect(
      createAssessmentStore().getBank(placementProbeBankRef(unit)),
    ).rejects.toMatchObject({ code: 'ASSESSMENT_STORE_UNAVAILABLE' });
    const altered = await fetchCurrent(assignment);
    expect(altered.library.error).toMatchObject({ code: 'ASSESSMENT_STORE_UNAVAILABLE' });
    expect(altered.route.status).toBe(503);
    await expect(submitAll(assignment, canonicalAnswers())).rejects.toMatchObject({
      code: 'ASSESSMENT_STORE_UNAVAILABLE',
    });
    const stored = await prisma.assessmentAssignment.findUniqueOrThrow({
      where: { id: assignment.id },
    });
    expect(stored.selectedItems).toEqual(assignment.selectedItems);
    expect(stored.curriculumSnapshotHash).toBe(assignment.curriculumSnapshotHash);
    expect(await prisma.learnerPlacement.count({ where: { learnerProfileId } })).toBe(0);
    // New placements fail closed too.
    expect(await postPlacement('ph4-new-placement')).toMatchObject({ status: 503 });
  });

  it('PH-5 an unservable first ref refuses a new placement with no fall-through', async () => {
    // A later ref for the same skill stays servable: the old composition would have used it.
    const laterRef = contentCatalog.find((item) => item.id === 'ratio-language-2');
    expect(laterRef?.review.status).toBe('reviewed');
    retireServable(FIRST_ITEM);
    expect(servableContentCatalog.some((item) => item.id === 'ratio-language-2')).toBe(true);
    expect(placementProbeBank(unit)).toBeUndefined();
    const assignmentsBefore = await prisma.assessmentAssignment.count({
      where: { learnerProfileId },
    });
    const refused = await postPlacement('ph5-new-placement');
    expect(refused.status).toBe(503);
    expect(await prisma.assessmentAssignment.count({ where: { learnerProfileId } })).toBe(
      assignmentsBefore,
    );
  });
});
