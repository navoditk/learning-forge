# Decisions and Open Questions

## Approved defaults

- The product is named **Learning Forge** with the positioning line **Adaptive, school-aligned learning with interactive AI tutoring**.
- Grade 6 Math is the initial MVP rather than the permanent product boundary.
- Product complements school; it does not replace it.
- Initial user is one Grade 6 learner with a parent account.
- Grade 6 Math is the first full domain; ratios are the first vertical slice.
- Interactive tutoring is in the MVP.
- Tutor behavior is a deterministic policy state machine plus constrained model generation.
- Use a modular monolith and PostgreSQL.
- Use TypeScript/Next.js unless an early spike demonstrates a compelling alternative.
- Keep model provider replaceable.
- Preserve raw attempt evidence and version derived mastery.
- No open web, social features, voice, or handwriting in MVP.

## Resolve during Phase 0

1. Hosting and authentication provider after privacy/data-residency comparison.
2. Initial model providers and child-data contractual settings.
3. Whether the first pilot uses pseudonymous learner identity.
4. Exact ratios content license/provenance and review workflow.
5. Parent consent, export, deletion, and retention requirements.
6. Baseline tutor eval set size and release-severity taxonomy.
7. Accessibility accommodations required for the initial learner.
8. Monthly model budget and latency target.

## Experiments, not assumptions

- Assistance weights and mastery thresholds
- Optimal session length and weekly frequency
- Minimum genuine-attempt policy by problem type
- Learner preference for text, diagrams, or manipulatives
- Whether a separate Contest Coach label improves behavior/understanding
- Value of generated problems versus curated originals

## Deferred decisions

- Native mobile versus responsive web
- Multi-tenant school architecture
- Teacher dashboards
- Voice and handwriting recognition
- Fine-tuning
- Vector database/RAG platform
- Microservices and event streaming
- Multi-agent tutor orchestration
