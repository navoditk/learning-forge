# ELA-RESEARCH — Grade 6 ELA curriculum source research

<!-- relay-phase: IN_PROGRESS -->

## Live relay

- Phase (2026-11-15): **DONE (research); decisions disposed under D-212
  (D-326); ELA-D16 AWAITING the owner.** Codex `gpt-6.1-sol` accepted
  ELA-D1,D2,D3,D5,D6,D7,D8,D9,D11, modified D4 (do not use the IUSD document),
  deferred D10 and D12 to D15 to separate packets, escalated D16 (privacy), and
  deferred ELA-O2 to O4 individually. The dossier is merged into
  `docs/curriculum-sources.md` as a reviewed research section. No authoring,
  D-61 exception, registration, availability, commit or push is authorized.
- Earlier phase (2026-11-13): **DONE (research); AWAITING_HUMAN content review**.
  Re-review r2 by Codex `gpt-6.1-sol`: **READY_WITH_RISKS**, ELA-R1 and ELA-R2
  closed, one minor (ELA-R3: ELA-O2 to O4 unmapped to decisions) annotated in
  `agent-handoffs/ELA-RESEARCH/rev2/integrator-annotation.md`, not corrected
  (window C exhausted). Dossier SHA-256
  `c30ff0071c899e517f9093bf9135ca07df7547c382268a14d9ed9d960ad472d9` placed
  untracked at `docs/curriculum-dossiers/grade-6-ela-20261113-research.md`. Not
  merged into `docs/curriculum-sources.md`; owner decisions ELA-D1..D16 open; no
  authoring authorized. Next role: owner content review, then (if approved) a
  separately scoped authoring-prerequisites packet.
- Earlier phase: **REVISED, FROZEN r2; CHANGED-SCOPE RE-REVIEW RUNNING**
  (window C, 4 of 4: the window is now fully used; any further round needs an
  owner extension). Revised dossier SHA-256
  `c30ff0071c899e517f9093bf9135ca07df7547c382268a14d9ed9d960ad472d9` (512
  lines). The integrator verified the hash, Prettier, that "range and volume"
  and "toward the high end" no longer appear, stable ids ELA-D1..D16 and
  ELA-O1..O14 present, and no stale numeric cross-reference. Frozen copy, word
  diff and review packet in `agent-handoffs/ELA-RESEARCH/rev2/`.
- Earlier phase: **REVIEW r1 NOT_READY; CORRECTIONS RUNNING** (window C,
  3 of 4; one invocation left for the re-review, any more needs an owner
  extension). Codex `gpt-6.1-sol`: ELA-R1 major, RL.6.10/RI.6.10 reading
  proficiency reduced to exposure; ELA-R2 major, human decisions lack separable
  recommendations (6, 9, 10; open item 13 missing). Same Opus author resumed.
  The "FROZEN; INDEPENDENT REVIEW RUNNING" note below is superseded.
- Earlier phase: **FROZEN; INDEPENDENT REVIEW RUNNING**. Dossier SHA-256
  `8a3f998c60ddb9b5856dd06502446e55428ae01e9a9b4e8378c0c38216d08996` (415 lines,
  author `claude-opus-5-5` per session context, unverified by client metadata).
  Frozen copy and review packet in common Git
  `agent-handoffs/ELA-RESEARCH/rev1/`; Codex `gpt-6.1-sol` read-only review
  launched (window C, 2 of 4). Staged file still sits untracked in the isolated
  worktree; nothing is committed or merged into `curriculum-sources.md`.
- Earlier phase: **DISPATCHED**. Author: Claude Code `forge-expert`
  (Opus), isolated worktree. Reviewer: Codex `gpt-6.1-sol`, read-only
  (cross-family). Window `claude-window-20261113c` (72 hours, 4 invocations).
- Independent of PYTHON-IMPLEMENT; owns one new file and touches no runtime path.

## Goal

Produce the staged research dossier required by
`docs/curriculum-research-playbook.md` for Grade 6 English Language Arts, so a
later, separately gated authoring step can start. Output file (the only file
this role may create or edit):
`docs/curriculum-dossiers/grade-6-ela-20261113-research.md`.

## Scope

Follow the playbook inputs 1 to 4 (standards framework, optional local
sequencing input, content style sources with an explicit originality
confirmation, open items). Likely framework: California Common Core State
Standards for ELA/Literacy (grade 6), with the ELA/ELD Framework and the
state assessment blueprint as secondary context; verify against primary
sources and cite exact title, adopting body, date and a clickable URL, or an
identifier with honest retrieval status. Cover the strands (reading
literature, reading informational text, writing, speaking and listening,
language) and note which fit a text-and-typed-response tutor and which do not.

## Rules

- Research and writing only: no skill graph, content records, JSON, code,
  tests, schema, policy or runtime change; no `docs/curriculum-sources.md`
  edit (the integrator merges a reviewed dossier later).
- Passages: no copyrighted or licensed text may be reproduced or closely
  paraphrased; identify only public-domain or original-text routes, and flag
  any licensing question as a separate human decision.
- Tutor fit: record, as open items and not decisions, how writing feedback
  could stay consistent with the hard constraint that the tutor never does the
  child's work or exposes a final answer early.
- Never invent a source, URL or date; write an explicit open item instead.
- Do not edit shared status files (`docs/PROGRESS.md`, handoff index,
  decisions), `AGENTS.md`, or agent configs. Do not commit or push.

## Done means

Return the dossier path and its SHA-256, a playbook-inputs-to-evidence table,
the actual model ID, and an explicit list of open items and human decisions
needed. Then stop; the integrator freezes it for the Codex review.

## Open gates after this packet

Independent review; owner/content review of the dossier; the D-61 authoring
pause; a separately scoped authoring-prerequisites specification; then content.
None are authorized here.
