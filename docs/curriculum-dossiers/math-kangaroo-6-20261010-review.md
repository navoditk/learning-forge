# Math Kangaroo Grade 6 refresh — independent research review

**Review date:** 2026-10-10.

**Verdict:** `approve-for-human-review`.

**Recommendation:** **ready for human review with noted risks**. This is advisory review, not human
source approval, content approval, or authorization to resume authoring.

## Scope and independence

- Reviewed only `docs/curriculum-dossiers/math-kangaroo-6-20261010-refresh.md`,
  SHA-256
  `39381d71dc251c07a8ce021acb2ffe42cbaa2c5538648fbb3ea3460ec01e690d`.
  This follow-up reviews **only MK-R1–MK-R4 and tightly coupled wording**.
  Corrected line references below identify this revision. Initial review
  evidence was collected against SHA-256
  `7443dd68a3cb4bfc9c3dc75adc1059edb0d3a92307f0d0ed40d50a1877a9b51f`.
- Read the assigned worktree's `AGENTS.md`, README, current/resume progress
  sections, research/authoring playbooks, model-orchestration policy, content
  review rules, and approved 2026-09-19 Math Kangaroo source section.
- Re-derived findings from public source HTML rather than the researcher's
  conclusions. No nested agents, purchases, PDF/problem/answer-key downloads,
  database access, learner data, or model-provider calls were used.
- **Actual-model cross-family independence: VERIFIED by coordinator witness.**
  The coordinator supplied verified harness `task`/`read_agent` metadata:
  author `de7bd4cb-b2c1-4886-92b4-081c5d4dba5f`, `claude-opus-5.5`
  (Claude family); reviewer `5e8afed6-61ff-4612-a23a-84cb9e74e613`,
  `gpt-6.1-sol` (GPT family). This records the coordinator's client-metadata
  witness, not model self-report or a fresh metadata inspection by this
  reviewer. The initial report's identity uncertainty is resolved by that
  supplied evidence.
- Only this report is written. The approved baseline, refresh dossier, shared
  source register, progress log, policy, schemas, and content remain untouched.
  The coordinator owns the eventual shared progress checkpoint.

## Follow-up disposition — MK-R1–MK-R4

All four original findings were minor, high-confidence documentation defects.
**All are resolved; no unresolved finding remains in this bounded scope.**

| Finding                                        | Corrected refresh lines | Disposition and evidence                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MK-R1 — Citation completeness and exact titles | 38, 67, 71, 84–85       | **Resolved, high confidence.** Exact FAQ/faculty titles restored; secondary titles, issuers and explicit unknown dates supplied; dedicated Privacy Policy row includes title, issuer, publication/modification dates, retrieval date and literal HTTP status. The actual About URL and metadata now appear in the bounded six-page check. |
| MK-R2 — Overbroad privacy-page negative search | 85–86                   | **Resolved, high confidence.** The zero-copyright-match assertion is removed. The dedicated privacy row instead records the observed footer notice and bounded unverified reuse-permission status.                                                                                                                                        |
| MK-R3 — Archive-wide pricing inference         | 40                      | **Resolved, high confidence.** The four observed product prices/labels are preserved; access varies by item, with other years/items explicitly unverified. No “mostly paid” generalization remains.                                                                                                                                       |
| MK-R4 — Categorical legal interpretation       | 67, 76, 85, 90–99       | **Resolved, high confidence.** Wording states that no reuse permission was verified on the checked pages and that FREE/paid labels describe catalog access offerings. Original skill-type inspiration and the no-copy/no-close-paraphrase repository restriction remain explicit; no legal permission or authoring approval is inferred.  |

For MK-R1, independently refetched only the six affected citation URLs:
About the Test, Faculty Instructions, Privacy Policy, About Math Kangaroo,
India Syllabus, and Think Academy. All returned final HTTP 200 on
2026-10-10. Their exact HTML titles matched the corrected dossier. USA schema
dates matched the supplied corrections, including faculty publication
2017-03-01/modification 2026-03-05 and privacy publication
2021-08-16/modification 2024-10-23. No page date was located for the two
secondary sources; this is not a claim that no date exists anywhere.

MK-R2–MK-R4 were checked directly against the corrected text and previously
verified footer/catalog evidence. No wider source search, new program
research, paper inspection, or authoring review was performed in this pass.

## Primary-source verification

The retained initial-pass checks below used served HTML with `curl -L`, a
browser user agent, final literal HTTP status, and retrieval on 2026-10-10.
They were not all rerun in this bounded follow-up. No linked papers were opened.

