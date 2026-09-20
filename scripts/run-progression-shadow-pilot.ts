import { deleteHouseholdEvidence } from '../src/server/delete-household-evidence';
import { ensureSyntheticIdentity, SYNTHETIC_IDENTITY } from '../src/identity/synthetic';
import { prisma } from '../src/server/prisma';
import { startSession } from '../src/phase1/service';

const SHADOW_RUN_ENVIRONMENT = process.env.PROGRESSION_SHADOW_RUN_ENVIRONMENT;

async function main() {
  if (SHADOW_RUN_ENVIRONMENT !== 'staging') {
    throw new Error(
      'Refusing to run synthetic shadow traffic unless PROGRESSION_SHADOW_RUN_ENVIRONMENT=staging',
    );
  }

  try {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDENTITY.householdId);
    await ensureSyntheticIdentity();
    const requests = [
      { contentId: 'ratio-language-1', activityKind: 'PRACTICE' as const },
      { contentId: 'unit-rates-1', activityKind: 'PRACTICE' as const },
      { contentId: 'ratio-tables-1', activityKind: 'PRACTICE' as const },
      { contentId: 'ratio-language-1', activityKind: 'PLACEMENT' as const },
      { contentId: 'ratio-language-1', activityKind: 'REVIEW' as const },
    ];
    const sessionIds: string[] = [];
    for (const request of requests) {
      const session = await startSession(SYNTHETIC_IDENTITY, {
        contentId: request.contentId,
        activityKind: request.activityKind,
      });
      sessionIds.push(session.sessionId);
    }
    await prisma.session.updateMany({
      where: { id: { in: sessionIds } },
      data: { endedAt: new Date() },
    });
    const [shadowDecisionCount, divergentShadowDecisionCount] = await Promise.all([
      prisma.shadowDecision.count({ where: { householdId: SYNTHETIC_IDENTITY.householdId } }),
      prisma.shadowDecision.count({
        where: { householdId: SYNTHETIC_IDENTITY.householdId, divergent: true },
      }),
    ]);
    console.log(
      JSON.stringify({
        status: 'completed',
        requestCount: requests.length,
        closedSessionCount: sessionIds.length,
        shadowDecisionCount,
        divergentShadowDecisionCount,
        household: 'synthetic-fixture',
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
