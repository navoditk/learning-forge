# RAT-SCORE-DESIGN — Opt-in structured response contract

## Live relay and authority

- Phase: **DONE** — exact revision 5 accepted/applied; uncommitted.
- Next client/role: **either client, RAT-SCORE-LEGACY execution-scope request**.
  OD-1–OD-9 approved as D-155–D-163. One proposed characterization test
  per contract §8, then Codex review; no implementation scope approved yet.
- Owner replied **"approve"** on 2026-10-12 to IC-5 option C and named
  document-only design packet. Recorded as D-154.
- Sole author-owned output: `docs/structured-response-scoring-contract.md`
  (new document). Integrator alone owns packets/status/decision register.
- Main baseline: `main`, HEAD `3e7c33372599d20c285656c3610ca6e47743240f`,
  with accepted dirty documentation overlays. Preserve unrelated work.

## Approved deliverable

Use corrected Ratios plan §3.4/§5.1, reconciliation §4.2/V-7 and accepted
subject findings to specify one implementable contract for:

1. Opt-in structured multi-field responses with deterministic validators
   bound to labeled fields, representation/units and required order.
2. Accessible learner input, complete labels/errors and text alternatives;
   practice grading and assessment submission, including malformed or unknown
   mode refusal. No semantic/LLM grading.
3. Structured attempt storage, mode/version attribution and replay/history
   interpretation. Identify any schema need as a proposal requiring separate
   migration/privacy approval; preserve historical attempts and their meaning.
4. Full V-7 acceptance requirements for new mode/items: reject negated,
   padded-number, reordered (where order matters), all-options and extra-claim
   responses; accept enumerated valid equivalents. Define a concrete
   executable acceptance matrix for later implementation, not tests now.
5. Separate legacy characterization of unchanged public `parts` items,
   recording known V-7 failures as unmet expectations, not passing acceptance.
   Existing matcher semantics stay unchanged; no historical rescoring.
6. Bounded implementation ownership, integration/validation dependencies and
   unresolved human decisions. Clearly separate recommendations from values
   already approved. No additional product choices inferred from D-154.

No content drafting/promotion, private-bank access, learner/production data,
new research, runtime tests/probes, database, paid provider, code/UI/schema
changes, other-domain migration or release. D-61 exception: none needed for
this document. IC-6–IC-9 and subsequent execution approvals remain separate.

## Intake and frozen inputs

Read AGENTS, live index/this packet and terminal-handoff/model procedure;
README; latest PROGRESS and Resume here/Current status; corrected plan,
reconciliation scoring evidence, accepted subject report, decision register,
then the listed public interfaces and only required related tests/call sites.
Verify actual Opus selection from successful client metadata; unavailable
role/identity is BLOCKED rather than fallback permission. Claim one bounded
role before writing. Use isolated worktree and allowlisted input overlays;
parent orchestrates without duplicating author design.

- `docs/grade-6-math-ratios-plan.md`: `c31c21017e05abe02cb158d660de567cf2b7ba5b0e8e5d9bc4f6fa97a6be9fbe`
- `docs/grade-6-math-reconciliation.md`: `c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec`
- `docs/grade-6-math-ratios-subject-review.md`: `74617baaa2d190a48c3609096cef2fe9b9f4181115581915452398dc868a61ad`
- `docs/course-progression-decisions.md`: `8e0900fe468ac0d2c50df719e72a91cec20552572179ec2b1c2827050689e955`
- `docs/curriculum-sources.md`: `ea36f47db15ced2722d8e4d05fae2cab5360a809d34a2ea05b5ae87694f09e46`
- `src/contracts/content.ts`: `5a047b27abc0ccbbc1f5c8506a4dcedd0d3d5e509a44704fcc9cca1ad8f07321`
- `src/content/answer-matching.ts`: `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5`
- `src/phase1/service.ts`: `a250e466f19c6e251c2b96a47e550bceda0abfc3479ecc7f611fb846abdc6059`
- `src/progression/assessment-submission.ts`: `3533e7d9a5cd24b636c939cee51c43667ef5c6fbacbd1b165ba24c98db9626da`
- `src/app/components/activity-panel.tsx`: `7ba867d1d237fe3eb581f24f225ac8855d6745dbe40cec4449e9bd3c654e7aab`
- `prisma/schema.prisma`: `8ede94d6a35663143b08660add427855de5f12bf78583b41b1deaa1e81eb0103`

