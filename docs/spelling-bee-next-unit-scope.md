# Scripps Spelling Bee Grade 6 scope (SPELL-SCOPE)

**Status: REVISION 2, FROZEN DRAFT for Codex `forge-reviewer` changed-scope
re-review. Not approved.** Revision 2 closes findings 1 to 4 of the review of
revision 1 (`0b4b3411…7b87`); see section 9. This document answers the owner goal recorded in D-334: "a fully
working ... spelling bee curriculum at the earliest". D-334 authorizes only a
document-only scoping. This file changes no code, content, catalog, policy,
decision or status file, and it authorizes nothing. Every **REC** is a
recommendation for a later decision, not an approved value.

- **Author:** Claude Code subagent; configured model `claude-opus-5-5`,
  self-reported and unverified (the author cannot supply client metadata).
- **Baseline:** `main` HEAD `2087737` plus the working tree as found. D-334
  to D-336 exist only as uncommitted edits to
  `docs/course-progression-decisions.md` and were read as found (D-335 and
  D-336 concern Statistics only; the register may drift again). Input SHA-256 pins are in section 8.
- **Not accessed:** private banks or drafts, learner or production data,
  databases, providers, Render, the web (no SNSB, dictionary or license page
  was retrieved). No tests or scripts ran except read-only `grep`, `git`,
  `shasum` and small `node -e` JSON-field listings.

Labels: **OBS** observed in repository bytes; **APP** approval quoted from a
decision record; **REC** this author's recommendation; **MISS** evidence
absent or unverifiable from this checkout.

## 1. Current state

