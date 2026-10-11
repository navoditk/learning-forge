# Grade 6 school Science research — independent review, 2026-10-10

**Disposition after narrow re-review: ready for human review with noted risks.**
All four prior findings are resolved in the corrected dossier. The standards
coverage remains correct. This advisory report does not approve sources,
content, authoring, publication, or learner access.

## Scope and independence

- Reviewed artifact: `docs/curriculum-dossiers/grade-6-science-20261010-research.md`.
- Reviewed SHA-256:
  `191cec404fd5c3a8c147d143feace4d93b220c200c6b1d9f96585ccf031f14d2`
  (corrected 252-line dossier).
- Initial reviewed SHA-256:
  `b106eb620b177db014c0e1ac0ffe5b12174f292cb0eabe586cc30f76fcb0058d`;
  original finding locations below refer to this initial revision.
- Worktree base commit: `4f678f54c6583e76b527fcfb29f94080b9c9afac`;
  the staged dossier is an untracked artifact, so its hash pins this review.
- Scope: California Preferred Integrated Grade 6 school Science, `core` plus
  `depth`, no district/textbook pacing, Science Olympiad separate.
- Research-only review. No skill graph, lesson, problem, assessment bank, or
  runtime change was submitted; their absence is not a finding.
- **Actual-model independence: cross-family VERIFIED by coordinator witness.**
  The coordinator confirmed harness task/read metadata for executor
  `e55…` as `claude-opus-5.5` (Claude family) and reviewer `9b03…` as
  `gpt-6.1-sol` (GPT family), using Copilot task execution/read tooling.
  Task identifiers are abbreviated as supplied in the confirmation.
  This resolves the initial missing-identity evidence under
  `docs/agent-orchestration.md`; it is a coordinator metadata witness, not
  model self-report or an independent local inspection of harness metadata.
- All repository reads/searches were restricted to this worktree. Only this
  new report is owned by the reviewer; the dossier and shared registers/logs
  were not edited. No agents, paid providers, learner data, or databases used.

## Method and rules

Read `AGENTS.md`, relevant `README.md` and current `docs/PROGRESS.md` entries,
the research and authoring playbooks, `docs/curriculum-sources.md`,
`docs/curriculum-agents.md`, `docs/agent-orchestration.md`,
`docs/content-authoring-pipeline.md`, `docs/content-review.md`, relevant
numbered-document conventions, and `src/contracts/content.ts`.

Re-fetched the primary Grade 6 standards, reading actual PDF text with macOS
PDFKit, rather than a search summary. Independently checked framework front
matter, Chapter 5, Chapter 1's appendix-adoption passage, California
clarification edits, middle-school progression notes, and standards-reading
guidance. Downloads and extracted text stayed in memory. Checked all 29
distinct source URLs in the dossier and separately read important HTML sources
through web retrieval. The follow-up pass was restricted to SCI6-R1 through
SCI6-R4, the related engineering note, the revised hash, and coordinator
identity evidence; it did not reopen unrelated research or author new content.

## Narrow re-review — disposition of prior findings

| Finding | Corrected dossier location | Disposition                                                                                                                                                                                                                                                                                      |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SCI6-R1 | 229–252                    | **Resolved.** Source approval is necessary but insufficient; dated separate authoring authorization and existing D-61/role/policy gates remain mandatory. Originality is distinguished from `llm_drafted` provenance; content remains pending human approval; held-out material remains private. |
| SCI6-R2 | 51, 57                     | **Resolved.** Printed pages are 95–113 and 347–559 with a trailing unnumbered blank page. The standards' printed March 2015 revision and June 2021 footer now accompany embedded metadata.                                                                                                       |
| SCI6-R3 | 211–218                    | **Resolved.** Copyright eligibility and trademark use are separate conditional questions. No reproduction permission or new legal gate is inferred for this reference-only packet.                                                                                                               |
| SCI6-R4 | 66                         | **Resolved.** Five literal guessed URLs and six historical HTTP 404 attempts are recorded, including one repeated URL. Independently rechecked all five distinct paths: each returned HTTP 404. Guesses are explicitly not cited CDE links.                                                      |

