# Shared course catalog — independent implementation review

Scope: D-75 mechanical catalog foundation at
`a7022ea71ef95b884d023d6eb9027f4682634be5`.
Reviewed diff SHA-256:
`530bdfbd95bf5695cef2553377b14b3f33bcedfa8b458beae1069246e857e00a`.
Executor actual `claude-sonnet-5.5`, verified Copilot read metadata for
`f19692b7-ab19-40fc-82a0-90ff2dbba278`. Reviewer explicitly selected
`gpt-6.1-sol` in a fresh Copilot review context; Claude/GPT independence.

**Recommendation: ready for human review with noted risks.**
No blocker/major in active Grade 6 substitution. One minor, high-confidence
factory inconsistency at `src/curriculum/course-catalog.ts:66-78`:
schema parsing trims a whitespace-containing bank code, but indexes use raw
strings. Thus factory validation succeeds while lookup by canonical ref fails.
Reject normalized identifiers/references rather than cloning production
records, and add regression coverage before integration.

Reviewer independently verified production identity/order/digest, exact
reference selectors, registered-only claims and enabled unitless behavior.
No policy, content, registry, scoring, completion, authorization, flags,
manifest or private-package changes. Deferred coupling remains documented.

Evidence:

- Diff whitespace check passed.
- Ten changed TypeScript files passed formatting.
- Handoff formatting check found pre-existing baseline formatting only.
- Independent pure Vitest execution: six curriculum files/47 tests and
  five exact progression files/22 tests passed.
- Independent assertions verified identity, ordering, schema/ref/ownership
  rejection and reproduced the normalization inconsistency.
- No database, builds, e2e, private banks or provider calls.

Executor full-test/type/lint results remain supplied evidence, not independent
reruns. Original implementer received the minor fix and durable regression
requests; changed scope must be reviewed before integration.
No human release or authoring approval follows.

## Corrected patch and coordinator integration

Corrected worker diff SHA-256:
`516382bd9124f5709e2ac4e053c08cfa31284a0a5a9ffe76e2e32438ab746cac`.
Coordinator GPT-6.1 Sol independently read the changed factory and regression
tests: parsed-versus-original deep equality now rejects schema normalization,
including nested references, while preserving canonical production identity.
The reported minor is closed. Missing/malformed/ownership and reordered
selector behavior are durably covered.

Patch hash matched before conflict-free integration into main at `a7022ea`.
Coordinator removed an unnecessary `as never` in the malformed-record test
using ordinary structural typing; no production behavior changed.

Main validation:

- `npm test`: 77 files, 1,547 tests passed.
- `npm run typecheck`: passed, including after test typing cleanup.
- `npx vitest run tests/curriculum/course-catalog.test.ts`: 15 tests passed
  after cleanup.
- Changed-source/test Prettier check: passed.
- `npx eslint src/curriculum src/progression tests/curriculum`: passed.
- `npm run db:check-down-migrations`: passed; file check only, no DB access.
- `npm run build`: passed.

No integration/database/e2e/provider commands, new courses, policy changes,
content edits or migrations. Integration is under D-75; release is not
authorized. Import-time canonical validation is intentional; future metadata
must be canonical. Bank-kind, historical activation and remaining route/store
coupling remain separate future increments.
