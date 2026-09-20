# ADR-0013: Course progression — versioned curriculum structure, policy profiles, separated assessment, and fail-closed authorization

- Status: **Proposed** — pending independent review and human approval
- Date: 2026-09-19 (revised three times the same day after three independent reviews)
- Decision owner: Product/engineering owner (approval not yet recorded)

## Context

Learning Forge serves a pool of reviewed practice problems selected by a
prerequisite graph. It does not serve a course. Re-deriving current behavior
from code surfaced five structural problems and several defects; the full
inventory is `docs/course-progression-architecture.md` §1, which lists
twenty-seven items to replace.

The five that drive this decision:

1. **No course structure.** `program` is a flat field on `Skill`; the only
   ordering is a topological sort over a program's skills. A program with no
   prerequisite edges (AMC 8) has no sequence at all.
2. **No teaching content.** Every record requires a `deterministicValidator`
   and a `hintSteps` ladder, so instruction happens only through hints — which
   are scored as assistance and reduce evidence weight. The only way to be
   taught is to weaken the evidence of having learned.
3. **The current publication model makes any "held out" claim impossible, and
   has a code path that would publish unreviewed content.** The repository is
   **public**
   (`gh repo view` → `"visibility":"PUBLIC"`), so every prompt, canonical
   answer, accepted-answer list, solution, and hint ladder is publicly
   readable. Separately, `scripts/generate-curriculum-site.ts` would publish
   every record's prompt — including `pending_review` records, because it reads
   `contentCatalog` rather than `servableContentCatalog` — to GitHub Pages on
   every push to `main`. All current records are reviewed, so no current
   unreviewed-content leak is evidenced; the defect is the latent code path.
   `scripts/` is also not in `tsconfig.json`'s `include`, so the module that
   decides what becomes public is the one module outside the type gate.
4. **Gating is advisory.** Prerequisite and contest-readiness logic lives only
   inside `planNextActivities`, which `startSession` never calls, so
   `GET /api/phase1/session?program=amc-8&contentId=amc8-proportional-reasoning-2`
   starts a real session on a gated contest item. Separately, `Session` carries
   no activity kind and `createAttempt` never checks `endedAt`, so four
   endpoints reinterpret one another's sessions and ended sessions still accept
   attempts.
5. **Pedagogical numbers live in curriculum data.**
   `ContestFormatSchema.readinessRequirement` embeds `minEstimate` and
   confidence rules directly in content JSON.

Compounding defects: the mastery estimate is overwritten by the latest attempt
rather than aggregated; `ConfidenceBand.HIGH` is unreachable;
`Attempt.highestAssistance` is hardcoded `INDEPENDENT` forever and is exported
to parents as fact; the "independent delayed check" runs in the same sitting on
the same item and *requires* prior tutoring; and `validateContentCatalog`
enforces `REQUIRED_RECORDS_PER_SKILL = 2` at module load, so adding a single
teaching record would crash the application at import time.

## Decision

Introduce course progression built from six commitments.

1. **Progression shape is authored, reviewed, versioned curriculum data.** A
   versioned `Program` registry, `Unit`, `Lesson`, and `AssessmentBank`
   metadata become JSON records validated by Zod and reviewed in pull requests,
   following the ADR-0006 precedent. Ordering has exactly one source:
   `Program.unitCodes` and `Unit.lessonCodes`.

2. **Pedagogical numbers live in versioned policy profiles, not curriculum.**
   Curriculum expresses *structure* (which prior units, lessons, and skills are
   required) and *references* a `ProgressionPolicyProfile` by code and version.
   Thresholds, delays, spacing, weights, pass bars, and cooldowns live in the
   policy artifact. The existing inline `readinessRequirement` numbers migrate;
   the typed per-item contract pattern is preserved.

3. **Instruction and assessment are structurally separate. Whether assessment
   is *held out* is deliberately not decided here.** Content carries an
   explicit `role`, enforced by role-specific schemas: teaching records have no
   validator and no hint ladder; practice keeps both; assessment and review
   require a validator and are **forbidden** a hint ladder and never tutored.

   Two publication rules are decided, because they are wrong under either
   option: **no `pending_review` record is ever published**, and **no
   assessment or review item is ever published** on the public site.

   Whether assessment items additionally live outside the public repository is
   `D-01`, which remains **open**. The architecture specifies two complete,
   parallel branches — open-book (§4.3A) and held-out (§4.3B) — including their
   different mastery claims, whether the `HIGH` confidence band is reachable at
   all, the different context weighting, and two different leakage test sets.
   Held-out is **recommended**, not chosen; this ADR does not commit to it and
   nothing downstream assumes it.

