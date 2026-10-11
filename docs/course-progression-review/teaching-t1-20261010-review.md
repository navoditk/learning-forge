# Teaching T1 implementation review

Scope: disconnected catalog membership, delivery context, operation/served
binding and event-link schemas, plus computed-byte synthetic fixtures and
three pure test files. Authority: owner contract acceptance and D-139/D-142,
2026-10-10. No database, writer, route, content or release approval.

Sonnet `claude-sonnet-5.5`, actual runtime metadata for worker
`abde4c17-3bdf-44f2-b9d5-105bb85aa93d`, implemented six files in the isolated
worktree at `fd8fbbb`. GPT-6.1 Sol coordinator independently reviewed all six
files and the corrected schema/test scope. This is cross-family review.

Initial patch:
`ebd6f18c1c276bfd428e9fb66e3ce0bdd77f4e00776eec9cc4644bf1790bef22`.
Two coupled defects required correction: new references inherited trimming,
so exact bindings accepted padded identifiers/versions; JavaScript regex
end anchors allowed a trailing newline in an otherwise valid digest/identity.
Sonnet added pre-transform canonical checks, exact digest length and
regression cases. Existing RefSchema/ItemRefSchema semantics are unchanged.

Corrected reviewed patch:
`10ed72153464c8d21d80324075c037fae6d1d01a83d10887928567ce1585a7d0`.
Applied conflict-free after corrected-scope review.

## Evidence

| Command                                                                                                                                                    | Main worktree result                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npx vitest run tests/content/teaching-catalog.test.ts tests/progression/teaching-delivery-context.test.ts tests/progression/teaching-idempotency.test.ts` | 3 files, 79 tests passed                                                                                                            |
| `npm run verify`                                                                                                                                           | Passed: formatting, ESLint, TypeScript, down-migration presence, 85 test files / 1,641 tests including fake evals, production build |

No integration/browser/database/provider commands were needed or run.
Only teaching-delivery imports teaching-catalog in production source; no
application consumer imports either module. No barrel exports, production
catalog admission, policy/artifact changes or learner-state changes.

## Boundaries

Parsing checks shape and canonical identity/digest format, not byte truth,
household authorization, actual context/event association, database
uniqueness or immutability. Fixtures compute their own raw/canonical hashes;
they do not prove production manifest integrity or full no-assessment course
generality. The operation binding excludes canonical digest; the served
binding adds it, and any future replay must verify the served digest too.

No D-102 retry-window or D-138 acknowledgement runtime is implemented.
Event-link shape permits the two named event kinds without creating either.
Later T2 privacy/migration, T3 export/delete, T4 interlock/serving and real
authoring/release gates remain.

Verdict: **ready for human review** for approved T1 scope.
