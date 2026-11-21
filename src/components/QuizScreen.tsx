import { ArrowLeft, Check, Flame, Languages, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCategoryLabel,
  SECONDS_PER_QUESTION,
} from '../data/questions';
import { CategoryId, EconomyConfig, Question, QuizLanguage, RoundResult } from '../types/quiz';
import { playCorrectSound, playTickSound, playWrongSound } from '../utils/sound';

interface QuizScreenProps {
  category: CategoryId;
  questions: Question[];
  economy: EconomyConfig;
  soundEnabled: boolean;
  language: QuizLanguage;
  onToggleLanguage: () => void;
  onQuestionScored: (
    questionCategory: Exclude<CategoryId, 'mix'>,
    isCorrect: boolean,
    coinsEarned: number,
    newStreak: number,
    anchorRect?: DOMRect
  ) => void;
  onFinishRound: (result: RoundResult) => void;
  onExit: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function QuizScreen({
  category,
  questions,
  economy,
  soundEnabled,
  language,
  onToggleLanguage,
  onQuestionScored,
  onFinishRound,
  onExit,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundCoins, setRoundCoins] = useState(0);
  const [streakBonusTotal, setStreakBonusTotal] = useState(0);
  const [timeBonuses, setTimeBonuses] = useState(0);

  const advanceTimerRef = useRef<number | null>(null);
  const locked = selectedIndex !== null || timedOut;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const moveToNextOrFinish = useCallback(
    (
      nextCorrect: number,
      nextRoundCoins: number,
      nextStreakBonus: number,
      nextMaxStreak: number,
      nextTimeBonuses: number
    ) => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedIndex(null);
        setTimedOut(false);
        setTimeLeft(SECONDS_PER_QUESTION);
      } else {
        onFinishRound({
          category,
          totalQuestions: questions.length,
          correctCount: nextCorrect,
          coinsEarned: nextRoundCoins,
          streakBonusCoins: nextStreakBonus,
          maxStreak: nextMaxStreak,
          timeBonuses: nextTimeBonuses,
        });
      }
    },
    [category, currentIndex, onFinishRound, questions.length]
  );

  useEffect(() => {
    if (locked || !currentQuestion) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        if (prev <= 5) {
          playTickSound(soundEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [locked, currentIndex, currentQuestion, soundEnabled]);

  useEffect(() => {
    if (timeLeft === 0 && !locked && currentQuestion) {
      setTimedOut(true);
      setStreak(0);
      playWrongSound(soundEnabled);
      onQuestionScored(currentQuestion.category, false, 0, 0);

      advanceTimerRef.current = window.setTimeout(() => {
        moveToNextOrFinish(correctCount, roundCoins, streakBonusTotal, maxStreak, timeBonuses);
      }, 1250);
    }
  }, [
    timeLeft,
    locked,
    currentQuestion,
    soundEnabled,
    onQuestionScored,
    moveToNextOrFinish,
    correctCount,
    roundCoins,
    streakBonusTotal,
    maxStreak,
    timeBonuses,
  ]);

  const handleSelectOption = useCallback(
    (optIndex: number, buttonEl?: HTMLButtonElement | null) => {
      if (locked || !currentQuestion) return;

      setSelectedIndex(optIndex);
      const isCorrect = optIndex === currentQuestion.correctIndex;

      if (isCorrect) {
        const nextStreak = streak + 1;
        const nextMaxStreak = Math.max(maxStreak, nextStreak);
        const streakExtra = nextStreak > 1 ? (nextStreak - 1) * economy.streakBonusStep : 0;
        const speedExtra = timeLeft >= 10 ? economy.speedBonusCoins : 0;
        const earned = economy.baseCoinsPerRight + streakExtra + speedExtra;

        const nextCorrect = correctCount + 1;
        const nextRoundCoins = roundCoins + earned;
        const nextStreakBonus = streakBonusTotal + streakExtra;
        const nextTimeBonuses = timeBonuses + speedExtra;

        setStreak(nextStreak);
        setMaxStreak(nextMaxStreak);
        setCorrectCount(nextCorrect);
        setRoundCoins(nextRoundCoins);
        setStreakBonusTotal(nextStreakBonus);
        setTimeBonuses(nextTimeBonuses);

        playCorrectSound(soundEnabled);
        onQuestionScored(
          currentQuestion.category,
          true,
          earned,
          nextStreak,
          buttonEl?.getBoundingClientRect()
        );

        advanceTimerRef.current = window.setTimeout(() => {
          moveToNextOrFinish(
            nextCorrect,
            nextRoundCoins,
            nextStreakBonus,
            nextMaxStreak,
            nextTimeBonuses
          );
        }, 1050);
      } else {
        setStreak(0);
        playWrongSound(soundEnabled);
        onQuestionScored(currentQuestion.category, false, 0, 0);

        advanceTimerRef.current = window.setTimeout(() => {
          moveToNextOrFinish(correctCount, roundCoins, streakBonusTotal, maxStreak, timeBonuses);
        }, 1250);
      }
    },
    [
      locked,
      currentQuestion,
      streak,
      maxStreak,
      timeLeft,
      economy.baseCoinsPerRight,
      economy.streakBonusStep,
      economy.speedBonusCoins,
      correctCount,
      roundCoins,
      streakBonusTotal,
      timeBonuses,
      soundEnabled,
      onQuestionScored,
      moveToNextOrFinish,
    ]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (locked) return;
      const key = e.key.toUpperCase();
      const map: Record<string, number> = {
        '1': 0,
        A: 0,
        '2': 1,
        B: 1,
        '3': 2,
        C: 2,
        '4': 3,
        D: 3,
      };
      if (key in map) {
        handleSelectOption(map[key]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locked, handleSelectOption]);

  if (!currentQuestion) {
    return null;
  }

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timeLeft / SECONDS_PER_QUESTION;
  const dashOffset = circumference * (1 - progressRatio);
  const ringColor =
    timeLeft <= 4 ? '#ef4444' : timeLeft <= 8 ? '#f59e0b' : '#10b981';

  const promptText = language === 'hi' ? currentQuestion.promptHi : currentQuestion.prompt;
  const optionsList = language === 'hi' ? currentQuestion.optionsHi : currentQuestion.options;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Top Quiz HUD */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quit</span>
          </button>

          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-white/10"
            title="Switch Quiz Language"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white tabular-nums">
            Q {currentIndex + 1}/{questions.length}
          </div>

          <div
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-extrabold tabular-nums ${
              streak > 0
                ? 'border-orange-400/50 bg-orange-500/20 text-orange-300'
                : 'border-white/10 bg-white/5 text-slate-400'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{streak}x</span>
          </div>
        </div>

        {/* SVG Circular Timer Ring */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center" aria-label={`${timeLeft} seconds remaining`}>
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset,stroke] duration-300 ease-linear"
            />
          </svg>
          <span className="font-mono-num absolute text-sm font-extrabold text-white tabular-nums">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Round Progress Dots Bar */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <div
              key={q.id}
              className={`h-1.5 rounded-full transition-colors ${
                isCurrent
                  ? 'bg-violet-400'
                  : isPast
                  ? 'bg-emerald-400/70'
                  : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Question Card */}
      <div className="flex min-h-[144px] flex-col justify-center rounded-3xl border border-violet-400/35 bg-gradient-to-b from-[#23194e]/95 to-[#140e2e]/95 p-6 text-center shadow-xl shadow-black/40 sm:p-8">
        <div className="text-xs font-bold tracking-wider text-cyan-400">
          {getCategoryLabel(currentQuestion.category, language)}
          {category === 'mix' ? (language === 'hi' ? ' · मेगा मिक्स' : ' · Mega Mix') : ''}
        </div>
        <h2 className="mt-2.5 text-lg font-bold leading-snug text-white text-balance sm:text-2xl">
          {promptText}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {optionsList.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrectOption = idx === currentQuestion.correctIndex;

          let stateStyle =
            'border-white/15 bg-white/5 text-white hover:border-violet-400/60 hover:bg-violet-600/20';
          let badgeStyle = 'bg-white/10 text-slate-200';

          if (locked) {
            if (isCorrectOption) {
              stateStyle =
                'border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-950/50 animate-pulse-win';
              badgeStyle = 'bg-emerald-400 text-emerald-950';
            } else if (isSelected) {
              stateStyle = 'border-red-400 bg-red-500/20 text-white animate-shake';
              badgeStyle = 'bg-red-500 text-white';
            } else {
              stateStyle = 'border-white/10 bg-white/[0.03] text-slate-400 opacity-70';
            }
          }

          return (
            <button
              key={`${currentQuestion.id}-${idx}`}
              type="button"
              disabled={locked}
              onClick={(e) => handleSelectOption(idx, e.currentTarget)}
              className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[15px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${stateStyle}`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${badgeStyle}`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="leading-snug">{option}</span>
              </div>

              {locked && isCorrectOption && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-300">
                  <Check className="h-4 w-4" />
                  <span>{language === 'hi' ? 'सही' : 'Correct'}</span>
                </span>
              )}
              {locked && isSelected && !isCorrectOption && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-red-300">
                  <X className="h-4 w-4" />
                  <span>{language === 'hi' ? 'गलत' : 'Wrong'}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Round Coin Tally Footer */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          {timedOut
            ? language === 'hi'
              ? 'समय समाप्त — अगला सवाल आ रहा है'
              : 'Time expired — moving to next question'
            : locked
            ? selectedIndex === currentQuestion.correctIndex
              ? language === 'hi'
                ? 'शाबाश! कॉइन्स वॉलेट में जुड़ गए'
                : 'Great answer! Coins added to wallet'
              : language === 'hi'
              ? 'कोई बात नहीं — अगला सवाल देखें'
              : 'Missed this one — keep going'
            : language === 'hi'
            ? `10 सेकंड में जवाब देने पर +${economy.speedBonusCoins} स्पीड बोनस`
            : `Fast answers (10s+ left) earn +${economy.speedBonusCoins} speed bonus`}
        </span>
        <span className="font-mono-num font-bold text-amber-300 tabular-nums">
          +{roundCoins} this round
        </span>
      </div>
    </div>
  );
}
