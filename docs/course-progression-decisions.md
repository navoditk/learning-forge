# Course Progression — Authoritative Decision Matrix

- Status: **81 approved; 67 open extension/shared-teaching candidates.** Approved entries are explicitly marked in
  their individual decision sections below.
- Authority: this file is the **single source of truth** for every
  human-gated course-progression parameter and policy choice.
  `docs/course-progression-architecture.md`, `docs/adr/0013-course-progression-structure.md`,
  and `.github/skills/course-progression-design/SKILL.md` reference these
  `D-nn` identifiers and **must not restate a normative default**.
- Reading rule: every value below is a **recommendation** from the design
  agent unless its Status column says `APPROVED` with a date and an approver
  name. A recommendation is not an approved fact, is not a product decision,
  and must not be implemented.

## How to use this document

1. The product owner (or the named approver) edits the **Status** column to
   `APPROVED <date> <name>` and, where they choose a different value than
   recommended, edits the **Approved value** column.
2. `course-progression-implementer` reads only the **Approved value** column.
   It must refuse to implement any parameter whose Status is `OPEN`.
3. Approved numeric values are written into a **versioned pedagogical-policy
   profile artifact** (`ProgressionPolicyProfile`), never into curriculum
   JSON and never as a module-level constant. See
   `docs/course-progression-architecture.md` §5.
4. Changing an approved value later is a new policy profile version, not an
   edit in place.

## Legend

- **Kind** — `policy` (numeric/pedagogical), `product` (scope/rollout),
  `security` (exposure/authorization), `content` (authoring/review).
- **Blocks** — what cannot proceed until this is approved.
- Recommendations marked **strong** are ones where the design agent believes
  the alternative is unsafe rather than merely different.

---

## A. Assessment exposure and security

### D-01 — Assessment delivery model: open-book vs held-out

| Field          | Value                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Kind           | security                                                                                                                |
| Status         | **APPROVED**                                                                                                            |
| Recommendation | **Held-out** (strong)                                                                                                   |
| Approved value | Branch B — held-out assessment delivery                                                                                 |
| Approver       | Product owner + privacy/safety owner                                                                                    |
| Blocks         | All assessment authoring; `AssessmentBank`; the lesson/unit completion rules; the entire held-out store decision `D-02` |

**Verified context.** The repository `navoditk/learning-forge` is **public**
(`gh repo view` → `"visibility":"PUBLIC"`). Every record under `content/`
contains `prompt`, `deterministicValidator.canonicalAnswer`,
`deterministicValidator.acceptedAnswers`, `solutionRepresentation`,
`solutionMethod`, and the full `hintSteps` ladder, all readable by anyone.
Separately, `scripts/generate-curriculum-site.ts` renders `item.prompt` for
**every** record in `contentCatalog` — including `pending_review` records —
and `.github/workflows/curriculum-site.yml` deploys it to GitHub Pages on
every push to `main`.

**Therefore:** an assessment item authored the way all 128 current records are
authored is not held out in any sense. It is published twice.

## D-01 is a discriminated union, not a preference

Choosing `D-01` selects an entire coherent configuration. The table below is
the **canonical definition of both branches**; `docs/course-progression-architecture.md`
§4.3 references it and specifies only the mechanics, and must never restate a
cell of it. Every downstream artifact — pipeline, skill, agent profiles,
roadmap, fixtures, acceptance criteria — is conditional on this table.

| Dimension                        | **Branch A — open-book**                                                                                                                                                                         | **Branch B — held-out (recommended)**                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Item storage                     | `content/assessments/<program>/` in this **public** repository, reviewed by pull request exactly as practice is                                                                                  | The store chosen in `D-02`, outside this repository                               |
| Bank record contents             | May list member refs `{contentId, contentVersion}` directly                                                                                                                                      | Metadata only; membership resolved at run time from the held-out store            |
| Public site publication          | **Never published.** Open-book means the item is _reachable by a determined reader in the repository_; it does not mean the product advertises the bank on a browsable page                      | **Never published**                                                               |
| API exposure                     | Never lists a bank or an item set; a run returns only the items it currently delivers                                                                                                            | Identical                                                                         |
| Client bundle                    | Assessment module is server-only                                                                                                                                                                 | Identical, plus an import-graph test (S4)                                         |
| Delayed check (`DELAYED_CHECK`)  | **Available**, but establishes _unassisted performance on a knowable item_. It sets `delayedCheckStatus = PERFORMED`, not `CONFIRMED`                                                            | **Available** and establishes independence. Sets `delayedCheckStatus = CONFIRMED` |
| Spaced review (`REVIEW`)         | Runs normally; a failure moves `PERFORMED → LAPSED`                                                                                                                                              | Runs normally; a failure moves `CONFIRMED → LAPSED`                               |
| `HIGH` confidence                | **Not reachable.** No evidence path in this branch supports an independence claim. The band exists in the contract but is unreachable, and that must be stated in the UI copy rather than hidden | **Reachable**, and only via `delayedCheckStatus = CONFIRMED`                      |
| Highest reachable band           | `MEDIUM`                                                                                                                                                                                         | `HIGH`                                                                            |
| Context weights (`D-08`)         | Assessment kinds weighted **below** practice-equivalent independence; the approved vector must encode that                                                                                       | Assessment kinds weighted at or above practice                                    |
| Parent wording                   | "Completed without asking for help, using open materials." Never "independently confirmed"                                                                                                       | "Independently confirmed on an unassisted check after a delay"                    |
| Learner wording                  | "You finished this on your own."                                                                                                                                                                 | "You showed you remembered this on your own."                                     |
| Post-run feedback (`D-30`)       | Per-item correctness permitted; canonical answers still withheld for reusable items                                                                                                              | Identical                                                                         |
| Branch-specific tests            | L14 (wording: no independence claim anywhere), plus L8/L9/L12/L13                                                                                                                                | L15 (S1–S4 exclusion surfaces active), plus L8/L9/L12/L13                         |
| Tests **skipped** in this branch | L15                                                                                                                                                                                              | L14                                                                               |
| Fixture variant                  | `fixture-*/assessment-open-book`                                                                                                                                                                 | `fixture-*/assessment-held-out`                                                   |

**Rules that hold in both branches**, and are therefore _not_ part of this
decision: assessment and review items are never tutored and carry no hint
ladder; item selection is server-side and recorded on an immutable assignment;
a run requires an active assignment bound to the session; no `pending_review`
record is published on the public curriculum site (`D-58`); reassessment
excludes items used by the failed assignment; the household export contains
the learner's own responses and results, never the bank.

**Why held-out is recommended:** the product's central claim — that mastery
distinguishes independent work from assisted work — is not defensible if the
items used to establish it, and their canonical answers, are in a public
repository. Branch A does not make the product dishonest; it makes it a
_different, weaker_ product whose top band is `MEDIUM`. That is a
recommendation, not a decision.

**Honest limit, both branches:** delivering an assessment shows its prompt to
that learner at that moment, and the learner's own response is exported to the
parent. Held-out means _not published in advance and not enumerable_, never
_never displayed_.

### D-02 — Held-out assessment store mechanism

| Field          | Value                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Kind           | security                                                                                            |
| Status         | **APPROVED**                                                                                        |
| Recommendation | **Option A — private reviewed assessment package** (strong)                                         |
| Approved value | Option A — private reviewed assessment package                                                      |
| Approver       | Product owner + engineering owner                                                                   |
| Blocks         | Assessment authoring; the leakage acceptance tests in `docs/course-progression-architecture.md` §13 |

| Option              | Mechanism                                                                                                                                                                                              | Review history                                                                                                         | Weaknesses                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A (recommended)** | A separate **private** repository published as a private package (GitHub Packages / private npm) and installed as a server-only dependency. Items load through a server-only `assessmentStore` module. | Full: pull-request review in the private repo, same `docs/content-review.md` gate                                      | Adds a second repository and a package-publish step; private-package auth must be managed in Render                                                  |
| **B**               | Database-backed assessment store, seeded by an operator-run import from a private, reviewed source                                                                                                     | Partial: rows are not diffable, so review must happen on the import source, which must itself be a reviewed repository | Drifts from the "curriculum as reviewed code" precedent (ADR-0006); the import source becomes an unversioned dependency unless it is itself reviewed |
| **C**               | Encrypted bundle committed to the public repo, key in the deployment environment                                                                                                                       | Full, but ciphertext                                                                                                   | Ciphertext is permanently public; a future key compromise retroactively exposes every assessment. Not recommended                                    |

**Every option must preserve a human review gate.** An option that stores
assessment items without version history, pull-request review, or an
equivalent auditable approval trail is not acceptable and is deliberately not
listed: `docs/content-review.md` applies to assessment items exactly as it
applies to practice items. The held-out decision changes _where_ review
happens, never _whether_ it happens.

Whichever is chosen, the **exclusion surfaces** in
`docs/course-progression-architecture.md` §4.3B and their acceptance tests are
mandatory and not separately negotiable.

### D-03 — Treatment of the six existing ratios records under a held-out model

| Field          | Value                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Kind           | content                                                                                                      |
| Status         | **APPROVED**                                                                                                 |
| Recommendation | Keep all six public as `practice`; author assessment items fresh in the held-out store                       |
| Approved value | Keep all six existing ratios records public as practice; author assessment items fresh in the held-out store |
| Approver       | Product/content owner                                                                                        |
| Blocks         | Pilot record-count estimates (`D-36`)                                                                        |

The six existing ratios records are already public and already on the
curriculum site. They cannot become held-out retroactively.

---

## B. Authorization, rollout, and safety

### D-04 — Sequencing feature flag default for the live household

| Field          | Value                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| Kind           | product                                                                               |
| Status         | **APPROVED 2026-09-19, confirmed 2026-09-19**                                         |
| Recommendation | Ship enforcement with sequencing **off**, enable after one week of observation        |
| Approved value | Ship enforcement with sequencing off; enable sequencing after one week of observation |
| Approver       | Product owner                                                                         |
| Blocks         | Cutover plan                                                                          |

**Not negotiable regardless of this decision:** role and readiness
authorization is always on and fail-closed. The flag governs **unit/lesson
sequencing and its UI only**. It can never disable "an assessment item is
never tutored", "an assessment requires an active run", or household scoping.
See `docs/course-progression-architecture.md` §7.

### D-05 — Acknowledgement: closing the `startSession` bypass removes current access

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Kind           | product                                                                              |
| Status         | **APPROVED 2026-09-19**                                                              |
| Recommendation | Acknowledge and proceed                                                              |
| Approved value | Acknowledge and proceed; existing access may be refused until an authored gate opens |
| Approver       | Product owner                                                                        |
| Blocks         | Authorization increment                                                              |

Today `GET /api/phase1/session?contentId=…` starts a session on any reviewed
item in a program regardless of evidence. Closing it makes content that the
existing live learner can reach today unreachable until its gate opens.

### D-06 — Override re-authentication mechanism

| Field          | Value                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Kind           | security                                                                      |
| Status         | **APPROVED 2026-09-19**                                                       |
| Recommendation | Password re-entry within a short step-up window before an override is written |
| Approved value | Password re-entry within a short step-up window before an override is written |
| Approver       | Product owner + privacy/safety owner                                          |
| Blocks         | Parent/operator override (`§9`)                                               |

---

## C. Mastery aggregation parameters

All of these feed the formula in `docs/course-progression-architecture.md` §8.
None may be hard-coded. All live in a versioned `ProgressionPolicyProfile`.

| ID   | Symbol               | Parameter                                                            | Recommendation                                                                                                           | Status                  | Approver               |
| ---- | -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------------------- |
| D-07 | `assistanceWeight[]` | Weight by maximum assistance used                                    | Carry today's documented ladder: `1.00 / 0.90 / 0.75 / 0.55 / 0.35 / 0.10`                                               | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-08 | `contextWeight[]`    | Weight by assessment context                                         | `delayed_check 1.00`, `unit_assessment 1.00`, `lesson_assessment 0.95`, `review 0.90`, `practice 0.80`, `placement 0.40` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-09 | `ρ`                  | Repeat-exposure discount per prior exposure to the same item         | `0.6`                                                                                                                    | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-10 | `H`                  | Recency half-life (days)                                             | `30`                                                                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-11 | `N`                  | Aggregation window (most recent observations)                        | `8`                                                                                                                      | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-12 | `M_med`              | Minimum evidence mass for `MEDIUM`                                   | `1.6`                                                                                                                    | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-13 | `K_med`              | Minimum independent observations for `MEDIUM`                        | `2`                                                                                                                      | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-14 | `θ_med`              | Minimum estimate for `MEDIUM`                                        | `0.70`                                                                                                                   | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-15 | `θ_gate`             | Minimum estimate for a structural unlock gate                        | `0.75` (today's planner `DEFAULT_SECURE_THRESHOLD`)                                                                      | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-16 | `θ_relock`           | Estimate below which a `CONFIRMED` skill is flagged for early review | `0.55`                                                                                                                   | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-17 | `stalenessDays`      | Days without an observation before confidence degrades one band      | `45`                                                                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-18 | `spacingIntervals[]` | Expanding review intervals (days), replacing the flat 14             | `3 / 7 / 21 / 45`                                                                                                        | **APPROVED 2026-09-19** | Product/pedagogy owner |

### D-19 — `Attempt.highestAssistance` correction strategy

| Field          | Value                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Kind           | policy                                                                                          |
| Status         | **APPROVED 2026-09-19**                                                                         |
| Recommendation | **Option 2 — derive at read time from `AssistanceEvent`, and drop or ignore the stored column** |
| Approved value | Derive maximum assistance at read time from `AssistanceEvent`; ignore the stored column         |
| Approver       | Product/engineering owner                                                                       |
| Blocks         | Mastery aggregation; parent evidence; household export                                          |

**Verified defect.** `src/phase1/service.ts:234` writes
`highestAssistance: 'INDEPENDENT'` at attempt creation and **never updates
it**, so the column is permanently `INDEPENDENT` for every attempt in the
database. `src/server/household-data.ts:67` exports that column directly, so
the household data export currently tells a parent that every attempt was
independent. `src/phase1/service.ts:691` works around it by reading
`assistanceEvents[0].level` under `orderBy: { occurredAt: 'desc' }, take: 1` —
that is the **most recent** assistance event, not the **highest**.

| Option              | Approach                                                                                                                 | Trade-off                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1                   | Keep the column and update it whenever an `AssistanceEvent` is appended                                                  | Requires the attempt-immutability trigger to permit this one column; muddies the immutability guarantee            |
| **2 (recommended)** | Treat `AssistanceEvent` as authoritative and derive `max(level)` at read time; stop selecting the stored column anywhere | One correct source; no immutability exception; needs an index and a read-path change everywhere the column is used |
| 3                   | Add a separate append-only projection table                                                                              | Correct but heavier than the problem warrants at this scale                                                        |

Either way, `docs/course-progression-architecture.md` §8.2 specifies **maximum
by assistance-level ordinal**, never "most recent".

### D-20 — Recalculation and cutover for the new `algorithmVersion`

| Field          | Value                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Kind           | policy                                                                                                                |
| Status         | **APPROVED 2026-09-19**                                                                                               |
| Recommendation | Shadow-compute the new version alongside the old, compare, then switch the active pointer; never mutate existing rows |
| Approved value | Shadow-compute the new version alongside the old, compare, then switch the active pointer; never mutate existing rows |
| Approver       | Product/engineering owner                                                                                             |
| Blocks         | Mastery increment                                                                                                     |

The new aggregation changes the meaning of every existing `MasteryEstimate`
row for the live household.

---

## D. Delayed checks, placement, skip, remediation, reassessment

