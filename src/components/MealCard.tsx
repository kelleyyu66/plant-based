import { useState } from 'react'
import type { Meal, Profile } from '@/lib/types'
import { TIER_LABEL, TIME_LABEL } from '@/lib/types'

const TIER_EMOJI: Record<string, string> = {
  vegan: '🥗', vegetarian: '🧀', fish: '🐟', chicken: '🍗', pork: '🥓', beef: '🥩',
}
const TIER_BG: Record<string, string> = {
  vegan: 'bg-tier-vegan', vegetarian: 'bg-tier-veg', fish: 'bg-tier-fish',
  chicken: 'bg-tier-chicken', pork: 'bg-tier-pork', beef: 'bg-tier-beef',
}

interface MealCardProps {
  meal: Meal
  author?: Profile
  onClick?: () => void
}

/** A meal in the 2-col community feed. Photoless meals get a tier-colored fallback. */
export function MealCard({ meal, author, onClick }: MealCardProps) {
  const [imgOk, setImgOk] = useState(true)
  const showImg = meal.photoUrl && imgOk

  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-pixel border-2 border-ink bg-paper-2 text-left transition-transform active:scale-[0.98]"
    >
      <div className={`relative aspect-square w-full ${showImg ? '' : TIER_BG[meal.tier]}`}>
        {showImg ? (
          <img
            src={meal.photoUrl!}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl">{TIER_EMOJI[meal.tier]}</div>
        )}
        <span className="absolute right-1.5 top-1.5 rounded-pixel-sm border-2 border-ink bg-paper-2/90 px-1.5 py-0.5 font-pixel text-[10px] text-ink">
          +{meal.points}
        </span>
      </div>
      <div className="p-2.5">
        <div className="font-body text-[11px] font-extrabold uppercase tracking-wide text-grass-700">
          {author?.displayName ?? 'Someone'}
        </div>
        <div className="font-body text-sm font-extrabold text-ink">
          {TIER_LABEL[meal.tier]} · {TIME_LABEL[meal.mealTime]}
        </div>
        {meal.caption && <div className="mt-0.5 line-clamp-2 font-body text-xs text-ink-soft">{meal.caption}</div>}
      </div>
    </button>
  )
}
