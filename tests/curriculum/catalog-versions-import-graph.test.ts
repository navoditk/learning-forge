import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { COURSE_CATALOG, COURSE_CATALOG_INDEX } from '../../src/curriculum/course-catalog';
import RESERVED_LABELS from '../../src/curriculum/grade-6-math-reserved-labels.json';
import {
  RATIOS_UNIT_2_LESSONS,
  RATIOS_UNIT_2_PROGRAM,
  RATIOS_UNIT_2_UNIT,
} from '../../src/curriculum/ratios-unit-2-catalog';
import {
  itemRef,
  probeItemId,
  probeLesson,
  probeSkill,
  probeUnit,
  servedRecord,
} from '../progression/fixtures/synthetic-probe-snapshot';
import { SV_ALL_RECORDS } from './fixtures/synthetic-versioned-catalog';

function probeFixtureCodes(): string[] {
  const unit = probeUnit('1.0.0', 3);
  const lesson = probeLesson(1);
  return [
    unit.code,
    ...unit.lessonRefs.map((ref) => ref.code),
    ...lesson.skillRefs.map((ref) => ref.code),
    probeSkill(2).code,
    itemRef(1).id,
    probeItemId(3),
    servedRecord(1).item.id,
    servedRecord(1).item.skillRef!.code,
  ];
}

// The resolver below is copied from tests/progression/client-bundle.test.ts
// (not edited), with JSON added to the candidate extensions.
const repoRoot = process.cwd();
const sourceRoot = resolve(repoRoot, 'src');
const scriptsRoot = resolve(repoRoot, 'scripts');
const testsRoot = resolve(repoRoot, 'tests');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const resolvableExtensions = [...sourceExtensions, '.json'];

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

function resolveModule(from: string, specifier: string): string | undefined {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return undefined;
  const base = specifier.startsWith('@/')
    ? resolve(sourceRoot, specifier.slice(2))
    : resolve(dirname(from), specifier);
  const candidates = [base, ...resolvableExtensions.map((extension) => `${base}${extension}`)];
  for (const candidate of candidates) {
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate;
  }
  for (const extension of sourceExtensions) {
    const candidate = join(base, `index${extension}`);
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate;
  }
  return undefined;
}

const curriculum = (name: string): string => resolve(sourceRoot, 'curriculum', name);
const SNAPSHOT_MODULE = resolve(sourceRoot, 'progression', 'placement-probe-snapshot.ts');
// RI-5: the Ratios 2.0.0 records are live; only the course catalog and the
// program registry import them (IG-1s). They stay a pure-data IG-5 module.
const STAGED_CATALOG = curriculum('ratios-unit-2-catalog.ts');
const NEW_MODULES = [
  curriculum('catalog-versions.ts'),
  curriculum('catalog-registration-checks.ts'),
  SNAPSHOT_MODULE,
  STAGED_CATALOG,
];
const DORMANT = [
  ...NEW_MODULES.filter((path) => path !== STAGED_CATALOG),
  curriculum('grade-6-math-structure-manifest.json'),
];
// RI-1 (P-A live, D-229): catalog-versions is now imported by the production
// course catalog. The registration checks stay dormant. RI-2 (H-1 live, D-229):
// the live placement probe is the only importer of the snapshot module and the
// structure manifest.
const PLACEMENT_PROBE = resolve(sourceRoot, 'progression', 'placement-probe.ts');
const ALLOWED_EDGES = new Set([
  `${PLACEMENT_PROBE}->${SNAPSHOT_MODULE}`,
  `${PLACEMENT_PROBE}->${curriculum('grade-6-math-structure-manifest.json')}`,
  `${curriculum('course-catalog.ts')}->${curriculum('catalog-versions.ts')}`,
  `${curriculum('catalog-registration-checks.ts')}->${curriculum('catalog-versions.ts')}`,
  `${SNAPSHOT_MODULE}->${curriculum('catalog-registration-checks.ts')}`,
]);

type Edge = { from: string; to: string };

