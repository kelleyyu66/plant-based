import { describe, expect, it } from 'vitest'
import { computeMealPoints, TIER_POINTS } from './points'
import { co2SavedKg, impactEquivalents, MILES_PER_KG, SHOWERS_PER_KG, TREES_PER_KG } from './impact'
import { applyLog } from './streak'
import type { DailyQuest, MealTier } from './types'

const quest = (tier: MealTier | null, multiplier = 2): DailyQuest => ({
  dayIndex: 0,
  title: 't',
  tier,
  multiplier,
  description: '',
})

describe('points', () => {
  it('scores each tier', () => {
    expect(computeMealPoints('vegan', false, null)).toBe(10)
    expect(computeMealPoints('vegetarian', false, null)).toBe(8)
    expect(computeMealPoints('beef', false, null)).toBe(0)
  })

  it('adds a flat photo bonus', () => {
    expect(computeMealPoints('vegan', true, null)).toBe(11)
    expect(computeMealPoints('beef', true, null)).toBe(1)
  })

  it('multiplies tier base only, not the photo bonus', () => {
    // vegan quest 2x + photo => 20 + 1 = 21 (NOT (10+1)*2)
    expect(computeMealPoints('vegan', true, quest('vegan'))).toBe(21)
  })

  it('quest only applies to the matching tier', () => {
    expect(computeMealPoints('chicken', false, quest('vegan'))).toBe(TIER_POINTS.chicken)
  })

  it('null-tier quest applies to any plant-based meal', () => {
    expect(computeMealPoints('vegan', false, quest(null))).toBe(20)
    expect(computeMealPoints('vegetarian', false, quest(null))).toBe(16)
    expect(computeMealPoints('fish', false, quest(null))).toBe(5)
  })
})

describe('impact', () => {
  it('beef saves nothing', () => {
    expect(co2SavedKg('beef')).toBe(0)
  })
  it('vegan saves the most', () => {
    expect(co2SavedKg('vegan')).toBeGreaterThan(co2SavedKg('vegetarian'))
  })
  it('equivalence ratios match the previous app calibration', () => {
    const eq = impactEquivalents(296)
    expect(eq.miles).toBe(Math.round(296 * MILES_PER_KG))
    expect(eq.trees).toBe(Math.round(296 * TREES_PER_KG))
    expect(eq.showers).toBe(Math.round(296 * SHOWERS_PER_KG))
    // Sanity vs the reference numbers (739 / 13 / 11,828).
    expect(eq.miles).toBe(740)
    expect(eq.trees).toBe(13)
    expect(eq.showers).toBe(11828)
  })
})

describe('streak', () => {
  const base = { current: 2, best: 2, lastDate: '2026-06-30' }
  it('advances on the next day', () => {
    const r = applyLog(base, '2026-07-01', 5)
    expect(r.current).toBe(3)
    expect(r.advanced).toBe(true)
  })
  it('does not change on the same day', () => {
    const r = applyLog(base, '2026-06-30', 5)
    expect(r.current).toBe(2)
    expect(r.advanced).toBe(false)
  })
  it('resets after a gap', () => {
    const r = applyLog(base, '2026-07-03', 5)
    expect(r.current).toBe(1)
  })
  it('flags hitting the goal', () => {
    const r = applyLog({ current: 4, best: 4, lastDate: '2026-06-30' }, '2026-07-01', 5)
    expect(r.hitGoal).toBe(true)
  })
})
