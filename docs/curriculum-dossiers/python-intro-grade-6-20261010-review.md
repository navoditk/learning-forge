# Python Grade 6 beginner research — independent review — 2026-10-10

**Current verdict: `approve-for-human-review` following the narrow
correction review below.** Both prior findings are resolved. The checked
primary-source language/version and license claims from the original review
remain its dated evidence, not newly re-fetched evidence. This advisory
recommendation is not source approval,
content approval, mastery evidence, or permission to begin authoring.

## Correction re-review — provenance and gates only

- **Pinned revised dossier:** 289 lines; SHA-256
  `c0d2fe44b61a6fdbabe4e84ac3fff6915c80e7ae59f8ecc1e84c9326124ac3cb`.
  Verified against the coordinator-supplied hash on 2026-10-10.
- **F1 resolved; high confidence:** revised lines 176–186 distinguish
  original wording from provenance, require model-assisted drafts to use
  `llm_drafted` and `pending_review`, explicitly prohibit relabeling reviewed
  model-assisted records as `original`, reserve `original` for hand-authored
  records, and retain separate rights authorization and `licensed` tagging
  for source reuse. Handoff lines 280–282 agree.
- **Repository consistency:** `docs/content-authoring-pipeline.md:30–40`
  assigns model drafts `llm_drafted`/`pending_review` and permits a human
  content owner to change **review status**, not provenance, after review.
  `docs/content-review.md:52–55` preserves the model-assisted provenance
  distinction. Neither this re-review nor eventual human review promotes
  an LLM-assisted record to hand-authored `original`.
- **Handoff clarification resolved; high confidence:** revised lines
  267–274 explicitly say source approval alone does not authorize authoring,
  retain the applicable authoring-playbook gates, require the Python
  validator/renderer contract before authoring against it (including
  non-executing items), and preserve execution/runtime/release gates.
  This agrees with the authoring playbook and
  `docs/development-expansion-plan.md:143–144`; no gate satisfaction is
  inferred or approved here.
- **Remaining correction findings:** none in this changed scope.
  No redundant web research, new curriculum scope, dossier edits, or
  runtime/content validation was performed. Original source-access,
  age/accessibility, human-decision, and actual-model-provenance limitations
  remain recorded below.
- Only this report was updated. Revised-dossier hash and report formatting
  and whitespace were checked again using the commands in the validation
  section.

## Original review record

The original verdict was `changes-required`. Its original revision,
line citations, findings, and source checks are retained below as history;
they do not describe unresolved defects in the revised dossier.

## Scope and independence

- Reviewed only `python-intro-grade-6-20261010-research.md` (277 lines),
  against worktree HEAD `4f678f54c6583e76b527fcfb29f94080b9c9afac`.
  Dossier SHA-256:
  `a8dbe05bec1bcaccce30ff0fbccf584edcb63afe1d6c1dd4bffd5b9779978ea1`.
- Coordinator-specified allocation: author `claude-opus-5.5` (Claude),
  reviewer `gpt-6.1-sol` (GPT), Copilot; different families were requested.
  Actual response-model client metadata was not exposed in this review
  context. The integrator must retain that metadata before marking the
  actual-model independence gate complete; allocation alone is not proof.
- Re-derived findings from the dossier, primary public pages, pinned public
  repository metadata, and repository procedures. No reliance on the
  author's self-evaluation.
- Read `AGENTS.md`, the research and authoring playbooks, the review skill,
  `docs/content-review.md`, the content-authoring pipeline, source register,
  relevant product/roadmap/expansion and decision sections, orchestration
  policy, README, and current progress/handoff sections.
  `docs/curriculum-review-playbook.md` does not exist in this worktree;
  the review skill and named durable procedures govern.
- Research-only packet: no finalized skills, lessons, assessments, runnable
  items, or runtime changes exist in scope. No content-item validation or
  mastery judgment is claimed. Only this report was written; the dossier,
  main progress log, and shared source register were not edited.

## Original required correction — resolved

### F1 — Incorrect provenance instruction for model-authored content

