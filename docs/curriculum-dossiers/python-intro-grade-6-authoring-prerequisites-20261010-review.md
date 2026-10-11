# Python Grade 6 authoring prerequisites — independent review — 2026-10-10

**Current verdict: ready-for-human-review-with-noted-risks. Recommendation:
ready for human review with noted risks.** F1–F6 are resolved in the corrected
specification's changed scope. This is advisory review of a prerequisite
specification, not approval of sources, scope, content, authoring, execution,
mastery or learner availability. No D-61 lift is inferred.

## Revision 2 — bounded correction re-review

- **Pinned corrected specification:** 678 lines, SHA-256
  `4375fbe8564857f53bf6247168a16107298a36617a484c84c668bf7fc918f958`.
  Independently checked against the coordinator-supplied hash.
- **Actual-model independence:** coordinator verified Copilot
  `task`/`read_agent` metadata identifies author
  `f2e7410b-9b9d-427f-81f1-4bc3ab384f50`, `claude-opus-5.5` (Claude),
  and reviewer `58e388cf-32d6-4e0f-89e8-700959edeb83`,
  `gpt-6.1-sol` (GPT). These externally witnessed IDs apply to the pinned
  author/reviewer task pair; they are not self-reported model identities.
- Scope was only prior F1–F6 and coupled scoring, first-packet dependencies,
  evidence and gate wording. Re-derived the ordered normalization consequences
  and read the changed sections; no reliance on the author's correction list.
  No curriculum records, implementation, agents, database/provider calls or
  additional source research were introduced.

### Findings disposition

- **F1 resolved, high confidence — §5.2:** spaces, case, punctuation, line order,
  leading blank lines and interior/extra trailing blank lines are preserved.
  Only line-ending conversion and removal of exactly one final LF are tolerated.
  Canonical output is explicitly represented without that final terminator,
  rather than claiming byte-identical raw stdout. Re-derivation confirms
  `a\nb\n` and `a\r\nb\r\n` normalize to `a\nb`, while `  a\nb`,
  `a\n\nb`, `Hi ` and `a\nb\n\n` remain different. The test plan includes
  these negative cases and case-sensitive matching.
- **F2 resolved, high confidence — §5.2 and §11:** validator-aware request parsing
  carries raw strings without `.trim()`; raw UTF-16 length, CRLF/CR conversion,
  character validation, one-final-LF removal, emptiness/line limits and exact
  comparison are ordered. CR is converted before forbidden-control validation.
  Invalid responses are typed and precede attempts, assistance, mastery/evidence
  changes and tutor moves. The proposed normalized response and evaluator
  version must persist through both actual scoring paths, not only a fixture.
  Empty raw input and one LF become invalid; tab/NUL/non-ASCII remain invalid;
  wrong but syntactically valid spacing is incorrect, not silently repaired.
- **F3 resolved, high confidence — §5.2 and §8:** the first packet excludes
  argument-free `print`, empty strings, empty/blank output and whitespace-sensitive
  output. One or more literal arguments with constrained nonempty output are
  representable by the proposed answer contract. Later blank-output work needs
  a separately reviewed contract rather than an improvised sentinel.
- **F4 resolved, high confidence — §5.3 and §8:** error and type questions are
  deferred. Existing substring parts and lowercased choice matching are
  explicitly prohibited for them. Later questions require exact category/type
  tokens, separately validated integer lines and both fields correct when both
  are asked. Logic mistakes require stated intended behavior; traceback/message
  wording is not scored.
- **F5 resolved, high confidence — §7–§9 and §12:** C1–C5 are one synthetic-fixture
  authoring-contract slice; C7/C9, accessibility and availability are serving
  gates. Public code rendering, choices and live teaching delivery are conditional.
  H1 covers only the entry competency. The required first packet is one
  foundational output practice record, with optional offline teaching only if
  explicitly authorized, and no held-out records. The catalog's legacy
  two-record rule is not invented as a new-role prerequisite. Draft publication
  protection remains required before a Python skill reaches `rawSkills`.
