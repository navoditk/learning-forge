# MATHCOUNTS Grade 6 refresh — independent research review

**Disposition: approve-for-human-review.** Research-only review with scoped
remediation re-review, 2026-10-10
(America/Los_Angeles). This is advisory, not human source approval or
authorization to author, publish, or change product policy.

## Reviewed revision and boundaries

- Worktree:
  `/Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/parallel-20261010/mathcounts-refresh`.
- Reviewed artifact: `docs/curriculum-dossiers/mathcounts-6-20261010-refresh.md`.
  Original-finding line citations refer to the initial revision; closure
  citations refer to the corrected revision identified below.
- Initial artifact SHA-256:
  `f22e7d7ceec97c6876f7dabecf1640b619e3cce2ac970f9f8aa2cf769c9affa3`.
- Corrected artifact SHA-256, independently matched during re-review:
  `e8987d3f6201ff6fac472fa0f2450b1a151850a7043f5b6a533eb4712d20738e`.
  Worktree HEAD: `4f678f54c6583e76b527fcfb29f94080b9c9afac`.
- Baseline: `docs/curriculum-sources.md:698-917`, the owner-approved
  2026-09-18 MATHCOUNTS dossier. The refresh correctly preserves that
  approval and leaves the delta pending.
- Read `AGENTS.md`, `README.md`, the latest progress entries, the relevant
  curriculum/pedagogy document, research and authoring playbooks,
  `docs/content-review.md`, and `docs/agent-orchestration.md`.
- Only this new report is reviewer-owned. No dossier, shared register,
  progress log, curriculum JSON, provider, database, purchase, commit, or
  confidential School Competition was changed or accessed.
- No actual competition problem, answer key, or solution text was
  downloaded or reviewed. Archive checks used page link metadata and HTTP
  HEAD requests only. Authored-item, mastery, and runtime tests are not
  applicable to this source-only packet.

### Model-independence evidence

**Verified by coordinator witness.** In the remediation request, the parent
confirmed actual harness selections using task/read metadata:

- Research executor task `2ab1…`: `claude-opus-5.5` (Claude family).
- Reviewer task `feabe…`: `gpt-6.1-sol` (GPT family).

Task IDs are abbreviated exactly as supplied; full UUIDs were not supplied
in this review context. This evidence comes from the coordinator's confirmed
harness metadata, not role defaults or model self-report. It resolves the
initial metadata gap and establishes cross-family independence for this
review and the corrected dossier hash above, per
`docs/agent-orchestration.md:30-49`.

## Verified findings — both closed

The initial disposition was changes-required. Re-review was limited to R1/R2
corrections: delta rows 19/23, the licensing paragraph and source-register
note, and owner-review items 2/5. The prior primary-source retrieval evidence
below remains the basis; no new research, contest-paper retrieval, or
authoring was performed.

### R1 — Incomplete statement of the site's name/mark restriction

