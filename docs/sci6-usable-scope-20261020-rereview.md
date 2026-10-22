# SCI6-USABLE scope rev2 — changed-scope Codex re-review

Reviewer: `codex exec resume -m gpt-6.1-sol`, thread `01a1598e-63fd-78c1-8575-ae9f4f87d39f`; this turn verified `gpt-6.1-sol` from the native trace (13:58:52Z). Report verbatim:

**Disposition: CHANGES_REQUESTED**

Rev2 closes five original findings. SU-R1, SU-R4, SU-R6, SU-R7 and SU-R8 remain open. Three additional findings arise from the corrections.

Verified hashes:

| Artifact                      | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `scope.rev2.md`               | `6fe7de391c77fee5ddecea42f4431b5d3fda816c9e9ddbc055be92ce77ed0d99` |
| `closure.rev2.md`             | `9e58b250ef52461ed08e5326ac15599c9b211c93c59c5a8dd0ed1014a6477b7b` |
| `input-manifest.rev2.txt`     | `b68f81a699697aef9c5bc69ce0b90ec76055ed9b4fc9692face1c44bc3ef6fab` |
| `freeze-manifest.rev2.sha256` | `bccd4559d1890719aa5049e89ee116e2ab1eb4512b442805dee0454a0ad5b961` |
| Unchanged `scope.rev1.md`     | `c1a1e3ce1b2c854c3778a7a8a34b2f3e6baab80cc282724ab65fd202fd45d135` |
| Pinned lane A `scope.rev2.md` | `593c76d8b4e972c8f154b309eb78852e2024985b2ad34196fbeee28228cbd506` |

All three freeze entries verify. Initially **75/75 input pins matched**. At the final check, **74/75 matched**: `docs/coding-agent-handoff.md` had changed from pinned `f403a47f…a5cf4` to `2822e326…c71e1`, including lane A’s updated rev3 routing. The frozen artifacts and code pins remained intact. Reconcile that routing drift before dispatch.

Below, `scope` means `.git/agent-handoffs/SCI6-USABLE/scope.rev2.md`.

| Original finding | Verdict          | Closure evidence                                                                                                                                                                                                                                                                         |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SU-R1**        | **OPEN — major** | H11 now exists, and the serialized binary-state sequences are correct. However, G15’s universal binary-estimate/equivalent-threshold derivation is false; details below.                                                                                                                 |
| **SU-R2**        | **CLOSED**       | `scope:189–195` correctly distinguishes three Science skills from the 67-skill projection. `scope:258–268` explicitly updates the coupled assertion and preserves unavailable-program negative controls.                                                                                 |
| **SU-R3**        | **CLOSED**       | `scope:313–334` names the forwarding, schema, runner and test files. The route → harness → mocked Anthropic test covers Science selection, trace version and unchanged Math prompts. Keeping `provider-input.ts` unchanged is consistent with using framing solely to select a template. |
| **SU-R4**        | **OPEN — major** | Exact case selection and SDK retry control are specified, but the proposed cap exception is swallowed by the harness; the dollar-cap mechanism also remains unspecified.                                                                                                                 |
| **SU-R5**        | **CLOSED**       | `scope:235–243` makes due/not-due, correct, lapse and malformed-review service cases mandatory. `scope:270–287` adds distinct placement, practice and review browser journeys. These match the service’s review behavior at `service.ts:922–983`.                                        |
| **SU-R6**        | **OPEN — major** | The Science instruction, guard and mocked safety cases are added, but the prescribed prohibited-response case is not detected by the prescribed patterns.                                                                                                                                |
| **SU-R7**        | **OPEN — major** | H10 supplies an explicit display disposition and optional note, but its parent-estimate explanation repeats the false binary-estimate claim. The quoted status strings otherwise resolve to the cited code; the second parent confirmation string is at `parent/page.tsx:189`.           |
| **SU-R8**        | **OPEN — major** | Migration/archive authorization, owners, rollback and signatures are now separated. H9c still permits a push that may automatically execute those operations before their gates close.                                                                                                   |
| **SU-R9**        | **CLOSED**       | `scope:288–304` removes the inherited private path, provider key and C4 flags, requires no loadable environment files, and checks skipped-private/fail-closed results. The isolation approach closes the original access counterexample; its preflight has regression SU-R11 below.      |
| **SU-R10**       | **CLOSED**       | The owned-file matrix at `scope:420–451` matches pinned lane A rev2: no direct overlap, with byte-identity windows handled separately. The incorrect abbreviated hash is acknowledged; it does not change this verdict. Reconcile against lane A’s successor before dispatch.            |

Remaining original findings:

**SU-R1 — G15 omits assistance-weighted estimate writes**

