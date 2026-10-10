import { beforeEach, describe, expect, it, vi } from 'vitest';

const fsMock = vi.hoisted(() => ({
  statSync: vi.fn(),
  readFileSync: vi.fn(),
}));
vi.mock('node:fs', () => fsMock);

describe('loadSourceRegister failure handling', () => {
  beforeEach(() => {
    vi.resetModules();
    fsMock.statSync.mockReset();
    fsMock.readFileSync.mockReset();
  });

  it('turns a filesystem error into a stable path-free error', async () => {
    fsMock.statSync.mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory, stat '/Users/someone/private/x.md'");
    });
    const { loadSourceRegister } = await import('../../src/sources/register.server');
    let caught: Error | undefined;
    try {
      loadSourceRegister();
    } catch (error) {
      caught = error as Error;
    }
    expect(caught?.message).toBe('SOURCE_REGISTER_UNAVAILABLE');
    expect(String(caught?.message)).not.toMatch(/\/Users|ENOENT/);
    expect((caught as { cause?: unknown }).cause).toBeUndefined();
  });

  it('fails closed with a stable error for an empty or unrecognised register', async () => {
    fsMock.statSync.mockReturnValue({ mtimeMs: 1 });
    fsMock.readFileSync.mockReturnValue('# nothing here\n');
    const { loadSourceRegister } = await import('../../src/sources/register.server');
    expect(() => loadSourceRegister()).toThrow('SOURCE_REGISTER_INVALID');
  });
});
