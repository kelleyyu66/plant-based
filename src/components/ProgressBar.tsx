import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max: number
  /** Draw discrete segments (e.g. meals x/3). */
  segments?: number
  className?: string
  fillClass?: string
}

/** Determinate progress with a springy fill and over-goal glow. design.md §6–§7. */
export function ProgressBar({ value, max, segments, className, fillClass = 'bg-lime-400' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const over = value > max

  if (segments) {
    return (
      <div className={`flex gap-1.5 ${className ?? ''}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-pixel-sm border-2 border-ink/70 ${i < value ? fillClass : 'bg-black/20'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`h-3 overflow-hidden rounded-full border-2 border-ink/70 bg-black/20 ${className ?? ''}`}>
      <motion.div
        className={`h-full rounded-full ${fillClass} ${over ? 'shadow-[0_0_8px_2px_rgba(183,224,106,0.8)]' : ''}`}
        initial={false}
        animate={{ width: `${pct * 100}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      />
    </div>
  )
}
