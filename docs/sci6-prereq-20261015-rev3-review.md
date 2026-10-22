# SCI6-PREREQ rev3 — changed-scope independent review

## Disposition

**Ready for human review with noted risks. R1–R4 closed; no new verified
findings.** Same native forge-reviewer, host-selected gpt-6.1-sol,
`/root/sci6_prereq_review`. Exact artifact acceptance/application remains a
human gate. Review grants no drafting, availability or release permission.

## Verified freeze, independence and baseline

Direct original-author metadata187/187 assistant records claude-sonnet-5-5;
cross-family independence confirmed. Rev3 patch SHA-256
`931133dd5be21caec847d6d396c6814decb62758aa8ee4cb0d344c4bd5db6fa7`.
Closure `ffffd0557b731c1ee90a3404c2016f2a313109a23aa8f1737c3eec9345a52da5`,
results `f1d271df8787e5d045d819002007aa26ffa74184f9c1fbda05361e65a6aec63a`,
final-digests `7719152b91bc14a149cff24f589ea3391c0da516f16acfc7c714b21b661c1c27`
match packet. Rev1/rev2 unchanged. Original manifest/all89preserved inputs
match. In-memory rev3 reconstruction matches8final digests; only
science-rules.ts/test differ from rev2. HEAD
`059c7f6f64374e0c37359a0e06e4e93185b7f62f`,30committed application files
match accepted original baseline. Index/rev3 notice correctly assign this
review; lower routing was earlier-revision history.

## Closure verification

| Finding | Independent evidence and result                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Closed/preserved: decimal/hex SVG refs with complete plain alternatives accept; literal entity strings alone reject; named positive/negative controls preserved.                                                      |
| R2      | Closed/preserved: labels assembled across fields reject; complete label in either accepts.                                                                                                                            |
| R3      | Closed: CDATA preserves literal comment syntax. Incomplete Nucleus rejects; complete Nu<!-- hidden -->cleus accepts. Outside CDATA ordinary comment contributes no text and Nucleus accepts.                          |
| R4      | Closed: CDATA closing-tag spelling no longer ends extraction. Incomplete alternative rejects, complete Nucleus </text> accepts. Commented-out text imposes no requirement; actual Membrane accepts, omission rejects. |

Scanner at frozen src/curriculum/science-rules.ts:174 handles comments,
CDATA, processing instructions, quoted attributes and text boundaries in
lexical order. Coupled probes verified mixed entities/CDATA/comments,
multiple elements, self-closing text, quoted greater-than and tag-like CDATA.
No unresolved, regression, first-pass-miss or newly observable finding remains.

## Evidence and limitations

Independent exact in-memory rev2/rev3 comparisons through
validateContentCatalog confirm failing-before/passing-after behavior. Author
per-probe R3/R4 before descriptions quote prior review rather than fresh
individual runs; author separately ran expanded test file against earlier
rules. Minimal transcript corroborates11failures on rev1,6on rev2,
41passing Science tests,92targeted tests,94files/2,016tests final verify.
Independent comparison supplies fresh original-before confirmation.

Stricter malformed-markup/unsupported-entity rejection is author choice;
no conflict with selected supported subset verified. Earlier versioned-catalog
limitation, baseline Prisma build warning and later content/availability/
release gates remain. No actual Science content or release review performed.
Changed-scope/original-counterexample/coupled-regression review only; no edits,
installs, agents, DB/providers/private data/new research/full-suite repeats.

Return to integrator for exact rev3 acceptance/application, no further
correction or assurance review indicated. WAITING FOR HUMAN APPROVAL.
