import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  AccessPolicy,
  AccessPolicySchema,
  ProgressionPolicyProfile,
  ProgressionPolicyProfileSchema,
} from '../contracts/policy';

function readDirectory<T>(directory: string, schema: { parse(value: unknown): T }): T[] {
  const root = path.join(process.cwd(), directory);
  return readdirSync(root)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => schema.parse(JSON.parse(readFileSync(path.join(root, file), 'utf8'))));
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
