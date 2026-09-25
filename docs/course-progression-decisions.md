# Course Progression — Authoritative Decision Matrix

- Status: **70 approved; 0 open.** Approved entries are explicitly marked in
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

| Field | Value |
|---|---|
| Kind | security |
| Status | **APPROVED** |
| Recommendation | **Held-out** (strong) |
| Approved value | Branch B — held-out assessment delivery |
| Approver | Product owner + privacy/safety owner |
| Blocks | All assessment authoring; `AssessmentBank`; the lesson/unit completion rules; the entire held-out store decision `D-02` |

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

| Dimension | **Branch A — open-book** | **Branch B — held-out (recommended)** |
|---|---|---|
| Item storage | `content/assessments/<program>/` in this **public** repository, reviewed by pull request exactly as practice is | The store chosen in `D-02`, outside this repository |
| Bank record contents | May list member refs `{contentId, contentVersion}` directly | Metadata only; membership resolved at run time from the held-out store |
| Public site publication | **Never published.** Open-book means the item is *reachable by a determined reader in the repository*; it does not mean the product advertises the bank on a browsable page | **Never published** |
| API exposure | Never lists a bank or an item set; a run returns only the items it currently delivers | Identical |
| Client bundle | Assessment module is server-only | Identical, plus an import-graph test (S4) |
| Delayed check (`DELAYED_CHECK`) | **Available**, but establishes *unassisted performance on a knowable item*. It sets `delayedCheckStatus = PERFORMED`, not `CONFIRMED` | **Available** and establishes independence. Sets `delayedCheckStatus = CONFIRMED` |
| Spaced review (`REVIEW`) | Runs normally; a failure moves `PERFORMED → LAPSED` | Runs normally; a failure moves `CONFIRMED → LAPSED` |
| `HIGH` confidence | **Not reachable.** No evidence path in this branch supports an independence claim. The band exists in the contract but is unreachable, and that must be stated in the UI copy rather than hidden | **Reachable**, and only via `delayedCheckStatus = CONFIRMED` |
| Highest reachable band | `MEDIUM` | `HIGH` |
| Context weights (`D-08`) | Assessment kinds weighted **below** practice-equivalent independence; the approved vector must encode that | Assessment kinds weighted at or above practice |
| Parent wording | "Completed without asking for help, using open materials." Never "independently confirmed" | "Independently confirmed on an unassisted check after a delay" |
| Learner wording | "You finished this on your own." | "You showed you remembered this on your own." |
| Post-run feedback (`D-30`) | Per-item correctness permitted; canonical answers still withheld for reusable items | Identical |
| Branch-specific tests | L14 (wording: no independence claim anywhere), plus L8/L9/L12/L13 | L15 (S1–S4 exclusion surfaces active), plus L8/L9/L12/L13 |
| Tests **skipped** in this branch | L15 | L14 |
| Fixture variant | `fixture-*/assessment-open-book` | `fixture-*/assessment-held-out` |

**Rules that hold in both branches**, and are therefore *not* part of this
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
*different, weaker* product whose top band is `MEDIUM`. That is a
recommendation, not a decision.

**Honest limit, both branches:** delivering an assessment shows its prompt to
that learner at that moment, and the learner's own response is exported to the
parent. Held-out means *not published in advance and not enumerable*, never
*never displayed*.

### D-02 — Held-out assessment store mechanism

| Field | Value |
|---|---|
| Kind | security |
| Status | **APPROVED** |
| Recommendation | **Option A — private reviewed assessment package** (strong) |
| Approved value | Option A — private reviewed assessment package |
| Approver | Product owner + engineering owner |
| Blocks | Assessment authoring; the leakage acceptance tests in `docs/course-progression-architecture.md` §13 |

| Option | Mechanism | Review history | Weaknesses |
|---|---|---|---|
| **A (recommended)** | A separate **private** repository published as a private package (GitHub Packages / private npm) and installed as a server-only dependency. Items load through a server-only `assessmentStore` module. | Full: pull-request review in the private repo, same `docs/content-review.md` gate | Adds a second repository and a package-publish step; private-package auth must be managed in Render |
| **B** | Database-backed assessment store, seeded by an operator-run import from a private, reviewed source | Partial: rows are not diffable, so review must happen on the import source, which must itself be a reviewed repository | Drifts from the "curriculum as reviewed code" precedent (ADR-0006); the import source becomes an unversioned dependency unless it is itself reviewed |
| **C** | Encrypted bundle committed to the public repo, key in the deployment environment | Full, but ciphertext | Ciphertext is permanently public; a future key compromise retroactively exposes every assessment. Not recommended |

