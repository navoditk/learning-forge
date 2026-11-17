# Grade 6 Math Geometry unit scope (MATH-GEO-SCOPE)

**Status: REVISION 1, FROZEN DRAFT for Codex `forge-reviewer` cross-family
review. Not approved.** It is a document only. It changes no code, content
record, catalog, selection, manifest, policy, decision, register or status
file, and it authorizes nothing. Every **REC** is a recommendation for a later
decision, not an approved value.

- **Author:** Claude Code subagent; runtime model `claude-opus-5-5` per the
  client system metadata (self-reported; not independently verified).
- **Baseline:** worktree branch `worktree-agent-ac868deba17af61b4` at `main`
  commit `a75edcf` (clean). Input SHA-256 pins are in section 15. This
  baseline does **not** include the main checkout's uncommitted state, if any.
- **Not accessed:** private banks or drafts (including
  `~/learning-forge-private-drafts/`), learner or production data, databases,
  providers, Render. No tests or scripts were run except read-only `grep`,
  `sed`, `shasum` and JSON field listings. The window ledger was read, not
  written.

Labels: **OBS** observed in repository bytes at the pinned hash (decision text
quoted from the register counts as OBS); **REC** this author's recommendation;
**MISS** not verified or not verifiable from this checkout. "Derived" marks a
manual derivation from code (not executed).

## 1. Authority and scope

| #   | Statement                                                                                                                                                                                                                                                                                                                                          | Label |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| A-1 | D-333 accepted `docs/grade-6-math-next-unit-scope.md` as a document recommending "Statistics first, then Geometry" (`docs/course-progression-decisions.md:3769-3782`).                                                                                                                                                                             | OBS   |
| A-2 | D-334 extended D-212 delegation "to opening this unit" (Statistics) and authorized private drafting "extending D-262 to Statistics only" (`:3784-3807`). It does not name Geometry.                                                                                                                                                                | OBS   |
| A-3 | D-336 accepted SD-B and PV-1 and requires ST-6 to "pin the exact ordered membership `[Ratios@2.0.0, Statistics@2.0.0]` in `grade-6-math@1.2.0`" (`:3856-3879`).                                                                                                                                                                                    | OBS   |
| A-4 | D-345 adds "Grade 6 Math next-unit scope packets (Geometry first)" to window `claude-window-20261115b` (ceiling 60, deadline 2026-11-22, max 3 concurrent workers) and keeps every D-334 owner-only gate (`:3990-3999`).                                                                                                                           | OBS   |
| A-5 | Therefore this packet may produce this scope document only. Geometry D-61 exceptions, delegated Geometry rulings, private Geometry drafting and Geometry registration are **not** authorized by any record read here. Whether D-212 delegation extends to opening Geometry is an open owner question (section 11, OD-1), as it was for Statistics. | REC   |

## 2. Current state (what exists, what is stale, what is unreconciled)

### 2.1 Skills (unversioned JSON, pinned as `1.0.0`)

| Skill                      | Standard | Prereqs                    | Bands                    | Misconception codes declared                                                                                                                  | Evidence                                            | Label |
| -------------------------- | -------- | -------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----- |
| `area-of-composite-shapes` | 6.G.A.1  | none                       | foundational, developing | `double-counts-overlap`, `uses-wrong-formula`                                                                                                 | `content/skills/area-of-composite-shapes.json:6-10` | OBS   |
| `prism-volume`             | 6.G.A.2  | none                       | developing, challenging  | `labels-volume-answer-with-square-units`, `adds-edge-lengths-instead-of-multiplying`                                                          | `content/skills/prism-volume.json:6-15`             | OBS   |
| `surface-area-and-volume`  | 6.G.A.4  | `area-of-composite-shapes` | developing, challenging  | `confuses-surface-area-and-volume`, `omits-a-face`, `omits-a-congruent-face-pair-from-the-net`, `labels-surface-area-answer-with-cubic-units` | `content/skills/surface-area-and-volume.json:3-17`  | OBS   |
| `coordinate-geometry`      | 6.G.A.3  | `coordinate-distance` (NS) | developing, challenging  | `ignores-sign-in-distance`                                                                                                                    | `content/skills/coordinate-geometry.json:6-12`      | OBS   |

- G-S1 (OBS): `surface-area-and-volume` is titled "Prism surface area" and
  claims only 6.G.A.4 (`surface-area-and-volume.json:3,6`). Its code still says
  "and volume". The reconciliation records this as a **redefinition in place**
  of a skill that previously claimed 6.G.A.2 + 6.G.A.4
  (`docs/grade-6-math-reconciliation.md:205-207`).
- G-S2 (OBS): `coordinate-geometry` evidence includes "the distance between two
  points that share an x- or y-coordinate" (`coordinate-geometry.json:9`),
  which is 6.NS.C.8 territory owned by `coordinate-distance`
  (`coordinate-distance.json:6,9`). Reconciliation O-5 recommends a version
  narrowing to G.A.3 (`grade-6-math-reconciliation.md:260, 768`); no decision
  in the register adopts it (grep of `O-5` in the register: no hit).
- G-S3 (OBS): `docs/curriculum-sources.md:1528` still maps
  `surface-area-and-volume` to "6.G.A.2, 6.G.A.4". It is stale; the skill JSON
  governs (reconciliation C5, `grade-6-math-reconciliation.md:176`).

### 2.2 Public practice records (`content/geometry/`, 8 records)

All are `role: practice`, `review.status: reviewed` (owner stamp 2026-09-06 or
2026-09-17), `llm_drafted`, `owned`, no `figure`, and imported by the live
content catalog (`src/content/catalog.ts:55-62`). Bytes re-hashed for this
document match the wrapper pins (`src/curriculum/geometry-catalog.ts:70-104`).