- **F6 resolved, high confidence — §3, §8 and H1:** research graph edges are
  explicitly not approved. Later edges require conceptual-necessity evidence
  and independent audit; teaching order is not unlock authorization. Arithmetic
  and keyboard assumptions are not mastery/placement evidence or hidden
  cross-program gates. The entry skill has no prerequisites.

### Residual risks and implementation acceptance

No remaining blocker or major finding in this changed scope.

- The recommendation remains CPython 3.14, not an approved pin. Authorized
  authoring must verify each used behavior against the selected minor version.
  Scope, internal objective/source posture and dated D-61 authorization remain
  explicit human choices, not outcomes of this review.
- Request-to-persistence tests must cover **every enabled entry route** into
  both scoring services, including independent checks, diagnostic and review
  paths, not interpret “both routes” as permission to leave their existing
  trimming unchanged. For example, `src/app/api/phase1/check/route.ts:9`
  currently trims. Item/type lookup must be household-authorized, and legacy
  parsing must remain unchanged. This is acceptance detail for the stated
  no-trim boundary, not a demand to expand the first content packet.
- Catalog checks must validate submitted canonical strings before a trimming
  schema can hide prohibited boundary whitespace. This implements the proposal's
  explicit canonical rejection tests; it does not require relaxing the
  first-packet constraints.
- Persistent evaluator provenance still needs implementation and tests.
  Human-reviewed answer derivations support content correctness; they are not
  learner mastery evidence. No Python execution or LLM scoring authority is
  authorized; serving still requires no-model-hint enforcement.
- The approval-header research hash delta remains an administrative provenance
  confirmation for the coordinator, separate from source-substance defects.
- Coordinator reports the main shared-publication fix separately reviewed by
  Opus with **76 tests passing**. This worker does not contain that fix.
  Record that as coordinator evidence, not as re-reviewed code or tests run here;
  do not reopen the worker's older publication baseline as a new defect.

### Correction validation

- Corrected specification SHA-256 and 678-line count: passed.
- Report-only Prettier and trailing-whitespace/final-newline checks: passed
  after the correction review update, using the same installed formatter
  command recorded below.
- No proposed Python runtime tests were run or represented as implemented.
  Prior 13 matching tests remain the original baseline evidence only.
- **Next issue:** obtain human decisions for this bounded contract, then implement
  and test C1–C5 with synthetic fixtures; request the dated authoring exception
  only with the applicable gate evidence. No content or availability change is
  authorized by this recommendation.

## Original review — retained history

The original verdict was **changes-required / not ready for human review**.
The original revision, findings and checks below are historical evidence; they
are not unresolved defects in the corrected revision.

## Revision and independence

- Reviewed specification: `python-intro-grade-6-authoring-prerequisites-20261010.md`,
  525 lines, SHA-256
  `ace5065b2b82c1cb26d2629e103dbdbc1a1df4de443571674c8f8e15e2e9abfd`.
- Worktree base recorded by the packet:
  `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`, plus integrated source documents.
- **Cross-family coordinator witness:** the coordinator reports verification
  through Copilot `task`/`read_agent` metadata of actual author agent
  `f2e7410b-9b9d-427f-81f1-4bc3ab384f50`, `claude-opus-5.5` (Claude),
  and launch of this independent review with `gpt-6.1-sol` (GPT).
  This records externally supplied identity evidence, not model self-report
  or an inference from profile defaults. The reviewer launch ID was not supplied
  in this bounded packet; the coordinator should attach it to the integration
  record. No agent or provider calls were made by this reviewer.
- Independently traced the actual schemas, catalogs, publication generator,
  learner renderer, two grading paths, request parsers and relevant tests.
  The research review was used for revision/gate provenance, not as an
  authority for the specification's technical conclusions.
- Read README, relevant curriculum/pedagogy and architecture sections, current
  PROGRESS entries, authoring and content-review procedures, content-authoring
  pipeline, source approval, expansion plan, orchestration policy and D-61.
  No implementation, curriculum content, web research or private data was used.
  Only this report was edited; shared progress/source files were left untouched.

