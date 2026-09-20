# Decisions and Open Questions

## Approved defaults

- The product is named **Learning Forge** with the positioning line **Adaptive, school-aligned learning with interactive AI tutoring**.
- Grade 6 Math is the initial MVP rather than the permanent product boundary.
- Product complements school; it does not replace it.
- Initial user is one Grade 6 learner with a parent account.
- Grade 6 Math is the first full domain; ratios are the first vertical slice.
- Interactive tutoring is in the MVP.
- Tutor behavior is a deterministic policy state machine plus constrained model generation.
- Use a modular monolith and PostgreSQL.
- Use TypeScript/Next.js unless an early spike demonstrates a compelling alternative.
- Keep model provider replaceable.
- Preserve raw attempt evidence and version derived mastery.
- No open web, social features, voice, or handwriting in MVP.

## Phase 0 decision register

The following register distinguishes a working implementation boundary from an
approved product decision. “Pending human approval” is intentional: the agent
must not infer privacy, legal, content-rights, accessibility, spending, or
release approval.

| # | Decision | Working boundary for Phase 0 | Status | Required owner/reviewer | Target date |
|---|---|---|---|---|---|
| 1 | Hosting and authentication | Keep identity behind a port; use local/synthetic identity only. ADR-0005 recommended, and the product owner accepted, Render as the hosting platform; ADR-0008 records the identity/auth mechanism | Approved 2026-09-06 (scope noted), **fully implemented and confirmed live 2026-09-13**: Render hosting (ADR-0005) and email/password identity (ADR-0008/ADR-0010) are deployed at `https://learning-forge.onrender.com`; a real household signed in and received a real hint response through the live app. Deployment uses ADR-0012's configuration (paid `basic-256mb` database for durability, `AUTH_TRUST_HOST`), with the web service currently on Starter by deliberate pilot choice. The Free-plan cost review is deferred; region/backup verification beyond the plan default remains open. | Product/engineering owner; privacy review before pilot | 2026-09-11 |
| 2 | Model provider and child-data terms | Fake adapter only; synthetic learner data; no provider credentials | Approved 2026-09-06 (scope noted): Anthropic Claude API selected as the first real provider (ADR-0009), **adapter implemented and enabled** 2026-09-06 (ADR-0011) after the product owner reviewed real generated output and approved it. `/api/phase1/hint` now uses the real adapter when `TUTOR_MODEL_PROVIDER=anthropic` (tests/CI always force the fake adapter regardless). Contractual data-processing terms (region, retention, training-use, subprocessors) with Anthropic remain to be recorded in `docs/privacy-inventory.md`. | Product, security/privacy, legal | 2026-09-11 |
| 3 | Pilot learner identity | Support pseudonymous internal learner ID; do not decide learner login/guardian verification here | Approved 2026-09-06 (scope noted): single-household pilot; the parent account holder creates/manages the learner profile directly; no separate guardian-verification workflow, since the account holder is the guardian (ADR-0008). | Product and privacy/legal | 2026-09-11 |
| 4 | Content provenance and review | Original or explicitly licensed content; provenance, version, reviewer, and originality record required | Approved 2026-09-06 for all 38 records across all 19 catalog skills (`original`/`llm_drafted`; no `licensed` content). See ADR-0001's approval record for scope notes — approved by the product/content owner, not a separately engaged subject-matter educator. | Educator/content owner | 2026-09-11 |
| 5 | Consent, export, deletion, retention | Treat raw child text as sensitive; default to minimization/redaction; no production retention policy inferred | Approved 2026-09-06 (scope noted) for single-household use: informal consent (the product owner is both operator and guardian), indefinite retention, deletion available via a documented manual procedure rather than a self-service feature (ADR-0008). Backup-deletion SLA remains pending — no real backups exist yet. Revisit before onboarding any additional household. | Privacy/legal and product | 2026-09-11 |
| 6 | Eval baseline and severity | Synthetic, versioned cases; no uncalibrated numerical gate claimed | Approved 2026-09-06 (scope noted): a lightweight enablement gate — the product owner personally reviews real-provider cases (leakage, tone, correctness, safety) — required before the real adapter is used in any real session (ADR-0009). **Gate satisfied** 2026-09-06 (ADR-0011): `scripts/run-real-eval.ts` ran the existing 9-case corpus (one per dimension) through the real adapter, all 9 automated checks passed, and the product owner personally reviewed the actual generated text (published as a browser artifact) and approved enabling the real adapter. **Expanded 2026-09-13**: corpus grew from 9 to 22 cases (2-3 variations per dimension, covering later hint depths, additional injection styles, self-deprecation, and "just give me the answer" pressure); re-run through the real adapter, 22/22 automated checks passed, product owner personally reviewed the full text and approved. The ~20-30-case target from ADR-0009 is now met. | Quality/evaluation owner | 2026-09-13 |
| 7 | Accessibility accommodations | WCAG 2.2 AA baseline; pilot-specific accommodations captured as requirements | Approved 2026-09-06 (scope noted): existing automated WCAG 2.2 AA coverage (axe-core structural checks plus keyboard-operability checks) accepted as sufficient; no specific accommodation requirement exists today (ADR-0008). Revisit if a concrete need arises. | Accessibility/product owner | 2026-09-11 |
| 8 | Budget and latency | Do not select provider or make cost claims in Phase 0 | Approved 2026-09-06 (scope noted): low monthly budget target (well under $20/month), latency not a hard constraint, default to a smaller/cheaper Claude model (ADR-0009). | Product/engineering owner | 2026-09-11 |

