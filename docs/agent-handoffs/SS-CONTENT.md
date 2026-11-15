# SS-CONTENT — first Social Studies skill and two practice records (D-324 O1)

<!-- relay-phase: IN_PROGRESS -->

## Live relay

- Phase (2026-11-15): **DONE; CONTENT ACCEPTED (D-328) AND APPLIED LOCALLY,
  uncommitted.** Codex `gpt-6.1-sol` scoped re-review r2 READY (0 findings;
  SS-C1 and SS-C2 closed; the new historical claims verified with sources) and
  delegated disposition ACCEPT_CONTENT; patch `5989e250...1002` applied, 13
  files byte-identical to the frozen tree; typecheck, lint (0 errors), `npm test`
  143 files / 4,071 tests, `content:validate` 583 and `eval:run` 36 pass in the
  main checkout. Records stay `pending_review`; the program stays unavailable.
  Open, with the owner: R6 tutor gating, accessibility, availability, release,
  commit/push. The earlier phase notes below are history.
- Follow-up (2026-11-15, D-329): the `hss6-` model-tutoring gate was added and
  accepted as an internal reversible gate; availability prerequisites are listed
  in D-329.
- Earlier phase: **REVISED, FROZEN r2; SCOPED RE-REVIEW RUNNING** (window
  `claude-window-20261114b`, 7 of 10). Revised patch SHA-256
  `5989e250a7f27987536161d72b7ffaa4f79e670f4305d96ca900a55ae25a1002` (13 files,
  +628/-29) on the same baseline `acd259db...`. Integrator verified: hash, clean
  apply to the main working tree, nothing protected, and that ONLY the skill
  JSON, the two record JSON files and `tests/content/social-studies-first-records.test.ts`
  differ from the reviewed r1 tree (`src/` and `prisma/` identical). SS-C1: the
  author re-read the official REP.3 wording and redesigned record 1 around a
  short original account (labelled a summary, not a quotation) mixing incidental
  details (the assembly usually met outdoors on a hillside; some citizens traveled
  in from farms and villages) with the relevant one (those who came voted
  themselves); option C is true per the account but incidental; the analysis
  code is now `CA-HSS-AS.6-8.REP.3` as partial evidence and `HI.1` is gone
  everywhere (checked). SS-C2: direct democracy is defined as eligible
  participants voting on a decision themselves, with "in person" said only of the
  Athenian assembly (it appears only in record 2's Athens sentences). New claims
  the reviewer has not yet seen (outdoors on a hillside, traveled from farms and
  villages) are flagged for its independent historical check. Author-reported
  (opus `claude-opus-5-5`, unverified): `verify` 143 files / 4,071 tests, build,
  `content:validate` 583, eval 36. Frozen patch and tree in
  `agent-handoffs/SS-CONTENT/rev2/`. Codex `gpt-6.1-sol` scoped re-review and the
  D-212 content-acceptance disposition launched.
- Earlier phase: **REVIEW r1 NOT_READY (two majors); D-212 disposition
  REQUEST_CHANGES; r2 CORRECTIONS RUNNING** (window `claude-window-20261114b`, 6
  of 10). Codex `gpt-6.1-sol` on patch `d388f6dd...2f2d`: its independent
  historical-accuracy check PASSED (who could attend, speak and vote; exclusions;
  poorer citizens could take part, so the wealth-only distractor is false; keys B
  and C unique; the Athens-as-direct-democracy framing follows 6.4.3), and the
  full-text `canonicalAnswer` design, hints, worked examples, neutrality, scope and
  counts were judged correct. **SS-C1 major:** `CA-HSS-AS.6-8.HI.1` is not a
  genuine mapping (the stem supplies "ancient Athens", so the learner never places
  events in time and place; "partial evidence" does not meet the dossier rule that
  the analysis mapping be genuine); correct by redesigning record 1 to exercise
  a genuine allowlisted competency (REP.3, relevant versus incidental historical
  information, is the plausible route), updating mapping, evidence wording, review
  rationale and tests together. **SS-C2 major:** record 2 defines direct democracy
  as voting "in person", an Athens-specific practice stated as a universal rule
  (direct decisions can use postal ballots); define it as eligible participants
  voting on the decision themselves and mention in-person assembly only for
  Athens. Integrator rulings sent to the same Opus author: do not merely swap the
  code; keep every historical claim true, with no invented people, dates or false
  specifics; STOP and report if no allowlisted code genuinely fits. A scoped
  re-review follows. Records stay `pending_review`; nothing is accepted yet.
- Earlier phase: **FROZEN r1; INDEPENDENT REVIEW AND DELEGATED CONTENT
  ACCEPTANCE RUNNING** (window `claude-window-20261114b`, 5 of 10). Patch SHA-256
  `d388f6dd3d1c2b0f319ae4b5c12b3d9c501ebe8ec198a4ad26c644e378882f2d` (13 files,
  +572/-29) on baseline commit `acd259db...` (f909a22 + the three accepted
  patches, verified by hash). Integrator checks: hash, clean apply to the main
  working tree, nothing protected, no schema, policy or other-program content,
  no execution path; the integrator read both records. Content: skill
  `hss6-athenian-and-representative-democracy` (standard `CA-HSS.6.4.3` plus the
  analysis code `CA-HSS-AS.6-8.HI.1`, claimed as partial evidence exercised by
  record 1 only; no prerequisites) and two `pending_review` multiple-choice
  practice records: record 1 (foundational, historical comparison of the Athenian
  assembly, stem states that only adult male citizens could vote) and record 2
  (developing, an original school-council scenario classified as direct
  democracy). Author finding: bare option letters as `canonicalAnswer` made two
  tutor regression tests fail (`su-h7-fix2-review-r2` and `-r3`) because a single
  letter matches inside ordinary words, so `canonicalAnswer` is the full option
  text and `acceptedAnswers` is the label plus the full text. The author notes the
  approved research has no Athens detail, so historical accuracy needs the
  reviewer's own check. Author-reported (opus `claude-opus-5-5`, unverified):
  `verify` 143 files / 4,067 tests, build, `content:validate` 579, eval 36;
  integration, migrations and e2e skipped. Open risk carried forward: R6 tutor
  gating covers only `py6-` skills, so it is required before availability. Frozen
  patch and tree in `agent-handoffs/SS-CONTENT/rev1/`. Codex `gpt-6.1-sol`
  review plus the D-212 content-acceptance disposition launched.
- Earlier phase: **DISPATCHED**. Author: Claude Code `forge-expert` (Opus),
  isolated worktree. Reviewer: Codex `gpt-6.1-sol`, read-only (cross-family), who
  also gives the delegated content-acceptance decision under D-212. Window
  `claude-window-20261114b` (shared; 4 of 10 at dispatch).
- Authority: D-324 O1 (narrow D-61 exception for exactly this skill and its two
  `pending_review` practice records, usable now that the slice is integrated) and
  O2 (code format); D-325 (slice accepted and applied); D-212 delegation for
  content acceptance under the owner's 2026-11-14 instruction to push forward.
- Base: `f909a22` plus three frozen patches already applied (uncommitted) in the
  main working tree, in this order: Python r5 (`agent-handoffs/PYTHON-IMPLEMENT/
rev5/python-implement-r5.patch`, SHA-256
  `7cb02094af415a5cd279b1750c9d848945a02e44291fab891f61e308bc67db83`), Social
  Studies r2 (`agent-handoffs/SS-IMPLEMENT/rev2/ss-implement-r2.patch`, SHA-256
  `3f5298e1d035d265acdab54af0d8d2a66bf1bdead146ca200f180b841088dac8`), Python
  content r1 (`agent-handoffs/PYTHON-CONTENT/rev1/python-content-r1.patch`,
  SHA-256 `07f06d30d4b17741c6f26c0469c429ab6f771b5eafc261d58dd9dd945d7e278b`).

## Required baseline (read carefully)

Your worktree starts at committed `HEAD` (`f909a22`), which lacks the three
accepted patches. Verify each hash, apply them in the order above with
`git apply`, and make ONE local baseline commit **on your worktree branch only**
(never `main`, never push) so you can compute your diff. Return a unified diff
against that baseline commit with its SHA-256 and the baseline tree hash.

## Goal

Author exactly what D-324 O1 approves, as `pending_review` in the
`available: false` program: skill `hss6-athenian-and-representative-democracy`
(domain `hss6-ancient-greece`, standard `CA-HSS.6.4.3`) and TWO practice
records. The dossier
`docs/curriculum-dossiers/grade-6-social-studies-authoring-prerequisites-20261010.md`,
section "Recommended first authoring packet" (and "Subject-content contracts" and
"Validation boundary"), is the specification; the approved research dossier
`docs/curriculum-dossiers/grade-6-social-studies-20261010-research.md` is the
source for official wording. Read both before authoring.

## Content spec (from the dossier)

- **Skill:** code `hss6-athenian-and-representative-democracy`, version `1.0.0`,
  program `grade-6-social-studies`, domain `hss6-ancient-greece`, standards
  `CA-HSS.6.4.3` plus AT LEAST ONE source-verified analysis code `CA-HSS-AS.6-8.*`
  from the accepted explicit allowlist (`src/curriculum/social-studies-rules.ts`).
  Choose the analysis code whose official wording (standards pp. 21-22) the
  records genuinely exercise and say why; `REP.2` is only a candidate. If no
  genuine mapping fits, STOP and report; never author analysis-free or invent
  evidence. No prerequisites unless you document a real conceptual dependency.
  `observableEvidence` names the Athenian comparison with deterministic verbs.
- **Records:** TWO `practice`, `core` records, `multiple_choice`, one
  `foundational` and one `developing`, with structurally different tasks:
  (a) historical comparison: select which description matches decision-making by
  eligible Athenian citizens in the assembly versus decisions made by elected
  representatives; (b) transfer: classify an original, generic decision-making
  scenario as direct or representative. Wording must not imply every Athenian
  resident took part (state who could take part), must not rank political
  systems, must not ask for the learner's or family's political preferences, and
  must not conflate this with the Roman Republic (6.7.2). No figures, maps,
  excerpts, quotations or dates. Each record has distractors with a rationale and
  misconception code, full-option-text leakage patterns, a 2 to 3 step hint
  ladder that never reveals the answer, `accessibleAlternative`, accessibility
  notes, and age-appropriate Grade 6 wording.
- **Accuracy:** every historical statement must be correct and stateable from the
  approved research and standards; cite them in your item review packet (links
  only, no copied text). Be precise about Athens (direct participation of eligible
  citizens; not all residents) and about representative democracy.
- **Provenance:** `llm_drafted`, `owned`, `pending_review`, reviewer
  `pending human review`, no `reviewedAt`, and an originality statement that
  names no IMPACT, framework-example or third-party text as a source. Original
  wording only: do not copy or closely paraphrase proprietary lessons, items,
  passages or diagrams.
- **Out of scope:** any other skill or record, teaching or assessment records,
  `depth`, anything about belief systems (6.5), maps, dates, tutor enablement.

## Registration

Follow the Science and Python-content registration precedent (skill JSON under
`content/skills/`, record JSON under a program folder, imports in
`src/curriculum/catalog.ts` and `src/content/catalog.ts`) so the REAL loaders and
the accepted Social Studies rules (explicit allowlist, validator and mode rules,
`RH.`/`WHST.` rejection) validate it. The program stays `available: false`; the
public site must show only the "Coming soon" placeholder; pending records must
stay off the public projection and out of the servable catalog. Update count-based
tests truthfully and add tests that the new skill and records load, are pending,
are withheld and are not servable.

## Item review packet (in your report, not the records)

For each record: the intended correct option and why it is correct, a rationale
and misconception code per distractor, accepted variants, and the standards fit
including the analysis-code argument.

## Hard rules

- No schema or migration change; no availability change; no tutor enablement; no
  other program touched. Do not edit shared status files (`docs/PROGRESS.md`,
  handoff index, decisions), `AGENTS.md` or agent configs.
- No database operation expected; if one is needed, a throwaway synthetic database
  with `DATABASE_URL` set explicitly, never `.env`.
- **Never set `GIT_DIR` or `GIT_WORK_TREE`** when running tests.
- No commit on `main`, no push, no deploy, no paid provider call.

## Done means

Return the diff against your baseline commit with its SHA-256, a
requirements-to-evidence table, the item review packet, the actual model ID, and
exact output of `npm run verify` (if a stub `node_modules` stops the relay tests,
say so and run build and `content:validate` separately), `npm run eval:run` and
`git diff --check`. Report failures honestly, then stop.

## Open gates after this packet

Independent Codex review including historical accuracy, then the D-212 delegated
content-acceptance decision; local application; then the owner's tutor gating
(R6), availability, accessibility, release, commit/push (which also applies
migration 0019 on Render). None are authorized here.
