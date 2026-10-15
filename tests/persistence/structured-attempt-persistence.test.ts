import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveHistoricalContent } from '../../src/content/archive';
import { contentCatalog } from '../../src/content/catalog';
import {
  auditStoredStructuredAttempt,
  interpretStoredResponse,
} from '../../src/content/structured-response';
import { recordAttempt } from '../../src/phase1/service';
import { deleteHouseholdData, exportHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';
import {
  archiveSyntheticItem,
  createSession,
  createSyntheticHousehold,
  removeArchivedItems,
  SF1,
  syntheticItem,
} from '../phase1/structured-paths-support';

/**
 * RAT-SCORE-IMPL-PATHS persistence evidence: PA-9 export, erasure, and the
 * H-1..H-5 history rules over rows written by the real attempt path. Synthetic
 * data only. Private-package storage is outside this packet.
 */
const ITEM = syntheticItem('synthetic-structured-persist-sf1', SF1);

describe('structured attempt persistence (existing columns, S-A)', () => {
  let identity: Awaited<ReturnType<typeof createSyntheticHousehold>>;
  let attemptId: string;

  beforeAll(async () => {
    identity = await createSyntheticHousehold();
    await archiveSyntheticItem(ITEM);
    const session = await createSession(identity, ITEM);
    attemptId = (
      await recordAttempt(identity, {
        sessionId: session.id,
        structuredResponse: {
          mode: 'structured-fields',
          modeVersion: '1',
          fields: { a: '90/2', b: '9.0' },
        },
      })
    ).attemptId;
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, identity.householdId);
    await removeArchivedItems([ITEM.id as string]);
    await prisma.$disconnect();
  });

  it('PA-9: the household export returns the structured row unchanged in content', async () => {
    const stored = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    const exported = await exportHouseholdData(prisma, identity.householdId);
    const row = (exported as unknown as { attempts: Record<string, unknown>[] }).attempts.find(
      (candidate) => candidate.id === attemptId,
    );
    expect(row).toMatchObject({
      learnerResponse: stored.learnerResponse,
      normalizedResponse: stored.normalizedResponse,
      correctness: 'CORRECT',
      scoringMethod: 'DETERMINISTIC',
      contentKey: ITEM.id,
      contentVersion: 'structured-1',
    });
    expect(JSON.parse(row!.learnerResponse as string)).toEqual({
      mode: 'structured-fields',
      modeVersion: '1',
      fields: [
        { key: 'a', value: '90/2' },
        { key: 'b', value: '9.0' },
      ],
    });
  });

  it('H-2/H-3: the pinned archived item resolves and renders the row with its labels, without rescoring', async () => {
    const stored = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    const item = await resolveHistoricalContent(
      prisma,
      contentCatalog,
      stored.contentKey,
      stored.contentVersion,
    );
    expect(item).toBeDefined();
    const interpreted = interpretStoredResponse(
      item!.deterministicValidator,
      stored.learnerResponse,
    );
    expect(interpreted).toMatchObject({
      kind: 'structured',
      entries: [
        { key: 'a', label: 'Quantity A', unitLabel: 'units', value: '90/2' },
        { key: 'b', label: 'Quantity B', value: '9.0' },
      ],
    });
    // H-5: a read-only audit reproduces the stored outcome and never writes.
    if (item!.deterministicValidator.type !== 'structured') throw new Error('expected structured');
    expect(
      auditStoredStructuredAttempt(
        item!.deterministicValidator,
        stored.learnerResponse,
        stored.correctness,
      ),
    ).toEqual({ agrees: true, recomputed: 'CORRECT' });
    const after = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(JSON.stringify(after)).toBe(JSON.stringify(stored));
  });

  it('H-1: stored correctness is authoritative and a tampered envelope is reported, never rewritten', async () => {
    const stored = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    const item = (await resolveHistoricalContent(
      prisma,
      contentCatalog,
      stored.contentKey,
      stored.contentVersion,
    ))!;
    if (item.deterministicValidator.type !== 'structured') throw new Error('expected structured');
    const disagreeing = auditStoredStructuredAttempt(
      item.deterministicValidator,
      stored.learnerResponse,
      'INCORRECT',
    );
    expect(disagreeing).toEqual({ agrees: false, recomputed: 'CORRECT' });
    expect(
      interpretStoredResponse(item.deterministicValidator, '{"mode":"structured-fields"}'),
    ).toMatchObject({ kind: 'unreadable' });
  });

  it('erasure removes the structured attempt like any other', async () => {
    const other = await createSyntheticHousehold();
    const session = await createSession(other, ITEM);
    const result = await recordAttempt(other, {
      sessionId: session.id,
      structuredResponse: {
        mode: 'structured-fields',
        modeVersion: '1',
        fields: { a: '1', b: '2' },
      },
    });
    expect(await prisma.attempt.count({ where: { id: result.attemptId } })).toBe(1);
    await deleteHouseholdData(prisma, other.householdId);
    expect(await prisma.attempt.count({ where: { id: result.attemptId } })).toBe(0);
    expect(await prisma.masteryContribution.count({ where: { attemptId: result.attemptId } })).toBe(
      0,
    );
  });
});