**Every option must preserve a human review gate.** An option that stores
assessment items without version history, pull-request review, or an
equivalent auditable approval trail is not acceptable and is deliberately not
listed: `docs/content-review.md` applies to assessment items exactly as it
applies to practice items. The held-out decision changes *where* review
happens, never *whether* it happens.

Whichever is chosen, the **exclusion surfaces** in
`docs/course-progression-architecture.md` §4.3B and their acceptance tests are
mandatory and not separately negotiable.

### D-03 — Treatment of the six existing ratios records under a held-out model

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED** |
| Recommendation | Keep all six public as `practice`; author assessment items fresh in the held-out store |
| Approved value | Keep all six existing ratios records public as practice; author assessment items fresh in the held-out store |
| Approver | Product/content owner |
| Blocks | Pilot record-count estimates (`D-36`) |

The six existing ratios records are already public and already on the
curriculum site. They cannot become held-out retroactively.

---

## B. Authorization, rollout, and safety

### D-04 — Sequencing feature flag default for the live household

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19, confirmed 2026-09-19** |
| Recommendation | Ship enforcement with sequencing **off**, enable after one week of observation |
| Approved value | Ship enforcement with sequencing off; enable sequencing after one week of observation |
| Approver | Product owner |
| Blocks | Cutover plan |

**Not negotiable regardless of this decision:** role and readiness
authorization is always on and fail-closed. The flag governs **unit/lesson
sequencing and its UI only**. It can never disable "an assessment item is
never tutored", "an assessment requires an active run", or household scoping.
See `docs/course-progression-architecture.md` §7.

### D-05 — Acknowledgement: closing the `startSession` bypass removes current access

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Acknowledge and proceed |
| Approved value | Acknowledge and proceed; existing access may be refused until an authored gate opens |
| Approver | Product owner |
| Blocks | Authorization increment |

Today `GET /api/phase1/session?contentId=…` starts a session on any reviewed
item in a program regardless of evidence. Closing it makes content that the
existing live learner can reach today unreachable until its gate opens.

### D-06 — Override re-authentication mechanism

| Field | Value |
|---|---|
| Kind | security |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Password re-entry within a short step-up window before an override is written |
| Approved value | Password re-entry within a short step-up window before an override is written |
| Approver | Product owner + privacy/safety owner |
| Blocks | Parent/operator override (`§9`) |

---

## C. Mastery aggregation parameters

All of these feed the formula in `docs/course-progression-architecture.md` §8.
None may be hard-coded. All live in a versioned `ProgressionPolicyProfile`.

| ID | Symbol | Parameter | Recommendation | Status | Approver |
|---|---|---|---|---|---|
| D-07 | `assistanceWeight[]` | Weight by maximum assistance used | Carry today's documented ladder: `1.00 / 0.90 / 0.75 / 0.55 / 0.35 / 0.10` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-08 | `contextWeight[]` | Weight by assessment context | `delayed_check 1.00`, `unit_assessment 1.00`, `lesson_assessment 0.95`, `review 0.90`, `practice 0.80`, `placement 0.40` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-09 | `ρ` | Repeat-exposure discount per prior exposure to the same item | `0.6` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-10 | `H` | Recency half-life (days) | `30` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-11 | `N` | Aggregation window (most recent observations) | `8` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-12 | `M_med` | Minimum evidence mass for `MEDIUM` | `1.6` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-13 | `K_med` | Minimum independent observations for `MEDIUM` | `2` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-14 | `θ_med` | Minimum estimate for `MEDIUM` | `0.70` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-15 | `θ_gate` | Minimum estimate for a structural unlock gate | `0.75` (today's planner `DEFAULT_SECURE_THRESHOLD`) | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-16 | `θ_relock` | Estimate below which a `CONFIRMED` skill is flagged for early review | `0.55` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-17 | `stalenessDays` | Days without an observation before confidence degrades one band | `45` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-18 | `spacingIntervals[]` | Expanding review intervals (days), replacing the flat 14 | `3 / 7 / 21 / 45` | **APPROVED 2026-09-19** | Product/pedagogy owner |

### D-19 — `Attempt.highestAssistance` correction strategy

| Field | Value |
|---|---|
| Kind | policy |
| Status | **APPROVED 2026-09-19** |
| Recommendation | **Option 2 — derive at read time from `AssistanceEvent`, and drop or ignore the stored column** |
| Approved value | Derive maximum assistance at read time from `AssistanceEvent`; ignore the stored column |
| Approver | Product/engineering owner |
| Blocks | Mastery aggregation; parent evidence; household export |

