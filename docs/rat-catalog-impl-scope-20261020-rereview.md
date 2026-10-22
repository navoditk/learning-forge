# RAT-CATALOG-IMPL scope rev3 — changed-scope Codex re-review

Reviewer: `codex exec resume -m gpt-6.1-sol`, thread `01a1598e-0801-7ca0-8fa8-a3efa1faf82b`; this turn verified `gpt-6.1-sol` from the native trace (13:59:17Z). The intermediate rev2 turn ran on `gpt-6-sol` and is advisory only (bundle `review-rev2-report.md`). Report verbatim:

**Disposition: READY_WITH_RISKS.** RCI-R1–R7 are closed at the document level. One nonblocking minor finding, RCI-R8, concerns the new V-2 invariant. No blocker or major remains.

Native session metadata confirms this turn ran on **`gpt-6.1-sol`** and the rev2 turn ran on `gpt-6-sol`. The original author session records **142/142 assistant messages on `claude-opus-5-5`**.

**Verified hashes**

| Artifact                     | SHA-256                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `scope.rev3.md`              | `9830b39ff1f6c7cb5a896ce9de563809798040c9517510f14cd47e83edf8f7a6` |
| `closure.rev3.md`            | `a505dcec6caf02864e1605d17813c27505f124702d4ead2a46a14a1855cadc20` |
| `scope.rev2.md`, unchanged   | `593c76d8b4e972c8f154b309eb78852e2024985b2ad34196fbeee28228cbd506` |
| `closure.rev2.md`, unchanged | `c40ca75236540c491ed72741bd5a10f8b28fec9c6a6272e796ef9427c87c0a79` |
| `scope.rev1.md`, unchanged   | `22d6d4c559360b9947f6312002445ca1eb6a88750b2c4e23ed2745d7d1ca788a` |

Both manifest entries and **all 28 input pins match**. The bundled advisory report matches its abbreviated pin. Removing the four-line IC-9 annotation reconstructs the original `RAT-CATALOG-DESIGN.md` hash exactly, confirming the annotation-only change and citation shift.

Evidence below refers to [scope.rev3.md](/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-CATALOG-IMPL/scope.rev3.md).

**Per-finding closure**

| Finding    | Verdict    | Independent verification                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RCI-R1** | **CLOSED** | Lines 357–415 define the strict envelope, separate manifest digest, per-item digests and verification precedence. Lines 453–463 consistently distinguish bare digests from prefixed hashes. RT-1/2, PH-4/4b and SEL-1–5 address the original round-trip, self-reference, tampering and selected-item counterexamples. The content-hash formula matches `placement-probe.ts:70–91`. |
| **RCI-R2** | **CLOSED** | Lines 191–234 separate violations, accepted diagnostics and stale exceptions. V2-1 produces zero violations, two accepted exceptions and zero stale entries; removing the exceptions yields two blocking version violations. Recomputed pilot file hashes support that derivation.                                                                                                 |
| **RCI-R3** | **CLOSED** | Lines 321–344 require isolated dependencies and a local matcher with parity checks. IG-5/5n at lines 716–717 require transitive traversal and the original forbidden-import negative controls. Independently inspected current allowed dependencies: the closure reaches only the named contract/catalog files, `zod` and `node:util`.                                             |
| **RCI-R4** | **CLOSED** | Lines 40–45 and 94–109 accurately distinguish unchanged current-record results from intentionally changed duplicate-input acceptance and bundle bytes. DUP-4 at line 621 captures the unitless counterexample; the existing validator confirms its before-change behavior.                                                                                                         |
| **RCI-R5** | **CLOSED** | AS-3 at line 624 uses `synthetic-versioned-s4`, matching the fixture and the helper’s exact-code comparison.                                                                                                                                                                                                                                                                       |
| **RCI-R6** | **CLOSED** | Lines 202–234 derive consumption from `resolved && versionDiffers`, independently of violation precedence. V2-3(a)/(b)/(c), line 645, consistently produce: bad-hash violation plus stale; bad-hash violation with consumption; and clean ref plus stale. All block as specified. The original contradictory consumption expectation is removed.                                   |
| **RCI-R7** | **CLOSED** | Verification step 2, line 412, explicitly compares both bank fields and both unit fields and checks their relationships. PH-4c(j)–(n), line 676, correctly distinguishes direct identity rejection from resolver lookup failure when the manifest key changes. A correct digest cannot bypass these checks.                                                                        |

I also checked the changed header, manifest note, self-audit entries, contradiction note, routing and input-pin comment against both closure documents. No regression was found in those corrections.

**RCI-R8 — Minor, high confidence; first-pass miss exposed by the revised V-2 invariant**

Evidence: `scope.rev3.md:202,217–240,821–822`; `src/contracts/progression.ts:25–27,114–115`.

The claim that accepted diagnostics and violations “never name the same ref” assumes each lesson contains only one occurrence of an `id@version`. The schema permits duplicate occurrences with different hashes.

Counterexample: one lesson contains the same `p@content-1` twice, once with the correct hash and once with a wrong hash. Lookup resolves `content-2`, and an exact exception exists. The first occurrence produces an accepted diagnostic; the second produces `HASH_MISMATCH`. Both outputs name the same lesson/ref identity, contradicting the invariant. Registration still blocks, so this does **not** create a fail-open path.

**Required change:** scope the invariant explicitly to individual occurrences, or define aggregation for repeated identities. Add a duplicate-occurrence case documenting the intended diagnostics and continued blocking.

Earlier review considered one occurrence per identity and missed that the schema permits duplicates. This is confined to the directly affected V-2 contract.

**Limitations**

These verdicts concern the scope and its static derivations. No implementation suites were run. I modified no files, did not read `.env`, and made no network, database or provider calls. Runtime evidence and RAT-INTEGRATE gates remain outstanding.

**SWITCH TO: Claude Code integrator — RAT-CATALOG-IMPL scope rev3, for RCI-R8 disposition and packet routing.**
