# Grade 6 Math Ratios first-unit plan (MATH6-RATIOS-PLAN)

**Status: REVISION 3, FROZEN DRAFT for changed-scope Codex review. Not
approved.** Revision 2 made bounded corrections for review findings R-1 to
R-3 (`docs/math6-ratios-plan-20261012-review.md`); revision 3 corrects
residual R-1 and IC-3 wording
(`docs/math6-ratios-plan-20261012-rereview.md`); see section 9. This is the
sole owned artifact of packet
`docs/agent-handoffs/MATH6-RATIOS-PLAN.md` (owner scope approval
2026-10-12). It changes no curriculum record, catalog, code, schema, policy,
decision or gate record, and authorizes nothing. Every choice below is a
recommendation for the owner after independent review. Nothing here is a
default, and no packet listed in section 5 may start because it is written
here.

- **Author:** Claude Code `forge-expert`, runtime model `claude-opus-5-5`
  (Opus 5.5), from client system metadata.
- **Baseline:** main `3e7c33372599d20c285656c3610ca6e47743240f`. Committed
  code, content, policy, tests and experiment files were read from a detached
  worktree at that commit. Uncommitted or untracked planning documents (the
  accepted reconciliation, integration plan, decision matrix, packet, resume
  index, PROGRESS) were read read-only from the main checkout. Every consumed
  input and its SHA-256 is in the input manifest preserved with the frozen
  handoff evidence, not in this file.
- **Not accessed:** private assessment packages or drafts, learner data,
  databases, providers. No content was drafted, no code was executed, no test
  suite was run, and no new source research was done.

## 0. Labels and authority

| Label     | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| **OBS**   | Observed in baseline bytes by static reading or hashing                                  |
| **APP**   | Approval in a cited decision or gate record, quoted within its recorded scope only       |
| **REC**   | This author's recommendation; not approved, not a default, not implementation permission |
| **MISS**  | Evidence or value needed for a claim or choice is absent                                 |
| **CONF**  | Two records, or a record and current bytes, disagree                                     |
| **OWNER** | A choice only the owner (or a named approver) can make                                   |

Authority: `docs/course-progression-decisions.md` for D-nn values;
`docs/course-progression-review/manual-gate-record.md` for release;
`docs/curriculum-sources.md`, "Candidate Grade 6 Math v2 research —
2026-09-15", for the standards boundary (rows `6.RP.A.1`–`6.RP.A.3`); the
accepted reconciliation (`docs/grade-6-math-reconciliation.md`, revision 3)
for observed defects and gap rows. Reconciliation recommendations (R-1–R-9,
O-dispositions) are inputs to test here, not approvals.

### 0.1 Approved values and decisions consumed (APP, scope as recorded)

| ID                 | Approved value used here                                                                                                                                           | Recorded scope                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| D-149              | Retain the 27-code structure with versioned refinements; an approved evidence rule is required before combining skill versions                                     | Direction only; no numeric rule, crosswalk approval or migration       |
| D-150              | First unit: `ratio-language`, `unit-rates`, `ratio-tables`, `double-number-lines`, `percent-applications`                                                          | Selection only; no drafting, private access, version edit, release     |
| D-01 / D-02        | Branch B held-out assessment; private reviewed package                                                                                                             | Program-wide                                                           |
| D-22               | `placementProbeMaxItems` 5                                                                                                                                         | Profile `grade-6-math-default@1.1.0` (OBS value 5)                     |
| D-23 – D-27        | Lesson 3 items, 3 of 3; unit 6 items, 5 of 6; `maxReassessments` 2                                                                                                 | Profile values (OBS in `grade-6-math-default-1.1.0.json`)              |
| D-36               | One teaching record per lesson; six practice records per lesson (four threshold plus two headroom); review records per skill; 9 lesson-bank and 18 unit-bank items | **The initial three-lesson pilot only**; expansion separately reviewed |
| D-42 / D-49        | `lessonMinPracticeItems` 4; practice records per lesson at least D-42 plus headroom (headroom not numeric)                                                         | Policy key; D-49 headroom value exists only through D-36's pilot scope |
| D-43 / D-44        | Delayed check 2 items, 2 of 2; no reuse                                                                                                                            | Profile values                                                         |
| D-48               | `teachingRecordsPerLesson` 1, second representation optional                                                                                                       | Policy key; whether it binds a first-unit release is O-12              |
| D-50 / D-67        | Review records per skill amended to 3; review reuse after two runs                                                                                                 | Treated as pilot-scoped by the accepted reconciliation (R-8)           |
| D-53 / D-60 / D-62 | Legacy grants for unclaimed skills; hybrid access; placement/review need assignments only for unit-claimed skills                                                  | Program-wide                                                           |
| D-57               | Required `version` on `Skill`                                                                                                                                      | Approved; not implemented for Grade 6 skill records (OBS)              |
| D-61               | Authoring pause with narrow recorded exceptions (D-66, D-73, D-74, D-148)                                                                                          | None of the exceptions covers the work in this plan                    |
| D-63               | Delayed-check bank per pilot skill, 2 × 3 = 6                                                                                                                      | Pilot skills                                                           |
| D-64 / D-68        | Placement probes reviewed public practice, one item per unit skill, in lesson order                                                                                | Program-wide; route fails closed above D-22                            |
| D-148              | 296 private draft items (incl. 2 × 9 Ratios extension lesson-bank items and an 8-item Ratios unit-bank supplement), `pending_review`, never registered or served   | Draft-only exception                                                   |

## 1. Scope and current state of the Ratios unit (OBS)

- **Live:** unit `ratios-and-proportional-reasoning@1.0.0` in
  `COURSE_CATALOG` with lessons `ratio-language-lesson`, `unit-rates-lesson`,
  `ratio-tables-lesson` (all `1.0.0`, `unitRef` the unit `1.0.0`), 10 bank
  metadata records pinned in `BANK_HASHES`, registered by
  `grade-6-math@1.0.0` (`progressionMode: hybrid`,
  `grade-6-math-access@1.1.0`, profile `grade-6-math-default@1.1.0`).
- **Disconnected:** `ratios-extension-catalog.ts` lessons
  `double-number-lines-lesson@1.0.0` and `percent-applications-lesson@1.0.0`,
  `unitRef` pinned to unit `1.0.0`, which does not list them; their bank
  refs resolve to nothing; a test asserts they remain unwired.
- **Skills (all `1.0.0` by ref; no `version` field on the JSON):** graph
  edges `unit-rates → ratio-language`, `double-number-lines → ratio-tables`,
  `percent-applications → unit-rates`; `ratio-language` and `ratio-tables`
  are roots (D-35 removed `ratio-tables → unit-rates`).
- **Practice:** 10 public reviewed items, 2 per skill; no teaching record
  exists anywhere in `content/` (OBS; teaching catalogs are T1 synthetic
  shapes only).
