# RAT-CATALOG-DESIGN — Ratios catalog and historical-version contract

> 2026-10-20 integrator annotation: IC-9 is decided by D-176 (option A,
> 2026-10-15). Any "pending" IC-9 wording below and in the accepted design
> document is historical; the frozen artifact is not edited.

## Live relay

- Phase: **DONE** — owner accepted exact rev2 and patch application with
  nonblocking R-3 acknowledged on 2026-10-15; applied, uncommitted.
- Next client/role, lane A: **Claude Code forge-implementer / Sonnet**, the
  already-authorized [PRACTICE-RELEASE](PRACTICE-RELEASE.md) readiness task.
- Author provenance: original Opus165/165 verified, rev2 details below.
- Main HEAD: `3e7c33372599d20c285656c3610ca6e47743240f`.
- Applied output: rev2 `43afa38e...dc5b`, patch `0dc5605e...acd8e`.
- Approval: owner **"approve"**, 2026-10-14, to PRACTICE-FIRST batch IC-6–IC-8;
  recorded separately as D-164, D-165 and D-166. IC-9 has no A/B/C selection
  and remains pending. It does not block this document-only design.

## Owned scope and boundaries

Author exactly one new document: `docs/grade-6-math-catalog-versioning.md`.
Use accepted Ratios plan §5.1 RAT-CATALOG-DESIGN and D-149–D-166 to define
program/unit/lesson/bank version coexistence and exact historical resolution
for references, claims, content identities and state; C-6; extension lesson
labels; misconception-list version implications; a proposed teaching storage/
loader path. Trace each rule to actual public code/schema and approved values.
Read D-62/D-64/D-68/D-70/D-71 explicitly. Do not assume an old plan describes
current behavior. Account for assignment-route PILOT constants and all callers
of the catalog/state interfaces consumed by the design.

Present C-7 learner-state transition options and concrete consequences without
choosing or applying one. Preserve immutable pilot 1.0.0 bytes and old exact
identities. D-151 places conversions under unit-rates@1.0.0; D-152 keeps DNL
1.0.0 and explicitly retains any older arithmetic-only evidence; D-153 calls
for new lesson versions and corrected references. Never assert actual learner
evidence exists: no learner data was queried.

D-164 targets per extension lesson: one teaching, six practice and nine
lesson-bank items; per skill: three review and six delayed-check items.
Unit-bank count deferred, optional second DNL teaching record unselected.
Values alone do not authorize authoring. D-165 separates teaching authoring/
review from serving; Grade 6 teaching adoption and relevant T3/T4 decisions
remain closed. Propose storage before later scoped authoring; preserve honest
not-served release claims. Existing teaching contract covers five D-75
programs and must not be silently extended to Grade 6.

No source, registry, content, schema, learner-state or database edits; no
private-package reads (including private item files), learner data, provider
calls, bank registration/merge, content generation, migration, activation,
deployment, release, commit or push. Public private-package-store source may
be inspected. Use only already-approved metadata; D-61 exception: **none**.
Legacy 23 UNMET and IC-9 risk remain unresolved, not repaired by version design.
RAT-CATALOG-IMPL/content/private access/teaching serving need later scopes.

## Intake and isolated baseline

Read live index, AGENTS and orchestration terminal-handoff/accountability/
batching rules first. Read course-progression handoff in its specified order,
latest PROGRESS plus Resume here/Current status, README and relevant numbered
docs; then accepted integration/reconciliation/Ratios plan, subject report,
scoring contract and decisions. Inspect the public inputs listed in manifest.

