# Grade 6 Social Studies authoring prerequisites — 2026-10-10

**Status: specification only, revision 3 (corrects review findings F1–F5,
F3-R2 and F4-R2).
Ready for bounded changed-hash independent review; not human approval.** This
document specifies what must exist before the first
`grade-6-social-studies` skill and content records are authored. It is not a
skill graph, a lesson, content, a schema change or a runtime change. It does
not lift the `D-61` authoring pause, imply a broad lift, or authorize
publication, provider use or learner availability.

## Provenance and pinned inputs

- Worktree: isolated `authoring-prereqs-social`, base commit
  `4bde6e79bbc8935c2278a3b3f6214fc477a2f2c6`. The worktree also carries
  uncommitted shared-document edits (`docs/PROGRESS.md`,
  `docs/curriculum-sources.md`, `docs/development-expansion-plan.md`) and the
  untracked dossiers directory, all owned by the integrator. This file is the
  only file this worker created or changed.
- Approved research dossier:
  `docs/curriculum-dossiers/grade-6-social-studies-20261010-research.md`,
  SHA-256 `bcbe447863b9300d63646821a4c5ae20c02c72d61f66a7ee2fbe8ac7c32e59e4`.
  The research review pinned `d74f785f…e1d89`. The specification review
  (below) diffed the two revisions and found three approval/handoff hunks
  (research-only approval header, continuing `D-61` gate in the handoff,
  closing approval/authorization distinction) and no change to standards,
  sources, scope or content guidance. This worker relies on that reviewer
  diff and did not repeat it.
- Independent research review:
  `docs/curriculum-dossiers/grade-6-social-studies-20261010-review.md`,
  SHA-256 `93ace0132db1ad8ba30b7bbd8114ec8f522ec0ef98c3ce59078a2daae6c2fc5e`.
