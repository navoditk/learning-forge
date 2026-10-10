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
| `docs/course-progression-decisions.md` | The single authoritative decision matrix, `D-01` … `D-74` | **74 approved; 0 open** |
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

All seventy-four entries in `docs/course-progression-decisions.md` are approved.
D-36 and D-39 are explicitly revisitable pilot decisions; D-39 is required
before treating elapsed-time evidence as production mastery evidence. Each
later stage must still use the approved value for every decision it touches.

| Order | Decision | Why first |
|---|---|---|
| 1 | Independent review of C1–C3 and representative shadow divergences | Confirms the persistence, dual-write, privacy coverage, and shadow evidence before authorization changes |
| 2 | Remaining open decisions required by the next planned stage | Prevents implementing unresolved policy or product parameters |

`D-61` defines the full gate set for resuming curriculum authoring.

## 6. The exact next task

> As of 2026-09-28: the independent C1–C3 review (2026-09-22) and every
> remediation round since are recorded in `docs/course-progression-review/`,
> most recently "ready for human review with noted risks" on the placement
> (D-64, D-68 as amended, D-71) and D-70 step-up/override work, with its one
> major finding (no password attempt limiting) closed as D-72. Pilot
> `PLACEMENT`, `DELAYED_CHECK`, and `REVIEW` assignments are all implemented;
> draft held-out items for the latter two are pending content review.
>
> As of 2026-09-29: item 2 below is narrowed and done, not built as
> originally scoped. `getDiagnosticPlan` and `getReviewQueue`
> (`src/phase1/service.ts`) now exclude any root/due skill claimed by an
> authored unit, instead of routing those sessions onto the assignment
> routes. The legacy assignment-free learner UI no longer suggests pilot
> skills D-62 would refuse at C4. Direct session start by content ID for a
> pilot skill is deliberately left reachable pre-C4 (an explicit test proves
> it, including that the D-62 shadow divergence is still recorded); C4's
> fail-closed enforcement is what closes that, not this change.
> `shadow-divergence-review.md`'s two pilot PLACEMENT/REVIEW staging rows are
> updated to `EXPLAINED` accordingly.
>
> This is a real, live production behavior change, not a shadow-only one:
> `getDiagnosticPlan`/`getReviewQueue` are the legacy Phase 1 functions real
> learners use today. From this deploy, grade-6-math pilot skills
> (ratio-language, ratio-tables, unit-rates) stop appearing in the normal
> learner UI's placement/review suggestions, with no replacement until C5's
> progression UI ships. An independent review (requested as and confirmed
> Claude Opus, a different model from the implementing session) flagged this
> narrowing and the resulting suggestion gap as needing explicit
> product-owner sign-off rather than implementer self-approval per this
> project's no-self-approval rule. The product owner reviewed both and
> accepted: ship as-is, and the `EXPLAINED` dispositions stand as written by
> the implementer, 2026-09-30.
>
> As of 2026-09-30: item 3 (F6, N5) is closed by investigation, not by a
> functional code change - tracing every reader confirmed neither finding
> describes an actual bug:
>
> - **F6 (`independentDelayedCheck`'s dual meaning):** already policy-settled
>   by D-65 (approved 2026-09-23): the legacy same-sitting check is
>   authorized as independent `PRACTICE`, not `DELAYED_CHECK`, and survives
>   C4 for legacy/skill-graph-only skills. The only live gap was parent-facing
>   wording: `src/app/parent/page.tsx` said "Delayed check complete," which
>   overclaims a genuine time-separated check for a skill confirmed the
>   same-sitting way. Fixed to "Independently confirmed," which is true
>   under either mechanism. No schema or gating logic changed.
> - **N5 (`attemptOrdinal` vs. the D-27 count):** `attemptOrdinal`
>   (`src/progression/assessment-assignment.ts`) is a lifetime, never-resets
>   ordinal used only for `=== 1` to gate D-31's evidence-backed-skip credit.
>   `reassessmentEligibility`'s consecutive-failures-since-last-pass count
>   (`src/progression/reassessment.ts`) enforces the separate D-27
>   `maxReassessments` cap and does reset on a pass. Both are derived from
>   the same `previousAssignments` query but intentionally count different
>   things for different purposes; neither was wrong. Added a schema comment
>   on `AssessmentAssignment.attemptOrdinal` and a code comment at its
>   computation so a future reader doesn't "fix" one to match the other.
>
> Before C4:
>
> 1. Build the parent-facing screens for the D-70 step-up and override APIs
>    (implemented and release-gated; no HTTP caller in the UI yet), under
>    C5's manual accessibility and wording gates.
> 2. ~~Move the learner UI's diagnostic and review sessions onto the
>    assignment routes~~ — done 2026-09-29: pilot skills are excluded from
>    suggestion instead; see above.
> 3. ~~Resolve the legacy `independentDelayedCheck` flag (re-review F6) and
>    reconcile `attemptOrdinal` with the D-27 consecutive count (N5)~~ —
>    investigated and closed 2026-09-30; see below.
> 4. Deployed 2026-10-01 (PR #44 merged as `3cda97b`, live as deploy
>    `dep-daurfsc9v7es73bkocv0`, confirmed via `render deploys list` and a
>    200 from `/login`). The C3 evidence window reopened at this deploy
>    (`shadow-divergence-review.md`). **Still open:** collecting
>    representative non-enforcing shadow traffic and dispositioning every
>    divergence - this needs real usage to accumulate first, not a one-shot
>    command, and has not started.
> 5. ~~Complete the private-package content review and the manual gate
>    record~~ — **mostly done 2026-10-04/05, not as of 2026-09-30 when this
>    item was last written.** An independent review of
>    `grade-6-math-assessments-draft-v2.json` found real defects (`D-73`);
>    once fixed, all 72 items moved to `review.status: "reviewed"`
>    (confirmed 2026-10-04) and the package's digests were re-pinned in
>    `BANK_HASHES`. `manual-gate-record.md`'s held-out-package,
>    authored-content, `D-58`-acknowledgement, and open-decision-check rows
>    are now all signed (product owner, in chat, 2026-10-05).
>    **Still genuinely blank:** only the independent-review and
>    shadow-review rows. The independent-review gate has no remaining
>    technical blocker — the latest read-only pass (2026-09-28) already
>    returned "ready for human review with noted risks," with its one major
>    finding closed as `D-72` — so that row needs only the product/
>    engineering owner's own dated decision and signature, not further
>    implementation. The shadow-review row is unchanged from item 4 above:
>    it needs real representative traffic to accumulate and be
>    dispositioned, which still has not started.
>
> Only then implement the approved C4 expand/contract cutover. Do not serve
> progression UI until C4 and the manual accessibility, wording, privacy, and
> content gates are recorded.

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

For documentation-only work, follow `AGENTS.md`: run targeted Prettier checks
with `--ignore-path /dev/null` for changed documents (the repository's default
format check ignores `docs/`) and `git diff --check`. Runtime validation is
not required when only documentation changes.

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