- **Severity:** major. **Confidence:** high.
- **Location:** `python-intro-grade-6-20261010-research.md:176–181`,
  especially line 179; handoff audience at lines 260–269.
- **Rule:** `docs/content-authoring-pipeline.md:30–33` explicitly distinguishes
  `llm_drafted` from hand-authored `original`; `docs/content-review.md:52–55`
  requires model-assisted drafts to retain `llm_drafted` provenance.
- **Evidence:** the dossier directs the curriculum-authoring agent to
  “Mark content `original`”. Original wording is required, but that does not
  make model-authored records hand-authored. Following this instruction
  would lose the required provenance distinction and its associated review
  checks. The contract permits all three origins and will not automatically
  detect this mislabeling (`src/contracts/content.ts:7`).
- **Smallest safe remediation:** replace the blanket tagging instruction
  with: “Require original wording. Model-assisted drafts use
  `provenance.origin: "llm_drafted"` and remain `pending_review` under the
  content-authoring pipeline; `original` is for hand-authored records.
  Explicitly authorized source reuse is `licensed`.”
  Preserve the no-copy/no-close-paraphrase rule and separate rights decision.

## Original non-blocking handoff clarification — resolved

**Minor; high confidence; lines 262–272:** explicitly reference
`docs/curriculum-authoring-playbook.md` and its current authoring gates,
and `docs/development-expansion-plan.md:143–144` (a Python validator/renderer
contract must be specified and tested before authoring against it).
Source approval is a prerequisite, not sufficient authorization for the
“Then” instructions. The dossier already denies authoring authorization at
lines 3–9; this is a clarification, not evidence that authoring occurred or
that the current gate state can be inferred from an old pause paragraph.
Smallest fix: one sentence preserving all applicable authoring and
contract-readiness gates, including for non-executing items.

## Independently verified primary-source evidence

Checks were made on 2026-10-10 America/Los_Angeles (2026-10-11 UTC).
Direct HTTP checks used Python's standard-library HTTP client; substantive
pages were also read using web fetch. HTTP success, PDF headers, page
metadata, and actual terms/content are distinguished below.

