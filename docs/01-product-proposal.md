# Learning Forge: Product Proposal and Implementation Blueprint

**Positioning:** Adaptive, school-aligned learning with interactive AI tutoring  
**Initial MVP:** Grade 6 Math  
**First vertical slice:** Ratios and proportional reasoning

## Problem

A strong Grade 6 education still leaves three recurring needs:

1. A clear daily plan that complements school rather than duplicating it.
2. Deeper mathematical problem solving and sustained reading/writing practice.
3. Timely help that teaches reasoning instead of supplying answers.

Families currently assemble textbooks, contest materials, reading platforms, tutors, and spreadsheets. These tools rarely share a coherent student model.

## Proposed product

Learning Forge is a school-aligned enrichment platform that begins with Grade 6 Math and can later support additional subjects and grades. It:

- maps learning activities to standards and a local curriculum sequence;
- diagnoses mastery and misconceptions;
- chooses a manageable next activity;
- provides interactive, policy-controlled tutoring;
- adjusts mastery evidence based on assistance;
- schedules retrieval and spaced review;
- reports understandable evidence to parents.

## Users

- **Learner:** completes the plan, asks for help, reflects, and sees progress.
- **Parent:** configures goals/time, reviews evidence, and approves significant settings.
- **Content administrator (later):** curates standards, lessons, problems, rubrics, and eval sets.

## MVP scope

### Included

- One learner and one parent account
- Grade 6 Math: ratios/rates, rational numbers, expressions/equations, geometry, statistics
- Core, depth, and contest-style activity labels
- Initial diagnostic and skill-level mastery state
- Daily plan with 20–30 minute sessions
- Math Tutor and Contest Coach modes
- Graduated hints and assistance-aware scoring
- Parent weekly summary
- Content authoring through version-controlled seed files
- LLM-provider abstraction, audit traces, eval harness, and feature flags

### Excluded

- Replacing the school's curriculum or grading
- High-stakes placement decisions
- Open-ended web browsing by the child
- Social/community features
- Voice, photographed handwriting, native mobile apps
- Full ELA/Science/Social Studies implementation
- Multiple autonomous tutor agents

## Experience principles

- Productive struggle before explanation
- Short, consistent sessions over large workloads
- Evidence over opaque scores
- Mastery decay and retention checks, not one-time completion
- Original student work; the system critiques rather than authors it
- Parent visibility without surveillance
- Calm, age-appropriate, non-addictive interaction design

## Primary journey

1. Parent sets schedule and goal.
2. Learner completes a diagnostic.
3. Planner selects a mini-lesson, practice, and challenge.
4. Learner attempts independently.
5. Tutor provides the smallest useful intervention.
6. System records correctness, attempts, hints, confidence, and misconception tags.
7. Mastery updates and a review is scheduled.
8. Parent sees evidence and next steps.

## Outcomes and metrics

Learning:

- independent success rate on delayed checks;
- hint dependence over time;
- misconception recurrence;
- transfer to unfamiliar problems;
- writing/evidence rubric improvement in later phases.

Experience:

- weekly completion consistency;
- plan completion without excessive session length;
- learner-reported clarity and appropriate challenge;
- parent understanding of progress.

Safety/quality:

- answer-leakage rate;
- factual/math error rate;
- invalid structured-output rate;
- unsafe or age-inappropriate response rate;
- percentage of progress claims linked to evidence.

Do not optimize primarily for time in app, streak anxiety, or number of generated messages.

## Future expansion

Phase 2 adds Reading Tutor and Writing Coach. Phase 3 adds Science reasoning and Social Studies source analysis. The domain model should support multiple grades, curricula, and subjects, but the MVP should not implement them prematurely.
