import { PawPrint } from '@phosphor-icons/react'
import type { SpriteVariant } from '@/lib/types'
import { animalName } from '@/content/animals'

interface SpriteProps {
  index: number
  variant?: SpriteVariant
  /** Display size in px. */
  size?: number
  className?: string
}

/**
 * ILLUSTRATION SLOT — one critter avatar.
 *
 * The critter artwork is intentionally not wired up yet (see /avatars, which is
 * gitignored), so this renders a neutral placeholder mark rather than a broken
 * image. Swap the icon for the hand-drawn critter art when it lands.
 */
export function Sprite({ index, size = 64, className }: SpriteProps) {
  return (
    <span
      role="img"
      aria-label={animalName(index)}
      className={`grid place-items-center ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <PawPrint size={Math.round(size * 0.6)} weight="regular" className="text-ink-faint" aria-hidden />
    </span>
  )
}