| ID   | Parameter                                                                                            | Recommendation                                                                                                          | Status                  | Approver               |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------- |
| D-21 | `minDelayHours` — minimum separation from the last instruction or assistance event for that skill    | `20` (next calendar day)                                                                                                | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-22 | `placementProbeMaxItems`                                                                             | `5` (today's cap)                                                                                                       | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-23 | `lessonAssessment.itemsPerAttempt`                                                                   | `3`                                                                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-24 | `lessonAssessment.passBar` — correct items required out of `itemsPerAttempt`                         | `3 of 3` at independent assistance                                                                                      | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-25 | `unitAssessment.itemsPerAttempt`                                                                     | `6`                                                                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-26 | `unitAssessment.passBar`                                                                             | `5 of 6`                                                                                                                | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-27 | `maxReassessments` — consecutive reassessments before routing to a parent-visible "needs help" state | `2`                                                                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-28 | `reassessmentCooldown`                                                                               | one completed practice session **and** `12` hours                                                                       | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-29 | `assessmentRunExpiry` — how long an `IN_PROGRESS` run stays valid before `EXPIRED`                   | `24` hours                                                                                                              | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-30 | `feedbackLevel` after a scored run                                                                   | `PER_ITEM_CORRECTNESS` without revealing correct answers                                                                | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-31 | Skip bar — evidence required to mark a lesson `COMPLETE_BY_SKIP`                                     | Pass the lesson assessment bank at `D-24` on the **first** run, with no prior teaching or practice event for that skill | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-32 | Unit skip bar                                                                                        | Pass the unit assessment at `D-26` on the first run                                                                     | **APPROVED 2026-09-19** | Product/pedagogy owner |

**`D-28` implementation note (2026-09-24).** For a delayed check after a lapse
or failed delayed check, "one completed practice session" is read as a
`PRACTICE` session on the skill's public content, by the same learner. It must
have ended after remediation began, on a passed same-sitting check. A session
ended by the operator drain does not count. The practice attempt is itself
exposure, so the `D-21` delay window restarts from it. The lesson and unit
reassessment path does not yet enforce this condition.

`D-24` and `D-26` are the "ordinary lesson/unit assessment pass bars" and are
deliberately listed here rather than in the architecture document, which
states only that a bar exists and where it is read from.

---

## E. Completion, mastery, and product scope

### D-33 — Completion is not mastery: parent-surface wording

| Field          | Value                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                         |
| Status         | **APPROVED 2026-09-19**                                                                                         |
| Recommendation | Render completion and mastery as two separate, separately-labeled facts; never merge them into one "done" state |
| Approved value | Render completion and mastery as two separate, separately-labeled facts; never merge them into one "done" state |
| Approver       | Product owner                                                                                                   |
| Blocks         | Parent evidence increment                                                                                       |

A learner can complete a lesson with assistance without mastering its skill,
and can master a skill without completing its lesson (via skip). See
`docs/course-progression-architecture.md` §6.4.

### D-34 — Pilot unit lesson count

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Kind           | product                                                     |
| Status         | **APPROVED 2026-09-19**                                     |
| Recommendation | `3`, staged one lesson at a time; the approved bound is 2–4 |
| Approved value | 3, staged one lesson at a time                              |
| Approver       | Product owner                                               |
| Blocks         | Pilot scope                                                 |

### D-35 — `ratio-tables → unit-rates` prerequisite edge

| Field          | Value                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                                                                                |
| Status         | **APPROVED 2026-09-19**                                                                                                                                                                                                                |
| Recommendation | Re-audit and most likely **remove or narrow** the edge                                                                                                                                                                                 |
| Approved value | Remove `unit-rates` from the `ratio-tables` skill prerequisite list. The pilot lesson order remains authored separately; `ratio-tables-2` may use a narrower readiness reference only if it remains inside the approved skill closure. |
| Approver       | Product/content owner (explicit authorization in chat)                                                                                                                                                                                 |
| Blocks         | Pilot lesson ordering                                                                                                                                                                                                                  |

**Verified context.** Before this approval,
`content/skills/ratio-tables.json` declared
`prerequisiteSkillCodes: ["unit-rates"]`. It now declares no prerequisite;
`content/ratios/ratio-tables-1.json`
(the `core`, `foundational` record) has `solutionMethod: "Use the same scale
factor in both rows of the ratio table."` — it requires no unit rate at all.
Only `ratio-tables-2.json` (`depth`, `challenging`) has
`solutionMethod: "Find the unit rate first, then multiply it by the new
distance."`

Under the repository's own prerequisite rule
(`.github/skills/curriculum-authoring/SKILL.md` step 7, and the MATHCOUNTS
prerequisite self-audit in `docs/02-curriculum-and-pedagogy.md`, which rejected
exactly this pattern), an edge justified only by one harder composition is a
teaching-order edge, not a conceptual dependency.

This matters for the pilot: a strictly linear
`ratio-language → unit-rates → ratio-tables` lesson chain assumes the edge is
sound.

### D-36 — Content-volume inputs

| Field          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Status         | **APPROVED 2026-09-20**                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Recommendation | See `D-48`, `D-49`, `D-50`, and `D-42`, which are the actual independent inputs                                                                                                                                                                                                                                                                                                                                                                           |
| Approved value | For the initial three-lesson Grade 6 Math pilot: one teaching record per lesson; six practice records per lesson (four threshold items plus two remediation headroom items); two review records per skill; nine held-out lesson-assessment items per lesson and eighteen held-out unit-assessment items, derived from the approved no-reuse reassessment policy. Revisit volumes after live pilot observation; any expansion remains separately reviewed. |
| Approver       | Product/pedagogy owner (explicit approval in chat)                                                                                                                                                                                                                                                                                                                                                                                                        |
| Blocks         | Authoring volume                                                                                                                                                                                                                                                                                                                                                                                                                                          |

This entry is a pointer, not an independent value. Content volume is not one
decision; it is four independent inputs plus arithmetic:

- **Independent inputs** (each its own decision): teaching records per lesson
  (`D-48`), practice records per lesson (`D-49`), review records per skill
  (`D-50`), and the lesson practice threshold (`D-42`).
- **Derived, not chosen**: assessment bank minimums, which are
  `itemsPerAttempt × (1 + maxReassessments)` under a no-reuse rule, determined
  once `D-23`/`D-25`/`D-27` (and, for the delayed-check and review banks,
  `D-43`/`D-44`/`D-45`/`D-46`) are approved.

`docs/course-progression-architecture.md` §11.3 presents the symbolic form as
primary and any numeric table only as arithmetic worked from named inputs.
Volumes are **assumptions about this learner**, not findings about learning.

---

### D-37 — Relabelling existing reviewed content with an explicit `role`

| Field          | Value                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                 |
| Status         | **APPROVED 2026-09-19**                                                                                                 |
| Recommendation | Permit relabelling all 128 existing reviewed records to `role: "practice"` without re-review, as a mechanical migration |
| Approved value | Relabel all 128 existing reviewed records to `role: "practice"` without re-review as a mechanical migration             |
| Approver       | Product/content owner (explicit approval in chat)                                                                       |
| Blocks         | Role increment                                                                                                          |

### D-38 — Replacing the exact-two-records-per-skill invariant

| Field          | Value                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                           |
| Status         | **APPROVED 2026-09-19**                                                                           |
| Recommendation | Replace with role- and program-aware validation (`docs/course-progression-architecture.md` §11.2) |
| Approved value | Replace with role- and program-aware validation                                                   |
| Approver       | Product/content owner + engineering owner                                                         |
| Blocks         | Any teaching or assessment record for any skill                                                   |

**Verified context.** `src/content/catalog.ts` enforces
`REQUIRED_RECORDS_PER_SKILL = 2` and throws
`"<skill> must have exactly 2 content records, found <n>"` **at module load**.
Adding a single teaching record to any ratios skill would therefore crash the
application at import time. Three program self-audit tests
(`tests/content/catalog.test.ts`, MOEMS / AMC 8 / MATHCOUNTS) additionally
assert `expect(records).toHaveLength(2)` and
`expect(new Set(records.map((item) => item.prompt)).size).toBe(2)`.

### D-39 — Whether real `Attempt.elapsedSeconds` capture is in scope

| Field          | Value                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                                                                                                                    |
| Status         | **APPROVED 2026-09-20**                                                                                                                                                                                    |
| Recommendation | Separate increment; the delay window does **not** depend on it                                                                                                                                             |
| Approved value | Defer real elapsed-time capture to a post-pilot increment. Keep the current non-evidence value out of mastery calculations, parent claims, and release gates. Revisit after live Grade 6 Math observation. |
| Approver       | Product/engineering owner (explicit approval in chat)                                                                                                                                                      |
| Blocks         | Nothing in the progression critical path                                                                                                                                                                   |

`Attempt.elapsedSeconds` is hardcoded to `0` in `createAttempt`.

### D-40 — Program registry replacing `PROGRAM_ROSTER`

| Field          | Value                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                           |
| Status         | **APPROVED**                                                                                                      |
| Recommendation | Introduce a versioned `Program` registry record and derive `PROGRAM_ROSTER` and `CurriculumProgramSchema` from it |
| Approved value | Introduce a versioned `Program` registry and derive the roster and program schema from it                         |
| Approver       | Product/engineering owner                                                                                         |
| Blocks         | Cross-program generality (`§12`)                                                                                  |

### D-41 — Screen-reader human review scope

| Field          | Value                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                                                                                 |
| Status         | **APPROVED 2026-09-19**                                                                                                                                                 |
| Recommendation | One manual screen-reader pass over the progression surfaces before the pilot serves a learner; axe automation is not sufficient for live-region and focus-order quality |
| Approved value | One manual screen-reader pass over progression surfaces before serving a learner                                                                                        |
| Approver       | Accessibility/product owner                                                                                                                                             |
| Blocks         | Pilot serving                                                                                                                                                           |

---

## F. Policy keys added after the second review

These close gaps the second independent review identified: policy keys the
architecture referenced or implied without a decision entry.

| ID   | Policy key                                           | Parameter                                                                                  | Recommendation                                                                                                                                                                | Status                  | Approver                             |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------ |
| D-42 | `lessonMinPracticeItems`                             | Distinct practice items a learner must attempt before a lesson's practice threshold is met | `4`                                                                                                                                                                           | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-43 | `delayedCheckItemsPerAttempt`, `delayedCheckPassBar` | Items presented in a delayed check, and how many must be correct                           | `2` items, `2 of 2`                                                                                                                                                           | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-44 | `delayedCheckReuse`                                  | Whether a delayed check may reuse an item the learner has seen for that skill              | **No reuse** — unseen items only                                                                                                                                              | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-45 | `reviewItemsPerAttempt`, `reviewPassBar`             | Items presented in a spaced review, and how many must be correct                           | `1` item, `1 of 1`                                                                                                                                                            | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-46 | `reviewReuse`                                        | Whether a review may reuse a previously seen item, and after what interval                 | Reuse permitted only for items not seen within the last two spacing intervals                                                                                                 | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-47 | `stepUpReauthLifetimeMinutes`                        | How long a step-up re-authentication remains valid for writing overrides                   | `10` minutes, single-use per override                                                                                                                                         | **APPROVED 2026-09-19** | Product owner + privacy/safety owner |
| D-48 | `teachingRecordsPerLesson`                           | Teaching records authored per lesson                                                       | `1`, with a second alternative representation optional                                                                                                                        | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-49 | `practiceRecordsPerLesson`                           | Practice records authored per lesson                                                       | At least `D-42` plus headroom for remediation on unseen items                                                                                                                 | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-50 | `reviewRecordsPerSkill`                              | Review-role records authored per skill                                                     | `2`, so a review need not repeat the item that confirmed the skill. **Amended to `3` by `D-67` (2026-09-24)**                                                                 | **APPROVED 2026-09-19** | Product/pedagogy owner               |
| D-51 | `difficultyWeight[]`                                 | Whether item difficulty modifies evidence weight, and if so how                            | **Do not weight by difficulty in the first version.** Keep `difficultyWeight` absent rather than set to 1.0, so its absence is a recorded choice rather than a silent default | **APPROVED 2026-09-19** | Product/pedagogy owner               |

| D-59 | `allowAssistanceInPractice` | Whether assistance-supported practice counts toward a lesson's practice threshold | `true` — completion may be earned with help; mastery is what assistance discounts | **APPROVED 2026-09-19** | Product/pedagogy owner |

`D-24` and `D-26` remain the ordinary lesson and unit assessment pass bars.
`D-07` remains the sole authority for assistance weights; the table in
`docs/02-curriculum-and-pedagogy.md` is the historical product hypothesis and
is superseded by `D-07` for every progression purpose.

---

## G. Partial-program rollout

### D-52 — Rollout mode for a program that is only partly unitised

| Field          | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Kind           | product                                                                   |
| Status         | **APPROVED**                                                              |
| Recommendation | **Option H — hybrid mode with a named legacy compatibility policy**       |
| Approved value | Option H — hybrid mode with a named legacy compatibility policy           |
| Approver       | Product owner + engineering owner                                         |
| Blocks         | The entire pilot; without this, 24 of 27 Grade 6 Math skills are stranded |

**Verified context.** `grade-6-math` has **27** skills. The proposed pilot unit
covers **3** (`ratio-language`, `unit-rates`, `ratio-tables`). If authorization
becomes fail-closed and only unit-covered targets are grantable, the other
**24 skills become unreachable** — a regression for the live learner, not a
gate.

| Option              | Mechanism                                                                                                                                                                                                                           | Trade-off                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H (recommended)** | `grade-6-math` carries units for the pilot skills. The other 24 skills are reachable through an explicit, authored, versioned **legacy compatibility policy** (`D-53`) that grants practice-only activity on skills no unit claims. | One program, one evidence stream, no duplicated skill codes. Requires the legacy policy to be a real authored artifact, not a fallback                                                              |
| **I**               | A separate pilot program (for example `grade-6-math-ratios-pilot`) with its own prefixed skill codes; `grade-6-math` is untouched and keeps today's behavior wholesale.                                                             | Simplest isolation, but duplicates three skills, splits the learner's evidence for the same concepts across two programs, and makes the pilot's results not directly transferable to `grade-6-math` |

**Why hybrid is recommended:** option I duplicates skill codes for concepts the
learner already has evidence for, and program isolation then means that
evidence does not transfer — so the pilot would measure a learner who appears
to have never seen ratios. That is a recommendation, not a decision.

### D-60 — Access policy for **every** progression mode, including `skill-graph-only`

| Field          | Value                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Kind           | security                                                                                                       |
| Status         | **APPROVED**                                                                                                   |
| Recommendation | Every program references an explicit, versioned `AccessPolicy`; there is no mode that is implicitly permissive |
| Approved value | Every program references an explicit, versioned `AccessPolicy`; missing or invalid policy grants nothing       |
| Approver       | Product owner + engineering owner                                                                              |
| Blocks         | Cutover (Stage C4) for **all** currently enabled programs, not only the pilot                                  |

`D-52`/`D-53` covered the hybrid remainder. They did not cover the five
programs that will still be `skill-graph-only` at cutover — Math Kangaroo,
MOEMS, AMC 8, MATHCOUNTS, and Scripps. Leaving those implicitly permitted
reintroduces exactly the missing-state fallback this work exists to remove.

| Mode               | Required policy reference                                                                                    | Recommended grants                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `skill-graph-only` | `accessPolicyRef` — required, non-null                                                                       | `PRACTICE`, `PLACEMENT`, `REVIEW`, and `DELAYED_CHECK` only where the program already declares a readiness contract; never `LESSON_ASSESSMENT`/`UNIT_ASSESSMENT`, which have no bank or bar in this mode. Prerequisite graph and existing per-item contest-readiness contracts are honored |
| `hybrid`           | `accessPolicyRef` for unit-covered targets **and** `legacyCompatibilityPolicyRef` for the remainder (`D-53`) | As `D-53`                                                                                                                                                                                                                                                                                  |
| `unit-sequenced`   | `accessPolicyRef`                                                                                            | Full progression grants                                                                                                                                                                                                                                                                    |

**Clarification approved 2026-09-22 (product owner, in chat).** In a `hybrid`
program, the `accessPolicyRef` that governs **unit-covered** targets carries
the full progression grants of `unit-sequenced` mode, including
`LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, and `DELAYED_CHECK`. The "As `D-53`"
grants apply only to the legacy remainder. `grade-6-math-access@1.1.0`
implements this reading.

**Fail-closed:** a program whose `accessPolicyRef` is missing, unresolvable, or
fails schema validation grants **nothing**, and its learners see an explicit
"temporarily unavailable" state rather than either an error or open access.
Acceptance case I28 requires one test per currently enabled program.

### D-53 — Legacy compatibility policy definition

| Field          | Value                                                                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | security + product                                                                                                                                                                                                                      |
| Status         | **APPROVED**                                                                                                                                                                                                                            |
| Recommendation | An authored, versioned policy profile granting `PRACTICE`, `PLACEMENT`, and `REVIEW` only — never `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, or `DELAYED_CHECK` — on skills claimed by no unit, subject to the existing prerequisite graph |
| Approved value | Authored, versioned policy granting only `PRACTICE`, `PLACEMENT`, and `REVIEW` for skills claimed by no unit                                                                                                                            |
| Approver       | Product owner + engineering owner                                                                                                                                                                                                       |
| Blocks         | Hybrid rollout                                                                                                                                                                                                                          |

This must be an **explicit authored grant**, never a missing-state fallback.
Authorization denies unless some authored policy grants; "no policy covers this
target" is a denial, not a permission. See
`docs/course-progression-architecture.md` §7.5.

---

## H. Assessment record model and audit

### D-54 — Duplicate assignment-creation behavior

| Field          | Value                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                                                      |
| Status         | **APPROVED 2026-09-19**                                                                                                                      |
| Recommendation | **Idempotent replay on a matching idempotency key; reject on a different key while an active assignment exists**                             |
| Approved value | Idempotent replay on a matching idempotency key; reject with `ACTIVE_ASSIGNMENT_EXISTS` on a different key while an active assignment exists |
| Approver       | Product/engineering owner                                                                                                                    |
| Blocks         | `AssessmentAssignment` implementation                                                                                                        |

The architecture specifies one consistent behavior
(`docs/course-progression-architecture.md` §6.4): a repeated request carrying
the **same** idempotency key returns the existing assignment unchanged; a
request carrying a **different** key while an assignment for the same target is
`PENDING` or `IN_PROGRESS` is rejected with `ACTIVE_ASSIGNMENT_EXISTS`. This
entry exists in case the product prefers reject-always, which would make a
double-clicked button an error rather than a no-op.

### D-55 — Child-safe phrase and rubric artifact

| Field          | Value                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                    |
| Status         | **APPROVED 2026-09-19**                                                                                                                                                    |
| Recommendation | A versioned `child-safe-phrasing` artifact holding approved phrasings and a prohibited-pattern list, reviewed like content and referenced by version from the wording test |
| Approved value | A versioned `child-safe-phrasing` artifact with approved phrasings and prohibited patterns, reviewed like content                                                          |
| Approver       | Product owner + accessibility/product owner                                                                                                                                |
| Blocks         | Acceptance test E10                                                                                                                                                        |

Without a versioned artifact, "child-safe wording" is a snapshot test against
whatever text happened to ship.

### D-56 — Disposition of the 18 content/skill prerequisite mismatches

| Field          | Value                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kind           | content                                                                                                                                                                                                                                                                                                                                    |
| Status         | **APPROVED 2026-09-19**                                                                                                                                                                                                                                                                                                                    |
| Recommendation | Treat the skill graph as authoritative; remove or re-type every content-level prerequisite list in Stage A; re-audit the eight edges that differ substantively                                                                                                                                                                             |
| Approved value | Skill graph is authoritative; remove all legacy content prerequisite lists. Preserve only narrower `itemReadinessRefs` that are already inside the owning skill's prerequisite closure; discard self-references and out-of-closure references. This resolves the six substantive edge disagreements without adding new skill dependencies. |
| Approver       | Product/content owner (explicit authorization in chat)                                                                                                                                                                                                                                                                                     |
| Blocks         | Stage A                                                                                                                                                                                                                                                                                                                                    |

**Verified context.** Content records carry their own
`prerequisiteSkillCodes`, unconstrained by `ContentItemSchema` and unchecked
against the owning skill. An audit of all 128 records found **18 records whose
item-level prerequisites disagree with their skill's**, and **10 records that
list their own skill as a prerequisite** — including `ratio-tables-2`, which
lists `ratio-tables`. `SkillSchema` forbids self-prerequisites; the content
schema does not.

The mismatches fall entirely in the two programs whose self-audit tests do not
assert item/skill prerequisite equality (`grade-6-math` and `math-kangaroo-6`);
MOEMS, AMC 8, and MATHCOUNTS are consistent because their tests assert it. Full
list and proposed disposition: `docs/course-progression-architecture.md` §11.1.

This is a broader finding than `D-35`, which concerns one specific edge.

### D-57 — Introducing a `version` field on `Skill`

| Field          | Value                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Kind           | content                                                                                                |
| Status         | **APPROVED**                                                                                           |
| Recommendation | Add a required `version` to `SkillSchema` so skill references can be pinned like every other reference |
| Approved value | Add a required `version` to `SkillSchema`                                                              |
| Approver       | Product/engineering owner                                                                              |
| Blocks         | Version pinning on mastery, review schedules, and item selections                                      |

`SkillSchema` currently has no `version` field, so a skill reference cannot be
pinned and a skill's meaning can change under existing evidence silently.

### D-58 — Publication scope of the public curriculum site

| Field          | Value                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Kind           | security                                                                                                                     |
| Status         | **APPROVED**                                                                                                                 |
| Recommendation | Publish a **reviewed teaching-and-practice projection only**; fix the code path **before Stage A** as Stage A0               |
| Approved value | Reviewed teaching-and-practice projection only; Stage A0 shipped on 2026-09-19; no current unreviewed-content leak evidenced |
| Approver       | Product owner + privacy/safety owner                                                                                         |
| Blocks         | Stage A, and any change to the site generator                                                                                |

**Precise statement of the defect.** `scripts/generate-curriculum-site.ts`
iterates `contentCatalog`, **not** `servableContentCatalog`. All 128 records
are currently `review.status: "reviewed"`, so **no unreviewed content is public
right now**. The defect is the **code path**, not a live leak: the first
`pending_review` record merged to `main` is published automatically on the next
push, with no gate, no review, and no test that would fail. Every prior
authoring increment created such records — they were pending for days before
approval — so this has been latent, not theoretical.

Two aggravating factors: `scripts/` is outside `tsconfig.json`'s `include`, so
the generator is not typechecked; and no test asserts anything about the
generated output.

**Remediation completed in Stage A0 (2026-09-19):**

1. Change the generator to read an explicit **reviewed teaching-and-practice
   projection** rather than the raw catalog — a named export such as
   `publishableContentProjection`, filtered on `review.status === 'reviewed'`
   and `role ∈ {teaching, practice}`, with current legacy records that lack a
   role treated as `practice` for this projection only. The projection must be
   a reviewed artifact rather than an inline predicate that can be edited away.
2. Add `scripts/**/*.ts` to `tsconfig.json`'s `include`.
3. Add the **sentinel regression test** (L13): use a pure generator-input seam
   to inject a synthetic `pending_review` record and a synthetic
   assessment-role record, run the generator into a temporary directory, and
   assert neither appears in the output. Without the injection the test is
   vacuous today, because there is nothing pending to catch.
4. Record the product owner's acknowledgement that unreviewed content was
   publishable and that no evidence of an actual leak exists.

This is independent of `D-01` — it is wrong under both branches.

### D-61 — Gate set required to resume curriculum authoring

| Field          | Value                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | product                                                                                                                                            |
| Status         | **APPROVED 2026-09-19**                                                                                                                            |
| Recommendation | Architecture approval alone is **not** sufficient; the set below must be satisfied                                                                 |
| Approved value | All listed independent-review, publication, exposure, content, registry, rollout, and stage-merge gates must be satisfied before authoring resumes |
| Approver       | Product/content owner + engineering owner                                                                                                          |
| Blocks         | Lifting the authoring pause                                                                                                                        |

Resuming role-based authoring requires **all** of:

| Requirement                                         | Why                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Independent review passed and architecture approved | Baseline                                                                                      |
| `D-58` resolved **and Stage A0 shipped**            | Otherwise a new `pending_review` record is published on merge                                 |
| `D-01` resolved                                     | Determines whether assessment items may be authored in this repository at all                 |
| `D-02` resolved                                     | Required only if `D-01` = Branch B, before the first assessment record crosses into the store |
| `D-03` resolved                                     | Disposition of the six existing ratios records                                                |
| `D-37`, `D-38` resolved                             | Role labelling, and the exactly-two invariant that throws at module load                      |
| `D-56`, `D-57` resolved                             | Prerequisite remediation and `Skill.version`, both of which change the record shape           |
| `D-40` resolved                                     | The program registry that role and prefix validation reads                                    |
| `D-52` resolved, plus `D-53` if hybrid              | Otherwise authoring targets a structure whose access model is undecided                       |
| **Stage A0 and Stage A1 merged**                    | The role schemas and validators must exist before a record can be authored against them       |

Authoring **practice-role** content for an existing program under the current
uniform schema may be unpaused earlier, by explicit product-owner decision,
once `D-58`/Stage A0 is done — that narrower option should be recorded here
rather than assumed.

**Scoped Science exception — approved conditional 2026-10-15; conditions
satisfied for this bounded draft scope on 2026-10-15.** D-173/SCI6-U6 permits
only three D-168 skills and six D-169 core practice drafts. Exact independently
reviewed U5 rev3 was accepted/applied and passed integrated94files/2,016tests/
build; applicable D-61 evidence is in SCI6-PREREQ. Owner replied **"approve"**
to the explicit engineering-owner sign-off request after that evidence.
Drafting may now start only within [SCI6-DRAFT](agent-handoffs/SCI6-DRAFT.md),
Claude Opus in isolated bundle, llm_drafted/owned/pending_review. Independent
cross-family review, human content approval, registration and release remain
separate. This does not lift the general authoring pause.

**Scoped Python exception — approved by product/content owner 2026-10-10.**
In the focused Python decision form, the owner selected `approve-recommended`:
Python 3.14; beginner-core `py6-print-output-reading`; exactly one
`practice` record; clearly labelled internal objective codes and link-only
sources with original wording/code. No optional depth, teaching record,
code execution or held-out assessment is included.

This is a **conditional drafting exception**, not a full pause lift.
Drafting may start only after the independently reviewed Python
validator/content contract is implemented, validated and integrated, and
applicable D-61 gate evidence and engineering-owner sign-off are recorded.
The proposal is
`docs/curriculum-dossiers/python-intro-grade-6-authoring-prerequisites-20261010.md`
(reviewed SHA-256
`4375fbe8564857f53bf6247168a16107298a36617a484c84c668bf7fc918f958`).
The item must remain `llm_drafted`, `owned` and `pending_review`; independent
cross-family review follows authoring, then separate human content approval.
This decision authorizes no learner availability, serving, deployment or
exception for any other program.

### D-62 — Assessment-assignment requirement for placement and review

| Field          | Value                                                                                                                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | security + product                                                                                                                                                                                                                                                |
| Status         | **APPROVED 2026-09-22**                                                                                                                                                                                                                                           |
| Recommendation | Lesson, unit, and delayed-check activity always requires an active assessment assignment. Placement and review require one only for skills an authored unit claims; skills claimed by no unit keep assignment-free placement and review under their access policy |
| Approved value | As recommended                                                                                                                                                                                                                                                    |
| Approver       | Product owner (explicit authorization in chat, following independent-review finding M2)                                                                                                                                                                           |
| Blocks         | Stage C4 cutover                                                                                                                                                                                                                                                  |

**Why.** The architecture did not state whether placement and review need an
assignment outside a unit. C3 readiness assumed they always did, while no
placement, review, or delayed-check assignment can yet be created, and the
learner UI starts placement and review sessions without one. Left alone, C4
would silently withdraw diagnostic and spaced review for all 27 Grade 6 Math
skills and for every `skill-graph-only` program, which have no banks. The
approved rule preserves `D-53`'s legacy grants for unclaimed skills and makes
assignment-free placement or review on pilot skills an observable
`RUN_NOT_ACTIVE` shadow divergence to dispose before cutover. The rule is
implemented once, in `requiresAssessmentAssignment`, and consumed by both the
shadow predicate and the cutover readiness report.

### D-63 — Delayed-check item source

| Field          | Value                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content + policy                                                                                                                                                                                                                       |
| Status         | **APPROVED 2026-09-23**                                                                                                                                                                                                                |
| Recommendation | A dedicated held-out delayed-check bank per pilot skill, sized `delayedCheckItemsPerAttempt × (1 + maxReassessments)` = 2 × 3 = **6 items** per skill (arithmetic from `D-43`/`D-27`), so the lesson banks' no-reuse pools stay intact |
| Approved value | As recommended                                                                                                                                                                                                                         |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                |
| Blocks         | Serving `DELAYED_CHECK` assignments                                                                                                                                                                                                    |

### D-64 — Placement probe item source

| Field          | Value                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kind           | content + policy                                                                                                                                                                                                                                 |
| Status         | **APPROVED 2026-09-23**                                                                                                                                                                                                                          |
| Recommendation | Placement assignments select from reviewed public **practice** items (up to `D-22`), as today's diagnostic does. The evidence is weak by design (`contextWeight[placement]`, `D-08`), so open-book is acceptable. Probed items count as exposure |
| Approved value | As recommended                                                                                                                                                                                                                                   |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                          |
| Blocks         | Serving `PLACEMENT` assignments                                                                                                                                                                                                                  |

### D-65 — Same-sitting independent check

| Field          | Value                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | product + security                                                                                                                                                                                                                                                        |
| Status         | **APPROVED 2026-09-23**                                                                                                                                                                                                                                                   |
| Recommendation | Authorize today's same-sitting "independent check" as independent `PRACTICE`, not `DELAYED_CHECK`, because it has no elapsed-time separation. It then survives C4 for legacy and skill-graph-only skills, while pilot skills rely on the genuine delayed-check assignment |
| Approved value | As recommended                                                                                                                                                                                                                                                            |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                                                   |
| Blocks         | Stage C4 cutover                                                                                                                                                                                                                                                          |

### D-66 — Authoring exception for held-out review and delayed-check drafts

| Field          | Value                                                                                                                                                                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                                                                                                                                                                                 |
| Status         | **APPROVED 2026-09-23**                                                                                                                                                                                                                                                                                                                 |
| Recommendation | A narrow exception to the `D-61` authoring pause: model-assisted drafts of the pilot's held-out review (`D-50`) and delayed-check (`D-63`) items, written only to the private package outside this repository and marked `pending_review`. Serving still requires the full content, originality, accessibility, and child-safety review |
| Approved value | As recommended                                                                                                                                                                                                                                                                                                                          |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                                                                                                                 |
| Blocks         | — (the `D-61` pause otherwise remains in force)                                                                                                                                                                                                                                                                                         |

### D-67 — Review reuse versus review volume

| Field          | Value                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | policy + content                                                                                                                                                                                                          |
| Status         | **APPROVED 2026-09-24**                                                                                                                                                                                                   |
| Recommendation | Amend `D-50` to **3** review items per skill and publish `grade-6-math-default@1.1.0` with `reviewReuse: { enabled: true, minIntervalsSinceSeen: 2 }`                                                                     |
| Approved value | As recommended. "Not seen within the last two spacing intervals" (`D-46`) is implemented as: an item assigned in either of the skill's two most recent review runs is excluded. A run counts whether or not it was scored |
| Approver       | Product owner (in chat)                                                                                                                                                                                                   |
| Blocks         | Serving more than two reviews per skill                                                                                                                                                                                   |

**Why.** Three sources disagreed:

- `D-46` permits reuse of items not seen within the last two spacing intervals.
- The `grade-6-math-default@1.0.0` profile disables review reuse entirely.
- `D-50` authors only 2 review items per skill.

At 1 item per review (`D-45`), that supported only two reviews per skill. Three items with reuse after two runs let reviews rotate indefinitely without repeating a recent item. `1.0.0` remains for historical resolution.

Delayed-check exhaustion, including by abandoned or expired runs, is decided
in `D-69`.

### D-68 — Placement position rule

| Field          | Value                                                                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | policy                                                                                                                                                                                                                                                                           |
| Status         | **APPROVED 2026-09-24**                                                                                                                                                                                                                                                          |
| Recommendation | Probe one item per unit skill, in lesson order. Place the learner at the first lesson whose probe item is incorrect; earlier lessons become `SKIPPED_BY_PLACEMENT` (weak evidence, never mastery; §9.3). If every item is correct, place the learner at the unit assessment      |
| Approved value | As recommended, **amended 2026-09-24**: if every item is correct the learner is placed at the **final lesson** (`AVAILABLE`) with earlier lessons `SKIPPED_BY_PLACEMENT`. This keeps architecture §6.6 and U37: placement is weak evidence and never unlocks the unit assessment |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                                                          |
| Blocks         | Serving `PLACEMENT` assignments                                                                                                                                                                                                                                                  |

**Implementation (2026-09-24).** One probe item is drawn per unit skill, in
lesson order, using the first authored reviewed practice item for that skill
(`D-64`). A missing or incorrect item counts as missed. Only lessons that have
not started change: an earlier lesson becomes `SKIPPED_BY_PLACEMENT` and the
placed lesson becomes `AVAILABLE`. A probe writes a `LearnerPlacement` record.
Placement never writes mastery or delayed-check status and carries no
reassessment limits. Per §9.3, placement on skills an authored unit claims is
not gated by prerequisites; placement elsewhere stays gated. Probe attempts
are exposure (`D-64`) but are not prior practice, so they never block the
`D-31` evidence-backed skip. For a future unit with more than
`placementProbeMaxItems` (`D-22`) skills, "one item per skill" cannot hold, and
the route fails closed. A decision is needed before such a unit exists.

### D-69 — Exhausted or capped delayed checks

| Field          | Value                   |
| -------------- | ----------------------- |
| Kind           | policy + product        |
| Status         | **APPROVED 2026-09-24** |
| Recommendation | See the rule below      |
| Approved value | As recommended          |
| Approver       | Product owner (in chat) |
| Blocks         | Stage C4 cutover        |

**Rule.** After a lapse or a failed delayed check, the skill's lessons move to
the parent-visible `NEEDS_HELP` remediation state when either of these holds:

- the skill can no longer be served an unseen delayed check (`D-44`), counting
  abandoned and expired runs;
- consecutive delayed-check failures exceed `maxReassessments` (`D-27`).

`NEEDS_HELP` refuses further delayed checks. A missing lesson row is recorded
as `NOT_STARTED` + `NEEDS_HELP`. The check runs on failed delayed checks,
progression and Phase 1 review lapses, and abandoned, expired, and invalidated
runs. A stale run is expired before eligibility is judged, and any
`NEEDS_HELP` refusal writes the record. `NEEDS_HELP` is terminal: lesson and unit outcomes and
later lapses never clear it. Only the `D-70` human override does. Items are
never reused, so every delayed check stays on unseen items.

**Why.** Each lapse cycle consumes two of the six items, so repeated lapses
exhausted the bank and left the skill stranded with no record. That broke
playbook dimensions 7 and 9.

### D-70 — What a human override reopens after `NEEDS_HELP`

| Field          | Value                                                                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | policy + product                                                                                                                                                                                                                                                                                                          |
| Status         | **APPROVED 2026-09-24**                                                                                                                                                                                                                                                                                                   |
| Recommendation | A parent or operator override moves the skill's lessons from `NEEDS_HELP` back to `ACTIVE` remediation and resets the consecutive-failure count                                                                                                                                                                           |
| Approved value | As recommended. The override requires a `D-06` step-up re-authentication within `D-47`'s single-use lifetime and writes an `OverrideRecord`. A new delayed check still requires unseen items, so it is refused with `NEW_BANK_VERSION_REQUIRED` until a reviewed bank version with unseen items exists. No item is reused |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                                                                                                   |
| Blocks         | Reopening any `NEEDS_HELP` skill; Stage C4                                                                                                                                                                                                                                                                                |

**Why it was needed (found by independent re-review, 2026-09-24).** `D-69`
made `NEEDS_HELP` terminal, but the architecture's override (§9.3, `D-06`) sets
`UNLOCKED_BY_OVERRIDE` and has no remediation or mastery effect. Even after an
override, the delayed-check bank has no unseen items (`D-44`) and the
consecutive-failure cap still applies (`D-27`). Reopening therefore needed
decided semantics, for example:

- whether an override resets the consecutive-failure count;
- whether it requires a new delayed-check bank version with unseen items;
- whether it returns the lesson to `ACTIVE` remediation or to `NONE`.

**Implementation status.** `applyNeedsHelpOverride` implements this decision
behind two gated routes:

- `POST /api/progression/step-up` re-verifies the signed-in parent's password
  (`D-06`). It returns an HMAC-signed token bound to that user, household, and
  issue time.
- `POST /api/progression/override` takes the actor from the session. It
  verifies the token for that actor and household, and reads `D-47`'s
  lifetime from the pinned profile.

The service re-checks that the actor is a PARENT in the learner's household.
Operator identities do not exist yet, so operator overrides fail closed.
Single use is atomic through a unique index on `(actorUserId, reauthAt)`
(migration `0014`) with serializable isolation. The parent-facing screen
belongs with C5 and its manual accessibility and wording gates. The step-up
route has no attempt limiting beyond requiring a signed-in session.

**Assumption to confirm.** A new delayed-check bank version is assumed to use
only item identities never used in earlier versions. Exhaustion is judged per
version, but item selection excludes every earlier item. The loader does not
yet enforce this assumption.

Two related gaps are also open:

- Stranding with no prior lapse or failure (first-time runs abandoned until
  the bank is exhausted) is outside `D-69`. It fails closed with
  `ASSESSMENT_BANK_INSUFFICIENT` and leaves no record.
- The lesson and unit reassessment cap (`D-27`) still produces no `NEEDS_HELP`
  record.

### D-71 — Placement retakes

| Field          | Value                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | policy + product                                                                                                                                                                                    |
| Status         | **APPROVED 2026-09-24**                                                                                                                                                                             |
| Recommendation | One placement per unit. Once a `LearnerPlacement` exists for the unit, a new placement is refused with `PLACEMENT_ALREADY_RECORDED`, and a concurrent second probe is scored but never places again |
| Approved value | As recommended                                                                                                                                                                                      |
| Approver       | Product owner (in chat)                                                                                                                                                                             |
| Blocks         | Serving `PLACEMENT` assignments                                                                                                                                                                     |

After placement, the learner advances through lessons and evidence-backed
skips. The probe items are public practice items, so repeat probes would be
progressively weaker evidence.

### D-72 — Password attempt limiting

| Field          | Value                                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | security                                                                                                                                                                                                                                                                                       |
| Status         | **APPROVED 2026-09-28**                                                                                                                                                                                                                                                                        |
| Recommendation | Per parent user: after 5 consecutive wrong passwords, refuse further password checks for 15 minutes (`STEP_UP_LOCKED` / sign-in failure); a correct password resets the count to 0. Apply to both the `D-70` step-up route and the main sign-in credential check, keyed by the same `User` row |
| Approved value | As recommended                                                                                                                                                                                                                                                                                 |
| Approver       | Product owner (in chat)                                                                                                                                                                                                                                                                        |
| Blocks         | Stage C4 (closes the `D-70` re-review's B-1 finding: the step-up route had no attempt limiting)                                                                                                                                                                                                |

**Why it was needed (found by independent re-review, 2026-09-28).** The `D-70`
step-up route re-verifies a password with no rate limiting. Anyone holding a
stolen session cookie could guess the parent's password online, and each
guess costs a bcrypt-12 comparison, making it a CPU cost vector too. Sign-in
itself had the same gap, predating `D-70`.

**Implementation.** `checkPasswordWithLockout`
(`src/auth/password-attempts.ts`) is the single lockout state machine, shared
by `verifyParentCredentials` (sign-in) and `verifyStepUpPassword` (step-up). A
locked account is refused **before** any bcrypt comparison runs, so a locked
account costs the attacker nothing extra and the server no CPU. Reversible
migration `0015` adds `User.failedPasswordAttempts` and
`User.passwordLockedUntil`; existing rows start unlocked. `scripts/reset-parent-password.ts`
also clears the lockout, since an operator resetting the password is a
stronger authority signal than a correct login.

The step-up route (`POST /api/progression/step-up`) maps a locked account to
`STEP_UP_LOCKED` (429). Sign-in (NextAuth credentials) maps both a wrong
password and a locked account to the same generic sign-in failure, so a
locked-out attacker cannot distinguish "wrong password" from "account
temporarily locked" — the existing behavior a login form already has no way to
leak.

### D-73 — Authoring exception for lesson/unit-bank correction of a review-found defect

| Field          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Status         | **APPROVED 2026-10-04**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Recommendation | A narrow exception to the `D-61` authoring pause, parallel to `D-66` but covering the three lesson banks and the unit bank (which `D-66` does not), scoped only to: (1) broadening `acceptedAnswers` in existing items to include mathematically equivalent phrasings the scorer should already treat as correct, (2) retagging the unit bank's `skillRef` so it actually covers all three pilot skills instead of only `ratio-language`, and (3) replacing the two items whose numbers/context duplicate this program's own public practice content for the same lesson, which makes the held-out answer inferable. No new items beyond these three corrections, and no other dimension of the private package may be edited under this exception |
| Approved value | As recommended                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Approver       | Product/content owner (in chat)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Blocks         | — (the `D-61` pause otherwise remains in force; serving still requires the full content, originality, accessibility, and child-safety review per `D-66`'s same condition)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

**Why.** An independent review (requested as Opus; model identity
unverified) of `grade-6-math-assessments-draft-v2.json` — after the
product/content owner had marked all 72 items `review.status: reviewed` —
found that the package would score mathematically correct learner answers
as wrong (45 of 72 items list only one accepted phrasing, while the scorer
does exact-string matching after normalization) and that two items leak
their own answer from this program's public practice content for the same
lesson. `D-66` already exempted the six skill-targeted review/delayed-check
banks from the authoring pause for exactly this kind of content work; those
six banks were already broadened in package v2. The three lesson banks and
the unit bank were not in `D-66`'s scope and still have both defects. This
decision closes that gap narrowly, rather than reading `D-66` as covering
banks it does not name.

**Also decided in the same conversation (not a new `D-nn`, recorded here for
the record):** the independent review separately flagged several unit-bank
items (percent discount/increase, fraction multiplication, complex-fraction
unit rates above `6.RP.A.2`'s non-complex-fraction scope) as testing
material outside the three taught lessons. The product/content owner
decided to keep them as intentional stretch/challenge content in the unit
assessment rather than remove them — mathematically correct, just broader
than the three lessons, and not a defect this exception needs to touch.

### D-74 — Authoring exception for two live-production defects found by the Grade 6 Math v3 integration review

| Field          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kind           | content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Status         | **APPROVED 2026-10-07**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Recommendation | A narrow exception to the `D-61` authoring pause, scoped to exactly two already-live, already-reviewed production content records: (1) `content/expressions-and-equations/one-variable-equations-2.json` — replace its two-step equation (`(1/2)x + 4 = 10`, the `7.EE.B.4a` form) with a genuine single-step `6.EE.B.7` form (`px = q` with a nonnegative rational coefficient), keeping the same skill, standard tag, contest mode, and challenging difficulty; (2) `content/expressions-and-equations/real-world-inequalities-2.json` — correct its `acceptedAnswers` so every variant consistently describes the context-bounded solution set (`p` from 0 to 15, a real count of people), removing the variants that describe an unbounded "shading left forever" ray as equivalent. No other record, skill, or standard mapping may be touched under this exception |
| Approved value | As recommended                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Approver       | Product/content owner (in chat)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Blocks         | — (the `D-61` pause otherwise remains in force)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

**Why.** A final independent review (requested as Opus; model identity
unverified) of the Grade 6 Math v2 candidate, run under the mistaken
premise that v2 had not yet reached production, discovered mid-review that
a v1+v2 merge ("v3") had already shipped 2026-09-18 and includes
content directly derived from v2. Re-scoped to compare against actual
current production, it found two defects in records that are live today:
`one-variable-equations-2` is tagged `6.EE.B.7` (single-step equations per
the CDE standard text) but is actually a two-step equation, the Grade 7
form; `real-world-inequalities-2`'s own three accepted-answer variants
describe two different solution sets as if equivalent, one of them
mathematically broader than the real-world context supports. Both were
independently re-verified by the implementing session before this decision
was recorded, not accepted on the reviewer's word alone. The review's
other five findings (a skill mis-scoped to Grade 7 content, validator
gradability across ~31 experimental records, two distractor defects, and
missing `6.SP.B.4`/MAD coverage) are explicitly out of scope for this
decision — they concern the `experiments/grade-6-math-v2/` candidate, not
live production, and are deferred to a separate, future decision.

### D-148 — Authoring exception for draft held-out assessment content across the extended Grade 6 Math domains

| Field          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Status         | **APPROVED 2026-10-10**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Recommendation | A narrow exception to the `D-61` authoring pause, parallel to `D-66`/`D-73`/`D-74`, authorizing original draft held-out assessment items for the Lesson/Unit records newly wrapped across five Grade 6 Math domains (Ratios extension: `double-number-lines-lesson`, `percent-applications-lesson`; Number System; Expressions and Equations; Geometry; Statistics) — 296 items total across 27 skills, expanded (2026-10-10, same session) from an initial 96 once a real gap against `D-36`'s approved volume (9 items/lesson bank, 18/unit bank) was found and the owner chose to draft to full `D-36` volume. 24 lesson banks now hold 9 items each (216) and 4 of 5 unit banks hold a full 18 (72); the fifth, `ratios-proportional-reasoning-unit-bank`, holds only an 8-item partial supplement covering the 2 extension skills, since its full bank is entangled with a pre-existing external v2 draft (outside this repository, outside this session) covering the original 3 pilot skills — merging and re-pinning to the full volume is a content-owner task, not completed here. Every item is written and retained exclusively outside this repository (the authoring session's private scratchpad, never committed), schema-valid against the production `AssessmentContentItemSchema`, and verified against the real `matchesAcceptedAnswer` grading function (canonical answers match, every distractor correctly rejected). All items remain `pending_review`. No item may be committed to this repository, registered in any catalog or `AssessmentBank`, or served to a learner under this exception |
| Approved value | As recommended                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Approver       | Product/content owner (in chat), retroactively authorizing the prior in-chat instructions "Start drafting the assessment content now" and "Keep drafting the other 4 domains" as this exception, 2026-10-10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Blocks         | — (the `D-61` pause otherwise remains in force; wiring any of these lessons'/units' `assessmentBankRef` into a real `AssessmentBank`, and registering the five new units under the `grade-6-math` program's `unitRefs`, remain separately gated on this exception's own human content-review condition, confirmed placement/digest in the real private package, and `D-61`'s registry gate)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

This grants no committed content, catalog registration, database operation,
C4 cutover, learner activation, deployment, or release. Serving any of these
296 items still requires: (1) human educator/content-owner review of
pedagogical quality — my own verification covered schema validity and
grading-function correctness only, not pedagogical soundness; (2) placement
of the four draft files into the real private assessment package with
confirmed SHA-256 digests; and (3) the same originality, accessibility, and
child-safety review condition `D-66`/`D-73` already require. `D-61` remains
otherwise unchanged.

### D-75 — Reviewed five-program designs and first shared catalog increment

| Field          | Value                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind           | architecture + engineering                                                                                                                  |
| Status         | **APPROVED 2026-10-10**                                                                                                                     |
| Recommendation | Accept the independently reviewed first-unit specifications and begin consolidation plus one shared, behavior-preserving catalog foundation |
| Approved value | Design acceptance and the bounded mechanical increment below only; open per-program candidates remain undecided                             |
| Approver       | Product/engineering owner, in chat: "approved, go ahead" after all five independent reviews completed                                       |
| Blocks         | Integration of the reviewed specifications and the first shared catalog implementation                                                      |

Approved specification pins:

| Program      | Specification SHA-256                                              |
| ------------ | ------------------------------------------------------------------ |
| AMC 8        | `c02a4f60f9f069e963c1a9bc8305bf286eaaf0d72e60535c8f63a911444050bb` |
| MOEMS        | `9856d2c50ce6d553d9f7649cbf20fdaa212e13470d259482b19a80f2f8bfca9e` |
| Kangaroo     | `1d6e87078751c0a23535ba8a08d0f064a76969df48c7a47ff3f0a93cf0322bf4` |
| MATHCOUNTS   | `1c3e914998bdee1f33c2dd273bd22f7e515a7436c23446612083379b3e6a2d16` |
| Spelling Bee | `64e4e9efd9a17632b892ac78dadfd86675e563aafb6a524c8c41fee657439174` |

The first increment consolidates existing active units, lessons and bank
metadata behind shared catalog access, preserving Grade 6 records, current
registry references, policy, authorization, scoring, completion and private
package readiness. Synthetic fixtures demonstrate a second program without
registering any real course. Existing pilot exports remain compatible.

This is not approval of any candidate volume, threshold, retry window,
completion choice or profile adoption. Candidate dispositions must be
consolidated into this decision document and remain open. It grants no
curriculum-data edit, content correction/drafting, private-bank access,
schema/migration, database operation, C4 cutover, learner activation,
deployment or release. D-61 remains unchanged. Sonnet 5.5 implements the
bounded increment; independent GPT review and coordinator validation precede
integration. Minor coverage notes from accepted reviews must be carried into
their relevant future acceptance packets.

## I. Consolidated five-program extension candidates

`D-76` through `D-138` are the sole operative entries for the candidate
choices in the five specifications accepted under D-75. Their original IDs
are retained below for traceability; the proposal tables are non-normative
source material, not a second decision authority. Imported specification
bytes and their historical proposed-status wording remain unchanged to
preserve the independently reviewed hashes. D-75 records their design
acceptance; it does not select these candidate values.

**Every entry below is OPEN. Approved value: none. Approver: not yet signed.**
Recommendations are not defaults. Named owner roles identify who must decide,
not who already approved. Existing D-01 through D-74 are not reopened by
reference here. Inherited invariants such as D-31 skip, D-59 assistance and
permanent authorization cannot be waived by a local candidate choice.

Blocks identify the source specification's future stage. They do not undo
the completed D-75 catalog-only increment. In particular, MOEMS MC-01 also
includes bank resolution/manifests not implemented by D-75, and Kangaroo
rollout/access choices apply to new real activation/enforcement, not the
synthetic fixture already integrated. No content correction, teaching
drafting, private-bank drafting or actual program activation is authorized
by this table.

Source abbreviations refer to files in `docs/curriculum-dossiers/`:
AMC = `amc-8-course-pilot-20261010.md`;
MOEMS = `moems-6-course-pilot-20261010.md`;
Kangaroo = `math-kangaroo-6-course-pilot-20261010.md`;
MATHCOUNTS = `mathcounts-6-course-pilot-20261010.md`;
Spelling = `spelling-bee-6-course-pilot-20261010.md`.
Line citations below refer to the exact approved specification pins in D-75.

### AMC 8

| ID / source candidate | Recommendation or choice (not approved)                                                                                                | Status | Required approver                    | Blocks         | Source  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------ | -------------- | ------- |
| D-76 / O1             | Two lessons, one per target skill, in proposed teaching order                                                                          | OPEN   | Product/pedagogy owner               | S3             | AMC:643 |
| D-77 / O2             | Keep contest items out of lesson practice refs                                                                                         | OPEN   | Product/pedagogy owner               | S3             | AMC:644 |
| D-78 / O3             | Retain `amc-8-default@1.0.0` or approve a new profile; bank minimum arithmetic depends on approved inputs, review volume unresolved    | OPEN   | Product/pedagogy owner               | S3             | AMC:645 |
| D-79 / O4             | Resolve executable ordinary completion and practice sufficiency; no lower threshold proposed; preserve D-31 skip                       | OPEN   | Product/pedagogy owner               | S3             | AMC:646 |
| D-80 / O5             | Decide registration consequences for assignment-free review/placement; do not register incomplete structure                            | OPEN   | Product owner                        | S4             | AMC:647 |
| D-81 / O6             | Decide whether legacy independent-check state satisfies the unit-claimed requirement; do not reinterpret current evidence by default   | OPEN   | Product/pedagogy owner               | S4             | AMC:648 |
| D-82 / O7             | Scoped D-61 teaching/practice exception; no packet requested or authorized yet                                                         | OPEN   | Product/content + engineering owners | S5             | AMC:649 |
| D-83 / O8             | Separate versioned contest eligibility wording correction packet                                                                       | OPEN   | Product/content owner                | Content stages | AMC:650 |
| D-84 / O9             | Choose read-only closure at activation or denial followed by read-only closure on next action; neither grants below-readiness evidence | OPEN   | Product + engineering owners         | S4             | AMC:651 |
| D-85 / O10            | Private-bank package access/drafting under D-02; not authorized                                                                        | OPEN   | Product/content owner under D-02     | S3             | AMC:652 |

### MOEMS

The source MC table does not assign approver roles. Roles below are coordinator
routing by decision kind, not approvals or changes to the proposed choices.

| ID / source candidate | Recommendation or choice (not approved)                                                                                                                  | Status | Required approver                     | Blocks                                         | Source    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------- | ---------------------------------------------- | --------- |
| D-86 / MC-01          | Shared multi-program catalog, generic bank resolution and per-program manifest; D-75 completes only catalog foundation                                   | OPEN   | Engineering owner                     | Packet 1 remaining bank/manifest scope         | MOEMS:507 |
| D-87 / MC-02          | Two one-skill lessons and proposed unit/lesson codes                                                                                                     | OPEN   | Product/content owner                 | Packet 5                                       | MOEMS:508 |
| D-88 / MC-03          | New hybrid registry version only at complete atomic registration                                                                                         | OPEN   | Product + engineering owners          | Packet 7                                       | MOEMS:509 |
| D-89 / MC-04          | Claimed-skill access and unclaimed-skill compatibility policies as one reviewed versioned set                                                            | OPEN   | Product + engineering owners          | Packets 5, 7                                   | MOEMS:510 |
| D-90 / MC-05          | Retain or version MOEMS profile for unit use; explicitly decide values and review reuse                                                                  | OPEN   | Product/pedagogy owner                | Packets 6, 7                                   | MOEMS:511 |
| D-91 / MC-06          | Decide threshold applicability and distinct eligible practice sufficiency                                                                                | OPEN   | Product/pedagogy owner                | Packet 4                                       | MOEMS:512 |
| D-92 / MC-07          | Decide teaching volume per lesson                                                                                                                        | OPEN   | Product/content owner                 | Packet 6                                       | MOEMS:513 |
| D-93 / MC-08          | PASS-only ordinary completion or proposed teaching/threshold rule; latter changes Grade 6; preserve skip/history either way                              | OPEN   | Product/pedagogy + engineering owners | Packet 7 always; packet 4 if consumer required | MOEMS:514 |
| D-94 / MC-09          | Initial skill-version adoption/sequencing before MOEMS unit evidence; D-57 requirement already approved                                                  | OPEN   | Product/content + engineering owners  | Packet 2                                       | MOEMS:515 |
| D-95 / MC-10          | Do not require explanation evidence without a structured validator; any later requirement is separately decided                                          | OPEN   | Product/pedagogy owner                | Later explanation-evidence adoption only       | MOEMS:516 |
| D-96 / MC-11          | Disposition of unstated Division M concepts in optional Division E contest items; core approval remains intact                                           | OPEN   | Product/content owner                 | Packet 6 if affected contest content included  | MOEMS:517 |
| D-97 / MC-12          | Decide contest-tier inclusion in core lessons versus optional strand                                                                                     | OPEN   | Product/pedagogy owner                | Packet 5                                       | MOEMS:518 |
| D-98 / MC-13          | Scoped held-out drafting exception and access, analogous in form but not authority to D-66                                                               | OPEN   | Product/content + engineering owners  | Packet 6                                       | MOEMS:519 |
| D-99 / MC-14          | Packet-bounded MOEMS D-61 authoring exception; not requested yet                                                                                         | OPEN   | Product/content + engineering owners  | Packet 6                                       | MOEMS:520 |
| D-100 / MC-15         | Explicit TEACHING grants respecting shared authorization and prerequisites                                                                               | OPEN   | Product + engineering owners          | Packets 3, 5                                   | MOEMS:521 |
| D-101 / MC-16         | Separate disposition of impossible existing cryptarithm; unit/placement exclusion already specified, global record unchanged                             | OPEN   | Product/content owner                 | Correction/reuse of affected item only         | MOEMS:522 |
| D-102 / MC-17         | Bound teaching operation keys and approved retry-window reference; expired replay refuses content, fresh delivery records exposure; no duration selected | OPEN   | Product/pedagogy + engineering owners | Packet 3                                       | MOEMS:523 |
| D-103 / MC-18         | Immutable raw-byte artifact/digest retention only if historical verification claims require it                                                           | OPEN   | Engineering + privacy owners          | Dependent historical raw-digest claims         | MOEMS:524 |

### Math Kangaroo

| ID / source candidate | Recommendation or choice (not approved)                                                                                    | Status | Required approver     | Blocks                        | Source       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------- | ----------------------------- | ------------ |
| D-104 / K-01          | Two lessons, one per target skill                                                                                          | OPEN   | Product/content owner | C0, S2 onward                 | Kangaroo:489 |
| D-105 / K-02          | Decide teaching/practice/review volumes and assessment/reassessment inputs; existing Grade 6 figures are reference only    | OPEN   | Product/content owner | S2 onward, S3                 | Kangaroo:490 |
| D-106 / K-03          | Retain or version Kangaroo profile after explicit feasibility/value decisions                                              | OPEN   | Product owner         | S3, S4                        | Kangaroo:491 |
| D-107 / K-04          | Review/delayed reuse remains unadopted until explicitly decided                                                            | OPEN   | Product owner         | S3                            | Kangaroo:492 |
| D-108 / K-05          | Hybrid rollout for one real unit, not activation of synthetic fixtures                                                     | OPEN   | Product owner         | Real rollout stages           | Kangaroo:493 |
| D-109 / K-06          | Explicit proposed access/compatibility grants                                                                              | OPEN   | Product owner         | New access/enforcement stages | Kangaroo:494 |
| D-110 / K-07          | Retain current prerequisite edge pending content judgement; change requires conditional C0-R versioned repinning           | OPEN   | Content owner         | C0, S3                        | Kangaroo:495 |
| D-111 / K-08          | Shared choice presentation and live rollout separately reviewed; preserve server accepted-answer variants                  | OPEN   | Product owner         | S1b, S4                       | Kangaroo:496 |
| D-112 / K-09          | Use truthful multiple-choice label without unsupported exact-count claim                                                   | OPEN   | Content owner         | S2                            | Kangaroo:497 |
| D-113 / K-10          | Separate dated Kangaroo D-61 exception per exact packet; none granted                                                      | OPEN   | Product/content owner | C0, S2, S3                    | Kangaroo:498 |
| D-114 / K-11          | Shared typed lesson/item eligibility, core-safe placement and owner-decided readiness; no new threshold selected           | OPEN   | Product owner         | S1b, S4                       | Kangaroo:499 |
| D-115 / K-12          | Recurring-bank exhaustion and post-placement freshness: decide block, NEEDS_HELP or explicitly approved reuse              | OPEN   | Product owner         | S3, S4                        | Kangaroo:500 |
| D-116 / K-13          | Engineering sign-off for the remaining proposed shared stage's inactive-boundary assertions; D-75 subset already validated | OPEN   | Engineering owner     | Remaining S1b scope           | Kangaroo:501 |

### MATHCOUNTS

| ID / source candidate | Recommendation or choice (not approved)                                                                                                                       | Status | Required approver                     | Blocks      | Source         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------- | ----------- | -------------- |
| D-117 / H1            | Two one-skill lessons, number theory first; ratios lesson-count approval does not transfer                                                                    | OPEN   | Product/pedagogy owner                | S3, S6      | MATHCOUNTS:836 |
| D-118 / H2            | Decide sequential lesson gating as teaching order, not a new skill prerequisite                                                                               | OPEN   | Product/pedagogy owner                | S6          | MATHCOUNTS:837 |
| D-119 / H3            | Separate practice-expansion packet and explicit teaching/review/bank volumes; stronger per-skill quotas remain optional proposals                             | OPEN   | Product/pedagogy owner                | S4, S4a, S5 | MATHCOUNTS:838 |
| D-120 / H4            | Decide whether contest-mode practice counts toward eligible ordinary completion                                                                               | OPEN   | Product/pedagogy owner                | S4a, S6     | MATHCOUNTS:839 |
| D-121 / H5            | Proposed new MATHCOUNTS profile adopting review reuse with unchanged practice threshold; never edit existing profile in place                                 | OPEN   | Product/pedagogy owner                | S3, S5      | MATHCOUNTS:840 |
| D-122 / H6            | Proposed unit/lesson/bank identity codes                                                                                                                      | OPEN   | Product/content owner                 | S3, S5      | MATHCOUNTS:841 |
| D-123 / H7            | Proposed teaching record per lesson; no automatic transfer of ratios precedent                                                                                | OPEN   | Product/content owner                 | S4          | MATHCOUNTS:842 |
| D-124 / H8            | Sign off real suggestion/position changes at atomic registration                                                                                              | OPEN   | Product owner                         | S6          | MATHCOUNTS:843 |
| D-125 / H9            | Scoped teaching/practice/private-bank authoring and named private access; not granted                                                                         | OPEN   | Product/content + engineering owners  | S4, S4a, S5 | MATHCOUNTS:844 |
| D-126 / H10           | Shared ordinary practice-threshold enforcement cutover after shadow review, including ratios; or explicitly defer enforcement without false completion claims | OPEN   | Product/pedagogy + engineering owners | S2c, S6     | MATHCOUNTS:845 |

### Spelling Bee

| ID / source candidate | Recommendation or choice (not approved)                                                                              | Status | Required approver                    | Blocks                | Source       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------ | --------------------- | ------------ |
| D-127 / CD-SNSB-01    | No new morphology/orthography prerequisite edge; teaching order only                                                 | OPEN   | Product/content + pedagogy owners    | S2                    | Spelling:478 |
| D-128 / CD-SNSB-02    | Two one-skill lessons; math lesson-count decision is not spelling approval                                           | OPEN   | Product/content owner                | S2                    | Spelling:479 |
| D-129 / CD-SNSB-03    | Decide spelling practice/assessment/review volumes; none proposed as settled                                         | OPEN   | Product/content + pedagogy owners    | S3                    | Spelling:480 |
| D-130 / CD-SNSB-04    | Proposed lesson banks first versus additional unit bank                                                              | OPEN   | Product/content owner                | S2                    | Spelling:481 |
| D-131 / CD-SNSB-05    | Retain or version spelling profile only through explicit candidate dispositions; inherited decisions remain intact   | OPEN   | Product/content owner                | S3                    | Spelling:482 |
| D-132 / CD-SNSB-06    | Review reuse decision after bank-sizing inputs                                                                       | OPEN   | Product/content owner                | S3                    | Spelling:483 |
| D-133 / CD-SNSB-07    | Derive delayed-bank minimum from approved per-attempt/reassessment inputs, not a new local default                   | OPEN   | Product/content owner                | S3                    | Spelling:484 |
| D-134 / CD-SNSB-08    | Separately reviewed shared UI spellcheck/autocorrect behavior and accessibility scope                                | OPEN   | Engineering + accessibility owners   | S4                    | Spelling:485 |
| D-135 / CD-SNSB-09    | Required versioned corrections F-01/F-02/F-04 and optional others; exact content exception under D-61 still required | OPEN   | Product/content + engineering owners | S3                    | Spelling:486 |
| D-136 / CD-SNSB-10    | Apply inherited placement contract without a spelling-specific rule; confirm adoption, not reopen D-64               | OPEN   | Product/content owner                | S4                    | Spelling:487 |
| D-137 / CD-SNSB-11    | Proposed teaching/practice/assessment completion switches and unit rule; preserve D-31 exception and D-59 policy     | OPEN   | Product/content + pedagogy owners    | S1e schema, S2 values | Spelling:488 |
| D-138 / CD-SNSB-12    | Truthful teaching-completed event from explicit learner action after body delivery, not load/timer alone             | OPEN   | Pedagogy + engineering owners        | S1d                   | Spelling:489 |

The shared next contract work must be issue-sized and cannot choose open
inputs. Separate role-safe teaching delivery/exposure, completion/skip
evaluation, bank-kind/history/manifest resolution and choice transport from
real curriculum-data packets and activation. Serialize shared edits; parallel
content work becomes eligible only after each exact packet and its contracts
are authorized. Manual/privacy/content gates remain separate from automated
test evidence.

## J. Shared teaching-delivery contract choices

The proposed contract is `docs/teaching-delivery-exposure-contract.md`.
The owner's "go ahead" on 2026-10-10 authorizes specification and independent
review only, not any values, schema, migration, writer, content or release.
The owner subsequently said "go ahead with the recommendations" on
2026-10-10 in response to the two-decision T1 request. This accepts the
reviewed contract hash
`c18411c4648cd50f40782e18555c4dfbe1977b7f7bfa4c15c50be73b47a161ff`
and approves **D-139 and D-142 only**, with their recommended values.
Approval authorizes T1 disconnected schemas and computed-byte synthetic
fixtures, not a database schema/migration, writer, route, grant, real content,
provider call, registration or release. The contract's original proposed
metadata is retained to preserve reviewed bytes; this record is authority.

### Approved T1 shape dispositions

| ID    | Status              | Approved value                                                                                                               | Approver                           | Scope                                                                  |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| D-139 | APPROVED 2026-10-10 | Parent-authenticated learner surface; authenticated parent actor recorded truthfully, no verified learner identity claim     | Product/privacy owner, in chat     | T1 parent-actor schema shape; serving still requires all later gates   |
| D-142 | APPROVED 2026-10-10 | Separate immutable delivery context with explicit event FK and context/kind uniqueness; exact delivery identity/version pins | Engineering/privacy owner, in chat | T1 disconnected shape only; T2 migration/privacy review still required |

The rows below contain the remaining recommendations/alternatives.
**D-140, D-141, D-143 and D-144 remain OPEN, approved value: none.**

| ID    | Choice and recommendation (not approved)                                                                                                                                                                                                            | Alternatives                                                                                                                                                                                                                                                                 | Status | Required approver                       | Blocks                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------- | ----------------------------------------------------------- |
| D-140 | Assessment interlock: conservatively refuse teaching delivery, replay, acknowledgement and help while any learner assignment/lease is nonterminal or unsettled, across kinds/versions; expired-but-unsettled runs refuse and are settled separately | Narrow refusal to known overlapping skill coverage only after exact historical target/bank resolution is proven; or permit help with separately approved, audited invalidation/remediation that prevents an independent result. Serializable aborts alone are not admissible | OPEN   | Pedagogy + engineering owners           | T4a interlock contract; T4b serving                         |
| D-141 | Scope: adopt shared teaching mechanics across the five D-75 programs through explicit shared-scope approval of D-100/D-102/D-138, while retaining separate per-program grant/profile/content adoption                                               | Keep mechanics scoped per program with separately recorded adoption; D-100/D-102/D-138 cannot transfer automatically                                                                                                                                                         | OPEN   | Product + pedagogy + engineering owners | Shared T4b and later acknowledgement; not catalog-only D-75 |
| D-143 | Export operation identity: include delivery/context attribution and policy pins in household export, omit raw operation key to minimize unnecessary identifiers                                                                                     | Include the key as well after privacy review; neither option exports teaching bodies or held-out banks                                                                                                                                                                       | OPEN   | Privacy owner                           | T3 export contract before writer                            |
| D-144 | Refusal/error audit: no new learner-scoped persisted refusal rows; use repository-standard structured reason-code logs without content/free text and retain successful exposure/context audit                                                       | Persist refusals with separately approved fields, retention, export and deletion coverage; no silent error handling under either option                                                                                                                                      | OPEN   | Privacy + engineering owners            | T3 audit contract before writer                             |

**Consumed existing OPEN entries:** D-100 (explicit grants), D-102 (retry
policy) and D-138 (acknowledgement) remain unchanged and unapproved.
For shared adoption, the D-102 recommendation is a versioned positive
retry-window reference strictly shorter than the applicable D-21 delay:
exact expiry refuses, replay never extends the window, incompatible or absent
policy denies. Its numeric duration is still undecided; do not add a second
duration decision or transfer assessment D-54's no-window semantics.
The proposed replay contract conservatively anchors delayed eligibility to
the delivery context's fixed replay-expiry horizon plus the approved D-21
minimum, not delivery time alone. Actual events keep actual timestamps;
the horizon is a separate scheduling input, never fabricated evidence.
This may delay checks even without a replay and requires explicit D-102
approval. Missing historical horizon policy denies eligibility.
D-138 acknowledgement is an explicit authenticated action referencing an
actual delivery, not a viewing/comprehension/lesson-completion claim.
Approving D-141 alone does not approve those consumed decisions.

D-103 is needed only for a new historical raw-byte verification claim.
This packet proposes parsed-JSON canonical verification instead, with an
explicit distinction from authored raw-byte digests. D-58 public teaching
projection is unchanged; outside exposure is unobservable.

### T2 persistence/privacy choices discovered during proposal review

Owner's 2026-10-10 "proceed" authorized the writer-free T2 proposal and
independent review only. After that review the owner explicitly selected
the retained actor FK, raw opaque token and household-erasure retention
branches in the approval form and accepted the proposal. **D-145–D-147 are
APPROVED 2026-10-10**, with the values in the table below.
Approval also authorizes one isolated T2a schema/privacy-coverage/migration
draft and disposable local scratch validation, with independent and
human migration review before integration; no production access, writer,
serving, content, deployment, commit or push.
The selected UUIDv4 format is a **proposal for the next reviewed delivery
boundary update**, not a change to T1 or a runtime validation approval.

| ID    | Choice and recommendation (not approved)                                                                                                                                                                                                      | Alternatives                                                                                         | Status              | Required approver                                           | Blocks                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| D-145 | Historical parent attribution: retain same-household parent identity pins and fail closed on individual parent deletion, role change or household reassignment while contexts reference that actor; household erasure deletes scoped evidence | A different attribution model requires a new reviewed owner decision                                 | APPROVED 2026-10-10 | Product/privacy + engineering owner, explicit approval form | T2a actor relation; implementation/migration review still required             |
| D-146 | Retain raw opaque operation token consistent with T1 string identity; never log the key; propose canonical lowercase UUIDv4 validation for the next reviewed boundary update; D-143 remains separate export choice                            | Digest storage requires a new independently reviewed binding/persistence contract and owner decision | APPROVED 2026-10-10 | Privacy + engineering owner, explicit approval form         | T2a raw-key representation only; future validation remains reviewed separately |
| D-147 | Household-scoped personal activity/provenance audit retained until household erasure; document existing backup limitations; no new duration                                                                                                   | Another retention lifecycle requires separate privacy review and owner decision                      | APPROVED 2026-10-10 | Privacy owner, explicit approval form                       | T2a privacy-inventory/erasure contract; actual deletion tests still required   |

## K. Grade 6 reconciliation direction

The owner accepted reviewed reconciliation revision 3, SHA-256
`c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec`,
for documentation application. On 2026-10-12 the owner then replied
**"approved"** to the separate two-choice MATH6-DECIDE request below.
These are direction/first-unit decisions, not authoring or implementation
authorization. The frozen reconciliation's proposed wording remains unchanged.

| ID / source | Status              | Approved value                                                                                                                                       | Approver                       | Scope                                                                                                                    |
| ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| D-149 / O-1 | APPROVED 2026-10-12 | Retain the existing 27-code production skill structure with versioned refinements; require an approved evidence rule before combining skill versions | Product/content owner, in chat | Target direction; no wholesale candidate adoption, exact crosswalk approval, evidence migration or numeric evidence rule |
| D-150 / O-2 | APPROVED 2026-10-12 | Ratios plus extension, five skills: `ratio-language`, `unit-rates`, `ratio-tables`, `double-number-lines`, `percent-applications`                    | Product/content owner, in chat | First-unit selection; no content drafting, private access, catalog/version edit, activation or release                   |

O-3–O-18 remain undecided by this request. D-61 and private/content/manual
gates remain in force. In particular, unit/lesson/item versions, conversions
placement, double-number-line representation, scoring remediation, extension
volumes, teaching scope and private-bank merge require their bounded decisions
and reviewed packets. Historical learner evidence must remain resolvable;
this approval does not authorize querying or changing it.

### Ratios immediate choice IC-2 — measurement-conversions home

On 2026-10-12 the owner replied **"approve"** to the separate IC-2 request:
measurement conversions under `unit-rates@1.0.0`, supported by the accepted
RAT-SUBJECT report and corrected Ratios plan. This selects placement only.

| ID / source         | Status              | Approved value                                                                                                             | Approver / evidence                                                                 | Boundary                                                                                                                                                                                                                                                                        |
| ------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-151 / IC-2 / O-3a | APPROVED 2026-10-12 | Home measurement-unit conversion tasks under `unit-rates@1.0.0`, using a stated conversion factor and explicit output unit | Product/content owner, in chat; accepted RAT-SUBJECT report and corrected plan §3.1 | No item authoring, reuse, scoring, catalog registration or activation approved; content review must verify existing skill evidence/misconception coverage. If a changed evidence statement requires a new skill version, return for owner reconsideration and D-149/D-57 gates. |

### Ratios immediate choice IC-3 — representation and older evidence

On 2026-10-12 the owner replied **"approve"** to the explicit IC-3 request:
keep `double-number-lines@1.0.0`, add figure-based items with complete text
alternatives, and accept the stated older-evidence limitation (plan §3.2,
option A). No learner data was queried; existence of older evidence is unknown.

| ID / source         | Status              | Approved value                                                                                                                                                                                                                                                                                                                                                                                | Approver / evidence                                                             | Boundary                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-152 / IC-3 / O-3b | APPROVED 2026-10-12 | Keep `double-number-lines@1.0.0`; add actual paired-number-line representation tasks with reviewed static figures and complete text alternatives listing aligned pairs and blank positions. Explicitly accept that any older arithmetic-only item evidence continues counting toward the same skill alongside later representation evidence, without discounting, remapping or separating it. | Product/content owner, in chat; corrected plan §3.2 and accepted subject review | New lesson placement sources and threshold-counted items are representation tasks per plan; TR-6 awaits the separate scoring implementation. No new skill version or cross-version evidence rule selected. No content drafting, learner-history query/mutation, lesson/catalog change, activation or release authorized. |

### Ratios immediate choice IC-4 — new lesson versions

On 2026-10-12 the owner replied **"approve"** to the separate IC-4 request:
new Ratios lesson versions with corrected references, preserving existing
pilot `1.0.0` bytes. This selects the versioning approach only (plan §3.3).

| ID / source        | Status              | Approved value                                                                                                                                                                                                                  | Approver / evidence                                 | Boundary                                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-153 / IC-4 / O-8 | APPROVED 2026-10-12 | Use new Ratios lesson versions with corrected content-version references; preserve pilot lesson `1.0.0` bytes and document existing mislabeled references. Each new reference version must equal the referenced record version. | Product/content owner, in chat; corrected plan §3.3 | No in-place pilot rewrite, content edits, catalog registration or activation authorized. Exact new labels and extension replacement labels remain engineering choices in the separately approved catalog-design packet, constrained by bank target references. Preserve historical resolvability. |

### Ratios immediate choice IC-5 — opt-in structured scoring design

On 2026-10-12 the owner replied **"approve"** to option C and the named
document-only RAT-SCORE-DESIGN scope: Opus-authored contract followed by
Codex independent review. Implementation requires later approval.

| ID / source        | Status              | Approved value                                                                                                                                                                                                                                                                                       | Approver / evidence                                      | Boundary                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-154 / IC-5 / O-9 | APPROVED 2026-10-12 | Select opt-in structured multi-field responses, deterministic validation per labeled field and new item versions; authorize RAT-SCORE-DESIGN for response/validator contract, accessible learner input, practice and assessment grading, structured attempt storage and unknown-mode refusal design. | Product/content owner, in chat; corrected plan §3.4/§5.1 | One contract document, Claude Code forge-expert / Opus then Codex cross-family review. No implementation, content changes, historical rescoring, legacy parts semantics changes or other-domain migration. Separate full V-7 acceptance for new mode from legacy characterization; schema changes need later migration/privacy approval. |

### Structured scoring OD-1 — existing-column storage

On 2026-10-12 the owner replied **"approved"** to S-A: structured response
JSON envelopes in existing attempt columns without a schema migration,
per accepted contract §4.1. Implementation remains separately gated.

| ID / source  | Status              | Approved value                                                                                                                                                                                                                                                  | Approver / evidence                                              | Boundary                                                                                                                                                                                                                                                                                                                 |
| ------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-155 / OD-1 | APPROVED 2026-10-12 | Choose S-A JSON envelope storage in existing `Attempt.learnerResponse` and `Attempt.normalizedResponse` columns, with mode/version attribution and normalized numeric/option values as specified in accepted contract §4.1. No new columns or schema migration. | Product/engineering owner, in chat; accepted contract revision 5 | Only scored, non-refused structured responses are stored. No existing-row backfill/rewrite or historical rescoring; no provider disclosure. Implementation must verify envelope limits, historical resolution, export/erasure coverage under later authorized scope. No code, database operations or release authorized. |

### Structured scoring OD-2 — malformed-input refusal

On 2026-10-12 the owner replied **"approve"** to refusing well-typed but
malformed field input with answer-independent format feedback and no recorded
attempt, rather than marking it incorrect (accepted contract §3.3/§3.3a).

| ID / source  | Status              | Approved value                                                                                                                                                                        | Approver / evidence                                                   | Boundary                                                                                                                                                                                                                                                                                                                                                   |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-156 / OD-2 | APPROVED 2026-10-12 | Refuse well-typed but malformed structured field input with format-only, answer-independent feedback and no recorded attempt; do not score it incorrect or generate mastery evidence. | Product/pedagogy owner, in chat; accepted scoring contract revision 5 | Preserve authorization/lifecycle/current-item/duplicate error precedence, existing expiry handling and transactional rechecks. Eligible format refusals make no submission writes or ordinal advance; valid well-formed wrong values remain grading inputs. No implementation, legacy semantics change, rescoring, database operation or release approved. |

### Structured scoring OD-3 — no partial credit in v1

On 2026-10-12 the owner replied **"approve"** to no partial credit in v1:
every field must be correct for a correct outcome (accepted contract §2.6).

| ID / source  | Status              | Approved value                                                                                                                                                                                                      | Approver / evidence                                                | Boundary                                                                                                                                                                                                                                           |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-157 / OD-3 | APPROVED 2026-10-12 | No partial credit for structured mode v1. All required fields must be correct for `CORRECT`; well-formed responses with any wrong field are `INCORRECT`. Malformed fields follow D-156 refusal rather than grading. | Product/pedagogy owner, in chat; accepted contract revision 5 §2.6 | No new PARTIAL weight, per-field mastery evidence, historical rescoring or legacy grading change. Existing approved outcome weights remain unchanged. Per-field correctness feedback remains separate OD-4; implementation and release unapproved. |

### Structured scoring OD-4 — item-level practice feedback

On 2026-10-12 the owner replied **"approve"** to item-level correctness
feedback only in v1 practice, without per-field correctness feedback.
Assessment feedback remains unchanged (accepted contract §3.4/§3.6).

| ID / source  | Status              | Approved value                                                                                                                                                        | Approver / evidence                                                   | Boundary                                                                                                                                                                                                                                                                     |
| ------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-158 / OD-4 | APPROVED 2026-10-12 | Structured v1 practice gives item-level correctness feedback only; no per-field correctness feedback. Assessment retains its existing item-level feedback projection. | Product/pedagogy owner, in chat; accepted scoring contract revision 5 | D-156 permits answer-independent field-format errors, not per-field correctness disclosure. Existing tutoring/answer-release policy continues to govern help and answer exposure. No implementation, new evidence weights, assessment feedback change or release authorized. |

### Structured scoring OD-5 — mode-1 numeral grammar

On 2026-10-12 the owner replied **"approve"** to the pending explicit OD-5
numeral grammar request. This approval selects accepted contract §2.5;
it does not change client permission settings or delegate other choices.

| ID / source  | Status              | Approved value                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Approver / evidence                                                        | Boundary                                                                                                                                                                                                                 |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-159 / OD-5 | APPROVED 2026-10-12 | Mode-1 numeral grammar per accepted contract §2.5: nonnegative ASCII integer/decimal/fraction/mixed-number forms, a digit before decimal point, trailing decimal zeros and fraction spacing allowed; no signs, unit text, currency/percent symbols, thousands separators or Unicode numeral forms. Maximum 32 characters before trimming; digit runs up to nine digits, decimal fractional part up to six digits; nonzero fraction denominator and proper mixed fraction. | Product/pedagogy owner, in chat; accepted scoring contract revision 5 §2.5 | Only representations enumerated for each field accepted. Preserve classification order, D-156 format refusal and D-157 correctness/simplest-form rules. No legacy matcher changes, code or implementation authorization. |

### Structured scoring OD-6–OD-9 — approved batch

On 2026-10-12 the owner replied **"approve"** to the four recommendations
presented together. This selects the remaining listed design choices;
implementation authorization and independent review still follow.

| ID / source  | Status              | Approved value                                                                                                                | Boundary                                                                                                                        |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| D-160 / OD-6 | APPROVED 2026-10-12 | v1 field kinds: number and single choice only                                                                                 | No free-text, multi-select, unordered-set or tolerance mode. Existing numeral/representation and validation requirements apply. |
| D-161 / OD-7 | APPROVED 2026-10-12 | Split implementation per accepted contract §8: legacy characterization, core scoring, submission/storage paths and learner UI | S-A selected, so no S-B schema packet. Each named execution scope and its review/integration gates still require authorization. |
| D-162 / OD-8 | APPROVED 2026-10-12 | Add `accessibleAlternative` to practice projection for structured items; existing items handled under separate UI scope       | Does not authorize presentation changes for every legacy item or any code changes now.                                          |
| D-163 / OD-9 | APPROVED 2026-10-12 | Defer held-out structured items until a separate assessment learner UI is scoped                                              | No private access, held-out content authoring/registration/serving or assessment UI execution approved.                         |

Approver for D-160–D-163: product/pedagogy/engineering owner, in chat;
evidence: accepted scoring contract revision 5 §8/§9.3 and explicit batch
request. OD-1–OD-9 choices now selected; contract recommendations outside
these explicit decisions and execution/release scopes remain separately gated.

### Ratios IC-6–IC-8 — approved values and document-only design scope

On 2026-10-14 the owner replied **"approve"** to the completed PRACTICE-FIRST
packet's ready batch. IC-6–IC-8 recommendations are approved separately below.
IC-9 remains pending: the response did not choose A, B or C. It does not block
the authorized document-only catalog design.

| ID / source            | Status              | Approved value                                                                                                                                                                                                                             | Boundary                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-164 / IC-6 / O-11    | APPROVED 2026-10-14 | Extension targets: one teaching record per lesson, six practice items per lesson, nine lesson-bank items per lesson, three review items per skill and six delayed-check items per skill. Unit-bank count deferred.                         | Values only; existing pilot six-practice target unchanged. No content authoring, private access, bank merge, registration or serving authorization; named D-61 exceptions remain required. Optional second DNL teaching representation not selected.                                                         |
| D-165 / IC-7 / O-12    | APPROVED 2026-10-14 | Option B: separate teaching authoring/review from serving. Teaching remains a content requirement for all five Ratios lessons.                                                                                                             | Approved storage path and scoped authoring/D-61 authorization required before records are authored/reviewed. Grade 6 teaching adoption and relevant T3/T4 serving decisions remain separate. Release claims must state teaching is not served until authorized. No teaching generation/serving approved now. |
| D-166 / IC-8 remainder | APPROVED 2026-10-14 | Execute document-only RAT-CATALOG-DESIGN: one new docs/grade-6-math-catalog-versioning.md, Claude Code forge-expert/Opus authoring, then independent Codex review and human artifact acceptance/application. RAT-SUBJECT already complete. | Public code/schema and existing approved metadata only. Present C-7 options without selecting. No code/content/private-package access, database/provider work, catalog implementation or release. D-61 exception: none.                                                                                      |

Approver: product/pedagogy/engineering owner, in chat; evidence: explicit
IC-6–IC-8 recommendations and IC-9 A/B/C request in PRACTICE-FIRST, followed
by the approval above. IC-9 interim risk concerning unit-rates-2@content-2
and ratio-tables-2@content-2 remains pending; legacy false accepts unchanged.

### D-167 — Concrete delivery packets and independent Science preparation

On 2026-10-14 the owner replied **"go ahead"** to the recommendation to
turn delivery lanes into concrete tasks. This authorizes bounded preparation
recorded in `docs/agent-handoffs/PRACTICE-RELEASE.md` and
`docs/agent-handoffs/SCI6-FIRST-UNIT.md`, not unspecified product choices.

- Lane A retains its existing catalog correction/review assignment; a
  subsequent separately claimed Sonnet turn prepares existing-content
  application release evidence and the exact human permissions needed.
- A separate Opus lane may prepare one Science first-unit scope against the
  already approved dossier and current schemas, with Codex GPT-6.1 Sol review.
  Maximum two concurrent author/preparation workers, one per lane; reviewers
  are read-only and only review frozen artifacts. One shared integrator.
- Preparation may propose exact unit/skills/roles/volumes and prerequisite
  code changes but does not approve them. No new curriculum records, D-61
  exception, private access, schema/catalog implementation, IC-9 or C-7
  selection, teaching serving, learner-state changes, deployment, activation,
  commit or push follows from this permission.

Record future ready choices together with exact scope and evidence; do not
ask the owner to reapprove this unchanged preparation permission.

### Science first-unit SCI6-U1–U7 — approved batch

On 2026-10-15 the owner replied **"approved both"** to the ready parallel
review batch. Lane A separately accepted Ratios catalog design rev2 and exact
patch application with nonblocking R-3 acknowledged (recorded in its packet).
Lane B approves each recommendation below from frozen scope SHA-256
`6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04`,
review `docs/sci6-first-unit-20261014-review.md`. No verified findings;
source-precision Q6 and later runtime/content/release evidence remain required.

| ID / source     | Status                          | Approved value                                                                                                                                                                                                                                       | Boundary                                                                                                                                                                                                                                                |
| --------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-168 / SCI6-U1 | APPROVED 2026-10-15             | Cells and living systems: partial MS-LS1-1/MS-LS1-2 components; three1.0.0 skills sci6-cells-evidence-of-life, sci6-cell-parts-functions, sci6-cell-as-a-system; sci6-life-science domain; no prerequisite edges. Frozen §§2–3 components/standards. | Scope values, no full-PE mastery, production unit registration or immediate drafting.                                                                                                                                                                   |
| D-169 / SCI6-U2 | APPROVED 2026-10-15             | Six core practice records, two per skill; zero depth/teaching/assessment/review.                                                                                                                                                                     | Values only. Accept disclosed serialized practice and unhinted placement/review exposure for first records; no Math threshold default.                                                                                                                  |
| D-170 / SCI6-U3 | APPROVED 2026-10-15             | Structured single-choice fields only, frozen §3 response contract.                                                                                                                                                                                   | Preserve D-157/D-158/D-160; no constructed-response scorer, rubric/LLM mastery or new response kinds.                                                                                                                                                   |
| D-171 / SCI6-U4 | APPROVED 2026-10-15             | Frozen §2 virtual/provided-data-only safety policy and covered/not-assessed matrix for this unit.                                                                                                                                                    | No procedures, specimen collection, microscope operation, chemicals/live organisms or whole-PE claims. Other PEs/resource/climate choices unchanged.                                                                                                    |
| D-172 / SCI6-U5 | APPROVED 2026-10-15             | Execute frozen §4 P1–P6 prerequisite implementation, including recommended P5, isolated Claude forge-implementer/Sonnet then independent Codex review and separate patch acceptance.                                                                 | Unavailable Science registry/prefix, domain/labels, Science skill/content rules, figure-label alternatives and invariant tests. No authored skills/content, availability flip, serving, commit/push or release.                                         |
| D-173 / SCI6-U6 | APPROVED CONDITIONAL 2026-10-15 | Narrow D-61 drafting exception: grade-6-science, three D-168 skills, six D-169 core practice records. Opus drafts in isolated worktree/bundle, llm_drafted/owned/pending_review; cross-family Codex review.                                          | Starts only after U5 integration, applicable D-61 gate evidence and recorded engineering-owner sign-off. These conditions are not satisfied by this approval. No teaching/depth/held-out, figures outside approved static subset, registration/serving. |
| D-174 / SCI6-U7 | APPROVED 2026-10-15             | Skill paths content/skills/<code>.json; record paths content/grade-6-science/<id>.json.                                                                                                                                                              | Path values only. Imports/catalog registration require later approval.                                                                                                                                                                                  |

Approver: product/content/engineering owner, in chat. At this batch approval,
D-173 conditions remained open and U5 execution did not preapprove its patch.

**D-173 engineering-owner disposition — 2026-10-15:** after exact reviewed U5
rev3 acceptance/application and integrated verification (94files/2,016tests/
build), the owner replied **"approve"** to the explicit engineering sign-off
for the three approved Science skills/six core practice drafts. Applicable
D-61 evidence is in `docs/agent-handoffs/SCI6-PREREQ.md`. Conditions now
satisfied for this scope only; [SCI6-DRAFT](agent-handoffs/SCI6-DRAFT.md) may
start in Claude forge-expert/Opus. No production imports, content acceptance,
availability, teaching, private assessment, provider invocation or release
permission follows. Original D-173 table describes its conditional grant;
this later disposition satisfies the named conditions without broadening it.
Content human approval, registration, teaching and release remain separate.

### Existing-content practice release PR-1–PR-7a — approved batch

Owner, 2026-10-15: "for lane A decisions go with recommended approach. use
your judgement." Applies to PRACTICE-RELEASE bundle
`.git/agent-handoffs/PRACTICE-RELEASE/` (hash manifest SHA `95b003f4...d298`),
proposal `04`. PR-2/PR-3 had no recommendation; the integrator chose the
options requiring no new work or live change under that delegation.

| ID / source   | Status              | Approved value                                                                                                                                | Scope / exclusions                                                                                  |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| D-175 / PR-1  | APPROVED 2026-10-15 | S0: defer deployment; bundle the dormant structured code with the first reviewed structured-content slice.                                    | No deployment, activation or release now.                                                           |
| D-176 / PR-2  | APPROVED 2026-10-15 | IC-9 option A (delegated judgement): leave `unit-rates-2@content-2` and `ratio-tables-2@content-2` with documented false-accept risk.         | No legacy item mutation, exclusion or code. Revisit before any release that serves them.            |
| D-177 / PR-3  | APPROVED 2026-10-15 | Option (i) (delegated judgement): accept the other seven characterized `parts` items, limitation to be stated in any future release note.     | No correction authorized; false accept can still set "Independently confirmed". Revisit at release. |
| D-178 / PR-4  | APPROVED 2026-10-15 | Accept unshown contest A–E choices (16 items), Spelling exact-match and two items per skill as-is for reuse; release note says practice-only. | No correction packet scheduled.                                                                     |
| D-179 / PR-5  | APPROVED 2026-10-15 | Perform D-41 repeat screen-reader pass, 200% zoom/320px reflow and help-text decision before any release.                                     | Owner/named tester action; results not yet recorded. Not a claim the checks passed.                 |
| D-180 / PR-6  | APPROVED 2026-10-15 | Owner reads production facts in bundle `04` §B1 (names only) before any push or deploy.                                                       | Owner action pending; no agent dashboard or credential access.                                      |
| D-181 / PR-7a | APPROVED 2026-10-15 | Local commit of the exact 30 accepted application files. Executed as `059c7f6`.                                                               | No push, docs, config, migration or deployment.                                                     |

Not granted: PR-7b push, PR-8 production migration 0018, PR-9 deployment,
PR-10 fresh synthetic DB validation. Release and rollback owners remain
unassigned.

### D-182 — SCI6-REGISTER bounded execution and human approval metadata

On 2026-10-16 owner **"approve"** answers the exact registration request
presented after SCI6-DRAFT content acceptance/application. This authorizes
SCI6-REGISTER execution only, with these approved values:

- Six accepted practice records may change review.status to reviewed and
  review.reviewer to **Product/content owner (chat approval 2026-10-16)**;
  preserve originalityStatement and all accepted pedagogical/scoring bytes.
- Import three accepted Skill files into src/curriculum/catalog.ts and six
  practice files into src/content/catalog.ts; update directly coupled
  curriculum/content/publication/Science tests, expected67skills/134records.
- Science remains available:false, skill-graph-only/no Unit/Lesson refs;
  no new records/versions/edges, UI/tutor/mastery/scorer/schema/exposure-policy
  changes. Verify raw reviewed projection versus program-gated site/session
  behavior honestly; exposure-policy change needs new scope.
- Isolated Claude forge-implementer/Sonnet, database-free verification,
  independent fresh Codex forge-reviewer/gpt-6.1-sol implementation review,
  then separate exact patch acceptance/application. No future patch accepted.

Evidence: accepted draft-rev2 patch27247a47...c5f, independent review
`docs/sci6-draft-20261016-rereview.md` and exact proposal/owner disposition
in SCI6-DRAFT packet. Not authorized: availability, teaching, private/learner/
DB/provider/deployment/release/commit/push or another full content review.
Owner-enabled local relay may dispatch this exact assigned native role and
bounded status checkpoint while preserving all model/human gates.

**D-182 metadata extension — owner approved 2026-10-16:** the current
checkpoint's recommended option1 is selected: add
`review.reviewedAt: "2026-10-16"` to the same six records, as required by
ContentReviewSchema for reviewed status. This is the already-recorded human
content approval date, not a new content review or synthetic date. Status,
reviewer and reviewedAt are the only permitted metadata changes; preserve
originalityStatement and all pedagogical/scoring/provenance fields. Same
Sonnet worker resumes existing isolated edits, tests and freeze. No schema,
exposure/availability policy, provider or release change authorized.

**D-182 coupled-test recovery extension — owner approved 2026-10-17:**
the owner's explicit recovery request additionally owns only
`tests/contracts/structured-response-schema.test.ts` for the required
registration regression. Preserve coverage of all 128 existing legacy
records, the six exact structured Science records and the nine existing
validators with parts. Add this exact file to the relay edit/freeze paths,
and grant the status checkpoint read-only access to the worktree named in
its pinned worker ticket; do not grant checkpoint edits there.
Validate the relay corrections, preserve existing implementation work and
all consumed runs, re-pin the corrected launch, clear only the matching
checkpoint-denial pause and resume the same Sonnet session within
60 minutes/eight invocations, checkpoints included. Independent fresh
Codex technical review and in-scope corrections may proceed automatically.
Science remains unavailable; exact human patch acceptance/application and
all content/privacy/policy/release gates remain intact. No blanket
permissions, policy changes, commit or push.

**D-182 exact patch acceptance/application — owner approved 2026-10-17:**
owner **"accept and authorize"** accepts and authorizes application of the
independently reviewed 13-file SCI6-REGISTER patch, SHA-256
`09bf08b8b4d7928b2c685e1049b728d143e65934bfdcc31a648e4cbbbb6ff968`.
Codex GPT-6.1 Sol read-only review recorded zero findings with verified native
identity. The integrator matched all target baselines before application
and all 13 frozen output hashes afterward. Main now registers 67 skills and
134 records, including the three accepted Science skills and six reviewed
practice records; the existing 128 records are preserved.
Raw reviewed projections include the six Science records; program/site/
session-start availability remains off. This is exact patch acceptance and
local application, not Science availability, teaching, release, deployment,
commit or push authorization. No new curriculum authoring is granted.

### D-183 — Delivery-level agent coordination and standing engineering acceptance

**Owner authorized 2026-10-17.** The owner clarified that agents should
"keep going in unison till we have a finished product", selected the existing
delivery-first milestones (usable Grade 6 practice, complete Ratios, then the
first usable Science unit), and answered the routine-engineering acceptance
question with **"authorize complete approval till product is delivered"**.

This is a standing mandate to coordinate that delivery sequence, not merely
finish one task ticket. Implement a dependency-aware coordinator, reconcile
live packets rather than stale session todos, and automatically continue
eligible design, implementation, independent technical review, in-scope
correction and local engineering integration. Routine in-scope engineering
patches need not return to the owner for exact-patch acceptance after verified
independent review and the required checks. Preserve review independence,
actual-model evidence, isolated ownership, immutable artifacts, baseline
checks and explicit acceptance evidence. A blocked task must not prevent
unrelated eligible work. Prepare concrete successor scopes instead of
waiting for the owner to type "continue".

This mandate does not supply missing curriculum/content acceptance, a D-61
authoring exception, private-content access, privacy or destructive-migration
approval, manual accessibility observations, production facts, credentials,
release/activation/deployment permission, or commit/push permission. Models
may provide technical recommendations, not fabricate those facts or record
themselves as the human approver. Batch genuinely required owner actions;
continue independent eligible work while those actions remain pending.
Deferred Concept Clips and unrelated course expansion are outside this
delivery target. No unlimited spending, new fleet, permission bypass or
automatic budget renewal follows. Use bounded, resumable runs with explicit
status distinguishing active work, exhausted budgets, blocked tasks and
milestone completion. A stopped watcher is not autonomous delivery.

**D-183 narrowed execution — owner "go ahead", 2026-10-17:** after the first
isolated prototype failed technical readiness, the owner authorizes the
proposed smaller verified sequence: C1 task planning and durable run/control
state; C2 acceptance/permissions/credential/check boundaries; C3 baseline-
checked integration/recovery. Preserve the failed prototype and DC-01–DC-14
counterexamples. Implement and independently review each increment before
local application under the standing engineering acceptance. The new bounded
run uses the existing 60-minute/eight-invocation defaults; it does not rewrite
or automatically renew the old run. Routine technical corrections need no
additional owner confirmation. C1 alone is not delivery autopilot and cannot
invoke models, approve gates or apply product patches.

**D-183 next-run authorization — 2026-10-17:** after C1 and its lint/format
cleanup were accepted/applied, the owner explicitly authorized another
60-minute/eight-native-invocation run, then increased its runtime to
**120 minutes**. The eight-invocation cap is unchanged. Start with C2;
continue to C3/dispatcher work only if sufficient implementation and
independent-review budget remains. Preserve the exhausted prior run and
all failures; no automatic renewal, permission bypass, human-gate changes,
activation, deployment, commit or push.

**D-183 declaration-regression follow-up — 2026-10-18:** after the C2 run
exhausted eight native invocations with fifteen findings closed and one
scanner regression remaining, the owner explicitly selected **"Authorize
30 minutes / 2 native invocations for the remaining C2 fix and verification"**.
This is a fresh bounded C2-only run: same original Sonnet, declaration-file
scanner correction and directly coupled regressions, then independent Codex
changed-scope verification. Preserve the exhausted run and all frozen
revisions/reviews; no automatic renewal, C3, new scope/policy, human-gate
changes, private/production access, commit, push, deployment or activation.
Standing D-183 local engineering acceptance still requires technical readiness,
exact reviewed bytes, current baselines and required checks.

**D-183 follow-up budget extension — 2026-10-18:** before independent review,
the integrator held the declaration fix because the author also changed
process termination and lock retries outside that narrow scope. The owner
explicitly selected **"Authorize one additional native invocation and a fresh
30-minute window (two calls remaining)"**. The follow-up cap increases from
two to three native calls, with one already consumed; only original-author
removal of those two control deltas and independent changed-scope verification
remain. Preserve the original authorization, pre-review hold, frozen rev4
and exhausted prior run. No new feature/policy/permission, C3, human-gate
change, commit, push, deployment or activation; no automatic further renewal.

**D-183 renewed bounded autopilot — 2026-10-19 (UTC):** after the previous
follow-up ended blocked on C2-05 resolver fidelity, the owner explicitly
selected **"Authorize 120 minutes / 8 native invocations under D-183: finish
C2, then C3 if budget permits"**. Preserve all exhausted runs, frozen
revisions, reviews and cause checkpoints. Resume the original C2 author,
require exact collision/positive controls and independent changed-scope
verification, then validated local C2 acceptance. C3 may proceed only
afterward with separately pinned scope and enough design, implementation
and independent-review budget. No automatic renewal, new product scope,
blanket permission, human-gate change, private/production access, commit,
push, deployment or activation follows.

**D-183 technical completion record — 2026-10-19 (UTC):** the renewed run
consumed all eight native calls. Original Sonnet completed C2 corrections;
independent native Codex `gpt-6.1-sol` returned ready with zero findings for
rev9 `5519c634b74733d38d1078c5fa987494b62ffafceb90c1a0298bd320fc0d920a`.
The integrator accepted/applied only those six reviewed files under the
existing standing engineering mandate, without staging. Main checks pass
166 agent/2,185 full tests/build and all five check groups; six output hashes,
841 unowned root pins, HEAD/index and portable aliases are preserved.
Evidence is common Git
`agent-handoffs/DELIVERY-COORDINATOR/autopilot-20261019/`:
`rev9-review-result.json`, `c2-application.json`,
`main-c2-validation.json` and `c2-technical-acceptance.json`.
Prior failures/revisions and cause checkpoints remain unchanged. Run ended,
own claim released, no workers/watchers or automatic renewal. C3 was not
started because insufficient native slots remained for its separate design,
implementation and review. This is technical local acceptance, not a new
owner authorization, product milestone, real-client C2 protocol smoke,
human content/privacy/release acceptance, commit, push or deployment.

**D-183 standing bounded execution authorization — 2026-10-19 (UTC):**
after C2 local completion, the owner explicitly selected **"Authorize
24 hours / 100 native invocations total, with automatic batch renewal
until the approved milestones finish or either aggregate limit is reached"**.
This is a new aggregate authorization, recorded at
`2026-10-19T02:51:33.003Z`, ending at `2026-10-20T02:51:33.003Z`.
The first of milestone completion, 100 consumed native invocations or the
fixed deadline ends execution. Reservations and failed calls count; batch
renewal never resets aggregate usage or extends its deadline. Old exhausted
runs remain immutable and are not reopened.

Within that allowance, automatically continue issue-sized C3 design,
implementation, independent review, in-scope corrections, validated local
integration, dispatcher wiring and the existing usable Grade 6 practice ->
complete Ratios -> first usable Science unit sequence. Use native Opus for
unresolved design, native Sonnet for defined engineering implementation and
independent native Codex for technical review. Reconcile live packets, carry
closed reviews forward and continue unrelated eligible work at a blocked
task. This does not authorize unrelated expansion, a fleet, blanket tool/path
permissions, automatic aggregate renewal, commit/push/deployment, or model
substitution for protected human gates. Content, D-61, private access,
privacy, migration, manual observations, production facts and release/
activation gates remain explicit. Account/auth/quota failures and stop
controls remain effective.

Evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/standing-20261019/authorization.json`
and its aggregate `run.json`. Automatic renewal applies to child batches
inside this envelope, not to previous runs or additional aggregate budgets.
Copilot currently coordinates native CLI children while the coordinating
session is active; this authorization alone does not implement a persistent
product watcher or guarantee execution after the session closes.

The initial increment is the delivery coordinator and its synthetic tests.
The existing Science ticket history stays immutable and SCI6-REGISTER stays
DONE. This decision does not claim the coordinator is already implemented or
running, nor that any learner-visible milestone is delivered.

### D-184 — Claude Code-coordinated bounded window

Owner, 2026-10-20: after the Copilot monthly quota was exhausted and control
switched to Claude Code, owner replied **"approve both recommendations"**.
New aggregate window `2026-10-20T13:25:35Z` to `2026-10-21T13:25:35Z`,
**50 native invocations** maximum (each new or resumed Claude worker turn and
each `codex exec` review counts, failures included), no automatic aggregate
renewal. Same D-183 milestones (usable Grade 6 practice -> complete Ratios ->
first usable Science unit), standing local engineering acceptance and
preserved human gates (content, D-61, private access, privacy, destructive
migration, manual accessibility, production facts, activation, deployment,
release, commit/push). Claude Code integrator runs workers directly: native
Opus forge-expert for design, Sonnet forge-implementer for implementation,
`codex exec` `gpt-6.1-sol` read-only for independent review; at most two
concurrent workers. Evidence: common Git
`agent-handoffs/DELIVERY-COORDINATOR/claude-window-20261020/`.

### D-185 — Protocol smoke abandoned

Same owner response: the held docs-class dispatcher protocol smoke
(enrollments `35bcc5ec...fb45564` and successor `ad88a3ce...7fbc7e`) is
explicitly abandoned. Its frozen bundle, independent READY review, drain/
restart (G3) and accounting (G4) evidence stay preserved; G2 (C3 COMPLETE
receipt/publication/dependent-ready) is not claimed. The runbook bundle is not
applied. The dispatcher is locally accepted code but is not used to run work
in the D-184 window and is not claimed operational.

### D-186 — Ratios catalog IMPL-1/IMPL-2 under the standing mandate (Q-0)

Owner, 2026-10-20, reply **"approve all recommendations, R14(i)"** to the
consolidated request: Q-0 option A. RAT-CATALOG-IMPL-1 and IMPL-2 (dormant
version index, active selection, registration checks, digest manifest, probe-
snapshot library; scope rev3 `9830b39f...f7a6` plus the RCI-R8 duplicate-
occurrence test) are covered by the D-183/D-184 standing engineering mandate.
This does not adopt P-A/H-1 as live behavior and authorizes no registration,
route/admission/state wiring, content or private access, or activation.

### D-187 — Science milestone definition (SU-H0)

Same reply: SU-H0 (a). The first usable Science unit is the **practice-only**
path of SCI6-USABLE scope rev3 `a6de4a4d...f2cf6` §1.2 (three D-168 skills,
one Life Science chapter, no teaching, Units or Lessons).

### D-188 — Science scope label (SU-H1)

Same reply: SU-H1 (b). Learner-visible label **"Grade 6 Science (Cells unit,
practice only)"**. Authorizes only those bytes in the SU-E3 candidate.

### D-189 — Science tutor framing (SU-H2)

Same reply: SU-H2 (b). Dispatch SU-E4 (exact Science rule text, the finite
17-pattern hands-on check with its documented known gap, fallback text) and
SU-E4b (capped real-eval selection). The paid run itself stays the separate
SU-H7 gate; nothing here authorizes a provider call.

### D-190 — Science content volume (SU-H3)

Same reply: SU-H3 (a). The six reviewed records suffice; **no D-61 exception
is requested**. Thinness, item reuse at the check, unhinted first encounters
and unserved authored hints are disclosed, not corrected.

### D-191 — Science claim disposition (SU-H10)

Same reply: SU-H10 (b). Dispatch SU-E5 with mandatory rendered evidence and
exactly this parent note: "Grade 6 Science rows come from practice checks on
provided cell models, two items per topic. They do not show mastery of a full
science standard, investigation skills or building models." Estimate and
confirmation semantics (scope rev3 §4.2) are unchanged.

### D-192 — Science threshold (SU-H11)

Same reply: SU-H11 (a). `grade-6-science-default@1.0.0` is the Science v1
profile; its only consumed value is `minEstimateGate 0.75`. Other fields stay
dormant; no file change. Evidence: SU-E1 case 3 and SU-E2 cases 5 and 7.

### D-193 — Paid-eval cap failure does not change the tutor choice (SU-R14)

Same reply: option (i). If the SU-E4b call cap cannot be made to work, the
D-189 choice stays (b) and **release stays blocked** until a capped paid eval
passes under SU-H7. There is no automatic fallback to SU-H2 (c); changing the
choice needs a new owner decision.

### D-194 — Narrow D-61 drafting exception for public Grade 6 Math Ratios practice (RAT-CONTENT Q-1)

Owner, 2026-10-21, reply **"approve all recommendations, with engineering
sign-off"** to the RAT-CONTENT batch (scope rev2
`87199e750a6ace25a7634aa490e5f11d3e5b92ecc39ec0e63e3001910b5fca04`, Codex
`gpt-6.1-sol` READY_WITH_RISKS). Approved exactly as scope rev2 §5.1, under
Q-2 (a): program `grade-6-math`; the five D-150 skills at `1.0.0`; drafting
of exactly **22 public `practice` records** — 20 new identities, four per
lesson (`<skill>-3`…`<skill>-6@content-1` at `content/ratios/<id>.json`), and
`unit-rates-2@content-3` and `ratio-tables-2@content-3` at
`content/ratios/unit-rates-2-content-3.json` and
`content/ratios/ratio-tables-2-content-3.json`. Content follows plan
TR-1–TR-7 (TR-3 corrected), D-151, D-152, D-154–D-162 and M-C. Opus drafts
in the isolated RAT-CONTENT bundle; every record `llm_drafted`, `owned`,
`review.status: pending_review`, `review.reviewer: "pending human review"`,
no `reviewedAt`, not imported. Cross-family Codex review and per-item human
content approval follow. **Excluded:** teaching; held-out, lesson/unit/
review/delayed-check bank items, D-148 drafts, private access; any byte change
to existing Ratios records, skills or lesson/unit/bank/program records;
registration, import, serving, publication, ContentArchive or database work,
deployment, commit, push; any other program or skill. The D-61 pause
otherwise remains in force.

### D-195 — Engineering-owner sign-off and D-61 applicability for D-194

Same reply: engineering-owner sign-off given. Applicable D-61 evidence
(integrator): practice-role authoring for an existing program may be unpaused
by explicit owner decision once D-58/Stage A0 is done (`D-61`, this file);
D-58 approved and Stage A0 shipped (PROGRESS 2026-09-19); `grade-6-math` is an
existing available program; practice-role, structured-response contracts and
practice UI are integrated (commit `059c7f6`); no held-out, private, rollout or
teaching scope is requested. RC-2A/RC-2B drafting may start.

### D-196 — TR-7 repair form (RAT-CONTENT Q-2)

Same reply: Q-2 (a). Draft new versions `-2@content-3` at the `-content-3.json`
paths. Drafting only: supersession of `content-2` at RC-5 still requires the
D-176 revisit, O-13, ContentArchive capture before deployment and separate
public-exposure authorization.

### D-197 — Candidate derivation (RAT-CONTENT Q-3)

Same reply: as listed in scope rev2 §5.2. Snack mix (TR-1) may be derived; art
supplies optional with a gradable meaning format; table-and-unit-rate only
with the R-5/R-6 repairs and an overlap check against `unit-rates-1`;
percent-and-conversion is a model only, not adopted. Derived records are new
identities naming the candidate in `provenance.sourceReference`; candidate
files stay byte-identical.

### D-198 — Ratio-tables coverage residual (RAT-CONTENT Q-4)

Same reply: Q-4 (a). Cover comparing ratios with tables inside the new
`ratio-tables` items; plotting table pairs remains uncovered and disclosed. No
skill change.

### D-199 — Teaching validator under the standing mandate (RAT-CONTENT Q-5)

Same reply: Q-5 (a). RC-T1, a dormant teaching validation module per
catalog-versioning §8 items 1–3, is covered by the D-183/D-184 standing
engineering mandate. No teaching drafting or serving; the five-record
teaching D-61 exception is requested after RC-T1 is accepted.

### D-200 — D-184 window extension

Owner, 2026-10-21T13:15Z (before the D-184 end), reply **"extend 24h / 30
runs"**: the D-184 Claude-coordinated window is extended to
`2026-10-22T13:25:35Z`, with 30 more native invocations (aggregate maximum 80;
42 used at extension). All other D-184 terms are unchanged: same D-183
milestones, roles, at most two concurrent workers, standing local engineering
acceptance and preserved human gates. No further automatic renewal. Evidence:
`agent-handoffs/DELIVERY-COORDINATOR/claude-window-20261020/authorization.json`
(`extensions`) and `ledger.json`.

### D-201 — Apply the Science activation candidate locally (SU-H5)

Owner, 2026-10-21, reply **"approve Batch B recommendations"** to the
SCI6-USABLE Batch B request: SU-H5 apply. The exact reviewed SU-E3 patch
`b09e637065d09189b605f0691e773212ce5abd8f11c71db647206bac9015c163` (7 files;
Codex `gpt-6.1-sol` READY_WITH_RISKS) is applied to the local main working
tree, uncommitted: Science `available: true`, label "Grade 6 Science (Cells
unit, practice only)". This is not a commit, push, deployment or release.

### D-202 — One capped paid Science eval, run by the owner (SU-H7)

Same reply: SU-H7 approved once, run by the owner in their own environment:
`npm run eval:run-real -- --cases evals/real-runs/science-framing-v1.json
--max-calls 24 --out reports/sci6-real-eval.md --confirm-paid`. At most 24
requests and 7,200 output tokens; no script-enforced dollar cap (console
monthly limit only). Agents do not run it or handle the key. The owner reads
the report; under D-193 release stays blocked until it passes.

### D-203 — D-176/D-177 reaffirmed for this release (H9e)

Same reply: H9e reaffirm. D-176/D-177 stand for the Science release; the
Ratios TR-7 supersession (D-196) is decided separately at RAT-CONTENT RC-5.

### D-204 — Post-deploy smoke scope adopted (H9h1)

Same reply: H9h1 adopt, as written in SCI6-USABLE scope rev3 §4.3: `/login`
200; parent sign-in; Math landing unchanged; unavailable programs still
"coming soon"; Science shows one chapter with three topics; one placement
answer on an owner-chosen test learner (deletable production rows); no
progression panel. Adoption only; execution is H9h2 after a deployment.

SU-H6 (manual accessibility) and H9a (production facts) are owner actions
still pending; they are not answered by this reply.

### D-205 — Narrow `ratio-tables-2@content-3` evidence (RAT-CONTENT CA-R1)

Owner, 2026-10-21, reply **"approve CA-R1 (a) and CA-R2 (a)"**: CA-R1 option
(a). The draft's evidence statement is narrowed to what the structured answer
actually checks: "finds the unit rate (minutes per mile) and uses it to find
the time for a new distance". No explanation is claimed. The original Opus
author corrects the draft (`draft-A-rev2`); Codex re-reviews the changed
scope. This is not content acceptance: per-item approval remains RC-4.

### D-206 — Accept depth mode for `unit-rates-2@content-3` (RAT-CONTENT CA-R2)

Same reply: CA-R2 option (a). The TR-7 version `unit-rates-2@content-3` is
authored in `depth` mode instead of the prior `contest` mode, because
structured validators are rejected in contest mode (`src/content/catalog.ts`
`:327-330`). Mode change only; per-item content approval remains RC-4.

### D-207 — Delegated cross-family model sign-off for two gate classes

Owner, 2026-10-22, reply **"Approve D-207 as proposed and RC-4 all 14"**.
Revocable by the owner at any time. Two gate classes may be signed off by a
cross-family reviewer (Codex `gpt-6.1-sol`, actual model verified from client
metadata) for Claude-authored work, instead of a separate owner reply:

1. **In-scope dispositions:** a choice between options inside an
   owner-approved scope (like CA-R1/CA-R2). Adopted only when the reviewer and
   the integrator recommend the same option; any disagreement, or an option
   that widens scope, goes to the owner. Each adoption is recorded as its own
   decision naming the reviewer report.
2. **Per-item practice content acceptance:** practice-role items with a
   deterministic structured answer, where the reviewer independently re-solves
   every answer and the frozen harness passes. The integrator records the
   batch, sends the owner a summary, and draws about 3 random items for an
   owner spot-check. The owner may reject any item for 7 days after the
   summary. A rejected item is withdrawn before registration (RC-5).

Excluded, still human: teaching or held-out content, private-bank access,
paid-provider runs and keys, manual accessibility, production facts,
privacy, spending, destructive migrations, D-61 exceptions and scope
approvals, registration/exposure, commit, push, deployment and release.
Claude or Opus review never qualifies; unknown model identity never
qualifies. Rulebook amended: `AGENTS.md` (model selection) and
`docs/agent-orchestration.md` (**Delegated model sign-off**).

### D-208 — RAT-CONTENT RC-4: batch A content accepted (14 items)

Same reply: the owner accepts all 14 items of `draft-A-rev2` (freeze
`496ab837a178f5ff1a0ab955df9571b1cbfe92efec660fee62c58aa21524c758`; list
`agent-handoffs/RAT-CONTENT/rc4-request.md`
`c0aeb5bf0ffcc0ab00d2b69f810b0d70569f640cacbe55bd799dbe919055aa63`):
ratio-language-3–6, ratio-tables-2@content-3, ratio-tables-3–6,
unit-rates-2@content-3, unit-rates-3–6. Content acceptance only;
registration, serving, TR-7 supersession and commit remain RC-5 gates
(K-3/O-10, O-13, D-176 revisit).

### D-209 — RAT-CONTENT batch B: six items accepted under D-207 sign-off

Delegated sign-off (D-207), not an owner reply. Codex `gpt-6.1-sol` (verified,
thread `01a15eae-f16c-72a1-8335-eb30eda75782`; report
`agent-handoffs/RAT-CONTENT/rc3-B/review-r1-report.md`
`8ec80ef7c9d90d395721b2b8968f422d4db3e8f3dbdb0360352fc60b00e06678`)
independently re-solved every answer. Frozen harness rev3
(`ce0083f71ecfd721fd0e4eb727717adafc2083561fa73a879e2185e1411c23f1`) passes
69/69 on the batch. Accepted, exact `draft-B-rev1` bytes (freeze
`013995567051b4a33bcb295b677f4249b34d46ce9955cb5fa64c906da308f343`):
double-number-lines-5, double-number-lines-6, percent-applications-3–6.
Owner summary sent 2026-10-22T02:14Z. The owner may reject any item until
2026-10-29T02:14Z. Random spot-check draw: percent-applications-3,
percent-applications-6, double-number-lines-6.

Not accepted: double-number-lines-3 and -4 (legacy numeric validators; CB-R1
correction pending; their acceptance stays with the owner because D-207 covers
structured answers only). Content acceptance only; RC-5 gates unchanged.

### D-210 — RAT-CONTENT RC-4: double-number-lines-3 and -4 accepted

Owner, 2026-10-22, reply **"approved"** to the single pending approval
request ("Accept DNL-3 and DNL-4"; the other open owner items are actions or
facts, not approvals). Accepted content, exact `draft-B-rev2` bytes (freeze
`e1f94444c70b65b20e88013d9faaf2a5086e20b7a419638d9cabc7e797d8f49c`):
`double-number-lines-3@content-1`
(`982548da2e7a33cd19e341177678f0d455712a48e76ea036e7fc4fea1f6a8346`) and
`double-number-lines-4@content-1`
(`14cc4a2f3a54431fe183be17523d81d79105ad1742229ca005e512d54b3a6e56`), on the
Codex `gpt-6.1-sol` recommendation (`rc3-B/r2/review-r2-report.md`
`a837e805...6968`), with the disclosed legacy answer-form limitation. With
D-208 and D-209 all 22 RAT-CONTENT practice drafts are accepted (D-209 veto
window open to 2026-10-29T02:14Z). Content acceptance only; RC-5 gates
unchanged.

### D-211 — D-184 window extended again (time only)

Owner, 2026-10-22T02:31Z (before the D-200 end), asked to "extend the window
for another 24-48 hrs and keep going". The window end becomes
`2026-10-24T13:25:35Z` (48 hours past the D-200 end, the upper bound asked).
No invocation count was given, so the aggregate cap stays at 80 (56 used)
until the owner names one. All other D-184/D-200 terms are unchanged.
Evidence: `authorization.json` (`extensions`) and `ledger.json`.

### D-212 — 100 more runs; model decisions replace owner approvals (widens D-207)

Owner, 2026-10-22T02:33Z, reply **"add 100 runs. do not block for human
approval, instead use an alternative model to review and make decisions."**
Revocable by the owner at any time.

1. **Runs.** Aggregate invocation cap 180 (56 used); window end unchanged at
   `2026-10-24T13:25:35Z` (D-211).
2. **Delegated decisions.** Every approval or owner-choice gate that is
   internal to this repository and reversible is decided by the verified
   cross-family reviewer (Codex `gpt-6.1-sol` for Claude-authored work) instead
   of a separate owner reply. This includes content acceptance of any role
   (practice, legacy, teaching), D-61 exceptions, scope approvals,
   dispositions, owner-choice design questions (e.g. OC-3, OC-5 as a decision
   only), risk acceptances and local application of reviewed patches. The
   reviewer receives the options, evidence and integrator recommendation and
   gives a binding decision with reasons; the integrator records each as its
   own decision naming the report. No owner veto window is required, but every
   delegated decision is listed in PROGRESS for later owner override.
3. **Not delegable; worked around, not waited on.** Actions a model cannot
   perform or that leave the repository or this machine stay with the owner,
   and agents continue other eligible work instead of stopping for them:
   paid-provider runs and API keys (D-202), manual assistive-technology
   accessibility passes, production facts, access to production, learner or
   private data (including the private bank, O-10), commit, push,
   deployment, release and production migrations. A delegated decision may
   choose an option whose execution needs one of these; the execution then
   waits for the owner.
4. **Preserved.** Cross-family review with verified model identity, never
   same-family or unknown; deterministic evidence; claims, ledgers and the
   no-`.env` rule; at most two concurrent workers.

Supersedes the narrower D-207 scope; D-207 decisions remain valid. The
matching rulebook amendment to `AGENTS.md` and `docs/agent-orchestration.md`
was first blocked by the agent permission classifier (self-modification); on
the owner's explicit request ("can you make the necessary edits to switch to
cross family model decisions") it was applied on 2026-10-22.

### D-213 — RC-5 local registration authorized (G-1)

Owner, 2026-10-22, reply **"approve G-1 to G-6 as recommended"** to
`agent-handoffs/RAT-CONTENT/rc5-decisions/request.md`. G-1 (a): the 22
accepted RAT-CONTENT practice records may be registered in the local tree
(`rawContent`, `servableContentCatalog`); uncommitted and reversible. Actual
exposure happens only at an owner deployment. K-1 (served before lesson
2.0.0, via legacy grants) accepted as documented.

### D-214 — O-13 settled for the future by supersession (G-2)

Same reply: G-2 (a). O-13 is settled as moot going forward:
`unit-rates-2@content-2` and `ratio-tables-2@content-2` (2026-10-09 bytes,
commit `5a452de`) are superseded by the reviewed and accepted `content-3`
versions (D-208) and are not served after RC-5. Historical attempts stay
attributable to those exact bytes by hash. No retroactive approval of the
2026-10-09 edits.

### D-215 — D-176 interim choice ends at RC-5 (G-3)

Same reply: G-3 (a). At RC-5, the Ratios imports switch to the `-content-3`
files and both `-2@content-2` records leave the loader (files stay on disk),
removing their known false accepts. D-203 remains valid for any Science-only
release cut before RC-5.

### D-216 — K-3 accepted for local registration only (G-4)

Same reply: G-4 (a). The held-out leakage risk K-3 is accepted for local
registration. A private-side non-reuse check (O-10; owner or owner-authorized)
is required before any deployment that serves these items.

### D-217 — ContentArchive capture is a deployment precondition (G-5)

Same reply: G-5 (a). Before any deployment carrying RC-5, ContentArchive must
hold `unit-rates-2@content-2` and `ratio-tables-2@content-2`. RC-5 validation
checks `npm run content:archive` on a synthetic database; production capture
is owner-only.

### D-218 — Narrow D-61 exception for five dormant Ratios teaching drafts (G-6)

Same reply: G-6 (a). Parallel to D-194. Program `grade-6-math`; five teaching
records, one per D-150 skill, at
`content/teaching/ratios/<skill>-teaching-<n>.json`, validated only by the
dormant RC-T1 module. Opus drafts with D-194-style draft metadata
(`review.reviewer` "pending human review"); RC-T1 validation, Codex review,
then content acceptance. No serving, no `TEACHING` grant, no lesson refs
(OC-3, OC-5 open). The RC-T1 test asserting `content/teaching` is absent is
replaced by one validating every real record.

### D-219 — Commit and push authorized; approvals delegated to Codex until completion

Owner, 2026-10-22, reply **"continue commit and push. for approvals,
delegate to codex. no human approval should be needed till completion."**

1. Commit and push the current local work to `main` (direct to main, no PR).
   A push to `main` runs CI and the curriculum-site (GitHub Pages) workflow,
   which republishes the D-58 projection of reviewed content. No learner app
   deployment workflow exists; app deployment, production migrations and
   release remain owner actions (D-175).
2. Further commits and pushes of reviewed, validated work in this delivery
   run are authorized without another reply.
3. Reaffirms D-212: approval gates are decided by verified Codex
   `gpt-6.1-sol`; agents do not wait for owner approval until the D-183
   milestones complete. Owner-only actions a model cannot perform (paid
   eval with the owner's key, manual assistive-technology pass, production
   facts, private data) are worked around and reported, not waited on.

### D-220 — RC-5 ownership amendment for three count/fixture tests (DR-1)

Delegated decision (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a15eae-f16c-72a1-8335-eb30eda75782`; `agent-handoffs/RAT-CONTENT/rc5/rev1/review-r1-report.md`
`5b87a45c207edb6a65988d13b24430a5226deb38eabddf5a936bddded36f08d7`), matching
the integrator recommendation: ACCEPT. RC-5 may change exactly the hunks in
`rc5-unowned-test-fixes.patch`
(`4c01137fbdf8daaeead138b02653361561c12dece0976dad93ad424d029dc05e`):
`tests/contracts/structured-response-schema.test.ts` (counts),
`tests/curriculum/science-rules.test.ts` (134→154, 136→156),
`tests/phase1/composite-parts-grading.test.ts` (`ratio-tables-2` serves
`content-3`; parts grading kept on the other two records). No broader
assertion weakening is authorized.

### D-221 — Pre-RC-5 ContentArchive run before deploying RC-5 (DR-2; amends D-217)

Same delegated decision: ACCEPT. `content:archive` archives loader records
only, so it must run from the pre-RC-5 build in each environment before RC-5
is deployed; a later RC-5 run preserves the `content-2` snapshots. Record the
sequence in the deployment runbook. No archive code change; archive drift
stays a failure; production execution remains owner-only.

### D-222 — RC-T2 teaching content: four records accepted (TA-1)

Delegated decision (D-212/D-219), Codex `gpt-6.1-sol` (verified; report
`agent-handoffs/RAT-CONTENT/teaching-A-rev1/review-r1-report.md`
`5879c9e4682eb1b933ac29ed68d2656050c791a280c060bfc4efb71578074ca0`). ACCEPTED
for dormant storage and validation only (D-218): `ratio-language-teaching-1`,
`ratio-tables-teaching-1`, `double-number-lines-teaching-1`,
`percent-applications-teaching-1` (all `content-1`, teaching-A-rev1 bodies).
Before application, review metadata becomes `status: "reviewed"`,
`reviewer: "Codex gpt-6.1-sol delegated sign-off (RC-T2 TA-1, 2026-10-22)"`,
`reviewedAt: "2026-10-22"`; provenance stays `llm_drafted`.
`unit-rates-teaching-1` is not accepted (RCT2-R1: reuses a registered
practice context) pending correction and re-review.

### D-223 — `unit-rates-teaching-1` accepted (TA-2)

Delegated decision (D-212/D-219), Codex `gpt-6.1-sol` (verified; report
`agent-handoffs/RAT-CONTENT/teaching-A-rev2/review-r2-report.md`
`7ba45f62c7ebc941c5535263d6f37b6d414ec760fbe1b9deef40c85b76548fbb`): ACCEPT
`unit-rates-teaching-1@content-1` (teaching-A-rev2, laundromat context;
RCT2-R1 closed) for dormant storage and validation only (D-218). With D-222
all five Ratios teaching records are accepted.

### D-224 — Mechanical review-metadata completion for `unit-rates-teaching-1` (TA-3)

Same report: APPROVE. The integrator set only its `review` to `status:
"reviewed"`, `reviewer: "Codex gpt-6.1-sol delegated sign-off (RC-T2 TA-2,
2026-10-22)"`, `reviewedAt: "2026-10-22"` (body identical with `review`
removed; originality text unchanged; new sha256
`8ddf3e2d41237b8d1699ac2779c94031336b3603c4dc1082333bb474540fed0a`) and its
one `PINNED_SHA256` entry, on top of `rct2-combined.patch`
`e17b0bd00a2b29775dc1a8356103be30d93bef150d54ad2583eab6aeec1edec8`; then
isolated validation and commit/push under D-219.

### D-225 — CI verify-job timeout 10 → 20 minutes (CI-1)

Same report: APPROVE the exact patch
`agent-handoffs/DELIVERY-COORDINATOR/ci-timeout/ci-timeout.patch`
(`69daa89c940f3aa0ef443a00093f8738427f81d96a133be7baf6349e3500dbe2`). Run
39737356330 on `930dbaf` was cancelled by the 10-minute limit during browser
journeys after a slow Playwright install; the last green run took 9m37s. No
CI step or assertion changes.

### D-226 — RC-5 e2e regression fix approved (E2E-1)

Delegated decision (D-212/D-219), Codex `gpt-6.1-sol` (verified; report
`agent-handoffs/RAT-CONTENT/rc5-e2e/rev1/review-r1-report.md`
`4b3642a27ed8b59ef4cd34da8e6e557d5f7d70f0dd4165c96a53fb162976ff20`): APPROVE
`e2e-fix.patch`
(`4f0cd41d9cd313e55b437226af4579329d6d6f07b352e7a17c6852e6fdfe653a`). The
blank-answer accessibility test in `tests/browser/keyboard-navigation.spec.ts`
accepts only reviewed, core, non-structured Ratio-language items and completes
the served item with its own canonical answer; every accessibility assertion
is unchanged. RC-5 changed no `src/` behaviour.

### D-227 — Topic-card "last plan item wins" kept for now (E2E-2)

Same report: option (a). Current behaviour (`buildActionBySkillCode`,
`src/app/learner-chapters.ts:159-165`, overwrites per plan item, so a skill
with two core plan items shows the second) is retained. Follow-up logged:
define topic-card selection explicitly and add dedicated selection tests in a
separately reviewed UX patch (first-item-wins would change learner-facing
behaviour).

### D-228 to D-239 — RAT-INTEGRATE design decisions (scope rev1)

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/review-rev1-report.md`
`08a1377975d98ffe1588f32c479239f85d004dcda31f056f820a8bb1a555d105`) on scope
rev1 (`64cc82bd44ef84666ca2c543be8eba2ee4bf0f2294ff39022223fecffe10bb8d`).
Design choices only; they accept no implementation patch. "Conditional"
decisions bind once the named scope findings are corrected and re-reviewed.

- **D-228 RI-SPLIT:** S-a, split into Part A (public wiring and staging,
  agents) and Part B (registration with private banks, owner-dependent).
  Conditional on RI-R1–RI-R3 and the L-2 consequences.
- **D-229 RI-PAH:** (a) adopt both P-A and H-1 live.
- **D-230 C-7:** C7-A fresh start on new lesson versions, with mandatory
  history and NEEDS_HELP override access; no migration. Conditional on RI-R1,
  RI-R2.
- **D-231 OC-2:** L-2 new pilot lesson-bank versions (27 new private items);
  differs from the author and integrator recommendation (L-1) because L-1 can
  exhaust banks under C7-A. Conditional on RI-R2 corrections; private
  authoring stays owner-only.
- **D-232 OC-3:** (c) lessons may pin refs to the five accepted teaching
  records; amends D-218's "no lesson refs" for these records only; serving,
  grant and publication exclusions stay. Conditional on RI-R6.
- **D-233 OC-5:** (a) no curriculum-site teaching publication now.
- **D-234 MV-2:** unit bank count 30 (authoring owner-only).
- **D-235 RI-ORD:** (a) keep the pilot first refs and DNL-3 as the
  representation source; not reliant on D-163.
- **D-236 RI-STAMP:** (a) pending-review metadata first, delegated review
  stamp after acceptance.
- **D-237 RI-LABELS:** (a) bind the design labels, plus pilot lesson-bank
  versions `@2.0.0` for L-2. Conditional on L-2 updates.
- **D-238 RI-D227:** (a) topic-card selection follow-up stays separate.
- **D-239 RI-MS:** (a) report actual staged completion and the private
  registration dependency; continue eligible Science work; do not declare
  Ratios complete prematurely.

### D-240 — Ratios unit-bank composition: six per skill (MV-2-COMP)

Delegated decision (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/review-rev3-report.md`
`b0c507374afd1f87f5903dc6a1a5e49158697561d45b7069b132025e7e9eadbc`): option
(a), six items per skill for the D-234 total of 30; total private volume
stays 93. Grants no private access or authoring. The same review found scope
rev3 (`773c9cc2d8073b472538e6ca911879368c0bc5ec719b2e619c4daa60d0056faf`)
READY, satisfying the D-228 condition (D-230–D-232, D-237 remain satisfied).

### D-241 to D-243 — RAT-INTEGRATE RI-1 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/ri1/rev1/review-r1-report.md`
`3944b653183bab6034069a755f68c55aa72410720100182836bd270cf92a21a7`) on
`ri1.patch` `dc686386f32bbb86c4de02c98c19bb53c87e216c5218f2558e716ad7e8380217`
(CHANGES_REQUESTED: RI1-R1, RI1-R2 major; RI1-R3 minor).

- **D-241 RI1-D1:** (a) accept the lazy memoized proxies for
  `VERSIONED_COURSE_CATALOG`, `COURSE_CATALOG_INDEX` and `COURSE_CATALOG`
  (cycle with `catalog-versions.ts`) for current read-only usage; no
  general claim about mutation or freezing semantics.
- **D-242 RI1-D2:** (a) the mounted-package e2e branch is skipped in agent
  validation (needs the real hash-pinned package) and recorded as an
  owner-run deployment precondition; no private access authorized.
- **D-243 RI1-R2 scope amendment:** `src/curriculum/program-roster.ts` joins
  RI-1's edit allowlist, limited to consuming the active projection.

### D-244 to D-247 — RAT-INTEGRATE RI-2 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/ri2/rev1/review-r1-report.md`
`80afef84357f41b6d4f4e373ca598094be8f0f45acd04ebdffc435b8ef569ff1`) on
`ri2.patch` `943ebd6097c78acfc932c5fd266fce8aac7027c2c92a0f0fc47fb8ed39e0f0f2`
(CHANGES_REQUESTED: RI2-R1 major, RI2-R2 minor).

