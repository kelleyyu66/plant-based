/**
 * What the cow says.
 *
 * Deliberately a fixed template set with at most one variable each — no AI, no
 * backend, nothing to moderate. Pick a line with `cowMessage()` and render it in
 * the speech bubble on Home.
 *
 * Variants exist so the same trigger doesn't read identically every time; the
 * choice is derived from the day + trigger (not random), so it stays stable
 * within a session instead of flickering on re-render.
 */

export type CowTrigger =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'late_no_dinner'
  | 'meal_logged'
  | 'quest_done'
  | 'item_unlocked'
  | 'all_done'

export interface CowMessageVars {
  /** Points from the meal just logged. */
  points?: number
  /** Name of a newly unlocked pasture item. */
  item?: string
  /** The user's first name. */
  name?: string
}

const TEMPLATES: Record<CowTrigger, string[]> = {
  morning: [
    'Good morning! What’s for breakfast?',
    'Morning! Let’s make today a green one.',
    'Rise and shine. Your pasture missed you.',
  ],
  afternoon: [
    'Good afternoon! Hope you’re having a nutritious day.',
    'Afternoon! Lunch logged yet?',
    'Hey there. Halfway through the day — how’s the plate looking?',
  ],
  evening: [
    'Evening! How did today’s meals go?',
    'Good evening. Don’t forget to log dinner.',
    'Winding down? Log what you ate today.',
  ],
  late_no_dinner: [
    'It’s past dinner time. Have you eaten yet? Log your meal.',
    'Late one tonight! If you’ve had dinner, log it before bed.',
    'Psst — dinner’s still unlogged. Quick, before midnight.',
  ],
  meal_logged: [
    'Wow, you got {points} points with that meal!',
    'Nice one — {points} points banked.',
    'That’s {points} points. The herd approves.',
  ],
  quest_done: [
    'Quest complete! Look at you go.',
    'That’s another quest done. Very moo-ving.',
    'Quest cleared — nicely done.',
  ],
  item_unlocked: [
    'You unlocked a {item}! Go put it in your pasture.',
    'A new {item} for the pasture. Where should it go?',
    'Fresh {item} unlocked — your field’s filling up.',
  ],
  all_done: [
    'All three meals logged. That’s a perfect day.',
    'Three for three today. Outstanding.',
    'Everything logged — go enjoy your evening.',
  ],
}

/** Time-of-day trigger for the plain greeting. */
export function greetingTrigger(hour: number, dinnerLogged: boolean): CowTrigger {
  if (hour >= 22 && !dinnerLogged) return 'late_no_dinner'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/** Fill a template. `seed` keeps the variant stable (pass the day of the month). */
export function cowMessage(trigger: CowTrigger, vars: CowMessageVars = {}, seed = 0): string {
  const options = TEMPLATES[trigger]
  const line = options[Math.abs(seed) % options.length]
  return line
    .replace('{points}', String(vars.points ?? 0))
    .replace('{item}', vars.item ?? 'something')
    .replace('{name}', vars.name ?? 'friend')
}