| Record                       | Version     | Band         | Validator         | Elicits                                            | Defects or limits                                                                                                                                                                                                                                                                                                              | Label        |
| ---------------------------- | ----------- | ------------ | ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `area-of-composite-shapes-1` | `content-1` | foundational | numeric           | L-shape as two rectangles (`:15`)                  | Rectangles only                                                                                                                                                                                                                                                                                                                | OBS          |
| `area-of-composite-shapes-2` | `content-1` | developing   | numeric           | Rectangle minus rectangle (`:17`)                  | Rectangles only; no triangle or special quadrilateral anywhere in the skill                                                                                                                                                                                                                                                    | OBS          |
| `prism-volume-1`             | `content-1` | developing   | numeric           | (5/2)(3/2)(4) = 15 (`:17-18`)                      | Accepts only unit-bearing answers (`:21`); a bare `15` is rejected because `matchesAcceptedAnswer` is whole-string after normalization (`src/content/answer-matching.ts:43-48`). One hint step only (`:27-34`)                                                                                                                 | OBS, derived |
| `prism-volume-2`             | `content-2` | challenging  | composite `parts` | Volume 2 m³ and its meaning (`:17-33`)             | **False accept (derived):** `parts` match by substring (`answer-matching.ts:56-58`), so `12 cubic meters; the space inside the box` satisfies part 1 (`2 cubic meters` is a substring) and part 2. 12 is the old `content-1` canonical answer (`grade-6-math-reconciliation.md:542`). `32 m^3 interior space` is also accepted | OBS, derived |
| `surface-area-and-volume-1`  | `content-1` | challenging  | numeric           | Triangular-prism net from a text face list (`:17`) | **O-7 id@version reuse:** this `id@version` held an unrelated volume item in v1 (`grade-6-math-reconciliation.md:208-225`). The net is supplied, not represented by the learner. Bare `132` rejected (`:23`)                                                                                                                   | OBS          |
| `surface-area-and-volume-2`  | `content-1` | challenging  | numeric           | Rectangular prism SA 52 (`:17-18`)                 | Bare `52` accepted (`:23`), unlike `-1`; `52 cm^2` rejected, `52 cm2` accepted. No developing-band item for a developing/challenging skill                                                                                                                                                                                     | OBS, derived |
| `coordinate-geometry-1`      | `content-1` | developing   | numeric           | Distance (2,5)-(2,-3) (`:22`)                      | Duplicates 6.NS.C.8 (`grade-6-math-reconciliation.md:383, 402`); no polygon                                                                                                                                                                                                                                                    | OBS          |
| `coordinate-geometry-2`      | `content-1` | challenging  | numeric           | Area of a first-quadrant rectangle (`:22`)         | Vertices given; nothing drawn; sides implicit; first quadrant only                                                                                                                                                                                                                                                             | OBS          |

Answer-unit policy is inconsistent across the eight records (bare numbers are
accepted for area and coordinate items and `surface-area-and-volume-2`, rejected
for `prism-volume-1` and `surface-area-and-volume-1`) (OBS). A unit-label
misconception such as `labels-volume-answer-with-square-units` can only be
evidenced when the unit is graded (REC: GEO-1 rules one policy; section 9).

### 2.3 Disconnected wrapper (stale)

`src/curriculum/geometry-catalog.ts` (OBS):

- Unit `geometry@1.0.0` with `programRef` `grade-6-math@1.0.0` (`:17-20, 109-111`),
  not the active `1.1.0`; no unit `assessmentBankRef` (`:109-123`).
- Four lessons `@1.0.0` (`:62-107`), each pinning its two practice refs with
  version label `content-1` hard-coded (`:23-27`). `prism-volume-2` is
  `content-2` on disk, so that ref is a **V-2 version mismatch** while its hash
  matches the `content-2` bytes (re-hashed: `570b8278…c19d`).
- Lesson bank refs `<lesson>-bank@1.0.0` (`:55`); no bank record defines them.
- `teachingContentRefs: []` (`:53`); the review stamp is a copied 2026-09-06
  owner stamp; the header cites `ratios-extension-catalog.ts` (`:5-9`), which no
  longer exists (`ls src/curriculum`).
- Imported only by `tests/curriculum/geometry-catalog.test.ts:7-11` (grep).
  `COURSE_CATALOG` builds from pilot and Ratios records only
  (`src/curriculum/course-catalog.ts:147-159`).

### 2.4 Unreconciled candidate records (experiments, not wired)

`experiments/grade-6-math-v2/content-records-v2.json` holds 8 Geometry
candidates, all `pending_review`, none with a figure (OBS, JSON listing):
`v2-polygon-area-garden`, `v2-polygon-area-roof` (numeric),
`v2-prism-volume-unit-cube-packing` (numeric), `v2-prism-volume-context`
(composite), `v2-coordinate-polygons-rectangle`, `v2-coordinate-polygons-l-shape`
(composite), `v2-surface-area-box-net`, `v2-surface-area-triangular-prism`
(numeric). They target candidate skill codes (`polygon-area`,
`fractional-prism-volume`, `coordinate-polygons`, `nets-and-surface-area`) that
D-149 did not adopt (the 27-code production spine is retained; scope doc
`:36`). Reconciliation lists them as "reusable" inspiration
(`grade-6-math-reconciliation.md:257-260`). REC: treat them as inspiration only;
any reuse is a new production identity drafted, reviewed and accepted under a
Geometry D-61 exception (the D-341 path), never an import.

### 2.5 Private material and runtime

- D-148 recorded draft Geometry lesson banks (9 each) and an 18-item unit bank
  kept "in the authoring session's private scratchpad, never committed"
  (`docs/course-progression-decisions.md:1056`). Existence, location and digests
  are **MISS** (as for Statistics, scope doc `:86-91`). REC: draft fresh, as
  RAT-PACKAGE and STAT6 did.
- No Geometry teaching records exist (`content/teaching/` holds only `ratios`)
  (OBS).
