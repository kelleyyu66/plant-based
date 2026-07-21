export type MealTier = 'vegan' | 'vegetarian' | 'fish' | 'chicken' | 'pork' | 'beef'
export type MealTime = 'breakfast' | 'lunch' | 'dinner'
export type StartingDiet = 'vegetarian' | 'meat_or_flexitarian'
export type SpriteVariant = 'regular' | 'hat' | 'balloon'

export const MEAL_TIERS: MealTier[] = ['vegan', 'vegetarian', 'fish', 'chicken', 'pork', 'beef']
export const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner']

export const TIER_LABEL: Record<MealTier, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  fish: 'Fish',
  chicken: 'Chicken',
  pork: 'Pork',
  beef: 'Beef',
}

export const TIME_LABEL: Record<MealTime, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

export interface Team {
  id: string
  name: string
  captainName: string
  slug: string
  capacity: number
  color: string
  sort: number
}

export interface OnboardingAnswers {
  plantFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'mostly'
  proteins: string[]
  climateFamiliarity: 'new' | 'somewhat' | 'very'
}

export interface Profile {
  id: string
  displayName: string
  avatarIndex: number
  teamId: string | null
  startingDiet: StartingDiet
  onboarding: OnboardingAnswers | null
  streakGoal: 3 | 5 | 7
  streakCurrent: number
  streakBest: number
  lastLoggedDate: string | null
  createdAt: string
}

export interface Meal {
  id: string
  userId: string
  tier: MealTier
  mealTime: MealTime
  mealDate: string // YYYY-MM-DD
  photoUrl: string | null
  caption: string | null
  points: number
  co2SavedKg: number
  createdAt: string
}

export interface Comment {
  id: string
  mealId: string
  userId: string
  body: string
  createdAt: string
}

export interface Reaction {
  id: string
  mealId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface DailyFact {
  dayIndex: number
  body: string
  sourceUrl: string | null
}

export interface DailyQuest {
  dayIndex: number
  title: string
  tier: MealTier | null // null = any plant-based meal
  multiplier: number
  description: string
}

export interface Accessory {
  id: string
  sort: number
  name: string
  thresholdPoints: number
  spriteVariant: SpriteVariant
  description: string
}

export interface LeaderboardEntry {
  profile: Profile
  points: number
  meals: number
}

export interface TeamStanding {
  team: Team
  points: number
  members: number
}
