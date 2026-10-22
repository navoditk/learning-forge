# LIFECYCLE-L2

Phase: **DONE** (revision-2 brief reviewed; owner choices recorded).

Next packet: **`docs/agent-handoffs/LIFECYCLE-L2-PROBES.md`**, assigned to
Claude Code Sonnet for the separately authorized synthetic probes.
Stop after: this decision checkpoint; no L2a/L2b/L3 implementation follows.
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

## Expert brief returned (2026-10-11)

Brief `docs/lifecycle-l2-decision-brief.md` (untracked, uncommitted), SHA-256
`78c65659e8a8b961f38c765b688fc204a4925af8b83f59f53bc04832456e35c8`. Author: Claude Code `forge-expert` (agent definition `model: opus`;
harness-reported `claude-opus-5-5`); the reviewer must confirm identity from
client metadata. Authored against `5d4497c`; concurrent commit `3e7c333`
touched only PROGRESS, the index and four dossier files, not any input.
The integrator confirmed the hash, that no other file changed, Prettier and
`git diff --check`, and spot-checked X-2 (`0018` creates
`LearnerProfile_id_householdId_key`). No database, probe or provider was used.

Recommendations (not approvals): H-01 A; H-02 (i)–(iv) B (A fallback for (i);
A unavailable for (iv)); option D nowhere; A-1 acknowledge; C-1 broad reading.
Contradictions X-1–X-13 are reported, not resolved; X-1–X-3 (stale `0017`
baseline, `0018` already owning the LearnerProfile composite unique,
`LearningEvent.deliveryContext` mixed-relation precedent) require the L2a draft
to be revised under a later authorization. G-12/G-13 probe plan is unrun.

At this checkpoint, Codex `forge-reviewer` (`gpt-6.1-sol`) was next for
read-only cross-family review of the exact hash above. The review disposition
is recorded below; a changed brief needs re-review before owner decisions on
H-01/H-02/A-1/C-1 or probe authorization.

## Independent review returned (2026-10-11)

Report: `docs/lifecycle-l2-decision-20261011-review.md`. Fresh Codex
`forge-reviewer` (`gpt-6.1-sol`) verified actual `claude-opus-5-5` author
metadata, cross-family independence, the frozen brief hash and pinned inputs.
Verdict: **changes requested**: one major and two minors. The G-12/G-13 plan
must isolate each failure migration in its own scratch tree; P12-3 currently
would hit P12-2's deliberately failing `9002` first. The brief also overstates
D-28 immunity when an attempt was written but mastery was not, and incorrectly
claims null-kind legacy rows resume through a start query requiring a kind.

Next bounded action: original Claude Code Opus `forge-expert` corrects only
`docs/lifecycle-l2-decision-brief.md` against these findings. Preserve all
other files and the reviewed alternatives/owner-choice boundaries. Return a
new SHA-256, formatting/whitespace results and actual author metadata. A
changed brief returns to Codex `forge-reviewer`; no owner decision or probe
request should rely on the current brief. Database operations, probes, code,
schema, migrations, commit, push and deployment remain unauthorized here.

## Corrected brief returned (2026-10-11)

The original Opus `forge-expert` (resumed, same context; harness-reported
`claude-opus-5-5`, confirm from client metadata) corrected only
`docs/lifecycle-l2-decision-brief.md`. New SHA-256 `fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`, replacing
`78c65659...35c8`. HEAD `3e7c333`; no input or code changed. Integrator
verified the hash, Prettier and that no other file changed.

- Finding 1 (major): §7.2–7.5 now give every G-12/G-13 case its own scratch
  tree (pinned baseline from `BASE_COMMIT` via `git archive`, asserted 19
  migrations ending `0018`, plus only that case's probe), its own database and
  shadow, and an attempted-migration assertion before any interpretation
  (unexpected state invalidates the case). `p12_4`'s dependency on P12-1 was
  also isolated; teardown and evidence lists updated.
- Finding 2 (minor): §3.4 D-28 claim limited to fully completed attempt
  sequences; the non-transactional partial-write case (attempt at
  `service.ts:466` without mastery at `:533`) and its option-A counting effect
  are described. Whether such histories exist is unknown (no data inspection).
- Finding 3 (minor): resumption limited to the same content and activity kind;
  null-kind legacy rows stay open while a new kind-set row may be created.
- Recommendations unchanged (H-01 A; H-02 (i)–(iv) B; A-1 acknowledge; C-1
  broad; option D nowhere). Probe plan still unrun.

At this checkpoint Codex `forge-reviewer` re-review of hash
`fbd345f3...b2fd` was next. The disposition is recorded below; owner
decisions and probe authorization waited for it.

## Revision-2 independent re-review returned (2026-10-11)

Report: `docs/lifecycle-l2-decision-20261011-rereview.md`. Fresh Codex
`forge-reviewer` (`gpt-6.1-sol`) confirmed actual `claude-opus-5-5` author
metadata linked to the corrected brief, pinned source hashes and the exact
revision-2 SHA-256. Verdict: **ready for human review with noted risks**. All
three requested corrections are resolved; no new in-scope blocker or major
finding. G-12/G-13 remain unrun; transaction, Prisma relation and drift
behavior are not verified. Production row populations and deployment overlap
remain unknown. No database operation, probe or provider call occurred.

**Next gate:** the owner may approve, amend or reject each H-01, H-02 (i)–(iv),
A-1 and C-1 draft wording in brief §§2–5. The recommended set is H-01 A;
H-02 (i)–(iv) B; A-1 acknowledge; C-1 broad reading. The G-12/G-13 probes
need a separate explicit authorization using brief §7's bounded synthetic
plan and a named client/role; a recommendation or this review does not grant
it. L2a implementation/migration/privacy and all L2b/L3 writer/release gates
remain separate. No code, schema, migration, test, env, database, provider,
commit, push or deployment work is authorized by this review packet.

## Owner decision record (2026-10-11)

In response to the exact two-part approval request after the revision-2
re-review, the owner replied **"approved and authorized"**. The first part
asked approval of the recommended choices in reviewed brief
`docs/lifecycle-l2-decision-brief.md`, SHA-256
`fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`:

- **H-01 option A:** operator drain covers only L1 `LEGACY_UNBOUND`; its
  all-or-nothing failure and D-28 consequence are as stated in brief §2.4.
- **H-02 (i)–(iv) option B:** use each case's exact §3 wording and effects;
  attempts may be written as today, while the L2 adapter does not end the
  refused session or write a termination record. Assignment-run ownership,
  malformed-snapshot reporting and privacy limits remain as specified there.
- **A-1:** acknowledge the §4.3 set-once `endedAt` consequence for D-28.
- **C-1:** confirm the §5.3 broad S-07 `LEGACY_UNRECORDED` backfill reading
  across the whole step-1 period, with its separate production gate.

The second part separately asked authorization for **G-12 and G-13 synthetic
probes exactly as specified in reviewed brief §7**, on disposable local
PostgreSQL 16 scratch databases and a scratch copy of `prisma/`, assigned to
**Claude Code Sonnet**. The owner authorized that scope. Results are evidence
only; they do not approve an L2a migration or schema, writer behavior,
production operation or release. Execute through the bounded probe packet;
do not amend the frozen decision brief to record this approval.

No owner choice adds a new label, numeric default, threshold or L1 contract
change. L2a implementation and migration/privacy review, L2b writer work,
L3, production backfill, commit, push and deployment remain separate gates.