- Because no unit claims these 4 skills, they are served practice-only under
  `grade-6-math-legacy-compatibility@1.0.0` (scope doc `:39`) (OBS via that
  document; the policy file was not re-read here).

### 2.6 Statistics (STAT6) state that Geometry depends on

| #   | Fact                                                                                                                                                                                                                                             | Label |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| S-1 | The validator implements U-2..U-5 (`src/curriculum/progression-catalog.ts:53-93`; D-340).                                                                                                                                                        | OBS   |
| S-2 | `PROGRAM_REGISTRY` holds `grade-6-math@1.0.0` and `@1.1.0` only (`src/curriculum/program-registry.ts:22-39`); the selection names `1.1.0` (`grade-6-math-active-selection.json:4-7`); no `statistics@2.0.0` module exists (`ls src/curriculum`). | OBS   |
| S-3 | So **ST-6 has not landed** at this baseline: `grade-6-math@1.2.0` does not exist. The Resume block names ST-6 as the next Statistics step after the private package (`docs/PROGRESS.md:7792-7799`).                                              | OBS   |
| S-4 | ST-5a `--bank-metadata` is in the tree (`scripts/private-bank-merge.ts:8-11, 616-652`; D-337).                                                                                                                                                   | OBS   |
| S-5 | Statistics public drafts (D-341) are in `content/statistics/` but not imported (`src/content/catalog.ts:63-67` imports only the original six).                                                                                                   | OBS   |
| S-6 | Window ledger `claude-window-20261115b`: `used 33`, `max 60` (read from common Git metadata `.git/agent-handoffs/DELIVERY-COORDINATOR/claude-window-20261115b/ledger.json`).                                                                     | OBS   |

## 3. Standards coverage (6.G.A.1-4) against what exists

Sub-competency rows extend reconciliation 3.2 (`grade-6-math-reconciliation.md:398-405`).
The CDE standard wording was **not** re-read for this document (MISS); GEO-1
verifies it, like ST-1.

| Row  | Sub-competency                                                         | Existing evidence                      | Status (OBS)                        | REC for this unit                                                                                                          |
| ---- | ---------------------------------------------------------------------- | -------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A1-a | Area of a right triangle                                               | none                                   | gap                                 | New item                                                                                                                   |
| A1-b | Area of a non-right triangle (base and perpendicular height)           | none                                   | gap                                 | New figure item; slanted side as distractor                                                                                |
| A1-c | Special quadrilaterals (parallelogram; trapezoid or rhombus)           | none                                   | gap                                 | New figure items                                                                                                           |
| A1-d | Compose into rectangles / decompose into triangles                     | `area-…-1`, `-2` (rectangles only)     | narrow                              | One new composite with a triangle part                                                                                     |
| A1-e | Real-world context                                                     | `area-…-1`, `-2`                       | covered                             | Keep                                                                                                                       |
| A2-a | Volume by packing with unit-fraction-edge cubes                        | none                                   | gap                                 | New figure or text item (count cubes, cube volume); **partial**: recognition, not physical packing                         |
| A2-b | V = l w h with fractional edges                                        | `prism-volume-1`, `-2`                 | covered (`-2` has a scoring defect) | Keep `-1`; correct `-2` (GEO-2 correction)                                                                                 |
| A2-c | V = B h                                                                | none explicit                          | gap                                 | New item                                                                                                                   |
| A2-d | Real-world problem                                                     | `prism-volume-2`                       | covered                             | Keep after correction                                                                                                      |
| A3-a | **Draw** a polygon from vertex coordinates                             | none                                   | gap; needs a construction response  | **Defer explicitly** (D-335 item 2 precedent for display construction); claim partial G.A.3                                |
| A3-b | Side length from vertices sharing a coordinate (incl. negative values) | `coordinate-geometry-2` (implicit, Q1) | narrow                              | New items across quadrants                                                                                                 |
| A3-c | Area or perimeter of a plotted polygon                                 | `coordinate-geometry-2`                | narrow                              | New items (non-rectangle, e.g. right triangle or L-shape)                                                                  |
| A3-d | Real-world context                                                     | none                                   | gap                                 | One new item                                                                                                               |
| A4-a | **Represent** a 3-D figure as a net (produce, select or verify)        | none (faces supplied)                  | gap                                 | **Select or verify** a net from a static figure with a `choice` field; producing a net is deferred (construction response) |
| A4-b | Surface area from a supplied net (rectangles and triangles)            | `surface-area-and-volume-1`            | covered once (O-7 caveat)           | New net item                                                                                                               |
| A4-c | Surface area of a rectangular prism                                    | `surface-area-and-volume-2`            | covered                             | Keep                                                                                                                       |
| A4-d | Real-world context                                                     | none                                   | gap                                 | One new item                                                                                                               |

Selection is a valid form of A4-a under reconciliation's acceptance column
("produces, selects or verifies", `grade-6-math-reconciliation.md:441`), whereas
for A3-a "identifying or naming the figure ... does not close this gap"
(`:440`). So A4-a can be closed with existing capabilities and A3-a cannot
(derived). REC: GEO-2 delivers a mandatory coverage map like
`docs/statistics-st2-coverage-map.md` with one row per line above.

## 4. Unit, lessons, skills and ordering (REC)

- New unit `geometry@2.0.0` (`programRef` `grade-6-math@1.3.0`), four lessons
  `@2.0.0`, one skill each at `1.0.0` (no skill version; D-149/D-57 untouched):

| Order | Lesson                            | Skill                      | Placement source (first practice ref) REC                                                       |
| ----- | --------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| 1     | `area-of-composite-shapes-lesson` | `area-of-composite-shapes` | `area-of-composite-shapes-1@content-1`                                                          |
| 2     | `surface-area-and-volume-lesson`  | `surface-area-and-volume`  | a new GEO-2 item; **not** `surface-area-and-volume-1@content-1` while O-7 is open               |
| 3     | `prism-volume-lesson`             | `prism-volume`             | `prism-volume-1@content-1`                                                                      |
| 4     | `coordinate-geometry-lesson`      | `coordinate-geometry`      | `coordinate-geometry-2@content-1` or a new GEO-2 item; **not** `coordinate-geometry-1` (NS.C.8) |

