# Structured response scoring contract (RAT-SCORE-DESIGN)

**Status: REVISION 5, FROZEN DRAFT for changed-scope Codex review. Not
approved.** Revision 2 made bounded corrections for review findings R-1 to
R-5 (`docs/rat-score-design-20261012-review.md`); revision 3 corrects
residual R-3 and R-4 (`docs/rat-score-design-20261012-rereview.md`);
revision 4 fixes residual R-4 fixture defects found by the author's
closure self-audit; revision 5 makes selector-variant fixtures load-valid
(`docs/rat-score-design-20261012-rev4-review.md`); see section 11. This is
the sole owned artifact of packet `docs/agent-handoffs/RAT-SCORE-DESIGN.md`,
authorized by the owner's IC-5 approval (D-154, 2026-10-12). It specifies an
opt-in structured multi-field response mode and the evidence needed to
implement it. It changes no code, schema, content, policy, decision or gate
record, and it authorizes nothing. Every value labeled **REC** is a
recommendation for the owner after independent review, not a default.
No implementation packet in section 8 may start because it is written here.

- **Author:** Claude Code `forge-expert`, actual model `claude-opus-5-5`
  (Opus 5.5), from client transcript metadata (first assistant record
  `a9890c74-21a6-4363-890b-9c696efed950`, 2026-10-13T00:38:45.924Z UTC).
  Revision 2 by the same resumed transcript, first revision-2 assistant
  record `ac7302b4-69ad-4713-b914-51e6b32132b2`, 2026-10-13T04:35:44.982Z
  UTC, model `claude-opus-5-5`.
- **Baseline:** main `3e7c33372599d20c285656c3610ca6e47743240f`. Committed
  code, tests and content were read from a detached worktree at that commit.
  The five pinned planning/decision documents were read from the integrator's
  verified baseline copies. Every consumed input and its SHA-256 is in the
  input manifest preserved with the frozen handoff evidence, not in this file.
- **Not accessed:** private assessment packages or drafts, candidate
  experiment records, learner data, databases, providers. No code was
  executed, no test or probe was run, no content was drafted and no new
  research was done. All behavior statements are from static reading.

## 0. Labels and authority

| Label     | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| **OBS**   | Observed in baseline bytes by static reading or hashing                                  |
| **APP**   | Approval in a cited decision or gate record, quoted within its recorded scope only       |
| **REC**   | This author's recommendation; not approved, not a default, not implementation permission |
| **MISS**  | Evidence or value needed for a claim or choice is absent                                 |
| **CONF**  | Two records, or a record and current bytes, disagree                                     |
| **OWNER** | A choice only the owner (or a named approver) can make                                   |

Authority: `docs/course-progression-decisions.md` for D-nn values; the
corrected Ratios plan (`docs/grade-6-math-ratios-plan.md`, §3.4, §4 C-8,
§5.1) and the accepted reconciliation (`docs/grade-6-math-reconciliation.md`,
§4.2, §7 V-7) for requirements and observed defects; the accepted subject
report (`docs/grade-6-math-ratios-subject-review.md`) for item-level
findings. `AGENTS.md` hard constraints and engineering conventions apply.

### 0.1 Approved values consumed (APP, scope as recorded)

| ID           | Approved value used here                                                                                                                                                                                                                                                              | Recorded boundary                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-154 / IC-5 | Opt-in structured multi-field responses, deterministic validation per labeled field and new item versions; RAT-SCORE-DESIGN covers response/validator contract, accessible learner input, practice and assessment grading, structured attempt storage and unknown-mode refusal design | No implementation, content changes, historical rescoring, legacy `parts` semantic changes or other-domain migration; V-7 acceptance separate from legacy characterization; schema changes need later migration/privacy approval |
| D-152 / IC-3 | Representation tasks for `double-number-lines@1.0.0` with reviewed static figures and complete text alternatives listing aligned pairs and blank positions; TR-6 awaits the separate scoring implementation                                                                           | No drafting, lesson/catalog change, activation                                                                                                                                                                                  |
| D-153 / IC-4 | New Ratios lesson versions; pilot lesson `1.0.0` bytes preserved                                                                                                                                                                                                                      | Labels are a later catalog-design choice                                                                                                                                                                                        |
| D-151 / IC-2 | Measurement conversions under `unit-rates@1.0.0`, with a stated conversion factor and explicit output unit                                                                                                                                                                            | Placement only; no scoring or authoring                                                                                                                                                                                         |
| D-08         | Context weights, including `practice 0.80`, `lesson_assessment 0.95`, `unit_assessment 1.00`, `delayed_check 1.00`                                                                                                                                                                    | Unchanged by this contract                                                                                                                                                                                                      |
| D-01 / D-02  | Held-out assessment in a private reviewed package                                                                                                                                                                                                                                     | Private items may use the mode; no private access here                                                                                                                                                                          |
| D-41         | One manual screen-reader pass over progression surfaces before serving a learner                                                                                                                                                                                                      | Applies to any new input type before serving                                                                                                                                                                                    |
| D-58         | Public site publishes the reviewed teaching-and-practice projection only                                                                                                                                                                                                              | Structured practice records follow the same projection                                                                                                                                                                          |
| D-61         | Authoring pause with narrow exceptions                                                                                                                                                                                                                                                | None needed for this document (packet)                                                                                                                                                                                          |
| `AGENTS.md`  | Deterministic structured validation; never treat an LLM judgment as authoritative mastery evidence; no unnecessary child data to a provider; WCAG 2.2 AA; reversible migrations with reviewed `down.sql`; synthetic fixtures only                                                     | Repository rulebook                                                                                                                                                                                                             |

The plan's C-8 ("matcher changes never alter the scoring of an existing
`id@version`; new semantics only through new item versions; historical
attempts are never rescored") is part of the accepted plan document (IC-1);
its "no historical rescoring" and "no legacy `parts` semantic change" parts
are also inside D-154's recorded boundary.

### 0.2 What D-154 does not decide (non-inferences)

D-154 selects the direction and authorizes this document only. It does not
approve: any implementation packet or packet split; a database schema change;
a partial-credit or per-field-feedback policy; a numeral grammar; which
representations any item accepts; unit-entry style; any item content or
version; IC-6–IC-9 (including the interim handling of live
`unit-rates-2@content-2` and `ratio-tables-2@content-2`); private-bank
access (O-10); or release. Section 9 lists these as open owner decisions.

## 1. Current behavior (OBS)

- **Matcher.** `src/content/answer-matching.ts` (`260ab821…f4c5`)
  normalizes (trim, lowercase, collapse whitespace, strip one trailing
  `[.,;!?]+` run, normalize spacing after `;`/`,`), accepts a whole-string
  match against `acceptedAnswers`, and otherwise, when `parts` exists,
  accepts if every part has any accepted phrase as a **substring anywhere**
  (line 56–58). No negation, order, token-boundary or extra-content check.
- **Call sites.** `scoreAnswer` in `src/phase1/service.ts` (line 104) for
  every Phase 1 path through `createAttempt` (practice, diagnostic,
  independent check, review), and `score` in
  `src/progression/assessment-submission.ts` (line 68) for held-out
  assessment. Both persist `scoringMethod: 'DETERMINISTIC'`.
- **Validator schema.** `DeterministicValidatorSchema`
  (`src/contracts/content.ts`) is `.strict()`, with `type` in
  `numeric | text | ratio | percent | multiple_choice | composite`, required
  `canonicalAnswer`, `acceptedAnswers` (1–20), `equivalenceNotes`, and
  optional `parts` (1–6, composite only). `type` does not change grading;
  only `parts` does. Assessment and review records reuse the same schema
  (`src/contracts/progression.ts`).
- **Catalog invariant.** `validateContentCatalog` requires
  `canonicalAnswer ∈ acceptedAnswers` and restricts contest validators by
  type (`src/content/catalog.ts` lines 309–433).
- **Transport.** Phase 1 routes accept `learnerResponse: string`, trimmed,
  1–1000 characters, with a non-strict request object
  (`src/app/api/phase1/attempt/route.ts`). The assessment submission route
  uses a `.strict()` object with the same string limits.
- **Storage.** `Attempt` (`prisma/schema.prisma`) stores `contentKey`,
  `contentVersion`, `learnerResponse String`, `normalizedResponse String?`,
  `correctness` (`CORRECT | INCORRECT | PARTIAL | UNSCORED`), `scoringMethod`
  (`DETERMINISTIC | RUBRIC | UNSCORED`), `context` and `policyVersion`. There
  is **no** response-mode, matcher or scorer version. Stored responses are
  read back only by the household data export
  (`src/server/household-data.ts`); no code path recomputes correctness.
- **Historical content.** `resolveHistoricalContent` prefers a
  `ContentArchive` snapshot parsed with `ContentRecordSchema`, returning
  `undefined` on any parse failure, and falls back to the catalog entry with
  the same `id@version` (`src/content/archive.ts`).
- **Learner projection.** The practice session projects `id`, `version`,
  `title`, `skillCode`, `prompt`, `accessibilityNotes`, `figure`; it does
  **not** project `accessibleAlternative` (service line 257–265), and the
  practice panel renders one `<input>` labeled "Your answer"
  (`src/app/components/activity-panel.tsx`). The assessment current-item
  projection exposes `title`, `prompt`, `accessibilityNotes`,
  `accessibleAlternative`, `figure`, never the validator. No learner-facing
  assessment UI component exists in `src/app/components/`.
- **Tutor.** `getTutorContext` passes `canonicalAnswer` and
  `forbiddenLeakagePatterns` to the tutor; the stored attempt response is
  not sent. A provider port `scoreConstructedResponse` (LLM scoring) exists
  in `src/contracts/provider.ts` with implementations in the fake and
  Anthropic models; no production call site was found by search.
- **Existing tests.** `tests/content/answer-matching.test.ts` asserts parts
  match "in either order"; `tests/phase1/composite-parts-grading.test.ts`
  asserts `ratio-tables-2` accepts `80, 16` through the real attempt path.

