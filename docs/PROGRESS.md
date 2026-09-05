# Progress

## Current status

- Phase: 0 — LF-0.3 complete; domain contracts ready for review
- Branch: `feature/phase-0-domain-contracts`
- Repository state: working tree contains the uncommitted LF-0.3 contract changes; no learner data or provider credentials are used
- Last verified commit: `8e72c63 Merge pull request #2 from navoditk/feature/phase-0-repository-quality-gates`

## Proposal analysis (2026-09-04)

### Contradictions and unclear requirements

1. The first vertical slice says “student signs in,” while the MVP says one learner and one parent account, and identity does not define whether the learner has credentials, a parent-mediated session, or pseudonymous access.
2. “Parent consent and control” is required, but the child’s age/consent boundary, consent evidence, revocation behavior, guardian verification, and school-agreement assumptions are unspecified.
3. IUSD sequencing is an input, but the curriculum document says it is manually curated; source, permission, update owner, versioning, and behavior when school timing differs are undefined.
4. “AoPS-style” and contest-style labels are described as skill inspiration, but the boundary between permissible inspiration and copied/proprietary content, and the originality record, are unspecified.
5. Tutor transitions depend on elapsed work, accessibility override, and parent/teacher configuration, but units, defaults, override authority, audit behavior, and anti-leakage limits are undefined.
6. “Validate mathematical correctness where possible” and “answer-leak detector” lack required validator/equivalence scope, failure semantics, and coverage targets.
7. Tutor-move `confidence` has no calibration/use policy and could be mistaken for mastery confidence, despite the explicit prohibition on treating LLM judgment as mastery evidence.
8. The entity list lacks relationships, cardinality, identifiers, timestamps, access ownership, deletion semantics, and the boundary between raw child text and redacted traces.
9. Mastery has no concrete aggregation algorithm, context modifiers, uncertainty representation, or fixtures. “Review due” is both a state and a scheduling concept without a defined relationship.
10. Privacy requirements lack an accountable owner, provider regions/subprocessors, operational export/deletion behavior, backup deletion rules, logging access policy, and a pilot launch checklist.
11. Evaluation says thresholds follow a baseline, while the roadmap calls for Phase 2 release gates; corpus size, severity taxonomy, adjudication, and gate ownership must be defined first.
12. Phase 1 requires a real model adapter, but provider choice and child-data contractual settings are unresolved in Phase 0. The Phase 1 exit must allow a sandbox/synthetic-data adapter until approved.
13. “Local PostgreSQL” and a database-backed queue are required, but supported versions, setup, migration/rollback policy, and whether the queue is needed in Phase 0 are unspecified.
14. “One documented command” is not reconciled with the instruction not to initialize now; it can be specified in Phase 0 and verified after scaffolding.

### Decisions that genuinely block Phase 0

These do not block ADRs or repository scaffolding, but they block affected Phase 0 deliverables or a trustworthy Phase 0 exit:

- Human approval of the pilot identity/consent model, including parent verification, learner access, withdrawal, export, deletion, and retention. Otherwise identity/privacy and persistence cannot be finalized safely.
- Human approval of the ratios content provenance/license policy and review workflow. Otherwise the ten required problems cannot be accepted.
- A provider/data-processing decision for any model used with learner data (provider, region, retention, training use, subprocessors, redaction). Until then, only a fake adapter with synthetic data is safe.
- A minimum eval corpus size, severity taxonomy, adjudication owner, and initial gate policy. Otherwise the eval harness has no reproducible target.
- A pilot accessibility/accommodation scope and measurable latency/monthly model budget target. WCAG 2.2 AA remains the baseline while the pilot scope is decided.

Hosting/authentication vendor selection matters for Phase 1 and production, but need not block Phase 0 if ports, synthetic/local identity, and an ADR are defined. Exact mastery weights are experiments, not blockers; keep them configurable and do not present them as validated constants.

### Scope assessment

