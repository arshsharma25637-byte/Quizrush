import { Award, Cloud, RotateCcw, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '../data/questions';
import { UserProgress } from '../types/quiz';

interface StatsScreenProps {
  isSignedIn: boolean;
  progress: UserProgress;
  onResetGuestProgress: () => void;
}

export function StatsScreen({ isSignedIn, progress, onResetGuestProgress }: StatsScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const overallAccuracy =
    progress.totalQuestions > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white sm:text-2xl">Player Performance</h1>
          <p className="text-xs text-slate-400">
            Lifetime trivia accuracy, streaks, and category mastery
          </p>
        </div>

        {isSignedIn ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Cloud className="h-4 w-4" />
            <span>Synced to Google Account</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Guest Stats</span>
          </button>
        )}
      </div>

      {/* Top KPI Summary */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Earned</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-mono-num mt-2 text-2xl font-black text-amber-300 tabular-nums">
            {progress.totalEarnedCoins.toLocaleString('en-IN')}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Coins all-time</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Accuracy</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono-num mt-2 text-2xl font-black text-emerald-400 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
            {progress.totalCorrect} / {progress.totalQuestions} Qs
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Best Streak</span>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </div>
          <div className="font-mono-num mt-2 text-2xl font-black text-orange-300 tabular-nums">
            {progress.bestStreak}x
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Consecutive right</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rounds Played</span>
          </div>
          <div className="font-mono-num mt-2 text-2xl font-black text-white tabular-nums">
            {progress.roundsPlayed}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Completed quizzes</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <section className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
        <h2 className="text-base font-extrabold text-white">Category Breakdown</h2>
        <div className="mt-4 space-y-4">
          {CATEGORIES.map((cat) => {
            const stat = progress.categoryStats[cat.id];
            const pct = stat.played > 0 ? Math.round((stat.correct / stat.played) * 100) : 0;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="font-mono-num text-xs font-semibold text-slate-300 tabular-nums">
                    {stat.correct} / {stat.played} ({pct}%)
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/45">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#141132] p-6 shadow-2xl">
            <h3 id="reset-dialog-title" className="text-lg font-extrabold text-white">
              Reset guest progress?
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              This will clear your local guest coins and quiz stats on this device.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetGuestProgress();
                  setConfirmOpen(false);
                }}
                className="min-h-[44px] rounded-xl bg-red-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-400"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
