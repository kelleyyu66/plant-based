import type { Comment } from './types'

/** How many comments each meal has, keyed by meal id. Feeds the MealCard badge. */
export function commentCountsByMeal(comments: Comment[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of comments) {
    map.set(c.mealId, (map.get(c.mealId) ?? 0) + 1)
  }
  return map
}
