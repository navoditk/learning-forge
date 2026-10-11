# Science Olympiad Division B — independent source review, 2026-10-10

## Scope, revision, and authority

This is an advisory **source-only** review of the section “Science Olympiad
Division B 2027 research — 2026-09-19” in `docs/curriculum-sources.md`,
lines **1271–1401** in the isolated checkout. It does not review the separate
authoring-prerequisites dossier, any authored skills/content, or runtime code.
Missing authored items are not findings against a research packet.

The product/content owner's **2026-10-10 research/sources-only approval** is
already recorded at lines 1273–1277. This review neither supplies human
approval nor expands that approval to an event subset, supervision policy,
season identity, authoring authorization, publication, or D-61 satisfaction.

Pinned section SHA-256:
`021a75c01aa14b994bb83a9394ef9ff928e1641e794de424357fe93a3201915b`.
The pin hashes the exact UTF-8 bytes beginning with the section heading and
ending immediately before `## Standards source`, including intervening
newlines: **13,392 bytes**, byte offsets **159165–172556 inclusive**.
Whole-register SHA-256 at pinning:
`c53220957d22bd881378d435664cb20c9de4ab5fb6309c6ec4a5e73ac0f3f3ed`.
The section pin, not unrelated register changes, defines this review's scope.

Assumption and method: retain the recorded 2026-09-19 retrieval as a historical
observation; independently inspect the cited public primary sources on
2026-10-10; distinguish transport success, readable substantive content,
historical artifacts, and inaccessible resource contents; report the smallest
source-record improvements without making owner decisions.

Procedures consulted: `README.md`, the relevant current and Science Olympiad
entries in `docs/PROGRESS.md`, `docs/curriculum-research-playbook.md`,
`docs/curriculum-authoring-playbook.md`, `docs/content-review.md`'s review
checklist, the source/originality policy in `docs/curriculum-sources.md`,
`docs/06-evaluation-safety-privacy.md`, `docs/agent-orchestration.md`, and
`docs/course-progression-decisions.md` D-61.

## Actual-model independence — unresolved gate

| Role                              | Tool/model evidence                                                                                                                                                                                                                          | Gate interpretation                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Original 2026-09-19 source author | Actual tool, model ID, and family **UNVERIFIED**. No verified original execution metadata was supplied with this packet.                                                                                                                     | Repository role/profile defaults do not establish the model that authored this older section.              |
| This source reviewer              | Copilot task; `gpt-6.1-sol`, GPT family. The coordinator supplied verified launch-selection/task-metadata attribution in the task packet, not a reviewer self-report. A launch UUID had not yet been supplied when this report was prepared. | Reviewer attribution is recorded; the original author's unknown family prevents a cross-family comparison. |
| Separate prerequisites author     | Not the author of the older source section; outside this review.                                                                                                                                                                             | Its Opus attribution must not be substituted for original-source execution evidence.                       |

**Procedural blocker, high confidence:** `docs/agent-orchestration.md`,
“Actual-model independence,” requires unknown executor IDs/families to remain
`UNVERIFIED`. This review must **not** be marked a completed cross-family
independent-review gate. Smallest safe resolution: recover the original source
author's actual execution metadata and associate it with the pinned revision,
then verify diversity against this review's launch metadata. If recovery is
impossible, the coordinator must arrange a newly attributed source execution
and its eligible review. This report does not authorize that additional work.

This gate blocker is separate from the substantive source-quality recommendation
below. A fresh context and source re-derivation help avoid reliance on the
author's conclusions, but do not prove actual-model diversity.

## Retrieval evidence and limitations

All dates below are **2026-10-10 review observations**, not replacements for
the register's 2026-09-19 retrieval record. “HTTP 200” below means the final
status observed using `curl -L -sS --max-time … -A 'Mozilla/5.0'`; the
substantive-access column records what was actually readable. No email form
was submitted, account created, purchase made, or paid packet opened.

Initial simplified `web_fetch` results frequently contained only a title or
navigation. Raw HTML pagination and independent curl body inspection recovered
the public content. A default Python urllib attempt returned **403** for the
seven initial season/eligibility URLs; that failed method is not a finding
against the sources. The store initially failed in `web_fetch` with a
transport-level error, then succeeded through curl. These distinctions matter:
a title, HTML shell, PDF bytes, or HTTP success alone is not a content review.

