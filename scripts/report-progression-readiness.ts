import { readCutoverReadiness } from '../src/progression/cutover-readiness';
import { prisma } from '../src/server/prisma';

async function main() {
  try {
    const report = await readCutoverReadiness();
    console.log(
      JSON.stringify({
        generatedAt: report.generatedAt.toISOString(),
        unboundOpenSessionCount: report.unboundOpenSessionCount,
        drainComplete: report.drainComplete,
        totalShadowDecisions: report.shadowReview.totalDecisions,
        divergentShadowDecisions: report.shadowReview.divergentDecisions,
        shadowReviewComplete: report.shadowReview.reviewComplete,
        readyForIndependentReview: report.readyForIndependentReview,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
