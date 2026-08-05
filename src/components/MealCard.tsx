import { useState } from 'react'
import { ChatCircle, ForkKnife } from '@phosphor-icons/react'
import type { Meal, Profile } from '@/lib/types'
import { TIER_LABEL, TIME_LABEL } from '@/lib/types'

interface MealCardProps {
  meal: Meal
  author?: Profile
  /** Points to show. Defaults to the meal's base; pass the quest-bonus-inclusive
   *  amount (earnedPointsByMeal) so the badge matches what was banked. */
  points?: number
  /** Comments logged on this meal. Omit or 0 hides the badge entirely. */
  commentCount?: number
  onClick?: () => void
}

/**
 * A meal in the 2-col feed. Photos sit in the same hairline-stroked frame as
 * every other container; photoless meals fall back to a neutral placeholder.
 */
export function MealCard({ meal, author, points, commentCount, onClick }: MealCardProps) {
  const [imgOk, setImgOk] = useState(true)
  const showImg = meal.photoUrl && imgOk

  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-card border border-ink bg-paper-2 text-left transition-transform active:scale-[0.98]"
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
        <span className="absolute right-1.5 top-1.5 rounded-pill border border-ink bg-paper-2/95 px-2 py-0.5 font-mono text-[12px] text-ink">
          +{points ?? meal.points}
        </span>
      </div>
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate font-mono text-[12px] text-muted">{author?.displayName ?? 'Someone'}</div>
          {!!commentCount && (
            <span className="flex shrink-0 items-center gap-1 font-mono text-[12px] text-muted">
              <ChatCircle size={13} aria-hidden />
              {commentCount}
            </span>
          )}
        </div>
        <div className="font-mono text-[14px] text-ink">
          {TIER_LABEL[meal.tier]} · {TIME_LABEL[meal.mealTime]}
        </div>
        {meal.caption && <div className="mt-0.5 line-clamp-2 font-mono text-[12px] text-muted">{meal.caption}</div>}
      </div>
    </button>
  )
}
