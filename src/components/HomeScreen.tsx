import { User } from 'firebase/auth';
import {
  Disc3,
  Flame,
  Gift,
  Languages,
  LogIn,
  Play,
  Sparkles,
  Ticket,
  Trophy,
  User as UserIcon,
  Users,
} from 'lucide-react';
import {
  CATEGORIES,
  QUESTIONS_PER_ROUND,
  VOUCHER_TIERS,
} from '../data/questions';
import { CategoryId, EconomyConfig, QuizLanguage, UserProgress } from '../types/quiz';
import { AdsterraBanner } from './AdsterraBanner';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeScreenProps {
  user: User | null;
  progress: UserProgress;
  economy: EconomyConfig;
  todayRoundsUsed: number;
  canPlayMoreToday: boolean;
  dailyLimitMessage: string | null;
  redeemedCount: number;
  canClaimDaily: boolean;
  canSpinWheel: boolean;
  language: QuizLanguage;
  onToggleLanguage: () => void;
  onOpenAuth: () => void;
  onStartQuiz: (category: CategoryId) => void;
  onClaimDailyBonus: () => void;
  onOpenSpinWheel: () => void;
  onWatchRewardAd: () => void;
  onOpenWallet: () => void;
  onOpenAccount: () => void;
  onOpenRanks: () => void;
  onOpenLegal: (tab: 'rules' | 'privacy') => void;
}