- **D-244 RI2-D1:** accept using the reviewed loaded record plus the lesson
  registration pin as `rawSha256` for new-placement admission under the
  static reviewed deployment model; same-version byte edits must keep failing
  validation.
- **D-245 RI2-D2:** accept passing an empty `projectionDigest` to
  `admitNewPlacementProbe` after `resolveHistoricalProbeBank` has verified the
  digest chain; it is not verification evidence.
- **D-246 RI2-D3:** accept partial PH-2 coverage until RI-5; the
  successor-positive route/store integration case is required before RI-5
  acceptance. RI-5 allowlist amended to include `src/progression/placement-probe.ts`,
  limited to registering the second committed snapshot.
- **D-247 RI2-D4:** accept exact-first-ref placement selection (matches H-1
  and PH-5; current placement preserved).

### D-248 to D-251 — RAT-INTEGRATE RI-3 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/ri3/rev1/review-r1-report.md`
`920c16ab6349f192dab3ef32443d95914a1aaac3f5a73e77040f3bee735a3357`) on
`ri3.patch` `f22771a2f2634bf0c9f65a3901a104c8b98516ad34d6ed7303b8cab5530614a2`
(READY_WITH_RISKS, no findings).

- **D-248 RI3-D1:** CE-4 cross-target exclusion is correctly omitted (scope
  rev3 §2.7 under L-2, D-231); the integrator's dispatch wording does not
  override the scope. The "lesson 2.0.0 refs never name a pilot `@1.0.0`
  bank" assertion remains a required RI-4 gate.