- **Evidence:** `scope:109–113`, `scope:185–187`, `scope:473`; `src/phase1/service.ts:153–164` and `:1092–1107`.
- **Counterexample:** A correct attempt followed by tutoring can write `0.9`, `0.75`, `0.55`, `0.35` or `0.1`. `recordTutorResponse` changes the estimate without clearing an existing confirmation flag. With estimate `0.55` and confirmation true, threshold `0.5` treats the skill as secure; `0.75` and `1` do not.
- **Required change:** Correct G15, H11 and the closure evidence. Test assisted states as well as binary states. Retain the valid three-slot serialized derivation, but remove the claim that every threshold in `(0,1]` is behaviorally equivalent.

**SU-R4 — The counting wrapper does not establish the specified stop behavior**

- **Evidence:** `scope:383–402`; `src/tutor/harness.ts:80–105`; `src/evaluation/runner.ts:40–95`.
- **Counterexample:** The wrapper throws `CALL_CAP_REACHED`; the harness catches it as `model_error`, retries and returns fallback. The runner can continue through later cases. The script does not receive the exception needed for its promised partial report and nonzero stop.
- **Required change:** Specify an observable cap signal outside the harness’s catch path and a per-case stopping/reporting mechanism. Test exhaustion during a retry and before a later case.
- The six Math IDs exist. SDK `maxRetries: 0` is supported (`node_modules/@anthropic-ai/sdk/client.d.ts:118–123`); retaining the default preserves current retries. With SDK retries disabled, **24 requests / 7,200 maximum output tokens** is a valid upper bound for 12 cases. It does **not** establish an owner-selected dollar cap without an input/cost bound or appropriately bounded provider budget.
- H7 should name an executable launcher, such as `npm run eval:run-real -- …`; the current `.ts` file has no shebang and is mode `100644`.

**SU-R6 — The guard misses its own prohibited example**

- **Evidence:** `scope:343–347`, `scope:365–367`.
- **Counterexample:** `"Sure, cut the frog…"` matches none of the 18 specified substrings. Neither `"cut open"` nor `"cut a "` occurs. A schema-valid response with no other violation is accepted.
- **Required change:** Align the detection mechanism and realistic prohibited cases. Require this exact negative control to fall back, alongside a safe redirect positive control. The owner-facing description must distinguish a finite pattern check from comprehensive enforcement of D-171.

**SU-R7 — H10 misdescribes what parents see**

- **Evidence:** `scope:485–487`; `src/phase1/service.ts:1097–1107`; `src/app/parent/page.tsx:181–189`.
- **Counterexample:** A correct answer followed by a representation hint can display estimate `0.55`, confidence `low`, rather than the stated `1`/`medium`. Confirmation may remain true.
- **Required change:** Explain assistance-weighted overwrites and confirmation persistence accurately before requesting acceptance of the display limitation. Correct the associated closure claim.

**SU-R8 — Push can precede production-operation authorization**

- **Evidence:** `scope:511–513`; `render.yaml:20`.
- **Counterexample:** H9a reports auto-deploy enabled; H9c authorizes pushing the commit while H9b remains held. Render may immediately run migration/archive/build/deployment despite H9d’s dependencies.
- **Required change:** Require all triggered operation gates before that push, or owner-confirmed decoupling—such as disabled auto-deploy and an appropriate branch. Preserve separate Pages publication approval.

New findings:

**SU-R11 — Minor, regression: environment preflight rejects the tracked example**

- **Evidence:** `scope:289–291`; `git ls-files -- '.env*'` returns `.env.example`. Next’s installed `loadEnvConfig` loads specific `.env`, mode and local filenames, rather than every `.env*` file.
- **Failure scenario:** An ordinary isolated checkout fails the mandatory zero-count check despite containing no loadable environment file.
- **Required change:** Check the actual Next loadable filenames, allowing `.env.example` without reading it. Preserve fail-closed checks for loadable files and the inherited environment.

**SU-R12 — Major, regression: release dependencies are circular**

- **Evidence:** `scope:513`, `scope:518`.
- **Failure scenario:** H9d requires H9i, while H9i requires H9a–H9g, which includes H9d. Neither gate can become eligible.
- **Required change:** Make the dependency graph acyclic. Require pre-deployment evidence and signatures before deployment; distinguish adoption of the smoke scope from its post-deployment execution. Verify the resulting order also prevents SU-R8’s push-triggered bypass.

**SU-R13 — Major, newly observable: SU-E5 lacks evidence that the note renders**

- **Evidence:** `scope:409–417`; existing parent browser assertions at `tests/browser/phase1.spec.ts:104–115`.
- **Failure scenario:** The predicate helper passes while the page omits the note or displays it for Math-only evidence. Existing browser assertions would still pass; the Science-note browser coverage is merely conditional.
- **Required change:** Name mandatory rendered-UI evidence: exact approved note visible for Science-containing evidence, absent for Math-only/empty evidence, with existing rows unchanged. A pure helper test alone does not verify this behavior.

Limitations: Static changed-scope review only. No files were modified; no `.env`, network, database or provider access occurred. No runtime suites were executed. `git diff --check` passed. SDK and Next behavior were inspected in installed source. Unchanged accepted areas were not reopened.

**BLOCKED: return to the Claude Code integrator for the recurring-major cause/action checkpoint, then consolidated same-author correction retaining these IDs.**
