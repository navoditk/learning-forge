import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  AccessPolicy,
  AccessPolicySchema,
  ProgressionPolicyProfile,
  ProgressionPolicyProfileSchema,
} from '../contracts/policy';
import { resolvePolicyProfile } from './policy';

function readDirectory<T>(directory: string, schema: { parse(value: unknown): T }): T[] {
  const root = path.join(process.cwd(), directory);
  return readdirSync(root)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => schema.parse(JSON.parse(readFileSync(path.join(root, file), 'utf8'))));
}

/** Resolves a pinned profile reference, failing closed when it is absent. */
export function resolvePinnedPolicyProfile(ref: {
  code: string;
  version: string;
}): ProgressionPolicyProfile {
  const { profiles } = loadPolicyArtifacts();
  const profile = profiles.find(
    (candidate) => candidate.code === ref.code && candidate.version === ref.version,
  );
  if (!profile) throw new Error('POLICY_PROFILE_UNRESOLVABLE');
  return resolvePolicyProfile(
    profile,
    new Map(profiles.map((candidate) => [`${candidate.code}@${candidate.version}`, candidate])),
  );
}

export function loadPolicyArtifacts(): {
  profiles: ProgressionPolicyProfile[];
  accessPolicies: AccessPolicy[];
} {
  return {
    profiles: readDirectory('policy/progression-profiles', ProgressionPolicyProfileSchema),
    accessPolicies: readDirectory('policy/access-policies', AccessPolicySchema),
  };
}
