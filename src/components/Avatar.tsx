import { Cow } from '@phosphor-icons/react'
import type { SpriteVariant } from '@/lib/types'
import { animalName } from '@/content/animals'

const SIZES = { sm: 36, md: 52, lg: 84 } as const

interface AvatarProps {
  index: number
  variant?: SpriteVariant
  size?: keyof typeof SIZES
  className?: string
}

/**
 * ILLUSTRATION SLOT — round, hairline-stroked avatar frame.
 *
 * The critter artwork is deliberately not wired up yet, so this shows a neutral
 * placeholder mark instead of a broken image. When the hand-drawn critters
 * land, render them inside this same frame.
 */
export function Avatar({ index, size = 'md', className }: AvatarProps) {
  const px = SIZES[size]
  return (
    <div
      role="img"
      aria-label={animalName(index)}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-ink bg-paper-3 ${className ?? ''}`}
      style={{ width: px, height: px }}
    >
      <Cow size={Math.round(px * 0.55)} weight="regular" className="text-ink-soft" aria-hidden />
    </div>
  )
}
