import { User } from 'firebase/auth';
import {
  Check,
  Clock,
  Copy,
  Info,
  LogIn,
  Play,
  ShieldCheck,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { VOUCHER_TIERS } from '../data/questions';
import {
  RedemptionRequest,
  VoucherAvailability,
  VoucherTier,
  VoucherTierId,
} from '../types/quiz';

interface WalletScreenProps {
  user: User | null;
  coins: number;
  rewardAdCoins: number;
  availability: Record<VoucherTierId, VoucherAvailability>;
  requests: RedemptionRequest[];
  submittingTierId: string | null;
  onSignIn: () => void;
  onSubmitRedemption: (tier: VoucherTier) => Promise<void>;
  onWatchRewardAd: () => void;
}

export function WalletScreen({
  user,
  coins,
  rewardAdCoins,
  availability,
  requests,
  submittingTierId,
  onSignIn,
  onSubmitRedemption,
  onWatchRewardAd,
}: WalletScreenProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justSubmittedTier, setJustSubmittedTier] = useState<VoucherTier | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const handleRedeem = async (tier: VoucherTier) => {
    setErrorMsg(null);
    try {
      await onSubmitRedemption(tier);
      setJustSubmittedTier(tier);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit redemption request.');
    }
  };

  const handleCopyCode = async (req: RedemptionRequest) => {
    if (!req.voucherCode) return;
    try {
      await navigator.clipboard.writeText(req.voucherCode);
      setCopiedId(req.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 @[960px]:grid-cols-12 @[960px]:items-start">
      {/* Left Column: Balance Banner & Voucher Store */}
      <div className="space-y-5 @[960px]:col-span-7">
        {/* Google Play Balance Banner */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-950/90 to-teal-900/70 p-5">
          <div>
            <p className="text-xs font-semibold text-emerald-300">
              Google Play Real Voucher Store
            </p>
            <h1 className="font-mono-num mt-1 text-2xl font-black text-white tabular-nums sm:text-3xl">
              {coins.toLocaleString('en-IN')} Coins
            </h1>
            <p className="mt-1 text-xs text-emerald-100/80">
              Redeem coins for genuine Google Play gift codes delivered by Admin
            </p>
          </div>

          <button
            type="button"
            onClick={onWatchRewardAd}
            className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-white/15 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur transition-colors hover:bg-white/25 active:scale-95"
          >
            <Play className="h-4 w-4 fill-current text-amber-300" />
            <span>Bonus +{rewardAdCoins} Coins</span>
          </button>
        </section>

        {!user && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4">
            <div>
              <div className="text-sm font-extrabold text-amber-200">
                Google Sign-In Required for Real Vouchers
              </div>
              <p className="mt-0.5 text-xs text-amber-100/80">
                Sign in with your Google account so your real redeem code is delivered securely to your wallet.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          </section>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs font-semibold text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Voucher Tiers Grid */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-white sm:text-lg">
              Redeem Real Vouchers
            </h2>
            <button
              type="button"
              aria-expanded={showDeliveryInfo}
              aria-controls="voucher-delivery-tooltip"
              onClick={() => setShowDeliveryInfo((prev) => !prev)}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Withdrawal &amp; Delivery (24–48h)</span>
            </button>
          </div>

          {showDeliveryInfo && (
            <div
              id="voucher-delivery-tooltip"
              role="region"
              aria-label="Google Play voucher withdrawal process and delivery time"
              className="mb-4 rounded-2xl border border-emerald-400/35 bg-[#122031]/95 p-4 text-xs leading-relaxed text-slate-200 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-extrabold text-emerald-300">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>How Google Play Withdrawals Work</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeliveryInfo(false)}
                  aria-label="Close delivery info"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-slate-300">
                <li>
                  <strong className="text-white">1. Request:</strong> Tap <span className="text-emerald-300 font-semibold">Request Real Code</span> once you have enough coins. Your coins are reserved immediately.
                </li>
                <li>
                  <strong className="text-white">2. Typical Delivery Time:</strong> Admin reviews &amp; delivers verified Google Play codes within <strong className="text-amber-300">24–48 hours</strong> (faster when stock is available).
                </li>
                <li>
                  <strong className="text-white">3. Claim &amp; Refund Guarantee:</strong> Your code unlocks automatically in <span className="text-white font-semibold">Your Voucher Requests</span> with a Copy button. Rejected requests receive a 100% coin refund.
                </li>
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            {VOUCHER_TIERS.map((tier) => {
              const unlocked = Boolean(user) && coins >= tier.costCoins;
              const needed = Math.max(0, tier.costCoins - coins);
              const stockCount = availability[tier.id]?.availableCount ?? 0;
              const isSubmitting = submittingTierId === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                    unlocked
                      ? 'border-emerald-400/70 bg-gradient-to-b from-slate-800/90 to-slate-900/95 shadow-lg shadow-emerald-950/30'
                      : 'border-white/10 bg-slate-900/75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <Ticket className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-bold text-slate-300">
                        {stockCount > 0 ? `${stockCount} in stock` : 'Manual delivery'}
                      </span>
                    </div>

                    <div className="mt-3 text-2xl font-black text-white">
                      ₹{tier.amountInr}
                    </div>
                    <div className="text-xs font-medium text-slate-300">Google Play Code</div>
                    <div className="font-mono-num mt-2 text-xs font-bold text-amber-300 tabular-nums">
                      {tier.costCoins.toLocaleString('en-IN')} Coins
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!unlocked || isSubmitting}
                    onClick={() => handleRedeem(tier)}
                    className={`mt-4 min-h-[44px] w-full whitespace-nowrap rounded-xl px-3 py-2 text-xs font-extrabold transition-all ${
                      unlocked && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-[0.98]'
                        : 'cursor-not-allowed bg-white/5 text-slate-400'
                    }`}
                  >
                    {!user
                      ? 'Sign in to Redeem'
                      : isSubmitting
                      ? 'Submitting...'
                      : unlocked
                      ? 'Request Real Code'
                      : `Need ${needed.toLocaleString('en-IN')}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Live Redemption Requests & Delivered Real Codes */}
      <aside className="space-y-4 @[960px]:col-span-5">
        <div className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">Your Voucher Requests</h2>
            <span className="font-mono-num text-xs font-bold text-slate-400 tabular-nums">
              {requests.length} total
            </span>
          </div>

          {!user ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
              <Ticket className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-2 text-sm font-semibold text-slate-300">Sign in to view your vouchers</p>
              <p className="mt-1 text-xs text-slate-400">
                Your pending requests and delivered real Google Play codes appear here.
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
              <Ticket className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-2 text-sm font-semibold text-slate-300">No redemption requests yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Collect 10,000 coins and submit a request to receive a real ₹10 Google Play voucher code.
              </p>
            </div>
          ) : (
            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {requests.map((req) => {
                const isCopied = copiedId === req.id;

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          ₹{req.amountInr} Google Play
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="font-mono-num text-xs text-amber-300 tabular-nums">
                          -{req.costCoins.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {req.status === 'fulfilled' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-300">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Refunded</span>
                        </span>
                      )}
                    </div>

                    {req.status === 'fulfilled' && req.voucherCode && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/40 px-3 py-2">
                        <span className="font-mono-num truncate text-xs font-bold tracking-wider text-emerald-300">
                          {req.voucherCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(req)}
                          className="inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-md bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/30"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Waiting for Admin to assign your real Google Play code. It will appear right here automatically.
                      </p>
                    )}

                    {req.adminNote && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{req.adminNote}</p>
                    )}

                    <div className="mt-1.5 text-[11px] text-slate-500">
                      {new Date(req.createdAtMs).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-black/25 p-3 text-[11px] leading-relaxed text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              No fake or random demo codes are ever generated. Every code shown here is verified and issued directly by the Admin.
            </span>
          </div>
        </div>
      </aside>

      {/* Request Submitted Confirmation Modal */}
      {justSubmittedTier && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-submitted-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-3xl border border-emerald-400/50 bg-[#141132] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Clock className="h-7 w-7" />
            </div>

            <h3 id="request-submitted-title" className="mt-3 text-xl font-black text-white">
              ₹{justSubmittedTier.amountInr} Request Submitted!
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {justSubmittedTier.costCoins.toLocaleString('en-IN')} coins have been reserved from your wallet. As soon as the Admin assigns a real Google Play redeem code, it will unlock live in your Voucher Requests list.
            </p>

            <button
              type="button"
              onClick={() => setJustSubmittedTier(null)}
              className="mt-5 min-h-[44px] w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
