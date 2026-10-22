# RAT-CATALOG-DESIGN rev1 — independent review

## Disposition and provenance

**CHANGES REQUESTED: one major R-1, one minor R-2.** R-1 prevents readiness.
Reviewer: native Codex forge-reviewer, host-selected `gpt-6.1-sol`, fresh
context `/root/rat_catalog_design_review`. Return corrections to original
Claude Code forge-expert / Opus. No owner choice, implementation or release
approved by review.

Live relay AWAITING_REVIEW and HEAD `3e7c33372599d20c285656c3610ca6e47743240f`
confirmed. Five artifact hashes match packet, including document
`6d4e9b309760ec46e69adae470a8b0e40255566343527bfe7b7ee0cf15422608` and patch
`a07d1c82093cb046b8a73b57da7f57286d7e11416c4d3c5503473cfda43f3c1a`.
Input manifest and 25/25 baseline/live inputs match; 37/37 extra pins match
HEAD. Claude transcript metadata independently confirms 144/144 assistant
records `claude-opus-5-5`, recorded final UUID/timestamp. No full session copied.
Accepted dirty content/catalog, phase1/service and assessment-submission
changes preserve relevant catalog/state lookup behavior; cited lines shift.
Patch reconstructs frozen document exactly in memory, apply/whitespace checks
pass; Prettier stdin check completed. Design remains unapplied.

## R-1 — Major, high confidence: historical placement depends on active content

Frozen `docs/grade-6-math-catalog-versioning.md:299`–307, coupled with 499–500.
The contract retains old units and promises in-flight 1.0.0 completion, but
omits preservation of public placement-probe items.

`placementProbeBank()` resolves references only against `servableContentCatalog`
(`src/progression/placement-probe.ts:50`–68). `placementProbeBankFor()`
reconstructs from that projection (:97–104). `createAssessmentStore()` uses
this before private-store fallback (`src/assessment/store.ts:76`–81).
Submission requires selected exact ID/version/hash
(`src/progression/assessment-submission.ts:483`–492). These paths do not use
ContentArchive.

Counterexample: unfinished synthetic unit1.0.0 placement selects
ratio-language-1@content-1. Later authorized update archives that version and
replaces its loader entry, permitted by ID-7. Old unit retention does not
resolve the old first reference from active content; the private package has
no corresponding public probe bank. The placement cannot finish despite the
archived item remaining available. Violates assigned exact historical
resolution, V-5 and §10 in-flight completion guarantee.

Correction: define immutable public probe snapshots or exact archived-item
resolution with verified pins, independent of active serving eligibility.
Separate historical resolution from new assignment composition. Correct the
general assignment/result package-resolution rule to acknowledge placement.
Acceptance: derive and require a later synthetic implementation test proving
old placement serves/scores original pinned item after active removal; new
placement uses new approved composition. Missing/mismatched historical bytes
fail closed, without substitution or repinning.

## R-2 — Minor, high confidence: published includes excluded stubs

Frozen document lines 199–207, 245–248, 278 and 306–311.
ID-2 defines published as including committed catalog modules; P-A indexes
every published lesson version. That includes committed extension1.0.0 stubs,
although §4 retires those unregistered versions.

Counterexample: RATIOS_EXTENSION_LESSONS has committed1.0.0 lessons referencing
pilot unit1.0.0, which does not list them; their banks are absent. Inclusion
fails existing membership/bank validation; exclusion contradicts literal
retention. Violates internally consistent, representable contract and frozen
pilot preservation/unregistered-stub exclusion.

Correction: distinguish immutable Git-exposed labels from runtime-registered
versions. Retain historical registered versions; preserve retired stub labels
without runtime indexing/activation. Acceptance: retain registered pilot
history and admit proposed new versions while excluding retired stubs;
forbid stub-label reuse and keep unchanged ownership validator satisfiable.

## Coverage and limitations

Reviewed identities, program/index/active selection, historical refs/claims,
versioned state, assignment-route constants/callers, bank retention/options/
volumes, placement, D-151/D-152 continuity, misconceptions, teaching isolation,
C-7 options and owner gates. Checked21-row self-audit against public code/schema
and decisions. P-A, labels, bank choices, teaching sequencing, misconception
policy and C-7 remain proposals/owner choices; presentation alone is no defect.
IC-9, Legacy23UNMET, private metadata, archive coverage and actual learner-state
existence remain disclosed limitations.

Read-only review: no files changed, agents/installs/private packages/learner/
database/provider/runtime suites used. Counterexamples are static derivations.
Follow-up reviews diff, original counterexamples, closure/positive controls and
directly coupled regressions; retain finding IDs and classify further findings
under orchestration accountability rules.