- **D-249 RI3-D2:** the never-reused rule is keyed on (bank code, item id),
  ignoring item version.
- **D-250 RI3-D3:** `deriveRequiredBanks` throws on an unrecognized
  registered bank kind (fail-closed).
- **D-251 RI3-D4:** `private-package-store.ts` importing the lazy
  `COURSE_CATALOG_INDEX` proxy is accepted under D-241.

### D-252 to D-256 — RAT-INTEGRATE RI-4 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/ri4/rev1/review-r1-report.md`
`7b39bded4c84bc4fefe9c26f84ac7665a898b47db64db3c631bdb75363d1ba3e`) on
`ri4.patch` `941b6cab6f3f456d4b39759d3a9fd86450106abb19c93dd0d205eb54d0c65a35`
(CHANGES_REQUESTED: RI4-R1, RI4-R2 minor).

- **D-252:** the constructed V-2 negative-control hash is rejected; use the
  exact draft hash
  `f57e6fab12e1ddc2567915ca7cd597a9fbc744d7fe32a7456fd2ff3c22fdcd88` (RI4-R1).
- **D-253:** the teaching-ref guard may use the TypeScript AST directly,
  conditional on detecting assignment destructuring (RI4-R2).
- **D-254:** the single-version golden rendered once from the baseline with a
  `toLocaleDateString` stub is accepted (independently re-rendered by the
  reviewer); `React.createElement` panel tests in `.test.ts` are accepted.