### 1.1 Evidence

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Label   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `scripps-spelling-bee-6@1.0.0` is `available: true`, `enrichment-contest`, prefix `snsb6-`, `skill-graph-only`, `unitRefs: []`, `legacyCompatibilityPolicyRef: null` (`src/curriculum/program-registry.ts:92-104`), and the active selection lists it (`grade-6-math-active-selection.json`).                                                                                                                                                                                                                                                                                                             | OBS     |
| 2   | 8 skills in 7 domains (`content/skills/snsb6-*.json`, imported at `src/curriculum/catalog.ts:57-64`). All have `prerequisiteSkillCodes: []`, no `version` field, bands foundational/developing/challenging.                                                                                                                                                                                                                                                                                                                                                                                               | OBS     |
| 3   | 16 records, one `core-1` and one `contest-2` per skill, all `role: practice`, `content-1`, `llm_drafted`/`owned`, `review.status: reviewed` 2026-09-19, imported at `src/content/catalog.ts:133-148`. Git history shows they have not changed since 2026-09-19; the four hashes pinned in dossier section 4.3 still match.                                                                                                                                                                                                                                                                                | OBS     |
| 4   | Every record uses a legacy `text` validator. No record uses `structured` choice fields, figures or `multiple_choice`. All 16 share one generic three-step hint ladder and the single misconception code `ignores-supplied-evidence`.                                                                                                                                                                                                                                                                                                                                                                      | OBS     |
| 5   | Access policy `scripps-spelling-bee-6-access@1.0.0` grants `PRACTICE`, `PLACEMENT`, `REVIEW` and denies `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, `DELAYED_CHECK`. Profile `scripps-spelling-bee-6-default@1.0.0` carries math-pilot values (for example `lessonItemsPerAttempt 3`, `maxReassessments 2`, `delayedCheckItemsPerAttempt 2`, `reviewReuse` off).                                                                                                                                                                                                                                              | OBS     |
| 6   | Model hints are not disabled for `snsb6-` (`src/tutor/model-gating.ts:13` lists only `py6-`, `hss6-`). The hint route sends spelling items to the tutor with `mode: 'math_tutor'` and `subjectFraming: 'math'` because only Science gets `'science'` (`src/app/api/phase1/hint/route.ts:97-100`). The model is the fake adapter unless `TUTOR_MODEL_PROVIDER` is `anthropic` (`src/tutor/create-model.ts`). This is a product mismatch and an unevaluated leakage risk, not an observed incident; the production setting was not checked.                                                                 | OBS     |
| 7   | The free-text answer input sets only `autoComplete="off"` (`src/app/components/activity-panel.tsx:189-197`). Browser spellcheck and autocorrect stay on for spelling answers. D-134 (CD-SNSB-08) is still OPEN.                                                                                                                                                                                                                                                                                                                                                                                           | OBS/APP |
| 8   | The parent page has a scope note only for Science (`src/app/parent-claims.ts:8-9`). D-178 required that any release note say Spelling is practice-only; no in-product Spelling note exists.                                                                                                                                                                                                                                                                                                                                                                                                               | OBS/APP |
| 9   | No audio, text-to-speech or speech-recognition code exists in `src/` (`grep` for `speechSynthesis`, `<audio`, `SpeechRecognition`, `tts`: no hits). No learner teaching route exists for any program (no `src/app` file references teaching). Recall cards exist only as a contract (`src/contracts/recall-card.ts`), not served.                                                                                                                                                                                                                                                                         | OBS     |
| 10  | Assessment assignment, override and step-up routes resolve the program literally as `'grade-6-math'` (`assessment/assignment/route.ts:308`, `override/route.ts:80`, `step-up/route.ts:55`); so do `pilot-progress.ts:171` and the review page (`review/course-progression/page.tsx:53`). Unit claims are already program-keyed (`src/curriculum/unit-claims.ts`). The private store derives its bank list from the whole catalog index (`private-package-store.ts:75-76`) but reads one package path; the merge script defaults to the ten D-266 Ratios digests (`scripts/private-bank-merge.ts:31,239`). | OBS     |
| 11  | The course-pilot design (dossier rev 4, SHA `64e4e9ef…7439174`) was accepted under D-75, but all twelve of its choices, D-127 to D-138 (CD-SNSB-01 to 12), are OPEN. D-135 requires an exact D-61 content exception for the F-01, F-02 and F-04 corrections.                                                                                                                                                                                                                                                                                                                                              | APP     |
| 12  | D-178 (PR-4) accepted "Spelling exact-match and two items per skill as-is for reuse; release note says practice-only", with no correction packet scheduled.                                                                                                                                                                                                                                                                                                                                                                                                                                               | APP     |
| 13  | Source constraints (owner, 2026-09-19, reconfirmed 2026-10-10): school and regional prep only; original material; no official SNSB list word as source, seed, sample, distractor or validation corpus; no Merriam-Webster copying; the 2026 national rules are historical, and the comparison is re-run when 2027 rules publish; unofficial framing (`docs/curriculum-sources.md:1043-1189`).                                                                                                                                                                                                             | APP     |
| 14  | No Spelling entry in `docs/course-progression-review/manual-gate-record.md` (grep). Spelling has been served since commit `7b688b7` ("enable approved Scripps curriculum", 2026-09-19).                                                                                                                                                                                                                                                                                                                                                                                                                   | OBS     |
| 15  | No runtime code serves authored `hintSteps`: outside schemas, they are read only by the load-time leakage check (`src/content/catalog.ts:542-543`, `src/content/python-rules.ts:56`). The tutor gate makes the hint route return HTTP 403 `MODEL_TUTORING_DISABLED` (`hint/route.ts:69-77`). The hint button is hidden only for Python code listings (`activity-panel.tsx:236`); for any other gated item the button stays and a refusal shows "The tutor could not respond." (`src/app/page.tsx:624-625`).                                                                                               | OBS     |
| 16  | Structured validators are rejected in contest mode at load (`src/content/catalog.ts:406-408`). All 8 `contest-2` Spelling records are `mode: contest`.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | OBS     |
| 17  | Accessible alternatives are projected into a learner session only for structured or Python items (`src/phase1/service.ts:335-342`). The 16 legacy `text` records never show theirs.                                                                                                                                                                                                                                                                                                                                                                                                                       | OBS     |

### 1.2 What a learner can do today

- Pick "Scripps National Spelling Bee (Grade 6)" in the program switcher, see
  seven chapters, and answer the 16 practice items (two per skill), with
  placement probes and review where the generic engine allows them (OBS
  rows 1, 3, 5; review serving for this program was not traced: MISS).
- Ask for hints, which always go to the tutor harness under math framing
  (fake adapter unless a real provider is configured; row 6). The authored
  hint ladder is never shown (row 15).
- Build a mastery estimate from practice (two items per skill limit how
  far it can rise; the aggregation was not executed here). "Independently confirmed" is not reachable,
  because it needs a `CONFIRMED` delayed check (architecture section 8.5, as
  cited by dossier section 7.2) and the access policy denies `DELAYED_CHECK`
  (REC inference from row 5; not executed).
- Produce one derived spelling: `orthographic-patterns-contest-2` asks for
  "glimming" from the invented base "glim" plus "-ing" (morphological
  production; the full answer is not in the prompt). Every other item is a
  choice, a copy, a classification or a short phrase.
- The learner **cannot** hear a word, spell a whole word from a
  pronunciation cue, take a lesson, unit or delayed check, read teaching, or
  practise a timed or oral round.

### 1.3 Content defects in the 16 records (OBS unless labeled)

The dossier (section 10) reviewed only four records (F-01 to F-07). This
pass read all 16. New findings carry an S prefix. Record ids below omit
the `snsb6-` prefix.

| ID   | Records                                                                                                                                                                           | Finding                                                                                                                                                                                                                                                                      | Severity (REC)                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| F-01 | `morphology-roots-core-1`                                                                                                                                                         | Alternative asks for an explanation the exact validator cannot score (dossier). Stored-content defect: not projected today (row 17)                                                                                                                                          | High once projected; Medium now |
| F-02 | `morphology-roots-contest-2`                                                                                                                                                      | Calls the real word "cycle" a made-up base (dossier)                                                                                                                                                                                                                         | High                            |
| F-04 | `orthographic-patterns-core-1`                                                                                                                                                    | Relies on stress the prompt never states (dossier)                                                                                                                                                                                                                           | High                            |
| S-01 | `vocabulary-context-contest-2`, `oral-round-procedure-contest-2`, `variant-dictionary-judgment-core-1`                                                                            | The canonical answer is printed verbatim in the prompt ("Enter ...: brindlewise"; "... acknowledge, clarify if allowed, spell aloud"; "Enter the concise description: colorway is chiefly US; ..."). These measure copying, not the skill                                    | High                            |
| S-02 | `homophones-homographs-contest-2`, `etymology-language-origins-contest-2`, `oral-round-procedure-contest-2`, `vocabulary-context-contest-2`, `variant-dictionary-judgment-core-1` | Same defect class as F-01: the accessible alternative asks to "explain", "why", "write a script" or "write one sentence", which the exact validator rejects. Stored-content defect, not a live flow (row 17); it becomes live if a successor moves to a structured validator | Medium now; High once projected |
| S-03 | `oral-round-procedure-core-1`                                                                                                                                                     | The prompt says "gives a word but no sentence"; the answer is "sentence"                                                                                                                                                                                                     | Medium                          |
| S-04 | `homophones-homographs-core-1`                                                                                                                                                    | The only distractor, "c over", is not a homophone and not a plausible spelling                                                                                                                                                                                               | Medium                          |
| S-05 | `phoneme-grapheme-mapping-core-1`, `-contest-2`                                                                                                                                   | Pronunciations are given in IPA. Screen readers do not voice IPA reliably, and the records still say "All information is presented in text"                                                                                                                                  | Medium (a11y)                   |
| S-06 | `vocabulary-context-core-1`, `variant-dictionary-judgment-contest-2`, `phoneme-grapheme-mapping-contest-2`                                                                        | Whole-phrase exact answers ("calm adjective"; a full sentence; a full question). Correct paraphrases such as "calm, adjective" or "ask which pronunciation" fail                                                                                                             | Medium                          |
| F-06 | 9 of 16 (computed)                                                                                                                                                                | Duplicate entries in `acceptedAnswers`                                                                                                                                                                                                                                       | Low                             |
| F-07 | All 16                                                                                                                                                                            | One generic hint ladder; one misconception code                                                                                                                                                                                                                              | Low                             |

Five records offer two spellings in the prompt (a choice task written as
free text); that is a format choice, not a leak.

### 1.4 Gap versus Ratios and Science (OBS for the comparators)

| Capability                     | Ratios 2.0.0                                       | Science (Cells)                                         | Spelling today                  |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------------------- | ------------------------------- |
| Units and lessons              | 1 unit, 5 lessons (`ratios-unit-2-catalog.ts`)     | None; practice-only by decision (D-187)                 | None                            |
| Public practice per skill      | 6 per lesson pattern (D-164, RAT-CONTENT 22 items) | 2 (D-190 accepted as enough)                            | 2, with defects in section 1.3  |
| Held-out lesson/unit banks     | 10 private banks, 93 items (D-265/D-266)           | None                                                    | None                            |
| Review and delayed-check banks | Yes, in the selection's `skillBanks`               | None                                                    | None                            |
| Teaching                       | Authored, pinned, not served (D-165, D-218)        | None                                                    | None                            |
| Subject-appropriate tutor      | Math framing (native)                              | Science framing, safety rules, paid evals (D-189–D-284) | Math framing by default (row 6) |
| Parent scope note              | Not needed                                         | Yes (D-191)                                             | No                              |
| Release record or owner pilot  | D-272 push; merge pending (D-320)                  | Owner pilot, one household (D-319/D-320)                | None found (row 14)             |

Science became "usable" as a practice-only path after a scope decision
(D-187), a label (D-188), a tutor framing decision and evals (D-189,
D-193 to D-284), a parent note (D-191) and an owner pilot decision (D-319).
Ratios needed units, held-out banks, the versioned catalog, merge tooling
and owner push. Spelling has done neither path.

## 2. What "fully working" needs

### 2.1 Proposed levels (REC; the owner or a delegated ruling chooses)

| Level                   | Meaning                                                                                                                                                                 | Comparable to |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **L1 usable practice**  | Every skill has corrected, enough practice; a whole-word spelling item cued by pronunciation, not only derivations; honest hint behaviour; honest label and parent note | Science       |
| **L2 unit progression** | Units and lessons with held-out lesson and unit banks, review and delayed-check banks, so lesson completion and "Independently confirmed" become possible               | Ratios        |
| **L3 bee realism**      | Heard words (audio), timed rounds, oral-round rehearsal                                                                                                                 | Nothing yet   |

REC: "fully working at the earliest" means **L1 now, then L2**. L3 needs an
audio decision (2.4) and should not block L1 or L2.

### 2.2 Units and lessons (REC)

D-22 caps placement probes at 5 per unit (`placementProbeMaxItems 5`), so
eight one-skill lessons need at least two units.

| Option | Shape                                                                                                                                                                                                                                                     | Private items (section 2.5 arithmetic)       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| U-A    | Dossier unit: morphology and orthography, 2 lessons (D-127/D-128 recommendation)                                                                                                                                                                          | 54 (unit bank raised to the 18-item minimum) |
| U-B    | **REC.** Word-structure unit, 4 lessons: morphology, orthography, phoneme-grapheme mapping, etymology. The other four skills stay practice-only under a new legacy-compatibility policy, then become unit 2 (vocabulary, homophones, variants, procedure) | 96, then 96                                  |
| U-C    | Both units at once (all 8)                                                                                                                                                                                                                                | 192                                          |

Why U-B: phoneme-grapheme mapping is where the core bee act lives
("Maps a supplied pronunciation to a plausible letter sequence" is already
its evidence statement), and etymology supports it. U-A leaves the central
skill out; U-C doubles the private drafting and review before anything
ships. Keep the dossier's no-edge decision (D-127) and lesson order as
teaching order only. The registry needs a new program version
(`hybrid`), new access and legacy-compatibility policy versions (dossier
section 3.2), and the program-literal routes in row 10 generalized.

### 2.3 Practice volume and the missing "spell it" item (REC)

- **Volume:** reuse the math values as candidates only (D-129 is open):
  6 practice records per lesson (4 threshold plus 2 remediation, D-36/D-164
  pattern). With 8 skills that is 48 records: 16 corrections or reuses plus
  32 new.
- **Corrections:** a `content-2` for every High and Medium row in 1.3
  (14 records: every record except `etymology-language-origins-core-1`
  and `orthographic-patterns-contest-2`), keeping `content-1` resolvable (dossier section 7.3).
  Choice tasks may use `structured` choice fields (`src/contracts/content.ts:135-154`),
  which keep the correct option private and project the accessible
  alternative, **but only in `core` mode**: load rejects structured
  validators in contest mode (row 16). SP-1 chooses, per contest successor,
  one of: (C-1, **REC**) keep `mode: contest` and a legacy `text` validator
  whose accepted answers are the exact option texts listed in the prompt;
  (C-2) re-author it as a `core` record, which changes the core/contest
  balance and needs its own ruling; (C-3) a separately scoped, reviewed
  contract change allowing structured validators in contest mode (not in
  this scope; it touches the structured-response scoring contract). SP-3
  acceptance runs the pre-registration `validateContentCatalog` harness, which
  must pass with no structured validator on a contest record, and checks
  that every structured successor's alternative asks for the validator's
  answer form.
- **Production item ("spell it"):** today the only production item is
  the morphological derivation in `orthographic-patterns-contest-2`
  ("glim" + "-ing"); no item asks for a whole word from a pronunciation
  cue, the core bee act. Without audio this needs a
  text-cue format: an authored plain-word pronunciation cue (for example
  "MAY-lest, stress on the first syllable", never a Merriam-Webster
  respelling), plus definition, part of speech and language-of-origin
  clues, with constraints that make exactly one spelling correct. The
  legacy `text` validator scores this well: case-insensitive, otherwise
  letter-exact (`src/content/answer-matching.ts:19-27`). Data rules from
  dossier section 9 apply (hyphens, apostrophes and diacritics are
  significant; list every accepted variant). REC: house these items under
  `snsb6-phoneme-grapheme-mapping` and `snsb6-orthographic-patterns`, so no
  new skill or skill version is needed. Words are invented or independently
  chosen real words; every real word goes through the human SNSB list
  exclusion check (gate G-SOURCE).
- **Leakage guard:** `containsProtectedAnswer` is substring-based
  (`src/contracts/answer-leakage.ts:142`). Clues must not contain the answer
  or a long fragment of it, and the authored hints must not spell any part
  of it.

### 2.4 Audio, pronunciation and oral rounds

Is audio needed? **Not for L1 or L2 (REC).** The approved local guidance
permits oral, written, online or combined formats (source register
`docs/curriculum-sources.md:1092-1124`), and typed spelling
from text cues is a fair written-round proxy. Audio is needed only for L3,
to rehearse spelling a heard word.

| Option                                        | Data flow and licensing                                                                                                              | Main risks                                                                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A-0 Text cues only (**REC for L1/L2**)        | None beyond today                                                                                                                    | Pronunciation cues are approximate; plain-word cues need an AT check                                                                                                                                         |
| A-1 Pre-recorded human audio as static assets | Recording rights from the speaker; new asset field on records (like `figure`), hashing and publication rules                         | File names, captions and transcripts must not reveal the word. WCAG 1.1.1 allows a "descriptive identification" only for a test that is invalid as text; deaf and hard-of-hearing learners need the A-0 path |
| A-2 Browser speech synthesis                  | No provider in our code, but some browser voices may be network voices that send the text to the browser vendor (MISS: not verified) | Voice and stress vary by device; invented words are read unpredictably; a third-party data-flow review is needed                                                                                             |
| A-3 Server text-to-speech provider            | A paid provider call per word (owner-only, D-212 item 3)                                                                             | Spending, provider review, caching and licensing of generated audio                                                                                                                                          |
| Speech recognition of the child's voice       | Child voice data                                                                                                                     | **REC: never.** Oral spelling is rehearsed by typing letters in order, with no voice capture                                                                                                                 |

**Oral-round procedure** (`snsb6-oral-round-procedure`): REC scenario items
(which request is allowed, what to do when unsure), structured choice in
`core` mode and option C-1 in `contest` mode (2.3), framed by local rules and dated rule sources. No timing, speech or
"bee-ready" claim (dossier section 14). The 2027 rule comparison is still
owed (row 13; not retrieved here: MISS).

**Dictionary and word-list sources.** Merriam-Webster Unabridged is the
official authority and cannot be reproduced (row 13). SNSB lists are
excluded entirely, and Scripps terms forbid reuse. REC: author definitions,
origins and pronunciation cues originally (`llm_drafted`, `owned`) and fact-check
each etymology against more than one source without copying wording. Any
third-party lexical dataset (for example WordNet, the CMU Pronouncing
Dictionary or Wiktionary) is a licensing gate; their license terms were not
retrieved here (MISS). Share-alike terms would conflict with `owned`
provenance and need `licensed` provenance (`src/contracts/content.ts:8-10`).

### 2.5 Assessment banks and delayed checks (L2; REC arithmetic)

Using the current profile values (row 5) and the Ratios pattern (D-164,
D-240) as candidates: lesson bank 9 items per lesson (3 per attempt × (1 + 2
reassessments)); unit bank 6 per skill (D-240), which meets 6 per attempt ×
3 attempts = 18 per unit for a 4-skill unit (24); review 3 per skill;
delayed check 6 per skill (2 × (1 + 2), the CD-SNSB-07 formula). Per skill
that is 24 private items: 96 for U-B's first unit, 192 for all 8 skills.
Bank exclusions follow dossier section 6 (no practice, teaching or tutor
item; no trivial derivation, such as the same invented base with another
suffix). The merge tooling and package path are shared with Math (row 10)
and with STAT6's ST-5a generalization.

### 2.6 Tutor behaviour (REC)

- **Now (SP-2):** add `snsb6-` to `MODEL_TUTORING_DISABLED_SKILL_PREFIXES`.
  Reason: a spelling answer is one short word, so a hint that names a letter
  sequence is a partial disclosure the substring guard cannot see, and the
  math framing does not fit. The gate alone is **not** enough: it only makes
  the route refuse, and the UI would keep a hint button that ends in "The
  tutor could not respond." (row 15). SP-2 therefore chooses between:
  - **H-2 (REC for SP-2): suppress the hint control honestly.** The session
    projection in `src/phase1/service.ts` (near lines 320-342) gains a
    server-derived flag (for example `modelHintsAvailable: false`) computed
    from `isModelTutoringDisabled`; `src/app/components/activity-panel.tsx`
    (lines 236-252) hides the button and the hint helper text and shows
    "Hints are not available for this activity yet."; `src/app/page.tsx`
    (lines 610-636) maps a 403 with `MODEL_TUTORING_DISABLED` to the same
    wording instead of a tutor failure. The route's 403 stays as defense in
    depth. This applies to every gated prefix (`py6-`, `hss6-`, `snsb6-`);
    Python and Social Studies are unavailable today, so their visible change
    is nil. Tests: unit tests for the flag, an API test for the 403 wording,
    and a browser test (learner behaviour change, so `npm run test:e2e`).
  - **H-1: serve authored hints.** A new runtime path that returns the next
    authored `hintSteps` entry for gated items, renders it, and records the
    assistance level so `assistanceWeight` applies. It changes mastery
    evidence and needs cross-family review; it is a separate packet (SP-4),
    not part of SP-2.
- **Then:** write skill-specific authored hint ladders in the new and
  corrected records (fixes F-07; useful once H-1 lands); no hint may spell
  any part of the answer.
- **Later (optional):** a spelling tutor template with partial-spelling
  leakage, prompt-injection, tone and age evals and a capped paid run, the
  same path Science took (D-189 to D-284). Not needed for L1 or L2.

### 2.7 Accessibility (REC)

- Disable spellcheck, autocorrect and autocapitalize on the free-text answer
  for spelling (D-134). The Python input already does this
  (`activity-panel.tsx:158-161`). It is a shared UI change, so the safest
  scope is a per-item or per-program attribute, decided under D-134.
- Pronunciation and stress cues in words, in both prompt and alternative;
  no IPA-only cue (S-05); alternatives ask for the same answer form the
  validator scores (F-01, S-02).
- Manual assistive-technology pass (VoiceOver/Safari, NVDA/Firefox, 400%
  zoom, 320 px reflow) over practice, lesson and parent views, and over any
  audio control under L3 (dossier gate G-A11Y). Owner-only.

### 2.8 Content review state

All 16 records are `reviewed` (owner stamp 2026-09-19) and accepted for
reuse as-is (D-178), but the 1.3 findings show that review missed validity
and accessibility defects. Under the current process, new and corrected
records need cross-family Codex review with an independent re-solve of each
answer, plus delegated acceptance (D-207/D-212 pattern) and the human
G-SOURCE list check.

## 3. Gates and who can clear them

D-212 makes internal, reversible gates delegable to verified cross-family
Codex `gpt-6.1-sol`. D-333 left open whether that reaches beyond the D-183
milestones; D-334 extended it only to Statistics and authorized only this
scoping for Spelling (APP). So **no Spelling gate is delegable today**
until the owner extends D-212 to Spelling (REC: one owner reply, as D-334 did
for STAT6).

| Gate                                                                | Delegable under D-212 once extended?                                                         | Owner-only                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Extend D-212 to Spelling; a native-invocation window; a second lane | No                                                                                           | **Yes** (spending, scope of delegation, lanes) |
| Choice of target level (L1/L2/L3) and audio option                  | Level within L1/L2: yes. Audio A-1/A-2/A-3: no (third-party data flow, spending, recordings) | Audio, speech capture                          |
| D-127 to D-138 (CD-SNSB-01 to 12), unit shape U-A/U-B/U-C, volumes  | Yes                                                                                          | —                                              |
| D-61 exception: public practice corrections and new items           | Yes (D-212 lists D-61 exceptions)                                                            | —                                              |
| Content acceptance of public practice                               | Yes, with independent re-solve                                                               | Spot-check, override                           |
| G-SOURCE: SNSB list-exclusion check against current official lists  | No (the dossier requires a human, and the lists are under Scripps terms)                     | **Yes**                                        |
| Licensing of any third-party word list or dictionary dataset        | No (legal terms leave the repository)                                                        | **Yes**                                        |
| 2027 rules comparison                                               | Research by an agent; acceptance delegable                                                   | —                                              |
| Drafting private (held-out) items                                   | No (D-262 and D-334 each scoped to named banks; D-212 keeps private data with the owner)     | **Yes**                                        |
| Acceptance of drafted held-out items                                | Yes (D-265 precedent)                                                                        | —                                              |
| Running the private merge, D-216 non-reuse check, mounted e2e       | No                                                                                           | **Yes**                                        |
| Tutor gate plus H-2 hint suppression; later H-1 authored hints      | Local application yes, after cross-family review (H-1 is scoring-adjacent)                   | Deployment                                     |
| Spelling tutor template and a paid eval                             | Template yes; paid run no                                                                    | Paid run                                       |
| Manual AT passes                                                    | No                                                                                           | **Yes**                                        |
| Commit, push, deploy, release record, production migration          | No                                                                                           | **Yes**                                        |

## 4. Recommended packets (REC)

Native model calls exclude owner actions. Estimates assume one correction
round per increment, like the STAT6 estimate; a recurring major adds 2 to 3.

| Order | Packet                                                                                                                                                                                                                                        | Roles                                                                | Calls | Parallel with the Math Statistics lane?                                                                                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | **SP-0 owner batch:** extend D-212 to Spelling, a window, a second lane, the L1-then-L2 target, audio A-0, and no speech capture                                                                                                              | Integrator → owner                                                   | 0     | Yes                                                                                                                                                                                                                           |
| 1     | **SP-1 scope rulings:** D-127 to D-138, U-B, volumes, the production-item format, the D-61 exception text for SP-3, and the D-134 attribute scope                                                                                             | Integrator → Codex delegated rulings                                 | 2–3   | Yes (documents only)                                                                                                                                                                                                          |
| 2     | **SP-2 safe-now engineering:** `snsb6-` in the tutor gate plus H-2 honest hint suppression (2.6); spellcheck and autocorrect off for spelling answers; a Spelling parent scope note (D-178 text); unit, API and browser tests                 | Sonnet → Codex → one correction → re-review                          | 4–6   | Yes, if paths are claimed: `src/tutor/model-gating.ts`, `src/phase1/service.ts`, `src/app/page.tsx`, `src/app/components/activity-panel.tsx`, `src/app/parent-claims.ts` and their tests. STAT6 must not touch them meanwhile |
| 3     | **SP-3 public practice:** 14 `content-2` corrections and 32 new records (including the "spell it" items), structured choice only in `core` records and the SP-1 contest option (2.3), skill-specific hints, an item-to-evidence map per skill | Opus draft → Codex review → correction → Sonnet registration → Codex | 7–10  | Drafting yes. Registration edits `src/content/catalog.ts` and shared catalog tests, as STAT6 ST-2 does, so register serially (D-332 needed a hand merge)                                                                      |
| —     | G-SOURCE list check of every real word in SP-3                                                                                                                                                                                                | Owner                                                                | 0     | —                                                                                                                                                                                                                             |
| 4     | **L1 milestone:** owner AT spot pass, commit, push, deploy                                                                                                                                                                                    | Owner                                                                | 0     | —                                                                                                                                                                                                                             |
| 5     | **SP-5 unit engineering:** generalize the program-literal routes and review page (row 10); spelling unit, lessons, bank metadata, program `1.1.0` `hybrid`, access `1.1.0`, legacy-compatibility policy, active selection; tests incl. e2e    | Sonnet → Codex → correction → re-review                              | 6–9   | **No.** It edits the catalog, registry, selection and validators that STAT6 ST-D and ST-6 change. Start after ST-6 lands                                                                                                      |
| 6     | **SP-6 private banks:** 96 items for the U-B unit, outside the repository; needs an owner drafting authorization and reuses ST-5a merge tooling                                                                                               | Opus → Codex → correction                                            | 4–6   | Drafting yes, if the owner authorizes it. Merge waits for ST-5a                                                                                                                                                               |
| 7     | Owner merge, D-216 check, mounted e2e, AT pass, push, release record                                                                                                                                                                          | Owner                                                                | 0     | —                                                                                                                                                                                                                             |
| 8     | Unit 2 (the other four skills): repeat SP-3 (smaller), SP-5 and SP-6                                                                                                                                                                          | As above                                                             | 10–15 | After SP-5                                                                                                                                                                                                                    |
| 4b    | **SP-4 authored hint delivery (H-1, optional for L1):** shared runtime path for gated prefixes, assistance recording, tests                                                                                                                   | Opus design → Codex → Sonnet → Codex                                 | 4–6   | Yes, after SP-2 (same UI files)                                                                                                                                                                                               |
| later | Spelling tutor template and evals; L3 audio design (only if the owner picks A-1, A-2 or A-3); teaching records (not servable for any program today)                                                                                           | Opus, Codex, owner                                                   | 12–18 | Yes                                                                                                                                                                                                                           |

Totals: **L1 about 13 to 19 calls** (SP-1 to SP-3), plus 4 to 6 if SP-4 is
wanted. **First L2 unit about
10 to 15 more** (SP-5, SP-6). Unit 2 about 10 to 15. All of these sit
outside the STAT6 window `claude-window-20261115b`, which D-334 granted for
Statistics only.

**Stop conditions:** stop and route to the owner if SP-1 finds that the
"spell it" format needs a new skill or skill version; if any real word
fails G-SOURCE; if a needed misconception code is missing; if any step needs
private, learner or production data; or if STAT6 ST-6 changes the catalog
invariants SP-5 relies on.

## 5. Risks and what was not verified

- **Live defects:** Spelling is available today with the 1.3 defects,
  including three items that test copying (S-01); F-01 and S-02 are stored,
  not shown (row 17). D-178 accepted the set
  as-is; the new findings were not in front of that decision.
- **Tutor mismatch:** spelling hints use the math framing, and partial-
  spelling leakage has never been evaluated (row 6). No incident is known;
  the production provider setting was not checked (MISS).
- **List overlap:** many common English words of Grade 6 to 8 difficulty
  are likely to sit on SNSB lists, so G-SOURCE may reject many real words;
  invented words test pattern transfer, not recall of real spellings.
- **Ambiguity:** text cues can admit more than one valid spelling;
  reviewers must find a second valid spelling for every "spell it" item.
- **Shared-file collisions** with STAT6 (section 4) and the one-lane default
  in `AGENTS.md`.
- **Not verified (MISS):** production state and provider configuration;
  review serving for this program; the 2027 SNSB rules (due late fall 2026);
  license terms of any lexical dataset; browser speech-synthesis data flows;
  whether the program-literal routes are the only math-specific code paths
  an L2 spelling unit would hit (the dossier's S1b list was checked only for
  the files in row 10); whether D-148-style drafts exist for Spelling (none
  found).

## 6. Author self-audit (requirements to evidence)

| Requirement                                                                                        | Location | Evidence                                                                                                                             | Result                             |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| (1) Current state with OBS/REC; learner today; gap vs Ratios/Science                               | 1        | 14 cited rows, field listings of all 16 records and 8 skills, route and gating code                                                  | Done; production state MISS        |
| (2) Units, volume, audio, word lists, validators, banks, delayed checks, tutor, a11y, review state | 2        | Validator schema and normalizer read; profile values used for bank arithmetic                                                        | Done; license terms MISS           |
| (3) Gates; delegable vs owner-only                                                                 | 3        | D-207, D-212, D-262, D-333, D-334 quoted                                                                                             | Done                               |
| (4) Ordered packets, estimates, parallelism with Statistics                                        | 4        | File-overlap reasoning from D-332 and the STAT6 packet list                                                                          | Done; estimates are REC            |
| (5) Risks and unverified items                                                                     | 5        | —                                                                                                                                    | Done                               |
| Counterexample: "answer appears in prompt" over-counts                                             | 1.3      | The computed check flagged 10 records; 5 were two-option choices and 1 a cue leak, so only 3 are S-01                                | Corrected before freezing          |
| Counterexample: bank arithmetic                                                                    | 2.2, 2.5 | Unit bank 6 × 4 skills = 24 ≥ 18 needed; a 2-skill unit at 6 per skill gives 12 < 18, so U-A uses 9 per skill: 18 + 18 + 6 + 12 = 54 | Corrected before freezing (was 48) |
| No other file edited                                                                               | —        | Only this new file was written                                                                                                       | Done                               |
| Counterexample: "gate gives authored hints" (rev 1)                                                | 2.6      | Row 15: no runtime `hintSteps` consumer; the gate yields a 403 and a failure message                                                 | Corrected in rev 2 (H-2, SP-4)     |
| Positive control: structured choice is admissible                                                  | 2.3      | A `core` record with a structured choice field passes the catalog.ts:406 check; a `contest` one throws                               | Rule derived, not executed         |

## 7. Out of scope

No content, code, catalog, policy or decision edit; no D-61 exception; no
private access; no provider, database or web retrieval; no commit or push.

## 8. Input pins (SHA-256)

| File                                                                      | SHA-256                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/curriculum/program-registry.ts`                                      | `c62a05109eea7d56d21c18bae98a957eb3f84f63112074c7c5c8469377fedbc3` |
| `src/curriculum/catalog.ts`                                               | `ca6f28c8df6ca60c2f809a19f549ec3866dcde408c0f4a2ac4dd44986f4475a8` |
| `src/content/catalog.ts`                                                  | `f1baf0d3c19c9757d06651208c630dfaead7c4b0c18e3b4090e70e56afc4ccb1` |
| `src/content/answer-matching.ts`                                          | `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5` |
| `src/contracts/content.ts`                                                | `3d4b091f02fa2c838be4a7ca71fce5749c4b9e7c4cc9f1fdb65d40849f8a4b2c` |
| `src/tutor/model-gating.ts`                                               | `ccceb4ad23d70d2e8a2e0f50500af7736470ba16d0277b860660b5ed9fa5a948` |
| `src/app/api/phase1/hint/route.ts`                                        | `12970a264a63a7a0ea126d935b09e7a83dd61e56d0a6f22254fe8a295effb459` |
| `src/app/components/activity-panel.tsx`                                   | `45ebe1fcaecaae13fb557e7cbebff35a26dd662f2d66768835a5b75eda668029` |
| `src/app/parent-claims.ts`                                                | `411113b6c655c58f43a67fa7e2cc1814c4c19da95645c2f9ee5da2dc23b658d5` |
| `src/assessment/private-package-store.ts`                                 | `6ccf7a9ab4d5624c2b705b1e0ca9df753fbecb13e64e7a521f418371b6767d81` |
| `src/app/api/progression/assessment/assignment/route.ts`                  | `d1d1cc81b974f39e8743586b1370b477bdd3aa020071f72f87672b2b7fe6e893` |
| `scripts/private-bank-merge.ts`                                           | `e37abdf66339dd907c24df3f207056c7cf6b4cd6b155daa0d187eca76f407f7c` |
| `policy/access-policies/scripps-spelling-bee-6-access.json`               | `414433126b65d86ede0b09faa25b73e13b24549850e16c17cb6087b73a745704` |
| `policy/progression-profiles/scripps-spelling-bee-6-default.json`         | `a9fe8799a5e10eca190dfd72b377bf65a346c0a5c119451204d50f2dea913183` |
| `src/curriculum/grade-6-math-active-selection.json`                       | `c9f1808971745ff4c71e12fd982381578aee731c9f3155ebe6a7283a25874928` |
| `docs/curriculum-dossiers/spelling-bee-6-course-pilot-20261010.md`        | `64e4e9efd9a17632b892ac78dadfd86675e563aafb6a524c8c41fee657439174` |
| `docs/curriculum-dossiers/spelling-bee-6-course-pilot-20261010-review.md` | `35a5ba48385e26827c5f1dc8d3743626e31ae58aaa7c18272568aac120efcd23` |
| `docs/curriculum-sources.md`                                              | `7fc666464ff80cab0a6c67a8e266d10725ec3fa655b5e0b7eed8cd4beb37b5c1` |
| `docs/course-progression-decisions.md` (working tree, D-334 to D-336)     | `d0ee56ad7d21af57a072af9f1d0e27e5c2d97d06e53a0bdf3ed0f53a5a6d43e1` |
| `src/phase1/service.ts`                                                   | `c3783cc2836985a80f81f10288a6bcc0fd2bb05a6ae456d8e40888046907401f` |
| `src/app/page.tsx`                                                        | `efa0d85d3b97c3ed6374e56e1ec08127ab5282367606df7fcfa2bf15206c1ee3` |
| `src/tutor/create-model.ts`                                               | `3ade24968d17dd3db07d94d6b9c6812fc8fe77e03f4b5f72e0f947ed9e527666` |
| `src/content/python-rules.ts`                                             | `3ec20ba8da08b184ae3cb8f2eb56c0b0a8c3c745ac72fd076c1b1fee6049131f` |
| `docs/grade-6-math-next-unit-scope.md`                                    | `a94096acd31ce147b5cefc889b28939dbeee8d15948821447496e54bfd84a071` |
| Concatenation of the 16 records and 8 skill files (shell glob order)      | `24a8b562b3a64b41bd946a07f1f1af03299e8d2ae5e8cb46054c9b63b8927e57` |

