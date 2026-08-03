import type { Meal } from './types'
import { toCohortDate } from './dates'

/**
 * Pasture decoration.
 *
 * Rule: one item unlocks per DAY the user logged food — not per meal. Back-dated
 * logs count, so logging up to LATE_GRACE_DAYS late still earns that day's item.
 * Food logs are the single source of truth here, exactly like daily quests.
 */

export const LATE_GRACE_DAYS = 2

export type PastureItemId =
  | 'tree' | 'flowers' | 'pond' | 'windmill' | 'barn'
  | 'rainbow' | 'chicken' | 'duck' | 'bird' | 'haystack'

export interface PastureItemDef {
  id: PastureItemId
  name: string
  /** Natural on-canvas size in px (canvas is PASTURE_W x PASTURE_H). */
  w: number
  h: number
}

/** Unlock order — earlier items are simpler, later ones are the "big" rewards. */
export const PASTURE_ITEMS: PastureItemDef[] = [
  { id: 'tree', name: 'Tree', w: 62, h: 78 },
  { id: 'flowers', name: 'Flowers', w: 44, h: 34 },
  { id: 'chicken', name: 'Chicken', w: 38, h: 38 },
  { id: 'pond', name: 'Pond', w: 92, h: 52 },
  { id: 'duck', name: 'Duck', w: 38, h: 38 },
  { id: 'haystack', name: 'Haystack', w: 52, h: 44 },
  { id: 'bird', name: 'Bird', w: 34, h: 28 },
  { id: 'windmill', name: 'Windmill', w: 60, h: 96 },
  { id: 'barn', name: 'Barn', w: 96, h: 74 },
  { id: 'rainbow', name: 'Rainbow', w: 116, h: 62 },
]

export const PASTURE_W = 382
export const PASTURE_H = 210
/** Fraction of the canvas height taken by the grass band. */
export const GRASS_TOP = 0.52

/**
 * A placed decoration. x/y are FRACTIONS of the canvas (0–1) of the item's
 * top-left, so a pasture arranged on a small phone looks the same on a big one.
 */
export interface Placement {
  /** Unique per placed instance (an item can be unlocked more than once). */
  key: string
  item: PastureItemId
  x: number
  y: number
}

/** Distinct cohort dates the user logged at least one meal on. */
export function loggedDays(meals: Meal[]): string[] {
  return [...new Set(meals.map((m) => m.mealDate))].sort()
}

/**
 * How many items are unlocked. One per logged day, counting back-dated logs —
 * a day logged up to LATE_GRACE_DAYS late still counts, which is why we key off
 * `mealDate` (the day the food was eaten) rather than `createdAt`.
 */
export function unlockedCount(meals: Meal[], today: string = toCohortDate()): number {
  return loggedDays(meals).filter((d) => d <= today).length
}

/** The catalog entries unlocked so far, cycling once every item has been earned. */
export function unlockedItems(count: number): PastureItemDef[] {
  return Array.from({ length: count }, (_, i) => PASTURE_ITEMS[i % PASTURE_ITEMS.length])
}

/** One earned copy of an item. `key` ties it to a Placement. */
export interface UnlockedInstance {
  key: string
  index: number
  def: PastureItemDef
}

/** Everything earned, newest first — this is the inventory shown in the tray. */
export function unlockedInstances(count: number): UnlockedInstance[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `${PASTURE_ITEMS[i % PASTURE_ITEMS.length].id}-${i}`,
    index: i,
    def: PASTURE_ITEMS[i % PASTURE_ITEMS.length],
  })).reverse()
}

/** Catalog entries not yet earned, shown greyed-out under the unlocked ones. */
export function lockedItems(count: number): PastureItemDef[] {
  return count >= PASTURE_ITEMS.length ? [] : PASTURE_ITEMS.slice(count)
}

/** How many more days of logging until `def` unlocks (1-based). */
export function daysUntil(def: PastureItemDef, count: number): number {
  return Math.max(1, PASTURE_ITEMS.findIndex((i) => i.id === def.id) + 1 - count)
}

/** The item earned at 1-based day `n` (used for the "new unlock" notification). */
export function itemForDay(n: number): PastureItemDef | null {
  if (n < 1) return null
  return PASTURE_ITEMS[(n - 1) % PASTURE_ITEMS.length]
}

export const itemDef = (id: PastureItemId): PastureItemDef =>
  PASTURE_ITEMS.find((i) => i.id === id) ?? PASTURE_ITEMS[0]

// ---------------------------------------------------------------------------
// Persistence. Local-only for now: the mock backend has no pasture table and the
// Supabase schema hasn't been migrated, so placements live in localStorage.
// ---------------------------------------------------------------------------

const LS_KEY = 'moo.pasture.v1'

export function loadPlacements(): Placement[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Placement[]) : []
  } catch {
    return []
  }
}

export function savePlacements(p: Placement[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(p))
}

/**
 * Scatter newly-unlocked items across the grass so the pasture never looks
 * empty. Deterministic (no Math.random) so re-renders don't make things jump —
 * and everything lands standing ON the grass band, not floating above it.
 */
export function defaultPlacement(index: number, def: PastureItemDef): Placement {
  const cols = 3
  const col = index % cols
  const row = Math.floor(index / cols)

  // Spread across the width, nudged per-row so rows don't line up in a grid.
  const x = 0.06 + (col / cols) * 0.78 + ((row % 2) * 0.07)
  // Stand items on the grass: their base sits between just under the horizon
  // and the bottom edge, cycling so later rows sit lower (i.e. "nearer").
  const bandTop = GRASS_TOP + 0.04
  const bandBottom = 1 - def.h / PASTURE_H - 0.03
  const y = bandTop + ((row % 3) / 3) * Math.max(0, bandBottom - bandTop)

  return {
    key: `${def.id}-${index}`,
    item: def.id,
    x: clamp01(x, def.w / PASTURE_W),
    y: clamp01(y, def.h / PASTURE_H),
  }
}

/** Keep a fractional position inside the canvas given the item's own size. */
export function clamp01(v: number, sizeFraction: number): number {
  return Math.max(0, Math.min(1 - sizeFraction, v))
}