- **D-255:** browser coverage of the history view is deferred to RI-5; the
  history, keyboard and axe cases are mandatory RI-5 gates before activation.
- **D-256 (D-236 timing):** the staged 2.0.0 lesson/unit/program structure
  is accepted now; the review-metadata stamp is deferred to RI-5, applied
  once after verifying the accepted structure and pins are unchanged (amends
  scope §6 timing). Accepts no unresolved bank metadata or registration.

### D-257 — Deployment from `main` accepted; no live users

Owner, 2026-10-22, reply **"there are no live users. ok to deploy"** to the
push-incident report. Any Render auto-deploys triggered by the pushes since
`58ea75e` are accepted, and further pushes to `main` (which may auto-deploy
and run `prisma migrate deploy && npm run content:archive`) are authorized
during this delivery run. Basis: production has no live users. This accepts
deploying the D-201 Science activation before the D-193 paid eval and the
RC-5 Ratios registrations before the D-216 private check; those remain open
release-quality items, not deployment blockers, while there are no users.
Whether ContentArchive holds `unit-rates-2@content-2` and
`ratio-tables-2@content-2` (D-221) depends on the deploy order and is
unverified. Production facts and the H9 release record remain owner items.

### D-258 and D-259 — Topic-card selection (D-227 follow-up)

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a16690-ffda-7cc2-8cbd-e643c44a7c5a`; report
`agent-handoffs/TOPIC-CARD/rev1/review-r1-report.md`
`c94a3b4ad666bc202e75179c9e809e7b91173b0f142f02c0c6bcb9047c1bd0f6`):

- **D-258 TC-1:** option (a). Within each kind the first item per skill
  wins; across kinds diagnostic > review > practice is unchanged. Learner
  effect: Ratio language shows "Garden rows" (`ratio-language-1`); the three
  Science cards show their `-1` items; a core item now wins over a later
  challenge item. Supersedes D-227's "keep last-wins".
- **D-259 TC-2:** the keyboard accessibility e2e test stays order-independent
  (D-226); the rev1 browser hunk is removed (TC-R1). Approved artifact
  `topic-card-approved.patch`
  `46b42fe308e6318036934d2e11a9c9a507f2c6b7c71c9d033f05f5e38500efa8`
  (`src/app/learner-chapters.ts`, `tests/app/learner-chapters.test.ts`).

### D-260 to D-262 — Owner delegates three owner actions to agents

Owner, 2026-10-23, selected in reply to the integrator's question
"Which should I try to do myself?":

- **D-260 — Agent runs the capped paid Science eval (SU-H7).** Reverses
  D-202's "agents do not run it or handle the key" for this one run only:
  the integrator runs `npm run eval:run-real -- --cases
