# LIFECYCLE-L2A-DESIGN

Phase: **DONE** (revision 4 independently reviewed, owner-accepted and
applied to the main worktree; uncommitted).

Next client/role: **either client, MATH6-RECONCILE scope request** per
`docs/grade-6-math-integration-plan.md`, § First packet to request.
No new execution packet is approved. Stop after requesting that bounded
document-only scope. This completed acceptance does not approve the
preflight's migration/privacy recommendations or implementation.
No commit, push or deployment under this packet.

## Owner authority and boundary

On 2026-10-11 the owner replied **"approved"** to the exact request for a
document-only Claude Code Opus correction of the L2a preflight against
committed migration `0018` and independently reviewed G-12/G-13 probe
evidence. The request named X-1–X-3, the `User` composite-unique choice, the
transaction-form recommendation and Codex review. This authorizes only a
revision of **`docs/learner-session-l2-persistence-preflight.md`**. It does
not authorize editing `prisma/`, SQL files, code, tests, env, decisions,
privacy inventory or the approved lifecycle design; no migration is authored
or applied and no database or provider is called.

The existing H-01 A, H-02 (i)–(iv) B, A-1 acknowledgement and C-1 broad
backfill owner decisions are recorded in `docs/agent-handoffs/LIFECYCLE-L2.md`.
Do not revisit or silently extend them. S-01..S-14 remain L1-only approvals.
No L2a/L2b/L3 implementation, production backfill or release is authorized.

## Effective baseline and required inputs

- Control main HEAD at scoping: `3e7c33372599d20c285656c3610ca6e47743240f`;
  main is ahead of origin with dirty documentation. Re-read HEAD, worktree,
  claims and input hashes before work; preserve every unrelated edit.
- Owned preflight revision 3 SHA-256:
  `0c62b822492a933db376846818a389c0fab62bb150bfc606e882517d4526e2b5`.
- Reviewed L2 decision brief SHA-256:
  `fbd345f3d72bbf1ff7a554f0839402a005bf7af1cbe70f71b3359306df53b2fd`.
- Probe evidence manifest SHA-256:
  `01492df6d667d43e57cb61127288c1e4441595c28bb0571a9be9202eec8e99a3`,
  under `<git-common-dir>/agent-handoffs/LIFECYCLE-L2-PROBES/` (local only).
  Independent review: `docs/lifecycle-l2-probes-20261011-review.md`, SHA-256
  `ac59167a827e3ff8595ca2cafbb031af7787876140914a246f9e34eb838afa3c`.
- Also read `docs/learner-session-l2-persistence-review.md`,
  `docs/learner-session-lifecycle-design.md`, the applicable decision matrix,
  manual-gate record and current Prisma schema/migration `0018`. Treat old
  preflight prose as a claim to reverify, not as current code evidence.

Untracked brief/review/packet files are required inputs on this checkout;
they are not in a clean clone. If the effective baseline differs, stop and
ask the integrator for an updated allowlisted overlay rather than copying
the whole dirty tree or overwriting another session's work.

## Exact correction

Revise only the affected L2a preflight sections and directly dependent
cross-references/checklists. Clearly mark the new revision and distinguish
observed probe results from recommendations and owner approvals.

1. Resolve X-1/X-2 against committed head `0018` (19 migration directories):
   remove or qualify stale `0017`/18-directory assumptions; account for
   existing `LearnerProfile_id_householdId_key` without recreating or dropping
   it; state the exact `User` composite-unique choice and the SQL/Prisma/down
   consequences rather than silently adding an index.
2. Resolve X-3 using G-13: both V1 and V2 validated, deployed and had no
   unexpected drift in scratch. V2 works without the three duplicate tenant
   columns. Recommend one representation with tenancy and privacy rationale,
   state the alternative and its consequences, and identify what remains for
   migration/privacy review. CHECK/trigger negative-row behavior was outside
   the probe and must not be claimed as verified.
3. Use G-12's observed explicit and bare failure/success results to recommend
   a transaction form for the forward migration and `down.sql`. Explain that
   the explicit failure masked the original division error, neither result
   proves behavior for arbitrary files, and nonempty down refusal alone does
   not clear down-migration review. Do not infer production Postgres version,
   lock window or deployment overlap from the scratch run.