- Owner decisions inherited, not re-opened: research approved 2026-10-10
  ("social studies looks good"); California Grade 6 History–Social Science,
  _World History and Geography: Ancient Civilizations_; tiers `core` plus
  `depth`; alignment book ISBN 9780076755905; no unverified district or
  school pacing; owner selected `new-curricula-first` bounded
  prerequisite/spec work followed by independent review (main
  `docs/PROGRESS.md`, entry "New-curriculum prerequisite fleet authorized and
  started").
- Author identity: Social Studies specification worker
  `bd2b8093-5ccc-4b1a-b3c5-a2438da92cdb`, launched by the coordinator with
  `claude-opus-5.5` (Claude family) per the coordinator's launch record in
  main `docs/PROGRESS.md`. This is coordinator task metadata, not model
  self-report.
- Specification review:
  `docs/curriculum-dossiers/grade-6-social-studies-authoring-prerequisites-20261010-review.md`
  (reviewed revision 1, SHA-256 `4979e03c…846652`; recommendation "not ready
  for human review", four major and one minor finding). Reviewer
  `cc06f5a1-b886-4650-be1f-758ae8260724`, `gpt-6.1-sol` (GPT family),
  verified by the coordinator's task/read metadata; cross-family with the
  author (`docs/agent-orchestration.md`, "Actual-model independence").
  Revision 2 corrected F1–F5. The reviewer's revision 2 re-review (SHA-256
  `d6caa3aa…8e2324`) closed F1, F2, F5 and the F4 status conflation and
  left two coupled major findings, F3-R2 and F4-R2. Revision 3 corrects only
  those two. No new research, source retrieval or content authoring was
  done.
- Read for this specification: `AGENTS.md`, `README.md`, main and worktree
  `docs/PROGRESS.md`, `docs/02-curriculum-and-pedagogy.md` (mastery policy),
  `docs/03-system-architecture.md` (deterministic policy row),
  `docs/05-data-and-student-model.md` (mastery calculation),
  `docs/curriculum-authoring-playbook.md`,
  `docs/content-authoring-pipeline.md`, `docs/content-review.md`,
  `docs/curriculum-agents.md`, `docs/agent-orchestration.md`,
  `docs/course-progression-decisions.md` (`D-01`, `D-38`, `D-40`, `D-52`,
  `D-55`, `D-58`, `D-60`, `D-61`), `docs/course-progression-architecture.md`
  §4.2 and §8.1, and the two dossiers above.
- No web retrieval, new research, provider call, database operation,
  install, schema/runtime/content edit, commit or push was performed.

## Scope preserved from approved research

These are fixed inputs. Nothing in this specification narrows them.

| Layer                      | Commitment                                                                                                                                                                                                                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content standards 6.1–6.7  | All **48** substandards are mandatory `core` coverage: 6.1.1–3 (3), 6.2.1–9 (9), 6.3.1–5 (5), 6.4.1–8 (8), 6.5.1–7 (7), 6.6.1–8 (8), 6.7.1–8 (8).                                                                                                                                                                                         |
| 6.4.5 Persian Empire       | Mandatory `core`. Only additional Persian, Parthian and Sasanian detail beyond 6.4.5 is optional framework enrichment.                                                                                                                                                                                                                    |
| Grades 6–8 analysis skills | All **14** are mandatory and embedded: CST 1–3, REP 1–5, HI 1–6. Learned and assessed only through content. Pairing a content skill with one analysis code does not by itself demonstrate coverage of every analysis competency. Instructional coverage and automatically scored evidence are tracked separately (see "Coverage claims"). |
| RH.6–8 and WHST.6–8        | Mandatory embedded reading and writing **support**, mapped to sources. Never History–Social Science content and never a stand-alone literacy mastery claim.                                                                                                                                                                               |
| Framework-only extras      | Optional `depth`, labeled framework enrichment, never prerequisite to `core`.                                                                                                                                                                                                                                                             |
| Sequencing                 | Standards numbering 6.1 → 6.7 and framework Chapter 10 section order are optional teaching sequence. They are **not** prerequisite edges. Prerequisite edges must reflect genuine conceptual dependency (`docs/curriculum-authoring-playbook.md` §1 step 2).                                                                              |
| IMPACT chapter mapping     | Unavailable. Leave unset. Do not invent chapter numbers or titles. Do not request textbook uploads, photos or extracts. Map only to standard codes.                                                                                                                                                                                       |
| Provenance                 | Model-assisted drafts are `provenance.origin: "llm_drafted"`, `licenseStatus: "owned"`, `review.status: "pending_review"`. Never promoted to `original` by any model or review. Human approval is a separate recorded gate. Nothing qualifies as `licensed`.                                                                              |
| Out of scope               | IAC Geography Bee, Grade 6 Science, Grades 7–8 History–Social Science, contest tiers, CA ELD, district pacing.                                                                                                                                                                                                                            |

## Actual repository contracts inspected

All references are to base commit `4bde6e7`.

### Program registry and vocabulary

- `src/contracts/program-codes.ts:4–16` already contains
  `grade-6-social-studies`; `src/contracts/curriculum.ts:6` derives
  `CurriculumProgramSchema` from it. No program-code addition is needed.
- `src/curriculum/program-registry.ts:87–105` registers it as a placeholder:
  `available: false`, **`subjectKind: 'enrichment-non-graded'`**,
  `skillCodePrefix: null`, `progressionMode: 'skill-graph-only'`, no units,
  access policy `grade-6-social-studies-access@1.0.0`, profile
  `grade-6-social-studies-default@1.0.0`.
- `subjectKind` is wrong for an approved school course (research: "School
  course, not enrichment"). It has no runtime consumer beyond
  `ProgramSchema` (`src/contracts/progression.ts:33–37`); the only
  `progressionMode` consumers are `src/content/catalog.ts:488` and
  `src/progression/policy.ts:57`.
- `skillCodePrefix: null` disables the prefix check in
  `validateProgramSkillInvariants` (`src/curriculum/program-registry.ts:129`).
  A prefix is required before any skill lands (playbook §1 step 3a).
- `policy/access-policies/grade-6-social-studies-access.json` grants
  `PRACTICE`, `PLACEMENT`, `REVIEW` and denies `LESSON_ASSESSMENT`,
  `UNIT_ASSESSMENT`, `DELAYED_CHECK`, matching other skill-graph-only
  programs. `policy/progression-profiles/grade-6-social-studies-default.json`
  exists with the shared default weights.
- `src/phase1/program.ts:6–12` rejects any program whose roster entry is
  unavailable, so learners cannot reach Social Studies while
  `available: false`.

### Skill schema

- Live skills use `SkillSchema` (`src/contracts/curriculum.ts:49–81`):
  `domain` is the **closed** enum `CurriculumDomainSchema` (lines 10–39),
  which has no Social Studies domains. `standards` allows 1–10 strings of at
  most 40 characters (line 58). Skill codes match `^[a-z0-9-]+$`.
- `VersionedSkillSchema` (`src/contracts/progression.ts:222–236`) allows a
  free-string domain but is not used by the live `skillCatalog`.
- Domain labels are required in two places: the
  `Record<CurriculumDomain, string>` in
  `scripts/generate-curriculum-site.ts:31` (a type error if missing) and
  `CHAPTER_LABELS` in `src/app/learner-chapters.ts:95` (domain order from
  the enum at line 129).
- `validateSkillCatalog` (`src/curriculum/catalog.ts:145–165`) enforces
  unique codes, resolvable acyclic prerequisites, prefix and same-program
  prerequisites. Skills are static JSON imports into `rawSkills`.

### Content schema and catalog cardinality

- The live catalog parses with `PublishedContentRecordSchema` (role
  discriminated union, `src/contracts/progression.ts:208–219`) and then
  **rejects any non-`practice` record**:
  "The live content catalog may contain practice records only"
  (`src/content/catalog.ts:505`). Teaching, assessment and review records
  therefore have no live path today.
- Cardinality (`src/content/catalog.ts:477–495`): a skill with zero
  role-specific records and not exactly two legacy records throws at module
  load. Every live skill needs **at least one** `practice` record in the
  same change; there is no upper bound for role-specific records.
- Live-catalog rules for validator-bearing records
  (`src/content/catalog.ts:421–468`): `origin: "licensed"` is rejected;
  `licenseStatus` must be `owned`; the canonical answer must be among
  `acceptedAnswers`; no `forbiddenLeakagePatterns` entry may appear
  (case-insensitive substring) in hint text; difficulty must be declared by
  the skill; item misconception codes must be declared by the skill.
- Practice records (`src/contracts/progression.ts:168–178`) require
  `prompt`, `solutionRepresentation`, `solutionMethod`,
  `deterministicValidator`, 1–10 contiguous `hintSteps`,
  `forbiddenLeakagePatterns`, `accessibilityNotes`,
  `accessibleAlternative` (≤1000 characters) and optional `figure`.
- `D-01` is approved as Branch B (held-out): assessment items do not live in
  this repository.
- Only `review.status: "reviewed"` records are servable
  (`src/content/catalog.ts:527`).

### Deterministic answer matching

- Both grading call sites use `matchesAcceptedAnswer`
  (`src/phase1/service.ts:95`, `src/progression/assessment-submission.ts:72`);
  persisted attempts record `scoringMethod: 'DETERMINISTIC'`
  (`src/phase1/service.ts:371`, `src/progression/assessment-submission.ts:352`).
- `normalizeAnswer` (`src/content/answer-matching.ts:19–27`) trims,
  lower-cases, collapses whitespace, strips trailing `.,;!?` and normalizes
  spacing after `,`/`;`. Whole-string equality is checked first; if a
  composite validator has `parts`, each part passes on a **substring**
  match (`answer-matching.ts:56–58`).
- `deterministicValidator.type` is metadata only; grading never branches on
  it. Non-contest `multiple_choice` items embed options in the prompt and
  accept typed labels (for example
  `content/statistics/statistical-questions-1.json` accepts `Question B`
  and `B`). Structured `answerChoices` exist only in `contestFormat`, with
  contest-specific five-choice rules (`src/contracts/content.ts:86–168`).
- The learner response control is a single-line text input
  (`src/app/components/activity-panel.tsx:108–122`). There is no radio or
  ordering control.
- No validator emits partial credit; `PARTIAL` is unreachable
  (`docs/course-progression-architecture.md` §8.1).
- Probe of the actual matcher at the base commit (run with the main
  checkout's `tsx`, no files written):

| Validator                        | Response                   | Result | Consequence for History–Social Science                     |
| -------------------------------- | -------------------------- | ------ | ---------------------------------------------------------- |
| `acceptedAnswers: ["B"]`         | `b.`                       | match  | Acceptable label normalization.                            |
| `acceptedAnswers: ["B"]`         | `not B`                    | reject | Whole-string matching resists negation.                    |
| `parts: [["persia"]]`            | `it was not Persia`        | match  | **False positive:** negation passes a part.                |
| `parts: [["athens"],["sparta"]]` | `athens sparta rome egypt` | match  | **False positive:** listing every option passes.           |
| `parts: [["ur"]]`                | `culture`                  | match  | **False positive:** short place names match inside words.  |
| `parts: [["ce"]]`                | `500 BCE`                  | match  | **False positive:** wrong era passes.                      |
| `acceptedAnswers: ["500 BCE"]`   | `500 B.C.E.`               | reject | False negative unless every era spelling is authored.      |
| `acceptedAnswers: ["500 BCE"]`   | `500 BC`                   | reject | Correct by design only if BC is deliberately not accepted. |
| `acceptedAnswers: ["A, C"]`      | `C, A`                     | reject | Unordered selections are order-sensitive (false negative). |

### Figures, projection and renderers

- `ContentFigureSchema` (`src/contracts/content.ts:170–210`) allows a static
  SVG subset (`circle`, `ellipse`, `g`, `line`, `path`, `polygon`,
  `polyline`, `rect`, `svg`, `text`), requires `viewBox`, blocks event
  handlers, `href`, `xlink:`, `url(` and `<style`, and requires `altText`
  (≤1000) and `caption` (≤300). It has **no source, license or
  long-description field**.
- Learner and public renderers draw the figure as an `<img>` data URI with
  `alt` and `figcaption` (`src/app/components/activity-panel.tsx:93–103`,
  `scripts/generate-curriculum-site.ts:103–109`). Interactive, keyboard
  operable maps or timelines do not exist.
- `publishableContentProjection` (`src/content/publication.ts:13–20`)
  publishes only reviewed teaching/practice records. The public site still
  renders **every skill** of a program that has skills, labeled
  "Draft — pending human approval" when unavailable, including title,
  standards and observable evidence
  (`scripts/generate-curriculum-site.ts:149, 204–221`).
- The site's "Standards covered" statistic counts every distinct string in
  every skill's `standards` (`scripts/generate-curriculum-site.ts:189, 194`),
  independent of whether any reviewed content exists. Literacy tags placed in
  `standards` would be presented as covered standards, and so would the HSS
  content and analysis codes of a skill whose only records are
  `pending_review` (review F3).
- Coordinator status, not verified in this worktree: the parent has
  implemented a shared public gate on main (public output limited to
  available programs and reviewed content pinned to the exact skill version,
  with counts and hidden-skill prerequisite names handled accordingly). An
  independent Opus judge found it ready for human review (76 tests reported
  passing), with the current 64 skills and 128 records unchanged. It is not
  present at base `4bde6e7` in this worktree, is not human-approved and is
  not claimed as implemented here. R5a makes that gate a **required**
  publication contract for this program (F3-R2).

### Tutor and provider boundary

- The live provider prompt is math-specific: "math tutor"
  (`src/tutor/anthropic-model.ts:36`), safety flagging of anything
  "unrelated to … a math tutoring session" (line 40), and a rubric scorer
  for "a Grade 6 math student's written response" (line 141).
- `scoreConstructedResponse` is declared on the provider port
  (`src/contracts/provider.ts:42`) but has no caller that records mastery.
  It must stay unwired for this program.

## Deterministic structured evidence contract

This contract governs every scored Social Studies record (practice now;
held-out assessment, review and delayed check later).

1. **Outcome.** Each attempt yields `CORRECT` or `INCORRECT` from
   `matchesAcceptedAnswer` with `scoringMethod: DETERMINISTIC`. No partial
   credit, no LLM judgment and no rubric scoring contributes to mastery,
   unlock, placement or parent claims. The existing rubric scorer stays
   unwired for this program.
2. **Answer space must be closed.** A scored item must have a finite,
   enumerable set of correct responses that a reviewer can list. Permitted
   formats with today's code:
   - **Single select** (`multiple_choice`): options labeled in the prompt;
     `acceptedAnswers` contains each correct option's full text and its
     label only. Distractors must each map to a declared misconception code.
     Today `multiple_choice` on a general record is validator metadata plus
     prompt text and accepted strings (`src/contracts/content.ts:60–84`,
     `src/content/answer-matching.ts:43–58`). Only contest metadata carries
     choice objects, rationales and misconception fields, and R3 forbids it
     here. No code can therefore confirm a closed choice set, a unique key or
     a distractor-to-misconception mapping (see "Validation boundary").
   - **Ordered sequence** (`text`): one exact canonical order using labels,
     with separator variants authored explicitly. Use only where the order is
     historically unambiguous at the precision taught.
   - **Closed single-term recall** (`text`): one term with a small, reviewed
     spelling-variant list (for example accepted transliterations). No
     sentences.
   - **Numeric** (`numeric`): counts or durations only, never an era-bearing
     date (see the chronology contract).
3. **Forbidden until replaced.** `composite` validators with `parts`, any
   free-text explanation, and any item whose correctness depends on wording
   quality. The probe above shows unacceptable false positives for negation,
   option-listing, short place names and eras. A future part matcher would
   need token boundaries, negation rejection and a maximum-mention rule
   before any reconsideration.
4. **False-positive bar.** Accepting a wrong or hedged response is worse
   than rejecting an unexpected correct phrasing. Reviewers must test each
   accepted answer against: negation, listing every option, wrong era,
   wrong civilization with a shared substring, and a bare label of a
   distractor.
5. **Leakage.** `forbiddenLeakagePatterns` must use full option text or
   distinctive terms, never a single letter or short label, because the
   check is a case-insensitive substring over hint text
   (`src/content/catalog.ts:435–441`).
6. **Observable evidence wording.** `observableEvidence` must describe what
   the deterministic response shows ("selects", "orders", "classifies"),
   never "explains", "argues" or "evaluates" unless that is actually
   scored deterministically.
7. **Mastery evidence.** `docs/02-curriculum-and-pedagogy.md` ("Mastery
   policy") requires independent evidence across time and contexts and a
   delayed independent check before Secure. It does **not** prescribe
   response formats. This specification therefore _recommends_, as authoring
   guidance only, that a skill's records use structurally different tasks or
   contexts. Both may be typed single-select items. `masteryCheckRule` is
   descriptive skill metadata and must describe that policy truthfully. It
   is not an executable gate and adds no mastery rule. A format-based
   mastery gate would be a separate product/pedagogy decision, not part of
   R1–R5. Same-sitting phase-1 checks and delayed evidence stay distinct.
   The current access policy denies `DELAYED_CHECK` progression activities,
   and a skill-graph-only program can only use the existing phase-1
   delayed-review path until a held-out delayed-check source exists
   (`D-63`). Neither this metadata nor the first packet authorizes Secure.
8. **Coverage claims.** Track four statuses separately for each content
   substandard and each analysis competency, and never collapse them:
   - **Planned/mapped:** a code is attached to a skill. This is never
     coverage and is never published; it lives in the unpublished planning
     matrix (R5a).
   - **Reviewed instructional coverage:** reviewed teaching or practice
     material genuinely exercises the official wording. This is a statement
     about the curriculum, not about learner mastery.
   - **Automatically scorable partial evidence:** reviewed closed items whose
     deterministic outcome evidences a narrower, explicitly worded part of
     the competency (see below).
   - **Separately authorized human-reviewed work:** open responses scored
     outside automated mastery. This needs its own future authorization.

   Mapping is separate from evidence. Every authored skill must map at least
   one genuinely relevant Grades 6–8 analysis code (approved research
   handoff), whether or not that competency is automatically scorable and
   whether or not reviewed teaching exists. A code is never omitted because
   it cannot be scored, and mapping it never claims mastery.

   A competency with no delivery path keeps an honest incomplete status; it
   is not marked covered by attaching a code or by partial closed evidence.
   Mandatory RH/WHST support is recorded as source-mapped support only and
   never produces a coverage or mastery claim. RH vocabulary support does
   not establish WHST writing support. Parent-facing statements must cite the
   attempts behind them and use the narrow evidence wording.

### What cannot be validly scored automatically

The following are required learning but cannot produce trustworthy
deterministic or LLM mastery evidence. They may appear only as unscored
practice with a reviewed exemplar shown after the attempt (subject to the
tutoring answer policy), as human-scored work outside mastery, or by
decomposition into closed sub-items that are labeled as partial evidence.

- Written explanations of cause and effect, continuity and change, or
  significance (HI strand), and any comparison across civilizations in
  prose.
- Historical interpretation or argument, including WHST argument and
  informative writing.
- Framing research questions (REP.1) and open source evaluation of
  credibility or point of view in the learner's own words.
- Judgments of fact versus opinion or relevance where reasonable readers
  can disagree on the provided material.
- Open cost–benefit or economic reasoning without a fixed data set.
- Any personal belief or values response. Items must never ask about the
  learner's or family's religion, caste or identity.
- Map drawing, sketching or free placement.

Decomposition may claim only what the closed item shows. For example, an
item where the learner selects which provided statement is supported by a
provided original summary is evidence of selecting support, not of
writing an evidence-based argument. Mastery labels and parent reports must
use that narrower wording. The open competencies above remain mandatory
**instructional** coverage. Delivering them is planning and teaching work,
not a reason to mark them covered by closed partial evidence. This
specification does not require essays, LLM grading or a teaching runtime
before the first closed-choice packet.

### Validation boundary (automated versus review)

Automated checks (R3, R4) can reject only syntax and metadata: validator
type, `parts`/`composite`, `contestFormat`, mode, `figure`, unknown or
literacy codes in `standards`, and leakage substrings. They cannot establish
that options form a closed set, that exactly one option is correct, that a
distractor reflects a named misconception, or that a source mapping is
right. Those are **mandatory author and reviewer checks**, recorded in a
review packet keyed by item ID and version, with:

- prompt option labels and full option text;
- accepted answer variants and the false-positive probes from rule 4;
- per-distractor rationale and misconception code;
- content, analysis and literacy-support source mapping (official code and
  page);
- label- and option-text leakage review of every hint.

`ContentReviewSchema` has no dedicated review-notes field. The packet is a
review artifact beside the records and is not claimed as a schema. A
structured general-choice contract is a possible later shared increment and
is not a prerequisite for the first packet.

## Subject-content contracts

### Religion and belief systems

Apply framework Appendix F to every item touching 6.2.3, 6.3, 6.4.4,
6.5.3–6.5.5, 6.6.3–6.6.4, 6.6.8 and 6.7.6–6.7.7, including hints,
distractors, explanations and accessible alternatives:

- Academic and non-devotional: attribute beliefs ("according to …",
  "… tradition holds", "the New Testament describes") and distinguish
  historical evidence from tradition or scripture.
- No ranking or evaluation of religions, no devotional framing, no
  role-play or simulated ritual, no "we/they" language, and the same
  historical-analysis rigor for every tradition.
- Distractors must not misstate a tradition's beliefs in a way that could
  read as mockery. A wrong option should reflect a plausible learner
  confusion (for example mixing up which civilization), not a caricature.
- Legendary or mythical figures named in standards are labeled as
  tradition.
- 6.5.2 terminology and 6.5.4 social-structure treatment follow research
  decision 5; never equate present-day communities with ancient hierarchy.
- Before any belief-system item is reviewed, research decision 5 must be
  resolved and a qualified reviewer named (see owner choices).

### Chronology and date precision

- Use BCE/CE only. Do not use BC/AD in prompts or accepted answers.
- Never state more precision than the source supports. Use "c." and ranges
  for approximate dates. Prefer relative order and periods over exact years
  for prehistoric and early dates.
- Do not convert to "years ago" (depends on the current year).
- Duration arithmetic across the BCE/CE boundary must account for there
  being no year zero, and the item must state its convention.
- Until an era-aware date validator exists, no item may require typing an
  era-bearing year. Use single-select or ordered-label formats instead.
- Every date fact needs an adult-checked citation recorded in the review
  notes, using the approved primary sources or reviewed scholarship.

### Maps, timelines and figures

- Figures must be original SVG authored for Learning Forge. Do not trace,
  redraw or closely adapt publisher, museum or encyclopedia maps or
  timelines. No raster images, museum objects or translations until
  per-item terms are recorded (research decision 7).
- Because `ContentFigureSchema` has no provenance field, a figure's basis
  and geographic sources must be recorded in the item review packet
  until a figure-provenance field exists.
- Every figure needs `altText` stating the content needed to answer, and
  the record's `accessibleAlternative` must let a learner answer without
  the figure: list labels, relative positions (for example "north of",
  "between", "downstream of") and order. No color-only encoding; label
  regions with SVG `text`.
- Historical borders are approximate. Captions must state the period and
  that boundaries are approximate. Modern borders must not be presented as
  ancient ones.
- Interactive, draggable or click-to-place maps and timelines are out of
  scope until a keyboard-operable control exists.

### Language, age-appropriateness and literacy support

- Grade 6 reading level. Define domain vocabulary in context, as RH.6–8
  support, without turning vocabulary recall into the History–Social
  Science claim.
- Warfare, conquest and slavery: factual, non-graphic, and without
  glorification or trivializing scenarios.
- No stereotyping of modern communities, no Eurocentric framing, and no
  fictional first-person scenarios that put the learner in a religious or
  enslaved role.
- Original summaries replace primary-source excerpts until per-excerpt
  public-domain or license status is recorded. Today the live catalog only
  admits `licenseStatus: owned`, so attributed third-party excerpts have no
  valid representation. Original summaries must be labeled as summaries.
- Child-safety phrasing should follow the `D-55` child-safe phrasing
  artifact when it exists for this subject.

## Reuse and gaps relative to actual code

| Need                                 | Reuse now                                                     | Gap                                                                                  | Needed before                      |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| Program code                         | `grade-6-social-studies` already present                      | None                                                                                 | —                                  |
| Program metadata                     | Registry entry                                                | `subjectKind` and `skillCodePrefix` incorrect for a school course                    | First skill (R1)                   |
| Domains and labels                   | —                                                             | Closed enum and two label maps lack History–Social Science domains                   | First skill (R2)                   |
| Practice records                     | Role union, live practice path, hint ladder, leakage check    | Program-specific validator restrictions                                              | First content (R3)                 |
| Single select                        | Labeled options in prompt plus typed label (existing pattern) | Structured, keyboard radio choices for non-contest items                             | Later accessibility improvement    |
| Ordered sequence                     | Whole-string `text` with authored separator variants          | Ordering control; unordered set validator                                            | Chronology packet                  |
| Era-bearing dates                    | —                                                             | Era-aware date validator (BCE/CE, spelling variants, no year zero)                   | Any typed-date item                |
| Composite clauses                    | `parts` exists                                                | Unsafe for this subject (probe); forbidden                                           | Never, unless replaced             |
| Literacy tags                        | Could fit `standards` (≤40 chars)                             | Would be counted as "Standards covered"; need separate field or projection exclusion | Storing any RH/WHST tag (R4)       |
| Public skill exposure and counts     | Reviewed-content projection; gate reported on main (not here) | Publishes unavailable/pending-only skill metadata and counts their codes as covered  | First packet merge (R5a, required) |
| Closed-choice validation             | Typed label plus accepted strings                             | No general choice set, unique-key or distractor schema; review packet only           | Later shared increment (optional)  |
| Teaching role                        | `TeachingContentItemSchema` exists                            | Live catalog rejects non-practice records                                            | Any teaching record                |
| Held-out assessment, review, delayed | Role schemas exist; `D-01` Branch B                           | Private-store items need their own scoped authorization                              | Lesson/unit assessment or "Secure" |
| Figures and maps                     | Static SVG subset, alt text, accessible alternative           | No figure provenance/license or long description; no interactive controls            | First figure                       |
| Primary-source excerpts              | —                                                             | No public-domain/license representation; `licensed` rejected                         | First excerpt                      |
| Live tutor                           | Fake model and deterministic policy                           | Provider prompts are math-specific                                                   | Learner availability (R6)          |

## Necessary implementation prerequisites

These are one bounded, independently reviewed engineering increment
(registry and validation only, no learning content), owned by the
serialized shared-implementation lane, not by this worker.

- **R1 Registry.** Set `grade-6-social-studies` to
  `subjectKind: 'graded-academic'` and `skillCodePrefix: 'hss6-'`; keep
  `available: false`, `progressionMode: 'skill-graph-only'`, no units and
  the existing policy references. `hss6-` is a recommendation; it must not
  collide with existing `mk6-`, `moems6-`, `amc8-`, `mc6-` and `snsb6-`
  prefixes or bare Grade 6 Math codes.
- **R2 Domains.** Add seven domains to `CurriculumDomainSchema`, one per
  content domain 6.1–6.7 (recommended `hss6-early-humankind`,
  `hss6-mesopotamia-egypt-kush`, `hss6-ancient-israelites`,
  `hss6-ancient-greece`, `hss6-ancient-india`, `hss6-ancient-china`,
  `hss6-ancient-rome`), with labels in both label maps. Analysis skills are
  embedded codes, not domains.
- **R3 Program validation rule** in the live content catalog, for records
  whose skill belongs to `grade-6-social-studies`: validator type is
  `multiple_choice`, `text` or `numeric`; `parts` and `composite` are
  rejected; `contestFormat` is rejected; mode is `core` or `depth`;
  `figure` is rejected until figure provenance exists; every `standards`
  entry matches an allowlisted History–Social Science pattern (recommended
  `^CA-HSS\.6\.[1-7]\.[1-9]$` for content and
  `^CA-HSS-AS\.6-8\.(CST\.[1-3]|REP\.[1-5]|HI\.[1-6])$` for analysis
  skills, subject to owner choice O2), and the same allowlist is applied to
  skills. The 48 content codes must be exact (no 6.1.4, 6.2.10 and so on);
  the regex alone is insufficient, so use an explicit list. These are
  syntactic rejections only. Closed-set, unique-key and misconception checks
  remain review obligations ("Validation boundary").
- **Domain scope.** Only the first packet's domain (`hss6-ancient-greece`)
  is strictly required before its first skill. Adding all seven labels in
  the same small increment is reasonable. Complete graph or content coverage
  is not a prerequisite.
- **R4 Literacy tags.** Reject `RH.` and `WHST.` prefixes in `standards`
  until a separate support-tag field, or an explicit exclusion from coverage
  statistics and parent claims, is implemented and reviewed. Until then,
  record literacy support mapping only in the item review packet ("Validation
  boundary").
- **R5 Matcher regression tests** that pin the probe results above, so any
  future relaxation of R3 must confront them.
- **R5a Required public gate (F3, F3-R2), before the first packet merges.**
  The publication contract for this program is the shared public gate the
  coordinator reports on main: public skill details appear only for an
  **available** program and only where reviewed teaching or practice content
  is pinned to the **exact current skill version**. Unavailable programs'
  skills, pending-only skills, and records pinned to a mismatched or
  obsolete skill version are excluded. Every count (skills, standards,
  records) and every displayed prerequisite name is computed from the same
  filtered set, so a hidden skill is neither counted nor named as a
  prerequisite. Relabeling the existing aggregate as "mapped/planned" is
  **not** an acceptable substitute, and draft skill navigation, metadata,
  prerequisites or counts for this program must not be published. This
  prerequisite is satisfied only after that gate is separately human-approved
  and integrated onto the implementation base. This specification does not
  infer its approval or request another implementation. Planned/mapped
  status stays in the unpublished planning matrix.
- **R6 Tutor gating** (before availability, not before authoring): no real
  provider session for this program until a subject-appropriate,
  feature-flagged template and evals (answer leakage, religion neutrality,
  prompt injection, age-appropriateness) exist.

## Recommended first authoring packet

One skill, practice role only, smallest risk that still exercises the new
contracts. This describes the packet; it contains no content.

| Field            | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Target standard  | `CA-HSS.6.4.3`: state the key differences between **Athenian, or direct, democracy** and **representative democracy** (official wording per the approved research; standards p. 25). The historical comparison with Athens is the target. A generic direct/representative distinction alone does not meet it. Keep the term "representative democracy" and do not conflate it with the Roman Republic (6.7.2), a later packet. Chosen because it needs no religion framing, no map, no primary-source excerpt and no exact dates.                                                                                                                                                                                                                                                                                                                                                                                  |
| Skill            | One skill, recommended code `hss6-athenian-and-representative-democracy`, domain `hss6-ancient-greece`, program `grade-6-social-studies`. `observableEvidence` names the Athenian comparison and uses deterministic verbs ("selects", "classifies").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Analysis skill   | **Required: at least one** source-verified `CA-HSS-AS.6-8.*` code, as the approved research handoff requires for every authored skill (`grade-6-social-studies-20261010-research.md:273–280`). The mapping is curriculum integration and is required whether or not the competency is automatically scorable; it is not a mastery claim. The author designs at least one of the two closed tasks so it genuinely exercises the chosen code's official wording (standards pp. 21–22), with narrowly worded partial evidence where needed. `REP.2` is a candidate only; classifying a democratic system alone is not research, evidence or relevance analysis, so a different fitting code may be chosen. The author verifies the wording and the reviewer re-derives the fit. If no genuine mapping fits, the packet stays pending; it is never authored analysis-free and never relies on invented REP.2 evidence. |
| Literacy support | Embedded domain-vocabulary support in prompt wording (candidate RH.6–8.4, verify). Recorded only in the item review packet (R4); no tag, no claim. Establishes no WHST writing support.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Prerequisites    | None, unless the author documents a genuine conceptual dependency. 6.4.1 and 6.4.2 precede it in sequence only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Role and mode    | `practice`, `core`. No teaching (no live path), no assessment (held-out store, separate authorization), no `depth`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Records          | Two practice records, `foundational` and `developing`, using structurally different **tasks/contexts** (an authoring recommendation, not a mastery rule; F2). Both may be typed single-select. (a) Historical comparison: the learner selects which description matches decision-making by eligible Athenian citizens in the assembly versus decisions made by elected representatives. (b) Transfer: classify an original, generic decision-making scenario as direct or representative. Wording must not imply that every Athenian resident took part, must not rank political systems and must not ask for the learner's or family's political preferences. No figures, excerpts or dates.                                                                                                                                                                                                                      |
| Validator        | `multiple_choice` for both records; full option text plus label accepted; no `parts`; no ordered-label `text` alternative in this packet. Distractor rationales and misconception codes, accepted variants and leakage checks are recorded in the review packet ("Validation boundary"). Leakage patterns use full option text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Provenance       | `llm_drafted`, `owned`, `pending_review`, with an originality statement naming no IMPACT, framework-example or third-party text as a source.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Coverage claimed | 6.4.3 is _mapped/planned_ only. It becomes reviewed instructional coverage only after independent item review confirms the Athenian comparison, and it is never "covered" publicly while the records are pending (R5a). The required analysis code is mapped/planned and becomes reviewed instructional coverage only when review confirms the fit; it never implies analysis mastery. The other 47 content substandards and all analysis competencies without confirmed coverage remain incomplete and are reported that way.                                                                                                                                                                                                                                                                                                                                                                                     |
| Exposure         | Program stays `available: false`. Pending records stay off the public projection. Under the required R5a gate, no skill detail, navigation entry, prerequisite name or count for this program is published while it is unavailable or its records are pending.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Review           | Independent cross-family authoring review (`curriculum-review`) with the item review packet, then owner content review using `docs/content-review.md` plus the subject contracts above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Alternatives considered: starting at 6.1 follows sequence but requires
approximate prehistoric dating; 6.2.1 is map-dependent; 6.3 is belief-system
content requiring decision 5 and a qualified reviewer. All remain later
packets.

A separately reviewed, **unpublished** **coverage matrix** should be authored as a planning
document alongside or before this packet, so the graph is not designed
piecemeal. It has one row per content substandard (48) and per analysis
competency (14), with separate columns for: planned/mapped skill codes,
reviewed instructional coverage, mandatory RH/WHST reading and writing
support (source-mapped), automatically scorable partial evidence (narrow
wording), and separately authorized human-reviewed work. It does not need to
instantiate every possible 48 × 14 pairing. Instructional coverage is not
learner mastery. The matrix is planning metadata, not skill JSON.

### Tests the packet's implementation must add or pass

- Registry: Social Studies is `graded-academic`, prefix `hss6-`, unavailable,
  skill-graph-only, and roster/vocabulary still agree
  (`tests/curriculum/progression-schema.test.ts`).
- Skill catalog: prefix, domain, standards allowlist, acyclic graph,
  same-program prerequisites (`tests/curriculum/skill-catalog.test.ts`).
- Content catalog: R3/R4 rejection fixtures for `parts`, `composite`,
  `contestFormat`, `figure`, unknown standards codes, `RH.`/`WHST.` tags and
  `contest` mode; positive fixture for a valid practice record; at least one
  record per Social Studies skill (`tests/content/catalog.test.ts`).
- Matcher: R5 false-positive and false-negative regression cases
  (`tests/content/answer-matching.test.ts`).
- Exposure: unavailable program rejected by `parseAvailableProgram`;
  pending records excluded from `publishableContentProjection` and from
  `servableContentCatalog`; no prompts, solutions or hints for pending
  records.
- Public gate (R5a), generator fixtures asserting that (a) a Social Studies
  skill in an unavailable program, (b) a skill whose records are all
  `pending_review`, and (c) a skill whose only reviewed record pins an
  obsolete skill version each produce no public skill detail, navigation
  entry or prerequisite name, and add nothing to any skill, standards or
  record count. A reviewed record on the exact current version of an
  available program's skill still appears. Existing Math, contest and
  enrichment output is otherwise unchanged. These may reuse the gate's
  tests once that gate is integrated; today `buildFullDocument` is exercised
  from `tests/content/held-out.test.ts`.
- Commands: `npm run format:check`, `npm run lint`, `npm run typecheck`,
  `npm run content:validate`, `npm test`, `npm run build` (or
  `npm run verify`).

## Owner choices

**Inherited; no new decision needed:** research scope and sources; core plus
depth; ISBN alignment only; no pacing; no textbook uploads; standards-first
ordering with unset chapter mapping (research decision 1, option a);
provenance rules; Appendix F as the governing religion guidance as stated in
the approved dossier; mandatory meaning a product commitment (decision 8);
media blocked until per-item terms (decision 7); `D-01` Branch B; registry
correction R1 (a factual fix following the approved "school course" scope,
confirmed in engineering review).

**Genuinely new, minimal:**

- **O1 — Narrow `D-61` exception.** A dated, recorded owner decision
  permitting only the practice-role first packet above (one skill, two
  `pending_review` practice records, `available: false`), after R1–R5a
  merge. `D-61`'s earlier practice exception refers to an existing program;
  a registered placeholder with no authored curriculum does not inherit a
  blanket lift.
  `D-61` explicitly allows a narrower practice-role option "by explicit
  product-owner decision" that "should be recorded here rather than
  assumed". No broad lift.
- **O2 — Code and tag format** (research decisions 3 and 4). Confirm
  `CA-HSS.6.x.y` and `CA-HSS-AS.6-8.<strand>.<n>`, and that RH/WHST tags are
  stored only after R4 provides a non-claiming field (until then, review
  packet only). This does not reopen whether RH/WHST support is mandatory.
  Exact allowlists, collision checks, domain integrity and labels are
  engineering invariants, not owner choices. Recommended: yes.
- **Not needed:** a format-based mastery policy. If the owner wants one, it
  is a separate product/pedagogy decision (F2), not part of this packet.

**Deferred; not needed for the first packet:** decision 5 (6.5.2 framing,
qualified religion-neutral reviewer) before any belief-system or 6.5 item;
decision 2 before any `depth` item; progression mode (units or hybrid) before
lesson/unit work; delayed-check and held-out item authorization; figure
provenance before any map; learner availability and tutor enablement.

## Blockers

1. `D-61` remains in force; O1 is not recorded.
2. R1–R5a are not implemented in this worktree. A Social Studies skill
   cannot land today without a prefix check, domain enum entries, program
   validation and the required public gate (R5a). The main-branch gate the
   coordinator reports awaits human approval and is not on this base.
3. No live teaching path, no held-out assessment authorization, no era-aware
   date validator, no figure provenance and no excerpt licensing
   representation. These block later packets, not the first one.
4. The live tutor provider prompt is math-specific; this blocks learner
   availability, not authoring.
5. The revision 2 re-review returned "not ready for human review" (F3-R2,
   F4-R2). This revision's bounded changed-hash review is pending.

## Next steps

1. Bounded changed-hash cross-family review of the F3-R2 and F4-R2
   corrections in this revision.
2. If accepted, the owner decides O1 and O2.
3. The serialized implementation lane implements R1–R5 and integrates the
   human-approved shared public gate as R5a with the tests above, under
   independent implementation review.
4. Only then does a `curriculum-author` draft the first packet and the
   coverage matrix, followed by independent review and owner content review.

**Disposition: ready for bounded changed-hash independent review. Not human
approval; `D-61` is not lifted, and authoring, publication and runtime
enablement remain unauthorized.**
