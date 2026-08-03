import type { Meal } from './types'
import { toCohortDate } from './dates'

/**
 * The home-screen landscape.
 *
 * One element unlocks per DAY the user logged food (back-dated logs count), in
 * the order below — matching the day-release reference. Day 1 is the base scene
 * (grass + cow), so the first unlockable arrives on day 2.
 */

export type SceneItemId = 'mountain' | 'tree' | 'windmill' | 'barn' | 'flowers' | 'chicken'

export interface SceneItemDef {
  id: SceneItemId
  name: string
  /** Natural size on the SCENE_W x SCENE_H canvas. */
  w: number
  h: number
  /** Where it lands the first time it's placed (fractions of the canvas). */
  x: number
  y: number
  /** Flowers are one wide strip and never move. */
  fixed?: boolean
}

/**
 * Design canvas. Everything is positioned as a fraction of this.
 *
 * Sizes and positions below were measured off `References/home screen ref.png`.
 * That mock is 1144px wide with the phone column spanning ~855px, so a ref pixel
 * converts to a scene fraction as (px - 145) / 855. Each item's height comes
 * from its artwork's own aspect ratio rather than a second measurement, so
 * nothing is ever stretched.
 */
export const SCENE_W = 390
export const SCENE_H = 214
/** Horizon: fraction of scene height where the grass band starts. */
export const GROUND = 0.755

/**
 * Paint order, back to front — fixed regardless of where the user drags things:
 *   mountain, tree, windmill, barn, grass-lower, cow, grass-upper, flowers, chicken
 * Sun (back-most) and clouds sit behind everything.
 */
export const LAYER_ORDER: SceneItemId[] = ['mountain', 'tree', 'windmill', 'barn', 'flowers', 'chicken']
/** Items painted behind the cow (everything up to grass-lower). */
export const BEHIND_COW: SceneItemId[] = ['mountain', 'tree', 'windmill', 'barn']
/** Items painted in front of the cow (after grass-upper). */
export const FRONT_OF_COW: SceneItemId[] = ['flowers', 'chicken']

/**
 * Unlock order, day 2 onward. w/h are in SCENE_W-space and keep each asset's
 * native aspect ratio:
 *   flowers 795x179 · tree 189x213 · barn 109x107 · windmill 171 wide ·
 *   chicken (square frames) · mountain 769x215
 */
export const SCENE_ITEMS: SceneItemDef[] = [
  // Values tuned live in the adjust panel and baked in from the approved
  // screenshots (2026-08-08). y is fixed per design; users may only move x.
  { id: 'flowers', name: 'Flowers', w: 390, h: 83, x: 0, y: 0.63, fixed: true },
  { id: 'tree', name: 'Tree', w: 84, h: 95, x: 0.72, y: 0.34 },
  { id: 'barn', name: 'Barn', w: 39, h: 38, x: 0.13, y: 0.61 },
  { id: 'windmill', name: 'Windmill', w: 75, h: 102, x: 0.15, y: 0.32 },
  // Chicken frames are now tight-cropped squares, so the box is the bird.
  { id: 'chicken', name: 'Chicken', w: 44, h: 44, x: 0.168, y: 0.725 },
  // Backdrop, sized per the reference mock: ~2/3 of the scene wide, inset from
  // both page edges, base hidden behind the grass. 74 = 263 x 215/769 keeps
  // the art's aspect. y puts its base on the windmill's ground line
  // (0.32 + 102/214 ≈ 0.45 + 74/214).
  { id: 'mountain', name: 'Mountain', w: 263, h: 74, x: 0.282, y: 0.45, fixed: true },
]

export const itemDef = (id: SceneItemId): SceneItemDef =>
  SCENE_ITEMS.find((i) => i.id === id) ?? SCENE_ITEMS[0]

/** Distinct cohort dates with at least one logged meal. */
export function loggedDays(meals: Meal[]): string[] {
  return [...new Set(meals.map((m) => m.mealDate))].sort()
}

