import {
  Check,
  Copy,
  Download,
  Film,
  Image as ImageIcon,
  Play,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ReelPreset {
  id: 'math' | 'cricket' | 'gk' | 'rewards';
  label: string;
  badge: string;
  hookTop: string;
  hookSub: string;
  categoryTag: string;
  questionLines: string[];
  options: [string, string, string, string];
  suspenseText: string;
  caption: string;
}

const REEL_PRESETS: ReelPreset[] = [
  {
    id: 'math',
    label: '99% Fail Math 🤯',
    badge: 'VIRAL COMMENT BAIT',
    hookTop: '99% LOG FAIL! 🤯',
    hookSub: '5 SECOND MEIN SAHI JAWAB DO 👇',
    categoryTag: '🧠 BRAIN & MATH CHALLENGE',
    questionLines: ['2 + 2 × 2 = ?', 'Asli Genius Hi Bata Payega!'],
    options: ['A)   8', 'B)   6', 'C)   4', 'D)   10'],
    suspenseText: '8 YA 6? APNA JAWAB COMMENT KARO 👇',
    caption: `99% log iska galat jawab dete hain! 🤯👇\nComment mein batao: 8 ya 6?\n\nAise hi fast Hindi & English Quiz khelo QuizRush par, coins jama karo aur jeeto REAL Google Play Redeem Codes (₹10, ₹25, ₹50, ₹100)! 🎁🔥\n\n👇 Game Link chahiye toh COMMENT karo "LINK" ya Bio check karo!\n\n#QuizRush #MathChallenge #BrainTeaser #GooglePlayRedeemCode #FreeRedeemCode #QuizGame #IndiaGaming #ReelsIndia #ViralQuiz #GKQuiz`,
  },
  {
    id: 'cricket',
    label: 'Cricket IPL 🏏',
    badge: 'CRICKET FANS WAR',
    hookTop: 'ASLI CRICKET FAN HO? 🏏',
    hookSub: 'YE SAWAL 90% LOG GALAT BATATE HAIN!',
    categoryTag: '🏏 CRICKET & IPL QUIZ',
    questionLines: ['IPL mein sabse zyada', 'Centuries kisne maari hain?'],
    options: ['A)   Chris Gayle', 'B)   Virat Kohli', 'C)   Rohit Sharma', 'D)   Jos Buttler'],
    suspenseText: 'APNE FAVOURITE PLAYER KA NAAM COMMENT KARO 👇',
    caption: `Asli Cricket Fan ho toh 5 second mein jawab do! 🏏🔥\nComment mein apna answer likho aur apne cricket buddy ko tag karo!\n\nQuizRush par Cricket, GK & Brain Quiz khelkar coins kamao aur REAL Google Play Vouchers (₹10–₹100) jeeto! 🎁⚡\n\n👇 Khelne ke liye COMMENT karo "PLAY" ya Bio link kholo!\n\n#CricketQuiz #IPLQuiz #ViratKohli #RohitSharma #QuizRush #GooglePlayVoucher #IndianCricket #CricketReels #FreeRedeemCode #ReelsIndia`,
  },
  {
    id: 'gk',
    label: 'India GK 🇮🇳',
    badge: 'HIGH SHARE REEL',
    hookTop: '100% INDIAN HO? 🇮🇳',
    hookSub: '5 SECOND MEIN SAHI OPTION BATAO!',
    categoryTag: '🌍 INDIA GK CHALLENGE',
    questionLines: ['Bharat ka "Pink City"', 'kis shehar ko kaha jata hai?'],
    options: ['A)   Udaipur', 'B)   Jaipur', 'C)   Jodhpur', 'D)   Agra'],
    suspenseText: 'APNE SHEHAR KA NAAM + ANSWER COMMENT KARO 👇',
    caption: `Dekhte hain kitne Indians ko 5 second mein sahi jawab pata hai! 🇮🇳🧠\nApna answer comment karo 👇\n\nQuizRush par roz free Hindi & English quiz khelo, Daily Spin ghumao aur coins se REAL Google Play Vouchers jeeto! 🎁🔥\n\n👇 Game khelne ke liye COMMENT karo "LINK"!\n\n#IndiaGK #GKQuiz #QuizInHindi #QuizRush #GeneralKnowledge #FreeGooglePlayCode #ReelsIndia #ViralReels #BrainTest #TriviaIndia`,
  },
  {
    id: 'rewards',
    label: 'Google Play Promo 🎁',
    badge: 'DIRECT DOWNLOAD',
    hookTop: 'FREE GOOGLE PLAY CODE! 🎁',
    hookSub: 'QUIZ KHELO → COINS JEETO → REDEEM KARO',
    categoryTag: '⚡ QUIZ RUSH · 100% FREE',
    questionLines: ['Kya aap 5 sawalon ke', 'sahi jawab de sakte ho?'],
    options: ['🌍  GK & World', '🏏  Cricket & IPL', '🚀  Science & Tech', '🧠  Brain & Math'],
    suspenseText: 'FREE MEIN KHELO · COMMENT "LINK" 👇',
    caption: `Ab sirf timepass nahi — Quiz khelkar jeeto REAL Google Play Redeem Codes (₹10, ₹25, ₹50, ₹100)! 🎁🔥\n\n✅ 100% Free Trivia (Hindi & English)\n✅ Daily Check-In + Lucky Spin Bonus\n✅ Refer Friends & Earn +100 Coins\n✅ Direct Voucher Delivery in Wallet\n\n👇 Link ke liye COMMENT karo "LINK" ya Bio mein click karo!\n\n#QuizRush #FreeRedeemCode #GooglePlayGiftCard #PlayAndEarn #QuizApp #IndianGamers #BGMI #FreeFireIndia #ReelsIndia #ViralApp`,
  },
];

const CANVAS_W = 720;
const CANVAS_H = 1280;
const DURATION_SEC = 15;
const REEL_BG_URL = '/src/assets/images/quizrush_reel_bg_1795227734438.jpg';
const LOGO_URL = '/pwa-512x512.png';

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const clamped = Math.max(0, Math.min(1, t));
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
}

