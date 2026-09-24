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
reviewed internally, A0/A1 are implemented, A2 is complete, and Stage B is
complete. C1–C3 are shipped as a non-enforcing persistence,
export/deletion, dual-write, and shadow-mode foundation. The product owner
approved the remaining policy recommendations on 2026-09-19 and approved the
revisitable D-36 pilot-volume and D-39 elapsed-time decisions on 2026-09-20.
No course-progression decision entries remain open. Independent and manual
release gates still remain required.

No authorization cutover has been performed. Teaching, assessment, and review
content remain untouched, and C4/C5 still require their independent and manual
release gates.

## 3. Artifacts and their status

| File | Role | Status |
|---|---|---|
| `docs/course-progression-handoff.md` | This file. Resumption entry point | Current |
| `docs/course-progression-architecture.md` | The specification: inventory, entities, policy, authorization, mastery, staging, acceptance tests | **Proposed**, fourth draft |
| `docs/course-progression-decisions.md` | The single authoritative decision matrix, `D-01` … `D-70` | **70 approved; 0 open** |
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

None from reviews 1–3 are known to be outstanding. The fourth-draft and C1–C3
review was performed on 2026-09-22 (recommendation: do not approve). Later
independent reviews and remediation are recorded in
`docs/course-progression-review/independent-review-result.md`.

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

All seventy entries in `docs/course-progression-decisions.md` are approved.
D-36 and D-39 are explicitly revisitable pilot decisions; D-39 is required
before treating elapsed-time evidence as production mastery evidence. Each
later stage must still use the approved value for every decision it touches.

| Order | Decision | Why first |
|---|---|---|
| 1 | Independent review of C1–C3 and representative shadow divergences | Confirms the persistence, dual-write, privacy coverage, and shadow evidence before authorization changes |
| 2 | Remaining open decisions required by the next planned stage | Prevents implementing unresolved policy or product parameters |

`D-61` defines the full gate set for resuming curriculum authoring.

## 6. The exact next task

> The independent C1–C3 review (2026-09-22) and its M1–M3 remediation
> re-review are recorded in `docs/course-progression-review/`. Pilot
> `DELAYED_CHECK` and `REVIEW` assignments are implemented (D-63, D-65–D-67)
> with draft held-out items pending review; the independent review's findings
> are remediated and await re-review.
> Before C4: (1) implement pilot `PLACEMENT` assignments (D-64, D-68), so D-62
> does not remove the pilot's diagnostic flow; resolve the legacy
> `independentDelayedCheck` flag (re-review F6), build the D-06 step-up endpoint
> and the parent override surface for D-70's service (D-70 blocks C4, so this
> precedes C4 even though the wider parent UI is C5), and reconcile `attemptOrdinal`
> with the D-27 consecutive count (N5) at the latest in C4; (2) deploy,
> then collect
> representative non-enforcing shadow traffic from the remediation deploy
> onward and disposition every divergence; (3) complete the private-package
> review and the manual gate record. Only then implement the approved C4
> expand/contract cutover. Do not serve progression UI until C4 and the manual
> accessibility, wording, privacy, and content gates are recorded.

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

**No further authorization or learner-facing progression rollout.** The
architecture and C1–C3 foundation have been implemented, but until the
fourth-draft architecture/C1–C3 review is independently completed, the human
records approval, and the C4 manual gates are recorded, do not change runtime
authorization or serve progression UI. Stage C4 is the only implementation
increment allowed to change authorization, and it must follow §11.4a's
expand/contract order.

**No authoring.** New curriculum authoring is paused. Architecture approval
alone does **not** lift it; the full gate set is `D-61`. Research and dossier
review continue.

**No self-approval.** A review cannot approve its own findings, and an
implementing task cannot approve its own output. Only the human product/content
owner approves.

**No inventing parameters.** Every threshold, window, interval, pass bar,
weight, and volume is a `D-nn` entry. If an entry becomes `OPEN`, stop and
report it rather than substituting a recommendation or a default.

**No commits or pushes** unless the human explicitly asks.
