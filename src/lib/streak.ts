import { dayDiff } from './dates'

export interface StreakState {
  current: number
  best: number
  lastDate: string | null
}

export interface StreakResult extends StreakState {
  /** True when this log advanced the streak to a new day. */
  advanced: boolean
  /** True when this log hit the user's goal for the first time. */
  hitGoal: boolean
}

/**
 * Update streak given a new log on `today` (YYYY-MM-DD). design.md §9.
 * Any tier counts. Same-day logs don't change the streak. A gap resets to 1.
 */
export function applyLog(prev: StreakState, today: string, goal: number): StreakResult {
  if (prev.lastDate === today) {
    return { ...prev, advanced: false, hitGoal: false }
  }
  const gap = prev.lastDate ? dayDiff(prev.lastDate, today) : Infinity
  const current = gap === 1 ? prev.current + 1 : 1
  const best = Math.max(prev.best, current)
  const hitGoal = current === goal
  return { current, best, lastDate: today, advanced: true, hitGoal }
}

/** Milestone bonus points when the streak goal is reached. */
export function streakBonus(goal: number): number {
  return goal * 2 // 3 -> 6, 5 -> 10, 7 -> 14
}

/** A streak is "alive" if the last log was today or yesterday. */
export function isStreakAlive(lastDate: string | null, today: string): boolean {
  if (!lastDate) return false
  return dayDiff(lastDate, today) <= 1
}
