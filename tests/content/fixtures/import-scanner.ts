import { resolve } from 'node:path';

import ts from 'typescript';

// Test-only module-graph scanner: TypeScript AST for specifier extraction and
// the repository's tsconfig (paths, bundler resolution, .js -> .ts) for resolution.
export const ROOT = resolve(__dirname, '../../..');

const config = ts.readConfigFile(resolve(ROOT, 'tsconfig.json'), ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, ROOT).options;

/** Optional in-memory overlay: absolute path -> source text. */
export type VirtualFiles = ReadonlyMap<string, string>;

export function specifiersOf(fileName: string, text: string): string[] {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const literal = (node: ts.Node | undefined) => {
    if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) {
      found.push(node.text);
    }
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      literal(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      literal(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (
        callee.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(callee) && callee.text === 'require')
      ) {
        literal(node.arguments[0]);
      }
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      literal(node.argument.literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

export function createScanner(virtual: VirtualFiles = new Map()) {
  const exists = (path: string) => virtual.has(path) || ts.sys.fileExists(path);
  const read = (path: string) => virtual.get(path) ?? ts.sys.readFile(path);
  const host: ts.ModuleResolutionHost = {
    fileExists: exists,
    readFile: read,
    directoryExists: (path) =>
      [...virtual.keys()].some((key) => key.startsWith(`${path}/`)) ||
      (ts.sys.directoryExists?.(path) ?? false),
    realpath: (path) => path,
  };
  const importsOf = (file: string): string[] => {
    const text = read(file);
    if (text === undefined) return [];
    return specifiersOf(file, text)
      .map((spec) => ts.resolveModuleName(spec, file, options, host).resolvedModule)
      .filter((resolved) => resolved !== undefined && !resolved.isExternalLibraryImport)
      .map((resolved) => resolved!.resolvedFileName);
  };
  const closure = (roots: string[]): Set<string> => {
    const seen = new Set<string>();
    const stack = [...roots];
    while (stack.length > 0) {
      const file = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      stack.push(...importsOf(file));
    }
    return seen;
  };
  return { importsOf, closure };
}