4. Give a concise list of unresolved human migration/privacy choices and
   later executable gates. Preserve the reviewed H-01/H-02/A-1/C-1 choices,
   separation between L2a and L2b, and all unexamined constraints. Do not
   introduce a new label, numeric default or runtime authorization.

## Return and stop

Claim one atomic task role under common Git metadata before writing. Edit
only the owned preflight path in a distinct worktree or approved isolated
overlay; do not touch shared packet/index/PROGRESS. Return the exact changed
sections, new document SHA-256, actual Opus runtime evidence, effective
baseline, targeted Prettier check with `--ignore-path /dev/null`, and
`git diff --check`. No database, provider, full suite or probe is needed for
this document-only task. The integrator preserves the frozen revision and
routes it to Codex cross-family review. A changed hash after review requires
another review. Human migration/privacy approval remains a later gate.

## Revision 4 returned (2026-10-11)

Author: Claude Code `forge-expert` (agent definition `model: opus`;
harness-reported `claude-opus-5-5`; reviewer confirms from client metadata).
Baseline HEAD `3e7c333`, migration head `0018` (19 directories); all packet
input hashes matched. Worked in a scratch worktree, now removed; claim
released. No database, docker, provider, probe or network.

Frozen in `<git-common-dir>/agent-handoffs/LIFECYCLE-L2A-DESIGN/`:

- `learner-session-l2-persistence-preflight.md`, SHA-256 `e2765511897b754988373ce552cb5ca20024581144a069abb39e82d6e08421dc`.
- `preflight-rev4.patch`, SHA-256 `1798ad3b9557d515195253e34fdcbec17271523b9512c82590bd9780bd0cd7df`; one file, +408/−160.

The integrator verified both hashes and `git apply --check` against main; the
patch is **not applied** (main preflight remains revision 3, `0c62b822...e2b5`)
pending review and owner acceptance. Prettier and `git diff --check` passed in
the worktree.

Recommendations (not approvals): `User @@unique([id, householdId])` (U1, the
probed form) over role-column U2; tenant representation V2 (no duplicate tenant
columns) over V1; bare forward `migration.sql` (explicit form masked the error
in G-12) with an explicit `BEGIN`/`LOCK`/guard/`COMMIT` `down.sql`.
`LearnerProfile_id_householdId_key` is neither recreated nor dropped. CHECK/
trigger negative-row behavior is stated as unverified. New §13.3 lists open
human choices: V1/V2, U1/U2, transaction form, TRUNCATE guards (X-13, no
recommendation), lock window/production PG version, down review, privacy field
set/export/delete/retention, R-01 portability. H-01/H-02/A-1/C-1 and L2a/L2b
separation preserved; L2b contradictions X-6–X-12 flagged, not addressed.

Disclosed deviations: Prettier was run from the main checkout's
`node_modules/.bin` (worktree had none); the claim was released a moment before
a forced removal of the task-owned worktree completed.

## Codex independent review completed (2026-10-12)

Fresh native `forge-reviewer`, configured `gpt-6.1-sol`, independently
confirmed actual author `claude-opus-5-5`, all pinned hashes, all 30 probe
manifest entries and exact patch reconstruction. Verdict: **ready for human
review with noted risks**, no new correction in this scope. Existing minor
R-01 evidence portability remains; no probe rerun was needed. Report:
`docs/lifecycle-l2a-design-20261012-review.md`.

The exact frozen document and patch remain unchanged and unapplied. Owner
document acceptance/application is next; V1/V2, U1/U2, transaction form,
TRUNCATE guards, production version/lock window, forward/down review,
privacy fields/export/delete/retention and R-01 disposition remain later
migration/privacy choices. No code, database, provider, commit or push ran.

## Owner acceptance and application (2026-10-12)

The owner replied **"accept"** to the exact request to accept revision 4
`e2765511...21dc` and authorize one-file patch `1798ad3b...d7df` application.
The Codex integrator acquired its claim, reverified the unchanged baseline
and frozen hashes, passed `git apply --check` and applied only the reviewed
patch to `docs/learner-session-l2-persistence-preflight.md`. The resulting
document SHA-256 is exactly
`e2765511897b754988373ce552cb5ca20024581144a069abb39e82d6e08421dc`.
Targeted Prettier and `git diff --check` passed. Shared status was updated;
unrelated Grade 6 edits were preserved. No code/database/provider work,
commit or push. Earlier unapplied statements above describe historical
checkpoints. Migration/privacy choices and implementation remain separate
gates; this packet is complete.