## 2. Opt-in structured mode (deliverable 1)

### 2.1 Mode identity and dispatch (REC)

- One new response mode, identifier `structured-fields`, mode version `1`.
  It is declared **inside the item's validator**, so an item opts in only
  through a new `id@version` (C-1, C-8). Absence of the declaration means
  the legacy path, byte-for-byte unchanged.
- A single dispatcher selects the scorer from the resolved item version:
  legacy items call `matchesAcceptedAnswer` exactly as today; structured
  items call the structured scorer. `answer-matching.ts` is not edited.
- Any change to the set of responses mode `1` accepts, rejects or refuses
  (grammar, equivalence, normalization) is a **new mode version**. Mode `1`
  semantics are frozen once any item using it is registered. Bug fixes that
  change outcomes ship as mode `2` on new item versions, never in place.

### 2.2 Validator shape (REC; schema sketch, not code)

```ts
// Added alternative for DeterministicValidatorSchema (strict objects throughout).
{
  type: 'structured',                      // new enum member
  responseMode: { id: 'structured-fields', version: '1' },
  canonicalAnswer: string,                 // derived rendering, see 2.4
  acceptedAnswers: [string],               // exactly [canonicalAnswer], see 2.4
  equivalenceNotes: string,                // human-readable, unchanged role
  fields: StructuredField[],               // 1–6, presentation order = binding order
  // `parts` is forbidden on this type.
}

type StructuredField =
  | {
      key: string;                         // /^[a-z][a-z0-9-]{0,39}$/ (≤ 40), unique
      kind: 'number';
      label: string;                       // 1–120, visible, unique within item
      unitLabel?: string;                  // 1–40, displayed, never typed
      representations: ('integer' | 'decimal' | 'fraction' | 'mixed-number')[]; // non-empty, unique, ordered by preference
      simplestForm: boolean;               // applies to fraction and mixed-number input
      correctValue: string;                // PRIVATE. Exact rational, bounds in 2.5a
    }
  | {
      key: string;
      kind: 'choice';                      // exactly one selection
      label: string;
      options: { id: string; label: string }[]; // 2–8; id /^[a-z0-9][a-z0-9-]{0,39}$/ (≤ 40); label 1–120; ids and labels unique
      correctOptionId: string;             // PRIVATE. One of options[].id
    };
```

Public versus private (R-4): `options[].id` is the public submission
identifier a learner selects; `correctOptionId` and `correctValue` are the
private correct-answer selectors and appear only in the validator. Option
ids should be neutral (for example `opt-1`, `opt-2`) so an id never encodes
correctness; this is a content-review rule, checked at RAT-CONTENT.

v1 deliberately excludes free-text fields, typed units, multi-select,
interchangeable (unordered) fields, tolerance/rounding, negative numbers and
cross-field constraints such as "any equivalent ratio". Each is a later mode
version if the owner wants it (section 9, OD-6).

### 2.3 Binding, representation, units and order (REC)

- **Binding.** Every field is bound by `key` to its own validator. The
  response is a key→value map; key order in the request is irrelevant. The
  field array order is the presentation and reading order. Swapping two
  fields' values is an ordinary wrong answer.
- **Representation.** A `number` field accepts input only in its enumerated
  `representations`. Within those, any input whose exact rational value
  equals `correctValue` is correct, subject to `simplestForm`. Value comparison uses
  exact integer arithmetic (for example `BigInt` numerator/denominator), never
  floating point.
- **Units.** Units are never parsed from free text in v1. A fixed unit is
  shown as `unitLabel` beside the input. Where the evidence requires the
  learner to choose the unit or rate language (TR-3, D-151 explicit output
  unit), the item adds a `choice` field whose options are units or rate
  phrases. This makes unit correctness deterministic.