The revised engineering note at 124–129 also resolves the prior caution:
all four ETS1 PEs remain Grade 6 `core`; the 6–8 band does not weaken that
coverage, and online proficiency evidence is left to assessment-validity
design rather than categorically ruled out.

**No remaining blocker, major, or minor finding in the corrected scope.**
Remaining research limitations below are disclosed risks, not evidence of
incorrect core coverage or permission to cross an approval gate.

## Verified conclusions

1. **19 PEs, with no omitted core engineering expectation.** The governing
   [CDE Grade 6 integrated standards](https://www.cde.ca.gov/ci/pl/documents/cangsspfintegrgr6.pdf)
   contain:
   - Life Science: MS-LS1-1, -2, -3, -4, -5, -8; MS-LS3-2 — **7**.
   - Earth/Space: MS-ESS2-4, -5, -6; MS-ESS3-3, -5 — **5**.
   - Physical: MS-PS3-3, -4, -5 — **3**.
   - Engineering: MS-ETS1-1, -2, -3, -4 — **4**.
     PE headers continue onto the second PDF page for three LS1 statements;
     two PE codes use an en dash in the PDF. Counting every referenced code
     instead of statement headers would incorrectly include cross-grade
     connections such as MS-PS1-6 and MS-LS2-5.
2. **MS-ETS1-4 belongs in core.** It is in the Grade 6 standards, printed
   p. 111, even though it is absent from the framework's Grade 6 example
   bundles and appears in later-grade examples. The dossier includes it
   and explicitly gives standards priority. The national 6–8 band is not
   permission to omit California's Grade 6 placement.
3. **Standards and guidance remain distinct.**
   [Framework Chapter 5](https://www.cde.ca.gov/ci/sc/cf/documents/scifwchapter5.pdf),
   printed p. 349, says the framework does not require a within-year PE
   order; p. 356 does not prescribe relative time per example segment.
   The four-segment storyline is optional guidance, not IUSD pacing.
4. **Dates are appropriately distinguished.**
   [Framework front matter](https://www.cde.ca.gov/ci/sc/cf/documents/scifwfrontmatter.pdf)
   verifies the 2016 edition, SBE adoption **November 3, 2016**, publication
   **Sacramento, June 2018**, ISBN 978-0-8011-0100-7, CDE copyright, and
   non-binding guidance notice. Chapter 5 verifies preferred-model approval
   **November 6, 2013**. Chapter 1 verifies September 2013 appendix adoption;
   the exact **September 4, 2013** CA NGSS adoption date is accurately
   labeled secondary-retrieved from the archived CDE page.
5. **California edit claim is scoped honestly.**
   [California clarification edits](https://www.cde.ca.gov/ci/pl/documents/editsngssclarification.pdf)
   list seven edited clarification statements and only one middle-school
   entry, MS-LS1-1. The domains-of-life/viruses additions match the Grade 6
   PDF. This establishes the edit found in this document, not that no other
   amendment exists. The dossier retains that limitation.
6. **SEP/CCC distinction is supported.** The Grade 6 PDF headings contain
   seven named SEPs and six named CCCs, not SEP-5 or CCC-1. That is not a
   claim that mathematics or patterns are absent from the course: PE
   wording, mathematics connections, and framework examples use them.
   Chapter 5, p. 349, describes all eight SEPs and all seven CCCs across
   every middle-grade course, with emphasis varying by lesson/year.
   The dossier's broader-framework distinction is reasonable; how to cover
   these deliberately is an authoring-design question, not a missing PE.
7. **Access reporting is honest.** Both live CDE standards-page URLs returned
   HTTP 200 with a Radware Captcha Page, not standards content. The challenge
   was not bypassed. Official PDFs were readable. The archive actually
   states December 2013 for panel reconvening; Chapter 5 and the progression
   PDF state December 2014. Recording that discrepancy is appropriate.
8. **Rights and safety are conservatively bounded.** Original descriptions
   and source references do not authorize reproduction of framework/NRC
   text or source activities. No PhET or EEI reuse permission is verified.
   Virtual/provided-data-first work, no hazardous home procedures,
   accessible representations, and non-alarmist climate framing are
   age-appropriate research recommendations. No executable activity or
   learner-facing resource was submitted.
9. **CAST context is correct.** The
   [official program page](https://www.caaspp-elpac.org/assessments/caaspp/cast)
   names grades five, eight, and once in high school, not a separate Grade 6
   test. No CAST-prep or district-adoption claim is made.

## Original findings — all resolved by the narrow re-review above

All locations below refer to the initial dossier hash, not the corrected
252-line revision. Original evidence and smallest remediations are retained
for traceability; they are not outstanding findings.

### SCI6-R1 — Source approval is presented as sufficient to start authoring

- **Severity:** major. **Confidence:** high.
- **Location:** lines 221–232, especially 223–229.
- **Rule:** `docs/curriculum-research-playbook.md` Output;
  `docs/curriculum-authoring-playbook.md` Precondition/Current pause;
  `docs/curriculum-agents.md` Current pause;
  `docs/content-authoring-pipeline.md` Workflow step 3.
- **Evidence:** the handoff directly instructs authoring once a human changes
  the source status to approved. It does not preserve the separately recorded
  D-61 lift/scoped-authorization requirement, subsequent human content
  approval, or the private location of held-out assessment material. The
  opening pending notice correctly blocks authoring now but does not fix
  the handoff's stated future trigger.
- **Smallest safe remediation:** replace that trigger with source approval
  **plus** separately recorded authoring scope and applicable existing gates,
  referring to the authoring playbook/D-61 rather than reproducing a stale
  gate list. State that candidate content remains `pending_review` until
  human content approval and that held-out assessment material stays in its
  authorized private location. In the same handoff, clarify that “original”
  describes non-copying: model-assisted drafts still use
  `provenance.origin: "llm_drafted"` and `licenseStatus: "owned"`, not
  hand-authored `original` provenance. No new lessons or authoring instructions
  need to be added; preserve the research-only boundary.

### SCI6-R2 — Two source-register page ranges are inaccurate

- **Severity:** minor. **Confidence:** high.
- **Location:** line 51 (SCI6-S01), line 57 (SCI6-S07).
- **Rule:** research playbook Inputs 1 / exact publication metadata.
- **Evidence:** the 19-page Grade 6 PDF prints **95–113**, not 95–112.
  Chapter 5 continues past 556 through references on **559**, followed by an
  unnumbered intentionally blank page; 347–556 is not the whole chapter.
  The Grade 6 document also visibly says **“Revised March 2015”** on its
  opening page and **California Department of Education, June 2021** on its
  last page. PDF creation/modification timestamps are not substitutes for
  these printed version/publication labels.
- **Smallest safe remediation:** correct the ranges to 95–113 and 347–559
  (noting the trailing blank page if desired); add the Grade 6 PDF's printed
  revision/footer dates beside, not instead of, embedded metadata. These
  corrections do not change the PE count or adopted-standard year.

### SCI6-R3 — Legal open item conflates copyright permission and trademark use

- **Severity:** minor. **Confidence:** high.
- **Location:** lines 207–210; contextual rights policy at 178–184.
- **Rule/source:** research playbook Inputs 3 / Non-goals;
  [NGSS Trademarks and Copyright](https://www.nextgenscience.org/ngss-trademarks-and-copyright/ngss-trademarks-and-copyright).
- **Evidence:** the page separately provides a public copyright permission
  for named educational/nonprofit entities and commercial **trademark**
  guidelines. Commercial trademark guidelines are not a commercial copyright
  license. The dossier groups them as alternatives and puts legal confirmation
  of mere PE-code references plus original descriptors under “decisions
  requiring human review,” despite proposing no reproduction or trademark
  deployment.
- **Smallest safe remediation:** distinguish copyright-reuse eligibility from
  future trademark/logo use and retain both as conditional questions if those
  uses are proposed. Do not invent a mandatory new legal/license approval gate
  for this reference-only, non-reproduction source packet. Human source
  approval and the existing authoring/content gates still apply. This finding
  supplies no legal permission to reproduce full standards or source text.

### SCI6-R4 — Unavailable-handbook attempts cannot be reproduced

- **Severity:** minor. **Confidence:** high.
- **Location:** line 66 (SCI6-S16).
- **Rule:** research playbook Inputs 4 / checkable references and access status.
- **Evidence:** “Candidate direct PDF paths returned HTTP 404” records a
  result but supplies neither the literal attempted paths nor how many
  attempts returned that result. The accessible framework citations and
  archived link are supplied; the failed direct attempts are not.
- **Smallest safe remediation:** list the actual attempted URLs and literal
  HTTP outcomes/counts, or remove that unverifiable direct-attempt claim
  and retain only the known cited existence and “not located/not read”
  limitation. Do not invent paths or claim the handbook itself was read.

## Questions and residual risks — not additional defects

- **Current amendments:** unblocked human checking may still find a newer
  state posting. No current-page verification is claimed.
- **Engineering mastery:** the corrected note preserves all four Grade 6
  engineering PEs. Actual in-product investigation/design evidence still
  requires the later assessment-validity decision.
- **Safety authority:** the unread handbook is an acceptable disclosed gap
  for a virtual/data-only research scope, not approval for hands-on work.
  Hands-on activities need their own applicable safety review.
- **External resources:** PhET/EEI remain unverified candidates; linking or
  embedding for learners was not authorized or evaluated here.
- **Assessment validity:** deciding which investigation/design components can
  genuinely be evidenced online remains a subsequent domain/policy task.
  An LLM opinion or ordinary practice completion cannot establish mastery.
- **Copyright/originality:** reviewed short descriptors and general pedagogy,
  not an exhaustive similarity audit of nonexistent authored items.
- **Model independence:** resolved by the coordinator's task/read-metadata
  witness above. Review recommendations remain advisory despite verified
  model diversity.

## Validation evidence

- In-memory PDFKit extraction: **passed** for the principal sources listed
  above; independently inspected all 19 assessable PE statements and the
  key adoption, edition, authority, and dimension passages.
- Python standard-library URL recheck, 29 distinct URLs: **26 returned
  HTTP 200; 3 returned HTTP 403**. Of the 26 HTTP 200 responses, 19 had PDF
  magic bytes, two were live CDE bot-challenge bodies, and five were other
  HTML pages. These are this review's observed outcomes, not a rewrite of
  the author's historical retrieval log.
- Narrow follow-up Python standard-library recheck of the five newly literal
  handbook paths: **5/5 HTTP 404**. This corroborates the five distinct
  unavailable endpoints, not the historical timing of all six author attempts.
- The three direct Python HTTP 403 outcomes were the NGSS copyright page,
  NGSS MS-ETS1 page, and PhET licensing page. Separate web retrieval read
  the copyright page and the official MS-ETS1 statements/dimension HTML,
  and obtained only the PhET licensing title. No readable PhET license was
  inferred from either response.
- `npx --offline --yes --package=prettier@3.6.2 prettier --check --ignore-path /dev/null docs/curriculum-dossiers/grade-6-science-20261010-review.md`:
  **passed** after formatting this report with the corresponding `--write`
  command. The initial check found formatting differences; they were corrected.
  Existing cached Prettier was used; no project dependencies were installed.
- `git diff --check -- docs/curriculum-dossiers/grade-6-science-20261010-review.md`:
  **passed**. Because this report is untracked, also ran
  `git diff --no-index --check /dev/null docs/curriculum-dossiers/grade-6-science-20261010-review.md`:
  **no whitespace diagnostics**; exit 1 denotes the new-file difference.
- `shasum -a 256 docs/curriculum-dossiers/grade-6-science-20261010-research.md`:
  the dossier hash matches the pinned reviewed artifact; no source edit.
- No application build, runtime tests, content/schema validation, database
  checks, or real-provider evals required or run: only a documentation review
  artifact was written; no content/runtime behavior changed.

**Recommendation: ready for human review with noted risks.** The corrected
packet resolves the prior findings, preserves all 19 PEs, and has a verified
cross-family coordinator witness. Live-page amendment checking, external
resource rights, hands-on safety authority, and online assessment validity
remain honestly disclosed. Human source approval remains scoped to sources,
not permission to author, approve content, or release a learner-facing course.