| Dossier lines           | Verification URL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Tested claim and observed evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 52, 81–83               | [Python Tutorial](https://docs.python.org/3/tutorial/index.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | HTTP 200; raw HTML identifies **3.15.0**, footer **Oct 10, 2026 (21:37 UTC)**. Introduction explicitly targets programmers new to Python, **not** programming beginners. Do not replace these current observations with remembered 3.14-era information.                                                                                                                                                                                                                                                                                                           |
| 53, 81–83, 235–236      | [Status of Python versions](https://devguide.python.org/versions/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Substantive supported/unsupported tables: **3.15 bugfix, first release 2026-10-09; 3.14 bugfix; 3.13/3.12/3.11 security; 3.10 end-of-life 2026-10-01; main future 3.16**. Choosing a supported minor version remains a human decision.                                                                                                                                                                                                                                                                                                                             |
| 54, 159–167             | [Sunsetting Python 2](https://www.python.org/doc/sunset-python-2/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Substantive official text confirms **January 1, 2020** end of support and **2.7.18 in April 2020**, explicitly not an extension of support. One direct-client decoding attempt encountered compressed bytes; web fetch supplied the readable primary text.                                                                                                                                                                                                                                                                                                         |
| 55–56, 199–201          | [History and License](https://docs.python.org/3/license.html), [Copyright](https://docs.python.org/3/copyright.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Both HTTP 200. Terms state software/documentation **PSF License Version 2**; documentation examples, recipes, and other code **dual PSF/Zero-Clause BSD starting 3.8.6**. Copyright page identifies the historical holders. This does not grant blanket rights in every third-party incorporated component.                                                                                                                                                                                                                                                        |
| 57–58, 127–128, 239–240 | [RLE index](https://openbookproject.net/thinkcs/python/english3e/), [RLE preface](https://openbookproject.net/thinkcs/python/english3e/preface3-rle.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | HTTP 200; actual index title **How to Think Like a Computer Scientist: Learning with Python 3 (RLE)**, four named authors, **October 2012** version date. Preface title says **August 2012**; PyScripter/Windows and Turtle appear in historical setup text. Chapter metadata supports the stated early turtles/functions and later OOP topics. No current minor-version or Grade 6 suitability claim follows.                                                                                                                                                     |
| 59, 182–188             | [RLE copyright notice](https://openbookproject.net/thinkcs/python/english3e/copyright.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Substantive notice: **GFDL 1.3 or later; invariant Foreword, Preface, Contributor List; no front/back cover texts**. Link-only/no-reuse posture is appropriately conservative; legal reuse approval is separate.                                                                                                                                                                                                                                                                                                                                                   |
| 60–63, 189–192, 241–245 | [Runestone deployed book](https://runestone.academy/ns/books/published/thinkcspy/index.html), [pinned copyright](https://raw.githubusercontent.com/RunestoneInteractive/thinkcspy/b783f54815690131ccac410bc85b67bc4e916963/pretext/FrontBackMatter/copyright.ptx), [pinned license](https://raw.githubusercontent.com/RunestoneInteractive/thinkcspy/b783f54815690131ccac410bc85b67bc4e916963/LICENSE.txt), [pinned README](https://raw.githubusercontent.com/RunestoneInteractive/thinkcspy/b783f54815690131ccac410bc85b67bc4e916963/README.rst), [pinned book structure](https://raw.githubusercontent.com/RunestoneInteractive/thinkcspy/b783f54815690131ccac410bc85b67bc4e916963/pretext/thinkcspy.ptx) | Deployed book **403 challenge**, not readable book evidence. Pinned files **200**: separate holders and notice, **GFDL 1.3+**, literal invariant wording **“Forward, Prefaces, and Contributor List”**, no cover texts. README says **Interactive Edition**, deprecated reStructuredText; book subtitle says **The PreTeXt Interactive Edition**. Include order supports debugging/turtle/modules before functions. Nothing proves the deployed edition shares this revision or license.                                                                           |
| 61                      | [Runestone commit API](https://api.github.com/repos/RunestoneInteractive/thinkcspy/commits/b783f54815690131ccac410bc85b67bc4e916963)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | HTTP 200, author/committer timestamp **2026-06-23T12:55:46Z** supports the pinned revision's date. License detection is not a substitute for the copyright notice.                                                                                                                                                                                                                                                                                                                                                                                                 |
| 64–65, 193–198          | [Think Python third-edition author page](https://greenteapress.com/wp/think-python-3rd-edition/), [online book](https://allendowney.github.io/ThinkPython/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Readable pages confirm author **Allen B. Downey**, beginner audience, third-edition Colab/Jupyter and AI-tool guidance, **CC BY-NC-SA 4.0 International**, public solution-notebook link and quizzes on request. Nineteen chapter titles and differing recursion order were checked as metadata. Non-commercial availability is **not commercial-use permission**; no provider/account use or proprietary copying is authorized. No print publication year was established by these checks.                                                                        |
| 66                      | [Think Python commit API](https://api.github.com/repos/AllenDowney/ThinkPython/commits/1a36fc67f0e4093996d9e386cee0b79e259f95b5), [pinned root listing](https://api.github.com/repos/AllenDowney/ThinkPython/contents?ref=1a36fc67f0e4093996d9e386cee0b79e259f95b5)                                                                                                                                                                                                                                                                                                                                                                                                                                         | HTTP 200; commit timestamp **2026-09-29T14:17:43Z** and no root LICENSE entry. This checks the root only, not every notebook or the absence of all possible licenses. The dossier correctly limits its claim to the check performed.                                                                                                                                                                                                                                                                                                                               |
| 67, 84–87, 97–109       | [CSTA standards landing page](https://csteachers.org/pk12standards/), [CSTA view page](https://csteachers.org/pk12standards/view/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Substantive official landing text confirms **2026**, **five concepts** exactly as recorded, twelve practices in four named categories, distributed AI content, DOI **10.1145/3820482**, ISBN **979-8-4007-2780-1**, attribution/non-commercial/share-alike terms. Direct view-page fetch returned **403**; web fetch raw HTML exposed actual JSON-LD **datePublished 2026-07-11T12:40:29+00:00**, **dateModified 2026-07-13T13:50:37+00:00**. These are page metadata, not independently established standards issuance dates. The dossier makes that distinction. |
| 68                      | [CSTA PDF](https://csteachers.org/wp-content/uploads/2026/07/2026-CSTA-PK%E2%80%9312-Computer-Science-Standards.pdf), [DOI](https://doi.org/10.1145/3820482)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | PDF **200**, application/pdf and `%PDF-1.6` signature; Last-Modified **2026-07-20**, not proof of publication/adoption. DOI redirects to ACM **403**. This review did not extract standards text or verify grades 6–8 codes/statements; neither does the dossier claim those are verified.                                                                                                                                                                                                                                                                         |
| 69, 88–90, 238–239      | [CDE standards location](https://www.cde.ca.gov/be/st/ss/computerscicontentstds.asp), [CDE PDF](https://www.cde.ca.gov/be/st/ss/documents/csstandards.pdf)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Location redirects to a **200 Radware CAPTCHA**, not substantive standards evidence. PDF **200**, application/pdf, `%PDF-1.7`, Last-Modified **2026-01-09**. No PDF content/adoption/grade mapping was read or inferred. These are honestly labeled gaps, not a reason to require unrequested full local alignment.                                                                                                                                                                                                                                                |

## Scope, pedagogy, safety, and residual risks

- Core fundamentals match the research task; optional depth and contests
  are explicitly unapproved/out of scope (lines 26–33, 111–115, 155–157).
  Competency tables and `P0`–`P10` are proposals, not finalized curriculum.
  No new normative syllabus, source approval, execution limits, or learner
  release follows from them.
- Grade 6 reading level and cognitive suitability are explicitly
  unsupported (lines 145–153, 255–256). Accessibility of external sources
  is unassessed (lines 225–228). These require later pedagogy/accessibility
  review, not fabricated age evidence or a claim of current WCAG compliance.
- Simulated input, synthetic data, deterministic evidence, no LLM-only
  mastery, no arbitrary application-server execution, adult/read-only
  reference links, and separately reviewed execution contracts are
  appropriately retained (lines 205–232, 249–251).
- The ten author-proposed decisions are advisory options. Version choice,
  alignment, depth, source reuse, learner links, and execution remain human
  decisions; no model opinion makes them approved.
- No copied instructional prose, exercises, diagrams, code samples, or
  solutions were identified in this research packet. Title, chapter-order,
  and short license-notice metadata are not authored learning content.
  There is no permission here to reproduce proprietary materials.
- No paid calls, model-provider invocation, database/real learner data,
  bank access, account creation, runtime execution, or agents were used.

## Validation and disposition

Documentation-only review: primary URL and metadata checks above completed;
no code, content records, or persistence changed. Unit/integration/E2E/eval
suites are not applicable and were not run.

- `npx --no-install prettier --check --ignore-path /dev/null docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`:
  initially unavailable because this isolated worktree has no installed
  Prettier. Restored only the existing formatter tool via npm exec, without
  changing repository manifests.
- `npm exec --yes --package=prettier@3.6.2 -- prettier --write --ignore-path /dev/null docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`:
  passed; report formatted.
- `npm exec --yes --package=prettier@3.6.2 -- prettier --check --ignore-path /dev/null docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`:
  passed.
- `git diff --check -- docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`:
  passed. Because the report is untracked, also checked
  `git diff --no-index --check /dev/null docs/curriculum-dossiers/python-intro-grade-6-20261010-review.md`:
  no whitespace errors (exit 1 represents the added-file difference).
- `shasum -a 256 docs/curriculum-dossiers/python-intro-grade-6-20261010-research.md`:
  matched the original reviewed hash during the first review; on correction
  re-review matched the revised hash recorded above. Reviewer did not change
  the dossier.

Next issue: the integrator retains actual-model provenance and routes the
revised packet for human source decisions. Shared-register integration,
content approval, authoring readiness, runtime safety, and release remain
separate gates; this changed-scope recommendation does not clear them.

**Recommendation: ready for human review with noted risks.**
