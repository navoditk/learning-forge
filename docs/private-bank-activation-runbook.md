# Private bank merge and activation runbook (owner)

Status: prepared by the integrator under D-360. It authorizes nothing by itself. Every step marked
**OWNER** stays with the owner (D-212, D-334, D-339, D-353, D-360). No command below installs anything on a
server, sets a production environment variable, deploys or touches production data.

## 0. What is ready

| Unit                                  | Reviewed private package (outside the repository)       | Committed public metadata                      | Banks | Decision     |
| ------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- | ----- | ------------ |
| Statistics `statistics@2.0.0`         | `~/learning-forge-private-drafts/stat6-rev2-reviewed/`  | `src/curriculum/statistics-bank-metadata.json` | 10    | D-343, D-349 |
| Spelling `snsb6-word-structure@1.0.0` | `~/learning-forge-private-drafts/spell6-rev5-reviewed/` | `src/curriculum/spelling-bank-metadata.json`   | 13    | D-359        |
| Geometry `geometry@2.0.0`             | `~/learning-forge-private-drafts/geo6-rev3-reviewed/`   | `src/curriculum/geometry-bank-metadata.json`   | 13    | D-358        |

The reviewed digests are already committed (D-362). Dry-runs on 2026-11-20 against a local Ratios-only package
passed every per-bank check (file hash against the manifest, committed digest, content recompute) and the D-216a
and D-216b non-reuse checks (Statistics 165 incoming items, Spelling and Geometry 189 each, against 810 public
records including 597 historical blobs). The only failing check was the last one,
`merged package passes schema, integrity and required-bank rules`, because the local base package did not
contain the four Ratios `1.0.0` banks that the current selection requires. That is expected: the merge needs
**your real current package** as its base.

## 1. Merge, in activation order (OWNER)

Each merge reads the existing package and writes a **new** file (mode 0600); it never modifies the package in
place and never prints item text. Run each as a dry-run first (`--dry-run`), then without it. Chain the outputs:
Statistics first, then Spelling on top of its output, then Geometry on top of that.

```sh
P=~/learning-forge-private-drafts
BASE=<path to your real current private assessment package>   # the file the server mounts today

# 1. Statistics (10 banks)
npx tsx scripts/private-bank-merge.ts --package "$BASE" \
  --drafts $P/stat6-rev2-reviewed/banks-reviewed \
  --manifest $P/stat6-rev2-reviewed/banks-reviewed.sha256 \
  --bank-metadata src/curriculum/statistics-bank-metadata.json \
  --out $P/merged/package-1-statistics.json --practice-check --dry-run

# 2. Spelling (13 banks), on the Statistics output
npx tsx scripts/private-bank-merge.ts --package $P/merged/package-1-statistics.json \
  --drafts $P/spell6-rev5-reviewed/banks-reviewed \
  --manifest $P/spell6-rev5-reviewed/banks-reviewed.sha256 \
  --bank-metadata src/curriculum/spelling-bank-metadata.json \
  --out $P/merged/package-2-spelling.json --practice-check --dry-run

# 3. Geometry (13 banks), on the Spelling output
npx tsx scripts/private-bank-merge.ts --package $P/merged/package-2-spelling.json \
  --drafts $P/geo6-rev3-reviewed/banks-reviewed \
  --manifest $P/geo6-rev3-reviewed/banks-reviewed.sha256 \
  --bank-metadata src/curriculum/geometry-bank-metadata.json \
  --out $P/merged/package-3-geometry.json --practice-check --dry-run
```

Remove `--dry-run` for the real run of each step; the next step's `--package` must be the previous real output.
The dry-run of steps 2 and 3 needs the previous step's real output to exist. The repository must be a full
clone (the D-216 history check refuses a shallow one). Expect `RESULT: PASS`. A failure prints a fixed check
name and a code only.

Caveat: the chained merges (steps 2 and 3 on a package that already carries other units' banks) have not been
exercised, because the integrator does not have your base package. If step 2 or 3 fails the final integrity
check, stop and report the check name; do not edit the metadata.

## 2. Install (OWNER only, not done)

Installing the merged package on a server and setting `LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`
(`src/assessment/private-package-store.ts`) is a production action. Do it only after step 1 passes and in the order
of section 3. Installing before the selection flip is safe: banks of units introduced by a later program
version are optional (the pending-bank rule), so a package that carries them still loads.

## 3. Activation order per unit (after the merge and install)

1. Stamp the unit and its lessons (and, for Spelling and Geometry, the 13 banks): they are `pending_review`
   today, so a selection flip reports `NOT_REVIEWED`. Statistics banks are already reviewed.
2. Review the public practice drafts, then pin them in each lesson's practice refs and hashes (Statistics 12,
   Spelling 22, Geometry 16). Re-pin Spelling lessons to the accepted `content-2` corrections.
3. Spelling only, before the flip (D-361): implement the evidence labels and the parent wording that treat
   explanation-by-selection as partial evidence.
4. Flip the active selection (`src/curriculum/grade-6-math-active-selection.json` for Math, the Spelling entry for
   Spelling) and update the tests that pin the previous version. Statistics (`1.2.0`) comes before or with
   Geometry (`1.3.0`).
5. Mounted e2e, the manual accessibility pass, the release record, deploy: OWNER.

Rollback: revert the selection commit; the package stays loadable because the new banks are optional once the
selection no longer names their units.

## 4. Held activation patches (prepared, reviewed, NOT applied; D-366, D-367, D-368)

The three activations exist as patch files under `.git/agent-handoffs/` on the integrator's machine (they are not in the
repository). Apply them to a clean `main` checkout, in this order, only after sections 1 and 2 and the accessibility pass:

```sh
git apply --index .git/agent-handoffs/ACTIVATE-STAT/rev3/patch.diff     # Statistics, flips the selection to 1.2.0
git apply --index .git/agent-handoffs/ACTIVATE-GEO/rev1/patch.diff      # Geometry, flips the selection to 1.3.0
git apply --index .git/agent-handoffs/ACTIVATE-SPELL/rev3/patch.diff    # Spelling, flips scripps-spelling-bee-6 to 1.1.0
```

Expected SHA-256: Statistics `96db072c53bf...f762`, Geometry `0084d1333bb5...0625`, Spelling `5f1d5555aafc...862b`.
Each is a unit of activation: apply one at a time if you want to activate in stages (Geometry needs Statistics; Spelling is
independent of Geometry in behavior but its tests assume both). Before pushing, run `npm run verify`, `npm run
test:integration` and `npm run test:e2e`. Registered content is immutable per `id@version` (`npm run db:deploy` runs
`content:archive`), so never edit a registered content file in place; reviewed versions are new `content-2` files.
Spelling additionally needs your G-SOURCE screening first: its patch registers 22 records that contain real words.
