import { User, updateProfile } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_ECONOMY, REFERRAL_REWARD_COINS, VOUCHER_TIERS } from '../data/questions';
import { BOOTSTRAP_ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
  AdminPlayerSummary,
  CategoryId,
  EconomyConfig,
  LeaderboardEntry,
  QuizLanguage,
  RedemptionRequest,
  SponsorConfig,
  UserProgress,
  VoucherAvailability,
  VoucherStockItem,
  VoucherTier,
  VoucherTierId,
} from '../types/quiz';

function toMillis(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  return Date.now();
}

function sanitizeDisplayName(
  name: string | null | undefined,
  email: string | null | undefined,
  phone: string | null | undefined
): string {
  const candidate = (
    name ||
    email?.split('@')[0] ||
    (phone ? `Player ${phone.slice(-4)}` : 'Player')
  ).trim();
  return candidate.slice(0, 80) || 'Player';
}

export function generateUserReferralCode(uid: string): string {
  let hash = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    hash ^= uid.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  let n = Math.abs(hash) >>> 0;
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + i * 7 + (uid.charCodeAt(i % uid.length) || 3);
  }
  return `QR${suffix}`;
}

export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (user.emailVerified && user.email === BOOTSTRAP_ADMIN_EMAIL) return true;
  const path = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

const ensureInFlight = new Map<string, Promise<void>>();

