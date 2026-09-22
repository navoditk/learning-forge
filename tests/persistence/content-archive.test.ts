import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { archiveCurrentContentCatalog, resolveArchivedContent } from '../../src/content/archive';
import { contentCatalog } from '../../src/content/catalog';
import { prisma } from '../../src/server/prisma';

describe('durable content archive', () => {
  const source = contentCatalog[0];
  const retiredKey = `${source.id}-retired-fixture`;

  beforeAll(async () => {
    await prisma.contentArchive.deleteMany({
      where: { OR: [{ contentKey: source.id }, { contentKey: retiredKey }] },
    });
  });

  afterAll(async () => {
    await prisma.contentArchive.deleteMany({
      where: { OR: [{ contentKey: source.id }, { contentKey: retiredKey }] },
    });
    await prisma.$disconnect();
  });

  it('archives current versions append-only and resolves them from durable storage', async () => {
    await archiveCurrentContentCatalog(prisma);

    const archived = await prisma.contentArchive.findUnique({
      where: {
        contentKey_contentVersion: { contentKey: source.id, contentVersion: source.version },
      },
    });
    expect(archived?.contentKey).toBe(source.id);
    expect(archived?.contentVersion).toBe(source.version);
    await expect(resolveArchivedContent(prisma, source.id, source.version)).resolves.toMatchObject({
      id: source.id,
      version: source.version,
    });
  });

  it('retains a retired version that no longer exists in the active catalog', async () => {
    const retired = { ...source, id: retiredKey, version: '0.9.0' };
    await prisma.contentArchive.create({
      data: {
        contentKey: retired.id,
        contentVersion: retired.version,
        content: retired,
      },
    });

    await expect(
      resolveArchivedContent(prisma, retired.id, retired.version),
    ).resolves.toMatchObject({
      id: retired.id,
      version: retired.version,
    });
  });

  it('fails closed when an archive row is malformed', async () => {
    const malformedKey = `${retiredKey}-malformed`;
    await prisma.contentArchive.create({
      data: { contentKey: malformedKey, contentVersion: '1.0.0', content: { answer: 'secret' } },
    });

    await expect(resolveArchivedContent(prisma, malformedKey, '1.0.0')).resolves.toBeUndefined();
    await prisma.contentArchive.delete({
      where: { contentKey_contentVersion: { contentKey: malformedKey, contentVersion: '1.0.0' } },
    });
  });
});
