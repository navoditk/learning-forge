# Science Olympiad Division B authoring prerequisites — independent proposal review

**Date:** 2026-10-10. **Disposition: changes requested; not ready for authoring.**
This is one bounded review of the prerequisite proposal, not curriculum
authoring, human approval, release authorization, or comprehensive independent
verification of the old Olympiad research.

**Latest disposition (revision 2): ready for human review of the prerequisite
proposal, with the bounded notes below; not authorized for authoring.**
The original findings and disposition below remain revision-1 history.

## Revision and independence evidence

- Reviewed proposal:
  `docs/curriculum-dossiers/science-olympiad-b-authoring-prerequisites-20261010.md`.
  SHA-256 independently checked:
  `66a563b85a8e0301ec966b4ef7f712d900a6d1823b48201b95b48838f92bd6f2`.
- Worktree baseline: `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`.
  Independently checked shared-input prefixes match the proposal:
  sources `c53220957d22`, progress `535cd60747a7`, expansion plan
  `58ba797ebe70`.
- Author execution witness supplied by the coordinator: agent
  `fa189d43-66c0-4ee4-967c-1b74dff88b28`, actual model
  `claude-opus-5.5` (Claude family), verified through coordinator
  `task`/`read_agent` evidence, not author self-report.
- Reviewer launch witness supplied by the coordinator: explicit
  `gpt-6.1-sol` selection (GPT family) for this fresh bounded review.
  Cross-family allocation is witnessed by that launch information, not
  this reviewer's self-identification. The reviewer task UUID/read-result
  witness ID was not supplied in the review packet; the coordinator must
  attach it to the execution ledger rather than inventing one here.

Read the approved Olympiad source section (§“Science Olympiad Division B
2027 research — 2026-09-19”), the authoring playbook, D-61, relevant
numbered pedagogy/architecture/student-model documentation, progress and
expansion decisions, content authoring/review requirements, and the cited
schemas, catalog, scorer, registry, learner renderer, public-site generator,
and related tests. No official URLs were fetched, gated manuals inspected,
private banks opened, or new source claims researched.

## Findings

### R1 — High: adversarial examples cannot make substring scoring sound

**References:** proposal §9.2 `G-MATCH`, §10 Validators;
`src/content/answer-matching.ts:43–58`;
`src/contracts/content.ts`, `DeterministicValidatorPartSchema`.

The proposal still permits `composite.parts` after adversarial fixtures and
suggests selecting tokens that negation cannot contain. Every accepted token
can occur in a negated or contradictory response; matching uses unrestricted
`includes`, not clause validation. A finite fixture set does not turn this
into valid compound scientific reasoning evidence. The whole-answer exact
match path also bypasses the parts requirements.

**Minimal fix:** forbid `parts` for this first scope. Use bounded numeric,
ratio, percent, or closed-set whole-answer text responses with explicitly
enumerated accepted forms. If several claims must be assessed, separate the
claims or defer to a reviewed structured-response contract. Never substitute
LLM semantic grading or mastery authority. Retain per-item wrong-answer and
equivalent-form fixtures as checks, not proof of semantic validation.

### R2 — Medium: the exact cardinality contract is not stated accurately

**References:** proposal §9.2 `G-COUNT`, §10 Modes;
`src/content/catalog.ts:469–495`;
`tests/content/catalog.test.ts:36–53`.

The live parser requires practice-role records, but the exactly-two
invariant applies to legacy records, not an all-role-specific practice
batch. Each catalog skill still needs coverage: zero records triggers the
legacy-count check. One role-specific practice item can satisfy that coverage;
the current code does not require one core plus one contest item per skill.
That pair is a proposed authoring policy, not an inherited runtime invariant.

**Minimal fix:** document those distinctions explicitly. If the proposed pair
is retained, enforce it with an Olympiad-specific test. For N new skills
with two items each, total items become `128 + 2N`, reviewed baseline stays
128, and pending becomes `2N` until human review. The proposed two-event
packet gives N = 4–8 and 8–16 new items, not a single-item increment.
Preserve unique IDs, exact chosen counts, coverage, and pending-item
non-serving assertions; do not merely relax the baseline tests.