- Ordering rationale (derived from skill prerequisites): area before surface
  area (`surface-area-and-volume.json:7`); surface area beside prism volume so
  `confuses-surface-area-and-volume` is exercised after both ideas exist (REC;
  the stub orders area, prism, surface, coordinate, `geometry-catalog.ts:62-107`,
  which also satisfies the only intra-unit edge); coordinate last because its
  prerequisite `coordinate-distance` is a Number System skill outside any unit.
  Either order satisfies prerequisites; GEO-0 picks one (delegable).
- Placement capacity: 4 lessons × 1 skill = 4 probe items ≤ D-22 cap 5
  (`checkPlacementCapacity`, `src/curriculum/catalog-registration-checks.ts:141-155`)
  (derived).
- Cross-domain prerequisite: `coordinate-geometry` depends on
  `coordinate-distance`, which stays legacy practice-only. The scope doc states
  it "stays satisfiable through legacy practice" (`grade-6-math-next-unit-scope.md:98`);
  the unlock path for a unit-claimed skill with an unclaimed prerequisite was
  **not** re-verified in code (MISS; GEO-6 must test it).
- Teaching: none (zero teaching records), as for Statistics (D-335 item 8).
- `coordinate-geometry-1` and `surface-area-and-volume-1` remain legacy
  practice records with unchanged bytes (ID-2); whether the practice server
  still serves them by skill once the skill is claimed is MISS.

## 5. Successor program version plan: `grade-6-math@1.3.0`

### 5.1 Records (REC)

| Record                   | `programRef` / owner       | Notes                                                                                            |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `grade-6-math@1.3.0`     | —                          | `unitRefs` exactly `[ratios-and-proportional-reasoning@2.0.0, statistics@2.0.0, geometry@2.0.0]` |
| `geometry@2.0.0`         | `grade-6-math@1.3.0`       | Introducer = 1.3.0 (PV-1: Geometry placements record `1.3.0`)                                    |
| 4 lessons `@2.0.0`       | `unitRef` `geometry@2.0.0` | Pin registration hashes and correct version labels (`prism-volume-2` is not `content-1`)         |
| 13 bank metadata records | —                          | 4 lesson banks, 1 unit bank, 4 review banks, 4 delayed-check banks (section 6.2)                 |
| Selection                | —                          | `grade-6-math` → `1.3.0`; `skillBanks` + 8 entries                                               |
| Reserved labels          | —                          | `geometry@1.0.0` and the four lessons `@1.0.0` (Git-exposed stub, ID-2)                          |

### 5.2 Validator derivation (U-2..U-5, `progression-catalog.ts:53-93`)

Positive example (derived), registry `{1.0.0 → [pilot], 1.1.0 → [ratios@2], 1.2.0 → [ratios@2, statistics@2], 1.3.0 → [ratios@2, statistics@2, geometry@2]}`:

- U-2: each program lists distinct unit codes (passes).
- U-3: `ratios@2` is listed by 1.1.0, 1.2.0, 1.3.0 (one code `grade-6-math`);
  `statistics@2` by 1.2.0 and 1.3.0 (passes).
- U-4: `ratios@2.programRef = 1.1.0`, which exists and lists it;
  `statistics@2.programRef = 1.2.0`, which exists and lists it;
  `geometry@2.programRef = 1.3.0`, which lists it (passes).
- U-5: each unit's lessons are claimed once, on first listing (passes).

Counterexamples (derived):

| ID   | Input                                                                              | Result                                                                                                    |
| ---- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| CX-1 | Add 1.3.0 before ST-6 registers 1.2.0, listing `statistics@2` (`programRef 1.2.0`) | U-4 (b) fails: "points to a different program" (`:81`). **GEO-6 depends on ST-6 being applied.**          |
| CX-2 | Fold Geometry into 1.2.0 instead                                                   | Validator passes, but violates D-336's pinned membership `[Ratios, Statistics]` (A-3); needs a new ruling |
| CX-3 | Edit registered 1.2.0 bytes to add Geometry                                        | ID-2 violation; MF-1 digest fails (std design K-4)                                                        |
| CX-4 | 1.3.0 lists `geometry@1.0.0` (the stub)                                            | Stub `programRef` is `1.0.0`, which does not list it: U-4 (c) fails; also a reserved label once reserved  |
| CX-5 | 1.3.0 omits `statistics@2.0.0` or lists an older Ratios                            | Validator passes (K-1, versions opaque); only an exact-membership test catches it                         |

REC: GEO-6 adds a test pinning `1.3.0.unitRefs` to exactly the three refs in
that order (K-1 mitigation), and keeps ST-6's `1.2.0` membership test.

### 5.3 Manifest arithmetic (derived from std design section 6)

Today MF-2 counts 32 and MF-5 expects 2 programs
(`tests/curriculum/catalog-registration-checks.test.ts:615, 668`). After ST-6:
47 and 3 (std design `:274-277`). After GEO-6: 47 + 1 program + 1 unit + 4
lessons + 13 banks = **66**, and **4** programs; one `geometry@2.0.0` probe
snapshot entry is added (MF-4) with a committed snapshot under
`src/curriculum/probe-snapshots/` (today only Ratios snapshots exist, `ls`).

### 5.4 Package lockstep constraint (OBS, derived consequence)

- `GRADE_6_MATH_PACKAGE_BANKS = deriveRequiredBanks(COURSE_CATALOG_INDEX)`
  (`src/assessment/private-package-store.ts:75-76`) derives from **every
  registered** bank, not only the selected program's; lesson and unit banks are
  mandatory, review and delayed-check banks optional (`:48-72`).