Verify live hashes before work; an input mismatch requires repinning through
integrator. Shared dirty documents do not appear automatically in worktrees.
Pin additional public code/test inputs in the returned manifest if consumed.

## Durable local baseline

Allowlisted input copies:
`/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-SCORE-DESIGN/baseline/`,
original relative paths. `manifest.json` SHA-256:
`bbcfc2dad2a273ef2a7463c1578d61de0e952b1d85d99a729440930bfda0a2d6`.
Verify manifest and copied bytes against pinned live inputs before overlay.
These are local handoff artifacts, not a committed or remotely transferred
bundle. No unrelated files or secrets included.

## Freeze, validation and next gate

Author returns only the one-document patch, frozen final document, exact
SHA-256 hashes, baseline/input manifest, scope explanation, unresolved
choices and actual author model/UUID/timestamp metadata evidence. Persist
under resolved common Git metadata `agent-handoffs/RAT-SCORE-DESIGN/`.
No main-worktree application or shared status edits by worker.

Run targeted Prettier `--ignore-path /dev/null` and `git diff --check` only.
Integrator verifies reconstruction/scope and records **AWAITING_REVIEW**;
release claims and **SWITCH TO Codex forge-reviewer / gpt-6.1-sol**.
Scoring is critical: cross-family review required. Owner acceptance and
one-file application follow review; implementation remains separately gated.
No commit or push.

## Recovery prompt

Continue RAT-SCORE-DESIGN as Claude Code forge-expert / Opus. Verify relay,
model and pinned baseline; claim isolated one-document author scope; freeze
contract patch/evidence and hand off to Codex independent review. Native
"continue" is sufficient; this prompt is only a recovery fallback.

## Contract returned (2026-10-12)

Author: fresh Claude Code `forge-expert` (agent type `forge-expert`; first
assistant record `a9890c74-21a6-4363-890b-9c696efed950`,
`2026-10-13T00:38:45.924Z` UTC, model `claude-opus-5-5`, per author's
reading of client transcript metadata; reviewer confirms). Baseline HEAD
`3e7c333`; all 11 pinned inputs matched live, baseline copies and worktree
before work and at freeze. Claim released; worktree removed; main unchanged.
Frozen under `<git-common-dir>/agent-handoffs/RAT-SCORE-DESIGN/`
(`baseline/` untouched):

- `structured-response-scoring-contract.md` (705 lines), SHA-256 `b15920c004afb30021bdcdfbf4cac8707447876114a6112e79db1e215206d6f1`.
- `structured-response-scoring-contract.patch` (one new file against HEAD), SHA-256 `32d20f1ff246582a12fe0ab10d1270d3a7cf2165e7ec9fff533158b65bdb42ef`.
- `input-manifest.json` (11 pinned inputs, 29 further consumed inputs incl.
  9 public `parts` content files, partial-read list, author metadata),
  SHA-256 `5c3b39a9f0daa0ae44564e70619a389226c88dc1ead3950653127d574a308839`.

Scope: §0 authority and approved-value table (§0.2 what D-154 does not
decide); §1 observed current behavior (gaps: practice projection omits
`accessibleAlternative`, no learner assessment UI, unused
`scoreConstructedResponse` port); §2 opt-in `structured-fields` v1 mode,
field kinds, numeral grammar, all-or-nothing correctness, unknown-mode
refusal layers; §3 request contract, answer-free `responseSpec`, refusal
table, accessibility A-1–A-11, practice/assessment ordering, scorer purity;
§4 storage S-A (JSON envelope, no schema change) vs S-B (proposal needing
migration/privacy approval), history rules H-1–H-6; §5 V-7 acceptance
matrix (~37 cases), generator G-EQ–G-WC, path rules PA-1–PA-10; §6 separate
legacy characterization of 9 public `parts` items with 14 known failures
recorded UNMET, no matcher/content change; §7–§8 recommended packets L, 1,
1a (S-B only), 2, 3; §9 approved vs recommended vs open; §10 limitations.

Open owner decisions OD-1–OD-9: storage S-A/S-B (rec. S-A); malformed input
refuse vs incorrect (rec. refuse); partial credit (rec. none); per-field
feedback (rec. item-level); numeral grammar details; v1 field kinds; packet
split (rec. split); `accessibleAlternative` projection scope; assessment
learner UI before held-out structured items. IC-6–IC-9, O-10, D-61, item
approval, registration and release remain separate.

