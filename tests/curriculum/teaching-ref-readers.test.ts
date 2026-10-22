import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { ROOT, type VirtualFiles } from '../content/fixtures/import-scanner';

/**
 * RAT-INTEGRATE RI-4 (RI-R6, CE-9, D-232): lessons may pin
 * `teachingContentRefs`, but nothing may serve them. This guard scans `src/`
 * and `scripts/` for READS of the field (property access, element access,
 * destructuring). Object-literal declarations in structure records and the
 * schema definition are not reads. The one allowlisted reader is the V-2
 * registration check, which only validates pins. Changing the allowlist needs
 * its own review (scope R-3).
 */
const FIELD = 'teachingContentRefs';
const SCAN_DIRS = ['src', 'scripts'];
const EXT = /\.(ts|tsx|mts)$/;
const ALLOWED_READERS = new Set(['src/curriculum/catalog-registration-checks.ts']);

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

/**
 * Whether an object literal is an assignment-destructuring target, for example
 * `({ teachingContentRefs: refs } = lesson)`, `[{ f: x }] = list` or
 * `for ({ f: x } of list)`, as opposed to an ordinary object value.
 */
function isAssignmentTarget(literal: ts.ObjectLiteralExpression): boolean {
  let child: ts.Node = literal;
  let parent: ts.Node | undefined = literal.parent;
  while (parent) {
    if (ts.isParenthesizedExpression(parent) || ts.isArrayLiteralExpression(parent)) {
      // keep climbing
    } else if (ts.isPropertyAssignment(parent) && parent.initializer === child) {
      // nested pattern value: keep climbing to the owning object literal
    } else if (ts.isObjectLiteralExpression(parent) || ts.isSpreadElement(parent)) {
      // keep climbing
    } else if (ts.isSpreadAssignment(parent)) {
      // keep climbing
    } else if (
      ts.isBinaryExpression(parent) &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      if (parent.left === child) return true;
      // The pattern is the default value on the right; it is a value, not a target.
      return false;
    } else if (
      (ts.isForOfStatement(parent) || ts.isForInStatement(parent)) &&
      parent.initializer === child
    ) {
      return true;
    } else {
      return false;
    }
    child = parent;
    parent = parent.parent;
  }
  return false;
}

/**
 * The single source of truth for property names: the statically known name an
 * expression or name node denotes, or undefined when it is dynamic. Forms:
 * identifiers, string literals, numeric literals, no-substitution template
 * literals, computed names wrapping any of these (`['x']`, `[`x`]`), wrappers
 * (parentheses, `as`, `satisfies`, `!`) and concatenations of static names.
 */
function staticName(node: ts.Node | undefined): string | undefined {
  if (node === undefined) return undefined;
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) return node.text;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  if (ts.isComputedPropertyName(node)) return staticName(node.expression);
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  )
    return staticName(node.expression);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticName(node.left);
    const right = staticName(node.right);
    return left !== undefined && right !== undefined ? left + right : undefined;
  }
  return undefined;
}

const isField = (node: ts.Node | undefined): boolean => staticName(node) === FIELD;

/** Number of reads of the field in the source text. */
function teachingRefReads(fileName: string, text: string): number {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  let reads = 0;
  const visit = (node: ts.Node): void => {
    // Property access: `lesson.teachingContentRefs`.
    if (ts.isPropertyAccessExpression(node) && isField(node.name)) reads += 1;
    // Element access: `lesson['teachingContentRefs']`.
    else if (ts.isElementAccessExpression(node) && isField(node.argumentExpression)) reads += 1;
    // Assignment destructuring: `({ teachingContentRefs: refs } = lesson)`.
    else if (
      (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) &&
      isField(node.name) &&
      ts.isObjectLiteralExpression(node.parent) &&
      isAssignmentTarget(node.parent)
    )
      reads += 1;
    // Binding destructuring: `const { teachingContentRefs: refs } = lesson`.
    else if (ts.isBindingElement(node) && isField(node.propertyName ?? node.name)) reads += 1;
    ts.forEachChild(node, visit);
  };
  visit(source);
  return reads;
}

