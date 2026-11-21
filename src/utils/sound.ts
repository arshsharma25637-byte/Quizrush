let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextCtor) {
      audioCtx = new AudioContextCtor();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.14,
  delay = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playClickSound(enabled: boolean) {
  if (!enabled) return;
  playTone(540, 0.06, 'triangle', 0.08);
}

export function playCorrectSound(enabled: boolean) {
  if (!enabled) return;
  playTone(587.33, 0.12, 'triangle', 0.14, 0); // D5
  playTone(880, 0.18, 'sine', 0.15, 0.08); // A5
}

export function playWrongSound(enabled: boolean) {
  if (!enabled) return;
  playTone(210, 0.14, 'sawtooth', 0.09, 0);
  playTone(155, 0.22, 'sawtooth', 0.09, 0.1);
}

export function playTickSound(enabled: boolean) {
  if (!enabled) return;
  playTone(760, 0.04, 'sine', 0.05);
}

export function playVictorySound(enabled: boolean) {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, 0.2, 'triangle', 0.14, idx * 0.09);
  });
}

export function playRedeemSound(enabled: boolean) {
  if (!enabled) return;
  const notes = [659.25, 783.99, 987.77, 1318.51];
  notes.forEach((n, idx) => {
    playTone(n, 0.22, 'sine', 0.14, idx * 0.075);
  });
}
