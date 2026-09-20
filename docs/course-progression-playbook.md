# Course progression playbook

## Purpose

The durable, tool-neutral procedure for designing, reviewing, and implementing
a course-progression capability for a curriculum program. This document is the
**source of procedure**. Any repository skill or agent profile that mentions
course progression is a thin wrapper around this file and adds only model and
tool selection; if a wrapper and this playbook disagree, this playbook governs.

This mirrors the convention already used by
`docs/curriculum-research-playbook.md` and
`docs/curriculum-authoring-playbook.md`: the playbook holds the procedure, the
wrapper holds the model choice.

Entry point for resuming work: `docs/course-progression-handoff.md`.

## Scope of each role

Three roles, which may be three people, three sessions, or three tool
configurations. Independence between the first two matters more than which
tool performs them.

| Role | Does | Must not |
|---|---|---|
| **Architect** | Re-derives current behavior from code; writes or extends the specification and the decision matrix | Implement, author content, add dependencies, write migrations, or choose a parameter value |
| **Reviewer** | Independently re-derives the inventory and checks the specification against §6 | Edit files, accept the architect's conclusions, or approve |
| **Implementer** | Builds exactly one approved stage with the tests the specification names | Redesign, broaden scope, or substitute a value for an open decision |

An independent review should be performed by a different reasoning
configuration than the one that authored the work — a different model family
where that is available — because correlated blind spots are the failure mode
this gate exists to catch. That is a preference, not a requirement, and no
model name belongs in this document.

## The five layers

Every concept belongs to exactly one layer. A file, schema, table, or function
spanning two is a defect to report, not a shortcut to take.

| Layer | Owns | Must never own |
|---|---|---|
| **Curriculum and content** | Programs, units, lessons, skills, prerequisite edges, content records and roles, bank membership, versions, provenance, review status, and **references to policy profiles by code and version** | Any numeric threshold, delay, interval, weight, or pass bar; learner identity; unlock decisions; provider calls |
| **Pedagogical policy** | Versioned policy artifacts and the pure modules reading them: sequencing, unlock predicates, aggregation, delay windows, spacing, weights, pass bars, cooldowns | Learner rows, content text, provider SDK types, persistence access |
| **Learner state** | Placement, position, unlock grants, skips, overrides, review schedules, session and run progress | Correctness rules, content text, model output, policy numbers |
| **Assessment evidence** | Immutable attempts, assistance events, assignments, results, contributions, derived estimates carrying an algorithm version | Policy thresholds, content authoring, unlock authorization |
| **Provider interfaces** | Structured model input/output, adapters, traces | Authorization, mastery, unlock, scoring of record |

**The layer test easiest to fail:** a number in a curriculum record. Curriculum
may say *which* prior skills and lessons are required and *which* policy
profile applies; it may never say *how good is good enough*.

## Procedure

### 1. Inventory current behavior from code

Produce a file-and-symbol-level list split into **preserve**, **replace**, and
**gap**. Cite the code path, never the design document's aspiration. Design
docs drift ahead of schemas; assume they have.

For each **replace** item, state what breaks if left alone and whether existing
persisted evidence stays valid.

### 2. Define the entity spine

`Program → Unit → Lesson → Skill → Practice → Assessment → Review` as explicit
versioned entities, with one authoritative ordering source, one canonical
reference shape, explicit code-namespace rules, and a clear split between what
is curriculum and what is learner state.

### 3. Define content roles and the instruction/assessment separation

Distinguish teaching, practice, assessment, and review as **role-specific
schemas**, not one schema with optional fields. Teaching records carry no
validator and no hint ladder; assessment and review records are *forbidden* a
hint ladder and are never tutored. Assessment items are never shown as
instruction, practice, worked example, hint payload, or preview.

Before specifying anything as secret, **verify publication reality**:
repository visibility, what any site generator emits, and which modules sit
outside the type and test gates. Model open-book versus held-out as **one
discriminated union defined in exactly one place**, covering storage,
publication, what evidence each branch can establish, which confidence bands
are reachable, weighting, wording, feedback, and tests. Two partial
descriptions in two files will contradict each other.

Every storage option must preserve a human review gate.

### 4. Define the mastery evidence contract

