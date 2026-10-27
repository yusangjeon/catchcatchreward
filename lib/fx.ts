"use client";

/**
 * 피드백 효과(클라이언트 전용): 햅틱(navigator.vibrate — Android Chrome; iOS Safari 는 미지원이라 무시됨) + 효과음(Web Audio 합성, 파일 없음).
 * 음소거는 localStorage ccr_mute. 첫 사용자 제스처 뒤에만 AudioContext 생성.
 */
export type Haptic = "tap" | "success" | "error" | "warn" | "jackpot";
export type Sfx = "hit" | "miss" | "win" | "lose" | "tick" | "coin" | "pop";

const PATTERN: Record<Haptic, number | number[]> = { tap: 15, success: [30, 40, 30], error: [80, 50, 80], warn: 60, jackpot: [40, 40, 40, 40, 120] };

export function haptic(kind: Haptic = "tap") {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(PATTERN[kind]);
  } catch {
    /* 미지원 */
  }
}

export function isMuted() {
  try { return localStorage.getItem("ccr_mute") === "1"; } catch { return false; }
}
export function setMuted(v: boolean) {
  try { localStorage.setItem("ccr_mute", v ? "1" : "0"); } catch { /* noop */ }
}

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.02);
}
export function sfx(kind: Sfx) {
  if (isMuted()) return;
  const c = audio(); if (!c) return;
  try {
    switch (kind) {
      case "hit": tone(c, 880, 0, 0.09, "triangle"); tone(c, 1320, 0.07, 0.12, "triangle"); break;
      case "miss": tone(c, 220, 0, 0.12, "sawtooth", 0.05); tone(c, 160, 0.1, 0.16, "sawtooth", 0.05); break;
      case "win": [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.09, 0.18, "triangle")); break;
      case "lose": tone(c, 330, 0, 0.2, "sine"); tone(c, 262, 0.18, 0.3, "sine"); break;
      case "tick": tone(c, 1000, 0, 0.04, "square", 0.03); break;
      case "coin": tone(c, 1568, 0, 0.07, "square", 0.05); tone(c, 2093, 0.06, 0.12, "square", 0.05); break;
      case "pop": tone(c, 600, 0, 0.05, "sine", 0.06); break;
    }
  } catch {
    /* noop */
  }
}
