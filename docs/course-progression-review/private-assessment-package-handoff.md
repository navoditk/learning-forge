# Private Grade 6 Math assessment-package handoff

**Status:** Required external artifact — not present in the repository.

This document specifies the package needed to enable assessment serving for the
three-lesson Grade 6 Math pilot. It intentionally contains no prompts, answers,
learner data, or held-out content.

## Required package

Mount the reviewed JSON package outside the repository and set:

```text
LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH=/secure/private/grade-6-math-assessments.json
```

The package must contain these four banks, all at version `1.0.0`:

| Bank | Target | Items per attempt | Required no-reuse pool |
|---|---|---:|---:|
| `ratio-language-lesson-bank` | `ratio-language-lesson` | 3 | 9 |
| `unit-rates-lesson-bank` | `unit-rates-lesson` | 3 | 9 |
| `ratio-tables-lesson-bank` | `ratio-tables-lesson` | 3 | 9 |
| `ratios-proportional-reasoning-unit-bank` | `ratios-and-proportional-reasoning` | 6 | 18 |

The package may also contain six skill banks. The loader validates them when
present; when absent, the corresponding assessment kind fails closed. Their
contents are pinned by hash in `src/curriculum/pilot-catalog.ts`.

| Bank | Target skill | Item role | Items per attempt | Required pool |
|---|---|---|---:|---:|
| `<skill>-review-bank` (×3) | `ratio-language`, `unit-rates`, `ratio-tables` | `review` | 1 | 3 (D-50 as amended by D-67; reuse after two runs) |
| `<skill>-delayed-check-bank` (×3) | `ratio-language`, `unit-rates`, `ratio-tables` | `assessment` | 2 | 6 (D-63) |

**Draft status (2026-09-24).** Model-assisted drafts of all 27 skill-bank
items (D-66) are in the private draft package v2, outside the repository. They
are `pending_review`. The v2 file adds the six skill banks and leaves the
original four banks byte-identical to the v1 draft.

Two issues found in the pre-existing v1 draft must be resolved during content
review:

- **Unit bank coverage.** All 18 unit-bank items are tagged
  `ratio-language`, so the loader's per-skill coverage rule rejects the unit
  bank.
- **Hash drift.** The repository's pinned hashes for the four lesson and unit
  banks do not match the current v1 draft. They must be re-pinned from the
  reviewed package.

The six skill-bank hashes pin the `pending_review` drafts. `review.status` is
part of each hashed item, so **every** bank, including the skill banks, must be
re-pinned from the reviewed package before any of it can serve.

Draft-quality notes from the independent re-review, already applied in v2:

- Two near-duplicate delayed-check items were replaced.
- Accepted answers were broadened for exact-match scoring (cents, leading
  decimals, word and fraction forms, spaced ratios).
- Leakage patterns now list every accepted form.

Content reviewers should still add any other equivalent answer form they
expect learners to use.

The pool sizes follow the approved pilot volume and no-reuse reassessment
policy. Every item must reference its containing bank and include its own
content hash. The loader rejects malformed packages, mismatched bank refs, and
missing banks; it never falls back to public practice content.

## Content-owner checklist

- [ ] Every item is original or has an approved license and provenance record.
- [ ] Every item has `review.status: reviewed`, reviewer, review date, and
      originality/licensing statement.
- [ ] Every item has a deterministic validator, solution representation, and
      misconception metadata.
- [ ] Every item has accessibility notes and an accessible alternative.
- [ ] Every item is held out from the public practice/content catalog.
- [ ] Independent mathematical/content review is complete.
- [ ] Package version and SHA-256 digest are recorded in
      `manual-gate-record.md` without publishing the package itself.

## Validation and rollout

1. Validate the package against `PrivateAssessmentPackageStore` in staging.
2. Run the staging shadow pilot and export the redacted readiness report.
3. Complete the independent C1–C3 review and divergence dispositions.
4. Record the package digest, access-control confirmation, and rollback owner
   in `manual-gate-record.md`.
5. Enable the package in the canary environment only after the C4 runbook
   prerequisites are approved.

The package must not be committed to Git, copied into screenshots, included in
logs, or exposed through the public review page.