function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function scheduleReelAudio(
  audioCtx: AudioContext,
  dest: AudioNode,
  durationSec: number
): () => void {
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.45, audioCtx.currentTime);
  master.connect(dest);

  const start = audioCtx.currentTime + 0.05;
  const beatDur = 60 / 128; // 128 BPM high-energy beat
  const totalBeats = Math.floor(durationSec / beatDur);

  // Bass & Kick groove
  const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
  for (let b = 0; b < totalBeats; b++) {
    const t = start + b * beatDur;

    // Punchy Kick on every beat
    const kickOsc = audioCtx.createOscillator();
    const kickGain = audioCtx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(145, t);
    kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    kickGain.gain.setValueAtTime(0.55, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    kickOsc.connect(kickGain);
    kickGain.connect(master);
    kickOsc.start(t);
    kickOsc.stop(t + 0.15);

    // Energetic synth pluck bass
    const bassOsc = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassNotes[b % bassNotes.length], t);
    bassGain.gain.setValueAtTime(0.18, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + beatDur * 0.7);
    bassOsc.connect(bassGain);
    bassGain.connect(master);
    bassOsc.start(t);
    bassOsc.stop(t + beatDur * 0.72);

    // Offbeat hi-hat tick
    const hatTime = t + beatDur * 0.5;
    const hatOsc = audioCtx.createOscillator();
    const hatGain = audioCtx.createGain();
    hatOsc.type = 'square';
    hatOsc.frequency.setValueAtTime(4200, hatTime);
    hatGain.gain.setValueAtTime(0.03, hatTime);
    hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.03);
    hatOsc.connect(hatGain);
    hatGain.connect(master);
    hatOsc.start(hatTime);
    hatOsc.stop(hatTime + 0.035);
  }

  // Countdown ticks (seconds 3.0, 4.0, 5.0, 6.0, 7.0)
  for (let i = 0; i < 5; i++) {
    const tickT = start + 3.0 + i * 1.0;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i === 4 ? 1320 : 880, tickT);
    gain.gain.setValueAtTime(0.32, tickT);
    gain.gain.exponentialRampToValueAtTime(0.001, tickT + 0.12);
    osc.connect(gain);
    gain.connect(master);
    osc.start(tickT);
    osc.stop(tickT + 0.13);
  }

  // Coin victory chime burst at Scene 3 (8.8s)
  const chimeNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  chimeNotes.forEach((freq, idx) => {
    const ct = start + 8.85 + idx * 0.08;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ct);
    gain.gain.setValueAtTime(0.3, ct);
    gain.gain.exponentialRampToValueAtTime(0.001, ct + 0.25);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ct);
    osc.stop(ct + 0.26);
  });

  // Final power chord at 12.2s
  [523.25, 659.25, 783.99].forEach((freq) => {
    const ct = start + 12.25;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ct);
    gain.gain.setValueAtTime(0.2, ct);
    gain.gain.exponentialRampToValueAtTime(0.001, ct + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ct);
    osc.stop(ct + 0.92);
  });

  return () => {
    try {
      master.disconnect();
    } catch {
      // Ignore
    }
  };
}