Disclosed: Prettier from main checkout `node_modules`; read-only `python3 -I`
extraction of validator fields/hashes from public content (matcher not
executed; §6 outcomes are static and must be confirmed by packet L); private
store schema-failure behavior and D-58 exposure marked MISS; D-41 wording not
cross-checked against UI playbooks.

Integrator verified all three hashes, baseline manifest unchanged, one-file
patch (+705/−0) with `git apply --check` and clean-tree reconstruction to the
exact document hash, claim release, worktree removal and no secrets pattern.

## Codex review — 2026-10-12

Fresh host-selected `/root/rat_score_design_review`, native `forge-reviewer`
actual `gpt-6.1-sol`: **not ready for human review**. Report
`docs/rat-score-design-20261012-review.md`. All substantive inputs/frozen
hashes verified, one-file reconstruction and document checks passed; actual
Opus metadata independently verified. Relay/status hash changes expected.

Corrections within approved one-document scope:

- R-1 major: authorized lifecycle/current-item preflight and authority/error
  precedence before field errors; retain transactional rechecks/zero writes.
- R-2 major: generator outcomes consistent with syntax/length/representation.
- R-3 major: representable correct responses, identifier/value/transport bounds
  and canonical rendering; accurate S-A size claims.
- R-4 major: public choice IDs versus correct selector; projection-specific
  descriptor/redaction assertions.
- R-5 minor: fraction/mixed input on mobile, appropriate input mode.

Resume original author transcript `agent-a41f444c95448c37b.jsonl` where
available; first assistant UUID `a9890c74-21a6-4363-890b-9c696efed950`,
`2026-10-13T00:38:45.924Z`, actual `claude-opus-5-5`. Verify model evidence
again. Preserve original frozen artifacts; revision 2 gets distinct artifact
names/hashes and a manifest addendum. No owner OD choices selected, code or
content changes, main application or implementation approved. Refreeze and
route changed scope to Codex. No repeated item/source research or runtime
suites needed. No commit/push.

## Revision 2 returned (2026-10-12)

Original author resumed (same transcript `agent-a41f444c95448c37b.jsonl`;
first revision-2 assistant record `ac7302b4-69ad-4713-b914-51e6b32132b2`,
`2026-10-13T04:35:44.982Z` UTC, model `claude-opus-5-5`, per author's reading
of client metadata; reviewer confirms). Baseline HEAD `3e7c333`; 11 pinned
inputs and baseline manifest matched; claim released; worktree removed; main
unchanged. Revision-1 artifacts retained. New:

- `structured-response-scoring-contract.rev2.md` (902 lines), SHA-256 `9c7f801de7bb2cac1292cbea80ddf4dec3ae53c8a39b93f87f6600b481dbc087`.
- `structured-response-scoring-contract.rev2.patch` (one new file against HEAD), SHA-256 `fc372d1a404ae8b58d7ef1528fb6ee51671b5a222ed759fb53398404c13f433a`.
- `input-manifest.rev2.json` (review report, packet, rev1 hashes), SHA-256 `37621a4f46026c378880a0d576a3a76cb37cd982da20aefc41bb9f8f049f57db`.

Author response (rev2 line references):

- R-1: new §3.3a (403–461) tiered precedence — existing gates, request
  shape, read-only authority/lifecycle/current-item preflight, mode, fields,
  transactional recheck; first failing tier wins. Practice preflight equals
  today's checks (no `endedAt` check; noted §10). Assessment mirrors today's
  pre-/in-transaction order and codes; recommended structured-only
  `NOT_CURRENT_ITEM` (409). Expired runs keep today's path. Zero writes on
  refusal. PA-11/PA-12 added.
- R-2: §2.5 fixed classification order; §5.4 kind-specific generators with
  outcomes from a separately implemented reference classifier; malformed
  constructions reclassified, never CORRECT; G-PB boundary family; SF-5 and
  rows B-01–B-05, S-01–S-03.
- R-3: identifier/label bounds (§2.2); new §2.5a `correctValue` bounds,
  representability rule, max rendering 29 characters; canonical rendering
  (§2.4); impossible-field load rejection (§2.7); request bounds looser than
  item bounds (§3.1); S-A envelope max 669 characters (§4.1); PA-6 vectors.
