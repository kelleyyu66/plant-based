import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Moo's home-screen look (the hand-drawn standing pose) for use outside the
 * pasture scene — e.g. empty states. Static art with a gentle idle bob; the
 * pacing, speech, and sleep behaviour lives in CowActor.
 *
 * `size` is the frame width; the standing art sits on a 360x260 canvas, so the
 * visible cow reads a touch smaller than the number.
 */
export function HomeCow({ size = 150, className }: { size?: number; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.img
      src="/home/cow/standing.webp"
      alt="Moo"
      draggable={false}
      className={`max-w-none select-none ${className ?? ''}`}
      style={{ width: size, height: 'auto' }}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
