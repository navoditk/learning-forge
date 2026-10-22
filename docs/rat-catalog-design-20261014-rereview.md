# RAT-CATALOG-DESIGN rev2 — changed-scope review

## Disposition

**Ready for human review with one nonblocking minor R-3.** Original R-1/R-2
closed at document level; no blocker or major remains in reviewed scope.
Native Codex forge-reviewer, host-selected `gpt-6.1-sol`, same reviewer
`/root/rat_catalog_design_review`. Returned read-only to integrator; no owner
choice, application, implementation or release approved.

## Provenance and frozen scope

Verified lane A AWAITING_REVIEW rev2 assignment, HEAD
`3e7c33372599d20c285656c3610ca6e47743240f`, all six rev2 artifact hashes and
unchanged rev1 document/patch. Rev2 document
`43afa38e47fc4c8b8111f9e969eef2bdd0678872ae13a550f3e5a3cea07dfc5b`;
patch `0dc5605e6469cc796f3c0f73348a2b2fdb42c6963e7ebbbaaaef3c74267acd8e`.
Original author transcript metadata:165/165 assistant records
`claude-opus-5-5`, final UUID `2c57b217-9256-4868-befb-d19a8e881548`,
time `2026-10-15T03:54:22.902Z`. All25 preserved baseline and37 carried HEAD
pins verified;24/25 live baseline inputs unchanged. Decision drift adds D-167
and updates count, without catalog implementation/C-7/IC-9/release permission.
Accepted dirty source hashes match rev2 pins and relevant resolution behavior.
Packet pin predates integrator rev2 return/relay update; live explicit rev2
assignment and frozen hashes agree.

## Original finding closure

| Finding   | Result                             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 major | Closed at document level           | §5.6 lines411–490 defines immutable public probe snapshots independent of active content. Old placement resolves original id/version/hash; new assignments require eligible unit and exact currently servable snapshot items. Missing snapshot/digest mismatch/absent selected identity fail closed without substitution/repinning. PH-1–PH-5 cover counterexample, positive control and failure cases. §5.1 separates placement/private resolution; §10 qualifies completion and pre-implementation constraint. |
| R-2 minor | Closed for original counterexample | ID-2, §3/§3.1/§4 distinguish registered history from retired extension stubs. Pilot history/new versions coexist without indexing stubs or mutating pilot membership; ownership/coverage validator remains satisfiable. Reserved-label rejection/stub exclusion have negative control and later RL-1 case.                                                                                                                                                                                                       |

These are design conclusions. Snapshot implementation and PH/RL runtime
acceptance evidence remain deferred to authorized implementation.

## R-3 — Minor, high confidence; regression: inventory scope overstatement

Frozen `docs/grade-6-math-catalog-versioning.md` lines203–214 says registered
records are "today exactly the pilot records" and Git-exposed unregistered
records "today exactly" the two Ratios extension lessons. However,
`src/curriculum/course-catalog.ts:130`–135 includes the entire PROGRAM_REGISTRY,
including other programs. Committed unregistered Grade6 records also exist in
`src/curriculum/number-system-catalog.ts`, already among carried pins.
Universal criteria conflict with exhaustive inventories; two-entry reserved
list leaves other matching labels unclear. Violates accurate code-derived
inventory and internally consistent identity/registration requirements.

Minimal correction: scope inventories and retirement instructions to Ratios
records affected by this transition, using scoped examples; alternatively
accurately distinguish remaining records without broadening integration.
Acceptance: consistently classify pilot/two retired stubs, acknowledge other
registered programs and disconnected records, and avoid indexing or retiring
other units accidentally. Correction belongs to original Opus author.

Nonblocking because original Ratios counterexample is corrected and
membership criterion remains stated; does not invalidate historical-resolution
derivation. Owner may explicitly accept this disclosed limitation or return it
for correction before artifact acceptance. Any changed bytes need targeted
review; no hidden waiver.

## Checks, coverage and next gate

Prettier stdin, git apply --check, git diff --check and exact in-memory patch
reconstruction passed. Document unapplied. Reviewed rev1→rev2 diff, original
counterexamples, closure/positive controls and coupled catalog/probe/state
rules. No new major, unresolved original failure or first-pass miss verified.
No edits, agents, installs, private/learner/database/provider/runtime suites.

Owner gate: exact rev2 acceptance/application with explicit R-3 disposition.
P-A/H-1 remain proposals; C-7, OC-2–OC-5, MV-2 and IC-9 separate. Alternatives
changing bytes return to original author and changed-scope verification.
