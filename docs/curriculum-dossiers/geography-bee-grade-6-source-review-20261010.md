# IAC National Geography Bee Grade 6 — comprehensive source review

**Review date:** 2026-10-10, America/Los_Angeles.
**Artifact type:** advisory research-only review; not curriculum approval.
**Scope:** the 2026-09-19 Geography Bee source packet, including its
2026-10-10 research-only owner-approval annotation. No new curriculum research,
skill graph, authored questions, runtime behavior, or Python implementation
is reviewed here.

## Reviewed revision and identity gate

- Reviewed file: `docs/curriculum-sources.md`, lines **1144–1270**, from
  `## IAC National Geography Bee Grade 6 research — 2026-09-19` through the
  blank line immediately preceding the Science Olympiad heading.
- Pin: SHA-256 of that section's exact UTF-8 bytes, including trailing
  newlines:
  `839986638dc5868aeee622334034e0707793a54f30d43c603fd4188247e7a457`.
  This is deliberately not a hash of mutable main or of the whole register.
- The isolated worktree already contained other writers' changes. This
  reviewer owns only this report and did not edit the reviewed section,
  another dossier, the shared register, `PROGRESS.md`, application code, or
  approval status.
- Source executor tool, actual model, family, and session/task identity:
  **UNVERIFIED**. `git log -G` identifies introduction commit
  `96a9b240408f0949b2c71724798707415b88fdeb`, dated 2026-09-19, titled
  `docs: add enrichment research dossiers`. Its Copilot co-author trailer
  does not identify an actual executing model or conclusively establish the
  source-author role. Git author/committer attribution is not model evidence.
- Reviewer tool: GitHub Copilot CLI, fresh bounded review context. The
  coordinator's launch packet specifies actual launch model `gpt-6.1-sol`
  (GPT family). The coordinator must preserve its tool/client launch witness
  and reviewer UUID after launch; this report cannot itself witness its own
  model. Do not count a role profile or this statement as independent proof.
- The current Opus prerequisite author identified by the coordinator with
  UUID prefix `19741` is **not** the verified author of the older source
  packet. No model-family inference is made from that separate task.
- **Independent-model gate: UNVERIFIED / not completed.** Substantive source
  conclusions below are useful advisory evidence, but cannot be represented
  as a certified cross-family independent review.

Procedures applied: `curriculum-review`, the research and authoring playbooks,
`docs/agent-orchestration.md` actual-model policy, the provenance policy in
`docs/09-decisions-and-open-questions.md`, and D-61 in
`docs/course-progression-decisions.md`. README, relevant curriculum and
safety documentation, and the current progress entries were consulted.
Content-item tests and skill-graph requirements apply only after such
artifacts are actually authored; their absence is not a research defect.

## Retrieval method and historical-truth boundary

Public cited official pages were independently retrieved using `web_fetch`
and/or `curl`. When HTML simplification failed, public main-body text,
metadata, and archive-table links were extracted in memory with Python's
standard library. Two rules-only PDFs were decoded in memory to distinguish
preliminary and playoff age scopes. No source-question PDF, official map,
answer key, question-bearing study-guide body, or private bank was downloaded
or copied into the report or repository. The cited Red Set guide was checked
by public index and HTTP headers only.

No live-exam login, account creation, purchase, paid model call, database,
provider, deployment, agent delegation, or commit was used. This report
contains original factual summaries and public citations, not official
questions, clue sequences, answers, maps, or instructional passages.

All statuses below are **this review's 2026-10-10 observations**. They do not
retroactively invalidate the packet's 2026-09-19 HTTP observations. A
currently unreadable URL is not proved to have been unreadable then; a
changed modification timestamp is not proof that a historical date was wrong.
Server dates expressed in UTC may fall on 2026-10-11 during this local review.

## Official-source evidence ledger

### E1 — Current U.S. program and pathway

