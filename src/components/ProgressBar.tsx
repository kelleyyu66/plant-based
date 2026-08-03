import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max: number
  /** Draw discrete segments (e.g. meals x/3). */
  segments?: number
  className?: string
  fillClass?: string
}

/** Hairline-stroked capsule with a soft green fill, per the reference. */
export function ProgressBar({ value, max, segments, className, fillClass = 'bg-grass' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(1, value / max) : 0

  if (segments) {
    return (
      <div className={`flex gap-1.5 ${className ?? ''}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 flex-1 rounded-pill border border-ink ${i < value ? fillClass : 'bg-paper-2'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`h-3.5 overflow-hidden rounded-pill border border-ink bg-paper-2 ${className ?? ''}`}>
      <motion.div
        className={`h-full rounded-pill ${fillClass}`}
        initial={false}
        animate={{ width: `${pct * 100}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      />
    </div>
  )
}
