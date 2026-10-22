# SCI6-PREREQ rev1 — independent implementation review

## Disposition

**CHANGES REQUESTED: one major R1 and one minor R2**, both in selected P5.
Not ready for human patch acceptance. Return together to original Claude
Code forge-implementer/Sonnet agent `a9d38f3dba6e4df62`. Review performed by
fresh native forge-reviewer, host-fixed `gpt-6.1-sol`, GPT family,
`/root/sci6_prereq_review`; parent integrator records this report.

## Verified freeze and independence

Direct minimal transcript metadata:121/121 assistant records
`claude-sonnet-5-5`; cross-family independence verified. HEAD/base
`3e7c33372599d20c285656c3610ca6e47743240f`.
Patch SHA-256 `77be02fe1fe27d039f8300caf481f5325afc357729b65bafb60cfe4e7e5cf03d`.
Manifest SHA-256 `b9c4044bc02af49f5ee677b471f98f39a0c7dea7a0f54c1b3ae08648abc0316c`;
all89preserved baseline inputs match. Approved scope
`6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04`.
Eight final files reconstructed in memory from patch/baseline; all eight
final digests match. Author worktree copies used for probes also match.
Live AWAITING_REVIEW and D-172/P1–P6 incl P5 confirmed. Only manifest-input
live drift is expansion-plan deferred concept clips, no additional scope.

## SCI6-PREREQ-R1 — Major, high confidence

Frozen `src/curriculum/science-rules.ts:95`–109, coupled normalization157.
SVG text extraction confuses XML serialization with plain text. Numeric
character references are not decoded, while XML decoding is also applied to
plain alternative fields. A valid alternative may fail and an alternative
missing the rendered label may pass. Violates selected P5: every SVG text
string must appear case-insensitively in altText or accessibleAlternative.

Both figures pass ContentFigureSchema. Through frozen validateContentCatalog
with an otherwise valid synthetic Science practice record:

| SVG text      | altText       | accessibleAlternative | Observed                                   |
| ------------- | ------------- | --------------------- | ------------------------------------------ |
| `&#78;ucleus` | `Nucleus`     | `Synthetic text.`     | Rejected; requires literal entity spelling |
| `&#78;ucleus` | `&#78;ucleus` | `Synthetic text.`     | Accepted,129records                        |

SVG renders the label as Nucleus. React passes altText as ordinary string and
renders accessibleAlternative as ordinary text; neither decodes literal XML
syntax. Positive control without figure accepted; ordinary omitted Nucleus
rejected, confirming P5 reached.

Correction: extract rendered text from supported SVG subset with correct
XML character-reference handling. Normalize plain alternatives as plain text,
without XML entity decoding; decimal/hex references and supported named
entities must behave consistently.
Acceptance through validateContentCatalog: decimal/hex SVG labels with complete
plain alternatives pass; missing rendered labels fail; literal entity strings
cannot replace actual labels. Preserve ordinary-label/case/whitespace/multiple-
element/no-figure controls.

## SCI6-PREREQ-R2 — Minor, high confidence

Frozen `src/curriculum/science-rules.ts:157`–159 concatenates alternatives,
allowing a label to be manufactured across their boundary. P5 requires the
label in altText **or** accessibleAlternative.

Schema-valid counterexample accepted by validateContentCatalog (129records):

```text
SVG:                   <text x="5" y="20">Cell wall</text>
altText:               Diagram of Cell
accessibleAlternative: wall is indicated.
```

Neither field contains Cell wall; their concatenation does.
Correction: normalize fields separately and require each label entirely
within at least one field. Split counterexample must fail; full label in
either field passes; different complete labels may be covered by different
fields. Preserve case-insensitive/whitespace-normalized behavior. Required
acceptance-rule correction, not optional accessibility preference.

## Comprehensive coverage and evidence

| Requirement | Review result                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1          | Registry/policy/placeholder preservation, prefix and unavailable session gate checked; no defect.                                                            |
| P2          | Only sci6-life-science added, both labels, unavailable site gate retained.                                                                                   |
| P3          | Domain/program pairing,19exact ASCII standards vs approved dossier/scope, named validateSkillCatalog hook and existing records checked; no defect.           |
| P4          | Hook/practice/core-depth/contest/structured-choice/correct-option/per-field leakage checked including2/3character boundaries and multiple fields; no defect. |
| P5          | Ordinary controls covered; independent synthetic boundary probes establish R1/R2.                                                                            |
| P6          | Existing prefix/unique/cross-program/publication/availability mechanisms retained. No production Science skills/content; unavailable unchanged.              |

Inspected all eight patch files,29new test cases, coupled schemas/catalog/
publication/session code, decisions, approved sources and review procedures.
Minimal validation transcript corroborates80targeted tests, typecheck, lint,
curriculum-site generation passing. Final verify evidence reports94files/
2,004tests/build/exit0. Intermediate failures followed by final passes. New
tests do not cover R1/R2. Full suites not repeated by reviewer or integrator.

## Limitations and next step

Read-only independent execution: in-memory transpilation/synthetic fixtures;
no filesystem mutation/install/agents/database/provider/private/learner data.
No browser/screen-reader, actual Science content/mastery/teaching/release review.
validateVersionedSkillCatalog lacks Science semantic rules; exact P3 names
validateSkillCatalog and introduces no versioned Science records, so retain
as later boundary consideration. Raw publishableContentProjection admits
reviewed practice regardless of availability; existing skill/site projection
excludes Science. Preserved behavior, not a new finding.

Original Sonnet author retains both finding IDs, root-cause/locations/before-
after/positive-control/regression/status closure evidence and freezes new
hash. Same Codex reviewer then reviews changed scope, original counterexamples
and coupled regressions, classifying further findings under accountability.
Human exact-patch acceptance/application follows successful closure; D-173
conditions remain open. SWITCH TO Claude Code forge-implementer/Sonnet.