## Verified findings

References to “spec” below mean the pinned specification above.

### F1 — major, high confidence: normalization silently repairs wrong output

**Refs:** spec:224–249; `docs/content-review.md:38–42`;
`src/content/answer-matching.ts:19–26,43–58`.

The proposed exact-output evaluator removes indentation on every response line
and deletes interior blank lines. Consequently, canonical `a\nb` accepts
`  a\n\n    b`, although those are different printed outputs. Forbidding such
whitespace in canonical answers does not make it correct in learner answers.
This recreates part of the legacy whitespace-collapse defect the new evaluator
is meant to avoid. Case, punctuation, comma spacing and numeric spelling are
otherwise correctly distinguished by the proposal.

**Smallest safe fix:** preserve leading whitespace, interior blank lines and
line ordering. Specify any tolerated final line terminator separately; if
trailing spaces are intentionally tolerated as entry artifacts, say so
explicitly rather than calling the comparison exact standard output. Prefer
excluding whitespace-sensitive strings from the initial authored scope.
Add negative cases for indented output and inserted blank lines, alongside
the proposed case/punctuation/numeric cases. This is output comparison, not a
proposal to accept or execute learner code.

### F2 — major, high confidence: ordered CRLF rules are contradictory

**Refs:** spec:234–247; request schemas in
`src/app/api/phase1/attempt/route.ts:9` and
`src/app/api/progression/assessment/submission/route.ts:19`.

Step 1 rejects every control character except LF, including CR. Step 2 then
converts CRLF and CR to LF. An implementation following the stated order rejects
Windows line endings before their explicitly intended normalization. Empty
“after normalization” is also tested before that normalization is defined.
Existing route `.trim()` transforms the submitted string before the evaluator,
so changing only the scorer would not preserve raw-output semantics.

**Smallest safe fix:** define raw length validation, CRLF/CR conversion, remaining
character validation, permitted boundary normalization, normalized limits/
emptiness, then exact comparison in one unambiguous sequence. Preserve the
raw response through type-aware request parsing; retain legacy parsing for
legacy items. Specify invalid-input handling before either grading path creates
an attempt or changes evidence. Test CRLF/CR acceptance and forbidden controls
independently, including the request-to-persistence boundary.

### F3 — major, high confidence: the first skill includes unrepresentable output

**Refs:** spec:226–240,395–403; `src/contracts/content.ts:62–65`.

The first skill expressly includes `print` with no arguments. That operation
produces a blank output line. A listing containing only that operation has no
nonempty answer after the proposed normalization; a blank line between other
prints violates the canonical constraint and would be discarded from a response.
Thus the first packet cannot completely assess its own stated output boundary.
The current answer schema also requires nonempty, trimmed strings.

**Smallest safe fix:** exclude argument-free `print` and empty strings from the
first scored packet. Alternatively, design a distinct explicit empty-output
representation and blank-line-preserving contract, with matching schemas and
tests, before including them. The exclusion keeps this increment smaller.

### F4 — major, high confidence: the interim error validator permits wrong claims

**Refs:** spec:276–297,417–418,430–432;
`src/content/answer-matching.ts:43–58`;
`tests/content/answer-matching.test.ts:45–85`.

The packet asks for both line and category, then says to score only category,
then requires both to be correct in the preferred contract. Its interim
category-only `composite.parts` path is unsafe even without line numbers:
a part accepting `NameError` also accepts `not NameError` or
`NameError or TypeError`, because matching is unrestricted substring inclusion.
Avoiding case-sensitive answers does not repair contradictory categories.
C6 is therefore not merely conditional on whether choices are displayed if
the required first packet retains line-plus-category questions.

**Smallest safe fix:** defer error spotting from the first output-reading packet.
For a subsequent error packet, use exact enum selection and, if asked, an
independently validated integer line number; require both. Define “no exception”
separately from “logic mistake,” and require an intended behavior before grading
a logic mistake. Do not require full traceback wording. Type questions should
likewise use exact `int`/`float`/`str`/`bool` tokens or choices, not printed value
equivalence or substring parts. No new choice UI is needed for output-only work.

