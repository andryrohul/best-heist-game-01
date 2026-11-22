// audio.js — every sound in the heist is synthesized with WebAudio.
// No audio files are loaded; each effect is a short oscillator envelope
// built on first user gesture so browsers allow playback.

let audioContext = null;
let musicTimer = null;
let musicStep = 0;

export function ensureAudio() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
}

function tone(freq, seconds, type, volume, slideTo) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + seconds);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + seconds + 0.02);
}

export function playStep() {
  tone(190, 0.06, 'sine', 0.05);
}

export function playPickup() {
  tone(660, 0.12, 'triangle', 0.12, 990);
  setTimeout(() => tone(1320, 0.18, 'triangle', 0.10), 90);
}

export function playDecoy() {
  tone(1180, 0.07, 'square', 0.07);
  setTimeout(() => tone(1180, 0.07, 'square', 0.06), 140);
}

export function playEmp() {
  tone(880, 0.35, 'sawtooth', 0.08, 110);
}

export function playSpotted() {
  tone(220, 0.22, 'sawtooth', 0.14, 440);
}

export function playCaught() {
  tone(330, 0.5, 'sawtooth', 0.16, 55);
}

export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 130);
  });
}

export function playClick() {
  tone(520, 0.05, 'sine', 0.06);
}

// A quiet two-bar bass pulse that loops while the heist is running.
const BASS_LINE = [55, 0, 65.4, 0, 49, 0, 58.3, 0];

export function startMusic() {
  if (!audioContext || musicTimer) return;
  musicTimer = setInterval(() => {
    const note = BASS_LINE[musicStep % BASS_LINE.length];
    musicStep += 1;
    if (note) tone(note, 0.34, 'sine', 0.05);
  }, 300);
}

export function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}
