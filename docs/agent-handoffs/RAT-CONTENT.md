# RAT-CONTENT — public Grade 6 Math Ratios practice content

## Live relay

- Phase: **RC-5 DONE (applied, committed); RC-T2 IN_PROGRESS** (2026-10-22).
  Sonnet rev2 (verified 146/146 + one 429 stop; combined `2da36c43...91df`):
  1049 vectors scored (42 G-MC), sensitivity control. Codex `gpt-6.1-sol`
  round 2 (verified) READY_WITH_RISKS, approved for local application
  (`rc5/rev2/review-r2-report.md` `35f4ad52...a4a5`). Applied to main;
  `iso-validation-8` all exit 0 (verify 2687 with build under NODE_ENV=test,
  integration 337+1, eval 17, no `.env` load). Catalog 154. Deploy
  preconditions: D-216 private check, D-221 pre-RC-5 archive run.
  RC-T2: Opus `teaching-A-rev1` (verified 337/337; freeze `4e8c7d5a...ece9`,
  5 `llm_drafted` records, all pass `validateTeachingRecords`); Sonnet
  replacing the absence test (ledger 64/180); then Codex review and D-212
  acceptance.
- Earlier phase: **RC-5 rev1 CHANGES_REQUESTED; rev2 IN_PROGRESS** (2026-10-22).
  Sonnet rev1 (verified 119/119; combined patch `0052944d...c45a`; catalog
  154; verify 2683, integration 337+1). Codex `gpt-6.1-sol` (verified)
  `rc5/rev1/review-r1-report.md` `5b87a45c...08d7`: RC5-R1 major (generated
  vectors not scored); delegated decisions D-220 (DR-1, three test hunks) and
  D-221 (DR-2, pre-RC-5 archive run before deploy). Sonnet resumed for rev2
  (ledger 60/180).
- Earlier phase: **RC-5 IN_PROGRESS** (2026-10-22). Owner "approve G-1 to G-6 as
  recommended" (`rc5-decisions/request.md`): D-213 local registration, D-214
  O-13 moot by supersession, D-215 D-176 ends at RC-5, D-216 K-3 accepted
  locally (private check before deployment), D-217 ContentArchive
  precondition, D-218 teaching D-61 exception (5 dormant drafts). D-212
  rulebook edit applied. RC-5 Sonnet `acfb5aae32e824c2a` in isolated
  `rc5-tree` (both draft patches applied; ledger 58/180); then Codex review,
  iso validation, local apply; then RC-T2 teaching drafts (Opus).
- Earlier phase: **RC-T1 ACCEPTED LOCALLY; next teaching D-61 exception and RC-5
  decisions** (2026-10-22). RC-T1 rev2 (Sonnet verified 48/48; patch
  `6fe8cd18...7f0a`, 5 new files, no existing file edited) Codex
  `gpt-6.1-sol` round 2 (verified) **READY_WITH_RISKS** (non-literal dynamic
  import undetectable; documented), report `rc-t1/rev2/review-r2-report.md`
  `a477af48...1ea2`. Applied to main under D-199/standing mandate (hashes
  match); `iso-validation-7` all exit 0 (verify 2647, integration 337+1 skip,
  eval 17, no `.env` load, container removed). Uncommitted.
- Earlier phase: **ALL 22 PRACTICE DRAFTS ACCEPTED (D-208, D-209, D-210); RC-T1 rev2
  IN_PROGRESS** (2026-10-22). Owner "approved" → D-210 DNL-3/4. RC-T1 rev1
  (Sonnet verified 31/31; patch `b4666571...b7f4`, 4 new files) Codex
  `gpt-6.1-sol` (verified, thread `01a16170-f2bc-7242-8942-ac8bea97f6f0`)
  CHANGES_REQUESTED: major regex dormancy-guard bypasses; minor copied-rule
  drift. Sonnet resumed for rev2 (ledger 56/80). Next: Codex re-review, iso
  validation, local apply; then teaching D-61 exception request; RC-5 gates.
- Earlier phase: **RC-3 batch B PASSED; RC-4 DNL-3/4 AWAITING_HUMAN; RC-T1
  IN_PROGRESS** (2026-10-22). Sonnet harness rev4 (verified 112/112;
  `6f986f1d...9548`; A 108/108, B 74/74; independent must-accept forms all
  accepted, near-misses rejected). Codex `gpt-6.1-sol` round 2 (verified)
  **READY_WITH_RISKS**, CB-R1/R2 closed (`rc3-B/r2/review-r2-report.md`
  `a837e805...6968`); recommends owner ACCEPT `double-number-lines-3@content-1`
  and `-4@content-1` (draft-B-rev2) with the disclosed answer-form limitation
  (e.g. `20/2`, `x=10` rejected). RC-T1 dormant teaching validator (D-199)
  dispatched to a new Sonnet worker in isolated `rc-t1-tree` (ledger 54/80).
