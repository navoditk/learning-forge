## Introduction to Programming in Python, Grade 6 beginners — research dossier — 2026-10-10

**Status: Approved by product/content owner on 2026-10-10 (sources only).**
Owner decision: "sources for python look good, approved."
Independent GPT-6.1 Sol review of the corrected Opus research passed before
this source approval. The sources are integrated into `docs/curriculum-sources.md`.
This is research only. It does not approve
authoring, create skill records or learning content, or authorize code
execution, a sandbox, provider calls, persistence, or learner availability.
Core scope, optional depth, version and implementation decisions remain
separate; this source approval does not settle them.

Program code: `python-intro-grade-6`. Task id: `20261010-research`.
Retrieval window: 2026-10-10 local time (America/Los_Angeles), which is
2026-10-11 UTC. HTTP statuses are literal `curl -L` final status codes
observed in this packet unless stated otherwise. HTTP 200 alone does not
mean substantive content was read. Each row says what was actually read.

### Scope and learner context

- **Learner:** the existing Grade 6 Learning Forge audience. Assume no prior
  text-based programming. The product's current Grade 6 learner context is
  Irvine, California, from the approved Math dossier. This dossier makes no
  claim that California or any district requires Python, or any computer
  science course, in Grade 6. No such requirement was located or verified.
- **Subject:** introductory, text-based Python 3 programming fundamentals.
- **User scope (normative):** a **core** beginner fundamentals track. The
  user nominated _How to Think Like a Computer Scientist_ "or similar" as a
  preferred reference on 2026-10-10.
- **Depth tier:** **not approved.** The optional depth below is a proposal
  for human decision, not part of the normative scope.
- **Contest tier:** none requested. Programming contests, including any
  olympiad or competitive-programming track, are not researched here and are
  explicitly out of scope. They would need their own dossier.
- **Local pacing:** none requested. No district or school pacing is claimed.
- **Cross-check with product commitments:** `docs/01-product-proposal.md`
  and `docs/07-roadmap.md` name introductory Python as a Grade 6 beginner
  research track that needs separate curriculum and code-execution review.
  `docs/development-expansion-plan.md` (PY-RESEARCH) proposes sequencing,
  variables/types, expressions, conditionals, loops, functions,
  tracing/debugging and small original projects. It forbids arbitrary Python
  execution on the application server. No other programming or computer
  science program is committed in the product docs reviewed. AP Computer
  Science Principles, high-school CS pathways, block-based programming and
  programming contests were not researched and are out of scope.
- **Prior entry:** the preliminary "Introductory Python prerequisite sources
  — 2026-10-10" section in `docs/curriculum-sources.md`. This dossier
  re-checks those sources and supersedes them only after integration and
  review. It does not edit that register.

### Source register