function productionEdges(): Edge[] {
  const edges: Edge[] = [];
  for (const root of [sourceRoot, scriptsRoot]) {
    for (const file of sourceFiles(root)) {
      for (const specifier of importsFrom(readFileSync(file, 'utf8'))) {
        const to = resolveModule(file, specifier);
        if (to) edges.push({ from: file, to });
      }
    }
  }
  return edges;
}

const FORBIDDEN_PREFIXES = ['content', 'assessment', 'server', 'app'].map((name) =>
  resolve(sourceRoot, name),
);
const FORBIDDEN_FILES = [resolve(sourceRoot, 'progression', 'placement-probe.ts')];
const ALLOWED_CLOSURE_FILES = new Set(
  [
    'catalog-versions.ts',
    'catalog-registration-checks.ts',
    'course-catalog.ts',
    'progression-catalog.ts',
    'pilot-catalog.ts',
    'program-registry.ts',
    'grade-6-math-active-selection.json',
    'grade-6-math-reserved-labels.json',
    'ratios-unit-2-catalog.ts',
  ]
    .map(curriculum)
    .concat(SNAPSHOT_MODULE),
);

function isForbidden(path: string): boolean {
  return (
    FORBIDDEN_FILES.includes(path) ||
    FORBIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );
}

/** Transitive walk over value and type imports; the start file itself is not judged. */
function walk(start: string): { violations: string[]; closure: Set<string> } {
  const closure = new Set<string>();
  const violations: string[] = [];
  const visit = (path: string, chain: string[]): void => {
    if (closure.has(path)) return;
    closure.add(path);
    for (const specifier of importsFrom(readFileSync(path, 'utf8'))) {
      if (specifier === '@prisma/client' || specifier.startsWith('next/')) {
        violations.push([...chain, path, specifier].map((p) => relative(repoRoot, p)).join(' -> '));
        continue;
      }
      const dependency = resolveModule(path, specifier);
      if (!dependency) continue;
      if (isForbidden(dependency)) {
        violations.push(
          [...chain, path, dependency].map((p) => relative(repoRoot, p)).join(' -> '),
        );
        continue;
      }
      visit(dependency, [...chain, path]);
    }
  };
  visit(start, []);
  return { violations, closure };
}

