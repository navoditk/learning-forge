# Python Grammar Extension Scope

## Status and boundary

- [OBS] The Python intro currently asks learners to read short listings and predict output; D-321 records the owner decision "read and predict, no code execution" (`docs/course-progression-decisions.md:3420-3440`).
- [OBS] D-322 approves the single entry skill `py6-print-output-reading`, CPython 3.14, and a scoped authoring exception for that skill and record (`docs/course-progression-decisions.md:3442-3463`). D-330 later permits three additional records for that same skill within the existing `python-scan` grammar and explicitly says no new grammar or validator forms (`docs/course-progression-decisions.md:3713-3732`).
- [OBS] The dossier treats later topics and their prerequisite edges as context, not approval. It lists variables/state, expressions, and comparisons/conditionals as separate topic areas; each later skill edge needs a conceptual-necessity justification and independent audit (`docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md:156-180, 505-530, 573`).
- [REC] Treat this document as engineering scope preparation only. A future implementation needs a separately approved, issue-sized skill and grammar contract; this document does not authorize curriculum drafting, content registration, code changes, tutor enablement, availability, or release.
- [MISS] No owner-approved sequence, learning outcomes, prerequisite edges, or exact grammar for variables, arithmetic, string concatenation, or conditionals was verified. The examples below are proposals, not approved skill names or order.

## Current allowlist

- [OBS] `src/contracts/python-scan.ts:2-29` documents the current grammar: one nonblank, unindented statement per line; each statement is `print(` followed by one or more literal arguments separated by exactly comma-space, then `)`. Arguments are a nonempty quoted string, integer, float, or `True`/`False`.
- [OBS] `src/contracts/python-scan.ts:13-24, 40-70` limits strings to printable ASCII characters excluding both quote marks and backslash; integers have no leading zero except `0`; floats have at most six integer digits and six fractional digits, with either exactly `.0` or a fractional part not ending in zero. Positive floats below `0.0001`, negative numbers, exponents, lowercase booleans, empty strings, and other values are rejected.
- [OBS] `src/contracts/python-scan.ts:72-100` parses a complete line and rejects blank lines, indentation, extra tokens, missing punctuation, or any nonmatching syntax. `src/contracts/python.ts:19-28, 50-79, 81-87` pins the language to 3.14 and statically limits listings to 20 lines and 60 characters per line, in addition to the source schema's 1500-character cap.
- [OBS] `src/contracts/python-scan.ts:103-127` reports lines outside the grammar and derives output from parsed literal values: arguments are joined with one space and lines with LF, without running the listing. `src/content/python-rules.ts:23-68` validates that derived text against the authored canonical answer.
- [OBS] `tests/contracts/python-listing-scan.test.ts:45-125, 127-193` covers accepted literals, rejected unsupported forms, float boundaries, extraction, and output derivation. Examples explicitly rejected today include variables, operators, calls, loops, indentation, comments, semicolons, `sep=`, and `end=`.
- [OBS] The current scoring path normalizes learner response text and compares it to the authored answer with exact, case-sensitive equality; it does not execute the displayed listing (`src/content/python-output.ts:4-61`).

## Extension contracts to decide

- [REC] Keep the current grammar as a closed, skill-scoped allowlist. Add a separately named grammar capability or version for each approved skill rather than widening the existing skill's parser implicitly. Catalog validation should select the grammar from trusted skill metadata, not learner input.
- [REC] For every extension, specify the complete accepted syntax, lexical rules, value types, precedence, static-evaluation/derivation semantics, maximum work and output, and a paired list of rejected near-misses before implementation. Continue failing closed on unknown tokens and trailing input.
- [REC] Preserve the current CPython 3.14 pin unless the owner approves a version change. Hand-trace each supported construct against the pinned language documentation and have an independent reviewer re-derive every authored expected output.
- [MISS] It is not verified whether future skill contracts should preserve the current `python_output` answer type or introduce a distinct answer/evaluator contract. Decide this before authoring content or changing scoring.

### Candidate: variables and state

- [REC] Define a tiny assignment-and-read grammar before supporting names: decide identifier syntax, allowed initial values, assignment count, whether reassignment is taught, and whether a variable may be read only after assignment. Derive values with a bounded, explicit environment map.
- [REC] Reject undefined or forward-referenced names, duplicate assignments if reassignment is not approved, reserved words, built-in names, underscore/double-underscore names, chained or tuple assignment, attribute access, indexing, function calls, imports, and any statement not explicitly allowed.
- [REC] Test valid initialization and read-after-write cases plus undefined names, read-before-write, misspelled names, shadowing/reserved identifiers, unsupported assignment forms, and extra statements. Preserve the existing skill's rejection of all assignments.

### Candidate: arithmetic expressions

- [REC] Approve the operator set and semantics individually. A narrow first grammar could use numeric literals, approved variables, parentheses, and a small set of binary operators; do not infer support for division, floor division, modulo, exponentiation, unary operators, comparisons, or Boolean coercion from the word "arithmetic."
- [REC] Define precedence, associativity, integer and float bounds, division-by-zero handling, float formatting, and intermediate/output limits. Parse to a small expression tree and statically evaluate only those typed nodes; never pass source text to a host-language evaluator.
- [REC] Reject unapproved operators, calls, attributes, comprehensions, collections, exponentiation unless explicitly selected, malformed or excessive nesting, oversized literals, divide-by-zero cases, and expressions whose result cannot be represented consistently by the approved output contract.
- [REC] Add precedence and parenthesis examples with independent hand-derived outputs, plus negative cases for each excluded operator, malformed token sequence, numeric boundary, zero divisor, and resource limit.

