# LIFECYCLE-L2

Phase: **SCOPED / READY_FOR_EXPERT** (dispatch on "continue" in Claude Code).

Next client/role: **Claude Code `forge-expert`, `opus`**, writer-free decision
brief. Then Codex `forge-reviewer` (`gpt-6.1-sol`; verify the loaded role).
Stop after: the brief is written and the integrator records it. No next task.
No commit, push or deployment under this packet.

## Authority and scope

On 2026-10-11 the owner asked the Sonnet integrator to scope index row 6
(Lifecycle L2 prerequisite/probe decisions) for Opus, after the reviewed
checkpoint was pushed. This scopes one document-only task. It authorizes no
migration, Prisma/SQL file, schema, service, route, test, env or data change,
no database operation and no provider call. S-01..S-14 stay approved for L1
only; L2 and L3 keep their separate manual gates. **Synthetic probes
(G-12/G-13) are not authorized by this packet**; the brief may only specify
them for a later owner decision.

## Inputs (read, do not edit)

`docs/learner-session-l2-persistence-preflight.md` (revision 3),
`docs/learner-session-l2-persistence-review.md`,
`docs/learner-session-lifecycle-design.md`, and the decision matrix and
manual-gate record named in `docs/course-progression-handoff.md`. Re-derive
every code claim from the current tree (e.g.
`src/progression/legacy-session-drain.ts`, the eight terminal write sites in
preflight §3, `src/server/recall-cards-flag.ts` as the activation-flag
pattern) with file/symbol/line evidence. Control main HEAD at scoping:
`68ba86d`; re-read it before work. Preflight prose is not proof of behavior.

## Deliverable

One new file, `docs/lifecycle-l2-decision-brief.md`, and nothing else.
For each open L2b item in preflight §13.1 (H-01, H-02 cases (i)–(iv), A-1,
C-1) give: re-verified current-code facts; each reviewed alternative with
concrete consequences (learner-visible effect, D-28/R7 impact, data written);
a recommendation with rationale; and the exact owner wording that would
approve it. A recommendation is not an approval. Add: (a) a statement of
what L2a can proceed on without any L2b answer and what it still needs
(migration/privacy review, down.sql); (b) a G-12/G-13 synthetic-probe plan
(disposable local PG16 only, commands, expected results) written for a
later explicit authorization, not run; (c) any contradiction found between
the preflight, design and code, reported rather than silently resolved.
Adopt no new numeric defaults or labels; option D (new outcome label) must be
presented as needing L1/enum change and approval.

## Ownership and independence

Expert writes only the brief. The integrator owns this packet, the resume
index, PROGRESS and the review report. Author model must be verified from
client metadata. A Claude-authored brief needs cross-family review by the
Codex reviewer; Opus self-review or Sonnet review does not satisfy it. Safety,
privacy and authorization-adjacent content applies (see AGENTS cross-family
rule). Preserve unrelated dirty work, including the four untracked Geography/
Olympiad dossier files.

## Stop conditions

Stop and report (do not substitute) on: a missing input, a contradiction that
changes scope, a need to run a database/probe, an unverifiable model identity,
or a request to start implementation. Finish with **SWITCH TO: Codex,
forge-reviewer** naming the brief and its SHA-256.
