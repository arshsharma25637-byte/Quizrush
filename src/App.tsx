import { getRedirectResult, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccountScreen } from './components/AccountScreen';
import { AdminPanelScreen } from './components/AdminPanelScreen';
import { AuthModal } from './components/AuthModal';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { LegalModal } from './components/LegalModal';
import { LuckySpinModal } from './components/LuckySpinModal';
import { OfflineBlocker } from './components/OfflineBlocker';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { StatsScreen } from './components/StatsScreen';
import { TopBar } from './components/TopBar';
import { WalletScreen } from './components/WalletScreen';
import { DEFAULT_ECONOMY, pickRoundQuestions, REFERRAL_REWARD_COINS } from './data/questions';
import { auth } from './firebase';
import {
  addBulkVoucherStockAdmin,
  adjustUserCoinsAdmin,
  checkIsAdmin,
  claimBonusCoinsCloud,
  claimReferralCodeCloud,
  deleteAvailableStockAdmin,
  ensureUserProfile,
  fulfillRequestDirectAdmin,
  fulfillRequestFromStockAdmin,
  recordQuestionProgressCloud,
  recordRoundFinishedCloud,
  rejectRequestAndRefundAdmin,
  saveEconomyConfigAdmin,
  saveSponsorConfigAdmin,
  submitRedemptionRequestCloud,
  subscribeAllRedemptionsAdmin,
  subscribeAllUsersAdmin,
  subscribeEconomyConfig,
  subscribeLeaderboard,
  subscribeMyRedemptions,
  subscribeSponsorConfig,
  subscribeUserProfile,
  subscribeVoucherAvailability,
  subscribeVoucherStockAdmin,
  updateDisplayNameCloud,
} from './services/firestoreService';
import {
  AdminPlayerSummary,
  CategoryId,
  EconomyConfig,
  FloatingCoin,
  LeaderboardEntry,
  Question,
  RedemptionRequest,
  RoundResult,
  ScreenView,
  SponsorConfig,
  UserProgress,
  VoucherAvailability,
  VoucherStockItem,
  VoucherTier,
  VoucherTierId,
} from './types/quiz';
import { playClickSound, playRedeemSound, playVictorySound } from './utils/sound';
import { DEFAULT_PROGRESS, getTodayKey, loadProgress, saveProgress } from './utils/storage';

