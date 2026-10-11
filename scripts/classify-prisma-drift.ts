import { readFileSync } from 'node:fs';

// Classifies `prisma migrate diff --from-migrations ... --script` output.
// A healthy diff is empty. Only the exact statements below (index renames on
// pre-T2a tables, already present before the teaching-delivery draft) are
// tolerated; any other statement is unexpected drift, and owned teaching
// objects are called out explicitly. Tolerating the baseline is optional:
// its absence is never a failure and its presence is never required.
export const KNOWN_BASELINE_DRIFT: readonly string[] = [
  [
    'ActiveAssessmentLease_target_idx',
    'ActiveAssessmentLease_learnerProfileId_kind_targetCode_targ_idx',
  ],
  [
    'AssessmentAssignment_learnerProfileId_target_idx',
    'AssessmentAssignment_learnerProfileId_targetCode_targetVers_idx',
  ],
  [
    'LearnerLessonState_learnerProfileId_lessonCode_lessonVersion_ke',
    'LearnerLessonState_learnerProfileId_lessonCode_lessonVersio_key',
  ],
  ['LearnerPlacement_program_idx', 'LearnerPlacement_learnerProfileId_programCode_createdAt_idx'],
  ['LearningEvent_skill_idx', 'LearningEvent_learnerProfileId_skillCode_occurredAt_idx'],
  ['OverrideRecord_target_idx', 'OverrideRecord_learnerProfileId_targetCode_targetVersion_idx'],
  ['ShadowDecision_divergence_idx', 'ShadowDecision_learnerProfileId_divergent_occurredAt_idx'],
  ['ShadowDecision_household_idx', 'ShadowDecision_householdId_occurredAt_idx'],
  ['SkipRecord_target_idx', 'SkipRecord_learnerProfileId_targetCode_targetVersion_idx'],
  ['UnlockGrant_target_idx', 'UnlockGrant_learnerProfileId_targetKind_targetCode_targetVe_idx'],
].map(([from, to]) => `ALTER INDEX "${from}" RENAME TO "${to}"`);

const OWNED_OBJECTS =
  /TeachingDeliveryContext|deliveryContextId|User_id_householdId_role_key|LearnerProfile_id_householdId_key/;

export interface DriftClassification {
  baseline: string[];
  unexpected: string[];
  owned: string[];
}

export function classifyPrismaDrift(script: string): DriftClassification {
  const statements = script
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const baseline: string[] = [];
  const unexpected: string[] = [];
  for (const statement of statements) {
    (KNOWN_BASELINE_DRIFT.includes(statement) ? baseline : unexpected).push(statement);
  }
  return { baseline, unexpected, owned: unexpected.filter((s) => OWNED_OBJECTS.test(s)) };
}

if (process.argv[1] && /classify-prisma-drift\.ts$/.test(process.argv[1])) {
  const input = readFileSync(0, 'utf8');
  if (input.trim() === '') {
    // Prisma always prints at least a comment; silence means the diff did not run.
    console.error('Prisma drift probe received no output from prisma migrate diff.');
    process.exit(1);
  }
  const result = classifyPrismaDrift(input);
  if (result.unexpected.length > 0) {
    if (result.owned.length > 0) {
      console.error('Teaching delivery objects drift from schema.prisma:');
      for (const statement of result.owned) console.error(`  ${statement}`);
    }
    console.error('Unexpected Prisma schema drift:');
    for (const statement of result.unexpected) console.error(`  ${statement}`);
    process.exit(1);
  }
  console.log(
    `Prisma drift probe: no unexpected drift (${result.baseline.length} known baseline index renames tolerated).`,
  );
}
