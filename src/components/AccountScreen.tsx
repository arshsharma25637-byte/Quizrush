import { User } from 'firebase/auth';
import {
  Check,
  Copy,
  Edit3,
  Gift,
  LogIn,
  LogOut,
  Mail,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { UserProgress } from '../types/quiz';

interface AccountScreenProps {
  user: User | null;
  progress: UserProgress;
  isAdmin: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onUpdateName: (newName: string) => Promise<void>;
  onClaimReferral: (code: string) => Promise<void>;
}

export function AccountScreen({
  user,
  progress,
  isAdmin,
  onOpenAuth,
  onSignOut,
  onUpdateName,
  onClaimReferral,
}: AccountScreenProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.displayName);
  const [savingName, setSavingName] = useState(false);

  const [friendCode, setFriendCode] = useState('');
  const [claimingRef, setClaimingRef] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl border border-violet-400/30 bg-[#150f30]/90 p-7 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-300">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">Your QuizRush Account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in with your Google Account to view your profile, share your referral code for +100 coins, and redeem real Google Play vouchers.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-600/25 hover:brightness-110"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  const initials = (progress.displayName || 'P')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSavingName(true);
    try {
      await onUpdateName(nameInput);
      setEditingName(false);
      setFeedback({ type: 'ok', text: 'Account name updated!' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update name.',
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(progress.referralCode);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleShareReferral = async () => {
    const shareUrl = `${window.location.origin}?ref=${progress.referralCode}`;
    const shareText = `Join me on QuizRush & earn +100 Coins! Use my referral code: ${progress.referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuizRush — Win Google Play Vouchers',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} (${shareUrl})`);
      setFeedback({ type: 'ok', text: 'Invite message & link copied to clipboard!' });
    } catch {
      // Ignore
    }
  };

  const handleClaimFriendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setClaimingRef(true);
    try {
      await onClaimReferral(friendCode);
      setFriendCode('');
      setFeedback({
        type: 'ok',
        text: 'Referral applied! +100 Coins credited to you and your friend.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Invalid referral code.',
      });
    } finally {
      setClaimingRef(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === 'ok'
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-red-400/40 bg-red-500/15 text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Account Profile Card */}
        <section className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5 lg:col-span-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={progress.displayName}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-2xl border border-violet-400/40 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-lg font-black text-white">
                  {initials}
                </div>
              )}

              <div>
                <h1 className="text-lg font-black text-white">{progress.displayName}</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Google Verified</span>
                  </span>
                  {isAdmin && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="font-bold text-amber-300">Admin</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!editingName && (
              <button
                type="button"
                onClick={() => {
                  setNameInput(progress.displayName);
                  setEditingName(true);
                }}
                aria-label="Edit account name"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>

          {editingName && (
            <form onSubmit={handleSaveName} className="mt-4 flex gap-2">
              <input
                type="text"
                maxLength={80}
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="min-h-[42px] flex-1 rounded-xl border border-white/15 bg-[#0b0820] px-3 text-sm text-white focus:border-violet-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={savingName}
                className="min-h-[42px] rounded-xl bg-emerald-500 px-4 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="min-h-[42px] rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="mt-5 space-y-2.5 text-sm">

            {progress.email && (
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/25 px-3.5 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </span>
                <span className="truncate text-xs font-bold text-white max-w-[200px]">
                  {progress.email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/25 px-3.5 py-2.5">
              <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                <Users className="h-3.5 w-3.5" />
                <span>Friends Referred</span>
              </span>
              <span className="font-mono-num text-xs font-bold text-amber-300 tabular-nums">
                {progress.referralCount} ({(progress.referralCount * 100).toLocaleString('en-IN')} Coins)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-extrabold text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </section>

        {/* Refer & Earn +100 Coins */}
        <section className="space-y-4 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-[#150f30] to-violet-900/20 p-5 lg:col-span-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white">Refer & Earn +100 Coins</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Share your code with friends. When they sign up and enter your code, <strong className="text-amber-300">both of you earn +100 Coins</strong>!
              </p>
            </div>
            <Gift className="h-6 w-6 shrink-0 text-amber-400" />
          </div>

          <div className="rounded-2xl border border-amber-400/35 bg-black/40 p-4">
            <div className="text-[11px] font-semibold text-slate-400">Your Referral Code</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono-num text-2xl font-black tracking-widest text-amber-300">
                {progress.referralCode || 'LOADING'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareReferral}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enter a friend's referral code */}
          <div className="border-t border-white/10 pt-4">
            {progress.referredBy ? (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-200">
                Referral bonus claimed (+100 Coins credited).
              </div>
            ) : (
              <form onSubmit={handleClaimFriendCode} className="space-y-2.5">
                <label htmlFor="claim-ref-code" className="block text-xs font-bold text-slate-300">
                  Have a Friend&apos;s Referral Code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="claim-ref-code"
                    type="text"
                    maxLength={16}
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. QR8K2M9A)"
                    className="font-mono-num min-h-[44px] flex-1 rounded-xl border border-white/15 bg-[#0b0820] px-3 py-2 text-xs font-bold uppercase text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={claimingRef || friendCode.trim().length < 6}
                    className="min-h-[44px] shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {claimingRef ? 'Claiming...' : 'Claim +100'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
