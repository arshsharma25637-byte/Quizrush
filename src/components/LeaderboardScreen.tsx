import { Crown, Flame, LogIn, Medal, Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../types/quiz';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  currentUid: string | null;
  onOpenAuth: () => void;
}

export function LeaderboardScreen({ entries, currentUid, onOpenAuth }: LeaderboardScreenProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white sm:text-2xl">Top QuizRush Players</h1>
          <p className="text-xs text-slate-400">
            Live verified rankings by total coins earned · No daily limits
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Trophy className="h-4 w-4" />
          <span>Top 25</span>
        </div>
      </div>

      {!currentUid ? (
        <div className="rounded-3xl border border-violet-400/30 bg-[#150f30]/90 p-7 text-center">
          <Crown className="mx-auto h-10 w-10 text-amber-300" />
          <h2 className="mt-3 text-lg font-black text-white">Sign in to view Live Rankings</h2>
          <p className="mt-1.5 text-xs text-slate-300">
            Sign in with your Google Account to see your rank among top QuizRush players.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#150f30]/60 p-8 text-center text-sm text-slate-400">
          Leaderboard is warming up. Finish your first round to claim the #1 spot!
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.uid === currentUid;

            return (
              <div
                key={entry.uid}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                  isMe
                    ? 'border-violet-400/60 bg-violet-600/20'
                    : 'border-white/10 bg-[#150f30]/90'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono-num text-sm font-black ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-orange-400 text-slate-950'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {rank <= 3 ? <Medal className="h-4 w-4" /> : `#${rank}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-extrabold text-white">
                        {entry.displayName}
                      </span>
                      {isMe && (
                        <span className="text-[11px] font-bold text-violet-300">(You)</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{entry.roundsPlayed} rounds</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-orange-300">
                        <Flame className="h-3 w-3" />
                        <span>{entry.bestStreak}x streak</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono-num text-sm font-black text-amber-300 tabular-nums">
                    {entry.totalEarnedCoins.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">Coins earned</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
