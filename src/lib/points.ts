import type { DailyQuest, MealTier } from './types'

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

export function questMultiplier(tier: MealTier, quest: DailyQuest | null): number {
  if (!quest) return 1
  if (quest.tier === null) {
    // "any plant-based meal" — vegan or vegetarian
    return tier === 'vegan' || tier === 'vegetarian' ? quest.multiplier : 1
  }
  return quest.tier === tier ? quest.multiplier : 1
}

/**
 * Points for a single meal.
 * Quest multiplier applies to the tier base ONLY; the photo +1 is flat and never multiplied.
 */
export function computeMealPoints(tier: MealTier, hasPhoto: boolean, quest: DailyQuest | null): number {
  const base = Math.round(TIER_POINTS[tier] * questMultiplier(tier, quest))
  return base + (hasPhoto ? PHOTO_BONUS : 0)
}