### National framework, scope, and participation

| Source URL                                                                             | Literal final retrieval                                                                  | Substantive access and independently supported claim                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <https://www.soinc.org/rules-2027>                                                     | HTTP 200                                                                                 | Rules-access landing body read. Announces availability beginning September 8, 2026, and Division B Grades 6–9. The free PDF is delivered through valid-email submission; **the manual itself was not obtained or read**.                                                                                         |
| <https://www.soinc.org/events/2027-division-b-events?cb=20260919>                      | HTTP 200                                                                                 | All 23 event names and all five category memberships read, matching the register.                                                                                                                                                                                                                                |
| <https://www.soinc.org/events/2027-division-b-events>                                  | HTTP 200                                                                                 | Canonical body independently read; it now matches the queried slate. The historical cache problem is not reproduced today.                                                                                                                                                                                       |
| <https://www.soinc.org/events/2027-event-table>                                        | HTTP 200                                                                                 | Division B portion read separately from Division C; confirms the same category memberships and 23-event slate.                                                                                                                                                                                                   |
| <https://www.soinc.org/learn/b-event-short-descriptions>                               | HTTP 200                                                                                 | All 23 public descriptions read for broad scope and study/lab/build/team distinctions. They are not a complete manual or event-rule validation.                                                                                                                                                                  |
| <https://www.soinc.org/sites/default/files/uploaded_files/Updated_SONT27_Schedule.pdf> | HTTP 200, PDF                                                                            | Existing macOS PDFKit extracted both pages in memory. Division B heading, Ohio State University in Columbus, May 14–15, 2027, event blocks, and impound/self-scheduling annotations are substantively readable. Scheduling is not prerequisite ordering.                                                         |
| <https://www.soinc.org/start-team/team-size-grade-levels>                              | HTTP 200                                                                                 | Division B Grades 6–9; maximum 15 members; maximum five ninth graders; school-membership, returning-student, and below-grade exceptions read. Do not imply the grade band exhausts every eligibility exception. The page also retains a membership-fee reference labeled 2025, which is not a verified 2027 fee. |
| <https://www.soinc.org/home_virtual_schools>                                           | HTTP 200; redirects to <https://www.soinc.org/team-qualification-and-home-school-policy> | National team-only rule and public/private/charter/virtual/home-school qualification pathways read. Public-school students compete through their attended school, subject to stated exceptions. Policy records 2011 review/ratification; it is not a newly issued 2027 policy.                                   |
| <https://www.soinc.org/bc-events>                                                      | HTTP 200                                                                                 | General 23-event, 15-student, approximately six-block structure read. Links labeled 2027 still target 2024 event-list paths; do not follow those as current-slate evidence. The register's direct 2027 sources avoid this problem.                                                                               |
| <https://www.soinc.org/info/about-science-olympiad>                                    | HTTP 200                                                                                 | School-based team preparation, event rotation, and Invitational/Regional/State/National structure read. General historical examples are not current event selections.                                                                                                                                            |

### Conduct, safety, standards, archives, and rights