### R3 — Medium: draft, merge, and learner-release gates are conflated

**References:** proposal §9.2 `G-PUB`, `G-A11Y`, `G-DATA`; §10
preconditions; §12;
`src/phase1/service.ts:223–231`;
`src/app/components/activity-panel.tsx:92–103`;
`scripts/generate-curriculum-site.ts:165–230`.

The missing delivered `accessibleAlternative` is real for data-dependent
figures, but is not an unavoidable blocker for a figure-free item whose
visible prompt supplies every value, label, unit, and relation. A future
structured table contract and alternate-renderer delivery should not be
required before writing that bounded draft. Similarly, the public generator
really renders an unavailable program's skills, but that blocks publication
or merging the graph into its inputs, not an isolated draft. The proposal
already permits holding skills off main under `G-PUB`.

`G-DATA` also allows a fixture to pass when values exist only in the
alternative, despite the alternative not being delivered and the prose
requiring all values in the prompt. Generic semantic completeness cannot be
established merely by finding value strings.

**Minimal fix:** separate authorized isolated drafting, catalog integration,
and learner release. Initially require figure-free, self-contained text and
the existing mandatory alternative field; verify complete equivalence by
human review and targeted fixtures. For that branch, complete data must be
in the rendered prompt, not only the undelivered alternative. Keep
`G-PUB` before graph publication; retain alternative delivery and structured
table/figure contracts as prerequisites when those formats actually become
necessary. No general table renderer or full event build is needed now.

### R4 — Medium: season and new-skill shape need an executable contract

**References:** proposal §§5–6, §9.1, §10;
`src/contracts/curriculum.ts`, `SkillSchema`;
`src/contracts/progression.ts:140–179,222–237`;
`src/curriculum/catalog.ts:146–198`.

The proposal invokes season metadata and per-skill unavailability, but the
cited strict skill/content contracts have neither field. Stable versus
seasonal codes therefore cannot be implemented by silently adding metadata
or setting a nonexistent skill availability flag. The proposal also calls
the legacy `SkillSchema` reusable without specifying a required version for
new skills. Its optional version must not undermine version-pinned
`skillRef` and `itemReadinessRefs`.

**Minimal fix:** name the exact first-packet shape and catalog adaptation:
new skills have explicit versions and pinned conceptual prerequisites; any
legacy-shaped live projection is deliberate and tested. Define where the
season/event mapping and historical alignment labels live using supported
fields or a separately reviewed manifest. Define retirement as removal from
current selection/publication while preserving evidence, not deletion or a
fictional field. Do not promise mastery carryover from a stable prefix alone.
Keep the existing program identifier; adding a season-specific duplicate is
unnecessary.

### R5 — Low: close the stale source-status test blocker

**References:** proposal §5 final paragraph, §12;
main `tests/app/curriculum-sources.test.ts:312–318`.

The isolated author worktree retains the older pending expectation. Main
now expects the Olympiad dossier to be `approved`. The coordinator supplied
43 passing source-label tests after that correction. This is stale snapshot
evidence, not an authoring blocker or a new approval gate.

**Minimal fix:** remove it from the current blocker list and retain only a
dated historical observation if useful. The corrected assertion was read
here; the 43-pass result is coordinator-supplied, not independently rerun
by this reviewer.

## Source fidelity and evidence boundaries

- Heredity and Disease Detectives are both in the approved candidate list.
  Recommending them for original, supplied-data study is reasonable, but the
  detailed examples are proposed Learning Forge skill types, not verified
  2027 topics. The unread email-gated manual establishes no pedigree,
  genetics, outbreak, or other current subtopic coverage here.
