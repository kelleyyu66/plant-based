import type { SpriteVariant } from '@/lib/types'
import { Sprite } from './Sprite'

const SIZES = { sm: 40, md: 56, lg: 88 } as const

interface AvatarProps {
  index: number
  variant?: SpriteVariant
  size?: keyof typeof SIZES
  className?: string
}

/** Round, ink-bordered frame around an animal sprite. */
export function Avatar({ index, variant = 'regular', size = 'md', className }: AvatarProps) {
  const px = SIZES[size]
  return (
    <div
      className={`grid place-items-center overflow-hidden rounded-full border-2 border-ink bg-mint-100 ${className ?? ''}`}
      style={{ width: px, height: px }}
    >
      <Sprite index={index} variant={variant} size={px - 6} />
    </div>
  )
}