- The store throws on a package **missing** a mandatory bank or containing an
  **unknown** bank (`:176-197`), and `createHeldOutStore` turns any throw into
  `UnavailableAssessmentStore` (`src/assessment/store.ts:61-69`).
- Consequence (derived): registering Geometry banks without a package that
  contains them makes **all** held-out assessments unavailable, Ratios and
  Statistics included; a package with Geometry banks installed before
  registration fails as "unknown bank". Registration and the owner's package
  install must change in lockstep. The same holds for ST-6 (reported to the
  integrator as risk R-1; not edited here).
- The owner's Geometry merge must take as input a package that already holds
  the Ratios and Statistics banks (D-333 carried risk "merge constraints over
  the combined bank set").

### 5.5 Push ordering

D-334: the integrator "does not push the successor program before the banks
are merged unless the owner explicitly accepts that" (OBS). REC: the same rule
for 1.3.0; selection of 1.3.0 ships only with a package that contains the
Geometry banks (5.4).

## 6. Volumes (REC; arithmetic mirrors D-335 item 8)

### 6.1 Public practice

| Item                                    | Statistics (D-335) | Geometry (REC)                                                                                                                                                                                   |
| --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New items per skill                     | 4                  | 4                                                                                                                                                                                                |
| Skills                                  | 3                  | 4                                                                                                                                                                                                |
| New identities `<skill>-3…-6@content-1` | 12                 | **16**                                                                                                                                                                                           |
| Corrections (`content-N+1`)             | 1                  | **1** (`prism-volume-2@content-3`, structured `number` + `choice`, removes the substring false accept) + **0-1** conditional (`prism-volume-1@content-2` if GEO-1 rules bare numbers acceptable) |
| Total public drafts                     | 13                 | **17**, at most **18**                                                                                                                                                                           |
| Teaching                                | 0                  | 0                                                                                                                                                                                                |

Per-skill allocation (REC; final mapping is the GEO-2 coverage map):
`area-of-composite-shapes` A1-a, A1-b, A1-c, A1-d; `prism-volume` A2-a, A2-c and
two fractional-edge items including one developing-band item; `surface-area-and-volume`
A4-a (net selection), A4-b, A4-d and one **developing**-band item (none exists);
`coordinate-geometry` A3-b (negative coordinates), A3-c (non-rectangle), A3-d
and one perimeter item. `surface-area-and-volume-1` gets no correction: a new
version would not repair the historical reuse (O-7 is a database question).

### 6.2 Private held-out items (outside the repository)

| Bank kind     | Statistics           | Geometry (REC)       |
| ------------- | -------------------- | -------------------- |
| Lesson        | 3 × 9 = 27           | 4 × 9 = **36**       |
| Unit          | 1 × 18 (6 per skill) | 1 × 24 (6 per skill) |
| Review        | 3 × 3 = 9            | 4 × 3 = **12**       |
| Delayed check | 3 × 6 = 18           | 4 × 6 = **24**       |
| **Total**     | **72** (10 banks)    | **96** (13 banks)    |

Check: 36 + 24 + 12 + 24 = 96; 72 / 3 skills = 24 = 96 / 4 skills (same
per-skill rate). Item bands must match the skill bands (D-263 failure class);
for example no `foundational` item for `prism-volume`. Figures are allowed on
held-out items (`TransitionContentBaseSchema.figure`,
`src/contracts/progression.ts:143-154`).

## 7. Misconception codes

Validation: an item or choice may only cite codes declared by its own skill
(`src/content/catalog.ts:555-573`); codes may be empty. The general list rule
is owner decision OC-4 (M-A/M-B); Ratios and Statistics used M-C (existing
codes only) (`docs/grade-6-math-catalog-versioning.md:539-549`; D-335).

| Skill                      | Diagnostic code needed for the planned items                                            | Declared?                                                                                                  | Label |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----- |
| `area-of-composite-shapes` | Forgets the 1/2 in triangle area                                                        | **No** (only generic `uses-wrong-formula`)                                                                 | MISS  |
| `area-of-composite-shapes` | Uses a slanted side instead of the perpendicular height                                 | **No** (generic `uses-wrong-formula`)                                                                      | MISS  |
| `area-of-composite-shapes` | Reports perimeter as area                                                               | **No** (exists only in v2 candidate `polygon-area`, not production)                                        | MISS  |
| `prism-volume`             | Uses the unit cube's edge length instead of its volume when packing                     | **No** (v2 candidate only)                                                                                 | MISS  |
| `prism-volume`             | Square units on a volume; adds edges                                                    | Yes                                                                                                        | OBS   |
| `surface-area-and-volume`  | Omits a face or face pair; cubic units; confuses SA and volume                          | Yes (4 codes)                                                                                              | OBS   |
| `coordinate-geometry`      | Swaps horizontal and vertical side lengths; diagonal distance for an axis-parallel side | **No** (similar codes are declared on `coordinate-distance`, a different skill, so items cannot cite them) | MISS  |
| `coordinate-geometry`      | Counts grid points instead of unit intervals                                            | **No**                                                                                                     | MISS  |

REC: under M-C, GEO-2 uses existing codes or none and records each missing
diagnostic as a known gap (as `center-and-variability-4` did, D-341). Adding
codes is an owner decision (OD-4); scope doc stop condition "a needed
misconception code is missing (OC-4)" fires only if GEO-1 rules that a code is
required, not merely useful.

## 8. Figures and accessibility (REC unless OBS)

- OBS: figures use `ContentFigureSchema` (`src/contracts/content.ts:337-363`):
  allowed elements only (`circle`, `ellipse`, `g`, `line`, `path`, `polygon`,
  `polyline`, `rect`, `svg`, `text`, `:324-335`), no event handlers, `href`,
  `url(` or `<style>`; `svgMarkup` ≤ 12,000 chars, `altText` ≤ 1,000, `caption`
  ≤ 300, width 200-1200, height 120-800. Precedent: D-152 (Ratios) and the
  Statistics figures (e.g. `content/statistics/distributions-3.json`).
- Text alternatives must be **complete**: every length, height, vertex
  coordinate, face dimension and adjacency needed to solve is in `altText`,
  the prompt or `accessibleAlternative`, so the item is solvable without the
  image (D-152 standard).
- Heights: draw perpendicular heights as dashed lines with a right-angle
  marker (`polyline`); state "not drawn to scale" in the caption when it is not.
  Never require measuring the figure.
- 3-D prisms: give dimensions in text; avoid isometric drawings that require
  depth perception to read a dimension.
- Nets (A4-a): each candidate net is labelled (A, B, C, D) in one figure, with a
  `choice` field whose option labels name the nets. Alt text lists each net's
  faces and which edges join; if that exceeds 1,000 characters, redesign the
  item (fewer or simpler nets). Risk R-4.
- Coordinate planes: labelled axes and grid, vertex labels with coordinates in
  text; alt text lists vertices in order; work in all four quadrants.
- Colour never carries meaning; text contrast ≥ 4.5:1 and graphics ≥ 3:1
  (WCAG 2.2 AA 1.4.3, 1.4.11); fonts ≥ the Statistics figures' 17px.
- Automated: schema and catalog checks (GEO-2). Manual assistive-technology
  pass on every figure item: **owner-only** (D-212 item 3, D-334).

## 9. Packets

| ID    | Work                                                                                                                                                                                                                                                                                                                                         | Role (model)                                                            | Calls (REC) | Depends on                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| GEO-0 | Owner batch (OD-1..OD-5), then delegated scope rulings: volumes (6), lesson order (4), deferrals A3-a and A4 net production, misconception rule (7), unit-answer policy, the two D-61 exception texts                                                                                                                                        | Owner, then integrator → Codex delegated rulings (D-212)                | 1-2         | This document accepted                                         |
| GEO-1 | Read-only subject review: 6.G.A.1-4 against the registered CDE source; rows of section 3; grade scope and correctness of the 8 existing items; the `prism-volume-2` false accept; unit policy; whether net selection satisfies A4-a; O-5 handling without a skill version                                                                    | Codex `forge-reviewer` (read-only)                                      | 1-2         | GEO-0 (can run alongside ST-6)                                 |
| GEO-2 | 16 new public practice records + 1 (at most 2) corrections under `content/geometry/`, plus `docs/geometry-g2-coverage-map.md`; `pending_review`, not imported                                                                                                                                                                                | Claude Opus `forge-expert` → Codex review → delegated acceptance        | 5-7         | GEO-1 dispositions; public D-61 exception                      |
| GEO-4 | 96 held-out items in 13 banks, outside the repository, then reviewed-mode stamping outside the repo (D-343 pattern)                                                                                                                                                                                                                          | Opus → Codex review → delegated acceptance                              | 3-5         | **Owner authorization (OD-2)**; GEO-2 frozen (non-reuse set)   |
| GEO-6 | Integration: `geometry-unit-2-catalog.ts` (name REC), program 1.3.0, 13 bank metadata records, the committed `--bank-metadata` file, selection, reserved labels, manifest (66/4), probe snapshot, register the GEO-2 records, V-7 tests for structured items, exact-membership test, retire the stub and its test, history and successor e2e | Sonnet `forge-implementer` → Codex review → delegated local application | 4-7         | **ST-6 applied** (CX-1); GEO-2 and GEO-4 accepted              |
| GEO-5 | Real merge with `--bank-metadata`, D-216 non-reuse check, install, mounted e2e                                                                                                                                                                                                                                                               | **Owner only**                                                          | 0           | GEO-4, GEO-6                                                   |
| GEO-7 | AT pass on figure items, production apply, push, deploy, release record                                                                                                                                                                                                                                                                      | **Owner only**                                                          | 0           | GEO-5                                                          |
| Total |                                                                                                                                                                                                                                                                                                                                              |                                                                         | **14-23**   | One correction round per increment; a recurring major adds 2-3 |

No GEO-D or GEO-5a packet: SD-B (D-336) and `--bank-metadata` (D-337) are
reused, so the estimate is below STAT6's 20-32 (REC). Window budget: 27 calls
remain of 60 (S-6), shared with ST-6 (5-8) and Spelling SP-1/SP-3/SP-4, so
GEO-0..GEO-2 fit and GEO-4/GEO-6 may need a new window (owner-only, OD-5).

**Parallelism (REC; max 3 concurrent workers, D-345):** GEO-1 may run beside
ST-6 (no shared paths). GEO-2 may run beside ST-6 (owned paths
`content/geometry/*-{3..6}.json`, the correction file and the coverage map; no
catalog file). GEO-4 runs after GEO-2 is frozen. GEO-6 runs strictly after ST-6
is applied and never concurrently with any other catalog/selection/manifest
writer. The Copilot CLI session (D-345) may take GEO-1 preparation or GEO-2
mechanical checks only as integrator-prepared packets; it never replaces Codex
review.

**Stop conditions (route to the owner):** GEO-1 rules that drawing (A3-a) or
net production must be in scope (construction response); a needed
misconception code is missing (section 7, OC-4); O-5 narrowing or the A2-a
packing evidence needs a skill version (D-149/D-57); O-7 investigation is
required before claiming `surface-area-and-volume`; D-148 drafts must be
recovered; ST-6 changes the 1.2.0 membership or is abandoned; any step needs
production, learner or private data; the window is exhausted.

## 10. Gates that stay owner-only (OBS: D-212 item 3, D-334, D-345)

Private Geometry drafting authorization; running the merge, the D-216
non-reuse check and the mounted e2e; the O-7 production database
investigation; the manual AT pass; any production data or migration; commit,
push and deployment; the release record; paid provider calls; a new window or
budget. Also selecting 1.3.0 in a deployed build before the package holds the
Geometry banks (5.4, 5.5).

## 11. Open owner decisions

| ID   | Decision                                                                                                    | REC                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| OD-1 | Extend D-212 delegation to opening Geometry (scope rulings, D-61 exceptions, acceptance, local application) | Yes, recorded as its own decision, as D-334 did for Statistics                       |
| OD-2 | Authorize drafting 96 private items outside the repository (D-262/D-334 analog)                             | Yes, Geometry only, same handling rules as D-334                                     |
| OD-3 | O-7: authorize the database investigation of `surface-area-and-volume` pooling, or accept the risk          | Investigate before GEO-7; until then do not pin `-1@content-1` as a placement source |
| OD-4 | OC-4 misconception rule for Geometry: M-C (existing only) or M-B additions (section 7)                      | M-C for GEO-2; consider M-B additions later                                          |
| OD-5 | Window: whether GEO-4/GEO-6 may use the remaining `claude-window-20261115b` budget or a new window          | Owner sets; this document does not spend                                             |

Delegable once OD-1 is granted (REC): lesson order, volumes, deferrals, unit
policy, D-61 exception texts, content acceptance, GEO-6 engineering acceptance.

## 12. Risks

| ID  | Risk                                                                                                              | Mitigation (REC)                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| R-1 | Registering banks without a matching package disables **all** held-out assessments (5.4); also applies to ST-6    | Lockstep registration and package install; owner informed before any push |
| R-2 | O-7: claiming `surface-area-and-volume` may pool old-meaning evidence in one `MasteryEstimate` (no skill version) | OD-3; no `-1` placement source                                            |
| R-3 | `prism-volume-2` false accepts the old wrong answer while legacy practice serves it today                         | GEO-2 correction; GEO-1 confirms; old `content-2` bytes stay (ID-2)       |
| R-4 | Net-selection alt text may exceed 1,000 characters or be impractical to follow by ear                             | Simple nets; owner AT pass                                                |
| R-5 | Partial claims (A2-a recognition, A3-a and A4 production deferred) could be read as full G.A coverage             | Coverage map and parent-facing wording say "partial"                      |
| R-6 | K-1: 1.3.0 can validly list an older or incomplete membership                                                     | Exact-membership test (5.2)                                               |
| R-7 | GEO-6 cannot start until ST-6 is applied; ST-6 delay blocks Geometry registration                                 | Run GEO-0..GEO-4 meanwhile                                                |
| R-8 | The unlock behaviour of a claimed skill with an unclaimed NS prerequisite is unverified                           | GEO-6 test                                                                |
| R-9 | Inconsistent answer-unit policy across items                                                                      | GEO-1 rules one policy; new items follow it                               |

## 13. Not verified (MISS)

- CDE 6.G wording (not re-read); production state of any unit, package or
  learner data; D-148 draft existence; O-7 pooling.
- The derived `prism-volume-2`/`prism-volume-1` grading results were not
  executed.
- Cross-domain unlock (R-8); whether claimed skills keep serving all legacy
  practice records by skill.
- The ST-6 implementation's bank-label convention (`@1.0.0` reference-only
  labels versus new versions) does not exist yet; GEO-6 should follow it.
