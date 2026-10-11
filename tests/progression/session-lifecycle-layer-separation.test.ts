import { readFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';
import { expect, it } from 'vitest';

it('keeps lifecycle runtime dependencies within pure contracts and helpers', () => {
  const allowed = new Set([
    'src/progression/session-lifecycle.ts',
    'src/contracts/session-lifecycle.ts',
    'src/contracts/common.ts',
    'src/contracts/content.ts',
    'src/contracts/policy.ts',
    'src/contracts/program-codes.ts',
    'src/contracts/progression.ts',
    'src/contracts/curriculum.ts',
  ]);
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    expect(allowed.has(file), `Unexpected runtime dependency: ${file}`).toBe(true);
    visited.add(file);
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    function inspect(node: ts.Node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const typeOnly = ts.isImportDeclaration(node)
          ? node.importClause?.isTypeOnly
          : node.isTypeOnly;
        if (!typeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const specifier = node.moduleSpecifier.text;
          if (specifier.startsWith('.')) {
            visit(path.normalize(path.join(path.dirname(file), `${specifier}.ts`)));
          } else {
            expect(specifier).toBe('zod');
          }
        }
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
      ) {
        throw new Error(`Dynamic runtime dependency in ${file}`);
      }
      ts.forEachChild(node, inspect);
    }
    inspect(source);
  }
  visit('src/progression/session-lifecycle.ts');
  expect(visited).toEqual(allowed);
});
