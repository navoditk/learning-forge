# Introductory Python, Grade 6 — authoring prerequisites specification — 2026-10-10

**Status: proposal for independent review. Not approved.** This document
specifies what must exist before Python curriculum authoring can begin. It
does not author skills, lessons or exercises. It does not change runtime
code, schemas, content, policy or the program registry. It does not lift
or except the `D-61` authoring pause. Every recommendation here is a
recommendation, not a decision.

**Revision 2 (2026-10-10).** This revision corrects findings F1–F6 in
`python-intro-grade-6-authoring-prerequisites-20261010-review.md`. That
review pinned revision 1 at SHA-256 `ace5065b…e9abfd`.

- **F1:** output comparison now preserves leading whitespace, trailing
  spaces and interior blank lines (§5.2).
- **F2:** the response pipeline is one ordered sequence, with type-aware
  request parsing (§5.2).
- **F3:** blank and empty output are excluded from the first packet (§5.2,
  §8).
- **F4:** error spotting and type questions are deferred and use exact
  tokens (§5.3).
- **F5:** prerequisites are split into authoring, serving, publication and
  later gates (§7, §12).
- **F6:** research graph edges are excluded from approval (§3, §9).

No owner decision or `D-61` lift is inferred.

## 1. Inputs and inherited approvals

- **Worktree base:** `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6` plus
  uncommitted coordinator integration of the dossiers and source register.
- **Approved research dossier:**
  `docs/curriculum-dossiers/python-intro-grade-6-20261010-research.md`,
  291 lines, SHA-256
  `87364b003ad248b12d01b588fe3ac4aa1c5dad5b7dd63dfc093668d1aaa5f56f`.
- **Independent review:**
  `docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`,
  SHA-256
  `c880c32d9db8931e700a17706366bb1f56ea3972a2d263cac766bdc3d49f4808`.
  The review pinned the corrected dossier at 289 lines with SHA-256
  `c0d2fe44…ac3cb`. The current dossier has 291 lines and a different hash.
  This is consistent with the coordinator adding the owner-approval status
  lines, but this author did not verify the diff. The prerequisites review
  confirmed the current hashes, but could not verify the diff either.
  **The coordinator should confirm that only status lines changed.**
