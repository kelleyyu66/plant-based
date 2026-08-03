import { useState } from 'react'
import { ForkKnife, PencilSimple } from '@phosphor-icons/react'
import type { Meal, Profile } from '@/lib/types'
import { TIER_LABEL, TIME_LABEL } from '@/lib/types'

interface MealCardProps {
  meal: Meal
  author?: Profile
  onClick?: () => void
  /** Present only on the viewer's own meals — shows the edit pencil. */
  onEdit?: () => void
}

/**
 * A meal in the 2-col feed. Photos sit in the same hairline-stroked frame as
 * every other container; photoless meals fall back to a neutral placeholder.
 */
export function MealCard({ meal, author, onClick, onEdit }: MealCardProps) {
  const [imgOk, setImgOk] = useState(true)
  const showImg = meal.photoUrl && imgOk

  return (
    <div className="relative">
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit meal"
          className="absolute left-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full border border-ink bg-paper-2/95 text-ink transition-transform active:scale-95"
        >
          <PencilSimple size={14} aria-hidden />
        </button>
      )}
      <button
        onClick={onClick}
        className="flex w-full flex-col overflow-hidden rounded-card border border-ink bg-paper-2 text-left transition-transform active:scale-[0.98]"
      >
      <div className="relative aspect-square w-full border-b border-ink bg-paper-3">
        {showImg ? (
          <img
            src={meal.photoUrl!}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ForkKnife size={30} className="text-ink-faint" aria-hidden />
          </div>
        )}
        <span className="absolute right-1.5 top-1.5 rounded-pill border border-ink bg-paper-2/95 px-2 py-0.5 font-mono text-[11px] text-ink">
          +{meal.points}
        </span>
      </div>
      <div className="p-2.5">
        <div className="truncate font-mono text-[11px] text-muted">{author?.displayName ?? 'Someone'}</div>
        <div className="font-mono text-[13px] text-ink">
          {TIER_LABEL[meal.tier]} · {TIME_LABEL[meal.mealTime]}
        </div>
        {meal.caption && <div className="mt-0.5 line-clamp-2 font-mono text-[11px] text-muted">{meal.caption}</div>}
      </div>
      </button>
    </div>
  )
}
