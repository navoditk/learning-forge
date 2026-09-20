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

The package must contain four banks, all at version `1.0.0`:

| Bank | Target | Items per attempt | Required no-reuse pool |
|---|---|---:|---:|
| `ratio-language-lesson-bank` | `ratio-language-lesson` | 3 | 9 |
| `unit-rates-lesson-bank` | `unit-rates-lesson` | 3 | 9 |
| `ratio-tables-lesson-bank` | `ratio-tables-lesson` | 3 | 9 |
| `ratios-proportional-reasoning-unit-bank` | `ratios-and-proportional-reasoning` | 6 | 18 |

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
