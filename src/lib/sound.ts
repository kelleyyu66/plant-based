/**
 * One reward sound, used for every positive moment in the app.
 *
 * It's SYNTHESISED with the Web Audio API rather than shipped as a file: no
 * asset to license or load, it's a few hundred bytes of code, and it can't 404.
 * A warm three-note major arpeggio (C6–E6–G6) on a soft triangle wave with a
 * quick decay — bright and congratulatory without being shrill.
 *
 * To swap in a recorded sound later, drop the file in /public/sounds/ and give
 * `playReward` an <audio> path instead; every call site stays the same.
 */

const LS_KEY = 'moo.sound.muted.v1'

export function isMuted(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(LS_KEY) === '1'
}

export function setMuted(muted: boolean) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LS_KEY, muted ? '1' : '0')
}

let ctx: AudioContext | null = null

/** Lazily create the context — browsers require a user gesture before audio. */
function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A short, bright "you did a good thing" chime. Safe to call anywhere. */
export function playReward() {
  if (isMuted()) return
  // Users who ask for reduced motion generally want less fanfare too.
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ac = audioContext()
  if (!ac) return

  const now = ac.currentTime
  const master = ac.createGain()
  master.gain.value = 0.16
  master.connect(ac.destination)

  // C6, E6, G6 — a major triad, each note slightly after the last.
  const notes = [1046.5, 1318.5, 1568.0]
  notes.forEach((freq, i) => {
    const t = now + i * 0.085
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t)
    // Fast attack, gentle exponential decay.
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    osc.connect(gain)
    gain.connect(master)
    osc.start(t)
    osc.stop(t + 0.45)
  })
}
