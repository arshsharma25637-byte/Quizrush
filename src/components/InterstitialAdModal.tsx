import { ExternalLink, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SponsorConfig } from '../types/quiz';
import { AdsterraBanner } from './AdsterraBanner';

interface InterstitialAdModalProps {
  open: boolean;
  mode: 'quiz-gate' | 'reward-bonus';
  sponsor: SponsorConfig | null;
  rewardAdCoins: number;
  onComplete: () => void;
}

export function InterstitialAdModal({
  open,
  mode,
  sponsor,
  rewardAdCoins,
  onComplete,
}: InterstitialAdModalProps) {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!open) return;
    setCountdown(4);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  if (!open) return null;

  const hasLiveSponsor = Boolean(sponsor && sponsor.isActive);
  const badge = hasLiveSponsor ? sponsor!.badgeText : 'SPONSOR BREAK';
  const title =
    mode === 'reward-bonus'
      ? `Bonus +${rewardAdCoins} Coins Ready!`
      : hasLiveSponsor
      ? sponsor!.title
      : 'QuizBoost Daily Challenge';
  const desc =
    mode === 'reward-bonus'
      ? hasLiveSponsor
        ? sponsor!.description
        : `Thanks for checking out our featured partner spotlight. Claim +${rewardAdCoins} coins straight to your wallet.`
      : hasLiveSponsor
      ? sponsor!.description
      : 'Short sponsor breaks help keep QuizRush trivia free and fund real Google Play voucher rewards.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sponsor-modal-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05030f]/95 p-6 text-center backdrop-blur-md"
    >
      <div className="relative w-full max-w-sm rounded-3xl border-2 border-indigo-400/50 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-7 shadow-2xl shadow-indigo-900/50">
        <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider text-amber-300">
          <span>{badge}</span>
          <span className="font-mono-num tabular-nums">
            {countdown > 0 ? `${countdown}s` : 'READY'}
          </span>
        </div>

        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
          {mode === 'reward-bonus' ? (
            <Sparkles className="h-8 w-8" />
          ) : (
            <Zap className="h-8 w-8 fill-current" />
          )}
        </div>

        <h2 id="sponsor-modal-title" className="mt-4 text-xl font-black text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-indigo-100/85">{desc}</p>

        {hasLiveSponsor && sponsor!.targetUrl && (
          <a
            href={sponsor!.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-white/20"
          >
            <span>{sponsor!.ctaLabel || 'Visit Sponsor'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <AdsterraBanner slotKey={`modal-${mode}`} className="mt-4" />

        <button
          type="button"
          disabled={countdown > 0}
          onClick={onComplete}
          className={`mt-4 min-h-[48px] w-full rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
            countdown > 0
              ? 'cursor-not-allowed bg-white/10 text-slate-300'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-105 active:scale-[0.98]'
          }`}
        >
          {countdown > 0
            ? `Continue in ${countdown}s...`
            : mode === 'reward-bonus'
            ? `Claim +${rewardAdCoins} Coins`
            : 'Continue to Quiz'}
        </button>
      </div>
    </div>
  );
}
