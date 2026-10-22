import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createScanner, ROOT } from './fixtures/import-scanner';

const MODULE = 'src/content/teaching-validation.ts';
const SOURCE_DIRS = ['src', 'scripts', 'prisma'];
const EXT = /\.(ts|tsx|mts|js|mjs)$/;

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

const target = resolve(ROOT, MODULE);
const { importsOf, closure } = createScanner();
const rel = (path: string) => relative(ROOT, path);

describe('teaching validation module stays dormant', () => {
  it('exists', () => {
    expect(existsSync(target)).toBe(true);
  });

  it('is imported by no runtime source file under src, scripts or prisma', () => {
    const importers = SOURCE_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
      .filter((file) => file !== target)
      .filter((file) => importsOf(file).includes(target))
      .map(rel);
    expect(importers).toEqual([]);
  });

  it('is not reachable from the live catalog, routes, tutor, site generator or export', () => {
    const roots = [
      resolve(ROOT, 'src/content/catalog.ts'),
      resolve(ROOT, 'src/content/archive.ts'),
      resolve(ROOT, 'src/content/publication.ts'),
      resolve(ROOT, 'scripts/generate-curriculum-site.ts'),
      resolve(ROOT, 'src/app/api/phase1/household/export/route.ts'),
      ...walk(join(ROOT, 'src/app')),
      ...walk(join(ROOT, 'src/tutor')),
    ].filter((file) => existsSync(file));
    expect(roots.length).toBeGreaterThan(5);
    expect(closure(roots).has(target)).toBe(false);
  });

  it('detects an importer when one exists (self-check of the scanner)', () => {
    expect(importsOf(resolve(ROOT, 'tests/content/teaching-validation.test.ts'))).toContain(target);
  });
});

describe('import scanner regression cases (in-memory sources)', () => {
  const dir = resolve(ROOT, 'src/virtual');
  const vTarget = target;
  const reaches = (files: Record<string, string>, root: string) => {
    const virtual = new Map(Object.entries(files).map(([name, text]) => [join(dir, name), text]));
    return createScanner(virtual)
      .closure([join(dir, root)])
      .has(vTarget);
  };
  const cases: Record<string, string> = {
    'plain import': `import { x } from '../content/teaching-validation';`,
    'commented re-export': `export { x } from /* c */ '../content/teaching-validation';`,
    'template-literal dynamic import': 'const m = import(`../content/teaching-validation`);',
    'literal dynamic import': `const m = import('../content/teaching-validation');`,
    'commented side-effect import': `import /* c */ '../content/teaching-validation';`,
    'export star': `export * from '../content/teaching-validation';`,
    '.js extension': `import { x } from '../content/teaching-validation.js';`,
    'alias import': `import { x } from '@/content/teaching-validation';`,
    'require call': `const m = require('../content/teaching-validation');`,
    'import equals': `import m = require('../content/teaching-validation');`,
  };
  for (const [name, source] of Object.entries(cases)) {
    it(`detects ${name}`, () => {
      expect(reaches({ 'a.ts': source }, 'a.ts')).toBe(true);
    });
  }

  it('detects an indirect barrel chain (A re-exports B, B re-exports the module)', () => {
    expect(
      reaches(
        {
          'a.ts': `export * from './b';`,
          'b.ts': `export { validateTeachingRecords } from /* c */ '../content/teaching-validation';`,
        },
        'a.ts',
      ),
    ).toBe(true);
  });

  it('does not flag unrelated sources, strings or comments', () => {
    expect(
      reaches(
        {
          'a.ts': `// import '../content/teaching-validation'\nconst s = "../content/teaching-validation";\nimport './b';`,
          'b.ts': `export const y = 1;`,
        },
        'a.ts',
      ),
    ).toBe(false);
  });
});

describe('no serving artifacts exist for teaching', () => {
  it('has no content/teaching records in the tree', () => {
    expect(existsSync(resolve(ROOT, 'content/teaching'))).toBe(false);
  });
});
