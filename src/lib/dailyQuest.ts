import { DAILY_CHALLENGES } from '@/content/seed'
import { dayOfYear } from './dates'
import type { DailyChallenge, DailyQuestProgress, DailyQuestTask, Meal, QuestTag } from './types'

export const PLANT_BASED_TIERS = new Set(['vegan', 'vegetarian'])

export function activeDailyChallenge(d: Date = new Date()): DailyChallenge | null {
  if (DAILY_CHALLENGES.length === 0) return null
  return DAILY_CHALLENGES[dayOfYear(d) % DAILY_CHALLENGES.length] ?? null
}

export function challengeTag(kind: DailyChallenge['kind']): QuestTag | null {
  return ['tofu', 'edamame', 'five_colours', 'tempeh', 'cooked_at_home'].includes(kind)
    ? (kind as QuestTag)
    : null
}

export function dailyQuestProgress(meals: Meal[], challenge: DailyChallenge | null): DailyQuestProgress | null {
  if (!challenge) return null

  const plantMeal = meals.some((meal) => PLANT_BASED_TIERS.has(meal.tier))
  const threeMeals = meals.length === 3
  const tag = challengeTag(challenge.kind)
  const completed = tag
    ? challenge.kind === 'cooked_at_home'
      ? threeMeals && meals.every((meal) => meal.questTags.includes(tag))
      : meals.some((meal) => meal.questTags.includes(tag))
    : challenge.kind === 'plant_protein_50g'
      ? meals.reduce((total, meal) => total + meal.plantProteinGrams, 0) >= 50
      : threeMeals && meals.every((meal) => PLANT_BASED_TIERS.has(meal.tier))

  const tasks: DailyQuestTask[] = [
    { id: 'plant_meal', title: 'Eat one plant-based meal', bonusPoints: 1, completed: plantMeal },
    { id: 'three_meals', title: 'Log all three meals', bonusPoints: 3, completed: threeMeals },
    { id: challenge.kind, title: challenge.title, bonusPoints: 5, completed },
  ]

  return { tasks }
}
