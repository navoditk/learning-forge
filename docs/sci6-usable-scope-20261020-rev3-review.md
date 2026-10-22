# SCI6-USABLE scope rev3 — changed-scope Codex re-review

Reviewer: `codex exec resume -m gpt-6.1-sol`, thread `01a1598e-63fd-78c1-8575-ae9f4f87d39f`; verified `gpt-6.1-sol` (14:18:12Z). Report verbatim:

**Disposition: CHANGES_REQUESTED**

The eight reviewed findings are closed at the scope-design level. Rev3 introduces one major authorization ambiguity, SU-R14, and two minor documentation errors. The recurring-major checkpoint therefore requires owner escalation rather than another automatic correction round.

Verified hashes:

| Artifact                      | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `scope.rev3.md`               | `a6de4a4da49ce2c8ca8dc22067bc32357a72998dd4829e9e29a8066ffb5f2cf6` |
| `closure.rev3.md`             | `f02ca992f7011697d9cad180d6c47d604cab4943fd8cc983501f70b00290e071` |
| `input-manifest.rev3.txt`     | `babc2391daf577a3b54f98fb9a73d4a1d411819a34789dc57e7de59419763189` |
| `freeze-manifest.rev3.sha256` | `f0b7ca750068f582775731d65e9786d16cc6a3241756092b017b4a8bc9dfe1c7` |
| `guard-check.rev3.mjs`        | `9e930ba3c9ee8adcc3ad1437b5f8e6c163a225c1cf1ec2a45293c868c3034fbb` |
| Guard result                  | `4ebc0dadc8371eaba6b42ec704ebf5a1bc1113a21496d1ee3499108a65b975cb` |
| `gate-graph-check.rev3.py`    | `dc84b6e3c1b44e4a6428267a0d8780952b65a754d02dddb1393722189b7aa847` |
| Graph result                  | `a882a1cde3cd0a751f142302a18ff4b9d82d9e70c70716d6a0d34f57a21ab49f` |

All seven freeze entries and **87/87 input pins** match, including at the final check. HEAD remains `059c7f6f64374e0c37359a0e06e4e93185b7f62f`. Rev1 and rev2 hashes remain unchanged.

Below, `scope` denotes `.git/agent-handoffs/SCI6-USABLE/scope.rev3.md`.

| Finding    | Verdict    | Evidence                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SU-R1**  | **CLOSED** | `scope:127–159`, `:229–247`, `:304–319` now cover both estimate writers, persistent confirmation and non-equivalent thresholds. This matches `service.ts:585–619`, `:1092–1107` and planner secure logic. Minor example error remains separately recorded as SU-R15.                                                                                                                                   |
| **SU-R4**  | **CLOSED** | `scope:536–603` observes cap exhaustion outside the harness through a flag and per-case checks. Cap 3 with a two-call first case stops before case 2; cap 1/reserve 1 blocks the retry, then marks the case interrupted. These mechanisms survive `harness.ts:80–105` swallowing exceptions and avoid the runner’s unrestricted multi-case loop. Implementation tests remain prescribed, not executed. |
| **SU-R6**  | **CLOSED** | Independently extracted and applied the **17 regexes from the scope**: **8/8 negatives detected**, **5/5 positives clean**, **9/9 content/skill files clean**. `"Sure, cut the frog…"` is detected; `"Pull out a hair and look at it closely."` remains undetected, exactly as disclosed.                                                                                                              |
| **SU-R7**  | **CLOSED** | `scope:706–723` correctly explains last-write estimates, assistance-weighted confidence, older-attempt overwrites and persistent confirmation. These match `service.ts:605–609`, `:1092–1107` and the parent rendering at `parent/page.tsx:181–189`.                                                                                                                                                   |
| **SU-R8**  | **CLOSED** | `scope:733–752` restricts the early push to an owner-confirmed decoupled non-main branch. A deployment-triggering push inherits signatures, migration/archive disposition and Pages approval. Route 2 requires an owner-confirmed supported deployment method.                                                                                                                                         |
| **SU-R11** | **CLOSED** | `scope:365–379` covers the actual installed Next filename sequence: `.env.${d}.local`, `.env.local` except test, `.env.${d}`, `.env`. The union across modes is conservative and allows `.env.example` without reading it.                                                                                                                                                                             |
| **SU-R12** | **CLOSED** | Independently reconstructed dependencies from the scope’s table. Both routes are acyclic, with and without the conditional paid-eval gate. Signatures precede deployment; smoke adoption and execution are separate.                                                                                                                                                                                   |
| **SU-R13** | **CLOSED** | `scope:612–643` names mandatory rendered browser evidence: empty, Math-only and mixed Science fixtures; exact rows; note absent/present exactly once; axe. The interception matches the actual fetch at `parent/page.tsx:88`.                                                                                                                                                                          |