- R-4: public `options[].id` vs private `correctOptionId`/`correctValue`;
  allowlist-built public `responseSpec` only on practice session and
  authorized current-item projections (§3.2); PA-4a–PA-4h per-projection
  redaction assertions.
- R-5: A-3 input mode by representation set (`numeric`/`decimal`/`text`);
  PA-10 mobile entry of `3/4` and `1 1/2`.

Changed: §2.2–2.5, 2.7, 3.1–3.6, 4.1, 5.2–5.5, 7, 8, 9.2, 10; new §2.5a,
§3.3a, §11. Disclosed: Prettier from main `node_modules`; manifest typo fixed
before final hash; PA-11/PA-12 moved to table end. No OD choice selected.

Integrator verified all hashes (rev1 unchanged), `git apply --check`,
clean-tree reconstruction to the exact rev2 hash, §0/§1/§6 byte-unchanged,
claim release, worktree removal and no secrets pattern.

## Revision 2 Codex review — 2026-10-12

Same host-selected `/root/rat_score_design_review`, fixed `gpt-6.1-sol`,
verified Opus revision metadata, all substantive inputs/artifacts and patch
reconstruction. Report `docs/rat-score-design-20261012-rereview.md`:
**not ready for human review**. R-1/R-2/R-5 resolved; two residual majors:

- R-3: PA-6 must not require an unattainable 29-character positive-control
  fixture; use a valid bounded rational and distinguish conservative bounds.
- R-4: apply public choice-ID exception consistently across PA-4a/PA-4c/PA-4h;
  exact allowlists/private-selector redaction and scoped sentinel checks.

Original Opus executor corrects these only, preserves prior fixes and owner
OD choices as unapproved, returns revision-3 document/patch/manifest with
new hashes and actual metadata evidence. Keep rev1/rev2 artifacts unchanged.
No new research, item review, runtime/private/database/provider work,
main application, implementation, commit or push. Then Codex changed review.

## Escalation checkpoint and revision 3 (2026-10-12)

Rounds so far (all authored by Claude Code `forge-expert` / `claude-opus-5-5`;
reviewed by Codex `forge-reviewer` / `gpt-6.1-sol`):

| Round | Artifact          | Review result               | Classification                           |
| ----- | ----------------- | --------------------------- | ---------------------------------------- |
| 1     | `b15920c0...d6f1` | 4 major, 1 minor (R-1–R-5)  | First pass                               |
| 2     | `9c7f801d...c087` | 2 major (residual R-3, R-4) | Unresolved R-3/R-4; R-1/R-2/R-5 resolved |
| 3     | `0813caf3...f441` | Not yet reviewed            | —                                        |

Cause analysis (integrator): **incomplete fix within a contradictory/oversized
contract.** Revision 2 introduced a claimed 29-character maximum without a
valid attaining example, and a recursive leakage scan without checking it
against the required public option IDs. The author did not test the new rules
against the contract's own acceptance cases before freezing.

Corrective action: before any further paid review, the author returns the
`docs/agent-orchestration.md` closure table for R-3 and R-4. It needs a concrete
derivation of the original counterexample and a valid positive control, a sweep
of every coupled reference, and regression checks for R-1/R-2/R-5. Frozen
bytes change only if that self-audit finds a defect (then revision 4). Owner
scope and approved choices do not need to change.

Integrator deviation: revision 3 was dispatched before this checkpoint was
recorded; the rule was read after dispatch. Revision 3 artifacts are retained
and verified:

- `structured-response-scoring-contract.rev3.md` (946 lines), SHA-256 `0813caf3815bb03f1102109f35eeeadb90c38caaed4f246b39279cf92270f441`.
- `structured-response-scoring-contract.rev3.patch`, SHA-256 `6550199fcda2b833a1c176bd8b5eb4d9ff26e5b0caeba1d628b9cd23c5964876`.
- `input-manifest.rev3.json`, SHA-256 `d5557bffc23a7feddcb2d8ed44588765766491c05a0caf795babb2dcb3fa7e10`.

Author model evidence: first revision-3 record
`67d5952e-5e11-4970-bd50-234a5c44dab3`, `2026-10-13T04:48:22.570Z` UTC,
`claude-opus-5-5`. Integrator verified hashes (rev1/rev2 unchanged), `git
apply --check`, clean-tree reconstruction, diff hunks limited to the
preamble, §2.5a, §3.1, §4.1 S-A, §5.4 G-NG, §5.5 (PA-4a/c/h, PA-6, scoped
sentinel rule) and §11 notes; §0, §1 and §6–§10 byte-identical to rev2.
Author-disclosed: the §5.4 G-NG change is a dependent fix (its `TOO_LONG`
outcome relied on the corrected bound).