4. **Authorization is always on and fail-closed for every mutation endpoint**,
   including programs with no units. It is evaluated against an explicit tuple
   — learner, actor and role, activity kind, target id and version, and the
   active assignment or session — by one pure predicate that
   `planNextActivities` also consumes. `Session` gains an immutable activity
   kind, target, version, and assignment binding; ended and mismatched sessions
   are rejected; session creation moves from `GET` to `POST`. Feature flags may
   control sequencing and its UI only, never role or readiness enforcement.

   **Fail-closed means "no authored grant", not "no state".** A program that is
   only partly unitised — the pilot leaves 24 of 27 Grade 6 Math skills outside
   any unit — covers the remainder with an explicit, versioned **legacy
   compatibility policy**, never a missing-state fallback. `D-52` chooses
   between that hybrid mode and an isolated pilot program; hybrid is
   recommended, not chosen.

5. **Assessment is three records, not one**: an immutable
   `AssessmentAssignment` (what was asked, with server-selected
   `contentId@version@hash` items and pinned bank, policy, and algorithm
   versions), a mutable `AssessmentRunState`, and an immutable
   `AssessmentResult`. Every reference in the system is `{code, version}`,
   including `Skill`, which gains a `version` it does not have today; derived
   mastery and review schedules pin the policy and curriculum they were derived
   under; and `resolveActive` and `resolveHistorical` are separate functions.

6. **The skill graph is the only source of conceptual prerequisites.** Content
   records stop carrying their own prerequisite lists — an audit found 18
   records disagreeing with their skill and 10 naming their own skill.
   Per-item narrowing becomes a typed `itemReadinessRefs` validated as a subset
   of the skill's closure.

7. **Mastery is a parameterized aggregation over immutable observations.**
   Maximum assistance is derived as the maximum assistance-level ordinal across
   an attempt's events, not the most recent one and not the broken stored
   column. Repeats within a session collapse; repeats across sessions are
   discounted; supersession is weighted, never deleted. `HIGH` confidence is
   reachable because it is defined against a real `delayedCheckStatus` set only
   by a scored delayed-check or review run.

8. **Placement, evidence-backed skip, and parent override are three distinct
   mechanisms** with different actors, evidence strength, outcomes, revocation
   rules, and audit records. A weak placement probe sets position only and can
   never produce `HIGH` confidence.

## Explicit non-decisions

- This ADR implements nothing. No runtime code, schema migration, dependency,
  or lesson/assessment content is introduced by the architecture phase.
- **It does not decide `D-01`.** Open-book and held-out are both fully
  specified; neither is assumed anywhere in the architecture.
- **It chooses no parameter value.** All sixty-one human-gated decisions —
  including open-book versus held-out (`D-01`), the held-out store mechanism
  (`D-02`), every mastery weight and threshold (`D-07` … `D-20`), the ordinary
  lesson and unit assessment pass bars (`D-24`, `D-26`), skip bars, cooldowns,
  the pilot lesson count, content volumes, relabelling, rollout, and the
  program registry — live in `docs/course-progression-decisions.md` and are all
  `OPEN`. Nothing there is approved.
- It does not decide whether the `ratio-tables → unit-rates` prerequisite edge
  is genuine (`D-35`); re-auditing from content shows the core ratio-tables
  record needs no unit rate, so the pilot must not assume a linear chain.
- It does not change the tutor policy, the provider boundary, the identity
  model, or the content review gate.
- It does not add a scheduler, persisted learning plans, misconception
  evidence, or constructed-response scoring.

## Alternatives considered

- **Keep the planner as the only gate and harden the client.** Rejected: the
  bypass is a server behavior, and hiding a control in the UI is not
  authorization. It also contradicts the server-authoritative-state principle
  in ADR-0007.
- **Publish assessment items alongside practice (open-book).** **Not rejected.**
  It is a live branch in `D-01` with a complete specification (§4.3A). If
  chosen, every independence claim derived from assessment is reworded,
  assessment stops contributing to `HIGH` confidence — which forces a further
  decision about whether `HIGH` is retired — and the leakage test set is
  replaced by a wording test set.
