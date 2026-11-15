import { describe, expect, it } from 'vitest';

import { listingStringLiterals, pythonOutputListingViolations } from '../../src/contracts/python';
import {
  deriveLiteralPrintOutput,
  parseLiteralPrintListing,
} from '../../src/contracts/python-scan';

// PY-R3 / PY-R7 (round 4): a python_output listing must match the positive
// allowlist grammar (dossier section 8, in scope): each line is exactly one
// print( ARG, ARG ... ) with literal arguments only. Everything else fails
// closed. Static text analysis only: no snippet is executed.

const rejected = (source: string) => pythonOutputListingViolations(source).length > 0;

describe('every reviewer probe is rejected', () => {
  const probes: [string, string][] = [
    // Round 2 reproducers.
    ['end= after a string containing a close paren', 'print("a)", end="!")'],
    ['end= after a nested call', 'print(str(1), end="!")'],
    ['argument-free print hiding behind a comment', 'print( # comment\n)'],
    // Round 3 probes.
    ['print() inside an f-string expression', 'print(f"{print()}")'],
    ['print with end= inside an f-string expression', 'print(f"{print(1, end=chr(33))}")'],
    ['an empty string inside an f-string expression', 'print(f"{\'\'}")'],
    ['keyword unpacking', 'print("x", **dict(end="!"))'],
    ['empty argument unpacking', 'print(*[])'],
    ['a literal hidden in an f-string expression', 'print(f"{\'hidden\'.upper()}")'],
    // Round 3 bracket probes (PY-R7).
    ['an unmatched opening bracket', 'print([1)'],
    ['an unterminated call', 'print("x"'],
    ['a closer before the call', ')print("x")'],
  ];
  for (const [label, source] of probes) {
    it(`rejects ${label}: ${JSON.stringify(source)}`, () => {
      expect(rejected(source)).toBe(true);
    });
  }

  it('extracts no literals from a rejected listing, so nothing is hidden from hint checks', () => {
    expect(listingStringLiterals('print(f"{\'hidden\'.upper()}")')).toEqual([]);
  });
});

describe('valid literal prints are accepted', () => {
  const valid: [string, string][] = [
    ['a string', 'print("Hi")'],
    ['a single-quoted string', "print('Hi')"],
    ['a close paren inside a string', 'print("a)")'],
    ['an open paren inside a string', 'print("(a")'],
    ['a hash inside a string', 'print("# not a comment")'],
    ['an equals sign inside a string', 'print("sep=1", \'end=2\')'],
    ['print() text inside a string', "print('print()')"],
    ['a comma inside a string', 'print("a, b")'],
    ['an int', 'print(42)'],
    ['zero', 'print(0)'],
    ['True and False', 'print(True, False)'],
    ['a float', 'print(2.5)'],
    ['a float with a zero fraction', 'print(2.0)'],
    ['several arguments of mixed kinds', 'print("Score", 7, 2.5, True)'],
    ['several lines', 'print("a")\nprint(1)\nprint("b", "c")'],
    ['spaces inside a string', 'print("a b")'],
  ];
  for (const [label, source] of valid) {
    it(`accepts ${label}: ${JSON.stringify(source)}`, () => {
      expect(pythonOutputListingViolations(source), source).toEqual([]);
    });
  }
});

describe('forms outside the approved scope are rejected (a later skill must extend the allowlist)', () => {
  const outOfScope: [string, string][] = [
    ['a variable', 'x = 2\nprint(x)'],
    ['an operator', 'print(1 + 2)'],
    ['an f-string', 'x = 2\nprint(f"x is {x}")'],
    ['an f-string without a variable', 'print(f"hi")'],
    ['a raw string', "print(r'a')"],
    ['a bytes string', "print(b'a')"],
    ['a nested call', 'print(max(1, 2))'],
    ['nested parentheses', 'print((1))'],
    ['a list literal', 'print([1, 2])'],
    ['a comment line', '# note\nprint("a")'],
    ['a trailing comment', 'print("a")  # shows a'],
    ['a loop', 'for i in range(2):\n    print(i)'],
    ['indentation', ' print("a")'],
    ['a blank line', 'print("a")\n\nprint("b")'],
    ['a trailing blank line', 'print("a")\n'],
    ['a semicolon', 'print("a"); print("b")'],
    ['a second statement on a line', 'print("a") print("b")'],
    ['sep=', 'print("a", "b", sep="-")'],
    ['end=', 'print("a", end="")'],
    ['an argument-free print', 'print()'],
    ['an empty string', 'print("")'],
    ['an empty single-quoted string', "print('')"],
    ['a triple-quoted string', 'print("""a""")'],
    ['an escape sequence', 'print("a\\nb")'],
    ['a backslash continuation', 'print("a", \\\n    "b")'],
    ['a quote of the other kind inside a string', 'print("it\'s")'],
    ['an unterminated string', 'print("abc)'],
    ['mismatched quotes', 'print("a\')'],
    ['a negative number', 'print(-1)'],
    ['a leading-zero int', 'print(007)'],
    ['a float that would print differently (trailing zero)', 'print(2.50)'],
    ['a float without a fraction', 'print(2.)'],
    ['an exponent float', 'print(1e3)'],
    ['a lowercase bool', 'print(true)'],
    ['None', 'print(None)'],
    ['a name', 'print(hello)'],
    ['a missing space after the comma', 'print("a","b")'],
    ['two spaces after the comma', 'print("a",  "b")'],
    ['a trailing comma', 'print("a", )'],
    ['a space before the closing paren', 'print("a" )'],
    ['a space after the opening paren', 'print( "a")'],
    ['aliasing print', 'p = print\np("a")'],
    ['an attribute call', 'x.print("a")'],
    ['a tab', 'print("a\tb")'],
    ['a non-ASCII character in a string', 'print("café")'],
    ['an empty listing line', ''],
  ];
  for (const [label, source] of outOfScope) {
    it(`rejects ${label}: ${JSON.stringify(source)}`, () => {
      expect(rejected(source), source).toBe(true);
    });
  }
});

