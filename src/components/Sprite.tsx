import { animalName, critterSrc } from '@/content/animals'

interface SpriteProps {
  index: number
  /** Display size in px (square). */
  size?: number
  className?: string
}

/** One critter, rendered at its natural aspect inside a square box. */
export function Sprite({ index, size = 64, className }: SpriteProps) {
  return (
    <img
      src={critterSrc(index)}
      width={size}
      height={size}
      alt={animalName(index)}
      draggable={false}
      className={`object-contain ${className ?? ''}`}
      style={{ width: size, height: size }}
    />
  )
}
