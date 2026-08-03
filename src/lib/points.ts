import type { MealTier } from './types'

// design.md §9 — meal points. Mirrored by the DB trigger (authoritative in live mode).
export const TIER_POINTS: Record<MealTier, number> = {
  vegan: 10,
  vegetarian: 8,
  fish: 5,
  chicken: 5,
  pork: 2,
  beef: 0,
}

export const PHOTO_BONUS = 1

/**
 * Points for a single meal: its tier base plus a flat photo bonus.
 *
 * Daily-quest bonuses (eat one plant-based meal / log all three / today's
 * challenge) are NOT part of a meal's own score — they're awarded once per day
 * on top of the day's meals (see dailyQuestBonus). Keeping them separate is what
 * stops, say, a second tofu meal from banking the "Eat tofu" bonus twice.
 */
export function computeMealPoints(tier: MealTier, hasPhoto: boolean): number {
  return TIER_POINTS[tier] + (hasPhoto ? PHOTO_BONUS : 0)
}
