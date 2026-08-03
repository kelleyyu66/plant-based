import { useEffect, useState } from 'react'
import { SpeechBubble } from './SpeechBubble'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { COW_SLEEPING_IMG_W, COW_SLEEPING_LIFT, COW_STANDING_IMG_W, type CowPose } from '@/lib/scene'

/**
 * Moo on the home screen, with everything that belongs to her.
 *
 * The speech bubble and the sleep z's are rendered INSIDE this component, above
 * her head, so they travel with her while she paces instead of hanging in the
 * air at a fixed spot.
 *
 * By day she alternates standing and pacing, turning around at each end. After
 * 11pm she lies down; three z's then rise in sequence — z1 small, z2 joins it
 * larger, z3 larger still, then all three clear and it repeats.
 *
 * The standing/pacing art shares a 360x260 canvas so those frames are already
 * mutually aligned. Sleeping is a separately trimmed image, so both are sized
 * from the cow's BODY width (see scene.ts) rather than the canvas — sizing by
 * canvas made the sleeping pose look enormous next to the standing one.
 */

const WALK_MS = 380
const STAND_MS = 5200
const PACE_MS = 6400
/** How far she walks, as a fraction of her own width. */
const PACE_RANGE = 0.34

interface Props {
  pose: CowPose
  /** Scales the cow art against the design canvas. */
  k: number
  /** Speech bubble copy. Ignored while asleep. */
  says?: string
  /** Fires whenever she turns, so the chicken can watch her pace. */
  onDirChange?: (dir: 'l' | 'r') => void
}

export function CowActor({ pose, k, says, onDirChange }: Props) {
  const reduced = useReducedMotion()
  const [walkFrame, setWalkFrame] = useState(0)
  const [dir, setDir] = useState<'l' | 'r'>('r')
  const [moving, setMoving] = useState(false)
  const [offset, setOffset] = useState(0)

  const asleep = pose === 'sleeping'
  const imgW = (asleep ? COW_SLEEPING_IMG_W : COW_STANDING_IMG_W) * k

  // Alternate standing and pacing.
  useEffect(() => {
    if (asleep || reduced) return
    const id = setInterval(() => {
      setMoving((m) => {
        if (!m)
          setDir((d) => {
            const next = d === 'r' ? 'l' : 'r'
            onDirChange?.(next)
            return next
          })
        return !m
      })
    }, moving ? PACE_MS : STAND_MS)
    return () => clearInterval(id)
  }, [asleep, reduced, moving])

  // Walk cycle + travel.
  useEffect(() => {
    if (!moving || asleep || reduced) return
    const id = setInterval(() => {
      setWalkFrame((f) => (f === 0 ? 1 : 0))
      setOffset((o) => Math.max(-PACE_RANGE, Math.min(PACE_RANGE, o + (dir === 'r' ? 0.03 : -0.03))))
    }, WALK_MS)
    return () => clearInterval(id)
  }, [moving, dir, asleep, reduced])

  const src = asleep
    ? '/home/cow/sleeping.webp'
    : moving
      ? `/home/cow/pace-${dir}${walkFrame + 1}.webp`
      : '/home/cow/standing.webp'

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        width: imgW,
        transform: `translate(${offset * 100}%, ${asleep ? -COW_SLEEPING_LIFT * k : 0}px)`,
        transition: `transform ${WALK_MS}ms linear`,
      }}
    >
      {/* Above her head, travelling with her. */}
      {asleep ? (
        <SleepZs reduced={reduced} k={k} />
      ) : says ? (
        <div className="mb-1" style={{ width: Math.max(150, imgW * 1.15) }}>
          <SpeechBubble text={says} width={Math.max(150, imgW * 1.15)} />
        </div>
      ) : null}

      <img src={src} alt="Moo" draggable={false} className="w-full max-w-none select-none" />
    </div>
  )
}

/** Three z's rising above the sleeping cow, each bigger and later than the last. */
function SleepZs({ reduced, k }: { reduced: boolean; k: number }) {
  const CYCLE = 3.6
  const zs = [
    { size: 13 * k, delay: 0, left: 0 },
    { size: 18 * k, delay: CYCLE / 3, left: 12 * k },
    { size: 24 * k, delay: (CYCLE / 3) * 2, left: 26 * k },
  ]
  if (reduced) return <div style={{ height: 34 * k }} aria-hidden />
  return (
    <div className="relative" style={{ height: 34 * k, width: 60 * k }} aria-hidden>
      {zs.map((z, i) => (
        <span
          key={i}
          className="absolute bottom-0 font-hand leading-none text-ink"
          style={{
            left: z.left,
            fontSize: z.size,
            animation: `zfloat ${CYCLE}s ease-out ${z.delay}s infinite`,
            opacity: 0,
          }}
        >
          z
        </span>
      ))}
    </div>
  )
}