Common Git metadata bundle (local only):
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-CATALOG-DESIGN`.
Input manifest: `input-manifest.json`, SHA-256
`b1fdb9daa9fd8430b45fa38dae5992a3aaca731e25d9ea55310da9dbcbd8b59c`.
It records 25 exact inputs and main HEAD. `baseline/` contains byte-exact
copies, including untracked accepted documents and dirty source inputs.
Verify manifest hash and every file hash before consuming. Recreate an isolated
worktree at recorded HEAD and overlay only manifest paths; a clean worktree
alone lacks these accepted inputs. Do not reset or overwrite main's dirty tree.
If more public dependencies are needed, pin their exact hashes with evidence;
changed authority/input bytes require integrator reconciliation, not silent use.

Acquire checked atomic worker claim `RAT-CATALOG-DESIGN.lock` under common
Git `agent-claims/` before writing. On failure wait for owner. Record role,
actual model provenance, owned document, worktree and time only after successful
mkdir. You are not alone: preserve others' edits. One bounded author worker;
parent coordinates without duplicate design. Only integrator edits shared
index/packets/PROGRESS/decisions. Worker returns artifacts and evidence.

## Acceptance evidence and stop

Return a requirements-to-evidence self-audit in the evidence bundle: contract
locations, public code references, concrete positive/negative/historical
examples, contradictions checked, actual manually derived results and
remaining owner choices. Cover same-ID/different-version resolution, old and
new lesson coexistence, bank/claim historical refs, changed active version
with existing state, teaching absent/not served and each C-7 option. Do not
call document examples executable runtime evidence. Distinguish approved
policy from proposals and deferred decisions. No runtime/full suite repeats.

Run targeted `npx prettier --check --ignore-path /dev/null
 docs/grade-6-math-catalog-versioning.md` (single shell command) and
`git diff --check`. Freeze exact one-document patch, document SHA-256,
manifest, author metadata evidence and self-audit under this common Git bundle.
Do not copy full client sessions or secrets. Author stops writing; integrator
checks output and changes phase to **AWAITING_REVIEW**. Next **Codex native
forge-reviewer / gpt-6.1-sol**, fresh context, cross-family comprehensive first
review. Human acceptance and patch application remain separate named gates.
Corrections return to original Opus author; review changes/original
counterexamples/closure/direct regressions only, with finding classification.

## Recovery fallback

In Claude Code type **continue**. If automatic intake is unavailable:
"Read docs/coding-agent-handoff.md and RAT-CATALOG-DESIGN; verify the live
relay, D-166 scope and input manifest, then use native forge-expert/Opus for
its one-document design, freeze evidence and return to Codex review."

## Revision 1 returned (2026-10-14)

Bundle `.git/agent-handoffs/RAT-CATALOG-DESIGN/` (`baseline/` and
`input-manifest.json` untouched):

| Artifact                                                    | SHA-256                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `final/docs/grade-6-math-catalog-versioning.md` (568 lines) | `6d4e9b309760ec46e69adae470a8b0e40255566343527bfe7b7ee0cf15422608` |
| `RAT-CATALOG-DESIGN.rev1.patch` (one new file)              | `a07d1c82093cb046b8a73b57da7f57286d7e11416c4d3c5503473cfda43f3c1a` |
| `freeze-manifest.rev1.txt` (+37 extra public pins)          | `e259520d8a7a7b1fcdefe8984cf9fb5bdb06fbaccaf6cd7576629ba9bfae8481` |
| `self-audit.rev1.md` (21 requirements mapped)               | `ff066055489c9909652e1e2a7e78f544b1d9094775009bc1293d3b47d6298fa1` |
| `claim-meta.rev1.released`                                  | `d3faf094a4c0922cea039947773aa686ee99ebaf1cb8455bff5532bca19fcc58` |

Outline: §0 labels (OBS/APP/PROP/OWNER/MISS/CONF); §1 current behavior and
caller table incl. assignment-route `PILOT_*`; §2 identity rules ID-1–ID-7;
§3 C-6 options P-A–P-D (P-A proposed: `grade-6-math@1.1.0`, all versions
indexed, explicit active selection); §4 proposed labels; §5 historical
resolution, bank options L-1–L-3; §6 state continuity, D-151/D-152; §7
misconception options M-A–M-C (M-C proposed for Ratios); §8 teaching storage/
test-only loader proposal, not served, D-75 contract not extended; §9
RAT-CATALOG-IMPL/RAT-INTEGRATE guidance; §10 C-7 options A–D, not chosen;
§11 owner choices/gaps.

Author-reported code-derived conflicts: `programByCode` first-match vs
registry Map last-match; silent non-write when target absent from
`COURSE_CATALOG`; assignment route pilot arrays; placement-probe fallthrough
vs D-152; D-70 item-id reuse not enforced; version-keyed D-71/D-27/ordinal
history; teaching records in `rawContent` would throw. Open owner choices:
C-7, OC-2 (L-1/L-2), OC-3, OC-4, OC-5, MV-2, IC-9, P-A acceptance. Gaps:
unit-bank floor vs D-148 supplement; D-148 identities/digests and archive/
learner-state coverage MISS (no data queried); Legacy 23 UNMET unresolved.

Integrator verification: all five hashes; `git apply --numstat` one new file
(568 lines); `git apply --check` on main OK; patch reconstructs the frozen
document in an empty repo; Prettier (stdin) passes; 25/25 live inputs still
match; document absent from main; `.git/agent-claims/` empty; worktree gone.

Reviewer attention: the 37 extra pins hash HEAD bytes. Three cited files have
accepted uncommitted main edits (`src/content/catalog.ts`,
`src/phase1/service.ts`, `src/progression/assessment-submission.ts`); the
author states only line numbers shift (offsets in freeze manifest line 50)
and no cited catalog/state call changes. Confirm against the dirty baseline.

## Revision 1 independent review — 2026-10-14

Report: `docs/rat-catalog-design-20261014-review.md`; native Codex
forge-reviewer/gpt-6.1-sol, fresh context. CHANGES_REQUESTED: R-1 major,
R-2 minor, both high confidence. Five artifact hashes,25live/baseline inputs,
37HEAD pins and actual Opus144/144 verified. Three accepted dirty source
files preserve relevant lookup behavior; offsets differ. No runtime suites.

- R-1: preserve original pinned public placement items independently of
  active practice membership; separate historical resolution from new probe
  construction. Update coupled assignment/result and C-7 in-flight guarantees.
- R-2: distinguish immutable Git-exposed labels from registered runtime
  versions. Exclude retired extension stubs from index while retaining their
  labels and registered pilot history; validator must remain satisfiable.

Original author returns finding/root-cause/locations/before-after/positive
control/regression/status table and updated self-audit, concrete document
examples plus required later synthetic acceptance cases. No implementation.
Freeze rev2 exact one-document patch and evidence; preserve rev1. Integrator
reconciles new consumed inputs. Same Codex reviewer then checks changed scope,
original counterexamples and directly coupled regressions, classifying new
findings. Existing approvals/exclusions and pending owner choices unchanged.

## Revision 2 returned (2026-10-15)

Original Opus author resumed (lane A). Integrator-verified transcript
`agent-a36ae9d0de9a178b3.jsonl`: 165/165 assistant records
`claude-opus-5-5`, last `2c57b217-9256-4868-befb-d19a8e881548`
`2026-10-15T03:54:22.902Z`. Rev1 artifacts unchanged.

| Artifact                                                         | SHA-256                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `final-rev2/docs/grade-6-math-catalog-versioning.md` (702 lines) | `43afa38e47fc4c8b8111f9e969eef2bdd0678872ae13a550f3e5a3cea07dfc5b` |
| `RAT-CATALOG-DESIGN.rev2.patch` (one new file vs `3e7c333`)      | `0dc5605e6469cc796f3c0f73348a2b2fdb42c6963e7ebbbaaaef3c74267acd8e` |
| `freeze-manifest.rev2.txt`                                       | `2dc969459e4ef6878164f0d3d83bcb4673a998be1faa179968ab8800d9dbee60` |
| `self-audit.rev2.md`                                             | `23d64aa9593572b0ecddc0778f6ef070888cca477e39456e15c641d584aaf181` |
| `closure-evidence.rev2.md`                                       | `f977452258ad3d45eee2d634aa5836ec3b50eb4e46835c8615fdf2f154e123d8` |
| `claim-meta.rev2.released`                                       | `2e526c98c22c2602f3bc9b6492958d90b330e9f30a4b67e117d63c567f5673cd` |

Closure claims: R-1 — new §5.6 option H-1, immutable public probe snapshot
per registered unit version; unfinished placements resolve only from it;
missing snapshot, byte mismatch or absent `id@version@hash` fail closed with
no substitution or repinning; new placements from registered composition only
while every pinned item is servable at exact version/hash; until H-1 exists,
changing any lesson's first practice item is forbidden. H-2 (archive) and H-3
(never remove probe items) listed. §5.1 separates placement from held-out
assignment resolution; §10 in-flight guarantee qualified. R-2 — ID-2 now
distinguishes registered (indexed), Git-exposed reserved (never reused,
indexed or activated) and reference-only labels; new §3.1 shows the
unchanged ownership validator satisfiable with pilot 1.0.0 plus proposed
2.0.0 records and failing when a stub is added. Required later synthetic
acceptance cases PH-1–PH-5 and RL-1. Sections changed: status, §2, §3/§3.1,
§4 rows, §5.1/§5.5/§5.6, §9–§11, new §12. No C-7, owner choice, approved
value, IC-9 or Legacy 23 UNMET change claimed.

New pins (live main bytes): review report `35507654...2753`; packet
`9d6e3f11...c897`; accepted dirty `src/progression/assessment-submission.ts`
`c61524c4...d844`, `src/content/catalog.ts` `a45d15bd...4c8b`,
`src/phase1/service.ts` `5b127635...b0af`; HEAD-equal store, placement-probe,
archive, progression/extension/pilot catalogs (full list in freeze manifest).

Integrator verification: all six hashes plus unchanged rev1 document/patch;
`git apply --numstat` one new file (702 lines); `git apply --check` on main
OK; empty-repo reconstruction reproduces `43afa38e...dc5b`; Prettier (stdin)
passes; cited dirty/HEAD source pins match live bytes; document absent from
main; lane-A lock and worktree removed (lane-B lock untouched).

Input drift for reviewer: 24/25 rev1 manifest inputs still match.
`docs/course-progression-decisions.md` changed after baseline only by
appending D-167 (lane preparation permission; explicitly no C-7/IC-9/catalog
implementation) and the decision-count line. Integrator judges this
non-substantive for this design; reviewer confirm.

## Revision 2 changed review and ready owner gate

Same native forge-reviewer/gpt-6.1-sol returned ready with one nonblocking
minor R-3. Report: `docs/rat-catalog-design-20261014-rereview.md`. R-1/R-2
closed for original counterexamples at document level; PH/RL runtime evidence
still belongs to later authorized implementation. Six hashes, Opus165/165,
baseline/HEAD/dirty pins verified. D-167/status drift qualified, not gate drift.

R-3 is a regression: lines203–214 incorrectly describe the Ratios pilot and
two stubs as exhaustive global registered/unregistered inventories. Other
registered programs and disconnected Number System records exist. Minimal
original-author correction scopes wording/retirement to affected Ratios
records; no other program should be indexed or retired. See full report for
counterexample and acceptance condition.

Ready named gates (no approval inferred):

| Gate   | Exact action / recommendation                                                                                                                           | Scope and limits                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RAT-A1 | Accept exact reviewed rev2 contract as a design artifact                                                                                                | P-A/H-1 and other labeled proposals remain proposals; this is no owner C-7/OC/MV/IC-9 choice.                                                                                                                                              |
| RAT-A2 | Authorize exact one-document patch application, SHA0dc5605e...acd8e                                                                                     | No code/catalog implementation/content/DB/release.                                                                                                                                                                                         |
| RAT-A3 | Explicit R-3 disposition: accept rev2 with the disclosed nonblocking inventory wording limitation, or return scoped wording correction to original Opus | Recommendation for acceptance path: acknowledge limitation explicitly; implementation must use membership criterion and never use two-entry inventory as global. Choosing correction instead preserves approvals pending new bytes/review. |

These gates can be accepted together with Science ready recommendations,
individually, or overridden. No later execution or unknown future artifact
approval is bundled. Do not apply until owner has explicitly selected gates.

## Owner disposition and application — 2026-10-15

Owner **"approved both"** accepts RAT-A1, authorizes RAT-A2 and selects RAT-A3
acceptance with disclosed R-3 acknowledged. These are distinct dispositions;
no wording changed. P-A/H-1 and other labeled proposals remain proposals;
no C-7/OC/MV/IC-9 selection or catalog implementation permission inferred.
Implementation must use actual membership criteria, never the erroneous
global two-entry inventory, and preserve other programs/disconnected records.

Integrator verified frozen hashes/base, absence of target and apply-check;
applied exact one-document patch0dc5605e...acd8e. Main document matches
43afa38e...dc5b byte-for-byte. Targeted Prettier/git diff --check pass.
No runtime suites/database/provider/private work or commit/push. R-1/R-2
remain document-level closures with later implementation evidence required.
Next laneA task is separately authorized PRACTICE-RELEASE preparation,
Claude Code forge-implementer/Sonnet; no release/deployment approval.
