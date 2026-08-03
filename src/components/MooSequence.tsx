import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Moo turning on the spot, played from a numbered image sequence instead of a
 * GIF. The GIF was 220x220 and visibly dithered; these frames are 720px WebP
 * with a real alpha channel, so the cow stays crisp at any size and sits on the
 * page background rather than carrying a matte.
 *
 * Frames run 0° → 180° → -165° → -15° and loop. The source set also contains
 * -180°, which is the same pose as 180° re-rendered — it's dropped at export
 * time so the loop doesn't hitch on a near-duplicate.
 *
 * The frames are stacked and swapped by writing `style.opacity` through refs
 * rather than by setting React state. Re-rendering all 24 <img> nodes on every
 * tick couldn't keep up and the rotation crawled at roughly a third of the
 * intended rate; touching two DOM nodes per tick holds the real cadence.
 * Playback waits for every frame to decode so it can't start on missing images.
 */
const FRAME_COUNT = 24
/** One full turn. Frame interval is derived so the pace stays honest if the
 *  frame count ever changes. */
const TURN_MS = 5000
const FRAME_MS = TURN_MS / FRAME_COUNT
const SRC = (i: number) => `/onboarding/moo/${String(i).padStart(2, '0')}.webp`

export function MooSequence({ size = 360, className }: { size?: number; className?: string }) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const frames = useRef<Array<HTMLImageElement | null>>([])
  const loaded = useRef(0)

  useEffect(() => {
    if (!ready || reduced) return
    let current = 0
    const id = setInterval(() => {
      const next = (current + 1) % FRAME_COUNT
      // Only the two frames that change are touched.
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
      aria-label="Moo the cow, turning around"
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
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