| Authority and role                                                      | Source and retrieval                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Supported claim                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary; normative language reference for current Python 3 behavior** | [The Python Tutorial — Python 3.15.0 documentation](https://docs.python.org/3/tutorial/index.html), Python Software Foundation. Page footer: "Last updated on Oct 10, 2026 (21:37 UTC)". Retrieved 2026-10-10; HTTP 200; introduction and chapter list read.                                                                                                                                                                                                                                   | The `/3/` tutorial currently serves Python 3.15.0 documentation. Its introduction says it is designed for programmers new to Python, **not** beginners new to programming. It is an accuracy reference for language behavior, not a Grade 6 pedagogy or sequencing source.                                                                                                                                                                                                                                                                                                                                           |
| **Primary; Python version support status**                              | [Status of Python versions](https://devguide.python.org/versions/), Python Developer's Guide, Python core team. Retrieved 2026-10-10; HTTP 200; supported-versions table read.                                                                                                                                                                                                                                                                                                                 | 3.15 (first release 2026-10-09) and 3.14 are `bugfix`. 3.13, 3.12 and 3.11 are `security`. 3.10 reached end of life on 2026-10-01. `main` is the future 3.16. This supports pinning a supported 3.x minor version. It does not choose one.                                                                                                                                                                                                                                                                                                                                                                           |
| **Primary; Python 2 obsolescence**                                      | [Sunsetting Python 2](https://www.python.org/doc/sunset-python-2/), Python Software Foundation. Retrieved 2026-10-10; HTTP 200; page read.                                                                                                                                                                                                                                                                                                                                                     | Python 2 was sunset on January 1, 2020, and is no longer supported. Version 2.7.18 (April 2020) was the final bundled release. Python 2 material must not be taught as current.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Primary; documentation license**                                      | [History and License — Python 3.15.0 documentation](https://docs.python.org/3/license.html), Python Software Foundation. Retrieved 2026-10-10; HTTP 200; terms paragraph read.                                                                                                                                                                                                                                                                                                                 | Python software and documentation are under the PSF License Version 2. Starting with Python 3.8.6, examples, recipes and other code in the documentation are dual-licensed under the PSF License Version 2 and Zero-Clause BSD. Learning Forge still prefers original examples.                                                                                                                                                                                                                                                                                                                                      |
| **Primary; documentation copyright**                                    | [Copyright — Python 3.15.0 documentation](https://docs.python.org/3/copyright.html), Python Software Foundation. Retrieved 2026-10-10; HTTP 200; notice read.                                                                                                                                                                                                                                                                                                                                  | Copyright notices for PSF, BeOpen.com, CNRI and Stichting Mathematisch Centrum, with a pointer to History and License.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Primary; user-nominated optional sequence inspiration**               | [How to Think Like a Computer Scientist: Learning with Python 3 (RLE)](https://openbookproject.net/thinkcs/python/english3e/), Open Book Project. Authors: Peter Wentworth, Jeffrey Elkner, Allen B. Downey and Chris Meyers, based on the 2nd edition by Elkner, Downey and Meyers. Index states "Version date: October 2012". Retrieved 2026-10-10; HTTP 200; index metadata and chapter titles read.                                                                                        | Python 3 member of the nominated book family. Chapter titles only (metadata) are used to compare sequencing: program basics, variables/expressions/statements, turtles, functions, conditionals, fruitful functions, iteration, strings, tuples, events, lists, modules, files and list algorithms. Chapters 15–27 cover classes/objects, PyGame, recursion, exceptions, dictionaries, more OOP, inheritance and data structures. No minor Python 3 version was found on the pages checked.                                                                                                                          |
| **Primary; edition caveat**                                             | [Preface-3 (RLE)](https://openbookproject.net/thinkcs/python/english3e/preface3-rle.html), same project. Retrieved 2026-10-10; HTTP 200; headings and setup statements read.                                                                                                                                                                                                                                                                                                                   | Page title says "Version of August, 2012", which conflicts with the index's October 2012. The preface describes Python 3, PyScripter as the Windows IDE and the Turtle module for graphics. These are 2012 classroom setup choices, not current Learning Forge requirements.                                                                                                                                                                                                                                                                                                                                         |
| **Primary; license**                                                    | [Copyright Notice (RLE)](https://openbookproject.net/thinkcs/python/english3e/copyright.html), same authors. Retrieved 2026-10-10; HTTP 200; notice read.                                                                                                                                                                                                                                                                                                                                      | GNU Free Documentation License 1.3 or any later version. Invariant Sections are the Foreword, Preface and Contributor List. There are no Front-Cover or Back-Cover Texts. See licensing implications below.                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Primary; interactive adaptation (published site)**                    | [How to Think Like a Computer Scientist — Runestone published book](https://runestone.academy/ns/books/published/thinkcspy/index.html), Runestone Academy. Retrieved 2026-10-10: HTTP 403 with default and browser user agents. The [Runestone Academy home page](https://runestone.academy/) also returned HTTP 403. No published-edition metadata was read.                                                                                                                                  | Not verified as served: edition, date, license page, account requirements, privacy terms, accessibility and in-browser execution. An earlier session's web extraction showed only donation notices. That result is not reconfirmed here. Do not treat the published site as inheriting Open Book Project terms.                                                                                                                                                                                                                                                                                                      |
| **Primary; adaptation source repository**                               | [RunestoneInteractive/thinkcspy](https://github.com/RunestoneInteractive/thinkcspy), GitHub. Read through the GitHub API on 2026-10-10. Root page HTTP 200. Default branch `master`, pinned commit `b783f54815690131ccac410bc85b67bc4e916963` (2026-06-23). GitHub license detection returns `NOASSERTION`.                                                                                                                                                                                    | README title: "How to Think Like a Computer Scientist: Interactive Edition". It credits the original Elkner, Wentworth, Downey, Meyers and Mitchell text, extended since 2011 by Brad Miller, David Ranum, Barbara Ericson, Mark Guzdial and others. It describes reading, video, code execution and "codelens" stepping, and calls its reStructuredText version deprecated in favor of PreTeXt. `pretext/thinkcspy.ptx` gives the subtitle "The PreTeXt Interactive Edition". Its include order is used as metadata only. The repository's link to the published site was not confirmed to serve the same revision. |
| **Primary; adaptation license (repository copy)**                       | [`pretext/FrontBackMatter/copyright.ptx` at the pinned commit](https://github.com/RunestoneInteractive/thinkcspy/blob/b783f54815690131ccac410bc85b67bc4e916963/pretext/FrontBackMatter/copyright.ptx) and [`LICENSE.txt` at the pinned commit](https://github.com/RunestoneInteractive/thinkcspy/blob/b783f54815690131ccac410bc85b67bc4e916963/LICENSE.txt). Read through the GitHub API on 2026-10-10. Web URL checks: HTTP 503 on first try, then HTTP 200 on a retry about 5 seconds later. | Copyright holders: Brad Miller, David Ranum, Jeffrey Elkner, Peter Wentworth, Allen B. Downey, Chris Meyers and Dario Mitchell. License: GFDL 1.3 or later. Invariant Sections are listed as "Forward, Prefaces, and Contributor List", with no cover texts. `LICENSE.txt` contains the GFDL 1.3 text. This is a **separate** notice with different holders and invariant-section wording from the Open Book Project edition. It describes the repository, not the 403-blocked deployed site.                                                                                                                        |
| **Primary; similar open beginner book, current Python 3**               | [Think Python, 3rd edition — Green Tea Press](https://greenteapress.com/wp/think-python-3rd-edition/), Allen B. Downey. Retrieved 2026-10-10; HTTP 200; page read. Publication year and print publisher were not stated in the text read.                                                                                                                                                                                                                                                      | The page describes the book as an introduction to Python programming for beginners, using Jupyter notebooks that run on Colab. Every chapter includes guidance for AI tools such as ChatGPT. The license is stated as Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. The 2nd and 3rd editions use Python 3, and the 1st edition targets Python 2.                                                                                                                                                                                                                                          |
| **Primary; same book, online edition**                                  | [Think Python (online third edition)](https://allendowney.github.io/ThinkPython/), Allen B. Downey. Retrieved 2026-10-10; HTTP 200; page read.                                                                                                                                                                                                                                                                                                                                                 | Audience: "people who have never programmed before". Nineteen chapter titles, used as metadata, run from variables and functions through conditionals and recursion, return values, iteration and search, strings and regular expressions, lists, dictionaries, tuples, files and databases, classes and inheritance. The page says solutions notebooks are public, and that quizzes are available on request.                                                                                                                                                                                                       |
| **Primary; book code repository**                                       | [AllenDowney/ThinkPython, branch `v3`](https://github.com/AllenDowney/ThinkPython/tree/v3), GitHub. Read through the GitHub API on 2026-10-10. Branch commit `1a36fc67f0e4093996d9e386cee0b79e259f95b5` (2026-09-29).                                                                                                                                                                                                                                                                          | No root `LICENSE` file was found, and GitHub reports no detected license. A separate license for notebooks or code was not located through this check. Treat the CC BY-NC-SA statement on the landing page as the only located license statement.                                                                                                                                                                                                                                                                                                                                                                    |
| **Primary; optional national CS framework (not mandatory)**             | [2026 CSTA PK–12 Computer Science Standards](https://csteachers.org/pk12standards/), Computer Science Teachers Association. `/k12standards/` redirects to `/pk12standards/`. Retrieved 2026-10-10; HTTP 200; page read. Suggested citation: Computer Science Teachers Association (2026). DOI 10.1145/3820482. ISBN 979-8-4007-2780-1. [View page](https://csteachers.org/pk12standards/view/) metadata: datePublished 2026-07-11 and dateModified 2026-07-13.                                 | Five concepts: Algorithms & Design, Programming, Data & Analysis, Systems & Security, and Computing & Society. Twelve practices are grouped into four categories, including Computational Thinking. AI content is distributed across concepts. The page states CC BY-NC-SA license terms: attribution, non-commercial use and share-alike. This is voluntary professional guidance, not a California mandate.                                                                                                                                                                                                        |
| **Primary; CSTA full PDF (not extracted)**                              | [2026 CSTA PK–12 Computer Science Standards (PDF)](https://csteachers.org/wp-content/uploads/2026/07/2026-CSTA-PK%E2%80%9312-Computer-Science-Standards.pdf), reached by redirect from `/2026-csta-pk-12-computer-science-standards/`. Retrieved 2026-10-10; HTTP 200. Text was not extracted because no PDF text tool was available. [DOI resolver](https://doi.org/10.1145/3820482) redirected to dl.acm.org with HTTP 403.                                                                  | Grade bands, identifier format, standard statements and boundary statements for grades 6–8 are **unverified**. No CSTA codes are assigned in this dossier. A secondary AI web-search summary offered speculative identifier formats. It was rejected and is not cited as evidence.                                                                                                                                                                                                                                                                                                                                   |
| **Primary; California CS standards (location only)**                    | [Computer Science Standards — California Department of Education](https://www.cde.ca.gov/be/st/ss/computerscicontentstds.asp). Checked 2026-10-10: HTTP 200, but the body was a bot-challenge page. [Standards PDF](https://www.cde.ca.gov/be/st/ss/documents/csstandards.pdf): HTTP 200, `Content-Type: application/pdf`, `Last-Modified: Fri, 09 Jan 2026`, text not extracted.                                                                                                              | The official California location was found, but title, adoption date, grade bands and content were **not read**. No California CS alignment, and no claim that a Python course is mandated in Grade 6, is made.                                                                                                                                                                                                                                                                                                                                                                                                      |

Python documentation pages for downloads and setup returned HTTP 200 but were
not read or used. Installation and setup are a tangent, outside the beginner
learning path.

### Standards framework and version

- **Mandatory standard:** none located. No source checked establishes a
  mandatory Grade 6 Python course for this learner. This is a "not located
  via the checks above" result, not a non-existence claim.
- **Normative language authority:** the official Python 3 documentation.
  Authoring must pin one supported 3.x minor version, chosen by a human
  (see decisions). At retrieval time, 3.15 and 3.14 were bugfix releases.
- **Optional alignment framework:** 2026 CSTA PK–12 Standards, at the
  concept and practice level only, until the PDF text for grades 6–8 is
  extracted and verified. The 2017 CSTA standards were not consulted and
  are not cited.
- **California CS standards:** located but unread. A future pass should
  verify the title, adoption date and grade-band content before any
  California alignment claim.

### Standards-domain coverage summary (proposed, concept level)

| Proposed core area                                                                       | CSTA 2026 concept or practice (names verified, codes not)  | Primary language reference               |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| What a program is; running vs reading code; reading error messages                       | Programming; Computational Thinking practices              | Python tutorial (language behavior only) |
| Values and types (`int`, `float`, `str`, `bool`); `print` output                         | Programming; Data & Analysis (introductory)                | Python 3 docs                            |
| Variables, assignment, state tracing                                                     | Programming; Algorithms & Design                           | Python 3 docs                            |
| Expressions and operators, including `/` vs `//` and `%`; precedence                     | Programming                                                | Python 3 docs                            |
| Text input and type conversion, with only simulated or fixed inputs                      | Programming                                                | Python 3 docs                            |
| Comparisons, Boolean logic, `if`/`elif`/`else`                                           | Algorithms & Design; Programming                           | Python 3 docs                            |
| Iteration: `for` with `range`, `while`, accumulators, off-by-one tracing                 | Algorithms & Design; Programming                           | Python 3 docs                            |
| Functions: `def`, parameters, `return` vs `print`, basic scope                           | Programming (decomposition)                                | Python 3 docs                            |
| Lists and strings as sequences: index, `len`, iterate, append                            | Programming; Data & Analysis                               | Python 3 docs                            |
| Testing and debugging: syntax, runtime and logic errors; simple `assert` checks; tracing | Computational Thinking practices                           | Python 3 docs                            |
| Small original integrative projects                                                      | Human-Centered Design and Computational Thinking practices | —                                        |
| Responsible computing: privacy, never entering personal data in programs                 | Computing & Society; Ethics & Social Responsibility        | —                                        |

Not covered by core: classes and OOP, inheritance, files, exception
handling beyond reading tracebacks, modules beyond a reviewed allowlist,
recursion, regular expressions, databases, event and GUI programming,
PyGame, web apps, networking, data structures such as linked lists, stacks,
queues and trees, and AI-tool-assisted coding.

### Sequencing sources and authority

All sequencing sources here are **optional inspiration**. Chapter order is
used as metadata only. No text, exercises, figures, code or quizzes are
reproduced or closely paraphrased.

- The three book sources broadly agree on an order: program basics, then
  variables and expressions, functions, conditionals, iteration, strings
  and lists, with dictionaries, files, OOP and recursion later.
- The 2012 RLE edition introduces turtle graphics early, in Chapter 3.
  Think Python 3e pairs conditionals with recursion and puts regular
  expressions with strings. The Runestone repository order puts debugging
  and turtle/modules before functions. These are differing pedagogical
  choices, not standards.
- The official tutorial assumes prior programming, so it does not
  determine beginner order.

**Proposed core prerequisite graph (non-normative, for authoring review; not
skill JSON):**

1. `P0` orientation and reading code → `P1` values/types and output
2. `P1` → `P2` variables and state tracing → `P3` expressions/operators
3. `P3` → `P4` simulated input and type conversion
4. `P3` → `P5` comparisons, Booleans and conditionals
5. `P5` → `P6` iteration (`for`/`range`, then `while`)
6. `P2` and `P6` → `P7` functions (parameters, `return`)
7. `P6` and `P7` → `P8` lists and strings as sequences
8. `P9` testing and debugging is introduced from `P1` onward, with a
   consolidating checkpoint after `P7`
9. `P5` through `P9` → `P10` small original integrative projects

Learner prerequisites (researcher assessment, not source-supported):
Grade 6 arithmetic with whole numbers, decimals and negatives; order of
operations; basic keyboard use; and reading short technical instructions.
Integer division and remainder (`//`, `%`) and floating-point display need
explicit, age-appropriate treatment. Reading load and cognitive suitability
for Grade 6 were **not** established by any source checked. The adult and
undergraduate framing of the books means age suitability must be judged in
authoring review, not inherited.

**Optional depth proposal (not normative, not approved):** dictionaries,
nested loops, simple search and count algorithms over lists, string
methods, a reviewed `random` module allowlist, and turtle-style drawing
only if a safe renderer contract exists. Each needs separate human approval.

### Python 2 vs current Python 3 bridging

- Teach only current Python 3, pinned to one supported minor version.
  Python 2 has been unsupported since 2020-01-01.
- Third-party and older material may use Python 2 idioms. These include
  `print` as a statement, `raw_input`, `/` as integer division between
  ints, and older string semantics. Think Python 1st edition targets
  Python 2 and must not be used. The 2012 RLE edition is Python 3, but no
  minor version was stated on the pages checked, so its examples are not
  automatically current.
- Verify every authored behavior against the pinned official documentation.
- Treat setup as a tangent outside the beginner block: interpreter
  installation, IDE choice (for example, the RLE preface's PyScripter on
  Windows, or its Ubuntu appendix), notebooks and Colab.

### Content tiers, originality and licensing implications

- **Originality and provenance:** all Learning Forge instruction,
  examples, exercises, projects, figures and assessments must use original
  wording. Do not copy or closely paraphrase any book's prose, exercises,
  figures, code, quizzes or solutions. Original wording does not change
  provenance. Under `docs/content-authoring-pipeline.md` and
  `docs/content-review.md`, model-assisted drafts use
  `provenance.origin: "llm_drafted"` and stay `pending_review`.
  Reviewing a model-assisted record never relabels it as `original`.
  `original` applies only to hand-authored records. Reuse of source
  material requires a separate, explicit rights decision and is marked
  `licensed`.
- **Open Book Project RLE (GFDL 1.3+, with invariant sections):** copying
  or modifying text would create GFDL obligations for the derived document.
  These include carrying the license and the Foreword, Preface and
  Contributor List invariant sections, which conflicts with modular lesson
  records. Default: reference link and chapter-order metadata only. Any
  reuse needs legal review.
- **Runestone repository (GFDL 1.3+, separate notice):** different
  copyright holders and invariant-section wording. Its terms are not
  inherited from the Open Book Project. The deployed site's license, terms
  of service and privacy terms were not read (HTTP 403).
- **Think Python 3e (CC BY-NC-SA 4.0 per author page):** non-commercial
  and share-alike terms. Learning Forge's commercial status is a human
  decision. Default: no reuse. Public solutions increase the risk of
  answer exposure if the book is linked from learner-facing pages. Its
  ChatGPT and Colab guidance is not suitable for unsupervised Grade 6 use.
- **Python documentation:** PSF License v2. Code examples are dual-licensed
  PSF/0BSD from 3.8.6. Use it as a behavior reference. Prefer original
  examples.
- **CSTA 2026 (CC BY-NC-SA):** cite identifiers and links. Quoting standard
  text inside a product may raise non-commercial and share-alike questions
  for a human or legal decision.

### Execution, sandbox and safety constraints (requirements, not decisions)

No code runner, sandbox, server or limits are designed or authorized here.
A separate future design must decide:

- **No arbitrary Python on the application server.** Isolation model,
  CPU/time/memory/output limits, process and recursion limits, network
  denial, filesystem access, allowed modules, dependency pinning,
  determinism, cost, abuse handling and audit. No numeric limits are
  proposed here.
- **Evidence:** code-tracing and predict-the-output items can be scored
  deterministically without execution. Practical coding evidence needs a
  deterministic, versioned test harness. Model or LLM judgment cannot
  establish correctness or mastery, consistent with `AGENTS.md`.
- **Input and data safety:** examples and projects must never ask for or
  use real child data, such as names, addresses, schools, photos or
  location. Use synthetic placeholders and fixed or simulated inputs.
- **Unsafe instruction:** core content does not teach `os`, `subprocess`,
  `eval`/`exec`, file deletion, networking, downloading or running
  untrusted code, or package installation.
- **Accessibility:** none of the sources' accessibility was assessed. Any
  code editor or tracer needs a WCAG 2.2 AA review, including keyboard
  use, screen readers, focus, error announcement and readable monospace
  output.
- **Reference UI:** read-only, descriptive outbound links on the adult or
  source view. No embedding, no Runestone, Colab or other account creation,
  and no child data in URLs. Cloud notebook or online platform use is not
  assumed. Linking to public solutions or AI-assistance chapters from
  learner views needs a human decision.

### Conflicts, gaps and decisions requiring human review

1. Approve core scope as stated. Decide whether any optional depth item is
   in scope.
2. Choose and pin the Python 3 minor version (for example, 3.14 or 3.15,
   both bugfix at retrieval) and the review cadence for version changes.
3. Decide alignment: CSTA 2026 concept-level only, or extract and verify
   grades 6–8 standards and identifiers first. Decide whether to verify
   California CS standards (CDE page bot-challenged; PDF unread).
4. Record the RLE edition-date conflict: index says October 2012, Preface-3
   title says August 2012.
5. Runestone published site returned HTTP 403. Its edition, license, terms,
   privacy terms and accessibility remain unverified. Decide whether to
   re-check from another network or by human browser.
6. Decide licensing posture: confirm a link-only, no-reuse default for the
   GFDL and CC BY-NC-SA sources, and decide whether any reuse warrants
   legal review.
7. Decide whether learner-facing links to books with public solutions or
   AI-tool guidance are allowed, or whether they are adult view only.
8. Decide the code-execution environment and practical-evidence policy
   separately, before any runnable exercise is authored.
9. Age, reading-level and cognitive suitability have no source support.
   Require pedagogy and accessibility review of authored material.
10. Out of scope and unresearched: programming contests, block-based
    programming, AP CSP and high-school pathways.

### Research handoff for the curriculum-authoring agent

Human source approval was recorded on 2026-10-10, but approval alone does
not authorize authoring. Every gate still applies:
the current authoring gates in `docs/curriculum-authoring-playbook.md`;
the requirement in `docs/development-expansion-plan.md` that a Python
validator/renderer contract be specified and tested before content is
authored against it, including non-executing items; and all
code-execution, runtime and release gates. After a human approves this
section and those gates are met, apply the decisions above, then:

- Author against the pinned Python 3 minor version. Verify every behavior in
  the official documentation for that version.
- Use the proposed `P0`–`P10` graph as a starting point. Decide final skill
  boundaries in authoring. Do not treat book chapter order as normative.
- Write content with original wording. Use books for topic-order comparison
  only. Model-assisted records keep `llm_drafted` provenance and
  `pending_review` status.
- Begin with non-executing evidence: tracing, predict-output, error spotting
  and ordering items. Practical coding items wait for an approved execution
  and test-harness contract.
- Do not assign CSTA or California codes until the respective standards text
  is verified.
- Keep examples free of personal data and unsafe operations. Respect
  assessment-gated progression and the "no LLM-only mastery" rules.