The modular-monolith choice is appropriate for the MVP. Domain seams, provider abstraction, fake adapter, versioned content, structured tutor output, and a background-job seam support the ratios slice without premature microservices, vector infrastructure, agent swarms, mobile clients, or organization tenancy.

The principal scope risk is attempting too much policy and data surface at once. Phase 0 should stay limited to repository/tooling, decisions, contracts, a small reviewed content seed, a deterministic fake tutor/trace boundary, privacy/threat artifacts, and minimal local persistence. Defer real provider integration, adaptive mastery calibration, queue complexity, and broad UI.

### Coverage assessment

- Tutor policy is conceptually strong, but needs an explicit transition table, accessibility override constraints, validator/equivalence rules, confidence semantics, and versioning requirements.
- Child safety has sound prohibitions and fallback/moderation requirements, but lacks age/guardian assumptions, abuse/self-harm escalation, operational ownership, and safety-record lifecycle rules.
- The data model has the right entities and immutable-evidence principle, but lacks relationships, access-control rules, PII classification, lifecycle fields, and migration strategy.
- Evaluation has the right pyramid and dimensions, but needs reproducible corpus, labels, severity, adjudication, fixtures, and baseline/gate ownership.
- Privacy covers minimization, consent, no advertising/training, encryption, deletion/export, vendor review, and legal review. It still needs a data-flow inventory, regions/subprocessors, backup deletion behavior, logging access policy, incident contacts/timelines, and notices.

## Proposed Phase 0 issue sequence

Each issue is intentionally issue-sized. Expected paths are targets and may be adjusted during implementation without expanding scope.

### 1. LF-0.1 — Approve pilot boundaries and decision register

- Objective: Convert open questions into approved pilot assumptions and establish ADR conventions.
- Rationale: Identity, consent, content, provider, budget, accessibility, and evaluation choices constrain later contracts.
- Expected files: `docs/09-decisions-and-open-questions.md`, `docs/adr/0001-phase-0-boundaries.md`, optionally `docs/adr/README.md`.
- Acceptance criteria: pilot learner/parent assumptions, pseudonym policy, consent/retention/deletion ownership, provider/data boundaries, content provenance, accessibility scope, latency/budget targets, eval ownership/severity, and deferrals are recorded with owners/dates.
- Tests and verification: Markdown/link check and reviewer checklist covering every open question.
- Dependencies: none.
- Risks: premature decisions may constrain evidence; record reversal signals and keep experiments configurable.
- Human decision required: Yes — product owner, privacy/legal, and educator/parent review as applicable.

### 2. LF-0.2 — Establish repository quality gates and contribution workflow

- Objective: Add the minimal TypeScript/Next.js shell, formatting/type/test commands, CI, and issue/PR templates without product behavior.
- Rationale: Phase 0 needs a reproducible fresh-clone path and green CI.
- Expected files: `package.json`, `tsconfig.json`, formatter/linter config, `vitest.config.*`, `.github/workflows/ci.*`, `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`, minimal `src/`/test placeholder, `.gitignore`, README setup section.
- Acceptance criteria: one deterministic documented check command; CI runs formatting, type checking, and unit tests; secrets are excluded; no feature UI or provider calls.
- Tests and verification: formatter check, type check, unit tests, CI-equivalent command, `git diff --check` (after dependencies are approved/available).
- Dependencies: LF-0.1.
- Risks: scaffolding can expand into premature architecture; keep it minimal.
- Human decision required: No, unless the approved stack/CI platform changes.

### 3. LF-0.3 — Define domain contracts and structured tutor schemas

