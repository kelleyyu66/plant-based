/**
 * The 20 critters a user can pick as their avatar ("anim-tar").
 *
 * Art lives in /public/critters/NN.png, exported from assets/Onboarding/critters
 * and trimmed + padded to a square so every avatar is optically centred inside a
 * circular crop.
 *
 * NOTE: names were re-derived by looking at the artwork. The previous list was
 * inherited from a different sprite sheet and was wrong from index 10 onward
 * (it listed Cow/Piggy/Red Panda/Hippo/Squirrel/Lion/Capybara/Giraffe against
 * Deer/Sheep/Penguin/Red Panda/…). Index order here matches the files exactly.
 */
export const ANIMALS = [
  'Bear', 'Bunny', 'Dog', 'Mouse', 'Monkey',
  'Pig', 'Elephant', 'Fox', 'Sloth', 'Panda',
  'Deer', 'Sheep', 'Penguin', 'Red Panda', 'Hippo',
  'Squirrel', 'Lion', 'Capybara', 'Giraffe', 'Duck',
] as const

export type AnimalIndex = number
export const animalName = (i: number) => ANIMALS[i] ?? 'Critter'
export const AVATAR_COUNT = ANIMALS.length

/** Path to a critter's artwork. Falls back to the first critter if out of range. */
export function critterSrc(i: number): string {
  const idx = i >= 0 && i < AVATAR_COUNT ? i : 0
  return `/critters/${String(idx).padStart(2, '0')}.png`
}