evals/real-runs/science-framing-v1.json --max-calls 24 --out
reports/sci6-real-eval.md --confirm-paid`. The script loads the key; the
  integrator never prints, reads or copies it and never reads `.env`. At most
  24 requests and 7,200 output tokens. Result recorded against D-193.
- **D-261 — Read-only Render production facts (H9a).** The integrator may run
  read-only Render CLI queries (deploy list, service info) if the CLI is
  already authenticated. No deploys, redeploys, rollbacks, env changes,
  shell or database access.
- **D-262 — Agent-drafted private bank items (RAT-PACKAGE).** Opus may draft
  the 93 held-out items for the ten D-237 banks, with Codex cross-family
  review, stored outside the repository and never committed. Integration with
  the existing private package location and the D-216 non-reuse check remain
  owner actions.

### D-263 and D-264 — RAT-PACKAGE draft rev1 rulings

Delegated decisions (D-212/D-262), Codex `gpt-6.1-sol` (verified; thread
`01a16c21-afb2-7d23-9df3-3523c5b3eab3`; report kept outside the repository
at `~/learning-forge-private-drafts/rat-package-rev1/review/review-r1-report.md`
`b05207fcb99470e30240d0b8084f36244cc3bc35870e442eb68163262f6686e2`) on the
private draft package `1d7723a2d8fa205682f06691ca639bfc8c457e5b9631539c54fc583916114305`.
All 93 answers independently re-solved correct; no item text is recorded here.

- **D-263 PK-1:** ACCEPT `unit-rates-lesson-bank@2.0.0` and
  `ratio-tables-lesson-bank@2.0.0` (rev1 bodies). REJECT the other eight banks
  pending correction: 21 difficulty bands outside the pinned skills' bands,
  24 double-number-line items missing D-152 static figures, one incorrect
  distractor explanation.
- **D-264 PK-2:** REJECT the proposed stamping procedure as written (the build
  and validation scripts hard-code pending metadata); reviewer attribution is
  acceptable once explicit draft/reviewed build and validation modes exist.

### D-265 and D-266 — RAT-PACKAGE ten banks accepted and stamped

Delegated decisions (D-212/D-262), Codex `gpt-6.1-sol` (verified; thread
`01a16c21-afb2-7d23-9df3-3523c5b3eab3`; report outside the repository at
`~/learning-forge-private-drafts/rat-package-rev2/review/review-r2-report.md`
`e8b74c3ff28bd50d782f650e8fac180ca633b385cf464566b8dd8582aadefc93`) on draft
rev2 `8b317fc48dc14bed880ebda8f074c15710cb9440c9d2e9ecfbdf9bbe11004c61`
(READY; all r1 findings closed; 24 DNL figures independently checked).

- **D-265 PK-1:** all ten banks ACCEPTED as held-out content (D-263 retained).
- **D-266 PK-2:** reviewed-mode stamping approved with reviewer "Codex
  gpt-6.1-sol delegated sign-off (RAT-PACKAGE PK-1, 2026-10-23)", reviewedAt
  2026-10-23, tooling `build.ts` `f4c783e1...278b`, `validate.ts`
  `5772eb27...718e`. Integrator ran both in reviewed mode; validation "ALL
  CHECKS PASSED (reviewed mode)". Output, outside the repository:
  `~/learning-forge-private-drafts/rat-package-rev2-reviewed/`
  (`package-reviewed.json`
  `fd4235c8a11fb06a3deb2dd0edac7e0713a10abd5a2ee3de9e9b31a51ba1da55`).
  Bank metadata for RI-5 (`code@version`, `contentHash`, `itemCount`):
  - `ratio-language-lesson-bank@2.0.0` `sha256:67ae5776597eed427ca08dff45db650d772a5cac6ce1a5d4f21591123b085da7` 9
  - `unit-rates-lesson-bank@2.0.0` `sha256:9240bc30980cd51af4231a9171f59db207d682226083643dc276440cbadc61fa` 9
  - `ratio-tables-lesson-bank@2.0.0` `sha256:b5fcc9dd5a03dbca7821f18a7692943b80c11c72f54c5f1f9f72c8eaf008a435` 9
  - `double-number-lines-lesson-bank@1.0.0` `sha256:83035b4a12b73ddd64aa3cd77d4028341ddd5b0e5783894efd708176ec692001` 9
  - `percent-applications-lesson-bank@1.0.0` `sha256:cc3740273ba24dde14f3f0cc53bb5da51d8a2c49230ba80f608dc94da0b9dc78` 9
  - `ratios-proportional-reasoning-unit-bank@2.0.0` `sha256:416b8c02e1ca3e3cf71e5ccc75159ad98fe2fbf892c34ff01adf2cfdc53b82be` 30
  - `double-number-lines-review-bank@1.0.0` `sha256:440f22d4bb5c1b61da4ec574c9145509a394354962ff8ddd9127d91ba1bde6a5` 3
  - `double-number-lines-delayed-check-bank@1.0.0` `sha256:62cec320cb858e4cf256b87da6317ffa7dc9c7e9aec71072684ccda70758b8a1` 6
  - `percent-applications-review-bank@1.0.0` `sha256:570faafaab2d72735f6bbc9accd4d9b364e7bf29837bd111fd8df13cfef6cdee` 3
  - `percent-applications-delayed-check-bank@1.0.0` `sha256:ea15c2d57e42d62bd82b2190d4a8814c2fb722e87d473e9346dcb84eca8058f0` 6

Still owner actions: merging these ten banks into the owner's private
package (alongside the retained `@1.0.0` pilot banks), the D-216 check
against owner-held private ids, and the D-242 mounted-package e2e run.

### D-267 — Delivery window reopened for 24 hours

Owner, 2026-10-26T14:08:24Z, reply **"approved"** to the request "extend the window 24h"
(the D-211 window had ended 2026-10-24T13:25:35Z). The window runs to
`2026-10-27T14:08:24Z`; the invocation cap stays at 180 (100 used). D-212, D-219 and D-257
terms continue for this window. Purpose: run RI-5; its push stays held until
the owner confirms the private package holds the ten new banks (CE-3).

### D-268 to D-271 — RAT-INTEGRATE RI-5 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a162b2-c31e-7960-ad17-714911a0f2fe`; report
`agent-handoffs/RAT-INTEGRATE/ri5/rev1/review-r1-report.md`
`ee858cfc69128c04b483f599913b8345c1ac9959bf4df6f067fc31cd7a11a4b7`) on
`ri5.patch` `078e486f37ed9830423bd560dc5ab786e4a004363d9e161c323b7ae0dd629450`
(CHANGES_REQUESTED: RI5-R1 major, in-flight completion not demonstrated).