Specify the raw observation shape; how maximum assistance is derived (a
maximum, never a most-recent value, and never a stored column nothing writes);
deduplication within a run, within a session, and across sessions; whether
partial credit is reachable at all; an explicit aggregation formula precise
enough to implement from the document alone; which confidence bands are
reachable and on what evidence; slip, relock, and staleness behavior; and how
an algorithm-version change recalculates into a **new** row.

Two properties must be stated and testable: one incorrect observation lowers
but cannot zero the estimate while prior correct observations remain in the
window; and the estimate is a property of the record, not of the latest
attempt.

### 5. Define genuinely delayed checks

A delayed check requires an elapsed-time separation from the learner's last
exposure to that skill, derived from persisted server events; a different item
compared by identity and version; no assistance; and **no tutoring
prerequisite**. Any later teaching or help event resets eligibility. An
**empty** exposure set makes the learner *ineligible*, never instantly
eligible.

### 6. Define placement, skip, override, remediation, reassessment

Placement, evidence-backed skip, and a human override are **three different
mechanisms** and must never be merged. Tabulate them on actor and role, input,
evidence strength, outcome semantics, mastery effect, downstream effect,
revocation, re-authentication, audit record, and parent-facing wording. A weak
probe sets position only and can never produce the highest confidence band.

### 7. Define authorization

Server-side, **always on**, and **fail-closed** for every mutation endpoint.
Evaluate an explicit tuple — learner, acting user and role, activity kind,
target identity and version, active assignment or session — through one pure
predicate the planner also consumes. Bind the session immutably and reject
ended or mismatched sessions.

**Fail-closed means "no authored grant", not "no state".** Check what the
rollout leaves uncovered, including programs the migration never touches;
cover them with an explicit versioned access policy, never a fallback. Feature
flags may control sequencing and UI only, never role or readiness enforcement.
Specify a rollback that cannot restore the bypass.

### 8. Define completion, versioning, privacy, accessibility, safety

Completion and mastery are separate facts with separate storage and separate
wording. Reference everything by identity and version. Keep historical
resolution separate from active resolution. Classify tables for rollback by
**reconstructability**, not by the word "state": human decisions and event logs
cannot be recomputed and must be retained or archived. Reconcile application
immutability with the household's right to erasure explicitly. Cover every new
table in export and deletion with a coverage test that enumerates the data
model. Meet WCAG 2.2 AA, conveying status in text. Check child-safe wording
against a versioned artifact.

### 9. Define acceptance criteria and stage the work

Every criterion names a test file and an observable assertion, and every claim
the specification makes has a **falsifying** test — write the claim-to-test
matrix, because listing claims and tests separately hides the claims nothing
covers. Wire new test directories into the repository's test scripts; a test no
script runs is not a gate. Respect existing gates' properties, such as a
verification command that needs no database. Keep **manual gates** — human
accessibility and wording review — in a separate table from automated
criteria; they are not passing checks.

Stage the work so the security-relevant change is **one atomic increment**.
Schema additions precede the transformations depending on them. Export and
deletion coverage precedes any write. Run new decision logic in **shadow mode**
first, enforcing nothing, and review the divergence before cutover. Count any
change under the content tree as a content change.

### 10. Separate decided from undecided

Maintain **one** authoritative decision document. Every human-gated parameter
is an entry with a stable identifier, a recommendation, a status, an approver,
and what it blocks. Every other artifact references identifiers and contains no
bare normative number. Label recommendations as recommendations. An implementer
reads only approved values and refuses anything still open.

Reconcile any wrapper, playbook, or profile the design invalidates.

## Review dimensions

An independent review checks, re-deriving from code rather than accepting the
specification:

1. Inventory accuracy and completeness.
2. Layer separation, including no numbers in curriculum records.
3. That an open decision is defined in exactly one canonical place and no
   artifact restates or contradicts a cell of it.
4. Mastery contract precision, reachable confidence bands, maximum-assistance
   derivation.
5. Delayed-check semantics, including the empty-exposure case.
6. Placement, skip, and override as distinct mechanisms.
7. Authorization: always-on, fail-closed, no stranded targets, no
   implementable-only-in-theory database constraints.
8. Versioning, historical resolution, rollback retention of non-reconstructable
   audit, and reconciliation of immutability with erasure.
9. Terminal states each producing a record.
10. Staging: no intermediate deploy less safe than its predecessor; honest
    content accounting.
11. Every claim falsified by a named test that a script actually runs; manual
    gates listed separately.
