# SCI6-PREREQ — unavailable Science schema and validation prerequisites

> **DONE — accepted and integrated, 2026-10-15.** Owner "accept and approve"
> accepts exact rev3 and authorizes application/validation. All8main digests
> match. Isolated integrated npm run verify passed94files/2,016tests/build.
> No Science availability or content records added; uncommitted. Next named
> role: Claude Code forge-expert/Opus for SCI6-DRAFT; owner engineering
> sign-off recorded2026-10-15. No content registration or release approved.

## Live relay and authority

- Phase: **DONE** — SCI6-P-A1 acceptance and SCI6-P-A2 application/
  integrated validation approved by owner "accept and approve",2026-10-15.
- Applied exact full-replacement rev3 patch SHA-256
  `931133dd5be21caec847d6d396c6814decb62758aa8ee4cb0d344c4bd5db6fa7`;
  all8final hashes match reviewed bytes; uncommitted.
- Integrated database-free verify: isolated checkout at main059c7f6 plus
  exact8files passed94files/2,016tests/build. Main lint was obstructed by
  another session's generated nested worktree; it was left untouched.
- Next client/role: **Claude Code forge-expert / Opus**, successor
  [SCI6-DRAFT](SCI6-DRAFT.md). Owner "approve" on2026-10-15 supplies the
  D-173 engineering sign-off after integrated evidence; bounded drafting
  conditions satisfied. No worker active; no broader authoring pause lift.
- Original Sonnet187/187 and independent review provenance retained below.
- Current main HEAD `059c7f6f64374e0c37359a0e06e4e93185b7f62f` unchanged;
  no commit/push/deploy authorized or performed for this packet.
- Frozen rev1 in the common Git bundle: `rev1.patch` SHA-256
  `77be02fe1fe27d039f8300caf481f5325afc357729b65bafb60cfe4e7e5cf03d`
  (8 files: registry, curriculum contract, site labels, learner chapter label,
  skill/content catalog hooks, new `science-rules.ts` and its test);
  `intake-audit.md` `f272926c...cb3c`, `final-digests.json` `4ff43d61...4e003`,
  `rev1-results.md` `338fcdf4...a63`. Integrator `git apply --check` passed on
  HEAD `3e7c333` plus manifest baseline. Worker-reported: 80 targeted tests,
  typecheck, lint, curriculum:site and verify (94 files/2,004 tests/build) pass.
- Integrator held rev1 for an intake self-audit because initial intake was
  incomplete; audit found no correction, rev1 unchanged. "Compiled with
  warnings" is the baseline Prisma edge-runtime warning, not rev1.
- Reviewer notes (risks, not findings): `validateVersionedSkillCatalog` does
  not run Science rules (free-form domain; outside named P3 scope); tests
  temporarily push a synthetic Science skill into the live catalog with
  `afterEach` cleanup; Science chapter icon colour deferred to availability
  work; worktree started at `1b274cc` and was detached to `3e7c333` before the
  verified overlay.
- Completed review: fresh **Codex forge-reviewer / gpt-6.1-sol** reviewed
  full P1–P6 against patch/scope/baseline; findings below. Corrections remain
  within authorized U5 scope; preserve other lanes.
- Lane B implementation role (done): Claude Code forge-implementer / Sonnet.
- Owner **"approved both"**, 2026-10-15: D-172/SCI6-U5 authorizes exact P1–P6
  including recommended P5. D-168–D-174 record related values separately.
- Reviewed scope rev1 SHA `6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04`;
  fresh cross-family report `docs/sci6-first-unit-20261014-review.md`, ready
  with noted risks, no findings. This authorizes work, not its future patch.
- Base HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, accepted dirty baseline below.
- Rev1 provenance/freeze verified above; correction must use original native
  Sonnet author, verify actual client model before resuming and freeze rev2.

## Exact approved implementation and ownership

The following is the exact reviewed scope's §4; all P1–P6, including P5,
are selected. Optional chapter display path is eligible only if necessary
for the accepted domain label. Do not widen response kinds or content rules.

## 4. Minimal prerequisite implementation scope (one engineering packet)

Proposed executor: Claude Code `forge-implementer` (Sonnet), isolated
worktree, then Codex `forge-reviewer` review. No Science skill or content
record is added by this packet; all existing programs and users unchanged.