### Candidate: string concatenation

- [REC] Specify whether concatenation accepts only `str + str`, whether operands may be variables, and whether any existing literal restrictions change. Keep quote escaping, Unicode, implicit adjacent-literal concatenation, interpolation, formatting, and string methods out unless separately approved.
- [REC] Reject mixed-type addition, unsupported operators, unsupported escapes, malformed quotes, implicit concatenation, f-strings, `.format`, method/attribute calls, and concatenation exceeding a fixed source or result bound.
- [REC] Test simple literal concatenation, concatenation through approved variables if included, exact whitespace and output, type mismatch, quote/backslash edge cases, and limit boundaries. Ensure string contents are data in the parser, never interpreted as source.

### Candidate: simple conditionals

- [REC] Decide the allowed block form, whether `else` is supported, nesting depth, indentation, condition grammar, comparisons, and which prior statements may appear in each branch. Start with a single bounded conditional only if the learning sequence approves it.
- [REC] Parse blocks structurally with exact indentation and evaluate only the approved condition nodes. Do not execute arbitrary Python or translate source into JavaScript.
- [REC] Reject `elif`, nested blocks unless approved, loops, malformed/mixed indentation, unsupported comparisons or Boolean operators, statements outside the permitted branches, and conditions using undefined names.
- [REC] Cover true and false branches, branch output order, missing/duplicate `else`, malformed indentation, nested/control-flow constructs outside scope, and boundary limits. Check that the unselected branch cannot affect derived output or bypass validation.

## Safety and execution boundary

- [OBS] The current implementation path does not run learner or authored Python. The scanner recognizes text and derives literal-print output (`src/contracts/python-scan.ts:45-127`); the evaluator compares response strings (`src/content/python-output.ts:26-61`). D-321 and the dossier also state that there is no server, browser, CI, or sandbox execution (`docs/course-progression-decisions.md:3420-3440`; `docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md:202-205, 596-607`).
- [OBS] `src/contracts/python.ts:37-79` has static source checks, including a denylist for tokens such as `import`, `eval`, `exec`, `open`, `os.`, and `subprocess`; the dossier explicitly says these are curriculum-scope lints, not a security boundary when nothing executes (`docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md:208-230`).
- [OBS] A source search for Python interpreter launches, child-process calls, VM use, dynamic `Function`, and `eval` in `src/` returned no matches. The scanner's `RegExp.exec` calls are regular-expression matching, not Python execution.
- [REC] Keep the no-execution boundary for these extensions. Do not add a Python interpreter, subprocess, browser runner, `eval`, `Function`, or sandbox as an implementation shortcut; a future execution feature requires its own separate design and owner approval.
- [REC] A hand-written parser and static evaluator still have security and correctness risks even without Python execution: grammar gaps, host-language coercion, resource exhaustion, parser/CPython semantic drift, float/output mismatches, and condition-flow mistakes. Use a typed AST or equivalent explicit representation, strict allowlists, bounded token/depth/step/output limits, and fail-closed errors.
- [REC] Do not treat the current denylist as protection for an execution feature. If execution is ever proposed, stop this grammar work and obtain a dedicated sandbox, resource-isolation, threat-model, privacy, and owner-approval review first.

## Test and review plan

- [REC] Extend `tests/contracts/python-listing-scan.test.ts` with positive grammar examples and adversarial rejected-input cases for every token, type, boundary, and block form. Include trailing garbage, ambiguous prefixes, mixed quote forms, excessive nesting, line/character caps, and neighboring syntax that must remain rejected.
- [REC] Add derivation tests proving each accepted example yields the independently calculated CPython 3.14 output without evaluating source; add negative tests proving invalid or unsupported source has no derived output.
- [REC] Add contract and catalog tests that bind each grammar to the correct skill/version, reject the new syntax for `py6-print-output-reading`, and reject records that use an unapproved validator or mismatched canonical answer (`tests/contracts/python-contract.test.ts`; `tests/content/python-catalog.test.ts`).
- [REC] Extend evaluator and route regression tests only if the owner-approved answer/evidence contract changes. Existing coverage includes deterministic output scoring and request validation (`tests/content/python-output.test.ts:28-196`; `tests/progression-integration/python-output-routes.test.ts:68-173`).
- [REC] Use synthetic fixtures only. Do not execute sample snippets in tests; hand-trace against the pinned docs and obtain independent re-derivation. Keep tutor gating, pending-review state, unavailable-program behavior, and existing learner-data boundaries unchanged unless separately approved.
- [OBS] This packet authorizes a document only; it includes no implementation, content-authorship, accessibility, availability, or release work.

## Owner decisions required before implementation

- [MISS] Select the next skill(s), learning outcomes, sequence, prerequisite edges, and evidence role; the candidate list in this document is not an approved sequence.
- [MISS] For each selected skill, approve exact grammar productions, identifier/value rules, operator and precedence semantics, string escape policy, conditional forms, numeric limits, output semantics, and explicit rejected constructs.
- [MISS] Decide whether extensions retain `python_output` or require a new versioned validator/evidence contract, and how old skill versions and attempts remain interpreted.
- [MISS] Confirm the Python 3.14 pin, version-specific behavior references, and the required hand-trace/independent-review evidence for future content.
- [MISS] Authorize any new content scope separately, including record counts/roles, review state, and the program's unavailable/availability boundary. D-330 does not authorize new grammar or validators.
- [REC] Keep execution, tutor enablement, program availability, accessibility sign-off, and release as separate decisions; none is granted by a grammar specification.
