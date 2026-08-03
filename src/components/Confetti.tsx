import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Celebratory confetti on its own canvas, so callers can layer content above
 * or below it. Opens with the big burst, then settles into a gentle continuous
 * fall from the top for as long as it's mounted. No-op under reduced motion.
 * design.md §7.
 */
export function Confetti({ fire, className }: { fire: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!fire || reduced || !canvas) return
    const shoot = confetti.create(canvas, { resize: true })
    const colors = ['#B7E06A', '#8FCB3C', '#F0D090', '#E39B9B', '#6FA8C7']

    // The opening explosion. Short ticks so the burst fades out mid-air rather
    // than raining back down as one clump before the drizzle takes over.
    shoot({ particleCount: 90, spread: 75, origin: { y: 0.6 }, ticks: 100, colors })
    shoot({ particleCount: 40, spread: 100, startVelocity: 45, origin: { y: 0.65 }, ticks: 90, colors })

    // The slow drizzle from the top, indefinitely. Starts almost immediately —
    // its first particles take ~a second to drift into view, which lands just
    // as the burst is fading, so there's no dead air in between.
    let drizzle: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      drizzle = setInterval(() => {
        // One particle per shot with its own random color — canvas-confetti
        // hands out colors round-robin, so a 2-particle shot with the shared
        // array always drew the first two (both greens). Jittered speed and
        // gravity keep the fall from ever forming a band.
        for (let i = 0; i < 2; i++) {
          shoot({
            particleCount: 1,
            angle: 90,
            spread: 45,
            startVelocity: 4 + Math.random() * 5,
            gravity: 0.35 + Math.random() * 0.2,
            drift: Math.random() - 0.5,
            ticks: 600,
            scalar: 0.8 + Math.random() * 0.3,
            origin: { x: Math.random(), y: -0.05 },
            colors: [colors[Math.floor(Math.random() * colors.length)]],
          })
        }
      }, 350)
    }, 400)

    return () => {
      clearTimeout(start)
      if (drizzle) clearInterval(drizzle)
      shoot.reset()
    }
  }, [fire, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  )
}
