# LIFECYCLE-L2A-DESIGN revision 4 independent review

Date: 2026-10-12. Verdict: **ready for human review with noted risks**.
No new blocker, major or minor correction is required in the assigned scope.
This recommendation does not approve migration/privacy choices, implementation
or release.

## Frozen scope and provenance

- Packet: `docs/agent-handoffs/LIFECYCLE-L2A-DESIGN.md`.
- Frozen preflight: common Git metadata
  `agent-handoffs/LIFECYCLE-L2A-DESIGN/learner-session-l2-persistence-preflight.md`,
  SHA-256 `e2765511897b754988373ce552cb5ca20024581144a069abb39e82d6e08421dc`.
- One-file patch: `preflight-rev4.patch`, SHA-256
  `1798ad3b9557d515195253e34fdcbec17271523b9512c82590bd9780bd0cd7df`.
- Baseline: HEAD `3e7c33372599d20c285656c3610ca6e47743240f`; main preflight
  remains revision 3, SHA-256
  `0c62b822492a933db376846818a389c0fab62bb150bfc606e882517d4526e2b5`.
- Author: Claude Code `forge-expert`, actual `claude-opus-5-5`, independently
  confirmed from filtered client runtime metadata. Exact frozen hash appears
  in assistant UUID `865f8abc-7d5c-4fe9-8ea4-879715a417b4`, timestamp
  `2026-10-12T01:53:08.238Z`, in subagent
  `agent-a3ac4b13ae60ece46.jsonl` under Claude project session
  `22bffa60-935a-47f3-a703-6ff9ab4853d0`.
- Reviewer: fresh native Codex `forge-reviewer`, tool-configured
  `gpt-6.1-sol`, task `/root/lifecycle_l2a_design_review`; completed read-only
  turn. Claude/GPT cross-family independence holds.

## Verified conclusions

- X-1/X-2 correctly use 19 migration directories and head `0018`. Existing
  LearnerProfile composite target is reused and excluded from L2a down. U1
  introduces only the named User target; U2 consequences and missing probe
  are explicit.
- X-3 matches the frozen G-13 V2 schema. Required tenant columns close the
  optional-FK partial-null gap structurally. CHECK/FK/trigger negative-row
  enforcement remains unverified.
- Bare-forward and explicit-down recommendations distinguish observed probe
  results from guarantees. Masked explicit-forward errors, the stand-in
  down's limited coverage and later real-file failure tests remain disclosed.
- H-01/H-02/A-1/C-1 decisions, L2a/L2b separation, privacy review,
  first-write preservation and production/release gates remain intact.
  Explicitly deferred L2b contradictions were outside this correction.

## Carried evidence limitation

Existing R-01: **minor, high confidence**. `g13_v1.log:18,121` and
corresponding V2 entries abbreviate exact command paths/context. The original
local runtime contains them. Frozen preflight §0.1.1 and lines 964–966
preserve this dependency. Before transfer or migration review relying on
exact commands, supply a sanitized runtime companion or confirm continued
availability of the local record. No revision-4 correction is required.

## Remaining owner migration/privacy choices

Frozen preflight lines 942–966 list:

1. V2 versus V1 tenant representation.
2. U1 versus unprobed U2 User target.
3. Bare versus explicit forward transaction form and explicit down form.
4. Whether to add TRUNCATE guards.
5. Production PostgreSQL version and acceptable index lock window.
6. Line-by-line forward/down acceptance and required rollback evidence.
7. Inventory fields, export excluding digest, delete order and
   household-lifetime retention.
8. R-01 evidence portability disposition.

## Validation and disposition

Read-only checks passed: pinned hashes, all 30 probe manifest entries,
in-memory patch reconstruction matching the frozen document byte for byte,
`git apply --check`, `git diff --check` and Prettier through stdin (direct
`.git` paths are ignored). No source edits, installs, database/provider/probe
calls or runtime suites were performed by the reviewer.

Return to the designated integrator for owner acceptance of this exact
document and one-file application. The patch remains unapplied pending that
acceptance. Any changed hash requires review. Migration/privacy approval,
L2a/L2b/L3 implementation, production operation and release remain closed.
