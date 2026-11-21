import { RefreshCw, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface OfflineBlockerProps {
  onRetry: () => Promise<void>;
}

export function OfflineBlocker({ onRetry }: OfflineBlockerProps) {
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    setChecking(true);
    try {
      await onRetry();
    } finally {
      window.setTimeout(() => setChecking(false), 500);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-title"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070412] p-6 text-center"
    >
      <div className="w-full max-w-sm rounded-3xl border border-red-400/35 bg-[#150f30] p-7 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
          <WifiOff className="h-8 w-8" />
        </div>

        <h1 id="offline-title" className="mt-4 text-xl font-black text-white">
          Internet Connection Required
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          QuizRush works online only. Please turn on Mobile Data or Wi-Fi to continue playing trivia and earning coins.
        </p>

        <button
          type="button"
          disabled={checking}
          onClick={handleRetry}
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-600/25 hover:brightness-110 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking Connection...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
}
