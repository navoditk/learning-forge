/**
 * Test support for RAT-SCORE-IMPL-PATHS assessment paths. Not a test file and
 * not content: synthetic in-memory banks only, no private package, no
 * learner data. Items use neutral labels and sentinel private text.
 */
import { AssessmentKind, ProgressionTargetKind } from '@prisma/client';

import { createInMemoryAssessmentStore } from '../../src/assessment/store';
import type { AssessmentContentItem } from '../../src/contracts/progression';
import type { StructuredValidator } from '../../src/contracts/content';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { resolvePolicyProfile } from '../../src/progression/policy';
import { SENTINELS } from '../phase1/structured-paths-support';

export const BANK_REF = { code: 'synthetic-structured-bank', version: '1.0.0' };

type BankItem = AssessmentContentItem & { hash: string };

const BASE = {
  role: 'assessment',
  skillRef: { code: 'ratio-language', version: '1.0.0' },
  mode: 'core',
  difficulty: 'foundational',
  standards: ['6.RP.A.1'],
  observableEvidence: ['Fills each labeled field.'],
  assessmentBankRef: BANK_REF,
  misconceptionCodes: [],
  provenance: { origin: 'original', licenseStatus: 'owned' },
  review: {
    status: 'reviewed',
    reviewer: 'synthetic reviewer',
    reviewedAt: '2026-01-01',
    originalityStatement: 'Original synthetic fixture.',
  },
  accessibilityNotes: 'Synthetic note: fields are labeled in text.',
  accessibleAlternative: 'Synthetic text alternative listing Quantity A and Quantity B.',
  itemReadinessRefs: [],
  solutionRepresentation: SENTINELS.solutionRepresentation,
  solutionMethod: SENTINELS.solutionMethod,
  forbiddenLeakagePatterns: [SENTINELS.leakage],
} as const;

export function structuredBankItem(id: string, validator: StructuredValidator): BankItem {
  return {
    ...BASE,
    id,
    version: '1.0.0',
    hash: `sha256:${id}`,
    title: `Synthetic structured assessment ${id}`,
    prompt: `Synthetic prompt for ${id}. Fill each labeled field.`,
    deterministicValidator: { ...validator, equivalenceNotes: SENTINELS.equivalenceNotes },
  } as unknown as BankItem;
}

export function legacyBankItem(id: string): BankItem {
  return {
    ...BASE,
    id,
    version: '1.0.0',
    hash: `sha256:${id}`,
    title: `Synthetic legacy assessment ${id}`,
    prompt: 'State the ratio.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: '2:3',
      acceptedAnswers: ['2:3'],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
  } as unknown as BankItem;
}

export function storeOf(items: BankItem[]) {
  return createInMemoryAssessmentStore([
    { ...BANK_REF, contentHash: 'sha256:synthetic-structured-bank', items },
  ]);
}

export async function createSyntheticAssignment(
  identity: { householdId: string; learnerProfileId: string },
  items: BankItem[],
  idempotencyKey: string,
  expiresAt = new Date(Date.now() + 600_000),
) {
  const artifacts = loadPolicyArtifacts();
  const profileRecord = artifacts.profiles.find(
    (profile) => profile.code === 'grade-6-math-default' && profile.version === '1.0.0',
  );
  if (!profileRecord) throw new Error('Grade 6 Math policy profile is missing');
  const accessPolicy = artifacts.accessPolicies.find(
    (policy) => policy.code === 'grade-6-math-access' && policy.version === '1.1.0',
  );
  const result = await createAssessmentAssignment(
    {
      ...identity,
      kind: AssessmentKind.LESSON_ASSESSMENT,
      targetKind: ProgressionTargetKind.LESSON,
      targetRef: { code: 'ratio-language-lesson', version: '1.0.0' },
      bankRef: BANK_REF,
      policyProfileRef: { code: 'grade-6-math-default', version: '1.0.0' },
      policyProfileHash: 'sha256:synthetic-policy',
      algorithmVersion: 'synthetic-1',
      curriculumSnapshotHash: 'sha256:synthetic-structured-bank',
      itemsPerAttempt: items.length,
      requiredCount: 1,
      expiresAt,
      idempotencyKey,
      shadow: {
        requestKind: 'synthetic-structured-assignment',
        activityKind: 'LESSON_ASSESSMENT',
        accessPolicy,
        policyProfile: resolvePolicyProfile(profileRecord),
        skillCodes: ['ratio-language'],
        prerequisiteSkillCodes: { 'ratio-language': [] },
      },
    },
    storeOf(items),
  );
  const session = result.assignment.sessions[0];
  if (!session) throw new Error('Assessment session was not created');
  return {
    assignmentId: result.assignment.id,
    sessionId: session.id,
    assignment: result.assignment,
  };
}