- Team-support-only participation, separation from school Science, fictional
  health data, no medical advice, no procedural/build/lab instruction, no
  official-material reproduction, and no tournament-readiness claim are
  appropriately retained. The deferral grouping is explicitly product-side,
  not an official typology. Do not turn equipment/specimen observations into
  new official event requirements.
- Preserve individual artifact dates and the historical 2026 NGSS label.
  `P-SEASON` remains a separate authorized source-revalidation task.
  This proposal review does not close missing comprehensive independent
  verification of the 2026-09-19 dossier.
- Correctness and assistance-aware attempts can evidence only the supplied
  underlying concepts. `masteryCheckRule` text is not executable proof of
  delayed mastery. The inherited access policy denies `DELAYED_CHECK`;
  practice-only drafting does not authorize secure-mastery or assessed
  progression claims, nor unlock C4/C5.

## Readiness and minimal next issue

**Not ready for authoring; revise the proposal before decision handoff.**
No human approval is granted by this report.

Genuine unresolved product choices are the first event/skill scope, annual
identity/season policy, and whether this is inherited non-assessed study or
a separately assessed track. A change to `subjectKind` is optional unless
the owner chooses different product semantics; retaining its existing value
does not itself require a new technical capability. Team framing, no
readiness claims, and conservative safety exclusions remain constraints,
not newly approved decisions. Retain a separately dated D-61 lift/scoped
exception and the independent-source-review gate; any proposed owner
risk-acceptance must be explicit and cannot be called verified research.

After correction and separately recorded authorization, the smallest useful
packet is one approved supplied-data skill, figure-free, practice-only,
unavailable and pending review, using exact whole-response validation.
One core plus one original contest-mode item is sufficient if the owner
retains that pair policy. Keep source/season citation, version pinning,
isolation, scientific accuracy, hint leakage, and answer-equivalence review.
Omit `contestFormat`; defer tables, laboratories, complete event coverage,
teaching roles, private assessments, and progression rollout.

## Validation and change boundary

- Proposal SHA-256 check: passed; shared-input pin comparisons: passed.
- Static contract, scorer, rendering and corrected-main-test inspection:
  completed. Coordinator's source-label result: 43 passing, not rerun here.
- Report-only formatting command:
  `/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null /Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/authoring-prereqs-olympiad/docs/curriculum-dossiers/science-olympiad-b-authoring-prerequisites-20261010-review.md`.
  Result: passed. Report-scoped `git diff --check`: passed.
- No build, tests, database, provider calls, web research, installations,
  agents, commits, or content/schema changes performed. Only this report
  is owned and changed; the shared progress log is left to the coordinator.

## Revision 2 — bounded re-review

**Reviewed SHA-256:**
`3aa73ad871e3305cee268e0014ea2eb03e9134e421bb943a469a928ea3b920df`,
independently checked against the unchanged proposal file on 2026-10-10.
Scope is the five prior findings and directly coupled first-packet contracts,
not a fresh full proposal or source review.

**Verified coordinator witnesses:** reviewer execution UUID
`c8e73d77-3f1a-40c1-b02a-93c769a151a0`, actual model `gpt-6.1-sol`
(GPT family), versus author UUID
`fa189d43-66c0-4ee4-967c-1b74dff88b28`, actual model
`claude-opus-5.5` (Claude family). Identity is attributed to coordinator
launch/result metadata, not model self-report. This supplies the reviewer
UUID missing from the original packet.

### Prior finding dispositions

- **R1 — substring scoring: closed.** §§9.2/10 forbid `composite` and
  `parts`, including their use after adversarial fixtures. Numeric, ratio
  and percent responses use enumerated whole-answer normalized equality;
  text is a single term from a stated closed vocabulary. No LLM grading,
  acceptance or repair authority. Multiple-choice validators and
  `contestFormat` are excluded.
- **R2 — counts: closed for the role-specific first packet.** §9.2
  distinguishes zero-record failure from legacy exactly-two requirements
  and explicitly states there is no exact role-specific count: one, two or
  three practice records are possible. §10 chooses one or two, rather than
  pretending the code enforces a pair.