- Objective: Define Zod/domain contracts for content, attempts, assistance, tutor moves, traces, mastery evidence, and provider ports.
- Rationale: Hard constraints require separate domains, structured model output, and rejection/repair of invalid output.
- Expected files: `src/domain/**`, `src/contracts/**`, `tests/contracts/**`, and an ADR for consequential choices.
- Acceptance criteria: malformed/unsafe outputs reject; authorization is separate from phrasing; move confidence is explicitly not mastery confidence; traces include policy/prompt/model/latency/tokens/validation/outcome and omit raw child text by default; ports expose no provider-specific types.
- Tests and verification: Vitest valid/invalid schema, leakage flags, fallback-required validation, redaction, and adapter-boundary tests.
- Dependencies: LF-0.1, LF-0.2.
- Risks: over-modeling future subjects; implement only ratios-slice needs.
- Human decision required: No, except for changes to approved privacy/policy semantics.

### 4. LF-0.4 — Define persistence and local database contract

- Objective: Turn core entities into a minimal relational schema and reversible migration/local PostgreSQL workflow.
- Rationale: Evidence, traceability, consent, and derived mastery need durable boundaries.
- Expected files: `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.*`, local DB docs/config, persistence integration tests, and a persistence/retention ADR if needed.
- Acceptance criteria: IDs/relationships/timestamps/version/access ownership are explicit; raw attempts are immutable; derived mastery references attempts and algorithm version; PII/free-text retention/deletion hooks are documented; rollback evidence exists; seed data is synthetic/original.
- Tests and verification: migration apply/rollback, cross-household authorization, immutability/version-link, export/deletion, and schema tests.
- Dependencies: LF-0.1, LF-0.2, LF-0.3.
- Risks: irreversible or overbroad retention; no production data permitted.
- Human decision required: Yes for final retention/deletion and identity fields.

### 5. LF-0.5 — Create and review the ratios content seed

- Objective: Author ten original, versioned ratios problems with mappings, difficulty, solutions, misconceptions, approved hint ladders, provenance, and review records.
- Rationale: Required Phase 0 content is the foundation for deterministic tutor/eval work.
- Expected files: `content/ratios/**`, `content/schema.*`, `scripts/content-validate.*`, content tests, `docs/content-review.md`.
- Acceptance criteria: ten problems cover intended skill types/difficulty; every item validates; each has deterministic answer/validator, hint ladder, forbidden leakage patterns, provenance/license, reviewer, version, and accessibility notes; no proprietary text is reproduced.
- Tests and verification: schema/semantic validation, deterministic answer tests, reviewer checklist, answer-equivalence/leakage fixtures.
- Dependencies: LF-0.1, LF-0.2, LF-0.3.
- Risks: derivative copying, math errors, inaccessible representations; educator/content review mandatory.
- Human decision required: Yes — provenance, originality, math quality, and workflow approval.

### 6. LF-0.6 — Implement the deterministic fake tutor and policy harness

- Objective: Implement the policy state machine, fake `TutorModel`, structured validation, answer protection, bounded fallback, and privacy-filtered traces for synthetic sessions.
- Rationale: This is the highest-value Phase 0 behavioral seam and enables Phase 1 without a real model or child data.
- Expected files: `src/tutor/**`, `src/policy/**`, fake adapter, trace/audit implementation, `tests/unit/**`, `tests/integration/**`, policy version fixture/ADR.
- Acceptance criteria: server state cannot be skipped by model output; genuine-attempt/assistance rules are deterministic/configurable; canonical answers are absent from early context; invalid output repairs once then falls back without mastery advancement; traces redact child text by default; Math Tutor and Contest Coach are versioned policy profiles.
- Tests and verification: transition, attempt, assistance, answer-protection, fallback, and mastery non-advancement unit tests; fake-output contract/orchestration integration tests; leakage, injection, tone, and accessibility eval fixtures.
- Dependencies: LF-0.3, LF-0.5; LF-0.4 if traces persist here.
- Risks: fake behavior can create false confidence; exercise failure paths and label real-model quality as unverified.
- Human decision required: Yes for policy defaults and fallback language; no credentials needed.

### 7. LF-0.7 — Produce the threat model, privacy inventory, and pilot controls

