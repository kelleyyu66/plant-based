import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The windmill: a static tower with spokes turning on top.
 *
 * The spokes are a separate image rotated about their own centre — the middle of
 * the X — which is why they're positioned by their centre point rather than
 * their top-left. Placement matches the windmill reference: the hub sits just
 * under the roof peak, horizontally centred on the tower.
 *
 * One turn takes 10s.
 */

/** Spoke hub as a fraction of the whole windmill box. */
const HUB_X = 0.5
const HUB_Y = 0.3
/** Spoke image width as a fraction of the box width. */
const SPOKE_SCALE = 1.0
const TURN_S = 10

export function Windmill({ width, height, still }: { width: number; height: number; still?: boolean }) {
  const reduced = useReducedMotion() || still
  const spokeW = width * SPOKE_SCALE

  return (
    <div className="relative select-none" style={{ width, height }}>
      {/* Tower — the body image is narrower than the spokes, so it's centred. */}
      <img
        src="/home/windmill-body.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute bottom-0 left-1/2 max-w-none -translate-x-1/2 select-none"
        style={{ height: height * 0.86 }}
      />

      {/* Spokes — rotate about the hub. */}
      <div
        className="absolute"
        style={{
          left: `${HUB_X * 100}%`,
          top: `${HUB_Y * 100}%`,
          width: spokeW,
          height: spokeW,
          marginLeft: -spokeW / 2,
          marginTop: -spokeW / 2,
          animation: reduced ? undefined : `spin ${TURN_S}s linear infinite`,
        }}
      >
        <img
          src="/home/windmill-spokes.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full max-w-none select-none"
        />
      </div>
    </div>
  )
}
