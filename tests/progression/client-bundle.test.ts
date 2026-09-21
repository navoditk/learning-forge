import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(process.cwd(), 'src');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return sourceExtensions.includes(extname(path)) ? [path] : [];
  });
}

function importsFrom(source: string): string[] {
  const imports = new Set<string>();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/gu,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
    /^\s*import\s*['"]([^'"]+)['"]/gmu,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) imports.add(match[1]!);
  }
  return [...imports];
}

function resolveSourceModule(from: string, specifier: string): string | undefined {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return undefined;
  const base = specifier.startsWith('@/')
    ? resolve(sourceRoot, specifier.slice(2))
    : resolve(dirname(from), specifier);
  const candidates = [base, ...sourceExtensions.map((extension) => `${base}${extension}`)];
  for (const candidate of candidates) {
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate;
  }
  for (const extension of sourceExtensions) {
    const candidate = join(base, `index${extension}`);
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate;
  }
  return undefined;
}

function clientEntries(): string[] {
  return sourceFiles(sourceRoot).filter((path) =>
    /^\s*['"]use client['"]\s*;?/mu.test(readFileSync(path, 'utf8')),
  );
}

describe('client bundle content boundary', () => {
  it('does not let a client entry transitively import public catalogs or held-out stores', () => {
    const forbidden = [
      resolve(sourceRoot, 'content/catalog'),
      resolve(sourceRoot, 'assessment/store'),
      resolve(sourceRoot, 'assessment/private-package-store'),
    ];
    const visited = new Set<string>();
    const violations: string[] = [];

    function visit(path: string, chain: string[]) {
      if (visited.has(path)) return;
      visited.add(path);
      if (forbidden.some((prefix) => path === prefix || path.startsWith(`${prefix}.`))) {
        violations.push([...chain, path].join(' -> '));
        return;
      }
      const source = readFileSync(path, 'utf8');
      for (const specifier of importsFrom(source)) {
        const dependency = resolveSourceModule(path, specifier);
        if (dependency) visit(dependency, [...chain, path]);
      }
    }

    for (const entry of clientEntries()) visit(entry, []);

    expect(violations).toEqual([]);
  });
});