### F5 — major, high confidence: blocker list inflates the issue-sized prerequisite

**Refs:** spec:337–385,414–432,443–444,516–525;
`src/content/catalog.ts:470–498`;
`docs/course-progression-decisions.md:680–710`;
`docs/development-expansion-plan.md:144–148`.

The blanket “C1–C11 are not implemented” blocker contradicts the conditional
requirements elsewhere. C8 publishes reviewed code and is unnecessary while
Python remains unavailable; C10 is explicitly not needed to author offline
teaching records; C6 can be deferred by not including error/type questions.
Approving all P0–P10 is also unnecessary to authorize one entry skill.
The actual role-specific catalog does not require exactly two practice records:
the two-record checks apply to legacy records, not a mandatory new-role count.
Therefore one output practice record can be the initial authored unit of work,
subject to the owner approving that scope.

**Smallest safe fix:** separate authoring-contract, serving, publication and
future execution dependencies. Retain shared D-61 and Python identity/domain,
presentation/scoring and draft-protection requirements; do not turn each C label
into a separate mandatory issue. Use synthetic fixtures to implement and test
one complete non-executing output slice before requesting a dated authoring
exception. Defer optional public rendering, choice/composite scoring and live
teaching delivery. If live learner teaching is promised, C10 becomes a genuine
requirement for that promise, not a blanket prerequisite for offline authoring.

### F6 — minor, high confidence: full-graph scope needs an explicit edge boundary

**Refs:** spec:142–151,391–393,443–444;
research dossier:118–145;
`docs/curriculum-authoring-playbook.md:49–56`.

The entry skill's empty prerequisite set is appropriate. However, H1 asks for
approval of core P0–P10 while describing it as the dossier's graph without
explicitly distinguishing competency coverage from its candidate edges.
The dossier labels that graph non-normative. In particular, ordinary function
parameters/return do not conceptually require iteration (P6 → P7), and basic
sequence indexing does not require user-defined functions (P7 → P8).
An acyclic graph check would not detect these unjustified barriers.

**Smallest safe fix:** explicitly exclude research edges from H1 approval.
Require observable conceptual-necessity justification for each later authored
edge, plus independent edge audit; separate teaching order from unlock rules.
This does not block the entry skill or require designing the full graph now.
Research arithmetic/keyboard assumptions are not verified placement or mastery
evidence, and must not become silent cross-program prerequisite gates.

## Confirmed safeguards and remaining evidence

- Source-only approval is recorded at `docs/curriculum-sources.md:103–109` and
  `docs/PROGRESS.md:92–105`; it does not select scope/version or lift D-61.
  D-61 requires its gate set and owner authorization; this review supplies none.
- CPython 3.14 is clearly a recommendation, not an approved pin. The recorded
  dossier supports its retrieval-date support status, but version-specific 3.14
  behavior still needs verification during authorized authoring. No new version
  research was performed; no entire-minor-version equivalence is certified.
- Program/domain gaps and whitespace-collapsing renderers are real:
  `src/contracts/program-codes.ts`, `src/contracts/curriculum.ts:10–40`,
  `src/app/components/activity-panel.tsx:92–122`, and
  `scripts/generate-curriculum-site.ts:89–102`. The proposed preserved code
  view, text alternative and disabled model hints are appropriate directions.
- Publication protection is a genuine prerequisite, not expendable scope.
  `src/content/publication.ts:13–20` excludes pending/assessment/review content,
  but the generator exposes unavailable-program skills when present
  (`scripts/generate-curriculum-site.ts:186–224`). Protection must include
  navigation, skill metadata and aggregate counts/standards, not just items.
  Keep Python unavailable and do not insert draft skills into a public
  projection before that protection is tested.
- Both real grading paths call the shared legacy matcher and store its
  normalized response (`src/phase1/service.ts:369`,
  `src/progression/assessment-submission.ts:350`).
  `AttemptEvidenceSchema` permits evaluator version
  (`src/contracts/attempt.ts:37`), but these writes do not currently record one.
  Future dispatch must preserve legacy behavior and make evaluator provenance
  persistent through the real evidence path, not only a schema fixture.
