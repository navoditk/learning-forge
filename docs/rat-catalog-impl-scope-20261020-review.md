# RAT-CATALOG-IMPL scope rev1 — independent Codex review

Reviewer: `codex exec` gpt-6.1-sol, read-only sandbox, thread `01a1598e-0801-7ca0-8fa8-a3efa1faf82b`; model verified `gpt-6.1-sol` from the native session trace (`turn_context`), provider openai. Run by the Claude Code integrator under D-184. Report reproduced verbatim below.

**Disposition: CHANGES_REQUESTED.** RCI-R1 and RCI-R2 prevent implementation readiness. Return the consolidated correction to the original Claude Opus author.

Verified artifact SHA-256:

```text
22d6d4c559360b9947f6312002445ca1eb6a88750b2c4e23ed2745d7d1ca788a
```

Reviewed [scope.rev1.md](/Users/navoditkaushik/GitHub/learning-forge/.git/agent-handoffs/RAT-CATALOG-IMPL/scope.rev1.md). All **20 input pins match**, as does HEAD `059c7f6f64374e0c37359a0e06e4e93185b7f62f`. Author transcript metadata records **83/83 assistant messages on `claude-opus-5-5`**, with the matching frozen hash in its handback. Reviewer invocation records select Codex `gpt-6.1-sol`; separate resolved-model response metadata was unavailable.

**Findings**

**RCI-R1 — Major, high confidence: the snapshot integrity contract is incomplete and internally ambiguous.**

Evidence: `scope.rev1.md:218–246`; `docs/grade-6-math-catalog-versioning.md:440–458`; `src/progression/placement-probe.ts:68–93`.

The output “carries” `snapshotDigest = canonicalDigest(snapshot)`, without defining whether the digest field is excluded from that calculation. Recomputing over the returned object would include the newly added digest and fail verification. The design also requires a canonical digest of each item projection, but the scope supplies no corresponding field or verification rule. “Every item’s projection is intact” is therefore underspecified.

Hash representation is inconsistent too: line 223 compares `rawSha256` directly with a ref hash, whereas ref hashes include `sha256:`; line 234 omits that prefix from the stated `contentHash` formula.

**Failure scenario:** a conforming-looking builder returns a snapshot that its resolver rejects, or two implementers produce incompatible formats. Pilot equality can also fail solely because of hash prefixes.

**Required change:** define the serialized snapshot/envelope, exact digest payload excluding its own digest, per-item projection digests, manifest-entry identity, and hash-prefix conventions. Add successful JSON round-trip verification, projection-tampering tests, and negative tests for selected items absent from the snapshot or mismatching its ID, version, or hash. Those last cases are required by design §5.6 and currently lack explicit acceptance cases.

**RCI-R2 — Major, high confidence: V-2’s exception semantics contradict its acceptance test.**

Evidence: `scope.rev1.md:151–157,427–431`; `docs/grade-6-math-catalog-versioning.md:222–227`.

The checker allows the two historical version-label exceptions when hashes match. V2-1 nevertheless requires its returned “violations” to equal those two exceptions. The scope does not distinguish rejected violations from permitted historical diagnostics.

**Failure scenario:** an implementation either reports valid pilot records as registration violations or returns no violations and fails V2-1. A bounded implementer must resolve this contract independently.

**Required change:** specify separate rejected violations and accepted-exception diagnostics, or explicitly define equivalent semantics. Require zero blocking violations for the pilot, exactly two accepted exceptions, rejection of hash mismatches even when excepted, and a valid new-version positive control. Retain stale-exception detection.

**RCI-R3 — Minor, high confidence: the import guard does not establish the promised transitive isolation.**

Evidence: `scope.rev1.md:214–222,479–488`; `src/progression/placement-probe.ts:3–6,28–41`.

IG-5 forbids direct imports from content/store modules. Importing the cited `matchesPlacementProbeRequirement` from `placement-probe.ts` would pass that direct restriction while transitively loading `content/catalog` and its production catalog dependencies.

**Failure scenario:** the supposedly pure, injected snapshot library acquires production content initialization through the existing matcher module. The inbound dormancy guard would still pass.

**Required change:** check forbidden dependencies transitively and clarify how the pure matching rule is reused without importing the live probe module. Include that import as a negative control. This does not presently expose production behavior because inbound wiring remains prohibited.

**RCI-R4 — Minor, high confidence: “cannot be built today” overstates the duplicate check’s compatibility.**

