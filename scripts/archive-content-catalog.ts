import { archiveCurrentContentCatalog } from '../src/content/archive';
import { prisma } from '../src/server/prisma';

try {
  await archiveCurrentContentCatalog(prisma);
} finally {
  await prisma.$disconnect();
}