| ID  | Change                                                                                                                                                                                                                                                                                                                                                          | Owned files                                                                                                                                         | Tests (positive and negative)                                                                                                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Give `grade-6-science` its own registry entry: `graded-academic`, prefix `sci6-`, `skill-graph-only`, no units, `available: false`, same policy refs. Other four placeholders byte-identical in output                                                                                                                                                          | `src/curriculum/program-registry.ts`                                                                                                                | Entry values; other programs' parsed entries unchanged; existing prefix check rejects `cells-x` in Science (`program-registry.ts:129-131`); Science session start still throws "not available" (`src/phase1/program.ts:10`)                                              |
| P2  | Add only `sci6-life-science` to `CurriculumDomainSchema` with display labels                                                                                                                                                                                                                                                                                    | `src/contracts/curriculum.ts`; `scripts/generate-curriculum-site.ts` (exhaustive `DOMAIN_LABELS`, `:32`); optional `src/app/learner-chapters.ts:95` | Schema accepts value; site generation still type-checks; no published Science section while unavailable (existing gate)                                                                                                                                                  |
| P3  | Science skill rules: domain `sci6-*` only for `grade-6-science` and vice versa; `standards` within the 19-PE ASCII allow-list (§8)                                                                                                                                                                                                                              | new `src/curriculum/science-rules.ts`; call from `src/curriculum/catalog.ts` `validateSkillCatalog`                                                 | Accept `MS-LS1-1`; reject en-dash `MS‐LS1‐1`, cross-grade `MS-PS1-6`, non-Grade-6 `MS-LS1-6`; reject Math skill with `sci6-life-science`; reject Science skill with `geometry`; existing 64 skills unchanged                                                             |
| P4  | Science content rules: role `practice` only (already enforced live), mode `core`/`depth`, no `contestFormat`, validator `structured` with `choice` fields only, each field has a ≥3-char leakage pattern that is a case-insensitive substring of its correct option label, no pattern under 3 chars (so a correct option label must have at least 3 characters) | `science-rules.ts`; call from `src/content/catalog.ts` `validateParsedContentCatalog`                                                               | Synthetic fixture via `validateContentCatalog(items)`: valid record passes; `contest` mode, `contestFormat`, legacy `multiple_choice`, `parts`, number field, missing/short pattern and a 2-character correct label (`No`) each rejected; existing 128 records unchanged |
| P5  | Optional, recommended for figure items: every SVG `<text>` string must appear (case-insensitive) in `altText` or `accessibleAlternative`                                                                                                                                                                                                                        | `science-rules.ts`                                                                                                                                  | Fixture with an omitted label rejected; complete one accepted                                                                                                                                                                                                            |
| P6  | Preserve, do not rewrite: cross-program prerequisite ban (`program-registry.ts:136-140`), unique codes, publication gate                                                                                                                                                                                                                                        | tests only                                                                                                                                          | Science↔Olympiad edge rejected; unavailable Science skill with reviewed fixture content absent from public projection                                                                                                                                                    |

Validation for the packet: targeted Vitest files
(`tests/curriculum/skill-catalog.test.ts`, `tests/content/catalog.test.ts`,
`tests/content/publication.test.ts`, new `tests/curriculum/science-rules.test.ts`),
`npm run typecheck`, `npm run lint`, `npm run curriculum:site`, then
`npm run verify`. No database, e2e or provider suite is needed because no
served behavior changes while Science stays unavailable.

**Ready deterministic practice vs later evidence contracts.** Ready after
P1–P4: single-choice structured practice with item-level correctness,
hints and the existing independent check. **Not ready, needs a later
validated contract:** any "assessed" or mastery claim, assessment/review
records (D-01/D-163), per-option misconception tagging, multi-select or
unordered sets (excluded by D-160), constructed explanation or model building
(no LLM scorer; the unused `scoreConstructedResponse` port,
`src/contracts/provider.ts:42`, must not be wired for Science), data tables,
simulations, and teaching delivery.

## Exclusions and shared ownership

No Skill/content production records or authored questions/options/answers/
hints/teaching, registry availability flip, program/unit activation,
progression/scoring/mastery policy change, real tutor prompt/provider wiring,
new dependencies, migration, database/private/learner access, paid providers,
deployment, release, commit or push. Science stays unavailable; existing
programs/records preserve parsed output and publication behavior. Synthetic
fixtures only; do not edit private packages. Source-precision Q6 remains a
later SCI6-S01 content-authoring/review condition, no new research here.
U6/D-173 drafting remains conditional on this patch's reviewed integration,
applicable D-61 evidence and separately recorded engineering-owner sign-off.