const INITIAL_AVAILABILITY: Record<VoucherTierId, VoucherAvailability> = {
  'gp-10': { tierId: 'gp-10', amountInr: 10, availableCount: 0 },
  'gp-25': { tierId: 'gp-25', amountInr: 25, availableCount: 0 },
  'gp-50': { tierId: 'gp-50', amountInr: 50, availableCount: 0 },
  'gp-100': { tierId: 'gp-100', amountInr: 100, availableCount: 0 },
};

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [guestProgress, setGuestProgress] = useState<UserProgress>(() => loadProgress());
  const [cloudProgress, setCloudProgress] = useState<UserProgress | null>(null);
  const [myRequests, setMyRequests] = useState<RedemptionRequest[]>([]);
  const [availability, setAvailability] =
    useState<Record<VoucherTierId, VoucherAvailability>>(INITIAL_AVAILABILITY);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [sponsorConfig, setSponsorConfig] = useState<SponsorConfig | null>(null);
  const [economy, setEconomy] = useState<EconomyConfig>(DEFAULT_ECONOMY);
  const [dailyLimitMessage, setDailyLimitMessage] = useState<string | null>(null);

  const [adminRequests, setAdminRequests] = useState<RedemptionRequest[]>([]);
  const [adminStock, setAdminStock] = useState<VoucherStockItem[]>([]);
  const [adminPlayers, setAdminPlayers] = useState<AdminPlayerSummary[]>([]);

  const [activeView, setActiveView] = useState<ScreenView>('home');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('gk');
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [roundKey, setRoundKey] = useState(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [coinPop, setCoinPop] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [submittingTierId, setSubmittingTierId] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'rules' | 'privacy' | null>(null);
  const [initialRefCode, setInitialRefCode] = useState('');
  const [authSyncError, setAuthSyncError] = useState<string | null>(null);
  const pendingAuthOptsRef = useRef<{ preferredName?: string; pendingReferralCode?: string }>({});

  const [adModal, setAdModal] = useState<{
    open: boolean;
    mode: 'quiz-gate' | 'reward-bonus';
    pendingCategory?: CategoryId;
  }>({ open: false, mode: 'quiz-gate' });

  const floatingIdRef = useRef(0);
  const soundEnabled = guestProgress.soundEnabled;
  const language = guestProgress.language;
  const quizzesSinceAd = guestProgress.quizzesSinceAd;

  const progress: UserProgress = user && cloudProgress ? cloudProgress : guestProgress;

  // Read ?ref=CODE from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setInitialRefCode(refParam.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16));
    }
  }, []);

  // Strict Online-Only Enforcement
  const verifyConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    try {
      await fetch(`/?online-check=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      void verifyConnectivity();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = window.setInterval(() => {
      if (!navigator.onLine) {
        setIsOnline(false);
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(interval);
    };
  }, [verifyConnectivity]);

  // Save user UI preferences locally
  useEffect(() => {
    saveProgress(guestProgress);
  }, [guestProgress]);

  // Subscribe to public-readable active Sponsor Ad banner & Live Economy config
  useEffect(() => {
    const unsubSponsor = subscribeSponsorConfig((cfg) => {
      setSponsorConfig(cfg);
    });
    const unsubEconomy = subscribeEconomyConfig((cfg) => {
      setEconomy(cfg);
    });
    return () => {
      unsubSponsor();
      unsubEconomy();
    };
  }, []);

  // Recover any pending referral code & redirect sign-in result on mount (mobile/PWA redirect flow)
  useEffect(() => {
    try {
      const savedRef = window.sessionStorage.getItem('quizrush_pending_ref');
      if (savedRef && !pendingAuthOptsRef.current.pendingReferralCode) {
        pendingAuthOptsRef.current.pendingReferralCode = savedRef;
      }
    } catch {
      // Ignore storage errors
    }

    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          setAuthModalOpen(false);
        }
      })
      .catch((err) => {
        console.error('Google redirect sign-in error:', err);
        setAuthSyncError(err instanceof Error ? err.message : 'Google Sign-In failed.');
      });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        setAuthSyncError(null);
        try {
          const { preferredName } = pendingAuthOptsRef.current;
          await ensureUserProfile(nextUser, preferredName);
          const adminStatus = await checkIsAdmin(nextUser);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error('Auth initialization error:', err);
          setAuthSyncError(
            err instanceof Error ? err.message : 'Unable to load your player profile.'
          );
          setIsAdmin(false);
        }
      } else {
        setCloudProgress(null);
        setMyRequests([]);
        setLeaderboardEntries([]);
        setAdminRequests([]);
        setAdminStock([]);
        setAdminPlayers([]);
        setAuthSyncError(null);
        setIsAdmin(false);
        setActiveView((prev) =>
          prev === 'admin' || prev === 'quiz' || prev === 'result' ? 'home' : prev
        );
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore user profile, redemption requests, availability, and leaderboard when authenticated
  useEffect(() => {
    if (!user) return;
    const unsubProfile = subscribeUserProfile(
      user.uid,
      soundEnabled,
      language,
      quizzesSinceAd,
      (next) => {
        setCloudProgress(next);
      }
    );
    const unsubReqs = subscribeMyRedemptions(user.uid, (items) => {
      setMyRequests(items);
    });
    const unsubAvail = subscribeVoucherAvailability((map) => {
      setAvailability(map);
    });
    const unsubLeaderboard = subscribeLeaderboard((entries) => {
      setLeaderboardEntries(entries);
    });
    return () => {
      unsubProfile();
      unsubReqs();
      unsubAvail();
      unsubLeaderboard();
    };
  }, [user, soundEnabled, language, quizzesSinceAd]);

  // Auto-claim pending referral code entered during signup once cloudProgress loads
  useEffect(() => {
    const pendingCode = pendingAuthOptsRef.current.pendingReferralCode;
    if (user && cloudProgress && pendingCode && !cloudProgress.referredBy) {
      pendingAuthOptsRef.current.pendingReferralCode = undefined;
      try {
        window.sessionStorage.removeItem('quizrush_pending_ref');
      } catch {
        // Ignore
      }
      claimReferralCodeCloud(user.uid, cloudProgress, pendingCode).catch(() => {});
    }
  }, [user, cloudProgress]);

  // Subscribe to Admin collections only if user is verified Admin
  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsubAllReqs = subscribeAllRedemptionsAdmin((items) => setAdminRequests(items));
    const unsubStock = subscribeVoucherStockAdmin((items) => setAdminStock(items));
    const unsubUsers = subscribeAllUsersAdmin((players) => setAdminPlayers(players));
    return () => {
      unsubAllReqs();
      unsubStock();
      unsubUsers();
    };
  }, [user, isAdmin]);

  const triggerCoinPop = useCallback(() => {
    setCoinPop(true);
    window.setTimeout(() => setCoinPop(false), 240);
  }, []);

  const spawnFloatingCoin = useCallback((label: string, rect?: DOMRect) => {
    const id = ++floatingIdRef.current;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + 10 : window.innerHeight * 0.42;

    setFloatingCoins((prev) => [...prev, { id, x, y, label }]);
    window.setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  }, []);

  const handleOpenAuth = useCallback(() => {
    playClickSound(soundEnabled);
    setAuthModalOpen(true);
  }, [soundEnabled]);

  const handleSignOut = useCallback(async () => {
    playClickSound(soundEnabled);
    await signOut(auth);
  }, [soundEnabled]);

  const todayKey = getTodayKey();
  const todayRoundsUsed = progress.dailyRoundsDate === todayKey ? progress.dailyRoundsCount : 0;
  const canPlayMoreToday =
    economy.dailyRoundLimit === 0 || todayRoundsUsed < economy.dailyRoundLimit;
  const canClaimDaily = progress.lastDailyBonusDate !== todayKey;
  const canSpinWheel = progress.lastSpinDate !== todayKey;

  const launchQuiz = useCallback(
    (category: CategoryId) => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      if (!canPlayMoreToday) {
        setDailyLimitMessage(
          `Daily limit of ${economy.dailyRoundLimit} rounds reached today. Come back tomorrow!`
        );
        setActiveView('home');
        return;
      }
      setDailyLimitMessage(null);
      const questions = pickRoundQuestions(category);
      setActiveCategory(category);
      setRoundQuestions(questions);
      setRoundKey((k) => k + 1);
      setActiveView('quiz');
    },
    [canPlayMoreToday, economy.dailyRoundLimit, user]
  );

  // Mandatory Login + Daily Round Limit + Immediate Interstitial Ad when starting next quiz
  const handleStartQuizWithAdCheck = useCallback(
    (category: CategoryId) => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      playClickSound(soundEnabled);
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      if (!canPlayMoreToday) {
        setDailyLimitMessage(
          `Daily limit of ${economy.dailyRoundLimit} rounds reached today. Come back tomorrow!`
        );
        setActiveView('home');
        return;
      }
      if (quizzesSinceAd >= 1) {
        setAdModal({ open: true, mode: 'quiz-gate', pendingCategory: category });
      } else {
        launchQuiz(category);
      }
    },
    [canPlayMoreToday, economy.dailyRoundLimit, launchQuiz, quizzesSinceAd, soundEnabled, user]
  );

  const handleOpenRewardAd = useCallback(() => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    playClickSound(soundEnabled);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setAdModal({ open: true, mode: 'reward-bonus' });
  }, [soundEnabled, user]);

  const handleCompleteAdModal = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    if (!user) {
      setAdModal({ open: false, mode: 'quiz-gate' });
      setAuthModalOpen(true);
      return;
    }
    if (adModal.mode === 'reward-bonus') {
      if (cloudProgress && economy.rewardAdCoins > 0) {
        playRedeemSound(soundEnabled);
        await claimBonusCoinsCloud(user.uid, cloudProgress, economy.rewardAdCoins);
        triggerCoinPop();
        spawnFloatingCoin(`+${economy.rewardAdCoins}`);
      }
      setAdModal({ open: false, mode: 'quiz-gate' });
    } else {
      const cat = adModal.pendingCategory ?? 'gk';
      setGuestProgress((prev) => ({ ...prev, quizzesSinceAd: 0 }));
      setAdModal({ open: false, mode: 'quiz-gate' });
      launchQuiz(cat);
    }
  }, [
    adModal,
    cloudProgress,
    economy.rewardAdCoins,
    launchQuiz,
    soundEnabled,
    spawnFloatingCoin,
    triggerCoinPop,
    user,
  ]);

  const handleQuestionScored = useCallback(
    async (
      questionCategory: Exclude<CategoryId, 'mix'>,
      isCorrect: boolean,
      coinsEarned: number,
      newStreak: number,
      anchorRect?: DOMRect
    ) => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      if (isCorrect && coinsEarned > 0) {
        triggerCoinPop();
        spawnFloatingCoin(`+${coinsEarned}`, anchorRect);
      }

      if (user && cloudProgress) {
        await recordQuestionProgressCloud(
          user.uid,
          cloudProgress,
          questionCategory,
          isCorrect,
          coinsEarned,
          newStreak
        );
      }
    },
    [cloudProgress, spawnFloatingCoin, triggerCoinPop, user]
  );

  const handleFinishRound = useCallback(
    async (result: RoundResult) => {
      if (result.correctCount >= 3) {
        playVictorySound(soundEnabled);
      }
      setGuestProgress((prev) => ({
        ...prev,
        quizzesSinceAd: prev.quizzesSinceAd + 1,
      }));
      if (user && cloudProgress) {
        await recordRoundFinishedCloud(user.uid, cloudProgress, todayKey);
      }
      setLastResult(result);
      setActiveView('result');
    },
    [cloudProgress, soundEnabled, todayKey, user]
  );

  const handleToggleSound = useCallback(() => {
    setGuestProgress((prev) => {
      const next = !prev.soundEnabled;
      if (next) playClickSound(true);
      return { ...prev, soundEnabled: next };
    });
  }, []);

  const handleToggleLanguage = useCallback(() => {
    playClickSound(soundEnabled);
    setGuestProgress((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'hi' : 'en',
    }));
  }, [soundEnabled]);

  const handleNavigate = useCallback(
    (view: ScreenView) => {
      playClickSound(soundEnabled);
      setActiveView(view);
    },
    [soundEnabled]
  );

  const handleClaimDailyBonus = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    if (!user) {
      playClickSound(soundEnabled);
      setAuthModalOpen(true);
      return;
    }
    if (!cloudProgress || !canClaimDaily) return;
    playRedeemSound(soundEnabled);
    await claimBonusCoinsCloud(user.uid, cloudProgress, economy.dailyBonusCoins, {
      dailyDateKey: todayKey,
    });
    triggerCoinPop();
    spawnFloatingCoin(`+${economy.dailyBonusCoins}`);
  }, [
    canClaimDaily,
    cloudProgress,
    economy.dailyBonusCoins,
    soundEnabled,
    spawnFloatingCoin,
    todayKey,
    triggerCoinPop,
    user,
  ]);

  const handleOpenSpinWheel = useCallback(() => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    playClickSound(soundEnabled);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSpinModalOpen(true);
  }, [soundEnabled, user]);

  const handleWinSpin = useCallback(
    async (amount: number) => {
      if (!user || !cloudProgress) return;
      playRedeemSound(soundEnabled);
      await claimBonusCoinsCloud(user.uid, cloudProgress, amount, { spinDateKey: todayKey });
      triggerCoinPop();
      spawnFloatingCoin(`+${amount}`);
    },
    [cloudProgress, soundEnabled, spawnFloatingCoin, todayKey, triggerCoinPop, user]
  );

  const handleSubmitRedemption = useCallback(
    async (tier: VoucherTier) => {
      if (!user || !cloudProgress || cloudProgress.coins < tier.costCoins) return;
      setSubmittingTierId(tier.id);
      try {
        await submitRedemptionRequestCloud(
          user,
          cloudProgress.displayName,
          cloudProgress.coins,
          tier
        );
        playRedeemSound(soundEnabled);
      } finally {
        setSubmittingTierId(null);
      }
    },
    [cloudProgress, soundEnabled, user]
  );

  const handleUpdateName = useCallback(
    async (newName: string) => {
      if (!user || !cloudProgress) return;
      await updateDisplayNameCloud(user, newName, cloudProgress);
    },
    [cloudProgress, user]
  );

  const handleClaimReferral = useCallback(
    async (code: string) => {
      if (!user || !cloudProgress) return;
      await claimReferralCodeCloud(user.uid, cloudProgress, code);
      playRedeemSound(soundEnabled);
      triggerCoinPop();
      spawnFloatingCoin(`+${REFERRAL_REWARD_COINS}`);
    },
    [cloudProgress, soundEnabled, spawnFloatingCoin, triggerCoinPop, user]
  );

  const handleResetGuestProgress = useCallback(() => {
    setGuestProgress((prev) => ({
      ...DEFAULT_PROGRESS,
      soundEnabled: prev.soundEnabled,
      language: prev.language,
    }));
  }, []);

  const fulfilledCount = myRequests.filter((r) => r.status === 'fulfilled').length;

  return (
    <div className="relative min-h-screen bg-[#090617] text-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-24 -top-24 z-0 h-80 w-80 rounded-full bg-violet-600/35 blur-[110px] animate-float-orb"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-28 -right-20 z-0 h-80 w-80 rounded-full bg-cyan-500/25 blur-[110px] animate-float-orb"
        style={{ animationDelay: '-5s' }}
      />

      {/* Strict Online-Only Blocker */}
      {!isOnline && <OfflineBlocker onRetry={verifyConnectivity} />}

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar
          coins={progress.coins}
          coinPop={coinPop}
          soundEnabled={soundEnabled}
          user={user}
          displayName={progress.displayName}
          isAdmin={isAdmin}
          authLoading={authLoading}
          onOpenAuth={handleOpenAuth}
          onToggleSound={handleToggleSound}
          onNavigate={handleNavigate}
          activeView={activeView}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          {authSyncError && user && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs text-red-100">
              <div className="min-w-0 flex-1 break-words">
                <strong className="text-red-200">Profile Sync Issue:</strong> {authSyncError}
              </div>
              <button
                type="button"
                onClick={async () => {
                  setAuthSyncError(null);
                  try {
                    await ensureUserProfile(user);
                    const adminStatus = await checkIsAdmin(user);
                    setIsAdmin(adminStatus);
                  } catch (err) {
                    setAuthSyncError(
                      err instanceof Error ? err.message : 'Unable to sync profile.'
                    );
                  }
                }}
                className="min-h-[36px] shrink-0 rounded-xl bg-red-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-red-300"
              >
                Retry Sync
              </button>
            </div>
          )}

          {activeView === 'home' && (
            <HomeScreen
              user={user}
              progress={progress}
              economy={economy}
              todayRoundsUsed={todayRoundsUsed}
              canPlayMoreToday={canPlayMoreToday}
              dailyLimitMessage={dailyLimitMessage}
              redeemedCount={fulfilledCount}
              canClaimDaily={canClaimDaily}
              canSpinWheel={canSpinWheel}
              language={language}
              onToggleLanguage={handleToggleLanguage}
              onOpenAuth={handleOpenAuth}
              onStartQuiz={handleStartQuizWithAdCheck}
              onClaimDailyBonus={handleClaimDailyBonus}
              onOpenSpinWheel={handleOpenSpinWheel}
              onWatchRewardAd={handleOpenRewardAd}
              onOpenWallet={() => handleNavigate('wallet')}
              onOpenAccount={() => handleNavigate('account')}
              onOpenRanks={() => handleNavigate('ranks')}
              onOpenLegal={(tab) => {
                playClickSound(soundEnabled);
                setLegalTab(tab);
              }}
            />
          )}

          {activeView === 'ranks' && (
            <LeaderboardScreen
              entries={leaderboardEntries}
              currentUid={user?.uid ?? null}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeView === 'quiz' && isOnline && user && (
            <QuizScreen
              key={roundKey}
              category={activeCategory}
              questions={roundQuestions}
              economy={economy}
              soundEnabled={soundEnabled}
              language={language}
              onToggleLanguage={handleToggleLanguage}
              onQuestionScored={handleQuestionScored}
              onFinishRound={handleFinishRound}
              onExit={() => handleNavigate('home')}
            />
          )}

          {activeView === 'result' && lastResult && (
            <ResultScreen
              result={lastResult}
              totalCoins={progress.coins}
              canPlayMoreToday={canPlayMoreToday}
              onPlayAgain={handleStartQuizWithAdCheck}
              onGoHome={() => handleNavigate('home')}
              onOpenWallet={() => handleNavigate('wallet')}
            />
          )}

          {activeView === 'wallet' && (
            <WalletScreen
              user={user}
              coins={progress.coins}
              rewardAdCoins={economy.rewardAdCoins}
              availability={availability}
              requests={myRequests}
              submittingTierId={submittingTierId}
              onSignIn={handleOpenAuth}
              onSubmitRedemption={handleSubmitRedemption}
              onWatchRewardAd={handleOpenRewardAd}
            />
          )}

          {activeView === 'stats' && (
            <StatsScreen
              isSignedIn={Boolean(user)}
              progress={progress}
              onResetGuestProgress={handleResetGuestProgress}
            />
          )}

          {activeView === 'account' && (
            <AccountScreen
              user={user}
              progress={progress}
              isAdmin={isAdmin}
              onOpenAuth={handleOpenAuth}
              onSignOut={handleSignOut}
              onUpdateName={handleUpdateName}
              onClaimReferral={handleClaimReferral}
            />
          )}

          {activeView === 'admin' && isAdmin && user && (
            <AdminPanelScreen
              requests={adminRequests}
              stock={adminStock}
              availability={availability}
              sponsor={sponsorConfig}
              economy={economy}
              players={adminPlayers}
              onAddBulkStock={(tierId, rawCodes) =>
                addBulkVoucherStockAdmin(
                  user.uid,
                  tierId,
                  rawCodes,
                  availability[tierId]?.availableCount ?? 0
                )
              }
              onDeleteStock={(item) =>
                deleteAvailableStockAdmin(item, availability[item.tierId]?.availableCount ?? 0)
              }
              onFulfillFromStock={(req, stockItem) =>
                fulfillRequestFromStockAdmin(
                  req,
                  stockItem,
                  availability[req.tierId]?.availableCount ?? 0
                )
              }
              onFulfillDirect={(req, code) => fulfillRequestDirectAdmin(req, code)}
              onRejectAndRefund={(req) => rejectRequestAndRefundAdmin(req)}
              onSaveSponsor={(cfg) => saveSponsorConfigAdmin(cfg)}
              onSaveEconomy={(cfg) => saveEconomyConfigAdmin(cfg)}
              onAdjustPlayerCoins={(targetUid, nextCoins) =>
                adjustUserCoinsAdmin(targetUid, nextCoins)
              }
            />
          )}
        </main>

        {activeView !== 'quiz' && (
          <BottomNav activeView={activeView} onNavigate={handleNavigate} />
        )}
      </div>

      {floatingCoins.map((fc) => (
        <div
          key={fc.id}
          aria-hidden="true"
          style={{ left: fc.x, top: fc.y }}
          className="font-mono-num pointer-events-none fixed z-50 -translate-x-1/2 text-lg font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] animate-float-up"
        >
          {fc.label}
        </div>
      ))}

      <InterstitialAdModal
        open={adModal.open}
        mode={adModal.mode}
        sponsor={sponsorConfig}
        rewardAdCoins={economy.rewardAdCoins}
        onComplete={handleCompleteAdModal}
      />

      <AuthModal
        open={authModalOpen}
        initialReferralCode={initialRefCode}
        onClose={() => setAuthModalOpen(false)}
        onAuthCompleted={(opts) => {
          pendingAuthOptsRef.current = opts;
        }}
      />

      <LuckySpinModal
        open={spinModalOpen}
        canSpin={canSpinWheel}
        onClose={() => setSpinModalOpen(false)}
        onWinCoins={handleWinSpin}
      />

      <LegalModal openTab={legalTab} onClose={() => setLegalTab(null)} />
    </div>
  );
}
