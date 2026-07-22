/**
 * Names for the shuffle button on onboarding step 10.
 * Deliberately no meat puns (no Sir Loin / Brisket) — the cow is the user's friend,
 * so butchery jokes cut against the whole premise. design.md §2.
 */
export const COW_NAMES = [
  // Straight-faced human names, which is the joke
  'Gerald',
  'Kevin',
  'Brenda',
  'Susan',
  'Barbara',
  'Linda',
  'Dave',
  'Janet',
  // Punny
  'Moorena',
  'Cowleb',
  'Cowvin',
  'Moolan',
  'Moonica',
  'Moolissa',
  'Moorgan',
  'Cowsandra',
  'Mootilda',
  'Mooriah',
  'Cownthia',
  'Moodonna',
] as const

/** A random name, never repeating the one already showing. */
export function randomCowName(exclude?: string): string {
  const pool = exclude ? COW_NAMES.filter((n) => n !== exclude) : COW_NAMES
  return pool[Math.floor(Math.random() * pool.length)]
}

/** The cow's name, falling back to the mascot name when unnamed. */
export function cowNameOr(cowName: string | null | undefined): string {
  return cowName?.trim() || 'Moo'
}
