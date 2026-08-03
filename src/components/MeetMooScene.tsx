import { MooSequence } from './MooSequence'

/**
 * Moo standing in grass, as three stacked layers:
 *
 *   grass-lower  (behind the cow — the ground it stands on)
 *   MooSequence  (the turning cow)
 *   grass-upper  (in front of the cow — blades crossing the hooves)
 *
 * The front layer is what sells the depth: without it the cow reads as pasted
 * on top of a strip of grass rather than standing in it.
 *
 * Both grass images are 1144x243 and are drawn wider than the cow so they run
 * past it instead of ending in a visible hard stop. Every measurement is a
 * fraction of the scene width, so the composition holds at any screen size.
 */

const GRASS_ASPECT = 243 / 1144

interface Props {
  /** Width of the cow. The scene sizes itself around this. */
  size?: number
  /**
   * How far the front band sits below the back one, as a fraction of the grass
   * artwork's own height.
   *
   * Figma stacks the two bands with a -200 gap: they're 243px tall, so a 200px
   * overlap leaves the tops 43px apart — 43/243 ≈ 0.18. Grass lower ends up a
   * little higher than grass upper and the two read as one dense mass.
   */
  bandOffset?: number
  /** Grass width as a multiple of the cow width. */
  bleed?: number
  className?: string
}

export function MeetMooScene({ size = 320, bandOffset = 43 / 243, bleed = 1.5, className }: Props) {
  const grassW = size * bleed
  const grassH = grassW * GRASS_ASPECT
  const offset = grassH * bandOffset

  // Cow's feet land on the back band; the front band crosses over them.
  const sceneH = size + offset

  return (
    <div className={`relative mx-auto ${className ?? ''}`} style={{ width: size, height: sceneH }}>
      {/* Behind — the ground. */}
      <img
        src="/onboarding/grass-lower.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none"
        style={{ width: grassW, height: grassH, bottom: offset, zIndex: 0 }}
      />

      {/* The cow. */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ zIndex: 1 }}>
        <MooSequence size={size} />
      </div>

      {/* In front — blades crossing the hooves. */}
      <img
        src="/onboarding/grass-upper.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none"
        style={{ width: grassW, height: grassH, bottom: 0, zIndex: 2 }}
      />
    </div>
  )
}
