import {
  Check,
  Coins,
  Eye,
  EyeOff,
  Megaphone,
  PackagePlus,
  Search,
  Send,
  Shield,
  Sliders,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { VOUCHER_TIERS } from '../data/questions';
import {
  AdminPlayerSummary,
  EconomyConfig,
  RedemptionRequest,
  SponsorConfig,
  VoucherAvailability,
  VoucherStockItem,
  VoucherTierId,
} from '../types/quiz';
import { PromoReelStudio } from './PromoReelStudio';

interface AdminPanelScreenProps {
  requests: RedemptionRequest[];
  stock: VoucherStockItem[];
  availability: Record<VoucherTierId, VoucherAvailability>;
  sponsor: SponsorConfig | null;
  economy: EconomyConfig;
  players: AdminPlayerSummary[];
  onAddBulkStock: (tierId: VoucherTierId, rawCodes: string[]) => Promise<number>;
  onDeleteStock: (item: VoucherStockItem) => Promise<void>;
  onFulfillFromStock: (req: RedemptionRequest, stockItem: VoucherStockItem) => Promise<void>;
  onFulfillDirect: (req: RedemptionRequest, code: string) => Promise<void>;
  onRejectAndRefund: (req: RedemptionRequest) => Promise<void>;
  onSaveSponsor: (config: SponsorConfig) => Promise<void>;
  onSaveEconomy: (config: EconomyConfig) => Promise<void>;
  onAdjustPlayerCoins: (uid: string, nextCoins: number) => Promise<void>;
}

export function AdminPanelScreen({
  requests,
  stock,
  availability,
  sponsor,
  economy,
  players,
  onAddBulkStock,
  onDeleteStock,
  onFulfillFromStock,
  onFulfillDirect,
  onRejectAndRefund,
  onSaveSponsor,
  onSaveEconomy,
  onAdjustPlayerCoins,
}: AdminPanelScreenProps) {
  const [selectedTier, setSelectedTier] = useState<VoucherTierId>('gp-10');
  const [bulkCodesText, setBulkCodesText] = useState('');
  const [directCodes, setDirectCodes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showStockCodes, setShowStockCodes] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Sponsor Ad editor state
  const [spBadge, setSpBadge] = useState(sponsor?.badgeText ?? 'SPONSORED');
  const [spTitle, setSpTitle] = useState(sponsor?.title ?? 'QuizBoost Daily Partner');
  const [spDesc, setSpDesc] = useState(
    sponsor?.description ??
      'Short sponsor breaks help keep QuizRush trivia free and fund real Google Play vouchers.'
  );
  const [spCta, setSpCta] = useState(sponsor?.ctaLabel ?? 'Visit Partner');
  const [spUrl, setSpUrl] = useState(sponsor?.targetUrl ?? '');
  const [spActive, setSpActive] = useState(sponsor?.isActive ?? false);

  // Live Economy editor state
  const [ecoBase, setEcoBase] = useState(String(economy.baseCoinsPerRight));
  const [ecoStreak, setEcoStreak] = useState(String(economy.streakBonusStep));
  const [ecoSpeed, setEcoSpeed] = useState(String(economy.speedBonusCoins));
  const [ecoDailyBonus, setEcoDailyBonus] = useState(String(economy.dailyBonusCoins));
  const [ecoAdCoins, setEcoAdCoins] = useState(String(economy.rewardAdCoins));
  const [ecoRoundLimit, setEcoRoundLimit] = useState(String(economy.dailyRoundLimit));

  // Player coin manager state
  const [playerSearch, setPlayerSearch] = useState('');
  const [customCoinsMap, setCustomCoinsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sponsor) return;
    setSpBadge(sponsor.badgeText);
    setSpTitle(sponsor.title);
    setSpDesc(sponsor.description);
    setSpCta(sponsor.ctaLabel);
    setSpUrl(sponsor.targetUrl);
    setSpActive(sponsor.isActive);
  }, [sponsor]);

  useEffect(() => {
    setEcoBase(String(economy.baseCoinsPerRight));
    setEcoStreak(String(economy.streakBonusStep));
    setEcoSpeed(String(economy.speedBonusCoins));
    setEcoDailyBonus(String(economy.dailyBonusCoins));
    setEcoAdCoins(String(economy.rewardAdCoins));
    setEcoRoundLimit(String(economy.dailyRoundLimit));
  }, [economy]);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');
  const availableStock = stock.filter((s) => s.status === 'available');

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const lines = bulkCodesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setFeedback({ type: 'err', text: 'Paste at least one valid code (8–40 characters).' });
      return;
    }

    setBusyId('add-stock');
    try {
      const added = await onAddBulkStock(selectedTier, lines);
      if (added === 0) {
        setFeedback({ type: 'err', text: 'Codes must be 8–40 characters long.' });
      } else {
        setBulkCodesText('');
        setFeedback({
          type: 'ok',
          text: `Added ${added} real ${selectedTier.toUpperCase()} voucher code(s) to stock.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to add stock.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setBusyId('save-sponsor');
    try {
      await onSaveSponsor({
        badgeText: spBadge,
        title: spTitle,
        description: spDesc,
        ctaLabel: spCta,
        targetUrl: spUrl,
        isActive: spActive,
      });
      setFeedback({ type: 'ok', text: 'Sponsor Ad settings saved and live between quizzes!' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to save sponsor settings.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveEconomy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setBusyId('save-economy');
    try {
      await onSaveEconomy({
        baseCoinsPerRight: Number(ecoBase) || 10,
        streakBonusStep: Number(ecoStreak) || 0,
        speedBonusCoins: Number(ecoSpeed) || 0,
        dailyBonusCoins: Number(ecoDailyBonus) || 0,
        rewardAdCoins: Number(ecoAdCoins) || 0,
        dailyRoundLimit: Number(ecoRoundLimit) || 0,
      });
      setFeedback({
        type: 'ok',
        text: 'Economy rates & daily round limits updated live for all players!',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to save economy settings.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.displayName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.uid.toLowerCase().includes(q)
    );
  });

  const runAction = async (id: string, fn: () => Promise<void>, okMessage: string) => {
    setFeedback(null);
    setBusyId(id);
    try {
      await fn();
      setFeedback({ type: 'ok', text: okMessage });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Action failed.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-black text-white sm:text-2xl">Admin Voucher Desk</h1>
            <p className="text-xs text-slate-400">
              Manage real Google Play voucher stock, fulfill requests, and configure live Sponsor Ads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-amber-300">{pendingRequests.length} Pending</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">{availableStock.length} In Stock</span>
        </div>
      </div>

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

      {/* Viral Instagram & Facebook Reel Video Maker (Admin-only) */}
      <PromoReelStudio />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Pending Requests Queue & Processed Log */}
        <div className="space-y-5 lg:col-span-7">
          <section className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Pending Redemption Requests</h2>
              <span className="font-mono-num text-xs font-bold text-amber-300 tabular-nums">
                {pendingRequests.length} waiting
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-slate-400">
                No pending requests right now. When players redeem coins, their requests appear here in real time.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {pendingRequests.map((req) => {
                  const matchingStock = availableStock.filter((s) => s.tierId === req.tierId);
                  const nextStockItem = matchingStock[0];
                  const directCode = directCodes[req.id] ?? '';
                  const isBusy = busyId === req.id;

                  return (
                    <div
                      key={req.id}
                      className="space-y-3 rounded-2xl border border-amber-400/30 bg-black/30 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-white">
                            {req.userName}{' '}
                            <span className="font-normal text-slate-400">({req.userContact})</span>
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            Requested <span className="font-bold text-emerald-300">₹{req.amountInr} Google Play</span> ·{' '}
                            <span className="font-mono-num text-amber-300">{req.costCoins.toLocaleString('en-IN')} Coins</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(req.createdAtMs).toLocaleString()}
                        </span>
                      </div>

                      {nextStockItem && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(
                              req.id,
                              () => onFulfillFromStock(req, nextStockItem),
                              `Assigned real ₹${req.amountInr} code to ${req.userContact}.`
                            )
                          }
                          className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Assign from Stock ({matchingStock.length} available)</span>
                        </button>
                      )}

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={directCode}
                          onChange={(e) =>
                            setDirectCodes((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          placeholder="Paste real Google Play redeem code..."
                          className="font-mono-num min-h-[42px] flex-1 rounded-xl border border-white/15 bg-[#0e0a24] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={isBusy || directCode.trim().length < 8}
                          onClick={() =>
                            runAction(
                              req.id,
                              async () => {
                                await onFulfillDirect(req, directCode);
                                setDirectCodes((prev) => ({ ...prev, [req.id]: '' }));
                              },
                              `Sent real ₹${req.amountInr} code to ${req.userContact}.`
                            )
                          }
                          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Real Code</span>
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(
                              req.id,
                              () => onRejectAndRefund(req),
                              `Rejected request and refunded ${req.costCoins.toLocaleString('en-IN')} coins to ${req.userContact}.`
                            )
                          }
                          className="inline-flex min-h-[36px] items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject & Refund Coins</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
            <h2 className="text-base font-extrabold text-white">Recent Processed Requests</h2>
            {processedRequests.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">No fulfilled or rejected requests yet.</p>
            ) : (
              <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {processedRequests.slice(0, 20).map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{req.userContact}</span>
                      <span className="mx-1.5 text-slate-500">·</span>
                      <span className="text-slate-300">₹{req.amountInr}</span>
                      {req.voucherCode && (
                        <span className="font-mono-num ml-2 text-emerald-300">{req.voucherCode}</span>
                      )}
                    </div>
                    <span
                      className={`font-bold ${
                        req.status === 'fulfilled' ? 'text-emerald-400' : 'text-red-300'
                      }`}
                    >
                      {req.status === 'fulfilled' ? 'Delivered' : 'Refunded'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Player Coin Manager (Reduce / Reset Any Player's Coins) */}
          <section className="rounded-2xl border border-amber-400/25 bg-[#150f30]/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-base font-extrabold text-white">Player Coin Manager</h2>
                  <p className="text-[11px] text-slate-400">
                    Reduce, adjust, or reset any player&apos;s wallet balance anytime
                  </p>
                </div>
              </div>
              <span className="font-mono-num text-xs font-bold text-slate-300 tabular-nums">
                {players.length} players
              </span>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Search player by name or Gmail..."
                className="min-h-[40px] w-full rounded-xl border border-white/15 bg-[#0e0a24] pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {filteredPlayers.length === 0 ? (
              <p className="mt-4 text-center text-xs text-slate-400">No matching players found.</p>
            ) : (
              <div className="mt-3 max-h-96 space-y-2.5 overflow-y-auto pr-1">
                {filteredPlayers.map((player) => {
                  const isBusy = busyId === `coins-${player.uid}`;
                  const customVal = customCoinsMap[player.uid] ?? String(player.coins);

                  return (
                    <div
                      key={player.uid}
                      className="space-y-2.5 rounded-xl border border-white/10 bg-black/30 p-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-white">
                            {player.displayName}
                          </div>
                          <div className="truncate text-[11px] text-slate-400">
                            {player.email} · {player.roundsPlayed} rounds · {player.referralCount} refs
                          </div>
                        </div>
                        <div className="font-mono-num text-sm font-black text-amber-300 tabular-nums">
                          {player.coins.toLocaleString('en-IN')} Coins
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy || player.coins === 0}
                          onClick={() =>
                            runAction(
                              `coins-${player.uid}`,
                              () => onAdjustPlayerCoins(player.uid, Math.max(0, player.coins - 100)),
                              `Reduced ${player.displayName}'s coins by 100.`
                            )
                          }
                          className="min-h-[34px] rounded-lg border border-orange-400/35 bg-orange-500/15 px-2.5 text-xs font-bold text-orange-200 hover:bg-orange-500/25 disabled:opacity-40"
                        >
                          -100
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || player.coins === 0}
                          onClick={() =>
                            runAction(
                              `coins-${player.uid}`,
                              () => onAdjustPlayerCoins(player.uid, Math.max(0, player.coins - 500)),
                              `Reduced ${player.displayName}'s coins by 500.`
                            )
                          }
                          className="min-h-[34px] rounded-lg border border-orange-400/35 bg-orange-500/15 px-2.5 text-xs font-bold text-orange-200 hover:bg-orange-500/25 disabled:opacity-40"
                        >
                          -500
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || player.coins === 0}
                          onClick={() =>
                            runAction(
                              `coins-${player.uid}`,
                              () => onAdjustPlayerCoins(player.uid, Math.floor(player.coins / 2)),
                              `Halved ${player.displayName}'s coins.`
                            )
                          }
                          className="min-h-[34px] rounded-lg border border-amber-400/35 bg-amber-500/15 px-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
                        >
                          50% Cut
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || player.coins === 0}
                          onClick={() =>
                            runAction(
                              `coins-${player.uid}`,
                              () => onAdjustPlayerCoins(player.uid, 0),
                              `Reset ${player.displayName}'s coins to 0.`
                            )
                          }
                          className="min-h-[34px] rounded-lg border border-red-400/35 bg-red-500/15 px-2.5 text-xs font-bold text-red-200 hover:bg-red-500/25 disabled:opacity-40"
                        >
                          Reset 0
                        </button>

                        <div className="ml-auto flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={10000000}
                            value={customVal}
                            onChange={(e) =>
                              setCustomCoinsMap((prev) => ({
                                ...prev,
                                [player.uid]: e.target.value,
                              }))
                            }
                            aria-label={`Set coins for ${player.displayName}`}
                            className="font-mono-num min-h-[34px] w-24 rounded-lg border border-white/15 bg-[#0e0a24] px-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              const parsed = Math.max(
                                0,
                                Math.min(10000000, Math.floor(Number(customVal) || 0))
                              );
                              void runAction(
                                `coins-${player.uid}`,
                                () => onAdjustPlayerCoins(player.uid, parsed),
                                `Set ${player.displayName}'s coins to ${parsed.toLocaleString('en-IN')}.`
                              );
                            }}
                            className="min-h-[34px] rounded-lg bg-amber-400 px-3 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: Live Economy Controls + Add Stock + Live Sponsor Ad Manager */}
        <aside className="space-y-5 lg:col-span-5">
          {/* Live Economy & Daily Limit Controls */}
          <form
            onSubmit={handleSaveEconomy}
            className="space-y-3 rounded-2xl border border-violet-400/30 bg-[#150f30]/90 p-5"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-violet-400" />
              <div>
                <h2 className="text-base font-extrabold text-white">Economy & Daily Limits</h2>
                <p className="text-[11px] text-slate-400">
                  Control coin earning speed & daily round limit live
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Coins / Right Ans (1–100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={ecoBase}
                  onChange={(e) => setEcoBase(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Streak Step (0–25)
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  required
                  value={ecoStreak}
                  onChange={(e) => setEcoStreak(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Speed Bonus (0–25)
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  required
                  value={ecoSpeed}
                  onChange={(e) => setEcoSpeed(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Daily Check-In (0–200)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  required
                  value={ecoDailyBonus}
                  onChange={(e) => setEcoDailyBonus(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Watch Ad Bonus (0–100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={ecoAdCoins}
                  onChange={(e) => setEcoAdCoins(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">
                  Daily Rounds (0 = Unlim)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  required
                  value={ecoRoundLimit}
                  onChange={(e) => setEcoRoundLimit(e.target.value)}
                  className="font-mono-num mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-violet-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busyId === 'save-economy'}
              className="min-h-[42px] w-full rounded-xl bg-violet-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-violet-400 disabled:opacity-50"
            >
              {busyId === 'save-economy' ? 'Saving...' : 'Save Live Economy Settings'}
            </button>
          </form>

          {/* Sponsor Ad Banner Configurator */}
          <form
            onSubmit={handleSaveSponsor}
            className="space-y-3 rounded-2xl border border-cyan-400/25 bg-[#150f30]/90 p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-extrabold text-white">Sponsor Ad Banner</h2>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={spActive}
                  onChange={(e) => setSpActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-400"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300">Badge</label>
                <input
                  type="text"
                  maxLength={40}
                  required
                  value={spBadge}
                  onChange={(e) => setSpBadge(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300">Button Label</label>
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={spCta}
                  onChange={(e) => setSpCta(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300">Ad Headline</label>
              <input
                type="text"
                maxLength={100}
                required
                value={spTitle}
                onChange={(e) => setSpTitle(e.target.value)}
                className="mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300">Description</label>
              <textarea
                rows={2}
                maxLength={280}
                required
                value={spDesc}
                onChange={(e) => setSpDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#0e0a24] p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300">
                Target Link (optional, https://...)
              </label>
              <input
                type="url"
                maxLength={300}
                value={spUrl}
                onChange={(e) => setSpUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 min-h-[38px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={busyId === 'save-sponsor'}
              className="min-h-[42px] w-full rounded-xl bg-cyan-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {busyId === 'save-sponsor' ? 'Saving...' : 'Save Sponsor Ad'}
            </button>
          </form>

          {/* Add Stock */}
          <form
            onSubmit={handleAddStock}
            className="space-y-4 rounded-2xl border border-white/10 bg-[#150f30]/90 p-5"
          >
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">Add Real Voucher Stock</h2>
            </div>

            <div>
              <label htmlFor="stock-tier" className="block text-xs font-bold text-slate-300">
                Voucher Tier
              </label>
              <select
                id="stock-tier"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as VoucherTierId)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 py-2 text-sm font-semibold text-white focus:border-violet-400 focus:outline-none"
              >
                {VOUCHER_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.title} ({availability[tier.id]?.availableCount ?? 0} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bulk-codes" className="block text-xs font-bold text-slate-300">
                Real Google Play Redeem Codes (one per line)
              </label>
              <textarea
                id="bulk-codes"
                rows={3}
                value={bulkCodesText}
                onChange={(e) => setBulkCodesText(e.target.value)}
                placeholder={'Paste purchased Google Play codes here...\nOne code per line'}
                className="font-mono-num mt-1.5 w-full rounded-xl border border-white/15 bg-[#0e0a24] p-3 text-xs text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={busyId === 'add-stock'}
              className="min-h-[46px] w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {busyId === 'add-stock' ? 'Saving Stock...' : 'Add Real Codes to Stock'}
            </button>
          </form>

          {/* Current Stock List */}
          <section className="rounded-2xl border border-white/10 bg-[#150f30]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Stock Inventory</h2>
              <button
                type="button"
                onClick={() => setShowStockCodes((v) => !v)}
                className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                {showStockCodes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showStockCodes ? 'Mask' : 'Reveal'}</span>
              </button>
            </div>

            {availableStock.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">
                No unused codes in stock. You can add stock above or paste a code directly on pending requests.
              </p>
            ) : (
              <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                {availableStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-emerald-300">
                        ₹{item.amountInr} Google Play
                      </div>
                      <div className="font-mono-num truncate text-xs text-slate-200">
                        {showStockCodes
                          ? item.code
                          : `${item.code.slice(0, 4)}••••${item.code.slice(-4)}`}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() =>
                        runAction(item.id, () => onDeleteStock(item), 'Removed code from stock.')
                      }
                      aria-label="Delete available stock item"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