Owned code: exact P1–P5 source paths above, plus targeted tests in
`tests/curriculum/skill-catalog.test.ts`, `tests/content/catalog.test.ts`,
`tests/content/publication.test.ts`, new
`tests/curriculum/science-rules.test.ts` and directly coupled synthetic test
helpers if required. No count assertion changes masking existing fixtures.
Only integrator edits shared decisions/index/PROGRESS/packets or applies
patches. You are not alone: preserve laneA release-preparation and others'
edits; no blanket staging, reset or duplicated worker task.

## Intake and effective baseline

Read live index/packet/AGENTS, orchestration accountability/batched gates/
terminal handoff, README, latest PROGRESS/Resume here/Current status, relevant
curriculum contract docs, approved dossier/reviews, current D-61/D-168–174,
Science first-unit packet/review and actual owned code before writing.
Original exact scope copied as `approved-scope.rev1.md` in local bundle.

Common Git metadata bundle: `/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/SCI6-PREREQ`.
`input-manifest.json` SHA-256 `b9c4044bc02af49f5ee677b471f98f39a0c7dea7a0f54c1b3ae08648abc0316c`,
89 exact public inputs plus approved-scope digest. `baseline/` preserves
accepted uncommitted source/tests/instructions/docs, including new structured
scorer/UI files. Verify every copied input against manifest before use.
Recreate isolated worktree at HEAD and overlay only listed baseline paths;
clean HEAD alone is not the accepted implementation baseline. Live shared
status is intentionally read at intake, not frozen here. Pin any additional
consumed public dependencies; authority/substantive drift requires integrator
reconciliation. No full session/secrets copies.

Acquire checked atomic `SCI6-PREREQ.lock` under common Git agent-claims;
write metadata only after mkdir succeeds. Record client/model/worktree/owned
paths/time. One Sonnet worker for this lane, parent orchestrates. Claim
conflict waits for owner; do not steal or mutate another checkout. Release
only own claim after frozen handoff; preserve other lane artifacts.

## Evidence, validation and next gate

Return requirements-to-evidence self-audit P1–P6 with actual positive,
negative and boundary fixture results. Validate new Science restrictions,
cross-program isolation, unavailable publication/session behavior, figure
labels and unchanged existing parsed records. Run commands in exact §4;
verify is required. Synthetic database-free tests only; no e2e/provider/DB
needed while no served behavior changes. If a gate exposes an unrelated
baseline failure, report concrete evidence rather than broad fixes.

Freeze allowlisted patch, final files/digests, input manifest, sanitized
commands/results, actual Sonnet model evidence and self-audit in this bundle.
No main application by worker. Integrator sets AWAITING_REVIEW after verifying
freeze; next fresh **Codex forge-reviewer / gpt-6.1-sol** cross-family first
review of full P1–P6 scope. Then human exact patch acceptance/application;
this approval does not preaccept future bytes. Corrections return to original
Sonnet author; preserve finding IDs and use closure/changed-scope contract.

Recovery: in Claude Code type **continue lane B SCI6-PREREQ**. Default
unassigned intake follows laneA; explicitly dispatch each assigned lane.

## Rev1 independent review and consolidated correction — 2026-10-15

Full report `docs/sci6-prereq-20261015-review.md`: one major R1, one minor R2,
both required P5 corrections. All8final digests,89baseline inputs, patch/
scope/manifest and actual Sonnet121/121 verified. Reviewer used independent
in-memory synthetic catalog probes, not full-suite repeats. Existing author
80targeted/2,004verify/build evidence does not cover these counterexamples.

- **SCI6-PREREQ-R1 major**: decode supported XML character references for SVG
  rendered labels, including decimal/hex/named cases; alternatives must be
  normalized as plain text without XML decoding. Complete plain label passes,
  missing label/literal entity substitute fails, existing controls preserved.
- **SCI6-PREREQ-R2 minor**: match each label entirely in either altText or
  accessibleAlternative, not their concatenation. Split Cell/wall must fail;
  full label in either passes and different labels may use different fields.

Original Sonnet author returns both IDs/root causes/locations/before-after/
positive controls/coupled regressions/status table; add meaningful regression
fixtures through validateContentCatalog and preserve P1–P6. Freeze rev2 exact
patch/files/digests/results/metadata and self-audit, retaining rev1 artifacts.
No new content or scope. Same Codex reviewer then checks changed scope,
original counterexamples and regressions; classify further findings. No extra
unchanged-scope review. Human patch acceptance/application still required;
D-173 drafting conditions remain open. Current claims do not authorize source
application. LaneA release preparation and deferred concept clips unchanged.

## Rev2 freeze and accountability checkpoint — 2026-10-15