/** Files (repo-relative) that read the field, over disk files plus an optional overlay. */
function readers(virtual: VirtualFiles = new Map()): string[] {
  const files = new Map<string, string>();
  for (const dir of SCAN_DIRS) {
    for (const path of walk(resolve(ROOT, dir))) {
      files.set(relative(ROOT, path), readFileSync(path, 'utf8'));
    }
  }
  for (const [path, text] of virtual) files.set(relative(ROOT, path), text);
  return [...files]
    .filter(([name, text]) => teachingRefReads(name, text) > 0)
    .map(([name]) => name)
    .sort();
}

describe('teaching refs are pinned but never read by serving code (D-232)', () => {
  it('only the V-2 registration check reads teachingContentRefs under src/ and scripts/', () => {
    const found = readers();
    expect(found.filter((name) => !ALLOWED_READERS.has(name))).toEqual([]);
  });

  it('positive control: the allowlisted V-2 reader is found, so the guard is not vacuous', () => {
    expect(readers()).toEqual([...ALLOWED_READERS]);
  });

  it('negative control: an injected unauthorised reader under src/app is reported', () => {
    const injected = resolve(ROOT, 'src/app/components/teaching-panel.tsx');
    const found = readers(
      new Map([
        [
          injected,
          'export const x = (lesson: { teachingContentRefs: unknown[] }) => lesson.teachingContentRefs.map(String);',
        ],
      ]),
    );
    expect(found).toContain('src/app/components/teaching-panel.tsx');
    expect(found.filter((name) => !ALLOWED_READERS.has(name))).toEqual([
      'src/app/components/teaching-panel.tsx',
    ]);
  });

  it('negative control: an injected assignment-destructuring reader is reported (RI4-R2)', () => {
    const injected = resolve(ROOT, 'src/progression/teaching-assign.ts');
    const found = readers(
      new Map([
        [
          injected,
          `export function f(lesson: { ${FIELD}: unknown[] }) { let refs: unknown[] = []; ({ ${FIELD}: refs } = lesson); return refs; }`,
        ],
      ]),
    );
    expect(found.filter((name) => !ALLOWED_READERS.has(name))).toEqual([
      'src/progression/teaching-assign.ts',
    ]);
  });

  it('every static name form is detected in every read context (RI4-R2 completeness)', () => {
    const forms: Record<string, string> = {
      identifier: FIELD,
      'string literal': `'${FIELD}'`,
      'double-quoted literal': `"${FIELD}"`,
      'computed string literal': `['${FIELD}']`,
      'computed template literal': `[\`${FIELD}\`]`,
      'computed parenthesised/as': `[('${FIELD}' as const)]`,
      'computed concatenation': `['teaching' + 'ContentRefs']`,
    };
    for (const [name, form] of Object.entries(forms)) {
      const bare = form.startsWith('[') ? form.slice(1, -1) : form;
      // Binding destructuring (property name written as the form).
      if (name !== 'identifier') {
        expect(
          teachingRefReads('a.ts', `const { ${form}: refs } = lesson;`),
          `binding ${name}`,
        ).toBe(1);
        expect(
          teachingRefReads('a.ts', `function f({ ${form}: refs }: L) {}`),
          `param ${name}`,
        ).toBe(1);
        expect(
          teachingRefReads('a.ts', `let refs; ({ ${form}: refs } = lesson);`),
          `assign ${name}`,
        ).toBe(1);
        expect(
          teachingRefReads('a.ts', `let r; ({ o: { ${form}: r } } = lesson);`),
          `nested ${name}`,
        ).toBe(1);
        expect(
          teachingRefReads('a.ts', `let r; for ({ ${form}: r } of ls) {}`),
          `for-of ${name}`,
        ).toBe(1);
        expect(teachingRefReads('a.ts', `const r = lesson[${bare}];`), `element ${name}`).toBe(1);
      }
    }
    expect(teachingRefReads('a.ts', `const { ${FIELD}: refs } = lesson;`)).toBe(1);
    expect(teachingRefReads('a.ts', `const { ${FIELD} } = lesson;`)).toBe(1);
    expect(teachingRefReads('a.ts', `const r = lesson[\`${FIELD}\`];`)).toBe(1);
    expect(teachingRefReads('a.ts', `const r = lesson.${FIELD};`)).toBe(1);
  });

  it('declarations of every name form stay ignored (positive controls)', () => {
    for (const form of [FIELD, `'${FIELD}'`, `['${FIELD}']`, `[\`${FIELD}\`]`]) {
      expect(teachingRefReads('a.ts', `const record = { ${form}: [] };`), form).toBe(0);
      expect(teachingRefReads('a.ts', `let x; x = { ${form}: [] };`), form).toBe(0);
      expect(
        teachingRefReads('a.ts', `f({ ${form}: [] }); const y = [{ ${form}: [] }];`),
        form,
      ).toBe(0);
      expect(teachingRefReads('a.ts', `let o; o = { a: { ${form}: [] } };`), form).toBe(0);
    }
    // Dynamic and unrelated names are not the field.
    expect(
      teachingRefReads('a.ts', `const { [key]: refs } = lesson; lesson[key]; lesson[1];`),
    ).toBe(0);
    expect(teachingRefReads('a.ts', `const { teachingContentRef: r, other } = lesson;`)).toBe(0);
  });

  it('negative control: injected computed-name destructuring readers are reported', () => {
    for (const body of [
      `({ ['${FIELD}']: refs } = lesson);`,
      `const { ['${FIELD}']: refs2 } = lesson; void refs2;`,
    ]) {
      const found = readers(
        new Map([
          [
            resolve(ROOT, 'src/progression/teaching-computed.ts'),
            `export function f(lesson: Record<string, unknown[]>) { let refs: unknown[] = []; ${body} return refs; }`,
          ],
        ]),
      );
      expect(found.filter((name) => !ALLOWED_READERS.has(name))).toEqual([
        'src/progression/teaching-computed.ts',
      ]);
    }
  });

  it('detects element access and destructuring, and ignores declarations', () => {
    expect(teachingRefReads('a.ts', `const r = lesson['${FIELD}'];`)).toBe(1);
    expect(teachingRefReads('a.ts', `const { ${FIELD}: refs } = lesson;`)).toBe(1);
    expect(teachingRefReads('a.ts', `const { ${FIELD} } = lesson;`)).toBe(1);
    expect(teachingRefReads('a.ts', `let refs; ({ ${FIELD}: refs } = lesson);`)).toBe(1);
    expect(teachingRefReads('a.ts', `let refs; ({ ${FIELD}: refs = [] } = lesson);`)).toBe(1);
    expect(teachingRefReads('a.ts', `let refs; [{ ${FIELD}: refs }] = lessons;`)).toBe(1);
    expect(teachingRefReads('a.ts', `let r; for ({ ${FIELD}: r } of lessons) {}`)).toBe(1);
    expect(teachingRefReads('a.ts', `let r; ({ outer: { ${FIELD}: r } } = lesson);`)).toBe(1);
    expect(teachingRefReads('a.ts', `let ${FIELD}; ({ ${FIELD} } = lesson);`)).toBe(1);
    expect(teachingRefReads('a.ts', `const record = { ${FIELD}: [] };`)).toBe(0);
    expect(teachingRefReads('a.ts', `let x; x = { ${FIELD}: [] };`)).toBe(0);
    expect(teachingRefReads('a.ts', `f({ ${FIELD}: [] }); const y = [{ ${FIELD}: [] }];`)).toBe(0);
    expect(teachingRefReads('a.ts', `let o; o = { a: { ${FIELD}: [] } };`)).toBe(0);
    expect(teachingRefReads('a.ts', `const s = z.object({ ${FIELD}: z.array(x) });`)).toBe(0);
    expect(teachingRefReads('a.ts', `// lesson.${FIELD}\nconst s = "lesson.${FIELD}";`)).toBe(0);
  });

  it('the schema definition and staged records are declarations, not reads', () => {
    for (const path of ['src/contracts/progression.ts', 'src/curriculum/pilot-catalog.ts']) {
      expect(teachingRefReads(path, readFileSync(resolve(ROOT, path), 'utf8')), path).toBe(0);
    }
  });
});
