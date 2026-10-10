import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { phase1Content } from '../../src/phase1/service';
import { prisma } from '../../src/server/prisma';
import { deleteHouseholdData } from '../../src/server/household-data';

vi.mock('../../src/server/household-context', () => ({
  requireHouseholdContext: vi.fn(),
}));

import { requireHouseholdContext } from '../../src/server/household-context';
import { GET as sessionGet } from '../../src/app/api/phase1/session/route';
import { POST as attemptPost } from '../../src/app/api/phase1/attempt/route';
import { POST as hintPost } from '../../src/app/api/phase1/hint/route';
import { POST as checkPost } from '../../src/app/api/phase1/check/route';
import { GET as planGet } from '../../src/app/api/phase1/plan/route';
import { GET as progressGet } from '../../src/app/api/phase1/progress/route';
import { GET as digestGet } from '../../src/app/api/phase1/digest/route';
import { GET as reviewGet } from '../../src/app/api/phase1/review/route';
import { POST as reviewAttemptPost } from '../../src/app/api/phase1/review-attempt/route';
import { GET as diagnosticGet } from '../../src/app/api/phase1/diagnostic/route';
import { POST as diagnosticAttemptPost } from '../../src/app/api/phase1/diagnostic-attempt/route';
import { GET as parentGet } from '../../src/app/api/phase1/parent/route';
import { GET as householdExportGet } from '../../src/app/api/phase1/household/export/route';
import { POST as householdDeletePost } from '../../src/app/api/phase1/household/delete/route';

// L6: no `/api/phase1/*` route response body may contain the active
// content item's canonical answer, any accepted-answer variant, or any
// forbidden-leakage pattern. This exercises every route under that path
// (13 files as of 2026-10-10) against a single real household/session and
// scans every response body structurally, not just by eyeballing a field.
const SENSITIVE_STRINGS = [
  phase1Content.deterministicValidator.canonicalAnswer,
  ...phase1Content.deterministicValidator.acceptedAnswers,
  ...phase1Content.forbiddenLeakagePatterns,
].filter((value, index, all) => all.indexOf(value) === index);

// Opaque identifiers (uuids, content ids) are excluded by key name: a short
// numeric canonical answer like "15" is otherwise prone to a coincidental
// substring match inside an unrelated uuid, which would make the scan noisy
// rather than meaningful. Field VALUES are still scanned everywhere else.
const IDENTIFIER_KEY = /(^id$|Id$|Key$|Code$)/u;

// Same reasoning for ISO timestamp fields (createdAt/expiresAt/dueAt/...):
// a short numeric canonical answer like "15" can coincidentally appear in a
// day-of-month or seconds component. Matches the convention already
// established in feedback-safety-assertions.ts for the same scan shape.
const TIMESTAMP_KEY = /At$/u;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/u;

function findLeak(value: unknown, path = '$', key?: string): string | undefined {
  if (typeof value === 'string') {
    if (key && IDENTIFIER_KEY.test(key)) return undefined;
    if (key && TIMESTAMP_KEY.test(key) && ISO_TIMESTAMP.test(value)) return undefined;
    const hit = SENSITIVE_STRINGS.find((marker) => value.includes(marker));
    return hit ? `${path} contains "${hit}"` : undefined;
  }
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      const leak = findLeak(entry, `${path}[${index}]`, key);
      if (leak) return leak;
    }
    return undefined;
  }
  if (value && typeof value === 'object') {
    for (const [entryKey, entry] of Object.entries(value as Record<string, unknown>)) {
      const leak = findLeak(entry, `${path}.${entryKey}`, entryKey);
      if (leak) return leak;
    }
  }
  return undefined;
}

async function asJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

describe('phase1 API route answer-leakage scan (L6)', () => {
  let householdId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'PARENT' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    vi.mocked(requireHouseholdContext).mockResolvedValue({
      householdId,
      learnerProfileId: profile.id,
      actorUserId: user.id,
      actorRole: 'PARENT',
    });
  });

  afterAll(async () => {
    if (householdId) await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('never returns a canonical answer, accepted answer, or leakage pattern from any route', async () => {
    const leaks: string[] = [];
    const scan = async (label: string, response: Response) => {
      const body = await asJson(response);
      const leak = findLeak(body);
      if (leak) leaks.push(`${label} (status ${response.status}): ${leak}`);
      return body;
    };

    const practiceSessionReq = new Request(
      `http://localhost/api/phase1/session?contentId=${encodeURIComponent(phase1Content.id)}`,
    );
    const { default: NextRequestCtor } = await import('next/server').then((m) => ({
      default: m.NextRequest,
    }));
    const practiceSession = await scan(
      'GET /session (practice)',
      await sessionGet(new NextRequestCtor(practiceSessionReq)),
    );
    const sessionId = practiceSession.sessionId;
    expect(sessionId).toBeTypeOf('string');

    await scan(
      'POST /attempt (wrong answer)',
      await attemptPost(
        new Request('http://localhost/api/phase1/attempt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, learnerResponse: 'definitely-not-the-answer' }),
        }),
      ),
    );

    await scan(
      'POST /hint',
      await hintPost(
        new Request('http://localhost/api/phase1/hint', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ learnerMessage: 'I am stuck, what do I do next?' }),
        }),
      ),
    );

    await scan(
      'POST /check',
      await checkPost(
        new Request('http://localhost/api/phase1/check', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, learnerResponse: 'definitely-not-the-answer' }),
        }),
      ),
    );

    await scan(
      'GET /plan',
      await planGet(new NextRequestCtor(new Request('http://localhost/api/phase1/plan'))),
    );
    await scan(
      'GET /progress',
      await progressGet(new NextRequestCtor(new Request('http://localhost/api/phase1/progress'))),
    );
    await scan('GET /digest', await digestGet());
    await scan(
      'GET /review',
      await reviewGet(new NextRequestCtor(new Request('http://localhost/api/phase1/review'))),
    );
    await scan(
      'GET /diagnostic',
      await diagnosticGet(
        new NextRequestCtor(new Request('http://localhost/api/phase1/diagnostic')),
      ),
    );
    await scan('GET /parent', await parentGet());

    const reviewSessionReq = new NextRequestCtor(
      new Request(
        `http://localhost/api/phase1/session?contentId=${encodeURIComponent(phase1Content.id)}&activityKind=REVIEW`,
      ),
    );
    const reviewSession = await scan('GET /session (review)', await sessionGet(reviewSessionReq));
    const reviewSessionId = reviewSession.sessionId;
    await scan(
      'POST /review-attempt',
      await reviewAttemptPost(
        new Request('http://localhost/api/phase1/review-attempt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            sessionId: reviewSessionId,
            learnerResponse: 'definitely-not-the-answer',
          }),
        }),
      ),
    );

    await scan(
      'POST /diagnostic-attempt',
      await diagnosticAttemptPost(
        new Request('http://localhost/api/phase1/diagnostic-attempt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, learnerResponse: 'definitely-not-the-answer' }),
        }),
      ),
    );

    await scan('GET /household/export', await householdExportGet());

    expect(leaks).toEqual([]);

    // Deletion is destructive, so it runs last and only after every other
    // route has been scanned against this household's real data.
    await scan(
      'POST /household/delete',
      await householdDeletePost(
        new Request('http://localhost/api/phase1/household/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ confirmation: 'DELETE' }),
        }),
      ),
    );
    expect(leaks).toEqual([]);
  });
});
