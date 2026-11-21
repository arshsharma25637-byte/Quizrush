import { User } from 'firebase/auth';
import { LogIn, Shield, User as UserIcon, Volume2, VolumeX } from 'lucide-react';
import { ScreenView } from '../types/quiz';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  coins: number;
  coinPop: boolean;
  soundEnabled: boolean;
  user: User | null;
  displayName: string;
  isAdmin: boolean;
  authLoading: boolean;
  onOpenAuth: () => void;
  onToggleSound: () => void;
  onNavigate: (view: ScreenView) => void;
  activeView: ScreenView;
}

export function TopBar({
  coins,
  coinPop,
  soundEnabled,
  user,
  displayName,
  isAdmin,
  authLoading,
  onOpenAuth,
  onToggleSound,
  onNavigate,
  activeView,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#0e0924]/85 px-4 backdrop-blur-md lg:px-8">
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className="flex min-h-[44px] items-center gap-2.5 rounded-xl pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <img
          src="/pwa-192x192.png"
          alt="QuizRush"
          className="h-9 w-9 shrink-0 rounded-xl border border-amber-400/40 object-cover shadow-lg shadow-violet-600/30"
        />
        <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-white">
          QuizRush
        </span>
      </button>

      <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`min-h-[40px] whitespace-nowrap transition-colors ${
            activeView === 'home' || activeView === 'quiz' || activeView === 'result'
              ? 'text-white underline decoration-violet-400 decoration-2 underline-offset-8'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Play
        </button>
        <button
          type="button"
          onClick={() => onNavigate('ranks')}
          className={`min-h-[40px] whitespace-nowrap transition-colors ${
            activeView === 'ranks'
              ? 'text-white underline decoration-amber-400 decoration-2 underline-offset-8'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Ranks
        </button>
        <button
          type="button"
          onClick={() => onNavigate('wallet')}
          className={`min-h-[40px] whitespace-nowrap transition-colors ${
            activeView === 'wallet'
              ? 'text-white underline decoration-emerald-400 decoration-2 underline-offset-8'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Vouchers
        </button>
        <button
          type="button"
          onClick={() => onNavigate('stats')}
          className={`min-h-[40px] whitespace-nowrap transition-colors ${
            activeView === 'stats'
              ? 'text-white underline decoration-cyan-400 decoration-2 underline-offset-8'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Stats
        </button>
        <button
          type="button"
          onClick={() => onNavigate('account')}
          className={`min-h-[40px] whitespace-nowrap transition-colors ${
            activeView === 'account'
              ? 'text-white underline decoration-pink-400 decoration-2 underline-offset-8'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Account
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeView === 'admin'
                ? 'text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-8'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <PWAInstallButton variant="header" />

        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            title="Admin Desk"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-amber-300 lg:hidden"
          >
            <Shield className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('wallet')}
          title="Open Voucher Wallet"
          className={`flex min-h-[40px] items-center gap-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-amber-600/15 px-3 py-1.5 font-extrabold text-amber-300 shadow-sm shadow-amber-500/20 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            coinPop ? 'scale-110' : 'scale-100'
          }`}
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 text-[11px] font-black text-amber-950 shadow-inner">
            ₹
          </span>
          <span className="font-mono-num whitespace-nowrap text-sm tabular-nums">
            {coins.toLocaleString('en-IN')}
          </span>
        </button>

        {!authLoading &&
          (user ? (
            <button
              type="button"
              onClick={() => onNavigate('account')}
              title="Open Account & Referrals"
              className="flex h-10 max-w-[120px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-violet-300" />
              <span className="truncate">{displayName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-violet-600 px-3.5 text-xs font-extrabold text-white transition-colors hover:bg-violet-500"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          ))}
      </div>
    </header>
  );
}
