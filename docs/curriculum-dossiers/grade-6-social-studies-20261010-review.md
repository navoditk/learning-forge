# Grade 6 California Social Studies research review — 2026-10-10

**Disposition: approve-for-human-review. Recommendation: ready for human review
with noted risks.**

This is an advisory, research-only review, not source approval, curriculum
approval, legal permission, mastery evidence, or runtime authorization.
The research dossier remains pending. No authored lessons, skill graph,
learner records, provider calls, purchases, or database work were in scope.

## Reviewed artifact and independence

- Artifact: `docs/curriculum-dossiers/grade-6-social-studies-20261010-research.md`,
  lines 1–297, in the isolated `school-social-studies` worktree.
- Base commit: `4f678f54c6583e76b527fcfb29f94080b9c9afac`.
- Dossier SHA-256:
  `d74f785f25e6c70a6a6d6894018161359c643a98b89e3508633e191ab36e1d89`.
- Initial reviewed SHA-256:
  `a6ef15bb60c921dd0a16250ad02b90aedcec141b956cf19e96883735cf8aafd2`.
- Method: re-derived coverage and metadata from official documents, raw
  publisher HTML, and local PDFKit/Vision extraction, rather than accepting
  research conclusions or search summaries.
- Actual-model independence: **VERIFIED by coordinator witness**. The
  coordinator supplied actual harness launch/`read_agent` metadata:
  author `d6dd7bb5-e233-437f-903a-a38c44f64bc3`, `claude-opus-5.5`
  (Claude family); reviewer `2b1c560e-37d1-424e-b6b3-ba6e44e5d2bb`,
  `gpt-6.1-sol` (GPT family). This records coordinator-witnessed cross-family
  evidence, not model self-report or independently inspected client logs.
  It resolves the initially unverified identity gate under
  `docs/agent-orchestration.md:31–49`.
- Re-review scope: **only prior F1–F4 corrections** against the new hash.
  Original primary-source evidence below is retained, not represented as a
  fresh full-dossier review or newly repeated web retrieval.

The review used `AGENTS.md`, README, relevant numbered curriculum/product,
safety and decision documents, the current school-scope entry in
`docs/PROGRESS.md:17–54`, research/authoring playbooks,
`docs/curriculum-sources.md`, `docs/content-review.md`, and orchestration policy.
Only this report is owned by the reviewer; shared progress/register updates
are the integrator's responsibility.

## Prior verified findings — all resolved in bounded re-review

Initial locations/evidence below refer to the initial hash, not the corrected
dossier's line numbering. Closure evidence cites the corrected hash.

### F1 — Required Persian content is also labeled optional

**Severity: major. Confidence: high.**

- **Resolved:** corrected lines 40, 92–93, 170–174, 241–244 and 277–280
  consistently retain standard 6.4.5 in mandatory core, separating optional
  later-empires/additional Persian detail from its required competency.
