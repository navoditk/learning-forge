import { readFile } from 'node:fs/promises';

import { parseShadowReviewDispositions } from '../src/progression/shadow-review-input';
import { readCutoverReadiness } from '../src/progression/cutover-readiness';
import { prisma } from '../src/server/prisma';

async function main() {
  try {
    const dispositionPath = process.env.SHADOW_REVIEW_DISPOSITIONS_FILE;
    const dispositions = dispositionPath
      ? parseShadowReviewDispositions(JSON.parse(await readFile(dispositionPath, 'utf8')))
      : [];
    const report = await readCutoverReadiness(prisma, dispositions);

    console.log(
      JSON.stringify(
        {
          generatedAt: report.generatedAt.toISOString(),
          unboundOpenSessionCount: report.unboundOpenSessionCount,
          drainComplete: report.drainComplete,
          shadowReview: report.shadowReview,
          readyForIndependentReview: report.readyForIndependentReview,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
