import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface LuckySpinModalProps {
  open: boolean;
  canSpin: boolean;
  onClose: () => void;
  onWinCoins: (amount: number) => Promise<void>;
}

const SEGMENTS = [
  { label: '+10', amount: 10, color: '#7c3aed' },
  { label: '+25', amount: 25, color: '#0891b2' },
  { label: '+15', amount: 15, color: '#db2777' },
  { label: '+50', amount: 50, color: '#d97706' },
  { label: '+20', amount: 20, color: '#059669' },
  { label: '+100', amount: 100, color: '#eab308' },
];

export function LuckySpinModal({ open, canSpin, onClose, onWinCoins }: LuckySpinModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  if (!open) return null;

  const handleSpin = () => {
    if (!canSpin || spinning || wonAmount !== null) return;
    setSpinning(true);

    const chosenIndex = Math.floor(Math.random() * SEGMENTS.length);
    const sliceDeg = 360 / SEGMENTS.length;
    const targetSliceCenter = chosenIndex * sliceDeg + sliceDeg / 2;
    const totalDeg = 360 * 5 + (360 - targetSliceCenter);
    setRotation((prev) => prev + totalDeg);

    window.setTimeout(async () => {
      const prize = SEGMENTS[chosenIndex].amount;
      await onWinCoins(prize);
      setWonAmount(prize);
      setSpinning(false);
    }, 3200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl border border-amber-400/40 bg-[#150f30] p-6 text-center shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>DAILY LUCKY SPIN</span>
          </div>
          <button
            type="button"
            disabled={spinning}
            onClick={() => {
              setWonAmount(null);
              onClose();
            }}
            aria-label="Close wheel"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 id="spin-modal-title" className="mt-2 text-xl font-black text-white">
          Spin & Win Bonus Coins
        </h2>

        {/* Wheel */}
        <div className="relative mx-auto mt-5 h-56 w-56">
          {/* Pointer */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-amber-300 drop-shadow"
          />

          <svg
            viewBox="0 0 200 200"
            className="h-full w-full rounded-full border-4 border-amber-400/70 shadow-xl shadow-violet-950/60"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.1s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (360 / SEGMENTS.length) * i;
              const nextAngle = angle + 360 / SEGMENTS.length;
              const startRad = ((angle - 90) * Math.PI) / 180;
              const endRad = ((nextAngle - 90) * Math.PI) / 180;
              const x1 = 100 + 100 * Math.cos(startRad);
              const y1 = 100 + 100 * Math.sin(startRad);
              const x2 = 100 + 100 * Math.cos(endRad);
              const y2 = 100 + 100 * Math.sin(endRad);

              const midRad = (((angle + nextAngle) / 2 - 90) * Math.PI) / 180;
              const tx = 100 + 62 * Math.cos(midRad);
              const ty = 100 + 62 * Math.sin(midRad);

              return (
                <g key={seg.label}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="#090617"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#ffffff"
                    fontSize="14"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="16" fill="#090617" stroke="#fbbf24" strokeWidth="3" />
          </svg>
        </div>

        {wonAmount !== null ? (
          <div className="mt-5 space-y-3">
            <div className="font-mono-num text-2xl font-black text-amber-300">
              +{wonAmount} Coins Won!
            </div>
            <button
              type="button"
              onClick={() => {
                setWonAmount(null);
                onClose();
              }}
              className="min-h-[46px] w-full rounded-xl bg-emerald-500 text-sm font-extrabold text-slate-950 hover:bg-emerald-400"
            >
              Awesome, Collect!
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canSpin || spinning}
            onClick={handleSpin}
            className="mt-6 min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {spinning ? 'Spinning...' : canSpin ? 'Spin Wheel Now' : 'Come Back Tomorrow'}
          </button>
        )}
      </div>
    </div>
  );
}