- **Access:** `grade-6-math-access@1.1.0` grants `PRACTICE`, `PLACEMENT`,
  `REVIEW`, `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, `DELAYED_CHECK`; no
  `TEACHING` grant.

CONF (new, from bytes): D-36 approved six practice records per pilot lesson;
each pilot lesson references two. `lessonMinPracticeItems` (4) is declared in
the policy contract but has no runtime consumer (OBS: only
`src/contracts/policy.ts`), so the gap is not enforced today. Ordinary
completion remains an open contract (resume index, COMPLETION-CONTRACT).

CONF (new, from history): commit `5a452de` (2026-10-09) bumped
`unit-rates-2` and `ratio-tables-2` to `content-2` and re-pinned their hashes
inside the existing `*-lesson@1.0.0` records while leaving the ref label
`content-1`. Lesson `1.0.0` therefore has had two byte states. The same
commit changed shared matcher behavior (added the `parts` path) without any
version marker; `Attempt` stores `contentKey`, `contentVersion`,
`learnerResponse`, `normalizedResponse` and `scoringMethod`
(`DETERMINISTIC`/`RUBRIC`/`UNSCORED`), not a matcher version (OBS
`prisma/schema.prisma`).

## 2. Five-skill/lesson coverage map (deliverable 1)

### 2.1 Unit frame (REC)

New unit version listing five lessons in the order `ratio-language-lesson`,
`unit-rates-lesson`, `ratio-tables-lesson`, `double-number-lines-lesson`,
`percent-applications-lesson`. This keeps the pilot's existing lesson order
and places each lesson after its skill prerequisites. Five skills equal the
D-22 cap exactly (APP), so placement can draw one item per skill; the unit has
**no headroom**. Any sixth skill would make the placement route fail closed
(D-68 note) and would also amend the D-150 selection.

### 2.2 Coverage by skill and lesson

Subcompetencies follow the approved dossier wording and the reconciliation's
section 3.2 split. Hashes are SHA-256 of the item file at baseline; each
matches the hash pinned in the existing lesson record (OBS). All public items
are `role: practice`, `review.status: reviewed`, `provenance.origin:
original`, `licenseStatus: owned`; review dates are 2026-09-06 even where
bytes changed later (O-13, below).

| Skill / lesson                                                    | Dossier subcompetency                                                                    | Reusable public items (id@version, hash)                                                                                                        | Defects or limits (label)                                                                                                                                                                                                          | Missing competency (REC)                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ratio-language` (6.RP.A.1) / `ratio-language-lesson`             | Ratio concepts; ratio language in context (meaning)                                      | `ratio-language-1@content-1` `e20f92b3…8b50` (part-to-part, simplest form); `ratio-language-2@content-1` `d05ea89e…ebc5` (equivalent ratio)     | `-1` accepts `2/3` for a part-to-part ratio and reportedly rejects `2 : 3` (subject review; reconciliation 3.2, 4.2). `-2` asks "Explain how you know" but grades only the number (superficial for meaning)                        | Part-to-whole ratio; a gradable statement of what each number compares                                                                                                                                                                                                                                           |
| `unit-rates` (6.RP.A.2, A.3) / `unit-rates-lesson`                | Determine and interpret unit rate; non-complex fractional unit rates; unit-rate problems | `unit-rates-1@content-1` `0aee4911…9428` (determine); `unit-rates-2@content-2` `ea3b8c81…b0fc` (interpret, compare)                             | `-2`: lesson ref pins label `content-1` (CONF); `parts` substring path accepts incorrect responses (static mechanism confirmed by reviewer; examples author-reported); bytes changed 2026-10-09 with `reviewedAt` unchanged (O-13) | An explicit non-complex fractional unit-rate result from whole-number quantities, with its interpretation and units (decimal unit rates already occur, e.g. the per-bottle costs in `unit-rates-2`; no production or candidate item states and interprets a fractional rate); conversions if O-3 homes them here |
| `ratio-tables` (6.RP.A.3) / `ratio-tables-lesson`                 | Tables of equivalent ratios; unit-rate problems                                          | `ratio-tables-1@content-1` `bba24d9e…848b` (scale a table; whole-string composite, no `parts`); `ratio-tables-2@content-2` `10ace306…1b88`      | `-2`: label `content-1` (CONF); `parts` accepts `180, 16` (reviewer-confirmed statically); `equivalenceNotes` requires order that `parts` does not enforce; O-13 as above                                                          | None beyond scorer repair                                                                                                                                                                                                                                                                                        |
| `double-number-lines` (6.RP.A.3) / `double-number-lines-lesson`   | Equivalent ratios using the representation                                               | `double-number-lines-1@content-1` `9a3f1e89…036b`; `double-number-lines-2@content-1` `695e5908…4d1f`                                            | Neither item presents or asks for a double number line; both are plain proportion problems (superficial for the representation). The skill's own evidence statement names the representation                                       | Learner reads or completes corresponding values on two aligned number lines                                                                                                                                                                                                                                      |
| `percent-applications` (6.RP.A.3) / `percent-applications-lesson` | Percentages                                                                              | `percent-applications-1@content-1` `7977fde3…bf52` (percent of a quantity); `percent-applications-2@content-1` `ff0cc8f7…fc85` (find the whole) | Skill evidence says "converts between a percent, fraction, and decimal"; both items grade only the result (author reading; subject review)                                                                                         | None required by the reconciliation; conversion evidence only if O-3 places conversions here                                                                                                                                                                                                                     |

Teaching: none for any lesson. Placement: each pilot lesson's first ref is
eligible at `content-1`; each extension lesson's first ref is `content-1` and
matches its record, so all five would yield a probe item if wired as
authored (OBS against `placement-probe.ts` matching rules).

### 2.3 Role readiness (OBS unless labeled)

| Skill(s)                                       | Teaching | Public practice                | Lesson bank                                     | Unit bank                                                                | Review bank               | Delayed-check bank        | Placement source                                              |
| ---------------------------------------------- | -------- | ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------ | ------------------------- | ------------------------- | ------------------------------------------------------------- |
| `ratio-language`, `unit-rates`, `ratio-tables` | None     | 2 each (D-36 pilot value is 6) | Private, reviewed, 9 each (gate 2026-10-05)     | Private, reviewed, 18, covers these 3 (stretch items kept per D-73 note) | Private, reviewed, 3 each | Private, reviewed, 6 each | Eligible                                                      |
| `double-number-lines`, `percent-applications`  | None     | 2 each                         | D-148 draft, 9 each, unreviewed (metadata only) | D-148 8-item supplement, unreviewed, not merged                          | None recorded             | None recorded             | Eligible if wired; DNL items do not elicit the representation |

MISS: whether any D-148 or pilot private item uses `parts`; the per-skill
split of the 8-item supplement; D-148 bank codes, versions and `targetRef`s;
any digests for D-148 banks. All require O-10 scope.

### 2.4 Candidate reuse (narrow REC; no adoption)

Source: `experiments/grade-6-math-v2/content-records-v2.json` at baseline.
All four Ratios candidate items are `candidate-content-1`, `pending_review`,
`llm_drafted`/`owned`, under unversioned candidate skills
`ratio-language-and-meaning` and `rate-and-proportional-reasoning`. No
approval covers candidate content (reconciliation 1.4, MISS). The candidate
file is a frozen experiment: it stays byte-identical so that each
`id@candidate-content-1` remains resolvable from Git history; a converted
production item is a **new production identity** whose provenance records the
candidate id, version and baseline commit it derives from, and which starts
`pending_review`. Candidate items are already public in Git, so they and any
derivatives are **never eligible for held-out banks**.