export function PromoReelStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<ReelPreset['id']>('math');
  const [customCta, setCustomCta] = useState('COMMENT "LINK" 👇');
  const [customHandle, setCustomHandle] = useState('LINK IN BIO 🔗 · FREE GAME');
  const [soundOn, setSoundOn] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedExt, setRecordedExt] = useState<'mp4' | 'webm'>('webm');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const preset = REEL_PRESETS.find((p) => p.id === selectedPresetId) ?? REEL_PRESETS[0];

  const drawFrame = useCallback(
    (tSec: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = CANVAS_W;
      const h = CANVAS_H;

      // 1. Animated Background with subtle Ken Burns zoom
      ctx.fillStyle = '#090617';
      ctx.fillRect(0, 0, w, h);

      const bgImg = bgImgRef.current;
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const zoom = 1 + 0.08 * Math.sin((tSec / DURATION_SEC) * Math.PI);
        const dw = w * zoom;
        const dh = h * zoom;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(bgImg, dx, dy, dw, dh);
        ctx.restore();
      }

      // Dark center vignette for ultra-sharp text readability
      const vig = ctx.createRadialGradient(w / 2, h / 2, 120, w / 2, h / 2, 760);
      vig.addColorStop(0, 'rgba(9, 6, 23, 0.78)');
      vig.addColorStop(1, 'rgba(9, 6, 23, 0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Persistent top branding bar
      ctx.save();
      const logoImg = logoImgRef.current;
      drawRoundedRect(ctx, w / 2 - 155, 62, 310, 68, 34);
      ctx.fillStyle = 'rgba(15, 10, 38, 0.88)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.stroke();

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        drawRoundedRect(ctx, w / 2 - 142, 72, 48, 48, 12);
        ctx.clip();
        ctx.drawImage(logoImg, w / 2 - 142, 72, 48, 48);
        ctx.restore();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px Outfit, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('QUIZRUSH', w / 2 - 80, 96);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 18px Outfit, system-ui, sans-serif';
      ctx.fillText('LIVE', w / 2 + 88, 96);
      ctx.restore();

      // Persistent animated progress bar at very top
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(36, 28, w - 72, 8);
      const barGrad = ctx.createLinearGradient(36, 0, w - 36, 0);
      barGrad.addColorStop(0, '#fbbf24');
      barGrad.addColorStop(0.5, '#ec4899');
      barGrad.addColorStop(1, '#22d3ee');
      ctx.fillStyle = barGrad;
      ctx.fillRect(36, 28, ((w - 72) * Math.min(tSec, DURATION_SEC)) / DURATION_SEC, 8);

      // SCENE 1 (0.0s - 2.6s): EXPLOSIVE VIRAL HOOK
      if (tSec < 2.6) {
        const local = tSec;
        const scale = easeOutBack(Math.min(1, local / 0.45));
        const pulse = 1 + 0.03 * Math.sin(local * 14);

        ctx.save();
        ctx.translate(w / 2, h / 2 - 40);
        ctx.scale(scale * pulse, scale * pulse);

        // Pulsing neon halo
        const halo = ctx.createRadialGradient(0, 0, 20, 0, 0, 290);
        halo.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
        halo.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 290, 0, Math.PI * 2);
        ctx.fill();

        // Red/Gold Alert Badge
        drawRoundedRect(ctx, -200, -195, 400, 56, 28);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🔥 ${preset.badge} 🔥`, 0, -167);

        // Giant Hook Headline
        ctx.shadowColor = 'rgba(251, 191, 36, 0.75)';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#fde047';
        ctx.font = '900 62px Outfit, system-ui, sans-serif';
        ctx.fillText(preset.hookTop, 0, -45);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 34px Outfit, system-ui, sans-serif';
        ctx.fillText(preset.hookSub, 0, 50);

        // Bouncing indicator pill
        const bounceY = 145 + Math.sin(local * 12) * 10;
        drawRoundedRect(ctx, -220, bounceY - 34, 440, 68, 22);
        const btnGrad = ctx.createLinearGradient(-220, 0, 220, 0);
        btnGrad.addColorStop(0, '#7c3aed');
        btnGrad.addColorStop(1, '#ec4899');
        ctx.fillStyle = btnGrad;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 28px Outfit, system-ui, sans-serif';
        ctx.fillText('GET READY... 3, 2, 1! ⚡', 0, bounceY);

        ctx.restore();
      }
      // SCENE 2 (2.6s - 8.8s): LIVE INTERACTIVE QUIZ + 5-SEC COUNTDOWN
      else if (tSec < 8.8) {
        const local = tSec - 2.6; // 0 to 6.2s
        const cardScale = easeOutBack(Math.min(1, local / 0.35));
        const countdownSec = Math.max(0, Math.ceil(5.2 - local));
        const ratio = Math.max(0, Math.min(1, (5.2 - local) / 5.0));

        ctx.save();
        ctx.translate(w / 2, 260);
        ctx.scale(cardScale, cardScale);

        // Circular Countdown Timer Ring
        const ringR = 66;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 10, 40, 0.92)';
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.stroke();

        const ringColor = countdownSec <= 2 ? '#ef4444' : countdownSec <= 3 ? '#f59e0b' : '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.strokeStyle = ringColor;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 54px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdownSec > 0 ? String(countdownSec) : '⏰', 0, 3);
        ctx.restore();

        // Question Card
        ctx.save();
        const qCardY = 365;
        drawRoundedRect(ctx, 44, qCardY, w - 88, 235, 34);
        const qGrad = ctx.createLinearGradient(44, qCardY, 44, qCardY + 235);
        qGrad.addColorStop(0, 'rgba(40, 26, 92, 0.96)');
        qGrad.addColorStop(1, 'rgba(18, 12, 46, 0.96)');
        ctx.fillStyle = qGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.font = '800 22px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(preset.categoryTag, w / 2, qCardY + 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 40px Outfit, system-ui, sans-serif';
        preset.questionLines.forEach((line, idx) => {
          ctx.fillText(line, w / 2, qCardY + 115 + idx * 54);
        });
        ctx.restore();

        // 4 Option Buttons staggered entrance
        preset.options.forEach((opt, idx) => {
          const optT = easeOutCubic((local - (0.3 + idx * 0.14)) / 0.35);
          if (optT <= 0) return;

          const oy = 638 + idx * 102;
          const slideX = (1 - optT) * (idx % 2 === 0 ? -120 : 120);

          ctx.save();
          ctx.globalAlpha = optT;
          drawRoundedRect(ctx, 52 + slideX, oy, w - 104, 82, 24);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 32px Outfit, system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(opt, 86 + slideX, oy + 42);
          ctx.restore();
        });

        // Bottom Comment-Bait Banner (pulsing strongly at end of countdown)
        const bannerPulse = local > 5.0 ? 1 + 0.05 * Math.sin(local * 18) : 1;
        ctx.save();
        ctx.translate(w / 2, 1110);
        ctx.scale(bannerPulse, bannerPulse);
        drawRoundedRect(ctx, -310, -48, 620, 96, 26);
        ctx.fillStyle = local > 5.0 ? '#f59e0b' : 'rgba(251, 191, 36, 0.2)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();

        ctx.fillStyle = local > 5.0 ? '#090617' : '#fde047';
        ctx.font = '900 28px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(preset.suspenseText, 0, 2);
        ctx.restore();
      }
      // SCENE 3 (8.8s - 12.2s): FLYING COINS + REAL GOOGLE PLAY VOUCHERS
      else if (tSec < 12.2) {
        const local = tSec - 8.8; // 0 to 3.4s
        const pop = easeOutBack(Math.min(1, local / 0.45));

        // Animated flying gold coins burst
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2 + local * 0.6;
          const dist = 120 + local * 260 + (i % 3) * 45;
          const cx = w / 2 + Math.cos(angle) * dist;
          const cy = 540 + Math.sin(angle) * dist * 0.7;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - local / 3.2);
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fef08a';
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.font = '900 22px Outfit, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('₹', cx, cy + 1);
          ctx.restore();
        }

        // Headline
        ctx.save();
        ctx.translate(w / 2, 260);
        ctx.scale(pop, pop);
        ctx.fillStyle = '#34d399';
        ctx.font = '900 32px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SAHI JAWAB = COINS = REWARDS!', 0, -45);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 54px Outfit, system-ui, sans-serif';
        ctx.fillText('REAL GOOGLE PLAY', 0, 25);
        ctx.fillStyle = '#fde047';
        ctx.fillText('VOUCHERS JEETO! 🎁', 0, 92);
        ctx.restore();

        // 2x2 Google Play Voucher Cards
        const tiers = [
          { amount: '₹10', coins: '10,000 Coins', x: 64, y: 455 },
          { amount: '₹25', coins: '24,000 Coins', x: 374, y: 455 },
          { amount: '₹50', coins: '47,500 Coins', x: 64, y: 695 },
          { amount: '₹100', coins: '92,000 Coins', x: 374, y: 695 },
        ];

        tiers.forEach((tier, idx) => {
          const cardT = easeOutBack(Math.min(1, (local - idx * 0.12) / 0.4));
          if (cardT <= 0) return;

          ctx.save();
          ctx.translate(tier.x + 141, tier.y + 102);
          ctx.scale(cardT, cardT);
          drawRoundedRect(ctx, -141, -102, 282, 204, 30);
          const cg = ctx.createLinearGradient(-141, -102, 141, 102);
          cg.addColorStop(0, 'rgba(6, 78, 59, 0.94)');
          cg.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
          ctx.fillStyle = cg;
          ctx.fill();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#34d399';
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.font = '800 22px Outfit, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GOOGLE PLAY', 0, -52);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 64px Outfit, system-ui, sans-serif';
          ctx.fillText(tier.amount, 0, 12);

          ctx.fillStyle = '#fde047';
          ctx.font = '800 22px JetBrains Mono, monospace';
          ctx.fillText(tier.coins, 0, 68);
          ctx.restore();
        });

        // Bottom trust strip
        ctx.save();
        drawRoundedRect(ctx, 56, 965, w - 112, 110, 26);
        ctx.fillStyle = 'rgba(15, 10, 40, 0.9)';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 28px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✅ Daily Spin  ·  ✅ Refer +100 Coins', w / 2, 1005);
        ctx.fillStyle = '#34d399';
        ctx.font = '800 24px Outfit, system-ui, sans-serif';
        ctx.fillText('100% Free · Hindi & English Trivia', w / 2, 1046);
        ctx.restore();
      }
      // SCENE 4 (12.2s - 15.0s): VIRAL CTA FINALE
      else {
        const local = tSec - 12.2;
        const pop = easeOutBack(Math.min(1, local / 0.45));
        const pulse = 1 + 0.04 * Math.sin(local * 12);

        ctx.save();
        ctx.translate(w / 2, 430);
        ctx.scale(pop, pop);

        // Glowing aura behind trophy icon
        const aura = ctx.createRadialGradient(0, 0, 30, 0, 0, 220);
        aura.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
        aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 220, 0, Math.PI * 2);
        ctx.fill();

        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.save();
          drawRoundedRect(ctx, -110, -110, 220, 220, 48);
          ctx.clip();
          ctx.drawImage(logoImg, -110, -110, 220, 220);
          ctx.restore();

          drawRoundedRect(ctx, -110, -110, 220, 220, 48);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#fbbf24';
          ctx.stroke();
        }
        ctx.restore();

        // App Title
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 76px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
        ctx.shadowBlur = 24;
        ctx.fillText('QUIZRUSH', w / 2, 650);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 30px Outfit, system-ui, sans-serif';
        ctx.fillText('Play Trivia · Win Google Play Vouchers', w / 2, 712);
        ctx.restore();

        // Giant Pulsing CTA Button
        ctx.save();
        ctx.translate(w / 2, 875);
        ctx.scale(pulse, pulse);
        drawRoundedRect(ctx, -290, -64, 580, 128, 34);
        const ctaGrad = ctx.createLinearGradient(-290, 0, 290, 0);
        ctaGrad.addColorStop(0, '#fbbf24');
        ctaGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = ctaGrad;
        ctx.fill();

        ctx.fillStyle = '#090617';
        ctx.font = '900 42px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(customCta.trim() || 'COMMENT "LINK" 👇', 0, 2);
        ctx.restore();

        // Secondary Handle / Link in Bio text
        ctx.save();
        drawRoundedRect(ctx, 70, 995, w - 140, 74, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.stroke();

        ctx.fillStyle = '#67e8f9';
        ctx.font = '800 28px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(customHandle.trim() || 'LINK IN BIO 🔗', w / 2, 1033);
        ctx.restore();
      }

      // Subtle bottom safe-zone watermark
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '700 18px Outfit, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QuizRush · Play Online & Win Real Rewards', w / 2, h - 54);
      ctx.restore();
    },
    [customCta, customHandle, preset]
  );

  // Preload images & render initial thumbnail frame
  useEffect(() => {
    const bg = new Image();
    bg.crossOrigin = 'anonymous';
    bg.src = REEL_BG_URL;
    bg.onload = () => {
      bgImgRef.current = bg;
      drawFrame(3.8);
    };

    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = LOGO_URL;
    logo.onload = () => {
      logoImgRef.current = logo;
      drawFrame(3.8);
    };
  }, [drawFrame]);

  // Redraw preview thumbnail when preset or custom CTA changes while idle
  useEffect(() => {
    if (!isPlaying && !isRecording) {
      drawFrame(3.8);
    }
  }, [drawFrame, isPlaying, isRecording]);

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const runReel = (recordMode: boolean) => {
    stopPlayback();
    setStatusMsg(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (recordMode && typeof MediaRecorder === 'undefined') {
      setStatusMsg(
        'Aapke browser mein video recording supported nahi hai. Chrome browser mein kholkar try karein.'
      );
      return;
    }

    if (recordedUrl && recordMode) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    setIsPlaying(true);
    setIsRecording(recordMode);
    setProgressPct(0);

    // Setup Web Audio API
    let audioStreamDest: MediaStreamAudioDestinationNode | null = null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      if (recordMode) {
        audioStreamDest = ctx.createMediaStreamDestination();
        scheduleReelAudio(ctx, audioStreamDest, DURATION_SEC);
      }
      if (soundOn) {
        scheduleReelAudio(ctx, ctx.destination, DURATION_SEC);
      }
    } catch {
      // Proceed silently if audio blocked
    }

    // Setup MediaRecorder if recording
    if (recordMode) {
      try {
        const videoStream = canvas.captureStream(30);
        const tracks = [...videoStream.getVideoTracks()];
        if (audioStreamDest) {
          tracks.push(...audioStreamDest.stream.getAudioTracks());
        }
        const combinedStream = new MediaStream(tracks);

        const mimeCandidates = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ];
        const chosenMime =
          mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';
        const isMp4 = chosenMime.startsWith('video/mp4');
        setRecordedExt(isMp4 ? 'mp4' : 'webm');

        const recorder = new MediaRecorder(
          combinedStream,
          chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 4_500_000 } : undefined
        );
        recorderRef.current = recorder;
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            chunks.push(ev.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, {
            type: chosenMime || 'video/webm',
          });
          const url = URL.createObjectURL(blob);
          setRecordedUrl(url);
          setIsRecording(false);
          setIsPlaying(false);
          setStatusMsg(
            `Reel video ready! Niche "Download Reel Video" dabayein aur Instagram / Facebook par upload karein.`
          );

          // Auto-trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = `QuizRush-Viral-Reel-${preset.id}.${isMp4 ? 'mp4' : 'webm'}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        };

        recorder.start(250);
      } catch (err) {
        setStatusMsg(
          err instanceof Error ? err.message : 'Unable to start video recording in this browser.'
        );
        stopPlayback();
        return;
      }
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsedSec / DURATION_SEC) * 100));
      setProgressPct(pct);
      drawFrame(Math.min(elapsedSec, DURATION_SEC));

      if (elapsedSec < DURATION_SEC) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (recordMode && recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        } else {
          stopPlayback();
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFrame(3.8);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QuizRush-Story-Poster-${preset.id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatusMsg('9:16 Story / Thumbnail poster downloaded!');
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(preset.caption);
      setCopiedCaption(true);
      window.setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <section className="rounded-2xl border border-pink-400/35 bg-gradient-to-br from-pink-950/35 via-[#150f30] to-violet-950/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 text-slate-950 shadow-lg shadow-pink-500/25">
            <Film className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-white">
              Viral Instagram &amp; Facebook Reel Studio
            </h2>
            <p className="text-[11px] text-slate-300">
              15s HD 9:16 Comment-Bait Video + Music · 1-Click Download
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundOn((v) => !v)}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-slate-200 hover:bg-white/10"
        >
          {soundOn ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
          <span>{soundOn ? 'Sound On' : 'Muted'}</span>
        </button>
      </div>

      {/* Preset Selector */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REEL_PRESETS.map((item) => {
          const active = item.id === selectedPresetId;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isRecording}
              onClick={() => setSelectedPresetId(item.id)}
              className={`min-h-[42px] rounded-xl border px-2.5 py-2 text-xs font-extrabold transition-all ${
                active
                  ? 'border-pink-400 bg-pink-500/25 text-white shadow-md shadow-pink-500/20'
                  : 'border-white/10 bg-black/25 text-slate-300 hover:border-white/25 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-12 md:items-start">
        {/* 9:16 Live Canvas Preview */}
        <div className="flex flex-col items-center md:col-span-5">
          <div className="relative w-full max-w-[260px] overflow-hidden rounded-3xl border-2 border-pink-400/50 bg-[#090617] shadow-2xl shadow-pink-950/50">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block aspect-[9/16] w-full"
            />
            {isRecording && (
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>REC {progressPct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls, Export & Viral Caption */}
        <div className="space-y-4 md:col-span-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300">
                Last Screen CTA Text
              </label>
              <input
                type="text"
                maxLength={28}
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs font-bold text-white focus:border-pink-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300">
                Your Page / Bio Handle
              </label>
              <input
                type="text"
                maxLength={32}
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-xl border border-white/15 bg-[#0e0a24] px-3 text-xs font-bold text-white focus:border-pink-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {isPlaying || isRecording ? (
              <button
                type="button"
                onClick={stopPlayback}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-400"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Stop ({progressPct}%)</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => runReel(false)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold text-white hover:bg-white/15"
                >
                  <Play className="h-4 w-4 fill-current text-amber-300" />
                  <span>Preview 15s Reel</span>
                </button>

                <button
                  type="button"
                  onClick={() => runReel(true)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-pink-500/25 hover:brightness-105"
                >
                  <Download className="h-4 w-4" />
                  <span>Record &amp; Download Video</span>
                </button>
              </>
            )}

            <button
              type="button"
              disabled={isRecording}
              onClick={handleDownloadPoster}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-violet-400/35 bg-violet-500/15 px-3.5 py-2 text-xs font-bold text-violet-200 hover:bg-violet-500/25 disabled:opacity-45"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Story PNG</span>
            </button>
          </div>

          {statusMsg && (
            <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-semibold text-emerald-200">
              {statusMsg}
            </div>
          )}

          {recordedUrl && (
            <div className="space-y-2 rounded-xl border border-amber-400/35 bg-black/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Recorded Reel Ready</span>
                </span>
                <a
                  href={recordedUrl}
                  download={`QuizRush-Viral-Reel-${preset.id}.${recordedExt}`}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download (.{recordedExt})</span>
                </a>
              </div>
              <video
                src={recordedUrl}
                controls
                playsInline
                className="max-h-52 w-full rounded-xl bg-black"
              />
            </div>
          )}

          {/* Viral Copy-Paste Caption & Hashtags */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-white">
                Instagram / Facebook Viral Caption + Hashtags
              </span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-white/10 px-2.5 text-[11px] font-bold text-amber-300 hover:bg-white/15"
              >
                {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>
            <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-300">
              {preset.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