- Objective: Map data flows/threats and define controls for identity, content, attempts, tutor text, traces, providers, backups, export, and deletion.
- Rationale: Current principles are not an actionable pilot-readiness baseline.
- Expected files: `docs/threat-model.md`, `docs/privacy-inventory.md`, `docs/incident-response.md`, `docs/pilot-readiness-checklist.md`, relevant ADR updates.
- Acceptance criteria: each data class has purpose, minimization, access role, region/storage, retention, deletion/backup behavior, export format, processor status, and logging policy; threats include cross-user access, injection, leakage, unsafe content, abuse, and credential compromise; escalation/owners and legal-review gates are named; no secrets/real child data included.
- Tests and verification: completeness checklist, secret-like-value scan, authorization/privacy cases linked to controls, reviewer sign-off.
- Dependencies: LF-0.1, LF-0.3, LF-0.4 (can start in parallel after data assumptions stabilize).
- Risks: docs can go stale; assign owners and link later verification issues.
- Human decision required: Yes — privacy/legal, security, and product sign-off.

### 8. LF-0.8 — Establish baseline tutor eval corpus and release gate

- Objective: Version a small reviewed synthetic eval set and reproducible runner/report for tutor quality and safety dimensions.
- Rationale: Phase 2 gates need a baseline, severity taxonomy, and regression evidence.
- Expected files: `evals/cases/**`, `evals/schema.*`, `scripts/eval.*`, `reports/README.md`, `tests/evals/**`, `docs/evaluation-baseline.md`.
- Acceptance criteria: cases cover leakage, hint progression, correctness, tone, age appropriateness, injection, accessibility, confident-wrong, and frustrated learners; each defines allowed/forbidden outcomes, severity, equivalence, rubric, provenance; fake-adapter report is deterministic, traceable, and does not claim uncalibrated thresholds; adjudication and threshold-setting are documented.
- Tests and verification: eval schema, golden fake run, malformed-case rejection, reproducible report, CI smoke gate; no real model/learner data.
- Dependencies: LF-0.3, LF-0.5, LF-0.6, LF-0.7.
- Risks: small corpus misses failure modes; label baseline and expand in Phase 2.
- Human decision required: Yes — corpus scope, severity labels, and gate ownership.

### 9. LF-0.9 — Phase 0 integration verification and handoff

- Objective: Prove the fresh-clone synthetic seed/fake-tutor path and update the durable handoff record.
- Rationale: Phase 0 exit is a reproducible repository/CI baseline, not a learner-facing product.
- Expected files: `README.md`, `docs/PROGRESS.md`, config files only as needed, optional retrospective.
- Acceptance criteria: documented one-command setup/check succeeds from a fresh clone; CI is green; migrations/rollback, content validation, contract/unit/integration tests, eval smoke, privacy/threat checklist, ADRs, approvals, risks, and exact Phase 1 prompt are linked; no commit/push by the agent.
- Tests and verification: formatting, type, unit, contract, persistence integration, eval smoke, accessibility/static checks where available, `git diff --check`, working-tree review.
- Dependencies: LF-0.2 through LF-0.8 as applicable.
- Risks: environment-specific setup failures; document supported versions and distinguish unavailable services from product failures.
- Human decision required: Yes — accept Phase 0 exit and authorize Phase 1.

## Verification log

