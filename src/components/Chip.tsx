import type { MealTier } from '@/lib/types'

interface ChipProps {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  /** Kept for API compatibility; the neutral pass no longer tints by tier. */
  tier?: MealTier
}

/** Selectable pill: hairline stroke, inverts to cow-spot black when chosen. */
export function Chip({ label, selected, disabled, onClick }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'rounded-pill border border-ink px-3.5 py-1.5 font-mono text-[13px]',
        'transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        selected ? 'bg-ink text-paper-2' : 'bg-paper-2 text-ink',
      ].join(' ')}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}