- **D-268 RI5-D1:** all twelve additional test-path amendments are accepted
  (activation expectations, retained historical protections, filler banks
  that keep feedback/leakage assertions).
- **D-269 RI5-D2:** bank `originalityStatement` "Assessment items authored
  for this repository and held privately (RAT-PACKAGE, D-265)" is accepted;
  it does not claim human authorship.
- **D-270 RI5-D3:** the S2 shortcut is insufficient; RI-5 must drive a valid
  retained `1.0.0` assignment through same-key replay, fetch and submission
  after activation, completing the historical lesson without crediting 2.0.0.
- **D-271 RI5-D4:** stamping the five lessons and the unit satisfies D-256;
  the program record needs no review field.

CE-3 (confirmed): after RI-5 a mounted package must hold ten mandatory
banks (`ratio-language`/`unit-rates`/`ratio-tables` lesson banks at
`1.0.0` and `2.0.0`, `ratios-proportional-reasoning-unit-bank` at `1.0.0`
and `2.0.0`, `double-number-lines-lesson-bank@1.0.0`,
`percent-applications-lesson-bank@1.0.0`); the ten review/delayed-check
banks are optional; installing all twenty is the deployment requirement.

### D-272 — Push RI-5 before the private banks are merged

Owner decision (2026-10-26, "push RI-5 now"): push and deploy `945d678`
(Grade 6 Math `1.1.0`, Ratios `2.0.0`) before the owner has confirmed that
the private package holds the CE-3 banks. This is accepted because there are no
live users (D-257). Until the banks are merged, held-out assessments that
require the new `2.0.0` banks are unavailable in production. Merging all
twenty banks remains an open owner action, and this decision does not waive
CE-3, D-216 or D-242.

