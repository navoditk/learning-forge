/**
 * Positive allowlist grammar for a `python_output` listing (PYTHON-IMPLEMENT
 * PY-R3; dossier section 8, "Skill boundary: In scope"). Nothing is executed
 * and nothing is tokenized beyond this grammar: anything that does not match
 * it exactly is rejected, so every unsupported form fails closed by
 * construction.
 *
 * Grammar (one statement per line, no blank lines, no indentation):
 *
 *   listing   := line ( "\n" line )*
 *   line      := "print(" arg ( ", " arg )* ")"
 *   arg       := string | int | float | bool
 *   string    := "'" body "'" | '"' body '"'     body: 1+ chars U+0020-U+007E
 *                                                except ' " and \
 *   int       := "0" | [1-9][0-9]*
 *   float     := int-part "." frac               int-part <= 6 digits, frac 1-6
 *                                                digits and either "0" or not
 *                                                ending in 0 (so the printed
 *                                                form is exactly as written),
 *                                                and not 0.0000x: CPython's
 *                                                repr switches to exponent form
 *                                                below 0.0001 (0.00001 prints
 *                                                1e-05), so those are excluded
 *   bool      := "True" | "False"
 *
 * No prefixes (f, r, b), keyword arguments, unpacking, nested calls or brackets,
 * variables, operators, semicolons, comments or continuation. A later approved
 * skill must extend this allowlist deliberately; it is never widened implicitly.
 */

export type LiteralArg =
  | { kind: 'string'; value: string }
  | { kind: 'int'; text: string }
  | { kind: 'float'; text: string }
  | { kind: 'bool'; text: 'True' | 'False' };

export type LiteralPrintParse =
  { ok: true; lines: LiteralArg[][] } | { ok: false; problems: string[] };

const INT = /(?:0|[1-9][0-9]*)(?![0-9A-Za-z_.])/y;
const FLOAT = /(?:0|[1-9][0-9]{0,5})\.(?:0|[0-9]{0,5}[1-9])(?![0-9A-Za-z_.])/y;
const BOOL = /(?:True|False)(?![0-9A-Za-z_])/y;
const STRING_BODY = /^[ !#-&(-\[\]-~]+$/; // U+0020-U+007E except " ' \

function parseArg(line: string, at: number): { arg: LiteralArg; end: number } | undefined {
  const ch = line[at];
  if (ch === '"' || ch === "'") {
    const close = line.indexOf(ch, at + 1);
    if (close === -1) return undefined;
    const body = line.slice(at + 1, close);
    if (!STRING_BODY.test(body)) return undefined;
    return { arg: { kind: 'string', value: body }, end: close + 1 };
  }
  for (const [kind, pattern] of [
    ['float', FLOAT],
    ['int', INT],
    ['bool', BOOL],
  ] as const) {
    pattern.lastIndex = at;
    const match = pattern.exec(line);
    if (!match) continue;
    const text = match[0];
    // Positive values below 0.0001 print in exponent form, not as written.
    if (kind === 'float' && text.startsWith('0.0000')) return undefined;
    if (kind === 'bool')
      return { arg: { kind, text: text as 'True' | 'False' }, end: at + text.length };
    return { arg: { kind, text }, end: at + text.length };
  }
  return undefined;
}

function parseLine(line: string): LiteralArg[] | undefined {
  const prefix = 'print(';
  if (!line.startsWith(prefix)) return undefined;
  const args: LiteralArg[] = [];
  let at = prefix.length;
  for (;;) {
    const parsed = parseArg(line, at);
    if (!parsed) return undefined;
    args.push(parsed.arg);
    at = parsed.end;
    if (line.startsWith(', ', at)) {
      at += 2;
      continue;
    }
    return line.slice(at) === ')' ? args : undefined;
  }
}

/** Parses a listing against the allowlist, or reports which lines fall outside it. */
export function parseLiteralPrintListing(source: string): LiteralPrintParse {
  const problems: string[] = [];
  const lines: LiteralArg[][] = [];
  source.split('\n').forEach((line, index) => {
    const args = parseLine(line);
    if (args) lines.push(args);
    else problems.push(`line ${index + 1} is outside the approved literal-print form`);
  });
  return problems.length > 0 ? { ok: false, problems } : { ok: true, lines };
}

/** Allowlist violations for a `python_output` listing; empty when it is in scope. */
export function pythonOutputListingViolationsFromScan(source: string): string[] {
  const parsed = parseLiteralPrintListing(source);
  return parsed.ok ? [] : parsed.problems;
}

/** Every string literal value of an accepted listing; empty for a listing outside the grammar. */
export function listingStringValues(source: string): string[] {
  const parsed = parseLiteralPrintListing(source);
  if (!parsed.ok) return [];
  return parsed.lines.flat().flatMap((arg) => (arg.kind === 'string' ? [arg.value] : []));
}

/**
 * The output a literal-only listing prints, derived without executing anything:
 * each line's arguments joined by one space (strings without their quotes; ints,
 * True/False and floats exactly as written), lines joined by LF. `undefined`
 * when the listing is outside the grammar.
 */
export function deriveLiteralPrintOutput(source: string): string | undefined {
  const parsed = parseLiteralPrintListing(source);
  if (!parsed.ok) return undefined;
  return parsed.lines
    .map((args) => args.map((arg) => (arg.kind === 'string' ? arg.value : arg.text)).join(' '))
    .join('\n');
}
