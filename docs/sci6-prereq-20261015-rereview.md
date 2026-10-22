# SCI6-PREREQ rev2 — changed-scope independent review

## Disposition

**CHANGES REQUESTED: two major P5 defects, R3 regression and R4 first-pass
miss.** Original R1/R2 counterexamples are fixed. Not ready for human patch
acceptance/application. Same native forge-reviewer, host-fixed gpt-6.1-sol,
`/root/sci6_prereq_review`. Report returned to designated integrator for
accountability checkpoint before further dispatch; no human choices approved.

## Freeze, independence and baseline

Direct minimal transcript metadata verifies original author152/152 assistant
records claude-sonnet-5-5; cross-family independence confirmed. Full-replacement
rev2 patch `0c9db656c8a6679bc7b51d8a3c353bba203c37ef83d8985d9a82d14ce56a5d1b`;
rev1 unchanged `77be02fe1fe27d039f8300caf481f5325afc357729b65bafb60cfe4e7e5cf03d`.
Original manifest/all89preserved inputs and scope
`6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04` verified.
Both revisions reconstructed in memory; all8final digests each match. Only
science-rules.ts and its test differ. Current HEAD
`059c7f6f64374e0c37359a0e06e4e93185b7f62f`: all30application files committed
since original base match original manifest baseline bytes. Live input drift
is decisions/expansion-plan documentation, no scope expansion. Leading
packet notice/index assign rev2 AWAITING_REVIEW; lower rev1 routing historical.

## Original finding closure

| Finding        | Verified result                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCI6-PREREQ-R1 | Decimal/hex encoded rendered Nucleus with plain alternative accepts; entity spelling alone rejects. Named-entity equivalents also verified. Original counterexamples closed. |
| SCI6-PREREQ-R2 | Split Cell wall across fields rejects; complete label in either field accepts. Original counterexample closed.                                                               |

P5 still fails below; preserving original closures is required.

## SCI6-PREREQ-R3 — Major, high confidence; regression

Frozen `src/curriculum/science-rules.ts:133`, coupled CDATA136–139.
Removing comments before recognizing CDATA deletes literal rendered characters
inside CDATA. Violates selected P5 requiring actual SVG text in an alternative.

```xml
<svg viewBox="0 0 200 120">
  <text x="5" y="20"><![CDATA[Nu<!-- hidden -->cleus]]></text>
</svg>
```

With altText Nucleus and accessibleAlternative Other., frozen rev2
validateContentCatalog accepts129records. Actual SVG label is literal
`Nu<!-- hidden -->cleus`, absent from both alternatives. Supplying that full
literal label instead incorrectly rejects because extraction produced nucleus.
Both fixtures pass ContentFigureSchema. Incomplete alternative rejected in
rev1, accepts in rev2: correction-introduced regression.

Correction: recognize lexical context before removing comments. Comment syntax
inside CDATA remains literal; process ordinary character data, comments and
CDATA in order. Acceptance: incomplete Nucleus rejects, complete literal label
accepts. Preserve ordinary `Nu<!-- hidden -->cleus`→Nucleus outside CDATA,
entities, whitespace and separate-field matching.

## SCI6-PREREQ-R4 — Major, high confidence; first-pass miss

Frozen `src/curriculum/science-rules.ts:151`–160. Opening/closing tag searches
lack XML lexical context. Closing-tag spellings in CDATA truncate extraction;
commented-out text elements are treated as live. Violates P5 rendered text
rather than XML spellings/comment contents.

```xml
<svg viewBox="0 0 200 120">
  <text x="5" y="20"><![CDATA[Nucleus </text>]]></text>
</svg>
```

With altText `<![CDATA[Nucleus` and accessibleAlternative Other., both
frozen revisions accept129records. Actual label `Nucleus </text>` is absent;
complete rendered-label alternative instead incorrectly rejects.
Related positive-control failure:

```xml
<svg viewBox="0 0 200 120">
  <!-- <text>Nucleus</text> -->
  <text>Membrane</text>
</svg>
```

altText Membrane incorrectly rejects for missing nucleus, although that element
is commented out. All figures pass ContentFigureSchema.

Why missed: first review checked entity decoding and field boundaries but
omitted tag-like strings in CDATA and commented-out elements. Same probes
against both frozen revisions confirm prior presence, not newly observable.
Correction: one context-aware extraction path recognizes actual text-element
boundaries, skips comments and preserves CDATA character data, coordinated
with R3. Acceptance: bypass rejects, complete CDATA label accepts, commented
text imposes no label requirement; multiple elements/normal comments/CDATA
remain positive controls.

## Evidence, limits and routing

Independent in-memory reconstruction/TypeScript transpilation and synthetic
probes against both exact revisions covered original R1/R2, ordinary omissions,
named/decimal/hex entities, CDATA/comments and new counterexamples. Inspected
closure tests and minimal final evidence:86targeted tests/35Science tests,
expected5failures against rev1,94files/2,010tests final verify. Tests omit R3/R4.
No new finding concerns stricter unsupported-entity rejection (including
nbsp), which was not an original requirement. P1–P4/P6 and other6files
unchanged. Versioned-catalog/availability/content/release limitations remain.
No writes/install/agents/DB/provider/private data/new research/full-suite
repeats; no patch applied.

Pause automatic dispatch for integrator cause/corrective-action checkpoint,
then consolidated original Sonnet R3/R4 correction with retained IDs,
before-after/complete-label controls and new freeze. Same reviewer checks
changed scope/original cases/coupled regressions. Patch acceptance blocked
pending closure; D-173 drafting/owner/release gates separate.
