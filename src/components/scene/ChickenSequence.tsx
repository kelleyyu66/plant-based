import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The chicken turning on the spot — same construction as the Moo sequence:
 * 24 frames running 0° → 180° → -165° → -15°, swapped through refs rather than
 * React state so the cadence holds, and held until every frame has decoded.
 *
 * Used for the tray preview; on the scene itself the chicken is a still.
 */
const FRAME_COUNT = 24
const TURN_MS = 5000
const FRAME_MS = TURN_MS / FRAME_COUNT
const SRC = (i: number) => `/home/chicken/${String(i).padStart(2, '0')}.webp`

export function ChickenSequence({ size = 44, className }: { size?: number; className?: string }) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const frames = useRef<Array<HTMLImageElement | null>>([])
  const loaded = useRef(0)

  useEffect(() => {
    if (!ready || reduced) return
    let current = 0
    const id = setInterval(() => {
      const next = (current + 1) % FRAME_COUNT
      const a = frames.current[current]
      const b = frames.current[next]
      if (a) a.style.opacity = '0'
      if (b) b.style.opacity = '1'
      current = next
    }, FRAME_MS)
    return () => clearInterval(id)
  }, [ready, reduced])

  const onSettled = () => {
    loaded.current += 1
    if (loaded.current >= FRAME_COUNT) setReady(true)
  }

  return (
    <div className={`relative ${className ?? ''}`} style={{ width: size, height: size }} aria-hidden>
      {Array.from({ length: FRAME_COUNT }).map((_, i) => (
        <img
          key={i}
          ref={(el) => {
            frames.current[i] = el
          }}
          src={SRC(i)}
          alt=""
          draggable={false}
          onLoad={onSettled}
          onError={onSettled}
          className="absolute inset-0 h-full w-full max-w-none object-contain"
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
