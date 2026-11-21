import { UserProgress } from '../types/quiz';

const STORAGE_KEY = 'quizrush_prefs_v4';

export const DEFAULT_PROGRESS: UserProgress = {
  displayName: 'Player',
  email: '',
  phoneNumber: '',
  authProvider: 'guest',
  coins: 0,
  totalEarnedCoins: 0,
  roundsPlayed: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  bestStreak: 0,
  referralCode: '',
  referredBy: null,
  referralCount: 0,
  soundEnabled: true,
  language: 'en',
  lastDailyBonusDate: null,
  lastSpinDate: null,
  dailyRoundsDate: null,
  dailyRoundsCount: 0,
  quizzesSinceAd: 0,
  categoryStats: {
    gk: { played: 0, correct: 0 },
    cricket: { played: 0, correct: 0 },
    tech: { played: 0, correct: 0 },
    brain: { played: 0, correct: 0 },
  },
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      language: parsed.language === 'hi' ? 'hi' : 'en',
      categoryStats: {
        ...DEFAULT_PROGRESS.categoryStats,
        ...(parsed.categoryStats ?? {}),
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
