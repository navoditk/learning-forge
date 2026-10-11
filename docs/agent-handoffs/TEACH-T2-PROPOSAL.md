# TEACH-T2-PROPOSAL

Phase: **DONE / PROPOSAL ACCEPTED**.

## Authority and scope

Owner input, 2026-10-10: "proceed, anything waiting approval or running in
background ?" immediately after the next issue was identified as the
approval-gated T2 persistence/privacy proposal.

This authorizes one writer-free specification and independent review, not
T2 implementation, Prisma/SQL files, database operations, data writers,
routes, provider calls, content, policy values, activation or release.
D-139/D-142 shape approval is unchanged; all other open choices remain open.
No automatic commit/push follows from the earlier startup-specific request.

Scope: shared immutable teaching delivery context and LearningEvent linkage,
tenant/actor/version/idempotency integrity, privacy/export/deletion/retention
ordering and a scratch-only future migration validation plan. Adopt no new
numeric defaults. Do not redesign interlock or implement replay/completion.

## Ownership and input baseline

- Integrator/reviewer: Copilot GPT-6.1 Sol, host model configuration.
- Architect: allocated Copilot Claude Opus 5.5; verify task result metadata.
- Main/worktree HEAD: `d70287d41d93e87f3c5845e38218fa51e1a2c221`.
- Architect writes only `docs/teaching-persistence-privacy-proposal.md` in
  the isolated `teaching-t2-proposal-worktree` under the current session's
  local files directory. All input overlays and main are read-only.
- Integrator owns this packet, proposal import, review report,
  `docs/course-progression-handoff.md`, `docs/coding-agent-handoff.md` and
  `docs/PROGRESS.md`. Workers do not edit shared status.
- Local overlay: `teaching-t2-input-overlay.patch` beside that worktree,
  SHA-256 `846e636b7d7471e9adbc44f5bb30d8e03787d2ec83851c53ff7c5c2e6e33af1f`.
  Contains only the current progression handoff/decision matrix and
  learner-state reader changes. It does not include the entire dirty tree.
- Added input: teaching contract SHA-256
  `c18411c4648cd50f40782e18555c4dfbe1977b7f7bfa4c15c50be73b47a161ff`.
  Preserve its exact reviewed bytes.
- Added T1 input: `src/contracts/teaching-catalog.ts` SHA-256
  `c4158d5870a01001794fb6298ceff435c77cdd886c0638fafc34f863136cef3e`;
  `src/contracts/teaching-delivery.ts` SHA-256
  `6a2d8e0174efde1a6e7b66210513a943b3dc42691a7511bd069290651c9c5d3d`.
- Current main has additional unrelated dirty/untracked work. Neither this
  worktree nor a clean clone claims it is the complete course checkpoint.

## Required inputs

Read the progression handoff first, then AGENTS, progression playbook,
architecture, decision matrix, teaching contract/T1 schemas, ADR-0013 and
the privacy/data/migration documents relevant to actual code.
Re-derive references from `prisma/schema.prisma`,
`src/server/household-data.ts`, existing event and assessment persistence,
archive resolvers and migration tests. Cite actual file/symbol/line evidence.

## Deliverable and boundary

One proposal with preserve/replace/gap inventory, five-layer ownership,
implementable constraint design, legacy-null compatibility, immutable evidence
versus lawful erasure, D-143/D-144 branch treatment, migration stage/rollback
matrix, named future falsifying tests and a separate human gate table.
Proposed tests/SQL designs are not executable validation or approval.
Return frozen file hash and precise unresolved choices; stop after authoring.
The GPT integrator reviews without altering architect-authored bytes; required
corrections return to the original author before another frozen review.

Next eligible role after authoring: **GPT cross-family read-only reviewer**.
No migration/writer or other backlog task is eligible after review without
its separate human scope, privacy and migration approvals.

## First frozen proposal and review

- Architect task runtime metadata identifies `claude-opus-5.5`; initial
  artifact hash `851e464db949c75e182a6cff27a5bc6aa7a49a828f8d5ba579bd7a100732c31c`.
- GPT-6.1 Sol integrator directly reviewed proposal, actual schema, T1
  schemas, household export/delete implementation and coverage tests,
  integration/migration runners and existing immutable/guarded-down SQL.
- Changes requested: R1 remove integrity-weaker Prisma fallback; R2 enforce
  paired-history integrity against TRUNCATE; R3 correctly classify linked
  provenance as personal data and operation-key free-text risk; R4 wire
  prospective tests and isolate seeded rollback probes; R5 keep discovered
  owner choices in sole matrix and correct stage gating.
- D-145/D-146/D-147 now record actor-history, key minimization and retention
  choices in the authoritative matrix, all OPEN. Count: 77 approved/70 open.
- Final corrected artifact imported hash-exact at
  `docs/teaching-persistence-privacy-proposal.md`, SHA-256
  `d142183646e35c7c8e7c997bad3711e40e69fcccd76e097706cb736023a26e5d`.
- GPT changed-scope review closed R1–R6; recommendation: ready for human review
  with noted risks. Report:
  `docs/course-progression-review/teaching-t2-20261010-review.md`.
- No worker is running. Next eligible action is owner acceptance and
  D-145–D-147 choices plus scoped T2a implementation/probe authorization.
  No test or SQL execution proves the illustrative constraints.

## Owner disposition

Owner approval form accepted the final proposal and explicitly approved
D-145/D-146/D-147 on 2026-10-10. Authorized isolated T2a draft and disposable
local scratch validation only, with independent and human migration review
before integration. Successor: `docs/agent-handoffs/TEACH-T2A.md`.
Historical OPEN/pending wording above and in frozen proposal reflects
review time; the updated sole matrix is approval authority. No serving,
production access, writer, content, deployment or commit/push authorized.