| Source URL                                                                                    | Literal final retrieval                                                  | Substantive access and independently supported claim                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <https://www.soinc.org/ethics_rules>                                                          | HTTP 200; redirects to <https://www.soinc.org/code-ethics-general-rules> | Public general-rules body explicitly labeled **V. 2025**. Conduct, safety, external-assistance restrictions during competition, student-device responsibility, and applicability of public national policies read. Not relabeled 2027.                                                                                                                             |
| <https://www.soinc.org/scoring_guidelines>                                                    | HTTP 200; redirects to <https://www.soinc.org/scoring-guidelines>        | Event ranking and lower-is-better aggregate team score read. Raw-event score direction depends on the event; national guidance permits local revisions and local adjudication outside Nationals. No event scoring formulas are reproduced here.                                                                                                                    |
| <https://www.soinc.org/eye_protection>                                                        | HTTP 200; redirects to <https://www.soinc.org/eye-protection>            | July 29, 2015 update and explicit 2016-rules reference read. Eye protection is task/event-specific, coach adequacy responsibilities apply, and required adequate protection is non-negotiable. A generic mark alone is not a substitute for the event's protection category.                                                                                       |
| <https://www.soinc.org/building-and-tools-policy>                                             | HTTP 200                                                                 | Original adoption **1986**, amendment **July 20, 2008**, age-appropriate safety, student responsibility, and constrained adult mentoring read. Adult assistance has a restricted-task exception; it is not unlimited adult construction. No operational tool/chemical/build instructions were authored.                                                            |
| <https://www.soinc.org/sites/default/files/uploaded_files/2026.NGSS_.Alignment.DivB_.pdf>     | HTTP 200, PDF                                                            | PDFKit read the 12-page public artifact in memory. Repeated footer labels it 2026 and updated **10/7/2025**, but first heading says **2025 NATIONAL SCIENCE OLYMPIAD**. Preserve this internal labeling inconsistency; it is historical, not the 2027 syllabus.                                                                                                    |
| <https://www.soinc.org/learn/alignment-national-standards>                                    | HTTP 200                                                                 | Additional official index read; it now lists both 2027 and historical 2026 Division B alignment sources.                                                                                                                                                                                                                                                           |
| <https://www.soinc.org/sites/default/files/uploaded_files/2027_NGSS_Alignment_Division_B.pdf> | HTTP 200, PDF                                                            | Additional official 13-page public artifact read with PDFKit. Heading identifies 2027 Division B; footer states **Updated 9/15/2026**. It explicitly describes strongest direct connections rather than an exhaustive map, and distinguishes NGSS middle-school Grades 6–8 from Division B Grades 6–9. Publication/availability on 2026-09-19 was not established. |
| <https://www.soinc.org/learn/event-archive>                                                   | HTTP 200                                                                 | Archived B/C event directory read. It is an event-resource directory, not proof of an openly reusable bank of every past test and solution. Linked resource contents were not exhaustively audited.                                                                                                                                                                |
| <https://www.soinc.org/learn/event-history>                                                   | HTTP 200                                                                 | Filter controls read: year choices **1984–2027**, division and the five categories. Filter range is not proof that every year/event has complete test coverage; filtered historical contents were not exhaustively reviewed.                                                                                                                                       |
| <https://store.soinc.org/us/digital-test-packets/c/2723?resetallfilter=1>                     | HTTP 200 via curl; initial web-fetch transport failure                   | Public catalog substantively read: B/C packet labels **2020 and 2022–2027**, with paid digital purchase options. These are product labels, not tournament dates: the 2020 B listing describes the 2019 tournament, 2022 describes 2021, and 2027 describes 2026. **No actual packet, tests, solutions, or checklists were accessed.**                              |
| <https://www.soinc.org/play/past-tournament-results>                                          | HTTP 200                                                                 | National-results index read; grouped links include 1985–1989, 1990–1999, 2000–2010, and later yearly pages. Index currently extends through 2025. It is results metadata, not a test archive; not every linked result was audited.                                                                                                                                 |
| <https://www.soinc.org/copyrights_use>                                                        | HTTP 200; redirects to <https://www.soinc.org/copyrights-media-and-use>  | Copyright 2027 resource statements and free-rules/general terms read. Personal noncommercial viewing/use permissions exist, but do not authorize redistribution into this repository or a learner-facing service. Names/logos, commercial adaptation, systematic storage, and redistribution require separate rights consideration. No reuse license was obtained. |

### Local pathway only

| Source URL                                            | Literal final retrieval | Substantive access and independently supported claim                                                                                                                                                                                   |
| ----------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <https://socalscioly.org/>                            | HTTP 200                | Southern California organization and division-level explanatory content read. This regional operator is not the national rule publisher.                                                                                               |
| <https://socalscioly.org/?tab=tournaments&page=state> | HTTP 200                | September 8, 2026 welcome to the 2026–2027 season, national rules link, Regional-to-SoCal-State-to-Nationals pathway, and State location/date **TBD** read.                                                                            |
| <https://socalscioly.org/?tab=registration>           | HTTP 200                | Current local registration context read, including Orange County B/C Regional date **TBD**, location UC Irvine, and local Regional participation conditions. Commented-out historical HTML was excluded when confirming these details. |

These sources support the register's local-context boundary. They do not
establish school-team availability for this particular learner, current
enrollment eligibility, a guaranteed advancement pathway, or national
authority for any local rule modification.

## Coverage and source-fidelity conclusions