- **Encrypt assessment items in the public repository.** Available as `D-02`
  option C but not recommended: the ciphertext is permanently public, so a
  future key compromise retroactively exposes every assessment.
- **Store held-out items without a review trail** (a git-ignored local
  directory). Removed from `D-02` entirely: `docs/content-review.md` applies to
  assessment items exactly as to practice items, and an option that abandons
  the review gate is not an option.
- **Let a partly unitised program fall through to permissive behavior for
  uncovered skills.** Rejected: that is a missing-state fallback, which is the
  same class of defect as the `startSession` bypass. The remainder is covered
  by an authored policy or it is denied.
- **Put thresholds in curriculum JSON**, as `readinessRequirement` does today.
  Rejected: it puts pedagogical policy in the curriculum layer, forces a
  content re-review to change a threshold, and makes a threshold change
  invisible to policy versioning.
- **Model units and lessons as database rows.** Rejected: it moves curriculum
  out of pull-request review into runtime data, losing what ADR-0006 was
  adopted to preserve.
- **Express progression order purely through prerequisite edges.** Rejected: a
  prerequisite edge asserts a learner *cannot* do B without A, while a lesson
  sequence asserts the product *teaches* A before B. Overloading one edge type
  with both claims is the error the authoring playbook's prerequisite
  self-audit exists to prevent — and `D-35` is a live instance of it.
- **Gate behind a single feature flag including role enforcement.** Rejected:
  a flag that can disable "an assessment item is never tutored" is a flag that
  can silently reintroduce the defect this ADR exists to fix.
- **Ship progression for all six programs at once.** Rejected in favor of a
  six-stage pilot whose first two stages add no migration and no content.

## Consequences and reversal signals

Consequences:

- Closing the `startSession` bypass makes content reachable today unreachable
  until its gate opens — a deliberate behavior change requiring the product
  owner's acknowledgement (`D-05`).
- Under `D-01` Branch B, a held-out store adds a second reviewed artifact
  (repository or package) and a credential to manage, and splits the content
  review workflow across two places. Under Branch A there is no second store,
  but the product loses its strongest evidentiary claim and `HIGH` confidence
  becomes unreachable from assessment.
- Under `D-52` hybrid mode, the legacy compatibility policy is a real artifact
  that must be authored, versioned, reviewed, and eventually retired; leaving
  it in place indefinitely would quietly become the product's default.
- Replacing `REQUIRED_RECORDS_PER_SKILL = 2` touches `validateContentCatalog`
  and three program self-audit tests that hard-code `toHaveLength(2)` and assert
  prompt-text inequality. Those assertions become item-identity assertions.
- Changing mastery aggregation changes the meaning of every existing
  `MasteryEstimate` row and requires a new `algorithmVersion` plus a shadow
  recalculation and cutover (`D-20`). Raw evidence is unaffected.
- Progression **state** tables are droppable on rollback; progression
  **evidence** tables (`AssessmentAssignment`, `AssessmentResult`) are retained
  by the production rollback procedure, while schema reversibility is proven
  separately on a scratch database. Code rollback is constrained to the
  compatibility baseline or newer, so a pre-enforcement build can never be
  redeployed.
- `npm run verify` stays database-free; migration behavior is a database-job
  gate, not a fresh-clone gate.
- Programs that author no units keep today's behavior, but role and readiness
  authorization applies to them too.

Reversal signals:

- If a second program cannot adopt progression without new policy-code
  branches, the requirement-plus-profile model is insufficient and must be
  revised rather than forked. The two `§12.2` fixtures exist to detect this
  before a real program does.
- If the held-out store's review workflow degrades content quality relative to
  pull-request review, revisit `D-02` before revisiting `D-01`.
- If unit and lesson JSON grows faster than it can be reviewed, reconsider
  lesson granularity before reconsidering curriculum-as-code.
- If gating measurably reduces productive practice without improving delayed
  independent performance, revisit the gate parameters (`D-15`, `D-24`,
  `D-26`) before the architecture.

## Links

- `docs/course-progression-architecture.md` — the specification, the
  twenty-seven-item current-behavior inventory, the staged pilot, and the
  acceptance tests.
- `docs/course-progression-decisions.md` — the authoritative decision matrix,
  `D-01` … `D-61`, all open.
- `.github/skills/course-progression-design/SKILL.md` — the durable procedure.
- ADR-0006 (skill graph as versioned code), ADR-0007 (sessions generalized to
  any content item), ADR-0009/0011 (provider boundary).