- Earlier phase: **draft-B-rev2 FROZEN; harness rev4 IN_PROGRESS** (2026-10-22).
  Opus (verified 315/315) `draft-B-rev2` freeze `e1f94444...f49c`, patch
  `1610d8f1...b1f6`: DNL-3/4 widened legacy forms (21 accepted, 48 wrong
  forms checked via production `scoreSubmission`), DNL-4 `reverses-scale`;
  six D-209 records byte-identical; harness rev3 69/69. Sonnet resumed for
  harness rev4 independent positive cases (ledger 52/80); then Codex re-review.
- Earlier phase: **RC-3 batch B CHANGES_REQUESTED; 6 items ACCEPTED (D-209)**
  (2026-10-22). Sonnet harness rev3 (verified 92/92; `ce0083f7...23f1`; A
  105/105, B 69/69, independent B key agrees). Codex `gpt-6.1-sol` (verified)
  `rc3-B/review-r1-report.md` `8ec80ef7...6e78`: all 8 answers correct; D-207
  sign-off of DNL-5/6 and percent-applications-3..6; harness rev3 READY.
  CB-R1 (major): DNL-3/4 legacy accepted forms too narrow (`10.0`); CB-R2
  (minor): skill already has `reverses-scale` (integrator's D2 premise was
  wrong; now aligned with reviewer: map existing code, no skill edit). Opus
  author resumed for `draft-B-rev2` (ledger 51/80); then Sonnet harness
  positive cases, Codex re-review; DNL-3/4 acceptance stays with owner.
  Owner veto window for D-209 items ends 2026-10-29T02:14Z.
- Earlier phase: **RC-2B FROZEN; RC-1 harness rev3 IN_PROGRESS** (2026-10-22).
  draft-B-rev1 (Opus verified 281/281; freeze `01399556...f343`, patch
  `54319b83...12d5`; 8 drafts, main untouched). Frozen harness rev2 on batch B:
  46 pass / 22 fail, all hard-wired batch A constants. Sonnet
  `a0d9021c43870832e` resumed for batch-agnostic harness rev3 with an
  independently derived batch B key (ledger 49/80). Author-disclosed
  deviations for RC-3: DNL-3/DNL-4 use legacy `numeric` (D-152 placement
  source; false-reject risk); DNL-4 wrong-direction error has no skill code.
- Earlier phase: **RC-4 batch A ACCEPTED (D-208); RC-2B IN_PROGRESS** (2026-10-22).
  Owner reply "Approve D-207 as proposed and RC-4 all 14". D-207 delegates
  in-scope dispositions and per-item practice acceptance to verified Codex
  `gpt-6.1-sol` sign-off (owner summary, about 3 spot-checks, 7-day veto).
  Opus author `afdfd94645c36a78a` resumed for `draft-B-rev1` (8 DNL/percent
  drafts; ledger 48/80); then RC-1 harness run, RC-3 Codex review and D-207
  sign-off.
- Earlier phase: **RC-3 PASSED; RC-4 AWAITING_HUMAN** (2026-10-22). draft-A-rev2
  (Opus verified 241/241; freeze `496ab837...c758`, patch `5ed7c834...a1c0`;
  only `ratio-tables-2-content-3.json:15` changed; harness 104/104). Codex
  `gpt-6.1-sol` same-thread round 2 (verified) **READY_WITH_RISKS**, CA-R1–R4
  closed, no new findings (`rc3-A/r2/review-r2-report.md` `410f5546...b4d7`).
  Per-item owner request: `rc4-request.md` `c0aeb5bf...aa63` (14 items).
  Residual risks unchanged: K-3/O-10, originality coverage, manual a11y.
- Earlier phase: **RC-3 CORRECTIONS IN_PROGRESS** (2026-10-22). CA-R3/R4 closed by
  Sonnet harness rev2 (64/64 verified; `harness/rev2/`, 104/104). Owner
  dispositions D-205 (CA-R1 (a), narrow evidence) and D-206 (CA-R2 (a), depth
  accepted). Opus author `afdfd94645c36a78a` resumed for `draft-A-rev2`; next
  one Codex same-thread changed-scope re-review of CA-R1–R4, then RC-4.