/**
 * Which day of the challenge the user is on (1-based), counting only days they
 * logged. Day 1 unlocks nothing — the base scene is the reward for starting.
 */
export function challengeDayCount(meals: Meal[], today: string = toCohortDate()): number {
  return loggedDays(meals).filter((d) => d <= today).length
}

/** Items unlocked so far: one per logged day beyond the first. */
export function unlockedItems(meals: Meal[]): SceneItemDef[] {
  const days = challengeDayCount(meals)
  return SCENE_ITEMS.slice(0, Math.max(0, Math.min(SCENE_ITEMS.length, days - 1)))
}

export function lockedItems(meals: Meal[]): SceneItemDef[] {
  return SCENE_ITEMS.slice(unlockedItems(meals).length)
}

/** The item earned on the most recent logged day, if any. */
export function latestUnlock(meals: Meal[]): SceneItemDef | null {
  const u = unlockedItems(meals)
  return u.length ? u[u.length - 1] : null
}

// ---------------------------------------------------------------------------
// Placement persistence (local-only for now, like the rest of the prototype).
// ---------------------------------------------------------------------------

export interface Placement {
  item: SceneItemId
  /** Top-left as fractions of the canvas. */
  x: number
  y: number
}

const LS_KEY = 'moo.scene.v1'

export function loadPlacements(): Placement[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    const placements = raw ? (JSON.parse(raw) as Placement[]) : []
    // The chicken's designed spot moved 20px left (0.219 → 0.168); nudge saved
    // placements still sitting at the old default so the change actually shows.
    return placements.map((p) =>
      p.item === 'chicken' && Math.abs(p.x - 0.219) < 0.001 ? { ...p, x: 0.168 } : p,
    )
  } catch {
    return []
  }
}

export function savePlacements(p: Placement[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(p))
}

export function clamp01(v: number, size: number): number {
  return Math.max(0, Math.min(1 - size, v))
}

// ---------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------

export type CowPose = 'standing' | 'pacing' | 'sleeping'

/** Moo sleeps from 11pm to 6am; otherwise she alternates standing and pacing. */
export function cowPose(hour: number): CowPose {
  if (hour >= 23 || hour < 6) return 'sleeping'
  return 'standing'
}

/**
 * Cow art sizes, in SCENE_W-space.
 *
 * The standing/pacing frames share a 360x260 canvas holding a 307x203 cow; the
 * sleeping frame is a trimmed 675x310. Sizing by the CANVAS makes the sleeping
 * pose look enormous, so both are expressed as the width the COW BODY should
 * occupy and converted back to an image width here.
 */
export const COW_BODY_W = 144
export const COW_STANDING_IMG_W = COW_BODY_W * (360 / 307)
export const COW_SLEEPING_IMG_W = COW_BODY_W * 1.18 * 0.9
/** Sleeping pose sits higher so the grass doesn't swallow her. */
export const COW_SLEEPING_LIFT = 16 // tuned by eye: 32 floated, 0 sank into the grass
/** Grass geometry, baked from the approved adjust-panel values. */
export const GRASS_SCALE = 1.32
export const GRASS_GAP = 1.0
export const GRASS_DROP = 0.34
export const COW_BOTTOM = 0.22
/** Cow's horizontal centre, as a fraction of scene width (from the reference). */
export const COW_CENTER_X = 0.55

export const isNight = (hour: number) => hour >= 23 || hour < 6

/**
 * Sun position along its arc, 0 at sunrise (left) to 1 at sunset (right).
 * Returns null when the sun is down.
 */
export function sunProgress(hour: number, minute = 0): number | null {
  const SUNRISE = 6
  const SUNSET = 20
  const t = hour + minute / 60
  if (t < SUNRISE || t > SUNSET) return null
  return (t - SUNRISE) / (SUNSET - SUNRISE)
}