Rev2 full replacement patch SHA-256
`0c9db656c8a6679bc7b51d8a3c353bba203c37ef83d8985d9a82d14ce56a5d1b`;
closure `824c2039e3134d1ea5351233320a4f7ae5d7492b8b6bd15ceb6cbede72d24ed2`;
results `88f38d3a4a67172b1830e8e82f921c996d87fa3999300ba72daecfd717d23571`;
digests `03c7238a95f8e30da1797f4881f80c3ae43da74ecca1a9998aa3598229deb767`.
Same8files; only science-rules/test changed from rev1. Author86targeted/
94files2,010verify/build pass; new tests fail5cases against rev1. Same reviewer
verified metadata152/152, original89inputs,8digests each revision,30committed
application bytes, original R1/R2 controls; no full suites repeated.

| Round | Author/freeze                 | Review result                                                           | Evidence limits                                                                    |
| ----- | ----------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Rev1  | Sonnet121/121,77be02fe...f03d | 0blocker,1majorR1,1minorR2                                              | Initial suite omitted entity/field-boundary cases.                                 |
| Rev2  | Sonnet152/152,0c9db656...5d1b | Original R1/R2 closed;0blocker,2major: R3 regression,R4 first-pass miss | Suite omitted XML lexical-context cases; no real Science content/serving evidence. |

**Integrator escalation checkpoint (orchestration accountability):** automatic
correction/review dispatch paused to record cause and action. Root cause is
context-insensitive regex XML extraction: stripping comments before recognizing
CDATA corrupts literal text (R3); naive text-tag searches see tag spellings
inside CDATA/comments as markup (R4). Initial independent review missed this
lexical-boundary dimension; same probes on both revisions establish R4 was a
first-pass miss. Original R1/R2 were correctly fixed; their closure stands.

Corrective action: original Sonnet supplies one bounded context-aware
extraction correction for R3/R4. Process comments/CDATA/ordinary character
data in lexical order; preserve literal CDATA and recognize only actual text
boundaries. No new framework/dependency or unsupported SVG expansion required.
Use the concrete report counterexamples: incomplete alternatives reject,
complete rendered labels accept, commented-out text adds no requirement.
Retain original entity/plain-text/separate-field/case/whitespace/multi-element/
no-figure controls. Add real validateContentCatalog before/after regression
cases against frozen rev1/rev2, root-cause/locations/result closure table,
then freeze rev3 with exact allowlist/digests/commands/model evidence.

This is existing selected P5 correctness, not a change to owner choices or
scope, so no new human scope request. Eligible next role resumes original
Sonnet in Claude Code; parent does not implement or dispatch another reviewer
before closure evidence exists. Same Codex reviewer checks only changed
scope/counterexamples/coupled regressions and classifies new findings. The
learner-visible increment remains unavailable Science prerequisites; drafted
Science content still requires D-173 conditions, later review/approval/release.

## Rev3 review and ready owner gate — 2026-10-15

Report `docs/sci6-prereq-20261015-rev3-review.md`: same reviewer verified
Sonnet187/187, original89inputs,8final digests,30committed application bytes,
exact patch and closure/results/digests. R1/R2 preserved, R3/R4 closed;
0blocker/major/minor. No further correction or assurance round indicated.

- Patch: rev3 `931133dd5be21caec847d6d396c6814decb62758aa8ee4cb0d344c4bd5db6fa7`.
- Closure: `ffffd0557b731c1ee90a3404c2016f2a313109a23aa8f1737c3eec9345a52da5`.
- Results: `f1d271df8787e5d045d819002007aa26ffa74184f9c1fbda05361e65a6aec63a`.
- Final digests: `7719152b91bc14a149cff24f589ea3391c0da516f16acfc7c714b21b661c1c27`.

Author92targeted/41Science/94files2,016verify/build evidence corroborated;
expanded tests fail11on rev1/6on rev2. Author per-probe before narrative quotes
prior report; independent exact comparisons verify those before/after cases.
Stricter malformed/unsupported-subset rejection found no requirement conflict.
Versioned-catalog limitation/build warning and later content gates preserved.

| Round | Author/freeze                 | Review result                                   | Evidence limits                                                               |
| ----- | ----------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Rev3  | Sonnet187/187,931133dd...6fa7 | R1–R4 closed;0blocker/major/minor,new findings0 | No real Science content/availability/release evidence; no full-suite repeats. |

Ready consolidated gates (not yet approved):

