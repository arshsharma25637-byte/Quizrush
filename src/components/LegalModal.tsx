import { Clock, ShieldCheck, X } from 'lucide-react';

interface LegalModalProps {
  openTab: 'rules' | 'privacy' | null;
  onClose: () => void;
}

export function LegalModal({ openTab, onClose }: LegalModalProps) {
  if (!openTab) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#141132] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <h2 id="legal-modal-title" className="text-lg font-black text-white">
              {openTab === 'rules' ? 'QuizRush Rules & Real Rewards' : 'Privacy Policy'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {openTab === 'rules' ? (
          <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-300">
            <p>
              <strong className="text-white">1. Fair Online Gameplay:</strong> QuizRush operates strictly online. Automated scripts, emulators, multiple fake accounts for referral farming, or coin-tampering attempts result in account disqualification.
            </p>
            <p>
              <strong className="text-white">2. How Real Google Play Vouchers Work:</strong> Coins earned from trivia, referrals (+100 coins), daily check-ins, and lucky spins can be redeemed for genuine Google Play gift codes (₹10, ₹25, ₹50, ₹100). All requests are verified and delivered directly into your Voucher Wallet by our Admin team.
            </p>

            {/* Dedicated Withdrawal Process & Delivery Time Section */}
            <section
              aria-labelledby="withdrawal-process-heading"
              className="rounded-2xl border border-emerald-400/30 bg-emerald-950/35 p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-300">
                <Clock className="h-4 w-4 shrink-0" />
                <h3 id="withdrawal-process-heading" className="text-xs font-extrabold tracking-wide text-white">
                  Withdrawal Process &amp; Typical Delivery Time
                </h3>
              </div>
              <ol className="list-decimal space-y-1.5 pl-4 text-xs text-slate-200">
                <li>
                  <strong className="text-white">Submit Request:</strong> Reach the required coins (starting at 10,000 coins for ₹10) and tap <span className="font-semibold text-emerald-300">Request Real Code</span> in the Vouchers tab.
                </li>
                <li>
                  <strong className="text-white">Verification &amp; Reserve:</strong> Your coins are reserved immediately while Admin verifies fair play and assigns a genuine Google Play redeem code.
                </li>
                <li>
                  <strong className="text-white">Delivery Time (24–48 Hours):</strong> Most verified vouchers are delivered within <strong className="text-amber-300">24 to 48 hours</strong> (often faster when stock is ready). Once fulfilled, your code unlocks automatically under <span className="font-semibold text-white">Your Voucher Requests</span> with a one-tap Copy button.
                </li>
                <li>
                  <strong className="text-white">Redeem on Play Store:</strong> Open Google Play Store → Profile → Payments &amp; subscriptions → Redeem code, and paste your delivered voucher.
                </li>
              </ol>
            </section>

            <p>
              <strong className="text-white">3. Refunds on Rejection:</strong> If any redemption request cannot be fulfilled, 100% of the reserved coins are refunded directly back to your wallet balance.
            </p>
            <p>
              <strong className="text-white">4. Sponsor Breaks:</strong> Short sponsor breaks between rounds help fund genuine Google Play voucher rewards for our community.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              <strong className="text-white">1. Data We Collect:</strong> We store your chosen display name, verified Google email address, trivia stats, coin balance, and redemption history securely in Firebase Firestore.
            </p>
            <p>
              <strong className="text-white">2. Zero PII Sharing:</strong> Your Google email address is private and strictly visible only to you and the Admin for voucher delivery. The public Leaderboard only displays your display name and coin score.
            </p>
            <p>
              <strong className="text-white">3. Authentication Security:</strong> Sign-in is handled via Firebase Authentication (Google Sign-In). QuizRush never stores raw passwords.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-[44px] w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-violet-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