- **R3 — stages and accessibility: closed.** §11 separates branch drafting,
  merge/public projection and learner release. §§9.2/10 require figure-free
  text with all data in the visible prompt and a complete mandatory
  alternative. New tables, figures and alternative delivery are not
  prerequisites for this text-only draft.
- **R4 — first-packet identity/version shape: closed for the first packet.**
  §5 recommends the existing program code, stable `sob-` prefix, supported
  `SOB27-` standards markers, explicit skill versions and exact item version
  pins. It identifies the domain/prefix integration and program version
  bump, avoids nonexistent metadata/availability fields, and labels the
  recommendation unapproved. See the future-rollover note below.
- **R5 — stale source test: closed.** §5.1 explicitly separates the
  corrected main assertion from the older worker snapshot and removes the
  stale source-test blocker. No repeat test run was required for this
  proposal-only review.

### Directly coupled checks and bounded notes

- **First packet is coherent and bounded:** Heredity-only, core,
  practice-role, text-only closed answers; 2–3 skills with 1–2 items each,
  hence 2–6 new items. Baseline total is therefore `128 + M`, reviewed
  baseline remains 128 and pending becomes M before human content approval.
  One skill/one item could be a still-smaller pilot if the owner prefers;
  that is a scope recommendation, not a correctness blocker.
- **Count precision:** the no-exact-count statement describes an entirely
  role-specific packet. Mixed legacy/role-specific records in a
  skill-graph-only program still encounter the separate legacy-count
  condition in `src/content/catalog.ts:488–494`. No mixed batch is proposed.
- **Supported equivalents, not semantic scoring:** interpret “every
  equivalent form enumerated” as every explicitly supported response form
  within the prompt's representation contract, not all conceivable
  mathematical spellings. Item review must align prompt format, accepted
  variants and equivalence fixtures. Existing normalization is not a
  numeric-expression evaluator.
- **Future rollover clarification (low, non-blocking for this packet):**
  §5's “major version only if its meaning changed” does not specify the
  minor/patch bump when `SOB27-` changes to `SOB28-`. Before annual rollover,
  require a new artifact version whenever record bytes change, even if the
  concept is unchanged; preserve prior records and item references. A stable
  skill code alone does not approve mastery transfer across changed meaning.
  This does not invalidate the first packet's explicit `1.0.0` pins.
- **Public projection status is newer than the worker:** the coordinator
  reports the parent gate implemented, an independent Opus judge's
  ready-for-human-review recommendation, and 76 tests plus lint, typecheck
  and site generation passing. These are coordinator-supplied parent
  evidence, not worker-base implementation or tests independently executed
  here. Proposal §§9.2/12 retain their historical “awaiting judge” snapshot.
  Update that status at integration; a judge recommendation is not human
  acceptance and does not silently satisfy the merge gate.
- **No new source/topic or mastery authority:** §§6–8 still disclose the
  unread 2027 manual, label detailed Heredity skill areas as proposed
  supplied-evidence study rather than verified current topics, preserve
  team-support/safety exclusions and historical NGSS dates, and reject
  tournament-readiness claims. `masteryCheckRule` remains a curricular
  requirement, not proof the inherited denied delayed-check activity is
  available. Comprehensive independent source verification remains G-0,
  distinct from this review and from public-gate implementation.

### Current readiness and validation

**Ready for human review of the prerequisite proposal with the notes above.**
No unresolved high/medium defect from the prior findings blocks that
handoff. This is not human approval or permission to draft, merge or serve.
G-0, the dated D-61 lift/scoped exception, O-1, approval of §5's engineering
recommendation, season revalidation and applicable implementation/release
gates remain explicit. O-4 remains a separate pre-release product choice.

Only this report was edited. No agents, code, database, provider, web
research, source changes or commits were used. Re-review used direct reads
of revision 2 against the prior inspected contracts. Report-only Prettier
and whitespace checks passed after correcting table formatting; the initial
Prettier check reported a formatting-only failure.