export async function ensureUserProfile(user: User, preferredName?: string): Promise<void> {
  const existingPromise = ensureInFlight.get(user.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const run = (async () => {
    const path = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    const isPhoneUser = Boolean(user.phoneNumber && !user.emailVerified);
    const authProvider: 'google' | 'phone' = isPhoneUser ? 'phone' : 'google';
    const emailVal = authProvider === 'google' ? (user.email || '').slice(0, 120) : '';
    const phoneVal = authProvider === 'phone' ? (user.phoneNumber || '').slice(0, 25) : '';

    const resolvedName = sanitizeDisplayName(
      preferredName || user.displayName,
      user.email,
      user.phoneNumber
    );

    if (preferredName && preferredName.trim() && user.displayName !== preferredName.trim()) {
      try {
        await updateProfile(user, { displayName: resolvedName });
      } catch {
        // Ignore profile sync error
      }
    }

    try {
      const snap = await getDoc(userRef);
      let referralCode = generateUserReferralCode(user.uid);

      if (!snap.exists()) {
        // Guard against rare referral code hash collision
        const existingCodeSnap = await getDoc(doc(db, 'referralCodes', referralCode));
        if (existingCodeSnap.exists() && existingCodeSnap.data().ownerUid !== user.uid) {
          const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || '9X';
          referralCode = `${referralCode}${suffix}`.slice(0, 16);
        }

        const refCodeDoc = doc(db, 'referralCodes', referralCode);
        const batch = writeBatch(db);
        batch.set(userRef, {
          uid: user.uid,
          displayName: resolvedName,
          email: emailVal,
          phoneNumber: phoneVal,
          authProvider,
          coins: 0,
          totalEarnedCoins: 0,
          roundsPlayed: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          bestStreak: 0,
          referralCode,
          referredBy: null,
          referralCount: 0,
          lastDailyBonusDate: null,
          lastSpinDate: null,
          dailyRoundsDate: null,
          dailyRoundsCount: 0,
          categoryStats: {
            gk: { played: 0, correct: 0 },
            cricket: { played: 0, correct: 0 },
            tech: { played: 0, correct: 0 },
            brain: { played: 0, correct: 0 },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        batch.set(refCodeDoc, {
          code: referralCode,
          ownerUid: user.uid,
          ownerName: resolvedName,
          createdAt: serverTimestamp(),
        });

        await batch.commit();

        await setDoc(doc(db, 'leaderboard', user.uid), {
          uid: user.uid,
          displayName: resolvedName,
          totalEarnedCoins: 0,
          bestStreak: 0,
          roundsPlayed: 0,
          updatedAt: serverTimestamp(),
        });
      } else {
        const existingData = snap.data();
        const existingCode = (existingData.referralCode as string) || referralCode;
        const codeSnap = await getDoc(doc(db, 'referralCodes', existingCode));
        if (!codeSnap.exists()) {
          await setDoc(doc(db, 'referralCodes', existingCode), {
            code: existingCode,
            ownerUid: user.uid,
            ownerName: (existingData.displayName as string) || resolvedName,
            createdAt: serverTimestamp(),
          });
        }

        const lbSnap = await getDoc(doc(db, 'leaderboard', user.uid));
        if (!lbSnap.exists()) {
          await setDoc(doc(db, 'leaderboard', user.uid), {
            uid: user.uid,
            displayName: String(existingData.displayName || resolvedName),
            totalEarnedCoins: Number(existingData.totalEarnedCoins ?? 0),
            bestStreak: Number(existingData.bestStreak ?? 0),
            roundsPlayed: Number(existingData.roundsPlayed ?? 0),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })();

  ensureInFlight.set(user.uid, run);
  try {
    await run;
  } finally {
    ensureInFlight.delete(user.uid);
  }
}

export function subscribeUserProfile(
  uid: string,
  soundEnabled: boolean,
  language: QuizLanguage,
  quizzesSinceAd: number,
  onData: (progress: UserProgress) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      onData({
        displayName: String(d.displayName ?? 'Player'),
        email: String(d.email ?? ''),
        phoneNumber: String(d.phoneNumber ?? ''),
        authProvider: (d.authProvider as 'google' | 'phone') ?? 'google',
        coins: Number(d.coins ?? 0),
        totalEarnedCoins: Number(d.totalEarnedCoins ?? 0),
        roundsPlayed: Number(d.roundsPlayed ?? 0),
        totalQuestions: Number(d.totalQuestions ?? 0),
        totalCorrect: Number(d.totalCorrect ?? 0),
        bestStreak: Number(d.bestStreak ?? 0),
        referralCode: String(d.referralCode ?? generateUserReferralCode(uid)),
        referredBy: (d.referredBy as string | null) ?? null,
        referralCount: Number(d.referralCount ?? 0),
        lastDailyBonusDate: (d.lastDailyBonusDate as string | null) ?? null,
        lastSpinDate: (d.lastSpinDate as string | null) ?? null,
        dailyRoundsDate: (d.dailyRoundsDate as string | null) ?? null,
        dailyRoundsCount: Number(d.dailyRoundsCount ?? 0),
        categoryStats: {
          gk: d.categoryStats?.gk ?? { played: 0, correct: 0 },
          cricket: d.categoryStats?.cricket ?? { played: 0, correct: 0 },
          tech: d.categoryStats?.tech ?? { played: 0, correct: 0 },
          brain: d.categoryStats?.brain ?? { played: 0, correct: 0 },
        },
        soundEnabled,
        language,
        quizzesSinceAd,
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function syncLeaderboardEntry(
  uid: string,
  displayName: string,
  totalEarnedCoins: number,
  bestStreak: number,
  roundsPlayed: number
): Promise<void> {
  const path = `leaderboard/${uid}`;
  try {
    await setDoc(doc(db, 'leaderboard', uid), {
      uid,
      displayName: displayName.trim().slice(0, 80) || 'Player',
      totalEarnedCoins: Math.max(0, Math.floor(totalEarnedCoins)),
      bestStreak: Math.max(0, Math.floor(bestStreak)),
      roundsPlayed: Math.max(0, Math.floor(roundsPlayed)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeLeaderboard(
  onData: (entries: LeaderboardEntry[]) => void
): () => void {
  const path = 'leaderboard';
  const q = query(
    collection(db, 'leaderboard'),
    where('totalEarnedCoins', '>=', 0),
    orderBy('totalEarnedCoins', 'desc'),
    limit(25)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows: LeaderboardEntry[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: String(d.uid ?? docSnap.id),
          displayName: String(d.displayName ?? 'Player'),
          totalEarnedCoins: Number(d.totalEarnedCoins ?? 0),
          bestStreak: Number(d.bestStreak ?? 0),
          roundsPlayed: Number(d.roundsPlayed ?? 0),
        };
      });
      onData(rows);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeSponsorConfig(
  onData: (config: SponsorConfig | null) => void
): () => void {
  const path = 'sponsorConfig/active';
  return onSnapshot(
    doc(db, 'sponsorConfig', 'active'),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      onData({
        badgeText: String(d.badgeText ?? 'SPONSOR BREAK'),
        title: String(d.title ?? 'QuizBoost Daily Challenge'),
        description: String(d.description ?? ''),
        ctaLabel: String(d.ctaLabel ?? 'Learn More'),
        targetUrl: String(d.targetUrl ?? ''),
        isActive: Boolean(d.isActive),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveSponsorConfigAdmin(config: SponsorConfig): Promise<void> {
  const path = 'sponsorConfig/active';
  const cleanUrl = config.targetUrl.trim();
  if (cleanUrl && !cleanUrl.startsWith('https://')) {
    throw new Error('Sponsor URL must start with https:// (or leave blank).');
  }

  try {
    await setDoc(doc(db, 'sponsorConfig', 'active'), {
      badgeText: config.badgeText.trim().slice(0, 40) || 'SPONSORED',
      title: config.title.trim().slice(0, 100) || 'Featured Sponsor',
      description: config.description.trim().slice(0, 280) || 'Support QuizRush free trivia.',
      ctaLabel: config.ctaLabel.trim().slice(0, 50) || 'Visit Partner',
      targetUrl: cleanUrl.slice(0, 300),
      isActive: Boolean(config.isActive),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeEconomyConfig(
  onData: (config: EconomyConfig) => void
): () => void {
  const path = 'economyConfig/active';
  return onSnapshot(
    doc(db, 'economyConfig', 'active'),
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_ECONOMY);
        return;
      }
      const d = snap.data();
      onData({
        baseCoinsPerRight: Math.max(
          1,
          Math.min(100, Math.floor(Number(d.baseCoinsPerRight ?? DEFAULT_ECONOMY.baseCoinsPerRight)))
        ),
        streakBonusStep: Math.max(
          0,
          Math.min(25, Math.floor(Number(d.streakBonusStep ?? DEFAULT_ECONOMY.streakBonusStep)))
        ),
        speedBonusCoins: Math.max(
          0,
          Math.min(25, Math.floor(Number(d.speedBonusCoins ?? DEFAULT_ECONOMY.speedBonusCoins)))
        ),
        dailyBonusCoins: Math.max(
          0,
          Math.min(200, Math.floor(Number(d.dailyBonusCoins ?? DEFAULT_ECONOMY.dailyBonusCoins)))
        ),
        rewardAdCoins: Math.max(
          0,
          Math.min(100, Math.floor(Number(d.rewardAdCoins ?? DEFAULT_ECONOMY.rewardAdCoins)))
        ),
        dailyRoundLimit: Math.max(
          0,
          Math.min(200, Math.floor(Number(d.dailyRoundLimit ?? DEFAULT_ECONOMY.dailyRoundLimit)))
        ),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveEconomyConfigAdmin(config: EconomyConfig): Promise<void> {
  const path = 'economyConfig/active';
  try {
    await setDoc(doc(db, 'economyConfig', 'active'), {
      baseCoinsPerRight: Math.max(1, Math.min(100, Math.floor(config.baseCoinsPerRight))),
      streakBonusStep: Math.max(0, Math.min(25, Math.floor(config.streakBonusStep))),
      speedBonusCoins: Math.max(0, Math.min(25, Math.floor(config.speedBonusCoins))),
      dailyBonusCoins: Math.max(0, Math.min(200, Math.floor(config.dailyBonusCoins))),
      rewardAdCoins: Math.max(0, Math.min(100, Math.floor(config.rewardAdCoins))),
      dailyRoundLimit: Math.max(0, Math.min(200, Math.floor(config.dailyRoundLimit))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateDisplayNameCloud(
  user: User,
  newName: string,
  currentProgress: UserProgress
): Promise<void> {
  const clean = newName.trim().slice(0, 80);
  if (!clean) throw new Error('Name cannot be empty.');
  const path = `users/${user.uid}`;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: clean,
      updatedAt: serverTimestamp(),
    });
    await syncLeaderboardEntry(
      user.uid,
      clean,
      currentProgress.totalEarnedCoins,
      currentProgress.bestStreak,
      currentProgress.roundsPlayed
    );
    await updateProfile(user, { displayName: clean }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function claimReferralCodeCloud(
  myUid: string,
  myProgress: UserProgress,
  rawCode: string
): Promise<void> {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length < 6 || code.length > 16) {
    throw new Error('Please enter a valid referral code.');
  }
  if (myProgress.referredBy) {
    throw new Error('You have already claimed a referral reward.');
  }
  if (code === myProgress.referralCode) {
    throw new Error('You cannot use your own referral code.');
  }

  const codePath = `referralCodes/${code}`;
  let ownerUid = '';
  try {
    const codeSnap = await getDoc(doc(db, 'referralCodes', code));
    if (!codeSnap.exists()) {
      throw new Error('Referral code not found. Double-check and try again.');
    }
    ownerUid = String(codeSnap.data().ownerUid);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    handleFirestoreError(error, OperationType.GET, codePath);
  }

  if (ownerUid === myUid) {
    throw new Error('You cannot use your own referral code.');
  }

  const batch = writeBatch(db);
  batch.set(doc(db, 'referrals', myUid), {
    referredUid: myUid,
    referrerUid: ownerUid,
    referralCode: code,
    rewardCoins: REFERRAL_REWARD_COINS,
    createdAt: serverTimestamp(),
  });

  const nextTotalEarned = Math.floor(myProgress.totalEarnedCoins) + REFERRAL_REWARD_COINS;

  batch.update(doc(db, 'users', myUid), {
    coins: Math.floor(myProgress.coins) + REFERRAL_REWARD_COINS,
    totalEarnedCoins: nextTotalEarned,
    referredBy: ownerUid,
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'users', ownerUid), {
    coins: increment(REFERRAL_REWARD_COINS),
    totalEarnedCoins: increment(REFERRAL_REWARD_COINS),
    referralCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    await syncLeaderboardEntry(
      myUid,
      myProgress.displayName,
      nextTotalEarned,
      myProgress.bestStreak,
      myProgress.roundsPlayed
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `referrals/${myUid}`);
  }
}

export async function recordQuestionProgressCloud(
  uid: string,
  current: UserProgress,
  questionCategory: Exclude<CategoryId, 'mix'>,
  isCorrect: boolean,
  coinsEarned: number,
  newStreak: number
): Promise<void> {
  const path = `users/${uid}`;
  const prevCat = current.categoryStats[questionCategory];
  const safeGain = Math.max(0, Math.min(250, Math.floor(coinsEarned)));
  const nextTotalEarned = Math.floor(current.totalEarnedCoins) + safeGain;
  const nextBestStreak = Math.max(Math.floor(current.bestStreak), Math.floor(newStreak));

  try {
    await updateDoc(doc(db, 'users', uid), {
      coins: Math.floor(current.coins) + safeGain,
      totalEarnedCoins: nextTotalEarned,
      totalQuestions: Math.floor(current.totalQuestions) + 1,
      totalCorrect: Math.floor(current.totalCorrect) + (isCorrect ? 1 : 0),
      bestStreak: nextBestStreak,
      categoryStats: {
        ...current.categoryStats,
        [questionCategory]: {
          played: Math.floor(prevCat.played) + 1,
          correct: Math.floor(prevCat.correct) + (isCorrect ? 1 : 0),
        },
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordRoundFinishedCloud(
  uid: string,
  current: UserProgress,
  todayKey: string
): Promise<void> {
  const path = `users/${uid}`;
  const nextRounds = Math.floor(current.roundsPlayed) + 1;
  const nextDailyCount =
    (current.dailyRoundsDate === todayKey ? Math.floor(current.dailyRoundsCount) : 0) + 1;
  try {
    await updateDoc(doc(db, 'users', uid), {
      roundsPlayed: nextRounds,
      dailyRoundsDate: todayKey,
      dailyRoundsCount: nextDailyCount,
      updatedAt: serverTimestamp(),
    });
    await syncLeaderboardEntry(
      uid,
      current.displayName,
      current.totalEarnedCoins,
      current.bestStreak,
      nextRounds
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function claimBonusCoinsCloud(
  uid: string,
  current: UserProgress,
  amount: number,
  options?: { dailyDateKey?: string; spinDateKey?: string }
): Promise<void> {
  const path = `users/${uid}`;
  const safeGain = Math.max(0, Math.min(250, Math.floor(amount)));
  const nextTotalEarned = Math.floor(current.totalEarnedCoins) + safeGain;
  const payload: Record<string, unknown> = {
    coins: Math.floor(current.coins) + safeGain,
    totalEarnedCoins: nextTotalEarned,
    updatedAt: serverTimestamp(),
  };
  if (options?.dailyDateKey) {
    payload.lastDailyBonusDate = options.dailyDateKey;
  }
  if (options?.spinDateKey) {
    payload.lastSpinDate = options.spinDateKey;
  }
  try {
    await updateDoc(doc(db, 'users', uid), payload);
    await syncLeaderboardEntry(
      uid,
      current.displayName,
      nextTotalEarned,
      current.bestStreak,
      current.roundsPlayed
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitRedemptionRequestCloud(
  user: User,
  displayName: string,
  currentCoins: number,
  tier: VoucherTier
): Promise<string> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const userRef = doc(db, 'users', user.uid);
  const reqRef = doc(db, 'redemptionRequests', requestId);
  const contact = (user.email || user.phoneNumber || 'Verified Account').slice(0, 120);

  const batch = writeBatch(db);
  batch.update(userRef, {
    coins: Math.floor(currentCoins) - Math.floor(tier.costCoins),
    updatedAt: serverTimestamp(),
  });
  batch.set(reqRef, {
    userId: user.uid,
    userContact: contact,
    userName: sanitizeDisplayName(displayName || user.displayName, user.email, user.phoneNumber),
    tierId: tier.id,
    amountInr: tier.amountInr,
    costCoins: tier.costCoins,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    return requestId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `redemptionRequests/${requestId}`);
  }
}

export function subscribeMyRedemptions(
  uid: string,
  onData: (items: RedemptionRequest[]) => void
): () => void {
  const path = 'redemptionRequests';
  const q = query(collection(db, 'redemptionRequests'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows: RedemptionRequest[] = snap.docs
        .map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: String(d.userId),
            userContact: String(d.userContact ?? d.userEmail ?? ''),
            userName: String(d.userName),
            tierId: d.tierId as VoucherTierId,
            amountInr: Number(d.amountInr),
            costCoins: Number(d.costCoins),
            status: d.status as RedemptionRequest['status'],
            voucherCode: (d.voucherCode as string | null) ?? null,
            adminNote: (d.adminNote as string | null) ?? null,
            createdAtMs: toMillis(d.createdAt),
            updatedAtMs: toMillis(d.updatedAt),
          };
        })
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(rows);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeVoucherAvailability(
  onData: (map: Record<VoucherTierId, VoucherAvailability>) => void
): () => void {
  const path = 'voucherAvailability';
  return onSnapshot(
    collection(db, 'voucherAvailability'),
    (snap) => {
      const result: Record<VoucherTierId, VoucherAvailability> = {
        'gp-10': { tierId: 'gp-10', amountInr: 10, availableCount: 0 },
        'gp-25': { tierId: 'gp-25', amountInr: 25, availableCount: 0 },
        'gp-50': { tierId: 'gp-50', amountInr: 50, availableCount: 0 },
        'gp-100': { tierId: 'gp-100', amountInr: 100, availableCount: 0 },
      };
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const tid = docSnap.id as VoucherTierId;
        if (tid in result) {
          result[tid] = {
            tierId: tid,
            amountInr: Number(d.amountInr ?? result[tid].amountInr),
            availableCount: Number(d.availableCount ?? 0),
          };
        }
      });
      onData(result);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// --- ADMIN OPERATIONS ---

export function subscribeAllRedemptionsAdmin(
  onData: (items: RedemptionRequest[]) => void
): () => void {
  const path = 'redemptionRequests';
  const q = query(collection(db, 'redemptionRequests'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows: RedemptionRequest[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId),
          userContact: String(d.userContact ?? d.userEmail ?? ''),
          userName: String(d.userName),
          tierId: d.tierId as VoucherTierId,
          amountInr: Number(d.amountInr),
          costCoins: Number(d.costCoins),
          status: d.status as RedemptionRequest['status'],
          voucherCode: (d.voucherCode as string | null) ?? null,
          adminNote: (d.adminNote as string | null) ?? null,
          createdAtMs: toMillis(d.createdAt),
          updatedAtMs: toMillis(d.updatedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeVoucherStockAdmin(
  onData: (items: VoucherStockItem[]) => void
): () => void {
  const path = 'voucherStock';
  const q = query(collection(db, 'voucherStock'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows: VoucherStockItem[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          tierId: d.tierId as VoucherTierId,
          amountInr: Number(d.amountInr),
          code: String(d.code),
          status: d.status as 'available' | 'assigned',
          assignedToUid: (d.assignedToUid as string | null) ?? null,
          assignedRequestId: (d.assignedRequestId as string | null) ?? null,
          createdBy: String(d.createdBy),
          createdAtMs: toMillis(d.createdAt),
        };
      });
      onData(rows);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addBulkVoucherStockAdmin(
  adminUid: string,
  tierId: VoucherTierId,
  rawCodes: string[],
  currentAvailableCount: number
): Promise<number> {
  const tier = VOUCHER_TIERS.find((t) => t.id === tierId);
  if (!tier) return 0;

  const cleaned = rawCodes
    .map((c) => c.trim())
    .filter((c) => c.length >= 8 && c.length <= 40);
  if (cleaned.length === 0) return 0;

  const batch = writeBatch(db);
  cleaned.forEach((code, idx) => {
    const stockId = `stk_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
    batch.set(doc(db, 'voucherStock', stockId), {
      tierId: tier.id,
      amountInr: tier.amountInr,
      code,
      status: 'available',
      createdBy: adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  batch.set(doc(db, 'voucherAvailability', tier.id), {
    tierId: tier.id,
    amountInr: tier.amountInr,
    availableCount: Math.max(0, Math.floor(currentAvailableCount)) + cleaned.length,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    return cleaned.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'voucherStock');
  }
}

export async function deleteAvailableStockAdmin(
  item: VoucherStockItem,
  currentAvailableCount: number
): Promise<void> {
  if (item.status !== 'available') return;
  try {
    await deleteDoc(doc(db, 'voucherStock', item.id));
    await setDoc(doc(db, 'voucherAvailability', item.tierId), {
      tierId: item.tierId,
      amountInr: item.amountInr,
      availableCount: Math.max(0, Math.floor(currentAvailableCount) - 1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `voucherStock/${item.id}`);
  }
}

export async function fulfillRequestFromStockAdmin(
  req: RedemptionRequest,
  stockItem: VoucherStockItem,
  currentAvailableCount: number,
  adminNote = 'Delivered from QuizRush verified stock'
): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, 'voucherStock', stockItem.id), {
    status: 'assigned',
    assignedToUid: req.userId,
    assignedRequestId: req.id,
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'redemptionRequests', req.id), {
    status: 'fulfilled',
    voucherCode: stockItem.code,
    adminNote: adminNote.slice(0, 200),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, 'voucherAvailability', req.tierId), {
    tierId: req.tierId,
    amountInr: req.amountInr,
    availableCount: Math.max(0, Math.floor(currentAvailableCount) - 1),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `redemptionRequests/${req.id}`);
  }
}

export async function fulfillRequestDirectAdmin(
  req: RedemptionRequest,
  realCode: string,
  adminNote = 'Delivered by QuizRush Admin'
): Promise<void> {
  const trimmed = realCode.trim();
  if (trimmed.length < 8 || trimmed.length > 40) {
    throw new Error('Voucher code must be between 8 and 40 characters.');
  }
  const path = `redemptionRequests/${req.id}`;
  try {
    await updateDoc(doc(db, 'redemptionRequests', req.id), {
      status: 'fulfilled',
      voucherCode: trimmed,
      adminNote: adminNote.slice(0, 200),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rejectRequestAndRefundAdmin(
  req: RedemptionRequest,
  adminNote = 'Request rejected and coins refunded'
): Promise<void> {
  const userPath = `users/${req.userId}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', req.userId));
    const batch = writeBatch(db);

    if (userSnap.exists()) {
      const currentCoins = Number(userSnap.data().coins ?? 0);
      batch.update(doc(db, 'users', req.userId), {
        coins: Math.floor(currentCoins) + Math.floor(req.costCoins),
        updatedAt: serverTimestamp(),
      });
    }

    batch.update(doc(db, 'redemptionRequests', req.id), {
      status: 'rejected',
      adminNote: adminNote.slice(0, 200),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export function subscribeAllUsersAdmin(
  onData: (players: AdminPlayerSummary[]) => void
): () => void {
  const path = 'users';
  const q = query(collection(db, 'users'), orderBy('coins', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const rows: AdminPlayerSummary[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: String(d.uid ?? docSnap.id),
          displayName: String(d.displayName ?? 'Player'),
          email: String(d.email || d.phoneNumber || 'Player'),
          coins: Number(d.coins ?? 0),
          totalEarnedCoins: Number(d.totalEarnedCoins ?? 0),
          roundsPlayed: Number(d.roundsPlayed ?? 0),
          referralCount: Number(d.referralCount ?? 0),
        };
      });
      onData(rows);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function adjustUserCoinsAdmin(
  targetUid: string,
  newCoins: number
): Promise<void> {
  const path = `users/${targetUid}`;
  const safeCoins = Math.max(0, Math.min(10000000, Math.floor(newCoins)));
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      coins: safeCoins,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