| Rechecked primary source                                                                                                | Final HTTP | Independently supported conclusion                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [USA About the Test](https://mathkangaroo.org/mks/faqs/about-the-test/)                                                 | 200        | 75-minute multiple-choice exam; 30 questions for grades 5 and higher. Older regular fee $18.                                                                                                                                |
| [USA Scoring](https://mathkangaroo.org/mks/resources/math-kangaroo-scoring/)                                            | 200        | One third each worth 3/4/5 points; no deduction for incorrect answers; maximum 120 for grades 5–12; ranking at each school grade.                                                                                           |
| [USA Logistics](https://mathkangaroo.org/mks/resources/math-kangaroo-logistics/)                                        | 200        | Annual third Thursday in March; calculators/smartphones prohibited.                                                                                                                                                         |
| [USA Day Instructions](https://mathkangaroo.org/mks/resources/math-kangaroo-day-instructions-for-students-and-parents/) | 200        | Calculator/smartphone prohibition; scratch paper; no make-up; answer key one month and one day later; results May 1.                                                                                                        |
| [USA Registration](https://mathkangaroo.org/mks/registration/)                                                          | 200        | Body explicitly says registration for the 2027 season is open; school-grade placement; five participation options; virtual score/ranking-range distinction; $20 regular/$35 late. Some older 2026 enrollment text persists. |
| [USA Home](https://mathkangaroo.org/mks/)                                                                               | 200        | Explicit body announcement: 30th annual individual competition, March 2027, registration opens September 15, 2026. Season/date evidence is not inferred from the URL or filename.                                           |
| [USA Faculty Instructions](https://mathkangaroo.org/mks/resources/math-kangaroo-day-instructions-for-faculty/)          | 200        | Third Thursday in March.                                                                                                                                                                                                    |
| [USA Grades 5–6 Practice](https://mathkangaroo.org/mks/practice/grades-5-6/)                                            | 200        | Questions and solutions listings 1998–2026; 2015 and 2025 question listings marked FREE; 2010/2020 online tests marked FREE.                                                                                                |
| [USA PDF Exams](https://mathkangaroo.org/mks/practice/pdf-exams/)                                                       | 200        | Grades 5–6 body links 1998–2025; meta description still 1998–2023. Link coverage is not verified paper content.                                                                                                             |
| [AKSF KSF History](https://www.aksf.org/history.xhtml)                                                                  | 200        | Historical 1996 category statement: Benjamin, “10 to 12-year-olds”; curricula introduced in 2013. No USA school-grade equivalence follows.                                                                                  |
| [AKSF KSF Countries](https://www.aksf.org/countries.xhtml)                                                              | 200        | United States member explicitly Math Kangaroo USA, NFP.                                                                                                                                                                     |

The four cited Oasis catalog URLs also returned HTTP 200: 2024 questions
$1.99; 2025 questions FREE; 2026 questions $1.99; 2025 solutions $3.99.
These are observed labels/prices only, not an entitlement or reuse finding.
Registration FAQ confirms the registered-family 50% PDF discount statement.
Team Competition is explicitly a new program with teams of 2–4; its separate
research boundary is preserved.

### Bounded negative checks

- Independently searched served text from the six named USA pages: home,
  registration, About the Test, Grades 5–6 practice, PDF exams, and About
  (`/mks/about-math-kangaroo/`). Each returned HTTP 200 and zero `Benjamin`
  matches.
- Those six pages had no exact March 2027 calendar date matching the checked
  textual/ISO date patterns. This is not an exhaustive site/search-engine
  search and does not establish that no date exists anywhere. Do not invent
  or compute a displayed date.
- Home, registration, and About the Test text had no five/5-options,
  answers, or choices match under the performed pattern. Official five-answer
  confirmation remains an acceptable explicit gap; the approved baseline
  owner-confirmation is not silently withdrawn.
- Rechecked the five guessed USA paths recorded in the dossier: each final
  HTTP 404. Bare `https://aksf.org/` yielded curl `000`, exit 35: no HTTP
  response, not an HTTP error status. No site-wide absence follows.
- AKSF governance download destinations were visible but not opened.
  No per-category curriculum or reuse terms were verified.

## Scope conclusions and residual risks

- The pending refresh does not supersede the approved USA Grade 6 baseline,
  authorize authoring, alter tutoring/mastery policy, or turn contest scoring
  into authoritative mastery evidence.
- USA school grade 6 / Levels 5–6 and AKSF historical Benjamin age 10–12
  remain distinct. No international grade equivalence is established.
- Preserve the $18/$20 official-page conflict; do not publish fee promises.
  Metadata recency is not alone proof that all page details are current.
- Archive topic coverage remains unverified because no paper was read.
  No authored problems, graphs, hints, validators, or assessment items were in
  scope, so content-specific subject/pedagogy/schema checks are not applicable.
- Required next step: coordinator presents the corrected, reviewed refresh for
  explicit human source approval and records the disposition in the shared
  register/progress log. New curriculum authoring remains subject to its
  separate gates; this recommendation does not supersede the approved baseline.

## Validation

Documentation-only report; no runtime/content changes. The worktree has no
installed dependencies: the initial no-install npm formatter attempt failed.
Used the existing formatter executable without installing dependencies or
editing files outside this report. The first whitespace check caught Markdown
hard-break trailing spaces; removed them and reran validation.

Final validation commands: Prettier passed; the report-only no-index check
emitted no whitespace diagnostics (exit 1 is the expected new-file difference,
not a whitespace failure).

```bash
WORKTREE=/Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/parallel-20261010/kangaroo-refresh
REPORT="$WORKTREE/docs/curriculum-dossiers/math-kangaroo-6-20261010-review.md"
FORMATTER=/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier
"$FORMATTER" --check --ignore-path /dev/null "$REPORT"
git -C "$WORKTREE" diff --no-index --check /dev/null "$REPORT"
```

No full build, unit/integration/e2e suites, database tests, or provider evals
were run or needed for this report.
