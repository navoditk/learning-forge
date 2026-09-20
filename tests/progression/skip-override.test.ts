import { describe, expect, it } from 'vitest';

import {
  beginOverrideWork,
  reevaluateRevokedOverride,
  revokeOverride,
} from '../../src/progression/skip-override';

describe('override state transitions', () => {
  it('retains the override while work begins', () => {
    expect(
      beginOverrideWork({
        completionStatus: 'AVAILABLE',
        overrideStatus: 'UNLOCKED_BY_OVERRIDE',
      }),
    ).toEqual({ completionStatus: 'IN_PROGRESS', overrideStatus: 'UNLOCKED_BY_OVERRIDE' });
  });

  it.each([
    ['AVAILABLE', true, 'AVAILABLE'],
    ['IN_PROGRESS', false, 'LOCKED'],
    ['COMPLETE', false, 'COMPLETE'],
    ['COMPLETE_BY_SKIP', false, 'COMPLETE_BY_SKIP'],
  ] as const)(
    'revokes %s without erasing completed work',
    (completionStatus, satisfied, expected) => {
      expect(
        revokeOverride({ completionStatus, overrideStatus: 'UNLOCKED_BY_OVERRIDE' }, satisfied),
      ).toEqual({ completionStatus: expected, overrideStatus: 'OVERRIDE_REVOKED' });
    },
  );

  it('clears a revoked override only after the gate is satisfied', () => {
    expect(
      reevaluateRevokedOverride(
        { completionStatus: 'LOCKED', overrideStatus: 'OVERRIDE_REVOKED' },
        false,
      ),
    ).toEqual({ completionStatus: 'LOCKED', overrideStatus: 'OVERRIDE_REVOKED' });
    expect(
      reevaluateRevokedOverride(
        { completionStatus: 'LOCKED', overrideStatus: 'OVERRIDE_REVOKED' },
        true,
      ),
    ).toEqual({ completionStatus: 'AVAILABLE', overrideStatus: 'NONE' });
  });
});
