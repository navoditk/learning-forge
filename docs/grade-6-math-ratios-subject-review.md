# RAT-SUBJECT — Subject and candidate-reuse review

## Verdict and scope

**Not ready for human review of the uncorrected TR-3 requirement or adoption
of the four candidates as written.** The authorized subject review is complete.
All fourteen canonical answers are mathematically correct. Findings concern
standards boundaries, evidence elicitation, accepted responses, scoring and
reuse. This report is advisory, not content or implementation approval.

Reviewer: fresh host-selected Codex `forge-reviewer`, fixed actual model
`gpt-6.1-sol`. Integrator recorded the returned evidence; reviewer changed no
files. HEAD `3e7c33372599d20c285656c3610ca6e47743240f` and all fifteen
input hashes in `docs/agent-handoffs/RAT-SUBJECT.md` matched before and after
review. Accepted plan hash: `a05d6865...9467`.

Reviewer independently inspected filtered Claude client metadata for the
MATH6-RATIOS-PLAN executor: actual `claude-opus-5-5`, assistant record
`91dd05ef-b62c-4374-ae11-d78883e25b1d` (2026-10-12T21:21:21.943Z) and
revision-3 record `0aa3001f-65ed-44e2-887e-04e6df16ada1`
(2026-10-13T00:03:27.428Z). Metadata path is recorded in that packet.
Different model families are established for the planning claims. Historical
item author identities are not established by provenance labels or owner
review stamps; this review does not clear originality or per-item gates.

Scope: registered CDE 6.RP.A.1–A.3, ten public Ratios items, four public v2
candidates and D-73's recorded scope note. No private-bank access, new source
research, runtime tests/probes, database, learner data, paid-provider calls or
implementation occurred. Procedures read included the curriculum-review skill,
authoring/content-review playbooks, repository instructions and live records.

## Registered-source boundaries