| Date | Command/eval | Result | Notes |
|---|---|---|---|
| 2026-09-04 | `rg --files -g 'README.md' -g 'AGENTS.md' -g 'docs/**' \| sort` | Pass | Confirmed the complete instructed document set. |
| 2026-09-04 | Read `README.md`, `AGENTS.md`, and all `docs/*.md` | Pass | Reviewed 818 lines; no application code exists. |
| 2026-09-04 | `git status --short --branch` and repository inspection | Pass | On `feature/project-foundation`; documentation-only repository. |
| 2026-09-04 | `test -f docs/adr/README.md && test -f docs/adr/0001-phase-0-boundaries.md && rg -n 'Phase 0 decision register\|LF-0\\.1\|Pending human approval\|Required owner/reviewer\|Next exact prompt' docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md` | Pass | ADR convention, decision register, approval statuses, and handoff are present. |
| 2026-09-04 | `git diff --check` | Pass | No whitespace errors in the LF-0.1 changes. |
| 2026-09-04 | `git status --short --branch && git diff --stat && git ls-files --others --exclude-standard` | Pass | Only the intended LF-0.1 documentation files are modified or untracked. |
| 2026-09-04 | ADR status/approval-record review | Pass | ADR status is exactly `Proposed`; owner roles and 2026-09-11 planning target dates are explicit; approvals remain pending. |
| 2026-09-04 | `rg -n --fixed-strings -- "- Status: Proposed" docs/adr/0001-phase-0-boundaries.md` | Pass | ADR status conforms to the documented allowed values. |
| 2026-09-04 | `rg -n "Target date\|2026-09-11\|Pending approval" docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md` | Pass | Owner/reviewer roles, target dates, and pending approval states are explicit. |
| 2026-09-04 | `git diff --name-only && git ls-files --others --exclude-standard` | Pass | Changes remain limited to LF-0.1 documentation and ADR files. |
| 2026-09-04 | `test ! -e package.json` | Pass | Confirms no application toolchain exists; formatting/type/test/build checks remain not applicable. |
| 2026-09-04 | `git pull --ff-only` on `main` | Pass | `main` was already up to date with `origin/main` before creating the feature branch. |
| 2026-09-04 | `git switch -c feature/phase-0-decisions` and `git stash pop` | Pass | LF-0.1 work was restored on the appropriately named feature branch without loss. |
| 2026-09-04 | Required-file, status, owner/date, and scope checks | Pass | ADR convention and boundary decision register satisfy LF-0.1 documentation criteria; all approvals remain explicitly pending. |
| 2026-09-04 | Formatting, linting, type checking, unit/integration tests, build verification | Not applicable | This issue changes documentation only; no `package.json`, source, test runner, lint config, build config, or dependencies exist. |
| 2026-09-04 | `set -eu; test -f docs/adr/README.md; test -f docs/adr/0001-phase-0-boundaries.md; rg -n --fixed-strings -- "- Status: Proposed" docs/adr/0001-phase-0-boundaries.md; rg -n "Phase 0 decision register|Decision owner: Product owner|Target date|Pending human approval|Next exact prompt" docs/09-decisions-and-open-questions.md docs/adr/0001-phase-0-boundaries.md docs/PROGRESS.md; git diff --check` | Pass | Final LF-0.1 document, ADR-format, decision-register, handoff, and whitespace checks passed. |
| 2026-09-04 | `test ! -e package.json; rg -n --hidden -g '!.git/**' -g '!docs/**' -g '!AGENTS.md' -g '!README.md' 'OPENAI_API_KEY|AWS_SECRET_ACCESS_KEY|BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY' .` | Pass | No application toolchain or secret-like values found outside intentional documentation references. |
| 2026-09-04 | `find . -path './.git' -prune -o -type d \( -name node_modules -o -name .next -o -name dist -o -name build -o -name coverage \) -print; find . -path './.git' -prune -o -type f \( -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' \) -print` | Pass | No generated build output or local database files found. |
| 2026-09-04 | Full LF-0.1 branch review against acceptance criteria | Pass | No critical, high, or valid medium findings remain; changes stay within LF-0.1. |
| 2026-09-04 | Formatting, type checking, unit/integration tests, build verification | Not applicable | No `package.json`, application source, test runner, build configuration, or dependencies exist; LF-0.2 owns the scaffold and these commands. |
| 2026-09-05 | `npm run verify` | Pass | Final run: Prettier, ESLint with Next.js rules, TypeScript, Vitest (1 test), and Next production build all passed. |
| 2026-09-05 | `git diff --check` | Pass | Final LF-0.2 diff has no whitespace errors. |
| 2026-09-05 | `git status --short --branch && git diff --name-only && git ls-files --others --exclude-standard` | Pass | Only intended LF-0.2 files are modified or untracked; generated output remains ignored. |
| 2026-09-05 | `git pull --ff-only` on `main` | Pass | Main was synchronized before creating the LF-0.2 branch. |
| 2026-09-05 | `npm install` | Pass with risk noted | Generated `package-lock.json`; npm reported 2 vulnerabilities (1 moderate, 1 high) and install-script approval warnings. No forced audit fix was run. |
| 2026-09-05 | `npm run format` | Pass | Formatted the LF-0.2 source, configuration, README, and issue-template files. |
| 2026-09-05 | `npm run verify` | Pass | Prettier, ESLint with Next.js rules, TypeScript, Vitest (1 test), and Next production build all passed. |
| 2026-09-05 | `npm audit --omit=dev` | Unable to complete | Registry DNS resolution failed in the environment; dependency audit status remains an unresolved follow-up risk. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.2 changes. |
| 2026-09-05 | Staged-file and generated-output audit | Pass | Only intended LF-0.2 files are in scope; generated output is ignored; no secrets or learner data present. |
| 2026-09-05 | `npm ci && npm run verify` | Pass with risk noted | Fresh-lockfile install and the complete verification suite passed; npm reported 2 vulnerabilities (1 moderate, 1 high) and install-script approval warnings. |
| 2026-09-05 | Full LF-0.2 branch diff review | Pass | No critical, high, or valid medium findings across correctness, pedagogy, privacy, safety, accessibility, or architecture; no future-issue work found. |
| 2026-09-05 | `git pull --ff-only` on `main` | Pass | Main was synchronized after LF-0.2 merge before creating the LF-0.3 branch. |
| 2026-09-05 | `npm install zod` | Pass with risk noted | Added the approved schema-validation dependency; npm again reported 2 vulnerabilities (1 moderate, 1 high). |
| 2026-09-05 | `npm run format && npm run verify` | Pass | Prettier, ESLint with Next.js rules, TypeScript, Vitest (10 tests), and Next production build passed. |
| 2026-09-05 | LF-0.3 contract and scope review | Pass | Contracts separate policy authorization from model phrasing, redact traces by default, constrain provider inputs, and contain no persistence/orchestration/provider implementation. |
| 2026-09-05 | `git diff --check` | Pass | No whitespace errors in the LF-0.3 changes. |
| 2026-09-05 | Secret/private-data/generated-output audit | Pass | No credentials, private learner data, local databases, or generated build artifacts are in the intended change set; ignored build-info remains untracked. |

