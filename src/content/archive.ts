import type { Prisma, PrismaClient } from '@prisma/client';

import { contentCatalog } from './catalog';
import { ContentRecordSchema, type PracticeContentItem } from '../contracts/progression';

/**
 * Archives the current catalog without replacing an existing `{key, version}`.
 * Deployments should run this before removing a version from the active catalog.
 */
export async function archiveCurrentContentCatalog(database: PrismaClient): Promise<void> {
  await database.contentArchive.createMany({
    data: contentCatalog.map((item) => ({
      contentKey: item.id,
      contentVersion: item.version,
      content: item as unknown as Prisma.InputJsonValue,
    })),
    skipDuplicates: true,
  });
}

export async function resolveArchivedContent(
  database: PrismaClient,
  contentKey: string,
  contentVersion: string,
): Promise<PracticeContentItem | undefined> {
  const row = await database.contentArchive.findUnique({
    where: { contentKey_contentVersion: { contentKey, contentVersion } },
    select: { content: true },
  });
  if (!row) return undefined;

  try {
    const item = ContentRecordSchema.parse(row.content);
    if ('role' in item && item.role !== 'practice') return undefined;
    if (!('deterministicValidator' in item)) return undefined;
    return item as PracticeContentItem;
  } catch {
    // A corrupted archive row must never become learner- or tutor-visible.
    return undefined;
  }
}