The registered CDE PDF was successfully retrieved. Printed page 42 (PDF
page 49) limits Grade 6 unit rates to non-complex fractions. Fractional results
from whole-number quantities fit this boundary; a ratio of fractional
quantities must not become the required Grade 6 gap. A.3d concerns measurement
unit conversions. A.3a also names plotting table pairs and comparing ratios.
[Registered CDE mathematics standards, page 42](https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf#page=49)

### Proposed TR-3 correction

**RP.A.2 non-complex fractional unit rates:** Learner determines and interprets
a non-complex fractional unit rate from whole-number quantities, identifies
the quantity per one unit, and uses appropriate rate language. Accepted
fraction, decimal or mixed-number forms must preserve value and units under
reviewed scoring requirements.

This is a proposed correction for the original Claude executor, not permission
to edit or author content. D-73 (`docs/course-progression-decisions.md:1001`)
already records complex-fraction rates as intentional stretch outside the
three taught lessons. That historical choice remains separate; no private
item was inspected.

### Conversion home and ratio notation

The proposed `unit-rates` home is subject-matter coherent:
`content/skills/unit-rates.json:9` covers applying a rate to a related quantity
and already lists 6.RP.A.3. A stated conversion factor and explicit output
unit are appropriate. Conversion-error misconception coverage needs review;
this report does not decide IC-2 or skill-version compatibility.

For a named ordered comparison, `2:3`, `2 to 3` and `2/3` can represent the
same ratio. Fraction notation for part-to-part is mathematically valid; it
does not express the first part's fraction of the whole. In the garden item,
tomatoes are `2/5` of all plants. Spaced `2 : 3` preserves meaning. These are
mathematical observations, not an approved exhaustive notation policy.

## Independent solutions and validator observations

Acceptance observations below come from static reading, **not executed
tests**. Live call sites are `src/phase1/service.ts:104` and
`src/progression/assessment-submission.ts:68`. The matcher at
`src/content/answer-matching.ts:19` normalizes case, whitespace and selected
punctuation; lines 38–58 use exact strings or unrestricted part substrings.
Validator labels do not themselves parse mathematics there.

### Ten public items

Paths are under `content/ratios/`.

| Item; lines                          | Independent solution                                 | Validator/evidence observation                                                                   |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `ratio-language-1.json`; 11–18       | `8:12 = 2:3`, tomatoes to peppers                    | Listed colon, word and fraction forms correct; spaced colon form rejected.                       |
| `ratio-language-2.json`; 14–22       | Scale by `12/3 = 4`; fruit `8 cups`                  | Listed answers correct; requested explanation unassessed, correct explanatory sentence rejected. |
| `unit-rates-1.json`; 15–22           | `45/3 = 15 miles/hour`                               | Listed forms correct; `15 mph` rejected, bare number accepted.                                   |
| `unit-rates-2.json`; 15–23           | `$0.70` versus `$0.65`; 10-pack saves `$0.05/bottle` | Listed answers correct; parts admit false accepts; `10 pack, 5 cents per bottle` omitted.        |
| `ratio-tables-1.json`; 15–22         | White values `10`, then `15 cups`                    | Listed ordered forms correct; correct labeled sentences rejected.                                |
| `ratio-tables-2.json`; 17–29         | `16 minutes/mile`; 5 miles takes `80 minutes`        | Listed answers correct; parts fail to bind meanings or order.                                    |
| `double-number-lines-1.json`; 14–24  | `7 × 4 = 28 km`                                      | Listed answers correct; no actual number lines or labeled positions.                             |
| `double-number-lines-2.json`; 17–24  | `9/6 = 1.5 liters/tray`; `30/1.5 = 20 trays`         | Listed answers correct; proportional problem without representation evidence.                    |
| `percent-applications-1.json`; 17–24 | `0.35 × 240 = 84 visitors`                           | Final count checked; conversion/method not independently assessed.                               |
| `percent-applications-2.json`; 15–22 | `18/0.30 = 60 kg`                                    | Whole checked; independent part/whole or conversion representation unassessed.                   |

Decimal unit rates already occur. The gap is explicit non-complex fractional
unit-rate result and interpretation, not the absence of every fractional rate.

### Four candidates

Lines refer to `experiments/grade-6-math-v2/content-records-v2.json`.
Candidates are disconnected; observations concern compatibility with the
current matcher, not currently served learner scoring.

| Candidate; lines                          | Independent solution                                             | Validator/evidence observation                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `v2-ratio-language-art-supplies`; 14–25   | `4:6 = 2:3`, blue to green                                       | Listed answers correct; valid equivalent interpretation sentences excluded.                           |
| `v2-ratio-language-snack-mix`; 75–86      | Total `8 cups`; raisins to whole `3:8`                           | Contextual answers correct; requested bare ratio forms rejected.                                      |
| `v2-rate-table-and-unit-rate`; 136–179    | `9 miles/hour`; `(1,9)`, `(3,27)`, `(4,36)`                      | Answers correct; parts permit contradictions and exclude compact valid rows; hint line 209 exposes 9. |
| `v2-rate-percent-and-conversion`; 243–266 | Stated `1 quart = 4 cups`; `2 quarts = 8 cups`; `150% = 12 cups` | Answers correct; prompt requests final cups but parts require two worked clauses; `12 cups` rejected. |

## Findings

### R-1 — Major; high confidence — TR-3 crosses the grade boundary

- Evidence: plan line 184 requires a ratio of fractional quantities; source
  summary `docs/curriculum-sources.md:192` ambiguously says rates with fractions.
  Registered standard's non-complex-fraction restriction is not preserved.
- Smallest fix: original Claude executor corrects TR-3 and directly dependent
  gap statements using the wording above. Preserve D-73's stretch choice.
  Source-register wording correction needs an explicitly owned scope.

### R-2 — Major; high confidence — Parts accept incorrect answers

- Evidence: `unit-rates-2.json:23`, `ratio-tables-2.json:29`, matcher line 56.
  Static logic accepts `180, 16` (180 contains 80), exchanged meanings
  `16 minutes for 5 miles; 80 minutes per mile`, negation
  `The 10-pack is not cheaper by $0.05 per bottle`, and wrong difference
  `$0.0501 per bottle` with the required pack phrase.
- Smallest fix: retain separate RAT-SCORE design/implementation and versioned
  content path. Bind full values to fields/meanings and reject contradictions.
  IC-9 remains the owner's interim risk choice. No historical rescoring or
  weakened V-7 gate. Existing defect independently confirmed statically.

### R-3 — Major; high confidence — Prompt and graded contract diverge

- Evidence: public `ratio-language-2.json:15,21`; candidate file lines
  75/81 and 243/249/251. Requested explanation is unassessed; requested bare
  ratio and final cups are rejected by candidate accepted responses.
- Smallest fix: authorized new versions align prompt, evidence and validator;
  request every graded field and use reviewed structured/selected meaning
  responses. Candidate mismatches are additional reuse conditions.

### R-4 — Major; high confidence — Number-line evidence absent

- Evidence: `double-number-lines-1.json:15,17`, second item line 17 and skill
  record line 9. No aligned lines, positions or construction/completion task.
  Hints mentioning lines do not establish independent representation evidence.
- Smallest fix: retain arithmetic practice with this limitation; authorized
  new items satisfy TR-5/TR-6 representation/text-equivalent requirements.
  Owner separately dispositions skill-version/evidence compatibility.

### R-5 — Major; high confidence — Candidate hint leaks and misstates units

- Evidence: candidate table item lines 136/208/209 supplies requested rate 9
  and multiplies miles by hours rather than a rate by hours.
- Smallest fix: remove target rate from hint, ask learners to apply their own
  rate, use consistent units and recheck requested intermediate-answer leakage.

### R-6 — Minor; high confidence — Distractor rationale does not derive table

- Evidence: candidate lines 188/190. Reversed division gives `1/9 hour/mile`;
  mislabeling it as miles/hour does not yield distractor table `2,6,8`.
- Smallest fix: derive values from the named error or describe the actual
  combined errors in the converted item. Frozen experiment remains unchanged.

### R-7 — Minor; high confidence — Valid ratio spacing rejected

- Evidence: `ratio-language-1.json:17`, matcher line 19. `2 : 3` is valid
  but omitted and not normalized to the accepted colon form.
- Smallest fix: reviewed spacing forms in a new record or separately reviewed
  ratio normalization; preserve ordered quantities and simplest form.

## Reuse advice

| Candidate              | Suitability                                         | Required conditions                                                                                                           |
| ---------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Snack mix              | Strongest part-to-whole reuse candidate             | Align prompt/notation; new production identity and schema/misconception conversion.                                           |
| Art supplies           | Optional meaning item                               | Gradable contract admitting equivalent interpretations; ratio alone does not establish meaning.                               |
| Table and unit rate    | Conditional table practice                          | Repair hint/distractor/scoring, map standards to owning skill, review cyclist overlap. Shared context does not prove copying. |
| Percent and conversion | Model for separate tasks; conditional transfer item | Resolve dual-competency attribution, requested work and scoring; combined result does not isolate both competencies.          |

All four remain pending-review public experiments. New production identities,
derivation provenance, independent review and owner approval are required.
Public numbers/contexts and derivatives cannot provide held-out secrecy.

## Residual limits and next gate

- Plotting ratio-table pairs and comparing ratios lack explicit allocation in
  the five-skill/TR table. Resolve mapping before claiming complete A.3 coverage;
  this does not authorize more content or a sixth skill.
- Percent answers do not independently establish every conversion statement.
- Examples are not exhaustive notation policy or an adversarial test suite.
- No exhaustive originality review, actual historical item-author identity,
  learner evidence, private content or runtime reproduction was established.
- Plan's draft header is historical; acceptance is recorded in its completed
  packet/index. All IC-2–IC-9 and content/scoring/catalog/release gates remain.

Verification: source retrieval, independent mathematical derivations, narrow
static scorer/call-site reading, metadata, Git inspection and before/after
hashes. Integrator runs documentation checks only.

Next human gate: accept this advisory report and authorize a bounded original
Claude Code `forge-expert` / Opus document correction of TR-3/directly related
gap wording and the source-register boundary summary, then Codex review.
Content/scorer corrections require separately authorized packets.
