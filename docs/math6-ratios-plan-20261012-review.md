# MATH6-RATIOS-PLAN independent review

Date: 2026-10-12. Verdict: **changes requested; not ready for human review**.
Two majors and one minor in the proposed follow-on packets. No files changed
by reviewer; no content, policy, private-access, migration or release approval.

## Frozen evidence and independence

- Report: common Git metadata
  `agent-handoffs/MATH6-RATIOS-PLAN/grade-6-math-ratios-plan.md`, SHA-256
  `7183d813950884d51e614eba7380543ff0f8e6f18d4d0615f75da005fb36cd1a`.
- Patch SHA-256:
  `e61dba3a83d9ceadd0f9f4ce3851f6a7225b7ae92c8fa0769a83fca87b70ff82`.
- Manifest SHA-256:
  `810f3e8f5dd3f2d0f99f0bad873b8985bd95671f99c7f9946bd6392c049b3dad`.
- HEAD `3e7c33372599d20c285656c3610ca6e47743240f`, main. In-memory patch
  reconstruction equals the 548-line frozen document and adds only the
  assigned path. Substantive input hashes match, including D-149/D-150 dirty
  authority overlay and accepted reconciliation. Live packet/index/PROGRESS
  differ from author-time hashes due to subsequent checkpointing.
- Actual author verified from successful client metadata: only
  `claude-opus-5-5`; assistant UUID `91dd05ef-b62c-4374-ae11-d78883e25b1d`,
  timestamp `2026-10-12T21:21:21.943Z`, reports exact hashes. Runtime subagent
  `agent-a3721004b9d8ee958.jsonl` in Claude session
  `22bffa60-935a-47f3-a703-6ff9ab4853d0`.
- Reviewer `/root/math6_ratios_plan_review`, host-provided native
  `forge-reviewer` fixed to `gpt-6.1-sol`, fresh context, completed turn;
  cross-family independence holds.

Frozen plan line references below refer to the metadata artifact.

## R-1 — Major, high confidence: new practice loading omitted

Locations: plan 433, related 425, 459 and exposure assertion at 441.
RAT-CONTENT owns JSON files; RAT-CATALOG-IMPL and RAT-INTEGRATE omit
`src/content/catalog.ts`. That catalog explicitly imports items (1–10)
and enumerates `rawContent` (140–150). New files in `content/ratios/`
alone are not loaded, are not covered by catalog-driven validation/publication
checks and cannot resolve new lesson references. Merging reviewed practice
does not alone make newly added files servable.

Minimal correction: assign imports/registration and applicable `tests/content/`
coverage to one named packet; define validation of every frozen draft before
registration; retain owner authorization for public exposure. Require every
new practice identity to resolve with its intended version/hash.

## R-2 — Major, high confidence: characterization versus V-7 acceptance

Locations: plan 263, related 269, 372, 405, 411.
The plan invokes reconciliation V-7 over all public `parts` items while
preserving legacy scoring and excluding other-domain migration. V-7 requires
rejection of padded numbers, negation, incorrect order and extra claims
(`docs/grade-6-math-reconciliation.md:745`). Current substring matching
(`src/content/answer-matching.ts:56`) permits `ratio-tables-2`'s accepted
`80` and `16` substrings to match incorrect `180, 16`. Opt-in structured
scoring does not fix unchanged legacy validators.

Minimal correction: distinguish legacy characterization from correctness
acceptance for new structured validators/item versions. Identify the V-7
portion still unmet and separately approved packets that would close it.
Do not claim full V-7 completion, weaken its rejection expectations or
silently change legacy semantics to pass.

## R-3 — Minor, high confidence: teaching approval reference

Location: plan 375. RAT-CONTENT permits teaching if IC-8 and a storage path
exist. IC-8 authorizes catalog design/subject review (488); O-12 teaching
is IC-7 (487). Section 3.6 correctly requires a separate teaching D-61 scope.

Minimal correction: use applicable approved IC-7 disposition and explicitly
retain separate teaching D-61 exception and accepted storage-path dependency.

## Supported inventory and remaining gates

Public bytes support the five selected skills, two practice records each,
disconnected extension lessons, stale pilot versions, missing double-number-line
representation, substring weakness, code-only program selection and state
writers iterating lessons claiming a skill. Candidate versions/status/provenance
and conversion-needed sub-letter standards match source files. Underlying
defects are evidence, not correction authorization.

Owner choices remain O-3 placement/representation, O-8 versions, O-9 scoring,
O-11 volumes, O-12 teaching, live scoring-risk disposition and follow-on packet
authorization. Keeping double-number-lines at skill 1.0.0 preserves older
evidence from tasks not eliciting representation; its limitation needs owner
disposition. D-61, O-10 access/review, item approval, state transition,
migration/privacy, publication, activation and release are separate.

## Validation and return

Prettier 3.9.6 in-memory Markdown check, patch whitespace, `git diff --check`
and `git apply --check` passed. Only integrator claim present. Static public
review only; no private/learner/database/provider access, runtime suites or
probes. Archive coverage, private suitability and existing state unverified.

Return to original Claude `forge-expert` / Opus for report corrections only.
Freeze revised report/patch/manifest for changed-scope Codex review. Current
report remains unapplied; no acceptance request until corrected review.