export function HomeScreen({
  user,
  progress,
  economy,
  todayRoundsUsed,
  canPlayMoreToday,
  dailyLimitMessage,
  redeemedCount,
  canClaimDaily,
  canSpinWheel,
  language,
  onToggleLanguage,
  onOpenAuth,
  onStartQuiz,
  onClaimDailyBonus,
  onOpenSpinWheel,
  onWatchRewardAd,
  onOpenWallet,
  onOpenAccount,
  onOpenRanks,
  onOpenLegal,
}: HomeScreenProps) {
  const starterGoal = VOUCHER_TIERS[0];
  const nextTier =
    VOUCHER_TIERS.find((t) => progress.coins < t.costCoins) ?? VOUCHER_TIERS[VOUCHER_TIERS.length - 1];
  const targetCoins = nextTier.costCoins;
  const pct = Math.min(100, Math.round((progress.coins / targetCoins) * 100));
  const unlockedStarter = progress.coins >= starterGoal.costCoins;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      {/* Main Left / Mobile Column */}
      <div className="space-y-5 lg:col-span-7">
        {/* Account Greeting or Mandatory Login Banner */}
        {user ? (
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#150f30]/90 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-black text-white">
                {progress.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">
                  Welcome, {progress.displayName}
                </div>
                <div className="truncate text-xs text-slate-400">
                  {progress.phoneNumber || progress.email || 'Verified Account'} · Code:{' '}
                  <span className="font-mono-num font-bold text-amber-300">
                    {progress.referralCode}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
            >
              <UserIcon className="h-3.5 w-3.5 text-violet-300" />
              <span>Account</span>
            </button>
          </section>
        ) : (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3.5">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-amber-200">
                Sign in required to play & earn real vouchers
              </div>
              <p className="text-xs text-amber-100/75">
                Sign in with your Google account · +100 coins per referral ·{' '}
                {economy.dailyRoundLimit > 0
                  ? `${economy.dailyRoundLimit} rounds/day`
                  : 'Unlimited rounds'}
                .
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          </section>
        )}

        {/* Goal Progress Card */}
        <section className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-900/35 via-[#191238]/90 to-cyan-950/35 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-300">
                {unlockedStarter ? 'Goal Unlocked · Ready to Redeem' : `Next Goal · ${nextTier.title} Voucher`}
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white text-balance sm:text-2xl">
                {unlockedStarter
                  ? 'Request your real Google Play voucher'
                  : language === 'hi'
                  ? 'क्विज़ खेलें और असली वाउचर जीतें'
                  : 'Play trivia rounds & collect coins'}
              </h1>
            </div>
            <span className="font-mono-num shrink-0 text-lg font-extrabold text-emerald-400 tabular-nums">
              {pct}%
            </span>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/45">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span className="font-mono-num tabular-nums">
              {progress.coins.toLocaleString('en-IN')} / {targetCoins.toLocaleString('en-IN')} Coins
            </span>
            <span className="text-slate-400">
              +{economy.baseCoinsPerRight} / Right Ans ·{' '}
              {economy.dailyRoundLimit > 0
                ? `${todayRoundsUsed}/${economy.dailyRoundLimit} Rounds Today`
                : 'Unlimited Rounds'}
            </span>
          </div>
        </section>

        {/* Daily Limit Banner (if reached or triggered) */}
        {(dailyLimitMessage || (user && !canPlayMoreToday)) && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-xs font-semibold text-amber-200">
            {dailyLimitMessage ||
              (language === 'hi'
                ? `आज की ${economy.dailyRoundLimit} राउंड की लिमिट पूरी हो गई है। कल फिर खेलें या Daily Spin / Watch Ad से कॉइन्स लें!`
                : `Daily limit of ${economy.dailyRoundLimit} rounds reached today (${todayRoundsUsed}/${economy.dailyRoundLimit}). Come back tomorrow or claim Daily Bonus / Lucky Spin!`)}
          </div>
        )}

        {/* Categories Header + Language Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white sm:text-lg">
              {language === 'hi' ? 'क्विज़ कैटेगरी चुनें' : 'Choose Quiz Category'}
            </h2>
            <span className="text-xs font-semibold text-cyan-400">
              {QUESTIONS_PER_ROUND} Qs / Round
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => language !== 'en' && onToggleLanguage()}
              className={`min-h-[34px] rounded-lg px-3 text-xs font-bold transition-colors ${
                language === 'en' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => language !== 'hi' && onToggleLanguage()}
              className={`inline-flex min-h-[34px] items-center gap-1 rounded-lg px-3 text-xs font-bold transition-colors ${
                language === 'hi' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>हिंदी</span>
            </button>
          </div>
        </div>

        {/* 2x2 Category Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {CATEGORIES.map((cat) => {
            const catStat = progress.categoryStats[cat.id];
            const acc =
              catStat.played > 0 ? Math.round((catStat.correct / catStat.played) * 100) : null;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onStartQuiz(cat.id)}
                className={`group flex min-h-[144px] flex-col justify-between rounded-2xl border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:shadow-lg hover:shadow-violet-900/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${cat.accentClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {cat.emoji}
                  </span>
                  {acc !== null && (
                    <span className="font-mono-num text-[11px] font-semibold text-slate-300 tabular-nums">
                      {acc}% acc
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-[15px] font-bold leading-snug text-white">
                    {language === 'hi' ? cat.nameHi : cat.name}
                  </div>
                  <p className="mt-1 hidden text-xs leading-relaxed text-slate-300/80 sm:block">
                    {cat.description}
                  </p>
                  <div className="mt-2 text-xs font-bold text-amber-300">
                    +{economy.baseCoinsPerRight} Coins / Q
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mega Play Quick Mix CTA */}
        <button
          type="button"
          disabled={Boolean(user) && !canPlayMoreToday}
          onClick={() => onStartQuiz('mix')}
          className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-pink-600/30 transition-transform duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <Play className="h-5 w-5 fill-current" />
          <span className="whitespace-nowrap">
            {!user
              ? 'Sign In & Play Mega Mix'
              : !canPlayMoreToday
              ? language === 'hi'
                ? 'आज की लिमिट पूरी हुई'
                : 'Daily Limit Reached Today'
              : language === 'hi'
              ? 'मेगा मिक्स क्विज़ खेलें'
              : 'Quick Play Mega Mix'}
          </span>
        </button>

        {/* Adsterra 320x50 Banner */}
        <AdsterraBanner slotKey="home-banner" className="pt-1" />

        {/* Quiet Legal & Trust Links */}
        <footer className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-400 lg:justify-start">
          <button
            type="button"
            onClick={() => onOpenLegal('rules')}
            className="underline-offset-4 hover:text-white hover:underline"
          >
            Terms & Reward Rules
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="underline-offset-4 hover:text-white hover:underline"
          >
            Privacy Policy
          </button>
        </footer>
      </div>

      {/* Right Column */}
      <aside className="space-y-4 lg:col-span-5">
        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white">Daily Coin Boosters</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Extra ways to grow your coin balance every day
              </p>
            </div>
            <Gift className="h-5 w-5 shrink-0 text-amber-400" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">Daily Check-In Bonus</div>
                <div className="text-xs font-semibold text-amber-300">
                  +{economy.dailyBonusCoins} Coins once per day
                </div>
              </div>
              <button
                type="button"
                disabled={Boolean(user) && !canClaimDaily}
                onClick={onClaimDailyBonus}
                className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                  !user || canClaimDaily
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95'
                    : 'cursor-not-allowed bg-white/10 text-slate-400'
                }`}
              >
                {!user ? 'Sign In' : canClaimDaily ? `Claim +${economy.dailyBonusCoins}` : 'Claimed Today'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">Daily Lucky Spin Wheel</div>
                <div className="text-xs font-semibold text-pink-300">Win +10 to +100 Coins</div>
              </div>
              <button
                type="button"
                disabled={Boolean(user) && !canSpinWheel}
                onClick={onOpenSpinWheel}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                  !user || canSpinWheel
                    ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:brightness-110 active:scale-95'
                    : 'cursor-not-allowed bg-white/10 text-slate-400'
                }`}
              >
                <Disc3 className="h-3.5 w-3.5" />
                <span>{!user ? 'Sign In' : canSpinWheel ? 'Spin Free' : 'Spun Today'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">Sponsor Reward Break</div>
                <div className="text-xs font-semibold text-cyan-300">
                  +{economy.rewardAdCoins} Coins for 4s preview
                </div>
              </div>
              <button
                type="button"
                onClick={onWatchRewardAd}
                className="min-h-[44px] shrink-0 whitespace-nowrap rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-extrabold text-cyan-200 transition-all hover:bg-cyan-500/30 active:scale-95"
              >
                {user ? `Watch +${economy.rewardAdCoins}` : 'Sign In'}
              </button>
            </div>
          </div>
        </div>

        {/* Refer & Earn Promo Card */}
        <button
          type="button"
          onClick={user ? onOpenAccount : onOpenAuth}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-violet-900/25 p-4 text-left transition-colors hover:border-amber-400/60"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-extrabold text-white">Refer Friends & Earn +100 Coins</div>
              <div className="text-xs text-slate-300">
                {user
                  ? `Your code: ${progress.referralCode} · ${progress.referralCount} referred`
                  : 'Sign up to get your personal referral code'}
              </div>
            </div>
          </div>
          <span className="shrink-0 text-xs font-extrabold text-amber-300">Open</span>
        </button>

        {/* Download / Install PWA App Card */}
        <PWAInstallButton variant="card" />

        {/* Progress + Ranks Shortcut */}
        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-white">Your Progress</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenRanks}
                className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap text-xs font-bold text-amber-300 hover:text-amber-200"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Ranks</span>
              </button>
              <button
                type="button"
                onClick={onOpenWallet}
                className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>Vouchers</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="font-mono-num text-lg font-extrabold text-white tabular-nums">
                {progress.roundsPlayed}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">Rounds</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="font-mono-num text-lg font-extrabold text-amber-300 tabular-nums">
                {progress.bestStreak}x
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">Best Streak</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="font-mono-num text-lg font-extrabold text-emerald-400 tabular-nums">
                {redeemedCount}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">Fulfilled</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Flame className="h-4 w-4 shrink-0 text-orange-400" />
            <span>
              Consecutive correct answers add +{economy.streakBonusStep} streak bonus coins each.
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
            <span>Online-only verified trivia · Real Google Play codes in Wallet.</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
