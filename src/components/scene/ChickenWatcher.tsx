import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The chicken watches Moo pace.
 *
 * When the cow walks left→right the chicken turns through
 *   -15° → -30° → … → -180° → 165°
 * and when she walks right→left it plays the same arc in reverse,
 *   165° → -180° → … → -15°
 * holding on the final view between passes. Frames step at a pace that spreads
 * the turn across roughly the cow's walking time, so the bird appears to track
 * her rather than snap.
 *
 * Frames are tight-cropped squares at one shared scale (the earlier export
 * bottom-aligned the bird in a cow-sized canvas, which is why it rendered
 * clipped in the scene box).
 */

const SEQ_R = [-15, -30, -45, -60, -75, -90, -105, -120, -135, -150, -165, -180, 165]
const SEQ_L = [...SEQ_R].reverse()
const STEP_MS = 360

const SRC = (a: number) => `/home/chicken/a${a}.webp`
/** Every angle either sequence can show — all stay mounted so swaps are instant. */
const ALL_ANGLES = [...new Set([...SEQ_R, ...SEQ_L])]

interface Props {
  /** Which way the cow is currently facing/walking. */
  cowDir: 'l' | 'r'
  size: number
}

export function ChickenWatcher({ cowDir, size }: Props) {
  const reduced = useReducedMotion()
  const [angle, setAngle] = useState(SEQ_R[0])
  const step = useRef(0)

  // A direction change restarts the matching arc from its first frame.
  useEffect(() => {
    if (reduced) {
      setAngle(cowDir === 'r' ? SEQ_R[0] : SEQ_L[0])
      return
    }
    const seq = cowDir === 'r' ? SEQ_R : SEQ_L
    step.current = 0
    setAngle(seq[0])
    const id = setInterval(() => {
      step.current += 1
      if (step.current >= seq.length) {
        clearInterval(id)
        return
      }
      setAngle(seq[step.current])
    }, STEP_MS)
    return () => clearInterval(id)
  }, [cowDir, reduced])

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      {ALL_ANGLES.map((a) => (
        <img
          key={a}
          src={SRC(a)}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full max-w-none select-none object-contain"
          style={{ opacity: a === angle ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