The public schedule's Division B page also independently confirms the exact
edition marker **©2027 - B74**, matching the register's abbreviated label.

1. **No missing or duplicated slate event found.** The register's category
   counts are **5 + 5 + 5 + 4 + 4 = 23**, and every name and category matches
   both current official Division B listings. Division C names were not
   imported into the comparison.
2. Public descriptions independently support broad scientific scope and the
   distinction between conceptual study and equipment/lab/build/team tasks.
   “Study/lab/build/hybrid/communication” is correctly labeled a Learning
   Forge synthesis, not an official five-category replacement.
3. The season is correctly **2027 / academic year 2026–2027**. National
   schedule dates confirm the intended season. General rules, eye protection,
   team qualification, and historical alignment dates are not automatically
   updated by the season label.
4. For this school-attending Grade 6 learner, school-team support is faithful
   to national participation policy. “No individual-competitor equivalent”
   is supported; “only conventional school teams exist” would not be, because
   the national policy includes qualifying home/virtual-school pathways.
5. Official event slate, public scope, and safety policies are useful research
   inputs. They do **not** validate the unread manual's detailed event
   constraints, exhaustive within-event competencies, scoring, permitted
   resources, dimensions, or tournament-readiness claims.
6. The historical 2026 alignment was properly distinguished from a 2027
   syllabus. Current evidence adds a 2027 alignment source, with its own
   limitations. Neither document supplies California Grade 6 pacing or
   comprehensive Grade 6 school-Science coverage.
7. The reviewed section contains original research summaries and event
   identifiers, not actual tests/solutions, copied rule dimensions/formulas,
   chemical procedures, material lists, or build/launch instructions.
   This finding is limited to the pinned section, not the entire repository.
8. No third-party coaching/wiki/prep source was needed to substantiate these
   findings. The originality, separate-program, text-accessibility, provenance,
   and review boundaries in the handoff are appropriate research constraints;
   their eventual implementation is not tested by this source review.

## Verified findings — source record

No substantive **blocker or major** defect was verified in the bounded
research packet. The following **minor** improvements should accompany a
dated current-source supplement rather than rewriting historical retrievals.

### F1 — Current alignment source should be added without erasing history

- **Severity/confidence:** minor; high for current accessibility and stated
  version, unverified for when it first became publicly available.
- **Location:** `docs/curriculum-sources.md:1306,1315–1318,1382–1385`.
- **Source/rule:** official
  <https://www.soinc.org/learn/alignment-national-standards> and
  <https://www.soinc.org/sites/default/files/uploaded_files/2027_NGSS_Alignment_Division_B.pdf>;
  research playbook inputs 1 and 4 require traceable framework versions and
  explicit caveats.
- **Evidence:** the currently readable index and 13-page document identify
  2027 Division B and an update date of 9/15/2026. The original statement was
  “newest located,” with a 2026-09-19 retrieval; this review does not prove
  that historical search wrong. The historical PDF also has conflicting
  first-heading and footer year labels.
- **Smallest safe fix:** append a 2026-10-10 retrieval addendum citing the
  current 2027 document, its non-exhaustive/direct-alignment limitation, and
  the historical PDF's internal label mismatch. Retain the original 2026
  citation and retrieval. Do not infer full 2027 rules coverage or Grade 6
  pacing from alignment.

### F2 — Building/tools policy amendment date is missing

- **Severity/confidence:** minor; high.
- **Location:** `docs/curriculum-sources.md:1305`.
- **Source/rule:** <https://www.soinc.org/building-and-tools-policy>;
  research playbook input 1's exact edition/date requirement and the section's
  own requirement to preserve policy dates.
- **Evidence:** the source records both original adoption in 1986 and
  amendment July 20, 2008; the register names only the original adoption.
  The broad safety/adult-limits claim remains supported.
- **Smallest safe fix:** add the amendment date beside the original adoption.
  Preserve the constrained adult-assistance exception in any future policy
  summary; do not interpret it as permission for adult-built competition
  devices or for unsupervised learner activities.

### F3 — Rules landing-page access should explicitly distinguish unread manual

- **Severity/confidence:** minor; high.
- **Location:** `docs/curriculum-sources.md:1298,1315–1318,1340–1343`.
- **Source/rule:** <https://www.soinc.org/rules-2027>;
  research playbook inputs 1, 4, and 5 require honest retrieval/access status.