## Decisions/ADRs

- LF-0.1 ADR-0001 remains the applicable architecture decision.
- LF-0.2 uses the approved TypeScript/Next.js modular-monolith stack.
- LF-0.3 adds no new consequential architecture decision; Zod is the approved validation convention from the blueprint.

## Risks/blockers

- Human approvals recorded as pending in ADR-0001 remain required before affected Phase 0 deliverables can be accepted.
- npm reported 2 vulnerabilities during install; the audit endpoint was unreachable, so severity/source remediation is a follow-up before relying on the dependency set beyond local development.
- Curriculum content must be original or appropriately licensed and independently reviewed.
- No real learner data or provider credentials should enter the repository or eval fixtures.
- LF-0.2 intentionally does not add authentication, a database, provider integration, domain schemas, or product features.
- LF-0.3 intentionally does not add persistence, tutor orchestration/state transitions, content seed, model adapters, or authentication.

## Session handoff

- Uncommitted changes: LF-0.3 contracts, tests, dependency lockfile updates, and this progress update
- Next exact prompt: `Implement LF-0.4 from docs/PROGRESS.md only. Read applicable docs, restate scope and assumptions, define the minimal reversible persistence/local PostgreSQL contract with tests, and do not implement content seed, tutor orchestration, provider integration, or later issues.`
