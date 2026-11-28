let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, vol = 0.15) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sounds = {
  join() { tone(660, 0, 0.14); tone(880, 0.13, 0.22); },
  leave() { tone(880, 0, 0.14); tone(520, 0.13, 0.24); },
  message() { tone(1040, 0, 0.09, 0.12); tone(1320, 0.1, 0.12, 0.1); },
};