**Verified defect.** `src/phase1/service.ts:234` writes
`highestAssistance: 'INDEPENDENT'` at attempt creation and **never updates
it**, so the column is permanently `INDEPENDENT` for every attempt in the
database. `src/server/household-data.ts:67` exports that column directly, so
the household data export currently tells a parent that every attempt was
independent. `src/phase1/service.ts:691` works around it by reading
`assistanceEvents[0].level` under `orderBy: { occurredAt: 'desc' }, take: 1` —
that is the **most recent** assistance event, not the **highest**.

| Option | Approach | Trade-off |
|---|---|---|
| 1 | Keep the column and update it whenever an `AssistanceEvent` is appended | Requires the attempt-immutability trigger to permit this one column; muddies the immutability guarantee |
| **2 (recommended)** | Treat `AssistanceEvent` as authoritative and derive `max(level)` at read time; stop selecting the stored column anywhere | One correct source; no immutability exception; needs an index and a read-path change everywhere the column is used |
| 3 | Add a separate append-only projection table | Correct but heavier than the problem warrants at this scale |

Either way, `docs/course-progression-architecture.md` §8.2 specifies **maximum
by assistance-level ordinal**, never "most recent".

### D-20 — Recalculation and cutover for the new `algorithmVersion`

| Field | Value |
|---|---|
| Kind | policy |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Shadow-compute the new version alongside the old, compare, then switch the active pointer; never mutate existing rows |
| Approved value | Shadow-compute the new version alongside the old, compare, then switch the active pointer; never mutate existing rows |
| Approver | Product/engineering owner |
| Blocks | Mastery increment |

The new aggregation changes the meaning of every existing `MasteryEstimate`
row for the live household.

---

## D. Delayed checks, placement, skip, remediation, reassessment

