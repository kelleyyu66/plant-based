import type { SpriteVariant } from '@/lib/types'
import { animalName } from '@/content/animals'

interface SpriteProps {
  index: number
  variant?: SpriteVariant
  /** Display size in px. Prefer integer multiples of 64 to stay crisp. design.md §8. */
  size?: number
  className?: string
}

/** Renders one pre-sliced animal avatar, pixelated. */
export function Sprite({ index, variant = 'regular', size = 64, className }: SpriteProps) {
  const idx = String(index).padStart(2, '0')
  return (
    <img
      src={`/avatars/${variant}/${idx}.png`}
      width={size}
      height={size}
      alt={animalName(index)}
      className={`pixelated ${className ?? ''}`}
      draggable={false}
    />
  )
}