describe('float boundaries and the derivation audit (PY-R9)', () => {
  // Reasoning from CPython 3.14's rules (nothing is executed here):
  //  - print(x) of a float uses repr(x): the shortest decimal string that
  //    round-trips, switching to exponent form only when the decimal exponent is
  //    below -4 (value < 0.0001) or at 1e16 and above. Our floats have at most
  //    6 integer and 6 fractional digits (<= 12 significant digits, < 1e6), so
  //    the large-side switch never applies and round-tripping is exact: the
  //    shortest repr is the written digits. A zero fraction prints as ".0"
  //    (2.0 -> 2.0, 0.0 -> 0.0); a fraction ending in 0 would print shorter, so
  //    the grammar admits only "0" or a fraction ending in 1-9.
  //  - Positive values below 0.0001 print in exponent form (0.00001 -> 1e-05,
  //    0.000099 -> 9.9e-05, 0.000001 -> 1e-06), so "0.0000x" forms are excluded.
  //    0.0001 itself is >= 1e-4 and prints 0.0001.
  //  - ints print as written (no leading zeros by grammar; at most 60 characters
  //    per line, far below the 4300-digit int/str conversion limit); True/False
  //    print as written; str arguments print without quotes. print joins its
  //    arguments with one space and ends with one LF, which the canonical
  //    representation drops. Output lines with leading, trailing or doubled
  //    spaces are rejected separately by the canonical-answer constraints.
  const cases: [string, boolean, string?][] = [
    ['0.0', true, '0.0'],
    ['0.5', true, '0.5'],
    ['0.001', true, '0.001'],
    ['0.0001', true, '0.0001'],
    ['0.000123', true, '0.000123'],
    ['100000.5', true, '100000.5'],
    ['999999.999999', true, '999999.999999'],
    ['100000.0', true, '100000.0'],
    ['0.00009', false],
    ['0.000099', false],
    ['0.00001', false],
    ['0.000001', false],
    ['0.0000', false],
    ['0.00', false],
    ['2.50', false],
    ['1.10', false],
    ['1000000.5', false],
    ['0.1234567', false],
  ];
  for (const [literal, accepted, output] of cases) {
    it(`print(${literal}) is ${accepted ? 'accepted' : 'rejected'}`, () => {
      expect(rejected(`print(${literal})`)).toBe(!accepted);
      expect(deriveLiteralPrintOutput(`print(${literal})`)).toBe(output);
    });
  }
});

describe('literal extraction and derived output', () => {
  it('extracts every string literal of an accepted listing, and only strings', () => {
    expect(listingStringLiterals('print("shown", 7, \'two\', True)\nprint("c)")')).toEqual([
      'shown',
      'two',
      'c)',
    ]);
  });

  it('derives the printed output without executing anything', () => {
    expect(deriveLiteralPrintOutput('print("Hi")\nprint(3)')).toBe('Hi\n3');
    expect(deriveLiteralPrintOutput('print("Score", 7, 2.5, True, False, 2.0)')).toBe(
      'Score 7 2.5 True False 2.0',
    );
    expect(deriveLiteralPrintOutput('print("a, b", \'c\')')).toBe('a, b c');
    expect(deriveLiteralPrintOutput('x = 1')).toBeUndefined();
  });

  it('reports the offending lines of a rejected listing', () => {
    const parsed = parseLiteralPrintListing('print("a")\nx = 1\nprint(f"{1}")');
    expect(parsed).toEqual({
      ok: false,
      problems: [
        'line 2 is outside the approved literal-print form',
        'line 3 is outside the approved literal-print form',
      ],
    });
  });
});