| Candidate item                   | Target skill / lesson                  | Fit                                                                                   | Conversion requirements beyond role/`skillRef`/`itemReadinessRefs` and field removal                                                                                                            | REC                                                                                                          |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `v2-ratio-language-snack-mix`    | `ratio-language`                       | Elicits part-to-whole, the production gap                                             | Remove content-level `prerequisiteSkillCodes`, `answerFormat`, `misconceptionDistractors`; map misconceptions to `ratio-language` codes; whole-string accepted forms reviewed for false rejects | Reuse first                                                                                                  |
| `v2-ratio-language-art-supplies` | `ratio-language`                       | Part-to-part plus "what the numbers compare"; meaning graded by fixed phrases         | Same, plus a gradable form for the comparison statement (fixed full sentences risk false rejects; D-73 defect class)                                                                            | Optional; only with a reviewed gradable comparison format                                                    |
| `v2-rate-table-and-unit-rate`    | `ratio-tables` or `unit-rates`         | Table plus unit rate; overlaps both lessons; cyclist context resembles `unit-rates-1` | Drop sub-letter tag `6.RP.A.3a` (outside skill standards; V-8); replace `parts` with the O-9 format; structural-duplication check against `unit-rates-1`                                        | Reuse in `ratio-tables-lesson` after O-9 format exists                                                       |
| `v2-rate-percent-and-conversion` | `unit-rates` or `percent-applications` | Measurement conversion then a 150 % scale; two competencies in one item               | Drop sub-letter tags `6.RP.A.3c`, `6.RP.A.3d`; one `skillRef` only; replace `parts`; subject review of the dual-competency design                                                               | Use only as model for separate single-competency tasks; adopt as-is only if P1 accepts dual-competency items |

### 2.5 Task and response requirements for the missing competencies (REC)

Requirements only; no item is drafted. "Structured" means the O-9 response
format in section 3.3; until it exists, only single-answer variants may be
authored.