- The legacy access policy file and `src/progression/policy.ts` were not
  re-read (cited via the scope doc).
- The main checkout may hold uncommitted state not in this baseline.

## 14. Author self-audit (requirements to evidence)

| Requirement (packet)                                        | Location | Evidence                                                                            | Result                       |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Current-state evidence with file:line; exists/stale/missing | 2, 3     | Skill JSON, 8 records re-hashed against wrapper pins, wrapper, v2 candidates, D-148 | Done; D-148 MISS             |
| Unit/lesson/skill breakdown and ordering                    | 4        | Prerequisite edges; D-22 capacity 4 ≤ 5                                             | Done                         |
| 1.3.0 plan verified against validator and ST-6 dependency   | 5        | U-2..U-5 at `progression-catalog.ts:53-93`; positive example; CX-1..CX-5            | Done; ST-6 not landed (S-3)  |
| Volumes with arithmetic matching Statistics                 | 6        | 4 × 4 = 16 (+1..2); 36 + 24 + 12 + 24 = 96, 24 per skill both units                 | Done                         |
| Misconception codes, flag missing                           | 7        | `catalog.ts:555-573`; 5 missing diagnostics flagged                                 | Done                         |
| Figure/SVG and accessibility                                | 8        | `content.ts:324-363`; D-152                                                         | Done; AT pass owner-only     |
| Packets, roles, calls, parallelism, stop conditions         | 9        | 14-23 calls; ledger 33/60                                                           | Done (estimate REC)          |
| Owner-only gates and open decisions                         | 10, 11   | D-212 item 3, D-334, D-345                                                          | Done                         |
| Risks and not verified                                      | 12, 13   | R-1..R-9                                                                            | Done                         |
| Counterexample check                                        | 5.2, 2.2 | CX-1 (1.3.0 before ST-6 fails); `12 cubic meters…` false accept                     | Done (derived, not executed) |
| OBS/REC/MISS labels; no approvals inferred                  | all      | A-5, OD-1..OD-5                                                                     | Done                         |
| Only owned artifact written                                 | —        | `git status`: this file only                                                        | Done                         |