12. Accessibility, child-safe wording, and privacy coverage.
13. Drift: counts, draft numbers, cross-references, and identifiers.

Report findings with severity (`blocker`, `major`, `minor`), confidence, file
and line, evidence, and the smallest safe remediation. End with exactly one of
`not ready for human review`, `ready for human review with noted risks`, or
`ready for human review`. A review never approves.

## Gates

| Gate | Cleared by | Blocks |
|---|---|---|
| Curriculum source approval | Product/content owner | Any progression design for that program |
| Assessment exposure decision, and its store if held out | Product owner + privacy/safety owner | Any assessment authoring |
| Publication-scope remediation | Product owner + privacy/safety owner | All other progression work |
| Architecture approval | Product/engineering owner | Any implementation |
| Threshold, window, pass-bar, and volume approval | Product/pedagogy owner | Treating any recommendation as settled |
| Independent review | A reviewer that did not author the work | Human approval |
| Content review | Product/content owner per `docs/content-review.md` | Serving any authored record |
| Privacy and safety review | Privacy/safety owner | Any new learner data field or provider input change |
| Migration review | Engineering owner | Any schema change |
| Accessibility human review | Accessibility/product owner | Serving a learner |

Specification-only work must additionally introduce no dependency, no
migration, and no runtime code change.

## Cross-program extension rules

1. Program isolation is a **schema invariant**, not a convention.
2. No skill-code or program-name heuristics in policy; gating is authored
   structure plus a referenced policy profile.
3. Progression shape is authored data; adding a program, unit, or lesson is a
   reviewed data change, never a policy-code change.
4. Programs without units keep today's learner-visible behavior but are **not**
   implicitly permitted; every mode references an explicit versioned access
   policy.
5. Consolidate duplicated program identity into one versioned registry.
6. One shared policy module; variation is a composed, versioned profile, never
   a fork.
7. Prove generality with **executable fixtures** — at minimum one non-math
   graded subject and one non-graded enrichment program whose completion needs
   no assessment — that pass with zero new policy code. Do not author real
   content for them.
8. End with an ordered adoption checklist naming the gate at each step.

## Lessons carried forward

From four drafts and three independent reviews of the Grade 6 Math ratios
pilot. These are the failure modes to expect, not a summary of that pilot.

- Design documents drift ahead of the schema; re-derive from code.
- An "advisory planner" the entry point never calls is not a gate.
- Check where the code publishes before designing what is secret; a generator
  outside the type and test gates decides what becomes public.
- A shared session with no activity kind lets endpoints reinterpret each
  other's sessions.
- A flag that can turn off a security fix ships the defect with a switch on it.
- "Independent" and "delayed" are different claims.
- Last-observation-wins is not mastery; check what the code stores.
- A column nothing updates is worse than a missing column, because it is
  exported as fact. "Highest" and "most recent" are different queries.
- Unreachable states hide broken contracts.
- Hints are not instruction; naming the teaching role is what makes a course a
  course, and it requires role-specific schemas.
- Look for hard invariants — a catalog validator requiring exactly N records
  per skill turns "add one record" into "crash at import".
- Prompt-text comparison is not item identity.
- A test directory no script runs is not a gate; an existence check on a
  rollback script is not a reversibility test.
- Allowlist exports rot silently; enumerate the data model instead.
- A recommendation restated confidently becomes a decision; write the
  non-recommended branch at equal depth.
- Check what the rollout leaves behind before enforcement turns on.
- One record holding immutable evidence, mutable progress, and an outcome has
  three lifetimes in one table.
- One record type cannot restate another's invariants without disagreeing with
  them.
- An empty event set is not a satisfied condition.
- A constraint that cannot be expressed in the target database is not a design.
- "State" is not the same as "reconstructable".
- Every terminal state must produce a record; "no row" is indistinguishable
  from "lost row".
- "Never deleted" is an application rule, not a denial of the right to erasure.
- A staging table claiming "no content change" while relabelling every record
  is wrong.
- A leakage test that greps for a substring misses `0.25` when the answer is
  `1/4`.
- A regression test with nothing to catch is vacuous; inject a sentinel.
- Thresholds are the easiest thing to invent and the hardest to justify.
- Volume estimates are planning aids except where they are arithmetic; label
  which is which.
- Reconcile the wrappers and playbooks the design invalidates.