- **Severity:** major. **Confidence:** high.
- **Original location:** lines **68, 114-117** in the initial revision.
- **Source/rule:** [Terms of Use](https://www.mathcounts.org/about/terms-use);
  source fidelity and explicit licensing/access constraints.
- **Original evidence:** The dossier reported the sponsorship/affiliation restriction
  but omitted a separate express restriction: names, trademarks, service marks,
  and logos appearing on the site may not be used in **advertising or
  publicity**, or otherwise to indicate sponsorship/affiliation, without
  prior express written permission. The official page was independently
  retrieved successfully and states both branches. Avoiding an endorsement
  implication alone does not capture the advertised terms.
- **Smallest safe remediation:** In row 23 and the licensing paragraph,
  record the advertising/publicity branch as well as the
  sponsorship/affiliation branch, with prior express written permission.
  Keep descriptive naming outside advertising/publicity as an unresolved
  legal/owner question; do not assert that every descriptive mention needs
  consent or that neutral branding automatically satisfies the terms.
  No broader copyright or trademark-law conclusion is required.
- **Closure: resolved, high confidence.** Corrected line **68** and lines
  **114-126** explicitly record advertising/publicity and
  sponsorship/affiliation restrictions with prior express written permission.
  The source-register note and owner item 5 carry the same constraints.
  Descriptive in-product and repository-internal naming remain an unresolved
  legal/owner question, with no blanket consent requirement or neutral-name
  permission inferred. No further R1 remediation is required.

### R2 — Compatible OPLET counts are labeled an internal conflict

- **Severity:** minor. **Confidence:** high.
- **Original location:** line **64**; contextual open item **182-184** in
  the initial revision.
- **Source/rule:** [OPLET](https://www.mathcounts.org/resources/oplet) and
  [Past Competitions](https://www.mathcounts.org/resources/past-competitions);
  accuracy of delta/conflict classification.
- **Evidence:** OPLET gives approximately 16,000 problems and about 6,500
  solutions. Past Competitions gives **over** 15,000 and **over** 6,000.
  These lower bounds are compatible with the more precise counts, not
  contradictory. The 1990-2026 filter and more-than-25-year description
  remain genuine changes against the dated baseline.
- **Smallest safe remediation:** Replace “internal conflict” with
  “different precision across official pages” or equivalent. Preserve both
  literal descriptions, the approximation qualifiers, and the actual
  baseline delta. This does not require further archive research.
- **Closure: resolved, high confidence.** Corrected line **64** and owner
  item 2 at **193-198** classify the numbers as compatible differences in
  precision, preserve the approximate-count qualifiers, and retain the
  genuine baseline changes. No further R2 remediation is required.

## Independently verified strengths and retrieval evidence

Retrieval date: **2026-10-10**. Python 3 `urllib` GET requests used a browser
user agent and extracted only relevant public rules/resource prose in
memory. Web retrieval provided an additional direct view of the critical
dates and terms. No response headers were treated as publication dates.

| Current official URL                                                                         | Retrieval evidence                                                                     | Confirmed claim                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Official Rules + Procedures](https://www.mathcounts.org/programs/official-rules-procedures) | GET HTTP 200, visible body read                                                        | 2026-2027 rules; full-time grades 6-8; official definition of U.S. student; school/NSC distinction; Sprint 30/40 minutes, Target 8 in four pairs at 6 minutes/pair, Team 10/20 minutes, Countdown 45-second procedure; Individual maximum 46 and Team maximum 66; calculator restrictions.             |
| [Competition Rules & FAQ](https://www.mathcounts.org/programs/competition-rules-faq)         | GET HTTP 200, visible body and stale metadata checked                                  | Three-year participation limit; school November 2026-January 2027; chapter February 1-28; state March 1-31; national May 9-10, 2027 in Washington, DC; November 3 School Competition release; November 5 NSC registration; November 3/December 15 fee deadlines; Chapter/State posting in March/April. |
| [Critical Dates](https://www.mathcounts.org/programs/critical-dates)                         | Direct web retrieval, dated entries read; numeric HTTP status not exposed by that tool | Confirms chapter/state/national dates, November 3 release, November 5 NSC opening, and registration deadlines.                                                                                                                                                                                         |
| [School Handbook](https://www.mathcounts.org/resources/mathcounts-school-handbook)           | GET HTTP 200, public offering descriptions read                                        | Coach edition has 250 problems/solutions; customer edition has 200. This is a real clarification of the baseline, not permission to reuse either edition.                                                                                                                                              |
| [OPLET](https://www.mathcounts.org/resources/oplet)                                          | GET HTTP 200, public descriptions and FAQ read                                         | Approximately 16,000 problems, about 6,500 solutions, more than 25 years, 1990-2026 filter in five-year blocks, 1-5 difficulty, and no extraction of entire competitions or a chosen numbered competition problem; paid 12-month access.                                                               |
| [Past Competitions](https://www.mathcounts.org/resources/past-competitions)                  | GET HTTP 200; all **16** linked archive PDFs independently returned HEAD HTTP 200      | School Sample has four links; 2025-2026 Chapter and State each have six. Page explicitly describes replacement as current competitions finish. No national papers linked in this archive. HEAD establishes availability, not PDF edition, copyright, or content.                                       |
| [Terms of Use](https://www.mathcounts.org/about/terms-use)                                   | GET HTTP 200; legal clauses also read through direct web retrieval                     | Reproduction, retransmission, and republication require prior written consent; express names/marks restrictions include advertising/publicity as well as sponsorship/affiliation. No Learning Forge reuse consent established.                                                                         |

In particular:

- The official School Competition confidentiality restriction is real.
  The dossier's no-obtain/no-use instruction is appropriately conservative
  for this research and enrichment task. Only the public rule was read;
  the current School Competition was not touched.
- The rules call 23/46 “highly commendable.” The dossier correctly treats
  this as contest score-scale information, **not** Learning Forge mastery,
  assessment, unlock, or pedagogical policy.
- Competition Series remains the only in-scope program. No change to the
  approved core-prep/contest split, optional Countdown, deferred Team mode,
  or limited state/national-readiness framing is introduced.
- No school, learner, coach, or chapter identity was searched. The local
  school-team/NSC route remains an operational open item and need not be
  resolved for source-delta review.
- The source dossier contains no reproduced contest items. Its original-only
  authoring constraints remain repository policy, not an invented broader
  interpretation of copyright law.

## Residual risks and deliberately unverified details

- The existing November 3 versus preview November 6 release-date discrepancy
  is carried forward honestly from the approved baseline. November 3 was
  independently confirmed on the current public pages; the preview PDF was
  not reread in this review. Do not silently reconcile that discrepancy.
- PDF creation/modification dates, printed codes/copyright years, preview
  page count, the old complete handbook, and the unlabeled Forms of Answers
  were not independently re-extracted. Archive HEAD checks do not prove
  those content-level metadata claims.
- This was not a new exhaustive source search. Ancillary Club, video,
  grades 3-5 pilot, Minis, Practice Plans, and topic-filter details were
  assessed for scope consistency, not all independently re-retrieved.
  Gated resources, claimed unavailable paths, and a national-paper search
  were not repeated.
- Owner acceptance of the delta, answer-form currency, and naming/legal
  review remain separate gates. Actual-model independence is now confirmed
  by the coordinator witness above.

## Validation and next step

Documentation-only validation is targeted to this report: Prettier and
`git diff --check`. No full suite, database, browser, provider, or curriculum
validation is needed for a new review document.

- `npm exec --offline --package=prettier@3.6.2 -- prettier --write --ignore-path /dev/null docs/curriculum-dossiers/mathcounts-6-20261010-review.md`
  — passed; used cached tooling because this isolated worktree lacks local
  `node_modules/.bin/prettier`.
- `npm exec --offline --package=prettier@3.6.2 -- prettier --check --ignore-path /dev/null docs/curriculum-dossiers/mathcounts-6-20261010-review.md`
  — passed.
- `git diff --check` — passed for tracked worktree changes.
- `git diff --no-index --check /dev/null docs/curriculum-dossiers/mathcounts-6-20261010-review.md`
  — no whitespace diagnostics; exit 1 indicates the new file differs from
  `/dev/null`, not a reported whitespace error.
- SHA-256 comparison — passed; the reviewed source dossier was unchanged.
- The initial `python` retrieval attempt failed because only `python3` is
  installed; an initial default-user-agent retrieval returned HTTP 403.
  Both were resolved using Python 3 with an explicit browser user agent.

Scoped re-review validation repeats the targeted formatting/whitespace checks
above and compares the corrected dossier against its pinned SHA-256.
**All repeated checks passed**, with no report whitespace diagnostics and
the corrected source hash unchanged. The
initial hash-preservation result belongs to the initial review; the corrected
hash is the current source identity.

Next issue: present the corrected pending delta and remaining operational,
answer-form, and naming/legal questions to the product/content owner. The
approved baseline stays unchanged, and no new authoring is authorized.

**Recommendation: ready for human review with noted risks.** R1 and R2 are
closed; no verified defect remains in the scoped corrections. This is an
advisory recommendation, not human approval of sources, legal interpretation,
new authoring, or a product-policy change.