| ID   | Competency                               | Lesson                             | Observable task requirement                                                                                                                                                                                                                                                                                                                                                   | Response and scoring requirement                                                                                     | Difficulty band constraint (OBS loader) |
| ---- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| TR-1 | RP.A.1 part-to-whole                     | `ratio-language-lesson`            | Learner states a part-to-whole ratio in a named order                                                                                                                                                                                                                                                                                                                         | Single ratio answer; accepted notations decided by P1 (incl. whether fraction notation is accepted for part-to-part) | foundational or developing              |
| TR-2 | RP.A.1 meaning                           | `ratio-language-lesson`            | Learner identifies which quantities a given ratio compares and in which order                                                                                                                                                                                                                                                                                                 | Selected response or structured fields; never ungraded "explain" text                                                | foundational or developing              |
| TR-3 | RP.A.2 non-complex fractional unit rates | `unit-rates-lesson`                | Learner determines and interprets a non-complex fractional unit rate from whole-number quantities, identifies the quantity per one unit and uses appropriate rate language and units. Ratios of fractional quantities (complex-fraction unit rates) are not required Grade 6 coverage; D-73's separate intentional stretch decision for existing unit-bank items is unchanged | Accepted fraction, decimal or mixed-number forms preserve value and units under reviewed scoring requirements (V-7)  | any of the skill's three bands          |
| TR-4 | RP.A.3 conversions                       | O-3 home (REC `unit-rates-lesson`) | Learner converts a measurement using a stated conversion rate                                                                                                                                                                                                                                                                                                                 | Single numeric with unit; separate from percent tasks                                                                | home skill's bands                      |
| TR-5 | RP.A.3 double number line (read)         | `double-number-lines-lesson`       | Learner is given two aligned number lines (reviewed static figure plus a complete text alternative listing aligned pairs) and supplies one missing corresponding value                                                                                                                                                                                                        | Single numeric (works with today's scorer)                                                                           | developing or challenging               |
| TR-6 | RP.A.3 double number line (complete)     | `double-number-lines-lesson`       | Learner supplies values at several labeled positions of the second line from a stated ratio                                                                                                                                                                                                                                                                                   | Structured, per-position labeled fields; order fixed by labels; requires O-9 implementation                          | developing or challenging               |
| TR-7 | Repair `unit-rates-2`, `ratio-tables-2`  | pilot lessons                      | Same tasks, no substring-`parts` reliance                                                                                                                                                                                                                                                                                                                                     | New item versions in the O-9 format (or whole-string only, accepting false-reject risk)                              | unchanged                               |

Common requirements: original wording (dossier content-tier rules); each new
item uses misconception codes already on its skill (the loader checks them;
adding a code changes the skill record, see C-2); `standards` within the
owning skill's list (V-8); an `accessibleAlternative` sufficient without the
figure; hints pass the forbidden-pattern scan; no numbers or contexts shared
with private banks (checked in RAT-PACKAGE).

## 3. Choices for O-3 (Ratios), O-8, O-9, O-11, O-12 (deliverable 2)

### 3.1 O-3a: home for 6.RP.A.3 conversions

Precondition (MISS): the dossier says "percentages, and conversions" without
saying which conversions. The reconciliation and the candidate read it as
measurement-unit conversion; `percent-applications`' evidence names
percent/fraction/decimal conversion. RAT-SUBJECT must settle the reading
against the registered CDE source, with no new research.

| Option                          | Consequence                                                                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. `unit-rates@1.0.0` (REC)** | Skill already claims 6.RP.A.3; its evidence ("applies [a unit rate] to answer a related quantity question") can cover a conversion rate. No skill version, no new lesson, no D-149 rule |
| B. `ratio-tables@1.0.0`         | Possible via tables; evidence statement is about extending tables, so conversions fit less directly                                                                                     |
| C. `percent-applications@1.0.0` | Only if RAT-SUBJECT reads "conversions" as percent/fraction/decimal; then the gap is that items grade only results, not a missing home                                                  |
| D. New skill                    | Rejected: amends D-150 and exceeds the D-22 cap (sixth skill)                                                                                                                           |

REC: A, conditional on RAT-SUBJECT confirming the measurement reading and
that conversion tasks fall within the existing `unit-rates` evidence and
misconception codes. If review finds the evidence statement must change,
that is a `unit-rates` skill version (C-2), which triggers D-149's evidence
rule and the D-57 implementation; the owner should then reconsider B.

### 3.2 O-3b: `double-number-lines` version versus items, and representation

| Option                                                     | Consequence                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Keep skill `1.0.0`; add representation items (REC)**  | The skill record already defines the evidence as matching values on two number lines; the defect is in the items. No skill version, no D-149 rule, no D-57 dependency. Limitation: existing DNL practice evidence came from items that do not elicit the representation and keeps counting toward `1.0.0` |
| B. New skill version with representation-specific evidence | Separates old weak evidence, but requires D-57 implementation, a reviewed D-149 evidence rule, new bank coverage refs and a `MasteryEstimate` key that can distinguish versions (today it cannot, OBS)                                                                                                    |

REC: A. In the new lesson version, the first practice ref (the D-64/D-68
placement source) and the items counted toward the D-42 threshold are
representation tasks (TR-5, later TR-6); the two existing items remain
available as later practice. Representation: a reviewed static SVG figure
(`ContentFigureSchema`; practice figures already render with alt text in the
learner panel, OBS) plus a text alternative giving the aligned value pairs
and the blank positions. ADR-0004 is still **Proposed** (OBS); this plan does
not depend on accepting it beyond the existing figure schema. TR-5 needs no
new scorer; TR-6 waits for RAT-SCORE-IMPL. Teaching for this lesson should
introduce the representation (O-12).

Limitation needing owner disposition (OWNER, no choice made here): under
option A, any evidence recorded for `double-number-lines@1.0.0` from the two
existing items, which do not elicit the representation, would continue
counting toward the same skill version alongside later representation
evidence. No learner data was inspected, so whether any such evidence exists
is unknown and would need an authorized database scope. Option A would not
discount, remap or separate it.
The owner must accept this limitation explicitly, choose option B with its
dependencies, or request another reviewed treatment; this plan does not
decide which (IC-3).

The same reasoning gives O-3c (not separately requested): part-to-whole and
meaning tasks for `ratio-language` fit its existing evidence statement and
misconception `confuses-part-to-part-and-part-to-whole`; REC: items under
`ratio-language@1.0.0`, no version.

### 3.3 O-8: new-version reference fixes

| Option                                               | Consequence                                                                                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. New lesson versions with correct labels (REC)** | Lessons `1.0.0` stay frozen at their current bytes; their mislabeled refs are documented, not rewritten (the hash identifies the bytes since 2026-10-09) |
| B. Edit `1.0.0` refs in place                        | Rejected: repeats the 2026-10-09 in-place mutation; breaks `id@version` immutability for structure records and the catalog digest                        |

REC: A, combined with TR-7 and the added practice refs so each pilot lesson
changes version once. Every new ref's `version` must equal the record's
`version` (V-2, a new test in RAT-CATALOG-IMPL). The extension lessons
(`1.0.0`, never registered) are replaced by lessons pointing at the new unit
version; whether the replacements reuse label `1.0.0` or take a new label is
an engineering choice in RAT-CATALOG-DESIGN, constrained by whatever
`targetRef`s the D-148 banks carry (MISS until O-10). E&E and Geometry
wrapper label fixes belong to those units' later packets.

### 3.4 O-9: scoring design scope

| Option                                                                 | Consequence                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A. Whole-string validators only for new Ratios versions                | No engine change; repairs false accepts for the two items but reintroduces false rejects (the D-73 class) and cannot express TR-6                                                                                                    |
| B. Harden the shared `parts` matcher in place                          | Cannot be made sound for free text in general (negation, extra claims); silently changes scoring of every existing `id@version` that uses `parts`, with no matcher version on `Attempt` (OBS)                                        |
| **C. Structured multi-field response contract, opt-in per item (REC)** | Each labeled field has its own deterministic validator; order is by label; the matching mode is a field in the item's validator, so new semantics arrive only through new item versions and old attempts keep their recorded meaning |

REC: C, as one design packet then one implementation packet. Scope:
validator/response contract, learner input (accessible labeled fields),
practice grading path, assessment submission path (private items may use
it), attempt storage of a structured response, and fail-closed handling of
unknown modes. Out of scope: rescoring historical attempts (never), changing
the semantics of the existing `parts` path (`answer-matching.ts` line 56),
migrating other domains' `parts` items (their own packets), semantic or LLM
grading. If attempt storage changes the database schema, the packet also
needs migration and privacy approval. Scoring is a critical surface:
cross-family review is mandatory (agent-orchestration policy).

Two kinds of test evidence are kept separate (V-7 is reconciliation
section 7):

- **Correctness acceptance (V-7, full expectations, unweakened).** Every new
  opt-in structured validator mode and every new Ratios item version scored by
  it (TR-6, TR-7, converted candidates) must reject negated, padded-number,
  reordered (where order matters), all-options and extra-claim responses and
  accept the enumerated equivalents. These tests must pass before RAT-CONTENT
  may register such an item.
- **Legacy characterization (not acceptance).** Tests over every unchanged
  public `parts` `id@version` record its current behavior, including the
  known V-7 failures (for example `ratio-tables-2@content-2` accepting
  `180, 16`), as documented, unmet V-7 expectations. They do not change
  legacy semantics and do not count as V-7 completion.

V-7 therefore remains **unmet** after RAT-SCORE-IMPL for: (1) the two Ratios
legacy items until RAT-CONTENT registers superseding versions that pass V-7
acceptance (the superseded versions stay historically resolvable, C-1, C-8);
(2) the seven non-Ratios production `parts` items
(`equation-and-inequality-meaning-1`, `-2`, `variables-in-context-1`, `-2`,
`one-variable-equations-2`, `real-world-inequalities-2`, `prism-volume-2`),
which close only through separately approved per-domain correction packets
with their own D-61 exceptions (MATH6-EXPAND or a dedicated scoring-correction
scope; none is proposed or approved here); (3) the 30 candidate `parts` items,
which are not loaded and close only if converted under an approved scope;
(4) private bank items, unverified until RAT-PACKAGE runs V-7 under O-10
scope. No packet in this plan claims full V-7 completion.

Interim (OWNER, IC-9): `unit-rates-2@content-2` and `ratio-tables-2@content-2`
are reviewed practice reachable through Phase 1 sessions today, and their
false accepts can add practice-weighted evidence (D-08 practice 0.80). This
plan does not choose an interim action; it lists options in section 6.

### 3.5 O-11: extension practice, review and delayed-check volumes

APP values exist only for the three pilot lessons/skills (D-36, D-63;
D-67 as treated by the reconciliation). Arithmetic below applies D-36's
stated derivation ("itemsPerAttempt × (1 + maxReassessments)" under no reuse)
to the approved profile values; it is a consequence, not an approved value
for the extension.

| Volume                            | Pilot (APP)         | Extension lessons/skills: REC for the owner                                | Status             |
| --------------------------------- | ------------------- | -------------------------------------------------------------------------- | ------------------ |
| Teaching records per lesson       | 1 (D-36, D-48)      | 1, same as pilot (second representation optional per D-48; REC for DNL)    | OWNER (O-11, O-12) |
| Practice records per lesson       | 6 (4 + 2 headroom)  | 6, same structure; for DNL, the 4 threshold items are representation tasks | OWNER              |
| Lesson-bank items                 | 9 (3 × 3)           | 9; D-148 drafts already target 9 each (draft scope only)                   | OWNER              |
| Review records per skill          | 3 (D-67)            | 3                                                                          | OWNER              |
| Delayed-check items per skill     | 6 (2 × 3, D-63)     | 6                                                                          | OWNER              |
| Unit bank for the five-skill unit | 18 for three skills | **No value proposed.** Floors only, below                                  | MISS, OWNER        |

Unit-bank floors (derived, not chosen): each unit run takes 6 items
(D-25) and must include one item per unit skill (OBS:
`assignment/route.ts` passes the unit's lesson skill codes as
`requiredSkillCodes`; `selectAssessmentItems` throws without one eligible
item per skill). Under no reuse across 1 + 2 runs, the bank needs at least 18
items and at least 3 eligible items for **each** of the five skills. The
owner chooses the actual count and per-skill composition after RAT-PACKAGE
reports what the reviewed pilot bank and supplement can supply.

Pilot practice: D-36's six records per pilot lesson are already approved
(APP) but unmet (section 1); authoring the missing four per lesson still
needs a D-61 exception.

### 3.6 O-12: teaching applicability and serving boundary

Facts (OBS/APP): no Grade 6 teaching record exists; the teaching contract is
scoped to the five D-75 programs; D-100, D-102, D-138, D-140, D-141 and
D-143/D-144 are open; `grade-6-math-access@1.1.0` grants no `TEACHING`; T3/T4
gates are closed. D-58 publishes the reviewed teaching-and-practice
projection, so once a loader admits reviewed teaching records they would
appear on the public site even though the app cannot serve them. Today the
live content loader rejects non-practice records (OBS
`validateContentCatalog`), and the storage and loader path for real teaching
records is not defined (T1 shapes are disconnected; MISS).

| Option                                       | Consequence                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A. Release requires served teaching          | Ratios release waits on T3/T4 plus a Grade 6 adoption of the teaching contract (grants, retry, acknowledgement, interlock)                                                                                                                                                     |
| **B. Separate authoring from serving (REC)** | D-48's value applies to all five lessons as a content requirement; records are authored and reviewed after a teaching storage path exists; serving stays closed until a separate Grade 6 teaching adoption; the release decision states truthfully that teaching is not served |
| C. Teaching out of scope for this unit       | Fastest; departs from D-36's pilot intent and leaves DNL without an introduction to the representation                                                                                                                                                                         |

REC: B. Whether a Ratios release may proceed without served teaching
remains an explicit owner release choice; B only keeps it from being decided
by default. Teaching authoring (not serving) also needs the storage decision
recorded in RAT-CATALOG-DESIGN or the BANK/TEACHING contract row, and its own
D-61 scope.

## 4. Version and evidence compatibility requirements (deliverable 3)

| ID   | Requirement                                                                                                                                                                                                                                                            | Evidence today (OBS)                                                                                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1  | Items: an `id@version` never changes bytes; changed bytes get a new version; new tasks get new ids; a retired `id@version` is never reused. Every superseded version must be in `ContentArchive` before deployment replaces it                                         | Archive drift check at deploy only; archive coverage of `unit-rates-2@content-1`, `ratio-tables-2@content-1` is MISS (database)                                                                                      |
| C-2  | Skills: all five stay `1.0.0` under the section 3 RECs. Any change to standards, observable evidence, mastery rule or (pending an engineering ruling) misconception list is a new skill version, which first needs D-57 implemented and a reviewed D-149 evidence rule | No skill JSON has `version`; refs pin `1.0.0`                                                                                                                                                                        |
| C-3  | Lessons: five new lesson versions pointing at the new unit version; pilot lessons `1.0.0` remain resolvable unchanged; ref labels equal record versions; first ref is the intended placement item                                                                      | Lesson `1.0.0` already mutated once (section 1)                                                                                                                                                                      |
| C-4  | Unit: one new version listing the five lessons; unit `1.0.0` remains resolvable                                                                                                                                                                                        | —                                                                                                                                                                                                                    |
| C-5  | Banks: any change in items, coverage or `targetRef` is a new bank version; the ten pilot banks and `BANK_HASHES` stay; new bank versions use never-used item identities (the D-70 assumption the loader does not enforce)                                              | `private-package-store.ts` hardcodes the four pilot required banks and per-skill minimums                                                                                                                            |
| C-6  | Program and registry: registering the new unit changes `grade-6-math`'s `unitRefs`; whether that is a new program version, and how two versions coexist, is unresolved                                                                                                 | `validateProgressionCatalog` rejects any unit not listed by a program and any lesson not listed by a unit; `programsByCode` and `programByCode` key by code only; `pilot-progress.ts` hardcodes `grade-6-math@1.0.0` |
| C-7  | Learner state: no remap (D-20, V-6). A rule for learners with unit/lesson `1.0.0` state is required before registration: what they see, whether they may place again (D-71 is per unit version), and whether completion carries over. **Not chosen here**              | `LearnerLessonState`, `LearnerUnitState`, `LearnerPlacement` key by code and version; `lessonsClaimingSkill` returns every lesson version claiming a skill, and several writers iterate it                           |
| C-8  | Scoring: matcher changes never alter the scoring of an existing `id@version`; new semantics only through new item versions; historical attempts are never rescored                                                                                                     | No matcher version on `Attempt`                                                                                                                                                                                      |
| C-9  | Evidence: practice and assessment evidence on all five skills stays on `skill@1.0.0`. Mixing attempts from old and new item versions of the same skill version is ordinary within-version evidence, not the D-149 case                                                 | `MasteryEstimate` unique on learner, skill code, algorithm version                                                                                                                                                   |
| C-10 | Private: historical bank versions stay resolvable so existing assignments' `selectedItems` can be resolved                                                                                                                                                             | Package contents MISS                                                                                                                                                                                                |
| C-11 | Publication: converted candidate items and new public practice/teaching are public; held-out banks never reuse public numbers/contexts (D-73 class)                                                                                                                    | `publication.test.ts`, `held-out.test.ts`                                                                                                                                                                            |
| C-12 | Claims: registering the unit moves DNL and percent skills from legacy grants to unit-claimed, so placement and review then need assignments (D-62); no registration until every required bank exists (V-11)                                                            | `isSkillClaimedByAuthoredUnit` reads registered units                                                                                                                                                                |

**Cross-version evidence rule.** None is chosen. Under the section 3 RECs no
skill version changes, so the first unit does not need one. If the owner
chooses a skill version for any Ratios skill (O-3a B-path, O-3b B, or an
evidence-statement change found in review), the required reviewed decision
is: for skill `X@old → X@new`, whether and how attempts, `MasteryEstimate`
contributions, delayed-check status, review schedules, lesson completion and
placement under `X@old` count toward `X@new`; plus the schema change that lets
`MasteryEstimate` distinguish skill versions. C-7 is a separate state
transition decision and is needed regardless.

## 5. Ordered packets (deliverable 4)

Mapping: R-1 → RAT-CATALOG-\* and RAT-INTEGRATE; R-2 → RAT-SCORE-\* and
RAT-CONTENT; R-3/R-4 → RAT-CONTENT; R-5 → RAT-DECIDE and RAT-CONTENT;
R-6–R-8 → RAT-PACKAGE; R-9 → RAT-INTEGRATE. "Codex review" means Codex
`forge-reviewer` / `gpt-6.1-sol`. Each packet needs its own approval; none is
implied by this table.

| Order | Packet                            | Deliverable and stop                                                                                                                                                                                                                                                                             | Role → review                                                                                                       | Depends on                                                                         |
| ----- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 0     | RAT-DECIDE                        | Owner records IC-1–IC-8 (section 6) and the scoped D-61 exceptions in the decision matrix                                                                                                                                                                                                        | Named documentation integrator; no worker                                                                           | Codex review of this plan                                                          |
| 1     | RAT-SUBJECT                       | Read-only subject report: RP.A.2 fraction boundary, RP.A.3 "conversions" reading, accepted ratio notations, candidate item suitability                                                                                                                                                           | Codex `forge-reviewer` (read-only); integrator records the report                                                   | Codex review of this plan; feeds IC-2                                              |
| 2     | RAT-SCORE-DESIGN                  | Structured-response scoring contract (section 3.4)                                                                                                                                                                                                                                               | Claude Code `forge-expert` / Opus → Codex review → owner                                                            | RAT-DECIDE (O-9)                                                                   |
| 3     | RAT-SCORE-IMPL                    | Contract implementation; V-7 acceptance tests for the new mode; legacy `parts` characterization (not acceptance); no content records                                                                                                                                                             | Claude Code `forge-implementer` / Sonnet → Codex review (cross-family required)                                     | RAT-SCORE-DESIGN accepted; migration/privacy approval if schema changes            |
| 4     | RAT-CATALOG-DESIGN                | Historical-resolution contract for program/unit/lesson/bank versions, C-6, C-7 options, teaching storage path, extension-lesson label rule                                                                                                                                                       | Claude Code `forge-expert` / Opus → Codex review → owner; may be the Grade 6 slice of the index's BANK-CONTRACT row | RAT-DECIDE                                                                         |
| 5     | RAT-CATALOG-IMPL                  | Implementation with synthetic fixtures only; V-2, V-5, V-10, V-11 tests; no Ratios record changes; does not edit `src/content/catalog.ts`                                                                                                                                                        | Claude Code `forge-implementer` / Sonnet → Codex review                                                             | RAT-CATALOG-DESIGN accepted                                                        |
| 6     | RAT-CONTENT                       | Public Ratios content: TR-1–TR-7, practice volumes, candidate conversions; pre-registration validation; sole owner of `src/content/catalog.ts` registration and `tests/content/` coverage; teaching only under an approved IC-7 disposition, its own D-61 exception and an accepted storage path | Claude Code `forge-expert` / Opus → Codex review → human content approval                                           | RAT-DECIDE, RAT-SUBJECT, RAT-SCORE-IMPL (for structured items)                     |
| 7     | RAT-PACKAGE (proposed O-10 scope) | Private bank review, merge and authoring; public output is metadata only                                                                                                                                                                                                                         | Named private-package integrator; authoring Claude Opus; cross-family review inside the private scope               | O-10 approval; RAT-CONTENT frozen (non-reuse)                                      |
| 8     | RAT-INTEGRATE                     | Five new lesson versions, new unit version, bank metadata, registry wiring, retire the extension stub                                                                                                                                                                                            | Claude Code `forge-implementer` / Sonnet → Codex review                                                             | RAT-CATALOG-IMPL, RAT-CONTENT registered identities, RAT-PACKAGE digests, C-7 rule |
| 9     | RAT-RELEASE                       | Shadow evidence, manual gates and activation decision                                                                                                                                                                                                                                            | Named release integrator; owner                                                                                     | RAT-INTEGRATE; section 6.4 dependencies                                            |

RAT-SUBJECT, RAT-SCORE-DESIGN and RAT-CATALOG-DESIGN are independent and may
be dispatched one at a time in any order after RAT-DECIDE (RAT-SUBJECT may
precede it). RAT-CONTENT single-answer items (TR-1–TR-5) do not need
RAT-SCORE-IMPL; structured items (TR-6, TR-7 under option C) do.

### 5.1 Packet details

**RAT-DECIDE.** Owned: `docs/course-progression-decisions.md`, packet/index/
PROGRESS (integrator only). Inputs: this plan at its reviewed hash, its
review report. D-61: records exceptions for RAT-CONTENT and RAT-PACKAGE with
exact ids, roles, counts and stores, following the D-66/D-73/D-74 precedent.
Gates: targeted Prettier (`--ignore-path /dev/null`), `git diff --check`.

**RAT-SUBJECT.** Owned: one report path chosen by the integrator (for
example `docs/grade-6-math-ratios-subject-review.md`). Inputs: the approved
dossier rows `6.RP.A.1`–`6.RP.A.3` and the registered CDE source already in
`docs/curriculum-sources.md`; the ten public items and four candidate items;
D-73's recorded note that complex-fraction unit rates were characterized as
above 6.RP.A.2 scope. No new research, no edits. Gates: documentation checks.

**RAT-SCORE-DESIGN.** Owned: one new contract document (for example
`docs/structured-response-scoring-contract.md`). Inputs:
`src/contracts/content.ts`, `src/content/answer-matching.ts`,
`src/phase1/service.ts`, `src/progression/assessment-submission.ts`,
`src/app/components/activity-panel.tsx`, `prisma/schema.prisma` (`Attempt`),
reconciliation 4.2 and V-7. The contract must define the V-7 acceptance set
for the new mode and the legacy characterization set separately (section
3.4) and must not alter the existing `parts` path. D-61: none. Gates:
documentation checks.

**RAT-SCORE-IMPL.** Owned (as the accepted contract names): the files above,
`src/progression/assessment-response.ts`, new or changed tests under
`tests/content/`, `tests/phase1/`, `tests/progression/`, and a reversible
migration with `down.sql` only if the contract requires one. Tests: V-7
acceptance for the new structured mode (must pass); legacy `parts`
characterization recording current behavior and known V-7 failures (must
not be reported as V-7 acceptance; legacy semantics unchanged). D-61: none;
no content record changes. Gates: `npm run verify`; `npm run test:integration`
and `npm run test:migrations` if persistence changes; `npm run test:e2e`
(learner input); applicable fake evals if tutor-adjacent behavior changes;
synthetic environment only.

**RAT-CATALOG-DESIGN.** Owned: one new contract document (for example
`docs/grade-6-math-catalog-versioning.md`). Inputs:
`src/curriculum/{course-catalog,progression-catalog,program-registry,unit-claims,pilot-catalog,ratios-extension-catalog}.ts`,
`src/progression/{learner-state,pilot-progress,placement-probe,skill-assessment}.ts`,
`src/app/api/progression/assessment/assignment/route.ts` (uses `PILOT_*`
constants directly), `src/assessment/private-package-store.ts`, Prisma state
models, D-62/D-64/D-68/D-70/D-71. Must present C-7 options without choosing.
D-61: none. Gates: documentation checks.

**RAT-CATALOG-IMPL.** Owned: the source files above as the accepted contract
names, tests under `tests/curriculum/` and `tests/progression/`, synthetic
fixtures. It does not edit `src/content/catalog.ts` or any content file;
content registration belongs to RAT-CONTENT. Preserves every current pilot
record byte-for-byte (the
`course-catalog.test.ts` digest stays green or changes only by deliberate,
reviewed fixture design). D-61: none. Gates: `npm run verify`,
`npm run test:integration`, `npm run test:e2e` if learner progress surfaces
change.

**RAT-CONTENT.** Owned: new or new-version files under `content/ratios/`;
the matching `import` lines and `rawContent` entries in
`src/content/catalog.ts` (OBS: the loader imports each content file
explicitly, lines 1–10 for Ratios, and enumerates `rawContent` from line
140; a file under `content/ratios/` that is not imported is not loaded,
validated, served or published); the applicable `tests/content/` coverage
(OBS: `catalog.test.ts` asserts the total catalog length 128 and zero
`pending_review` records at lines 38, 50–51; `publication.test.ts` covers the
D-58 projection); teaching record paths only as RAT-CATALOG-DESIGN defines
them; no skill JSON changes unless the owner chose a skill version. Inputs:
approved RAT-DECIDE values, RAT-SUBJECT report, candidate items at baseline,
scoring contract. D-61: the scoped practice exception from RAT-DECIDE.

Stages, in order:

1. **Draft and freeze** each new or new-version record as `pending_review`
   JSON with a frozen draft manifest of `id`, `version` and file SHA-256 (the
   **draft hash**); not imported into the loader.
2. **Pre-registration validation** of every frozen draft: a test-only
   harness passes the drafts, together with the current catalog, through
   `validateContentCatalog(items)` (OBS: it accepts an explicit item list;
   schema, `id@version`
   uniqueness, readiness closure, provenance, canonical in accepted, hint
   scan, difficulty band, misconception codes), plus V-8, V-7 acceptance for
   every item scored by the new structured mode, the D-58 projection check
   and independent re-solve; drafts never enter `rawContent` in this stage.
3. **Codex review, per-item human content approval, then final freeze.**
   `servableContentCatalog` admits only `review.status: reviewed` (OBS
   `src/content/catalog.ts` line 527), so approval must be written into each
   record's `review` metadata (status, reviewer, date, originality
   statement), which changes its bytes. After approval, record the approved
   review metadata and freeze the final reviewed bytes in a separate
   registration manifest of `id`, `version`, draft hash and final file
   SHA-256 (the **registration hash**). The draft hash and registration hash
   are expected to differ and are never interchangeable. Then validate the
   exact final bytes again with the stage 2 harness before registration.
   - **Metadata-only change:** a mechanical diff check that the final bytes
     differ from the reviewed draft only inside the `review` object, plus
     re-running the stage 2 validation on the final bytes. No new subject
     review is needed.
   - **Any other change** (prompt, validator, hints, figure, standards,
     misconceptions or any other field) is substantive. The record returns
     to stage 2 validation and stage 3 review and approval, under a new draft
     hash.