Evidence: `scope.rev1.md:25–26,65–74`; `src/curriculum/progression-catalog.ts:49–60`; `src/contracts/progression.ts:57–84`.

Two identical unitless program records currently pass the spine validator: there are no claimed units to trigger duplicate ownership rejection. Canonical `skill-graph-only` programs can therefore exhibit the behavior the new statement intentionally rejects.

**Failure scenario:** a caller previously accepted with duplicate unitless programs now throws. The modified validator also performs additional parsing/allocation during production catalog initialization.

**Required change:** describe the guarantee precisely: existing registered records and their functional results remain unchanged; duplicate-program input acceptance intentionally changes. Add the unitless duplicate counterexample. Production bundle bytes cannot be called byte-identical because an already imported module changes, although the proposed statement introduces no new dependency.

**RCI-R5 — Minor, high confidence: AS-3 uses the wrong fixture skill identifier.**

Evidence: `scope.rev1.md:386–388,410`; `src/curriculum/unit-claims.ts:18–19`.

The fixture declares `synthetic-versioned-s4`, but AS-3 calls the helper with literal `'s4'` and expects `true`. The helper compares exact skill codes.

**Failure scenario:** implementing the specified fixture and test literally fails the positive control.

**Required change:** use the complete synthetic skill code consistently.

**Coverage**

| Area checked                        | Assessment                                                                                                                                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design §9 and deferrals             | Route/idempotency, learner-state creation, live bank selection, registry/progress projection, package validation and teaching-loader wiring are reasonably deferred. Each changes a live path or depends on later inputs/choices.                        |
| Historical resolution and PH-1–PH-5 | Library-level evidence is honestly labeled partial. Store/submission scoring and outcome application remain required RAT-INTEGRATE evidence. Dormant library completion must not lift the first-ref replacement prohibition.                             |
| Design §11 owner choices            | No silent C-7, OC-2–OC-5 or MV-2 selection found. Both bank shapes remain representable; synthetic empty teaching refs do not register a production choice.                                                                                              |
| V-2/V-5/V-10/V-11                   | Manifest membership, frozen-prefix protection, historical selectors, capacity boundaries and reviewed-bank checks are substantially covered. RCI-R2 needs correction; snapshot boundaries need RCI-R1’s additions.                                       |
| R-3 inventory limitation            | Membership-based Ratios manifest selection respects the accepted limitation and avoids treating the two stubs as a global inventory.                                                                                                                     |
| Live behavior/imports               | Existing production registry has distinct codes, so the duplicate check preserves its results. Broader byte-identical behavior is overstated; see RCI-R3/R4.                                                                                             |
| Cited code locations                | Checked catalog selectors/validator, registry, claims, probe projection, assignment route, learner-state paths, store, package validation, submission matching and progress-version constant. Material behavior claims agree, subject to findings above. |
| Decisions                           | Checked D-148, D-164–D-166 and D-175–D-185. No content/private-access, deployment, release, commit or push authority follows.                                                                                                                            |
| Packet size                         | Two ordered packets are credible bounded increments. Resolve the integrity and exception contracts before calling them fully specified.                                                                                                                  |
| Validation plan                     | DB-free checks suit this narrowed scope. Deferring integration/E2E is justified while production wiring remains excluded; it does not discharge later integration gates.                                                                                 |

**Q-0 advisory opinion:** D-183/D-184 reasonably cover reversible, dormant engineering implementation and technical review within this delivery lane. I would not require separate owner adoption merely to build these libraries. This interpretation must remain explicit: it neither records P-A/H-1 as owner-selected live behavior nor authorizes registration, admission/state transitions, content access or activation.

The stale IC-9 “pending” text is real: it remains at design lines **66, 635, 678 and 685**, and in the resume index. **D-176 governs:** option A leaves the two items with documented risk, without mutation, exclusion or corrective code. The scope’s label-integrity exceptions are consistent with that decision. The integrator should annotate current routing/status records without silently changing the accepted frozen design.

**Limitations**

This was static scope review, not implementation validation. No runtime suites, build, database, network or provider calls were made; `.env` was not read. No files were modified. Hash verification and `git diff --check` passed. Private-package contents, learner state and actual future bundle output remain unverified.

**SWITCH TO: Claude Code `forge-expert` / original Opus author — correct RAT-CATALOG-IMPL scope rev1, retaining RCI-R1–RCI-R5 and closure evidence.**