describe('catalog versioning dormancy', () => {
  it('IG-1 no production file imports the dormant modules except the allowlisted edge', () => {
    const offending = productionEdges()
      .filter(({ to }) => DORMANT.includes(to))
      .filter(({ from, to }) => !ALLOWED_EDGES.has(`${from}->${to}`))
      .map(({ from, to }) => `${relative(repoRoot, from)} -> ${relative(repoRoot, to)}`);
    expect(offending).toEqual([]);
  });

  it('IG-1s only the course catalog and the program registry import the live Ratios 2.0.0 catalog (RI-5)', () => {
    const importers = productionEdges()
      .filter(({ to }) => to === STAGED_CATALOG)
      .map(({ from }) => relative(repoRoot, from))
      .sort();
    expect(importers).toEqual([
      'src/curriculum/course-catalog.ts',
      'src/curriculum/program-registry.ts',
    ]);
    expect(DORMANT).not.toContain(STAGED_CATALOG);
    expect(NEW_MODULES).toContain(STAGED_CATALOG);
  });

  it('IG-1p the allowlisted edge exists, so the guard is not vacuous', () => {
    const edges = productionEdges().map(({ from, to }) => `${from}->${to}`);
    for (const edge of ALLOWED_EDGES) expect(edges).toContain(edge);
  });

  it('IG-2 the curriculum barrel does not re-export the dormant modules', () => {
    const barrel = curriculum('index.ts');
    const targets = importsFrom(readFileSync(barrel, 'utf8')).map((s) => resolveModule(barrel, s));
    for (const dormant of DORMANT) expect(targets).not.toContain(dormant);
  });

  it('IG-3 nothing under src or scripts imports from tests', () => {
    const offending = productionEdges()
      .filter(({ to }) => to.startsWith(`${testsRoot}/`))
      .map(({ from, to }) => `${relative(repoRoot, from)} -> ${relative(repoRoot, to)}`);
    expect(offending).toEqual([]);
  });

  it('IG-4 fixture records never reuse a real Grade 6 Math structure code', () => {
    const real = new Set<string>();
    const add = (code: string): void => void real.add(code);
    for (const program of COURSE_CATALOG.programs)
      if (program.code === 'grade-6-math') add(program.code);
    // Real structure codes: the indexed records plus the reserved labels
    // (ID-2), whose lesson codes and skill codes (the code without "-lesson")
    // were retired from the extension stub in RI-1.
    for (const record of [
      ...COURSE_CATALOG_INDEX.units,
      ...COURSE_CATALOG_INDEX.lessons,
      ...COURSE_CATALOG_INDEX.banks,
      ...RESERVED_LABELS,
    ]) {
      add(record.code);
    }
    for (const label of RESERVED_LABELS) {
      add(label.code.replace(/-lesson$/u, ''));
      add(`${label.code}-bank`);
    }
    for (const lesson of COURSE_CATALOG_INDEX.lessons) {
      for (const skill of lesson.skillRefs) add(skill.code);
    }
    // RI-4 staged records (not indexed): their codes are real structure codes
    // too, including the bank codes they reference.
    for (const record of [RATIOS_UNIT_2_PROGRAM, RATIOS_UNIT_2_UNIT, ...RATIOS_UNIT_2_LESSONS]) {
      add(record.code);
    }
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      add(lesson.assessmentBankRef.code);
      for (const skill of lesson.skillRefs) add(skill.code);
    }
    add(RATIOS_UNIT_2_UNIT.assessmentBankRef!.code);
    expect(real.has('grade-6-math')).toBe(true);
    expect(real.has('double-number-lines-lesson')).toBe(true);
    expect(real.has('percent-applications-lesson-bank')).toBe(true);
    expect(real.has('ratios-proportional-reasoning-unit-bank')).toBe(true);
    expect(SV_ALL_RECORDS.length).toBeGreaterThan(0);
    for (const record of SV_ALL_RECORDS) {
      expect(real.has(record.code), record.code).toBe(false);
      expect(record.code.startsWith('synthetic-versioned-')).toBe(true);
    }

    // Representative records and refs generated by the probe-snapshot fixture.
    const probeCodes = probeFixtureCodes();
    expect(probeCodes.length).toBeGreaterThan(5);
    for (const code of probeCodes) {
      expect(real.has(code), code).toBe(false);
      expect(code.startsWith('synthetic-probe-')).toBe(true);
    }

    // Negative control: a real Grade 6 Math code at a successor version, built here only,
    // would be caught by the same check.
    const injected = [...probeCodes, 'ratio-language-lesson', 'grade-6-math'];
    expect(injected.filter((code) => real.has(code))).toEqual([
      'ratio-language-lesson',
      'grade-6-math',
    ]);
  });

  it('IG-5 the new modules only reach contracts and pure curriculum data', () => {
    for (const start of NEW_MODULES) {
      const { violations, closure } = walk(start);
      expect(violations).toEqual([]);
      for (const file of closure) {
        const inContracts = file.startsWith(`${resolve(sourceRoot, 'contracts')}/`);
        expect(inContracts || ALLOWED_CLOSURE_FILES.has(file), relative(repoRoot, file)).toBe(true);
      }
    }
  });

  it('IG-5n the walker is transitive: it flags the live probe and store modules', () => {
    const probe = walk(resolve(sourceRoot, 'progression', 'placement-probe.ts'));
    expect(probe.violations.some((chain) => chain.endsWith('src/content/catalog.ts'))).toBe(true);
    const store = walk(resolve(sourceRoot, 'assessment', 'store.ts'));
    expect(store.violations.some((chain) => chain.endsWith('private-package-store.ts'))).toBe(true);
    expect(store.violations.some((chain) => chain.endsWith('progression/placement-probe.ts'))).toBe(
      true,
    );
  });
});
