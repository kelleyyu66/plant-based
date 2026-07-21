// Maps avatar sprite index (0–19) to a display name, matching the 5x4 sheet order.
// Order verified against Assets/characters_regular.png (row-major).
export const ANIMALS = [
  'Bear', 'Bunny', 'Hedgehog', 'Mouse', 'Monkey',
  'Pig', 'Koala', 'Fox', 'Sloth', 'Panda',
  'Cow', 'Sheep', 'Penguin', 'Piggy', 'Red Panda',
  'Hippo', 'Squirrel', 'Lion', 'Capybara', 'Giraffe',
] as const

export type AnimalIndex = number
export const animalName = (i: number) => ANIMALS[i] ?? 'Critter'
export const AVATAR_COUNT = ANIMALS.length