## 15. Input pins (SHA-256)

| File                                                   | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `docs/grade-6-math-next-unit-scope.md`                 | `a94096acd31ce147b5cefc889b28939dbeee8d15948821447496e54bfd84a071` |
| `docs/grade-6-math-std-design.md`                      | `a2acb84553e66897e05948f5200527d91ab86209fae7baf54caaae9a8b18e5fc` |
| `docs/course-progression-decisions.md`                 | `387730a3b362e09a9140ff2cae45ce7a9ee5177300cd4f85c0aaf6886172917f` |
| `docs/grade-6-math-reconciliation.md`                  | `c80f184ee773887a71f6d004762d94ae7fce82872d2df0fa6fd0d489c365caec` |
| `docs/grade-6-math-catalog-versioning.md`              | `43afa38e47fc4c8b8111f9e969eef2bdd0678872ae13a550f3e5a3cea07dfc5b` |
| `docs/statistics-st2-coverage-map.md`                  | `9c8fd8b8e3015b1a6dbd8d54348d0940661c80ea30a1eacf38bd5442bcb40855` |
| `src/curriculum/geometry-catalog.ts`                   | `8ed748549f325f6d4924ee9263204e2b77b51e8ca5af0fc38ef7712dac6536c1` |
| `tests/curriculum/geometry-catalog.test.ts`            | `7da5a79c2d0fabe2715a7df285a68c37727c4fbfaa356e795fd880cc096c95bb` |
| `content/skills/area-of-composite-shapes.json`         | `d00f57c65efc59a2fad6500f482dc17468f0df70f1b9a4a0bbb51258d5d8bff8` |
| `content/skills/prism-volume.json`                     | `2d11963c2f8ead750109481c41f28c9078af87d0fea23f14c26d3ab15599d974` |
| `content/skills/surface-area-and-volume.json`          | `52d5a153ba6b612857be280472083278e432bda2ff089f914a88dac6bcc038eb` |
| `content/skills/coordinate-geometry.json`              | `746a26716b817f705c8a56193d4f1c3a2a8a650a45d0e8c137322f7c4e36740c` |
| `content/skills/coordinate-distance.json`              | `42ea14278ae45020df49cb5a5f65e977d0c72982767826b7878616c5ec3541f5` |
| `content/geometry/area-of-composite-shapes-1.json`     | `6af41d9ffc068cefd4443b1266c077a34b54a59538f85dd9482c8c1485e3b853` |
| `content/geometry/area-of-composite-shapes-2.json`     | `f4cceb87f615d06997163749c4a5bfd69547cf04423b45acf7e4e5ad73aae681` |
| `content/geometry/coordinate-geometry-1.json`          | `7338475eb725ee75fb8dbbf99c5a9ee963658fa45802e7eed5fdce89244771df` |
| `content/geometry/coordinate-geometry-2.json`          | `3da81488e384ddd1e8cfb3facee4396b96db208a3515587f5c991fa94fd12e22` |
| `content/geometry/prism-volume-1.json`                 | `b734b0bbb9229e9101e73bd19662f781031e5791581eb1da9b56f0c00404b7af` |
| `content/geometry/prism-volume-2.json`                 | `570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d` |
| `content/geometry/surface-area-and-volume-1.json`      | `81d97bde92f249bf6029087040ceffe33003e24a881c76a65dbe93f1de48b0e1` |
| `content/geometry/surface-area-and-volume-2.json`      | `878ad0da7bdb73fcfeb35eafdf31c6ed10c0cc89ee32acf0cbfdf39dffe98cc7` |
| `src/curriculum/progression-catalog.ts`                | `adaa0fc074ec37e4c168be1af7cee91b163be0283a14d9f260e614af0cb696ac` |
| `src/curriculum/program-registry.ts`                   | `c62a05109eea7d56d21c18bae98a957eb3f84f63112074c7c5c8469377fedbc3` |
| `src/curriculum/course-catalog.ts`                     | `df413cefdd767982046f65fc98964922fccd1af1fee103fc85632681c3bb7feb` |
| `src/curriculum/grade-6-math-active-selection.json`    | `c9f1808971745ff4c71e12fd982381578aee731c9f3155ebe6a7283a25874928` |
| `src/curriculum/grade-6-math-reserved-labels.json`     | `61462e7a4e651d6f75213480d07c158c94cee946bd89ca5811e1d16b4758db95` |
| `src/curriculum/grade-6-math-structure-manifest.json`  | `e42ee77a75f703e9444615207ccf08254c98a78dd9b12c4300fa1c952b5dd701` |
| `src/curriculum/catalog-registration-checks.ts`        | `ddf68b6557e85d5a558b76149e9db47ef17cef26dd3b4562976365c46291abaa` |
| `tests/curriculum/catalog-registration-checks.test.ts` | `3385493dbddc2f693d97111e72ba88ee1d463e6a2706c63bc5e2a4e56ae29a71` |
| `src/contracts/content.ts`                             | `3d4b091f02fa2c838be4a7ca71fce5749c4b9e7c4cc9f1fdb65d40849f8a4b2c` |
| `src/contracts/progression.ts`                         | `99a533b5d5a1c97b18be69b8b18df948dc00344dd2cde8783c351909502d6ddc` |
| `src/content/answer-matching.ts`                       | `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5` |
| `src/content/catalog.ts`                               | `f1baf0d3c19c9757d06651208c630dfaead7c4b0c18e3b4090e70e56afc4ccb1` |
| `src/assessment/private-package-store.ts`              | `6ccf7a9ab4d5624c2b705b1e0ca9df753fbecb13e64e7a521f418371b6767d81` |
| `src/assessment/store.ts`                              | `e7044a2103559b0f4c71dd34e455c3ac76efb8fde34728357a20b7f82a4c902d` |
| `scripts/private-bank-merge.ts`                        | `fa06d5ff5d04c81158ff040f2e5320f3b186f4a1548d05affc1e885c189a3859` |
| `experiments/grade-6-math-v2/content-records-v2.json`  | `f24afa90548eb07935d378277bb6703701f3a4f738d4ce4147b008826b328a5a` |
| `experiments/grade-6-math-v2/skill-records-v2.json`    | `7bdf90d75f1e78746866ae00f71f72ce5ed1906fcf96c3bf0aad6f1298365e5e` |
