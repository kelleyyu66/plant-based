import { motion } from 'framer-motion'
import { MOO_FRAMES, MOO_PALETTE, type MooMood } from '@/content/mooSprite'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PixelGrid } from './PixelGrid'

interface MooCowProps {
  mood?: MooMood
  scale?: number
  className?: string
}

/** The mascot. Idle bobs, dance hops, sleep sits still. design.md §7. */
export function MooCow({ mood = 'idle', scale = 10, className }: MooCowProps) {
  const reduced = useReducedMotion()
  const grid = <PixelGrid rows={MOO_FRAMES[mood]} palette={MOO_PALETTE} scale={scale} className="pixelated" />

  if (reduced) return <div className={className}>{grid}</div>

  const anim =
    mood === 'dance'
      ? { y: [0, -14, 0, -8, 0], rotate: [0, -6, 6, -3, 0] }
      : mood === 'idle'
        ? { y: [0, -6, 0] }
        : { y: 0 }
  const transition =
    mood === 'dance'
      ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <motion.div className={className} animate={anim} transition={transition} style={{ display: 'inline-block' }}>
      {grid}
    </motion.div>
  )
}