- Earlier phase: **RC-3 CHANGES_REQUESTED; AWAITING_HUMAN (CA-R1, CA-R2)**
  (2026-10-21). RC-1 harness (Sonnet 56/56, report `0dbbf92e...cad2`): all
  14 drafts pass, verify exit 0 in overlay. RC-3 Codex `gpt-6.1-sol`
  (verified, thread `01a15eae-f16c-72a1-8335-eb30eda75782`; `rc3-A/`): all 14
  answers independently re-solved correct; CA-R1 (major) `ratio-tables-2@content-3`
  evidence still claims an explanation; CA-R2 (major) `unit-rates-2@content-3`
  contest→depth needs owner acceptance; CA-R3/R4 (minor harness assertions)
  routed to the Sonnet implementer.
- Earlier phase: RC-2A FROZEN; RC-1 IN_PROGRESS (2026-10-21). draft-A-rev1
  (Opus 212/212; freeze `7fc0dd4c...6cc6`, add-only patch `734983e9...a5ca`,
  14 records; main `content/ratios` untouched). Author-disclosed deviations
  for review: `unit-rates-2@content-3` mode contest→depth (structured
  validators rejected in contest, `catalog.ts:327-330`); `ratio-tables-2@content-3`
  "describe"→"give" the rate; two number fields reason-only. RC-1 Sonnet
  harness running in isolated copy `rat-rc1-tree`; then RC-3 Codex.
- Earlier phase: RC-2A IN_PROGRESS (2026-10-21). Owner reply "approve all
  recommendations, with engineering sign-off": D-194 (D-61 exception, 22
  drafts), D-195 (engineering sign-off, D-61 applicability), D-196 Q-2 (a),
  D-197 Q-3, D-198 Q-4 (a), D-199 Q-5 (a). RC-2A (14 pilot-lesson drafts)
  dispatched to the original Opus author; RC-1 harness (Sonnet) next, before
  RC-3 Codex review (Codex quota resets 9:34 PM PDT).
- Scope author: Claude Code `forge-expert` agent `afdfd94645c36a78a`
  (verified 96/96 then 137/137 `claude-opus-5-5`). Document-only; no content
  drafted. Bundle: common Git `agent-handoffs/RAT-CONTENT/`.
- rev1 `scope.rev1.md` `2f0e5a90...105a`: Codex `gpt-6.1-sol` (verified,
  thread `01a15bd8-9713-7d70-a016-bbe7bae1644a`) CHANGES_REQUESTED — RC-R1
  (major, TR-7 paths would overwrite protected files), RC-R2 (major, draft
  metadata vs schema), RC-R3–R5 minor; report `review-rev1-report.md`.
- rev2 `scope.rev2.md` `87199e750a6ace25a7634aa490e5f11d3e5b92ecc39ec0e63e3001910b5fca04`
  (closure `aa7678ba...e390`, 59 input pins): same-thread re-review pinned
  `gpt-6.1-sol` (verified) **READY_WITH_RISKS**, all findings closed, no new
  findings; report `review-rev2-report.md`.
- Inventory: 10 reviewed public Ratios practice records (2 per lesson);
  target 6 per lesson (D-36/D-164). Proposal: 20 new identities plus two TR-7
  versions at `content/ratios/{unit-rates-2,ratio-tables-2}-content-3.json`
  (22 drafts). Teaching (5 records) needs a not-yet-built validator (RC-T1).
- Owner request: scope rev2 §5.1 exception text and §5.2 Q-1–Q-5
  (recommendations: Q-1 approve, Q-2 (a), Q-3 as listed, Q-4 (a), Q-5 (a)).
- D-61 applicability (integrator): D-61 permits practice-role authoring for
  an existing program by explicit product-owner decision once D-58/Stage A0
  is done (decisions `:706-709`); D-58 approved and Stage A0 shipped
  (PROGRESS 2026-09-19); `grade-6-math` is an existing available program;
  practice-role and structured contracts are integrated (commit `059c7f6`).
  No held-out, private, rollout or teaching scope is requested. Engineering-
  owner sign-off is requested in the same batch, as for D-173.
- Residual risks: private-bank non-reuse (K-3, needs O-10 or owner risk
  acceptance before RC-5), archive coverage, O-13, D-176 revisit, lane-B
  conflicts in `src/content/catalog.ts` and content tests at RC-5.
- Excluded: drafting before approval, teaching, held-out/private, registration,
  serving, publication, database, commit, push, deployment.