4. **Registration**, only with explicit owner authorization for public
   exposure: import and list approved records only, at their exact final
   reviewed bytes (a reviewed record in the loader is servable through
   Phase 1 practice and published by the site); update `tests/content/`
   counts and coverage deliberately; add a resolution test that every new
   practice identity resolves in `contentCatalog` and
   `servableContentCatalog` with exactly the `id`, `version` and
   registration hash from the stage 3 manifest. A superseding version of
   `unit-rates-2` or `ratio-tables-2`
   replaces the loaded version, so C-1 ContentArchive capture must precede
   deployment.

Teaching records are included only under an approved IC-7 (O-12)
disposition, with their own separate teaching D-61 exception and an accepted
storage and loader path (MV-12; OBS: `validateContentCatalog` rejects any
non-practice record, so teaching cannot be registered through
`src/content/catalog.ts` as it stands); IC-8 is not teaching authorization.
Gates:
`npm run verify` (includes the `content:validate`/`curriculum:validate`
suites), the stage 2 checks on draft bytes and again on final reviewed
bytes, the stage 3 metadata-only diff check, Codex review and human approval.

**RAT-PACKAGE (proposed separate scope under O-10; no access implied).**
Owned: the private package only; returns bank codes, versions, counts,
coverage and SHA-256 digests to the integrator. Work: verify the pilot
package against `BANK_HASHES`; review D-148 extension lesson banks and the
Ratios supplement (section 5 gates of the reconciliation: re-solve, accepted
forms, V-7 privately, grade scope, accessibility, safety, structural
diversity, non-reuse against RAT-CONTENT's frozen public set); build a new
five-skill unit bank version meeting the section 3.5 floors; author review
and delayed-check banks for the two extension skills. D-61: a new exception
for that authoring and for edits to D-148 drafts (D-66 covered pilot skills
only; D-148 is draft-only). Review independence inside the private scope
requires naming a cross-family reviewer with private access (MISS). Gates:
`PrivateAssessmentPackageStore` validation under the authorized scope,
human content approval per item.

**RAT-INTEGRATE.** Owned: `src/curriculum/pilot-catalog.ts` (or its
successor per RAT-CATALOG-DESIGN), `ratios-extension-catalog.ts` and its
test (the test's unwired assertion is meant to fail on wiring),
`program-registry.ts`, `private-package-store.ts` required-bank list,
related tests. It does not edit `src/content/catalog.ts`; every lesson
practice ref it adds must pin an identity RAT-CONTENT registered, with
`version` equal to the record's version and `hash` equal to the registration hash in
RAT-CONTENT's stage 3 manifest, not the draft hash (V-2). D-61: none for content; new structure records need a real
product/content review stamp, not a copied 2026-09-06 stamp. Gates:
`npm run verify`, `npm run test:integration`, `npm run test:e2e`, synthetic
only. Registration changes claimed-skill access (C-12), so integration
itself needs owner authorization.

**RAT-RELEASE.** Shadow divergence review (open in the manual gate record),
D-41 screen-reader pass covering any new input type, child-safety and
privacy acceptances for the new scope, Pages publication review, production
migration approval if any, C4 decision. Lifecycle (L2/L3) dependency is
determined from the then-current lifecycle record.

## 6. Owner choices versus later approvals (deliverable 5)

### 6.1 Immediate owner choices (after review of this plan)

| ID   | Choice                                                                                                                                                                               | REC                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| IC-1 | Accept or amend this plan                                                                                                                                                            | —                                                                                                                                                   |
| IC-2 | O-3a conversions home                                                                                                                                                                | `unit-rates@1.0.0`, after RAT-SUBJECT                                                                                                               |
| IC-3 | O-3b `double-number-lines`: items under `1.0.0` or a skill version; TR-5/TR-6 representation                                                                                         | Items under `1.0.0`; figure plus text alternative; the older-evidence limitation (section 3.2) needs an explicit owner disposition, not chosen here |
| IC-4 | O-8 new lesson versions; pilot `1.0.0` frozen                                                                                                                                        | Yes                                                                                                                                                 |
| IC-5 | O-9 scope                                                                                                                                                                            | Option C; authorize RAT-SCORE-DESIGN                                                                                                                |
| IC-6 | O-11 extension volumes (section 3.5) and authorizing the pilot practice volume authoring                                                                                             | Pilot-equal values; unit bank count deferred to RAT-PACKAGE                                                                                         |
| IC-7 | O-12 teaching                                                                                                                                                                        | Option B                                                                                                                                            |
| IC-8 | Authorize RAT-CATALOG-DESIGN (or fold into BANK-CONTRACT) and RAT-SUBJECT                                                                                                            | Yes                                                                                                                                                 |
| IC-9 | Interim handling of live `unit-rates-2`/`ratio-tables-2` false accepts: leave with documented risk; exclude from new lesson versions until repaired; or a separate correction packet | No REC; owner risk choice; any change to live records needs its own D-61 scope                                                                      |

### 6.2 Later approvals (not requested now)

D-61 exceptions for RAT-CONTENT and RAT-PACKAGE; O-10 private access and
reviewer; per-item human content approval (public and private); the C-7
learner-state transition rule; migration and privacy approval if
RAT-SCORE-IMPL or RAT-CATALOG-IMPL changes schema; authorization to register
reviewed practice in `src/content/catalog.ts` (public exposure, RAT-CONTENT
stage 4) and to register the unit; teaching authoring only under an approved
IC-7 disposition with its own D-61 exception and storage path;
separately approved correction packets for the non-Ratios legacy `parts`
items that remain V-7-unmet (section 3.4); activation,
Pages publication review, C4 and release. O-13 (authority for the
2026-10-09 edits, which include both pilot composite items) should be
settled before RAT-CONTENT supersedes those versions. O-14–O-18 are outside
this unit except where RAT-SUBJECT touches Ratios wording.

### 6.3 What can progress before teaching or lifecycle runtime

All of RAT-DECIDE, RAT-SUBJECT, RAT-SCORE-\*, RAT-CATALOG-\*, RAT-CONTENT
(practice; teaching authoring only after a storage path), RAT-PACKAGE and
RAT-INTEGRATE are independent of teaching T3/T4 and lifecycle L2/L3. Under
the section 3 RECs the unit also does not depend on D-57 implementation.

### 6.4 Remaining release dependencies

Shadow divergence review and C4 (manual gate: release decision blank);
manual gates for the new surfaces; teaching serving if the owner chooses
option A; V-7 acceptance for every scored item the new lesson versions
reference and V-7 evidence for private bank items (RAT-PACKAGE), while the
non-Ratios legacy V-7 remainder is tracked by its own packets (section 3.4);
ContentArchive capture before superseding item versions (C-1,
database operation needing authorization); the C-7 rule; any lifecycle
dependency the release packet identifies; deployment and production
migration authorization.

## 7. Missing values register

| ID    | Missing value or evidence                                                                        | Resolved by                                                                             |
| ----- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| MV-1  | Extension practice headroom, teaching, review, delayed-check and lesson-bank volumes             | IC-6                                                                                    |
| MV-2  | Five-skill unit-bank count and per-skill composition (floors in 3.5)                             | Owner after RAT-PACKAGE                                                                 |
| MV-3  | Meaning of "conversions" in the dossier row                                                      | RAT-SUBJECT                                                                             |
| MV-4  | RP.A.2 "rates with fractions" boundary versus the D-73 complex-fraction note                     | Resolved by the accepted advisory RAT-SUBJECT report: non-complex fractions only (TR-3) |
| MV-5  | Accepted ratio notations (fraction form for part-to-part; spacing variants)                      | RAT-SUBJECT, then RAT-CONTENT                                                           |
| MV-6  | Program/unit/lesson version labels and coexistence rule                                          | RAT-CATALOG-DESIGN                                                                      |
| MV-7  | Learner-state transition rule (C-7)                                                              | RAT-CATALOG-DESIGN options, owner                                                       |
| MV-8  | Whether a misconception-list change is a skill-versioning event                                  | RAT-CATALOG-DESIGN or owner                                                             |
| MV-9  | D-148 bank identities, `targetRef`s, supplement split, `parts` use, digests                      | RAT-PACKAGE (O-10)                                                                      |
| MV-10 | ContentArchive coverage for superseded Ratios versions; whether any learner has pilot unit state | Authorized database scope                                                               |
| MV-11 | Review authority for the 2026-10-09 bytes of `unit-rates-2`, `ratio-tables-2`                    | O-13                                                                                    |
| MV-12 | Storage and loader path for real teaching records                                                | RAT-CATALOG-DESIGN or teaching contract                                                 |
| MV-13 | A cross-family reviewer with private-package access                                              | O-10                                                                                    |

## 8. Limitations

- One author's static reading; coverage and fit judgments need RAT-SUBJECT
  and Codex review. Same-family caveat: the reconciliation, the candidate's
  later revisions and this plan are Claude-family work.
- No private, database or learner access: private item formats, archive
  coverage and existing pilot learner state are unknown.
- Scorer false-accept examples beyond `ratio-tables-2` remain author-reported
  from the reconciliation's disclosed revision-1 execution; nothing was run
  here.
- Runtime observations (selectors, routes, state keys) are from reading code
  at baseline, not from executing it; RAT-CATALOG-DESIGN must re-derive them.

## 9. Revision 2 notes (2026-10-12)

Bounded corrections for `docs/math6-ratios-plan-20261012-review.md` (Codex
`forge-reviewer`, `gpt-6.1-sol`; verdict changes requested) against revision 1
SHA-256 `7183d813…cd1a`. Same baseline and substantive inputs; added inputs
are the review report, the updated packet and `src/content/catalog.ts`. No
execution, no content, scorer or runtime change, no private access.

| Finding     | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 (major) | Accepted. Re-verified that `src/content/catalog.ts` imports each content file and enumerates `rawContent`. RAT-CONTENT is now the sole owner of the imports, `rawContent` entries and `tests/content/` coverage, with four ordered stages: frozen drafts, pre-registration validation of every draft, review and human approval, and owner-authorized registration with an exact `id`/`version`/SHA-256 resolution test. RAT-CATALOG-IMPL and RAT-INTEGRATE state they do not edit the content loader; RAT-INTEGRATE pins only registered identities. The exposure assertion now names registration, not merging, as the public-exposure step. |
| R-2 (major) | Accepted. Section 3.4 separates V-7 correctness acceptance (full, unweakened, required for the new structured mode and new Ratios versions) from legacy characterization (records current behavior and known failures; not acceptance; no legacy semantic change). It lists what stays V-7-unmet and which separately approved scopes would close it. RAT-SCORE-DESIGN, RAT-SCORE-IMPL, section 6.2 and 6.4 updated accordingly. No packet claims full V-7 completion.                                                                                                                                                                         |
| R-3 (minor) | Accepted. RAT-CONTENT teaching now depends on an approved IC-7 (O-12) disposition, a separate teaching D-61 exception and an accepted storage and loader path; IC-8 is stated not to be teaching authorization. Section 3.6 notes the live loader rejects non-practice records.                                                                                                                                                                                                                                                                                                                                                                |
| Review note | Section 3.2 and IC-3 now state that keeping `double-number-lines` at `1.0.0` retains older evidence from tasks that did not elicit the representation, as a limitation needing explicit owner disposition; no choice is made.                                                                                                                                                                                                                                                                                                                                                                                                                  |

No recommendation changed. Counts, approved values, options and packet order
are unchanged.

### Revision 3 notes

Bounded corrections for `docs/math6-ratios-plan-20261012-rereview.md`
(Codex `forge-reviewer`, `gpt-6.1-sol`) against revision 2 SHA-256
`44b0b9ec…f410`. R-2 and R-3 were resolved there and are not reopened.

| Finding              | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Residual R-1 (major) | Accepted. RAT-CONTENT stage 1 now freezes a draft hash; stage 3 records the approved `review` metadata, freezes the final reviewed bytes in a registration manifest with a registration hash distinct from the draft hash, defines metadata-only changes (diff limited to the `review` object plus re-validation, no new subject review) and returns any other change to validation and review; stage 4 registers the exact final bytes and its resolution test uses the registration hash. The RAT-CONTENT gates and the RAT-INTEGRATE V-2 pin now refer to the registration hash. |
| IC-3 wording (minor) | Accepted. Section 3.2 now says any evidence recorded from the two existing items would continue counting, states that no learner data was inspected, and keeps the explicit owner disposition and its limitation.                                                                                                                                                                                                                                                                                                                                                                   |

No recommendation, count, approved value, option or packet order changed.

### RAT-SUBJECT-CORRECT boundary correction

Owner-authorized correction (packet `docs/agent-handoffs/RAT-SUBJECT-CORRECT.md`)
of TR-3 and the directly dependent `unit-rates` gap statements in section 2.2
and MV-4, following finding R-1 of the accepted advisory report
`docs/grade-6-math-ratios-subject-review.md`. TR-3 now requires a
non-complex fractional unit rate from whole-number quantities, with
interpretation and units, and no longer requires ratios of fractional
quantities. The gap is narrowed because decimal unit rates already occur.
D-73's intentional above-grade stretch decision is preserved. No choice,
volume, identity, version or evidence rule, source approval status or release
gate changed; other report findings are not addressed here.
