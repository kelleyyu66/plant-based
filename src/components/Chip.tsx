import type { MealTier } from '@/lib/types'

interface ChipProps {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  /** Tints the selected state to a meal tier color. */
  tier?: MealTier
}

const TIER_BG: Record<MealTier, string> = {
  vegan: 'bg-tier-vegan',
  vegetarian: 'bg-tier-veg',
  fish: 'bg-tier-fish',
  chicken: 'bg-tier-chicken',
  pork: 'bg-tier-pork',
  beef: 'bg-tier-beef',
}

/** Selectable pill. design.md §6. */
export function Chip({ label, selected, disabled, onClick, tier }: ChipProps) {
  const selectedBg = tier ? TIER_BG[tier] : 'bg-lime-400'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'rounded-pixel-sm border-2 border-ink px-3 py-2 text-sm font-bold font-body',
        'transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        selected ? `${selectedBg} text-ink shadow-pixel-sm` : 'bg-paper-2 text-ink-soft',
      ].join(' ')}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}
