import type { MealTier } from './types'

// design.md §9 — motivational CO2 estimate, NOT an audited LCA.
// Keep all constants here so the numbers are trivially recalibratable.

// Per-meal footprint (kg CO2e).
export const MEAL_FOOTPRINT_KG: Record<MealTier, number> = {
  beef: 6.6,
  pork: 1.7,
  fish: 1.5,
  chicken: 1.3,
  vegetarian: 0.9,
  vegan: 0.4,
}

// Baseline omnivore meal we compare against.
export const BASELINE_KG = 2.9

/** kg CO2e saved vs the baseline meal. Beef -> 0 (mirrors 0 points). */
export function co2SavedKg(tier: MealTier): number {
  return Math.max(0, BASELINE_KG - MEAL_FOOTPRINT_KG[tier])
}

// Equivalence ratios, calibrated to the previous app: 296 kg ~= 739 mi ~= 13 trees ~= 11,828 showers.
export const MILES_PER_KG = 2.5
export const TREES_PER_KG = 0.0439
export const SHOWERS_PER_KG = 39.96

export function milesEq(kg: number): number {
  return Math.round(kg * MILES_PER_KG)
}
export function treesEq(kg: number): number {
  return Math.round(kg * TREES_PER_KG)
}
export function showersEq(kg: number): number {
  return Math.round(kg * SHOWERS_PER_KG)
}

export interface ImpactEquivalents {
  kg: number
  miles: number
  trees: number
  showers: number
}

export function impactEquivalents(kg: number): ImpactEquivalents {
  return { kg: Math.round(kg), miles: milesEq(kg), trees: treesEq(kg), showers: showersEq(kg) }
}

const KG_TO_LBS = 2.20462

// Onboarding "Your Starting Impact" — estimate weekly food CO2 from survey answers.
// Rough model: 21 meals/week, meaty fraction set by how often you eat plant-based.
const MEATY_FRACTION: Record<string, number> = {
  never: 0.85,
  rarely: 0.7,
  sometimes: 0.5,
  often: 0.3,
  mostly: 0.1,
}

export interface StartingImpact {
  weeklyKg: number
  weeklyLbs: number
  /** % reduction from swapping 3 meaty meals to vegan this week. */
  swap3ReductionPct: number
}

/**
 * Baseline for the onboarding comparison chart. The average American eats plant-based
 * meals 'rarely', so we run them through the SAME model as the user — comparing our
 * estimate against an external per-capita stat would not be apples-to-apples.
 */
export const US_AVERAGE_PLANT_FREQUENCY = 'rarely'
export function usAverageImpact(): StartingImpact {
  return startingImpact(US_AVERAGE_PLANT_FREQUENCY)
}

// Onboarding starting-impact chart: group the survey proteins into emission
// buckets (kg CO2e per typical serving) so we can rank what drives someone's
// footprint. Same motivational spirit as MEAL_FOOTPRINT_KG, not an audited LCA.
export interface ProteinImpact {
  label: string
  footprintKg: number
  /** Survey protein names (from onboarding) that fall in this bucket. */
  members: string[]
}

export const PROTEIN_IMPACTS: ProteinImpact[] = [
  { label: 'Beef', footprintKg: 6.6, members: ['Beef'] },
  { label: 'Pork', footprintKg: 1.7, members: ['Pork'] },
  { label: 'Fish', footprintKg: 1.5, members: ['Fish'] },
  { label: 'Chicken', footprintKg: 1.3, members: ['Chicken'] },
  { label: 'Dairy & eggs', footprintKg: 0.9, members: ['Eggs', 'Dairy'] },
  { label: 'Plant-based', footprintKg: 0.4, members: ['Tofu', 'Beans', 'Lentils', 'Nuts'] },
]

/** Meat buckets — the ones a "replace 3 meals" nudge makes sense for. */
export const MEAT_PROTEIN_LABELS = new Set(['Beef', 'Pork', 'Fish', 'Chicken'])

/** The buckets a user actually eats, highest-impact first (for the chart). */
export function proteinImpactChart(proteins: string[]): ProteinImpact[] {
  return PROTEIN_IMPACTS.filter((b) => b.members.some((m) => proteins.includes(m))).sort(
    (a, b) => b.footprintKg - a.footprintKg,
  )
}

export function startingImpact(plantFrequency: string): StartingImpact {
  const mealsPerWeek = 21
  const meaty = MEATY_FRACTION[plantFrequency] ?? 0.5
  const meatyMeals = mealsPerWeek * meaty
  const plantMeals = mealsPerWeek - meatyMeals
  // Assume meaty meals average chicken/pork/beef mix; plant meals ~ vegetarian.
  const avgMeatyFootprint = (MEAL_FOOTPRINT_KG.beef + MEAL_FOOTPRINT_KG.pork + MEAL_FOOTPRINT_KG.chicken) / 3
  const weeklyKg = meatyMeals * avgMeatyFootprint + plantMeals * MEAL_FOOTPRINT_KG.vegetarian
  const swaps = Math.min(3, meatyMeals)
  const saved = swaps * (avgMeatyFootprint - MEAL_FOOTPRINT_KG.vegan)
  const swap3ReductionPct = weeklyKg > 0 ? Math.round((saved / weeklyKg) * 100) : 0
  return { weeklyKg, weeklyLbs: Math.round(weeklyKg * KG_TO_LBS), swap3ReductionPct }
}
