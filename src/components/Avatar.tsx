import { animalName } from '@/content/animals'

const SIZES = { xs: 26, sm: 36, md: 52, lg: 84 } as const

/** Indices with a dedicated circle-profile image. Index 19 (Duck) has no
 *  profile export yet — it falls back to the standing critter art. */
const PROFILE_MAX = 18
const profileSrc = (i: number) =>
  i >= 0 && i <= PROFILE_MAX ? `/critters/profile/${String(i).padStart(2, '0')}.webp` : null

interface AvatarProps {
  index: number
  size?: keyof typeof SIZES
  className?: string
}

/**
 * The user's critter, circle-cropped inside a hairline ring, using the
 * dedicated profile artwork (designed for the circle crop). This is the
 * profile image everywhere: leaderboard rows, meal authors, and the You tab.
 */
export function Avatar({ index, size = 'md', className }: AvatarProps) {
  const px = SIZES[size]
  const src = profileSrc(index)
  // The profile artwork bakes in its own drawn ring — adding our hairline
  // border doubled it. Only the fallback (no profile art) keeps the frame.
  const frame = src ? '' : 'border border-ink bg-paper-2'
  return (
    <div
      role="img"
      aria-label={animalName(index)}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${frame} ${className ?? ''}`}
      style={{ width: px, height: px }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} aria-hidden className="h-full w-full object-cover" />
      ) : (
        <img
          src={`/critters/${String(index).padStart(2, '0')}.png`}
          alt=""
          draggable={false}
          aria-hidden
          className="object-contain"
          style={{ width: px * 0.92, height: px * 0.92, transform: `translateY(${px * 0.04}px)` }}
        />
      )}
    </div>
  )
}