R2, R3, R5, R9 and R10 remain closed and were not reopened.

The narrowings are acceptable with these qualifications:

- **No dollar-cap claim:** acceptable. Requests and output tokens are bounded; dollars are explicitly not. SU-H7 must authorize that disclosed scope using current owner-supplied spending facts.
- **Finite guard:** acceptable as an honestly described prompt-plus-pattern defense proposed for human disposition. It does not establish comprehensive D-171 enforcement or approve learner release.
- **Window rule:** deferring SU-E4b is acceptable; automatically changing the owner’s H2 choice is not sufficiently authorized, as detailed below.

New findings:

**SU-R14 — Major, regression: the window rule automatically changes a human-selected validation requirement**

- **Evidence:** `scope:606–608`, `scope:697`, `scope:702–704`, `scope:731–740`; `docs/agent-orchestration.md:241–256`.
- **Failure scenario:** The owner selects H2(b), including the paid evaluation. A cap implementation/review fails, and the window rule automatically switches H2 to (c). That removes H7 from commit/release prerequisites without a separately recorded owner disposition.
- **Required disposition:** Either retain H2(b), leaving dependent release blocked while continuing eligible engineering, or explicitly obtain owner authorization for H2(c)/a clearly stated conditional fallback. Put that condition in the approval batch itself. Deferral alone must not silently remove the selected evaluation gate.
- **Confidence:** High.

**SU-R15 — Minor, newly observable: the fresh-session hint-count example is incorrect**

- **Evidence:** `scope:144–147`; `src/tutor/policy.ts:64–84`, `:91–98`.
- **Failure scenario:** From a fresh practice state, the first two successful tutor calls are `probe_reasoning` and `hint_1_strategy`, yielding **0.9 then 0.75**, rather than 0.55 or lower.
- **Required change:** Use three successful calls from a fresh session, or explicitly identify an already-advanced tutor state. The corrected threshold counterexample and prescribed assisted-state tests remain valid.
- **Confidence:** High.

**SU-R16 — Minor, newly observable: guard-consequence wording overstates fallback and locking**

- **Evidence:** `scope:455–461`, `scope:770–772`; `src/tutor/harness.ts:98–105`; `src/phase1/service.ts:831–839`.
- **Failure scenarios:** A prohibited first response followed by a valid retry returns `repaired`, not fallback. After an earlier valid tutor interaction, a later fallback does not relock the independent check—the service checks whether **any** qualifying interaction exists.
- **Required change:** Qualify fallback as the result when the retry also fails, and locking as applying when no earlier qualifying interaction exists. Preserve existing authorization behavior; do not introduce a new lock policy.
- **Confidence:** High.

Limitations: Read-only changed-scope review. No files modified; no `.env`, network, database or provider access. Independent local regex and graph derivations were executed; product suites and proposed implementations were not. `git diff --check` passed.

**BLOCKED: Claude Code integrator → owner disposition on SU-R14, with the retain-paid-gate or explicitly-authorize-fallback options. Do not enqueue another automatic correction round.**
