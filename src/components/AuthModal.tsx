import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';

interface AuthModalProps {
  open: boolean;
  initialReferralCode?: string;
  onClose: () => void;
  onAuthCompleted: (opts: { preferredName?: string; pendingReferralCode?: string }) => void;
}

const PENDING_REF_STORAGE_KEY = 'quizrush_pending_ref';

function detectInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|WhatsApp|Snapchat|Line\/|MicroMessenger|Twitter|Telegram|; wv\)/i.test(
    ua
  );
}

function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function AuthModal({
  open,
  initialReferralCode = '',
  onClose,
  onAuthCompleted,
}: AuthModalProps) {
  const [referralInput, setReferralInput] = useState(initialReferralCode);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isInAppBrowser = detectInAppBrowser();
  const inIframe = isRunningInIframe();
  const standalone = isStandalonePWA();

  useEffect(() => {
    if (initialReferralCode) {
      setReferralInput(initialReferralCode);
    }
  }, [initialReferralCode]);

  useEffect(() => {
    if (!open) {
      setErrorMsg(null);
      setBusy(false);
      setCopiedLink(false);
    }
  }, [open]);

  if (!open) return null;

  const persistPendingRef = () => {
    const refCode = referralInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || undefined;
    onAuthCompleted({ pendingReferralCode: refCode });
    try {
      if (refCode) {
        window.sessionStorage.setItem(PENDING_REF_STORAGE_KEY, refCode);
      } else {
        window.sessionStorage.removeItem(PENDING_REF_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleCopyAppLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked in some webviews
    }
  };

  const handleRedirectSignIn = async () => {
    setErrorMsg(null);
    setBusy(true);
    persistPendingRef();
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(formatAuthError(msg));
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setBusy(true);
    persistPendingRef();

    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const shouldAutoRedirect =
        !inIframe &&
        !isInAppBrowser &&
        !standalone &&
        (msg.includes('popup-blocked') ||
          msg.includes('operation-not-supported-in-this-environment') ||
          msg.includes('web-storage-unsupported'));

      if (shouldAutoRedirect) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr) {
          const redirMsg = redirErr instanceof Error ? redirErr.message : String(redirErr);
          setErrorMsg(formatAuthError(redirMsg));
        }
      } else {
        onAuthCompleted({});
        setErrorMsg(formatAuthError(msg));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-violet-400/35 bg-[#141132] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-xl font-black text-white">
            Sign In with Google
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Use your Google account to save coins, join the leaderboard, claim referrals, and redeem real Google Play vouchers.
        </p>

        {isInAppBrowser && (
          <div className="mt-4 space-y-2.5 rounded-2xl border border-amber-400/45 bg-amber-500/15 p-3.5 text-xs text-amber-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div className="leading-relaxed">
                <strong className="text-amber-200">
                  WhatsApp / Instagram Browser Detected:
                </strong>{' '}
                Google Sign-In yahan block hota hai. Upar <strong className="text-white">⋮ (3 dots)</strong> dabakar{' '}
                <strong className="text-white">&quot;Open in Chrome&quot;</strong> karein, ya link copy karke Chrome me kholein.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyAppLink}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link for Chrome'}</span>
              </button>
              <a
                href={`intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Chrome</span>
              </a>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/15 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-red-200">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="google-ref" className="block text-xs font-bold text-slate-300">
              Referral Code (Optional · +100 Coins)
            </label>
            <div className="relative mt-1.5">
              <Gift className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
              <input
                id="google-ref"
                type="text"
                maxLength={16}
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="e.g. QR8K2M9A"
                className="font-mono-num min-h-[44px] w-full rounded-xl border border-white/15 bg-[#0b0820] pl-9 pr-3 py-2 text-sm uppercase text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg hover:bg-slate-100 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
            <span>{busy ? 'Signing In...' : 'Continue with Google'}</span>
          </button>

          {!inIframe && !isInAppBrowser && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRedirectSignIn}
              className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Popup na khule? Alternate Google Sign-In (Mobile / PWA)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAuthError(msg: string): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (msg.includes('unauthorized-domain')) {
    return `Domain "${host}" Firebase Authorized Domains mein add nahi hai. Firebase Console -> Authentication -> Settings -> Authorized domains mein "${host}" add karein.`;
  }
  if (msg.includes('api-key-not-valid') || msg.includes('invalid-api-key')) {
    return 'Firebase config purani/invalid cached hai. Page ko hard refresh karein (ya Vercel par latest code push/redeploy karein).';
  }
  if (msg.includes('popup-blocked')) {
    return 'Browser ne Google Sign-In popup block kiya hai. Popups allow karein ya niche "Alternate Google Sign-In" button dabayein.';
  }
  if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
    return 'Google Sign-In cancel ho gaya ya popup band ho gaya. Dobara try karein (agar mobile/PWA par hain toh "Alternate Google Sign-In" use karein).';
  }
  if (msg.includes('operation-not-allowed')) {
    return 'Firebase Console mein Google Sign-In provider enable nahi hai. Authentication -> Sign-in method mein Google enable karein.';
  }
  if (msg.includes('network-request-failed')) {
    return 'Network error — apna internet connection check karke dobara try karein.';
  }
  return msg || 'Google Sign-In failed. Please try again.';
}
