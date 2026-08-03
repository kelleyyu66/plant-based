import { describe, expect, it } from 'vitest'
import { activeDailyChallenge, dailyQuestBonus, dailyQuestProgress, earnedPointsByMeal } from './dailyQuest'
import { computeMealPoints } from './points'
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

describe('daily quest bonus', () => {
  const tofu: DailyChallenge = { dayIndex: 0, kind: 'tofu', title: 'Eat tofu' }

  it('sums only the completed tasks (plant_meal + tofu, not three_meals)', () => {
    const meals = [meal({ questTags: ['tofu'] })]
    expect(dailyQuestBonus(dailyQuestProgress(meals, tofu))).toBe(6)
  })

  it('does not re-bank a bonus for a second qualifying meal that day', () => {
    const one = [meal({ mealTime: 'breakfast', questTags: ['tofu'] })]
    const two = [...one, meal({ id: 'meal-2', mealTime: 'lunch', questTags: ['tofu'] })]
    expect(dailyQuestBonus(dailyQuestProgress(two, tofu))).toBe(dailyQuestBonus(dailyQuestProgress(one, tofu)))
    expect(dailyQuestBonus(dailyQuestProgress(two, tofu))).toBe(6)
  })

  it('is zero when there is no active challenge', () => {
    expect(dailyQuestBonus(null)).toBe(0)
  })

  // The reported scenario, on an "Eat tofu" day: a vegetarian meal then a
  // vegan tofu meal earn 9 then 15 (base + only the newly-unlocked bonus),
  // and never the old hidden ×2 multiplier.
  it('credits base + newly-unlocked bonus per meal, 24 banked total', () => {
    const veg = meal({ mealTime: 'breakfast', tier: 'vegetarian', questTags: [] })
    const veganTofu = meal({ id: 'meal-2', mealTime: 'lunch', tier: 'vegan', questTags: ['tofu'] })

    const gain1 = dailyQuestBonus(dailyQuestProgress([veg], tofu)) - dailyQuestBonus(dailyQuestProgress([], tofu))
    expect(computeMealPoints('vegetarian', false) + gain1).toBe(9)

    const gain2 =
      dailyQuestBonus(dailyQuestProgress([veg, veganTofu], tofu)) - dailyQuestBonus(dailyQuestProgress([veg], tofu))
    expect(computeMealPoints('vegan', false) + gain2).toBe(15)

    const banked =
      computeMealPoints('vegetarian', false) +
      computeMealPoints('vegan', false) +
      dailyQuestBonus(dailyQuestProgress([veg, veganTofu], tofu))
    expect(banked).toBe(24)
  })
})

describe('earned points per meal', () => {
  const day = '2026-08-03'
  const at = (h: number) => `${day}T${String(h).padStart(2, '0')}:00:00.000Z`

  it("per-meal display points sum to the day's banked total", () => {
    const meals = [
      meal({ id: 'm1', mealDate: day, mealTime: 'breakfast', tier: 'vegan', questTags: ['tofu'], createdAt: at(8) }),
      meal({ id: 'm2', mealDate: day, mealTime: 'lunch', tier: 'vegetarian', createdAt: at(12) }),
      meal({ id: 'm3', mealDate: day, mealTime: 'dinner', tier: 'vegan', createdAt: at(18) }),
    ]
    const map = earnedPointsByMeal(meals)
    const sum = meals.reduce((s, m) => s + (map.get(m.id) ?? 0), 0)

    const challenge = activeDailyChallenge(new Date(`${day}T12:00:00`))
    const banked = meals.reduce((s, m) => s + m.points, 0) + dailyQuestBonus(dailyQuestProgress(meals, challenge))
    expect(sum).toBe(banked)
  })

  it("keeps each user's quest bonus on their own meals", () => {
    const mine = meal({ id: 'a', userId: 'me', mealDate: day, tier: 'vegan', questTags: ['tofu'], createdAt: at(8) })
    const theirs = meal({ id: 'b', userId: 'u2', mealDate: day, tier: 'beef', createdAt: at(9) })
    const map = earnedPointsByMeal([mine, theirs])
    // Beef completes no quest → base only; the other user's tofu bonus never leaks here.
    expect(map.get('b')).toBe(theirs.points)
  })
})
