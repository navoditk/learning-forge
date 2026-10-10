import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { parseSourceRegister, type SourceRegister } from './register-parser';

const REGISTER_PATH = ['docs', 'curriculum-sources.md'];

let cached: { mtimeMs: number; register: SourceRegister } | undefined;

/** Stable, path-free codes: raw fs or parser errors can carry absolute local paths into logs. */
export const SOURCE_REGISTER_UNAVAILABLE = 'SOURCE_REGISTER_UNAVAILABLE';
export const SOURCE_REGISTER_INVALID = 'SOURCE_REGISTER_INVALID';

/**
 * Reads the authoritative register from disk (no network) and caches the
 * projection until the file changes. Server-only: never import from a client
 * component. Fails closed with a stable error instead of an empty index.
 */
export function loadSourceRegister(): SourceRegister {
  let mtimeMs: number;
  let markdown: string | undefined;
  try {
    const file = path.join(process.cwd(), ...REGISTER_PATH);
    ({ mtimeMs } = statSync(file));
    if (!cached || cached.mtimeMs !== mtimeMs) markdown = readFileSync(file, 'utf8');
  } catch {
    throw new Error(SOURCE_REGISTER_UNAVAILABLE);
  }
  if (markdown !== undefined) {
    let register: SourceRegister;
    try {
      register = parseSourceRegister(markdown);
    } catch {
      throw new Error(SOURCE_REGISTER_INVALID);
    }
    if (register.sources.length === 0 || register.dossiers.length === 0) {
      throw new Error(SOURCE_REGISTER_INVALID);
    }
    cached = { mtimeMs, register };
  }
  return (cached as NonNullable<typeof cached>).register;
}
