"use client";

// Generate a subtle stamp sound using Web Audio API (no file needed)
export function playStampSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Short, deep thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    // Clean up
    setTimeout(() => ctx.close(), 200);
  } catch {
    // Audio not available, silently skip
  }
}
