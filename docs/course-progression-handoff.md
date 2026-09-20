# Course Progression Handoff

**Read this first if you are picking up course-progression work in any tool.**

This document is tool-neutral and self-contained. It assumes no chat history,
no prior session, and no vendor-specific agent configuration. Everything needed
to resume is either here or in a file this document names.

---

## 1. Objective

Turn Learning Forge from a **pool of practice problems filtered by a
prerequisite graph** into a **course**:

`Program → Unit → Lesson → Skill → Practice → Assessment → Review`

piloted on Grade 6 Math Ratios and Proportional Reasoning, and designed so
every other program adopts it as authored data rather than new policy code.

## 2. Current phase

**Architecture plus staged contract implementation.** The fourth draft was
reviewed internally, A0/A1 are implemented, and A2 is complete: all 128
records use the canonical practice shape and the live catalog rejects legacy
records. The six substantive prerequisite-edge recommendations are approved.
Stage B is next, but its concrete policy artifacts remain gated by the open
policy decisions listed in the decision matrix.

No learner-state migration or authorization cutover has been performed. A2
practice-content transformation is in progress under the approved metadata
disposition; teaching, assessment, and review content remain untouched.

## 3. Artifacts and their status

| File | Role | Status |
|---|---|---|
| `docs/course-progression-handoff.md` | This file. Resumption entry point | Current |
| `docs/course-progression-architecture.md` | The specification: inventory, entities, policy, authorization, mastery, staging, acceptance tests | **Proposed**, fourth draft |
| `docs/course-progression-decisions.md` | The single authoritative decision matrix, `D-01` … `D-61` | **13 approved; 48 open** |
| `docs/course-progression-playbook.md` | The tool-neutral procedure for doing this kind of work | Current |
| `docs/adr/0013-course-progression-structure.md` | Decision record | **Proposed** |
| `.github/skills/course-progression-design/SKILL.md` | A thin wrapper around the playbook for one specific tool | Optional convenience |
| `.github/agents/course-progression-*.agent.md` | Model/tool selection for one specific tool | Optional convenience |

The `.github/` files are **wrappers, not the source of procedure**. Any tool
can do this work from `docs/course-progression-playbook.md` alone.

## 4. Review chronology and what each pass found

Four drafts, three completed independent reviews. Each review's findings were
remediated in the following draft; the entries in `docs/PROGRESS.md` record the
detail.

| Draft | Trigger | Principal findings remediated |
|---|---|---|
| 1 | Initial design | — |
| 2 | First independent review | Assessment could not be held out (public repository, public site); layer violation putting thresholds in curriculum; advisory-only gating; last-observation-wins mastery; unreachable `HIGH`; same-sitting "delayed" check; the exactly-two-records-per-skill invariant that throws at module load; unwired test directories; existence-only migration checking |
| 3 | Second independent review | `D-01` was being pre-decided by prose; decision matrix incomplete; 24 of 27 Grade 6 Math skills would be stranded by fail-closed enforcement; single `AssessmentRun` conflating three lifetimes; missing version pinning; content records duplicating and contradicting the skill graph; incomplete transition tables; unsafe staging intermediates |
| 4 | Third independent review | `D-01` not a single discriminated union and self-contradicting across files; unitless programs implicitly permitted; an unimplementable cross-table unique index; dishonest staging table; incomplete policy mapping; audit tables classified as droppable; undefined terminal result semantics; no claim-to-test matrix; vacuous publication test; imprecise `D-58` statement; authoring gates understated |

### Remaining open findings

None from reviews 1–3 are known to be outstanding. **Review 4 has not been
performed.** The fourth draft has not been independently checked, and its
self-assessment should not be trusted.

Specific things a fourth reviewer should challenge first:

1. Does any artifact still restate or contradict a cell of the `D-01`
   discriminated-union table?
2. Do the two cross-program fixture variants require different policy code? If
   so, `D-01` has leaked out of the storage layer.
3. Does the Stage C4 expand/contract order leave any unsafe intermediate
   deploy?
4. Does every claim in architecture §16 have a genuinely *falsifying* test in
   the §13.6 matrix, rather than a merely related one?
5. Is the §1 inventory still accurate? Re-derive it from code; do not accept
   it.

## 5. Decisions required before any implementation

Twelve entries in `docs/course-progression-decisions.md` are approved and
forty-nine remain open. The approved set is `D-01`, `D-02`, `D-03`, `D-37`, `D-38`,
`D-40`, `D-52`, `D-53`, `D-56`, `D-57`, `D-58`, and `D-60`. The remaining
decisions are not prerequisites for A1; each later stage must resolve every
decision it touches before implementation.

