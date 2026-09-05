# System Architecture

## Architectural choice

Use a modular monolith for the MVP: one deployable web application with explicit domain modules and background jobs. This keeps iteration, transactions, local development, and testing straightforward while retaining seams for later extraction.

## Recommended stack

- Web: Next.js + TypeScript
- UI: React with an accessible component system
- Database: PostgreSQL
- ORM/migrations: Prisma
- Validation: Zod
- Authentication: managed provider with parent/child account linking
- Background jobs: database-backed queue initially
- AI: provider-neutral `TutorModel` interface
- Tests: Vitest + Testing Library + Playwright
- Observability: OpenTelemetry-compatible traces plus privacy-filtered application events
- Deployment: a managed Node/PostgreSQL platform selected after MVP validation

## Modules

| Module | Responsibility |
|---|---|
| Identity | Parent/learner relationships, consent, roles |
| Curriculum | Standards, skills, prerequisites, versions |
| Content | Lessons, problems, solutions, rubrics, provenance |
| Assessment | Attempts, deterministic scoring, rubric scoring |
| Student Model | Mastery, misconceptions, uncertainty, review due dates |
| Planner | Selects next learning activities under time/goal constraints |
| Tutor | Policy state machine, context assembly, model adapter, response validation |
| Reporting | Evidence-linked learner and parent views |
| Evaluation | Offline cases, regression runs, release gates |
| Audit | Model/policy/content versions and privacy-filtered traces |

## Tutor request flow

1. Accept learner message and problem/attempt context.
2. Load only relevant skills, misconception hypotheses, and tutor policy.
3. Determine allowed intervention level with deterministic code.
4. Ask model for a structured tutor move—not arbitrary free-form control.
5. Validate schema, mathematical correctness where possible, leakage, tone, and policy compliance.
6. Repair once or fall back to a curated response.
7. Persist the move, assistance level, versions, and trace metadata.

The model may phrase a pedagogical move; it does not decide authorization, mastery transitions, or data access.

## Provider interface

The application should own a narrow interface such as:

```ts
interface TutorModel {
  generateMove(input: TutorMoveInput): Promise<TutorMoveOutput>;
  scoreConstructedResponse(input: ScoringInput): Promise<ScoringOutput>;
}
```

Use schemas and provider adapters. Avoid provider-specific objects outside the adapter.

## Content format

Store authored seed content in version-controlled JSON/YAML validated at import. Production records include provenance, license status, reviewer, version, difficulty, skill mapping, solution method, common wrong answers, and approved hint ladder.

## Deployment stages

- Local: seeded PostgreSQL, fake model adapter
- Preview: managed database, sandbox model credentials, synthetic learner data
- Production pilot: invite-only, one family, encrypted backups, monitoring and rollback

## Architecture decision records

Create `docs/adr/NNNN-title.md` for consequential choices. Each ADR records context, decision, alternatives, consequences, and reversal signals.
