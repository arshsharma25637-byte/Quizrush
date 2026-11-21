import { BarChart3, Gamepad2, Ticket, Trophy, User as UserIcon } from 'lucide-react';
import { ScreenView } from '../types/quiz';

interface BottomNavProps {
  activeView: ScreenView;
  onNavigate: (view: ScreenView) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const isPlayActive = activeView === 'home' || activeView === 'quiz' || activeView === 'result';

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 grid h-16 grid-cols-5 items-center border-t border-white/10 bg-[#0d0821]/95 px-1 backdrop-blur-md lg:hidden"
    >
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
          isPlayActive ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Gamepad2 className={`h-5 w-5 ${isPlayActive ? 'text-violet-400' : ''}`} />
        <span className="whitespace-nowrap">Play</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('ranks')}
        className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
          activeView === 'ranks' ? 'bg-amber-500/20 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Trophy className={`h-5 w-5 ${activeView === 'ranks' ? 'text-amber-300' : ''}`} />
        <span className="whitespace-nowrap">Ranks</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('wallet')}
        className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
          activeView === 'wallet' ? 'bg-emerald-600/20 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Ticket className={`h-5 w-5 ${activeView === 'wallet' ? 'text-emerald-400' : ''}`} />
        <span className="whitespace-nowrap">Vouchers</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('stats')}
        className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
          activeView === 'stats' ? 'bg-cyan-600/20 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 className={`h-5 w-5 ${activeView === 'stats' ? 'text-cyan-400' : ''}`} />
        <span className="whitespace-nowrap">Stats</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('account')}
        className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
          activeView === 'account' ? 'bg-pink-600/20 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <UserIcon className={`h-5 w-5 ${activeView === 'account' ? 'text-pink-400' : ''}`} />
        <span className="whitespace-nowrap">Account</span>
      </button>
    </nav>
  );
}
