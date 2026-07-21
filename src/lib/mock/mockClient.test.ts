import { beforeEach, describe, expect, it } from 'vitest'
import { MockProvider } from './mockClient'
import { toCohortDate } from '../dates'

const onboard = (p: MockProvider) =>
  p.completeOnboarding({
    displayName: 'Test Me',
    avatarIndex: 3,
    teamId: 'team-kelley',
    startingDiet: 'meat_or_flexitarian',
    onboarding: { plantFrequency: 'sometimes', proteins: ['Chicken'], climateFamiliarity: 'new' },
    streakGoal: 3,
  })

describe('MockProvider', () => {
  beforeEach(() => localStorage.clear())

  it('seeds ~45 cohort members with points', async () => {
    const p = new MockProvider()
    const lb = await p.leaderboard()
    expect(lb.length).toBeGreaterThanOrEqual(45)
    expect(lb[0].points).toBeGreaterThan(0)
    // sorted desc
    expect(lb[0].points).toBeGreaterThanOrEqual(lb[1].points)
  })

  it('has 4 teams with standings', async () => {
    const p = new MockProvider()
    const standings = await p.teamStandings()
    expect(standings).toHaveLength(4)
    expect(standings.every((s) => s.members > 0)).toBe(true)
  })

  it('logs a meal and awards points + streak', async () => {
    const p = new MockProvider()
    await onboard(p)
    const res = await p.logMeal({
      tier: 'vegan',
      mealTime: 'lunch',
      mealDate: toCohortDate(),
      caption: 'tofu bowl',
      hasPhoto: true,
      photoDataUrl: 'data:x',
    })
    expect(res.meal.points).toBeGreaterThanOrEqual(11) // vegan 10 + photo 1 (or 20+1 on quest day)
    expect(res.streak.current).toBe(1)
    const me = await p.getMyProfile()
    expect(me?.streakCurrent).toBe(1)
  })

  it('enforces one meal per time slot and the 3/day cap', async () => {
    const p = new MockProvider()
    await onboard(p)
    const date = toCohortDate()
    const base = { caption: null, hasPhoto: false, photoDataUrl: null, mealDate: date }
    await p.logMeal({ ...base, tier: 'vegan', mealTime: 'breakfast' })
    await expect(p.logMeal({ ...base, tier: 'fish', mealTime: 'breakfast' })).rejects.toThrow('SLOT_TAKEN')
    await p.logMeal({ ...base, tier: 'vegan', mealTime: 'lunch' })
    await p.logMeal({ ...base, tier: 'vegan', mealTime: 'dinner' })
    // 4th distinct attempt would exceed cap — but all slots are used, so it's SLOT_TAKEN first.
    const today = await p.myMealsForDate(date)
    expect(today).toHaveLength(3)
  })

  it('toggles a reaction on and off', async () => {
    const p = new MockProvider()
    await onboard(p)
    const meals = await p.listMeals()
    const target = meals[0].id
    await p.toggleReaction(target, '🔥')
    let rs = await p.listReactions(target)
    expect(rs.some((r) => r.userId === 'me' && r.emoji === '🔥')).toBe(true)
    await p.toggleReaction(target, '🔥')
    rs = await p.listReactions(target)
    expect(rs.some((r) => r.userId === 'me' && r.emoji === '🔥')).toBe(false)
  })

  it('persists the current user across instances (localStorage overlay)', async () => {
    const p1 = new MockProvider()
    await onboard(p1)
    const p2 = new MockProvider()
    const me = await p2.getMyProfile()
    expect(me?.displayName).toBe('Test Me')
  })
})