- **Evidence:** HTTP 200 is substantive success for the public access
  announcement, not for the email-delivered manual. “Were not reproduced”
  does not explicitly say whether the author read the manual. This review
  deliberately did not obtain/read it. The handoff already forbids inferring
  gated rules, so this ambiguity is not an observed authoring breach.
- **Smallest safe fix:** say “public rules-access landing page read; manual
  contents not verified in this source review,” and retain the email gate.
  Establish the original author's access state only from actual evidence,
  not by assuming this review's state was theirs. Do not submit the form or
  procure a manual as part of this fix.

## Questions for the owner — not decisions made by this review

- Which, if any, bounded event subset should a future release support? The
  eight named candidates at lines 1366–1368 remain a proposal, not approval.
  No category completeness requirement forces an initial release to cover
  all 23 events.
- What supervision, equipment deferral, accessible alternatives, and
  communication/team-practice boundaries should apply? Public safety policies
  are minimum participation context, not a complete product safety policy.
- What season/version identity and annual/current-source refresh policy
  should be approved? `scioly-b-2027`, `sob27-`, and repository-owned codes are
  a proposed handoff, not verified official standard codes or a registry edit.
- Is purchasing or licensing any official resource ever necessary? Catalog
  access and personal-use permission are not redistribution/service rights.
  Commercial name/logo use or resource adaptation should receive qualified
  rights review before any such use; no license decision is made here.
- Should “No official sequence or local pacing source exists” at lines
  1358–1362 be narrowed to “none located in this research”? The cited pages
  do not establish universal nonexistence. A conceptual sequence may be a
  clearly labeled product synthesis, but not an official pacing claim.

## Residual risks and excluded work

- Original-author actual-model evidence remains unavailable; this is the
  explicit independent-review gate blocker above, not hidden by a favorable
  source-quality assessment.
- Historical retrieval bodies/snapshots were not supplied. Current source
  bodies cannot prove exactly what was publicly served on 2026-09-19.
  Current canonical-cache recovery and current alignment availability are
  updates, not proof of a historical error.
- The official manual and actual paid test packets remain unread. Public
  product labels must not become tournament-year claims: a packet labeled
  2027 contains prior-tournament material. Historical event/resource links
  and all result entries were not exhaustively reviewed.
- National supporting pages contain stale links and mixed years. Revalidate
  applicable current public policies and tournament notices before future
  participation-facing claims; keep each artifact's version visible.
- No competition-readiness, exhaustive manual coverage, school eligibility,
  full NGSS/California Grade 6 coverage, legal compliance, or safe practical
  activity certification is supplied.
- No event-rule dimensions/formulas, tests, solutions, or operational
  chemical/tool/build/launch content were placed in the report or repository.
  Public PDFs were decoded **in memory** for verification, not saved.
- No code, source register, prerequisite dossier, specification, progress log,
  database, provider, deployment, or commit was changed. No agents were
  launched. Only this report is owned by this review.

## Validation and handoff

This is documentation-only work. Repository unit/integration/browser/eval,
typecheck, build, and database checks were **not run**: no behavior or authored
catalog changed, and no shared database/provider access was authorized.
The coordinator's report of **43 passing updated source/resource tests in
the main checkout** is contextual evidence, not a test executed here.
An older copied-checkout test state is not reported as a current defect.

Report-only formatting command:

```text
/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null /Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/authoring-prereqs-olympiad/docs/curriculum-dossiers/science-olympiad-b-source-review-20261010.md
```

Validation results: the initial formatting check failed; report-only Prettier
formatting corrected it, and the exact check above then **passed**. Scoped
`git diff --check -- docs/curriculum-dossiers/science-olympiad-b-source-review-20261010.md`
passed; because the report is untracked, an additional Python byte/line check
explicitly verified no trailing whitespace and a final newline. The pinned
source-section hash remained unchanged. The final report hash is returned in
the completion handoff rather than embedded in its own hashed bytes.

No dependencies were installed. The coordinator, not this reviewer, owns any
shared `docs/PROGRESS.md` update, retrieval addendum, or gate disposition.

**Substantive recommendation: ready for human review with noted risks.**
This is advisory source-quality evidence only; it is not human approval,
authoring authorization, or completion of the **UNVERIFIED actual-model
independence gate**.
