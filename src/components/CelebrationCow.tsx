import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The disco cow that dances when a meal is logged — replaces the old pixel
 * mascot on the celebration screen.
 *
 * 22 hand-drawn frames played in folder order, one full rotation every 6s
 * (6000/22 ≈ 273ms per frame). Same construction as the other sequences:
 * every frame stays mounted and is toggled by writing `style.opacity` through
 * refs (re-rendering 22 <img> nodes per tick can't hold the cadence), and
 * playback waits until every frame has decoded so it can't start with holes.
 */
const FRAME_COUNT = 22
const TURN_MS = 6000
const FRAME_MS = TURN_MS / FRAME_COUNT
const SRC = (i: number) => `/celebration/${String(i).padStart(2, '0')}.webp`

export function CelebrationCow({ size = 220, className }: { size?: number; className?: string }) {
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
    <div
      className={`relative ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Moo celebrating"
    >
      {Array.from({ length: FRAME_COUNT }).map((_, i) => (
        <img
          key={i}
          ref={(el) => {
            frames.current[i] = el
          }}
          src={SRC(i)}
          alt=""
          aria-hidden
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
