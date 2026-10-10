# Progression implementation review

Independent, read-only review of one approved progression increment against
its specification and named acceptance tests. Start at
`docs/course-progression-handoff.md`, then read the approved stage, decision
values, and manual gate record. Follow `docs/agent-orchestration.md` for
verified executor/reviewer models; a design review is not implementation review.

## Review packet and procedure

Require a pinned commit/patch, named stage, approved inputs, owned files,
claimed commands/results, and actual executor identity. If scope or identity
is unknown, report a blocked gate, not a compliant review.

Re-derive the changed code paths. Verify domain contracts and state transitions,
household/learner scoping, version pinning, immutability versus deletion,
content archival, deterministic scoring/assistance, mastery aggregation,
assessment binding/expiry/idempotency, server-side authorization, and held-out
exclusion surfaces. Test failures and boundary cases, not just happy paths.
Confirm compatibility for other programs and absence of policy constants in
content/UI. Verify shadow stages enforce nothing and C4 atomicity is preserved.

Check evidence against the stage's named tests: DB-free `npm run verify`,
synthetic `npm run test:integration`, `npm run test:migrations` for migrations,
`npm run test:e2e` for user-facing behavior, and `npm run eval:run` for tutor
copy. Run only relevant authorized synthetic commands; report unavailable
database/browser prerequisites and do not fabricate results or use production.
Read migration down scripts, retention and export coverage, and rollback
semantics. Ensure new tests are actually selected by repository scripts.

Review cannot change code, select new product thresholds, authorize cutover,
mark content approved, or use learner data with an external judge. Changed
findings return to the implementer, then the changed patch is reviewed again.

## Result

Record actual models/families, independence status, revision, scope,
commands/results, and findings with blocker/major/minor severity, confidence,
file/line, violated approved contract, concrete evidence, and smallest safe
fix. Separate verified defects, missing evidence, and residual risks.

End with `not ready for human review`, `ready for human review with noted risks`,
or `ready for human review`. A reviewer recommendation is not approval.
Critical progression authorization/scoring/privacy changes require cross-family
review even when the executor uses a single-provider client.