| Order | Decision | Why first |
|---|---|---|
| 1 | Independent review of Stage A0/A1 | Confirms the publication boundary and transition schemas before later stages depend on them |
| 2 | Remaining open decisions required by the next planned stage | Prevents implementing unresolved policy or product parameters |

`D-61` defines the full gate set for resuming curriculum authoring.

## 6. The exact next task

> Resolve the six substantive prerequisite-edge decisions listed in
> Approve the concrete Stage B policy values, then author the versioned policy
> artifacts and pure policy modules. Do not hard-code recommendations while
> those decision entries remain OPEN.

After those gates, the next implementation task is **Stage A2** — content
transformation only — as defined in architecture §11.4.

## 7. Stage dependencies

Stages are defined in architecture §11.4. Dependency order:

```
A0  (D-58 publication hotfix)          -- no migration, no content
 └─ A1  (schemas + accepting validators) -- no migration, no content
     └─ A2  (content transformation)     -- CONTENT CHANGES
         └─ B  (policy artifacts + pure modules, nothing calls them)
             └─ C1 (schema/evidence tables, unused)
                 └─ C2 (export/deletion/retention coverage)
                     └─ C3 (shadow mode + dual-write bindings)
                         └─ C4 (ATOMIC CUTOVER — the only authorization change)
                             └─ C5 (UI)
                                 └─ D… (one stage per approved lesson, then unit)
```

Rules that survive independently of any tool:

- **A1 must precede A2.** Records cannot be transformed against schemas that do
  not exist yet.
- **C2 must precede C3.** No learner data may exist in a table the export and
  deletion paths do not cover.
- **C4 is atomic** and internally ordered expand → drain → reject residue →
  contract → enforce → remove bypass. It is the only increment that changes
  authorization.
- **The number of content stages equals the approved lesson count (`D-34`)
  plus one.** Do not assume three.

## 8. Validation commands

| Command | Needs a database | When |
|---|---|---|
| `npm run verify` | **No** | Every change. Format, lint, typecheck, migration-file existence, DB-free test suites, production build |
| `npm run test:integration` | Yes | Any persistence change |
| `npm run test:e2e` | Yes | Any learner- or parent-facing change |
| `npm run eval:run` | No | Any change to tutor-adjacent text |
| `git diff --check` | No | Every change |

For documentation-only work, `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm test`, and `git diff --check` are sufficient.

`npm run verify` must stay database-free; do not add database-dependent checks
to it.

## 9. Files to read, in order

**To review or continue the architecture:**

1. `docs/course-progression-handoff.md` — this file
2. `docs/course-progression-playbook.md` — the procedure and its gates
3. `docs/course-progression-architecture.md` — the specification
4. `docs/course-progression-decisions.md` — every open decision
5. `docs/adr/0013-course-progression-structure.md` — the decision record
6. `docs/PROGRESS.md` — `Current status` and the dated entries from
   2026-09-19; the full history is not required

**For repository context, as needed:**

7. `AGENTS.md` — operating constraints
8. `README.md` — product framing and verification commands
9. `docs/02-curriculum-and-pedagogy.md`, `docs/03-system-architecture.md`,
   `docs/05-data-and-student-model.md` — the layers this work touches
10. `docs/09-decisions-and-open-questions.md` — the wider decision register

**Code the inventory in architecture §1 is derived from:**

- `src/phase1/service.ts`, `src/planner/plan-next-activities.ts`,
  `src/content/catalog.ts`, `src/curriculum/catalog.ts`,
  `src/contracts/*.ts`, `prisma/schema.prisma`,
  `src/app/api/phase1/*/route.ts`, `scripts/generate-curriculum-site.ts`,
  `tests/content/catalog.test.ts`, `package.json`, `tsconfig.json`

## 10. Hard gates — do not cross these

**No implementation.** Until the architecture passes independent review, the
human records approval, and the decisions in §5 are resolved, do not write
runtime code, migrations, tests, or dependencies for progression. Stage A0 is
the first implementable task and is itself gated on `D-58`.

**No authoring.** New curriculum authoring is paused. Architecture approval
alone does **not** lift it; the full gate set is `D-61`. Research and dossier
review continue.

**No self-approval.** A review cannot approve its own findings, and an
implementing task cannot approve its own output. Only the human product/content
owner approves.

**No inventing parameters.** Every threshold, window, interval, pass bar,
weight, and volume is a `D-nn` entry. If an entry is still `OPEN`, stop and
report it rather than substituting a recommendation or a default.

**No commits or pushes** unless the human explicitly asks.
