# QuizRush Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Owner & Admin Isolation on `/users/{userId}`**: Only the verified owner (`request.auth.uid == userId`) or an authorized admin can read or write `/users/{userId}`. Non-admins cannot `list` the `/users` collection to prevent PII (`email`) scraping.
2. **Bounded Coin Progression**: Players cannot inflate their wallet balance in a single fraudulent write (`coins - existing.coins <= 1500` per update, and `totalEarnedCoins` cannot jump disproportionately). When redeeming a voucher, `/users/{userId}` must deduct the exact `costCoins` of the matching `tierId` (`gp-10`: 10000, `gp-25`: 24000, `gp-50`: 47500, `gp-100`: 92000) in an atomic batch with `/redemptionRequests/{requestId}`.
3. **Zero Client Self-Fulfillment**: When a player creates a `/redemptionRequests/{requestId}`, `status` MUST be `'pending'`, `voucherCode` MUST be absent or `null`, and `userId` MUST equal `request.auth.uid`. Only an authorized admin can transition `status` to `'fulfilled'` or `'rejected'` and set `voucherCode`.
4. **Secret Stock Protection (`/voucherStock/{voucherId}`)**: Only verified admins (`isAdmin()`) may `read`, `list`, `create`, `update`, or `delete` `/voucherStock`. Players can never read unclaimed real Google Play codes.
5. **Terminal State Locking**: Once a `/redemptionRequests/{requestId}` reaches `'fulfilled'` or `'rejected'`, non-admins cannot modify or delete it.
6. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must match `request.time`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read of `/users/u1`**: `auth: null` -> Denied.
2. **Cross-user PII read `/users/u2` by `u1`**: `auth.uid: 'u1'` -> Denied.
3. **Unverified email write to `/users/u1`**: `email_verified: false` -> Denied.
4. **Admin role self-escalation `/admins/u1` by non-admin `u1`**: `auth.uid: 'u1'` -> Denied.
5. **Non-admin reading `/voucherStock` to steal real codes**: `auth.uid: 'u1'` -> Denied.
6. **Coin inflation cheat on `/users/u1`**: `{ coins: 999999 }` -> Denied (delta > 1500).
7. **Shadow field injection on `/users/u1`**: `{ ..., isAdmin: true }` -> Denied (`hasOnly` check).
8. **Self-fulfilled redemption request on create**: `{ userId: 'u1', status: 'fulfilled', voucherCode: 'FAKE-1234' }` -> Denied.
9. **Identity spoofing on `/redemptionRequests/r1`**: `{ userId: 'u2', ... }` by `u1` -> Denied.
10. **Redemption without atomic balance deduction**: Creating `/redemptionRequests/r1` without deducting `costCoins` from `/users/u1` -> Denied (`getAfter` invariant).
11. **Tier cost mismatch on redemption**: `{ tierId: 'gp-100', amountInr: 100, costCoins: 10 }` -> Denied.
12. **Mutating fulfilled `/redemptionRequests/r1` by player `u1`**: `{ status: 'pending' }` -> Denied.
