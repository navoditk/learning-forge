import { archiveCurrentContentCatalog } from '../src/content/archive';
import { prisma } from '../src/server/prisma';

// tsx compiles this script as CommonJS, which has no top-level await.
async function main() {
  try {
    await archiveCurrentContentCatalog(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Content archive failed', {
    errorType: error instanceof Error ? error.name : 'UnknownError',
  });
  process.exitCode = 1;
});