- Location: research dossier lines 40, 90, 229–231 and 258–260.
- Rule/source: [CDE HSS content standards](https://www.cde.ca.gov/be/st/ss/documents/histsocscistnd.pdf),
  printed p. 25, standard **6.4.5**.
- Evidence: the standard requires the Persian Empire's founding, expansion
  and political organization. The dossier correctly includes Persia in its
  6.4 summary at line 104, but elsewhere groups Persian/Parthian/Sasanian
  context as framework-only optional depth and states that these topics are
  not named in the 1998 standards. That classification is false for Persia
  and creates conflicting downstream authoring instructions.
- Smallest safe fix: explicitly retain 6.4.5 Persian coverage in mandatory
  core everywhere; distinguish optional additional Parthian/Sasanian detail
  and other framework enrichment from the required Persian competency.
  Do not make required content optional merely because the framework expands it.

### F2 — Adopted disciplinary literacy is classified as optional

**Severity: major. Confidence: high.**

- **Resolved:** corrected lines 79–83, 91, 245–249 and 277–280 require
  embedded, source-mapped RH/WHST reading/writing support. Only the storage
  of machine-readable tags remains an implementation decision; support is
  not optional and no stand-alone mastery claim is introduced.
- Location: research dossier lines 79–81, 89, 232–235 and 251–260.
- Rule/source: [CDE CA CCSS ELA/Literacy](https://www.cde.ca.gov/be/st/ss/documents/finalelaccssstandards.pdf),
  introduction and printed pp. 81–84; [framework Chapter 10](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter10.pdf).
- Evidence: the CA document was adopted August 2, 2010 and modified
  March 13, 2013. Its disciplinary literacy standards supplement, rather
  than replace, subject content standards. Treating them as a different
  standards layer does not make reading/writing support optional. Line 89
  says “Optional secondary tags,” and decision 3 leaves their inclusion open.
- Smallest safe fix: commit to mandatory, embedded RH/WHST 6–8 literacy
  support and source mapping alongside all HSS content/analysis coverage.
  Optional machine-readable tags are an implementation choice only, not
  optional instructional support. Separate that choice from unsupported
  stand-alone literacy mastery claims. Preserve grade-band applicability
  and the writing subparts when later mapping coverage.

### F3 — Model drafting is incorrectly instructed to become `original`

**Severity: major. Confidence: high.**

- **Resolved:** corrected lines 190–196 and 281–286 require `llm_drafted`
  and `pending_review`, forbid promotion to `original` by model/independent
  review, and preserve human approval as a separate recorded gate.
- Location: research dossier lines 188–189 and 261–264.
- Rule: `docs/content-review.md:52–55` and the model-assisted authoring pipeline.
- Evidence: the dossier says all authored records have
  `provenance.origin: "original"` and repeats this in the handoff to an agent.
  Repository policy explicitly requires model-assisted drafts to retain
  `llm_drafted`; originality of wording is not authorship provenance.
- Smallest safe fix: specify `llm_drafted` and `pending_review` for
  model-authored records. Independent/model review never rewrites their
  origin to `original`; human approval must also remain a separate recorded
  gate. Reserve other origins for evidence-supported authorship/licensing.

### F4 — Preferred gap resolution solicits a proprietary textbook extract

**Severity: minor. Confidence: high.**

- **Resolved:** corrected lines 233–240 and 290–293 preserve the confirmed
  ISBN, explicitly forbid soliciting textbook uploads/photos/extracts, and
  permit later chapter mapping only from a verified publicly accessible
  publisher-provided TOC. Standards-first ordering remains the current plan.
- Location: research dossier lines 222–228 and 269–272.
- Rule: this review packet's no-textbook-upload boundary and the dossier's
  own source-only/no-reproduction constraints.
- Evidence: decision 1 recommends an owner-supplied printed table of
  contents later, and the handoff repeats that route.
- Smallest safe fix: recommend standards-ordered alignment now and a
  publicly accessible publisher-provided TOC later. Remove solicitation of
  parent textbook uploads/extracts. An unresolved full TOC is acceptable and
  need not block a standards-first research dossier.

## Independently verified evidence

All retrievals below were performed on 2026-10-10. HTTP status describes
transport, not substantive access or licensing.

| Source                                                                                                                                                                             | Independent result and supported conclusion                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CDE HSS standards](https://www.cde.ca.gov/be/st/ss/documents/histsocscistnd.pdf)                                                                                                  | HTTP 200 PDF, 68 pages. Front matter confirms October 9, 1998 adoption and © 2000 publication. Printed pp. 23–26 contain all seven Grade 6 domains: 6.1.1–3 (3), 6.2.1–9 (9), 6.3.1–5 (5), 6.4.1–8 (8), 6.5.1–7 (7), 6.6.1–8 (8), 6.7.1–8 (8): **48 total**.                                                                                                                                                                                      |
| Same standards, printed pp. 21–22                                                                                                                                                  | Independently read all **14** Grades 6–8 analysis skills: CST 1–3, REP 1–5, HI 1–6. The source requires their learning/application through content and assessment in conjunction with content. The dossier correctly commits all 14 to core at lines 108–111.                                                                                                                                                                                     |
| [Framework Chapter 10](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter10.pdf)                                                                                               | HTTP 200 PDF, 45 pages. Title confirms Grade Six, July 2016 adoption, Sacramento 2017 publication. India discussion distinguishes jatis/varnas and social/cultural hierarchy, acknowledges contemporary diversity, and avoids equating all Hindus with caste. The extracted text has no “Aryan” occurrence; this does not remove standard 6.5.2.                                                                                                  |
| [Framework Chapter 1](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter1.pdf) and [Chapter 11](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter11.pdf)                  | Both HTTP 200 PDFs. Chapter 11 is the separate Grade Seven course, not Grade Six. The Grade 6 reference is Chapter 10.                                                                                                                                                                                                                                                                                                                            |
| [Framework Appendix F](https://www.cde.ca.gov/ci/hs/cf/documents/hssappendixf.pdf)                                                                                                 | HTTP 200 PDF, 8 pages. Academic/nondevotional instruction, equal historical-analysis rigor, no religious role-play or ritual simulation, and no ranking religions are verified. File-modification metadata is not evidence of a new adoption or substantive revision.                                                                                                                                                                             |
| [CA CCSS ELA/Literacy](https://www.cde.ca.gov/be/st/ss/documents/finalelaccssstandards.pdf)                                                                                        | HTTP 200 PDF, 98 pages. RH/WHST 6–8 are adopted supplemental literacy standards, not optional enrichment and not substitutes for HSS content.                                                                                                                                                                                                                                                                                                     |
| [2017 adoption report](https://www.cde.ca.gov/ci/hs/im/documents/hssadoptionreport.doc) and [IQC advisory report](https://www.cde.ca.gov/ci/hs/im/documents/iqcadvisoryreport.doc) | Both HTTP 200 Word files, independently converted in memory with `textutil`. Confirm November 9, 2017 SBE action, September 28, 2017 IQC action, and McGraw-Hill IMPACT Grades 6–8. The IQC document contains reviewed-copy Chapter 1 and online Chapter 7 references; these do not establish the current ISBN's full TOC.                                                                                                                        |
| [Publisher ISBN page](https://www.mheducation.com/prek-12/product/impact-california-grade-6-student-edition-world-history-geography-ancient-times-mcgraw-hill/9780076755905.html)  | HTTP 200 HTML, independently inspected raw metadata. ISBN 9780076755905, Grade 6, © 2019 and April 3, 2017 publication are verified. Application data says edition `"1"` while JSON-LD `bookEdition` is `0` and the display says “0th Edition.” Detailed HTML description wrongly describes Grade 7; JSON-LD description instead describes the Grade 6 product. These inconsistencies must remain explicitly unresolved, not silently normalized. |
| [Publisher sample](https://www.mheducation.com/unitas/school/explore/sites/california/samples/impact/6-8/0076755908.pdf)                                                           | HTTP 200 PDF, 52 pages. PDF metadata and selective in-memory Vision OCR confirm the cover and Chapter 5 Greek material, including printed page 155. This is a chapter fragment, not verified full-book sequencing or a reuse license. No publisher passages, questions or answers are reproduced in this report.                                                                                                                                  |
| [Publisher overview brochure LE.1017117](https://www.mheducation.com/unitas/school/explore/sites/california/social-studies/6-8-impact-overview-brochure-1017117.pdf)               | HTTP 200 PDF, 16 pages. Final page attributes Grade 6 authorship to Jackson Spielvogel and lists Jay McTighe, Dina Zike and Douglas Fisher as contributors. This verifies the brochure's printed attribution, not an exhaustive author list for every edition/component.                                                                                                                                                                          |
| CDE standards, framework, adopted-programs and reports landing pages linked in dossier                                                                                             | Rechecked: HTTP 200 redirects to Radware/PerfDrive challenges. No substantive contents, current revision history, errata or legal permissions can be inferred.                                                                                                                                                                                                                                                                                    |

The remaining register URLs were also transport-checked: publisher program
page and both brochure URLs returned 200; CalRecycle, World History
Encyclopedia, Perseus, DirectTextbook and AbeBooks returned 200; Met policy
and timeline returned 429; Smithsonian, British Museum, CHSSP and BookScouter
returned 403; Teaching California had no response. The rejected
Squarespace sequence and LBUSD poster returned PDF 200. Secondary metadata,
retailer summaries and URL/date patterns were not promoted to primary
authority. The literal `http://www.californiaeei.org/` address remains an
unverified locator, not evidence of source access.

## Acceptable gaps and release constraints

- The approved scope is California Grade 6 school HSS, `core` plus `depth`,
  ISBN 9780076755905, with **no IUSD/school pacing**. Geography Bee, school
  Science, Grades 7–8 authoring and contest tiers remain separate/out of scope.
- Standards-first ordering and an unset IMPACT chapter mapping are safe.
  No invented complete TOC, edition reconciliation or district alignment.
- All 48 substandards and all 14 analysis skills must remain explicit
  mandatory coverage; pairing each content skill with just one analysis code
  does not by itself demonstrate coverage of every analysis competency.
- Religion neutrality and culturally balanced India/caste treatment are
  appropriate research guardrails. Preserve 6.5.2 as required while arranging
  qualified scholarly review of its dated terminology. Teach about beliefs;
  never request, infer or store a child's/family's religion or caste.
- No image, translation, museum object or proprietary publisher content
  receives reuse permission from an accessible URL, state adoption or a
  “no cost” statement. Verify per-item terms before reuse. Unrelated NGSS
  permissions/policies cannot authorize HSS material.
- Current framework errata remain an honestly labeled access gap. File
  metadata alone does not establish a revised policy.
- Content-specific solution, pedagogy, accessibility implementation, schema,
  catalog, runtime and mastery tests are not applicable to this research-only
  packet. They remain required for later separately approved increments.

## Validation and next bounded step

- Official PDFs: read with Swift/PDFKit directly from primary URLs.
- Adoption Word reports: `curl -sSL` piped in memory to
  `textutil -convert txt -stdin -stdout`; passed.
- Publisher sample: local in-memory Vision OCR; headings/front matter only.
- Full dossier URL transport check: `curl -L --max-time 25 -sS` with HTTP
  status/content-type output; results and access limits recorded above.
- Report formatting: unversioned `npx --offline --no-install prettier`
  initially failed because that package selection was unavailable. Retried
  the repository-pinned cached `prettier@3.6.2`, without installing dependencies.
- `npx --offline --no-install prettier@3.6.2 --write` against this report:
  passed. The corresponding `--check` passed with “All matched files use
  Prettier code style!”
- `git diff --no-index --check /dev/null` against this report: no whitespace
  diagnostics; exit 1 denotes the expected new-file difference in no-index
  mode. A separate report-only whitespace assertion also passed.
- Python SHA-256 assertion against the pinned research dossier: passed;
  the research dossier is unchanged.
- Bounded re-review SHA-256 assertion: passed for
  `d74f785f25e6c70a6a6d6894018161359c643a98b89e3508633e191ab36e1d89`.
  F1–F4 closure evidence was read directly from the corrected artifact.
- No application tests, builds, provider calls or migrations were run:
  this is documentation-only and no runtime behavior changed.

No prior F1–F4 finding remains open. Next issue: the integrator should present
the corrected, pinned dossier and this report for human source approval,
including the acceptable TOC/edition, source-access, qualified-content-review
and per-item licensing gaps above. This recommendation is not human approval;
the dossier remains pending and authoring/runtime remain blocked.

**Recommendation: ready for human review with noted risks
(approve-for-human-review).**
