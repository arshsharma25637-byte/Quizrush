import { Home, RotateCcw, Ticket, Trophy } from 'lucide-react';
import { getCategoryLabel } from '../data/questions';
import { CategoryId, RoundResult } from '../types/quiz';
import { AdsterraBanner } from './AdsterraBanner';

interface ResultScreenProps {
  result: RoundResult;
  totalCoins: number;
  canPlayMoreToday: boolean;
  onPlayAgain: (category: CategoryId) => void;
  onGoHome: () => void;
  onOpenWallet: () => void;
}

export function ResultScreen({
  result,
  totalCoins,
  canPlayMoreToday,
  onPlayAgain,
  onGoHome,
  onOpenWallet,
}: ResultScreenProps) {
  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);
  const isGreat = result.correctCount >= 4;
  const isGood = result.correctCount >= 2;

  const headline = isGreat
    ? 'Outstanding Round!'
    : isGood
    ? 'Nice Trivia Run!'
    : 'Keep Practicing!';

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-3xl border border-violet-400/35 bg-[#191238]/85 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-500/20 animate-bounce-soft">
          <Trophy className="h-10 w-10" />
        </div>

        <p className="mt-4 text-xs font-bold tracking-wide text-cyan-400">
          {getCategoryLabel(result.category)} · Round Complete
        </p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{headline}</h1>
        <p className="mt-1.5 text-sm text-slate-300">
          You answered{' '}
          <span className="font-bold text-white">
            {result.correctCount} of {result.totalQuestions}
          </span>{' '}
          questions correctly ({accuracy}% accuracy).
        </p>

        {/* Stat Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="font-mono-num text-2xl font-black text-amber-300 tabular-nums">
              +{result.coinsEarned.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-slate-400">Coins Earned</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="font-mono-num text-2xl font-black text-orange-300 tabular-nums">
              {result.maxStreak}x
            </div>
            <div className="mt-1 text-xs text-slate-400">Peak Streak</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="font-mono-num text-xl font-extrabold text-emerald-400 tabular-nums">
              +{result.streakBonusCoins + result.timeBonuses}
            </div>
            <div className="mt-1 text-xs text-slate-400">Streak & Speed Bonus</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="font-mono-num text-xl font-extrabold text-white tabular-nums">
              {totalCoins.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-slate-400">Wallet Balance</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={!canPlayMoreToday}
            onClick={() => onPlayAgain(result.category)}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-3 text-base font-extrabold text-white shadow-lg shadow-pink-600/30 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{canPlayMoreToday ? 'Play Again' : 'Daily Round Limit Reached'}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onGoHome}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <Home className="h-4 w-4" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={onOpenWallet}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-500/25"
            >
              <Ticket className="h-4 w-4" />
              <span>Vouchers</span>
            </button>
          </div>
        </div>
      </div>

      <AdsterraBanner slotKey="result-banner" className="mt-5" />
    </div>
  );
}