Phase stayed **CHANGES_REQUESTED** until the closure evidence arrived (below).

## Closure self-audit and revision 4 (2026-10-12)

The author's self-audit of revision 3 found three defects coupled to residual
R-4, so revision 4 was frozen (rev1–rev3 and `baseline/` unchanged):

1. SF-3 `n` and SF-5 `s` omitted the §2.2-required `simplestForm`, so the
   exact PA-4a allowlist for SF-3 could not be evaluated; added
   `simplestForm: false` (no §5.3 outcome change).
2. The sentinel rule replaced `canonicalAnswer`/`acceptedAnswers`, but §2.7
   requires them to equal the derived rendering, so fixtures would fail
   load. Sentinels now apply to private free text only, with a scan for the
   whole derived `canonicalAnswer`.
3. The number sentinel now must be expressible in the field's
   representations and absent from all public text (`8191/64`; `7919` for
   integer-only fields).

Artifacts:

- `closure-evidence.rev4.md` (222 lines; closure table, derivations, reference sweep), SHA-256 `3ef63d0ed885b7fe2054de24b343e6c96b574126bee5df53d01991dbb30cfc0c`.
- `structured-response-scoring-contract.rev4.md` (966 lines), SHA-256 `31886e8a2d24438d19a0d9cbd267aef7a551040c6355fa0361cfbfc358204cb9`.
- `structured-response-scoring-contract.rev4.patch`, SHA-256 `f978cf73aeaaee5b42e979dfb2d7ecbd74ed930538f335b9feac54c1497610ad`.
- `input-manifest.rev4.json`, SHA-256 `588d163a65e1be4704658880caf12377c6bc6a0b49a71252de428d67b0d3e522`.

Closure table: residual R-3 and R-4 **Resolved** by manual derivation (no
runtime test); R-1, R-2 and R-5 regression rows Resolved (sections
byte-identical or dependent-only). Root cause, R-3: a pattern bound was stated
as attainable without checking against `correctValue` bounds. Root cause,
R-4: the scan ignored that one public option id equals `correctOptionId`, and
the coupled fixtures were never evaluated. Author model: first audit record
`07380d7b-0daa-4a10-bd53-6559080336e3`, `2026-10-13T04:52:25.567Z` UTC,
`claude-opus-5-5`. Disclosed: two arithmetic slips and line-number offsets
were caught by a `python3 -I` arithmetic check before freezing; no repository
code was executed.

Integrator verified: all 13 artifact hashes; `git apply --check`; clean-tree
reconstruction to `31886e8a...04cb9`; rev3→rev4 hunks limited to the
preamble, SF-3/SF-5 lines, the sentinel rule and the revision-4 notes; claim
release and worktree cleanup; evidence Prettier-clean. Independently
recomputed: gcds of both controls are 1; renderings 21/19/15 characters; the
28-character normalized numerator `999999997000000003`; 669 and 3168.

## Revision 4 review and escalation checkpoint — 2026-10-12

Same host-selected `forge-reviewer` / `gpt-6.1-sol` reviewed rev2→rev4,
original counterexamples, closure evidence and direct regressions. Report
`docs/rat-score-design-20261012-rev4-review.md`: **not ready for human review**.
Counts: 0 blockers, 1 major, 0 minors. R-3 closed; R-1/R-2/R-5 preserved.
R-4 classification **Unresolved**, not first-pass miss: original choice-ID
scan is fixed, but the directly coupled PA-4a selector variants are invalid
unless dependent private canonical/accepted answer fields are recomputed.

**Cause analysis:** the author checked public descriptor equality but not
load validity of each selector-mutated whole fixture. §2.4/§2.7 derive private
answer strings from the selector; the phrase "only" contradicts that invariant.
This is incomplete closure, not a change to approved owner choices.

**Consolidated corrective action:** original Opus executor clarifies PA-4a
variants change the selector plus recomputed dependent private answer fields;
closure table explicitly derives both load-valid SF-3 y/x and SF-1 45/46
fixtures before comparing identical public projections. Retain malicious
selector rejection, sentinel safety and all earlier closed fixes. Update
only coupled rules/evidence, freeze revision 5 with distinct hashes and
actual model metadata. Preserve earlier artifacts. No broader scope needed.