Target dates are planning targets and do not represent completed approvals.

Decision details, alternatives, consequences, reversal signals, and approval
records are maintained in `docs/adr/0001-phase-0-boundaries.md`.

## Resolved 2026-09-06 for the single-household pilot (ADR-0008, ADR-0009)

Items 1, 2 (provider only), 3, 5, 6, and 7 below were decided by the product
owner on 2026-09-06, scoped explicitly to a single-household pilot. The
authentication portion of item 1 is now also **implemented** (ADR-0010, same
day); the rest unblock follow-up engineering work, tracked separately, not
yet done.

1. Hosting: Render (ADR-0005, accepted). Authentication: email/password for
   the parent account, **implemented** 2026-09-06 (ADR-0010) including
   household-scoped data access. Region and vendor account setup for the
   actual Render deployment remain open.
2. Model provider: Anthropic Claude API (ADR-0009). **Still open:** contractual
   data-processing terms with Anthropic (region, retention, training-use,
   subprocessors — to be recorded in `docs/privacy-inventory.md` during
   adapter implementation), and incremental/streaming delivery of tutor moves
   — the fake adapter responds instantly, but a real provider's latency makes
   synchronous request/response feel slow in a 20–30 minute session; streaming
   should be designed alongside adapter implementation, not retrofitted onto
   an already-shipped synchronous UI.
3. Learner identity: the parent account holder creates/manages the learner
   profile directly; no separate guardian-verification workflow (ADR-0008).
4. Parent consent, retention: informal consent, indefinite retention, manual
   deletion on request (ADR-0008). **Still open:** backup-deletion SLA (no
   real backups exist yet) and export tooling (not needed at single-household
   scale today, per ADR-0008, but would be needed before any additional
   household is onboarded).
5. Accessibility: existing automated WCAG 2.2 AA coverage accepted as
   sufficient (ADR-0008); revisit if a concrete accommodation need arises.
6. Budget/latency: low budget (well under $20/month), latency not critical,
   default to a smaller/cheaper Claude model (ADR-0009).
7. Eval gate: lightweight, product-owner-reviewed ~20-30 case sample required
   before real-provider use (ADR-0009); not a numerically-thresholded gate.
   **Satisfied 2026-09-13**: the corpus was expanded from 9 to 22 cases
   (multiple variations per dimension, not just one), re-run through the
   real adapter (22/22 automated checks passed), and the product owner
   personally reviewed the actual generated text and approved it.

## Experiments, not assumptions

- Assistance weights and mastery thresholds
- Optimal session length and weekly frequency
- Minimum genuine-attempt policy by problem type
- Learner preference for text, diagrams, or manipulatives
- Whether a separate Contest Coach label improves behavior/understanding
- Value of generated problems versus curated originals

