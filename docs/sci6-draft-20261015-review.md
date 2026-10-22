# SCI6-DRAFT rev1 — independent curriculum review

## Recommendation and provenance

**Not ready for human review: one major R1 and one minor R2**, both in one
item's instructional guidance. All six answer keys/deterministic scoring are
correct. Fresh native forge-reviewer/gpt-6.1-sol,
`/root/sci6_draft_review`; actual model fixed by host role dispatch, no
override, fresh context. Curriculum-review skill applied. Read-only report
returned to integrator; no content status/approval/registration/release change.

Reviewed exact3skills/6practice records under D-168–D-174, live AWAITING_REVIEW
assignment. Actual author independently verified from minimal client metadata
agent-aabc289e543351b98.jsonl:177/177 assistant records claude-opus-5-5.
Base/main/author HEAD059c7f6f64374e0c37359a0e06e4e93185b7f62f.
Baseline manifest0ba2cacd08bbc773c4d6f3d7ab2d46f725e09b219b7ccf3985e580d459019890;
95/95baseline/author overlay verified. Scope6ddacf238a3ad905af62790fa49467f170c80fb14a3cbb5f6463aef0d359bf04.
Patch9d0ceccbce0826968dac775c22db0da5d76b3fbafa7157235968a4dd7d51f276;
freeze574a32cabf1d3742992a17604a2d5b042371208b3e648e2af7f611cf656e51d9,
18/18artifact hashes verified. Exactly9new files; targets absent from base and
baseline. Independent added-byte reconstruction equals final/author files.
Apply-check passes on main, no application. D-173 later human sign-off records
start conditions satisfied; reviewer does not approve that owner choice.

## SCI6-DRAFT-R1 — Major, high confidence

Frozen content/grade-6-science/sci6-cells-evidence-of-life-2.json:13,15,69–76
under common Git SCI6-DRAFT/draft-rev1/final/.
Classification guidance treats missing information as negative evidence.
Violates accurate strategy teaching in content-authoring-pipeline and approved
scope§3 prompt-answerability/hint progression.

ExampleB describes a leaf containing thousands of bounded units, without
observations of their intake/growth. Hint2 asks whether descriptions show
bounded units taking in materials and growing, then says if not the example
is not cellular. Following this rule literally makes B fail two required
checks and directs Not made of cells, while correct key is Many cells.
Final hint question again asks intake/growth facts; solutionMethod uses same
discriminator. Production-scoring probe confirms false-branch tuple
A onecell/B notcells/C notcells scores INCORRECT. Scorer is correct; guidance
can teach a wrong classification.

Minimal correction: align evidence/rule, either supply required observations
for B or revise guidance so omission is not negative evidence. Keep solution,
hints and text alternative consistent. Closure: walk all3examples through
rule using only supplied facts to reach existing correct categories, no
invented intake/growth observations or silence-as-negative. Recheck coupled
solution/hints/alternative/scoring.

## SCI6-DRAFT-R2 — Minor, high confidence

Same frozen file:81. Salt-crystal analogy says it grows in salty water but
"takes in nothing". Growing crystal gains material as dissolved material joins
its surface. Distinguish cellular organization/biological activity without
implying growth without added matter. Violates subject accuracy/valid analogy
requirements of curriculum-review/content-review/content-authoring-pipeline.

Minimal correction: accurately describe material attaching at crystal surface
and distinguish cellular growth with precise biology, preserving virtual
context. Closure: safe accurate analogy, no growth-without-matter implication,
no target-answer disclosure. Correct with R1 in one original-author pass.

Both are first-review findings. R1 prevents readiness; R2 belongs in same fix.

## Per-item independent correctness and coverage

Checked6items,11choice fields,40option occurrences; all prompts/solutions/
fields/options/keys independently evaluated.

| Record suffix            | Derived correct answer                                              | Review                                                                                                   |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| cells-evidence-of-life-1 | SampleB; bounded units with internal parts                          | Uniquely supports cellular evidence; repeating shapes/green/magnification alone insufficient.            |
| cells-evidence-of-life-2 | A onecell;B manycells;C notcells                                    | Keys correct; instructional R1/R2 above.                                                                 |
| cell-parts-functions-1   | Membrane controls entry/exit                                        | Selective passage matches model, rigid support is wall; all/nothing passage options contradict.          |
| cell-parts-functions-2   | Chloroplasts; onlyY has part                                        | Others shared; size/universal control unsupported.                                                       |
| cell-as-a-system-1       | Food declines, energy available to parts falls                      | Explicitly closed food supply supports chain; alternatives contradict roles/dependencies.                |
| cell-as-a-system-2       | Parts depend on each other; membrane intervention stops food-making | Intervention supports interdependence; labels/light/Run1growth weaker evidence, other claims contradict. |

All3skills match codes/versions/program/domain/standards/components/bands.
No prerequisite edges; supplied models need no undeclared earlier skill.
Misconception codes resolve; distractor rationales in self-audit. Mastery text
limits records to practice evidence; no whole-PE/model/investigation mastery.

## Source fidelity, safety, originality and accessibility

Independently opened [approved CDE integrated Grade6 standards](https://www.cde.ca.gov/ci/pl/documents/cangsspfintegrgr6.pdf)
and fetched bytes in memory:HTTP200,273251bytes,SHA-256
a625ee78899669870ee6167c572e30c1dfdde203cf0f49eb89a3d6c8e64f0bd7,
matching author pin. Partial MS-LS1-1 matches CA cellular-life/virus
clarification. MS-LS1-2 stays within whole-cell roles; membrane/wall only for
structure-function, no biochemistry. Full PEs include investigation/model
development not established by choices (printed95–97).

Checked18hints, ordered strategy/representation/analogy progression. Aside
from R1/R2 no verified invalid strategy or premature target answer. Transferable
criterion analogies appropriate for approved assistance; lexical avoidance
alone not proof. All records text-only; alternatives preserve model facts,
questions/options; no color/position/dragging dependency. No procedures,
specimen/chemicals/medical/accounts/embeds/tracking. No evidence of copied
source/figures/distinctive proprietary exercises; not exhaustive external
textbook/archive comparison. Reading-level heuristic is not validated
accessibility evidence; bacteria breadth not covered by partial increment.

## Independent validation and limits

Frozen scratch harness rerun against verified author baseline, cache disabled:
219checks/0failures; inspected implementation/9negative controls.
All79legal answer combinations through production evaluateStructuredSubmission:
zero disagreements, one accepted tuple per item. Nine identical author-worktree
files pass targeted Prettier; diff/apply checks pass. Initial Prettier against
.git matched no ignored files; subsequent correct9file check passed.
Pending drafts/unavailable skills excluded by publication projections.
Schema/catalog/scoring consistency does not establish instructional correctness.

No installs/edits/worktrees/agents/DB/paidprovider/fullsuite/browser/screenreader
sessions. Real Science tutor/thresholds/serializedpractice/unhinted encounters
and later release evidence remain disclosed gates/accepted scope limits.

## Next action

Original Claude forge-expert/Opus agent aabc289e543351b98 corrects R1/R2
together, retaining IDs/root causes/coupled changes/before-after/positive
controls, then refreezes exact9file patch/evidence. Same reviewer verifies
changed scope/original counterexamples/direct regressions, classifying further
findings under accountability. Human content acceptance/application,
registration/availability/teaching/release remain separate.

SWITCH TO Claude Code forge-expert/Opus — SCI6-DRAFT consolidated corrections.