| Gate      | Exact request                                                                  | Boundary                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCI6-P-A1 | Accept exact reviewed SCI6-PREREQ rev3 eight-file implementation               | Scope P1–P6/D-172 only; noted risks retained.                                                                                                                              |
| SCI6-P-A2 | Authorize exact rev3 patch application and integrated database-free validation | Recheck current base/frozen8digests/apply-check, preserve other edits, run npm run verify and targeted checks as necessary, checkpoint. No commit/push/DB/provider/deploy. |

The eight files are scripts/generate-curriculum-site.ts,
src/app/learner-chapters.ts, src/content/catalog.ts,
src/contracts/curriculum.ts, src/curriculum/catalog.ts,
src/curriculum/program-registry.ts, new src/curriculum/science-rules.ts and
new tests/curriculum/science-rules.test.ts. No authored records or availability
change. Gates may be approved together or separately. D-173 drafting still
requires successful reviewed integration, applicable D-61 evidence and
recorded engineering-owner sign-off; no sign-off/release inferred here.

## Owner acceptance and exact integration — 2026-10-15

Owner **"accept and approve"** selects both SCI6-P-A1 exact artifact
acceptance and SCI6-P-A2 exact application/integrated validation. Checked
base, six source baseline hashes, absence of two new files, frozen patch and
final-digest hashes; apply-check passed. Applied only8reviewed files; main
bytes match every final digest before/after validation. R1–R4 stay closed.

Initial main npm run verify passed formatting then failed lint because
ESLint traversed another session's nested .claude/worktrees generated .next
files (1,309errors/7,582warnings). No accepted code defect demonstrated;
foreign worktree/config left unchanged. Own isolated checkout at059c7f6 plus
only8accepted files passed full npm run verify exit0: formatting/lint/types/
down-migration gate/94files2,016tests/build. Baseline Prisma edge-runtime
build warning retained. No extra full-suite repeats after passing isolation.
Own checkout removed; all8main/source hashes remain exact.

Evidence under common Git SCI6-PREREQ bundle:
`integrated-verify-20261015.log` (main lint obstacle),
`isolated-integrated-verify-20261015.log` (pass),
`integration-evidence-20261015.json` (commands/results/final hashes/log digest).
No database/e2e/real-provider needed for unavailable-program prerequisites.
No private/learner/provider/deploy/availability/content/commit/push work.

### Applicable D-61 / D-173 readiness and remaining sign-off

| Condition                                                          | Evidence / disposition                                                                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact approved unit/skills/roles/counts/response/safety/path scope | D-168–D-174 and approved first-unit scope6ddacf23...bf04; unchanged.                                                                                                                             |
| D-58/StageA0 and role/schema foundations                           | Course-progression handoff records A0/A1/A2/B complete; current publication/practice separation tests pass in2,016test gate. Pending drafts must stay unimported.                                |
| D-37/D-38/D-56/D-57/D-40 applicable practice contracts/registry    | Current contracts and reviewed P1–P6 integrated; Science domain/standards/choice/accessibility rules and existing prefix/cross-program/publication invariants pass. Science remains unavailable. |
| D-01/D-02/held-out access and D-52/D-53 rollout                    | No held-out assessment, private store, progression cutover or serving in D-173 drafts; no such permission inferred. Current gates remain.                                                        |
| Reviewed U5 implementation integrated and validated                | Exact rev3 accepted/applied; independent R1–R4 closure and integrated94files/2,016tests/build pass recorded above.                                                                               |
| Engineering-owner sign-off required by D-173                       | **Pending**, not included in artifact acceptance/application request. This is the only next named human condition for this bounded draft handoff.                                                |

Ready sign-off request: authorize starting the **already approved conditional
D-173 draft scope** after the integration evidence above: grade-6-science,
sci6-life-science, the three D-168 skills1.0.0/noedges and six D-169 core
practice records (two per skill), structured choice only, safety/claims per
D-171, paths per D-174. Claude forge-expert/Opus authors in an isolated bundle,
llm_drafted/owned/pending_review; Codex cross-family curriculum review then
separate human content approval/registration. Author must check SCI6-S01 exact
CA clarification/assessment boundaries (Q6) before actual content acceptance,
not invent new course research. No teaching/depth/held-out/provider/availability/
registration/release permission. No drafts produced before sign-off.

## D-173 engineering sign-off — 2026-10-15

Owner **"approve"** answers the explicit sign-off request after accepted
U5 integration/D-61 evidence. Named conditions are satisfied for the exact
three skills/six practice drafts; no scope reapproval required. Successor
SCI6-DRAFT is authorized, next Claude Code forge-expert/Opus, then independent
Codex curriculum review and separate human content approval. Earlier pending
sign-off rows are historical; no availability/registration/release approved.
