import { Download, Share, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
}

export function PWAInstallButton({ variant = 'header' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  if (variant === 'header' && !isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleClick}
          title="Install QuizRush App"
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 text-xs font-extrabold text-emerald-200 transition-colors hover:bg-emerald-500/30"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 to-cyan-900/25 p-4 text-left transition-colors hover:border-emerald-400/60"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-extrabold text-white">Download QuizRush App</div>
              <div className="text-xs text-slate-300">
                {isInstallable
                  ? '1-tap install on your phone home screen'
                  : 'Install as standalone Android / iPhone app'}
              </div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-extrabold text-slate-950">
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </span>
        </button>
      )}

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-3xl border border-emerald-400/40 bg-[#141132] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Smartphone className="h-5 w-5" />
                <h2 id="pwa-guide-title" className="text-lg font-black text-white">
                  {isIOS ? 'Install on iPhone / iPad' : 'Install QuizRush App'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install guide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
                <p>
                  1. Open this app in <strong className="text-white">Safari</strong>.
                </p>
                <p className="flex items-center gap-1.5">
                  2. Tap the <Share className="inline h-3.5 w-3.5 text-cyan-300" />{' '}
                  <strong className="text-white">Share</strong> button at the bottom.
                </p>
                <p>
                  3. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
                <p>
                  1. Open the app in <strong className="text-white">Chrome</strong> (use the full tab link, not inside a preview frame).
                </p>
                <p>
                  2. Tap the <strong className="text-white">⋮ Menu</strong> at the top-right corner of Chrome.
                </p>
                <p>
                  3. Tap <strong className="text-emerald-300">Install App</strong> or{' '}
                  <strong className="text-emerald-300">Add to Home screen</strong> — it installs just like an Android app!
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 min-h-[44px] w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-emerald-400"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