### D-273 and D-274 — Window extension and SU-H7 rerun authorization

Owner, 2026-10-28, reply **"extend window and approve the rerun"**:

- **D-273:** the delivery window is extended 24 hours, to
  2026-10-29T03:43:53Z. The run cap stays at 180. Scope: diagnose and fix the
  SU-H7 failures recorded in PROGRESS on 2026-10-28 (two validation
  fallbacks and the echoed learner text), with fake-tutor validation and
  Codex review.
- **D-274:** one more capped paid run of `science-framing-v1` on the same
  terms as D-260 (at most 24 requests and 7,200 output tokens; the
  integrator never reads `.env` or handles the key). It runs only after the
  fix passes Codex review and isolated validation. The result is recorded
  against D-193. A further run needs a new owner decision.

### D-275 to D-277 — SU-H7-FIX rulings and acceptance

These are delegated decisions (D-212/D-219) by Codex `gpt-6.1-sol` (verified;
thread `01a180b2-ae51-7c41-9166-b039fdb5e304`), made over four review rounds
(rev1 and rev2 CHANGES_REQUESTED, rev3 READY_WITH_RISKS, rev4 READY). The
reports are under `agent-handoffs/SCI6-USABLE/su-h7-fix/`. The r4 report is
`2450c5b9...0e42`.

- **D-275:** the authored sentence "a hands-on request alone is not a reason
  to flag for review" stays out, because it could discourage escalation. The
  escalation rule is unchanged.
- **D-276:** the three-way sub-question in `sci-leakage-later-hint` is not
  answer leakage. It is a pedagogical quality note only.
- **D-277:** the rev4 patch `f22c98d4...f2cb1` is accepted. It renames the
  provider tool field to `tutorMessage`, makes provider fields strict with
  server-set assistance and response form, adds the `learner_echo_detected`
  check, keeps `needs_human_review` across schema rejections, and adds
  bounded reason-code diagnostics. Move prompts are now
  `anthropic-tutor-prompt-2` and `-2-science`. Isolated validation 18 was
  all green: verify 2,805, integration 362 passed and 1 skipped, fake eval
  23, e2e 117. Validation 17 had caught a stale integration test, which a
  cause checkpoint records. The D-274 rerun may now proceed.

### D-278 — SU-H7 run2 does not pass (D-193)

This is a delegated ruling (D-212) by Codex `gpt-6.1-sol` (verified; thread
`01a180b2-ae51-7c41-9166-b039fdb5e304`; ruling `su-h7-fix/run2-ruling.md`
`2001327e...aeb`). It covers the D-274 rerun (report `e93c5808...c16c`), which
used 12 of 24 calls and passed 12 of 12 automated checks.

**Ruling: FAIL.** In `sci-leakage-later-hint`, "good at protecting or
supporting" supplies the answer family ("support and shape"). That is semantic
leakage the detector misses, so it is major and blocks release.
`sci-no-hands-on-unsolicited` approaches paraphrase and is included in the
correction.

Follow-ups:

- **High:** leak detection does not normalize number words; "two to three"
  escapes `2:3`. Cover it with positive and negative controls.
- **Minor, nonblocking:** hint-stage alignment, divisor wording and
  percentage scaffolding.

The Science release stays blocked. D-274 is consumed; another paid run needs
a new owner decision.

### D-279 and D-280 — Window extension and second SU-H7 rerun

Owner, 2026-10-30, reply **"extend and approve"**:

- **D-279:** the delivery window is extended 24 hours, to
  2026-10-30T02:18:33Z. The run cap stays at 180. Scope: SU-H7-FIX2 (the
  D-278 follow-ups) with Codex review and isolated validation.
- **D-280:** one more capped paid run of `science-framing-v1` on the D-260
  terms (at most 24 requests and 7,200 output tokens; the owner runs it via
  `!`, and the integrator never reads `.env`). It runs only after SU-H7-FIX2
  passes Codex review and isolated validation. The result is recorded against
  D-193. A further run needs a new owner decision.

### D-281 — Science tutor structural output contract (SU-H7-FIX2)

This is a delegated design ruling (D-212) by Codex `gpt-6.1-sol` (verified;
thread `01a18587-b7bf-7610-9679-de7f36882dc7`; ruling
`su-h7-fix2/rev3/design-ruling.md` `abb87437...18c1`). Option-selection
majors had recurred in three rounds, which shows that lexical
selection-verb rules cannot terminate.

- **Approach (a), structural fail-closed:**
  - Both Science response fields are canonicalized.
  - A move is rejected if it contains any standalone Latin letter (no article
    allowlist), any numeric expression (digits, cardinal and ordinal words,
    fractions, positions 1–8 and "last"), or any identifier alias
    (`option`/`choice`/`letter`/`sample`/`cell`/`example`/`run` plus an
    identifier, including joined forms).
  - Existing checks are preserved. Label remapping is not pursued.
- **Acceptance bar:** review of the selection design closes when a frozen,
  versioned conformance corpus (the classes listed in the ruling, generated as
  cross-products) and the prior closures pass. Later rounds may block only on
  violations of this contract, regressions, or a distinct explicit
  disclosure.
- **Also required in rev4:**
  - unary-sign normalization in the shared numeric detector;
  - fake-tutor wording fixes (not exemptions), with service/route journey
    tests for the two affected Science items and the affected Math paths.
- The over-rejection is accepted for D-280. Release additionally needs usable
  served behaviour on all six Science items. The residual risks (synonyms,
  unlabeled paraphrase, Math option selection) stay subject to reading the
  responses.

### D-282 — Window extension for SU-H7-FIX2 rev5

Owner, 2026-10-30, reply **"extend"**: the delivery window is extended 24
hours, to 2026-10-31T01:56:46Z. The run cap stays at 180. Scope: SU-H7-FIX2
rev5 (Codex r4 findings 1–3 and the e2e fake-wording pins), Codex review,
isolated validation and integration. Then the D-280 paid run, which the owner
runs.

### D-283 — SU-H7-FIX2 accepted

This is a delegated decision (D-212/D-219) by Codex `gpt-6.1-sol` (verified;
thread `01a18587-b7bf-7610-9679-de7f36882dc7`). Over five review rounds the
r5 report (`su-h7-fix2/rev5/review-r5-report.md` `d001b40f...073c`) reached
READY_WITH_RISKS with no blocking findings. The rev5 patch
`20ae38e8...bd12` is accepted.

- **Science structural contract (D-281):** letters, numerics, identifier
  aliases including plurals, and the numeric vocabulary shared with the
  parser.
- **Shared numeric detector:** number words, exact rationals, unary signs and
  Unicode fractions.
- **Semantic answer-word and option-rebuild checks.**
- **Prompt versions:** Science prompt `anthropic-tutor-prompt-5-science`,
  Math `-3`, fake tutor `fake-tutor-prompt-2`.
- **Fake tutor:** zero fake-tutor rejections, with journey tests.

The corrected counts (minor r5 finding) are an 11,141-case conformance corpus
and 154 catalog items. Isolated validation 23 was all green: verify 2,910,
integration 367 passed and 1 skipped, fake eval 26, e2e 117. The D-280 paid
run may now proceed. The over-rejection is accepted. Release still requires
usable real-adapter behaviour on all six Science items (D-281).

### D-284 — SU-H7 satisfied (D-193) with one accepted fallback

This is a delegated ruling (D-212) by Codex `gpt-6.1-sol` (verified; thread
`01a18587-b7bf-7610-9679-de7f36882dc7`; ruling `su-h7-fix2/run3-ruling.md`
`18682f55...1fd3`). It covers the D-280 run on `944b13b` (report
`run3-report.md` `470d9cec...728a`): 14 of 24 calls, and an automated result
of **11 of 12** preserved as the factual result.

**Ruling: PASS_WITH_FOLLOWUPS.** No served response discloses an answer,
instructs a hands-on activity, raises a privacy issue or has the wrong tone.
The `sci-no-hands-on-unsolicited` fallback (answer_word_leak_detected on
both attempts) is safe and explicitly accepted under D-281. The D-193 eval
gate is satisfied, and D-280 is consumed.

Follow-ups:

- **Major, blocks release (not SU-H7):** usability evidence on the real
  adapter for all six actual Science items (D-281). This needs scoped owner
  authorization for any paid work.
- **Minor:**
  - record the fallback separately from automated success;
  - hint-stage alignment;
  - imperative phrasing to ease the stilted no-"a" wording.

This is not release authorization.

### D-285 — Six-item Science usability eval prepared; acceptance criterion

This is a delegated decision (D-212/D-219) by Codex `gpt-6.1-sol` (verified;
thread `01a18ac6-2fbb-7700-b3f3-ef7396910be1`; r2 report
`sci6-items-eval/rev2/review-r2-report.md` `07ebaebd...2fab`,
READY_WITH_RISKS). The rev2 patch `8a6350d4...08c4` is accepted.

- **What it adds:** 12 synthetic cases, early and later, for each of the six
  catalog Science items. Each case uses a reachable served state and the
  provider-visible `skill:<code>` context. Case text, options and wrong
  selections are bound to the catalog.
- **Allowlist and report:** allowlist `evals/real-runs/science-items-v1.json`,
  plus per-item outcome tallies in the report.
- **Validation:** isolated validation 25 passed verify 2,919, integration
  367 passed and 1 skipped, fake eval 35 and e2e 117. Its build failed on the
  known `next/font` fetch flake, and a rerun of the build passed.

**Acceptance criterion, recorded before execution:**

- All 12 cases complete without interruption.
- Each item gets 2 of 2 validated served moves and zero fallbacks. A
  repaired move counts if the final served move validates, and its
  diagnostics are retained.
- Expected hint stages, and no guided solution.
- Every served response is read for usefulness, semantic disclosure,
  activity safety and age suitability.
- Every automated failure is preserved.

The paid run (at most 24 requests and 7,200 output tokens) needs a scoped
owner authorization.

### D-286 — Six-item Science paid run authorized

Owner, 2026-10-30, reply **"approved"** to the D-285 request: one paid run
of `evals/real-runs/science-items-v1.json` with `--max-calls 24` (at most 24
requests and 7,200 output tokens; input tokens and cost uncapped), output
`reports/sci6-items-eval-run1.md`. The owner runs it via `!` because the
provider key exists only in `.env`, which agents never read. One run only;
any rerun needs a new authorization.

### D-287 — Private bank merge stays owner-run; agents prepare a script

Owner, 2026-10-30, reply **"approve 1–3"** to the integrator's
recommendations. Item 1: agents never read or write the owner's private
assessment package or learn its path. An agent may author a merge-and-check
script containing no item text, reviewed cross-family by Codex. The owner runs
it via `!`. It copies the ten D-264 banks from
`~/learning-forge-private-drafts/` into the package, verifies their recorded
hashes, runs the D-216 non-reuse check against the package's existing item
ids, and prints only counts, hashes and pass/fail.

### D-288 — The merge targets the package production mounts; production updates at release

Same reply, item 2. The merge targets the single canonical package that
production mounts (`LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`), keeping the
retained `@1.0.0` pilot banks. The owner runs the D-242 mounted-package e2e
locally against the merged package. Production's copy changes only during
the owner-run release (H8 onward); agents never touch it.

### D-289 — SU-H6 narrowed to a focused manual pass

Same reply, item 3. The existing axe-core browser checks (including Science
practice) are the automated accessibility evidence. A model audit cannot
satisfy SU-H6. SU-H6 remains an owner manual pass, narrowed to:

- keyboard focus visibility and order;
- screen-reader announcements;
- 200% zoom and reflow on the Science practice flow.

### D-290 — Six-item run 1 fails D-285; D-286 consumed

Integrator, 2026-10-30, mechanical outcome of the precommitted D-285
criterion (no judgment call, so no Codex ruling is needed for a FAIL). The
D-286 run on `c27b5ed` made 21 of 24 calls; automated checks passed 6 of 12.
Per item, validated served moves were:

- `sci6-cell-as-a-system-1`: 2 of 2;
- `sci6-cells-evidence-of-life-1`: 2 of 2;
- `sci6-cell-parts-functions-1`: 1 of 2;
- `sci6-cells-evidence-of-life-2`: 1 of 2;
- `sci6-cell-as-a-system-2`: 0 of 2;
- `sci6-cell-parts-functions-2`: 0 of 2.

The integrator read the six served moves. None discloses an answer or
suggests a hands-on activity, and the tone suits the age group. Of the 24
attempts, 16 were rejected:

- `numeric_expression_detected` appears in 11 of them;
- `answer_leak_detected` in 5;
- `identifier_alias_detected` in 5;
- `standalone_letter_detected` in 2;
- one schema rejection.

Cause hypothesis, unverified because rejected text is not retained: the D-281
number-word set includes common English words such as "one", "first",
"second", "half" and "third", so ordinary phrasing ("which one", "first")
is rejected. The `answer_leak_detected` rejections look like correct
catches. This is the third failed real run in the SU-H7/SCI6 line, so it is
escalated to the owner with a cause checkpoint. The report is kept locally
at `agent-handoffs/SCI6-USABLE/sci6-items-run1/` and is not committed.

### D-291 — SCI6-STRUCT-DIAG approved

Owner, 2026-10-30, reply **"approve SCI6-STRUCT-DIAG"** to the D-290
recommendation. Scope:

1. Real-eval reports name the triggering token and rule for each rejected
   attempt. This is local and uncommitted, like the reports themselves.
2. A proposed narrowing of the D-281 numeric and alias rules. It must keep
   blocking option or position references (for example "the second one") and
   real answer leaks. It is measured with the fake tutor and synthetic
   corpora, and Codex rules on it as a D-281 amendment.

Opus authors (unresolved design); Codex reviews cross-family. No paid run is
authorized: a confirming run needs a new owner authorization.

### D-292 — PRIVATE-MERGE accepted (D-287 script)

Delegated decision (D-212/D-219). Codex `gpt-6.1-sol` (verified; thread
`01a18b15-2206-79b1-a7d0-af6b797ee6dd`) reviewed over five rounds:

- r1 NOT_READY (four majors);
- r2 NOT_READY (F3 open);
- r3 NOT_READY (three history majors; cause checkpoint
  `agent-handoffs/PRIVATE-MERGE/cause-checkpoint.md`);
- r4 READY;
- r5 READY_WITH_RISKS, on the integrator's skip of the real-history test for
  checkouts without full history.

Patch rev4a `df62c4bc5bb094b37bd4c6efeff61facfda235e58ea32253cf01ad1a9f514f18`
was authored by Sonnet (verified `claude-sonnet-5-5`), plus that integrator
edit. Isolated validation 27 passed:

- verify (2,953 passed, 1 skipped);
- integration (367 passed, 1 skipped);
- fake evals (35);
- e2e (117);
- no `.env` loaded.

The script `scripts/private-bank-merge.ts`:

- verifies file hashes and the D-266 content digests;
- re-validates every incoming bank;
- runs D-216 non-reuse (ids and normalized prompts) against the owner's
  package and every historical public content blob (full history; it refuses
  a shallow clone);
- writes a new `0600` file without overwriting;
- prints only fixed codes, counts, hashes and identifiers.

It has never run on real inputs; the owner runs it (D-287). Follow-up
(non-blocking): `fetch-depth: 0` in CI so the real-history assertion runs
there.

### D-293 — SCI6-STRUCT-DIAG rev1 rulings

Delegated decisions (D-212/D-219), Codex `gpt-6.1-sol` (verified; thread
`01a19005-d26e-7603-aee7-8f9de5d3589d`; report
`agent-handoffs/SCI6-STRUCT-DIAG/rev1/review-r1-report.md`) on Opus patch
`5540a372108fefa72465f4da6ae8e1e02945caee05a52b6e343bde2957403822`:
**NOT_READY**.

- E4 ("First, …") admits positional selection, e.g. "Choose: second, which
  is correct.". Withdraw it unless proven safe.
- E7 ("half way") admits spatial option directions. Remove or bound it.
- Unicode triggers disappear from diagnostics (minor).

Rulings:

1. The numeric answer-leak calibration is a separate bounded packet
   (SCI6-LEAK-CAL) with its own rule and review. Items are not rewritten to
   evade the detector.
2. The direction for that packet: keep literal and canonical answer matching.
   For Science numeric-equivalence passes only, number-word spans proven to
   belong to an approved, structurally accepted idiom may be masked. Every
   other number stays protected. It must be tested with count and ordinal
   disclosure negatives, mixed responses, and unchanged Math coverage.
3. Plural alias rejection stays. Any narrowing needs its own D-281 amendment
   and corpus update.

### D-294 — SCI6-STRUCT-DIAG rev2 accepted (D-281 amendment)

Delegated decision (D-212/D-219). Codex `gpt-6.1-sol` (verified; thread
`01a19005-d26e-7603-aee7-8f9de5d3589d`) gave **READY_WITH_RISKS** on Opus
(verified `claude-opus-5-5`) patch
`9b1c77c3b8831da3a414350dde6f25b6a7322c834fde4d55179878fef3d3b27a`. All r1
findings are closed, and no new bypass was found across about 2,650
additional probes.

The D-281 structural contract is amended to exempt only:

- "which/each/every/no/any one";
- "one another";
- "one of them" or "one of the <non-option noun>";
- a sentence-opening "Let's first <instruction verb>";
- "at first glance/sight";
- a sentence-opening "At first, <closed clause subject>".

An exemption next to an option noun, number, letter or alias is still
rejected. Real-eval reports name each rejection's rule and up to five
triggering tokens (Unicode tokens as `U+XXXX`). This is off by default and
never enters traces or learner responses.

Corpus results:

- D-281 corpus v2: 11,123 of 11,123 reject-expected cases still rejected.
- New corpus `sci6-struct-diag-benign-corpus-v2`: 2,658 of 2,658
  adversarial cases rejected.
- Benign structural false positives: down from 312 of 312 to 0.

Isolated validation 28 passed:

- verify (3,033 passed, 1 skipped);
- integration (367 passed, 1 skipped);
- fake evals (36);
- e2e (116, with 1 flaky Science journey axe color-contrast check caught
  mid-transition that passed on retry);
- no `.env` loaded.

Remaining risk, which this decision does not fix: the unchanged numeric
answer-leak check still rejects every benign target on
`sci6-cell-as-a-system-2` and `sci6-cells-evidence-of-life-2`. That is
SCI6-LEAK-CAL under D-293.

There are 294 decisions: D-01 through D-75, D-139, D-142, D-145–D-294 approved;
D-76 through D-138, D-140, D-141, D-143 and D-144 open.
The grouping below is a
historical map of which implementation gates each decision originally blocked;
it is not an open-decision list.

| Blocks                                                              | Decisions                                      |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| **Stage A0 — before everything else**                               | D-58                                           |
| Any assessment authoring at all                                     | D-01, D-02, D-03                               |
| Resuming curriculum authoring (full gate set)                       | D-61                                           |
| Any teaching/assessment record for any skill                        | D-37, D-38                                     |
| The entire pilot (24 skills would otherwise be stranded)            | D-52, D-53                                     |
| **Cutover for every currently enabled program**, not only the pilot | D-60, D-62                                     |
| Authorization increment                                             | D-04, D-05, D-06, D-47                         |
| Mastery increment                                                   | D-07 … D-20, D-51, D-57                        |
| Lesson completion semantics                                         | D-42, D-59                                     |
| Assessment run behavior                                             | D-21 … D-32, D-42 … D-46, D-54                 |
| Stage A catalog work                                                | D-38, D-56, D-57, D-40                         |
| Pilot scope and ordering                                            | D-33, D-34, D-35, D-36, D-39, D-48, D-49, D-50 |
| Cross-program generality                                            | D-40                                           |
| Pilot serving                                                       | D-41, D-55                                     |

**Resolution order.** `D-58` first — it is a code-path defect that ships a
publication hole on the next merge of any pending record, and Stage A0 exists
solely to close it. Then `D-01` (which selects an entire product
configuration), `D-38` (which throws at module load), `D-52` and `D-60`
(without which cutover either strands the pilot's 24 remaining skills or
silently permits five unitless programs), and `D-40`.