| ID | Parameter | Recommendation | Status | Approver |
|---|---|---|---|---|
| D-21 | `minDelayHours` — minimum separation from the last instruction or assistance event for that skill | `20` (next calendar day) | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-22 | `placementProbeMaxItems` | `5` (today's cap) | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-23 | `lessonAssessment.itemsPerAttempt` | `3` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-24 | `lessonAssessment.passBar` — correct items required out of `itemsPerAttempt` | `3 of 3` at independent assistance | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-25 | `unitAssessment.itemsPerAttempt` | `6` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-26 | `unitAssessment.passBar` | `5 of 6` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-27 | `maxReassessments` — consecutive reassessments before routing to a parent-visible "needs help" state | `2` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-28 | `reassessmentCooldown` | one completed practice session **and** `12` hours | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-29 | `assessmentRunExpiry` — how long an `IN_PROGRESS` run stays valid before `EXPIRED` | `24` hours | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-30 | `feedbackLevel` after a scored run | `PER_ITEM_CORRECTNESS` without revealing correct answers | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-31 | Skip bar — evidence required to mark a lesson `COMPLETE_BY_SKIP` | Pass the lesson assessment bank at `D-24` on the **first** run, with no prior teaching or practice event for that skill | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-32 | Unit skip bar | Pass the unit assessment at `D-26` on the first run | **APPROVED 2026-09-19** | Product/pedagogy owner |

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

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Render completion and mastery as two separate, separately-labeled facts; never merge them into one "done" state |
| Approved value | Render completion and mastery as two separate, separately-labeled facts; never merge them into one "done" state |
| Approver | Product owner |
| Blocks | Parent evidence increment |

A learner can complete a lesson with assistance without mastering its skill,
and can master a skill without completing its lesson (via skip). See
`docs/course-progression-architecture.md` §6.4.

### D-34 — Pilot unit lesson count

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | `3`, staged one lesson at a time; the approved bound is 2–4 |
| Approved value | 3, staged one lesson at a time |
| Approver | Product owner |
| Blocks | Pilot scope |

### D-35 — `ratio-tables → unit-rates` prerequisite edge

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Re-audit and most likely **remove or narrow** the edge |
| Approved value | Remove `unit-rates` from the `ratio-tables` skill prerequisite list. The pilot lesson order remains authored separately; `ratio-tables-2` may use a narrower readiness reference only if it remains inside the approved skill closure. |
| Approver | Product/content owner (explicit authorization in chat) |
| Blocks | Pilot lesson ordering |

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

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-20** |
| Recommendation | See `D-48`, `D-49`, `D-50`, and `D-42`, which are the actual independent inputs |
| Approved value | For the initial three-lesson Grade 6 Math pilot: one teaching record per lesson; six practice records per lesson (four threshold items plus two remediation headroom items); two review records per skill; nine held-out lesson-assessment items per lesson and eighteen held-out unit-assessment items, derived from the approved no-reuse reassessment policy. Revisit volumes after live pilot observation; any expansion remains separately reviewed. |
| Approver | Product/pedagogy owner (explicit approval in chat) |
| Blocks | Authoring volume |

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

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Permit relabelling all 128 existing reviewed records to `role: "practice"` without re-review, as a mechanical migration |
| Approved value | Relabel all 128 existing reviewed records to `role: "practice"` without re-review as a mechanical migration |
| Approver | Product/content owner (explicit approval in chat) |
| Blocks | Role increment |

### D-38 — Replacing the exact-two-records-per-skill invariant

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Replace with role- and program-aware validation (`docs/course-progression-architecture.md` §11.2) |
| Approved value | Replace with role- and program-aware validation |
| Approver | Product/content owner + engineering owner |
| Blocks | Any teaching or assessment record for any skill |

**Verified context.** `src/content/catalog.ts` enforces
`REQUIRED_RECORDS_PER_SKILL = 2` and throws
`"<skill> must have exactly 2 content records, found <n>"` **at module load**.
Adding a single teaching record to any ratios skill would therefore crash the
application at import time. Three program self-audit tests
(`tests/content/catalog.test.ts`, MOEMS / AMC 8 / MATHCOUNTS) additionally
assert `expect(records).toHaveLength(2)` and
`expect(new Set(records.map((item) => item.prompt)).size).toBe(2)`.

### D-39 — Whether real `Attempt.elapsedSeconds` capture is in scope

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-20** |
| Recommendation | Separate increment; the delay window does **not** depend on it |
| Approved value | Defer real elapsed-time capture to a post-pilot increment. Keep the current non-evidence value out of mastery calculations, parent claims, and release gates. Revisit after live Grade 6 Math observation. |
| Approver | Product/engineering owner (explicit approval in chat) |
| Blocks | Nothing in the progression critical path |

`Attempt.elapsedSeconds` is hardcoded to `0` in `createAttempt`.

### D-40 — Program registry replacing `PROGRAM_ROSTER`

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED** |
| Recommendation | Introduce a versioned `Program` registry record and derive `PROGRAM_ROSTER` and `CurriculumProgramSchema` from it |
| Approved value | Introduce a versioned `Program` registry and derive the roster and program schema from it |
| Approver | Product/engineering owner |
| Blocks | Cross-program generality (`§12`) |

### D-41 — Screen-reader human review scope

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | One manual screen-reader pass over the progression surfaces before the pilot serves a learner; axe automation is not sufficient for live-region and focus-order quality |
| Approved value | One manual screen-reader pass over progression surfaces before serving a learner |
| Approver | Accessibility/product owner |
| Blocks | Pilot serving |

---

## F. Policy keys added after the second review

These close gaps the second independent review identified: policy keys the
architecture referenced or implied without a decision entry.

| ID | Policy key | Parameter | Recommendation | Status | Approver |
|---|---|---|---|---|---|
| D-42 | `lessonMinPracticeItems` | Distinct practice items a learner must attempt before a lesson's practice threshold is met | `4` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-43 | `delayedCheckItemsPerAttempt`, `delayedCheckPassBar` | Items presented in a delayed check, and how many must be correct | `2` items, `2 of 2` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-44 | `delayedCheckReuse` | Whether a delayed check may reuse an item the learner has seen for that skill | **No reuse** — unseen items only | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-45 | `reviewItemsPerAttempt`, `reviewPassBar` | Items presented in a spaced review, and how many must be correct | `1` item, `1 of 1` | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-46 | `reviewReuse` | Whether a review may reuse a previously seen item, and after what interval | Reuse permitted only for items not seen within the last two spacing intervals | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-47 | `stepUpReauthLifetimeMinutes` | How long a step-up re-authentication remains valid for writing overrides | `10` minutes, single-use per override | **APPROVED 2026-09-19** | Product owner + privacy/safety owner |
| D-48 | `teachingRecordsPerLesson` | Teaching records authored per lesson | `1`, with a second alternative representation optional | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-49 | `practiceRecordsPerLesson` | Practice records authored per lesson | At least `D-42` plus headroom for remediation on unseen items | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-50 | `reviewRecordsPerSkill` | Review-role records authored per skill | `2`, so a review need not repeat the item that confirmed the skill. **Amended to `3` by `D-67` (2026-09-24)** | **APPROVED 2026-09-19** | Product/pedagogy owner |
| D-51 | `difficultyWeight[]` | Whether item difficulty modifies evidence weight, and if so how | **Do not weight by difficulty in the first version.** Keep `difficultyWeight` absent rather than set to 1.0, so its absence is a recorded choice rather than a silent default | **APPROVED 2026-09-19** | Product/pedagogy owner |

| D-59 | `allowAssistanceInPractice` | Whether assistance-supported practice counts toward a lesson's practice threshold | `true` — completion may be earned with help; mastery is what assistance discounts | **APPROVED 2026-09-19** | Product/pedagogy owner |

`D-24` and `D-26` remain the ordinary lesson and unit assessment pass bars.
`D-07` remains the sole authority for assistance weights; the table in
`docs/02-curriculum-and-pedagogy.md` is the historical product hypothesis and
is superseded by `D-07` for every progression purpose.

---

## G. Partial-program rollout

### D-52 — Rollout mode for a program that is only partly unitised

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED** |
| Recommendation | **Option H — hybrid mode with a named legacy compatibility policy** |
| Approved value | Option H — hybrid mode with a named legacy compatibility policy |
| Approver | Product owner + engineering owner |
| Blocks | The entire pilot; without this, 24 of 27 Grade 6 Math skills are stranded |

**Verified context.** `grade-6-math` has **27** skills. The proposed pilot unit
covers **3** (`ratio-language`, `unit-rates`, `ratio-tables`). If authorization
becomes fail-closed and only unit-covered targets are grantable, the other
**24 skills become unreachable** — a regression for the live learner, not a
gate.

| Option | Mechanism | Trade-off |
|---|---|---|
| **H (recommended)** | `grade-6-math` carries units for the pilot skills. The other 24 skills are reachable through an explicit, authored, versioned **legacy compatibility policy** (`D-53`) that grants practice-only activity on skills no unit claims. | One program, one evidence stream, no duplicated skill codes. Requires the legacy policy to be a real authored artifact, not a fallback |
| **I** | A separate pilot program (for example `grade-6-math-ratios-pilot`) with its own prefixed skill codes; `grade-6-math` is untouched and keeps today's behavior wholesale. | Simplest isolation, but duplicates three skills, splits the learner's evidence for the same concepts across two programs, and makes the pilot's results not directly transferable to `grade-6-math` |

**Why hybrid is recommended:** option I duplicates skill codes for concepts the
learner already has evidence for, and program isolation then means that
evidence does not transfer — so the pilot would measure a learner who appears
to have never seen ratios. That is a recommendation, not a decision.

### D-60 — Access policy for **every** progression mode, including `skill-graph-only`

| Field | Value |
|---|---|
| Kind | security |
| Status | **APPROVED** |
| Recommendation | Every program references an explicit, versioned `AccessPolicy`; there is no mode that is implicitly permissive |
| Approved value | Every program references an explicit, versioned `AccessPolicy`; missing or invalid policy grants nothing |
| Approver | Product owner + engineering owner |
| Blocks | Cutover (Stage C4) for **all** currently enabled programs, not only the pilot |

`D-52`/`D-53` covered the hybrid remainder. They did not cover the five
programs that will still be `skill-graph-only` at cutover — Math Kangaroo,
MOEMS, AMC 8, MATHCOUNTS, and Scripps. Leaving those implicitly permitted
reintroduces exactly the missing-state fallback this work exists to remove.

| Mode | Required policy reference | Recommended grants |
|---|---|---|
| `skill-graph-only` | `accessPolicyRef` — required, non-null | `PRACTICE`, `PLACEMENT`, `REVIEW`, and `DELAYED_CHECK` only where the program already declares a readiness contract; never `LESSON_ASSESSMENT`/`UNIT_ASSESSMENT`, which have no bank or bar in this mode. Prerequisite graph and existing per-item contest-readiness contracts are honored |
| `hybrid` | `accessPolicyRef` for unit-covered targets **and** `legacyCompatibilityPolicyRef` for the remainder (`D-53`) | As `D-53` |
| `unit-sequenced` | `accessPolicyRef` | Full progression grants |

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

| Field | Value |
|---|---|
| Kind | security + product |
| Status | **APPROVED** |
| Recommendation | An authored, versioned policy profile granting `PRACTICE`, `PLACEMENT`, and `REVIEW` only — never `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, or `DELAYED_CHECK` — on skills claimed by no unit, subject to the existing prerequisite graph |
| Approved value | Authored, versioned policy granting only `PRACTICE`, `PLACEMENT`, and `REVIEW` for skills claimed by no unit |
| Approver | Product owner + engineering owner |
| Blocks | Hybrid rollout |

This must be an **explicit authored grant**, never a missing-state fallback.
Authorization denies unless some authored policy grants; "no policy covers this
target" is a denial, not a permission. See
`docs/course-progression-architecture.md` §7.5.

---

## H. Assessment record model and audit

### D-54 — Duplicate assignment-creation behavior

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | **Idempotent replay on a matching idempotency key; reject on a different key while an active assignment exists** |
| Approved value | Idempotent replay on a matching idempotency key; reject with `ACTIVE_ASSIGNMENT_EXISTS` on a different key while an active assignment exists |
| Approver | Product/engineering owner |
| Blocks | `AssessmentAssignment` implementation |

The architecture specifies one consistent behavior
(`docs/course-progression-architecture.md` §6.4): a repeated request carrying
the **same** idempotency key returns the existing assignment unchanged; a
request carrying a **different** key while an assignment for the same target is
`PENDING` or `IN_PROGRESS` is rejected with `ACTIVE_ASSIGNMENT_EXISTS`. This
entry exists in case the product prefers reject-always, which would make a
double-clicked button an error rather than a no-op.

### D-55 — Child-safe phrase and rubric artifact

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-19** |
| Recommendation | A versioned `child-safe-phrasing` artifact holding approved phrasings and a prohibited-pattern list, reviewed like content and referenced by version from the wording test |
| Approved value | A versioned `child-safe-phrasing` artifact with approved phrasings and prohibited patterns, reviewed like content |
| Approver | Product owner + accessibility/product owner |
| Blocks | Acceptance test E10 |

Without a versioned artifact, "child-safe wording" is a snapshot test against
whatever text happened to ship.

### D-56 — Disposition of the 18 content/skill prerequisite mismatches

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Treat the skill graph as authoritative; remove or re-type every content-level prerequisite list in Stage A; re-audit the eight edges that differ substantively |
| Approved value | Skill graph is authoritative; remove all legacy content prerequisite lists. Preserve only narrower `itemReadinessRefs` that are already inside the owning skill's prerequisite closure; discard self-references and out-of-closure references. This resolves the six substantive edge disagreements without adding new skill dependencies. |
| Approver | Product/content owner (explicit authorization in chat) |
| Blocks | Stage A |

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

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED** |
| Recommendation | Add a required `version` to `SkillSchema` so skill references can be pinned like every other reference |
| Approved value | Add a required `version` to `SkillSchema` |
| Approver | Product/engineering owner |
| Blocks | Version pinning on mastery, review schedules, and item selections |

`SkillSchema` currently has no `version` field, so a skill reference cannot be
pinned and a skill's meaning can change under existing evidence silently.

### D-58 — Publication scope of the public curriculum site

| Field | Value |
|---|---|
| Kind | security |
| Status | **APPROVED** |
| Recommendation | Publish a **reviewed teaching-and-practice projection only**; fix the code path **before Stage A** as Stage A0 |
| Approved value | Reviewed teaching-and-practice projection only; Stage A0 shipped on 2026-09-19; no current unreviewed-content leak evidenced |
| Approver | Product owner + privacy/safety owner |
| Blocks | Stage A, and any change to the site generator |

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

| Field | Value |
|---|---|
| Kind | product |
| Status | **APPROVED 2026-09-19** |
| Recommendation | Architecture approval alone is **not** sufficient; the set below must be satisfied |
| Approved value | All listed independent-review, publication, exposure, content, registry, rollout, and stage-merge gates must be satisfied before authoring resumes |
| Approver | Product/content owner + engineering owner |
| Blocks | Lifting the authoring pause |

Resuming role-based authoring requires **all** of:

| Requirement | Why |
|---|---|
| Independent review passed and architecture approved | Baseline |
| `D-58` resolved **and Stage A0 shipped** | Otherwise a new `pending_review` record is published on merge |
| `D-01` resolved | Determines whether assessment items may be authored in this repository at all |
| `D-02` resolved | Required only if `D-01` = Branch B, before the first assessment record crosses into the store |
| `D-03` resolved | Disposition of the six existing ratios records |
| `D-37`, `D-38` resolved | Role labelling, and the exactly-two invariant that throws at module load |
| `D-56`, `D-57` resolved | Prerequisite remediation and `Skill.version`, both of which change the record shape |
| `D-40` resolved | The program registry that role and prefix validation reads |
| `D-52` resolved, plus `D-53` if hybrid | Otherwise authoring targets a structure whose access model is undecided |
| **Stage A0 and Stage A1 merged** | The role schemas and validators must exist before a record can be authored against them |

Authoring **practice-role** content for an existing program under the current
uniform schema may be unpaused earlier, by explicit product-owner decision,
once `D-58`/Stage A0 is done — that narrower option should be recorded here
rather than assumed.

### D-62 — Assessment-assignment requirement for placement and review

| Field | Value |
|---|---|
| Kind | security + product |
| Status | **APPROVED 2026-09-22** |
| Recommendation | Lesson, unit, and delayed-check activity always requires an active assessment assignment. Placement and review require one only for skills an authored unit claims; skills claimed by no unit keep assignment-free placement and review under their access policy |
| Approved value | As recommended |
| Approver | Product owner (explicit authorization in chat, following independent-review finding M2) |
| Blocks | Stage C4 cutover |

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

| Field | Value |
|---|---|
| Kind | content + policy |
| Status | **APPROVED 2026-09-23** |
| Recommendation | A dedicated held-out delayed-check bank per pilot skill, sized `delayedCheckItemsPerAttempt × (1 + maxReassessments)` = 2 × 3 = **6 items** per skill (arithmetic from `D-43`/`D-27`), so the lesson banks' no-reuse pools stay intact |
| Approved value | As recommended |
| Approver | Product owner (in chat) |
| Blocks | Serving `DELAYED_CHECK` assignments |

### D-64 — Placement probe item source

| Field | Value |
|---|---|
| Kind | content + policy |
| Status | **APPROVED 2026-09-23** |
| Recommendation | Placement assignments select from reviewed public **practice** items (up to `D-22`), as today's diagnostic does. The evidence is weak by design (`contextWeight[placement]`, `D-08`), so open-book is acceptable. Probed items count as exposure |
| Approved value | As recommended |
| Approver | Product owner (in chat) |
| Blocks | Serving `PLACEMENT` assignments |

### D-65 — Same-sitting independent check

| Field | Value |
|---|---|
| Kind | product + security |
| Status | **APPROVED 2026-09-23** |
| Recommendation | Authorize today's same-sitting "independent check" as independent `PRACTICE`, not `DELAYED_CHECK`, because it has no elapsed-time separation. It then survives C4 for legacy and skill-graph-only skills, while pilot skills rely on the genuine delayed-check assignment |
| Approved value | As recommended |
| Approver | Product owner (in chat) |
| Blocks | Stage C4 cutover |

### D-66 — Authoring exception for held-out review and delayed-check drafts

| Field | Value |
|---|---|
| Kind | content |
| Status | **APPROVED 2026-09-23** |
| Recommendation | A narrow exception to the `D-61` authoring pause: model-assisted drafts of the pilot's held-out review (`D-50`) and delayed-check (`D-63`) items, written only to the private package outside this repository and marked `pending_review`. Serving still requires the full content, originality, accessibility, and child-safety review |
| Approved value | As recommended |
| Approver | Product owner (in chat) |
| Blocks | — (the `D-61` pause otherwise remains in force) |

### D-67 — Review reuse versus review volume

| Field | Value |
|---|---|
| Kind | policy + content |
| Status | **APPROVED 2026-09-24** |
| Recommendation | Amend `D-50` to **3** review items per skill and publish `grade-6-math-default@1.1.0` with `reviewReuse: { enabled: true, minIntervalsSinceSeen: 2 }` |
| Approved value | As recommended. "Not seen within the last two spacing intervals" (`D-46`) is implemented as: an item assigned in either of the skill's two most recent review runs is excluded. A run counts whether or not it was scored |
| Approver | Product owner (in chat) |
| Blocks | Serving more than two reviews per skill |

**Why.** Three sources disagreed:

- `D-46` permits reuse of items not seen within the last two spacing intervals.
- The `grade-6-math-default@1.0.0` profile disables review reuse entirely.
- `D-50` authors only 2 review items per skill.

At 1 item per review (`D-45`), that supported only two reviews per skill. Three items with reuse after two runs let reviews rotate indefinitely without repeating a recent item. `1.0.0` remains for historical resolution.

Delayed-check exhaustion, including by abandoned or expired runs, is decided
in `D-69`.

### D-68 — Placement position rule

| Field | Value |
|---|---|
| Kind | policy |
| Status | **APPROVED 2026-09-24** |
| Recommendation | Probe one item per unit skill, in lesson order. Place the learner at the first lesson whose probe item is incorrect; earlier lessons become `SKIPPED_BY_PLACEMENT` (weak evidence, never mastery; §9.3). If every item is correct, place the learner at the unit assessment |
| Approved value | As recommended, **amended 2026-09-24**: if every item is correct the learner is placed at the **final lesson** (`AVAILABLE`) with earlier lessons `SKIPPED_BY_PLACEMENT`. This keeps architecture §6.6 and U37: placement is weak evidence and never unlocks the unit assessment |
| Approver | Product owner (in chat) |
| Blocks | Serving `PLACEMENT` assignments |

**Implementation (2026-09-24).** One probe item is drawn per unit skill, in
lesson order, using the first authored reviewed practice item for that skill
(`D-64`). A missing or incorrect item counts as missed. Only lessons that have
not started change: an earlier lesson becomes `SKIPPED_BY_PLACEMENT` and the
placed lesson becomes `AVAILABLE`. Each probe writes a `LearnerPlacement`
record. Placement never writes mastery or delayed-check status, carries no
reassessment limits, and, per §9.3, is not gated by prerequisites.

### D-69 — Exhausted or capped delayed checks

| Field | Value |
|---|---|
| Kind | policy + product |
| Status | **APPROVED 2026-09-24** |
| Recommendation | See the rule below |
| Approved value | As recommended |
| Approver | Product owner (in chat) |
| Blocks | Stage C4 cutover |

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

| Field | Value |
|---|---|
| Kind | policy + product |
| Status | **APPROVED 2026-09-24** |
| Recommendation | A parent or operator override moves the skill's lessons from `NEEDS_HELP` back to `ACTIVE` remediation and resets the consecutive-failure count |
| Approved value | As recommended. The override requires a `D-06` step-up re-authentication within `D-47`'s single-use lifetime and writes an `OverrideRecord`. A new delayed check still requires unseen items, so it is refused with `NEW_BANK_VERSION_REQUIRED` until a reviewed bank version with unseen items exists. No item is reused |
| Approver | Product owner (in chat) |
| Blocks | Reopening any `NEEDS_HELP` skill; Stage C4 |

**Why it was needed (found by independent re-review, 2026-09-24).** `D-69`
made `NEEDS_HELP` terminal, but the architecture's override (§9.3, `D-06`) sets
`UNLOCKED_BY_OVERRIDE` and has no remediation or mastery effect. Even after an
override, the delayed-check bank has no unseen items (`D-44`) and the
consecutive-failure cap still applies (`D-27`). Reopening therefore needed
decided semantics, for example:

- whether an override resets the consecutive-failure count;
- whether it requires a new delayed-check bank version with unseen items;
- whether it returns the lesson to `ACTIVE` remediation or to `NONE`.

**Implementation status.** `applyNeedsHelpOverride` implements this decision.
It has no HTTP caller yet. Before any caller exists:

- The caller must look up the actor's user, household, and role server-side.
- It must read `D-47`'s lifetime from the pinned profile.
- It must make step-up use atomic, with a unique constraint or consumed token
  and serializable isolation.
- Tests must cover cross-learner scoping, revocation, and latest-override
  ordering.

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

## I. Index of open decisions

Seventy decisions total; all seventy are approved. The grouping below is a
historical map of which implementation gates each decision originally blocked;
it is not an open-decision list.

| Blocks | Decisions |
|---|---|
| **Stage A0 — before everything else** | D-58 |
| Any assessment authoring at all | D-01, D-02, D-03 |
| Resuming curriculum authoring (full gate set) | D-61 |
| Any teaching/assessment record for any skill | D-37, D-38 |
| The entire pilot (24 skills would otherwise be stranded) | D-52, D-53 |
| **Cutover for every currently enabled program**, not only the pilot | D-60, D-62 |
| Authorization increment | D-04, D-05, D-06, D-47 |
| Mastery increment | D-07 … D-20, D-51, D-57 |
| Lesson completion semantics | D-42, D-59 |
| Assessment run behavior | D-21 … D-32, D-42 … D-46, D-54 |
| Stage A catalog work | D-38, D-56, D-57, D-40 |
| Pilot scope and ordering | D-33, D-34, D-35, D-36, D-39, D-48, D-49, D-50 |
| Cross-program generality | D-40 |
| Pilot serving | D-41, D-55 |

**Resolution order.** `D-58` first — it is a code-path defect that ships a
publication hole on the next merge of any pending record, and Stage A0 exists
solely to close it. Then `D-01` (which selects an entire product
configuration), `D-38` (which throws at module load), `D-52` and `D-60`
(without which cutover either strands the pilot's 24 remaining skills or
silently permits five unitless programs), and `D-40`.