Automatic review dispatch is paused until this concrete closure evidence
arrives, per orchestration escalation procedure. Then resume the assigned
Codex changed-scope reviewer; no extra fleet or speculative full audit.
Learner-visible increment being unblocked: future opt-in labeled response
input with deterministic safe grading; no live implementation at this stage.
Static derivations/document checks only; implementation/mobile/private-store
validation and OD choices remain later gates. No application, code/content,
runtime/private/database/provider work, commit or push authorized.

## Revision 5 returned (2026-10-12)

Original author resumed (first revision-5 record
`64be818f-b6ea-4fb5-9dcf-b77d1ca3886c`, `2026-10-13T05:03:34.571Z` UTC,
`claude-opus-5-5`, per author's reading of client metadata). Rev1–rev4 and
`baseline/` unchanged; claim released; worktree removed; main unchanged.

- `structured-response-scoring-contract.rev5.md` (994 lines), SHA-256 `dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`.
- `structured-response-scoring-contract.rev5.patch`, SHA-256 `a18f85253b859a99b01a97865640ff6e0346da9f1b4e4c6b35166bcc53562971`.
- `closure-evidence.rev5.md` (195 lines), SHA-256 `908da2906abd16452a1b8333e19d7dec8f794a5e46c2a0ffa7ca452253df675d`.
- `input-manifest.rev5.json` (rev4 review, packet, orchestration doc, prior artifacts), SHA-256 `79ee780843adb57b2a5c2487046b7c2d48a527d8ed0bc0c8308282c1f2e3945a`.

Closure: R-4 **Resolved** by derivation. PA-4a check 4 (inherited by PA-4c
and PA-4h) now changes the selector and recomputes `canonicalAnswer` and
`acceptedAnswers` per §2.4, and both members of each pair must pass §2.7.
Four whole fixtures are derived: SF-3 y/x
(`Choice Q: Option Y|X; Quantity N: 12`) and SF-1 a=45/46
(`Quantity A: 45|46 units; Quantity B: 9 units per group`). Each passes a
12-row §2.2/§2.5a/§2.7 checklist, and the pairs project byte-identically.
Coupled fixes from the author sweep: the sentinel number variant now
recomputes its derived fields; §5.2 defines complete load-valid fixtures,
including the PA-6 positive controls, and PA-6 rejection fixtures may violate
only their tested rule and its necessary implications. R-1, R-2, R-3 and R-5
sections are byte-unchanged.

Integrator verified: all hashes; `git apply --check`; clean-tree
reconstruction to `dda20ea7...9898`; rev4→rev5 hunks limited to the status
lines, the §5.2 paragraph, the §5.5 table (PA-4a plus re-padding), the
sentinel bullet and the revision-5 notes; the PA-4a recompute wording;
evidence Prettier-clean; fixture string lengths 34/51 and `8191/64` =
127.984375; cleanup.

## Revision 5 Codex review — 2026-10-12

Same host-selected `forge-reviewer` / `gpt-6.1-sol`: **ready for human review**,
0 blockers/majors/minors. Report `docs/rat-score-design-20261012-rev5-review.md`.
R-4 closed: selector variants rederive private answers and pass load before
identical public projections. SF-3 canonical lengths 34, SF-1 lengths 51;
sentinel/negative controls coherent. R-1/R-2/R-3/R-5 preserved. No unresolved,
regression, first-pass-miss or newly observable finding in changed scope.
Verified author Opus rev5 metadata, all artifacts/input hashes and one-file
reconstruction; document/evidence formatting and whitespace checks passed.

**WAITING FOR HUMAN APPROVAL:** accept exact rev5 contract `dda20ea7...9898`
and authorize patch `a18f8525...2971` application. OD choices remain open;
acceptance of the planning contract does not select its recommendations or
authorize implementation/content/release. On approval, verify baseline,
apply exact one-file patch, verify hash, run docs checks and checkpoint.
No runtime work, repeated research, commit or push authorized.

## Accepted application — 2026-10-12

Owner replied **"accept"** to exact revision-5 document acceptance and
one-file patch application. Claimed Codex integrator verified HEAD, absent
target, all eleven baseline inputs and four rev5 artifacts; apply-check
passed and only patch `a18f85253b859a99b01a97865640ff6e0346da9f1b4e4c6b35166bcc53562971`
was applied. Main `docs/structured-response-scoring-contract.md` hash
`dda20ea7beffde246fe6a1b95f461c3c7a7d790ef8d22f1d27040bd3b0b59898`
exactly matches reviewed bytes. Document checks passed; unrelated edits
preserved. Earlier unapplied/request entries are historical and cleared.

Acceptance adopts the reviewed planning artifact, not its REC/OD values or
execution proposals. Next smallest consumed owner choice: **OD-1** storage
S-A/S-B, recommendation S-A in existing columns, per §4.1. OD-2–OD-9,
IC-6–IC-9, content/implementation/privacy/migration/release remain separate.
No code/schema/runtime/private/database/provider work, commit or push.

## OD-1 disposition — 2026-10-12

Owner replied **"approved"** to S-A JSON envelopes in existing attempt
columns, without schema migration; recorded as D-155. Earlier OD-1 requests
are historical. Contract bytes remain frozen; decision register supplies
current approved values. Implementation still needs its named scope/gates.
Next **OD-2**, malformed fields refused with answer-independent format feedback
and no attempt, versus recording incorrect. No choice made by this checkpoint.

## OD-2 disposition — 2026-10-12

Owner replied **"approve"** to answer-independent format refusal/no attempt
for well-typed malformed fields; recorded as D-156. Earlier OD-2 requests
are historical. Authority/lifecycle/duplicate precedence and expiry paths
remain as accepted contract; well-formed wrong values remain grading inputs.
Contract bytes unchanged, no implementation approved. Next **OD-3**: no
partial credit in v1 versus separately weighted PARTIAL; no choice made here.

## OD-3 disposition — 2026-10-12

Owner replied **"approve"** to no partial credit in v1; recorded D-157.
Every required field must be correct; well-formed wrong responses incorrect,
malformed input follows D-156. No new weight or legacy/historical changes.
Earlier OD-3 requests are historical; contract bytes unchanged. Next **OD-4**,
item-level correctness feedback only in practice v1, versus per-field practice
feedback (never assessment). No choice made by this checkpoint.

## OD-4 disposition — 2026-10-12

Owner replied **"approve"** to item-level correctness feedback only in v1
practice; recorded D-158. Assessment projection unchanged; answer-independent
field-format errors under D-156 remain permitted. Earlier OD-4 requests are
historical; contract bytes unchanged. Next **OD-5**, numeral grammar as §2.5:
nonnegative ASCII forms, explicit leading digit, trailing decimal zeros and
fraction spaces permitted, no symbols/units/separators/Unicode forms; stated
length and digit bounds apply. No choice made by this checkpoint.

## OD-5 disposition and prompt clarification — 2026-10-12

Owner replied **"approve"** to pending OD-5 grammar; recorded D-159.
Contract bytes remain unchanged. Owner also asked why repeated approvals and
how to delegate more authority. Repository workflow gates differ from CLI
sandbox prompts; no runtime/global permission setting changed. Remaining
OD-6–OD-9 should be presented as one clearly scoped batch to avoid serial
requests. No broader choice/execution authority inferred from this approval.

## OD-6–OD-9 batch disposition — 2026-10-12

Owner replied **"approve"** to all four recommendations, recorded D-160–D-163:
number/single-choice v1, split implementation packets, structured-only practice
text alternative projection and deferral of held-out structured items until
separate assessment UI scope. No broader implementation authority inferred.
Earlier OD requests historical; immutable contract bytes unchanged.

## Concrete next scope request — RAT-SCORE-LEGACY (not authorized)

Contract §8 begins with L, `RAT-SCORE-LEGACY`, one new file:
`tests/content/legacy-parts-characterization.test.ts`. Proposed executor:
Claude Code `forge-implementer` / Sonnet, then Codex `forge-reviewer` /
`gpt-6.1-sol`. Characterize nine pinned public `parts` records per §6,
including canonical/accepted strings, original counterexamples and UNMET
V-7 expectations; pin matcher/item hashes. No matcher/content/source changes,
private access, learner data, database, paid provider or historical rescoring.

Run targeted tests and synthetic database-free `npm run verify`; report
observed UNMET count. If observations differ from contract static expectations,
stop/report rather than altering them to fit. Author self-audit/closure,
freeze one-file patch/evidence, independent review then owner acceptance/
application. No code behavior change, commit or push. This proposal is
reviewable now; only after scope approval does integrator assign its packet.