## Open course-progression decisions (2026-09-19)

`docs/course-progression-architecture.md` is **proposed and pending
independent review and human approval**
(`docs/adr/0013-course-progression-structure.md`).

**`docs/course-progression-decisions.md` is the single authoritative decision
matrix** for this capability. It holds sixty-one entries, `D-01` … `D-61`,
**all open**. No value in it is approved, and no other document — including
this one — restates a normative default. Resolve decisions there, not here.

Categories and what each blocks:

| Category | Decisions | Blocks |
|---|---|---|
| Open-book versus held-out assessment, and the held-out store mechanism | D-01, D-02, D-03 | Any assessment authoring at all |
| Replacing the exact-two-records-per-skill invariant; relabelling existing content with a role; the 18-record prerequisite remediation; adding a `Skill` version | D-37, D-38, D-56, D-57 | Stage A, and any teaching or assessment record for any skill |
| Partial-program rollout mode and the legacy compatibility policy | D-52, D-53 | The entire pilot — without these, 24 of 27 Grade 6 Math skills are stranded |
| Explicit access policy for **every** progression mode, including the five still-unitless programs | D-60 | Cutover for all enabled programs, not only the pilot |
| Publication scope of the public curriculum site | D-58 | **Stage A0**, which runs before all other progression work |
| Full gate set for resuming curriculum authoring | D-61 | Lifting the authoring pause |
| Rollout flag default, bypass-closure acknowledgement, override re-auth and its lifetime | D-04, D-05, D-06, D-47 | The authorization increment |
| Mastery aggregation weights, windows, bands, thresholds; difficulty weighting; `highestAssistance` correction; recalculation cutover | D-07 … D-20, D-51 | The mastery increment |
| Delay window, placement probe count, lesson/unit/delayed-check/review items and pass bars and reuse, reassessment cooldown and cap, run expiry, feedback level, skip bars, duplicate-request behavior | D-21 … D-32, D-42 … D-46, D-54 | Assessment run behavior |
| Lesson practice threshold and assistance allowance | D-42, D-59 | Lesson completion semantics |
| Completion-versus-mastery wording, pilot lesson count, the `ratio-tables` prerequisite edge, content-volume inputs, elapsed-time scope | D-33 … D-36, D-39, D-48, D-49, D-50 | Pilot scope and ordering |
| Versioned program registry | D-40 | Cross-program generality |
| Human screen-reader review; child-safe phrase artifact | D-41, D-55 | Serving a learner |

Four consequences need explicit acknowledgement rather than a parameter value:

1. The repository is **public** and the curriculum site publishes every
   record's prompt, so assessment content authored the way all 128 existing
   records are authored is not held out in any sense (`D-01`). Separately, the
   generator reads the raw catalog rather than a reviewed projection: all 128
   records happen to be reviewed today, so **nothing unreviewed is currently
   public**, but the next `pending_review` record merged would be published
   automatically with no gate (`D-58`).
2. The new mastery aggregation changes the meaning of every existing
   `MasteryEstimate` row and requires a new `algorithmVersion` plus a
   shadow-compute-and-cutover plan for the live household (`D-20`).
3. Closing the `startSession` bypass makes content that is reachable today
   unreachable until its gate opens (`D-05`).
4. The pilot unitises 3 of 27 Grade 6 Math skills. Without an explicit legacy
   compatibility policy, fail-closed enforcement would strand the other 24
   (`D-52`, `D-53`).

Until these are resolved and recorded, no progression runtime behavior may be
implemented, and **new curriculum authoring is paused** (see
`docs/curriculum-agents.md` and `docs/07-roadmap.md` Phase 3a).

## Deferred decisions

- Native mobile versus responsive web
- Multi-tenant school architecture
- Teacher dashboards
- Voice and handwriting recognition
- Fine-tuning
- Vector database/RAG platform
- Microservices and event streaming
- Multi-agent tutor orchestration
- Multi-child households (siblings sharing one parent account): the schema already supports it (`Household` has many `User`/`LearnerProfile` rows), so no migration is anticipated; a learner switcher and per-child session/consent UX remain deferred to Phase 3+ real identity work, not a Phase 1 data-model risk.