- **Inherited (approved):** owner source approval on 2026-10-10 ("sources
  for python look good, approved"). The approval covers sources only.
- **Not approved and not inferred:** core scope, optional depth, the pinned
  Python version, alignment codes, licensing reuse, learner-facing links,
  execution or sandbox, validator or renderer contracts, `D-61` authoring
  authorization and learner availability.
- **Procedures read:** `AGENTS.md`, `README.md`, the latest
  `docs/PROGRESS.md` entries, the relevant parts of
  `docs/02-curriculum-and-pedagogy.md` and `docs/03-system-architecture.md`,
  the curriculum-authoring playbook, the content-authoring pipeline,
  `docs/content-review.md`, `docs/curriculum-agents.md`,
  `docs/agent-orchestration.md`, `D-61`, and the Python sections of
  `docs/development-expansion-plan.md`. The current code takes precedence
  over historical prose. For example, the playbooks still describe role
  schemas as "pending", but they exist in `src/contracts/progression.ts`.
- **No new web research was performed.** No provider, database, account or
  agent calls were made. No code was executed.

## 2. Current-code inventory: reusable mechanisms and gaps

Inspected: `src/contracts/{content,curriculum,progression,program-codes,attempt,answer-leakage}.ts`,
`src/curriculum/{catalog,program-registry,program-roster,progression-catalog}.ts`,
`src/content/{catalog,answer-matching,publication,resolvers}.ts`,
`src/assessment/private-package-store.ts`, `src/tutor/provider-input.ts`,
`src/app/components/activity-panel.tsx`, `src/phase1/service.ts`,
`src/app/api/**/route.ts` response parsers, `scripts/generate-curriculum-site.ts`,
and tests under `tests/content`, `tests/contracts` and `tests/curriculum`.

### 2.1 Reusable mechanisms that already exist

- **Role-discriminated content:** `VersionedContentItemSchema` includes
  `teaching`, `practice`, `assessment` and `review`. Teaching records have
  `explanation` and an optional `workedExample`, with no validator or hint
  ladder. Assessment and review records have a validator, an
  `assessmentBankRef` and no hint ladder.
- **Versioned references:** `skillRef: {code, version}` and
  `itemReadinessRefs` (validated by `validateItemReadinessRefs`).
  `VersionedSkillSchema` and `validateVersionedSkillCatalog` also exist.
- **Program registry (`D-40`):** `PROGRAM_REGISTRY` provides the roster,
  `skillCodePrefix` enforcement and same-program prerequisites
  (`validateProgramSkillInvariants`). A registry test asserts that registry
  codes equal `PROGRAM_CODES`.
- **Provenance and review gates:** the `llm_drafted` and `pending_review`
  values. `servableContentCatalog` filters on `reviewed`.
  `publishableContentProjection` excludes pending records and
  assessment/review records.
- **Held-out assessments (`D-01` B, `D-02` A):** the private package store
  parses `AssessmentContentItemSchema` and `ReviewContentItemSchema` with
  hashes.
- **Deterministic matching:** `matchesAcceptedAnswer` uses whole-string
  matching after `normalizeAnswer`, with optional per-part substring
  matching. `AttemptEvidenceSchema` has `evaluatorVersion`,
  `normalizedResponse`, `scoringMethod: "deterministic"` and
  `misconceptionTags`.
- **Leakage checks:** the catalog rejects hint text that contains a
  `forbiddenLeakagePatterns` entry. `containsProtectedAnswer` guards tutor
  text.
- **Safety and accessibility fields:** `accessibilityNotes`,
  `accessibleAlternative` and the static-SVG figure allowlist.
  `assertNoSensitiveData` guards provider input.
- **Precedent for program-internal objective codes:** Spelling Bee records
  use `standards: ["SNSB6-ETYM-01"]` where no external code applies.

### 2.2 Verified gaps

- **G1. Program identity is missing.** `python-intro-grade-6` is not in
  `PROGRAM_CODES`, `CurriculumProgramSchema` or `PROGRAM_REGISTRY`. No
  `.ts`, `.tsx` or `.json` file outside the dossiers mentions it.
- **G2. There is no Python domain.** `SkillSchema.domain` is a closed
  `CurriculumDomainSchema` enum with no Python entry. `skillCatalog` still
  validates with `SkillSchema`, where `version` is optional, rather than
  `VersionedSkillSchema`.
- **G3. Code is not represented.** Code could only appear inside the plain
  `prompt` string (2000 characters maximum). Nothing records the language
  or version, prevents tabs, or preserves line structure.
- **G4. Renderers collapse whitespace.** The learner panel renders `<p>{prompt}</p>`
  and the public site renders `<p class="content-item-prompt">`. Both
  collapse indentation and newlines, which changes the meaning of Python.
- **G5. Matching is unsafe for program output.** `normalizeAnswer`
  lowercases, which conflates `True` and `true`. It collapses internal
  whitespace and newlines and strips trailing `.,;!?`, which conflates
  `Done!` with `Done`. It also normalizes comma spacing, which conflates
  `[1,2]` with `[1, 2]`. Grading ignores `deterministicValidator.type`, so
  there is no per-type evaluator dispatch.
- **G6. Multi-line answers cannot be entered.** The learner answer control
  is a single-line `<input>`. It does not disable autocapitalization or
  autocorrect, so a tablet may turn `true` into `True` or insert curly
  quotes. The API routes apply `z.string().trim().min(1).max(1000)`. That
  trim removes meaningful leading whitespace and the final newline before
  scoring.
- **G7. Non-contest choices have no field.** Choice text exists only in
  `ContestFormatSchema.answerChoices`, which requires exactly five A–E
  choices and a contest format enum. Error-category and type choices would
  need a new field. The existing `text` and `composite` matching lowercases
  and allows substrings, so it is not a safe stop-gap (§5.3).
- **G8. Teaching records cannot be served yet.** `validateContentCatalog`
  throws unless every live record is `practice`. Pilot lessons have
  `teachingContentRefs: []`. The public site renders teaching
  `explanation` as a plain `<p>`.
- **G9. Skill metadata can be published early.** `generate-curriculum-site.ts`
  shows a program section when `!available && skills.length === 0` is
  false. Adding Python skills to `rawSkills` would publish skill metadata,
  which has no review status, even when `available: false`.
- **G10. Tutor and leakage behavior do not fit short outputs.** Python
  prompts would reach the tutor provider. `containsProtectedAnswer` does
  case-insensitive substring and numeric-equivalence checks, so a short
  output such as `5` or `Hi` either over-blocks or misses repr variants.
  Authored hints that quote string literals from code would trip the
  catalog leakage check.

## 3. Scope context (proposal only; H1 approves only the entry competency)

- **Core competency areas:** the dossier's `P0`–`P10` topics provide
  context only. They are not proposed for approval here, and neither are
  their candidate edges (§9 H1). The topics are:
  - orientation and reading code;
  - values, types and `print`;
  - variables and state;
  - expressions, including `/`, `//`, `%` and precedence;
  - simulated input and conversion;
  - comparisons and conditionals;
  - `for`/`range` and `while`;
  - functions;
  - lists and strings as sequences;
  - testing and debugging;
  - small original projects.
- **Execution-dependent work:** `P10` projects and practical coding
  evidence stay blocked until a separately approved execution and
  test-harness design exists.
- **Optional depth: undecided and excluded.** This covers dictionaries,
  nested loops, search and count algorithms, string methods, `random` and
  turtle-style drawing. No contest tier.
- **Always excluded from core:** `os`, `subprocess`, `eval` and `exec`,
  files, networking, package installation, OOP, recursion, real child
  data, Python 2 idioms, and AI-assisted coding.

## 4. Pinned Python version (recommendation; human decision H2)

**Recommend CPython 3.14** as the single pinned minor version for authoring
and validation. Record it as `languageVersion: "3.14"`.

- The approved dossier lists 3.15 and 3.14 as `bugfix`. 3.13, 3.12 and 3.11
  are `security` only. 3.10 is end-of-life.
- 3.15.0 first shipped on 2026-10-09, one day before retrieval. 3.14 has
  had a longer bugfix history. Equivalence across minor versions is not
  certified. Every behavior an authored item uses must be verified against
  the pinned version's documentation. Error message wording is known to
  change between versions, so message text is never scored (§5.3).
- **Alternative:** 3.15. It gives a longer remaining support window, and
  the dossier read the 3.15.0 `/3/` documentation directly. The dossier
  did not read the version-specific 3.14 documentation. If 3.14 is chosen,
  authors must verify behavior against the 3.14 documentation at authoring
  time.
- Review cadence: re-confirm when the pinned version leaves `bugfix`.
  Changing the version bumps every affected record's `version`.

## 5. Code presentation and deterministic answer contract (specification)

The contract does not execute code. No item runs Python on the application
server, in the browser, in CI or in a sandbox. Every item is scored by
deterministic comparison against authored, human-verified answers.

### 5.1 Code listing field (proposed, not implemented)

Add an optional `codeListing` field to the four role schemas:

```text
codeListing: {
  language: "python",                 // literal
  languageVersion: "3.14",            // must equal the program pin
  source: string,                     // LF only; 1–20 lines; ≤ 60 chars/line
  showLineNumbers: boolean,
  structureDescription: string        // plain-language indentation/blocks
}
```

Static authoring checks run at catalog load. They are curriculum-scope
lints, not a safety boundary, because nothing executes:

- Reject CR, tab, trailing whitespace, non-ASCII, control characters, and
  indentation that is not a multiple of four spaces.
- Reject the tokens `import`, `eval`, `exec`, `open`, `__`, `os.`,
  `subprocess`, `input(` and `while True` unless a later approved skill
  allowlist permits one.
- Reject listings longer than the limits above. These limits are proposed
  values for review.

Rendering:

- Render as `<pre><code>`, with whitespace preserved, a monospace font and
  no syntax colouring in v1. Never use colour alone.
- Present line numbers as visible gutter text that is not part of copied
  content.
- Wrap the listing in a keyboard-focusable, labelled scroll region
  (`tabindex="0"`, `role="region"`, `aria-label`). It must stay usable at
  320 CSS px and 200% zoom.
- Do not show Run, Copy-to-run or external-runner links.
- Expose `structureDescription` to assistive technology so that
  indentation meaning is not visual-only. `accessibleAlternative` remains
  required.

### 5.2 `python_output` validator (predict-output only)

Add a new `DeterministicValidatorSchema.type`, `python_output`, and
dispatch scoring by validator type in both real grading paths:
`src/phase1/service.ts` and `src/progression/assessment-submission.ts`.
Existing types keep their current request parsing, `normalizeAnswer` and
`matchesAcceptedAnswer` behavior, byte for byte.

**What the canonical answer represents.** `canonicalAnswer` is the
listing's exact standard output under the pinned version, with its single
final line terminator removed. `print` always ends its output with one LF,
so `a\nb` represents the printed output `a\nb\n`. The existing schema
already trims canonical strings, which is consistent with this
representation.

**Authoring constraints for the first packet** (checked by C5 catalog
checks). These keep the first packet free of whitespace-sensitive and
blank output:

- Output is 1–8 lines, and every line is nonempty.
- Characters are printable ASCII only (U+0020–U+007E), with LF as the
  line separator.
- No line has leading spaces or trailing spaces, and no line contains two
  or more consecutive spaces.
- Excluded from the listing: argument-free `print()`, empty strings,
  `sep`, `end`, escape sequences, and anything else that prints a blank
  line, an empty output or whitespace-significant text. Including these
  later needs a separately reviewed empty-output and blank-line contract
  with matching schemas and tests.
- No float representation artefacts, such as `0.1 + 0.2`.
- `acceptedAnswers` must equal `[canonicalAnswer]` exactly. Output has one
  correct form.

**One ordered response pipeline for `python_output` items.**

1. **Type-aware request parsing.** Look up the item's validator type
   before parsing the response. For `python_output`, parse
   `z.string().max(1000)` with **no `.trim()`**, so that leading whitespace
   and blank lines reach the evaluator. Legacy items keep today's
   `z.string().trim().min(1).max(1000)`.
2. **Raw length.** A response over 1000 UTF-16 code units is invalid. The
   route schema already enforces this.
3. **Line endings.** Replace every CRLF with LF, then every remaining CR
   with LF. This is the only character conversion.
4. **Character validation.** After step 3, any character outside U+0020–
   U+007E other than LF makes the response invalid. This rejects tabs,
   other control characters, curly quotes and all non-ASCII characters.
5. **Final terminator.** If the response ends with LF, remove exactly one
   LF. This is the only boundary tolerance. Nothing else is removed:
   - leading spaces;
   - trailing spaces on any line;
   - interior blank lines;
   - additional trailing blank lines;
   - leading blank lines.
6. **Normalized limits.** An empty result is invalid. A result with more
   than 20 lines (split on LF) is invalid.
7. **Comparison.** Compare with the canonical answer using exact,
   case-sensitive, code-point equality.

**Invalid responses** (steps 2, 4 and 6) return a typed
`invalid_response` result with a reason code. They are handled before
either grading path:

- creates an attempt or assistance event;
- changes evidence or mastery; or
- invokes any tutor move.

The learner sees a neutral, accessible message that says nothing about
correctness, such as "Use plain keyboard characters and straight quotes"
or "Type at least one line."

**Normative consequences**, each requiring a test. Canonical answers here
are written with `\n` for LF.

- **Accepted:**
  - `True` matches canonical `True`.
  - `a\nb\n`, which has one final terminator, matches `a\nb`.
  - `a\r\nb\r\n` matches `a\nb` after the line-ending conversion.
  - `a\rb` matches `a\nb`.
- **Incorrect, because of case, punctuation or number form:**
  - `true` and `TRUE` against `True`;
  - `7.0` against `7`;
  - `Done` against `Done!`;
  - `[1,2]` against `[1, 2]`.
- **Incorrect, because of whitespace:**
  - `Hi  there` against `Hi there`;
  - `Hi ` (trailing space) against `Hi`;
  - `  a\nb` (indented) against `a\nb`;
  - `a\n\nb` (inserted blank line) against `a\nb`;
  - `\na\nb` (leading blank line) against `a\nb`;
  - `a\nb\n\n` (extra trailing blank line) against `a\nb`.
- **Incorrect, because of line structure:** `a b` against `a\nb`, and
  `b\na` against `a\nb`.
- **Invalid, with no attempt created:**
  - an empty response;
  - `\n` alone;
  - a tab;
  - NUL or another control character;
  - curly quotes;
  - more than 1000 characters;
  - more than 20 lines.
- **Legacy items:** every existing `answer-matching` test passes unchanged.

**Learner entry guidance.** The answer control states that each printed
line goes on its own line, with no extra spaces. Trailing spaces are
invisible, so they are scored rather than silently forgiven.
Whitespace-sensitive outputs are excluded from the first packet, so this
guidance is enough there. If learner pilots show trailing-space errors are
common, the remedy is a reviewed, visible-whitespace answer control, not a
tolerance that accepts wrong output.

**Evidence persistence.** `normalizedResponse` stores the step 5 result,
not `normalizeAnswer` output. `evaluatorVersion: "python-output-1"` must
be written through the real evidence path. Today `AttemptEvidenceSchema`
allows `evaluatorVersion`, but neither grading path writes it.

### 5.3 Error spotting and type questions (deferred from the first packet)

The first packet has no error-spotting or type questions. The existing
`composite.parts` path is **prohibited** for them, because unrestricted
substring matching accepts `not NameError` or `NameError or TypeError`
for a part of `NameError`. Lowercased `multiple_choice` matching is also
not used for them. A later, separately reviewed packet would specify:

- **Exact category tokens.** The learner selects a token from a fixed,
  versioned enum, and it is compared with case-sensitive equality. The
  enum separates `no exception` from `logic mistake`. Every candidate
  enum value must be verified against the pinned documentation.
- **Logic-mistake items.** These state the intended behavior in the
  prompt. Without it, a logic mistake cannot be graded.
- **Line numbers.** A separate integer from 1 to N is validated and
  compared independently.
- **Combined scoring.** When both line and category are asked, both must
  be correct.
- **Message text.** Traceback or message wording is never scored.
- **Type questions.** These use exact `int`, `float`, `str` and `bool`
  tokens, compared with case-sensitive equality. They never rely on
  printed-value equivalence, because printing `'7'` and `7` both show `7`.
- **Choices.** These need a non-contest choice field (C6) and a reviewed
  choice control.

### 5.4 Hints, tutor and leakage

- Hints refer to line numbers and concepts. They never quote string
  literals that appear in the expected output.
- `forbiddenLeakagePatterns` must include the full canonical output and
  every distinct output line of three or more characters.
- **Model-generated tutoring for Python items stays behind a feature flag
  that is off by default**, until leakage detection is evaluated for short
  and case-sensitive outputs. Authored hint ladders only. Model text never
  scores an attempt or contributes to mastery.

### 5.5 Evidence that an authored answer is correct

Nothing executes, so correctness evidence for each scored item is:

- an author hand trace;
- an independent reviewer re-derivation, as the `llm_drafted` checks
  require; and
- a citation to the relevant section of the pinned Python documentation
  for each language behavior used.

All three are recorded in `solutionRepresentation` and the review
record. Executing authored snippets offline, even on a reviewer machine, is
part of the separate execution decision and is **not** proposed here.

## 6. Teaching claims versus scored evidence

- **Teaching claims** come from `teaching` records and worked examples.
  Examples include "`print` shows text without its quotes" and "Python runs
  lines top to bottom". These claims are reviewed for accuracy and
  originality, cite the pinned documentation, and produce **no** attempt,
  score or mastery evidence. Parent surfaces may say that material was
  viewed, but never that it was learned.
- **Scored evidence** comes only from deterministically scored `practice`
  attempts and held-out `assessment` or `review` attempts, stored as
  `AttemptEvidence` with `scoringMethod: "deterministic"` and
  `evaluatorVersion`. Mastery and parent claims follow existing policy and
  must trace to those attempts.
- Tutor conversation, self-reports, viewing time and any model judgment are
  never evidence.

## 7. Prerequisite code changes (listed; not performed)

The changes below are grouped by the gate they serve. Labels are
references, not mandatory separate issues. The authoring group is one
issue-sized, non-executing slice. Implement it and test it against
**synthetic test fixtures**, which are not curriculum content, before
requesting the `D-61` exception.

### 7.1 Authoring-contract slice (required before any Python record is drafted)

1. **C1 Program identity (G1):**
   - Add `python-intro-grade-6` to `PROGRAM_CODES`.
   - Add a registry entry with:
     - `available: false`;
     - `subjectKind: "enrichment-non-graded"` (proposed);
     - `skillCodePrefix: "py6-"`;
     - `progressionMode: "skill-graph-only"`;
     - policy refs `python-intro-grade-6-access` and
       `python-intro-grade-6-default` at `1.0.0`.
   - Confirm whether anything resolves those policy refs.
   - The existing registry/`PROGRAM_CODES` equality test covers this
     entry.
2. **C2 Domain (G2):** add `py6-programming-fundamentals` to
   `CurriculumDomainSchema`. Require new Python skills to carry `version`.
3. **C3 Draft and publication protection (G9):** this must be in place and
   tested before any Python skill enters `rawSkills`. The existing
   `publishableContentProjection` already excludes pending, assessment and
   review records; reuse it. For a program with `available: false`, the
   public site must expose:
   - no navigation entry beyond the existing "not authored yet"
     placeholder;
   - no skill metadata or standards;
   - no counts.
4. **C4 `codeListing` (G3):** add the schema, the static lints and a
   check that the listing version matches the program pin (§5.1).
5. **C5 `python_output` scoring and catalog checks (G5, G6):**
   - type-aware request parsing in both grading routes;
   - the ordered pipeline (§5.2);
   - typed invalid-response handling before attempt creation;
   - `normalizedResponse` and `evaluatorVersion` written through the real
     evidence path;
   - catalog checks:
     - the canonical constraints;
     - `acceptedAnswers === [canonicalAnswer]`;
     - leakage patterns covering every output line;
     - no quoting of code literals in hints (§5.4).

The catalog does not require two records per new-role skill. The two-record
check in `src/content/catalog.ts` applies only to legacy role-less records.
One `practice` record is therefore a valid authored unit.

### 7.2 Serving gates (required before a learner can reach any Python item)

- **C7 Learner renderer (G4, G6):**
  - the code block (§5.1);
  - a `<textarea>` for `python_output`, with `autocapitalize="off"`,
    `autocorrect="off"`, `spellcheck={false}`, a monospace font, entry
    guidance through `aria-describedby`, and button submission;
  - accessible invalid-response messages.
- **C9 Tutor gating (G10):** model hints are disabled for `py6-` items,
  with tests, before any Python item can reach tutoring.
- **Owner decisions:** an availability and release decision, plus
  accessibility review.

### 7.3 Conditional or later gates (not required for the first authored packet)

- **C8 Public code rendering:** only if Python becomes available on the
  public site.
- **C10 Teaching serving path:** only if a teaching record is promised to
  learners. Offline authoring and review of a teaching record do not need
  it.
- **C6 Choices:** a non-contest `choices` field with exact-token scoring
  (§5.3). Needed only for later error-spotting or type packets.
- **Execution and practical coding:** a separate execution and harness
  design and approval.

## 8. First-lesson authoring packet (proposal; no content)

- **Program and skill:** `python-intro-grade-6`. Proposed skill code
  `py6-print-output-reading`, version `1.0.0`, domain
  `py6-programming-fundamentals`.
- **Prerequisites:** none. It is the entry node. Research assumptions about
  arithmetic and keyboard use are not placement evidence. They must not
  become cross-program or hidden gates.
- **Skill boundary:**
  - **In scope:** reading a short listing top to bottom and predicting the
    output of `print` with one or more comma-separated literal arguments.
    Arguments are nonempty `str` values, `int`, `bool`, or simple `float`
    values such as `2.5`. Multiple arguments produce single-space
    separation.
  - **Out of scope for this packet:**
    - argument-free `print()`, empty strings and any blank or
      whitespace-significant output (§5.2);
    - error spotting and type questions (§5.3);
    - variables (`P2`) and operators (`P3`);
    - `sep`, `end`, f-strings and input;
    - escape sequences and quotes inside strings.
- **Proposed misconception codes:**
  - `py6-prints-quotes` (writes the quotes from a string literal);
  - `py6-bool-case` (writes `true`);
  - `py6-int-float-same` (treats `2.0` as `2`);
  - `py6-comma-joins-without-space`;
  - `py6-runs-out-of-order`.
- **Coverage:** `standards` requires at least one code. Recommend one
  program-internal objective code, such as `PY6-P1-01`, following the
  Spelling Bee precedent and labelled as internal (H3). No CSTA or
  California codes are assigned until that text is verified.
- **Roles, all `mode: "core"`:**
  - **Required:** 1 `practice` record, `python_output`, `foundational`,
    with nonempty output and a 2–3 step hint ladder.
  - **Optional, only if H4 includes it:** 1 offline `teaching` record. It
    is authored and reviewed, but not served without C10.
  - **None:** held-out `assessment` records.
- **Versions:**
  - Skill: `1.0.0`.
  - Record: `content-1`.
  - Pinned language: `codeListing.languageVersion` equals H2.
  - Scoring: `evaluatorVersion: "python-output-1"`.
- **Provenance:** model-assisted drafts use `llm_drafted`, `owned` and
  `pending_review`. Never relabel them `original`. Wording and code are
  original, with no source text, code or exercises copied or closely
  paraphrased. Synthetic, non-personal strings only.
- **Required before drafting** (§7.2 and §7.3 are not drafting
  prerequisites):
  - H1–H4;
  - the §7.1 slice merged and reviewed, with its §11 tests passing;
  - the existing `D-61` gate evidence.
- **Exit evidence for the drafted packet** (accessibility review of the
  rendered listing and answer control belongs to §7.2):
  - `npm run content:validate` and the catalog tests pass;
  - the `docs/content-review.md` checklist is complete, plus the
    `llm_drafted` re-derivation and documentation citations (§5.5);
  - independent cross-family review.

## 9. Minimal human choices

- **H1. Entry scope:** approve only the §8 entry competency and its
  role/count scope. Leave optional depth undecided.
  - **Graph edges are not part of H1.** The dossier's `P0`–`P10` edges are
    non-normative and are not approved here. Examples of edges that lack
    conceptual necessity include `P6 → P7`, since functions do not require
    iteration, and `P7 → P8`, since indexing does not require user-defined
    functions.
  - **Later skills.** Each later authored edge needs an observable
    conceptual-necessity justification and an independent edge audit.
    Teaching order stays separate from unlock rules.
- **H2. Python version:** pin a version. The recommendation is 3.14; the
  alternative is 3.15.
- **H3. Coverage and source posture:** use clearly labelled
  program-internal objective codes, and keep link-only, original-content
  sourcing.
- **H4. Authoring authorization (`D-61`):** product/content owner and
  engineering owner record a dated, scoped Python authoring exception or
  lift. Its stated scope is `py6-print-output-reading`, one practice
  record, whether an offline teaching record is included, and held-out
  assessments no.
  - Source approval does not satisfy this, and neither does this
    specification or any review.
  - The `D-61` prerequisite decisions read as approved, and the handoff
    reports A0 and A1 implemented. The pause itself has no recorded lift.

Engineering proposals for review, not owner choices:

- the §5.2 pipeline;
- the C1 field values;
- the listing limits.

## 10. Engineering invariants (must hold through implementation)

- No arbitrary or learner code execution anywhere. No sandbox, runner or
  Run affordance.
- Scoring is deterministic, versioned and type-dispatched. Existing
  validator types keep byte-for-byte request parsing and matching, and
  existing answer-matching tests still pass.
- Python scoring never uses lowercasing, substring or `parts` matching.
- No LLM output is ever mastery evidence. Model tutoring for Python is off
  until reviewed.
- No answers before policy permits them. Assessment and review records stay
  out of public projections. Pending records and unavailable programs are
  never served or published.
- No child data in items, prompts, traces or URLs. No external accounts,
  links to runners, or provider calls during authoring validation.
- Provenance honesty (`llm_drafted` is never relabelled `original`).
  Content remains original and not copied.
- The pinned version is recorded on every listing and checked against the
  program pin.
- Learner code views and answer controls meet WCAG 2.2 AA before serving.

## 11. Contract test plan (proposed; none implemented today)

None of the following tests exist.

**§7.1 slice tests**, using synthetic fixtures only:

- **Contracts:**
  - `codeListing` accepts a valid listing.
  - It rejects tabs, CR, trailing whitespace, non-ASCII, bad indentation,
    oversize listings, denylisted tokens and version mismatch.
  - The `python_output` canonical constraints are enforced, including
    rejection of blank lines, leading, trailing or double spaces, empty
    output and extra `acceptedAnswers`.
- **Evaluator:** every accepted, incorrect and invalid case in §5.2.
- **Request to persistence:**
  - Untrimmed raw input reaches the evaluator for `python_output` in both
    routes.
  - CRLF and lone-CR input is accepted, while tab, NUL and curly quotes
    are rejected.
  - An invalid response creates no attempt, assistance event or evidence
    change.
  - The persisted `normalizedResponse` is the step 5 result, and
    `evaluatorVersion` is `python-output-1`.
- **Regression:** legacy parsing, `normalizeAnswer` and
  `matchesAcceptedAnswer` behavior is unchanged.
- **Registry and catalog:**
  - `python-intro-grade-6` exists with prefix `py6-`.
  - Non-prefixed and cross-program prerequisites are rejected.
  - The roster and `PROGRAM_CODES` stay equal.
  - One role-specific practice record per skill is accepted.
- **Publication:** a synthetic unavailable-program skill and its pending
  record are absent from the generated site, including navigation,
  metadata, standards and counts.
- **Leakage:** the hint lint catches quoted output literals and output
  lines.

**§7.2 tests**, run before serving:

- **Tutor:** model hints are disabled for `py6-` items.
- **Browser (Playwright):**
  - The code listing keeps its indentation.
  - The listing region is keyboard-scrollable.
  - The textarea accepts multiple lines with no autocapitalization.
  - Invalid input is announced.
  - axe finds no violations.

## 12. Blockers

**Before authoring the first packet:**

- `D-61` has no Python exception or lift (H4), and H1–H3 are open.
- The §7.1 slice (C1–C5) is not implemented or tested.
- The research dossier hash delta (§1) needs coordinator confirmation.

**Before serving (not authoring blockers):**

- §7.2: C7, C9, the availability decision and accessibility review.

**Later and conditional:**

- §7.3: C6, C8, C10, execution and practical coding.
- `P10` projects stay blocked on the separate execution decision.
