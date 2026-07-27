import { describe, expect, it } from 'vitest'
import { dailyQuestProgress } from './dailyQuest'
import type { DailyChallenge, Meal } from './types'

const meal = (overrides: Partial<Meal> = {}): Meal => ({
  id: 'meal-1',
  userId: 'me',
  tier: 'vegan',
  mealTime: 'breakfast',
  mealDate: '2026-07-27',
  photoUrl: null,
  caption: null,
  questTags: [],
  plantProteinGrams: 0,
  points: 10,
  co2SavedKg: 2.5,
  createdAt: '2026-07-27T12:00:00.000Z',
  ...overrides,
})

const progressFor = (challenge: DailyChallenge, meals: Meal[]) => dailyQuestProgress(meals, challenge)!.tasks

describe('daily quest progress', () => {
  it('validates the two fixed tasks from logged meals', () => {
    const tasks = progressFor(
      { dayIndex: 0, kind: 'tofu', title: 'Eat tofu' },
      [
        meal({ mealTime: 'breakfast' }),
        meal({ id: 'meal-2', mealTime: 'lunch', tier: 'fish' }),
        meal({ id: 'meal-3', mealTime: 'dinner', tier: 'chicken' }),
      ],
    )

    expect(tasks).toMatchObject([
      { bonusPoints: 1, completed: true },
      { bonusPoints: 3, completed: true },
      { bonusPoints: 5, completed: false },
    ])
  })

  it('requires the relevant user-supplied meal tag for ingredient challenges', () => {
    const tasks = progressFor(
      { dayIndex: 0, kind: 'tofu', title: 'Eat tofu' },
      [meal({ questTags: ['tofu'] })],
    )

    expect(tasks[2]).toMatchObject({ id: 'tofu', completed: true })
  })

  it('requires every logged meal to be marked home-cooked for the home challenge', () => {
    const challenge: DailyChallenge = { dayIndex: 4, kind: 'cooked_at_home', title: 'Eat or cook all three meals at home' }
    const meals = [
      meal({ mealTime: 'breakfast', questTags: ['cooked_at_home'] }),
      meal({ id: 'meal-2', mealTime: 'lunch', questTags: ['cooked_at_home'] }),
      meal({ id: 'meal-3', mealTime: 'dinner', questTags: ['cooked_at_home'] }),
    ]

    expect(progressFor(challenge, meals)[2].completed).toBe(true)
    expect(progressFor(challenge, meals.slice(0, 2))[2].completed).toBe(false)
  })

  it('sums logged plant-protein grams and requires three plant-based meals for the all-plant challenge', () => {
    const proteinTasks = progressFor(
      { dayIndex: 5, kind: 'plant_protein_50g', title: 'Get at least 50g of plant-based protein' },
      [meal({ plantProteinGrams: 20 }), meal({ id: 'meal-2', plantProteinGrams: 30 })],
    )
    expect(proteinTasks[2].completed).toBe(true)

    const allPlantTasks = progressFor(
      { dayIndex: 6, kind: 'all_plant_meals', title: 'Make all meals plant-based' },
      [
        meal({ mealTime: 'breakfast' }),
        meal({ id: 'meal-2', mealTime: 'lunch', tier: 'vegetarian' }),
        meal({ id: 'meal-3', mealTime: 'dinner' }),
      ],
    )
    expect(allPlantTasks[2].completed).toBe(true)
  })
})