**Packet:** lines 1156–1164, 1171, 1187–1214.
**Source:** [National Geography Bee: Middle & Elementary School](https://www.iacompetitions.com/emsgeographybee/),
International Academic Competitions — United States Division.
**Access:** public GET HTTP 200, same canonical destination.
**Metadata:** JSON-LD publication `2023-11-09T01:27:07+00:00`;
modification `2026-09-14T16:38:12+00:00`. The publication corresponds to
2023-11-08 in Pacific/Eastern time; the packet's date is not established as
incorrect. The current title tag differs from its visible main heading.

Verified independently:

- Current U.S. name is National Geography Bee; the official archive also
  explicitly dates the earlier International Geography Bee name to before
  the 2023–24 academic year. This is not the discontinued National Geographic
  GeoBee.
- Individual competition, worldwide political, human, cultural, and physical
  geography; not a Grade 6 school-standards replacement.
- Grade 6 has its own age division. Small Regional fields may share a room
  across divisions, without replacing grade-specific qualification.
- ORQE: free, 50 multiple-choice questions, four choices, 20 minutes,
  immediate automatic scoring, no incorrect-answer penalty, and about half
  the questions with a visual component.
- The official visual-access arrangement removes visual questions for
  visually impaired students requiring oral reading and prorates scores.
  This is an organizer accommodation, **not** permission to omit Learning
  Forge text equivalents or to claim equivalent difficulty without review.
- Roughly 60% advance from ORQE; cutoffs vary by season and age division.
  A pending result can occur before cutoffs are fixed. A second-chance ORQE
  is described for late fall. These are not immutable mastery thresholds.
- Regionals: three preliminary rounds and one final, 30 questions per round;
  pyramidal buzzer format. All learners play the preliminaries.
- Nationals qualification uses preliminary placement among not-already-
  qualified learners in the same division, top half inclusive of the
  organizer's odd-number/tie treatment. Reaching a Regional final and
  qualifying for Nationals are different decisions.
- Nationals: four preliminary rounds, then playoffs. The overview describes
  three main playoff rounds for Grade 6; typically about 30–35% reach them,
  with actual advancement determined by enrollment. Novice-playoff
  eligibility is separately conditional.
- Current 2027 championship weekend is May 27–31 in Orlando. This verifies
  the packet's season reference, not a guaranteed future schedule.
- National Geography Bowl, US Geography Bee, US Geography Championships,
  and International Geography Championships are separately named events,
  with different entry/qualification relationships. The packet correctly
  keeps them outside this research scope.

### E2 — ORQE access and safeguarding boundary

**Packet:** line 1172; lines 1193–1195.
**Source:** [Welcome to International Academic Competitions](https://orqe.iac-exams.com/),
IAC ORQE portal.
**Access:** publicly readable landing page; date not stated.
The page currently advertises 2026–2027 exams. K–8 learners require a linked
parent/teacher sponsor account, created first; the system is separate from
IAC tournament registration. No account-gated exam was entered. Public access
to the landing page does not imply public access or reuse rights to exams.

### E3 — Registration and participation limits

**Packet:** line 1173; lines 1254–1256.
**Source:** [Regionals Registration](https://www.iacompetitions.com/registration/),
IAC U.S.
**Access:** public GET HTTP 200.
**Metadata:** publication `2022-11-04T18:30:01+00:00`;
current modification `2026-10-10T17:48:56+00:00`, later than the packet's
2026-09-18 observation. Preserve the historical entry and add a refresh
annotation rather than rewriting it as a historical mistake.

The page currently limits each subject to one participation per Red, White,
Blue, and Gold set: four Geography Regionals. Its seven-participation
exception is explicitly for History, including separate History Bee/Bowl
sets. The Geography pathway page nevertheless still contains a sentence
about up to seven Regional sites. Therefore the packet's disclosed conflict
is real; it has not become safe to encode seven Geography attempts.

Registration describes the color sets as comparable in difficulty, whereas
the pathway page calls Gold slightly more challenging. The packet does not
assert equal difficulty; this is a further question only if color-set
difficulty metadata will later be authored.

### E4 — Official rules index and age-scope distinction

**Packet:** lines 1174–1177; lines 1252–1253.
**Source:** [Rules, Scoresheets, & Question Distribution](https://www.iacompetitions.com/rules-scoresheets-question-distribution/),
IAC U.S.
**Access:** public GET HTTP 200.
**Metadata:** publication `2023-08-11T18:33:34+00:00`,
modification `2026-09-12T11:09:46+00:00`; consistent with the packet.

Its Middle/Elementary section links the Regional sheet and the May 2024
National preliminary summary cited below. It does **not** provide a
Middle/Elementary Geography playoff summary there. A separate Varsity/Junior
Varsity section links
[the March 2026 playoff update](https://www.iacompetitions.com/wp-content/uploads/2026/03/IAC-National-Championships-Individual-Event-Playoff-Rounds-Scoring-System-and-Rules-Summary-Updated-March-2026.pdf).
That public PDF was read solely to verify scope: its own title and body
expressly apply to Varsity/Junior Varsity. Its early-clue scoring and changed
incorrect-buzz rules must **not** be transferred to Grade 6.

The packet's caution against treating an unlinked playoff document as
durable 2027 metadata is appropriate. This review does not establish which
unlinked document the original author accessed, because the packet gives no
URL for it; nor does finding the high-school update resolve that gap.

### E5 — Regional scoring, timing, and qualification

**Packet:** line 1175; lines 1196–1197.
**Source:** [IAC National Science, History, and Geography Regional Bees Rules Sheet](https://docs.google.com/document/d/1x-1ybZz5zZ0QlkM8kZun-adkPQW06HLwAvakp6mHmg8/edit?usp=sharing),
IAC, visibly updated November 2025.
**Access:** public text export readable after Google's redirect.

The sheet distinguishes K–8 race-to-five from Grades 9–12 race-to-eight.
Correct tossups earn one point, followed by threshold/early-finish bonuses.
Three incorrect attempts end a tossup; the third incorrect answer before
reading finishes can incur minus one, while the first/second incorrect
attempts do not. A player cannot rebuzz on that tossup. Reader-end and
answer-response windows are three seconds in person and **five seconds
online**. Protests are player-initiated and time-bounded. Consolidated rooms
do not erase age-division comparisons. These details substantiate the
packet's source-role description, not a Learning Forge scoring specification.

### E6 — National preliminary rules, not playoffs

**Packet:** line 1176; lines 1198–1199.
**Source:** [IAC Middle & Elementary School National Championships — Bee Competition Rules Summary for Preliminary Rounds](https://www.iacompetitions.com/wp-content/uploads/2024/05/IAC-Middle-Elementary-School-National-Championships-Individual-Event-Preliminary-Rounds-Scoring-System-and-Rules-Summary.pdf),
IAC.
**Access:** public PDF successfully retrieved and rules text decoded.
No publication date is stated in the decoded document; `/2024/05/` is an
upload-path clue, not an independently established edition date.

Verified race-to-five, one point per correct tossup, early-finish bonuses,
third-incorrect-before-reading-ends penalty, and three-second timing. It
also contains an exception when exactly three students are playing the
tossup and all three have answered incorrectly. Preliminary total scores
determine advancement, but event-specific documents determine how many
advance. Sudden-victory tiebreaks do not apply the preliminary minus-one
rule. Thus Regional/National preliminary mechanics overlap but are not one
interchangeable complete ruleset. The document expressly directs readers
elsewhere for tournament structure and playoffs.

### E7 — Official distribution and exact applicability

**Packet:** line 1177; lines 1201–1209.
**Source:** [Official Question Distribution](https://docs.google.com/document/d/1X9mcwsIGjgpyZwk_aA6lJjJFvUvg42VvF_aNxZZUhHM/edit),
IAC.
**Access:** public text export readable after Google's redirect;
edition/publication date not stated.

Its Middle/Elementary block is explicitly **30 tossups, Regional Finals and
Nationals**. It allocates 26 world-geography slots and four concept slots.
World slots comprise Asia 5, United States 5, Europe 4, a flexible non-US
category 4, Africa 3, non-US/non-Europe 2, North America outside the US 2,
and South America 1. Each concept category has one slot: current events,
economic, historical, and physical geography. The arithmetic is 26 + 4 = 30.
Flexible categories are not additional disjoint continent standards.

Frequencies are intended across the tournament, not exact quotas for every
round. The document does not establish an ORQE visual/content distribution,
a Regional-preliminary blueprint, or a standalone Grade 6 syllabus.
The packet correctly labels its proposed domains and sequence as Learning
Forge synthesis, but should retain this finer stage boundary explicitly.

### E8 — Study guidance and cited guide access

**Packet:** line 1178; lines 1211–1214.
**Sources:** [Study Guides](https://www.iacompetitions.com/study-guides/) and
[2026–27 National Geography Bee Red Set Study Guide](https://www.iacompetitions.com/wp-content/uploads/2026/09/2026-27-Red-Set-Geography-Study-Guide-1.pdf),
IAC.
**Access:** index public GET HTTP 200; guide public HEAD HTTP 200 with
`application/pdf`. No guide body was fetched.
**Metadata:** index modified `2026-09-13T14:51:14+00:00`, matching the
packet; guide header Last-Modified 2026-09-09, a server file date only.

The index and pathway corroborate that guides follow already-written sets,
emphasize Regional preliminary topics, cover finals less completely, and
are incomplete. No tournament-specific Nationals guide is supplied. Older
guides refer to sets not used this academic year. A current guide's existence
does not supply sequencing authority, exhaustive coverage, or reuse rights.
Item-level guide accuracy and originality comparisons are not claimed.

### E9 — Official buzzer archive: headings versus linked availability

**Packet:** line 1179; lines 1218–1220, 1257.
**Source:** [EMS — National Geography Bee — Past Questions](https://www.iacompetitions.com/ems-national-geography-bee-past-questions/),
IAC.
**Access:** public GET HTTP 200; index/table inspected, not question files.
**Metadata:** modified `2023-11-01T17:02:48+00:00`, despite links to later
files. This supports the packet's warning about stale modification dates.

Year headings run 2016–2017 through 2025–2026. The latest column links
National finals for Grades 6–8, Grades 3–5, and Grade 2/younger. Several
recent columns have finals links but no complete Regional/preliminary
set. Older columns have substantially more rounds. A shared Grades 6–8
finals file is not proof of a distinct Grade 6 archive.

The index also says that, as of 2023, IAC stopped posting past questions
apart from named exceptions, yet its table links later Geography finals.
That internal tension should be disclosed, not resolved by either calling
the archive complete or denying visible later links. Individual file
reachability, contents, and completeness were deliberately not verified.

### E10 — Official written/ORQE archive

**Packet:** line 1180; lines 1220–1221.
**Source:** [Elementary & Middle School — Past Online Regional Qualifying Exams](https://www.iacompetitions.com/2022-2023-elementary-middle-school-online-regional-qualifying-exams/),
IAC.
**Access:** public GET HTTP 200; only headings and link labels inspected.
**Metadata:** modified `2023-09-07T21:08:32+00:00`.

The geography links in the table identify 2019–2020, 2020–2021, and
2021–2022 ORQEs and keys. The 2022–2023 column includes winter samples
and key links banded as Grade 4/below, Grades 5–6, and Grades 7–8.
The page also has older year headings that do not establish equivalent
geography-file availability. The packet's narrower geography range is
reasonable. No key or exam body was opened; a link proves an indexed
resource, not a valid download or reuse license.

### E11 — Legacy International Geography Bee sources

**Packet:** line 1181; lines 1221–1223.
**Sources:** [USA](https://www.internationalgeographybee.com/usa/) and
[Resources](https://www.internationalgeographybee.com/usa/resources/),
International Geography Bee.
**Current access:** both failed with transport-level errors in `web_fetch`
and timed out in repeated `curl` attempts; HTTP `000` means no HTTP response,
**not** 404, an authentication wall, or proof that the sites are gone.

The packet's historical HTTP 200 and 2016–2017 through 2021–2022 legacy
resource range could not be independently reconfirmed. Current U.S. IAC
sources already corroborate the naming transition, so that claim does not
depend solely on the unreadable legacy site. The packet's legacy NQE 404
observation has no exact failed URL; it remains historical, unreplicated
evidence and cannot support a general claim that no older NQEs exist.

### E12 — Rights, authority, and sequencing

**Packet:** lines 1183–1190, 1211–1235, 1248–1251.
The current IAC pathway and registration footers state all rights reserved.
No affirmative reuse license was found in the official pages examined.
This is a bounded observation, not a legal opinion or proof that no license
can ever be negotiated. Public access, downloadable PDFs, and permissive
HTTP/CORS headers are not content licenses.

The packet's strict separation between coverage/style inspiration and
original/individually rights-cleared questions and visuals is sound. It
does not assert use of a district pacing guide or an official teaching
sequence. Its no-grade-specific-syllabus statement is supportable as
“none identified in these cited sources,” not an exhaustive claim about
every IAC document. Proposed `LF-IAC-NGB6-*` codes are repository-owned,
not state standards or organizer-issued competency codes.

## Verified findings

### B1 — Actual-model independence cannot be certified

- **Severity:** blocker, **confidence:** high.
- **Location:** packet lines 1146–1150; policy
  `docs/agent-orchestration.md`, lines 30–49.
- **Evidence:** historical source-author model/family and tool witness are
  absent. The introduction commit establishes a revision, not a model.
  Reviewer launch selection still requires coordinator-retained tool/client
  evidence and UUID.
- **Smallest safe remediation:** coordinator records authentic source-author
  execution metadata tied to this section/revision and reviewer launch
  witness. If historical author identity cannot be recovered, obtain a
  narrowly authorized fresh source packet with witnessed author identity,
  then review that changed scope with a witnessed eligible reviewer.
  Do not relabel the unrelated Opus prerequisite author as source author.
- **Disposition:** formal independent-review gate remains incomplete;
  substantive source findings are advisory only.

### F1 — Distribution's stage boundary is underspecified in the packet

- **Severity:** minor, **confidence:** high.
- **Location:** `docs/curriculum-sources.md`, line 1177 and lines 1204–1209.
- **Rule/source:** research playbook exact scope requirement; E7.
- **Evidence:** the packet correctly gives 26 + 4 but summarizes the source
  as tournament-level Middle/Elementary distribution without preserving its
  explicit Regional Finals/Nationals label. That omission can cause later
  ORQE or Regional-preliminary quotas to be presented as official.
- **Smallest safe remediation:** integrator adds “Middle/Elementary,
  Regional Finals and Nationals; not an ORQE or Regional-preliminary
  blueprint,” retaining tournament-level rather than per-round frequency.
  No new domain or skill is needed.

### F2 — Archive-policy contradiction is not expressly disclosed

- **Severity:** minor, **confidence:** high.
- **Location:** `docs/curriculum-sources.md`, line 1179 and lines 1218–1220.
- **Rule/source:** research playbook archive availability/caveat requirement;
  E9.
- **Evidence:** the packet already warns of incomplete recent archives and
  stale dates, but omits the archive's stated post-2023 posting cessation
  alongside visible newer finals links. Both are observable on the index.
- **Smallest safe remediation:** append a dated caveat recording that
  statement and its tension with the linked finals; claim only indexed
  availability, never comprehensive current question access.

No verified source defect reverses the packet's central program identity,
Grade 6 division, ORQE format, Regional/National preliminary pathway, broad
geography scope, original-content boundary, or source-only approval record.
F1/F2 are source-precision corrections, not authorization to author content.

## Questions requiring owner or organizer disposition

These are **not** disguised claims that already-disclosed historical facts
are false.

1. **Learner-facing label — major if authoring proceeds unresolved; high
   confidence.** Packet lines 1156–1160 and 1239–1241; E1/E9 support
   National Geography Bee with the IAC U.S./former-name qualifier.
   Smallest safe action: owner selects the label while retaining the
   existing identifier unless a separately reviewed migration is authorized.
2. **Mechanics scope/playoffs — major if treated as approved; high
   confidence.** Packet lines 1242–1243 and 1252–1253; E4–E6.
   Smallest safe action: owner explicitly bounds preparation to ORQE,
   Regionals and National preliminaries, or requires a traceable
   Middle/Elementary playoff document and organizer confirmation before a
   broader readiness claim. The unnamed legacy playoff document needs its
   exact URL/date/access observation; high-school rules are not a substitute.
3. **Current-geography source/review/retirement policy — major before
   volatile content is authored; high confidence.** Packet lines
   1246–1247; source and authoring playbooks. Smallest safe action: owner
   records approved factual sources, per-record as-of dates, review cadence,
   reviewer responsibility, and retirement/changed-fact treatment. This
   review does not choose those values or expand the research source set.
4. **Participation and Gold difficulty — minor pending future mechanics
   metadata; high confidence.** Packet lines 1254–1256; E1/E3.
   Smallest safe action: retain four Geography sets as corroborated and the
   seven-sites sentence as unresolved; seek organizer clarification before
   encoding conflicting operational or difficulty claims.
5. **Accessible visuals — major at content release, not a missing research
   artifact; high confidence.** Packet lines 1248–1249; E1/E12.
   Smallest safe action: require original or separately rights-cleared
   visuals and complete text alternatives; obtain human review of
   accessibility, difficulty, and any score-equivalence claims.

## Residual risks and non-findings

- **Legacy retrieval gap:** moderate confidence in current unavailability
  from this environment, not in global disappearance. Preserve original
  HTTP observations, append current failures, and retry only if legacy
  archive availability becomes necessary to an authorized handoff.
- **Dynamic official pages:** registration has changed since the research
  date; undated rules/distribution and stale archive metadata are not
  immutable season editions. Pin URLs, observed scope, retrieval date, and
  rule-document version where stated before publishing mechanics.
- **Incomplete file validation:** archive entries were verified at index
  level only. No claim is made about every linked PDF's availability,
  answers, correctness, relative difficulty, or copyright provenance.
- **Rights:** no content license was verified. The report supplies no
  reusable official content. Originality and item accuracy must be checked
  later against actually authored artifacts without copying source items.
- **Coverage and pedagogy:** durable geography, human/physical/political
  systems, visual literacy, and written-versus-oral demand have primary
  support. No exhaustive official Grade 6 competency list, mandatory
  prerequisite ordering, authored skill coverage, validator quality,
  solution correctness, or hint progression is certified at research stage.
- **No concurrency/test claim:** this report does not import results from
  the unrelated Python implementation. The coordinator's current-main
  43-passed result is not a test result run by this reviewer; older-worktree
  tests are not equivalent evidence.
- **Owner gates:** the 2026-10-10 owner statement approved research/sources
  only. D-61, separate mechanics/label/volatile-fact choices, independent
  model verification, human content review, and release authorization
  remain separate. Approval of architecture or research alone is
  insufficient; this report does not certify the authoring gate set.

## Validation and handoff

Only documentation formatting and whitespace validation are appropriate to
the one owned report. No installs, application tests, database tests,
integration/browser tests, provider evals, builds, or deployment were run;
there is no behavior change to validate.

Validation commands, executed from the isolated worktree:

```text
/Users/navoditkaushik/GitHub/learning-forge/node_modules/.bin/prettier --check --ignore-path /dev/null /Users/navoditkaushik/.copilot/session-state/cdf47baa-1f18-4bf1-a837-d1f3bd76743d/files/authoring-prereqs-geography/docs/curriculum-dossiers/geography-bee-grade-6-source-review-20261010.md
git diff --check -- docs/curriculum-dossiers/geography-bee-grade-6-source-review-20261010.md
```

**Results:** Prettier passed; scoped `git diff --check` passed. Because this
new report is untracked, an additional direct Python byte scan verified no
trailing spaces/tabs. The source-section SHA-256 was rechecked unchanged.
The completion handoff records the final report SHA-256; a file cannot
contain its own final byte hash without changing it.

**Substantive source readiness:** ready for human consideration with the
minor precision corrections and disclosed access/owner risks. No major
factual contradiction was established in the historical packet.
**Formal independent-model gate:** UNVERIFIED; changes/evidence required,
not passed. Coordinator should first attach authentic executor/reviewer
witnesses, then arrange owner disposition of F1/F2 and the existing open
decisions. Do not start content authoring from this advisory report.

**Recommendation: not ready for human review** as a completed
independent-review gate. This is not a reversal of the owner's source-only
approval or a claim that the independently checked source facts are unusable.