## 9. Revision 2 closure (review of revision 1, `0b4b3411…7b87`, NOT_READY)

Each finding was re-checked against the cited files before editing.

| Finding                                                        | Root cause                                                                                                               | Changed locations                                                                    | Before/after evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Regression check                                                                                             | Status           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1 MAJOR: disabling model tutoring does not give authored hints | The author inferred authored-hint serving from the Python gate comment without tracing a runtime consumer of `hintSteps` | 1.1 rows 6 and 15; 1.2; 2.6; section 3 tutor row; SP-2; new SP-4; totals; self-audit | Counterexample: gated item → `hint/route.ts:69-77` returns 403 → `page.tsx:624-625` shows "The tutor could not respond."; `hintSteps` is read only at `catalog.ts:542-543` and `python-rules.ts:56`. After: SP-2 chooses H-2 (server-derived flag in `service.ts`, button and helper hidden in `activity-panel.tsx:236-252`, 403 mapped to honest wording in `page.tsx:610-636`, route 403 kept) with unit, API and browser tests; H-1 authored delivery is a separate SP-4. SP-2 estimate 3–4 → 4–6; L1 total 12–17 → 13–19 | Gate rows in section 3 and the STAT6 parallelism column updated for the new paths (`service.ts`, `page.tsx`) | Resolved         |
| 2 MAJOR: structured choice conflicts with contest mode         | The author read the schema but not the load-time rules in `validateContentCatalog`                                       | 1.1 row 16; 2.3 corrections; 2.4 oral round; SP-3; self-audit positive control       | Counterexample: a `homophones-homographs-contest-2` successor with a structured choice field throws at `catalog.ts:406-408`. After: SP-1 chooses per contest successor C-1 (REC: legacy `text` with exact option texts), C-2 (re-author as core, own ruling) or C-3 (separate contract change, out of scope); SP-3 acceptance runs the pre-registration harness and checks alternatives of structured successors. Positive control: a core record with structured choice passes that check                                   | 2.3 "spell it" items still use legacy `text` (admissible in both modes)                                      | Resolved         |
| 3 MINOR: "no item asks for a spelling never shown" overstated  | Conflated whole-word spelling with morphological production                                                              | 1.2; 2.1 L1; 2.3                                                                     | `orthographic-patterns-contest-2` asks for "glimming" from "glim" + "-ing", and the answer is not in the prompt. After: that item is named as existing derivational production; the gap is stated as whole-word spelling from a pronunciation cue                                                                                                                                                                                                                                                                            | Section 2.2's U-B rationale (phoneme-grapheme as the core act) is unchanged                                  | Resolved         |
| 4a NOTE: S-02 is not a live flow                               | Did not trace the session projection                                                                                     | 1.1 row 17; 1.3 F-01 and S-02 severities; section 5                                  | `service.ts:335-342` projects `accessibleAlternative` only for structured or Python items. After: F-01 and S-02 are stored-content defects, Medium now, High once projected (for example after a structured successor)                                                                                                                                                                                                                                                                                                       | 2.3 acceptance check ties structured successors to correct alternatives                                      | Resolved         |
| 4b NOTE: tutor wording overstated                              | Risk phrased as exposure                                                                                                 | 1.1 row 6; section 5                                                                 | After: "a product mismatch and an unevaluated leakage risk, not an observed incident"; fake adapter unless `TUTOR_MODEL_PROVIDER` is `anthropic` (`create-model.ts`)                                                                                                                                                                                                                                                                                                                                                         | Section 2.6 reason unchanged                                                                                 | Resolved         |
| 4c NOTE: decisions-register pin drifted                        | Register edited by the integrator after freeze                                                                           | Baseline; section 8                                                                  | Before `43327cb2…7cbe`; after `d0ee56ad…43e1` with D-335 and D-336 present (both Statistics only). Other pins re-hashed: unchanged; four new pins added                                                                                                                                                                                                                                                                                                                                                                      | The register may drift again; the integrator re-pins at application                                          | Resolved         |
| Identity evidence                                              | Author cannot supply client metadata                                                                                     | Header                                                                               | Label changed to "configured model, self-reported and unverified"                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                                                            | Resolved (label) |
