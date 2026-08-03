import { sunProgress } from '@/lib/scene'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Sun + drifting clouds. Sits behind every other layer in the scene.
 *
 * Exactly two clouds are ever in flight — one per lane — so the sky never gets
 * busy. Each lane runs the same `drift` keyframe at a different duration and
 * offset, which keeps them from crossing the screen in lockstep.
 *
 * The sun follows an arc set by the clock: it climbs from the left at sunrise,
 * peaks at midday and sets on the right, and is simply absent at night.
 */

const LANES = [
  { src: '/home/cloud-1.webp', top: '8%', width: '24%', duration: 15, delay: 0 },
  { src: '/home/cloud-2.webp', top: '24%', width: '18%', duration: 15, delay: -7.5 },
]

export function Sky({ hour, minute }: { hour: number; minute: number }) {
  const reduced = useReducedMotion()
  const sun = sunProgress(hour, minute)

  return (
    <>
      {/* Clouds — between the mountain (z1) and the tree/buildings (z3). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 2 }}>
        {LANES.map((lane) => (
          <img
            key={lane.src}
            src={lane.src}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute left-0 max-w-none select-none"
            style={{
              top: lane.top,
              width: lane.width,
              animation: reduced ? undefined : `drift ${lane.duration}s linear ${lane.delay}s infinite`,
              // Parked mid-sky when motion is reduced, rather than off-screen.
              transform: reduced ? 'translateX(60%)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Sun — the back-most layer; clouds cross in front of it. */}
      {sun !== null && (
        <img
          src="/home/sun.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{
            // Left-to-right across the day; height follows a shallow parabola so
            // it's low at dawn/dusk and high at midday.
            left: `${8 + sun * 74}%`,
            top: `${26 - Math.sin(sun * Math.PI) * 20}%`,
            width: '11%',
            zIndex: 0,
          }}
        />
      )}
    </>
  )
}
