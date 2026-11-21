export type CategoryId = 'gk' | 'cricket' | 'tech' | 'brain' | 'mix';

export type ScreenView = 'home' | 'ranks' | 'quiz' | 'result' | 'wallet' | 'stats' | 'account' | 'admin';

export type QuizLanguage = 'en' | 'hi';

export type VoucherTierId = 'gp-10' | 'gp-25' | 'gp-50' | 'gp-100';

export type RedemptionStatus = 'pending' | 'fulfilled' | 'rejected';

export interface Question {
  id: string;
  category: Exclude<CategoryId, 'mix'>;
  prompt: string;
  promptHi: string;
  options: [string, string, string, string];
  optionsHi: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface CategoryMeta {
  id: Exclude<CategoryId, 'mix'>;
  name: string;
  nameHi: string;
  shortName: string;
  emoji: string;
  description: string;
  accentClass: string;
}

export interface VoucherTier {
  id: VoucherTierId;
  amountInr: number;
  title: string;
  costCoins: number;
  tag?: string;
}

export interface VoucherStockItem {
  id: string;
  tierId: VoucherTierId;
  amountInr: number;
  code: string;
  status: 'available' | 'assigned';
  assignedToUid?: string | null;
  assignedRequestId?: string | null;
  createdBy: string;
  createdAtMs: number;
}

export interface VoucherAvailability {
  tierId: VoucherTierId;
  amountInr: number;
  availableCount: number;
}

export interface RedemptionRequest {
  id: string;
  userId: string;
  userContact: string;
  userName: string;
  tierId: VoucherTierId;
  amountInr: number;
  costCoins: number;
  status: RedemptionStatus;
  voucherCode?: string | null;
  adminNote?: string | null;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  totalEarnedCoins: number;
  bestStreak: number;
  roundsPlayed: number;
}

export interface SponsorConfig {
  badgeText: string;
  title: string;
  description: string;
  ctaLabel: string;
  targetUrl: string;
  isActive: boolean;
}

export interface EconomyConfig {
  baseCoinsPerRight: number;
  streakBonusStep: number;
  speedBonusCoins: number;
  dailyBonusCoins: number;
  rewardAdCoins: number;
  dailyRoundLimit: number;
}

export interface AdminPlayerSummary {
  uid: string;
  displayName: string;
  email: string;
  coins: number;
  totalEarnedCoins: number;
  roundsPlayed: number;
  referralCount: number;
}

export interface CategoryStat {
  played: number;
  correct: number;
}

export interface UserProgress {
  displayName: string;
  email: string;
  phoneNumber: string;
  authProvider: 'google' | 'phone' | 'guest';
  coins: number;
  totalEarnedCoins: number;
  roundsPlayed: number;
  totalQuestions: number;
  totalCorrect: number;
  bestStreak: number;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  soundEnabled: boolean;
  language: QuizLanguage;
  lastDailyBonusDate: string | null;
  lastSpinDate: string | null;
  dailyRoundsDate: string | null;
  dailyRoundsCount: number;
  quizzesSinceAd: number;
  categoryStats: Record<Exclude<CategoryId, 'mix'>, CategoryStat>;
}

export interface RoundResult {
  category: CategoryId;
  totalQuestions: number;
  correctCount: number;
  coinsEarned: number;
  streakBonusCoins: number;
  maxStreak: number;
  timeBonuses: number;
}

export interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  label: string;
}
