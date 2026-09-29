import { describe, expect, it } from 'vitest';

import { issueStepUpToken, verifyStepUpToken } from '../../src/auth/step-up';

const secret = 'fixture-secret-that-is-at-least-32-characters';
const claims = {
  userId: 'parent-1',
  householdId: 'household-1',
  issuedAt: new Date('2026-09-28T10:00:00Z'),
};

describe('step-up tokens (D-06)', () => {
  it('round-trips the issue time for the same user and household', () => {
    const token = issueStepUpToken(claims, secret);
    expect(verifyStepUpToken(token, secret, claims)).toEqual(claims.issuedAt);
  });

  it('rejects another user, another household, or another secret', () => {
    const token = issueStepUpToken(claims, secret);
    expect(verifyStepUpToken(token, secret, { ...claims, userId: 'parent-2' })).toBeUndefined();
    expect(
      verifyStepUpToken(token, secret, { ...claims, householdId: 'household-2' }),
    ).toBeUndefined();
    expect(verifyStepUpToken(token, `${secret}-rotated`, claims)).toBeUndefined();
  });

  it('rejects a tampered payload or signature and malformed input', () => {
    const token = issueStepUpToken(claims, secret);
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ ...claims, issuedAt: '2026-09-28T11:00:00.000Z' }),
    ).toString('base64url');
    expect(verifyStepUpToken(`${forged}.${signature}`, secret, claims)).toBeUndefined();
    expect(verifyStepUpToken(`${payload}.${signature}x`, secret, claims)).toBeUndefined();
    expect(verifyStepUpToken(`${token}.extra`, secret, claims)).toBeUndefined();
    expect(verifyStepUpToken(undefined, secret, claims)).toBeUndefined();
    expect(verifyStepUpToken('', secret, claims)).toBeUndefined();
  });

  it('fails closed without a strong secret', () => {
    expect(() => issueStepUpToken(claims, undefined)).toThrow('STEP_UP_SECRET_UNAVAILABLE');
    expect(() => issueStepUpToken(claims, 'short')).toThrow('STEP_UP_SECRET_UNAVAILABLE');
  });
});