- Teaching creates no mastery evidence; deterministic attempts must support
  parent claims. Authored hand traces and independent re-derivation support
  content review, not learner mastery. No execution or LLM-authoritative scoring
  is proposed or authorized. Held-out records remain private and separately gated
  (`src/assessment/private-package-store.ts:104–105,173–178`).
- Current research SHA-256 is
  `87364b003ad248b12d01b588fe3ac4aa1c5dad5b7dd63dfc093668d1aaa5f56f`;
  current research-review SHA-256 is
  `c880c32d9db8931e700a17706366bb1f56ea3972a2d263cac766bdc3d49f4808`.
  They match the specification. The prior reviewer pinned
  `c0d2fe44b61a6fdbabe4e84ac3fff6915c80e7ae59f8ecc1e84c9326124ac3cb`.
  No sibling original Python worktree was identifiable among Python-named
  sibling directories. The approval-header delta is therefore not independently
  diff-verified here. Obtain coordinator confirmation; do not characterize that
  administrative hash difference as evidence of changed source substance.

## Minimal choices and dependency split

**Human choices:** approve only the bounded entry competency and role/count
scope; choose the Python minor version; authorize clearly labelled internal
objective codes/link-only original-content posture; and record the dated D-61
exception/lift with the required owners and held-out yes/no scope. Depth, full
P0–P10 edge approval, execution and learner availability can remain undecided.

**Shared prerequisites:** existing D-61 gate evidence; draft/publication
protection; reviewed role/version/provenance contracts; deterministic evidence
and legacy-regression boundaries. Reuse rather than fork these mechanisms.

**Python-specific prerequisite slice:** unavailable registry identity and
namespaced domain; pinned static code listing; corrected case/whitespace-safe
output validator and catalog checks; preserved request/response handling;
accessible learner rendering when that surface is in scope; and no-model-hint
enforcement before any Python item can reach tutoring. Start with one skill and
one nonempty output practice record after authorization, optionally an offline
teaching record if explicitly included. No actual records are authored here.

## Validation and limitations

- `shasum -a 256 docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md`:
  passed, exact packet hash. Source/review hashes independently checked.
- Existing main-installed Vitest, invoked from this worktree against
  `tests/content/answer-matching.test.ts`,
  `tests/content/held-out.test.ts`,
  `tests/curriculum/progression-schema.test.ts` and
  `tests/curriculum/skill-catalog.test.ts`: initial startup failed because
  worktree dependency resolution could not find `vitest/config`.
- Retrying with `NODE_PATH=/Users/navoditkaushik/GitHub/learning-forge/node_modules`
  ran 13 matching tests successfully; three other suites could not load `zod`.
  These are isolated-worktree dependency limitations, not specification defects.
- Exact successful standalone command:
  `NODE_PATH=/Users/navoditkaushik/GitHub/learning-forge/node_modules /Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/vitest run tests/content/answer-matching.test.ts --reporter=dot`:
  **passed, 13 tests**.
- Coordinator reports corrected main source-label tests **43 passing**.
  That is coordinator evidence, not this review's execution. No older copied
  source-label failure is treated as a new issue.
- Report-only formatting command:
  `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null /Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/authoring-prereqs-python/docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010-review.md`.
  **Passed.** Python standard-library inspection of the owned report also
  passed: no trailing whitespace and a final newline.
- No installs, full build, database/integration/browser/provider calls or Python
  snippet execution. Proposed Python tests do not yet exist; this advisory
  document cannot claim their execution or future behavior verification.

**Next issue:** correct and re-review the bounded output-only contract, then
implement its synthetic-fixture slice without content or availability changes.
**Original recommendation:** not ready for human review until F1–F5 are resolved.
That historical recommendation is superseded by the revision 2 re-review above.

**Current recommendation: ready for human review with noted risks.**
This is not human approval of any gate.