- **Required order.** Where order carries meaning (ratio terms, "first …
  then …", aligned number-line positions), each position is its own labeled
  field; the label states the quantity. TR-6 positions map one-to-one to
  fields whose labels match the text alternative's blank names.

### 2.4 Coexistence with legacy fields (REC)

- `canonicalAnswer` stays required and becomes a derived rendering:
  fields in order as `label: rendering[ unitLabel]` joined by `; `. A
  choice field renders the label of `correctOptionId`. A number field
  renders `correctValue` in the **first enumerated representation that can
  express it** (2.5a), in that representation's canonical form: integer
  `45`; decimal shortest exact form with at least one fractional digit
  (`3.5`, `45.0`); fraction `n/d` in lowest terms (`45/1` for an integer);
  mixed number `w n/d` in lowest terms. The tutor and leakage checks keep
  reading it (OBS, section 1).
- `acceptedAnswers` must equal exactly `[canonicalAnswer]` so the existing
  catalog invariant holds; the structured scorer never consults it, and the
  whole-string path is not applied to structured items.
- `forbiddenLeakagePatterns` (REC content rule, checked at RAT-CONTENT):
  include `canonicalAnswer` and each field's canonical value with its unit
  label, so the existing hint-ladder scan covers field answers.

### 2.5 Numeral grammar for mode 1 (REC; owner decision OD-5)

Applied to the field string after trimming leading/trailing ASCII space,
tab and U+00A0. Maximum 32 characters before trimming.

| Representation | Accepted pattern (ASCII digits only)                                 | Notes                                                                 |
| -------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `integer`      | `0` or `[1-9][0-9]{0,8}`                                             | No sign, no leading zeros, no thousands separators                    |
| `decimal`      | integer pattern, `.`, then `[0-9]{1,6}`                              | Digit required before the point; trailing zeros allowed (value-equal) |
| `fraction`     | integer `/` integer, optional spaces around `/`, denominator not `0` | Unreduced input parses; it scores `INCORRECT` if `simplestForm` (2.6) |
| `mixed-number` | `[1-9][0-9]{0,8}`, one or more spaces, fraction with `0 < n < d`     | Unreduced fraction part scores `INCORRECT` if `simplestForm` (2.6)    |

Everything else is not a number in mode 1: signs, `−`, `≠`, words, unit
text, currency or percent symbols, Unicode digits or vulgar fractions
(`½`), decimal commas, separators, several numbers, or trailing claims.

**Field classification order (R-2).** Every `number` field string is
classified in this fixed order; the first matching step decides:

1. Empty after trimming → `REQUIRED`.
2. More than 32 characters before trimming → `TOO_LONG`.
3. Matches none of the four patterns above (including digit-run limits:
   at most 9 integer digits per run, at most 6 fractional digits, mixed
   numerator below denominator) → `NOT_A_NUMBER`.
4. Matches only representations the field does not enumerate →
   `FORM_NOT_ALLOWED`.
5. Otherwise scored: value equal to `correctValue` (and lowest terms when
   `simplestForm` applies) → correct field; else incorrect field.

A `choice` field value is classified: empty → `REQUIRED`; exactly equal to
one `options[].id` → scored (correct only if it equals `correctOptionId`);
anything else → `NOT_AN_OPTION`, whatever its length.

### 2.5a Value bounds and representability (R-3)

- `correctValue` is either an integer `0`–`999999999` written without
  leading zeros, or `n/d` with `1 ≤ n`, `2 ≤ d`, both at most 9 digits and
  `gcd(n, d) = 1`.
- A representation **can express** a value when its canonical rendering
  (2.4) fits the 2.5 pattern and digit limits: `integer` only integral
  values; `decimal` only values with a terminating expansion of at most 6
  fractional digits (integral values as `v.0`); `fraction` every value
  (`v/1` for integers); `mixed-number` only non-integral values greater
  than 1.
- At least one enumerated representation must express `correctValue`;
  otherwise the record is rejected at load (2.7).
- Rendering length (residual R-3). The 2.5 pattern limits alone give a
  **conservative upper bound** of 29 characters for a mixed number
  (9 + 1 + 9 + 1 + 9). That bound is not attainable under the bounds above.
  The **attainable** maxima are: integer 9 characters; fraction 19
  (`999999999/999999998`); decimal 15 (for example `999999999/64` renders
  `15624999.984375`); mixed number 21. For the mixed bound: if `d` has `k`
  digits then `w = floor(n/d)` has at most `10 − k` digits and the
  remainder at most `k`, so the length is at most `12 + k ≤ 21`, attained by
  `999999999/500000000`, rendered `1 499999999/500000000`. Either way every
  canonical rendering fits the 32-character field limit and every transport
  bound in 3.1.
- A `choice` field's correct response is its `correctOptionId`, at most 40
  characters, within the 3.1 bound.

### 2.6 Correctness (REC; owner decision OD-3)

`CORRECT` if and only if every field is correct; otherwise `INCORRECT`.
v1 records no `PARTIAL` and introduces no partial evidence weight, so D-08
and the mastery path receive the same two outcomes as today. A
`simplestForm` violation by a value-equal fraction is `INCORRECT` (the
requirement is visible in the field description, section 3.2).

### 2.7 Load-time validation (REC)

The schema plus catalog/bank validation must reject, at load, any record
with: unknown `responseMode.id` or `version`; `type: 'structured'` without
`responseMode`, or `responseMode` on another type; `parts` on a structured
validator; 0 or more than 6 fields; duplicate keys, labels, option ids or
option labels; a key, option id, label or unit label outside its 2.2
pattern or length; a `correctOptionId` not among its options' ids; a
`correctValue` outside 2.5a bounds or not in lowest terms; no enumerated
representation that can express `correctValue` (for example
`mixed-number` alone with an integer value or a value below 1, `integer`
alone with a fractional value); `decimal` enumerated for a value without a
terminating expansion of at most 6 places; `acceptedAnswers` other than
`[canonicalAnswer]`; `canonicalAnswer` not equal to the 2.4 rendering or
longer than the existing 200-character limit; a structured validator in any
contest mode (v1 excludes contest formats).

### 2.8 Unknown or unsupported mode: fail closed (REC)

| Layer                   | Behavior                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema                  | Strict enums reject unknown mode ids/versions (OBS: validator objects are `.strict()`, so a pre-mode deploy also rejects structured records)                                                                  |
| Public catalog          | Module-load validation throws; nothing is served or published                                                                                                                                                 |
| Private bank            | Required: a bank containing an unknown mode fails validation and none of its items is served. The current store's behavior on a schema failure was not re-read here (MISS; CORE packet confirms and tests it) |
| Archive resolution      | Parse failure returns `undefined` (OBS); the catalog fallback resolves only the same `id@version`, else the existing "Unknown content" error; never a different version                                       |
| Scoring dispatcher      | Exhaustive switch on mode; an unhandled mode raises `UNSUPPORTED_RESPONSE_MODE` before any write                                                                                                              |
| Request / item mismatch | Structured body for a legacy item, or a `learnerResponse` string for a structured item, is refused with `RESPONSE_MODE_MISMATCH`; body mode/version differing from the item's is `UNSUPPORTED_RESPONSE_MODE`  |

Rollback note: if a deploy containing structured items is rolled back,
older code cannot parse those records or archive rows. Sessions on them fail
with the existing unknown-content error instead of being scored by the
legacy matcher. This is the intended fail-closed outcome.

## 3. Learner input, accessibility and grading paths (deliverable 2)

### 3.1 Request contract (REC)

Every attempt-submitting route (Phase 1 attempt, check, diagnostic-attempt,
review-attempt; assessment submission) accepts **exactly one** of:

- `learnerResponse: string` (legacy, unchanged limits), or
- `structuredResponse`, a strict object
  `{ mode: string, modeVersion: string, fields: Record<string, string> }`;
  `mode` and `modeVersion` at most 40 characters each; `fields` keys at most
  64 characters each, at most 12 keys; values strings only (preserving the
  learner's representation), each at most 200 characters.

These request-layer bounds only cap payload size (a conservative bound of
12 × (64 + 200) = 3168 characters of field keys and values). They are deliberately looser than the item bounds (keys
and option ids at most 40, number values at most 32, at most 6 fields;
2.2, 2.5, 2.5a), so every correct response passes the request layer and
the tighter checks can produce accessible per-field errors. Both or
neither response field present, a non-string value, or a request bound
exceeded is `INVALID_REQUEST` (400). Phase 1 request objects are non-strict
today (OBS); the structured branch must be strict so unknown top-level keys
are refused rather than stripped.

### 3.2 Public field descriptors (REC)

Two learner projections, and only these, gain an optional `responseSpec`
for structured items: the practice session content (`startSession`) and
the assessment current item (`getCurrentAssessmentItem`, served only after
its existing authorization and lifecycle checks, OBS). Its exact public
shape (R-4):

```ts
{
  mode: 'structured-fields',
  modeVersion: '1',
  fields: (
    | { key; kind: 'number'; label; unitLabel?; representations; simplestForm }
    | { key; kind: 'choice'; label; options: { id; label }[] }
  )[];
}
```

It is built by an allowlist copy, never by deleting fields from the
validator. It must **never** contain `correctValue`, `correctOptionId`,
`canonicalAnswer`, `acceptedAnswers`, `equivalenceNotes`,
`solutionRepresentation`, `solutionMethod`, misconception codes, hint
steps or `forbiddenLeakagePatterns`. Legacy items carry no `responseSpec`
and keep the single text input. `options[].id` values are public by
design: they are what the learner submits. `representations` and
`simplestForm` are exposed because they define the visible format
contract; they reveal no more than the field description shown to every
learner. Projection-by-projection assertions are PA-4a to PA-4h (5.5).

### 3.3 Refusal versus scoring (REC; owner decision OD-2)

Mode and field refusal is decided **only** from `(responseSpec, response)`,
never from `correctValue` or `correctOptionId`, so it leaks nothing about
correctness. It is evaluated only **after** the authority and lifecycle
preflight (3.3a), so field errors describe only an item the learner is
currently entitled to see.

| Condition                                                                 | Outcome                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Body shape invalid, both or neither response fields, non-string value     | `INVALID_REQUEST`                                      |
| Mode mismatch with the item; unknown mode/version                         | `RESPONSE_MODE_MISMATCH` / `UNSUPPORTED_RESPONSE_MODE` |
| Extra key not in the item's fields                                        | `MALFORMED_RESPONSE`, field code `UNKNOWN_FIELD`       |
| Required key missing; value empty after trimming                          | `MALFORMED_RESPONSE`, `MISSING_FIELD` / `REQUIRED`     |
| Value too long                                                            | `MALFORMED_RESPONSE`, `TOO_LONG`                       |
| `number`: not a mode-1 number in any representation                       | `MALFORMED_RESPONSE`, `NOT_A_NUMBER`                   |
| `number`: a valid number in a representation the field does not enumerate | `MALFORMED_RESPONSE`, `FORM_NOT_ALLOWED`               |
| `choice`: not exactly one of the option ids                               | `MALFORMED_RESPONSE`, `NOT_AN_OPTION`                  |
| Well-formed: every field passes format                                    | Scored `CORRECT` or `INCORRECT` (2.6)                  |

Field checks follow the 2.5 classification order per field and collect
every field's error in one refusal rather than stopping at the first.

### 3.3a Authority, lifecycle and precedence (R-1; REC)

Tiers are evaluated in order. The first failing tier decides the response;
later tiers are not evaluated, so an authority or lifecycle error always
wins over a mode or field error, and no field error is ever returned for a
request that fails tiers 0–2.

| Tier | Checks                                                                                                           | Outcome on failure                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 0    | Existing route gates: release gate, authentication (in each route's current order relative to tier 1, unchanged) | Existing codes (`RELEASE_GATE_CLOSED` 404, `UNAUTHORIZED` 401)           |
| 1    | Request shape (3.1); item-independent                                                                            | `INVALID_REQUEST` 400                                                    |
| 2    | Read-only authority, lifecycle and current-item preflight (below); no writes                                     | Existing codes and statuses; `NOT_CURRENT_ITEM` (assessment, structured) |
| 3    | Mode checks against the resolved item                                                                            | `RESPONSE_MODE_MISMATCH` / `UNSUPPORTED_RESPONSE_MODE` 422               |
| 4    | Field checks (3.3)                                                                                               | `MALFORMED_RESPONSE` 422 with `fieldErrors`                              |
| 5    | Write transaction: re-check every tier-2 condition under the transaction, then score and persist                 | Existing codes; the transaction writes nothing on failure                |

Tier 2, practice (`createAttempt`): exactly the checks the path performs
today before scoring: the session exists for this household and learner
(else the existing "Session not found" error, 404 at the route) and the
session's pinned item version resolves (else the existing unknown-content
error). This contract adds no new practice authority or lifecycle rule
(OBS: `createAttempt` does not check `endedAt`; see section 10).

Tier 2, assessment (`submitAssessmentItem`): the existing pre-transaction
checks run first, unchanged (OBS lines 250–285: assignment snapshot found
for this household and learner, else `ASSESSMENT_NOT_FOUND`; ordinal
selected and pinned item version found, else `VERSION_MISMATCH`). Then a
read-only preflight evaluates, without writing, the conditions the
transaction checks today (OBS lines 289–339), in the same order and with
the same codes: assignment and run state found (`ASSESSMENT_NOT_FOUND`);
session belongs to the assignment (`ASSESSMENT_NOT_FOUND`); session not
ended (`SESSION_ENDED`); session kind matches (`SESSION_KIND_MISMATCH`);
run not terminal (`RUN_NOT_ACTIVE`); run not expired (see below); ordinal
not already submitted (`DUPLICATE_ITEM_SUBMISSION`). Then, **for
structured items only**, the
ordinal must equal the current item, meaning the lowest selected ordinal
not yet submitted, the one `getCurrentAssessmentItem` serves; otherwise
`NOT_CURRENT_ITEM` (409, item-independent message). This new condition is
a recommendation that narrows structured submissions only; legacy
submissions keep today's behavior. It takes effect only if the owner
accepts this contract (it is not implied by D-154).

Expiry: if the preflight finds the run expired, tiers 3–4 are skipped and
the request enters the existing transactional path unchanged, which today
records expiry and returns `expired` (OBS lines 327–329). That existing
expiry write is the only write a non-scored structured request can cause,
and it is today's behavior, not a refusal.

Tier 5 keeps every existing in-transaction check. If a condition changed
between preflight and transaction (for example a concurrent duplicate),
the existing error is returned and the transaction writes nothing.

A refusal (any failure in tiers 1–4, including `NOT_CURRENT_ITEM`) creates
**no** `Attempt`, `AssistanceEvent`, `LearningEvent`, shadow decision,
mastery update or contribution; does not end a session; and in assessment
does not consume the ordinal, change `submittedOrdinals`, start or extend
the run, or update `lastActivityAt`. Tier-4 refusal responses list
`{ key, code }` per field, never echo submitted values, labels or options,
and contain no correctness. REC status codes as in the tier table.

### 3.4 Accessible input requirements (REC; WCAG 2.2 AA target)

| ID   | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-1  | Fields render in a `<fieldset>` whose `<legend>` names the question; each field has a visible `<label for>` with its `label` text (WCAG 1.3.1, 2.4.6, 3.3.2, 4.1.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| A-2  | `unitLabel` is visible next to the input and referenced by `aria-describedby`; units are never conveyed by placeholder, color or position alone (1.3.1, 1.4.1, 3.3.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| A-3  | `number` fields use `type="text"` and `autocomplete="off"`. Input mode follows the enumerated representations (R-5): `inputmode="numeric"` only when `integer` is the sole representation; `inputmode="decimal"` only when the representations are within `integer` and `decimal`; whenever `fraction` or `mixed-number` is enumerated, `inputmode="text"` (a full keyboard), because numeric and decimal keypads are not guaranteed to offer `/` or space. PA-10 must show `3/4` and `1 1/2` entered on a mobile virtual keyboard; a different control (for example separate whole, numerator and denominator boxes) changes the response shape and needs a new mode version. A visible format hint ("Type a whole number, decimal, fraction like 3/4, or mixed number like 1 1/2", limited to the enumerated forms, plus "in simplest form" when set) is referenced by `aria-describedby` |
| A-4  | `choice` fields are a native radio group inside its own `<fieldset>`/`<legend>`; no custom widgets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| A-5  | On refusal: each invalid field gets `aria-invalid="true"` and an adjacent message referenced by `aria-describedby`; an error summary with `role="alert"` lists each message with a control that moves focus to that field; focus moves to the summary; entered values are preserved (3.3.1, 3.3.3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| A-6  | Error messages are item-independent format guidance only (section 3.3 codes) and never hint at correctness, values or the answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| A-7  | Result feedback keeps today's `role="status"` polite region and item-level wording; no per-field correctness in v1 (OD-4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| A-8  | Keyboard-only completion in field order; visible focus; target size at least 24×24 CSS px (2.5.8); reflow at 320 CSS px and 400 % zoom without loss (1.4.10); no new time limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A-9  | Items with a figure render `altText` and caption as today, **and** the item's `accessibleAlternative` as text for structured items (OBS gap: the practice projection omits it today). For TR-6 the text alternative names every aligned pair and every blank by the same label as its field (D-152)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| A-10 | Learner-facing strings meet the content reading-level review; refusal messages are listed in the implementation for review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| A-11 | The D-41 manual screen-reader pass covers the new input before any learner is served; axe automation alone is insufficient                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 3.5 Practice grading path (REC)

All Phase 1 paths go through `createAttempt`. Order of operations: the
existing session lookup and historical item resolution (tier 2, 3.3a,
unchanged); select the scorer by the item's mode; for structured items,
apply tiers 3–4 **before** the `attempt.create` retry loop; on success persist per section 4 and continue
the existing evidence, shadow, learning-event and mastery logic unchanged
(same `evidenceWeight`, same context mapping). Hint requests after an
`INCORRECT` structured attempt use the existing tutor flow; the tutor still
receives `canonicalAnswer` (2.4) and the learner's typed message, not the
structured response.

### 3.6 Assessment submission path (REC)

`submitAssessmentItem` already resolves the pinned item (`id`, `version`,
`hash`) before its transaction (OBS). The 3.3a tier-2 preflight runs next,
then tiers 3–4, all **before** the transaction, so a refusal cannot alter
run state and never precedes an authority or lifecycle error. Within the
transaction (tier 5), every existing check is repeated before any write;
scoring and persistence then follow section 4; the
response projection (`projectAssessmentSubmissionResponse`) is unchanged and
keeps item-level correctness only. `getCurrentAssessmentItem` adds
`responseSpec` (3.2). New refusal codes extend `AssessmentSubmissionError`
or a sibling error; the existing 404/409 mapping is unchanged for existing
codes.

### 3.7 No semantic or LLM grading (REC; enforces `AGENTS.md`)

The structured scorer is a pure, synchronous function of
`(validator, structuredResponse)` with no I/O, clock, randomness, network
or provider dependency. It must not import `src/tutor/**` or provider
contracts, and `scoreConstructedResponse` must not be called for any
response mode. A layer-separation test enforces the import boundary. No AI
call occurs, so no AI trace is produced for scoring.

## 4. Storage, attribution and history (deliverable 3)

### 4.1 Storage options (OWNER decision OD-1)

| Option                                      | Description                                                                                                                                                                                                                                                                                                                                            | Consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S-A. Envelope in existing columns (REC)** | `learnerResponse` stores a canonical JSON envelope `{"mode":"structured-fields","modeVersion":"1","fields":[{"key":…,"value":…}]}` with fields in item order and raw trimmed values; `normalizedResponse` stores the same envelope with values normalized (number → lowest-terms `n/d` or integer; choice → option id); `scoringMethod: DETERMINISTIC` | No schema change, migration or new column. Only scored (non-refused) responses are stored, so every value has passed the item bounds; those values need no JSON escaping. Upper bound: a 56-character prefix, at most `21 + 40 + 40 = 101` characters per field, 5 separators and a 2-character suffix, so at most 669 characters. 669 is attainable only by six `choice` fields with 40-character keys and 40-character option ids; a `number` field contributes at most `21 + 40 + 32 = 93`, because its stored raw trimmed value is at most 32 characters. For `normalizedResponse`, a normalized number value is the lowest-terms `n/d` (or integer) of the learner's parsed input. That input is not limited by the `correctValue` bounds, so it can exceed 21 characters: a mixed-number input yields at most an 18-digit numerator and a 9-digit denominator, 28 characters. That stays within 32, so the same 669-character upper bound applies. That is within the existing 1000-character `learnerResponse` request limit and the 10000-character `AttemptEvidence` contract limit. The column itself is unbounded `String` (OBS). The household export already selects these columns (OBS); erasure treats the rows as today (not re-read here). Interpretation relies on item resolution (4.3) |
| S-B. New nullable columns (proposal only)   | Add `responseMode String?`, `responseModeVersion String?`, `structuredResponse Json?` to `Attempt`; legacy rows stay `NULL`                                                                                                                                                                                                                            | Self-describing rows, no reliance on string parsing. **Requires** a reversible migration with reviewed `down.sql`, `npm run test:migrations`, export/erasure coverage review, and separate migration and privacy approval. Not authorized                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Under either option: no backfill or rewrite of any existing row; no new
learner data class (values are numbers and option identifiers, a narrower
class than today's free text); nothing new is sent to a provider.

### 4.2 Mode and version attribution (REC)

- The authoritative attribution of an attempt is its `contentKey` and
  `contentVersion`, which pin an immutable item version (C-1) whose
  validator declares the mode and mode version. Under S-A the envelope
  repeats mode and version; under S-B the columns do.
- Mode `1` code is frozen (2.1), so mode version also identifies scorer
  semantics for structured attempts. Legacy attempts have no matcher
  version (OBS); their semantics are "the legacy matcher as deployed at
  `createdAt`" and remain unversioned. This contract does not repair that.
- `policyVersion`, `context` and `MasteryContribution` writes are unchanged.

### 4.3 History and replay interpretation rules (REC)

| ID  | Rule                                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-1 | Stored `correctness` is authoritative and is never recomputed, rewritten or re-derived for any attempt, legacy or structured (no historical rescoring, D-154)                                                                                        |
| H-2 | The resolved item version, not the stored string, decides how a row is read. A legacy item's row is free text even if it looks like an envelope (a learner can type JSON into a legacy box)                                                          |
| H-3 | A structured item's row is rendered as a labeled list using the archived item's field labels and unit labels; if the envelope fails to parse or its mode/version differs from the item's, render the raw text flagged "unreadable" and never rescore |
| H-4 | Superseded item versions must be in `ContentArchive` before deployment replaces them (plan C-1); archive parsing must accept the structured schema so labels stay resolvable                                                                         |
| H-5 | A read-only audit may re-run the mode-1 scorer on a stored envelope and **report** disagreement with stored correctness; it never writes                                                                                                             |
| H-6 | Legacy attempts on `unit-rates-2@content-2`, `ratio-tables-2@content-2` and every other `parts` item keep their recorded outcomes, including any false accepts, and continue to count as recorded (C-8, C-9)                                         |

"Replay" here means re-display and audit only. Assessment idempotency is
unchanged (`DUPLICATE_ITEM_SUBMISSION`). Parent-facing claims from
structured attempts remain traceable to the attempt row and item version.

## 5. V-7 acceptance for the new mode and new items (deliverable 4)

### 5.1 Scope and outcome vocabulary

V-7 acceptance, unweakened, applies to (a) the mode-1 scorer and request
path, through the synthetic fixtures below, and (b) every new item version
scored by the mode (TR-6, TR-7 and converted candidates), through the
generated vectors in 5.4 at RAT-CONTENT stage 2 and again on final reviewed
bytes. Private bank items using the mode run the same generator privately
under a separately approved O-10 scope (not authorized here).

Outcomes: `CORRECT`, `INCORRECT`, `REFUSED(code[, field code])`. A V-7
"reject" row passes only with the exact listed outcome; any `CORRECT` on a
reject row is a failure. Acceptance requires 100 % of rows to pass.

### 5.2 Synthetic fixtures (test-only; not content)

Labels are neutral so fixtures cannot be mistaken for items.

Every synthetic fixture in section 5 is a complete structured validator
inside a synthetic content record. That includes each fixture below, the
PA-6 positive controls and every 5.5 selector or sentinel variant. Each
has `type: 'structured'`, `responseMode` `structured-fields`/`1`, and
`canonicalAnswer` and `acceptedAnswers` (`[canonicalAnswer]`) derived
from its own fields and selectors per 2.4. Its `equivalenceNotes` and the
remaining content-record fields hold synthetic values (sentinels where
5.5 requires them). Each fixture and each variant must pass 2.2, 2.5a
and 2.7 on its own before it is used in any test. The PA-6 rejection fixtures are the one exception. Each violates the rule
it tests, plus only the rules that the same violation necessarily implies
(for example `decimal` alone with `1/3` breaks both the representability
rule and the terminating-decimal rule; `1000000000` breaks the value
bound and representability). Each satisfies every other rule, so its load
failure is attributable.

| Fixture | Fields (in order)                                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SF-1    | `a`: number, label "Quantity A", unit "units", representations integer, decimal, fraction, mixed-number, `simplestForm: false`, `correctValue` `45`; `b`: number, label "Quantity B", unit "units per group", same representations, `correctValue` `9` |
| SF-2    | `r`: number, label "Quantity R", representations fraction, mixed-number, decimal, `simplestForm: true`, `correctValue` `7/2`                                                                                                                           |
| SF-3    | `q`: choice, label "Choice Q", option ids `x`, `y`, `z` (labels "Option X/Y/Z"), `correctOptionId` `y`; `n`: number, label "Quantity N", representations integer only, `simplestForm: false`, `correctValue` `12`                                      |
| SF-4    | `p`: number, label "Quantity P", unit "units per item", representations decimal, fraction, `simplestForm: false`, `correctValue` `1/20`                                                                                                                |
| SF-5    | `s`: number, label "Quantity S", representations integer only, `simplestForm: false`, `correctValue` `5`; `t`: number, label "Quantity T", representations fraction only, `simplestForm: true`, `correctValue` `3/4`                                   |
| LF-1    | A legacy (non-structured) validator with `acceptedAnswers: ["5"]`, for mode-mismatch rows                                                                                                                                                              |

### 5.3 Scorer and request acceptance matrix

Fields not listed in a row hold their correct value. A row listing several
inputs ("then …") requires each input as its own case.

| ID   | Fixture | Input (field values)                                                                    | Expected                                                                        | V-7 class         |
| ---- | ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------- |
| E-01 | SF-1    | `a: "45"`, `b: "9"`                                                                     | `CORRECT`                                                                       | enumerated equiv. |
| E-02 | SF-1    | `a: " 45 "`, `b: "9.0"`                                                                 | `CORRECT`                                                                       | enumerated equiv. |
| E-03 | SF-1    | `a: "90/2"`, `b: "18 / 2"`                                                              | `CORRECT`                                                                       | enumerated equiv. |
| E-04 | SF-1    | `a: "45/1"`, `b: "9.000"`                                                               | `CORRECT`                                                                       | enumerated equiv. |
| E-05 | SF-2    | `r: "7/2"`; then `"3 1/2"`; `"3.5"`; `"3.50"`; `"7 / 2"`; `"3  1/2"`                    | `CORRECT` for each                                                              | enumerated equiv. |
| E-06 | SF-3    | `q: "y"`, `n: "12"`                                                                     | `CORRECT`                                                                       | enumerated equiv. |
| E-07 | SF-4    | `p: "0.05"`; then `"1/20"`; `"5/100"`; `"0.050"`                                        | `CORRECT` for each                                                              | enumerated equiv. |
| N-01 | SF-1    | `a: "not 45"`                                                                           | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)`                                     | negated           |
| N-02 | SF-1    | `a: "-45"`; then `"−45"`; `"≠45"`; `"no 45"`                                            | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | negated           |
| N-03 | SF-3    | `q: "not y"`                                                                            | `REFUSED(MALFORMED_RESPONSE, NOT_AN_OPTION)`                                    | negated           |
| P-01 | SF-1    | `a: "145"`; then `"450"`; `"45.01"`; `"1045"`                                           | `INCORRECT` each                                                                | padded number     |
| P-02 | SF-1    | `a: "045"`; then `"0045"`                                                               | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | padded number     |
| P-03 | SF-2    | `r: "17/2"`; then `"7/20"`; `"3.51"`                                                    | `INCORRECT` each                                                                | padded number     |
| P-04 | SF-4    | `p: "0.0501"`; then `"0.055"`; `"10.05"`                                                | `INCORRECT` each                                                                | padded number     |
| P-05 | SF-3    | `n: "112"`                                                                              | `INCORRECT`                                                                     | padded number     |
| O-01 | SF-1    | `a: "9"`, `b: "45"` (values swapped)                                                    | `INCORRECT`                                                                     | reordered         |
| O-02 | SF-2    | `r: "2/7"`                                                                              | `INCORRECT`                                                                     | reordered         |
| A-01 | SF-3    | `q: "x,y,z"`; then `"x y z"`; `"all"`                                                   | `REFUSED(MALFORMED_RESPONSE, NOT_AN_OPTION)` each                               | all-options       |
| A-02 | SF-3    | `q: ["x","y","z"]` (array)                                                              | `REFUSED(INVALID_REQUEST)`                                                      | all-options       |
| A-03 | SF-1    | `a: "45 or 9"`; then `"45, 9"`                                                          | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | all-options       |
| X-01 | SF-1    | extra key `c: "1"`                                                                      | `REFUSED(MALFORMED_RESPONSE, UNKNOWN_FIELD)`                                    | extra claim       |
| X-02 | SF-1    | `a: "45 units"`; then `"45; also 9"`; `"45 and more"`                                   | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | extra claim       |
| X-03 | SF-4    | `p: "$0.05"`; then `"0.05 per item"`                                                    | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | extra claim       |
| X-04 | SF-1    | body has both `learnerResponse` and `structuredResponse`                                | `REFUSED(INVALID_REQUEST)`                                                      | extra claim       |
| F-01 | SF-2    | `r: "14/4"`; then `"3 2/4"`                                                             | `INCORRECT` each (not simplest)                                                 | form              |
| F-02 | SF-3    | `n: "12.0"`; then `"24/2"`                                                              | `REFUSED(MALFORMED_RESPONSE, FORM_NOT_ALLOWED)` each                            | form              |
| F-03 | SF-2    | `r: "7/0"`; then `"3½"`; `"3,5"`; `".5"`                                                | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)` each                                | form              |
| F-04 | SF-1    | `a: "44 2/2"` (improper mixed)                                                          | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)`                                     | form              |
| F-05 | SF-1    | `a` value of 33 characters                                                              | `REFUSED(MALFORMED_RESPONSE, TOO_LONG)`                                         | form              |
| M-01 | SF-1    | key `b` absent                                                                          | `REFUSED(MALFORMED_RESPONSE, MISSING_FIELD)`                                    | missing           |
| M-02 | SF-1    | `b: ""`; then `"   "`                                                                   | `REFUSED(MALFORMED_RESPONSE, REQUIRED)` each                                    | missing           |
| M-03 | SF-1    | `a: 45` (JSON number)                                                                   | `REFUSED(INVALID_REQUEST)`                                                      | type              |
| M-04 | SF-3    | `q: "Y"` (case differs)                                                                 | `REFUSED(MALFORMED_RESPONSE, NOT_AN_OPTION)`                                    | form              |
| U-01 | SF-1    | `modeVersion: "2"`                                                                      | `REFUSED(UNSUPPORTED_RESPONSE_MODE)`                                            | unknown mode      |
| U-02 | SF-1    | `mode: "structured"`                                                                    | `REFUSED(UNSUPPORTED_RESPONSE_MODE)`                                            | unknown mode      |
| U-03 | SF-1    | legacy body `learnerResponse: "45; 9"`                                                  | `REFUSED(RESPONSE_MODE_MISMATCH)`                                               | mode mismatch     |
| U-04 | LF-1    | structured body with valid SF-1 values                                                  | `REFUSED(RESPONSE_MODE_MISMATCH)`                                               | mode mismatch     |
| D-01 | all     | Each `CORRECT`/`INCORRECT` row evaluated twice, and with request keys in reversed order | Identical outcome                                                               | determinism       |
| B-01 | SF-1    | `a: "999999999"`                                                                        | `INCORRECT`                                                                     | boundary          |
| B-02 | SF-1    | `a: "1000000000"` (10 digits)                                                           | `REFUSED(MALFORMED_RESPONSE, NOT_A_NUMBER)`                                     | boundary          |
| B-03 | SF-4    | `p: "0.050000"` (6 places); then `"0.0500000"` (7 places)                               | `CORRECT`; then `REFUSED(…, NOT_A_NUMBER)`                                      | boundary          |
| B-04 | SF-1    | `a`: 23 leading spaces then `45.000000` (32 characters); then 24 leading spaces (33)    | `CORRECT`; then `REFUSED(…, TOO_LONG)`                                          | boundary          |
| B-05 | SF-1    | `a` of 33 spaces                                                                        | `REFUSED(…, REQUIRED)` (step 1 precedes step 2)                                 | boundary          |
| S-01 | SF-5    | `s: "3/4"`, `t: "5"` (swapped; neither in the other field's representations)            | `REFUSED(MALFORMED_RESPONSE)` with `s: FORM_NOT_ALLOWED`, `t: FORM_NOT_ALLOWED` | reordered         |
| S-02 | SF-5    | `s: "5"`, `t: "6/8"`                                                                    | `INCORRECT` (not simplest)                                                      | form              |
| S-03 | SF-5    | `s: "5"`, `t: "3/4"`                                                                    | `CORRECT`                                                                       | enumerated equiv. |

### 5.4 Item-level generated vectors (each new item version)

RAT-CONTENT (and RAT-PACKAGE privately) generates and runs these from each
item's validator plus its declared misconception distractor values.

Rules for every family (R-2):

- Each vector changes one field and keeps every other field correct,
  except G-SW, which changes two.
- The expected outcome comes from a **reference classifier** that
  implements the 2.5 classification order and 2.5a bounds independently
  of the scorer under test. A field vector that is not well formed takes
  the first failing step's refusal (`REQUIRED`, `TOO_LONG`, `NOT_A_NUMBER`,
  `FORM_NOT_ALLOWED` or `NOT_AN_OPTION`). Only a well-formed wrong value
  is `INCORRECT`. A response with any field refusal is
  `REFUSED(MALFORMED_RESPONSE)` listing every refused field.
- A family's listed outcome is the outcome for vectors that stay within
  the grammar and bounds. A construction that leaves them is not dropped:
  it is reclassified, and its reclassified outcome is still a rejection
  (never `CORRECT`). The 5.3 hand-authored rows independently anchor the
  reference classifier, so the generator cannot be tautological.
- A construction whose exact value equals `v` in an enumerated
  representation within bounds is moved to G-EQ.

Notation: `v` is the field's canonical value; `R` its enumerated
representations; `r_k` the canonical rendering of `v` in representation
`k` (2.4), for each `k ∈ R` that can express `v` (2.5a).

| ID            | Generated inputs                                                                                                                                                                                                                   | Expected                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| G-EQ (number) | Each `r_k`; `" " + r_k + " "`; if `fraction ∈ R` and `simplestForm` is false and both terms stay at most 9 digits, `2n/2d`; if `decimal ∈ R` and `r_decimal` has fewer than 6 fractional digits, `r_decimal` plus one trailing `0` | `CORRECT`                                                                                                                                  |
| G-EQ (choice) | `correctOptionId`                                                                                                                                                                                                                  | `CORRECT`                                                                                                                                  |
| G-NG (number) | `"not " + r_k`, `"no " + r_k`, `"-" + r_k`, `"−" + r_k`, `"≠" + r_k`                                                                                                                                                               | `NOT_A_NUMBER` (attainable renderings are at most 21 characters, 2.5a, so these stay within 32)                                            |
| G-NG (choice) | `"not " + correctOptionId`, `"no " + correctOptionId`                                                                                                                                                                              | `NOT_AN_OPTION`                                                                                                                            |
| G-PD (number) | From each `r_k`: `"1"` prefixed to the first digit run; `"0"` appended to the integer, numerator or whole-number run; `"01"` appended to decimal digits; value must differ from `v`                                                | `INCORRECT` within grammar and bounds; else reclassified (`NOT_A_NUMBER`)                                                                  |
| G-PB (number) | Boundary: a 10-digit integer derived from `r_integer` or a numerator; a decimal with 7 fractional digits; any `r_k` left-padded with spaces to 33 characters                                                                       | `NOT_A_NUMBER`, `NOT_A_NUMBER`, `TOO_LONG`                                                                                                 |
| G-LZ (number) | `"0" + r_k`                                                                                                                                                                                                                        | `NOT_A_NUMBER`                                                                                                                             |
| G-SW          | For each ordered pair of fields `f`, `g` of the same kind with different canonical values: put `g`'s value into `f` in a representation `f` enumerates if one can express it, else in `r_k(g)`; and `f`'s value into `g` likewise  | `INCORRECT` if both swapped fields are well formed; else `REFUSED` with `FORM_NOT_ALLOWED` or `NOT_AN_OPTION` for each non-enterable field |
| G-AO (choice) | All option ids joined by `,`, by `, ` and by a space; the ids as a JSON array                                                                                                                                                      | `NOT_AN_OPTION`; array `INVALID_REQUEST`                                                                                                   |
| G-AO (number) | `r_k + " or " + w`, `r_k + ", " + w`, `w` another field's rendering or `v + 1` rendered in `k`                                                                                                                                     | `NOT_A_NUMBER`, or `TOO_LONG` if over 32 characters                                                                                        |
| G-EX          | One unknown extra key with a valid value; number: `r_k + " " + (unitLabel or "units")`, `r_k + "; " + w`, `r_k + " and more"`; choice: `correctOptionId + " and more"`                                                             | `UNKNOWN_FIELD`; number `NOT_A_NUMBER` or `TOO_LONG` by length; choice `NOT_AN_OPTION`                                                     |
| G-MS          | Each field key missing; each field `""` and `"   "`                                                                                                                                                                                | `MISSING_FIELD`; `REQUIRED`                                                                                                                |
| G-FM (number) | `v` rendered in each representation not in `R` that can express it                                                                                                                                                                 | `FORM_NOT_ALLOWED`                                                                                                                         |
| G-MC (number) | Each declared distractor value rendered in each `k ∈ R` that can express it (content review flags a distractor no `k ∈ R` can express)                                                                                             | `INCORRECT`                                                                                                                                |
| G-WC (choice) | Every option id other than `correctOptionId`                                                                                                                                                                                       | `INCORRECT`                                                                                                                                |

Any generated row that fails blocks registration of that item version.
The generator itself is reviewed with the implementation (section 8).

### 5.5 Path-level acceptance (implementation packets)

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Test kind             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| PA-1  | A practice refusal leaves no `Attempt`, `AssistanceEvent`, `LearningEvent`, `ShadowDecision`, `MasteryEstimate` change or `MasteryContribution`; session not ended                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | integration           |
| PA-2  | An assessment refusal leaves no `Attempt`; `submittedOrdinals`, `currentOrdinal`, `status`, `startedAt`, `lastActivityAt` unchanged; the same ordinal can then be submitted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | integration           |
| PA-3  | A scored structured attempt stores the 4.1 encoding exactly (S-A envelope byte form, or S-B columns) and `scoringMethod: DETERMINISTIC`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | integration           |
| PA-4a | Practice `startSession` content for each structured fixture. (1) **Exact allowlist:** `responseSpec` deep-equals the descriptor expected from the fixture, with top-level keys exactly `mode`, `modeVersion`, `fields`; a number field's keys exactly `key`, `kind`, `label`, `representations`, `simplestForm` and, if declared, `unitLabel`; a choice field's keys exactly `key`, `kind`, `label`, `options`; each option's keys exactly `id`, `label`, in declared order. (2) **Private-selector redaction:** a recursive key scan of the whole projection finds no key named `correctValue`, `correctOptionId`, `canonicalAnswer`, `acceptedAnswers`, `equivalenceNotes`, `solutionRepresentation`, `solutionMethod`, `misconceptionCodes`, `hintSteps` or `forbiddenLeakagePatterns`. (3) **Scoped sentinels:** see the rule below this table. (4) **Selector invariance:** the projection is byte-identical for a fixture variant whose selector changes (SF-3 `correctOptionId` `y` → `x`; SF-1 field `a` `correctValue` `45` → `46`), with the dependent private fields `canonicalAnswer` and `acceptedAnswers` recomputed per 2.4 and every public field unchanged; both members of each pair must pass 2.7 (5.2) | contract, integration |
| PA-4b | Practice session for a legacy item has no `responseSpec`; its projection is byte-identical to today's                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | integration           |
| PA-4c | Assessment current item (GET) for an authorized, current structured ordinal: the same four checks as PA-4a (exact allowlist, private-selector redaction, scoped sentinels, selector invariance), applied to the current-item projection. For an unauthorized, ended, terminal, expired or mismatched request: the existing error and no `responseSpec`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | integration           |
| PA-4d | Assessment assignment projection (`projectAssessmentAssignmentResponse`) is unchanged: no `responseSpec`, no item identities                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | contract              |
| PA-4e | Assessment submission response (`projectAssessmentSubmissionResponse`) is unchanged: no `responseSpec`, no submitted values, no per-field correctness; item-level correctness only as today                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | contract              |
| PA-4f | Practice attempt responses keep today's shape (`attemptId`, `correctness`, `evidenceWeight`); no `responseSpec` or field data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | contract              |
| PA-4g | Refusal responses contain only `error`, `reasonCode` and, for tier 4 only, `fieldErrors: [{ key, code }]`; no submitted values, labels, options or correct values; tier 0–3 refusals have no `fieldErrors`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | integration           |
| PA-4h | Client bundle and every learner API response (PA-4a to PA-4g) for the synthetic structured fixtures: no private-selector key (PA-4a list) anywhere, and no scoped-sentinel hit (rule below). Public option ids are expected inside `responseSpec.fields[].options[].id` and are not leakage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | contract              |
| PA-5  | Legacy items still score through `matchesAcceptedAnswer`; `src/content/answer-matching.ts` SHA-256 remains `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5`; existing matcher tests unchanged and green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | unit                  |
| PA-6  | Every 2.7 load-time rejection, one fixture per rule, including impossible fields (R-3): `mixed-number` only with `correctValue` `4` and with `1/2`; `integer` only with `7/2`; `decimal` only with `1/3`; `correctValue` `1000000000`; `correctValue` `2/4`; option id of 41 characters or with uppercase; key `A`; `correctOptionId` not among ids. Positive controls that must load: a `mixed-number`-only field with `correctValue` `999999999/500000000` (canonical rendering `1 499999999/500000000`, 21 characters, the attainable maximum) and a `fraction`-only field with `correctValue` `999999999/999999998` (19 characters). No fixture targets the conservative 29-character bound, which is not attainable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | unit                  |
| PA-7  | Scorer module imports nothing from `src/tutor/**` or provider contracts; no provider call during any scoring path (fake tutor only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | layer separation      |
| PA-8  | Pre-existing synthetic attempts (legacy items) are byte-identical before and after exercising the new paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | integration           |
| PA-9  | Household export returns structured rows unchanged in content; H-3 rendering, if a renderer is added, uses archived labels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | integration           |
| PA-10 | A-1–A-9 in Playwright: accessible names, descriptions, error summary focus, keyboard-only completion, axe clean, value preservation after refusal; `inputmode` per A-3 for each representation set; and, as UI review evidence, `3/4` and `1 1/2` entered through a mobile virtual keyboard on a fraction-enabled field (R-5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | e2e, UI review        |
| PA-11 | Precedence (3.3a) with a malformed structured body: another household's assignment or session → `ASSESSMENT_NOT_FOUND`; ended session → `SESSION_ENDED`; kind mismatch → `SESSION_KIND_MISMATCH`; terminal run → `RUN_NOT_ACTIVE`; expired run → today's expiry result; submitted ordinal → `DUPLICATE_ITEM_SUBMISSION`; unselected ordinal → `VERSION_MISMATCH`; future selected ordinal → `NOT_CURRENT_ITEM`; practice session of another learner → existing not-found. None returns `fieldErrors`; none writes except the existing expiry path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | integration           |
| PA-12 | Race: preflight passes, a concurrent submission of the same ordinal commits first; the second returns `DUPLICATE_ITEM_SUBMISSION` from the transaction recheck and writes nothing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | integration           |

**Scoped sentinel rule (PA-4a, PA-4c, PA-4h; residual R-4).** Public
option ids are learner-visible by design (3.2), and one of them always
equals the private `correctOptionId`. A value scan therefore never treats
an option id as leakage. The checks are:

- Every free-text private field of the test fixtures
  (`equivalenceNotes`, `solutionRepresentation`, `solutionMethod`, hint
  text, `forbiddenLeakagePatterns`) is set to a distinct sentinel string
  (for example `SENTINEL-EQ-7f3a`). No sentinel may be a substring of
  another or of any public fixture text. Any occurrence of a sentinel in a
  learner projection, response or client bundle fails.
- `canonicalAnswer` and `acceptedAnswers` are **not** replaced by
  sentinels, because 2.7 requires them to equal the 2.4 derived rendering.
  The scan instead checks that the whole derived `canonicalAnswer` string
  appears in no string value. Its private parts are covered by the number
  sentinel (next bullet) and, for choice fields, by selector invariance.
- A sentinel variant of each number fixture uses a `correctValue` that
  its own representations can express (2.5a), with `canonicalAnswer` and
  `acceptedAnswers` recomputed per 2.4 (5.2), and whose renderings occur
  nowhere in the fixture's public content. That content is: title,
  prompt, `accessibilityNotes`, `accessibleAlternative`, figure text,
  labels, unit labels, option ids and option labels. Examples: `8191/64`
  for SF-1 field `a` (renderings `127.984375`, `8191/64`, `127 63/64`) and
  `7919` for integer-only fields such as SF-3 field `n` (rendering `7919`).
  Fixture construction asserts that absence. Every rendering of the value
  in a representation that can express it must then appear in no string
  value of the projection.
- The scan never flags a string found at a path
  `responseSpec.fields[i].options[j].id` or `.label`. The choice-selector
  leak is tested structurally instead: by the private-selector key scan
  and by selector invariance (PA-4a item 4). A projection that marks,
  orders or flags the correct option differently fails invariance.

## 6. Legacy `parts` characterization (deliverable 5)

### 6.1 Scope and rules

The characterization set is the nine unchanged public production `parts`
items below. It records current behavior; it is **not** V-7 acceptance and
is never reported as such. Candidate items (not loaded) and private items
(O-10) are out of scope.

- Lives in its own suite named
  `legacy parts characterization (not V-7 acceptance)`; no test title in it
  contains "V-7 acceptance".
- Each row records the static expected current outcome, a
  `v7Expectation` (`reject` or `accept`), and a status `UNMET` when they
  disagree. The suite asserts the count of `UNMET` rows, so a silent change
  in either direction fails.
- If an observed outcome differs from the static expectation below, the
  implementer stops and reports it to the integrator; expectations are not
  edited to match.
- Pins: matcher SHA-256 (PA-5) and each item file SHA-256 below. No change
  to `answer-matching.ts`, any content file or any historical attempt.
- Existing tests that assert legacy behavior (`matches parts in either
order`; `ratio-tables-2` accepts `80, 16`) remain unchanged.

| Item `id@version`                             | File SHA-256 (baseline)                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `ratio-tables-2@content-2`                    | `10ace306b5fd0cf77915510a45cbeb3bcadd7cbc7457d2f16879f03a92511b88` |
| `unit-rates-2@content-2`                      | `ea3b8c81aadb70032a23df09ac64ff0c9769d9546df053805484755c54a0b0fc` |
| `equation-and-inequality-meaning-1@content-2` | `29b4282fd3029ee5c2ffcd4ac23083e5a8f120dacfb0bacc256b1d5357a15967` |
| `equation-and-inequality-meaning-2@content-2` | `15c25bbfac719a430973cb5e3ae53657330ac04a01e92553a440ba92dd978362` |
| `one-variable-equations-2@content-3`          | `66a57ed46133e9dc0dee0af45d94b54318aac77ac794b0139066e64b6acaff4c` |
| `real-world-inequalities-2@content-3`         | `be1eaa1831b2dc995b5a139773daca97bb156d360a9259ec76e27e062a9fb3b1` |
| `variables-in-context-1@content-2`            | `7e85e4a2b8465844d4ee91203e2e9b5f55af9f4e37339f0b9aecb760f9588f4e` |
| `variables-in-context-2@content-2`            | `8fa2ad3bfc3f087e1dd46a4e8df5ce7cbf2b60c22b2d351ecf9764d27e8823ac` |
| `prism-volume-2@content-2`                    | `570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d` |

### 6.2 Required rows per item

For every item: (1) `canonicalAnswer` and each `acceptedAnswers` entry,
expected `true`, `v7Expectation: accept`; (2) `"not " + canonicalAnswer`,
expected `true` by static reading (each canonical answer contains a phrase
from every part, and the prefix removes none), `v7Expectation: reject`,
`UNMET`; (3) the known-failure rows in 6.3.

### 6.3 Known V-7 failures recorded as unmet expectations

Static expected outcome of `matchesAcceptedAnswer` at the pinned matcher.
Sources: reconciliation §4.2 (author-reported examples; `180, 16` also
independently confirmed statically by the reviewer) and subject report R-2.

| Item                                | Response                                                                            | Static outcome | V-7 expectation | Status |
| ----------------------------------- | ----------------------------------------------------------------------------------- | -------------- | --------------- | ------ |
| `ratio-tables-2`                    | `180, 16`                                                                           | `true`         | reject          | UNMET  |
| `ratio-tables-2`                    | `16 minutes and 80 minutes per mile`                                                | `true`         | reject          | UNMET  |
| `ratio-tables-2`                    | `16, 80`                                                                            | `true`         | reject (order)  | UNMET  |
| `unit-rates-2`                      | `the 6-pack is cheaper, not the 10-pack; $0.055 per bottle`                         | `true`         | reject          | UNMET  |
| `unit-rates-2`                      | `The 10-pack is not cheaper by $0.05 per bottle`                                    | `true`         | reject          | UNMET  |
| `unit-rates-2`                      | `10-pack, $0.0501 per bottle`                                                       | `true`         | reject          | UNMET  |
| `equation-and-inequality-meaning-1` | `No, 12 + 1 = 13 is not true`                                                       | `true`         | reject          | UNMET  |
| `equation-and-inequality-meaning-2` | `13 is a solution; 6 is not; all numbers less than 50`                              | `true`         | reject          | UNMET  |
| `one-variable-equations-2`          | `x = 240; 18 = 18`                                                                  | `true`         | reject          | UNMET  |
| `real-world-inequalities-2`         | `p <= 150; 14 yes, 16 no; p can be 0 through 150`                                   | `true`         | reject          | UNMET  |
| `variables-in-context-1`            | `112 + 4w; w is the number of workshops`                                            | `true`         | reject          | UNMET  |
| `variables-in-context-2`            | `36n + 3; n is a nonnegative whole number`                                          | `true`         | reject          | UNMET  |
| `prism-volume-2`                    | `12 cubic meters; the space inside the box`                                         | `true`         | reject          | UNMET  |
| `real-world-inequalities-2`         | `9 + p ≤ 24; 14 works, 16 does not; p can be 0 through 15, with a closed dot at 15` | `false`        | accept (`≤`)    | UNMET  |

Adjacent whole-string observations (for example `ratio-language-1`
rejecting `2 : 3`, subject report R-7) are not `parts` items and are
outside this required set; a later packet may add them as a separate
characterization group.

### 6.4 How legacy V-7 status can change

Only by superseding item versions that pass section 5 (TR-7 for the two
Ratios items, through RAT-CONTENT) or by separately approved per-domain
correction packets for the other seven. Superseded versions stay resolvable
and their historical attempts keep their recorded outcomes (H-1, H-6).
Plan §3.4 remains the authority: no packet claims full V-7 completion.

## 7. Interfaces touched by a later implementation (REC)

| Interface                                                                                 | Change (if implemented)                                                                                                                          |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/contracts/content.ts`                                                                | Structured validator alternative (2.2); `parts` unchanged                                                                                        |
| New `src/content/structured-response.ts`                                                  | Grammar, parser, scorer, refusal codes, `responseSpec` projection, envelope serializer; pure                                                     |
| `src/content/catalog.ts`                                                                  | Load-time rules (2.7) inside `validateContentCatalog` only; no import or `rawContent` edits (RAT-CONTENT owns)                                   |
| `src/content/answer-matching.ts`                                                          | **None**                                                                                                                                         |
| `src/phase1/service.ts`                                                                   | Scorer dispatch, pre-write refusal, persistence, `responseSpec` and `accessibleAlternative` in projection                                        |
| `src/progression/assessment-submission.ts`, `assessment-response.ts`                      | Read-only tier-2 preflight, then pre-transaction refusal; transactional rechecks; persistence; `responseSpec` in current item; new refusal codes |
| `src/app/api/phase1/*/route.ts`, `src/app/api/progression/assessment/submission/route.ts` | XOR request bodies (3.1), status mapping                                                                                                         |
| `src/app/components/activity-panel.tsx`, `src/app/page.tsx`, new field component          | Accessible structured input (3.4)                                                                                                                |
| `prisma/schema.prisma`                                                                    | None under S-A; S-B columns only after migration and privacy approval                                                                            |

## 8. Bounded implementation packets (deliverable 6; REC, none approved)

Plan §5 names one RAT-SCORE-IMPL packet. The split below is a
recommendation (OD-7); the owner may keep one packet with the same gates.
Every packet: synthetic fixtures and fake tutor only, no content records,
no private access, no historical rescoring, Claude Code
`forge-implementer` / Sonnet author, then Codex `forge-reviewer` /
`gpt-6.1-sol` cross-family review (scoring is critical), then owner.

| Order | Packet                      | Owned paths                                                                                                                                                                                                                                       | Depends on                                 | Validation                                                                                                                                               |
| ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L     | RAT-SCORE-LEGACY            | New `tests/content/legacy-parts-characterization.test.ts` only                                                                                                                                                                                    | This contract accepted                     | `npm run verify`; report UNMET count                                                                                                                     |
| 1     | RAT-SCORE-IMPL-CORE         | `src/contracts/content.ts`; new `src/content/structured-response.ts`; `validateContentCatalog` rules in `src/content/catalog.ts`; new `tests/content/structured-response*.test.ts`; `tests/contracts/` additions                                  | Contract accepted; OD-2, OD-3, OD-5, OD-6  | `npm run verify`; 5.3 matrix, PA-5, PA-6, PA-7; 5.4 generator with synthetic fixtures                                                                    |
| 1a    | RAT-SCORE-SCHEMA (only S-B) | `prisma/schema.prisma`; one migration with reviewed `down.sql`; export/erasure coverage tests                                                                                                                                                     | OD-1 = S-B; migration and privacy approval | `npm run verify`, `npm run test:migrations`, `npm run test:integration`                                                                                  |
| 2     | RAT-SCORE-IMPL-PATHS        | `src/phase1/service.ts`; `src/progression/assessment-submission.ts`; `src/progression/assessment-response.ts`; the five attempt routes; tests under `tests/phase1/`, `tests/progression/`, `tests/progression-integration/`, `tests/persistence/` | CORE accepted; OD-1 (and 1a if S-B); OD-4  | `npm run verify`, `npm run test:integration`; PA-1–PA-4h, PA-8, PA-9, PA-11, PA-12; `npm run eval:run` (fake) because the Phase 1 tutor path is adjacent |
| 3     | RAT-SCORE-IMPL-UI           | `src/app/components/activity-panel.tsx`; new structured field component; `src/app/page.tsx`; styles; `tests/browser/`                                                                                                                             | PATHS accepted; UI playbooks               | `npm run verify`, `npm run test:e2e`; PA-10; Codex `ui-review`; D-41 pass remains a release gate                                                         |

Not in these packets: any learner assessment UI (none exists; separate
scope), content records (RAT-CONTENT), private runs (RAT-PACKAGE under
O-10), IC-9 interim handling, other-domain `parts` migration, release.
RAT-CONTENT may register structured items only after CORE and PATHS are
accepted and each item passes 5.4; learner serving of such items also needs
UI accepted and the D-41 pass.

## 9. Approved, recommended and open

### 9.1 Already approved (APP)

D-154 direction and boundaries; D-152 representation tasks and TR-6
dependency; D-153 new item/lesson versions; D-151 explicit output unit;
D-08 weights; D-41; D-58; D-01/D-02; plan C-1/C-8 as accepted plan
requirements; `AGENTS.md` deterministic, privacy, accessibility and
migration rules (section 0.1).

### 9.2 Recommendations in this contract (REC, not approved)

Mode identity and frozen-version rule (2.1); validator shape and v1 field
kinds (2.2); binding and unit approach (2.3); coexistence rules (2.4);
numeral grammar and classification order (2.5); value bounds and
representability (2.5a); all-or-nothing correctness (2.6); load-time rules
(2.7); fail-closed layers (2.8); request contract (3.1); descriptor
projection (3.2); refusal table and codes (3.3); authority/lifecycle
preflight, tier precedence and the structured-only `NOT_CURRENT_ITEM`
condition (3.3a); accessibility requirements and input modes (3.4); path
ordering (3.5, 3.6); purity boundary (3.7); storage option S-A
(4.1); attribution and history rules (4.2, 4.3); acceptance matrix and
generator (5.3–5.5); characterization rules (6); packet split (8).

### 9.3 Open owner decisions

| ID   | Decision                                                                                 | Options                                                                                                 | REC                                                      |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| OD-1 | Structured attempt storage                                                               | S-A envelope in existing columns; S-B new nullable columns (needs migration and privacy approval)       | S-A                                                      |
| OD-2 | Well-typed but malformed field input                                                     | Refuse with no attempt (format-only, answer-independent); or record `INCORRECT`                         | Refuse                                                   |
| OD-3 | Partial credit                                                                           | None (all fields must be correct); or `PARTIAL` with a new weight decision                              | None in v1                                               |
| OD-4 | Per-field correctness feedback in practice                                               | Item-level only; or per-field in practice (never in assessment)                                         | Item-level only in v1                                    |
| OD-5 | Mode-1 numeral grammar details                                                           | Leading `.5`; trailing zeros; spaces in fractions; `$`/`%` typed; thousands separators; Unicode forms   | As in 2.5 (no `.5`, trailing zeros accepted, no symbols) |
| OD-6 | v1 field kinds                                                                           | Number and single choice only; or add free text (ungraded), multi-select, unordered sets, tolerance     | Number and single choice only                            |
| OD-7 | Implementation packaging                                                                 | One RAT-SCORE-IMPL packet; or the section 8 split                                                       | Split                                                    |
| OD-8 | `accessibleAlternative` in the practice projection                                       | Structured items only; or all practice items (a learner-visible change to existing items' presentation) | Structured items now; all items as a separate UI scope   |
| OD-9 | Whether an assessment learner UI is scoped before any held-out structured item is served | Separate UI packet; or defer held-out structured items                                                  | Defer held-out structured items until a UI is scoped     |

Still separate and untouched here: IC-6–IC-9 (IC-9 interim handling of the
two live Ratios `parts` items has no recommendation), O-10 private access,
D-61 exceptions for RAT-CONTENT and RAT-PACKAGE, per-item content approval,
catalog registration, release.

## 10. Limitations

- Static reading only; no test, probe or scorer execution. Section 6
  outcomes are static expectations that the characterization packet must
  confirm or report.
- The publication projection for structured practice records under D-58 was
  not re-read here; the CORE packet must confirm what the site exposes
  (MISS).
- The numeral grammar and refusal messages are not validated with children;
  usability and reading level need review before serving.
- Mode 1 cannot express "any equivalent ratio", unordered answers or
  approximate answers; items needing them wait for a later mode version.
- Legacy attempts remain unversioned; this contract cannot attribute
  historical matcher semantics beyond `createdAt`.
- Practice `createAttempt` does not check `endedAt` today (OBS). This
  contract keeps the existing practice authority checks and adds none;
  whether ended practice sessions should refuse submissions is outside
  this scope.
- No mobile keyboard behavior was observed; A-3 input modes and the PA-10
  mobile entry evidence remain to be shown by the UI packet.

## 11. Revision 2 notes (2026-10-12)

Bounded corrections for `docs/rat-score-design-20261012-review.md`. No
owner decision (OD-1 to OD-9) was chosen and no new research was done.

| Finding | Correction                                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1     | New 3.3a: tiered precedence; authority/lifecycle/current-item preflight before any mode or field error; existing codes and order; expiry falls through to today's path; transactional rechecks; zero writes on refusal. 3.3, 3.5, 3.6 and section 7 aligned. PA-11, PA-12                                        |
| R-2     | 2.5 classification order; 5.4 rewritten as field-kind-specific families with a reference classifier, reclassification within the grammar/length/representation rules, boundary family G-PB, representation-aware swaps, choice negation as `NOT_AN_OPTION`. 5.3 rows B-01 to B-05, S-01 to S-03 and fixture SF-5 |
| R-3     | New 2.5a value bounds and representability; 2.2 identifier bounds; 2.4 canonical rendering uses the first expressible representation; 2.7 rejects impossible fields; 3.1 request bounds looser than item bounds; 4.1 S-A size bound computed (at most 669 characters). PA-6 vectors                              |
| R-4     | 2.2 separates public `options[].id` from private `correctOptionId`/`correctValue`; 3.2 exact public shape, allowlist construction and the two projections that carry it; PA-4 split into PA-4a to PA-4h per projection, including refusal redaction                                                              |
| R-5     | A-3 input mode by representation set (`text` whenever fraction or mixed-number is enumerated); PA-10 adds mobile entry of `3/4` and `1 1/2`                                                                                                                                                                      |

### Revision 3 notes

Bounded corrections for `docs/rat-score-design-20261012-rereview.md`. R-1,
R-2 and R-5 are unchanged. No owner decision (OD-1 to OD-9) was chosen and
no new research was done.

| Finding      | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Residual R-3 | 2.5a separates the conservative 29-character pattern bound from the attainable maxima (integer 9, fraction 19, decimal 15, mixed 21, with derivation). 3.1 and 4.1 label 3168 and 669 as conservative upper bounds, state when 669 is attained and bound normalized learner values (28 characters). PA-6 positive controls use valid bounded rationals `999999999/500000000` and `999999999/999999998`. Dependent G-NG outcome in 5.4 corrected |
| Residual R-4 | PA-4a, PA-4c and PA-4h share one public-option-id exception: exact key allowlists per descriptor level, a private-selector key scan, scoped sentinels that exclude only `responseSpec.fields[].options[].id`/`.label` paths, and selector-invariance variants. Scoped sentinel rule added after the 5.5 table                                                                                                                                   |

### Revision 4 notes

These corrections come from the author's closure self-audit
(`closure-evidence.rev4.md` in the handoff evidence), not from a new
review finding. No owner decision was chosen.

| Finding      | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Residual R-4 | SF-3 field `n` and SF-5 field `s` now declare the required `simplestForm: false`, so PA-4a's exact allowlist is derivable and the fixtures pass 2.2/2.7. The scoped sentinel rule no longer replaces `canonicalAnswer`/`acceptedAnswers` (which contradicted 2.7). It scans for the whole derived `canonicalAnswer` instead. It requires the number sentinel to be expressible in the field's representations and absent from all public fixture content |

### Revision 5 notes

Bounded correction for `docs/rat-score-design-20261012-rev4-review.md`
(R-4, unresolved: selector-variant fixture validity). Closure evidence:
`closure-evidence.rev5.md` in the handoff evidence. No owner decision was
chosen.

| Finding      | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Residual R-4 | PA-4a check 4 no longer says the variants differ "only" in a selector. The selector changes and `canonicalAnswer`/`acceptedAnswers` are recomputed per 2.4, public fields unchanged, and both members must pass 2.7. PA-4c and PA-4h inherit this by reference. Directly coupled: the sentinel number variant now also recomputes the derived fields, and 5.2 states that every fixture, PA-6 positive control and variant is a complete validator with derived answer fields that must load on its own, while each PA-6 rejection fixture violates only its tested rule and rules that violation necessarily implies |
