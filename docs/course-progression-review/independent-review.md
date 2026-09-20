# Independent fourth-draft / C1–C3 review

**Status:** TEMPLATE — not an approval

## Reviewer record

- Reviewer:
- Organization/role:
- Review date (UTC):
- Repository commit reviewed:
- Environment/build identifier:
- Independence statement (not an implementer or approver for this change):

## Scope and evidence

Record the exact versions or commit digests reviewed. Do not paste private
assessment items or learner data.

- `docs/course-progression-handoff.md`:
- `docs/course-progression-architecture.md`:
- `docs/course-progression-decisions.md`:
- `docs/adr/0013-course-progression-structure.md`:
- `AGENTS.md`:
- Automated command outputs:
  - `npm run verify`:
  - `npm run test:integration`:
  - `npm run test:migrations`:
  - `npm run test:e2e`:
  - `npm run eval:run` (if applicable):

## Required review claims

For each row, write evidence and classify the result as `blocker`, `major`,
`minor`, or `none`. A related test is not enough; identify what would falsify
the claim.

| Claim | Result | File/line or command evidence | Finding / smallest safe remediation |
|---|---|---|---|
| U1–U6: core progression contracts and state transitions are implemented as specified | | | |
| U28–U31: authorization, versioning, evidence, and rollout boundaries hold | | | |
| C1 tables are covered by export/deletion/retention behavior before writes | | | |
| C3 dual-write is non-enforcing and cannot change learner authorization | | | |
| Shadow records contain no learner free text, prompts, or answers | | | |
| C4 expand/drain/reject-residue/contract/enforce/remove-bypass order is safe | | | |
| Open decisions are not silently replaced by implementation defaults | | | |
| Every architecture §16 claim has a falsifying automated test | | | |
| `AGENTS.md` constraints are satisfied | | | |

## Findings

### Blocker

- Finding:
- File and line:
- Evidence:
- Smallest safe remediation:

### Major

- Finding:
- File and line:
- Evidence:
- Smallest safe remediation:

### Minor

- Finding:
- File and line:
- Evidence:
- Smallest safe remediation:

## Recommendation

Choose exactly one and explain why:

- `approve for C4 review` — no blocker/major findings and all required
  evidence is present; this is not authorization to cut over.
- `approve with conditions` — list each condition and owner; no condition may
  weaken a hard gate.
- `do not approve` — list the blockers and the smallest safe remediations.

Reviewer signature:

Product/content owner acknowledgement:

