/**
 * Security Rules Verification Spec for QuizRush (Dirty Dozen Adversarial Suite)
 * Matches rules in firestore.rules and invariants in security_spec.md.
 */

export const DIRTY_DOZEN_CASES = [
  {
    name: '1. Unauthenticated read of /users/u1',
    auth: null,
    operation: 'get',
    path: '/users/u1',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Cross-user PII read /users/u2 by u1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'get',
    path: '/users/u2',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Unverified email write to /users/u1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: false },
    operation: 'create',
    path: '/users/u1',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Admin role self-escalation /admins/u1 by non-admin u1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'create',
    path: '/admins/u1',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Non-admin reading /voucherStock to steal real codes',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'list',
    path: '/voucherStock',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Coin inflation cheat (>1500 coins in one write)',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'update',
    path: '/users/u1',
    payload: { coins: 999999 },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Shadow field injection (isAdmin: true) on /users/u1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'update',
    path: '/users/u1',
    payload: { isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Self-fulfilled redemption request on create',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'create',
    path: '/redemptionRequests/req1',
    payload: { status: 'fulfilled', voucherCode: 'FAKE-CODE-1234' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Identity spoofing on /redemptionRequests/req1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'create',
    path: '/redemptionRequests/req1',
    payload: { userId: 'u2' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Redemption without atomic user coin deduction',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'create',
    path: '/redemptionRequests/req1',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Tier cost mismatch (gp-100 for 10 coins)',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'create',
    path: '/redemptionRequests/req1',
    payload: { tierId: 'gp-100', amountInr: 100, costCoins: 10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Player mutating fulfilled redemption request',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    operation: 'update',
    path: '/redemptionRequests/req1',
    payload: { status: 'pending' },
    expected: 'PERMISSION_DENIED',
  },
] as const;
